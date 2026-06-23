/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PREFECTURE_PATHS } from '../data/mappath';
import { ALL_PREFECTURES, getPrefectureById } from '../data/prefectureData';
import { PrefectureTravelData } from '../types';
import { Info, X, Share, Instagram, Download, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toBlob } from 'html-to-image';

interface JapanMapProps {
  onSelectPrefecture: (id: string) => void;
  selectedRegion?: string | null;
  setSelectedRegion?: (region: string | null) => void;
}

const labelOffsets: Record<string, { x: number; y: number }> = {}; // We calculate dynamically with precision offsets in helper

function getPrefLabelPos(prefId: string, pathD: string): { x: number; y: number } {
  const matches = pathD.match(/[-+]?[0-9]*\.?[0-9]+/g);
  if (!matches || matches.length < 2) return { x: 400, y: 400 };

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i < matches.length - 1; i += 2) {
    const x = parseFloat(matches[i]);
    const y = parseFloat(matches[i+1]);
    if (!isNaN(x) && !isNaN(y)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  let cx = (minX + maxX) / 2;
  let cy = (minY + maxY) / 2;

  // Selective micro-positioning adjustments for aesthetics
  if (prefId === 'tokyo') {
    cx += 12; 
    cy -= 2;
  } else if (prefId === 'hokkaido') {
    cx = 591;
    cy = 138;
  } else if (prefId === 'osaka') {
    cy += 2;
  } else if (prefId === 'kyoto') {
    cx -= 10;
    cy -= 8;
  } else if (prefId === 'hyogo') {
    cy -= 12;
  } else if (prefId === 'nagasaki') {
    cx += 12; // Shifted right to stay on mainland part rather than Goto Islands
    cy -= 2;
  } else if (prefId === 'kagoshima') {
    cy -= 15; // Shifted up because Amami Islands are far south
  } else if (prefId === 'chiba') {
    cx += 5;
  } else if (prefId === 'kanagawa') {
    cx -= 2;
    cy += 3;
  } else if (prefId === 'saitama') {
    cx -= 3;
    cy -= 3;
  } else if (prefId === 'kagawa') {
    cy -= 4;
  } else if (prefId === 'tokushima') {
    cx -= 10;
    cy += 6;
  } else if (prefId === 'ehime') {
    cx -= 5;
    cy -= 2;
  } else if (prefId === 'kochi') {
    cy += 3;
  } else if (prefId === 'saga') {
    cx -= 4;
    cy += 4;
  } else if (prefId === 'fukuoka') {
    cx += 2;
    cy -= 4;
  } else if (prefId === 'oita') {
    cx += 4;
  } else if (prefId === 'kumamoto') {
    cx -= 2;
    cy += 2;
  } else if (prefId === 'miyazaki') {
    cx += 3;
    cy += 5;
  } else if (prefId === 'aomori') {
    cy += 3;
  } else if (prefId === 'shizuoka') {
    cy += 4;
  } else if (prefId === 'aichi') {
    cy += 3;
  } else if (prefId === 'mie') {
    cx += 12;
    cy -= 2;
  } else if (prefId === 'shiga') {
    cx += 10;
    cy += 2;
  } else if (prefId === 'nara') {
    cx -= 10;
    cy += 2;
  } else if (prefId === 'wakayama') {
    cx += 15;
    cy += 8;
  } else if (prefId === 'ishikawa') {
    cx -= 12;
    cy -= 2;
  } else if (prefId === 'toyama') {
    cx += 12;
    cy += 2;
  } else if (prefId === 'fukui') {
    cx -= 8;
    cy -= 3;
  } else if (prefId === 'yamaguchi') {
    cx -= 8;
  } else if (prefId === 'shimane') {
    cx -= 10;
    cy -= 5;
  } else if (prefId === 'hiroshima') {
    cx -= 4;
    cy -= 2;
  } else if (prefId === 'tottori') {
    cx += 2;
    cy -= 5;
  } else if (prefId === 'okayama') {
    cx += 2;
    cy -= 2;
  } else if (prefId === 'ibaraki') {
    cx += 4;
  } else if (prefId === 'tochigi') {
    cx -= 2;
  } else if (prefId === 'gunma') {
    cx -= 4;
  } else if (prefId === 'niigata') {
    cx += 8;
    cy += 8;
  } else if (prefId === 'yamagata') {
    cx -= 3;
  } else if (prefId === 'miyagi') {
    cx += 5;
    cy += 2;
  } else if (prefId === 'fukushima') {
    cx += 5;
    cy += 3;
  } else if (prefId === 'akita') {
    cx -= 3;
  } else if (prefId === 'iwate') {
    cx += 4;
  }

  return { x: cx, y: cy };
}

export default function JapanMap({ onSelectPrefecture }: JapanMapProps) {
  // Mock default visited states as requested by the user:
  // 東京 (tokyo), かながわ (kanagawa), 埼玉 (saitama), 千葉 (chiba), 北海道 (hokkaido), 香川 (kagawa), 大阪 (osaka), 京都 (kyoto)
  const MOCK_VISITED = ['tokyo', 'kanagawa', 'saitama', 'chiba', 'hokkaido', 'kagawa', 'osaka', 'kyoto'];

  const [visited, setVisited] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('japan_visited_records_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back
      }
    }
    const initial: Record<string, boolean> = {};
    MOCK_VISITED.forEach((id) => {
      initial[id] = true;
    });
    return initial;
  });

  const [bucketList, setBucketList] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('japan_bucket_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fall back
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('japan_visited_records_v3', JSON.stringify(visited));
    window.dispatchEvent(new Event('japan_visited_updated'));
  }, [visited]);

  useEffect(() => {
    localStorage.setItem('japan_bucket_records', JSON.stringify(bucketList));
  }, [bucketList]);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showPrefNames, setShowPrefNames] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredPref, setHoveredPref] = useState<PrefectureTravelData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const startLongPressTimer = (prefId: string) => {
    isLongPressActiveRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setBucketList((prev) => ({
        ...prev,
        [prefId]: !prev[prefId]
      }));
    }, 600);
  };

  const cancelLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const [scale, setScale] = useState(1.15);
  const [pan, setPan] = useState({ x: 30, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const clickStartCoord = useRef({ x: 0, y: 0 });
  const draggedAmountRef = useRef(0);

  const handleActionClick = async (actionType: 'instagram' | 'facebook' | 'x' | 'download' | 'other') => {
    if (!shareCardRef.current) {
      setToastMessage("Error: Card element not found!");
      return;
    }

    try {
      setToastMessage("Generating premium status card... ⏳");
      
      // html-to-image toBlob creates a fully styled high DPI blob of `#share-card-graphic`
      const blob = await toBlob(shareCardRef.current, {
        cacheBust: false,
        backgroundColor: '#FFFFFF', // simple clean white background
        style: {
          transform: 'none',
          borderRadius: '0px', // square corners
        },
        pixelRatio: 2.0, // Crisp high-DPI standard for mobile/retina displays and Instagram Stories (optimized for speed)
      });

      if (!blob) {
        throw new Error("Blob creation failed");
      }

      const file = new File([blob], 'master_of_japan_status.png', { type: 'image/png' });

      if (actionType !== 'download') {
        // Standard Web Share API check for file capability
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          setToastMessage("Opening native share... 📸");
          await navigator.share({
            files: [file],
            title: 'Visited Japan Status',
            text: `I have visited ${progressPercent}% of Japan! Check out my status.`,
          });
          setToastMessage("Share sheet opened successfully!");
          setTimeout(() => setToastMessage(null), 2500);
        } else {
          // Fallback if the browser doesn't support file sharing via Web Share API
          setToastMessage("Saving image to device... 📲");
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'master_of_japan_status.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setTimeout(() => {
            setToastMessage("Saved to download folder! You can post it to Instagram 📸");
            setTimeout(() => setToastMessage(null), 4000);
          }, 1500);
        }
      } else if (actionType === 'download') {
        // Direct download flow
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'master_of_japan_status.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastMessage("Image saved successfully to your gallery! 📸");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      console.error("Failed to generate/share image:", error);
      setToastMessage("Failed to generate card. Please try again!");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.3, 4.0));
  };
  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.3, 0.5));
  };
  const resetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1.15);
    setPan({ x: 30, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    clickStartCoord.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    draggedAmountRef.current = 0;
  };

  const handleMouseMoveMap = (e: React.MouseEvent) => {
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top - 15,
      });
    }

    if (!isDragging) return;

    const deltaX = e.clientX - clickStartCoord.current.x;
    const deltaY = e.clientY - clickStartCoord.current.y;
    draggedAmountRef.current = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (draggedAmountRef.current > 5) {
      cancelLongPressTimer();
    }

    // Apply 0.20 resistance multiplier so dragging feels heavy, stable and precise (less slippery)
    const resistance = 0.20;
    setPan({
      x: panStartRef.current.x + deltaX * resistance,
      y: panStartRef.current.y + deltaY * resistance
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    cancelLongPressTimer();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      clickStartCoord.current = { x: touch.clientX, y: touch.clientY };
      panStartRef.current = { ...pan };
      draggedAmountRef.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - clickStartCoord.current.x;
      const deltaY = touch.clientY - clickStartCoord.current.y;
      draggedAmountRef.current = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (draggedAmountRef.current > 5) {
        cancelLongPressTimer();
      }

      // Apply 0.20 resistance multiplier so touch-drag/panning feels heavy, stable, and less slippery
      const resistance = 0.20;
      setPan({
        x: panStartRef.current.x + deltaX * resistance,
        y: panStartRef.current.y + deltaY * resistance
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    cancelLongPressTimer();
  };

  // Toggle visited status and trigger parent selection on tap
  const handlePrefectureClick = (prefId: string) => {
    cancelLongPressTimer();
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      return;
    }
    if (draggedAmountRef.current > 5) {
      // It was a drag/pan action, don't trigger selection
      return;
    }
    setVisited((prev) => ({
      ...prev,
      [prefId]: !prev[prefId],
    }));
    onSelectPrefecture(prefId);
  };



  const visitedCount = Object.keys(visited).filter(id => visited[id]).length;
  const progressPercent = Math.round((visitedCount / 47) * 100);

  return (
    <div className="flex flex-col gap-2 w-full flex-grow overflow-visible h-full" id="japan-map-root">
      <div 
        className="relative flex-grow flex flex-col gap-2 overflow-visible w-full pt-2 min-h-0 animate-fade-in"
        id="interactive-japan-map-container"
      >
          {/* Independent "Visited Japan" Notation/Label - Positioned below the search bar, left-aligned, with higher z-index to stay on top */}
          <div 
            className="absolute top-[82px] left-8 select-none flex flex-col items-stretch z-30 animate-fade-in w-fit"
            id="master-of-japan-text-label"
          >
            <span className="text-[86px] font-black tracking-tighter text-[#4B4B4B] leading-[0.85] pointer-events-none text-center font-sans flex items-baseline justify-center">
              {progressPercent}
              <span className="text-[58px] font-black tracking-tighter ml-0.5">%</span>
            </span>
            <div className="w-full flex justify-between leading-none mt-4 pointer-events-none">
              {"VISITED JAPAN".split('').map((char, index) => (
                <span 
                  key={index} 
                  className="text-[14px] font-[900] uppercase text-gray-500 leading-none pointer-events-none font-sans"
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          </div>

          {/* Floating toggle for Prefecture Names - Positioned in the top right corner directly under the header */}
          <div 
            className="absolute top-1 right-3 z-30 flex items-center gap-2 bg-transparent select-none"
            id="toggle-pref-names-control"
          >
            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-400/80 hover:text-[#112A2E] transition-colors">
              <input 
                type="checkbox" 
                checked={showPrefNames} 
                onChange={(e) => setShowPrefNames(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm border-slate-300 text-slate-400 focus:ring-0 cursor-pointer accent-slate-400 transition-all opacity-70 hover:opacity-100"
              />
              <span className="tracking-widest uppercase font-sans">Show Prefecture Name</span>
            </label>
          </div>

          {/* SVG map wrap with locked/fixed position */}
          <div 
            ref={mapContainerRef}
            onMouseMove={handleMouseMoveMap}
            className="relative w-full flex-grow h-0 min-h-[460px] bg-transparent overflow-hidden flex items-center justify-center cursor-default group select-none z-10"
          >

            <svg 
              viewBox="0 0 860 830" 
              className="w-full h-full p-2 select-none z-10 transition-transform duration-75 ease-out"
              style={{ 
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: 'center center'
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {ALL_PREFECTURES.map((pref) => {
                const path = PREFECTURE_PATHS[pref.id];
                if (!path) return null;

                const isVisited = visited[pref.id] || false;
                const isBucket = bucketList[pref.id] || false;
                const isHovered = hoveredPref?.id === pref.id;

                // Design-specified color logic
                let fillVal = '#EDEDEE'; // 標準状態: 薄いライトグレー
                let strokeVal = '#D6D8D9'; // 中間的なグレー
                let strokeW = '1.2'; // 標準太さ: 1.2px

                if (isHovered) {
                  // ホバー時: 抹茶グリーンの50%不透明度
                  fillVal = 'rgba(140, 198, 63, 0.5)';
                } else {
                  if (isVisited && isBucket) {
                    fillVal = '#8CC63F'; // 今の緑色 (従来の緑色)
                    strokeVal = '#BDE652'; // その黄緑色
                    strokeW = '3.0'; // フチを目立たせるため少し太く
                  } else if (isVisited) {
                    fillVal = '#8CC63F'; // タップされた都道府県（抹茶グリーン）
                    strokeVal = '#74A732'; // 濃い抹茶グリーン
                    strokeW = '2.5'; // 太さ 2.5px
                  } else if (isBucket) {
                    fillVal = '#BDE652'; // 黄緑色
                    strokeVal = '#74A732'; // マッチャグリーン
                    strokeW = '2.5'; // 太さ 2.5px
                  }
                }

                // Interactive Mouse & Touch events for long-press trigger on path
                const handleMouseDownPath = (e: React.MouseEvent) => {
                  if (e.button !== 0) return; // Left click only
                  startLongPressTimer(pref.id);
                };
                const handleTouchStartPath = (e: React.TouchEvent) => {
                  startLongPressTimer(pref.id);
                };
                const handleMouseUpOrLeavePath = () => {
                  cancelLongPressTimer();
                };

                const isOkinawa = pref.id === 'okinawa';

                if (isOkinawa) {
                  // Split Okinawa's path into distinct cluster islands to control their gaps individually
                  const subPaths = path.split('Z').map(p => p.trim()).filter(Boolean).map(p => p + ' Z');
                  
                  return (
                    <g key={pref.id} id={`map-group-${pref.id}`}>
                      {subPaths.map((subPath, idx) => {
                        let centerX = 575;
                        let centerY = 575;
                        let localTranslate = "";

                        if (idx === 0) {
                          // Okinawa Main Island (Honto)
                          centerX = 575;
                          centerY = 575;
                        } else if (idx === 1) {
                          // Miyako Islands
                          centerX = 505;
                          centerY = 607;
                          // Compact the internal gaps by shifting closer to Honto
                          localTranslate = "translate(24, -20)";
                        } else if (idx === 2) {
                          // Yaeyama Islands
                          centerX = 497;
                          centerY = 609;
                          // Compact the internal gaps by shifting closer to Honto and Miyako
                          localTranslate = "translate(38, -26)";
                        }

                        // Relocate Okinawa 45 degrees down-right from Chiba's center
                        const globalTranslate = "translate(16, 72)";
                        const transformStr = `${globalTranslate} ${localTranslate} translate(${centerX}, ${centerY}) scale(3) translate(${-centerX}, -${centerY})`;

                        return (
                          <path
                            key={`${pref.id}-${idx}`}
                            id={`map-path-${pref.id}-${idx}`}
                            d={subPath}
                            transform={transformStr}
                            style={{ fill: fillVal, stroke: strokeVal, strokeWidth: `${strokeW}px` }}
                            className="transition-all duration-200 cursor-pointer stroke-linejoin-round"
                            onClick={() => handlePrefectureClick(pref.id)}
                            onMouseDown={handleMouseDownPath}
                            onTouchStart={handleTouchStartPath}
                            onMouseUp={handleMouseUpOrLeavePath}
                            onMouseLeave={() => {
                              setHoveredPref(null);
                              handleMouseUpOrLeavePath();
                            }}
                            onTouchEnd={handleMouseUpOrLeavePath}
                          />
                        );
                      })}
                    </g>
                  );
                }

                return (
                  <path
                    key={pref.id}
                    id={`map-path-${pref.id}`}
                    d={path}
                    style={{ fill: fillVal, stroke: strokeVal, strokeWidth: `${strokeW}px` }}
                    className="transition-all duration-200 cursor-pointer stroke-linejoin-round"
                    onClick={() => handlePrefectureClick(pref.id)}
                    onMouseDown={handleMouseDownPath}
                    onTouchStart={handleTouchStartPath}
                    onMouseUp={handleMouseUpOrLeavePath}
                    onMouseLeave={() => {
                      setHoveredPref(null);
                      handleMouseUpOrLeavePath();
                    }}
                    onTouchEnd={handleMouseUpOrLeavePath}
                  />
                );
              })}

              {/* Connected dashed boundary lines (45-degree diagonal and horizontal line) to partition Okinawa */}
              <path
                d="M 343 798 L 543 598 L 830 598"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
                className="pointer-events-none"
              />

              {/* Thin, small elegant text "Okinawa" directly above the relocated/resized Okinawa */}
              {showPrefNames && (
                <text
                  x={591}
                  y={580}
                  textAnchor="middle"
                  className="fill-[#112A2E]/35 text-[9px] font-black tracking-widest pointer-events-none select-none uppercase font-sans"
                >
                  Okinawa
                </text>
              )}

              {/* Prefecture English Name Labels */}
              {showPrefNames && (
                <g id="prefecture-labels-group" className="pointer-events-none select-none">
                  {ALL_PREFECTURES.map((pref) => {
                    if (pref.id === 'okinawa') return null; // Already rendered manually above
                    const path = PREFECTURE_PATHS[pref.id];
                    if (!path) return null;

                    const pos = getPrefLabelPos(pref.id, path);

                    return (
                      <text
                        key={`label-${pref.id}`}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-[#112A2E]/35 text-[9px] font-black tracking-widest pointer-events-none select-none uppercase font-sans"
                      >
                        {pref.nameEn}
                      </text>
                    );
                  })}
                </g>
              )}
            </svg>

            {/* Dynamic Floating Tooltip */}
            {hoveredPref && (
              <div 
                style={{ 
                  position: 'absolute', 
                  left: `${tooltipPos.x}px`, 
                  top: `${tooltipPos.y}px`,
                  pointerEvents: 'none' 
                }}
                className="z-50 bg-[#112A2E]/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-[12px] font-sans border border-white/10 animate-fade-in whitespace-nowrap"
              >
                <span className="font-extrabold text-white text-[12px]">
                  {hoveredPref.nameEn}
                </span>
                <span className="text-[10.5px] opacity-80 font-bold">
                  {hoveredPref.nameJa}
                </span>
              </div>
            )}

            {/* Minimalist Floating Navigation Controls & SHARE Button */}
            <div className="absolute bottom-6 right-6 z-30 flex flex-row items-end gap-3 pointer-events-auto" id="map-controls-group">
              {/* Green SHARE Button directly to the left, styled matching the image */}
              <button
                onClick={() => setIsShareOpen(true)}
                className="px-7 py-2.5 mb-[5px] bg-[#8CC63F] hover:bg-[#7dae36] active:scale-95 duration-150 transition-all rounded-full text-white font-[900] text-[15px] uppercase tracking-widest cursor-pointer flex items-center justify-center shadow-[0_6px_20px_rgba(140,198,63,0.45)] select-none whitespace-nowrap"
                style={{ fontWeight: 900 }}
                id="share-floating-pill-button"
              >
                SHARE
              </button>

              {/* Vertical Navigation Controls Capsule */}
              <div className="flex flex-col rounded-[20px] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.08)] border border-slate-100/80 p-1 items-center min-w-[48px]">
                <button
                  onClick={zoomIn}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-semibold text-[#112A2E]/80 hover:bg-slate-50 hover:text-[#112A2E] active:scale-90 transition-all cursor-pointer"
                  title="Zoom In (拡大)"
                >
                  ＋
                </button>
                <div className="w-7 h-[1px] bg-slate-100" />
                <button
                  onClick={zoomOut}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-semibold text-[#112A2E]/80 hover:bg-slate-50 hover:text-[#112A2E] active:scale-90 transition-all cursor-pointer"
                  title="Zoom Out (縮小)"
                >
                  －
                </button>
                <div className="w-7 h-[1px] bg-slate-100" />
                <button
                  onClick={resetView}
                  className="w-11 h-10 rounded-xl flex items-center justify-center text-[11px] font-[900] text-gray-500 hover:text-[#112A2E] hover:bg-slate-50 active:scale-90 transition-all cursor-pointer"
                  title="Reset View (リセット)"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Map Legends with Rounded Dots */}
          <div className="flex items-center justify-center gap-6 pt-1 text-[11px] font-bold select-none text-center" id="map-legends">
            <div className="flex items-center gap-1.5" id="legend-visited">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8CC63F] inline-block shadow-3xs" />
              <span className="text-gray-500">visited!</span>
            </div>
            <div className="flex items-center gap-1.5" id="legend-bucket">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BDE652] inline-block shadow-3xs" />
              <span className="text-gray-500">bucket list</span>
            </div>
          </div>
        </div>

        {/* Share Status Bottom Sheet */}
        <AnimatePresence>
          {isShareOpen && (
            <div className="fixed inset-0 z-50 max-w-lg mx-auto flex flex-col justify-end" id="share-bottom-sheet-overlay">
              {/* Backdrop Background Mask */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsShareOpen(false)}
                className="absolute inset-0 bg-[#112A2E]/60 backdrop-blur-xs cursor-pointer"
              />

              {/* 90% Screen Height Sliding Sheet Container */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 210 }}
                className="relative h-[90%] bg-[#FAF9F5] rounded-t-[32px] shadow-2xl flex flex-col z-10 border-t border-slate-200/40 overflow-hidden"
              >
                {/* Drag Handle Cap */}
                <div className="w-full flex justify-center py-2 shrink-0">
                  <div className="w-11 h-1 bg-slate-300 rounded-full" />
                </div>

                {/* Header with Title and Close button */}
                <div className="px-6 pb-2 pt-1 flex justify-between items-center bg-transparent shrink-0">
                  <h3 className="text-[14px] font-black tracking-tight text-[#112A2E]">Share Your Status</h3>
                  <button 
                    onClick={() => setIsShareOpen(false)} 
                    className="p-1.5 rounded-full bg-white border border-slate-200 text-gray-400 hover:text-dark-slate shadow-3xs cursor-pointer transition-all active:scale-95"
                    aria-label="Close panel"
                  >
                    <X className="w-4 h-4 text-dark-slate" />
                  </button>
                </div>

                {/* Floating Feedback Toast Status inside bottom sheet */}
                <AnimatePresence>
                  {toastMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-12 left-1/2 -translate-x-1/2 z-[60] bg-[#112A2E]/95 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-full text-white text-[11px] font-black shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] animate-pulse" />
                      <span>{toastMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Scrollable central content area */}
                <div className="flex-grow overflow-y-auto px-6 py-4 flex flex-col items-center justify-start pt-2 pb-6 min-h-0 bg-transparent">
                  
                  <div className="flex items-center justify-center w-full z-10">
                    {/* Square representation mockup matching the design draft */}
                    <div 
                      ref={shareCardRef}
                      id="share-card-graphic" 
                      className="relative w-[340px] h-[340px] rounded-none border border-[#E2E8F0] shadow-lg flex flex-col overflow-hidden select-none bg-white shrink-0"
                    >
                      {/* Brand Watermark / logo at top-right */}
                      <div className="absolute top-[24px] right-[24px] flex items-center gap-1.5 z-20">
                        <div className="w-[12px] h-[12px] rounded-full bg-[#8CC63F]" />
                        <span className="font-extrabold text-[#112A2E] text-[11px] tracking-wider font-sans uppercase">
                          MATCHA
                        </span>
                      </div>

                      {/* Display metric & status tracking statement at left-top */}
                      <div className="absolute top-[38px] left-[26px] z-20 flex flex-col items-stretch font-sans w-fit">
                        <span className="text-[64px] font-black text-[#4B4B4B] leading-none tracking-tighter flex items-baseline justify-center">
                          {progressPercent}
                          <span className="text-[42px] font-black tracking-tighter ml-0.5">%</span>
                        </span>
                        <div className="w-full flex justify-between leading-none mt-3.5 pointer-events-none">
                          {"VISITED JAPAN".split('').map((char, index) => (
                            <span 
                              key={index} 
                              className="text-[9px] font-[900] uppercase text-gray-500 leading-none pointer-events-none font-sans"
                            >
                              {char === ' ' ? '\u00A0' : char}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Static mini-map inside card, centered beautifully with optimized margins to prevent crowding */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 pt-[72px] pb-[24px] px-[28px]">
                        <svg 
                          viewBox="0 0 860 830" 
                          className="w-full h-full object-contain select-none opacity-95 transform scale-[1.08] translate-x-[6px] translate-y-[-4px]"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          {ALL_PREFECTURES.map((pref) => {
                            const path = PREFECTURE_PATHS[pref.id];
                            if (!path) return null;

                            const isVisited = visited[pref.id] || false;

                            let fillVal = '#FFFFFF';
                            let strokeVal = '#9CA3AF';
                            let strokeW = '2.0';

                            if (isVisited) {
                              fillVal = '#8CC63F';
                              strokeVal = '#74A732';
                              strokeW = '2.5';
                            }

                            const isOkinawa = pref.id === 'okinawa';

                            if (isOkinawa) {
                              const subPaths = path.split('Z').map(p => p.trim()).filter(Boolean).map(p => p + ' Z');
                              return (
                                <g key={`share-${pref.id}`}>
                                  {subPaths.map((subPath, idx) => {
                                    let centerX = 575;
                                    let centerY = 575;
                                    let localTranslate = "";

                                    if (idx === 0) {
                                      centerX = 575;
                                      centerY = 575;
                                    } else if (idx === 1) {
                                      centerX = 505;
                                      centerY = 607;
                                      localTranslate = "translate(24, -20)";
                                    } else if (idx === 2) {
                                      centerX = 497;
                                      centerY = 609;
                                      localTranslate = "translate(38, -26)";
                                    }

                                    const globalTranslate = "translate(16, 72)";
                                    const transformStr = `${globalTranslate} ${localTranslate} translate(${centerX}, ${centerY}) scale(3) translate(${-centerX}, -${centerY})`;

                                    return (
                                      <path
                                        key={`share-${pref.id}-${idx}`}
                                        d={subPath}
                                        transform={transformStr}
                                        style={{ fill: fillVal, stroke: strokeVal, strokeWidth: `${strokeW}px` }}
                                      />
                                    );
                                  })}
                                </g>
                              );
                            }

                            return (
                              <path
                                key={`share-${pref.id}`}
                                d={path}
                                style={{ fill: fillVal, stroke: strokeVal, strokeWidth: `${strokeW}px` }}
                              />
                            );
                          })}

                          {/* Connected dashed boundary lines (45-degree diagonal and horizontal line) to partition Okinawa */}
                          <path
                            d="M 343 798 L 543 598 L 830 598"
                            stroke="#CBD5E1"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            fill="none"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal share actions buttons list below image */}
                  <div className="w-full max-w-[310px] flex justify-around items-center mt-4">
                    {/* Facebook Button */}
                    <button 
                      onClick={() => handleActionClick('facebook')}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-hidden"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#112A2E] transition-colors animate-none">
                        Facebook
                      </span>
                    </button>

                    {/* X (formerly Twitter) Button */}
                    <button 
                      onClick={() => handleActionClick('x')}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-hidden"
                    >
                      <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all border border-neutral-800">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#112A2E] transition-colors animate-none">
                        X
                      </span>
                    </button>

                    {/* Instagram Stories button */}
                    <button 
                      onClick={() => handleActionClick('instagram')}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-hidden"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FFB900] via-[#D3043F] to-[#8C00D6] text-white flex items-center justify-center shadow-md group-hover:scale-105 active:scale-95 transition-all">
                        <Instagram className="w-4.5 h-4.5 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#112A2E] transition-colors animate-none">
                        Instagram
                      </span>
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
}
