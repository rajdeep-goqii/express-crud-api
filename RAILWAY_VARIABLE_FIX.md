# 🔧 Railway Variable Syntax Fix

## 🚨 CRITICAL ISSUE FOUND

Your environment variables have **quotes** around Railway service references!

### ❌ What You Have (WRONG):
```env
DB_HOST="${{MySQL.MYSQL_HOST}}"
DB_PORT="${{MySQL.MYSQL_PORT}}"
DB_NAME="${{MySQL.MYSQL_DATABASE}}"
DB_USER="${{MySQL.MYSQL_USER}}"
DB_PASSWORD="${{MySQL.MYSQL_PASSWORD}}"
```

### ✅ What You Need (CORRECT):
```env
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
```

**The quotes prevent Railway from resolving the service references!**

---

## 🎯 IMMEDIATE FIX

### Step 1: Verify MySQL Service Exists

1. Go to Railway dashboard
2. Open your `express-crud-api-production` project
3. **Check if you see a MySQL service** (purple database icon)

**If NO MySQL service:**
- Click **"+ New"**
- Select **"Database"** → **"MySQL"**
- Wait 30 seconds for provisioning

### Step 2: Check MySQL Service Name

1. Click on your **MySQL service** (the database icon)
2. Look at the **top-left corner** - note the EXACT name
3. Common names:
   - `MySQL` (capital M)
   - `mysql` (lowercase)
   - `database`
   - Or a custom name you gave it

**The name is CASE-SENSITIVE!**

### Step 3: Update Variables WITHOUT Quotes

1. Click on **App Service** (Node.js icon)
2. Go to **Variables** tab
3. Click **Raw Editor**
4. **Copy and paste this EXACTLY:**

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

**If your MySQL service has a different name (e.g., `mysql` or `database`), replace `MySQL` with that name:**

```env
# Example if service is named "mysql" (lowercase)
DB_HOST=${{mysql.MYSQL_HOST}}
DB_PORT=${{mysql.MYSQL_PORT}}
# ... etc

# Example if service is named "database"
DB_HOST=${{database.MYSQL_HOST}}
DB_PORT=${{database.MYSQL_PORT}}
# ... etc
```

### Step 4: Save and Wait

1. Click **Save** or it saves automatically
2. Railway will **redeploy** (2-3 minutes)
3. Go to **Deployments** tab
4. Watch the logs

### Step 5: Check Deployment Logs

Look for these lines in the logs:

**❌ BAD (still broken):**
```
- Trying to connect to: ${MySQL.MYSQL_HOST}:${MySQL.MYSQL_PORT}
# OR
- Trying to connect to: 127.0.0.1:3306
# OR
- Trying to connect to: undefined:undefined
```

**✅ GOOD (working):**
```
Connected to: roundhouse.proxy.rlwy.net:12345/railway
# OR similar internal Railway address
```

---

## 🔍 TROUBLESHOOTING

### Issue 1: Service Name is Wrong

**Symptoms:** Logs show `undefined` or still `127.0.0.1`

**Fix:**
1. Click MySQL service
2. Note the EXACT name (case-sensitive!)
3. Update variables to match:
   ```env
   DB_HOST=${{EXACT_SERVICE_NAME.MYSQL_HOST}}
   ```

### Issue 2: MySQL Service Not Linked

**Symptoms:** Variables tab doesn't show MySQL service in "Service References"

**Fix:**
1. Both services must be in the **same project**
2. Remove and re-add MySQL service
3. Or manually add in Settings → Service Variables

### Issue 3: Still Shows Quotes in Logs

**Symptoms:** Logs show literal `${MySQL.MYSQL_HOST}`

**Fix:**
1. Delete ALL database variables
2. Add them back ONE BY ONE without quotes
3. Or use the UI editor instead of Raw Editor:
   - Click "+ New Variable"
   - Name: `DB_HOST`
   - Value: `${{MySQL.MYSQL_HOST}}` (no quotes)
   - Repeat for each variable

---

## 📸 WHAT TO LOOK FOR IN RAILWAY

### Dashboard View:
```
┌─────────────────────────┐  ┌─────────────────────────┐
│  express-crud-api       │  │  MySQL                  │
│  (Node.js)              │  │  (Database)             │
│  🟢 Running             │  │  🟢 Running             │
└─────────────────────────┘  └─────────────────────────┘
```

Both should have **green indicators**!

### MySQL Service Variables Tab:
You should see:
```
MYSQL_HOST=roundhouse.proxy.rlwy.net
MYSQL_PORT=12345
MYSQL_DATABASE=railway
MYSQL_USER=root
MYSQL_PASSWORD=<some-password>
MYSQL_ROOT_PASSWORD=<same-password>
```

### App Service Variables Tab:
After adding correctly, you should see:
```
DB_HOST=${{MySQL.MYSQL_HOST}}  → resolves to → roundhouse.proxy.rlwy.net
DB_PORT=${{MySQL.MYSQL_PORT}}  → resolves to → 12345
```

Railway shows both the reference AND the resolved value!

---

## ✅ VERIFICATION

After fixing and redeploying:

### Test 1: Check Deployment Logs
```
✅ "Connected to: roundhouse.proxy.rlwy.net:12345/railway"
```

### Test 2: Health Check
```bash
curl https://express-crud-api-production.up.railway.app/health
```

**Expected:**
```json
{
  "status": "OK",
  "database": "connected"  ← Should say "connected"!
}
```

### Test 3: If Still Failing

**Share screenshot of:**
1. Railway project dashboard (showing both services)
2. MySQL service name and Variables tab
3. App service Variables tab (with resolved values)
4. Latest deployment logs (full output)

---

## 🎯 CORRECT SYNTAX CHEAT SHEET

### Railway Variable References:

| ❌ WRONG | ✅ CORRECT |
|---------|----------|
| `"${{MySQL.MYSQL_HOST}}"` | `${{MySQL.MYSQL_HOST}}` |
| `'${{MySQL.MYSQL_HOST}}'` | `${{MySQL.MYSQL_HOST}}` |
| `${MySQL.MYSQL_HOST}` | `${{MySQL.MYSQL_HOST}}` |
| `{{MySQL.MYSQL_HOST}}` | `${{MySQL.MYSQL_HOST}}` |

**Key points:**
- ✅ No quotes
- ✅ Two curly braces: `${{...}}`
- ✅ Exact service name (case-sensitive)
- ✅ Format: `${{ServiceName.VARIABLE_NAME}}`

---

## 📞 NEXT STEPS

1. **Remove quotes from variables** (most important!)
2. **Verify MySQL service name** (case-sensitive)
3. **Wait for redeploy** (2-3 min)
4. **Check deployment logs** for connection message
5. **Test health endpoint**

Once health check shows "connected":
1. Run migration: `npm run migrate:prod`
2. Test API endpoints
3. You're done! 🎉

---

**Last Updated:** 2026-01-04  
**Issue:** Quoted variable references preventing resolution  
**Status:** Solution provided - awaiting user fix
