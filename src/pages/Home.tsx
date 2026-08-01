import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowRight, ArrowLeft, Sparkles, Languages } from 'lucide-react';
import { motion } from 'motion/react';

const TRANSLATIONS = {
  en: {
    attempts: "daily attempts remaining",
    titleStart: "Create the perfect ",
    titleHighlight: "README",
    desc: "Describe your project briefly, and let our AI handle the structure, formatting, and professional polish.",
    label: "What are you building?",
    placeholder: "e.g., A Flutter task management app using Firebase, with user authentication and push notifications...",
    continueBtn: "Continue",
    limitError: "You have reached your daily limit. Please come back tomorrow for more attempts!",
  },
  ar: {
    attempts: "محاولات يومية متبقية",
    titleStart: "أنشئ ملف الـ ",
    titleHighlight: "README",
    desc: "صف مشروعك باختصار، ودع الذكاء الاصطناعي يتولى التنسيق والترتيب واللمسات الاحترافية بالكامل.",
    label: "ماذا تبني في مشروعك؟",
    placeholder: "مثال: تطبيق لإدارة المهام باستخدام Flutter و Firebase، مع نظام تسجيل دخول وإشعارات تلقائية...",
    continueBtn: "استمرار",
    limitError: "لقد استنفدت الحد اليومي للمحاولات. يرجى العودة غداً لتوليد المزيد من الملفات!",
  }
};

export default function Home() {
  const { dailyAttempts, lang, setLang } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  const handleNext = () => {
    if (!description.trim()) return;
    navigate('/questionnaire', { state: { description } });
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mini Bar inside Home */}
      <div className="flex justify-between items-center pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1E2A] border border-[#2A2E3D] text-xs sm:text-sm text-[#F2A93B]">
          <Sparkles size={14} className="animate-pulse" />
          <span>{dailyAttempts} {t.attempts}</span>
        </div>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1E2A] border border-[#2A2E3D] text-[#9AA0B4] hover:text-[#EDEFF7] text-xs font-semibold transition-all shadow-sm"
        >
          <Languages size={14} className="text-[#F2A93B]" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <div className="text-center space-y-4 py-4">
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#EDEFF7] tracking-tight">
          {t.titleStart}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2A93B] to-[#ffc875]">
            {t.titleHighlight}
          </span>
          {lang === 'ar' ? ' المثالي' : ''}
        </h1>
        <p className="text-base sm:text-lg text-[#9AA0B4] max-w-xl mx-auto leading-relaxed">
          {t.desc}
        </p>
      </div>

      <div className="bg-[#1B1E2A] border border-[#2A2E3D] rounded-[12px] p-6 shadow-2xl relative group">
        <label htmlFor="project-desc" className="flex items-center gap-2 text-sm font-semibold text-[#EDEFF7] mb-3">
          <FileText size={18} className="text-[#9AA0B4]" />
          {t.label}
        </label>
        
        <textarea
          id="project-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.placeholder}
          className="w-full bg-[#12141C] border border-[#2A2E3D] rounded-[8px] p-4 text-[#EDEFF7] placeholder-[#5D6377] focus:outline-none focus:border-[#F2A93B] focus:ring-1 focus:ring-[#F2A93B] transition-all min-h-[160px] resize-y text-sm sm:text-base leading-relaxed"
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleNext}
            disabled={!description.trim() || dailyAttempts <= 0}
            className="flex items-center gap-2 bg-[#EDEFF7] text-[#12141C] hover:bg-white disabled:bg-[#2A2E3D] disabled:text-[#5D6377] font-semibold py-2.5 px-6 rounded-[8px] transition-all disabled:cursor-not-allowed text-sm hover:scale-[1.01] active:scale-95 shadow-md"
          >
            <span>{t.continueBtn}</span>
            {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
          </button>
        </div>
      </div>
      
      {dailyAttempts <= 0 && (
        <div className="text-center p-4 bg-[#F85149]/10 border border-[#F85149]/30 rounded-[10px] text-[#F85149] font-medium text-sm">
          {t.limitError}
        </div>
      )}
    </motion.div>
  );
}
