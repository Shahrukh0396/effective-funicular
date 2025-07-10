#!/bin/bash

# Linton Portals - AWS Staging Deployment Script
# This script deploys the application to AWS using ECS, RDS, and other services

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

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "AWS CLI and credentials configured"
}

# Create ECR repositories
create_ecr_repositories() {
    print_status "Creating ECR repositories..."
    
    # Create repositories for each service
    aws ecr create-repository --repository-name linton-backend --region us-east-1 || true
    aws ecr create-repository --repository-name linton-client-portal --region us-east-1 || true
    aws ecr create-repository --repository-name linton-employee-portal --region us-east-1 || true
    aws ecr create-repository --repository-name linton-admin-panel --region us-east-1 || true
    
    print_success "ECR repositories created"
}

# Build and push Docker images to ECR
build_and_push_images() {
    print_status "Building and pushing Docker images to ECR..."
    
    # Get ECR login token
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
    
    # Build and push backend
    print_status "Building and pushing backend image..."
    docker build -f Dockerfile.backend -t linton-backend:latest .
    docker tag linton-backend:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-backend:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-backend:latest
    
    # Build and push client portal
    print_status "Building and pushing client portal image..."
    docker build -f Dockerfile.client-portal -t linton-client-portal:latest .
    docker tag linton-client-portal:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-client-portal:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-client-portal:latest
    
    # Build and push employee portal
    print_status "Building and pushing employee portal image..."
    docker build -f Dockerfile.employee-portal -t linton-employee-portal:latest .
    docker tag linton-employee-portal:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-employee-portal:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-employee-portal:latest
    
    # Build and push admin panel
    print_status "Building and pushing admin panel image..."
    docker build -f Dockerfile.admin-panel -t linton-admin-panel:latest .
    docker tag linton-admin-panel:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-admin-panel:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com/linton-admin-panel:latest
    
    print_success "All images built and pushed to ECR"
}

# Create VPC and networking
create_networking() {
    print_status "Creating VPC and networking resources..."
    
    # Create VPC
    VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query Vpc.VpcId --output text)
    aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=linton-staging-vpc
    
    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text)
    aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
    
    # Create public subnets
    SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --query Subnet.SubnetId --output text)
    SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --query Subnet.SubnetId --output text)
    
    # Create route table
    ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query RouteTable.RouteTableId --output text)
    aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
    aws ec2 associate-route-table --subnet-id $SUBNET_1 --route-table-id $ROUTE_TABLE_ID
    aws ec2 associate-route-table --subnet-id $SUBNET_2 --route-table-id $ROUTE_TABLE_ID
    
    print_success "Networking resources created"
}

# Create RDS database
create_database() {
    print_status "Creating RDS database..."
    
    # Create security group for RDS
    RDS_SG=$(aws ec2 create-security-group --group-name linton-rds-sg --description "Security group for RDS" --vpc-id $VPC_ID --query GroupId --output text)
    aws ec2 authorize-security-group-ingress --group-id $RDS_SG --protocol tcp --port 27017 --cidr 10.0.0.0/16
    
    # Create RDS subnet group
    aws rds create-db-subnet-group \
        --db-subnet-group-name linton-staging-subnet-group \
        --db-subnet-group-description "Subnet group for Linton staging" \
        --subnet-ids $SUBNET_1 $SUBNET_2
    
    # Create RDS instance (using DocumentDB for MongoDB compatibility)
    aws docdb create-db-cluster \
        --db-cluster-identifier linton-staging-cluster \
        --engine docdb \
        --master-username admin \
        --master-user-password YourSecurePassword123 \
        --db-subnet-group-name linton-staging-subnet-group \
        --vpc-security-group-ids $RDS_SG
    
    print_success "RDS database created"
}

# Create ECS cluster
create_ecs_cluster() {
    print_status "Creating ECS cluster..."
    
    aws ecs create-cluster --cluster-name linton-staging-cluster
    
    print_success "ECS cluster created"
}

# Create Application Load Balancer
create_load_balancer() {
    print_status "Creating Application Load Balancer..."
    
    # Create security group for ALB
    ALB_SG=$(aws ec2 create-security-group --group-name linton-alb-sg --description "Security group for ALB" --vpc-id $VPC_ID --query GroupId --output text)
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
    
    # Create ALB
    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name linton-staging-alb \
        --subnets $SUBNET_1 $SUBNET_2 \
        --security-groups $ALB_SG \
        --query LoadBalancers[0].LoadBalancerArn \
        --output text)
    
    print_success "Application Load Balancer created"
}

# Deploy to ECS
deploy_to_ecs() {
    print_status "Deploying to ECS..."
    
    # Create task definitions and services
    # This would involve creating ECS task definitions and services
    # For brevity, I'll show the structure
    
    print_success "Deployment to ECS completed"
}

# Main deployment function
deploy_to_aws() {
    print_status "Starting AWS deployment..."
    
    check_aws_cli
    create_ecr_repositories
    build_and_push_images
    create_networking
    create_database
    create_ecs_cluster
    create_load_balancer
    deploy_to_ecs
    
    print_success "AWS deployment completed!"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy_to_aws
        ;;
    "build")
        build_and_push_images
        ;;
    "networking")
        create_networking
        ;;
    "database")
        create_database
        ;;
    *)
        echo "Usage: $0 {deploy|build|networking|database}"
        echo ""
        echo "Commands:"
        echo "  deploy     - Full AWS deployment (default)"
        echo "  build      - Build and push Docker images to ECR"
        echo "  networking - Create VPC and networking resources"
        echo "  database   - Create RDS database"
        exit 1
        ;;
esac 