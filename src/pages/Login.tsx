import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Sparkles, Languages, Eye, EyeOff, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to README.Studio",
    subtitle: "Create beautiful, professional readmes with AI in seconds",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    or: "Or continue with",
    googleBtn: "Sign in with Google",
    noAccount: "Don't have an account? Sign up",
    hasAccount: "Already have an account? Sign in",
    errorRequired: "Please fill in all required fields",
    errorMatch: "Passwords do not match",
    emailPlaceholder: "yourname@example.com",
    passwordPlaceholder: "Enter your password",
    confirmPlaceholder: "Confirm your password",
    successMsg: "Authenticated successfully!",
    iframeWarning: "Note: Since you are viewing this app inside a preview frame, Google Sign-In may be blocked by your browser's third-party cookie restrictions.",
    openInNewTab: "Open App in New Tab to Sign In",
  },
  ar: {
    welcome: "مرحباً بك في README.Studio",
    subtitle: "أنشئ ملفات README احترافية وجذابة باستخدام الذكاء الاصطناعي في ثوانٍ معدودة",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب جديد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    or: "أو الاستمرار بواسطة",
    googleBtn: "تسجيل الدخول باستخدام Google",
    noAccount: "ليس لديك حساب؟ سجل الآن",
    hasAccount: "لديك حساب بالفعل؟ سجل دخولك",
    errorRequired: "يرجى تعبئة جميع الحقول المطلوبة",
    errorMatch: "كلمات المرور غير متطابقة",
    emailPlaceholder: "yourname@example.com",
    passwordPlaceholder: "أدخل كلمة المرور الخاصة بك",
    confirmPlaceholder: "أعد كتابة كلمة المرور",
    successMsg: "تم تسجيل الدخول بنجاح!",
    iframeWarning: "تنبيه: بما أنك تتصفح التطبيق من داخل إطار المعاينة، فقد يحظر متصفحك تسجيل الدخول عبر Google بسبب قيود ملفات تعريف الارتباط.",
    openInNewTab: "افتح التطبيق في نافذة جديدة لتسجيل الدخول بنجاح",
  }
};

export default function Login() {
  const { user, signInWithGoogle, lang, setLang } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setUnauthorizedDomain(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google Sign-In Error in Login component:", error);
      
      const isDomainError = 
        error?.code === 'auth/unauthorized-domain' || 
        error?.message?.includes('unauthorized-domain') || 
        String(error).includes('unauthorized-domain');

      if (isDomainError) {
        setUnauthorizedDomain(window.location.hostname);
        setErrorMessage(
          lang === 'ar' 
            ? 'النطاق الحالي غير مصرح به في إعدادات مشروع Firebase الخاص بك.' 
            : 'The current domain is not authorized in your Firebase project configuration.'
        );
      } else {
        setErrorMessage(error?.message || String(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password || (isSignUp && (!confirmPassword || !displayName))) {
      setErrorMessage(t.errorRequired);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMessage(t.errorMatch);
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        // Force state refresh
        window.location.reload();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error("Email auth error:", error);
      setErrorMessage(error.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] flex flex-col justify-center items-center px-4 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#F2A93B]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Language Toggle Button */}
      <button
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#12141C] border border-[#2A2E3D] text-[#EDEFF7] hover:text-white transition-all text-xs cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      >
        <Languages size={14} />
        <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
      </button>

      {/* Logo and Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-8 text-center max-w-md"
      >
        <div className="w-14 h-14 bg-gradient-to-tr from-[#F2A93B] to-amber-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-[#F2A93B]/20 mb-4 border border-[#F5B95C]/20">
          <Sparkles className="text-white w-7 h-7" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#EDEFF7] tracking-tight">{t.welcome}</h1>
        <p className="text-sm text-[#9AA0B4] mt-2 px-4 leading-relaxed">{t.subtitle}</p>
      </motion.div>

      {/* Primary Authentication Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#12141C]/90 border border-[#2A2E3D]/80 rounded-[16px] shadow-2xl p-6 md:p-8 backdrop-blur-md relative z-10"
      >
        {/* Toggle tabs for sign-in and sign-up */}
        <div className="flex bg-[#0A0B10] p-1 rounded-[10px] border border-[#2A2E3D]/40 mb-6">
          <button
            onClick={() => { setIsSignUp(false); setErrorMessage(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-[8px] transition-all cursor-pointer ${
              !isSignUp ? 'bg-[#1B1E2A] text-white shadow-sm' : 'text-[#9AA0B4] hover:text-[#EDEFF7]'
            }`}
          >
            {t.signIn}
          </button>
          <button
            onClick={() => { setIsSignUp(true); setErrorMessage(null); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-[8px] transition-all cursor-pointer ${
              isSignUp ? 'bg-[#1B1E2A] text-white shadow-sm' : 'text-[#9AA0B4] hover:text-[#EDEFF7]'
            }`}
          >
            {t.signUp}
          </button>
        </div>

        {/* Dynamic Error Messaging Panel */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium leading-relaxed"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider mb-1.5">
                {lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل اسمك الكريم' : 'John Doe'}
                required
                className="w-full bg-[#0A0B10] border border-[#2A2E3D] focus:border-[#F2A93B] text-[#EDEFF7] text-sm py-2.5 px-4 rounded-[8px] outline-none transition-all placeholder-[#5D6377]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider mb-1.5">{t.email}</label>
            <div className="relative">
              <Mail className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-[#5D6377] w-4.5 h-4.5`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className="w-full bg-[#0A0B10] border border-[#2A2E3D] focus:border-[#F2A93B] text-[#EDEFF7] text-sm py-2.5 px-4 rounded-[8px] outline-none transition-all placeholder-[#5D6377]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider mb-1.5">{t.password}</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-[#5D6377] hover:text-[#EDEFF7] transition-colors cursor-pointer`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                className="w-full bg-[#0A0B10] border border-[#2A2E3D] focus:border-[#F2A93B] text-[#EDEFF7] text-sm py-2.5 px-4 rounded-[8px] outline-none transition-all placeholder-[#5D6377]"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#9AA0B4] uppercase tracking-wider mb-1.5">{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPlaceholder}
                required
                className="w-full bg-[#0A0B10] border border-[#2A2E3D] focus:border-[#F2A93B] text-[#EDEFF7] text-sm py-2.5 px-4 rounded-[8px] outline-none transition-all placeholder-[#5D6377]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#F2A93B] to-amber-500 hover:from-[#f09a1a] hover:to-[#e6910f] text-white font-semibold py-2.5 px-4 rounded-[8px] transition-all duration-200 shadow-md shadow-[#F2A93B]/10 hover:shadow-[#F2A93B]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-4.5 h-4.5" />
            ) : (
              <span>{isSignUp ? t.signUp : t.signIn}</span>
            )}
          </button>
        </form>

        {/* Custom Divider */}
        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-[#2A2E3D]/60"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-[#5D6377] uppercase tracking-wider">{t.or}</span>
          <div className="flex-grow border-t border-[#2A2E3D]/60"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-[#12141C] hover:bg-[#1B1E2A] border border-[#2A2E3D] text-[#EDEFF7] hover:text-white font-semibold py-2.5 px-6 rounded-[8px] transition-all hover:scale-[1.01] active:scale-95 shadow-md group cursor-pointer"
        >
          {/* High-Fidelity Google Icon */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61a5.66 5.66 0 0 1-2.45 3.71v3.08h3.95c2.31-2.13 3.63-5.26 3.63-8.64Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.95-3.08c-1.1.74-2.51 1.18-4.01 1.18-3.09 0-5.71-2.09-6.64-4.9H1.32v3.19A11.98 11.98 0 0 0 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.36 14.29a7.22 7.22 0 0 1 0-4.58V6.52H1.32a11.98 11.98 0 0 0 0 10.96l4.04-3.19Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.93 11.93 0 0 0 12 0 11.98 11.98 0 0 0 1.32 6.52l4.04 3.19c.93-2.81 3.55-4.96 6.64-4.96Z"
            />
          </svg>
          <span className="text-sm">{t.googleBtn}</span>
        </button>

        {/* Firebase Unauthorized Domain Setup Instructions */}
        {unauthorizedDomain && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 rounded-[8px] bg-[#1a1216]/90 border border-red-500/30 text-xs leading-relaxed space-y-3"
          >
            <div className="flex items-start gap-2 text-red-400 font-semibold mb-1">
              <span className="shrink-0 text-red-500 text-sm">⚠️</span>
              <span>
                {lang === 'ar' 
                  ? 'يجب إضافة النطاق إلى Authorized Domains في Firebase!' 
                  : 'This domain must be authorized in Firebase settings!'}
              </span>
            </div>
            
            <p className="text-[#EDEFF7]">
              {lang === 'ar'
                ? 'يقوم Google بحظر تسجيل الدخول حتى تضيف نطاق موقعك الحالي إلى قائمة النطاقات المعتمدة في مشروعك. يرجى اتباع هذه الخطوات:'
                : 'Google blocks sign-in until you add your current website domain to the authorized list in your project. Please follow these steps:'}
            </p>

            <ol className="list-decimal list-inside space-y-2 text-[#9AA0B4] bg-[#12141C]/60 p-3 rounded-[6px] border border-[#2A2E3D]/40">
              <li>
                {lang === 'ar'
                  ? 'افتح وحدة تحكم Firebase واذهب لمشروعك.'
                  : 'Open the Firebase Console & select your project.'}
              </li>
              <li>
                {lang === 'ar'
                  ? 'اذهب إلى Authentication من القائمة الجانبية ثم تبويب Settings.'
                  : 'Go to Authentication in the sidebar, then select Settings tab.'}
              </li>
              <li>
                {lang === 'ar'
                  ? 'انزل لأسفل الصفحة إلى قسم Authorized domains (النطاقات المصرح بها).'
                  : 'Scroll down to the Authorized domains section.'}
              </li>
              <li>
                {lang === 'ar'
                  ? 'اضغط على Add domain (إضافة نطاق) وأضف هذا النطاق بدقة:'
                  : 'Click Add domain and add this exact domain:'}
                
                <div className="mt-2 space-y-1.5 font-mono text-xs">
                  {/* Current Preview Domain */}
                  <div className="flex items-center justify-between bg-[#1B1E2A] px-2.5 py-1 rounded border border-[#2A2E3D]">
                    <span className="text-[#F2A93B] select-all truncate">{unauthorizedDomain}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(unauthorizedDomain)}
                      className="ml-2 text-xs text-[#EDEFF7] hover:text-[#F2A93B] hover:underline cursor-pointer"
                    >
                      {copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}
                    </button>
                  </div>
                  {/* User Vercel Domain */}
                  <div className="flex items-center justify-between bg-[#1B1E2A] px-2.5 py-1 rounded border border-[#2A2E3D]">
                    <span className="text-[#F2A93B] select-all truncate">readme-studio-one.vercel.app</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('readme-studio-one.vercel.app')}
                      className="ml-2 text-xs text-[#EDEFF7] hover:text-[#F2A93B] hover:underline cursor-pointer"
                    >
                      {lang === 'ar' ? 'نسخ' : 'Copy'}
                    </button>
                  </div>
                </div>
              </li>
              <li>
                {lang === 'ar'
                  ? 'اضغط على Save (حفظ) وسيعمل تسجيل الدخول بالكامل!'
                  : 'Click Save, and Google sign-in will work instantly!'}
              </li>
            </ol>
          </motion.div>
        )}

        {/* Iframe Support Warning & Redirection */}
        {isIframe && (
          <div className="mt-4 p-4 rounded-[8px] bg-[#221611]/40 border border-[#F2A93B]/20 text-[#ffcc80] text-xs leading-relaxed space-y-3">
            <p className="flex items-start gap-2">
              <span className="shrink-0 text-[#F2A93B] font-bold text-sm">💡</span>
              <span>{t.iframeWarning}</span>
            </p>
            <button
              type="button"
              onClick={() => window.open(window.location.href, '_blank')}
              className="w-full flex items-center justify-center gap-2 bg-[#F2A93B]/10 hover:bg-[#F2A93B]/20 border border-[#F2A93B]/30 hover:border-[#F2A93B]/50 text-[#F2A93B] font-semibold py-2 px-4 rounded-[6px] transition-all text-xs cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>{t.openInNewTab}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
