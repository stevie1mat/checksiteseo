import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://checksiteaeo.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/callback',
          '/mixpanel-test',
          '/sentry-test',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
