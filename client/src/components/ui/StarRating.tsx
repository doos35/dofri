import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StarRatingProps {
  average: number;
  count: number;
  userRating: number | null;
  onRate: (score: number) => void;
}

export default function StarRating({ average, count, userRating, onRate }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const displayScore = hovered || userRating || Math.round(average);

  return (
    <div
      className="inline-flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRate(star);
          }}
          onMouseEnter={(e) => {
            e.preventDefault();
            setHovered(star);
          }}
          className="p-0 border-0 bg-transparent cursor-pointer"
        >
          <Star
            className={cn(
              'w-3.5 h-3.5 transition-colors duration-150',
              star <= displayScore
                ? hovered
                  ? 'text-amber-400 fill-amber-400'
                  : userRating && star <= userRating
                    ? 'text-violet-500 fill-violet-500'
                    : 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            )}
          />
        </button>
      ))}
      {count > 0 && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-0.5">
          {average.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}
