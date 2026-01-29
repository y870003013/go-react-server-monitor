# 部署手册 (Deployment Manual)

本文档将指导你将 Server Monitor 系统部署到 Linux 服务器上。

## 1. 环境准备

确保服务器已安装以下软件：
- **Go** (用于编译后端和 Agent，建议在本地编译后上传)
- **Node.js & npm** (用于编译前端，建议在本地编译后上传)
- **Nginx** (用于反向代理和托管前端静态资源)

---

## 2. 后端部署 (Backend)

### 2.1 编译
在开发环境（Windows/Mac/Linux）执行交叉编译，生成 Linux 可执行文件。

```bash
# 进入后端目录
cd backend

# 编译 Linux amd64 版本
SET CGO_ENABLED=0
SET GOOS=linux
SET GOARCH=amd64
go build -o server cmd/server/main.go

# (Linux/Mac 用户使用: CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server cmd/server/main.go)
```

### 2.2 上传与运行
1.  将生成的 `server` 文件上传到服务器，例如 `/home/yanghuan/go/server`。
2.  赋予执行权限：`chmod +x /home/yanghuan/go/server`。
3.  创建 Systemd 服务文件 `/etc/systemd/system/monitor-server.service`：

```ini
[Unit]
Description=Server Monitor Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/yanghuan/go
ExecStart=/home/yanghuan/go/server
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

4.  启动服务：
    ```bash
    systemctl daemon-reload
    systemctl enable monitor-server
    systemctl start monitor-server
    ```

---

## 3. 采集端部署 (Agent)

### 3.1 编译
```bash
# 进入 Agent 目录
cd agent

# 编译 Linux amd64 版本
SET CGO_ENABLED=0
SET GOOS=linux
SET GOARCH=amd64
go build -o agent cmd/agent/main.go
```

### 3.2 配置
修改 `agent.yaml` 文件中的 `server_url`，将其指向服务器的实际 IP 或域名。

```yaml
# 示例: 如果后端部署在 192.168.1.100
server_url: "http://192.168.1.100:8080/report"
interval: 3
```

### 3.3 上传与运行
1.  将 `agent` 二进制文件和 `agent.yaml` 上传到服务器，例如 `/home/yanghuan/go`。
2.  赋予执行权限：`chmod +x /home/yanghuan/go/agent`。
3.  创建 Systemd 服务文件 `/etc/systemd/system/monitor-agent.service`：

```ini
[Unit]
Description=Server Monitor Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/yanghuan/go
ExecStart=/home/yanghuan/go/agent
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

4.  启动服务：
    ```bash
    systemctl daemon-reload
    systemctl enable monitor-agent
    systemctl start monitor-agent
    systemctl status monitor-agent
    ```

---

## 4. 前端部署 (Frontend - Docker 方式)

### 4.1 准备工作
确保 `frontend` 目录下包含 `Dockerfile` 和 `nginx.conf`。

### 4.2 修改 Nginx 配置 (可选)
如果需要修改反向代理地址，请编辑 `frontend/nginx.conf`：
```nginx
    location /ws {
         # 修改为你后端的实际地址
         proxy_pass http://103.117.136.91:8080/ws;
         ...
    }
```

### 4.3 构建镜像
在 `frontend` 目录下执行：
```bash
docker build -t monitor-frontend:latest .
```

### 4.4 运行容器
```bash
docker run -d \
  --name monitor-frontend \
  -p 80:80 \
  monitor-frontend:latest
```

## 5. 验证
1.  访问服务器 IP `http://103.117.136.91` (或你服务器的公网 IP)。
2.  确保能加载页面，且 WebSocket 连接正常（可以在浏览器控制台 Network 选项卡查看 `/ws` 连接状态）。

