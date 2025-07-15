# DNS Update Guide

## Current Issue
Your SSL certificates are domain-specific, but the ALB is using a single certificate for all subdomains.

## Solution Options

### Option 1: Use Port-Specific URLs (Recommended)
Update your DNS to point to specific ports that match the certificates:

- **api.linton-tech.com** → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:8446`
- **app.linton-tech.com** → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:8443`
- **employee.linton-tech.com** → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:8444`
- **admin.linton-tech.com** → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443`

### Option 2: Create Wildcard Certificate
Create a wildcard certificate for `*.linton-tech.com` in AWS Certificate Manager.

### Option 3: Use Current Setup
The current setup works but shows certificate warnings. You can proceed with:
- https://api.linton-tech.com:8446
- https://app.linton-tech.com:8443
- https://employee.linton-tech.com:8444
- https://admin.linton-tech.com

## Testing URLs
```bash
# Test with port-specific URLs
curl -I https://api.linton-tech.com:8446/health
curl -I https://app.linton-tech.com:8443
curl -I https://employee.linton-tech.com:8444
curl -I https://admin.linton-tech.com
```
