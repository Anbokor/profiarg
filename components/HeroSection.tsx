'use client';

import React from 'react';
import { Locale, CategoryId } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import {
  Search,
  X,
  Scale,
  HeartPulse,
  Building,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  GraduationCap,
  Laptop,
  PawPrint,
  Compass,
  CheckCircle2,
  MapPin,
  MessageCircle,
} from 'lucide-react';

interface HeroSectionProps {
  locale: Locale;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  totalSpecialists: number;
}

const getCategoryIcon = (iconName: string, className = 'w-4 h-4') => {
  switch (iconName) {
    case 'Scale': return <Scale className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Building': return <Building className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'UtensilsCrossed': return <UtensilsCrossed className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'PawPrint': return <PawPrint className={className} />;
    case 'Compass': return <Compass className={className} />;
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
}) => {
  const t = translations[locale];

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
        <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-300">
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
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

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

        {/* Category Pill Filters */}
        <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            }`}
          >
            <span>{t.allCategories}</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                }`}
              >
                <span>{getCategoryIcon(cat.iconName, 'w-3.5 h-3.5')}</span>
                <span>{locale === 'ru' ? cat.title_ru : cat.title_es}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
