# Campaign System Deployment Checklist

## ✅ Code Changes Pushed (Completed)
- [x] Event emissions added to stamp operations
- [x] Backend infrastructure configured
- [x] Performance fixes applied
- [x] `render.yaml` created
- [x] Committed and pushed to GitHub

**Git Commit:** `64540a8` - feat: enable event-triggered campaigns

---

## 🚀 Render Deployment Steps (In Progress)

### 1. Verify Render Auto-Deployment Started
- [ ] Check Render dashboard: [dashboard.render.com](https://dashboard.render.com)
- [ ] Verify build triggered from latest commit `64540a8`
- [ ] Monitor build logs for errors

### 2. Configure Redis in Render (REQUIRED)

**Option A: Use render.yaml (Automatic)**
If Render created Redis from blueprint:
- [ ] Verify Redis instance created: `loyalty-platform-redis`
- [ ] Verify REDIS_URL auto-configured in web service
- [ ] Check Redis connection string is valid

**Option B: Manual Redis Setup**
If not created automatically:
1. [ ] Go to Render dashboard → "New" → "Redis"
2. [ ] Name: `loyalty-platform-redis`
3. [ ] Plan: Starter (free for testing)
4. [ ] Region: Same as backend (oregon)
5. [ ] Click "Create Redis"
6. [ ] Copy connection string
7. [ ] Add to backend service:
   - Go to backend service → Environment
   - Add: `REDIS_URL` = `redis://...` (from Redis dashboard)

### 3. Verify Environment Variables

Backend service should have:
- [x] `NODE_ENV` = `production`
- [x] `PORT` = `10000` (or Render default)
- [ ] `SUPABASE_URL` = Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = From Supabase settings
- [ ] `REDIS_URL` = From Redis instance (critical!)
- [ ] `EVOLUTION_API_URL` = Your Evolution WhatsApp API
- [ ] `EVOLUTION_API_KEY` = Evolution API auth key
- [ ] `SENTRY_DSN` = (Optional) Error tracking

### 4. Monitor Backend Startup Logs

Look for these success indicators:
```
✅ 🚀 API running on port 10000
✅ 📡 Event listener initialized for campaign triggers
✅ ⏰ Inactivity checker started
✅ 🚀 Starting Outbox Processor...
✅ ✅ Outbox Processor started successfully
```

**If you see Redis warnings:**
```
❌ ⚠️ Outbox processor failed to start: Reached the max retries
❌ ⚠️ REDIS_URL not configured
```
→ Go back to Step 2 and configure Redis

### 5. Health Check Verification

Once deployed, test endpoints:
```bash
# Replace with your Render URL
curl https://your-app.onrender.com/health/live
# Should return: {"status":"alive","timestamp":"...","uptime":...}

curl https://your-app.onrender.com/health/ready
# Should return: {"status":"ready","services":{"database":"connected"}}
```

---

## 🧪 Testing Campaign System (After Deployment)

### Test 1: Create Welcome Campaign
1. [ ] Go to frontend: `/dashboard/campaigns/new`
2. [ ] Select "Bienvenida" template
3. [ ] Trigger: `customer_enrolled`
4. [ ] Click "Activar Campaña"
5. [ ] Verify campaign shows as "Active" in dashboard

### Test 2: Trigger Welcome Campaign
1. [ ] Enroll new customer OR add first stamp to existing customer
2. [ ] Check backend logs for event emission:
   ```
   Event emitted: customer.enrolled
   Processing customer.enrolled event
   Queued campaign message
   ```
3. [ ] Check customer's WhatsApp for welcome message
4. [ ] Verify campaign `sent_count` incremented in database

### Test 3: Milestone Campaign (stamps_reached)
1. [ ] Create campaign with trigger `stamps_reached: 7`
2. [ ] Add stamps to customer to reach exactly 7
3. [ ] Verify message sent when customer hits 7 stamps
4. [ ] Check message personalization: {nombre}, {sellos}, {sellos_faltantes}

### Test 4: Reward Unlocked
1. [ ] Create campaign with trigger `reward_unlocked`
2. [ ] Complete customer's stamp card (10 stamps if default)
3. [ ] Verify congratulations message sent
4. [ ] Check {recompensa} variable populated correctly

### Test 5: Inactivity Checker (Cron)
1. [ ] Create campaign with trigger `days_inactive: 7`
2. [ ] Wait for cron job (10:00 AM next day) OR trigger manually
3. [ ] Verify customers inactive 7 days receive message
4. [ ] Check {dias_inactivo} variable shows correct days

---

## 📊 Monitoring & Metrics

### Database Queries to Verify
```sql
-- Check active campaigns
SELECT id, name, trigger_type, trigger_config, status, sent_count
FROM campaigns
WHERE status = 'active'
ORDER BY created_at DESC;

-- Check campaign sends
SELECT campaign_id, COUNT(*) as total_sent,
       SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful
FROM campaign_sends
GROUP BY campaign_id;

-- Check recent stamp events (should trigger campaigns)
SELECT customer_id, business_id, stamped_at, stamps_after
FROM stamps
WHERE stamped_at > NOW() - INTERVAL '1 hour'
ORDER BY stamped_at DESC
LIMIT 10;
```

### Render Dashboard Monitoring
- [ ] Check "Metrics" tab for request volume
- [ ] Monitor "Logs" for event emissions and campaign processing
- [ ] Verify Redis memory usage (should be minimal for starter plan)
- [ ] Check response times (health endpoints should be <100ms)

### Bull Queue Statistics (via API)
```bash
curl https://your-app.onrender.com/api/v1/campaigns/queue-stats
# Returns: {bulk: {waiting, active, completed, failed}, single: {waiting, active}}
```

---

## 🔧 Troubleshooting

### Issue: "Outbox processor failed to start"
**Cause:** Redis not configured
**Fix:**
1. Create Redis instance in Render
2. Add `REDIS_URL` to backend environment variables
3. Restart backend service

### Issue: "Campaign active but message not sent"
**Causes:**
1. Events not being emitted → Check backend logs for event emission
2. Trigger mismatch → Verify `trigger_config.value` matches event value
3. Campaign status not 'active' → Check database
4. Redis not processing → Check queue statistics

**Debug Steps:**
```bash
# 1. Verify event emission (backend logs)
grep "Event emitted" logs.txt

# 2. Verify campaign trigger evaluation (backend logs)
grep "Processing.*event" logs.txt

# 3. Check database for matching campaigns
SELECT * FROM campaigns WHERE trigger_type = 'customer_enrolled' AND status = 'active';

# 4. Check Bull queue health
curl /api/v1/campaigns/queue-stats
```

### Issue: "WhatsApp message not received"
**Causes:**
1. Evolution API credentials wrong
2. Instance not connected
3. Phone number format incorrect (+51...)
4. Rate limiting (2s between messages)

**Fix:**
1. Verify `EVOLUTION_API_URL` and `EVOLUTION_API_KEY`
2. Test Evolution API directly
3. Check customer phone format in database
4. Monitor queue processing rate

---

## ✅ Success Criteria

Campaign system is fully operational when:
- [x] Code deployed to Render
- [ ] Redis configured and connected
- [ ] Backend health checks passing
- [ ] Event listeners initialized
- [ ] Inactivity checker running
- [ ] Test campaign created
- [ ] Test event triggered
- [ ] WhatsApp message received
- [ ] Campaign `sent_count` incremented
- [ ] No errors in Render logs

---

## 📈 Next Steps After Deployment

1. **Monitor First 24 Hours:**
   - Check campaign metrics hourly
   - Watch for any failed messages
   - Verify cron job runs at 10:00 AM

2. **Optimize Based on Usage:**
   - Adjust rate limiting if needed
   - Scale Redis if queue grows
   - Tune cron schedule for inactivity campaigns

3. **Add Advanced Features:**
   - Campaign A/B testing
   - Message scheduling for specific times
   - Campaign analytics dashboard
   - Message template variations

4. **Production Hardening:**
   - Add Sentry error tracking
   - Implement message retry logic
   - Add campaign pause/resume via API
   - Create campaign performance reports

---

**Current Status:** Code pushed to GitHub, Render auto-deploying. Configure Redis next! 🚀
