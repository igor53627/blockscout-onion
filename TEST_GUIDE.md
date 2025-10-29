# Testing Your .onion Hidden Service

Your .onion address: `7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion`

## Method 1: Tor Browser (Recommended - Easiest)

1. Download Tor Browser: https://www.torproject.org/download/
2. Install and open Tor Browser
3. Wait for it to connect to the Tor network
4. Visit: `http://7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion`
5. You should see the eth.blockscout.com website

## Method 2: Online Tor Checker

Visit these websites from your regular browser:

- **Tor2web proxy** (not recommended for production, but good for testing):
  - `https://7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion.sh`
  - `https://7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion.ly`

- **Onion availability checker**:
  - Visit: https://onion.live/
  - Enter: `7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion`
  - Click "Check"

## Method 3: Command Line with Local Tor

### Start local Tor (if not running):
```bash
brew services start tor
# Wait 30 seconds for Tor to bootstrap
sleep 30
```

### Test with curl:
```bash
curl --socks5-hostname localhost:9050 \
  -I \
  http://7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion/
```

### Expected output:
```
HTTP/1.1 200 OK
...
```

## Method 4: Check Container Logs

Look for successful hidden service setup:

```bash
docker-compose logs | grep -E "(Bootstrapped 100|descriptor)"
```

Expected: `Bootstrapped 100% (done): Done`

## Method 5: Verify Service is Publishing

Check if the descriptor is being published:

```bash
docker-compose logs | grep -i "upload"
```

You should see messages about uploading descriptors to the Tor network.

## Troubleshooting

### Service not accessible?

1. **Check Tor is bootstrapped:**
   ```bash
   docker-compose logs | tail -20
   ```
   Should show "Bootstrapped 100%"

2. **Check container is running:**
   ```bash
   docker-compose ps
   ```
   Should show "Up" status

3. **Restart the service:**
   ```bash
   docker-compose restart
   ```

4. **Check for errors:**
   ```bash
   docker-compose logs | grep -i error
   ```

### Wait time
After starting the service, it can take 1-3 minutes for:
- Tor to bootstrap (connect to network)
- Hidden service descriptor to be published
- .onion address to become reachable

## Quick Test Summary

**Fastest method:** Use Tor Browser
**No installation:** Use onion.live checker
**Command line:** Use local Tor + curl

## Expected Behavior

When working correctly, visiting your .onion address should:
- Show the exact same content as https://eth.blockscout.com/
- Display Ethereum blockchain explorer
- Function identically to the regular site
- Be accessible only through the Tor network

## Security Note

Your hidden service is configured in **non-anonymous mode** for better performance. This means:
- Lower latency
- Faster response times
- But your server IP may be discoverable by determined adversaries
