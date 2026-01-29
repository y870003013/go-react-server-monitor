import React from 'react';
import { Cpu, Database, Activity, HardDrive, ArrowUp, ArrowDown, Box } from 'lucide-react';
import { HostStats } from '../types/monitor';
import { SciFiCard } from './ui/SciFiCard';
import { motion } from 'framer-motion';

interface ServerCardProps {
    data: HostStats;
    isOffline: boolean;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatSpeed = (bytesPerSec: number) => {
    return formatBytes(bytesPerSec) + '/s';
};

export const ServerCard: React.FC<ServerCardProps> = ({ data, isOffline }) => {
    // Calculate swap usage safely
    const swapPercent = data.swap_total && data.swap_total > 0 && data.swap_used
        ? (data.swap_used / data.swap_total) * 100
        : 0;

    return (
        <SciFiCard
            neonColor={isOffline ? 'red' : 'cyan'}
            className={`h-full ${isOffline ? 'opacity-60 grayscale' : ''}`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOffline ? 'bg-red-500/10 text-red-500' : 'bg-[var(--color-sci-cyan)]/10 text-[var(--color-sci-cyan)]'}`}>
                        {data.platform?.includes('win') ? <Box size={20} /> : <Activity size={20} className={!isOffline ? "animate-pulse" : ""} />}
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                            {data.hostname || 'HOST_ID'}
                        </div>
                        <div className="font-mono font-bold text-lg tracking-tight text-white shadow-glow truncate max-w-[120px]" title={data.host_id}>
                            {data.host_id}
                        </div>
                        {data.platform && (
                            <div className="text-[10px] text-zinc-600 font-mono">
                                {data.platform} {data.version} ({data.arch})
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`h-2 w-2 rounded-full mb-1 shadow-[0_0_8px] ${isOffline ? 'bg-red-500 shadow-red-500' : 'bg-green-500 shadow-green-500 animate-pulse'}`} />
                    <span className={`text-[10px] font-bold ${isOffline ? 'text-red-500' : 'text-green-500'}`}>
                        {isOffline ? 'OFF_LINE' : 'ON_LINE'}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono mt-1">
                        UP: {(data.uptime / 3600).toFixed(1)}H
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
                {/* CPU & Load */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-400 font-mono">
                        <span className="flex items-center gap-2"><Cpu size={14} className="text-[var(--color-sci-purple)]" /> CPU_LOAD</span>
                        <span className="text-white">{data.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.cpu}%` }}
                            className="h-full bg-[var(--color-sci-purple)] shadow-[0_0_10px_var(--color-sci-purple)]"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono pt-1">
                        <span>L1: {data.load_1.toFixed(2)}</span>
                        <span>L5: {data.load_5?.toFixed(2) || '-'}</span>
                        <span>L15: {data.load_15?.toFixed(2) || '-'}</span>
                    </div>
                </div>

                {/* MEMORY & SWAP */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-400 font-mono">
                        <span className="flex items-center gap-2"><Database size={14} className="text-[var(--color-sci-green)]" /> MEM_SWAP</span>
                        <span className="text-white">{data.memory.toFixed(1)}%</span>
                    </div>
                    {/* RAM */}
                    <div className="h-1.5 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5 mb-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.memory}%` }}
                            className="h-full bg-[var(--color-sci-green)] shadow-[0_0_10px_var(--color-sci-green)]"
                        />
                    </div>
                    {/* SWAP */}
                    <div className="h-1 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${swapPercent}%` }}
                            className="h-full bg-yellow-500/80"
                        />
                    </div>
                    <div className="flex justify-end text-[10px] text-zinc-600 font-mono">
                        SWAP: {formatBytes(data.swap_used || 0)} / {formatBytes(data.swap_total || 0)}
                    </div>
                </div>

                {/* NETWORK */}
                <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-white/5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                            <ArrowDown size={10} className="text-emerald-400" /> IN
                        </div>
                        <div className="text-xs font-bold text-white font-mono">
                            {formatSpeed(data.net_in_speed || 0)}
                        </div>
                        <div className="text-[10px] text-zinc-600">
                            {formatBytes(data.net_recv)}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end text-right">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                            OUT <ArrowUp size={10} className="text-blue-400" />
                        </div>
                        <div className="text-xs font-bold text-white font-mono">
                            {formatSpeed(data.net_out_speed || 0)}
                        </div>
                        <div className="text-[10px] text-zinc-600">
                            {formatBytes(data.net_sent)}
                        </div>
                    </div>
                </div>

                {/* DISKS */}
                <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {data.disks && data.disks.map((disk, index) => (
                        <div key={disk.path || index} className="space-y-0.5">
                            <div className="flex justify-between text-[10px] font-medium text-zinc-500 font-mono">
                                <span className="flex items-center gap-1 truncate max-w-[120px]" title={disk.path}>
                                    <HardDrive size={10} /> {disk.path === '/' ? 'ROOT' : disk.path}
                                </span>
                                <span>{disk.used_percent.toFixed(0)}%</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                                <div
                                    style={{ width: `${disk.used_percent}%` }}
                                    className={`h-full ${disk.used_percent > 85 ? 'bg-red-500' : 'bg-[var(--color-sci-cyan)]'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SciFiCard>
    );
};