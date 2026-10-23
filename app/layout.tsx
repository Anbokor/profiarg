import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quatro Clicks - Каталог и карта специалистов в Аргентине',
  description:
    'Интерактивная карта и каталог специалистов и бизнеса в Аргентине: ремонт и строительство, красота, транспорт, обмен валют, переводы, юридические услуги, образование, туризм, бытовая техника, авто, недвижимость, работа, IT и еда. Прямая связь через WhatsApp.',
  keywords: [
    'Quatro Clicks',
    'специалисты в Аргентине',
    'Буэнос-Айрес',
    'русские в Аргентине',
    'услуги Буэнос-Айрес',
    'DNI',
    'переводчик CTPCBA',
    'ремонт окон Буэнос-Айрес',
    'Ventanas porteñas',
    'русский маникюр Буэнос-Айрес',
    'аренда Палермо',
  ],
  openGraph: {
    title: 'Quatro Clicks - Услуги и специалисты в Аргентине',
    description: 'Платформа для бесплатного размещения и поиска услуг в Аргентине для русскоязычного и испаноязычного сообщества.',
    locale: 'ru_RU',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/logo-icon.png', sizes: '272x272', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/logo-icon.png" type="image/png" sizes="272x272" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Quatro Clicks',
              alternateName: 'Quatro Clicks Argentina',
              url: 'https://quatroclicks.com',
              description:
                'Интерактивная карта и каталог специалистов и бизнеса в Аргентине (Буэнос-Айрес)',
              inLanguage: ['ru', 'es'],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
