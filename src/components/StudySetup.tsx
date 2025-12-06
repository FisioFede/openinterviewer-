'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { generateParticipantLink } from '@/services/geminiService';
import { StudyConfig, ProfileField, AIBehavior } from '@/types';
import {
  FileText,
  Plus,
  X,
  ArrowRight,
  Sparkles,
  Eye,
  Lightbulb,
  User,
  ToggleLeft,
  ToggleRight,
  Link as LinkIcon,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

// Common profile field presets
const PROFILE_PRESETS: ProfileField[] = [
  { id: 'role', label: 'Current Role', extractionHint: 'Their job title or position', required: true },
  { id: 'industry', label: 'Industry', extractionHint: 'The industry they work in', required: false },
  { id: 'experience', label: 'Years of Experience', extractionHint: 'How many years in their field', required: false },
  { id: 'team_size', label: 'Team Size', extractionHint: 'Size of team they work with', required: false },
  { id: 'location', label: 'Location', extractionHint: 'Where they are based (city/region)', required: false }
];

const StudySetup: React.FC = () => {
  const router = useRouter();
  const { setStudyConfig, setStep, studyConfig, loadExampleStudy, setViewMode, setParticipantToken } = useStore();

  const [name, setName] = useState(studyConfig?.name || '');
  const [description, setDescription] = useState(studyConfig?.description || '');
  const [researchQuestion, setResearchQuestion] = useState(studyConfig?.researchQuestion || '');
  const [coreQuestions, setCoreQuestions] = useState<string[]>(
    studyConfig?.coreQuestions || ['']
  );
  const [topicAreas, setTopicAreas] = useState<string[]>(
    studyConfig?.topicAreas || ['']
  );
  const [profileSchema, setProfileSchema] = useState<ProfileField[]>(
    studyConfig?.profileSchema || []
  );
  const [aiBehavior, setAiBehavior] = useState<AIBehavior>(
    studyConfig?.aiBehavior || 'standard'
  );
  const [consentText, setConsentText] = useState(
    studyConfig?.consentText ||
    'Thank you for participating in this research study. Your responses will be used to understand [research topic]. You may stop at any time. Do you consent to participate?'
  );

  // Participant link generation
  const [participantLink, setParticipantLink] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Preview state
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Sync form with studyConfig when it changes (e.g., after loading example)
  useEffect(() => {
    if (studyConfig) {
      setName(studyConfig.name);
      setDescription(studyConfig.description);
      setResearchQuestion(studyConfig.researchQuestion);
      setCoreQuestions(studyConfig.coreQuestions.length > 0 ? studyConfig.coreQuestions : ['']);
      setTopicAreas(studyConfig.topicAreas.length > 0 ? studyConfig.topicAreas : ['']);
      setProfileSchema(studyConfig.profileSchema || []);
      setAiBehavior(studyConfig.aiBehavior);
      setConsentText(studyConfig.consentText);
    }
  }, [studyConfig]);

  // Question management
  const addQuestion = () => setCoreQuestions([...coreQuestions, '']);
  const removeQuestion = (index: number) => {
    if (coreQuestions.length > 1) {
      setCoreQuestions(coreQuestions.filter((_, i) => i !== index));
    }
  };
  const updateQuestion = (index: number, value: string) => {
    const updated = [...coreQuestions];
    updated[index] = value;
    setCoreQuestions(updated);
  };

  // Topic management
  const addTopic = () => setTopicAreas([...topicAreas, '']);
  const removeTopic = (index: number) => {
    if (topicAreas.length > 1) {
      setTopicAreas(topicAreas.filter((_, i) => i !== index));
    }
  };
  const updateTopic = (index: number, value: string) => {
    const updated = [...topicAreas];
    updated[index] = value;
    setTopicAreas(updated);
  };

  // Profile field management
  const addProfileField = (preset?: ProfileField) => {
    if (preset) {
      if (!profileSchema.some(f => f.id === preset.id)) {
        setProfileSchema([...profileSchema, preset]);
      }
    } else {
      const newField: ProfileField = {
        id: `field-${Date.now()}`,
        label: '',
        extractionHint: '',
        required: false
      };
      setProfileSchema([...profileSchema, newField]);
    }
  };

  const removeProfileField = (id: string) => {
    setProfileSchema(profileSchema.filter(f => f.id !== id));
  };

  const updateProfileField = (id: string, updates: Partial<ProfileField>) => {
    setProfileSchema(profileSchema.map(f =>
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  const toggleFieldRequired = (id: string) => {
    setProfileSchema(profileSchema.map(f =>
      f.id === id ? { ...f, required: !f.required } : f
    ));
  };

  const buildConfig = (): StudyConfig => ({
    id: studyConfig?.id || `study-${Date.now()}`,
    name: name || 'Untitled Study',
    description,
    researchQuestion,
    coreQuestions: coreQuestions.filter(q => q.trim()),
    topicAreas: topicAreas.filter(t => t.trim()),
    profileSchema: profileSchema.filter(f => f.label.trim()),
    aiBehavior,
    consentText,
    createdAt: studyConfig?.createdAt || Date.now()
  });

  const handleSubmit = () => {
    const config = buildConfig();
    setStudyConfig(config);
    setStep('consent');
    router.push('/consent');
  };

  const handlePreview = async () => {
    setIsPreviewLoading(true);
    const config = buildConfig();
    setStudyConfig(config);

    // Generate a temporary preview token for API authentication
    try {
      const { token } = await generateParticipantLink(config);
      setParticipantToken(token);
    } catch (error) {
      // If token generation fails (e.g., not logged in), proceed anyway
      // The admin session cookie will be used as fallback for authenticated researchers
      console.warn('Could not generate preview token, using session auth:', error);
    }

    setIsPreviewLoading(false);
    setViewMode('participant');
    setStep('consent');
    router.push('/consent');
  };

  const handleGenerateLink = async () => {
    setIsGeneratingLink(true);
    try {
      const config = buildConfig();
      setStudyConfig(config);

      const response = await fetch('/api/generate-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyConfig: config })
      });

      const data = await response.json();
      // API returns absolute URL, use directly
      setParticipantLink(data.url);
    } catch (error) {
      console.error('Error generating link:', error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (participantLink) {
      navigator.clipboard.writeText(participantLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const isValid = name.trim() && researchQuestion.trim();

  const behaviorOptions: { id: AIBehavior; label: string; desc: string }[] = [
    {
      id: 'structured',
      label: 'Focus on covering all questions (Structured)',
      desc: 'Prioritize completion. Minimal follow-ups, redirect tangents.'
    },
    {
      id: 'standard',
      label: 'Balance coverage and depth (Standard)',
      desc: 'Default mode. Follow up on key insights, then move on.'
    },
    {
      id: 'exploratory',
      label: 'Focus on uncovering new insights (Exploratory)',
      desc: 'Prioritize depth. Chase interesting threads, probe emotions.'
    }
  ];

  const availablePresets = PROFILE_PRESETS.filter(
    preset => !profileSchema.some(f => f.id === preset.id)
  );

  return (
    <div className="min-h-screen bg-stone-900 p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-stone-700 flex items-center justify-center">
              <FileText className="text-stone-300" size={20} />
            </div>
            <h1 className="text-3xl font-bold text-white">Study Setup</h1>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={loadExampleStudy}
                className="px-4 py-2 text-sm bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-xl transition-colors flex items-center gap-2"
              >
                <Lightbulb size={16} />
                Load Example
              </button>
              {isValid && (
                <button
                  onClick={handlePreview}
                  disabled={isPreviewLoading}
                  className="px-4 py-2 text-sm bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPreviewLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Eye size={16} />
                  )}
                  {isPreviewLoading ? 'Loading...' : 'Preview'}
                </button>
              )}
            </div>
          </div>
          <p className="text-stone-400 ml-[52px]">
            Configure your research interview study
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-stone-800/50 rounded-2xl border border-stone-700 p-8 space-y-8"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg text-stone-100 flex items-center gap-2">
              <Sparkles size={18} className="text-stone-400" />
              Study Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">
                Study Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., AI Adoption in Healthcare"
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">
                Research Question *
              </label>
              <textarea
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="What are you trying to understand?"
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief context about the study..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none"
              />
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-stone-100 flex items-center gap-2">
                <User size={18} className="text-stone-400" />
                Profile Fields
              </h2>
              <button
                onClick={() => addProfileField()}
                className="text-sm text-stone-400 hover:text-stone-300 flex items-center gap-1"
              >
                <Plus size={16} /> Add Custom
              </button>
            </div>
            <p className="text-sm text-stone-400">
              Information to gather about participants during the interview
            </p>

            {availablePresets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-stone-500">Quick add:</span>
                {availablePresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => addProfileField(preset)}
                    className="px-3 py-1 text-xs bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-full transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {profileSchema.map((field) => (
                <div
                  key={field.id}
                  className="bg-stone-800 rounded-xl p-4 border border-stone-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateProfileField(field.id, { label: e.target.value })}
                        placeholder="Field label (e.g., Current Role)"
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 text-sm"
                      />
                      <input
                        type="text"
                        value={field.extractionHint}
                        onChange={(e) => updateProfileField(field.id, { extractionHint: e.target.value })}
                        placeholder="Hint for AI (e.g., Their job title or position)"
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFieldRequired(field.id)}
                        className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                          field.required
                            ? 'bg-stone-600 text-stone-200'
                            : 'bg-stone-700 text-stone-400'
                        }`}
                        title={field.required ? 'Required field' : 'Optional field'}
                      >
                        {field.required ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {field.required ? 'REQ' : 'OPT'}
                      </button>
                      <button
                        onClick={() => removeProfileField(field.id)}
                        className="p-1.5 text-stone-500 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {profileSchema.length === 0 && (
                <div className="text-center py-4 text-stone-500 text-sm">
                  No profile fields yet. Add some above to gather participant information.
                </div>
              )}
            </div>
          </div>

          {/* Core Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-stone-100">
                Core Questions
              </h2>
              <button
                onClick={addQuestion}
                className="text-sm text-stone-400 hover:text-stone-300 flex items-center gap-1"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>
            <p className="text-sm text-stone-400">
              Must-ask questions for your interview
            </p>
            <div className="space-y-2">
              {coreQuestions.map((q, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-stone-500 text-sm pt-3 w-6 text-right">{i + 1}.</span>
                  <textarea
                    value={q}
                    onChange={(e) => updateQuestion(i, e.target.value)}
                    placeholder={`Question ${i + 1}...`}
                    rows={2}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none"
                  />
                  {coreQuestions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(i)}
                      className="p-2.5 text-stone-500 hover:text-red-400 mt-1"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Topic Areas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-stone-100">
                Topic Areas
              </h2>
              <button
                onClick={addTopic}
                className="text-sm text-stone-400 hover:text-stone-300 flex items-center gap-1"
              >
                <Plus size={16} /> Add Topic
              </button>
            </div>
            <p className="text-sm text-stone-400">
              Themes the AI should probe on (e.g., fears, motivations, trade-offs)
            </p>
            <div className="space-y-2">
              {topicAreas.map((t, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-stone-500 text-sm pt-3 w-6 text-right">{i + 1}.</span>
                  <textarea
                    value={t}
                    onChange={(e) => updateTopic(i, e.target.value)}
                    placeholder={`Topic area ${i + 1}...`}
                    rows={2}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none"
                  />
                  {topicAreas.length > 1 && (
                    <button
                      onClick={() => removeTopic(i)}
                      className="p-2.5 text-stone-500 hover:text-red-400 mt-1"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Behavior */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg text-stone-100">AI Interview Style</h2>
            <div className="space-y-2">
              {behaviorOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    aiBehavior === option.id
                      ? 'border-stone-500 bg-stone-700'
                      : 'border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiBehavior"
                    checked={aiBehavior === option.id}
                    onChange={() => setAiBehavior(option.id)}
                    className="mt-1 accent-stone-500"
                  />
                  <div>
                    <div className="font-medium text-stone-100">{option.label}</div>
                    <div className="text-xs text-stone-400">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Consent Text */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg text-stone-100">Consent Text</h2>
            <textarea
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-600 text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500 resize-none text-sm"
            />
          </div>

          {/* Generate Participant Link */}
          {isValid && (
            <div className="space-y-4 pt-4 border-t border-stone-700">
              <h2 className="font-semibold text-lg text-stone-100 flex items-center gap-2">
                <LinkIcon size={18} className="text-stone-400" />
                Participant Link
              </h2>

              {participantLink ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={participantLink}
                      readOnly
                      className="flex-1 px-4 py-3 rounded-xl bg-stone-800 border border-stone-600 text-stone-300 text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-xl transition-colors flex items-center gap-2"
                    >
                      {linkCopied ? <Check size={18} /> : <Copy size={18} />}
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-stone-500">
                    Share this link with participants. The study configuration is embedded in the URL.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleGenerateLink}
                  disabled={isGeneratingLink}
                  className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LinkIcon size={18} />
                  {isGeneratingLink ? 'Generating...' : 'Generate Participant Link'}
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-stone-700">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full py-4 bg-stone-600 hover:bg-stone-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              Start Interview <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudySetup;
