# Employee Project Access Control Fixes

## Overview
Fixed the project access control to ensure that employees can only view projects they are explicitly assigned to, similar to how tasks work. This prevents employees from seeing projects they are not involved in.

## Changes Made

### 1. Main Project Controller (`packages/backend/src/controllers/projectController.js`)

#### `getProjects` Function
- **Before**: Employees could see projects where they were client, team member, or project manager
- **After**: Employees can only see projects where they are explicitly assigned as project manager or team member
- **Filter Change**:
  ```javascript
  // OLD
  filter.$or = [
    { clientId: req.user._id },
    { 'team.user': req.user._id },
    { projectManager: req.user._id }
  ]
  
  // NEW
  filter.$or = [
    { 'team.projectManager': req.user._id },
    { 'team.members.user': req.user._id }
  ]
  ```

#### `getProjectById` Function
- **Enhanced**: Role-based access control with clear logic
- **Added**: Explicit checks for each user role
- **Improved**: Better error messages for access denied scenarios

### 2. Employee Routes (`packages/backend/src/routes/employeeRoutes.js`)

#### `/api/employee/projects` (GET)
- **Fixed**: Field names to match Project model structure
- **Updated**: Filter logic to only show assigned projects
- **Improved**: Response format consistency

#### `/api/employee/projects/:id` (GET)
- **Fixed**: Field names and access control
- **Updated**: Error messages to be more specific
- **Improved**: Response format consistency

#### `/api/employee/projects/:id/status` (PATCH)
- **Fixed**: Access control to only allow assigned employees
- **Updated**: Field names and error handling
- **Improved**: Response format consistency

### 3. Access Control Summary

#### ✅ **Employees Can Access Projects When**:
1. **Project Manager**: Employee is assigned as project manager (`team.projectManager`)
2. **Team Member**: Employee is assigned as team member (`team.members.user`)

#### ❌ **Employees Cannot Access Projects When**:
1. **Not Assigned**: Employee is not explicitly assigned to the project
2. **Client Only**: Employee is only the client (not assigned to team)
3. **Other Projects**: Projects they are not involved in

### 4. Role-Based Access Matrix

| Role | Can View | Can Create | Can Update | Notes |
|------|----------|------------|------------|-------|
| **Vendor Admin** | All projects in vendor | ✅ | ✅ | Full access to vendor projects |
| **Vendor Client** | Own projects only | ✅ (own only) | ❌ | Can only create/see own projects |
| **Employee** | Assigned projects only | ❌ | Limited | Can only see projects they're assigned to |
| **Super Admin** | All projects | ✅ | ✅ | Full access across all vendors |

## Testing

### Test Script: `packages/backend/scripts/test-employee-project-access.js`

The test script verifies:
1. **Alex Chen** can only see projects assigned to him
2. **Sarah Johnson** can only see projects assigned to her  
3. **Mike Davis** can only see projects assigned to him
4. **Admin** can see all projects
5. **Cross-access prevention** - employees cannot see each other's projects
6. **Employee-specific endpoints** work correctly

### Example Test Scenarios

#### Scenario 1: Alex Chen Assignment
- **Project A**: Alex is assigned as developer
- **Project B**: Alex is not assigned
- **Result**: Alex can only see Project A

#### Scenario 2: Sarah Johnson Assignment  
- **Project A**: Sarah is assigned as designer
- **Project C**: Sarah is project manager
- **Result**: Sarah can see both Project A and Project C

#### Scenario 3: Mike Davis Assignment
- **Project B**: Mike is assigned as tester
- **Project D**: Mike is not assigned
- **Result**: Mike can only see Project B

## API Usage Examples

### Get Employee's Assigned Projects
```bash
GET /api/employee/projects
Authorization: Bearer <employee_token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Website Redesign",
      "clientId": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@client.com",
        "company": "Client Corp"
      },
      "team": {
        "projectManager": {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Manager",
          "lastName": "Name",
          "email": "manager@vendor.com"
        },
        "members": [
          {
            "user": {
              "_id": "507f1f77bcf86cd799439014",
              "firstName": "Alex",
              "lastName": "Chen",
              "email": "alex.chen@vendor.com"
            },
            "role": "developer"
          }
        ]
      }
    }
  ]
}
```

### Get Specific Project (Employee)
```bash
GET /api/employee/projects/507f1f77bcf86cd799439011
Authorization: Bearer <employee_token>
```

**Response** (if employee is assigned):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "active",
    "clientId": { /* client details */ },
    "team": { /* team details */ }
  }
}
```

**Response** (if employee is not assigned):
```json
{
  "success": false,
  "message": "Project not found or access denied"
}
```

## Security Improvements

1. **Assignment-Based Access**: Employees can only see projects they are explicitly assigned to
2. **Role Separation**: Clear distinction between different user roles and their access levels
3. **Multi-Tenant Isolation**: Projects are properly filtered by vendor
4. **Consistent Error Messages**: Clear feedback when access is denied
5. **Field-Level Security**: Proper population of only necessary fields

## Migration Notes

- **Existing Projects**: Will continue to work, but employees will only see projects they are assigned to
- **Employee Access**: Employees who were previously seeing projects they weren't assigned to will now be restricted
- **Admin Access**: Admins and super admins retain full access to all projects
- **Client Access**: Clients can still see their own projects
- **API Compatibility**: All existing API endpoints remain functional with improved access control 