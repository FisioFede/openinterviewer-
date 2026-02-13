// GET /api/studies/[id]/links - List all generated links for a study
// Protected: Requires authenticated session

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getStudyLinks, isKVAvailable } from '@/lib/kv';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // params is now a Promise in Next.js 15
) {
    try {
        // Await params first
        const { id } = await params;

        const cookieStore = await cookies();
        const authCookie = cookieStore.get(SESSION_COOKIE_NAME);

        if (!authCookie?.value) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const isValid = await verifySessionToken(authCookie.value);
        if (!isValid) {
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        if (!(await isKVAvailable())) {
            return NextResponse.json({ links: [] });
        }

        const links = await getStudyLinks(id);
        return NextResponse.json({ links });
    } catch (error) {
        console.error('Study links API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch study links' },
            { status: 500 }
        );
    }
}
