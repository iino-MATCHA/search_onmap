/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = rawUrl.replace(/^['"]|['"]$/g, '');
const supabaseKey = rawKey.replace(/^['"]|['"]$/g, '');

export const supabase = createClient(supabaseUrl, supabaseKey);

