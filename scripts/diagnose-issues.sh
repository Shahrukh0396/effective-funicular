#!/bin/bash

echo "🔍 Diagnosing Deployment Issues..."
echo "================================="

# Configuration
CLUSTER_NAME="linton-staging-cluster"
REGION="us-east-2"

echo "1. Checking ECS cluster status..."
aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION > cluster-status.json 2>&1
echo "Cluster status saved to cluster-status.json"

echo ""
echo "2. Checking ECS services..."
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service --region $REGION > services-status.json 2>&1
echo "Services status saved to services-status.json"

echo ""
echo "3. Checking ECS tasks..."
aws ecs list-tasks --cluster $CLUSTER_NAME --region $REGION > tasks-list.json 2>&1
echo "Tasks list saved to tasks-list.json"

echo ""
echo "4. Checking task definitions..."
aws ecs list-task-definitions --family-prefix linton --region $REGION > task-definitions-list.json 2>&1
echo "Task definitions list saved to task-definitions-list.json"

echo ""
echo "5. Checking IAM roles..."
aws iam get-role --role-name ecsTaskExecutionRole --region $REGION > execution-role.json 2>&1
aws iam get-role --role-name ecsTaskRole --region $REGION > task-role.json 2>&1
echo "IAM roles status saved to execution-role.json and task-role.json"

echo ""
echo "6. Checking ECR repositories..."
aws ecr describe-repositories --region $REGION > ecr-repositories.json 2>&1
echo "ECR repositories saved to ecr-repositories.json"

echo ""
echo "7. Testing ALB connectivity..."
curl -s -o alb-test.html -w "HTTP Status: %{http_code}\n" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com
echo "ALB test response saved to alb-test.html"

echo ""
echo "8. Checking VPC and networking..."
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=linton-staging-vpc" --region $REGION > vpc-info.json 2>&1
aws ec2 describe-subnets --region $REGION > subnets-info.json 2>&1
aws ec2 describe-security-groups --filters "Name=group-name,Values=linton-ecs-sg" --region $REGION > security-groups-info.json 2>&1
echo "Networking info saved to vpc-info.json, subnets-info.json, and security-groups-info.json"

echo ""
echo "📊 Diagnostic files created:"
echo "- cluster-status.json"
echo "- services-status.json"
echo "- tasks-list.json"
echo "- task-definitions-list.json"
echo "- execution-role.json"
echo "- task-role.json"
echo "- ecr-repositories.json"
echo "- alb-test.html"
echo "- vpc-info.json"
echo "- subnets-info.json"
echo "- security-groups-info.json"

echo ""
echo "🔍 Review these files to identify the issue:"
echo "1. Check if cluster exists and is active"
echo "2. Check if services are running and healthy"
echo "3. Check if tasks are running"
echo "4. Check if IAM roles exist"
echo "5. Check if ECR repositories have images"
echo "6. Check if networking is configured correctly" 