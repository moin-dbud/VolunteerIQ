import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from '@/lib/toast-context';

export const metadata: Metadata = {
  title: 'VolunteerIQ — NGO Command Center',
  description:
    'AI-powered volunteer coordination platform for NGOs. Real-time issue triage, volunteer matching, and impact visibility.',
  keywords: 'NGO, volunteer, coordination, AI, community, emergency response',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/VolunteerIQ-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        {/* Minimum width message for screens < 1280px */}
        <div className="min-width-message">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖥️</div>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Desktop Required
          </h2>
          <p style={{ maxWidth: '360px', lineHeight: 1.6 }}>
            VolunteerIQ Command Center is optimized for desktop. Please use a screen width of
            1280px or larger.
          </p>
        </div>

        <div className="app-content">
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
