import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MessageSquare, CheckCircle, Construction, ChevronRight, User } from "lucide-react";

const API = "http://localhost:8000/stakeholder";

export default function UserProfile() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/sessions`)
            .then(res => res.json())
            .then(data => {
                setSessions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch sessions", err);
                setLoading(false);
            });
    }, []);

    const resumeSession = (session) => {
        sessionStorage.setItem("sessionId", session.session_id);

        // Intelligent routing based on status
        if (session.status === "questioning" || session.status === "refining") {
            navigate("/dashboard");
        } else if (session.status === "validating") {
            navigate("/validator");
        } else if (session.status === "finalized" || session.status === "developing") {
            // User can choose, but let's send to developer output or validation result
            navigate("/developer");
        } else {
            navigate("/dashboard");
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "questioning": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "validating": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "finalized": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "developing": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-4">
            <div className="flex items-center gap-4 mb-8 px-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center border-4 border-black shadow-xl">
                    <User size={32} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-slate-bold text-white">Your Workspace</h1>
                    <p className="text-zinc-500 font-slate">Manage your active projects and interview sessions</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                {loading && (
                    <div className="text-center text-zinc-500 py-10">Loading your history...</div>
                )}

                {!loading && sessions.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                        <MessageSquare size={48} className="mx-auto text-zinc-700 mb-4" />
                        <h3 className="text-zinc-400 font-slate-medium">No active sessions</h3>
                        <p className="text-zinc-600 text-sm mb-6">Start a new project from the dashboard.</p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-white text-black px-6 py-2 rounded-lg font-slate-bold hover:bg-zinc-200 transition-colors"
                        >
                            Start New Project
                        </button>
                    </div>
                )}

                {sessions.map((session) => (
                    <div
                        key={session.session_id}
                        onClick={() => resumeSession(session)}
                        className="group bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-blue-500/30 rounded-xl p-5 cursor-pointer transition-all duration-300 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-zinc-500 group-hover:text-blue-400 transition-colors">
                                {session.status === 'questioning' && <MessageSquare size={18} />}
                                {session.status === 'validating' && <Construction size={18} />}
                                {(session.status === 'finalized' || session.status === 'developing') && <CheckCircle size={18} />}
                            </div>
                            <div>
                                <h3 className="text-zinc-200 font-slate-medium text-sm group-hover:text-white mb-1">
                                    Project {session.session_id.slice(0, 8)}...
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDate(session.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(session.status)}`}>
                                {session.status}
                            </span>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
