#!/bin/sh

set -eu

DEFAULT_URL="${API_BASE_URL:-/api}"
TARGET_DIR="/usr/share/nginx/html"
BACKEND_INTERNAL_URL="${BACKEND_INTERNAL_URL:-http://localhost:8090}"

mkdir -p "${TARGET_DIR}"
printf "window.__env = window.__env || {};\nwindow.__env.apiUrl = '%s';\n" "$DEFAULT_URL" > "${TARGET_DIR}/env.js"

cat <<EOF > /etc/nginx/conf.d/default.conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    location / {
        root   ${TARGET_DIR};
        index  index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass ${BACKEND_INTERNAL_URL%/}/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
