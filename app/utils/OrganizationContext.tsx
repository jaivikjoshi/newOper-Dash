"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GOOGLE_SHEETS_CONFIG } from './googleSheetsConfig';
import * as sheetsApiClient from './sheetsApiClient';

// Define types for our data structures
export type UnitType = 'team' | 'location' | 'department' | 'role';

export type OrganizationUnit = {
  id: string;
  name: string;
  type: UnitType;
  description: string;
  members?: number;
  address?: string;
  capacity?: number;
  level?: string;
  createdAt: string;
};

type OrganizationContextType = {
  units: OrganizationUnit[];
  isLoading: boolean;
  addUnit: (unit: Omit<OrganizationUnit, 'id' | 'createdAt'>) => void;
  updateUnit: (id: string, updates: Partial<OrganizationUnit>) => void;
  deleteUnit: (id: string) => void;
  searchUnits: (query: string) => OrganizationUnit[];
  filterUnitsByType: (type: UnitType | 'all') => OrganizationUnit[];
  updateUnitMemberCounts: (unitMemberCounts: Record<string, number>) => void;
};

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load from Google Sheets first
        try {
          const orgUnits = await sheetsApiClient.getAllRows<OrganizationUnit>(GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS);
          if (orgUnits && orgUnits.length > 0) {
            // Process the units to ensure proper types for members and capacity
            const processedUnits = orgUnits.map(unit => ({
              ...unit,
              // Convert members from string to number if present
              members: unit.members ? Number(unit.members) : undefined,
              // Convert capacity from string to number if present
              capacity: unit.capacity ? Number(unit.capacity) : undefined
            }));
            
            setUnits(processedUnits);
            setIsLoading(false);
            return;
          }
        } catch (sheetsError) {
          console.error('Error loading data from Google Sheets:', sheetsError);
        }

        // Try to load from localStorage as fallback
        const savedUnits = localStorage.getItem('organizationUnits');
        if (savedUnits) {
          try {
            const parsedUnits = JSON.parse(savedUnits);
            setUnits(parsedUnits);
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing localStorage data:', parseError);
            localStorage.removeItem('organizationUnits'); // Clear invalid data
          }
        }

        // Create default units if no data exists
        const defaultUnits: OrganizationUnit[] = [
          {
            id: '1',
            name: 'Operations Team',
            type: 'team',
            description: 'Main operations team',
            members: 12,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'North Location',
            type: 'location',
            description: 'North branch operations',
            address: '123 North St, City',
            capacity: 50,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Sales Department',
            type: 'department',
            description: 'Sales and business development',
            members: 8,
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Supervisor',
            type: 'role',
            description: 'Team supervisors',
            level: 'Mid-management',
            createdAt: new Date().toISOString()
          }
        ];
        setUnits(defaultUnits);
        localStorage.setItem('organizationUnits', JSON.stringify(defaultUnits));
      } catch (err) {
        console.error('Error loading organization data:', err);
        setError('Failed to load organization data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, []);

  // Function to add a new unit
  const addUnit = (unit: Omit<OrganizationUnit, 'id' | 'createdAt'>) => {
    try {
      const newUnit: OrganizationUnit = {
        ...unit,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Try to add to Google Sheets
      try {
        const sheetsData: Record<string, any> = {
          ...newUnit,
          // Convert members count to string to avoid formula parsing issues
          members: newUnit.members ? String(newUnit.members) : '0',
          // Convert capacity to string if present
          capacity: newUnit.capacity ? String(newUnit.capacity) : undefined
        };
        
        // Remove undefined fields
        Object.keys(sheetsData).forEach(key => {
          if (sheetsData[key] === undefined) {
            delete sheetsData[key];
          }
        });
        
        sheetsApiClient.addRow(
          GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS,
          sheetsData
        ).catch(err => console.error('Error adding unit to Google Sheets:', err));
      } catch (sheetsError) {
        console.error('Error preparing data for Google Sheets:', sheetsError);
      }
      
      setUnits(prev => [...prev, newUnit]);
      localStorage.setItem('organizationUnits', JSON.stringify([...units, newUnit]));
    } catch (err) {
      console.error('Error adding unit:', err);
      throw new Error('Failed to add unit. Please try again later.');
    }
  };

  // Function to update a unit
  const updateUnit = (id: string, updates: Partial<OrganizationUnit>) => {
    try {
      // Try to update in Google Sheets
      try {
        const sheetsData: Record<string, any> = {
          ...updates,
          // Convert members count to string to avoid formula parsing issues
          members: updates.members ? String(updates.members) : undefined,
          // Convert capacity to string if present
          capacity: updates.capacity ? String(updates.capacity) : undefined
        };
        
        // Remove undefined fields
        Object.keys(sheetsData).forEach(key => {
          if (sheetsData[key] === undefined) {
            delete sheetsData[key];
          }
        });
        
        sheetsApiClient.updateRow(
          GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS,
          id,
          sheetsData
        ).catch(err => console.error('Error updating unit in Google Sheets:', err));
      } catch (sheetsError) {
        console.error('Error preparing data for Google Sheets:', sheetsError);
      }
      
      setUnits(prev => 
        prev.map(unit => 
          unit.id === id ? { ...unit, ...updates } : unit
        )
      );
      localStorage.setItem('organizationUnits', JSON.stringify(units.map(unit => 
        unit.id === id ? { ...unit, ...updates } : unit
      )));
    } catch (err) {
      console.error('Error updating unit:', err);
      throw new Error('Failed to update unit. Please try again later.');
    }
  };

  // Function to delete a unit
  const deleteUnit = (id: string) => {
    try {
      setUnits(prev => prev.filter(unit => unit.id !== id));
      localStorage.setItem('organizationUnits', JSON.stringify(units.filter(unit => unit.id !== id)));
    } catch (err) {
      console.error('Error deleting unit:', err);
      throw new Error('Failed to delete unit. Please try again later.');
    }
  };

  // Function to search units by name or description
  const searchUnits = (query: string): OrganizationUnit[] => {
    if (!query) return units;
    
    const lowerCaseQuery = query.toLowerCase();
    return units.filter(unit => 
      unit.name.toLowerCase().includes(lowerCaseQuery) || 
      unit.description.toLowerCase().includes(lowerCaseQuery)
    );
  };

  // Function to filter units by type
  const filterUnitsByType = (type: UnitType | 'all'): OrganizationUnit[] => {
    if (type === 'all') return units;
    return units.filter(unit => unit.type === type);
  };

  // Function to update member counts for multiple units
  const updateUnitMemberCounts = (unitMemberCounts: Record<string, number>) => {
    try {
      // Create a copy of the units to update
      const updatedUnits = units.map(unit => {
        // If this unit has an updated count, apply it
        if (unitMemberCounts.hasOwnProperty(unit.id)) {
          // Try to update in Google Sheets
          try {
            // Create sheetsData with correct type for the updateRow function
            const sheetsData: Partial<OrganizationUnit> = {
              members: unitMemberCounts[unit.id]
            };
            
            // Use async/await in a separate function to avoid blocking
            (async () => {
              try {
                await sheetsApiClient.updateRow<OrganizationUnit>(
                  GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS,
                  unit.id,
                  sheetsData
                );
              } catch (err) {
                console.error(`Error updating member count for unit ${unit.id} in Google Sheets:`, err);
              }
            })();
          } catch (sheetsError) {
            console.error('Error preparing data for Google Sheets:', sheetsError);
          }
          
          // Return updated unit with new member count
          return {
            ...unit,
            members: unitMemberCounts[unit.id]
          };
        }
        // Return unit unchanged if no new count
        return unit;
      });
      
      // Update state and localStorage
      setUnits(updatedUnits);
      localStorage.setItem('organizationUnits', JSON.stringify(updatedUnits));
    } catch (err) {
      console.error('Error updating unit member counts:', err);
    }
  };

  return (
    <OrganizationContext.Provider value={{
      units,
      isLoading,
      addUnit,
      updateUnit,
      deleteUnit,
      searchUnits,
      filterUnitsByType,
      updateUnitMemberCounts
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
