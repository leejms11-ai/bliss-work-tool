import React, { useState } from 'react';
import { 
  DetailedFinalQuote, 
  CabinetItem, 
  CountertopQuoteItem, 
  KitchenApplianceQuoteItem, 
  OtherHardwareQuoteItem, 
  JendaiQuoteItem, 
  LogisticsQuoteItem,
  SpaceCabinetGroup 
} from '../types/project';
import { 
  calcCabinetItem, 
  calcCountertopItem, 
  calcKitchenApplianceItem, 
  calcOtherHardwareItem, 
  calcJendaiItem, 
  calcDetailedFinalQuoteTotals, 
  COUNTERTOP_MATERIAL_PRICES, 
  getDepthRate,
  createDefaultDetailedFinalQuote 
} from '../utils/quoteCalculator';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Printer, 
  Layers, 
  DollarSign, 
  Package, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Info,
  Ruler,
  Maximize2
} from 'lucide-react';

interface DetailedFinalQuoteViewProps {
  quote: DetailedFinalQuote;
  projectName: string;
  clientCompany: string;
  onUpdateQuote: (updated: DetailedFinalQuote) => void;
  triggerToast?: (msg: string) => void;
}

export const DetailedFinalQuoteView: React.FC<DetailedFinalQuoteViewProps> = ({
  quote,
  projectName,
  clientCompany,
  onUpdateQuote,
  triggerToast
}) => {
  // Active major section tabs
  const [activeSection, setActiveSection] = useState<'all' | 'cabinet' | 'countertop' | 'appliance' | 'hardware' | 'misc'>('all');

  // Space cabinet groups expansion state
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    (quote.spaceCabinetGroups || []).forEach(g => {
      init[g.id] = true;
    });
    return init;
  });

  // Calculate totals
  const totals = calcDetailedFinalQuoteTotals(quote);

  const toggleSpaceExpand = (spaceId: string) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  /* ================= 1. 가구/장 견적 조작 ================= */
  const handleAddSpace = () => {
    // + 새 공간 추가 시 기타(공간)으로 자동 추가 (인라인 명칭 변경 가능)
    const existingEtcCount = (quote.spaceCabinetGroups || []).filter(g => g.spaceName.startsWith('기타(공간')).length;
    const spaceName = existingEtcCount === 0 ? '기타(공간)' : `기타(공간 ${existingEtcCount + 1})`;

    const newGroup: SpaceCabinetGroup = {
      id: `sp-${Date.now()}`,
      spaceName,
      items: []
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      spaceCabinetGroups: [...(quote.spaceCabinetGroups || []), newGroup]
    };
    onUpdateQuote(updated);
    setExpandedSpaces(prev => ({ ...prev, [newGroup.id]: true }));
    triggerToast?.(`'${spaceName}' 공간이 추가되었습니다.`);
  };

  const handleUpdateSpaceName = (spaceId: string, newName: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      spaceCabinetGroups: quote.spaceCabinetGroups.map(g => g.id === spaceId ? { ...g, spaceName: newName } : g)
    };
    onUpdateQuote(updated);
  };

  const handleDeleteSpace = (spaceId: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      spaceCabinetGroups: quote.spaceCabinetGroups.filter(g => g.id !== spaceId)
    };
    onUpdateQuote(updated);
    triggerToast?.('공간이 삭제되었습니다.');
  };

  const handleAddCabinetItem = (spaceId: string) => {
    const newItem: CabinetItem = {
      id: `cab-${Date.now()}`,
      cabinetType: '하부장',
      material: 'PET 무광',
      unitType: 'meter',
      unitPrice: 400000,
      dimensionMm: 2400,
      epSmallCount: 0,
      epMediumCount: 0,
      epLargeCount: 0,
      lightingLengthM: 0,
      lightingSmpsCount: 0,
      openCabinetBoardCount: 0,
      mirrorDoorCount: 0,
      handleUnitPrice: 0,
      handleCount: 0,
      innerDrawerCount: 0,
      etcCost: 0,
      etcCostNote: '',
      remarks: ''
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      spaceCabinetGroups: quote.spaceCabinetGroups.map(g => 
        g.id === spaceId ? { ...g, items: [...g.items, newItem] } : g
      )
    };
    onUpdateQuote(updated);
  };

  const handleUpdateCabinetItem = (spaceId: string, itemId: string, patch: Partial<CabinetItem>) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      spaceCabinetGroups: quote.spaceCabinetGroups.map(g => {
        if (g.id !== spaceId) return g;
        return {
          ...g,
          items: g.items.map(item => item.id === itemId ? { ...item, ...patch } : item)
        };
      })
    };
    onUpdateQuote(updated);
  };

  const handleDeleteCabinetItem = (spaceId: string, itemId: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      spaceCabinetGroups: quote.spaceCabinetGroups.map(g => {
        if (g.id !== spaceId) return g;
        return {
          ...g,
          items: g.items.filter(item => item.id !== itemId)
        };
      })
    };
    onUpdateQuote(updated);
    triggerToast?.('가구장 항목이 삭제되었습니다.');
  };

  /* ================= 2. 상판 견적 조작 ================= */
  const handleAddCountertop = () => {
    const newItem: CountertopQuoteItem = {
      id: `ct-${Date.now()}`,
      location: '싱크대',
      material: '인조대리석(오로라)',
      wideMm: 3000,
      depthMm: 650,
      thicknessMm: 12,
      unitPricePerMeter: 190000,
      notes: ''
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      countertops: [...(quote.countertops || []), newItem]
    };
    onUpdateQuote(updated);
  };

  const handleUpdateCountertop = (id: string, patch: Partial<CountertopQuoteItem>) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      countertops: quote.countertops.map(ct => {
        if (ct.id !== id) return ct;
        const next = { ...ct, ...patch };
        // If material changed, set default preset price if not manually customized
        if (patch.material && COUNTERTOP_MATERIAL_PRICES[patch.material]) {
          next.unitPricePerMeter = COUNTERTOP_MATERIAL_PRICES[patch.material];
        }
        return next;
      })
    };
    onUpdateQuote(updated);
  };

  const handleDeleteCountertop = (id: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      countertops: quote.countertops.filter(ct => ct.id !== id)
    };
    onUpdateQuote(updated);
    triggerToast?.('상판 항목이 삭제되었습니다.');
  };

  /* ================= 3. 주방 기기류 조작 ================= */
  const handleAddKitchenAppliance = () => {
    const newItem: KitchenApplianceQuoteItem = {
      id: `app-${Date.now()}`,
      category: '후드',
      modelName: '',
      manufacturer: '',
      price: 0,
      quantity: 1,
      installFee: 0,
      remarks: ''
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      kitchenAppliances: [...(quote.kitchenAppliances || []), newItem]
    };
    onUpdateQuote(updated);
  };

  const handleUpdateKitchenAppliance = (id: string, patch: Partial<KitchenApplianceQuoteItem>) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      kitchenAppliances: quote.kitchenAppliances.map(app => app.id === id ? { ...app, ...patch } : app)
    };
    onUpdateQuote(updated);
  };

  const handleDeleteKitchenAppliance = (id: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      kitchenAppliances: quote.kitchenAppliances.filter(app => app.id !== id)
    };
    onUpdateQuote(updated);
    triggerToast?.('주방 기기 항목이 삭제되었습니다.');
  };

  /* ================= 4. 기타 기기류 조작 ================= */
  const handleAddOtherHardware = () => {
    const newItem: OtherHardwareQuoteItem = {
      id: `oth-${Date.now()}`,
      itemName: '매립콘센트',
      spec: '',
      price: 0,
      quantity: 1,
      installFee: 0,
      remarks: ''
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      otherHardware: [...(quote.otherHardware || []), newItem]
    };
    onUpdateQuote(updated);
  };

  const handleUpdateOtherHardware = (id: string, patch: Partial<OtherHardwareQuoteItem>) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      otherHardware: quote.otherHardware.map(oth => oth.id === id ? { ...oth, ...patch } : oth)
    };
    onUpdateQuote(updated);
  };

  const handleDeleteOtherHardware = (id: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      otherHardware: quote.otherHardware.filter(oth => oth.id !== id)
    };
    onUpdateQuote(updated);
  };

  /* ================= 5. 기타 항목 (젠다이 & 권역비/사다리차) ================= */
  const handleAddJendai = () => {
    const newItem: JendaiQuoteItem = {
      id: `jd-${Date.now()}`,
      location: '공용욕실',
      wideMm: 2000,
      depthMm: 120,
      thicknessMm: 20,
      unitPricePerMeter: 25000,
      remarks: ''
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      jendaiItems: [...(quote.jendaiItems || []), newItem]
    };
    onUpdateQuote(updated);
  };

  const handleUpdateJendai = (id: string, patch: Partial<JendaiQuoteItem>) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      jendaiItems: quote.jendaiItems.map(jd => jd.id === id ? { ...jd, ...patch } : jd)
    };
    onUpdateQuote(updated);
  };

  const handleDeleteJendai = (id: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      jendaiItems: quote.jendaiItems.filter(jd => jd.id !== id)
    };
    onUpdateQuote(updated);
  };

  const handleAddLogistics = () => {
    const newItem: LogisticsQuoteItem = {
      id: `log-${Date.now()}`,
      itemType: '권역비(목대)',
      amount: 200000,
      details: ''
    };

    const updated: DetailedFinalQuote = {
      ...quote,
      logisticsItems: [...(quote.logisticsItems || []), newItem]
    };
    onUpdateQuote(updated);
  };

  const handleUpdateLogistics = (id: string, patch: Partial<LogisticsQuoteItem>) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      logisticsItems: quote.logisticsItems.map(log => log.id === id ? { ...log, ...patch } : log)
    };
    onUpdateQuote(updated);
  };

  const handleDeleteLogistics = (id: string) => {
    const updated: DetailedFinalQuote = {
      ...quote,
      logisticsItems: quote.logisticsItems.filter(log => log.id !== id)
    };
    onUpdateQuote(updated);
  };

  /* ================= 6. 견적서 초기화 / 예시 불러오기 ================= */
  const handleResetToExample = () => {
    const def = createDefaultDetailedFinalQuote();
    onUpdateQuote(def);
    triggerToast?.('표준 예시 본 견적서 양식이 로드되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & KPI Summary Cards */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-neutral-900 text-white rounded-md tracking-wider">
                실행 본견적서
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                {clientCompany} · {projectName}
              </span>
            </div>
            <h3 className="text-lg font-black text-neutral-900 mt-1">
              본 견적 계산서 (공간별 가구·상판·기기류·부대비용)
            </h3>
            <p className="text-xs text-neutral-500">
              미터/자 변환, EP 및 조명/오픈장/서랍 옵션, 상판 광폭(130~200%) 및 마진 120%가 실시간 자동 계산됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToExample}
              className="px-3 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              title="표준 단가 및 품목 예시로 초기화"
            >
              표준 예시 양식
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-900 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>견적서 인쇄</span>
            </button>
          </div>
        </div>

        {/* 5 Major Category Grand Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 pt-2 border-t border-neutral-100 text-xs">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80">
            <span className="text-[11px] text-neutral-500 block font-medium">1. 공간별 가구장</span>
            <span className="text-sm font-bold text-neutral-900 font-mono mt-0.5 block">
              ₩{totals.cabinetTotal.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/80">
            <span className="text-[11px] text-amber-800 block font-medium">2. 상판 견적</span>
            <span className="text-sm font-bold text-amber-900 font-mono mt-0.5 block">
              ₩{totals.countertopTotal.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/80">
            <span className="text-[11px] text-blue-800 block font-medium">3. 주방 기기류</span>
            <span className="text-sm font-bold text-blue-900 font-mono mt-0.5 block">
              ₩{totals.applianceTotal.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200/80">
            <span className="text-[11px] text-purple-800 block font-medium">4. 기타 기기/자재</span>
            <span className="text-sm font-bold text-purple-900 font-mono mt-0.5 block">
              ₩{totals.otherHardwareTotal.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/80">
            <span className="text-[11px] text-emerald-800 block font-medium">5. 젠다이/부대비용</span>
            <span className="text-sm font-bold text-emerald-900 font-mono mt-0.5 block">
              ₩{totals.miscellaneousTotal.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-neutral-900 text-white rounded-lg shadow-sm col-span-2 md:col-span-1">
            <span className="text-[11px] text-neutral-300 block font-bold">최종 견적 총액</span>
            <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
              ₩{totals.grandTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Section Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: '전체 견적서 보기' },
          { id: 'cabinet', label: `1. 가구/장 견적 (${(quote.spaceCabinetGroups || []).length}개 공간)` },
          { id: 'countertop', label: `2. 상판 견적 (${(quote.countertops || []).length}개소)` },
          { id: 'appliance', label: `3. 주방 기기류 (${(quote.kitchenAppliances || []).length}품목)` },
          { id: 'hardware', label: `4. 기타 기기류 (${(quote.otherHardware || []).length}품목)` },
          { id: 'misc', label: '5. 젠다이 및 부대비용' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= SECTION 1: 공간별 가구/장 견적 ================= */}
      {(activeSection === 'all' || activeSection === 'cabinet') && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h4 className="text-base font-bold text-neutral-900">1. 가구/장 견적 (공간별 분류)</h4>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  소계 ₩{totals.cabinetTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                본주방, 보조주방, 수납, 창고 등 공간별로 상부장/하부장/키큰장/붙박이장 치수를 입력하여 단가와 EP 및 옵션을 계산합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSpace}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 공간 추가</span>
            </button>
          </div>

          {/* Spaces List */}
          <div className="space-y-4">
            {(quote.spaceCabinetGroups || []).map((group, groupIdx) => {
              const isExpanded = expandedSpaces[group.id] !== false;
              const groupSum = totals.spaceSubtotals[group.spaceName] || 0;

              return (
                <div key={group.id} className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/50">
                  {/* Space Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-neutral-100/80 border-b border-neutral-200">
                    <div 
                      onClick={() => toggleSpaceExpand(group.id)}
                      className="flex items-center gap-2.5 cursor-pointer select-none"
                    >
                      <button type="button" className="text-neutral-500">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      <span className="text-xs font-mono font-bold text-neutral-400">#{groupIdx + 1}</span>
                      <input
                        type="text"
                        value={group.spaceName}
                        onClick={e => e.stopPropagation()}
                        onChange={e => handleUpdateSpaceName(group.id, e.target.value)}
                        className="text-sm font-bold text-neutral-900 bg-white/80 hover:bg-white focus:bg-white px-2 py-0.5 border border-neutral-300 rounded focus:outline-blue-500 shadow-2xs"
                        title="클릭하여 공간명 직접 수정"
                        placeholder="공간명 (예: 본주방, 기타(공간))"
                      />
                      <span className="text-xs font-semibold text-neutral-500">
                        ({group.items.length}개 장 품목)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-neutral-800 font-mono">
                        공간 합계: ₩{groupSum.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddCabinetItem(group.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-md transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>장 추가</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSpace(group.id)}
                        className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        title="공간 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items Table inside space */}
                  {isExpanded && (
                    <div className="p-3 bg-white space-y-3">
                      {group.items.length === 0 ? (
                        <div className="text-center py-6 text-neutral-400 text-xs">
                          등록된 장 품목이 없습니다. 상단의 '+ 장 추가'를 눌러 상부장, 하부장, 키큰장 등을 등록하세요.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {group.items.map((item, itemIdx) => {
                            const calc = calcCabinetItem(item);

                            return (
                              <div
                                key={item.id}
                                className="p-3.5 rounded-lg border border-neutral-200/90 bg-neutral-50/30 hover:bg-white hover:border-blue-300 transition-all space-y-3 text-xs shadow-2xs"
                              >
                                {/* Row 1: 기본 정보 & 치수, 단가 */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                  {/* 장 구분 */}
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">
                                      장 구분
                                    </label>
                                    <input
                                      type="text"
                                      list={`cab-types-${item.id}`}
                                      value={item.cabinetType}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { cabinetType: e.target.value })}
                                      className="w-full px-2 py-1.5 text-xs font-semibold border border-neutral-300 rounded bg-white"
                                      placeholder="예: 상부장, 키큰장"
                                    />
                                    <datalist id={`cab-types-${item.id}`}>
                                      <option value="상부장" />
                                      <option value="하부장" />
                                      <option value="키큰장" />
                                      <option value="붙박이장" />
                                      <option value="냉장고장" />
                                      <option value="아일랜드" />
                                      <option value="신발장" />
                                      <option value="오픈수납장" />
                                    </datalist>
                                  </div>

                                  {/* 자재 */}
                                  <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-neutral-500 mb-1">
                                      자재 / 재질
                                    </label>
                                    <input
                                      type="text"
                                      value={item.material}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { material: e.target.value })}
                                      className="w-full px-2 py-1.5 text-xs border border-neutral-300 rounded bg-white"
                                      placeholder="예: PET 무광, 도장, LPM"
                                    />
                                  </div>

                                  {/* 치수 (mm) & 미터/자 변환 */}
                                  <div className="md:col-span-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-[10px] font-bold text-neutral-500">
                                        치수 (mm)
                                      </label>
                                      <span className="text-[10px] text-blue-600 font-mono font-semibold">
                                        = {calc.dimensionMeter.toFixed(2)}m / {calc.dimensionJa.toFixed(1)}자
                                      </span>
                                    </div>
                                    <input
                                      type="number"
                                      step="50"
                                      value={item.dimensionMm}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { dimensionMm: Number(e.target.value) || 0 })}
                                      className="w-full px-2 py-1.5 text-xs font-mono font-bold border border-neutral-300 rounded bg-white"
                                      placeholder="mm 입력 (예: 2400)"
                                    />
                                  </div>

                                  {/* 단가 기준 (미터 / 자) & 단가 입력 */}
                                  <div className="md:col-span-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <label className="text-[10px] font-bold text-neutral-500">단가 (원)</label>
                                      <div className="flex items-center gap-1 text-[10px]">
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCabinetItem(group.id, item.id, { unitType: 'meter' })}
                                          className={`px-1.5 py-0.2 rounded font-bold ${
                                            (item.unitType === 'meter' || item.unitType === 'm') ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-700'
                                          }`}
                                        >
                                          m당
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateCabinetItem(group.id, item.id, { unitType: 'ja' })}
                                          className={`px-1.5 py-0.2 rounded font-bold ${
                                            (item.unitType === 'ja' || item.unitType === '자') ? 'bg-blue-600 text-white' : 'bg-neutral-200 text-neutral-700'
                                          }`}
                                        >
                                          자당
                                        </button>
                                      </div>
                                    </div>
                                    <input
                                      type="number"
                                      step="10000"
                                      value={item.unitPrice}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { unitPrice: Number(e.target.value) || 0 })}
                                      className="w-full px-2 py-1.5 text-xs font-mono border border-neutral-300 rounded bg-white"
                                      placeholder="단가 입력"
                                    />
                                  </div>

                                  {/* 기본 금액 */}
                                  <div className="md:col-span-2 text-right">
                                    <span className="block text-[10px] text-neutral-400 font-medium">기본금액</span>
                                    <span className="text-xs font-mono font-bold text-neutral-900">
                                      ₩{calc.baseAmount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Row 2: EP 추가 & 옵션 추가 (조명, 오픈장, 거울도어, 손잡이, 내부서랍) */}
                                <div className="p-2.5 bg-neutral-100/60 rounded-lg border border-neutral-200/60 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                                  {/* EP 추가: 소(4만), 중(6만), 대(8만) */}
                                  <div className="md:col-span-4 flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-neutral-600 shrink-0">
                                      EP추가:
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <label className="flex items-center gap-0.5">
                                        <span className="text-neutral-500">소(4만)</span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={item.epSmallCount || 0}
                                          onChange={e => handleUpdateCabinetItem(group.id, item.id, { epSmallCount: Number(e.target.value) || 0 })}
                                          className="w-10 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                        />
                                      </label>
                                      <label className="flex items-center gap-0.5">
                                        <span className="text-neutral-500">중(6만)</span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={item.epMediumCount || 0}
                                          onChange={e => handleUpdateCabinetItem(group.id, item.id, { epMediumCount: Number(e.target.value) || 0 })}
                                          className="w-10 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                        />
                                      </label>
                                      <label className="flex items-center gap-0.5">
                                        <span className="text-neutral-500">대(8만)</span>
                                        <input
                                          type="number"
                                          min="0"
                                          value={item.epLargeCount || 0}
                                          onChange={e => handleUpdateCabinetItem(group.id, item.id, { epLargeCount: Number(e.target.value) || 0 })}
                                          className="w-10 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                        />
                                      </label>
                                    </div>
                                    {calc.epAmount > 0 && (
                                      <span className="text-[10px] font-mono font-semibold text-neutral-700 ml-auto shrink-0">
                                        +₩{calc.epAmount.toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  {/* 조명: m당 4만원 / SMPS 4만원 */}
                                  <div className="md:col-span-3 flex items-center gap-1.5 text-[10px]">
                                    <span className="font-bold text-neutral-600 shrink-0">조명:</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      placeholder="길이(m)"
                                      value={item.lightingLengthM || ''}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { lightingLengthM: Number(e.target.value) || 0 })}
                                      className="w-14 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      title="조명 m수 (m당 4만원)"
                                    />
                                    <span className="text-neutral-400">m +</span>
                                    <input
                                      type="number"
                                      placeholder="SMPS"
                                      value={item.lightingSmpsCount || ''}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { lightingSmpsCount: Number(e.target.value) || 0 })}
                                      className="w-11 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      title="SMPS 개수 (개당 4만원)"
                                    />
                                    <span className="text-neutral-400">개</span>
                                  </div>

                                  {/* 오픈장 / 거울도어 / 손잡이 / 내부서랍 */}
                                  <div className="md:col-span-5 flex flex-wrap items-center gap-1.5 text-[10px]">
                                    <label className="flex items-center gap-0.5" title="오픈장: 0장은 0원, 1장 이상 시 합판 1장당 10만원 + 기본 시공비 5만원 (예: 1장=15만, 2장=25만)">
                                      <span className="text-neutral-600 font-semibold">오픈장:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={item.openCabinetBoardCount || 0}
                                        onChange={e => handleUpdateCabinetItem(group.id, item.id, { openCabinetBoardCount: Number(e.target.value) || 0 })}
                                        className="w-9 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      />
                                      <span className="text-neutral-400">장</span>
                                      {calc.openCabinetAmount > 0 && (
                                        <span className="text-[9px] text-blue-700 font-mono font-bold ml-0.5">
                                          (₩{calc.openCabinetAmount.toLocaleString()})
                                        </span>
                                      )}
                                    </label>

                                    <label className="flex items-center gap-0.5" title="거울도어 1장당 15만원">
                                      <span className="text-neutral-500">거울:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={item.mirrorDoorCount || 0}
                                        onChange={e => handleUpdateCabinetItem(group.id, item.id, { mirrorDoorCount: Number(e.target.value) || 0 })}
                                        className="w-9 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      />
                                      <span className="text-neutral-400">장</span>
                                    </label>

                                    <label className="flex items-center gap-0.5" title="손잡이 단가 & 수량">
                                      <span className="text-neutral-500">손잡이:</span>
                                      <input
                                        type="number"
                                        step="1000"
                                        placeholder="단가"
                                        value={item.handleUnitPrice || ''}
                                        onChange={e => handleUpdateCabinetItem(group.id, item.id, { handleUnitPrice: Number(e.target.value) || 0 })}
                                        className="w-12 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      />
                                      <span className="text-neutral-400">x</span>
                                      <input
                                        type="number"
                                        placeholder="수량"
                                        value={item.handleCount || ''}
                                        onChange={e => handleUpdateCabinetItem(group.id, item.id, { handleCount: Number(e.target.value) || 0 })}
                                        className="w-8 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      />
                                    </label>

                                    <label className="flex items-center gap-0.5" title="내부서랍 1칸당 5만원">
                                      <span className="text-neutral-500">서랍:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={item.innerDrawerCount || 0}
                                        onChange={e => handleUpdateCabinetItem(group.id, item.id, { innerDrawerCount: Number(e.target.value) || 0 })}
                                        className="w-9 px-1 py-0.5 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                                      />
                                      <span className="text-neutral-400">칸</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Row 2.5: 기타추가비용 항목 (입력한 액수만큼 견적에 추가) */}
                                <div className="flex flex-wrap items-center gap-2 p-2 bg-amber-50/50 rounded-lg border border-amber-200/70 text-xs">
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="px-1.5 py-0.5 bg-amber-200/80 text-amber-900 rounded font-bold text-[10px]">
                                      기타추가비용
                                    </span>
                                    <span className="text-neutral-500 text-[10px]">추가금:</span>
                                    <input
                                      type="number"
                                      step="10000"
                                      placeholder="0"
                                      value={item.etcCost || ''}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { etcCost: Number(e.target.value) || 0 })}
                                      className="w-24 px-2 py-0.5 font-mono text-right font-bold text-amber-900 border border-amber-300 rounded bg-white text-xs focus:outline-amber-500"
                                    />
                                    <span className="text-neutral-500 text-[10px]">원</span>
                                  </div>

                                  <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                                    <span className="text-neutral-500 text-[10px] shrink-0">비용 사유/내역:</span>
                                    <input
                                      type="text"
                                      placeholder="예: 비규격 특수 제작, 현장 보강 작업, 단내림 맞춤 등"
                                      value={item.etcCostNote || ''}
                                      onChange={e => handleUpdateCabinetItem(group.id, item.id, { etcCostNote: e.target.value })}
                                      className="flex-1 px-2 py-0.5 border border-amber-200 rounded bg-white text-xs text-neutral-800 focus:outline-amber-500"
                                    />
                                  </div>

                                  {calc.etcCost > 0 && (
                                    <span className="text-xs font-mono font-bold text-amber-800 ml-auto shrink-0">
                                      +₩{calc.etcCost.toLocaleString()}
                                    </span>
                                  )}
                                </div>

                                {/* Row 3: 비고 및 품목 총 견적액 */}
                                <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-100 text-xs">
                                  <input
                                    type="text"
                                    value={item.remarks || ''}
                                    onChange={e => handleUpdateCabinetItem(group.id, item.id, { remarks: e.target.value })}
                                    className="flex-1 px-2 py-1 text-xs border border-neutral-200 rounded text-neutral-600 bg-white"
                                    placeholder="특이사항 / 하드웨어 스펙 등 비고"
                                  />

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right">
                                      <span className="text-[10px] text-neutral-400 mr-2">
                                        (기본 {calc.baseAmount.toLocaleString()} + EP {calc.epAmount.toLocaleString()} + 옵션 {(calc.additionalAmount - calc.etcCost).toLocaleString()}{calc.etcCost > 0 ? ` + 기타추가 ${calc.etcCost.toLocaleString()}` : ''})
                                      </span>
                                      <span className="text-sm font-mono font-black text-blue-900">
                                        ₩{calc.totalAmount.toLocaleString()}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCabinetItem(group.id, item.id)}
                                      className="text-neutral-400 hover:text-red-600 p-1 rounded"
                                      title="장 삭제"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: 상판 견적 ================= */}
      {(activeSection === 'all' || activeSection === 'countertop') && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h4 className="text-base font-bold text-neutral-900">2. 상판 견적 (별도 견적란)</h4>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  소계 ₩{totals.countertopTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                인조대리석(중국산 13만, 국산 14만, 오로라 19만), 엔지니어드스톤(24.5만), 세라믹(36만~51만~)과 폭(Depth)에 따른 광폭 할증 및 마진율(기본 120%)이 자동 반영되며, 항목별로 할증률과 마진율을 직접 입력하여 조정할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddCountertop}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>상판 항목 추가</span>
            </button>
          </div>

          {/* Countertops Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">위치</th>
                  <th className="py-2.5 px-3">재질 선택</th>
                  <th className="py-2.5 px-3">Wide (가로 mm)</th>
                  <th className="py-2.5 px-3">Depth (폭 mm)</th>
                  <th className="py-2.5 px-3">두께(T)</th>
                  <th className="py-2.5 px-3 text-right">미터단가 (원)</th>
                  <th className="py-2.5 px-3">광폭 할증률 (%)</th>
                  <th className="py-2.5 px-3 text-center">마진율 (%)</th>
                  <th className="py-2.5 px-3 text-right">견적액</th>
                  <th className="py-2.5 px-3">비고</th>
                  <th className="py-2.5 px-3 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {(quote.countertops || []).map(item => {
                  const calc = calcCountertopItem(item);

                  return (
                    <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* 위치 */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.location}
                          onChange={e => handleUpdateCountertop(item.id, { location: e.target.value })}
                          className="w-24 px-2 py-1 border border-neutral-300 rounded font-semibold text-neutral-900 bg-white"
                          placeholder="싱크대, 아일랜드"
                        />
                      </td>

                      {/* 재질 선택 */}
                      <td className="py-2.5 px-3">
                        <select
                          value={item.material}
                          onChange={e => handleUpdateCountertop(item.id, { material: e.target.value })}
                          className="px-2 py-1 border border-neutral-300 rounded font-medium text-neutral-900 bg-white"
                        >
                          <option value="인조대리석(중국산)">인조대리석(중국산) - 13만/m</option>
                          <option value="인조대리석(국산)">인조대리석(국산) - 14만/m</option>
                          <option value="인조대리석(오로라)">인조대리석(오로라) - 19만/m</option>
                          <option value="엔지니어드스톤(칸스톤)">엔지니어드스톤(칸스톤) - 24.5만/m</option>
                          <option value="세라믹(중국산)">세라믹(중국산) - 36만/m</option>
                          <option value="세라믹(이태리산)">세라믹(이태리산) - 51만/m~</option>
                        </select>
                      </td>

                      {/* Wide mm */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="number"
                            step="50"
                            value={item.wideMm}
                            onChange={e => handleUpdateCountertop(item.id, { wideMm: Number(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 font-bold border border-neutral-300 rounded bg-white text-xs"
                          />
                          <span className="text-[10px] text-neutral-500">({calc.wideMeter.toFixed(2)}m)</span>
                        </div>
                      </td>

                      {/* Depth mm */}
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          step="10"
                          value={item.depthMm}
                          onChange={e => handleUpdateCountertop(item.id, { depthMm: Number(e.target.value) || 0 })}
                          className="w-18 px-2 py-1 font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      {/* 두께 T */}
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          value={item.thicknessMm}
                          onChange={e => handleUpdateCountertop(item.id, { thicknessMm: Number(e.target.value) || 0 })}
                          className="w-14 px-2 py-1 font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                        <span className="text-neutral-400 text-[10px] ml-0.5">T</span>
                      </td>

                      {/* 미터당 단가 */}
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="10000"
                          value={item.unitPricePerMeter}
                          onChange={e => handleUpdateCountertop(item.id, { unitPricePerMeter: Number(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 font-mono text-right border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      {/* 광폭 할증률 */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="5"
                            min="50"
                            max="500"
                            value={item.depthRatePercent !== undefined ? item.depthRatePercent : calc.depthRatePercent}
                            onChange={e => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              handleUpdateCountertop(item.id, { depthRatePercent: val });
                            }}
                            className={`w-16 px-1.5 py-1 font-mono font-bold text-center border rounded bg-white text-xs ${
                              item.depthRatePercent !== undefined
                                ? 'border-amber-500 text-amber-900 bg-amber-50/40'
                                : 'border-neutral-300 text-neutral-800'
                            }`}
                            title="기본 폭(Depth) 기준 자동 할증률이 적용되며, 필요시 직접 변경할 수 있습니다."
                          />
                          <span className="text-xs font-semibold text-neutral-600">%</span>
                          {item.depthRatePercent !== undefined && (
                            <button
                              type="button"
                              onClick={() => handleUpdateCountertop(item.id, { depthRatePercent: undefined })}
                              className="text-[10px] text-amber-700 hover:text-amber-900 px-1 py-0.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded"
                              title="폭(Depth) 기준 자동 할증률로 복원"
                            >
                              자동
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5 whitespace-nowrap">
                          {calc.depthLabel}
                        </span>
                      </td>

                      {/* 마진율 (%) */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="5"
                            min="50"
                            max="300"
                            value={item.marginRatePercent !== undefined ? item.marginRatePercent : 120}
                            onChange={e => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              handleUpdateCountertop(item.id, { marginRatePercent: val });
                            }}
                            className={`w-16 px-1.5 py-1 font-mono font-bold text-center border rounded bg-white text-xs ${
                              item.marginRatePercent !== undefined && item.marginRatePercent !== 120
                                ? 'border-blue-500 text-blue-900 bg-blue-50/40'
                                : 'border-neutral-300 text-neutral-800'
                            }`}
                            title="기본 120% 마진이 적용되며, 필요시 임의로 변경할 수 있습니다."
                          />
                          <span className="text-xs font-semibold text-neutral-600">%</span>
                          {item.marginRatePercent !== undefined && item.marginRatePercent !== 120 && (
                            <button
                              type="button"
                              onClick={() => handleUpdateCountertop(item.id, { marginRatePercent: undefined })}
                              className="text-[10px] text-blue-700 hover:text-blue-900 px-1 py-0.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded"
                              title="기본 120%로 복원"
                            >
                              120%
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 견적액 */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sm text-amber-900 whitespace-nowrap">
                        ₩{calc.totalAmount.toLocaleString()}
                      </td>

                      {/* 비고 */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={e => handleUpdateCountertop(item.id, { notes: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-200 rounded text-neutral-600 text-[11px] bg-white"
                          placeholder="가공/시공 메모"
                        />
                      </td>

                      {/* 삭제 */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteCountertop(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: 주방 기기류 ================= */}
      {(activeSection === 'all' || activeSection === 'appliance') && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h4 className="text-base font-bold text-neutral-900">3. 주방 기기류 견적</h4>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  소계 ₩{totals.applianceTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                후드, 수전, 싱크볼, 수저함, 쿡탑, 하드웨어, 식기건조대, 싱크라인 등 기기 가격×수량에 설치비를 합산하여 견적을 산출합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddKitchenAppliance}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기기 품목 추가</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">항목 구분</th>
                  <th className="py-2.5 px-3">모델명</th>
                  <th className="py-2.5 px-3">제조사</th>
                  <th className="py-2.5 px-3 text-right">가격 (원)</th>
                  <th className="py-2.5 px-3 text-center">수량</th>
                  <th className="py-2.5 px-3 text-right">설치비 (원)</th>
                  <th className="py-2.5 px-3 text-right">견적액 (가격x수량 + 설치비)</th>
                  <th className="py-2.5 px-3">비고</th>
                  <th className="py-2.5 px-3 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {(quote.kitchenAppliances || []).map(item => {
                  const total = calcKitchenApplianceItem(item);

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          list="kitchen-app-types"
                          value={item.category}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { category: e.target.value })}
                          className="w-24 px-2 py-1 border border-neutral-300 rounded font-semibold text-neutral-900 bg-white"
                        />
                        <datalist id="kitchen-app-types">
                          <option value="후드" />
                          <option value="수전" />
                          <option value="싱크볼" />
                          <option value="수저함" />
                          <option value="쿡탑" />
                          <option value="하드웨어" />
                          <option value="식기건조대" />
                          <option value="싱크라인" />
                          <option value="기타" />
                        </datalist>
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.modelName}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { modelName: e.target.value })}
                          className="w-48 px-2 py-1 border border-neutral-300 rounded bg-white text-xs"
                          placeholder="모델명 입력"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.manufacturer}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { manufacturer: e.target.value })}
                          className="w-24 px-2 py-1 border border-neutral-300 rounded bg-white text-xs"
                          placeholder="제조사"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="10000"
                          value={item.price}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { price: Number(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 text-right font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { quantity: Number(e.target.value) || 1 })}
                          className="w-12 px-2 py-1 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="5000"
                          value={item.installFee}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { installFee: Number(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        ₩{total.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.remarks || ''}
                          onChange={e => handleUpdateKitchenAppliance(item.id, { remarks: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-200 rounded text-neutral-600 text-[11px] bg-white"
                          placeholder="설치 조건 및 비고"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteKitchenAppliance(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: 기타 기기류 ================= */}
      {(activeSection === 'all' || activeSection === 'hardware') && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <h4 className="text-base font-bold text-neutral-900">4. 기타 기기류 견적</h4>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                  소계 ₩{totals.otherHardwareTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                매립콘센트, 하드웨어, 손잡이 일괄 등에 대한 품목별 견적(단가×수량)을 입력합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddOtherHardware}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기타 기기 추가</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">품목명</th>
                  <th className="py-2.5 px-3">규격 / 상세 사양</th>
                  <th className="py-2.5 px-3 text-right">단가 (원)</th>
                  <th className="py-2.5 px-3 text-center">수량</th>
                  <th className="py-2.5 px-3 text-right">설치비 (원)</th>
                  <th className="py-2.5 px-3 text-right">견적액 (가격x수량 + 설치비)</th>
                  <th className="py-2.5 px-3">비고</th>
                  <th className="py-2.5 px-3 text-center">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {(quote.otherHardware || []).map(item => {
                  const total = calcOtherHardwareItem(item);

                  return (
                    <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={e => handleUpdateOtherHardware(item.id, { itemName: e.target.value })}
                          className="w-32 px-2 py-1 border border-neutral-300 rounded font-semibold bg-white"
                          placeholder="매립콘센트, 손잡이 등"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.spec}
                          onChange={e => handleUpdateOtherHardware(item.id, { spec: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-300 rounded bg-white text-xs"
                          placeholder="제품 규격"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="5000"
                          value={item.price}
                          onChange={e => handleUpdateOtherHardware(item.id, { price: Number(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 text-right font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateOtherHardware(item.id, { quantity: Number(e.target.value) || 1 })}
                          className="w-12 px-2 py-1 text-center font-mono border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="5000"
                          placeholder="0"
                          value={item.installFee || ''}
                          onChange={e => handleUpdateOtherHardware(item.id, { installFee: Number(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right font-mono border border-neutral-300 rounded bg-white text-xs focus:outline-purple-500"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-900">
                        ₩{total.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.remarks || ''}
                          onChange={e => handleUpdateOtherHardware(item.id, { remarks: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-200 rounded text-neutral-600 text-[11px] bg-white"
                          placeholder="비고"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteOtherHardware(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECTION 5: 기타 항목 (젠다이 & 부대비용) ================= */}
      {(activeSection === 'all' || activeSection === 'misc') && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs space-y-5 p-5">
          <div className="pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-base font-bold text-neutral-900">5. 젠다이 및 부대비용 견적</h4>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                소계 ₩{totals.miscellaneousTotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              욕실 젠다이(가로 m당 기본 2.5만원 자동 계산, 단가 직접 수정 가능) 및 권역비(목대 운임), 사다리차비용 등 부대비용을 입력합니다.
            </p>
          </div>

          {/* Sub 1: 젠다이 견적 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <span>• 젠다이 (외욕실, 내욕실 등 - m당 단가 직접 입력 가능)</span>
                <span className="text-emerald-700 font-mono font-semibold">
                  (소계: ₩{totals.jendaiTotal.toLocaleString()})
                </span>
              </span>
              <button
                type="button"
                onClick={handleAddJendai}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>젠다이 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3">위치</th>
                    <th className="py-2 px-3">Wide (가로 mm)</th>
                    <th className="py-2 px-3">Depth (폭 mm)</th>
                    <th className="py-2 px-3">두께(T)</th>
                    <th className="py-2 px-3 text-right">단가 (m당 원)</th>
                    <th className="py-2 px-3 text-right">견적액 (Wide m x 단가)</th>
                    <th className="py-2 px-3">비고</th>
                    <th className="py-2 px-3 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {(quote.jendaiItems || []).map(item => {
                    const calc = calcJendaiItem(item);

                    return (
                      <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.location}
                            onChange={e => handleUpdateJendai(item.id, { location: e.target.value })}
                            className="w-28 px-2 py-1 border border-neutral-300 rounded font-semibold bg-white"
                            placeholder="외욕실, 내욕실"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1 font-mono">
                            <input
                              type="number"
                              step="50"
                              value={item.wideMm}
                              onChange={e => handleUpdateJendai(item.id, { wideMm: Number(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 font-bold border border-neutral-300 rounded bg-white text-xs"
                            />
                            <span className="text-[10px] text-neutral-500">({calc.wideMeter.toFixed(2)}m)</span>
                          </div>
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.depthMm}
                            onChange={e => handleUpdateJendai(item.id, { depthMm: Number(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 font-mono border border-neutral-300 rounded bg-white text-xs"
                          />
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={item.thicknessMm}
                            onChange={e => handleUpdateJendai(item.id, { thicknessMm: Number(e.target.value) || 0 })}
                            className="w-14 px-2 py-1 font-mono border border-neutral-300 rounded bg-white text-xs"
                          />
                          <span className="text-neutral-400 text-[10px] ml-0.5">T</span>
                        </td>

                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="1000"
                            value={item.unitPricePerMeter ?? 25000}
                            onChange={e => handleUpdateJendai(item.id, { unitPricePerMeter: Number(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 font-mono text-right border border-neutral-300 rounded bg-white text-xs focus:outline-emerald-500"
                            title="젠다이 m당 단가 (기본 25,000원, 임의 입력 가능)"
                          />
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-900">
                          ₩{calc.totalAmount.toLocaleString()}
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.remarks || ''}
                            onChange={e => handleUpdateJendai(item.id, { remarks: e.target.value })}
                            className="w-full px-2 py-1 border border-neutral-200 rounded text-neutral-600 text-[11px] bg-white"
                            placeholder="시공 특이사항"
                          />
                        </td>

                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteJendai(item.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sub 2: 권역비 및 사다리차비용 등 */}
          <div className="space-y-3 pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <span>• 권역비(목대 운임), 사다리차 및 기타 부대비용</span>
                <span className="text-emerald-700 font-mono font-semibold">
                  (소계: ₩{totals.logisticsTotal.toLocaleString()})
                </span>
              </span>
              <button
                type="button"
                onClick={handleAddLogistics}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>부대비용 항목 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3">비용 항목 구분</th>
                    <th className="py-2 px-3">내역 및 상세 사유</th>
                    <th className="py-2 px-3 text-right">금액 (원)</th>
                    <th className="py-2 px-3 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {(quote.logisticsItems || []).map(item => (
                    <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.itemType}
                          onChange={e => handleUpdateLogistics(item.id, { itemType: e.target.value })}
                          className="w-36 px-2 py-1 border border-neutral-300 rounded font-semibold bg-white"
                          placeholder="권역비, 사다리차비용"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.details}
                          onChange={e => handleUpdateLogistics(item.id, { details: e.target.value })}
                          className="w-full px-2 py-1 border border-neutral-300 rounded bg-white text-xs"
                          placeholder="운송 구간, 양중 층수 등 상세 내용"
                        />
                      </td>

                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="10000"
                          value={item.amount}
                          onChange={e => handleUpdateLogistics(item.id, { amount: Number(e.target.value) || 0 })}
                          className="w-28 px-2 py-1 text-right font-mono font-bold border border-neutral-300 rounded bg-white text-xs"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteLogistics(item.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= FINAL SUMMARY & SETTLEMENT ================= */}
      <div className="bg-neutral-900 text-white rounded-xl p-6 shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>본 견적서 최종 정산 및 계약 총액</span>
            </h4>
            <p className="text-xs text-neutral-400 mt-1">
              공간별 가구장, 상판, 주방기기류, 기타기기, 젠다이 및 부대비용이 모두 취합된 공급가액 합계입니다.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-800 px-4 py-2.5 rounded-lg border border-neutral-700">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={quote.includeVat !== false}
                onChange={e => onUpdateQuote({ ...quote, includeVat: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
              <span className="text-neutral-200">부가가치세 (VAT 10%) 적용</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Summary Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
              <span>1. 공간별 가구/장 견적 합계</span>
              <span className="font-mono font-bold text-white">₩{totals.cabinetTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
              <span>2. 상판 견적 합계</span>
              <span className="font-mono font-bold text-white">₩{totals.countertopTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
              <span>3. 주방 기기류 견적 합계</span>
              <span className="font-mono font-bold text-white">₩{totals.applianceTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
              <span>4. 기타 기기류 견적 합계</span>
              <span className="font-mono font-bold text-white">₩{totals.otherHardwareTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
              <span>5. 젠다이 및 부대비용(권역비/사다리차)</span>
              <span className="font-mono font-bold text-white">₩{totals.miscellaneousTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-neutral-200 font-semibold">
              <span>순수 공급가액 소계</span>
              <span className="font-mono text-sm text-neutral-100">₩{totals.supplyTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Right: Discount & Grand Total */}
          <div className="space-y-3 bg-neutral-800/80 p-4 rounded-xl border border-neutral-700 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-300">특별 할인 금액 (네고/절삭)</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-neutral-500">-₩</span>
                  <input
                    type="number"
                    step="10000"
                    value={quote.discountAmount || 0}
                    onChange={e => onUpdateQuote({ ...quote, discountAmount: Number(e.target.value) || 0 })}
                    className="w-28 px-2 py-1 text-right font-mono font-bold text-xs bg-neutral-900 border border-neutral-600 rounded text-red-400"
                  />
                </div>
              </div>

              {quote.includeVat !== false && (
                <div className="flex items-center justify-between text-neutral-300">
                  <span>부가세 (VAT 10%)</span>
                  <span className="font-mono font-bold text-neutral-100">₩{totals.vatTotal.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-700 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-neutral-400 block font-medium">최종 결제/청구 견적액</span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {quote.includeVat !== false ? '(VAT 10% 포함)' : '(VAT 별도)'}
                </span>
              </div>
              <span className="text-2xl md:text-3xl font-black font-mono text-amber-400">
                ₩{totals.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="pt-3 border-t border-neutral-800">
          <label className="block text-xs font-bold text-neutral-400 mb-1">견적 조건 및 특이사항</label>
          <input
            type="text"
            value={quote.notes || ''}
            onChange={e => onUpdateQuote({ ...quote, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-amber-500"
            placeholder="예: 발주 후 제작 기간 영업일 10일 소요, 세라믹 상판 졸리컷 마감 기준"
          />
        </div>
      </div>
    </div>
  );
};
