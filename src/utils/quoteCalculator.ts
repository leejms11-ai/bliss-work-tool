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

export const COUNTERTOP_MATERIAL_PRICES: Record<string, number> = {
  '인조대리석(중국산)': 130000, // 13만원/m 로 수정
  '인조대리석(국산)': 140000,
  '인조대리석(오로라)': 190000,
  '엔지니어드스톤(칸스톤)': 245000,
  '세라믹(중국산)': 360000,
  '세라믹(이태리산)': 510000
};

export function getDepthRate(depthMm: number): { rate: number; label: string } {
  if (depthMm <= 700) {
    return { rate: 1.0, label: '~700mm (기본 100%)' };
  } else if (depthMm <= 900) {
    return { rate: 1.3, label: '~900mm (130% 할증)' };
  } else if (depthMm <= 1000) {
    return { rate: 1.6, label: '~1000mm (160% 할증)' };
  } else if (depthMm <= 1200) {
    return { rate: 2.0, label: '~1200mm (200% 할증)' };
  } else {
    return { rate: 2.5, label: '1200mm 초과 광폭 (250% 할증)' };
  }
}

export function calcCabinetItem(item: CabinetItem): {
  dimensionMeter: number;
  dimensionJa: number;
  baseAmount: number;
  epAmount: number;
  lightingAmount: number;
  openCabinetAmount: number;
  mirrorDoorAmount: number;
  handleAmount: number;
  innerDrawerAmount: number;
  etcCost: number;
  additionalAmount: number;
  totalAmount: number;
} {
  const mm = Number(item.dimensionMm) || 0;
  const dimensionMeter = mm / 1000;
  const dimensionJa = mm / 300; // 1자 = 300mm

  const unitPrice = Number(item.unitPrice) || 0;
  const isMeter = item.unitType === 'meter' || item.unitType === 'm';
  const baseAmount = isMeter 
    ? Math.round(unitPrice * dimensionMeter)
    : Math.round(unitPrice * dimensionJa);

  // ep 추가: ep 개당 소 4만원/ 중 6만원/ 대 8만원
  const epSmall = (Number(item.epSmallCount) || 0) * 40000;
  const epMed = (Number(item.epMediumCount) || 0) * 60000;
  const epLrg = (Number(item.epLargeCount) || 0) * 80000;
  const epAmount = epSmall + epMed + epLrg;

  // 조명: m당 4만원, smps 개당 4만원
  const lightM = (Number(item.lightingLengthM) || 0) * 40000;
  const smps = (Number(item.lightingSmpsCount) || 0) * 40000;
  const lightingAmount = lightM + smps;

  // 오픈장: 합판 0장은 0원, 1장 이상부터는 합판 1장당 10만원 + 기본 시공비 5만원
  const openCount = Number(item.openCabinetBoardCount) || 0;
  const openCabinetAmount = openCount > 0 ? (openCount * 100000 + 50000) : 0;

  // 거울도어: 1장당 15만원
  const mirrorDoorAmount = (Number(item.mirrorDoorCount) || 0) * 150000;

  // 손잡이: 개당 단가 * 수량
  const handleAmount = (Number(item.handleUnitPrice) || 0) * (Number(item.handleCount) || 0);

  // 내부서랍 추가 시 1칸당 5만원
  const innerDrawerAmount = (Number(item.innerDrawerCount) || 0) * 50000;

  // 기타추가비용 항목
  const etcCost = Number(item.etcCost) || 0;

  const additionalAmount = lightingAmount + openCabinetAmount + mirrorDoorAmount + handleAmount + innerDrawerAmount + etcCost;
  const totalAmount = baseAmount + epAmount + additionalAmount;

  return {
    dimensionMeter,
    dimensionJa,
    baseAmount,
    epAmount,
    lightingAmount,
    openCabinetAmount,
    mirrorDoorAmount,
    handleAmount,
    innerDrawerAmount,
    etcCost,
    additionalAmount,
    totalAmount
  };
}

export function calcCountertopItem(item: CountertopQuoteItem): {
  wideMeter: number;
  depthRate: number;
  depthRatePercent: number;
  depthLabel: string;
  marginRate: number;
  marginRatePercent: number;
  totalAmount: number;
} {
  const wideMm = Number(item.wideMm) || 0;
  const depthMm = Number(item.depthMm) || 0;
  const unitPrice = Number(item.unitPricePerMeter) || 0;

  const wideMeter = wideMm / 1000;
  const autoDepth = getDepthRate(depthMm);

  // 광폭 할증률 (%): 사용자 직접 입력값 우선, 없으면 깊이(Depth) 기준 자동 할증률
  const depthRatePercent = item.depthRatePercent !== undefined && Number(item.depthRatePercent) > 0
    ? Number(item.depthRatePercent)
    : Math.round(autoDepth.rate * 100);
  const depthRate = depthRatePercent / 100;
  const depthLabel = item.depthRatePercent !== undefined && Number(item.depthRatePercent) > 0
    ? `${depthRatePercent}% (직접지정)`
    : autoDepth.label;

  // 마진 퍼센트 (%): 사용자 직접 입력값 우선, 없으면 기본 120%
  const marginRatePercent = item.marginRatePercent !== undefined && Number(item.marginRatePercent) > 0
    ? Number(item.marginRatePercent)
    : 120;
  const marginRate = marginRatePercent / 100;

  // 견적액 = 기본단가 * wide(m) * 광폭 할증 적용 * 마진 퍼센트 적용
  const totalAmount = Math.round(unitPrice * wideMeter * depthRate * marginRate);

  return {
    wideMeter,
    depthRate,
    depthRatePercent,
    depthLabel,
    marginRate,
    marginRatePercent,
    totalAmount
  };
}

export function calcKitchenApplianceItem(item: KitchenApplianceQuoteItem): number {
  const price = Number(item.price) || 0;
  const qty = Number(item.quantity) || 0;
  const install = Number(item.installFee) || 0;
  return price * qty + install;
}

export function calcOtherHardwareItem(item: OtherHardwareQuoteItem): number {
  const price = Number(item.price) || 0;
  const qty = Number(item.quantity) || 0;
  const install = Number(item.installFee) || 0;
  return price * qty + install;
}

export function calcJendaiItem(item: JendaiQuoteItem): { wideMeter: number; unitPrice: number; totalAmount: number } {
  const wideMm = Number(item.wideMm) || 0;
  const wideMeter = wideMm / 1000;
  // m당 단가 (기본값 2.5만원 / 25,000원, 임의 입력값 허용)
  const unitPrice = (item.unitPricePerMeter !== undefined && item.unitPricePerMeter !== null && !isNaN(Number(item.unitPricePerMeter)))
    ? Number(item.unitPricePerMeter)
    : 25000;
  const totalAmount = Math.round(wideMeter * unitPrice);
  return { wideMeter, unitPrice, totalAmount };
}

export function calcDetailedFinalQuoteTotals(quote: DetailedFinalQuote) {
  // 1. 가구/장 견적 합계
  let cabinetTotal = 0;
  const spaceSubtotals: Record<string, number> = {};

  (quote.spaceCabinetGroups || []).forEach(group => {
    let groupSum = 0;
    (group.items || []).forEach(item => {
      const calc = calcCabinetItem(item);
      groupSum += calc.totalAmount;
    });
    spaceSubtotals[group.spaceName] = groupSum;
    cabinetTotal += groupSum;
  });

  // 2. 상판 견적 합계
  let countertopTotal = 0;
  (quote.countertops || []).forEach(item => {
    const calc = calcCountertopItem(item);
    countertopTotal += calc.totalAmount;
  });

  // 3. 주방 기기류 견적 합계
  let applianceTotal = 0;
  (quote.kitchenAppliances || []).forEach(item => {
    applianceTotal += calcKitchenApplianceItem(item);
  });

  // 4. 기타 기기류 견적 합계
  let otherHardwareTotal = 0;
  (quote.otherHardware || []).forEach(item => {
    otherHardwareTotal += calcOtherHardwareItem(item);
  });

  // 5. 기타 항목: 젠다이 + 물류비(권역비/사다리차)
  let jendaiTotal = 0;
  (quote.jendaiItems || []).forEach(item => {
    const calc = calcJendaiItem(item);
    jendaiTotal += calc.totalAmount;
  });

  let logisticsTotal = 0;
  (quote.logisticsItems || []).forEach(item => {
    logisticsTotal += Number(item.amount) || 0;
  });

  const miscellaneousTotal = jendaiTotal + logisticsTotal;

  // 전체 공급가액 (합계)
  const supplyTotal = cabinetTotal + countertopTotal + applianceTotal + otherHardwareTotal + miscellaneousTotal;
  const discount = Number(quote.discountAmount) || 0;
  const netSupplyTotal = Math.max(0, supplyTotal - discount);
  const vatTotal = quote.includeVat ? Math.round(netSupplyTotal * 0.1) : 0;
  const grandTotal = netSupplyTotal + vatTotal;

  return {
    cabinetTotal,
    spaceSubtotals,
    countertopTotal,
    applianceTotal,
    otherHardwareTotal,
    jendaiTotal,
    logisticsTotal,
    miscellaneousTotal,
    supplyTotal,
    discount,
    netSupplyTotal,
    vatTotal,
    grandTotal
  };
}

export function createDefaultDetailedFinalQuote(): DetailedFinalQuote {
  return {
    includeVat: true,
    discountAmount: 0,
    notes: '본 견적은 지정 규격 및 하드웨어(블룸 등) 기준이며, 현장 실측 오차 ±5mm 이내 시공 조건입니다.',
    spaceCabinetGroups: [
      {
        id: 'sp-main-kitchen',
        spaceName: '본주방',
        items: [
          {
            id: 'cab-1',
            cabinetType: '상부장',
            material: 'PET 무광 화이트',
            unitType: 'meter',
            unitPrice: 380000,
            dimensionMm: 3600,
            epSmallCount: 2,
            epMediumCount: 0,
            epLargeCount: 0,
            lightingLengthM: 3.6,
            lightingSmpsCount: 1,
            openCabinetBoardCount: 0,
            mirrorDoorCount: 0,
            handleUnitPrice: 0,
            handleCount: 0,
            innerDrawerCount: 0,
            remarks: '하부 8mm 슬림 알루미늄 간접조명 매립'
          },
          {
            id: 'cab-2',
            cabinetType: '하부장',
            material: 'PET 무광 웜그레이',
            unitType: 'meter',
            unitPrice: 480000,
            dimensionMm: 3600,
            epSmallCount: 0,
            epMediumCount: 2,
            epLargeCount: 0,
            lightingLengthM: 0,
            lightingSmpsCount: 0,
            openCabinetBoardCount: 0,
            mirrorDoorCount: 0,
            handleUnitPrice: 6000,
            handleCount: 8,
            innerDrawerCount: 3,
            remarks: '블룸 탠덤박스 댐핑 레일 3단 적용'
          },
          {
            id: 'cab-3',
            cabinetType: '키큰장/냉장고장',
            material: 'PET 무광 화이트',
            unitType: '자',
            unitPrice: 160000,
            dimensionMm: 2700,
            epSmallCount: 0,
            epMediumCount: 0,
            epLargeCount: 2,
            lightingLengthM: 0,
            lightingSmpsCount: 0,
            openCabinetBoardCount: 1,
            mirrorDoorCount: 0,
            handleUnitPrice: 0,
            handleCount: 0,
            innerDrawerCount: 2,
            remarks: '홈카페 오픈장 (우드 합판 1장 + 간접조명)'
          }
        ]
      },
      {
        id: 'sp-sub-kitchen',
        spaceName: '보조주방',
        items: [
          {
            id: 'cab-4',
            cabinetType: '하부장',
            material: 'LPM 무광 화이트',
            unitType: 'meter',
            unitPrice: 360000,
            dimensionMm: 2100,
            epSmallCount: 1,
            epMediumCount: 1,
            epLargeCount: 0,
            lightingLengthM: 0,
            lightingSmpsCount: 0,
            openCabinetBoardCount: 0,
            mirrorDoorCount: 0,
            handleUnitPrice: 4000,
            handleCount: 4,
            innerDrawerCount: 1,
            remarks: '보조 2구 인덕션 및 서브 싱크볼 하부장'
          }
        ]
      },
      {
        id: 'sp-storage',
        spaceName: '수납',
        items: [
          {
            id: 'cab-5',
            cabinetType: '붙박이장',
            material: '우레탄 도장 스위스커피',
            unitType: '자',
            unitPrice: 190000,
            dimensionMm: 3300,
            epSmallCount: 0,
            epMediumCount: 0,
            epLargeCount: 2,
            lightingLengthM: 0,
            lightingSmpsCount: 0,
            openCabinetBoardCount: 0,
            mirrorDoorCount: 1,
            handleUnitPrice: 12000,
            handleCount: 6,
            innerDrawerCount: 4,
            remarks: '안방 드레스룸 전신 은경 거울도어 1장 포함'
          }
        ]
      },
      {
        id: 'sp-warehouse',
        spaceName: '창고',
        items: [
          {
            id: 'cab-6',
            cabinetType: '시스템선반장',
            material: 'E0 친환경 PB 화이트',
            unitType: 'meter',
            unitPrice: 240000,
            dimensionMm: 1800,
            epSmallCount: 0,
            epMediumCount: 1,
            epLargeCount: 0,
            lightingLengthM: 0,
            lightingSmpsCount: 0,
            openCabinetBoardCount: 0,
            mirrorDoorCount: 0,
            handleUnitPrice: 0,
            handleCount: 0,
            innerDrawerCount: 0,
            remarks: '팬트리 선반 4단'
          }
        ]
      }
    ],
    countertops: [
      {
        id: 'ct-1',
        location: '싱크대',
        material: '인조대리석(오로라)',
        wideMm: 3600,
        depthMm: 680,
        thicknessMm: 12,
        unitPricePerMeter: 190000,
        notes: '전면 뒷턱 없는 슬림 12T 마감'
      },
      {
        id: 'ct-2',
        location: '아일랜드',
        material: '세라믹(이태리산)',
        wideMm: 2400,
        depthMm: 1050,
        thicknessMm: 20,
        unitPricePerMeter: 510000,
        notes: '라미남 세라믹 20T 광폭(~1200mm, 200% 할증) 및 4면 졸리컷 베벨 마감'
      },
      {
        id: 'ct-3',
        location: '보조주방',
        material: '인조대리석(국산)',
        wideMm: 2100,
        depthMm: 650,
        thicknessMm: 12,
        unitPricePerMeter: 140000,
        notes: '슬림 12T 언더볼 매립'
      }
    ],
    kitchenAppliances: [
      {
        id: 'app-1',
        category: '후드',
        modelName: '엘리카 웨이브 아일랜드 후드 (WAVE IX/F/51)',
        manufacturer: '엘리카',
        price: 1550000,
        quantity: 1,
        installFee: 150000,
        remarks: '천장 보강목 설치 및 탄소필터형'
      },
      {
        id: 'app-2',
        category: '싱크볼',
        modelName: '그랜드 860 사각싱크볼 (엠보)',
        manufacturer: '백조씽크',
        price: 520000,
        quantity: 1,
        installFee: 50000,
        remarks: '언더시공 및 드레인 세트 포함'
      },
      {
        id: 'app-3',
        category: '수전',
        modelName: '슈티에 1257 싱크수전 (니켈)',
        manufacturer: '더존테크',
        price: 380000,
        quantity: 1,
        installFee: 30000,
        remarks: '거위목 인출식 수전'
      },
      {
        id: 'app-4',
        category: '쿡탑',
        modelName: '올파이어 인덕션 4구 (DPI7686XP)',
        manufacturer: '디트리쉬',
        price: 2400000,
        quantity: 1,
        installFee: 100000,
        remarks: '전용 누전차단기 30A 직결 배선'
      },
      {
        id: 'app-5',
        category: '수저함',
        modelName: '블룸 오르가라인 고급 원목 수저함 900용',
        manufacturer: '블룸(Blum)',
        price: 180000,
        quantity: 1,
        installFee: 0,
        remarks: '원목 디바이더 세트'
      },
      {
        id: 'app-6',
        category: '식기건조대',
        modelName: '상부장 매립형 스테인리스 2단 식기건조대',
        manufacturer: '엔텍',
        price: 120000,
        quantity: 1,
        installFee: 20000,
        remarks: '물받침 트레이 포함'
      }
    ],
    otherHardware: [
      {
        id: 'oth-1',
        itemName: '매립콘센트',
        spec: '바흐만 트위스트 2구 + 무선충전 (블랙)',
        price: 260000,
        quantity: 1,
        installFee: 30000,
        remarks: '아일랜드 상판 원형 105mm 타공 매립'
      },
      {
        id: 'oth-2',
        itemName: '하드웨어 일괄',
        spec: '블룸 크립탑 110도 댐핑 경첩 및 탠덤 레일 12세트',
        price: 840000,
        quantity: 1,
        installFee: 0,
        remarks: '도어 충격 완충 댐퍼 내장'
      },
      {
        id: 'oth-3',
        itemName: '손잡이 일괄',
        spec: '도무스 무광 니켈 바손잡이 160mm',
        price: 12000,
        quantity: 14,
        installFee: 20000,
        remarks: '신발장 및 수납장 도어 설치'
      }
    ],
    jendaiItems: [
      {
        id: 'jd-1',
        location: '외욕실 (공용욕실)',
        wideMm: 2400,
        depthMm: 120,
        thicknessMm: 20,
        unitPricePerMeter: 25000,
        remarks: '천연 대리석 느낌 인조대리석 20T 조적 매립'
      },
      {
        id: 'jd-2',
        location: '내욕실 (안방욕실)',
        wideMm: 1800,
        depthMm: 120,
        thicknessMm: 20,
        unitPricePerMeter: 25000,
        remarks: '세면대 및 양변기 상부 젠다이 마감'
      }
    ],
    logisticsItems: [
      {
        id: 'log-1',
        itemType: '권역비(목대)',
        amount: 350000,
        details: '서울/경기 수도권 목대 운반 및 양중비'
      },
      {
        id: 'log-2',
        itemType: '사다리차비용',
        amount: 250000,
        details: '아파트 12층 5톤 탑차 가구 양중 1회'
      }
    ]
  };
}
