# Setting Up Google OAuth for Your Chat Application

To fix the "401: invalid_client" error when using Google Sign-In, you need to set up proper Google OAuth credentials. Follow these steps:

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page and select "New Project"
3. Give your project a name (e.g., "Chat App") and click "Create"
4. Select your new project from the project dropdown

## Step 2: Configure the OAuth Consent Screen

1. In the left sidebar, navigate to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace organization)
3. Click "Create"
4. Fill in the required fields:
   - App name: Your app name (e.g., "Chat App")
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes" and add:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click "Save and Continue"
8. Add test users if needed, then click "Save and Continue"
9. Review your settings and click "Back to Dashboard"

## Step 3: Create OAuth Client ID

1. In the left sidebar, navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. For Application type, select "Web application"
4. Name: Give it a name (e.g., "Chat App Web Client")
5. Authorized JavaScript origins: Add `http://localhost:3000`
6. Authorized redirect URIs: Add `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. You'll see a popup with your Client ID and Client Secret. Copy these values.

## Step 4: Update Your .env File

1. Open the `.env` file in your project
2. Replace the placeholder values with your actual credentials:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```
3. Save the file

## Step 5: Restart Your Application

1. Stop your application if it's running
2. Run `npm run dev` to start it again
3. Try the Google Sign-In again - it should work now!

## Troubleshooting

If you still encounter issues:
- Make sure the redirect URI in Google Cloud Console exactly matches your application's callback URL
- Check that you've enabled the necessary APIs in Google Cloud Console
- Verify that your OAuth consent screen is properly configured
- Ensure your .env file is being loaded correctly

For production deployment, you'll need to:
1. Update the authorized origins and redirect URIs in Google Cloud Console
2. Update the NEXTAUTH_URL in your .env file to match your production URL
3. Publish your OAuth consent screen if you want to allow any Google user to sign in 