#!/bin/bash

# Fix API URLs in task definitions
# This script updates the VITE_API_URL to point to the ALB instead of the custom domain

set -e

echo "🔧 Fixing API URLs in task definitions..."

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers --names linton-staging-alb --query 'LoadBalancers[0].DNSName' --output text)
API_URL="http://${ALB_DNS}"

echo "📡 Using API URL: ${API_URL}"

# Update task definitions with correct API URL
update_task_definition() {
    local family=$1
    local current_revision=$2
    
    echo "🔄 Updating ${family} task definition..."
    
    # Get current task definition
    aws ecs describe-task-definition --task-definition ${family}:${current_revision} > temp_task_def.json
    
    # Update the VITE_API_URL in the task definition
    jq --arg api_url "$API_URL" '
        .taskDefinition.containerDefinitions[0].environment |= map(
            if .name == "VITE_API_URL" then
                .value = $api_url
            else
                .
            end
        )
    ' temp_task_def.json > updated_task_def.json
    
    # Extract only the required fields for registration
    jq '.taskDefinition | {family, networkMode, requiresCompatibilities, cpu, memory, executionRoleArn, taskRoleArn, containerDefinitions}' updated_task_def.json > register_task_def.json
    
    # Register new task definition and get the new revision
    register_output=$(aws ecs register-task-definition --cli-input-json file://register_task_def.json)
    new_revision=$(echo "$register_output" | jq -r '.taskDefinition.revision')
    
    echo "✅ Updated ${family} to revision ${new_revision}"
    
    # Update service to use new task definition
    # Map family to correct service name
    local service_name=""
    if [[ "$family" == "linton-client-portal" ]]; then
        service_name="linton-client-portal-service"
    elif [[ "$family" == "linton-employee-portal" ]]; then
        service_name="linton-employee-portal-service"
    elif [[ "$family" == "linton-admin-panel" ]]; then
        service_name="linton-admin-panel-service"
    else
        echo "❌ Unknown service for family: $family"
        exit 1
    fi

    aws ecs update-service \
        --cluster linton-staging-cluster \
        --service $service_name \
        --task-definition ${family}:${new_revision} > /dev/null
    
    echo "✅ Updated service to use new task definition"
    
    # Clean up
    rm temp_task_def.json updated_task_def.json register_task_def.json
}

# Update each service
echo "📦 Updating client portal..."
update_task_definition "linton-client-portal" 12

echo "📦 Updating employee portal..."
update_task_definition "linton-employee-portal" 12

echo "📦 Updating admin panel..."
update_task_definition "linton-admin-panel" 12

echo "✅ All task definitions updated successfully!"
echo "🔄 Services are being updated. This may take a few minutes..."
echo "📊 Monitor progress with: aws ecs describe-services --cluster linton-staging-cluster --services linton-client-portal-service linton-employee-portal-service linton-admin-panel-service" 