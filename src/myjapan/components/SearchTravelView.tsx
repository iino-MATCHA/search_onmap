/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import JapanMap from './JapanMap';

interface SearchTravelViewProps {
  onSelectPrefecture: (id: string) => void;
}

export default function SearchTravelView({ onSelectPrefecture }: SearchTravelViewProps) {
  return (
    <div className="flex-grow flex flex-col overflow-hidden w-full" id="search-travel-wrapper">
      {/* Dynamic Interactive SVG Map of Japan containing integrated search bar */}
      <JapanMap onSelectPrefecture={onSelectPrefecture} />
    </div>
  );
}
