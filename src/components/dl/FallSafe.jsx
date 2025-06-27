import React, {useEffect, useRef, useState} from 'react';
import {io} from "socket.io-client";
import {format} from 'date-fns';
import FallSafeHeader from "./FallSafeHeader";

function FallSafe() {
	const [isPlaying, setIsPlaying] = useState(false); // open webcam state
	const [showPlay, setShowPlay] = useState(true); // play button in the middle
	const [hovered, setHovered] = useState(false); // hover to show play button
	const [processedFrame, setProcessedFrame] = useState(null); // returned frame from backend
	const [lastChecked, setLastChecked] = useState(""); // last check
	const [socket, setSocket] = useState(null); // connect to websocket
	const [isMainCamera, setIsMainCamera] = useState(true);

	const streamRef = useRef(null); // taken from webcam
	const mainVideoRef = useRef(null); // main video
	const canvasRef = useRef(null); // to extract images and emit
	const frameIntervalRef = useRef(null); // control interval to send to backend
	const rasberyStreamRef = useRef(null); // image stream ref from rasbery
	const rasberyStreamIntervalRef = useRef(null); // control rasbery interval to send to backend

	// --- Fall detection logic from old code ---
	const fallTimerRef = useRef(null);
	const standingTimerRef = useRef(null);
	const FALL_STATUS = 'Fall Detected';
	const NO_FALL_STATUS = 'No Fall Detected';
	const [fallStatus, setFallStatus] = useState(NO_FALL_STATUS); // fall / not fall

	// notification
	const [notificationDelay, setNotificationDelay] = useState(5);
	const [emergencyCallDelay, setEmergencyCallDelay] = useState(10);
	const [emergencyContact, setEmergencyContact] = useState('+61411840738');
	const [enableEmergencyCall, setEnableEmergencyCall] = useState(false);
	const [logs, setLogs] = useState([]);

	const [lastCallTime, setLastCallTime] = useState(0); // Track last emergency call time
	const lastCallTimeRef = useRef(0);
	const emergencyCallTimerRef = useRef(null); // Timer for emergency call
	const handleSwapCameras = () => setIsMainCamera((prev) => !prev);

	const makeEmergencyCall = async () => {
		const now = Date.now();
		if (now - lastCallTimeRef.current < 5 * 60 * 1000) {
			console.log("Emergency call throttled");
			return;
		}

		if (!enableEmergencyCall) {
			console.log("Emergency call is not enabled");
			return;
		}

		if (!emergencyContact) {
			console.log('Please set an emergency contact number');
			return;
		}

		// Remove all spaces from the number
		const formattedNumber = emergencyContact.replace(/\s+/g, '');
		console.log('Sending number to Twilio:', formattedNumber); // Should show +61411840738

		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/dl/phone/make-call`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					phoneNumber: formattedNumber
				})
			});

			const data = await response.json();

			if (data.success) {
				updateLogs(`Emergency call made to ${emergencyContact}`)
			}
		} catch (error) {
			console.error('Error making call:', error);
			alert('Failed to make emergency call');
		}
	};

	useEffect(() => {
		lastCallTimeRef.current = lastCallTime;
	}, [lastCallTime]);

	const handleFallDetected = (isFalling) => {
		if (isFalling) {
			if (standingTimerRef.current) {
				clearTimeout(standingTimerRef.current);
				standingTimerRef.current = null;
			}

			const notifyTime = notificationDelay ? notificationDelay * 1000 : 3000;
			if (!fallTimerRef.current) {
				fallTimerRef.current = setTimeout(() => {
					setFallStatus(FALL_STATUS);
					fallTimerRef.current = null;
					updateLogs(FALL_STATUS);
				}, notifyTime);
			}

			// Emergency call timer (NEW)
			const now = Date.now();
			if (
				enableEmergencyCall &&
				(!lastCallTimeRef.current || now - lastCallTimeRef.current > 5 * 60 * 1000) &&
				!emergencyCallTimerRef.current
			) {
				emergencyCallTimerRef.current = setTimeout(async () => {
					// Double-check throttle here too, in case of race conditions
					const callNow = Date.now();
					if (!lastCallTimeRef.current || callNow - lastCallTimeRef.current > 5 * 60 * 1000) {
						await makeEmergencyCall();
						setLastCallTime(Date.now());
						lastCallTimeRef.current = Date.now(); // update ref immediately
					}
					emergencyCallTimerRef.current = null;
				}, (emergencyCallDelay || 30) * 1000);
			}
		} else {
			// Person is standing
			if (!standingTimerRef.current) {
				standingTimerRef.current = setTimeout(() => {
					if (fallTimerRef.current) {
						clearTimeout(fallTimerRef.current);
						fallTimerRef.current = null;
					}
					if (emergencyCallTimerRef.current) {
						clearTimeout(emergencyCallTimerRef.current);
						emergencyCallTimerRef.current = null;
					}
					setFallStatus(NO_FALL_STATUS);
					standingTimerRef.current = null;
					updateLogs(NO_FALL_STATUS);
				}, 2000); // 2 seconds
			}
		}
	};

	// for rasbery sending
	useEffect(() => {
		if (isPlaying && !isMainCamera && rasberyStreamRef.current && canvasRef.current) {
			rasberyStreamIntervalRef.current = setInterval(() => {
				const img = rasberyStreamRef.current;
				const canvas = canvasRef.current;
				if (!img || !canvas) return;
				if (img.naturalWidth === 0 || img.naturalHeight === 0) return;
				const ctx = canvas.getContext('2d');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					if (blob && socket) {
						blob.arrayBuffer().then(buffer => {
							socket.emit('frame', new Uint8Array(buffer));
						});
					}
				}, 'image/jpeg', 0.5);
			}, 140); // every 120ms
		}

		if (isPlaying && isMainCamera && streamRef.current && mainVideoRef.current) {
			mainVideoRef.current.srcObject = streamRef.current;
			mainVideoRef.current.play();
		} else if (mainVideoRef.current) {
			mainVideoRef.current.srcObject = null;
		}
	}, [isPlaying, isMainCamera]);

	useEffect(() => {
		const savedLogs = localStorage.getItem('fallDetectionLogs');
		if (savedLogs) {
			try {
				setLogs(JSON.parse(savedLogs));
			} catch (error) {
				console.error('Error parsing logs from localStorage:', error);
				setLogs([]); // Set empty array if parsing fails
			}
		}
	}, []);

	const updateLogs = (event) => {
		const newLog = {
			time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
			event: event
		};
		setLogs(prevLogs => {
			const updatedLogs = [newLog, ...prevLogs];
			return updatedLogs.slice(0, 100);
		});
	}

	const saveLogs = () => {
		localStorage.setItem('fallDetectionLogs', JSON.stringify(logs));
	}

	const clearLogs = () => {
		localStorage.removeItem('fallDetectionLogs');
		setLogs([]);
	}

	// Start webcam and connect to Socket.IO
	const handlePlayCamera = async () => {
		if (!isPlaying) {
			if (isMainCamera) {
				try {
					streamRef.current = await navigator.mediaDevices.getUserMedia({video: true});
				} catch (err) {
					alert('Could not access webcam: ' + err.message);
				}
			} else {
				rasberyStreamRef.current.src = process.env.REACT_APP_RASBERY_STREAM
			}
			setIsPlaying(true);
			setShowPlay(false);
			connectWebsocket();
		}
	};

	const connectWebsocket = () => {
		const sock = io("ws://localhost:3001/dl/ws", {
			transports: ["websocket"],
		});

		setSocket(sock);

		sock.on("connect", () => {
			console.log("Socket.IO connected!");
		});

		sock.on("disconnect", (reason) => {
			console.log("Socket.IO disconnected!", reason);
		});

		sock.on("result", (data) => {
			handleFallDetected(data.fall);
			setLastChecked(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));

			if (data.frame) {
				setProcessedFrame(`data:image/jpeg;base64,${data.frame}`);
			}
		});
	}

	const disconnectWebsocket = () => {
		if (socket) {
			socket.disconnect();
			setSocket(null);
		}
	}

	// Stop webcam and disconnect Socket.IO
	const handleStopCamera = () => {
		if (mainVideoRef.current) {
			mainVideoRef.current.pause();
			mainVideoRef.current.srcObject = null;
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop());
			streamRef.current = null;
		}

		if (rasberyStreamRef.current) {
			rasberyStreamRef.current.src = null;
		}

		setIsPlaying(false);
		setShowPlay(true);

		disconnectWebsocket();

		setLastCallTime(null);
		setProcessedFrame(null);
		setFallStatus(NO_FALL_STATUS);
		clearIntervals(frameIntervalRef, fallTimerRef, standingTimerRef, emergencyCallTimerRef, rasberyStreamIntervalRef);
	};

	const clearIntervals = (...refs) => {
		refs.forEach(ref => {
			if (ref.current) {
				clearInterval(ref.current);
				clearTimeout(ref.current);
				ref.current = null;
			}
		});
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
				}, 'image/jpeg', 0.5);
			}, 120);
		}
	};

	// console.log("REACT_APP_RASBERY_STREAM", process.env.REACT_APP_RASBERY_STREAM)

	return (
		<div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
			<canvas ref={canvasRef} style={{display: 'none'}}/>
			{/* Header with Logo */}
			<FallSafeHeader/>
			<div className="flex flex-1">
				{/* Main content (80%) */}
				<div className="flex flex-col w-5/6 p-6 space-y-4">
					{/* Main Video */}
					<div
						className="bg-black rounded-lg shadow-lg flex-1 flex items-center justify-center relative overflow-hidden group"
						onMouseEnter={() => setHovered(true)}
						onMouseLeave={() => setHovered(false)}>
						{/* Play button overlay: only show if main is webcam and not active */}
						{!isPlaying && showPlay && (
							<button
								className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 rounded-full p-4 shadow-lg focus:outline-none"
								onClick={handlePlayCamera}
								style={{fontSize: 32}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor" className="w-8 h-8">
									<polygon points="6,4 20,12 6,20" fill="currentColor"/>
								</svg>
							</button>
						)}
						{/* Pause button overlay (show on hover when webcam is active) */}
						{isPlaying && hovered && (
							<button
								className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-900 rounded-full p-4 shadow-lg focus:outline-none"
								onClick={handleStopCamera}
								style={{fontSize: 32}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									 stroke="currentColor" className="w-8 h-8">
									<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
								</svg>
							</button>
						)}
						{/* Main video logic */}
						<div style={{position: "relative", width: "100%", height: "100%"}}>
							{isMainCamera ? (
								isPlaying ? (
									<>
										<video
											ref={mainVideoRef}
											autoPlay
											muted
											controls={false}
											onLoadedMetadata={handleVideoReady}
											style={{
												width: "100%",
												height: "100%",
												visibility: isPlaying ? "visible" : "hidden"
											}}
											className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"/>
										{processedFrame && (
											<img
												src={processedFrame}
												alt="Processed"
												className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"
												style={{zIndex: 10}}/>
										)}
									</>
								) : (
									<div
										className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
										<span
											className="text-2xl text-gray-400 font-semibold">Main Camera (Webcam)</span>
									</div>
								)
							) : (
								<>
									<img
										ref={rasberyStreamRef}
										// src={process.env.REACT_APP_RASBERY_STREAM}
										crossOrigin="anonymous"
										alt="Stream"
										style={{
											width: "100%",
											height: "100%",
											visibility: isPlaying ? "visible" : "hidden"
										}}
										className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"
									/>
									{processedFrame && (
										<img
											src={processedFrame}
											alt="Processed"
											className="absolute top-0 left-0 w-full h-full object-fill rounded-lg"
											style={{zIndex: 10}}/>
									)}
								</>


							)}
						</div>
					</div>
					{/* Logs and Status */}
					<div className="flex space-x-4 mt-4 max-h-[8rem]">
						{/* Logs */}
						<div
							className="bg-gray-800 rounded-lg p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
							<div className="flex justify-between mb-2">
								<h2 className="text-lg font-semibold">Activity Logs</h2>
								<div className="flex justify-between items-center">
									<button
										className="text-sm pr-2 text-gray-400 hover:text-white transition-colors duration-200"
										onClick={() => saveLogs()}>
										Save Logs
									</button>
									<button
										className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
										onClick={() => clearLogs()}>
										Clear Logs
									</button>
								</div>

							</div>

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
							className="bg-gray-800 rounded-lg p-4 w-1/3 flex flex-col justify-between text-lg break-words">
							<div>
								<span className="font-semibold">Fall Status: </span>
								<span
									className={`${fallStatus === NO_FALL_STATUS ? 'text-green-400' : 'text-red-400'} text-4xl font-bold`}>
									{fallStatus}
								</span>
							</div>
							<div><span className="font-semibold">Last Checked:</span> {lastChecked}</div>
						</div>
					</div>
				</div>
				{/* Right sidebar (20%) */}
				<div className="w-1/6 flex flex-col space-y-4 p-6 border-l border-gray-700">
					{/* Settings */}
					<div className="bg-gray-700 rounded-lg p-4 mb-4" id="settings-box">
						<h2 className="text-lg font-semibold mb-2">Settings</h2>
						<div className="space-y-4">
							<div>
								<label className="block text-sm">Notification Delay (seconds)</label>
								<input
									type="number"
									min="0"
									max="60"
									value={notificationDelay}
									onChange={(e) => setNotificationDelay(parseInt(e.target.value))}
									className="w-full bg-gray-600 rounded p-1"
									placeholder="Seconds before notification"
								/>
							</div>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="enableEmergencyCall"
									checked={enableEmergencyCall}
									onChange={(e) => setEnableEmergencyCall(e.target.checked)}
									className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-600 rounded focus:ring-blue-500"
								/>
								<label htmlFor="enableEmergencyCall" className="text-sm text-red-500">Enable Emergency
									Call</label>
							</div>
							<div>
								<label className="block text-sm">Emergency Call Delay (seconds)</label>
								<input
									type="number"
									min="0"
									max="120"
									value={emergencyCallDelay}
									onChange={(e) => setEmergencyCallDelay(parseInt(e.target.value))}
									className="w-full bg-gray-600 rounded p-1"
									placeholder="Seconds before emergency call"
									disabled={!enableEmergencyCall}
								/>
							</div>
							<div>
								<label className="block text-sm">Emergency Contact Number</label>
								<input
									type="tel"
									value={emergencyContact}
									onChange={(e) => setEmergencyContact(e.target.value)}
									className="w-full bg-gray-600 rounded p-1"
									placeholder="+1 (555) 555-5555"
									disabled={!enableEmergencyCall}
								/>
							</div>
						</div>
					</div>
					{/* Secondary Video - match height to settings box */}
					<div
						className="bg-black rounded-lg shadow-lg flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
						style={{height: '168px'}}>
						{isMainCamera ? (
							<div
								className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
								<span className="text-lg text-gray-400 font-semibold">Swap to Side Camera</span>
							</div>
						) : (
							// Side camera is webcam preview (placeholder if not active)
							<div
								className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
								<span className="text-lg text-gray-400 font-semibold">Swap to Main Camera</span>
							</div>
						)}
					</div>
					{/* Swap button below the side camera */}
					<button
						className="text-xs text-gray-400 mt-2 text-center hover:text-white transition-colors duration-200"
						onClick={handleSwapCameras}>
						Swap Cameras
					</button>
				</div>
			</div>
		</div>
	);
}

export default FallSafe;