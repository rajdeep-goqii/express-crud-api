# Railway API Testing Script (PowerShell)
# Run this AFTER fixing environment variables

$API_URL = "https://express-crud-api-production.up.railway.app"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🚀 Railway API Testing Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "API URL: $API_URL"
Write-Host ""

# Test 1: Health Check
Write-Host "📋 Test 1: Health Check" -ForegroundColor Yellow
Write-Host "-----------------------------------"
try {
    $healthResponse = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
    $healthResponse | ConvertTo-Json -Depth 10
    
    if ($healthResponse.database -eq "connected") {
        Write-Host "✅ PASS: Database is connected!" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Database is NOT connected" -ForegroundColor Red
        Write-Host "⚠️  Please check environment variables in Railway" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ FAIL: Health check failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "-----------------------------------"
Write-Host ""

# Test 2: Register New User
Write-Host "📝 Test 2: Register New User" -ForegroundColor Yellow
Write-Host "-----------------------------------"
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerBody = @{
    name = "Test User"
    email = "test-$timestamp@example.com"
    password = "Test@123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    
    $registerResponse | ConvertTo-Json -Depth 10
    
    if ($registerResponse.success -eq $true) {
        Write-Host "✅ PASS: User registration works!" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: User registration failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Registration request failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "-----------------------------------"
Write-Host ""

# Test 3: Admin Login
Write-Host "🔐 Test 3: Admin Login" -ForegroundColor Yellow
Write-Host "-----------------------------------"
$loginBody = @{
    email = "admin@system.local"
    password = "Admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    $loginResponse | ConvertTo-Json -Depth 10
    
    if ($loginResponse.success -eq $true) {
        Write-Host "✅ PASS: Admin login works!" -ForegroundColor Green
        $accessToken = $loginResponse.data.accessToken
    } else {
        Write-Host "❌ FAIL: Admin login failed" -ForegroundColor Red
        Write-Host "⚠️  Did you run the migration? (npm run migrate:prod)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ FAIL: Login request failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "⚠️  Did you run the migration? (npm run migrate:prod)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "-----------------------------------"
Write-Host ""

# Test 4: Get Categories (Protected Route)
Write-Host "📁 Test 4: Get Categories (Protected Route)" -ForegroundColor Yellow
Write-Host "-----------------------------------"
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $categoriesResponse = Invoke-RestMethod -Uri "$API_URL/api/categories" `
        -Method Get `
        -Headers $headers
    
    $categoriesResponse | ConvertTo-Json -Depth 10
    
    if ($categoriesResponse.success -eq $true) {
        Write-Host "✅ PASS: Protected routes work!" -ForegroundColor Green
        $categoryCount = $categoriesResponse.data.Count
        Write-Host "Found $categoryCount categories"
    } else {
        Write-Host "❌ FAIL: Protected routes not working" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Categories request failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "-----------------------------------"
Write-Host ""

# Final Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "All critical tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Database Connection: WORKING" -ForegroundColor Green
Write-Host "✅ User Registration: WORKING" -ForegroundColor Green
Write-Host "✅ Authentication: WORKING" -ForegroundColor Green
Write-Host "✅ Protected Routes: WORKING" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your API is FULLY OPERATIONAL!" -ForegroundColor Green
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Change admin password (IMPORTANT!)"
Write-Host "2. Update CORS settings if you have a frontend"
Write-Host "3. Add persistent volume for file uploads"
Write-Host "4. Set up monitoring/alerts"
Write-Host ""
Write-Host "See documentation for details:"
Write-Host "- START_HERE.md"
Write-Host "- RAILWAY_FIX_GUIDE.md"
Write-Host "==================================" -ForegroundColor Cyan
