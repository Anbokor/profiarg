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
  Layers,
  MapPin,
  ChevronRight,
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
  onViewAllOnMap?: () => void;
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
  onViewAllOnMap,
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
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation row: Back button & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCategories}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t.backToCategories.replace(/^[←\s]+/, '')}</span>
            </button>

            {/* Breadcrumb trail */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span
                onClick={onBackToCategories}
                className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
              >
                {t.homeCatalog}
              </span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}
              </span>
            </div>
          </div>

          {/* Quick jump to map for the whole category */}
          {onViewAllOnMap && (
            <button
              type="button"
              onClick={onViewAllOnMap}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.viewAllOnMap}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Level 2 Category Header Plate */}
        <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-2xs flex-shrink-0"
              style={{
                backgroundColor: `${activeCategory.color}15`,
                color: activeCategory.color,
              }}
            >
              {getCategoryIcon(activeCategory.iconName, 'w-6 h-6 sm:w-7 sm:h-7')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                  {indexNumber}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {getProfileCountText(categorySpecialists.length)}
                </span>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                {locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                {locale === 'ru' ? activeCategory.description_ru : activeCategory.description_es}
              </p>
            </div>
          </div>
        </div>

        {/* Section prompt */}
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.level2Title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.level2Subtitle}
          </p>
        </div>

        {/* Groups Plates (Чистые, крупные плашки без визуального шума) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {groups.map((group) => {
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
              <div
                key={group.id}
                onClick={() => onSelectGroup?.(group.id)}
                className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xl hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-200 cursor-pointer min-h-[170px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${activeCategory.color}15`,
                        color: activeCategory.color,
                      }}
                    >
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {itemsCount} {t.subsectionsCount}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {groupTitle}
                  </h3>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  <span>
                    {groupSpecialistsCount > 0
                      ? getSpecialistsCountText(groupSpecialistsCount)
                      : `${itemsCount} ${t.subsectionsCount}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <span>{t.exploreCategoryBtn}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
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
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation row: Back button & Breadcrumbs */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToGroups || onBackToCategories}
              className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t.backToGroups.replace(/^[←\s]+/, '')}</span>
            </button>

            {/* Breadcrumb trail */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span
                onClick={onBackToCategories}
                className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
              >
                {t.homeCatalog}
              </span>
              <span>/</span>
              <span
                onClick={onBackToGroups}
                className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition"
              >
                {locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}
              </span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">
                {groupTitle}
              </span>
            </div>
          </div>

          {/* Quick jump to map for this section */}
          {onViewAllOnMap && (
            <button
              type="button"
              onClick={onViewAllOnMap}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{t.viewSectionOnMap}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section Header */}
        <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  {groupTitle}
                </h1>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {groupItems.length} {t.subsectionsCount}
                </span>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                {t.level3Subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Subsection Plates: Spacious 2-column or 1-column layout with 100% full readable text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
              <div
                key={item}
                onClick={() => onSelectSubcategory?.(activeCategory.id, item)}
                className="group flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-150 cursor-pointer min-h-[64px]"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug whitespace-normal">
                    {displayTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {specCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                      {getSpecialistsCountText(specCount)}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  /* =======================================================================
     LEVEL 1: ROOT CATALOG (14 Категорий услуг)
     Mockup 1: Ultra-clean, zero clutter, 14 plates
     ======================================================================= */
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Clean, Decluttered Section Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          {t.browseCategoriesTitle}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          {t.browseCategoriesSubtitle}
        </p>
      </div>

      {/* 14 Categories Cards Grid (Responsive 2-column mobile, 3-column tablet, 4-column desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
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
              onClick={() => onSelectCategory(cat.id)}
              className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 p-4 sm:p-5 shadow-2xs hover:shadow-lg hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Top: Icon + Numbered Index (01..14) + Profile Count Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-2xs flex-shrink-0"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                    }}
                  >
                    {getCategoryIcon(cat.iconName, 'w-5 h-5 sm:w-6 sm:h-6')}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                      {indexNumber}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 sm:px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {getProfileCountText(count)}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="mt-3.5 text-left text-sm sm:text-base font-bold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors focus:outline-hidden focus-visible:underline cursor-pointer line-clamp-1"
                >
                  {locale === 'ru' ? cat.title_ru : cat.title_es}
                </button>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                  {locale === 'ru' ? cat.description_ru : cat.description_es}
                </p>

                {/* Subcategories preview tags - Clean, uncluttered, light chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
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
                        className="inline-flex items-center rounded-lg bg-slate-100/70 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-sky-950/60 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-300 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-sky-500"
                        title={locale === 'ru' ? `Открыть подкатегорию "${displaySubTitle}"` : `Ver subcategoría "${displaySubTitle}"`}
                      >
                        {displaySubTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom: Quiet affordance that illuminates on hover */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                <span>{t.exploreCategoryBtn}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
