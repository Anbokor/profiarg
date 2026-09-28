'use client';

import React from 'react';
import { Locale, CategoryId } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { Send } from 'lucide-react';

interface FooterProps {
  locale: Locale;
  onSelectCategory: (id: CategoryId) => void;
  onSelectBarrio: (name: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  locale,
  onSelectCategory,
  onSelectBarrio,
}) => {
  const t = translations[locale];

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white font-bold text-sm">
                P🇦🇷
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                Profi<span className="text-sky-600">ARG</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t.footerText}
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Telegram Чат</span>
              </a>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {locale === 'ru' ? 'Категории услуг' : 'Categorías de servicios'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-sky-600 dark:hover:text-white transition"
                  >
                    {locale === 'ru' ? cat.title_ru : cat.title_es}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories Col */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {locale === 'ru' ? 'Ещё направления' : 'Más rubros'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {CATEGORIES.slice(5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-sky-600 dark:hover:text-white transition"
                  >
                    {locale === 'ru' ? cat.title_ru : cat.title_es}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Barrios Col */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {locale === 'ru' ? 'Популярные районы' : 'Barrios destacados'}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {BARRIOS.slice(0, 8).map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelectBarrio(b.name)}
                  className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800 dark:text-slate-400 transition"
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 pt-6 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} ProfiARG. Buenos Aires, Argentina. Hecho con ❤️ para la comunidad.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{locale === 'ru' ? 'Все сервисы активны' : 'Servidores operativos'}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
