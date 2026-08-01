import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Home, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const TRANSLATIONS = {
  en: {
    title: "README Generated!",
    desc: "Your README.md file has been downloaded automatically. You can also copy the content below.",
    copyBtn: "Copy Content",
    copied: "Copied!",
    backBtn: "Back to Home",
  },
  ar: {
    title: "تم توليد ملف الـ README بنجاح!",
    desc: "تم بدء تنزيل ملف README.md تلقائياً على جهازك. يمكنك أيضاً نسخ المحتوى مباشرة من الأسفل.",
    copyBtn: "نسخ محتوى الملف",
    copied: "تم النسخ!",
    backBtn: "العودة إلى الصفحة الرئيسية",
  }
};

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useAuth();
  
  const readme = location.state?.readme;
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (!readme) {
      navigate('/');
      return;
    }
    
    // Auto download
    const blob = new Blob([readme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [readme, navigate]);

  if (!readme) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex justify-center mb-6"
      >
        <div className="w-20 h-20 bg-[#3FB950]/10 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-[#3FB950]" />
        </div>
      </motion.div>
      
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#EDEFF7] mb-4">{t.title}</h1>
      <p className="text-sm sm:text-base text-[#9AA0B4] mb-10 max-w-lg mx-auto leading-relaxed">
        {t.desc}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 bg-[#1B1E2A] hover:bg-[#232739] border border-[#2A2E3D] text-[#EDEFF7] font-semibold py-2.5 px-6 rounded-[8px] transition-all w-full sm:w-auto text-sm shadow-md"
        >
          {copied ? <Check size={18} className="text-[#3FB950]" /> : <Copy size={18} />}
          <span>{copied ? t.copied : t.copyBtn}</span>
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-[#EDEFF7] text-[#12141C] hover:bg-white font-semibold py-2.5 px-6 rounded-[8px] transition-all w-full sm:w-auto text-sm shadow-md"
        >
          <Home size={18} />
          <span>{t.backBtn}</span>
        </button>
      </div>

      <div className="bg-[#1B1E2A] border border-[#2A2E3D] rounded-[12px] p-4 sm:p-6 text-left overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#2A2E3D]">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          <span className={`ml-2 text-xs font-mono text-[#9AA0B4] ${isRTL ? 'mr-auto ml-2' : ''}`}>README.md</span>
        </div>
        <pre className="text-xs sm:text-sm font-mono text-[#EDEFF7] overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar text-left" dir="ltr">
          {readme}
        </pre>
      </div>
    </div>
  );
}
