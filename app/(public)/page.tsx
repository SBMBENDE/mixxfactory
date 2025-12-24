export const revalidate = 1;

import HomePage from '@/components/home/HomePage';
import Hero from '@/components/Hero';

export default async function Page() {
  let data = { professionals: [], categories: [], newsFlashes: [] };

  try {
    const { connectDBWithTimeout } = await import('@/lib/db/connection');
    const { ProfessionalModel, CategoryModel } = await import('@/lib/db/models');
    
    await connectDBWithTimeout(15000);

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

    data = {
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
  } catch (error) {
    console.error('[PAGE] DB fetch failed:', error);
  }

  return <HomePage data={data} />;
}
