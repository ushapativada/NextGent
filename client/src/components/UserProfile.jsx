import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MessageSquare, CheckCircle, Construction, ChevronRight, User, SortDesc, Filter, Plus } from "lucide-react";

const API = "http://localhost:8000/stakeholder";

export default function UserProfile() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest", "status"

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
            navigate("/developer");
        } else {
            navigate("/dashboard");
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "questioning": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            case "validating": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
            case "finalized": return "text-green-400 bg-green-500/10 border-green-500/20";
            case "developing": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
            default: return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
        }
    };

    // Sorting Logic
    const sortedSessions = [...sessions].sort((a, b) => {
        if (sortOrder === "newest") {
            return new Date(b.updated_at) - new Date(a.updated_at);
        } else if (sortOrder === "oldest") {
            return new Date(a.updated_at) - new Date(b.updated_at);
        } else if (sortOrder === "status") {
            return a.status.localeCompare(b.status);
        }
        return 0;
    });

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col pt-6 px-6">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <User size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-slate-bold text-white tracking-tight">Your Workspace</h1>
                        <p className="text-zinc-400 font-slate text-sm mt-1">Manage your active projects and history</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-slate-medium text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
                            <SortDesc size={16} />
                            <span>Sort: <span className="text-white capitalize">{sortOrder}</span></span>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute top-full right-0 mt-2 w-40 bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                            {[
                                { id: "newest", label: "Newest First" },
                                { id: "oldest", label: "Oldest First" },
                                { id: "status", label: "By Status" }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortOrder(opt.id)}
                                    className={`w-full text-left px-4 py-3 text-sm font-slate hover:bg-zinc-900 transition-colors ${sortOrder === opt.id ? "text-blue-400 bg-blue-500/5" : "text-zinc-400"}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="bg-white text-black px-5 py-2.5 rounded-xl font-slate-bold hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5 active:scale-95"
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-8 h-8 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
                        <p className="text-zinc-500 text-sm">Loading projects...</p>
                    </div>
                )}

                {!loading && sortedSessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <MessageSquare size={24} className="text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-slate-bold text-white mb-2">No active projects</h3>
                        <p className="text-zinc-500 text-sm mb-8 max-w-xs text-center">
                            Start your first AI-driven requirements engineering session today.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-slate-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Start New Project
                        </button>
                    </div>
                )}

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedSessions.map((session) => (
                        <div
                            key={session.session_id}
                            onClick={() => resumeSession(session)}
                            className="group relative bg-[#0A0A0A] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col h-[220px]"
                        >
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${session.status === 'questioning' ? 'bg-blue-500/10 text-blue-400' :
                                        session.status === 'validating' ? 'bg-yellow-500/10 text-yellow-400' :
                                            'bg-green-500/10 text-green-400'
                                    }`}>
                                    {session.status === 'questioning' && <MessageSquare size={20} />}
                                    {session.status === 'validating' && <Construction size={20} />}
                                    {(session.status === 'finalized' || session.status === 'developing') && <CheckCircle size={20} />}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(session.status)}`}>
                                    {session.status}
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="flex-1">
                                <h3 className="text-lg font-slate-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                                    Project {session.session_id.slice(0, 8)}
                                </h3>
                                <p className="text-zinc-500 text-xs font-slate leading-relaxed line-clamp-2">
                                    Last updated on {formatDate(session.updated_at)} at {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            {/* Card Footer */}
                            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <span className="font-slate-medium">Click to resume</span>
                                <div className="w-8 h-8 rounded-full bg-zinc-900 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-all">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
