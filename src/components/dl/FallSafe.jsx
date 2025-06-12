import React, { useState, useRef, useEffect } from 'react';
import { io } from "socket.io-client";

const logs = [
	{ time: '10:01', event: 'Fall detected in Living Room' },
	{ time: '10:15', event: 'No fall detected' },
	{ time: '10:30', event: 'Fall detected in Kitchen' },
	{ time: '10:45', event: 'No fall detected' },
	{ time: '11:00', event: 'No fall detected' },
	{ time: '11:15', event: 'Fall detected in Bedroom' },
	{ time: '11:30', event: 'No fall detected' },
];

function FallSafe() {
	const [isWebcam, setIsWebcam] = useState(false); // open webcam state
	const [showPlay, setShowPlay] = useState(true); // play button in the middle
	const [hovered, setHovered] = useState(false); // hover to show play button
	const [processedFrame, setProcessedFrame] = useState(null); // returned frame from backend
	const [fallStatus, setFallStatus] = useState('No Fall Detected'); // fall / not fall
	const [lastChecked, setLastChecked] = useState('--:--'); // last check
	const [socket, setSocket] = useState(null); // connect to websocket

	const streamRef = useRef(null); // taken from webcam
	const mainVideoRef = useRef(null); // main video
	const sideVideoRef = useRef(null); // side video
	const canvasRef = useRef(null); // to extract images and emit
	const frameIntervalRef = useRef(null); // control interval to send to backend

	// --- Fall detection logic from old code ---
	const fallTimerRef = useRef(null);
	const fallConfirmedRef = useRef(false);
	const [fallConfirmTimeMs, setFallConfirmTimeMs] = useState(1000);

	useEffect(() => {
		const storedSeconds = localStorage.getItem('notifySeconds');
		if (storedSeconds) {
			const seconds = parseInt(storedSeconds, 10);
			if (!isNaN(seconds) && seconds > 0) {
				setFallConfirmTimeMs(seconds * 1000);
			}
		}
	}, []);

	function handleFallDetected(isFalling) {
		if (isFalling) {
			if (!fallTimerRef.current && !fallConfirmedRef.current) {
				fallTimerRef.current = setTimeout(() => {
					fallConfirmedRef.current = true;
					setFallStatus('Fall Detected');
					fallTimerRef.current = null;
				}, fallConfirmTimeMs);
			}
		} else {
			if (fallTimerRef.current) {
				clearTimeout(fallTimerRef.current);
				fallTimerRef.current = null;
			}
			if (fallConfirmedRef.current) {
				fallConfirmedRef.current = false;
				setFallStatus('No Fall Detected');
			}
		}
	}
	// --- End fall detection logic ---

	// Set video srcObject when webcam is active
	useEffect(() => {
		if (isWebcam && streamRef.current) {
			if (mainVideoRef.current) {
				mainVideoRef.current.srcObject = streamRef.current;
				mainVideoRef.current.play();
			}
			// if (sideVideoRef.current) {
			// 	sideVideoRef.current.srcObject = streamRef.current;
			// 	sideVideoRef.current.play();
			// }
		} else {
			if (mainVideoRef.current) {
				mainVideoRef.current.srcObject = null;
			}
			// if (sideVideoRef.current) {
			// 	sideVideoRef.current.srcObject = null;
			// }
		}
	}, [isWebcam]);

	// Start webcam and connect to Socket.IO
	const handlePlayPause = async () => {
		if (!isWebcam) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true });
				streamRef.current = stream;
				setIsWebcam(true);
				setShowPlay(true);
				setTimeout(() => setShowPlay(false), 1000);

				// Connect to Socket.IO
				const sock = io("ws://localhost:3001/dl/ws", {
					transports: ["websocket"],
				});

				setSocket(sock);

				sock.on("connect", () => {
					console.log("Socket.IO connected!");
				});

				// Listen for results
				sock.on("result", (data) => {
					handleFallDetected(data.fall);
					setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
					if (data.frame) {
						setProcessedFrame(`data:image/jpeg;base64,${data.frame}`);
					}
				});

			} catch (err) {
				alert('Could not access webcam: ' + err.message);
			}
		}
	};

	// Stop webcam and disconnect Socket.IO
	const handleStopWebcam = () => {
		if (mainVideoRef.current) {
			mainVideoRef.current.pause();
			mainVideoRef.current.srcObject = null;
		}
		// if (sideVideoRef.current) {
		// 	sideVideoRef.current.pause();
		// 	sideVideoRef.current.srcObject = null;
		// }
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}
		setIsWebcam(false);
		setShowPlay(true);

		if (socket) {
			socket.disconnect();
			setSocket(null);
		}
		if (frameIntervalRef.current) {
			clearInterval(frameIntervalRef.current);
			frameIntervalRef.current = null;
		}
		setProcessedFrame(null);
		setFallStatus('No Fall Detected');
	};

	// Only send frames from mainVideoRef
	const handleVideoReady = () => {
		if (socket) {
			frameIntervalRef.current = setInterval(() => {
				const video = mainVideoRef.current;
				const canvas = canvasRef.current;
				if (!video || !canvas) return;
				if (video.videoWidth === 0 || video.videoHeight === 0) return;
				const ctx = canvas.getContext('2d');
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					if (blob) {
						blob.arrayBuffer().then(buffer => {
							socket.emit('frame', new Uint8Array(buffer));
						});
					}
				}, 'image/jpeg', 0.8);
			}, 120);

			socket.on('result', (data) => {
				handleFallDetected(data.fall);
				setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
				if (data.frame) {
					setProcessedFrame(`data:image/jpeg;base64,${data.frame}`);
				}
			});
		}
	};

	useEffect(() => {
		return () => {
			handleStopWebcam();
		};
		// eslint-disable-next-line
	}, []);

	return (
		<div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
			<canvas ref={canvasRef} style={{ display: 'none' }} />
			{/* Header with Logo */}
			<header className="w-full flex items-center h-16 px-8 bg-gray-900 border-b border-gray-800">
				<span className="text-2xl font-bold tracking-tight text-white select-none" style={{fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif'}}>FallSafe</span>
			</header>
			<div className="flex flex-1">
				{/* Main content (80%) */}
				<div className="flex flex-col w-5/6 p-6 space-y-4">
					{/* Main Video */}
					<div
						className="bg-black rounded-lg shadow-lg flex-1 flex items-center justify-center relative overflow-hidden group"
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}>
						{/* Play button overlay */}
						{!isWebcam && showPlay && (
							<button
								className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 rounded-full p-4 shadow-lg focus:outline-none"
								onClick={handlePlayPause}
								style={{fontSize: 32}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor" className="w-8 h-8">
									<polygon points="6,4 20,12 6,20" fill="currentColor"/>
								</svg>
							</button>
						)}
						{/* Pause button overlay (show on hover when webcam is active) */}
						{isWebcam && hovered && (
							<button
								className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 rounded-full p-4 shadow-lg focus:outline-none"
								onClick={handleStopWebcam}
								style={{fontSize: 32}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor" className="w-8 h-8">
									<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
								</svg>
							</button>
						)}
						{/* Main video or processed frame or placeholder */}
						<div style={{position: "relative", width: "100%", height: "100%"}}>
							{/* The video is always present for frame capture */}
							<video
								ref={mainVideoRef}
								autoPlay
								muted
								controls={false}
								onLoadedMetadata={handleVideoReady}
								style={{width: "100%", height: "100%", visibility: isWebcam ? "visible" : "hidden"}}
								className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"
							/>
							{/* Show processed frame on top if available */}
							{isWebcam && processedFrame && (
								<img
									src={processedFrame}
									alt="Processed"
									className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"
									style={{zIndex: 10}}
								/>
							)}
							{/* Placeholder if webcam is not active */}
							{!isWebcam && (
								<div
									className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
									<span className="text-2xl text-gray-400 font-semibold">Main Camera</span>
								</div>
							)}
						</div>
					</div>
					{/* Logs and Status */}
					<div className="flex space-x-4 mt-4 max-h-[8rem]">
						{/* Logs */}
						<div
							className="bg-gray-800 rounded-lg p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
							<h2 className="text-lg font-semibold mb-2">Fall Logs</h2>
							<ul className="space-y-1">
								{logs.map((log, idx) => (
									<li key={idx} className="text-sm border-b border-gray-700 pb-1 last:border-b-0">
										<span className="font-mono text-yellow-400">[{log.time}]</span> {log.event}
									</li>
								))}
							</ul>
						</div>
						{/* Status */}
						<div
							className="bg-gray-800 rounded-lg p-4 w-1/3 flex flex-col justify-between">
							<h2 className="text-lg font-semibold">Status</h2>
							<div className="text-sm break-words">
								<div>
									<span className="font-semibold">Fall Status: </span>
									<span
										className={fallStatus === 'No Fall Detected' ? 'text-green-400' : 'text-red-400'}>
										{fallStatus}
								  	</span>
								</div>
								<div><span className="font-semibold">Last Checked:</span> {lastChecked}</div>
							</div>
						</div>
					</div>
				</div>
				{/* Right sidebar (20%) */}
				<div className="w-1/6 flex flex-col space-y-4 p-6 border-l border-gray-700">
					{/* Settings */}
					<div className="bg-gray-700 rounded-lg p-4 mb-4" id="settings-box">
						<h2 className="text-lg font-semibold mb-2">Settings</h2>
						<div className="space-y-2">
							<div>
								<label className="block text-sm">Sensitivity</label>
								<input type="range" min="1" max="10" defaultValue="5" className="w-full"/>
							</div>
							<div>
								<label className="block text-sm">Notification</label>
								<select className="w-full bg-gray-600 rounded p-1">
									<option>Email</option>
									<option>SMS</option>
									<option>Push</option>
								</select>
							</div>
						</div>
					</div>
					{/* Secondary Video - match height to settings box */}
					<div className="bg-black rounded-lg shadow-lg flex flex-col items-center justify-center cursor-pointer relative overflow-hidden" style={{height: '168px'}}>
						{isWebcam ? (
							<video
								ref={sideVideoRef}
								autoPlay
								muted
								controls={false}
								className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"
							/>
						) : (
							<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
								<span className="text-lg text-gray-400 font-semibold">Side Camera</span>
							</div>
						)}
					</div>
					{/* Click to swap below the video */}
					<span className="text-xs text-gray-400 mt-2 text-center">Click to swap</span>
				</div>
			</div>
		</div>
	);
}

export default FallSafe;