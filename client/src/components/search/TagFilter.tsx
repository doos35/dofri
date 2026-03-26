import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Tag, ChevronDown } from 'lucide-react';

const VISIBLE_COUNT = 6;

interface TagFilterProps {
  tags: { tag: string; count: number }[];
  activeTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagFilter({ tags, activeTags, onToggle }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) return null;

  const visibleTags = expanded ? tags : tags.slice(0, VISIBLE_COUNT);
  const hiddenCount = tags.length - VISIBLE_COUNT;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mr-1">
          <Tag className="w-4 h-4" />
          <span>Tags:</span>
        </div>
        <AnimatePresence initial={false}>
          {visibleTags.map(({ tag, count }) => (
            <motion.button
              key={tag}
              onClick={() => onToggle(tag)}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                activeTags.includes(tag)
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
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
        </AnimatePresence>
        {hiddenCount > 0 && (
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? 'Moins' : `+${hiddenCount}`}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
