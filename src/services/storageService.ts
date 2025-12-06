// Storage Service - Client-side interface for interview storage
// Calls API routes which interact with Vercel KV

import { StoredInterview } from '@/types';

// Save completed interview
export async function saveCompletedInterview(
  interview: Omit<StoredInterview, 'completedAt' | 'status'>,
  participantToken?: string | null
): Promise<{ success: boolean; id: string }> {
  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (participantToken) {
      headers['Authorization'] = `Bearer ${participantToken}`;
    }

    const response = await fetch('/api/interviews/save', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...interview,
        completedAt: Date.now(),
        status: 'completed'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving interview:', error);
    return { success: false, id: '' };
  }
}

// Get all interviews (researcher only)
export async function getAllInterviews(): Promise<StoredInterview[]> {
  try {
    const response = await fetch('/api/interviews');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.interviews || [];
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return [];
  }
}

// Get single interview by ID
export async function getInterview(id: string): Promise<StoredInterview | null> {
  try {
    const response = await fetch(`/api/interviews/${id}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.interview || null;
  } catch (error) {
    console.error('Error fetching interview:', error);
    return null;
  }
}

// Export all interviews as ZIP
export async function exportAllInterviews(): Promise<Blob | null> {
  try {
    const response = await fetch('/api/interviews/export');

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting interviews:', error);
    return null;
  }
}
