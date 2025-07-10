# 🚀 Linton Portals - Staging Deployment Guide

## 📋 Overview

This guide provides multiple deployment options for the Linton Portals staging environment. Choose the option that best fits your infrastructure and requirements.

## 🎯 Deployment Options

### **Option 1: Docker Compose (Local/Server) - RECOMMENDED**
- ✅ **Easiest to set up**
- ✅ **Perfect for testing and development**
- ✅ **No cloud costs**
- ✅ **Full control over environment**

### **Option 2: AWS ECS + RDS**
- ✅ **Production-ready**
- ✅ **Scalable and reliable**
- ✅ **Managed services**
- ❌ **Requires AWS account and costs**

### **Option 3: DigitalOcean App Platform**
- ✅ **Simple deployment**
- ✅ **Managed infrastructure**
- ✅ **Good for small to medium projects**

### **Option 4: Railway/Render**
- ✅ **Free tier available**
- ✅ **Simple deployment**
- ✅ **Good for prototypes**

---

## 🐳 Option 1: Docker Compose Deployment

### **Prerequisites**
- Docker and Docker Compose installed
- Git repository cloned
- Basic server (VPS, EC2, etc.) or local machine

### **Quick Start**

1. **Clone and setup:**
```bash
git clone <your-repo>
cd linton-client-portal
```

2. **Configure environment:**
```bash
cp env.staging.example .env
# Edit .env with your actual values
```

3. **Deploy:**
```bash
chmod +x deploy-staging.sh
./deploy-staging.sh
```

### **Available Commands**
```bash
./deploy-staging.sh deploy    # Deploy everything
./deploy-staging.sh stop      # Stop all services
./deploy-staging.sh logs      # View logs
./deploy-staging.sh restart   # Restart services
./deploy-staging.sh update    # Update and redeploy
./deploy-staging.sh build     # Build images only
```

### **Access URLs**
- **Backend API:** `http://your-server:3000`
- **API Docs:** `http://your-server:3000/api-docs`
- **Client Portal:** `http://your-server:5173`
- **Employee Portal:** `http://your-server:5174`
- **Admin Panel:** `http://your-server:5175`

### **Default Credentials**
- **Super Admin:** `superadmin@linton.com` / `SuperAdmin123!`

---

## ☁️ Option 2: AWS ECS Deployment

### **Prerequisites**
- AWS CLI installed and configured
- AWS account with appropriate permissions
- Domain name (optional but recommended)

### **Deployment Steps**

1. **Setup AWS credentials:**
```bash
aws configure
```

2. **Deploy to AWS:**
```bash
chmod +x aws-deploy.sh
./aws-deploy.sh deploy
```

### **AWS Services Used**
- **ECS (Elastic Container Service)** - Container orchestration
- **ECR (Elastic Container Registry)** - Docker image storage
- **RDS (DocumentDB)** - MongoDB-compatible database
- **ALB (Application Load Balancer)** - Load balancing
- **VPC** - Network isolation
- **Security Groups** - Network security

### **Estimated Costs (Monthly)**
- ECS: ~$50-100
- RDS: ~$100-200
- ALB: ~$20
- **Total: ~$170-320/month**

---

## 🌊 Option 3: DigitalOcean App Platform

### **Prerequisites**
- DigitalOcean account
- doctl CLI installed

### **Deployment Steps**

1. **Install doctl:**
```bash
# macOS
brew install doctl

# Linux
snap install doctl
```

2. **Authenticate:**
```bash
doctl auth init
```

3. **Deploy:**
```bash
# Create app specification
doctl apps create --spec app-spec.yml
```

### **App Specification (app-spec.yml)**
```yaml
name: linton-portals-staging
services:
- name: backend
  source_dir: packages/backend
  dockerfile_path: Dockerfile.backend
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-s

- name: client-portal
  source_dir: packages/client-portal
  dockerfile_path: Dockerfile.client-portal
  http_port: 80
  instance_count: 1
  instance_size_slug: basic-s

- name: employee-portal
  source_dir: packages/employee-portal
  dockerfile_path: Dockerfile.employee-portal
  http_port: 80
  instance_count: 1
  instance_size_slug: basic-s

- name: admin-panel
  source_dir: packages/admin-panel
  dockerfile_path: Dockerfile.admin-panel
  http_port: 80
  instance_count: 1
  instance_size_slug: basic-s

databases:
- name: mongodb
  engine: MONGODB
  version: "6.0"
```

---

## 🚂 Option 4: Railway/Render Deployment

### **Railway Deployment**

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and deploy:**
```bash
railway login
railway init
railway up
```

### **Render Deployment**

1. **Create render.yaml:**
```yaml
services:
- type: web
  name: linton-backend
  env: node
  buildCommand: cd packages/backend && npm install
  startCommand: cd packages/backend && npm start
  envVars:
  - key: NODE_ENV
    value: staging
  - key: MONGO_URI
    sync: false

- type: web
  name: linton-client-portal
  env: static
  buildCommand: cd packages/client-portal && npm install && npm run build
  staticPublishPath: packages/client-portal/dist
```

---

## 🔧 Environment Configuration

### **Required Environment Variables**

```bash
# Database
MONGO_PASSWORD=your-secure-password
MONGO_URI=mongodb://admin:password@host:27017/db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# URLs
CLIENT_URL=https://your-client-domain.com
EMPLOYEE_URL=https://your-employee-domain.com
ADMIN_URL=https://your-admin-domain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (Test keys for staging)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API URL for frontend
VITE_API_URL=https://your-api-domain.com
```

### **Security Best Practices**

1. **Use strong passwords** for all services
2. **Enable HTTPS** in production
3. **Set up proper CORS** configuration
4. **Use environment variables** for all secrets
5. **Regular security updates** for dependencies
6. **Monitor logs** for suspicious activity

---

## 📊 Monitoring and Logging

### **Health Checks**
- Backend: `GET /health`
- Frontend: `GET /` (should return 200)

### **Log Monitoring**
```bash
# Docker Compose logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f client-portal
```

### **Performance Monitoring**
- **Backend:** Built-in Express monitoring
- **Frontend:** Browser DevTools
- **Database:** MongoDB Compass or Atlas

---

## 🔄 CI/CD Pipeline

### **GitHub Actions Example**

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ staging ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker
      uses: docker/setup-buildx-action@v2
    
    - name: Build and push images
      run: |
        docker build -f Dockerfile.backend -t your-registry/backend:${{ github.sha }} .
        docker push your-registry/backend:${{ github.sha }}
    
    - name: Deploy to staging
      run: |
        # Your deployment commands here
```

---

## 🆘 Troubleshooting

### **Common Issues**

1. **Port conflicts:**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process or change port
```

2. **Database connection issues:**
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

3. **Build failures:**
```bash
# Clear Docker cache
docker system prune -a
# Rebuild images
./deploy-staging.sh build
```

4. **Memory issues:**
```bash
# Increase Docker memory limit
# Or use smaller base images
```

### **Debug Commands**
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Access container shell
docker-compose exec [service-name] sh

# Check resource usage
docker stats
```

---

## 📞 Support

If you encounter issues:

1. **Check the logs:** `docker-compose logs`
2. **Verify environment:** Ensure all env vars are set
3. **Test connectivity:** Check if services can reach each other
4. **Review documentation:** Check this guide and README files

---

## 🎯 Next Steps

After successful staging deployment:

1. **Test all functionality** thoroughly
2. **Set up monitoring** and alerting
3. **Configure backups** for database
4. **Plan production deployment**
5. **Set up SSL certificates**
6. **Configure custom domains**

---

**Happy Deploying! 🚀** 