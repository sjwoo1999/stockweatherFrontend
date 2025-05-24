// components/Button.tsx
import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  onClick,
  className,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'rounded-full px-5 py-2 text-sm font-semibold transition-all',
        variant === 'primary' && 'bg-brand-primary text-white hover:opacity-90 shadow-md',
        variant === 'ghost' && 'bg-white text-brand-dark border border-gray-300 hover:bg-gray-50',
        className
      )}
    >
      {children}
    </button>
  );
};
