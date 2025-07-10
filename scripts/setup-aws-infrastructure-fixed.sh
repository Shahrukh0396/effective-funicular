#!/bin/bash

# Linton Portals - AWS Infrastructure Setup Script (Fixed for us-east-2)
# This script creates all necessary AWS resources for the CI/CD pipeline

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

# Configuration - Updated for us-east-2
REGION="us-east-2"
CLUSTER_NAME="linton-staging-cluster"
VPC_NAME="linton-staging-vpc"
PROJECT_NAME="linton-portals"

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

# Create VPC and networking
create_networking() {
    print_status "Creating VPC and networking resources..."
    
    # Create VPC
    VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)
    aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=$VPC_NAME
    print_success "VPC created: $VPC_ID"
    
    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
    aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
    print_success "Internet Gateway created: $IGW_ID"
    
    # Create public subnets - Fixed for us-east-2 availability zones
    SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-2a --query Subnet.SubnetId --output text)
    SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-2b --query Subnet.SubnetId --output text)
    print_success "Public subnets created: $SUBNET_1, $SUBNET_2"
    
    # Create route table
    ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query RouteTable.RouteTableId --output text)
    aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
    aws ec2 associate-route-table --subnet-id $SUBNET_1 --route-table-id $ROUTE_TABLE_ID
    aws ec2 associate-route-table --subnet-id $SUBNET_2 --route-table-id $ROUTE_TABLE_ID
    print_success "Route table created: $ROUTE_TABLE_ID"
    
    # Save VPC info to file
    cat > vpc-info.json << EOF
{
  "vpc_id": "$VPC_ID",
  "subnet_1": "$SUBNET_1",
  "subnet_2": "$SUBNET_2",
  "route_table_id": "$ROUTE_TABLE_ID",
  "internet_gateway_id": "$IGW_ID"
}
EOF
    print_success "VPC information saved to vpc-info.json"
}

# Create security groups
create_security_groups() {
    print_status "Creating security groups..."
    
    # Load VPC ID
    VPC_ID=$(jq -r '.vpc_id' vpc-info.json)
    
    # Security group for ALB
    ALB_SG=$(aws ec2 create-security-group --group-name linton-alb-sg --description "Security group for ALB" --vpc-id $VPC_ID --query GroupId --output text)
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
    print_success "ALB Security Group created: $ALB_SG"
    
    # Security group for ECS services
    ECS_SG=$(aws ec2 create-security-group --group-name linton-ecs-sg --description "Security group for ECS services" --vpc-id $VPC_ID --query GroupId --output text)
    aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 3000 --source-group $ALB_SG
    aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 80 --source-group $ALB_SG
    print_success "ECS Security Group created: $ECS_SG"
    
    # Security group for RDS
    RDS_SG=$(aws ec2 create-security-group --group-name linton-rds-sg --description "Security group for RDS" --vpc-id $VPC_ID --query GroupId --output text)
    aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 27017 --source-group $ECS_SG
    print_success "RDS Security Group created: $RDS_SG"
    
    # Save security group info
    cat > security-groups.json << EOF
{
  "alb_security_group": "$ALB_SG",
  "ecs_security_group": "$ECS_SG",
  "rds_security_group": "$RDS_SG"
}
EOF
    print_success "Security group information saved to security-groups.json"
}

# Create RDS database
create_database() {
    print_status "Creating RDS database..."
    
    # Load subnet and security group info
    SUBNET_1=$(jq -r '.subnet_1' vpc-info.json)
    SUBNET_2=$(jq -r '.subnet_2' vpc-info.json)
    RDS_SG=$(jq -r '.rds_security_group' security-groups.json)
    
    # Create RDS subnet group
    aws rds create-db-subnet-group \
        --db-subnet-group-name linton-staging-subnet-group \
        --db-subnet-group-description "Subnet group for Linton staging" \
        --subnet-ids $SUBNET_1 $SUBNET_2
    
    # Create RDS instance (using DocumentDB for MongoDB compatibility)
    aws docdb create-db-cluster \
        --db-cluster-identifier linton-staging-cluster \
        --engine docdb \
        --master-username lintonadmin \
        --master-user-password YourSecurePassword123 \
        --db-subnet-group-name linton-staging-subnet-group \
        --vpc-security-group-ids $RDS_SG
    
    print_success "RDS DocumentDB cluster created"
    
    # Get cluster endpoint
    CLUSTER_ENDPOINT=$(aws docdb describe-db-clusters --db-cluster-identifier linton-staging-cluster --query 'DBClusters[0].Endpoint' --output text)
    print_success "Database endpoint: $CLUSTER_ENDPOINT"
    
    # Save database info
    cat > database-info.json << EOF
{
  "cluster_endpoint": "$CLUSTER_ENDPOINT",
  "master_username": "lintonadmin",
  "master_password": "YourSecurePassword123"
}
EOF
}

# Create ECR repositories
create_ecr_repositories() {
    print_status "Creating ECR repositories..."
    
    # Create repositories for each service
    aws ecr create-repository --repository-name linton-backend --region $REGION || true
    aws ecr create-repository --repository-name linton-client-portal --region $REGION || true
    aws ecr create-repository --repository-name linton-employee-portal --region $REGION || true
    aws ecr create-repository --repository-name linton-admin-panel --region $REGION || true
    
    print_success "ECR repositories created"
}

# Create ECS cluster
create_ecs_cluster() {
    print_status "Creating ECS cluster..."
    
    aws ecs create-cluster --cluster-name $CLUSTER_NAME
    
    print_success "ECS cluster created: $CLUSTER_NAME"
}

# Create IAM roles
create_iam_roles() {
    print_status "Creating IAM roles..."
    
    # Create execution role
    aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ecs-tasks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }'
    
    # Attach execution role policy
    aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    
    # Create task role
    aws iam create-role --role-name ecsTaskRole --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ecs-tasks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }'
    
    # Create custom policy for task role
    aws iam put-role-policy --role-name ecsTaskRole --policy-name ecsTaskRolePolicy --policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject"
          ],
          "Resource": "arn:aws:s3:::linton-portals-staging/*"
        },
        {
          "Effect": "Allow",
          "Action": [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          "Resource": "*"
        }
      ]
    }'
    
    # Get role ARNs
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    EXECUTION_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole"
    TASK_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/ecsTaskRole"
    
    print_success "IAM roles created"
    print_success "Execution Role ARN: $EXECUTION_ROLE_ARN"
    print_success "Task Role ARN: $TASK_ROLE_ARN"
    
    # Save IAM info
    cat > iam-info.json << EOF
{
  "execution_role_arn": "$EXECUTION_ROLE_ARN",
  "task_role_arn": "$TASK_ROLE_ARN"
}
EOF
}

# Create Application Load Balancer
create_load_balancer() {
    print_status "Creating Application Load Balancer..."
    
    # Load subnet and security group info
    SUBNET_1=$(jq -r '.subnet_1' vpc-info.json)
    SUBNET_2=$(jq -r '.subnet_2' vpc-info.json)
    ALB_SG=$(jq -r '.alb_security_group' security-groups.json)
    
    # Create ALB
    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name linton-staging-alb \
        --subnets $SUBNET_1 $SUBNET_2 \
        --security-groups $ALB_SG \
        --query LoadBalancers[0].LoadBalancerArn \
        --output text)
    
    ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)
    
    print_success "Application Load Balancer created: $ALB_ARN"
    print_success "ALB DNS: $ALB_DNS"
    
    # Save ALB info
    cat > alb-info.json << EOF
{
  "alb_arn": "$ALB_ARN",
  "alb_dns": "$ALB_DNS"
}
EOF
}

# Create CloudWatch log groups
create_log_groups() {
    print_status "Creating CloudWatch log groups..."
    
    aws logs create-log-group --log-group-name /ecs/linton-backend || true
    aws logs create-log-group --log-group-name /ecs/linton-client-portal || true
    aws logs create-log-group --log-group-name /ecs/linton-employee-portal || true
    aws logs create-log-group --log-group-name /ecs/linton-admin-panel || true
    
    print_success "CloudWatch log groups created"
}

# Create S3 bucket for file uploads
create_s3_bucket() {
    print_status "Creating S3 bucket for file uploads..."
    
    BUCKET_NAME="linton-portals-staging-$(date +%s)"
    aws s3 mb s3://$BUCKET_NAME --region $REGION
    
    # Configure bucket for static website hosting (optional)
    aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document error.html || true
    
    print_success "S3 bucket created: $BUCKET_NAME"
    
    # Save S3 info
    cat > s3-info.json << EOF
{
  "bucket_name": "$BUCKET_NAME"
}
EOF
}

# Generate GitHub secrets template
generate_github_secrets_template() {
    print_status "Generating GitHub secrets template..."
    
    # Load all the information
    EXECUTION_ROLE_ARN=$(jq -r '.execution_role_arn' iam-info.json)
    TASK_ROLE_ARN=$(jq -r '.task_role_arn' iam-info.json)
    CLUSTER_ENDPOINT=$(jq -r '.cluster_endpoint' database-info.json)
    BUCKET_NAME=$(jq -r '.bucket_name' s3-info.json)
    
    cat > github-secrets-template.md << EOF
# GitHub Secrets Template

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

## AWS Credentials
- \`AWS_ACCESS_KEY_ID\`: Your AWS access key
- \`AWS_SECRET_ACCESS_KEY\`: Your AWS secret key

## Docker Hub
- \`DOCKER_USERNAME\`: shahrukh0396
- \`DOCKER_PASSWORD\`: Your Docker Hub password/token

## AWS Resources
- \`ECS_EXECUTION_ROLE_ARN\`: $EXECUTION_ROLE_ARN
- \`ECS_TASK_ROLE_ARN\`: $TASK_ROLE_ARN

## Database
- \`MONGO_URI\`: mongodb://admin:YourSecurePassword123@$CLUSTER_ENDPOINT:27017/linton-portals?authSource=admin

## JWT
- \`JWT_SECRET\`: your-super-secret-jwt-key-change-in-production

## URLs (Update with your actual domains)
- \`CLIENT_URL\`: https://client.yourdomain.com
- \`EMPLOYEE_URL\`: https://employee.yourdomain.com
- \`ADMIN_URL\`: https://admin.yourdomain.com
- \`VITE_API_URL\`: https://api.yourdomain.com
- \`BACKEND_URL\`: https://api.yourdomain.com

## Email Configuration
- \`EMAIL_HOST\`: smtp.gmail.com
- \`EMAIL_PORT\`: 587
- \`EMAIL_USER\`: your-email@gmail.com
- \`EMAIL_PASS\`: your-app-password

## Stripe (Use test keys for staging)
- \`STRIPE_SECRET_KEY\`: sk_test_your_stripe_test_secret_key
- \`STRIPE_PUBLISHABLE_KEY\`: pk_test_your_stripe_test_publishable_key
- \`STRIPE_WEBHOOK_SECRET\`: whsec_your_stripe_webhook_secret

## S3
- \`AWS_S3_BUCKET\`: $BUCKET_NAME
EOF

    print_success "GitHub secrets template created: github-secrets-template.md"
}

# Main function
main() {
    print_status "Starting AWS infrastructure setup (Fixed for us-east-2)..."
    
    check_aws_cli
    create_networking
    create_security_groups
    create_database
    create_ecr_repositories
    create_ecs_cluster
    create_iam_roles
    create_load_balancer
    create_log_groups
    create_s3_bucket
    generate_github_secrets_template
    
    print_success "AWS infrastructure setup completed!"
    print_status "Next steps:"
    echo "1. Add the secrets from github-secrets-template.md to your GitHub repository"
    echo "2. Push your code to trigger the CI/CD pipeline"
    echo "3. Monitor the deployment in GitHub Actions"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help          Show this help message"
    echo ""
    echo "This script creates all necessary AWS resources for the CI/CD pipeline."
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

# Run main function
main 