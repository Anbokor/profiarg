'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Specialist, Locale } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { translations } from '@/lib/translations';
import { buildWhatsAppUrl, escapeHtml, sanitizeUrl } from '@/lib/utils';
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
  const onSelectSpecialistRef = useRef(onSelectSpecialist);
  onSelectSpecialistRef.current = onSelectSpecialist;

  const [isMapReady, setIsMapReady] = useState(false);
  const [activeBarrioFilter, setActiveBarrioFilter] = useState<string | null>(null);
  const t = translations[locale];

  // Barrios that actually exist in the current specialist set
  const availableBarrios = useMemo(() => {
    const map = new Map<string, number>();
    specialists.forEach((s) => {
      if (s.barrio) {
        map.set(s.barrio, (map.get(s.barrio) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [specialists]);

  // Center map on specialists helper
  const centerMapOnSpecialists = useCallback(
    (specs: Specialist[], focusSpecialist?: Specialist | null) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // 1. If explicit focus specialist is provided or exists in list
      const targetFocus = focusSpecialist || (selectedSpecialist && specs.find((s) => s.id === selectedSpecialist.id));
      if (targetFocus) {
        const coords: [number, number] = [targetFocus.coordinates.lat, targetFocus.coordinates.lng];
        map.setView(coords, 15, { animate: true });
        const marker = markersRef.current.get(targetFocus.id);
        if (marker) {
          setTimeout(() => {
            if (marker && mapInstanceRef.current) {
              marker.openPopup();
            }
          }, 200);
        }
        return;
      }

      // 2. If exactly 1 specialist exists in the category
      if (specs.length === 1) {
        const single = specs[0];
        const coords: [number, number] = [single.coordinates.lat, single.coordinates.lng];
        map.setView(coords, 15, { animate: true });
        const marker = markersRef.current.get(single.id);
        if (marker) {
          setTimeout(() => {
            if (marker && mapInstanceRef.current) {
              marker.openPopup();
            }
          }, 200);
        }
        return;
      }

      // 3. If multiple specialists exist, calculate bounding box
      if (specs.length > 1) {
        import('leaflet').then((L) => {
          if (!mapInstanceRef.current) return;
          const bounds = L.latLngBounds(
            specs.map((s) => [s.coordinates.lat, s.coordinates.lng] as [number, number])
          );
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
        });
        return;
      }

      // 4. Default fallback: Buenos Aires center
      map.setView([-34.595, -58.42], 13, { animate: true });
    },
    [selectedSpecialist]
  );

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
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        // Default initial center: will be immediately adjusted once specialists markers are added
        const initialCenter: [number, number] = specialists[0]
          ? [specialists[0].coordinates.lat, specialists[0].coordinates.lng]
          : [-34.595, -58.42];

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        // OpenStreetMap standard tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Immediate and subsequent layout invalidation to guarantee clean tile rendering
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
          }
        }, 150);
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
  }, []); // Run once on mount

  // Safe resize handling: throttled window resize and container observer (prevents infinite CPU lockup)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    let lastWidth = 0;
    let lastHeight = 0;

    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          // Guard against subpixel oscillation loops
          if (Math.abs(width - lastWidth) > 8 || Math.abs(height - lastHeight) > 8) {
            lastWidth = width;
            lastHeight = height;
            handleResize();
          }
        }
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, []);

  // Update Markers on map and auto-center
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Filter specialists if barrio filter is active
      const activeSpecialists = activeBarrioFilter
        ? specialists.filter((s) => s.barrio === activeBarrioFilter)
        : specialists;

      // Remove existing markers that are no longer in active list
      markersRef.current.forEach((marker, id) => {
        if (!activeSpecialists.find((s) => s.id === id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      // Add or update markers
      activeSpecialists.forEach((specialist) => {
        const category = CATEGORIES.find((c) => c.id === specialist.category);
        const pinBg = category?.pinBg || '#0284c7';
        const isSelected = selectedSpecialist?.id === specialist.id;

        const customIcon = L.divIcon({
          className: 'custom-quatroclicks-pin custom-profiarg-pin',
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

        // Build rich popup content with full exact street address and XSS sanitization
        const waUrl = buildWhatsAppUrl(specialist.whatsapp, specialist.name, locale);
        const title = locale === 'ru' ? specialist.title_ru : specialist.title_es;
        const categoryTitle = locale === 'ru' ? category?.title_ru : category?.title_es;

        const safeAvatar = sanitizeUrl(
          specialist.avatar,
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        );
        const safeName = escapeHtml(specialist.name);
        const safeTitle = escapeHtml(title);
        const safeCategoryTitle = escapeHtml(categoryTitle || '');
        const safeBarrio = escapeHtml(specialist.barrio || '');
        const safeAddressLine = escapeHtml(specialist.addressLine || '');
        const safePinBg = escapeHtml(pinBg);
        const safeWaUrl = sanitizeUrl(waUrl);

        const popupHtml = `
          <div style="font-family: inherit; width: 240px; padding: 4px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
              <img src="${safeAvatar}" alt="${safeName}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; object-position: top; flex-shrink: 0;" />
              <div style="flex: 1; overflow: hidden;">
                <span style="display: inline-block; font-size: 10px; font-weight: 700; color: ${safePinBg}; background: ${safePinBg}15; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px;">
                  ${safeCategoryTitle}
                </span>
                <div style="font-weight: 700; font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${safeName}
                </div>
              </div>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.3;">
              ${safeTitle}
            </div>

            <!-- Full Exact Street Address & Neighborhood -->
            <div style="font-size: 11px; color: #334155; margin-bottom: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 8px; display: flex; align-items: flex-start; gap: 5px;">
              <span style="font-size: 12px; line-height: 1.2;">📍</span>
              <div style="min-width: 0; flex: 1;">
                <div style="font-weight: 600; color: #0f172a; line-height: 1.3;">
                  ${safeAddressLine || `${safeBarrio}, Buenos Aires`}
                </div>
                ${
                  safeAddressLine && !safeAddressLine.includes(safeBarrio)
                    ? `<div style="font-size: 10px; color: #64748b; margin-top: 1px;">${safeBarrio}, CABA</div>`
                    : ''
                }
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 10px; border-top: 1px solid #f1f5f9; padding-top: 6px;">
              <span style="font-weight: 700; color: #d97706;">★ ${specialist.rating.toFixed(1)} (${specialist.reviewsCount})</span>
              <span style="color: #64748b; font-weight: 500;">${safeBarrio}</span>
            </div>

            <div style="display: flex; gap: 6px;">
              <a href="${safeWaUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #059669; color: white; padding: 6px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;">
                WhatsApp
              </a>
              <button id="view-spec-${specialist.id}" type="button" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 6px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                ${escapeHtml(t.viewDetails)}
              </button>
            </div>
          </div>
        `;

        if (!marker) {
          marker = L.marker(latLng, { icon: customIcon }).addTo(map);

          marker.bindPopup(popupHtml, {
            maxWidth: 270,
            className: 'quatroclicks-custom-popup profiarg-custom-popup',
            autoPanPadding: [20, 20],
          });

          markersRef.current.set(specialist.id, marker);
        } else {
          marker.setIcon(customIcon);
          marker.setLatLng(latLng);
          marker.setPopupContent(popupHtml);
        }

        // Attach click listener to "Подробнее" button strictly on popupopen
        marker.off('popupopen');
        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-spec-${specialist.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectSpecialistRef.current(specialist);
            };
          }
        });

        // Marker click ONLY opens the popup and pans to marker — DOES NOT mount full modal or lock thread
        marker.off('click');
        marker.on('click', () => {
          marker.openPopup();
          map.panTo(latLng, { animate: true, duration: 0.5 });
        });
      });

      // Auto-center map on current specialist(s)
      centerMapOnSpecialists(activeSpecialists, selectedSpecialist);
    });
  }, [specialists, selectedSpecialist, isMapReady, locale, activeBarrioFilter, centerMapOnSpecialists]);

  // Geolocation button handler ("Рядом со мной")
  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        import('leaflet').then((L) => {
          const map = mapInstanceRef.current;
          if (!map) return;
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

  // Zoom to Barrio (only for barrios with active specialists)
  const handleZoomToBarrio = (barrioName: string) => {
    if (activeBarrioFilter === barrioName) {
      setActiveBarrioFilter(null);
      centerMapOnSpecialists(specialists);
    } else {
      setActiveBarrioFilter(barrioName);
      const barrioSpecs = specialists.filter((s) => s.barrio === barrioName);
      if (barrioSpecs.length > 0) {
        centerMapOnSpecialists(barrioSpecs);
      }
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
    centerMapOnSpecialists(specialists);
  };

  return (
    <div className={`relative ${className} overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800`}>
      {/* Dynamic Barrio Navigation Strip: only rendered when specialists span multiple barrios */}
      {availableBarrios.length > 1 && (
        <div className="absolute top-3 left-3 right-14 z-10 flex gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none pointer-events-auto">
          {activeBarrioFilter && (
            <button
              type="button"
              onClick={() => {
                setActiveBarrioFilter(null);
                centerMapOnSpecialists(specialists);
              }}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 shadow-md backdrop-blur-md bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              {locale === 'ru' ? 'Все районы' : 'Todos'}
            </button>
          )}
          {availableBarrios.map((b) => (
            <button
              key={b.name}
              type="button"
              onClick={() => handleZoomToBarrio(b.name)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 shadow-md backdrop-blur-md transition-all cursor-pointer ${
                activeBarrioFilter === b.name
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-white/95 text-slate-700 hover:bg-slate-50 dark:bg-slate-900/90 dark:text-slate-200'
              }`}
            >
              {b.name} <span className="opacity-75">({b.count})</span>
            </button>
          ))}
          <div className="w-2 flex-shrink-0" aria-hidden="true" />
        </div>
      )}

      {/* Map Action Controls (Right side) */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleLocateMe}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-sky-50 hover:text-sky-600 active:scale-95 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          title={t.nearMe}
          aria-label={t.nearMe}
        >
          <Navigation className="h-4 w-4" />
        </button>

        <button
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <button
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        <button
          onClick={handleResetView}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md transition hover:bg-slate-50 active:scale-95 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
          title={locale === 'ru' ? 'Центрировать карту' : 'Centrar mapa'}
          aria-label={locale === 'ru' ? 'Центрировать карту' : 'Centrar mapa'}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full bg-slate-100 dark:bg-slate-950" />
    </div>
  );
};
