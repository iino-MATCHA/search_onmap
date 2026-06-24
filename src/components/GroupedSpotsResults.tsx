/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { ArrowLeft, Loader, AlertCircle, Compass } from 'lucide-react';
import { cdn } from '../lib/img';

// Assign Access Token
mapboxgl.accessToken = (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN;

// A spot already normalized to a common shape, with `group` as the section key.
export interface GroupedSpot {
  id: number;
  group: string;
  name_ja?: string;
  name_en?: string;
  desc_ja?: string;
  desc_en?: string;
  prefecture_ja?: string;
  prefecture_en?: string;
  lat?: number;
  lng?: number;
  img_url?: string | null;
  featured?: boolean;                   // cross-cutting flag (e.g. Must-Try)
  start_date?: string | null;           // optional event date (MM-DD)
  end_date?: string | null;
}

interface GroupedSpotsResultsProps {
  lang: 'en' | 'ja';
  onBack: () => void;
  title: { en: string; ja: string };   // map badge / header label
  countNoun: string;                    // e.g. 'spots' | 'shops'
  visitedKey: string;                   // localStorage key (avoid id collisions across datasets)
  loader: () => Promise<GroupedSpot[]>; // fetches + normalizes spots
  groupLabel: (group: string, lang: 'en' | 'ja') => string;
  order?: string[];                     // explicit chip order (group ids); falls back to count-desc
  featured?: { id: string; label: { en: string; ja: string } }; // optional cross-cutting chip shown first
  hero?: (groupId: string) => { image?: string | null; description?: string | null } | null; // per-group hero (image + copy)
  background?: string | null; // one faint category image shared across all chips, behind the sheet
  initialSpotId?: number | null; // when arriving from a Featured card: focus this spot + its group
}

// Some datasets contain mojibake in *_ja fields (C1 control / replacement / lone
// surrogates). Fall back to English when JA looks broken.
const looksBroken = (s?: string) => {
  if (!s) return false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if ((c >= 0x80 && c <= 0x9f) || c === 0xfffd || (c >= 0xd800 && c <= 0xdfff)) return true;
  }
  return false;
};

export default function GroupedSpotsResults({ lang, onBack, title, countNoun, visitedKey, loader, groupLabel, order, featured, hero, background, initialSpotId }: GroupedSpotsResultsProps) {
  const [spots, setSpots] = useState<GroupedSpot[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeSpotId, setActiveSpotId] = useState<number | null>(null);
  const [selectedModalSpot, setSelectedModalSpot] = useState<GroupedSpot | null>(null);

  const [visitedIds, setVisitedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(visitedKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(visitedKey, JSON.stringify(visitedIds));
    } catch (e) {
      console.error(e);
    }
  }, [visitedIds, visitedKey]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: number]: mapboxgl.Marker }>({});
  const isScrollingRef = useRef<boolean>(false);

  // Bottom-sheet height as percent of the body: collapsed 55%, expanded 80%.
  const [heightPct, setHeightPct] = useState<number>(55);
  const [dragging, setDragging] = useState<boolean>(false);
  const expanded = heightPct >= 75;
  const bodyRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const mapBlockRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<boolean>(false);
  const dragStartY = useRef<number>(0);
  const dragStartH = useRef<number>(55);
  const curPctRef = useRef<number>(55);
  const movedRef = useRef<number>(0);
  const onSheetDown = (e: React.PointerEvent) => {
    draggingRef.current = true; setDragging(true);
    dragStartY.current = e.clientY; dragStartH.current = heightPct; curPctRef.current = heightPct; movedRef.current = 0;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };
  const onSheetMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !bodyRef.current) return;
    const dy = dragStartY.current - e.clientY;
    movedRef.current = Math.max(movedRef.current, Math.abs(dy));
    const pct = Math.min(80, Math.max(55, dragStartH.current + (dy / bodyRef.current.clientHeight) * 100));
    curPctRef.current = pct;
    // Drive heights via the DOM directly during the drag — no React re-render per frame.
    if (sheetRef.current) sheetRef.current.style.height = `${pct}%`;
    if (mapBlockRef.current) mapBlockRef.current.style.height = `${100 - pct}%`;
  };
  const onSheetUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false; setDragging(false);
    // tap (barely moved) toggles; otherwise snap to the nearer state. Commit once.
    const snap = movedRef.current < 6 ? (heightPct >= 75 ? 55 : 80) : (curPctRef.current > 67.5 ? 80 : 55);
    setHeightPct(snap);
  };

  const toggleVisited = (spotId: number) => {
    setVisitedIds(prev => (prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId]));
  };

  // Ordered list of group chips. Uses explicit `order` when provided, else count-desc.
  // A cross-cutting "featured" chip (e.g. Must-Try) is prepended when any spot is featured.
  const groupOrder = React.useMemo(() => {
    if (!spots) return [];
    const present = new Set(spots.map(s => s.group));
    let base: string[];
    if (order && order.length) {
      base = order.filter(g => present.has(g));
      spots.forEach(s => { if (!base.includes(s.group)) base.push(s.group); });
    } else {
      const counts: { [id: string]: number } = {};
      spots.forEach(s => { counts[s.group] = (counts[s.group] || 0) + 1; });
      base = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
    }
    if (featured && spots.some(s => s.featured)) base = [featured.id, ...base];
    return base;
  }, [spots, order, featured]);

  const currentSpots = React.useMemo(() => {
    if (!spots || !activeGroup) return [];
    if (featured && activeGroup === featured.id) return spots.filter(s => s.featured);
    return spots.filter(s => s.group === activeGroup);
  }, [spots, activeGroup, featured]);

  // Chip / badge label, accounting for the featured (Must-Try) virtual group
  const labelFor = (gid: string) => (featured && gid === featured.id ? featured.label[lang] : groupLabel(gid, lang));

  // 1. Fetch all spots once
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fetched = await loader();
        if (isMounted) {
          setSpots(fetched);
          if (fetched.length > 0) {
            let first: string;
            let firstSpot: GroupedSpot | undefined;
            const targetSpot = initialSpotId != null ? fetched.find(s => s.id === initialSpotId) : undefined;
            if (targetSpot) {
              // Arrived from a Featured card → focus that spot + its group.
              first = targetSpot.group;
              firstSpot = targetSpot;
            } else if (featured && fetched.some(s => s.featured)) {
              first = featured.id;
              firstSpot = fetched.find(s => s.featured);
            } else {
              if (order && order.length) {
                first = order.find(g => fetched.some(s => s.group === g)) || fetched[0].group;
              } else {
                const counts: { [id: string]: number } = {};
                fetched.forEach(s => { counts[s.group] = (counts[s.group] || 0) + 1; });
                first = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))[0];
              }
              firstSpot = fetched.find(s => s.group === first);
            }
            setActiveGroup(first);
            setActiveSpotId(firstSpot ? firstSpot.id : null);
          }
        }
      } catch (err: any) {
        console.error('Spot fetch error:', err);
        if (isMounted) setError(err.message || 'An unexpected error occurred while connecting to Supabase.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [retryCount]);

  // 2. Sync map + markers with the active group's spots
  useEffect(() => {
    if (loading || error || !mapContainerRef.current) return;

    const validCoords = currentSpots.filter(s => s.lng != null && s.lat != null);
    let initialCenter: [number, number] = [138.2529, 36.2048];
    if (validCoords.length > 0) {
      const avgLng = validCoords.reduce((sum, i) => sum + (i.lng || 0), 0) / validCoords.length;
      const avgLat = validCoords.reduce((sum, i) => sum + (i.lat || 0), 0) / validCoords.length;
      initialCenter = [avgLng, avgLat];
    }

    let map = mapRef.current;
    if (!map) {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: initialCenter,
        zoom: validCoords.length > 1 ? 5.0 : 6.0,
        pitch: 0,
        bearing: 0,
        attributionControl: false
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
      // Tint the sea a soft light blue (default light style renders water grey)
      const tintSea = () => {
        try { map!.setPaintProperty('water', 'fill-color', '#CDE9F4'); } catch {}
      };
      map.on('style.load', tintSea);
      if (map.isStyleLoaded()) tintSea();
    }

    (Object.values(markersRef.current) as mapboxgl.Marker[]).forEach(m => m.remove());
    markersRef.current = {};
    const createdMarkers: { [id: number]: mapboxgl.Marker } = {};

    currentSpots.forEach((spot) => {
      if (spot.lat == null || spot.lng == null) return;
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-map-marker cursor-pointer transition-all duration-300 transform';
      markerEl.id = `gs-marker-${spot.id}`;
      markerEl.onclick = (e) => {
        e.stopPropagation();
        handleMarkerClick(spot.id);
        setSelectedModalSpot(spot);
      };
      const imgUrl = cdn(spot.img_url, 96) || '';
      markerEl.innerHTML = `
        <div class="relative flex items-center justify-center group">
          <div class="active-glow-ring absolute w-11 h-11 bg-[#74A732]/25 rounded-full scale-0 transition-transform duration-300 font-sans"></div>
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
      const markerInstance = new mapboxgl.Marker({ element: markerEl }).setLngLat([spot.lng, spot.lat]).addTo(map!);
      createdMarkers[spot.id] = markerInstance;
    });

    markersRef.current = createdMarkers;
    if (activeSpotId !== null) highlightActiveMarker(activeSpotId);
  }, [currentSpots, loading, error]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const highlightActiveMarker = (id: number) => {
    Object.keys(markersRef.current).forEach((markerIdKey) => {
      const mid = parseInt(markerIdKey, 10);
      const el = document.getElementById(`gs-marker-${mid}`);
      if (el) {
        const innerEl = el.querySelector('.marker-inner');
        const tailEl = el.querySelector('.marker-tail');
        const glowRing = el.querySelector('.active-glow-ring');
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
    const targetEl = document.getElementById(`gs-marker-${id}`);
    if (targetEl) {
      const innerEl = targetEl.querySelector('.marker-inner');
      const tailEl = targetEl.querySelector('.marker-tail');
      const glowRing = targetEl.querySelector('.active-glow-ring');
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

  useEffect(() => {
    if (activeSpotId === null || !mapRef.current) return;
    const obj = currentSpots.find(i => i.id === activeSpotId);
    if (obj && obj.lat != null && obj.lng != null) {
      mapRef.current.flyTo({ center: [obj.lng, obj.lat], zoom: 5.2, duration: 700, curve: 1.2, essential: true });
      highlightActiveMarker(activeSpotId);
    }
  }, [activeSpotId, currentSpots]);

  // The map fills exactly the area above the sheet (height = 100% - sheet). When the sheet
  // settles at a new height, resize the canvas and re-center the active pin so it stays
  // centered in the visible strip above the sheet. At 55% the map is 45% — unchanged.
  useEffect(() => {
    if (dragging || !mapRef.current) return;
    const map = mapRef.current;
    const t = setTimeout(() => {
      map.resize();
      if (activeSpotId !== null) {
        const obj = currentSpots.find(i => i.id === activeSpotId);
        if (obj && obj.lat != null && obj.lng != null) {
          map.easeTo({ center: [obj.lng, obj.lat], duration: 250, essential: true });
        }
      }
    }, 330);
    return () => clearTimeout(t);
  }, [heightPct, dragging]);

  const handleMarkerClick = (spotId: number) => {
    setActiveSpotId(spotId);
    isScrollingRef.current = true;
    const el = document.getElementById(`gs-card-${spotId}`);
    const listContainer = document.getElementById('gs-list-container');
    if (el && listContainer) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { isScrollingRef.current = false; }, 1000);
  };

  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    const first = (spots || []).find(s => s.group === groupId);
    if (first) setActiveSpotId(first.id);
  };

  const handleListScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (isScrollingRef.current || !container || currentSpots.length === 0) return;
    if (container.scrollTop <= 15) {
      const firstSpot = currentSpots[0];
      if (firstSpot && firstSpot.id !== activeSpotId) setActiveSpotId(firstSpot.id);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const containerCenterY = containerRect.top + containerRect.height / 2;
    let closest: number | null = null;
    let minDelta = Infinity;
    container.querySelectorAll('[data-spot-card]').forEach((card) => {
      const r = card.getBoundingClientRect();
      const delta = Math.abs(r.top + r.height / 2 - containerCenterY);
      if (delta < minDelta) {
        minDelta = delta;
        const pid = card.getAttribute('data-spot-id');
        if (pid) closest = parseInt(pid, 10);
      }
    });
    if (closest !== null && closest !== activeSpotId) setActiveSpotId(closest);
  };

  const getName = (s: GroupedSpot) => {
    if (lang === 'ja' && !looksBroken(s.name_ja)) return s.name_ja || s.name_en || '名前なしスポット';
    return s.name_en || s.name_ja || 'Unnamed Spot';
  };
  const getDesc = (s: GroupedSpot) => {
    if (lang === 'ja' && !looksBroken(s.desc_ja)) return s.desc_ja || s.desc_en || '詳細説明はまだありません。';
    return s.desc_en || s.desc_ja || 'No description available yet.';
  };
  const getPrefecture = (s: GroupedSpot) => {
    if (lang === 'ja' && !looksBroken(s.prefecture_ja)) return s.prefecture_ja || s.prefecture_en || '日本';
    return s.prefecture_en || s.prefecture_ja || 'Japan';
  };

  const totalCount = spots?.length || 0;
  const visitedCount = spots?.filter(s => visitedIds.includes(s.id)).length || 0;

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC] overflow-hidden min-h-0">

      <div className="bg-white border-b border-gray-100 py-2.5 px-6 flex items-center justify-between shadow-xs z-20 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-matcha active:text-matcha transition-colors focus:outline-hidden group cursor-pointer animate-fade-in"
          id="btn-back-to-categories"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-semibold">{lang === 'ja' ? 'カテゴリーへ戻る' : 'Back to categories'}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#74A732] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-150 shadow-3xs animate-fade-in select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-[#74A732] animate-pulse"></span>
          <span>{visitedCount}/{totalCount} {countNoun}</span>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 relative overflow-hidden min-h-0">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none !important; }
          .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        `}</style>

        {/* Map — fills the area above the sheet (height = 100% − sheet height) */}
        <div
          ref={mapBlockRef}
          className="absolute top-0 left-0 right-0 bg-slate-100"
          style={{ height: `${100 - heightPct}%`, transition: dragging ? 'none' : 'height 0.3s ease' }}
        >
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute left-4 top-4 bg-white/95 border border-slate-200/80 px-3 py-2 rounded-lg shadow-md flex items-center gap-2 pointer-events-none backdrop-blur-xs z-10">
            <div className="w-2 h-2 rounded-full bg-matcha animate-pulse"></div>
            <span className="text-xs font-bold text-[#112A2E] tracking-tight">
              {title[lang]}
              {activeGroup && (
                <>
                  <span className="mx-1">•</span>
                  <span className="text-slate-500">{labelFor(activeGroup)}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Bottom sheet — drag/tap the handle to toggle 55% ⇄ 80% */}
        <div
          ref={sheetRef}
          className="absolute bottom-0 left-0 right-0 z-20 bg-slate-50 rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.13)] flex flex-col overflow-hidden"
          style={{ height: `${heightPct}%`, transition: dragging ? 'none' : 'height 0.3s ease' }}
        >
          {/* Faint category background, shared across all chips (behind everything) */}
          {background && (
            <img
              src={cdn(background, 800)}
              alt=""
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-[0.22] pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}

          {/* Grabber */}
          <div
            onPointerDown={onSheetDown}
            onPointerMove={onSheetMove}
            onPointerUp={onSheetUp}
            className="flex items-center justify-center h-6 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>

          {/* Chips — shown when there is more than one group */}
          {!loading && !error && groupOrder.length > 1 && (
            <div className="flex bg-transparent pb-2.5 px-4 overflow-x-auto gap-1.5 no-scrollbar flex-shrink-0 relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
              {groupOrder.map((gid) => {
                const isSelected = activeGroup === gid;
                return (
                  <button
                    key={gid}
                    onClick={() => handleGroupChange(gid)}
                    className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap text-center transition-all cursor-pointer shadow-3xs ${
                      isSelected ? 'bg-matcha text-white shadow-xs' : 'bg-white/75 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {labelFor(gid)}
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-slate-50/70">
              <Loader className="w-5 h-5 text-matcha animate-spin" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                {lang === 'ja' ? 'スポットを読み込み中...' : 'Loading spots...'}
              </span>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center bg-slate-50/70">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-xs text-slate-500">{error}</span>
              <button
                onClick={() => setRetryCount(p => p + 1)}
                className="mt-2 px-2.5 py-1 text-[10px] bg-white border border-slate-200 text-slate-500 rounded-md font-bold hover:bg-slate-50 cursor-pointer"
              >
                {lang === 'ja' ? '再読み込み' : 'Retry'}
              </button>
            </div>
          ) : currentSpots.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/90 select-none">
              <Compass className="w-6 h-6 mb-1 text-slate-300 stroke-[1.5]" />
              <h4 className="text-xs font-bold text-slate-600">
                {lang === 'ja' ? 'スポットが見つかりませんでした' : 'No spots found'}
              </h4>
            </div>
          ) : (
            <div className="flex-1 relative overflow-hidden min-h-0">
              {/* Description band (expanded only) over the faint category background + list below */}
              <div className="relative z-10 flex flex-col h-full min-h-0">
                {expanded && (() => {
                  const d = hero ? hero(activeGroup as string)?.description : null;
                  return d ? (
                    <div className="flex-shrink-0 px-5 pt-3 pb-2">
                      <p className="text-[#112A2E]/90 text-xs sm:text-[13px] leading-relaxed font-medium max-w-[92%]">{d}</p>
                    </div>
                  ) : null;
                })()}
                <div
                  id="gs-list-container"
                  onScroll={handleListScroll}
                  className="flex-1 overflow-y-auto no-scrollbar min-h-0"
                  style={{ paddingTop: expanded ? 4 : 10 }}
                >
                  <div className="w-full max-w-xl mx-auto px-6 pb-48 flex flex-col gap-3.5">
                    {currentSpots.map((spot) => {
                  const isActive = spot.id === activeSpotId;
                  const isVisited = visitedIds.includes(spot.id);
                  return (
                    <div
                      key={spot.id}
                      id={`gs-card-${spot.id}`}
                      data-spot-card="true"
                      data-spot-id={spot.id}
                      onClick={() => { handleMarkerClick(spot.id); setSelectedModalSpot(spot); }}
                      className={`bg-white rounded-xl p-4 flex gap-4 transition duration-150 cursor-pointer border select-none touch-manipulation active:scale-[0.99] active:bg-slate-50 ${
                        isActive ? 'border-[#74A732] ring-1 ring-[#74A732]/30 shadow-md bg-emerald-50/10' : 'border-slate-100/90 shadow-3xs'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-150 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                        {spot.img_url ? (
                          <img src={cdn(spot.img_url, 200)} alt={getName(spot)} referrerPolicy="no-referrer" loading="lazy" decoding="async" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full bg-emerald-50/30 flex items-center justify-center text-matcha/50">
                            <Compass className="w-5 h-5 stroke-[1.2]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className={`text-xs font-bold truncate transition-colors duration-150 ${isActive ? 'text-[#74A732]' : 'text-[#112A2E]'}`}>
                              {getName(spot)}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-bold flex-wrap">
                              <span>{getPrefecture(spot)}</span>
                              <span>•</span>
                              <span className="text-matcha">{groupLabel(spot.group, lang)}</span>
                              {spot.start_date && (
                                <>
                                  <span>•</span>
                                  <span className="text-matcha font-mono">{spot.start_date}{spot.end_date ? ` ~ ${spot.end_date}` : ''}</span>
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
                        <p className={`text-[11px] mt-1.5 leading-relaxed transition-colors duration-200 ${isActive ? 'text-slate-600 font-medium' : 'text-slate-400'} line-clamp-2`}>
                          {getDesc(spot)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedModalSpot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" onClick={() => setSelectedModalSpot(null)}>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative w-full max-w-[420px] aspect-square transform scale-100 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="h-1/2 w-full relative bg-slate-150 flex-shrink-0">
              {selectedModalSpot.img_url ? (
                <img src={cdn(selectedModalSpot.img_url, 800)} alt={getName(selectedModalSpot)} referrerPolicy="no-referrer" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-emerald-50/40 flex flex-col items-center justify-center text-matcha/45">
                  <Compass className="w-10 h-10 stroke-[1.2]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1.5">{lang === 'ja' ? '画像なし' : 'No Cover Image'}</span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10 select-none">
                <span className="bg-white/95 text-[#112A2E] text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/50 backdrop-blur-xs select-none">
                  {getPrefecture(selectedModalSpot)}
                </span>
              </div>
              <button onClick={() => setSelectedModalSpot(null)} className="absolute top-4 right-4 bg-white/90 hover:bg-white active:scale-95 text-slate-700 w-8 h-8 rounded-full shadow-md flex items-center justify-center cursor-pointer z-10 transition-all border border-slate-100" aria-label="Close">
                <span className="text-xl font-bold leading-none">×</span>
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-12 flex flex-col justify-end pointer-events-none select-none">
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-md truncate">
                  {getName(selectedModalSpot)}
                </h3>
                <p className="text-[10px] text-white/85 font-bold mt-1 tracking-wide">
                  {groupLabel(selectedModalSpot.group, lang)}
                  {selectedModalSpot.start_date ? ` ・ ${selectedModalSpot.start_date}${selectedModalSpot.end_date ? ` ~ ${selectedModalSpot.end_date}` : ''}` : ''}
                </p>
              </div>
            </div>
            <div className="h-1/2 w-full p-4 flex flex-col bg-white relative">
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar select-text">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2 select-none">
                  <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-400 tracking-wider uppercase font-sans">
                    <Compass className="w-2.5 h-2.5 text-[#74A732]/70" />
                    <span>{lang === 'ja' ? 'スポット詳細' : 'SPOT DETAILS'}</span>
                  </div>
                  <button
                    onClick={() => toggleVisited(selectedModalSpot.id)}
                    className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider transition-all duration-200 cursor-pointer select-none border shadow-3xs flex items-center gap-1 outline-none font-sans ${
                      visitedIds.includes(selectedModalSpot.id) ? 'bg-[#74A732] text-white border-transparent hover:bg-[#639028]' : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200 hover:text-[#112A2E]'
                    }`}
                  >
                    <span>
                      {visitedIds.includes(selectedModalSpot.id) ? (lang === 'ja' ? '✓ 行った' : '✓ Visited') : (lang === 'ja' ? '行った' : 'Visited')}
                    </span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {getDesc(selectedModalSpot)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
