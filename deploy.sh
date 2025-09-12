#!/bin/bash

# Aditya Hospital VPS Deployment Script
# Usage: ./deploy.sh

set -e

echo "🏥 Starting Aditya Hospital deployment..."

# Configuration
APP_NAME="aditya-hospital"
APP_DIR="/var/www/aditya-hospital"
BACKUP_DIR="/var/backups/aditya-hospital"
SERVICE_NAME="aditya-hospital"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/data
mkdir -p $APP_DIR/logs
mkdir -p $BACKUP_DIR

# Copy application files
print_status "Copying application files..."
cp -r server/ $APP_DIR/
cp -r public/ $APP_DIR/dist/
cp package.json $APP_DIR/
cp ecosystem.config.js $APP_DIR/

# Set proper permissions
print_status "Setting permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/data
chmod -R 775 $APP_DIR/logs

# Install Node.js dependencies
print_status "Installing dependencies..."
cd $APP_DIR
npm install --production

# Create systemd service
print_status "Creating systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Aditya Hospital Node.js Application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=HOST=0.0.0.0
Environment=DATA_DIRECTORY=$APP_DIR/data
StandardOutput=append:$APP_DIR/logs/app.log
StandardError=append:$APP_DIR/logs/error.log

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
print_status "Enabling service..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME

# Start the service
print_status "Starting service..."
systemctl start $SERVICE_NAME

# Check service status
if systemctl is-active --quiet $SERVICE_NAME; then
    print_status "✅ Service started successfully!"
    systemctl status $SERVICE_NAME --no-pager
else
    print_error "❌ Service failed to start!"
    systemctl status $SERVICE_NAME --no-pager
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
print_status "Application is running on: http://your-server-ip:3001"
print_status "Health check: http://your-server-ip:3001/health"
print_status ""
print_status "Useful commands:"
print_status "  - Check status: sudo systemctl status $SERVICE_NAME"
print_status "  - View logs: sudo journalctl -u $SERVICE_NAME -f"
print_status "  - Restart: sudo systemctl restart $SERVICE_NAME"
print_status "  - Stop: sudo systemctl stop $SERVICE_NAME"