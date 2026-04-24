import { initializeDatabase } from '@/lib/db';

export async function POST() {
  try {
    await initializeDatabase();
    return Response.json({
      success: true,
      message: 'Database initialized successfully',
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Database initialization failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    message: 'POST to this endpoint to initialize the database',
  });
}
