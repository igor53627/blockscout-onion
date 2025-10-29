FROM alpine:latest

# Install Tor, nginx for HTTPS proxying
RUN apk update && \
    apk add --no-cache tor curl nginx su-exec && \
    rm -rf /var/cache/apk/*

# Create directory for hidden service
RUN mkdir -p /var/lib/tor/hidden_service && \
    chown -R tor:tor /var/lib/tor

# Copy Tor configuration
COPY torrc /etc/tor/torrc

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static HTML files
RUN mkdir -p /var/www/html
COPY html/ /var/www/html/

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create nginx directories and set permissions
RUN mkdir -p /var/tmp/nginx /var/lib/nginx/logs && \
    chown -R tor:tor /var/tmp/nginx /var/lib/nginx

# Don't switch to tor user - entrypoint will handle running processes with appropriate users

EXPOSE 9050 9051

ENTRYPOINT ["/entrypoint.sh"]
