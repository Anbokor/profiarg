import {
  Specialist,
  Review,
  Order,
  OrderStatus,
  SpecialistCabinetState,
  Deal,
  DealStatus,
  CustomerAccount,
} from '@/types';
import { SEED_SPECIALISTS } from '@/data/seedData';
import { SEED_ORDERS } from '@/data/seedOrders';

const CUSTOM_SPECIALISTS_KEY = 'quatroclicks_custom_specialists';
const FAVORITES_KEY = 'quatroclicks_favorites';
const CUSTOM_REVIEWS_KEY = 'quatroclicks_custom_reviews';
const LOCALE_KEY = 'quatroclicks_locale';
const ORDERS_KEY = 'quatroclicks_orders_list';
const SPECIALIST_CABINET_KEY = 'quatroclicks_specialist_cabinet';
const DEALS_KEY = 'quatroclicks_deals_list';
const CURRENT_CUSTOMER_KEY = 'quatroclicks_current_customer';

export const SEED_DEALS: Deal[] = [
  {
    id: 'QC-4821',
    specialistId: 'spec-3', // Alexander Romanov
    specialistName: 'Александр Романов',
    specialistPhone: '+5491133867500',
    serviceTitle: 'Монтаж окон и дверей',
    category: 'repair_construction',
    subcategory: 'Окна',
    customerId: 'cust-1',
    customerName: 'Екатерина Смирнова',
    customerPhone: '+5491122334455',
    status: 'completed',
    amount: 85000,
    currency: 'ARS',
    commissionAmount: 850,
    createdAt: '2026-10-18T14:20:00.000Z',
    completedAt: '2026-10-21T16:45:00.000Z',
  },
  {
    id: 'QC-7193',
    specialistId: 'spec-3',
    specialistName: 'Александр Романов',
    specialistPhone: '+5491133867500',
    serviceTitle: 'Замена стеклопакета в Палермо',
    category: 'repair_construction',
    subcategory: 'Окна',
    customerId: 'cust-1',
    customerName: 'Екатерина Смирнова',
    customerPhone: '+5491122334455',
    status: 'in_progress',
    createdAt: '2026-10-23T11:15:00.000Z',
  },
];

export const DEFAULT_CUSTOMER: CustomerAccount = {
  id: 'cust-1',
  name: 'Екатерина Смирнова',
  phone: '+54 9 11 2233-4455',
  whatsapp: '+5491122334455',
  telegram: 'ekaterina_caba',
  favorites: ['spec-3', 'spec-1'],
};

export function getStoredSpecialists(): Specialist[] {
  if (typeof window === 'undefined') {
    return SEED_SPECIALISTS;
  }

  try {
    const raw = localStorage.getItem(CUSTOM_SPECIALISTS_KEY);
    const custom: Specialist[] = raw ? JSON.parse(raw) : [];

    const rawReviews = localStorage.getItem(CUSTOM_REVIEWS_KEY);
    const reviewsMap: Record<string, Review[]> = rawReviews ? JSON.parse(rawReviews) : {};

    const all = [...custom, ...SEED_SPECIALISTS];

    // Merge any stored custom reviews (publicly only approved or seed reviews)
    return all.map((s) => {
      const extraReviews = reviewsMap[s.id];
      if (extraReviews && extraReviews.length > 0) {
        const existingIds = new Set((s.reviews || []).map((r) => r.id));
        const newReviewsToAdd = extraReviews.filter((r) => !existingIds.has(r.id));
        const approvedCustom = newReviewsToAdd.filter((r) => r.status === 'approved' || !r.status);
        if (approvedCustom.length === 0) return s;

        const combinedReviews = [...approvedCustom, ...(s.reviews || [])];
        const newAvg =
          combinedReviews.reduce((sum, r) => sum + r.rating, 0) / combinedReviews.length;
        return {
          ...s,
          reviews: combinedReviews,
          reviewsCount: combinedReviews.length,
          rating: Math.round(newAvg * 10) / 10,
        };
      }
      return s;
    });
  } catch (e) {
    console.error('Error reading specialists from storage', e);
    return SEED_SPECIALISTS;
  }
}

export function saveCustomSpecialist(specialist: Specialist): Specialist[] {
  if (typeof window === 'undefined') return [specialist, ...SEED_SPECIALISTS];

  try {
    const raw = localStorage.getItem(CUSTOM_SPECIALISTS_KEY);
    const custom: Specialist[] = raw ? JSON.parse(raw) : [];
    const updated = [specialist, ...custom.filter((s) => s.id !== specialist.id)];
    localStorage.setItem(CUSTOM_SPECIALISTS_KEY, JSON.stringify(updated));
    return getStoredSpecialists();
  } catch (e) {
    console.error('Error saving specialist to storage', e);
    return [specialist, ...SEED_SPECIALISTS];
  }
}

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(specialistId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const favs = getFavorites();
    const updated = favs.includes(specialistId)
      ? favs.filter((id) => id !== specialistId)
      : [...favs, specialistId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function addReviewToSpecialist(
  specialistId: string,
  review: Omit<Review, 'id' | 'date'>
): Review {
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    status: review.status || (review.verifiedDeal ? 'approved' : 'pending'),
    verifiedDeal: review.verifiedDeal || false,
    date: new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };

  if (typeof window === 'undefined') return newReview;

  try {
    const raw = localStorage.getItem(CUSTOM_REVIEWS_KEY);
    const reviewsMap: Record<string, Review[]> = raw ? JSON.parse(raw) : {};
    if (!reviewsMap[specialistId]) {
      reviewsMap[specialistId] = [];
    }
    reviewsMap[specialistId].unshift(newReview);
    localStorage.setItem(CUSTOM_REVIEWS_KEY, JSON.stringify(reviewsMap));
  } catch (e) {
    console.error('Error saving review', e);
  }

  return newReview;
}

export function getAllReviewsForSpecialist(specialistId: string): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const rawReviews = localStorage.getItem(CUSTOM_REVIEWS_KEY);
    const reviewsMap: Record<string, Review[]> = rawReviews ? JSON.parse(rawReviews) : {};
    const custom = reviewsMap[specialistId] || [];
    const specialist = SEED_SPECIALISTS.find((s) => s.id === specialistId);
    const seed = (specialist?.reviews || []).map((r) => ({ ...r, status: r.status || ('approved' as const) }));
    return [...custom, ...seed];
  } catch {
    return [];
  }
}

export function updateReviewStatus(
  specialistId: string,
  reviewId: string,
  status: 'approved' | 'rejected'
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const rawReviews = localStorage.getItem(CUSTOM_REVIEWS_KEY);
    const reviewsMap: Record<string, Review[]> = rawReviews ? JSON.parse(rawReviews) : {};
    if (reviewsMap[specialistId]) {
      reviewsMap[specialistId] = reviewsMap[specialistId].map((r) =>
        r.id === reviewId ? { ...r, status } : r
      );
      localStorage.setItem(CUSTOM_REVIEWS_KEY, JSON.stringify(reviewsMap));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error updating review status', e);
    return false;
  }
}

export function getStoredLocale(): 'ru' | 'es' | null {
  if (typeof window === 'undefined') return null;
  try {
    return (localStorage.getItem(LOCALE_KEY) as 'ru' | 'es') || null;
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: 'ru' | 'es') {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch (e) {
    console.error('Error saving locale', e);
  }
}

// ---------------------------------------------------------
// Specialist Authentication & Session State Management
// ---------------------------------------------------------

const LOGGED_IN_SPECIALIST_KEY = 'quatroclicks_logged_in_specialist_id';

export function getLoggedInSpecialist(): Specialist | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem(LOGGED_IN_SPECIALIST_KEY) || localStorage.getItem('profiarg_logged_in_specialist_id');
    if (!id) return null;
    const all = getStoredSpecialists();
    return all.find((s) => s.id === id) || null;
  } catch (e) {
    console.error('Error reading logged in specialist from storage', e);
    return null;
  }
}

export function loginSpecialist(id: string): Specialist | null {
  if (typeof window === 'undefined') return null;
  try {
    const all = getStoredSpecialists();
    const found = all.find((s) => s.id === id);
    if (found) {
      localStorage.setItem(LOGGED_IN_SPECIALIST_KEY, id);
      return found;
    }
    return null;
  } catch (e) {
    console.error('Error logging in specialist', e);
    return null;
  }
}

export function loginSpecialistByCredential(credential: string): Specialist | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = credential.trim().toLowerCase();
    if (!q) return null;
    const cleanUsername = q.replace(/^@/, '');
    const digits = q.replace(/\D/g, '');

    const all = getStoredSpecialists();
    const found = all.find((s) => {
      // 1. Check telegram username (with or without @)
      if (s.telegram && s.telegram.toLowerCase().replace(/^@/, '') === cleanUsername) {
        return true;
      }
      // 2. Check WhatsApp / Phone digits (handling Argentine +549, local 15, and subscriber numbers)
      if (s.whatsapp && digits.length >= 6) {
        const waDigits = s.whatsapp.replace(/\D/g, '');
        if (waDigits.endsWith(digits) || digits.endsWith(waDigits)) {
          return true;
        }
        // Match subscriber digits (ignoring local 15 / 11 cellular prefix variations)
        const subDigits = digits.length >= 8 ? digits.slice(-8) : digits;
        if (subDigits.length >= 6 && waDigits.endsWith(subDigits)) {
          return true;
        }
      }
      // 3. Check name match (require at least 3 characters to prevent accidental single-letter hits)
      if (q.length >= 3 && (s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase()))) {
        return true;
      }
      return false;
    });

    if (found) {
      localStorage.setItem(LOGGED_IN_SPECIALIST_KEY, found.id);
      return found;
    }
    return null;
  } catch (e) {
    console.error('Error logging in by credential', e);
    return null;
  }
}

export function logoutSpecialist(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOGGED_IN_SPECIALIST_KEY);
  } catch (e) {
    console.error('Error logging out specialist', e);
  }
}

// ---------------------------------------------------------
// Two-Sided Marketplace: Orders Storage & 1% Commission
// ---------------------------------------------------------

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') {
    return SEED_ORDERS;
  }

  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
      return SEED_ORDERS;
    }
    const parsed: Order[] = JSON.parse(raw);
    return parsed && Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ORDERS;
  } catch (e) {
    console.error('Error reading orders from storage', e);
    return SEED_ORDERS;
  }
}

export function saveCustomOrder(
  orderData: Omit<Order, 'id' | 'status' | 'createdAt'>
): Order {
  const newOrder: Order = {
    ...orderData,
    id: `order-${Date.now()}`,
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return newOrder;

  try {
    const currentOrders = getStoredOrders();
    const updated = [newOrder, ...currentOrders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return newOrder;
  } catch (e) {
    console.error('Error saving order', e);
    return newOrder;
  }
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  specialistId?: string,
  specialistName?: string
): Order | null {
  if (typeof window === 'undefined') return null;

  try {
    const orders = getStoredOrders();
    let updatedOrder: Order | null = null;

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        updatedOrder = {
          ...o,
          status,
          ...(specialistId ? { assignedSpecialistId: specialistId } : {}),
          ...(specialistName ? { assignedSpecialistName: specialistName } : {}),
        };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    }
    return updatedOrder;
  } catch (e) {
    console.error('Error updating order status', e);
    return null;
  }
}

export function completeOrderWithFee(
  orderId: string,
  finalSum: number,
  currency?: 'ARS' | 'USD',
  specialistId?: string,
  specialistName?: string
): { order: Order; commission: number; savedVsProfiRu: number } | null {
  if (typeof window === 'undefined') return null;

  try {
    const orders = getStoredOrders();
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return null;

    // Platform fee is strictly 1%
    const commission = Math.round(finalSum * 0.01 * 100) / 100;
    // 15% traditional platform fee comparison (e.g. Profi.ru)
    const savedVsProfiRu = Math.round(finalSum * 0.14 * 100) / 100;
    const completedAt = new Date().toISOString();
    const resolvedCurrency: 'ARS' | 'USD' = currency || (targetOrder.currency === 'USD' ? 'USD' : 'ARS');

    // Use passed specialist or logged in specialist if available
    const activeSpec = specialistId ? { id: specialistId, name: specialistName } : getLoggedInSpecialist();
    const resolvedSpecId = specialistId || activeSpec?.id || targetOrder.assignedSpecialistId;
    const resolvedSpecName = specialistName || activeSpec?.name || targetOrder.assignedSpecialistName;

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'completed',
      finalSum,
      currency: resolvedCurrency,
      commissionAmount: commission,
      commissionCurrency: resolvedCurrency,
      completedAt,
      ...(resolvedSpecId ? { assignedSpecialistId: resolvedSpecId } : {}),
      ...(resolvedSpecName ? { assignedSpecialistName: resolvedSpecName } : {}),
    };

    const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

    // Update global specialist cabinet balance and metrics
    const cabinetState = getSpecialistCabinetState();
    if (resolvedCurrency === 'USD') {
      cabinetState.totalVolumeUsd = Math.round((cabinetState.totalVolumeUsd + finalSum) * 100) / 100;
      cabinetState.totalCommissionPaidUsd = Math.round((cabinetState.totalCommissionPaidUsd + commission) * 100) / 100;
      cabinetState.savedVsTraditionalUsd = Math.round((cabinetState.savedVsTraditionalUsd + savedVsProfiRu) * 100) / 100;
      cabinetState.balanceUsd = Math.round(Math.max(0, cabinetState.balanceUsd - commission) * 100) / 100;
    } else {
      cabinetState.totalVolumeArs = Math.round((cabinetState.totalVolumeArs + finalSum) * 100) / 100;
      cabinetState.totalCommissionPaidArs = Math.round((cabinetState.totalCommissionPaidArs + commission) * 100) / 100;
      cabinetState.savedVsTraditionalArs = Math.round((cabinetState.savedVsTraditionalArs + savedVsProfiRu) * 100) / 100;
      cabinetState.balanceArs = Math.round(Math.max(0, cabinetState.balanceArs - commission) * 100) / 100;
    }
    cabinetState.completedOrdersCount += 1;
    localStorage.setItem(SPECIALIST_CABINET_KEY, JSON.stringify(cabinetState));

    // Also update per-specialist cabinet state if specialist ID is known
    if (resolvedSpecId) {
      const specState = getSpecialistCabinetState(resolvedSpecId);
      if (resolvedCurrency === 'USD') {
        specState.totalVolumeUsd = Math.round((specState.totalVolumeUsd + finalSum) * 100) / 100;
        specState.totalCommissionPaidUsd = Math.round((specState.totalCommissionPaidUsd + commission) * 100) / 100;
        specState.savedVsTraditionalUsd = Math.round((specState.savedVsTraditionalUsd + savedVsProfiRu) * 100) / 100;
        specState.balanceUsd = Math.round(Math.max(0, specState.balanceUsd - commission) * 100) / 100;
      } else {
        specState.totalVolumeArs = Math.round((specState.totalVolumeArs + finalSum) * 100) / 100;
        specState.totalCommissionPaidArs = Math.round((specState.totalCommissionPaidArs + commission) * 100) / 100;
        specState.savedVsTraditionalArs = Math.round((specState.savedVsTraditionalArs + savedVsProfiRu) * 100) / 100;
        specState.balanceArs = Math.round(Math.max(0, specState.balanceArs - commission) * 100) / 100;
      }
      specState.completedOrdersCount += 1;
      localStorage.setItem(`quatroclicks_specialist_cabinet_${resolvedSpecId}`, JSON.stringify(specState));
    }

    return { order: updatedOrder, commission, savedVsProfiRu };
  } catch (e) {
    console.error('Error completing order with fee', e);
    return null;
  }
}

const DEFAULT_CABINET_STATE: SpecialistCabinetState = {
  balanceArs: 25000,
  balanceUsd: 50,
  totalVolumeArs: 50000,
  totalVolumeUsd: 0,
  totalCommissionPaidArs: 500,
  totalCommissionPaidUsd: 0,
  savedVsTraditionalArs: 7000,
  savedVsTraditionalUsd: 0,
  completedOrdersCount: 1,
};

export function getSpecialistCabinetState(specialistId?: string): SpecialistCabinetState {
  if (typeof window === 'undefined') {
    return DEFAULT_CABINET_STATE;
  }

  try {
    const key = specialistId ? `quatroclicks_specialist_cabinet_${specialistId}` : SPECIALIST_CABINET_KEY;
    const raw = localStorage.getItem(key) || (specialistId ? localStorage.getItem(`profiarg_specialist_cabinet_${specialistId}`) : localStorage.getItem('profiarg_specialist_cabinet'));
    if (!raw) {
      let initial: SpecialistCabinetState = { ...DEFAULT_CABINET_STATE };
      // Spec-3 (Romanov) has seed completed order. For other specialists, start volume/count at 0
      if (specialistId && specialistId !== 'spec-3') {
        initial = {
          ...DEFAULT_CABINET_STATE,
          totalVolumeArs: 0,
          totalVolumeUsd: 0,
          totalCommissionPaidArs: 0,
          totalCommissionPaidUsd: 0,
          savedVsTraditionalArs: 0,
          savedVsTraditionalUsd: 0,
          completedOrdersCount: 0,
        };
      }
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CABINET_STATE,
      ...parsed,
    };
  } catch (e) {
    console.error('Error reading specialist cabinet state', e);
    return DEFAULT_CABINET_STATE;
  }
}

export function topUpSpecialistDeposit(
  amount: number,
  currency: 'ARS' | 'USD',
  _method: 'mercadopago' | 'usdt' | 'rubles_p2p',
  specialistId?: string
): SpecialistCabinetState {
  const current = getSpecialistCabinetState(specialistId);
  const updated: SpecialistCabinetState = {
    ...current,
    ...(currency === 'USD'
      ? { balanceUsd: Math.round((current.balanceUsd + amount) * 100) / 100 }
      : { balanceArs: Math.round((current.balanceArs + amount) * 100) / 100 }),
  };

  if (typeof window !== 'undefined') {
    try {
      const key = specialistId ? `quatroclicks_specialist_cabinet_${specialistId}` : SPECIALIST_CABINET_KEY;
      localStorage.setItem(key, JSON.stringify(updated));

      // Synchronize global key if specialist specific
      if (specialistId) {
        const globalState = getSpecialistCabinetState();
        const globalUpdated: SpecialistCabinetState = {
          ...globalState,
          ...(currency === 'USD'
            ? { balanceUsd: Math.round((globalState.balanceUsd + amount) * 100) / 100 }
            : { balanceArs: Math.round((globalState.balanceArs + amount) * 100) / 100 }),
        };
        localStorage.setItem(SPECIALIST_CABINET_KEY, JSON.stringify(globalUpdated));
      }
    } catch (e) {
      console.error('Error topping up specialist deposit', e);
    }
  }

  return updated;
}

// =========================================================================
// TRACKED DEALS & COMMISSION PIPELINE (Variant A)
// =========================================================================

export function getStoredDeals(): Deal[] {
  if (typeof window === 'undefined') return SEED_DEALS;
  try {
    const raw = localStorage.getItem(DEALS_KEY);
    if (!raw) {
      localStorage.setItem(DEALS_KEY, JSON.stringify(SEED_DEALS));
      return SEED_DEALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading deals from storage', e);
    return SEED_DEALS;
  }
}

export function createTrackedDeal(dealData: {
  specialistId: string;
  specialistName: string;
  specialistPhone: string;
  serviceTitle: string;
  category: any;
  subcategory?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}): Deal {
  const existing = getStoredDeals();
  // Generate random 4-digit unique deal ID: QC-XXXX
  let randomNum = Math.floor(1000 + Math.random() * 9000);
  let id = `QC-${randomNum}`;
  while (existing.some((d) => d.id === id)) {
    randomNum = Math.floor(1000 + Math.random() * 9000);
    id = `QC-${randomNum}`;
  }

  const customer = getCurrentCustomer();

  const newDeal: Deal = {
    id,
    specialistId: dealData.specialistId,
    specialistName: dealData.specialistName,
    specialistPhone: dealData.specialistPhone,
    serviceTitle: dealData.serviceTitle || 'Услуги мастера',
    category: dealData.category,
    subcategory: dealData.subcategory,
    customerId: dealData.customerId || customer?.id || 'guest',
    customerName: dealData.customerName || customer?.name || 'Клиент Quatro Clicks',
    customerPhone: dealData.customerPhone || customer?.whatsapp || '',
    status: 'in_discussion',
    createdAt: new Date().toISOString(),
  };

  const updated = [newDeal, ...existing];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(DEALS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving new deal', e);
    }
  }

  return newDeal;
}

export function updateDealStatus(dealId: string, status: DealStatus): Deal | null {
  const deals = getStoredDeals();
  let target: Deal | null = null;
  const updated = deals.map((d) => {
    if (d.id === dealId) {
      target = { ...d, status };
      return target;
    }
    return d;
  });

  if (typeof window !== 'undefined' && target) {
    try {
      localStorage.setItem(DEALS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating deal status', e);
    }
  }

  return target;
}

export function completeDealWithFee(
  dealId: string,
  finalSum: number,
  currency: 'ARS' | 'USD' = 'ARS'
): Deal | null {
  const deals = getStoredDeals();
  let target: Deal | null = null;
  const commission = Math.round(finalSum * 0.01 * 100) / 100; // 1%

  const updated = deals.map((d) => {
    if (d.id === dealId) {
      target = {
        ...d,
        status: 'completed' as DealStatus,
        amount: finalSum,
        currency,
        commissionAmount: commission,
        completedAt: new Date().toISOString(),
      };
      return target;
    }
    return d;
  });

  if (typeof window !== 'undefined' && target) {
    try {
      localStorage.setItem(DEALS_KEY, JSON.stringify(updated));

      // Deduct fee from specialist deposit
      const specId = (target as Deal).specialistId;
      const cabinetState = getSpecialistCabinetState(specId);
      const newBalanceArs =
        currency === 'ARS'
          ? Math.max(0, cabinetState.balanceArs - commission)
          : cabinetState.balanceArs;
      const newBalanceUsd =
        currency === 'USD'
          ? Math.max(0, cabinetState.balanceUsd - commission)
          : cabinetState.balanceUsd;

      const updatedCabinet: SpecialistCabinetState = {
        ...cabinetState,
        balanceArs: newBalanceArs,
        balanceUsd: newBalanceUsd,
        totalVolumeArs:
          currency === 'ARS' ? cabinetState.totalVolumeArs + finalSum : cabinetState.totalVolumeArs,
        totalVolumeUsd:
          currency === 'USD' ? cabinetState.totalVolumeUsd + finalSum : cabinetState.totalVolumeUsd,
        totalCommissionPaidArs:
          currency === 'ARS'
            ? cabinetState.totalCommissionPaidArs + commission
            : cabinetState.totalCommissionPaidArs,
        totalCommissionPaidUsd:
          currency === 'USD'
            ? cabinetState.totalCommissionPaidUsd + commission
            : cabinetState.totalCommissionPaidUsd,
        completedOrdersCount: cabinetState.completedOrdersCount + 1,
      };

      const key = specId ? `quatroclicks_specialist_cabinet_${specId}` : SPECIALIST_CABINET_KEY;
      localStorage.setItem(key, JSON.stringify(updatedCabinet));
    } catch (e) {
      console.error('Error completing deal', e);
    }
  }

  return target;
}

// =========================================================================
// CUSTOMER ACCOUNT MANAGEMENT
// =========================================================================

export function getCurrentCustomer(): CustomerAccount | null {
  if (typeof window === 'undefined') return DEFAULT_CUSTOMER;
  try {
    const raw = localStorage.getItem(CURRENT_CUSTOMER_KEY);
    if (!raw) {
      localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(DEFAULT_CUSTOMER));
      return DEFAULT_CUSTOMER;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading current customer', e);
    return DEFAULT_CUSTOMER;
  }
}

export function loginCustomer(phoneOrTelegram: string, name?: string): CustomerAccount {
  const current = getCurrentCustomer() || DEFAULT_CUSTOMER;
  const isTg = phoneOrTelegram.startsWith('@') || !phoneOrTelegram.replace(/[^0-9]/g, '');
  const updated: CustomerAccount = {
    ...current,
    id: `cust-${Date.now().toString().slice(-4)}`,
    name: name?.trim() || current.name || 'Пользователь Quatro Clicks',
    phone: isTg ? current.phone : phoneOrTelegram,
    whatsapp: isTg ? current.whatsapp : phoneOrTelegram.replace(/[^0-9]/g, ''),
    telegram: isTg ? phoneOrTelegram.replace('@', '') : current.telegram,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving customer session', e);
    }
  }

  return updated;
}

export function logoutCustomer(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CURRENT_CUSTOMER_KEY);
    } catch (e) {
      console.error('Error logging out customer', e);
    }
  }
}

export function updateCustomerProfile(data: Partial<CustomerAccount>): CustomerAccount {
  const current = getCurrentCustomer() || DEFAULT_CUSTOMER;
  const updated: CustomerAccount = { ...current, ...data };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error updating customer profile', e);
    }
  }
  return updated;
}

// =========================================================================
// MULTI-LISTING: SPECIALIST OFFERINGS ACROSS CATEGORIES
// =========================================================================

export function getSpecialistListings(accountIdOrSpecialistId: string): Specialist[] {
  const all = getStoredSpecialists();
  return all.filter(
    (s) =>
      s.id === accountIdOrSpecialistId ||
      s.accountId === accountIdOrSpecialistId ||
      (s.phone && all.find((m) => m.id === accountIdOrSpecialistId)?.phone === s.phone)
  );
}
