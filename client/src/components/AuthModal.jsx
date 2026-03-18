import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Stakeholder");
  const [error, setError] = useState(null);

  // Real Login Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "/login" : "/register";
    const payload = isLogin 
      ? { email, password } 
      : { email, password, full_name: name, role: role };

    try {
      const res = await fetch(`http://127.0.0.1:8000/auth${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      // Secure successful login
      localStorage.setItem("authToken", data.access_token || "authenticated");
      localStorage.setItem("userEmail", data.email || email);
      localStorage.setItem("userRole", data.role || "Stakeholder");
      
      onClose();
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit z-50 p-6"
          >
            <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
              {/* Background gradient blob */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-slate-bold text-white mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-zinc-400 font-slate text-sm">
                  {isLogin
                    ? "Enter your credentials to access your workspace."
                    : "Join NextGent and start architecting the future."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-slate flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>{error}</span>
                    </div>
                )}
                
                {!isLogin && (
                  <>
                      <div className="space-y-1">
                        <label className="text-xs font-slate-medium text-zinc-500 uppercase tracking-wider">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-slate"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-slate-medium text-zinc-500 uppercase tracking-wider">
                              Account Role
                          </label>
                          <div className="relative">
                              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                              <select
                                  value={role}
                                  onChange={(e) => setRole(e.target.value)}
                                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-slate appearance-none cursor-pointer"
                              >
                                  <option value="Stakeholder">Stakeholder</option>
                                  <option value="Developer">Developer</option>
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-500"></div>
                          </div>
                      </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-slate-medium text-zinc-500 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-slate"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-slate-medium text-zinc-500 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-10 pr-12 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-slate"
                      required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                        tabIndex="-1"
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-slate-bold py-3 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Get Started"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-zinc-500 font-slate">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-white hover:underline font-slate-medium"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
