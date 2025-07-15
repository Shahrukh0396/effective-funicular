#!/bin/bash

echo "=== Fixing Host-Based Routing ==="

# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[0].LoadBalancerArn' --output text)
echo "ALB ARN: $ALB_ARN"

# Get target groups
CLIENT_TG=$(aws elbv2 describe-target-groups --query 'TargetGroups[?contains(TargetGroupName, `client`)].TargetGroupArn' --output text)
ADMIN_TG=$(aws elbv2 describe-target-groups --query 'TargetGroups[?contains(TargetGroupName, `admin`)].TargetGroupArn' --output text)
EMPLOYEE_TG=$(aws elbv2 describe-target-groups --query 'TargetGroups[?contains(TargetGroupName, `employee`)].TargetGroupArn' --output text)
BACKEND_TG=$(aws elbv2 describe-target-groups --query 'TargetGroups[?contains(TargetGroupName, `backend`)].TargetGroupArn' --output text)

echo "Target Groups:"
echo "Client: $CLIENT_TG"
echo "Admin: $ADMIN_TG"
echo "Employee: $EMPLOYEE_TG"
echo "Backend: $BACKEND_TG"

# Get HTTPS listener ARN
HTTPS_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`443`].ListenerArn' --output text)
echo "HTTPS Listener ARN: $HTTPS_LISTENER_ARN"

# Delete existing rules (except default)
echo "Deleting existing rules..."
aws elbv2 describe-rules --listener-arn $HTTPS_LISTENER_ARN --query 'Rules[?Priority!=`default`].RuleArn' --output text | tr '\t' '\n' | while read rule_arn; do
    if [ ! -z "$rule_arn" ]; then
        echo "Deleting rule: $rule_arn"
        aws elbv2 delete-rule --rule-arn $rule_arn
    fi
done

# Create rules for each subdomain
echo "Creating host-based routing rules..."

# Rule for app.linton-tech.com
echo "Creating rule for app.linton-tech.com..."
aws elbv2 create-rule \
    --listener-arn $HTTPS_LISTENER_ARN \
    --priority 100 \
    --conditions Field=host-header,Values=app.linton-tech.com \
    --actions Type=forward,TargetGroupArn=$CLIENT_TG

# Rule for admin.linton-tech.com
echo "Creating rule for admin.linton-tech.com..."
aws elbv2 create-rule \
    --listener-arn $HTTPS_LISTENER_ARN \
    --priority 200 \
    --conditions Field=host-header,Values=admin.linton-tech.com \
    --actions Type=forward,TargetGroupArn=$ADMIN_TG

# Rule for employee.linton-tech.com
echo "Creating rule for employee.linton-tech.com..."
aws elbv2 create-rule \
    --listener-arn $HTTPS_LISTENER_ARN \
    --priority 300 \
    --conditions Field=host-header,Values=employee.linton-tech.com \
    --actions Type=forward,TargetGroupArn=$EMPLOYEE_TG

# Rule for api.linton-tech.com
echo "Creating rule for api.linton-tech.com..."
aws elbv2 create-rule \
    --listener-arn $HTTPS_LISTENER_ARN \
    --priority 400 \
    --conditions Field=host-header,Values=api.linton-tech.com \
    --actions Type=forward,TargetGroupArn=$BACKEND_TG

echo "=== Host-based routing configured ==="
echo ""
echo "Now you can point your DNS records to:"
echo "linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo ""
echo "All subdomains will work on the same ALB with proper SSL certificates:"
echo "- https://app.linton-tech.com"
echo "- https://admin.linton-tech.com" 
echo "- https://employee.linton-tech.com"
echo "- https://api.linton-tech.com" 