import React from 'react';
import { Cpu, Database, Activity } from 'lucide-react';
import { HostStats } from '../types/monitor';

interface ServerCardProps {
    data: HostStats;
    isOffline: boolean;
}

export const ServerCard: React.FC<ServerCardProps> = ({ data, isOffline }) => {
    return (
        <div className={`p-6 rounded-3xl border transition-all duration-700 ${
            isOffline ? 'bg-zinc-900 border-zinc-800 opacity-40' : 'bg-zinc-900 border-zinc-700 hover:border-blue-500 shadow-2xl shadow-blue-500/10'
        }`}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOffline ? 'bg-zinc-800' : 'bg-blue-500/10 text-blue-400'}`}>
                        <Activity size={20} />
                    </div>
                    <span className="font-mono font-bold text-lg tracking-tight text-zinc-100">{data.host_id}</span>
                </div>
                <div className={`h-2 w-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-zinc-500">
                        <span className="flex items-center gap-1"><Cpu size={12}/> CPU</span>
                        <span>{data.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${data.cpu}%` }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-zinc-500">
                        <span className="flex items-center gap-1"><Database size={12}/> MEMORY</span>
                        <span>{data.memory.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${data.memory}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};