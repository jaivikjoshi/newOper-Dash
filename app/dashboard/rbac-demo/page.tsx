"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Role, Permission, getPermissionsForRole } from '@/app/utils/auth/rbac';
import { useUser } from '@/app/utils/UserContext';
import RolePermissionsTable from '@/app/components/settings/RolePermissionsTable';
import PermissionGuard from '@/app/components/auth/PermissionGuard';
import { EditButton, CreateButton, DeleteButton } from '@/app/components/auth/RoleBasedButton';
import AccessDenied from '@/app/utils/auth/AccessDenied';
import { PlusCircle, Edit, Trash2, Shield, Users, User, Building, LockKeyhole, Code } from 'lucide-react';
import Link from 'next/link';
import { useConditionalRender, useConditionalRenderAny } from '@/app/utils/auth/useConditionalRender';

export default function RBACDemo() {
  const { userProfile, updateUserProfile } = useUser();
  const [selectedRole, setSelectedRole] = useState<Role>(userProfile?.role || 'owner');
  
  // Use the conditional rendering hooks
  const { renderIf: renderIfAdmin } = useConditionalRender('settings:edit');
  const { renderIf: renderIfCanManageMembers } = useConditionalRender('member:edit');
  const { renderIf: renderIfCanManageAnnouncements } = useConditionalRenderAny(['announcement:create', 'announcement:edit']);
  
  // Mock handler functions
  const handleCreateOrg = () => alert('Create Organization');
  const handleEditOrg = () => alert('Edit Organization');
  const handleDeleteOrg = () => alert('Delete Organization');
  
  const handleCreateMember = () => alert('Create Member');
  const handleEditMember = () => alert('Edit Member');
  const handleDeleteMember = () => alert('Delete Member');
  
  // Handle role change
  const changeUserRole = (role: Role) => {
    if (userProfile) {
      updateUserProfile({ role });
    }
  };
  
  // Use the conditional rendering hooks
  return (
    <div className="p-8">
      <div className="mb-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">Role-Based Access Control Demo</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates the RBAC system. You can change your role to see how different 
          permissions affect what you can see and do.
        </p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Your Current Role
            </CardTitle>
            <CardDescription>
              Change your role to see how your permissions change
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['owner', 'admin', 'manager', 'staff', 'guest'] as Role[]).map((role) => (
                <Button 
                  key={role} 
                  variant={userProfile?.role === role ? 'default' : 'outline'}
                  onClick={() => changeUserRole(role)}
                  className="capitalize"
                >
                  {role}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            You are currently logged in as: <strong>{userProfile?.name}</strong> with role: <strong className="capitalize">{userProfile?.role}</strong>
          </CardFooter>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LockKeyhole className="mr-2 h-5 w-5" />
              Protected Page Demo
            </CardTitle>
            <CardDescription>
              Try visiting the protected admin page with different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                This demo includes a protected page that can only be accessed by users with the <strong>settings:edit</strong> permission.
                Currently, only <strong>Owner</strong> and <strong>Admin</strong> roles have this permission.
              </p>
              <p>
                Try accessing the page with different roles to see how the access control works. If you don't have the required permission,
                you'll see an access denied message.
              </p>
              <div className="pt-4">
                <Link href="/dashboard/rbac-demo/protected-page-demo">
                  <Button>
                    <Shield className="mr-2 h-4 w-4" />
                    Visit Protected Admin Page
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Permission-Based UI Components
            </CardTitle>
            <CardDescription>
              These UI components will only appear if your role has the right permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Organization Buttons</h3>
                <div className="space-y-2">
                  <div>
                    <CreateButton 
                      entityType="org" 
                      onClick={handleCreateOrg}
                      className="w-full"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Organization
                    </CreateButton>
                  </div>
                  <div>
                    <EditButton 
                      entityType="org" 
                      onClick={handleEditOrg}
                      className="w-full"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Organization
                    </EditButton>
                  </div>
                  <div>
                    <DeleteButton 
                      entityType="org" 
                      onClick={handleDeleteOrg}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Organization
                    </DeleteButton>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Member Buttons</h3>
                <div className="space-y-2">
                  <div>
                    <CreateButton 
                      entityType="member" 
                      onClick={handleCreateMember}
                      className="w-full"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Member
                    </CreateButton>
                  </div>
                  <div>
                    <EditButton 
                      entityType="member" 
                      onClick={handleEditMember}
                      className="w-full"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Member
                    </EditButton>
                  </div>
                  <div>
                    <DeleteButton 
                      entityType="member" 
                      onClick={handleDeleteMember}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Member
                    </DeleteButton>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Permission-Protected Sections
            </CardTitle>
            <CardDescription>
              These sections will only appear if your role has the right permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <PermissionGuard
                permission="org:edit"
                fallback={
                  <AccessDenied 
                    title="Cannot Edit Organizations" 
                    message="Your current role does not have permission to edit organizations."
                    buttonText="Learn More About Permissions"
                    redirectTo="#"
                  />
                }
              >
                <div className="p-4 border rounded bg-blue-50">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Organization Editor</h3>
                  <p className="text-blue-600 mb-4">
                    This section is only visible to users with the 'org:edit' permission.
                    Currently visible to: Owner, Admin
                  </p>
                  <div className="bg-white p-4 rounded border border-blue-200">
                    <p className="text-gray-500">Organization Editor Form Would Go Here</p>
                  </div>
                </div>
              </PermissionGuard>
              
              <PermissionGuard
                permission="settings:edit"
                fallback={
                  <AccessDenied 
                    title="Cannot Edit Settings" 
                    message="Your current role does not have permission to edit system settings."
                    buttonText="Learn More About Permissions"
                    redirectTo="#"
                    type="warning"
                  />
                }
              >
                <div className="p-4 border rounded bg-purple-50">
                  <h3 className="text-lg font-medium text-purple-800 mb-2">Settings Manager</h3>
                  <p className="text-purple-600 mb-4">
                    This section is only visible to users with the 'settings:edit' permission.
                    Currently visible to: Owner, Admin
                  </p>
                  <div className="bg-white p-4 rounded border border-purple-200">
                    <p className="text-gray-500">Settings Manager Form Would Go Here</p>
                  </div>
                </div>
              </PermissionGuard>
              
              <PermissionGuard
                permission="member:edit"
                fallback={
                  <AccessDenied 
                    title="Cannot Manage Members" 
                    message="Your current role does not have permission to manage team members."
                    buttonText="Learn More About Permissions"
                    redirectTo="#"
                    type="error"
                  />
                }
              >
                <div className="p-4 border rounded bg-green-50">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Member Manager</h3>
                  <p className="text-green-600 mb-4">
                    This section is only visible to users with the 'member:edit' permission.
                    Currently visible to: Owner, Admin, Manager
                  </p>
                  <div className="bg-white p-4 rounded border border-green-200">
                    <p className="text-gray-500">Member Management Form Would Go Here</p>
                  </div>
                </div>
              </PermissionGuard>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8 max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Permissions by Role
          </CardTitle>
          <CardDescription>
            Overview of what each role can do in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RolePermissionsTable
            selectedRole={selectedRole}
            onRoleSelect={setSelectedRole}
          />
        </CardContent>
      </Card>
      
      <Card className="mb-8 max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-2 h-5 w-5" />
            Conditional Rendering Hooks
          </CardTitle>
          <CardDescription>
            These hooks provide a cleaner way to conditionally render UI elements based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Example Usage</h3>
              <p className="mb-4">The following components are conditionally rendered based on your current role:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderIfAdmin(
                  <div className="p-4 bg-purple-50 rounded border border-purple-200">
                    <h4 className="font-medium text-purple-800">Admin Feature</h4>
                    <p className="text-sm text-purple-600">
                      This is only visible to users with the 'settings:edit' permission.
                    </p>
                  </div>,
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-800">Admin Feature (Hidden)</h4>
                    <p className="text-sm text-gray-600">
                      You don't have 'settings:edit' permission.
                    </p>
                  </div>
                )}
                
                {renderIfCanManageMembers(
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <h4 className="font-medium text-blue-800">Team Management</h4>
                    <p className="text-sm text-blue-600">
                      This is only visible to users with the 'member:edit' permission.
                    </p>
                  </div>,
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-800">Team Management (Hidden)</h4>
                    <p className="text-sm text-gray-600">
                      You don't have 'member:edit' permission.
                    </p>
                  </div>
                )}
                
                {renderIfCanManageAnnouncements(
                  <div className="p-4 bg-green-50 rounded border border-green-200">
                    <h4 className="font-medium text-green-800">Announcement Controls</h4>
                    <p className="text-sm text-green-600">
                      This is visible to users with either 'announcement:create' OR 'announcement:edit' permissions.
                    </p>
                  </div>,
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-medium text-gray-800">Announcement Controls (Hidden)</h4>
                    <p className="text-sm text-gray-600">
                      You don't have announcement management permissions.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Implementation</h3>
              <div className="bg-white p-4 rounded border overflow-x-auto">
                <pre className="text-sm">
{`// Import the hooks
import { useConditionalRender, useConditionalRenderAny } from '@/app/utils/auth/useConditionalRender';

// In your component
const { renderIf: renderIfAdmin } = useConditionalRender('settings:edit');
const { renderIf: renderIfCanManageMembers } = useConditionalRender('member:edit');
const { renderIf: renderIfCanManageAnnouncements } = 
  useConditionalRenderAny(['announcement:create', 'announcement:edit']);

// Then in your JSX
{renderIfAdmin(
  <div>Admin content</div>,
  <div>Fallback content</div>
)}

// Or just to conditionally show/hide without fallback
{renderIfAdmin(<div>Admin content</div>)}

// Check if the user can render before executing complex logic
const { canRender } = useConditionalRender('settings:edit');
if (canRender) {
  // Do something that requires the permission
}`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 