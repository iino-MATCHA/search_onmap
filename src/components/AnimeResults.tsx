/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';
import GroupedSpotsResults, { GroupedSpot } from './GroupedSpotsResults';

interface AnimeResultsProps {
  onBack: () => void;
  lang: 'en' | 'ja';
}

// anime_id -> display title. Unknown ids fall back to a prettified slug.
const ANIME_NAMES: { [id: string]: { en: string; ja: string } } = {
  jiburi: { en: 'Studio Ghibli', ja: 'スタジオジブリ' },
  kyoani: { en: 'Kyoto Animation', ja: '京都アニメーション' },
  shinkai: { en: 'Makoto Shinkai', ja: '新海誠作品' },
  eva: { en: 'Evangelion', ja: 'エヴァンゲリオン' },
  jujutsu: { en: 'Jujutsu Kaisen', ja: '呪術廻戦' },
  lovelive: { en: 'Love Live!', ja: 'ラブライブ！' },
  slamdunk: { en: 'Slam Dunk', ja: 'スラムダンク' },
  yurucamp: { en: 'Yuru Camp', ja: 'ゆるキャン△' },
  anohana: { en: 'Anohana', ja: 'あの花' },
  garupan: { en: 'Girls und Panzer', ja: 'ガールズ&パンツァー' },
  higurashi: { en: 'Higurashi', ja: 'ひぐらしのなく頃に' },
  steinsgate: { en: 'Steins;Gate', ja: 'シュタインズ・ゲート' },
  yurionice: { en: 'Yuri on Ice', ja: 'ユーリ!!! on ICE' }
};

const animeLabel = (id: string, lang: 'en' | 'ja') => {
  const m = ANIME_NAMES[id];
  if (m) return m[lang];
  return id.charAt(0).toUpperCase() + id.slice(1);
};

export default function AnimeResults({ onBack, lang }: AnimeResultsProps) {
  return (
    <GroupedSpotsResults
      lang={lang}
      onBack={onBack}
      title={{ en: 'Anime Pilgrimage', ja: 'アニメ聖地' }}
      countNoun="spots"
      visitedKey="matcha_visited_anime"
      groupLabel={animeLabel}
      background="https://gmibmhxozqkotdfkssac.supabase.co/storage/v1/object/public/items_img/_covers/anime.jpg"
      loader={async () => {
        const { data, error } = await supabase.from('anime_spots').select('*');
        if (error) throw error;
        return (data || []).map((s: any) => ({ ...s, group: s.anime_id })) as GroupedSpot[];
      }}
    />
  );
}
