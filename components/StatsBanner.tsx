'use client';

import React from 'react';
import { Locale } from '@/types';

interface StatsBannerProps {
  locale: Locale;
  totalSpecialists: number;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ locale, totalSpecialists }) => {
  return (
    <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white py-6 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-extrabold">{totalSpecialists}+</div>
          <div className="text-xs text-sky-100 mt-0.5">
            {locale === 'ru' ? 'Анкет в каталоге' : 'Especialistas registrados'}
          </div>
        </div>
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-extrabold">15+</div>
          <div className="text-xs text-sky-100 mt-0.5">
            {locale === 'ru' ? 'Районов CABA & Zona Norte' : 'Barrios cubiertos'}
          </div>
        </div>
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-extrabold">4.95 ★</div>
          <div className="text-xs text-sky-100 mt-0.5">
            {locale === 'ru' ? 'Средняя оценка мастеров' : 'Calificación promedio'}
          </div>
        </div>
        <div className="p-2">
          <div className="text-2xl sm:text-3xl font-extrabold">0%</div>
          <div className="text-xs text-sky-100 mt-0.5">
            {locale === 'ru' ? 'Комиссий за контакты' : 'Comisión de contacto'}
          </div>
        </div>
      </div>
    </div>
  );
};
