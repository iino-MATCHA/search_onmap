/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Tab {
  ESIM = 'esim',
  COUPONS = 'coupons',
  MY_JAPAN = 'my_japan',
  REFERRAL = 'referral',
  MY_PAGE = 'my_page'
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
}

