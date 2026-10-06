'use client';

import React from 'react';
import { Locale, CategoryId } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import {
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
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

interface HeroSectionProps {
  locale: Locale;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  totalSpecialists: number;
  onReset?: () => void;
  onOpenCreateOrder?: () => void;
  showCategoryPills?: boolean;
}

const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
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

export const HeroSection: React.FC<HeroSectionProps> = ({
  locale,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  totalSpecialists,
  onReset,
  onOpenCreateOrder,
  showCategoryPills = false,
}) => {
  const t = translations[locale];
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  const handleScroll = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  }, []);

  React.useEffect(() => {
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
  }, [handleScroll]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (selectedCategory === 'all') {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      const activeButton = container.querySelector('[data-selected="true"]') as HTMLElement | null;
      if (activeButton) {
        const targetScrollLeft =
          activeButton.offsetLeft - container.clientWidth / 2 + activeButton.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
      }
    }
  }, [selectedCategory]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const offset = direction === 'left' ? -Math.max(200, Math.round(containerWidth * 0.7)) : Math.max(200, Math.round(containerWidth * 0.7));
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 py-4 sm:py-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Compact Mission Statement Banner */}
        <div className="mx-auto max-w-4xl text-center mb-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-300 shadow-2xs mb-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0">🇦🇷 Buenos Aires & CABA</span>
            <span className="text-slate-300 dark:text-slate-700 flex-shrink-0">|</span>
            <span className="text-sky-700 dark:text-sky-400 font-medium">
              {locale === 'ru' ? 'Каталог проверенных услуг' : 'Directorio de profesionales'}
            </span>
          </div>
          <p className="mx-auto max-w-3xl text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal text-center px-2">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Compact Search Bar & Create Order CTA */}
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 sm:py-3 pl-10 pr-10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                aria-label={locale === 'ru' ? 'Очистить поиск' : 'Borrar búsqueda'}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {onOpenCreateOrder && (
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 sm:py-3 text-xs sm:text-sm shadow-xs transition active:scale-95 whitespace-nowrap cursor-pointer flex-shrink-0"
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span>{t.createOrderHeroBtn}</span>
            </button>
          )}
        </div>

        {/* Active Category Filter Badge in Search Area */}
        {selectedCategory !== 'all' && activeCategory && (
          <div className="mx-auto mt-3 flex items-center justify-center gap-2 animate-fade-in flex-wrap px-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'ru' ? 'Выбранная категория:' : 'Categoría seleccionada:'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-700/80 px-3 py-1 text-xs font-semibold text-sky-800 dark:text-sky-200 shadow-xs">
              <span className="text-sky-600 dark:text-sky-400">
                {getCategoryIcon(activeCategory.iconName, 'w-3.5 h-3.5')}
              </span>
              <span>{locale === 'ru' ? activeCategory.title_ru : activeCategory.title_es}</span>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-200/80 hover:bg-sky-300 dark:bg-sky-800 dark:hover:bg-sky-700 text-sky-800 dark:text-sky-100 transition"
                title={locale === 'ru' ? 'Сбросить категорию' : 'Quitar filtro'}
                aria-label={locale === 'ru' ? 'Сбросить категорию' : 'Quitar filtro'}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
            <button
              type="button"
              onClick={onReset || (() => setSelectedCategory('all'))}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 underline transition ml-1"
            >
              {t.resetFilters}
            </button>
          </div>
        )}


        {/* Category Pill Filters with Scroll Controls and Gradient Fades */}
        {showCategoryPills && (
          <div className="relative mt-6 max-w-5xl mx-auto px-1 sm:px-2">
            {/* Left Gradient Fade & Scroll Button */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center w-14 sm:w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="pointer-events-auto ml-1 sm:ml-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  aria-label={locale === 'ru' ? 'Прокрутить влево' : 'Desplazar a la izquierda'}
                  title={locale === 'ru' ? 'Прокрутить влево' : 'Desplazar a la izquierda'}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Right Gradient Fade & Scroll Button */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end w-14 sm:w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="pointer-events-auto mr-1 sm:mr-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  aria-label={locale === 'ru' ? 'Прокрутить вправо' : 'Desplazar a la derecha'}
                  title={locale === 'ru' ? 'Прокрутить вправо' : 'Desplazar a la derecha'}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Horizontal Scroll Area */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex items-center gap-2 overflow-x-auto px-4 sm:px-8 py-3 scrollbar-none scroll-smooth"
            >
              {/* Prominent "All Categories" Pill with LayoutGrid icon */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                aria-pressed={selectedCategory === 'all'}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-900 dark:bg-white dark:text-slate-900 dark:ring-white'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t.allCategories}</span>
              </button>

              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs ring-1 ring-sky-600'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                    }`}
                    title={
                      isSelected
                        ? locale === 'ru'
                          ? 'Нажмите, чтобы сбросить выбор категории'
                          : 'Tocá para quitar el filtro de categoría'
                        : undefined
                    }
                  >
                    <span className="flex-shrink-0">{getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}</span>
                    <span className="whitespace-nowrap flex-shrink-0">{locale === 'ru' ? cat.title_ru : cat.title_es}</span>
                    {isSelected && (
                      <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Clear end spacing so the last pill isn't flush against the right edge */}
              <div className="w-8 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
