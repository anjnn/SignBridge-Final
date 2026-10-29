import { FaArrowRight } from "react-icons/fa";

function Hero() {
    return (
        <section id="hero" className="relative min-h-[calc(100vh-80px)] bg-[#070709] text-white flex items-center overflow-hidden py-12 lg:py-0 scroll-mt-20">
            {/* Background Ambient Radial Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(255,94,20,0.18)_0%,_rgba(255,94,20,0.03)_50%,_transparent_70%)] blur-3xl pointer-events-none z-0"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full relative z-10">

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* LEFT COLUMN */}
                    <div className="z-10">

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
                            Every Gesture
                            <br />
                            Deserves to Be
                            <br />
                            <span className="bg-gradient-to-r from-[#ff7a36] via-[#ff5e14] to-[#f94100] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,94,20,0.4)]">
                                Understood.
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg md:text-xl mt-7 max-w-xl leading-relaxed">
                            Breaking communication barriers through accessible sign language interpretation.
                        </p>

                        <div className="flex flex-wrap items-center gap-5 mt-10">

                            <a href="#cta" className="bg-gradient-to-r from-[#ff5e14] to-[#f94100] hover:from-[#ff6d2b] hover:to-[#ff3b00] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-[0_0_35px_rgba(255,94,20,0.45)] hover:shadow-[0_0_50px_rgba(255,94,20,0.7)] text-base cursor-pointer">
                                Start Interpreting
                                <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                            </a>

                            <a href="#about" className="border border-[#ff5e14]/40 hover:border-[#ff5e14] bg-[#111218]/80 hover:bg-[#ff5e14]/10 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 text-base cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                Learn More
                            </a>

                        </div>

                    </div>

                    {/* RIGHT COLUMN - SEAMLESS BLENDED HAND VISUAL */}
                    <div className="flex justify-center items-center relative py-8">

                        <div className="relative flex justify-center items-center w-full max-w-[540px] aspect-square">

                            {/* Concentric Orbital Glow Rings */}
                            <div className="absolute w-[92%] h-[92%] border border-[#ff5e14]/30 rounded-full animate-spin-slow pointer-events-none">
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ff5e14] rounded-full shadow-[0_0_12px_#ff5e14]"></div>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#ff7a36] rounded-full shadow-[0_0_10px_#ff7a36]"></div>
                            </div>
                            <div className="absolute w-[76%] h-[76%] border border-[#ff5e14]/20 rounded-full pointer-events-none"></div>

                            {/* Soft Orange Glow backdrop */}
                            <div className="absolute w-[70%] h-[70%] bg-gradient-to-tr from-[#ff5e14]/40 via-orange-600/20 to-transparent blur-3xl rounded-full animate-pulse-slow"></div>

                            {/* Hand Container */}
                            <div className="relative z-10 w-full flex items-center justify-center animate-float">

                                {/* Seamless Blended Hand Image */}
                                <img
                                    src="/hand.png?v=2"
                                    alt="Sign Language Hand Gesture"
                                    className="w-[88%] sm:w-[92%] object-contain relative z-10 drop-shadow-[0_0_45px_rgba(255,94,20,0.55)]"
                                />

                                {/* AI Keypoint Node Pulse Highlights */}
                                <svg
                                    className="absolute inset-0 w-full h-full z-20 pointer-events-none"
                                    viewBox="0 0 500 500"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    {[
                                        { cx: 250, cy: 410 },
                                        { cx: 245, cy: 340 },
                                        { cx: 215, cy: 285 },
                                        { cx: 195, cy: 230 },
                                        { cx: 185, cy: 195 },
                                        { cx: 255, cy: 275 },
                                        { cx: 260, cy: 200 },
                                        { cx: 265, cy: 155 },
                                        { cx: 265, cy: 115 },
                                        { cx: 285, cy: 280 },
                                        { cx: 300, cy: 215 },
                                        { cx: 305, cy: 160 },
                                        { cx: 305, cy: 110 },
                                        { cx: 315, cy: 295 },
                                        { cx: 335, cy: 245 },
                                        { cx: 345, cy: 195 },
                                        { cx: 345, cy: 145 },
                                    ].map((pt, idx) => (
                                        <g key={idx}>
                                            <circle
                                                cx={pt.cx}
                                                cy={pt.cy}
                                                r="4"
                                                fill="#ffffff"
                                                className="drop-shadow-[0_0_10px_#ffffff]"
                                            />
                                            <circle
                                                cx={pt.cx}
                                                cy={pt.cy}
                                                r="8"
                                                fill="#ff5e14"
                                                fillOpacity="0.5"
                                                className="animate-pulse"
                                            />
                                        </g>
                                    ))}
                                </svg>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Bottom Wavy Grid Pattern Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[radial-gradient(#ff5e14_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
        </section>
    );
}

export default Hero;