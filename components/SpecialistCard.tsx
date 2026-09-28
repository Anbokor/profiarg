'use client';

import React from 'react';
import { Specialist, Locale } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, buildWhatsAppUrl } from '@/lib/utils';
import {
  Star,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Send,
  Heart,
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
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-4 transition-all duration-200 hover:shadow-lg dark:bg-slate-900 ${
        isSelected
          ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header: Avatar + Info + Favorite */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={specialist.avatar}
              alt={specialist.name}
              className="h-16 w-16 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-800"
              loading="lazy"
            />
            {specialist.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900"
                title={t.verifiedBadge}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  category?.badgeBg || 'bg-slate-100'
                } ${category?.badgeText || 'text-slate-800'} border ${
                  category?.badgeBorder || 'border-slate-200'
                }`}
              >
                {locale === 'ru' ? category?.title_ru : category?.title_es}
              </span>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(specialist.id);
                }}
                className="rounded-full p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title={t.favoritesOnly}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>

            <h3
              onClick={() => onSelect(specialist)}
              className="mt-1 font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors cursor-pointer dark:text-white line-clamp-1"
            >
              {specialist.name}
            </h3>

            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
              {title}
            </p>

            {/* Rating and Barrio */}
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{specialist.rating.toFixed(1)}</span>
                <span className="font-normal text-slate-400">({specialist.reviewsCount})</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <MapPin className="h-3 w-3 text-sky-500" />
                <span className="font-medium">{specialist.barrio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
          {description}
        </p>

        {/* Services & Prices Preview */}
        {specialist.services && specialist.services.length > 0 && (
          <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            {specialist.services.slice(0, 2).map((srv) => (
              <div key={srv.id} className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[65%]">
                  {locale === 'ru' ? srv.title_ru : srv.title_es}
                </span>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  {formatCurrency(srv.price, srv.currency, locale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {/* WhatsApp Direct Action */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 active:scale-95 transition"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>

        {/* Telegram Direct */}
        {specialist.telegram && (
          <a
            href={`https://t.me/${specialist.telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center rounded-xl bg-sky-50 p-2 text-sky-600 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 transition"
            title="Telegram"
          >
            <Send className="h-4 w-4" />
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
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
            title={t.showOnMap}
          >
            <MapPin className="h-4 w-4 text-sky-500" />
          </button>
        )}

        {/* View Profile */}
        <button
          type="button"
          onClick={() => onSelect(specialist)}
          className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
        >
          <span>{t.viewDetails}</span>
        </button>
      </div>
    </div>
  );
};
