'use client';

import React from 'react';
import { Locale, ViewMode } from '@/types';
import { translations } from '@/lib/translations';
import {
  Map,
  LayoutGrid,
  Columns2,
  PlusCircle,
  Heart,
  FileSpreadsheet,
  Briefcase,
  Users,
} from 'lucide-react';

interface NavbarProps {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  favoritesCount: number;
  favoritesOnly: boolean;
  setFavoritesOnly: (val: boolean) => void;
  activeTab?: 'specialists' | 'orders';
  setActiveTab?: (tab: 'specialists' | 'orders') => void;
  openOrdersCount?: number;
  onOpenCreateOrder?: () => void;
  onOpenCabinet?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  locale,
  setLocale,
  viewMode,
  setViewMode,
  onOpenAddModal,
  favoritesCount,
  favoritesOnly,
  setFavoritesOnly,
  activeTab = 'specialists',
  setActiveTab,
  openOrdersCount = 0,
  onOpenCreateOrder,
  onOpenCabinet,
}) => {
  const t = translations[locale];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Main Tabs */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div
            onClick={() => setActiveTab && setActiveTab('specialists')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-amber-400 text-white shadow-md shadow-sky-500/20">
              <span className="font-extrabold text-xl tracking-tighter">P</span>
              <span className="text-amber-300 font-black text-xs">🇦🇷</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Profi<span className="text-sky-600 dark:text-sky-400">ARG</span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-700/10 dark:bg-sky-950/60 dark:text-sky-300">
                  BA
                </span>
              </div>
              <p className="hidden md:block text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Primary Marketplace Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-4">
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('specialists')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'specialists'
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{t.specialistsTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition relative ${
                activeTab === 'orders'
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t.ordersBoardTab}</span>
              {openOrdersCount > 0 && (
                <span className="ml-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white shadow-xs">
                  {openOrdersCount}
                </span>
              )}
            </button>

            {onOpenCabinet && (
              <button
                type="button"
                onClick={onOpenCabinet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                <Briefcase className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span>{t.specialistCabinetTab}</span>
                <span className="rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 text-[10px] font-black">
                  1%
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* View Mode Switcher (Desktop & Tablet) - Active only in Specialists view */}
        {activeTab === 'specialists' && (
          <div className="hidden xl:flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Columns2 className="h-4 w-4" />
              <span>{t.splitView}</span>
            </button>
            <button
              onClick={() => setViewMode('catalog')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>{t.catalogView}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>{t.mapView}</span>
            </button>
          </div>
        )}

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Prominent CTA: Разместить заказ / Оставить заявку */}
          {onOpenCreateOrder && (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span className="hidden sm:inline">{t.createOrderBtn}</span>
              <span className="sm:hidden">{t.orderShortBtn}</span>
            </button>
          )}

          {/* Favorites Button */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`relative flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors ${
              favoritesOnly
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 ring-1 ring-rose-200'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title={t.favoritesOnly}
          >
            <Heart className={`h-5 w-5 ${favoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setLocale('ru')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                locale === 'ru'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              🇷🇺 RU
            </button>
            <button
              onClick={() => setLocale('es')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                locale === 'es'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              🇦🇷 ES
            </button>
          </div>

          {/* Add Business / Specialist Profile CTA */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-sky-500 active:scale-95"
            title={t.addBusinessButton}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>{t.addBusinessButton}</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Sub-bar */}
      <div className="flex lg:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 px-3 py-1.5 justify-around items-center text-xs">
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('specialists')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
            activeTab === 'specialists'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>{t.catalogShortBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('orders')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition relative ${
            activeTab === 'orders'
              ? 'bg-white text-sky-700 shadow-xs dark:bg-slate-800 dark:text-sky-300'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>{t.ordersShortBtn}</span>
          {openOrdersCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white">
              {openOrdersCount}
            </span>
          )}
        </button>

        {onOpenCabinet && (
          <button
            type="button"
            onClick={onOpenCabinet}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-slate-600 dark:text-slate-400"
          >
            <Briefcase className="h-3.5 w-3.5 text-sky-600" />
            <span>{t.cabinetShortBtn}</span>
            <span className="rounded-full bg-sky-100 text-sky-800 px-1 text-[9px] font-black">1%</span>
          </button>
        )}

        {/* View Mode controls on mobile when in Specialists view */}
        {activeTab === 'specialists' && (
          <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'catalog' : 'map')}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300"
            >
              {viewMode === 'map' ? <LayoutGrid className="h-3.5 w-3.5" /> : <Map className="h-3.5 w-3.5" />}
              <span>{viewMode === 'map' ? t.catalogView : t.mapView}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
