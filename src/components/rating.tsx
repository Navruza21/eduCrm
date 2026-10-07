import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const STARS = [1, 2, 3, 4, 5]

export function RatingStars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value}/5`}>
      {STARS.map((star) => (
        <Star
          key={star}
          className={cn('size-3.5', star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
        />
      ))}
    </span>
  )
}

/** 1–5 stars as a radio group; submits as `name` in the surrounding form. */
export function RatingInput({ name, label, defaultValue = 5 }: { name: string; label: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={String(star)}
          onClick={() => setValue(star)}
          className="rounded-md p-1 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Star
            className={cn('size-6', star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
          />
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}
