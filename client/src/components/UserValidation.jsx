import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileCheck, AlertCircle, RefreshCw, Send, CheckCircle, ShieldAlert, ArrowLeft, X } from "lucide-react";
import ChatMessage from "../UI/ChatMessage";
import ProblemOverview from "../UI/ProblemRefined";

const API = "http://localhost:8000/validator";

export default function UserValidation() {
    const navigate = useNavigate();
    const sessionId = sessionStorage.getItem("sessionId");

    const [chat, setChat] = useState([]);
    const [info, setInfo] = useState(null);
    const [input, setInput] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [finalResult, setFinalResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const chatEndRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    // 1️⃣ START VALIDATION (auto)
    useEffect(() => {
        if (!sessionId) {
            setError("No active session found. Please start a new session from the dashboard.");
            return;
        }

        const initValidation = async () => {
            try {
                const res = await fetch(`${API}/start?session_id=${sessionId}`, { method: "POST" });

                if (!res.ok) {
                    if (res.status === 404) throw new Error("Session expired or invalid.");
                    throw new Error("Failed to connect to validation service.");
                }

                const data = await res.json();
                setInfo(data.refined_problem);
                setChat([{ id: Date.now(), role: "assistant", text: data.message }]);
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        initValidation();
    }, [sessionId]);

    // 2️⃣ CHAT
    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const msg = input;
        setInput("");
        setLoading(true);
        setChat(c => [...c, { id: `user-${Date.now()}`, role: "user", text: msg }]);

        try {
            const res = await fetch(
                `${API}/chat?session_id=${sessionId}&message=${encodeURIComponent(msg)}`,
                { method: "POST" }
            );

            if (!res.ok) throw new Error("Failed to send message");

            const data = await res.json();
            setChat(c => [...c, {
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: "assistant",
                text: data.reply
            }]);
        } catch (err) {
            console.error(err);
            setChat(c => [...c, { id: Date.now(), role: "error", text: "Error sending message. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    // 3️⃣ FINALIZE
    const finalize = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API}/finalize?session_id=${sessionId}`,
                { method: "POST" }
            );
            const data = await res.json();

            setFinalResult(data);
            setShowResult(true);
        } catch (err) {
            console.error(err);
            // Show toast or error message
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 mb-6">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-slate-bold text-white mb-2">Connection Error</h2>
                    <p className="text-zinc-400 font-slate">{error}</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-slate-medium transition-colors"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] max-w-5xl mx-auto flex gap-6">

            {/* LEFT: Info Panel (Refined Problem) */}
            <div className="w-1/3 hidden lg:block h-full overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl">
                <div className="p-4 border-b border-white/5 bg-black/20">
                    <h2 className="font-slate-bold text-zinc-300 flex items-center gap-2">
                        <FileCheck size={18} className="text-blue-400" />
                        Current Specs
                    </h2>
                </div>
                <div className="h-full overflow-y-auto p-4 pb-20 scrollbar-thin scrollbar-thumb-zinc-800">
                    {info ? (
                        <ProblemOverview data={info} compact={true} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-zinc-500 animate-pulse">
                            <RefreshCw size={24} className="animate-spin mb-2" />
                            Loading specs...
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Chat Interface */}
            <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-2xl relative shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/developer")}
                            className="p-2 -ml-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            title="Back to Developer"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-slate-bold text-white text-lg">Spec Validator</h1>
                            <p className="text-xs text-zinc-500 font-slate">Refine requirements with AI</p>
                        </div>
                    </div>
                    <button
                        onClick={finalize}
                        disabled={loading}
                        className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/20 px-4 py-2 rounded-lg text-xs font-slate-bold transition-all flex items-center gap-2"
                    >
                        <CheckCircle size={14} />
                        Finalize Specs
                    </button>
                </div>

                {/* Chat Details */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-gradient-to-b from-blue-900/5 to-transparent">
                    {/* Mobile Info View (Only visible on small screens) */}
                    <div className="lg:hidden mb-6 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <h3 className="text-xs font-slate-bold text-zinc-400 uppercase mb-2">Current Context</h3>
                        {info ? <ProblemOverview data={info} compact={true} /> : <div className="h-20 animate-pulse bg-zinc-800 rounded-lg"></div>}
                    </div>

                    {chat.map((m, i) => (
                        <ChatMessage key={m.id || i} role={m.role}>
                            {m.text}
                        </ChatMessage>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/5">
                    <div className="relative flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                        <input
                            className="flex-1 bg-transparent px-4 py-3 outline-none font-slate text-sm text-white placeholder-zinc-500"
                            placeholder="Suggest a correction or ask for clarification..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className={`p-3 rounded-lg transition-all ${input.trim() && !loading
                                ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* FINAL RESULT MODAL */}
            {showResult && finalResult && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-zinc-800 p-8 rounded-2xl w-full max-w-lg max-h-[90vh] shadow-2xl relative flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500" />

                        <button
                            onClick={() => setShowResult(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* HEADER */}
                        <div className="flex items-start justify-between mb-6 shrink-0 mt-2">
                            <div>
                                <h2 className="text-2xl font-slate-bold text-white mb-1">Validation Result</h2>
                                <p className="text-zinc-500 text-sm">Review the final assessment</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-slate-bold border ${finalResult?.validation_result?.feasible
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                {finalResult?.validation_result?.feasible ? "FEASIBLE" : "NEEDS REVISION"}
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 flex-1">
                            <div className="space-y-2">
                                <h3 className="text-xs font-slate-bold text-zinc-400 uppercase flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-yellow-500" />
                                    Risk Assessment
                                </h3>
                                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                    {finalResult?.validation_result?.key_risks?.length ? (
                                        <ul className="list-disc list-inside text-sm text-zinc-300 space-y-2">
                                            {finalResult.validation_result.key_risks.map((risk, i) => (
                                                <li key={i}>{risk}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-zinc-500 italic">No critical risks identified.</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xs font-slate-bold text-zinc-400 uppercase">Final Notes</h3>
                                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                    {finalResult?.validation_result?.final_notes}
                                </p>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-8 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setShowResult(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-slate-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Continue Editing
                            </button>
                            <button
                                onClick={() => navigate("/output")}
                                className="px-5 py-2.5 bg-white text-black rounded-xl text-sm font-slate-bold hover:bg-zinc-200 transition-colors"
                            >
                                Proceed to Output
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
