import { useEffect, useState, useRef } from "react";
import { Send, Cpu, Sparkles, StopCircle } from "lucide-react";
import ChatMessage from "../UI/ChatMessage";
import LineReveal from "../UI/LineReveal";

const API = "http://localhost:8000/stakeholder";

export default function UserDashboard() {
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
                <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0A0A0A]/90 backdrop-blur-md border-t border-white/5">
                    <div className="relative flex items-center gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                        <input
                            className="flex-1 bg-transparent px-4 py-3 outline-none font-slate text-sm text-white placeholder-zinc-500"
                            placeholder="Type your requirements or answer the question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
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
                </div>
            </div>
        </div>
    );
}
