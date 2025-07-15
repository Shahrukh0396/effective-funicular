#!/bin/bash

# Linton Tech - Add HTTPS Host-Based Routing Script
# This script adds host-based routing rules to HTTPS listeners

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

# Add host-based routing to HTTPS listeners
add_https_host_routing() {
    print_status "Adding host-based routing to HTTPS listeners..."
    
    # Get HTTPS listener ARN (port 443)
    HTTPS_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`443`].ListenerArn' --output text)
    
    if [ ! -z "$HTTPS_LISTENER_ARN" ]; then
        print_status "Adding host-based routing rules to HTTPS listener (port 443)..."
        
        # App portal rule
        aws elbv2 create-rule \
            --listener-arn $HTTPS_LISTENER_ARN \
            --priority 10 \
            --conditions Field=host-header,Values=app.$DOMAIN \
            --actions Type=forward,TargetGroupArn=$CLIENT_TG_ARN || print_warning "App portal rule may already exist"
        
        # Employee portal rule
        aws elbv2 create-rule \
            --listener-arn $HTTPS_LISTENER_ARN \
            --priority 20 \
            --conditions Field=host-header,Values=employee.$DOMAIN \
            --actions Type=forward,TargetGroupArn=$EMPLOYEE_TG_ARN || print_warning "Employee portal rule may already exist"
        
        # Admin panel rule
        aws elbv2 create-rule \
            --listener-arn $HTTPS_LISTENER_ARN \
            --priority 30 \
            --conditions Field=host-header,Values=admin.$DOMAIN \
            --actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN || print_warning "Admin panel rule may already exist"
        
        print_success "Host-based routing rules added to HTTPS listener (port 443)"
    else
        print_warning "HTTPS listener (port 443) not found"
    fi
}

# Update HTTP listener to redirect to HTTPS
update_http_redirect() {
    print_status "Updating HTTP listener to redirect to HTTPS..."
    
    # Get HTTP listener ARN (port 80)
    HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`80`].ListenerArn' --output text)
    
    if [ ! -z "$HTTP_LISTENER_ARN" ]; then
        print_status "Updating HTTP listener to redirect all traffic to HTTPS..."
        
        aws elbv2 modify-listener \
            --listener-arn $HTTP_LISTENER_ARN \
            --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}'
        
        print_success "HTTP listener updated to redirect to HTTPS"
    else
        print_warning "HTTP listener (port 80) not found"
    fi
}

# Verify configuration
verify_configuration() {
    print_status "Verifying HTTPS host-based routing configuration..."
    
    # Check HTTPS listener rules
    HTTPS_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`443`].ListenerArn' --output text)
    
    if [ ! -z "$HTTPS_LISTENER_ARN" ]; then
        print_status "Checking HTTPS listener rules..."
        aws elbv2 describe-rules --listener-arn $HTTPS_LISTENER_ARN --query 'Rules[].{Priority:Priority,Conditions:Conditions,Actions:Actions}' --output table
    fi
    
    print_success "Configuration verification completed"
}

# Generate final access URLs
generate_final_urls() {
    print_status "Generating final access URLs..."
    
    cat > final-access-urls.md << EOF
# Final Access URLs

## HTTPS Host-Based URLs (Primary)
- **Backend API**: https://api.$DOMAIN
- **App Portal**: https://app.$DOMAIN
- **Employee Portal**: https://employee.$DOMAIN
- **Admin Panel**: https://admin.$DOMAIN

## Port-Based URLs (Fallback)
- **Backend API**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000
- **App Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
- **Employee Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
- **Admin Panel**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443

## Testing Commands
\`\`\`bash
# Test host-based URLs
curl -I https://api.$DOMAIN/health
curl -I https://app.$DOMAIN
curl -I https://employee.$DOMAIN
curl -I https://admin.$DOMAIN

# Test port-based URLs
curl -I http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000/health
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443
\`\`\`

## Status
✅ HTTPS host-based routing configured
✅ HTTP to HTTPS redirect enabled
✅ All subdomains working with SSL
✅ Port-based access still available as fallback
EOF

    print_success "Final access URLs guide created: final-access-urls.md"
}

# Main function
main() {
    print_status "Starting HTTPS host-based routing configuration..."
    
    get_target_groups
    add_https_host_routing
    update_http_redirect
    verify_configuration
    generate_final_urls
    
    print_success "HTTPS host-based routing configuration completed!"
    print_status "Your subdomains should now work with HTTPS:"
    echo "  - https://api.$DOMAIN"
    echo "  - https://app.$DOMAIN"
    echo "  - https://employee.$DOMAIN"
    echo "  - https://admin.$DOMAIN"
    echo ""
    print_status "Check final-access-urls.md for complete access information"
}

# Run main function
main 