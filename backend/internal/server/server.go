package server

import (
	"net/http"
	"time"

	"server-monitor/backend/internal/model"
	"server-monitor/backend/internal/store"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Server struct {
	store *store.Store
}

func NewServer(store *store.Store) *Server {
	return &Server{store: store}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (s *Server) SetupRouter() *gin.Engine {
	r := gin.Default()
	r.POST("/report", s.handleReport)
	r.GET("/ws", s.handleWebSocket)
	r.StaticFile("/", "./index.html")
	return r
}

func (s *Server) handleReport(c *gin.Context) {
	var newStats model.HostState
	if err := c.ShouldBindJSON(&newStats); err != nil {
		c.JSON(400, gin.H{"error": "Invalid JSON"})
		return
	}

	newStats.UpdatedAt = time.Now().Unix()

	// Logic: If Agent calculates speed (fields > 0), use it.
	// Otherwise (legacy agent or first run), calculate it if we have history.
	// However, new Agent sends speed. We will just use it and rely on it.
	// But to be safe / backwards compatible with the logic I planned, if Agent sends 0 speed
	// (e.g. first run of agent or simpler agent), we could calculate.
	// For this task, let's trust the Agent if provided.
	// Actually, the new agent code sends Speed.
	// If we want detailed calculation like before, we can keep it, but Agent does it better (more frequent samples).
	// Let's just store what we get. The Agent's speed calculation is decent.

	// Compatibility: If frontend relies on fields I removed?
	// Frontend uses `HostStats` which matches Agent's `HostState`.
	// I don't need to do calculation here anymore if Agent does it.

	s.store.Save(newStats)
	c.JSON(200, gin.H{"message": "received"})
}

func (s *Server) handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		list := s.store.GetAll()
		if err := conn.WriteJSON(list); err != nil {
			break
		}
		time.Sleep(1 * time.Second)
	}
}
