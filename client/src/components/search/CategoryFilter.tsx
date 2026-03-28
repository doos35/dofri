import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { LayoutGrid } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide sm:flex-wrap sm:overflow-visible sm:pb-0">
      <motion.button
        onClick={() => onChange('')}
        className={cn(
          'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0',
          !active
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:text-primary-600 dark:hover:border-primary-600 dark:hover:text-primary-400'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <LayoutGrid className="w-4 h-4" />
        Tous
      </motion.button>
      {categories.map(cat => (
        <motion.button
          key={cat}
          onClick={() => onChange(cat === active ? '' : cat)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex-shrink-0',
            cat === active
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:text-primary-600 dark:hover:border-primary-600 dark:hover:text-primary-400'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );
}
