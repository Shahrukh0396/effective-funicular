# Troubleshooting JSON Parsing Errors in CI/CD Pipeline

## Problem Description

The error `Error parsing parameter 'cli-input-json': Invalid JSON received` occurs when the AWS CLI tries to register ECS task definitions with invalid JSON files.

## Root Cause

The issue was caused by:
1. **Missing or empty GitHub secrets** - When secrets are not set, they create invalid JSON
2. **Improper JSON generation** - The heredoc approach in GitHub Actions was not handling missing secrets properly
3. **No JSON validation** - The workflow wasn't validating JSON before sending to AWS CLI

## Solution Implemented

### 1. Python Script for Task Definition Generation

Created `scripts/generate-task-definitions.py` that:
- Properly handles missing secrets by using empty strings as defaults
- Validates JSON before writing to files
- Provides clear error messages for debugging

### 2. Updated GitHub Actions Workflow

Modified `.github/workflows/ci-cd.yml` to:
- Use the Python script instead of heredoc JSON generation
- Pass all secrets as environment variables
- Validate JSON before AWS CLI calls

### 3. Debug Scripts

Created debugging tools:
- `scripts/debug-task-definitions.sh` - For debugging deployment issues
- `scripts/test-task-definitions.sh` - For testing JSON generation locally

## How to Fix the Error

### Step 1: Verify GitHub Secrets

Ensure all required secrets are set in your GitHub repository:

```bash
# Required secrets for task definitions
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
ECS_EXECUTION_ROLE_ARN
ECS_TASK_ROLE_ARN
MONGO_URI
JWT_SECRET
CLIENT_URL
EMPLOYEE_URL
ADMIN_URL
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
VITE_API_URL
```

### Step 2: Test Locally

Run the test script to verify JSON generation:

```bash
./scripts/test-task-definitions.sh
```

### Step 3: Check AWS Resources

Verify that your AWS resources exist:

```bash
# Check ECS cluster
aws ecs describe-clusters --clusters linton-staging-cluster

# Check IAM roles
aws iam get-role --role-name ecs-execution-role
aws iam get-role --role-name ecs-task-role

# Check ECR repositories
aws ecr describe-repositories --repository-names linton-backend
aws ecr describe-repositories --repository-names linton-client-portal
aws ecr describe-repositories --repository-names linton-employee-portal
aws ecr describe-repositories --repository-names linton-admin-panel
```

### Step 4: Debug Deployment

If the error persists, run the debug script:

```bash
# Set environment variables
export AWS_REGION=us-east-2
export ECS_CLUSTER=linton-staging-cluster
export ECS_SERVICE_BACKEND=linton-backend-service
export ECS_SERVICE_CLIENT_PORTAL=linton-client-portal-service
export ECS_SERVICE_EMPLOYEE_PORTAL=linton-employee-portal-service
export ECS_SERVICE_ADMIN_PANEL=linton-admin-panel-service

# Run debug script
./scripts/debug-task-definitions.sh
```

## Common Issues and Solutions

### Issue 1: Missing IAM Role ARNs

**Error**: `Role is not valid`

**Solution**: 
1. Verify IAM roles exist in the correct region
2. Check that the role ARNs in GitHub secrets are correct
3. Ensure roles have proper permissions

```bash
# Check role ARNs
aws iam get-role --role-name ecs-execution-role --query Role.Arn --output text
aws iam get-role --role-name ecs-task-role --query Role.Arn --output text
```

### Issue 2: Missing ECS Services

**Error**: `ServiceNotFoundException`

**Solution**: Create ECS services first:

```bash
# Run the service creation script
./scripts/create-ecs-services.sh
```

### Issue 3: Invalid JSON Structure

**Error**: `Invalid JSON received`

**Solution**: 
1. Check the generated JSON files
2. Verify all secrets are properly set
3. Run the test script to validate JSON

```bash
# Check generated JSON
cat task-definition-backend.json | python3 -m json.tool
```

### Issue 4: Missing Environment Variables

**Error**: Empty values in task definitions

**Solution**: 
1. Set all required environment variables
2. Use the Python script which handles missing values gracefully
3. Check GitHub secrets are not empty

## Monitoring and Logs

### CloudWatch Logs

Check CloudWatch logs for container issues:

```bash
# Get log group names
aws logs describe-log-groups --log-group-name-prefix "/ecs/linton"

# Get recent logs
aws logs tail /ecs/linton-backend --follow
```

### ECS Service Status

Check ECS service status:

```bash
# Check service status
aws ecs describe-services \
  --cluster linton-staging-cluster \
  --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service
```

### Task Definition Status

Check task definition registration:

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix linton

# Describe specific task definition
aws ecs describe-task-definition --task-definition linton-backend
```

## Prevention

### 1. Pre-deployment Validation

Always run the test script before deployment:

```bash
./scripts/test-task-definitions.sh
```

### 2. Secret Management

- Use GitHub's secret scanning
- Regularly rotate secrets
- Validate secrets before deployment

### 3. Infrastructure as Code

- Use CloudFormation or Terraform for infrastructure
- Version control all configuration
- Test infrastructure changes in staging

## Emergency Recovery

If the deployment fails completely:

### 1. Rollback to Previous Version

```bash
# Get previous task definition
aws ecs describe-task-definition --task-definition linton-backend

# Update service to previous version
aws ecs update-service \
  --cluster linton-staging-cluster \
  --service linton-backend-service \
  --task-definition linton-backend:1
```

### 2. Manual Deployment

```bash
# Generate task definitions manually
python3 scripts/generate-task-definitions.py

# Register task definitions
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json
aws ecs register-task-definition --cli-input-json file://task-definition-client-portal.json
aws ecs register-task-definition --cli-input-json file://task-definition-employee-portal.json
aws ecs register-task-definition --cli-input-json file://task-definition-admin-panel.json

# Update services
aws ecs update-service --cluster linton-staging-cluster --service linton-backend-service --task-definition linton-backend
aws ecs update-service --cluster linton-staging-cluster --service linton-client-portal-service --task-definition linton-client-portal
aws ecs update-service --cluster linton-staging-cluster --service linton-employee-portal-service --task-definition linton-employee-portal
aws ecs update-service --cluster linton-staging-cluster --service linton-admin-panel-service --task-definition linton-admin-panel
```

## Support

If you continue to experience issues:

1. Check the GitHub Actions logs for detailed error messages
2. Run the debug scripts to identify the specific problem
3. Verify all AWS resources and permissions
4. Test locally before pushing to production

## Files Modified

- `.github/workflows/ci-cd.yml` - Updated to use Python script
- `scripts/generate-task-definitions.py` - New Python script for JSON generation
- `scripts/debug-task-definitions.sh` - Debug script for deployment issues
- `scripts/test-task-definitions.sh` - Test script for local validation 