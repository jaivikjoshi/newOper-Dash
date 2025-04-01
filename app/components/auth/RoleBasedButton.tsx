"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Permission, useHasPermission } from '@/app/utils/auth/rbac';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

interface RoleBasedButtonProps {
  /**
   * The permission required to show this button
   */
  permission: Permission;
  
  /**
   * What to render when the user doesn't have permission (optional)
   */
  fallback?: React.ReactNode;
  
  /**
   * Optional tooltip to show when hovering over the button
   */
  tooltip?: string;
  
  /**
   * Button variant - defaults to "default"
   */
  variant?: ButtonVariant;
  
  /**
   * Button content
   */
  children: React.ReactNode;
  
  /**
   * Button click handler
   */
  onClick?: () => void;
  
  /**
   * Button disabled state
   */
  disabled?: boolean;
  
  /**
   * Additional class names
   */
  className?: string;
  
  /**
   * Button type (submit, button, reset)
   */
  buttonType?: 'button' | 'submit' | 'reset';
}

/**
 * Button that only appears if the user has the required permission
 */
export default function RoleBasedButton({
  permission,
  fallback = null,
  tooltip,
  variant = 'default',
  buttonType,
  children,
  ...props
}: RoleBasedButtonProps) {
  const hasPermission = useHasPermission(permission);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return (
    <div className="relative group">
      <Button variant={variant} type={buttonType} {...props}>
        {children}
      </Button>
      
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
}

interface EntityButtonProps extends Omit<RoleBasedButtonProps, 'permission'> {
  /**
   * Entity type the button operates on
   */
  entityType: 'org' | 'member' | 'announcement' | 'settings';
}

/**
 * Create button that only appears if the user has create permissions for the given entity type
 */
export function CreateButton({
  entityType,
  children,
  ...props
}: Omit<EntityButtonProps, 'entityType'> & { entityType: 'org' | 'member' | 'announcement' }) {
  return (
    <RoleBasedButton
      permission={`${entityType}:create` as Permission}
      {...props}
    >
      {children}
    </RoleBasedButton>
  );
}

/**
 * Edit button that only appears if the user has edit permissions for the given entity type
 */
export function EditButton({
  entityType,
  children,
  ...props
}: Omit<EntityButtonProps, 'entityType'> & { entityType: 'org' | 'member' | 'announcement' | 'settings' }) {
  return (
    <RoleBasedButton
      permission={`${entityType}:edit` as Permission}
      {...props}
    >
      {children}
    </RoleBasedButton>
  );
}

/**
 * Delete button that only appears if the user has delete permissions for the given entity type
 */
export function DeleteButton({
  entityType,
  children,
  ...props
}: Omit<EntityButtonProps, 'entityType'> & { entityType: 'org' | 'member' | 'announcement' }) {
  return (
    <RoleBasedButton
      permission={`${entityType}:delete` as Permission}
      variant="destructive"
      {...props}
    >
      {children}
    </RoleBasedButton>
  );
} 