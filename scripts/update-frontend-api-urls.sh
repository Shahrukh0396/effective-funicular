#!/bin/bash

# Update Frontend API URLs
# This script updates the frontend applications to use the correct API endpoints

set -e

echo "🔧 Updating frontend API URLs..."

# Get ALB DNS
ALB_DNS="linton-staging-alb-2029187797.us-east-2.elb.amazonaws.com"
API_URL="http://${ALB_DNS}"

echo "📡 Using API URL: ${API_URL}"

# Update employee portal axios configuration
echo "🔄 Updating employee portal axios configuration..."
cat > packages/employee-portal/src/config/axios.js << 'EOF'
import axios from 'axios'
import { config } from './index.js'

// Create axios instance with environment variable
const instance = axios.create({
  baseURL: config.apiUrl, // Use environment variable instead of hardcoded localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employee_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('employee_token')
      localStorage.removeItem('employee_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
EOF

# Update admin panel axios configuration
echo "🔄 Updating admin panel axios configuration..."
cat > packages/admin-panel/src/config/axios.js << 'EOF'
import axios from 'axios'
import { config } from './index.js'

// Set base URL for API calls - use environment variable
axios.defaults.baseURL = config.apiUrl

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axios
EOF

# Update environment variables for all portals
echo "🔄 Updating environment variables..."

# Employee portal environment
cat > packages/employee-portal/.env.production << EOF
VITE_API_URL=${API_URL}
EOF

# Admin panel environment
cat > packages/admin-panel/.env.production << EOF
VITE_API_URL=${API_URL}
EOF

# Client portal environment
cat > packages/client-portal/.env.production << EOF
VITE_API_URL=${API_URL}
EOF

echo ""
echo "✅ Frontend API URLs updated successfully!"
echo ""
echo "📋 Updated configurations:"
echo "  Employee Portal: ${API_URL}"
echo "  Admin Panel: ${API_URL}"
echo "  Client Portal: ${API_URL}"
echo ""
echo "🔧 Next steps:"
echo "  1. Rebuild and redeploy the frontend applications"
echo "  2. Test authentication endpoints"
echo "  3. Verify all portals are working correctly" 