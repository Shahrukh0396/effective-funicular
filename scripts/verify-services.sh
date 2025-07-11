#!/bin/bash

echo "Checking ECS services..."

# Check if services exist
echo "Checking backend service..."
aws ecs describe-services --cluster linton-staging-cluster --services linton-backend-service --query 'services[0].serviceName' --output text 2>/dev/null || echo "Backend service not found"

echo "Checking client portal service..."
aws ecs describe-services --cluster linton-staging-cluster --services linton-client-portal-service --query 'services[0].serviceName' --output text 2>/dev/null || echo "Client portal service not found"

echo "Checking employee portal service..."
aws ecs describe-services --cluster linton-staging-cluster --services linton-employee-portal-service --query 'services[0].serviceName' --output text 2>/dev/null || echo "Employee portal service not found"

echo "Checking admin panel service..."
aws ecs describe-services --cluster linton-staging-cluster --services linton-admin-panel-service --query 'services[0].serviceName' --output text 2>/dev/null || echo "Admin panel service not found"

echo "Service verification completed" 