import { QuickEstimateRequest, StrategicTask, DailyStaffTask, OfficeSupplyItem } from '../types/project';

const STORAGE_KEY_ESTIMATES = 'interior_leftbanner_quick_estimates_v1';
const STORAGE_KEY_STRATEGIC = 'interior_leftbanner_strategic_tasks_v1';
const STORAGE_KEY_DAILY = 'interior_leftbanner_daily_tasks_v1';
const STORAGE_KEY_SUPPLIES = 'interior_leftbanner_office_supplies_v1';

export const INITIAL_QUICK_ESTIMATES: QuickEstimateRequest[] = [
  {
    id: 'qe-1',
    clientCompany: '디자인바이 스튜디오 (성수점)',
    contactName: '박서연 실장 / 010-3452-9811',
    address: '성동구 성수동2가 갤러리아포레 52평형',
    dimensions: '주방 싱크라인 4,800mm (대면형), 아일랜드 2,400 x 1,100mm, 천장고 2,520mm, 복도 간접등박스 18m',
    scopeNotes: '대면형 아일랜드 세라믹 상판, 무몰딩 도장 싱크대, 드레스룸 히든도어 및 맞춤 오픈장 견적 요청',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
    ],
    proposalAmount: '4,500만 ~ 5,000만원 선',
    status: '산출중',
    createdAt: '2026-10-21'
  },
  {
    id: 'qe-2',
    clientCompany: '한샘리하우스 분당수내대리점',
    contactName: '최동진 팀장 / 010-8821-4432',
    address: '분당구 정자동 파크뷰 48평형 주방 리모델링',
    dimensions: 'ㄱ자 주방 3,600 x 2,700mm, 키큰장/냉장고장 2,400mm, 상부장 없는 오픈 선반 구조',
    scopeNotes: '기존 싱크 철거 포함, 백조 사각싱크볼 및 엘리카 매립후드 적용 가견적 산출 요망',
    photos: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    proposalAmount: '2,800만 ~ 3,100만원 선',
    status: '발송완료',
    createdAt: '2026-10-19'
  }
];

export const INITIAL_STRATEGIC_TASKS: StrategicTask[] = [
  {
    id: 'st-1',
    horizon: '단기',
    title: '동절기 현장 타일 접착제 및 수성 도장 보온 양생 지침 배포',
    targetDate: '2026-10-28',
    assignee: '현장총괄 실장',
    isCompleted: false,
    notes: '기온 5도 이하 야간 보일러/열풍기 가동 필수 체크'
  },
  {
    id: 'st-2',
    horizon: '단기',
    title: '블룸(Blum) 오스트리아 본사 하드웨어 4분기 직수입 통관 일정 확인',
    targetDate: '2026-10-31',
    assignee: '자재구매팀 박대리',
    isCompleted: true,
    notes: '11월 첫째 주 부산항 입고 예정'
  },
  {
    id: 'st-3',
    horizon: '중기',
    title: '신규 시공팀 2개조(목공/가구조립) 직영 협력사 등록 및 안전교육',
    targetDate: '2026-11-20',
    assignee: '기술이사',
    isCompleted: false,
    notes: '품질 표준 가이드라인 및 현장 마감 체크리스트 교육 이수'
  },
  {
    id: 'st-4',
    horizon: '장기',
    title: '친환경 E0/Super E0 등급 도장 가구 프리미엄 쇼룸 확장 이전',
    targetDate: '2027-02-28',
    assignee: '대표이사',
    isCompleted: false,
    notes: '강남 논현 가구거리 인근 60평형 후보지 실사 진행'
  }
];

export const INITIAL_DAILY_STAFF_TASKS: DailyStaffTask[] = [
  {
    id: 'dt-1',
    staffName: '최진태 반장',
    date: '2026-10-22',
    taskTitle: '래미안 첼리투스 아일랜드 세라믹 상판 양중 및 1차 안착 보강',
    isDone: false,
    timeSlot: '09:00 - 12:00'
  },
  {
    id: 'dt-2',
    staffName: '김민수 과장',
    date: '2026-10-22',
    taskTitle: '한남 더힐 현장 목공 타공 치수와 엘리카 후드 규격 최종 크로스체크',
    isDone: true,
    timeSlot: '13:00 - 15:00'
  },
  {
    id: 'dt-3',
    staffName: '이지원 대리',
    date: '2026-10-22',
    taskTitle: '금주 발주일정 품목(백조 싱크볼, 쿡탑) 발주서 납품처 팩스 발송 및 납기 확답 수신',
    isDone: false,
    timeSlot: '15:30 - 17:30'
  }
];

export const INITIAL_OFFICE_SUPPLIES: OfficeSupplyItem[] = [
  {
    id: 'sup-1',
    itemName: '3M 종이 마스킹테이프 50mm (박스 단위)',
    quantity: '2박스',
    urgency: '긴급',
    isPurchased: false,
    requester: '보양팀',
    memo: '다음 주 3개 현장 보양 작업용 필수'
  },
  {
    id: 'sup-2',
    itemName: '보시(Bosch) 레이저 거리측정기용 AAA 알카라인 배터리',
    quantity: '20개',
    urgency: '보통',
    isPurchased: true,
    requester: '실측팀',
    memo: '각 팀 실측 가방에 2개씩 분배 완료'
  },
  {
    id: 'sup-3',
    itemName: '바닥 플로베니아 친환경 보양재 3T (1m x 50m)',
    quantity: '5롤',
    urgency: '긴급',
    isPurchased: false,
    requester: '현장관리',
    memo: '한남동 현장 엘리베이터 및 복도 보양'
  },
  {
    id: 'sup-4',
    itemName: '현장 마킹용 스테들러 듀얼 유성펜 (흑/청/적)',
    quantity: '1세트',
    urgency: '보통',
    isPurchased: true,
    requester: '사무실',
    memo: '자재실 비치'
  }
];

export function loadQuickEstimates(): QuickEstimateRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESTIMATES);
    if (!raw) return INITIAL_QUICK_ESTIMATES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUICK_ESTIMATES;
  }
}

export function saveQuickEstimates(data: QuickEstimateRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ESTIMATES, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save quick estimates:', err);
  }
}

export function loadStrategicTasks(): StrategicTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STRATEGIC);
    if (!raw) return INITIAL_STRATEGIC_TASKS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_STRATEGIC_TASKS;
  }
}

export function saveStrategicTasks(data: StrategicTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STRATEGIC, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save strategic tasks:', err);
  }
}

export function loadDailyStaffTasks(): DailyStaffTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY);
    if (!raw) return INITIAL_DAILY_STAFF_TASKS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_DAILY_STAFF_TASKS;
  }
}

export function saveDailyStaffTasks(data: DailyStaffTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save daily staff tasks:', err);
  }
}

export function loadOfficeSupplies(): OfficeSupplyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPPLIES);
    if (!raw) return INITIAL_OFFICE_SUPPLIES;
    return JSON.parse(raw);
  } catch {
    return INITIAL_OFFICE_SUPPLIES;
  }
}

export function saveOfficeSupplies(data: OfficeSupplyItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUPPLIES, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save office supplies:', err);
  }
}
