import React from 'react';
// 1. 引用自定义 Hook
import { useMonitor } from './hooks/useMonitor';
// 2. 引用 UI 组件
import { ServerCard } from './components/ServerCard';
// 3. 引用图标（增加点设计感）
import {LayoutDashboard, ShieldCheck, RefreshCw, Activity} from 'lucide-react';

const App: React.FC = () => {
    // 使用我们封装好的逻辑，连接到 Go 后端
    const { hosts, now } = useMonitor('ws://localhost:8080/ws');

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-blue-500/30">
            {/* 顶部导航栏 */}
            <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
                            <LayoutDashboard size={20} className="text-white" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">Gemini Monitor <span className="text-zinc-500 font-normal ml-2 text-sm">v1.0</span></h1>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            系统状态: 正常
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <RefreshCw size={16} className="animate-spin-slow" />
                            实时同步中
                        </div>
                    </div>
                </div>
            </nav>

            {/* 主体内容区 */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {hosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hosts.map((host) => (
                            <ServerCard
                                key={host.host_id}
                                data={host}
                                // 10秒没收到数据即视为离线
                                isOffline={now - host.updated_at > 10}
                            />
                        ))}
                    </div>
                ) : (
                    /* 空状态展示 */
                    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl">
                        <div className="bg-zinc-900 p-4 rounded-full mb-4">
                            <Activity className="text-zinc-700 w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-medium text-zinc-300">暂无监控节点</h2>
                        <p className="text-zinc-500 mt-2 text-sm">请确保后端已启动并至少有一个 Agent 在运行</p>
                        <code className="mt-6 px-4 py-2 bg-zinc-900 rounded-lg text-xs text-blue-400 border border-zinc-800">
                            awaiting_connection: ws://localhost:8080/ws
                        </code>
                    </div>
                )}
            </main>

            {/* 页脚状态栏 */}
            <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest">
                <div>Node 24.8.0 Environment</div>
                <div>Go Backend Core</div>
            </footer>
        </div>
    );
};

export default App;