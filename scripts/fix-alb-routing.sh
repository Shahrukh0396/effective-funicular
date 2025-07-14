#!/bin/bash

# Fix ALB Routing Configuration
# This script updates the ALB to properly route API calls to the backend

set -e

echo "🔧 Fixing ALB routing configuration..."

# Get ALB ARN
ALB_ARN="arn:aws:elasticloadbalancing:us-east-2:944871470938:loadbalancer/app/linton-staging-alb/b2fd8ec449df90f1"

# Get target group ARNs
BACKEND_TG="arn:aws:elasticloadbalancing:us-east-2:944871470938:targetgroup/linton-backend-tg/07009c11d6f4ff1e"
CLIENT_TG="arn:aws:elasticloadbalancing:us-east-2:944871470938:targetgroup/linton-client-portal-tg/3ef36bfcb2d8620c"
ADMIN_TG="arn:aws:elasticloadbalancing:us-east-2:944871470938:targetgroup/linton-admin-panel-tg/5c6f7a67e6845569"
EMPLOYEE_TG="arn:aws:elasticloadbalancing:us-east-2:944871470938:targetgroup/linton-employee-portal-tg/0c208041476a8566"

echo "📋 Target Groups:"
echo "  Backend: $BACKEND_TG"
echo "  Client: $CLIENT_TG"
echo "  Admin: $ADMIN_TG"
echo "  Employee: $EMPLOYEE_TG"

# Get listener ARNs
LISTENER_80="arn:aws:elasticloadbalancing:us-east-2:944871470938:listener/app/linton-staging-alb/b2fd8ec449df90f1/87eb317de550cb31"
LISTENER_3000="arn:aws:elasticloadbalancing:us-east-2:944871470938:listener/app/linton-staging-alb/b2fd8ec449df90f1/0cf18b19e440ef61"
LISTENER_3001="arn:aws:elasticloadbalancing:us-east-2:944871470938:listener/app/linton-staging-alb/b2fd8ec449df90f1/b5e443d65f5b4326"
LISTENER_3002="arn:aws:elasticloadbalancing:us-east-2:944871470938:listener/app/linton-staging-alb/b2fd8ec449df90f1/c5752c003b1eb066"

echo ""
echo "🔄 Updating ALB routing..."

# Update Port 80 to route to backend API
echo "📡 Updating Port 80 to route to Backend API..."
aws elbv2 modify-listener \
  --listener-arn $LISTENER_80 \
  --default-actions Type=forward,TargetGroupArn=$BACKEND_TG

# Update Port 3000 to route to backend API (for API calls)
echo "📡 Updating Port 3000 to route to Backend API..."
aws elbv2 modify-listener \
  --listener-arn $LISTENER_3000 \
  --default-actions Type=forward,TargetGroupArn=$BACKEND_TG

# Update Port 3001 to route to employee portal
echo "📡 Updating Port 3001 to route to Employee Portal..."
aws elbv2 modify-listener \
  --listener-arn $LISTENER_3001 \
  --default-actions Type=forward,TargetGroupArn=$EMPLOYEE_TG

# Update Port 3002 to route to admin panel
echo "📡 Updating Port 3002 to route to Admin Panel..."
aws elbv2 modify-listener \
  --listener-arn $LISTENER_3002 \
  --default-actions Type=forward,TargetGroupArn=$ADMIN_TG

echo ""
echo "✅ ALB routing updated successfully!"
echo ""
echo "📋 New routing configuration:"
echo "  Port 80 (default) → Backend API"
echo "  Port 3000 → Backend API"
echo "  Port 3001 → Employee Portal"
echo "  Port 3002 → Admin Panel"
echo ""
echo "🌐 Access URLs:"
echo "  Backend API: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "  Employee Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001"
echo "  Admin Panel: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002"
echo ""
echo "🔧 Next steps:"
echo "  1. Update frontend API URLs to use the correct endpoints"
echo "  2. Test authentication endpoints"
echo "  3. Verify all portals are working correctly" 