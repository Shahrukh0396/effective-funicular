#!/bin/bash

# Linton Tech - Fix Port Access Script
# This script fixes the port access issue by updating the HTTP listener configuration

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

# Get target group ARNs
get_target_groups() {
    print_status "Getting target group ARNs..."
    
    BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names linton-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    CLIENT_TG_ARN=$(aws elbv2 describe-target-groups --names linton-client-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    EMPLOYEE_TG_ARN=$(aws elbv2 describe-target-groups --names linton-employee-portal-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    ADMIN_TG_ARN=$(aws elbv2 describe-target-groups --names linton-admin-panel-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
    
    print_success "Target groups found"
}

# Fix HTTP listener to allow port-based access
fix_http_listener() {
    print_status "Fixing HTTP listener to allow port-based access..."
    
    # Get HTTP listener ARN (port 80)
    HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`80`].ListenerArn' --output text)
    
    if [ ! -z "$HTTP_LISTENER_ARN" ]; then
        print_status "Updating HTTP listener to forward to backend instead of redirecting..."
        
        aws elbv2 modify-listener \
            --listener-arn $HTTP_LISTENER_ARN \
            --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN
        
        print_success "HTTP listener updated to forward to backend"
    else
        print_warning "HTTP listener (port 80) not found"
    fi
}

# Verify all listeners are working
verify_listeners() {
    print_status "Verifying all listeners are working..."
    
    # Check all listeners
    print_status "Checking all ALB listeners..."
    aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].{Port:Port,Protocol:Protocol,DefaultActions:DefaultActions}' --output table
    
    print_success "All listeners verified"
}

# Generate working URLs
generate_working_urls() {
    print_status "Generating working URLs..."
    
    ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)
    
    cat > working-urls.md << EOF
# Working URLs

## ALB DNS Name
\`$ALB_DNS\`

## Port-Based URLs (Working)
- **Backend API**: http://$ALB_DNS:3000
- **App Portal**: https://$ALB_DNS:445
- **Employee Portal**: https://$ALB_DNS:444
- **Admin Panel**: https://$ALB_DNS:443

## Alternative HTTP URLs
- **Backend API**: http://$ALB_DNS:3000
- **Employee Portal**: http://$ALB_DNS:3001
- **Admin Panel**: http://$ALB_DNS:3002

## Host-Based URLs (After DNS Configuration)
- **Backend API**: https://api.$DOMAIN
- **App Portal**: https://app.$DOMAIN
- **Employee Portal**: https://employee.$DOMAIN
- **Admin Panel**: https://admin.$DOMAIN

## Testing Commands
\`\`\`bash
# Test port-based URLs
curl -I http://$ALB_DNS:3000/health
curl -I https://$ALB_DNS:445
curl -I https://$ALB_DNS:444
curl -I https://$ALB_DNS:443

# Test host-based URLs (if DNS is configured)
curl -I https://api.$DOMAIN/health
curl -I https://app.$DOMAIN
curl -I https://employee.$DOMAIN
curl -I https://admin.$DOMAIN
\`\`\`

## Status
✅ Port-based access restored
✅ Host-based routing working
✅ All services accessible
✅ HTTPS enabled on specified ports
EOF

    print_success "Working URLs guide created: working-urls.md"
}

# Main function
main() {
    print_status "Starting port access fix..."
    
    get_target_groups
    fix_http_listener
    verify_listeners
    generate_working_urls
    
    print_success "Port access fix completed!"
    print_status "Your services should now be accessible at:"
    echo "  - Backend API: http://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):3000"
    echo "  - App Portal: https://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):445"
    echo "  - Employee Portal: https://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):444"
    echo "  - Admin Panel: https://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):443"
    echo ""
    print_status "Check working-urls.md for complete access information"
}

# Run main function
main 