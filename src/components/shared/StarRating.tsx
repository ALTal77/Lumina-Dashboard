import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  reviewCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  interactive = false,
  onChange,
  reviewCount,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starValue = idx + 1;
          const isFilled = currentRating >= starValue;
          const isHalf = currentRating > idx && currentRating < starValue;

          return (
            <button
              key={idx}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform p-0.5`}
            >
              <Star
                className={`${iconSizes} ${
                  isFilled
                    ? 'fill-pending text-pending'
                    : isHalf
                    ? 'fill-pending-bg text-pending'
                    : 'fill-border text-muted'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-xs font-bold text-heading ml-1 rtl:mr-1 rtl:ml-0">
        {rating.toFixed(1)}
      </span>

      {reviewCount !== undefined && (
        <span className="text-[11px] text-muted font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
