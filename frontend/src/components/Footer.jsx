function Footer() {
    return (
        <footer id="contact" className="bg-[#050507] border-t border-white/10 py-10 text-sm scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="text-center md:text-left">
                    <h2 className="text-orange-500 text-2xl font-black tracking-[0.25em]">
                        SIGNBRIDGE
                    </h2>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Breaking communication barriers through sign language AI.
                    </p>
                </div>

                <div className="text-center md:text-right">
                    <p className="text-gray-300 text-xs sm:text-sm font-medium">
                        Have questions? Reach out to us at{" "}
                        <a
                            href="mailto:contact@signbridge.ai"
                            className="text-[#ff5e14] hover:underline"
                        >
                            contact@signbridge.ai
                        </a>
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                        © 2026 SIGNBRIDGE. Built by Abhinav, Anjan, Jithesh, Jumail.
                    </p>
                </div>

            </div>
        </footer>
    );
}

export default Footer;