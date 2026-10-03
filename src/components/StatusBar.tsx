import React from 'react';

interface StatusBarProps {
  time?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export const StatusBar: React.FC<StatusBarProps> = ({
  time = '9:41',
  className = '',
  variant = 'light',
}) => {
  const textColor = variant === 'dark' ? '#272124' : 'var(--color-warm-porcelain)';

  return (
    <div
      className={`w-full flex items-center justify-between px-7 pt-3 pb-1 select-none z-20 ${className}`}
      style={{
        color: textColor,
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        paddingTop: '6px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Time */}
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: '15px',
          letterSpacing: '-0.2px',
          color: textColor,
        }}
      >
        {time}
      </span>

      {/* iOS Icons (Cellular, Wifi, Battery) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Cellular Signal (4 bars) */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="8" width="3" height="3" rx="0.6" />
          <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.6" />
          <rect x="9" y="3" width="3" height="8" rx="0.6" />
          <rect x="13.5" y="0" width="3" height="11" rx="0.6" />
        </svg>

        {/* Wifi Icon */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 2.2C10.5 2.2 12.8 3.1 14.5 4.6L15.6 3.4C13.6 1.7 10.9 0.6 8 0.6C5.1 0.6 2.4 1.7 0.4 3.4L1.5 4.6C3.2 3.1 5.5 2.2 8 2.2ZM8 5.6C9.6 5.6 11.1 6.2 12.3 7.2L13.4 6C11.9 4.7 9.9 4 8 4C6.1 4 4.1 4.7 2.6 6L3.7 7.2C4.9 6.2 6.4 5.6 8 5.6ZM8 9C8.9 9 9.8 9.3 10.5 10L11.6 8.8C10.6 7.9 9.3 7.4 8 7.4C6.7 7.4 5.4 7.9 4.4 8.8L5.5 10C6.2 9.3 7.1 9 8 9ZM8 10.8C7.5 10.8 7.1 11.2 7.1 11.7C7.1 12.2 7.5 12.6 8 12.6C8.5 12.6 8.9 12.2 8.9 11.7C8.9 11.2 8.5 10.8 8 10.8Z"
          />
        </svg>

        {/* Battery Icon */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '23px',
              height: '11.5px',
              border: `1px solid ${textColor}`,
              borderRadius: '3.5px',
              padding: '1.5px',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: textColor,
                borderRadius: '1.5px',
              }}
            />
          </div>
          <div
            style={{
              width: '1.5px',
              height: '4px',
              backgroundColor: textColor,
              borderTopRightRadius: '1px',
              borderBottomRightRadius: '1px',
              marginLeft: '1px',
            }}
          />
        </div>
      </div>
    </div>
  );
};
