
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../components/AuthProvider';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://codexprime.in'),
  title: {
    default: 'CodeXprime — Multi‑Domain Blog Management',
    template: '%s | CodeXprime'
  },
  description: 'Create SEO‑optimized blogs across multiple domains with CodeXprime.',
  keywords: ['CodeXprime', 'blog management', 'multi-domain', 'SEO', 'content management'],
  authors: [{ name: 'CodeXprime' }],
  creator: 'CodeXprime',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://codexprime.in',
    title: 'CodeXprime — Multi‑Domain Blog Management',
    description: 'Create SEO‑optimized blogs across multiple domains with CodeXprime.',
    siteName: 'CodeXprime',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CodeXprime'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeXprime — Multi‑Domain Blog Management',
    description: 'Create SEO‑optimized blogs across multiple domains with CodeXprime.',
    images: ['/twitter-image.jpg'],
    creator: '@codexprime'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <Script id="ga-inline" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  );
}