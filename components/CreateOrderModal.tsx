'use client';

import React, { useState } from 'react';
import { Locale, CategoryId, Currency, Order } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { translations } from '@/lib/translations';
import { saveCustomOrder } from '@/lib/storage';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Send,
  MessageSquare,
  Phone,
} from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  onOrderCreated: (order: Order) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  locale,
  onOrderCreated,
}) => {
  const t = translations[locale];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('repair_construction');
  const [barrio, setBarrio] = useState<string>('Recoleta');
  const [description, setDescription] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [contactName, setContactName] = useState('');
  const [contactMethod, setContactMethod] = useState<'whatsapp' | 'telegram' | 'phone'>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg(locale === 'ru' ? 'Укажите название задачи' : 'Por favor ingresá un título para tu pedido');
      return;
    }
    if (!description.trim()) {
      setErrorMsg(locale === 'ru' ? 'Опишите подробно, что требуется' : 'Por favor describí lo que necesitás');
      return;
    }
    if (!contactName.trim()) {
      setErrorMsg(locale === 'ru' ? 'Укажите ваше имя' : 'Por favor ingresá tu nombre');
      return;
    }
    if (!contactValue.trim()) {
      setErrorMsg(locale === 'ru' ? 'Укажите контакт для связи' : 'Por favor ingresá tu contacto');
      return;
    }

    let parsedBudget: number | null = null;
    let finalCurrency: Currency = 'a_convenir';

    if (!isNegotiable) {
      const num = parseFloat(budgetAmount);
      if (isNaN(num) || num <= 0) {
        setErrorMsg(
          locale === 'ru'
            ? 'Укажите корректный бюджет или выберите «По договорённости»'
            : 'Ingresá un presupuesto válido o seleccioná «A convenir»'
        );
        return;
      }
      parsedBudget = num;
      finalCurrency = currency;
    }

    setIsSubmitting(true);

    try {
      const created = saveCustomOrder({
        title: title.trim(),
        category,
        barrio,
        description: description.trim(),
        budget: parsedBudget,
        currency: finalCurrency,
        contactName: contactName.trim(),
        contactMethod,
        contactValue: contactValue.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        onOrderCreated(created);
        setIsSubmitting(false);
        setSuccess(false);
        // Reset form
        setTitle('');
        setDescription('');
        setBudgetAmount('');
        setIsNegotiable(false);
        setContactName('');
        setContactValue('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg(locale === 'ru' ? 'Ошибка при создании заявки' : 'Error al publicar el pedido');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4.5 dark:border-slate-800 bg-gradient-to-r from-sky-50/60 to-white dark:from-slate-900 dark:to-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
                <FileSpreadsheet className="h-4 w-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {t.createOrderTitle}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {t.createOrderSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
            aria-label={t.modalClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>


        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center text-sm font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>{t.orderSuccessMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {t.orderTitleLabel} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.orderTitlePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Category & Barrio Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t.orderCategoryLabel} <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {locale === 'ru' ? cat.title_ru : cat.title_es}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t.orderBarrioLabel} <span className="text-rose-500">*</span>
              </label>
              <select
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Онлайн / Любой район">{t.orderBarrioRemote}</option>
                {BARRIOS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {t.orderDescLabel} <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.orderDescPlaceholder}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Budget & Currency */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {t.orderBudgetLabel}
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>{t.budgetNegotiable}</span>
              </label>
            </div>

            {!isNegotiable && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder={t.orderBudgetPlaceholder}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="flex rounded-xl border border-slate-300 p-0.5 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrency('ARS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      currency === 'ARS'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ARS ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      currency === 'USD'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    USD (US$)
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {locale === 'ru' ? 'Контакты для связи' : 'Datos de contacto directo'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.orderContactNameLabel} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={locale === 'ru' ? 'Ваше имя' : 'Tu nombre'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.orderContactMethodLabel}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setContactMethod('whatsapp')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border ${
                      contactMethod === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('telegram')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border ${
                      contactMethod === 'telegram'
                        ? 'border-sky-600 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Telegram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('phone')}
                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border ${
                      contactMethod === 'phone'
                        ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{t.contactMethodPhone}</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.orderContactValueLabel} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactMethod === 'whatsapp'
                    ? '+54 9 11 1234-5678'
                    : contactMethod === 'telegram'
                    ? '@username'
                    : '+54 9 11 ...'
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              {t.formCancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isSubmitting ? '...' : t.orderSubmitBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
