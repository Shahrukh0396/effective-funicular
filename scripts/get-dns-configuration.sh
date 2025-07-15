#!/bin/bash

echo "=== AWS ALB DNS Configuration ==="
echo ""

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[0].DNSName' --output text)
ALB_ARN=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[0].LoadBalancerArn' --output text)

echo "ALB DNS Name: $ALB_DNS"
echo "ALB ARN: $ALB_ARN"
echo ""

echo "=== DNS Configuration Required ==="
echo ""
echo "Update your DNS records to point each subdomain to the ALB with the correct port:"
echo ""
echo "1. app.linton-tech.com → $ALB_DNS:444 (or :8444)"
echo "2. admin.linton-tech.com → $ALB_DNS:445"
echo "3. employee.linton-tech.com → $ALB_DNS:446 (or :8446)"
echo "4. api.linton-tech.com → $ALB_DNS:443"
echo ""
echo "Note: You'll need to configure your DNS provider to handle port-specific routing."
echo "Alternatively, you can use different ALB DNS names or create separate ALBs for each subdomain."
echo ""

echo "=== Current Listener Configuration ==="
aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].{Port: Port, Protocol: Protocol, Certificates: Certificates[].CertificateArn}' --output table 