#!/bin/bash

echo "=== Cleaning up extra listeners ==="

# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[0].LoadBalancerArn' --output text)
echo "ALB ARN: $ALB_ARN"

# Get all listeners
echo "Current listeners:"
aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].{Port: Port, Protocol: Protocol}' --output table

# Remove extra HTTPS listeners (keep only port 443)
echo ""
echo "Removing extra HTTPS listeners..."

# Remove port 444 listener
echo "Removing port 444 listener..."
LISTENER_444_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`444`].ListenerArn' --output text)
if [ ! -z "$LISTENER_444_ARN" ]; then
    aws elbv2 delete-listener --listener-arn $LISTENER_444_ARN
    echo "Removed port 444 listener"
else
    echo "Port 444 listener not found"
fi

# Remove port 445 listener
echo "Removing port 445 listener..."
LISTENER_445_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`445`].ListenerArn' --output text)
if [ ! -z "$LISTENER_445_ARN" ]; then
    aws elbv2 delete-listener --listener-arn $LISTENER_445_ARN
    echo "Removed port 445 listener"
else
    echo "Port 445 listener not found"
fi

# Remove port 446 listener
echo "Removing port 446 listener..."
LISTENER_446_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`446`].ListenerArn' --output text)
if [ ! -z "$LISTENER_446_ARN" ]; then
    aws elbv2 delete-listener --listener-arn $LISTENER_446_ARN
    echo "Removed port 446 listener"
else
    echo "Port 446 listener not found"
fi

# Remove port 8444 listener
echo "Removing port 8444 listener..."
LISTENER_8444_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`8444`].ListenerArn' --output text)
if [ ! -z "$LISTENER_8444_ARN" ]; then
    aws elbv2 delete-listener --listener-arn $LISTENER_8444_ARN
    echo "Removed port 8444 listener"
else
    echo "Port 8444 listener not found"
fi

# Remove port 8446 listener
echo "Removing port 8446 listener..."
LISTENER_8446_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`8446`].ListenerArn' --output text)
if [ ! -z "$LISTENER_8446_ARN" ]; then
    aws elbv2 delete-listener --listener-arn $LISTENER_8446_ARN
    echo "Removed port 8446 listener"
else
    echo "Port 8446 listener not found"
fi

echo ""
echo "=== Final listener configuration ==="
aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].{Port: Port, Protocol: Protocol}' --output table

echo ""
echo "=== DNS Configuration ==="
echo "Point your DNS records to:"
echo "linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo ""
echo "All subdomains will work on HTTPS (port 443) with proper SSL certificates:"
echo "- https://app.linton-tech.com"
echo "- https://admin.linton-tech.com"
echo "- https://employee.linton-tech.com"
echo "- https://api.linton-tech.com" 