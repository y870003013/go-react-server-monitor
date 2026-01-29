package model

type DiskInfo struct {
	Path        string  `json:"path"`         // 挂载点，如 "/" 或 "C:"
	UsedPercent float64 `json:"used_percent"` // 使用率
	TotalGB     float64 `json:"total_gb"`     // 总大小
	UsedGB      float64 `json:"used_gb"`      // 已用大小 (Expanded for Nezha parity if needed, keeping simple matching existing primarily but allowing future)
}

// HostState 对应 Nezha/Komari 的监控数据结构，同时兼容现有前端
type HostState struct {
	HostID string `json:"host_id"`

	// System Info
	Hostname string `json:"hostname"`
	OS       string `json:"os"`
	Arch     string `json:"arch"`
	Platform string `json:"platform"` // e.g., "ubuntu", "windows"
	Version  string `json:"version"`  // e.g., "10.0.19045"

	// Resources
	CPU       float64 `json:"cpu"`
	MemUsed   uint64  `json:"mem_used"`
	MemTotal  uint64  `json:"mem_total"`
	SwapUsed  uint64  `json:"swap_used"`
	SwapTotal uint64  `json:"swap_total"`
	// Derived for frontend compatibility
	Memory float64 `json:"memory"` // Memory used percent

	// Disk
	DiskUsed  uint64     `json:"disk_used"` // Total used of tracked disks
	DiskTotal uint64     `json:"disk_total"`
	Disks     []DiskInfo `json:"disks"`

	// Load
	Load1  float64 `json:"load_1"`
	Load5  float64 `json:"load_5"`
	Load15 float64 `json:"load_15"`

	// Network
	NetInTransfer  uint64 `json:"net_recv"`     // Total bytes recv
	NetOutTransfer uint64 `json:"net_sent"`     // Total bytes sent
	NetInSpeed     uint64 `json:"net_in_speed"` // Bytes/sec
	NetOutSpeed    uint64 `json:"net_out_speed"`

	// Status
	Uptime       uint64 `json:"uptime"`
	TcpConnCount uint64 `json:"tcp_conn_count"`
	UdpConnCount uint64 `json:"udp_conn_count"`
	ProcessCount uint64 `json:"process_count"`

	UpdatedAt int64 `json:"updated_at"`
}
