/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Questionnaire from './pages/Questionnaire';
import Success from './pages/Success';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-[#12141C] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#F2A93B] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  const { user, signOut, lang } = useAuth();
  const isRTL = lang === 'ar';

  return (
    <div className="min-h-screen bg-[#12141C] text-[#EDEFF7] font-sans selection:bg-[#F2A93B]/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="border-b border-[#2A2E3D] bg-[#12141C]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="README.Studio" className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#F2A93B]/40 shadow-sm" />
            <span className="font-display font-bold text-lg tracking-tight">README.Studio</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-[#2A2E3D]" />
              )}
              <button 
                onClick={signOut}
                className="text-sm font-medium text-[#9AA0B4] hover:text-[#EDEFF7] transition-colors"
              >
                {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/questionnaire" element={
            <ProtectedRoute>
              <Questionnaire />
            </ProtectedRoute>
          } />
          <Route path="/success" element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

