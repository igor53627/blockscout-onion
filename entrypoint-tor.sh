#!/bin/sh
set -e

echo "Starting Tor Hidden Service for Blockscout..."

# Ensure correct permissions on tor data directory
# This is needed when volume is mounted, as it may be owned by root
chown -R tor:tor /var/lib/tor
chmod 700 /var/lib/tor

# Wait for nginx to be reachable
echo "Waiting for nginx to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if wget -q --spider http://nginx:8080/status 2>/dev/null; then
        echo "Nginx is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "Waiting for nginx... attempt $attempt/$max_attempts"
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "WARNING: Nginx not reachable after $max_attempts attempts, proceeding anyway..."
fi

# Check if hidden service keys exist
if [ -f "/var/lib/tor/hidden_service/hostname" ]; then
    echo "Using existing hidden service keys"
    echo "Hidden Service Address:"
    cat /var/lib/tor/hidden_service/hostname
else
    echo "No existing keys found. Tor will generate new keys."
    echo "Note: If you have existing .onion keys, place them in the ./tor_data/hidden_service/ directory before starting."
fi

# Start Tor as the tor user
echo "Starting Tor..."
exec su-exec tor tor -f /etc/tor/torrc
