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
	"github.com/shirou/gopsutil/v3/mem"
)

// 数据结构要和 Center 保持一致
type HostStats struct {
	HostID string  `json:"host_id"`
	CPU    float64 `json:"cpu"`
	Memory float64 `json:"memory"`
}

func main() {
	// 1. 获取机器唯一标识（这里用主机名）
	hostname, _ := os.Hostname()
	// Center 的地址，如果在本地测试就是 localhost
	centerURL := "http://localhost:8080/report"

	fmt.Printf("Agent 启动，正在监控: %s，上报地址: %s\n", hostname, centerURL)

	for {
		// 2. 采集 CPU 使用率 (采样 1 秒)
		cpuPercent, _ := cpu.Percent(time.Second, false)

		// 3. 采集内存使用率
		vm, _ := mem.VirtualMemory()

		// 4. 构造数据
		stats := HostStats{
			HostID: hostname,
			CPU:    cpuPercent[0],
			Memory: vm.UsedPercent,
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
