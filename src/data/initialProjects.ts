import { InteriorProject, createDefaultOrderItems } from '../types/project';

// Import generated realistic architectural interior assets
import livingRoomImg from '../assets/images/hero_interior_living_1792655427781.jpg';
import cafeImg from '../assets/images/interior_cafe_commercial_1792655428187.jpg';
import kitchenImg from '../assets/images/interior_kitchen_remodel_1792655428546.jpg';
import bathroomImg from '../assets/images/interior_bathroom_tile_1792655428403.jpg';

export const INITIAL_PROJECTS: InteriorProject[] = [
  {
    id: 'proj-01',
    name: '한남 더힐 204동 54평 전체 리모델링',
    clientCompany: '(주)아키스페이스 / 김서연 대표',
    startDate: '2026-10-05',
    endDate: '2026-11-20',
    status: '공사중',
    color: '#2563EB', // Blue
    constructionTeam: '종합시공 프리미엄 1팀',
    teamCount: 6,
    teamMembers: '현장소장 박현우, 목공반장 최진태, 전기기사 김영석, 조적/미장 2인, 잡부 1인',
    address: '서울특별시 용산구 한남대로 91',
    addressDetail: '204동 1402호 (지하 2층 주차 후 3호기 EV 이용)',
    accessCode: '공동현관 #4589# / 세대 도어락 *1290*',
    buildingAccessCode: '#4589#',
    unitAccessCode: '*1290*',
    scopeSummary: '54평형 아파트 전체 철거 후 히든도어, 라인조명, 무몰딩, 도장마감, 아일랜드 대형화, 욕실 2개소 호텔식 졸리컷 타일 시공',
    managerName: '박현우 소장',
    managerPhone: '010-8921-3490',
    
    siteMeasurementForm: {
      baseMoulding: { type: '무몰딩', customDetail: '히든도어 라인 및 무몰딩 도장 마감' },
      doorColor: '예림 럭셔리 매트 화이트 (PET 무광)',
      paintColor: '벤자민무어 스위스커피 / 도장 올퍼티 3회',
      countertop: {
        material: '세라믹',
        customMaterial: '',
        color: '이태리 라미남 비앙코 12T (물방울 방지 언더가공)',
        cooktopHoles: {
          induction: true,
          gasRange: false,
          embeddedOutlet: true,
          detailNotes: '디트리쉬 인덕션 타공 560x480mm + 바흐만 트위스트 팝업콘센트'
        }
      },
      appliances: {
        dishwasher: { checked: true, modelOrSize: '밀레 14인용 패널일체형 식기세척기' },
        robotCleaner: { checked: true, modelOrSize: '로보락 S8 Pro Ultra 직배수 키트 (하부장 180mm 띄움)' },
        oven: { checked: true, modelOrSize: '밀레 빌트인 오븐 76L' },
        riceCooker: { checked: true, modelOrSize: '쿠쿠 6인용 슬라이딩 댐핑 인출장' },
        microwave: { checked: false, modelOrSize: '' },
        refrigerator: { checked: true, isKitchenFit: '키친핏', modelOrSize: '삼성 비스포크 4도어 키친핏 (깊이 700mm)' },
        kimchiFridge: { checked: true, isKitchenFit: '키친핏', modelOrSize: '비스포크 1도어 키친핏 김치냉장고' },
        systemAc: { checked: true, modelOrSize: 'LG 휘센 5실 (거실/주방/마스터룸/침실2) 단내림 간접등박스' }
      },
      kitchenFixtures: {
        faucet: { checked: true, spec: '더존테크 슈티에 니켈 거위목 폭포수전' },
        hood: { checked: true, spec: '엘리카 웨이브 아일랜드 후드' },
        sinkBowl: { checked: true, spec: '백조 그랜드 860 사각싱크볼 언더시공' },
        cooktop: { checked: true, spec: '디트리쉬 올파이어 3구 인덕션' },
        hardware: { checked: true, spec: '블룸(Blum) 오스트리아 탠덤박스 & 댐퍼 경첩' },
        etc: { checked: true, spec: '절수페달 및 하부 싱크라인 누수감지센서' }
      },
      otherFixtures: {
        cutleryTray: { checked: true, spec: '원목 훈증오크 수저분리함 600용' },
        sinkLine: { checked: true, spec: 'SUS304 롤업 싱크라인 매트' },
        dishDryingRack: { checked: true, spec: '상부장 매립형 와이어 건조랙' },
        dishWasherSub: { checked: true, spec: '식기세척 전용 다목적 세척볼' },
        embeddedOutlet: { checked: true, spec: '아일랜드 팝업 무선충전 2구' }
      },
      ledge: {
        outerBath: { checked: true, spec: '조적 젠다이 120mm 졸리컷 마감' },
        innerBath: { checked: true, spec: '천연대리석 비앙코 상판 젠다이 100mm' }
      },
      openCabinet: {
        checked: true,
        spec: '주방 와인바 오크 원목 오픈장 (간접 T5 3000K 내장)'
      },
      lighting: {
        type: '8mm 매립',
        embedded8mm: true,
        exposed18mm: false,
        notes: '상부장 하부 8mm 슬림 알루미늄 매립 바조명'
      },
      mirrorDoor: {
        checked: true,
        spec: '욕실 은경 슬라이딩 도어 및 신발장 1도어 전신은경'
      },
      replacementItems: {
        door: { checked: true, spec: '주방 상하부장 전체 친환경 무광 PET 도어' },
        drawerRail: { checked: true, spec: '블룸 소프트클로징 댐핑 언더레일 5조' },
        hinge: { checked: true, spec: '블룸 110도 클립탑 댐퍼 경첩 전량 교체' },
        etc: { checked: true, spec: '알루미늄 C찬넬 및 목공 걸레받이 50mm' }
      },
      specialNotes: '슬라브 바닥 난방배관 열화상 카메라 탐지 후 코어링 진행 완료. 냉장고장 상부 플랩도어 처짐 방지용 철물 보강 필수.'
    },

    measurementChecklist: [
      {
        id: 'meas-1',
        space: '거실',
        title: '거실 우물천장 규격 및 스프링클러 헤드 높이',
        dimensions: { width: 5600, depth: 4800, height: 2620, unit: 'mm' },
        isChecked: true,
        notes: '천장고 2,620mm 확보 가능. 슬라브 하부 배관 간섭 없음.',
        specialIssues: '스프링클러 신축배관 4개소 이설 필요'
      },
      {
        id: 'meas-2',
        space: '주방',
        title: '대형 아일랜드 싱크대 급배수관 및 후드 배기구 위치',
        dimensions: { width: 3800, depth: 1050, height: 900, unit: 'mm' },
        isChecked: true,
        notes: '바닥 코어링 배관 구배 확보 양호 (75A 배관 연장)',
        specialIssues: '배기덕트 벽체 코어 타공 직경 150mm 확인 완료'
      },
      {
        id: 'meas-3',
        space: '안방',
        title: '붙박이장 라인 벽체 수직도 및 콘센트 위치',
        dimensions: { width: 4200, depth: 680, height: 2450, unit: 'mm' },
        isChecked: true,
        notes: '레이저 레벨기 기준 우측 벽체 +8mm 오차 있음. 가구 마감 몰딩 15mm로 여유 설계 필요',
        specialIssues: '벽체 미장 크랙 1개소 메움 필요'
      },
      {
        id: 'meas-4',
        space: '공용욕실',
        title: '젠다이 및 매립수전 배관 깊이/위치',
        dimensions: { width: 2400, depth: 1750, height: 2300, unit: 'mm' },
        isChecked: false,
        notes: '600x1200 대형 타일 졸리컷 시공 예정. 조적 젠다이 120mm 돌출 시공',
        specialIssues: '기존 방수층 철거 후 아쿠아디펜스 3회 도포 필수'
      },
      {
        id: 'meas-5',
        space: '현관',
        title: '신발장 하부 띄움 및 벤치 공간 치수',
        dimensions: { width: 1950, depth: 2100, height: 2400, unit: 'mm' },
        isChecked: true,
        notes: '하부 간접조명 T5 배선 1회로 분리 완료',
        specialIssues: '방화문 문틀 도장 보양 필요'
      }
    ],

    roughDrawing: {
      imageDataUrl: kitchenImg,
      uploadedAt: '2026-10-06',
      notes: '초기 현장 답사 시 손스케치 치수 기록. 주방 벽체 철거 가능 여부 관리사무소 도면 대조 완료 (비내력벽 판정). 거실창 기준 동향 볕 잘 듦.',
      measurementsSummary: '전용면적 178㎡ / 발코니 확장 2개소 / 실측 천장고 2,620mm',
      sheets: [
        {
          id: 'sheet-init-1',
          title: '주방 아일랜드 배관 실측',
          imageDataUrl: kitchenImg,
          uploadedAt: '2026-10-06',
          notes: '급배수관 75A 이설 위치 확인 및 상판 타공선 검토'
        },
        {
          id: 'sheet-init-2',
          title: '거실 우물천장·창호 실측',
          imageDataUrl: livingRoomImg,
          uploadedAt: '2026-10-06',
          notes: '스프링클러 헤드 높이 및 마그네틱 라인조명 위치'
        },
        {
          id: 'sheet-init-3',
          title: '공용욕실 조적젠다이 현장',
          imageDataUrl: bathroomImg,
          uploadedAt: '2026-10-06',
          notes: '졸리컷 타일 시공 라인 및 매립수전 배관 깊이'
        }
      ]
    },

    officialBlueprints: [
      {
        id: 'bp-1',
        title: '최종 실시설계 평면도 v2.3 (확정안)',
        version: 'v2.3',
        type: '평면도',
        fileUrl: livingRoomImg,
        updatedDate: '2026-10-08',
        remarks: '클라이언트 최종 승인본, 주방 아일랜드 3,800mm 연장안 반영'
      },
      {
        id: 'bp-2',
        title: '천장 조명 및 전열 설비 계통도',
        version: 'v2.0',
        type: '천장조명도',
        fileUrl: livingRoomImg,
        updatedDate: '2026-10-09',
        remarks: '3인치 COB 다운라이트 3000K 및 마그네틱 라인조명 회로 분리도'
      },
      {
        id: 'bp-3',
        title: '주방 맞춤가구 제작 상세 입면도',
        version: 'v1.5',
        type: '가구상세도',
        fileUrl: kitchenImg,
        updatedDate: '2026-10-11',
        remarks: '밀레 식기세척기 및 인덕션 빌트인 치수 반영'
      }
    ],

    orderChecklist: createDefaultOrderItems(),


    completionPhotos: [
      {
        id: 'cp-1',
        photoUrl: livingRoomImg,
        caption: '철거 전 거실 아트월 및 기존 등박스 상태',
        description: '철거 전 기존 우물천장 스프링클러 위치 및 비내력벽 배관 상태 현장 점검 기록',
        phase: '시공 전',
        date: '2026-10-06'
      },
      {
        id: 'cp-2',
        photoUrl: livingRoomImg,
        caption: '거실 메인 아트월 및 무몰딩 도장, 간접 등박스 목공 마감',
        description: '벤자민무어 스위스커피 올퍼티 도장 3회 완료 및 3인치 다운라이트 배선 점등 테스트',
        phase: '시공 후',
        date: '2026-10-20'
      },
      {
        id: 'cp-3',
        photoUrl: bathroomImg,
        caption: '호텔형 공용욕실 대형 타일 졸리컷 및 매립 수전 세팅 완료',
        description: '600x1200 포세린 타일 졸리컷 정밀 마감 및 아쿠아디펜스 3회 방수 검수 통과',
        phase: '시공 후',
        date: '2026-10-21'
      }
    ],

    estimates: {
      preliminaryQuote: [
        { id: 'pq-1', category: '철거공사', itemName: '전체 철거 및 폐기물 반출', spec: '바닥/벽체/욕실 2개소 올철거', unit: '식', quantity: 1, unitPrice: 8500000, amount: 8500000, remarks: '폐기물 2.5톤 4대분' },
        { id: 'pq-2', category: '목공사', itemName: '무몰딩 천장 평탄화 및 히든도어', spec: '영림 보드 및 자작합판', unit: '식', quantity: 1, unitPrice: 24000000, amount: 24000000, remarks: '히든도어 6세트 포함' },
        { id: 'pq-3', category: '전기조명', itemName: '배선 신설 및 분전함 교체', spec: '난연 CD관 및 3인치 타공', unit: '식', quantity: 1, unitPrice: 9500000, amount: 9500000, remarks: '스위치 르그랑 아테오' },
        { id: 'pq-4', category: '타일욕실', itemName: '욕실 2개소 및 현관/주방 타일', spec: '600x1200 졸리컷', unit: '식', quantity: 1, unitPrice: 19000000, amount: 19000000, remarks: '도기/수전 포함' },
        { id: 'pq-5', category: '주방가구', itemName: '제작 씽크대 및 아일랜드', spec: 'PET 무광 도어 / 세라믹 상판', unit: '식', quantity: 1, unitPrice: 28000000, amount: 28000000, remarks: '블룸 하드웨어' },
        { id: 'pq-6', category: '바닥도배', itemName: '원목마루 및 친환경 도배', spec: '원목 190폭 / 친환경 실크', unit: '식', quantity: 1, unitPrice: 17000000, amount: 17000000, remarks: '퍼티 3회 올퍼티' }
      ],
      finalQuote: [
        { id: 'fq-1', category: '철거공사', itemName: '전체 철거 및 정밀 폐기물 반출', spec: '기존 온돌마루 샌딩 포함', unit: '식', quantity: 1, unitPrice: 8900000, amount: 8900000, remarks: '소음 방지 컷팅 적용' },
        { id: 'fq-2', category: '목공사', itemName: '무몰딩/히든도어 및 스텝도어 목공', spec: '특수 하드웨어 매립 7세트', unit: '식', quantity: 1, unitPrice: 25500000, amount: 25500000, remarks: '문틀 라인 오차 1mm 이내' },
        { id: 'fq-3', category: '전기조명', itemName: '스마트 IoT 분전함 및 라인조명', spec: '스마트 라이팅 제어기 포함', unit: '식', quantity: 1, unitPrice: 10200000, amount: 10200000, remarks: '조도 디밍 제어' },
        { id: 'fq-4', category: '타일욕실', itemName: '욕실 2개소 대형 박판 세라믹 및 타일', spec: '아덱스 에폭시 줄눈 시공', unit: '식', quantity: 1, unitPrice: 20500000, amount: 20500000, remarks: '욕조 매립 조적' },
        { id: 'fq-5', category: '주방가구', itemName: '이태리 세라믹 상판 대형 아일랜드', spec: '라미남 12T 상판 / 훈증오크', unit: '식', quantity: 1, unitPrice: 29800000, amount: 29800000, remarks: '엘리카 후드 매립' },
        { id: 'fq-6', category: '바닥도배', itemName: '최고급 원목마루 및 올퍼티 친환경벽지', spec: '친환경 인증 접착제', unit: '식', quantity: 1, unitPrice: 17800000, amount: 17800000, remarks: '품질보증 2년' }
      ],
      marginRate: 12,
      includeVat: true,
      discountAmount: 2000000
    },

    defectAndAS: [
      {
        id: 'as-1',
        title: '안방 드레스룸 도어 하부 레일 유격 조정',
        location: '안방 드레스룸 슬라이딩 도어',
        reportedDate: '2026-10-18',
        targetDate: '2026-10-23',
        targetTimeSlot: '오전 (09:00 ~ 11:00)',
        severity: '보통',
        status: '처리중',
        assignee: '가구팀 이진호 과장',
        actionTaken: '슬라이딩 댐퍼 유압 부속 교체 부품 준비 완료, 내일 방문 점검 예정'
      },
      {
        id: 'as-2',
        title: '주방 수전 하부 온수 밸브 미세 누수 체크',
        location: '주방 아일랜드 싱크볼 하부장',
        reportedDate: '2026-10-19',
        targetDate: '2026-10-20',
        severity: '긴급',
        status: '조치완료',
        assignee: '설비팀 송기철 기사',
        actionTaken: '테프론 테이프 재시공 및 고무 패킹 교체 후 수압 테스트 통과',
        resolvedDate: '2026-10-20'
      }
    ],

    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-21T18:30:00Z'
  },
  {
    id: 'proj-02',
    name: '성수동 로스터리 카페 45평 상업 인테리어',
    clientCompany: '카페 브루클린 / 김민우 대표',
    startDate: '2026-10-12',
    endDate: '2026-11-08',
    status: '공사중',
    color: '#D97706', // Amber
    constructionTeam: '상업공간 특화 2팀',
    teamCount: 5,
    teamMembers: '현장소장 정우진, 금속반장 김대식, 설비기사 1인, 타일 2인',
    address: '서울특별시 성동구 연무장길 42',
    addressDetail: '1층 전면 상가 (카페 브루클린)',
    accessCode: '상가 1층 개방 / 전면 셔터 키보관함 7788',
    buildingAccessCode: '상가 1층 개방',
    unitAccessCode: '전면 셔터 키보관함 7788',
    scopeSummary: '노출 콘크리트 천장 살림, 대형 바 카운터 템바보드 및 천연 대리석 상판, 3상 380V 동력 증설, 주방 트렌치 배수 설비',
    managerName: '정우진 실장',
    managerPhone: '010-4412-8890',
    
    measurementChecklist: [
      {
        id: 'meas-201',
        space: '주방/바카운터',
        title: '에스프레소 머신 급수압 및 퇴수 트렌치 위치',
        dimensions: { width: 6200, depth: 1200, height: 920, unit: 'mm' },
        isChecked: true,
        notes: '하이와트 에스프레소 머신 단독 5kW 전열 배선 인입 완료',
        specialIssues: '바닥 트렌치 배수 구배 1/50 확보 완료'
      },
      {
        id: 'meas-202',
        space: '메인 홀',
        title: '노출 천장 레이스웨이 조명 라인 및 냉난방기',
        dimensions: { width: 8500, depth: 6000, height: 3800, unit: 'mm' },
        isChecked: true,
        notes: '천장고 3,800mm로 매우 높음. 사다리 작업대 비계 설치 완료',
        specialIssues: '천장 기존 앵커 볼트 녹제거 도색 필요'
      }
    ],

    roughDrawing: {
      imageDataUrl: null,
      uploadedAt: '2026-10-12',
      notes: '카운터 바 동선 1,100mm 확보, 바리스타 2인 동시 추출 동선 체크완료',
      measurementsSummary: '상가 실평수 45평 / 층고 3.8m / 계약전력 25kW'
    },

    officialBlueprints: [
      {
        id: 'bp-201',
        title: '카페 레이아웃 평면도 및 주방 설비도',
        version: 'v1.4',
        type: '설비배선도',
        fileUrl: cafeImg,
        updatedDate: '2026-10-13',
        remarks: '그라인더 3대, 제빙기 2대, 테이블 냉장고 4대 전열 위치 확정'
      }
    ],

    orderChecklist: [
      {
        id: 'ord-201',
        category: '하드웨어',
        itemLabel: '하드웨어 1',
        modelName: '원형 템바보드 12T x 2400mm (월넛)',
        quantity: 18,
        unit: '장',
        supplier: '동화디자인월 특판',
        orderDate: '2026-10-16',
        orderPrice: 65000,
        supplyPrice: 85000,
        orderStatus: '발주완료',
        notes: '방염 필름 래핑 시험성적서 첨부 필수'
      },
      {
        id: 'ord-202',
        category: '조명',
        itemLabel: '조명 1',
        modelName: '빈티지 황동 팬던트 조명 및 트랙 스팟 (3000K)',
        quantity: 14,
        unit: '개',
        supplier: '이케아 B2B / 을지로 조명가',
        orderDate: '2026-10-26',
        orderPrice: 92000,
        supplyPrice: 125000,
        orderStatus: '발주예정',
        notes: '조광기(디머) 연동 스위치 박스 확인'
      },
      {
        id: 'ord-203',
        category: '수전',
        itemLabel: '수전 1',
        modelName: '바 카운터 매립형 피처린서 일체형 드립 수전',
        quantity: 1,
        unit: '세트',
        supplier: '카페인하우스 B2B',
        orderDate: '2026-10-19',
        orderPrice: 280000,
        supplyPrice: 360000,
        orderStatus: '발주완료',
        notes: '고압 냉온수 배관 직결 테스트 완료'
      }
    ],

    completionPhotos: [
      {
        id: 'cp-201',
        photoUrl: cafeImg,
        caption: '성수 카페 메인 바 카운터 템바보드 및 간접조명 완성',
        description: '월넛 템바보드 및 천연대리석 상판 세팅 완료. 바리스타 동선 조명 점등 확인.',
        phase: '시공 후',
        date: '2026-10-21'
      }
    ],

    estimates: {
      preliminaryQuote: [
        { id: 'pq-21', category: '금속/설비', itemName: '주방 트렌치 방수 및 동력 증설', spec: '25kW 승압 및 트렌치', unit: '식', quantity: 1, unitPrice: 13500000, amount: 13500000, remarks: '전기안전공사 검사비 포함' },
        { id: 'pq-22', category: '목공/가구', itemName: '바 카운터 및 베이커리 쇼케이스 제작', spec: '천연대리석 + 템바보드', unit: '식', quantity: 1, unitPrice: 22000000, amount: 22000000, remarks: '내부 스테인리스 프레임' },
        { id: 'pq-23', category: '도장/바닥', itemName: '노출 천장 에어리스 도장 및 에폭시 바닥', spec: '무용제 친환경 라이닝', unit: '식', quantity: 1, unitPrice: 11000000, amount: 11000000, remarks: '바닥 레벨링 포함' }
      ],
      finalQuote: [
        { id: 'fq-21', category: '금속/설비', itemName: '주방 트렌치 방수 및 동력 증설', spec: '25kW 정밀 시공', unit: '식', quantity: 1, unitPrice: 13900000, amount: 13900000, remarks: '계약 완료' },
        { id: 'fq-22', category: '목공/가구', itemName: '바 카운터 및 베이커리 쇼케이스 제작', spec: '최종 상판 네로마퀴나 적용', unit: '식', quantity: 1, unitPrice: 23200000, amount: 23200000, remarks: '제작중' },
        { id: 'fq-23', category: '도장/바닥', itemName: '노출 천장 에어리스 및 세라믹 코팅 에폭시', spec: '내마모성 강화', unit: '식', quantity: 1, unitPrice: 11500000, amount: 11500000, remarks: '시공 완료' }
      ],
      marginRate: 15,
      includeVat: true,
      discountAmount: 1500000
    },

    defectAndAS: [
      {
        id: 'as-201',
        title: '퇴수관 호스 조임 밴드 체결 상태 확인',
        location: '제빙기 하부 퇴수 배관',
        reportedDate: '2026-10-21',
        targetDate: '2026-10-23',
        severity: '보통',
        status: '접수',
        assignee: '설비 배관팀',
        actionTaken: '부속 자재 준비 중'
      }
    ],

    createdAt: '2026-10-08T11:00:00Z',
    updatedAt: '2026-10-21T16:00:00Z'
  },
  {
    id: 'proj-03',
    name: '판교 봇들마을 3단지 34평 주방/욕실 모던 리모델링',
    clientCompany: '개인 고객 / 이지훈 고객님',
    startDate: '2026-10-20',
    endDate: '2026-11-12',
    status: '공사중',
    color: '#059669', // Emerald
    constructionTeam: '주방/욕실 전문 4팀',
    teamCount: 4,
    teamMembers: '팀장 오세훈, 타일공 2인, 배관설비 1인',
    address: '경기도 성남시 분당구 판교원로 120',
    addressDetail: '305동 801호',
    accessCode: '공동현관 1234# / 세대도어락 5678*',
    buildingAccessCode: '1234#',
    unitAccessCode: '5678*',
    scopeSummary: '34평형 거주 중 부분 리모델링. 주방 대면형 구조 변경, 안방/공용 욕실 2개소 올철거 후 호텔식 타일 욕실 리뉴얼',
    managerName: '오세훈 팀장',
    managerPhone: '010-7711-2309',
    
    measurementChecklist: [
      {
        id: 'meas-301',
        space: '주방',
        title: '기존 냉장고장 깊이 및 가스배관 차단',
        dimensions: { width: 3400, depth: 950, height: 2350, unit: 'mm' },
        isChecked: true,
        notes: '도시가스 배관 철거 및 인덕션 4구 전용 4스퀘어 배선 신설',
        specialIssues: '관리실 승인 및 가스 누출 탐지기 교체 필요'
      },
      {
        id: 'meas-302',
        space: '공용욕실',
        title: '욕조 철거 후 샤워 파티션 배수구 및 바닥 단차',
        dimensions: { width: 2150, depth: 1650, height: 2280, unit: 'mm' },
        isChecked: true,
        notes: '조적 샤워 파티션 800mm 폭 시공',
        specialIssues: '트렌치 유가 800mm 매립'
      }
    ],

    roughDrawing: {
      imageDataUrl: null,
      uploadedAt: '2026-10-18',
      notes: '주방 11자 대면형 구조 변경 시 냉장고와 씽크대 통로 950mm 확보',
      measurementsSummary: '주방 3.4m x 2.8m / 욕실 2개소'
    },

    officialBlueprints: [
      {
        id: 'bp-301',
        title: '주방 맞춤가구 제작 도면 v1.2',
        version: 'v1.2',
        type: '가구상세도',
        fileUrl: kitchenImg,
        updatedDate: '2026-10-19',
        remarks: '키친핏 냉장고 3도어 규격 맞춤'
      }
    ],

    orderChecklist: [
      {
        id: 'ord-301',
        category: '수전',
        itemLabel: '수전 1',
        modelName: '더존테크 니켈 매립 해바라기 샤워 수전 2세트',
        quantity: 2,
        unit: '세트',
        supplier: '더존테크 대리점',
        orderDate: '2026-10-23',
        orderPrice: 380000,
        supplyPrice: 480000,
        orderStatus: '발주완료',
        notes: '공용욕실 및 안방욕실 매립 박스 시공 완료'
      },
      {
        id: 'ord-302',
        category: '후드',
        itemLabel: '후드 1',
        modelName: '하츠 로빈 900 침니형 블랙 (RBH-90B)',
        quantity: 1,
        unit: '대',
        supplier: '하츠 경기특판',
        orderDate: '2026-10-24',
        orderPrice: 360000,
        supplyPrice: 450000,
        orderStatus: '발주예정',
        notes: '배기 자바라 125파이 및 풍량 역류방지 댐퍼 필수'
      },
      {
        id: 'ord-303',
        category: '상판',
        itemLabel: '상판 1',
        modelName: '현대 L&C 칸스톤 트랜퀼리티 20T',
        quantity: 1,
        unit: '식',
        supplier: '현대L&C 대리점',
        orderDate: '2026-10-25',
        orderPrice: 1800000,
        supplyPrice: 2300000,
        orderStatus: '재고사용',
        notes: '공장 재고 자재 가공 투입'
      }
    ],

    completionPhotos: [
      {
        id: 'cp-301',
        photoUrl: kitchenImg,
        caption: '판교 봇들마을 대면형 아일랜드 및 모던 다크 주방 완공',
        description: '칸스톤 트랜퀼리티 20T 상판 시공 및 인덕션 4구 전용 직결 배선 연결 완료',
        phase: '시공 후',
        date: '2026-10-21'
      }
    ],

    estimates: {
      preliminaryQuote: [
        { id: 'pq-31', category: '철거공사', itemName: '주방 및 욕실 2개소 철거', spec: '욕조/도기/가구/폐기물', unit: '식', quantity: 1, unitPrice: 3800000, amount: 3800000, remarks: '당일 철거 반출' },
        { id: 'pq-32', category: '타일방수', itemName: '욕실 2개소 올타일 및 아쿠아디펜스 방수', spec: '600각 타일 졸리컷', unit: '식', quantity: 1, unitPrice: 7800000, amount: 7800000, remarks: '도기 설치비 포함' },
        { id: 'pq-33', category: '주방가구', itemName: '대면형 주방 씽크대 & 냉장고장', spec: 'E0 친환경 PET / 인조대리석', unit: '식', quantity: 1, unitPrice: 12500000, amount: 12500000, remarks: '백조 사각싱크볼' }
      ],
      finalQuote: [
        { id: 'fq-31', category: '철거공사', itemName: '주방 및 욕실 2개소 철거', spec: '욕조/도기/가구 정밀 철거', unit: '식', quantity: 1, unitPrice: 3800000, amount: 3800000, remarks: '완료' },
        { id: 'fq-32', category: '타일방수', itemName: '욕실 2개소 600각 타일 및 3회 도막방수', spec: '아덱스 에폭시 줄눈', unit: '식', quantity: 1, unitPrice: 8200000, amount: 8200000, remarks: '진행중' },
        { id: 'fq-33', category: '주방가구', itemName: '대면형 주방 씽크대 & 냉장고장', spec: 'LX 하이막스 오로라 상판', unit: '식', quantity: 1, unitPrice: 13200000, amount: 13200000, remarks: '발주 완료' }
      ],
      marginRate: 14,
      includeVat: true,
      discountAmount: 800000
    },

    defectAndAS: [],

    createdAt: '2026-10-15T14:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z'
  }
];
