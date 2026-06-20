/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CategoryResults from './components/CategoryResults';
import { Tab } from './types';
import { ChevronRight } from 'lucide-react';

interface SearchCategory {
  id: string;
  title: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
}

const CATEGORIES: SearchCategory[] = [
  {
    id: 'Festivals',
    title: {
      en: 'Festivals',
      ja: 'お祭り・地方行事'
    },
    description: {
      en: 'Experience Japan’s vibrant culture through traditional Matsuri, featuring grand dance parades.',
      ja: '伝統的なお祭りや熱気あふれる踊りを通じて、日本の活気ある文化を体験しましょう。'
    }
  },
  {
    id: 'Fire works',
    title: {
      en: 'Fire works',
      ja: '花火大会'
    },
    description: {
      en: 'Marvel at legendary Hanabi festival displays with massive artistic pyrotechnics.',
      ja: '夜空を美しく染める、日本最高峰の大迫力な芸術的花火大会を巡りましょう。'
    }
  },
  {
    id: 'Onsen/Hot Spring',
    title: {
      en: 'Onsen/Hot Spring',
      ja: '温泉・お風呂'
    },
    description: {
      en: 'Relax in mineral-rich natural volcanic waters, nestled among beautiful nature.',
      ja: '豊かな自然に囲まれた、日本全国の心も体も極上に癒やされる名湯・秘湯。'
    }
  },
  {
    id: 'Mountain',
    title: {
      en: 'Mountains',
      ja: '山・登山'
    },
    description: {
      en: 'Conquer iconic peaks and sacred summits, from Mt. Fuji to alpine trails with breathtaking views.',
      ja: '富士山から北アルプスまで、日本の名峰・霊峰を巡り、絶景の山歩きを楽しみましょう。'
    }
  },
  {
    id: 'Sake',
    title: {
      en: 'Sake Breweries',
      ja: '酒蔵・日本酒'
    },
    description: {
      en: 'Tour historic sake districts and breweries, tasting Japan’s finest rice wine at the source.',
      ja: '歴史ある酒蔵の街を巡り、名水が育んだ日本酒を蔵元で味わい尽くしましょう。'
    }
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
              <CategoryResults 
                categoryTitle={selectedCategory} 
                onBack={() => setSelectedCategory(null)} 
                lang={lang}
              />
            </div>
          ) : (
            <div className="w-full flex-1 pt-4 pb-8 flex flex-col overflow-y-auto">
              {/* Title: Direct background-style typography without any box borders - smaller and pushed up to left */}
              <div className="px-6 mb-3.5 max-w-2xl mx-auto w-full">
                <h1 className="text-base font-bold tracking-tight text-[#112A2E]/80 uppercase">
                  {lang === 'ja' ? '日本のマップから探す' : 'Search On Japanese Map'}
                </h1>
              </div>

              {/* Tap-friendly 100% width list container */}
              <div className="w-full border-y border-gray-100 bg-white">
                <div className="max-w-2xl mx-auto w-full">
                  {CATEGORIES.map((category, index) => {
                    return (
                      <button
                        key={index}
                        onClick={() => handleCategoryClick(category.id)}
                        className="w-full flex items-center justify-between py-3 px-6 text-left transition-colors duration-150 hover:bg-slate-50/75 active:bg-slate-100/90 focus:outline-none focus:bg-slate-50 border-b border-gray-100 last:border-0 group cursor-pointer"
                      >
                        {/* Left: Text column containing title and description */}
                        <div className="flex-1 pr-4">
                          <h2 className="text-base font-semibold text-[#112A2E] group-hover:text-matcha transition-colors">
                            {category.title[lang]}
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                            {category.description[lang]}
                          </p>
                        </div>
                        
                        {/* Right indicator mark */}
                        <div className="text-slate-300 group-hover:text-matcha transition-colors flex-shrink-0">
                          <ChevronRight className="w-4.5 h-4.5 stroke-[2.2]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
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


