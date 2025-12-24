/**
 * Popular Categories - Server Component
 * Fetches data server-side, streams via Suspense
 * Properly implements ISR with revalidate
 */

export const revalidate = 60;

import PopularCategoriesServer from '@/components/PopularCategoriesServer';
import { getPopularCategories } from '@/lib/homepage-data';

export default async function PopularCategories() {
  const categories = await getPopularCategories();

  if (!categories || categories.length === 0) {
    return null;
  }

  return <PopularCategoriesServer categories={categories} />;
}
