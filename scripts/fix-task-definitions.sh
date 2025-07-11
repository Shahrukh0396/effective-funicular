#!/bin/bash

echo "🔧 Fixing Task Definitions..."
echo "============================"

# Configuration
REGION="us-east-2"
ACCOUNT_ID="944871470938"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "1. Creating fixed task definitions..."

# Create fixed backend task definition
cat > task-definition-backend-fixed.json << EOF
{
  "family": "linton-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "linton-backend",
      "image": "${ECR_REGISTRY}/linton-backend:latest",
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
        },
        {
          "name": "MONGO_URI",
          "value": "mongodb://localhost:27017/linton-portals"
        },
        {
          "name": "JWT_SECRET",
          "value": "your-super-secret-jwt-key-for-staging"
        },
        {
          "name": "JWT_EXPIRES_IN",
          "value": "7d"
        },
        {
          "name": "CLIENT_URL",
          "value": "http://localhost:3000"
        },
        {
          "name": "EMPLOYEE_URL",
          "value": "http://localhost:3001"
        },
        {
          "name": "ADMIN_URL",
          "value": "http://localhost:3002"
        },
        {
          "name": "EMAIL_HOST",
          "value": "smtp.gmail.com"
        },
        {
          "name": "EMAIL_PORT",
          "value": "587"
        },
        {
          "name": "EMAIL_USER",
          "value": "test@example.com"
        },
        {
          "name": "EMAIL_PASS",
          "value": "test-password"
        },
        {
          "name": "STRIPE_SECRET_KEY",
          "value": "sk_test_placeholder"
        },
        {
          "name": "STRIPE_PUBLISHABLE_KEY",
          "value": "pk_test_placeholder"
        },
        {
          "name": "STRIPE_WEBHOOK_SECRET",
          "value": "whsec_placeholder"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linton-backend",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "essential": true,
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

# Create fixed client portal task definition
cat > task-definition-client-portal-fixed.json << EOF
{
  "family": "linton-client-portal",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "linton-client-portal",
      "image": "${ECR_REGISTRY}/linton-client-portal:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "staging"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linton-client-portal",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "essential": true
    }
  ]
}
EOF

# Create fixed employee portal task definition
cat > task-definition-employee-portal-fixed.json << EOF
{
  "family": "linton-employee-portal",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "linton-employee-portal",
      "image": "${ECR_REGISTRY}/linton-employee-portal:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "staging"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linton-employee-portal",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "essential": true
    }
  ]
}
EOF

# Create fixed admin panel task definition
cat > task-definition-admin-panel-fixed.json << EOF
{
  "family": "linton-admin-panel",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "linton-admin-panel",
      "image": "${ECR_REGISTRY}/linton-admin-panel:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "staging"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linton-admin-panel",
          "awslogs-region": "${REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "essential": true
    }
  ]
}
EOF

echo ""
echo "2. Registering fixed task definitions..."
aws ecs register-task-definition --cli-input-json file://task-definition-backend-fixed.json --region $REGION
aws ecs register-task-definition --cli-input-json file://task-definition-client-portal-fixed.json --region $REGION
aws ecs register-task-definition --cli-input-json file://task-definition-employee-portal-fixed.json --region $REGION
aws ecs register-task-definition --cli-input-json file://task-definition-admin-panel-fixed.json --region $REGION

echo ""
echo "3. Updating ECS services with fixed task definitions..."
CLUSTER_NAME="linton-staging-cluster"

# Get the latest task definition revisions
BACKEND_REVISION=$(aws ecs describe-task-definition --task-definition linton-backend --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
CLIENT_REVISION=$(aws ecs describe-task-definition --task-definition linton-client-portal --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
EMPLOYEE_REVISION=$(aws ecs describe-task-definition --task-definition linton-employee-portal --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
ADMIN_REVISION=$(aws ecs describe-task-definition --task-definition linton-admin-panel --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")

echo "Updating backend service..."
aws ecs update-service --cluster $CLUSTER_NAME --service linton-backend-service --task-definition linton-backend:$BACKEND_REVISION --region $REGION

echo "Updating client portal service..."
aws ecs update-service --cluster $CLUSTER_NAME --service linton-client-portal-service --task-definition linton-client-portal:$CLIENT_REVISION --region $REGION

echo "Updating employee portal service..."
aws ecs update-service --cluster $CLUSTER_NAME --service linton-employee-portal-service --task-definition linton-employee-portal:$EMPLOYEE_REVISION --region $REGION

echo "Updating admin panel service..."
aws ecs update-service --cluster $CLUSTER_NAME --service linton-admin-panel-service --task-definition linton-admin-panel:$ADMIN_REVISION --region $REGION

echo ""
echo "4. Waiting for services to stabilize..."
sleep 60

echo ""
echo "5. Checking service status..."
echo "Backend service:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount,failedTasks:deployments[0].failedTasks}' --output json

echo ""
echo "🎉 Task definitions fixed!"
echo "Services should now start properly with the updated configuration." 