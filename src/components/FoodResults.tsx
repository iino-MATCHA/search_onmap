/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import GroupedSpotsResults, { GroupedSpot } from './GroupedSpotsResults';

export type FoodType = 'ramen' | 'wagashi' | 'sake';

interface FoodResultsProps {
  foodType: FoodType;
  onBack: () => void;
  lang: 'en' | 'ja';
}

interface Cat {
  id: string;
  level: string;
  parent_id: string | null;
  name_en: string;
  name_ja: string;
  sort_order: number;
  cover_image?: string | null;
  description_en?: string | null;
  description_ja?: string | null;
}

export default function FoodResults({ foodType, onBack, lang }: FoodResultsProps) {
  // Taxonomy for this mid-category (sub labels + chip order + mid title + hero data), from `categories`.
  const [labels, setLabels] = useState<{ [id: string]: { en: string; ja: string } }>({});
  const [order, setOrder] = useState<string[]>([]);
  const [title, setTitle] = useState<{ en: string; ja: string }>({ en: 'Food', ja: 'グルメ' });
  const [rows, setRows] = useState<{ [id: string]: Cat }>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .or(`id.eq.${foodType},parent_id.eq.${foodType}`)
        .order('sort_order');
      if (!mounted || !data) return;
      const map: { [id: string]: { en: string; ja: string } } = {};
      const byId: { [id: string]: Cat } = {};
      const subs: string[] = [];
      (data as Cat[]).forEach((c) => {
        map[c.id] = { en: c.name_en, ja: c.name_ja };
        byId[c.id] = c;
        if (c.level === 'small') subs.push(c.id);
        if (c.id === foodType) setTitle({ en: c.name_en, ja: c.name_ja });
      });
      setLabels(map);
      setRows(byId);
      setOrder(subs);
    })();
    return () => {
      mounted = false;
    };
  }, [foodType]);

  const groupLabel = (group: string, l: 'en' | 'ja') => labels[group]?.[l] || group;

  // Hero per group; the Must-Try (featured) group uses the mid-category's image + overview copy.
  const hero = (groupId: string) => {
    const c = rows[groupId === '__musttry__' ? foodType : groupId];
    if (!c) return null;
    return { image: c.cover_image || null, description: (lang === 'ja' ? c.description_ja : c.description_en) || null };
  };

  return (
    <GroupedSpotsResults
      lang={lang}
      onBack={onBack}
      title={title}
      countNoun="shops"
      visitedKey="matcha_visited_food"
      order={order}
      featured={{ id: '__musttry__', label: { en: 'Must-Try', ja: '必食' } }}
      groupLabel={groupLabel}
      hero={hero}
      background={rows[foodType]?.cover_image || null}
      loader={async () => {
        const { data, error } = await supabase.from('food_spots').select('*').eq('mid_category', foodType);
        if (error) throw error;
        return (data || []).map((s: any) => ({ ...s, group: s.sub_category, featured: !!s.must_try })) as GroupedSpot[];
      }}
    />
  );
}
