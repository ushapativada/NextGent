import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

export default function ChatMessage({ role, children }) {
    const isAssistant = role === "assistant";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"}`}
        >
            <div className={`flex max-w-[80%] gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}>

                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${isAssistant
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                    }`}>
                    {isAssistant ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div
                    className={`px-5 py-3.5 rounded-2xl text-sm font-slate leading-relaxed shadow-sm ${isAssistant
                            ? "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none"
                            : "bg-white text-black font-slate-medium rounded-tr-none shadow-white/5"
                        }`}
                >
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
