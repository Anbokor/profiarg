'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Specialist, Locale } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { BARRIOS } from '@/data/barrios';
import { translations } from '@/lib/translations';
import { buildWhatsAppUrl } from '@/lib/utils';
import {
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface LeafletMapProps {
  specialists: Specialist[];
  locale: Locale;
  selectedSpecialist: Specialist | null;
  onSelectSpecialist: (specialist: Specialist) => void;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  specialists,
  locale,
  selectedSpecialist,
  onSelectSpecialist,
  className = 'h-full w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeBarrioFilter, setActiveBarrioFilter] = useState<string | null>(null);
  const t = translations[locale];

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    // Dynamically inject Leaflet CSS fallback if not already injected
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        // Prevent Leaflet "Map container is already initialized" error during React StrictMode / Fast Refresh
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        // Buenos Aires default center: Recoleta / Palermo area
        const defaultCenter: [number, number] = [-34.595, -58.42];
        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        // OpenStreetMap standard tile layer (100% free, no API key required, no watermarks)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Ensure correct tile rendering after DOM paint
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      }
    });

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // Invalidate map size whenever container element dimensions change (tab switches, split view, responsive resize)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Update Markers on map
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing markers that are no longer in list
      markersRef.current.forEach((marker, id) => {
        if (!specialists.find((s) => s.id === id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      // Add or update markers
      specialists.forEach((specialist) => {
        const category = CATEGORIES.find((c) => c.id === specialist.category);
        const pinBg = category?.pinBg || '#0284c7';
        const isSelected = selectedSpecialist?.id === specialist.id;

        const customIcon = L.divIcon({
          className: 'custom-profiarg-pin',
          html: `
            <div style="
              position: relative;
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
              transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            ">
              <div style="
                background: ${pinBg};
                width: 38px;
                height: 38px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                <div style="
                  transform: rotate(45deg);
                  color: white;
                  font-weight: 800;
                  font-size: 13px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ★
                </div>
              </div>
              ${
                isSelected
                  ? `<div style="
                      position: absolute;
                      top: -4px;
                      left: -4px;
                      width: 46px;
                      height: 46px;
                      border-radius: 50%;
                      border: 2px solid ${pinBg};
                      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                    "></div>`
                  : ''
              }
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        });

        const latLng: [number, number] = [specialist.coordinates.lat, specialist.coordinates.lng];

        let marker = markersRef.current.get(specialist.id);

        // Build rich popup content
        const waUrl = buildWhatsAppUrl(specialist.whatsapp, specialist.name, locale);
        const title = locale === 'ru' ? specialist.title_ru : specialist.title_es;
        const categoryTitle = locale === 'ru' ? category?.title_ru : category?.title_es;

        const popupHtml = `
          <div style="font-family: inherit; width: 230px; padding: 4px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <img src="${specialist.avatar}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover;" />
              <div style="flex: 1; overflow: hidden;">
                <span style="display: inline-block; font-size: 10px; font-weight: 700; color: ${pinBg}; background: ${pinBg}15; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px;">
                  ${categoryTitle || ''}
                </span>
                <div style="font-weight: 700; font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${specialist.name}
                </div>
              </div>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.3;">
              ${title}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 10px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
              <span style="font-weight: 700; color: #d97706;">★ ${specialist.rating.toFixed(1)} (${specialist.reviewsCount})</span>
              <span style="color: #64748b; font-weight: 500;">📍 ${specialist.barrio}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #059669; color: white; padding: 6px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;">
                WhatsApp
              </a>
              <button id="view-spec-${specialist.id}" style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; color: #334155; padding: 6px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                ${t.viewDetails}
              </button>
            </div>
          </div>
        `;

        if (!marker) {
          marker = L.marker(latLng, { icon: customIcon }).addTo(map);

          marker.bindPopup(popupHtml, {
            maxWidth: 260,
            className: 'profiarg-custom-popup',
          });

          markersRef.current.set(specialist.id, marker);
        } else {
          marker.setIcon(customIcon);
          marker.setLatLng(latLng);
          marker.setPopupContent(popupHtml);
        }

        // Re-bind popupopen and click handlers to current specialist closure
        marker.off('popupopen');
        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-spec-${specialist.id}`);
          if (btn) {
            btn.onclick = () => onSelectSpecialist(specialist);
          }
        });

        marker.off('click');
        marker.on('click', () => {
          onSelectSpecialist(specialist);
        });

        // If this specialist is selected, open its popup
        if (isSelected) {
          map.flyTo(latLng, 15, { duration: 1.2 });
          marker.openPopup();
        }
      });
    });
  }, [specialists, selectedSpecialist, isMapReady, locale, onSelectSpecialist]);

  // Geolocation button handler ("Рядом со мной")
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        import('leaflet').then((L) => {
          const map = mapInstanceRef.current;
          const userCoords: [number, number] = [pos.coords.latitude, pos.coords.longitude];

          map.flyTo(userCoords, 14, { duration: 1.5 });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(userCoords);
          } else {
            const userIcon = L.divIcon({
              className: 'user-location-pin',
              html: `
                <div style="position: relative;">
                  <div style="width: 18px; height: 18px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(2,132,199,0.8);"></div>
                  <div style="position: absolute; top: -7px; left: -7px; width: 32px; height: 32px; background: rgba(2,132,199,0.25); border-radius: 50%; animation: pulse 2s infinite;"></div>
                </div>
              `,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });

            userMarkerRef.current = L.marker(userCoords, { icon: userIcon })
              .addTo(map)
              .bindPopup(locale === 'ru' ? 'Вы находитесь здесь' : 'Tu ubicación actual')
              .openPopup();
          }
        });
      },
      (err) => {
        console.warn('Geolocation failed or denied', err);
        alert(
          locale === 'ru'
            ? 'Не удалось получить геолокацию. Разрешите доступ в настройках браузера.'
            : 'No se pudo obtener la ubicación. Verificá los permisos del navegador.'
        );
      }
    );
  };

  // Zoom to Barrio
  const handleZoomToBarrio = (barrioName: string, coords: { lat: number; lng: number }) => {
    setActiveBarrioFilter(barrioName);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, { duration: 1 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    setActiveBarrioFilter(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-34.595, -58.42], 13, { duration: 1 });
    }
  };

  return (
    <div className={`relative ${className} overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800`}>
      {/* Top Barrio Navigation Quick Strip */}
      <div className="absolute top-3 left-3 right-14 z-10 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
        {BARRIOS.slice(0, 7).map((b) => (
          <button
            key={b.id}
            onClick={() => handleZoomToBarrio(b.name, b.coordinates)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all ${
              activeBarrioFilter === b.name
                ? 'bg-sky-600 text-white'
                : 'bg-white/95 text-slate-700 hover:bg-slate-50 dark:bg-slate-900/90 dark:text-slate-200'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Map Action Controls (Right side) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleLocateMe}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-sky-50 hover:text-sky-600 active:scale-95 dark:bg-slate-900 dark:text-slate-200"
          title={t.nearMe}
        >
          <Navigation className="h-4 w-4" />
        </button>

        <button
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-200"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-200"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          onClick={handleResetView}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-200"
          title="Reset View"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full bg-slate-100 dark:bg-slate-950" />
    </div>
  );
};
