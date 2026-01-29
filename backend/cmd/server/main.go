package main

import (
	"server-monitor/backend/internal/server"
	"server-monitor/backend/internal/store"
)

func main() {
	// 1. Storage
	hostStore := store.NewStore()

	// 2. Server
	srv := server.NewServer(hostStore)
	r := srv.SetupRouter()

	// 3. Run
	r.Run(":8080")
}
