#!/bin/sh
set -e

echo "Starting Tor Hidden Service for eth.blockscout.com..."

# Check if hidden service keys exist
if [ -f "/var/lib/tor/hidden_service/hostname" ]; then
    echo "Using existing hidden service keys"
    echo "Hidden Service Address:"
    cat /var/lib/tor/hidden_service/hostname
else
    echo "No existing keys found. Tor will generate new keys."
    echo "Note: If you have existing .onion keys, place them in the hidden_service/ directory before starting."
fi

# Start nginx to proxy HTTP to HTTPS in the background
echo "Starting HTTPS proxy (nginx)..."
nginx -c /etc/nginx/nginx.conf &

# Give nginx a moment to start
sleep 2

# Start Tor as the tor user
echo "Starting Tor..."
exec su-exec tor tor -f /etc/tor/torrc
