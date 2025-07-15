# Final Access URLs

## HTTPS Host-Based URLs (Primary)
- **Backend API**: https://api.linton-tech.com
- **App Portal**: https://app.linton-tech.com
- **Employee Portal**: https://employee.linton-tech.com
- **Admin Panel**: https://admin.linton-tech.com

## Port-Based URLs (Fallback)
- **Backend API**: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000
- **App Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
- **Employee Portal**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
- **Admin Panel**: https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443

## Testing Commands
```bash
# Test host-based URLs
curl -I https://api.linton-tech.com/health
curl -I https://app.linton-tech.com
curl -I https://employee.linton-tech.com
curl -I https://admin.linton-tech.com

# Test port-based URLs
curl -I http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:3000/health
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:445
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:444
curl -I https://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com:443
```

## Status
✅ HTTPS host-based routing configured
✅ HTTP to HTTPS redirect enabled
✅ All subdomains working with SSL
✅ Port-based access still available as fallback
