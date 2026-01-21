# Configuration Guide - Defect Analyzer Local Server

## 🎯 Quick Reference

| Component | Configuration | Value |
|-----------|---------------|-------|
| **Frontend** | Port | `3000` |
| **Frontend** | Host | `localhost` |
| **Frontend** | URL | `http://localhost:3000` |
| **Backend** | Port | `4000` |
| **Backend** | Host | `localhost` |
| **Backend** | URL | `http://localhost:4000` |
| **API Base** | URL | `http://localhost:4000/api` |
| **Required** | Environment Var | `LOVABLE_API_KEY` |

---

## 🔧 Configuration Files

### 1. Frontend Configuration: `vite.config.ts`

**Current Configuration:**
```typescript
server: {
  host: "::",
  port: 3000,  // ← Changed from 8080
  hmr: {
    overlay: false,
  },
}
```

**To Change Frontend Port:**
Edit `vite.config.ts` and modify the `port` value:
```typescript
port: 5000,  // Change to desired port
```

---

### 2. Backend Configuration: `server/index.ts`

**Current Configuration:**
```typescript
const PORT = 4000;  // ← Can be customized

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**To Change Backend Port:**
Edit `server/index.ts` and modify the `PORT` constant:
```typescript
const PORT = 5000;  // Change to desired port
```

---

### 3. API Client Configuration: `src/integrations/localserver/client.ts`

**Current Configuration:**
```typescript
const API_URL = 'http://localhost:4000';  // ← Points to backend

export const supabase = {
  functions: {
    invoke: (functionName: string, options: { body: any }) =>
      localServer.functions_invoke(functionName, options),
  },
};
```

**To Change Backend URL:**
Edit `src/integrations/localserver/client.ts`:
```typescript
const API_URL = 'http://your-server:port';  // Change to production server
```

---

## 🌍 Environment Variables

### Required
```bash
LOVABLE_API_KEY=your_api_key_here
```

### Optional (Advanced)
```bash
NODE_ENV=development  # or production
DEBUG=*               # Enable debug logging
```

---

## 📋 Endpoint Configuration

### Analyze Report Endpoint
```
POST http://localhost:4000/api/analyze-report
Content-Type: application/json

Request Body:
{
  "testCases": TestCase[],
  "rawContent": string
}

Response:
{
  "failures": FailureAnalysis[],
  "patterns": Pattern[],
  "recommendations": Recommendation[],
  "summary": {
    "total": number,
    "passed": number,
    "failed": number,
    "skipped": number
  }
}
```

### Create JIRA Issue Endpoint
```
POST http://localhost:4000/api/create-jira-issue
Content-Type: application/json

Request Body:
{
  "credentials": {
    "baseUrl": string,
    "email": string,
    "apiKey": string,
    "projectKey": string
  },
  "failure": FailureAnalysis,
  "summary": string,
  "description": string,
  "priority": string
}

Response:
{
  "success": boolean,
  "issueKey": string,
  "issueId": string,
  "issueUrl": string,
  "attachments": string[]
}
```

### Health Check Endpoint
```
GET http://localhost:4000/health

Response:
{
  "status": "ok",
  "port": 4000
}
```

---

## 🚀 Running Modes

### Development Mode (Recommended)

**Frontend:**
```bash
npm run dev
```
Features:
- Hot module reloading
- Source maps
- Detailed error messages

**Backend:**
```bash
cd server
npm run dev
```
Features:
- Auto-restart on file changes
- Console logging
- Easier debugging

### Production Mode

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd server
npm start
```

---

## 🔍 Debugging

### Check Server Health
```bash
curl http://localhost:4000/health
```

### Check Frontend Connection
Open browser console (F12) and verify:
```javascript
fetch('http://localhost:4000/health').then(r => r.json())
```

### Enable Debug Logging
```bash
# Windows
set DEBUG=*
npm run dev

# Linux/Mac
export DEBUG='*'
npm run dev
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action
4. Check requests to `localhost:4000/api/*`

---

## 🔐 Security Considerations

### Development
- CORS enabled for localhost
- No authentication required (assumes local network)
- Direct API calls allowed

### Production
Before deploying to production:
1. **Restrict CORS**
   ```typescript
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

2. **Add Authentication**
   ```typescript
   app.use((req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'Unauthorized' });
     // Verify token...
     next();
   });
   ```

3. **Validate Input**
   ```typescript
   if (!testCases || !Array.isArray(testCases)) {
     return res.status(400).json({ error: 'Invalid input' });
   }
   ```

4. **Use HTTPS**
   ```typescript
   const API_URL = 'https://yourdomain.com/api';
   ```

---

## 📦 Dependency Management

### Frontend Dependencies
```bash
npm install  # Install all dependencies
npm update   # Update packages
npm audit    # Check for vulnerabilities
```

### Backend Dependencies
```bash
cd server
npm install
npm update
npm audit
cd ..
```

---

## 🛠️ Advanced Configuration

### Custom Express Middleware

Edit `server/index.ts` to add custom middleware:

```typescript
// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  next();
});

// Custom headers
app.use((req, res, next) => {
  res.set('X-Custom-Header', 'value');
  next();
});
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Database Connection

For persistent storage, add database connection:

```typescript
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/defect-analyzer');

app.post('/api/save-analysis', async (req, res) => {
  // Save to database
});
```

---

## 🌐 Multi-Machine Setup

### Server on Different Machine
```typescript
// In server/index.ts
app.listen(4000, '0.0.0.0'); // Listen on all interfaces
```

```typescript
// In src/integrations/localserver/client.ts
const API_URL = 'http://192.168.1.100:4000'; // IP of server machine
```

### Using Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package.json .
RUN npm install
COPY server/ .
EXPOSE 4000
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "4000:4000"
    environment:
      - LOVABLE_API_KEY=${LOVABLE_API_KEY}
```

---

## ✅ Verification Checklist

- [ ] Frontend runs on port 3000
- [ ] Backend runs on port 4000
- [ ] LOVABLE_API_KEY is set
- [ ] Both servers are accessible
- [ ] Health check returns 200 OK
- [ ] File upload works
- [ ] AI analysis works
- [ ] JIRA integration configured (optional)
- [ ] No CORS errors in console
- [ ] Network requests show 200/201 responses

---

## 📞 Support Resources

- **Issues**: Check server console for error messages
- **Ports**: Verify with `netstat -ano | findstr :PORT` (Windows)
- **API**: Test with `curl` or Postman
- **Logs**: Both servers print detailed logs to console
- **Files**: Review generated files in the workspace

---

**Last Updated:** January 21, 2026
**Version:** 1.0.0
