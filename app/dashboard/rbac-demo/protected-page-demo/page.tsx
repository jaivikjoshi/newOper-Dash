"use client";

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProtectedPage from '@/app/components/auth/ProtectedPage';
import { useUser } from '@/app/utils/UserContext';

export default function ProtectedPageDemo() {
  const { userProfile } = useUser();
  
  return (
    <ProtectedPage
      requiredPermission="settings:edit"
      fallbackTitle="Admin Area Restricted"
      fallbackMessage={`You need administrator privileges to access this page. Your current role (${userProfile?.role || 'guest'}) doesn't have sufficient permissions.`}
      fallbackType="error"
      buttonText="Go Back to RBAC Demo"
      redirectTo="/dashboard/rbac-demo"
    >
      <div className="p-8">
        <div className="mb-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/rbac-demo">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to RBAC Demo
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Protected Admin Page</h1>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center text-green-800">
                <Shield className="mr-2 h-5 w-5" />
                Success! You Have Access
              </CardTitle>
              <CardDescription className="text-green-600">
                This page is only visible to users with the 'settings:edit' permission, which is available to Owner and Admin roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p>
                  You're seeing this page because your role ({userProfile?.role}) has the <strong>settings:edit</strong> permission.
                </p>
                <p>
                  The <code>ProtectedPage</code> component is a higher-order component that wraps your entire page
                  and checks if the user has the required permission before rendering the page content.
                </p>
                <p>
                  If the user doesn't have the required permission, they'll see an access denied message
                  with a button to redirect them to another page.
                </p>
                <div className="p-4 bg-blue-50 rounded border border-blue-200 mt-4">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Implementation Example:</h3>
                  <pre className="text-sm bg-white p-4 rounded overflow-x-auto">
{`<ProtectedPage
  requiredPermission="settings:edit"
  fallbackTitle="Admin Area Restricted"
  fallbackMessage="You need administrator privileges."
  fallbackType="error"
  buttonText="Go Back"
  redirectTo="/dashboard"
>
  {/* Your protected page content here */}
</ProtectedPage>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
} 