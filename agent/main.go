package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/load"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
)

type DiskInfo struct {
	Path        string  `json:"path"`         // 挂载点，如 "/" 或 "C:"
	UsedPercent float64 `json:"used_percent"` // 使用率
	TotalGB     float64 `json:"total_gb"`     // 总大小
}

// 数据结构要和 Center 保持一致
type HostStats struct {
	HostID string  `json:"host_id"`
	Uptime uint64  `json:"uptime"` // 运行时间(秒)
	CPU    float64 `json:"cpu"`    // CPU 使用率 %
	Load1  float64 `json:"load_1"` // 1分钟负载
	Memory float64 `json:"memory"` // 内存使用率 %
	// DiskUsage    float64 `json:"disk_usage"` // 根路径磁盘使用率 %
	Disks        []DiskInfo `json:"disks"`    // 变为切片，支持多个磁盘
	NetBytesSent uint64     `json:"net_sent"` // 网络发送总字节
	NetBytesRecv uint64     `json:"net_recv"` // 网络接收总字节
}

func main() {
	// 1. 获取机器唯一标识（这里用主机名）
	hostname, _ := os.Hostname()
	hostInfo, _ := host.Info()
	// Center 的地址，如果在本地测试就是 localhost
	centerURL := "http://localhost:8080/report"

	fmt.Printf("Agent 启动，正在监控: %s，上报地址: %s\n", hostname, centerURL)

	for {
		// 2. 采集 CPU 使用率 (采样 1 秒)
		cpuPercent, _ := cpu.Percent(time.Second, false)

		//采集Load(负载)
		loadStat, _ := load.Avg()

		// 3.s 采集内存使用率
		vm, _ := mem.VirtualMemory()

		diskPercent := getDisksInfo()

		netStat, _ := net.IOCounters(false)

		// 构造数据
		stats := HostStats{
			HostID: hostname,
			Uptime: hostInfo.Uptime, // 系统启动时长
			CPU:    cpuPercent[0],
			Load1:  loadStat.Load1,
			Memory: vm.UsedPercent,
			Disks:  diskPercent,
			// netStat 返回的是切片，取第一个即可
			NetBytesSent: netStat[0].BytesSent,
			NetBytesRecv: netStat[0].BytesRecv,
		}

		// 5. 发送数据
		sendReport(centerURL, stats)

		// 6. 等待间隔 (例如 3 秒采集一次)
		time.Sleep(3 * time.Second)
	}
}

func sendReport(url string, data HostStats) {
	jsonData, _ := json.Marshal(data)

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("上报失败: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("数据已上报: CPU: %.2f%%, Mem: %.2f%%", data.CPU, data.Memory)
}

func getDisksInfo() []DiskInfo {
	parts, _ := disk.Partitions(false)
	var disks []DiskInfo

	for _, part := range parts {
		u, err := disk.Usage(part.Mountpoint)
		if err != nil {
			continue
		}

		// 过滤掉太小的分区 (比如小于 1GB 的)，避免杂乱
		// 1 GB = 1024 * 1024 * 1024 bytes
		if u.Total < 1024*1024*1024 {
			continue
		}

		disks = append(disks, DiskInfo{
			Path:        part.Mountpoint,
			UsedPercent: u.UsedPercent,
			TotalGB:     float64(u.Total) / 1024 / 1024 / 1024,
		})
	}
	return disks
}
