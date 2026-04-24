import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-2 font-sans font-medium rounded border transition-all duration-120 ease-in-out letter-spacing-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-ink-900 text-paper border-transparent hover:bg-ink-800 focus-visible:outline-emerald',
    ghost: 'bg-transparent text-ink-900 border-line-strong hover:bg-paper-alt',
    emerald: 'bg-emerald text-white border-transparent hover:brightness-95 focus-visible:outline-emerald',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3.5 text-base rounded-lg',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};
