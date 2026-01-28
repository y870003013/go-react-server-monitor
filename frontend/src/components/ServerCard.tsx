import React from 'react';
import { Cpu, Database, Activity, HardDrive } from 'lucide-react';
import { HostStats } from '../types/monitor';
import { SciFiCard } from './ui/SciFiCard';
import { motion } from 'framer-motion';

interface ServerCardProps {
    data: HostStats;
    isOffline: boolean;
}

export const ServerCard: React.FC<ServerCardProps> = ({ data, isOffline }) => {
    return (
        <SciFiCard
            neonColor={isOffline ? 'red' : 'cyan'}
            className={`h-full ${isOffline ? 'opacity-60 grayscale' : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOffline ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-sci-cyan)]/10 text-[var(--color-sci-cyan)]'}`}>
                        <Activity size={20} className={!isOffline ? "animate-pulse" : ""} />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">HOST_ID</div>
                        <div className="font-mono font-bold text-lg tracking-tight text-white shadow-glow">{data.host_id}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`h-2 w-2 rounded-full mb-1 shadow-[0_0_8px] ${isOffline ? 'bg-red-500 shadow-red-500' : 'bg-green-500 shadow-green-500 animate-pulse'}`} />
                    <span className={`text-[10px] font-bold ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
                        {isOffline ? 'OFFLINE' : 'ONLINE'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-5">
                {/* CPU */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-400 font-mono">
                        <span className="flex items-center gap-2"><Cpu size={14} className="text-[var(--color-sci-purple)]" /> CORE_PROCESSOR</span>
                        <span className="text-white">{data.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.cpu}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="h-full bg-[var(--color-sci-purple)] shadow-[0_0_10px_var(--color-sci-purple)]"
                        />
                    </div>
                </div>

                {/* MEMORY */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-400 font-mono">
                        <span className="flex items-center gap-2"><Database size={14} className="text-[var(--color-sci-green)]" /> MEMORY_MODULE</span>
                        <span className="text-white">{data.memory.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.memory}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                            className="h-full bg-[var(--color-sci-green)] shadow-[0_0_10px_var(--color-sci-green)]"
                        />
                    </div>
                </div>

                {/* DISKS */}
                {data.disks && data.disks.map((disk, index) => (
                    <div key={disk.path || index} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-zinc-400 font-mono">
                            <span className="flex items-center gap-2 truncate max-w-[150px]" title={disk.path}>
                                <HardDrive size={14} className="text-[var(--color-sci-cyan)]" />
                                {disk.path === '/' ? 'ROOT_DSK' : disk.path.toUpperCase()}
                            </span>
                            <span className="text-white">{disk.used_percent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${disk.used_percent}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                                className={`h-full shadow-[0_0_10px] ${disk.used_percent > 85 ? 'bg-red-500 shadow-red-500' : 'bg-[var(--color-sci-cyan)] shadow-[var(--color-sci-cyan)]'}`}
                            />
                        </div>
                        <div className="flex justify-end text-[10px] text-zinc-600 font-mono">
                            {disk.total_gb.toFixed(0)} GB TOTAL
                        </div>
                    </div>
                ))}

                {/* Decorative Data Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-600 font-mono">
                    <span>UPTIME: {(data.uptime / 3600).toFixed(1)}H</span>
                    <span className="flex items-center gap-1">LOAD: {data.load_1.toFixed(2)}</span>
                </div>
            </div>
        </SciFiCard>
    );
};