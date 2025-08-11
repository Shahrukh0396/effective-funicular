# Complete 5-Portal Architecture Deployment Guide

## 🏗️ Architecture Overview

This guide covers deploying the complete 5-portal multi-tenant SaaS platform:

1. **Marketing Website** - `linton-tech.com`
2. **Super Admin Panel** - `admin.linton-tech.com`
3. **Tenant Admin Portals** - `admin.{tenant}.com`
4. **Employee Portals** - `employee.{tenant}.com`
5. **Client Portals** - `app.{tenant}.com`

## 🌍 Infrastructure Stack

### Recommended AWS Stack:
- **EKS (Elastic Kubernetes Service)** - Container orchestration
- **RDS Aurora** - Multi-tenant database
- **S3 + CloudFront** - Static assets and CDN
- **Route53** - Domain management and white-label routing
- **AWS Cognito** - Authentication across portals
- **ALB (Application Load Balancer)** - Traffic routing
- **ACM (AWS Certificate Manager)** - SSL certificates

## 📋 Pre-Deployment Checklist

### 1. Domain Setup
```bash
# Primary domains
linton-tech.com
admin.linton-tech.com

# White-label domains (examples)
acme-corp.com
admin.acme-corp.com
employee.acme-corp.com
app.acme-corp.com
```

### 2. AWS Account Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### 3. Required Tools
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

## 🚀 Step-by-Step Deployment

### Step 1: Create EKS Cluster

```bash
# Create cluster configuration
cat > cluster-config.yaml << EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: linton-tech-cluster
  region: us-west-2

nodeGroups:
  - name: standard-workers
    instanceType: m5.large
    desiredCapacity: 3
    minSize: 1
    maxSize: 10
    volumeSize: 50
    ssh:
      allow: false
    iam:
      withAddonPolicies:
        autoScaler: true
        albIngress: true

addons:
  - name: vpc-cni
    version: latest
  - name: coredns
    version: latest
  - name: kube-proxy
    version: latest
EOF

# Create the cluster
eksctl create cluster -f cluster-config.yaml
```

### Step 2: Setup Database

```bash
# Create RDS Aurora cluster
aws rds create-db-cluster \
  --db-cluster-identifier linton-tech-db \
  --engine aurora-postgresql \
  --engine-version 13.7 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --db-cluster-parameter-group-name default.aurora-postgresql13 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name default

# Create database instance
aws rds create-db-instance \
  --db-instance-identifier linton-tech-db-1 \
  --db-cluster-identifier linton-tech-db \
  --engine aurora-postgresql \
  --db-instance-class db.r5.large
```

### Step 3: Setup S3 and CloudFront

```bash
# Create S3 bucket for assets
aws s3 mb s3://linton-tech-assets

# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Step 4: Setup Route53 and SSL

```bash
# Create hosted zones for each domain
aws route53 create-hosted-zone --name linton-tech.com --caller-reference $(date +%s)

# Request SSL certificates
aws acm request-certificate \
  --domain-names "*.linton-tech.com" \
  --validation-method DNS
```

### Step 5: Deploy Applications

#### 5.1 Create Kubernetes Namespaces

```bash
kubectl create namespace backend
kubectl create namespace super-admin
kubectl create namespace marketing
kubectl create namespace tenant-admin
kubectl create namespace employee-portal
kubectl create namespace client-portal
```

#### 5.2 Deploy Backend API

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      containers:
      - name: backend-api
        image: linton-tech/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: backend
spec:
  selector:
    app: backend-api
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### 5.3 Deploy Frontend Applications

```yaml
# super-admin-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: super-admin
  namespace: super-admin
spec:
  replicas: 2
  selector:
    matchLabels:
      app: super-admin
  template:
    metadata:
      labels:
        app: super-admin
    spec:
      containers:
      - name: super-admin
        image: linton-tech/super-admin:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_API_URL
          value: "https://api.linton-tech.com"
---
apiVersion: v1
kind: Service
metadata:
  name: super-admin-service
  namespace: super-admin
spec:
  selector:
    app: super-admin
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### Step 6: Setup Ingress and Load Balancer

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: linton-tech-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-west-2:123456789012:certificate/xxxxx
spec:
  rules:
  - host: linton-tech.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: marketing-service
            port:
              number: 80
  - host: admin.linton-tech.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: super-admin-service
            port:
              number: 80
  - host: api.linton-tech.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
```

### Step 7: White-Label Domain Routing

```yaml
# white-label-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: white-label-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-west-2:123456789012:certificate/xxxxx
spec:
  rules:
  - host: "*.acme-corp.com"
    http:
      paths:
      - path: /admin
        pathType: Prefix
        backend:
          service:
            name: tenant-admin-service
            port:
              number: 80
      - path: /employee
        pathType: Prefix
        backend:
          service:
            name: employee-portal-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: client-portal-service
            port:
              number: 80
```

## 🔐 Security Configuration

### 1. Network Security

```bash
# Create security groups
aws ec2 create-security-group \
  --group-name linton-tech-alb-sg \
  --description "ALB Security Group"

aws ec2 create-security-group \
  --group-name linton-tech-eks-sg \
  --description "EKS Security Group"

# Configure security group rules
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 2. Secrets Management

```bash
# Create Kubernetes secrets
kubectl create secret generic db-secret \
  --from-literal=url="postgresql://admin:password@linton-tech-db.cluster-xxxxx.us-west-2.rds.amazonaws.com:5432/linton_tech" \
  --namespace backend

kubectl create secret generic jwt-secret \
  --from-literal=secret="your-super-secure-jwt-secret-key" \
  --namespace backend
```

### 3. IAM Roles and Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::linton-tech-assets/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBClusters",
        "rds:DescribeDBInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

## 📊 Monitoring and Logging

### 1. CloudWatch Setup

```bash
# Create CloudWatch log groups
aws logs create-log-group --log-group-name /aws/eks/linton-tech-cluster/application
aws logs create-log-group --log-group-name /aws/eks/linton-tech-cluster/system
```

### 2. Prometheus and Grafana

```yaml
# monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to EKS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-west-2
    
    - name: Update kubeconfig
      run: aws eks update-kubeconfig --name linton-tech-cluster --region us-west-2
    
    - name: Deploy to EKS
      run: |
        kubectl set image deployment/backend-api backend-api=linton-tech/backend:${{ github.sha }} -n backend
        kubectl set image deployment/super-admin super-admin=linton-tech/super-admin:${{ github.sha }} -n super-admin
        kubectl set image deployment/marketing marketing=linton-tech/marketing:${{ github.sha }} -n marketing
```

## 🌍 Multi-Region Deployment

### 1. Primary Region (us-west-2)
- EKS cluster
- RDS Aurora
- S3 bucket
- CloudFront distribution

### 2. Secondary Region (us-east-1)
- Read replica for RDS
- S3 bucket for disaster recovery
- Route53 failover configuration

### 3. Global Configuration

```bash
# Create global Route53 configuration
aws route53 create-traffic-policy \
  --name "Linton-Tech-Global" \
  --document file://traffic-policy.json
```

## 📈 Scaling Configuration

### 1. Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-api-hpa
  namespace: backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 2. Cluster Autoscaler

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      containers:
      - name: cluster-autoscaler
        image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.20.0
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/linton-tech-cluster
        - --balance-similar-node-groups
        - --skip-nodes-with-system-pods=false
```

## 🚨 Disaster Recovery

### 1. Backup Strategy

```bash
# Database backups
aws rds create-db-snapshot \
  --db-instance-identifier linton-tech-db-1 \
  --db-snapshot-identifier linton-tech-backup-$(date +%Y%m%d)

# S3 bucket replication
aws s3api put-bucket-replication \
  --bucket linton-tech-assets \
  --replication-configuration file://replication-config.json
```

### 2. Recovery Procedures

```bash
# Restore database from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier linton-tech-db-recovery \
  --db-snapshot-identifier linton-tech-backup-20240101

# Restore applications
kubectl apply -f k8s/backup/
```

## 📊 Performance Optimization

### 1. CDN Configuration

```json
{
  "DistributionConfig": {
    "Origins": {
      "Items": [
        {
          "Id": "S3-linton-tech-assets",
          "DomainName": "linton-tech-assets.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ]
    },
    "CacheBehaviors": {
      "Items": [
        {
          "PathPattern": "/*",
          "TargetOriginId": "S3-linton-tech-assets",
          "ViewerProtocolPolicy": "redirect-to-https",
          "Compress": true,
          "MinTTL": 0,
          "DefaultTTL": 86400,
          "MaxTTL": 31536000
        }
      ]
    }
  }
}
```

### 2. Database Optimization

```sql
-- Create indexes for multi-tenant queries
CREATE INDEX idx_users_vendor_id ON users(vendor_id);
CREATE INDEX idx_projects_vendor_id ON projects(vendor_id);
CREATE INDEX idx_tasks_vendor_id ON tasks(vendor_id);

-- Partition tables by vendor_id for large datasets
CREATE TABLE projects_partitioned (
  LIKE projects INCLUDING ALL
) PARTITION BY HASH (vendor_id);
```

## 🎯 Success Metrics

### Technical Metrics:
- 99.9% uptime across all portals
- < 200ms API response time
- Zero data breaches
- Complete tenant isolation

### Business Metrics:
- Number of white-label tenants
- Revenue per tenant
- Client acquisition rate
- Customer satisfaction scores

## 📞 Support and Maintenance

### 1. Monitoring Alerts

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: linton-tech-alerts
  namespace: monitoring
spec:
  groups:
  - name: linton-tech.rules
    rules:
    - alert: HighCPUUsage
      expr: container_cpu_usage_seconds_total > 0.8
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: High CPU usage detected
```

### 2. Maintenance Windows

```bash
# Schedule maintenance windows
kubectl create cronjob maintenance-window \
  --image=busybox \
  --schedule="0 2 * * 0" \
  --restart=OnFailure \
  -- /bin/sh -c "echo 'Maintenance window started'"
```

This deployment guide provides a complete roadmap for deploying your 5-portal multi-tenant SaaS platform with enterprise-grade reliability, security, and scalability. 