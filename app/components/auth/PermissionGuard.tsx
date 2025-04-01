"use client";

import React from 'react';
import { Permission } from '@/app/utils/auth/rbac';
import { useHasPermission, useHasAllPermissions, useHasAnyPermission } from '@/app/utils/auth/hooks';

interface PermissionGuardProps {
  /**
   * Single permission required to access the content
   */
  permission?: Permission;
  
  /**
   * Multiple permissions, all required to access the content
   */
  allPermissions?: Permission[];
  
  /**
   * Multiple permissions, any one required to access the content
   */
  anyPermission?: Permission[];
  
  /**
   * What to render when the user has permission
   */
  children: React.ReactNode;
  
  /**
   * What to render when the user doesn't have permission (optional)
   */
  fallback?: React.ReactNode;
}

/**
 * Guard component that only renders its children if the user has the required permissions
 */
export default function PermissionGuard({
  permission,
  allPermissions,
  anyPermission,
  children,
  fallback = null
}: PermissionGuardProps) {
  let hasAccess = false;
  
  if (permission) {
    hasAccess = useHasPermission(permission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = useHasAllPermissions(allPermissions);
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = useHasAnyPermission(anyPermission);
  }
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

/**
 * Simple wrapper around PermissionGuard that renders its children only if the user can create entities
 */
export function CreatePermission({ 
  type, 
  children, 
  fallback = null 
}: { 
  type: 'org' | 'member' | 'announcement', 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard 
      permission={`${type}:create` as Permission} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Simple wrapper around PermissionGuard that renders its children only if the user can edit entities
 */
export function EditPermission({ 
  type, 
  children, 
  fallback = null 
}: { 
  type: 'org' | 'member' | 'announcement' | 'settings', 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard 
      permission={`${type}:edit` as Permission} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Simple wrapper around PermissionGuard that renders its children only if the user can delete entities
 */
export function DeletePermission({ 
  type, 
  children, 
  fallback = null 
}: { 
  type: 'org' | 'member' | 'announcement', 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGuard 
      permission={`${type}:delete` as Permission} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
} 