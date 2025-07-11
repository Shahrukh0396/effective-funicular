#!/usr/bin/env python3

import json
import os
import sys
from typing import Dict, List, Any

def get_secret_or_default(secret_name: str, default: str = "") -> str:
    """Get a secret value or return default if not set"""
    return os.environ.get(secret_name, default)

def create_backend_task_definition(registry: str, version: str, region: str) -> Dict[str, Any]:
    """Create backend task definition"""
    return {
        "family": "linton-backend",
        "networkMode": "awsvpc",
        "requiresCompatibilities": ["FARGATE"],
        "cpu": "512",
        "memory": "1024",
        "executionRoleArn": get_secret_or_default("ECS_EXECUTION_ROLE_ARN"),
        "taskRoleArn": get_secret_or_default("ECS_TASK_ROLE_ARN"),
        "containerDefinitions": [
            {
                "name": "linton-backend",
                "image": f"{registry}/linton-backend:{version}",
                "portMappings": [
                    {
                        "containerPort": 3000,
                        "protocol": "tcp"
                    }
                ],
                "environment": [
                    {"name": "NODE_ENV", "value": "staging"},
                    {"name": "PORT", "value": "3000"},
                    {"name": "MONGO_URI", "value": get_secret_or_default("MONGO_URI")},
                    {"name": "JWT_SECRET", "value": get_secret_or_default("JWT_SECRET")},
                    {"name": "JWT_EXPIRES_IN", "value": "7d"},
                    {"name": "CLIENT_URL", "value": get_secret_or_default("CLIENT_URL")},
                    {"name": "EMPLOYEE_URL", "value": get_secret_or_default("EMPLOYEE_URL")},
                    {"name": "ADMIN_URL", "value": get_secret_or_default("ADMIN_URL")},
                    {"name": "EMAIL_HOST", "value": get_secret_or_default("EMAIL_HOST")},
                    {"name": "EMAIL_PORT", "value": get_secret_or_default("EMAIL_PORT")},
                    {"name": "EMAIL_USER", "value": get_secret_or_default("EMAIL_USER")},
                    {"name": "EMAIL_PASS", "value": get_secret_or_default("EMAIL_PASS")},
                    {"name": "STRIPE_SECRET_KEY", "value": get_secret_or_default("STRIPE_SECRET_KEY")},
                    {"name": "STRIPE_PUBLISHABLE_KEY", "value": get_secret_or_default("STRIPE_PUBLISHABLE_KEY")},
                    {"name": "STRIPE_WEBHOOK_SECRET", "value": get_secret_or_default("STRIPE_WEBHOOK_SECRET")}
                ],
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                        "awslogs-group": "/ecs/linton-backend",
                        "awslogs-region": region,
                        "awslogs-stream-prefix": "ecs"
                    }
                }
            }
        ]
    }

def create_frontend_task_definition(service_name: str, registry: str, version: str, region: str, include_stripe: bool = False) -> Dict[str, Any]:
    """Create frontend task definition"""
    environment = [
        {"name": "VITE_API_URL", "value": get_secret_or_default("VITE_API_URL")}
    ]
    
    if include_stripe:
        environment.append({"name": "VITE_STRIPE_PUBLISHABLE_KEY", "value": get_secret_or_default("STRIPE_PUBLISHABLE_KEY")})
    
    return {
        "family": f"linton-{service_name}",
        "networkMode": "awsvpc",
        "requiresCompatibilities": ["FARGATE"],
        "cpu": "512",
        "memory": "1024",
        "executionRoleArn": get_secret_or_default("ECS_EXECUTION_ROLE_ARN"),
        "taskRoleArn": get_secret_or_default("ECS_TASK_ROLE_ARN"),
        "containerDefinitions": [
            {
                "name": f"linton-{service_name}",
                "image": f"{registry}/linton-{service_name}:{version}",
                "portMappings": [
                    {
                        "containerPort": 80,
                        "protocol": "tcp"
                    }
                ],
                "environment": environment,
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                        "awslogs-group": f"/ecs/linton-{service_name}",
                        "awslogs-region": region,
                        "awslogs-stream-prefix": "ecs"
                    }
                }
            }
        ]
    }

def write_task_definition(filename: str, task_def: Dict[str, Any]) -> None:
    """Write task definition to file"""
    with open(filename, 'w') as f:
        json.dump(task_def, f, indent=2)
    print(f"Created {filename}")

def validate_json(filename: str) -> bool:
    """Validate JSON file"""
    try:
        with open(filename, 'r') as f:
            json.load(f)
        print(f"✓ {filename} is valid JSON")
        return True
    except json.JSONDecodeError as e:
        print(f"✗ {filename} has invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"✗ Error reading {filename}: {e}")
        return False

def main():
    """Main function"""
    # Get required environment variables
    registry = os.environ.get("ECR_REGISTRY")
    version = os.environ.get("IMAGE_VERSION", "latest")
    region = os.environ.get("AWS_REGION", "us-east-2")
    
    if not registry:
        print("Error: ECR_REGISTRY environment variable is required")
        sys.exit(1)
    
    print(f"Generating task definitions with:")
    print(f"  Registry: {registry}")
    print(f"  Version: {version}")
    print(f"  Region: {region}")
    
    # Create task definitions
    task_definitions = {
        "task-definition-backend.json": create_backend_task_definition(registry, version, region),
        "task-definition-client-portal.json": create_frontend_task_definition("client-portal", registry, version, region, include_stripe=True),
        "task-definition-employee-portal.json": create_frontend_task_definition("employee-portal", registry, version, region),
        "task-definition-admin-panel.json": create_frontend_task_definition("admin-panel", registry, version, region)
    }
    
    # Write task definitions to files
    all_valid = True
    for filename, task_def in task_definitions.items():
        write_task_definition(filename, task_def)
        if not validate_json(filename):
            all_valid = False
    
    if not all_valid:
        print("Error: Some task definition files have invalid JSON")
        sys.exit(1)
    
    print("All task definition files created successfully!")

if __name__ == "__main__":
    main() 