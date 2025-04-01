"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import {
  User,
  Bell,
  Users,
  CreditCard,
  Upload,
  Calendar,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  Save,
  Shield
} from "lucide-react";
import { useUser } from "@/app/utils/UserContext";
import RolePermissionsTable from "@/app/components/settings/RolePermissionsTable";
import { Role } from "@/app/utils/auth/rbac";
import PermissionGuard from "@/app/components/auth/PermissionGuard";

// Define the type for tab states
type TabType = "profile" | "notifications" | "team" | "roles" | "subscription";

export default function Settings() {
  const { userProfile, updateUserProfile, loading } = useUser();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('owner');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "owner" as "admin" | "manager" | "staff" | "owner" | "guest",
    businessName: "",
    businessType: "",
    website: "",
    location: "",
    profilePicture: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    announcements: true,
    polls: true,
    mentions: true,
    teamUpdates: true,
    shiftChanges: true
  });

  // Set active tab based on query param
  useEffect(() => {
    if (tabParam) {
      const validTab = ['profile', 'notifications', 'team', 'roles', 'subscription'].includes(tabParam)
        ? tabParam as TabType
        : 'profile';
      setActiveTab(validTab);
    }
  }, [tabParam]);

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        role: userProfile.role || "owner",
        businessName: userProfile.businessName || "",
        businessType: userProfile.businessType || "",
        website: userProfile.website || "",
        location: userProfile.location || "",
        profilePicture: userProfile.profilePicture || ""
      });
      
      setProfilePicture(userProfile.profilePicture || "");
      
      if (userProfile.notificationSettings) {
        setNotificationSettings(userProfile.notificationSettings);
      }
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (settingName: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [settingName]: !prev[settingName]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update profile with form data and notification settings
    updateUserProfile({
      ...formData,
      notificationSettings
    });
    
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicture(result);
        setFormData(prev => ({ ...prev, profilePicture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`pb-2 px-4 flex items-center ${activeTab === "profile" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("profile")}
        >
          <User className="h-4 w-4 mr-2" />
          PROFILE
        </button>
        <button
          className={`pb-2 px-4 flex items-center ${activeTab === "notifications" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell className="h-4 w-4 mr-2" />
          NOTIFICATIONS
        </button>
        <button
          className={`pb-2 px-4 flex items-center ${activeTab === "team" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("team")}
        >
          <Users className="h-4 w-4 mr-2" />
          TEAM
        </button>
        <button
          className={`pb-2 px-4 flex items-center ${activeTab === "roles" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("roles")}
        >
          <Shield className="h-4 w-4 mr-2" />
          ROLES & PERMISSIONS
        </button>
        <button
          className={`pb-2 px-4 flex items-center ${activeTab === "subscription" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("subscription")}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          SUBSCRIPTION
        </button>
      </div>
      
      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  CHANGE AVATAR
                </Button>
              </div>

              {/* Role Selection */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Role</h2>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  disabled={!isEditing}
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
                
              {/* Personal Information Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={20} /> Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <p className="p-2">{userProfile?.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <div className="flex items-center p-2">
                        <Mail className="mr-2" size={16} />
                        <p>{userProfile?.email}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <div className="flex items-center p-2">
                        <Phone className="mr-2" size={16} />
                        <p>{userProfile?.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Building className="mr-2" size={20} /> Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <p className="p-2">{userProfile?.businessName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Business Type</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <p className="p-2">{userProfile?.businessType}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <div className="flex items-center p-2">
                        <Globe className="mr-2" size={16} />
                        <p>{userProfile?.website}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <div className="flex items-center p-2">
                        <MapPin className="mr-2" size={16} />
                        <p>{userProfile?.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex items-center">
                      <Save className="mr-2" size={16} />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      )}
      
      {/* Notifications Tab Content */}
      {activeTab === "notifications" && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
          
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Announcements</h3>
                <p className="text-gray-500">Receive notifications for new announcements</p>
              </div>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.announcements ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => handleNotificationToggle('announcements')}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notificationSettings.announcements ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Polls</h3>
                <p className="text-gray-500">Get notified about new polls and results</p>
              </div>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.polls ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => handleNotificationToggle('polls')}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notificationSettings.polls ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Mentions</h3>
                <p className="text-gray-500">Notifications when someone mentions you</p>
              </div>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.mentions ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => handleNotificationToggle('mentions')}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notificationSettings.mentions ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Team Updates</h3>
                <p className="text-gray-500">Changes to team members or roles</p>
              </div>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.teamUpdates ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => handleNotificationToggle('teamUpdates')}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notificationSettings.teamUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Shift Changes</h3>
                <p className="text-gray-500">Updates to your scheduled shifts</p>
              </div>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationSettings.shiftChanges ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => handleNotificationToggle('shiftChanges')}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notificationSettings.shiftChanges ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => updateUserProfile({ notificationSettings })}
            >
              Save Notification Settings
            </Button>
          </div>
        </Card>
      )}
      
      {/* Team Tab Content */}
      {activeTab === "team" && (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-1">Team Management</h2>
            <p className="text-gray-500">Current Plan: {userProfile && userProfile.plan ? userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1) : 'Free'}</p>
            <p className="text-gray-500 mt-2">Your team can have up to 50 members</p>
            
            <Button className="mt-4 border border-blue-500 text-blue-500 bg-white hover:bg-blue-50">
              UPGRADE PLAN
            </Button>
          </div>
          
          <hr className="my-6" />
          
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Team Members (23/50)</h2>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Invite Team Members</h2>
            <p className="text-gray-500">Send invitations via email</p>
            
            <div className="flex mt-4">
              <input 
                type="email" 
                placeholder="Enter email address"
                className="flex-grow p-2 border rounded-l focus:outline-none" 
              />
              <Button className="rounded-l-none bg-blue-500 hover:bg-blue-600">
                INVITE
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Roles & Permissions Tab Content */}
      {activeTab === "roles" && (
        <Card className="p-6">
          <PermissionGuard
            permission="settings:edit"
            fallback={
              <div className="py-8 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-700 mb-1">Access Restricted</h2>
                <p className="text-gray-500">You need administrator privileges to manage roles and permissions.</p>
              </div>
            }
          >
            <h2 className="text-2xl font-semibold mb-6">Roles & Permissions</h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                View and understand the permissions associated with each role in the system. 
                Only owners can change user roles.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">About User Roles</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Each user in the system has a specific role that determines what actions they can perform. 
                      Owners have full access, while other roles have progressively fewer permissions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Role Permissions</h3>
              <RolePermissionsTable 
                selectedRole={selectedRole} 
                onRoleSelect={setSelectedRole} 
              />
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">User Role Assignment</h3>
              <p className="text-gray-600 mb-4">
                As an administrator, you can manage user roles through the Team Management section.
              </p>
              
              <Button 
                onClick={() => setActiveTab("team")}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Go to Team Management
              </Button>
            </div>
          </PermissionGuard>
        </Card>
      )}
      
      {/* Subscription Tab Content */}
      {activeTab === "subscription" && (
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Subscription Management</h2>
          
          <div className="bg-white border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-medium mb-1">Current Plan: {userProfile && userProfile.plan ? userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1) : 'Free'}</h3>
            <p className="text-gray-500 mb-4">Your subscription renews on January 1, 2024</p>
            
            <div className="flex space-x-2 mb-4">
              <Badge className="bg-green-600">Active</Badge>
              <Badge className="bg-blue-500">{userProfile && userProfile.plan ? userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1) : 'Free'}</Badge>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Plan Features</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium">Team Members</h4>
              <p className="text-gray-500">Up to 50 members</p>
            </div>
            
            <div>
              <h4 className="font-medium">Polls</h4>
              <p className="text-gray-500">Unlimited polls with analytics</p>
            </div>
            
            <div>
              <h4 className="font-medium">Announcements</h4>
              <p className="text-gray-500">Unlimited with rich media</p>
            </div>
            
            <div>
              <h4 className="font-medium">Support</h4>
              <p className="text-gray-500">24/7 priority support</p>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-8">
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-500"
            >
              CHANGE PLAN
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500"
            >
              CANCEL SUBSCRIPTION
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 