import React from 'react';

interface AxisLogoProps {
  variant?: 'light' | 'burgundy';
  size?: 'sm' | 'md' | 'lg';
}

export const AxisLogo: React.FC<AxisLogoProps> = ({
  variant = 'light',
  size = 'md',
}) => {
  const iconDims =
    size === 'lg' ? 'w-11 h-11' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';

  const bgFill = variant === 'light' ? '#FFFFFF' : '#97144D';
  const strokeFill = variant === 'light' ? '#97144D' : '#FFFFFF';

  return (
    <svg
      viewBox="0 0 48 48"
      className={`${iconDims} shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Axis Bank Emblem"
    >
      <rect width="48" height="48" rx="8" fill={bgFill} />
      <path d="M24 8L9 39H17.5L24 24.8L30.5 39H39L24 8Z" fill={strokeFill} />
      <path
        d="M17.2 31.5H30.8L28.1 36.2H19.9L17.2 31.5Z"
        fill={variant === 'light' ? '#ED1164' : '#F9EFF3'}
      />
    </svg>
  );
};
