'use client';

import React from 'react';
import { Locale, CategoryId, Specialist } from '@/types';
import { CATEGORIES } from '@/data/categories';
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
  Layers,
} from 'lucide-react';

interface CategoryDirectoryProps {
  locale: Locale;
  specialists: Specialist[];
  onSelectCategory: (categoryId: CategoryId) => void;
  onSelectSubcategory?: (categoryId: CategoryId, subcategory: string) => void;
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
  onSelectCategory,
  onSelectSubcategory,
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

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Directory Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.categoryDirectoryHeading}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.browseCategoriesTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
          {t.browseCategoriesSubtitle}
        </p>
      </div>

      {/* 14 Categories Cards Grid (Responsive 2-column mobile, 3-column tablet, 4-column desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
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
          const displaySubcategories = allSubs.slice(0, 5);
          const remainingCount = Math.max(0, cat.subcategories.length - displaySubcategories.length);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-5 shadow-xs hover:shadow-xl hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Top: Icon + Numbered Index (01..14) + Profile Count Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 shadow-xs flex-shrink-0"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      border: `1px solid ${cat.color}25`,
                    }}
                  >
                    {getCategoryIcon(cat.iconName, 'w-5 h-5 sm:w-6 sm:h-6')}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      {indexNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{getProfileCountText(count)}</span>
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="mt-3 text-left text-sm sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors focus:outline-hidden focus-visible:underline cursor-pointer line-clamp-2 sm:line-clamp-none"
                >
                  {locale === 'ru' ? cat.title_ru : cat.title_es}
                </button>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {locale === 'ru' ? cat.description_ru : cat.description_es}
                </p>

                {/* Subcategories preview tags */}
                <div className="mt-3 flex flex-wrap gap-1 sm:gap-1.5">
                  {displaySubcategories.map((sub) => (
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
                      className="inline-flex items-center rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 dark:hover:bg-sky-950 dark:hover:text-sky-200 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500"
                      title={locale === 'ru' ? `Открыть подкатегорию "${sub}"` : `Ver subcategoría "${sub}"`}
                    >
                      {sub}
                    </button>
                  ))}
                  {remainingCount > 0 && (
                    <span className="inline-flex items-center rounded-lg bg-slate-100/50 dark:bg-slate-800/50 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      +{remainingCount} {t.moreSubcategories}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Action link */}
              <div className="mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300">
                <span>{t.exploreCategoryBtn}</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
