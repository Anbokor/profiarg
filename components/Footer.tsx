'use client';

import React from 'react';
import { Locale, CategoryId } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { Send, Users, FileSpreadsheet, PlusCircle, Briefcase, UserPlus } from 'lucide-react';

interface FooterProps {
  locale: Locale;
  setLocale?: (loc: Locale) => void;
  onSelectCategory: (id: CategoryId) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToOrders?: () => void;
  onOpenCreateOrder?: () => void;
  onOpenCabinet?: () => void;
  onOpenAddModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  locale,
  setLocale,
  onSelectCategory,
  onNavigateToCatalog,
  onNavigateToOrders,
  onOpenCreateOrder,
  onOpenCabinet,
  onOpenAddModal,
}) => {
  const t = translations[locale];

  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* Column 1: Brand & Concise Mission Statement */}
          <div className="md:col-span-4 space-y-3">
            <div
              onClick={() => {
                if (onNavigateToCatalog) onNavigateToCatalog();
                else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 cursor-pointer select-none group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onNavigateToCatalog) onNavigateToCatalog();
                  else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <img
                src="/logo-horizontal.png"
                alt="Quatro Clicks — Servicios y Mapa"
                className="h-10 w-auto object-contain block dark:hidden group-hover:opacity-90 transition-opacity"
              />
              <img
                src="/logo-dark.png"
                alt="Quatro Clicks — Servicios y Mapa"
                className="h-10 w-auto object-contain hidden dark:block group-hover:opacity-90 transition-opacity"
              />
              <span className="sr-only">Quatro Clicks</span>
            </div>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {t.footerText || t.heroSubtitle}
            </p>

            <div className="pt-1 flex items-center gap-3">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:hover:bg-sky-900/50 transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{locale === 'ru' ? 'Telegram Чат' : 'Comunidad Telegram'}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Direct Functional Platform Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {locale === 'ru' ? 'Платформа' : 'Plataforma'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToCatalog) onNavigateToCatalog();
                    else if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5 text-sky-600" />
                  <span>{locale === 'ru' ? 'Специалисты и услуги' : 'Especialistas y servicios'}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToOrders) onNavigateToOrders();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
                  <span>{t.ordersBoardTab}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCreateOrder) onOpenCreateOrder();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>{t.createOrderBtn}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCabinet) onOpenCabinet();
                  }}
                  className="flex items-center gap-2 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                >
                  <Briefcase className="h-3.5 w-3.5 text-sky-600" />
                  <span>{t.specialistCabinetTab}</span>
                </button>
              </li>
              {onOpenAddModal && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="flex items-center gap-2 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{locale === 'ru' ? 'Стать исполнителем' : 'Registrarse como profesional'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Direct Category Shortcuts (Clicking navigates into category!) */}
          <div className="md:col-span-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              {locale === 'ru' ? 'Категории услуг' : 'Categorías de servicios'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-left text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-white transition truncate cursor-pointer hover:underline"
                  title={locale === 'ru' ? cat.title_ru : cat.title_es}
                >
                  {locale === 'ru' ? cat.title_ru : cat.title_es}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Server Status & Language Toggle */}
        <div className="border-t border-slate-100 pt-6 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Quatro Clicks. Buenos Aires, Argentina. Hecho con ❤️ para la comunidad.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{locale === 'ru' ? 'Все сервисы активны' : 'Servidores operativos'}</span>
            </span>

            {/* Language Toggle in Bottom Bar */}
            {setLocale && (
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setLocale('ru')}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    locale === 'ru'
                      ? 'bg-white text-sky-600 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  aria-label="Русский язык"
                >
                  RU
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('es')}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    locale === 'es'
                      ? 'bg-white text-sky-600 shadow-xs dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  aria-label="Idioma español"
                >
                  ES
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
