import { MetadataRoute } from 'next'
import { locales, type Locale } from '../config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aiacounting.app'
  
  // Generate URLs for each locale
  const routes = [
    '',
    '/login',
    '/terms',
    '/privacy',
  ]
  
  const sitemap: MetadataRoute.Sitemap = []
  
  // Add routes for each locale
  locales.forEach((locale: Locale) => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc: Locale) => [loc, `${baseUrl}/${loc}${route}`])
          ),
        },
      })
    })
  })
  
  // Add root redirect
  sitemap.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  })
  
  return sitemap
} 