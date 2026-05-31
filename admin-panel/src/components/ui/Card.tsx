import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-gray-800 rounded-xl border border-gray-700', className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;
