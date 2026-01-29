export interface DiskInfo {
    path: string;
    used_percent: number;
    total_gb: number;
}

export interface HostStats {
    host_id: string;

    // System Info
    hostname?: string;
    os?: string;
    arch?: string;
    platform?: string;
    version?: string;

    // Resources
    uptime: number;
    cpu: number;
    load_1: number;
    load_5: number;   // New
    load_15: number;  // New
    memory: number;   // % used
    mem_used?: number;
    mem_total?: number;
    swap_used?: number; // New
    swap_total?: number; // New

    disks: DiskInfo[];

    // Network
    net_sent: number;
    net_recv: number;
    net_in_speed?: number;  // New
    net_out_speed?: number; // New

    updated_at: number;
}

export interface MonitorData {
    hosts: HostStats[];
    onlineCount: number;
}