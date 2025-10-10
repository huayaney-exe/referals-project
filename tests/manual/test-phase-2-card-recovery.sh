#!/bin/bash
# Manual API Test: Phase 2 - Card Recovery Endpoint
#
# Prerequisites:
# 1. Backend server running on port 3000
# 2. WhatsApp connected for business
# 3. Valid auth token

set -e

API_URL="${API_URL:-http://localhost:3000}"
CUSTOMER_ID=""
AUTH_TOKEN=""

echo "🧪 Testing Phase 2: Card Recovery via WhatsApp"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if backend server is running..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server not running on $API_URL${NC}"
    echo "   Start it with: npm start"
    exit 1
fi

# Get auth token from user
echo ""
echo "🔑 Authentication Setup"
echo "----------------------"
echo "Please provide your auth token (from localStorage):"
echo "1. Open browser dev console"
echo "2. Run: localStorage.getItem('authToken')"
echo "3. Copy the token"
echo ""
read -p "Auth Token: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ No auth token provided${NC}"
    exit 1
fi

# Test 1: Get list of customers
echo ""
echo "Test 1: Fetch customers to get a test customer ID"
echo "--------------------------------------------------"
CUSTOMERS_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/customers" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

# Extract first customer ID
CUSTOMER_ID=$(echo "$CUSTOMERS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CUSTOMER_ID" ]; then
    echo -e "${RED}❌ No customers found${NC}"
    echo "Response: $CUSTOMERS_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Found customer ID: $CUSTOMER_ID${NC}"

# Test 2: Send card recovery (valid request)
echo ""
echo "Test 2: Send card recovery to valid customer"
echo "---------------------------------------------"
SEND_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "$API_URL/api/v1/customers/$CUSTOMER_ID/send-card" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$SEND_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$SEND_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Card recovery sent successfully${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ Failed with status $HTTP_STATUS${NC}"
    echo "Response: $BODY"
fi

# Test 3: Test rate limiting
echo ""
echo "Test 3: Test rate limiting (11 rapid requests)"
echo "-----------------------------------------------"
echo "Sending 11 requests rapidly..."

RATE_LIMITED=false
for i in {1..11}; do
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
      "$API_URL/api/v1/customers/$CUSTOMER_ID/send-card" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -H "Content-Type: application/json")

    STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

    if [ "$STATUS" == "429" ]; then
        RATE_LIMITED=true
        echo -e "${GREEN}✅ Rate limit triggered at request #$i${NC}"
        break
    fi

    echo "   Request #$i: Status $STATUS"
    sleep 0.5
done

if [ "$RATE_LIMITED" = false ]; then
    echo -e "${YELLOW}⚠️  Rate limit not triggered after 11 requests${NC}"
fi

# Test 4: Test with invalid customer ID
echo ""
echo "Test 4: Send to invalid customer ID"
echo "------------------------------------"
INVALID_ID="00000000-0000-0000-0000-000000000000"
INVALID_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "$API_URL/api/v1/customers/$INVALID_ID/send-card" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json")

INVALID_STATUS=$(echo "$INVALID_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$INVALID_STATUS" == "404" ]; then
    echo -e "${GREEN}✅ Correctly returned 404 for invalid customer${NC}"
else
    echo -e "${RED}❌ Expected 404, got $INVALID_STATUS${NC}"
fi

# Test 5: Test without auth
echo ""
echo "Test 5: Send without authentication"
echo "------------------------------------"
NOAUTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "$API_URL/api/v1/customers/$CUSTOMER_ID/send-card" \
  -H "Content-Type: application/json")

NOAUTH_STATUS=$(echo "$NOAUTH_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$NOAUTH_STATUS" == "401" ]; then
    echo -e "${GREEN}✅ Correctly returned 401 without auth${NC}"
else
    echo -e "${RED}❌ Expected 401, got $NOAUTH_STATUS${NC}"
fi

echo ""
echo "================================================"
echo "✅ API Tests Complete"
echo "================================================"
echo ""
echo "Next: Check WhatsApp for the card recovery message"
