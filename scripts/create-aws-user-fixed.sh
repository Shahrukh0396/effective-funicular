#!/bin/bash

# Linton Portals - AWS IAM User Creation Script (Fixed)
# This script creates an IAM user with proper permissions for CI/CD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
USER_NAME="linton-ci-cd-user"

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI and credentials configured"
}

# Create IAM user
create_iam_user() {
    print_status "Creating IAM user: $USER_NAME"
    
    # Check if user already exists
    if aws iam get-user --user-name $USER_NAME &> /dev/null; then
        print_warning "User $USER_NAME already exists"
        return
    fi
    
    # Create user
    aws iam create-user --user-name $USER_NAME
    print_success "IAM user created: $USER_NAME"
}

# Create custom ECR policy
create_ecr_policy() {
    print_status "Creating custom ECR policy..."
    
    POLICY_NAME="linton-ecr-policy"
    
    # Check if policy already exists
    if aws iam get-policy --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$POLICY_NAME &> /dev/null; then
        print_warning "Policy $POLICY_NAME already exists"
        return
    fi
    
    # Create custom ECR policy
    cat > ecr-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:PutImage",
                "ecr:CreateRepository",
                "ecr:DeleteRepository",
                "ecr:DescribeRepositories",
                "ecr:ListImages",
                "ecr:DescribeImages",
                "ecr:BatchDeleteImage",
                "ecr:GetLifecyclePolicy",
                "ecr:PutLifecyclePolicy",
                "ecr:DeleteLifecyclePolicy",
                "ecr:GetRepositoryPolicy",
                "ecr:SetRepositoryPolicy",
                "ecr:DeleteRepositoryPolicy"
            ],
            "Resource": "*"
        }
    ]
}
EOF
    
    # Create the policy
    aws iam create-policy --policy-name $POLICY_NAME --policy-document file://ecr-policy.json
    print_success "Custom ECR policy created: $POLICY_NAME"
}

# Attach required policies
attach_policies() {
    print_status "Attaching required policies..."
    
    # List of required policies (using correct names)
    POLICIES=(
        "AmazonECS-FullAccess"
        "AmazonRDS-FullAccess"
        "AmazonVPC-FullAccess"
        "ElasticLoadBalancing-FullAccess"
        "CloudWatchLogs-FullAccess"
        "AmazonS3-FullAccess"
        "IAM-FullAccess"
    )
    
    for policy in "${POLICIES[@]}"; do
        print_status "Attaching policy: $policy"
        aws iam attach-user-policy --user-name $USER_NAME --policy-arn arn:aws:iam::aws:policy/$policy
        print_success "Policy $policy attached"
    done
    
    # Attach custom ECR policy
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    aws iam attach-user-policy --user-name $USER_NAME --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/linton-ecr-policy
    print_success "Custom ECR policy attached"
}

# Create access key
create_access_key() {
    print_status "Creating access key for user: $USER_NAME"
    
    # Create access key
    ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name $USER_NAME)
    
    # Extract access key details
    ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
    SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')
    
    print_success "Access key created"
    print_success "Access Key ID: $ACCESS_KEY_ID"
    print_warning "Secret Access Key: $SECRET_ACCESS_KEY"
    print_warning "IMPORTANT: Save the Secret Access Key - you won't be able to see it again!"
    
    # Save to file
    cat > aws-credentials.json << EOF
{
  "access_key_id": "$ACCESS_KEY_ID",
  "secret_access_key": "$SECRET_ACCESS_KEY",
  "user_name": "$USER_NAME"
}
EOF
    
    print_success "Credentials saved to aws-credentials.json"
}

# Generate GitHub secrets template
generate_github_secrets_template() {
    print_status "Generating GitHub secrets template..."
    
    # Load credentials
    ACCESS_KEY_ID=$(jq -r '.access_key_id' aws-credentials.json)
    SECRET_ACCESS_KEY=$(jq -r '.secret_access_key' aws-credentials.json)
    
    cat > github-secrets-aws.md << EOF
# AWS Credentials for GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

## AWS Credentials
- \`AWS_ACCESS_KEY_ID\`: $ACCESS_KEY_ID
- \`AWS_SECRET_ACCESS_KEY\`: $SECRET_ACCESS_KEY

## Docker Hub (You need to create these)
- \`DOCKER_USERNAME\`: shahrukh0396
- \`DOCKER_PASSWORD\`: Your Docker Hub access token

## Application Secrets (Update with your values)
- \`JWT_SECRET\`: your-super-secret-jwt-key-change-in-production
- \`EMAIL_HOST\`: smtp.gmail.com
- \`EMAIL_PORT\`: 587
- \`EMAIL_USER\`: your-email@gmail.com
- \`EMAIL_PASS\`: your-app-password
- \`STRIPE_SECRET_KEY\`: sk_test_...
- \`STRIPE_PUBLISHABLE_KEY\`: pk_test_...
- \`STRIPE_WEBHOOK_SECRET\`: whsec_...

## URLs (Update with your actual domains)
- \`CLIENT_URL\`: https://client.yourdomain.com
- \`EMPLOYEE_URL\`: https://employee.yourdomain.com
- \`ADMIN_URL\`: https://admin.yourdomain.com
- \`VITE_API_URL\`: https://api.yourdomain.com
- \`BACKEND_URL\`: https://api.yourdomain.com

## AWS Resources (Will be generated by infrastructure setup)
- \`ECS_EXECUTION_ROLE_ARN\`: (from infrastructure setup)
- \`ECS_TASK_ROLE_ARN\`: (from infrastructure setup)
- \`MONGO_URI\`: (from infrastructure setup)
- \`AWS_S3_BUCKET\`: (from infrastructure setup)
EOF

    print_success "GitHub secrets template created: github-secrets-aws.md"
}

# Test credentials
test_credentials() {
    print_status "Testing AWS credentials..."
    
    # Load credentials
    ACCESS_KEY_ID=$(jq -r '.access_key_id' aws-credentials.json)
    SECRET_ACCESS_KEY=$(jq -r '.secret_access_key' aws-credentials.json)
    
    # Test with new credentials
    AWS_ACCESS_KEY_ID=$ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY=$SECRET_ACCESS_KEY aws sts get-caller-identity
    
    print_success "AWS credentials test successful"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help          Show this help message"
    echo ""
    echo "This script creates an IAM user with proper permissions for the CI/CD pipeline."
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main function
main() {
    print_status "Starting AWS IAM user creation (Fixed version)..."
    echo ""
    
    check_aws_cli
    create_iam_user
    create_ecr_policy
    attach_policies
    create_access_key
    generate_github_secrets_template
    test_credentials
    
    print_success "AWS IAM user setup completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Add the AWS credentials from aws-credentials.json to GitHub secrets"
    echo "2. Create Docker Hub access token and add to GitHub secrets"
    echo "3. Update application secrets in GitHub"
    echo "4. Run the infrastructure setup script"
    echo ""
    print_warning "IMPORTANT: Keep aws-credentials.json secure and don't commit it to version control!"
}

# Run main function
main 