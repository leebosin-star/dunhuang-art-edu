#!/bin/bash
# Tencent Cloud Lighthouse — one-time server setup
# Run as root on the server

set -e

echo "=== Installing Nginx ==="
apt update && apt install -y nginx

echo "=== Creating web directory ==="
mkdir -p /var/www/dunhuang

echo "=== Starting Nginx ==="
systemctl enable nginx
systemctl restart nginx

echo "=== Done ==="
nginx -v
echo "Web root: /var/www/dunhuang"
echo "Next: upload files via deploy.sh"
