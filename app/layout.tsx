import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'MFLIX - India ka apna Netflix',
  description: 'Premium Indian streaming platform. Movies, TV Shows, Anime, K-Dramas and more.',
  manifest: '/manifest.json',
  themeColor: '#03060f',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#03060f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning className="bg-[#03060f] text-white selection:bg-red-500/30">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
