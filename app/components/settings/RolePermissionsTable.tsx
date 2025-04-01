"use client";

import React from 'react';
import { Role, Permission, getPermissionsForRole } from '@/app/utils/auth/rbac';
import { Check, X } from 'lucide-react';

// Group permissions by category
const permissionCategories = {
  'Organizations': [
    'org:create',
    'org:view',
    'org:edit',
    'org:delete'
  ],
  'Members': [
    'member:create',
    'member:view',
    'member:edit',
    'member:delete'
  ],
  'Announcements': [
    'announcement:create',
    'announcement:view',
    'announcement:edit',
    'announcement:delete'
  ],
  'Settings': [
    'settings:view',
    'settings:edit',
    'settings:billing'
  ]
};

// Friendly permission names
const permissionLabels: Record<Permission, string> = {
  'org:create': 'Create Organizations',
  'org:view': 'View Organizations',
  'org:edit': 'Edit Organizations',
  'org:delete': 'Delete Organizations',
  'member:create': 'Create Members',
  'member:view': 'View Members',
  'member:edit': 'Edit Members',
  'member:delete': 'Delete Members',
  'announcement:create': 'Create Announcements',
  'announcement:view': 'View Announcements',
  'announcement:edit': 'Edit Announcements',
  'announcement:delete': 'Delete Announcements',
  'settings:view': 'View Settings',
  'settings:edit': 'Edit Settings',
  'settings:billing': 'Manage Billing'
};

// Friendly role names
const roleLabels: Record<Role, string> = {
  'owner': 'Owner',
  'admin': 'Administrator',
  'manager': 'Manager',
  'staff': 'Staff',
  'guest': 'Guest'
};

interface RolePermissionsTableProps {
  selectedRole?: Role;
  onRoleSelect?: (role: Role) => void;
}

export default function RolePermissionsTable({ 
  selectedRole = 'owner',
  onRoleSelect 
}: RolePermissionsTableProps) {
  // Get all available roles
  const roles: Role[] = ['owner', 'admin', 'manager', 'staff', 'guest'];
  
  // Get permissions for each role
  const rolesWithPermissions = roles.map(role => {
    return {
      role,
      permissions: getPermissionsForRole(role)
    };
  });
  
  return (
    <div className="overflow-x-auto">
      {/* Role selector */}
      {onRoleSelect && (
        <div className="flex space-x-2 mb-6 border-b pb-4">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => onRoleSelect(role)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                selectedRole === role
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
      )}
      
      {/* Permission table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Permission
            </th>
            {selectedRole ? (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {roleLabels[selectedRole]}
              </th>
            ) : (
              roles.map(role => (
                <th 
                  key={role} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {roleLabels[role]}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(permissionCategories).map(([category, permissions]) => (
            <React.Fragment key={category}>
              {/* Category header row */}
              <tr className="bg-gray-50">
                <td 
                  colSpan={selectedRole ? 2 : roles.length + 1} 
                  className="px-6 py-3 text-sm font-semibold"
                >
                  {category}
                </td>
              </tr>
              
              {/* Permission rows */}
              {permissions.map(permission => (
                <tr key={permission} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {permissionLabels[permission as Permission]}
                  </td>
                  
                  {selectedRole ? (
                    <td className="px-6 py-3 text-sm">
                      {getPermissionsForRole(selectedRole).includes(permission as Permission) ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                  ) : (
                    roles.map(role => (
                      <td key={`${role}-${permission}`} className="px-6 py-3 text-sm">
                        {getPermissionsForRole(role).includes(permission as Permission) ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
} 