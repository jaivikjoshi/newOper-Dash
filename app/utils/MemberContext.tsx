"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OrganizationUnit } from './OrganizationContext';
import { GOOGLE_SHEETS_CONFIG } from './googleSheetsConfig';
import * as sheetsApiClient from './sheetsApiClient';

// Define types for our data structures
export type MemberRole = 'Administrator' | 'Manager' | 'Staff' | 'Guest';

// Define the Member type
export type Member = {
  id: string;
  name: string;
  email: string;
  roles: MemberRole[];
  units: string[];
  status: 'active' | 'inactive';
  createdAt: string;
};

type MemberContextType = {
  members: Member[];
  loading: boolean;
  error: string | null;
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => Promise<Member>;
  updateMember: (id: string, updates: Partial<Omit<Member, 'id'>>) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  searchMembers: (query: string) => Member[];
  getMembersByUnit: (unitId: string) => Member[];
  recalculateUnitCounts: () => void;
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const MemberProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // We'll use a ref to store the updateUnitMemberCounts function when it becomes available
  const [organizationUnits, setOrganizationUnits] = useState<OrganizationUnit[]>([]);

  // Function to calculate unit member counts from all members
  const calculateUnitMemberCounts = (membersList: Member[]): Record<string, number> => {
    const unitCounts: Record<string, number> = {};
    
    // Count members for each unit
    membersList.forEach(member => {
      if (Array.isArray(member.units)) {
        member.units.forEach(unitId => {
          if (unitId) {
            unitCounts[unitId] = (unitCounts[unitId] || 0) + 1;
          }
        });
      }
    });
    
    return unitCounts;
  };

  // Function to update unit counts in Google Sheets
  const updateUnitCountsInSheets = async (unitCounts: Record<string, number>) => {
    // Load organization units first to ensure we have the latest data
    try {
      const orgUnits = await sheetsApiClient.getAllRows<OrganizationUnit>(
        GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS
      );
      setOrganizationUnits(orgUnits);
      
      // Update each unit's member count
      for (const unitId in unitCounts) {
        try {
          // Create properly typed sheetsData
          const sheetsData: Partial<OrganizationUnit> = {
            members: unitCounts[unitId]
          };
          
          // Execute the update
          await sheetsApiClient.updateRow<OrganizationUnit>(
            GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS,
            unitId,
            sheetsData
          );
        } catch (err) {
          console.error(`Error updating member count for unit ${unitId}:`, err);
        }
      }
    } catch (err) {
      console.error('Error loading organization units for count update:', err);
    }
  };

  // Expose a method to recalculate unit counts
  const recalculateUnitCounts = () => {
    const unitCounts = calculateUnitMemberCounts(members);
    updateUnitCountsInSheets(unitCounts).catch(err => {
      console.error('Failed to update unit counts in sheets:', err);
    });
  };

  // Load member data from Google Sheets on initial render
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to load from Google Sheets
        try {
          const data = await sheetsApiClient.getAllRows<any>(GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS);
          if (data && data.length > 0) {
            // Process the data to ensure arrays are properly handled
            const processedMembers = data.map(member => {
              // Parse roles from JSON string if needed
              let roles = member.roles;
              if (typeof roles === 'string') {
                try {
                  roles = JSON.parse(roles);
                } catch (e) {
                  console.warn('Could not parse roles:', roles);
                  roles = [];
                }
              } else if (!Array.isArray(roles)) {
                roles = [];
              }
              
              // Parse units from JSON string if needed or from the unit column
              let units: string[] = [];
              
              // Try to get units from the units column (JSON array)
              if (member.units) {
                if (typeof member.units === 'string') {
                  try {
                    units = JSON.parse(member.units);
                  } catch (e) {
                    console.warn('Could not parse units JSON:', member.units);
                  }
                } else if (Array.isArray(member.units)) {
                  units = member.units;
                }
              }
              
              // If no units found yet and unit column exists, use it as a single unit
              if (units.length === 0 && member.unit) {
                if (typeof member.unit === 'string' && member.unit.trim()) {
                  units = [member.unit.trim()];
                }
              }
              
              return {
                ...member,
                roles,
                units
              } as Member;
            });
            
            setMembers(processedMembers);
            
            // Calculate unit counts
            const unitCounts = calculateUnitMemberCounts(processedMembers);
            updateUnitCountsInSheets(unitCounts).catch(err => {
              console.error('Failed to update unit counts on load:', err);
            });
            
            setLoading(false);
            return;
          }
        } catch (sheetsError) {
          console.error('Error loading from Google Sheets, falling back to localStorage:', sheetsError);
        }

        // Fallback to localStorage if Google Sheets fails
        const storedMembers = localStorage.getItem('organizationMembers');
        if (storedMembers) {
          setMembers(JSON.parse(storedMembers));
        } else {
          // Create some sample members for demo purposes
          const defaultMembers: Member[] = [
            {
              id: '1',
              name: 'John Admin',
              email: 'john@example.com',
              roles: ['Administrator'],
              units: ['1', '2'], // Operations Team, North Location
              status: 'active',
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Sarah Manager',
              email: 'sarah@example.com',
              roles: ['Manager'],
              units: ['1'], // Operations Team
              status: 'active',
              createdAt: new Date().toISOString()
            }
          ];
          setMembers(defaultMembers);
          localStorage.setItem('organizationMembers', JSON.stringify(defaultMembers));
        }
      } catch (err) {
        console.error('Error loading member data:', err);
        setError('Failed to load member data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Function to add a new member
  const addMember = async (member: Omit<Member, 'id' | 'createdAt'>): Promise<Member> => {
    try {
      // Create a temporary member object without an ID
      const newMemberData = {
        ...member,
        createdAt: new Date().toISOString()
      };

      // Try to add to Google Sheets
      try {
        // Format data for Google Sheets
        const sheetsData: Record<string, any> = {
          ...newMemberData,
          // Ensure roles are properly stringified
          roles: JSON.stringify(newMemberData.roles || []),
          // Store units as JSON array
          units: JSON.stringify(newMemberData.units || []),
          // Also include the first unit in the unit column if available
          unit: Array.isArray(newMemberData.units) && newMemberData.units.length > 0 
            ? newMemberData.units[0] 
            : ""
        };
        
        // The API will assign an ID
        const response = await sheetsApiClient.addRow<any>(
          GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS, 
          sheetsData
        );
        
        // Process the response to ensure arrays are properly handled
        const addedMember: Member = {
          ...response,
          // Ensure roles is an array
          roles: Array.isArray(response.roles) 
            ? response.roles 
            : (typeof response.roles === 'string' 
              ? (response.roles ? JSON.parse(response.roles) : [])
              : []),
          // Ensure units is an array
          units: Array.isArray(response.units) 
            ? response.units 
            : (typeof response.units === 'string' 
              ? (response.units ? JSON.parse(response.units) : [])
              : [])
        };
        
        // Update the members state with the new member
        const updatedMembers = [...members, addedMember];
        setMembers(updatedMembers);
        
        // Calculate and update unit member counts
        const unitCounts = calculateUnitMemberCounts(updatedMembers);
        updateUnitCountsInSheets(unitCounts).catch(err => {
          console.error('Failed to update unit counts after adding member:', err);
        });
        
        return addedMember;
      } catch (sheetsError) {
        console.error('Error adding to Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      const id = Date.now().toString();
      const memberWithId = { 
        ...newMemberData, 
        id,
        // Ensure roles and units are arrays even in localStorage
        roles: Array.isArray(newMemberData.roles) ? newMemberData.roles : [],
        units: Array.isArray(newMemberData.units) ? newMemberData.units : []
      };
      
      // Update the members state with the new member
      const updatedMembers = [...members, memberWithId];
      setMembers(updatedMembers);
      localStorage.setItem('organizationMembers', JSON.stringify(updatedMembers));
      
      // Calculate and update unit member counts
      const unitCounts = calculateUnitMemberCounts(updatedMembers);
      updateUnitCountsInSheets(unitCounts).catch(err => {
        console.error('Failed to update unit counts after adding member (localStorage):', err);
      });
      
      return memberWithId;
    } catch (err) {
      console.error('Error adding member:', err);
      throw new Error('Failed to add member. Please try again later.');
    }
  };

  // Function to update a member
  const updateMember = async (id: string, updates: Partial<Omit<Member, 'id'>>): Promise<boolean> => {
    try {
      // Create a processed updates object with validated arrays
      const processedUpdates: Partial<Member> = {
        ...updates,
        roles: Array.isArray(updates.roles) ? updates.roles : undefined,
        units: Array.isArray(updates.units) ? updates.units : undefined
      };
      
      // Try to update in Google Sheets
      try {
        // Format data for Google Sheets
        const sheetsData: Record<string, any> = {
          ...updates
        };
        
        // Ensure units and roles are properly stringified if present
        if (updates.roles) {
          sheetsData.roles = JSON.stringify(updates.roles);
        }
        
        if (updates.units) {
          // Store units as a JSON array
          sheetsData.units = JSON.stringify(updates.units);
          
          // Also update the unit column with the first unit if available
          if (Array.isArray(updates.units) && updates.units.length > 0) {
            sheetsData.unit = updates.units[0];
          } else {
            sheetsData.unit = "";
          }
        }
        
        const success = await sheetsApiClient.updateRow<Member>(
          GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS, 
          id, 
          sheetsData
        );
        
        if (success) {
          // Update the members state
          const updatedMembers = members.map(member => 
            member.id === id ? {
              ...member,
              ...processedUpdates,
              // Ensure arrays stay as arrays
              roles: processedUpdates.roles || member.roles,
              units: processedUpdates.units || member.units
            } : member
          );
          
          setMembers(updatedMembers);
          
          // Calculate and update unit member counts
          const unitCounts = calculateUnitMemberCounts(updatedMembers);
          updateUnitCountsInSheets(unitCounts).catch(err => {
            console.error('Failed to update unit counts after updating member:', err);
          });
          
          return true;
        }
      } catch (sheetsError) {
        console.error('Error updating in Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      const updatedMembers = members.map(member => 
        member.id === id ? {
          ...member,
          ...processedUpdates,
          // Ensure arrays stay as arrays
          roles: processedUpdates.roles || member.roles,
          units: processedUpdates.units || member.units
        } : member
      );
      
      setMembers(updatedMembers);
      localStorage.setItem('organizationMembers', JSON.stringify(updatedMembers));
      
      // Calculate and update unit member counts
      const unitCounts = calculateUnitMemberCounts(updatedMembers);
      updateUnitCountsInSheets(unitCounts).catch(err => {
        console.error('Failed to update unit counts after updating member (localStorage):', err);
      });
      
      return true;
    } catch (err) {
      console.error('Error updating member:', err);
      return false;
    }
  };

  // Function to delete a member
  const deleteMember = async (id: string): Promise<boolean> => {
    try {
      // Try to delete from Google Sheets
      try {
        const success = await sheetsApiClient.deleteRow(
          GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS, 
          id
        );
        
        if (success) {
          // Update the members state
          const updatedMembers = members.filter(member => member.id !== id);
          setMembers(updatedMembers);
          
          // Calculate and update unit member counts
          const unitCounts = calculateUnitMemberCounts(updatedMembers);
          updateUnitCountsInSheets(unitCounts).catch(err => {
            console.error('Failed to update unit counts after deleting member:', err);
          });
          
          return true;
        }
      } catch (sheetsError) {
        console.error('Error deleting from Google Sheets, falling back to localStorage:', sheetsError);
      }

      // Fallback to localStorage if Google Sheets fails
      const updatedMembers = members.filter(member => member.id !== id);
      
      setMembers(updatedMembers);
      localStorage.setItem('organizationMembers', JSON.stringify(updatedMembers));
      
      // Calculate and update unit member counts
      const unitCounts = calculateUnitMemberCounts(updatedMembers);
      updateUnitCountsInSheets(unitCounts).catch(err => {
        console.error('Failed to update unit counts after deleting member (localStorage):', err);
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting member:', err);
      return false;
    }
  };

  // Function to search members by name or email
  const searchMembers = (query: string): Member[] => {
    const lowercaseQuery = query.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(lowercaseQuery) || 
      member.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Function to get members by unit
  const getMembersByUnit = (unitId: string): Member[] => {
    return members.filter(member => member.units.includes(unitId));
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        loading,
        error,
        addMember,
        updateMember,
        deleteMember,
        searchMembers,
        getMembersByUnit,
        recalculateUnitCounts
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

// Custom hook to use the member context
export const useMember = () => {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
};
