import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckSquare, 
  PenTool, 
  FileCheck, 
  ShoppingCart, 
  Camera, 
  Calculator, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink, 
  Download, 
  Printer, 
  Clock, 
  Calendar, 
  DollarSign, 
  Building2, 
  MapPin, 
  Key, 
  User, 
  Upload, 
  Save, 
  X,
  Maximize2,
  FileSpreadsheet,
  Ruler
} from 'lucide-react';
import { 
  InteriorProject, 
  MeasurementItem, 
  OfficialBlueprint, 
  OrderItem, 
  OrderStatus, 
  CompletionPhoto, 
  QuoteItem, 
  DefectItem, 
  DefectSeverity, 
  DefectStatus,
  SiteMeasurementForm,
  createDefaultSiteMeasurementForm,
  DetailedFinalQuote
} from '../types/project';
import { DrawingCanvas } from './DrawingCanvas';
import { SiteMeasurementChecklistForm } from './SiteMeasurementChecklistForm';
import { UnifiedDrawingsView } from './UnifiedDrawingsView';
import { OrderChecklistManager } from './OrderChecklistManager';
import { ConstructionPhotosManager } from './ConstructionPhotosManager';
import { DetailedFinalQuoteView } from './DetailedFinalQuoteView';
import { createDefaultDetailedFinalQuote } from '../utils/quoteCalculator';

interface ProjectDetailScreenProps {
  project: InteriorProject;
  initialTab?: DetailTab;
  onBack: () => void;
  onUpdateProject: (updatedProject: InteriorProject) => void;
  onDeleteProject?: (projectId: string) => void;
}

export type DetailTab = 
  | 'measurement' // 1. 실측 체크리스트
  | 'drawings' // 2. 도면 통합 관리 (가도면 & 본도면)
  | 'roughDrawing' // (호환용)
  | 'blueprints' // (호환용)
  | 'orders' // 3. 발주 품목 체크리스트
  | 'photos' // 4. 시공 완료 사진등록
  | 'estimates' // 5. 가견적 및 본견적 작성
  | 'defects'; // 6. A/S 및 미마감 내용 입력

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({
  project,
  initialTab = 'measurement',
  onBack,
  onUpdateProject,
  onDeleteProject
}) => {
  const normalizedInitialTab = (initialTab === 'roughDrawing' || initialTab === 'blueprints') ? 'drawings' : initialTab;
  const [activeTab, setActiveTab] = useState<DetailTab>(normalizedInitialTab);
  const [currentProject, setCurrentProject] = useState<InteriorProject>(project);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  
  // Quick notify toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const updateAndSave = (updated: InteriorProject, msg = '저장되었습니다.') => {
    setCurrentProject(updated);
    onUpdateProject(updated);
    triggerToast(msg);
  };

  /* ================= 1. 실측 체크리스트 ================= */
  const [measSubTab, setMeasSubTab] = useState<'form' | 'spaces'>('form');
  const [measSpaceFilter, setMeasSpaceFilter] = useState<string>('전체');
  const [showAddMeasModal, setShowAddMeasModal] = useState<boolean>(false);
  const [newMeasSpace, setNewMeasSpace] = useState<string>('거실');
  const [newMeasTitle, setNewMeasTitle] = useState<string>('');
  const [newMeasWidth, setNewMeasWidth] = useState<string>('');
  const [newMeasDepth, setNewMeasDepth] = useState<string>('');
  const [newMeasHeight, setNewMeasHeight] = useState<string>('');
  const [newMeasNotes, setNewMeasNotes] = useState<string>('');
  const [newMeasSpecial, setNewMeasSpecial] = useState<string>('');

  const handleToggleMeasurement = (id: string) => {
    const updatedList = currentProject.measurementChecklist.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    updateAndSave({ ...currentProject, measurementChecklist: updatedList });
  };

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeasTitle.trim()) return;

    const newItem: MeasurementItem = {
      id: `meas-${Date.now()}`,
      space: newMeasSpace,
      title: newMeasTitle.trim(),
      dimensions: {
        width: newMeasWidth ? Number(newMeasWidth) : undefined,
        depth: newMeasDepth ? Number(newMeasDepth) : undefined,
        height: newMeasHeight ? Number(newMeasHeight) : undefined,
        unit: 'mm'
      },
      isChecked: false,
      notes: newMeasNotes.trim(),
      specialIssues: newMeasSpecial.trim()
    };

    const updated = {
      ...currentProject,
      measurementChecklist: [...currentProject.measurementChecklist, newItem]
    };
    updateAndSave(updated, '새 실측 항목이 추가되었습니다.');
    setShowAddMeasModal(false);
    setNewMeasTitle('');
    setNewMeasWidth('');
    setNewMeasDepth('');
    setNewMeasHeight('');
    setNewMeasNotes('');
    setNewMeasSpecial('');
  };

  const handleDeleteMeasurement = (id: string) => {
    if (!window.confirm('해당 실측 항목을 삭제하시겠습니까?')) return;
    const updated = {
      ...currentProject,
      measurementChecklist: currentProject.measurementChecklist.filter(m => m.id !== id)
    };
    updateAndSave(updated, '실측 항목이 삭제되었습니다.');
  };

  /* ================= 3. 발주 품목 체크리스트 (OrderChecklistManager 관리) ================= */


  /* ================= 4. 시공 사진 관리 (ConstructionPhotosManager 관리) ================= */


  /* ================= 5. 본견적 작성 (정밀 본 견적 계산서) ================= */
  const handleUpdateDetailedFinalQuote = (updatedQuote: DetailedFinalQuote) => {
    const updated = {
      ...currentProject,
      estimates: {
        ...currentProject.estimates,
        detailedFinalQuote: updatedQuote
      }
    };
    updateAndSave(updated, '본 견적 계산서가 저장되었습니다.');
  };

  /* ================= 7. A/S 및 미마감 내용 입력 ================= */
  const [defectStatusFilter, setDefectStatusFilter] = useState<string>('전체');
  const [showAddDefectModal, setShowAddDefectModal] = useState<boolean>(false);
  const [newDefectTitle, setNewDefectTitle] = useState<string>('');
  const [newDefectLocation, setNewDefectLocation] = useState<string>('');
  const [newDefectAssignee, setNewDefectAssignee] = useState<string>('');
  const [newDefectTargetDate, setNewDefectTargetDate] = useState<string>('');
  const [newDefectTargetTimeSlot, setNewDefectTargetTimeSlot] = useState<string>('');
  const [newDefectAction, setNewDefectAction] = useState<string>('');
  const [newDefectPhoto, setNewDefectPhoto] = useState<string | null>(null);
  const [expandedPhotoUrl, setExpandedPhotoUrl] = useState<string | null>(null);

  const handleDefectPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setNewDefectPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUpdateDefectStatus = (id: string, newStatus: DefectStatus) => {
    const updated = {
      ...currentProject,
      defectAndAS: currentProject.defectAndAS.map(item => 
        item.id === id 
          ? { 
              ...item, 
              status: newStatus, 
              resolvedDate: newStatus === '조치완료' ? new Date().toISOString().split('T')[0] : undefined 
            } 
          : item
      )
    };
    updateAndSave(updated, `A/S 상태가 '${newStatus}'(으)로 업데이트되었습니다.`);
  };

  const handleAddDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefectTitle.trim()) return;

    const newItem: DefectItem = {
      id: `as-${Date.now()}`,
      title: newDefectTitle.trim(),
      location: newDefectLocation.trim() || '현장 전체',
      reportedDate: new Date().toISOString().split('T')[0],
      targetDate: newDefectTargetDate || new Date().toISOString().split('T')[0],
      targetTimeSlot: newDefectTargetTimeSlot.trim() || undefined,
      status: '접수',
      assignee: newDefectAssignee.trim() || '미지정',
      actionTaken: newDefectAction.trim(),
      photoUrl: newDefectPhoto || undefined
    };

    const updated = {
      ...currentProject,
      defectAndAS: [...currentProject.defectAndAS, newItem]
    };
    updateAndSave(updated, 'A/S 및 미마감 하자 내용(사진 포함)이 등록되었습니다.');
    setShowAddDefectModal(false);
    setNewDefectTitle('');
    setNewDefectLocation('');
    setNewDefectAssignee('');
    setNewDefectTargetTimeSlot('');
    setNewDefectAction('');
    setNewDefectPhoto(null);
  };

  const handleDeleteDefect = (id: string) => {
    const updated = {
      ...currentProject,
      defectAndAS: currentProject.defectAndAS.filter(d => d.id !== id)
    };
    updateAndSave(updated, 'A/S 항목이 삭제되었습니다.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 text-neutral-900">
      {/* Top Breadcrumb & Project Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>캘린더로 돌아가기</span>
            </button>
            <div className="h-5 w-px bg-neutral-200" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                  {currentProject.status}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {currentProject.startDate} ~ {currentProject.endDate}
                </span>
              </div>
              <h1 className="text-lg font-bold text-neutral-900 mt-0.5 flex items-center gap-2">
                {currentProject.name}
              </h1>
            </div>
          </div>

          {/* Quick metadata strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200/80 shrink-0">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-medium text-neutral-800">{currentProject.clientCompany}</span>
            </div>
            <span className="text-neutral-300">|</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span className="truncate max-w-[180px]" title={currentProject.address}>
                {currentProject.address}
              </span>
            </div>
            <span className="text-neutral-300">|</span>
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div className="flex items-center gap-1.5 font-mono">
                <span className="bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold" title="공동현관 비밀번호">
                  공동: {currentProject.buildingAccessCode || (currentProject.accessCode?.includes('공동') ? currentProject.accessCode.split('/')[0]?.replace(/공동[^\s:]*[:\s]*/g, '').trim() : '-')}
                </span>
                <span className="bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-bold" title="세대 도어락 비밀번호">
                  세대: {currentProject.unitAccessCode || (currentProject.accessCode?.includes('/') ? currentProject.accessCode.split('/')[1]?.replace(/(세대|도어락)[^\s:]*[:\s]*/g, '').trim() : currentProject.accessCode || '-')}
                </span>
              </div>
            </div>

            {onDeleteProject && (
              <>
                <span className="text-neutral-300">|</span>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 text-neutral-400 hover:text-red-600 transition-colors py-0.5 px-1.5 rounded hover:bg-red-50 cursor-pointer"
                    title="현장 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">현장 삭제</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-red-100/90 px-2 py-0.5 rounded border border-red-200 animate-in fade-in">
                    <span className="text-[10px] font-bold text-red-800">정말 삭제할까요?</span>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(currentProject.id)}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-1 py-0.5 text-[10px] text-neutral-600 hover:bg-neutral-200 rounded"
                    >
                      취소
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 7 Navigation Tabs requested by user */}
        <div className="max-w-7xl mx-auto mt-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 border-b border-neutral-200 min-w-max pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('measurement')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'measurement'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50/80'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>1. 실측 체크리스트</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-700">
                {currentProject.measurementChecklist.filter(m => m.isChecked).length}/{currentProject.measurementChecklist.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('drawings')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'drawings' || activeTab === 'roughDrawing' || activeTab === 'blueprints'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50/80'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <PenTool className="w-4 h-4 text-indigo-600" />
              <span>2. 도면 통합 관리 (가도면 & 본도면)</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-700">
                본도면 {currentProject.officialBlueprints.length}건
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50/80'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>3. 발주 품목 체크리스트</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-700">
                {currentProject.orderChecklist.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50/80'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Camera className="w-4 h-4 text-rose-600" />
              <span>4. 시공 완료 사진등록</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-neutral-200/70 text-neutral-700">
                {currentProject.completionPhotos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('estimates')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'estimates'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50/80'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-purple-600" />
              <span>5. 본견적 작성</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('defects')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'defects'
                  ? 'border-neutral-900 text-neutral-900 bg-neutral-50/80'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>6. A/S 및 미마감 내용 입력</span>
              {currentProject.defectAndAS.filter(d => d.status !== '조치완료').length > 0 && (
                <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold">
                  {currentProject.defectAndAS.filter(d => d.status !== '조치완료').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content Container */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ================= TAB 1: 실측 체크리스트 ================= */}
        {activeTab === 'measurement' && (
          <div className="space-y-6">
            {/* Sub-tab Navigation for Measurement */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMeasSubTab('form')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-all ${
                    measSubTab === 'form'
                      ? 'bg-white text-neutral-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>현장 정밀 실측 양식 (기본마감/상판/가전/기기/젠다이/조명)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeasSubTab('spaces')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md transition-all ${
                    measSubTab === 'spaces'
                      ? 'bg-white text-neutral-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Ruler className="w-4 h-4 text-indigo-600" />
                  <span>공간별 치수 실측 (W×D×H)</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                    {currentProject.measurementChecklist.filter(m => m.isChecked).length}/{currentProject.measurementChecklist.length}
                  </span>
                </button>
              </div>

              <div className="text-xs text-neutral-500 px-2 hidden lg:block">
                {measSubTab === 'form' 
                  ? '마감 방식, 상판, 가전 키친핏, 배선, 부자재 규격을 기록하는 양식입니다.' 
                  : '각 실별 가로/세로/높이 치수 및 레이저 레벨 오차를 기록합니다.'}
              </div>
            </div>

            {/* Sub-tab 1: 정밀 실측 체크리스트 양식 */}
            {measSubTab === 'form' && (
              <SiteMeasurementChecklistForm
                form={currentProject.siteMeasurementForm || createDefaultSiteMeasurementForm()}
                onChange={(updatedForm) => {
                  updateAndSave(
                    { ...currentProject, siteMeasurementForm: updatedForm },
                    '실측 체크리스트 정보가 저장되었습니다.'
                  );
                }}
                onSaveToast={triggerToast}
              />
            )}

            {/* Sub-tab 2: 공간별 치수 실측 */}
            {measSubTab === 'spaces' && (
              <div className="space-y-6">
                {/* Header Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">공간별 치수 실측 체크리스트</h3>
                      <p className="text-xs text-neutral-500">
                        공간별 치수(가로x세로x천장고) 및 전기/설비 간섭, 누수/벽체 상태를 기록합니다.
                      </p>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-neutral-200" />
                    <div className="text-xs text-neutral-600">
                      <span>진행률: </span>
                      <span className="font-mono font-bold text-blue-600">
                        {Math.round(
                          (currentProject.measurementChecklist.filter(m => m.isChecked).length /
                            (currentProject.measurementChecklist.length || 1)) * 100
                        )}%
                      </span>
                      <span className="text-neutral-400 font-mono ml-1">
                        ({currentProject.measurementChecklist.filter(m => m.isChecked).length}/
                        {currentProject.measurementChecklist.length})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Space filter */}
                    <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
                      {['전체', '거실', '주방', '안방', '공용욕실', '현관'].map(space => (
                        <button
                          key={space}
                          type="button"
                          onClick={() => setMeasSpaceFilter(space)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            measSpaceFilter === space
                              ? 'bg-white text-neutral-900 font-medium shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {space}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddMeasModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>실측 항목 추가</span>
                    </button>
                  </div>
                </div>

                {/* Checklist Items */}
                <div className="grid grid-cols-1 gap-3">
                  {currentProject.measurementChecklist
                .filter(item => measSpaceFilter === '전체' || item.space === measSpaceFilter)
                .map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isChecked
                        ? 'bg-white border-neutral-200'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleMeasurement(item.id)}
                          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                            item.isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-neutral-300 hover:border-blue-500'
                          }`}
                        >
                          {item.isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                              {item.space}
                            </span>
                            <h4 className={`text-sm font-semibold ${item.isChecked ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                              {item.title}
                            </h4>
                          </div>

                          {/* Dimensions */}
                          {item.dimensions && (item.dimensions.width || item.dimensions.height || item.dimensions.depth) && (
                            <div className="flex items-center gap-3 text-xs font-mono text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded inline-flex">
                              {item.dimensions.width && <span>W: {item.dimensions.width}mm</span>}
                              {item.dimensions.depth && <span>D: {item.dimensions.depth}mm</span>}
                              {item.dimensions.height && <span>H: {item.dimensions.height}mm</span>}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-xs text-neutral-600 mt-1">
                              <span className="font-medium text-neutral-700">메모: </span>
                              {item.notes}
                            </p>
                          )}

                          {item.specialIssues && (
                            <div className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/80 inline-block mt-1">
                              <span className="font-semibold">특이사항: </span>
                              {item.specialIssues}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteMeasurement(item.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-neutral-100 transition-colors"
                        title="항목 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

              {currentProject.measurementChecklist.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                  <CheckSquare className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-700">등록된 실측 항목이 없습니다.</p>
                  <p className="text-xs text-neutral-400 mt-1">우측 상단 '실측 항목 추가' 버튼을 눌러 실측 정보를 입력하세요.</p>
                </div>
              )}
            </div>

            {/* Add Measurement Modal */}
            {showAddMeasModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <form
                  onSubmit={handleAddMeasurement}
                  className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-md w-full p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h3 className="text-base font-bold text-neutral-900">새 실측 항목 추가</h3>
                    <button type="button" onClick={() => setShowAddMeasModal(false)} className="text-neutral-400 hover:text-neutral-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">공간 구분</label>
                      <select
                        value={newMeasSpace}
                        onChange={e => setNewMeasSpace(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                      >
                        <option value="거실">거실</option>
                        <option value="주방">주방</option>
                        <option value="안방">안방</option>
                        <option value="작은방1">작은방1</option>
                        <option value="작은방2">작은방2</option>
                        <option value="공용욕실">공용욕실</option>
                        <option value="안방욕실">안방욕실</option>
                        <option value="현관">현관</option>
                        <option value="발코니">발코니</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">실측 항목명 *</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 싱크대 라인 벽체 치수"
                        value={newMeasTitle}
                        onChange={e => setNewMeasTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">치수 정보 (단위: mm)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="가로 (W)"
                        value={newMeasWidth}
                        onChange={e => setNewMeasWidth(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="세로 (D)"
                        value={newMeasDepth}
                        onChange={e => setNewMeasDepth(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="높이 (H)"
                        value={newMeasHeight}
                        onChange={e => setNewMeasHeight(e.target.value)}
                        className="px-2.5 py-1.5 text-xs font-mono border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">실측 메모 및 주의사항</label>
                    <textarea
                      rows={2}
                      placeholder="예: 배관 간섭 여부, 매립 조명 깊이 확보 등"
                      value={newMeasNotes}
                      onChange={e => setNewMeasNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-amber-900 mb-1">특이사항 (하자/크랙/누수 등)</label>
                    <input
                      type="text"
                      placeholder="예: 우측 벽면 미장 크랙, 바닥 단차 15mm"
                      value={newMeasSpecial}
                      onChange={e => setNewMeasSpecial(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-amber-200 rounded-lg bg-amber-50/40 focus:outline-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMeasModal(false)}
                      className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      추가하기
                    </button>
                  </div>
                </form>
              </div>
            )}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: 도면 통합 관리 (가도면 & 본도면) ================= */}
        {(activeTab === 'drawings' || activeTab === 'roughDrawing' || activeTab === 'blueprints') && (
          <UnifiedDrawingsView
            project={currentProject}
            onUpdateRoughDrawing={(data) => {
              updateAndSave(
                { ...currentProject, roughDrawing: data },
                '가도면 정보가 저장되었습니다.'
              );
            }}
            onUpdateBlueprints={(blueprints) => {
              updateAndSave(
                { ...currentProject, officialBlueprints: blueprints },
                '본도면 정보가 저장되었습니다.'
              );
            }}
            onToast={triggerToast}
          />
        )}

        {/* ================= TAB 3: 발주 품목 체크리스트 (후드, 싱크볼, 쿡탑, 수전 등 14개 품목군) ================= */}
        {activeTab === 'orders' && (
          <OrderChecklistManager
            project={currentProject}
            onUpdateOrders={(orders) => {
              updateAndSave(
                { ...currentProject, orderChecklist: orders },
                '발주 품목 체크리스트가 저장되었습니다.'
              );
            }}
            onToast={triggerToast}
          />
        )}


        {/* ================= TAB 4: 시공 사진 등록 (시공 전 / 시공 후 구분) ================= */}
        {activeTab === 'photos' && (
          <ConstructionPhotosManager
            project={currentProject}
            onUpdatePhotos={(photos) => {
              updateAndSave(
                { ...currentProject, completionPhotos: photos },
                '시공 사진 목록이 저장되었습니다.'
              );
            }}
            onToast={triggerToast}
          />
        )}


        {/* ================= TAB 5: 본견적 작성 (정밀 본 견적 계산서) ================= */}
        {activeTab === 'estimates' && (
          <DetailedFinalQuoteView
            quote={currentProject.estimates.detailedFinalQuote || createDefaultDetailedFinalQuote()}
            projectName={currentProject.name}
            clientCompany={currentProject.clientCompany}
            onUpdateQuote={handleUpdateDetailedFinalQuote}
            triggerToast={triggerToast}
          />
        )}

        {/* ================= TAB 7: A/S 및 미마감 내용 입력 ================= */}
        {activeTab === 'defects' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900">A/S 및 미마감(펀치리스트) 관리</h3>
                <p className="text-xs text-neutral-500">
                  마감 점검 후 발견된 하자 내용, 미마감 항목, 조치 담당자 및 조치 일정을 관리합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs">
                  {['전체', '미해결', '조치완료'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDefectStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        defectStatusFilter === st
                          ? 'bg-white text-neutral-900 font-medium shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddDefectModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>A/S 하자 등록</span>
                </button>
              </div>
            </div>

            {/* Defect Cards List */}
            <div className="grid grid-cols-1 gap-3">
              {currentProject.defectAndAS
                .filter(item => {
                  if (defectStatusFilter === '미해결') return item.status !== '조치완료';
                  if (defectStatusFilter === '조치완료') return item.status === '조치완료';
                  return true;
                })
                .map(item => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-500">
                            위치: <strong className="text-neutral-800">{item.location}</strong>
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            접수: {item.reportedDate}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-neutral-900">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={e => handleUpdateDefectStatus(item.id, e.target.value as DefectStatus)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border cursor-pointer ${
                            item.status === '조치완료'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : item.status === '처리중'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="접수">접수</option>
                          <option value="처리중">처리중</option>
                          <option value="조치완료">조치완료</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteDefect(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded hover:bg-neutral-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Defect Photo thumbnail if exists */}
                    {item.photoUrl && (
                      <div className="mt-2 flex items-center gap-3">
                        <div 
                          onClick={() => setExpandedPhotoUrl(item.photoUrl || null)}
                          className="relative group cursor-pointer w-28 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0"
                          title="클릭하여 크게 보기"
                        >
                          <img src={item.photoUrl} alt="하자 사진" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500">
                          <p className="font-medium text-neutral-700">현장 하자/미마감 첨부 사진</p>
                          <p className="text-[11px] text-neutral-400">클릭 시 원본 크기로 확인 가능합니다.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs text-neutral-600">
                      <div>
                        <span className="text-neutral-500">조치 담당자: </span>
                        <strong className="text-neutral-800">{item.assignee}</strong>
                        <span className="text-neutral-400 mx-2">·</span>
                        <span className="text-neutral-500">조치 예정일: </span>
                        <strong className="font-mono text-neutral-800">{item.targetDate}</strong>
                        {item.targetTimeSlot && (
                          <span className="ml-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                            {item.targetTimeSlot}
                          </span>
                        )}
                        {item.resolvedDate && (
                          <>
                            <span className="text-neutral-400 mx-2">·</span>
                            <span className="text-emerald-700 font-semibold">완료일: {item.resolvedDate}</span>
                          </>
                        )}
                      </div>

                      {item.actionTaken && (
                        <div className="text-xs text-neutral-700 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/60 w-full">
                          <span className="font-semibold text-neutral-800">조치 내용: </span>
                          {item.actionTaken}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {currentProject.defectAndAS.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                  <Check className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-700">현재 등록된 A/S 및 미마감 내용이 없습니다.</p>
                  <p className="text-xs text-neutral-400 mt-1">현장 완공 후 발생한 하자나 미마감 사항을 등록하세요.</p>
                </div>
              )}
            </div>

            {/* Add Defect Modal */}
            {showAddDefectModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <form
                  onSubmit={handleAddDefect}
                  className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <h3 className="text-base font-bold text-neutral-900">새 A/S 및 미마감 내용 등록</h3>
                    <button type="button" onClick={() => setShowAddDefectModal(false)} className="text-neutral-400 hover:text-neutral-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">하자 및 미마감 내용 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 안방 드레스룸 슬라이딩 도어 댐퍼 유격 조정"
                      value={newDefectTitle}
                      onChange={e => setNewDefectTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">발생 위치</label>
                    <input
                      type="text"
                      placeholder="예: 안방 욕실 입구, 주방 아일랜드 하부장"
                      value={newDefectLocation}
                      onChange={e => setNewDefectLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-red-500"
                    />
                  </div>

                  {/* Photo upload input for Defect */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">하자 현장 사진 첨부</label>
                    {newDefectPhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-neutral-300 bg-neutral-100">
                        <img src={newDefectPhoto} alt="하자 사진 미리보기" className="w-full h-36 object-cover" />
                        <button
                          type="button"
                          onClick={() => setNewDefectPhoto(null)}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow-md transition-colors"
                          title="사진 삭제"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-red-400 rounded-lg p-3 cursor-pointer bg-neutral-50 hover:bg-red-50/20 transition-colors">
                        <Camera className="w-5 h-5 text-neutral-400 mb-1" />
                        <span className="text-xs font-medium text-neutral-600">하자 사진 등록 (클릭하여 사진 선택)</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5">JPG, PNG 파일 첨부 가능</span>
                        <input type="file" accept="image/*" onChange={handleDefectPhotoUpload} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">조치 담당자</label>
                      <input
                        type="text"
                        placeholder="예: 목공팀 최진태 반장"
                        value={newDefectAssignee}
                        onChange={e => setNewDefectAssignee(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">조치 예정일</label>
                      <input
                        type="date"
                        value={newDefectTargetDate}
                        onChange={e => setNewDefectTargetDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono border border-neutral-300 rounded-lg focus:outline-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">예정 시간대</label>
                    <input
                      type="text"
                      placeholder="예: 오전 09:00~11:00, 오후 14:00~16:00, 종일"
                      list="defect-time-slots"
                      value={newDefectTargetTimeSlot}
                      onChange={e => setNewDefectTargetTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-red-500"
                    />
                    <datalist id="defect-time-slots">
                      <option value="오전 (09:00 ~ 12:00)" />
                      <option value="오후 (13:00 ~ 15:00)" />
                      <option value="오후 (15:00 ~ 18:00)" />
                      <option value="종일 (현장 방문 조치)" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 mb-1">조치 계획 및 메모</label>
                    <textarea
                      rows={2}
                      placeholder="예: 유압 댐퍼 부품 교체 후 레일 밸런스 점검 예정"
                      value={newDefectAction}
                      onChange={e => setNewDefectAction(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => setShowAddDefectModal(false)}
                      className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      A/S 항목 등록
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Photo Lightbox Modal */}
            {expandedPhotoUrl && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
                onClick={() => setExpandedPhotoUrl(null)}
              >
                <div className="relative max-w-4xl max-h-[90vh] bg-black rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                  <img src={expandedPhotoUrl} alt="확대 사진" className="max-w-full max-h-[85vh] object-contain mx-auto" />
                  <button
                    type="button"
                    onClick={() => setExpandedPhotoUrl(null)}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
