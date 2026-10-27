import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Check, 
  Search, 
  Filter, 
  Layers, 
  Table, 
  Grid, 
  Download, 
  Printer, 
  Share2, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Package, 
  MinusCircle, 
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { 
  InteriorProject, 
  OrderItem, 
  OrderStatus, 
  StandardOrderCategory, 
  STANDARD_ORDER_CATEGORIES,
  createDefaultOrderItems 
} from '../types/project';

interface OrderChecklistManagerProps {
  project: InteriorProject;
  onUpdateOrders: (orders: OrderItem[]) => void;
  onToast: (msg: string) => void;
}

// Category icons or visual cues
const CATEGORY_META: Record<StandardOrderCategory, { badge: string; color: string; desc: string }> = {
  '후드': { badge: 'bg-amber-100 text-amber-800 border-amber-200', color: 'border-amber-400', desc: '아일랜드/침니/매립 렌지후드' },
  '싱크볼': { badge: 'bg-blue-100 text-blue-800 border-blue-200', color: 'border-blue-400', desc: '사각싱크볼/홈바볼/언더시공' },
  '쿡탑': { badge: 'bg-rose-100 text-rose-800 border-rose-200', color: 'border-rose-400', desc: '인덕션/하이라이트/가스레인지' },
  '수전': { badge: 'bg-cyan-100 text-cyan-800 border-cyan-200', color: 'border-cyan-400', desc: '주방폭포수전/거위목/욕실수전' },
  '도장': { badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', color: 'border-indigo-400', desc: '친환경페인트/올퍼티/스테인' },
  '하드웨어': { badge: 'bg-violet-100 text-violet-800 border-violet-200', color: 'border-violet-400', desc: '서랍레일/댐퍼경첩/인출철물' },
  '조명': { badge: 'bg-yellow-100 text-yellow-800 border-yellow-200', color: 'border-yellow-400', desc: '매립바조명/다운라이트/라인조명' },
  '손잡이': { badge: 'bg-stone-100 text-stone-800 border-stone-200', color: 'border-stone-400', desc: '방문손잡이/가구손잡이/모티스락' },
  '거울도어': { badge: 'bg-sky-100 text-sky-800 border-sky-200', color: 'border-sky-400', desc: '욕실슬라이딩장/신발장은경' },
  '수저함': { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', color: 'border-emerald-400', desc: '원목/스틸 디바이더 수저분리함' },
  '상판': { badge: 'bg-orange-100 text-orange-800 border-orange-200', color: 'border-orange-400', desc: '세라믹/인조대리석/엔지니어드스톤' },
  '젠다이': { badge: 'bg-teal-100 text-teal-800 border-teal-200', color: 'border-teal-400', desc: '조적졸리컷/천연대리석선반' },
  '매립콘센트': { badge: 'bg-purple-100 text-purple-800 border-purple-200', color: 'border-purple-400', desc: '아일랜드회전/무선충전팝업' },
  '기타': { badge: 'bg-neutral-100 text-neutral-800 border-neutral-200', color: 'border-neutral-400', desc: '누수감지센서/절수페달/기타부속' }
};

export const OrderChecklistManager: React.FC<OrderChecklistManagerProps> = ({
  project,
  onUpdateOrders,
  onToast
}) => {
  // View mode: 'category' (카테고리별 그룹) vs 'table' (전체 표 보기)
  const [viewMode, setViewMode] = useState<'category' | 'table'>('category');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('전체');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Edit / Add Modal State
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

  // Form states for modal
  const [formCategory, setFormCategory] = useState<string>('후드');
  const [formItemLabel, setFormItemLabel] = useState<string>('');
  const [formModelName, setFormModelName] = useState<string>('');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState<string>('개');
  const [formOrderPrice, setFormOrderPrice] = useState<number>(0);
  const [formSupplyPrice, setFormSupplyPrice] = useState<number>(0);
  const [formSupplier, setFormSupplier] = useState<string>('');
  const [formOrderDate, setFormOrderDate] = useState<string>('');
  const [formOrderStatus, setFormOrderStatus] = useState<OrderStatus>('발주예정');
  const [formNotes, setFormNotes] = useState<string>('');

  // Current items from project, with fallback migration
  const items: OrderItem[] = useMemo(() => {
    const raw = project.orderChecklist || [];
    return raw.map((item: any, idx: number) => {
      // Migrate legacy fields if needed
      const category = item.category || '기타';
      const itemLabel = item.itemLabel || item.itemName || `${category} ${idx + 1}`;
      const modelName = item.modelName || item.spec || item.itemName || '';
      const orderPrice = typeof item.orderPrice === 'number' ? item.orderPrice : (item.unitPrice || 0);
      const supplyPrice = typeof item.supplyPrice === 'number' ? item.supplyPrice : Math.round(orderPrice * 1.25);
      const supplier = item.supplier || '미지정';
      const orderDate = item.orderDate || item.deliveryDate || new Date().toISOString().split('T')[0];
      const notes = item.notes || '';
      
      // Standardize status: '해당없음' | '발주예정' | '발주완료' | '재고사용'
      let orderStatus: OrderStatus = '발주예정';
      if (item.orderStatus === '해당없음' || item.orderStatus === '발주예정' || item.orderStatus === '발주완료' || item.orderStatus === '재고사용') {
        orderStatus = item.orderStatus;
      } else if (item.orderStatus === '입고완료' || item.orderStatus === '배송중') {
        orderStatus = '발주완료';
      } else if (item.orderStatus === '발주대기') {
        orderStatus = '발주예정';
      }

      return {
        ...item,
        id: item.id || `ord-${Date.now()}-${idx}`,
        category,
        itemLabel,
        modelName,
        quantity: item.quantity || 1,
        orderPrice,
        supplyPrice,
        supplier,
        orderDate,
        notes,
        orderStatus,
        unit: item.unit || '개',
        // keep legacy fields populated for safety
        itemName: itemLabel,
        spec: modelName,
        unitPrice: orderPrice,
        totalPrice: orderPrice * (item.quantity || 1)
      };
    });
  }, [project.orderChecklist]);

  // Statistics & KPI calculations
  const stats = useMemo(() => {
    let totalItems = items.length;
    let scheduledCount = 0; // 발주예정
    let completedCount = 0; // 발주완료
    let stockCount = 0;     // 재고사용
    let naCount = 0;        // 해당없음

    let totalOrderCost = 0;  // 발주가격 합계 (원가)
    let totalSupplyTotal = 0; // 납품가격 합계 (매출)

    items.forEach(item => {
      if (item.orderStatus === '발주예정') scheduledCount++;
      else if (item.orderStatus === '발주완료') completedCount++;
      else if (item.orderStatus === '재고사용') stockCount++;
      else if (item.orderStatus === '해당없음') naCount++;

      // Only count active items into financial calculations
      if (item.orderStatus !== '해당없음') {
        totalOrderCost += (item.orderPrice || 0) * (item.quantity || 1);
        totalSupplyTotal += (item.supplyPrice || 0) * (item.quantity || 1);
      }
    });

    const profitMargin = totalSupplyTotal - totalOrderCost;
    const marginRate = totalSupplyTotal > 0 ? ((profitMargin / totalSupplyTotal) * 100).toFixed(1) : '0';

    return {
      totalItems,
      scheduledCount,
      completedCount,
      stockCount,
      naCount,
      totalOrderCost,
      totalSupplyTotal,
      profitMargin,
      marginRate
    };
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Status filter
      if (statusFilter !== '전체' && item.orderStatus !== statusFilter) {
        return false;
      }
      // Category filter
      if (selectedCategory !== '전체' && item.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inLabel = item.itemLabel.toLowerCase().includes(query);
        const inModel = item.modelName.toLowerCase().includes(query);
        const inSupplier = item.supplier.toLowerCase().includes(query);
        const inNotes = item.notes?.toLowerCase().includes(query);
        const inCat = item.category.toLowerCase().includes(query);
        if (!inLabel && !inModel && !inSupplier && !inNotes && !inCat) {
          return false;
        }
      }
      return true;
    });
  }, [items, statusFilter, selectedCategory, searchQuery]);

  // Group items by standard categories for Category View
  const groupedByCategory = useMemo(() => {
    const groups: { category: StandardOrderCategory; items: OrderItem[] }[] = [];
    
    // 1. Process 14 standard categories in order
    STANDARD_ORDER_CATEGORIES.forEach(cat => {
      const catItems = items.filter(it => it.category === cat);
      groups.push({
        category: cat,
        items: catItems
      });
    });

    // 2. Also check if there are any custom categories outside standard 14
    const customCategories = Array.from(
      new Set(items.map(it => it.category).filter(c => !STANDARD_ORDER_CATEGORIES.includes(c as any)))
    );
    customCategories.forEach(customCat => {
      const customItems = items.filter(it => it.category === customCat);
      groups.push({
        category: customCat as any,
        items: customItems
      });
    });

    return groups;
  }, [items]);

  // Handlers for item operations
  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    const updated = items.map(it => it.id === id ? { ...it, orderStatus: newStatus } : it);
    onUpdateOrders(updated);
    onToast(`발주 상태가 '${newStatus}'(으)로 변경되었습니다.`);
  };

  const handleDeleteItem = (id: string, label: string) => {
    const updated = items.filter(it => it.id !== id);
    onUpdateOrders(updated);
    onToast(`'${label}' 품목이 삭제되었습니다.`);
  };

  const handleDuplicateItem = (item: OrderItem) => {
    const sameCatItems = items.filter(it => it.category === item.category);
    const nextNumber = sameCatItems.length + 1;
    const newItem: OrderItem = {
      ...item,
      id: `ord-${Date.now()}`,
      itemLabel: `${item.category} ${nextNumber}`,
      orderStatus: '발주예정',
      notes: `${item.notes ? item.notes + ' ' : ''}(추가 발주분)`
    };
    const updated = [...items, newItem];
    onUpdateOrders(updated);
    onToast(`'${newItem.itemLabel}'(이)가 복제 추가되었습니다.`);
  };

  // Open modal to add a new item under a specific category (e.g. 후드 1, 후드 2...)
  const handleAddNewUnderCategory = (category: string) => {
    const existing = items.filter(it => it.category === category);
    const nextNum = existing.length + 1;
    
    setEditingItem(null);
    setFormCategory(category);
    setFormItemLabel(`${category} ${nextNum}`);
    setFormModelName('');
    setFormQuantity(1);
    setFormUnit('개');
    setFormOrderPrice(0);
    setFormSupplyPrice(0);
    setFormSupplier('');
    setFormOrderDate(new Date().toISOString().split('T')[0]);
    setFormOrderStatus('발주예정');
    setFormNotes('');
    setEditModalOpen(true);
  };

  // Open modal to edit existing item
  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormItemLabel(item.itemLabel);
    setFormModelName(item.modelName);
    setFormQuantity(item.quantity);
    setFormUnit(item.unit || '개');
    setFormOrderPrice(item.orderPrice || 0);
    setFormSupplyPrice(item.supplyPrice || 0);
    setFormSupplier(item.supplier || '');
    setFormOrderDate(item.orderDate || new Date().toISOString().split('T')[0]);
    setFormOrderStatus(item.orderStatus);
    setFormNotes(item.notes || '');
    setEditModalOpen(true);
  };

  // Save item from Modal (Create or Update)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemLabel.trim()) {
      alert('품목 표기명을 입력해주세요.');
      return;
    }

    const itemData: OrderItem = {
      id: editingItem ? editingItem.id : `ord-${Date.now()}`,
      category: formCategory,
      itemLabel: formItemLabel.trim(),
      modelName: formModelName.trim(),
      quantity: Number(formQuantity) || 1,
      unit: formUnit.trim() || '개',
      orderPrice: Number(formOrderPrice) || 0,
      supplyPrice: Number(formSupplyPrice) || 0,
      supplier: formSupplier.trim() || '미지정',
      orderDate: formOrderDate || new Date().toISOString().split('T')[0],
      orderStatus: formOrderStatus,
      notes: formNotes.trim(),
      // legacy support
      itemName: formItemLabel.trim(),
      spec: formModelName.trim(),
      unitPrice: Number(formOrderPrice) || 0,
      totalPrice: (Number(formOrderPrice) || 0) * (Number(formQuantity) || 1),
      deliveryDate: formOrderDate
    };

    if (editingItem) {
      const updated = items.map(it => it.id === editingItem.id ? itemData : it);
      onUpdateOrders(updated);
      onToast(`'${itemData.itemLabel}' 정보가 수정되었습니다.`);
    } else {
      const updated = [...items, itemData];
      onUpdateOrders(updated);
      onToast(`새 발주 품목 '${itemData.itemLabel}'(이)가 추가되었습니다.`);
    }

    setEditModalOpen(false);
  };

  // Reset to default 14 categories if user desires
  const handleResetToDefaultCategories = () => {
    if (!window.confirm('기본 14개 발주 품목(후드, 싱크볼, 쿡탑, 수전 등)을 표준 양식으로 초기화/재설정하시겠습니까?')) {
      return;
    }
    const defaults = createDefaultOrderItems();
    onUpdateOrders(defaults);
    onToast('기본 14개 표준 발주 품목으로 재설정되었습니다.');
  };

  // Copy order list to clipboard for KakaoTalk / Messenger
  const handleCopyOrderSummary = () => {
    const activeItems = items.filter(it => it.orderStatus !== '해당없음');
    const scheduled = activeItems.filter(it => it.orderStatus === '발주예정');
    const completed = activeItems.filter(it => it.orderStatus === '발주완료');
    const stock = activeItems.filter(it => it.orderStatus === '재고사용');

    let text = `📦 [${project.name}] 발주 품목 체크리스트 현황\n`;
    text += `📍 현장 주소: ${project.address} ${project.addressDetail || ''}\n`;
    text += `🔑 현장 출입문: ${project.accessCode}\n`;
    text += `📅 발주일정 기준일: ${new Date().toISOString().split('T')[0]}\n`;
    text += `------------------------------------\n\n`;

    if (scheduled.length > 0) {
      text += `⏳ [발주예정 품목 - ${scheduled.length}건]\n`;
      scheduled.forEach((it, idx) => {
        text += `${idx + 1}. [${it.category}] ${it.itemLabel}: ${it.modelName || '규격미정'} / ${it.quantity}${it.unit || '개'} / 발주처: ${it.supplier || '미정'} / 예정일: ${it.orderDate}${it.notes ? ' (' + it.notes + ')' : ''}\n`;
      });
      text += `\n`;
    }

    if (completed.length > 0) {
      text += `✅ [발주완료 품목 - ${completed.length}건]\n`;
      completed.forEach((it, idx) => {
        text += `${idx + 1}. [${it.category}] ${it.itemLabel}: ${it.modelName} / ${it.quantity}${it.unit || '개'} / 발주처: ${it.supplier} / 발주일: ${it.orderDate}\n`;
      });
      text += `\n`;
    }

    if (stock.length > 0) {
      text += `📦 [재고사용 품목 - ${stock.length}건]\n`;
      stock.forEach((it, idx) => {
        text += `${idx + 1}. [${it.category}] ${it.itemLabel}: ${it.modelName} (${it.quantity}${it.unit || '개'})\n`;
      });
      text += `\n`;
    }

    text += `------------------------------------\n`;
    text += `💰 발주 총 원가: ₩${stats.totalOrderCost.toLocaleString()} | 납품 총액: ₩${stats.totalSupplyTotal.toLocaleString()}\n`;
    text += `담당: ${project.managerName || '현장소장'} (${project.managerPhone || '연락처'})`;

    navigator.clipboard.writeText(text);
    onToast('거래처 및 현장 공유용 발주 리스트가 클립보드에 복사되었습니다.');
  };

  // Helper for Status Badge style
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case '발주예정':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-300 font-bold',
          icon: <Clock className="w-3 h-3 text-amber-600" />,
          label: '발주예정'
        };
      case '발주완료':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-300 font-bold',
          icon: <CheckCircle2 className="w-3 h-3 text-blue-600" />,
          label: '발주완료'
        };
      case '재고사용':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
          icon: <Package className="w-3 h-3 text-emerald-600" />,
          label: '재고사용'
        };
      case '해당없음':
      default:
        return {
          bg: 'bg-neutral-100 text-neutral-500 border-neutral-200',
          icon: <MinusCircle className="w-3 h-3 text-neutral-400" />,
          label: '해당없음'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Items */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium">전체 발주 품목</span>
          <p className="text-xl font-bold font-mono text-neutral-900 mt-0.5">
            {stats.totalItems} <span className="text-xs font-normal text-neutral-400">개</span>
          </p>
        </div>

        {/* Scheduled (발주예정) */}
        <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-800 font-semibold">발주예정</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-900 mt-0.5">
            {stats.scheduledCount} <span className="text-xs font-normal text-amber-700">건</span>
          </p>
        </div>

        {/* Completed (발주완료) */}
        <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-800 font-semibold">발주완료</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-blue-900 mt-0.5">
            {stats.completedCount} <span className="text-xs font-normal text-blue-700">건</span>
          </p>
        </div>

        {/* Stock (재고사용) */}
        <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-emerald-800 font-semibold">재고사용</span>
            <Package className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-900 mt-0.5">
            {stats.stockCount} <span className="text-xs font-normal text-emerald-700">건</span>
          </p>
        </div>

        {/* Total Order Cost (발주 원가) */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium">발주 총 원가</span>
          <p className="text-sm sm:text-base font-bold font-mono text-neutral-900 mt-0.5 tabular-nums truncate" title={`₩${stats.totalOrderCost.toLocaleString()}`}>
            ₩{stats.totalOrderCost.toLocaleString()}
          </p>
          <span className="text-[10px] text-neutral-400">공급처 매입가</span>
        </div>

        {/* Total Supply Price & Profit (납품가 & 마진) */}
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
          <span className="text-[11px] text-neutral-500 font-medium">납품 총액 (마진 {stats.marginRate}%)</span>
          <p className="text-sm sm:text-base font-bold font-mono text-indigo-700 mt-0.5 tabular-nums truncate" title={`₩${stats.totalSupplyTotal.toLocaleString()}`}>
            ₩{stats.totalSupplyTotal.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            차익 +₩{stats.profitMargin.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Top Action Bar & Filter Switcher */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('category')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'category'
                    ? 'bg-white text-neutral-900 shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-blue-600" />
                <span>품목별 그룹 보기 (후드1·2 개별추가)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-neutral-900 shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-indigo-600" />
                <span>전체 표 보기 (스프레드시트)</span>
              </button>
            </div>

            <span className="hidden sm:inline-block text-xs text-neutral-400">|</span>

            <button
              type="button"
              onClick={handleResetToDefaultCategories}
              className="hidden sm:flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
              title="14개 표준 품목 기본값 재적용"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>14대 기본품목 재정렬</span>
            </button>
          </div>

          {/* Right: Quick Actions (Copy, New Item) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyOrderSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 transition-colors shadow-2xs"
              title="카카오톡 및 문자로 거래처/현장에 바로 공유"
            >
              <Share2 className="w-3.5 h-3.5 text-neutral-600" />
              <span>발주서 카톡 복사</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddNewUnderCategory('후드')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 발주 품목 등록</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 sm:pb-0 text-xs">
            <span className="text-[11px] text-neutral-400 font-medium mr-1 shrink-0">상태:</span>
            {['전체', '발주예정', '발주완료', '재고사용', '해당없음'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs transition-colors ${
                  statusFilter === status
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="품목명, 모델명, 발주처 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* 14 Category Quick Jump Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 text-[11px]">
          <span className="text-neutral-400 shrink-0">품목 바로가기:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('전체')}
            className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
              selectedCategory === '전체'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            전체
          </button>
          {STANDARD_ORDER_CATEGORIES.map(cat => {
            const count = items.filter(it => it.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? '전체' : cat)}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-neutral-900 text-white font-bold border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[9px] px-1 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Content: CATEGORY VIEW (Requested: 후드1, 후드2 각각 추가 및 기입 가능) */}
      {viewMode === 'category' ? (
        <div className="space-y-4">
          {groupedByCategory
            .filter(grp => selectedCategory === '전체' || grp.category === selectedCategory)
            .map(grp => {
              const meta = CATEGORY_META[grp.category as StandardOrderCategory] || {
                badge: 'bg-neutral-100 text-neutral-800 border-neutral-200',
                color: 'border-neutral-400',
                desc: '기타 부속 자재'
              };

              // Category specific items matching status & search
              const visibleItems = grp.items.filter(item => {
                if (statusFilter !== '전체' && item.orderStatus !== statusFilter) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    item.itemLabel.toLowerCase().includes(q) ||
                    item.modelName.toLowerCase().includes(q) ||
                    item.supplier.toLowerCase().includes(q) ||
                    item.notes?.toLowerCase().includes(q)
                  );
                }
                return true;
              });

              return (
                <div 
                  key={grp.category}
                  className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-neutral-50/80 border-b border-neutral-200">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${meta.badge}`}>
                        {grp.category}
                      </span>
                      <span className="text-xs text-neutral-500 hidden md:inline">
                        {meta.desc}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        ({grp.items.length}개 항목 등록)
                      </span>
                    </div>

                    {/* Add Item to This Specific Category button (ex: 후드 추가 -> 후드1, 후드2 ...) */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddNewUnderCategory(grp.category)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
                        title={`'${grp.category}' 품목을 하나 더 추가합니다 (예: ${grp.category} 1, ${grp.category} 2...)`}
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-600" />
                        <span>+ {grp.category} 추가</span>
                      </button>
                    </div>
                  </div>

                  {/* Items list under this category */}
                  <div className="divide-y divide-neutral-100">
                    {visibleItems.length > 0 ? (
                      visibleItems.map((item, itemIdx) => {
                        const statusBadge = getStatusBadge(item.orderStatus);
                        const itemTotalOrder = (item.orderPrice || 0) * (item.quantity || 1);
                        const itemTotalSupply = (item.supplyPrice || 0) * (item.quantity || 1);

                        return (
                          <div 
                            key={item.id}
                            className={`p-3.5 transition-colors hover:bg-neutral-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                              item.orderStatus === '해당없음' ? 'opacity-50 bg-neutral-50/30' : ''
                            }`}
                          >
                            {/* Left: Item Label, Model, Quantity & Notes */}
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Item Label (ex: 후드 1, 후드 2) */}
                                <span className="font-bold text-xs text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                                  {item.itemLabel}
                                </span>

                                {/* Status Selector Dropdown */}
                                <div className="relative inline-block">
                                  <select
                                    value={item.orderStatus}
                                    onChange={(e) => handleUpdateStatus(item.id, e.target.value as OrderStatus)}
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded border cursor-pointer appearance-none pr-5 ${statusBadge.bg}`}
                                  >
                                    <option value="발주예정">⏳ 발주예정</option>
                                    <option value="발주완료">✅ 발주완료</option>
                                    <option value="재고사용">📦 재고사용</option>
                                    <option value="해당없음">⚪ 해당없음</option>
                                  </select>
                                  <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                                </div>

                                {/* Model Name / Spec */}
                                <span className="text-xs font-semibold text-neutral-800 truncate max-w-md" title={item.modelName}>
                                  {item.modelName || <span className="text-neutral-400 italic">모델명 미입력 (수정하여 기입)</span>}
                                </span>
                              </div>

                              {/* Details: 수량, 발주처, 발주일자, 비고란 */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-600">
                                <div>
                                  <span className="text-neutral-400 mr-1">수량:</span>
                                  <span className="font-mono font-bold text-neutral-900">{item.quantity} {item.unit || '개'}</span>
                                </div>

                                <div>
                                  <span className="text-neutral-400 mr-1">발주처:</span>
                                  <span className="font-medium text-neutral-800">{item.supplier || '미지정'}</span>
                                </div>

                                <div>
                                  <span className="text-neutral-400 mr-1">발주일자:</span>
                                  <span className="font-mono text-neutral-700">{item.orderDate || '-'}</span>
                                </div>

                                {item.notes && (
                                  <div className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 max-w-lg truncate" title={item.notes}>
                                    <span className="font-semibold mr-1">비고:</span>
                                    {item.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Middle/Right: Prices (발주가격 & 납품가격) */}
                            <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                              <div className="text-right font-mono text-xs">
                                <div className="text-neutral-500 text-[11px]">
                                  <span>발주가: </span>
                                  <strong className="text-neutral-900 font-bold">₩{itemTotalOrder.toLocaleString()}</strong>
                                  <span className="text-[10px] text-neutral-400 ml-1">(@₩{item.orderPrice.toLocaleString()})</span>
                                </div>
                                <div className="text-indigo-700 text-[11px] mt-0.5">
                                  <span>납품가: </span>
                                  <strong className="font-bold">₩{itemTotalSupply.toLocaleString()}</strong>
                                </div>
                              </div>

                              {/* Action Buttons: Edit, Duplicate, Delete */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditItem(item)}
                                  className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="상세 수정"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicateItem(item)}
                                  className="p-1.5 text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="동일 품목 복제 추가"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id, item.itemLabel)}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="품목 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-400 bg-neutral-50/40">
                        {grp.items.length === 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>등록된 {grp.category} 항목이 없습니다.</span>
                            <button
                              type="button"
                              onClick={() => handleAddNewUnderCategory(grp.category)}
                              className="text-blue-600 hover:underline font-semibold"
                            >
                              + {grp.category} 1 추가하기
                            </button>
                          </div>
                        ) : (
                          <span>필터 조건에 일치하는 품목이 없습니다.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* 4. SPREADSHEET TABLE VIEW */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                  <th className="py-3 px-3.5">품목 분류</th>
                  <th className="py-3 px-3.5">품목명</th>
                  <th className="py-3 px-3.5">모델명 / 상세규격</th>
                  <th className="py-3 px-3.5 text-center">수량</th>
                  <th className="py-3 px-3.5">발주처</th>
                  <th className="py-3 px-3.5">발주일자</th>
                  <th className="py-3 px-3.5 text-right">발주단가 (원가)</th>
                  <th className="py-3 px-3.5 text-right">납품단가</th>
                  <th className="py-3 px-3.5 text-center">발주 상태</th>
                  <th className="py-3 px-3.5">비고</th>
                  <th className="py-3 px-3.5 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {filteredItems.map(item => {
                  const statusBadge = getStatusBadge(item.orderStatus);
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        item.orderStatus === '해당없음' ? 'opacity-50 bg-neutral-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 font-sans font-bold text-neutral-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[11px]">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-sans font-bold text-neutral-900 whitespace-nowrap">
                        {item.itemLabel}
                      </td>

                      <td className="py-3 px-3.5 font-sans text-neutral-800 max-w-[220px] truncate" title={item.modelName}>
                        {item.modelName || <span className="text-neutral-400 italic font-mono">-</span>}
                      </td>

                      <td className="py-3 px-3.5 text-center font-bold text-neutral-900 whitespace-nowrap">
                        {item.quantity} {item.unit || '개'}
                      </td>

                      <td className="py-3 px-3.5 font-sans text-neutral-700 whitespace-nowrap">
                        {item.supplier || '-'}
                      </td>

                      <td className="py-3 px-3.5 text-neutral-600 whitespace-nowrap">
                        {item.orderDate || '-'}
                      </td>

                      <td className="py-3 px-3.5 text-right font-medium tabular-nums text-neutral-900 whitespace-nowrap">
                        ₩{(item.orderPrice || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5 text-right font-semibold tabular-nums text-indigo-700 whitespace-nowrap">
                        ₩{(item.supplyPrice || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <select
                          value={item.orderStatus}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border cursor-pointer ${statusBadge.bg}`}
                        >
                          <option value="발주예정">발주예정</option>
                          <option value="발주완료">발주완료</option>
                          <option value="재고사용">재고사용</option>
                          <option value="해당없음">해당없음</option>
                        </select>
                      </td>

                      <td className="py-3 px-3.5 font-sans text-[11px] text-neutral-500 max-w-[180px] truncate" title={item.notes}>
                        {item.notes || '-'}
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap font-sans">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            className="p-1 text-neutral-400 hover:text-blue-600 rounded hover:bg-neutral-100"
                            title="수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            className="p-1 text-neutral-400 hover:text-indigo-600 rounded hover:bg-neutral-100"
                            title="복제"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.itemLabel)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. EDIT & ADD ITEM MODAL */}
      {editModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalOpen(false);
          }}
        >
          <form
            onSubmit={handleSaveModal}
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    {editingItem ? '발주 품목 정보 수정' : '새 발주 품목 추가'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    모델명, 수량, 가격, 발주처, 일자 및 비고를 기입합니다.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEditModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category & Item Label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  발주 품목 분류 *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setFormCategory(cat);
                    if (!editingItem) {
                      const count = items.filter(it => it.category === cat).length + 1;
                      setFormItemLabel(`${cat} ${count}`);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-blue-500 font-semibold"
                >
                  {STANDARD_ORDER_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="기타">기타 직접입력</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  품목 표기명 (ex: 후드 1, 후드 2) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 후드 1, 싱크볼 2"
                  value={formItemLabel}
                  onChange={(e) => setFormItemLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-blue-500 font-bold"
                />
              </div>
            </div>

            {/* Model Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                모델명 및 상세 스펙 *
              </label>
              <input
                type="text"
                placeholder="예: 엘리카 웨이브 아일랜드 후드 (WAVE IX/F/51) 510파이"
                value={formModelName}
                onChange={(e) => setFormModelName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* Quantity, Unit, Status */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  수량
                </label>
                <input
                  type="number"
                  min="1"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  단위
                </label>
                <input
                  type="text"
                  placeholder="개, 세트, m, 식"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  발주 상태 표시 *
                </label>
                <select
                  value={formOrderStatus}
                  onChange={(e) => {
                    const nextStatus = e.target.value as OrderStatus;
                    setFormOrderStatus(nextStatus);
                    if (nextStatus === '발주완료' && !formOrderDate) {
                      setFormOrderDate(new Date().toISOString().split('T')[0]);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-neutral-300 rounded-lg focus:outline-blue-500"
                >
                  <option value="발주예정">⏳ 발주예정</option>
                  <option value="발주완료">✅ 발주완료</option>
                  <option value="재고사용">📦 재고사용</option>
                  <option value="해당없음">⚪ 해당없음</option>
                </select>
              </div>
            </div>

            {/* Order Price & Supply Price */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  발주가격 (원가/매입단가)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">₩</span>
                  <input
                    type="number"
                    step="1000"
                    placeholder="0"
                    value={formOrderPrice}
                    onChange={(e) => setFormOrderPrice(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs font-mono bg-white border border-neutral-300 rounded-lg font-bold"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  총 발주원가: ₩{((Number(formOrderPrice) || 0) * (Number(formQuantity) || 1)).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  납품가격 (소비자/청구단가)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">₩</span>
                  <input
                    type="number"
                    step="1000"
                    placeholder="0"
                    value={formSupplyPrice}
                    onChange={(e) => setFormSupplyPrice(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs font-mono bg-white border border-neutral-300 rounded-lg font-bold text-indigo-700"
                  />
                </div>
                <span className="text-[10px] text-indigo-600 mt-1 block font-semibold">
                  총 납품금액: ₩{((Number(formSupplyPrice) || 0) * (Number(formQuantity) || 1)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Supplier & Order Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  발주처 (업체명/대리점)
                </label>
                <input
                  type="text"
                  placeholder="예: 엘리카 코리아 총판, 백조씽크 직영"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1 flex items-center justify-between">
                  <span>발주일자</span>
                  {formOrderStatus === '발주완료' ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">발주완료 활성화</span>
                  ) : (
                    <span className="text-[10px] text-neutral-400 font-normal">('발주완료' 시 활성화)</span>
                  )}
                </label>
                <input
                  type="date"
                  disabled={formOrderStatus !== '발주완료'}
                  value={formOrderDate}
                  onChange={(e) => setFormOrderDate(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono border rounded-lg transition-colors ${
                    formOrderStatus === '발주완료'
                      ? 'bg-white border-neutral-300 text-neutral-900 focus:outline-blue-500 font-medium'
                      : 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed select-none'
                  }`}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                비고란 (타공치수, 부속품, 특이사항)
              </label>
              <textarea
                rows={2}
                placeholder="예: 천장 보강 합판 필요, 탄소필터 포함 여부 확인, 배송 전 기사 연락 요망"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-blue-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{editingItem ? '수정 내용 저장' : '품목 추가 완료'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
