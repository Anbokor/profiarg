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
                      className="inline-flex items-center rounded-lg bg-slate-100/70 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-sky-950/60 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-300 transition-colors cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-sky-500"
                      title={locale === 'ru' ? `Открыть подкатегорию "${sub}"` : `Ver subcategoría "${sub}"`}
                    >
                      {sub}
                    </button>
                  ))}
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
