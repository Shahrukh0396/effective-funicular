#!/bin/bash

# Check GitHub Secrets Configuration
# This script helps verify GitHub secrets are set correctly

echo "🔍 GitHub Secrets Configuration Check"
echo "===================================="

echo ""
echo "📋 Required GitHub Secrets:"
echo "==========================="

echo "✅ AWS Credentials:"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"

echo ""
echo "✅ Docker Hub:"
echo "  - DOCKER_USERNAME (should be: shahrukh0396)"
echo "  - DOCKER_PASSWORD"

echo ""
echo "✅ AWS Resources:"
echo "  - ECS_EXECUTION_ROLE_ARN"
echo "  - ECS_TASK_ROLE_ARN"

echo ""
echo "✅ Database:"
echo "  - MONGO_URI"

echo ""
echo "✅ JWT:"
echo "  - JWT_SECRET"

echo ""
echo "🔴 CRITICAL - Update This Secret:"
echo "=================================="
echo "  - VITE_API_URL: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo ""
echo "⚠️  This is the most important secret for fixing the authentication issue!"
echo "   The frontend apps need this to know where to find the backend API."

echo ""
echo "✅ URLs (Optional for now):"
echo "  - CLIENT_URL"
echo "  - EMPLOYEE_URL"
echo "  - ADMIN_URL"
echo "  - BACKEND_URL"

echo ""
echo "✅ Email Configuration:"
echo "  - EMAIL_HOST"
echo "  - EMAIL_PORT"
echo "  - EMAIL_USER"
echo "  - EMAIL_PASS"

echo ""
echo "✅ Stripe (Test keys for staging):"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_PUBLISHABLE_KEY"
echo "  - STRIPE_WEBHOOK_SECRET"

echo ""
echo "✅ S3:"
echo "  - AWS_S3_BUCKET"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Go to GitHub repository Settings"
echo "2. Navigate to Secrets and variables → Actions"
echo "3. Find VITE_API_URL and click Update"
echo "4. Set value to: http://linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
echo "5. Save the secret"
echo "6. Push your code to trigger deployment" 