#!/bin/bash

# External Services Setup Script
# This script helps you set up all external services needed for Docker deployment

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

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.production.example .env
        print_warning "Please edit .env file with your actual configuration values"
        print_warning "Then run this script again"
        exit 1
    fi
    
    print_success "Environment file found"
}

# Setup AWS S3
setup_aws_s3() {
    print_status "Setting up AWS S3..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not installed. Please install it first:"
        echo "  curl 'https://awscli.amazonaws.com/AWSCLIV2.pkg' -o 'AWSCLIV2.pkg'"
        echo "  sudo installer -pkg AWSCLIV2.pkg -target /"
        return 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_warning "AWS credentials not configured. Please run 'aws configure' first"
        return 1
    fi
    
    # Create S3 bucket
    BUCKET_NAME="linton-portals-staging-$(date +%s)"
    aws s3 mb s3://$BUCKET_NAME
    
    print_success "S3 bucket created: $BUCKET_NAME"
    print_warning "Add to .env: AWS_S3_BUCKET=$BUCKET_NAME"
}

# Setup SendGrid
setup_sendgrid() {
    print_status "Setting up SendGrid..."
    
    print_warning "Please manually setup SendGrid:"
    echo "1. Go to https://sendgrid.com/"
    echo "2. Create account (free tier available)"
    echo "3. Verify your domain"
    echo "4. Create API key with 'Mail Send' permissions"
    echo "5. Add to .env:"
    echo "   EMAIL_HOST=smtp.sendgrid.net"
    echo "   EMAIL_PORT=587"
    echo "   EMAIL_USER=apikey"
    echo "   EMAIL_PASS=your_api_key"
}

# Setup Sentry
setup_sentry() {
    print_status "Setting up Sentry..."
    
    print_warning "Please manually setup Sentry:"
    echo "1. Go to https://sentry.io/"
    echo "2. Create account (free tier available)"
    echo "3. Create new project for 'Node.js'"
    echo "4. Copy your DSN"
    echo "5. Add to .env: SENTRY_DSN=your_dsn"
}

# Setup Domain and DNS
setup_domain() {
    print_status "Setting up Domain and DNS..."
    
    print_warning "Please manually setup domain:"
    echo "1. Register domain at Namecheap/GoDaddy (~$10-15/year)"
    echo "2. Setup Cloudflare (free):"
    echo "   - Add domain to Cloudflare"
    echo "   - Update nameservers at registrar"
    echo "3. Create subdomains:"
    echo "   - api.yourdomain.com"
    echo "   - client.yourdomain.com"
    echo "   - employee.yourdomain.com"
    echo "   - admin.yourdomain.com"
    echo "4. Add to .env:"
    echo "   DOMAIN=yourdomain.com"
    echo "   SSL_EMAIL=admin@yourdomain.com"
}

# Setup Stripe
setup_stripe() {
    print_status "Setting up Stripe..."
    
    print_warning "Please manually setup Stripe:"
    echo "1. Go to https://stripe.com/"
    echo "2. Create account"
    echo "3. Get API keys from Dashboard → Developers → API Keys"
    echo "4. Setup webhook:"
    echo "   - URL: https://api.yourdomain.com/webhooks/stripe"
    echo "   - Events: payment_intent.succeeded, customer.subscription.created"
    echo "5. Add to .env:"
    echo "   STRIPE_SECRET_KEY=sk_test_..."
    echo "   STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
}

# Show summary
show_summary() {
    print_status "External Services Setup Summary:"
    echo ""
    echo "✅ Docker Compose (Local Services):"
    echo "   - Backend API"
    echo "   - Frontend Applications"
    echo "   - MongoDB Database"
    echo "   - Redis Cache"
    echo "   - Nginx Load Balancer"
    echo ""
    echo "🔧 External Services Needed:"
    echo "   - AWS S3 (File Storage)"
    echo "   - SendGrid (Email Service)"
    echo "   - Sentry (Monitoring)"
    echo "   - Domain & DNS (Cloudflare)"
    echo "   - Stripe (Payment Processing)"
    echo "   - SSL Certificates (Let's Encrypt)"
    echo ""
    echo "💰 Estimated Monthly Costs:"
    echo "   - AWS S3: ~$1-5"
    echo "   - SendGrid: Free tier (100 emails/day)"
    echo "   - Sentry: Free tier (5K errors/month)"
    echo "   - Domain: ~$1-2"
    echo "   - Stripe: 2.9% + 30¢ per transaction"
    echo "   - SSL: Free"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Complete external service setup"
    echo "2. Update .env with all credentials"
    echo "3. Run: docker-compose -f docker-compose.production.yml up -d"
    echo "4. Test all functionality"
    echo ""
    print_success "Setup guide completed!"
}

# Main function
main() {
    print_status "Starting External Services Setup..."
    
    check_env_file
    setup_aws_s3
    setup_sendgrid
    setup_sentry
    setup_domain
    setup_stripe
    show_summary
}

# Parse command line arguments
case "${1:-all}" in
    "all")
        main
        ;;
    "aws")
        setup_aws_s3
        ;;
    "sendgrid")
        setup_sendgrid
        ;;
    "sentry")
        setup_sentry
        ;;
    "domain")
        setup_domain
        ;;
    "stripe")
        setup_stripe
        ;;
    *)
        echo "Usage: $0 {all|aws|sendgrid|sentry|domain|stripe}"
        echo ""
        echo "Commands:"
        echo "  all       - Setup all external services (default)"
        echo "  aws       - Setup AWS S3 only"
        echo "  sendgrid  - Setup SendGrid only"
        echo "  sentry    - Setup Sentry only"
        echo "  domain    - Setup domain and DNS only"
        echo "  stripe    - Setup Stripe only"
        exit 1
        ;;
esac 