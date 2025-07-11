#!/bin/bash

echo "Checking ECS Services Status..."

# Check backend service
echo "Backend Service:"
aws ecs describe-services --cluster linton-staging-cluster --services linton-backend-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo "Client Portal Service:"
aws ecs describe-services --cluster linton-staging-cluster --services linton-client-portal-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo "Employee Portal Service:"
aws ecs describe-services --cluster linton-staging-cluster --services linton-employee-portal-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo "Admin Panel Service:"
aws ecs describe-services --cluster linton-staging-cluster --services linton-admin-panel-service --query 'services[0].runningCount' --output text 2>/dev/null || echo "0"

echo ""
echo "Testing URLs..."

# Test URLs
echo "Backend Health:"
curl -s -o /dev/null -w "%{http_code}" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com/health 2>/dev/null || echo "000"

echo ""
echo "Client Portal:"
curl -s -o /dev/null -w "%{http_code}" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000 2>/dev/null || echo "000"

echo ""
echo "Employee Portal:"
curl -s -o /dev/null -w "%{http_code}" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001 2>/dev/null || echo "000"

echo ""
echo "Admin Panel:"
curl -s -o /dev/null -w "%{http_code}" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002 2>/dev/null || echo "000"

echo ""
echo "Access URLs:"
echo "Backend: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "Client Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000"
echo "Employee Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001"
echo "Admin Panel: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002" 