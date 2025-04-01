"use client";

import { useUser } from "../UserContext";

// Define permission types
export type Permission = 
  // Organization permissions
  | 'org:create' 
  | 'org:view' 
  | 'org:edit' 
  | 'org:delete'
  // Member permissions
  | 'member:create' 
  | 'member:view' 
  | 'member:edit' 
  | 'member:delete'
  // Announcement permissions  
  | 'announcement:create' 
  | 'announcement:view' 
  | 'announcement:edit' 
  | 'announcement:delete'
  // Settings permissions
  | 'settings:view'
  | 'settings:edit'
  | 'settings:billing';

// Define role types
export type Role = 'owner' | 'admin' | 'manager' | 'staff' | 'guest';

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    'org:create', 'org:view', 'org:edit', 'org:delete',
    'member:create', 'member:view', 'member:edit', 'member:delete',
    'announcement:create', 'announcement:view', 'announcement:edit', 'announcement:delete',
    'settings:view', 'settings:edit', 'settings:billing'
  ],
  admin: [
    'org:view', 'org:edit',
    'member:create', 'member:view', 'member:edit', 'member:delete',
    'announcement:create', 'announcement:view', 'announcement:edit', 'announcement:delete',
    'settings:view', 'settings:edit'
  ],
  manager: [
    'org:view',
    'member:create', 'member:view', 'member:edit',
    'announcement:create', 'announcement:view', 'announcement:edit',
    'settings:view'
  ],
  staff: [
    'org:view',
    'member:view',
    'announcement:view',
    'settings:view'
  ],
  guest: [
    'org:view',
    'announcement:view'
  ]
};

/**
 * Check if the given role has the specified permission
 */
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role || !permission) return false;
  
  try {
    return rolePermissions[role]?.includes(permission) || false;
  } catch (error) {
    console.error(`Error checking permission ${permission} for role ${role}:`, error);
    return false;
  }
}

/**
 * Check if the given role has all of the specified permissions
 */
export function hasAllPermissions(role: Role | undefined, permissions: Permission[]): boolean {
  if (!role || !permissions || !Array.isArray(permissions) || permissions.length === 0) return false;
  
  try {
    return permissions.every(permission => rolePermissions[role]?.includes(permission) || false);
  } catch (error) {
    console.error(`Error checking all permissions for role ${role}:`, error);
    return false;
  }
}

/**
 * Check if the given role has any of the specified permissions
 */
export function hasAnyPermission(role: Role | undefined, permissions: Permission[]): boolean {
  if (!role || !permissions || !Array.isArray(permissions) || permissions.length === 0) return false;
  
  try {
    return permissions.some(permission => rolePermissions[role]?.includes(permission) || false);
  } catch (error) {
    console.error(`Error checking any permissions for role ${role}:`, error);
    return false;
  }
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  if (!role || typeof role !== 'string' || !Object.keys(rolePermissions).includes(role)) {
    console.warn(`Invalid role provided: ${role}`);
    return [];
  }
  
  try {
    return [...rolePermissions[role]];
  } catch (error) {
    console.error(`Error getting permissions for role ${role}:`, error);
    return [];
  }
}

/**
 * React hook to check if the current user has a specific permission
 * Note: This is deprecated in favor of the hooks in hooks.ts
 */
export function useHasPermission(permission: Permission): boolean {
  const { userProfile } = useUser();
  return hasPermission(userProfile?.role, permission);
}

/**
 * React hook to check if the current user has all specified permissions
 * Note: This is deprecated in favor of the hooks in hooks.ts
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { userProfile } = useUser();
  return hasAllPermissions(userProfile?.role, permissions);
}

/**
 * React hook to check if the current user has any of the specified permissions
 * Note: This is deprecated in favor of the hooks in hooks.ts
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { userProfile } = useUser();
  return hasAnyPermission(userProfile?.role, permissions);
} 