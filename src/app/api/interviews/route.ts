// GET /api/interviews - List all interviews
// Protected: Requires authenticated session

import { NextResponse } from 'next/server';
import { getAllInterviews, isKVAvailable } from '@/lib/kv';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    // Check authentication with token validation
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!authCookie?.value) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the session token is valid
    const isValid = await verifySessionToken(authCookie.value);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    // Check if KV is available
    const kvAvailable = await isKVAvailable();
    if (!kvAvailable) {
      return NextResponse.json({
        interviews: [],
        warning: 'Storage not configured. Connect Vercel KV to enable persistence.'
      });
    }

    // Get all interviews
    const interviews = await getAllInterviews();

    return NextResponse.json({ interviews });
  } catch (error) {
    console.error('Interviews API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}
