# ⚡ URGENT FIX - Remove Quotes from Variables

## 🚨 PROBLEM IDENTIFIED

Your variables have **quotes** which prevent Railway from resolving the MySQL service references!

---

## ✅ IMMEDIATE ACTION (2 minutes)

### **COPY THIS EXACTLY (NO QUOTES!):**

```env
NODE_ENV=production
PORT=8888
JWT_SECRET=a6ee03284e5d8e027e2260ed5ace16d4ad560768aac1b2ebe33ef2d8d8f86d33
REFRESH_TOKEN_SECRET=59a880307167b918d824d6925047303715631b53c7bcc5e17217c53d1203d754
JWT_EXPIRES_IN=24h
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
API_WINDOW_MS=900000
LOG_LEVEL=info
```

---

## 📋 STEPS TO FIX

### 1. Open Railway Dashboard
- [ ] Go to: https://railway.app/dashboard
- [ ] Open your project

### 2. Verify MySQL Service Exists
- [ ] Check if you see **MySQL service** (purple database icon)
- [ ] Note the EXACT service name (case-sensitive!)
   - Usually: `MySQL` (capital M)
   - Could be: `mysql`, `database`, or custom name

**If MySQL service doesn't exist:**
- [ ] Click "+ New" → Database → MySQL
- [ ] Wait 30 seconds

### 3. Update App Variables
- [ ] Click on **App Service** (Node.js icon, NOT the database!)
- [ ] Go to **"Variables"** tab
- [ ] Click **"Raw Editor"** button
- [ ] **Delete ALL current content**
- [ ] **Paste the variables above** (NO quotes!)
- [ ] Double-check: NO quotes around `${{...}}`
- [ ] Click **Save** (or it auto-saves)

### 4. Wait for Redeploy
- [ ] Go to **"Deployments"** tab
- [ ] Latest deployment should start automatically (2-3 minutes)
- [ ] Watch the logs

### 5. Check Logs for Success
Look for this in deployment logs:
```
✅ Connected to: roundhouse.proxy.rlwy.net:XXXXX/railway
```

**NOT:**
```
❌ Trying to connect to: 127.0.0.1:3306
❌ Trying to connect to: ${MySQL.MYSQL_HOST}:${MySQL.MYSQL_PORT}
```

### 6. Test Health Endpoint
```bash
curl https://express-crud-api-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "OK",
  "database": "connected"
}
```

---

## 🎯 KEY DIFFERENCE

### ❌ What You Had (WRONG):
```env
DB_HOST="${{MySQL.MYSQL_HOST}}"  ← Quotes make it a literal string!
```

### ✅ What You Need (CORRECT):
```env
DB_HOST=${{MySQL.MYSQL_HOST}}  ← No quotes, Railway resolves it!
```

---

## 🔍 IF SERVICE NAME IS DIFFERENT

If your MySQL service is named differently (check the service card in Railway):

**Service named `mysql` (lowercase):**
```env
DB_HOST=${{mysql.MYSQL_HOST}}
DB_PORT=${{mysql.MYSQL_PORT}}
DB_NAME=${{mysql.MYSQL_DATABASE}}
DB_USER=${{mysql.MYSQL_USER}}
DB_PASSWORD=${{mysql.MYSQL_PASSWORD}}
```

**Service named `database`:**
```env
DB_HOST=${{database.MYSQL_HOST}}
DB_PORT=${{database.MYSQL_PORT}}
DB_NAME=${{database.MYSQL_DATABASE}}
DB_USER=${{database.MYSQL_USER}}
DB_PASSWORD=${{database.MYSQL_PASSWORD}}
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Variables updated with NO quotes
- [ ] Redeployment completed (2-3 min)
- [ ] Logs show "Connected to: roundhouse.proxy..."
- [ ] Health check returns "connected"
- [ ] Ready to run migration!

---

## 📞 STILL NOT WORKING?

### Share These Screenshots:
1. Railway dashboard showing both services (app + MySQL)
2. MySQL service Variables tab (showing MYSQL_HOST, etc.)
3. App service Variables tab (showing your DB_HOST, etc.)
4. Latest deployment logs (full output)

### Common Issues:
- Service name mismatch (case-sensitive!)
- MySQL service not in same project
- Forgot to remove quotes
- Using UI editor instead of Raw Editor (can add quotes automatically)

---

**Priority:** 🔴 CRITICAL  
**Time to Fix:** 2 minutes  
**Next Step After Fix:** Run migration with `npm run migrate:prod`
