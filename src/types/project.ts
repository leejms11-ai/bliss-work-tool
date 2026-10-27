export type ProjectStatus = '준비중' | '착공' | '공사중' | '마감점검' | '완공' | 'AS진행';

export interface MeasurementItem {
  id: string;
  space: string; // e.g. 거실, 주방, 안방, 공용욕실, 현관, 발코니, 기타
  title: string; // e.g. 천장고 및 우물천장 깊이
  dimensions?: {
    width?: number; // mm
    depth?: number; // mm
    height?: number; // mm
    unit: string;
  };
  isChecked: boolean;
  notes: string;
  specialIssues: string; // e.g. 벽면 수평 오차 12mm, 누수 흔적 있음
}

export interface DynamicChecklistItem {
  id: string;
  name: string; // ex: 도어색상 2, 수전 2, 세탁기 2
  checked: boolean;
  value: string; // spec or model
}

export interface SiteMeasurementForm {
  // 기본 마감: 일반몰딩/ 인몰딩/ 무몰딩/ 기타
  baseMoulding: {
    type: '일반몰딩' | '인몰딩' | '무몰딩' | '기타';
    customDetail: string;
  };
  // 도어 색상 / 도장색상 (단일 및 다중 지원)
  doorColor: string;
  doorColors?: string[]; // 도어색상 2가지 이상일 경우를 위한 목록
  paintColor: string;
  paintColors?: string[]; // 도장색상 2가지 이상일 경우를 위한 목록
  // 상판
  countertop: {
    material: '인조대리석' | '세라믹' | '엔지니어드스톤' | '기타';
    customMaterial?: string;
    color: string;
    colors?: string[]; // 상판 색상 2가지 이상일 경우를 위한 목록
    cooktopHoles: {
      induction: boolean;
      gasRange: boolean;
      embeddedOutlet: boolean;
      detailNotes: string;
    };
  };
  // 가전 (세탁기, 스타일러, 무선청소기 포함)
  appliances: {
    dishwasher: { checked: boolean; modelOrSize: string };
    robotCleaner: { checked: boolean; modelOrSize: string };
    oven: { checked: boolean; modelOrSize: string };
    riceCooker: { checked: boolean; modelOrSize: string };
    microwave: { checked: boolean; modelOrSize: string };
    refrigerator: {
      checked: boolean;
      isKitchenFit: '키친핏' | '일반형(프리스탠딩)' | '미선택';
      modelOrSize: string;
    };
    kimchiFridge: {
      checked: boolean;
      isKitchenFit?: '키친핏' | '일반형(프리스탠딩)' | '미선택';
      modelOrSize: string;
    };
    systemAc: { checked: boolean; modelOrSize: string };
    // 추가 가전 품목
    washerTower?: { checked: boolean; modelOrSize: string }; // 세탁기(워시타워)
    styler?: { checked: boolean; modelOrSize: string }; // 스타일러(에어드레서)
    vacuumCleaner?: { checked: boolean; modelOrSize: string }; // 무선청소기
    // 각 항목별 다중 추가 지원
    customApplianceList?: DynamicChecklistItem[];
  };
  // 주방 기기류: 수전/ 후드/ 싱크볼/ 쿡탑/ 하드웨어/ 기타 (다중 추가 지원)
  kitchenFixtures: {
    faucet: { checked: boolean; spec: string };
    hood: { checked: boolean; spec: string };
    sinkBowl: { checked: boolean; spec: string };
    cooktop: { checked: boolean; spec: string };
    hardware: { checked: boolean; spec: string };
    etc: { checked: boolean; spec: string };
    customFixtureList?: DynamicChecklistItem[];
  };
  // 기타 기기류: 수저함/ 싱크라인/ 식기건조대/ 싯기/ 매립콘센트 (다중 추가 지원)
  otherFixtures: {
    cutleryTray: { checked: boolean; spec: string };
    sinkLine: { checked: boolean; spec: string };
    dishDryingRack: { checked: boolean; spec: string };
    dishWasherSub: { checked: boolean; spec: string }; // 싯기
    embeddedOutlet: { checked: boolean; spec: string };
    customOtherList?: DynamicChecklistItem[];
  };
  // 젠다이: 외욕실 / 내욕실 (다중 추가 지원)
  ledge: {
    outerBath: { checked: boolean; spec: string };
    innerBath: { checked: boolean; spec: string };
    customLedgeList?: DynamicChecklistItem[];
  };
  // 오픈장 (다중 추가 지원)
  openCabinet: {
    checked: boolean;
    spec: string;
    customOpenCabinetList?: DynamicChecklistItem[];
  };
  // 조명: 8mm 매립/ 18mm 노출 (다중 추가 지원)
  lighting: {
    type: '8mm 매립' | '18mm 노출' | '복합/기타';
    embedded8mm: boolean;
    exposed18mm: boolean;
    notes: string;
    customLightingList?: DynamicChecklistItem[];
  };
  // 거울도어 (다중 추가 지원)
  mirrorDoor: {
    checked: boolean;
    spec: string;
    customMirrorDoorList?: DynamicChecklistItem[];
  };
  // 교체 품목: 도어/ 서랍레일/ 경첩/ 기타 (다중 추가 지원)
  replacementItems: {
    door: { checked: boolean; spec: string };
    drawerRail: { checked: boolean; spec: string };
    hinge: { checked: boolean; spec: string };
    etc: { checked: boolean; spec: string };
    customReplacementList?: DynamicChecklistItem[];
  };
  // 기타 특이 사항
  specialNotes: string;
}

export interface DrawingSheet {
  id: string;
  title: string;
  imageDataUrl: string;
  uploadedAt: string;
  notes?: string;
}

export interface RoughDrawingData {
  imageDataUrl: string | null;
  uploadedAt?: string;
  notes: string;
  measurementsSummary?: string;
  sheets?: DrawingSheet[];
}

export interface OfficialBlueprint {
  id: string;
  title: string;
  version: string; // e.g. v1.0, v2.1
  type: '평면도' | '입면도' | '천장조명도' | '설비배선도' | '가구상세도' | '기타';
  fileUrl: string;
  updatedDate: string;
  remarks: string;
}

export type OrderStatus = '해당없음' | '발주예정' | '발주완료' | '재고사용' | '발주대기' | '배송중' | '입고완료' | '반품/교환';

export const STANDARD_ORDER_CATEGORIES = [
  '후드',
  '싱크볼',
  '쿡탑',
  '수전',
  '도장',
  '하드웨어',
  '조명',
  '손잡이',
  '거울도어',
  '수저함',
  '상판',
  '젠다이',
  '매립콘센트',
  '기타'
] as const;

export type StandardOrderCategory = typeof STANDARD_ORDER_CATEGORIES[number];

export interface OrderItem {
  id: string;
  category: StandardOrderCategory | string; // 발주 품목: 후드, 싱크볼, 쿡탑, 수전, 도장, 하드웨어, 조명, 손잡이, 거울도어, 수저함, 상판, 젠다이, 매립콘센트, 기타
  itemLabel: string; // 품목 표기명 (ex: 후드 1, 후드 2, 싱크볼 1)
  modelName: string; // 모델명 / 규격
  quantity: number; // 수량
  orderPrice: number; // 발주가격 (원가/매입가)
  supplyPrice: number; // 납품가격 (소비자/청구가)
  supplier: string; // 발주처
  orderDate: string; // 발주일자 (YYYY-MM-DD)
  notes: string; // 비고란
  orderStatus: OrderStatus; // 상태: '해당없음' | '발주예정' | '발주완료' | '재고사용'
  unit?: string; // 단위: 개, 세트, m, 롤, 통 등

  // Compatibility fields for legacy items
  itemName?: string;
  spec?: string;
  unitPrice?: number;
  totalPrice?: number;
  deliveryDate?: string;
}

export function createDefaultOrderItems(): OrderItem[] {
  return [
    {
      id: 'ord-init-hood-1',
      category: '후드',
      itemLabel: '후드 1',
      modelName: '엘리카 웨이브 아일랜드 후드 (WAVE IX/F/51)',
      quantity: 1,
      orderPrice: 1250000,
      supplyPrice: 1550000,
      supplier: '엘리카 코리아 B2B총판',
      orderDate: '2026-10-18',
      notes: '천장 보강목 위치 타공 확인 및 탄소필터 1세트 동봉',
      orderStatus: '발주완료',
      unit: '대'
    },
    {
      id: 'ord-init-hood-2',
      category: '후드',
      itemLabel: '후드 2',
      modelName: '하츠 슬림루나 매립형 후드 (보조주방용)',
      quantity: 1,
      orderPrice: 220000,
      supplyPrice: 280000,
      supplier: '하츠 강남특판',
      orderDate: '2026-10-24',
      notes: '보조주방 상부장 일체형 매립 설치',
      orderStatus: '발주예정',
      unit: '대'
    },
    {
      id: 'ord-init-sink-1',
      category: '싱크볼',
      itemLabel: '싱크볼 1',
      modelName: '백조 그랜드 860 사각싱크볼 (엠보 코팅)',
      quantity: 1,
      orderPrice: 420000,
      supplyPrice: 520000,
      supplier: '백조씽크 직영몰',
      orderDate: '2026-10-16',
      notes: '언더시공용 브라켓 및 드레인 배수구 세트 포함',
      orderStatus: '발주완료',
      unit: '세트'
    },
    {
      id: 'ord-init-sink-2',
      category: '싱크볼',
      itemLabel: '싱크볼 2',
      modelName: '백조 SQ480 홈바 서브 사각싱크볼',
      quantity: 1,
      orderPrice: 190000,
      supplyPrice: 240000,
      supplier: '백조씽크 직영몰',
      orderDate: '2026-10-25',
      notes: '와인바 카운터 서브 매립',
      orderStatus: '발주예정',
      unit: '세트'
    },
    {
      id: 'ord-init-cooktop-1',
      category: '쿡탑',
      itemLabel: '쿡탑 1',
      modelName: '디트리쉬 올파이어 인덕션 4구 (DPI7686XP)',
      quantity: 1,
      orderPrice: 1850000,
      supplyPrice: 2200000,
      supplier: '디트리쉬 코리아 공식수입원',
      orderDate: '2026-10-17',
      notes: '직결 배선 전용 차단기 32A 설치 필수',
      orderStatus: '발주완료',
      unit: '대'
    },
    {
      id: 'ord-init-faucet-1',
      category: '수전',
      itemLabel: '수전 1',
      modelName: '더존테크 슈티에 니켈 거위목 폭포수전 (701)',
      quantity: 1,
      orderPrice: 240000,
      supplyPrice: 310000,
      supplier: '더존테크 총판',
      orderDate: '2026-10-18',
      notes: '무광 니켈 마감, 냉온수 고압호스 연장 확인',
      orderStatus: '발주완료',
      unit: '개'
    },
    {
      id: 'ord-init-faucet-2',
      category: '수전',
      itemLabel: '수전 2',
      modelName: '더존테크 하프단수 거위목 수전 (보조주방/정수기 겸용)',
      quantity: 1,
      orderPrice: 120000,
      supplyPrice: 160000,
      supplier: '더존테크 총판',
      orderDate: '2026-10-24',
      notes: '정수기 호스 직결 아답터 포함',
      orderStatus: '발주예정',
      unit: '개'
    },
    {
      id: 'ord-init-paint',
      category: '도장',
      itemLabel: '도장 1',
      modelName: '벤자민무어 스카프-X 에그쉘광 스위스커피 (4갤런)',
      quantity: 4,
      orderPrice: 480000,
      supplyPrice: 620000,
      supplier: '벤자민무어 논현본점',
      orderDate: '2026-10-15',
      notes: '퍼티 3회 완료 후 도장 올스프레이 마감용',
      orderStatus: '발주완료',
      unit: '통'
    },
    {
      id: 'ord-init-hw',
      category: '하드웨어',
      itemLabel: '하드웨어 1',
      modelName: '블룸(Blum) 오스트리아 탠덤박스 & 110도 댐핑 경첩 12조',
      quantity: 12,
      orderPrice: 660000,
      supplyPrice: 840000,
      supplier: '삼진하드웨어 (블룸 공식)',
      orderDate: '2026-10-19',
      notes: '소프트 클로징 댐퍼 일체형 경첩',
      orderStatus: '재고사용',
      unit: '세트'
    },
    {
      id: 'ord-init-light-1',
      category: '조명',
      itemLabel: '조명 1',
      modelName: '8mm 슬림 알루미늄 프로파일 매립 바조명 3000K (12m)',
      quantity: 12,
      orderPrice: 360000,
      supplyPrice: 480000,
      supplier: '필룩스 조명특판',
      orderDate: '2026-10-20',
      notes: '상부장 하부 및 신발장 하부 매립용 SMPS 200W 2개 포함',
      orderStatus: '발주완료',
      unit: 'm'
    },
    {
      id: 'ord-init-light-2',
      category: '조명',
      itemLabel: '조명 2',
      modelName: '3인치 COB 다운라이트 회전형 7W (주백색 4000K)',
      quantity: 36,
      orderPrice: 324000,
      supplyPrice: 450000,
      supplier: '필룩스 조명특판',
      orderDate: '2026-10-26',
      notes: '복도 및 침실 3개소 스위치 2회로 분리',
      orderStatus: '발주예정',
      unit: '개'
    },
    {
      id: 'ord-init-handle',
      category: '손잡이',
      itemLabel: '손잡이 1',
      modelName: '도무스(DOMUS) 방문 손잡이 711NI (무광 니켈)',
      quantity: 7,
      orderPrice: 280000,
      supplyPrice: 360000,
      supplier: '도무스메탈 공식판매점',
      orderDate: '2026-10-18',
      notes: '안방/침실 히든도어용 모티스락 락세트 포함',
      orderStatus: '재고사용',
      unit: '세트'
    },
    {
      id: 'ord-init-mirror',
      category: '거울도어',
      itemLabel: '거울도어 1',
      modelName: '욕실 은경 슬라이딩 거울수납장 (1200 x 800mm, 하부 간접홈)',
      quantity: 2,
      orderPrice: 520000,
      supplyPrice: 680000,
      supplier: '인스바스 제작가구',
      orderDate: '2026-10-25',
      notes: '내부 드라이기용 방우 콘센트 매립형',
      orderStatus: '발주예정',
      unit: '통'
    },
    {
      id: 'ord-init-cutlery',
      category: '수저함',
      itemLabel: '수저함 1',
      modelName: '원목 훈증오크 디바이더 수저분리함 600용 (블룸 서랍 전용)',
      quantity: 1,
      orderPrice: 85000,
      supplyPrice: 120000,
      supplier: '삼진하드웨어',
      orderDate: '2026-10-20',
      notes: '블룸 탠덤박스 서랍 내경 맞춤형',
      orderStatus: '발주완료',
      unit: '개'
    },
    {
      id: 'ord-init-top',
      category: '상판',
      itemLabel: '상판 1',
      modelName: '이태리 라미남 세라믹 비앙코 12T (3800 x 1050mm 대형 아일랜드)',
      quantity: 1,
      orderPrice: 2400000,
      supplyPrice: 3100000,
      supplier: '가우디 스톤앤세라믹',
      orderDate: '2026-10-28',
      notes: '공장 CNC 정밀 가공 타공 (디트리쉬 인덕션 + 싱크볼 + 팝업콘센트)',
      orderStatus: '발주예정',
      unit: '식'
    },
    {
      id: 'ord-init-ledge',
      category: '젠다이',
      itemLabel: '젠다이 1',
      modelName: '조적 젠다이 졸리컷 가공 타일 및 비앙코 인조대리석 선반 120mm',
      quantity: 2,
      orderPrice: 180000,
      supplyPrice: 260000,
      supplier: '현대 L&C 칸스톤 대리점',
      orderDate: '2026-10-20',
      notes: '외욕실 조적 타일 졸리컷 / 안방욕실 대리석 상판',
      orderStatus: '발주완료',
      unit: '세트'
    },
    {
      id: 'ord-init-outlet',
      category: '매립콘센트',
      itemLabel: '매립콘센트 1',
      modelName: '바흐만(Bachmann) 트위스트 매립형 회전 콘센트 (2구 + 고속 무선충전)',
      quantity: 1,
      orderPrice: 195000,
      supplyPrice: 260000,
      supplier: '바흐만 코리아 특판',
      orderDate: '2026-10-21',
      notes: '아일랜드 세라믹 상판 원형 타공 105mm 매립',
      orderStatus: '발주완료',
      unit: '개'
    },
    {
      id: 'ord-init-etc',
      category: '기타',
      itemLabel: '기타 1',
      modelName: '주방 하부 싱크라인 누수감지센서 및 절수페달 1세트',
      quantity: 1,
      orderPrice: 110000,
      supplyPrice: 160000,
      supplier: '미래S&D',
      orderDate: '2026-10-22',
      notes: '아일랜드 싱크볼 하부 급수 밸브 체결형',
      orderStatus: '해당없음',
      unit: '식'
    }
  ];
}

export type PhotoPhase = '시공 전' | '시공 후';

export interface CompletionPhoto {
  id: string;
  photoUrl: string;
  caption: string;
  description?: string; // 선택한 사진별 상세 설명/메모
  phase: '시공 전' | '시공 후' | '시공전' | '시공중' | '시공완료' | string; // 시공 전 / 시공 후 2단계 지원 및 호환
  room?: string; // 공간 구분 제거 (호환용 선택 필드)
  date: string;
}

export interface QuoteItem {
  id: string;
  category: string; // 공종: 철거, 목공, 전기/조명, 타일, 욕실, 필름, 도배, 바닥재, 주방가구, 기타
  itemName: string;
  spec: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  remarks?: string;
}

export interface PreliminaryProposal {
  summary: string; // 가견적안 제안 개요
  scope: string; // 공사 범위
  estimatedAmountText: string; // 예상 견적 금액대 (예: 약 4,200만 ~ 4,700만원)
  keyNotes: string; // 주요 제안 및 협의 사항
  registeredAt: string;
}

export interface CabinetItem {
  id: string;
  cabinetType: string; // 상부장, 키큰장, 붙박이장, 하부장, 냉장고장, 아일랜드 등
  material: string; // 자재 (예: PET 무광, 우레탄 도장, LPM, 원목무늬목 등)
  unitType: 'meter' | 'ja' | '자' | 'm'; // 미터당 단가 or 자당 단가 선택
  unitPrice: number; // 단가 (원)
  dimensionMm: number; // 치수 (mm)
  // EP(End Panel) 추가
  epSmallCount: number; // ep 소 4만원/개
  epMediumCount: number; // ep 중 6만원/개
  epLargeCount: number; // ep 대 8만원/개
  // 금액 추가 항목
  lightingLengthM: number; // 조명 (m당 4만원)
  lightingSmpsCount: number; // SMPS (개당 4만원)
  openCabinetBoardCount: number; // 오픈장 (합판 1장당 10만원 + 시공비 5만원)
  mirrorDoorCount: number; // 거울도어 (1장당 15만원)
  handleUnitPrice: number; // 손잡이 개당 단가
  handleCount: number; // 손잡이 수량
  innerDrawerCount: number; // 내부서랍 (1칸당 5만원)
  // 기타추가비용 항목
  etcCost?: number; // 입력한 액수만큼 견적에 추가 (원)
  etcCostNote?: string; // 기타추가비용 사유/내역
  remarks?: string;
}

export interface SpaceCabinetGroup {
  id: string;
  spaceName: string; // 본주방, 보조주방, 수납, 창고, 기타
  items: CabinetItem[];
}

export interface CountertopQuoteItem {
  id: string;
  location: string; // 싱크대, 보조주방, 화장대, 아일랜드 등
  material: string; // 인조대리석(중국산), 인조대리석(국산), 인조대리석(오로라), 엔지니어드스톤(칸스톤), 세라믹(중국산), 세라믹(이태리산)
  wideMm: number; // wide (가로 mm)
  depthMm: number; // depth (폭 mm)
  thicknessMm: number; // thickness (두께 mm / 12T, 20T, 30T 등)
  unitPricePerMeter: number; // 미터당 단가 (인조 중국산 13만, 국산 14만, 오로라 19만, 엔지니어드스톤 24.5만, 세라믹 중국 36만, 이태리 51만~)
  depthRatePercent?: number; // 광폭 할증률 (%): 폭(Depth) 기본값(100/130/160/200/250%) 외 임의 지정 가능
  marginRatePercent?: number; // 마진 퍼센트 (%): 기본값 120% 외 임의 지정 가능
  notes?: string;
}

export interface KitchenApplianceQuoteItem {
  id: string;
  category: string; // 후드, 수전, 싱크볼, 수저함, 쿡탑, 하드웨어, 식기건조대, 싱크라인, 기타
  modelName: string;
  manufacturer: string;
  price: number;
  quantity: number;
  installFee: number; // 설치비
  remarks?: string;
}

export interface OtherHardwareQuoteItem {
  id: string;
  itemName: string; // 매립콘센트, 하드웨어, 손잡이 일괄 등
  spec: string;
  price: number;
  quantity: number;
  installFee?: number; // 설치비 명목 비용 추가 (원)
  remarks?: string;
}

export interface JendaiQuoteItem {
  id: string;
  location: string; // 외욕실, 내욕실, 공용욕실 등
  wideMm: number;
  depthMm: number;
  thicknessMm: number;
  unitPricePerMeter?: number; // m당 단가 (기본 25,000원, 임의 입력 가능)
  remarks?: string;
}

export interface LogisticsQuoteItem {
  id: string;
  itemType: string; // 권역비(목대), 사다리차비용, 기타운임/양중 등
  amount: number;
  details: string;
}

export interface DetailedFinalQuote {
  spaceCabinetGroups: SpaceCabinetGroup[];
  countertops: CountertopQuoteItem[];
  kitchenAppliances: KitchenApplianceQuoteItem[];
  otherHardware: OtherHardwareQuoteItem[];
  jendaiItems: JendaiQuoteItem[];
  logisticsItems: LogisticsQuoteItem[];
  includeVat: boolean;
  discountAmount: number;
  marginRate?: number;
  notes?: string;
}

export interface ProjectEstimates {
  preliminaryProposal?: PreliminaryProposal; // 가견적안 내용 등록 (계산 양식 대체)
  preliminaryQuote: QuoteItem[]; // (호환용)
  finalQuote: QuoteItem[]; // 본견적 (호환용)
  detailedFinalQuote?: DetailedFinalQuote; // 새로 제작된 공간별/상판/기기류/기타 정밀 본 견적 계산서
  marginRate: number; // e.g. 15 (%)
  includeVat: boolean; // 10%
  discountAmount: number;
}

// 왼쪽 배너: 가견적 계산 및 자료 입력
export interface QuickEstimateRequest {
  id: string;
  clientCompany: string; // 업체명 / 의뢰처
  contactName: string; // 담당자 / 연락처
  address: string; // 현장 주소 / 평수
  dimensions: string; // 실측 치수 및 구조 정보
  scopeNotes: string; // 가견적 요청 내용
  photos: string[]; // 현장 사진 및 도면 자료 dataUrl 목록
  proposalAmount: string; // 가견적 산출 금액대
  calculatedQuote?: DetailedFinalQuote; // 본견적 계산기와 동일한 상세 산출 견적서
  status: '접수대기' | '산출중' | '발송완료';
  createdAt: string;
}

// 왼쪽 배너: 기본 업무 (단기-중기-장기, 담당자별 오늘 업무, 비품 목록)
export interface StrategicTask {
  id: string;
  horizon: '단기' | '중기' | '장기'; // 단기(1~2주), 중기(1~3개월), 장기(6개월~1년)
  title: string;
  targetDate: string;
  assignee: string;
  isCompleted: boolean;
  notes?: string;
}

export interface DailyStaffTask {
  id: string;
  staffName: string;
  date: string;
  taskTitle: string;
  isDone: boolean;
  timeSlot?: string;
}

export interface OfficeSupplyItem {
  id: string;
  itemName: string;
  quantity: string;
  urgency: '보통' | '긴급';
  isPurchased: boolean;
  requester?: string;
  memo?: string;
}

export type DefectSeverity = '긴급' | '보통' | '경미';
export type DefectStatus = '접수' | '처리중' | '조치완료';

export interface DefectItem {
  id: string;
  title: string;
  location: string;
  reportedDate: string;
  targetDate: string; // 조치 예정일 (목표 완료일 -> 조치 예정일)
  targetTimeSlot?: string; // 조치 예정 시간대 (예: 오전 09:00~12:00, 오후 14:00~16:00, 종일 등)
  severity?: DefectSeverity; // 심각도 항목 삭제 요청 반영 (선택 필드로 유지)
  status: DefectStatus;
  assignee: string;
  actionTaken?: string;
  photoUrl?: string;
  resolvedDate?: string;
}

export interface InteriorProject {
  id: string;
  name: string; // 현장명
  clientCompany: string; // 업체명 및 고객명
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: ProjectStatus;
  color: string;
  
  // 기본 정보 (Basic Info for Modal)
  constructionTeam: string; // 시공팀
  teamCount: number; // 시공인원
  teamMembers: string; // 상세 인원 구성
  address: string; // 현장주소
  addressDetail: string; // 동/호수 및 상세주소
  accessCode: string; // 출입비밀번호 (전체/호환용)
  buildingAccessCode?: string; // 공동현관 비밀번호
  unitAccessCode?: string; // 세대 도어락 비밀번호
  scopeSummary: string; // 시공에 대한 간단한 내용
  managerName: string; // 현장소장
  managerPhone: string; // 현장소장 연락처
  
  // 상세 정보 (Detailed Info Tabs)
  siteMeasurementForm?: SiteMeasurementForm; // 현장 정밀 실측 마감 및 기기 체크리스트 양식
  measurementChecklist: MeasurementItem[]; // 1. 실측 체크리스트 (공간별 치수)
  roughDrawing: RoughDrawingData; // 2. 가도면 입력
  officialBlueprints: OfficialBlueprint[]; // 3. 본도면 입력
  orderChecklist: OrderItem[]; // 4. 발주 품목 체크리스트
  completionPhotos: CompletionPhoto[]; // 5. 시공 완료 사진등록
  estimates: ProjectEstimates; // 6. 가견적 및 본견적 작성
  defectAndAS: DefectItem[]; // 7. A/S 및 미마감 내용 입력

  createdAt: string;
  updatedAt: string;
}

export const createDefaultSiteMeasurementForm = (): SiteMeasurementForm => ({
  baseMoulding: {
    type: '무몰딩',
    customDetail: ''
  },
  doorColor: '예: 무광 크림화이트 (PET)',
  paintColor: '예: 벤자민무어 스위스커피 / 오프화이트',
  countertop: {
    material: '인조대리석',
    customMaterial: '',
    color: 'LX 오로라 비앙코 12T',
    cooktopHoles: {
      induction: true,
      gasRange: false,
      embeddedOutlet: true,
      detailNotes: '인덕션 4구 (560 x 480mm 타공) + 하츠 매립 콘센트 1구'
    }
  },
  appliances: {
    dishwasher: { checked: true, modelOrSize: '밀레 14인용 식기세척기 (도어 패널 일체형)' },
    robotCleaner: { checked: true, modelOrSize: '로보락 S8 Pro 직배수 키트 (하부장 띄움 150mm)' },
    oven: { checked: true, modelOrSize: '삼성 비스포크 빌트인 오븐 50L' },
    riceCooker: { checked: true, modelOrSize: '쿠쿠 6인용 인출식 레일장 (밥솥장)' },
    microwave: { checked: false, modelOrSize: '' },
    refrigerator: {
      checked: true,
      isKitchenFit: '키친핏',
      modelOrSize: '비스포크 4도어 키친핏 (깊이 700mm 플랫라인)'
    },
    kimchiFridge: { checked: true, isKitchenFit: '키친핏', modelOrSize: '비스포크 1도어 변온 김치냉장고' },
    systemAc: { checked: true, modelOrSize: 'LG 휘센 4실 (거실/주방/안방/작은방) 단내림 간접등' },
    washerTower: { checked: true, modelOrSize: 'LG 트롬 워시타워 (세탁 24kg + 건조 20kg 직렬)' },
    styler: { checked: true, modelOrSize: 'LG 스타일러 오브제컬렉션 5벌용 (드레스룸 빌트인)' },
    vacuumCleaner: { checked: true, modelOrSize: '다이슨 Gen5 디텍트 (신발장/펜트리 내 충전 거치대)' }
  },
  kitchenFixtures: {
    faucet: { checked: true, spec: '더존테크 슈티에 무광니켈 거위목 폭포수전' },
    hood: { checked: true, spec: '하츠 스퀘어 아일랜드 후드 (배기덕트 150A)' },
    sinkBowl: { checked: true, spec: '백조 그랜드 860 사각 싱크볼 (언더시공)' },
    cooktop: { checked: true, spec: '디트리쉬 인덕션 올파이어 3구' },
    hardware: { checked: true, spec: '블룸(Blum) 오스트리아 댐퍼 경첩 & 탠덤박스 서랍' },
    etc: { checked: false, spec: '' }
  },
  otherFixtures: {
    cutleryTray: { checked: true, spec: '원목 수저분리함 600용' },
    sinkLine: { checked: true, spec: '스테인리스 싱크라인 롤매트' },
    dishDryingRack: { checked: true, spec: '상부장 매립형 와이어 건조선반' },
    dishWasherSub: { checked: true, spec: '소형 채소/식기 세척볼 바스켓' },
    embeddedOutlet: { checked: true, spec: '아일랜드 무선충전 팝업 콘센트 2구' }
  },
  ledge: {
    outerBath: { checked: true, spec: '조적 젠다이 120mm 돌출 + 포세린 졸리컷 마감' },
    innerBath: { checked: true, spec: '인조대리석 상판 젠다이 (오로라 화이트)' }
  },
  openCabinet: {
    checked: true,
    spec: '주방 홈바 오크 원목 오픈장 (간접 T5 LED 조명 포함)'
  },
  lighting: {
    type: '8mm 매립',
    embedded8mm: true,
    exposed18mm: false,
    notes: '상부장 하부 8mm 슬림 알루미늄 매립 바조명 3000K 전구색'
  },
  mirrorDoor: {
    checked: true,
    spec: '욕실 플랩장 은경 거울도어 (하부 간접조명 연동)'
  },
  replacementItems: {
    door: { checked: true, spec: '싱크대 상/하부장 전체 도어 친환경 PET 무광' },
    drawerRail: { checked: true, spec: '블룸 소프트 클로징 댐핑 언더레일 4세트' },
    hinge: { checked: true, spec: '블룸 110도 클립탑 댐퍼 경첩 전량 교체' },
    etc: { checked: false, spec: '' }
  },
  specialNotes: '주방 슬라브 코어링 시 난방배관 열화상 카메라 사전 탐지 필수. 냉장고장 상부 플랩도어 처짐 방지용 보강목 시공 요망.'
});
