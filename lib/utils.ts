import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Currency, Locale } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(price: number | null, currency: Currency, locale: Locale): string {
  if (price === null || currency === 'a_convenir') {
    return locale === 'ru' ? 'По договорённости' : 'A convenir';
  }

  const prefix = locale === 'ru' ? 'от ' : 'desde ';

  if (currency === 'USD') {
    return `${prefix}$${price.toLocaleString()} USD`;
  }

  return `${prefix}$${price.toLocaleString('es-AR')} ARS`;
}

export function buildWhatsAppUrl(phone: string, specialistName: string, locale: Locale): string {
  // Sanitize phone number (keep only digits)
  let cleanPhone = phone.replace(/[^0-9]/g, '');

  // Argentine phone number format normalizer
  if (cleanPhone.startsWith('15') && cleanPhone.length === 10) {
    // Local mobile without area code -> assume CABA 11
    cleanPhone = '54911' + cleanPhone.slice(2);
  } else if (cleanPhone.startsWith('11') && cleanPhone.length === 10) {
    // CABA local mobile 11XXXXXXXX -> prepend 549
    cleanPhone = '549' + cleanPhone;
  } else if (cleanPhone.startsWith('54') && !cleanPhone.startsWith('549') && cleanPhone.length === 12) {
    // 5411XXXXXXXX -> insert 9 for WhatsApp
    cleanPhone = '549' + cleanPhone.slice(2);
  } else if (!cleanPhone.startsWith('54') && cleanPhone.length >= 8 && cleanPhone.length <= 10) {
    cleanPhone = '549' + cleanPhone;
  }

  const text =
    locale === 'ru'
      ? `Здравствуйте, ${specialistName}! Нашёл вашу анкету на платформе Quatro Clicks. Подскажите, пожалуйста, по поводу ваших услуг...`
      : `Hola ${specialistName}, encontré tu perfil en Quatro Clicks. Quisiera consultar sobre tus servicios...`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateSlug(name: string): string {
  const ruToEn: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };

  const transliterated = name
    .toLowerCase()
    .split('')
    .map((char) => ruToEn[char] || char)
    .join('');

  return transliterated
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Smart transliteration from Cyrillic to Latin, with recognition of common Russian names
 */
const COMMON_NAME_MAP: Record<string, string> = {
  'александр': 'Alexander',
  'александра': 'Alexandra',
  'михаил': 'Mikhail',
  'дмитрий': 'Dmitry',
  'иван': 'Ivan',
  'екатерина': 'Ekaterina',
  'елена': 'Elena',
  'анна': 'Anna',
  'мария': 'Maria',
  'алексей': 'Alexey',
  'виктор': 'Viktor',
  'максим': 'Maxim',
  'артем': 'Artem',
  'артём': 'Artem',
  'карина': 'Karina',
  'татьяна': 'Tatiana',
  'сергей': 'Sergey',
  'валентина': 'Valentina',
  'павел': 'Pavel',
  'наталья': 'Natalia',
  'наталия': 'Natalia',
  'ольга': 'Olga',
  'ирина': 'Irina',
  'андрей': 'Andrey',
  'владимир': 'Vladimir',
};

const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
  'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
  'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
  'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
  'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
};

export function transliterateCyrillic(text: string): string {
  if (!text) return '';

  return text
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (COMMON_NAME_MAP[lower]) {
        return COMMON_NAME_MAP[lower];
      }
      return word
        .split('')
        .map((char) => CYRILLIC_TO_LATIN_MAP[char] !== undefined ? CYRILLIC_TO_LATIN_MAP[char] : char)
        .join('');
    })
    .join(' ');
}

export function getSpecialistDisplayName(
  specialist: { name: string; name_es?: string },
  locale: Locale
): string {
  if (locale === 'es') {
    return specialist.name_es?.trim() || transliterateCyrillic(specialist.name);
  }
  return specialist.name;
}

export function getSpecialistCompanyName(
  specialist: { companyName?: string; companyName_es?: string },
  locale: Locale
): string | undefined {
  if (locale === 'es') {
    return (
      specialist.companyName_es?.trim() ||
      (specialist.companyName ? transliterateCyrillic(specialist.companyName) : undefined)
    );
  }
  return specialist.companyName;
}

/**
 * Escapes characters with HTML entities to prevent XSS in raw HTML templates (e.g. Leaflet popups)
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes URLs to prevent javascript: and data: script execution vulnerabilities
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = ''): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  // Safe protocols: http, https, relative root path, or standard image data URLs
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }
  return fallback;
}
