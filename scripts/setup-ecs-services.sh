#!/bin/bash

echo "🔧 Setting up ECS Services for Linton Portals..."
echo "================================================"

# Configuration
CLUSTER_NAME="linton-staging-cluster"
REGION="us-east-2"
ACCOUNT_ID="944871470938"

echo "1. Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION 2>/dev/null || echo "Cluster may already exist"

echo ""
echo "2. Registering task definitions..."

# Register all task definitions
echo "Registering backend task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json --region $REGION

echo "Registering client portal task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition-client-portal.json --region $REGION

echo "Registering employee portal task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition-employee-portal.json --region $REGION

echo "Registering admin panel task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition-admin-panel.json --region $REGION

echo ""
echo "3. Creating ECS services..."

# Get the latest task definition revisions
BACKEND_REVISION=$(aws ecs describe-task-definition --task-definition linton-backend --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
CLIENT_REVISION=$(aws ecs describe-task-definition --task-definition linton-client-portal --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
EMPLOYEE_REVISION=$(aws ecs describe-task-definition --task-definition linton-employee-portal --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
ADMIN_REVISION=$(aws ecs describe-task-definition --task-definition linton-admin-panel --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")

echo "Creating backend service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-backend-service \
    --task-definition linton-backend:$BACKEND_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0c8c8c8c8c8c8c8c8,subnet-0d8d8d8d8d8d8d8d8],securityGroups=[sg-0e8e8e8e8e8e8e8e8],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Backend service may already exist"

echo "Creating client portal service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-client-portal-service \
    --task-definition linton-client-portal:$CLIENT_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0c8c8c8c8c8c8c8c8,subnet-0d8d8d8d8d8d8d8d8],securityGroups=[sg-0e8e8e8e8e8e8e8e8],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Client portal service may already exist"

echo "Creating employee portal service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-employee-portal-service \
    --task-definition linton-employee-portal:$EMPLOYEE_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0c8c8c8c8c8c8c8c8,subnet-0d8d8d8d8d8d8d8d8],securityGroups=[sg-0e8e8e8e8e8e8e8e8],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Employee portal service may already exist"

echo "Creating admin panel service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-admin-panel-service \
    --task-definition linton-admin-panel:$ADMIN_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-0c8c8c8c8c8c8c8c8,subnet-0d8d8d8d8d8d8d8d8],securityGroups=[sg-0e8e8e8e8e8e8e8e8],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Admin panel service may already exist"

echo ""
echo "4. Checking service status..."
echo "Backend service:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo "Client portal service:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-client-portal-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo "Employee portal service:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-employee-portal-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo "Admin panel service:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-admin-panel-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo ""
echo "🎉 ECS Services setup completed!"
echo "Access URLs:"
echo "Backend: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "Client Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000"
echo "Employee Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001"
echo "Admin Panel: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002" 