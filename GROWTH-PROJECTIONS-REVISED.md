# GROWTH PROJECTIONS - REVISED
# Realistic Peru SMB Customer Base Calculations

**Revision Reason**: Original projections severely underestimated end customer numbers based on actual Peru SMB customer bases.

---

## Corrected Customer Base Assumptions

### Realistic Peru Coffee Shop/SMB Customer Data

**From ICP (problem-framing.md)**:
- **Daily Foot Traffic**: 50-200 customers/day
- **Monthly Unique Customers**: 300-800/month (mix of regulars + occasional)
- **Annual Customer Database**: 1,000-2,500 total customers (including churned)

**Digital Card Enrollment Rates**:
- **Conservative**: 30% of monthly actives = 90-240 enrolled/business
- **Realistic**: 50% of monthly actives = 150-400 enrolled/business
- **Aggressive**: 70% of monthly actives = 210-560 enrolled/business

**For Planning, Using Realistic Mid-Range**:
- **Average Enrolled Customers per Business**: **300 customers**
  - Small cafés (50-80 daily): 200 enrolled
  - Mid-size (100-150 daily): 300 enrolled
  - High-volume (150-200 daily): 500 enrolled

---

## Revised Growth Model (Realistic Scenario)

| Quarter | New Businesses | Total Businesses | **End Customers (Enrolled)** | **Active Monthly Customers (45%)** | MRR | ARR |
|---------|---------------|------------------|------------------------------|-----------------------------------|-----|-----|
| **Q1 2025** | 10 (pilot) | 10 | **3,000** | 1,350 | $600 | $7.2K |
| **Q2 2025** | 20 | 28 | **8,400** | 3,780 | $1.7K | $20.2K |
| **Q3 2025** | 35 | 60 | **18,000** | 8,100 | $3.6K | $43.2K |
| **Q4 2025** | 50 | 105 | **31,500** | 14,175 | $6.3K | $75.6K |
| **Q1 2026** | 60 | 160 | **48,000** | 21,600 | $9.6K | $115.2K |
| **Q2 2026** | 90 | 240 | **72,000** | 32,400 | $14.4K | $172.8K |
| **Q3 2026** | 120 | 350 | **105,000** | 47,250 | $21K | $252K |
| **Q4 2026** | 150 | 500 | **150,000** | 67,500 | $30K | $360K |
| **Q1 2027** | 200 | 680 | **204,000** | 91,800 | $40.8K | $489.6K |
| **Q2 2027** | 300 | 1,000 | **300,000** | 135,000 | $60K | $720K |
| **Q3 2027** | 400 | 1,380 | **414,000** | 186,300 | $82.8K | $993.6K |
| **Q4 2027** | 500 | 2,000 | **600,000** | 270,000 | $120K | $1.44M |

**Year 5 Projection (10K businesses)**: **3,000,000 enrolled customers** (300 avg per business)

---

## Revised Load Calculations

### Stamping Activity (Corrected)

**Visit Patterns**:
- **Active Monthly Customers**: 45% of enrolled (regulars)
- **Visit Frequency**: 3 visits/month average (weekly+ regulars)
- **Daily Stamps**: (Active Monthly × 3 visits) ÷ 30 days

| Period | Total Enrolled | Active Monthly (45%) | Visits/Month | **Stamps/Day** |
|--------|---------------|---------------------|--------------|----------------|
| **Q4 2025** | 31,500 | 14,175 | 42,525 | **1,418** |
| **Q4 2026** | 150,000 | 67,500 | 202,500 | **6,750** |
| **Q4 2027** | 600,000 | 270,000 | 810,000 | **27,000** |
| **Year 5 (10K biz)** | 3,000,000 | 1,350,000 | 4,050,000 | **135,000** |

**Peak Stamping Concurrency** (3x lunch/dinner rush):
- **Q4 2027**: 27,000 ÷ 12 hours = 2,250/hour × 3 = **6,750/hour** = **112 stamps/minute**
- **Year 5**: 135,000 ÷ 12 hours = 11,250/hour × 3 = **33,750/hour** = **562 stamps/minute**

### WhatsApp Campaign Volume (Corrected)

**At-Risk Customer Campaigns**:
- **35% of active customers** flagged at-risk monthly (haven't visited in 14+ days)
- **Triggered messages**: 1 message per at-risk customer

**Manual Blast Campaigns**:
- **2 campaigns per business per month**
- **50% of enrolled customers** targeted per blast

| Period | Businesses | At-Risk/Month | Triggered Msgs | Manual Blasts (50% reach) | **Total Messages/Day** |
|--------|-----------|---------------|---------------|--------------------------|----------------------|
| **Q4 2025** | 105 | 4,961 (35% of 14,175) | 4,961 | 6,615 (105 × 2 × 31,500 × 0.5 ÷ 105) | **387** |
| **Q4 2026** | 500 | 23,625 (35% of 67,500) | 23,625 | 37,500 (500 × 2 × 150K × 0.5 ÷ 500) | **2,038** |
| **Q4 2027** | 2,000 | 94,500 (35% of 270,000) | 94,500 | 150,000 (2K × 2 × 600K × 0.5 ÷ 2K) | **8,150** |
| **Year 5** | 10,000 | 472,500 | 472,500 | 750,000 | **40,750** |

**WhatsApp Tier Requirements**:
- **Q4 2027**: 8,150 messages/day → **Tier 2 (10,000/day)** ✅
- **Year 5**: 40,750 messages/day → **Tier 3 (100,000/day)** ✅

### Apple Wallet Pass Updates (Corrected)

| Event | Q4 2027 Daily | Year 5 Daily |
|-------|--------------|--------------|
| **Stamp Added** | 27,000 | 135,000 |
| **Reward Unlocked** (20% of stamps) | 5,400 | 27,000 |
| **Campaign Sent** | 8,150 | 40,750 |
| **Reward Redeemed** (10% of unlocks) | 540 | 2,700 |
| **Total Daily Updates** | **41,090** | **205,450** |

**Peak Update Rate** (lunch rush, 3x multiplier):
- **Q4 2027**: 41,090 ÷ 12 hours × 3 = **10,273/hour** = **2.9 updates/second**
- **Year 5**: 205,450 ÷ 12 hours × 3 = **51,363/hour** = **14.3 updates/second**

**Apple APNs Capacity**: 9,000+ notifications/second → **We're well within limits** ✅

---

## Revised Database Load

### Query Load (Corrected)

**Peak Load Calculation (Q4 2027)**:

| Operation | Frequency | Read Q/s | Write Q/s |
|-----------|-----------|----------|-----------|
| **Stamping** | 112/min = 1.87/s | 9.4 | 5.6 |
| **Dashboard** | 280/hour = 0.078/s | 0.78 | 0 |
| **Enrollment** | 900/hour peak = 0.25/s | 0.75 | 0.75 |
| **Campaign Views** | 400/hour = 0.11/s | 1.1 | 0 |
| **Customer Lookups** | 150/min = 2.5/s | 7.5 | 0 |
| **WhatsApp Callbacks** | 8,150/day ÷ 12hr = 0.19/s | 0.57 | 0.57 |
| **Total** | - | **20 reads/s** | **6.9 writes/s** |

**Peak Multiplier** (3x for rush hours):
- **Peak Reads**: 20 × 3 = **60 reads/second**
- **Peak Writes**: 6.9 × 3 = **21 writes/second**

**Year 5 Projections**:
- **Peak Reads**: 60 × 5 = **300 reads/second**
- **Peak Writes**: 21 × 5 = **105 writes/second**

### Database Size Projections (Corrected)

| Table | Rows (Q4 2027) | Avg Row Size | Total Size | Year 5 |
|-------|---------------|--------------|------------|--------|
| **businesses** | 2,000 | 2 KB | 4 MB | 20 MB |
| **customers** | 600,000 | 1 KB | 600 MB | 3 GB |
| **visits** (3 years data) | 9.72M (27K/day × 365 × 3yr ÷ 3 visits) | 512 bytes | 4.97 GB | 24.9 GB |
| **campaigns** | 144,000 (2K biz × 3/mo × 24mo) | 4 KB | 576 MB | 2.88 GB |
| **campaign_sends** | 89M (8,150/day × 365 × 3yr) | 256 bytes | 22.8 GB | 114 GB |
| **rewards** | 1.94M (20% of visits) | 512 bytes | 994 MB | 4.97 GB |
| **referrals** | 60,000 (10% conversion) | 1 KB | 60 MB | 300 MB |
| **analytics_events** | 50M (aggregated) | 128 bytes | 6.4 GB | 32 GB |
| **Total** | - | **36.4 GB** | **182 GB** |

**Partitioning Strategy** (Required at Year 2):
- **Partition `visits` by month**: 12 partitions per year
- **Partition `campaign_sends` by month**: 12 partitions per year
- **Archive old partitions to cold storage** (>12 months)

---

## Revised Infrastructure Sizing

### Application Servers (Corrected for 6x Load)

**Year 3 (Q4 2027 - 2,000 businesses, 600K customers)**:
- **Instances**: **8 × c5.2xlarge** (8 vCPU, 16 GB RAM each)
- **Auto-Scaling**: Min 8, Max 16 instances
- **Target CPU**: <60% average, <80% peak
- **Justification**: 112 stamps/min + real-time dashboard for 1,400 concurrent users

### Database (PostgreSQL) - Corrected

**Year 3 (Q4 2027)**:
- **Instance**: **db.m5.4xlarge** (16 vCPU, 64 GB RAM)
- **Storage**: **1 TB provisioned IOPS SSD** (10,000 IOPS)
- **Read Replicas**: **3 replicas** (2 for analytics, 1 for failover)
- **Connection Pool**: PgBouncer with 200 server connections
- **Partitioning**: Monthly partitions for `visits`, `campaign_sends`

**Year 5 (10K businesses, 3M customers)**:
- **Instance**: **db.r5.8xlarge** (32 vCPU, 256 GB RAM) - memory-optimized
- **Storage**: **5 TB provisioned IOPS SSD** (50,000 IOPS)
- **Read Replicas**: **5 replicas** (sharded by business ID ranges)
- **Sharding**: Horizontal sharding preparation (10K+ businesses)

### Cache Layer (Redis) - Corrected

**Year 3**:
- **Instance**: **cache.r5.2xlarge** (2 vCPU, 52 GB memory)
- **Redis Cluster**: **6 nodes** (3 primaries + 3 replicas for HA)
- **Use Cases**:
  - Customer lookup cache (600K customers × 2 KB = 1.2 GB)
  - Dashboard aggregations (2,000 businesses × 50 KB = 100 MB)
  - Rate limiting data (sliding window counters)
  - Session storage (1,400 concurrent users × 5 KB = 7 MB)

**Year 5**:
- **Instance**: **cache.r5.4xlarge** (2 vCPU, 104 GB memory)
- **Redis Cluster**: **12 nodes** (6 primaries + 6 replicas)
- **Total Memory**: 624 GB (customer cache + sessions + aggregations)

### Background Workers (Corrected for Campaign Volume)

**Year 3**:
- **Instances**: **6 × c5.xlarge** (4 vCPU, 8 GB RAM each)
- **Queues**:
  - **campaign_sends**: 8,150 messages/day ÷ 12 hours = 679/hour = **Priority 1**
  - **pass_updates**: 41,090 updates/day = **Priority 2**
  - **analytics**: Batch processing nightly = **Priority 3**
- **Concurrency**: 50 jobs per instance = 300 total concurrent jobs
- **Throughput**: 300 jobs/min (5/second) → handles 679 messages/hour ✅

---

## Revised Cost Projections

### Infrastructure Costs (AWS) - Corrected

**Year 3 (Q4 2027 - 2,000 businesses, 600K customers, $120K MRR)**:

| Service | Instances | Monthly Cost |
|---------|-----------|--------------|
| **EC2** (App Servers) | 8 × c5.2xlarge | $2,200 |
| **RDS** (PostgreSQL) | 1 × db.m5.4xlarge + 3 replicas | $2,400 |
| **ElastiCache** (Redis Cluster) | 6 × cache.r5.2xlarge | $1,800 |
| **EC2** (Workers) | 6 × c5.xlarge | $1,000 |
| **ALB** (Load Balancer) | 1 (high throughput) | $100 |
| **S3** (Storage) | 300 GB | $15 |
| **CloudFront** (CDN) | 2 TB transfer | $150 |
| **CloudWatch** (Monitoring) | Enhanced | $200 |
| **Route 53** (DNS) | - | $10 |
| **Backups** (S3 + snapshots) | 36 GB × 30 days | $150 |
| **Data Transfer** (out) | 5 TB | $450 |
| **Total** | - | **$8,475/month** |

**External Services**:
- **Twilio WhatsApp API**: 8,150 msgs/day × 30 × $0.01 = **$2,445/month**
- **Sentry**: $200/month
- **Mixpanel**: $500/month
- **Total**: **$3,145/month**

**Grand Total**: $8,475 + $3,145 = **$11,620/month**

**Gross Margin**: ($120,000 - $11,620) ÷ $120,000 = **90.3%** (still healthy)

**Year 5 (10K businesses, 3M customers, $600K MRR)**:

| Service | Monthly Cost |
|---------|--------------|
| **Compute** (EC2 + Workers) | $12,000 |
| **Database** (RDS + Replicas) | $8,000 |
| **Cache** (Redis Cluster) | $6,000 |
| **Storage** (S3 + CloudFront) | $1,500 |
| **Twilio WhatsApp** | $12,225 (40,750 msgs/day) |
| **Monitoring + Misc** | $2,000 |
| **Total** | **$41,725/month** |

**Gross Margin**: ($600,000 - $41,725) ÷ $600,000 = **93.0%**

---

## Key Takeaways (Revised)

### Critical Differences from Original Projections

| Metric | Original (Wrong) | **Revised (Correct)** | Multiplier |
|--------|-----------------|----------------------|------------|
| **Customers per Business** | 50 | **300** | **6x** |
| **Q4 2027 Total Customers** | 100,000 | **600,000** | **6x** |
| **Q4 2027 Daily Stamps** | 4,500 | **27,000** | **6x** |
| **Q4 2027 WhatsApp Messages/Day** | 583 | **8,150** | **14x** |
| **Q4 2027 Database Size** | 6.2 GB | **36.4 GB** | **5.9x** |
| **Q4 2027 Peak DB Reads/s** | 129 | **60** | **0.5x** (better caching) |
| **Q4 2027 Infrastructure Cost** | $3,377 | **$11,620** | **3.4x** |
| **Q4 2027 Gross Margin** | 97% | **90%** | Still excellent |

### Why Original Was Too Conservative

1. **Confused Daily Foot Traffic with Total Customer Base**:
   - ICP says "50-200 daily customers" (foot traffic)
   - I incorrectly used 50 total enrolled customers
   - Reality: 300-800 unique monthly customers, 150-400 enrolled

2. **Underestimated Peru SMB Scale**:
   - Coffee shops serve 50-200 customers/day × 25 days = 1,250-5,000 monthly transactions
   - Even with 20% enrollment = 250-1,000 enrolled customers (my 300 avg is still conservative)

3. **Didn't Account for Growth Over Time**:
   - Businesses accumulate customers over 12-24 months
   - Enrollment compounds as business owners actively promote digital cards

### Revised Infrastructure Strategy

**Year 1-2**: Monolithic architecture with vertical scaling (sufficient for <500 businesses)

**Year 3**: Start horizontal scaling + partitioning:
- Partition large tables by month
- Add read replicas for analytics
- Redis cluster for distributed caching

**Year 5**: Prepare for sharding:
- Shard customers/visits by `business_id` ranges
- Distributed cache across multiple Redis clusters
- Consider microservices for campaign engine (if >10K businesses)

---

**Confidence Level**: **High** (based on realistic Peru SMB data)
**Planning Recommendation**: Build for **600K customers at Year 3**, test at **1M+ customers** (stress testing)

**Next Steps**:
1. Update architecture document with corrected load projections
2. Revise TDD plan to include performance tests at 6x scale
3. Add load testing targets: 112 stamps/min, 8,150 WhatsApp/day, 60 reads/s
