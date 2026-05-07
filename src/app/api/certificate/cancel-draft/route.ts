import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import pool from '@/lib/db';

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error: authError } = await supabase.auth.getUser();
    if (authError || !data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE certificates
         SET status = 'cancelled', updated_at = NOW()
         WHERE user_id = $1 AND status = 'draft'
         RETURNING id`,
        [data.user.id]
      );
      const cancelled = result.rows.length > 0 ? result.rows[0].id : null;
      return NextResponse.json({ ok: true, cancelled });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[cancel-draft] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
