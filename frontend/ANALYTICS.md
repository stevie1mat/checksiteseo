# Analytics & Monitoring Setup

This project includes comprehensive analytics and error tracking across multiple platforms:

## 📊 Analytics Platforms

### 1. **Google Analytics 4 (GA4)**
- **Purpose**: Web analytics, traffic analysis, user behavior
- **Setup**: Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.local`
- **Get ID**: [Google Analytics](https://analytics.google.com/)
- **Format**: `G-XXXXXXXXXX`

### 2. **Mixpanel**
- **Purpose**: Product analytics, user journey tracking, funnel analysis
- **Setup**: Add `NEXT_PUBLIC_MIXPANEL_TOKEN` to `.env.local`
- **Get Token**: [Mixpanel Project Settings](https://mixpanel.com/project/settings)
- **Features**:
  - User identification
  - Event tracking
  - User properties
  - Funnel analysis

### 3. **Sentry**
- **Purpose**: Error tracking, performance monitoring, session replay
- **Setup**: Add `NEXT_PUBLIC_SENTRY_DSN` (and optionally `SENTRY_DSN` for server-side) to `.env.local`
- **Get DSN**: [Sentry Project Settings](https://sentry.io/settings/YOUR_ORG/projects/YOUR_PROJECT/keys/)
- **Features**:
  - Real-time error tracking
  - Performance monitoring
  - Session replay (on errors)
  - Source maps support
  - User context tracking

## 🚀 Quick Start

1. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your keys**:
   ```env
   # Google Analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # Sentry
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   
   # Mixpanel
   NEXT_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token-here
   ```

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

## 📝 Usage

### Tracking Events

All events are automatically sent to all configured platforms:

```typescript
import { analytics } from '@/lib/analytics'

// Track a scan
analytics.trackScanStarted(url, siteId)
analytics.trackScanCompleted(url, score, siteId)

// Track authentication
analytics.trackSignupCompleted('email')
analytics.trackSigninCompleted('email')

// Track conversions
analytics.trackUpgradePlanStarted('pro')
analytics.trackUpgradePlanCompleted('pro', 25)

// Identify users (Mixpanel + Sentry)
analytics.identifyUser(userId, {
  email: 'user@example.com',
  plan: 'pro',
  signupDate: '2024-01-01'
})
```

### Error Tracking

Errors are automatically captured by Sentry:

```typescript
import { captureException } from '@/lib/sentry'

try {
  // Your code
} catch (error) {
  captureException(error, {
    context: 'additional context',
    userId: 'user-123'
  })
}
```

Or use the analytics helper:

```typescript
import { analytics } from '@/lib/analytics'

analytics.trackError('Something went wrong', {
  component: 'HeroSection',
  action: 'scan'
})
```

## 🛡️ Error Boundaries

The app includes multiple error boundaries:

1. **Root Error Boundary** (`app/error.tsx`) - Catches errors in the app
2. **Global Error Boundary** (`app/global-error.tsx`) - Catches errors in the root layout
3. **Component Error Boundary** (`components/ErrorBoundary.tsx`) - Reusable error boundary component
4. **Global Error Handler** (`components/GlobalErrorHandler.tsx`) - Catches unhandled errors and promise rejections

## 🔒 Privacy & Security

- All analytics respect Do Not Track (DNT) headers
- Sensitive data is filtered before sending
- Localhost errors are filtered in production
- Browser extension errors are ignored
- Session replay masks all text and media

## 📈 What Gets Tracked

### Automatic Tracking
- Page views (all platforms)
- Unhandled errors (Sentry)
- Unhandled promise rejections (Sentry)
- User identification (Mixpanel + Sentry)

### Manual Tracking
- Scan events (started, completed, failed)
- Authentication events (signup, signin, signout)
- Conversion events (upgrades, site additions)
- Engagement events (dashboard views, report views)
- Custom events (via `analytics.trackEvent()`)

## 🎯 Recommended Additional Tools

Consider adding these for even better insights:

1. **PostHog** - Alternative to Mixpanel, includes session replay
2. **Vercel Analytics** - If deployed on Vercel, provides Web Vitals
3. **LogRocket** - Session replay and logging (paid)
4. **Hotjar** - Heatmaps and user recordings (paid)

## 🐛 Troubleshooting

### Events not showing up?
- Check that environment variables are set correctly
- Verify tokens/IDs are valid
- Check browser console for errors
- Ensure `.env.local` is being used (not `.env`)

### Sentry not capturing errors?
- Verify DSN is correct
- Check Sentry project settings
- Ensure source maps are uploaded in production
- Check Sentry dashboard for rate limits

### Mixpanel not tracking?
- Verify token is correct
- Check Mixpanel project is active
- Verify events in Mixpanel debugger
- Check browser console for initialization errors

## 📚 Documentation

- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Mixpanel Docs](https://developer.mixpanel.com/docs)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
