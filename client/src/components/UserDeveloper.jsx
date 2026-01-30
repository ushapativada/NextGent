import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Code2, ListChecks, ShieldCheck, Loader2, AlertCircle, Sparkles, ChevronLeft, ChevronRight, FileText, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API = "http://localhost:8000/developer";

// --- STYLED COMPONENTS ---

const SpecCard = ({ title, icon: Icon, children, gradient }) => (
    <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 h-full flex flex-col transition-all hover:border-white/10 hover:bg-zinc-900/60 backdrop-blur-md">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

        <div className="flex items-center gap-4 mb-6 shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${gradient.replace('from-', 'text-').split(' ')[0]}`}>
                <Icon size={24} />
            </div>
            <h2 className="text-2xl font-slate-bold text-white tracking-tight">{title}</h2>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600">
            <div className="prose prose-invert max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-li:text-zinc-400 prose-li:marker:text-zinc-600 prose-strong:text-zinc-200">
                {children}
            </div>
        </div>
    </div>
);

// MD Components
const mdComponents = {
    h1: () => null,
    h2: () => null,
    h3: ({ node, ...props }) => <h3 className="text-lg font-slate-bold text-white mt-6 mb-3 flex items-center gap-2" {...props} />,
    p: ({ node, ...props }) => <p className="text-zinc-400 leading-7 mb-4 text-sm font-slate" {...props} />,
    ul: ({ node, ...props }) => <ul className="space-y-3 mb-6" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 text-zinc-400 text-sm" {...props} />,
    li: ({ node, ...props }) => (
        <li className="flex gap-3 text-sm text-zinc-400 items-start">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
            <span className="flex-1 content">{props.children}</span>
        </li>
    ),
    strong: ({ node, ...props }) => <strong className="text-zinc-100 font-slate-medium" {...props} />,
};

export default function UserDeveloper() {
    console.log("UserDeveloper Component Rendered"); // Debug logging
    const navigate = useNavigate();
    const sessionId = sessionStorage.getItem("sessionId");

    const [loading, setLoading] = useState(false);
    const [specs, setSpecs] = useState(null);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0); // 0 = Functional, 1 = Non-Functional

    // Parsed sections
    const [parsedSections, setParsedSections] = useState({
        functional: null,
        nonFunctional: null
    });

    useEffect(() => {
        if (!sessionId) {
            setError("No active session. Please start or select a session from the Dashboard.");
            return;
        }

        const fetchSpecs = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API}/specs?session_id=${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSpecs(data.specs);
                }
            } catch (e) {
                // Silent fail if no specs yet
            } finally {
                setLoading(false);
            }
        };
        fetchSpecs();

    }, [sessionId]);

    // Improved Parsing Logic
    useEffect(() => {
        if (!specs) return;

        const sections = { functional: "", nonFunctional: "" };
        const lines = specs.split('\n');
        let currentSection = null;

        lines.forEach(line => {
            const lower = line.trim().toLowerCase();

            if (lower.match(/^(#+)?\s*functional requirements/)) {
                currentSection = "functional";
                return;
            }
            if (lower.includes("system must support the following functions")) {
                currentSection = "functional";
                return;
            }

            if (lower.match(/^(#+)?\s*non-functional requirements/) || lower.includes("non-functional requirements:")) {
                currentSection = "nonFunctional";
                return;
            }

            if (currentSection) {
                sections[currentSection] += line + "\n";
            }
        });

        if (!sections.functional.trim() && !sections.nonFunctional.trim()) {
            setParsedSections({ functional: specs, nonFunctional: null });
        } else {
            setParsedSections(sections);
        }

    }, [specs]);

    const generateSpecs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/generate?session_id=${sessionId}`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error("Validation not complete. Please finalize requirements in the Validator tab first.");
                }
                throw new Error(data.detail || "Failed to generate specs.");
            }
            setSpecs(data.specs);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!sessionId) return;
        try {
            window.open(`${API}/download?session_id=${sessionId}`, '_blank');
        } catch (err) {
            console.error(err);
            setError("Failed to download PDF.");
        }
    };

    const nextSlide = () => setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? 1 : 0));

    if (error) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-6 backdrop-blur-sm">
                    <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-slate-bold text-white mb-2">Service Unavailable</h2>
                    <p className="text-zinc-400 font-slate text-sm max-w-sm mb-6">{error}</p>
                    {error.includes("finalize") && (
                        <a href="/validator" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-slate-medium text-xs transition-colors border border-white/5">
                            Go to Validator
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // Determine content for carousel
    const slides = [
        {
            id: 'functional',
            title: 'Functional Requirements',
            icon: ListChecks,
            gradient: 'from-blue-500 to-cyan-500',
            content: parsedSections.functional
        },
        {
            id: 'non-functional',
            title: 'Non-Functional Requirements',
            icon: ShieldCheck,
            gradient: 'from-purple-500 to-pink-500',
            content: parsedSections.nonFunctional
        }
    ].filter(s => s.content); // Only show slides that have content

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between mb-6 px-6 py-6 border-b border-white/5 shrink-0">
                <div>
                    <h1 className="text-3xl font-slate-bold text-white flex items-center gap-3">
                        Technical Specifications
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full font-slate-medium border border-blue-500/20">
                            Draft v1.0
                        </span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    {(!specs || loading) && (
                        <button
                            onClick={generateSpecs}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-slate-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            {loading ? "Architecting..." : "Generate Docs"}
                        </button>
                    )}
                    {specs && !loading && (
                        <>
                            <button
                                onClick={generateSpecs}
                                className="text-zinc-400 hover:text-white px-4 py-2 font-slate-medium text-sm transition-colors"
                            >
                                Regenerate
                            </button>
                            <button
                                onClick={downloadPDF}
                                className="bg-zinc-800 text-white hover:bg-zinc-700 px-6 py-3 rounded-2xl font-slate-bold text-sm flex items-center gap-2 transition-all border border-white/5"
                            >
                                <Download size={18} />
                                PDF Export
                            </button>
                            <button
                                onClick={() => navigate("/output")}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-2xl font-slate-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                            >
                                Final Output
                                <ArrowRight size={18} />
                            </button>
                        </>
                    )}

                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-6 pb-12 overflow-hidden flex flex-col items-center justify-center relative">

                {loading && !specs && (
                    <div className="flex flex-col items-center justify-center gap-8 animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Code2 size={40} className="text-blue-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-white font-slate-bold text-xl">Analyzing Requirements</h3>
                            <p className="text-zinc-500">Formulating specifications...</p>
                        </div>
                    </div>
                )}

                {specs && slides.length > 0 && (
                    <div className="relative w-full max-w-4xl h-full flex flex-col">

                        {/* Carousel Controls */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-16 z-10 hidden xl:flex">
                            <button onClick={prevSlide} className="p-3 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-xl">
                                <ChevronLeft size={24} />
                            </button>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 -right-16 z-10 hidden xl:flex">
                            <button onClick={nextSlide} className="p-3 rounded-full bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-xl">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Slide Display */}
                        <div className="flex-1 relative overflow-hidden">
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${index === currentSlide
                                        ? "opacity-100 translate-x-0 scale-100"
                                        : "opacity-0 translate-x-12 scale-95 pointer-events-none"
                                        }`}
                                >
                                    <SpecCard
                                        title={slide.title}
                                        icon={slide.icon}
                                        gradient={slide.gradient}
                                    >
                                        <ReactMarkdown components={mdComponents}>
                                            {slide.content}
                                        </ReactMarkdown>
                                    </SpecCard>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Indicators/Mobile Controls */}
                        <div className="flex items-center justify-center gap-4 mt-6 shrink-0">
                            <div className="xl:hidden">
                                <button onClick={prevSlide} className="p-2 text-zinc-400"><ChevronLeft /></button>
                            </div>

                            <div className="flex gap-2">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? "bg-white w-6" : "bg-zinc-700 hover:bg-zinc-600"
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="xl:hidden">
                                <button onClick={nextSlide} className="p-2 text-zinc-400"><ChevronRight /></button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div >
    );
}
