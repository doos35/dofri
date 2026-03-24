import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Tag } from 'lucide-react';

interface TagFilterProps {
  tags: { tag: string; count: number }[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagFilter({ tags, activeTags, onToggle }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mr-1">
        <Tag className="w-4 h-4" />
        <span>Tags:</span>
      </div>
      {tags.map(({ tag, count }) => (
        <motion.button
          key={tag}
          onClick={() => onToggle(tag)}
          className={cn(
            'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
            activeTags.includes(tag)
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tag}
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full',
            activeTags.includes(tag) ? 'bg-violet-500' : 'bg-gray-200 dark:bg-gray-600'
          )}>
            {count}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
