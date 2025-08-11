#!/bin/bash

echo "🚀 Setting up Complete 5-Portal Architecture"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Setting up all 5 portals..."

# 1. Super Admin Panel (Top Level - manages all tenants)
print_status "Setting up Super Admin Panel..."
cd packages/super-admin-panel
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Super Admin Panel dependencies installed"
else
    print_warning "Super Admin Panel dependencies already installed"
fi
cd ../..

# 2. Marketing Website
print_status "Setting up Marketing Website..."
cd packages/linton-tech-marketing
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Marketing Website dependencies installed"
else
    print_warning "Marketing Website dependencies already installed"
fi
cd ../..

# 3. Tenant Admin Panel (for each tenant - manages employees/clients)
print_status "Setting up Tenant Admin Panel..."
cd packages/admin-panel
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Tenant Admin Panel dependencies installed"
else
    print_warning "Tenant Admin Panel dependencies already installed"
fi
cd ../..

# 4. Employee Portal (for service delivery)
print_status "Setting up Employee Portal..."
cd packages/employee-portal
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Employee Portal dependencies installed"
else
    print_warning "Employee Portal dependencies already installed"
fi
cd ../..

# 5. Client Portal (for end-users)
print_status "Setting up Client Portal..."
cd packages/client-portal
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Client Portal dependencies installed"
else
    print_warning "Client Portal dependencies already installed"
fi
cd ../..

# 6. Backend API
print_status "Setting up Backend API..."
cd packages/backend
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Backend API dependencies installed"
else
    print_warning "Backend API dependencies already installed"
fi
cd ../..

print_success "All portal dependencies installed successfully!"

echo ""
echo "🎯 Portal Architecture Overview:"
echo "================================"
echo "1. 🌐 Marketing Website (linton-tech.com)"
echo "   - Landing page for project-based and product-based clients"
echo "   - Contact forms and demo requests"
echo ""
echo "2. 👑 Super Admin Panel (admin.linton-tech.com)"
echo "   - Oversees all tenants and white-label operations"
echo "   - Manages billing, branding, and deployments"
echo ""
echo "3. 🏢 Tenant Admin Panel (admin.{tenant}.com)"
echo "   - White-labeled admin interface for each tenant"
echo "   - Manages employees and clients"
echo ""
echo "4. 👥 Employee Portal (employee.{tenant}.com)"
echo "   - Service delivery and internal collaboration"
echo "   - Time tracking and task management"
echo ""
echo "5. 👤 Client Portal (app.{tenant}.com)"
echo "   - End-user portal for tenant clients"
echo "   - Project status and support requests"
echo ""

echo "🚀 Quick Start Commands:"
echo "========================"
echo ""
echo "# Start Backend API (required first)"
echo "cd packages/backend && npm run dev"
echo ""
echo "# Start Super Admin Panel"
echo "cd packages/super-admin-panel && npm run dev"
echo ""
echo "# Start Marketing Website"
echo "cd packages/linton-tech-marketing && npm run dev"
echo ""
echo "# Start Tenant Admin Panel"
echo "cd packages/admin-panel && npm run dev"
echo ""
echo "# Start Employee Portal"
echo "cd packages/employee-portal && npm run dev"
echo ""
echo "# Start Client Portal"
echo "cd packages/client-portal && npm run dev"
echo ""

echo "🌐 Access URLs:"
echo "==============="
echo "Backend API: http://localhost:3000"
echo "Super Admin: http://localhost:5176"
echo "Marketing: http://localhost:5177"
echo "Tenant Admin: http://localhost:5178"
echo "Employee Portal: http://localhost:5179"
echo "Client Portal: http://localhost:5180"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo "1. Start the backend API first"
echo "2. Create a super admin user in the database"
echo "3. Start the super admin panel"
echo "4. Configure white-label settings for tenants"
echo "5. Deploy to AWS EKS for production"
echo ""

print_success "Setup complete! Your 5-portal architecture is ready for development." 