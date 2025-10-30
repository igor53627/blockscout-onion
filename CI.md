# Continuous Integration

This repository includes a GitHub Actions workflow that automatically tests the Docker Compose setup on every push and pull request.

## What the CI Tests

The CI workflow (`.github/workflows/ci.yml`) performs comprehensive testing:

- ✅ **Docker Build**: Both Tor and Nginx images build successfully
- ✅ **Container Startup**: Containers start without errors
- ✅ **Health Checks**: Containers become healthy within expected time
- ✅ **Hidden Service**: .onion address is generated or loaded
- ✅ **Tor Bootstrap**: Tor successfully connects to the network
- ✅ **Network Connectivity**: Nginx is accessible from the Tor container
- ✅ **Error Detection**: Logs are scanned for critical errors
- ✅ **Status Reporting**: Detailed logs and container status on completion

## Workflow Triggers

The CI runs on:
- Push to `main` branch
- Pull requests targeting `main` branch

## Using Persistent .onion Address in CI

By default, CI generates new Tor keys for each test run. To use your existing .onion address in CI (ensuring the same address across test runs), you can configure GitHub Secrets.

### Step 1: Extract Your Keys

```bash
# Get hostname (plain text)
cat tor_data/hidden_service/hostname

# Get public key (base64-encoded)
base64 -w 0 tor_data/hidden_service/hs_ed25519_public_key
# On macOS, use: base64 -i tor_data/hidden_service/hs_ed25519_public_key | tr -d '\n'

# Get secret key (base64-encoded)
base64 -w 0 tor_data/hidden_service/hs_ed25519_secret_key
# On macOS, use: base64 -i tor_data/hidden_service/hs_ed25519_secret_key | tr -d '\n'
```

### Step 2: Add GitHub Secrets

1. Go to your repository settings: `https://github.com/YOUR_USERNAME/blockscout-onion/settings/secrets/actions`

2. Click "New repository secret" and add these three secrets:

   **TOR_HOSTNAME**
   - Name: `TOR_HOSTNAME`
   - Value: The .onion address (plain text from hostname file)
   - Example: `7lxb5y5sikmt4nmsm37yq567q3zazgsxmyapjs7azssoaojxna6kftid.onion`

   **TOR_PUBLIC_KEY**
   - Name: `TOR_PUBLIC_KEY`
   - Value: The base64-encoded public key (from step 1)

   **TOR_SECRET_KEY**
   - Name: `TOR_SECRET_KEY`
   - Value: The base64-encoded secret key (from step 1)

### Step 3: Verify

On the next CI run, the workflow will:
- Detect that secrets are configured
- Restore the keys before starting Tor
- Use your persistent .onion address

You'll see in the logs:
```
✅ Loaded existing Tor keys from secrets
```

## Viewing CI Results

- **Actions Tab**: https://github.com/YOUR_USERNAME/blockscout-onion/actions
- **Build Badge**: The badge in the README shows current status
- **Logs**: Click on any workflow run to see detailed logs

## Local Testing

You can test the CI workflow locally using [act](https://github.com/nektos/act):

```bash
# Install act
# macOS: brew install act
# Linux: See https://github.com/nektos/act#installation

# Run the workflow locally
act push

# Run with secrets (create .secrets file first)
act push --secret-file .secrets
```

Example `.secrets` file:
```
TOR_HOSTNAME=your-address.onion
TOR_PUBLIC_KEY=base64-encoded-public-key
TOR_SECRET_KEY=base64-encoded-secret-key
```

## Troubleshooting CI Failures

### Build Failures
- Check if Dockerfiles have syntax errors
- Verify base images are accessible (Alpine Linux)

### Health Check Failures
- Review container logs in the CI output
- Check if health check commands are correct
- Ensure services start within timeout period

### Network Connectivity Failures
- Verify nginx is configured correctly
- Check docker-compose network settings
- Review firewall or network policies in CI environment

### Bootstrap Failures
- Tor network connectivity issues (usually temporary)
- Check if Tor configuration is valid
- Review torrc for syntax errors

## Security Considerations

**Important**: Only add Tor keys to GitHub Secrets if:
- The .onion address is not sensitive
- You're okay with GitHub having access to the keys
- You need consistent testing with the same address

For production keys with high-value services:
- Test with CI-generated keys only
- Manually test with production keys outside of CI
- Use separate keys for staging/testing

## CI Output Example

Successful CI run output:
```
✅ Docker images built successfully
✅ Services started
✅ All containers are healthy!
✅ .onion address generated: abc123...xyz.onion
✅ Tor successfully bootstrapped to 100%
✅ Nginx is accessible from tor container
✅ No critical errors found in logs
```

## Contributing to CI

Improvements to the CI workflow are welcome! When modifying `.github/workflows/ci.yml`:

1. Test locally with `act` if possible
2. Ensure backward compatibility with existing secrets
3. Add appropriate error handling and logging
4. Update this documentation accordingly
