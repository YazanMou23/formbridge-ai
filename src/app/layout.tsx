import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import './globals.css';
import Footer from '@/components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'FormBridge AI - مساعد تعبئة النماذج الألمانية',
  description: 'ارفع صورة النموذج الألماني، أجب بالعربية، واحصل على النموذج معبأ بالألمانية',
  keywords: ['German forms', 'Arabic helper', 'form filling', 'translation', 'AI assistant'],
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    shortcut: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FormBridge AI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider initialLocale="ar">
          <div className="flex flex-col min-h-screen">
            <main className="pb-20">
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
