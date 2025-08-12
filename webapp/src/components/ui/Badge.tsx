import React from 'react';
import { cn } from '../../util/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-200';
    
    const variants = {
      default: 'bg-sage-100 text-sage-800 border border-sage-200',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      info: 'bg-blue-100 text-blue-800 border border-blue-200',
      outline: 'bg-white text-gray-700 border border-gray-300'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Notification badge variant for showing counts
export interface NotificationBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ className, count, max = 99, showZero = false, size = 'sm', ...props }, ref) => {
    if (count === 0 && !showZero) return null;

    const displayCount = count > max ? `${max}+` : count.toString();

    return (
      <Badge
        ref={ref}
        variant="error"
        size={size}
        className={cn('min-w-[1.25rem] h-5', className)}
        {...props}
      >
        {displayCount}
      </Badge>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';

// Status badge for showing online/offline states
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  status: 'online' | 'offline' | 'away' | 'busy';
  showText?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, showText = false, size = 'sm', ...props }, ref) => {
    const statusConfig = {
      online: { variant: 'success' as const, text: 'Online', color: 'bg-green-500' },
      offline: { variant: 'default' as const, text: 'Offline', color: 'bg-gray-400' },
      away: { variant: 'warning' as const, text: 'Away', color: 'bg-yellow-500' },
      busy: { variant: 'error' as const, text: 'Busy', color: 'bg-red-500' }
    };

    const config = statusConfig[status];

    if (showText) {
      return (
        <Badge
          ref={ref}
          variant={config.variant}
          size={size}
          className={cn('gap-1.5', className)}
          {...props}
        >
          <div className={cn('w-2 h-2 rounded-full', config.color)} />
          {config.text}
        </Badge>
      );
    }

    return (
      <span
        ref={ref}
        className={cn('relative inline-block', className)}
        {...props}
      >
        <div className={cn('w-3 h-3 rounded-full border-2 border-white', config.color)} />
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export { Badge, NotificationBadge, StatusBadge };