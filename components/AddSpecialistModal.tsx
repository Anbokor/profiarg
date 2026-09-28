'use client';

import React, { useState } from 'react';
import { Specialist, Locale, CategoryId, WorkFormat, Currency } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { generateSlug } from '@/lib/utils';
import {
  X,
  PlusCircle,
} from 'lucide-react';

interface AddSpecialistModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  onSave: (specialist: Specialist) => void;
}

export const AddSpecialistModal: React.FC<AddSpecialistModalProps> = ({
  isOpen,
  locale,
  onClose,
  onSave,
}) => {
  const t = translations[locale];

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('immigration');
  const [barrio, setBarrio] = useState(BARRIOS[0].name);
  const [addressLine, setAddressLine] = useState('');
  const [whatsapp, setWhatsapp] = useState('+54 9 11 ');
  const [telegram, setTelegram] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [titleEs, setTitleEs] = useState('');
  const [descriptionRu, setDescriptionRu] = useState('');
  const [descriptionEs, setDescriptionEs] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [servicePrice, setServicePrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [format, setFormat] = useState<WorkFormat[]>(['office']);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;

    const selectedBarrioObj = BARRIOS.find((b) => b.name === barrio) || BARRIOS[0];

    // Add slight random coordinate offset (0.003) so multiple listings in same barrio don't stack exactly on top of each other
    const randomOffsetLat = (Math.random() - 0.5) * 0.008;
    const randomOffsetLng = (Math.random() - 0.5) * 0.008;

    const newSpecialist: Specialist = {
      id: `custom-${Date.now()}`,
      slug: generateSlug(name) + '-' + Date.now().toString().slice(-4),
      name: name.trim(),
      isCompany: false,
      title_ru: titleRu.trim() || (locale === 'ru' ? 'Частный специалист' : 'Profesional independiente'),
      title_es: titleEs.trim() || (locale === 'es' ? titleRu : 'Profesional independiente'),
      category,
      subcategories: [category],
      avatar:
        avatarUrl.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviewsCount: 1,
      experienceYears: 1,
      isVerified: false,
      languages: ['ru', 'es'],
      barrio: selectedBarrioObj.name,
      addressLine: addressLine.trim() || `${selectedBarrioObj.name}, Buenos Aires`,
      coordinates: {
        lat: selectedBarrioObj.coordinates.lat + randomOffsetLat,
        lng: selectedBarrioObj.coordinates.lng + randomOffsetLng,
      },
      formats: format,
      whatsapp: whatsapp.trim(),
      telegram: telegram.trim() || undefined,
      description_ru: descriptionRu.trim() || 'Информация обновляется специалистом.',
      description_es: descriptionEs.trim() || descriptionRu.trim() || 'Servicios profesionales en Buenos Aires.',
      services: serviceTitle.trim()
        ? [
            {
              id: `srv-${Date.now()}`,
              title_ru: serviceTitle.trim(),
              title_es: serviceTitle.trim(),
              price: typeof servicePrice === 'number' ? servicePrice : null,
              currency,
            },
          ]
        : [
            {
              id: `srv-default`,
              title_ru: 'Консультация',
              title_es: 'Consulta inicial',
              price: null,
              currency: 'a_convenir',
            },
          ],
      gallery: [],
      workingHours_ru: 'Пн-Пт: 10:00 – 19:00',
      workingHours_es: 'Lun-Vie: 10:00 a 19:00',
      reviews: [
        {
          id: `rev-initial`,
          authorName: locale === 'ru' ? 'Модерация ProfiARG' : 'Moderación ProfiARG',
          rating: 5,
          date: new Date().toLocaleDateString(),
          text_ru: 'Анкета успешно опубликована и проверена сервисом.',
          text_es: 'Perfil publicado exitosamente en la plataforma.',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    onSave(newSpecialist);
    onClose();
  };

  const handleToggleFormat = (fmt: WorkFormat) => {
    if (format.includes(fmt)) {
      if (format.length > 1) setFormat(format.filter((f) => f !== fmt));
    } else {
      setFormat([...format, fmt]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.addBusinessTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.addBusinessSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formName} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === 'ru' ? 'Мария Иванова / Nails BA' : 'María Gómez / Nails BA'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {locale === 'ru' ? cat.title_ru : cat.title_es}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Barrio & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formBarrio} *
              </label>
              <select
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {BARRIOS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formAddress}
              </label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Av. Santa Fe 2400"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* WhatsApp & Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formPhone} *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+54 9 11 1234 5678"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formTelegram}
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="username_tg"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Short Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.formTitle}
            </label>
            <input
              type="text"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
              placeholder={locale === 'ru' ? 'Мастер маникюра и педикюра' : 'Especialista en manicuría'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Work Formats */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.workFormat}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleToggleFormat('office')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  format.includes('office')
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.officeFormat}
              </button>
              <button
                type="button"
                onClick={() => handleToggleFormat('home_visit')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  format.includes('home_visit')
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.homeVisitFormat}
              </button>
              <button
                type="button"
                onClick={() => handleToggleFormat('online')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  format.includes('online')
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.onlineFormat}
              </button>
            </div>
          </div>

          {/* Service & Price */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              {locale === 'ru' ? 'Основная услуга и стоимость' : 'Servicio principal y tarifa'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder={locale === 'ru' ? 'Например: Маникюр с покрытием' : 'Ej: Manicuría con esmaltado'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="30000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                  <option value="a_convenir">Cons.</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.formDesc}
            </label>
            <textarea
              rows={3}
              value={descriptionRu}
              onChange={(e) => setDescriptionRu(e.target.value)}
              placeholder={locale === 'ru' ? 'Опишите ваш опыт, материалы, гарантии и как с вами связаться...' : 'Describí tus servicios, experiencia y forma de contacto...'}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t.formPhotoUrl}
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Bottom Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t.formCancel}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 active:scale-95 transition"
            >
              {t.formSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
