# Defect Analyzer - Local Server Setup

This document explains how to set up and run the Defect Analyzer application with a local Node.js server instead of Supabase.

## Architecture

- **Frontend**: React + TypeScript + Vite running on `http://localhost:3000`
- **Backend**: Node.js + Express server running on `http://localhost:4000`
- **AI Service**: Lovable AI Gateway (requires API key)
- **External Services**: JIRA integration (optional)

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn** or **bun** (for package management)
3. **LOVABLE_API_KEY** environment variable (required for AI analysis features)

## Installation

### Step 1: Install Frontend Dependencies

```bash
cd d:\Balaji\Office Hackathon\Defect Analyser backup\Latest defect agent\test-root-cause-assistant-d7bc9bb0
npm install
# or
yarn install
# or
bun install
```

### Step 2: Install Server Dependencies

```bash
# Copy the server package.json to the server directory
copy server-package.json server\package.json

# Install server dependencies
cd server
npm install
cd ..
```

### Step 3: Set Environment Variables

Create a `.env` file in the server directory or set the environment variable:

**Windows (Command Prompt):**
```cmd
set LOVABLE_API_KEY=your_api_key_here
```

**Windows (PowerShell):**
```powershell
$env:LOVABLE_API_KEY='your_api_key_here'
```

**Linux/Mac:**
```bash
export LOVABLE_API_KEY='your_api_key_here'
```

Or create a `.env` file in the root directory and use a package like `dotenv`.

## Running the Application

### Option 1: Run Both Services in Separate Terminals

**Terminal 1 - Start the Backend Server:**
```bash
cd server
npm start
# Or for development with auto-reload:
npm run dev
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

### Option 2: Run with a Process Manager

You can use `concurrently` or `npm-run-all` to run both servers together:

```bash
npm install --save-dev concurrently
```

Then add to `package.json`:
```json
"scripts": {
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "dev:client": "vite",
  "dev:server": "cd server && npm start"
}
```

## Port Configuration

- **Frontend**: `http://localhost:3000` (configured in `vite.config.ts`)
- **Backend**: `http://localhost:4000` (configured in `server/index.ts`)

To change ports, edit:
- Frontend: `vite.config.ts` → `server.port`
- Backend: `server/index.ts` → `PORT` constant

## API Endpoints

### Analyze Report
**POST** `http://localhost:4000/api/analyze-report`

Request body:
```json
{
  "testCases": [...],
  "rawContent": "report content as string"
}
```

### Create JIRA Issue
**POST** `http://localhost:4000/api/create-jira-issue`

Request body:
```json
{
  "credentials": {
    "baseUrl": "https://your-jira-instance.atlassian.net",
    "email": "your-email@example.com",
    "apiKey": "your-jira-api-key",
    "projectKey": "PROJECT"
  },
  "failure": {...},
  "summary": "Issue summary",
  "description": "Issue description",
  "priority": "High"
}
```

### Health Check
**GET** `http://localhost:4000/health`

## File Structure Changes

```
src/
  integrations/
    localserver/
      client.ts          # NEW: Local server client (replaces supabase)
    supabase/            # Original Supabase files (kept for reference)

server/
  index.ts              # NEW: Express server implementation
  package.json          # NEW: Server dependencies

vite.config.ts          # UPDATED: Port changed from 8080 to 3000
```

## Import Changes

The following imports have been updated:

**Before:**
```typescript
import { supabase } from '@/integrations/supabase/client';
```

**After:**
```typescript
import { supabase } from '@/integrations/localserver/client';
```

Files updated:
- `src/pages/Index.tsx`
- `src/components/CreateJiraIssueButton.tsx`

## Troubleshooting

### Server not connecting
- Ensure the backend is running on port 4000
- Check LOVABLE_API_KEY environment variable is set
- Verify firewall allows localhost:4000 connection

### AI Analysis failing
- Verify LOVABLE_API_KEY is valid and has credits
- Check network connectivity
- Review server logs for detailed error messages

### JIRA Integration not working
- Verify JIRA credentials are correct
- Ensure API key has necessary permissions
- Check JIRA instance URL is accessible from your network

### Port already in use
- Frontend: Change `vite.config.ts` → `server.port`
- Backend: Change `server/index.ts` → `PORT`
- Or kill existing processes on those ports

## Development Notes

- The local server maintains API compatibility with the original Supabase functions
- CORS is enabled for local development
- Both JSON and form data are supported for file uploads
- Server uses the same Lovable AI Gateway as the original implementation

## Building for Production

```bash
# Build frontend
npm run build

# For production, use a proper server setup with process manager (PM2, Forever, etc.)
# Update API_URL in src/integrations/localserver/client.ts to production server URL
```

## Additional Resources

- [Lovable AI Gateway Documentation](https://docs.lovable.dev)
- [Express.js Documentation](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
