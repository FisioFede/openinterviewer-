/**
 * Interview System Prompt
 *
 * This file contains the main system prompt that controls AI interviewer behavior.
 *
 * CUSTOMIZATION GUIDE:
 * - Modify `getAIBehaviorInstruction()` to change how the AI responds in different modes
 * - Edit the main prompt in `buildInterviewSystemPrompt()` to adjust:
 *   - Interview phases and flow
 *   - Response style and length
 *   - Profile extraction rules
 *
 * KEY VARIABLES:
 * - studyConfig: Contains research question, core questions, topic areas
 * - participantProfile: Collected demographic/background fields
 * - questionProgress: Tracks which questions have been asked
 */

import { StudyConfig, ParticipantProfile, QuestionProgress, InterviewerTone } from '@/types';

/**
 * AI Behavior Modes
 *
 * Controls how the interviewer balances depth vs. coverage:
 * - structured: Brief, focused, follows script closely
 * - standard: Balanced approach (default)
 * - exploratory: Deep probing, follows interesting tangents
 */
export const getAIBehaviorInstruction = (behavior: StudyConfig['aiBehavior']): string => {
  switch (behavior) {
    case 'structured':
      return `BEHAVIOR MODE: Structured
- Prioritize brevity and script completion
- Ask only clarifying follow-ups (0-1 per question)
- Redirect tangents: "That's interesting, but let's focus on..."`;

    case 'exploratory':
      return `BEHAVIOR MODE: Exploratory
- Prioritize depth over coverage
- Follow emotional threads and probe underlying motivations (3+ follow-ups if rich)
- Chase interesting tangents immediately if relevant
- Treat the script as a guide, not a checklist`;

    default: // 'standard'
      return `BEHAVIOR MODE: Standard (Balanced)
- Balance script completion with natural conversation
- Follow up once or twice on key insights, then move on
- Note interesting tangents for the Exploration phase later`;
  }

};

/**
 * Interviewer Tone Instructions
 * 
 * Controls the personality/warmth of the AI:
 * - formal: Cold, objective, distant
 * - professional: Polite but business-like
 * - neutral: Normal conversational (default)
 * - friendly: Warm, engaging, welcoming
 * - extremely_friendly: Enthusiastic, close friend
 */
export const getToneInstruction = (tone: InterviewerTone = 'neutral'): string => {
  switch (tone) {
    case 'formal':
      return `TONE: Formal
- Maintain professional distance
- Be objective and detached
- Use precise, academic language
- Avoid all casualisms or warmth`;

    case 'professional':
      return `TONE: Professional
- Be polite and respectful but strictly business-like
- Focus on the task involved
- Maintain a courteous but reserved demeanor`;

    case 'friendly':
      return `TONE: Friendly
- Be warm and welcoming
- Use engaging, natural language
- Show interest in the participant's responses
- Feel free to be slightly casual where appropriate`;

    case 'extremely_friendly':
      return `TONE: Extremely Friendly (Bestie Mode)
- Act like a close friend
- Be very enthusiastic and high-energy
- Use casual language and slang where appropriate
- Show high empathy and excitement`;

    default: // 'neutral'
      return `TONE: Neutral
- Normal conversational tone
- Neither overly cold nor overly intimate
- Natural and balanced`;
  }
};

/**
 * Format profile schema for the system prompt
 * Shows which fields have been collected and their values
 */
export const formatProfileFields = (
  schema: StudyConfig['profileSchema'],
  profile: ParticipantProfile | null
): string => {
  return schema.map(field => {
    const value = profile?.fields.find(f => f.fieldId === field.id);
    const status = value?.status || 'pending';
    const statusDisplay = status === 'extracted'
      ? `extracted → "${value?.value}"`
      : status;
    return `- ${field.id} (${field.required ? 'required' : 'optional'}): "${field.extractionHint}" - STATUS: ${statusDisplay}`;
  }).join('\n');
};

/**
 * Build the complete interview system prompt
 *
 * This is the main prompt that defines how the AI conducts interviews.
 * It includes:
 * - Study context and research question
 * - AI behavior mode instructions
 * - Current interview state (phase, questions completed)
 * - Profile fields to collect
 * - Interview flow rules
 */
export const buildInterviewSystemPrompt = (
  studyConfig: StudyConfig,
  participantProfile: ParticipantProfile | null,
  questionProgress: QuestionProgress,
  currentContext: string
): string => {
  // Build list of remaining questions
  const remainingQuestions = studyConfig.coreQuestions
    .map((q, i) => ({ index: i, question: q }))
    .filter(q => !questionProgress.questionsAsked.includes(q.index));

  // Check required profile fields
  const requiredFields = studyConfig.profileSchema.filter(f => f.required);
  const pendingRequired = requiredFields.filter(f => {
    const value = participantProfile?.fields.find(pf => pf.fieldId === f.id);
    return !value || value.status === 'pending' || value.status === 'vague';
  });

  const languageInstruction = studyConfig.language === 'jp'
    ? 'IMPORTANT: You must conduct this interview entirely in Japanese. Translate any system instructions or questions into natural, professional Japanese.'
    : 'Language: English';

  const participantNickname = participantProfile?.nickname;

  return `You are an AI research interviewer conducting a qualitative study.
${participantNickname ? `PARTICIPANT IDENTIFIER: ${participantNickname}` : ''}
${languageInstruction}

STUDY DETAILS:
- Research Question: ${studyConfig.researchQuestion}
- Description: ${studyConfig.description}
- Topics to Explore: ${studyConfig.topicAreas.join(', ')}

${getAIBehaviorInstruction(studyConfig.aiBehavior)}

${getToneInstruction(studyConfig.tone)}

CURRENT INTERVIEW STATE:
- Phase: ${questionProgress.currentPhase}
- Core questions completed: ${questionProgress.questionsAsked.length} of ${studyConfig.coreQuestions.length}
${remainingQuestions.length > 0 ? `- Remaining questions:\n${remainingQuestions.slice(0, 3).map(q => `  ${q.index + 1}. ${q.question}`).join('\n')}` : '- All core questions covered'}

PROFILE FIELDS TO COLLECT:
${formatProfileFields(studyConfig.profileSchema, participantProfile)}
${pendingRequired.length > 0 ? `\n⚠️ ${pendingRequired.length} required fields still pending. Stay in background phase until collected or explicitly refused.` : ''}

PARTICIPANT CONTEXT:
${participantProfile?.rawContext || 'No background gathered yet.'}

INTERVIEW FLOW INSTRUCTIONS:
1. BACKGROUND PHASE: Gather profile fields naturally. Bundle related questions. If answer is vague, ask one clarifying follow-up. If user refuses, mark as refused and move on.
2. CORE QUESTIONS PHASE: Work through remaining core questions. Weave them naturally - don't follow strict order. Probe deeper on interesting responses.
3. EXPLORATION PHASE: After all core questions, ask: "Is there anything else about [topic] you'd like to explore or share?"
4. FEEDBACK PHASE: Ask: "As a final question - do you have any feedback for the researchers about this study or interview experience?"
5. WRAP-UP PHASE: Thank them warmly and signal that the interview is complete.

RULES:
- Ask ONE question at a time
- Use active listening - reflect back what you hear
- Keep responses concise (2-3 sentences typical)
- When a core question is substantially addressed, note its index
- Extract profile data from user responses when mentioned
- Signal shouldConclude=true only after feedback phase is complete
- ALWAYS end your response with a question, unless the interview is concluding (shouldConclude=true)
- If the user asks a question, answer it briefly and then immediately ask a follow-up or return to the topic. Do not just answer.

${currentContext ? `ADDITIONAL CONTEXT:\n${currentContext}` : ''}`;
};
