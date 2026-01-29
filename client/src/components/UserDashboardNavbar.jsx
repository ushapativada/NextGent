import { ChevronDown, LogOut, LayoutGrid, FileCheck, Code2, FileText, Bot } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from '../assets/Logos/Logo.svg';

export default function UserDashboardNavbar() {
    const navigate = useNavigate();

    const handleSignOut = () => {
        // Clear any auth tokens
        localStorage.removeItem("authToken");
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-30 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Left: Logo */}
                <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-9 h-9 flex items-center justify-center bg-zinc-900 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <span className="text-zinc-200 font-slate-medium text-sm tracking-wide group-hover:text-white transition-colors">
                        NextGent
                    </span>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden md:block absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center p-1 bg-zinc-900/50 border border-white/5 rounded-full backdrop-blur-sm">
                        {[
                            { path: "/dashboard", label: "Agent", icon: Bot },
                            { path: "/validator", label: "Validator", icon: FileCheck },
                            { path: "/developer", label: "Developer", icon: Code2 },
                            { path: "/output", label: "Output", icon: FileText }
                        ].map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `relative px-4 py-2 rounded-full flex items-center gap-2 text-xs font-slate-medium transition-all duration-300 ${isActive
                                        ? "text-black bg-white shadow-lg shadow-white/5"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                                    }`
                                }
                            >
                                <item.icon size={14} className="opacity-80" />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Right: User Actions */}
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => navigate("/profile")}
                        className="hidden md:flex items-center gap-3 pr-4 border-r border-white/5 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right">
                            <p className="text-xs font-slate-medium text-zinc-300">Demo User</p>
                            <p className="text-[10px] font-slate text-zinc-500">Free Plan</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                            DU
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </div>
        </header>
    );
}
