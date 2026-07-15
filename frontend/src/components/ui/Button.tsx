import { useCallback, type MouseEvent } from 'react';
import { useSoundPreference } from '../../context/SoundPreferenceContext';
import type { ButtonHTMLAttributes } from 'react';
import { playButtonSound } from '../../utils/sounds';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'default' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-button hover:shadow-clay-button-hover',
  secondary:
    'bg-white text-clay-foreground shadow-clay-button hover:shadow-clay-button-hover',
  outline:
    'border-2 border-clay-accent/20 bg-transparent text-clay-accent hover:border-clay-accent hover:bg-clay-accent/5 shadow-none',
  ghost:
    'bg-transparent text-clay-foreground shadow-none hover:bg-clay-accent/10 hover:text-clay-accent',
  danger:
    'bg-gradient-to-br from-[#F472B6] to-[#DB2777] text-white shadow-clay-button hover:shadow-clay-button-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-11 px-5 text-sm',
  default: 'h-14 px-6 text-base',
  lg: 'h-16 px-8 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  children,
  onClick,
  ...props
}: ButtonProps) {
  const { soundsEnabled } = useSoundPreference();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!disabled && soundsEnabled) {
        playButtonSound();
      }

      onClick?.(event);
    },
    [disabled, onClick, soundsEnabled]
  );

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={[
        'inline-flex items-center justify-center rounded-[20px] border-0 font-bold tracking-wide transition-all duration-200',
        'hover:-translate-y-1 active:scale-[0.92] active:shadow-clay-pressed',
        'focus-visible:ring-4 focus-visible:ring-clay-accent/30 focus-visible:ring-offset-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none disabled:translate-y-0 disabled:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
