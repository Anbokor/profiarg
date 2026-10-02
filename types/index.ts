export type Locale = 'ru' | 'es';

export type CategoryId =
  | 'repair_construction'
  | 'beauty'
  | 'transport'
  | 'currency_exchange'
  | 'translators'
  | 'legal_lawyers'
  | 'education'
  | 'tourism'
  | 'appliances_repair'
  | 'auto'
  | 'real_estate'
  | 'jobs'
  | 'it_services'
  | 'food_shops';

export type WorkFormat = 'office' | 'home_visit' | 'online';

export type Currency = 'ARS' | 'USD' | 'a_convenir';

export type SpanishLevel = 'fluent' | 'good' | 'with_translator';
export type EnglishLevel = 'fluent' | 'good' | 'with_translator';

export interface GranularLanguages {
  russian: boolean;
  spanish?: SpanishLevel;
  english?: EnglishLevel;
  portuguese?: boolean;
}

export interface SubcategoryItem {
  id: string;
  title_ru: string;
  title_es: string;
}

export interface Category {
  id: CategoryId;
  slug: string;
  title_ru: string;
  title_es: string;
  iconName: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  pinBg: string;
  description_ru: string;
  description_es: string;
  subcategories: string[];
  subcategoriesDetailed?: SubcategoryItem[];
}

export interface Barrio {
  id: string;
  name: string;
  zone: 'CABA' | 'Zona Norte' | 'GBA';
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface ServiceItem {
  id: string;
  title_ru: string;
  title_es: string;
  price: number | null;
  currency: Currency;
  duration?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  text_ru: string;
  text_es: string;
  avatar?: string;
}

export interface Specialist {
  id: string;
  contractorId?: string; // e.g. '0001/001', '0154'
  slug: string;
  name: string;
  isCompany: boolean;
  companyName?: string;
  title_ru: string;
  title_es: string;
  category: CategoryId;
  subcategories: string[];
  avatar: string;
  coverImage: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number; // years operating in Argentina
  isVerified: boolean;
  languages: ('ru' | 'es' | 'en')[];
  granularLanguages?: GranularLanguages;
  advantages?: string[]; // e.g. ['Замер', 'Консультация', 'Выезд специалиста', 'Европейские нормы', 'Гарантия', 'Немецкая фурнитура']
  responseTime?: string; // e.g. '1 час' / '15 минут'
  workingHoursComm?: string; // e.g. '8-17'
  preferredContactMethod?: 'whatsapp' | 'telegram' | 'phone';
  phone?: string;
  whatsapp: string; // e.g. "+5491133867500"
  telegram?: string; // e.g. "natalia_traductora"
  instagram?: string;
  facebook?: string;
  website?: string;
  email?: string;
  privateDocumentNumber?: string; // DNI / Passport (private verification)
  privateDocumentPhoto?: string; // Photo of DNI / Passport (private verification)
  barrio: string;
  addressLine: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formats: WorkFormat[];
  description_ru: string;
  description_es: string;
  services: ServiceItem[];
  gallery: string[];
  workingHours_ru: string;
  workingHours_es: string;
  reviews: Review[];
  isFeatured?: boolean;
  createdAt?: string;
}

export interface FilterState {
  searchQuery: string;
  category: CategoryId | 'all';
  barrio: string | 'all';
  format: WorkFormat | 'all';
  verifiedOnly: boolean;
  favoritesOnly: boolean;
  sortBy: 'rating' | 'reviews' | 'name' | 'newest';
}

export type ViewMode = 'split' | 'catalog' | 'map';

export type OrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  title: string;
  category: CategoryId;
  barrio: string;
  description: string;
  budget: number | null;
  currency: Currency;
  contactName: string;
  contactMethod: 'whatsapp' | 'telegram' | 'phone';
  contactValue: string;
  status: OrderStatus;
  createdAt: string;
  assignedSpecialistId?: string;
  assignedSpecialistName?: string;
  finalSum?: number;
  commissionAmount?: number;
  commissionCurrency?: Currency;
  completedAt?: string;
}

export interface SpecialistCabinetState {
  balanceArs: number;
  balanceUsd: number;
  totalVolumeArs: number;
  totalVolumeUsd: number;
  totalCommissionPaidArs: number;
  totalCommissionPaidUsd: number;
  savedVsTraditionalArs: number;
  savedVsTraditionalUsd: number;
  completedOrdersCount: number;
}
