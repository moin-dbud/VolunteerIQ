'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, ChevronDown, Check, X } from 'lucide-react';

// ── Country list (flag emoji + name + dial code) ──────────────────────────────
const COUNTRIES = [
  { code: 'IN', flag: '🇮🇳', name: 'India',                dial: '+91'  },
  { code: 'US', flag: '🇺🇸', name: 'United States',        dial: '+1'   },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom',       dial: '+44'  },
  { code: 'AU', flag: '🇦🇺', name: 'Australia',            dial: '+61'  },
  { code: 'CA', flag: '🇨🇦', name: 'Canada',               dial: '+1'   },
  { code: 'AE', flag: '🇦🇪', name: 'UAE',                  dial: '+971' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore',            dial: '+65'  },
  { code: 'DE', flag: '🇩🇪', name: 'Germany',              dial: '+49'  },
  { code: 'FR', flag: '🇫🇷', name: 'France',               dial: '+33'  },
  { code: 'JP', flag: '🇯🇵', name: 'Japan',                dial: '+81'  },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil',               dial: '+55'  },
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria',              dial: '+234' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa',         dial: '+27'  },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya',                dial: '+254' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan',             dial: '+92'  },
  { code: 'BD', flag: '🇧🇩', name: 'Bangladesh',           dial: '+880' },
  { code: 'NP', flag: '🇳🇵', name: 'Nepal',                dial: '+977' },
  { code: 'LK', flag: '🇱🇰', name: 'Sri Lanka',            dial: '+94'  },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines',          dial: '+63'  },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia',            dial: '+62'  },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia',             dial: '+60'  },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand',             dial: '+66'  },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico',               dial: '+52'  },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina',            dial: '+54'  },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt',                dial: '+20'  },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana',                dial: '+233' },
  { code: 'ET', flag: '🇪🇹', name: 'Ethiopia',             dial: '+251' },
  { code: 'TZ', flag: '🇹🇿', name: 'Tanzania',             dial: '+255' },
  { code: 'RW', flag: '🇷🇼', name: 'Rwanda',               dial: '+250' },
];

interface PhoneModalProps {
  isOpen: boolean;
  onSave: (phone: string) => void;
  onSkip: () => void;
}

export default function PhoneModal({ isOpen, onSave, onSkip }: PhoneModalProps) {
  const [selected, setSelected] = useState(COUNTRIES[0]); // Default: India
  const [dropOpen, setDropOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [number, setNumber] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isOpen) return null;

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  // Strip leading zeros and spaces, keep only digits
  const cleanNumber = (n: string) => n.replace(/\D/g, '').replace(/^0+/, '');

  const getFormatted = () => `${selected.dial}${cleanNumber(number)}`;

  const handleSave = async () => {
    const digits = cleanNumber(number);
    if (!digits) { setError('Please enter your mobile number.'); return; }
    if (digits.length < 7 || digits.length > 12) { setError('Enter a valid mobile number (7–12 digits).'); return; }
    setError('');
    setSaving(true);
    await onSave(getFormatted());
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-accent)',
        borderRadius: '20px',
        padding: '36px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 40px var(--accent-glow)',
        position: 'relative',
        animation: 'phoneModalIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
      }}>
        <style>{`
          @keyframes phoneModalIn {
            0%  { opacity:0; transform: scale(0.92) translateY(16px); }
            100%{ opacity:1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Close button */}
        <button onClick={onSkip} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}>
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(192,38,211,0.15))', border: '1px solid rgba(147,51,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Phone size={24} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Add Your Phone Number
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Used for WhatsApp mission alerts and dispatch notifications. You can skip this and add it later in Settings.
          </p>
        </div>

        {/* Phone Input */}
        <div style={{ marginBottom: '6px' }}>
          <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            MOBILE NUMBER
          </label>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            {/* Country dropdown trigger */}
            <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setDropOpen((o) => !o)}
                style={{
                  height: '48px', padding: '0 12px',
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${dropOpen ? 'var(--border-focus)' : 'var(--border-default)'}`,
                  borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontSize: '15px',
                  transition: 'border-color 0.15s ease',
                  boxShadow: dropOpen ? '0 0 0 3px var(--accent-glow)' : 'none',
                  minWidth: '110px',
                }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{selected.flag}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text-secondary)' }}>{selected.dial}</span>
                <ChevronDown size={13} color="var(--text-muted)" style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {/* Dropdown */}
              {dropOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                  zIndex: 100, width: '280px',
                  overflow: 'hidden',
                  animation: 'phoneModalIn 0.15s ease-out',
                }}>
                  {/* Search */}
                  <div style={{ padding: '10px', borderBottom: '1px solid var(--border-default)' }}>
                    <input
                      autoFocus
                      className="input-field"
                      style={{ height: '36px', fontSize: '13px' }}
                      placeholder="Search country..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {filtered.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No results</div>
                    ) : filtered.map((c) => (
                      <button
                        key={`${c.code}-${c.dial}`}
                        type="button"
                        onClick={() => { setSelected(c); setDropOpen(false); setSearch(''); }}
                        style={{
                          width: '100%', padding: '10px 14px',
                          background: selected.code === c.code ? 'rgba(147,51,234,0.1)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '10px',
                          textAlign: 'left',
                          borderLeft: `3px solid ${selected.code === c.code ? 'var(--accent-primary)' : 'transparent'}`,
                          transition: 'background 0.1s ease',
                        }}
                        onMouseEnter={(e) => { if (selected.code !== c.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { if (selected.code !== c.code) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>{c.flag}</span>
                        <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>{c.name}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>{c.dial}</span>
                        {selected.code === c.code && <Check size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Number input */}
            <input
              type="tel"
              className="input-field"
              style={{ height: '48px', fontSize: '16px', letterSpacing: '0.05em', borderRadius: '10px', flex: 1 }}
              placeholder="98765 43210"
              value={number}
              onChange={(e) => { setNumber(e.target.value.replace(/[^\d\s-]/g, '')); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            />
          </div>

          {/* Preview */}
          {number && cleanNumber(number).length > 3 && (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--accent-primary)', marginTop: '8px', paddingLeft: '2px' }}>
              Will be saved as: {getFormatted()}
            </p>
          )}

          {error && (
            <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '8px' }}>{error}</p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onSkip}
            style={{
              height: '48px', flex: '0 0 auto', padding: '0 20px',
              background: 'transparent', border: '1px solid var(--border-default)',
              borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 500,
              color: 'var(--text-secondary)',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}>
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              height: '48px', flex: 1,
              background: 'linear-gradient(135deg, #9333ea, #c026d3)',
              border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600,
              color: 'white',
              boxShadow: '0 4px 20px rgba(147,51,234,0.35)',
              opacity: saving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.15s ease',
            }}>
            {saving ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: 'white' }} /> Saving...</> : <><Phone size={16} /> Save Number</>}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.5 }}>
          Your number is used only for mission alerts via WhatsApp. It is never shared publicly.
        </p>
      </div>
    </div>
  );
}
