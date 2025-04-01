// Client-side API for interacting with Google Sheets via our API routes
// This file contains no direct Google Sheets dependencies, making it safe for client-side use

// Generic function to get all rows from a sheet
export const getAllRows = async <T>(sheetName: string): Promise<T[]> => {
  try {
    const response = await fetch(`/api/sheets?sheet=${sheetName}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch data');
    }
    
    const result = await response.json();
    return result.data as T[];
  } catch (error: any) {
    console.error(`Error getting rows from ${sheetName}:`, error);
    return [];
  }
};

// Generic function to add a row to a sheet
export const addRow = async <T extends { [key: string]: any }>(
  sheetName: string, 
  data: T
): Promise<T & { id: string }> => {
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        sheetName,
        data,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add row');
    }
    
    const result = await response.json();
    return { ...data, id: result.id } as T & { id: string };
  } catch (error: any) {
    console.error(`Error adding row to ${sheetName}:`, error);
    throw error;
  }
};

// Generic function to update a row in a sheet
export const updateRow = async <T extends { id: string }>(
  sheetName: string, 
  id: string, 
  updates: Partial<T>
): Promise<boolean> => {
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        sheetName,
        id,
        data: updates,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update row');
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error updating row in ${sheetName}:`, error);
    return false;
  }
};

// Generic function to delete a row from a sheet
export const deleteRow = async (
  sheetName: string, 
  id: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'delete',
        sheetName,
        id,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete row');
    }
    
    return true;
  } catch (error: any) {
    console.error(`Error deleting row from ${sheetName}:`, error);
    return false;
  }
};

// Function to initialize the spreadsheet with default data if empty
export const initializeSpreadsheetIfEmpty = async (): Promise<{ success: boolean, message?: string, error?: string }> => {
  try {
    const response = await fetch('/api/sheets?action=initialize');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initialize spreadsheet');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error initializing spreadsheet:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};
