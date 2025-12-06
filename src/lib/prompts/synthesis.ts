/**
 * Interview Synthesis Prompt
 *
 * Analyzes completed interviews to extract patterns, themes, and insights.
 *
 * CUSTOMIZATION GUIDE:
 * - Modify analysis categories in the numbered list
 * - Add/remove what the AI looks for (themes, contradictions, etc.)
 * - Change the output structure expectations
 *
 * KEY VARIABLES:
 * - studyConfig: Research question and topic areas
 * - history: Full interview transcript
 * - behaviorData: Participant interaction patterns
 * - participantProfile: Collected demographic info
 */

import {
  StudyConfig,
  ParticipantProfile,
  InterviewMessage,
  BehaviorData
} from '@/types';

/**
 * Build the synthesis/analysis prompt
 *
 * This prompt instructs the AI to analyze the interview transcript
 * and extract meaningful patterns for researchers.
 */
export const buildSynthesisPrompt = (
  history: InterviewMessage[],
  studyConfig: StudyConfig,
  behaviorData: BehaviorData,
  participantProfile: ParticipantProfile | null
): string => {
  // Format transcript
  const interviewText = history
    .map(m => `${m.role === 'user' ? 'PARTICIPANT' : 'INTERVIEWER'}: ${m.content}`)
    .join('\n\n');

  // Format profile data for synthesis
  const profileSummary = participantProfile?.fields
    .filter(f => f.status === 'extracted' && f.value)
    .map(f => {
      const field = studyConfig.profileSchema.find(s => s.id === f.fieldId);
      return `${field?.label || f.fieldId}: ${f.value}`;
    })
    .join('\n') || 'No structured profile data';

  return `Analyze this research interview for key patterns and insights.

STUDY:
- Research Question: ${studyConfig.researchQuestion}
- Topics Explored: ${studyConfig.topicAreas.join(', ')}

PARTICIPANT PROFILE:
${profileSummary}

Context: ${participantProfile?.rawContext || 'Not available'}

INTERVIEW TRANSCRIPT:
${interviewText}

BEHAVIORAL DATA:
- Interview phases: ${JSON.stringify(behaviorData.messagesPerTopic)}

Analyze for:
1. What they explicitly stated as important
2. What their behavior/emphasis revealed
3. Key themes with evidence
4. Any contradictions between stated and revealed preferences
5. Key insights for the researcher`;
};

/**
 * Synthesis output schema description
 *
 * The AI should return:
 * - statedPreferences: What participant explicitly said they value
 * - revealedPreferences: What behavior/emphasis revealed
 * - themes: Key themes with evidence and frequency
 * - contradictions: Gaps between stated and revealed
 * - keyInsights: Actionable insights for researchers
 * - bottomLine: One-sentence summary
 */
export const synthesisOutputDescription = `
Expected output structure:
{
  "statedPreferences": ["What participant said they value/want"],
  "revealedPreferences": ["What their behavior/emphasis revealed"],
  "themes": [
    { "theme": "Theme name", "evidence": "Supporting quote/behavior", "frequency": 3 }
  ],
  "contradictions": ["Any gaps between stated and revealed preferences"],
  "keyInsights": ["Actionable insights for the researcher"],
  "bottomLine": "One-sentence summary insight"
}
`;
