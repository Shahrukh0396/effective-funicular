#!/bin/bash

# Linton Portals - Staging Deployment Script
# This script deploys the entire application stack to staging environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found. Creating from template..."
        cp env.staging.example .env.local
        print_warning "Please edit .env.local file with your actual configuration values"
        print_warning "Then run this script again"
        exit 1
    fi
    
    print_success "Environment file found"
}

# Build all Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend
    print_status "Building backend image..."
    docker build -f Dockerfile.backend -t linton-backend:staging .
    
    # Build client portal
    print_status "Building client portal image..."
    docker build -f Dockerfile.client-portal -t linton-client-portal:staging .
    
    # Build employee portal
    print_status "Building employee portal image..."
    docker build -f Dockerfile.employee-portal -t linton-employee-portal:staging .
    
    # Build admin panel
    print_status "Building admin panel image..."
    docker build -f Dockerfile.admin-panel -t linton-admin-panel:staging .
    
    print_success "All images built successfully"
}

# Start the application stack
start_stack() {
    print_status "Starting application stack..."
    
    # Stop existing containers
    docker-compose down --remove-orphans
    
    # Start the stack with local environment file
    docker-compose --env-file .env.local up -d
    
    print_success "Application stack started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB..."
    until docker-compose --env-file .env.local exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 2
    done
    print_success "MongoDB is ready"
    
    # Wait for Backend
    print_status "Waiting for Backend API..."
    until curl -f http://localhost:3000/health > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Backend API is ready"
    
    # Wait for Frontend services
    print_status "Waiting for Frontend services..."
    until curl -f http://localhost:5173 > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Client Portal is ready"
    
    until curl -f http://localhost:5174 > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Employee Portal is ready"
    
    until curl -f http://localhost:5175 > /dev/null 2>&1; do
        sleep 2
    done
    print_success "Admin Panel is ready"
}

# Initialize the database
init_database() {
    print_status "Initializing database..."
    
    # Create super admin user
    docker-compose --env-file .env.local exec backend node scripts/create-super-admin.js
    
    # Create test data
    docker-compose --env-file .env.local exec backend node scripts/create-test-data.js
    
    print_success "Database initialized"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    echo "Services:"
    docker-compose --env-file .env.local ps
    echo ""
    echo "Access URLs:"
    echo "  Backend API: http://localhost:3000"
    echo "  API Docs: http://localhost:3000/api-docs"
    echo "  Client Portal: http://localhost:5173"
    echo "  Employee Portal: http://localhost:5174"
    echo "  Admin Panel: http://localhost:5175"
    echo ""
    echo "Default Super Admin:"
    echo "  Email: superadmin@linton.com"
    echo "  Password: SuperAdmin123!"
    echo ""
    print_success "Deployment completed successfully!"
}

# Main deployment function
deploy() {
    print_status "Starting Linton Portals staging deployment..."
    
    check_docker
    check_env_file
    build_images
    start_stack
    wait_for_services
    init_database
    show_status
}

# Function to stop the stack
stop_stack() {
    print_status "Stopping application stack..."
    docker-compose --env-file .env.local down
    print_success "Application stack stopped"
}

# Function to view logs
view_logs() {
    print_status "Showing logs..."
    docker-compose --env-file .env.local logs -f
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose --env-file .env.local restart
    print_success "Services restarted"
}

# Function to update and redeploy
update_deploy() {
    print_status "Updating and redeploying..."
    git pull origin main
    build_images
    restart_services
    wait_for_services
    print_success "Update and redeploy completed"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        stop_stack
        ;;
    "logs")
        view_logs
        ;;
    "restart")
        restart_services
        ;;
    "update")
        update_deploy
        ;;
    "build")
        build_images
        ;;
    *)
        echo "Usage: $0 {deploy|stop|logs|restart|update|build}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the entire application stack (default)"
        echo "  stop     - Stop all services"
        echo "  logs     - View logs from all services"
        echo "  restart  - Restart all services"
        echo "  update   - Update code and redeploy"
        echo "  build    - Build all Docker images"
        exit 1
        ;;
esac 