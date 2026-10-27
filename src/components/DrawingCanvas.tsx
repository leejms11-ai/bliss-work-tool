import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Square, Minus, Type, Eraser, RotateCcw, Download, Save, Upload, Trash2 } from 'lucide-react';

interface DrawingCanvasProps {
  initialImage?: string | null;
  onSave: (dataUrl: string) => void;
}

type ToolMode = 'pen' | 'line' | 'rect' | 'text' | 'eraser';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ initialImage, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<ToolMode>('pen');
  const [color, setColor] = useState<string>('#1E293B');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    setHistory([]);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw architectural light grid
    drawGrid(ctx, canvas.width, canvas.height);

    if (initialImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([snap]);
      };
      img.src = initialImage;
    } else {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([snap]);
    }
  }, [initialImage]);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), snap]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    if (!window.confirm('캔버스 스케치를 모두 지우시겠습니까?')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    saveState();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (tool === 'text') {
      setTextPos(coords);
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    setStartPos(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = lineWidth * 4;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(e);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (tool === 'line' || tool === 'rect') {
      // Restore latest state before drawing preview
      if (history.length > 0) {
        ctx.putImageData(history[history.length - 1], 0, 0);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        const w = coords.x - startPos.x;
        const h = coords.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, w, h);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    saveState();
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textPos) {
      setShowTextInput(false);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPos.x, textPos.y);
    ctx.restore();

    setTextInput('');
    setShowTextInput(false);
    setTextPos(null);
    saveState();
  };

  const handleSaveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `rough_drawing_${Date.now()}.png`;
    a.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (!result) return;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Scale to fit canvas preserving aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        saveState();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-neutral-200">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tool === 'pen' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="자유 펜"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>펜</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('line')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tool === 'line' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="직선 (치수선)"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>직선</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('rect')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tool === 'rect' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="사각형 (방/가구 구획)"
          >
            <Square className="w-3.5 h-3.5" />
            <span>사각형</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('text')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tool === 'text' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="텍스트 치수/메모"
          >
            <Type className="w-3.5 h-3.5" />
            <span>텍스트</span>
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              tool === 'eraser' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
            title="지우개"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>지우개</span>
          </button>
        </div>

        {/* Colors & Stroke */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {['#1E293B', '#DC2626', '#2563EB', '#059669', '#D97706', '#64748B'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  color === c ? 'scale-125 border-neutral-900 shadow-sm' : 'border-white hover:scale-110'
                }`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-neutral-200 mx-1" />

          {/* Stroke Width */}
          <div className="flex items-center gap-1 text-xs text-neutral-600">
            <span>두께:</span>
            {[2, 4, 8].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => setLineWidth(w)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                  lineWidth === w ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-md border border-neutral-200 disabled:opacity-40"
            title="실행 취소"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>되돌리기</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200"
            title="전체 지우기"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>

          <label className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-md border border-neutral-200 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>손도면/사진 불러오기</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-md border border-neutral-200"
            title="이미지 파일로 다운로드"
          >
            <Download className="w-3.5 h-3.5" />
            <span>저장(PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDrawing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>도면에 반영하기</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
          가도면이 성공적으로 현장 데이터에 저장되었습니다.
        </div>
      )}

      {/* Canvas Area */}
      <div className="relative border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={550}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair bg-white max-w-full h-auto shadow-sm"
        />

        {/* Floating Text Input when tool is text */}
        {showTextInput && textPos && (
          <div
            className="absolute bg-white p-2 rounded-lg shadow-xl border border-neutral-300 flex items-center gap-2 z-20"
            style={{
              left: Math.min(Math.max(textPos.x / (900 / 700), 20), 500),
              top: Math.min(Math.max(textPos.y / (550 / 400), 20), 400)
            }}
          >
            <input
              type="text"
              autoFocus
              placeholder="예: 싱크대 2,400mm"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddText()}
              className="px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-blue-500 w-44"
            />
            <button
              type="button"
              onClick={handleAddText}
              className="px-2 py-1 bg-neutral-900 text-white text-xs rounded font-medium"
            >
              입력
            </button>
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded hover:bg-neutral-200"
            >
              취소
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-neutral-400">
        * 캔버스 위에서 마우스로 자유롭게 가도면 벽체, 치수선, 가구 위치를 스케치하거나 현장 사진을 불러와 표시할 수 있습니다.
      </p>
    </div>
  );
};
