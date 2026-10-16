'use client';

import React from 'react';
import { Specialist, Locale } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  Star,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Send,
  Heart,
  Phone,
} from 'lucide-react';

interface SpecialistCardProps {
  specialist: Specialist;
  locale: Locale;
  onSelect: (specialist: Specialist) => void;
  onFocusMap?: (specialist: Specialist) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isSelected?: boolean;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialist,
  locale,
  onSelect,
  onFocusMap,
  isFavorite,
  onToggleFavorite,
  isSelected,
}) => {
  const t = translations[locale];
  const category = CATEGORIES.find((c) => c.id === specialist.category);
  const waUrl = buildWhatsAppUrl(specialist.whatsapp, specialist.name, locale);

  const title = locale === 'ru' ? specialist.title_ru : specialist.title_es;
  const description = locale === 'ru' ? specialist.description_ru : specialist.description_es;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 sm:p-6 transition-all duration-200 hover:shadow-lg dark:bg-slate-900 ${
        isSelected
          ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header: Larger Avatar + Info + Favorite */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={specialist.avatar}
              alt={specialist.name}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs"
              loading="lazy"
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

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {specialist.contractorId && (
                  <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-mono font-black text-slate-950 shadow-2xs">
                    #{specialist.contractorId}
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                    category?.badgeBg || 'bg-slate-100'
                  } ${category?.badgeText || 'text-slate-800'} border ${
                    category?.badgeBorder || 'border-slate-200'
                  }`}
                >
                  {locale === 'ru' ? category?.title_ru : category?.title_es}
                </span>
              </div>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(specialist.id);
                }}
                className="rounded-full p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                title={t.favoritesOnly}
              >
                <Heart
                  className={`h-4.5 w-4.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>

            <h3
              onClick={() => onSelect(specialist)}
              className="mt-1.5 font-bold text-lg sm:text-xl text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer dark:text-white"
            >
              {specialist.name}
              {specialist.companyName && (
                <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1.5">
                  • {specialist.companyName}
                </span>
              )}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-sky-700 dark:text-sky-300 mt-0.5">
              {title}
            </p>

            {/* Rating, Barrio & Response Time */}
            <div className="mt-2 flex items-center gap-2.5 text-xs sm:text-sm flex-wrap">
              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>{specialist.rating.toFixed(1)}</span>
                <span className="font-normal text-slate-400">({specialist.reviewsCount})</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                <span className="font-medium">{specialist.barrio}</span>
              </div>
              {specialist.responseTime && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ~{specialist.responseTime}
                  </span>
                </>
              )}
              {specialist.granularLanguages ? (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-0.5 text-xs sm:text-sm">
                    {specialist.granularLanguages.russian && <span title="Русский">🇷🇺</span>}
                    {specialist.granularLanguages.spanish && <span title="Español">🇦🇷</span>}
                    {specialist.granularLanguages.english && <span title="English">🇬🇧</span>}
                    {specialist.granularLanguages.portuguese && <span title="Português">🇧🇷</span>}
                  </span>
                </>
              ) : specialist.languages && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-0.5 text-xs sm:text-sm">
                    {specialist.languages.includes('ru') && <span title="Русский">🇷🇺</span>}
                    {specialist.languages.includes('es') && <span title="Español">🇦🇷</span>}
                    {specialist.languages.includes('en') && <span title="English">🇬🇧</span>}
                  </span>
                </>
              )}
            </div>

            {/* Key Advantages Chips */}
            {specialist.advantages && specialist.advantages.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {specialist.advantages.slice(0, 3).map((adv, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40"
                  >
                    ✓ {adv}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Readable Description */}
        <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
          {description}
        </p>

        {/* Specialization Tags (Strictly WITHOUT Prices) */}
        {specialist.services && specialist.services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {specialist.services.slice(0, 3).map((srv) => (
              <span
                key={srv.id}
                className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                ✓ {locale === 'ru' ? srv.title_ru : srv.title_es}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
        {/* WhatsApp Direct Action (Prominent, High-Contrast) */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition"
        >
          <MessageCircle className="h-4.5 w-4.5" />
          <span>WhatsApp</span>
        </a>

        {/* Direct Phone Call */}
        {specialist.phone && (
          <a
            href={`tel:${specialist.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
            title={t.phoneDirect || 'Позвонить'}
          >
            <Phone className="h-4.5 w-4.5" />
          </a>
        )}

        {/* Telegram Direct */}
        {specialist.telegram && (
          <a
            href={`https://t.me/${specialist.telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 transition"
            title="Telegram"
          >
            <Send className="h-4.5 w-4.5" />
          </a>
        )}

        {/* Focus on Map */}
        {onFocusMap && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFocusMap(specialist);
            }}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
            title={t.showOnMap}
          >
            <MapPin className="h-4.5 w-4.5 text-sky-500" />
          </button>
        )}

        {/* View Profile */}
        <button
          type="button"
          onClick={() => onSelect(specialist)}
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
        >
          <span>{t.viewDetails}</span>
        </button>
      </div>
    </div>
  );
};
