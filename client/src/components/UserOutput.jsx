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

    // Save Project Logic
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [filename, setFilename] = useState("");

    const openSaveModal = () => {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        setFilename(`NextGent_Project_${formattedDate}_${formattedTime}`);
        setShowSaveModal(true);
    };

    const handleSaveFile = () => {
        if (!filename) return;

        // Determine content to save
        // If data is available, save it. If not, maybe save a placeholder or nothing?
        // Assuming we save the currently visible data.
        const content = data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : "No content loaded.";
        const extension = typeof data === 'string' ? 'md' : 'json'; // Default to json if object

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowSaveModal(false);
    };

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
                        {data && (
                            <button
                                onClick={openSaveModal}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-slate-medium text-sm flex items-center gap-2 transition-colors border border-white/10"
                            >
                                <FileText size={16} />
                                Save Project
                            </button>
                        )}
                        <button
                            onClick={() => {
                                sessionStorage.removeItem("sessionId");
                                window.location.href = "/profile";
                            }}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-slate-medium text-sm transition-colors shadow-lg shadow-green-500/20"
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
                            className={`px-4 py-2 rounded-l-lg text-sm font-slate-medium transition-colors
                                ${activeView === "developer"
                                    ? "bg-yellow-400 text-black border-y border-l border-yellow-400"
                                    : "bg-zinc-800 text-white hover:bg-zinc-700 border-y border-l border-zinc-700"}`}
                        >
                            Developer Output
                        </button>
                        <button
                            onClick={() => {
                                fetchOutput("developer").then(() => openSaveModal());
                            }}
                            className={`px-3 py-2 rounded-r-lg text-sm font-slate-medium border-l border-black/10 transition-colors
                                ${activeView === "developer"
                                    ? "bg-yellow-400 text-black border-y border-r border-yellow-400 hover:bg-yellow-500"
                                    : "bg-zinc-800 text-white border-y border-r border-zinc-700 hover:bg-zinc-700"}`}
                            title="Download Developer Output"
                        >
                            <FileText size={14} />
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchOutput("stakeholder")}
                            className={`px-4 py-2 rounded-l-lg text-sm font-slate-medium transition-colors
                                ${activeView === "stakeholder"
                                    ? "bg-yellow-400 text-black border-y border-l border-yellow-400"
                                    : "bg-zinc-800 text-white hover:bg-zinc-700 border-y border-l border-zinc-700"}`}
                        >
                            Stakeholder Output
                        </button>
                        <button
                            onClick={() => {
                                fetchOutput("stakeholder").then(() => openSaveModal());
                            }}
                            className={`px-3 py-2 rounded-r-lg text-sm font-slate-medium border-l border-black/10 transition-colors
                                ${activeView === "stakeholder"
                                    ? "bg-yellow-400 text-black border-y border-r border-yellow-400 hover:bg-yellow-500"
                                    : "bg-zinc-800 text-white border-y border-r border-zinc-700 hover:bg-zinc-700"}`}
                            title="Download Stakeholder Output"
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

            {/* SAVE PROJECT MODAL */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setShowSaveModal(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-slate-bold text-white mb-2">Save Output</h2>
                        <p className="text-zinc-500 text-sm mb-6">Name your file (saved as .json or .md based on content).</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-slate-bold text-zinc-400 uppercase mb-2">Filename</label>
                                <input
                                    value={filename}
                                    onChange={(e) => setFilename(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-slate"
                                    placeholder="e.g. NextGent_Output"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm font-slate-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveFile}
                                    disabled={!filename.trim()}
                                    className="px-5 py-2.5 bg-white text-black rounded-xl text-sm font-slate-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
