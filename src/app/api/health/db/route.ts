import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-health-secret');
  if (!process.env.HEALTH_SECRET || secret !== process.env.HEALTH_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const diagnostics = {
    ok: false,
    connection: false,
    usersTableExists: false,
    authTokensTableExists: false,
    certificatesTableExists: false,
    error: null as string | null,
    dbCode: null as string | null,
  };

  try {
    const client = await pool.connect();

    try {
      await client.query('SELECT 1');
      diagnostics.connection = true;

      const tablesResult = await client.query(
        `SELECT
          to_regclass('public.users') AS users_table,
          to_regclass('public.auth_tokens') AS auth_tokens_table,
          to_regclass('public.certificates') AS certificates_table`
      );

      const row = tablesResult.rows[0] || {};
      diagnostics.usersTableExists = !!row.users_table;
      diagnostics.authTokensTableExists = !!row.auth_tokens_table;
      diagnostics.certificatesTableExists = !!row.certificates_table;

      diagnostics.ok =
        diagnostics.connection &&
        diagnostics.usersTableExists &&
        diagnostics.authTokensTableExists &&
        diagnostics.certificatesTableExists;

      return NextResponse.json(diagnostics, {
        status: diagnostics.ok ? 200 : 503,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    diagnostics.error = error?.message || 'Unknown database error';
    diagnostics.dbCode = error?.code || null;

    return NextResponse.json(diagnostics, { status: 503 });
  }
}
