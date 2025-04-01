"use client";

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AccessDeniedProps {
  /**
   * The title message to display
   */
  title?: string;
  
  /**
   * The message to display
   */
  message?: string;
  
  /**
   * The link to redirect to
   */
  redirectTo?: string;
  
  /**
   * The text for the back button
   */
  buttonText?: string;
  
  /**
   * The type of access denied message
   */
  type?: 'permission' | 'warning' | 'error';
}

/**
 * Component to display when access is denied
 */
export default function AccessDenied({
  title = 'Access Restricted',
  message = 'You do not have permission to access this page or feature.',
  redirectTo = '/dashboard',
  buttonText = 'Go Back to Dashboard',
  type = 'permission'
}: AccessDeniedProps) {
  const IconComponent = type === 'permission' 
    ? Shield 
    : type === 'warning' 
      ? AlertTriangle 
      : AlertTriangle;
  
  const iconColor = type === 'permission' 
    ? 'text-blue-200' 
    : type === 'warning' 
      ? 'text-amber-200' 
      : 'text-red-200';
  
  const bgColor = type === 'permission' 
    ? 'bg-blue-50 border-blue-100' 
    : type === 'warning' 
      ? 'bg-amber-50 border-amber-100' 
      : 'bg-red-50 border-red-100';
  
  const textColor = type === 'permission' 
    ? 'text-blue-800' 
    : type === 'warning' 
      ? 'text-amber-800' 
      : 'text-red-800';
  
  const textSecondaryColor = type === 'permission' 
    ? 'text-blue-600' 
    : type === 'warning' 
      ? 'text-amber-600' 
      : 'text-red-600';
  
  return (
    <div className={`p-6 md:p-10 rounded-lg border ${bgColor} flex flex-col items-center justify-center text-center`}>
      <IconComponent className={`h-16 w-16 ${iconColor} mb-4`} />
      <h2 className={`text-xl font-bold ${textColor} mb-2`}>{title}</h2>
      <p className={`${textSecondaryColor} mb-6 max-w-md`}>{message}</p>
      <Link href={redirectTo}>
        <Button variant="outline" className={`border-2 ${textColor}`}>
          {buttonText}
        </Button>
      </Link>
    </div>
  );
} 