#!/bin/bash

# Update ALB listener rules for host-based routing
# This script changes from path-based routing to host-based routing

set -e

echo "🔄 Updating ALB listener rules for host-based routing..."

# Get the listener ARN
LISTENER_ARN="arn:aws:elasticloadbalancing:us-east-2:944871470938:listener/app/linton-staging-alb/b2fd8ec449df90f1/87eb317de550cb31"

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

# Delete existing rules (except default)
echo "🗑️  Deleting existing path-based rules..."

# Delete /api/* rule
aws elbv2 delete-rule --rule-arn arn:aws:elasticloadbalancing:us-east-2:944871470938:listener-rule/app/linton-staging-alb/b2fd8ec449df90f1/87eb317de550cb31/36e80859e17d52c1

# Delete /admin/* rule  
aws elbv2 delete-rule --rule-arn arn:aws:elasticloadbalancing:us-east-2:944871470938:listener-rule/app/linton-staging-alb/b2fd8ec449df90f1/87eb317de550cb31/f579032351190f6a

# Delete /employee/* rule
aws elbv2 delete-rule --rule-arn arn:aws:elasticloadbalancing:us-east-2:944871470938:listener-rule/app/linton-staging-alb/b2fd8ec449df90f1/87eb317de550cb31/6615b60b7457dd90

echo "✅ Deleted existing path-based rules"

# Create new host-based rules
echo "🆕 Creating host-based rules..."

# Rule 1: api.linton-tech.com -> Backend
echo "📡 Creating rule for api.linton-tech.com -> Backend"
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 1 \
  --conditions Field=host-header,Values=api.linton-tech.com \
  --actions Type=forward,TargetGroupArn=$BACKEND_TG

# Rule 2: admin.linton-tech.com -> Admin Panel
echo "📡 Creating rule for admin.linton-tech.com -> Admin Panel"
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 2 \
  --conditions Field=host-header,Values=admin.linton-tech.com \
  --actions Type=forward,TargetGroupArn=$ADMIN_TG

# Rule 3: employee.linton-tech.com -> Employee Portal
echo "📡 Creating rule for employee.linton-tech.com -> Employee Portal"
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 3 \
  --conditions Field=host-header,Values=employee.linton-tech.com \
  --actions Type=forward,TargetGroupArn=$EMPLOYEE_TG

# Rule 4: app.linton-tech.com -> Client Portal
echo "📡 Creating rule for app.linton-tech.com -> Client Portal"
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 4 \
  --conditions Field=host-header,Values=app.linton-tech.com \
  --actions Type=forward,TargetGroupArn=$CLIENT_TG

echo "✅ Created host-based routing rules"

# Update the default rule to point to client portal for any unmatched hosts
echo "🔄 Updating default rule to point to client portal..."
aws elbv2 modify-rule \
  --rule-arn arn:aws:elasticloadbalancing:us-east-2:944871470938:listener-rule/app/linton-staging-alb/b2fd8ec449df90f1/87eb317de550cb31/07ffde4dc28ba826 \
  --actions Type=forward,TargetGroupArn=$CLIENT_TG

echo "✅ Updated default rule"

echo ""
echo "🎉 ALB routing updated successfully!"
echo ""
echo "📋 New routing configuration:"
echo "  api.linton-tech.com → Backend API"
echo "  admin.linton-tech.com → Admin Panel"
echo "  employee.linton-tech.com → Employee Portal"
echo "  app.linton-tech.com → Client Portal"
echo "  * (default) → Client Portal"
echo ""
echo "⚠️  Next steps:"
echo "  1. Configure your DNS to point these subdomains to your ALB"
echo "  2. Update the frontend apps to use the correct API URL"
echo "  3. Test the new routing" 