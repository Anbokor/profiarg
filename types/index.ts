export type Locale = 'ru' | 'es';

export type CategoryId =
  | 'immigration'
  | 'medicine'
  | 'real_estate'
  | 'beauty'
  | 'food'
  | 'repair'
  | 'education'
  | 'it_freelance'
  | 'pets'
  | 'tourism';

export type WorkFormat = 'office' | 'home_visit' | 'online';

export type Currency = 'ARS' | 'USD' | 'a_convenir';

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
  barrio: string;
  addressLine: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formats: WorkFormat[];
  whatsapp: string; // e.g. "+5491123456789"
  telegram?: string; // e.g. "natalia_traductora"
  instagram?: string;
  website?: string;
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
