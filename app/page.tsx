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
import { Footer } from '@/components/Footer';
import { CategoryDirectory } from '@/components/CategoryDirectory';
import { CategoryDrilldownHeader } from '@/components/CategoryDrilldownHeader';
import { CATEGORIES } from '@/data/categories';
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
  getLoggedInSpecialist,
  loginSpecialist,
  logoutSpecialist,
} from '@/lib/storage';
import { translations } from '@/lib/translations';
import { Frown, ArrowLeft, Search, X } from 'lucide-react';

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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');
  const [showCategoryMap, setShowCategoryMap] = useState<boolean>(false);
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
  const [loggedInSpecialist, setLoggedInSpecialist] = useState<Specialist | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const savedLocale = getStoredLocale();
    if (savedLocale) setLocaleState(savedLocale);

    setSpecialists(getStoredSpecialists());
    setOrders(getStoredOrders());
    setFavorites(getFavorites());

    const activeSpec = getLoggedInSpecialist();
    if (activeSpec) {
      setLoggedInSpecialist(activeSpec);
      setCabinetState(getSpecialistCabinetState(activeSpec.id));
    } else {
      setCabinetState(getSpecialistCabinetState());
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    setFavorites(updated);
  };

  const handleLoginSpecialist = (spec: Specialist) => {
    loginSpecialist(spec.id);
    setLoggedInSpecialist(spec);
    setCabinetState(getSpecialistCabinetState(spec.id));
  };

  const handleLogoutSpecialist = () => {
    logoutSpecialist();
    setLoggedInSpecialist(null);
    setCabinetState(getSpecialistCabinetState());
  };

  const handleAddSpecialist = (newSpec: Specialist) => {
    const updated = saveCustomSpecialist(newSpec);
    setSpecialists(updated);
    setFocusedSpecialist(newSpec);
    handleLoginSpecialist(newSpec);
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

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setShowCategoryMap(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroup(groupId);
    setSelectedSubcategory('all');
    setShowCategoryMap(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSubcategory = (catId: CategoryId, subcategory: string) => {
    setSelectedCategory(catId);
    const catObj = CATEGORIES.find((c) => c.id === catId);
    const matchingGroup = catObj?.groups?.find((g) =>
      g.items.some((item) => item.toLowerCase() === subcategory.toLowerCase())
    );
    if (matchingGroup) {
      setSelectedGroup(matchingGroup.id);
    }
    setSelectedSubcategory(subcategory);
    setShowCategoryMap(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleCategory = (cat: CategoryId | 'all') => {
    if (cat === 'all') {
      handleBackToCategories();
    } else {
      handleSelectCategory(cat);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setShowCategoryMap(false);
    setSelectedBarrio('all');
    setSelectedFormat('all');
    setVerifiedOnly(false);
    setFavoritesOnly(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory('all');
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setShowCategoryMap(false);
    setSearchQuery('');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setShowCategoryMap(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToSubsections = () => {
    setSelectedSubcategory('all');
    setShowCategoryMap(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const handleUpdateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    specialistId?: string,
    specialistName?: string
  ) => {
    const specId = specialistId || loggedInSpecialist?.id;
    const specName = specialistName || loggedInSpecialist?.name;
    updateOrderStatus(
      orderId,
      status,
      status === 'in_progress' ? specId : undefined,
      status === 'in_progress' ? specName : undefined
    );
    setOrders(getStoredOrders());
  };

  const handleOpenCompleteDeal = (order: Order) => {
    setOrderToComplete(order);
    setIsCabinetModalOpen(true);
  };

  const handleCompleteOrder = (
    orderId: string,
    finalSum: number,
    currency?: 'ARS' | 'USD',
    specialistId?: string,
    specialistName?: string
  ) => {
    const specId = specialistId || loggedInSpecialist?.id;
    const specName = specialistName || loggedInSpecialist?.name;
    completeOrderWithFee(orderId, finalSum, currency, specId, specName);
    setOrders(getStoredOrders());
    setCabinetState(getSpecialistCabinetState(specId));
  };

  const handleTopUpDeposit = (
    amount: number,
    currency: 'ARS' | 'USD',
    method: 'mercadopago' | 'usdt' | 'rubles_p2p',
    specialistId?: string
  ) => {
    const specId = specialistId || loggedInSpecialist?.id;
    const updated = topUpSpecialistDeposit(amount, currency, method, specId);
    setCabinetState(updated);
  };

  // Filtered and Sorted Specialists
  const filteredSpecialists = useMemo(() => {
    return specialists
      .filter((s) => {
        if (favoritesOnly && !favorites.includes(s.id)) return false;
        if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
        if (selectedSubcategory !== 'all') {
          const subLower = selectedSubcategory.toLowerCase();
          const hasSub = (s.subcategories || []).some(
            (sub) =>
              sub.toLowerCase() === subLower ||
              sub.toLowerCase().includes(subLower) ||
              subLower.includes(sub.toLowerCase())
          );
          const hasService = (s.services || []).some(
            (srv) =>
              srv.title_ru.toLowerCase().includes(subLower) ||
              srv.title_es.toLowerCase().includes(subLower)
          );
          if (!hasSub && !hasService) return false;
        }
        if (selectedBarrio !== 'all' && s.barrio !== selectedBarrio) return false;
        if (selectedFormat !== 'all' && !s.formats.includes(selectedFormat)) return false;
        if (verifiedOnly && !s.isVerified) return false;

        if (searchQuery.trim()) {
          const queryWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
          const categoryObj = CATEGORIES.find((c) => c.id === s.category);
          const searchableText = [
            s.name,
            s.title_ru,
            s.title_es,
            s.barrio,
            s.description_ru,
            s.description_es,
            categoryObj ? `${categoryObj.title_ru} ${categoryObj.title_es}` : '',
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
    selectedSubcategory,
    selectedBarrio,
    selectedFormat,
    verifiedOnly,
    searchQuery,
    sortBy,
  ]);

  const t = translations[locale];
  const openOrdersCount = orders.filter((o) => o.status === 'open').length;
  const activeCategory =
    selectedCategory !== 'all' ? CATEGORIES.find((c) => c.id === selectedCategory) || null : null;

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
        loggedInSpecialist={loggedInSpecialist}
        onLogoutSpecialist={handleLogoutSpecialist}
        onGoHome={handleBackToCategories}
      />

      {/* Main Content: Orders Board, Root Category Directory, or Category Drill-down */}
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
      ) : selectedCategory === 'all' && !searchQuery.trim() ? (
        /* ================= ROOT STATE (Главная страница по умолчанию) ================= */
        /* Extremely concise, clean, and uncluttered.
           - Top: Clean header with logo, mission statement banner, and quick search.
           - Main Body: ТОЛЬКО 14 КАТЕГОРИЙ! (Элегантная сетка 14 карточек с иконками, заголовками и краткими подкатегориями).
           - НИКАКОЙ КАРТЫ на главной странице! Карта не грузится и не показывается на главной.
           - НИКАКОГО общего списка всех специалистов вперемешку на главной! */
        <main className="flex-1">
          {/* Top: Clean mission statement banner and quick search */}
          <HeroSection
            locale={locale}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleToggleCategory}
            totalSpecialists={specialists.length}
            onReset={handleResetFilters}
            onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
            showCategoryPills={false}
          />

          {/* Main Body: ТОЛЬКО 14 КАТЕГОРИЙ! */}
          <CategoryDirectory
            locale={locale}
            specialists={specialists}
            selectedCategory="all"
            selectedGroup={null}
            onSelectCategory={handleSelectCategory}
            onSelectSubcategory={handleSelectSubcategory}
          />
        </main>
      ) : (!showCategoryMap && selectedSubcategory === 'all' && !searchQuery.trim()) ? (
        /* ================= LEVEL 2 & LEVEL 3: GROUPS & SUBSECTIONS ================= */
        /* Разделение на Материалы / работы и подразделы. Без карты и без шума. */
        <main className="flex-1">
          <CategoryDirectory
            locale={locale}
            specialists={specialists}
            selectedCategory={selectedCategory}
            selectedGroup={selectedGroup}
            onSelectCategory={handleSelectCategory}
            onSelectGroup={handleSelectGroup}
            onSelectSubcategory={handleSelectSubcategory}
            onBackToCategories={handleBackToCategories}
            onBackToGroups={handleBackToGroups}
            onViewAllOnMap={() => setShowCategoryMap(true)}
          />
        </main>
      ) : (
        /* ================= DRILL-DOWN STATE & SEARCH RESULTS ================= */
        /* При клике на любую из 14 категорий (selectedCategory !== 'all') или поиске:
           - Появляется кнопка возврата: «← Все категории» ("← Todas las categorías").
           - Появляется горизонтальная полоса подкатегорий с возможностью кликабельной фильтрации.
           - И ТОЛЬКО ЗДЕСЬ появляется интерактивная карта и список проверенных контрагентов этой категории!
           - Здесь доступны фильтры по районам (Palermo, Recoleta...), формату работы (выезд, офис, онлайн) и режимы (Сплит / Карта / Список). */
        <div className="flex-1 flex flex-col">
          {activeCategory ? (
            <CategoryDrilldownHeader
              locale={locale}
              category={activeCategory}
              selectedGroup={selectedGroup}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={(sub) => {
                setSelectedSubcategory(sub);
                setShowCategoryMap(true);
              }}
              onBackToCategories={handleBackToCategories}
              onBackToGroups={handleBackToGroups}
              onBackToSubsections={selectedGroup ? handleBackToSubsections : undefined}
              specialistsCount={filteredSpecialists.length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
            />
          ) : (
            /* Search across categories banner */
            <div className="bg-gradient-to-b from-sky-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToCategories}
                    className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>{t.backToCategories.replace(/^[←\s]+/, '')}</span>
                  </button>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {t.searchResultsFor}: <span className="text-sky-600 dark:text-sky-400">«{searchQuery}»</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {filteredSpecialists.length} {t.resultsFound}
                    </p>
                  </div>
                </div>

                {/* Quick Search Modification & Reset */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Search className="h-4 w-4 text-sky-600" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="block w-full rounded-xl border-0 py-2 pl-9 pr-9 text-xs sm:text-sm text-slate-900 shadow-xs ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 dark:bg-slate-800 dark:text-white dark:ring-slate-700 transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        aria-label={locale === 'ru' ? 'Очистить поиск' : 'Borrar búsqueda'}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 transition whitespace-nowrap cursor-pointer"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters & Results Counter Bar (Only shown when category or search is active) */}
          <FilterBar
            locale={locale}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleToggleCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
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

          {/* Main Content Area based on ViewMode: Split, Catalog, or Map */}
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

                  {/* Right Column: Sticky Map (ONLY in Drill-down!) */}
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
        </div>
      )}

      {/* Footer */}
      <Footer
        locale={locale}
        setLocale={handleSetLocale}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setSelectedSubcategory('all');
          setSearchQuery('');
          setActiveTab('specialists');
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onNavigateToCatalog={() => {
          handleBackToCategories();
          setActiveTab('specialists');
        }}
        onNavigateToOrders={() => {
          setActiveTab('orders');
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenCreateOrder={() => setIsCreateOrderModalOpen(true)}
        onOpenCabinet={() => setIsCabinetModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
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

      {/* Specialist Cabinet Modal */}
      <SpecialistCabinetModal
        isOpen={isCabinetModalOpen}
        onClose={() => {
          setIsCabinetModalOpen(false);
          setOrderToComplete(null);
        }}
        locale={locale}
        orders={orders}
        specialists={specialists}
        cabinetState={cabinetState}
        initialOrderToComplete={orderToComplete}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onCompleteOrderWithFee={handleCompleteOrder}
        onTopUpDeposit={handleTopUpDeposit}
        onOpenAddSpecialist={() => setIsAddModalOpen(true)}
        onNavigateToOrders={() => setActiveTab('orders')}
        loggedInSpecialist={loggedInSpecialist}
        onLoginSpecialist={handleLoginSpecialist}
        onLogoutSpecialist={handleLogoutSpecialist}
      />
    </div>
  );
}
