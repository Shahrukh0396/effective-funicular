#!/bin/bash

echo "=== Updating HTTPS Listener with All Certificates ==="

# Get ALB ARN
ALB_ARN=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[0].LoadBalancerArn' --output text)
echo "ALB ARN: $ALB_ARN"

# Get HTTPS listener ARN
HTTPS_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`443`].ListenerArn' --output text)
echo "HTTPS Listener ARN: $HTTPS_LISTENER_ARN"

# Get all certificate ARNs (using the specific certificate for app.linton-tech.com)
CERT_APP="arn:aws:acm:us-east-2:944871470938:certificate/3ab6cf49-ac79-4cdf-9b88-1fe0f83d5d16"
CERT_ADMIN="arn:aws:acm:us-east-2:944871470938:certificate/50c46dcc-b97e-4b4e-8d20-fc9bbb8bb4ab"
CERT_EMPLOYEE="arn:aws:acm:us-east-2:944871470938:certificate/d46c0a71-3a46-406c-97b2-56c344ffe4ad"
CERT_API="arn:aws:acm:us-east-2:944871470938:certificate/da485256-5481-4c21-a5ed-18e2dfb4aa6c"

echo "Available certificates:"
echo "- app.linton-tech.com: $CERT_APP"
echo "- admin.linton-tech.com: $CERT_ADMIN"
echo "- employee.linton-tech.com: $CERT_EMPLOYEE"
echo "- api.linton-tech.com: $CERT_API"

# Update the HTTPS listener with all certificates
echo ""
echo "Updating HTTPS listener with all certificates..."
aws elbv2 modify-listener \
    --listener-arn $HTTPS_LISTENER_ARN \
    --certificates CertificateArn=$CERT_APP CertificateArn=$CERT_ADMIN CertificateArn=$CERT_EMPLOYEE CertificateArn=$CERT_API

echo ""
echo "=== HTTPS Listener Updated ==="
echo "The HTTPS listener now supports all your subdomains:"
echo "- https://app.linton-tech.com"
echo "- https://admin.linton-tech.com"
echo "- https://employee.linton-tech.com"
echo "- https://api.linton-tech.com" 