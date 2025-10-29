# Blockscout Tor Hidden Service Bridge

This setup runs Tor in a Docker container to expose https://eth.blockscout.com/ as a hidden service (.onion address).

## Features

- Tor runs as a relay (no exit node functionality)
- Bridges HTTPS traffic from eth.blockscout.com to your .onion address
- Supports using existing .onion keys
- Automatic restart and health checking

## Directory Structure

```
blockscout-onion/
├── Dockerfile              # Tor container image
├── docker-compose.yml      # Docker Compose configuration
├── torrc                   # Tor configuration
├── entrypoint.sh          # Container startup script
├── hidden_service/        # Directory for .onion keys (created automatically)
│   ├── hostname           # Your .onion address
│   ├── hs_ed25519_public_key
│   └── hs_ed25519_secret_key
└── README.md
```

## Setup Instructions

### 1. Using Your Existing .onion Keys

If you have existing .onion keys, place them in the `hidden_service/` directory before starting:

```bash
mkdir -p hidden_service
# Copy your keys to hidden_service/
cp /path/to/your/hs_ed25519_public_key hidden_service/
cp /path/to/your/hs_ed25519_secret_key hidden_service/
cp /path/to/your/hostname hidden_service/
```

Set correct permissions:
```bash
chmod 700 hidden_service
chmod 600 hidden_service/*
```

### 2. Build and Start the Service

```bash
docker-compose up -d --build
```

### 3. View Your .onion Address

```bash
# View logs
docker-compose logs -f

# Get your .onion address
cat hidden_service/hostname
```

### 4. Test the Hidden Service

Using Tor Browser or any Tor-enabled client, visit your .onion address. It should proxy to https://eth.blockscout.com/

## Management Commands

```bash
# Start the service
docker-compose up -d

# Stop the service
docker-compose down

# View logs
docker-compose logs -f

# Restart the service
docker-compose restart

# Rebuild after configuration changes
docker-compose up -d --build
```

## How It Works

1. The Tor container starts and reads the configuration from `torrc`
2. It creates (or uses existing) hidden service keys in `/var/lib/tor/hidden_service/`
3. Tor establishes circuits and publishes the hidden service descriptor
4. When someone visits your .onion address, Tor forwards the request to eth.blockscout.com:443
5. The response is sent back through the Tor network to the visitor

## Configuration

### Modify Tor Settings

Edit `torrc` to customize:
- Logging level
- Port mappings
- Additional hidden services

### Change Target Website

Edit `torrc` line:
```
HiddenServicePort 80 eth.blockscout.com:443
```

Change to your desired target.

## Security Notes

- This setup does NOT run an exit node
- SocksPort is disabled (set to 0) to prevent proxy abuse
- Only hidden service functionality is enabled
- The container runs as the `tor` user (non-root)
- SafeLogging is enabled to protect sensitive information in logs

## Troubleshooting

### Check if Tor is running
```bash
docker-compose ps
```

### View detailed logs
```bash
docker-compose logs -f tor-hidden-service
```

### Verify keys are loaded correctly
```bash
ls -la hidden_service/
```

### Test Tor connectivity
```bash
docker exec blockscout-tor-bridge curl --socks5-hostname localhost:9050 http://check.torproject.org
```

## Backup Your Keys

Your .onion address is tied to the keys in `hidden_service/`. Back them up:

```bash
tar -czf hidden_service_backup.tar.gz hidden_service/
```

## License

This configuration is provided as-is for educational and legitimate use cases only.
