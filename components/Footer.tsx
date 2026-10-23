'use client';

import React from 'react';
import { Locale, CategoryId } from '@/types';
import { translations } from '@/lib/translations';
import { Send, Briefcase, UserPlus } from 'lucide-react';

interface FooterProps {
  locale: Locale;
  setLocale?: (loc: Locale) => void;
  onSelectCategory?: (id: CategoryId) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToOrders?: () => void;
  onOpenCreateOrder?: () => void;
  onOpenCabinet?: () => void;
  onOpenAddModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  locale,
  setLocale,
  onNavigateToCatalog,
  onOpenCabinet,
  onOpenAddModal,
}) => {
  const t = translations[locale];

  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand logo & concise mission */}
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
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
              className="h-8 sm:h-9 w-auto object-contain block dark:hidden group-hover:opacity-90 transition-opacity"
            />
            <img
              src="/logo-dark.png"
              alt="Quatro Clicks — Servicios y Mapa"
              className="h-8 sm:h-9 w-auto object-contain hidden dark:block group-hover:opacity-90 transition-opacity"
            />
            <span className="sr-only">Quatro Clicks</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
            {t.footerText || t.heroSubtitle}
          </p>
        </div>

        {/* Right: Actions, Language Toggle, and Telegram */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:hover:bg-sky-900/50 transition cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{locale === 'ru' ? 'Telegram Чат' : 'Comunidad Telegram'}</span>
          </a>

          {onOpenCabinet && (
            <button
              type="button"
              onClick={onOpenCabinet}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition cursor-pointer"
            >
              <Briefcase className="h-3.5 w-3.5 text-sky-600" />
              <span>{t.specialistCabinetTab}</span>
            </button>
          )}

          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 transition cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5 text-emerald-600" />
              <span>{locale === 'ru' ? 'Стать исполнителем' : 'Registrarse'}</span>
            </button>
          )}

          {/* Bilingual Language Switcher */}
          {setLocale && (
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setLocale('ru')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
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
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
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

          <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
            © {new Date().getFullYear()} Quatro Clicks
          </span>
        </div>

        {/* Informational Platform Disclaimer */}
        <div className="w-full pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-4xl mx-auto leading-relaxed">
            {locale === 'ru'
              ? 'Дисклеймер: Quatro Clicks является исключительно информационным сервисом для поиска специалистов. Сервис не является стороной сделок, не участвует в расчетах и не несет ответственности за договоренности сторон, исполнение и качество оказываемых услуг.'
              : 'Descargo de responsabilidad: Quatro Clicks es exclusivamente una plataforma informativa de contacto entre usuarios y profesionales. La plataforma no es parte de las operaciones, no interviene en pagos ni asume responsabilidad por acuerdos, ejecución o calidad de los servicios prestados.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
