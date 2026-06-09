import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tenderintel.ru';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/login', '/register'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/onboarding'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
