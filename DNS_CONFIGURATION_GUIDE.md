# DNS Configuration Guide

## Overview
Your AWS Application Load Balancer (ALB) is now configured with host-based routing on port 443 (HTTPS) with proper SSL certificates for each subdomain.

## ALB Information
- **ALB DNS Name**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
- **ALB ARN**: `arn:aws:elasticloadbalancing:us-east-2:944871470938:loadbalancer/app/linton-staging-alb/b2fd8ec449df90f1`

## Current Configuration

### Listeners
- **Port 80**: HTTP (redirects to HTTPS)
- **Port 443**: HTTPS with host-based routing
- **Port 3002**: HTTP (for direct access)

### Host-Based Routing Rules
1. **app.linton-tech.com** → Client Portal
2. **admin.linton-tech.com** → Admin Panel
3. **employee.linton-tech.com** → Employee Portal
4. **api.linton-tech.com** → Backend API

### SSL Certificates
- **Port 443**: `*.linton-tech.com` (wildcard certificate)

## DNS Configuration Required

You need to create CNAME records in your DNS provider (GoDaddy, Route53, etc.) pointing each subdomain to the ALB:

### CNAME Records
```
app.linton-tech.com     → linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com
admin.linton-tech.com   → linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com
employee.linton-tech.com → linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com
api.linton-tech.com     → linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com
```

## How to Configure DNS

### GoDaddy DNS Configuration
1. Log into your GoDaddy account
2. Go to your domain management
3. Click on "DNS" for linton-tech.com
4. Add CNAME records:
   - **Name**: `app` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
   - **Name**: `admin` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
   - **Name**: `employee` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
   - **Name**: `api` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`

### AWS Route53 Configuration
1. Go to Route53 console
2. Select your hosted zone for linton-tech.com
3. Create CNAME records:
   - **Record name**: `app` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
   - **Record name**: `admin` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
   - **Record name**: `employee` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
   - **Record name**: `api` → **Value**: `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`

## Testing Your Configuration

Once DNS is configured, you can test the URLs:

- **Client Portal**: https://app.linton-tech.com
- **Admin Panel**: https://admin.linton-tech.com
- **Employee Portal**: https://employee.linton-tech.com
- **API**: https://api.linton-tech.com

## Troubleshooting

### SSL Certificate Errors
If you see SSL certificate errors:
1. Ensure DNS propagation is complete (can take up to 48 hours)
2. Verify the CNAME records are pointing to the correct ALB DNS name
3. Check that the SSL certificate covers your domain

### Connection Issues
If you can't connect:
1. Verify the ALB security groups allow traffic on ports 80 and 443
2. Check that your ECS services are running and healthy
3. Ensure the target groups have healthy targets

### DNS Propagation
DNS changes can take time to propagate:
- **TTL**: Check your DNS provider's TTL settings
- **Cache**: Clear your browser cache and try again
- **Testing**: Use tools like `nslookup` or `dig` to verify DNS resolution

## Security Notes

- All traffic is redirected from HTTP to HTTPS
- SSL certificates are properly configured for each subdomain
- Host-based routing ensures traffic goes to the correct service
- Security groups are configured to allow only necessary traffic

## Next Steps

1. Configure DNS records as shown above
2. Wait for DNS propagation (usually 15 minutes to 48 hours)
3. Test each subdomain URL
4. Monitor your application logs for any issues
5. Set up monitoring and alerting for your services 