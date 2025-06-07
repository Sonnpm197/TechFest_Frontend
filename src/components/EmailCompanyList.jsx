import React, {useState} from 'react';
import axios from 'axios';

// Helper to decode base64 to UTF-8
function decodeHTML(html) {
	const txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
}

// Sample company names and statuses for demo
const sampleCompanies = [
	{name: 'Apple Inc.', status: 'Active'},
	{name: 'Google LLC', status: 'Pending'},
	{name: 'Microsoft Corp.', status: 'Inactive'},
	{name: 'Amazon.com', status: 'Active'},
	{name: 'Tesla, Inc.', status: 'Active'},
];

const EmailCompanyList = () => {
	const [count, setCount] = useState(5);
	const [emails, setEmails] = useState([]);
	const [loading, setLoading] = useState(false);
	const [expandedId, setExpandedId] = useState(null);
	const [error, setError] = useState('');

	const fetchEmails = async () => {
		setLoading(true);
		setError('');
		setExpandedId(null);
		try {
			const res = await axios.get(
				`${process.env.REACT_APP_BACKEND_URL}/gmail/emails?maxResults=${count}`,
				{withCredentials: true}
			);
			setEmails(res.data);
			console.log(res.data);
		} catch (err) {
			setError(err.response?.data?.error || 'Failed to fetch emails');
		}
		setLoading(false);
	};

	// Use sample companies for company name/status, fallback to generic if not enough
	const getCompany = idx =>
		sampleCompanies[idx % sampleCompanies.length] || {
			name: `Company ${idx + 1}`,
			status: 'Unknown',
		};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 mx-8 flex flex-col items-center">
			<div className="w-full bg-white rounded-3xl shadow-2xl p-10">
				<h1 className="text-4xl font-semibold text-gray-900 mb-8 text-center tracking-tight">Company Email
					List</h1>
				<div className="flex items-center justify-center mb-10 gap-4">
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
						onClick={fetchEmails}
						className="px-6 py-2 bg-black text-white rounded-lg font-medium text-lg shadow hover:bg-gray-800 transition"
					>
						Fetch
					</button>
				</div>
				{loading && <div className="text-center text-gray-500 mb-4">Loading...</div>}
				{error && <div className="text-center text-red-500 mb-4">{error}</div>}
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white rounded-xl">
						<thead>
						<tr>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company
								Name
							</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
							<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
						</thead>
						<tbody>
						{emails.map((email, idx) => {
							const company = getCompany(idx);
							return (
								<React.Fragment key={email.id}>
									<tr
										className={`hover:bg-gray-50 transition cursor-pointer ${expandedId === email.id ? 'bg-gray-100' : ''}`}
										onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}>
										<td className="px-6 py-4 text-gray-500">{email.id}</td>
										<td className="px-6 py-4">
                                            <span className="text-lg text-gray-800 font-medium">
                                              {company.name}
                                            </span>
										</td>
										<td className="px-6 py-4">
                                            <span className={`text-lg font-medium ${
                                                company.status === 'Active'
                                                    ? 'text-green-600'
                                                    : company.status === 'Pending'
                                                        ? 'text-yellow-600'
                                                        : 'text-gray-500'
                                            }`}>
                                              {company.status}
                                            </span>
										</td>
										<td className="px-6 py-4 flex gap-2">
											<button
												className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300 transition"
												onClick={e => {
													e.stopPropagation();
													alert('Edit feature coming soon!');
												}}
											>
												Edit
											</button>
											<button
												className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
												onClick={e => {
													e.stopPropagation();
													alert('Delete feature coming soon!');
												}}
											>
												Delete
											</button>
										</td>
									</tr>
									{expandedId === email.id && (
										<tr>
											<td colSpan={4} className="bg-gray-50 px-8 py-6 border-t border-gray-200">
												<div>
													<div className="mb-2 text-gray-700 font-semibold">From:</div>
													<div
														className="mb-4 whitespace-pre-wrap text-gray-800 text-base font-mono bg-white rounded-lg p-4 shadow-inner border border-gray-100">
														{email.from ||
															<span className="italic text-gray-400">No Sender</span>}
													</div>
													<div className="mb-2 text-gray-700 font-semibold">Subject:</div>
													<div
														className="mb-4 whitespace-pre-wrap text-gray-800 text-base font-mono bg-white rounded-lg p-4 shadow-inner border border-gray-100">
														{email.subject ||
															<span className="italic text-gray-400">No Subject</span>}
													</div>
													<div className="mb-2 text-gray-700 font-semibold">Content:</div>
													<div
														className="whitespace-pre-wrap text-gray-800 text-base font-mono bg-white rounded-lg p-4 shadow-inner border border-gray-100">
														{email.body ||
															<span className="italic text-gray-400">No content</span>}
													</div>
												</div>
											</td>
										</tr>
									)}
								</React.Fragment>
							);
						})}
						{emails.length === 0 && !loading && (
							<tr>
								<td colSpan={4} className="text-center py-8 text-gray-400 text-lg">
									No emails found.
								</td>
							</tr>
						)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default EmailCompanyList;