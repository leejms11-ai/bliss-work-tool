import React, { useState } from 'react';
import { 
  Columns, 
  PenTool, 
  FileCheck, 
  Upload, 
  Save, 
  Download, 
  RotateCcw, 
  Maximize2, 
  Plus, 
  Trash2, 
  Check, 
  FileImage, 
  Layers,
  Sparkles,
  Info,
  Images,
  Edit2
} from 'lucide-react';
import { InteriorProject, OfficialBlueprint, RoughDrawingData, DrawingSheet } from '../types/project';
import { DrawingCanvas } from './DrawingCanvas';

interface UnifiedDrawingsViewProps {
  project: InteriorProject;
  onUpdateRoughDrawing: (data: RoughDrawingData) => void;
  onUpdateBlueprints: (blueprints: OfficialBlueprint[]) => void;
  onToast: (msg: string) => void;
}

export const UnifiedDrawingsView: React.FC<UnifiedDrawingsViewProps> = ({
  project,
  onUpdateRoughDrawing,
  onUpdateBlueprints,
  onToast
}) => {
  // Screen View Mode: 'dual' (나란히 보기), 'rough' (가도면 집중), 'official' (본도면 집중)
  const [viewMode, setViewMode] = useState<'dual' | 'rough' | 'official'>('dual');

  /* ================= 1. 가도면 다중 시트 / 사진 관리 ================= */
  // Initialize rough sheets from project
  const initialRoughSheets: DrawingSheet[] = (() => {
    if (project.roughDrawing.sheets && project.roughDrawing.sheets.length > 0) {
      return project.roughDrawing.sheets;
    }
    if (project.roughDrawing.imageDataUrl) {
      return [{
        id: 'sheet-init',
        title: '현장 초기 손도면',
        imageDataUrl: project.roughDrawing.imageDataUrl,
        uploadedAt: project.roughDrawing.uploadedAt || '2026-10-22',
        notes: project.roughDrawing.notes || ''
      }];
    }
    return [];
  })();

  const [roughSheets, setRoughSheets] = useState<DrawingSheet[]>(initialRoughSheets);
  const [activeRoughSheetId, setActiveRoughSheetId] = useState<string>(
    initialRoughSheets.length > 0 ? initialRoughSheets[0].id : ''
  );

  const activeRoughSheet = roughSheets.find(s => s.id === activeRoughSheetId) || roughSheets[0] || null;

  const [roughNotes, setRoughNotes] = useState<string>(project.roughDrawing.notes || '');
  const [roughSummary, setRoughSummary] = useState<string>(project.roughDrawing.measurementsSummary || '');

  // 1-A. 사진 여러 장 한꺼번에 불러오기 (가도면 Batch Upload)
  const handleRoughBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readPromises = fileList.map(file => {
      return new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
          resolve({
            name: file.name.replace(/\.[^/.]+$/, ''),
            dataUrl: ev.target?.result as string
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(readPromises);
      const newSheets: DrawingSheet[] = results.map((res, idx) => ({
        id: `sheet-${Date.now()}-${idx}`,
        title: res.name || `손도면/사진 ${roughSheets.length + idx + 1}`,
        imageDataUrl: res.dataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        notes: ''
      }));

      const updatedSheets = [...newSheets, ...roughSheets];
      setRoughSheets(updatedSheets);
      setActiveRoughSheetId(newSheets[0].id); // Automatically load first imported image

      const updatedRough: RoughDrawingData = {
        imageDataUrl: newSheets[0].imageDataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        notes: roughNotes,
        measurementsSummary: roughSummary,
        sheets: updatedSheets
      };
      onUpdateRoughDrawing(updatedRough);
      onToast(`사진 ${results.length}장을 한꺼번에 불러왔습니다. 첫 번째 사진이 캔버스에 로드되었습니다.`);
    } catch (err) {
      console.error(err);
      alert('사진을 불러오는 중 오류가 발생했습니다.');
    }

    // Reset input value to allow selecting same files again if needed
    e.target.value = '';
  };

  // 1-B. 가도면 사진 선택 시 캔버스에 로드
  const handleSelectRoughSheet = (sheet: DrawingSheet) => {
    setActiveRoughSheetId(sheet.id);
    onToast(`'${sheet.title}' 사진이 캔버스에 로드되었습니다.`);
  };

  // 1-C. 선택된 가도면 캔버스 수정 저장
  const handleSaveRoughCanvas = (dataUrl: string) => {
    if (activeRoughSheet) {
      const updatedSheets = roughSheets.map(s => 
        s.id === activeRoughSheet.id ? { ...s, imageDataUrl: dataUrl } : s
      );
      setRoughSheets(updatedSheets);

      const updatedRough: RoughDrawingData = {
        imageDataUrl: dataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        notes: roughNotes,
        measurementsSummary: roughSummary,
        sheets: updatedSheets
      };
      onUpdateRoughDrawing(updatedRough);
      onToast(`'${activeRoughSheet.title}' 수정 내용이 저장되었습니다.`);
    } else {
      // Create new sheet
      const newSheet: DrawingSheet = {
        id: `sheet-${Date.now()}`,
        title: '새 스케치 도면',
        imageDataUrl: dataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        notes: ''
      };
      const updatedSheets = [newSheet, ...roughSheets];
      setRoughSheets(updatedSheets);
      setActiveRoughSheetId(newSheet.id);

      const updatedRough: RoughDrawingData = {
        imageDataUrl: dataUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        notes: roughNotes,
        measurementsSummary: roughSummary,
        sheets: updatedSheets
      };
      onUpdateRoughDrawing(updatedRough);
      onToast('새 가도면이 저장되었습니다.');
    }
  };

  // 1-D. 가도면 시트 삭제
  const handleDeleteRoughSheet = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remaining = roughSheets.filter(s => s.id !== id);
    setRoughSheets(remaining);

    const nextActive = remaining.length > 0 ? remaining[0] : null;
    setActiveRoughSheetId(nextActive ? nextActive.id : '');

    const updatedRough: RoughDrawingData = {
      imageDataUrl: nextActive ? nextActive.imageDataUrl : null,
      uploadedAt: new Date().toISOString().split('T')[0],
      notes: roughNotes,
      measurementsSummary: roughSummary,
      sheets: remaining
    };
    onUpdateRoughDrawing(updatedRough);
    onToast('손도면/사진이 정상적으로 삭제되었습니다.');
  };

  // 1-E. 가도면 시트 이름 수정
  const handleRenameRoughSheet = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = window.prompt('사진/손도면 제목을 입력하세요:', currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle === currentTitle) return;

    const updatedSheets = roughSheets.map(s => 
      s.id === id ? { ...s, title: newTitle.trim() } : s
    );
    setRoughSheets(updatedSheets);
    onUpdateRoughDrawing({
      ...project.roughDrawing,
      sheets: updatedSheets
    });
    onToast('제목이 변경되었습니다.');
  };

  const handleSaveRoughNotes = () => {
    const updatedRough: RoughDrawingData = {
      ...project.roughDrawing,
      imageDataUrl: activeRoughSheet ? activeRoughSheet.imageDataUrl : project.roughDrawing.imageDataUrl,
      notes: roughNotes,
      measurementsSummary: roughSummary,
      sheets: roughSheets
    };
    onUpdateRoughDrawing(updatedRough);
    onToast('가도면 메모 및 치수 요약이 저장되었습니다.');
  };

  /* ================= 2. 본도면 다중 도면 / 사진 관리 ================= */
  const blueprints = project.officialBlueprints || [];
  const [selectedBpId, setSelectedBpId] = useState<string>(
    blueprints.length > 0 ? blueprints[0].id : ''
  );
  const selectedBlueprint = blueprints.find(b => b.id === selectedBpId) || blueprints[0] || null;

  const [bpCanvasImage, setBpCanvasImage] = useState<string | null>(
    selectedBlueprint ? selectedBlueprint.fileUrl : null
  );
  const [bpTitle, setBpTitle] = useState<string>(selectedBlueprint?.title || '최종 평면도 v1.0');
  const [bpVersion, setBpVersion] = useState<string>(selectedBlueprint?.version || 'v1.0');
  const [bpType, setBpType] = useState<OfficialBlueprint['type']>(selectedBlueprint?.type || '평면도');
  const [bpRemarks, setBpRemarks] = useState<string>(selectedBlueprint?.remarks || '');

  // 2-A. 본도면 사진 여러 장 한꺼번에 불러오기 (Blueprints Batch Upload)
  const handleBlueprintBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const readPromises = fileList.map(file => {
      return new Promise<{ name: string; dataUrl: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
          resolve({
            name: file.name.replace(/\.[^/.]+$/, ''),
            dataUrl: ev.target?.result as string
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const results = await Promise.all(readPromises);
      const newBlueprints: OfficialBlueprint[] = results.map((res, idx) => ({
        id: `bp-${Date.now()}-${idx}`,
        title: res.name || `본도면 ${blueprints.length + idx + 1}`,
        version: 'v1.0',
        type: '평면도',
        fileUrl: res.dataUrl,
        updatedDate: new Date().toISOString().split('T')[0],
        remarks: '일괄 등록 도면'
      }));

      const updated = [...newBlueprints, ...blueprints];
      onUpdateBlueprints(updated);
      handleSelectBlueprint(newBlueprints[0]); // Load first newly imported blueprint into canvas
      onToast(`본도면 ${results.length}장을 한꺼번에 불러왔습니다. 첫 번째 도면이 캔버스에 로드되었습니다.`);
    } catch (err) {
      console.error(err);
      alert('도면 파일을 불러오는 중 오류가 발생했습니다.');
    }

    e.target.value = '';
  };

  // 2-B. 본도면 선택 시 캔버스에 로드
  const handleSelectBlueprint = (bp: OfficialBlueprint) => {
    setSelectedBpId(bp.id);
    setBpCanvasImage(bp.fileUrl);
    setBpTitle(bp.title);
    setBpVersion(bp.version);
    setBpType(bp.type);
    setBpRemarks(bp.remarks);
    onToast(`'${bp.title}' 도면을 캔버스로 불러왔습니다.`);
  };

  // 2-C. 선택된 본도면 수정 내용 저장
  const handleSaveCurrentBlueprint = (dataUrl: string) => {
    setBpCanvasImage(dataUrl);

    if (selectedBlueprint) {
      const updatedList = blueprints.map(b => 
        b.id === selectedBlueprint.id 
          ? {
              ...b,
              title: bpTitle,
              version: bpVersion,
              type: bpType,
              remarks: bpRemarks,
              fileUrl: dataUrl,
              updatedDate: new Date().toISOString().split('T')[0]
            }
          : b
      );
      onUpdateBlueprints(updatedList);
      onToast(`'${bpTitle}' 본도면 수정 내용이 저장되었습니다.`);
    } else {
      const newBp: OfficialBlueprint = {
        id: `bp-${Date.now()}`,
        title: bpTitle || '신규 등록 도면',
        version: bpVersion || 'v1.0',
        type: bpType || '평면도',
        fileUrl: dataUrl,
        updatedDate: new Date().toISOString().split('T')[0],
        remarks: bpRemarks
      };
      onUpdateBlueprints([...blueprints, newBp]);
      setSelectedBpId(newBp.id);
      onToast('새 본도면으로 저장되었습니다.');
    }
  };

  // 2-D. 새 버전으로 추가 저장
  const handleSaveAsNewRevision = () => {
    if (!bpCanvasImage) {
      alert('도면 캔버스에 내용이 없습니다.');
      return;
    }
    const nextVer = bpVersion.startsWith('v') 
      ? `v${(parseFloat(bpVersion.replace('v', '')) + 0.1).toFixed(1)}`
      : 'v1.1';

    const newBp: OfficialBlueprint = {
      id: `bp-${Date.now()}`,
      title: `${bpTitle} (수정본)`,
      version: nextVer,
      type: bpType,
      fileUrl: bpCanvasImage,
      updatedDate: new Date().toISOString().split('T')[0],
      remarks: `${bpRemarks ? bpRemarks + ' | ' : ''}현장 캔버스 수정 반영본`
    };

    onUpdateBlueprints([...blueprints, newBp]);
    setSelectedBpId(newBp.id);
    setBpTitle(newBp.title);
    setBpVersion(newBp.version);
    onToast(`새 버전 (${newBp.version})으로 본도면이 등록되었습니다.`);
  };

  const handleDeleteBlueprint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remaining = blueprints.filter(b => b.id !== id);
    onUpdateBlueprints(remaining);
    if (remaining.length > 0) {
      handleSelectBlueprint(remaining[0]);
    } else {
      setSelectedBpId('');
      setBpCanvasImage(null);
    }
    onToast('본도면이 정상적으로 삭제되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Layout Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span>도면 통합 관리 (가도면 & 본도면)</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              사진 여러 장 일괄 불러오기 & 선택 수정
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            한 화면에서 가도면(답사 사진/손스케치)과 본도면(CAD 설계도)을 <strong>사진 여러 장 한꺼번에 불러온 뒤</strong>, 원하는 사진을 선택하여 캔버스에서 직접 치수·마킹을 수정합니다.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('dual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'dual'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-blue-600" />
            <span>나란히 비교 입력</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('rough')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'rough'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-amber-600" />
            <span>가도면만 크게 보기</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('official')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'official'
                ? 'bg-white text-neutral-900 shadow-xs font-bold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>본도면만 크게 보기</span>
          </button>
        </div>
      </div>

      {/* Main Dual / Unified Workspace Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'dual' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'
      }`}>

        {/* ================= PANEL 1: 가도면 다중 사진 불러오기 & 선택 수정 ================= */}
        {(viewMode === 'dual' || viewMode === 'rough') && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Panel Top Header with Batch Upload Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <span>가도면 (손스케치 & 실측 사진)</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold">
                        총 {roughSheets.length}장
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      현장 답사 사진 및 손스케치를 여러 장 등록하고, 선택한 사진 위에 치수와 벽체를 수정합니다.
                    </p>
                  </div>
                </div>

                {/* Batch Multi-file Upload Button */}
                <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 cursor-pointer transition-colors shrink-0 shadow-2xs">
                  <Images className="w-3.5 h-3.5 text-amber-600" />
                  <span>사진 여러 장 불러오기</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleRoughBatchUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 1-A. 불러온 사진 목록 갤러리 (Thumbnail Carousel / Cards) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1">
                    <FileImage className="w-3.5 h-3.5 text-amber-600" />
                    <span>불러온 사진 목록 (클릭하여 캔버스에서 수정):</span>
                  </span>
                  {activeRoughSheet && (
                    <span className="text-[11px] font-semibold text-amber-700">
                      현재 선택: {activeRoughSheet.title}
                    </span>
                  )}
                </div>

                {roughSheets.length > 0 ? (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {roughSheets.map(sheet => {
                      const isActive = sheet.id === activeRoughSheetId;
                      return (
                        <div
                          key={sheet.id}
                          onClick={() => handleSelectRoughSheet(sheet)}
                          className={`relative group shrink-0 w-36 bg-white rounded-xl border-2 p-1.5 cursor-pointer transition-all ${
                            isActive
                              ? 'border-amber-500 shadow-sm bg-amber-50/20'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {/* Thumbnail preview */}
                          <div className="aspect-4/3 w-full bg-neutral-100 rounded-lg overflow-hidden relative">
                            <img
                              src={sheet.imageDataUrl}
                              alt={sheet.title}
                              className="w-full h-full object-cover"
                            />
                            {isActive && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-600 text-white text-[9px] font-bold">
                                수정중
                              </div>
                            )}
                            {/* Top Right Quick Delete Button on Thumbnail */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteRoughSheet(sheet.id, e)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-white/90 hover:bg-red-600 text-neutral-600 hover:text-white shadow-xs transition-colors z-10"
                              title="사진 삭제"
                              aria-label="사진 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Title & Controls */}
                          <div className="mt-1.5 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-neutral-900 truncate block max-w-[80px]" title={sheet.title}>
                              {sheet.title}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleRenameRoughSheet(sheet.id, sheet.title, e)}
                                className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                                title="이름 변경"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteRoughSheet(sheet.id, e)}
                                className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="사진 삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-300 text-center bg-neutral-50/60">
                    <p className="text-xs text-neutral-500">
                      등록된 사진이 없습니다. 상단 <strong>'사진 여러 장 불러오기'</strong> 버튼을 눌러 현장 답사 사진이나 손스케치를 불러오세요.
                    </p>
                  </div>
                )}
              </div>

              {/* 1-B. 선택된 사진을 위한 캔버스 (간단한 수정 작업 가능) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <span>
                      ✏️ 캔버스 수정 작업: {activeRoughSheet ? activeRoughSheet.title : '기본 빈 캔버스'}
                    </span>
                    {activeRoughSheet && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRoughSheet(activeRoughSheet.id)}
                        className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                        title="현재 로드된 손도면/사진 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>선택 도면 삭제</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    * 펜, 직선, 사각형, 텍스트 치수를 자유롭게 마킹 후 '도면에 반영하기'를 누르면 저장됩니다.
                  </span>
                </div>

                <DrawingCanvas
                  initialImage={activeRoughSheet ? activeRoughSheet.imageDataUrl : null}
                  onSave={(dataUrl) => handleSaveRoughCanvas(dataUrl)}
                />
              </div>

              {/* Rough Drawing Notes & Dimensions summary */}
              <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    가도면 전체 치수 및 면적 요약
                  </label>
                  <input
                    type="text"
                    placeholder="예: 실평수 34평 / 천장고 2,620mm / 거실 가로 5,600 x 4,800mm"
                    value={roughSummary}
                    onChange={(e) => setRoughSummary(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    현장 초기 특이사항 및 철거 메모
                  </label>
                  <textarea
                    rows={2}
                    placeholder="예: 주방 벽체 비내력벽 확인, 분전함 차단기 8회로 증설 필요, 누수 흔적 없음"
                    value={roughNotes}
                    onChange={(e) => setRoughNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-amber-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveRoughNotes}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>가도면 메모 저장</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PANEL 2: 본도면 다중 사진 불러오기 & 선택 수정 ================= */}
        {(viewMode === 'dual' || viewMode === 'official') && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Panel Top Header with Batch Upload Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-150">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                      <span>본도면 (실시설계 CAD & 확정도면)</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold">
                        총 {blueprints.length}장
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      CAD 도면 사진을 여러 장 불러온 뒤, 선택한 도면 위에 시공 변경점과 치수를 직접 마킹·수정합니다.
                    </p>
                  </div>
                </div>

                {/* Batch Multi-file Upload Button for Blueprints */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 cursor-pointer transition-colors shrink-0 shadow-2xs">
                    <Images className="w-3.5 h-3.5 text-indigo-600" />
                    <span>도면 여러 장 불러오기</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBlueprintBatchUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleSaveAsNewRevision}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 transition-colors"
                    title="현재 마킹 내용을 새 버전으로 추가 저장"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>새 버전 생성</span>
                  </button>
                </div>
              </div>

              {/* 2-A. 불러온 본도면 목록 갤러리 (Thumbnail Carousel / Cards) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1">
                    <FileImage className="w-3.5 h-3.5 text-indigo-600" />
                    <span>불러온 본도면 목록 (클릭하여 캔버스에서 수정):</span>
                  </span>
                  {selectedBlueprint && (
                    <span className="text-[11px] font-semibold text-indigo-700 font-mono">
                      현재 선택: {selectedBlueprint.title} ({selectedBlueprint.version})
                    </span>
                  )}
                </div>

                {blueprints.length > 0 ? (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {blueprints.map(bp => {
                      const isActive = bp.id === selectedBpId;
                      return (
                        <div
                          key={bp.id}
                          onClick={() => handleSelectBlueprint(bp)}
                          className={`relative group shrink-0 w-36 bg-white rounded-xl border-2 p-1.5 cursor-pointer transition-all ${
                            isActive
                              ? 'border-indigo-600 shadow-sm bg-indigo-50/20'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {/* Thumbnail preview */}
                          <div className="aspect-4/3 w-full bg-neutral-100 rounded-lg overflow-hidden relative">
                            <img
                              src={bp.fileUrl}
                              alt={bp.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 flex items-center gap-1">
                              {isActive && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
                                  수정중
                                </span>
                              )}
                              <span className="px-1 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono font-bold">
                                {bp.version}
                              </span>
                            </div>
                            {/* Top Right Quick Delete Button on Blueprint Thumbnail */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBlueprint(bp.id, e)}
                              className="absolute top-1 right-1 p-1 rounded-md bg-white/90 hover:bg-red-600 text-neutral-600 hover:text-white shadow-xs transition-colors z-10"
                              title="본도면 삭제"
                              aria-label="본도면 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Title & Controls */}
                          <div className="mt-1.5 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-neutral-900 truncate block max-w-[90px]" title={bp.title}>
                              {bp.title}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBlueprint(bp.id, e)}
                              className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="도면 삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-300 text-center bg-neutral-50/60">
                    <p className="text-xs text-neutral-500">
                      등록된 본도면이 없습니다. 상단 <strong>'도면 여러 장 불러오기'</strong> 버튼을 눌러 CAD 도면 파일들을 불러오세요.
                    </p>
                  </div>
                )}
              </div>

              {/* 2-B. 선택된 본도면 캔버스 (실시간 수정 & 마킹 가능) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <span>✏️ 캔버스 수정 작업: {bpTitle}</span>
                    <span className="font-mono px-2 py-0.2 rounded bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                      {bpVersion}
                    </span>
                    {selectedBlueprint && (
                      <button
                        type="button"
                        onClick={() => handleDeleteBlueprint(selectedBlueprint.id)}
                        className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                        title="현재 로드된 본도면 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>선택 도면 삭제</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    * 캔버스 우측 상단 '도면에 반영하기'를 누르면 현재 도면이 갱신됩니다.
                  </span>
                </div>

                <DrawingCanvas
                  initialImage={bpCanvasImage}
                  onSave={(dataUrl) => handleSaveCurrentBlueprint(dataUrl)}
                />
              </div>

              {/* Blueprint Metadata & Revision Notes */}
              <div className="space-y-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      도면명
                    </label>
                    <input
                      type="text"
                      value={bpTitle}
                      onChange={(e) => setBpTitle(e.target.value)}
                      placeholder="예: 최종 실시설계 평면도"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-indigo-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      도면 구분
                    </label>
                    <select
                      value={bpType}
                      onChange={(e) => setBpType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-indigo-500"
                    >
                      <option value="평면도">평면도</option>
                      <option value="입면도">입면도</option>
                      <option value="천장조명도">천장조명도</option>
                      <option value="설비배선도">설비배선도</option>
                      <option value="가구상세도">가구상세도</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 mb-1">
                      버전
                    </label>
                    <input
                      type="text"
                      value={bpVersion}
                      onChange={(e) => setBpVersion(e.target.value)}
                      placeholder="예: v2.1"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    도면 수정사항 및 시공 반영 메모
                  </label>
                  <textarea
                    rows={2}
                    placeholder="예: 아일랜드 씽크볼 위치 좌측 200mm 이동 타공, COB 매립등 3회로 분리 반영"
                    value={bpRemarks}
                    onChange={(e) => setBpRemarks(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-400">
                    * 캔버스 우측 상단 '도면에 반영하기'를 누르면 현재 도면 파일이 즉시 갱신됩니다.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAsNewRevision}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>새 버전 생성</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (bpCanvasImage) handleSaveCurrentBlueprint(bpCanvasImage);
                        else alert('도면 이미지가 없습니다.');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>현재 도면 저장</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Instructions Footer */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 text-xs text-neutral-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>도면 일괄 불러오기 & 선택 수정 안내:</strong> `사진 여러 장 불러오기` 버튼으로 답사 사진이나 CAD 도면 파일들을 여러 개 동시에 선택하여 등록할 수 있으며, 썸네일 카드를 클릭하면 즉시 캔버스에 로드되어 펜/치수선/사각형/텍스트 도구로 자유롭게 마킹하고 저장할 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
};
