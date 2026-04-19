import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://jsonviewer.dewinson.dev'),
  title: {
    default: 'JSON Viewer — Visualiza y Compara JSON Online',
    template: '%s | JSON Viewer',
  },
  description: 'Herramienta gratuita para visualizar, formatear y comparar archivos JSON en línea. Detecta diferencias entre dos JSONs con vista diff interactiva.',
  keywords: ['JSON viewer', 'JSON comparator', 'JSON formatter', 'JSON diff', 'visualizar JSON', 'comparar JSON', 'JSON online'],
  authors: [{ name: 'Dewinson', url: 'https://jsonviewer.dewinson.dev' }],
  creator: 'Dewinson',
  openGraph: {
    type: 'website',
    url: 'https://jsonviewer.dewinson.dev',
    title: 'JSON Viewer — Visualiza y Compara JSON Online',
    description: 'Herramienta gratuita para visualizar, formatear y comparar archivos JSON en línea.',
    siteName: 'JSON Viewer',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'JSON Viewer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JSON Viewer — Visualiza y Compara JSON Online',
    description: 'Herramienta gratuita para visualizar, formatear y comparar archivos JSON en línea.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://jsonviewer.dewinson.dev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON Viewer',
  url: 'https://jsonviewer.dewinson.dev',
  description: 'Herramienta gratuita para visualizar, formatear y comparar archivos JSON en línea.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'All',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
