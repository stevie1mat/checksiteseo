# Quick Deployment Checklist

## 🚀 Vercel (Frontend) - 5 Minutes

1. **Go to**: [vercel.com/new](https://vercel.com/new)
2. **Import** your Git repository
3. **Configure**:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XJT80S9BK0
   ```
5. **Deploy** → Done! ✅

---

## 🐍 Render (Backend) - 10 Minutes

1. **Go to**: [dashboard.render.com](https://dashboard.render.com/)
2. **New +** → **Web Service**
3. **Connect** your Git repository
4. **Configure**:
   - Name: `checksiteaeo-backend`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables** (from `backend/.env.example`)
   - **Critical**: `ALLOWED_ORIGINS=https://your-app.vercel.app`
6. **Deploy** → Done! ✅

---

## 🔗 Connect Them

1. **Get Backend URL** from Render (e.g., `https://xxx.onrender.com`)
2. **Update Frontend** in Vercel:
   - Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Render URL
   - Redeploy
3. **Update Backend** in Render:
   - Environment → Update `ALLOWED_ORIGINS` with your Vercel URL
   - Redeploy

---

## ✅ Test

- Frontend: Visit your Vercel URL
- Backend: Visit `https://your-backend.onrender.com/docs`
- Integration: Try a scan from the frontend

**Done!** 🎉
