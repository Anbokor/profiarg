import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quatro Clicks — Каталог и карта специалистов в Аргентине',
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
    title: 'Quatro Clicks — Услуги и специалисты в Аргентине',
    description: 'Платформа для бесплатного размещения и поиска услуг в Аргентине для русскоязычного и испаноязычного сообщества.',
    locale: 'ru_RU',
    type: 'website',
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
