# 🚀 How to Run Database Migrations

Since you couldn't find the terminal, here are **two ways** to run the migration.

---

## ✅ Method 1: Use the Railway CLI (Recommended since you installed it)

You already installed the CLI, but you need to **login** first.

### **Step 1: Login**
Run this command in your local terminal:
```bash
railway login
```
*Press Enter, and it will open your browser to authenticate.*

### **Step 2: Link Your Project**
Run this command (select your project from the list):
```bash
railway link
```

### **Step 3: Run the Migration**
This command runs your migration script **locally** but uses the **remote** environment variables (connecting to your real database):
```bash
railway run npm run migrate:prod
```

---

## 💻 Method 2: Use the Railway Dashboard Terminal

If you prefer the website, the terminal is hidden inside the deployment view.

1. Go to **Railway Dashboard** → Open your Project.
2. Click on your **App Service** (express-crud-api).
3. Click the **"Deployments"** tab.
4. **Click on the latest deployment** (the top row).
5. Look for a tab called **"Terminal"** or **"Shell"** (usually next to "Logs").
6. In that web terminal, type:
   ```bash
   npm run migrate:prod
   ```

---

## ❓ Troubleshooting

If `railway run` fails with a connection error, it might be because your local computer can't reach the Railway private network.

Since you **hardcoded the public URL** (`mysql://...shinkansen...`) in your variables, **Method 1 (CLI)** should work perfectly!
