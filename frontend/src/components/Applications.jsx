import {
    FaHospital,
    FaSchool,
    FaBuilding,
    FaHome,
} from "react-icons/fa";

function Applications() {
    const applications = [
        {
            icon: <FaHospital />,
            title: "Hospitals",
            description:
                "Assist doctors and patients by improving communication during medical consultations.",
        },
        {
            icon: <FaSchool />,
            title: "Schools",
            description:
                "Help students and teachers communicate effectively inside classrooms.",
        },
        {
            icon: <FaBuilding />,
            title: "Workplaces",
            description:
                "Enable better collaboration between employees using sign language.",
        },
        {
            icon: <FaHome />,
            title: "Daily Life",
            description:
                "Make everyday conversations more inclusive with real-time interpretation.",
        },
    ];

    return (
        <section id="applications" className="bg-[#070709] text-white py-24 relative overflow-hidden scroll-mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">

                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#ff5e14]/10 border border-[#ff5e14]/25 text-[#ff5e14] font-semibold text-xs tracking-widest uppercase mb-4">
                        Applications
                    </span>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-2 tracking-tight">
                        Built for <span className="bg-gradient-to-r from-[#ff7a36] to-[#ff5e14] bg-clip-text text-transparent">Real Life</span>
                    </h2>

                    <p className="text-gray-400 text-base md:text-lg mt-5 max-w-2xl mx-auto">
                        SignBridge is designed to improve communication wherever people connect.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

                    {applications.map((item) => (
                        <div
                            key={item.title}
                            className="bg-[#0e0f15] border border-white/10 rounded-2xl p-8 hover:border-[#ff5e14]/60 hover:shadow-[0_0_30px_rgba(255,94,20,0.18)] hover:-translate-y-1.5 transition-all duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#ff5e14]/10 border border-[#ff5e14]/25 flex items-center justify-center text-[#ff5e14] text-2xl group-hover:scale-110 group-hover:bg-[#ff5e14] group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,94,20,0.15)]">
                                {item.icon}
                            </div>

                            <h3 className="text-xl font-bold mt-6 text-white group-hover:text-[#ff7a36] transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}

export default Applications;