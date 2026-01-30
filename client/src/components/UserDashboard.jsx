import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Cpu, Sparkles, StopCircle, ChevronRight, Mic } from "lucide-react";
import { motion } from "framer-motion";
import ChatMessage from "../UI/ChatMessage";
import LineReveal from "../UI/LineReveal";

const API = "http://localhost:8000/stakeholder";

export default function UserDashboard() {
    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState(null);
    const [chat, setChat] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [typingId, setTypingId] = useState(null);
    const chatContainerRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chat, loading]);

    // 1️⃣ START OR RESUME SESSION
    useEffect(() => {
        const initSession = async () => {
            const existingId = sessionStorage.getItem("sessionId");

            if (existingId) {
                // Try resuming
                try {
                    const res = await fetch(`${API}/chat?session_id=${existingId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSessionId(existingId);
                        // Map backend format (role/content) to frontend format (id/role/text)
                        setChat(data.chat.map((msg, i) => ({
                            id: i,
                            role: msg.role,
                            text: msg.content
                        })));
                        return;
                    }
                    // If 404, session invalid, fall through to create new
                } catch (e) {
                    console.warn("Failed to resume session", e);
                }
            }

            // Start new session
            try {
                const res = await fetch(`${API}/start`, { method: "POST" });
                const data = await res.json();
                sessionStorage.setItem("sessionId", data.session_id);
                setSessionId(data.session_id);
                setChat([{ id: Date.now(), role: "assistant", text: data.question }]);
            } catch (err) {
                console.error("Failed to start session:", err);
            }
        };
        initSession();
    }, []);

    // 2️⃣ SEND ANSWER USING SESSION ID
    const sendAnswer = async () => {
        if (!input.trim() || !sessionId || loading) return;

        const userText = input;
        setChat((c) => [...c, { id: `user-${Date.now()}`, role: "user", text: userText }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(
                `${API}/answer?session_id=${sessionId}&answer=${encodeURIComponent(userText)}`,
                { method: "POST" }
            );
            const data = await res.json();
            const assistantText = data.question ?? data.message ?? "";

            if (assistantText) {
                const id = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                setChat((c) => [...c, { id, role: "assistant", text: assistantText }]);
                setTypingId(id);
            }
        } catch (error) {
            console.error("Error sending answer:", error);
            setChat((c) => [...c, { id: Date.now(), role: "error", text: "Connection error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    // STT Logic
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser does not support Speech Recognition");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                setInput(prev => prev + (prev ? " " : "") + lastResult[0].transcript);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto relative">
            {/* Header / Context */}
            <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Cpu className="text-blue-400" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-slate-bold text-white">Requirement Discovery Agent</h1>
                        <p className="text-xs text-zinc-500 font-slate">AI-powered stakeholder interview session</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            // "Saving" is effectively just keeping the ID in history.
                            // We can just clear the current session ID from storage to "close" it and return to home
                            sessionStorage.removeItem("sessionId");
                            // Optionally redirect to dashboard/home
                            window.location.href = "/dashboard";
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-slate-medium rounded-lg transition-colors border border-white/5"
                    >
                        Save & Exit
                    </button>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-slate-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Active Session
                    </div>
                </div>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 overflow-hidden bg-[#0A0A0A] border border-white/5 rounded-2xl relative shadow-2xl">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                <div
                    ref={chatContainerRef}
                    className="h-full overflow-y-auto p-6 pb-32 space-y-6 scroll-smooth"
                >
                    {chat.length === 0 && (
                        <div className="h-full flex items-center justify-center opacity-50">
                            <Cpu size={48} className="text-zinc-700" />
                        </div>
                    )}

                    {chat.map((m) => (
                        <ChatMessage key={m.id} role={m.role}>
                            {m.role === "assistant" && m.id === typingId ? (
                                <LineReveal text={m.text} />
                            ) : (
                                m.text
                            )}
                        </ChatMessage>
                    ))}

                    {loading && (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs px-4 animate-pulse">
                            <Sparkles size={14} />
                            <span>Agent is analyzing...</span>
                        </div>
                    )}
                </div>

                {/* INPUT AREA */}
                {/* INPUT AREA / NAVIGATION */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/5">
                    {chat.some(m => m.text && m.text.includes("Questioning complete")) ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0)", "0 0 0 10px rgba(59, 130, 246, 0.2)", "0 0 0 20px rgba(59, 130, 246, 0)"] }}
                                transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                                onClick={() => navigate("/validator")}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-slate-bold text-lg shadow-2xl flex items-center gap-3"
                            >
                                <Sparkles className="fill-white" />
                                Proceed to Validation
                                <ChevronRight />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="relative flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                                {isRecording && (
                                    <div className="absolute top-[-20px] left-4 flex gap-1 h-3 items-end">
                                        <span className="w-1 bg-red-500 animate-[bounce_1s_infinite] h-2 rounded-full" />
                                        <span className="w-1 bg-red-500 animate-[bounce_1.2s_infinite] h-3 rounded-full" />
                                        <span className="w-1 bg-red-500 animate-[bounce_0.8s_infinite] h-2 rounded-full" />
                                        <span className="text-xs text-red-500 ml-1 font-slate-bold">Recording...</span>
                                    </div>
                                )}
                                <button
                                    onClick={toggleRecording}
                                    className={`p-3 rounded-lg transition-all ${isRecording
                                        ? "bg-red-500/20 text-red-500 animate-pulse"
                                        : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                                        }`}
                                >
                                    {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
                                </button>

                                <textarea
                                    className="flex-1 bg-transparent px-4 py-3 outline-none font-slate text-sm text-white placeholder-zinc-500 resize-none h-12 min-h-[48px] max-h-32 scrollbar-thin scrollbar-thumb-zinc-700"
                                    placeholder="Type or speak..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendAnswer();
                                        }
                                    }}
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    onClick={sendAnswer}
                                    disabled={!input.trim() || loading}
                                    className={`p-3 rounded-lg transition-all ${input.trim() && !loading
                                        ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10"
                                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        }`}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-slate text-center mt-3">
                                AI can make mistakes. Please review critical requirements.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
