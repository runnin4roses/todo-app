import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  interactive?: boolean;
  as?: 'article' | 'section' | 'div';
}

export function Card({
  children,
  interactive = false,
  as: Component = 'div',
  className = '',
  ...props
}: CardProps) {
  return (
    <Component
      className={[
        'relative overflow-hidden rounded-[32px] bg-clay-card p-6 text-clay-foreground shadow-clay-card backdrop-blur-xl sm:p-8',
        interactive
          ? 'transition-all duration-500 hover:-translate-y-2 hover:shadow-clay-card-hover'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </Component>
  );
}
