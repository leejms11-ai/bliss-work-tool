import React from 'react';
import { Plus, LogOut, User as UserIcon, Wifi, Database } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  currentView: 'calendar' | 'list';
  onViewChange: (view: 'calendar' | 'list') => void;
  onOpenNewProject: () => void;
  onResetData: () => void;
  onExportData: () => void;
  user?: User | null;
  onLogout?: () => void;
  isRealtimeConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenNewProject,
  onResetData,
  onExportData,
  user,
  onLogout,
  isRealtimeConnected = true
}) => {
  const userEmail = user?.email || '직원 계정';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-3.5 border-b border-neutral-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* Zone 1: Single text element wordmark */}
      <a 
        href="#" 
        onClick={(e) => { e.preventDefault(); onViewChange('calendar'); }}
        className="text-base md:text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
        <span>인테리어 현장 메이트</span>
      </a>

      {/* Zone 2: Navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
        <button
          type="button"
          onClick={() => onViewChange('calendar')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'calendar' ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900 pb-0.5' : ''
          }`}
        >
          시공 캘린더
        </button>

        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 ${
            currentView === 'list' ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900 pb-0.5' : ''
          }`}
        >
          현장 목록
        </button>

        <button
          type="button"
          onClick={onExportData}
          className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 text-neutral-500"
        >
          데이터 백업
        </button>

        <button
          type="button"
          onClick={onResetData}
          className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 text-neutral-400"
        >
          예시 복원
        </button>
      </nav>

      {/* Zone 3: User Profile & Actions */}
      <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
        {/* Realtime Status Indicator */}
        <div 
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200"
          title="Supabase DB 실시간 동기화 활성화됨"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Database className="w-3 h-3 text-emerald-600" />
          <span className="text-[11px]">Realtime 동기화</span>
        </div>

        {/* User Profile Badge */}
        {user && (
          <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-neutral-100 border border-neutral-200">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-semibold text-neutral-800 leading-none">{userName}</span>
              <span className="text-[10px] text-neutral-500 max-w-[120px] truncate leading-tight">{userEmail}</span>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="로그아웃"
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Mobile View Toggle */}
        <div className="lg:hidden flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onViewChange('calendar')}
            className={`px-2 py-1 rounded-md ${currentView === 'calendar' ? 'bg-white shadow-xs font-semibold' : 'text-neutral-600'}`}
          >
            캘린더
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={`px-2 py-1 rounded-md ${currentView === 'list' ? 'bg-white shadow-xs font-semibold' : 'text-neutral-600'}`}
          >
            목록
          </button>
        </div>

        {/* New Project Button */}
        <button
          type="button"
          onClick={onOpenNewProject}
          className="px-3 md:px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">새 현장 등록</span>
          <span className="sm:hidden">등록</span>
        </button>
      </div>
    </header>
  );
};
