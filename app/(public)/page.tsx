export const revalidate = 1; // Force fresh data on every request during debugging

import HomePage from '@/components/home/HomePage';
import Hero from '@/components/Hero';

export default async function Page() {
  try {
    console.log('[PAGE] Starting homepage render...');

    // Try to fetch data with graceful fallback
    let data = { professionals: [], categories: [], newsFlashes: [] };

    try {
      const dataPromise = (async () => {
        const { connectDBWithTimeout } = await import('@/lib/db/connection');
        const { ProfessionalModel, CategoryModel } = await import('@/lib/db/models');
        
        console.log('[PAGE] Connecting to DB...');
        await connectDBWithTimeout(5000); // 5 second timeout
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
          professionals: professionals?.map((p: any) => ({
            ...p,
            _id: p._id?.toString(),
            category: { ...p.category, _id: p.category?._id?.toString() },
          })) || [],
          categories: categories?.map((c: any) => ({
            ...c,
            _id: c._id?.toString(),
          })) || [],
          newsFlashes: [],
        };
      })();

      // 5 second timeout total
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Data fetch timeout')), 5000)
      );

      data = await Promise.race([dataPromise, timeoutPromise as any]);
    } catch (dbError) {
      console.error('[PAGE] DB error (using fallback):', dbError);
      // Continue with empty data - homepage still renders
    }

    console.log('[PAGE] Rendering with data:', { profCount: data.professionals?.length, catCount: data.categories?.length });
    return <HomePage data={data} />;
  } catch (error) {
    console.error('[PAGE] Fatal error:', error);
    return (
      <main style={{ padding: '2rem' }}>
        <Hero />
        <p>Error: {String(error)}</p>
      </main>
    );
  }
}
