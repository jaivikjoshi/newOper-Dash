import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from './googleSheetsConfig';

// Create a new JWT client using the service account credentials
const getAuthClient = () => {
  return new JWT({
    email: GOOGLE_SHEETS_CONFIG.CLIENT_EMAIL,
    key: GOOGLE_SHEETS_CONFIG.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Get the Google Spreadsheet instance
export const getSpreadsheet = async () => {
  try {
    const authClient = getAuthClient();
    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.SHEET_ID, authClient);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('Error loading spreadsheet:', error);
    throw error;
  }
};

// Generic function to get all rows from a sheet
export const getAllRows = async <T>(sheetName: string): Promise<T[]> => {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      console.error(`Sheet "${sheetName}" not found`);
      return [];
    }
    
    const rows = await sheet.getRows();
    return rows.map((row, index) => {
      // Create a new object for the row data with an id property
      // Use the index as a fallback if no id column exists
      const rowData: any = { 
        id: row.get('id') || `row-${index + 1}` 
      };
      
      // Get all properties from the row
      sheet.headerValues.forEach(header => {
        if (header !== 'id') {
          let value = row.get(header);
          
          // Try to parse JSON for array or object fields
          if (value && (value.startsWith('[') || value.startsWith('{'))) {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // If parsing fails, keep the original string
            }
          }
          
          rowData[header] = value;
        }
      });
      
      return rowData as T;
    });
  } catch (error) {
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
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    // Process data to handle arrays and objects
    const rowData: { [key: string]: string } = {};
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        rowData[key] = JSON.stringify(value);
      } else {
        rowData[key] = String(value);
      }
    });
    
    // Add id if not present
    if (!rowData.id) {
      rowData.id = Date.now().toString();
    }
    
    await sheet.addRow(rowData);
    
    return { ...data, id: rowData.id } as T & { id: string };
  } catch (error) {
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
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row.get('id') === id);
    
    if (!rowToUpdate) {
      console.error(`Row with id ${id} not found in ${sheetName}`);
      return false;
    }
    
    // Update the row with new values
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        rowToUpdate.set(key, JSON.stringify(value));
      } else {
        rowToUpdate.set(key, String(value));
      }
    });
    
    await rowToUpdate.save();
    return true;
  } catch (error) {
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
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row.get('id') === id);
    
    if (!rowToDelete) {
      console.error(`Row with id ${id} not found in ${sheetName}`);
      return false;
    }
    
    await rowToDelete.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting row from ${sheetName}:`, error);
    return false;
  }
};

// Function to initialize the spreadsheet with default data if empty
export const initializeSpreadsheetIfEmpty = async () => {
  try {
    const doc = await getSpreadsheet();
    
    // Check each sheet and initialize with default data if empty
    for (const [key, sheetName] of Object.entries(GOOGLE_SHEETS_CONFIG.SHEETS)) {
      let sheet = doc.sheetsByTitle[sheetName];
      
      // If sheet doesn't exist, create it
      if (!sheet) {
        sheet = await doc.addSheet({ title: sheetName });
        console.log(`Created sheet: ${sheetName}`);
        
        // Add headers based on the sheet type
        switch (sheetName) {
          case GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS:
            await sheet.setHeaderRow(['id', 'name', 'email', 'roles', 'units', 'status', 'createdAt']);
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS:
            await sheet.setHeaderRow(['id', 'name', 'type', 'description', 'members', 'address', 'capacity', 'level', 'createdAt']);
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES:
            await sheet.setHeaderRow(['id', 'name', 'email', 'phone', 'businessName', 'businessType', 'website', 'location', 'plan', 'createdAt']);
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS:
            await sheet.setHeaderRow(['id', 'title', 'content', 'createdAt', 'isActive', 'scheduledFor']);
            break;
        }
      }
      
      // Check if sheet is empty (only has headers)
      const rows = await sheet.getRows();
      if (rows.length === 0) {
        // Add sample data based on sheet type
        switch (sheetName) {
          case GOOGLE_SHEETS_CONFIG.SHEETS.MEMBERS:
            await sheet.addRow({
              id: '1',
              name: 'John Admin',
              email: 'john@example.com',
              roles: JSON.stringify(['Administrator']),
              units: JSON.stringify(['1', '2']),
              status: 'active',
              createdAt: new Date().toISOString()
            });
            await sheet.addRow({
              id: '2',
              name: 'Sarah Manager',
              email: 'sarah@example.com',
              roles: JSON.stringify(['Manager']),
              units: JSON.stringify(['1']),
              status: 'active',
              createdAt: new Date().toISOString()
            });
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS:
            await sheet.addRow({
              id: '1',
              name: 'Operations Team',
              type: 'team',
              description: 'Main operations team',
              members: '12',
              createdAt: new Date().toISOString()
            });
            await sheet.addRow({
              id: '2',
              name: 'North Location',
              type: 'location',
              description: 'North branch operations',
              address: '123 North St, City',
              capacity: '50',
              createdAt: new Date().toISOString()
            });
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES:
            await sheet.addRow({
              id: '1',
              name: 'Jake Smith',
              email: 'jake.smith@example.com',
              phone: '+1 (555) 123-4567',
              businessName: 'State Farm Co',
              businessType: 'Insurance',
              website: 'https://statefarm.example.com',
              location: '123 Main St, Anytown, USA',
              plan: 'free',
              createdAt: new Date().toISOString()
            });
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS:
            await sheet.addRow({
              id: '1',
              title: 'Welcome to our platform',
              content: 'Thank you for joining our platform. We are excited to have you on board!',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: 'true'
            });
            await sheet.addRow({
              id: '2',
              title: 'New features coming soon',
              content: 'We are working on exciting new features that will be released next month.',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: 'true'
            });
            break;
        }
        console.log(`Initialized sheet with sample data: ${sheetName}`);
      }
    }
    
    console.log('Spreadsheet initialization complete');
  } catch (error) {
    console.error('Error initializing spreadsheet:', error);
  }
};
