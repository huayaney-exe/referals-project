# Seya Frontend - Deployment Guide

## Vercel Deployment

### Prerequisites
- GitHub repository connected to Vercel
- Supabase project URL and anon key
- Vercel account

### Deployment Steps

#### 1. Connect Repository to Vercel
```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd frontend
vercel
```

#### 2. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Production Environment:**
```
NEXT_PUBLIC_SUPABASE_URL=https://qonybpevhbczbutvkbfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

```

**Preview/Development Environment:**
Same variables as production (or separate Supabase project for staging)

#### 3. Deploy

**Automatic Deployment:**
- Push to `main` branch triggers production deployment
- Push to other branches triggers preview deployments

**Manual Deployment:**
```bash
vercel --prod
```

### Build Configuration

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Post-Deployment Checklist

- [ ] Verify homepage loads at production URL
- [ ] Test authentication flow (login, register)
- [ ] Verify Supabase connection works
- [ ] Check dashboard navigation
- [ ] Test customer list page
- [ ] Test campaign creation
- [ ] Verify analytics dashboard
- [ ] Check Realtime updates work
- [ ] Run E2E tests against production

### Monitoring

**Vercel Analytics:**
- View deployment logs in Vercel Dashboard
- Monitor Web Vitals and performance metrics
- Track error rates

**Supabase Monitoring:**
- Check database connections
- Monitor API usage
- Review auth logs

### Rollback

If deployment has issues:

```bash
# Rollback to previous deployment
vercel rollback
```

Or use Vercel Dashboard → Deployments → select previous deployment → "Promote to Production"

### Custom Domain Setup

1. Go to Vercel Project → Settings → Domains
2. Add your custom domain
3. Configure DNS:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`

   OR

   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

4. Wait for DNS propagation (up to 48 hours)

### Performance Optimization

- Enable Edge Functions for authentication
- Configure ISR (Incremental Static Regeneration) for dashboard pages
- Use Next.js Image Optimization for faster loading
- Enable Vercel Analytics for monitoring

### Security

- All environment variables are encrypted at rest
- Use Supabase RLS (Row Level Security) policies
- Enable HTTPS only (automatic with Vercel)
- Configure CORS in Supabase for production domain

### Troubleshooting

**Build Fails:**
- Check build logs in Vercel Dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles locally with `npm run type-check`

**Authentication Not Working:**
- Verify environment variables are set
- Check Supabase URL configuration in Vercel
- Ensure Supabase project has correct redirect URLs

**Realtime Not Working:**
- Verify Supabase Realtime is enabled
- Check WebSocket connection in browser DevTools
- Ensure RLS policies allow subscriptions

### Support

For deployment issues:
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- GitHub Issues: [Your Repository]
