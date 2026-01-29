import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X, ChevronRight, CheckCircle2, Bot, Layers, Zap, ArrowRight, Github } from "lucide-react";
import AuthModal from "../components/AuthModal";
import Logo from "../assets/Logos/Logo.svg"; // Assuming Logo exists based on file list

// Navbar Component
const LandingNavbar = ({ onLoginClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md border-b border-white/10" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Fallback layout for logo if svg not perfect */}
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Bot className="text-black" />
                    </div>
                    <span className="text-xl font-slate-bold text-white tracking-tight">NextGent</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-slate-medium text-zinc-400 hover:text-white transition-colors">Features</a>
                    <a href="#about" className="text-sm font-slate-medium text-zinc-400 hover:text-white transition-colors">About</a>
                    <button
                        onClick={onLoginClick}
                        className="text-sm font-slate-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all border border-white/10 backdrop-blur-sm"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={onLoginClick}
                        className="text-sm font-slate-bold text-black bg-white hover:bg-zinc-200 px-5 py-2 rounded-lg transition-all"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-zinc-950 border-b border-white/10 p-6 flex flex-col gap-4">
                    <a href="#features" className="text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
                    <a href="#about" className="text-zinc-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>About</a>
                    <div className="h-px bg-white/10 my-2" />
                    <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="w-full text-left text-white py-2">Sign In</button>
                    <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="w-full bg-white text-black py-3 rounded-lg font-bold">Get Started</button>
                </div>
            )}
        </nav>
    );
};

// Section Component
const Section = ({ id, children, className = "" }) => (
    <section id={id} className={`py-24 px-6 ${className}`}>
        <div className="max-w-7xl mx-auto">{children}</div>
    </section>
);

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
            {/* Progress Bar */}
            <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 origin-left z-50" />

            <LandingNavbar onLoginClick={() => setShowAuth(true)} />

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none opacity-30" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-slate-medium text-zinc-400 mb-8 hover:bg-white/10 transition-colors cursor-default">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            AI Agent V1.0 Now Live
                        </div>
                        <h1 className="text-5xl md:text-7xl font-slate-bold tracking-tight mb-8 leading-[1.1]">
                            Architect Your Requirements <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-white">
                                With Intelligent Agents
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-slate mb-12 leading-relaxed">
                            NextGent automates requirements engineering. Transform vague ideas into precise, technical specifications using our advanced multi-agent system.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => setShowAuth(true)}
                                className="group relative px-8 py-4 bg-white text-black rounded-xl font-slate-bold text-lg overflow-hidden transition-all hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Building <ChevronRight size={20} />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                                onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-xl font-slate-medium text-lg hover:bg-zinc-800 transition-all">
                                Learn how it works
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <Section id="features" className="border-t border-white/5 bg-black/50">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-slate-bold mb-4">Powered by Advanced AI</motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-400 font-slate">Everything you need to build better software specs.</motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Bot className="text-blue-400" size={32} />,
                            title: "Agentic Engineering",
                            desc: "Our agents define, refine, and validate requirements automatically."
                        },
                        {
                            icon: <Layers className="text-purple-400" size={32} />,
                            title: "Seamless Integration",
                            desc: "Export to Jira, Notion, or raw Markdown with a single click."
                        },
                        {
                            icon: <Zap className="text-yellow-400" size={32} />,
                            title: "Real-time Validation",
                            desc: "Instant feedback on ambiguity, completeness, and consistency."
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 hover:bg-zinc-900 transition-all group"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-black border border-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-slate-bold mb-3">{feature.title}</h3>
                            <p className="text-zinc-400 font-slate leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* About Section */}
            <Section id="about">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-slate-bold mb-6">Why NextGent?</h2>
                        <div className="space-y-6">
                            <p className="text-zinc-400 font-slate text-lg leading-relaxed">
                                Traditional requirements gathering is slow, prone to error, and disconnected from code. NextGent bridges this gap by treating requirements as code.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Reduce rework by 40%",
                                    "Automated edge-case detection",
                                    "Semantic consistency checks",
                                    "Team collaboration built-in"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-300 font-slate-medium">
                                        <CheckCircle2 size={20} className="text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Abstract UI representation */}
                        <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="space-y-4 font-mono text-sm">
                                <div className="flex gap-4">
                                    <span className="text-purple-400">agent</span>
                                    <span className="text-zinc-500">analyzing requirements...</span>
                                </div>
                                <div className="pl-4 border-l-2 border-white/10 text-zinc-300">
                                    "The user flow for 'Forgot Password' is missing the 'Reset Token Expiry' condition."
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-green-400">system</span>
                                    <span className="text-zinc-500">generating update proposals...</span>
                                </div>
                                <div className="h-20 bg-black/50 rounded-lg animate-pulse" />
                            </div>
                        </div>
                        <div className="absolute top-10 -right-10 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl -z-10 blur-xl" />
                    </motion.div>
                </div>
            </Section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Bot size={24} />
                        <span className="font-slate-bold text-lg">NextGent</span>
                    </div>
                    <div className="text-zinc-500 text-sm font-slate text-center md:text-right">
                        <p>&copy; {new Date().getFullYear()} NextGent AI. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:float-right justify-center">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Discord</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
        </div>
    );
}
