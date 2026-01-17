# Vercel Deployment Guide

This guide covers deploying the CheckSiteAEO frontend to Vercel.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

Add these environment variables in your Vercel project settings:

#### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_API_URL` - Your production backend API URL (e.g., `https://api.checksiteaeo.com`)

#### Optional (Analytics)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 ID (format: `G-XXXXXXXXXX`)
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- `SENTRY_DSN` - Sentry DSN for server-side (optional, can use `NEXT_PUBLIC_SENTRY_DSN`)
- `NEXT_PUBLIC_MIXPANEL_TOKEN` - Mixpanel project token

#### Optional (App Configuration)
- `NEXT_PUBLIC_APP_URL` - Your production app URL (e.g., `https://checksiteaeo.com`)

### 2. Backend Configuration

Ensure your backend has:
- `ALLOWED_ORIGINS` includes your Vercel domain (e.g., `https://your-app.vercel.app,https://checksiteaeo.com`)
- Backend is deployed and accessible at the URL you set in `NEXT_PUBLIC_API_URL`

### 3. Build Settings

Vercel should auto-detect Next.js, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x or 20.x

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Root Directory**: `frontend` (if monorepo)
   - **Framework Preset**: Next.js
5. Add all environment variables
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts to link project and set environment variables
```

### Option 3: Deploy via Git Integration

1. Connect your Git repository to Vercel
2. Vercel will auto-deploy on every push to main/master
3. Add environment variables in project settings

## 🔧 Post-Deployment

### 1. Verify Deployment

- Check that the site loads correctly
- Test authentication flows
- Verify API connections
- Check analytics are tracking (if configured)

### 2. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` if needed

### 3. Sentry Source Maps (Optional)

For better error tracking in production:

1. Install Sentry CLI: `npm install -g @sentry/cli`
2. Create `sentry.properties`:
   ```properties
   [defaults]
   org=your-org
   project=your-project
   ```
3. Add build command in Vercel:
   ```bash
   npm run build && npx @sentry/cli sourcemaps inject --org=your-org --project=your-project
   ```

### 4. Environment-Specific Settings

- **Production**: Set `NODE_ENV=production` (automatic on Vercel)
- **Preview**: Uses branch name as environment
- **Development**: Uses `NODE_ENV=development`

## 🐛 Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Verify all required environment variables are set
3. Check Node.js version compatibility
4. Review TypeScript errors locally: `npm run build`

### API Connection Issues

1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend CORS settings include Vercel domain
3. Test API endpoint directly: `curl https://your-api.com/health`

### Analytics Not Working

1. Verify environment variables are set (check for typos)
2. Check browser console for errors
3. Verify tokens/IDs are correct
4. Check CSP headers allow analytics domains

### Sentry Not Capturing Errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check Sentry project settings
3. Verify source maps are uploaded (if using)
4. Check Sentry dashboard for rate limits

## 📝 Notes

- Vercel automatically handles:
  - SSL certificates
  - CDN distribution
  - Edge network
  - Preview deployments for PRs
  - Automatic builds on git push

- The `vercel.json` file is optional but can help with configuration
- Environment variables are encrypted and secure
- Preview deployments use the same environment variables as production (unless overridden)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
