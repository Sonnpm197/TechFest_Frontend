import React, { useState } from "react";
import FallSafeHeader from "./FallSafeHeader";

const FallSafeVideoUploader= () => {
	const [file, setFile] = useState(null);
	const [processedUrl, setProcessedUrl] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleUpload = async () => {
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		setLoading(true);
		try {
			const res = await fetch("http://localhost:3001/dl/video/upload", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			const videoPath = `${data.output_video}`.split(/[/\\]/).pop();
			console.log(videoPath);
			setProcessedUrl(`http://localhost:3001/dl/video/processed/${videoPath}`);
			console.log(processedUrl);
		} catch (err) {
			console.error("Upload failed:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
			{/* Header */}
			<FallSafeHeader/>
			<div className="flex flex-1">
				{/* Main content (80%) */}
				<div className="flex flex-col w-5/6 p-6 space-y-4">
					{/* Processed Video */}
					<div
						className="bg-black rounded-lg shadow-lg flex-1 flex items-center justify-center relative overflow-hidden group">
						{processedUrl ? (
							<video controls width="100%" className="w-full h-full object-fill rounded-lg">
								<source src={processedUrl} type="video/mp4"/>
							</video>
						) : (
							<div
								className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
								<span className="text-2xl text-gray-400 font-semibold">Processed Video</span>
							</div>
						)}
					</div>
				</div>
				{/* Sidebar (20%) */}
				<div className="w-1/6 flex flex-col space-y-4 p-6 border-l border-gray-700">
					{/* Uploader box */}
					<div className="bg-gray-700 rounded-lg p-4 mb-4">
						<h2 className="text-lg font-semibold mb-2">Upload a Video for Processing</h2>
						<label className="block">
							<span className="sr-only">Choose file</span>
							<input
								type="file"
								accept="video/*"
								onChange={(e) => setFile(e.target.files?.[0] || null)}
								className="hidden"
								id="file-upload"
							/>
							<button
								type="button"
								className="px-4 py-2 bg-blue-600 text-white rounded"
								onClick={() => document.getElementById('file-upload').click()}
							>
								Select File
							</button>
						</label>
						{file ? (
							<div className="break-words text-sm text-gray-300 mt-2">{file.name}</div>
						) : (
							<div className="break-words text-sm text-gray-500 mt-2">No file selected</div>
						)}
						<button
							className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
							onClick={handleUpload}
							disabled={!file || loading}
						>
							{loading ? "Uploading..." : "Upload & Process"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FallSafeVideoUploader;
