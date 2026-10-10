import React from 'react';

export default function Spinner({ size = 'sm', color = 'white', text = null }) {
  const sizeMap = {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
  };

  const dimension = sizeMap[size] || 18;

  const colorClassMap = {
    white: 'spinner-icon-white',
    red: 'spinner-icon-red',
    black: 'spinner-icon-black',
  };

  const colorClass = colorClassMap[color] || 'spinner-icon-white';

  return (
    <span className="spinner-wrapper" style={{ gap: text ? '0.5rem' : 0 }}>
      <span
        className={`spinner-icon ${colorClass}`}
        style={{
          width: `${dimension}px`,
          height: `${dimension}px`,
          borderWidth: dimension > 24 ? '3px' : '2px',
        }}
        aria-hidden="true"
      />
      {text && <span style={{ fontSize: '0.9em', fontWeight: 600 }}>{text}</span>}
    </span>
  );
}
