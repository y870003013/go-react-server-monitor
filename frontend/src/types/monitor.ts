export interface DiskInfo {
    path: string;
    used_percent: number;
    total_gb: number;
}

export interface HostStats {
    host_id: string;
    uptime: number;
    cpu: number;
    load_1: number;
    memory: number;
    disks: DiskInfo[];
    net_sent: number;
    net_recv: number;
    updated_at: number; // 后端传来的 Unix 时间戳
}

export interface MonitorData {
    hosts: HostStats[];
    onlineCount: number;
}