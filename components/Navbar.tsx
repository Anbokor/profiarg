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
}) => {
  const t = translations[locale];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
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

        {/* View Mode Switcher (Desktop & Tablet) */}
        <div className="hidden md:flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
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

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Add Business / Specialist CTA */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t.addBusinessButton}</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* Mobile view switcher bar */}
      <div className="flex md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-4 py-1.5 justify-around">
        <button
          onClick={() => setViewMode('catalog')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
            viewMode === 'catalog'
              ? 'bg-white text-sky-700 font-bold shadow-xs dark:bg-slate-800 dark:text-sky-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>{t.catalogView}</span>
        </button>
        <button
          onClick={() => setViewMode('map')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
            viewMode === 'map'
              ? 'bg-white text-sky-700 font-bold shadow-xs dark:bg-slate-800 dark:text-sky-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          <span>{t.mapView}</span>
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
            viewMode === 'split'
              ? 'bg-white text-sky-700 font-bold shadow-xs dark:bg-slate-800 dark:text-sky-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Columns2 className="h-3.5 w-3.5" />
          <span>{t.splitView}</span>
        </button>
      </div>
    </header>
  );
};
