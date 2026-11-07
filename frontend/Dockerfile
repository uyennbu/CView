# =============================================================================
# STAGE 1: Build React Production Bundle
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép file cấu hình dependencies
COPY package*.json ./

# Cài đặt dependencies (nếu có package.json)
RUN if [ -f package.json ]; then npm install; fi

# Sao chép toàn bộ mã nguồn Frontend
COPY . .

# Build dự án React (ra thư mục dist hoặc build)
RUN if [ -f package.json ]; then npm run build; else mkdir -p dist && echo "<h1>CView Frontend Placeholder</h1>" > dist/index.html; fi

# =============================================================================
# STAGE 2: Nginx Web Server & Reverse Proxy
# =============================================================================
FROM nginx:alpine

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Sao chép cấu hình Nginx Reverse Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép file build từ Stage 1 vào Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

