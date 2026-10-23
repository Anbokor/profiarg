'use client';

import React from 'react';
import { Specialist, Locale } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { buildWhatsAppUrl, getSpecialistDisplayName, getSpecialistCompanyName } from '@/lib/utils';
import {
  Star,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Heart,
  ArrowRight,
} from 'lucide-react';

interface SpecialistCardProps {
  specialist: Specialist;
  locale: Locale;
  onSelect: (specialist: Specialist) => void;
  onSelectPhoto?: (specialist: Specialist, photoUrl: string) => void;
  onFocusMap?: (specialist: Specialist) => void;
  onInitiateDeal?: (specialist: Specialist) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isSelected?: boolean;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialist,
  locale,
  onSelect,
  onSelectPhoto,
  onFocusMap,
  onInitiateDeal,
  isFavorite,
  onToggleFavorite,
  isSelected,
}) => {
  const t = translations[locale];
  const category = CATEGORIES.find((c) => c.id === specialist.category);
  const displayName = getSpecialistDisplayName(specialist, locale);
  const displayCompanyName = getSpecialistCompanyName(specialist, locale);
  const waUrl = buildWhatsAppUrl(specialist.whatsapp, displayName, locale);

  const title = locale === 'ru' ? specialist.title_ru : specialist.title_es;

  // Determine Category, Group, Subcategory tags for header matching sketch: [Рем] [Усл] [Двери]
  const categoryBadgeTitle = locale === 'ru'
    ? (category?.title_ru.split(/\s+/)[0]?.replace(/[,;:]/g, '') || category?.title_ru || 'Услуги')
    : (category?.title_es.split(/\s+/)[0]?.replace(/[,;:]/g, '') || category?.title_es || 'Servicios');

  const matchingGroup = category?.groups?.find((g) =>
    g.items.some((item) =>
      (specialist.subcategories || []).some(
        (sub) => sub.toLowerCase() === item.toLowerCase()
      )
    )
  );
  const groupBadgeTitle = matchingGroup
    ? (locale === 'ru' ? matchingGroup.title_ru.replace(/\s+Obras\b/i, '').replace(/\s+Materiales\b/i, '') : matchingGroup.title_es)
    : (locale === 'ru' ? 'Услуги' : 'Servicios');

  const subBadgeTitle = specialist.subcategories && specialist.subcategories.length > 0
    ? specialist.subcategories[0]
    : null;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 sm:p-5 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 ${
        isSelected
          ? 'border-red-500 ring-2 ring-red-500/20 shadow-md'
          : 'border-slate-300 hover:border-red-500/80 hover:ring-2 hover:ring-red-500/10 dark:border-slate-700/80 dark:hover:border-red-500/80'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start gap-4 justify-between">
        {/* Left Side: Avatar + Main Content */}
        <div className="flex items-start gap-3.5 sm:gap-4.5 flex-1 min-w-0">
          {/* Avatar with Verified Badge - object-top ensures face is always 100% visible */}
          <div className="relative shrink-0 h-20 w-20 sm:h-24 sm:w-24">
            <img
              src={specialist.avatar}
              alt={displayName}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover object-top ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs cursor-pointer hover:opacity-95 transition"
              loading="lazy"
              onClick={() => onSelect(specialist)}
            />
            {specialist.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs"
                title={t.verifiedBadge}
              >
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Center Details */}
          <div className="min-w-0 flex-1">
            {/* Top row: Contractor ID + Category/Group/Sub badges [Ремонт] [Услуги] [Окна/Двери] */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {specialist.contractorId && (
                <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-mono font-black text-slate-950 shadow-2xs">
                  #{specialist.contractorId}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  category?.badgeBg || 'bg-slate-100'
                } ${category?.badgeText || 'text-slate-800'} border ${
                  category?.badgeBorder || 'border-slate-200'
                }`}
              >
                {categoryBadgeTitle}
              </span>
              {groupBadgeTitle && (
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
                  {groupBadgeTitle}
                </span>
              )}
              {subBadgeTitle && (
                <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {subBadgeTitle}
                </span>
              )}
            </div>

            {/* Contractor Name & Company Name */}
            <h3
              onClick={() => onSelect(specialist)}
              className="mt-1.5 font-bold text-lg sm:text-xl text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer dark:text-white leading-tight"
            >
              {displayName}
              {displayCompanyName && (
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 ml-1.5">
                  • {displayCompanyName}
                </span>
              )}
            </h3>

            {/* Subtitle / Primary Specialization */}
            <p className="text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 mt-0.5 leading-snug">
              {title}
            </p>

            {/* Meta Pill: Rating • Barrio • Response Time • Languages */}
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 flex-wrap shadow-2xs">
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{specialist.rating.toFixed(1)}</span>
                <span className="font-normal text-slate-400">({specialist.reviewsCount})</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusMap?.(specialist);
                }}
                title={specialist.addressLine ? `${specialist.addressLine} • ${locale === 'ru' ? 'Показать на карте' : 'Ver en el mapa'}` : (locale === 'ru' ? 'Показать на карте' : 'Ver en el mapa')}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium hover:text-sky-600 dark:hover:text-sky-400 transition cursor-pointer"
              >
                <MapPin className="h-3 w-3 text-sky-500" />
                <span>{specialist.barrio}</span>
              </button>
              {specialist.responseTime && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ~{specialist.responseTime}
                  </span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-600">•</span>
              {specialist.granularLanguages ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {specialist.granularLanguages.russian && <span>RU</span>}
                  {specialist.granularLanguages.spanish && <span>AR</span>}
                  {specialist.granularLanguages.english && <span>GB</span>}
                  {specialist.granularLanguages.portuguese && <span>BR</span>}
                </span>
              ) : specialist.languages && (
                <span className="flex items-center gap-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  {specialist.languages.join(' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Vertical Action Buttons Stack (matching handwritten sketch) */}
        <div className="w-full md:w-auto flex md:flex-col items-center justify-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 self-stretch md:self-auto">
          {/* Favorite Button (Heart) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(specialist.id);
            }}
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border transition-all cursor-pointer ${
              isFavorite
                ? 'border-rose-300 bg-rose-50 text-rose-500 shadow-xs dark:border-rose-800 dark:bg-rose-950/40'
                : 'border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:border-slate-700 dark:bg-slate-800'
            }`}
            title={t.favoritesOnly}
            aria-label={t.favoritesOnly}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* WhatsApp Tracked Deal Action (Variant A - Secure initiation) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onInitiateDeal) {
                onInitiateDeal(specialist);
              } else {
                window.open(waUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            title={locale === 'ru' ? 'Начать сделку в WhatsApp' : 'Iniciar trato por WhatsApp'}
          >
            <MessageCircle className="h-4.5 w-4.5" />
            <span className="inline">WhatsApp</span>
          </button>

          {/* View Profile Button */}
          <button
            type="button"
            onClick={() => onSelect(specialist)}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition cursor-pointer"
            title={t.viewDetails}
            aria-label={t.viewDetails}
          >
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
