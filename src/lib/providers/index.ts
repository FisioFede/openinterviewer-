// AI Provider Factory
// Returns the appropriate provider based on environment configuration

import { AIProvider } from '../ai';
import { GeminiProvider } from './gemini';
import { ClaudeProvider } from './claude';

export type ProviderType = 'gemini' | 'claude';

// Get the interview AI provider based on configuration
export function getInterviewProvider(): AIProvider {
  const providerType = (process.env.AI_PROVIDER || 'gemini') as ProviderType;

  switch (providerType) {
    case 'claude':
      return new ClaudeProvider();
    case 'gemini':
    default:
      return new GeminiProvider();
  }
}

// Speech (STT/TTS) always uses Gemini for best cost/capability
// This returns a Gemini-specific client for speech operations
export function getSpeechProvider() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for speech services');
  }

  // Import dynamically to avoid issues when Gemini isn't needed
  const { GoogleGenAI } = require('@google/genai');
  return new GoogleGenAI({ apiKey });
}

export { GeminiProvider } from './gemini';
export { ClaudeProvider } from './claude';
