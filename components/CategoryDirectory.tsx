'use client';

import React from 'react';
import { Locale, CategoryId, Specialist, Category } from '@/types';
import { CATEGORIES, getSubcategoryTitle } from '@/data/categories';
import { translations } from '@/lib/translations';
import {
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
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface CategoryDirectoryProps {
  locale: Locale;
  specialists: Specialist[];
  selectedCategory?: CategoryId | 'all';
  selectedGroup?: string | null;
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectGroup?: (groupId: string | null) => void;
  onSelectSubcategory?: (categoryId: CategoryId, subcategory: string) => void;
  onBackToCategories?: () => void;
  onBackToGroups?: () => void;
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

export const CategoryDirectory: React.FC<CategoryDirectoryProps> = ({
  locale,
  specialists,
  selectedCategory = 'all',
  selectedGroup = null,
  onSelectCategory,
  onSelectGroup,
  onSelectSubcategory,
  onBackToCategories,
  onBackToGroups,
}) => {
  const t = translations[locale];

  const getProfileCountText = (count: number) => {
    if (locale === 'es') {
      return `${count} ${count === 1 ? t.profileSingle : t.profileMany}`;
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) {
      return `${count} ${t.profileMany}`;
    }
    if (mod10 === 1) {
      return `${count} ${t.profileSingle}`;
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return `${count} ${t.profileFew}`;
    }
    return `${count} ${t.profileMany}`;
  };

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

  const getShortSpecialistsCountText = (count: number) => {
    if (locale === 'es') {
      return `${count} ${count === 1 ? t.specialistShortSingle : t.specialistShortMany}`;
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod100 >= 11 && mod100 <= 19) {
      return `${count} ${t.specialistShortMany}`;
    }
    if (mod10 === 1) {
      return `${count} ${t.specialistShortSingle}`;
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return `${count} ${t.specialistShortFew}`;
    }
    return `${count} ${t.specialistShortMany}`;
  };

  // Find active category if selected
  const activeCategory =
    selectedCategory !== 'all' ? CATEGORIES.find((c) => c.id === selectedCategory) || null : null;
  const groups = activeCategory?.groups || [];
  const activeGroup = groups.find((g) => g.id === selectedGroup) || null;

  /* =======================================================================
     LEVEL 2: CATEGORY GROUPS (Разделение на Работы / Материалы)
     Чистые, лаконичные плашки без мусора и смешения языков.
     В RU: "Услуги" и "Продажа материалов"
     В ES: "Servicios de obras" и "Venta de materiales"
     ======================================================================= */
  if (activeCategory && selectedGroup === null) {
    const categoryIndex = CATEGORIES.findIndex((c) => c.id === activeCategory.id);
    const indexNumber = categoryIndex !== -1 ? String(categoryIndex + 1).padStart(2, '0') : '';
    const categorySpecialists = specialists.filter((s) => s.category === activeCategory.id);

    return (
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Breadcrumb trail */}
        <div className="mb-3 flex items-center justify-between gap-3">
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
              {locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}
            </span>
          </nav>
        </div>

        {/* Level 2 Category Header Plate */}
        <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 p-4 sm:p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {/* Prominent High-Contrast "Назад" Button identical across all levels */}
            <button
              type="button"
              onClick={onBackToCategories}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 hover:border-red-600 dark:border-red-500 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40 shadow-xs transition-all active:scale-95 cursor-pointer ring-2 ring-red-500/20 shrink-0 w-[96px] sm:w-[108px]"
              title={locale === 'ru' ? 'Назад' : 'Volver'}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] text-red-600 dark:text-red-400 shrink-0" />
              <span className="inline-block text-center">{locale === 'ru' ? 'Назад' : 'Volver'}</span>
            </button>

            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-xs flex-shrink-0"
              style={{
                backgroundColor: `${activeCategory.color}15`,
                color: activeCategory.color,
                border: `1px solid ${activeCategory.color}30`,
              }}
            >
              {getCategoryIcon(activeCategory.iconName, 'w-6 h-6 sm:w-7 sm:h-7')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  {indexNumber}
                </span>
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  {locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}
                </h1>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0">
                  {getProfileCountText(categorySpecialists.length)}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                {t.level2Subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Groups Plates (Wide Single Column) */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {groups.map((group, idx) => {
            const rawTitle = locale === 'ru' ? group.title_ru : group.title_es;
            // Clean up title: strictly ensure no language bleed
            const groupTitle = locale === 'ru'
              ? rawTitle.replace(/\s+Obras\b/i, '').replace(/\s+Materiales\b/i, '')
              : rawTitle;
            const itemsCount = group.items.length;

            // Count specialists matching any item in this group
            const groupSpecialistsCount = categorySpecialists.filter((s) => {
              const subs = s.subcategories || [];
              return group.items.some((item) =>
                subs.some(
                  (sub) =>
                    sub.toLowerCase() === item.toLowerCase() ||
                    sub.toLowerCase().includes(item.toLowerCase())
                )
              );
            }).length;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onSelectGroup?.(group.id)}
                className="group relative flex items-center justify-between gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-md hover:border-red-500 dark:hover:border-red-500 hover:ring-2 hover:ring-red-500/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[58px] sm:min-h-[64px] text-left w-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500"
              >
                {/* Left Area: Index + Title Column */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 group-hover:bg-red-50 group-hover:text-red-600 dark:group-hover:bg-red-950/60 dark:group-hover:text-red-400 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1 pr-1">
                    <span className="block text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug break-words">
                      {groupTitle}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>{itemsCount} {t.subsectionsCount}</span>
                      {groupSpecialistsCount > 0 && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-sky-600 dark:text-sky-400">
                            {getShortSpecialistsCountText(groupSpecialistsCount)}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right Area: Action button affordance (exact match with Level 3) */}
                <div className="flex items-center flex-shrink-0 self-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-xs transition-all duration-200">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  /* =======================================================================
     LEVEL 3: SUBSECTIONS (Разделение на подразделы)
     Широкие, высококонтрастные и 100% читаемые плашки.
     Никаких обрезанных слов (no truncate), никаких бессмысленных прочерков.
     Точный перевод на русский или испанский согласно выбранному языку.
     ======================================================================= */
  if (activeCategory && selectedGroup !== null) {
    const categorySpecialists = specialists.filter((s) => s.category === activeCategory.id);
    const groupItems = activeGroup ? activeGroup.items : activeCategory.subcategories;
    const rawGroupTitle = activeGroup
      ? locale === 'ru'
        ? activeGroup.title_ru
        : activeGroup.title_es
      : locale === 'ru'
      ? activeCategory.title_ru
      : activeCategory.title_es;
    const groupTitle = locale === 'ru'
      ? rawGroupTitle.replace(/\s+Obras\b/i, '').replace(/\s+Materiales\b/i, '')
      : rawGroupTitle;

    return (
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Breadcrumb trail */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 flex-wrap">
            <button
              type="button"
              onClick={onBackToCategories}
              className="hover:text-sky-600 transition cursor-pointer"
            >
              {t.homeCatalog}
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={onBackToGroups}
              className="hover:text-sky-600 transition cursor-pointer"
            >
              {locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold">
              {groupTitle}
            </span>
          </nav>
        </div>

        {/* Level 3 Section Header Plate */}
        <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 p-4 sm:p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {/* Prominent High-Contrast "Назад" Button identical across all levels */}
            <button
              type="button"
              onClick={onBackToGroups || onBackToCategories}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-500 hover:border-red-600 dark:border-red-500 bg-white dark:bg-slate-800 px-3 sm:px-4 py-2 text-xs sm:text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40 shadow-xs transition-all active:scale-95 cursor-pointer ring-2 ring-red-500/20 shrink-0 w-[96px] sm:w-[108px]"
              title={locale === 'ru' ? 'Назад' : 'Volver'}
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5] text-red-600 dark:text-red-400 shrink-0" />
              <span className="inline-block text-center">{locale === 'ru' ? 'Назад' : 'Volver'}</span>
            </button>

            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-xs flex-shrink-0"
              style={{
                backgroundColor: `${activeCategory.color}15`,
                color: activeCategory.color,
                border: `1px solid ${activeCategory.color}30`,
              }}
            >
              {getCategoryIcon(activeCategory.iconName, 'w-6 h-6 sm:w-7 sm:h-7')}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  {groupTitle}
                </h1>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0">
                  {groupItems.length} {t.subsectionsCount}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                {t.level3Subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Subsection Plates: Wide Single Column with 100% full readable text */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {groupItems.map((item, idx) => {
            const itemLower = item.toLowerCase();
            const matchingSpecialists = categorySpecialists.filter((s) => {
              const hasSub = (s.subcategories || []).some(
                (sub) =>
                  sub.toLowerCase() === itemLower ||
                  sub.toLowerCase().includes(itemLower) ||
                  itemLower.includes(sub.toLowerCase())
              );
              const hasSrv = (s.services || []).some(
                (srv) =>
                  srv.title_ru.toLowerCase().includes(itemLower) ||
                  srv.title_es.toLowerCase().includes(itemLower)
              );
              return hasSub || hasSrv;
            });
            const specCount = matchingSpecialists.length;
            const displayTitle = getSubcategoryTitle(item, locale);

            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelectSubcategory?.(activeCategory.id, item)}
                className="group relative flex items-center justify-between gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-md hover:border-red-500 dark:hover:border-red-500 hover:ring-2 hover:ring-red-500/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[58px] sm:min-h-[64px] text-left w-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500"
              >
                {/* Left Area: Index + Title Column */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 group-hover:bg-red-50 group-hover:text-red-600 dark:group-hover:bg-red-950/60 dark:group-hover:text-red-400 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1 pr-1">
                    <span className="block text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug break-words">
                      {displayTitle}
                    </span>
                    {specCount > 0 && (
                      <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                        <span>{getShortSpecialistsCountText(specCount)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Area: Action button affordance */}
                <div className="flex items-center flex-shrink-0 self-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-xs transition-all duration-200">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  /* =======================================================================
     LEVEL 1: ROOT CATALOG (14 Категорий услуг)
     Такой же лаконичный, как и 3 уровень: элегантные горизонтальные плашки.
     ======================================================================= */
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Clean, Decluttered Section Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          {t.browseCategoriesTitle}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          {t.browseCategoriesSubtitle}
        </p>
      </div>

      {/* 14 Categories Cards (Single-Column Wide Layout matching Level 2 & Level 3) */}
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {CATEGORIES.map((cat, index) => {
          const categorySpecialists = specialists.filter((s) => s.category === cat.id);
          const count = categorySpecialists.length;
          const indexNumber = String(index + 1).padStart(2, '0');

          // Prioritize active subcategories from actual specialists first (round-robin across specialists for trade diversity),
          // then pad with category's defined subcategories
          const specialistSubsList: string[] = [];
          const maxSubs = Math.max(...categorySpecialists.map((s) => (s.subcategories || []).length), 0);
          for (let i = 0; i < maxSubs; i++) {
            for (const s of categorySpecialists) {
              const sub = s.subcategories?.[i];
              if (sub && cat.subcategories.includes(sub) && !specialistSubsList.includes(sub)) {
                specialistSubsList.push(sub);
              }
            }
          }
          const specialistSubs = specialistSubsList;
          const allSubs = [
            ...specialistSubs,
            ...cat.subcategories.filter((s) => !specialistSubs.includes(s)),
          ];
          const displaySubcategories = allSubs.slice(0, 4);

          return (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectCategory(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory(cat.id);
                }
              }}
              className="group relative flex items-center justify-between gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:shadow-md hover:border-red-500 dark:hover:border-red-500 hover:ring-2 hover:ring-red-500/15 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[58px] sm:min-h-[64px] text-left w-full focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:border-red-500"
            >
              {/* Left Area: Icon + Title & Meta Column */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div
                  className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                  style={{
                    backgroundColor: `${cat.color}15`,
                    color: cat.color,
                  }}
                >
                  {getCategoryIcon(cat.iconName, 'w-5 h-5 sm:w-6 sm:h-6')}
                </div>

                <div className="min-w-0 flex-1 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors flex-shrink-0">
                      {indexNumber}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug break-words">
                      {locale === 'ru' ? cat.title_ru : cat.title_es}
                    </h3>
                  </div>

                  {/* Clean secondary meta row: Profile count + Direct Subcategory Links */}
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
                      <span>{getProfileCountText(count)}</span>
                    </span>

                    {displaySubcategories.length > 0 && (
                      <div className="hidden sm:inline-flex items-center gap-1 ml-0.5 flex-wrap">
                        <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                        {displaySubcategories.map((sub) => {
                          const displaySubTitle = getSubcategoryTitle(sub, locale);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectSubcategory) {
                                  onSelectSubcategory(cat.id, sub);
                                } else {
                                  onSelectCategory(cat.id);
                                }
                              }}
                              className="inline-flex items-center rounded-md bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/60 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:text-red-700 dark:text-slate-300 dark:hover:text-red-300 transition-colors cursor-pointer"
                              title={locale === 'ru' ? `Открыть подкатегорию "${displaySubTitle}"` : `Ver subcategoría "${displaySubTitle}"`}
                            >
                              {displaySubTitle}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Area: Action button affordance (exact match with Level 2 and Level 3!) */}
              <div className="flex items-center flex-shrink-0 self-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-xs transition-all duration-200">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
