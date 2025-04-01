# Setting Up Google Sheets as a Backend

This guide will help you set up Google Sheets as a temporary backend for your Next.js application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API for your project
   - Search for "Google Sheets API" in the search bar
   - Click on the API and click "Enable"

## Step 2: Create a Service Account

1. In your Google Cloud project, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name for your service account (e.g., "nextjs-sheets-backend")
4. Click "Create and Continue"
5. Grant the role "Editor" to your service account
6. Click "Continue" and then "Done"

## Step 3: Create and Download Service Account Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type
5. Click "Create"
6. The key file will be downloaded to your computer

## Step 4: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Rename the spreadsheet to something meaningful (e.g., "NextJS App Backend")
4. Note the spreadsheet ID from the URL:
   - The URL will look like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part

## Step 5: Share the Spreadsheet with Your Service Account

1. In your Google Sheet, click the "Share" button
2. Enter the email address of your service account (found in the service account details)
3. Make sure to give "Editor" access
4. Uncheck "Notify people" and click "Share"

## Step 6: Configure Your Application

1. Open the `/app/utils/googleSheetsConfig.ts` file
2. Update the following values:
   - `SHEET_ID`: The ID of your Google Sheet from Step 4
   - `CLIENT_EMAIL`: The email address of your service account
   - `PRIVATE_KEY`: The private key from the JSON file downloaded in Step 3

Example:
```typescript
export const GOOGLE_SHEETS_CONFIG = {
  SHEET_ID: "1a2b3c4d5e6f7g8h9i0j...",
  SHEETS: {
    MEMBERS: "Members",
    ORGANIZATION_UNITS: "OrganizationUnits",
    USER_PROFILES: "UserProfiles",
    ANNOUNCEMENTS: "Announcements"
  },
  CLIENT_EMAIL: "your-service-account@your-project.iam.gserviceaccount.com",
  PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nYour private key here...\n-----END PRIVATE KEY-----\n",
};
```

## Step 7: Initialize Your Spreadsheet

The first time your application runs, it will automatically create the necessary sheets and populate them with sample data. You can modify this behavior in the `googleSheetsService.ts` file.

## Security Notes

- **IMPORTANT**: Never commit your service account credentials to version control
- Consider using environment variables for sensitive information
- For production, implement proper authentication and authorization

## Troubleshooting

If you encounter issues:

1. Make sure the Google Sheets API is enabled
2. Verify that your service account has Editor access to the spreadsheet
3. Check that your credentials are correctly formatted in the config file
4. Look for error messages in the browser console or server logs

## Limitations

- This setup is intended for development and testing
- For production use, consider a more robust database solution
- Google Sheets has API rate limits that may affect performance with high traffic
