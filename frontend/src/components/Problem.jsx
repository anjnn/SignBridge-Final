function Problem() {
    return (
        <section id="about" className="bg-[#070709] text-white py-24 relative overflow-hidden scroll-mt-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#ff5e14]/5 blur-3xl rounded-full pointer-events-none"></div>

            <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">

                <div className="bg-[#0d0e14]/80 border border-white/10 hover:border-[#ff5e14]/30 rounded-3xl p-10 md:p-16 text-center backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300">

                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff5e14]/10 border border-[#ff5e14]/25 text-[#ff5e14] font-semibold text-xs tracking-widest uppercase mb-6">
                        Why This Matters
                    </span>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Communication Should <span className="bg-gradient-to-r from-[#ff7a36] to-[#ff5e14] bg-clip-text text-transparent">Never Be a Barrier.</span>
                    </h2>

                    <p className="text-gray-300 text-base md:text-lg mt-8 max-w-3xl mx-auto leading-relaxed">
                        Millions of Deaf and speech-impaired individuals rely on sign language
                        every day, but not everyone around them understands it. This often
                        creates communication barriers in schools, hospitals, workplaces, and
                        everyday life.
                    </p>

                    <p className="text-gray-400 text-base md:text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
                        Our project aims to bridge this gap by using Artificial Intelligence
                        to interpret sign language into meaningful text and speech, making
                        communication more natural, inclusive, and accessible.
                    </p>

                </div>

            </div>
        </section>
    );
}

export default Problem;