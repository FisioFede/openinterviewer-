import { StudyConfig } from '@/types';

export const translations = {
    en: {
        // Consent
        researchConsent: "Research Consent",
        interviewStructure: "Interview Structure",
        steps: {
            1: { title: "Brief background questions", desc: "Help us understand your context" },
            2: { title: "core questions about your experiences", desc: "The heart of the interview" },
            ai: { title: "The AI may ask follow-up questions", desc: "To better understand your perspective" },
            3: { title: "A final question for your feedback", desc: "Your thoughts on the interview itself" }
        },
        estimatedTime: "Estimated time: 10-15 minutes",
        privacy: "Privacy:",
        privacyText: "Your responses will be used for research purposes only. No personally identifying information will be shared without your consent.",
        back: "Back",
        consentButton: "I Consent - Begin Interview",
        noStudy: "No study configured. Please set up a study first.",

        // InterviewChat
        phases: {
            'background': 'Getting to know you',
            'core-questions': 'Core Questions',
            'exploration': 'Exploring further',
            'feedback': 'Your feedback',
            'wrap-up': 'Wrapping up'
        },
        questionOf: (current: number, total: number) => `Question ${Math.min(current, total)} of ${total}`,
        finishEarly: "Finish early",
        interviewer: "Interviewer",
        you: "You",
        thinking: "Thinking...",
        typeResponse: "Type your response...",
        completeTitle: "Interview Complete",
        completeText: "Your responses have been saved. Thank you for participating.",
        viewAnalysis: "View Analysis",
        errorResponse: "I appreciate you sharing that. Could you tell me more?",
    },
    jp: {
        // Consent
        researchConsent: "研究参加への同意",
        interviewStructure: "インタビューの流れ",
        steps: {
            1: { title: "簡単な背景質問", desc: "あなたの状況を理解するために" },
            2: { title: "あなたの経験に関する主要な質問", desc: "インタビューの中心部分です" },
            ai: { title: "AIがフォローアップ質問をすることがあります", desc: "あなたの視点をより深く理解するために" },
            3: { title: "フィードバックのための最後の質問", desc: "このインタビュー自体についての感想をお聞かせください" }
        },
        estimatedTime: "所要時間：10〜15分",
        privacy: "プライバシー：",
        privacyText: "回答は研究目的のみに使用されます。同意なしに個人が特定される情報が共有されることはありません。",
        back: "戻る",
        consentButton: "同意してインタビューを開始",
        noStudy: "研究が設定されていません。最初に研究を設定してください。",

        // InterviewChat
        phases: {
            'background': '自己紹介・背景',
            'core-questions': 'メイン質問',
            'exploration': 'さらに深掘り',
            'feedback': 'フィードバック',
            'wrap-up': 'まとめ'
        },
        questionOf: (current: number, total: number) => `質問 ${Math.min(current, total)} / ${total}`,
        finishEarly: "早めに終了",
        interviewer: "インタビュアー",
        you: "あなた",
        thinking: "考え中...",
        typeResponse: "回答を入力してください...",
        completeTitle: "インタビュー完了",
        completeText: "回答が保存されました。ご参加ありがとうございました。",
        viewAnalysis: "分析を見る",
        errorResponse: "共有していただきありがとうございます。もう少し詳しく教えていただけますか？",
    }
};

export const getTexts = (config: StudyConfig | null) => {
    const lang = config?.language || 'en';
    return translations[lang];
};
