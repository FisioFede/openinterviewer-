// AI Provider Abstraction Layer
// Supports Gemini (default) and Claude for interview AI

import {
  StudyConfig,
  ParticipantProfile,
  InterviewMessage,
  SynthesisResult,
  BehaviorData,
  AIInterviewResponse,
  QuestionProgress,
  AggregateSynthesisResult
} from '@/types';

// Re-export prompts from centralized location
// See src/lib/prompts/ for customization
export {
  buildInterviewSystemPrompt,
  getAIBehaviorInstruction,
  formatProfileFields
} from './prompts';

/**
 * Interface that all AI providers (Gemini, Claude, etc.) must implement.
 * This standardizes the interaction between the application and different LLMs.
 */
export interface AIProvider {
  /**
   * Generates a response from the AI interviewer.
   * 
   * @param history - The full history of the interview conversation.
   * @param studyConfig - The configuration/script for the study.
   * @param participantProfile - The current known details about the participant.
   * @param questionProgress - Tracks which questions have been asked/answered.
   * @param currentContext - Any additional context or system instructions.
   * @returns Promise resolving to the AI's structured response (message + state updates).
   */
  generateInterviewResponse(
    history: InterviewMessage[],
    studyConfig: StudyConfig,
    participantProfile: ParticipantProfile | null,
    questionProgress: QuestionProgress,
    currentContext: string
  ): Promise<AIInterviewResponse>;

  /**
   * Generates the initial greeting message for the interview.
   * 
   * @param studyConfig - The study configuration.
   * @returns Promise resolving to the greeting string.
   */
  getInterviewGreeting(studyConfig: StudyConfig): Promise<string>;

  /**
   * Analyzes a completed interview to produce a synthesis of findings.
   * 
   * @param history - The full interview transcript.
   * @param studyConfig - The study configuration.
   * @param behaviorData - Metadata about the interview (timing, topics, etc.).
   * @param participantProfile - The collected participant profile.
   * @returns Promise resolving to the structured synthesis result.
   */
  synthesizeInterview(
    history: InterviewMessage[],
    studyConfig: StudyConfig,
    behaviorData: BehaviorData,
    participantProfile: ParticipantProfile | null
  ): Promise<SynthesisResult>;

  /**
   * Aggregates findings across multiple interviews to find common themes.
   * 
   * @param studyConfig - The study configuration.
   * @param syntheses - A list of synthesis results from individual interviews.
   * @param interviewCount - The total number of interviews included.
   * @returns Promise resolving to the aggregate synthesis result.
   */
  synthesizeAggregate(
    studyConfig: StudyConfig,
    syntheses: SynthesisResult[],
    interviewCount: number
  ): Promise<Omit<AggregateSynthesisResult, 'studyId' | 'interviewCount' | 'generatedAt'>>;

  /**
   * Generates a proposal for a follow-up study based on aggregate findings.
   * 
   * @param parentConfig - The configuration of the current/parent study.
   * @param synthesis - The aggregate findings from the current study.
   * @returns Promise resolving to the new study parameters.
   */
  generateFollowupStudy(
    parentConfig: StudyConfig,
    synthesis: AggregateSynthesisResult
  ): Promise<{ name: string; researchQuestion: string; coreQuestions: string[] }>;
}

// Response schema for structured output (Gemini format)
export const interviewResponseSchema = {
  type: 'OBJECT' as const,
  properties: {
    message: {
      type: 'STRING' as const,
      description: 'Your response to the participant'
    },
    questionAddressed: {
      type: 'NUMBER' as const,
      nullable: true,
      description: '0-based index of core question substantially addressed in this exchange, or null'
    },
    phaseTransition: {
      type: 'STRING' as const,
      nullable: true,
      enum: ['background', 'core-questions', 'exploration', 'feedback', 'wrap-up'],
      description: 'If interview should move to a new phase, specify it'
    },
    profileUpdates: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          fieldId: { type: 'STRING' as const },
          value: { type: 'STRING' as const, nullable: true },
          status: {
            type: 'STRING' as const,
            enum: ['extracted', 'vague', 'refused']
          }
        },
        required: ['fieldId', 'status']
      },
      description: 'Profile fields extracted or updated from user response'
    },
    shouldConclude: {
      type: 'BOOLEAN' as const,
      description: 'True if interview should end (after wrap-up message)'
    }
  },
  required: ['message', 'profileUpdates', 'shouldConclude']
};

// Synthesis response schema
export const synthesisResponseSchema = {
  type: 'OBJECT' as const,
  properties: {
    statedPreferences: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'What participant explicitly said they value/want'
    },
    revealedPreferences: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'What their behavior/emphasis revealed'
    },
    themes: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          theme: { type: 'STRING' as const },
          evidence: { type: 'STRING' as const },
          frequency: { type: 'NUMBER' as const }
        }
      }
    },
    contradictions: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const }
    },
    keyInsights: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const }
    },
    bottomLine: {
      type: 'STRING' as const,
      description: 'One-sentence summary insight for the researcher'
    }
  },
  required: ['statedPreferences', 'revealedPreferences', 'themes', 'keyInsights', 'bottomLine']
};

/**
 * Cleans JSON output from LLMs by removing Markdown code blocks and finding the JSON object.
 * 
 * @param text - The raw text response from the LLM.
 * @returns A clean JSON string (hopefully).
 */
export const cleanJSON = (text: string): string => {
  if (!text) return '{}';
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');

  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    let depth = 0;
    for (let i = firstBracket; i < cleaned.length; i++) {
      if (cleaned[i] === '[') depth++;
      if (cleaned[i] === ']') depth--;
      if (depth === 0) return cleaned.substring(firstBracket, i + 1);
    }
  }

  if (firstBrace !== -1) {
    let depth = 0;
    for (let i = firstBrace; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      if (cleaned[i] === '}') depth--;
      if (depth === 0) return cleaned.substring(firstBrace, i + 1);
    }
  }

  return cleaned;
};

// Default fallback responses
export const defaultInterviewResponse: AIInterviewResponse = {
  message: "I appreciate you sharing that. What else comes to mind?",
  questionAddressed: null,
  phaseTransition: null,
  profileUpdates: [],
  shouldConclude: false
};

export const defaultSynthesisResult: SynthesisResult = {
  statedPreferences: [],
  revealedPreferences: [],
  themes: [],
  contradictions: [],
  keyInsights: ['Analysis pending...'],
  bottomLine: 'Interview synthesis in progress.'
};

// Aggregate synthesis response schema (Gemini format)
export const aggregateSynthesisResponseSchema = {
  type: 'OBJECT' as const,
  properties: {
    commonThemes: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          theme: { type: 'STRING' as const },
          frequency: { type: 'NUMBER' as const },
          representativeQuotes: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const }
          }
        }
      },
      description: 'Patterns appearing across multiple interviews'
    },
    divergentViews: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          topic: { type: 'STRING' as const },
          viewA: { type: 'STRING' as const },
          viewB: { type: 'STRING' as const }
        }
      },
      description: 'Areas where participants had different perspectives'
    },
    keyFindings: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'Major discoveries that answer the research question'
    },
    researchImplications: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'What these findings mean for the field/practice'
    },
    bottomLine: {
      type: 'STRING' as const,
      description: 'One paragraph summarizing key takeaways from all interviews'
    }
  },
  required: ['commonThemes', 'keyFindings', 'bottomLine']
};

// Default fallback for aggregate synthesis
export const defaultAggregateSynthesisResult = {
  commonThemes: [],
  divergentViews: [],
  keyFindings: ['Analysis pending...'],
  researchImplications: [],
  bottomLine: 'Aggregate synthesis in progress.'
};
