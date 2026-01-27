export interface HostStats {
    host_id: string;
    cpu: number;
    memory: number;
    updated_at: number; // 后端传来的 Unix 时间戳
}

export interface MonitorData {
    hosts: HostStats[];
    onlineCount: number;
}