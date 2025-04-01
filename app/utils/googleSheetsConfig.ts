// This file contains configuration for Google Sheets API
// You'll need to replace these values with your own Google Sheets credentials

export const GOOGLE_SHEETS_CONFIG = {
  // The ID of your Google Sheet (found in the URL of your sheet)
  // Example: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
  SHEET_ID: "14fxw5LHPiKwozImXX8ZwTGvQzNtLmlq-WD6CrNNNpiU",
  
  // Sheet names for different data types
  SHEETS: {
    MEMBERS: "Members",
    ORGANIZATION_UNITS: "OrganizationUnits",
    USER_PROFILES: "UserProfiles",
    ANNOUNCEMENTS: "Announcements"
  },
  
  // Google Service Account credentials
  // You'll need to create a service account and download the JSON credentials
  // See: https://cloud.google.com/iam/docs/creating-managing-service-accounts
  CLIENT_EMAIL: "knowbie-back-user@get-knowbie-dash-test-back.iam.gserviceaccount.com",
  PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDRrechywkh+TMk\nfZgNTkUsnr3uxEqbOzAy7GlgA21TCjtU8bQrsfmcqI3GPfndss0wzbc8HfNJjy+m\nf8d1wAfC92pY3rrwM/tR1lEZ0xALfJl+Hm9Fyg1EhSxwWgPdhTUu0iGwIn6cczwH\n8D8xls9Qe/rkAgaNGm/dbJPRbP2xEaw/PoL95lbN/biToTCmGy17pH7U7DCtAp5P\nLFK79x6PggW//xSKHPlqdKV3q/IlnTJWgUSigxSbWWT/RiNoYM5T9r7H1fREzQIQ\nhmNMKGhTsdeAcwaRf+mgy+DcpgqfGOGmDld8LfJEcmwcjoSBvHsms4LAseLDx/If\nwH2AfYNVAgMBAAECggEACitXguWQf1PRPatTtQ1/QF9AkfR2M9omh8m8gJoZ8sWT\nxBZm6RmcJBNusNcvp6d02TGY+fLv6jjmFDqtR1I1bijGwSGoSl8TCNCOpWR9qjj0\nTtAWEHnws8qLsbVD67n6rtclKCA8KMVT+4SU5AhO7LXeoLFSdQR7uW77KlSRZ0WA\nFL5MZAhYACbfJU+BYSyv7YWVyXDlpmo35yalfz/osoA6XE3ZUfqU6KMKRrZNhcRy\n1cnbbD3QJKRpCNOJrRl3wxJ51N1UJ3S9rJGcTSqpvLRTRax5qHf+TiP6JJg9Wd1a\nUQahCWRqAm43u+NmbOfMvG6uY1TKU9Vw1UrbdD3tgQKBgQD+oTwXB8UM24zGk8iz\ngMJSvCaqnugIsJcPBy+lDTxiI80UdJMAnwwpuTuxH3Ur6rDQLQzqXJanFiOBnWLZ\n+tNCSM4CoccrdQ09o6b0xN1CYZ+NXWq6uEQWrpXXYRjtJ3qIYJdaqdnFMPfFSgvN\nH/UoogFkrZN3K/tE/MmTG5ODlQKBgQDSzr8eafg1z+Y6wO5M2NPfcV2WbxCXq+O9\n4oBPnm1rucwmScEUNshAttL/E5YoCq56tTfZZj3nizTeAeCCCYysGIKBfL9UPt0x\n0MLZoDlQ7Mp9MzOFKHlV2t8mjVw7I2V42m4VLv7PdaP0vMDzCc8+hoO9gT6VbJFN\n1m9iolYQwQKBgQDPGeT99lvXMVs2yEydc0Sadl4cuFKRfs/ecUHXRQSv7d6HnKlU\nAAishvR+A9ARgDl/mKTAmb4O+Hq4mYIlOVVKvFyS13JfbjzuvYS14Mj1jOFw4WJF\nrEn1CNrm6xqTCWEoOyffnfZ55HIiDS+8DxofimUHtgYTD7q3ScPJ2swIYQKBgQCS\nZrbgHmQcqxePMjHM+MCb6xU9xkBVtTBizQyjPrlrGQuog4wtx6XnG5EJSMb9Y/2s\nhnIU7yaKyWibzd3nMU6ariLkXohZr5baY8sObHGhu/EcZhSfo24wq+JR2dZ1061C\n8x+EYrDfzylgbD3sC6H8IFsZnsqh51Y6InQUofz3gQKBgQDVRgO3uvR4KwCZfawB\nc3nyl8PaDe5wKRAjKZ9adFOpGozxtX+QSmpqlu9IjhkhMWg9dB2+1D6U6NQH/BDh\nS9KzeQXr70GKyflgsHBCEYxCF9ry+WFhS+sHheTZ2VWVvLNf/kNoTGwqEEp6dOeR\n/ZU/nHjDE5NpBVKx3Pn1vYhXtA==\n-----END PRIVATE KEY-----\n",
};

// Instructions to set up Google Sheets API:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project
// 3. Enable the Google Sheets API
// 4. Create a service account and download the JSON credentials
// 5. Share your Google Sheet with the service account email (with editor permissions)
// 6. Create sheets with the names defined above
// 7. Update this file with your credentials
