/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CategoryResults from './components/CategoryResults';
import AnimeResults from './components/AnimeResults';
import FoodResults, { FoodType } from './components/FoodResults';
import { Tab } from './types';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.MY_JAPAN);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ja'>('en');

  const handleCategoryClick = (categoryId: string) => {
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
        {currentTab === Tab.MY_JAPAN ? (
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
                <CategoryResults
                  categoryTitle={selectedCategory}
                  onBack={() => setSelectedCategory(null)}
                  lang={lang}
                />
              )}
            </div>
          ) : (
            <div
              className="w-full flex-1 pt-4 pb-10 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Page title */}
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


