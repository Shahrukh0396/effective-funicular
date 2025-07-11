#!/bin/bash

# Simple ECS Services Creation Script
# This script creates ECS services for the CI/CD pipeline

set -e

echo "Starting ECS services creation..."

# Configuration
CLUSTER_NAME="linton-staging-cluster"
REGION="us-east-2"

# Load configuration from files
echo "Loading configuration..."
SUBNET_1=$(jq -r '.subnet_1' vpc-info.json)
SUBNET_2=$(jq -r '.subnet_2' vpc-info.json)
ECS_SG=$(jq -r '.ecs_security_group' security-groups.json)
ALB_ARN=$(jq -r '.alb_arn' alb-info.json)

echo "Configuration loaded:"
echo "  Subnet 1: $SUBNET_1"
echo "  Subnet 2: $SUBNET_2"
echo "  ECS Security Group: $ECS_SG"
echo "  ALB ARN: $ALB_ARN"

# Create target groups
echo "Creating target groups..."

# Backend target group
aws elbv2 create-target-group \
    --name linton-backend-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
    --target-type ip || echo "Backend target group may already exist"

# Client portal target group
aws elbv2 create-target-group \
    --name linton-client-portal-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
    --target-type ip || echo "Client portal target group may already exist"

# Employee portal target group
aws elbv2 create-target-group \
    --name linton-employee-portal-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
    --target-type ip || echo "Employee portal target group may already exist"

# Admin panel target group
aws elbv2 create-target-group \
    --name linton-admin-panel-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id $(jq -r '.vpc_id' vpc-info.json) \
    --target-type ip || echo "Admin panel target group may already exist"

echo "Target groups created"

# Create ALB listeners
echo "Creating ALB listeners..."

# Get target group ARNs
BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
CLIENT_TG_ARN=$(aws elbv2 describe-target-groups --names linton-client-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
EMPLOYEE_TG_ARN=$(aws elbv2 describe-target-groups --names linton-employee-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
ADMIN_TG_ARN=$(aws elbv2 describe-target-groups --names linton-admin-panel-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

echo "Target Group ARNs:"
echo "  Backend: $BACKEND_TG_ARN"
echo "  Client Portal: $CLIENT_TG_ARN"
echo "  Employee Portal: $EMPLOYEE_TG_ARN"
echo "  Admin Panel: $ADMIN_TG_ARN"

# Create listeners for each service
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN || echo "Backend listener may already exist"

aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 3000 \
    --default-actions Type=forward,TargetGroupArn=$CLIENT_TG_ARN || echo "Client portal listener may already exist"

aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 3001 \
    --default-actions Type=forward,TargetGroupArn=$EMPLOYEE_TG_ARN || echo "Employee portal listener may already exist"

aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 3002 \
    --default-actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN || echo "Admin panel listener may already exist"

echo "ALB listeners created"

# Create ECS services
echo "Creating ECS services..."

# Create backend service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-backend-service \
    --task-definition linton-backend:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$BACKEND_TG_ARN,containerName=linton-backend,containerPort=3000" || echo "Backend service may already exist"

# Create client portal service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-client-portal-service \
    --task-definition linton-client-portal:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$CLIENT_TG_ARN,containerName=linton-client-portal,containerPort=80" || echo "Client portal service may already exist"

# Create employee portal service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-employee-portal-service \
    --task-definition linton-employee-portal:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$EMPLOYEE_TG_ARN,containerName=linton-employee-portal,containerPort=80" || echo "Employee portal service may already exist"

# Create admin panel service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-admin-panel-service \
    --task-definition linton-admin-panel:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$ADMIN_TG_ARN,containerName=linton-admin-panel,containerPort=80" || echo "Admin panel service may already exist"

echo "ECS services created"

# Verify services
echo "Verifying ECS services..."
aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service \
    --query 'services[].{serviceName:serviceName,status:status,desiredCount:desiredCount,runningCount:runningCount}'

echo "ECS services creation completed!"
echo "You can now run the GitHub Actions workflow" 