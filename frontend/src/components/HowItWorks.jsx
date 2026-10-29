function HowItWorks() {
    const steps = [
        {
            number: "01",
            title: "Capture Gesture",
            description:
                "The webcam captures hand gestures in real-time.",
        },
        {
            number: "02",
            title: "Detect Hand",
            description:
                "AI identifies hand landmarks and extracts important features.",
        },
        {
            number: "03",
            title: "Recognize Gesture",
            description:
                "The trained machine learning model predicts the sign accurately.",
        },
        {
            number: "04",
            title: "Generate Output",
            description:
                "The recognized gesture is converted into meaningful text and speech.",
        },
    ];

    return (
        <section id="how-it-works" className="bg-[#070709] text-white py-24 relative overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">

                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff5e14]/10 border border-[#ff5e14]/25 text-[#ff5e14] font-semibold text-xs tracking-widest uppercase mb-4">
                        Workflow
                    </span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-2 tracking-tight">
                        How <span className="bg-gradient-to-r from-[#ff7a36] to-[#ff5e14] bg-clip-text text-transparent">SignBridge</span> Works
                    </h2>

                    <p className="text-gray-400 text-base md:text-lg mt-5 max-w-2xl mx-auto">
                        From hand gestures to meaningful communication in just a few intelligent steps.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className="bg-[#0e0f15] border border-white/10 rounded-2xl p-7 hover:border-[#ff5e14]/60 hover:shadow-[0_0_30px_rgba(255,94,20,0.18)] hover:-translate-y-1.5 transition-all duration-300 relative group overflow-hidden"
                        >
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ff5e14]/10 rounded-full blur-xl group-hover:bg-[#ff5e14]/20 transition-colors"></div>

                            <p className="text-3xl font-extrabold bg-gradient-to-r from-[#ff7a36] to-[#ff5e14] bg-clip-text text-transparent">
                                {step.number}
                            </p>

                            <h3 className="text-xl font-bold mt-5 text-white group-hover:text-[#ff7a36] transition-colors">
                                {step.title}
                            </h3>

                            <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default HowItWorks;