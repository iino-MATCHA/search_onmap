/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gmibmhxozqkotdfkssac.supabase.co';
// @ts-ignore
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWJtaHhvenFrb3RkZmtzc2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODk0NzQsImV4cCI6MjA5NTg2NTQ3NH0.dKFLUNygXp8tu-gGxXd0DEmC7GjNfOpXDfi3sLHTxfM';

const supabaseUrl = rawUrl.replace(/^['"]|['"]$/g, '');
const supabaseKey = rawKey.replace(/^['"]|['"]$/g, '');

export const supabase = createClient(supabaseUrl, supabaseKey);

