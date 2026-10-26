-- ============================================================================
-- Blue Match: 소개팅 매물 관리 시스템 DB 스키마 (Supabase PostgreSQL)
-- ============================================================================

-- UUID 생성 확장 활성화
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. 관리자 목록 테이블 (Admin Users)
--    로그인한 사용자가 관리자인지 판별하기 위한 테이블입니다.
--    추후 일반 매물 사용자가 접속하더라도 관리자 권한과 분리할 수 있습니다.
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. 속성 및 태그 정의 테이블 (Attribute Definitions)
--    웹 화면에서 속성의 선택지나 태그를 쉽게 추가/수정할 수 있도록 관리합니다.
-- ----------------------------------------------------------------------------
create table if not exists public.attribute_definitions (
  id uuid primary key default uuid_generate_v4(),
  category text not null,          -- 예: 'career', 'appearance', 'lifestyle', 'ideal'
  key text not null unique,        -- 예: 'job_category', 'look_tags', 'smoking'
  label text not null,             -- 화면 표시명 (예: '직업 분류', '외모/분위기 태그')
  input_type text not null,        -- 'select' | 'multi_select' | 'text' | 'number' | 'boolean'
  options jsonb default '[]'::jsonb, -- 선택지 목록 (예: ["대기업", "공기업", "전문직", "스타트업"])
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. 매물 프로필 테이블 (Profiles)
--    자주 필터링하는 기본 스펙은 컬럼으로, 유연하게 확장할 속성과 이상형은 JSONB로 관리합니다.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null, -- 추후 매물 본인 계정 연동용 (현재는 null)
  
  -- 매칭 상태: 'waiting'(대기중), 'matching'(소개팅 진행중), 'coupled'(교제중/성사), 'paused'(보류)
  status text not null default 'waiting' check (status in ('waiting', 'matching', 'coupled', 'paused')),

  -- [1] 기본 인적사항 (고정 컬럼)
  name text not null,              -- 이름 또는 별칭
  gender text not null check (gender in ('M', 'F')), -- 'M': 남성, 'F': 여성
  birth_year int not null,         -- 출생연도 (예: 1994)
  height int,                      -- 키 cm (예: 178)
  location text,                   -- 거주지 / 주요 활동 지역 (예: '서울 강남', '분당')
  contact text,                    -- 연락처 또는 카톡 아이디
  relation text,                   -- 주선자와의 관계 (예: '대학 동기', '회사 후배')

  -- [2~4] 세부 속성 (직업/학력, 외모/스타일, 라이프스타일 등 유연한 JSON 구조)
  /*
    예시 구조:
    {
      "job_category": "대기업",
      "job_detail": "삼성전자 개발자",
      "education": "4년제 대졸",
      "income_range": "7000~9000",
      "body_type": "슬림탄탄",
      "look_tags": ["#강아지상", "#훈남", "#깔끔함"],
      "smoking": "비흡연",
      "drinking": "가끔(사회적)",
      "religion": "무교",
      "mbti": "ENFP",
      "marriage_intent": "1~2년 내 결혼 희망",
      "hobby_tags": ["#테니스", "#맛집탐방"]
    }
  */
  attributes jsonb not null default '{}'::jsonb,

  -- [5] 이상형 조건 (상대방에게 바라는 조건 JSON 구조)
  /*
    예시 구조:
    {
      "min_birth_year": 1992,
      "max_birth_year": 1998,
      "min_height": 160,
      "max_height": null,
      "preferred_locations": ["서울", "경기 남부"],
      "preferred_job_categories": ["대기업", "공기업", "전문직"],
      "preferred_body_types": ["슬림", "보통"],
      "preferred_look_tags": ["#강아지상", "#단아함", "#웃는게예쁜"],
      "deal_breakers": ["흡연자 불가", "종교 강요 불가"],
      "ideal_memo": "대화가 잘 통하고 밝은 에너지를 가진 분이면 좋겠습니다."
    }
  */
  ideal_type jsonb not null default '{}'::jsonb,

  -- 사진 및 메모
  photos text[] not null default '{}', -- Supabase Storage 이미지 경로/URL 배열
  raw_memo text,                       -- 카톡/문자로 받은 원문 및 관리자 메모

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. 매칭 히스토리 테이블 (Matches)
--    두 매물 간의 소개팅 진행 상태 및 피드백을 기록합니다.
-- ----------------------------------------------------------------------------
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  profile_a_id uuid not null references public.profiles(id) on delete cascade,
  profile_b_id uuid not null references public.profiles(id) on delete cascade,
  
  -- 'proposed'(제안중), 'connected'(연락처교환), 'dating'(만남중), 'coupled'(교제성사), 'failed'(불발)
  match_status text not null default 'proposed' check (match_status in ('proposed', 'connected', 'dating', 'coupled', 'failed')),
  notes text,                      -- 매칭 후기, 거절 사유 등 메모
  matched_at date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint different_profiles check (profile_a_id <> profile_b_id)
);

-- ----------------------------------------------------------------------------
-- 5. updated_at 자동 갱신 트리거
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_matches_updated_at on public.matches;
create trigger set_matches_updated_at
  before update on public.matches
  for each row execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. 보안 정책 (Row Level Security - RLS)
--    관리자(admins 테이블에 등록된 유저)는 모든 권한을 가지며,
--    추후 일반 매물 유저는 본인 프로필(user_id = auth.uid())만 조회/수정 가능하도록 대비합니다.
-- ----------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.attribute_definitions enable row level security;
alter table public.profiles enable row level security;
alter table public.matches enable row level security;

-- 현재 로그인한 유저가 관리자인지 확인하는 헬퍼 함수
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admins where user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Admins 테이블 정책: 본인 확인 가능
create policy "Admins can view admin list" on public.admins
  for select using (auth.uid() = user_id or public.is_admin());

-- Attribute Definitions 정책: 로그인한 누구나 조회 가능, 수정은 관리자만
create policy "Authenticated users can view attributes" on public.attribute_definitions
  for select using (auth.role() = 'authenticated');

create policy "Admins can manage attributes" on public.attribute_definitions
  for all using (public.is_admin());

-- Profiles 정책: 관리자는 전체 CRUD 가능, 일반 사용자는 본인 프로필만 조회/수정 가능
create policy "Admins have full access to profiles" on public.profiles
  for all using (public.is_admin());

create policy "Users can view and update own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Matches 정책: 관리자만 전체 관리 가능
create policy "Admins have full access to matches" on public.matches
  for all using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. 기본 속성/태그 초기 데이터 (Seed Data)
-- ----------------------------------------------------------------------------
insert into public.attribute_definitions (category, key, label, input_type, options, sort_order)
values
  ('career', 'job_category', '직업 분류', 'select', '["대기업", "공기업/공공기관", "전문직(의사/변호사/회계사 등)", "금융권", "외국계", "IT/스타트업", "공무원/교직", "자영업/사업", "프리랜서", "대학원생/학생", "기타"]'::jsonb, 10),
  ('career', 'education', '학력', 'select', '["고졸 이하", "전문대졸", "4년제 대졸(수도권)", "4년제 대졸(지방거점/기타)", "국내외 명문대", "석사 이상"]'::jsonb, 20),
  ('career', 'income_range', '연봉 구간', 'select', '["4,000만 미만", "4,000~6,000만", "6,000~8,000만", "8,000~1억", "1억 이상", "비공개"]'::jsonb, 30),
  ('appearance', 'body_type', '체형', 'select', '["마름", "슬림탄탄", "보통", "통통", "근육질/건장", "글래머"]'::jsonb, 40),
  ('appearance', 'look_tags', '외모/분위기 태그', 'multi_select', '["#강아지상", "#고양이상", "#두부상", "#여우상", "#공룡상", "#곰돌이상", "#사슴상", "#단아함", "#화려함", "#깔끔/댄디", "#귀여움", "#훈남/훈녀", "#동안", "#안경잘어울림", "#웃는게예쁜", "#피부좋음"]'::jsonb, 50),
  ('lifestyle', 'smoking', '흡연 여부', 'select', '["비흡연", "전자담배", "연초", "금연중"]'::jsonb, 60),
  ('lifestyle', 'drinking', '음주 빈도', 'select', '["전혀 안 마심", "가끔(사회적 음주)", "주 1~2회 즐김", "애주가"]'::jsonb, 70),
  ('lifestyle', 'religion', '종교', 'select', '["무교", "기독교", "천주교", "불교", "기타"]'::jsonb, 80),
  ('lifestyle', 'mbti', 'MBTI', 'select', '["ISTJ", "ISFJ", "INFJ", "INTJ", "ISTP", "ISFP", "INFP", "INTP", "ESTP", "ESFP", "ENFP", "ENTP", "ESTJ", "ESFJ", "ENFJ", "ENTJ", "모름"]'::jsonb, 90),
  ('lifestyle', 'personality_tags', '성향/취미 태그', 'multi_select', '["#집돌이/집순이", "#밖순이/활동적", "#운동/헬스", "#테니스/골프", "#러닝/등산", "#맛집/카페탐방", "#여행좋아함", "#술자리좋아함", "#연락잘됨", "#다정다감", "#유머러스", "#차분함", "#자차보유", "#자취중"]'::jsonb, 100),
  ('lifestyle', 'marriage_intent', '결혼 생각', 'select', '["1~2년 내 결혼 희망", "좋은 사람 만나면 결혼 생각 있음", "연애부터 천천히", "아직 결혼 생각 없음"]'::jsonb, 110),
  ('ideal', 'deal_breakers', '절대 불가 조건 (Deal-breaker)', 'multi_select', '["흡연자 불가", "종교 있음 불가", "다른 종교 불가", "장거리 불가", "술 좋아하는 사람 불가", "문신 불가", "돌싱 불가"]'::jsonb, 120)
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- 8. 사진 저장용 Storage Bucket 생성 ('profile-photos')
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

-- Storage 보안 정책: 관리자만 사진 업로드/조회/삭제 가능 (비공개 버킷이므로 Signed URL로 안전하게 열람)
create policy "Admins can manage profile photos"
on storage.objects for all
using (bucket_id = 'profile-photos' and public.is_admin())
with check (bucket_id = 'profile-photos' and public.is_admin());
