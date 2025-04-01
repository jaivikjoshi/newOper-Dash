"use client";

import { useCallback } from 'react';
import { useUser } from '@/app/utils/UserContext';
import { Permission, getPermissionsForRole } from './rbac';

/**
 * Custom hook to check if the current user has a specific permission
 * @param permission The permission to check
 * @returns boolean indicating if the user has the permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { userProfile } = useUser();
  
  // If no user or no role, no permissions
  if (!userProfile || !userProfile.role) {
    return false;
  }
  
  try {
    // Get permissions for the user's role
    const userPermissions = getPermissionsForRole(userProfile.role);
    
    // Check if the required permission is in the user's permissions
    return Array.isArray(userPermissions) && userPermissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Custom hook to check if the current user has any of the specified permissions
 * @param permissions Array of permissions to check
 * @returns boolean indicating if the user has any of the permissions
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { userProfile } = useUser();
  
  // If no user or no role, no permissions
  if (!userProfile || !userProfile.role || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  
  try {
    // Get permissions for the user's role
    const userPermissions = getPermissionsForRole(userProfile.role);
    
    // Check if any of the required permissions are in the user's permissions
    return Array.isArray(userPermissions) && permissions.some(permission => userPermissions.includes(permission));
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Custom hook to check if the current user has all of the specified permissions
 * @param permissions Array of permissions to check
 * @returns boolean indicating if the user has all of the permissions
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { userProfile } = useUser();
  
  // If no user or no role, no permissions
  if (!userProfile || !userProfile.role || !Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  
  try {
    // Get permissions for the user's role
    const userPermissions = getPermissionsForRole(userProfile.role);
    
    // Check if all of the required permissions are in the user's permissions
    return Array.isArray(userPermissions) && permissions.every(permission => userPermissions.includes(permission));
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}

/**
 * Custom hook to get all permissions for the current user
 * @returns Array of permissions the user has
 */
export function useUserPermissions(): Permission[] {
  const { userProfile } = useUser();
  
  // If no user or no role, no permissions
  if (!userProfile || !userProfile.role) {
    return [];
  }
  
  try {
    // Get permissions for the user's role
    const userPermissions = getPermissionsForRole(userProfile.role);
    return Array.isArray(userPermissions) ? userPermissions : [];
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
} 