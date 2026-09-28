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
      ? `Здравствуйте, ${specialistName}! Нашёл вашу анкету на платформе ProfiARG. Подскажите, пожалуйста, по поводу ваших услуг...`
      : `Hola ${specialistName}, encontré tu perfil en ProfiARG. Quisiera consultar sobre tus servicios...`;

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
