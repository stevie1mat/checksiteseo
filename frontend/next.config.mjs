/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
                    },
                        {
                            key: 'Content-Security-Policy',
                            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network https://*.supabase.co https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.mixpanel.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.stripe.com https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://cdn.mixpanel.com https://*.sentry.io; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://localhost:8000 https://api.checksiteaeo.com https://*.supabase.co https://api.stripe.com https://m.stripe.network https://www.google-analytics.com https://www.googletagmanager.com https://api.mixpanel.com https://*.sentry.io; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;"
                        }
                ]
            }
        ]
    }
};

export default nextConfig;
