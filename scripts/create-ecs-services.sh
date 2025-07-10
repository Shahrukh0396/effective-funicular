#!/bin/bash

# Linton Portals - ECS Services Creation Script
# This script creates all required ECS services for the CI/CD pipeline

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
CLUSTER_NAME="linton-staging-cluster"
REGION="us-east-2"

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    if [ ! -f "vpc-info.json" ]; then
        print_error "vpc-info.json not found. Run infrastructure setup first."
        exit 1
    fi
    
    if [ ! -f "security-groups.json" ]; then
        print_error "security-groups.json not found. Run infrastructure setup first."
        exit 1
    fi
    
    if [ ! -f "alb-info.json" ]; then
        print_error "alb-info.json not found. Run infrastructure setup first."
        exit 1
    fi
    
    print_success "All required files found"
}

# Load configuration from files
load_config() {
    print_status "Loading configuration..."
    
    SUBNET_1=$(jq -r '.subnet_1' vpc-info.json)
    SUBNET_2=$(jq -r '.subnet_2' vpc-info.json)
    ECS_SG=$(jq -r '.ecs_security_group' security-groups.json)
    ALB_ARN=$(jq -r '.alb_arn' alb-info.json)
    
    print_success "Configuration loaded"
}

# Create target groups
create_target_groups() {
    print_status "Creating target groups..."
    
    # Backend target group
    aws elbv2 create-target-group \
        --name linton-backend-tg \
        --protocol HTTP \
        --port 3000 \
        --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
        --target-type ip || print_warning "Backend target group may already exist"
    
    # Client portal target group
    aws elbv2 create-target-group \
        --name linton-client-portal-tg \
        --protocol HTTP \
        --port 80 \
        --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
        --target-type ip || print_warning "Client portal target group may already exist"
    
    # Employee portal target group
    aws elbv2 create-target-group \
        --name linton-employee-portal-tg \
        --protocol HTTP \
        --port 80 \
        --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
        --target-type ip || print_warning "Employee portal target group may already exist"
    
    # Admin panel target group
    aws elbv2 create-target-group \
        --name linton-admin-panel-tg \
        --protocol HTTP \
        --port 80 \
        --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
        --target-type ip || print_warning "Admin panel target group may already exist"
    
    print_success "Target groups created"
}

# Create ALB listeners
create_listeners() {
    print_status "Creating ALB listeners..."
    
    # Get target group ARNs
    BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    CLIENT_TG_ARN=$(aws elbv2 describe-target-groups --names linton-client-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    EMPLOYEE_TG_ARN=$(aws elbv2 describe-target-groups --names linton-employee-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    ADMIN_TG_ARN=$(aws elbv2 describe-target-groups --names linton-admin-panel-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    
    # Create listener for backend (port 80)
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN || print_warning "Listener may already exist"
    
    print_success "ALB listeners created"
}

# Create ECS services
create_ecs_services() {
    print_status "Creating ECS services..."
    
    # Get target group ARNs
    BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    CLIENT_TG_ARN=$(aws elbv2 describe-target-groups --names linton-client-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    EMPLOYEE_TG_ARN=$(aws elbv2 describe-target-groups --names linton-employee-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    ADMIN_TG_ARN=$(aws elbv2 describe-target-groups --names linton-admin-panel-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    
    # Create backend service
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name linton-backend-service \
        --task-definition linton-backend:1 \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$BACKEND_TG_ARN,containerName=linton-backend,containerPort=3000" || print_warning "Backend service may already exist"
    
    # Create client portal service
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name linton-client-portal-service \
        --task-definition linton-client-portal:1 \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$CLIENT_TG_ARN,containerName=linton-client-portal,containerPort=80" || print_warning "Client portal service may already exist"
    
    # Create employee portal service
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name linton-employee-portal-service \
        --task-definition linton-employee-portal:1 \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$EMPLOYEE_TG_ARN,containerName=linton-employee-portal,containerPort=80" || print_warning "Employee portal service may already exist"
    
    # Create admin panel service
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name linton-admin-panel-service \
        --task-definition linton-admin-panel:1 \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$ADMIN_TG_ARN,containerName=linton-admin-panel,containerPort=80" || print_warning "Admin panel service may already exist"
    
    print_success "ECS services created"
}

# Verify services
verify_services() {
    print_status "Verifying ECS services..."
    
    aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service \
        --query 'services[].{serviceName:serviceName,status:status,desiredCount:desiredCount,runningCount:runningCount}' \
        --output table
    
    print_success "Services verification completed"
}

# Main function
main() {
    print_status "Starting ECS services creation..."
    
    check_files
    load_config
    create_target_groups
    create_listeners
    create_ecs_services
    verify_services
    
    print_success "ECS services creation completed!"
    print_status "You can now run the GitHub Actions workflow"
}

# Run main function
main "$@"