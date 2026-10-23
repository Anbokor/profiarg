'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Locale, ViewMode, Specialist } from '@/types';
import { translations } from '@/lib/translations';
import { getSpecialistDisplayName } from '@/lib/utils';
import {
  Briefcase,
  UserPlus,
  ChevronDown,
  LogOut,
  User,
  PlusCircle,
  ShoppingBag,
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
  onOpenCustomerCabinet?: () => void;
  activeDealsCount?: number;
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
  onOpenCustomerCabinet,
  activeDealsCount = 0,
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

          {/* Single Unified Account Trigger & Menu */}
          <div className="relative" ref={masterMenuRef}>
            <button
              type="button"
              onClick={() => setIsMasterMenuOpen(!isMasterMenuOpen)}
              className="relative inline-flex items-center gap-2 rounded-full border-2 border-red-500 hover:border-red-600 dark:border-red-500 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-red-50/20 dark:hover:bg-red-950/20 shadow-xs transition active:scale-95 cursor-pointer ring-1 ring-red-500/20"
              aria-expanded={isMasterMenuOpen}
              aria-haspopup="true"
              aria-label={locale === 'ru' ? 'Для мастеров' : 'Para profesionales'}
              title={locale === 'ru' ? 'Вход для мастеров' : 'Para profesionales'}
            >
              {loggedInSpecialist ? (
                <>
                  <img
                    src={loggedInSpecialist.avatar}
                    alt={getSpecialistDisplayName(loggedInSpecialist, locale)}
                    className="h-5 w-5 rounded-full object-cover border border-sky-400 shrink-0"
                  />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {getSpecialistDisplayName(loggedInSpecialist, locale)}
                  </span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span className="hidden sm:inline">
                    {locale === 'ru' ? 'Личный кабинет' : 'Mi cuenta'}
                  </span>
                </>
              )}

              {activeDealsCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white">
                  {activeDealsCount}
                </span>
              )}

              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  isMasterMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMasterMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                {/* Account Header */}
                <div className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-700 dark:text-sky-300 font-bold shrink-0">
                      {loggedInSpecialist?.avatar ? (
                        <img
                          src={loggedInSpecialist.avatar}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {loggedInSpecialist
                          ? getSpecialistDisplayName(loggedInSpecialist, locale)
                          : (locale === 'ru' ? 'Единый профиль' : 'Mi cuenta')}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {loggedInSpecialist
                          ? (locale === 'ru' ? 'Специалист платформы' : 'Profesional verificado')
                          : (locale === 'ru' ? 'Заказчик и исполнитель' : 'Cliente y profesional')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: КАК ЗАКАЗЧИК */}
                <div className="py-1">
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    🛍️ {locale === 'ru' ? 'Заказчик' : 'Cliente'}
                  </div>
                  {onOpenCustomerCabinet && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMasterMenuOpen(false);
                        onOpenCustomerCabinet();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-sky-50/70 dark:hover:bg-sky-950/40 transition text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-sky-600" />
                        <span className="font-semibold">{locale === 'ru' ? 'Мои сделки' : 'Mis tratos'}</span>
                      </div>
                      {activeDealsCount > 0 ? (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white">
                          {activeDealsCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">#QC</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Section 2: КАК СПЕЦИАЛИСТ */}
                <div className="py-1">
                  <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    🛠️ {locale === 'ru' ? 'Специалист' : 'Profesional'}
                  </div>
                  {onOpenCabinet && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMasterMenuOpen(false);
                        onOpenCabinet();
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold">{t.specialistCabinetTab}</span>
                      </div>
                      {loggedInSpecialist ? (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                          PRO
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {locale === 'ru' ? 'Вход для мастеров' : 'Acceso'}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMasterMenuOpen(false);
                      onOpenAddModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition text-left font-semibold"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                    <span>{locale === 'ru' ? '+ Добавить услугу' : '+ Publicar servicio'}</span>
                  </button>
                </div>

                {/* Section 3: Logout if specialist */}
                {loggedInSpecialist && onLogoutSpecialist && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMasterMenuOpen(false);
                        onLogoutSpecialist();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition text-left font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.cabinetLogoutBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
