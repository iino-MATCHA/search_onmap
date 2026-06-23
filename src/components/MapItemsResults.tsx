/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import GroupedSpotsResults, { GroupedSpot } from './GroupedSpotsResults';

interface MapItemsResultsProps {
  categoryTitle: string; // landing id: 'Festivals' | 'Fire works' | 'Onsen/Hot Spring' | 'Mountain'
  onBack: () => void;
  lang: 'en' | 'ja';
  initialItemId?: number | null;
}

const STORAGE = 'https://gmibmhxozqkotdfkssac.supabase.co/storage/v1/object/public/items_img';

// queryCode -> presentation config (title, faint cover background, dateless flag)
const CONFIG: { [code: string]: { title: { en: string; ja: string }; cover: string; dateless: boolean } } = {
  festivals: { title: { en: 'Festivals', ja: 'お祭り' }, cover: `${STORAGE}/festivals/2-akita-kanto.webp`, dateless: false },
  fireworks: { title: { en: 'Fireworks', ja: '花火大会' }, cover: `${STORAGE}/fireworks/14-sumida-fireworks.webp`, dateless: false },
  onsen: { title: { en: 'Onsen', ja: '温泉' }, cover: `${STORAGE}/onsen/21-kusatsu-onsen.webp`, dateless: true },
  mountain: { title: { en: 'Mountains', ja: '山・登山' }, cover: `${STORAGE}/mountain/131-mt-fuji.webp`, dateless: true }
};

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_ORDER = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

const codeFor = (title: string) => {
  const raw = title.toLowerCase().trim();
  if (raw === 'fire works' || raw === 'fireworks') return 'fireworks';
  if (raw === 'onsen/hot spring' || raw === 'onsen') return 'onsen';
  if (raw === 'festivals') return 'festivals';
  if (raw === 'mountain' || raw === 'mountains') return 'mountain';
  return raw;
};

export default function MapItemsResults({ categoryTitle, onBack, lang, initialItemId }: MapItemsResultsProps) {
  const code = codeFor(categoryTitle);
  const cfg = CONFIG[code] || { title: { en: categoryTitle, ja: categoryTitle }, cover: '', dateless: true };

  const groupLabel = (g: string, l: 'en' | 'ja') => {
    if (cfg.dateless) return l === 'ja' ? 'スポット' : 'Spot';
    const n = parseInt(g, 10);
    if (!n || n < 1 || n > 12) return g;
    return l === 'ja' ? `${n}月` : MONTHS_EN[n - 1];
  };

  return (
    <GroupedSpotsResults
      lang={lang}
      onBack={onBack}
      title={cfg.title}
      countNoun="spots"
      visitedKey="matcha_visited_items"
      order={cfg.dateless ? undefined : MONTH_ORDER}
      groupLabel={groupLabel}
      background={cfg.cover || null}
      initialSpotId={initialItemId}
      loader={async () => {
        const { data, error } = await supabase.from('items').select('*').eq('category', code);
        if (error) throw error;
        return (data || []).map((it: any) => ({
          ...it,
          group: cfg.dateless ? 'all' : (it.start_date ? String(it.start_date).split('-')[0] : 'other')
        })) as GroupedSpot[];
      }}
    />
  );
}
