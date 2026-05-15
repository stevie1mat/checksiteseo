# Complete Deployment Guide: Vercel + Render

This guide covers deploying your monorepo to:
- **Vercel** (Frontend - Next.js app
- **Render** (Backend) - FastAPI service

## 📋 Prerequisites

1. **Git Repository**: Your code should be pushed to GitHub/GitLab/Bitbucket
2. **Accounts**:
   - [Vercel Account](https://vercel.com/signup) (free tier available)
   - [Render Account](https://render.com/) (free tier available)
3. **Environment Variables**: Have all your API keys ready

---

## 🚀 Part 1: Deploy Frontend to Vercel

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Select your repository and click **"Import"**

### Step 2: Configure Project Settings

**Important for Monorepo:**

1. **Root Directory**: Set to `frontend`
   - Click "Configure Project"
   - Under "Root Directory", select `frontend`
   - Or manually enter: `frontend`

2. **Framework Preset**: Should auto-detect as "Next.js"
   - If not, select "Next.js"

3. **Build Settings** (should auto-detect):
   - Build Command: `npm run build` (runs in `frontend/` directory)
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Node.js Version: 18.x or 20.x

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

#### Required:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

#### Optional (Analytics):
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XJT80S9BK0
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

#### Optional (App Config):
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note**: Add these for all environments (Production, Preview, Development)

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

### Step 5: Get Your Vercel URL

After deployment, you'll get a URL like:
- `https://your-app.vercel.app`

**Save this URL** - you'll need it for backend configuration!

---

## 🐍 Part 2: Deploy Backend to Render

### Step 1: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Select your repository

### Step 2: Configure Service

**Basic Settings:**
- **Name**: `checksiteaeo-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Advanced Settings:**
- **Instance Type**: Free tier (512 MB RAM) or paid for better performance
- **Auto-Deploy**: `Yes` (deploys on every push)

### Step 3: Add Environment Variables

Click **"Environment"** tab and add all variables from `backend/.env.example`:

#### Critical:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
DATABASE_URL=your-postgres-connection-string
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

#### AI Providers:
```
GEMINI_API_KEY=your-gemini-key
MISTRAL_API_KEY=your-mistral-key
GROQ_API_KEY=your-groq-key
EDEN_API_KEY=your-eden-key
EDEN_API_BASE_URL=https://api.edenai.run
EDEN_DEFAULT_MODEL=openai/gpt-4o-mini
```

#### Services:
```
RESEND_API_KEY=your-resend-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PRICE_ID_TOKENS_STARTER=your-starter-pack-price-id
STRIPE_PRICE_ID_TOKENS_GROWTH=your-growth-pack-price-id
STRIPE_PRICE_ID_TOKENS_SCALE=your-scale-pack-price-id
DAILY_FREE_TOKENS=1000
TOKENS_PER_SCAN=1000
TOKENS_PER_CHAT=300
MAX_SITES_PER_USER=25
TOKEN_PACK_STARTER_TOKENS=100
TOKEN_PACK_GROWTH_TOKENS=500
TOKEN_PACK_SCALE_TOKENS=2000
ENABLE_LEGACY_PLAN_GATES=false
```

#### Optional:
```
ENABLE_RATE_LIMIT=true
NODE_ENV=production
```

**Important**: 
- Replace `ALLOWED_ORIGINS` with your actual Vercel URL(s)
- Add your custom domain if you have one

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment.

### Step 5: Get Your Render URL

After deployment, you'll get a URL like:
- `https://checksiteaeo-backend.onrender.com`

**Save this URL** - you'll need it for frontend configuration!

---

## 🔄 Part 3: Connect Frontend and Backend

### Update Frontend Environment Variable

1. Go back to **Vercel Dashboard**
2. Open your project → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://checksiteaeo-backend.onrender.com
   ```
4. Click **"Save"**
5. **Redeploy** your frontend (or push a new commit)

### Update Backend CORS

1. Go to **Render Dashboard**
2. Open your backend service → **Environment**
3. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
   ```
4. **Redeploy** your backend (or push a new commit)

---

## ✅ Part 4: Verify Deployment

### Test Frontend:
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check that the site loads
3. Test authentication
4. Test a scan (should connect to backend)

### Test Backend:
1. Visit: `https://your-backend.onrender.com/docs`
2. You should see the FastAPI Swagger UI
3. Test the `/health` endpoint

### Test Integration:
1. Try scanning a URL from the frontend
2. Check that it connects to the backend
3. Verify data flows correctly

---

## 🔧 Troubleshooting

### Frontend Issues:

**Build Fails:**
- Check build logs in Vercel
- Verify all environment variables are set
- Check Node.js version compatibility

**API Connection Errors:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Ensure backend is running

### Backend Issues:

**Deployment Fails:**
- Check build logs in Render
- Verify `requirements.txt` is correct
- Check Python version compatibility

**Service Crashes:**
- Check logs in Render dashboard
- Verify all environment variables are set
- Check database connection

**CORS Errors:**
- Verify `ALLOWED_ORIGINS` includes your Vercel URL
- Check for trailing slashes
- Ensure URLs match exactly (http vs https)

---

## 📝 Custom Domain Setup

### Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Render (Backend):
1. Go to Service Settings → Custom Domain
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records
4. Update `ALLOWED_ORIGINS` to include new domain

---

## 🔐 Security Checklist

- [ ] All environment variables are set (no hardcoded secrets)
- [ ] `ALLOWED_ORIGINS` only includes your domains
- [ ] Database credentials are secure
- [ ] API keys are not exposed in frontend code
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] CORS is properly configured

---

## 📊 Monitoring

### Vercel:
- Check deployment logs
- Monitor function execution
- View analytics (if enabled)

### Render:
- Check service logs
- Monitor uptime
- View metrics (CPU, Memory, etc.)

---

## 🎉 You're Done!

Your app should now be live:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

Both services will auto-deploy on every git push to your main branch!
