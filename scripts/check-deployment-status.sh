#!/bin/bash

echo "🔍 Checking Linton Portals Deployment Status..."
echo "================================================"

# Check ECS services
echo "📊 ECS Services Status:"
aws ecs describe-services \
  --cluster linton-staging-cluster \
  --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service \
  --query 'services[].{serviceName:serviceName,status:status,desiredCount:desiredCount,runningCount:runningCount,pendingCount:pendingCount}' \
  --output table 2>/dev/null || echo "Unable to get service status"

echo ""
echo "🌐 Testing Application URLs:"
echo "============================"

# Test backend health
echo "🔧 Backend Health Check:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com/health || echo "Backend not responding"

# Test client portal
echo "💼 Client Portal:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000 || echo "Client portal not responding"

# Test employee portal
echo "👥 Employee Portal:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001 || echo "Employee portal not responding"

# Test admin panel
echo "⚙️  Admin Panel:"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002 || echo "Admin panel not responding"

echo ""
echo "📋 Access URLs:"
echo "==============="
echo "Backend API: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "Client Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000"
echo "Employee Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001"
echo "Admin Panel: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002"
echo ""
echo "🔐 Default Login: superadmin@linton.com / SuperAdmin123!"
echo ""
echo "💡 Note: Services may take 2-5 minutes to fully start up" 