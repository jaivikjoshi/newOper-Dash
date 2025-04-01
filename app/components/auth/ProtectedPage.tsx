"use client";

import React, { ReactNode } from 'react';
import { Permission } from '@/app/utils/auth/rbac';
import { useHasPermission } from '@/app/utils/auth/hooks';
import AccessDenied from '@/app/utils/auth/AccessDenied';

interface ProtectedPageProps {
  requiredPermission: Permission;
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  fallbackType?: 'permission' | 'warning' | 'error';
  redirectTo?: string;
  buttonText?: string;
}

/**
 * Component to protect entire pages or sections that require specific permissions.
 * Will display the children content only if the user has the required permission,
 * otherwise shows an AccessDenied component.
 */
export default function ProtectedPage({
  requiredPermission,
  children,
  fallbackTitle = "Access Restricted",
  fallbackMessage = "You do not have permission to access this page.",
  fallbackType = 'permission',
  redirectTo = "/dashboard",
  buttonText = "Go Back to Dashboard"
}: ProtectedPageProps) {
  const hasPermission = useHasPermission(requiredPermission);

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full">
          <AccessDenied
            title={fallbackTitle}
            message={fallbackMessage}
            type={fallbackType}
            redirectTo={redirectTo}
            buttonText={buttonText}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 