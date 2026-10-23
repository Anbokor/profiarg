'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Specialist, Locale, CategoryId, Review, Order, OrderStatus, SpecialistCabinetState } from '@/types';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { SpecialistCard } from '@/components/SpecialistCard';
import { SpecialistDetailModal } from '@/components/SpecialistDetailModal';
import { AddSpecialistModal } from '@/components/AddSpecialistModal';
import { SpecialistCabinetModal } from '@/components/SpecialistCabinetModal';
import { CustomerCabinetModal } from '@/components/CustomerCabinetModal';
import { Footer } from '@/components/Footer';
import { CategoryDirectory } from '@/components/CategoryDirectory';
import { CategoryDrilldownHeader } from '@/components/CategoryDrilldownHeader';
import { CATEGORIES } from '@/data/categories';
import { SEED_SPECIALISTS } from '@/data/seedData';
import { SEED_ORDERS } from '@/data/seedOrders';

const LeafletMap = dynamic(
  () => import('@/components/LeafletMap').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Загрузка интерактивной карты...</span>
        </div>
      </div>
    ),
  }
);
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
  getStoredDeals,
  createTrackedDeal,
  completeDealWithFee,
  getCurrentCustomer,
  updateCustomerProfile,
} from '@/lib/storage';
import { buildWhatsAppUrl, getSpecialistDisplayName } from '@/lib/utils';
import { Deal, CustomerAccount } from '@/types';
import { translations } from '@/lib/translations';
import { Frown, ArrowLeft, Search, X, MapPin } from 'lucide-react';

export default function Home() {
  const [locale, setLocaleState] = useState<Locale>('ru');
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

  // Filter & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');
  const [showCategoryMap, setShowCategoryMap] = useState<boolean>(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // Modal States
  const [activeSpecialist, setActiveSpecialist] = useState<Specialist | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [reviewDealId, setReviewDealId] = useState<string | null>(null);
  const [reviewInitialTab, setReviewInitialTab] = useState<'overview' | 'reviews'>('overview');
  const [focusedSpecialist, setFocusedSpecialist] = useState<Specialist | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialAddCategory, setInitialAddCategory] = useState<CategoryId | undefined>(undefined);
  const [initialAddSubcategory, setInitialAddSubcategory] = useState<string | undefined>(undefined);
  const [isCabinetModalOpen, setIsCabinetModalOpen] = useState(false);
  const [isCustomerCabinetOpen, setIsCustomerCabinetOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerAccount | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
  const [loggedInSpecialist, setLoggedInSpecialist] = useState<Specialist | null>(null);

  // Load stored state on mount
  useEffect(() => {
    const savedLocale = getStoredLocale();
    if (savedLocale) setLocaleState(savedLocale);

    setSpecialists(getStoredSpecialists());
    setOrders(getStoredOrders());
    setFavorites(getFavorites());
    setCurrentCustomer(getCurrentCustomer());
    setDeals(getStoredDeals());

    const activeSpec = getLoggedInSpecialist();
    if (activeSpec) {
      setLoggedInSpecialist(activeSpec);
      setCabinetState(getSpecialistCabinetState(activeSpec.id));
    } else {
      setCabinetState(getSpecialistCabinetState());
    }

    // Restore deep-link navigation state from URL query parameters
    if (typeof window !== 'undefined' && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get('cat') as CategoryId;
      const grpParam = urlParams.get('group');
      const subParam = urlParams.get('sub');
      const qParam = urlParams.get('q');
      const specIdParam = urlParams.get('specialist');
      const reviewDealParam = urlParams.get('reviewDeal');

      if (catParam) setSelectedCategory(catParam);
      if (grpParam) setSelectedGroup(grpParam);
      if (subParam) setSelectedSubcategory(subParam);
      if (qParam) setSearchQuery(qParam);
      if (reviewDealParam) {
        setReviewDealId(reviewDealParam);
        setReviewInitialTab('reviews');
      }
      if (specIdParam) {
        const found = getStoredSpecialists().find((s) => s.id === specIdParam || s.slug === specIdParam);
        if (found) setActiveSpecialist(found);
      }
    }
  }, []);

  // Helper to build URL query string and push history state for browser back/forward
  const pushNavState = (params: {
    category?: CategoryId | 'all';
    group?: string | null;
    subcategory?: string | 'all';
    specialistId?: string | null;
    q?: string;
  }) => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams();
    const cat = params.category !== undefined ? params.category : selectedCategory;
    const grp = params.group !== undefined ? params.group : selectedGroup;
    const sub = params.subcategory !== undefined ? params.subcategory : selectedSubcategory;
    const specId = params.specialistId !== undefined ? params.specialistId : activeSpecialist?.id;
    const query = params.q !== undefined ? params.q : searchQuery;

    if (cat && cat !== 'all') urlParams.set('cat', cat);
    if (grp) urlParams.set('group', grp);
    if (sub && sub !== 'all') urlParams.set('sub', sub);
    if (specId) urlParams.set('specialist', specId);
    if (query && query.trim()) urlParams.set('q', query.trim());

    const qs = urlParams.toString();
    const newUrl = qs ? `?${qs}` : window.location.pathname;

    if (window.location.search !== (qs ? `?${qs}` : '')) {
      window.history.pushState({ cat, grp, sub, specId, query }, '', newUrl);
    }
  };

  // Native browser Back / Forward (popstate) listener
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = (urlParams.get('cat') as CategoryId) || 'all';
      const grpParam = urlParams.get('group') || null;
      const subParam = urlParams.get('sub') || 'all';
      const specIdParam = urlParams.get('specialist');
      const qParam = urlParams.get('q') || '';
      const reviewDealParam = urlParams.get('reviewDeal');

      setSelectedCategory(catParam);
      setSelectedGroup(grpParam);
      setSelectedSubcategory(subParam);
      setSearchQuery(qParam);
      setReviewDealId(reviewDealParam);
      if (reviewDealParam) setReviewInitialTab('reviews');

      if (specIdParam) {
        const found = getStoredSpecialists().find((s) => s.id === specIdParam || s.slug === specIdParam) || null;
        setActiveSpecialist(found);
      } else {
        setActiveSpecialist(null);
        setActivePhoto(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  const handleOpenSpecialist = (spec: Specialist) => {
    setActiveSpecialist(spec);
    setFocusedSpecialist(spec);
    setActivePhoto(null);
    pushNavState({ specialistId: spec.id });
  };

  const handleOpenSpecialistPhoto = (spec: Specialist, photoUrl: string) => {
    setActiveSpecialist(spec);
    setFocusedSpecialist(spec);
    setActivePhoto(photoUrl);
    pushNavState({ specialistId: spec.id });
  };

  const handleCloseSpecialist = () => {
    setActiveSpecialist(null);
    setActivePhoto(null);
    setReviewDealId(null);
    setReviewInitialTab('overview');
    if (typeof window !== 'undefined' && window.history.state?.specId) {
      window.history.back();
    } else {
      pushNavState({ specialistId: null });
    }
  };

  const handleInitiateDeal = (specialist: Specialist, serviceTitle?: string) => {
    const newDeal = createTrackedDeal({
      specialistId: specialist.id,
      specialistName: specialist.name,
      specialistPhone: specialist.whatsapp || specialist.phone || '',
      serviceTitle: serviceTitle || specialist.title_ru,
      category: specialist.category,
      subcategory: specialist.subcategories?.[0],
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      customerPhone: currentCustomer?.phone,
    });

    setDeals(getStoredDeals());

    const displayName = getSpecialistDisplayName(specialist, locale);
    const waUrl = buildWhatsAppUrl(
      specialist.whatsapp,
      displayName,
      locale,
      newDeal.id,
      serviceTitle || specialist.title_ru
    );

    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCompleteDeal = (dealId: string, finalSum: number, currency: 'ARS' | 'USD') => {
    completeDealWithFee(dealId, finalSum, currency);
    setDeals(getStoredDeals());
    if (loggedInSpecialist) {
      setCabinetState(getSpecialistCabinetState(loggedInSpecialist.id));
    } else {
      setCabinetState(getSpecialistCabinetState());
    }
  };

  const handleOpenReviewForDeal = (deal: Deal) => {
    setIsCustomerCabinetOpen(false);
    const found = specialists.find((s) => s.id === deal.specialistId);
    if (found) {
      setActiveSpecialist(found);
      setReviewDealId(deal.id);
      setReviewInitialTab('reviews');
      pushNavState({ specialistId: found.id });
    }
  };

  const handleUpdateCustomer = (data: Partial<CustomerAccount>) => {
    const updated = updateCustomerProfile(data);
    setCurrentCustomer(updated);
  };

  const handleAddServiceInCategory = (catId: CategoryId, sub?: string) => {
    setInitialAddCategory(catId);
    setInitialAddSubcategory(sub);
    setIsAddModalOpen(true);
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    setShowCategoryMap(false);
    pushNavState({ category: catId, group: null, subcategory: 'all', specialistId: null });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroup(groupId);
    setSelectedSubcategory('all');
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    setShowCategoryMap(false);
    pushNavState({ group: groupId, subcategory: 'all', specialistId: null });
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
    const grpId = matchingGroup ? matchingGroup.id : selectedGroup;
    if (matchingGroup) {
      setSelectedGroup(matchingGroup.id);
    }
    setSelectedSubcategory(subcategory);
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    pushNavState({ category: catId, group: grpId, subcategory, specialistId: null });
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
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    setShowCategoryMap(false);
    setFavoritesOnly(false);
    pushNavState({ category: 'all', group: null, subcategory: 'all', specialistId: null, q: '' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory('all');
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    setShowCategoryMap(false);
    setSearchQuery('');
    pushNavState({ category: 'all', group: null, subcategory: 'all', specialistId: null, q: '' });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSelectedSubcategory('all');
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    setShowCategoryMap(false);
    pushNavState({ group: null, subcategory: 'all', specialistId: null });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToSubsections = () => {
    setSelectedSubcategory('all');
    setFocusedSpecialist(null);
    setActiveSpecialist(null);
    setShowCategoryMap(false);
    pushNavState({ subcategory: 'all', specialistId: null });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Specialist Cabinet Handlers
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

  // Filtered Specialists: High-performance 3-level hierarchical category matching + keyword search
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

        if (searchQuery.trim()) {
          const queryWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
          const categoryObj = CATEGORIES.find((c) => c.id === s.category);
          const searchableText = [
            s.name,
            s.name_es || '',
            s.companyName || '',
            s.companyName_es || '',
            s.contractorId || '',
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
      .sort((a, b) => b.rating - a.rating);
  }, [
    specialists,
    favorites,
    favoritesOnly,
    selectedCategory,
    selectedSubcategory,
    searchQuery,
  ]);

  // Guard: if focusedSpecialist does not belong to currently filtered specialists, reset focus
  useEffect(() => {
    if (focusedSpecialist && !filteredSpecialists.some((s) => s.id === focusedSpecialist.id)) {
      setFocusedSpecialist(null);
    }
  }, [filteredSpecialists, focusedSpecialist]);

  const t = translations[locale];
  const activeCategory =
    selectedCategory !== 'all' ? CATEGORIES.find((c) => c.id === selectedCategory) || null : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#D7DADC] dark:bg-slate-950">
      {/* Navigation Header */}
      <Navbar
        locale={locale}
        setLocale={handleSetLocale}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        favoritesCount={favorites.length}
        favoritesOnly={favoritesOnly}
        setFavoritesOnly={setFavoritesOnly}
        onOpenCabinet={() => setIsCabinetModalOpen(true)}
        onOpenCustomerCabinet={() => setIsCustomerCabinetOpen(true)}
        activeDealsCount={deals.filter((d) => d.status !== 'completed').length}
        loggedInSpecialist={loggedInSpecialist}
        onLogoutSpecialist={handleLogoutSpecialist}
        onGoHome={handleBackToCategories}
      />

      {/* Main Content: Root Category Directory or Category Drill-down */}
      {selectedCategory === 'all' && !searchQuery.trim() ? (
        /* ================= ROOT STATE (Главная страница по умолчанию) ================= */
        /* Extremely concise, clean, and uncluttered.
           - Top: Clean header with logo, mission statement banner, and quick search.
           - Main Body: ТОЛЬКО 14 КАТЕГОРИЙ в один столбец!
           - НИКАКОЙ КАРТЫ на главной странице!
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
            showCategoryPills={false}
            onSelectSpecialist={handleOpenSpecialist}
            specialists={specialists}
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
      ) : (selectedSubcategory === 'all' && !searchQuery.trim()) ? (
        /* ================= LEVEL 2 & LEVEL 3: GROUPS & SUBSECTIONS ================= */
        /* Разделение на Материалы / работы и подразделы в один столбец. Без карты и без шума. */
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
          />
        </main>
      ) : (
        /* ================= DRILL-DOWN STATE & SEARCH RESULTS ================= */
        /* При клике на подраздел или поиске:
           - Появляется навигация возврата: «← Все категории» / «← Назад».
           - Появляется компактная горизонтальная полоса подкатегорий.
           - Кнопка «Показать на карте» для открытия компактной карты по требованию.
           - Единый просторный столбец карточек специалистов без цен, с крупными шрифтами и фото. */
        <div className="flex-1 flex flex-col">
          {activeCategory ? (
            <CategoryDrilldownHeader
              locale={locale}
              category={activeCategory}
              selectedGroup={selectedGroup}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={(sub) => {
                handleSelectSubcategory(activeCategory.id, sub);
              }}
              onBackToCategories={handleBackToCategories}
              onBackToGroups={handleBackToGroups}
              onBackToSubsections={selectedGroup ? handleBackToSubsections : undefined}
              specialistsCount={filteredSpecialists.length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddServiceInCategory={() =>
                handleAddServiceInCategory(
                  activeCategory.id,
                  selectedSubcategory !== 'all' ? selectedSubcategory : undefined
                )
              }
            />
          ) : (
            /* Search across categories banner */
            <div className="bg-gradient-to-b from-sky-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBackToCategories}
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-red-500 hover:border-red-600 bg-white dark:bg-slate-800 px-4 py-2 text-xs sm:text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-950/40 shadow-xs transition-all active:scale-95 cursor-pointer ring-2 ring-red-500/20 shrink-0"
                    title={locale === 'ru' ? 'Назад к разделам' : 'Volver al catálogo'}
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5] text-red-600 dark:text-red-400" />
                    <span>{locale === 'ru' ? 'Назад' : 'Volver'}</span>
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

          {/* Main Content Area: Single Spacious Column for Specialist Cards */}
          <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Action Bar: Count and Toggle Map Button */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {locale === 'ru' ? 'Специалисты' : 'Especialistas'} ({filteredSpecialists.length})
              </span>

              {filteredSpecialists.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowCategoryMap(!showCategoryMap)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>
                    {showCategoryMap
                      ? (locale === 'ru' ? 'Скрыть карту' : 'Ocultar mapa')
                      : (locale === 'ru' ? '🗺️ Показать на карте' : '🗺️ Ver en el mapa')}
                  </span>
                </button>
              )}
            </div>

            {/* Compact Map (Reduced vertical height, opened by button) */}
            {showCategoryMap && filteredSpecialists.length > 0 && (
              <div className="relative isolate z-0 h-64 sm:h-72 w-full rounded-2xl mb-6 shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                <LeafletMap
                  specialists={filteredSpecialists}
                  locale={locale}
                  selectedSpecialist={activeSpecialist || focusedSpecialist}
                  onSelectSpecialist={(spec) => {
                    setFocusedSpecialist(spec);
                    handleOpenSpecialist(spec);
                  }}
                  onFocusSpecialist={(spec) => {
                    setFocusedSpecialist(spec);
                  }}
                  className="h-full w-full rounded-none border-0"
                />
              </div>
            )}

            {/* Specialist Cards: Single Column, Large, Readable, Without Prices */}
            {filteredSpecialists.length > 0 ? (
              <div className="space-y-4">
                {filteredSpecialists.map((specialist) => (
                  <SpecialistCard
                    key={specialist.id}
                    specialist={specialist}
                    locale={locale}
                    onSelect={(spec) => {
                      setFocusedSpecialist(spec);
                      handleOpenSpecialist(spec);
                    }}
                    onSelectPhoto={handleOpenSpecialistPhoto}
                    onFocusMap={(spec) => {
                      setFocusedSpecialist(spec);
                      setShowCategoryMap(true);
                      if (typeof window !== 'undefined') {
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }
                    }}
                    onInitiateDeal={handleInitiateDeal}
                    isFavorite={favorites.includes(specialist.id)}
                    onToggleFavorite={handleToggleFavorite}
                    isSelected={(activeSpecialist?.id || focusedSpecialist?.id) === specialist.id}
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
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 cursor-pointer"
                >
                  {t.resetFilters}
                </button>
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
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onNavigateToCatalog={() => {
          handleBackToCategories();
        }}
        onOpenCabinet={() => setIsCabinetModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Specialist Details Full Modal */}
      <SpecialistDetailModal
        specialist={activeSpecialist}
        locale={locale}
        onClose={handleCloseSpecialist}
        isFavorite={activeSpecialist ? favorites.includes(activeSpecialist.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onAddReview={handleAddReview}
        initialTab={reviewInitialTab}
        dealId={reviewDealId}
        initialPhoto={activePhoto}
        onClearPhoto={() => setActivePhoto(null)}
        onFocusMap={(spec) => {
          handleCloseSpecialist();
          setFocusedSpecialist(spec);
          setShowCategoryMap(true);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 180, behavior: 'smooth' });
          }
        }}
        onInitiateDeal={handleInitiateDeal}
      />

      {/* Add Specialist Modal Form */}
      <AddSpecialistModal
        isOpen={isAddModalOpen}
        locale={locale}
        onClose={() => {
          setIsAddModalOpen(false);
          setInitialAddCategory(undefined);
          setInitialAddSubcategory(undefined);
        }}
        onSave={handleAddSpecialist}
        initialCategory={initialAddCategory}
        initialSubcategory={initialAddSubcategory}
        loggedInSpecialist={loggedInSpecialist}
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
        loggedInSpecialist={loggedInSpecialist}
        onLoginSpecialist={handleLoginSpecialist}
        onLogoutSpecialist={handleLogoutSpecialist}
        onSwitchToCustomer={() => {
          setIsCabinetModalOpen(false);
          setIsCustomerCabinetOpen(true);
        }}
      />

      {/* Customer Cabinet Modal */}
      <CustomerCabinetModal
        isOpen={isCustomerCabinetOpen}
        onClose={() => setIsCustomerCabinetOpen(false)}
        locale={locale}
        deals={deals}
        favorites={favorites}
        specialists={specialists}
        currentCustomer={currentCustomer}
        onUpdateCustomer={handleUpdateCustomer}
        onCompleteDeal={handleCompleteDeal}
        onOpenReviewForDeal={handleOpenReviewForDeal}
        onSelectSpecialist={(spec) => {
          setIsCustomerCabinetOpen(false);
          handleOpenSpecialist(spec);
        }}
        onToggleFavorite={handleToggleFavorite}
        onSwitchToSpecialist={() => {
          setIsCustomerCabinetOpen(false);
          setIsCabinetModalOpen(true);
        }}
      />
    </div>
  );
}
