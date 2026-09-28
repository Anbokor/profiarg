'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Specialist, Locale, ViewMode, CategoryId, WorkFormat, Review } from '@/types';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { SpecialistCard } from '@/components/SpecialistCard';
import { LeafletMap } from '@/components/LeafletMap';
import { SpecialistDetailModal } from '@/components/SpecialistDetailModal';
import { AddSpecialistModal } from '@/components/AddSpecialistModal';
import { StatsBanner } from '@/components/StatsBanner';
import { Footer } from '@/components/Footer';
import { SEED_SPECIALISTS } from '@/data/seedData';
import {
  getStoredSpecialists,
  saveCustomSpecialist,
  getFavorites,
  toggleFavorite,
  addReviewToSpecialist,
  getStoredLocale,
  setStoredLocale,
} from '@/lib/storage';
import { translations } from '@/lib/translations';
import { Frown } from 'lucide-react';

export default function Home() {
  const [locale, setLocaleState] = useState<Locale>('ru');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [specialists, setSpecialists] = useState<Specialist[]>(SEED_SPECIALISTS);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedBarrio, setSelectedBarrio] = useState<string | 'all'>('all');
  const [selectedFormat, setSelectedFormat] = useState<WorkFormat | 'all'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');

  // Modal States
  const [activeSpecialist, setActiveSpecialist] = useState<Specialist | null>(null);
  const [focusedSpecialist, setFocusedSpecialist] = useState<Specialist | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load stored state on mount
  useEffect(() => {
    const savedLocale = getStoredLocale();
    if (savedLocale) setLocaleState(savedLocale);

    setSpecialists(getStoredSpecialists());
    setFavorites(getFavorites());
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    setFavorites(updated);
  };

  const handleAddSpecialist = (newSpec: Specialist) => {
    const updated = saveCustomSpecialist(newSpec);
    setSpecialists(updated);
    setFocusedSpecialist(newSpec);
  };

  const handleAddReview = (specialistId: string, review: Omit<Review, 'id' | 'date'>) => {
    addReviewToSpecialist(specialistId, review);
    // Reload from storage so both custom reviews and in-memory state are 100% synchronized
    const updated = getStoredSpecialists();
    setSpecialists(updated);

    // Update active modal specialist if open
    if (activeSpecialist?.id === specialistId) {
      const refreshedActive = updated.find((s) => s.id === specialistId) || null;
      setActiveSpecialist(refreshedActive);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBarrio('all');
    setSelectedFormat('all');
    setVerifiedOnly(false);
    setFavoritesOnly(false);
  };

  // Filtered and Sorted Specialists
  const filteredSpecialists = useMemo(() => {
    return specialists
      .filter((s) => {
        // Favorites filter
        if (favoritesOnly && !favorites.includes(s.id)) return false;

        // Category filter
        if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;

        // Barrio filter
        if (selectedBarrio !== 'all' && s.barrio !== selectedBarrio) return false;

        // Work format filter
        if (selectedFormat !== 'all' && !s.formats.includes(selectedFormat)) return false;

        // Verified filter
        if (verifiedOnly && !s.isVerified) return false;

        // Search query filter (multi-word token search)
        if (searchQuery.trim()) {
          const queryWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
          const searchableText = [
            s.name,
            s.title_ru,
            s.title_es,
            s.barrio,
            s.description_ru,
            s.description_es,
            ...(s.subcategories || []),
            ...(s.services || []).map((srv) => `${srv.title_ru} ${srv.title_es}`),
          ]
            .join(' ')
            .toLowerCase();

          const matchesAllWords = queryWords.every((word) => searchableText.includes(word));
          if (!matchesAllWords) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [
    specialists,
    favorites,
    favoritesOnly,
    selectedCategory,
    selectedBarrio,
    selectedFormat,
    verifiedOnly,
    searchQuery,
    sortBy,
  ]);

  const t = translations[locale];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Navigation Header */}
      <Navbar
        locale={locale}
        setLocale={handleSetLocale}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        favoritesCount={favorites.length}
        favoritesOnly={favoritesOnly}
        setFavoritesOnly={setFavoritesOnly}
      />

      {/* Hero Search & Category Pills */}
      <HeroSection
        locale={locale}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalSpecialists={specialists.length}
      />

      {/* Filters & Results Counter Bar */}
      <FilterBar
        locale={locale}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedBarrio={selectedBarrio}
        setSelectedBarrio={setSelectedBarrio}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalFiltered={filteredSpecialists.length}
        onReset={handleResetFilters}
      />

      {/* Main Content Area based on ViewMode */}
      <main className="flex-1">
        {/* MODE 1: Split View (Catalog on left, Sticky Map on right) */}
        {viewMode === 'split' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Specialist Cards List */}
              <div className="lg:col-span-6 xl:col-span-5 space-y-4">
                {filteredSpecialists.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSpecialists.map((specialist) => (
                      <SpecialistCard
                        key={specialist.id}
                        specialist={specialist}
                        locale={locale}
                        onSelect={(spec) => setActiveSpecialist(spec)}
                        onFocusMap={(spec) => {
                          setFocusedSpecialist(spec);
                          // On mobile, scroll up to map if visible
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        isFavorite={favorites.includes(specialist.id)}
                        onToggleFavorite={handleToggleFavorite}
                        isSelected={focusedSpecialist?.id === specialist.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center bg-white dark:bg-slate-900">
                    <Frown className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                      {favoritesOnly
                        ? locale === 'ru'
                          ? 'В избранном пока ничего нет. Нажмите сердечко на карточке любого специалиста, чтобы добавить его сюда.'
                          : 'Aún no tenés favoritos guardados. Tocá el corazón en cualquier tarjeta para guardarlo.'
                        : t.noResults}
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300"
                    >
                      {t.resetFilters}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Map */}
              <div className="lg:col-span-6 xl:col-span-7">
                <div className="sticky top-20 h-[calc(100vh-6.5rem)] min-h-[500px] w-full rounded-2xl shadow-sm overflow-hidden">
                  <LeafletMap
                    specialists={filteredSpecialists}
                    locale={locale}
                    selectedSpecialist={focusedSpecialist}
                    onSelectSpecialist={(spec) => {
                      setFocusedSpecialist(spec);
                      setActiveSpecialist(spec);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: Pure Catalog Grid View */}
        {viewMode === 'catalog' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {filteredSpecialists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpecialists.map((specialist) => (
                  <SpecialistCard
                    key={specialist.id}
                    specialist={specialist}
                    locale={locale}
                    onSelect={(spec) => setActiveSpecialist(spec)}
                    onFocusMap={(spec) => {
                      setFocusedSpecialist(spec);
                      setViewMode('split');
                    }}
                    isFavorite={favorites.includes(specialist.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 max-w-lg mx-auto my-12">
                <Frown className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                  {favoritesOnly
                    ? locale === 'ru'
                      ? 'В избранном пока ничего нет. Нажмите сердечко на карточке любого специалиста, чтобы добавить его сюда.'
                      : 'Aún no tenés favoritos guardados. Tocá el corazón en cualquier tarjeta para guardarlo.'
                    : t.noResults}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300"
                >
                  {t.resetFilters}
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: Pure Map Fullscreen View */}
        {viewMode === 'map' && (
          <div className="relative h-[calc(100vh-8rem)] w-full">
            <LeafletMap
              specialists={filteredSpecialists}
              locale={locale}
              selectedSpecialist={focusedSpecialist}
              onSelectSpecialist={(spec) => {
                setFocusedSpecialist(spec);
              }}
              className="h-full w-full rounded-none border-0"
            />

            {/* Floating Specialist Card Preview at Bottom of Map */}
            {focusedSpecialist && (
              <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 animate-slide-up">
                <div className="shadow-2xl rounded-2xl">
                  <SpecialistCard
                    specialist={focusedSpecialist}
                    locale={locale}
                    onSelect={(spec) => setActiveSpecialist(spec)}
                    isFavorite={favorites.includes(focusedSpecialist.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Stats Banner */}
      <StatsBanner locale={locale} totalSpecialists={specialists.length} />

      {/* Footer */}
      <Footer
        locale={locale}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
        onSelectBarrio={(barrioName) => {
          setSelectedBarrio(barrioName);
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
      />

      {/* Specialist Details Full Modal */}
      <SpecialistDetailModal
        specialist={activeSpecialist}
        locale={locale}
        onClose={() => setActiveSpecialist(null)}
        isFavorite={activeSpecialist ? favorites.includes(activeSpecialist.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddReview={handleAddReview}
      />

      {/* Add Specialist Modal Form */}
      <AddSpecialistModal
        isOpen={isAddModalOpen}
        locale={locale}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSpecialist}
      />
    </div>
  );
}
