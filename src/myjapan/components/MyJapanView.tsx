/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SearchTravelView from './SearchTravelView';

export default function MyJapanView() {
  const handleSelectPrefecture = (prefId: string) => {
    // Simply logging or keeping it passive since the detail page has been deleted.
    // The map itself updates its visited/none record status beautifully when tapped.
    console.log(`Prefecture selected: ${prefId}`);
  };

  return (
    <div 
      className="px-4 pt-2 pb-2 font-sans text-dark-slate flex flex-col flex-grow overflow-hidden relative h-full w-full" 
      id="my-japan-search-page"
    >
      {/* SearchTravelView is rendered directly containing the Japan SVG Map */}
      <div id="sub-tab-content-renderer" className="w-full flex-grow flex flex-col relative overflow-hidden">
        <SearchTravelView onSelectPrefecture={handleSelectPrefecture} />
      </div>
    </div>
  );
}

