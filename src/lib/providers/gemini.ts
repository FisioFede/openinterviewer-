// Gemini AI Provider Implementation
// Server-side only - uses API key from environment

import { GoogleGenAI, Type } from '@google/genai';
import {
  AIProvider,
  buildInterviewSystemPrompt,
  cleanJSON,
  defaultInterviewResponse,
  defaultSynthesisResult
} from '../ai';
import {
  buildGreetingPrompt,
  getDefaultGreeting,
  buildSynthesisPrompt
} from '../prompts';
import {
  StudyConfig,
  ParticipantProfile,
  InterviewMessage,
  SynthesisResult,
  BehaviorData,
  AIInterviewResponse,
  QuestionProgress
} from '@/types';

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.model = process.env.AI_MODEL || 'gemini-2.5-flash';
  }

  async generateInterviewResponse(
    history: InterviewMessage[],
    studyConfig: StudyConfig,
    participantProfile: ParticipantProfile | null,
    questionProgress: QuestionProgress,
    currentContext: string
  ): Promise<AIInterviewResponse> {
    const systemInstruction = buildInterviewSystemPrompt(
      studyConfig,
      participantProfile,
      questionProgress,
      currentContext
    );

    try {
      const chat = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: {
                type: Type.STRING,
                description: 'Your response to the participant'
              },
              questionAddressed: {
                type: Type.NUMBER,
                nullable: true,
                description: '0-based index of core question substantially addressed in this exchange, or null'
              },
              phaseTransition: {
                type: Type.STRING,
                nullable: true,
                enum: ['background', 'core-questions', 'exploration', 'feedback', 'wrap-up'],
                description: 'If interview should move to a new phase, specify it'
              },
              profileUpdates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fieldId: { type: Type.STRING },
                    value: { type: Type.STRING, nullable: true },
                    status: {
                      type: Type.STRING,
                      enum: ['extracted', 'vague', 'refused']
                    }
                  },
                  required: ['fieldId', 'status']
                },
                description: 'Profile fields extracted or updated from user response'
              },
              shouldConclude: {
                type: Type.BOOLEAN,
                description: 'True if interview should end (after wrap-up message)'
              }
            },
            required: ['message', 'profileUpdates', 'shouldConclude']
          }
        },
        history: history.slice(-10).map(h => ({
          role: h.role === 'ai' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }))
      });

      const lastUserMessage = history.filter(m => m.role === 'user').pop();
      const result = await chat.sendMessage({
        message: lastUserMessage?.content || 'Please continue the interview.'
      });

      const parsed = JSON.parse(cleanJSON(result.text || '{}'));
      return {
        message: parsed.message || "That's interesting. Could you tell me more?",
        questionAddressed: parsed.questionAddressed ?? null,
        phaseTransition: parsed.phaseTransition ?? null,
        profileUpdates: parsed.profileUpdates || [],
        shouldConclude: parsed.shouldConclude || false
      };
    } catch (error) {
      console.error('Gemini interview response error:', error);
      return defaultInterviewResponse;
    }
  }

  async getInterviewGreeting(studyConfig: StudyConfig): Promise<string> {
    const prompt = buildGreetingPrompt(studyConfig);

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      });
      return response.text || getDefaultGreeting(studyConfig);
    } catch (error) {
      console.error('Gemini greeting error:', error);
      return getDefaultGreeting(studyConfig);
    }
  }

  async synthesizeInterview(
    history: InterviewMessage[],
    studyConfig: StudyConfig,
    behaviorData: BehaviorData,
    participantProfile: ParticipantProfile | null
  ): Promise<SynthesisResult> {
    const prompt = buildSynthesisPrompt(history, studyConfig, behaviorData, participantProfile);

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              statedPreferences: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'What participant explicitly said they value/want'
              },
              revealedPreferences: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'What their behavior/emphasis revealed'
              },
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    theme: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    frequency: { type: Type.NUMBER }
                  }
                }
              },
              contradictions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              keyInsights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              bottomLine: {
                type: Type.STRING,
                description: 'One-sentence summary insight for the researcher'
              }
            },
            required: ['statedPreferences', 'revealedPreferences', 'themes', 'keyInsights', 'bottomLine']
          }
        }
      });

      return JSON.parse(cleanJSON(response.text || '{}')) as SynthesisResult;
    } catch (error) {
      console.error('Gemini synthesis error:', error);
      return defaultSynthesisResult;
    }
  }
}
