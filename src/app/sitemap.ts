import { type MetadataRoute } from 'next';
import { db } from '~/server/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bmdavey.in";

  // Get all products dynamically for the sitemap (id and updatedAt/createdAt for accurate lastModified)
  const allProducts = await db.query.products.findMany({
    columns: {
      id: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  const productUrls: MetadataRoute.Sitemap = allProducts.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt ?? product.createdAt ?? new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/experience-offline`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...productUrls,
  ];
}
