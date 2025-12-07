import { connectToDatabase } from '@/lib/db/connection';
import { CategoryModel } from '@/lib/db/models/Category';
import { ProfessionalModel } from '@/lib/db/models/Professional';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await CategoryModel.find({}).lean();
    const professionals = await ProfessionalModel.find({})
      .populate('category', 'name slug _id')
      .lean();

    return Response.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          emoji: cat.emoji,
        })),
        professionals: professionals.map(prof => ({
          _id: prof._id,
          name: prof.name,
          categoryId: prof.category?._id || 'NO_CATEGORY',
          categoryName: prof.category?.name || 'N/A',
          categorySlug: prof.category?.slug || 'N/A',
        })),
        summary: {
          totalCategories: categories.length,
          totalProfessionals: professionals.length,
          professionalsWithCategory: professionals.filter(p => p.category).length,
          professionalsWithoutCategory: professionals.filter(p => !p.category).length,
        }
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
