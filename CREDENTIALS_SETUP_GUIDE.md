# 🔐 Credentials Setup Guide - CI/CD Pipeline

This guide will help you set up all the required credentials for the CI/CD pipeline to work properly.

## 📋 Required Credentials Overview

### **1. AWS Credentials**
- AWS Access Key ID
- AWS Secret Access Key
- IAM User with proper permissions

### **2. Docker Hub Credentials**
- Docker Hub Username
- Docker Hub Access Token

### **3. Application Secrets**
- Database connection string
- JWT secret
- Email configuration
- Stripe keys
- Application URLs

## 🛠️ Step-by-Step Setup

### **Step 1: AWS Credentials Setup**

#### **1.1 Create IAM User**

1. **Go to AWS Console:**
   - Navigate to IAM → Users
   - Click "Create user"

2. **User Details:**
   ```
   User name: linton-ci-cd-user
   Access type: Programmatic access
   ```

3. **Attach Policies:**
   ```
   AmazonECS-FullAccess
   AmazonECR-FullAccess
   AmazonRDS-FullAccess
   AmazonVPC-FullAccess
   ElasticLoadBalancing-FullAccess
   CloudWatchLogs-FullAccess
   AmazonS3-FullAccess
   IAM-FullAccess
   ```

4. **Create Access Keys:**
   - Go to the created user
   - Click "Security credentials" tab
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Save the **Access Key ID** and **Secret Access Key**

#### **1.2 Alternative: Use AWS CLI to Create User**

```bash
# Create IAM user
aws iam create-user --user-name linton-ci-cd-user

# Create access key
aws iam create-access-key --user-name linton-ci-cd-user

# Attach required policies
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/AmazonECS-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/AmazonECR-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/AmazonRDS-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/AmazonVPC-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/ElasticLoadBalancing-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/CloudWatchLogs-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/AmazonS3-FullAccess
aws iam attach-user-policy --user-name linton-ci-cd-user --policy-arn arn:aws:iam::aws:policy/IAM-FullAccess
```

### **Step 2: Docker Hub Credentials Setup**

#### **2.1 Create Docker Hub Access Token**

1. **Go to Docker Hub:**
   - Navigate to Account Settings → Security
   - Click "New Access Token"

2. **Token Details:**
   ```
   Token name: linton-ci-cd-token
   Expiration: 1 year (or as needed)
   ```

3. **Save the token** - you won't be able to see it again!

#### **2.2 Test Docker Hub Login**

```bash
# Test login with token
docker login -u shahrukh0396 -p your_access_token
```

### **Step 3: GitHub Secrets Setup**

#### **3.1 Navigate to GitHub Secrets**

1. Go to your GitHub repository
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"

#### **3.2 Add Required Secrets**

**AWS Credentials:**
```
Name: AWS_ACCESS_KEY_ID
Value: AKIA... (your access key ID)

Name: AWS_SECRET_ACCESS_KEY
Value: ... (your secret access key)
```

**Docker Hub:**
```
Name: DOCKER_USERNAME
Value: shahrukh0396

Name: DOCKER_PASSWORD
Value: dckr_... (your Docker Hub access token)
```

**Application Secrets (update with your values):**
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-in-production

Name: EMAIL_HOST
Value: smtp.gmail.com

Name: EMAIL_PORT
Value: 587

Name: EMAIL_USER
Value: your-email@gmail.com

Name: EMAIL_PASS
Value: your-app-password

Name: STRIPE_SECRET_KEY
Value: sk_test_... (your Stripe test secret key)

Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_... (your Stripe test publishable key)

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (your Stripe webhook secret)
```

**URLs (update with your actual domains):**
```
Name: CLIENT_URL
Value: https://client.yourdomain.com

Name: EMPLOYEE_URL
Value: https://employee.yourdomain.com

Name: ADMIN_URL
Value: https://admin.yourdomain.com

Name: VITE_API_URL
Value: https://api.yourdomain.com

Name: BACKEND_URL
Value: https://api.yourdomain.com
```

### **Step 4: Get AWS Resource ARNs**

After running the infrastructure setup script, you'll get these values:

#### **4.1 From Infrastructure Setup**

The `scripts/setup-aws-infrastructure.sh` script will generate:
- `iam-info.json` - Contains IAM role ARNs
- `database-info.json` - Contains database connection string
- `s3-info.json` - Contains S3 bucket name

#### **4.2 Add AWS Resource Secrets**

```
Name: ECS_EXECUTION_ROLE_ARN
Value: arn:aws:iam::123456789012:role/ecsTaskExecutionRole

Name: ECS_TASK_ROLE_ARN
Value: arn:aws:iam::123456789012:role/ecsTaskRole

Name: MONGO_URI
Value: mongodb://admin:YourSecurePassword123@your-docdb-cluster:27017/linton-portals?authSource=admin

Name: AWS_S3_BUCKET
Value: linton-portals-staging-1234567890
```

## 🔍 Verification Steps

### **1. Test AWS Credentials**

```bash
# Test AWS credentials
aws sts get-caller-identity

# Should return:
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/linton-ci-cd-user"
}
```

### **2. Test Docker Hub Credentials**

```bash
# Test Docker Hub login
docker login -u shahrukh0396 -p your_access_token

# Should return: Login Succeeded
```

### **3. Test GitHub Secrets**

1. Go to GitHub repository → Settings → Secrets
2. Verify all required secrets are present
3. Check that secret names match exactly (case-sensitive)

## 🚨 Security Best Practices

### **1. AWS Security**

- ✅ Use IAM user with minimal required permissions
- ✅ Rotate access keys regularly
- ✅ Never commit credentials to code
- ✅ Use environment-specific credentials

### **2. Docker Hub Security**

- ✅ Use access tokens instead of passwords
- ✅ Set appropriate token expiration
- ✅ Use read-only tokens if possible

### **3. GitHub Security**

- ✅ All secrets are encrypted
- ✅ Secrets are only accessible to repository admins
- ✅ Audit trail for secret access

## 📋 Complete Secrets Checklist

**Required GitHub Secrets:**

- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `DOCKER_USERNAME`
- [ ] `DOCKER_PASSWORD`
- [ ] `ECS_EXECUTION_ROLE_ARN`
- [ ] `ECS_TASK_ROLE_ARN`
- [ ] `MONGO_URI`
- [ ] `JWT_SECRET`
- [ ] `CLIENT_URL`
- [ ] `EMPLOYEE_URL`
- [ ] `ADMIN_URL`
- [ ] `VITE_API_URL`
- [ ] `BACKEND_URL`
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `AWS_S3_BUCKET`

## 🔧 Troubleshooting

### **Common Issues:**

**1. AWS Credentials Error:**
```
Error: The security token included in the request is invalid
```
**Solution:** Check access key and secret key in GitHub secrets

**2. Docker Hub Authentication Error:**
```
Error: unauthorized: authentication required
```
**Solution:** Verify Docker Hub username and access token

**3. IAM Permission Error:**
```
Error: User: arn:aws:iam::... is not authorized to perform: ...
```
**Solution:** Add missing IAM policies to the user

**4. GitHub Secrets Not Found:**
```
Error: Required secret 'AWS_ACCESS_KEY_ID' not found
```
**Solution:** Check secret name spelling and case

## 🎯 Next Steps

1. **Create AWS IAM user** with proper permissions
2. **Create Docker Hub access token**
3. **Add all secrets** to GitHub repository
4. **Run infrastructure setup** script
5. **Test the pipeline** with a code push

Once all credentials are properly configured, your CI/CD pipeline will be ready to deploy automatically! 🚀 