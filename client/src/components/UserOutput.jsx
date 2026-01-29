import { useEffect, useState } from "react";
import OutputViewer from "../UI/OutputViewer";
import { FileText, X } from "lucide-react";


const API = "http://localhost:8000/output";

export default function UserOutput() {
    const sessionId = sessionStorage.getItem("sessionId");

    const [activeView, setActiveView] = useState(null); // "developer" | "stakeholder"
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for modal removed as per PDF download request

    const fetchOutput = async (type) => {
        if (!sessionId) return;

        setActiveView(type);
        setLoading(true);
        setError(null);

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

    // Auto-fetch developer output on load
    useEffect(() => {
        if (sessionId) {
            fetchOutput("developer");
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-black text-white flex justify-center px-4">
            <div className="w-full max-w-4xl pt-20 space-y-6">

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
                            onClick={() => {
                                window.open(`${API}/download/developer/${sessionId}`, "_blank");
                            }}
                            className={`px-3 py-2 rounded-r-xl text-sm font-slate-medium border-l border-black/10 transition-colors
                                ${activeView === "developer"
                                    ? "bg-yellow-400 text-black border-y border-r border-yellow-400 hover:bg-yellow-500"
                                    : "bg-zinc-800 text-white border-y border-r border-zinc-700 hover:bg-zinc-700"}`}
                            title="Download Developer PDF"
                        >
                            <FileText size={14} />
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
                            onClick={() => {
                                window.open(`${API}/download/stakeholder/${sessionId}`, "_blank");
                            }}
                            className={`px-3 py-2 rounded-r-xl text-sm font-slate-medium border-l border-black/10 transition-colors
                                ${activeView === "stakeholder"
                                    ? "bg-yellow-400 text-black border-y border-r border-yellow-400 hover:bg-yellow-500"
                                    : "bg-zinc-800 text-white border-y border-r border-zinc-700 hover:bg-zinc-700"}`}
                            title="Download Stakeholder PDF"
                        >
                            <FileText size={14} />
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

            </div>


        </div>
    );
}
