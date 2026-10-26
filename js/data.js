// 기본 속성 및 태그 정의 (Supabase attribute_definitions 테이블과 동일한 구조)
export const DEFAULT_ATTRIBUTE_DEFINITIONS = [
  {
    key: 'job_category',
    category: 'career',
    label: '직업 분류',
    input_type: 'select',
    options: [
      '대기업',
      '공기업/공공기관',
      '전문직(의사/변호사/회계사 등)',
      '금융권',
      '외국계',
      'IT/스타트업',
      '공무원/교직',
      '자영업/사업',
      '프리랜서',
      '대학원생/학생',
      '기타'
    ]
  },
  {
    key: 'education',
    category: 'career',
    label: '학력',
    input_type: 'select',
    options: [
      '4년제 대졸(수도권)',
      '4년제 대졸(지방거점/기타)',
      '국내외 명문대',
      '석사 이상',
      '전문대졸',
      '고졸 이하'
    ]
  },
  {
    key: 'income_range',
    category: 'career',
    label: '연봉 구간',
    input_type: 'select',
    options: ['4,000만 미만', '4,000~6,000만', '6,000~8,000만', '8,000~1억', '1억 이상', '비공개']
  },
  {
    key: 'body_type',
    category: 'appearance',
    label: '체형',
    input_type: 'select',
    options: ['마름', '슬림탄탄', '보통', '통통', '근육질/건장', '글래머']
  },
  {
    key: 'look_tags',
    category: 'appearance',
    label: '외모/분위기 태그',
    input_type: 'multi_select',
    options: [
      '#강아지상',
      '#고양이상',
      '#두부상',
      '#여우상',
      '#공룡상',
      '#곰돌이상',
      '#사슴상',
      '#단아함',
      '#화려함',
      '#깔끔/댄디',
      '#귀여움',
      '#훈남/훈녀',
      '#동안',
      '#안경잘어울림',
      '#웃는게예쁜',
      '#피부좋음'
    ]
  },
  {
    key: 'smoking',
    category: 'lifestyle',
    label: '흡연 여부',
    input_type: 'select',
    options: ['비흡연', '전자담배', '연초', '금연중']
  },
  {
    key: 'drinking',
    category: 'lifestyle',
    label: '음주 빈도',
    input_type: 'select',
    options: ['전혀 안 마심', '가끔(사회적 음주)', '주 1~2회 즐김', '애주가']
  },
  {
    key: 'religion',
    category: 'lifestyle',
    label: '종교',
    input_type: 'select',
    options: ['무교', '기독교', '천주교', '불교', '기타']
  },
  {
    key: 'mbti',
    category: 'lifestyle',
    label: 'MBTI',
    input_type: 'select',
    options: [
      'ENFP', 'ENFJ', 'ENTP', 'ENTJ',
      'ESFP', 'ESFJ', 'ESTP', 'ESTJ',
      'INFP', 'INFJ', 'INTP', 'INTJ',
      'ISFP', 'ISFJ', 'ISTP', 'ISTJ', '모름'
    ]
  },
  {
    key: 'personality_tags',
    category: 'lifestyle',
    label: '성향/취미 태그',
    input_type: 'multi_select',
    options: [
      '#집돌이/집순이',
      '#밖순이/활동적',
      '#운동/헬스',
      '#테니스/골프',
      '#러닝/등산',
      '#맛집/카페탐방',
      '#여행좋아함',
      '#연락잘됨',
      '#다정다감',
      '#유머러스',
      '#차분함',
      '#자차보유',
      '#자취중'
    ]
  },
  {
    key: 'marriage_intent',
    category: 'lifestyle',
    label: '결혼 생각',
    input_type: 'select',
    options: [
      '1~2년 내 결혼 희망',
      '좋은 사람 만나면 결혼 생각 있음',
      '연애부터 천천히',
      '아직 결혼 생각 없음'
    ]
  },
  {
    key: 'deal_breakers',
    category: 'ideal',
    label: '절대 불가 조건 (Deal-breaker)',
    input_type: 'multi_select',
    options: [
      '흡연자 불가',
      '종교 있음 불가',
      '다른 종교 불가',
      '장거리 불가',
      '술 좋아하는 사람 불가',
      '문신 불가'
    ]
  }
];

const MALE_PHOTO_SETS = [
  [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&auto=format&fit=crop&q=80'
  ]
];

const FEMALE_PHOTO_SETS = [
  [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop&q=80'
  ],
  [
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&auto=format&fit=crop&q=80'
  ]
];

// 남성 20명 + 여성 20명 = 총 40명의 다양한 샘플 매물 데이터
const MALE_RAW = [
  { id: 'sample-m-1', name: '김민준', year: 1993, height: 181, loc: '서울 강남/서초', rel: '대학 동기 (성격 보증)', status: 'waiting', jobCat: '대기업', jobDet: '현대자동차 선임연구원', edu: '국내외 명문대', inc: '8,000~1억', body: '슬림탄탄', looks: ['#강아지상', '#두부상', '#깔끔/댄디', '#웃는게예쁜'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFJ', pers: ['#운동/헬스', '#러닝/등산', '#다정다감', '#연락잘됨', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1993, iMaxY: 1998, iMinH: 160, iMaxH: 172, iJobs: ['대기업', '공기업/공공기관', '전문직(의사/변호사/회계사 등)', '금융권', '공무원/교직'], iLooks: ['#단아함', '#강아지상', '#웃는게예쁜', '#귀여움'], iBreak: ['흡연자 불가', '종교 있음 불가'], iMemo: '밝고 예의 바르고 대화가 잘 통하는 분 선호. 주말에 맛집 다니고 같이 운동할 수 있으면 좋겠음.', raw: '[카톡 원문]\n야 나 이제 진짜 정착하고 싶다ㅋㅋ 주변에 참하고 밝은 분 있으면 소개 좀 해줘! 키는 160 이상이면 좋겠고 비흡연에 무교였으면 좋겠어. 자취하고 차 있어서 어디든 데리러 갈 수 있음!' },
  { id: 'sample-m-2', name: '박현우', year: 1991, height: 177, loc: '서울 여의도/마포', rel: '테니스 동호회 지인', status: 'waiting', jobCat: '전문직(의사/변호사/회계사 등)', jobDet: '대형 회계법인 공인회계사(CPA)', edu: '국내외 명문대', inc: '1억 이상', body: '보통', looks: ['#안경잘어울림', '#깔끔/댄디', '#곰돌이상', '#동안'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ISTJ', pers: ['#테니스/골프', '#맛집/카페탐방', '#차분함', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1991, iMaxY: 1997, iMinH: 158, iMaxH: 170, iJobs: ['대기업', '공기업/공공기관', '전문직(의사/변호사/회계사 등)', '공무원/교직', '금융권'], iLooks: ['#고양이상', '#단아함', '#귀여움'], iBreak: ['흡연자 불가'], iMemo: '지적이고 대화가 통하는 분. 맛있는 와인이나 위스키 한잔 같이 할 수 있으면 더 좋음.', raw: '[카톡 원문]\n시즌 끝나서 이제 좀 여유가 생겼어. 진지하게 결혼 생각하고 만날 수 있는 분 찾고 있음. 외모는 고양이상이나 단아한 스타일 좋아해!' },
  { id: 'sample-m-3', name: '정우성', year: 1996, height: 184, loc: '성남 분당/판교', rel: '사촌 동생 지인', status: 'matching', jobCat: 'IT/스타트업', jobDet: '네카라쿠배 백엔드 개발자', edu: '4년제 대졸(수도권)', inc: '8,000~1억', body: '근육질/건장', looks: ['#공룡상', '#훈남/훈녀', '#깔끔/댄디'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'INTJ', pers: ['#운동/헬스', '#집돌이/집순이', '#연락잘됨', '#자차보유'], mar: '연애부터 천천히', iMinY: 1995, iMaxY: 2000, iMinH: 158, iMaxH: 175, iJobs: ['IT/스타트업', '대기업', '공기업/공공기관', '프리랜서'], iLooks: ['#귀여움', '#두부상', '#강아지상'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '술자리 너무 좋아하지 않고 같이 운동하거나 조용히 데이트 즐기는 분 선호.', raw: '[카톡 원문]\n형 판교나 강남 쪽에서 만날 수 있는 분 계시면 부탁드려요! 저는 술담배 아예 안 하고 헬스만 합니다ㅎㅎ 귀여운 두부상 스타일 좋아해요.' },
  { id: 'sample-m-4', name: '최도윤', year: 1990, height: 180, loc: '서울 압구정/신사', rel: '고등학교 동창', status: 'waiting', jobCat: '전문직(의사/변호사/회계사 등)', jobDet: '강남 개원가 피부과 봉직의', edu: '석사 이상', inc: '1억 이상', body: '슬림탄탄', looks: ['#훈남/훈녀', '#피부좋음', '#깔끔/댄디', '#두부상'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '천주교', mbti: 'INFJ', pers: ['#테니스/골프', '#여행좋아함', '#다정다감', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1991, iMaxY: 1996, iMinH: 162, iMaxH: 173, iJobs: ['전문직(의사/변호사/회계사 등)', '대기업', '외국계', '금융권', '공무원/교직'], iLooks: ['#단아함', '#화려함', '#사슴상', '#훈남/훈녀'], iBreak: ['흡연자 불가', '문신 불가'], iMemo: '가정적이고 성품이 따뜻한 분 희망. 주말에 골프나 여행 같이 다니면 좋겠습니다.', raw: '[카톡 원문]\n주변에 결혼 생각 있으신 참한 분 계실까? 키 162 이상에 자기 관리 잘하시는 분이면 좋겠어!' },
  { id: 'sample-m-5', name: '강태양', year: 1994, height: 179, loc: '서울 여의도/영등포', rel: '이전 직장 동료', status: 'waiting', jobCat: '금융권', jobDet: '대형 증권사 IB본부', edu: '국내외 명문대', inc: '1억 이상', body: '근육질/건장', looks: ['#여우상', '#화려함', '#깔끔/댄디', '#훈남/훈녀'], smoke: '전자담배', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ENTJ', pers: ['#밖순이/활동적', '#테니스/골프', '#맛집/카페탐방', '#유머러스', '#자차보유'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1994, iMaxY: 1999, iMinH: 163, iMaxH: 175, iJobs: ['금융권', '외국계', '대기업', '프리랜서'], iLooks: ['#고양이상', '#여우상', '#화려함', '#훈남/훈녀'], iBreak: ['종교 있음 불가'], iMemo: '센스 있고 옷 잘 입는 화려한 스타일 선호. 맛집이랑 와인바 같이 다닐 분!', raw: '[카톡 원문]\n일 바쁜 건 좀 끝났고 주말에 재밌게 데이트할 분 찾는다! 활발하고 고양이상 스타일 대환영!' },
  { id: 'sample-m-6', name: '윤지호', year: 1995, height: 175, loc: '서울 마포/합정', rel: '군대 후임', status: 'waiting', jobCat: '공기업/공공기관', jobDet: '한국전력공사 순환근무(서울)', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '보통', looks: ['#강아지상', '#귀여움', '#웃는게예쁜', '#동안'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ESFJ', pers: ['#러닝/등산', '#맛집/카페탐방', '#연락잘됨', '#다정다감'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1994, iMaxY: 1998, iMinH: 155, iMaxH: 168, iJobs: ['공기업/공공기관', '공무원/교직', '대기업'], iLooks: ['#강아지상', '#단아함', '#귀여움', '#웃는게예쁜'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '안정적인 직장에 다니며 소소한 일상 공유할 수 있는 다정한 분이면 좋겠습니다.', raw: '[카톡 원문]\n형님 저 서울 본사로 발령났습니다! 이제 연애 진지하게 하고 싶어요. 착하고 웃는 게 예쁜 분 소개 부탁드려요!' },
  { id: 'sample-m-7', name: '임시완(별칭)', year: 1992, height: 174, loc: '서울 용산/이태원', rel: '대학 선배', status: 'waiting', jobCat: '외국계', jobDet: '글로벌 컨설팅펌 시니어 컨설턴트', edu: '국내외 명문대', inc: '1억 이상', body: '마름', looks: ['#사슴상', '#두부상', '#깔끔/댄디', '#동안', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFP', pers: ['#여행좋아함', '#맛집/카페탐방', '#유머러스', '#연락잘됨', '#자취중'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1991, iMaxY: 1997, iMinH: 158, iMaxH: 169, iJobs: ['외국계', '대기업', 'IT/스타트업', '전문직(의사/변호사/회계사 등)'], iLooks: ['#두부상', '#강아지상', '#단아함'], iBreak: ['흡연자 불가'], iMemo: '키는 크게 안 보시고 대화 코드와 지적인 유머가 잘 맞는 분이면 좋겠습니다.', raw: '[카톡 원문]\n내가 키는 아주 크지 않아도 얼굴은 완전 동안에 두부상인 거 알지?ㅋㅋ 대화 잘 통하고 밝은 분이면 최고!' },
  { id: 'sample-m-8', name: '장준혁', year: 1989, height: 183, loc: '서울 서초/반포', rel: '회사 팀장님 지인', status: 'waiting', jobCat: '전문직(의사/변호사/회계사 등)', jobDet: '서초동 법무법인 파트너 변호사', edu: '국내외 명문대', inc: '1억 이상', body: '근육질/건장', looks: ['#곰돌이상', '#안경잘어울림', '#깔끔/댄디'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '불교', mbti: 'ESTJ', pers: ['#테니스/골프', '#등산', '#차분함', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1990, iMaxY: 1996, iMinH: 160, iMaxH: 172, iJobs: ['공무원/교직', '공기업/공공기관', '대기업', '전문직(의사/변호사/회계사 등)'], iLooks: ['#단아함', '#사슴상', '#웃는게예쁜'], iBreak: ['흡연자 불가', '종교 있음 불가'], iMemo: '1년 내 결혼을 전제로 진지하게 만날 수 있는 차분하고 단아한 분 희망합니다.', raw: '[카톡 원문]\n반포 자가 준비되어 있고 이제 좋은 분 만나서 가정 꾸리고 싶습니다. 차분하고 예의 바른 분 소개 부탁드립니다.' },
  { id: 'sample-m-9', name: '송건희', year: 1997, height: 182, loc: '서울 성수/건대', rel: '러닝크루 동생', status: 'waiting', jobCat: 'IT/스타트업', jobDet: 'AI 스타트업 프론트엔드 리드', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#강아지상', '#훈남/훈녀', '#웃는게예쁜', '#동안'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFP', pers: ['#러닝/등산', '#밖순이/활동적', '#맛집/카페탐방', '#다정다감', '#연락잘됨'], mar: '연애부터 천천히', iMinY: 1996, iMaxY: 2001, iMinH: 160, iMaxH: 172, iJobs: ['IT/스타트업', '대기업', '외국계', '프리랜서'], iLooks: ['#고양이상', '#귀여움', '#웃는게예쁜'], iBreak: ['흡연자 불가'], iMemo: '같이 한강 러닝 뛰고 성수동 팝업이나 맛집 다닐 활발한 분 찾아요!', raw: '[카톡 원문]\n누나! 저 요즘 너무 심심해요ㅋㅋ 같이 러닝도 하고 주말에 카페 투어 다닐 귀여운 분 소개해주세요!' },
  { id: 'sample-m-10', name: '한승우', year: 1993, height: 178, loc: '경기 수원/광교', rel: '대학 동기', status: 'waiting', jobCat: '대기업', jobDet: '삼성전자 메모리사업부 책임', edu: '석사 이상', inc: '1억 이상', body: '보통', looks: ['#두부상', '#안경잘어울림', '#차분함', '#깔끔/댄디'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'ISTP', pers: ['#집돌이/집순이', '#운동/헬스', '#차분함', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1993, iMaxY: 1998, iMinH: 158, iMaxH: 168, iJobs: ['대기업', '공기업/공공기관', '공무원/교직'], iLooks: ['#두부상', '#단아함', '#강아지상'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '광교 거주 중이라 경기 남부나 강남권 분이면 좋겠습니다. 조용하고 차분한 데이트 선호.', raw: '[카톡 원문]\n광교 자취 중이고 술담배 전혀 안 해. 집순이 성향이거나 차분한 분이면 나랑 엄청 잘 맞을 것 같아.' },
  { id: 'sample-m-11', name: '오세훈(별칭)', year: 1994, height: 185, loc: '서울 잠실/송파', rel: '농구 동호회 지인', status: 'waiting', jobCat: '대기업', jobDet: 'LG에너지솔루션 해외영업', edu: '국내외 명문대', inc: '8,000~1억', body: '근육질/건장', looks: ['#공룡상', '#여우상', '#훈남/훈녀', '#깔끔/댄디'], smoke: '금연중', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ESTP', pers: ['#운동/헬스', '#여행좋아함', '#유머러스', '#밖순이/활동적', '#자차보유'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1994, iMaxY: 1999, iMinH: 164, iMaxH: 176, iJobs: ['대기업', '외국계', '승무원/항공', '금융권', '프리랜서'], iLooks: ['#화려함', '#고양이상', '#훈남/훈녀'], iBreak: ['다른 종교 불가'], iMemo: '키 크고 비율 좋은 분 선호! 해외여행이나 액티비티 같이 즐기실 분 환영합니다.', raw: '[카톡 원문]\n잠실 쪽 사는 훤칠하고 밝은 분 계시면 소개해줘! 나 금연도 성공했고 운동 열심히 하는 중!' },
  { id: 'sample-m-12', name: '신재민', year: 1992, height: 176, loc: '서울 종로/광화문', rel: '고시반 지인', status: 'waiting', jobCat: '공무원/교직', jobDet: '중앙부처 5급 사무관 (행정고시)', edu: '국내외 명문대', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#단아함', '#안경잘어울림', '#깔끔/댄디', '#두부상'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '기독교', mbti: 'ISFJ', pers: ['#러닝/등산', '#차분함', '#다정다감', '#연락잘됨'], mar: '1~2년 내 결혼 희망', iMinY: 1992, iMaxY: 1997, iMinH: 158, iMaxH: 168, iJobs: ['공무원/교직', '공기업/공공기관', '대기업', '전문직(의사/변호사/회계사 등)'], iLooks: ['#단아함', '#사슴상', '#웃는게예쁜'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '성실하고 가치관이 비슷한 분이면 좋겠습니다. 기독교이시거나 종교에 거부감 없는 분 희망.', raw: '[카톡 원문]\n예배 같이 다니거나 주말에 조용히 산책하고 전시회 보러 다닐 수 있는 참한 분 계시면 소개 부탁해.' },
  { id: 'sample-m-13', name: '류승룡(별칭)', year: 1991, height: 179, loc: '서울 한남/옥수', rel: '비즈니스 파트너', status: 'waiting', jobCat: '자영업/사업', jobDet: 'F&B 브랜드 대표 (매장 4곳 운영)', edu: '4년제 대졸(수도권)', inc: '1억 이상', body: '건장', looks: ['#곰돌이상', '#유머러스', '#깔끔/댄디'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ENFJ', pers: ['#맛집/카페탐방', '#여행좋아함', '#다정다감', '#유머러스', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1992, iMaxY: 1998, iMinH: 160, iMaxH: 172, iJobs: ['대기업', '프리랜서', '자영업/사업', '외국계'], iLooks: ['#강아지상', '#귀여움', '#웃는게예쁜'], iBreak: ['흡연자 불가'], iMemo: '미식과 요리를 좋아해서 맛있는 것 해드리는 걸 좋아합니다. 잘 웃고 리액션 좋은 분!', raw: '[카톡 원문]\n내가 요리 하나는 기가 막히게 해줄 수 있는데ㅋㅋ 먹는 거 좋아하고 성격 밝은 분 계시면 꼭 좀 연결해줘!' },
  { id: 'sample-m-14', name: '문상민', year: 1998, height: 186, loc: '서울 강남/역삼', rel: '대학 후배', status: 'waiting', jobCat: '금융권', jobDet: '외국계 자산운용사 애널리스트', edu: '국내외 명문대', inc: '8,000~1억', body: '슬림탄탄', looks: ['#강아지상', '#훈남/훈녀', '#동안', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENTP', pers: ['#테니스/골프', '#운동/헬스', '#맛집/카페탐방', '#유머러스'], mar: '연애부터 천천히', iMinY: 1995, iMaxY: 2001, iMinH: 162, iMaxH: 174, iJobs: ['금융권', '외국계', '대기업', '전문직(의사/변호사/회계사 등)'], iLooks: ['#고양이상', '#화려함', '#여우상', '#훈남/훈녀'], iBreak: ['흡연자 불가'], iMemo: '연상·동갑·연하 모두 열려 있고 자기 일에 열정 있는 세련된 분 좋아합니다.', raw: '[카톡 원문]\n선배님! 저 연상도 완전 좋아합니다ㅎㅎ 대화 티키타카 잘 되고 테니스 같이 칠 수 있는 분이면 더 좋아요!' },
  { id: 'sample-m-15', name: '배진영', year: 1995, height: 176, loc: '서울 마곡/강서', rel: '고등학교 친구', status: 'waiting', jobCat: '대기업', jobDet: 'LG화학 연구원', edu: '석사 이상', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#두부상', '#사슴상', '#깔끔/댄디', '#안경잘어울림'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'INFP', pers: ['#집돌이/집순이', '#맛집/카페탐방', '#다정다감', '#연락잘됨', '#자취중'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1994, iMaxY: 1999, iMinH: 156, iMaxH: 168, iJobs: ['대기업', '공기업/공공기관', '공무원/교직', '대학원생/학생'], iLooks: ['#두부상', '#강아지상', '#귀여움'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '마곡·여의도·홍대 쪽 가까우면 좋겠고, 다정하고 섬세한 성향의 분을 원합니다.', raw: '[카톡 원문]\n술 안 마시고 카페 가서 수다 떨거나 영화 보는 거 좋아해. 착하고 순한 인상인 분이면 좋겠어!' },
  { id: 'sample-m-16', name: '서강준(별칭)', year: 1993, height: 180, loc: '서울 성동/왕십리', rel: '이전 회사 동기', status: 'coupled', jobCat: 'IT/스타트업', jobDet: '대형 플랫폼 프로덕트 매니저(PM)', edu: '4년제 대졸(수도권)', inc: '8,000~1억', body: '슬림탄탄', looks: ['#훈남/훈녀', '#고양이상', '#깔끔/댄디', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFJ', pers: ['#운동/헬스', '#여행좋아함', '#다정다감', '#연락잘됨', '#자차보유'], mar: '1~2년 내 결혼 희망', iMinY: 1993, iMaxY: 1998, iMinH: 160, iMaxH: 170, iJobs: ['IT/스타트업', '대기업', '외국계'], iLooks: ['#단아함', '#강아지상', '#웃는게예쁜'], iBreak: ['흡연자 불가'], iMemo: '감정 기복 없이 안정적이고 대화가 따뜻한 분.', raw: '[카톡 원문]\n얼마 전에 소개받은 분이랑 진지하게 만나기로 했어! 고마워!!' },
  { id: 'sample-m-17', name: '안보현(별칭)', year: 1991, height: 187, loc: '서울 강남/청담', rel: '골프 모임 지인', status: 'waiting', jobCat: '자영업/사업', jobDet: '건축 인테리어 디자인 스튜디오 대표', edu: '4년제 대졸(수도권)', inc: '1억 이상', body: '근육질/건장', looks: ['#공룡상', '#훈남/훈녀', '#화려함'], smoke: '전자담배', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ESFP', pers: ['#테니스/골프', '#운동/헬스', '#여행좋아함', '#밖순이/활동적', '#자차보유', '#자취중'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1992, iMaxY: 1999, iMinH: 163, iMaxH: 175, iJobs: ['프리랜서', '외국계', '대기업', '자영업/사업'], iLooks: ['#화려함', '#고양이상', '#여우상'], iBreak: ['종교 있음 불가'], iMemo: '감각적이고 스타일 좋은 분 선호합니다. 같이 라운딩이나 드라이브 가실 분!', raw: '[카톡 원문]\n키 크고 운동 좋아하는 화려한 스타일 분 계시면 소개해줘! 전담 피우긴 하는데 상대가 싫어하면 끊을 의향 있음!' },
  { id: 'sample-m-18', name: '유연석(별칭)', year: 1990, height: 182, loc: '서울 동작/여의도', rel: '대학 선배', status: 'waiting', jobCat: '전문직(의사/변호사/회계사 등)', jobDet: '대학병원 소아청소년과 임상강사', edu: '석사 이상', inc: '1억 이상', body: '슬림탄탄', looks: ['#강아지상', '#곰돌이상', '#다정다감', '#웃는게예쁜'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '천주교', mbti: 'ENFJ', pers: ['#다정다감', '#맛집/카페탐방', '#여행좋아함', '#연락잘됨', '#자차보유'], mar: '1~2년 내 결혼 희망', iMinY: 1991, iMaxY: 1997, iMinH: 158, iMaxH: 170, iJobs: ['공무원/교직', '공기업/공공기관', '전문직(의사/변호사/회계사 등)', '대기업'], iLooks: ['#단아함', '#강아지상', '#웃는게예쁜'], iBreak: ['흡연자 불가'], iMemo: '아이들을 좋아하고 마음씨가 따뜻한 분이면 더할 나위 없이 좋겠습니다.', raw: '[카톡 원문]\n아이들 좋아하고 성품 따뜻한 분이면 직종 상관없이 너무 좋을 것 같아. 연락 잘 되고 다정한 분 희망해!' },
  { id: 'sample-m-19', name: '전현무(별칭)', year: 1994, height: 175, loc: '서울 상암/마포', rel: '방송국 지인', status: 'paused', jobCat: '대기업', jobDet: '주요 방송사 예능 PD', edu: '국내외 명문대', inc: '8,000~1억', body: '보통', looks: ['#유머러스', '#강아지상', '#깔끔/댄디'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ENTP', pers: ['#유머러스', '#맛집/카페탐방', '#여행좋아함', '#자차보유', '#자취중'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1994, iMaxY: 1999, iMinH: 158, iMaxH: 170, iJobs: ['대기업', '외국계', '프리랜서', '공기업/공공기관'], iLooks: ['#귀여움', '#고양이상', '#웃는게예쁜'], iBreak: ['흡연자 불가'], iMemo: '재밌고 대화할 때 오디오 안 비는 유쾌한 분 환영! (이번 달 신규 프로그램 런칭 후 재개 예정)', raw: '[카톡 원문]\n이번 달 첫방 편집만 끝나면 바로 소개팅 달린다! 입담 좋고 센스 있는 분으로 미리 눈여겨봐 줘ㅋㅋ' },
  { id: 'sample-m-20', name: '홍경(별칭)', year: 1996, height: 181, loc: '성남 분당/서현', rel: '동네 고등학교 후배', status: 'waiting', jobCat: '공기업/공공기관', jobDet: '금융결제원 재직', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#사슴상', '#두부상', '#깔끔/댄디', '#동안'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'INFJ', pers: ['#러닝/등산', '#집돌이/집순이', '#다정다감', '#연락잘됨', '#자차보유'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1995, iMaxY: 2000, iMinH: 158, iMaxH: 170, iJobs: ['공기업/공공기관', '공무원/교직', '대기업', '금융권'], iLooks: ['#단아함', '#두부상', '#귀여움', '#웃는게예쁜'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가', '문신 불가'], iMemo: '워라밸이 좋아서 저녁 시간과 주말을 함께 여유롭게 보낼 수 있는 분 찾습니다.', raw: '[카톡 원문]\n형 저 칼퇴 보장되는 곳이라 연애하면 진짜 잘해줄 자신 있습니다ㅎㅎ 참하고 선한 인상인 분 소개시켜주세요!' }
];

const FEMALE_RAW = [
  { id: 'sample-f-1', name: '이서연', year: 1995, height: 164, loc: '서울 송파/강남', rel: '회사 전 팀 후배', status: 'waiting', jobCat: '대기업', jobDet: '삼성물산 패션부문 마케팅', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#단아함', '#강아지상', '#웃는게예쁜', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ISFJ', pers: ['#테니스/골프', '#맛집/카페탐방', '#다정다감', '#연락잘됨'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1990, iMaxY: 1995, iMinH: 176, iMaxH: 190, iJobs: ['대기업', '전문직(의사/변호사/회계사 등)', '금융권', 'IT/스타트업'], iLooks: ['#강아지상', '#두부상', '#깔끔/댄디', '#훈남/훈녀'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '다정하고 정서적으로 안정된 분! 키 176 이상에 깔끔한 셔츠/슬랙스 잘 어울리는 두부상/강아지상 선호합니다.', raw: '[카톡 원문]\n선배님~ 저 요즘 연애세포 다 죽어가요ㅠㅠ 주변에 다정하고 자기 일 열심히 하는 분 계시면 소개시켜주세요! 담배 안 피우고 키 176 이상에 깔끔한 분이면 좋겠어요ㅎㅎ' },
  { id: 'sample-f-2', name: '최지우', year: 1994, height: 167, loc: '서울 용산/성수', rel: '고등학교 동창', status: 'waiting', jobCat: '외국계', jobDet: '글로벌 IT기업 프로덕트 디자이너', edu: '국내외 명문대', inc: '8,000~1억', body: '슬림탄탄', looks: ['#고양이상', '#화려함', '#훈남/훈녀', '#깔끔/댄디'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ENTP', pers: ['#테니스/골프', '#여행좋아함', '#맛집/카페탐방', '#유머러스', '#자취중'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1989, iMaxY: 1995, iMinH: 175, iMaxH: 190, iJobs: ['전문직(의사/변호사/회계사 등)', '금융권', '대기업', '외국계', 'IT/스타트업'], iLooks: ['#깔끔/댄디', '#안경잘어울림', '#공룡상', '#훈남/훈녀'], iBreak: ['종교 있음 불가'], iMemo: '자기 일에 프라이드 있고 대화 티키타카 잘 되는 분! 와인바나 테니스 같이 즐길 수 있는 분 환영.', raw: '[카톡 원문]\n야 내 주변엔 왜 다 유부남밖에 없냐ㅋㅋ 일 열심히 하고 센스 있는 남자 좀 소개해줘! 나 요즘 테니스 치는데 같이 치면 딱일 듯.' },
  { id: 'sample-f-3', name: '한소희(별칭)', year: 1997, height: 162, loc: '성남 분당/강남', rel: '지인 여동생', status: 'matching', jobCat: '공기업/공공기관', jobDet: '금융공기업 재직', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '보통', looks: ['#두부상', '#귀여움', '#강아지상', '#동안'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'INFP', pers: ['#집돌이/집순이', '#맛집/카페탐방', '#다정다감', '#연락잘됨'], mar: '연애부터 천천히', iMinY: 1992, iMaxY: 1997, iMinH: 178, iMaxH: 190, iJobs: ['대기업', 'IT/스타트업', '공기업/공공기관', '전문직(의사/변호사/회계사 등)'], iLooks: ['#공룡상', '#훈남/훈녀', '#강아지상', '#깔끔/댄디'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '키 크고 듬직한 체형 좋아해요! 저도 술을 못 마셔서 술 안 좋아하시는 분이면 딱 좋을 것 같아요.', raw: '[카톡 원문]\n오빠! 나 키 크고 운동 열심히 하는 듬직한 분 만나고 싶어! 술 담배 안 하는 집돌이 대환영이야ㅋㅋ' },
  { id: 'sample-f-4', name: '박은빈(별칭)', year: 1993, height: 163, loc: '서울 서초/방배', rel: '대학 동기', status: 'waiting', jobCat: '공무원/교직', jobDet: '서울 공립 초등학교 교사', edu: '4년제 대졸(수도권)', inc: '4,000~6,000만', body: '슬림탄탄', looks: ['#사슴상', '#단아함', '#웃는게예쁜', '#동안'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'ESFJ', pers: ['#다정다감', '#연락잘됨', '#여행좋아함', '#맛집/카페탐방'], mar: '1~2년 내 결혼 희망', iMinY: 1988, iMaxY: 1994, iMinH: 174, iMaxH: 188, iJobs: ['전문직(의사/변호사/회계사 등)', '대기업', '공기업/공공기관', '공무원/교직', '금융권'], iLooks: ['#두부상', '#강아지상', '#곰돌이상', '#깔끔/댄디'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가', '문신 불가'], iMemo: '성품이 온화하고 결혼 생각이 확실하신 분을 찾습니다. 비흡연 필수!', raw: '[카톡 원문]\n방학 때 여행도 같이 다니고 진지하게 결혼 전제로 만날 수 있는 성실한 분 계시면 소개 부탁해~' },
  { id: 'sample-f-5', name: '김지원(별칭)', year: 1992, height: 165, loc: '서울 강남/도곡', rel: '대학원 동기', status: 'waiting', jobCat: '전문직(의사/변호사/회계사 등)', jobDet: '대형 병원 약사 / 약국장 준비중', edu: '국내외 명문대', inc: '8,000~1억', body: '보통', looks: ['#단아함', '#고양이상', '#피부좋음', '#훈남/훈녀'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '천주교', mbti: 'INFJ', pers: ['#테니스/골프', '#차분함', '#다정다감', '#자차보유'], mar: '1~2년 내 결혼 희망', iMinY: 1988, iMaxY: 1993, iMinH: 176, iMaxH: 188, iJobs: ['전문직(의사/변호사/회계사 등)', '대기업', '금융권'], iLooks: ['#훈남/훈녀', '#깔끔/댄디', '#두부상'], iBreak: ['흡연자 불가', '문신 불가'], iMemo: '서로 존댓말 쓰듯 예의 바르고 배려심 깊은 분 선호합니다.', raw: '[카톡 원문]\n주변에 의사나 변호사, 대기업 다니시는 차분하고 가정적인 분 계시면 소개해 주세요!' },
  { id: 'sample-f-6', name: '고윤정(별칭)', year: 1998, height: 166, loc: '서울 성수/압구정', rel: '회사 후배 지인', status: 'waiting', jobCat: 'IT/스타트업', jobDet: '유니콘 패션 플랫폼 브랜드 마케터', edu: '4년제 대졸(수도권)', inc: '4,000~6,000만', body: '슬림탄탄', looks: ['#여우상', '#화려함', '#훈남/훈녀', '#피부좋음'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ENFP', pers: ['#밖순이/활동적', '#러닝/등산', '#맛집/카페탐방', '#유머러스'], mar: '연애부터 천천히', iMinY: 1993, iMaxY: 1998, iMinH: 178, iMaxH: 190, iJobs: ['IT/스타트업', '금융권', '외국계', '대기업', '자영업/사업'], iLooks: ['#훈남/훈녀', '#공룡상', '#강아지상', '#깔끔/댄디'], iBreak: ['종교 있음 불가'], iMemo: '옷 잘 입고 자기관리 잘하는 훈훈한 분! 주말에 러닝이나 핫플 투어 같이 해요.', raw: '[카톡 원문]\n언니! 저 키 크고 어깨 넓은 훈남 스타일 너무 좋아해요ㅋㅋ 같이 성수동 데이트할 분 소개해주세요!' },
  { id: 'sample-f-7', name: '신세경(별칭)', year: 1994, height: 164, loc: '서울 여의도/마포', rel: '금융권 모임 지인', status: 'waiting', jobCat: '금융권', jobDet: '시중은행 본점 외환딜러', edu: '국내외 명문대', inc: '8,000~1억', body: '슬림탄탄', looks: ['#사슴상', '#단아함', '#화려함', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ISTJ', pers: ['#테니스/골프', '#운동/헬스', '#차분함', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1989, iMaxY: 1994, iMinH: 175, iMaxH: 186, iJobs: ['금융권', '전문직(의사/변호사/회계사 등)', '대기업', '외국계'], iLooks: ['#깔끔/댄디', '#안경잘어울림', '#곰돌이상'], iBreak: ['흡연자 불가'], iMemo: '경제관념이 뚜렷하고 성실한 분이면 좋겠습니다. 여의도·마포 근방 환영!', raw: '[카톡 원문]\n여의도 출퇴근이라 마포나 강남, 여의도 쪽에 계신 스마트한 분이면 너무 좋겠어!' },
  { id: 'sample-f-8', name: '정유미(별칭)', year: 1996, height: 161, loc: '경기 수원/광교', rel: '사촌 여동생', status: 'waiting', jobCat: '대기업', jobDet: '삼성전자 VD사업부 UX디자이너', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '마름', looks: ['#강아지상', '#귀여움', '#웃는게예쁜', '#동안'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'ISFP', pers: ['#집돌이/집순이', '#맛집/카페탐방', '#다정다감', '#연락잘됨', '#자차보유'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1992, iMaxY: 1997, iMinH: 173, iMaxH: 185, iJobs: ['대기업', '공기업/공공기관', 'IT/스타트업'], iLooks: ['#두부상', '#강아지상', '#깔끔/댄디'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '광교·분당·강남권에서 편하게 만날 수 있는 다정한 비흡연자분 희망해요.', raw: '[카톡 원문]\n오빠 나 광교 사니까 동탄이나 광교, 분당 쪽 연구원분들 중에 착하고 술 안 마시는 분 있으면 소개해줘!' },
  { id: 'sample-f-9', name: '김태리(별칭)', year: 1995, height: 165, loc: '서울 종로/혜화', rel: '독서모임 지인', status: 'waiting', jobCat: '공기업/공공기관', jobDet: '한국관광공사 재직', edu: '국내외 명문대', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#고양이상', '#단아함', '#웃는게예쁜', '#동안'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFP', pers: ['#여행좋아함', '#러닝/등산', '#유머러스', '#연락잘됨'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1991, iMaxY: 1996, iMinH: 174, iMaxH: 186, iJobs: ['공기업/공공기관', '공무원/교직', '대기업', '외국계'], iLooks: ['#사슴상', '#두부상', '#안경잘어울림', '#깔끔/댄디'], iBreak: ['흡연자 불가'], iMemo: '대화할 때 결이 맞고 여행이나 산책 좋아하는 밝은 분 선호합니다.', raw: '[카톡 원문]\n키는 174만 넘으면 되고 인상이 선하고 대화가 재밌는 분이면 좋겠어!' },
  { id: 'sample-f-10', name: '수지(별칭)', year: 1996, height: 168, loc: '서울 잠실/송파', rel: '대학 후배', status: 'waiting', jobCat: '대기업', jobDet: '대한항공 본사 기획팀', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#강아지상', '#두부상', '#훈남/훈녀', '#웃는게예쁜', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFJ', pers: ['#여행좋아함', '#테니스/골프', '#다정다감', '#연락잘됨'], mar: '1~2년 내 결혼 희망', iMinY: 1991, iMaxY: 1996, iMinH: 178, iMaxH: 190, iJobs: ['대기업', '전문직(의사/변호사/회계사 등)', '금융권', '외국계'], iLooks: ['#훈남/훈녀', '#공룡상', '#강아지상', '#깔끔/댄디'], iBreak: ['흡연자 불가', '종교 있음 불가'], iMemo: '제가 키가 168이라 키 178 이상에 듬직하고 다정한 분이면 좋겠습니다!', raw: '[카톡 원문]\n선배님! 저 키 크고 운동 좋아하시는 분, 그리고 표현 잘해주시는 다정한 분 만나고 싶어요ㅎㅎ' },
  { id: 'sample-f-11', name: '아이유(별칭)', year: 1997, height: 160, loc: '서울 마포/연남', rel: '이전 직장 후배', status: 'waiting', jobCat: '프리랜서', jobDet: '웹툰/일러스트 작가 및 북디자이너', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '마름', looks: ['#강아지상', '#귀여움', '#동안', '#피부좋음'], smoke: '비흡연', drink: '전혀 안 마심', relg: '무교', mbti: 'INFP', pers: ['#집돌이/집순이', '#맛집/카페탐방', '#다정다감', '#자취중'], mar: '연애부터 천천히', iMinY: 1993, iMaxY: 1998, iMinH: 172, iMaxH: 184, iJobs: ['IT/스타트업', '대기업', '프리랜서', '공기업/공공기관'], iLooks: ['#두부상', '#강아지상', '#곰돌이상'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '푸근하고 다정한 곰돌이상이나 두부상 좋아해요. 집데이트나 조용한 맛집 탐방 환영!', raw: '[카톡 원문]\n저는 아담한 편이라 상대방 키는 크게 안 봐요! 대신 말 예쁘게 하고 다정한 분이면 좋겠어요.' },
  { id: 'sample-f-12', name: '전여빈(별칭)', year: 1991, height: 166, loc: '서울 광화문/종로', rel: '로펌 지인', status: 'waiting', jobCat: '전문직(의사/변호사/회계사 등)', jobDet: '대형 로펌 송무팀 변호사', edu: '국내외 명문대', inc: '1억 이상', body: '슬림탄탄', looks: ['#고양이상', '#단아함', '#깔끔/댄디'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'INTJ', pers: ['#테니스/골프', '#맛집/카페탐방', '#차분함', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1987, iMaxY: 1993, iMinH: 175, iMaxH: 188, iJobs: ['전문직(의사/변호사/회계사 등)', '금융권', '대기업', '공무원/교직'], iLooks: ['#안경잘어울림', '#깔끔/댄디', '#두부상'], iBreak: ['흡연자 불가'], iMemo: '서로 바쁜 업무를 이해해 줄 수 있는 전문직·대기업 종사자분 선호합니다.', raw: '[카톡 원문]\n결혼 생각 있으신 진중한 분이면 좋겠어. 주말에 같이 와인 한잔하면서 대화 나눌 수 있는 분!' },
  { id: 'sample-f-13', name: '설인아(별칭)', year: 1996, height: 167, loc: '서울 강남/신논현', rel: '테니스 클럽 회원', status: 'waiting', jobCat: '외국계', jobDet: '외국계 제약사 마케팅 매니저', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '글래머', looks: ['#여우상', '#화려함', '#웃는게예쁜', '#훈남/훈녀'], smoke: '비흡연', drink: '주 1~2회 즐김', relg: '무교', mbti: 'ESFP', pers: ['#테니스/골프', '#운동/헬스', '#밖순이/활동적', '#유머러스', '#자차보유'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1990, iMaxY: 1996, iMinH: 177, iMaxH: 190, iJobs: ['금융권', '전문직(의사/변호사/회계사 등)', '대기업', '자영업/사업', '외국계'], iLooks: ['#공룡상', '#훈남/훈녀', '#깔끔/댄디'], iBreak: ['종교 있음 불가'], iMemo: '운동 좋아하고 에너지 넘치는 분! 테니스나 골프 같이 치러 다니면 너무 좋을 것 같아요.', raw: '[카톡 원문]\n성격 시원시원하고 체격 좋은 분 계시면 소개해줘! 나 테니스 구력 3년 차야ㅋㅋ' },
  { id: 'sample-f-14', name: '고민시(별칭)', year: 1995, height: 162, loc: '서울 한남/옥수', rel: '요가원 지인', status: 'waiting', jobCat: '자영업/사업', jobDet: '필라테스 & 웰니스 스튜디오 원장', edu: '4년제 대졸(수도권)', inc: '8,000~1억', body: '슬림탄탄', looks: ['#고양이상', '#귀여움', '#화려함', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFJ', pers: ['#운동/헬스', '#맛집/카페탐방', '#다정다감', '#유머러스', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1989, iMaxY: 1995, iMinH: 175, iMaxH: 188, iJobs: ['자영업/사업', '전문직(의사/변호사/회계사 등)', '대기업', '금융권'], iLooks: ['#곰돌이상', '#강아지상', '#깔끔/댄디'], iBreak: ['흡연자 불가'], iMemo: '듬직하고 포용력 있는 연상 선호합니다. 맛있는 것 먹으러 다니는 걸 좋아해요!', raw: '[카톡 원문]\n사업하느라 바빴는데 이제 정말 좋은 분 만나서 결혼하고 싶어요. 다정하고 듬직한 분 계실까요?' },
  { id: 'sample-f-15', name: '문가영(별칭)', year: 1996, height: 169, loc: '서울 서초/교대', rel: '고등학교 후배', status: 'waiting', jobCat: '대기업', jobDet: 'SK텔레콤 전략기획', edu: '국내외 명문대', inc: '8,000~1억', body: '슬림탄탄', looks: ['#사슴상', '#화려함', '#훈남/훈녀', '#깔끔/댄디'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '천주교', mbti: 'ENTJ', pers: ['#테니스/골프', '#여행좋아함', '#연락잘됨', '#자차보유'], mar: '1~2년 내 결혼 희망', iMinY: 1990, iMaxY: 1996, iMinH: 180, iMaxH: 192, iJobs: ['전문직(의사/변호사/회계사 등)', '대기업', '금융권', '외국계'], iLooks: ['#훈남/훈녀', '#두부상', '#깔끔/댄디'], iBreak: ['흡연자 불가', '문신 불가'], iMemo: '키 180 이상에 지적인 매력이 있는 분 희망합니다.', raw: '[카톡 원문]\n언니 저 키가 커서 180 이상인 분이면 좋겠어요! 스마트하고 예의 바른 분 소개 부탁드려요.' },
  { id: 'sample-f-16', name: '천우희(별칭)', year: 1993, height: 163, loc: '서울 성동/서울숲', rel: '이전 회사 동료', status: 'coupled', jobCat: 'IT/스타트업', jobDet: '대형 IT기업 브랜드 에디터', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '보통', looks: ['#단아함', '#강아지상', '#웃는게예쁜'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'INFJ', pers: ['#맛집/카페탐방', '#여행좋아함', '#다정다감', '#연락잘됨'], mar: '1~2년 내 결혼 희망', iMinY: 1991, iMaxY: 1995, iMinH: 175, iMaxH: 185, iJobs: ['IT/스타트업', '대기업'], iLooks: ['#훈남/훈녀', '#깔끔/댄디'], iBreak: ['흡연자 불가'], iMemo: '대화가 따뜻하고 가치관이 건강한 분.', raw: '[카톡 원문]\n소개해준 PM분이랑 너무 잘 맞아서 교제 시작했어! 맛있는 밥 살게!!' },
  { id: 'sample-f-17', name: '노윤서(별칭)', year: 1999, height: 165, loc: '서울 강남/압구정', rel: '미술학원 지인', status: 'waiting', jobCat: '대학원생/학생', jobDet: '이화여대 디자인대학원 석사과정 & 프리랜서', edu: '석사 이상', inc: '4,000만 미만', body: '슬림탄탄', looks: ['#고양이상', '#귀여움', '#웃는게예쁜', '#동안'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFP', pers: ['#맛집/카페탐방', '#여행좋아함', '#다정다감', '#유머러스'], mar: '연애부터 천천히', iMinY: 1994, iMaxY: 1999, iMinH: 176, iMaxH: 188, iJobs: ['IT/스타트업', '금융권', '대기업', '전문직(의사/변호사/회계사 등)'], iLooks: ['#강아지상', '#훈남/훈녀', '#동안'], iBreak: ['흡연자 불가'], iMemo: '센스 있고 다정한 오빠나 동갑 친구 만나고 싶어요!', raw: '[카톡 원문]\n오빠 주변에 다정하고 귀여운 강아지상 스타일 분 계시면 소개해 주세요ㅎㅎ' },
  { id: 'sample-f-18', name: '표예진(별칭)', year: 1994, height: 164, loc: '성남 분당/정자', rel: '대학 동기', status: 'waiting', jobCat: '공무원/교직', jobDet: '경기도청 7급 공무원', edu: '4년제 대졸(수도권)', inc: '4,000~6,000만', body: '슬림탄탄', looks: ['#강아지상', '#단아함', '#웃는게예쁜', '#귀여움'], smoke: '비흡연', drink: '전혀 안 마심', relg: '기독교', mbti: 'ISFJ', pers: ['#러닝/등산', '#차분함', '#다정다감', '#연락잘됨'], mar: '1~2년 내 결혼 희망', iMinY: 1990, iMaxY: 1995, iMinH: 173, iMaxH: 185, iJobs: ['공무원/교직', '공기업/공공기관', '대기업'], iLooks: ['#단아함', '#두부상', '#안경잘어울림'], iBreak: ['흡연자 불가', '술 좋아하는 사람 불가'], iMemo: '성실하고 가정적인 분 희망합니다. 기독교이시면 더 좋습니다!', raw: '[카톡 원문]\n분당이나 수원, 강남 쪽에 계신 성실하고 착한 분 계시면 소개 부탁해!' },
  { id: 'sample-f-19', name: '김세정(별칭)', year: 1996, height: 164, loc: '서울 마곡/여의도', rel: '러닝 동호회', status: 'waiting', jobCat: '대기업', jobDet: '롯데웰푸드 상품기획(BM)', edu: '4년제 대졸(수도권)', inc: '6,000~8,000만', body: '슬림탄탄', looks: ['#강아지상', '#웃는게예쁜', '#귀여움', '#피부좋음'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ENFP', pers: ['#러닝/등산', '#운동/헬스', '#밖순이/활동적', '#유머러스', '#연락잘됨'], mar: '좋은 사람 만나면 결혼 생각 있음', iMinY: 1992, iMaxY: 1997, iMinH: 174, iMaxH: 186, iJobs: ['대기업', '공기업/공공기관', 'IT/스타트업', '금융권'], iLooks: ['#강아지상', '#두부상', '#웃는게예쁜'], iBreak: ['흡연자 불가'], iMemo: '밝고 긍정적인 에너지를 가진 분! 주말에 같이 한강 뛰고 맛있는 거 먹으러 다닐 분 찾아요.', raw: '[카톡 원문]\n성격 밝고 운동 좋아하는 분이면 무조건 환영이야! 나 리액션 부자라 소개팅 분위기 절대 안 어색하게 해ㅋㅋ' },
  { id: 'sample-f-20', name: '이주빈(별칭)', year: 1993, height: 163, loc: '서울 강남/청담', rel: '지인 소개', status: 'waiting', jobCat: '금융권', jobDet: '외국계 증권사 PB', edu: '국내외 명문대', inc: '1억 이상', body: '슬림탄탄', looks: ['#화려함', '#고양이상', '#단아함', '#훈남/훈녀'], smoke: '비흡연', drink: '가끔(사회적 음주)', relg: '무교', mbti: 'ESTJ', pers: ['#테니스/골프', '#여행좋아함', '#맛집/카페탐방', '#자차보유', '#자취중'], mar: '1~2년 내 결혼 희망', iMinY: 1988, iMaxY: 1994, iMinH: 177, iMaxH: 188, iJobs: ['전문직(의사/변호사/회계사 등)', '금융권', '대기업', '자영업/사업'], iLooks: ['#훈남/훈녀', '#깔끔/댄디', '#공룡상'], iBreak: ['흡연자 불가', '문신 불가'], iMemo: '자기 분야에서 인정받고 결혼 준비가 되신 분과 진지하게 만나고 싶습니다.', raw: '[카톡 원문]\n강남권 거주하시고 대화가 성숙하게 잘 통하는 분 계시면 소개 부탁드려요!' }
];

function buildProfile(item, gender, idx) {
  const photoPool = gender === 'M' ? MALE_PHOTO_SETS : FEMALE_PHOTO_SETS;
  const photos = photoPool[idx % photoPool.length];
  return {
    id: item.id,
    name: item.name,
    gender,
    birth_year: item.year,
    height: item.height,
    location: item.loc,
    contact: `010-${String(2100 + idx * 37).slice(0, 4)}-XXXX`,
    relation: item.rel,
    status: item.status,
    photos: [...photos],
    attributes: {
      job_category: item.jobCat,
      job_detail: item.jobDet,
      education: item.edu,
      income_range: item.inc,
      body_type: item.body,
      look_tags: item.looks,
      smoking: item.smoke,
      drinking: item.drink,
      religion: item.relg,
      mbti: item.mbti,
      personality_tags: item.pers,
      marriage_intent: item.mar
    },
    ideal_type: {
      min_birth_year: item.iMinY,
      max_birth_year: item.iMaxY,
      min_height: item.iMinH,
      max_height: item.iMaxH,
      preferred_job_categories: item.iJobs,
      preferred_look_tags: item.iLooks,
      deal_breakers: item.iBreak,
      ideal_memo: item.iMemo
    },
    raw_memo: item.raw,
    created_at: new Date(Date.now() - idx * 3600 * 1000 * 12).toISOString()
  };
}

export const SAMPLE_PROFILES = [
  ...MALE_RAW.map((item, idx) => buildProfile(item, 'M', idx)),
  ...FEMALE_RAW.map((item, idx) => buildProfile(item, 'F', idx))
];

export const SAMPLE_MATCHES = [
  {
    id: 'match-1',
    profile_a_id: 'sample-m-3',
    profile_b_id: 'sample-f-3',
    match_status: 'proposed',
    matched_at: '2026-10-22',
    notes: '양쪽 다 분당 거주 + 비흡연/금주 + 이상형 조건 95% 일치하여 프로필 전달 완료'
  },
  {
    id: 'match-2',
    profile_a_id: 'sample-m-16',
    profile_b_id: 'sample-f-16',
    match_status: 'coupled',
    matched_at: '2026-09-14',
    notes: '서울숲 첫 만남 이후 3번 애프터 끝에 정식 교제 시작! 🎉'
  },
  {
    id: 'match-3',
    profile_a_id: 'sample-m-1',
    profile_b_id: 'sample-f-1',
    match_status: 'connected',
    matched_at: '2026-10-25',
    notes: '양측 사진 및 스펙 대만족하여 연락처 교환 완료, 이번 주말 도산공원 약속'
  }
];
