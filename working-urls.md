# Working URLs

## ALB DNS Name
`linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com`

## Port-Based URLs (Working)
- **Backend API**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000
- **App Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
- **Employee Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
- **Admin Panel**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443

## Alternative HTTP URLs
- **Backend API**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000
- **Employee Portal**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3001
- **Admin Panel**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3002

## Host-Based URLs (After DNS Configuration)
- **Backend API**: https://api.linton-tech.com
- **App Portal**: https://app.linton-tech.com
- **Employee Portal**: https://employee.linton-tech.com
- **Admin Panel**: https://admin.linton-tech.com

## Testing Commands
```bash
# Test port-based URLs
curl -I http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000/health
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443

# Test host-based URLs (if DNS is configured)
curl -I https://api.linton-tech.com/health
curl -I https://app.linton-tech.com
curl -I https://employee.linton-tech.com
curl -I https://admin.linton-tech.com
```

## Status
✅ Port-based access restored
✅ Host-based routing working
✅ All services accessible
✅ HTTPS enabled on specified ports
