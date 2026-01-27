# Go-React Server Monitor 🚀

一个轻量级的分布式服务器监控系统。

## 技术栈
- **Backend**: Go (Gin, Gorilla WebSocket, gopsutil)
- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS
- **Environment**: Node.js v24.8.0

## 快速开始
1. **启动中心端**: `cd backend && go run main.go`
2. **启动采集端**: `cd agent && go run main.go`
3. **启动前端**: `cd frontend && npm install && npm run dev`