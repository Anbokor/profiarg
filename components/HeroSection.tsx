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
  CheckCircle2,
  MapPin,
  MessageCircle,
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
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800">
      {/* Background Argentine Sun abstract watermark */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-gradient-to-br from-amber-200/20 via-sky-200/20 to-transparent blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl text-center">
        {/* Argentina + Community Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-xs ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 mb-4 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
          <span>🇦🇷 Buenos Aires & CABA</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-sky-700 dark:text-sky-400">
            {locale === 'ru' ? 'Русскоязычное сообщество' : 'Comunidad de profesionales'}
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl dark:text-white">
          {locale === 'ru' ? (
            <>
              Специалисты и бизнес в <span className="bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">Аргентине</span>
            </>
          ) : (
            <>
              Especialistas y Servicios en <span className="bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">Argentina</span>
            </>
          )}
        </h1>

        {/* Hero Subtitle */}
        <p className="mx-auto mt-3 max-w-3xl text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Large Search Bar */}
        <div className="mx-auto mt-6 max-w-2xl">
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="h-5 w-5 text-sky-600" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="block w-full rounded-2xl border-0 py-4 pl-12 pr-12 text-sm sm:text-base text-slate-900 shadow-md ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:text-white dark:ring-slate-700 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                aria-label={locale === 'ru' ? 'Очистить поиск' : 'Borrar búsqueda'}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Create Order Hero Action */}
        {onOpenCreateOrder && (
          <div className="mx-auto mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 text-sm shadow-md shadow-amber-400/20 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span>{t.createOrderHeroBtn}</span>
            </button>
          </div>
        )}

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

        {/* Quick Highlights / Trust Stats */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{totalSpecialists} {locale === 'ru' ? 'проверенных анкет' : 'perfiles verificados'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-sky-500" />
            <span>{locale === 'ru' ? '15 районов CABA & Zona Norte' : '15 barrios de CABA y Zona Norte'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>{locale === 'ru' ? 'Прямой WhatsApp мастера' : 'Contacto directo por WhatsApp'}</span>
          </div>
        </div>

        {/* Category Pill Filters with Scroll Controls and Gradient Fades */}
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
      </div>
    </section>
  );
};
