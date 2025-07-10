#!/bin/bash

# Linton Portals - Complete CI/CD Setup Script
# This script automates the entire CI/CD setup process

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install it first."
        print_status "Installation guide: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first."
        print_status "macOS: brew install jq"
        print_status "Ubuntu/Debian: sudo apt-get install jq"
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        print_status "Installation guide: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Setup AWS infrastructure
setup_aws_infrastructure() {
    print_status "Setting up AWS infrastructure..."
    
    if [ -f "scripts/setup-aws-infrastructure.sh" ]; then
        chmod +x scripts/setup-aws-infrastructure.sh
        ./scripts/setup-aws-infrastructure.sh
    else
        print_error "AWS infrastructure setup script not found"
        exit 1
    fi
    
    print_success "AWS infrastructure setup completed"
}

# Create GitHub workflow directory
create_workflow_directory() {
    print_status "Creating GitHub workflow directory..."
    
    mkdir -p .github/workflows
    
    print_success "GitHub workflow directory created"
}

# Display next steps
show_next_steps() {
    print_success "CI/CD setup completed!"
    echo ""
    print_status "Next steps:"
    echo ""
    echo "1. 📝 Add GitHub Secrets:"
    echo "   - Go to your GitHub repository"
    echo "   - Navigate to Settings → Secrets and variables → Actions"
    echo "   - Add the secrets from github-secrets-template.md"
    echo ""
    echo "2. 🚀 Create ECS Services:"
    echo "   - Run the ECS service creation commands from CI_CD_SETUP_GUIDE.md"
    echo ""
    echo "3. 🔄 Test the Pipeline:"
    echo "   - Push your code to trigger the CI/CD pipeline"
    echo "   - Monitor the deployment in GitHub Actions"
    echo ""
    echo "4. 📊 Monitor Deployment:"
    echo "   - Check AWS CloudWatch logs"
    echo "   - Monitor ECS service status"
    echo "   - Verify application health"
    echo ""
    print_warning "Important: Update the URLs in GitHub secrets with your actual domain names"
    echo ""
    print_status "For detailed instructions, see: CI_CD_SETUP_GUIDE.md"
}

# Show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --skip-aws        Skip AWS infrastructure setup"
    echo "  --help            Show this help message"
    echo ""
    echo "This script sets up the complete CI/CD pipeline for Linton Portals."
}

# Parse command line arguments
SKIP_AWS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-aws)
            SKIP_AWS=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main function
main() {
    print_status "Starting CI/CD setup for Linton Portals..."
    echo ""
    
    check_prerequisites
    
    if [ "$SKIP_AWS" = false ]; then
        setup_aws_infrastructure
    else
        print_warning "Skipping AWS infrastructure setup"
    fi
    
    create_workflow_directory
    
    show_next_steps
}

# Run main function
main 