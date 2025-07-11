#!/bin/bash

# Debug script for ECS task definitions
# This script helps identify and fix JSON issues in task definitions

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

# Check if required environment variables are set
check_environment_variables() {
    print_status "Checking environment variables..."
    
    # List of required environment variables
    required_vars=(
        "AWS_REGION"
        "ECS_CLUSTER"
        "ECS_SERVICE_BACKEND"
        "ECS_SERVICE_CLIENT_PORTAL"
        "ECS_SERVICE_EMPLOYEE_PORTAL"
        "ECS_SERVICE_ADMIN_PANEL"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    print_success "All required environment variables are set"
}

# Check if required secrets are set
check_secrets() {
    print_status "Checking GitHub secrets..."
    
    # List of required secrets
    required_secrets=(
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "ECS_EXECUTION_ROLE_ARN"
        "ECS_TASK_ROLE_ARN"
        "MONGO_URI"
        "JWT_SECRET"
        "CLIENT_URL"
        "EMPLOYEE_URL"
        "ADMIN_URL"
        "EMAIL_HOST"
        "EMAIL_PORT"
        "EMAIL_USER"
        "EMAIL_PASS"
        "STRIPE_SECRET_KEY"
        "STRIPE_PUBLISHABLE_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "VITE_API_URL"
    )
    
    missing_secrets=()
    
    for secret in "${required_secrets[@]}"; do
        if [ -z "${!secret}" ]; then
            missing_secrets+=("$secret")
        fi
    done
    
    if [ ${#missing_secrets[@]} -gt 0 ]; then
        print_warning "Missing secrets: ${missing_secrets[*]}"
        print_warning "These will be set to empty strings in task definitions"
    else
        print_success "All required secrets are set"
    fi
}

# Create task definition with proper JSON validation
create_task_definition() {
    local service_name=$1
    local image=$2
    local container_port=$3
    local environment_vars=$4
    
    print_status "Creating task definition for $service_name..."
    
    # Create the task definition JSON
    cat > "task-definition-${service_name}.json" << EOF
{
  "family": "linton-${service_name}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "${ECS_EXECUTION_ROLE_ARN:-}",
  "taskRoleArn": "${ECS_TASK_ROLE_ARN:-}",
  "containerDefinitions": [
    {
      "name": "linton-${service_name}",
      "image": "${image}",
      "portMappings": [
        {
          "containerPort": ${container_port},
          "protocol": "tcp"
        }
      ],
      "environment": [
        ${environment_vars}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/linton-${service_name}",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

    # Validate JSON
    if python3 -m json.tool "task-definition-${service_name}.json" > /dev/null 2>&1; then
        print_success "Task definition for $service_name is valid JSON"
    else
        print_error "Task definition for $service_name contains invalid JSON"
        print_error "Content:"
        cat "task-definition-${service_name}.json"
        return 1
    fi
}

# Create all task definitions
create_all_task_definitions() {
    print_status "Creating all task definitions..."
    
    # Backend environment variables
    backend_env='[
        {"name": "NODE_ENV", "value": "staging"},
        {"name": "PORT", "value": "3000"},
        {"name": "MONGO_URI", "value": "'${MONGO_URI:-}'"},
        {"name": "JWT_SECRET", "value": "'${JWT_SECRET:-}'"},
        {"name": "JWT_EXPIRES_IN", "value": "7d"},
        {"name": "CLIENT_URL", "value": "'${CLIENT_URL:-}'"},
        {"name": "EMPLOYEE_URL", "value": "'${EMPLOYEE_URL:-}'"},
        {"name": "ADMIN_URL", "value": "'${ADMIN_URL:-}'"},
        {"name": "EMAIL_HOST", "value": "'${EMAIL_HOST:-}'"},
        {"name": "EMAIL_PORT", "value": "'${EMAIL_PORT:-}'"},
        {"name": "EMAIL_USER", "value": "'${EMAIL_USER:-}'"},
        {"name": "EMAIL_PASS", "value": "'${EMAIL_PASS:-}'"},
        {"name": "STRIPE_SECRET_KEY", "value": "'${STRIPE_SECRET_KEY:-}'"},
        {"name": "STRIPE_PUBLISHABLE_KEY", "value": "'${STRIPE_PUBLISHABLE_KEY:-}'"},
        {"name": "STRIPE_WEBHOOK_SECRET", "value": "'${STRIPE_WEBHOOK_SECRET:-}'"}
      ]'
    
    # Frontend environment variables
    frontend_env='[
        {"name": "VITE_API_URL", "value": "'${VITE_API_URL:-}'"},
        {"name": "VITE_STRIPE_PUBLISHABLE_KEY", "value": "'${STRIPE_PUBLISHABLE_KEY:-}'"}
      ]'
    
    # Create task definitions
    create_task_definition "backend" "${ECR_REGISTRY}/linton-backend:latest" "3000" "$backend_env"
    create_task_definition "client-portal" "${ECR_REGISTRY}/linton-client-portal:latest" "80" "$frontend_env"
    create_task_definition "employee-portal" "${ECR_REGISTRY}/linton-employee-portal:latest" "80" "$frontend_env"
    create_task_definition "admin-panel" "${ECR_REGISTRY}/linton-admin-panel:latest" "80" "$frontend_env"
    
    print_success "All task definitions created successfully"
}

# Register task definitions
register_task_definitions() {
    print_status "Registering task definitions..."
    
    for service in backend client-portal employee-portal admin-panel; do
        print_status "Registering task definition for $service..."
        
        if aws ecs register-task-definition --cli-input-json file://task-definition-${service}.json; then
            print_success "Task definition for $service registered successfully"
        else
            print_error "Failed to register task definition for $service"
            return 1
        fi
    done
    
    print_success "All task definitions registered successfully"
}

# Update ECS services
update_ecs_services() {
    print_status "Updating ECS services..."
    
    # Update backend service
    print_status "Updating backend service..."
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE_BACKEND" \
        --task-definition linton-backend
    
    # Update client portal service
    print_status "Updating client portal service..."
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE_CLIENT_PORTAL" \
        --task-definition linton-client-portal
    
    # Update employee portal service
    print_status "Updating employee portal service..."
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE_EMPLOYEE_PORTAL" \
        --task-definition linton-employee-portal
    
    # Update admin panel service
    print_status "Updating admin panel service..."
    aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE_ADMIN_PANEL" \
        --task-definition linton-admin-panel
    
    print_success "All ECS services updated"
}

# Wait for deployment to complete
wait_for_deployment() {
    print_status "Waiting for deployment to complete..."
    
    # Wait for all services to be stable
    aws ecs wait services-stable \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE_BACKEND" "$ECS_SERVICE_CLIENT_PORTAL" "$ECS_SERVICE_EMPLOYEE_PORTAL" "$ECS_SERVICE_ADMIN_PANEL"
    
    print_success "Deployment completed successfully"
}

# Main function
main() {
    print_status "Starting task definition debug and deployment..."
    
    # Set default values for missing environment variables
    export AWS_REGION=${AWS_REGION:-us-east-2}
    export ECR_REGISTRY=${ECR_REGISTRY:-$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_REGION}.amazonaws.com}
    
    check_environment_variables
    check_secrets
    create_all_task_definitions
    register_task_definitions
    update_ecs_services
    wait_for_deployment
    
    print_success "Deployment completed successfully!"
}

# Run main function
main "$@" 