# 🚂 Railway Deployment - Step by Step Guide

## Prerequisites
- [x] GitHub account
- [x] Railway account (sign up at railway.app)
- [x] Code tested locally
- [x] Database connected locally

---

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Production ready"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Name: `express-crud-api` (or your choice)
3. Keep it **Private** (recommended for API projects)
4. **DO NOT** add README, .gitignore, or license (we already have them)
5. Click "Create repository"

### 1.3 Push to GitHub
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/express-crud-api.git

# Push code
git branch -M main
git push -u origin main
```

**✅ Checkpoint:** Your code is now on GitHub!

---

## Step 2: Create Railway Account & Project

### 2.1 Sign Up for Railway
1. Go to https://railway.app
2. Click "Start a New Project" or "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. **Free Plan:** $5 credit included, enough for testing

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `express-crud-api` repository
4. Railway will detect it's a Node.js project automatically

**✅ Checkpoint:** Project created on Railway!

---

## Step 3: Add MySQL Database

### 3.1 Add Database Service
1. In your Railway project dashboard
2. Click "**+ New**" button
3. Select "**Database**"
4. Choose "**MySQL**"
5. Railway will provision a MySQL instance (~30 seconds)

### 3.2 Get Database Credentials
1. Click on the **MySQL service** (purple container)
2. Go to "**Variables**" tab
3. You'll see these auto-generated:
   ```
   MYSQL_URL (full connection string)
   MYSQL_HOST
   MYSQL_PORT
   MYSQL_DATABASE
   MYSQL_USER
   MYSQL_PASSWORD
   MYSQL_ROOT_PASSWORD
   ```

**💡 Tip:** Railway auto-links these to your app service!

**✅ Checkpoint:** MySQL database created!

---

## Step 4: Configure Application Environment Variables

### 4.1 Click on Your App Service (Node.js)
1. Click the service named after your repo
2. Go to "**Variables**" tab
3. Click "**+ New Variable**"

### 4.2 Add Required Variables
Add these one by one:

```env
NODE_ENV=production
PORT=8888

# JWT Secrets (GENERATE NEW ONES - DON'T USE DEVELOPMENT SECRETS!)
JWT_SECRET=<generate-strong-random-32-char-string>
REFRESH_TOKEN_SECRET=<generate-different-32-char-string>
JWT_EXPIRES_IN=24h

# Database (Use Railway's auto-generated values)
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

**🔐 How to Generate JWT Secrets:**

**Method 1:** Use Node.js (locally)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 2:** Use online generator
- Go to: https://www.uuidgenerator.net/
- Or use any random string generator (minimum 32 characters)

### 4.3 Railway Variable Syntax
Railway auto-links services using `${{ServiceName.VARIABLE}}`

Example:
```
DB_HOST=${{MySQL.MYSQL_HOST}}
```
This automatically pulls the host from your MySQL service!

**✅ Checkpoint:** Environment variables configured!

---

## Step 5: Configure Build & Start Commands

### 5.1 Check package.json Scripts
Railway auto-detects these from your `package.json`:
- **Build:** None needed (we don't have a build step)
- **Start:** `npm start`

### 5.2 Verify Start Command
In Railway app service settings:
1. Go to "**Settings**" tab
2. Find "**Start Command**"
3. Should show: `npm start`
4. If blank, add: `npm start`

**✅ Checkpoint:** Start command configured!

---

## Step 6: Add Migration Script to Deployment

### 6.1 Option A: Run Migration Manually (Recommended for first time)
1. Wait for deployment to complete
2. Go to app service
3. Click "**Deployments**" tab
4. Click latest deployment
5. Scroll to "**Deployment Logs**"
6. You'll see a **"View Logs"** button
7. At bottom, there's a **terminal icon** - click it
8. Run migration:
   ```bash
   npm run migrate:prod
   ```

### 6.2 Option B: Auto-run on Every Deploy (Advanced)
Update `package.json`:
```json
"scripts": {
  "start": "npm run migrate:prod && node server.js",
  // ... other scripts
}
```

**⚠️ Warning:** Option B runs migration on every deployment. Good for hobby projects, but for production, manual migrations are safer.

**✅ Checkpoint:** Ready to deploy!

---

## Step 7: Deploy & Test

### 7.1 Deploy Application
Railway auto-deploys when you push to GitHub!

OR manually trigger:
1. Go to app service
2. Click "**Deployments**"
3. Click "**Deploy**"

### 7.2 Monitor Deployment
Watch the logs:
1. Click on latest deployment
2. View real-time logs
3. Look for: `Server running on port XXXX`

### 7.3 Get Your App URL
1. Go to app service "**Settings**"
2. Scroll to "**Domains**"
3. Click "**Generate Domain**"
4. Railway gives you: `your-app-name.up.railway.app`

**✅ Checkpoint:** App deployed!

---

## Step 8: Run Database Migration

### 8.1 Open Railway Terminal
1. Click your app service
2. Go to "**Deployments**"
3. Click latest deployment
4. Click terminal icon at bottom
5. Run:
   ```bash
   npm run migrate:prod
   ```

### 8.2 Verify Migration Success
Look for in logs:
```
Database tables created successfully
Default categories inserted
Default admin user created (email: admin@system.local, password: Admin@123)
Migration completed successfully
```

**✅ Checkpoint:** Database initialized with schema and default data!

---

## Step 9: Test Your Deployed API

### 9.1 Test Health Check
```bash
curl https://your-app-name.up.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-12-24T...",
  "uptime": 123.456,
  "environment": "production",
  "database": "connected"
}
```

### 9.2 Test Authentication
```bash
# Register a user
curl -X POST https://your-app-name.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'

# Login
curl -X POST https://your-app-name.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@system.local",
    "password": "Admin@123"
  }'
```

**✅ Checkpoint:** API is live and working!

---

## Step 10: Add Persistent Volume (For File Uploads)

### 10.1 Create Volume
1. Click your app service
2. Go to "**Settings**"
3. Scroll to "**Volumes**"
4. Click "**+ New Volume**"
5. Mount path: `/app/uploads`
6. Size: 1GB to start (expandable)
7. Click "Create"

**💰 Cost:** ~$5/month for 1GB

### 10.2 Verify Volume
1. Deployment will restart automatically
2. Check logs for successful mount
3. Test file upload endpoint

**✅ Checkpoint:** File uploads now persist!

---

## Step 11: Configure Custom Domain (Optional)

### 11.1 Add Custom Domain
1. Go to app service "**Settings**"
2. Find "**Domains**" section
3. Click "**Custom Domain**"
4. Enter your domain: `api.yourdomain.com`
5. Railway provides DNS instructions

### 11.2 Update DNS
Add CNAME record at your domain registrar:
```
Type:  CNAME
Name:  api
Value: your-app-name.up.railway.app
```

**✅ Checkpoint:** Custom domain configured!

---

## Step 12: Post-Deployment Security

### 12.1 Change Default Admin Password
```bash
curl -X PATCH https://your-app-name.up.railway.app/api/users/ADMIN_ID/password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Admin@123",
    "newPassword": "YourSecurePassword@2024!"
  }'
```

### 12.2 Update CORS Settings
Update `server.js` line 40-42:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://yourfrontend.com'] 
  : ['http://localhost:3000'],
```

Then commit and push:
```bash
git add server.js
git commit -m "Update CORS for production"
git push
```

**✅ Checkpoint:** Security hardened!

---

## 📊 Railway Pricing Breakdown

| Service | Cost | Details |
|---------|------|---------|
| **App (Hobby)** | $5/month | 512MB RAM, 1GB storage |
| **MySQL** | $5/month | 1GB storage, shared CPU |
| **Persistent Volume** | ~$5/month | 1GB for uploads |
| **Bandwidth** | Included | Up to 100GB/month |
| **Total** | **~$10-15/month** | For complete setup |

**💡 Free Tier:**
- $5 credit on signup
- Good for testing/development
- Upgrade when ready

---

## 🔧 Troubleshooting

### Problem: "Port already in use"
**Solution:** Railway sets PORT automatically. Make sure `server.js` uses:
```javascript
const PORT = process.env.PORT || 3000;
```

### Problem: "Database connection failed"
**Solution:** 
1. Check Railway MySQL service is running
2. Verify variables use Railway syntax: `${{MySQL.MYSQL_HOST}}`
3. Check app service has access to MySQL service

### Problem: "Migration failed"
**Solution:**
1. Check database credentials
2. Run migration manually via Railway terminal
3. Check logs for specific error

### Problem: "File uploads not persisting"
**Solution:**
1. Add persistent volume (see Step 10)
2. Mount path must be `/app/uploads`
3. Redeploy after adding volume

### Problem: "App keeps crashing"
**Solution:**
1. Check deployment logs
2. Verify all environment variables set
3. Test locally with production env vars
4. Check Node.js version compatibility

---

## 🎯 Quick Checklist

Before going live:
- [ ] All environment variables set
- [ ] JWT secrets are STRONG and UNIQUE
- [ ] Database migration completed
- [ ] Health check returns "connected"
- [ ] Default admin password changed
- [ ] CORS configured for your domain
- [ ] Persistent volume added for uploads
- [ ] API endpoints tested
- [ ] Monitoring/logging reviewed
- [ ] Backup strategy planned

---

## 📈 Next Steps After Deployment

1. **Monitor Logs** 
   - Check Railway dashboard daily first week
   - Set up alerts for errors

2. **Set Up Monitoring**
   - Railway has built-in metrics
   - Consider adding Sentry for error tracking

3. **Regular Backups**
   - Railway auto-backs up database
   - Download backups weekly via Railway CLI

4. **Performance Testing**
   - Test with expected load
   - Monitor response times

5. **Documentation**
   - Update README with production URL
   - Document any custom setup steps

---

## 🆘 Support Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## 🎉 Congratulations!

Your Express CRUD API is now:
- ✅ Running on Railway
- ✅ Connected to MySQL database
- ✅ Accessible via HTTPS
- ✅ Auto-deploying from GitHub
- ✅ Production-ready!

**Your API is live at:** `https://your-app-name.up.railway.app`
