import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { GOOGLE_SHEETS_CONFIG } from '../../utils/googleSheetsConfig';

// Create a new JWT client using the service account credentials
const getAuthClient = () => {
  return new JWT({
    email: GOOGLE_SHEETS_CONFIG.CLIENT_EMAIL,
    key: GOOGLE_SHEETS_CONFIG.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Get the Google Spreadsheet instance
const getSpreadsheet = async () => {
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

// Initialize the spreadsheet with default data if empty
const initializeSpreadsheetIfEmpty = async () => {
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
            await sheet.setHeaderRow(['id', 'name', 'email', 'roles', 'units', 'unit', 'status', 'createdAt']);
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.ORGANIZATION_UNITS:
            await sheet.setHeaderRow(['id', 'name', 'type', 'description', 'members', 'address', 'capacity', 'level', 'createdAt']);
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.USER_PROFILES:
            await sheet.setHeaderRow([
              'id', 
              'name', 
              'email', 
              'phone', 
              'businessName', 
              'businessType', 
              'website', 
              'location', 
              'plan', 
              'role', 
              'locationCount', 
              'employeeCount', 
              'onboardingCompleted',
              'onboardingCompletedAt',
              'createdAt'
            ]);
            break;
          case GOOGLE_SHEETS_CONFIG.SHEETS.ANNOUNCEMENTS:
            await sheet.setHeaderRow([
              'id', 
              'title', 
              'content', 
              'createdAt', 
              'isActive', 
              'scheduledFor', 
              'type', 
              'isPremium', 
              'attachments'
            ]);
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
              isActive: 'true',
              type: 'basic',
              isPremium: 'false',
              attachments: '[]'
            });
            await sheet.addRow({
              id: '2',
              title: 'New features coming soon',
              content: 'We are working on exciting new features that will be released next month.',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              isActive: 'true',
              type: 'scheduled',
              scheduledFor: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              isPremium: 'false',
              attachments: '[]'
            });
            break;
        }
        console.log(`Initialized sheet with sample data: ${sheetName}`);
      }
    }
    
    return { success: true, message: 'Spreadsheet initialization complete' };
  } catch (error: any) {
    console.error('Error initializing spreadsheet:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

// GET handler for fetching data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sheetName = searchParams.get('sheet');
    
    if (action === 'initialize') {
      const result = await initializeSpreadsheetIfEmpty();
      return NextResponse.json(result);
    }
    
    if (!sheetName) {
      return NextResponse.json({ error: 'Sheet name is required' }, { status: 400 });
    }
    
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      return NextResponse.json({ error: `Sheet "${sheetName}" not found` }, { status: 404 });
    }
    
    const rows = await sheet.getRows();
    const data = rows.map((row, index) => {
      const rowData: any = { 
        id: row.get('id') || `row-${index + 1}` 
      };
      
      sheet.headerValues.forEach(header => {
        if (header !== 'id') {
          let value = row.get(header);
          
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
      
      return rowData;
    });
    
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}

// POST handler for adding/updating/deleting data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sheetName, data, id } = body;
    
    if (!sheetName) {
      return NextResponse.json({ error: 'Sheet name is required' }, { status: 400 });
    }
    
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      return NextResponse.json({ error: `Sheet "${sheetName}" not found` }, { status: 404 });
    }
    
    switch (action) {
      case 'add': {
        if (!data) {
          return NextResponse.json({ error: 'Data is required for add action' }, { status: 400 });
        }
        
        // Process data to handle arrays and objects
        const rowData: { [key: string]: string } = {};
        Object.entries(data).forEach(([key, value]) => {
          // Skip undefined or null values to avoid storing empty values
          if (value === undefined || value === null) {
            return;
          }
          
          // Special handling for phone numbers to prevent Google Sheets formula/parsing errors
          if (key === 'phone') {
            // Add a single quote prefix to force Google Sheets to treat as text
            rowData[key] = `'${String(value)}`;
            return;
          }
          
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            rowData[key] = JSON.stringify(value);
          } else {
            // Convert all other values to strings, including empty strings
            rowData[key] = String(value);
          }
        });
        
        // Add id if not present
        if (!rowData.id) {
          rowData.id = Date.now().toString();
        }
        
        await sheet.addRow(rowData);
        return NextResponse.json({ success: true, id: rowData.id });
      }
      
      case 'update': {
        if (!id) {
          return NextResponse.json({ error: 'ID is required for update action' }, { status: 400 });
        }
        
        if (!data) {
          return NextResponse.json({ error: 'Data is required for update action' }, { status: 400 });
        }
        
        const rows = await sheet.getRows();
        const rowToUpdate = rows.find(row => row.get('id') === id);
        
        if (!rowToUpdate) {
          return NextResponse.json({ error: `Row with id ${id} not found` }, { status: 404 });
        }
        
        // Update the row with new values
        Object.entries(data).forEach(([key, value]) => {
          // Skip undefined or null values to avoid overwriting with empty values
          if (value === undefined || value === null) {
            return;
          }
          
          // Special handling for phone numbers to prevent Google Sheets formula/parsing errors
          if (key === 'phone') {
            // Add a single quote prefix to force Google Sheets to treat as text
            rowToUpdate.set(key, `'${String(value)}`);
            return;
          }
          
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            rowToUpdate.set(key, JSON.stringify(value));
          } else {
            // Convert all other values to strings, including empty strings
            rowToUpdate.set(key, String(value));
          }
        });
        
        await rowToUpdate.save();
        return NextResponse.json({ success: true });
      }
      
      case 'delete': {
        if (!id) {
          return NextResponse.json({ error: 'ID is required for delete action' }, { status: 400 });
        }
        
        const rows = await sheet.getRows();
        const rowToDelete = rows.find(row => row.get('id') === id);
        
        if (!rowToDelete) {
          return NextResponse.json({ error: `Row with id ${id} not found` }, { status: 404 });
        }
        
        await rowToDelete.delete();
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}
