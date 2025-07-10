# 🚀 CI/CD Setup Guide - GitHub Actions + AWS ECS

This guide will help you set up a complete CI/CD pipeline that automatically builds Docker images, pushes them to Docker Hub, and deploys to AWS ECS.

## 📋 Overview

The CI/CD pipeline includes:
- **GitHub Actions** for automation
- **Docker Hub** for image storage
- **AWS ECS** for container orchestration
- **AWS RDS** for database
- **AWS ALB** for load balancing
- **AWS ECR** for additional image storage

## 🎯 Pipeline Flow

```
Code Push → GitHub Actions → Build Images → Push to Docker Hub → Deploy to AWS ECS
```

## 📁 Files Created

- `.github/workflows/ci-cd.yml` - Main CI/CD workflow
- `scripts/setup-aws-infrastructure.sh` - AWS infrastructure setup
- `CI_CD_SETUP_GUIDE.md` - This guide

## 🛠️ Step-by-Step Setup

### **Step 1: Prerequisites**

**Install Required Tools:**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install jq (for JSON parsing)
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS
```

**Configure AWS:**
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)
```

### **Step 2: Setup AWS Infrastructure**

**Run the infrastructure setup script:**
```bash
chmod +x scripts/setup-aws-infrastructure.sh
./scripts/setup-aws-infrastructure.sh
```

This script will create:
- ✅ VPC with public subnets
- ✅ Security groups for ALB, ECS, and RDS
- ✅ RDS DocumentDB cluster
- ✅ ECR repositories
- ✅ ECS cluster
- ✅ IAM roles for ECS tasks
- ✅ Application Load Balancer
- ✅ CloudWatch log groups
- ✅ S3 bucket for file uploads

**Expected Output:**
```
[INFO] Starting AWS infrastructure setup...
[SUCCESS] AWS CLI and credentials configured
[INFO] Creating VPC and networking resources...
[SUCCESS] VPC created: vpc-xxxxxxxxx
[SUCCESS] Internet Gateway created: igw-xxxxxxxxx
[SUCCESS] Public subnets created: subnet-xxxxxxxxx, subnet-xxxxxxxxx
[SUCCESS] Route table created: rtb-xxxxxxxxx
[SUCCESS] VPC information saved to vpc-info.json
...
[SUCCESS] AWS infrastructure setup completed!
```

### **Step 3: Configure GitHub Secrets**

**Go to your GitHub repository:**
1. Navigate to `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add each secret from the generated `github-secrets-template.md`

**Required Secrets:**

**AWS Credentials:**
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

**Docker Hub:**
- `DOCKER_USERNAME` - shahrukh0396
- `DOCKER_PASSWORD` - Your Docker Hub password/token

**AWS Resources:**
- `ECS_EXECUTION_ROLE_ARN` - From infrastructure setup
- `ECS_TASK_ROLE_ARN` - From infrastructure setup

**Database:**
- `MONGO_URI` - From infrastructure setup

**JWT:**
- `JWT_SECRET` - Your JWT secret key

**URLs (Update with your domains):**
- `CLIENT_URL` - https://client.yourdomain.com
- `EMPLOYEE_URL` - https://employee.yourdomain.com
- `ADMIN_URL` - https://admin.yourdomain.com
- `VITE_API_URL` - https://api.yourdomain.com
- `BACKEND_URL` - https://api.yourdomain.com

**Email Configuration:**
- `EMAIL_HOST` - smtp.gmail.com
- `EMAIL_PORT` - 587
- `EMAIL_USER` - your-email@gmail.com
- `EMAIL_PASS` - your-app-password

**Stripe (Use test keys for staging):**
- `STRIPE_SECRET_KEY` - sk_test_...
- `STRIPE_PUBLISHABLE_KEY` - pk_test_...
- `STRIPE_WEBHOOK_SECRET` - whsec_...

**S3:**
- `AWS_S3_BUCKET` - From infrastructure setup

### **Step 4: Create ECS Services**

**Create the ECS services manually (one-time setup):**

```bash
# Get the information from the infrastructure setup
CLUSTER_NAME="linton-staging-cluster"
SUBNET_1=$(jq -r '.subnet_1' vpc-info.json)
SUBNET_2=$(jq -r '.subnet_2' vpc-info.json)
ECS_SG=$(jq -r '.ecs_security_group' security-groups.json)
ALB_ARN=$(jq -r '.alb_arn' alb-info.json)

# Create target groups
aws elbv2 create-target-group \
  --name linton-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
  --target-type ip

aws elbv2 create-target-group \
  --name linton-client-portal-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
  --target-type ip

aws elbv2 create-target-group \
  --name linton-employee-portal-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
  --target-type ip

aws elbv2 create-target-group \
  --name linton-admin-panel-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
  --target-type ip

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

# Create ECS services
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name linton-backend-service \
  --task-definition linton-backend:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text),containerName=linton-backend,containerPort=3000"

# Repeat for other services...
```

### **Step 5: Test the Pipeline**

**Push to trigger the pipeline:**
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

**Monitor the deployment:**
1. Go to your GitHub repository
2. Click on `Actions` tab
3. Watch the workflow run

**Expected Workflow Jobs:**
1. ✅ **Build and Test** - Install dependencies and run tests
2. ✅ **Build Images** - Build and push Docker images to Docker Hub
3. ✅ **Deploy to AWS** - Deploy to ECS
4. ✅ **Health Check** - Verify deployment

## 🔧 Configuration Options

### **Environment Variables**

The workflow uses these environment variables:
```yaml
env:
  DOCKER_USERNAME: shahrukh0396
  AWS_REGION: us-east-1
  ECS_CLUSTER: linton-staging-cluster
  ECS_SERVICE_BACKEND: linton-backend-service
  ECS_SERVICE_CLIENT_PORTAL: linton-client-portal-service
  ECS_SERVICE_EMPLOYEE_PORTAL: linton-employee-portal-service
  ECS_SERVICE_ADMIN_PANEL: linton-admin-panel-service
```

### **Trigger Conditions**

The pipeline triggers on:
- Push to `main` or `develop` branches
- Push of tags starting with `v*`
- Pull requests to `main` or `develop`

### **Image Tagging Strategy**

Images are tagged with:
- Branch name (e.g., `main`, `develop`)
- Git SHA (e.g., `main-abc123`)
- Semantic version (e.g., `v1.0.0`, `v1.0`)

## 📊 Monitoring and Logs

### **AWS CloudWatch Logs**

View logs for each service:
```bash
# Backend logs
aws logs describe-log-streams --log-group-name /ecs/linton-backend

# Client portal logs
aws logs describe-log-streams --log-group-name /ecs/linton-client-portal

# Employee portal logs
aws logs describe-log-streams --log-group-name /ecs/linton-employee-portal

# Admin panel logs
aws logs describe-log-streams --log-group-name /ecs/linton-admin-panel
```

### **ECS Service Status**

Check service status:
```bash
aws ecs describe-services \
  --cluster linton-staging-cluster \
  --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service
```

### **Load Balancer Health**

Check ALB health:
```bash
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
```

## 🚨 Troubleshooting

### **Common Issues**

**1. AWS Credentials Error:**
```
Error: AWS credentials not configured
```
**Solution:** Run `aws configure` and add credentials to GitHub secrets

**2. ECS Service Not Found:**
```
Error: Service not found
```
**Solution:** Create ECS services manually using the commands above

**3. Docker Hub Authentication Error:**
```
Error: unauthorized: authentication required
```
**Solution:** Check Docker Hub credentials in GitHub secrets

**4. Database Connection Error:**
```
Error: MongoDB connection failed
```
**Solution:** Verify MONGO_URI secret and RDS security group

### **Debug Commands**

**Check AWS resources:**
```bash
# List ECS clusters
aws ecs list-clusters

# List ECS services
aws ecs list-services --cluster linton-staging-cluster

# List ECR repositories
aws ecr describe-repositories

# List RDS clusters
aws docdb describe-db-clusters
```

**Check GitHub Actions logs:**
1. Go to repository → Actions
2. Click on the failed workflow
3. Click on the failed job
4. Check the logs for specific errors

## 💰 Cost Estimation

**Monthly AWS Costs (estimated):**
- ECS Fargate: $50-100
- RDS DocumentDB: $100-200
- ALB: $20
- ECR Storage: $5-10
- Data Transfer: $10-20
- CloudWatch: $5-10
- **Total: ~$190-360/month**

## 🔄 Updating the Pipeline

### **Add New Services**

1. Add service to workflow:
```yaml
- name: Build and push New Service image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile.new-service
    push: true
    tags: ${{ env.DOCKER_USERNAME }}/linton-new-service:${{ steps.meta.outputs.version }}
```

2. Add ECS service deployment
3. Update infrastructure script

### **Change Environment**

1. Update environment variables in workflow
2. Update secrets in GitHub
3. Update infrastructure configuration

### **Add Custom Domains**

1. Configure Route 53
2. Add SSL certificates via ACM
3. Update ALB listeners
4. Update URL secrets

## 📞 Support

If you encounter issues:

1. **Check the logs** in GitHub Actions
2. **Verify AWS resources** using AWS CLI
3. **Check security groups** and network configuration
4. **Review IAM permissions** for ECS roles

## 🎉 Success!

Once everything is set up:

- ✅ **Automatic deployments** on code push
- ✅ **Docker images** stored in Docker Hub
- ✅ **Scalable infrastructure** on AWS
- ✅ **Health monitoring** and logging
- ✅ **Rollback capability** via ECS

Your CI/CD pipeline is now ready! 🚀 