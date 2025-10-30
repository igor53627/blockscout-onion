# Management Commands

## Essential Commands

Quick reference for the most common operations:

```bash
# Start service
docker compose up -d

# View logs
docker compose logs -f

# Get .onion address
cat tor_data/hidden_service/hostname

# Check status
docker compose ps

# Stop service
docker compose down
```

## Basic Operations

### Start the Service

```bash
docker compose up -d
```

This starts both containers in detached mode (background).

### Stop the Service

```bash
docker compose down
```

This stops and removes the containers. **Note**: This does NOT delete your `.onion` keys in `tor_data/`.

### Restart the Service

```bash
docker compose restart
```

Quick restart of both containers without rebuilding.

### Rebuild After Configuration Changes

```bash
docker compose up -d --build
```

Use this when you've modified:
- `Dockerfile.tor` or `Dockerfile.nginx`
- `torrc` or `nginx.conf`
- `entrypoint-tor.sh`

## Viewing Status and Logs

### Check Container Status

```bash
docker compose ps
```

Shows running containers with their status and health.

### View Logs

```bash
# View all logs with live updates
docker compose logs -f

# View Tor logs only
docker compose logs -f tor

# View Nginx logs only
docker compose logs -f nginx

# View last 50 lines
docker compose logs --tail=50

# View logs since specific time
docker compose logs --since 30m
```

### Get .onion Address

```bash
cat tor_data/hidden_service/hostname
```

## Container Management

### Enter a Container

```bash
# Enter Tor container
docker exec -it blockscout-tor sh

# Enter Nginx container
docker exec -it blockscout-nginx sh
```

Useful for debugging and inspecting the environment.

### Run Commands in Containers

```bash
# Check Tor version
docker exec blockscout-tor tor --version

# Test nginx configuration
docker exec blockscout-nginx nginx -t

# View Tor configuration
docker exec blockscout-tor cat /etc/tor/torrc

# Check nginx configuration
docker exec blockscout-nginx cat /etc/nginx/nginx.conf
```

## Updates and Maintenance

### Update Base Images

```bash
# Pull latest Alpine images
docker compose pull

# Rebuild with new base images
docker compose up -d --build
```

### Update Tor or Nginx

Since we use Alpine's package manager, updates are applied during rebuild:

```bash
docker compose build --no-cache
docker compose up -d
```

### Clean Up

```bash
# Remove stopped containers
docker compose down

# Remove containers and volumes (WARNING: deletes .onion keys!)
docker compose down -v

# Remove unused images
docker image prune -a
```

## Backup and Restore

### Backup .onion Keys

```bash
# Create backup
tar -czf hidden_service_backup_$(date +%Y%m%d).tar.gz tor_data/hidden_service/

# Create encrypted backup
tar -czf - tor_data/hidden_service/ | \
  gpg -c > hidden_service_backup_$(date +%Y%m%d).tar.gz.gpg
```

See [BACKUP.md](BACKUP.md) for detailed backup procedures.

### Restore .onion Keys

```bash
# From tar.gz
tar -xzf hidden_service_backup_20251030.tar.gz

# From encrypted backup
gpg -d hidden_service_backup_20251030.tar.gz.gpg | tar -xzf -

# Set correct permissions
chmod 700 tor_data/hidden_service
chmod 600 tor_data/hidden_service/*
```

## Monitoring

### Watch Container Resources

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats blockscout-tor
```

### Check Container Health

```bash
# View health status
docker inspect blockscout-tor | grep -A 10 Health
docker inspect blockscout-nginx | grep -A 10 Health
```

### Monitor Tor Bootstrap Progress

```bash
# Watch bootstrap in real-time
docker compose logs -f tor | grep -i bootstrap
```

## Advanced Operations

### Scale Services (Not Applicable)

This setup uses named containers and specific networking, so scaling is not supported. For load balancing, consider using [OnionSpray](https://gitlab.torproject.org/tpo/onion-services/onionspray).

### Export Logs

```bash
# Export all logs to file
docker compose logs > logs_$(date +%Y%m%d_%H%M%S).txt

# Export specific container logs
docker compose logs tor > tor_logs_$(date +%Y%m%d).txt
```

### Inspect Network

```bash
# View network details
docker network inspect blockscout-onion_tor-network

# List containers on network
docker network inspect blockscout-onion_tor-network | grep -A 5 Containers
```

## Production Recommendations

1. **Use a process manager**: Consider systemd or supervisor to manage `docker compose`
2. **Set up log rotation**: Configure Docker's logging driver to prevent disk fill
3. **Monitor health**: Set up alerts for container health status
4. **Automate backups**: Use cron to backup `.onion` keys regularly
5. **Update regularly**: Keep Docker and base images updated

## Systemd Service Example

Create `/etc/systemd/system/blockscout-onion.service`:

```ini
[Unit]
Description=Blockscout Tor Hidden Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/blockscout-onion
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable blockscout-onion
sudo systemctl start blockscout-onion
sudo systemctl status blockscout-onion
```
