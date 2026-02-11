/**
 * CategoryFilter Component - Blog category filtering
 */

'use client';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const allCategories = ['All', ...categories];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allCategories.map((category) => {
        const isSelected = category === 'All' ? !selectedCategory : selectedCategory === category;
        
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category === 'All' ? '' : category)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
              ${isSelected
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
