import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Key, 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { InteriorProject } from '../types/project';

interface ProjectsListViewProps {
  projects: InteriorProject[];
  onSelectProject: (project: InteriorProject) => void;
  onNavigateDetail: (project: InteriorProject) => void;
  onAddNewProject: () => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  projects,
  onSelectProject,
  onNavigateDetail,
  onAddNewProject,
  onDeleteProject
}) => {
  const [filter, setFilter] = useState<string>('전체');
  const [search, setSearch] = useState<string>('');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const filtered = projects.filter(p => {
    if (filter !== '전체' && p.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.clientCompany.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-4 md:p-6">
      {/* Header controls */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">전체 시공현장 목록</h2>
          <p className="text-xs text-neutral-500">
            총 {projects.length}개 현장의 진행 현황과 실측, 도면, 발주, 사진, 견적, A/S를 통합 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="현장명, 업체명 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs border border-neutral-200 rounded-lg w-52 focus:outline-blue-500"
          />

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
            {['전체', '공사중', '착공', '준비중', '완공', 'AS진행'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filter === st ? 'bg-white text-neutral-900 font-medium shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddNewProject}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
          >
            + 새 현장 등록
          </button>
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(proj => {
          const measCount = proj.measurementChecklist.length;
          const measDone = proj.measurementChecklist.filter(m => m.isChecked).length;
          const orderCount = proj.orderChecklist.length;
          const photoCount = proj.completionPhotos.length;
          const defectPending = proj.defectAndAS.filter(d => d.status !== '조치완료').length;

          return (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {proj.status}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    {proj.startDate} ~ {proj.endDate}
                  </span>
                </div>

                <div>
                  <h3 
                    onClick={() => onSelectProject(proj)}
                    className="text-base font-bold text-neutral-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                  >
                    {proj.name}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {proj.clientCompany}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-150">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{proj.address} {proj.addressDetail}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="font-mono text-[11px] font-medium text-amber-950 flex flex-wrap gap-x-2 gap-y-0.5 leading-tight">
                      <span>
                        <strong className="text-neutral-500 font-normal">공동:</strong>{' '}
                        {proj.buildingAccessCode || (proj.accessCode?.includes('공동') ? proj.accessCode.split('/')[0]?.replace(/공동[^\s:]*[:\s]*/g, '').trim() : '-')}
                      </span>
                      <span>
                        <strong className="text-neutral-500 font-normal">세대:</strong>{' '}
                        {proj.unitAccessCode || (proj.accessCode?.includes('/') ? proj.accessCode.split('/')[1]?.replace(/(세대|도어락)[^\s:]*[:\s]*/g, '').trim() : proj.accessCode || '-')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{proj.constructionTeam} ({proj.teamCount}명)</span>
                  </div>
                </div>

                {/* 4 quick detail metrics */}
                <div className="grid grid-cols-4 gap-1 pt-1 text-center">
                  <div className="bg-neutral-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-neutral-400 block">실측</span>
                    <span className="text-xs font-mono font-bold text-neutral-800">{measDone}/{measCount}</span>
                  </div>
                  <div className="bg-neutral-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-neutral-400 block">발주</span>
                    <span className="text-xs font-mono font-bold text-neutral-800">{orderCount}건</span>
                  </div>
                  <div className="bg-neutral-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-neutral-400 block">사진</span>
                    <span className="text-xs font-mono font-bold text-neutral-800">{photoCount}장</span>
                  </div>
                  <div className="bg-neutral-50 p-1.5 rounded-lg">
                    <span className="text-[10px] text-neutral-400 block">A/S</span>
                    <span className={`text-xs font-mono font-bold ${defectPending > 0 ? 'text-red-600' : 'text-neutral-800'}`}>
                      {defectPending}건
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-neutral-100">
                {onDeleteProject && (
                  <div>
                    {deletingProjectId !== proj.id ? (
                      <button
                        type="button"
                        onClick={() => setDeletingProjectId(proj.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="현장 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in">
                        <span className="text-[10px] font-bold text-red-700 pl-1">삭제?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(proj.id);
                            setDeletingProjectId(null);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          확인
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProjectId(null)}
                          className="px-1.5 py-0.5 text-[10px] text-neutral-600 hover:bg-neutral-200 rounded"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => onSelectProject(proj)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    기본 정보
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateDetail(proj)}
                    className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <span>상세 관리</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
