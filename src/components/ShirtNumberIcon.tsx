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
    sm: { width: 24, height: 28, fontSize: 11, strokeWidth: 1.5 },
    md: { width: 32, height: 36, fontSize: 16, strokeWidth: 2 },
    lg: { width: 40, height: 44, fontSize: 20, strokeWidth: 2.5 }
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
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth={dimensions.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Rounded crew neck collar */}
      <path
        d="M12 10 Q16 8, 20 10"
        fill="none"
        stroke="currentColor"
        strokeWidth={dimensions.strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Left sleeve - simple horizontal extension */}
      <path
        d="M10 12 L6 12 L6 16 L10 16 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth={dimensions.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right sleeve - simple horizontal extension */}
      <path
        d="M22 12 L26 12 L26 16 L22 16 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth={dimensions.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Number on shirt - centered with better visibility */}
      <text
        x="16"
        y="24"
        textAnchor="middle"
        fill="currentColor"
        fontSize={dimensions.fontSize}
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        style={{ 
          userSelect: 'none',
          filter: 'drop-shadow(0 0 2px currentColor)',
          opacity: 1
        }}
        stroke="currentColor"
        strokeWidth="0.5"
        paintOrder="stroke fill"
      >
        {number}
      </text>
    </svg>
  );
};
