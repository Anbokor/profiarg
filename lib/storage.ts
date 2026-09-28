import { Specialist, Review } from '@/types';
import { SEED_SPECIALISTS } from '@/data/seedData';

const CUSTOM_SPECIALISTS_KEY = 'profiarg_custom_specialists';
const FAVORITES_KEY = 'profiarg_favorites';
const CUSTOM_REVIEWS_KEY = 'profiarg_custom_reviews';
const LOCALE_KEY = 'profiarg_locale';

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
