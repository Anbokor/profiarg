import { Specialist, Review, Order, OrderStatus, SpecialistCabinetState } from '@/types';
import { SEED_SPECIALISTS } from '@/data/seedData';
import { SEED_ORDERS } from '@/data/seedOrders';

const CUSTOM_SPECIALISTS_KEY = 'profiarg_custom_specialists';
const FAVORITES_KEY = 'profiarg_favorites';
const CUSTOM_REVIEWS_KEY = 'profiarg_custom_reviews';
const LOCALE_KEY = 'profiarg_locale';
const ORDERS_KEY = 'profiarg_orders_list';
const SPECIALIST_CABINET_KEY = 'profiarg_specialist_cabinet';

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

    const updatedOrder: Order = {
      ...targetOrder,
      status: 'completed',
      finalSum,
      currency: resolvedCurrency,
      commissionAmount: commission,
      commissionCurrency: resolvedCurrency,
      completedAt,
      ...(specialistId ? { assignedSpecialistId: specialistId } : {}),
      ...(specialistName ? { assignedSpecialistName: specialistName } : {}),
    };

    const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

    // Update specialist cabinet balance and metrics
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

export function getSpecialistCabinetState(): SpecialistCabinetState {
  if (typeof window === 'undefined') {
    return DEFAULT_CABINET_STATE;
  }

  try {
    const raw = localStorage.getItem(SPECIALIST_CABINET_KEY);
    if (!raw) {
      localStorage.setItem(SPECIALIST_CABINET_KEY, JSON.stringify(DEFAULT_CABINET_STATE));
      return DEFAULT_CABINET_STATE;
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
  _method: 'mercadopago' | 'usdt' | 'rubles_p2p'
): SpecialistCabinetState {
  const current = getSpecialistCabinetState();
  const updated: SpecialistCabinetState = {
    ...current,
    ...(currency === 'USD'
      ? { balanceUsd: Math.round((current.balanceUsd + amount) * 100) / 100 }
      : { balanceArs: Math.round((current.balanceArs + amount) * 100) / 100 }),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SPECIALIST_CABINET_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error topping up specialist deposit', e);
    }
  }

  return updated;
}
