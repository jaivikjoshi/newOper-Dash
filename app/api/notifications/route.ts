import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';
import { Notification } from '@/app/utils/types';
import { mockNotifications } from './mock-data';

export const dynamic = "force-dynamic";

// Initialize auth client if credentials exist
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const NOTIFICATIONS_RANGE = 'Notifications!A2:F';
const USE_MOCK_DATA = !SHEET_ID || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || process.env.NODE_ENV === 'development';

let sheets: any;
let auth: any;

if (!USE_MOCK_DATA) {
  try {
    auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: SCOPES,
    });
    
    sheets = google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    // Will fall back to mock data
  }
}

export async function GET() {
  if (USE_MOCK_DATA) {
    console.log('Using mock notification data');
    return NextResponse.json({ notifications: mockNotifications });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: NOTIFICATIONS_RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications: Notification[] = rows.map((row: any) => ({
      id: row[0] || '',
      title: row[1] || '',
      by: row[2] || '',
      date: row[3] || '',
      isRead: row[4]?.toLowerCase() === 'true',
      text: row[5] || '',
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Fallback to mock data on error
    console.log('Falling back to mock notification data due to error');
    return NextResponse.json({ notifications: mockNotifications });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, markAll } = data;

    if (USE_MOCK_DATA) {
      console.log('Using mock data - marking notification as read (simulation)');
      return NextResponse.json({ success: true });
    }

    if (markAll) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: NOTIFICATIONS_RANGE,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) return NextResponse.json({ success: true });

      // Create an array of 'true' values for each row
      const updateValues = rows.map(() => ['true']);

      // Update all isRead values at once
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Notifications!E2:E${rows.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: updateValues,
        },
      });

      return NextResponse.json({ success: true });
    } else if (id) {
      // Mark single notification as read
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: NOTIFICATIONS_RANGE,
      });

      const rows = response.data.values;
      if (!rows) return NextResponse.json({ success: false }, { status: 404 });

      const rowIndex = rows.findIndex((row: any) => row[0] === id);
      if (rowIndex === -1) return NextResponse.json({ success: false }, { status: 404 });

      // Update the isRead column (column E) for the found row
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Notifications!E${rowIndex + 2}`, // +2 because we start from A2
        valueInputOption: 'RAW',
        requestBody: {
          values: [['true']],
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    
    // Return success in dev mode to avoid breaking the UI
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
} 