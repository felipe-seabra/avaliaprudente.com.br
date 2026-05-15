'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
  disabled?: boolean
}

export function StarRating({ rating, onRatingChange, disabled }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            'transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100',
            (hover || rating) >= star ? 'text-yellow-400' : 'text-muted'
          )}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          <Star
            size={48}
            fill={(hover || rating) >= star ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </button>
      ))}
    </div>
  )
}
