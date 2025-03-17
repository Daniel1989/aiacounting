import { NextResponse } from 'next/server';

/**
 * This route handler is created to prevent Next.js from treating the icon.tsx component
 * as a route handler. It returns a 404 response for any requests to this path.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint does not exist' },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint does not exist' },
    { status: 404 }
  );
} 