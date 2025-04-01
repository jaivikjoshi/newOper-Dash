"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, Edit, Trash2, X, FileText, Upload, Paperclip, Calendar, Clock } from "lucide-react";
import { useUser } from "@/app/utils/UserContext";
import { Announcement } from "@/app/utils/UserContext";
import { format } from "date-fns";

export default function Announcements() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, loading } = useUser();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'scheduled' | 'polls' | 'contests'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
    scheduledFor: "",
    type: "basic" as 'basic' | 'draft' | 'scheduled' | 'poll' | 'contest',
    isPremium: false,
    attachments: [] as Array<{ name: string; url: string; type: string; size?: number }>
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      isActive: true,
      scheduledFor: "",
      type: "basic" as 'basic' | 'draft' | 'scheduled' | 'poll' | 'contest',
      isPremium: false,
      attachments: []
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine the type based on form data
    let type: 'basic' | 'draft' | 'scheduled' | 'poll' | 'contest' = formData.type;
    if (!formData.isActive) {
      type = 'draft';
    } else if (formData.scheduledFor && type !== 'poll' && type !== 'contest') {
      type = 'scheduled';
    }
    
    addAnnouncement({
      ...formData,
      type
    });
    setIsCreating(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      // Determine the type based on form data
      let type: 'basic' | 'draft' | 'scheduled' | 'poll' | 'contest' = formData.type;
      if (!formData.isActive) {
        type = 'draft';
      } else if (formData.scheduledFor && type !== 'poll' && type !== 'contest') {
        type = 'scheduled';
      }
      
      updateAnnouncement(isEditing, {
        ...formData,
        type
      });
      setIsEditing(null);
      resetForm();
    }
  };

  const startEditing = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
      scheduledFor: announcement.scheduledFor || "",
      type: announcement.type || "basic",
      isPremium: announcement.isPremium || false,
      attachments: announcement.attachments || []
    });
    setIsEditing(announcement.id);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a real app, you would upload these files to a cloud storage
    // Here we'll just create placeholder URLs for demo purposes
    const newAttachments = Array.from(files).map(file => ({
      name: file.name,
      // In a real implementation, you would get this URL from your file upload service
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Filter announcements based on active tab
  const filteredAnnouncements = announcements.filter(announcement => {
    switch(activeTab) {
      case 'drafts':
        return announcement.type === 'draft' || !announcement.isActive;
      case 'scheduled':
        return announcement.type === 'scheduled' || (announcement.scheduledFor && new Date(announcement.scheduledFor) > new Date());
      case 'polls':
        return announcement.type === 'poll';
      case 'contests':
        return announcement.type === 'contest';
      default:
        return true; // 'all' tab
    }
  });

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-[#3a2a6d]">Announcements</h1>
        {!isCreating && (
          <Button 
            className="bg-[#3a2a6d] hover:bg-[#2a1a5d]"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-2 px-1 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('all')}
          >
            ALL
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'drafts' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('drafts')}
          >
            DRAFTS
          </button>
          <button
            className={`pb-2 px-1 ${activeTab === 'scheduled' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('scheduled')}
          >
            SCHEDULED
          </button>
          <div className="relative">
            <button
              className={`pb-2 px-1 ${activeTab === 'polls' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('polls')}
            >
              POLLS
            </button>
            <Badge className="absolute -top-2 -right-10 bg-green-500">PREMIUM</Badge>
          </div>
          <div className="relative">
            <button
              className={`pb-2 px-1 ${activeTab === 'contests' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('contests')}
            >
              CONTESTS
            </button>
            <Badge className="absolute -top-2 -right-10 bg-green-500">PREMIUM</Badge>
          </div>
        </div>
      </div>

      {/* Create Announcement Form */}
      {isCreating && (
        <Card className="p-6 bg-white mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Create New Announcement</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setIsCreating(false);
                resetForm();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="basic">Basic Announcement</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="poll">Poll (Premium)</option>
                  <option value="contest">Contest (Premium)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md h-24"
                  required
                />
              </div>
              
              {/* Attachments Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Attachments</label>
                <div className="mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Attachments
                  </Button>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label className="text-sm">Active</label>
              </div>
              
              {(formData.type === 'scheduled' || !formData.isActive || formData.scheduledFor) ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule For</label>
                  <input
                    type="date"
                    name="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required={formData.type === 'scheduled'}
                  />
                </div>
              ) : null}
              
              {(formData.type === 'poll' || formData.type === 'contest') ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Premium Content</label>
                </div>
              ) : null}
              
              <Button type="submit" className="bg-[#3a2a6d] hover:bg-[#2a1a5d]">
                Create Announcement
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Edit Announcement Form */}
      {isEditing && (
        <Card className="p-6 bg-white mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Announcement</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setIsEditing(null);
                resetForm();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="basic">Basic Announcement</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="poll">Poll (Premium)</option>
                  <option value="contest">Contest (Premium)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md h-24"
                  required
                />
              </div>
              
              {/* Attachments Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Attachments</label>
                <div className="mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center"
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Attachments
                  </Button>
                </div>
                
                {formData.attachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label className="text-sm">Active</label>
              </div>
              
              {(formData.type === 'scheduled' || !formData.isActive || formData.scheduledFor) ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Schedule For</label>
                  <input
                    type="date"
                    name="scheduledFor"
                    value={formData.scheduledFor}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required={formData.type === 'scheduled'}
                  />
                </div>
              ) : null}
              
              {(formData.type === 'poll' || formData.type === 'contest') ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={formData.isPremium}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Premium Content</label>
                </div>
              ) : null}
              
              <Button type="submit" className="bg-[#3a2a6d] hover:bg-[#2a1a5d]">
                Update Announcement
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Announcements List */}
      <div className="grid gap-6">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Announcements Found</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'all' 
                ? 'Create your first announcement to keep your team informed.' 
                : `No ${activeTab} found. Create one by clicking the button below.`}
            </p>
            <Button 
              className="bg-[#3a2a6d] hover:bg-[#2a1a5d]"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Announcement
            </Button>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="p-6 bg-white">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{announcement.title}</h3>
                      {announcement.isPremium && (
                        <Badge className="bg-green-500 text-white">PREMIUM</Badge>
                      )}
                      {announcement.type === 'draft' && (
                        <Badge className="bg-yellow-500 text-white">DRAFT</Badge>
                      )}
                      {announcement.type === 'scheduled' && (
                        <Badge className="bg-blue-500 text-white">SCHEDULED</Badge>
                      )}
                      {announcement.type === 'poll' && (
                        <Badge className="bg-purple-500 text-white">POLL</Badge>
                      )}
                      {announcement.type === 'contest' && (
                        <Badge className="bg-red-500 text-white">CONTEST</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Posted on {formatDate(announcement.createdAt)}</span>
                      
                      {announcement.scheduledFor && (
                        <>
                          <span className="mx-2">•</span>
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Scheduled for {formatDate(announcement.scheduledFor)}</span>
                        </>
                      )}
                      
                      <span className="mx-2">•</span>
                      <span>{announcement.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    
                    {/* Attachments */}
                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium text-sm mb-2">Attachments:</p>
                        <div className="space-y-2">
                          {announcement.attachments.map((file, index) => (
                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                              >
                                {file.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => startEditing(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-500" 
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
