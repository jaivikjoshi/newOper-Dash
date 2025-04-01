"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Permission, useHasPermission, useHasAllPermissions, useHasAnyPermission } from './rbac';
import { useUser } from '../UserContext';

interface WithPermissionOptions {
  /**
   * Single permission required to access the page
   */
  permission?: Permission;
  
  /**
   * Multiple permissions, all required to access the page
   */
  allPermissions?: Permission[];
  
  /**
   * Multiple permissions, any one required to access the page
   */
  anyPermission?: Permission[];
  
  /**
   * Where to redirect if the user doesn't have permission
   */
  redirectTo?: string;
  
  /**
   * Optional loading component to show while checking permissions
   */
  LoadingComponent?: React.ComponentType;
}

/**
 * Higher-order component to protect routes based on permissions
 * @param Component The page component to wrap
 * @param options Permission options
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPermissionOptions
) {
  const { 
    permission, 
    allPermissions, 
    anyPermission, 
    redirectTo = '/dashboard', 
    LoadingComponent 
  } = options;
  
  // Create a wrapper component
  function WrappedComponent(props: P) {
    const router = useRouter();
    const { userProfile, loading } = useUser();
    
    // Check permissions based on what was provided
    let hasAccess = false;
    
    if (permission) {
      hasAccess = useHasPermission(permission);
    } else if (allPermissions && allPermissions.length > 0) {
      hasAccess = useHasAllPermissions(allPermissions);
    } else if (anyPermission && anyPermission.length > 0) {
      hasAccess = useHasAnyPermission(anyPermission);
    }
    
    // Handle redirect if no access
    useEffect(() => {
      if (!loading && userProfile && !hasAccess) {
        router.push(redirectTo);
      }
    }, [loading, userProfile, hasAccess, router]);
    
    // Show loading state
    if (loading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return <div>Loading...</div>;
    }
    
    // If not logged in or no permissions, don't render anything (will redirect)
    if (!userProfile || !hasAccess) {
      return null;
    }
    
    // User has permission, render the component
    return <Component {...props} />;
  }
  
  // Update display name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withPermission(${componentName})`;
  
  return WrappedComponent;
}

/**
 * Protect a page that requires member edit permissions
 */
export function withMemberEditPermission<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/dashboard'
) {
  return withPermission(Component, {
    permission: 'member:edit',
    redirectTo
  });
}

/**
 * Protect a page that requires organization edit permissions
 */
export function withOrgEditPermission<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/dashboard'
) {
  return withPermission(Component, {
    permission: 'org:edit',
    redirectTo
  });
}

/**
 * Protect a page that requires announcement management permissions
 */
export function withAnnouncementManagePermission<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/dashboard'
) {
  return withPermission(Component, {
    anyPermission: ['announcement:create', 'announcement:edit'],
    redirectTo
  });
}

/**
 * Protect a page that requires admin permissions
 */
export function withAdminPermission<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/dashboard'
) {
  return withPermission(Component, {
    allPermissions: ['settings:edit', 'member:edit', 'org:edit'],
    redirectTo
  });
} 