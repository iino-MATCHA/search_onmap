/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Tab {
  MY_JAPAN = 'my_japan'
}

export interface SupabaseItem {
  id: number;
  category: string;
  name_ja?: string;
  name_en?: string;
  desc_ja?: string;
  desc_en?: string;
  lat?: number;
  lng?: number;
  start_date?: string;
  end_date?: string;
  img_url?: string;
  prefecture_ja?: string;
  prefecture_en?: string;
  recommend?: boolean;
  matcha_link?: string | null;
}

