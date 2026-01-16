This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

This project requires certain environment variables to be set for database connection, authentication, and API configuration.

### Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values in `.env.local`:

### Required Variables

| Variable | Description | Where to Get It |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) > API Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (safe for browser) | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) > API Settings |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) | Your backend server URL |

### Optional Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL (for metadata/redirects) | `http://localhost:3000` |
| `ENABLE_RATE_LIMIT` | Enable client-side rate limiting | `true` |

### Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser - never put secrets in them
- After updating `.env.local`, restart your dev server: `npm run dev`
- For production, set these in your hosting platform's environment variables (Vercel, Netlify, etc.)

See `.env.example` for detailed comments and additional configuration options.

