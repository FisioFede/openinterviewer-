// Research Interview Tool Types

// ============================================
// Interview Phase & Progress Tracking
// ============================================

export type InterviewPhase =
  | 'background'      // AI gathers participant context
  | 'core-questions'  // Working through core research questions
  | 'exploration'     // Optional deeper exploration
  | 'feedback'        // Final feedback for researchers
  | 'wrap-up';        // AI concludes, interview complete

export interface QuestionProgress {
  questionsAsked: number[];  // Indices of completed questions
  total: number;
  currentPhase: InterviewPhase;
  isComplete: boolean;
}

// ============================================
// Profile Schema - Researcher-defined fields
// ============================================

export interface ProfileField {
  id: string;
  label: string;              // e.g., "Current Role"
  extractionHint: string;     // e.g., "Their job title or position"
  required: boolean;
  options?: string[];         // Optional preset options for validation
}

export type ProfileFieldStatus = 'pending' | 'extracted' | 'vague' | 'refused';

export interface ProfileFieldValue {
  fieldId: string;
  value: string | null;
  status: ProfileFieldStatus;
  extractedAt?: number;
}

export interface ParticipantProfile {
  id: string;
  fields: ProfileFieldValue[];  // Structured field values
  rawContext: string;           // Full context summary from conversation
  timestamp: number;
}

// ============================================
// Study Configuration
// ============================================

export type AIBehavior = 'structured' | 'standard' | 'exploratory';

export interface StudyConfig {
  id: string;
  name: string;
  description: string;
  researchQuestion: string;
  coreQuestions: string[];
  topicAreas: string[];           // General topic areas for synthesis
  profileSchema: ProfileField[];  // Fields to collect during interview
  aiBehavior: AIBehavior;
  consentText: string;
  createdAt: number;
}

// ============================================
// Interview Messages
// ============================================

export interface InterviewMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  isVoice?: boolean;
}

// ============================================
// Behavior & Analysis Data
// ============================================

export interface BehaviorData {
  timePerTopic: Record<string, number>;
  messagesPerTopic: Record<string, number>;
  topicsExplored: string[];
  contradictions: string[];
}

export interface SynthesisResult {
  statedPreferences: string[];
  revealedPreferences: string[];
  themes: { theme: string; evidence: string; frequency: number }[];
  contradictions: string[];
  keyInsights: string[];
  bottomLine: string;
}

// ============================================
// App State
// ============================================

export type AppStep =
  | 'setup'        // Researcher configures study
  | 'consent'      // Participant sees consent + foreshadowing
  | 'interview'    // Main interview chat (includes background gathering)
  | 'synthesis'    // Analysis results
  | 'export';      // Export data

export type ViewMode = 'researcher' | 'participant';

export interface ContextEntry {
  id: string;
  text: string;
  source: 'voice' | 'text' | 'system';
  timestamp: number;
}

// ============================================
// AI Response Structure (for API routes)
// ============================================

export interface AIInterviewResponse {
  message: string;
  questionAddressed: number | null;     // Which core question was covered (0-indexed)
  phaseTransition: InterviewPhase | null;  // If moving to new phase
  profileUpdates: {
    fieldId: string;
    value: string | null;
    status: 'extracted' | 'vague' | 'refused';
  }[];
  shouldConclude: boolean;              // AI signals interview should end
}

// ============================================
// Stored Interview (Vercel KV)
// ============================================

export interface StoredInterview {
  id: string;
  studyId: string;
  studyName: string;
  participantProfile: ParticipantProfile;
  transcript: InterviewMessage[];
  synthesis: SynthesisResult | null;
  behaviorData: BehaviorData;
  createdAt: number;
  completedAt: number;
  status: 'in_progress' | 'completed';
}

// ============================================
// Participant Token (URL)
// ============================================

export interface ParticipantToken {
  studyId: string;
  studyConfig: StudyConfig;
  createdAt: number;
  expiresAt?: number;
}
