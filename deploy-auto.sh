#!/bin/bash
#
# Auto-Deploy Script for Raspberry Pi
# Runs on Pi via cron to automatically pull and deploy changes
#
# Configuration
REPO_DIR="/home/rwondoll/app/greenhouse-monitor"
LOG_FILE="/home/rwondoll/deploy.log"
SERVICE_NAME="greenhouse-monitor"
# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}
# Change to repository directory
cd "$REPO_DIR" || exit 1
log "--- Checking for updates ---"
# Fetch latest changes from GitHub
git fetch origin main 2>&1 | tee -a "$LOG_FILE"
# Get current and remote commit hashes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
# Check if there are changes
if [ "$LOCAL" = "$REMOTE" ]; then
    log "No changes detected"
    exit 0
fi
log "Changes detected! Local: ${LOCAL:0:7}, Remote: ${REMOTE:0:7}"
log "Starting deployment..."
# Pull latest changes
log "Pulling code from GitHub..."
if ! git pull origin main 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Git pull failed"
    exit 1
fi
# Install dependencies
log "Installing dependencies..."
if ! npm install 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: npm install failed"
    exit 1
fi
# Build application
log "Building application..."
if ! npm run build 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Build failed"
    exit 1
fi
# Restart service
log "Restarting $SERVICE_NAME service..."
if ! sudo systemctl restart "$SERVICE_NAME" 2>&1 | tee -a "$LOG_FILE"; then
    log "ERROR: Service restart failed"
    exit 1
fi
# Wait for service to start
log "Waiting for service to start..."
sleep 5
# Verify service is running
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    COMMIT=$(git rev-parse --short HEAD)
    log "SUCCESS: Deployment completed! Commit: $COMMIT"
    log "Dashboard: http://greenhouse.local:3000"
else
    log "ERROR: Service failed to start"
    sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager | tee -a "$LOG_FILE"
    exit 1
fi
log "--- Deployment finished ---"
