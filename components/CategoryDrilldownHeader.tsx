'use client';

import React from 'react';
import { Locale, Category } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { translations } from '@/lib/translations';
import {
  ArrowLeft,
  Search,
  X,
  HardHat,
  Sparkles,
  Truck,
  ArrowLeftRight,
  Languages,
  Scale,
  GraduationCap,
  Compass,
  Tv,
  Car,
  Building,
  Briefcase,
  Laptop,
  ShoppingBag,
} from 'lucide-react';

interface CategoryDrilldownHeaderProps {
  locale: Locale;
  category: Category;
  selectedGroup?: string | null;
  selectedSubcategory?: string | 'all';
  onSelectSubcategory?: (sub: string | 'all') => void;
  onBackToCategories: () => void;
  onBackToGroups?: () => void;
  onBackToSubsections?: () => void;
  specialistsCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const getCategoryIcon = (iconName: string, className = 'w-6 h-6') => {
  switch (iconName) {
    case 'HardHat': return <HardHat className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'ArrowLeftRight': return <ArrowLeftRight className={className} />;
    case 'Languages': return <Languages className={className} />;
    case 'Scale': return <Scale className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Building': return <Building className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const CategoryDrilldownHeader: React.FC<CategoryDrilldownHeaderProps> = ({
  locale,
  category,
  selectedGroup,
  onBackToCategories,
  onBackToGroups,
  onBackToSubsections,
  specialistsCount,
  searchQuery,
  setSearchQuery,
}) => {
  const t = translations[locale];
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === category.id);
  const indexNumber = categoryIndex !== -1 ? String(categoryIndex + 1).padStart(2, '0') : '';
  const activeGroup = category.groups?.find((g) => g.id === selectedGroup) || null;
  const rawGroupTitle = activeGroup
    ? locale === 'ru'
      ? activeGroup.title_ru
      : activeGroup.title_es
    : null;
  const groupTitle = locale === 'ru' && rawGroupTitle
    ? rawGroupTitle.replace(/\s+Obras\b/i, '').replace(/\s+Materiales\b/i, '')
    : rawGroupTitle;

  const getSpecialistsCountText = (count: number) => {
    if (locale === 'es') {
      return `${count} ${count === 1 ? t.specialistSingle : t.specialistsMany}`;
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) {
      return `${count} ${t.specialistsMany}`;
    }
    if (mod10 === 1) {
      return `${count} ${t.specialistSingle}`;
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return `${count} ${t.specialistsFew}`;
    }
    return `${count} ${t.specialistsMany}`;
  };

  return (
    <div className="bg-gradient-to-b from-sky-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb trail */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 flex-wrap">
            <button
              type="button"
              onClick={onBackToCategories}
              className="hover:text-sky-600 transition cursor-pointer"
            >
              {t.homeCatalog}
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold">
              {locale === 'ru' ? category.title_ru : category.title_es}
            </span>
            {groupTitle && (
              <>
                <span>/</span>
                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                  {groupTitle}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Category Header Card: "Назад" button, Icon, Title, Description, Quick Search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700/80 p-4 sm:p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {/* Prominent High-Contrast "Назад" Button positioned to the left of the category name and icon */}
            <button
              type="button"
              onClick={onBackToSubsections || onBackToGroups || onBackToCategories}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-red-500 hover:border-red-600 dark:border-red-500 bg-white dark:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40 shadow-xs transition-all active:scale-95 cursor-pointer ring-2 ring-red-500/20 shrink-0"
              title={locale === 'ru' ? 'Назад к разделам' : 'Volver al catálogo'}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] text-red-600 dark:text-red-400" />
              <span>{locale === 'ru' ? 'Назад' : 'Volver'}</span>
            </button>

            {/* Category Icon */}
            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-xs"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
                border: `1px solid ${category.color}30`,
              }}
            >
              {getCategoryIcon(category.iconName, 'w-6 h-6 sm:w-7 sm:h-7')}
            </div>

            {/* Category Title & Stats */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {indexNumber && (
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    {indexNumber}
                  </span>
                )}
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {locale === 'ru' ? category.title_ru : category.title_es}
                  {groupTitle ? ` (${groupTitle})` : ''}
                </h1>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span>{getSpecialistsCountText(specialistsCount)}</span>
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {locale === 'ru' ? category.description_ru : category.description_es}
              </p>
            </div>
          </div>

          {/* Quick Search inside this category */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4 text-sky-600" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === 'ru'
                    ? `Поиск в «${category.title_ru}»...`
                    : `Buscar en «${category.title_es}»...`
                }
                className="block w-full rounded-xl border-0 py-2 pl-9 pr-9 text-xs sm:text-sm text-slate-900 shadow-xs ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:text-white dark:ring-slate-700 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  aria-label={locale === 'ru' ? 'Очистить поиск' : 'Borrar búsqueda'}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
