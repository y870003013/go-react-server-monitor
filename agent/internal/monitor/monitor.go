package monitor

import (
	"os"
	"runtime"
	"time"

	"server-monitor/agent/internal/model"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

type Monitor struct {
	HostID   string
	Platform string
	Version  string
	Arch     string
	Hostname string

	prevNetIn  uint64
	prevNetOut uint64
	prevTime   time.Time
}

func NewMonitor() *Monitor {
	hInfo, _ := host.Info()
	hostname, _ := os.Hostname()

	return &Monitor{
		HostID:   hostname, // Using hostname as ID for simplicity
		Platform: hInfo.Platform,
		Version:  hInfo.PlatformVersion,
		Arch:     runtime.GOARCH,
		Hostname: hostname,
		prevTime: time.Now(),
	}
}

func (m *Monitor) Collect() model.HostState {
	state := model.HostState{
		HostID:    m.HostID,
		Hostname:  m.Hostname,
		Platform:  m.Platform,
		Version:   m.Version,
		Arch:      m.Arch,
		UpdatedAt: time.Now().Unix(),
	}

	// 1. CPU
	// cpu.Percent(0, false) with 0 interval returns 0 on first call or since last call.
	// For simplicity in this agent loop, we use a small blocking interval for now,
	// or relies on the fact that this is called periodically.

	// If allow blocking (which is fine for a 3s interval agent):
	c, _ := cpu.Percent(time.Second, false)
	if len(c) > 0 {
		state.CPU = c[0]
	}

	// 2. Memory & Swap
	v, _ := mem.VirtualMemory()
	s, _ := mem.SwapMemory()
	if v != nil {
		state.MemUsed = v.Used
		state.MemTotal = v.Total
		state.Memory = v.UsedPercent
	}
	if s != nil {
		state.SwapUsed = s.Used
		state.SwapTotal = s.Total
	}

	// 3. Load
	l, _ := load.Avg()
	if l != nil {
		state.Load1 = l.Load1
		state.Load5 = l.Load5
		state.Load15 = l.Load15
	}

	// 4. Disk
	parts, _ := disk.Partitions(false)
	var disks []model.DiskInfo
	var totalDiskUsed, totalDiskAll uint64
	for _, part := range parts {
		u, err := disk.Usage(part.Mountpoint)
		if err != nil {
			continue
		}
		// Skip tiny partitions
		if u.Total < 1024*1024*1024 {
			continue
		}

		// Nezha/Komari logic for specific exclude paths could be added here

		disks = append(disks, model.DiskInfo{
			Path:        part.Mountpoint,
			UsedPercent: u.UsedPercent,
			TotalGB:     float64(u.Total) / 1024 / 1024 / 1024,
			UsedGB:      float64(u.Used) / 1024 / 1024 / 1024,
		})
		totalDiskUsed += u.Used
		totalDiskAll += u.Total
	}
	state.Disks = disks
	state.DiskUsed = totalDiskUsed
	state.DiskTotal = totalDiskAll

	// 5. Network
	netStat, _ := net.IOCounters(false)
	if len(netStat) > 0 {
		currentIn := netStat[0].BytesRecv
		currentOut := netStat[0].BytesSent
		state.NetInTransfer = currentIn
		state.NetOutTransfer = currentOut

		// Calculate Speed
		now := time.Now()
		duration := now.Sub(m.prevTime).Seconds()
		if duration > 0 {
			state.NetInSpeed = uint64(float64(currentIn-m.prevNetIn) / duration)
			state.NetOutSpeed = uint64(float64(currentOut-m.prevNetOut) / duration)
		}
		// Update state for next calculation
		m.prevNetIn = currentIn
		m.prevNetOut = currentOut
		m.prevTime = now
	}

	// 6. Host Uptime / Procs
	hInfo, _ := host.Info() // Refresh uptime
	state.Uptime = hInfo.Uptime

	// Process count - simple count
	procs, _ := process.Pids()
	state.ProcessCount = uint64(len(procs))

	// TCP/UDP requires net.Connections which can be heavy.
	// Just counting for now if strictly needed.
	// Using "all" includes listening.
	conns, _ := net.Connections("all")
	var tcp, udp uint64
	for _, c := range conns {
		if c.Type == 1 { // TCP
			tcp++
		} else if c.Type == 2 { // UDP
			udp++
		}
	}
	state.TcpConnCount = tcp
	state.UdpConnCount = udp

	return state
}
