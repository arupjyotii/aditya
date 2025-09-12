# Aditya Hospital - VPS Deployment Guide

A complete hospital management system with Node.js backend and admin panel.

## 🚀 VPS Deployment Instructions

### Prerequisites

1. **VPS Server Requirements:**
   - Ubuntu 20.04+ or CentOS 8+
   - Minimum 2GB RAM
   - 20GB+ storage
   - Root or sudo access

2. **Install Required Software:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install PM2 (optional, for process management)
   sudo npm install -g pm2
   ```

### Deployment Steps

1. **Upload Files to VPS:**
   ```bash
   # Using SCP
   scp -r . user@your-server-ip:/tmp/aditya-hospital/
   
   # Or using rsync
   rsync -avz --exclude node_modules . user@your-server-ip:/tmp/aditya-hospital/
   ```

2. **Run Deployment Script:**
   ```bash
   cd /tmp/aditya-hospital
   sudo chmod +x deploy.sh
   sudo ./deploy.sh
   ```

3. **Configure Nginx:**
   ```bash
   # Copy nginx configuration
   sudo cp nginx.conf /etc/nginx/sites-available/aditya-hospital
   sudo ln -s /etc/nginx/sites-available/aditya-hospital /etc/nginx/sites-enabled/
   
   # Remove default site
   sudo rm /etc/nginx/sites-enabled/default
   
   # Test and reload nginx
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL Certificate (Optional but Recommended):**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   sudo certbot --nginx -d adityahospitalnagaon.com -d www.adityahospitalnagaon.com
   ```

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Create Application Directory:**
   ```bash
   sudo mkdir -p /var/www/aditya-hospital
   cd /var/www/aditya-hospital
   ```

2. **Copy Files:**
   ```bash
   sudo cp -r /tmp/aditya-hospital/* .
   sudo chown -R www-data:www-data .
   ```

3. **Install Dependencies:**
   ```bash
   npm install --production
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Environment Configuration

Create `.env` file in the application directory:
```bash
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATA_DIRECTORY=/var/www/aditya-hospital/data
JWT_SECRET=your-secure-jwt-secret-here
```

### Monitoring & Maintenance

1. **Check Application Status:**
   ```bash
   sudo systemctl status aditya-hospital
   ```

2. **View Logs:**
   ```bash
   sudo journalctl -u aditya-hospital -f
   ```

3. **Restart Application:**
   ```bash
   sudo systemctl restart aditya-hospital
   ```

4. **Database Backup:**
   ```bash
   cp /var/www/aditya-hospital/data/database.sqlite /var/backups/aditya-hospital/
   ```

### Admin Access

- **URL:** `https://your-domain.com/admin`
- **Username:** `joonborah`
- **Password:** `r4nd0mP@ssw0rd123`

### API Endpoints

- Health Check: `GET /health`
- Public Departments: `GET /api/public/departments`
- Public Doctors: `GET /api/public/doctors`
- Public Services: `GET /api/public/services`
- Admin Login: `POST /api/auth/login`

### Troubleshooting

1. **Port Already in Use:**
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **Permission Issues:**
   ```bash
   sudo chown -R www-data:www-data /var/www/aditya-hospital
   sudo chmod -R 755 /var/www/aditya-hospital
   ```

3. **Database Issues:**
   ```bash
   # Reset database
   rm /var/www/aditya-hospital/data/database.sqlite
   sudo systemctl restart aditya-hospital
   ```

### Security Recommendations

1. **Firewall Configuration:**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update
   ```

3. **Change Default Credentials:**
   - Update the admin password in `server/index.js`
   - Generate a new JWT secret

## 🏥 Features

- **Admin Panel:** Complete hospital management system
- **Department Management:** Add, edit, delete departments
- **Doctor Profiles:** Manage doctor information and schedules
- **Services Management:** Hospital services and descriptions
- **Public API:** Frontend integration endpoints
- **Authentication:** JWT-based admin authentication
- **Database:** SQLite with automatic initialization

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite with Kysely ORM
- **Authentication:** JWT tokens
- **Process Management:** Systemd service
- **Web Server:** Nginx reverse proxy
- **SSL:** Let's Encrypt (Certbot)

## 📞 Support

For deployment support or issues, please check the logs and ensure all prerequisites are met.