export const revalidate = 60; // ISR: revalidate every 60 seconds

import Hero from '@/components/Hero';
import { connectDBWithTimeout } from '@/lib/db/connection';
import { ProfessionalModel, CategoryModel } from '@/lib/db/models';

export default async function Page() {
  try {
    // Direct DB query instead of API fetch to avoid caching deadlock
    await connectDBWithTimeout();

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

    const data = {
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
