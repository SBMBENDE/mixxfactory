import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  color?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const colorMap = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export const Badge: React.FC<BadgeProps> = ({ children, color = 'info', className }) => (
  <span
    className={clsx(
      'inline-block px-2 py-0.5 rounded text-xs font-semibold',
      colorMap[color],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
