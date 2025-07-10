# Super Accounts Implementation

## Overview

The Super Accounts functionality allows designated users to access all portals (Client, Employee, and Admin) with the same credentials. Only Super Admins can create and manage Super Accounts.

## Key Features

### 🔐 Access Control
- **Super Admins**: Can create, edit, and delete Super Accounts
- **Super Accounts**: Have full privileges across all portals
- **Security**: Cannot modify/delete the original Super Admin account
- **Role-based**: Each Super Account has a base role (client, employee, admin)

### 🌐 Portal Behavior
- **Cross-Portal Access**: Super Accounts can access all portals with same credentials
- **Portal Switcher**: Seamless navigation between different portals
- **Data Access**: Full access to all data within each portal's scope
- **Permissions**: Inherit all permissions available in each portal

### 🛡️ Security & Audit
- **Creator Tracking**: All Super Accounts track who created them
- **Creation Timestamps**: Audit trail for account creation
- **Role Validation**: Backend validates access to each portal
- **Token-based**: Uses JWT tokens for secure authentication

### 🗄️ Database Structure

#### User Model Updates
```javascript
// New fields added to User model
isSuperAccount: {
  type: Boolean,
  default: false
},
superAccountCreatedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},
superAccountCreatedAt: {
  type: Date
}

// Updated role enum
role: {
  type: String,
  enum: ['client', 'employee', 'admin', 'super_admin'],
  default: 'client'
}
```

#### Virtual Properties
```javascript
// Virtual for checking if user is a super user
userSchema.virtual('isSuperUser').get(function() {
  return this.role === 'super_admin' || this.isSuperAccount
})
```

## Implementation Details

### Backend Changes

#### 1. User Model (`packages/backend/src/models/User.js`)
- Added `isSuperAccount` flag
- Added `superAccountCreatedBy` reference
- Added `superAccountCreatedAt` timestamp
- Added `super_admin` to role enum
- Added `isSuperUser` virtual property

#### 2. Super Account Routes (`packages/backend/src/routes/superAccountRoutes.js`)
- `GET /api/super-accounts` - List all super accounts
- `POST /api/super-accounts` - Create new super account
- `GET /api/super-accounts/:id` - Get super account details
- `PUT /api/super-accounts/:id` - Update super account
- `DELETE /api/super-accounts/:id` - Delete super account
- `POST /api/super-accounts/validate-access` - Validate portal access

#### 3. Auth Middleware Updates (`packages/backend/src/middleware/auth.js`)
- Updated `authorize()` to allow Super Accounts access to all roles
- Updated `hasPermission()` to grant all permissions to Super Accounts

#### 4. App Configuration (`packages/backend/src/app.js`)
- Added super account routes to the application

### Frontend Changes

#### 1. Portal Switcher Component
- **Client Portal**: `packages/client-portal/src/components/PortalSwitcher.vue`
- **Employee Portal**: `packages/employee-portal/src/components/PortalSwitcher.vue`
- **Admin Panel**: Integrated into navigation

#### 2. Admin Panel Updates
- **Super Accounts View**: `packages/admin-panel/src/views/SuperAccounts.vue`
- **Navigation**: Added Super Accounts menu item for Super Admins
- **Router**: Added route with Super Admin protection
- **Auth Store**: Added `isSuperAdmin` computed property

#### 3. Layout Updates
- **Dashboard Layout**: Added Portal Switcher for Super Accounts
- **Navigation**: Conditional display based on user role

## Usage Guide

### Creating a Super Account

1. **Login as Super Admin** to the Admin Panel
2. **Navigate to Super Accounts** section
3. **Click "Create Super Account"**
4. **Fill in the form**:
   - First Name
   - Last Name
   - Email
   - Password (minimum 8 characters)
   - Base Role (client, employee, or admin)
   - Company (optional)
   - Position (optional)
5. **Click "Create Account"**

### Using Portal Switcher

1. **Login with Super Account** credentials to any portal
2. **Look for "Switch Portal"** button in the navigation
3. **Click the button** to see available portals
4. **Select a portal** to open it in a new tab/window
5. **Navigate seamlessly** between all portals

### Managing Super Accounts

#### Viewing Super Accounts
- Access the Super Accounts section in Admin Panel
- View all Super Accounts with their details
- See creation information and status

#### Editing Super Accounts
- Click "Edit" on any Super Account
- Modify name, company, position, or status
- Cannot change role or Super Account status

#### Deleting Super Accounts
- Click "Delete" on any Super Account
- Confirm the deletion
- Cannot delete the original Super Admin

## Security Considerations

### Access Control
- Only Super Admins can create Super Accounts
- Super Accounts cannot modify/delete Super Admin accounts
- Portal access is validated on each request
- JWT tokens maintain session security

### Data Protection
- Super Accounts have full access to all portal data
- No additional data isolation between portals
- GDPR compliance maintained across all portals
- Audit trails track Super Account creation

### Best Practices
- Change default Super Admin password after first login
- Regularly review Super Account access
- Monitor Super Account activity
- Use strong passwords for all Super Accounts

## API Endpoints

### Super Account Management
```
GET    /api/super-accounts              # List all super accounts
POST   /api/super-accounts              # Create new super account
GET    /api/super-accounts/:id          # Get super account details
PUT    /api/super-accounts/:id          # Update super account
DELETE /api/super-accounts/:id          # Delete super account
POST   /api/super-accounts/validate-access  # Validate portal access
```

### Request/Response Examples

#### Create Super Account
```javascript
POST /api/super-accounts
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "baseRole": "admin",
  "company": "Acme Corp",
  "position": "Manager"
}
```

#### Validate Portal Access
```javascript
POST /api/super-accounts/validate-access
{
  "portal": "client"
}
```

## Setup Instructions

### 1. Database Setup
The Super Accounts functionality uses the existing User model with additional fields. No separate database setup is required.

### 2. Create First Super Admin
```bash
cd packages/backend
node scripts/create-super-admin.js
```

Default Super Admin credentials:
- **Email**: superadmin@linton.com
- **Password**: SuperAdmin123!

### 3. Start All Services
```bash
# Start backend
cd packages/backend && npm start

# Start client portal
cd packages/client-portal && npm run dev

# Start employee portal
cd packages/employee-portal && npm run dev

# Start admin panel
cd packages/admin-panel && npm run dev
```

### 4. Test Super Accounts
1. Login to Admin Panel with Super Admin credentials
2. Create a Super Account
3. Login to any portal with Super Account credentials
4. Use Portal Switcher to navigate between portals

## Troubleshooting

### Common Issues

#### Portal Switcher Not Appearing
- Ensure user has Super Account privileges
- Check if `isSuperAccount` flag is set to true
- Verify user role is `super_admin` or `isSuperAccount` is true

#### Access Denied to Portals
- Check if Super Account is active
- Verify JWT token is valid
- Ensure backend validation endpoint is working

#### Cannot Create Super Account
- Verify user is logged in as Super Admin
- Check if email already exists
- Ensure all required fields are provided

### Debug Information
- Check browser console for API errors
- Verify MongoDB connection
- Review backend logs for authentication issues
- Ensure all services are running on correct ports

## Future Enhancements

### Potential Improvements
1. **Portal-specific Permissions**: Granular control over portal access
2. **Activity Logging**: Track Super Account usage across portals
3. **Time-based Access**: Temporary Super Account access
4. **Multi-factor Authentication**: Enhanced security for Super Accounts
5. **Audit Dashboard**: Visual representation of Super Account activity

### Integration Opportunities
1. **SSO Integration**: Single sign-on across all portals
2. **Role-based Views**: Customize portal interfaces based on base role
3. **Notification System**: Cross-portal notifications for Super Accounts
4. **Analytics**: Track Super Account usage patterns

## Support

For technical support or questions about the Super Accounts implementation:
1. Check the troubleshooting section above
2. Review the API documentation
3. Examine the source code in the respective packages
4. Contact the development team

---

**Note**: This implementation provides a robust foundation for cross-portal access while maintaining security and audit capabilities. Regular monitoring and maintenance of Super Accounts is recommended for optimal security. 