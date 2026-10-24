'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Specialist, Locale, CategoryId, WorkFormat, SpanishLevel, EnglishLevel } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { generateSlug, transliterateCyrillic, validateArgentineDni } from '@/lib/utils';
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
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  UserCheck,
  MapPin,
  Upload,
  MessageCircle,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface AddSpecialistModalProps {
  isOpen: boolean;
  locale: Locale;
  onClose: () => void;
  onSave: (specialist: Specialist) => void;
  initialCategory?: CategoryId;
  initialSubcategory?: string;
  loggedInSpecialist?: Specialist | null;
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
  initialCategory,
  initialSubcategory,
  loggedInSpecialist,
}) => {
  const t = translations[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Unified single-window form mode (replaces multi-step wizard)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [contractorId, setContractorId] = useState('');
  const [name, setName] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyNameEs, setCompanyNameEs] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [category, setCategory] = useState<CategoryId>(initialCategory || 'repair_construction');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    initialSubcategory ? [initialSubcategory] : ['Бетонные работы, кладка']
  );
  const [avatarUrl, setAvatarUrl] = useState('');

  // Private Verification (DNI & Passport)
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

  // Synchronize when initialCategory or loggedInSpecialist changes
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      const catObj = CATEGORIES.find((c) => c.id === initialCategory);
      if (initialSubcategory) {
        setSelectedSubcategories([initialSubcategory]);
      } else if (catObj && catObj.subcategories.length > 0) {
        setSelectedSubcategories([catObj.subcategories[0]]);
      }
    }
  }, [initialCategory, initialSubcategory]);

  // Pre-fill logged-in specialist details (Multi-listing onboarding)
  useEffect(() => {
    if (loggedInSpecialist) {
      setName(loggedInSpecialist.name);
      setNameEs(loggedInSpecialist.name_es || transliterateCyrillic(loggedInSpecialist.name));
      setIsCompany(loggedInSpecialist.isCompany);
      setCompanyName(loggedInSpecialist.companyName || '');
      setCompanyNameEs(loggedInSpecialist.companyName_es || '');
      setAvatarUrl(loggedInSpecialist.avatar || '');
      setWhatsapp(loggedInSpecialist.whatsapp || '+54 9 11 ');
      setPhone(loggedInSpecialist.phone || '');
      setTelegram(loggedInSpecialist.telegram || '');
      setBarrio(loggedInSpecialist.barrio || BARRIOS[0].name);
      setAddressLine(loggedInSpecialist.addressLine || '');
      if (loggedInSpecialist.privateDocumentNumber) {
        setPrivateDni(loggedInSpecialist.privateDocumentNumber);
      }
      if (loggedInSpecialist.privateDocumentPhoto) {
        setPrivateDniPhoto(loggedInSpecialist.privateDocumentPhoto);
      }
    }
  }, [loggedInSpecialist]);

  // Live DNI Validation
  const dniValidation = useMemo(() => {
    if (!privateDni.trim()) return null;
    return validateArgentineDni(privateDni);
  }, [privateDni]);

  // Close modal on Escape key
  useEffect(() => {
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

  // Image Upload Reader Helper
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
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

    const finalNameEs = nameEs.trim() || transliterateCyrillic(name.trim());
    const finalCompanyNameEs = isCompany
      ? (companyNameEs.trim() || (companyName.trim() ? transliterateCyrillic(companyName.trim()) : undefined))
      : undefined;

    const newSpecialist: Specialist = {
      id: `custom-${Date.now()}`,
      contractorId: contractorId.trim() || `0${Math.floor(100 + Math.random() * 900)}`,
      slug: generateSlug(name) + '-' + Date.now().toString().slice(-4),
      name: name.trim(),
      name_es: finalNameEs || undefined,
      isCompany,
      companyName: isCompany ? (companyName.trim() || name.trim()) : undefined,
      companyName_es: finalCompanyNameEs,
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
      isVerified: Boolean(privateDni.trim() || privateDniPhoto.trim() || dniValidation?.isValid),
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
          id: `rev-initial-${Date.now()}`,
          authorName: locale === 'ru' ? 'Администрация Quatro Clicks' : 'Equipo Quatro Clicks',
          rating: 5,
          date: '2026-10-23',
          text_ru: 'Анкета успешно зарегистрирована и проверена на соответствие правилам платформы.',
          text_es: 'Perfil registrado y verificado conforme a los estándares de la plataforma.',
        },
      ],
      createdAt: new Date().toISOString(),
      accountId: loggedInSpecialist?.accountId || loggedInSpecialist?.id || undefined,
      dniVerified: Boolean(dniValidation?.isValid),
      dniVerificationType: dniValidation?.isValid && dniValidation.type !== 'invalid' ? dniValidation.type : undefined,
    };

    onSave(newSpecialist);
    onClose();
  };

  const sampleWorks = locale === 'ru' ? COMMON_WORKS_RU : COMMON_WORKS_ES;
  const currentCategoryObj = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Clean Fixed Header (No Stepper Tabs!) */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400 shrink-0">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-950 dark:text-white leading-tight">
                {loggedInSpecialist
                  ? (locale === 'ru' ? 'Добавление услуги в категорию' : 'Agregar servicio a categoría')
                  : t.addBusinessTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {loggedInSpecialist
                  ? (locale === 'ru' ? `Мастер: ${loggedInSpecialist.name}` : `Profesional: ${loggedInSpecialist.name}`)
                  : (locale === 'ru' ? 'Единая форма регистрации мастера и карточки услуги' : 'Formulario único de registro')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition shrink-0 cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Single Continuous Vertical Column Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-6">
          
          {/* SECTION 1: КАТЕГОРИЯ И УСЛУГА */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-xs font-black">
                1
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {locale === 'ru' ? 'Услуга и специализация' : 'Servicio y especialidad'}
              </h3>
            </div>

            {/* Category Lock Indicator if opened inside category */}
            {initialCategory && (
              <div className="flex flex-col gap-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 p-3 text-xs">
                <span className="font-semibold text-sky-800 dark:text-sky-300">
                  📍 {locale === 'ru' ? 'Категория выбрана в каталоге:' : 'Categoría seleccionada:'} <strong className="font-bold">{currentCategoryObj ? (locale === 'ru' ? currentCategoryObj.title_ru : currentCategoryObj.title_es) : ''}</strong>
                </span>
                <span className="text-[11px] text-sky-600 dark:text-sky-400">
                  {locale === 'ru' ? 'Услуга будет размещена напрямую в этой категории' : 'El servicio se publicará en esta categoría'}
                </span>
              </div>
            )}

            {/* Category Dropdown (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.formCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                disabled={Boolean(initialCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-80 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === 'ru' ? c.title_ru : c.title_es}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategories selector (Full Width Vertical Flow) */}
            {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.subcategoriesLabel} *
                </label>
                <div className="flex flex-col gap-1.5">
                  {currentCategoryObj.subcategories.map((sub) => {
                    const isSelected = selectedSubcategories.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => handleToggleSubcategory(sub)}
                        className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition text-left border cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-800 dark:bg-sky-950/60 dark:border-sky-600 dark:text-sky-200 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{sub}</span>
                        <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Service Title (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {locale === 'ru' ? 'Название услуги / Специализация' : 'Título del servicio / Especialidad'} *
              </label>
              <input
                type="text"
                required
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
                placeholder={locale === 'ru' ? 'Например: Монтаж и регулировка окон' : 'Ej: Instalación y ajuste de ventanas'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Performed Works (Full Width Vertical Checklist + Add Custom Work) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.performedWorks}
              </label>
              <div className="flex flex-col gap-1.5 mb-1">
                {sampleWorks.map((work) => {
                  const isSelected = selectedWorks.includes(work);
                  return (
                    <button
                      type="button"
                      key={work}
                      onClick={() => handleToggleWork(work)}
                      className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition text-left border cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 border-sky-400 text-sky-800 dark:bg-sky-950/60 dark:border-sky-600 dark:text-sky-200 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{work}</span>
                      <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Work (Stacked Vertically) */}
              <div className="flex flex-col gap-1.5 pt-1">
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
                  placeholder={locale === 'ru' ? 'Добавить свою работу...' : 'Agregar trabajo personalizado...'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomWork}
                  className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition text-center cursor-pointer"
                >
                  + {locale === 'ru' ? 'Добавить в список выполняемых работ' : 'Añadir al listado de trabajos'}
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: ПРОФИЛЬ МАСТЕРА */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-xs font-black">
                2
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {locale === 'ru' ? 'Данные мастера' : 'Datos del profesional'}
              </h3>
            </div>

            {/* Master Name (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.formName} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!nameEs || nameEs === transliterateCyrillic(name)) {
                    setNameEs(transliterateCyrillic(e.target.value));
                  }
                }}
                placeholder="Александр Романов"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Master Name in Latin (Full Width Stacked Directly Underneath) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {locale === 'ru' ? 'Имя на латинице (для испаноязычной версии сайта)' : 'Nombre en caracteres latinos'}
              </label>
              <input
                type="text"
                value={nameEs}
                onChange={(e) => setNameEs(e.target.value)}
                placeholder="Aleksandr Romanov"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'ru' ? 'Заполняется автоматически при вводе имени' : 'Se autocompleta automáticamente'}
              </p>
            </div>

            {/* Company Checkbox & Details (Full Width Stacked) */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompany}
                  onChange={(e) => setIsCompany(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t.isCompanyCheckbox}
                </span>
              </label>

              {isCompany && (
                <div className="flex flex-col gap-3 pt-1 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {locale === 'ru' ? 'Название компании' : 'Nombre de la empresa'}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (!companyNameEs || companyNameEs === transliterateCyrillic(companyName)) {
                          setCompanyNameEs(transliterateCyrillic(e.target.value));
                        }
                      }}
                      placeholder="Например: Ventanas Porteñas"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {locale === 'ru' ? 'Название компании на латинице' : 'Nombre de la empresa en latín'}
                    </label>
                    <input
                      type="text"
                      value={companyNameEs}
                      onChange={(e) => setCompanyNameEs(e.target.value)}
                      placeholder="Ventanas Porteñas"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Upload (Stacked in Single Column) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.formPhotoUrl}
              </label>
              
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {avatarUrl
                    ? (locale === 'ru' ? 'Фото загружено и готово к публикации' : 'Foto cargada correctamente')
                    : (locale === 'ru' ? 'Загрузите реальное фото лица или логотип' : 'Subí una foto de perfil o logo')}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, setAvatarUrl)}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-400 bg-sky-50 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:hover:bg-sky-950/70 py-2.5 text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-300 transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{locale === 'ru' ? 'Выбрать фото с устройства' : 'Subir foto desde el dispositivo'}</span>
              </button>

              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={locale === 'ru' ? 'Или вставьте прямую ссылку на фото (https://...)' : 'O pega enlace a foto (https://...)'}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* SECTION 3: КОНТАКТЫ И ЛОКАЦИЯ */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-xs font-black">
                3
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {locale === 'ru' ? 'Локация и связь' : 'Ubicación y contacto'}
              </h3>
            </div>

            {/* Barrio Dropdown (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.formBarrio} *
              </label>
              <select
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
              >
                {BARRIOS.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Address Line (Full Width Stacked Underneath) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {locale === 'ru' ? 'Точный адрес или ориентир улицы' : 'Dirección exacta o intersección'} *
              </label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Например: Humboldt 1900, Palermo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'ru' ? 'Отображается на интерактивной карте в карточке' : 'Aparece en el mapa interactivo'}
              </p>
            </div>

            {/* Work Formats (3 Full-Width Vertical Option Cards) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.workFormat}
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFormat('office')}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition cursor-pointer text-left ${
                    format.includes('office')
                      ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{t.officeFormat}</span>
                  </div>
                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                    format.includes('office') ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {format.includes('office') && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFormat('home_visit')}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition cursor-pointer text-left ${
                    format.includes('home_visit')
                      ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{t.homeVisitFormat}</span>
                  </div>
                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                    format.includes('home_visit') ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {format.includes('home_visit') && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFormat('online')}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition cursor-pointer text-left ${
                    format.includes('online')
                      ? 'border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{t.onlineFormat}</span>
                  </div>
                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                    format.includes('online') ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {format.includes('online') && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* WhatsApp (Primary Channel with Prominent Callout) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                WhatsApp (Аргентинский номер для заказов) *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-600">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+54 9 11 3386-7500"
                  className="w-full rounded-xl border-2 border-emerald-400 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-emerald-700 dark:bg-slate-800 dark:text-white shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {locale === 'ru'
                  ? 'Заказчики будут открывать диалог и сделку напрямую через этот WhatsApp с пометкой сайта.'
                  : 'Los clientes abrirán el diálogo y trato directamente mediante este WhatsApp.'}
              </p>
            </div>

            {/* Telegram (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Telegram (Юзернейм без @)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs sm:text-sm font-mono font-bold">
                  @
                </span>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                  placeholder="natalia_traductora"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Working Hours (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.workingHoursCommLabel}
              </label>
              <input
                type="text"
                value={workingHoursComm}
                onChange={(e) => setWorkingHoursComm(e.target.value)}
                placeholder="8-17"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Response Time (Full Width Stacked Underneath) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.responseTimeLabel}
              </label>
              <input
                type="text"
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                placeholder="1 час"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* SECTION 4: ВЕРИФИКАЦИЯ DNI (КОНФИДЕНЦИАЛЬНО) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-black">
                4
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {locale === 'ru' ? 'Верификация личности (Конфиденциально)' : 'Verificación privada de identidad'}
              </h3>
            </div>

            {/* Authenticated Master Notice */}
            {loggedInSpecialist ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 p-4">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                  <UserCheck className="w-4 h-4" />
                  <span>{locale === 'ru' ? 'Единый профиль мастера верифицирован' : 'Perfil único verificado'}</span>
                </div>
                <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                  {locale === 'ru'
                    ? `Мастер: ${loggedInSpecialist.name}. Новая услуга будет автоматически привязана к вашему общему аккаунту и балансу депозита.`
                    : `Profesional: ${loggedInSpecialist.name}. El nuevo servicio se vinculará a tu cuenta y saldo general.`}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 dark:border-amber-700/60 dark:from-amber-950/30 dark:to-orange-950/20 shadow-xs flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                    <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>{t.privateVerificationTitle}</span>
                  </div>
                  <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    {locale === 'ru' ? 'Не для публикации' : 'Privado'}
                  </span>
                </div>

                <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
                  {t.privateConfidentialNotice}
                </p>

                {/* DNI Number Input (Full Width) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {t.privateDniLabel} *
                    </label>
                    {dniValidation && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          dniValidation.isValid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {dniValidation.isValid ? '✓ ' + (locale === 'ru' ? dniValidation.description_ru : dniValidation.description_es) : '✗ ' + (locale === 'ru' ? dniValidation.description_ru : dniValidation.description_es)}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={privateDni}
                    onChange={(e) => setPrivateDni(e.target.value)}
                    placeholder="DNI 95.123.456 / CUIT 20-XXXXXXXX-4..."
                    className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono font-semibold text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                {/* DNI Photo Upload (Full Width Stacked) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {t.privateDniPhotoLabel}
                  </label>
                  
                  <input
                    type="file"
                    ref={docFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setPrivateDniPhoto)}
                  />

                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-900 py-2.5 text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>{locale === 'ru' ? 'Сделать фото документа / Загрузить файл' : 'Tomar foto / Subir documento'}</span>
                  </button>

                  <input
                    type="text"
                    value={privateDniPhoto}
                    onChange={(e) => setPrivateDniPhoto(e.target.value)}
                    placeholder={locale === 'ru' ? 'Или вставьте ссылку на фото документа...' : 'O enlace a la foto del documento...'}
                    className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                  />

                  {privateDniPhoto && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{locale === 'ru' ? 'Фото документа успешно прикреплено' : 'Foto del documento adjunta'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: О СЕБЕ И ЯЗЫКИ */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-xs font-black">
                5
              </span>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {locale === 'ru' ? 'Опыт и языки общения' : 'Experiencia e idiomas'}
              </h3>
            </div>

            {/* Bio / Description (Full Width) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {t.formDesc} *
              </label>
              <textarea
                rows={3}
                value={descriptionRu}
                onChange={(e) => setDescriptionRu(e.target.value)}
                placeholder={
                  locale === 'ru'
                    ? 'Опишите ваш опыт, подход к работе и оборудование...'
                    : 'Describí tu experiencia y enfoque de trabajo...'
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Languages (3 Full-Width Vertical Option Cards) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {locale === 'ru' ? 'Языки общения' : 'Idiomas'}
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setLangRu(!langRu)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition cursor-pointer text-left ${
                    langRu
                      ? 'bg-sky-50 border-sky-400 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇷🇺</span>
                    <span>Русский язык</span>
                  </div>
                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                    langRu ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {langRu && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLangEsLevel(langEsLevel === 'none' ? 'good' : 'none')}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition cursor-pointer text-left ${
                    langEsLevel !== 'none'
                      ? 'bg-sky-50 border-sky-400 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇦🇷</span>
                    <span>Испанский язык (Español)</span>
                  </div>
                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                    langEsLevel !== 'none' ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {langEsLevel !== 'none' && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLangEnLevel(langEnLevel === 'none' ? 'good' : 'none')}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs sm:text-sm font-semibold transition cursor-pointer text-left ${
                    langEnLevel !== 'none'
                      ? 'bg-sky-50 border-sky-400 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <span>Английский язык (English)</span>
                  </div>
                  <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                    langEnLevel !== 'none' ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                  }`}>
                    {langEnLevel !== 'none' && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 6: ПРЕДПРОСМОТР И ПУБЛИКАЦИЯ */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Live Preview Card Snippet */}
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {locale === 'ru' ? 'Предпросмотр карточки' : 'Vista previa'}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-full h-full p-2.5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {name || (locale === 'ru' ? 'Имя специалиста' : 'Nombre')}
                  </h4>
                  <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium truncate">
                    {titleRu || (locale === 'ru' ? 'Специализация' : 'Especialidad')} • {barrio}
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Commission Notice */}
            <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {locale === 'ru' ? '💡 Комиссия за заказ всего 1%' : '💡 Comisión por trabajo solo 1%'}
              </span>
              <span>{locale === 'ru' ? 'Без скрытых платежей' : 'Sin costos ocultos'}</span>
            </div>

            {/* Big Prominent Full-Width Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-6 text-sm sm:text-base font-extrabold shadow-md transition active:scale-98 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{locale === 'ru' ? 'Опубликовать услугу' : 'Publicar servicio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
