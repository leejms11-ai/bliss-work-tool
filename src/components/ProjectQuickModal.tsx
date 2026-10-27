import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Key, 
  Users, 
  Calendar, 
  Phone, 
  FileText, 
  ArrowRight, 
  Copy, 
  Check, 
  Edit3, 
  Layers, 
  Eye, 
  EyeOff,
  Trash2
} from 'lucide-react';
import { InteriorProject } from '../types/project';
import { DetailTab } from './ProjectDetailScreen';

interface ProjectQuickModalProps {
  project: InteriorProject;
  onClose: () => void;
  onNavigateDetail: (project: InteriorProject, defaultTab?: DetailTab) => void;
  onEditBasicInfo: (project: InteriorProject) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectQuickModal: React.FC<ProjectQuickModalProps> = ({
  project,
  onClose,
  onNavigateDetail,
  onEditBasicInfo,
  onDeleteProject
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAccessCode, setShowAccessCode] = useState<boolean>(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Calculate progress / duration
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  const now = new Date('2026-10-22').getTime();
  const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.round((now - start) / (1000 * 60 * 60 * 24))));
  const progressPercent = Math.round((elapsedDays / totalDays) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-start gap-3">
            <div 
              className="w-3.5 h-12 rounded-full shrink-0 mt-1" 
              style={{ backgroundColor: project.color || '#2563EB' }} 
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-neutral-800 border border-neutral-200">
                  {project.status}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {project.startDate} ~ {project.endDate}
                </span>
              </div>
              <h2 className="text-xl font-bold text-neutral-900 leading-snug">
                {project.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Core Basic Information requested */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
              <span>공정 진행률 (D+{elapsedDays}일 / 총 {totalDays}일)</span>
              <span className="font-mono text-neutral-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${progressPercent}%`, 
                  backgroundColor: project.color || '#2563EB' 
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. 업체명 */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>업체명 / 발주처</span>
              </div>
              <p className="text-sm font-semibold text-neutral-900">
                {project.clientCompany || '미지정'}
              </p>
            </div>

            {/* 2. 시공팀 / 인원 */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-1">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>시공팀 / 투입 인원</span>
                </div>
                <span className="font-mono text-xs font-semibold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  총 {project.teamCount || 0}명
                </span>
              </div>
              <p className="text-sm font-semibold text-neutral-900">
                {project.constructionTeam || '시공팀 미지정'}
              </p>
              {project.teamMembers && (
                <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                  {project.teamMembers}
                </p>
              )}
            </div>
          </div>

          {/* 3. 현장주소 및 출입비밀번호 */}
          <div className="space-y-3">
            {/* Address */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150">
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>현장 주소</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${project.address} ${project.addressDetail}`, 'address')}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {copiedField === 'address' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">복사완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>주소 복사</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm font-semibold text-neutral-900">
                {project.address} {project.addressDetail}
              </p>
            </div>

            {/* Access Code (공동현관 & 세대 도어락 분리 표시) */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-950 font-bold">
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span>현장 출입 비밀번호</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccessCode(!showAccessCode)}
                  className="flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-950 cursor-pointer"
                  title={showAccessCode ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showAccessCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showAccessCode ? '숨기기' : '보기'}</span>
                </button>
              </div>

              {(() => {
                const bCode = project.buildingAccessCode || (project.accessCode?.includes('공동') ? project.accessCode.split('/')[0]?.replace(/공동[^\s:]*[:\s]*/g, '').trim() : '');
                const uCode = project.unitAccessCode || (project.accessCode?.includes('/') ? project.accessCode.split('/')[1]?.replace(/(세대|도어락)[^\s:]*[:\s]*/g, '').trim() : project.accessCode);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                    {/* 공동현관 */}
                    <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0">
                        <span className="text-[10px] text-neutral-500 font-semibold block">🏢 공동현관</span>
                        <span className="text-sm font-mono font-bold text-neutral-900 tracking-wide block truncate">
                          {showAccessCode ? (bCode || '미입력') : '••••••••'}
                        </span>
                      </div>
                      {bCode && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(bCode, 'building')}
                          className="p-1.5 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded transition-colors shrink-0"
                          title="공동현관 비밀번호 복사"
                        >
                          {copiedField === 'building' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* 세대 도어락 */}
                    <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="min-w-0">
                        <span className="text-[10px] text-neutral-500 font-semibold block">🔑 세대 도어락</span>
                        <span className="text-sm font-mono font-bold text-neutral-900 tracking-wide block truncate">
                          {showAccessCode ? (uCode || '미입력') : '••••••••'}
                        </span>
                      </div>
                      {uCode && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(uCode, 'unit')}
                          className="p-1.5 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded transition-colors shrink-0"
                          title="세대 도어락 비밀번호 복사"
                        >
                          {copiedField === 'unit' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 4. 시공에 대한 간단한 내용 */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150">
            <div className="text-xs text-neutral-500 font-medium mb-1.5">
              시공에 대한 간단한 내용 (공사 범위 및 특이사항)
            </div>
            <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
              {project.scopeSummary || '등록된 시공 내용 요약이 없습니다.'}
            </p>
          </div>

          {/* Manager & Contact */}
          {(project.managerName || project.managerPhone) && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-100/70 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500">현장 담당:</span>
                <span className="font-semibold text-neutral-800">{project.managerName}</span>
              </div>
              {project.managerPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <a 
                    href={`tel:${project.managerPhone}`}
                    className="font-mono text-neutral-800 hover:underline"
                  >
                    {project.managerPhone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Quick Detailed Counters Preview (Clickable to jump directly) */}
          <div className="grid grid-cols-5 gap-2 pt-1 border-t border-neutral-150">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDetail(project, 'measurement');
              }}
              className="text-center p-2 rounded-lg bg-neutral-50 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200 text-left group"
              title="실측 체크리스트로 이동"
            >
              <span className="text-[10px] text-neutral-500 block group-hover:text-blue-700 truncate">실측체크</span>
              <span className="text-xs font-mono font-bold text-neutral-900 group-hover:text-blue-700">
                {project.siteMeasurementForm ? '양식완료' : '작성하기'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDetail(project, 'orders');
              }}
              className="text-center p-2 rounded-lg bg-neutral-50 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200 text-left group"
              title="발주 품목으로 이동"
            >
              <span className="text-[10px] text-neutral-500 block group-hover:text-emerald-700 truncate">발주품목</span>
              <span className="text-xs font-mono font-bold text-neutral-900 group-hover:text-emerald-700">
                {project.orderChecklist.length}건
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDetail(project, 'photos');
              }}
              className="text-center p-2 rounded-lg bg-neutral-50 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 text-left group"
              title="현장 사진으로 이동"
            >
              <span className="text-[10px] text-neutral-500 block group-hover:text-rose-700 truncate">현장사진</span>
              <span className="text-xs font-mono font-bold text-neutral-900 group-hover:text-rose-700">
                {project.completionPhotos.length}장
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDetail(project, 'estimates');
              }}
              className="text-center p-2 rounded-lg bg-neutral-50 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200 text-left group"
              title="본견적서로 이동"
            >
              <span className="text-[10px] text-neutral-500 block group-hover:text-purple-700 truncate">본견적서</span>
              <span className="text-xs font-mono font-bold text-neutral-900 group-hover:text-purple-700">
                계산서
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateDetail(project, 'defects');
              }}
              className="text-center p-2 rounded-lg bg-neutral-50 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200 text-left group"
              title="A/S 미마감으로 이동"
            >
              <span className="text-[10px] text-neutral-500 block group-hover:text-amber-700 truncate">A/S미마감</span>
              <span className={`text-xs font-mono font-bold ${
                project.defectAndAS.filter(d => d.status !== '조치완료').length > 0 
                  ? 'text-amber-600' 
                  : 'text-neutral-700'
              }`}>
                {project.defectAndAS.filter(d => d.status !== '조치완료').length}건
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer - Explicit requirement: 상세 정보들을 등록할 수 있는 화면으로 이동되는 기능 */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onEditBasicInfo(project)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>기본 정보 수정</span>
            </button>

            {onDeleteProject && (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                    title="현장 및 관련 데이터 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>현장 삭제</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-200 animate-in fade-in">
                    <span className="text-[11px] font-bold text-red-700 pl-1">삭제할까요?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProject(project.id);
                        onClose();
                      }}
                      className="px-2 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      삭제 확인
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-1.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200 rounded"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateDetail(project);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-all transform hover:scale-[1.01]"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>상세 정보 등록 및 관리로 이동</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
