'use client';

import React from 'react';
import { Locale, CategoryId, WorkFormat, ViewMode } from '@/types';
import { translations } from '@/lib/translations';
import { BARRIOS } from '@/data/barrios';
import { CATEGORIES } from '@/data/categories';
import {
  CheckCircle2,
  MapPin,
  Briefcase,
  RotateCcw,
  LayoutGrid,
  X,
  ChevronDown,
  Columns2,
  Map,
  Heart,
} from 'lucide-react';

interface FilterBarProps {
  locale: Locale;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  selectedSubcategory?: string | 'all';
  setSelectedSubcategory?: (sub: string | 'all') => void;
  selectedBarrio: string | 'all';
  setSelectedBarrio: (barrio: string | 'all') => void;
  selectedFormat: WorkFormat | 'all';
  setSelectedFormat: (fmt: WorkFormat | 'all') => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  favoritesOnly?: boolean;
  setFavoritesOnly?: (val: boolean) => void;
  favoritesCount?: number;
  sortBy: 'rating' | 'reviews' | 'name';
  setSortBy: (sort: 'rating' | 'reviews' | 'name') => void;
  totalFiltered: number;
  onReset: () => void;
  viewMode?: ViewMode;
  setViewMode?: (mode: ViewMode) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  locale,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory = 'all',
  setSelectedSubcategory,
  selectedBarrio,
  setSelectedBarrio,
  selectedFormat,
  setSelectedFormat,
  verifiedOnly,
  setVerifiedOnly,
  favoritesOnly = false,
  setFavoritesOnly,
  favoritesCount = 0,
  sortBy,
  setSortBy,
  totalFiltered,
  onReset,
  viewMode = 'split',
  setViewMode,
}) => {
  const t = translations[locale];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    (selectedSubcategory && selectedSubcategory !== 'all') ||
    selectedBarrio !== 'all' ||
    selectedFormat !== 'all' ||
    verifiedOnly ||
    favoritesOnly;

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  const getFormatLabel = (fmt: WorkFormat) => {
    switch (fmt) {
      case 'office': return t.officeFormat;
      case 'home_visit': return t.homeVisitFormat;
      case 'online': return t.onlineFormat;
      default: return fmt;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <LayoutGrid className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">{t.allCategories}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'ru' ? c.title_ru : c.title_es}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute inset-y-0 right-2 my-auto h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Barrio Dropdown */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <select
              value={selectedBarrio}
              onChange={(e) => setSelectedBarrio(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">{t.allBarrios}</option>
              <optgroup label="CABA">
                {BARRIOS.filter((b) => b.zone === 'CABA').map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Zona Norte">
                {BARRIOS.filter((b) => b.zone === 'Zona Norte').map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="pointer-events-none absolute inset-y-0 right-2 my-auto h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Work Format Dropdown */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Briefcase className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as WorkFormat | 'all')}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">{t.allFormats}</option>
              <option value="office">{t.officeFormat}</option>
              <option value="home_visit">{t.homeVisitFormat}</option>
              <option value="online">{t.onlineFormat}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute inset-y-0 right-2 my-auto h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Verified Only Toggle */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              verifiedOnly
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <CheckCircle2 className={`h-3.5 w-3.5 ${verifiedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{t.verifiedOnly}</span>
          </button>

          {/* Favorites Wishlist Toggle */}
          {setFavoritesOnly && (
            <button
              type="button"
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                favoritesOnly
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title={t.favoritesOnly}
            >
              <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              <span>{t.favoritesOnly}</span>
              {favoritesCount > 0 && (
                <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 ml-1 transition"
              title={t.resetFilters}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>

        {/* Right: Results Count & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.resultsFound}: <span className="text-slate-900 dark:text-white font-bold">{totalFiltered}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-xs text-slate-400">{t.sortBy}:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews' | 'name')}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="rating">{t.sortRating}</option>
                <option value="reviews">{t.sortReviews}</option>
                <option value="name">{t.sortName}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute inset-y-0 right-2 my-auto h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* View Mode Switcher (Split / Catalog / Map) */}
          {setViewMode && (
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'split'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title={t.splitView}
                aria-label={t.splitView}
              >
                <Columns2 className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t.splitView}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('catalog')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'catalog'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title={t.catalogView}
                aria-label={t.catalogView}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.catalogView}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title={t.mapView}
                aria-label={t.mapView}
              >
                <Map className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.mapView}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div className="mx-auto max-w-7xl mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto py-2 px-1 sm:px-2 scrollbar-none animate-fade-in">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
            {t.activeFilters}:
          </span>

          {/* Active Category badge with (X) deselect button */}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-700 px-2.5 py-0.5 text-xs font-medium text-sky-800 dark:text-sky-200 flex-shrink-0">
              <span>{activeCategory ? (locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es) : selectedCategory}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="hover:bg-sky-200/80 dark:hover:bg-sky-800 rounded-full p-0.5 text-sky-700 dark:text-sky-300 transition"
                title={locale === 'ru' ? 'Сбросить категорию' : 'Quitar filtro de categoría'}
                aria-label={locale === 'ru' ? 'Сбросить категорию' : 'Quitar filtro de categoría'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Active Subcategory badge */}
          {selectedSubcategory && selectedSubcategory !== 'all' && setSelectedSubcategory && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-900/70 border border-sky-300 dark:border-sky-700 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:text-sky-200 flex-shrink-0">
              <span>{selectedSubcategory}</span>
              <button
                type="button"
                onClick={() => setSelectedSubcategory('all')}
                className="hover:bg-sky-200/80 dark:hover:bg-sky-800 rounded-full p-0.5 text-sky-700 dark:text-sky-300 transition cursor-pointer"
                title={locale === 'ru' ? 'Сбросить подкатегорию' : 'Quitar filtro de subcategoría'}
                aria-label={locale === 'ru' ? 'Сбросить подкатегорию' : 'Quitar filtro de subcategoría'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Active Barrio badge */}
          {selectedBarrio !== 'all' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
              <MapPin className="h-3 w-3 text-sky-500" />
              <span>{selectedBarrio}</span>
              <button
                type="button"
                onClick={() => setSelectedBarrio('all')}
                className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5 text-slate-500 dark:text-slate-400 transition"
                title={locale === 'ru' ? 'Сбросить район' : 'Quitar filtro de barrio'}
                aria-label={locale === 'ru' ? 'Сбросить район' : 'Quitar filtro de barrio'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Active Format badge */}
          {selectedFormat !== 'all' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
              <Briefcase className="h-3 w-3 text-amber-500" />
              <span>{getFormatLabel(selectedFormat)}</span>
              <button
                type="button"
                onClick={() => setSelectedFormat('all')}
                className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5 text-slate-500 dark:text-slate-400 transition"
                title={locale === 'ru' ? 'Сбросить формат' : 'Quitar filtro de modalidad'}
                aria-label={locale === 'ru' ? 'Сбросить формат' : 'Quitar filtro de modalidad'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Active Verified badge */}
          {verifiedOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 flex-shrink-0">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{t.verifiedOnly}</span>
              <button
                type="button"
                onClick={() => setVerifiedOnly(false)}
                className="hover:bg-emerald-200/80 dark:hover:bg-emerald-900 rounded-full p-0.5 text-emerald-700 dark:text-emerald-300 transition"
                title={locale === 'ru' ? 'Сбросить фильтр проверенных' : 'Quitar filtro de verificados'}
                aria-label={locale === 'ru' ? 'Сбросить фильтр проверенных' : 'Quitar filtro de verificados'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Active Favorites badge */}
          {favoritesOnly && setFavoritesOnly && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 px-2.5 py-0.5 text-xs font-medium text-rose-800 dark:text-rose-200 flex-shrink-0">
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
              <span>{t.favoritesOnly}</span>
              <button
                type="button"
                onClick={() => setFavoritesOnly(false)}
                className="hover:bg-rose-200/80 dark:hover:bg-rose-900 rounded-full p-0.5 text-rose-700 dark:text-rose-300 transition"
                title={locale === 'ru' ? 'Сбросить фильтр избранного' : 'Quitar filtro de favoritos'}
                aria-label={locale === 'ru' ? 'Сбросить фильтр избранного' : 'Quitar filtro de favoritos'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 ml-1 whitespace-nowrap flex-shrink-0 hover:underline transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t.resetFilters}</span>
          </button>

          {/* Clear end spacer to prevent clipping at the right edge */}
          <div className="w-4 flex-shrink-0" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
