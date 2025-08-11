# Domain Structure and Test Data Guide

## Overview
This guide explains the correct domain structure for the multi-tenant system and how to set up proper test data for realistic scenarios.

## 🏗️ Domain Structure

### Platform Owner (Linton Tech LLC)
- **Domain**: `linton-tech`
- **Type**: `platform-owner`
- **Purpose**: Owns and operates the platform
- **Users**: Super admins, platform administrators

### White-Label Clients (Service Companies)
- **Domain**: `acmecorp` (example)
- **Type**: `white-label-client`
- **Purpose**: Service companies using the platform for their clients
- **Users**: Vendor admins, employees, clients

### Linton-Tech Clients (Direct Clients)
- **Domain**: `linton-tech`
- **Type**: `linton-tech-client`
- **Purpose**: Direct clients of Linton Tech LLC
- **Users**: Clients, Linton Tech employees

## 📋 Test Data Structure

### Acme Corp Scenario (White-Label Client)

#### Vendor: Acme Corp
- **Domain**: `acmecorp`
- **Type**: `white-label-client`
- **Email**: `admin@acmecorp.com`
- **Description**: Digital agency using the platform for their clients

#### Users:
1. **Admin**: `admin@acmecorp.com` (password: `TestPass123!`)
   - Role: `vendor_admin`
   - Company: Acme Corp
   - Can: Manage all projects, create projects, assign employees

2. **Employee 1**: `alex.chen@acmecorp.com` (password: `TestPass123!`)
   - Role: `employee`
   - Company: Acme Corp
   - Position: Senior Developer
   - Can: View assigned projects only

3. **Employee 2**: `sarah.johnson@acmecorp.com` (password: `TestPass123!`)
   - Role: `employee`
   - Company: Acme Corp
   - Position: UI/UX Designer
   - Can: View assigned projects only

4. **Client**: `hunter.kaufman@hkapplications.com` (password: `TestPass123!`)
   - Role: `client`
   - Company: HK Applications LLC
   - Can: View own projects only

#### Projects:
1. **Website Redesign**
   - Client: Hunter Kaufman (HK Applications LLC)
   - Assigned: Alex Chen (developer)
   - Status: Active

2. **Mobile App Development**
   - Client: Hunter Kaufman (HK Applications LLC)
   - Assigned: Sarah Johnson (designer)
   - Status: Planning

3. **E-commerce Platform**
   - Client: Hunter Kaufman (HK Applications LLC)
   - Assigned: Both Alex Chen and Sarah Johnson
   - Status: Active

## 🔧 Setup Instructions

### 1. Run the Setup Script
```bash
cd packages/backend
node scripts/setup-acme-corp-test-data.js
```

### 2. Verify the Setup
```bash
# Test employee project access
node scripts/test-employee-project-access.js
```

### 3. Expected Results

#### Alex Chen Access:
- ✅ Can see: Website Redesign, E-commerce Platform
- ❌ Cannot see: Mobile App Development (not assigned)

#### Sarah Johnson Access:
- ✅ Can see: Mobile App Development, E-commerce Platform
- ❌ Cannot see: Website Redesign (not assigned)

#### Hunter Kaufman Access:
- ✅ Can see: All 3 projects (they're his projects)

#### Admin Access:
- ✅ Can see: All 3 projects (admin can see everything)

## 🌐 URL Structure

### Development Environment
```
Acme Corp Admin Portal: http://localhost:3000/admin
Acme Corp Employee Portal: http://localhost:3001/employee
Acme Corp Client Portal: http://localhost:3002/client
```

### Production Environment (Example)
```
Acme Corp Admin Portal: https://admin.acmecorp.com
Acme Corp Employee Portal: https://employee.acmecorp.com
Acme Corp Client Portal: https://app.acmecorp.com
```

## 🔒 Access Control Rules

### Employee Access
- **Can View**: Only projects they are explicitly assigned to
- **Can Create**: ❌ No (only admins and clients can create)
- **Can Update**: Limited (only assigned projects)

### Client Access
- **Can View**: Only their own projects
- **Can Create**: ✅ Yes (for themselves only)
- **Can Update**: ❌ No (read-only for clients)

### Admin Access
- **Can View**: All projects in their vendor
- **Can Create**: ✅ Yes (for any client)
- **Can Update**: ✅ Yes (all projects)

### Super Admin Access
- **Can View**: All projects across all vendors
- **Can Create**: ✅ Yes (for any vendor)
- **Can Update**: ✅ Yes (all projects)

## 🧪 Testing Scenarios

### Scenario 1: Alex Chen Login
```bash
# Login as Alex Chen
POST /api/auth/login
{
  "email": "alex.chen@acmecorp.com",
  "password": "TestPass123!"
}

# Get projects (should only see assigned ones)
GET /api/projects
# Expected: Website Redesign, E-commerce Platform
```

### Scenario 2: Sarah Johnson Login
```bash
# Login as Sarah Johnson
POST /api/auth/login
{
  "email": "sarah.johnson@acmecorp.com",
  "password": "TestPass123!"
}

# Get projects (should only see assigned ones)
GET /api/projects
# Expected: Mobile App Development, E-commerce Platform
```

### Scenario 3: Hunter Kaufman Login
```bash
# Login as Hunter Kaufman
POST /api/auth/login
{
  "email": "hunter.kaufman@hkapplications.com",
  "password": "TestPass123!"
}

# Get projects (should see all his projects)
GET /api/projects
# Expected: All 3 projects (they're his)
```

### Scenario 4: Admin Login
```bash
# Login as Admin
POST /api/auth/login
{
  "email": "admin@acmecorp.com",
  "password": "TestPass123!"
}

# Get projects (should see all projects)
GET /api/projects
# Expected: All 3 projects
```

## 🚨 Common Issues

### Issue 1: Wrong Domain Structure
**Problem**: Users with `@acmecorp.com` emails in wrong vendor
**Solution**: Ensure all Acme Corp users have `vendorId` pointing to Acme Corp vendor

### Issue 2: Client Access Issues
**Problem**: Client can't see their projects
**Solution**: Check that `clientId` field in projects matches the client's user ID

### Issue 3: Employee Access Issues
**Problem**: Employee can see projects they're not assigned to
**Solution**: Verify the access control logic in `projectController.js`

### Issue 4: Cross-Vendor Access
**Problem**: Users can see projects from other vendors
**Solution**: Ensure `vendorId` filtering is working correctly

## 📊 Database Queries

### Check Vendor Structure
```javascript
// Find Acme Corp vendor
db.vendors.findOne({ domain: "acmecorp" })

// Find all Acme Corp users
db.users.find({ vendorId: ObjectId("acme_corp_vendor_id") })

// Find all Acme Corp projects
db.projects.find({ vendorId: ObjectId("acme_corp_vendor_id") })
```

### Check User Assignments
```javascript
// Find projects assigned to Alex Chen
db.projects.find({
  vendorId: ObjectId("acme_corp_vendor_id"),
  $or: [
    { "team.projectManager": ObjectId("alex_chen_user_id") },
    { "team.members.user": ObjectId("alex_chen_user_id") }
  ]
})
```

## 🎯 Key Points

1. **Domain Separation**: Each vendor has its own domain
2. **User Isolation**: Users can only access their vendor's data
3. **Project Assignment**: Employees only see projects they're assigned to
4. **Client Ownership**: Clients only see their own projects
5. **Admin Oversight**: Admins can see all projects in their vendor
6. **Multi-Tenant Security**: No cross-vendor data leakage 