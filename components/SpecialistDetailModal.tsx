'use client';

import React, { useState } from 'react';
import { Specialist, Locale, Review } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, buildWhatsAppUrl } from '@/lib/utils';
import {
  X,
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Heart,
  Share2,
  Briefcase,
  Languages,
} from 'lucide-react';

interface SpecialistDetailModalProps {
  specialist: Specialist | null;
  locale: Locale;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddReview: (specialistId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

export const SpecialistDetailModal: React.FC<SpecialistDetailModalProps> = ({
  specialist,
  locale,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddReview,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  if (!specialist) return null;

  const t = translations[locale];
  const category = CATEGORIES.find((c) => c.id === specialist.category);
  const waUrl = buildWhatsAppUrl(specialist.whatsapp, specialist.name, locale);

  const title = locale === 'ru' ? specialist.title_ru : specialist.title_es;
  const description = locale === 'ru' ? specialist.description_ru : specialist.description_es;
  const workingHours = locale === 'ru' ? specialist.workingHours_ru : specialist.workingHours_es;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) return;

    setIsSubmittingReview(true);
    onAddReview(specialist.id, {
      authorName: newReviewAuthor.trim(),
      rating: newReviewRating,
      text_ru: newReviewText.trim(),
      text_es: newReviewText.trim(),
    });

    setNewReviewAuthor('');
    setNewReviewText('');
    setNewReviewRating(5);
    setIsSubmittingReview(false);
    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Image & Close Button */}
        <div className="relative h-44 sm:h-56 w-full shrink-0">
          <img
            src={specialist.coverImage || specialist.avatar}
            alt={specialist.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Actions: Close, Favorite, Share */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white dark:bg-slate-800/90 dark:text-white"
              title={t.share}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(specialist.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white dark:bg-slate-800/90 dark:text-white"
              title={t.favoritesOnly}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white dark:bg-slate-800/90 dark:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Toast Notification */}
          {copiedToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
              {t.copiedLink}
            </div>
          )}

          {/* Avatar and Title overlaid on Cover */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <img
                src={specialist.avatar}
                alt={specialist.name}
                className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl border-2 border-white object-cover shadow-xl dark:border-slate-800"
              />
              {specialist.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900"
                  title={t.verifiedBadge}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs`}
                  style={{ backgroundColor: category?.pinBg || '#0284c7' }}
                >
                  {locale === 'ru' ? category?.title_ru : category?.title_es}
                </span>
                <span className="text-xs text-slate-200">
                  {specialist.experienceYears} {t.yearsInArg}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{specialist.name}</h2>
              <p className="text-xs text-slate-200 line-clamp-1">{title}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Metrics Bar & Primary CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-amber-500">
                <Star className="h-5 w-5 fill-amber-400" />
                <span className="text-base text-slate-900 dark:text-white">
                  {specialist.rating.toFixed(1)}
                </span>
                <span className="text-slate-400">({specialist.reviewsCount} {locale === 'ru' ? 'отзывов' : 'opiniones'})</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-sky-500" />
                <span className="font-semibold">{specialist.barrio}</span>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{t.contactWhatsApp}</span>
              </a>

              {specialist.telegram && (
                <a
                  href={`https://t.me/${specialist.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-400 active:scale-95 transition"
                >
                  <Send className="h-4 w-4" />
                  <span>Telegram</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Overview / Reviews) */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 mr-6 ${
                activeTab === 'overview'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {locale === 'ru' ? 'О специалисте и услуги' : 'Información y servicios'}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              {t.reviewsTitle} ({specialist.reviews?.length || 0})
            </button>
          </div>

          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Detailed Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {locale === 'ru' ? 'Описание деятельности' : 'Descripción profesional'}
                </h3>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Subcategory tags */}
              {specialist.subcategories && specialist.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {specialist.subcategories.map((sub, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      #{sub}
                    </span>
                  ))}
                </div>
              )}

              {/* Services & Price Menu */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {t.servicesAndPrices}
                </h3>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {specialist.services.map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {locale === 'ru' ? srv.title_ru : srv.title_es}
                        </div>
                        {srv.duration && (
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{srv.duration}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-sky-600 dark:text-sky-400">
                          {formatCurrency(srv.price, srv.currency, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Practical Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Working hours */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <Clock className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">{t.workingHours}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{workingHours}</span>
                  </div>
                </div>

                {/* Address Line */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">{t.address}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{specialist.addressLine}</span>
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <Languages className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">{t.languages}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {specialist.languages.map((l) => (l === 'ru' ? 'Русский' : l === 'es' ? 'Español' : 'English')).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Work formats */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <Briefcase className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">{t.workFormat}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {specialist.formats
                        .map((f) => (f === 'office' ? t.officeFormat : f === 'home_visit' ? t.homeVisitFormat : t.onlineFormat))
                        .join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gallery Photos */}
              {specialist.gallery && specialist.gallery.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {locale === 'ru' ? 'Фотографии и примеры работ' : 'Galería y trabajos'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {specialist.gallery.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Portfolio"
                        className="h-32 w-full rounded-xl object-cover shadow-xs hover:opacity-95 transition"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Reviews Tab */
            <div className="space-y-6">
              {/* Existing Reviews List */}
              <div className="space-y-4">
                {specialist.reviews && specialist.reviews.length > 0 ? (
                  specialist.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {rev.authorName}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {locale === 'ru' ? rev.text_ru : rev.text_es}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    {locale === 'ru' ? 'Пока нет отзывов. Будьте первыми!' : 'Aún no hay opiniones. ¡Sé el primero!'}
                  </p>
                )}
              </div>

              {/* Add Review Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800/80">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                  {t.addReview}
                </h4>

                {reviewSuccessMsg && (
                  <div className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {t.reviewSuccess}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        {t.reviewAuthor}
                      </label>
                      <input
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder={locale === 'ru' ? 'Иван С.' : 'Juan P.'}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                        {t.reviewRating}
                      </label>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-hidden"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                star <= newReviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                      {t.reviewText}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder={locale === 'ru' ? 'Поделитесь впечатлениями о работе со специалистом...' : 'Compartí tu experiencia sobre el servicio recibido...'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-500 disabled:opacity-50 transition"
                  >
                    {t.reviewSubmit}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
