'use client';

import React from 'react';
import { Locale, CategoryId, WorkFormat } from '@/types';
import { translations } from '@/lib/translations';
import { BARRIOS } from '@/data/barrios';
import {
  CheckCircle2,
  MapPin,
  Briefcase,
  RotateCcw,
} from 'lucide-react';

interface FilterBarProps {
  locale: Locale;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  selectedBarrio: string | 'all';
  setSelectedBarrio: (barrio: string | 'all') => void;
  selectedFormat: WorkFormat | 'all';
  setSelectedFormat: (fmt: WorkFormat | 'all') => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (val: boolean) => void;
  sortBy: 'rating' | 'reviews' | 'name';
  setSortBy: (sort: 'rating' | 'reviews' | 'name') => void;
  totalFiltered: number;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  locale,
  selectedCategory,
  setSelectedCategory,
  selectedBarrio,
  setSelectedBarrio,
  selectedFormat,
  setSelectedFormat,
  verifiedOnly,
  setVerifiedOnly,
  sortBy,
  setSortBy,
  totalFiltered,
  onReset,
}) => {
  const t = translations[locale];

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBarrio !== 'all' ||
    selectedFormat !== 'all' ||
    verifiedOnly;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Barrio Dropdown */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <select
              value={selectedBarrio}
              onChange={(e) => setSelectedBarrio(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
          </div>

          {/* Work Format Dropdown */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
              <Briefcase className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as WorkFormat | 'all')}
              className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">{t.allFormats}</option>
              <option value="office">{t.officeFormat}</option>
              <option value="home_visit">{t.homeVisitFormat}</option>
              <option value="online">{t.onlineFormat}</option>
            </select>
          </div>

          {/* Verified Only Toggle */}
          <button
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

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 ml-1"
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
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="rating">{t.sortRating}</option>
                <option value="reviews">{t.sortReviews}</option>
                <option value="name">{t.sortName}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
