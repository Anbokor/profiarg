'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Locale, ViewMode, Specialist } from '@/types';
import { translations } from '@/lib/translations';
import {
  Users,
  FileSpreadsheet,
  PlusCircle,
  Briefcase,
  UserPlus,
  Heart,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  favoritesCount?: number;
  favoritesOnly?: boolean;
  setFavoritesOnly?: (val: boolean) => void;
  activeTab?: 'specialists' | 'orders';
  setActiveTab?: (tab: 'specialists' | 'orders') => void;
  openOrdersCount?: number;
  onOpenCreateOrder?: () => void;
  onOpenCabinet?: () => void;
  loggedInSpecialist?: Specialist | null;
  onLogoutSpecialist?: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  setLocale,
  onOpenAddModal,
  favoritesCount = 0,
  favoritesOnly = false,
  setFavoritesOnly,
  activeTab = 'specialists',
  setActiveTab,
  openOrdersCount = 0,
  onOpenCreateOrder,
  onOpenCabinet,
  loggedInSpecialist,
  onLogoutSpecialist,
  onGoHome,
}) => {
  const t = translations[locale];
  const [isMasterMenuOpen, setIsMasterMenuOpen] = useState(false);
  const masterMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape (only active when dropdown is open)
  useEffect(() => {
    if (!isMasterMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (masterMenuRef.current && !masterMenuRef.current.contains(e.target as Node)) {
        setIsMasterMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMasterMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMasterMenuOpen]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Left Section: Sleek Brand Logo & Compact Navigation Switch */}
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setActiveTab && setActiveTab('specialists');
              onGoHome && onGoHome();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab && setActiveTab('specialists');
                onGoHome && onGoHome();
              }
            }}
            className="flex items-center gap-2 cursor-pointer select-none group focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:rounded-xl"
            role="button"
            tabIndex={0}
            aria-label="Quatro Clicks Home"
          >
            {/* Actual Quatro Clicks Brand Logo */}
            <div className="flex items-center group-hover:opacity-95 transition-opacity">
              <img
                src="/logo-horizontal.png"
                alt="Quatro Clicks — Servicios y Mapa"
                className="h-9 sm:h-10 w-auto object-contain block dark:hidden"
              />
              <img
                src="/logo-dark.png"
                alt="Quatro Clicks — Servicios y Mapa"
                className="h-9 sm:h-10 w-auto object-contain hidden dark:block"
              />
            </div>
            <span className="sr-only">Quatro Clicks</span>
          </div>

          {/* Compact navigation switch: Специалисты | Заказы (Desktop & Tablet) */}
          <nav
            className="hidden sm:inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60"
            aria-label="Main Navigation"
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab && setActiveTab('specialists');
                onGoHome && onGoHome();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'specialists'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{t.specialistsTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition relative ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{t.ordersBoardTab}</span>
              {openOrdersCount > 0 && (
                <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white">
                  {openOrdersCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Center/Right Section: Primary CTA, Language, Unified Master Menu */}
        <div className="flex items-center gap-2 sm:gap-3 flex-nowrap">
          {/* Single primary action button for clients: Разместить заказ / Publicar pedido */}
          {onOpenCreateOrder && (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span className="hidden md:inline">{t.createOrderBtn}</span>
              <span className="md:hidden">{t.orderShortBtn}</span>
            </button>
          )}


          {/* Language Switcher: Compact Pill */}
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800 flex-shrink-0">
            <button
              type="button"
              onClick={() => setLocale('ru')}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                locale === 'ru'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                locale === 'es'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ES
            </button>
          </div>

          {/* Unified Clean "Для мастеров" / "Для бизнеса" Dropdown Menu */}
          <div className="relative" ref={masterMenuRef}>
            <button
              type="button"
              onClick={() => setIsMasterMenuOpen(!isMasterMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition active:scale-95"
              aria-expanded={isMasterMenuOpen}
              aria-haspopup="true"
              aria-label={locale === 'ru' ? 'Для мастеров' : 'Para profesionales'}
              title={locale === 'ru' ? 'Вход для мастеров' : 'Para profesionales'}
            >
              {loggedInSpecialist ? (
                <>
                  <img
                    src={loggedInSpecialist.avatar}
                    alt={loggedInSpecialist.name}
                    className="h-4.5 w-4.5 rounded-full object-cover border border-sky-400"
                  />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {loggedInSpecialist.name}
                  </span>
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="hidden md:inline">
                    {locale === 'ru' ? 'Вход для мастеров' : 'Para profesionales'}
                  </span>
                </>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isMasterMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMasterMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {loggedInSpecialist
                      ? (locale === 'ru' ? 'Вы авторизованы' : 'Sesión activa')
                      : (locale === 'ru' ? 'Специалистам' : 'Profesionales')}
                  </p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-0.5 truncate">
                    {loggedInSpecialist
                      ? loggedInSpecialist.name
                      : (locale === 'ru' ? 'Личный кабинет и анкета мастера' : 'Panel de control y registro')}
                  </p>
                </div>

                <div className="py-1">
                  {onOpenCabinet && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMasterMenuOpen(false);
                        onOpenCabinet();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-sky-50/70 dark:hover:bg-sky-950/40 transition text-left group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 group-hover:scale-105 transition-transform">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {t.specialistCabinetTab}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {locale === 'ru' ? 'Баланс депозита и учёт сделок' : 'Saldo de depósito y control'}
                        </div>
                      </div>
                    </button>
                  )}

                  {!loggedInSpecialist ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMasterMenuOpen(false);
                        onOpenAddModal();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition text-left group"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {locale === 'ru' ? 'Стать исполнителем' : 'Registrar mi perfil'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.addBusinessButton}
                        </div>
                      </div>
                    </button>
                  ) : (
                    onLogoutSpecialist && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMasterMenuOpen(false);
                          onLogoutSpecialist();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition text-left group"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 group-hover:scale-105 transition-transform">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold">
                            {t.cabinetLogoutBtn}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {locale === 'ru' ? 'Завершить сеанс мастера' : 'Cerrar sesión'}
                          </div>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only Navigation Switcher (compact, clean, centered, no awkward wrapping) */}
      <div className="sm:hidden border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 px-3 py-1.5 flex justify-center">
        <nav
          className="inline-flex items-center rounded-full bg-slate-200/80 dark:bg-slate-800 p-1 w-full max-w-xs border border-slate-200/60 dark:border-slate-700/60"
          aria-label="Mobile Navigation"
        >
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('specialists')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full text-xs font-semibold transition truncate ${
              activeTab === 'specialists'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{t.specialistsTab}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full text-xs font-semibold transition relative truncate ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{t.ordersBoardTab}</span>
            {openOrdersCount > 0 && (
              <span className="ml-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white flex-shrink-0">
                {openOrdersCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
