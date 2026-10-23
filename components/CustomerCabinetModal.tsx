'use client';

import React, { useState } from 'react';
import { Locale, Deal, CustomerAccount, Specialist } from '@/types';
import { translations } from '@/lib/translations';
import { getSpecialistDisplayName, formatCurrency } from '@/lib/utils';
import {
  X,
  User,
  CheckCircle2,
  Clock,
  Heart,
  MessageCircle,
  Star,
  ShieldCheck,
  ChevronRight,
  Send,
  ArrowRight,
  Briefcase,
  DollarSign,
  AlertCircle,
  Phone,
} from 'lucide-react';

interface CustomerCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  deals: Deal[];
  favorites: string[];
  specialists: Specialist[];
  currentCustomer: CustomerAccount | null;
  onUpdateCustomer: (data: Partial<CustomerAccount>) => void;
  onCompleteDeal: (dealId: string, finalSum: number, currency: 'ARS' | 'USD') => void;
  onOpenReviewForDeal: (deal: Deal) => void;
  onSelectSpecialist: (specialist: Specialist) => void;
  onToggleFavorite: (id: string) => void;
}

export const CustomerCabinetModal: React.FC<CustomerCabinetModalProps> = ({
  isOpen,
  onClose,
  locale,
  deals,
  favorites,
  specialists,
  currentCustomer,
  onUpdateCustomer,
  onCompleteDeal,
  onOpenReviewForDeal,
  onSelectSpecialist,
  onToggleFavorite,
}) => {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<'deals' | 'favorites' | 'profile'>('deals');

  // Deal completion inline modal state
  const [completingDealId, setCompletingDealId] = useState<string | null>(null);
  const [completionSum, setCompletionSum] = useState('50000');
  const [completionCurrency, setCompletionCurrency] = useState<'ARS' | 'USD'>('ARS');

  // Customer Profile edit state
  const [customerName, setCustomerName] = useState(currentCustomer?.name || 'Екатерина Смирнова');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '+54 9 11 2233-4455');
  const [customerTelegram, setCustomerTelegram] = useState(currentCustomer?.telegram || '');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  if (!isOpen) return null;

  const favoriteSpecialists = specialists.filter((s) => favorites.includes(s.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCustomer({
      name: customerName.trim(),
      phone: customerPhone.trim(),
      whatsapp: customerPhone.replace(/[^0-9]/g, ''),
      telegram: customerTelegram.trim().replace('@', ''),
    });
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 2500);
  };

  const handleConfirmCompletion = (dealId: string) => {
    const sum = parseFloat(completionSum) || 0;
    if (sum <= 0) return;
    onCompleteDeal(dealId, sum, completionCurrency);
    const deal = deals.find((d) => d.id === dealId);
    setCompletingDealId(null);
    if (deal) {
      onOpenReviewForDeal({ ...deal, status: 'completed', amount: sum, currency: completionCurrency });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-6 overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {locale === 'ru' ? 'Кабинет Заказчика' : 'Panel del Cliente'}
                </h2>
                <span className="rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 text-[10px] font-bold">
                  {locale === 'ru' ? 'Заказчик' : 'Cliente'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentCustomer?.name || (locale === 'ru' ? 'Управление сделками и избранным' : 'Gestión de tratos y favoritos')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'deals'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{locale === 'ru' ? 'Мои сделки' : 'Mis tratos'}</span>
            <span className="rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 text-[10px]">
              {deals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'favorites'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{locale === 'ru' ? 'Избранное' : 'Favoritos'}</span>
            <span className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 text-[10px]">
              {favoriteSpecialists.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{locale === 'ru' ? 'Профиль' : 'Perfil'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: МОИ СДЕЛКИ */}
          {activeTab === 'deals' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-sky-200 bg-sky-50 dark:border-sky-800/80 dark:bg-sky-950/40 p-3 flex items-start gap-2.5 text-xs text-sky-900 dark:text-sky-200">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">
                    {locale === 'ru' ? 'Контроль и гарантия Quatro Clicks' : 'Control y garantía de Quatro Clicks'}
                  </strong>
                  <p className="mt-0.5 text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
                    {locale === 'ru'
                      ? 'Все обращения к мастерам фиксируются под уникальным номером #QC. После выполнения работы подтвердите сумму сделки, чтобы оставить проверенный отзыв.'
                      : 'Cada contacto se registra con un código único #QC. Al finalizar el trabajo, confirmá el monto para publicar tu reseña verificada.'}
                  </p>
                </div>
              </div>

              {deals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {locale === 'ru'
                      ? 'У вас пока нет открытых сделок. Нажмите «WhatsApp» на карточке любого специалиста, чтобы зафиксировать сделку.'
                      : 'Aún no tenés tratos abiertos. Tocá WhatsApp en cualquier tarjeta para iniciar un trato protegido.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {deals.map((deal) => {
                    const isCompleted = deal.status === 'completed';
                    const isCompleting = completingDealId === deal.id;

                    return (
                      <div
                        key={deal.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs flex flex-col gap-3 transition hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-black text-sky-700 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950 px-2 py-0.5 rounded-md">
                                #{deal.id}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {isCompleted
                                  ? (locale === 'ru' ? '✓ Завершена' : '✓ Completado')
                                  : (locale === 'ru' ? 'В процессе' : 'En curso')}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(deal.createdAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'es-AR')}
                              </span>
                            </div>

                            <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                              {deal.serviceTitle}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {locale === 'ru' ? 'Мастер:' : 'Profesional:'} <strong className="font-bold text-slate-800 dark:text-slate-200">{deal.specialistName}</strong>
                            </p>
                          </div>

                          {deal.amount && (
                            <div className="text-right">
                              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                ${deal.amount.toLocaleString('es-AR')} {deal.currency || 'ARS'}
                              </span>
                              <span className="block text-[10px] text-emerald-600 font-semibold">
                                {locale === 'ru' ? 'Сделка оплачена' : 'Trato abonado'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Inline Completion Form */}
                        {isCompleting && (
                          <div className="rounded-xl border border-sky-300 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-950/40 p-3 flex flex-col gap-2.5">
                            <span className="text-xs font-bold text-sky-950 dark:text-sky-200">
                              {locale === 'ru' ? 'Подтверждение выполнения работы:' : 'Confirmar finalización del trabajo:'}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs font-bold text-slate-400">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={completionSum}
                                  onChange={(e) => setCompletionSum(e.target.value)}
                                  placeholder="Итоговая сумма..."
                                  className="w-full rounded-lg border border-slate-300 bg-white pl-6 pr-3 py-1.5 text-xs font-bold text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                                />
                              </div>
                              <select
                                value={completionCurrency}
                                onChange={(e) => setCompletionCurrency(e.target.value as any)}
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-700"
                              >
                                <option value="ARS">ARS</option>
                                <option value="USD">USD</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setCompletingDealId(null)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 transition"
                              >
                                {locale === 'ru' ? 'Отмена' : 'Cancelar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleConfirmCompletion(deal.id)}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1 text-xs font-bold transition shadow-xs"
                              >
                                {locale === 'ru' ? 'Подтвердить и оставить отзыв' : 'Confirmar y reseñar'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                          <a
                            href={`https://wa.me/${deal.specialistPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              locale === 'ru'
                                ? `Здравствуйте, ${deal.specialistName}! По поводу нашей сделки #${deal.id} (${deal.serviceTitle})...`
                                : `Hola ${deal.specialistName}, sobre nuestro trato #${deal.id} (${deal.serviceTitle})...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{locale === 'ru' ? 'Чат в WhatsApp' : 'Abrir WhatsApp'}</span>
                          </a>

                          <div className="flex items-center gap-2">
                            {!isCompleted ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCompletingDealId(deal.id);
                                  setCompletionSum('50000');
                                }}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{locale === 'ru' ? 'Работа выполнена' : 'Trabajo completado'}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onOpenReviewForDeal(deal)}
                                className="inline-flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 fill-white" />
                                <span>{locale === 'ru' ? 'Оставить отзыв' : 'Dejar reseña'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ИЗБРАННОЕ */}
          {activeTab === 'favorites' && (
            <div className="flex flex-col gap-3">
              {favoriteSpecialists.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                  <Heart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {locale === 'ru'
                      ? 'В избранном пока нет специалистов. Нажмите сердечко на карточке мастера, чтобы сохранить.'
                      : 'No tenés favoritos guardados. Tocá el corazón en cualquier tarjeta para guardarlo.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteSpecialists.map((spec) => (
                    <div
                      key={spec.id}
                      onClick={() => onSelectSpecialist(spec)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs hover:border-sky-400 cursor-pointer transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={spec.avatar}
                          alt={spec.name}
                          className="w-11 h-11 rounded-xl object-cover object-top border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {getSpecialistDisplayName(spec, locale)}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            ★ {spec.rating.toFixed(1)} • {spec.barrio}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(spec.id);
                        }}
                        className="p-1.5 text-rose-500 hover:text-slate-400 transition"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ПРОФИЛЬ ЗАКАЗЧИКА */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {locale === 'ru' ? 'Ваше имя' : 'Tu nombre'} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Екатерина Смирнова"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {locale === 'ru' ? 'Телефон / WhatsApp для связи' : 'Teléfono / WhatsApp'} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+54 9 11 2233-4455"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram username
                </label>
                <input
                  type="text"
                  value={customerTelegram}
                  onChange={(e) => setCustomerTelegram(e.target.value)}
                  placeholder="ekaterina_caba"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {profileSavedToast && (
                <div className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 text-xs font-semibold text-center">
                  {locale === 'ru' ? '✓ Профиль успешно сохранён' : '✓ Perfil guardado con éxito'}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span>{locale === 'ru' ? 'Сохранить профиль' : 'Guardar perfil'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
