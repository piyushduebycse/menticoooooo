import React, { useState, useRef, useEffect } from 'react';
import { Type, Check, ChevronDown } from 'lucide-react';
import { useTheme, FONT_PAIRINGS } from '../context/ThemeContext';

export default function FontSwitcher() {
  const { fontPairing, setFontPairing } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pairings = Object.values(FONT_PAIRINGS);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.42rem 0.75rem',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
        }}
        title="Switch High-End Typography Pairing"
      >
        <Type size={14} color="var(--red-primary)" />
        <span style={{ display: 'none', minWidth: '95px' }} className="font-switcher-label">
          {fontPairing === 'editorial' && 'Editorial'}
          {fontPairing === 'modern' && 'Modern'}
          {fontPairing === 'cinematic' && 'Cinematic'}
        </span>
        <ChevronDown size={12} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '270px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            padding: '0.5rem',
            zIndex: 1100,
            animation: 'scaleUp 0.15s ease-out',
          }}
        >
          <div
            style={{
              padding: '0.4rem 0.6rem 0.5rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '0.35rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Google Font Pairings
          </div>

          {pairings.map((p) => {
            const isSelected = fontPairing === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setFontPairing(p.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--red-subtle)' : 'transparent',
                  border: isSelected ? '1px solid var(--red-subtle-border)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--red-primary)' : 'var(--text-main)',
                      fontFamily: p.headingFont,
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem', fontFamily: p.bodyFont }}>
                    {p.subtitle}
                  </div>
                </div>
                {isSelected && <Check size={15} color="var(--red-primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
