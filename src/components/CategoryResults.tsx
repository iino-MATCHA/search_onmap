/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { SupabaseItem } from '../types';
import { cdn } from '../lib/img';
import mapboxgl from 'mapbox-gl';
import { 
  ArrowLeft, 
  Loader, 
  AlertCircle, 
  Compass,
  RefreshCw,
  Layers,
  Settings,
  ExternalLink
} from 'lucide-react';

// Assign Access Token
mapboxgl.accessToken = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN;

interface CategoryResultsProps {
  categoryTitle: string;
  onBack: () => void;
  lang: 'en' | 'ja';
  initialItemId?: number | null; // when arriving from a Featured card: focus this spot + its month
}

const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

export default function CategoryResults({ categoryTitle, onBack, lang, initialItemId }: CategoryResultsProps) {
  // Items organized dynamically by month number (1 - 12)
  const [activeMonth, setActiveMonth] = useState<number>(6); // Default to June (6) as baseline
  const [allCategoryItems, setAllCategoryItems] = useState<SupabaseItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [retryCount, setRetryCount] = useState<number>(0);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [selectedModalItem, setSelectedModalItem] = useState<SupabaseItem | null>(null);

  // Visited spot persistence setup via localStorage
  const [visitedIds, setVisitedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('matcha_visited_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('matcha_visited_ids', JSON.stringify(visitedIds));
    } catch (e) {
      console.error(e);
    }
  }, [visitedIds]);

  // References to DOM elements and map instances
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: number]: mapboxgl.Marker }>({});
  const isScrollingRef = useRef<boolean>(false);
  const isMonthScrollingRef = useRef<boolean>(false); // Lock for smooth swipe alignment

  // Map category title directly to DB query filter strings
  const getCategoryQueryCode = (title: string): string => {
    const raw = title.toLowerCase().trim();
    if (raw === 'festivals') {
      return 'festivals';
    }
    if (raw === 'fire works') {
      return 'fireworks';
    }
    if (raw === 'onsen/hot spring') {
      return 'onsen';
    }
    return raw;
  };

  const queryCategory = getCategoryQueryCode(categoryTitle);
  // Categories without event dates: single list view, no month tabs (onsen / mountain / sake)
  const isDateless = queryCategory === 'onsen' || queryCategory === 'mountain' || queryCategory === 'sake';

  // One faint category image shared behind the whole bottom panel (consistent across month tabs)
  const STORAGE = 'https://gmibmhxozqkotdfkssac.supabase.co/storage/v1/object/public/items_img';
  const categoryBg = ({
    festivals: `${STORAGE}/festivals/2-akita-kanto.webp`,
    fireworks: `${STORAGE}/fireworks/14-sumida-fireworks.webp`,
    onsen: `${STORAGE}/onsen/21-kusatsu-onsen.webp`,
    mountain: `${STORAGE}/mountain/131-mt-fuji.webp`
  } as { [c: string]: string })[queryCategory];

  const toggleVisited = (itemId: number) => {
    setVisitedIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Memoize grouped items by month number so horizontal scrolling metrics continue to work seamlessly
  const itemsByMonth = React.useMemo(() => {
    const grouped: { [m: number]: SupabaseItem[] } = {};
    for (let m = 1; m <= 12; m++) {
      grouped[m] = [];
    }
    if (!allCategoryItems) return grouped;
    allCategoryItems.forEach(item => {
      if (item.start_date) {
        const monthNum = parseInt(item.start_date.split('-')[0], 10);
        if (monthNum >= 1 && monthNum <= 12) {
          grouped[monthNum].push(item);
        }
      }
    });
    return grouped;
  }, [allCategoryItems]);

  // Current visible items for the active view
  const currentItems = React.useMemo(() => {
    if (!allCategoryItems) return [];
    if (isDateless) return allCategoryItems;
    const monthStr = activeMonth.toString().padStart(2, '0');
    return allCategoryItems.filter(item => item.start_date?.startsWith(`${monthStr}-`));
  }, [allCategoryItems, activeMonth, isDateless]);

  const isLoading = loading;
  const isError = error;

  // 1. Fetch All category items from Supabase at once
  useEffect(() => {
    let isMounted = true;
    const qCategory = getCategoryQueryCode(categoryTitle);

    async function loadAllItems() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('items')
          .select('*')
          .or(`category.eq.${qCategory},category.eq."${categoryTitle}",category.eq."${categoryTitle.toLowerCase()}"`);

        if (supabaseError) {
          throw supabaseError;
        }

        if (isMounted) {
          const fetchedItems = data || [];
          setAllCategoryItems(fetchedItems);

          // If we arrived from a Featured card, jump straight to that spot + its month tab.
          const target = initialItemId != null ? fetchedItems.find(it => it.id === initialItemId) : undefined;

          if (target) {
            if (!isDateless && target.start_date) {
              const m = parseInt(target.start_date.split('-')[0], 10);
              if (m >= 1 && m <= 12) setActiveMonth(m);
            }
            setActiveItemId(target.id);
          } else {
            // Otherwise default to the first month that has events (non-dateless categories)
            if (!isDateless && fetchedItems.length > 0) {
              const firstMonthWithEvents = Array.from({ length: 12 }, (_, i) => i + 1).find(m => {
                const monthStr = m.toString().padStart(2, '0');
                return fetchedItems.some(item => item.start_date?.startsWith(`${monthStr}-`));
              });
              if (firstMonthWithEvents !== undefined) {
                setActiveMonth(firstMonthWithEvents);
              }
            }
            setActiveItemId(fetchedItems.length > 0 ? fetchedItems[0].id : null);
          }
        }
      } catch (err: any) {
        console.error(`Supabase fetch error:`, err);
        if (isMounted) {
          setError(err.message || 'An unexpected error occurred while connecting to Supabase.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllItems();
    return () => {
      isMounted = false;
    };
  }, [categoryTitle, retryCount]);

  // 2. Initialize and Synchronize Mapbox Viewport and Markers for active items
  useEffect(() => {
    if (isLoading || isError || !mapContainerRef.current) return;

    // Determine target center using existing coordinates center of mass of active items
    const validCoords = currentItems.filter(item => item.lng != null && item.lat != null);
    let initialCenter: [number, number] = [135.7681, 35.0116]; // Fallback beautiful Kyoto
    
    if (validCoords.length > 0) {
      const avgLng = validCoords.reduce((sum, i) => sum + (i.lng || 0), 0) / validCoords.length;
      const avgLat = validCoords.reduce((sum, i) => sum + (i.lat || 0), 0) / validCoords.length;
      initialCenter = [avgLng, avgLat];
    }

    // Instantiate Map if missing
    let map = mapRef.current;
    if (!map) {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11', // Gorgeous clean vector light canvas accentuating greens and waters
        center: initialCenter,
        zoom: validCoords.length > 1 ? 5.0 : 6.0,
        pitch: 0, // Flat 2D representation
        bearing: 0,
        attributionControl: false
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    }

    // Clear old markers
    (Object.values(markersRef.current) as mapboxgl.Marker[]).forEach(m => m.remove());
    markersRef.current = {};

    const createdMarkers: { [id: number]: mapboxgl.Marker } = {};

    // Generate custom markers using Supabase image URLs
    currentItems.forEach((item) => {
      if (item.lat == null || item.lng == null) return;

      const markerEl = document.createElement('div');
      markerEl.className = 'custom-map-marker cursor-pointer transition-all duration-300 transform';
      markerEl.id = `map-marker-${item.id}`;

      // Custom marker click triggers card list alignment and opens details modal
      markerEl.onclick = (e) => {
        e.stopPropagation();
        handleMarkerClick(item.id);
        setSelectedModalItem(item);
      };

      const imgUrl = cdn(item.img_url, 96) || '';

      // Embedded profile-cover styled image pin with dynamic rings
      markerEl.innerHTML = `
        <div class="relative flex items-center justify-center group">
          <!-- Active Glow Halo Pulse indicator -->
          <div class="active-glow-ring absolute w-11 h-11 bg-[#74A732]/25 rounded-full scale-0 transition-transform duration-300 font-sans"></div>
          
          <!-- Inner core marker image profile design -->
          <div class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden transition-all duration-300 marker-inner bg-slate-100">
            ${imgUrl ? `
              <img src="${imgUrl}" alt="" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
            ` : `
              <div class="w-full h-full flex items-center justify-center bg-emerald-50 text-[10px]">📍</div>
            `}
          </div>
          <div class="absolute -bottom-1 w-2.5 h-2.5 bg-white rotate-45 transform marker-tail border-r border-b border-gray-100 transition-all duration-300"></div>
        </div>
      `;

      const markerInstance = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([item.lng, item.lat])
        .addTo(map!);

      createdMarkers[item.id] = markerInstance;
    });

    markersRef.current = createdMarkers;

    if (activeItemId !== null) {
      highlightActiveMarker(activeItemId);
    }

    // Clean up markers temporarily on category back transitions
    return () => {
      // Keep map reference unless fully unmounted to maintain visual transitions
    };
  }, [currentItems, isLoading, isError]);

  // Clean map instance fully on component level unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 3. Highlight markers on active updates
  const highlightActiveMarker = (id: number) => {
    // Dim all currently active month map pins
    Object.keys(markersRef.current).forEach((markerIdKey) => {
      const mid = parseInt(markerIdKey, 10);
      const markerElInstance = document.getElementById(`map-marker-${mid}`);
      if (markerElInstance) {
        const innerEl = markerElInstance.querySelector('.marker-inner');
        const tailEl = markerElInstance.querySelector('.marker-tail');
        const glowRing = markerElInstance.querySelector('.active-glow-ring');
        
        if (innerEl && tailEl && glowRing) {
          innerEl.classList.remove('border-[#74A732]', 'scale-120');
          innerEl.classList.add('border-white');
          tailEl.classList.remove('bg-[#74A732]');
          tailEl.classList.add('bg-white');
          glowRing.classList.remove('scale-110');
          glowRing.classList.add('scale-0');
        }
      }
    });

    // Elevate the newly targetted active marker
    const targetMarkerEl = document.getElementById(`map-marker-${id}`);
    if (targetMarkerEl) {
      const innerEl = targetMarkerEl.querySelector('.marker-inner');
      const tailEl = targetMarkerEl.querySelector('.marker-tail');
      const glowRing = targetMarkerEl.querySelector('.active-glow-ring');

      if (innerEl && tailEl && glowRing) {
        innerEl.classList.remove('border-white');
        innerEl.classList.add('border-[#74A732]', 'scale-120');
        tailEl.classList.remove('bg-white');
        tailEl.classList.add('bg-[#74A732]');
        glowRing.classList.remove('scale-0');
        glowRing.classList.add('scale-110');
      }
    }
  };

  // Fly Camera smoothly to active coordinates using highly-zoomed birds-eye view
  useEffect(() => {
    if (activeItemId === null || !mapRef.current) return;

    const activeItemObj = currentItems.find(i => i.id === activeItemId);
    
    if (activeItemObj && activeItemObj.lat != null && activeItemObj.lng != null) {
      mapRef.current.flyTo({
        center: [activeItemObj.lng, activeItemObj.lat],
        zoom: 5.2, // Ultra birds-eye view zoom for wide Japan context
        speed: 0.4, // Slower travel speed for a majestic, smooth flight transition
        curve: 1.4,
        essential: true
      });

      highlightActiveMarker(activeItemId);
    }
  }, [activeItemId, currentItems]);

  // 4. Two-way communication handler: clicking marker scrolls card list
  const handleMarkerClick = (itemId: number) => {
    setActiveItemId(itemId);
    isScrollingRef.current = true;

    const el = document.getElementById(`item-card-${itemId}`);
    const activeListContainer = document.getElementById(isDateless ? 'list-container-onsen' : `list-container-month-${activeMonth}`);
    if (el && activeListContainer) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  // 5. Horizontal Page View scroll & swipe listener
  const handleHorizontalScroll = () => {
    if (isMonthScrollingRef.current) return;

    const container = horizontalContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    if (width <= 0) return;

    const scrollLeft = container.scrollLeft;
    const computedPageIndex = Math.round(scrollLeft / width);
    const targetMonth = MONTHS[computedPageIndex]?.value;

    if (targetMonth && targetMonth !== activeMonth) {
      setActiveMonth(targetMonth);
    }
  };

  // Click handler for top navigation tabs
  const handleMonthChange = (monthValue: number) => {
    setActiveMonth(monthValue);
    isMonthScrollingRef.current = true;

    const container = horizontalContainerRef.current;
    if (container) {
      const index = MONTHS.findIndex(m => m.value === monthValue);
      if (index !== -1) {
        container.scrollTo({
          left: index * container.clientWidth,
          behavior: 'smooth'
        });
      }
    }

    setTimeout(() => {
      isMonthScrollingRef.current = false;
    }, 600);
  };

  // Swipe snapping update alignment on initialization or container dimensions shifts
  useEffect(() => {
    const handleResize = () => {
      const container = horizontalContainerRef.current;
      if (container) {
        const index = MONTHS.findIndex(m => m.value === activeMonth);
        if (index !== -1) {
          container.scrollLeft = index * container.clientWidth;
        }
      }
    };
    
    // Add small delay to ensure rendering context clientWidth computes correctly
    const timer = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeMonth]);

  // 6. Vertical scroll active list-middle detector
  const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (isScrollingRef.current || !container) return;

    if (currentItems.length === 0) return;

    // Force first item active if scrolled near the top boundary
    if (container.scrollTop <= 15) {
      const firstItem = currentItems[0];
      if (firstItem && firstItem.id !== activeItemId) {
        setActiveItemId(firstItem.id);
      }
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerCenterY = containerRect.top + containerRect.height / 2;

    let closestItemId: number | null = null;
    let minimumDelta = Infinity;

    const childCards = container.querySelectorAll('[data-item-card]');
    childCards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterY = cardRect.top + cardRect.height / 2;
      const delta = Math.abs(cardCenterY - containerCenterY);

      if (delta < minimumDelta) {
        minimumDelta = delta;
        const parsedId = card.getAttribute('data-item-id');
        if (parsedId) {
          closestItemId = parseInt(parsedId, 10);
        }
      }
    });

    if (closestItemId !== null && closestItemId !== activeItemId) {
      setActiveItemId(closestItemId);
    }
  };

  // Multilingual labels matching localization selectors
  const getItemName = (item: SupabaseItem) => {
    if (lang === 'ja') {
      return item.name_ja || item.name_en || '名前なしスポット';
    }
    return item.name_en || item.name_ja || 'Unnamed Destination';
  };

  const getItemDesc = (item: SupabaseItem) => {
    if (lang === 'ja') {
      return item.desc_ja || item.desc_en || '詳細説明はまだありません。';
    }
    return item.desc_en || item.desc_ja || 'No description available yet.';
  };

  const getItemPrefecture = (item: SupabaseItem) => {
    if (lang === 'ja') {
      return item.prefecture_ja || item.prefecture_en || '日本';
    }
    return item.prefecture_en || item.prefecture_ja || 'Japan';
  };

  const totalCount = allCategoryItems?.length || 0;
  const visitedCount = allCategoryItems?.filter(item => visitedIds.includes(item.id)).length || 0;

  const getCategoryLabel = () => {
    const raw = categoryTitle.toLowerCase().trim();
    if (raw === 'festivals') {
      return 'festivals';
    }
    if (raw === 'fire works' || raw === 'fireworks') {
      return 'fireworks';
    }
    if (raw === 'mountain') {
      return 'mountains';
    }
    if (raw === 'sake') {
      return 'breweries';
    }
    return 'spots';
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC] overflow-hidden min-h-0">
      
      {/* 1. Action Navigation Header (Sticky Header block on top) */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-6 flex items-center justify-between shadow-xs z-20 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-matcha active:text-matcha transition-colors focus:outline-hidden group cursor-pointer animate-fade-in"
          id="btn-back-to-categories"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-semibold">{lang === 'ja' ? 'カテゴリーへ戻る' : 'Back to categories'}</span>
        </button>

        {/* Dynamic spot count status badge showing Visited Count of Total */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#74A732] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-150 shadow-3xs animate-fade-in select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#74A732] animate-pulse"></span>
          <span>{visitedCount}/{totalCount} {getCategoryLabel()}</span>
        </div>
      </div>

      {/* 2. Primary split display body */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
        
        {/* Map Area: Beautiful high overview flat layout filling top 45% */}
        <div className="h-[45%] w-full relative bg-slate-100 border-b border-slate-200 flex-shrink-0">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          
          {/* Active Month Status Badge overlaying top left map */}
          <div className="absolute left-4 top-4 bg-white/95 border border-slate-200/80 px-3 py-2 rounded-lg shadow-md flex items-center gap-2 pointer-events-none backdrop-blur-xs z-10">
            <div className="w-2 h-2 rounded-full bg-matcha animate-pulse"></div>
            <span className="text-xs font-bold text-[#112A2E] tracking-tight">
              {categoryTitle}
              {!isDateless && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-slate-500">{lang === 'ja' ? `${activeMonth}月` : MONTHS[activeMonth-1]?.label}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Swipeable List Area: Custom Monthly Page View Bottom 55% */}
        <div className="h-[55%] min-h-[55%] max-h-[55%] w-full bg-slate-50 flex flex-col flex-shrink-0 flex-grow-0 overflow-hidden relative border-t border-slate-100">

          {/* Faint category background, shared across all month tabs (behind everything) */}
          {categoryBg && (
            <img
              src={cdn(categoryBg, 800)}
              alt=""
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-[0.22] pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}

          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none !important;
            }
            .no-scrollbar {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
            }
          `}</style>

          {isDateless ? (
            /* Onsen View: Single compiled list of items (NO Monthly Horizontal Slider, NO month header tabs) */
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-slate-50/70">
                  <Loader className="w-5 h-5 text-matcha animate-spin" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {lang === 'ja' ? 'スポットを読み込み中...' : 'Loading spots...'}
                  </span>
                </div>
              ) : isError ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-50/70">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-xs text-slate-500">{isError}</span>
                  <button
                    onClick={() => setRetryCount(p => p + 1)}
                    className="mt-2 px-2.5 py-1 text-[10px] bg-white border border-slate-200 text-slate-500 rounded-md font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    {lang === 'ja' ? '再読み込み' : 'Retry'}
                  </button>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/90 select-none">
                  <Compass className="w-6 h-6 mb-1 text-slate-300 stroke-[1.5]" />
                  <h4 className="text-xs font-bold text-slate-600">
                    {lang === 'ja' ? 'スポットが見つかりませんでした' : 'No spots found'}
                  </h4>
                </div>
              ) : (
                <div
                  id="list-container-onsen"
                  onScroll={handleListScroll}
                  className="flex-1 overflow-y-auto bg-transparent flex flex-col min-h-0 no-scrollbar"
                >
                  <div className="w-full max-w-xl mx-auto px-6 pt-12 pb-48 flex flex-col gap-3.5">
                    {currentItems.map((item) => {
                      const isActive = item.id === activeItemId;
                      const isVisited = visitedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          id={`item-card-${item.id}`}
                          data-item-card="true"
                          data-item-id={item.id}
                          onClick={() => {
                            handleMarkerClick(item.id);
                            setSelectedModalItem(item);
                          }}
                          className={`bg-white rounded-xl p-4 flex gap-4 transition duration-150 cursor-pointer border select-none touch-manipulation active:scale-[0.99] active:bg-slate-50 ${
                            isActive
                              ? 'border-[#74A732] ring-1 ring-[#74A732]/30 shadow-md bg-emerald-50/10'
                              : 'border-slate-100/90 shadow-3xs'
                          }`}
                        >
                          {/* Left: cover image thumbnail */}
                          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-150 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                            {item.img_url ? (
                              <img
                                src={cdn(item.img_url, 200)}
                                alt={getItemName(item)}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-emerald-50/30 flex items-center justify-center text-matcha/50">
                                <Compass className="w-5 h-5 stroke-[1.2]" />
                              </div>
                            )}
                          </div>

                          {/* Right: details, alignments, dates */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className={`text-xs font-bold truncate transition-colors duration-150 ${
                                  isActive ? 'text-[#74A732]' : 'text-[#112A2E]'
                                }`}>
                                  {getItemName(item)}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-bold flex-wrap">
                                  <span>{getItemPrefecture(item)}</span>
                                  {item.start_date && (
                                    <>
                                      <span>•</span>
                                      <span className="text-matcha font-mono">{item.start_date} ~ {item.end_date || ''}</span>
                                    </>
                                  )}
                                  {isVisited && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#74A732] bg-emerald-50 px-1.5 py-0.5 rounded font-bold animate-fade-in flex items-center gap-0.5 text-[8px] border border-emerald-100">
                                        ✓ {lang === 'ja' ? '行った' : 'Visited'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <p className={`text-[11px] mt-1.5 leading-relaxed transition-colors duration-200 ${
                              isActive ? 'text-slate-600 font-medium' : 'text-slate-400'
                            } line-clamp-2`}>
                              {getItemDesc(item)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Non-Onsen View: Keep Month Tabs and Horizontal sliding viewport */
            <>
              {/* Monthly horizontal sliding Navigation indicators at the top of bottom card workspace */}
              <div className="flex bg-transparent py-2.5 px-4 overflow-x-auto gap-1.5 no-scrollbar flex-shrink-0 relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                {MONTHS.map((m) => {
                  const isSelected = activeMonth === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => handleMonthChange(m.value)}
                      className={`px-3 py-1 text-xs font-bold rounded-full min-w-[55px] text-center transition-all cursor-pointer shadow-3xs ${
                        isSelected
                          ? 'bg-matcha text-white shadow-xs'
                          : 'bg-white/75 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang === 'ja' ? `${m.value}月` : m.label}
                    </button>
                  );
                })}
              </div>

              {/* Page sliding horizontal viewport */}
              <div
                ref={horizontalContainerRef}
                onScroll={handleHorizontalScroll}
                className="flex-1 flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full h-full no-scrollbar relative"
                style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
              >
                {MONTHS.map((m) => {
                  const monthItems = itemsByMonth[m.value] || [];
                  const isMonthLoading = isLoading;
                  const monthErr = isError;

                  return (
                    <div
                      key={m.value}
                      className="snap-start w-full h-full flex-shrink-0 flex flex-col overflow-hidden min-h-0 relative"
                    >
                      {isMonthLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-slate-50/70">
                          <Loader className="w-5 h-5 text-matcha animate-spin" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            {lang === 'ja' ? `${m.value}月のデータを読み込み中...` : `Loading ${m.label}...`}
                          </span>
                        </div>
                      ) : monthErr ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-50/70">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-xs text-slate-500">{monthErr}</span>
                          <button
                            onClick={() => setRetryCount(p => p + 1)}
                            className="mt-2 px-2.5 py-1 text-[10px] bg-white border border-slate-200 text-slate-500 rounded-md font-bold hover:bg-slate-50 cursor-pointer"
                          >
                            {lang === 'ja' ? '再読み込み' : 'Retry'}
                          </button>
                        </div>
                      ) : monthItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/90 select-none">
                          <Compass className="w-6 h-6 mb-1 text-slate-300 stroke-[1.5]" />
                          <h4 className="text-xs font-bold text-slate-600">
                            {lang === 'ja' ? `${m.value}月に開催されるイベントはありません` : `No scheduled spots in ${m.label}`}
                          </h4>
                          <p className="text-[10px] max-w-xs text-slate-400 leading-normal mt-1">
                            {lang === 'ja' 
                              ? '左右にスワイプしてお祭り・行事がある別月をチェックしてください。' 
                              : 'Swipe left or right to explore alternative months.'}
                          </p>
                        </div>
                      ) : (
                        <div
                          id={`list-container-month-${m.value}`}
                          onScroll={handleListScroll}
                          className="flex-1 overflow-y-auto bg-transparent flex flex-col min-h-0 no-scrollbar"
                        >
                          <div className="w-full max-w-xl mx-auto px-6 pt-12 pb-48 flex flex-col gap-3.5">

                            {monthItems.map((item) => {
                              const isActive = item.id === activeItemId;
                              const isVisited = visitedIds.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  id={`item-card-${item.id}`}
                                  data-item-card="true"
                                  data-item-id={item.id}
                                  onClick={() => {
                                    handleMarkerClick(item.id);
                                    setSelectedModalItem(item);
                                  }}
                                  className={`bg-white rounded-xl p-3.5 flex gap-4 transition-all duration-300 cursor-pointer border select-none transform hover:translate-y-[-1px] ${
                                    isActive 
                                      ? 'border-[#74A732] ring-1 ring-[#74A732]/30 shadow-md scale-[1.012] bg-emerald-50/5' 
                                      : 'border-slate-100/90 hover:border-slate-200/95 shadow-3xs'
                                  }`}
                                >
                                  {/* Left: cover image thumbnail */}
                                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-150 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                                    {item.img_url ? (
                                      <img 
                                        src={item.img_url}
                                        alt={getItemName(item)}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-emerald-50/30 flex items-center justify-center text-matcha/50">
                                        <Compass className="w-5 h-5 stroke-[1.2]" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: details, alignments, dates */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <h3 className={`text-xs font-bold truncate transition-colors duration-150 ${
                                          isActive ? 'text-[#74A732]' : 'text-[#112A2E]'
                                        }`}>
                                          {getItemName(item)}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-bold flex-wrap">
                                          <span>{getItemPrefecture(item)}</span>
                                          {item.start_date && (
                                            <>
                                              <span>•</span>
                                              <span className="text-matcha font-mono">{item.start_date} ~ {item.end_date || ''}</span>
                                            </>
                                          )}
                                          {isVisited && (
                                            <>
                                              <span>•</span>
                                              <span className="text-[#74A732] bg-emerald-50 px-1.5 py-0.5 rounded font-bold animate-fade-in flex items-center gap-0.5 text-[8px] border border-emerald-100">
                                                ✓ {lang === 'ja' ? '行った' : 'Visited'}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <p className={`text-[11px] mt-1.5 leading-relaxed transition-colors duration-200 ${
                                      isActive ? 'text-slate-600 font-medium' : 'text-slate-400'
                                    } line-clamp-2`}>
                                      {getItemDesc(item)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Square Detail Modal Overlay in Center */}
      {selectedModalItem && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" 
          onClick={() => setSelectedModalItem(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative w-full max-w-[420px] aspect-square transform scale-100 transition-all duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top half (50%) - Picture */}
            <div className="h-1/2 w-full relative bg-slate-150 flex-shrink-0">
              {selectedModalItem.img_url ? (
                <img
                  src={cdn(selectedModalItem.img_url, 800)}
                  alt={getItemName(selectedModalItem)}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-50/40 flex flex-col items-center justify-center text-matcha/45">
                  <Compass className="w-10 h-10 stroke-[1.2]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5">{lang === 'ja' ? '画像なし' : 'No Cover Image'}</span>
                </div>
              )}
              
              {/* Absolute labels overlays inside top frame */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10 select-none">
                <span className="bg-white/95 text-[#112A2E] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/50 backdrop-blur-xs select-none">
                  {getItemPrefecture(selectedModalItem)}
                </span>
              </div>

              {/* Close Button top right */}
              <button 
                onClick={() => setSelectedModalItem(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white active:scale-95 text-slate-700 w-8 h-8 rounded-full shadow-md flex items-center justify-center cursor-pointer z-10 transition-all border border-slate-100"
                aria-label="Close"
              >
                <span className="text-xl font-bold leading-none">×</span>
              </button>

              {/* Seamless Bottom Label Gradient overlay - embeds Title and Dates */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-12 flex flex-col justify-end pointer-events-none select-none">
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-md truncate">
                  {getItemName(selectedModalItem)}
                </h3>
                {selectedModalItem.start_date && (
                  <p className="text-[9.5px] text-white/80 font-mono font-bold mt-1 tracking-wide flex items-center gap-1 text-shadow-sm">
                    <span>📅</span>
                    <span>{selectedModalItem.start_date} {selectedModalItem.end_date ? `~ ${selectedModalItem.end_date}` : ''}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bottom half (50%) - Description block with dynamic indicators and controls scrollable together */}
            <div className="h-1/2 w-full p-4 flex flex-col bg-white relative">
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar select-text">
                {/* Header Row: MATCHA RECOMMEND badge and Visited Toggle button inside the scrollable container */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 select-none">
                  {selectedModalItem.recommend ? (
                    <div className="flex items-center gap-1.5 animate-fade-in font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#74A732] flex-shrink-0 animate-pulse"></span>
                      <span className="text-[9px] font-black text-[#74A732] tracking-wider leading-none">
                        MATCHA RECOMMEND
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-400 tracking-wider uppercase font-sans">
                      <Compass className="w-2.5 h-2.5 text-[#74A732]/70" />
                      <span>{lang === 'ja' ? 'スポット詳細' : 'SPOT DETAILS'}</span>
                    </div>
                  )}

                  {/* Interactive Visited Toggle Button */}
                  <button
                    onClick={() => toggleVisited(selectedModalItem.id)}
                    className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider transition-all duration-200 cursor-pointer select-none border shadow-3xs flex items-center gap-1 outline-none font-sans ${
                      visitedIds.includes(selectedModalItem.id)
                        ? 'bg-[#74A732] text-white border-transparent hover:bg-[#639028]'
                        : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 hover:text-[#112A2E]'
                    }`}
                  >
                    <span>
                      {visitedIds.includes(selectedModalItem.id)
                        ? (lang === 'ja' ? '✓ 行った' : '✓ Visited')
                        : (lang === 'ja' ? '行った' : 'Visited')}
                    </span>
                  </button>
                </div>
                
                {/* Content description text */}
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {getItemDesc(selectedModalItem)}
                </div>

                {/* MATCHA article link (shown only when matcha_link exists) */}
                {selectedModalItem.matcha_link && (
                  <a
                    href={selectedModalItem.matcha_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-bold text-[#74A732] hover:text-[#639028] hover:underline transition-colors cursor-pointer"
                  >
                    {lang === 'ja' ? '詳しい記事はこちらから' : 'Read the full article'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
