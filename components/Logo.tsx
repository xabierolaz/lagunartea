import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 833 1151" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0 C274.89 0 549.78 0 833 0 C833 379.83 833 759.66 833 1151 C558.11 1151 283.22 1151 0 1151 C0 771.17 0 391.34 0 0 Z" fill="#00798C" fillOpacity="0.1" />
    <path d="M416.5 200 L600 400 L416.5 1000 L233 400 Z" fill="#00798C" fillOpacity="0.2" />
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="400" fill="#00798C" fillOpacity="0.3" fontWeight="bold" fontFamily="sans-serif">L</text>
  </svg>
);
