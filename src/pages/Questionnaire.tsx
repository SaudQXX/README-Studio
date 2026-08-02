import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';

const QUESTIONS_TRANSLATIONS = {
  en: [
    { id: 'name', label: 'Project Name', placeholder: 'e.g., TaskMaster Pro', optional: false },
    { id: 'technologies', label: 'Technologies Used', placeholder: 'e.g., React, Node.js, Tailwind', optional: false },
    { id: 'features', label: 'Key Features', placeholder: 'e.g., User authentication, Real-time sync...', optional: true },
    { id: 'installation', label: 'Installation Steps', placeholder: 'e.g., npm install && npm run dev', optional: true },
    { id: 'license', label: 'License', placeholder: 'e.g., MIT', optional: true },
  ],
  ar: [
    { id: 'name', label: 'اسم المشروع', placeholder: 'مثال: تطبيق مهامي برو', optional: false },
    { id: 'technologies', label: 'التقنيات المستخدمة', placeholder: 'مثال: React, Node.js, Tailwind', optional: false },
    { id: 'features', label: 'المميزات الرئيسية', placeholder: 'مثال: تسجيل دخول مستخدمين، تحديث فوري للبيانات...', optional: true },
    { id: 'installation', label: 'طريقة التثبيت والتشغيل', placeholder: 'مثال: npm install && npm run dev', optional: true },
    { id: 'license', label: 'الرخصة البرمجية', placeholder: 'مثال: MIT', optional: true },
  ]
};

const UI_TRANSLATIONS = {
  en: {
    loadingTitle: "Crafting your README...",
    loadingDesc: "Our AI is structuring the document. This will take a few seconds.",
    step: "Step",
    of: "of",
    back: "Back",
    next: "Next",
    generate: "Generate README",
    notAuth: "Not authenticated. Please log in.",
    errorMsg: "Something went wrong. Please try again.",
    optionalLabel: "Optional",
    optionalHelper: "This question is optional. You can leave it empty and proceed.",
  },
  ar: {
    loadingTitle: "جاري تنسيق ملف الـ README الخاص بك...",
    loadingDesc: "يقوم الذكاء الاصطناعي ببناء الهيكل البرمجي للملف الآن، ثوانٍ معدودة فقط.",
    step: "الخطوة",
    of: "من",
    back: "رجوع",
    next: "التالي",
    generate: "توليد ملف الـ README",
    notAuth: "أنت غير مسجل دخول. يرجى تسجيل الدخول أولاً.",
    errorMsg: "حدث خطأ ما، يرجى المحاولة مرة أخرى.",
    optionalLabel: "اختياري",
    optionalHelper: "هذا السؤال اختياري، يمكنك تركه فارغاً والاستمرار بالضغط على التالي.",
  }
};

export default function Questionnaire() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData, lang } = useAuth();
  
  const description = location.state?.description || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = QUESTIONS_TRANSLATIONS[lang];
  const ui = UI_TRANSLATIONS[lang];
  const isRTL = lang === 'ar';
  const currentQ = questions[currentStep];
  const canProceed = currentQ.optional || !!(answers[currentQ.id]?.trim());

  if (!description) {
    navigate('/');
    return null;
  }

  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      generateReadme();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    } else {
      navigate('/');
    }
  };

  const generateReadme = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error(ui.notAuth);
      
      const idToken = await currentUser.getIdToken();
      
      const formattedAnswers = questions.map(q => ({
        question: q.label,
        answer: answers[q.id] || 'Not specified'
      }));

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ description, answers: formattedAnswers })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const errorText = await res.text();
        throw new Error(errorText || `Server error: ${res.status} ${res.statusText}`);
      }
      
      if (!res.ok) {
        throw new Error(data.error || ui.errorMsg);
      }

      await refreshUserData();
      navigate('/success', { state: { readme: data.readme } });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || ui.errorMsg);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 px-4 text-center">
        <Loader2 size={48} className="text-[#F2A93B] animate-spin" />
        <h2 className="text-2xl font-display font-bold text-[#EDEFF7]">{ui.loadingTitle}</h2>
        <p className="text-[#9AA0B4] text-sm sm:text-base max-w-sm">{ui.loadingDesc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress indicators */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-[#9AA0B4] mb-2 font-mono">
          <span>{ui.step} {currentStep + 1} {ui.of} {questions.length}</span>
          <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-[#1B1E2A] rounded-full h-2 overflow-hidden border border-[#2A2E3D]">
          <div 
            className="bg-[#F2A93B] h-2 transition-all duration-300 ease-out" 
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-[#1B1E2A] border border-[#2A2E3D] rounded-[12px] p-6 sm:p-8 shadow-2xl relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EDEFF7]">{currentQ.label}</h2>
              {currentQ.optional && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F2A93B]/10 border border-[#F2A93B]/30 text-xs text-[#F2A93B] font-medium">
                  {ui.optionalLabel}
                </span>
              )}
            </div>
            <input
              type="text"
              autoFocus
              placeholder={currentQ.placeholder}
              value={answers[currentQ.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNext();
              }}
              className="w-full bg-[#12141C] border border-[#2A2E3D] rounded-[8px] p-4 text-[#EDEFF7] placeholder-[#5D6377] focus:outline-none focus:border-[#F2A93B] focus:ring-1 focus:ring-[#F2A93B] transition-all text-base sm:text-lg mb-2"
            />
            {currentQ.optional && (
              <p className="text-xs sm:text-sm text-[#9AA0B4] mt-2">
                {ui.optionalHelper}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-[8px] text-sm">
            {error}
          </div>
        )}

        {/* Back and Forward actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2A2E3D]">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#9AA0B4] hover:text-[#EDEFF7] transition-colors py-2 px-4 text-sm font-semibold"
          >
            {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{ui.back}</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2 bg-[#EDEFF7] text-[#12141C] hover:bg-white disabled:bg-[#2A2E3D] disabled:text-[#5D6377] disabled:cursor-not-allowed font-bold py-2.5 px-6 rounded-[8px] transition-all text-sm shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <span>{currentStep === questions.length - 1 ? ui.generate : ui.next}</span>
            {currentStep !== questions.length - 1 && (isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />)}
          </button>
        </div>
      </div>
    </div>
  );
}
