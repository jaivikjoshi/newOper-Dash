"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GOOGLE_SHEETS_CONFIG } from './googleSheetsConfig';
import * as sheetsApiClient from './sheetsApiClient';

// Define types for our data structures
export type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
  scheduledFor?: string;
  type: 'basic' | 'draft' | 'scheduled' | 'poll' | 'contest';
  isPremium?: boolean;
  attachments?: {
    name: string;
    url: string;
    type: string;
    size?: number;
  }[];
};

type PlanType = 'free' | 'basic' | 'premium' | 'enterprise';
type RoleType = 'admin' | 'manager' | 'staff' | 'owner' | 'guest';

interface NotificationSettings {
  announcements: boolean;
  polls: boolean;
  mentions: boolean;
  teamUpdates: boolean;
  shiftChanges: boolean;
}

export interface UserMetadata {
  role?: string;
  locationCount?: string;
  employeeCount?: string;
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: string;
  [key: string]: any;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  location?: string;
  plan?: PlanType;
  profilePicture?: string;
  role?: RoleType;
  notificationSettings?: NotificationSettings;
  createdAt?: string;
  metadata?: UserMetadata;
  passwordHash?: string;
}

type UserContextType = {
  userProfile: UserProfile | null;
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  updateUserProfile: (updates: Partial<Omit<UserProfile, 'id'>>) => Promise<boolean>;
  saveOnboardingData: (onboardingData: any) => Promise<boolean>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<Announcement>;
  updateAnnouncement: (id: string, updates: Partial<Omit<Announcement, 'id'>>) => Promise<boolean>;
  deleteAnnouncement: (id: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for stored auth state on initial load
  useEffect(() => {
    const storedAuthState = localStorage.getItem('isAuthenticated');
    if (storedAuthState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load user data from Google Sheets on initial render
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load user profile from Google Sheets
        try {
          const profiles = await sheetsApiClient.getAllRows<UserProfile>(GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES);
          if (profiles.length > 0) {
            setUserProfile(profiles[0]); // Just use the first profile for demo
          }
        } catch (sheetsError) {
          console.error('Error loading user profile from Google Sheets, falling back to localStorage:', sheetsError);
          
          // Fallback to localStorage for user profile
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
          } else {
            // Create a default profile
            const defaultProfile: UserProfile = {
              id: '1',
              name: 'Jake Smith',
              email: 'jake.smith@example.com',
              phone: '+1 (555) 123-4567',
              profilePicture: '',
              role: 'owner',
              businessName: 'State Farm Co',
              businessType: 'Insurance',
              website: 'https://statefarm.example.com',
              location: '123 Main St, Anytown, USA',
              plan: 'free',
              notificationSettings: {
                announcements: true,
                polls: true,
                mentions: true,
                teamUpdates: true,
                shiftChanges: true
              },
              createdAt: new Date().toISOString(),
              metadata: {
                onboardingCompleted: false
              }
            };
            setUserProfile(defaultProfile);
            localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
          }
        }

        // Try to load announcements from Google Sheets
        try {
          const loadedAnnouncements = await sheetsApiClient.getAllRows<any>(GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS);
          
          // Process announcements to ensure boolean values are correctly typed
          const processedAnnouncements = loadedAnnouncements.map(announcement => {
            // Parse attachments from JSON string if needed
            let attachments = [];
            if (announcement.attachments) {
              try {
                if (typeof announcement.attachments === 'string') {
                  attachments = JSON.parse(announcement.attachments);
                } else if (Array.isArray(announcement.attachments)) {
                  attachments = announcement.attachments;
                }
              } catch (e) {
                console.warn('Could not parse attachments:', announcement.attachments);
              }
            }
            
            return {
              ...announcement,
              // Convert string 'true'/'false' to boolean values
              isActive: announcement.isActive === 'true' || announcement.isActive === true,
              isPremium: announcement.isPremium === 'true' || announcement.isPremium === true,
              // Set default type if not specified
              type: announcement.type || 'basic',
              // Add parsed attachments
              attachments
            } as Announcement;
          });
          
          setAnnouncements(processedAnnouncements);
        } catch (sheetsError) {
          console.error('Error loading announcements from Google Sheets, falling back to localStorage:', sheetsError);
          
          // Fallback to localStorage for announcements
          const storedAnnouncements = localStorage.getItem('announcements');
          if (storedAnnouncements) {
            setAnnouncements(JSON.parse(storedAnnouncements));
          } else {
            // Create some default announcements
            const defaultAnnouncements: Announcement[] = [
              {
                id: '1',
                title: 'Welcome to our platform',
                content: 'Thank you for joining our platform. We are excited to have you on board!',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                isActive: true,
                type: 'basic',
                attachments: []
              },
              {
                id: '2',
                title: 'New features coming soon',
                content: 'We are working on exciting new features that will be released next month.',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                isActive: true,
                type: 'scheduled',
                scheduledFor: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              }
            ];
            setAnnouncements(defaultAnnouncements);
            localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Update user profile
  const updateUserProfile = async (updates: Partial<Omit<UserProfile, 'id'>>): Promise<boolean> => {
    try {
      if (!userProfile) return false;

      // Try to update in Google Sheets
      try {
        const success = await sheetsApiClient.updateRow<UserProfile>(
          GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES, 
          userProfile.id, 
          updates
        );
        
        if (success) {
          const updatedProfile = { ...userProfile, ...updates };
          setUserProfile(updatedProfile);
          return true;
        }
      } catch (sheetsError) {
        console.error('Error updating profile in Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      return true;
    } catch (err) {
      console.error('Error updating user profile:', err);
      return false;
    }
  };

  // Save onboarding data for an existing profile
  const saveOnboardingData = async (onboardingData: any): Promise<boolean> => {
    try {
      if (!userProfile) return false;

      // Extract relevant fields from onboarding data
      const updates: Partial<UserProfile> = {
        // Update core profile fields if provided
        name: onboardingData.firstName && onboardingData.lastName ? 
          `${onboardingData.firstName} ${onboardingData.lastName}` : userProfile.name,
        email: onboardingData.email || userProfile.email,
        phone: onboardingData.phone ? String(onboardingData.phone) : userProfile.phone,
        profilePicture: onboardingData.profilePicture || userProfile.profilePicture,
        role: onboardingData.role || userProfile.role,
        businessName: onboardingData.businessName || userProfile.businessName,
        businessType: onboardingData.businessType === 'other' 
          ? onboardingData.otherBusinessType 
          : (onboardingData.businessType || userProfile.businessType),
        website: onboardingData.website && onboardingData.website.trim() !== '' 
          ? onboardingData.website 
          : userProfile.website,
        location: onboardingData.location || userProfile.location,
        plan: onboardingData.plan || userProfile.plan,
        notificationSettings: onboardingData.notificationSettings || userProfile.notificationSettings,
        
        // Store additional metadata
        metadata: {
          ...(userProfile.metadata || {}),
          role: onboardingData.role,
          locationCount: onboardingData.locationCount,
          employeeCount: onboardingData.employeeCount,
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        }
      };

      // Try to also update Google Sheets directly with flattened data
      try {
        const sheetsData: Record<string, any> = {
          ...updates,
          // Use empty string instead of undefined for website
          website: updates.website || '',
          // Format phone to be a string with proper prefix
          phone: updates.phone ? `'${String(updates.phone)}` : '',
          // Flatten metadata
          role: updates.metadata?.role || '',
          locationCount: updates.metadata?.locationCount || '',
          employeeCount: updates.metadata?.employeeCount || '',
          onboardingCompleted: true,
          onboardingCompletedAt: updates.metadata?.onboardingCompletedAt || new Date().toISOString()
        };
        
        // Remove undefined values but keep empty strings
        Object.keys(sheetsData).forEach(key => {
          if (sheetsData[key] === undefined) {
            delete sheetsData[key];
          }
        });
        
        await sheetsApiClient.updateRow(
          GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES,
          userProfile.id,
          sheetsData
        );
      } catch (sheetsError) {
        console.error('Error updating Google Sheets directly:', sheetsError);
        // Continue with regular update
      }

      // Update the profile
      return await updateUserProfile(updates);
    } catch (err) {
      console.error('Error saving onboarding data:', err);
      return false;
    }
  };

  // Add a new announcement
  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> => {
    try {
      // Create a temporary announcement object without an ID
      const newAnnouncementData = {
        ...announcement,
        createdAt: new Date().toISOString()
      };

      // Try to add to Google Sheets
      try {
        // Format data for Google Sheets - convert boolean to string for sheets compatibility
        const sheetsData: Record<string, any> = {
          ...newAnnouncementData,
          // Convert boolean isActive to string
          isActive: String(newAnnouncementData.isActive),
          // Convert boolean isPremium to string if present
          isPremium: newAnnouncementData.isPremium !== undefined 
            ? String(newAnnouncementData.isPremium) 
            : undefined,
          // Convert attachments to JSON string if present
          attachments: newAnnouncementData.attachments && newAnnouncementData.attachments.length 
            ? JSON.stringify(newAnnouncementData.attachments) 
            : undefined
        };
        
        // The API will assign an ID
        const response = await sheetsApiClient.addRow<any>(
          GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS, 
          sheetsData
        );
        
        // Process the response to ensure proper typing
        const addedAnnouncement: Announcement = {
          ...response,
          // Convert string isActive back to boolean
          isActive: response.isActive === 'true' || response.isActive === true,
          // Convert string isPremium back to boolean if present
          isPremium: response.isPremium === 'true' || response.isPremium === true,
          // Parse attachments if present
          attachments: response.attachments 
            ? (typeof response.attachments === 'string' 
              ? JSON.parse(response.attachments) 
              : response.attachments)
            : []
        };
        
        setAnnouncements(prev => [...prev, addedAnnouncement]);
        return addedAnnouncement;
      } catch (sheetsError) {
        console.error('Error adding to Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      const id = Date.now().toString();
      const announcementWithId = { ...newAnnouncementData, id };
      
      setAnnouncements(prev => [...prev, announcementWithId]);
      localStorage.setItem('announcements', JSON.stringify([...announcements, announcementWithId]));
      
      return announcementWithId;
    } catch (err) {
      console.error('Error adding announcement:', err);
      throw new Error('Failed to add announcement. Please try again later.');
    }
  };

  // Update an announcement
  const updateAnnouncement = async (id: string, updates: Partial<Omit<Announcement, 'id'>>): Promise<boolean> => {
    try {
      // Try to update in Google Sheets
      try {
        // Format data for Google Sheets
        const sheetsData: Record<string, any> = {
          ...updates
        };
        
        // Convert boolean isActive to string if present
        if (updates.hasOwnProperty('isActive')) {
          sheetsData.isActive = String(updates.isActive);
        }
        
        // Convert boolean isPremium to string if present
        if (updates.hasOwnProperty('isPremium')) {
          sheetsData.isPremium = String(updates.isPremium);
        }
        
        // Convert attachments to JSON string if present
        if (updates.attachments) {
          sheetsData.attachments = JSON.stringify(updates.attachments);
        }
        
        const success = await sheetsApiClient.updateRow<Announcement>(
          GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS, 
          id, 
          sheetsData
        );
        
        if (success) {
          setAnnouncements(prev => 
            prev.map(announcement => 
              announcement.id === id ? {
                ...announcement,
                ...updates,
                // Ensure proper boolean type
                isActive: updates.hasOwnProperty('isActive') 
                  ? Boolean(updates.isActive) 
                  : announcement.isActive,
                isPremium: updates.hasOwnProperty('isPremium')
                  ? Boolean(updates.isPremium)
                  : announcement.isPremium
              } : announcement
            )
          );
          return true;
        }
      } catch (sheetsError) {
        console.error('Error updating in Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id ? { ...announcement, ...updates } : announcement
        )
      );
      localStorage.setItem('announcements', JSON.stringify(
        announcements.map(announcement => 
          announcement.id === id ? { ...announcement, ...updates } : announcement
        )
      ));
      
      return true;
    } catch (err) {
      console.error('Error updating announcement:', err);
      return false;
    }
  };

  // Delete an announcement
  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      // Try to delete from Google Sheets
      try {
        const success = await sheetsApiClient.deleteRow(
          GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS, 
          id
        );
        
        if (success) {
          setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
          return true;
        }
      } catch (sheetsError) {
        console.error('Error deleting from Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      const filteredAnnouncements = announcements.filter(announcement => announcement.id !== id);
      
      setAnnouncements(filteredAnnouncements);
      localStorage.setItem('announcements', JSON.stringify(filteredAnnouncements));
      
      return true;
    } catch (err) {
      console.error('Error deleting announcement:', err);
      return false;
    }
  };

  // Login function - simplified for demo purposes
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Try to get user profiles from Google Sheets
      let profiles: UserProfile[] = [];
      try {
        profiles = await sheetsApiClient.getAllRows<UserProfile>(GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES);
      } catch (sheetsError) {
        console.error('Error loading user profiles from Google Sheets:', sheetsError);
        
        // Fallback to localStorage
        const storedProfiles = localStorage.getItem('userProfiles');
        if (storedProfiles) {
          profiles = JSON.parse(storedProfiles);
        }
      }

      // Find matching user by email
      const user = profiles.find(profile => profile.email === email);
      
      if (!user) {
        setError('Invalid email or password');
        return false;
      }

      // For a real app, we would use proper password verification here
      // This is a simplified demo that uses string comparison (never do this in production)
      if (user.passwordHash !== password) { // In real app, compare hash with bcrypt.compare
        setError('Invalid email or password');
        return false;
      }

      // Set authenticated state
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Set user profile
      setUserProfile(user);
      localStorage.setItem('userProfile', JSON.stringify(user));

      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    // We don't remove the user profile from state to avoid re-fetching
    // when the user logs back in
  };

  return (
    <UserContext.Provider
      value={{
        userProfile,
        announcements,
        loading,
        error,
        updateUserProfile,
        saveOnboardingData,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        login,
        logout,
        isAuthenticated
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
