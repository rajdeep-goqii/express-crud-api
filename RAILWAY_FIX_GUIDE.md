# 🔧 Railway Database Connection Fix

## 🚨 **Current Problem**

Your API at `https://express-crud-api-production.up.railway.app/health` is returning:

```json
{
  "status": "ERROR",
  "timestamp": "2026-01-04T09:12:47.555Z",
  "uptime": 947850.151394946,
  "environment": "production",
  "database": "disconnected",
  "error": "connect ECONNREFUSED 127.0.0.1:3306"
}
```

### **What This Means:**
- ❌ Your app is trying to connect to **localhost** (127.0.0.1:3306)
- ❌ There's NO MySQL database running locally on Railway
- ❌ Environment variables are **NOT configured** or **incorrectly set**

---

## 🔍 **Root Cause Analysis**

### **1. Missing Environment Variables**
Your Railway app service doesn't have the database environment variables set, so `config/database.js` is using:
- `DB_HOST` = `undefined` → defaults to `localhost` or `127.0.0.1`
- `DB_PORT` = `undefined` → defaults to `3306`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` = `undefined`

### **2. Possible Scenarios:**
- ✅ MySQL service exists but not linked
- ✅ Variables were never added
- ✅ Variables use wrong syntax
- ✅ Variables were deleted/corrupted

---

## 🎯 **SOLUTION - Step by Step Fix**

### **Step 1: Verify MySQL Service Exists** (30 seconds)

1. Go to Railway dashboard: https://railway.app/dashboard
2. Open your `express-crud-api-production` project
3. **Check if you see TWO services:**
   - 🟢 One for your app (Node.js)
   - 🟣 One for MySQL database

**If NO MySQL service exists:**
- Click **"+ New"**
- Select **"Database"** → **"MySQL"**
- Wait 30 seconds for provisioning

---

### **Step 2: Configure Environment Variables** (2 minutes)

1. Click on your **App Service** (the Node.js one, not MySQL)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** or **"Raw Editor"**

#### **Copy and paste these EXACT variables:**

```env
NODE_ENV=production
PORT=8888

# Database Connection - Railway automatically resolves these references
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

# JWT Secrets (IMPORTANT: Generate unique ones!)
JWT_SECRET=your-strong-jwt-secret-change-this-32-chars-minimum
REFRESH_TOKEN_SECRET=your-strong-refresh-secret-different-32-chars
JWT_EXPIRES_IN=24h

# Security
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
API_WINDOW_MS=900000
LOG_LEVEL=info
```

#### **⚠️ CRITICAL: Generate Strong JWT Secrets**

**On your local machine, run:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this command **TWICE** to get two different secrets. Replace:
- `your-strong-jwt-secret-change-this-32-chars-minimum`
- `your-strong-refresh-secret-different-32-chars`

With the generated values.

---

### **Step 3: Save and Redeploy** (1 minute)

After adding variables:
1. Railway will **automatically redeploy** your app
2. Go to **"Deployments"** tab
3. Watch the latest deployment logs
4. Wait for: ✅ **"Server running on 0.0.0.0:8888"**

---

### **Step 4: Verify Database Connection** (30 seconds)

#### **Test Health Endpoint:**
```bash
curl https://express-crud-api-production.up.railway.app/health
```

#### **Expected SUCCESS Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-01-04T...",
  "uptime": 123.456,
  "environment": "production",
  "database": "connected"  ← Should say "connected"!
}
```

---

### **Step 5: Run Database Migration** (1 minute)

Once database is connected, initialize the schema:

1. In Railway, click your app service
2. Go to **"Deployments"** → Latest deployment
3. Click **terminal/shell icon** (bottom of logs)
4. Run:
```bash
npm run migrate:prod
```

#### **Expected Output:**
```
🚀 Running production migration...
Database tables created successfully
Default categories inserted
Default admin user created (email: admin@system.local, password: Admin@123)
✅ Migration completed successfully
```

---

### **Step 6: Final Test** (1 minute)

#### **1. Test Health Again:**
```bash
curl https://express-crud-api-production.up.railway.app/health
```

Should show `"database": "connected"` ✅

#### **2. Test Login (verify migration worked):**
```bash
curl -X POST https://express-crud-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin@123"}'
```

Should return JWT tokens ✅

---

## 🎉 **Success Indicators**

You'll know it's fixed when:
- ✅ Health check shows `"database": "connected"`
- ✅ No errors in deployment logs
- ✅ Can login with default admin credentials
- ✅ No `ECONNREFUSED` errors

---

## 🆘 **Still Not Working? Advanced Troubleshooting**

### **Issue: Variables not resolving `${{MySQL.MYSQL_HOST}}`**

**Check MySQL Service Name:**
1. Click on MySQL service
2. Note the exact name (might be `MySQL`, `mysql`, or `database`)
3. Update variables to match:
   ```env
   DB_HOST=${{EXACT_SERVICE_NAME.MYSQL_HOST}}
   ```

### **Issue: MySQL service not accessible**

**Verify Network Link:**
1. Click app service → **"Settings"**
2. Scroll to **"Service Variables"** or **"Connected Services"**
3. MySQL should be listed
4. If not, remove and re-add MySQL service

### **Issue: Still shows localhost**

**Check Railway Logs:**
1. Go to **"Deployments"** → Latest deployment
2. Look for lines like:
   ```
   - Trying to connect to: 127.0.0.1:3306
   ```
3. This means variables are STILL not set
4. Double-check you're editing the **APP service**, not MySQL service

---

## 📝 **Checklist Before Marking as Fixed**

- [ ] MySQL service exists and is running (green indicator)
- [ ] Environment variables added to **app service**
- [ ] Variables use `${{MySQL.VARIABLE}}` syntax
- [ ] JWT secrets are unique and strong (minimum 32 characters)
- [ ] App redeployed after adding variables
- [ ] Health check returns `"database": "connected"`
- [ ] Database migration completed successfully
- [ ] Can login with default admin user

---

## 🔐 **Post-Fix Security Steps**

### **1. Change Default Admin Password:**
```bash
# Login first
curl -X POST https://express-crud-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin@123"}'

# Copy the accessToken from response, then:
curl -X PATCH https://express-crud-api-production.up.railway.app/api/users/1/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Admin@123","newPassword":"YourNewSecurePassword@2024!"}'
```

### **2. Update CORS (Optional):**
If you have a frontend, update `server.js` line 40-42 with your frontend domain:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://yourfrontend.com'] 
  : ['http://localhost:3000'],
```

Then commit and push to trigger redeploy.

---

## 💡 **Understanding Railway Variables**

### **Why `${{MySQL.MYSQL_HOST}}` syntax?**
- Railway uses **service references**
- `MySQL` = name of your MySQL service
- `MYSQL_HOST` = variable exposed by MySQL service
- Railway **auto-resolves** this at runtime to actual IP/hostname

### **Example Resolution:**
```env
# What you set:
DB_HOST=${{MySQL.MYSQL_HOST}}

# What Railway resolves at runtime:
DB_HOST=mysql.railway.internal:3306
# (or similar internal network address)
```

---

## 📊 **Expected Timeline**

| Step | Time | Status |
|------|------|--------|
| Verify MySQL exists | 30s | ⏱️ |
| Add environment variables | 2min | ⏱️ |
| Automatic redeploy | 2-3min | ⏱️ |
| Test health endpoint | 30s | ⏱️ |
| Run migration | 1min | ⏱️ |
| Final verification | 1min | ⏱️ |
| **TOTAL** | **~7-8 minutes** | 🎯 |

---

## 📞 **Need Help?**

If this doesn't work:
1. **Share screenshot of:**
   - Railway dashboard showing all services
   - Variables tab from app service
   - Latest deployment logs
2. **Check:**
   - Railway service status: https://status.railway.app
   - Your Railway credit balance

---

## ✅ **Quick Verification Commands**

After fix, run these to confirm everything works:

```bash
# 1. Health check
curl https://express-crud-api-production.up.railway.app/health

# 2. Register new user
curl -X POST https://express-crud-api-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'

# 3. Login
curl -X POST https://express-crud-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# 4. Get categories (with token from login)
curl https://express-crud-api-production.up.railway.app/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

All should work without errors! 🎉

---

**Last Updated:** 2026-01-04
**Status:** Ready to implement
**Estimated Fix Time:** 7-8 minutes
