import { Specialist, Review, Order, OrderStatus, SpecialistCabinetState } from '@/types';
import { SEED_SPECIALISTS } from '@/data/seedData';
import { SEED_ORDERS } from '@/data/seedOrders';

const CUSTOM_SPECIALISTS_KEY = 'quatroclicks_custom_specialists';
const FAVORITES_KEY = 'quatroclicks_favorites';
const CUSTOM_REVIEWS_KEY = 'quatroclicks_custom_reviews';
const LOCALE_KEY = 'quatroclicks_locale';
const ORDERS_KEY = 'quatroclicks_orders_list';
const SPECIALIST_CABINET_KEY = 'quatroclicks_specialist_cabinet';

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

    // Merge any stored custom reviews
    return all.map((s) => {
      const extraReviews = reviewsMap[s.id];
      if (extraReviews && extraReviews.length > 0) {
        const existingIds = new Set((s.reviews || []).map((r) => r.id));
        const newReviewsToAdd = extraReviews.filter((r) => !existingIds.has(r.id));
        if (newReviewsToAdd.length === 0) return s;

        const combinedReviews = [...newReviewsToAdd, ...(s.reviews || [])];
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
