import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getIpAddress } from '@/lib/utils';

// GET /api/audit-logs
export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get('limit') || '50';
    const offset = request.nextUrl.searchParams.get('offset') || '0';

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [parseInt(limit), parseInt(offset)]
      );

      const countResult = await client.query(`SELECT COUNT(*) FROM audit_logs`);
      const total = parseInt(countResult.rows[0].count, 10);

      return NextResponse.json({
        entries: result.rows,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/audit-logs (create audit entry)
export async function POST(request: NextRequest) {
  try {
    const { actor, action, target, role, status, details } = await request.json() as Record<string, any>;
    const ipAddress = getIpAddress(request);

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO audit_logs (actor, action, target, ip_address, role, status, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [actor, action, target, ipAddress, role || null, status, JSON.stringify(details || {})]
      );

      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
