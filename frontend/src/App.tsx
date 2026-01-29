import React from 'react';
import { useMonitor } from './hooks/useMonitor';
import { ServerCard } from './components/ServerCard';
import { LayoutDashboard, ShieldCheck, RefreshCw, Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const App: React.FC = () => {

    // Use dynamic WebSocket URL based on current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const { hosts, now } = useMonitor(wsUrl);

    return (
        <div className="min-h-screen text-zinc-100 selection:bg-[var(--color-sci-cyan)] selection:text-black">
            {/* Header */}
            <header className="border-b border-white/10 bg-zinc-900/20 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[var(--color-sci-cyan)] blur-md opacity-40 animate-pulse"></div>
                            <div className="relative bg-black/60 border border-[var(--color-sci-cyan)] p-2 rounded-lg">
                                <LayoutDashboard size={24} className="text-[var(--color-sci-cyan)]" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 font-[Orbitron]">
                                Gemini<span className="text-[var(--color-sci-cyan)]">Monitor</span>
                            </h1>
                            <div className="text-[10px] text-[var(--color-sci-cyan)] tracking-[0.3em] font-mono">SYSTEM STATUS: NOMINAL</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-mono hidden md:flex">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <ShieldCheck size={16} className="text-[var(--color-sci-green)]" />
                            <span>SECURE_LINK</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <RefreshCw size={16} className="animate-spin-slow text-[var(--color-sci-cyan)]" />
                            <span>SYNCING...</span>
                        </div>
                        <div className="px-3 py-1 bg-[var(--color-sci-purple)]/10 text-[var(--color-sci-purple)] border border-[var(--color-sci-purple)]/30 rounded text-xs">
                            BETA_v2.0
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 relative">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-[var(--color-sci-purple)]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-[var(--color-sci-cyan)]/5 rounded-full blur-3xl"></div>
                </div>

                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-[Orbitron] flex items-center gap-2">
                            <Terminal size={20} className="text-[var(--color-sci-cyan)]" />
                            ACTIVE NODES
                        </h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-[var(--color-sci-cyan)] to-transparent mt-2"></div>
                    </div>
                    <div className="font-mono text-xs text-zinc-500">
                        TOTAL_HOSTS: <span className="text-white text-lg font-bold">{hosts.length}</span>
                    </div>
                </div>

                {hosts.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ staggerChildren: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {hosts.map((host) => (
                            <ServerCard
                                key={host.host_id}
                                data={host}
                                isOffline={now - host.updated_at > 10}
                            />
                        ))}
                    </motion.div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-40 border border-dashed border-white/10 rounded-3xl bg-black/20 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-zinc-900/80 p-6 rounded-full mb-6 border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                <Activity className="text-zinc-600 w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-300 font-[Orbitron]">NO SIGNAL</h2>
                            <p className="text-zinc-500 mt-2 font-mono text-sm max-w-md text-center">
                                No active agents detected. Check your neural connection or verify agent deployment status.
                            </p>
                            <code className="mt-8 px-6 py-3 bg-black/50 rounded-lg text-xs text-[var(--color-sci-cyan)] border border-[var(--color-sci-cyan)]/20 font-mono flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--color-sci-cyan)] animate-pulse"></span>
                                LISTENING ON ws://localhost:8080/ws ...
                            </code>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                <div className="flex gap-4">
                    <span>SYSTEM_ID: G-9000</span>
                    <span>LATENCY: 12ms</span>
                </div>
                <div>POWERED BY ANTHROPIC CORE</div>
            </footer>
        </div>
    );
};

export default App;