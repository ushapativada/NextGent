import { useState } from "react";
import { ChevronDown, LogOut, LayoutGrid, FileCheck, Code2, FileText, Bot, Workflow, AlertTriangle } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from '../assets/Logos/Logo.svg';

export default function UserDashboardNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const userRole = localStorage.getItem("userRole") || "Stakeholder";

    const handleSignOut = () => {
        // Clear any auth tokens
        localStorage.removeItem("authToken");
        navigate("/");
    };

    return (
        <>
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

                {/* Center: Navigation - Only visible if active session AND not on profile page */}
                {/* Center: Navigation - Only visible active workspace pages (not profile) */}
                {location.pathname !== "/profile" && (
                    <nav className="hidden md:block absolute left-1/2 -translate-x-1/2">
                        <div className="flex items-center p-1 bg-zinc-900/50 border border-white/5 rounded-full backdrop-blur-sm">
                            {[
                                { path: "/dashboard", label: "Agent", icon: Bot, roles: ["Stakeholder", "Admin"] },
                                { path: "/validator", label: "Validator", icon: FileCheck, roles: ["Stakeholder", "Admin"] },
                                { path: "/developer", label: "Developer", icon: Code2, roles: ["Developer", "Admin"] },
                                { path: "/visualization", label: "Diagrams", icon: Workflow, roles: ["Developer", "Admin"] },
                                { path: "/output", label: "Output", icon: FileText, roles: ["Developer", "Stakeholder", "Admin"] }
                            ].filter(item => item.roles.includes(userRole)).map((item) => (
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
                )}

                {/* Right: User Actions */}
                <div className="flex items-center gap-4">
                    <div
                        onClick={() => navigate("/profile")}
                        className="hidden md:flex items-center gap-3 pr-4 border-r border-white/5 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right">
                            <p className="text-xs font-slate-medium text-zinc-300">User</p>
                            <p className="text-[10px] font-slate text-zinc-500">{userRole}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white border border-white/10 uppercase">
                            {userRole.substring(0, 2)}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
                    </button>
                </div>
            </div>
            </header>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#0A0A0A] border border-zinc-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl"
                        >
                            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                                <LogOut size={24} className="text-red-500 ml-1" />
                            </div>
                            
                            <h3 className="text-2xl font-slate-bold text-white mb-2">Sign Out?</h3>
                            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-slate">
                                Are you sure you want to sign out of NextGent? You will need to sign back in to access your workspaces.
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-sm font-slate-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-slate-bold transition-all shadow-lg shadow-red-500/20"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
