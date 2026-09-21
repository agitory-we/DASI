import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://dasi-market.vercel.app';
  const lastModified = new Date();

  const routes = [
    '',
    '/rent',
    '/map',
    '/gigs',
    '/clinic',
    '/explore',
    '/experiences',
    '/ai-appraisal',
    '/frame',
    '/pro',
    '/cabinet'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
