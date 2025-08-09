# Authentication and User Role Management Guide

## ⚠️ CRITICAL: User Role Field Compatibility

### The Problem We Solved

The backend returns user data with `userType` field (e.g., 'admin', 'driver') but some frontend components were checking for `role` field. This caused authentication failures where users were logged in but Protected Routes redirected them back to login due to role mismatch.

### The Solution

We created consistent user helper functions that check both field names automatically.

## Required Usage

### ✅ ALWAYS Use These Helper Functions

```javascript
import {
  getUserRole,
  hasRole,
  isAdmin,
  isDriver,
  isSuperAdmin,
} from "../utils/userHelpers";

// ✅ CORRECT - Use helper functions
const userRole = getUserRole(user);
const canAccess = hasRole(user, ["admin", "driver"]);
const isAdminUser = isAdmin(user);

// ❌ WRONG - Direct field access
const userRole = user.role; // Will fail if backend uses userType
const userRole = user.userType; // Will fail if backend uses role
```

### Available Helper Functions

#### `getUserRole(user)`

Returns the user's role, checking both `role` and `userType` fields.

```javascript
const role = getUserRole(user); // Returns 'admin', 'driver', 'super_admin', etc.
```

#### `hasRole(user, allowedRoles)`

Checks if user has any of the specified roles.

```javascript
const canAccess = hasRole(user, "admin");
const canAccess = hasRole(user, ["admin", "super_admin"]);
```

#### `isAdmin(user)`

Checks if user is any type of admin.

```javascript
if (isAdmin(user)) {
  // Show admin features
}
```

#### `isDriver(user)`

Checks if user is a driver.

```javascript
if (isDriver(user)) {
  // Show driver features
}
```

#### `isSuperAdmin(user)`

Checks if user is a super admin.

```javascript
if (isSuperAdmin(user)) {
  // Show super admin features
}
```

## Protected Routes

### ✅ CORRECT Usage

```javascript
// App.jsx
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

<Route path="/driver" element={
  <ProtectedRoute allowedRoles={['driver']}>
    <DriverDashboard />
  </ProtectedRoute>
} />
```

### Component Role Checks

#### ✅ CORRECT - Using Helper Functions

```javascript
import { isAdmin, isSuperAdmin, hasRole } from "../utils/userHelpers";

const MyComponent = () => {
  const { user } = useAuth();

  // ✅ CORRECT
  if (isAdmin(user)) {
    return <AdminPanel />;
  }

  if (isSuperAdmin(user)) {
    return <SuperAdminPanel />;
  }

  if (hasRole(user, ["admin", "manager"])) {
    return <ManagementPanel />;
  }
};
```

#### ❌ WRONG - Direct Field Access

```javascript
// ❌ WRONG - Will break if backend field name changes
if (user?.role === 'admin') { ... }
if (user?.userType === 'admin') { ... }
```

## Navigation and Conditional Rendering

### ✅ CORRECT

```javascript
import { isSuperAdmin } from "../utils/userHelpers";

const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Drivers", href: "/admin/drivers" },
  // ✅ CORRECT - Using helper function
  ...(isSuperAdmin(user)
    ? [{ name: "Admin Management", href: "/admin/admins" }]
    : []),
];
```

### ❌ WRONG

```javascript
// ❌ WRONG - Direct field access
...(user?.role === 'super_admin' ? [...] : []),
```

## Backend Compatibility

Our helper functions work with any backend that returns user data in these formats:

### Format 1 (current backend)

```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "userType": "admin"
}
```

### Format 2 (alternative backends)

```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin"
}
```

### Format 3 (both fields)

```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "userType": "admin"
}
```

## Testing Your Implementation

### Quick Test Checklist

1. ✅ Login as admin - should access admin routes
2. ✅ Login as driver - should access driver routes
3. ✅ Login as admin - should NOT access driver-only routes
4. ✅ Login as driver - should NOT access admin-only routes
5. ✅ Navigation menus show appropriate items based on role
6. ✅ No console errors about undefined roles

### Debugging Role Issues

If you see authentication issues:

1. **Check the console logs** in ProtectedRoute for role debugging
2. **Verify user object structure** in browser dev tools
3. **Ensure you're using helper functions** instead of direct field access
4. **Check that allowedRoles arrays match backend role values**

## Migration Guide

### If You Have Existing Code

1. **Find all role checks:**

   ```bash
   grep -r "user\.role\|user\.userType" src/
   ```

2. **Replace with helper functions:**

   ```javascript
   // Before
   user?.role === "admin";

   // After
   isAdmin(user);
   ```

3. **Import the helpers:**
   ```javascript
   import {
     getUserRole,
     hasRole,
     isAdmin,
     isDriver,
     isSuperAdmin,
   } from "../utils/userHelpers";
   ```

## Why This Matters

- **Prevents authentication failures** due to field name mismatches
- **Makes code more maintainable** and less prone to breaking changes
- **Provides consistent behavior** across the entire application
- **Future-proofs** against backend changes
- **Improves developer experience** with clear, semantic function names

## Remember: ALWAYS Use Helper Functions for Role Checks! 🛡️
