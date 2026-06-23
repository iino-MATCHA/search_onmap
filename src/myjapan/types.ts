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

export interface TravelSpot {
  name: string;
  description: string;
  imageUrl: string;
}

export interface PrefectureTravelData {
  id: string;
  nameJa: string;
  nameEn: string;
  region: string;
  capital: string;
  description: string;
  spots: TravelSpot[];
  foods: string[];
  tips: string;
}
