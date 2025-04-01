"use client";

import { ReactNode } from 'react';
import { Permission } from './rbac';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from './hooks';

type RenderResult = {
  canRender: boolean;
  render: (element: ReactNode) => ReactNode | null;
  renderIf: (element: ReactNode, fallback?: ReactNode) => ReactNode;
};

/**
 * A custom hook that provides functions to conditionally render components based on a single permission
 * @param permission The permission to check
 * @returns An object with canRender, render, and renderIf functions
 */
export function useConditionalRender(permission: Permission): RenderResult {
  const hasPermission = useHasPermission(permission);
  
  const render = (element: ReactNode): ReactNode | null => {
    return hasPermission ? element : null;
  };
  
  const renderIf = (element: ReactNode, fallback: ReactNode = null): ReactNode => {
    return hasPermission ? element : fallback;
  };
  
  return {
    canRender: hasPermission,
    render,
    renderIf
  };
}

/**
 * A custom hook that provides functions to conditionally render components based on any of the specified permissions
 * @param permissions Array of permissions to check
 * @returns An object with canRender, render, and renderIf functions
 */
export function useConditionalRenderAny(permissions: Permission[]): RenderResult {
  const hasAnyPermission = useHasAnyPermission(permissions);
  
  const render = (element: ReactNode): ReactNode | null => {
    return hasAnyPermission ? element : null;
  };
  
  const renderIf = (element: ReactNode, fallback: ReactNode = null): ReactNode => {
    return hasAnyPermission ? element : fallback;
  };
  
  return {
    canRender: hasAnyPermission,
    render,
    renderIf
  };
}

/**
 * A custom hook that provides functions to conditionally render components based on all of the specified permissions
 * @param permissions Array of permissions to check
 * @returns An object with canRender, render, and renderIf functions
 */
export function useConditionalRenderAll(permissions: Permission[]): RenderResult {
  const hasAllPermissions = useHasAllPermissions(permissions);
  
  const render = (element: ReactNode): ReactNode | null => {
    return hasAllPermissions ? element : null;
  };
  
  const renderIf = (element: ReactNode, fallback: ReactNode = null): ReactNode => {
    return hasAllPermissions ? element : fallback;
  };
  
  return {
    canRender: hasAllPermissions,
    render,
    renderIf
  };
} 