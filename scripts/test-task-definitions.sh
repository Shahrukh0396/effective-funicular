#!/bin/bash

# Test script for task definition generation
# This script tests the Python task definition generator with sample data

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

# Test task definition generation
test_task_definitions() {
    print_status "Testing task definition generation..."
    
    # Set test environment variables
    export ECR_REGISTRY="123456789012.dkr.ecr.us-east-2.amazonaws.com"
    export IMAGE_VERSION="test-version"
    export AWS_REGION="us-east-2"
    export ECS_EXECUTION_ROLE_ARN="arn:aws:iam::123456789012:role/ecs-execution-role"
    export ECS_TASK_ROLE_ARN="arn:aws:iam::123456789012:role/ecs-task-role"
    export MONGO_URI="mongodb://test:27017/linton"
    export JWT_SECRET="test-jwt-secret"
    export CLIENT_URL="https://client.test.com"
    export EMPLOYEE_URL="https://employee.test.com"
    export ADMIN_URL="https://admin.test.com"
    export EMAIL_HOST="smtp.test.com"
    export EMAIL_PORT="587"
    export EMAIL_USER="test@test.com"
    export EMAIL_PASS="test-password"
    export STRIPE_SECRET_KEY="sk_test_123"
    export STRIPE_PUBLISHABLE_KEY="pk_test_123"
    export STRIPE_WEBHOOK_SECRET="whsec_test_123"
    export VITE_API_URL="https://api.test.com"
    
    # Run the Python script
    if python3 scripts/generate-task-definitions.py; then
        print_success "Task definition generation successful"
    else
        print_error "Task definition generation failed"
        return 1
    fi
    
    # Check if files were created
    for service in backend client-portal employee-portal admin-panel; do
        if [ -f "task-definition-${service}.json" ]; then
            print_success "Created task-definition-${service}.json"
        else
            print_error "Missing task-definition-${service}.json"
            return 1
        fi
    done
    
    # Validate JSON files
    print_status "Validating generated JSON files..."
    for service in backend client-portal employee-portal admin-panel; do
        if python3 -m json.tool "task-definition-${service}.json" > /dev/null 2>&1; then
            print_success "task-definition-${service}.json is valid JSON"
        else
            print_error "task-definition-${service}.json has invalid JSON"
            return 1
        fi
    done
    
    # Show sample content
    print_status "Sample task definition content (backend):"
    head -20 task-definition-backend.json
    
    print_success "All tests passed!"
}

# Clean up test files
cleanup() {
    print_status "Cleaning up test files..."
    rm -f task-definition-*.json
    print_success "Cleanup completed"
}

# Main function
main() {
    print_status "Starting task definition tests..."
    
    test_task_definitions
    cleanup
    
    print_success "All tests completed successfully!"
}

# Run main function
main "$@" 