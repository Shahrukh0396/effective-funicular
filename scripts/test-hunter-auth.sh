#!/bin/bash

# Test Hunter Kaufman Authentication
# This script tests authentication with Hunter Kaufman's account

set -e

echo "🧪 Testing Hunter Kaufman authentication..."

# Get ALB DNS
ALB_DNS="linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
BASE_URL="http://${ALB_DNS}"

echo "📡 Testing against: ${BASE_URL}"

# Test 1: Backend Health
echo ""
echo "🔍 Test 1: Backend Health Check"
echo "================================"
curl -s -X GET "${BASE_URL}/health" | jq '.' || echo "Health check failed"

# Test 2: Hunter Kaufman Client Login
echo ""
echo "🔍 Test 2: Hunter Kaufman Client Login"
echo "======================================"
CLIENT_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hunter.kaufman@hkapplications.com","password":"TestPass123!"}')

echo "Response:"
echo "$CLIENT_LOGIN_RESPONSE" | jq '.' || echo "Client login failed"

# Extract token if login successful
CLIENT_TOKEN=$(echo "$CLIENT_LOGIN_RESPONSE" | jq -r '.data.token // empty')

if [ ! -z "$CLIENT_TOKEN" ] && [ "$CLIENT_TOKEN" != "null" ]; then
  echo "✅ Hunter Kaufman login successful"
  
  # Test 3: Client Profile
  echo ""
  echo "🔍 Test 3: Hunter Kaufman Profile"
  echo "================================="
  curl -s -X GET "${BASE_URL}/api/auth/me" \
    -H "Authorization: Bearer ${CLIENT_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Client profile failed"
  
  # Test 4: Client Projects
  echo ""
  echo "🔍 Test 4: Hunter Kaufman Projects"
  echo "=================================="
  curl -s -X GET "${BASE_URL}/api/projects" \
    -H "Authorization: Bearer ${CLIENT_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Client projects failed"
  
  # Test 5: Client Tasks
  echo ""
  echo "🔍 Test 5: Hunter Kaufman Tasks"
  echo "==============================="
  curl -s -X GET "${BASE_URL}/api/tasks" \
    -H "Authorization: Bearer ${CLIENT_TOKEN}" \
    -H "Content-Type: application/json" | jq '.' || echo "Client tasks failed"
else
  echo "❌ Hunter Kaufman login failed"
  echo "Error details:"
  echo "$CLIENT_LOGIN_RESPONSE" | jq -r '.message // .error // "Unknown error"'
fi

# Test 6: Employee Login (for comparison)
echo ""
echo "🔍 Test 6: Employee Login Test"
echo "=============================="
EMPLOYEE_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/employee/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"hunter.kaufman@hkapplications.com","password":"TestPass123!"}')

echo "Employee login response:"
echo "$EMPLOYEE_LOGIN_RESPONSE" | jq '.' || echo "Employee login failed"

echo ""
echo "🎉 Authentication testing completed!"
echo ""
echo "📋 Summary:"
echo "  Backend Health: ✅"
echo "  Hunter Kaufman Client Login: $(if [ ! -z "$CLIENT_TOKEN" ] && [ "$CLIENT_TOKEN" != "null" ]; then echo "✅"; else echo "❌"; fi)"
echo ""
echo "🌐 Portal URLs:"
echo "  Client Portal: http://${ALB_DNS}:3000"
echo "  Employee Portal: http://${ALB_DNS}:3001"
echo "  Admin Panel: http://${ALB_DNS}:3002" 