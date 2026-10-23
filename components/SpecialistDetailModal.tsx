'use client';

import React, { useState } from 'react';
import { Specialist, Locale, Review } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { buildWhatsAppUrl, getSpecialistDisplayName, getSpecialistCompanyName } from '@/lib/utils';
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
  Phone,
  Globe,
  Instagram,
  Facebook,
  Mail,
  ShieldCheck,
  Check,
  HardHat,
  Sparkles,
  Truck,
  ArrowLeftRight,
  Scale,
  GraduationCap,
  Compass,
  Tv,
  Car,
  Building,
  Laptop,
  ShoppingBag,
} from 'lucide-react';

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

interface SpecialistDetailModalProps {
  specialist: Specialist | null;
  locale: Locale;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onAddReview: (specialistId: string, review: Omit<Review, 'id' | 'date'>) => void;
  initialTab?: 'overview' | 'reviews';
  dealId?: string | null;
  initialPhoto?: string | null;
  onClearPhoto?: () => void;
  onFocusMap?: (specialist: Specialist) => void;
}

export const SpecialistDetailModal: React.FC<SpecialistDetailModalProps> = ({
  specialist,
  locale,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddReview,
  initialTab = 'overview',
  dealId = null,
  initialPhoto = null,
  onClearPhoto,
  onFocusMap,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>(initialTab);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(initialPhoto || null);

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (initialPhoto) setSelectedPhoto(initialPhoto);
  }, [initialPhoto]);

  // Close modal or photo lightbox on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
          onClearPhoto?.();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedPhoto, onClearPhoto]);

  if (!specialist) return null;

  const t = translations[locale];
  const category = CATEGORIES.find((c) => c.id === specialist.category);
  const displayName = getSpecialistDisplayName(specialist, locale);
  const displayCompanyName = getSpecialistCompanyName(specialist, locale);
  const waUrl = buildWhatsAppUrl(specialist.whatsapp, displayName, locale);

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
      status: dealId ? 'approved' : 'pending',
      dealId: dealId || undefined,
      verifiedDeal: Boolean(dealId),
    });

    setNewReviewAuthor('');
    setNewReviewText('');
    setNewReviewRating(5);
    setIsSubmittingReview(false);
    setReviewSuccessMsg(true);
    setTimeout(() => setReviewSuccessMsg(false), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Fixed Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-900 text-white shadow-lg backdrop-blur-md cursor-pointer transition hover:scale-105 active:scale-95"
          aria-label={t.modalClose}
          title={t.modalClose}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Profile Card Header (Elegant Category Brand Backdrop without random stock photos) */}
        <div className="relative min-h-[180px] sm:min-h-[200px] w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 p-5 sm:p-6 flex flex-col justify-end">
          {/* Subtle Ambient Category Color Aura */}
          <div
            className="absolute -right-12 -top-12 h-64 w-64 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: `${category?.color || '#0284c7'}30` }}
          />
          <div
            className="absolute left-1/4 -bottom-16 h-48 w-48 rounded-full blur-2xl pointer-events-none"
            style={{ backgroundColor: `${category?.color || '#0284c7'}18` }}
          />

          {/* Micro Geometric Dot Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Large Subtle Category Icon Watermark */}
          <div className="absolute right-3 -bottom-4 pointer-events-none opacity-[0.06] text-white -rotate-12 select-none">
            {getCategoryIcon(category?.iconName || '', 'w-40 h-40 sm:w-48 sm:h-48')}
          </div>

          {/* Top Actions: Favorite, Share */}
          <div className="absolute top-4 right-14 flex items-center gap-2 z-10">
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 backdrop-blur-md cursor-pointer transition active:scale-95"
              title={t.share}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleFavorite(specialist.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 backdrop-blur-md cursor-pointer transition active:scale-95"
              title={t.favoritesOnly}
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>
          </div>

          {/* Toast Notification */}
          {copiedToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-full bg-slate-900/95 border border-slate-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md">
              {t.copiedLink}
            </div>
          )}

          {/* Avatar and Details in Header */}
          <div className="relative z-10 flex items-start sm:items-end gap-3.5 sm:gap-4.5 pt-8 sm:pt-4">
            {/* Avatar with Verified Badge */}
            <div
              className="relative shrink-0 h-20 w-20 sm:h-24 sm:w-24 cursor-pointer"
              onClick={() => setSelectedPhoto(specialist.avatar)}
              title={locale === 'ru' ? 'Нажмите для просмотра фото' : 'Tocá para ver foto'}
            >
              <img
                src={specialist.avatar}
                alt={displayName}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-white/90 object-cover object-top shadow-2xl ring-2 ring-slate-800"
              />
              {specialist.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-slate-900 shadow-md"
                  title={t.verifiedDniBadge || t.verifiedBadge}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-white">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                {/* Contractor ID Code Badge */}
                {specialist.contractorId && (
                  <span className="rounded-md bg-amber-400 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-black text-slate-950 shadow-xs">
                    ID {specialist.contractorId}
                  </span>
                )}
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: category?.pinBg || '#0284c7' }}
                >
                  {locale === 'ru' ? category?.title_ru : category?.title_es}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {specialist.experienceYears} {t.yearsInArg}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{displayName}</span>
                {displayCompanyName && (
                  <span className="text-sm sm:text-base font-semibold text-sky-300 hidden sm:inline-flex items-center gap-1">
                    • {displayCompanyName}
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-0.5 font-medium leading-snug">
                {title}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Metrics Bar & Primary CTA */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
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

              {specialist.phone && (
                <a
                  href={`tel:${specialist.phone}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                  title={t.phoneDirect}
                >
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span className="hidden sm:inline">{specialist.phone}</span>
                </a>
              )}

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

          {/* Response time & Communication parameters strip */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {specialist.responseTime && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span>{locale === 'ru' ? `Отвечаю в течение: ${specialist.responseTime}` : `Responde en: ${specialist.responseTime}`}</span>
              </span>
            )}
            {specialist.workingHoursComm && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200/80 px-3 py-1 font-semibold text-sky-800 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300">
                <span>{locale === 'ru' ? `Часы для связи: ${specialist.workingHoursComm}` : `Horario de contacto: ${specialist.workingHoursComm}`}</span>
              </span>
            )}
            {specialist.preferredContactMethod && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-1 font-semibold text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200">
                <span>{locale === 'ru' ? `Связь: ${specialist.preferredContactMethod.toUpperCase()}` : `Canal: ${specialist.preferredContactMethod.toUpperCase()}`}</span>
              </span>
            )}
            {specialist.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200/80 px-3 py-1 font-semibold text-purple-800 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                <span>{t.verifiedDniBadge}</span>
              </span>
            )}
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
              {locale === 'ru' ? 'О мастере и услуги' : 'Información y servicios'}
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {locale === 'ru' ? 'Описание деятельности' : 'Descripción profesional'}
                </h3>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Contractor Advantages */}
              {specialist.advantages && specialist.advantages.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    {t.advantagesLabel}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specialist.advantages.map((adv, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 border border-sky-200/80 px-3 py-1.5 text-xs font-semibold text-sky-800 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-200 shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                        <span>{adv}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Performed Works & Services (Strictly NO PRICES) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  {locale === 'ru' ? 'Выполняемые работы и услуги' : 'Trabajos y servicios realizados'}
                </h3>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  {specialist.services.map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-center p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {locale === 'ru' ? srv.title_ru : srv.title_es}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Working hours */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <Clock className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-400">{t.workingHours}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{workingHours}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-start gap-3 min-w-0">
                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-400">{t.address}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 block truncate sm:whitespace-normal">
                        {specialist.addressLine}
                      </span>
                    </div>
                  </div>
                  {onFocusMap && (
                    <button
                      type="button"
                      onClick={() => onFocusMap(specialist)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-slate-600 shadow-2xs transition cursor-pointer shrink-0"
                      title={locale === 'ru' ? 'Показать мастера на карте' : 'Ver especialista en el mapa'}
                    >
                      <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{locale === 'ru' ? 'На карте' : 'En el mapa'}</span>
                    </button>
                  )}
                </div>

                {/* Languages with Granular Levels */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 sm:col-span-2">
                  <Languages className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="w-full">
                    <span className="block text-xs font-semibold text-slate-400 mb-1.5">{t.languages}</span>
                    {specialist.granularLanguages ? (
                      <div className="flex flex-wrap gap-2 text-xs font-medium">
                        {specialist.granularLanguages.russian && (
                          <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                            🇷🇺 {t.langRussian}
                          </span>
                        )}
                        {specialist.granularLanguages.spanish && (
                          <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                            🇦🇷 {t.langSpanish} ({specialist.granularLanguages.spanish === 'fluent' ? t.levelFluent : specialist.granularLanguages.spanish === 'good' ? t.levelGood : t.levelWithTranslator})
                          </span>
                        )}
                        {specialist.granularLanguages.english && (
                          <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                            🇬🇧 {t.langEnglish} ({specialist.granularLanguages.english === 'fluent' ? t.levelFluent : specialist.granularLanguages.english === 'good' ? t.levelGood : t.levelWithTranslator})
                          </span>
                        )}
                        {specialist.granularLanguages.portuguese && (
                          <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                            🇧🇷 {t.langPortuguese}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {specialist.languages.map((l) => (l === 'ru' ? 'Русский' : l === 'es' ? 'Español' : 'English')).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Work formats */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 sm:col-span-2">
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

              {/* Direct Channels & Social Networks */}
              {(specialist.website || specialist.instagram || specialist.facebook || specialist.email) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    {t.socialNetworks}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specialist.website && (
                      <a
                        href={specialist.website.startsWith('http') ? specialist.website : `https://${specialist.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                      >
                        <Globe className="h-3.5 w-3.5 text-sky-600" />
                        <span>{specialist.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {specialist.instagram && (
                      <a
                        href={`https://instagram.com/${specialist.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                      >
                        <Instagram className="h-3.5 w-3.5 text-pink-600" />
                        <span>@{specialist.instagram.replace('@', '')}</span>
                      </a>
                    )}
                    {specialist.facebook && (
                      <a
                        href={specialist.facebook.startsWith('http') ? specialist.facebook : `https://facebook.com/${specialist.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                      >
                        <Facebook className="h-3.5 w-3.5 text-blue-600" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {specialist.email && (
                      <a
                        href={`mailto:${specialist.email}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                      >
                        <Mail className="h-3.5 w-3.5 text-amber-600" />
                        <span>{specialist.email}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio / Gallery Photos */}
              {specialist.gallery && specialist.gallery.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    {t.portfolioTitle}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {specialist.gallery.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Portfolio"
                        className="h-36 w-full rounded-2xl object-cover shadow-xs hover:opacity-95 transition cursor-pointer hover:scale-102"
                        onClick={() => setSelectedPhoto(img)}
                        title={locale === 'ru' ? 'Нажмите для просмотра фото' : 'Tocá para ver foto'}
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
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {rev.authorName}
                          </span>
                          {rev.verifiedDeal && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{t.verifiedDealBadge}</span>
                            </span>
                          )}
                        </div>
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

                {dealId && (
                  <div className="mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 p-3.5 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200 flex items-start gap-2.5 shadow-2xs">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-sm">
                        {locale === 'ru' ? `Отзыв о подтвержденной сделке #${dealId}` : `Opinión de operación verificada #${dealId}`}
                      </span>
                      <span className="text-[11px] opacity-90 mt-0.5 block leading-relaxed">
                        {locale === 'ru'
                          ? 'Вы оставляете отзыв после выполнения сделки. Ваш отзыв получит значок «Подтвержденная сделка»!'
                          : 'Estás dejando una opinión tras concretar el servicio. ¡Tu opinión se destacará con el sello «Operación verificada»!'}
                      </span>
                    </div>
                  </div>
                )}

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

      {/* Fullscreen Uncropped Lightbox Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPhoto(null);
            onClearPhoto?.();
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(null);
              onClearPhoto?.();
            }}
            className="absolute top-4 right-4 z-[10002] flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white shadow-2xl backdrop-blur-md cursor-pointer transition hover:scale-105 active:scale-95"
            aria-label={t.modalClose}
            title={t.modalClose}
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-[92vw] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto}
              alt="Uncropped work preview"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
            <p className="mt-2.5 text-xs font-semibold text-slate-300 text-center">
              {locale === 'ru' ? 'Нажмите в любом месте или Esc чтобы закрыть' : 'Tocá en cualquier lugar o Esc para cerrar'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
