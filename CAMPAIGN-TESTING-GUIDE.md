# 🧪 Campaign Testing Guide - WhatsApp Message Testing

## Quick Start: Test WhatsApp Messages Without Waiting

You can now trigger campaign WhatsApp messages instantly using test endpoints - no need to create users or wait for real events!

---

## 🚀 Method 1: Quick Test (Easiest)

**Test your first campaign in 3 steps:**

### Step 1: Create a Campaign
1. Go to frontend: `/dashboard/campaigns/new`
2. Select **"Bienvenida"** template
3. Click **"Activar Campaña"**
4. Note your `businessId` from the URL or database

### Step 2: Get Your Test Data
You need:
- `businessId` - Your business UUID from database
- `customerId` - Any existing customer UUID OR make one up for testing
- `phone` - **YOUR WhatsApp number** (format: `+51999999999`)
- `name` - Any test name (e.g., "Juan Test")

### Step 3: Trigger Campaign Test
```bash
curl -X POST http://localhost:3001/api/v1/dev/test-campaign-message \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "83d04291-7f1e-4290-99c6-37c76407064d",
    "customerId": "test-customer-123",
    "phone": "+51999999999",
    "name": "Juan Test"
  }'
```

**✅ You should receive a WhatsApp message within 5 seconds!**

---

## 🎯 Method 2: Trigger Specific Events

Test different campaign types by emitting specific events:

### Welcome Campaign (`customer_enrolled`)
```bash
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-uuid",
    "customerId": "your-customer-uuid",
    "eventType": "customer_enrolled",
    "name": "Maria Rodriguez",
    "phone": "+51987654321"
  }'
```

### Milestone Campaign (`stamps_reached`)
Test "Cerca del Premio" (7 stamps reached):
```bash
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-uuid",
    "customerId": "your-customer-uuid",
    "eventType": "stamps_reached",
    "value": 7,
    "name": "Pedro Gomez",
    "phone": "+51999888777"
  }'
```

### Reward Unlocked Campaign
```bash
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-uuid",
    "customerId": "your-customer-uuid",
    "eventType": "reward_unlocked",
    "rewardDescription": "1 café gratis",
    "name": "Ana Silva",
    "phone": "+51988777666"
  }'
```

### Inactivity Campaign
Test "Inactivo 14 días":
```bash
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-uuid",
    "customerId": "your-customer-uuid",
    "eventType": "customer_inactive",
    "value": 14,
    "name": "Carlos Mendez",
    "phone": "+51977666555"
  }'
```

---

## 📋 Getting Your Test Data

### Get Your Business ID
**Option 1: From Database**
```sql
SELECT id, email, name FROM businesses WHERE email = 'your-email@example.com';
```

**Option 2: From Frontend URL**
When logged in, check your browser URL:
```
/dashboard → Check auth state or API calls in Network tab
```

### Get a Customer ID
**Option 1: Use Existing Customer**
```sql
SELECT id, name, phone FROM customers
WHERE business_id = 'your-business-uuid'
LIMIT 1;
```

**Option 2: Use Fake UUID for Testing**
```
test-customer-123
```
The system will still process the event and send the message!

---

## 🔍 Verify Campaign Worked

### Check 1: Backend Logs
Look for these success indicators:
```
✅ Processing customer.enrolled event
✅ Found 1 matching campaign(s)
✅ Queued campaign message for customer: test-customer-123
✅ Message sent successfully
```

### Check 2: Database
```sql
-- Check campaign sent_count incremented
SELECT id, name, sent_count, status FROM campaigns
WHERE business_id = 'your-business-uuid';

-- Check campaign_sends table (if tracking individual sends)
SELECT * FROM campaign_sends
WHERE campaign_id = 'your-campaign-uuid'
ORDER BY sent_at DESC LIMIT 5;
```

### Check 3: WhatsApp
Check your phone for the message! It should arrive within 5-10 seconds.

### Check 4: Evolution API Response
Backend logs will show Evolution API responses:
```
Evolution API Response: { status: 'sent', messageId: '...' }
```

---

## 🛠️ Troubleshooting

### "No active campaigns found"
**Problem:** No campaigns with `status = 'active'` in database
**Fix:**
1. Go to `/dashboard/campaigns/new`
2. Create campaign and click "Activar Campaña"
3. Verify in database: `SELECT * FROM campaigns WHERE status = 'active';`

### "Event emitted but no message received"
**Possible Causes:**

1. **Campaign trigger mismatch**
   - Check `trigger_type` matches event
   - For `stamps_reached`, check `trigger_config.value` matches
   ```sql
   SELECT trigger_type, trigger_config FROM campaigns WHERE status = 'active';
   ```

2. **Redis not connected**
   - Check backend logs for: `✅ Outbox Processor started successfully`
   - If not, verify `REDIS_URL` environment variable

3. **Evolution API credentials wrong**
   - Check `EVOLUTION_API_URL` and `EVOLUTION_API_KEY`
   - Test Evolution API directly

4. **Phone number format**
   - Must include country code: `+51999999999`
   - No spaces or dashes

### "Message sent but {variables} not replaced"
**Problem:** Variables like `{nombre}` appear literally in message
**Cause:** Campaign worker not substituting variables correctly
**Check:**
- Verify `message_template` field has variables (not just `message`)
- Check backend logs for variable substitution errors

---

## 📊 Test Campaign Performance

### Load Test: Multiple Messages
```bash
# Send 10 welcome messages
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/v1/dev/test-campaign-message \
    -H "Content-Type: application/json" \
    -d "{
      \"businessId\": \"your-business-uuid\",
      \"customerId\": \"test-customer-$i\",
      \"phone\": \"+51999888777\",
      \"name\": \"Test User $i\"
    }"
  sleep 3  # Respect rate limiting (2s between messages)
done
```

### Test All Campaign Types
```bash
# 1. Welcome
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{"businessId":"uuid","customerId":"uuid","eventType":"customer_enrolled","name":"Test","phone":"+51999999999"}'

# 2. Milestone (7 stamps)
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{"businessId":"uuid","customerId":"uuid","eventType":"stamps_reached","value":7,"name":"Test","phone":"+51999999999"}'

# 3. Reward
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{"businessId":"uuid","customerId":"uuid","eventType":"reward_unlocked","name":"Test","phone":"+51999999999"}'

# 4. Inactivity
curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{"businessId":"uuid","customerId":"uuid","eventType":"customer_inactive","value":14,"name":"Test","phone":"+51999999999"}'
```

---

## 🎨 Test Message Personalization

Create a campaign with all variables and test:

**Campaign Message Template:**
```
¡Hola {nombre}! 👋

Tienes {sellos} sellos en {negocio}.
Solo {sellos_faltantes} más para tu {recompensa}! 🎁

¡Gracias por tu preferencia!
```

**Test with Real Data:**
```bash
# First, get business info to calculate correctly
# Then trigger with customer who has 7 stamps (for example)

curl -X POST http://localhost:3001/api/v1/dev/trigger-campaign-event \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-uuid",
    "customerId": "customer-with-7-stamps",
    "eventType": "stamps_reached",
    "value": 7,
    "name": "Juan Perez",
    "phone": "+51999999999"
  }'
```

**Expected Message:**
```
¡Hola Juan Perez! 👋

Tienes 7 sellos en Café Central.
Solo 3 más para tu 1 café gratis! 🎁

¡Gracias por tu preferencia!
```

---

## 🚀 Production Testing (Render)

Same commands work on production, but endpoint disabled:

```bash
# This will fail in production:
curl -X POST https://loyalty-platform-api.onrender.com/api/v1/dev/test-campaign-message \
  -H "Content-Type: application/json" \
  -d '{"businessId":"uuid","customerId":"uuid","phone":"+51999999999","name":"Test"}'

# Response:
{
  "error": "This endpoint is only available in development mode"
}
```

**To test in production:**
1. Use real customer actions (add stamps, enroll customers)
2. Or temporarily set `NODE_ENV=development` in Render (not recommended)
3. Or deploy to staging environment with dev endpoints enabled

---

## ✅ Success Checklist

Campaign testing is working when you can:
- [x] Create campaign via no-code interface
- [x] Trigger event via test endpoint
- [x] See "Event emitted successfully" response
- [x] Backend logs show "Processing [event] event"
- [x] Backend logs show "Queued campaign message"
- [x] Receive WhatsApp message within 10 seconds
- [x] Message has correct personalization ({nombre}, {sellos}, etc.)
- [x] Campaign `sent_count` incremented in database
- [x] Can repeat test with different event types

---

## 🎯 Quick Reference

**Test Endpoints (Development Only):**
- `POST /api/v1/dev/test-campaign-message` - Quick test with minimal data
- `POST /api/v1/dev/trigger-campaign-event` - Test specific event types

**Required Fields:**
- `businessId` - Your business UUID
- `customerId` - Any customer UUID (real or fake)
- `phone` - Your WhatsApp number (+51...)
- `name` - Any test name

**Event Types:**
- `customer_enrolled` - Welcome campaigns
- `stamps_reached` - Milestone campaigns (requires `value`)
- `reward_unlocked` - Reward campaigns
- `customer_inactive` - Inactivity campaigns (requires `value`)

**Backend Logs to Watch:**
```
✅ "Event emitted: customer.enrolled"
✅ "Processing customer.enrolled event"
✅ "Found X matching campaign(s)"
✅ "Queued campaign message"
✅ "Message sent successfully"
```

---

**Ready to test? Pick a method and start sending WhatsApp messages! 🚀**
