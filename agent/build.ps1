$env:CGO_ENABLED="0"
$env:GOOS="linux"
$env:GOARCH="amd64"
go build -o agent cmd/agent/main.go
Write-Host "编译完成，已生成 Linux 版二进制文件 agent" -ForegroundColor Green