'use client';

import React, { useState } from 'react';
import { Locale, Order, SpecialistCabinetState, Currency } from '@/types';
import { translations } from '@/lib/translations';
import {
  X,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Percent,
  PiggyBank,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  CreditCard,
  Building,
  Coins,
  AlertTriangle,
} from 'lucide-react';

interface SpecialistCabinetModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  orders: Order[];
  cabinetState: SpecialistCabinetState;
  initialOrderToComplete?: Order | null;
  onUpdateOrderStatus: (orderId: string, status: 'open' | 'in_progress' | 'completed' | 'cancelled') => void;
  onCompleteOrderWithFee: (orderId: string, finalSum: number, currency?: 'ARS' | 'USD') => void;
  onTopUpDeposit: (amount: number, currency: 'ARS' | 'USD', method: 'mercadopago' | 'usdt' | 'rubles_p2p') => void;
}

export const SpecialistCabinetModal: React.FC<SpecialistCabinetModalProps> = ({
  isOpen,
  onClose,
  locale,
  orders,
  cabinetState,
  initialOrderToComplete,
  onUpdateOrderStatus,
  onCompleteOrderWithFee,
  onTopUpDeposit,
}) => {
  const t = translations[locale];

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

  const handleOpenComplete = React.useCallback((order: Order) => {
    setOrderToComplete(order);
    const curr = order.currency === 'USD' ? 'USD' : 'ARS';
    setCompletionCurrency(curr);
    setFinalSumInput(order.budget ? order.budget.toString() : (curr === 'USD' ? '100' : '50000'));
    setCompleteSuccess(false);
  }, []);

  React.useEffect(() => {
    if (initialOrderToComplete && isOpen) {
      handleOpenComplete(initialOrderToComplete);
    }
  }, [initialOrderToComplete, isOpen, handleOpenComplete]);

  if (!isOpen) return null;

  const inProgressOrders = orders.filter((o) => o.status === 'in_progress');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    onTopUpDeposit(amount, topUpCurrency, topUpMethod);
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

    onCompleteOrderWithFee(orderToComplete.id, finalSum, completionCurrency);
    setCompleteSuccess(true);
    setTimeout(() => {
      setCompleteSuccess(false);
      setOrderToComplete(null);
    }, 1200);
  };

  const finalSumNum = parseFloat(finalSumInput) || 0;
  const simulatedCommission = Math.round(finalSumNum * 0.01 * 100) / 100;
  const simulatedTraditionalFee = Math.round(finalSumNum * 0.15 * 100) / 100;
  const simulatedSavings = Math.round(finalSumNum * 0.14 * 100) / 100;

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
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 px-6 py-4.5 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-md">
                <Percent className="h-4.5 w-4.5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t.cabinetTitle}</span>
                  <span className="rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 text-xs font-extrabold px-2.5 py-0.5 border border-sky-300 dark:border-sky-700">
                    1% FEE
                  </span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {t.cabinetSubtitle}
                </p>
              </div>
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

        {/* Modal Content Scrollable Area */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Metrics Grid */}
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
                  {cabinetState.balanceArs.toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
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

            {/* Card 2: Total Volume */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t.cabinetClosedVolume}
                </span>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {cabinetState.totalVolumeArs.toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
                </div>
                {cabinetState.totalVolumeUsd > 0 && (
                  <div className="text-xs font-medium text-slate-500 mt-0.5">
                    + ${cabinetState.totalVolumeUsd} USD
                  </div>
                )}
                <div className="text-[11px] text-slate-500 mt-1">
                  {cabinetState.completedOrdersCount} {locale === 'ru' ? 'сделок закрыто' : 'trabajos cerrados'}
                </div>
              </div>
            </div>

            {/* Card 3: Paid 1% Commission (Dual Currency ARS & USD) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4.5 dark:border-slate-800 dark:bg-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {t.cabinetCommissionPaid}
                </span>
                <Percent className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {cabinetState.totalCommissionPaidArs.toLocaleString('es-AR')} <span className="text-xs font-bold text-slate-500">ARS</span>
                </div>
                {cabinetState.totalCommissionPaidUsd > 0 && (
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    + ${cabinetState.totalCommissionPaidUsd} USD
                  </div>
                )}
                <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 mt-1">
                  {t.cabinetFeeNote}
                </div>
              </div>
            </div>

            {/* Card 4: Savings vs 15% (Profi.ru) (Dual Currency ARS & USD) */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white p-4.5 dark:border-emerald-900 dark:bg-slate-800/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  {t.cabinetSavedVs15}
                </span>
                <PiggyBank className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  +{cabinetState.savedVsTraditionalArs.toLocaleString('es-AR')} <span className="text-xs font-bold">ARS</span>
                </div>
                {cabinetState.savedVsTraditionalUsd > 0 && (
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    + ${cabinetState.savedVsTraditionalUsd} USD
                  </div>
                )}
                <div className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">
                  <Sparkles className="h-3 w-3" />
                  <span>{locale === 'ru' ? 'В 15 раз выгоднее!' : '¡15x más económico!'}</span>
                </div>
              </div>
            </div>
          </div>

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

          {/* Deal Completion Sub-Modal / Modal Screen */}
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

                  {/* 1% Fee Transparency Breakdown */}
                  <div className="rounded-xl bg-white p-3.5 border border-emerald-200 dark:bg-slate-800 dark:border-emerald-900 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{t.completeDealFeeNotice}</span>
                      <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300">
                        {simulatedCommission.toLocaleString('es-AR')} {completionCurrency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 line-through">
                      <span>{t.completeDealTraditionalComparison}</span>
                      <span>{simulatedTraditionalFee.toLocaleString('es-AR')} {completionCurrency}</span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2 flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                      <span>{t.completeDealYourSaving}</span>
                      <span className="text-sm">+{simulatedSavings.toLocaleString('es-AR')} {completionCurrency} (14%)</span>
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
                <span>{locale === 'ru' ? 'Заказы в работе' : 'Trabajos en curso'}</span>
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
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                {locale === 'ru'
                  ? 'У вас пока нет заказов в работе. Выберите заказ на бирже и нажмите «Взять в работу».'
                  : 'No tenés trabajos en curso actualmente. Podés tomar uno desde la bolsa de pedidos.'}
              </div>
            )}
          </div>

          {/* Section: Completed Orders History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{locale === 'ru' ? 'История выполненных заказов (Комиссия 1%)' : 'Historial de trabajos completados (Comisión 1%)'}</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2 py-0.2">
                {completedOrders.length}
              </span>
            </h3>

            {completedOrders.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden">
                {completedOrders.map((ord) => (
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
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.orderDealCommission}: -{ord.commissionAmount?.toLocaleString('es-AR') || (ord.finalSum ? ord.finalSum * 0.01 : 500)}{' '}
                        {ord.commissionCurrency || ord.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
                {locale === 'ru' ? 'Завершённых заказов пока нет' : 'Aún no hay trabajos completados'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3.5 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {locale === 'ru'
              ? 'ProfiARG 1% — первая честная модель для мастеров в Аргентине'
              : 'ProfiARG 1% — el primer modelo justo para profesionales en Argentina'}
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
