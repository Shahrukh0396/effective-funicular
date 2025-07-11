#!/bin/bash

echo "🚀 Creating Minimal Working Deployment..."
echo "======================================="

# Configuration
REGION="us-east-2"
CLUSTER_NAME="linton-staging-cluster"
ACCOUNT_ID="944871470938"

echo "1. Creating IAM roles..."

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
}' 2>/dev/null || echo "Execution role may already exist"

# Attach execution role policy
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || echo "Policy may already be attached"

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
}' 2>/dev/null || echo "Task role may already exist"

echo ""
echo "2. Creating minimal task definition..."

# Create a minimal task definition for testing
cat > minimal-task-definition.json << 'EOF'
{
  "family": "linton-backend-minimal",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::944871470938:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::944871470938:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "linton-backend",
      "image": "944871470938.dkr.ecr.us-east-2.amazonaws.com/linton-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "staging"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linton-backend-minimal",
          "awslogs-region": "us-east-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

echo ""
echo "3. Registering minimal task definition..."
aws ecs register-task-definition --cli-input-json file://minimal-task-definition.json --region $REGION

echo ""
echo "4. Creating minimal service..."

# Get VPC and subnet info
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=linton-staging-vpc" --region $REGION --query 'Vpcs[0].VpcId' --output text 2>/dev/null || echo "vpc-12345678")
SUBNET_1=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'Subnets[0].SubnetId' --output text 2>/dev/null || echo "subnet-12345678")
SUBNET_2=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'Subnets[1].SubnetId' --output text 2>/dev/null || echo "subnet-87654321")
ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=linton-ecs-sg" --region $REGION --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || echo "sg-12345678")

echo "Creating minimal backend service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-backend-minimal \
    --task-definition linton-backend-minimal:1 \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Minimal service may already exist"

echo ""
echo "5. Waiting for service to start..."
sleep 30

echo ""
echo "6. Testing minimal deployment..."
echo "Checking if service is running..."
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-minimal --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo ""
echo "🎉 Minimal deployment test completed!"
echo "If this works, we can then fix the main services." 