import React from 'react';
import clsx from 'clsx';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.5,
  className,
  style,
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    style,
  };

  switch (name) {
    case 'check':
      return (
        <svg {...commonProps}>
          <path d="M4 12.5L9 17.5L20 6.5" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5L11 15.5L16 9.5" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...commonProps}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'external':
      return (
        <svg {...commonProps}>
          <path d="M14 5h5v5M19 5l-9 9M14 13v6H5V10h6" />
        </svg>
      );
    case 'copy':
      return (
        <svg {...commonProps}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...commonProps}>
          <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg {...commonProps}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
          <path d="M9 12l2.5 2.5L15 11" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...commonProps}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...commonProps}>
          <rect x="5" y="11" width="14" height="9" rx="1.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...commonProps}>
          <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8Z" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...commonProps}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case 'warn':
      return (
        <svg {...commonProps}>
          <path d="M12 3L2 20h20L12 3Z" />
          <path d="M12 10v5M12 18v.5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'link':
      return (
        <svg {...commonProps}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7L12 6.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7L12 17.5" />
        </svg>
      );
    case 'info':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v6M12 7.5v.5" />
        </svg>
      );
    case 'stripe-s':
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <path
            d="M12.8 7.3c-1.6 0-2.9.5-3.9 1.4-.9.9-1.3 2.1-1.3 3.5v.2c0 1.8.8 3 2.4 3.7l3.2 1.3c.9.4 1.3.8 1.3 1.4 0 .7-.6 1.1-1.8 1.1-1.4 0-3.3-.6-4.9-1.5v3.2c1.6.6 3.2 1 4.9 1 1.8 0 3.2-.4 4.2-1.3 1-.9 1.5-2.1 1.5-3.6v-.2c0-1.8-.9-3.1-2.6-3.8l-3-1.2c-.9-.4-1.3-.8-1.3-1.3 0-.6.5-1 1.5-1 1.4 0 3 .5 4.5 1.3V7.9c-1.5-.5-2.9-.6-4.7-.6Z"
            fill={color}
            stroke="none"
          />
        </svg>
      );
    case 'logo-mark':
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="18" height="18" rx="5" fill={color} stroke="none" />
          <path d="M8 12.5L11 15.5L16.5 9.5" stroke="#F6F4EE" strokeWidth="1.6" />
        </svg>
      );
    default:
      return null;
  }
};
