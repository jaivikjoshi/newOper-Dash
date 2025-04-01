"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, Globe, MapPin, Mail, Phone, Save } from "lucide-react";
import { useUser } from "@/app/utils/UserContext";

export default function Account() {
  const { userProfile, updateUserProfile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    website: "",
    location: ""
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        businessName: userProfile.businessName || "",
        businessType: userProfile.businessType || "",
        website: userProfile.website || "",
        location: userProfile.location || ""
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <p>Loading account information...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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

            {/* Subscription Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Subscription</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-gray-600 capitalize">{userProfile?.plan}</p>
                  </div>
                  <Button variant="outline">Upgrade</Button>
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
    </div>
  );
}
