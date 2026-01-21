# 🚀 Quick Start Guide

## What Has Changed?
✅ **Frontend port**: 8080 → **3000**
✅ **Backend**: Supabase → **Local Node.js server (port 4000)**
✅ **UI**: **Completely unchanged**

---

## ⚡ 5-Minute Setup

### 1️⃣ Install Dependencies (2 minutes)
```bash
npm install
cd server && npm install && cd ..
```

### 2️⃣ Set API Key (30 seconds)
```bash
# Windows (Command Prompt)
set LOVABLE_API_KEY=your_api_key_here

# Windows (PowerShell)
$env:LOVABLE_API_KEY='your_api_key_here'

# Linux/Mac
export LOVABLE_API_KEY='your_api_key_here'
```

### 3️⃣ Start Everything (30 seconds)
**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Or Manually (2 terminals):**
```bash
# Terminal 1
npm run dev

# Terminal 2
cd server && npm start
```

### 4️⃣ Open Application (10 seconds)
```
http://localhost:3000
```

---

## 📊 Port Reference

| Component | Port | URL |
|-----------|------|-----|
| **Frontend** | 3000 | http://localhost:3000 |
| **Backend API** | 4000 | http://localhost:4000 |
| **Health Check** | 4000 | http://localhost:4000/health |

---

## 🎯 What Works Now?

✅ Frontend on port 3000  
✅ Backend on port 4000  
✅ File upload  
✅ AI analysis  
✅ JIRA integration  
✅ All original UI features  

---

## 🆘 If Something Goes Wrong

### "Port already in use"
**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -i :4000
kill -9 <PID>
```

### "LOVABLE_API_KEY not found"
```bash
set LOVABLE_API_KEY=your_key_here
```

### "Backend not responding"
```bash
# Check if backend is running
curl http://localhost:4000/health

# If error, start backend manually
cd server
npm start
```

---

## 📁 Key Files

| File | Purpose | Changes |
|------|---------|---------|
| `vite.config.ts` | Frontend config | Port: 8080→3000 |
| `server/index.ts` | Backend server | NEW |
| `src/integrations/localserver/client.ts` | API client | NEW |
| `src/pages/Index.tsx` | Main page | Import updated |
| `src/components/CreateJiraIssueButton.tsx` | JIRA button | Import updated |

---

## 🔗 API Endpoints

### Analyze Test Report
```
POST http://localhost:4000/api/analyze-report
Content-Type: application/json

{
  "testCases": [...],
  "rawContent": "report content"
}
```

### Create JIRA Issue
```
POST http://localhost:4000/api/create-jira-issue
Content-Type: application/json

{
  "credentials": {...},
  "failure": {...},
  "summary": "Issue title",
  "description": "Issue description",
  "priority": "High"
}
```

### Health Check
```
GET http://localhost:4000/health

→ { "status": "ok", "port": 4000 }
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `SETUP_LOCAL_SERVER.md` | Detailed setup instructions |
| `CONFIGURATION.md` | Advanced configuration options |
| `MIGRATION_SUMMARY.md` | Complete migration details |
| `IMPLEMENTATION_CHECKLIST.md` | What was changed |
| `start-dev.bat` | Windows auto-start script |
| `start-dev.sh` | Linux/Mac auto-start script |

---

## ✨ Features Preserved

✅ All UI components  
✅ All styling (Tailwind CSS)  
✅ File upload interface  
✅ Analysis results display  
✅ JIRA integration dialog  
✅ Settings management  
✅ Toast notifications  
✅ Loading indicators  
✅ Dark mode support  
✅ Responsive design  

---

## 🧪 Test It

### Step 1: Check Frontend
```
Open: http://localhost:3000
Expected: Defect Analyzer app displays
```

### Step 2: Check Backend
```bash
curl http://localhost:4000/health
Expected: { "status": "ok", "port": 4000 }
```

### Step 3: Upload a Report
```
1. Click "Upload Report"
2. Select a test report file
3. Wait for analysis
4. See results
```

---

## 🔒 Environment Variables

### Required
```
LOVABLE_API_KEY=your_api_key_here
```

### Optional
```
NODE_ENV=development
```

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't start frontend | Check port 3000 is free |
| Can't start backend | Check port 4000 is free |
| AI not working | Set LOVABLE_API_KEY |
| CORS error | Ensure backend runs first |
| File upload fails | Check backend is running |
| Results not showing | Check browser console logs |

---

## 🎓 Comparison

### Before (Supabase)
```
Frontend → Internet → Supabase Cloud → Lovable AI
```

### After (Local Server)
```
Frontend → Localhost:3000 → Localhost:4000 → Lovable AI
                (browser)      (your server)
```

---

## 📦 What You Need

- Node.js 16+
- npm/yarn/bun
- Valid LOVABLE_API_KEY
- Ports 3000 & 4000 available

---

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install && cd server && npm install && cd ..`
2. ✅ Set API key: `set LOVABLE_API_KEY=your_key`
3. ✅ Start app: `start-dev.bat` (Windows) or `./start-dev.sh` (Linux/Mac)
4. ✅ Open: `http://localhost:3000`
5. ✅ Start analyzing test reports!

---

## 💡 Pro Tips

💡 Use DevTools (F12) to monitor API calls  
💡 Backend logs show in terminal window  
💡 Both servers auto-reload in dev mode  
💡 Check `http://localhost:4000/health` to verify backend  
💡 Keep terminal windows visible to spot errors  

---

## ❓ FAQ

**Q: Do I need to change any code?**
A: No! Just install, set API key, and run.

**Q: What if I want to change ports?**
A: Edit `vite.config.ts` (frontend) and `server/index.ts` (backend)

**Q: Can I run this on another machine?**
A: Yes! Change API_URL in `src/integrations/localserver/client.ts`

**Q: Is the UI different?**
A: No! The UI is 100% unchanged.

**Q: What about the original Supabase files?**
A: They're still in `src/integrations/supabase/` for reference.

---

## 🎉 You're All Set!

Everything is configured and ready to go. Just install, set the API key, and start developing!

```
        🚀 Happy Coding! 🚀
```

---

**Last Updated**: January 21, 2026  
**Status**: ✅ Ready to Use
