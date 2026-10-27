import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Maximize2, 
  Check, 
  X, 
  Calendar, 
  FileText, 
  Filter, 
  Images, 
  ArrowRight,
  Info
} from 'lucide-react';
import { InteriorProject, CompletionPhoto } from '../types/project';

interface ConstructionPhotosManagerProps {
  project: InteriorProject;
  onUpdatePhotos: (photos: CompletionPhoto[]) => void;
  onToast: (msg: string) => void;
}

export const ConstructionPhotosManager: React.FC<ConstructionPhotosManagerProps> = ({
  project,
  onUpdatePhotos,
  onToast
}) => {
  // Filter: '전체' | '시공 전' | '시공 후'
  const [phaseFilter, setPhaseFilter] = useState<'전체' | '시공 전' | '시공 후'>('전체');

  // Normalize photo phase to 2 categories: '시공 전' / '시공 후'
  const normalizePhase = (phase: string): '시공 전' | '시공 후' => {
    if (phase === '시공전' || phase === '시공 전') return '시공 전';
    return '시공 후'; // '시공완료', '시공중', '시공 후' defaults to '시공 후'
  };

  const photos: CompletionPhoto[] = useMemo(() => {
    return (project.completionPhotos || []).map(p => ({
      ...p,
      phase: normalizePhase(p.phase)
    }));
  }, [project.completionPhotos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (phaseFilter === '전체') return photos;
    return photos.filter(p => normalizePhase(p.phase) === phaseFilter);
  }, [photos, phaseFilter]);

  // Counts
  const beforeCount = useMemo(() => photos.filter(p => normalizePhase(p.phase) === '시공 전').length, [photos]);
  const afterCount = useMemo(() => photos.filter(p => normalizePhase(p.phase) === '시공 후').length, [photos]);

  /* ================= 1. 사진 여러 장 일괄 등록 (Batch Multi-Photo Upload) ================= */
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);
  const [batchPhase, setBatchPhase] = useState<'시공 전' | '시공 후'>('시공 후');
  const [stagedFiles, setStagedFiles] = useState<{ name: string; dataUrl: string; caption: string }[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleSelectMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);

    const promises = fileList.map(file => {
      return new Promise<{ name: string; dataUrl: string; caption: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => {
          const rawName = file.name.replace(/\.[^/.]+$/, '');
          resolve({
            name: file.name,
            dataUrl: ev.target?.result as string,
            caption: rawName || `${batchPhase} 사진`
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(results => {
        setStagedFiles(prev => [...prev, ...results]);
        setIsUploading(false);
      })
      .catch(err => {
        console.error(err);
        alert('사진을 불러오는 중 오류가 발생했습니다.');
        setIsUploading(false);
      });

    e.target.value = '';
  };

  const handleRemoveStagedFile = (idx: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveBatchUpload = () => {
    if (stagedFiles.length === 0) {
      alert('등록할 사진을 최소 1장 이상 선택해주세요.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newPhotos: CompletionPhoto[] = stagedFiles.map((item, idx) => ({
      id: `cp-${Date.now()}-${idx}`,
      photoUrl: item.dataUrl,
      caption: item.caption.trim() || `${batchPhase} 현장 사진`,
      description: '',
      phase: batchPhase,
      date: today
    }));

    const updated = [...newPhotos, ...photos];
    onUpdatePhotos(updated);
    onToast(`사진 ${newPhotos.length}장이 '${batchPhase}'으로 성공적으로 등록되었습니다.`);

    setShowBatchModal(false);
    setStagedFiles([]);
  };

  /* ================= 2. 선택한 사진 설명 및 캡션 수정 모달 ================= */
  const [selectedPhoto, setSelectedPhoto] = useState<CompletionPhoto | null>(null);
  const [editCaption, setEditCaption] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editPhase, setEditPhase] = useState<'시공 전' | '시공 후'>('시공 후');
  const [editDate, setEditDate] = useState<string>('');

  const handleOpenDetailModal = (photo: CompletionPhoto) => {
    setSelectedPhoto(photo);
    setEditCaption(photo.caption || '');
    setEditDescription(photo.description || '');
    setEditPhase(normalizePhase(photo.phase));
    setEditDate(photo.date || new Date().toISOString().split('T')[0]);
  };

  const handleSavePhotoDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) return;

    const updated = photos.map(p => {
      if (p.id === selectedPhoto.id) {
        return {
          ...p,
          caption: editCaption.trim() || `${editPhase} 사진`,
          description: editDescription.trim(),
          phase: editPhase,
          date: editDate || p.date
        };
      }
      return p;
    });

    onUpdatePhotos(updated);
    onToast('사진 캡션 및 설명이 저장되었습니다.');
    setSelectedPhoto(null);
  };

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('선택한 사진을 삭제하시겠습니까?')) return;

    const updated = photos.filter(p => p.id !== id);
    onUpdatePhotos(updated);
    onToast('사진이 삭제되었습니다.');
    if (selectedPhoto && selectedPhoto.id === id) {
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span>시공 사진 갤러리</span>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              시공 전 / 시공 후 구분
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            현장 사진을 <strong>여러 장 한꺼번에 등록</strong>하고, 사진별로 <strong>설명 및 캡션</strong>을 상세하게 기입합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Phase Filter (시공 전 / 시공 후) */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPhaseFilter('전체')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                phaseFilter === '전체'
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              전체 ({photos.length})
            </button>

            <button
              type="button"
              onClick={() => setPhaseFilter('시공 전')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                phaseFilter === '시공 전'
                  ? 'bg-white text-amber-900 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>시공 전 ({beforeCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setPhaseFilter('시공 후')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                phaseFilter === '시공 후'
                  ? 'bg-white text-emerald-900 shadow-xs font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>시공 후 ({afterCount})</span>
            </button>
          </div>

          {/* Multi-Photo Upload Button */}
          <button
            type="button"
            onClick={() => {
              setBatchPhase(phaseFilter === '시공 전' ? '시공 전' : '시공 후');
              setShowBatchModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Images className="w-3.5 h-3.5" />
            <span>사진 여러 장 등록</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Gallery Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPhotos.map(photo => {
            const isBefore = normalizePhase(photo.phase) === '시공 전';
            return (
              <div
                key={photo.id}
                onClick={() => handleOpenDetailModal(photo)}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group cursor-pointer"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Phase Badge: '시공 전' (amber) / '시공 후' (emerald) */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs text-white ${
                      isBefore ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {normalizePhase(photo.phase)}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <Edit3 className="w-4 h-4" />
                    <span>설명 / 캡션 수정</span>
                  </div>
                </div>

                {/* Caption, Description & Meta */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">
                      {photo.caption || `${photo.phase} 현장 사진`}
                    </h4>
                    {photo.description ? (
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {photo.description}
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-400 mt-1 italic">
                        클릭하여 사진 설명 기입...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[11px] text-neutral-400">
                    <span className="font-mono">{photo.date}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(photo);
                        }}
                        className="p-1 text-neutral-400 hover:text-blue-600 rounded hover:bg-neutral-100 transition-colors"
                        title="설명 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePhoto(photo.id, e)}
                        className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100 transition-colors"
                        title="사진 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
          <Camera className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700">
            {phaseFilter === '전체' ? '등록된 시공 사진이 없습니다.' : `'${phaseFilter}' 사진이 없습니다.`}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            상단 <strong>'사진 여러 장 등록'</strong> 버튼을 눌러 시공 전/시공 후 사진들을 한꺼번에 등록해보세요.
          </p>
        </div>
      )}

      {/* ================= 3. BATCH MULTI-PHOTO UPLOAD MODAL ================= */}
      {showBatchModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBatchModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <Images className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">시공 사진 여러 장 동시 등록</h3>
                  <p className="text-[11px] text-neutral-500">
                    탐색기에서 여러 장의 사진을 한꺼번에 선택하여 등록할 수 있습니다.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowBatchModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Phase: 시공 전 vs 시공 후 */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                등록할 사진 구분 (시공 전 / 시공 후) *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBatchPhase('시공 전')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    batchPhase === '시공 전'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>시공 전 (Before)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBatchPhase('시공 후')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    batchPhase === '시공 후'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>시공 후 (After)</span>
                </button>
              </div>
            </div>

            {/* Multi-File Upload Drop Area */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                사진 파일 선택 (복수 선택 가능) *
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-300 hover:border-rose-400 rounded-xl bg-neutral-50/60 hover:bg-rose-50/20 cursor-pointer transition-colors text-center">
                <Upload className="w-7 h-7 text-neutral-400 mb-2" />
                <span className="text-xs font-semibold text-neutral-800">
                  클릭하여 사진 파일들을 여러 장 선택하세요
                </span>
                <span className="text-[11px] text-neutral-400 mt-1">
                  JPG, PNG, WebP 등 여러 장 동시 선택 지원
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleSelectMultipleFiles}
                  className="hidden"
                />
              </label>
            </div>

            {/* Staged files preview */}
            {stagedFiles.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-2 border border-neutral-200 rounded-xl p-3 bg-neutral-50/40 max-h-56">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 pb-1 border-b border-neutral-200">
                  <span>선택된 사진 목록 ({stagedFiles.length}장)</span>
                  <span className="text-[11px] text-neutral-400">등록 후 개별 설명 수정 가능</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stagedFiles.map((file, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-neutral-200 text-xs"
                    >
                      <img src={file.dataUrl} alt={file.name} className="w-12 h-10 object-cover rounded shrink-0" />
                      <div className="min-w-0 flex-1">
                        <input
                          type="text"
                          value={file.caption}
                          onChange={(e) => {
                            const val = e.target.value;
                            setStagedFiles(prev => prev.map((f, i) => i === idx ? { ...f, caption: val } : f));
                          }}
                          placeholder="사진 캡션"
                          className="w-full text-xs font-medium border-b border-neutral-200 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStagedFile(idx)}
                        className="text-neutral-400 hover:text-red-600 p-1"
                        title="제외"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setShowBatchModal(false);
                  setStagedFiles([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={stagedFiles.length === 0 || isUploading}
                onClick={handleSaveBatchUpload}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-300 rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>총 {stagedFiles.length}장 일괄 등록하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. PHOTO DETAIL / CAPTION & DESCRIPTION EDIT MODAL ================= */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhoto(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded text-white ${
                  editPhase === '시공 전' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {editPhase}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 truncate max-w-sm">
                  {editCaption || '사진 상세 정보 및 캡션'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePhotoDetail} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Photo Display */}
              <div className="aspect-16/10 bg-neutral-900 rounded-xl overflow-hidden flex items-center justify-center relative">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.caption}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Phase Switcher: 시공 전 vs 시공 후 */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  사진 구분 *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditPhase('시공 전')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      editPhase === '시공 전'
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    시공 전 (Before)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPhase('시공 후')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                      editPhase === '시공 후'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : 'border-neutral-200 text-neutral-600'
                    }`}
                  >
                    시공 후 (After)
                  </button>
                </div>
              </div>

              {/* Caption (캡션 / 제목) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  사진 캡션 / 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 거실 메인 아트월 및 무몰딩 도장 마감 완료"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-rose-500 font-semibold"
                />
              </div>

              {/* Description (상세 설명 / 메모) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  사진 상세 설명 및 시공 특이사항
                </label>
                <textarea
                  rows={3}
                  placeholder="예: 철거 직후 기존 바닥 난방배관 크랙 및 매립 조명 박스 위치 실측 사진. 목공 팀장 사전 협의 완료."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-rose-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  촬영 / 등록 일자
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-neutral-300 rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>사진 삭제</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>설명 저장</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
