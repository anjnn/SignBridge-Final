function CTA() {
    return (
        <section id="cta" className="bg-[#070709] py-24 relative overflow-hidden scroll-mt-20">
            <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">

                <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-[#ff5e14]/50 via-orange-500/20 to-[#ff5e14]/50 shadow-[0_0_50px_rgba(255,94,20,0.2)]">

                    <div className="bg-[#0d0e14] rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-[#ff5e14]/15 blur-3xl rounded-full pointer-events-none"></div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight relative z-10">
                            Ready to Break
                            <span className="bg-gradient-to-r from-[#ff7a36] via-[#ff5e14] to-[#f94100] bg-clip-text text-transparent"> Communication Barriers?</span>
                        </h2>

                        <p className="text-gray-300 mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed relative z-10">
                            Experience the power of AI-driven sign language interpretation
                            and help create a more inclusive world.
                        </p>

                        <button className="mt-10 bg-gradient-to-r from-[#ff5e14] to-[#f94100] hover:from-[#ff6d2b] hover:to-[#ff3b00] text-white px-9 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105 shadow-[0_0_35px_rgba(255,94,20,0.45)] hover:shadow-[0_0_50px_rgba(255,94,20,0.7)] cursor-pointer relative z-10">
                            Start Interpreting
                        </button>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default CTA;