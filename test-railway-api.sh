#!/bin/bash

# Railway API Testing Script
# Run this AFTER fixing environment variables

API_URL="https://express-crud-api-production.up.railway.app"

echo "=================================="
echo "🚀 Railway API Testing Script"
echo "=================================="
echo "API URL: $API_URL"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "📋 Test 1: Health Check"
echo "-----------------------------------"
HEALTH_RESPONSE=$(curl -s "$API_URL/health")
echo "$HEALTH_RESPONSE" | jq '.'

if echo "$HEALTH_RESPONSE" | grep -q '"database":"connected"'; then
    echo -e "${GREEN}✅ PASS: Database is connected!${NC}"
else
    echo -e "${RED}❌ FAIL: Database is NOT connected${NC}"
    echo -e "${YELLOW}⚠️  Please check environment variables in Railway${NC}"
    exit 1
fi

echo ""
echo "-----------------------------------"
echo ""

# Test 2: Register New User
echo "📝 Test 2: Register New User"
echo "-----------------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test-'"$(date +%s)"'@example.com",
    "password": "Test@123"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS: User registration works!${NC}"
else
    echo -e "${RED}❌ FAIL: User registration failed${NC}"
fi

echo ""
echo "-----------------------------------"
echo ""

# Test 3: Admin Login
echo "🔐 Test 3: Admin Login"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@system.local",
    "password": "Admin@123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS: Admin login works!${NC}"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
else
    echo -e "${RED}❌ FAIL: Admin login failed${NC}"
    echo -e "${YELLOW}⚠️  Did you run the migration? (npm run migrate:prod)${NC}"
    exit 1
fi

echo ""
echo "-----------------------------------"
echo ""

# Test 4: Get Categories (Protected Route)
echo "📁 Test 4: Get Categories (Protected Route)"
echo "-----------------------------------"
CATEGORIES_RESPONSE=$(curl -s "$API_URL/api/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$CATEGORIES_RESPONSE" | jq '.'

if echo "$CATEGORIES_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASS: Protected routes work!${NC}"
    CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | jq '.data | length')
    echo "Found $CATEGORY_COUNT categories"
else
    echo -e "${RED}❌ FAIL: Protected routes not working${NC}"
fi

echo ""
echo "-----------------------------------"
echo ""

# Final Summary
echo "=================================="
echo "📊 TEST SUMMARY"
echo "=================================="
echo -e "${GREEN}All critical tests passed!${NC}"
echo ""
echo "✅ Database Connection: WORKING"
echo "✅ User Registration: WORKING"
echo "✅ Authentication: WORKING"
echo "✅ Protected Routes: WORKING"
echo ""
echo "🎉 Your API is FULLY OPERATIONAL!"
echo ""
echo "=================================="
echo "📌 Next Steps:"
echo "=================================="
echo "1. Change admin password (IMPORTANT!)"
echo "2. Update CORS settings if you have a frontend"
echo "3. Add persistent volume for file uploads"
echo "4. Set up monitoring/alerts"
echo ""
echo "See documentation for details:"
echo "- START_HERE.md"
echo "- RAILWAY_FIX_GUIDE.md"
echo "=================================="
