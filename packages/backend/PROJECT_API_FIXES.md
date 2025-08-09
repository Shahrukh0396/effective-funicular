# Project API Fixes - Vendor Client and Admin Access Control

## Overview
Fixed the projects API to ensure that only vendor clients and vendor admins can create projects, while employees are restricted from project creation.

## Changes Made

### 1. Authorization Updates

#### Route Level (`packages/backend/src/routes/projectRoutes.js`)
- **POST /api/projects**: Updated authorization to only allow `['admin', 'super_admin', 'client']`
- **Removed**: `'employee'` from the authorized roles list
- **Result**: Employees can no longer create projects

#### Controller Level (`packages/backend/src/controllers/projectController.js`)
- **Updated**: Role validation in `createProject` function
- **Before**: `['admin', 'employee', 'client', 'super_admin']`
- **After**: `['admin', 'client', 'super_admin']`
- **Added**: Client validation to ensure clients can only create projects for themselves

### 2. Required Fields Validation

#### Project Model Requirements
The Project model requires these fields:
- `type` (enum: web_development, mobile_app, consulting, design, marketing, ecommerce, saas_development, maintenance, support, training, other)
- `budget.estimated` (number, min: 0)
- `timeline.startDate` (date)
- `timeline.endDate` (date)

#### Route Validation Updates
- **Added**: Validation for `type` field
- **Added**: Validation for `budget.estimated`, `budget.currency`, `budget.billingType`, `budget.hourlyRate`
- **Added**: Validation for `timeline.startDate`, `timeline.endDate`, `timeline.estimatedHours`
- **Added**: Validation for `priority` field

### 3. Controller Logic Updates

#### Project Creation (`createProject`)
- **Fixed**: Field mapping to match Project model structure
- **Added**: Proper budget object structure
- **Added**: Proper timeline object structure
- **Added**: Client validation for vendor clients
- **Updated**: Populate calls to use correct field names

#### Project Updates (`updateProject`)
- **Updated**: Allowed fields list to include new structure
- **Fixed**: Populate calls to use `clientId` instead of `client`
- **Added**: Support for `type`, `priority`, `budget`, `timeline` updates

### 4. API Documentation Updates

#### Swagger Documentation
- **Updated**: POST /api/projects request body schema
- **Added**: Required fields documentation
- **Updated**: PUT /api/projects request body schema
- **Added**: New field structure documentation

## Access Control Summary

### ✅ Allowed to Create Projects
1. **Vendor Admins** (`role: 'admin'`) - Can create projects for any client in their vendor
2. **Vendor Clients** (`role: 'client'`) - Can only create projects for themselves
3. **Super Admins** (`role: 'super_admin'`) - Can create projects across all vendors

### ❌ Not Allowed to Create Projects
1. **Employees** (`role: 'employee'`) - Cannot create projects (restricted)

## Testing

A test script has been created at `packages/backend/scripts/test-project-creation.js` to verify:
- Vendor admins can create projects
- Vendor clients can create projects (for themselves only)
- Employees are blocked from creating projects
- Super admins can create projects
- Missing required fields are properly rejected

## API Usage Examples

### Creating a Project (Vendor Admin/Client)
```json
POST /api/projects
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website with modern UI/UX",
  "client": "507f1f77bcf86cd799439011",
  "type": "web_development",
  "status": "planning",
  "priority": "medium",
  "budget": {
    "estimated": 50000,
    "currency": "USD",
    "billingType": "fixed",
    "hourlyRate": 150
  },
  "timeline": {
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "estimatedHours": 400
  },
  "team": []
}
```

### Required Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Security Improvements

1. **Role-Based Access Control**: Strict enforcement of who can create projects
2. **Client Validation**: Clients can only create projects for themselves
3. **Required Field Validation**: Ensures all necessary project data is provided
4. **Multi-Tenant Isolation**: Projects are properly associated with vendor IDs

## Migration Notes

- Existing projects will continue to work
- New project creation requires the updated field structure
- Employee users will receive 403 Forbidden when attempting to create projects
- API documentation has been updated to reflect new requirements 