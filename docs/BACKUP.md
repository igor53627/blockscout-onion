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
   - Pros: Air-gapped, physically secure
   - Cons: Can be lost or damaged
   - Best for: Home/small deployments

2. **Encrypted Cloud Storage**
   - Pros: Always accessible, redundant
   - Cons: Requires strong encryption
   - Best for: Distributed teams
   - Examples: Encrypted AWS S3, encrypted Dropbox

3. **Password Manager** (for small keys)
   - Pros: Encrypted, accessible, backed up
   - Cons: Limited to small files
   - Best for: Personal projects
   - Examples: 1Password, Bitwarden (attach files)

4. **Hardware Security Module (HSM)**
   - Pros: Maximum security
   - Cons: Expensive, complex
   - Best for: High-value production services

5. **Multiple Locations**
   - **Best practice**: 3-2-1 rule
     - **3** copies of data
     - **2** different storage types
     - **1** off-site backup

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

## Disaster Recovery Plan

### Scenario 1: Server Failure

1. Provision new server
2. Install Docker and Docker Compose
3. Clone repository
4. Restore backup to `tor_data/hidden_service/`
5. Fix permissions
6. Start service: `docker compose up -d`
7. Verify .onion address matches

### Scenario 2: Accidental Deletion

1. Stop services: `docker compose down`
2. Restore from most recent backup
3. Fix permissions
4. Restart: `docker compose up -d`
5. Verify in logs: "Using existing hidden service keys"

### Scenario 3: Corrupted Keys

If keys are corrupted but you have backup:

1. Stop service
2. Delete corrupted keys: `rm -rf tor_data/hidden_service/*`
3. Restore from backup
4. Fix permissions
5. Restart service

## Security Considerations

### Protecting Backups

1. **Always encrypt backups** containing secret keys
2. **Use strong passphrases**: At least 20 characters, random
3. **Separate encryption key from backup**: Don't store passphrase with backup
4. **Verify backup integrity**: Check checksums
5. **Secure transport**: Use SCP/SFTP, not FTP or unencrypted channels

### Access Control

```bash
# Restrict access to backup directory
chmod 700 /secure/backup/location

# Encrypt backup with strong cipher
gpg -c --cipher-algo AES256 --s2k-digest-algo SHA512

# Set up backup rotation to limit exposure window
```

## Backup Checklist

Before deploying to production, ensure:

- [ ] Backup procedure documented
- [ ] Automated backup script configured
- [ ] Backups stored in at least 2 locations
- [ ] At least one off-site backup exists
- [ ] Restore procedure tested successfully
- [ ] Team members know how to restore
- [ ] Backup encryption passphrase stored securely
- [ ] Backup monitoring/alerts configured

## Emergency Contact

In case of lost keys without backup:

1. There is **no recovery possible**
2. You must generate a new .onion address
3. You'll need to notify all users of the new address
4. Old .onion address is **permanently lost**

**Prevention is the only cure** - backup early, backup often!

## Additional Resources

- [Tor Project: Hidden Services Best Practices](https://community.torproject.org/onion-services/advanced/dos/)
- [GPG Encryption Guide](https://www.gnupg.org/gph/en/manual.html)
- 3-2-1 Backup Strategy: [link](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/)
