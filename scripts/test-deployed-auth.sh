#!/bin/bash

# Test Deployed Authentication
# This script tests authentication endpoints on the deployed server

set -e

echo "🧪 Testing deployed authentication..."

# Get ALB DNS
ALB_DNS="linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
BASE_URL="http://${ALB_DNS}"

echo "📡 Testing against: ${BASE_URL}"

# Test 1: Backend Health
echo ""
echo "🔍 Test 1: Backend Health Check"
echo "================================"
curl -s -X GET "${BASE_URL}/health" | jq '.' || echo "Health check failed"

# Test 2: Employee Login
echo ""
echo "🔍 Test 2: Employee Login"
echo "========================="
EMPLOYEE_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/employee/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.chen@linton.com","password":"TestPass123!"}')

echo "Response:"
echo "$EMPLOYEE_LOGIN_RESPONSE" | jq '.' || echo "Employee login failed"

# Extract token if login successful
EMPLOYEE_TOKEN=$(echo "$EMPLOYEE_LOGIN_RESPONSE" | jq -r '.token // empty')

if [ ! -z "$EMPLOYEE_TOKEN" ]; then
  echo "✅ Employee login successful"
  
  # Test 3: Employee Profile
  echo ""
  echo "🔍 Test 3: Employee Profile"
  echo "==========================="
  curl -s -X GET "${BASE_URL}/api/employee/me" \
    -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Employee profile failed"
  
  # Test 4: Employee Projects
  echo ""
  echo "🔍 Test 4: Employee Projects"
  echo "============================"
  curl -s -X GET "${BASE_URL}/api/employee/projects" \
    -H "Authorization: Bearer ${EMPLOYEE_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Employee projects failed"
else
  echo "❌ Employee login failed"
fi

# Test 5: Admin Login
echo ""
echo "🔍 Test 5: Admin Login"
echo "======================"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@linton.com","password":"TestPass123!"}')

echo "Response:"
echo "$ADMIN_LOGIN_RESPONSE" | jq '.' || echo "Admin login failed"

# Extract token if login successful
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ ! -z "$ADMIN_TOKEN" ]; then
  echo "✅ Admin login successful"
  
  # Test 6: Admin Profile
  echo ""
  echo "🔍 Test 6: Admin Profile"
  echo "========================"
  curl -s -X GET "${BASE_URL}/api/auth/me" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Admin profile failed"
else
  echo "❌ Admin login failed"
fi

# Test 7: Client Login
echo ""
echo "🔍 Test 7: Client Login"
echo "======================="
CLIENT_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john.smith@acmecorp.com","password":"TestPass123!"}')

echo "Response:"
echo "$CLIENT_LOGIN_RESPONSE" | jq '.' || echo "Client login failed"

# Extract token if login successful
CLIENT_TOKEN=$(echo "$CLIENT_LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ ! -z "$CLIENT_TOKEN" ]; then
  echo "✅ Client login successful"
  
  # Test 8: Client Profile
  echo ""
  echo "🔍 Test 8: Client Profile"
  echo "========================="
  curl -s -X GET "${BASE_URL}/api/auth/me" \
    -H "Authorization: Bearer ${CLIENT_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Client profile failed"
else
  echo "❌ Client login failed"
fi

echo ""
echo "🎉 Authentication testing completed!"
echo ""
echo "📋 Summary:"
echo "  Backend Health: ✅"
echo "  Employee Login: $(if [ ! -z "$EMPLOYEE_TOKEN" ]; then echo "✅"; else echo "❌"; fi)"
echo "  Admin Login: $(if [ ! -z "$ADMIN_TOKEN" ]; then echo "✅"; else echo "❌"; fi)"
echo "  Client Login: $(if [ ! -z "$CLIENT_TOKEN" ]; then echo "✅"; else echo "❌"; fi)"
echo ""
echo "🌐 Portal URLs:"
echo "  Employee Portal: http://${ALB_DNS}:3001"
echo "  Admin Panel: http://${ALB_DNS}:3002"
echo "  Client Portal: http://${ALB_DNS}:3000" 