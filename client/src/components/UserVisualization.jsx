import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Sparkles, Image as ImageIcon, ChevronLeft, ChevronRight, Workflow, ArrowRight } from "lucide-react";

const API = "http://localhost:8000/visualization";

const DiagramCard = ({ title, rawLink, children, gradient }) => (
    <div className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 p-8 h-full flex flex-col transition-all hover:border-white/10 hover:bg-zinc-900/60 backdrop-blur-md">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

        <div className="flex items-center justify-between mb-6 shrink-0">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${gradient.replace('from-', 'text-').split(' ')[0]}`}>
                    <ImageIcon size={24} />
                </div>
                <h2 className="text-2xl font-slate-bold text-white tracking-tight">{title}</h2>
            </div>
            {rawLink && (
                <a href={rawLink} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors p-2 bg-white/5 rounded-xl border border-white/5">
                    Open Image <ArrowRight size={14} className="inline ml-1" />
                </a>
            )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-700 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5">
            {children}
        </div>
    </div>
);

// Function to encode PlantUML text for the plantuml.com server
function encode64(data) {
    let r = "";
    for (let i = 0; i < data.length; i += 3) {
        if (i + 2 === data.length) {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0);
        } else if (i + 1 === data.length) {
            r += append3bytes(data.charCodeAt(i), 0, 0);
        } else {
            r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2));
        }
    }
    return r;
}

function append3bytes(b1, b2, b3) {
    let c1 = b1 >> 2;
    let c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
    let c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
    let c4 = b3 & 0x3f;
    let r = "";
    r += encode6bit(c1 & 0x3f);
    r += encode6bit(c2 & 0x3f);
    r += encode6bit(c3 & 0x3f);
    r += encode6bit(c4 & 0x3f);
    return r;
}

function encode6bit(b) {
    if (b < 10) return String.fromCharCode(48 + b);
    b -= 10;
    if (b < 26) return String.fromCharCode(65 + b);
    b -= 26;
    if (b < 26) return String.fromCharCode(97 + b);
    b -= 26;
    if (b === 0) return "-";
    if (b === 1) return "_";
    return "?";
}

function deflate(str) {
    // Basic wrapper to use pako if available or just raw text fallback for now
    // Actually standard plantuml js encoding uses a specific zip compression 
    // To keep it simple without adding NPM dependencies like `pako`, we use Kroki
    // Kroki accepts base64 URL safe without DEFLATE if we send it as a POST but 
    // let's just use the plantuml.com proxy using simple text encoding first 
    // Wait, plantuml.com requires DEFLATE. 
    // Alternative: We can use https://kroki.io/plantuml/svg/
    return null; 
}


export default function UserVisualization() {
    const navigate = useNavigate();
    const sessionId = sessionStorage.getItem("sessionId");

    const [loading, setLoading] = useState(false);
    const [diagrams, setDiagrams] = useState(null);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (!sessionId) {
            setError("No active session. Please start or select a session from the Dashboard.");
            return;
        }

        const fetchDiagrams = async () => {
             setLoading(true);
            try {
                const res = await fetch(`${API}/diagrams?session_id=${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.diagrams) {
                        setDiagrams(data.diagrams);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchDiagrams();
    }, [sessionId]);

    const handleDownloadSRS = async () => {
        try {
            const res = await fetch(`http://localhost:8000/output/download/srs/${sessionId}`);
            if (!res.ok) throw new Error("Output not ready yet");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `srs_document_${sessionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            console.error(e);
            setError("Failed to download SRS PDF. Please ensure all previous steps are completed.");
        }
    };

    const generateDiagrams = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/generate?session_id=${sessionId}`, { method: "POST" });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                     throw new Error("Invalid project state. Please complete the Validator and Developer phases first before generating diagrams.");
                }
                if (res.status === 400 && data.detail?.includes("Specs")) {
                     throw new Error("Technical specifications not found. Please complete the Developer phase first.");
                }
                throw new Error(data.detail || "Failed to generate diagrams.");
            }
            if (data.diagrams) setDiagrams(data.diagrams);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Use Kroki encode for SVGs
    // Kroki expects Base64 URL safe of the string, or we can just send text.
    // Actually, plantuml online server allows POST requests easily, but we need an image url.
    // Let's use the public plantuml.com proxy method doing simple String -> UTF8 -> URL Encoding 
    // No, standard plantuml requires deflate. 
    // Let's use `https://www.plantuml.com/plantuml/svg/~1` prefix for simple non-compressed text (doesn't always work for large diagrams)
    // The easiest fallback without adding a package like pako for deflate is to proxy via our own backend, 
    // but we didn't build that.
    // Let's formulate Kroki URL: (it handles base64 url-safe without deflate in some APIs, let's use the simplest: plantuml.com uses encoded deflate).
    // Let's use kroki via POST to get SVG instead of GET, but React `<img>` needs a GET URL.
    // Okay, let's just use an iframe with a data URI or SVG string.
    
    // Better way: rendering raw UML text directly? No, we need an image.
    // Let's use https://kroki.io endpoint. It accepts base64 encoded text (DEFLATE compressed but base64 can work with specific tools).
    // The easiest robust way in JS without extra packages is to use the `btoa` function and Kroki's base64 method 
    // Actually Kroki requires payload to be zlib-compressed base64.
    
    // Instead of doing complex encoding on frontend, we will just use PlantUML proxy 
    // WAIT. We can just use the backend to give us the SVG? No backend gives raw text.
    // Let's use `https://www.planttext.com/api/plantuml/svg/`
    // Actually `planttext` allows you to just pass the raw plain text url encoded! (sometimes) No, it uses standard plantuml encoding.

    // Let's use https://kroki.io. We can send a POST request with the raw diagram text and get an SVG back as a blob.
    
    const [svgs, setSvgs] = useState({});

    useEffect(() => {
        if (!diagrams) return;

        const fetchSvg = async (key, rawText) => {
             if (!rawText) return;
             try {
                // Kroki POST method
                const response = await fetch('https://kroki.io/plantuml/svg', {
                    method: 'POST',
                    body: rawText,
                    headers: { 'Content-Type': 'text/plain' }
                });
                if (response.ok) {
                    const svgText = await response.text();
                    
                    // Convert SVG string to Data URL
                    const blob = new Blob([svgText], {type: 'image/svg+xml'});
                    const url = URL.createObjectURL(blob);
                    
                    setSvgs(prev => ({...prev, [key]: url}));
                }
             } catch (e) {
                 console.error("Failed to render SVG via Kroki API", e);
             }
        };

        if (diagrams.useCase) fetchSvg('useCase', diagrams.useCase);
        if (diagrams.class) fetchSvg('class', diagrams.class);
        if (diagrams.sequence) fetchSvg('sequence', diagrams.sequence);
        if (diagrams.activity) fetchSvg('activity', diagrams.activity);
        
    }, [diagrams]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    if (error) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20 mb-6 backdrop-blur-sm">
                    <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-slate-bold text-white mb-2">Service Unavailable</h2>
                    <p className="text-zinc-400 font-slate text-sm max-w-sm mb-6">{error}</p>
                    {error.includes("Developer") && (
                        <button onClick={() => navigate("/developer")} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-slate-medium text-xs transition-colors border border-white/5">
                            Go to Developer
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const slides = [
        { id: 'useCase', title: 'Use Case Diagram', gradient: 'from-blue-500 to-cyan-500', rawText: diagrams?.useCase, imageSrc: svgs['useCase'] },
        { id: 'class', title: 'Class Diagram', gradient: 'from-purple-500 to-pink-500', rawText: diagrams?.class, imageSrc: svgs['class'] },
        { id: 'sequence', title: 'Sequence Diagram', gradient: 'from-green-500 to-emerald-500', rawText: diagrams?.sequence, imageSrc: svgs['sequence'] },
        { id: 'activity', title: 'Activity Diagram', gradient: 'from-orange-500 to-amber-500', rawText: diagrams?.activity, imageSrc: svgs['activity'] }
    ].filter(s => s.rawText);

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-6 px-6 py-6 border-b border-white/5 shrink-0">
                <div>
                     <h1 className="text-3xl font-slate-bold text-white flex items-center gap-3">
                        UML Diagrams
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full font-slate-medium border border-purple-500/20">
                            Auto-Generated
                        </span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    {(!diagrams && !loading) && (
                        <button
                            onClick={generateDiagrams}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-slate-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
                        >
                            <Workflow size={18} /> Generate Diagrams
                        </button>
                    )}
                     {(diagrams && !loading) && (
                        <>
                             <button
                                onClick={generateDiagrams}
                                className="text-zinc-400 hover:text-white px-4 py-2 font-slate-medium text-sm transition-colors"
                            >
                                Regenerate
                            </button>
                            <button
                                onClick={handleDownloadSRS}
                                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-slate-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Export SRS PDF
                                <ImageIcon size={18} />
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

            <div className="flex-1 px-6 pb-12 overflow-hidden flex flex-col items-center justify-center relative">
                 {loading && !diagrams && (
                    <div className="flex flex-col items-center justify-center gap-8 animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Workflow size={40} className="text-purple-500" />
                        </div>
                        <div className="text-center space-y-2">
                             <h3 className="text-white font-slate-bold text-xl">Drafting Visualizations</h3>
                            <p className="text-zinc-500">Generating PlantUML syntax...</p>
                        </div>
                    </div>
                )}

                {diagrams && slides.length > 0 && (
                    <div className="relative w-full max-w-5xl h-full flex flex-col items-center">
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
                        <div className="flex-1 relative overflow-hidden w-full max-h-[70vh]">
                            {slides.map((slide, index) => (
                                <div
                                    key={slide.id}
                                    className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${index === currentSlide
                                        ? "opacity-100 translate-x-0 scale-100"
                                        : "opacity-0 translate-x-12 scale-95 pointer-events-none"
                                        }`}
                                >
                                    <DiagramCard
                                        title={slide.title}
                                        gradient={slide.gradient}
                                        rawLink={slide.imageSrc}
                                    >
                                        {slide.imageSrc ? (
                                            <img src={slide.imageSrc} alt={slide.title} className="max-w-full max-h-full object-contain p-4 filter invert brightness-90 hue-rotate-180" />
                                        ) : (
                                           <div className="flex flex-col items-center justify-center gap-4 text-zinc-500">
                                               <Loader2 size={32} className="animate-spin" />
                                               <span>Rendering diagram from syntax...</span>
                                            </div>
                                        )}
                                    </DiagramCard>
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
                {diagrams && slides.length === 0 && (
                     <div className="text-zinc-500">No specific diagram blocks detected. The agent may have returned raw text. Check the final output doc.</div>
                )}
            </div>
        </div>
    );
}
