import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/supabase';
import { Calendar, CheckCircle2, ShieldCheck, Smartphone, Users, Zap } from 'lucide-react';

interface LoginScreenProps {
  onBypassLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBypassLogin }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in exception:', err);
      setErrorMessage(err?.message || '구글 로그인 연결 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans text-neutral-100">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-neutral-800/90 backdrop-blur-xl border border-neutral-700/80 rounded-2xl shadow-2xl p-8 relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block shadow-xs shadow-blue-500/50 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Bliss Work Tool</h1>
        </div>
        <p className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-6">
          인테리어 현장 메이트 • 스마트 통합 통합 관리
        </p>

        {/* Hero Copy */}
        <div className="text-center mb-8">
          <p className="text-sm text-neutral-300 leading-relaxed">
            사무실 PC와 현장 직원의 스마트폰에서
            <br />
            시공 캘린더, 정밀 실측, 발주 및 견적 데이터를
            <br />
            <strong className="text-white font-medium">Supabase Realtime</strong>으로 즉시 공유하세요.
          </p>
        </div>

        {/* Feature Pill Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-8">
          <div className="bg-neutral-900/60 border border-neutral-700/50 p-2.5 rounded-xl flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium truncate">시공 캘린더</span>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-700/50 p-2.5 rounded-xl flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium truncate">모바일 실시간</span>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-700/50 p-2.5 rounded-xl flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium truncate">본견적 계산기</span>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-700/50 p-2.5 rounded-xl flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-neutral-300 font-medium truncate">직원 다중 협업</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300 leading-normal">
            {errorMessage}
          </div>
        )}

        {/* Main Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* Google SVG Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29C.47 8.23 0 10.06 0 12s.47 3.77 1.29 5.41l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google 계정으로 로그인</span>
            </>
          )}
        </button>

        {/* Local / Offline Bypass Option for Development */}
        {onBypassLogin && (
          <button
            type="button"
            onClick={onBypassLogin}
            className="mt-4 text-xs text-neutral-400 hover:text-neutral-200 underline transition-colors"
          >
            임시 게스트 접속 (로컬 데이터 모드)
          </button>
        )}

        {/* Security Badge */}
        <div className="mt-8 pt-4 border-t border-neutral-700/60 w-full flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>보안 인증 및 승인된 직원 전용 시스템</span>
        </div>
      </div>
    </div>
  );
};
