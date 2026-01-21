# 🏗️ Architecture & System Diagrams

## System Architecture

### Current Implementation (Local Server)

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Frontend Application                                   │    │
│  │  React + TypeScript + Tailwind CSS                      │    │
│  │  Running on http://localhost:3000                       │    │
│  │                                                          │    │
│  │  Components:                                            │    │
│  │  • File Upload Interface                                │    │
│  │  • Analysis Results Display                             │    │
│  │  • JIRA Integration Dialog                              │    │
│  │  • Settings Panel                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                     │
│                              │ HTTP (JSON)                        │
│                              ↓                                     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ http://localhost:3000
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                      LOCAL SERVER                                │
│                  Node.js + Express.js                            │
│              Running on http://localhost:4000                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  API Routes:                                         │       │
│  │                                                      │       │
│  │  POST /api/analyze-report                           │       │
│  │  ├─ Parse test cases                                │       │
│  │  ├─ Call Lovable AI Gateway                         │       │
│  │  └─ Return analysis results                         │       │
│  │                                                      │       │
│  │  POST /api/create-jira-issue                        │       │
│  │  ├─ Validate JIRA credentials                       │       │
│  │  ├─ Call JIRA REST API                              │       │
│  │  └─ Return issue key & URL                          │       │
│  │                                                      │       │
│  │  GET /health                                        │       │
│  │  └─ Return server status                            │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Dependencies:                                       │       │
│  │  • Express.js (HTTP server)                         │       │
│  │  • CORS (Cross-Origin Resource Sharing)             │       │
│  │  • Axios (HTTP client)                              │       │
│  │  • TypeScript (Type safety)                         │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
        │                                    │
        │ HTTPS                              │ HTTPS
        ↓                                    ↓
┌──────────────────────┐          ┌──────────────────────┐
│  Lovable AI Gateway  │          │   JIRA REST API      │
│                      │          │                      │
│  • AI Analysis       │          │  • Create Issues     │
│  • Gemini Model      │          │  • Update Issues     │
│  • Natural Language  │          │  • Attach Files      │
│  Processing          │          │  • List Projects     │
└──────────────────────┘          └──────────────────────┘
```

---

## Data Flow Diagram

### Test Report Analysis Flow

```
User
  │
  ├─ 1. Select Report File
  │       ↓
  ├─ 2. Upload to Frontend
  │       ↓ (HTTP POST)
  ├─ 3. Frontend sends to Backend:4000/api/analyze-report
  │       ↓
  └─→ Backend:
        │
        ├─ 1. Parse request body
        │     (testCases[], rawContent)
        │       ↓
        ├─ 2. Validate input
        │     Check for required fields
        │       ↓
        ├─ 3. Build AI prompt
        │     System + user messages
        │       ↓
        ├─ 4. Call Lovable AI Gateway
        │     HTTPS POST request
        │       ↓
        ├─ 5. Parse AI response
        │     Extract JSON
        │       ↓
        ├─ 6. Enrich data
        │     Add test case details
        │       ↓
        └─ 7. Return to Frontend
              ├─ failures: FailureAnalysis[]
              ├─ patterns: Pattern[]
              ├─ recommendations: Recommendation[]
              └─ summary: Summary
                  │
                  ├─ 8. Display Results
                  │     on UI
                  │
                  └─ 9. User can
                      create JIRA
                      issues
```

### JIRA Issue Creation Flow

```
User clicks "Create Issue"
  │
  ├─ 1. Open JIRA Dialog
  │     Pre-populated with:
  │     • Summary
  │     • Description
  │     • Priority
  │       ↓
  ├─ 2. User edits (optional)
  │       ↓
  ├─ 3. User clicks "Create"
  │       ↓ (HTTP POST)
  ├─ 4. Frontend sends to Backend:4000/api/create-jira-issue
  │       ├─ credentials (baseUrl, email, apiKey, projectKey)
  │       ├─ failure (test case + analysis)
  │       ├─ summary
  │       ├─ description
  │       └─ priority
  │       ↓
  └─→ Backend:
        │
        ├─ 1. Validate credentials
        │       ↓
        ├─ 2. Create auth header
        │     Basic <base64(email:apiKey)>
        │       ↓
        ├─ 3. Build JIRA issue payload
        │     {
        │       fields: {
        │         project: { key }
        │         summary: string
        │         description: ADF
        │         issuetype: Bug
        │         priority: string
        │         labels: []
        │       }
        │     }
        │       ↓
        ├─ 4. POST to JIRA REST API
        │     /rest/api/3/issue
        │       ↓
        ├─ 5. Get issueKey & issueId
        │       ↓
        ├─ 6. Attach screenshots (if any)
        │     POST /rest/api/3/issue/{issueKey}/attachments
        │       ↓
        └─ 7. Return response
              ├─ issueKey
              ├─ issueId
              ├─ issueUrl
              └─ attachments[]
                  │
                  ├─ 8. Show success toast
                  │
                  ├─ 9. Display issue link
                  │     (clickable)
                  │
                  └─ 10. User can open
                       in JIRA
```

---

## Component Architecture

```
App (Root)
│
├─ Header
│  ├─ Title
│  └─ Navigation
│
├─ FileUpload
│  ├─ Drag & drop area
│  └─ File input
│
├─ Tabs (main-tabs)
│  │
│  ├─ Tab 1: Analysis Results
│  │  └─ AnalysisSummary
│  │     ├─ Test statistics
│  │     └─ Summary cards
│  │
│  ├─ Tab 2: Failures
│  │  └─ FailureCard (array)
│  │     ├─ Test name & status
│  │     ├─ Root cause
│  │     ├─ Category badge
│  │     ├─ Evidence
│  │     └─ CreateJiraIssueButton
│  │
│  └─ Tab 3: Recommendations
│     └─ RecommendationsPanel
│        ├─ Priority section
│        └─ Action items
│
└─ Dialogs
   ├─ JiraSettingsDialog
   │  ├─ Base URL input
   │  ├─ Email input
   │  ├─ API Key input
   │  └─ Project Key input
   │
   └─ CreateJiraIssueButton
      └─ Issue editing dialog
         ├─ Summary
         ├─ Priority dropdown
         └─ Description
```

---

## State Management Flow

```
Frontend State:

┌─────────────────────────────────┐
│    Index.tsx (Main Page)        │
│                                 │
│  State:                         │
│  • result: AnalysisResult       │
│  • isLoading: boolean           │
│  • stage: 'parsing' | ...       │
│  • fileName: string             │
│                                 │
│  Props Flow:                    │
│  ├─ result → AnalysisSummary    │
│  ├─ result → FailureCard(array) │
│  ├─ result → RecommendationsPanel
│  ├─ isLoading → AnalysisLoader  │
│  └─ failures → CreateJiraButton │
│                                 │
└─────────────────────────────────┘

CreateJiraIssueButton State:

┌─────────────────────────────────┐
│  CreateJiraIssueButton.tsx      │
│                                 │
│  State:                         │
│  • open: boolean                │
│  • isCreating: boolean          │
│  • createdIssue: {key, url}     │
│  • formData: {summary, ...}     │
│                                 │
│  Effects:                       │
│  • Fetch credentials from      │
│    localStorage                 │
│  • Show/hide dialogs            │
│  • Handle form submission       │
│                                 │
└─────────────────────────────────┘

JiraSettingsDialog State:

┌─────────────────────────────────┐
│  JiraSettingsDialog.tsx         │
│                                 │
│  Storage:                       │
│  localStorage['jira-creds']     │
│  {                              │
│    baseUrl: string              │
│    email: string                │
│    apiKey: string               │
│    projectKey: string           │
│  }                              │
│                                 │
└─────────────────────────────────┘
```

---

## Request/Response Cycle

### Analyze Report

```
REQUEST:
┌─────────────────────────────────┐
│  POST /api/analyze-report       │
│                                 │
│  Content-Type: application/json │
│                                 │
│  Body:                          │
│  {                              │
│    testCases: [                 │
│      {                          │
│        id: string               │
│        name: string             │
│        className: string        │
│        status: 'fail'|'pass'|... │
│        duration: number         │
│        errorMessage?: string    │
│        stackTrace?: string      │
│      }                          │
│    ]                            │
│    rawContent: string           │
│  }                              │
└─────────────────────────────────┘
                ↓
         (Processing)
                ↓
RESPONSE:
┌─────────────────────────────────┐
│  HTTP 200 OK                    │
│                                 │
│  Content-Type: application/json │
│                                 │
│  Body:                          │
│  {                              │
│    extractedTests: [...]        │
│    failures: [                  │
│      {                          │
│        testId: string           │
│        rootCause: string        │
│        category: string         │
│        confidence: string       │
│        evidence: string[]       │
│        suggestedFix: string     │
│        testCase: {...}          │
│      }                          │
│    ]                            │
│    patterns: [...]              │
│    recommendations: [...]       │
│    summary: {                   │
│      total: number              │
│      passed: number             │
│      failed: number             │
│      skipped: number            │
│    }                            │
│  }                              │
└─────────────────────────────────┘
```

---

## File Organization

```
src/
│
├── components/
│   ├── AnalysisLoader.tsx         ← Loading spinner
│   ├── AnalysisSummary.tsx        ← Summary cards
│   ├── CreateJiraIssueButton.tsx  ← JIRA button & dialog
│   ├── FailureCard.tsx            ← Single failure display
│   ├── FileUpload.tsx             ← File upload area
│   ├── Header.tsx                 ← Header with title
│   ├── JiraSettingsDialog.tsx     ← JIRA credentials
│   ├── NavLink.tsx                ← Navigation helper
│   ├── RecommendationsPanel.tsx   ← Recommendations view
│   └── ui/                        ← shadcn/ui components
│
├── integrations/
│   ├── localserver/
│   │   └── client.ts              ← NEW: API client
│   └── supabase/ (kept for ref)
│       ├── client.ts
│       └── types.ts
│
├── lib/
│   ├── parseReport.ts             ← Report parsing
│   └── utils.ts                   ← Utility functions
│
├── pages/
│   ├── Index.tsx                  ← Main page (updated)
│   └── NotFound.tsx               ← 404 page
│
├── types/
│   └── analysis.ts                ← TypeScript types
│
└── App.tsx, main.tsx, etc.
```

---

## API Endpoint Mapping

```
Frontend                          Backend                   External
Request                           Handler                   Service
│                                 │                         │
├─ POST /api/                  ┌─→ POST /api/           ┌─→ Lovable AI
│  analyze-report              │   analyze-report       │   Gateway
│                              │                        │
│  {testCases[], rawContent}   │  1. Validate          │   • Call API
│                              │  2. Build prompt      │   • Get analysis
└─→                            │  3. Call Lovable      │   • Parse JSON
                               │  4. Enrich data      └────────────
                               │  5. Return
                               └─→

├─ POST /api/                  ┌─→ POST /api/           ┌─→ JIRA REST
│  create-jira-issue           │   create-jira-issue    │   API
│                              │                        │
│  {credentials, failure, ...} │  1. Validate creds    │   • Create issue
│                              │  2. Auth header       │   • Attach files
└─→                            │  3. Build payload     │   • Get key
                               │  4. Call JIRA        └────────────
                               │  5. Return key
                               └─→

└─ GET /health                 ┌─→ GET /health
   (optional)                  │
                               │  Return: {status, port}
                               └─→
```

---

## Environment & Configuration

```
User's System
│
├─ Environment Variables
│  ├─ LOVABLE_API_KEY (required)
│  ├─ NODE_ENV (optional)
│  └─ PORT (optional)
│
├─ Frontend Configuration
│  └─ vite.config.ts
│     └─ server.port = 3000
│
├─ Backend Configuration
│  └─ server/index.ts
│     └─ const PORT = 4000
│
└─ API Client Configuration
   └─ src/integrations/localserver/client.ts
      └─ const API_URL = 'http://localhost:4000'
```

---

## Browser to Server Communication

```
User (Browser)
│
├─ Opens: http://localhost:3000
│    ↓
├─ Vite Dev Server
│    ├─ Serves React app
│    ├─ Hot module reload
│    └─ Dev tools
│    ↓
├─ React App Loaded
│    ├─ Renders components
│    ├─ Sets up event listeners
│    └─ Ready for user interaction
│    ↓
├─ User Uploads Report
│    ├─ FileUpload captures file
│    ├─ Parses report locally
│    └─ Prepares request
│    ↓
├─ Frontend Calls Backend
│    └─ fetch('http://localhost:4000/api/analyze-report', {
│         method: 'POST',
│         body: JSON.stringify({testCases, rawContent})
│       })
│    ↓
└─ Backend Processing
    ├─ Express receives request
    ├─ Validates input
    ├─ Calls Lovable AI
    ├─ Processes response
    └─ Sends result back
         ↓
    Response arrives at Frontend
    ├─ Parses JSON
    ├─ Updates state
    └─ Renders results
```

---

## Technology Stack

```
Frontend
├─ React 18
├─ TypeScript
├─ Vite (dev server)
├─ Tailwind CSS
├─ shadcn/ui (components)
├─ React Router
├─ React Hook Form
├─ TanStack Query
└─ Lucide Icons

Backend
├─ Node.js
├─ Express.js
├─ TypeScript
├─ ts-node
└─ Axios (HTTP client)

External
├─ Lovable AI Gateway (via HTTPS)
└─ JIRA REST API (via HTTPS)
```

---

## Deployment Architecture (Future)

```
Production Setup:

┌────────────────────────────────────┐
│      Reverse Proxy (Nginx)         │
│      Port: 80 (HTTP)               │
│      Port: 443 (HTTPS)             │
└────────────┬───────────────────────┘
             │
        ┌────┴────┐
        ↓         ↓
┌─────────────┐ ┌──────────────┐
│  Frontend   │ │   Backend    │
│  Server     │ │   Server     │
│  (Node)     │ │   (Node)     │
│  Port: 3000 │ │   Port: 4000 │
└─────────────┘ └──────────────┘
        │              │
        └──────┬───────┘
               ↓
      ┌─────────────────┐
      │    Database     │
      │  (Optional)     │
      │  MongoDB/PG     │
      └─────────────────┘
```

---

**Diagrams Created**: January 21, 2026  
**Version**: 1.0.0  
**Status**: ✅ Complete
