'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Locale, Category } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { translations } from '@/lib/translations';
import {
  ArrowLeft,
  Search,
  X,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
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
  selectedSubcategory: string | 'all';
  onSelectSubcategory: (sub: string | 'all') => void;
  onBackToCategories: () => void;
  specialistsCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateOrder?: () => void;
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
  selectedSubcategory,
  onSelectSubcategory,
  onBackToCategories,
  specialistsCount,
  searchQuery,
  setSearchQuery,
  onOpenCreateOrder,
}) => {
  const t = translations[locale];
  const categoryIndex = CATEGORIES.findIndex((c) => c.id === category.id);
  const indexNumber = categoryIndex !== -1 ? String(categoryIndex + 1).padStart(2, '0') : '';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [handleScroll, category.id]);

  // Center active subcategory pill on change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (selectedSubcategory === 'all') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const activeButton = container.querySelector('[data-selected="true"]') as HTMLElement | null;
      if (activeButton) {
        const targetScrollLeft =
          activeButton.offsetLeft - container.clientWidth / 2 + activeButton.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    }
  }, [selectedSubcategory]);

  const scrollSubcategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const offset =
        direction === 'left'
          ? -Math.max(200, Math.round(containerWidth * 0.7))
          : Math.max(200, Math.round(containerWidth * 0.7));
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
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

  return (
    <div className="bg-gradient-to-b from-sky-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation row: Back to all categories button + Create Order button */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <button
            type="button"
            onClick={onBackToCategories}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition group cursor-pointer"
            aria-label={t.backToCategories}
          >
            <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.backToCategories.replace(/^[←\s]+/, '')}</span>
          </button>

          {onOpenCreateOrder && (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t.createOrderHeroBtn}</span>
            </button>
          )}
        </div>

        {/* Category Header Card: Icon, Title, Description, Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl shadow-xs"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
                border: `1px solid ${category.color}30`,
              }}
            >
              {getCategoryIcon(category.iconName, 'w-7 h-7 sm:w-8 sm:h-8')}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {indexNumber && (
                  <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    {indexNumber}
                  </span>
                )}
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {locale === 'ru' ? category.title_ru : category.title_es}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{getSpecialistsCountText(specialistsCount)}</span>
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
                {locale === 'ru' ? category.description_ru : category.description_es}
              </p>
            </div>
          </div>

          {/* Quick Search inside this category */}
          <div className="w-full sm:w-72 flex-shrink-0">
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

        {/* Horizontal Subcategories Scroll Strip */}
        <div className="relative mt-4">
          {/* Left Gradient Fade & Scroll Button */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center w-12 bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollSubcategories('left')}
                className="pointer-events-auto ml-1 h-7 w-7 rounded-full bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                aria-label={locale === 'ru' ? 'Прокрутить влево' : 'Desplazar a la izquierda'}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Right Gradient Fade & Scroll Button */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end w-12 bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent pointer-events-none">
              <button
                type="button"
                onClick={() => scrollSubcategories('right')}
                className="pointer-events-auto mr-1 h-7 w-7 rounded-full bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                aria-label={locale === 'ru' ? 'Прокрутить вправо' : 'Desplazar a la derecha'}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Subcategory Pill Buttons Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth"
          >
            {/* "All subcategories" Pill with LayoutGrid icon */}
            <button
              type="button"
              onClick={() => onSelectSubcategory('all')}
              aria-pressed={selectedSubcategory === 'all'}
              data-selected={selectedSubcategory === 'all'}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                selectedSubcategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t.allSubcategories}</span>
            </button>

            {/* Individual Subcategory Pills */}
            {category.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  data-selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => onSelectSubcategory(isSelected ? 'all' : sub)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-xs ring-1 ring-sky-600'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                  }`}
                  title={
                    isSelected
                      ? locale === 'ru'
                        ? 'Нажмите, чтобы сбросить выбор подкатегории'
                        : 'Tocá para quitar el filtro de subcategoría'
                      : undefined
                  }
                >
                  <span className="whitespace-nowrap flex-shrink-0">{sub}</span>
                  {isSelected && (
                    <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100 flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {/* End spacing spacer */}
            <div className="w-8 flex-shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};
