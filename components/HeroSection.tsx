'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Locale, CategoryId, Specialist } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { SEED_SPECIALISTS } from '@/data/seedData';
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
  ArrowRight,
  Star,
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
  onSelectSpecialist?: (spec: Specialist) => void;
  specialists?: Specialist[];
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
  onSelectSpecialist,
  specialists,
}) => {
  const t = translations[locale];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Decoupled local search input to prevent screen jumps on every letter
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCommitSearch = (queryToCommit?: string) => {
    const q = (queryToCommit !== undefined ? queryToCommit : localQuery).trim();
    setSearchQuery(q);
    setIsDropdownOpen(false);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const matchingCategories = React.useMemo(() => {
    const q = localQuery.toLowerCase().trim();
    if (!q) return [];
    return CATEGORIES.filter((c) =>
      c.title_ru.toLowerCase().includes(q) ||
      c.title_es.toLowerCase().includes(q) ||
      c.subcategories.some((sub) => sub.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [localQuery]);

  const matchingSpecialists = React.useMemo(() => {
    const q = localQuery.toLowerCase().trim();
    if (!q) return [];
    const pool = specialists && specialists.length > 0 ? specialists : SEED_SPECIALISTS;
    return pool.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.title_ru.toLowerCase().includes(q) ||
      s.title_es.toLowerCase().includes(q) ||
      (s.companyName && s.companyName.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [localQuery, specialists]);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

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
  }, [handleScroll]);

  useEffect(() => {
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
        {/* Decluttered, Elegant Hero Header */}
        <div className="mx-auto max-w-2xl text-center mb-5">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            {locale === 'ru' ? 'Каталог услуг и специалистов в Аргентине' : 'Directorio de servicios en Argentina'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Clean, Prominent Search Bar with Autocomplete Suggestions */}
        <div className="mx-auto max-w-2xl relative" ref={searchContainerRef}>
          <div className="relative w-full flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <input
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setIsDropdownOpen(e.target.value.trim().length >= 3);
              }}
              onFocus={() => {
                if (localQuery.trim().length >= 3) setIsDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setIsDropdownOpen(false);
                  handleCommitSearch();
                } else if (e.key === 'Escape') {
                  setIsDropdownOpen(false);
                }
              }}
              placeholder={t.searchPlaceholder}
              className="block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 sm:py-3.5 pl-11 pr-24 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
              {localQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  aria-label={locale === 'ru' ? 'Очистить поиск' : 'Borrar búsqueda'}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleCommitSearch()}
                className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer flex-shrink-0"
              >
                {locale === 'ru' ? 'Найти' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Autocomplete Suggestions Dropdown (Only for 3+ characters to avoid opening after every letter) */}
          {isDropdownOpen && localQuery.trim().length >= 3 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
              {matchingCategories.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {locale === 'ru' ? 'Категории' : 'Categorías'}
                  </div>
                  {matchingCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setLocalQuery('');
                        setSearchQuery('');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sky-600">{getCategoryIcon(cat.iconName, 'w-4 h-4')}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {locale === 'ru' ? cat.title_ru : cat.title_es}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {matchingSpecialists.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {locale === 'ru' ? 'Мастера и специалисты' : 'Profesionales'}
                  </div>
                  {matchingSpecialists.map((spec) => (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => {
                        if (onSelectSpecialist) {
                          onSelectSpecialist(spec);
                        } else {
                          handleCommitSearch(spec.name);
                        }
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-left transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={spec.avatar}
                          alt={spec.name}
                          className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {spec.name} {spec.companyName ? `• ${spec.companyName}` : ''}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {locale === 'ru' ? spec.title_ru : spec.title_es}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold ml-2 flex-shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{spec.rating.toFixed(1)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2 bg-slate-50 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() => handleCommitSearch()}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 rounded-xl transition cursor-pointer"
                >
                  <span>
                    {locale === 'ru'
                      ? `Искать «${localQuery}» по всей платформе`
                      : `Buscar «${localQuery}» en toda la plataforma`}
                  </span>
                  <span className="text-[11px] text-slate-400">↵ Enter</span>
                </button>
              </div>
            </div>
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
