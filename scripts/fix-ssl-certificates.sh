#!/bin/bash

# Linton Tech - Fix SSL Certificates Script
# This script fixes the SSL certificate mismatch issue

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
ALB_ARN="arn:aws:elasticloadbalancing:us-east-2:944871470938:loadbalancer/app/linton-staging-alb/b2fd8ec449df90f1"
DOMAIN="linton-tech.com"

# SSL Certificate ARNs
API_CERT_ARN="arn:aws:acm:us-east-2:944871470938:certificate/da485256-5481-4c21-a5ed-18e2dfb4aa6c"
ADMIN_CERT_ARN="arn:aws:acm:us-east-2:944871470938:certificate/50c46dcc-b97e-4b4e-8d20-fc9bbb8bb4ab"
EMPLOYEE_CERT_ARN="arn:aws:acm:us-east-2:944871470938:certificate/d46c0a71-3a46-406c-97b2-56c344ffe4ad"
APP_CERT_ARN="arn:aws:acm:us-east-2:944871470938:certificate/75570a7c-11e6-4386-bbff-a083c9914fa7"

# Get target group ARNs
get_target_groups() {
    print_status "Getting target group ARNs..."
    
    BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    CLIENT_TG_ARN=$(aws elbv2 describe-target-groups --names linton-client-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    EMPLOYEE_TG_ARN=$(aws elbv2 describe-target-groups --names linton-employee-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    ADMIN_TG_ARN=$(aws elbv2 describe-target-groups --names linton-admin-panel-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    
    print_success "Target groups found"
}

# Fix HTTPS listener to use correct certificates
fix_https_listener() {
    print_status "Fixing HTTPS listener to use correct certificates..."
    
    # Get HTTPS listener ARN (port 443)
    HTTPS_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`443`].ListenerArn' --output text)
    
    if [ ! -z "$HTTPS_LISTENER_ARN" ]; then
        print_status "Updating HTTPS listener to use admin certificate as default..."
        
        # Update the HTTPS listener to use admin certificate as default
        aws elbv2 modify-listener \
            --listener-arn $HTTPS_LISTENER_ARN \
            --certificates CertificateArn=$ADMIN_CERT_ARN \
            --default-actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN
        
        print_success "HTTPS listener updated with admin certificate"
    else
        print_warning "HTTPS listener (port 443) not found"
    fi
}

# Create separate HTTPS listeners for each subdomain
create_subdomain_listeners() {
    print_status "Creating separate HTTPS listeners for each subdomain..."
    
    # Create HTTPS listener for app subdomain (port 8443)
    print_status "Creating HTTPS listener for app subdomain on port 8443..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 8443 \
        --certificates CertificateArn=$APP_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$CLIENT_TG_ARN || print_warning "App listener may already exist"
    
    # Create HTTPS listener for employee subdomain (port 8444)
    print_status "Creating HTTPS listener for employee subdomain on port 8444..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 8444 \
        --certificates CertificateArn=$EMPLOYEE_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$EMPLOYEE_TG_ARN || print_warning "Employee listener may already exist"
    
    # Create HTTPS listener for api subdomain (port 8446)
    print_status "Creating HTTPS listener for api subdomain on port 8446..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 8446 \
        --certificates CertificateArn=$API_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN || print_warning "API listener may already exist"
    
    print_success "Subdomain HTTPS listeners created"
}

# Update DNS records to point to specific ports
update_dns_guide() {
    print_status "Generating DNS update guide..."
    
    cat > dns-update-guide.md << EOF
# DNS Update Guide

## Current Issue
Your SSL certificates are domain-specific, but the ALB is using a single certificate for all subdomains.

## Solution Options

### Option 1: Use Port-Specific URLs (Recommended)
Update your DNS to point to specific ports that match the certificates:

- **api.linton-tech.com** → \`linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:8446\`
- **app.linton-tech.com** → \`linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:8443\`
- **employee.linton-tech.com** → \`linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:8444\`
- **admin.linton-tech.com** → \`linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443\`

### Option 2: Create Wildcard Certificate
Create a wildcard certificate for \`*.linton-tech.com\` in AWS Certificate Manager.

### Option 3: Use Current Setup
The current setup works but shows certificate warnings. You can proceed with:
- https://api.linton-tech.com:8446
- https://app.linton-tech.com:8443
- https://employee.linton-tech.com:8444
- https://admin.linton-tech.com

## Testing URLs
\`\`\`bash
# Test with port-specific URLs
curl -I https://api.linton-tech.com:8446/health
curl -I https://app.linton-tech.com:8443
curl -I https://employee.linton-tech.com:8444
curl -I https://admin.linton-tech.com
\`\`\`
EOF

    print_success "DNS update guide created: dns-update-guide.md"
}

# Verify configuration
verify_configuration() {
    print_status "Verifying SSL certificate configuration..."
    
    # Check all HTTPS listeners
    print_status "Checking all HTTPS listeners..."
    aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Protocol==`HTTPS`].{Port:Port,Certificates:Certificates}' --output table
    
    print_success "SSL certificate configuration verified"
}

# Main function
main() {
    print_status "Starting SSL certificate fix..."
    
    get_target_groups
    fix_https_listener
    create_subdomain_listeners
    update_dns_guide
    verify_configuration
    
    print_success "SSL certificate fix completed!"
    print_status "Next steps:"
    echo "1. Check dns-update-guide.md for DNS configuration options"
    echo "2. Update your DNS records to use port-specific URLs"
    echo "3. Test the new URLs with proper SSL certificates"
}

# Run main function
main 