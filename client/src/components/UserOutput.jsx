import { useEffect, useState } from "react";
import OutputViewer from "../UI/OutputViewer";
import { Copy, Check, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/output";

export default function UserOutput() {
    const sessionId = sessionStorage.getItem("sessionId");

    const [activeView, setActiveView] = useState(null); // "developer" | "stakeholder"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole") || "Stakeholder";

    const fetchOutput = async (type) => {
        if (!sessionId) return;

        setActiveView(type);
        setLoading(true);
        setError(null);
        setCopied(false);

        try {
            const res = await fetch(`${API}/${type}/${sessionId}`);
            if (!res.ok) throw new Error("Output not available");

            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!data) return;

        const formatOutput = (obj) => {
            let text = "";
            for (const [key, value] of Object.entries(obj)) {
                text += `## ${key.replace(/_/g, " ").toUpperCase()}\n`;
                if (Array.isArray(value)) {
                    text += value.map(item => `• ${item}`).join("\n");
                } else if (typeof value === "object" && value !== null) {
                    text += Object.entries(value)
                        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                        .join("\n");
                } else {
                    text += value;
                }
                text += "\n\n";
            }
            return text;
        };

        const textToCopy = formatOutput(data);
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const submitFeedback = async () => {
        if (!sessionId || !feedbackText.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API}/${sessionId}/feedback?feedback=${encodeURIComponent(feedbackText)}`, {
                method: "POST"
            });
            if (res.ok) {
                // Session is now back to 'developing', go to profile so dashboard doesn't start a new empty project
                sessionStorage.removeItem("sessionId");
                navigate("/profile");
            } else {
                setError("Failed to submit feedback.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-fetch developer output on load
    useEffect(() => {
        if (sessionId) {
            fetchOutput("developer");
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-black text-white flex justify-center px-4">
            <div className="w-full max-w-[1400px] pt-8 space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-slate-medium text-white">
                        Final Outputs
                    </h1>

                    <div className="flex gap-3">
                        <button
                            onClick={async () => {
                                if (!sessionId) return;
                                try {
                                    await fetch(`${API}/exit/${sessionId}`, { method: "POST" });
                                    sessionStorage.removeItem("sessionId");
                                    window.location.href = "/profile";
                                } catch (e) {
                                    window.location.href = "/profile";
                                }
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl font-slate-medium text-sm transition-colors border border-white/10"
                        >
                            Exit Project
                        </button>
                        <button
                            onClick={async () => {
                                if (!sessionId) return;
                                try {
                                    await fetch(`${API}/pause/${sessionId}`, { method: "POST" });
                                    sessionStorage.removeItem("sessionId");
                                    window.location.href = "/profile";
                                } catch (e) {
                                    window.location.href = "/profile";
                                }
                            }}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl font-slate-medium text-sm transition-colors border border-white/10"
                        >
                            Pause
                        </button>
                        <button
                            onClick={async () => {
                                if (!sessionId) return;
                                try {
                                    await fetch(`${API}/finish/${sessionId}`, { method: "POST" });
                                    sessionStorage.removeItem("sessionId");
                                    window.location.href = "/profile";
                                } catch (e) {
                                    window.location.href = "/profile";
                                }
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl font-slate-medium text-sm transition-colors shadow-lg shadow-green-500/20"
                        >
                            Finish Project
                        </button>
                    </div>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchOutput("developer")}
                            className={`px-4 py-2 rounded-l-xl text-sm font-slate-medium transition-colors
                                ${activeView === "developer"
                                    ? "bg-yellow-400 text-black border-y border-l border-yellow-400"
                                    : "bg-zinc-800 text-white hover:bg-zinc-700 border-y border-l border-zinc-700"}`}
                        >
                            Developer Output
                        </button>
                        <button
                            onClick={copyToClipboard}
                            disabled={activeView !== "developer" || !data}
                            className={`px-3 py-2 rounded-r-xl text-sm font-slate-medium border-l border-black/10 transition-colors
                                ${activeView === "developer"
                                    ? "bg-yellow-400 text-black border-y border-r border-yellow-400 hover:bg-yellow-500"
                                    : "bg-zinc-800 text-zinc-500 border-y border-r border-zinc-700"}`}
                            title="Copy Developer Text"
                        >
                            {copied && activeView === "developer" ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchOutput("stakeholder")}
                            className={`px-4 py-2 rounded-l-xl text-sm font-slate-medium transition-colors
                                ${activeView === "stakeholder"
                                    ? "bg-yellow-400 text-black border-y border-l border-yellow-400"
                                    : "bg-zinc-800 text-white hover:bg-zinc-700 border-y border-l border-zinc-700"}`}
                        >
                            Stakeholder Output
                        </button>
                        <button
                            onClick={copyToClipboard}
                            disabled={activeView !== "stakeholder" || !data}
                            className={`px-3 py-2 rounded-r-xl text-sm font-slate-medium border-l border-black/10 transition-colors
                                ${activeView === "stakeholder"
                                    ? "bg-yellow-400 text-black border-y border-r border-yellow-400 hover:bg-yellow-500"
                                    : "bg-zinc-800 text-zinc-500 border-y border-r border-zinc-700"}`}
                            title="Copy Stakeholder Text"
                        >
                            {copied && activeView === "stakeholder" ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 min-h-[300px]">

                    {loading && (
                        <p className="text-sm text-gray-400">
                            Loading output…
                        </p>
                    )}

                    {error && (
                        <p className="text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {!loading && data && <OutputViewer data={data} />}

                    {!loading && !data && !error && (
                        <p className="text-sm text-gray-500 italic">
                            Select an output to view.
                        </p>
                    )}

                </div>

                {/* STAKEHOLDER FEEDBACK SECTION */}
                {!loading && data && activeView === "stakeholder" && userRole === "Stakeholder" && (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mt-6 shadow-2xl">
                        <h2 className="text-lg font-slate-bold text-white mb-2">Request Revisions</h2>
                        <p className="text-zinc-400 text-sm mb-4 font-slate">
                            Is there anything missing or incorrect in the generated requirements? Provide feedback below, and the AI Developer will regenerate the documents.
                        </p>
                        <div className="relative">
                            <textarea
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="E.g., Please add a feature for password recovery..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-slate text-sm outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 min-h-[100px] resize-y"
                                disabled={isSubmitting}
                            />
                            <button
                                onClick={submitFeedback}
                                disabled={!feedbackText.trim() || isSubmitting}
                                className={`absolute bottom-3 right-3 px-4 py-2 rounded-lg font-slate-bold text-sm flex items-center gap-2 transition-all ${
                                    feedbackText.trim() && !isSubmitting
                                        ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg shadow-yellow-500/20"
                                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                }`}
                            >
                                {isSubmitting ? "Submitting..." : (
                                    <>
                                        Submit Feedback
                                        <Send size={14} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

            </div>


        </div>
    );
}
