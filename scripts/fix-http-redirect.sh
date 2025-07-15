#!/bin/bash

echo "=== Fixing HTTP to HTTPS Redirect ==="

# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[0].LoadBalancerArn' --output text)
echo "ALB ARN: $ALB_ARN"

# Get HTTP listener ARN
HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`80`].ListenerArn' --output text)
echo "HTTP Listener ARN: $HTTP_LISTENER_ARN"

# Update HTTP listener to redirect to HTTPS
echo "Updating HTTP listener to redirect to HTTPS..."
aws elbv2 modify-listener \
    --listener-arn $HTTP_LISTENER_ARN \
    --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'

echo "=== HTTP to HTTPS redirect configured ==="
echo ""
echo "Now HTTP requests will be redirected to HTTPS automatically." 