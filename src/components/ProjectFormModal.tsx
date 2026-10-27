import React, { useState } from 'react';
import { X, Building2, MapPin, Key, Users, Calendar, Phone, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { InteriorProject, ProjectStatus } from '../types/project';
import { computeProjectStatus } from '../utils/projectStatus';

interface ProjectFormModalProps {
  initialData?: InteriorProject | null;
  defaultStartDate?: string;
  onClose: () => void;
  onSave: (project: InteriorProject) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  initialData,
  defaultStartDate = '2026-10-22',
  onClose,
  onSave,
  onDelete
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState<string>(initialData?.name || '');
  const [clientCompany, setClientCompany] = useState<string>(initialData?.clientCompany || '');
  const [startDate, setStartDate] = useState<string>(initialData?.startDate || defaultStartDate);
  const [endDate, setEndDate] = useState<string>(
    initialData?.endDate ||
      new Date(new Date(defaultStartDate).getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [constructionTeam, setConstructionTeam] = useState<string>(initialData?.constructionTeam || '종합시공 1팀');
  const [teamCount, setTeamCount] = useState<string>(String(initialData?.teamCount || '4'));
  const [teamMembers, setTeamMembers] = useState<string>(initialData?.teamMembers || '');
  const [address, setAddress] = useState<string>(initialData?.address || '');
  const [addressDetail, setAddressDetail] = useState<string>(initialData?.addressDetail || '');
  
  // Parse initial building and unit access codes
  const parseInitialCodes = () => {
    let building = initialData?.buildingAccessCode || '';
    let unit = initialData?.unitAccessCode || '';

    if (!building && !unit && initialData?.accessCode) {
      const parts = initialData.accessCode.split('/');
      for (const p of parts) {
        const trimmed = p.trim();
        if (trimmed.includes('공동')) {
          building = trimmed.replace(/^.*공동[^\s:]*[:\s]*/g, '').trim();
        } else if (trimmed.includes('세대') || trimmed.includes('도어락') || trimmed.includes('현관문')) {
          unit = trimmed.replace(/^.*(세대|도어락|현관문)[^\s:]*[:\s]*/g, '').trim();
        } else if (!building) {
          building = trimmed;
        } else if (!unit) {
          unit = trimmed;
        }
      }
      if (!unit && !building) {
        unit = initialData.accessCode;
      }
    }
    return { building, unit };
  };

  const initialCodes = parseInitialCodes();
  const [buildingAccessCode, setBuildingAccessCode] = useState<string>(initialCodes.building);
  const [unitAccessCode, setUnitAccessCode] = useState<string>(initialCodes.unit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [scopeSummary, setScopeSummary] = useState<string>(initialData?.scopeSummary || '');
  const [managerName, setManagerName] = useState<string>(initialData?.managerName || '');
  const [managerPhone, setManagerPhone] = useState<string>(initialData?.managerPhone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('현장명을 입력해주세요.');
      return;
    }

    // Compute combined accessCode for backwards compatibility
    const combinedParts: string[] = [];
    if (buildingAccessCode.trim()) combinedParts.push(`공동현관 ${buildingAccessCode.trim()}`);
    if (unitAccessCode.trim()) combinedParts.push(`세대도어락 ${unitAccessCode.trim()}`);
    const finalAccessCode = combinedParts.join(' / ') || buildingAccessCode.trim() || unitAccessCode.trim() || '미입력';

    // Compute status and color automatically based on dates and defects
    const autoStatusInfo = computeProjectStatus({
      startDate,
      endDate,
      defectAndAS: initialData?.defectAndAS || []
    });

    const project: InteriorProject = {
      id: initialData?.id || `proj-${Date.now()}`,
      name: name.trim(),
      clientCompany: clientCompany.trim(),
      startDate,
      endDate,
      status: autoStatusInfo.status as ProjectStatus,
      color: autoStatusInfo.color,
      constructionTeam: constructionTeam.trim(),
      teamCount: Number(teamCount) || 1,
      teamMembers: teamMembers.trim(),
      address: address.trim(),
      addressDetail: addressDetail.trim(),
      accessCode: finalAccessCode,
      buildingAccessCode: buildingAccessCode.trim(),
      unitAccessCode: unitAccessCode.trim(),
      scopeSummary: scopeSummary.trim(),
      managerName: managerName.trim(),
      managerPhone: managerPhone.trim(),

      measurementChecklist: initialData?.measurementChecklist || [
        {
          id: `meas-${Date.now()}-1`,
          space: '거실',
          title: '거실 천장고 및 우물천장 규격 실측',
          dimensions: { width: 5000, depth: 4500, height: 2600, unit: 'mm' },
          isChecked: false,
          notes: '기본 치수 측정 완료 필요',
          specialIssues: ''
        },
        {
          id: `meas-${Date.now()}-2`,
          space: '주방',
          title: '싱크대 배수구 위치 및 후드 배기구 확인',
          dimensions: { width: 3200, depth: 900, height: 880, unit: 'mm' },
          isChecked: false,
          notes: '급배수관 코어링 상태 확인',
          specialIssues: ''
        }
      ],
      roughDrawing: initialData?.roughDrawing || {
        imageDataUrl: null,
        uploadedAt: new Date().toISOString().split('T')[0],
        notes: '초기 현장 답사 스케치 및 메모',
        measurementsSummary: ''
      },
      officialBlueprints: initialData?.officialBlueprints || [],
      orderChecklist: initialData?.orderChecklist || [],
      completionPhotos: initialData?.completionPhotos || [],
      estimates: initialData?.estimates || {
        preliminaryQuote: [],
        finalQuote: [],
        marginRate: 15,
        includeVat: true,
        discountAmount: 0
      },
      defectAndAS: initialData?.defectAndAS || [],

      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(project);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-2xl w-full my-8 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {isEditing ? '현장 기본 정보 수정' : '새 인테리어 시공현장 등록'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              기본 정보(업체명, 시공팀/인원, 주소 및 출입비밀번호, 시공내용)를 입력합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 현장명 & 상태 & 색상 */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                현장명 *
              </label>
              <input
                type="text"
                required
                placeholder="예: 압구정 현대 7차 48평 전체 리모델링"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-blue-500 font-medium"
              />
            </div>

            {/* 시공 시작일 & 완료일 & 자동 산정 진행 상태 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  시공 시작일 *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  시공 완료예정일 *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-blue-500"
                />
              </div>
            </div>

            {/* 자동화된 진행 상태 안내 카드 (별도 캘린더 표시 색상 기능 제거) */}
            {(() => {
              const autoStatus = computeProjectStatus({
                startDate,
                endDate,
                defectAndAS: initialData?.defectAndAS || []
              });

              return (
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700">진행 상태 (자동 산정)</span>
                    <div className="flex items-center gap-1.5">
                      <span 
                        style={{ backgroundColor: autoStatus.color }}
                        className="w-2.5 h-2.5 rounded-full"
                      />
                      <span 
                        style={{ backgroundColor: autoStatus.color }}
                        className="text-white text-xs font-bold px-2 py-0.5 rounded shadow-2xs"
                      >
                        {autoStatus.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    * {autoStatus.reason}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[10px] text-neutral-500 border-t border-neutral-200">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>착공 전 = 준비중(초록색)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>공사 기간 = 시공중(파란색)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-neutral-800" />
                      <span>완료 후 = 완료(검정색)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>A/S 발생 시 = as 및 마감 중(주황색)</span>
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="border-t border-neutral-200/80 pt-4 space-y-4">
            {/* 업체명 (Client Company) */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                업체명 / 의뢰처 / 고객명 *
              </label>
              <input
                type="text"
                required
                placeholder="예: (주)스튜디오 림 / 김서연 대표"
                value={clientCompany}
                onChange={e => setClientCompany(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 시공팀 & 인원 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  시공팀 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 종합시공 프리미엄 1팀 (목공/전기/타일)"
                  value={constructionTeam}
                  onChange={e => setConstructionTeam(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  투입 인원 (명)
                </label>
                <input
                  type="number"
                  min="1"
                  value={teamCount}
                  onChange={e => setTeamCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                세부 인원 구성 및 반장 명단
              </label>
              <input
                type="text"
                placeholder="예: 목공반장 최진태, 전기기사 김영석 외 조적 2인"
                value={teamMembers}
                onChange={e => setTeamMembers(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 현장주소 및 출입비밀번호 */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    현장 주소 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 서울특별시 용산구 한남대로 91"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    동 / 호수 (상세 주소)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 204동 1402호"
                    value={addressDetail}
                    onChange={e => setAddressDetail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* 현장 출입 비밀번호 (공동현관 / 세대도어락 분리) */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span>현장 출입 비밀번호</span>
                  </label>
                  <span className="text-[11px] text-amber-800">공동현관 및 세대 도어락 분리 입력</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-800 mb-1">
                      🏢 공동현관 비밀번호
                    </label>
                    <input
                      type="text"
                      placeholder="예: #4589# 또는 종1234*"
                      value={buildingAccessCode}
                      onChange={e => setBuildingAccessCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-amber-300 rounded-lg bg-white text-neutral-900 focus:outline-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-800 mb-1">
                      🔑 세대 도어락 비밀번호
                    </label>
                    <input
                      type="text"
                      placeholder="예: *1290* 또는 키보관함 7788"
                      value={unitAccessCode}
                      onChange={e => setUnitAccessCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold border border-amber-300 rounded-lg bg-white text-neutral-900 focus:outline-amber-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* 시공에 대한 간단한 내용 */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                시공에 대한 간단한 내용 (공사 범위 및 특이사항)
              </label>
              <textarea
                rows={3}
                placeholder="예: 48평형 아파트 전체 철거 후 히든도어, 라인조명, 무몰딩, 도장마감, 아일랜드 대형화, 욕실 2개소 호텔식 졸리컷 타일 시공"
                value={scopeSummary}
                onChange={e => setScopeSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 현장 소장 / 담당자 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  현장소장 / 관리자명
                </label>
                <input
                  type="text"
                  placeholder="예: 박현우 소장"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  현장소장 연락처
                </label>
                <input
                  type="text"
                  placeholder="예: 010-8921-3490"
                  value={managerPhone}
                  onChange={e => setManagerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-100">
            {isEditing && onDelete ? (
              <div>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>현장 삭제</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-200">
                    <span className="text-xs font-bold text-red-700 pl-1">정말 삭제하시겠습니까?</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (initialData?.id) {
                          onDelete(initialData.id);
                          onClose();
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      삭제 확인
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-200 rounded"
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-colors"
              >
                {isEditing ? '수정 완료' : '현장 등록하기'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
