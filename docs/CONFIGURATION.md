# Configuration Guide

## Modify Target Service

The primary configuration is changing which HTTP service the hidden service proxies to.

### Edit Nginx Upstream

Edit `nginx.conf` at line 35-37:

```nginx
upstream blockscout {
    server your-service.com:8545;  # Change to your service
}
```

### Examples for Different Services

#### RPC Provider (Ethereum)
```nginx
upstream blockscout {
    server your-ethereum-node.com:8545;
}
```

#### RPC Provider (Bitcoin)
```nginx
upstream blockscout {
    server your-bitcoin-node.com:8332;
}
```

#### Static Website
```nginx
upstream blockscout {
    server your-dapp.com:80;
}
```

#### IPFS Gateway
```nginx
upstream blockscout {
    server 127.0.0.1:8080;
}
```

#### GraphQL API
```nginx
upstream blockscout {
    server api.yourservice.com:4000;
}
```

## Adjust Tor Settings

Edit `torrc` to customize Tor behavior.

### Change Logging Level

```
# Default
Log notice stdout

# For debugging
Log debug stdout

# Minimal logging
Log err stdout
```

### Change Hidden Service Port

```
# Default: forward .onion:80 to nginx:8080
HiddenServicePort 80 nginx:8080

# Custom: forward .onion:8080 to nginx:8080
HiddenServicePort 8080 nginx:8080
```

### Add Multiple Hidden Services

You can run multiple hidden services from one Tor instance:

```
# Service 1 - Blockscout
HiddenServiceDir /var/lib/tor/service1/
HiddenServicePort 80 nginx:8080

# Service 2 - Another app
HiddenServiceDir /var/lib/tor/service2/
HiddenServicePort 80 other-app:3000
```

**Note**: You'll need to add the other service to `docker-compose.yml`.

### Disable Single-Hop Mode (Increase Anonymity)

If you need location anonymity, remove these lines from `torrc`:

```
# Remove or comment out these lines:
# HiddenServiceSingleHopMode 1
# HiddenServiceNonAnonymousMode 1
```

**Warning**: This will increase latency significantly (6 hops vs 3+1 hops).

## Nginx Configuration

### Add Custom Headers

In `nginx.conf`, inside the `location /` block:

```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
```

### Enable Rate Limiting

Add to `http` block in `nginx.conf`:

```nginx
# Define rate limit zone
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# Apply in location block
location / {
    limit_req zone=one burst=20;
    # ... rest of proxy config
}
```

### Add Basic Authentication

```nginx
location / {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ... rest of proxy config
}
```

Then create password file inside nginx container.

### Custom Error Pages

```nginx
error_page 502 503 504 /50x.html;
location = /50x.html {
    root /var/www/html;
    internal;
}
```

### WebSocket Configuration

Already included, but can be customized:

```nginx
# Increase WebSocket timeout
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;

# WebSocket headers (already present)
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

## Docker Compose Configuration

### Change Container Names

Edit `docker-compose.yml`:

```yaml
services:
  tor:
    container_name: my-custom-tor-name
  nginx:
    container_name: my-custom-nginx-name
```

### Add Environment Variables

```yaml
services:
  tor:
    environment:
      - TZ=America/New_York
      - DEBUG=1
```

### Modify Resource Limits

```yaml
services:
  tor:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### Add Additional Volumes

```yaml
services:
  nginx:
    volumes:
      - ./custom_html:/var/www/html
      - ./custom_nginx_config:/etc/nginx/conf.d
```

## Port Configuration

### Expose Ports to Host

If you need to access containers directly from the host:

```yaml
services:
  nginx:
    ports:
      - "8080:8080"  # Expose nginx on host:8080
```

**Warning**: Only do this for testing. Don't expose ports in production.

## Network Configuration

### Use External Network

```yaml
networks:
  tor-network:
    external: true
    name: my-existing-network
```

### Configure Network Driver Options

```yaml
networks:
  tor-network:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: br-tor
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Health Check Configuration

### Adjust Health Check Intervals

```yaml
services:
  tor:
    healthcheck:
      interval: 60s      # Check every 60 seconds
      timeout: 15s       # 15 second timeout
      retries: 5         # Retry 5 times
      start_period: 30s  # Wait 30s before first check
```

### Custom Health Check Commands

```yaml
services:
  nginx:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/status"]
      interval: 30s
```

## Applying Configuration Changes

After making changes:

1. **For `torrc` or `nginx.conf` changes**:
```bash
docker compose up -d --build
```

2. **For `docker-compose.yml` changes**:
```bash
docker compose up -d
```

3. **For runtime nginx changes** (if nginx supports reload):
```bash
docker exec blockscout-nginx nginx -s reload
```

## Configuration Best Practices

1. **Test before deploying**: Use `nginx -t` to test nginx config
2. **Keep backups**: Backup configurations before major changes
3. **Use version control**: Track configuration changes in git
4. **Document custom changes**: Add comments to explain modifications
5. **Start simple**: Only add complexity when needed
6. **Monitor after changes**: Watch logs after configuration updates

## Configuration Templates

See the `examples/` directory (if created) for configuration templates for:
- Different types of services (RPC, API, static sites)
- Security hardening
- Performance optimization
- Multiple hidden services
