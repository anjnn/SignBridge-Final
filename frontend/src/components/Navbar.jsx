import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
const [isOpen, setIsOpen] = useState(false);
const navLinks = [
    { name: "About", href: "#about" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Applications", href: "#applications" },
    { name: "Contact", href: "#contact" },
];

const linkClass =
    "hover:text-[#ff5e14] transition-colors duration-200 cursor-pointer";

const mobileLinkClass =
    "text-gray-300 hover:text-[#ff5e14] font-medium py-1 text-base transition-colors duration-200";

return (
    <nav className="w-full bg-[#070709]/85 backdrop-blur-md text-white border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-4">
            <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-orange-500 text-2xl font-black tracking-[0.25em] hover:opacity-90"
            >
                SIGNBRIDGE
            </Link>

            <ul className="hidden md:flex items-center gap-9 text-gray-300 text-sm font-medium">
                {navLinks.map((link) => (
                    <li key={link.name}>
                        <a href={link.href} className={linkClass}>
                            {link.name}
                        </a>
                    </li>
                ))}
                <li>
                    <Link to="/recognizer" className={linkClass}>
                        Sign Recognition
                    </Link>
                </li>
            </ul>

            <div className="hidden md:block">
                <a
                    href="/#cta"
                    className="inline-block bg-gradient-to-r from-[#ff5e14] to-[#f94100] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:scale-105 transition-all"
                >
                    Get Started
                </a>
            </div>

            <button
                onClick={() => setIsOpen((previous) => !previous)}
                aria-label="Toggle navigation menu"
                aria-expanded={isOpen}
                className="md:hidden text-gray-300 text-xl p-2"
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>
        </div>

        {isOpen && (
            <div className="md:hidden bg-[#0a0b10] border-b border-white/10 px-6 py-5 flex flex-col gap-4">
                {navLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={mobileLinkClass}
                    >
                        {link.name}
                    </a>
                ))}

                <Link
                    to="/recognizer"
                    onClick={() => setIsOpen(false)}
                    className={mobileLinkClass}
                >
                    Sign Recognition
                </Link>

                <a
                    href="/#cta"
                    onClick={() => setIsOpen(false)}
                    className="text-center bg-gradient-to-r from-[#ff5e14] to-[#f94100] text-white px-6 py-2.5 rounded-full font-semibold text-sm mt-2"
                >
                    Get Started
                </a>
            </div>
        )}
    </nav>
);

}

export default Navbar;
