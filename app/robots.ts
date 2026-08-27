import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chandanartgallery.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/shop/*',
          '/product/*',
          '/about',
          '/contact',
          '/blog',
          '/blog/*',
          '/faq',
          '/privacy',
          '/terms',
          '/cookies',
          '/returns',
          '/shipping',
        ],
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/profile/',
          '/profile/*',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/_next/',
          '/temp/',
          '/*.json$',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/profile/',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
