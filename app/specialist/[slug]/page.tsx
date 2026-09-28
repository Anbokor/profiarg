'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Specialist, Locale, Review } from '@/types';
import { SEED_SPECIALISTS } from '@/data/seedData';
import {
  getStoredSpecialists,
  getStoredLocale,
  setStoredLocale,
  getFavorites,
  toggleFavorite,
  addReviewToSpecialist,
} from '@/lib/storage';
import { CATEGORIES } from '@/data/categories';
import { formatCurrency, buildWhatsAppUrl } from '@/lib/utils';
import { translations } from '@/lib/translations';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  MapPin,
  Clock,
  Languages,
  Briefcase,
  MessageCircle,
  Send,
  Heart,
  Share2,
  Calendar,
  Frown,
} from 'lucide-react';

export default function SpecialistPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = (params?.slug as string) || '';

  const [locale, setLocaleState] = useState<Locale>('ru');
  const [specialist, setSpecialist] = useState<Specialist | null>(() => {
    if (!rawSlug) return null;
    const decoded = decodeURIComponent(rawSlug);
    return SEED_SPECIALISTS.find((s) => s.slug === rawSlug || s.slug === decoded) || null;
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedToast, setCopiedToast] = useState(false);

  // Review form state
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const savedLocale = getStoredLocale();
    if (savedLocale) setLocaleState(savedLocale);

    const all = getStoredSpecialists();
    const decoded = rawSlug ? decodeURIComponent(rawSlug) : '';
    const found = all.find((s) => s.slug === rawSlug || s.slug === decoded) || null;
    setSpecialist(found);
    setFavorites(getFavorites());
    setIsLoaded(true);
  }, [rawSlug]);

  const handleSetLocale = (newLoc: Locale) => {
    setLocaleState(newLoc);
    setStoredLocale(newLoc);
  };

  const handleToggleFav = () => {
    if (!specialist) return;
    const updated = toggleFavorite(specialist.id);
    setFavorites(updated);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialist || !newAuthor.trim() || !newText.trim()) return;

    const savedReview = addReviewToSpecialist(specialist.id, {
      authorName: newAuthor.trim(),
      rating: newRating,
      text_ru: newText.trim(),
      text_es: newText.trim(),
    });

    const updatedReviews = [savedReview, ...(specialist.reviews || [])];
    const newRatingAvg =
      updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

    setSpecialist({
      ...specialist,
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: Math.round(newRatingAvg * 10) / 10,
    });

    setNewAuthor('');
    setNewText('');
    setNewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Loading skeleton while checking storage
  if (!isLoaded && !specialist) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-md w-full">
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
        </div>
      </div>
    );
  }

  // Not found state
  if (isLoaded && !specialist) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Frown className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">
            {locale === 'ru' ? 'Анкета специалиста не найдена' : 'Perfil de especialista no encontrado'}
          </h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {locale === 'ru'
              ? 'Возможно, ссылка устарела или анкета была перемещена.'
              : 'El enlace puede haber caducado o el perfil fue modificado.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{locale === 'ru' ? 'Вернуться на главную' : 'Volver al catálogo'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (!specialist) return null;

  const t = translations[locale];
  const category = CATEGORIES.find((c) => c.id === specialist.category);
  const waUrl = buildWhatsAppUrl(specialist.whatsapp, specialist.name, locale);
  const title = locale === 'ru' ? specialist.title_ru : specialist.title_es;
  const description = locale === 'ru' ? specialist.description_ru : specialist.description_es;
  const workingHours = locale === 'ru' ? specialist.workingHours_ru : specialist.workingHours_es;
  const isFav = favorites.includes(specialist.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{locale === 'ru' ? 'В каталог ProfiARG' : 'Volver al catálogo'}</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Toggle Favorite */}
            <button
              onClick={handleToggleFav}
              className={`rounded-lg p-2 border transition ${
                isFav
                  ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
              }`}
              title={t.favoritesOnly}
            >
              <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 transition"
              title={t.share}
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={() => handleSetLocale('ru')}
                className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                  locale === 'ru'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🇷🇺 RU
              </button>
              <button
                onClick={() => handleSetLocale('es')}
                className={`rounded-md px-2 py-1 text-xs font-bold transition ${
                  locale === 'es'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                🇦🇷 ES
              </button>
            </div>
          </div>
        </div>
      </header>

      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
          {t.copiedLink}
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 space-y-6">
        {/* Profile Card Header */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={specialist.coverImage || specialist.avatar}
              alt={specialist.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4 text-white">
              <div className="relative shrink-0">
                <img
                  src={specialist.avatar}
                  alt={specialist.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-white object-cover shadow-2xl dark:border-slate-800"
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
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="rounded-md px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: category?.pinBg || '#0284c7' }}
                  >
                    {locale === 'ru' ? category?.title_ru : category?.title_es}
                  </span>
                  <span className="text-xs text-slate-200">
                    {specialist.experienceYears} {t.yearsInArg}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight truncate">
                  {specialist.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-1">{title}</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Quick Metrics Bar & Primary CTA */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 font-bold text-amber-500">
                  <Star className="h-5 w-5 fill-amber-400" />
                  <span className="text-base text-slate-900 dark:text-white">
                    {specialist.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-400 font-normal">
                    ({specialist.reviewsCount} {locale === 'ru' ? 'отзывов' : 'opiniones'})
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-sky-500" />
                  <span className="font-semibold">{specialist.barrio}</span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t.contactWhatsApp}</span>
                </a>
                {specialist.telegram && (
                  <a
                    href={`https://t.me/${specialist.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-sky-400 active:scale-95 transition"
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
                {/* Description */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {locale === 'ru' ? 'Описание деятельности' : 'Descripción profesional'}
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {description}
                  </p>
                </div>

                {/* Subcategories tags */}
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

                {/* Services & Prices */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {t.servicesAndPrices}
                  </h2>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                    {specialist.services.map((srv) => (
                      <div key={srv.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <div>
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {locale === 'ru' ? srv.title_ru : srv.title_es}
                          </div>
                          {srv.duration && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{srv.duration}</span>
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-sky-600 dark:text-sky-400">
                          {formatCurrency(srv.price, srv.currency, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <Clock className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">{t.workingHours}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{workingHours}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">{t.address}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{specialist.addressLine}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                    <Languages className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-slate-400">{t.languages}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {specialist.languages.map((l) => (l === 'ru' ? 'Русский' : l === 'es' ? 'Español' : 'English')).join(', ')}
                      </span>
                    </div>
                  </div>

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

                {/* Gallery */}
                {specialist.gallery && specialist.gallery.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      {locale === 'ru' ? 'Фотографии и примеры работ' : 'Galería y trabajos'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {specialist.gallery.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Portfolio"
                          className="h-36 w-full rounded-2xl object-cover shadow-xs hover:opacity-95 transition"
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
                <div className="space-y-3.5">
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
                    <p className="text-xs text-slate-400 text-center py-6">
                      {locale === 'ru' ? 'Пока нет отзывов. Будьте первыми!' : 'Aún no hay opiniones. ¡Sé el primero!'}
                    </p>
                  )}
                </div>

                {/* Add Review Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-800/80">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    {t.addReview}
                  </h3>

                  {reviewSuccess && (
                    <div className="mb-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      {t.reviewSuccess}
                    </div>
                  )}

                  <form onSubmit={handleAddReview} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                          {t.reviewAuthor}
                        </label>
                        <input
                          type="text"
                          required
                          value={newAuthor}
                          onChange={(e) => setNewAuthor(e.target.value)}
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
                              onClick={() => setNewRating(star)}
                              className="p-1 text-slate-300 hover:text-amber-400 focus:outline-hidden"
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  star <= newRating
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
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder={locale === 'ru' ? 'Поделитесь впечатлениями о работе со специалистом...' : 'Compartí tu experiencia sobre el servicio recibido...'}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-500 transition"
                    >
                      {t.reviewSubmit}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
