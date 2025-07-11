#!/bin/bash

echo "🚀 Complete Linton Portals Infrastructure Setup"
echo "=============================================="

# Configuration
REGION="us-east-2"
CLUSTER_NAME="linton-staging-cluster"
VPC_NAME="linton-staging-vpc"

echo "1. Creating VPC and networking..."

# Create VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region $REGION --query Vpc.VpcId --output text 2>/dev/null || echo "VPC may already exist")
if [ "$VPC_ID" != "VPC may already exist" ]; then
    aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=$VPC_NAME --region $REGION
    echo "VPC created: $VPC_ID"
else
    echo "Using existing VPC"
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$VPC_NAME" --region $REGION --query 'Vpcs[0].VpcId' --output text)
fi

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway --region $REGION --query InternetGateway.InternetGatewayId --output text 2>/dev/null || echo "IGW may already exist")
if [ "$IGW_ID" != "IGW may already exist" ]; then
    aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $REGION
    echo "Internet Gateway created: $IGW_ID"
else
    echo "Using existing Internet Gateway"
    IGW_ID=$(aws ec2 describe-internet-gateways --region $REGION --query 'InternetGateways[0].InternetGatewayId' --output text)
fi

# Create public subnets
SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone ${REGION}a --region $REGION --query Subnet.SubnetId --output text 2>/dev/null || echo "Subnet1 may already exist")
SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ${REGION}b --region $REGION --query Subnet.SubnetId --output text 2>/dev/null || echo "Subnet2 may already exist")

if [ "$SUBNET_1" != "Subnet1 may already exist" ] && [ "$SUBNET_2" != "Subnet2 may already exist" ]; then
    echo "Public subnets created: $SUBNET_1, $SUBNET_2"
else
    echo "Using existing subnets"
    SUBNET_1=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=10.0.1.0/24" --region $REGION --query 'Subnets[0].SubnetId' --output text)
    SUBNET_2=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=10.0.2.0/24" --region $REGION --query 'Subnets[1].SubnetId' --output text)
fi

# Create route table
ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --region $REGION --query RouteTable.RouteTableId --output text 2>/dev/null || echo "Route table may already exist")
if [ "$ROUTE_TABLE_ID" != "Route table may already exist" ]; then
    aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $REGION
    aws ec2 associate-route-table --subnet-id $SUBNET_1 --route-table-id $ROUTE_TABLE_ID --region $REGION
    aws ec2 associate-route-table --subnet-id $SUBNET_2 --route-table-id $ROUTE_TABLE_ID --region $REGION
    echo "Route table created: $ROUTE_TABLE_ID"
else
    echo "Using existing route table"
    ROUTE_TABLE_ID=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query 'RouteTables[0].RouteTableId' --output text)
fi

echo ""
echo "2. Creating security groups..."

# Security group for ALB
ALB_SG=$(aws ec2 create-security-group --group-name linton-alb-sg --description "Security group for ALB" --vpc-id $VPC_ID --region $REGION --query GroupId --output text 2>/dev/null || echo "ALB SG may already exist")
if [ "$ALB_SG" != "ALB SG may already exist" ]; then
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $REGION
    echo "ALB Security Group created: $ALB_SG"
else
    echo "Using existing ALB security group"
    ALB_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=linton-alb-sg" --region $REGION --query 'SecurityGroups[0].GroupId' --output text)
fi

# Security group for ECS services
ECS_SG=$(aws ec2 create-security-group --group-name linton-ecs-sg --description "Security group for ECS services" --vpc-id $VPC_ID --region $REGION --query GroupId --output text 2>/dev/null || echo "ECS SG may already exist")
if [ "$ECS_SG" != "ECS SG may already exist" ]; then
    aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 3000 --source-group $ALB_SG --region $REGION
    aws ec2 authorize-security-group-ingress --group-id $ECS_SG --protocol tcp --port 80 --source-group $ALB_SG --region $REGION
    echo "ECS Security Group created: $ECS_SG"
else
    echo "Using existing ECS security group"
    ECS_SG=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=linton-ecs-sg" --region $REGION --query 'SecurityGroups[0].GroupId' --output text)
fi

echo ""
echo "3. Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $REGION 2>/dev/null || echo "Cluster may already exist"

echo ""
echo "4. Registering task definitions..."

# Register all task definitions
aws ecs register-task-definition --cli-input-json file://task-definition-backend.json --region $REGION
aws ecs register-task-definition --cli-input-json file://task-definition-client-portal.json --region $REGION
aws ecs register-task-definition --cli-input-json file://task-definition-employee-portal.json --region $REGION
aws ecs register-task-definition --cli-input-json file://task-definition-admin-panel.json --region $REGION

echo ""
echo "5. Creating ECS services..."

# Get the latest task definition revisions
BACKEND_REVISION=$(aws ecs describe-task-definition --task-definition linton-backend --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
CLIENT_REVISION=$(aws ecs describe-task-definition --task-definition linton-client-portal --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
EMPLOYEE_REVISION=$(aws ecs describe-task-definition --task-definition linton-employee-portal --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")
ADMIN_REVISION=$(aws ecs describe-task-definition --task-definition linton-admin-panel --region $REGION --query 'taskDefinition.revision' --output text 2>/dev/null || echo "1")

echo "Creating backend service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-backend-service \
    --task-definition linton-backend:$BACKEND_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Backend service may already exist"

echo "Creating client portal service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-client-portal-service \
    --task-definition linton-client-portal:$CLIENT_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Client portal service may already exist"

echo "Creating employee portal service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-employee-portal-service \
    --task-definition linton-employee-portal:$EMPLOYEE_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Employee portal service may already exist"

echo "Creating admin panel service..."
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name linton-admin-panel-service \
    --task-definition linton-admin-panel:$ADMIN_REVISION \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1,$SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
    --region $REGION 2>/dev/null || echo "Admin panel service may already exist"

echo ""
echo "6. Waiting for services to stabilize..."
sleep 30

echo ""
echo "7. Checking service status..."
echo "Backend service status:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-backend-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo "Client portal service status:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-client-portal-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo "Employee portal service status:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-employee-portal-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo "Admin panel service status:"
aws ecs describe-services --cluster $CLUSTER_NAME --services linton-admin-panel-service --region $REGION --query 'services[0].{status:status,runningCount:runningCount,desiredCount:desiredCount}' --output json

echo ""
echo "🎉 Complete setup finished!"
echo "Access URLs:"
echo "Backend: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "Client Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000"
echo "Employee Portal: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001"
echo "Admin Panel: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002" 