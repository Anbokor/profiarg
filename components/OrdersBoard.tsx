'use client';

import React, { useState, useMemo } from 'react';
import { Locale, Order, CategoryId, OrderStatus } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { translations } from '@/lib/translations';
import {
  Search,
  Filter,
  X,
  FileSpreadsheet,
  PlusCircle,
  Clock,
  MapPin,
  MessageCircle,
  Send,
  Phone,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronDown,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface OrdersBoardProps {
  orders: Order[];
  locale: Locale;
  onOpenCreateOrder: () => void;
  onOpenCabinet: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onOpenCompleteDeal: (order: Order) => void;
}

export const OrdersBoard: React.FC<OrdersBoardProps> = ({
  orders,
  locale,
  onOpenCreateOrder,
  onOpenCabinet,
  onUpdateOrderStatus,
  onOpenCompleteDeal,
}) => {
  const t = translations[locale];

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedBarrio, setSelectedBarrio] = useState<string | 'all'>('all');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under_50k' | '50k_100k' | 'over_100k' | 'usd' | 'negotiable'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (selectedCategory !== 'all' && order.category !== selectedCategory) return false;
      if (selectedBarrio !== 'all' && order.barrio !== selectedBarrio) return false;

      if (budgetFilter !== 'all') {
        if (budgetFilter === 'usd' && order.currency !== 'USD') return false;
        if (budgetFilter === 'negotiable' && order.budget !== null && order.currency !== 'a_convenir') return false;
        if (budgetFilter === 'under_50k' && (order.currency !== 'ARS' || !order.budget || order.budget >= 50000)) return false;
        if (budgetFilter === '50k_100k' && (order.currency !== 'ARS' || !order.budget || order.budget < 50000 || order.budget > 100000)) return false;
        if (budgetFilter === 'over_100k' && (order.currency !== 'ARS' || !order.budget || order.budget <= 100000)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchable = `${order.title} ${order.description} ${order.barrio} ${order.contactName}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [orders, statusFilter, selectedCategory, selectedBarrio, budgetFilter, searchQuery]);

  const openOrdersCount = orders.filter((o) => o.status === 'open').length;

  const getCategoryDetails = (catId: CategoryId) => {
    return CATEGORIES.find((c) => c.id === catId);
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) {
        return locale === 'ru' ? `${Math.max(1, diffMins)} мин. назад` : `hace ${Math.max(1, diffMins)} min`;
      }
      if (diffHours < 24) {
        return locale === 'ru' ? `${diffHours} ч. назад` : `hace ${diffHours} h`;
      }
      return locale === 'ru' ? `${diffDays} дн. назад` : `hace ${diffDays} d`;
    } catch {
      return locale === 'ru' ? 'Недавно' : 'Reciente';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner: Marketplace Title */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 border border-sky-400/30 px-3 py-1 text-xs font-semibold text-sky-200">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-medium">{openOrdersCount} {t.openOrdersCount.toLowerCase()}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.ordersBoardTitle}
            </h1>
            <p className="text-sm text-sky-100/90 leading-relaxed">
              {t.ordersBoardSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 sm:px-5 py-2.5 text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t.createOrderBtn}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCabinet}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2.5 text-xs sm:text-sm backdrop-blur-xs transition"
            >
              <Briefcase className="h-4 w-4 text-sky-300" />
              <span>{t.specialistCabinetTab}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.filterSearchOrders}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryId | 'all')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">{t.allCategories}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'ru' ? cat.title_ru : cat.title_es}
                </option>
              ))}
            </select>
          </div>

          {/* Barrio Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedBarrio}
              onChange={(e) => setSelectedBarrio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">{t.allBarrios}</option>
              <option value="Онлайн / Любой район">{t.orderBarrioRemote}</option>
              {BARRIOS.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div className="md:col-span-2">
            <select
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">{t.allBudgets}</option>
              <option value="under_50k">{t.budgetUnder50k}</option>
              <option value="50k_100k">{t.budget50kTo100k}</option>
              <option value="over_100k">{t.budgetOver100k}</option>
              <option value="usd">{t.budgetUsd}</option>
              <option value="negotiable">{t.budgetNegotiableOption}</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="md:col-span-2 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500'
              }`}
            >
              {t.filterStatusAll}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('open')}
              className={`flex-1 py-1 rounded-lg font-semibold transition ${
                statusFilter === 'open'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {t.filterStatusOpen}
            </button>
          </div>
        </div>

        {/* Results Counter and Active Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            {t.foundOrdersCount}{' '}
            <strong className="text-slate-900 dark:text-white font-bold">{filteredOrders.length}</strong>
          </span>

          {(selectedCategory !== 'all' || selectedBarrio !== 'all' || budgetFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedBarrio('all');
                setBudgetFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-rose-600 hover:text-rose-700 font-medium underline"
            >
              {t.resetFilters}
            </button>
          )}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const cat = getCategoryDetails(order.category);
            const isCompleted = order.status === 'completed';
            const isInProgress = order.status === 'in_progress';
            const isOpen = order.status === 'open';


            // WhatsApp link: ensure Argentine international prefix
            let waClean = order.contactValue.replace(/\D/g, '');
            if (waClean.startsWith('11') && waClean.length === 10) {
              waClean = `549${waClean}`;
            } else if (waClean.startsWith('15') && waClean.length === 10) {
              waClean = `54911${waClean.slice(2)}`;
            } else if (!waClean.startsWith('549') && waClean.length >= 8 && waClean.length <= 11) {
              waClean = `549${waClean}`;
            }

            const waText = encodeURIComponent(
              locale === 'ru'
                ? `Здравствуйте, ${order.contactName}! Увидел ваш заказ на Quatro Clicks: «${order.title}». Готов обсудить детали и предложить свои услуги.`
                : `Hola ${order.contactName}! Vi tu pedido en Quatro Clicks: "${order.title}". Me gustaría postularme para realizar el trabajo.`
            );
            const waUrl = `https://wa.me/${waClean}?text=${waText}`;

            // Telegram username sanitize
            const tgClean = order.contactValue.replace(/^(https?:\/\/)?(t\.me\/)?@?/, '').trim();

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-4"
              >
                {/* Header: Category & Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                      <span>{cat ? (locale === 'ru' ? cat.title_ru : cat.title_es) : order.category}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {isOpen && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{t.orderStatusOpen}</span>
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          <span>{t.orderStatusInProgress}</span>
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-300">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t.orderStatusCompleted}</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {order.title}
                  </h3>

                  {/* Barrio */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-sky-600" />
                    <span>{order.barrio}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                    {order.description}
                  </p>
                </div>

                {/* Pricing Card */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {locale === 'ru' ? 'Бюджет клиента:' : 'Presupuesto:'}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {order.budget
                        ? `${order.budget.toLocaleString('es-AR')} ${order.currency}`
                        : t.budgetNegotiable}
                    </span>
                  </div>
                </div>

                {/* Footer Actions & Contact info */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-slate-400 font-medium">
                      {t.orderClientLabel}:{' '}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {order.contactName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Action 1: Contact via WhatsApp/Telegram */}
                    {order.contactMethod === 'whatsapp' ? (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    ) : order.contactMethod === 'telegram' ? (
                      <a
                        href={`https://t.me/${tgClean}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Telegram</span>
                      </a>
                    ) : (
                      <a
                        href={`tel:${order.contactValue}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-1.5 text-xs shadow-xs transition"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{order.contactValue}</span>
                      </a>
                    )}

                    {/* Action 2: Status transition */}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'in_progress')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 px-3 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-200 hover:bg-sky-100 transition"
                      >
                        <span>{t.orderTakeJobBtn}</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => onOpenCompleteDeal(order)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{t.orderCompleteJobBtn}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900 space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t.noOrdersFound}
          </p>
          <button
            type="button"
            onClick={onOpenCreateOrder}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t.createOrderBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
};
