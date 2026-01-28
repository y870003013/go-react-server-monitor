package main

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// HostStats 结构体已升级
// 注意：JSON tag 必须和 Agent 端完全一致
type HostStats struct {
	HostID       string  `json:"host_id"`
	Uptime       uint64  `json:"uptime"`
	CPU          float64 `json:"cpu"`
	Load1        float64 `json:"load_1"`
	Memory       float64 `json:"memory"`
	DiskUsage    float64 `json:"disk_usage"`
	NetBytesSent uint64  `json:"net_sent"` // 累计发送字节
	NetBytesRecv uint64  `json:"net_recv"` // 累计接收字节

	// --- 以下字段由 Center 计算生成，不从 Agent 接收 ---
	NetSpeedSent float64 `json:"net_speed_sent"` // 发送速率 (Byte/s)
	NetSpeedRecv float64 `json:"net_speed_recv"` // 接收速率 (Byte/s)
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
	// 尝试取出上一次的状态
	if val, ok := hostsStorage.Load(newStats.HostID); ok {
		oldStats := val.(HostStats)

		// 时间间隔 (秒)
		duration := float64(newStats.UpdatedAt - oldStats.UpdatedAt)

		// 只有时间间隔大于0，且没有重启(累计值变大)时才计算
		if duration > 0 {
			// 计算发送速率 (Bytes / Second)
			if newStats.NetBytesSent >= oldStats.NetBytesSent {
				diff := float64(newStats.NetBytesSent - oldStats.NetBytesSent)
				newStats.NetSpeedSent = diff / duration
			}
			// 计算接收速率
			if newStats.NetBytesRecv >= oldStats.NetBytesRecv {
				diff := float64(newStats.NetBytesRecv - oldStats.NetBytesRecv)
				newStats.NetSpeedRecv = diff / duration
			}
		}
	}

	// 存入最新的状态 (包含计算好的网速)
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
		// 构造列表
		var list []HostStats
		hostsStorage.Range(func(key, value interface{}) bool {
			stats := value.(HostStats)
			// 如果超过 10 秒没上报，可能机器挂了，可以标记一下状态或者过滤掉
			// 这里简单处理：全部发送
			list = append(list, stats)
			return true
		})

		if err := conn.WriteJSON(list); err != nil {
			break
		}

		// 1秒刷新一次前端
		time.Sleep(1 * time.Second)
	}
}
