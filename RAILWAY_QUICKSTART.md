# 🚂 Railway Quick Start (5 Minutes)

## Prerequisites
✅ Local database connected
✅ Code working locally
✅ GitHub account
✅ Railway account (sign up at railway.app)

---

## 📋 Quick Steps

### **1. Push to GitHub** (2 minutes)
```bash
# Initialize git if needed
git init
git add .
git commit -m "Production ready"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/express-crud-api.git
git branch -M main
git push -u origin main
```

---

### **2. Create Railway Project** (1 minute)
1. Go to **railway.app**
2. Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `express-crud-api` repo

---

### **3. Add MySQL Database** (30 seconds)
1. Click **"+ New"** in your project
2. Select **"Database"** → **"MySQL"**
3. Wait 30 seconds for provisioning
4. ✅ Done! Railway auto-links it.

---

### **4. Set Environment Variables** (2 minutes)

Click your app service → **Variables** tab → Add these:

```env
NODE_ENV=production
PORT=8888

# Generate these with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<your-generated-secret-here>
REFRESH_TOKEN_SECRET=<different-secret-here>
JWT_EXPIRES_IN=24h

# Database (Railway auto-fills these)
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

# Security
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
API_WINDOW_MS=900000
LOG_LEVEL=info
```

**💡 Railway Magic:** `${{MySQL.VARIABLE}}` syntax auto-connects to your MySQL service!

---

### **5. Deploy** (Automatic!)
Railway auto-deploys! Watch the logs:
1. Click **"Deployments"** tab
2. See real-time build logs
3. Wait for: ✅ "Build successful"

---

### **6. Get Your URL** (30 seconds)
1. Go to **Settings** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. You get: `your-app-name.up.railway.app`

---

### **7. Run Database Migration** (1 minute)
1. Click **"Deployments"** → Latest deployment
2. Click **terminal icon** at bottom
3. Run:
```bash
npm run migrate:prod
```

Look for: ✅ "Migration completed successfully"

---

### **8. Test Your API** (30 seconds)
```bash
# Health check
curl https://your-app-name.up.railway.app/health

# Should return:
{
  "status": "OK",
  "database": "connected"
}
```

---

## 🎉 **Done! Your API is LIVE!**

**URL:** `https://your-app-name.up.railway.app`

---

## 🔐 Important Next Steps

### **Change Default Admin Password:**
```bash
# 1. Login and get token
curl -X POST https://your-app-name.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin@123"}'

# 2. Change password (use token from above)
curl -X PATCH https://your-app-name.up.railway.app/api/users/USER_ID/password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Admin@123","newPassword":"NewSecurePass@2024!"}'
```

### **Add Persistent Volume (for file uploads):**
1. App service → **Settings**
2. Scroll to **"Volumes"**
3. Click **"+ New Volume"**
4. Mount path: `/app/uploads`
5. Size: 1GB
6. Cost: +$5/month

---

## 💰 Pricing
- **App + MySQL:** ~$10/month
- **With Persistent Volume:** ~$15/month
- **Free $5 credit** on signup

---

## 🆘 Troubleshooting

**Problem:** App not starting
- Check logs in Deployments tab
- Verify all environment variables are set
- Ensure `PORT` variable is set to `8888`

**Problem:** Database connection failed
- Verify MySQL service is running (green dot)
- Check variables use `${{MySQL.VARIABLE}}` syntax
- Re-deploy after fixing

**Problem:** Migration failed
- Check database is running
- Manually run `npm run migrate:prod` in terminal
- Check for specific error in logs

---

## 📚 Full Documentation
See **`RAILWAY_SETUP.md`** for detailed step-by-step guide.

---

## ✅ Checklist
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] MySQL database added
- [ ] Environment variables set
- [ ] App deployed successfully
- [ ] Domain generated
- [ ] Database migrated
- [ ] Health check returns "OK"
- [ ] Admin password changed
- [ ] Persistent volume added (for file uploads)

**All done?** 🚀 **Your API is production-ready!**
