import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

const baseUrl = SITE_URL

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
