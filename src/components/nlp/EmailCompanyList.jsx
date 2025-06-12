import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { STATUS_ENUM } from "../../utils/StatusEnum";
import {getLoginUser} from "../../services/UserService";

const EmailCompanyList = () => {
	const [count, setCount] = useState(5);
	const [emails, setEmails] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expandedId, setExpandedId] = useState(null);
	const [error, setError] = useState('');
	const [editedEmails, setEditedEmails] = useState({});
	const [deletedEmails, setDeletedEmails] = useState(new Set());
	const [focusedSelectId, setFocusedSelectId] = useState(null);

	useEffect(() => {
		const fetchDBStoredMails = async () => {
			try {
				const res = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}/gmail/stored-mails`,
					{ withCredentials: true }
				);
				setEmails(res.data);
			} catch (err) {
				setError(err.response?.data?.error || 'Failed to fetch emails');
			}
		};

		fetchDBStoredMails();
	}, []);

	const fetchGmails = async () => {
		setLoading(true);
		setError('');
		setExpandedId(null);
		try {
			const res = await axios.get(
				`${process.env.REACT_APP_BACKEND_URL}/gmail/emails?maxResults=${count}`,
				{ withCredentials: true }
			);
			setEmails(res.data);
			setEditedEmails({});
			setDeletedEmails(new Set());
		} catch (err) {
			setError(err.response?.data?.error || 'Failed to fetch emails');
		}
		setLoading(false);
	};

	const handleEdit = (id, field, value) => {
		setEditedEmails(prev => ({
			...prev,
			[id]: {
				...prev[id],
				[field]: value
			}
		}));
	};

	const handleDelete = (id) => {
		setDeletedEmails(prev => new Set(prev).add(id));
	};

	const handleUndoDelete = (id) => {
		setDeletedEmails(prev => {
			const newSet = new Set(prev);
			newSet.delete(id);
			return newSet;
		});
	};

	const handleSubmit = async () => {
		const result = emails.map(email => {
			const edited = editedEmails[email.id] || {};
			return {
				...email,
				...edited,
				deleted: deletedEmails.has(email.id)
			};
		});
		try {
			await axios.post(
				`${process.env.REACT_APP_BACKEND_URL}/gmail/submit-edits`,
				result,
				{ withCredentials: true }
			);
			alert('Submitted successfully!');
			window.location.reload(); // <-- reloads the page
		} catch (err) {
			alert('Failed to submit: ' + (err.response?.data?.error || err.message));
		}
	};

	return (
		<div className="min-h-screen mx-8 bg-white rounded-3xl shadow-2xl p-10 relative">
			<h1 className="text-4xl font-semibold text-gray-900 mb-8 text-center tracking-tight">Company Email List</h1>
			<div className="flex justify-center mb-10 gap-4">
				<input
					type="number"
					min={1}
					max={500}
					value={count}
					onChange={e => setCount(e.target.value)}
					className="w-32 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg transition"
					placeholder="Number"
				/>
				<button
					onClick={fetchGmails}
					className="px-6 py-2 bg-black text-white rounded-lg font-medium text-lg shadow hover:bg-gray-800 transition">
					Fetch
				</button>
			</div>
			{loading && <div className="text-center text-gray-500 mb-4">Loading...</div>}
			{error && <div className="text-center text-red-500 mb-4">{error}</div>}
			<div className="overflow-x-auto">
				{emails.length === 0 && !loading ? (
						<div className="flex items-center justify-center h-96 w-full">
							<span className="text-gray-400 text-lg">No emails found.</span>
						</div>
					) :
				<table className="min-w-full bg-white rounded-xl">
					<thead>
					<tr>
						<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
						<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Name</th>
						<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
						<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
						<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
					</tr>
					</thead>
					<tbody>
					{emails.map((email, idx) => {
						const isDeleted = deletedEmails.has(email.id);
						const edited = editedEmails[email.id] || {};
						return (
							<React.Fragment key={email.id}>
								<tr
									className={`hover:bg-gray-50 transition cursor-pointer ${expandedId === email.id ? 'bg-gray-100' : ''} ${isDeleted ? 'opacity-50 line-through' : ''}`}
									onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}>
									<td className="px-6 py-4 text-gray-500">{email.id}</td>
									<td className="px-6 py-4">
										{/*<input*/}
										{/*	className="text-lg text-gray-800 font-medium bg-transparent border-b border-gray-200 focus:outline-none"*/}
										{/*	value={edited.company_name ?? email.company_name}*/}
										{/*	onChange={e => handleEdit(email.id, 'company_name', e.target.value)}*/}
										{/*	disabled={isDeleted}*/}
										{/*	onClick={e => e.stopPropagation()}*/}
										{/*/>*/}

										<span className="text-lg text-gray-800 font-medium">{email.company_name}</span>
									</td>
									<td className="px-6 py-4">
										<select
											className={
												"text-lg font-medium border border-gray-300 rounded px-2 py-1 focus:outline-none " +
												(focusedSelectId === email.id
													? "" // No color when focused
													: (edited.status ?? email.status) === 3
														? "text-green-600"
														: (edited.status ?? email.status) === 2
															? "text-yellow-600" :
															(edited.status ?? email.status) === 1
																? "text-red-600"
																: "text-black")
											}
											value={edited.status ?? email.status}
											onChange={e => handleEdit(email.id, 'status', Number(e.target.value))}
											disabled={isDeleted}
											onClick={e => e.stopPropagation()}
											onFocus={() => setFocusedSelectId(email.id)}
											onBlur={() => setFocusedSelectId(null)}
										>
											{Object.entries(STATUS_ENUM).map(([statusValue, statusLabel]) => (
												<option key={statusValue} value={statusValue}>
													{statusLabel}
												</option>
											))}
										</select>
									</td>
									<td className="px-6 py-4">
										<span className="text-lg text-gray-800 font-medium">{new Date(Number(email.date)).toLocaleString()}</span>
									</td>
									<td className="px-6 py-4 flex gap-2">
										{!isDeleted ? (
											<button
												className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
												onClick={e => {
													e.stopPropagation();
													handleDelete(email.id);
												}}>
												Delete
											</button>
										) : (
											<button
												className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300 transition"
												onClick={e => {
													e.stopPropagation();
													handleUndoDelete(email.id);
												}}>
												Undo
											</button>
										)}
									</td>
								</tr>
								{expandedId === email.id && !isDeleted && (
									<tr>
										<td colSpan={4} className="bg-gray-50 px-8 py-6 border-t border-gray-200">
											<div className="mb-2 text-gray-700 font-semibold">From:</div>
											<div
												className="mb-4 whitespace-pre-wrap break-all text-gray-800 text-base font-mono bg-white rounded-lg p-4 shadow-inner border border-gray-100">
												{email.sender ||
													<span className="italic text-gray-400">No Sender</span>}
											</div>
											<div className="mb-2 text-gray-700 font-semibold">Subject:</div>
											<div
												className="mb-4 whitespace-pre-wrap break-all text-gray-800 text-base font-mono bg-white rounded-lg p-4 shadow-inner border border-gray-100">
												{email.subject || <span className="italic text-gray-400">No Subject</span>}
											</div>
											<div className="mb-2 text-gray-700 font-semibold">Content:</div>
											<div className="whitespace-pre-wrap break-all text-gray-800 text-base font-mono bg-white rounded-lg p-4 shadow-inner border border-gray-100">
												{email.body || <span className="italic text-gray-400">No content</span>}
											</div>
										</td>
									</tr>
								)}
							</React.Fragment>
						);
					})}
					</tbody>
				</table>
				}
			</div>
			{/* Submit button at bottom right */}
			<button
				className="mx-6 fixed bottom-8 right-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg text-lg font-semibold hover:bg-blue-700 transition"
				onClick={handleSubmit}>
				Save
			</button>
		</div>
	);
};

export default EmailCompanyList;