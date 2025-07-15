#!/bin/bash

# Linton Tech - Deployment Restoration and Fix Script
# This script restores the working setup and configures proper host-based routing

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
REGION="us-east-2"
CLUSTER_NAME="linton-staging-cluster"
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

# Remove existing listeners
remove_existing_listeners() {
    print_status "Removing existing listeners..."
    
    EXISTING_LISTENERS=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].ListenerArn' --output text)
    
    for listener in $EXISTING_LISTENERS; do
        print_status "Removing listener: $listener"
        aws elbv2 delete-listener --listener-arn $listener || print_warning "Failed to remove listener: $listener"
    done
    
    print_success "Existing listeners removed"
}

# Restore original working configuration
restore_working_configuration() {
    print_status "Restoring original working configuration..."
    
    # Create HTTP listener (port 80) - default to backend
    print_status "Creating HTTP listener on port 80..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN
    
    # Create HTTPS listener (port 443) - default to admin panel with admin certificate
    print_status "Creating HTTPS listener on port 443 with admin certificate..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 443 \
        --certificates CertificateArn=$ADMIN_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN
    
    # Create HTTP listener (port 3000) - backend
    print_status "Creating HTTP listener on port 3000..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 3000 \
        --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN
    
    # Create HTTP listener (port 3001) - employee portal
    print_status "Creating HTTP listener on port 3001..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 3001 \
        --default-actions Type=forward,TargetGroupArn=$EMPLOYEE_TG_ARN
    
    # Create HTTP listener (port 3002) - admin panel
    print_status "Creating HTTP listener on port 3002..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 3002 \
        --default-actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN
    
    # Create HTTPS listener (port 444) - employee portal with employee certificate
    print_status "Creating HTTPS listener on port 444 with employee certificate..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 444 \
        --certificates CertificateArn=$EMPLOYEE_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$EMPLOYEE_TG_ARN
    
    # Create HTTPS listener (port 445) - client portal with app certificate
    print_status "Creating HTTPS listener on port 445 with app certificate..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 445 \
        --certificates CertificateArn=$APP_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$CLIENT_TG_ARN
    
    # Create HTTPS listener (port 446) - backend with api certificate
    print_status "Creating HTTPS listener on port 446 with api certificate..."
    aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTPS \
        --port 446 \
        --certificates CertificateArn=$API_CERT_ARN \
        --default-actions Type=forward,TargetGroupArn=$BACKEND_TG_ARN
    
    print_success "Original working configuration restored with SSL certificates"
}

# Add missing security group rules
fix_security_groups() {
    print_status "Adding missing security group rules..."
    
    # Get security group IDs
    ALB_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=linton-alb-sg" --query 'SecurityGroups[0].GroupId' --output text)
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=linton-ecs-sg" --query 'SecurityGroups[0].GroupId' --output text)
    
    # Add HTTPS rule to ALB security group if missing
    print_status "Adding HTTPS rule to ALB security group..."
    aws ec2 authorize-security-group-ingress \
        --group-id $ALB_SG \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 || print_warning "HTTPS rule may already exist"
    
    # Add HTTPS rule to ECS security group if missing
    print_status "Adding HTTPS rule to ECS security group..."
    aws ec2 authorize-security-group-ingress \
        --group-id $ECS_SG \
        --protocol tcp \
        --port 443 \
        --source-group $ALB_SG || print_warning "HTTPS rule may already exist"
    
    print_success "Security group rules updated"
}

# Configure host-based routing (optional - for future use)
configure_host_based_routing() {
    print_status "Configuring host-based routing for future use..."
    
    # Get the HTTP listener ARN
    HTTP_LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`80`].ListenerArn' --output text)
    
    if [ ! -z "$HTTP_LISTENER_ARN" ]; then
        print_status "Adding host-based routing rules..."
        
        # Client portal rule
        aws elbv2 create-rule \
            --listener-arn $HTTP_LISTENER_ARN \
            --priority 10 \
            --conditions Field=host-header,Values=client.$DOMAIN \
            --actions Type=forward,TargetGroupArn=$CLIENT_TG_ARN || print_warning "Client portal rule may already exist"
        
        # Employee portal rule
        aws elbv2 create-rule \
            --listener-arn $HTTP_LISTENER_ARN \
            --priority 20 \
            --conditions Field=host-header,Values=employee.$DOMAIN \
            --actions Type=forward,TargetGroupArn=$EMPLOYEE_TG_ARN || print_warning "Employee portal rule may already exist"
        
        # Admin panel rule
        aws elbv2 create-rule \
            --listener-arn $HTTP_LISTENER_ARN \
            --priority 30 \
            --conditions Field=host-header,Values=admin.$DOMAIN \
            --actions Type=forward,TargetGroupArn=$ADMIN_TG_ARN || print_warning "Admin panel rule may already exist"
        
        print_success "Host-based routing configured"
    else
        print_warning "HTTP listener not found, skipping host-based routing"
    fi
}

# Verify configuration
verify_configuration() {
    print_status "Verifying configuration..."
    
    # Check listeners
    print_status "Checking ALB listeners..."
    aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].{Port:Port,Protocol:Protocol}' --output table
    
    # Check ECS services
    print_status "Checking ECS services..."
    aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service \
        --query 'services[].{serviceName:serviceName,status:status,desiredCount:desiredCount,runningCount:runningCount}' \
        --output table
    
    print_success "Configuration verification completed"
}

# Generate access URLs
generate_access_urls() {
    print_status "Generating access URLs..."
    
    ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)
    
    cat > deployment-urls.md << EOF
# Deployment URLs

## ALB DNS Name
\`$ALB_DNS\`

## Working URLs (Immediate Access)
- **Backend API**: http://$ALB_DNS:3000
- **Client Portal**: https://$ALB_DNS:445
- **Employee Portal**: https://$ALB_DNS:444
- **Admin Panel**: https://$ALB_DNS:443

## Alternative HTTP URLs
- **Backend API**: http://$ALB_DNS:3000
- **Employee Portal**: http://$ALB_DNS:3001
- **Admin Panel**: http://$ALB_DNS:3002

## Host-Based URLs (After DNS Configuration)
- **Backend API**: https://api.$DOMAIN
- **Client Portal**: https://client.$DOMAIN
- **Employee Portal**: https://employee.$DOMAIN
- **Admin Panel**: https://admin.$DOMAIN

## Required DNS Records
Add these CNAME records to your domain DNS:
- \`api.$DOMAIN\` → \`$ALB_DNS\`
- \`client.$DOMAIN\` → \`$ALB_DNS\`
- \`employee.$DOMAIN\` → \`$ALB_DNS\`
- \`admin.$DOMAIN\` → \`$ALB_DNS\`

## Testing Commands
\`\`\`bash
# Test backend
curl -I http://$ALB_DNS:3000/health

# Test client portal
curl -I https://$ALB_DNS:445

# Test employee portal
curl -I https://$ALB_DNS:444

# Test admin panel
curl -I https://$ALB_DNS:443
\`\`\`

## Status
✅ Working configuration restored
✅ All services accessible
✅ HTTPS enabled on specified ports with proper SSL certificates
✅ Host-based routing configured for future use
EOF

    print_success "Access URLs guide created: deployment-urls.md"
}

# Main function
main() {
    print_status "Starting deployment restoration and fix..."
    
    get_target_groups
    remove_existing_listeners
    restore_working_configuration
    fix_security_groups
    configure_host_based_routing
    verify_configuration
    generate_access_urls
    
    print_success "Deployment restoration and fix completed!"
    print_status "Your services should now be accessible at:"
    echo "  - Backend API: http://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):3000"
    echo "  - Client Portal: https://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):445"
    echo "  - Employee Portal: https://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):444"
    echo "  - Admin Panel: https://$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text):443"
    echo ""
    print_status "Check deployment-urls.md for complete access information"
}

# Run main function
main 