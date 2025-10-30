# Backup and Recovery Guide

Your .onion address is cryptographically tied to your hidden service keys. **Losing them means losing your address permanently.** There is no way to recover a lost .onion address.

## Why Backup?

- Your `.onion` address is your identity on the Tor network
- Users bookmark and share your .onion address
- Lost keys = lost address = lost users and trust
- No recovery mechanism exists - backups are your only option

## What to Backup

The critical files in `tor_data/hidden_service/`:

```
tor_data/hidden_service/
├── hostname                    # Your .onion address (text file)
├── hs_ed25519_public_key      # Public key (64 bytes)
└── hs_ed25519_secret_key      # Secret key (96 bytes) - CRITICAL
```

**Most important**: `hs_ed25519_secret_key` - This is the master key. Protect it like a password.

## Basic Backup Methods

### Method 1: Simple Tar Archive

```bash
# Create backup
tar -czf hidden_service_backup_$(date +%Y%m%d).tar.gz tor_data/hidden_service/

# Verify backup
tar -tzf hidden_service_backup_20251030.tar.gz
```

**Pros**: Simple, fast, compatible everywhere
**Cons**: Unencrypted, anyone with the file can steal your .onion address

### Method 2: Encrypted Backup with GPG

```bash
# Create encrypted backup
tar -czf - tor_data/hidden_service/ | \
  gpg -c > hidden_service_backup_$(date +%Y%m%d).tar.gz.gpg

# You'll be prompted for a passphrase - use a strong one!
```

**Pros**: Encrypted, secure
**Cons**: Must remember passphrase

### Method 3: Encrypted with Public Key

```bash
# Create backup encrypted to your GPG key
tar -czf - tor_data/hidden_service/ | \
  gpg -e -r your@email.com > hidden_service_backup_$(date +%Y%m%d).tar.gz.gpg
```

**Pros**: Very secure, no passphrase to remember
**Cons**: Requires GPG key setup

## Automated Backup Script

Create `backup_onion_keys.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="/secure/backup/location"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/onion_backup_$DATE.tar.gz.gpg"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create encrypted backup
tar -czf - tor_data/hidden_service/ | \
  gpg -c --cipher-algo AES256 > "$BACKUP_FILE"

# Keep only last 30 backups
ls -t "$BACKUP_DIR"/onion_backup_*.tar.gz.gpg | tail -n +31 | xargs -r rm

echo "Backup created: $BACKUP_FILE"
```

Make it executable and add to cron:

```bash
chmod +x backup_onion_keys.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /path/to/backup_onion_keys.sh
```

## Restore Procedures

### Restore from Tar Archive

```bash
# Extract backup
tar -xzf hidden_service_backup_20251030.tar.gz

# Set correct permissions
chmod 700 tor_data/hidden_service
chmod 600 tor_data/hidden_service/*

# Restart service
docker compose restart
```

### Restore from Encrypted Backup

```bash
# Decrypt and extract
gpg -d hidden_service_backup_20251030.tar.gz.gpg | tar -xzf -

# Set correct permissions
chmod 700 tor_data/hidden_service
chmod 600 tor_data/hidden_service/*

# Restart service
docker compose restart
```

### Verify Restoration

```bash
# Check files exist
ls -la tor_data/hidden_service/

# Verify .onion address matches
cat tor_data/hidden_service/hostname

# Check logs after restart
docker compose logs tor | grep "Using existing"
```

## Backup Storage Locations

### Recommended Storage Options

1. **Offline USB Drive**
   - Air-gapped, physically secure
   - Best for: Home/small deployments

2. **Encrypted Cloud Storage**
   - Always accessible, redundant
   - Examples: Encrypted Dropbox, Google Drive

3. **Password Manager**
   - For small key files
   - Examples: 1Password, Bitwarden (attach files)

**Best practice**: Keep at least 2 copies in different locations

### What NOT to Do

- ❌ Don't store unencrypted backups in cloud storage
- ❌ Don't email backups to yourself
- ❌ Don't commit keys to git repositories
- ❌ Don't store on the same server (defeats the purpose)
- ❌ Don't forget your encryption passphrase

## Testing Your Backups

**Critical**: Test your backup and restore process regularly!

```bash
# Create test directory
mkdir -p /tmp/backup_test

# Restore to test directory
cd /tmp/backup_test
gpg -d /path/to/backup.tar.gz.gpg | tar -xzf -

# Verify files
ls -la tor_data/hidden_service/
cat tor_data/hidden_service/hostname

# Clean up
cd -
rm -rf /tmp/backup_test
```

**Schedule**: Test restores monthly or quarterly.

## Disaster Recovery

If you lose access to your keys:

1. **Stop the service**: `docker compose down`
2. **Restore from backup**: Follow restore procedure above
3. **Fix permissions**: `chmod 700 tor_data/hidden_service && chmod 600 tor_data/hidden_service/*`
4. **Restart**: `docker compose up -d`
5. **Verify**: Check logs show "Using existing hidden service keys"

## Important Reminders

- ⚠️ **No backup = No recovery** - Lost keys are permanent
- 🔐 **Always encrypt backups** containing secret keys
- 📍 **Store in 2+ locations** - Don't rely on a single backup
- ✅ **Test your backups** - Verify you can actually restore
