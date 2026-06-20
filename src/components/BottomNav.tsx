/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Map, Search, Gamepad2, Home } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
}

export default function BottomNav({ currentTab, setCurrentTab }: BottomNavProps) {
  // tab: null = リンク先ページ未作成（押しても遷移しない）
  const navItems = [
    { key: 'my_japan', label: 'My Japan', icon: Map, tab: Tab.MY_JAPAN },
    { key: 'search', label: 'Search', icon: Search, tab: null },
    { key: 'games', label: 'Games', icon: Gamepad2, tab: null },
    { key: 'home', label: 'Home', icon: Home, tab: null },
  ];

  return (
    <nav 
      id="bottom-tab-navigation"
      className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-0 bg-white border-t border-slate-200/80 px-4 py-2 flex justify-around items-center z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
    >
      <div className="flex w-full justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.tab !== null && currentTab === item.tab;
          return (
            <button
              key={item.key}
              onClick={() => { if (item.tab !== null) setCurrentTab(item.tab); }}
              className={`flex flex-col items-center justify-center py-1 flex-1 transition-all duration-200 relative cursor-pointer select-none ${
                isActive
                  ? 'text-matcha scale-102 font-bold'
                  : 'text-gray-400 hover:text-slate-600'
              }`}
              id={`nav-item-${item.key}`}
            >
              <div className={`p-1.5 rounded-full transition-all duration-200 ${
                isActive ? 'bg-matcha/10' : 'bg-transparent'
              }`}>
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
              
              {isActive && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-matcha" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
