# 🚀 Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests pass
- [ ] Database migrations tested
- [ ] Environment variables documented in `.env.example`
- [ ] Strong JWT secrets generated
- [ ] CORS origins configured for production domain
- [ ] Rate limiting configured appropriately
- [ ] File upload limits reviewed

## Recommended Hosting Solutions

### Option 1: Railway (Easiest) - ~$10/month

**Pros:**
- Built-in MySQL database
- Persistent file storage
- Auto-deploy from GitHub
- Free SSL
- Easy scaling

**Steps:**
1. Push code to GitHub
2. Connect Railway to GitHub repo
3. Add MySQL addon ($5/month)
4. Add persistent volume for uploads ($5/month for 10GB)
5. Set environment variables in Railway dashboard
6. Deploy

**Environment Variables to Set:**
```
NODE_ENV=production
PORT=8888
JWT_SECRET=<generate-strong-secret-32-chars>
REFRESH_TOKEN_SECRET=<generate-strong-secret-32-chars>
DB_HOST=<railway-mysql-host>
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_PORT=3306
```

**First Deploy Commands:**
```bash
npm run migrate  # Run once to create tables
npm start       # Start the server
```

---

### Option 2: Render + PlanetScale - ~$7-20/month

**Pros:**
- Separate database management
- Better scalability
- Free tier available
- Managed MySQL

**Steps:**

**PlanetScale (Database):**
1. Create account at planetscale.com
2. Create new database
3. Get connection string
4. Note: Free tier → $29/month for production

**Render (Web Service):**
1. Connect GitHub repo
2. Create new Web Service
3. Set environment variables
4. Deploy (Free tier or $7/month)

---

### Option 3: AWS (Most Professional) - ~$20-30/month

**Pros:**
- Enterprise-grade
- Full control
- Best scalability
- Industry standard

**Components:**
- **RDS MySQL**: ~$13/month minimum
- **Elastic Beanstalk**: Free tier or ~$10/month
- **S3**: $0.023/GB for file storage
- **CloudFront CDN**: Optional for file delivery

---

## File Storage Considerations

**Current Implementation:**
- Files stored in local `uploads/` directory
- Not suitable for most cloud platforms (ephemeral storage)

**Solutions:**

### 1. Platform Persistent Volumes (Railway/Render)
- Add persistent volume mount
- Railway: $5/month for 10GB
- Render: $7/month for 1GB

### 2. AWS S3 (Recommended for Production)
- Install AWS SDK: `npm install aws-sdk`
- Update `middleware/upload.js` to use S3
- Cost: $0.023/GB storage + transfer

### 3. Cloudinary (Image-focused)
- Easy integration
- Image transformations
- Free tier: 25GB storage

---

## Migration Steps

### 1. Prepare Code
```bash
# Ensure .gitignore is updated
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Set Up Database
```bash
# On hosting platform, run migration
npm run migrate
```

### 3. Environment Configuration
- Copy all variables from `.env.example`
- Generate strong secrets:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Update CORS origins with actual domain

### 4. Test Endpoints
```bash
# Health check
curl https://your-domain.com/health

# Register user
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test@123"}'
```

---

## Security Hardening for Production

1. **Environment Variables:**
   - Use platform secret management
   - Never commit `.env` file

2. **Rate Limiting:**
   - Adjust `API_RATE_LIMIT` based on expected traffic
   - Consider Redis for distributed rate limiting

3. **CORS:**
   - Update `server.js` line 40-42 with actual domains
   - Remove localhost origins

4. **Database:**
   - Enable SSL connections
   - Use read replicas for scaling
   - Regular backups

5. **Monitoring:**
   - Add error tracking (Sentry, LogRocket)
   - Set up uptime monitoring (UptimeRobot)
   - Database performance monitoring

---

## Scaling Considerations

**When to Scale:**
- Response times > 500ms
- Database connections exhausted
- CPU/Memory > 80%

**Horizontal Scaling:**
- Add more server instances
- Use load balancer
- Implement Redis for sessions

**Database Scaling:**
- Connection pooling (already configured)
- Read replicas
- Caching layer (Redis)
- Database indexing review

---

## Troubleshooting

**Database Connection Issues:**
```bash
# Check connection
node -e "require('dotenv').config(); const db = require('./config/database'); db.execute('SELECT 1').then(() => console.log('Connected')).catch(console.error)"
```

**Port Issues:**
- Most platforms set PORT automatically
- Ensure `process.env.PORT` is used (already configured)

**File Upload Issues:**
- Check persistent volume mounted
- Verify write permissions
- Check disk space

---

## Post-Deployment

1. **Test All Endpoints:**
   - Authentication
   - CRUD operations
   - File uploads
   - Error handling

2. **Monitor Logs:**
   - Watch for errors first 24-48 hours
   - Set up alerts for critical errors

3. **Performance Baseline:**
   - Measure average response times
   - Set up performance monitoring

4. **Backup Strategy:**
   - Daily database backups
   - Weekly file backups
   - Test restore procedures

---

## Cost Optimization

- Start with smallest instance
- Monitor usage patterns
- Scale up only when needed
- Use CDN for static files
- Implement caching

---

## Support & Maintenance

- Review logs weekly
- Update dependencies monthly
- Security patches immediately
- Performance review quarterly
