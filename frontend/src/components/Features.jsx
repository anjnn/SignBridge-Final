import { FaHandPaper, FaGlobe, FaMicrophoneAlt, FaBolt } from "react-icons/fa";

function Features() {

    const features = [
        {
            icon: <FaHandPaper />,
            title: "Real-Time Detection",
            description: "Recognizes hand gestures instantly using AI-powered vision.",
        },
        {
            icon: <FaGlobe />,
            title: "Multilingual Support",
            description: "Designed to support multiple sign languages in one platform.",
        },
        {
            icon: <FaMicrophoneAlt />,
            title: "Speech Generation",
            description: "Transforms recognized gestures into meaningful speech and text.",
        },
        {
            icon: <FaBolt />,
            title: "Fast & Accurate",
            description: "Optimized for quick predictions with high recognition accuracy.",
        },
    ];


    return (
        <section id="features" className="bg-[#070709] text-white py-24 relative overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff5e14]/10 border border-[#ff5e14]/25 text-[#ff5e14] font-semibold text-xs tracking-widest uppercase mb-4">
                        Features
                    </span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-2 tracking-tight">
                        Everything You <span className="bg-gradient-to-r from-[#ff7a36] to-[#ff5e14] bg-clip-text text-transparent">Need</span>
                    </h2>

                    <p className="text-gray-400 text-base md:text-lg mt-5 max-w-2xl mx-auto">
                        Powerful AI features designed to make communication more accessible.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-[#0e0f15] border border-white/10 rounded-2xl p-8 hover:border-[#ff5e14]/60 hover:shadow-[0_0_30px_rgba(255,94,20,0.18)] hover:-translate-y-1.5 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#ff5e14]/10 border border-[#ff5e14]/25 flex items-center justify-center text-[#ff5e14] text-2xl group-hover:scale-110 group-hover:bg-[#ff5e14] group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,94,20,0.15)]">
                                {feature.icon}
                            </div>

                            <h3 className="text-xl font-bold mt-6 text-white group-hover:text-[#ff7a36] transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;