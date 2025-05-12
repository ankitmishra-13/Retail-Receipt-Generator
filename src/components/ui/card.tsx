import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={`card ${className || ''}`}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
