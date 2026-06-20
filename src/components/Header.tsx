/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Globe, User } from 'lucide-react';
import { Tab } from '../types';

interface HeaderProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  lang: 'en' | 'ja';
  setLang: (lang: 'en' | 'ja') => void;
}

export default function Header({ currentTab, setCurrentTab, lang, setLang }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center shadow-xs">
      {/* Left side: Accent solid circle + MATCHA bold label */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer select-none active:opacity-80 transition-opacity"
        onClick={() => setCurrentTab(Tab.MY_JAPAN)}
        id="matcha-header-logo"
      >
        <div
          className="w-5.5 h-5.5 rounded-full shadow-xs flex items-center justify-center"
          style={{ backgroundColor: '#9ACA3C' }}
        />
        <span className="font-sans font-bold tracking-tight text-[#1A1A1A] text-lg">
          MATCHA
        </span>
      </div>

      {/* Right side: Localization Selector & User profile outline trigger */}
      <div className="flex items-center gap-3">
        {/* Interactive Language Selector Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] shadow-3xs">
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer select-none ${
              lang === 'en'
                ? 'bg-white text-[#74A732] shadow-3xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ja')}
            className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer select-none ${
              lang === 'ja'
                ? 'bg-white text-[#74A732] shadow-3xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            日本語
          </button>
        </div>

        <button
          id="header-user-btn"
          aria-label="User Profile"
          className="p-1 bg-white border border-gray-200 hover:border-[#112A2E] hover:text-matcha transition-colors text-[#112A2E] flex items-center justify-center rounded-full relative shadow-3xs cursor-pointer focus:outline-hidden"
        >
          <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center bg-[#FDFEFC]">
            <User className="w-4.5 h-4.5 text-[#112A2E] stroke-[1.8]" />
          </div>
          {/* Active status indicator green dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-matcha border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
