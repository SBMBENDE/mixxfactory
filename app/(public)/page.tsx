export const revalidate = 60; // ISR: revalidate every 60 seconds

import Hero from '@/components/Hero';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';

export default async function Page() {
  try {
    console.log('[PAGE] Starting data fetch...');

    // Direct DB query with explicit timeout
    const dataPromise = (async () => {
      await connectDBWithTimeout();
      console.log('[PAGE] DB connected');

      const [professionals, categories] = await Promise.all([
        ProfessionalModel.find({ active: true })
          .populate('category', 'name slug')
          .sort({ featured: -1, createdAt: -1 })
          .limit(4)
          .lean(),
        CategoryModel.find({})
          .sort({ name: 1 })
          .limit(7)
          .lean(),
      ]);

      console.log('[PAGE] Data fetched:', { profCount: professionals?.length, catCount: categories?.length });

      return {
        professionals: professionals.map((p: any) => ({
          ...p,
          _id: p._id?.toString(),
          category: { ...p.category, _id: p.category?._id?.toString() },
        })),
        categories: categories.map((c: any) => ({
          ...c,
          _id: c._id?.toString(),
        })),
      };
    })();

    // 10-second timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Data fetch timeout after 10 seconds')), 10000)
    );

    const data = await Promise.race([dataPromise, timeoutPromise as any]);
    console.log('[PAGE] Data ready');

    return (
      <main>
        <Hero />
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </main>
    );
  } catch (error) {
    console.error('[PAGE] Error:', error);
    return (
      <main>
        <Hero />
        <pre>Error: {String(error)}</pre>
      </main>
    );
  }
}
