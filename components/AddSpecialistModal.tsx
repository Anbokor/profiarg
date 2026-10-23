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

  // Multi-step Wizard State: 1 = Service & Profile, 2 = Location & Contacts, 3 = Verification & Bio
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-6 overflow-hidden">
        
        {/* Sticky Header with Step Navigator */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {loggedInSpecialist
                    ? (locale === 'ru' ? 'Добавление услуги в категорию' : 'Agregar servicio a categoría')
                    : t.addBusinessTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loggedInSpecialist
                    ? (locale === 'ru' ? `Мастер: ${loggedInSpecialist.name}` : `Profesional: ${loggedInSpecialist.name}`)
                    : t.addBusinessSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                currentStep === 1
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>{locale === 'ru' ? 'Услуга' : 'Servicio'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                currentStep === 2
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>{locale === 'ru' ? 'Контакты' : 'Contacto'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition ${
                currentStep === 3
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
              <span>{locale === 'ru' ? 'DNI и Опыт' : 'DNI y Perfil'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Concise Form */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto flex flex-col gap-5">
          
          {/* STEP 1: УСЛУГА И БАЗОВЫЙ ПРОФИЛЬ */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4">
              {/* Category Lock Indicator if opened inside category */}
              {initialCategory && (
                <div className="flex items-center justify-between rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 px-3.5 py-2 text-xs">
                  <span className="font-semibold text-sky-800 dark:text-sky-300">
                    📍 {locale === 'ru' ? 'Категория выбрана в каталоге:' : 'Categoría seleccionada:'} <strong className="font-bold">{currentCategoryObj ? (locale === 'ru' ? currentCategoryObj.title_ru : currentCategoryObj.title_es) : ''}</strong>
                  </span>
                  <span className="rounded-full bg-sky-200/60 dark:bg-sky-900 px-2 py-0.5 text-[10px] font-bold text-sky-900 dark:text-sky-200">
                    {locale === 'ru' ? 'Зафиксировано' : 'Fijado'}
                  </span>
                </div>
              )}

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formCategory} *
                </label>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                  disabled={Boolean(initialCategory)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-80"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {locale === 'ru' ? c.title_ru : c.title_es}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategories selector */}
              {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.subcategoriesLabel} *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCategoryObj.subcategories.map((sub) => {
                      const isSelected = selectedSubcategories.includes(sub);
                      return (
                        <button
                          type="button"
                          key={sub}
                          onClick={() => handleToggleSubcategory(sub)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          <span>{sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Service Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {locale === 'ru' ? 'Название услуги / Специализация' : 'Título del servicio / Especialidad'} *
                </label>
                <input
                  type="text"
                  required
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  placeholder={locale === 'ru' ? 'Например: Монтаж и регулировка окон' : 'Ej: Instalación y ajuste de ventanas'}
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
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{work}</span>
                      </button>
                    );
                  })}
                </div>

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
                    placeholder={locale === 'ru' ? 'Добавить свою работу...' : 'Agregar trabajo personalizado...'}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomWork}
                    className="rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Master Name & Auto Latin Transliteration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {locale === 'ru' ? 'Имя на латинице (для испанской версии)' : 'Nombre en latín'}
                  </label>
                  <input
                    type="text"
                    value={nameEs}
                    onChange={(e) => setNameEs(e.target.value)}
                    placeholder="Aleksandr Romanov"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Company Toggle */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompany}
                    onChange={(e) => setIsCompany(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t.isCompanyCheckbox}
                  </span>
                </label>

                {isCompany && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          if (!companyNameEs || companyNameEs === transliterateCyrillic(companyName)) {
                            setCompanyNameEs(transliterateCyrillic(e.target.value));
                          }
                        }}
                        placeholder="Название компании (Ventanas Porteñas)..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={companyNameEs}
                        onChange={(e) => setCompanyNameEs(e.target.value)}
                        placeholder="Nombre de la empresa..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.formPhotoUrl}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, setAvatarUrl)}
                  />
                  <div className="flex-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-sky-600" />
                      <span>{locale === 'ru' ? 'Выбрать фото' : 'Subir foto'}</span>
                    </button>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Или ссылка на фото..."
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <span>{locale === 'ru' ? 'Далее: Локация и Контакты' : 'Siguiente: Ubicación'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ЛОКАЦИЯ И СВЯЗЬ */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4">
              {/* Barrio & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    {locale === 'ru' ? 'Точный адрес / Улица' : 'Dirección exacta'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Например: Humboldt 1900, Palermo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Work Formats */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.workFormat}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleFormat('office')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition ${
                      format.includes('office')
                        ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>{t.officeFormat}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleFormat('home_visit')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition ${
                      format.includes('home_visit')
                        ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{t.homeVisitFormat}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleFormat('online')}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition ${
                      format.includes('online')
                        ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{t.onlineFormat}</span>
                  </button>
                </div>
              </div>

              {/* WhatsApp (Primary Tracked Deal Channel) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp (Аргентинский номер) *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+54 9 11 3386-7500"
                    className="w-full rounded-xl border border-emerald-300 bg-white pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-emerald-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {locale === 'ru'
                    ? 'Заказчики будут открывать диалог и сделку напрямую через этот WhatsApp.'
                    : 'Los clientes abrirán el diálogo y trato directamente mediante este WhatsApp.'}
                </p>
              </div>

              {/* Telegram */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram (Юзернейм без @)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs font-mono font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                    placeholder="natalia_traductora"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.responseTimeLabel}
                  </label>
                  <input
                    type="text"
                    value={responseTime}
                    onChange={(e) => setResponseTime(e.target.value)}
                    placeholder="1 час"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{locale === 'ru' ? 'Назад' : 'Atrás'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 text-xs font-bold shadow-xs transition active:scale-95"
                >
                  <span>{locale === 'ru' ? 'Далее: Верификация DNI' : 'Siguiente: Verificación'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ВЕРИФИКАЦИЯ DNI И ОПИСАНИЕ */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4">
              
              {/* Authenticated Master Notice */}
              {loggedInSpecialist ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 p-3.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <UserCheck className="w-4 h-4" />
                    <span>{locale === 'ru' ? 'Единый профиль мастера верифицирован' : 'Perfil único verificado'}</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                    {locale === 'ru'
                      ? `Мастер ${loggedInSpecialist.name}. Новая услуга будет автоматически привязана к вашему общему аккаунту и балансу депозита.`
                      : `Profesional ${loggedInSpecialist.name}. El nuevo servicio se vinculará a tu cuenta y saldo general.`}
                  </p>
                </div>
              ) : (
                /* DNI Confidential Box with Live Checksum Validation */
                <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 dark:border-amber-700/60 dark:from-amber-950/30 dark:to-orange-950/20 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      <span>{t.privateVerificationTitle}</span>
                    </div>
                    <span className="rounded-md bg-amber-200/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      {locale === 'ru' ? 'Не для публикации' : 'Privado'}
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                    {t.privateConfidentialNotice}
                  </p>

                  <div className="flex flex-col gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                        className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    {/* DNI Document Photo Upload with Camera / File */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t.privateDniPhotoLabel}
                      </label>
                      <input
                        type="file"
                        ref={docFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setPrivateDniPhoto)}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => docFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-200 transition"
                        >
                          <Camera className="w-4 h-4 text-amber-600" />
                          <span>{locale === 'ru' ? 'Сделать фото / Загрузить' : 'Tomar foto / Subir'}</span>
                        </button>
                        <input
                          type="text"
                          value={privateDniPhoto}
                          onChange={(e) => setPrivateDniPhoto(e.target.value)}
                          placeholder="Или ссылка на фото документа..."
                          className="flex-1 rounded-xl border border-amber-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-hidden dark:border-amber-800 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                      {privateDniPhoto && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{locale === 'ru' ? 'Фото документа прикреплено' : 'Foto del documento adjunta'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bio / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {locale === 'ru' ? 'Языки общения' : 'Idiomas'}
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setLangRu(!langRu)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                      langRu ? 'bg-sky-50 border-sky-400 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    🇷🇺 Русский
                  </button>

                  <button
                    type="button"
                    onClick={() => setLangEsLevel(langEsLevel === 'none' ? 'good' : 'none')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                      langEsLevel !== 'none' ? 'bg-sky-50 border-sky-400 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    🇦🇷 Español
                  </button>

                  <button
                    type="button"
                    onClick={() => setLangEnLevel(langEnLevel === 'none' ? 'good' : 'none')}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                      langEnLevel !== 'none' ? 'bg-sky-50 border-sky-400 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Live Preview Card Snippet */}
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  {locale === 'ru' ? 'Предпросмотр карточки' : 'Vista previa'}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-full h-full p-2.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {name || (locale === 'ru' ? 'Имя специалиста' : 'Nombre')}
                    </h4>
                    <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                      {titleRu || (locale === 'ru' ? 'Специализация' : 'Especialidad')} • {barrio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Commission Notice */}
              <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {locale === 'ru' ? '💡 Комиссия за заказ всего 1%' : '💡 Comisión por trabajo solo 1%'}
                </span>
                <span>{locale === 'ru' ? 'Без скрытых платежей' : 'Sin costos ocultos'}</span>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{locale === 'ru' ? 'Назад' : 'Atrás'}</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{locale === 'ru' ? 'Опубликовать услугу' : 'Publicar servicio'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
