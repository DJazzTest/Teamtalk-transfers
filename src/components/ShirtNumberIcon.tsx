import React from 'react';

interface ShirtNumberIconProps {
  number: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ShirtNumberIcon: React.FC<ShirtNumberIconProps> = ({ 
  number, 
  className = '',
  size = 'md'
}) => {
  const sizeMap = {
    sm: { width: 20, height: 24, fontSize: 9 },
    md: { width: 28, height: 32, fontSize: 12 },
    lg: { width: 36, height: 40, fontSize: 16 }
  };

  const dimensions = sizeMap[size];

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 32 36"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main shirt body - simple rectangular shape with rounded top corners */}
      <path
        d="M10 10 Q10 8, 12 8 L20 8 Q22 8, 22 10 L22 32 L10 32 Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Rounded crew neck collar */}
      <path
        d="M12 10 Q16 8, 20 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Left sleeve - simple horizontal extension */}
      <path
        d="M10 12 L6 12 L6 16 L10 16 Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right sleeve - simple horizontal extension */}
      <path
        d="M22 12 L26 12 L26 16 L22 16 Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Number on shirt - centered */}
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fill="currentColor"
        fontSize={dimensions.fontSize}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        style={{ userSelect: 'none' }}
      >
        {number}
      </text>
    </svg>
  );
};
