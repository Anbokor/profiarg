'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Specialist, Locale, ViewMode, CategoryId, WorkFormat, Review, Order, OrderStatus, SpecialistCabinetState } from '@/types';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { SpecialistCard } from '@/components/SpecialistCard';
import { LeafletMap } from '@/components/LeafletMap';
import { SpecialistDetailModal } from '@/components/SpecialistDetailModal';
import { AddSpecialistModal } from '@/components/AddSpecialistModal';
import { CreateOrderModal } from '@/components/CreateOrderModal';
import { OrdersBoard } from '@/components/OrdersBoard';
import { SpecialistCabinetModal } from '@/components/SpecialistCabinetModal';
import { StatsBanner } from '@/components/StatsBanner';
import { Footer } from '@/components/Footer';
import { SEED_SPECIALISTS } from '@/data/seedData';
import { SEED_ORDERS } from '@/data/seedOrders';
import {
  getStoredSpecialists,
  saveCustomSpecialist,
  getFavorites,
  toggleFavorite,
  addReviewToSpecialist,
  getStoredLocale,
  setStoredLocale,
  getStoredOrders,
  updateOrderStatus,
  completeOrderWithFee,
  getSpecialistCabinetState,
  topUpSpecialistDeposit,
} from '@/lib/storage';
import { translations } from '@/lib/translations';
import { Frown } from 'lucide-react';

export default function Home() {
  const [locale, setLocaleState] = useState<Locale>('ru');
  const [activeTab, setActiveTab] = useState<'specialists' | 'orders'>('specialists');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [specialists, setSpecialists] = useState<Specialist[]>(SEED_SPECIALISTS);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [cabinetState, setCabinetState] = useState<SpecialistCabinetState>({
    balanceArs: 25000,
    balanceUsd: 50,
    totalVolumeArs: 50000,
    totalVolumeUsd: 0,
    totalCommissionPaidArs: 500,
    totalCommissionPaidUsd: 0,
    savedVsTraditionalArs: 7000,
    savedVsTraditionalUsd: 0,
    completedOrdersCount: 1,
  });
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
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const savedLocale = getStoredLocale();
    if (savedLocale) setLocaleState(savedLocale);

    setSpecialists(getStoredSpecialists());
    setOrders(getStoredOrders());
    setCabinetState(getSpecialistCabinetState());
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
    const updated = getStoredSpecialists();
    setSpecialists(updated);

    if (activeSpecialist?.id === specialistId) {
      const refreshedActive = updated.find((s) => s.id === specialistId) || null;
      setActiveSpecialist(refreshedActive);
    }
  };

  const handleToggleCategory = (cat: CategoryId | 'all') => {
    setSelectedCategory((prev) => (cat === 'all' ? 'all' : prev === cat ? 'all' : cat));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBarrio('all');
    setSelectedFormat('all');
    setVerifiedOnly(false);
    setFavoritesOnly(false);
  };

  // Orders Management Handlers
  const handleOrderCreated = (_newOrder: Order) => {
    const freshOrders = getStoredOrders();
    setOrders(freshOrders);
    setActiveTab('orders');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    setOrders(getStoredOrders());
  };

  const handleOpenCompleteDeal = (order: Order) => {
    setOrderToComplete(order);
    setIsCabinetModalOpen(true);
  };

  const handleCompleteOrder = (orderId: string, finalSum: number, currency?: 'ARS' | 'USD') => {
    completeOrderWithFee(orderId, finalSum, currency);
    setOrders(getStoredOrders());
    setCabinetState(getSpecialistCabinetState());
  };

  const handleTopUpDeposit = (
    amount: number,
    currency: 'ARS' | 'USD',
    method: 'mercadopago' | 'usdt' | 'rubles_p2p'
  ) => {
    const updated = topUpSpecialistDeposit(amount, currency, method);
    setCabinetState(updated);
  };

  // Filtered and Sorted Specialists
  const filteredSpecialists = useMemo(() => {
    return specialists
      .filter((s) => {
        if (favoritesOnly && !favorites.includes(s.id)) return false;
        if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
        if (selectedBarrio !== 'all' && s.barrio !== selectedBarrio) return false;
        if (selectedFormat !== 'all' && !s.formats.includes(selectedFormat)) return false;
        if (verifiedOnly && !s.isVerified) return false;

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
  const openOrdersCount = orders.filter((o) => o.status === 'open').length;

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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openOrdersCount={openOrdersCount}
        onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
        onOpenCabinet={() => setIsCabinetModalOpen(true)}
      />

      {/* Hero Search & Category Pills */}
      <HeroSection
        locale={locale}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleToggleCategory}
        totalSpecialists={specialists.length}
        onReset={handleResetFilters}
        onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
      />

      {/* Main Content: Orders Board or Specialists Directory */}
      {activeTab === 'orders' ? (
        <main className="flex-1">
          <OrdersBoard
            orders={orders}
            locale={locale}
            onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
            onOpenCabinet={() => setIsCabinetModalOpen(true)}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenCompleteDeal={handleOpenCompleteDeal}
          />
        </main>
      ) : (
        <>
          {/* Filters & Results Counter Bar */}
          <FilterBar
            locale={locale}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleToggleCategory}
            selectedBarrio={selectedBarrio}
            setSelectedBarrio={setSelectedBarrio}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            favoritesOnly={favoritesOnly}
            setFavoritesOnly={setFavoritesOnly}
            favoritesCount={favorites.length}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalFiltered={filteredSpecialists.length}
            onReset={handleResetFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
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
        </>
      )}

      {/* Footer */}
      <Footer
        locale={locale}
        onSelectCategory={(catId) => {
          handleToggleCategory(catId);
          setActiveTab('specialists');
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
        onSelectBarrio={(barrioName) => {
          setSelectedBarrio(barrioName);
          setActiveTab('specialists');
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

      {/* Create Order Modal Form */}
      <CreateOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
        locale={locale}
        onOrderCreated={handleOrderCreated}
      />

      {/* Specialist Cabinet & 1% Commission Modal */}
      <SpecialistCabinetModal
        isOpen={isCabinetModalOpen}
        onClose={() => {
          setIsCabinetModalOpen(false);
          setOrderToComplete(null);
        }}
        locale={locale}
        orders={orders}
        cabinetState={cabinetState}
        initialOrderToComplete={orderToComplete}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onCompleteOrderWithFee={handleCompleteOrder}
        onTopUpDeposit={handleTopUpDeposit}
      />
    </div>
  );
}
