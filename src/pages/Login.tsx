import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Sparkles, Languages, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const TRANSLATIONS = {
  en: {
    welcome: "Welcome to README.Studio",
    description: "Generate professional, structured README.md files for your projects in minutes using AI.",
    or: "or continue with email",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    loginBtn: "Sign In with Email",
    registerBtn: "Create Account",
    googleBtn: "Continue with Google",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    errorFields: "Please fill in all fields",
    errorMatch: "Passwords do not match",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "Enter your password",
    confirmPlaceholder: "Confirm your password",
    successMsg: "Authenticated successfully!",
  },
  ar: {
    welcome: "مرحباً بك في README.Studio",
    description: "أنشئ ملفات README.md احترافية ومنظمة لمشاريعك البرمجية في دقائق باستخدام الذكاء الاصطناعي.",
    or: "أو تابع باستخدام البريد الإلكتروني",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    signIn: "تسجيل الدخول",
    signUp: "حساب جديد",
    loginBtn: "تسجيل الدخول بالبريد",
    registerBtn: "إنشاء حساب جديد",
    googleBtn: "المتابعة باستخدام Google",
    noAccount: "ليس لديك حساب؟",
    hasAccount: "لديك حساب بالفعل؟",
    errorFields: "يرجى ملء جميع الحقول المطلوبة",
    errorMatch: "كلمات المرور غير متطابقة",
    emailPlaceholder: "yourname@example.com",
    passwordPlaceholder: "أدخل كلمة المرور الخاصة بك",
    confirmPlaceholder: "أعد كتابة كلمة المرور",
    successMsg: "تم تسجيل الدخول بنجاح!",
  }
};

export default function Login() {
  const { user, signInWithGoogle, lang, setLang } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
    setErrorMessage(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password || (activeTab === 'signup' && !confirmPassword)) {
      setErrorMessage(t.errorFields);
      return;
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      setErrorMessage(t.errorMatch);
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Set a default display name from the first part of email
        const displayName = email.split('@')[0];
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (err: any) {
      console.error(err);
      let friendlyError = err.message;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyError = lang === 'ar' ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Incorrect email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = lang === 'ar' ? "هذا البريد الإلكتروني مستخدم بالفعل." : "This email is already in use.";
      } else if (err.code === 'auth/weak-password') {
        friendlyError = lang === 'ar' ? "كلمة المرور ضعيفة جداً (على الأقل 6 خانات)." : "Password is too weak (at least 6 characters).";
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = lang === 'ar' ? "البريد الإلكتروني غير صالح." : "Invalid email address.";
      }
      setErrorMessage(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Bar for Language switching */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1B1E2A] border border-[#2A2E3D] text-[#9AA0B4] hover:text-[#EDEFF7] text-xs font-semibold transition-all shadow-sm"
        >
          <Languages size={14} className="text-[#F2A93B]" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1B1E2A] border border-[#2A2E3D] p-8 sm:p-10 rounded-[12px] shadow-2xl max-w-md w-full relative overflow-hidden"
      >
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2A93B]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3FB950]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Logo & Title */}
        <div className="text-center mb-8 relative">
          <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-2xl mb-4 p-0.5 bg-gradient-to-tr from-[#F2A93B] to-[#ffc875] shadow-xl">
              <img 
                src="/logo.jpeg" 
                alt="README.Studio Logo" 
                className="w-full h-full rounded-2xl object-cover" 
              />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-[#F2A93B] text-[#12141C] p-1.5 rounded-full shadow-lg border border-[#1B1E2A]">
              <Sparkles size={11} className="animate-pulse text-[#12141C]" />
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#EDEFF7] tracking-tight">{t.welcome}</h1>
          <p className="text-[#9AA0B4] mt-2 text-sm leading-relaxed">{t.description}</p>
        </div>

        {/* Email Tabs */}
        <div className="flex bg-[#12141C] p-1 rounded-[8px] border border-[#2A2E3D] mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-[6px] transition-all ${
              activeTab === 'signin' 
                ? 'bg-[#1B1E2A] text-[#F2A93B] shadow-md border border-[#2A2E3D]' 
                : 'text-[#9AA0B4] hover:text-[#EDEFF7]'
            }`}
          >
            {t.signIn}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-[6px] transition-all ${
              activeTab === 'signup' 
                ? 'bg-[#1B1E2A] text-[#F2A93B] shadow-md border border-[#2A2E3D]' 
                : 'text-[#9AA0B4] hover:text-[#EDEFF7]'
            }`}
          >
            {t.signUp}
          </button>
        </div>

        {/* Form Container (Email) */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9AA0B4] mb-2">
              {t.email}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-[#5D6377]`}>
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                dir="ltr"
                className={`w-full bg-[#12141C] border border-[#2A2E3D] rounded-[8px] py-2.5 ${isRTL ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} text-[#EDEFF7] placeholder-[#5D6377] focus:outline-none focus:border-[#F2A93B] focus:ring-1 focus:ring-[#F2A93B] transition-all text-sm`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9AA0B4] mb-2">
              {t.password}
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-[#5D6377]`}>
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                dir="ltr"
                className={`w-full bg-[#12141C] border border-[#2A2E3D] rounded-[8px] py-2.5 ${isRTL ? 'pr-11 pl-10 text-right' : 'pl-11 pr-10 text-left'} text-[#EDEFF7] placeholder-[#5D6377] focus:outline-none focus:border-[#F2A93B] focus:ring-1 focus:ring-[#F2A93B] transition-all text-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3.5' : 'right-0 pr-3.5'} flex items-center text-[#5D6377] hover:text-[#9AA0B4] transition-colors`}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {activeTab === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9AA0B4] mb-2">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-[#5D6377]`}>
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={activeTab === 'signup'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirmPlaceholder}
                      dir="ltr"
                      className={`w-full bg-[#12141C] border border-[#2A2E3D] rounded-[8px] py-2.5 ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-[#EDEFF7] placeholder-[#5D6377] focus:outline-none focus:border-[#F2A93B] focus:ring-1 focus:ring-[#F2A93B] transition-all text-sm`}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Validation/Authentication Error Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-[8px] text-xs font-medium"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#F2A93B] hover:bg-[#d99635] text-[#12141C] font-bold py-2.5 px-6 rounded-[8px] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm mt-2 shadow-md cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              activeTab === 'signin' ? t.loginBtn : t.registerBtn
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
          onClick={signInWithGoogle}
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
      </motion.div>
    </div>
  );
}
