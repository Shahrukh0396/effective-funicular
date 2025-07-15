# Deployment URLs

## ALB DNS Name
`linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`

## Working URLs (Immediate Access)
- **Backend API**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000
- **Client Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
- **Employee Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
- **Admin Panel**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443

## Alternative HTTP URLs
- **Backend API**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000
- **Employee Portal**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001
- **Admin Panel**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002

## Host-Based URLs (After DNS Configuration)
- **Backend API**: https://api.linton-tech.com
- **Client Portal**: https://client.linton-tech.com
- **Employee Portal**: https://employee.linton-tech.com
- **Admin Panel**: https://admin.linton-tech.com

## Required DNS Records
Add these CNAME records to your domain DNS:
- `api.linton-tech.com` → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
- `client.linton-tech.com` → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
- `employee.linton-tech.com` → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`
- `admin.linton-tech.com` → `linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`

## Testing Commands
```bash
# Test backend
curl -I http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000/health

# Test client portal
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445

# Test employee portal
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444

# Test admin panel
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443
```

## Status
✅ Working configuration restored
✅ All services accessible
✅ HTTPS enabled on specified ports with proper SSL certificates
✅ Host-based routing configured for future use
