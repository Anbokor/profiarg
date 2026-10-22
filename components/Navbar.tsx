'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Locale, ViewMode, Specialist } from '@/types';
import { translations } from '@/lib/translations';
import {
  Briefcase,
  UserPlus,
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
        </div>

        {/* Center/Right Section: Unified Master Menu & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-nowrap">


          {/* Language Switcher: Large High-Contrast Pill with Red Accent Border */}
          <div className="flex items-center rounded-full border-2 border-red-500 hover:border-red-600 dark:border-red-500 bg-slate-100 p-1 dark:bg-slate-800 flex-shrink-0 shadow-xs ring-1 ring-red-500/20">
            <button
              type="button"
              onClick={() => setLocale('ru')}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                locale === 'ru'
                  ? 'bg-sky-600 text-white shadow-xs dark:bg-sky-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              RU
            </button>
            <button
              type="button"
              onClick={() => setLocale('es')}
              className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                locale === 'es'
                  ? 'bg-sky-600 text-white shadow-xs dark:bg-sky-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              ES
            </button>
          </div>

          {/* Unified Clean "Для мастеров" / "Для бизнеса" Dropdown Menu with Red Accent Border */}
          <div className="relative" ref={masterMenuRef}>
            <button
              type="button"
              onClick={() => setIsMasterMenuOpen(!isMasterMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-500 hover:border-red-600 dark:border-red-500 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-red-50/20 dark:hover:bg-red-950/20 shadow-xs transition active:scale-95 cursor-pointer ring-1 ring-red-500/20"
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
                    className="h-5 w-5 rounded-full object-cover border border-sky-400"
                  />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {loggedInSpecialist.name}
                  </span>
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4 text-red-600 dark:text-red-400" />
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
    </header>
  );
};
