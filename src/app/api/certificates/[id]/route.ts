import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Certificate } from '@/lib/types';

// GET /api/certificates/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM certificates WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Certificate not found' },
          { status: 404 }
        );
      }

      const certificate = result.rows[0] as Certificate;
      return NextResponse.json(certificate);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/certificates/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json() as Record<string, any>;

    const client = await pool.connect();
    try {
      // Build UPDATE query dynamically
      const allowedFields = ['display_slug', 'is_public', 'is_active', 'status', 'data_status'];
      const keys = Object.keys(updates).filter((k) => allowedFields.includes(k));

      if (keys.length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const values = keys.map((k) => updates[k]);
      values.push(id);

      const result = await client.query(
        `UPDATE certificates SET ${setClause}, updated_at = NOW()
         WHERE id = $${keys.length + 1}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Certificate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
