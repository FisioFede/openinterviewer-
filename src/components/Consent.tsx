'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { Shield, ArrowRight, ArrowLeft, MessageSquare, Clock, HelpCircle } from 'lucide-react';
import { getTexts } from '@/lib/i18n';

const Consent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { studyConfig, giveConsent, setStep, viewMode, initializeProfile } = useStore();
  const t = getTexts(studyConfig);

  const handleConsent = () => {
    giveConsent();
    // Initialize profile structure from study schema
    if (studyConfig?.profileSchema) {
      initializeProfile(studyConfig.profileSchema);
    }
    // Skip directly to interview (merged intake/profile into conversation)
    setStep('interview');

    // Only navigate if we're not in the participant route (preserving /p/[token])
    if (!pathname?.startsWith('/p/')) {
      router.push('/interview');
    }
  };

  const handleBack = () => {
    setStep('setup');
    router.push('/setup');
  };

  if (!studyConfig) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <p className="text-stone-400">{t.noStudy}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <div className="bg-stone-800/50 rounded-xl border border-stone-700 overflow-hidden">
          {/* Header */}
          <div className="bg-stone-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={28} className="text-stone-300" />
              <h1 className="text-2xl font-bold text-white">{t.researchConsent}</h1>
            </div>
            <p className="text-stone-400 text-sm">
              {studyConfig.name}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="prose prose-sm max-w-none text-stone-300">
              <p className="whitespace-pre-wrap">{studyConfig.consentText}</p>
            </div>

            {/* Interview Structure Foreshadowing */}
            <div className="bg-stone-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-stone-100 flex items-center gap-2">
                <MessageSquare size={18} className="text-stone-400" />
                {t.interviewStructure}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-xs text-stone-400 flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <div className="text-stone-200">{t.steps[1].title}</div>
                    <div className="text-stone-500 text-xs">{t.steps[1].desc}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-xs text-stone-400 flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <div className="text-stone-200">{studyConfig.coreQuestions.length} {t.steps[2].title}</div>
                    <div className="text-stone-500 text-xs">{t.steps[2].desc}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-xs text-stone-400 flex-shrink-0 mt-0.5">
                    <HelpCircle size={12} />
                  </div>
                  <div>
                    <div className="text-stone-200">{t.steps.ai.title}</div>
                    <div className="text-stone-500 text-xs">{t.steps.ai.desc}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center text-xs text-stone-400 flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <div className="text-stone-200">{t.steps[3].title}</div>
                    <div className="text-stone-500 text-xs">{t.steps[3].desc}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-700 text-stone-400 text-sm">
                <Clock size={14} />
                <span>{t.estimatedTime}</span>
              </div>
            </div>

            <div className="bg-stone-800 border border-stone-600 rounded-xl p-4 text-sm text-stone-300">
              <strong className="text-stone-100">{t.privacy}</strong> {t.privacyText}
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 flex gap-3">
            {viewMode !== 'participant' && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-stone-600 text-stone-400 rounded-xl hover:bg-stone-700 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} /> {t.back}
              </button>
            )}
            <button
              onClick={handleConsent}
              className="flex-1 py-3 bg-stone-600 hover:bg-stone-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {t.consentButton} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Consent;
