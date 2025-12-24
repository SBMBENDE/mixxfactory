export const revalidate = 60; // ISR: revalidate every 60 seconds

import Hero from '@/components/Hero';

export default async function Page() {
  try {
    console.log('[PAGE] Starting page render...');

    // Try to fetch data with very short timeout
    let data = { professionals: [], categories: [] };

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

        console.log('[PAGE] Data fetched');
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
        };
      })();

      // 5 second timeout total
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Data fetch timeout')), 5000)
      );

      data = await Promise.race([dataPromise, timeoutPromise as any]);
      console.log('[PAGE] Data ready:', { profCount: data.professionals?.length, catCount: data.categories?.length });
    } catch (dbError) {
      console.error('[PAGE] DB error (using fallback):', dbError);
      // Continue with empty data - homepage still renders
    }

    return (
      <main style={{ padding: '2rem' }}>
        <Hero />
        <div style={{ marginTop: '2rem' }}>
          <h2>Data Status</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      </main>
    );
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
