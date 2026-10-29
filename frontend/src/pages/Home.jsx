import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Problem from "../components/Problem";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Applications from "../components/Applications";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Problem />
            <HowItWorks />
            <Features />
            <Applications />
            <CTA />
            <Footer />
        </>
    );
}

export default Home;