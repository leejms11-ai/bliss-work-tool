import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Printer, 
  Save, 
  Layers, 
  Sparkles, 
  CheckSquare, 
  RotateCcw, 
  Info, 
  FileText,
  Sliders,
  Utensils,
  Refrigerator,
  ShowerHead,
  Lightbulb,
  Wrench,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  SiteMeasurementForm, 
  createDefaultSiteMeasurementForm,
  DynamicChecklistItem 
} from '../types/project';

interface SiteMeasurementChecklistFormProps {
  form: SiteMeasurementForm;
  onChange: (updatedForm: SiteMeasurementForm) => void;
  onSaveToast?: (msg: string) => void;
}

export const SiteMeasurementChecklistForm: React.FC<SiteMeasurementChecklistFormProps> = ({
  form,
  onChange,
  onSaveToast
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Update helper
  const updateField = <K extends keyof SiteMeasurementForm>(key: K, value: SiteMeasurementForm[K]) => {
    const updated = { ...form, [key]: value };
    onChange(updated);
  };

  /* ================= 1. 도어 색상 & 도장 색상 다중 항목 관리 ================= */
  const doorColorList = form.doorColors && form.doorColors.length > 0 
    ? form.doorColors 
    : [form.doorColor || ''];

  const paintColorList = form.paintColors && form.paintColors.length > 0 
    ? form.paintColors 
    : [form.paintColor || ''];

  const handleUpdateDoorColor = (index: number, val: string) => {
    const next = [...doorColorList];
    next[index] = val;
    onChange({
      ...form,
      doorColor: next[0] || '',
      doorColors: next
    });
  };

  const handleAddDoorColor = () => {
    const next = [...doorColorList, ''];
    onChange({
      ...form,
      doorColors: next
    });
    if (onSaveToast) onSaveToast(`도어색상 ${next.length}란이 추가되었습니다.`);
  };

  const handleRemoveDoorColor = (index: number) => {
    if (doorColorList.length <= 1) return;
    const next = doorColorList.filter((_, i) => i !== index);
    onChange({
      ...form,
      doorColor: next[0] || '',
      doorColors: next
    });
  };

  const handleUpdatePaintColor = (index: number, val: string) => {
    const next = [...paintColorList];
    next[index] = val;
    onChange({
      ...form,
      paintColor: next[0] || '',
      paintColors: next
    });
  };

  const handleAddPaintColor = () => {
    const next = [...paintColorList, ''];
    onChange({
      ...form,
      paintColors: next
    });
    if (onSaveToast) onSaveToast(`도장색상 ${next.length}란이 추가되었습니다.`);
  };

  const handleRemovePaintColor = (index: number) => {
    if (paintColorList.length <= 1) return;
    const next = paintColorList.filter((_, i) => i !== index);
    onChange({
      ...form,
      paintColor: next[0] || '',
      paintColors: next
    });
  };

  /* ================= 2. 상판 색상 다중 항목 관리 ================= */
  const countertopColorList = form.countertop.colors && form.countertop.colors.length > 0
    ? form.countertop.colors
    : [form.countertop.color || ''];

  const handleUpdateCountertopColor = (index: number, val: string) => {
    const next = [...countertopColorList];
    next[index] = val;
    onChange({
      ...form,
      countertop: {
        ...form.countertop,
        color: next[0] || '',
        colors: next
      }
    });
  };

  const handleAddCountertopColor = () => {
    const next = [...countertopColorList, ''];
    onChange({
      ...form,
      countertop: {
        ...form.countertop,
        colors: next
      }
    });
    if (onSaveToast) onSaveToast(`상판 색상 ${next.length}란이 추가되었습니다.`);
  };

  const handleRemoveCountertopColor = (index: number) => {
    if (countertopColorList.length <= 1) return;
    const next = countertopColorList.filter((_, i) => i !== index);
    onChange({
      ...form,
      countertop: {
        ...form.countertop,
        color: next[0] || '',
        colors: next
      }
    });
  };

  /* ================= 3 ~ 7. 다중 동적 항목 관리 헬퍼 ================= */
  const handleAddCustomItem = (
    categoryKey: 'appliances' | 'kitchenFixtures' | 'otherFixtures' | 'ledge' | 'openCabinet' | 'lighting' | 'mirrorDoor' | 'replacementItems',
    listKey: string,
    defaultName: string
  ) => {
    const targetObj = form[categoryKey] as any;
    const currentList: DynamicChecklistItem[] = targetObj[listKey] || [];
    const count = currentList.length + 2;
    const newItem: DynamicChecklistItem = {
      id: `dyn-${categoryKey}-${Date.now()}`,
      name: `${defaultName} ${count}`,
      checked: true,
      value: ''
    };
    const nextList = [...currentList, newItem];
    onChange({
      ...form,
      [categoryKey]: {
        ...targetObj,
        [listKey]: nextList
      }
    });
    if (onSaveToast) onSaveToast(`${newItem.name} 항목이 추가되었습니다.`);
  };

  const handleUpdateCustomItem = (
    categoryKey: 'appliances' | 'kitchenFixtures' | 'otherFixtures' | 'ledge' | 'openCabinet' | 'lighting' | 'mirrorDoor' | 'replacementItems',
    listKey: string,
    id: string,
    updates: Partial<DynamicChecklistItem>
  ) => {
    const targetObj = form[categoryKey] as any;
    const currentList: DynamicChecklistItem[] = targetObj[listKey] || [];
    const nextList = currentList.map(item => item.id === id ? { ...item, ...updates } : item);
    onChange({
      ...form,
      [categoryKey]: {
        ...targetObj,
        [listKey]: nextList
      }
    });
  };

  const handleRemoveCustomItem = (
    categoryKey: 'appliances' | 'kitchenFixtures' | 'otherFixtures' | 'ledge' | 'openCabinet' | 'lighting' | 'mirrorDoor' | 'replacementItems',
    listKey: string,
    id: string
  ) => {
    const targetObj = form[categoryKey] as any;
    const currentList: DynamicChecklistItem[] = targetObj[listKey] || [];
    const nextList = currentList.filter(item => item.id !== id);
    onChange({
      ...form,
      [categoryKey]: {
        ...targetObj,
        [listKey]: nextList
      }
    });
  };

  // Copy formatted checklist to clipboard (for KakaoTalk / field messenger)
  const handleCopySummary = () => {
    const lines: string[] = [];
    lines.push('📋 [현장 실측 정밀 마감 체크리스트 보고]');
    lines.push('──────────────────────────────');
    lines.push(`1. 기본 마감: ${form.baseMoulding.type}${form.baseMoulding.customDetail ? ` (${form.baseMoulding.customDetail})` : ''}`);
    
    // 도어 색상 & 도장 색상
    const doorStr = doorColorList.filter(Boolean).map((c, i) => `도어색상 ${i + 1}: ${c}`).join(' / ') || form.doorColor || '미정';
    const paintStr = paintColorList.filter(Boolean).map((c, i) => `도장색상 ${i + 1}: ${c}`).join(' / ') || form.paintColor || '미정';
    lines.push(`2. 도어 & 도장: [${doorStr}] | [${paintStr}]`);

    // 상판
    lines.push(`3. 상판:`);
    lines.push(`   - 재질: ${form.countertop.material}${form.countertop.customMaterial ? ` (${form.countertop.customMaterial})` : ''}`);
    const topStr = countertopColorList.filter(Boolean).map((c, i) => `색상 ${i + 1}: ${c}`).join(', ') || form.countertop.color || '미정';
    lines.push(`   - 색상: ${topStr}`);
    const holes: string[] = [];
    if (form.countertop.cooktopHoles.induction) holes.push('인덕션');
    if (form.countertop.cooktopHoles.gasRange) holes.push('가스레인지');
    if (form.countertop.cooktopHoles.embeddedOutlet) holes.push('매립콘센트');
    lines.push(`   - 쿡탑 타공: ${holes.join(', ') || '없음'}${form.countertop.cooktopHoles.detailNotes ? ` (${form.countertop.cooktopHoles.detailNotes})` : ''}`);
    
    // 가전
    lines.push(`4. 가전 품목:`);
    const appList = [
      { name: '식기세척기', item: form.appliances.dishwasher },
      { name: '로봇청소기', item: form.appliances.robotCleaner },
      { name: '오븐', item: form.appliances.oven },
      { name: '밥솥', item: form.appliances.riceCooker },
      { name: '전자레인지', item: form.appliances.microwave },
      { name: `냉장고(${form.appliances.refrigerator.isKitchenFit})`, item: form.appliances.refrigerator },
      { name: `김치냉장고${form.appliances.kimchiFridge.isKitchenFit ? `(${form.appliances.kimchiFridge.isKitchenFit})` : ''}`, item: form.appliances.kimchiFridge },
      { name: '시스템에어컨', item: form.appliances.systemAc },
      { name: '세탁기(워시타워)', item: form.appliances.washerTower },
      { name: '스타일러(에어드레서)', item: form.appliances.styler },
      { name: '무선청소기', item: form.appliances.vacuumCleaner }
    ];
    appList.filter(a => a.item && a.item.checked).forEach(a => {
      lines.push(`   - ${a.name}: ${a.item?.modelOrSize || '적용'}`);
    });
    if (form.appliances.customApplianceList) {
      form.appliances.customApplianceList.filter(c => c.checked).forEach(c => {
        lines.push(`   - ${c.name}: ${c.value || '적용'}`);
      });
    }

    // 주방 기기류
    lines.push(`5. 주방 기기류:`);
    const kList = [
      { name: '수전', item: form.kitchenFixtures.faucet },
      { name: '후드', item: form.kitchenFixtures.hood },
      { name: '싱크볼', item: form.kitchenFixtures.sinkBowl },
      { name: '쿡탑', item: form.kitchenFixtures.cooktop },
      { name: '하드웨어', item: form.kitchenFixtures.hardware },
      { name: '기타', item: form.kitchenFixtures.etc },
    ];
    kList.filter(k => k.item && k.item.checked).forEach(k => {
      lines.push(`   - ${k.name}: ${k.item.spec || '적용'}`);
    });
    if (form.kitchenFixtures.customFixtureList) {
      form.kitchenFixtures.customFixtureList.filter(c => c.checked).forEach(c => {
        lines.push(`   - ${c.name}: ${c.value || '적용'}`);
      });
    }

    // 기타 기기류
    lines.push(`6. 기타 기기류:`);
    const oList = [
      { name: '수저함', item: form.otherFixtures.cutleryTray },
      { name: '싱크라인', item: form.otherFixtures.sinkLine },
      { name: '식기건조대', item: form.otherFixtures.dishDryingRack },
      { name: '싯기', item: form.otherFixtures.dishWasherSub },
      { name: '매립콘센트', item: form.otherFixtures.embeddedOutlet },
    ];
    oList.filter(o => o.item && o.item.checked).forEach(o => {
      lines.push(`   - ${o.name}: ${o.item.spec || '적용'}`);
    });
    if (form.otherFixtures.customOtherList) {
      form.otherFixtures.customOtherList.filter(c => c.checked).forEach(c => {
        lines.push(`   - ${c.name}: ${c.value || '적용'}`);
      });
    }

    // 젠다이 & 오픈장 & 조명 & 거울도어
    lines.push(`7. 젠다이 · 오픈장 · 조명 · 거울도어:`);
    if (form.ledge.outerBath.checked) lines.push(`   - 외욕실 젠다이: ${form.ledge.outerBath.spec || '적용'}`);
    if (form.ledge.innerBath.checked) lines.push(`   - 내욕실 젠다이: ${form.ledge.innerBath.spec || '적용'}`);
    if (form.ledge.customLedgeList) {
      form.ledge.customLedgeList.filter(c => c.checked).forEach(c => lines.push(`   - ${c.name}: ${c.value || '적용'}`));
    }
    if (form.openCabinet.checked) lines.push(`   - 오픈장: ${form.openCabinet.spec || '적용'}`);
    if (form.openCabinet.customOpenCabinetList) {
      form.openCabinet.customOpenCabinetList.filter(c => c.checked).forEach(c => lines.push(`   - ${c.name}: ${c.value || '적용'}`));
    }
    lines.push(`   - 조명: ${form.lighting.type}${form.lighting.notes ? ` (${form.lighting.notes})` : ''}`);
    if (form.lighting.customLightingList) {
      form.lighting.customLightingList.filter(c => c.checked).forEach(c => lines.push(`   - ${c.name}: ${c.value || '적용'}`));
    }
    if (form.mirrorDoor.checked) lines.push(`   - 거울도어: ${form.mirrorDoor.spec || '적용'}`);
    if (form.mirrorDoor.customMirrorDoorList) {
      form.mirrorDoor.customMirrorDoorList.filter(c => c.checked).forEach(c => lines.push(`   - ${c.name}: ${c.value || '적용'}`));
    }

    // 교체 품목
    lines.push(`8. 교체 품목:`);
    const repList = [
      { name: '도어', item: form.replacementItems.door },
      { name: '서랍레일', item: form.replacementItems.drawerRail },
      { name: '경첩', item: form.replacementItems.hinge },
      { name: '기타', item: form.replacementItems.etc },
    ];
    repList.filter(r => r.item && r.item.checked).forEach(r => {
      lines.push(`   - ${r.name}: ${r.item.spec || '적용'}`);
    });
    if (form.replacementItems.customReplacementList) {
      form.replacementItems.customReplacementList.filter(c => c.checked).forEach(c => {
        lines.push(`   - ${c.name}: ${c.value || '적용'}`);
      });
    }

    if (form.specialNotes) {
      lines.push(`9. 기타 특이사항: ${form.specialNotes}`);
    }
    lines.push('──────────────────────────────');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onSaveToast) onSaveToast('실측 양식 요약이 클립보드에 복사되었습니다.');
  };

  const handleReset = () => {
    const defaultData = createDefaultSiteMeasurementForm();
    onChange(defaultData);
    if (onSaveToast) onSaveToast('실측 체크리스트가 기본 양식으로 초기화되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span>현장 실측 정밀 마감 및 기기 체크리스트</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              다중 항목 추가 지원
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            도어/도장/상판 복수 색상 및 가전(워시타워·스타일러·무선청소기), 주방·욕실 기기류 항목을 2개 이상 자유롭게 추가 기입할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200"
            title="카카오톡/메신저 보고용 텍스트 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료' : '양식 텍스트 복사'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200"
            title="인쇄 또는 PDF 저장"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>인쇄 / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title="기본 양식으로 리셋"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Container */}
      <div className="space-y-6">

        {/* 1. 기본 마감 & 도어/도장 색상 (도어색상 1, 2... & 도장색상 1, 2... 추가 기능) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">1</span>
              <span>기본 마감 및 도어/도장 색상 (2가지 이상 색상란 추가 지원)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 기본 마감: 일반몰딩 / 인몰딩 / 무몰딩 / 기타 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                기본 마감 몰딩 방식 *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['일반몰딩', '인몰딩', '무몰딩', '기타'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('baseMoulding', { ...form.baseMoulding, type })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      form.baseMoulding.type === type
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {form.baseMoulding.type === '기타' && (
                <input
                  type="text"
                  placeholder="기타 마감 상세 (예: 3선 마이너스 몰딩)"
                  value={form.baseMoulding.customDetail}
                  onChange={e => updateField('baseMoulding', { ...form.baseMoulding, customDetail: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 text-xs border border-blue-300 rounded-lg focus:outline-blue-500"
                />
              )}
            </div>

            {/* 도어 색상 (도어색상 1, 도어색상 2... 추가 기능) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-800">
                  도어 색상 (필름 / PET / 무늬목)
                </label>
                <button
                  type="button"
                  onClick={handleAddDoorColor}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ 도어색상 추가</span>
                </button>
              </div>

              <div className="space-y-2">
                {doorColorList.map((col, idx) => (
                  <div key={`door-col-${idx}`} className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-semibold text-neutral-500 shrink-0 w-16">
                      도어색상 {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`예: ${idx === 0 ? '예림 무광 크림화이트 (상부장)' : '솔리드 웜그레이 (하부장/홈바)'}`}
                      value={col}
                      onChange={e => handleUpdateDoorColor(idx, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500 font-medium"
                    />
                    {doorColorList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoorColor(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="도어색상 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">상/하부장 투톤 분리 시 도어색상 추가</p>
            </div>

            {/* 도장 색상 (도장색상 1, 도장색상 2... 추가 기능) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-800">
                  도장 색상 (페인트 / 벤자민무어 등)
                </label>
                <button
                  type="button"
                  onClick={handleAddPaintColor}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ 도장색상 추가</span>
                </button>
              </div>

              <div className="space-y-2">
                {paintColorList.map((col, idx) => (
                  <div key={`paint-col-${idx}`} className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-semibold text-neutral-500 shrink-0 w-16">
                      도장색상 {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`예: ${idx === 0 ? '벤자민무어 OC-17 화이트도브' : '삼화 친환경 소프트베이지 포인트'}`}
                      value={col}
                      onChange={e => handleUpdatePaintColor(idx, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500 font-medium"
                    />
                    {paintColorList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePaintColor(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="도장색상 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">벽체/천장 및 포인트 도장 분리 시 도장색상 추가</p>
            </div>
          </div>
        </div>

        {/* 2. 상판 상세 (재질 / 색상란 추가기능: 상판 색상 1, 상판 색상 2... / 쿡탑 타공) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-150">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">2</span>
              <span>상판 상세 (재질 / 상판 색상 2가지 이상 추가 / 쿡탑 타공)</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1) 상판 재질 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                1) 상판 재질 선택 *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['인조대리석', '세라믹', '엔지니어드스톤', '기타'] as const).map(mat => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => updateField('countertop', { ...form.countertop, material: mat })}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      form.countertop.material === mat
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
              {form.countertop.material === '기타' && (
                <input
                  type="text"
                  placeholder="기타 상판 재질 (예: 원목 집성목, 스테인리스 상판)"
                  value={form.countertop.customMaterial || ''}
                  onChange={e => updateField('countertop', { ...form.countertop, customMaterial: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-neutral-900"
                />
              )}
            </div>

            {/* 2) 상판 색상 (상판 색상 1, 상판 색상 2... 추가 기능) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-neutral-800">
                  2) 상판 색상 및 모델 (추가 가능)
                </label>
                <button
                  type="button"
                  onClick={handleAddCountertopColor}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ 상판 색상 추가</span>
                </button>
              </div>

              <div className="space-y-2">
                {countertopColorList.map((col, idx) => (
                  <div key={`ct-col-${idx}`} className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-semibold text-neutral-500 shrink-0 w-16">
                      상판 색상 {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`예: ${idx === 0 ? 'LX 하이막스 오로라 비앙코 12T (메인 싱크대)' : '라미남 세라믹 비앙코 12T (아일랜드)'}`}
                      value={col}
                      onChange={e => handleUpdateCountertopColor(idx, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500 font-medium"
                    />
                    {countertopColorList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCountertopColor(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="상판 색상 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-neutral-400">아일랜드와 벽면 싱크대 상판 색상 상이 시 추가</p>
            </div>

            {/* 3) 쿡탑 타공 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">
                3) 쿡탑 및 상판 타공 항목 *
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'induction', label: '인덕션' },
                  { key: 'gasRange', label: '가스레인지' },
                  { key: 'embeddedOutlet', label: '매립콘센트' }
                ].map(hole => {
                  const isChecked = form.countertop.cooktopHoles[hole.key as keyof typeof form.countertop.cooktopHoles] as boolean;
                  return (
                    <label
                      key={hole.key}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                        isChecked 
                          ? 'bg-amber-50 text-amber-900 border-amber-300' 
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          updateField('countertop', {
                            ...form.countertop,
                            cooktopHoles: {
                              ...form.countertop.cooktopHoles,
                              [hole.key]: e.target.checked
                            }
                          });
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>{hole.label}</span>
                    </label>
                  );
                })}
              </div>

              <input
                type="text"
                placeholder="타공 치수 메모 (예: 인덕션 560x480mm 타공, 우측 매립콘센트)"
                value={form.countertop.cooktopHoles.detailNotes}
                onChange={e => updateField('countertop', {
                  ...form.countertop,
                  cooktopHoles: {
                    ...form.countertop.cooktopHoles,
                    detailNotes: e.target.value
                  }
                })}
                className="w-full mt-1 px-3 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 3. 가전 품목 (세탁기(워시타워), 스타일러(에어드레서), 무선청소기 추가 & 각 항목별 추가 기능) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">3</span>
                <span>가전 품목 체크 및 빌트인 규격 (+ 워시타워·스타일러·무선청소기 및 항목 추가)</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                냉장고 키친핏 여부 및 대형/빌트인 가전 규격을 기입하고, 2대 이상일 경우 항목을 추가할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddCustomItem('appliances', 'customApplianceList', '가전')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 가전 항목 추가</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 세탁기(워시타워) - New requested */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.washerTower?.checked ? 'bg-indigo-50/40 border-indigo-300' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.washerTower?.checked ?? false}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      washerTower: {
                        checked: e.target.checked,
                        modelOrSize: form.appliances.washerTower?.modelOrSize || ''
                      }
                    })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>세탁기(워시타워) *</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">직렬/병렬</span>
              </div>
              <input
                type="text"
                placeholder="모델명/규격 (예: LG 트롬 워시타워 24kg+20kg)"
                value={form.appliances.washerTower?.modelOrSize || ''}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  washerTower: {
                    checked: true,
                    modelOrSize: e.target.value
                  }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-indigo-500 font-medium"
              />
            </div>

            {/* 스타일러(에어드레서) - New requested */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.styler?.checked ? 'bg-indigo-50/40 border-indigo-300' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.styler?.checked ?? false}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      styler: {
                        checked: e.target.checked,
                        modelOrSize: form.appliances.styler?.modelOrSize || ''
                      }
                    })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>스타일러(에어드레서) *</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">3벌/5벌형</span>
              </div>
              <input
                type="text"
                placeholder="모델명/장너비 (예: 비스포크 에어드레서 5벌형 600장)"
                value={form.appliances.styler?.modelOrSize || ''}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  styler: {
                    checked: true,
                    modelOrSize: e.target.value
                  }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-indigo-500 font-medium"
              />
            </div>

            {/* 무선청소기 - New requested */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.vacuumCleaner?.checked ? 'bg-indigo-50/40 border-indigo-300' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.vacuumCleaner?.checked ?? false}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      vacuumCleaner: {
                        checked: e.target.checked,
                        modelOrSize: form.appliances.vacuumCleaner?.modelOrSize || ''
                      }
                    })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>무선청소기 *</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">수납/콘센트</span>
              </div>
              <input
                type="text"
                placeholder="수납위치/모델 (예: 다이슨 V12 신발장 내 콘센트 매립)"
                value={form.appliances.vacuumCleaner?.modelOrSize || ''}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  vacuumCleaner: {
                    checked: true,
                    modelOrSize: e.target.value
                  }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-indigo-500 font-medium"
              />
            </div>

            {/* 식기세척기 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.dishwasher.checked ? 'bg-blue-50/40 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.dishwasher.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      dishwasher: { ...form.appliances.dishwasher, checked: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>식기세척기</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">12인/14인</span>
              </div>
              <input
                type="text"
                placeholder="모델명/용량 (예: 밀레 14인용 패널일체)"
                value={form.appliances.dishwasher.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  dishwasher: { ...form.appliances.dishwasher, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 로봇청소기 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.robotCleaner.checked ? 'bg-blue-50/40 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.robotCleaner.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      robotCleaner: { ...form.appliances.robotCleaner, checked: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>로봇청소기</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">직배수/장하부</span>
              </div>
              <input
                type="text"
                placeholder="수납위치/직배수 (예: 하부장 띄움 160mm)"
                value={form.appliances.robotCleaner.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  robotCleaner: { ...form.appliances.robotCleaner, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 오븐 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.oven.checked ? 'bg-blue-50/40 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.oven.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      oven: { ...form.appliances.oven, checked: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>오븐</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">빌트인</span>
              </div>
              <input
                type="text"
                placeholder="모델명/타공치수 (예: 비스포크 50L)"
                value={form.appliances.oven.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  oven: { ...form.appliances.oven, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 밥솥 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.riceCooker.checked ? 'bg-blue-50/40 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.riceCooker.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      riceCooker: { ...form.appliances.riceCooker, checked: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>밥솥</span>
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">인출장</span>
              </div>
              <input
                type="text"
                placeholder="인출레일장 유무 (예: 슬라이딩 댐핑장)"
                value={form.appliances.riceCooker.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  riceCooker: { ...form.appliances.riceCooker, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 전자레인지 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.microwave.checked ? 'bg-blue-50/40 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.microwave.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      microwave: { ...form.appliances.microwave, checked: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>전자레인지</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="모델명/수납공간 (예: 상부장 오픈장 매립)"
                value={form.appliances.microwave.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  microwave: { ...form.appliances.microwave, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* 냉장고 (키친핏 여부 *) */}
            <div className={`p-3.5 rounded-xl border transition-colors col-span-1 md:col-span-2 ${form.appliances.refrigerator.checked ? 'bg-purple-50/40 border-purple-300' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.refrigerator.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      refrigerator: { ...form.appliances.refrigerator, checked: e.target.checked }
                    })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>냉장고 (키친핏 여부 *)</span>
                </label>
                <div className="flex items-center gap-1">
                  {(['키친핏', '일반형(프리스탠딩)'] as const).map(fit => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => updateField('appliances', {
                        ...form.appliances,
                        refrigerator: { ...form.appliances.refrigerator, isKitchenFit: fit, checked: true }
                      })}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        form.appliances.refrigerator.isKitchenFit === fit
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="모델명 및 냉장고장 깊이/가로 치수 (예: 비스포크 4도어 키친핏 700mm 깊이)"
                value={form.appliances.refrigerator.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  refrigerator: { ...form.appliances.refrigerator, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-purple-500 font-medium"
              />
            </div>

            {/* 김치냉장고 (키친핏 여부 *) */}
            <div className={`p-3.5 rounded-xl border transition-colors col-span-1 md:col-span-2 ${form.appliances.kimchiFridge.checked ? 'bg-indigo-50/40 border-indigo-300' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.kimchiFridge.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      kimchiFridge: { ...form.appliances.kimchiFridge, checked: e.target.checked }
                    })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>김치냉장고 (키친핏 여부 *)</span>
                </label>
                <div className="flex items-center gap-1">
                  {(['키친핏', '일반형(프리스탠딩)'] as const).map(fit => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => updateField('appliances', {
                        ...form.appliances,
                        kimchiFridge: { ...form.appliances.kimchiFridge, isKitchenFit: fit, checked: true }
                      })}
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        (form.appliances.kimchiFridge.isKitchenFit || '미선택') === fit
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-neutral-600 border border-neutral-200'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                placeholder="모델명 및 규격 (예: 비스포크 1도어 키친핏 변온 김치냉장고)"
                value={form.appliances.kimchiFridge.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  kimchiFridge: { ...form.appliances.kimchiFridge, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-indigo-500 font-medium"
              />
            </div>

            {/* 시스템에어컨 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.appliances.systemAc.checked ? 'bg-emerald-50/40 border-emerald-300' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.appliances.systemAc.checked}
                    onChange={e => updateField('appliances', {
                      ...form.appliances,
                      systemAc: { ...form.appliances.systemAc, checked: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>시스템에어컨</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="예: LG 휘센 4실 단내림 간접등"
                value={form.appliances.systemAc.modelOrSize}
                onChange={e => updateField('appliances', {
                  ...form.appliances,
                  systemAc: { ...form.appliances.systemAc, modelOrSize: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-emerald-500"
              />
            </div>

            {/* 다중 추가된 가전 목록 */}
            {form.appliances.customApplianceList && form.appliances.customApplianceList.map((item, idx) => (
              <div key={item.id} className="p-3.5 rounded-xl border bg-indigo-50/20 border-indigo-200 relative group">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={e => handleUpdateCustomItem('appliances', 'customApplianceList', item.id, { checked: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateCustomItem('appliances', 'customApplianceList', item.id, { name: e.target.value })}
                      className="text-xs font-bold bg-transparent border-b border-indigo-300 focus:outline-none w-28"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomItem('appliances', 'customApplianceList', item.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="모델명 및 규격 메모"
                  value={item.value}
                  onChange={e => handleUpdateCustomItem('appliances', 'customApplianceList', item.id, { value: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-indigo-500 font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. 주방 기기류 (수전, 후드, 싱크볼, 쿡탑, 하드웨어, 기타 + 항목별 2개 이상 추가 기능) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">4</span>
                <span>주방 기기류 스펙 (수전 1/2, 후드 1/2 등 항목별 추가 기능)</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                주방 메인 수전/보조 수전, 아일랜드 후드 등 동일 항목이 2개 이상인 경우 추가할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddCustomItem('kitchenFixtures', 'customFixtureList', '주방기기')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 주방 기기 추가 (예: 수전 2, 후드 2)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'faucet', label: '수전 1', placeholder: '예: 더존테크 슈티에 니켈 폭포수전' },
              { key: 'hood', label: '후드 1', placeholder: '예: 하츠 아일랜드 스퀘어 후드 900' },
              { key: 'sinkBowl', label: '싱크볼 1', placeholder: '예: 백조 그랜드 860 사각싱크볼' },
              { key: 'cooktop', label: '쿡탑 1', placeholder: '예: 디트리쉬 인덕션 올파이어 3구' },
              { key: 'hardware', label: '하드웨어 1', placeholder: '예: 블룸(Blum) 오스트리아 댐퍼 경첩' },
              { key: 'etc', label: '기타 주방기기', placeholder: '예: 절수페달, 음식물처리기 등' },
            ].map(fixture => {
              const item = form.kitchenFixtures[fixture.key as keyof typeof form.kitchenFixtures] as { checked: boolean; spec: string };
              return (
                <div
                  key={fixture.key}
                  className={`p-3.5 rounded-xl border transition-colors ${item?.checked ? 'bg-amber-50/30 border-amber-200' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item?.checked || false}
                      onChange={e => updateField('kitchenFixtures', {
                        ...form.kitchenFixtures,
                        [fixture.key]: { ...item, checked: e.target.checked }
                      })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>{fixture.label}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={fixture.placeholder}
                    value={item?.spec || ''}
                    onChange={e => updateField('kitchenFixtures', {
                      ...form.kitchenFixtures,
                      [fixture.key]: { ...item, spec: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              );
            })}

            {/* 추가된 주방 기기류 */}
            {form.kitchenFixtures.customFixtureList && form.kitchenFixtures.customFixtureList.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border bg-amber-50/40 border-amber-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={e => handleUpdateCustomItem('kitchenFixtures', 'customFixtureList', item.id, { checked: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateCustomItem('kitchenFixtures', 'customFixtureList', item.id, { name: e.target.value })}
                      className="text-xs font-bold bg-transparent border-b border-amber-400 focus:outline-none w-28"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomItem('kitchenFixtures', 'customFixtureList', item.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="스펙 및 설치 위치 (예: 보조주방 단수 수전, 2구 하이라이트)"
                  value={item.value}
                  onChange={e => handleUpdateCustomItem('kitchenFixtures', 'customFixtureList', item.id, { value: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-amber-600 font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. 기타 기기류 & 악세서리 (수저함, 싱크라인, 식기건조대, 싯기, 매립콘센트 + 항목별 2개 이상 추가) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">5</span>
                <span>기타 기기류 & 악세서리 (각 항목별 2개 이상 추가 기능)</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                수저함, 매립콘센트 등 공간별로 2개 이상 필요한 부속을 추가할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddCustomItem('otherFixtures', 'customOtherList', '악세서리')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 악세서리 항목 추가</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { key: 'cutleryTray', label: '수저함 1', placeholder: '원목 600용 수저분리함' },
              { key: 'sinkLine', label: '싱크라인 1', placeholder: '롤매트 / 싱크선반' },
              { key: 'dishDryingRack', label: '식기건조대 1', placeholder: '상부장 매립형 와이어' },
              { key: 'dishWasherSub', label: '싯기 1', placeholder: '식기세척/채소 세척볼 바스켓' },
              { key: 'embeddedOutlet', label: '매립콘센트 1', placeholder: '아일랜드 팝업 무선충전 2구' },
            ].map(other => {
              const item = form.otherFixtures[other.key as keyof typeof form.otherFixtures] as { checked: boolean; spec: string };
              return (
                <div
                  key={other.key}
                  className={`p-3 rounded-xl border transition-colors ${item?.checked ? 'bg-blue-50/30 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 mb-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item?.checked || false}
                      onChange={e => updateField('otherFixtures', {
                        ...form.otherFixtures,
                        [other.key]: { ...item, checked: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{other.label}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={other.placeholder}
                    value={item?.spec || ''}
                    onChange={e => updateField('otherFixtures', {
                      ...form.otherFixtures,
                      [other.key]: { ...item, spec: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              );
            })}

            {/* 추가된 기타 악세서리 */}
            {form.otherFixtures.customOtherList && form.otherFixtures.customOtherList.map(item => (
              <div key={item.id} className="p-3 rounded-xl border bg-blue-50/40 border-blue-300">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={e => handleUpdateCustomItem('otherFixtures', 'customOtherList', item.id, { checked: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateCustomItem('otherFixtures', 'customOtherList', item.id, { name: e.target.value })}
                      className="text-xs font-bold bg-transparent border-b border-blue-400 focus:outline-none w-24"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomItem('otherFixtures', 'customOtherList', item.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="규격/사양 기입"
                  value={item.value}
                  onChange={e => handleUpdateCustomItem('otherFixtures', 'customOtherList', item.id, { value: e.target.value })}
                  className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 6. 젠다이, 오픈장, 조명, 거울도어 마감 (각 항목별 2개 이상 추가 기능) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">6</span>
                <span>젠다이 · 오픈장 · 조명 · 거울도어 마감 (각 항목별 2개 이상 추가 기능)</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                안방/거실/공용 공간별로 젠다이, 오픈장, 라인조명, 거울도어 항목을 추가 기입할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddCustomItem('ledge', 'customLedgeList', '젠다이')}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200"
              >
                + 젠다이 추가
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomItem('openCabinet', 'customOpenCabinetList', '오픈장')}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200"
              >
                + 오픈장 추가
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomItem('lighting', 'customLightingList', '조명')}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200"
              >
                + 조명 추가
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomItem('mirrorDoor', 'customMirrorDoorList', '거울도어')}
                className="px-2.5 py-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-200"
              >
                + 거울도어 추가
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 젠다이 (외욕실 / 내욕실) */}
            <div className="space-y-3 p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60">
              <span className="block text-xs font-bold text-neutral-900">
                젠다이 (선반 시공)
              </span>
              
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ledge.outerBath.checked}
                      onChange={e => updateField('ledge', {
                        ...form.ledge,
                        outerBath: { ...form.ledge.outerBath, checked: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>외욕실 (공용욕실)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 조적 젠다이 120mm 졸리컷"
                    value={form.ledge.outerBath.spec}
                    onChange={e => updateField('ledge', {
                      ...form.ledge,
                      outerBath: { ...form.ledge.outerBath, spec: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.ledge.innerBath.checked}
                      onChange={e => updateField('ledge', {
                        ...form.ledge,
                        innerBath: { ...form.ledge.innerBath, checked: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>내욕실 (안방욕실)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="예: 인조대리석 상판 젠다이 100mm"
                    value={form.ledge.innerBath.spec}
                    onChange={e => updateField('ledge', {
                      ...form.ledge,
                      innerBath: { ...form.ledge.innerBath, spec: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>

                {/* 추가된 젠다이 목록 */}
                {form.ledge.customLedgeList && form.ledge.customLedgeList.map(item => (
                  <div key={item.id} className="pt-2 border-t border-neutral-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={e => handleUpdateCustomItem('ledge', 'customLedgeList', item.id, { checked: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateCustomItem('ledge', 'customLedgeList', item.id, { name: e.target.value })}
                          className="text-xs font-bold bg-transparent border-b border-neutral-300 w-24 focus:outline-none"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomItem('ledge', 'customLedgeList', item.id)}
                        className="text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="규격 및 마감 방식"
                      value={item.value}
                      onChange={e => handleUpdateCustomItem('ledge', 'customLedgeList', item.id, { value: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 오픈장 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.openCabinet.checked ? 'bg-amber-50/40 border-amber-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.openCabinet.checked}
                    onChange={e => updateField('openCabinet', { ...form.openCabinet, checked: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>오픈장 1 (홈바/진열장)</span>
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="위치, 규격 및 마감재 (예: 주방 커피바 원목오크 오픈장)"
                value={form.openCabinet.spec}
                onChange={e => updateField('openCabinet', { ...form.openCabinet, spec: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />

              {/* 추가된 오픈장 목록 */}
              {form.openCabinet.customOpenCabinetList && form.openCabinet.customOpenCabinetList.map(item => (
                <div key={item.id} className="mt-2 pt-2 border-t border-amber-200/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem('openCabinet', 'customOpenCabinetList', item.id)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="추가 오픈장 사양"
                    value={item.value}
                    onChange={e => handleUpdateCustomItem('openCabinet', 'customOpenCabinetList', item.id, { value: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* 조명: 8mm 매립 / 18mm 노출 */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
              <span className="block text-xs font-bold text-neutral-900">
                조명 방식 (8mm 매립 / 18mm 노출) *
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['8mm 매립', '18mm 노출'] as const).map(lt => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => updateField('lighting', {
                      ...form.lighting,
                      type: lt,
                      embedded8mm: lt === '8mm 매립',
                      exposed18mm: lt === '18mm 노출'
                    })}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      form.lighting.type === lt
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {lt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="조명 상세 메모 (예: 상부장 하부 매립바 3000K)"
                value={form.lighting.notes}
                onChange={e => updateField('lighting', { ...form.lighting, notes: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />

              {/* 추가된 조명 목록 */}
              {form.lighting.customLightingList && form.lighting.customLightingList.map(item => (
                <div key={item.id} className="pt-2 border-t border-neutral-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem('lighting', 'customLightingList', item.id)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="추가 조명 스펙 (예: 신발장 하부 T5 4000K)"
                    value={item.value}
                    onChange={e => handleUpdateCustomItem('lighting', 'customLightingList', item.id, { value: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* 거울도어 */}
            <div className={`p-3.5 rounded-xl border transition-colors ${form.mirrorDoor.checked ? 'bg-indigo-50/40 border-indigo-200' : 'bg-neutral-50 border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.mirrorDoor.checked}
                    onChange={e => updateField('mirrorDoor', { ...form.mirrorDoor, checked: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>거울도어 1 (욕실장/신발장)</span>
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="규격 및 사양 (예: 욕실 슬라이딩 은경도어)"
                value={form.mirrorDoor.spec}
                onChange={e => updateField('mirrorDoor', { ...form.mirrorDoor, spec: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
              />

              {/* 추가된 거울도어 목록 */}
              {form.mirrorDoor.customMirrorDoorList && form.mirrorDoor.customMirrorDoorList.map(item => (
                <div key={item.id} className="mt-2 pt-2 border-t border-indigo-200/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem('mirrorDoor', 'customMirrorDoorList', item.id)}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="추가 거울도어 사양 (예: 신발장 전신거울 1도어)"
                    value={item.value}
                    onChange={e => handleUpdateCustomItem('mirrorDoor', 'customMirrorDoorList', item.id, { value: e.target.value })}
                    className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7. 가구 리폼 및 교체 품목 (도어, 서랍레일, 경첩, 기타 + 항목별 추가 기능) */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">7</span>
                <span>가구 리폼 및 교체 품목 (각 항목별 추가 기능)</span>
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">
                기존 싱크대/붙박이장 리폼 부자재(도어, 레일, 경첩)를 교체별로 추가 등록합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleAddCustomItem('replacementItems', 'customReplacementList', '교체품목')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 교체 품목 추가 (예: 서랍레일 2, 경첩 2)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { key: 'door', label: '도어 1', placeholder: '예: 상/하부장 전체 도어 친환경 PET 교체' },
              { key: 'drawerRail', label: '서랍레일 1', placeholder: '예: 댐핑 소프트클로징 400 레일 4조' },
              { key: 'hinge', label: '경첩 1', placeholder: '예: 110도 댐퍼 일체형 경첩 24개' },
              { key: 'etc', label: '기타 부자재', placeholder: '예: 손잡이 황동 찬넬, 매립 알루미늄 바' },
            ].map(rep => {
              const item = form.replacementItems[rep.key as keyof typeof form.replacementItems] as { checked: boolean; spec: string };
              return (
                <div
                  key={rep.key}
                  className={`p-3.5 rounded-xl border transition-colors ${item?.checked ? 'bg-blue-50/40 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}
                >
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item?.checked || false}
                      onChange={e => updateField('replacementItems', {
                        ...form.replacementItems,
                        [rep.key]: { ...item, checked: e.target.checked }
                      })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{rep.label} 교체</span>
                  </label>
                  <input
                    type="text"
                    placeholder={rep.placeholder}
                    value={item?.spec || ''}
                    onChange={e => updateField('replacementItems', {
                      ...form.replacementItems,
                      [rep.key]: { ...item, spec: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500"
                  />
                </div>
              );
            })}

            {/* 추가된 교체 품목 */}
            {form.replacementItems.customReplacementList && form.replacementItems.customReplacementList.map(item => (
              <div key={item.id} className="p-3.5 rounded-xl border bg-blue-50/40 border-blue-300">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-xs text-neutral-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={e => handleUpdateCustomItem('replacementItems', 'customReplacementList', item.id, { checked: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => handleUpdateCustomItem('replacementItems', 'customReplacementList', item.id, { name: e.target.value })}
                      className="text-xs font-bold bg-transparent border-b border-blue-400 focus:outline-none w-28"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomItem('replacementItems', 'customReplacementList', item.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="규격 및 교체 내역"
                  value={item.value}
                  onChange={e => handleUpdateCustomItem('replacementItems', 'customReplacementList', item.id, { value: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-blue-500 font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 8. 기타 특이 사항 */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-150">
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center">8</span>
              <span>현장 기타 특이 사항 및 시공 주의점</span>
            </h4>
          </div>

          <textarea
            rows={4}
            placeholder="현장 실측 시 파악된 추가 특이사항 (예: 슬라브 배관 간섭, 차단기 분전함 용량 부족, 엘리베이터 양중 가능 크기, 관리실 신고 소음 공사 가능 시간 등)"
            value={form.specialNotes}
            onChange={e => updateField('specialNotes', e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-lg focus:outline-blue-500 leading-relaxed font-sans"
          />
        </div>
      </div>
    </div>
  );
};
