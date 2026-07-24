import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://freelanceshield.io'),
  title: 'FreelanceShield — Connect, Collaborate & Grow',
  description:
    'FreelanceShield is a secure freelancing marketplace that connects clients and freelancers with protected payments, encrypted messaging, and trusted collaboration.',
  openGraph: {
    title: 'FreelanceShield — Connect, Collaborate & Grow',
    description:
      'A secure freelancing marketplace that connects clients and freelancers.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
