import React from 'react';

const HexagonLogo = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagon background with gradient */}
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Hexagon shape */}
      <polygon 
        points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
        fill="url(#hexGradient)"
        stroke="none"
      />
      
      {/* Letter H */}
      <text
        x="50"
        y="50"
        fontFamily="Arial, sans-serif"
        fontSize="48"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        H
      </text>
    </svg>
  );
};

export default HexagonLogo;

