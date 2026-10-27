import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calculator, 
  ClipboardList, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Building2, 
  MapPin, 
  Calendar, 
  Camera, 
  FileText, 
  Check, 
  X,
  User,
  ShoppingBag,
  ExternalLink,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { 
  InteriorProject, 
  QuickEstimateRequest, 
  StrategicTask, 
  DailyStaffTask, 
  OfficeSupplyItem,
  DetailedFinalQuote
} from '../types/project';
import { 
  loadQuickEstimates, 
  saveQuickEstimates, 
  loadStrategicTasks, 
  saveStrategicTasks, 
  loadDailyStaffTasks, 
  saveDailyStaffTasks, 
  loadOfficeSupplies, 
  saveOfficeSupplies 
} from '../utils/leftBannerStorage';
import { DetailedFinalQuoteView } from './DetailedFinalQuoteView';
import { 
  createDefaultDetailedFinalQuote, 
  calcDetailedFinalQuoteTotals 
} from '../utils/quoteCalculator';

interface LeftSidebarBannerProps {
  projects: InteriorProject[];
  onNavigateToProjectAS: (project: InteriorProject) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type BannerTab = 'as_list' | 'quick_estimate' | 'basic_tasks';

export const LeftSidebarBanner: React.FC<LeftSidebarBannerProps> = ({
  projects,
  onNavigateToProjectAS,
  isOpen,
  onToggle
}) => {
  const [activeTab, setActiveTab] = useState<BannerTab>('as_list');

  // 1. A/S projects with unresolved defects ('접수' or '처리중'), sorted by startDate ascending
  const unresolvedASProjects = projects
    .filter(p => p.defectAndAS && p.defectAndAS.some(d => d.status === '접수' || d.status === '처리중'))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const totalUnresolvedDefects = unresolvedASProjects.reduce((sum, p) => {
    const count = p.defectAndAS.filter(d => d.status === '접수' || d.status === '처리중').length;
    return sum + count;
  }, 0);

  // 2. Quick Estimates State
  const [quickEstimates, setQuickEstimates] = useState<QuickEstimateRequest[]>(() => loadQuickEstimates());
  const [showAddEstimateModal, setShowAddEstimateModal] = useState<boolean>(false);
  const [selectedEstimateForView, setSelectedEstimateForView] = useState<QuickEstimateRequest | null>(null);
  const [showEstimateCalcModal, setShowEstimateCalcModal] = useState<boolean>(false);
  const [currentEstimateQuote, setCurrentEstimateQuote] = useState<DetailedFinalQuote | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerBannerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Form fields for new quick estimate
  const [estCompany, setEstCompany] = useState<string>('');
  const [estContact, setEstContact] = useState<string>('');
  const [estAddress, setEstAddress] = useState<string>('');
  const [estDimensions, setEstDimensions] = useState<string>('');
  const [estScopeNotes, setEstScopeNotes] = useState<string>('');
  const [estProposalAmount, setEstProposalAmount] = useState<string>('');
  const [estPhotos, setEstPhotos] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // 3. Basic Tasks State
  const [strategicTasks, setStrategicTasks] = useState<StrategicTask[]>(() => loadStrategicTasks());
  const [dailyStaffTasks, setDailyStaffTasks] = useState<DailyStaffTask[]>(() => loadDailyStaffTasks());
  const [officeSupplies, setOfficeSupplies] = useState<OfficeSupplyItem[]>(() => loadOfficeSupplies());
  const [taskSubTab, setTaskSubTab] = useState<'strategic' | 'daily' | 'supplies'>('strategic');

  // Form for Strategic task
  const [stratHorizon, setStratHorizon] = useState<'단기' | '중기' | '장기'>('단기');
  const [stratTitle, setStratTitle] = useState<string>('');
  const [stratDate, setStratDate] = useState<string>('');
  const [stratAssignee, setStratAssignee] = useState<string>('');

  // Form for Daily staff task
  const [dailyStaff, setDailyStaff] = useState<string>('최진태 반장');
  const [dailyTitle, setDailyTitle] = useState<string>('');
  const [dailyTime, setDailyTime] = useState<string>('오전');

  // Form for Office supply
  const [supplyName, setSupplyName] = useState<string>('');
  const [supplyQty, setSupplyQty] = useState<string>('');
  const [supplyUrgency, setSupplyUrgency] = useState<'보통' | '긴급'>('보통');
  const [supplyRequester, setSupplyRequester] = useState<string>('현장팀');

  // Quick Estimate photo upload handler
  const handleEstimatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          setEstPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estCompany.trim() || !estAddress.trim()) return;

    const newEst: QuickEstimateRequest = {
      id: `qe-${Date.now()}`,
      clientCompany: estCompany.trim(),
      contactName: estContact.trim() || '담당자 미정',
      address: estAddress.trim(),
      dimensions: estDimensions.trim() || '치수 미입력',
      scopeNotes: estScopeNotes.trim() || '가견적 산출 요청',
      proposalAmount: estProposalAmount.trim() || '산출 예정',
      photos: estPhotos,
      status: '접수대기',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newEst, ...quickEstimates];
    setQuickEstimates(updated);
    saveQuickEstimates(updated);

    // Reset form
    setEstCompany('');
    setEstContact('');
    setEstAddress('');
    setEstDimensions('');
    setEstScopeNotes('');
    setEstProposalAmount('');
    setEstPhotos([]);
    setShowAddEstimateModal(false);
  };

  const handleDeleteQuickEstimate = (id: string) => {
    const updated = quickEstimates.filter(item => item.id !== id);
    setQuickEstimates(updated);
    saveQuickEstimates(updated);
    if (selectedEstimateForView?.id === id) {
      setSelectedEstimateForView(null);
    }
  };

  const handleUpdateEstimateStatus = (id: string, newStatus: '접수대기' | '산출중' | '발송완료') => {
    const updated = quickEstimates.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setQuickEstimates(updated);
    saveQuickEstimates(updated);
    if (selectedEstimateForView?.id === id) {
      setSelectedEstimateForView(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // 가견적 계산 창 열기 (본견적 계산기와 동일한 양식)
  const handleOpenEstimateCalculator = (estimate: QuickEstimateRequest) => {
    setSelectedEstimateForView(estimate);
    setCurrentEstimateQuote(estimate.calculatedQuote || createDefaultDetailedFinalQuote());
    setShowEstimateCalcModal(true);
  };

  const handleUpdateEstimateQuote = (updated: DetailedFinalQuote) => {
    setCurrentEstimateQuote(updated);
  };

  const handleSaveEstimateQuote = () => {
    if (!selectedEstimateForView || !currentEstimateQuote) return;
    const totals = calcDetailedFinalQuoteTotals(currentEstimateQuote);
    const formattedProposal = `₩${totals.grandTotal.toLocaleString()}`;

    const updatedEstimate: QuickEstimateRequest = {
      ...selectedEstimateForView,
      calculatedQuote: currentEstimateQuote,
      proposalAmount: formattedProposal,
      status: selectedEstimateForView.status === '접수대기' ? '산출중' : selectedEstimateForView.status
    };

    const nextList = quickEstimates.map(item => item.id === updatedEstimate.id ? updatedEstimate : item);
    setQuickEstimates(nextList);
    saveQuickEstimates(nextList);
    setSelectedEstimateForView(updatedEstimate);
    triggerBannerToast(`가견적 계산 금액(${formattedProposal})이 적용 및 저장되었습니다.`);
    setShowEstimateCalcModal(false);
  };

  // Strategic Task handlers
  const handleAddStrategicTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stratTitle.trim()) return;
    const newTask: StrategicTask = {
      id: `st-${Date.now()}`,
      horizon: stratHorizon,
      title: stratTitle.trim(),
      targetDate: stratDate || new Date().toISOString().split('T')[0],
      assignee: stratAssignee.trim() || '전체',
      isCompleted: false
    };
    const updated = [newTask, ...strategicTasks];
    setStrategicTasks(updated);
    saveStrategicTasks(updated);
    setStratTitle('');
  };

  const handleToggleStrategicTask = (id: string) => {
    const updated = strategicTasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    setStrategicTasks(updated);
    saveStrategicTasks(updated);
  };

  const handleDeleteStrategicTask = (id: string) => {
    const updated = strategicTasks.filter(t => t.id !== id);
    setStrategicTasks(updated);
    saveStrategicTasks(updated);
  };

  // Daily Staff Task handlers
  const handleAddDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyTitle.trim()) return;
    const newTask: DailyStaffTask = {
      id: `dt-${Date.now()}`,
      staffName: dailyStaff,
      date: new Date().toISOString().split('T')[0],
      taskTitle: dailyTitle.trim(),
      isDone: false,
      timeSlot: dailyTime
    };
    const updated = [newTask, ...dailyStaffTasks];
    setDailyStaffTasks(updated);
    saveDailyStaffTasks(updated);
    setDailyTitle('');
  };

  const handleToggleDailyTask = (id: string) => {
    const updated = dailyStaffTasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t);
    setDailyStaffTasks(updated);
    saveDailyStaffTasks(updated);
  };

  const handleDeleteDailyTask = (id: string) => {
    const updated = dailyStaffTasks.filter(t => t.id !== id);
    setDailyStaffTasks(updated);
    saveDailyStaffTasks(updated);
  };

  // Office Supply handlers
  const handleAddSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyName.trim()) return;
    const newSupply: OfficeSupplyItem = {
      id: `sup-${Date.now()}`,
      itemName: supplyName.trim(),
      quantity: supplyQty.trim() || '1개',
      urgency: supplyUrgency,
      isPurchased: false,
      requester: supplyRequester.trim()
    };
    const updated = [newSupply, ...officeSupplies];
    setOfficeSupplies(updated);
    saveOfficeSupplies(updated);
    setSupplyName('');
    setSupplyQty('');
  };

  const handleToggleSupply = (id: string) => {
    const updated = officeSupplies.map(s => s.id === id ? { ...s, isPurchased: !s.isPurchased } : s);
    setOfficeSupplies(updated);
    saveOfficeSupplies(updated);
  };

  const handleDeleteSupply = (id: string) => {
    const updated = officeSupplies.filter(s => s.id !== id);
    setOfficeSupplies(updated);
    saveOfficeSupplies(updated);
  };

  if (!isOpen) {
    return (
      <aside className="hidden lg:flex flex-col items-center py-4 bg-white border-r border-neutral-200 w-12 shrink-0 select-none shadow-xs z-20">
        <button
          type="button"
          onClick={onToggle}
          className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="왼쪽 운영 배너 펼치기"
        >
          <ChevronRight className="w-5 h-5 text-neutral-700" />
        </button>

        <div className="mt-6 flex flex-col gap-6 items-center">
          <button
            type="button"
            onClick={() => { onToggle(); setActiveTab('as_list'); }}
            className="relative p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors group"
            title="A/S 및 미마감 목록"
          >
            <AlertTriangle className="w-5 h-5" />
            {totalUnresolvedDefects > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalUnresolvedDefects}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { onToggle(); setActiveTab('quick_estimate'); }}
            className="relative p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="가견적 계산 및 자료 입력"
          >
            <Calculator className="w-5 h-5" />
            {quickEstimates.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {quickEstimates.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { onToggle(); setActiveTab('basic_tasks'); }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="기본 업무 및 비품"
          >
            <ClipboardList className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-auto writing-vertical-lr text-[11px] font-bold text-neutral-400 tracking-widest uppercase">
          현장 지원 배너
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 md:w-88 lg:w-96 bg-white border-r border-neutral-200 flex flex-col shrink-0 shadow-sm z-20 h-auto overflow-hidden">
      {/* Banner Header */}
      <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-xs font-bold tracking-wide uppercase">현장 지원 & 운영 배너</h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          title="배너 접기"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Top 3 Section Tabs */}
      <div className="grid grid-cols-3 bg-neutral-100 p-1 border-b border-neutral-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('as_list')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md font-semibold transition-all relative ${
            activeTab === 'as_list'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px]">A/S·미마감</span>
          </div>
          {totalUnresolvedDefects > 0 && (
            <span className="mt-0.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-bold">
              {totalUnresolvedDefects}건
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quick_estimate')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md font-semibold transition-all ${
            activeTab === 'quick_estimate'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5" />
            <span className="text-[11px]">가견적 계산</span>
          </div>
          <span className="mt-0.5 text-[9px] text-neutral-400">자료·치수</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('basic_tasks')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md font-semibold transition-all ${
            activeTab === 'basic_tasks'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <div className="flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="text-[11px]">기본 업무</span>
          </div>
          <span className="mt-0.5 text-[9px] text-neutral-400">계획·비품</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* ================= 1. A/S 및 미마감 목록 ================= */}
        {activeTab === 'as_list' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                A/S 접수 및 조치중 현장
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">시공일자 빠른순 정렬</span>
            </div>

            {unresolvedASProjects.length === 0 ? (
              <div className="p-6 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-neutral-700">미해결 A/S 현장 없음</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">모든 하자와 미마감이 원활히 조치 완료되었습니다.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {unresolvedASProjects.map(proj => {
                  const openDefects = proj.defectAndAS.filter(d => d.status === '접수' || d.status === '처리중');
                  return (
                    <div
                      key={proj.id}
                      onClick={() => onNavigateToProjectAS(proj)}
                      className="group p-3 bg-amber-50/40 hover:bg-amber-50 rounded-xl border border-amber-200/80 hover:border-amber-400 cursor-pointer transition-all shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded">
                              시공 {proj.startDate}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium">
                              {proj.clientCompany}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-amber-800 flex items-center gap-1">
                            {proj.name}
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
                          </h4>
                        </div>

                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                          미조치 {openDefects.length}건
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-neutral-600 space-y-1">
                        {openDefects.slice(0, 2).map((def, idx) => (
                          <div key={def.id || idx} className="flex items-center justify-between text-[11px]">
                            <span className="truncate pr-2 text-neutral-700 font-medium">
                              • {def.title}
                            </span>
                            <span className={`text-[10px] shrink-0 font-semibold px-1 rounded ${
                              def.status === '처리중' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {def.status}
                            </span>
                          </div>
                        ))}
                        {openDefects.length > 2 && (
                          <p className="text-[10px] text-amber-700 font-medium text-right">
                            외 {openDefects.length - 2}건 더보기 →
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= 2. 가견적 계산 및 자료 입력 ================= */}
        {activeTab === 'quick_estimate' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-purple-600" />
                업체별 가견적 요청 및 자료
              </span>
              <button
                type="button"
                onClick={() => setShowAddEstimateModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>새 가견적 접수</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {quickEstimates.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-white hover:bg-purple-50/30 rounded-xl border border-neutral-200 hover:border-purple-300 transition-all shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                        <span>{item.createdAt}</span>
                        <span>·</span>
                        <span className="text-purple-700 font-medium">{item.clientCompany}</span>
                      </div>
                      <h4 className="text-xs font-bold text-neutral-900 mt-0.5">
                        {item.address}
                      </h4>
                    </div>

                    <select
                      value={item.status}
                      onChange={e => handleUpdateEstimateStatus(item.id, e.target.value as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                        item.status === '발송완료'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : item.status === '산출중'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="접수대기">접수대기</option>
                      <option value="산출중">산출중</option>
                      <option value="발송완료">발송완료</option>
                    </select>
                  </div>

                  {/* Dimensions & Proposed Amount */}
                  <div className="bg-neutral-50 p-2 rounded-lg text-[11px] space-y-1 border border-neutral-100">
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="text-neutral-500">실측 치수:</span>
                      <span className="font-medium text-neutral-900 truncate max-w-[160px] text-right">{item.dimensions}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-700">
                      <span className="text-neutral-500">가견적 제안가:</span>
                      <span className="font-bold text-purple-700">{item.proposalAmount}</span>
                    </div>
                  </div>

                  {/* Photos thumbnail preview if available */}
                  {item.photos && item.photos.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {item.photos.map((pUrl, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setLightboxPhoto(pUrl)}
                          className="relative w-12 h-10 rounded border border-neutral-200 overflow-hidden shrink-0 cursor-pointer hover:opacity-80"
                        >
                          <img src={pUrl} alt="현장 사진" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <span className="text-[10px] text-neutral-400">
                        {item.photos.length}장
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[10px] text-neutral-500">
                    <span>{item.contactName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedEstimateForView(item)}
                        className="px-2 py-0.5 text-purple-600 hover:bg-purple-100 rounded font-medium"
                      >
                        상세보기
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuickEstimate(item.id)}
                        className="text-neutral-400 hover:text-red-600 p-0.5 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {quickEstimates.length === 0 && (
                <div className="p-6 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  <Calculator className="w-8 h-8 text-neutral-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-neutral-700">등록된 가견적 요청 없음</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">업체로부터 들어온 가견적 자료를 등록하세요.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. 기본 업무 및 비품 ================= */}
        {activeTab === 'basic_tasks' && (
          <div className="space-y-3">
            {/* Sub-tab selection */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setTaskSubTab('strategic')}
                className={`flex-1 py-1 text-center rounded transition-all ${
                  taskSubTab === 'strategic' ? 'bg-white text-blue-700 shadow-xs' : 'text-neutral-600'
                }`}
              >
                단·중·장기 계획
              </button>
              <button
                type="button"
                onClick={() => setTaskSubTab('daily')}
                className={`flex-1 py-1 text-center rounded transition-all ${
                  taskSubTab === 'daily' ? 'bg-white text-blue-700 shadow-xs' : 'text-neutral-600'
                }`}
              >
                오늘 업무
              </button>
              <button
                type="button"
                onClick={() => setTaskSubTab('supplies')}
                className={`flex-1 py-1 text-center rounded transition-all ${
                  taskSubTab === 'supplies' ? 'bg-white text-blue-700 shadow-xs' : 'text-neutral-600'
                }`}
              >
                사무실 비품
              </button>
            </div>

            {/* Sub 1: 단기-중기-장기 업무 계획 */}
            {taskSubTab === 'strategic' && (
              <div className="space-y-3">
                <form onSubmit={handleAddStrategicTask} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={stratHorizon}
                      onChange={e => setStratHorizon(e.target.value as any)}
                      className="text-[11px] px-2 py-1 border border-neutral-300 rounded font-semibold bg-white"
                    >
                      <option value="단기">단기(1~2주)</option>
                      <option value="중기">중기(분기)</option>
                      <option value="장기">장기(연간)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="계획 내용 입력"
                      value={stratTitle}
                      onChange={e => setStratTitle(e.target.value)}
                      className="flex-1 text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={stratDate}
                      onChange={e => setStratDate(e.target.value)}
                      className="text-[10px] px-2 py-1 border border-neutral-300 rounded font-mono bg-white flex-1"
                    />
                    <input
                      type="text"
                      placeholder="담당자"
                      value={stratAssignee}
                      onChange={e => setStratAssignee(e.target.value)}
                      className="text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white w-20"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shrink-0"
                    >
                      추가
                    </button>
                  </div>
                </form>

                <div className="space-y-1.5">
                  {strategicTasks.map(t => (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 transition-all ${
                        t.isCompleted ? 'bg-neutral-50 border-neutral-200 opacity-60' : 'bg-white border-neutral-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStrategicTask(t.id)}
                          className="mt-0.5 text-neutral-400 hover:text-blue-600"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${t.isCompleted ? 'text-emerald-500 fill-emerald-100' : 'text-neutral-300'}`} />
                        </button>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className={`px-1 rounded font-bold ${
                              t.horizon === '단기' ? 'bg-emerald-100 text-emerald-800' :
                              t.horizon === '중기' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {t.horizon}
                            </span>
                            <span className="text-neutral-400 font-mono">{t.targetDate}</span>
                            <span className="text-neutral-500">({t.assignee})</span>
                          </div>
                          <p className={`font-medium ${t.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                            {t.title}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteStrategicTask(t.id)}
                        className="text-neutral-300 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub 2: 담당자 별 오늘 업무 계획 */}
            {taskSubTab === 'daily' && (
              <div className="space-y-3">
                <form onSubmit={handleAddDailyTask} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="담당자 (예: 최진태 반장)"
                      value={dailyStaff}
                      onChange={e => setDailyStaff(e.target.value)}
                      className="w-28 text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    />
                    <select
                      value={dailyTime}
                      onChange={e => setDailyTime(e.target.value)}
                      className="text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    >
                      <option value="오전">오전</option>
                      <option value="오후">오후</option>
                      <option value="종일">종일</option>
                      <option value="야간">야간</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="오늘 업무 내용 입력"
                      value={dailyTitle}
                      onChange={e => setDailyTitle(e.target.value)}
                      className="flex-1 text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shrink-0"
                    >
                      추가
                    </button>
                  </div>
                </form>

                <div className="space-y-1.5">
                  {dailyStaffTasks.map(d => (
                    <div
                      key={d.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-2 transition-all ${
                        d.isDone ? 'bg-neutral-50 border-neutral-200 opacity-60' : 'bg-white border-neutral-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDailyTask(d.id)}
                          className="mt-0.5 text-neutral-400 hover:text-blue-600"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${d.isDone ? 'text-emerald-500 fill-emerald-100' : 'text-neutral-300'}`} />
                        </button>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="font-bold text-neutral-800">{d.staffName}</span>
                            <span className="px-1 bg-neutral-100 text-neutral-600 rounded">{d.timeSlot}</span>
                          </div>
                          <p className={`font-medium ${d.isDone ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                            {d.taskTitle}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteDailyTask(d.id)}
                        className="text-neutral-300 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub 3: 사무실에 필요한 비품 목록 */}
            {taskSubTab === 'supplies' && (
              <div className="space-y-3">
                <form onSubmit={handleAddSupply} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="필요 비품명"
                      value={supplyName}
                      onChange={e => setSupplyName(e.target.value)}
                      className="flex-1 text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    />
                    <input
                      type="text"
                      placeholder="수량"
                      value={supplyQty}
                      onChange={e => setSupplyQty(e.target.value)}
                      className="w-16 text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={supplyUrgency}
                      onChange={e => setSupplyUrgency(e.target.value as any)}
                      className="text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    >
                      <option value="보통">보통</option>
                      <option value="긴급">긴급</option>
                    </select>
                    <input
                      type="text"
                      placeholder="요청팀 (예: 보양팀)"
                      value={supplyRequester}
                      onChange={e => setSupplyRequester(e.target.value)}
                      className="flex-1 text-[11px] px-2 py-1 border border-neutral-300 rounded bg-white"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shrink-0"
                    >
                      추가
                    </button>
                  </div>
                </form>

                <div className="space-y-1.5">
                  {officeSupplies.map(s => (
                    <div
                      key={s.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                        s.isPurchased ? 'bg-neutral-50 border-neutral-200 opacity-60' : 'bg-white border-neutral-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={s.isPurchased}
                          onChange={() => handleToggleSupply(s.id)}
                          className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              s.urgency === '긴급' ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {s.urgency}
                            </span>
                            <span className={`font-semibold ${s.isPurchased ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                              {s.itemName}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono">({s.quantity})</span>
                          </div>
                          {s.requester && (
                            <p className="text-[10px] text-neutral-400">요청: {s.requester}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSupply(s.id)}
                        className="text-neutral-300 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: New Quick Estimate Registration */}
      {showAddEstimateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddQuickEstimate}
            className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900">새 가견적 요청 및 현장자료 등록</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddEstimateModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">업체명 / 의뢰처 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 디자인봄 인테리어, 한샘대리점"
                  value={estCompany}
                  onChange={e => setEstCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">담당자 및 연락처</label>
                <input
                  type="text"
                  placeholder="예: 김실장 / 010-1234-5678"
                  value={estContact}
                  onChange={e => setEstContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">현장 주소 / 위치 / 평형 *</label>
              <input
                type="text"
                required
                placeholder="예: 서초구 반포자이 42평형 주방 전체 리모델링"
                value={estAddress}
                onChange={e => setEstAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">실측 치수 및 구조 정보</label>
              <textarea
                rows={2}
                placeholder="예: 싱크대 길이 4,200mm, 키큰장 1,800mm, 아일랜드 2,400 x 1,000mm, 천장고 2,420mm"
                value={estDimensions}
                onChange={e => setEstDimensions(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-purple-500"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">현장 사진 및 도면 자료 첨부 (여러 장 가능)</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-purple-400 rounded-lg p-3 cursor-pointer bg-neutral-50 hover:bg-purple-50/20 transition-colors">
                <Camera className="w-5 h-5 text-neutral-400 mb-1" />
                <span className="text-xs font-medium text-neutral-600">사진 파일 선택 (여러 장 동시 첨부 가능)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEstimatePhotoUpload}
                  className="hidden"
                />
              </label>

              {estPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {estPhotos.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-video">
                      <img src={url} alt={`첨부 ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEstPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">가견적 산출/예상 금액</label>
                <input
                  type="text"
                  placeholder="예: 약 3,500만 ~ 4,000만원"
                  value={estProposalAmount}
                  onChange={e => setEstProposalAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-purple-700 border border-neutral-300 rounded-lg focus:outline-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">요청 및 특이사항</label>
                <input
                  type="text"
                  placeholder="예: 세라믹 상판 및 블룸 레일 적용 필수"
                  value={estScopeNotes}
                  onChange={e => setEstScopeNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowAddEstimateModal(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
              >
                가견적 등록 완료
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View Single Quick Estimate Detail */}
      {selectedEstimateForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-purple-700">{selectedEstimateForView.clientCompany}</span>
                <h3 className="text-base font-bold text-neutral-900">{selectedEstimateForView.address}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEstimateCalculator(selectedEstimateForView)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>가견적 계산</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEstimateForView(null)}
                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block">담당자 / 연락처</span>
                  <span className="font-semibold text-neutral-900">{selectedEstimateForView.contactName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">접수일자</span>
                  <span className="font-mono text-neutral-800">{selectedEstimateForView.createdAt}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">가견적 제안 금액</span>
                  <span className="font-bold text-purple-700 text-sm">{selectedEstimateForView.proposalAmount}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">진행 상태</span>
                  <span className="font-bold text-neutral-800">{selectedEstimateForView.status}</span>
                </div>
              </div>

              {/* Calculated Quote Status Notice if available */}
              {selectedEstimateForView.calculatedQuote && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span>본견적 계산서로 산출 완료됨</span>
                    </div>
                    <p className="text-[11px] text-purple-700">
                      산출 총액: {selectedEstimateForView.proposalAmount}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEstimateCalculator(selectedEstimateForView)}
                    className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-white hover:bg-purple-100 border border-purple-300 rounded-md transition-colors"
                  >
                    계산서 열기
                  </button>
                </div>
              )}

              <div>
                <span className="font-bold text-neutral-800 block mb-1">실측 치수 및 구조 정보</span>
                <div className="p-3 bg-neutral-50 rounded-lg text-neutral-700 leading-relaxed border border-neutral-200 whitespace-pre-wrap">
                  {selectedEstimateForView.dimensions}
                </div>
              </div>

              <div>
                <span className="font-bold text-neutral-800 block mb-1">요청 범위 및 특이사항</span>
                <div className="p-3 bg-neutral-50 rounded-lg text-neutral-700 leading-relaxed border border-neutral-200 whitespace-pre-wrap">
                  {selectedEstimateForView.scopeNotes}
                </div>
              </div>

              {selectedEstimateForView.photos && selectedEstimateForView.photos.length > 0 && (
                <div>
                  <span className="font-bold text-neutral-800 block mb-1">현장 첨부 사진 ({selectedEstimateForView.photos.length}장)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEstimateForView.photos.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxPhoto(p)}
                        className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-video cursor-pointer"
                      >
                        <img src={p} alt="현장 사진" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => handleOpenEstimateCalculator(selectedEstimateForView)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
              >
                <Calculator className="w-4 h-4" />
                <span>가견적 계산 실행</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEstimateForView(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Detailed Quote Calculator for Quick Estimate */}
      {showEstimateCalcModal && selectedEstimateForView && currentEstimateQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-xl">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40">
                      가견적 계산기
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      {selectedEstimateForView.clientCompany}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedEstimateForView.address} — 본견적 동일 계산서
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEstimateQuote}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>가견적 금액 적용 및 저장</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEstimateCalcModal(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Reference Bar */}
            <div className="px-5 py-2 bg-neutral-100 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-700 overflow-hidden">
                <span className="font-bold text-purple-900 shrink-0">실측 치수:</span>
                <span className="font-medium text-neutral-800 truncate">
                  {selectedEstimateForView.dimensions}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-neutral-500 text-[11px]">실시간 계산 총액:</span>
                <span className="font-black font-mono text-purple-800 text-sm">
                  ₩{calcDetailedFinalQuoteTotals(currentEstimateQuote).grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Embedded Detailed Quote View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-neutral-50/60">
              <DetailedFinalQuoteView
                quote={currentEstimateQuote}
                projectName={selectedEstimateForView.address}
                clientCompany={selectedEstimateForView.clientCompany}
                onUpdateQuote={handleUpdateEstimateQuote}
                triggerToast={triggerBannerToast}
              />
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="px-5 py-3 bg-white border-t border-neutral-200 flex items-center justify-between shrink-0 text-xs">
              <span className="text-neutral-500 text-[11px]">
                * 공간별 가구, 상판, 기기류, 기타 자재 및 부대비용을 계산하여 '가견적 금액 적용 및 저장'을 누르면 가견적 목록에 제안가로 반영됩니다.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEstimateCalcModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleSaveEstimateQuote}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>가견적 금액 적용 및 저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-60 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Lightbox for full size photo */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-black rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={lightboxPhoto} alt="확대 사진" className="max-w-full max-h-[85vh] object-contain mx-auto" />
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
