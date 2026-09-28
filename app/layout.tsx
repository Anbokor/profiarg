import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProfiARG — Каталог и карта русскоязычных специалистов в Аргентине',
  description:
    'Интерактивная карта и каталог русскоязычных специалистов и бизнеса в Буэнос-Айресе: ВНЖ, гражданство, медицина, аренда жилья, русский маникюр, ремонт и еда. Прямая связь через WhatsApp.',
  keywords: [
    'русские в Аргентине',
    'Буэнос-Айрес',
    'ВНЖ Аргентина',
    'DNI',
    'переводчик CTPCBA',
    'русский маникюр Буэнос-Айрес',
    'аренда Палермо',
    'русскоязычный врач Аргентина',
    'ProfiARG',
  ],
  openGraph: {
    title: 'ProfiARG — Русскоязычный бизнес и услуги в Аргентине',
    description: 'Интерактивная карта и каталог проверенных экспертов в Буэнос-Айресе.',
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
