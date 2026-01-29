FROM nginx:stable-alpine

# 将本地构建好的 dist 文件夹拷贝到 Nginx 默认静态资源目录
COPY dist/ /usr/share/nginx/html

# 将你提供的 nginx.conf 拷贝到配置目录
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]