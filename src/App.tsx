/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MapItemsResults from './components/MapItemsResults';
import AnimeResults from './components/AnimeResults';
import FoodResults, { FoodType } from './components/FoodResults';
import MyJapanView from './myjapan/components/MyJapanView';
import { Tab } from './types';
import { supabase } from './lib/supabase';
import { cdn } from './lib/img';

// Small category: `id` is passed to CategoryResults unchanged (same click behavior as before)
interface SmallCategory {
  id: string;
  title: {
    en: string;
    ja: string;
  };
  image: string;
}

// Big category groups small categories on the landing page
interface BigCategory {
  id: string;
  title: {
    en: string;
    ja: string;
  };
  items: SmallCategory[];
}

const COVER = 'https://gmibmhxozqkotdfkssac.supabase.co/storage/v1/object/public/items_img';

const BIG_CATEGORIES: BigCategory[] = [
  {
    id: 'nature',
    title: { en: 'Nature', ja: '自然' },
    items: [
      { id: 'Onsen/Hot Spring', title: { en: 'Onsen', ja: '温泉' }, image: `${COVER}/onsen/21-kusatsu-onsen.webp` },
      { id: 'Mountain', title: { en: 'Mountains', ja: '山・登山' }, image: `${COVER}/mountain/131-mt-fuji.webp` }
    ]
  },
  {
    id: 'events',
    title: { en: 'Events', ja: 'イベント' },
    items: [
      { id: 'Fire works', title: { en: 'Fireworks', ja: '花火大会' }, image: `${COVER}/fireworks/14-sumida-fireworks.webp` },
      { id: 'Festivals', title: { en: 'Festivals', ja: 'お祭り' }, image: `${COVER}/festivals/2-akita-kanto.webp` }
    ]
  },
  {
    id: 'food',
    title: { en: 'Food', ja: 'グルメ' },
    items: [
      { id: 'Ramen', title: { en: 'Ramen', ja: 'ラーメン' }, image: `${COVER}/_covers/ramen.jpg` },
      { id: 'Wagashi', title: { en: 'Wagashi', ja: '和菓子' }, image: `${COVER}/_covers/wagashi.jpg` },
      { id: 'Sake', title: { en: 'Sake Breweries', ja: '酒蔵・日本酒' }, image: `${COVER}/sake/142-fushimi-sake.webp` }
    ]
  },
  {
    id: 'culture',
    title: { en: 'Culture', ja: '文化' },
    items: [
      { id: 'Anime', title: { en: 'Anime', ja: 'アニメ聖地' }, image: `${COVER}/_covers/anime.jpg` }
    ]
  }
];

// items.category -> the landing card id used for navigation to the map page
const CATEGORY_TO_CARD: { [c: string]: string } = {
  festivals: 'Festivals',
  fireworks: 'Fire works',
  onsen: 'Onsen/Hot Spring',
  mountain: 'Mountain'
};

// Fallback cover per category (for this-month events that have no own image)
const CATEGORY_COVER: { [c: string]: string } = {
  festivals: `${COVER}/festivals/2-akita-kanto.webp`,
  fireworks: `${COVER}/fireworks/14-sumida-fireworks.webp`,
  onsen: `${COVER}/onsen/21-kusatsu-onsen.webp`,
  mountain: `${COVER}/mountain/131-mt-fuji.webp`
};

// A spotlight card for the landing hero ("Featured Now")
interface Featured {
  id: number;
  name_en: string;
  name_ja: string;
  prefecture_en: string;
  prefecture_ja: string;
  image: string;
  cardId: string;
  kind: 'pick' | 'month';
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.SEARCH);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ja'>('en');
  const [featured, setFeatured] = useState<Featured[]>([]);
  const [targetItemId, setTargetItemId] = useState<number | null>(null);

  // Build the landing hero: this month's events + MATCHA picks, shuffled.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mm = String(new Date().getMonth() + 1).padStart(2, '0');
        const [picksRes, monthRes] = await Promise.all([
          supabase.from('items').select('id,category,name_en,name_ja,prefecture_en,prefecture_ja,img_url,recommend').not('img_url', 'is', null),
          supabase.from('items').select('id,category,name_en,name_ja,prefecture_en,prefecture_ja,img_url,start_date').like('start_date', `${mm}-%`)
        ]);
        const toFeatured = (r: any, kind: 'pick' | 'month'): Featured | null => {
          const cardId = CATEGORY_TO_CARD[r.category];
          const src = r.img_url || CATEGORY_COVER[r.category];
          if (!cardId || !src) return null;
          return {
            id: r.id, name_en: r.name_en, name_ja: r.name_ja,
            prefecture_en: r.prefecture_en, prefecture_ja: r.prefecture_ja,
            image: cdn(src, 800) as string, cardId, kind
          };
        };
        const picks = (picksRes.data || [])
          .filter((r: any) => r.recommend === true || r.recommend === 'true')
          .map((r: any) => toFeatured(r, 'pick'));
        const months = (monthRes.data || []).map((r: any) => toFeatured(r, 'month'));
        const seen = new Set<number>();
        const pool = ([...months, ...picks].filter(Boolean) as Featured[])
          .filter((f) => (seen.has(f.id) ? false : (seen.add(f.id), true)));
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        if (mounted) setFeatured(pool.slice(0, 6));
      } catch {
        /* hero is optional — ignore failures */
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCategoryClick = (categoryId: string, itemId: number | null = null) => {
    setTargetItemId(itemId);
    setSelectedCategory(categoryId);
  };

  const handleTabChange = (tab: Tab) => {
    setSelectedCategory(null);
    setCurrentTab(tab);
  };

  return (
    <div className="w-full h-screen max-h-screen bg-[#F8FAFC] flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* 1. Header component */}
      <Header currentTab={currentTab} setCurrentTab={handleTabChange} lang={lang} setLang={setLang} />

      {/* Main container: houses page content dynamically based on current tab */}
      <main className="flex-1 z-10 w-full flex flex-col min-h-0 overflow-hidden">
        {currentTab === Tab.SEARCH ? (
          selectedCategory ? (
            <div className="flex-1 h-full min-h-0 overflow-hidden flex flex-col">
              {selectedCategory === 'Anime' ? (
                <AnimeResults onBack={() => setSelectedCategory(null)} lang={lang} />
              ) : ['Ramen', 'Wagashi', 'Sake'].includes(selectedCategory) ? (
                <FoodResults
                  foodType={selectedCategory.toLowerCase() as FoodType}
                  onBack={() => setSelectedCategory(null)}
                  lang={lang}
                />
              ) : (
                <MapItemsResults
                  categoryTitle={selectedCategory}
                  onBack={() => setSelectedCategory(null)}
                  lang={lang}
                  initialItemId={targetItemId}
                />
              )}
            </div>
          ) : (
            <div
              className="w-full flex-1 pt-4 pb-28 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Featured hero: this month's events + MATCHA picks (shuffled). Tap → map page. */}
              {featured.length > 0 && (
                <div className="mb-8">
                  <div className="px-6 mb-2.5 max-w-3xl mx-auto w-full flex items-baseline gap-2">
                    <h2 className="text-lg font-extrabold text-[#112A2E] tracking-tight">
                      {lang === 'ja' ? '✨ 今月の注目' : '✨ Featured Now'}
                    </h2>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {lang === 'ja' ? 'タップで地図へ' : 'Tap to open the map'}
                    </span>
                  </div>
                  <div
                    className="flex gap-4 overflow-x-auto px-6 pb-2 snap-x snap-mandatory max-w-3xl mx-auto w-full [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {featured.map((f) => {
                      const name = lang === 'ja' ? (f.name_ja || f.name_en) : (f.name_en || f.name_ja);
                      const pref = lang === 'ja' ? (f.prefecture_ja || f.prefecture_en) : (f.prefecture_en || f.prefecture_ja);
                      const isMonth = f.kind === 'month';
                      const badge = isMonth ? (lang === 'ja' ? '今月開催' : 'This Month') : (lang === 'ja' ? 'MATCHAおすすめ' : "MATCHA's Pick");
                      return (
                        <button
                          key={f.id}
                          onClick={() => handleCategoryClick(f.cardId, f.id)}
                          className="relative flex-shrink-0 w-[86%] sm:w-[400px] aspect-[16/10] rounded-3xl overflow-hidden snap-center shadow-lg ring-1 ring-black/5 group cursor-pointer transition-transform duration-150 active:scale-[0.98] touch-manipulation"
                        >
                          <img
                            src={f.image}
                            alt=""
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                          <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider text-white px-2.5 py-1 rounded-full shadow-sm ${isMonth ? 'bg-[#74A732]/95' : 'bg-rose-500/90'}`}>
                            {badge}
                          </span>
                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <h3 className="text-white text-lg font-extrabold leading-tight drop-shadow-md line-clamp-2">{name}</h3>
                            <div className="flex items-center justify-between mt-1.5 gap-2">
                              <span className="text-white/90 text-[11px] font-bold truncate">📍 {pref}</span>
                              <span className="flex-shrink-0 text-white text-[11px] font-bold inline-flex items-center gap-1 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full">
                                {lang === 'ja' ? '地図で見る' : 'View on map'} →
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Page title (below the Featured section) */}
              <div className="px-6 mb-4 max-w-3xl mx-auto w-full">
                <h1 className="text-base font-bold tracking-tight text-[#112A2E]/80 uppercase">
                  {lang === 'ja' ? '日本のマップから探す' : 'Search On Japanese Map'}
                </h1>
              </div>

              {/* Big categories, each with a Netflix-style horizontal row of portrait cards */}
              <div className="flex flex-col gap-7 max-w-3xl mx-auto w-full">
                {BIG_CATEGORIES.map((big) => (
                  <section key={big.id}>
                    <h2 className="px-6 mb-2.5 text-lg font-extrabold text-[#112A2E] tracking-tight">
                      {big.title[lang]}
                    </h2>

                    <div
                      className="flex gap-3 overflow-x-auto px-6 pb-1.5 snap-x [&::-webkit-scrollbar]:hidden"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {big.items.length > 0 ? (
                        big.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleCategoryClick(item.id)}
                            className="relative flex-shrink-0 w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-md snap-start group cursor-pointer ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]"
                          >
                            <img
                              src={cdn(item.image, 400)}
                              alt=""
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-3">
                              <h3 className="text-white text-sm font-bold leading-tight drop-shadow-md">
                                {item.title[lang]}
                              </h3>
                            </div>
                          </button>
                        ))
                      ) : (
                        /* Empty big category (content coming later) */
                        <div className="flex-shrink-0 w-32 aspect-[2/3] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex items-center justify-center text-center px-2">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            {lang === 'ja' ? '準備中' : 'Coming soon'}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )
        ) : currentTab === Tab.MY_JAPAN ? (
          /* Integrated "My Japan" prefecture map (from the my-japan project) */
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col pb-[64px]">
            <MyJapanView />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
            <span className="text-sm tracking-wide uppercase">
              {currentTab} Content Page
            </span>
          </div>
        )}
      </main>

      {/* 2. Bottom Navigation component */}
      <BottomNav currentTab={currentTab} setCurrentTab={handleTabChange} />
    </div>
  );
}


