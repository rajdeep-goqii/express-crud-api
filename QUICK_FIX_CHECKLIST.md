# ⚡ QUICK FIX CHECKLIST - Railway Database Connection

**Problem:** `ECONNREFUSED 127.0.0.1:3306`  
**Status:** Missing environment variables in Railway  
**Fix Time:** ~7 minutes  
**URL:** https://express-crud-api-production.up.railway.app

---

## 🎯 IMMEDIATE ACTION REQUIRED

### ☑️ **STEP 1: Open Railway Dashboard**
- [ ] Go to: https://railway.app/dashboard
- [ ] Open project: `express-crud-api-production`
- [ ] Verify you see **2 services**: App + MySQL

**If MySQL missing:**
- [ ] Click "+ New" → Database → MySQL
- [ ] Wait 30 seconds

---

### ☑️ **STEP 2: Add Environment Variables**

- [ ] Click on **App Service** (not MySQL)
- [ ] Go to **"Variables"** tab
- [ ] Add these variables (copy-paste):

```env
NODE_ENV=production
PORT=8888
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
API_WINDOW_MS=900000
LOG_LEVEL=info
JWT_EXPIRES_IN=24h
```

---

### ☑️ **STEP 3: Generate JWT Secrets**

**Run on your local machine:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run **TWICE** to get two different values.

**Then add to Railway:**
```env
JWT_SECRET=<paste-first-generated-value>
REFRESH_TOKEN_SECRET=<paste-second-generated-value>
```

---

### ☑️ **STEP 4: Wait for Redeploy**

- [ ] Railway will auto-redeploy (2-3 minutes)
- [ ] Go to "Deployments" tab
- [ ] Watch logs for: ✅ "Server running on 0.0.0.0:8888"

---

### ☑️ **STEP 5: Test Health Endpoint**

**Run this command:**
```bash
curl https://express-crud-api-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "OK",
  "database": "connected"  ← Must say "connected"!
}
```

✅ **If you see "connected"** → Database is fixed! Continue to Step 6  
❌ **If still "disconnected"** → Check Step 2 variables again

---

### ☑️ **STEP 6: Run Database Migration**

- [ ] In Railway, click App Service → Deployments → Latest
- [ ] Click **terminal icon** at bottom
- [ ] Run:
```bash
npm run migrate:prod
```

**Look for:**
```
✅ Migration completed successfully
```

---

### ☑️ **STEP 7: Final Verification**

**Test login:**
```bash
curl -X POST https://express-crud-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin@123"}'
```

**Should return JWT tokens** → ✅ **EVERYTHING WORKS!**

---

## 🎉 SUCCESS CRITERIA

- [x] Health check shows `"database": "connected"`
- [x] No `ECONNREFUSED` errors in logs
- [x] Migration completed successfully
- [x] Can login with admin credentials
- [x] All API endpoints accessible

---

## 🔴 COMMON MISTAKES TO AVOID

1. **Wrong Service** - Make sure you add variables to **APP service**, not MySQL service
2. **Typos in Syntax** - Must be `${{MySQL.MYSQL_HOST}}` - exact syntax!
3. **Weak JWT Secrets** - Must be minimum 32 characters, use crypto generator
4. **Forgot to Save** - Click "Save" or they won't apply
5. **Didn't Wait** - Redeployment takes 2-3 minutes, be patient

---

## 🆘 IF STILL NOT WORKING

**Share screenshots of:**
1. Railway dashboard (showing all services)
2. App service → Variables tab
3. Latest deployment logs
4. Health endpoint response

**Then check:**
- Railway status: https://status.railway.app
- MySQL service has green indicator
- No typos in variable names

---

## 📞 NEED MORE HELP?

See detailed guide: `RAILWAY_FIX_GUIDE.md`

---

**Created:** 2026-01-04  
**Target:** https://express-crud-api-production.up.railway.app  
**Priority:** 🔴 URGENT - App is down
