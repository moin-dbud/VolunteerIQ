'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ─── Sticky Navbar ────────────────────────────────────────────────────────────
function StickyNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const navLinks = ['Home', 'Features', 'Impact', 'For NGOs'];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        pointerEvents: scrolled ? 'all' : 'none',
        opacity: scrolled ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}
    >
      <nav
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(157,80,187,0.2)',
          borderRadius: 999,
          padding: '10px 22px',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
            background: 'linear-gradient(to right, #9D50BB, #e08efe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            VolunteerIQ
          </span>
        </Link>
        <div className="lp-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center', marginRight: 24 }}>
          {navLinks.map(link => (
            <NavLink key={link} href="#" label={link} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 14px',
            transition: 'color 0.2s ease',
          }}>
            Log In
          </Link>
          <Link href="/signup" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
            color: '#fff', textDecoration: 'none', padding: '7px 16px',
            background: 'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
            borderRadius: 8, transition: 'opacity 0.2s ease',
          }}>
            Sign Up
          </Link>
        </div>
      </nav>
    </div>
  );
}

// ─── Pill Navbar (inside hero) ────────────────────────────────────────────────
function PillNavbar() {
  const navLinks = ['Home', 'Features', 'Impact', 'For NGOs'];
  return (
    <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(157,80,187,0.15)',
          borderRadius: 999, padding: '10px 22px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
          <span style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 15, fontWeight: 800,
            background: 'linear-gradient(to right, #9D50BB, #e08efe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.01em',
          }}>
            VolunteerIQ
          </span>
        </Link>

        <div className="lp-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center', marginRight: 24 }}>
          {navLinks.map(link => (
            <NavLink key={link} href="#" label={link} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '6px 14px',
          }}>
            Log In
          </Link>
          <Link href="/signup" style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
            color: '#fff', textDecoration: 'none', padding: '7px 16px',
            background: 'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
            borderRadius: 8,
            boxShadow: '0 0 15px rgba(157,80,187,0.2)',
          }}>
            Sign Up
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
        color: hovered ? '#ba92fa' : 'rgba(255,255,255,0.55)',
        textDecoration: 'none', transition: 'color 0.2s ease', cursor: 'pointer',
      }}
    >
      {label}
    </a>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────
export default function HeroSection() {
  const [btn1H, setBtn1H] = useState(false);
  const [btn2H, setBtn2H] = useState(false);
  const [btn3H, setBtn3H] = useState(false);

  return (
    <>
      <StickyNavbar />

      <section
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        {/* ── Purple radial glow ─────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '25%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800, height: 800,
            background: 'radial-gradient(circle, rgba(157,80,187,0.10) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 1,
          }}
        />

        {/* ── Dot grid overlay ──────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(157,80,187,0.07) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none', zIndex: 1,
          }}
        />

        {/* ── Pill Navbar ───────────────────────────────────────────── */}
        <PillNavbar />

        {/* ── Hero content ──────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative', zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center',
            padding: '140px 24px 60px',
            maxWidth: 1000, width: '100%',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(157,80,187,0.12)',
              border: '1px solid rgba(157,80,187,0.3)',
              borderRadius: 999, padding: '6px 18px',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: '#ba92fa',
              marginBottom: 32,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e08efe', display: 'inline-block' }} />
            Empowering Action
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.35 }}
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 'clamp(44px, 6vw, 80px)',
              fontWeight: 800,
              lineHeight: 1.08,
              color: '#fff',
              margin: '0 0 28px',
              letterSpacing: '-0.025em',
            }}
          >
            Empower Your Community with{' '}
            <span style={{
              background: 'linear-gradient(to right, #9D50BB, #e08efe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              VolunteerIQ
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 20, color: 'rgba(173,170,170,0.9)',
              maxWidth: 640, margin: '0 auto 52px',
              lineHeight: 1.65,
            }}
          >
            VolunteerIQ helps NGOs and volunteers connect to solve community problems
            efficiently through a high-velocity AI command center.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            {/* Primary CTA */}
            <Link
              href="/signup"
              onMouseEnter={() => setBtn1H(true)}
              onMouseLeave={() => setBtn1H(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', borderRadius: 10,
                background: 'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
                color: '#fff',
                fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 700,
                textDecoration: 'none',
                boxShadow: btn1H
                  ? '0 0 30px rgba(157,80,187,0.45)'
                  : '0 0 20px rgba(157,80,187,0.25)',
                transform: btn1H ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              Report Issue
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/signup"
              onMouseEnter={() => setBtn2H(true)}
              onMouseLeave={() => setBtn2H(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', borderRadius: 10,
                border: `2px solid ${btn2H ? '#e08efe' : 'rgba(224,142,254,0.4)'}`,
                background: btn2H ? 'rgba(224,142,254,0.08)' : 'transparent',
                color: '#e08efe',
                fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 700,
                textDecoration: 'none',
                transform: btn2H ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              Join as Volunteer
            </Link>

            {/* Tertiary CTA */}
            <Link
              href="/demo"
              onMouseEnter={() => setBtn3H(true)}
              onMouseLeave={() => setBtn3H(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '16px 32px', borderRadius: 10,
                background: btn3H ? 'rgba(255,255,255,0.95)' : '#ffffff',
                color: '#0e0e0e',
                fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 700,
                textDecoration: 'none',
                transform: btn3H ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              Watch Demo
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            style={{
              marginTop: 80,
              paddingTop: 40,
              borderTop: '1px solid rgba(72,72,71,0.4)',
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              gap: 0,
              width: '100%',
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, auto)',
              gap: '0 64px',
              justifyContent: 'center',
            }}>
              {[
                { value: '500+', label: 'Active NGOs' },
                { value: '2000+', label: 'Volunteers' },
                { value: '12.5k', label: 'Tasks Resolved' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 30, fontWeight: 800, color: '#fff',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11, fontWeight: 600,
                    color: 'rgba(173,170,170,0.8)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.1em',
                    marginTop: 4,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}