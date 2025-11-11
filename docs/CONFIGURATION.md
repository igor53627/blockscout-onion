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

### WebSocket Configuration

WebSocket support is already included. If you need to adjust timeouts:

```nginx
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
```

### Onion-Location Header (Clearnet Server)

If you want to advertise your .onion address to Tor Browser users on your clearnet site, see the dedicated guide:

- **[Onion-Location Header Guide](ONION-LOCATION.md)** - Complete documentation
- **[nginx-clearnet-example.conf](../nginx-clearnet-example.conf)** - Example configuration

**Important**: Onion-Location header is configured on your **clearnet server**, not the onion service container created by this project.

## Applying Changes

After modifying configuration files:

```bash
# Rebuild and restart
docker compose up -d --build

# Or just restart if only docker-compose.yml changed
docker compose up -d
```

**Pro tip**: Test nginx config before applying:
```bash
docker exec blockscout-nginx nginx -t
```
