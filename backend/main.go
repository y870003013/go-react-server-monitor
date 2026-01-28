package main

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// 1. 对应 Agent 的磁盘结构
type DiskInfo struct {
	Path        string  `json:"path"`
	UsedPercent float64 `json:"used_percent"`
	TotalGB     float64 `json:"total_gb"`
}

type HostStats struct {
	HostID       string     `json:"host_id"`
	Uptime       uint64     `json:"uptime"`
	CPU          float64    `json:"cpu"`
	Load1        float64    `json:"load_1"`
	Memory       float64    `json:"memory"`
	Disks        []DiskInfo `json:"disks"` // 多磁盘支持
	NetBytesSent uint64     `json:"net_sent"`
	NetBytesRecv uint64     `json:"net_recv"`

	// --- 计算字段 ---
	NetSpeedSent float64 `json:"net_speed_sent"` // Byte/s
	NetSpeedRecv float64 `json:"net_speed_recv"` // Byte/s
	UpdatedAt    int64   `json:"updated_at"`
}

var (
	hostsStorage = sync.Map{}
	upgrader     = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func main() {
	r := gin.Default()

	// 接收 Agent 上报
	r.POST("/report", handleReport)

	// WebSocket 供前端大屏使用
	r.GET("/ws", handleWebSocket)

	// --- 【新增】核心补充：托管 index.html ---
	// 这样访问 http://localhost:8080 才能看到页面
	r.StaticFile("/", "./index.html")

	r.Run(":8080")
}

func handleReport(c *gin.Context) {
	var newStats HostStats
	if err := c.ShouldBindJSON(&newStats); err != nil {
		c.JSON(400, gin.H{"error": "数据格式错误"})
		return
	}

	now := time.Now().Unix()
	newStats.UpdatedAt = now

	// --- 核心逻辑：计算实时网速 ---
	if val, ok := hostsStorage.Load(newStats.HostID); ok {
		oldStats := val.(HostStats)
		duration := float64(newStats.UpdatedAt - oldStats.UpdatedAt)

		if duration > 0 {
			// 计算发送速率 (Bytes / Second)
			// 注意：这里算出来是 Byte/s，前端显示时建议除以 1024 换算成 KB/s
			if newStats.NetBytesSent >= oldStats.NetBytesSent {
				diff := float64(newStats.NetBytesSent - oldStats.NetBytesSent)
				newStats.NetSpeedSent = diff / duration
			}
			if newStats.NetBytesRecv >= oldStats.NetBytesRecv {
				diff := float64(newStats.NetBytesRecv - oldStats.NetBytesRecv)
				newStats.NetSpeedRecv = diff / duration
			}
		}
	}

	hostsStorage.Store(newStats.HostID, newStats)
	c.JSON(200, gin.H{"message": "received"})
}

func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		var list []HostStats
		hostsStorage.Range(func(key, value interface{}) bool {
			list = append(list, value.(HostStats))
			return true
		})

		if err := conn.WriteJSON(list); err != nil {
			break
		}
		time.Sleep(1 * time.Second)
	}
}
