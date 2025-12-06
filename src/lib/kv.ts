// Vercel KV (Redis) Client Setup
// Auto-provisioned during Vercel deployment

import { kv } from '@vercel/kv';
import { StoredInterview } from '@/types';

// Key prefixes for organizing data
const INTERVIEW_PREFIX = 'interview:';
const STUDY_INDEX_PREFIX = 'study-interviews:';

// Get interview by ID
export async function getInterview(id: string): Promise<StoredInterview | null> {
  try {
    return await kv.get<StoredInterview>(`${INTERVIEW_PREFIX}${id}`);
  } catch (error) {
    console.error('Error getting interview:', error);
    return null;
  }
}

// Save interview (create or update)
export async function saveInterview(interview: StoredInterview): Promise<boolean> {
  try {
    // Save the interview
    await kv.set(`${INTERVIEW_PREFIX}${interview.id}`, interview);

    // Add to study index for easy lookup by study
    await kv.sadd(`${STUDY_INDEX_PREFIX}${interview.studyId}`, interview.id);

    // Add to global index
    await kv.sadd('all-interviews', interview.id);

    return true;
  } catch (error) {
    console.error('Error saving interview:', error);
    return false;
  }
}

// Get all interviews
export async function getAllInterviews(): Promise<StoredInterview[]> {
  try {
    const ids = await kv.smembers('all-interviews');
    if (!ids || ids.length === 0) return [];

    const interviews = await Promise.all(
      ids.map(id => kv.get<StoredInterview>(`${INTERVIEW_PREFIX}${id}`))
    );

    return interviews
      .filter((i): i is StoredInterview => i !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting all interviews:', error);
    return [];
  }
}

// Get interviews for a specific study
export async function getStudyInterviews(studyId: string): Promise<StoredInterview[]> {
  try {
    const ids = await kv.smembers(`${STUDY_INDEX_PREFIX}${studyId}`);
    if (!ids || ids.length === 0) return [];

    const interviews = await Promise.all(
      ids.map(id => kv.get<StoredInterview>(`${INTERVIEW_PREFIX}${id}`))
    );

    return interviews
      .filter((i): i is StoredInterview => i !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting study interviews:', error);
    return [];
  }
}

// Delete interview
export async function deleteInterview(id: string, studyId: string): Promise<boolean> {
  try {
    await kv.del(`${INTERVIEW_PREFIX}${id}`);
    await kv.srem(`${STUDY_INDEX_PREFIX}${studyId}`, id);
    await kv.srem('all-interviews', id);
    return true;
  } catch (error) {
    console.error('Error deleting interview:', error);
    return false;
  }
}

// Check if KV is available (for development without KV)
export async function isKVAvailable(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch {
    return false;
  }
}
