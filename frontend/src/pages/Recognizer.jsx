import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

// Uses relative path by default to utilize Vite's proxy (/api -> http://127.0.0.1:5000)
// Falls back to direct backend URL if specified
const API_URL = import.meta.env.VITE_API_URL || "";

// Standard MediaPipe 21 Hand Landmark skeletal connections
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],        // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],        // Index
    [5, 9], [9, 10], [10, 11], [11, 12],   // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
    [0, 17]                                // Palm base
];

const ASL_GUIDE_SIGNS = [
    { letter: "A", hint: "Fist, thumb beside index" },
    { letter: "B", hint: "Flat hand, thumb folded" },
    { letter: "C", hint: "Curved cup shape" },
    { letter: "D", hint: "Index up, other 3 touching thumb" },
    { letter: "E", hint: "All fingers curled down" },
    { letter: "F", hint: "Index & thumb touch (OK sign)" },
    { letter: "G", hint: "Index & thumb point sideways" },
    { letter: "H", hint: "Index & middle sideways" },
    { letter: "I", hint: "Pinky straight up" },
    { letter: "L", hint: "Index & thumb form L" },
    { letter: "O", hint: "All fingers touch thumb in O" },
    { letter: "V", hint: "Peace / V sign" },
    { letter: "W", hint: "Three middle fingers up" },
    { letter: "Y", hint: "Thumb & pinky out (hang loose)" },
];

const ISL_GUIDE_SIGNS = [
    { letter: "A", hint: "Dominant index touches non-dominant thumb" },
    { letter: "B", hint: "Both hands form circles touching (figure-8)" },
    { letter: "C", hint: "One-handed curved C cup" },
    { letter: "D", hint: "Dominant index touches circle of other hand" },
    { letter: "E", hint: "Dominant index touches non-dominant index tip" },
    { letter: "F", hint: "Dominant 2 fingers cross other 2 fingers" },
    { letter: "G", hint: "Two fists stacked vertically" },
    { letter: "H", hint: "Dominant palm rests flat across other palm" },
    { letter: "I", hint: "Dominant index touches middle fingertip" },
    { letter: "L", hint: "Dominant index vertical on other open palm" },
    { letter: "M", hint: "Dominant 3 fingers placed on other palm" },
    { letter: "N", hint: "Dominant 2 fingers placed on other palm" },
    { letter: "O", hint: "Dominant index touches ring fingertip" },
    { letter: "P", hint: "Dominant circle touches upright index" },
    { letter: "V", hint: "Dominant V fingers placed on other palm" },
    { letter: "W", hint: "Interlocked upright fingers" },
    { letter: "X", hint: "Both index fingers crossed in X" },
    { letter: "Y", hint: "Dominant index in V of other thumb/index" },
];

function Recognizer() {
    const videoRef = useRef(null);
    const hiddenCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const busyRef = useRef(false);

    const [language, setLanguage] = useState("asl");
    const [cameraOn, setCameraOn] = useState(false);
    const [mirrorCamera, setMirrorCamera] = useState(true);
    const [showGuide, setShowGuide] = useState(false);

    const [prediction, setPrediction] = useState("");
    const [confidence, setConfidence] = useState(null);
    const [handedness, setHandedness] = useState("");
    const [numHands, setNumHands] = useState(0);
    const [top3, setTop3] = useState([]);
    const [message, setMessage] = useState("Start your camera to begin.");
    const [error, setError] = useState("");

    // Draw hand skeletons and landmark nodes for 1 or 2 hands
    const drawLandmarks = useCallback((landmarks) => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        if (!landmarks || landmarks.length === 0) return;

        const drawSingleHand = (pts, handIdx) => {
            if (pts.length < 21) return;
            const isHand2 = handIdx === 1;
            const strokeColor = isHand2 ? "#a855f7" : "#06b6d4";
            const shadowColor = isHand2 ? "#a855f7" : "#06b6d4";
            const knuckleColor = isHand2 ? "#84cc16" : "#22c55e";
            const tipColor = isHand2 ? "#ec4899" : "#f97316";

            // 1. Connection lines
            ctx.save();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 10;

            for (const [i, j] of HAND_CONNECTIONS) {
                const p1 = pts[i];
                const p2 = pts[j];
                if (!p1 || !p2) continue;

                const x1 = mirrorCamera ? (1 - p1.x) * width : p1.x * width;
                const y1 = p1.y * height;
                const x2 = mirrorCamera ? (1 - p2.x) * width : p2.x * width;
                const y2 = p2.y * height;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            ctx.restore();

            // 2. 21 Landmark nodes
            pts.forEach((p, idx) => {
                const x = mirrorCamera ? (1 - p.x) * width : p.x * width;
                const y = p.y * height;
                const isFingertip = [4, 8, 12, 16, 20].includes(idx);
                const isWrist = idx === 0;

                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, isFingertip ? 7 : isWrist ? 6 : 4.5, 0, 2 * Math.PI);
                ctx.fillStyle = isFingertip ? tipColor : isWrist ? "#ec4899" : knuckleColor;
                ctx.shadowColor = isFingertip ? tipColor : knuckleColor;
                ctx.shadowBlur = 12;
                ctx.fill();

                // Inner white dot
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.restore();
            });
        };

        if (landmarks.length > 21) {
            drawSingleHand(landmarks.slice(0, 21), 0);
            drawSingleHand(landmarks.slice(21, 42), 1);
        } else {
            drawSingleHand(landmarks, 0);
        }
    }, [mirrorCamera]);

    const stopCamera = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Clear overlay
        if (overlayCanvasRef.current) {
            const ctx = overlayCanvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
        }

        busyRef.current = false;
        setCameraOn(false);
        setMessage("Camera stopped.");
    };

    const predictFrame = async () => {
        if (busyRef.current || !videoRef.current || !hiddenCanvasRef.current) {
            return;
        }

        const video = videoRef.current;
        if (video.readyState < 2 || !video.videoWidth) {
            return;
        }

        busyRef.current = true;

        try {
            const hiddenCanvas = hiddenCanvasRef.current;
            hiddenCanvas.width = video.videoWidth;
            hiddenCanvas.height = video.videoHeight;

            // Match overlay canvas dimensions
            if (overlayCanvasRef.current) {
                if (
                    overlayCanvasRef.current.width !== video.videoWidth ||
                    overlayCanvasRef.current.height !== video.videoHeight
                ) {
                    overlayCanvasRef.current.width = video.videoWidth;
                    overlayCanvasRef.current.height = video.videoHeight;
                }
            }

            const context = hiddenCanvas.getContext("2d");
            context.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

            const image = hiddenCanvas.toDataURL("image/jpeg", 0.72);

            const response = await fetch(`${API_URL}/api/predict`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language,
                    image,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Prediction request failed.");
            }

            if (result.detected) {
                setPrediction(result.prediction);
                setConfidence(result.confidence);
                setHandedness(result.handedness || "");
                setNumHands(result.num_hands || (result.landmarks?.length > 21 ? 2 : 1));
                setTop3(result.top3 || []);
                setMessage(result.message || "Sign detected");
                setError("");
            } else {
                setPrediction("");
                setConfidence(null);
                setHandedness("");
                setNumHands(0);
                setTop3([]);
                setMessage(result.message || "No hand detected.");
            }

            // Always render current landmarks (clears overlay if no hand detected)
            drawLandmarks(result.landmarks || []);
        } catch (err) {
            setError(err.message || "Unable to reach server. Check backend is running.");
            drawLandmarks([]);
        } finally {
            busyRef.current = false;
        }
    };

    const startCamera = async () => {
        try {
            setError("");
            setMessage("Requesting camera access...");

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user",
                },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraOn(true);
            setMessage("Camera active. Position hand(s) inside the frame.");

            // Run real-time predictions at ~6 FPS (~160ms interval)
            timerRef.current = setInterval(() => {
                predictFrame();
            }, 160);
        } catch (err) {
            setCameraOn(false);
            setError(
                err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access in browser settings."
                    : `Unable to open camera: ${err.message}`
            );
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // When language changes, reset active predictions
    useEffect(() => {
        setPrediction("");
        setConfidence(null);
        setHandedness("");
        setNumHands(0);
        setTop3([]);
        if (cameraOn) {
            setMessage(`Switched to ${language.toUpperCase()} mode. Show an alphabet sign.`);
        }
    }, [language]);

    const guideSigns = language === "isl" ? ISL_GUIDE_SIGNS : ASL_GUIDE_SIGNS;

    return (
        <main className="min-h-screen bg-[#070709] text-white px-4 py-6 md:px-10">
            {/* Top Navigation */}
            <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 pb-5">
                <Link
                    to="/"
                    className="text-xl font-black tracking-[0.2em] text-orange-500 md:text-2xl hover:text-orange-400 transition"
                >
                    SIGNBRIDGE
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="rounded-full border border-orange-500/40 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 hover:bg-orange-500/20 transition flex items-center gap-1.5"
                    >
                        <span>{language === "isl" ? "🇮🇳" : "🤟"}</span>
                        {showGuide ? "Hide Alphabet Guide" : language === "isl" ? "ISL Alphabet Guide" : "ASL Alphabet Guide"}
                    </button>

                    <Link
                        to="/"
                        className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-gray-300 hover:border-orange-500 hover:text-white transition"
                    >
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Quick Sign Reference Drawer */}
            {showGuide && (
                <div className="mx-auto mt-4 max-w-6xl rounded-2xl border border-orange-500/30 bg-[#121217] p-5 shadow-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-orange-400 flex items-center gap-2">
                            <span>{language === "isl" ? "🇮🇳" : "🤟"}</span>
                            {language === "isl"
                                ? "Common Indian Sign Language (ISL) Shapes"
                                : "Common American Sign Language (ASL) Shapes"}
                        </h3>
                        <button
                            onClick={() => setShowGuide(false)}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                        {language === "isl"
                            ? "ISL uses both one-handed and two-handed finger shapes. Skeletons for both hands are tracked simultaneously!"
                            : "ASL fingerspelling uses a single hand. Skeletons adapt automatically to Left or Right hands!"}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2 text-center text-xs">
                        {guideSigns.map((item) => (
                            <div
                                key={item.letter}
                                className="rounded-lg bg-black/40 border border-white/10 p-2 hover:border-orange-500/50 transition"
                            >
                                <span className="block text-lg font-black text-orange-400">
                                    {item.letter}
                                </span>
                                <span className="text-[10px] text-gray-400 leading-tight block">
                                    {item.hint}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <section className="mx-auto mt-8 max-w-6xl">
                <div className="mb-6 text-center">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">
                        Real-Time Landmark Recognition
                    </p>
                    <h1 className="text-2xl font-bold md:text-4xl">
                        AI Sign <span className="text-orange-500">Recognition</span>
                    </h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                    {/* Camera Feed with Skeleton Overlay */}
                    <section className="rounded-2xl border border-white/10 bg-[#101014] p-4 md:p-6 flex flex-col justify-between">
                        <div>
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-semibold">Webcam View</h2>
                                    {cameraOn && (
                                        <button
                                            onClick={() => setMirrorCamera(!mirrorCamera)}
                                            className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-0.5 text-xs text-gray-300 transition"
                                        >
                                            {mirrorCamera ? "Mirrored" : "Normal"}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full ${
                                            cameraOn ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                        }`}
                                    />
                                    <span className="text-xs text-gray-400">
                                        {cameraOn ? "Live Feed (6 FPS)" : "Offline"}
                                    </span>
                                </div>
                            </div>

                            {/* Video + Canvas Stack */}
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className="h-full w-full object-cover"
                                    style={{
                                        transform: mirrorCamera ? "scaleX(-1)" : "none",
                                    }}
                                />

                                {/* Neon Hand Skeleton Overlay */}
                                <canvas
                                    ref={overlayCanvasRef}
                                    className="absolute inset-0 pointer-events-none w-full h-full object-cover"
                                />

                                {/* Offscreen canvas for frame capture */}
                                <canvas ref={hiddenCanvasRef} className="hidden" />

                                {!cameraOn && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070709]/80 backdrop-blur-sm text-center p-4">
                                        <div className="w-14 h-14 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-3">
                                            <span className="text-2xl">📷</span>
                                        </div>
                                        <p className="text-sm font-semibold text-white">Camera is turned off</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-xs">
                                            Click Start Camera below to begin real-time ASL and ISL hand recognition.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                            {!cameraOn ? (
                                <button
                                    onClick={startCamera}
                                    className="rounded-full bg-orange-500 px-6 py-2.5 font-semibold text-sm text-black shadow-lg shadow-orange-500/25 hover:bg-orange-400 transition"
                                >
                                    Start Camera
                                </button>
                            ) : (
                                <button
                                    onClick={stopCamera}
                                    className="rounded-full border border-red-500/60 bg-red-500/10 px-6 py-2.5 font-semibold text-sm text-red-400 hover:bg-red-500/20 transition"
                                >
                                    Stop Camera
                                </button>
                            )}

                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                {numHands > 1 ? (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-purple-300 border border-purple-500/30 font-medium">
                                        ⚡ 2 Hands Tracked (Dual Skeleton)
                                    </span>
                                ) : handedness ? (
                                    `Hand: ${handedness}`
                                ) : (
                                    "Supports 1 or 2 hands (Left & Right)"
                                )}
                            </span>
                        </div>
                    </section>

                    {/* Prediction Results & Controls */}
                    <section className="rounded-2xl border border-white/10 bg-[#101014] p-5 md:p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="mb-4 text-base font-semibold">Recognition Output</h2>

                            <label htmlFor="language" className="mb-2 block text-xs text-gray-400">
                                Sign Language Standard
                            </label>

                            <select
                                id="language"
                                value={language}
                                onChange={(event) => setLanguage(event.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-[#070709] p-2.5 text-sm text-white outline-none focus:border-orange-500 transition mb-5"
                            >
                                <option value="asl">American Sign Language (ASL - 26 Letters, Single-Hand)</option>
                                <option value="isl">Indian Sign Language (ISL - 26 Letters, Dual-Hand)</option>
                            </select>

                            {/* Main Prediction Display Card */}
                            <div className="rounded-xl border border-orange-500/30 bg-gradient-to-b from-orange-500/10 to-transparent p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                                        Predicted Letter
                                    </p>
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                        {language.toUpperCase()}
                                    </span>
                                </div>

                                <div className="my-3 flex min-h-24 items-center justify-center rounded-xl bg-black/60 border border-white/5">
                                    <span className="text-7xl font-black text-orange-500 tracking-tight drop-shadow-md">
                                        {prediction || "—"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                                    <span>Confidence Match</span>
                                    <span className="text-base font-bold text-white">
                                        {confidence == null ? "—" : `${(confidence * 100).toFixed(1)}%`}
                                    </span>
                                </div>

                                {confidence != null && (
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
                                        <div
                                            className="bg-orange-500 h-full rounded-full transition-all duration-200"
                                            style={{ width: `${Math.min(100, confidence * 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Top 3 Alternative Candidates */}
                            {top3.length > 0 && (
                                <div className="mt-4 rounded-xl bg-white/5 p-3">
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Alternative Predictions
                                    </p>
                                    <div className="flex gap-2">
                                        {top3.map((cand, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-1 rounded-lg bg-black/40 border border-white/5 px-2 py-1 text-center"
                                            >
                                                <span className="text-sm font-bold text-gray-200">
                                                    {cand.sign}
                                                </span>
                                                <span className="block text-[10px] text-gray-400">
                                                    {(cand.confidence * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status and Error Messages */}
                            <div className="mt-4 rounded-xl bg-white/5 p-3.5">
                                <p className="text-xs text-gray-300 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                                    {message}
                                </p>

                                {error && (
                                    <p className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </div>

                        <p className="mt-5 text-[11px] leading-relaxed text-gray-500">
                            ✨ Real-time dual-orientation feature extraction supports both ASL (single-handed) and ISL (single & dual-handed) with real-time skeleton landmark tracking.
                        </p>
                    </section>
                </div>
            </section>
        </main>
    );
}

export default Recognizer;
