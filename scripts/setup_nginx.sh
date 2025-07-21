#!/bin/bash
NGINX_CONF="/etc/nginx/sites-available/default"

echo "
server {
  listen 80;
  server_name _;

  location / {
    root /var/www/html;
    index index.html index.htm;
    try_files \$uri \$uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://localhost:8080;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header Host \$http_host;
  }
}
" | sudo tee $NGINX_CONF

sudo systemctl restart nginx
