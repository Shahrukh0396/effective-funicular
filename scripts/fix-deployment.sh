#!/bin/bash

echo "🔧 Fixing Linton Portals Deployment..."
echo "======================================"

# Configuration
CLUSTER_NAME="linton-staging-cluster"
REGION="us-east-2"
ACCOUNT_ID="944871470938"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "1. Checking ECR repositories..."
aws ecr describe-repositories --repository-names linton-backend linton-client-portal linton-employee-portal linton-admin-panel 2>/dev/null || echo "ECR repositories not found"

echo ""
echo "2. Checking if Docker images exist..."
for repo in linton-backend linton-client-portal linton-employee-portal linton-admin-panel; do
    echo "Checking $repo..."
    aws ecr describe-images --repository-name $repo --query 'imageDetails[0].imageTags' --output text 2>/dev/null || echo "No images found in $repo"
done

echo ""
echo "3. Building and pushing Docker images..."

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push images
echo "Building backend image..."
docker build -f Dockerfile.backend -t $ECR_REGISTRY/linton-backend:latest .
docker push $ECR_REGISTRY/linton-backend:latest

echo "Building client portal image..."
docker build -f Dockerfile.client-portal -t $ECR_REGISTRY/linton-client-portal:latest .
docker push $ECR_REGISTRY/linton-client-portal:latest

echo "Building employee portal image..."
docker build -f Dockerfile.employee-portal -t $ECR_REGISTRY/linton-employee-portal:latest .
docker push $ECR_REGISTRY/linton-employee-portal:latest

echo "Building admin panel image..."
docker build -f Dockerfile.admin-panel -t $ECR_REGISTRY/linton-admin-panel:latest .
docker push $ECR_REGISTRY/linton-admin-panel:latest

echo ""
echo "4. Updating task definitions with correct image URIs..."

# Update task definitions with correct image URIs
export ECS_EXECUTION_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole"
export ECS_TASK_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole"
export ECR_REGISTRY="$ECR_REGISTRY"
export IMAGE_VERSION="latest"
export AWS_REGION="$REGION"

python3 scripts/generate-task-definitions.py

echo ""
echo "5. Registering updated task definitions..."
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json
aws ecs register-task-definition --cli-input-json file://task-definition-client-portal.json
aws ecs register-task-definition --cli-input-json file://task-definition-employee-portal.json
aws ecs register-task-definition --cli-input-json file://task-definition-admin-panel.json

echo ""
echo "6. Updating ECS services..."
aws ecs update-service --cluster $CLUSTER_NAME --service linton-backend-service --task-definition linton-backend
aws ecs update-service --cluster $CLUSTER_NAME --service linton-client-portal-service --task-definition linton-client-portal
aws ecs update-service --cluster $CLUSTER_NAME --service linton-employee-portal-service --task-definition linton-employee-portal
aws ecs update-service --cluster $CLUSTER_NAME --service linton-admin-panel-service --task-definition linton-admin-panel

echo ""
echo "7. Waiting for services to stabilize..."
aws ecs wait services-stable --cluster $CLUSTER_NAME --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service

echo ""
echo "8. Checking final status..."
echo "Backend tasks running:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo "Client portal tasks running:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-client-portal-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo "Employee portal tasks running:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-employee-portal-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo "Admin panel tasks running:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-admin-panel-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo ""
echo "🎉 Deployment fix completed!"
echo "Access URLs:"
echo "Backend: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "Client Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000"
echo "Employee Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001"
echo "Admin Panel: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002" 