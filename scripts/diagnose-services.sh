#!/bin/bash

echo "🔍 Diagnosing ECS Services..."
echo "============================="

CLUSTER_NAME="linton-staging-cluster"

# Check if cluster exists
echo "1. Checking ECS Cluster..."
aws ecs describe-clusters --clusters $CLUSTER_NAME --query 'clusters[0].{clusterName:clusterName,status:status,activeServicesCount:activeServicesCount}' --output table 2>/dev/null || echo "Cluster not found"

# Check task definitions
echo ""
echo "2. Checking Task Definitions..."
aws ecs list-task-definitions --family-prefix linton --query 'taskDefinitionArns' --output table 2>/dev/null || echo "No task definitions found"

# Check services
echo ""
echo "3. Checking ECS Services..."
for service in linton-backend-service linton-client-portal-service linton-employee-portal-service linton-admin-panel-service; do
    echo "Service: $service"
    aws ecs describe-services --cluster $CLUSTER_NAME --services $service --query 'services[0].{serviceName:serviceName,status:status,desiredCount:desiredCount,runningCount:runningCount,pendingCount:pendingCount}' --output table 2>/dev/null || echo "Service not found"
    echo ""
done

# Check recent events
echo ""
echo "4. Recent Service Events (Backend):"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service --query 'services[0].events[0:3]' --output table 2>/dev/null || echo "No events found"

# Check target groups
echo ""
echo "5. Checking Target Groups..."
aws elbv2 describe-target-groups --names linton-backend-tg linton-client-portal-tg linton-employee-portal-tg linton-admin-panel-tg --query 'TargetGroups[].{TargetGroupName:TargetGroupName,Port:Port,Protocol:Protocol}' --output table 2>/dev/null || echo "Target groups not found"

# Check ALB listeners
echo ""
echo "6. Checking ALB Listeners..."
ALB_ARN=$(jq -r '.alb_arn' alb-info.json)
aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[].{Port:Port,Protocol:Protocol,DefaultActions:DefaultActions[0].Type}' --output table 2>/dev/null || echo "Listeners not found"

# Check security groups
echo ""
echo "7. Checking Security Groups..."
ECS_SG=$(jq -r '.ecs_security_group' security-groups.json)
aws ec2 describe-security-groups --group-ids $ECS_SG --query 'SecurityGroups[0].{GroupName:GroupName,GroupId:GroupId,IpPermissions:IpPermissions}' --output json 2>/dev/null || echo "Security group not found"

echo ""
echo "🔧 Next Steps:"
echo "1. Check if task definitions exist"
echo "2. Verify IAM roles have proper permissions"
echo "3. Check if ECR images exist and are accessible"
echo "4. Verify network configuration (VPC, subnets, security groups)" 