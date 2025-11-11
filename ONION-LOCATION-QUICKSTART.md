# Onion-Location Quick Start

Quick reference for implementing Onion-Location header to advertise your .onion service.

## What You Need

1. A running onion service (deployed using this project)
2. Your .onion address from `cat tor_data/hidden_service/hostname`
3. Access to your clearnet nginx server configuration

## 5-Minute Setup

### Step 1: Get Your Onion Address

```bash
cat tor_data/hidden_service/hostname
```

Example output: `7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion`

### Step 2: Add Header to Clearnet Nginx

On your **clearnet server** (not the onion service), add this line inside your `server` block:

```nginx
add_header Onion-Location http://YOUR-ONION-ADDRESS.onion$request_uri always;
```

### Step 3: Reload Nginx

```bash
nginx -t && nginx -s reload
```

### Step 4: Test

```bash
curl -I https://your-clearnet-site.com | grep -i onion-location
```

Expected: `Onion-Location: http://YOUR-ONION-ADDRESS.onion/`

### Step 5: Verify in Tor Browser

Visit your clearnet site in Tor Browser. You should see a purple onion icon in the address bar with a notification to switch to .onion.

## Example Configuration

```nginx
server {
    listen 443 ssl;
    server_name blockscout.example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # Add this line:
    add_header Onion-Location http://7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion$request_uri always;

    location / {
        proxy_pass http://backend;
    }
}
```

## Common Mistakes

1. Adding header to onion service instead of clearnet (NO)
2. Using `https://` for .onion addresses (should be `http://`)
3. Missing `$request_uri` (current page path won't be preserved)
4. Missing `always` flag (header won't appear on error pages)

## Full Documentation

- [Complete Onion-Location Guide](docs/ONION-LOCATION.md)
- [Example Clearnet Configuration](nginx-clearnet-example.conf)
- [Project Configuration Guide](docs/CONFIGURATION.md)

## Screenshot Location

Place your Onion-Location screenshots in:

```
docs/images/
└── blockscout-onion.png  # Real example from eth.blockscout.com
```

Reference in docs with: `![Description](images/your-screenshot.png)`

See `docs/ONION-LOCATION.md` for a real-world example screenshot from eth.blockscout.com.

## Testing Checklist

- [ ] Onion service is running and accessible
- [ ] Got .onion address from hostname file
- [ ] Added header to clearnet nginx config
- [ ] Used `http://` (not https://) for .onion
- [ ] Included `$request_uri` in header value
- [ ] Used `always` flag
- [ ] Tested with curl
- [ ] Reloaded nginx without errors
- [ ] Verified in Tor Browser
- [ ] Purple onion icon appears in address bar

## Support

If something doesn't work, see:

- [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- [Full Onion-Location Documentation](docs/ONION-LOCATION.md)

## Real-World Examples

Sites successfully using Onion-Location:

- DuckDuckGo: https://duckduckgo.com
- ProtonMail: https://protonmail.com
- The New York Times: https://www.nytimes.com
- Blockscout: https://eth.blockscout.com

Visit these in Tor Browser to see Onion-Location in action!
