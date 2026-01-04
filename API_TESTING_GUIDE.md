# 🧪 API Testing Guide

This guide lists all available API endpoints and provides `curl` commands to test them.

**Base URL:** `https://express-crud-api-production.up.railway.app`

---

## � IMPORTANT: Default Admin Issue

The default admin email `admin@system.local` is currently being rejected by the API's strict email validation (it doesn't like the `.local` ending).

**✅ SOLUTION:** We will register a **new user** to test the API.

---

## 🔐 1. Authentication

### **Step 1: Register a New User**
Run this command to create a valid user:
```powershell
curl.exe -X POST https://express-crud-api-production.up.railway.app/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Password123!\",\"role\":\"user\"}'
```

### **Step 2: Login (Get Token)**
Now login with the user you just created:
```powershell
$body = @{
    email = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://express-crud-api-production.up.railway.app/api/auth/login" -Method Post -ContentType "application/json" -Body $body

# Display the token
echo $response.data.accessToken
```

### **Step 3: Save Token**
Copy the token output from above and save it:
```powershell
$token = "PASTE_YOUR_TOKEN_HERE"
```
*(Or just use `$response.data.accessToken` directly in the next commands if you are in the same PowerShell session)*

---

## 👤 2. User Routes

### **Get Profile**
```powershell
Invoke-RestMethod -Uri "https://express-crud-api-production.up.railway.app/api/auth/profile" -Headers @{ Authorization = "Bearer $token" }
```

---

## 📁 3. Project Routes

### **Get All Projects**
```powershell
Invoke-RestMethod -Uri "https://express-crud-api-production.up.railway.app/api/projects" -Headers @{ Authorization = "Bearer $token" }
```

---

## 🏷️ 4. Category Routes

### **Get All Categories**
```powershell
Invoke-RestMethod -Uri "https://express-crud-api-production.up.railway.app/api/categories" -Headers @{ Authorization = "Bearer $token" }
```

---

## 🩺 5. System Health

### **Check API Status**
```powershell
curl.exe https://express-crud-api-production.up.railway.app/health
```
**Expected:** `{"status":"OK","database":"connected"}`

---

## � How to Fix Admin Access (Optional)

If you need **Admin** access (to delete users, etc.), you have two options:

1.  **Database Change:** Log into Railway MySQL Dashboard and run:
    ```sql
    UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
    ```
    *Now your `test@example.com` user is an Admin!*

2.  **Update Admin Email:** Run this SQL to fix the default admin email:
    ```sql
    UPDATE users SET email = 'admin@example.com' WHERE email = 'admin@system.local';
    ```
    *Now you can login with `admin@example.com` / `Admin@123`*
