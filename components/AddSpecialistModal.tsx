'use client';

import React, { useState } from 'react';
import { Specialist, Locale, CategoryId, WorkFormat, SpanishLevel, EnglishLevel } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { generateSlug } from '@/lib/utils';
import {
  X,
  PlusCircle,
  Lock,
  Clock,
  Sparkles,
  Phone,
  Globe,
  Camera,
  Briefcase,
  Check,
} from 'lucide-react';

interface AddSpecialistModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  onSave: (specialist: Specialist) => void;
}

const COMMON_WORKS_RU = [
  'Замер и консультация',
  'Монтаж окон и дверей',
  'Регулировка и ремонт фурнитуры',
  'Замена стеклопакетов',
  'Установка откосов и подоконников',
  'Москитные сетки',
  'Герметизация швов',
  'Остекление балконов',
];

const COMMON_WORKS_ES = [
  'Medición y asesoramiento',
  'Instalación de aberturas',
  'Ajuste y reparación de herrajes',
  'Cambio de termopaneles (DVH)',
  'Colocación de contramarquillos',
  'Mosquiteros a medida',
  'Sellado térmico y acústico',
  'Cerramientos de balcones',
];

export const AddSpecialistModal: React.FC<AddSpecialistModalProps> = ({
  isOpen,
  locale,
  onClose,
  onSave,
}) => {
  const t = translations[locale];

  // Basic Information
  const [contractorId, setContractorId] = useState(() => `0${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [category, setCategory] = useState<CategoryId>('repair_construction');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([
    'Окна',
    'Двери входные',
    'Двери межкомнатные',
  ]);
  const [titleRu, setTitleRu] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Private verification (not public)
  const [privateDni, setPrivateDni] = useState('');
  const [privateDniPhoto, setPrivateDniPhoto] = useState('');

  // Description & Performed Works (Выполняемые работы)
  const [descriptionRu, setDescriptionRu] = useState('');
  const [selectedWorks, setSelectedWorks] = useState<string[]>([
    locale === 'ru' ? 'Замер и консультация' : 'Medición y asesoramiento',
    locale === 'ru' ? 'Монтаж окон и дверей' : 'Instalación de aberturas',
  ]);
  const [customWork, setCustomWork] = useState('');

  // Contacts
  const [barrio, setBarrio] = useState(BARRIOS[0].name);
  const [addressLine, setAddressLine] = useState('');
  const [phone, setPhone] = useState('+54 9 11 ');
  const [whatsapp, setWhatsapp] = useState('+54 9 11 ');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Communication & Working hours
  const [responseTime, setResponseTime] = useState('1 час');
  const [workingHoursComm, setWorkingHoursComm] = useState('8-17');
  const [preferredMethod, setPreferredMethod] = useState<'whatsapp' | 'telegram' | 'phone'>('whatsapp');

  // Granular Language Skills
  const [langRu, setLangRu] = useState(true);
  const [langEsLevel, setLangEsLevel] = useState<SpanishLevel | 'none'>('good');
  const [langEnLevel, setLangEnLevel] = useState<EnglishLevel | 'none'>('good');
  const [langPt, setLangPt] = useState(false);

  // Work format & Portfolio
  const [format, setFormat] = useState<WorkFormat[]>(['office', 'home_visit']);
  const [portfolioUrls, setPortfolioUrls] = useState('');

  // Close modal on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleWork = (work: string) => {
    if (selectedWorks.includes(work)) {
      setSelectedWorks(selectedWorks.filter((w) => w !== work));
    } else {
      setSelectedWorks([...selectedWorks, work]);
    }
  };

  const handleAddCustomWork = () => {
    if (!customWork.trim()) return;
    if (!selectedWorks.includes(customWork.trim())) {
      setSelectedWorks([...selectedWorks, customWork.trim()]);
    }
    setCustomWork('');
  };

  const selectedAdvantages = selectedWorks;
  const handleToggleAdvantage = handleToggleWork;

  const handleToggleSubcategory = (sub: string) => {
    if (selectedSubcategories.includes(sub)) {
      if (selectedSubcategories.length > 1) {
        setSelectedSubcategories(selectedSubcategories.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
    }
  };

  const handleCategoryChange = (newCat: CategoryId) => {
    setCategory(newCat);
    const catObj = CATEGORIES.find((c) => c.id === newCat);
    if (catObj && catObj.subcategories.length > 0) {
      setSelectedSubcategories(catObj.subcategories.slice(0, 3));
    } else {
      setSelectedSubcategories([newCat]);
    }
  };

  const handleToggleFormat = (fmt: WorkFormat) => {
    if (format.includes(fmt)) {
      if (format.length > 1) setFormat(format.filter((f) => f !== fmt));
    } else {
      setFormat([...format, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) return;

    const selectedBarrioObj = BARRIOS.find((b) => b.name === barrio) || BARRIOS[0];
    const randomOffsetLat = (Math.random() - 0.5) * 0.008;
    const randomOffsetLng = (Math.random() - 0.5) * 0.008;

    // Granular languages calculation
    const languagesArray: ('ru' | 'es' | 'en')[] = [];
    if (langRu) languagesArray.push('ru');
    if (langEsLevel !== 'none') languagesArray.push('es');
    if (langEnLevel !== 'none') languagesArray.push('en');

    // Portfolio photos parser
    const galleryItems = portfolioUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http'));

    const newSpecialist: Specialist = {
      id: `custom-${Date.now()}`,
      contractorId: contractorId.trim() || `0${Math.floor(100 + Math.random() * 900)}`,
      slug: generateSlug(name) + '-' + Date.now().toString().slice(-4),
      name: name.trim(),
      isCompany,
      companyName: isCompany ? (companyName.trim() || name.trim()) : undefined,
      title_ru: titleRu.trim() || (locale === 'ru' ? 'Частный специалист' : 'Profesional independiente'),
      title_es: titleRu.trim() || 'Profesional independiente',
      category,
      subcategories: selectedSubcategories.length > 0 ? selectedSubcategories : [category],
      avatar:
        avatarUrl.trim() ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImage:
        galleryItems[0] ||
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviewsCount: 1,
      experienceYears: 2,
      isVerified: Boolean(privateDni.trim() || privateDniPhoto.trim()),
      languages: languagesArray.length > 0 ? languagesArray : ['ru', 'es'],
      granularLanguages: {
        russian: langRu,
        spanish: langEsLevel !== 'none' ? langEsLevel : undefined,
        english: langEnLevel !== 'none' ? langEnLevel : undefined,
        portuguese: langPt,
      },
      advantages: selectedAdvantages,
      responseTime: responseTime.trim() || '1 час',
      workingHoursComm: workingHoursComm.trim() || '8-17',
      preferredContactMethod: preferredMethod,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim(),
      telegram: telegram.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      instagram: instagram.trim() || undefined,
      facebook: facebook.trim() || undefined,
      privateDocumentNumber: privateDni.trim() || undefined,
      privateDocumentPhoto: privateDniPhoto.trim() || undefined,
      barrio: selectedBarrioObj.name,
      addressLine: addressLine.trim() || `${selectedBarrioObj.name}, Buenos Aires`,
      coordinates: {
        lat: selectedBarrioObj.coordinates.lat + randomOffsetLat,
        lng: selectedBarrioObj.coordinates.lng + randomOffsetLng,
      },
      formats: format,
      description_ru: descriptionRu.trim() || 'Информация обновляется специалистом.',
      description_es: descriptionRu.trim() || 'Servicios profesionales en Buenos Aires.',
      services: selectedWorks.length > 0
        ? selectedWorks.map((work, idx) => ({
            id: `srv-${Date.now()}-${idx}`,
            title_ru: work,
            title_es: work,
            price: null,
            currency: 'a_convenir' as const,
          }))
        : [
            {
              id: `srv-default`,
              title_ru: 'Консультация',
              title_es: 'Consulta inicial',
              price: null,
              currency: 'a_convenir' as const,
            },
          ],
      gallery: galleryItems,
      workingHours_ru: `Пн-Пт: ${workingHoursComm} (по договоренности)`,
      workingHours_es: `Lun-Vie: ${workingHoursComm}`,
      reviews: [
        {
          id: `rev-initial`,
          authorName: locale === 'ru' ? 'Модерация Quatro Clicks' : 'Moderación Quatro Clicks',
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

  const sampleWorks = locale === 'ru' ? COMMON_WORKS_RU : COMMON_WORKS_ES;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-r from-sky-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {t.addBusinessTitle}
                </h2>
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {locale === 'ru' ? 'Комиссия за заказ всего 1%' : 'Comisión por trabajo solo 1%'}
                </span>
              </div>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* SECTION 1: Основные данные специалиста / компании */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Briefcase className="h-4 w-4" />
              <span>{locale === 'ru' ? '1. Данные специалиста или компании' : '1. Datos del profesional o empresa'}</span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.contractorIdLabel}
                </label>
                <input
                  type="text"
                  value={contractorId}
                  onChange={(e) => setContractorId(e.target.value)}
                  placeholder="0001/001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 font-mono font-bold focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={locale === 'ru' ? 'Александр Марченко / Анна Смирнова' : 'Alexander Marchenko / Ana Gómez'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Company Checkbox & Name */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isCompany}
                  onChange={(e) => setIsCompany(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>{t.isCompanyCheckbox}</span>
              </label>

              {isCompany && (
                <div className="mt-2.5">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {t.contractorCompanyLabel}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ventanas porteñas / Studio BA"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formCategory} *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {locale === 'ru' ? cat.title_ru : cat.title_es}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formTitle}
                </label>
                <input
                  type="text"
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  placeholder={locale === 'ru' ? 'Замер, изготовление и монтаж окон ПВХ' : 'Fabricación e instalación de ventanas PVC'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Subcategories selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.subcategoriesLabel}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.find((c) => c.id === category)?.subcategories.map((sub) => {
                  const isSelected = selectedSubcategories.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => handleToggleSubcategory(sub)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formPhotoUrl}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... (URL фото)"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="h-9 w-9 rounded-xl object-cover border border-slate-200"
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Верификация документов (Конфиденциально) */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>{t.privateVerificationTitle}</span>
              <span className="rounded-md bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                {locale === 'ru' ? 'Не для публикации' : 'Privado'}
              </span>
            </div>

            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
              {t.privateConfidentialNotice}
            </p>

            <div className="flex flex-col gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.privateDniLabel}
                </label>
                <input
                  type="text"
                  value={privateDni}
                  onChange={(e) => setPrivateDni(e.target.value)}
                  placeholder="DNI 95.123.456 / Паспорт..."
                  className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.privateDniPhotoLabel}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={privateDniPhoto}
                    onChange={(e) => setPrivateDniPhoto(e.target.value)}
                    placeholder="URL фото документа..."
                    className="flex-1 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shrink-0">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Описание и выполняемые работы */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Sparkles className="h-4 w-4" />
              <span>{locale === 'ru' ? '2. Описание и выполняемые работы' : '2. Descripción y trabajos realizados'}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formDesc} *
              </label>
              <textarea
                rows={3}
                value={descriptionRu}
                onChange={(e) => setDescriptionRu(e.target.value)}
                placeholder={locale === 'ru' ? 'Опишите ваш опыт, используемые технологии и подход к работе...' : 'Describí tu experiencia, tecnologías utilizadas y enfoque de trabajo...'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Performed Works Chips Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.performedWorks}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {sampleWorks.map((work) => {
                  const isSelected = selectedWorks.includes(work);
                  return (
                    <button
                      type="button"
                      key={work}
                      onClick={() => handleToggleWork(work)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      <span>{work}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Work */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customWork}
                  onChange={(e) => setCustomWork(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomWork();
                    }
                  }}
                  placeholder={t.performedWorksPlaceholder}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomWork}
                  className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 4: Контакты и каналы связи */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Phone className="h-4 w-4" />
              <span>{locale === 'ru' ? '3. Контакты и связь' : '3. Canales de contacto'}</span>
            </div>

            {/* Barrio */}
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

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formAddress}
              </label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Av. del Libertador 2200"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formPhone} *
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+54 9 11 3386 7500"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Phone direct */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.phoneDirect}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 3015 9399"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.formTelegram}
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="telegram_username"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@ventanasportenas.ar"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.websiteLabel}
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="WWW.ventanasportenas.ar"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.instagramLabel}
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="ventanasportenascaba"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.facebookLabel}
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="ventanasportenas"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* SECTION 5: Параметры связи и время ответа */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Clock className="h-4 w-4" />
              <span>{locale === 'ru' ? '4. Режим связи и скорость ответа' : '4. Horarios y respuesta'}</span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.responseTimeLabel}
                </label>
                <input
                  type="text"
                  value={responseTime}
                  onChange={(e) => setResponseTime(e.target.value)}
                  placeholder="1 час / 15 минут"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.workingHoursCommLabel}
                </label>
                <input
                  type="text"
                  value={workingHoursComm}
                  onChange={(e) => setWorkingHoursComm(e.target.value)}
                  placeholder="8-17"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.preferredMethodLabel}
                </label>
                <select
                  value={preferredMethod}
                  onChange={(e) => setPreferredMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="phone">{locale === 'ru' ? 'Телефон' : 'Teléfono'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 6: Владение языками */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Globe className="h-4 w-4" />
              <span>{t.languagesSkillTitle}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              {/* Russian */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.langRussian}</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={langRu}
                    onChange={(e) => setLangRu(e.target.checked)}
                    className="h-4 w-4 rounded-md text-sky-600 focus:ring-sky-500"
                  />
                  <span>{locale === 'ru' ? 'Да' : 'Sí'}</span>
                </label>
              </div>

              {/* Portuguese */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.langPortuguese}</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={langPt}
                    onChange={(e) => setLangPt(e.target.checked)}
                    className="h-4 w-4 rounded-md text-sky-600 focus:ring-sky-500"
                  />
                  <span>{locale === 'ru' ? 'Да' : 'Sí'}</span>
                </label>
              </div>

              {/* Spanish */}
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t.langSpanish}</span>
                <select
                  value={langEsLevel}
                  onChange={(e) => setLangEsLevel(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="fluent">{t.levelFluent}</option>
                  <option value="good">{t.levelGood}</option>
                  <option value="with_translator">{t.levelWithTranslator}</option>
                  <option value="none">{locale === 'ru' ? 'Нет' : 'No'}</option>
                </select>
              </div>

              {/* English */}
              <div>
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{t.langEnglish}</span>
                <select
                  value={langEnLevel}
                  onChange={(e) => setLangEnLevel(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="fluent">{t.levelFluent}</option>
                  <option value="good">{t.levelGood}</option>
                  <option value="with_translator">{t.levelWithTranslator}</option>
                  <option value="none">{locale === 'ru' ? 'Нет' : 'No'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 7: Формат и портфолио работ */}
          <div className="flex flex-col gap-3.5">
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

            {/* Portfolio URLs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.portfolioTitle} ({locale === 'ru' ? 'Ссылки на фото выполненных работ, по одной на строку' : 'URLs de fotos de trabajos, una por línea'})
              </label>
              <textarea
                rows={2}
                value={portfolioUrls}
                onChange={(e) => setPortfolioUrls(e.target.value)}
                placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {locale === 'ru'
                ? 'Бесплатное размещение анкеты. Комиссия за заказ всего 1%.'
                : 'Publicación gratuita de perfil. Comisión por pedido de solo 1%.'}
            </div>
            <div className="flex items-center gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
};
