#!/bin/bash

echo "🔍 Testing Linton Portals Deployment..."
echo "======================================"

# Configuration
CLUSTER_NAME="linton-staging-cluster"
REGION="us-east-2"

echo "1. Testing ALB connectivity..."
echo "Testing backend endpoint..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com

echo ""
echo "2. Checking ECS cluster..."
aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION --query 'clusters[0].{status:status,activeServicesCount:activeServicesCount,runningTasksCount:runningTasksCount}' --output json

echo ""
echo "3. Checking ECS services..."
echo "Backend service:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount,pendingCount:pendingCount}' --output json

echo ""
echo "4. Checking ECS tasks..."
aws ecs list-tasks --cluster $CLUSTER_NAME --region $REGION --output json

echo ""
echo "5. Checking task definitions..."
aws ecs list-task-definitions --family-prefix linton --region $REGION --output json

echo ""
echo "6. Checking ECR repositories..."
aws ecr describe-repositories --region $REGION --query 'repositories[].{repositoryName:repositoryName,repositoryUri:repositoryUri}' --output json

echo ""
echo "7. Checking IAM roles..."
aws iam get-role --role-name ecsTaskExecutionRole --region $REGION --query 'Role.RoleName' --output text 2>/dev/null || echo "ecsTaskExecutionRole not found"
aws iam get-role --role-name ecsTaskRole --region $REGION --query 'Role.RoleName' --output text 2>/dev/null || echo "ecsTaskRole not found"

echo ""
echo "8. Testing direct container access..."
echo "This will help identify if the issue is with the ALB or the containers themselves"

echo ""
echo "🎯 Deployment Test Summary:"
echo "- If ALB returns 503: Services not running or networking issues"
echo "- If IAM roles missing: Task execution will fail"
echo "- If task definitions missing: Services can't start"
echo "- If ECR images missing: Containers can't start" 