'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Locale, Order, SpecialistCabinetState, Specialist, OrderStatus } from '@/types';
import { translations } from '@/lib/translations';
import { CATEGORIES } from '@/data/categories';
import {
  getStoredSpecialists,
  loginSpecialist,
  loginSpecialistByCredential,
  logoutSpecialist,
  getLoggedInSpecialist,
} from '@/lib/storage';
import {
  X,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles,
  CreditCard,
  Building,
  Coins,
  AlertTriangle,
  LogOut,
  UserPlus,
  Phone,
  Send,
  MapPin,
  Star,
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

interface SpecialistCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  orders: Order[];
  specialists?: Specialist[];
  cabinetState: SpecialistCabinetState;
  initialOrderToComplete?: Order | null;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, specialistId?: string, specialistName?: string) => void;
  onCompleteOrderWithFee: (orderId: string, finalSum: number, currency?: 'ARS' | 'USD', specialistId?: string, specialistName?: string) => void;
  onTopUpDeposit: (amount: number, currency: 'ARS' | 'USD', method: 'mercadopago' | 'usdt' | 'rubles_p2p', specialistId?: string) => void;
  onOpenAddSpecialist?: () => void;
  onNavigateToOrders?: () => void;
  loggedInSpecialist?: Specialist | null;
  onLoginSpecialist?: (specialist: Specialist) => void;
  onLogoutSpecialist?: () => void;
}

export const SpecialistCabinetModal: React.FC<SpecialistCabinetModalProps> = ({
  isOpen,
  onClose,
  locale,
  orders,
  specialists: propSpecialists,
  cabinetState,
  initialOrderToComplete,
  onUpdateOrderStatus,
  onCompleteOrderWithFee,
  onTopUpDeposit,
  onOpenAddSpecialist,
  onNavigateToOrders,
  loggedInSpecialist: propLoggedInSpecialist,
  onLoginSpecialist,
  onLogoutSpecialist,
}) => {
  const t = translations[locale];

  // Internal auth state if not controlled externally
  const [internalSpecialist, setInternalSpecialist] = useState<Specialist | null>(null);
  const [credentialInput, setCredentialInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Top-Up states
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpMethod, setTopUpMethod] = useState<'mercadopago' | 'usdt' | 'rubles_p2p'>('mercadopago');
  const [topUpCurrency, setTopUpCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [topUpAmount, setTopUpAmount] = useState<string>('25000');
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Complete deal modal states
  const [orderToComplete, setOrderToComplete] = useState<Order | null>(null);
  const [completionCurrency, setCompletionCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [finalSumInput, setFinalSumInput] = useState<string>('');
  const [completeSuccess, setCompleteSuccess] = useState(false);

  // Available specialists for demo quick-login
  const availableSpecialists = useMemo(() => {
    if (propSpecialists && propSpecialists.length > 0) return propSpecialists;
    return getStoredSpecialists();
  }, [propSpecialists]);

  // Sync session on mount/open
  useEffect(() => {
    if (isOpen) {
      const active = propLoggedInSpecialist ?? getLoggedInSpecialist();
      setInternalSpecialist(active);
      setAuthError('');
    }
  }, [isOpen, propLoggedInSpecialist]);

  const activeSpecialist = propLoggedInSpecialist !== undefined ? propLoggedInSpecialist : internalSpecialist;

  const handleOpenComplete = React.useCallback((order: Order) => {
    setOrderToComplete(order);
    const curr = order.currency === 'USD' ? 'USD' : 'ARS';
    setCompletionCurrency(curr);
    setFinalSumInput(order.budget ? order.budget.toString() : (curr === 'USD' ? '100' : '50000'));
    setCompleteSuccess(false);
  }, []);

  useEffect(() => {
    if (initialOrderToComplete && isOpen) {
      handleOpenComplete(initialOrderToComplete);
    }
  }, [initialOrderToComplete, isOpen, handleOpenComplete]);

  if (!isOpen) return null;

  // Filter orders relevant to logged-in specialist or open tasks
  const inProgressOrders = orders.filter((o) => {
    if (o.status !== 'in_progress') return false;
    if (!activeSpecialist) return true;
    return !o.assignedSpecialistId || o.assignedSpecialistId === activeSpecialist.id;
  });

  const completedOrders = orders.filter((o) => {
    if (o.status !== 'completed') return false;
    if (!activeSpecialist) return true;
    return !o.assignedSpecialistId || o.assignedSpecialistId === activeSpecialist.id;
  });

  // Login handler
  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!credentialInput.trim()) return;

    const logged = loginSpecialistByCredential(credentialInput);
    if (logged) {
      setInternalSpecialist(logged);
      if (onLoginSpecialist) onLoginSpecialist(logged);
      setCredentialInput('');
    } else {
      setAuthError(t.cabinetAuthUserNotFound);
    }
  };

  const handleSelectDemoSpecialist = (spec: Specialist) => {
    loginSpecialist(spec.id);
    setInternalSpecialist(spec);
    if (onLoginSpecialist) onLoginSpecialist(spec);
    setAuthError('');
  };

  const handleLogout = () => {
    logoutSpecialist();
    setInternalSpecialist(null);
    if (onLogoutSpecialist) onLogoutSpecialist();
    setOrderToComplete(null);
    setShowTopUp(false);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    onTopUpDeposit(amount, topUpCurrency, topUpMethod, activeSpecialist?.id);
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setShowTopUp(false);
    }, 1200);
  };

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToComplete) return;
    const finalSum = parseFloat(finalSumInput);
    if (isNaN(finalSum) || finalSum <= 0) return;

    onCompleteOrderWithFee(
      orderToComplete.id,
      finalSum,
      completionCurrency,
      activeSpecialist?.id,
      activeSpecialist?.name
    );
    setCompleteSuccess(true);
    setTimeout(() => {
      setCompleteSuccess(false);
      setOrderToComplete(null);
    }, 1200);
  };

  const finalSumNum = parseFloat(finalSumInput) || 0;
  // Strictly calculated 1% service maintenance fee
  const simulatedCommission = Math.round(finalSumNum * 0.01 * 100) / 100;

  const specialistCategory = activeSpecialist
    ? CATEGORIES.find((c) => c.id === activeSpecialist.category)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4.5 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-sky-500 text-white shadow-md">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {activeSpecialist ? t.cabinetTitle : t.cabinetAuthTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {activeSpecialist ? t.cabinetSubtitle : t.cabinetAuthSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
            aria-label={t.modalClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CASE 1: UNAUTHENTICATED SPECIALIST SCREEN (Auth Gate & Quick Demo Selection) */}
        {/* ========================================================================= */}
        {!activeSpecialist ? (
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Phone/WhatsApp/Telegram Login Form */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/60 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.cabinetAuthContactLabel}
                </h3>
              </div>

              {authError && (
                <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleCredentialLogin} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={credentialInput}
                    onChange={(e) => {
                      setCredentialInput(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder={t.cabinetAuthContactPlaceholder}
                    className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-sky-500 active:scale-95 transition whitespace-nowrap"
                >
                  {t.cabinetAuthLoginBtn}
                </button>
              </form>
            </div>

            {/* Quick Demo Access Grid (Select registered specialist) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.cabinetAuthQuickDemoTitle}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {locale === 'ru' ? 'Мгновенный вход в 1 клик' : 'Acceso en 1 clic'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.cabinetAuthQuickDemoDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {availableSpecialists.slice(0, 8).map((spec) => {
                  const specCat = CATEGORIES.find((c) => c.id === spec.category);
                  const roleName = specCat ? (locale === 'ru' ? specCat.title_ru : specCat.title_es) : (locale === 'ru' ? spec.title_ru : spec.title_es);
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => handleSelectDemoSpecialist(spec)}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-400 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-sky-600 dark:hover:bg-slate-800 transition text-left group shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={spec.avatar}
                          alt={spec.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                              {t.cabinetAuthLoginAs} {spec.name} ({roleName})
                            </span>
                            {spec.isVerified && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {locale === 'ru' ? spec.title_ru : spec.title_es}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {spec.barrio}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registration CTA for new specialists */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 to-white p-4.5 dark:border-emerald-900 dark:bg-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t.cabinetAuthNoAccount}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {locale === 'ru'
                      ? 'Создайте анкету и получайте заказы с прямым контактом в WhatsApp'
                      : 'Publicá tu perfil y recibí solicitudes de clientes directamente por WhatsApp'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAddSpecialist) onOpenAddSpecialist();
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 shadow-md active:scale-95 transition whitespace-nowrap"
              >
                {t.cabinetAuthRegisterBtn}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE 2: AUTHENTICATED SPECIALIST CABINET (Clean Portal — Stripe/MercadoPago) */
          /* ========================================================================= */
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Authenticated Profile Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-sky-50/40 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={activeSpecialist.avatar}
                  alt={activeSpecialist.name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {activeSpecialist.name}
                    </h3>
                    {activeSpecialist.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t.verifiedBadge}</span>
                      </span>
                    )}
                    {specialistCategory && (
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: specialistCategory.pinBg || '#0284c7' }}
                      >
                        {locale === 'ru' ? specialistCategory.title_ru : specialistCategory.title_es}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                    {locale === 'ru' ? activeSpecialist.title_ru : activeSpecialist.title_es}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-sky-600" />
                      <span>{activeSpecialist.barrio}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{activeSpecialist.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal">({activeSpecialist.reviewsCount})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs self-end sm:self-auto shrink-0"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-500" />
                <span>{t.cabinetLogoutBtn}</span>
              </button>
            </div>

            {/* 4 Clean Business Cards (Stripe / MercadoPago style) */}
            {(() => {
              const computedVolumeArs = completedOrders
                .filter((o) => (o.commissionCurrency || o.currency) !== 'USD')
                .reduce((sum, o) => sum + (o.finalSum || o.budget || 0), 0);
              const computedVolumeUsd = completedOrders
                .filter((o) => (o.commissionCurrency || o.currency) === 'USD')
                .reduce((sum, o) => sum + (o.finalSum || o.budget || 0), 0);
              const displayCompletedCount = activeSpecialist ? completedOrders.length : cabinetState.completedOrdersCount;
              const displayVolumeArs = activeSpecialist
                ? (completedOrders.length > 0 ? computedVolumeArs : (cabinetState.totalVolumeArs || 0))
                : cabinetState.totalVolumeArs;
              const displayVolumeUsd = activeSpecialist
                ? (completedOrders.length > 0 ? computedVolumeUsd : (cabinetState.totalVolumeUsd || 0))
                : cabinetState.totalVolumeUsd;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Deposit Balance */}
                  <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 to-white p-4.5 dark:border-sky-900 dark:bg-slate-800/80 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-900 dark:text-sky-200">
                        {t.cabinetDepositBalance}
                      </span>
                      <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {cabinetState.balanceArs.toLocaleString('es-AR')}{' '}
                        <span className="text-xs font-bold text-slate-500">ARS</span>
                      </div>
                      {cabinetState.balanceUsd > 0 && (
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          + ${cabinetState.balanceUsd} USD
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTopUp(!showTopUp)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 dark:text-sky-400 hover:underline"
                    >
                      <span>{showTopUp ? t.cabinetHideTopUp : `+ ${t.cabinetTopUpBtn}`}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Card 2: Completed Orders */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {t.cabinetCompletedOrders}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {displayCompletedCount}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {locale === 'ru' ? 'успешных сделок' : 'trabajos completados'}
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Total Revenue / Volume */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {t.cabinetClosedVolume}
                      </span>
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {displayVolumeArs.toLocaleString('es-AR')}{' '}
                        <span className="text-xs font-bold text-slate-500">ARS</span>
                      </div>
                      {displayVolumeUsd > 0 && (
                        <div className="text-xs font-medium text-slate-500 mt-0.5">
                          + ${displayVolumeUsd} USD
                        </div>
                      )}
                      <div className="text-[11px] text-slate-500 mt-1">
                        {locale === 'ru' ? 'общий объём закрытых оплат' : 'facturación total acumulada'}
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Active Orders */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {t.cabinetActiveOrders}
                      </span>
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="mt-2">
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {inProgressOrders.length}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {locale === 'ru' ? 'в процессе выполнения' : 'en curso actualmente'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Low Deposit Alert (if balance is below 500 ARS and 5 USD) */}
            {cabinetState.balanceArs < 500 && cabinetState.balanceUsd < 5 && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-4 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <span>{t.depositLowAlert}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTopUp(true)}
                  className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 transition"
                >
                  {t.cabinetTopUpBtn}
                </button>
              </div>
            )}

            {/* Top-Up Drawer (Conditional) */}
            {showTopUp && (
              <div className="rounded-2xl border-2 border-sky-300 bg-sky-50/40 p-5 dark:border-sky-800 dark:bg-slate-800/90 animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t.cabinetTopUpTitle}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">{t.cabinetInstantSimulation}</span>
                </div>

                {topUpSuccess && (
                  <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-3 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t.topUpSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                  {/* Method selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {locale === 'ru' ? 'Способ пополнения' : 'Método de pago'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTopUpMethod('mercadopago');
                          setTopUpCurrency('ARS');
                          setTopUpAmount('25000');
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                          topUpMethod === 'mercadopago'
                            ? 'border-sky-600 bg-white text-sky-700 shadow-xs dark:bg-slate-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                            : 'border-slate-200 bg-white/60 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Building className="h-4 w-4 text-sky-600" />
                        <span>{t.topUpMercadoPago}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTopUpMethod('usdt');
                          setTopUpCurrency('USD');
                          setTopUpAmount('25');
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                          topUpMethod === 'usdt'
                            ? 'border-emerald-600 bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white/60 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <Coins className="h-4 w-4 text-emerald-600" />
                        <span>{t.topUpUsdt}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTopUpMethod('rubles_p2p');
                          setTopUpCurrency('ARS');
                          setTopUpAmount('50000');
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                          topUpMethod === 'rubles_p2p'
                            ? 'border-amber-600 bg-white text-amber-700 shadow-xs dark:bg-slate-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                            : 'border-slate-200 bg-white/60 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <CreditCard className="h-4 w-4 text-amber-600" />
                        <span>{t.topUpRubles}</span>
                      </button>
                    </div>
                  </div>

                  {/* Amount presets & input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t.topUpAmountLabel} ({topUpCurrency})
                      </label>
                      <div className="flex gap-1">
                        {topUpCurrency === 'ARS' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setTopUpAmount('10000')}
                              className="px-2 py-0.5 text-[11px] rounded-md bg-white border border-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            >
                              10.000
                            </button>
                            <button
                              type="button"
                              onClick={() => setTopUpAmount('25000')}
                              className="px-2 py-0.5 text-[11px] rounded-md bg-white border border-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            >
                              25.000
                            </button>
                            <button
                              type="button"
                              onClick={() => setTopUpAmount('50000')}
                              className="px-2 py-0.5 text-[11px] rounded-md bg-white border border-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            >
                              50.000
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setTopUpAmount('20')}
                              className="px-2 py-0.5 text-[11px] rounded-md bg-white border border-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            >
                              $20
                            </button>
                            <button
                              type="button"
                              onClick={() => setTopUpAmount('50')}
                              className="px-2 py-0.5 text-[11px] rounded-md bg-white border border-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                            >
                              $50
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      required
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTopUp(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                    >
                      {t.formCancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-sky-600 text-xs font-bold text-white hover:bg-sky-500 shadow-md transition"
                    >
                      {t.topUpConfirmBtn}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Deal Completion Sub-Modal / Modal Screen (Where fee is mentioned strictly by the point!) */}
            {orderToComplete && (
              <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 p-5 dark:border-emerald-800 dark:bg-slate-800/90 animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {t.completeDealModalTitle}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {orderToComplete.title} ({orderToComplete.barrio})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderToComplete(null)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {completeSuccess ? (
                  <div className="rounded-xl bg-emerald-100 border border-emerald-300 p-4 text-center text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>{t.dealCompleteSuccess}</span>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmCompletion} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {t.completeDealFinalSumLabel}
                        </label>
                        <div className="flex rounded-xl border border-slate-300 p-0.5 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setCompletionCurrency('ARS');
                              if (!orderToComplete.budget) setFinalSumInput('50000');
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              completionCurrency === 'ARS'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            ARS ($)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCompletionCurrency('USD');
                              if (!orderToComplete.budget) setFinalSumInput('100');
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              completionCurrency === 'USD'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            USD (US$)
                          </button>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="1"
                        required
                        value={finalSumInput}
                        onChange={(e) => setFinalSumInput(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    {/* Clean business breakdown: strictly by the point, no promotional comparison spam */}
                    <div className="rounded-xl bg-white p-4 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>{locale === 'ru' ? 'Сумма сделки:' : 'Monto de la operación:'}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {finalSumNum.toLocaleString('es-AR')} {completionCurrency}
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-700 pt-2">
                        <span>{t.completeDealFeeNotice}</span>
                        <span className="text-sm font-black text-sky-700 dark:text-sky-300">
                          {simulatedCommission.toLocaleString('es-AR')} {completionCurrency}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderToComplete(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                      >
                        {t.formCancel}
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
                      >
                        {t.confirmCompletionBtn}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Section: Orders in Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{t.cabinetActiveJobs}</span>
                  <span className="rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.2">
                    {inProgressOrders.length}
                  </span>
                </h3>
              </div>

              {inProgressOrders.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden">
                  {inProgressOrders.map((ord) => (
                    <div key={ord.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {ord.title}
                          </span>
                          <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold">
                            {t.orderStatusInProgress}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ord.barrio} • {t.orderClientLabel}: {ord.contactName} ({ord.contactValue})
                        </p>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                          {t.filterBudget}: {ord.budget ? `${ord.budget.toLocaleString('es-AR')} ${ord.currency}` : t.budgetNegotiable}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(ord.id, 'open')}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        >
                          <span>{t.orderCancelJobBtn}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenComplete(ord)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{t.orderCompleteJobBtn}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500 space-y-2">
                  <p>{t.cabinetNoActiveJobs}</p>
                  {onNavigateToOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToOrders();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:underline"
                    >
                      <span>{t.cabinetGoToBoard}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Section: Completed Orders Statement History (Where fee is mentioned strictly by the point!) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t.cabinetCompletedHistory}</span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2 py-0.2">
                  {completedOrders.length}
                </span>
              </h3>

              {completedOrders.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden">
                  {completedOrders.map((ord) => {
                    const feeAmount = ord.commissionAmount || (ord.finalSum ? Math.round(ord.finalSum * 0.01 * 100) / 100 : 500);
                    return (
                      <div key={ord.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {ord.title}
                            </span>
                            <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold">
                              {t.orderStatusCompleted}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {ord.barrio} • {ord.completedAt ? new Date(ord.completedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'es-AR') : (locale === 'ru' ? 'Недавно' : 'Reciente')}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-slate-900 dark:text-white">
                            {ord.finalSum?.toLocaleString('es-AR') || ord.budget?.toLocaleString('es-AR')}{' '}
                            {ord.commissionCurrency || ord.currency}
                          </div>
                          {/* Strictly by the point statement line item */}
                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {t.cabinetTransactionFeeLine} #{ord.id} (1%): -{feeAmount.toLocaleString('es-AR')}{' '}
                            {ord.commissionCurrency || ord.currency}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                  {t.cabinetNoCompletedJobs}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {locale === 'ru'
              ? 'Quatro Clicks — платформа для профессионалов и бизнеса в Аргентине'
              : 'Quatro Clicks — plataforma para profesionales y empresas en Argentina'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            {t.modalClose}
          </button>
        </div>
      </div>
    </div>
  );
};
