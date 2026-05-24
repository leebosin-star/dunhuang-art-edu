#!/bin/bash
# Deploy to Tencent Cloud Lighthouse
# Usage: ./deploy.sh <server-ip>

set -e

SERVER_IP="${1:?Usage: ./deploy.sh <server-ip>}"
DIST_DIR="$(dirname "$0")/../dist"
NGINX_CONF="$(dirname "$0")/nginx.conf"

echo "=== Building tar archive ==="
cd "$DIST_DIR"
tar -czf /tmp/dunhuang-deploy.tar.gz .

echo "=== Uploading to server ==="
scp /tmp/dunhuang-deploy.tar.gz "root@${SERVER_IP}:/tmp/"
scp "$NGINX_CONF" "root@${SERVER_IP}:/tmp/nginx-dunhuang.conf"

echo "=== Deploying on server ==="
ssh "root@${SERVER_IP}" << 'REMOTE'
    set -e

    echo "--- Extracting files ---"
    rm -rf /var/www/dunhuang/*
    tar -xzf /tmp/dunhuang-deploy.tar.gz -C /var/www/dunhuang/

    echo "--- Installing Nginx config ---"
    cp /tmp/nginx-dunhuang.conf /etc/nginx/sites-available/dunhuang
    ln -sf /etc/nginx/sites-available/dunhuang /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    echo "--- Testing Nginx config ---"
    nginx -t

    echo "--- Reloading Nginx ---"
    systemctl reload nginx

    echo "--- Cleanup ---"
    rm /tmp/dunhuang-deploy.tar.gz /tmp/nginx-dunhuang.conf

    echo "=== Deploy complete ==="
REMOTE

echo "Done! Visit http://${SERVER_IP}"
