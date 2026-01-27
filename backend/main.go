package main

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// HostStats 代表某一台机器的状态快照
type HostStats struct {
	HostID    string  `json:"host_id"`
	CPU       float64 `json:"cpu"`
	Memory    float64 `json:"memory"`
	UpdatedAt int64   `json:"updated_at"`
}

// 使用 sync.Map 保证多台机器并发写入时的线程安全
var (
	hostsStorage = sync.Map{}
	upgrader     = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func main() {
	// 1. 创建 Gin 实例
	r := gin.Default()

	// 2. 路由：接收来自 Agent 的上报
	r.POST("/report", func(c *gin.Context) {
		var stats HostStats
		if err := c.ShouldBindJSON(&stats); err != nil {
			c.JSON(400, gin.H{"error": "数据格式错误"})
			return
		}
		// 更新最后活跃时间
		stats.UpdatedAt = time.Now().Unix()

		// 保存或更新机器状态
		hostsStorage.Store(stats.HostID, stats)

		c.JSON(200, gin.H{"message": "received"})
	})

	// 3. 路由：给前端展示用的 WebSocket
	r.GET("/ws", handleWebSocket)

	// 4. 启动服务
	r.Run(":8080")
}

func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		// 构造当前所有机器的列表发送给前端
		var list []HostStats
		hostsStorage.Range(func(_, value interface{}) bool {
			list = append(list, value.(HostStats))
			return true
		})

		if err := conn.WriteJSON(list); err != nil {
			break
		}

		// 每秒推送一次最新全量状态
		time.Sleep(1 * time.Second)
	}
}
