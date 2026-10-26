import { DEFAULT_ATTRIBUTE_DEFINITIONS, SAMPLE_PROFILES, SAMPLE_MATCHES } from './data.js';
import { calculateMutualMatch } from './matching.js';
import {
  getSupabaseClient,
  getSupabaseConfig,
  saveSupabaseConfig,
  uploadProfilePhoto
} from './supabase-client.js';
import { MatchingGraphRenderer } from './graph-view.js';

// v3 스토리지 키 (고해상도 Full 사진 및 40명 샘플 데이터 자동 반영)
const LOCAL_PROFILES_KEY = 'bluematch_local_profiles_v3';
const LOCAL_ATTRS_KEY = 'bluematch_local_attrs_v3';
const LOCAL_MATCHES_KEY = 'bluematch_local_matches_v3';

const STATUS_META = {
  waiting: { label: '대기중', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  matching: { label: '소개팅 진행중', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  coupled: { label: '교제성사', badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  paused: { label: '잠시보류', dot: 'bg-zinc-400', badge: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
};

class BlueMatchApp {
  constructor() {
    this.activeSection = 'directory'; // 'directory' | 'graph' | 'register' | 'matches' | 'settings'
    this.directoryViewMode = 'card'; // 'card' | 'table'

    // 데이터 상태
    this.profiles = this._loadLocal(LOCAL_PROFILES_KEY, SAMPLE_PROFILES);
    this.attrDefs = this._loadLocal(LOCAL_ATTRS_KEY, DEFAULT_ATTRIBUTE_DEFINITIONS);
    this.matches = this._loadLocal(LOCAL_MATCHES_KEY, SAMPLE_MATCHES);

    // 필터 상태
    this.filters = {
      search: '',
      gender: 'ALL',
      status: 'ALL',
      jobCategory: 'ALL',
      smoking: 'ALL',
      minBirthYear: '',
      maxBirthYear: '',
      selectedTag: 'ALL',
      matchTargetId: ''
    };

    this.selectedProfileId = null;
    this.activePhotoIndex = 0; // 우측 상세 드로어 및 라이트박스에서 현재 보고 있는 사진 인덱스
    this.isPhotoLightboxOpen = false; // 전체화면 원본 사진 뷰어 모달 상태
    this.drawerPhotoFitMode = 'contain'; // 'contain'(잘림 없는 원본 비율) | 'cover'(박스 꽉 채움)
    this.editingProfileId = null;
    this.draftPhotos = []; // 매물 등록/수정 폼에서 여러 장의 사진 관리 배열

    this.graphMinScore = 80;
    this.graphSelectedProfile = null;
    this.graphRenderer = null;

    // Supabase Auth 상태
    this.user = null;
    this.isSupabaseConnected = false;

    this.init();
  }

  _loadLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    const cloned = JSON.parse(JSON.stringify(fallback));
    localStorage.setItem(key, JSON.stringify(cloned));
    return cloned;
  }

  _saveLocal() {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(this.profiles));
    localStorage.setItem(LOCAL_ATTRS_KEY, JSON.stringify(this.attrDefs));
    localStorage.setItem(LOCAL_MATCHES_KEY, JSON.stringify(this.matches));
  }

  async init() {
    await this.syncWithSupabase();
    this.renderAll();
    this._bindGlobalEvents();
  }

  async syncWithSupabase() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      this.isSupabaseConnected = false;
      this.user = null;
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      this.user = sessionData?.session?.user || null;
      this.isSupabaseConnected = true;

      if (this.user) {
        const [{ data: profs, error: pErr }, { data: attrs }, { data: matchRows }] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('attribute_definitions').select('*').order('sort_order', { ascending: true }),
          supabase.from('matches').select('*').order('created_at', { ascending: false })
        ]);

        if (!pErr && profs && profs.length > 0) {
          this.profiles = profs;
        }
        if (attrs && attrs.length > 0) {
          this.attrDefs = attrs;
        }
        if (matchRows && matchRows.length > 0) {
          this.matches = matchRows;
        }
      }
    } catch (err) {
      console.warn('Supabase sync error:', err);
    }
  }

  getAttrOptions(key) {
    const found = this.attrDefs.find((d) => d.key === key);
    return found ? found.options : [];
  }

  getFilteredProfiles() {
    const f = this.filters;
    const q = f.search.trim().toLowerCase();
    const targetProfile = f.matchTargetId
      ? this.profiles.find((p) => p.id === f.matchTargetId)
      : null;

    let list = this.profiles.filter((p) => {
      if (targetProfile && p.gender === targetProfile.gender) return false;

      if (f.gender !== 'ALL' && p.gender !== f.gender) return false;
      if (f.status !== 'ALL' && p.status !== f.status) return false;
      if (f.jobCategory !== 'ALL' && p.attributes?.job_category !== f.jobCategory) return false;
      if (f.smoking !== 'ALL' && p.attributes?.smoking !== f.smoking) return false;
      if (f.minBirthYear && p.birth_year < Number(f.minBirthYear)) return false;
      if (f.maxBirthYear && p.birth_year > Number(f.maxBirthYear)) return false;

      if (f.selectedTag !== 'ALL') {
        const tags = [
          ...(p.attributes?.look_tags || []),
          ...(p.attributes?.personality_tags || [])
        ];
        if (!tags.includes(f.selectedTag)) return false;
      }

      if (q) {
        const hay = [
          p.name,
          p.location,
          p.relation,
          p.attributes?.job_category,
          p.attributes?.job_detail,
          p.attributes?.mbti,
          ...(p.attributes?.look_tags || []),
          ...(p.attributes?.personality_tags || []),
          p.raw_memo
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    if (targetProfile) {
      list = list
        .map((candidate) => ({
          ...candidate,
          _matchInfo: calculateMutualMatch(targetProfile, candidate)
        }))
        .sort((a, b) => b._matchInfo.mutualPercent - a._matchInfo.mutualPercent);
    }

    return list;
  }

  renderAll() {
    this.renderSidebar();
    this.renderHeader();
    this.renderWorkspace();
    this.renderDetailDrawer();
  }

  renderSidebar() {
    const total = this.profiles.length;
    const maleCount = this.profiles.filter((p) => p.gender === 'M').length;
    const femaleCount = this.profiles.filter((p) => p.gender === 'F').length;
    const waitingCount = this.profiles.filter((p) => p.status === 'waiting').length;

    const navEl = document.getElementById('sidebar-nav');
    if (!navEl) return;

    const navItems = [
      { id: 'directory', label: '전체 매물 디렉토리', icon: 'users', badge: total },
      { id: 'graph', label: '이상형 매칭 그래프', icon: 'network', badge: '궁합도' },
      { id: 'register', label: '새 매물 등록', icon: 'user-plus', badge: null },
      { id: 'matches', label: '소개팅 진행 관리', icon: 'heart-handshake', badge: this.matches.length },
      { id: 'settings', label: '속성 및 태그 관리', icon: 'sliders', badge: this.attrDefs.length }
    ];

    navEl.innerHTML = navItems
      .map(
        (item) => `
      <div class="nav-item ${this.activeSection === item.id ? 'active' : ''}" data-section="${item.id}">
        <div class="flex items-center gap-2.5">
          ${this._getIconSvg(item.icon)}
          <span>${item.label}</span>
        </div>
        ${
          item.badge !== null
            ? `<span class="nav-badge text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-semibold">${item.badge}</span>`
            : ''
        }
      </div>
    `
      )
      .join('');

    const statsEl = document.getElementById('sidebar-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="grid grid-cols-3 gap-1.5 text-center mb-3">
          <button data-quick-gender="M" class="p-2 rounded-lg border border-zinc-200 hover:border-blue-400 bg-zinc-50/60 transition">
            <div class="text-[11px] text-zinc-500">남성</div>
            <div class="text-sm font-bold text-blue-600">${maleCount}명</div>
          </button>
          <button data-quick-gender="F" class="p-2 rounded-lg border border-zinc-200 hover:border-rose-400 bg-zinc-50/60 transition">
            <div class="text-[11px] text-zinc-500">여성</div>
            <div class="text-sm font-bold text-rose-600">${femaleCount}명</div>
          </button>
          <button data-quick-waiting="true" class="p-2 rounded-lg border border-zinc-200 hover:border-emerald-400 bg-zinc-50/60 transition">
            <div class="text-[11px] text-zinc-500">대기중</div>
            <div class="text-sm font-bold text-emerald-600">${waitingCount}명</div>
          </button>
        </div>
        <div class="p-2.5 rounded-lg border ${
          this.user
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-zinc-200 bg-zinc-50'
        }">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${
                this.user ? 'bg-emerald-500' : 'bg-amber-500'
              }"></span>
              <span class="text-xs font-semibold text-zinc-800">
                ${this.user ? 'Supabase 실시간 연동중' : '로컬 프리뷰 (남20·여20)'}
              </span>
            </div>
          </div>
          <p class="text-[11px] text-zinc-500 leading-snug mb-2">
            ${
              this.user
                ? `${this.user.email} (관리자)`
                : '현재 40명의 샘플 데이터가 로드되어 있습니다. Supabase 연동 시 DB에 저장됩니다.'
            }
          </p>
          <button id="btn-open-supabase-modal" class="w-full py-1.5 px-2.5 rounded-md text-xs font-medium bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 transition">
            ${this.user ? 'DB 설정 / 로그아웃' : 'Supabase 연동 및 로그인'}
          </button>
        </div>
      `;
    }
  }

  renderHeader() {
    const headerTitleEl = document.getElementById('workspace-header-title');
    const headerActionsEl = document.getElementById('workspace-header-actions');
    if (!headerTitleEl || !headerActionsEl) return;

    const titles = {
      directory: { title: '전체 매물 디렉토리', desc: `총 ${this.profiles.length}명 (남성 ${this.profiles.filter(p=>p.gender==='M').length} · 여성 ${this.profiles.filter(p=>p.gender==='F').length}) 등록됨` },
      graph: { title: '이상형 매칭 네트워크 그래프', desc: '드래그 시 해당 위치에 고정되며, 기준 점수 변경이나 재배치 클릭 시 겹침 없이 재정렬됩니다.' },
      register: {
        title: this.editingProfileId ? '매물 정보 수정' : '새 매물 등록',
        desc: '사진 여러 장 등록과 본인 속성·이상형 조건을 한 번에 입력합니다.'
      },
      matches: { title: '소개팅 매칭 히스토리', desc: '누구와 누구를 소개해 주었는지 진행 상태와 피드백을 관리합니다.' },
      settings: { title: '속성 및 태그 마스터 관리', desc: '직업군, 외모/성향 해시태그, 절대불가 조건 등 선택지를 자유롭게 추가·수정합니다.' }
    };

    const current = titles[this.activeSection] || titles.directory;
    headerTitleEl.innerHTML = `
      <div class="flex items-center gap-2.5">
        <h1 class="text-[16px] font-bold tracking-tight text-zinc-900">${current.title}</h1>
        <span class="text-xs text-zinc-300 hidden sm:inline">|</span>
        <p class="text-xs text-zinc-500 hidden sm:inline">${current.desc}</p>
      </div>
    `;

    if (this.activeSection === 'directory') {
      headerActionsEl.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-100/80">
            <button data-view-mode="card" class="px-2.5 py-1 rounded-md text-xs font-medium transition ${
              this.directoryViewMode === 'card'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }">카드 뷰</button>
            <button data-view-mode="table" class="px-2.5 py-1 rounded-md text-xs font-medium transition ${
              this.directoryViewMode === 'table'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }">테이블 뷰</button>
          </div>
          <button id="btn-go-register" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition">
            <span>+ 매물 등록</span>
          </button>
        </div>
      `;
    } else {
      headerActionsEl.innerHTML = `
        <button id="btn-back-directory" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition">
          디렉토리 목록으로
        </button>
      `;
    }
  }

  renderWorkspace() {
    const filterBarEl = document.getElementById('workspace-filter-bar');
    const contentEl = document.getElementById('workspace-content');
    if (!filterBarEl || !contentEl) return;

    if (this.activeSection === 'directory') {
      filterBarEl.classList.remove('hidden');
      this._renderDirectoryFilterBar(filterBarEl);
      this._renderDirectoryContent(contentEl);
    } else {
      filterBarEl.classList.add('hidden');
      if (this.activeSection === 'graph') {
        this._renderGraphSection(contentEl, true);
      } else if (this.activeSection === 'register') {
        this._renderRegisterForm(contentEl);
      } else if (this.activeSection === 'matches') {
        this._renderMatchesSection(contentEl);
      } else if (this.activeSection === 'settings') {
        this._renderSettingsSection(contentEl);
      }
    }
  }

  _renderDirectoryFilterBar(container) {
    const f = this.filters;
    const jobs = this.getAttrOptions('job_category');
    const lookTags = this.getAttrOptions('look_tags');
    const personalityTags = this.getAttrOptions('personality_tags');
    const allTags = [...lookTags.slice(0, 8), ...personalityTags.slice(0, 5)];

    container.innerHTML = `
      <div class="px-6 py-3 bg-white border-b border-zinc-200 space-y-2.5">
        <div class="flex flex-wrap items-center gap-2">
          <!-- 검색창 -->
          <div class="relative w-52">
            <input
              id="filter-search"
              type="text"
              value="${this._escape(f.search)}"
              placeholder="이름, 직장, 지역, #태그 검색..."
              class="sq-input w-full pl-8 pr-3 py-1.5"
            />
            <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>

          <!-- 성별 세그먼트 -->
          <div class="inline-flex rounded-lg border border-zinc-200 p-0.5 bg-zinc-50">
            <button data-filter-gender="ALL" class="px-2.5 py-1 rounded-md text-xs font-medium ${
              f.gender === 'ALL' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }">전체 (${this.profiles.length})</button>
            <button data-filter-gender="M" class="px-2.5 py-1 rounded-md text-xs font-medium ${
              f.gender === 'M' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:text-blue-600'
            }">남성 (${this.profiles.filter(p=>p.gender==='M').length})</button>
            <button data-filter-gender="F" class="px-2.5 py-1 rounded-md text-xs font-medium ${
              f.gender === 'F' ? 'bg-rose-600 text-white' : 'text-zinc-600 hover:text-rose-600'
            }">여성 (${this.profiles.filter(p=>p.gender==='F').length})</button>
          </div>

          <!-- 상태 필터 -->
          <select id="filter-status" class="sq-input px-2.5 py-1.5">
            <option value="ALL" ${f.status === 'ALL' ? 'selected' : ''}>모든 상태</option>
            <option value="waiting" ${f.status === 'waiting' ? 'selected' : ''}>대기중</option>
            <option value="matching" ${f.status === 'matching' ? 'selected' : ''}>소개팅 진행중</option>
            <option value="coupled" ${f.status === 'coupled' ? 'selected' : ''}>교제성사</option>
            <option value="paused" ${f.status === 'paused' ? 'selected' : ''}>보류</option>
          </select>

          <!-- 직업 분류 필터 -->
          <select id="filter-job" class="sq-input px-2.5 py-1.5">
            <option value="ALL" ${f.jobCategory === 'ALL' ? 'selected' : ''}>모든 직업군</option>
            ${jobs
              .map(
                (j) => `<option value="${j}" ${f.jobCategory === j ? 'selected' : ''}>${j}</option>`
              )
              .join('')}
          </select>

          <!-- 흡연 여부 필터 -->
          <select id="filter-smoking" class="sq-input px-2.5 py-1.5">
            <option value="ALL" ${f.smoking === 'ALL' ? 'selected' : ''}>흡연 무관</option>
            <option value="비흡연" ${f.smoking === '비흡연' ? 'selected' : ''}>비흡연만</option>
          </select>

          <!-- 출생연도 범위 -->
          <div class="flex items-center gap-1 text-xs text-zinc-500">
            <input id="filter-min-year" type="number" placeholder="1988" value="${f.minBirthYear}" class="sq-input w-16 px-2 py-1.5 text-center" />
            <span>~</span>
            <input id="filter-max-year" type="number" placeholder="2000" value="${f.maxBirthYear}" class="sq-input w-16 px-2 py-1.5 text-center" />
            <span>년</span>
          </div>

          <!-- 특정 매물 기준 이상형 매칭률 정렬 -->
          <div class="ml-auto flex items-center gap-1.5">
            <span class="text-xs font-medium text-zinc-600">🎯 궁합 기준:</span>
            <select id="filter-match-target" class="sq-input px-2.5 py-1.5 font-medium ${
              f.matchTargetId ? 'border-zinc-900 bg-zinc-900 text-white' : ''
            }">
              <option value="">기준 매물 선택 안함</option>
              ${this.profiles
                .map(
                  (p) =>
                    `<option value="${p.id}" ${f.matchTargetId === p.id ? 'selected' : ''}>[${
                      p.gender === 'M' ? '남' : '여'
                    }] ${p.name} (${String(p.birth_year).slice(2)}년·${
                      p.attributes?.job_category || ''
                    }) 기준</option>`
                )
                .join('')}
            </select>
            ${
              this._hasActiveFilters()
                ? `<button id="btn-reset-filters" class="text-xs text-zinc-500 hover:text-zinc-900 underline px-1.5">초기화</button>`
                : ''
            }
          </div>
        </div>

        <!-- 2행: 빠른 해시태그 필터 칩 -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span class="text-[11px] font-medium text-zinc-400 mr-1 shrink-0">인기 태그:</span>
          <span data-filter-tag="ALL" class="tag-chip selectable ${
            f.selectedTag === 'ALL' ? 'selected' : ''
          }">전체</span>
          ${allTags
            .map(
              (tag) => `
            <span data-filter-tag="${tag}" class="tag-chip selectable ${
                f.selectedTag === tag ? 'selected' : ''
              }">${tag}</span>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  _hasActiveFilters() {
    const f = this.filters;
    return (
      f.search !== '' ||
      f.gender !== 'ALL' ||
      f.status !== 'ALL' ||
      f.jobCategory !== 'ALL' ||
      f.smoking !== 'ALL' ||
      f.minBirthYear !== '' ||
      f.maxBirthYear !== '' ||
      f.selectedTag !== 'ALL' ||
      f.matchTargetId !== ''
    );
  }

  _renderDirectoryContent(container) {
    const list = this.getFilteredProfiles();
    const targetProfile = this.filters.matchTargetId
      ? this.profiles.find((p) => p.id === this.filters.matchTargetId)
      : null;

    const bannerHtml = targetProfile
      ? `
      <div class="mb-4 p-3.5 rounded-xl bg-zinc-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded bg-white/15 text-xs font-semibold">쌍방 궁합 분석 모드</span>
          <span class="text-xs sm:text-sm">
            현재 <strong>${targetProfile.name} (${targetProfile.birth_year}년생)</strong>님의 이상형 조건과 상대방의 이상형 조건을 교차 계산하여 매칭률이 높은 이성 순으로 정렬 중입니다.
          </span>
        </div>
        <button id="btn-clear-target" class="text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition shrink-0">해제</button>
      </div>
    `
      : '';

    if (list.length === 0) {
      container.innerHTML = `
        ${bannerHtml}
        <div class="sq-card p-12 text-center">
          <div class="text-sm font-semibold text-zinc-800 mb-1">조건에 맞는 매물이 없습니다</div>
          <p class="text-xs text-zinc-500 mb-4">필터 조건을 완화하거나 새로운 매물을 등록해 보세요.</p>
          <button id="btn-empty-reset" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-white">필터 초기화</button>
        </div>
      `;
      return;
    }

    if (this.directoryViewMode === 'card') {
      container.innerHTML = `
        ${bannerHtml}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          ${list.map((p) => this._renderSquareCard(p, targetProfile)).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `
        ${bannerHtml}
        ${this._renderSquareTable(list, targetProfile)}
      `;
    }
  }

  _renderSquareCard(p) {
    const st = STATUS_META[p.status] || STATUS_META.waiting;
    const attrs = p.attributes || {};
    const ideal = p.ideal_type || {};
    const tags = [...(attrs.look_tags || []), ...(attrs.personality_tags || [])].slice(0, 4);
    const photos = p.photos || [];
    const mainPhoto = photos[0] || '';
    const isSelected = this.selectedProfileId === p.id;
    const matchInfo = p._matchInfo;

    return `
      <div
        data-profile-card="${p.id}"
        class="sq-card p-4 flex flex-col justify-between cursor-pointer ${
          isSelected ? 'ring-2 ring-zinc-900 border-zinc-900' : ''
        }"
      >
        <div>
          <!-- 카드 상단: 상태 배지 + 성별/매칭률 -->
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${st.badge}">
              <span class="w-1.5 h-1.5 rounded-full ${st.dot}"></span>
              ${st.label}
            </span>
            <div class="flex items-center gap-1.5">
              ${
                matchInfo
                  ? `<span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      matchInfo.mutualPercent >= 85
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                    }">궁합 ${matchInfo.mutualPercent}%</span>`
                  : ''
              }
              <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                p.gender === 'M'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }">
                ${p.gender === 'M' ? '남성' : '여성'}
              </span>
            </div>
          </div>

          <!-- 프로필 아바타 (+ 사진 장수 배지) & 이름/핵심 스펙 -->
          <div class="flex items-center gap-3 mb-3">
            <div class="relative shrink-0">
              ${
                mainPhoto
                  ? `<img src="${mainPhoto}" alt="${this._escape(p.name)}" class="w-12 h-12 rounded-full object-cover border border-zinc-200" />`
                  : `<div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                      p.gender === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                    }">${this._escape(p.name.slice(0, 2))}</div>`
              }
              ${
                photos.length > 1
                  ? `<span class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-zinc-900 text-white text-[9.5px] font-bold border border-white">+${photos.length}</span>`
                  : ''
              }
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h3 class="text-sm font-bold text-zinc-900 truncate">${this._escape(p.name)}</h3>
                <span class="text-xs text-zinc-500 font-medium">${p.birth_year}년생</span>
              </div>
              <p class="text-xs text-zinc-600 truncate mt-0.5">
                ${this._escape(attrs.job_detail || attrs.job_category || '직업 미기재')}
              </p>
              <p class="text-[11px] text-zinc-400 truncate mt-0.5">
                ${p.height ? `${p.height}cm · ` : ''}${this._escape(p.location || '지역 미기재')}
              </p>
            </div>
          </div>

          <!-- 정돈된 2열 스펙 요약 박스 -->
          <div class="grid grid-cols-2 gap-1.5 p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[11.5px] mb-3">
            <div>
              <span class="text-zinc-400 block text-[10.5px]">직업분류 / 연봉</span>
              <span class="font-medium text-zinc-800 truncate block">${this._escape(attrs.job_category || '-')} · ${this._escape(attrs.income_range || '-')}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10.5px]">흡연 / MBTI / 종교</span>
              <span class="font-medium text-zinc-800 truncate block">${this._escape(attrs.smoking || '-')} · ${this._escape(attrs.mbti || '-')} · ${this._escape(attrs.religion || '-')}</span>
            </div>
          </div>

          <!-- 매력 & 성향 태그 -->
          <div class="flex flex-wrap gap-1 mb-3">
            ${tags.map((t) => `<span class="tag-chip">${this._escape(t)}</span>`).join('')}
          </div>
        </div>

        <!-- 하단: 희망 이상형 한줄 요약 -->
        <div class="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11.5px]">
          ${
            matchInfo
              ? `<div class="text-zinc-600 truncate">
                  <span class="font-semibold text-zinc-900">일치:</span> ${
                    matchInfo.aToB.matchedReasons[0] || '조건 양호'
                  }
                </div>`
              : `<div class="text-zinc-500 truncate">
                  <span class="font-medium text-zinc-700">희망:</span> ${
                    ideal.min_birth_year ? `${String(ideal.min_birth_year).slice(2)}~${String(ideal.max_birth_year || '').slice(2)}년생` : '나이무관'
                  }${ideal.min_height ? ` · ${ideal.min_height}cm↑` : ''}
                </div>`
          }
          <button
            data-quick-target="${p.id}"
            title="이 매물을 기준으로 이상형 궁합 순 정렬"
            class="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 shrink-0 ml-2 px-1.5 py-0.5 rounded hover:bg-zinc-100"
          >
            궁합찾기 →
          </button>
        </div>
      </div>
    `;
  }

  _renderSquareTable(list, targetProfile) {
    return `
      <div class="sq-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-zinc-200 bg-zinc-50/80 text-[11.5px] font-semibold text-zinc-500">
                <th class="py-2.5 px-4">매물 (이름/연령/사진)</th>
                <th class="py-2.5 px-3">상태</th>
                ${targetProfile ? '<th class="py-2.5 px-3">쌍방 궁합</th>' : ''}
                <th class="py-2.5 px-3">신장 / 거주지</th>
                <th class="py-2.5 px-3">직업 / 연봉</th>
                <th class="py-2.5 px-3">체형 / 스타일 태그</th>
                <th class="py-2.5 px-3">흡연 / 음주 / 종교</th>
                <th class="py-2.5 px-3">희망 이상형 핵심</th>
                <th class="py-2.5 px-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 text-xs">
              ${list
                .map((p) => {
                  const st = STATUS_META[p.status] || STATUS_META.waiting;
                  const attrs = p.attributes || {};
                  const ideal = p.ideal_type || {};
                  const tags = [...(attrs.look_tags || []), ...(attrs.personality_tags || [])].slice(0, 3);
                  return `
                    <tr data-profile-card="${p.id}" class="hover:bg-zinc-50/90 cursor-pointer transition">
                      <td class="py-2.5 px-4">
                        <div class="flex items-center gap-2.5">
                          <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            p.gender === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          }">${p.gender === 'M' ? '남' : '여'}</span>
                          <div>
                            <div class="font-semibold text-zinc-900">
                              ${this._escape(p.name)}
                              <span class="text-zinc-400 font-normal">(${p.birth_year})</span>
                              <span class="text-[10px] text-zinc-400 ml-1">📷${(p.photos || []).length}</span>
                            </div>
                            <div class="text-[11px] text-zinc-400">${this._escape(p.relation || '')}</div>
                          </div>
                        </div>
                      </td>
                      <td class="py-2.5 px-3">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${st.badge}">
                          <span class="w-1.5 h-1.5 rounded-full ${st.dot}"></span>${st.label}
                        </span>
                      </td>
                      ${
                        targetProfile
                          ? `<td class="py-2.5 px-3 font-bold text-zinc-900">${p._matchInfo?.mutualPercent || 0}%</td>`
                          : ''
                      }
                      <td class="py-2.5 px-3 text-zinc-700">${p.height || '-'}cm · ${this._escape(p.location || '-')}</td>
                      <td class="py-2.5 px-3">
                        <div class="font-medium text-zinc-800">${this._escape(attrs.job_detail || attrs.job_category || '-')}</div>
                        <div class="text-[11px] text-zinc-400">${this._escape(attrs.income_range || '')}</div>
                      </td>
                      <td class="py-2.5 px-3">
                        <div class="flex flex-wrap gap-1">
                          ${tags.map((t) => `<span class="tag-chip">${this._escape(t)}</span>`).join('')}
                        </div>
                      </td>
                      <td class="py-2.5 px-3 text-zinc-600">${this._escape(attrs.smoking || '-')} / ${this._escape(attrs.drinking || '-')} / ${this._escape(attrs.religion || '-')}</td>
                      <td class="py-2.5 px-3 text-zinc-600">
                        ${ideal.min_birth_year || ''}~${ideal.max_birth_year || ''}년생, ${ideal.min_height ? `${ideal.min_height}cm↑` : '키무관'}
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        <button data-quick-target="${p.id}" class="px-2 py-1 rounded border border-zinc-200 hover:bg-zinc-100 text-[11px] font-medium">궁합비교</button>
                      </td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * 이상형 매칭 그래프 섹션 렌더링
   * relayout=true 일 때만 전체 노드 배치를 재계산하고, 단순 노드 클릭 시에는 우측 패널만 갱신하여 노드 위치가 흔들리지 않게 유지합니다.
   */
  _renderGraphSection(container, relayout = true) {
    const existingCanvas = document.getElementById('matching-graph-canvas');

    if (!existingCanvas || relayout) {
      container.innerHTML = `
        <div class="sq-card h-[calc(100vh-116px)] flex flex-col lg:flex-row overflow-hidden">
          <!-- 그래프 캔버스 영역 -->
          <div class="flex-1 flex flex-col relative min-h-[420px]">
            <!-- 상단 컨트롤 오버레이 -->
            <div class="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div class="pointer-events-auto inline-flex flex-wrap items-center gap-3 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur border border-zinc-200 shadow-xs text-xs">
                <span class="flex items-center gap-1.5 font-medium text-zinc-700">
                  <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span> 남성 (${this.profiles.filter(p=>p.gender==='M').length})
                </span>
                <span class="flex items-center gap-1.5 font-medium text-zinc-700">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-600"></span> 여성 (${this.profiles.filter(p=>p.gender==='F').length})
                </span>
                <span class="text-zinc-300">|</span>
                <label class="flex items-center gap-2 text-zinc-600">
                  <span>연결선 표시 기준: <strong id="graph-threshold-label">${this.graphMinScore}% 이상</strong></span>
                  <input id="graph-threshold-slider" type="range" min="65" max="90" step="5" value="${this.graphMinScore}" class="w-24 accent-zinc-900 cursor-pointer" />
                </label>
                <span class="text-zinc-300">|</span>
                <button id="btn-graph-relayout" class="px-2.5 py-1 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-medium transition">
                  🔄 노드 배치 재정렬
                </button>
                <button id="btn-graph-fit" class="px-2 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 transition">
                  화면 맞춤
                </button>
              </div>
              <div class="pointer-events-auto hidden xl:block px-3 py-1.5 rounded-lg bg-zinc-900/85 text-white text-[11px]">
                💡 노드를 드래그하면 원하는 위치에 고정됩니다 · 마우스 휠로 확대/축소 가능
              </div>
            </div>

            <div id="graph-canvas-wrapper" class="flex-1">
              <canvas id="matching-graph-canvas"></canvas>
            </div>
          </div>

          <!-- 우측 궁합 분석 사이드바 -->
          <div id="graph-side-panel" class="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 bg-white flex flex-col h-full"></div>
        </div>
      `;

      const canvas = document.getElementById('matching-graph-canvas');
      if (canvas) {
        this.graphRenderer = new MatchingGraphRenderer(canvas, (profile) => {
          this.graphSelectedProfile = profile;
          if (profile) {
            this.selectedProfileId = profile.id;
            this.activePhotoIndex = 0;
          }
          this._updateGraphSidePanel();
        });
        this.graphRenderer.setData(
          this.profiles,
          this.graphMinScore,
          this.graphSelectedProfile?.id || null,
          true
        );
      }
    }

    this._updateGraphSidePanel();
  }

  _updateGraphSidePanel() {
    const sideEl = document.getElementById('graph-side-panel');
    if (!sideEl) return;

    const selected = this.graphSelectedProfile;
    if (!selected) {
      sideEl.innerHTML = `
        <div class="p-6 text-center text-xs text-zinc-500 my-auto space-y-2">
          <div class="font-bold text-zinc-800 text-sm">노드를 클릭해 보세요</div>
          <p class="leading-relaxed">왼쪽 그래프에서 특정 매물(원형 프로필)을 클릭하면, 그 사람의 사진과 양방향 궁합 순위가 여기에 표시됩니다.</p>
          <p class="text-[11px] text-zinc-400 pt-2">노드를 마우스로 끌어다 놓으면 젤리처럼 흔들리지 않고 놓은 자리에 고정됩니다.</p>
        </div>
      `;
      return;
    }

    const opposites = this.profiles
      .filter((p) => p.gender !== selected.gender)
      .map((cand) => ({
        candidate: cand,
        match: calculateMutualMatch(selected, cand)
      }))
      .sort((a, b) => b.match.mutualPercent - a.match.mutualPercent);

    const photos = selected.photos || [];

    sideEl.innerHTML = `
      <div class="p-4 border-b border-zinc-200 bg-zinc-50/60 space-y-2.5">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-bold text-zinc-900">${this._escape(selected.name)} (${selected.birth_year}년생 · ${selected.height || '-'}cm)</span>
            <p class="text-[11px] text-zinc-500 mt-0.5">${this._escape(selected.attributes?.job_detail || selected.attributes?.job_category || '')}</p>
          </div>
          <button id="btn-graph-open-detail" data-id="${selected.id}" class="px-2.5 py-1 rounded-md bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-800 shrink-0">
            우측 상세창 열기
          </button>
        </div>

        <!-- 그래프 우측 패널에서 바로 사진 썸네일 클릭 -> 전체화면 원본 사진 열기 -->
        ${
          photos.length > 0
            ? `
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10.5px] font-medium text-zinc-500">사진 클릭 시 전체화면 원본 확대 (${photos.length}장)</span>
              <button type="button" data-open-photo-lightbox="true" class="text-[11px] font-semibold text-blue-600 hover:underline">🔍 크게 보기</button>
            </div>
            <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              ${photos
                .map(
                  (url, idx) => `
                <img
                  src="${url}"
                  data-graph-photo-idx="${idx}"
                  title="클릭하여 원본 Full 사진 보기"
                  class="w-16 h-16 rounded-lg object-cover border border-zinc-200 cursor-zoom-in hover:border-zinc-900 transition shrink-0"
                />
              `
                )
                .join('')}
            </div>
          </div>
        `
            : ''
        }

        <p class="text-[11px] text-zinc-500">희망: ${selected.ideal_type?.min_birth_year || ''}~${selected.ideal_type?.max_birth_year || ''}년생 · ${selected.ideal_type?.min_height || '키무관'}cm↑</p>
      </div>
      <div class="p-4 space-y-2.5 overflow-y-auto flex-1">
        <div class="text-xs font-semibold text-zinc-500 mb-2">양방향 이상형 궁합 순위 (${opposites.length}명)</div>
        ${opposites
          .map(
            ({ candidate, match }) => `
          <div data-graph-focus="${candidate.id}" class="p-3 rounded-lg border border-zinc-200 hover:border-zinc-400 bg-white cursor-pointer transition">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-bold text-zinc-900">${this._escape(candidate.name)} (${candidate.birth_year}년 · ${candidate.height || '-'}cm)</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                match.mutualPercent >= 85 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-800'
              }">쌍방 ${match.mutualPercent}%</span>
            </div>
            <div class="text-[11px] text-zinc-500 mb-1.5">
              ${this._escape(candidate.name)}→본인: <strong>${match.bToA.percent}%</strong> / 본인→${this._escape(candidate.name)}: <strong>${match.aToB.percent}%</strong>
            </div>
            <div class="text-[11px] text-emerald-700">✓ ${match.aToB.matchedReasons.slice(0, 2).join(', ') || '기본 조건 부합'}</div>
            ${
              match.aToB.missedReasons.length > 0
                ? `<div class="text-[11px] text-amber-600 mt-0.5">• ${match.aToB.missedReasons[0]}</div>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  _renderRegisterForm(container) {
    const editing = this.editingProfileId
      ? this.profiles.find((p) => p.id === this.editingProfileId)
      : null;

    const p = editing || {
      name: '',
      gender: 'M',
      birth_year: 1995,
      height: 175,
      location: '',
      contact: '',
      relation: '',
      status: 'waiting',
      photos: [],
      attributes: {
        job_category: '대기업',
        job_detail: '',
        education: '4년제 대졸(수도권)',
        income_range: '6,000~8,000만',
        body_type: '보통',
        look_tags: [],
        smoking: '비흡연',
        drinking: '가끔(사회적 음주)',
        religion: '무교',
        mbti: 'ENFP',
        personality_tags: [],
        marriage_intent: '좋은 사람 만나면 결혼 생각 있음'
      },
      ideal_type: {
        min_birth_year: 1992,
        max_birth_year: 1998,
        min_height: 160,
        max_height: 185,
        preferred_job_categories: [],
        preferred_look_tags: [],
        deal_breakers: ['흡연자 불가'],
        ideal_memo: ''
      },
      raw_memo: ''
    };

    const renderSelectOptions = (key, selectedVal) =>
      this.getAttrOptions(key)
        .map((opt) => `<option value="${opt}" ${selectedVal === opt ? 'selected' : ''}>${opt}</option>`)
        .join('');

    const renderMultiTagChips = (key, fieldName, selectedArr = []) =>
      this.getAttrOptions(key)
        .map(
          (opt) => `
        <span
          data-form-multi="${fieldName}"
          data-val="${opt}"
          class="tag-chip selectable ${selectedArr.includes(opt) ? 'selected' : ''}"
        >${opt}</span>
      `
        )
        .join('');

    container.innerHTML = `
      <form id="profile-register-form" class="max-w-4xl mx-auto space-y-5 pb-12">
        <!-- 1. 기본 인적사항 & 다중 사진 업로드 -->
        <div class="sq-card p-5">
          <h2 class="text-sm font-bold text-zinc-900 mb-3.5 pb-2 border-b border-zinc-100">1. 기본 인적사항 및 사진 (여러 장 등록 가능)</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">이름 (또는 별칭) *</label>
              <input name="name" required value="${this._escape(p.name)}" placeholder="예: 김민준" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">성별 *</label>
              <select name="gender" class="sq-input w-full px-3 py-2">
                <option value="M" ${p.gender === 'M' ? 'selected' : ''}>남성 (M)</option>
                <option value="F" ${p.gender === 'F' ? 'selected' : ''}>여성 (F)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">현재 매칭 상태</label>
              <select name="status" class="sq-input w-full px-3 py-2">
                <option value="waiting" ${p.status === 'waiting' ? 'selected' : ''}>대기중</option>
                <option value="matching" ${p.status === 'matching' ? 'selected' : ''}>소개팅 진행중</option>
                <option value="coupled" ${p.status === 'coupled' ? 'selected' : ''}>교제성사</option>
                <option value="paused" ${p.status === 'paused' ? 'selected' : ''}>잠시보류</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">출생연도 (4자리) *</label>
              <input name="birth_year" type="number" required value="${p.birth_year}" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">키 (cm)</label>
              <input name="height" type="number" value="${p.height || ''}" placeholder="178" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">거주지 / 주 활동지역</label>
              <input name="location" value="${this._escape(p.location || '')}" placeholder="예: 서울 강남/서초, 분당" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">연락처 / 카톡 ID</label>
              <input name="contact" value="${this._escape(p.contact || '')}" placeholder="010-XXXX-XXXX" class="sq-input w-full px-3 py-2" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-zinc-700 mb-1">주선자(관리자)와의 관계 및 보증 메모</label>
              <input name="relation" value="${this._escape(p.relation || '')}" placeholder="예: 대학 동기, 전 직장 후배" class="sq-input w-full px-3 py-2" />
            </div>
          </div>

          <!-- 다중 사진 업로드 & 미리보기 관리 영역 -->
          <div class="mt-4 pt-4 border-t border-zinc-100">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-bold text-zinc-800">프로필 사진 여러 장 등록 (첫 번째 사진이 대표 사진으로 사용됩니다)</label>
              <span class="text-[11px] text-zinc-500">파일 여러 개 선택 또는 URL 여러 번 추가 가능</span>
            </div>

            <div class="flex flex-wrap items-center gap-2 mb-3">
              <label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition">
                <span>📷 사진 파일 여러 장 추가</span>
                <input id="form-photo-files" type="file" accept="image/*" multiple class="hidden" />
              </label>

              <div class="flex items-center gap-1.5 flex-1 min-w-[240px]">
                <input id="input-photo-url" type="url" placeholder="또는 이미지 URL 입력 후 [URL 추가] 클릭 (https://...)" class="sq-input flex-1 px-3 py-1.5" />
                <button type="button" id="btn-add-photo-url" class="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-medium shrink-0">
                  + URL 추가
                </button>
              </div>
            </div>

            <!-- 등록된 사진 미리보기 그리드 -->
            <div id="draft-photos-preview" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3"></div>
          </div>
        </div>

        <!-- 2 & 3 & 4. 본인 속성 -->
        <div class="sq-card p-5 space-y-4">
          <h2 class="text-sm font-bold text-zinc-900 pb-2 border-b border-zinc-100">2. 본인 스펙 · 외모 · 라이프스타일 속성</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">직업 분류</label>
              <select name="job_category" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('job_category', p.attributes?.job_category)}
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-zinc-700 mb-1">상세 직장명 / 직무</label>
              <input name="job_detail" value="${this._escape(p.attributes?.job_detail || '')}" placeholder="예: 삼성전자 개발자, 대형 로펌 변호사" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">학력</label>
              <select name="education" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('education', p.attributes?.education)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">연봉 구간</label>
              <select name="income_range" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('income_range', p.attributes?.income_range)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">체형</label>
              <select name="body_type" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('body_type', p.attributes?.body_type)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">흡연 여부</label>
              <select name="smoking" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('smoking', p.attributes?.smoking)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">음주 빈도</label>
              <select name="drinking" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('drinking', p.attributes?.drinking)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">종교</label>
              <select name="religion" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('religion', p.attributes?.religion)}
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">MBTI</label>
              <select name="mbti" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('mbti', p.attributes?.mbti)}
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-zinc-700 mb-1">결혼 생각</label>
              <select name="marriage_intent" class="sq-input w-full px-3 py-2">
                ${renderSelectOptions('marriage_intent', p.attributes?.marriage_intent)}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">본인 외모/분위기 태그 (클릭하여 다중 선택)</label>
            <div class="flex flex-wrap gap-1.5">
              ${renderMultiTagChips('look_tags', 'self_look_tags', p.attributes?.look_tags || [])}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">본인 성향/취미 태그 (클릭하여 다중 선택)</label>
            <div class="flex flex-wrap gap-1.5">
              ${renderMultiTagChips('personality_tags', 'self_personality_tags', p.attributes?.personality_tags || [])}
            </div>
          </div>
        </div>

        <!-- 5. 희망 이상형 조건 -->
        <div class="sq-card p-5 space-y-4">
          <h2 class="text-sm font-bold text-zinc-900 pb-2 border-b border-zinc-100">3. 원하는 이상형 조건 (매칭 알고리즘 기준)</h2>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">희망 최소 출생연도</label>
              <input name="ideal_min_birth_year" type="number" value="${p.ideal_type?.min_birth_year || 1990}" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">희망 최대 출생연도</label>
              <input name="ideal_max_birth_year" type="number" value="${p.ideal_type?.max_birth_year || 1999}" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">희망 최소 키 (cm)</label>
              <input name="ideal_min_height" type="number" value="${p.ideal_type?.min_height || 160}" class="sq-input w-full px-3 py-2" />
            </div>
            <div>
              <label class="block text-xs font-medium text-zinc-700 mb-1">희망 최대 키 (cm)</label>
              <input name="ideal_max_height" type="number" value="${p.ideal_type?.max_height || 195}" class="sq-input w-full px-3 py-2" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">선호하는 상대방 직업군 (다중 선택)</label>
            <div class="flex flex-wrap gap-1.5">
              ${renderMultiTagChips('job_category', 'ideal_jobs', p.ideal_type?.preferred_job_categories || [])}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">선호하는 상대방 외모/분위기 태그 (다중 선택)</label>
            <div class="flex flex-wrap gap-1.5">
              ${renderMultiTagChips('look_tags', 'ideal_looks', p.ideal_type?.preferred_look_tags || [])}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1.5">절대 불가 조건 (Deal-breaker)</label>
            <div class="flex flex-wrap gap-1.5">
              ${renderMultiTagChips('deal_breakers', 'ideal_breakers', p.ideal_type?.deal_breakers || [])}
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1">이상형 한줄 요약 설명</label>
            <input name="ideal_memo" value="${this._escape(p.ideal_type?.ideal_memo || '')}" placeholder="예: 다정하고 대화가 잘 통하며 비흡연자인 분 선호" class="sq-input w-full px-3 py-2" />
          </div>
        </div>

        <!-- 6. 카톡 원문 및 관리자 비공개 메모 -->
        <div class="sq-card p-5">
          <h2 class="text-sm font-bold text-zinc-900 mb-2">4. 카톡/문자 원문 복사 붙여넣기 및 관리자 메모</h2>
          <textarea name="raw_memo" rows="4" placeholder="카톡으로 받은 자기소개/이상형 메시지를 그대로 붙여넣어 보관하세요." class="sq-input w-full p-3">${this._escape(p.raw_memo || '')}</textarea>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button type="button" id="btn-cancel-register" class="px-4 py-2 rounded-lg text-xs font-medium border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50">취소</button>
          <button type="submit" class="px-5 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800">
            ${editing ? '수정 내용 저장하기' : '매물 등록 완료'}
          </button>
        </div>
      </form>
    `;

    this._renderDraftPhotosPreview();
  }

  _renderDraftPhotosPreview() {
    const previewEl = document.getElementById('draft-photos-preview');
    if (!previewEl) return;

    if (this.draftPhotos.length === 0) {
      previewEl.innerHTML = `
        <div class="col-span-full py-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center text-xs text-zinc-400">
          아직 추가된 사진이 없습니다. 위 버튼으로 여러 장의 사진을 등록해 보세요.
        </div>
      `;
      return;
    }

    previewEl.innerHTML = this.draftPhotos
      .map(
        (url, idx) => `
      <div class="relative group rounded-lg overflow-hidden border ${
        idx === 0 ? 'border-zinc-900 ring-2 ring-zinc-900' : 'border-zinc-200'
      } bg-zinc-100 aspect-square">
        <img src="${url}" class="w-full h-full object-cover" />
        <div class="absolute top-1.5 left-1.5">
          ${
            idx === 0
              ? `<span class="px-1.5 py-0.5 rounded bg-zinc-900 text-white text-[10px] font-bold">대표 사진</span>`
              : `<button type="button" data-make-primary-photo="${idx}" class="px-1.5 py-0.5 rounded bg-white/90 hover:bg-white text-zinc-800 text-[10px] font-semibold shadow">대표로 지정</button>`
          }
        </div>
        <button
          type="button"
          data-remove-draft-photo="${idx}"
          class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/65 text-white text-xs flex items-center justify-center hover:bg-rose-600 transition"
          title="사진 삭제"
        >×</button>
      </div>
    `
      )
      .join('');
  }

  _renderMatchesSection(container) {
    const matchStatusMap = {
      proposed: { label: '프로필 제안중', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
      connected: { label: '연락처 교환', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
      dating: { label: '만남 진행중', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
      coupled: { label: '교제 성사 🎉', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      failed: { label: '아쉽게 불발', badge: 'bg-zinc-100 text-zinc-600 border-zinc-200' }
    };

    const males = this.profiles.filter((p) => p.gender === 'M');
    const females = this.profiles.filter((p) => p.gender === 'F');

    container.innerHTML = `
      <div class="max-w-5xl mx-auto space-y-5">
        <form id="new-match-form" class="sq-card p-4 flex flex-wrap items-end gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1">남성 매물</label>
            <select name="profile_a_id" class="sq-input px-3 py-1.5">
              ${males.map((m) => `<option value="${m.id}">${this._escape(m.name)} (${m.birth_year})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1">여성 매물</label>
            <select name="profile_b_id" class="sq-input px-3 py-1.5">
              ${females.map((f) => `<option value="${f.id}">${this._escape(f.name)} (${f.birth_year})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1">진행 상태</label>
            <select name="match_status" class="sq-input px-3 py-1.5">
              <option value="proposed">프로필 제안중</option>
              <option value="connected">연락처 교환</option>
              <option value="dating">만남 진행중</option>
              <option value="coupled">교제 성사</option>
              <option value="failed">불발</option>
            </select>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-[11px] font-semibold text-zinc-600 mb-1">진행 메모 / 피드백</label>
            <input name="notes" placeholder="예: 남자측 호감, 이번주 토요일 강남역 첫만남 예정" class="sq-input w-full px-3 py-1.5" />
          </div>
          <button type="submit" class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800">+ 매칭 기록 추가</button>
        </form>

        <div class="sq-card divide-y divide-zinc-200">
          ${
            this.matches.length === 0
              ? `<div class="p-10 text-center text-xs text-zinc-500">아직 기록된 소개팅 매칭 내역이 없습니다.</div>`
              : this.matches
                  .map((m) => {
                    const pa = this.profiles.find((p) => p.id === m.profile_a_id);
                    const pb = this.profiles.find((p) => p.id === m.profile_b_id);
                    const st = matchStatusMap[m.match_status] || matchStatusMap.proposed;
                    return `
                      <div class="p-4 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <span class="px-2.5 py-1 rounded-md text-xs font-semibold border ${st.badge}">${st.label}</span>
                          <div class="text-xs font-bold text-zinc-900">
                            ${this._escape(pa?.name || '삭제된 매물')} <span class="text-zinc-400 mx-1">↔</span> ${this._escape(pb?.name || '삭제된 매물')}
                          </div>
                          <span class="text-[11px] text-zinc-400">${m.matched_at || ''}</span>
                        </div>
                        <div class="text-xs text-zinc-600 flex-1">${this._escape(m.notes || '')}</div>
                        <button data-delete-match="${m.id}" class="text-xs text-zinc-400 hover:text-rose-600">삭제</button>
                      </div>
                    `;
                  })
                  .join('')
          }
        </div>
      </div>
    `;
  }

  _renderSettingsSection(container) {
    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-4 pb-10">
        <div class="sq-card p-4 bg-zinc-900 text-white flex items-center justify-between">
          <div>
            <div class="text-xs font-bold">유연한 속성 & 해시태그 관리</div>
            <div class="text-[11px] text-zinc-300 mt-0.5">여기서 태그나 선택지를 추가하면 매물 등록 폼과 디렉토리 필터에 즉시 반영됩니다.</div>
          </div>
          <button id="btn-reset-sample-40" class="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium shrink-0">
            샘플 40명 초기상태 복원
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${this.attrDefs
            .map(
              (def) => `
            <div class="sq-card p-4 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-zinc-900">${this._escape(def.label)}</span>
                  <span class="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 font-mono">${def.key}</span>
                </div>
                <div class="flex flex-wrap gap-1.5 mb-3">
                  ${(def.options || [])
                    .map(
                      (opt) => `
                    <span class="tag-chip inline-flex items-center gap-1">
                      ${this._escape(opt)}
                      <button data-remove-opt-key="${def.key}" data-remove-opt-val="${this._escape(opt)}" class="text-zinc-400 hover:text-rose-600 ml-0.5">×</button>
                    </span>
                  `
                    )
                    .join('')}
                </div>
              </div>
              <form data-add-opt-form="${def.key}" class="flex gap-1.5 pt-2 border-t border-zinc-100">
                <input name="new_opt" required placeholder="새 항목/태그 입력..." class="sq-input flex-1 px-2.5 py-1 text-xs" />
                <button type="submit" class="px-3 py-1 rounded bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800">+ 추가</button>
              </form>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  renderDetailDrawer() {
    const drawerEl = document.getElementById('profile-detail-drawer');
    if (!drawerEl) return;

    const p = this.selectedProfileId
      ? this.profiles.find((item) => item.id === this.selectedProfileId)
      : null;

    if (!p) {
      drawerEl.classList.add('hidden');
      return;
    }

    drawerEl.classList.remove('hidden');
    const st = STATUS_META[p.status] || STATUS_META.waiting;
    const attrs = p.attributes || {};
    const ideal = p.ideal_type || {};
    const photos = p.photos || [];
    if (this.activePhotoIndex >= photos.length) {
      this.activePhotoIndex = 0;
    }
    const activePhotoUrl = photos[this.activePhotoIndex] || '';

    const topMatches = this.profiles
      .filter((cand) => cand.gender !== p.gender)
      .map((cand) => ({
        candidate: cand,
        match: calculateMutualMatch(p, cand)
      }))
      .sort((a, b) => b.match.mutualPercent - a.match.mutualPercent)
      .slice(0, 5);

    drawerEl.innerHTML = `
      <div class="h-full flex flex-col">
        <!-- 드로어 상단 헤더 -->
        <div class="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${st.badge}">
              <span class="w-1.5 h-1.5 rounded-full ${st.dot}"></span>${st.label}
            </span>
            <span class="text-xs text-zinc-400">${this._escape(p.relation || '')}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button data-edit-profile="${p.id}" class="px-2.5 py-1 rounded border border-zinc-200 text-xs font-medium hover:bg-zinc-50">수정/사진관리</button>
            <button data-delete-profile="${p.id}" class="px-2.5 py-1 rounded border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50">삭제</button>
            <button id="btn-close-drawer" class="p-1 text-zinc-400 hover:text-zinc-800 text-lg leading-none">×</button>
          </div>
        </div>

        <!-- 드로어 본문 -->
        <div class="p-5 overflow-y-auto flex-1 space-y-5">
          <!-- 다중 사진 갤러리 뷰어 (원본 비율 전체보기 + 클릭 시 전체화면 확대 모달) -->
          <div class="space-y-2">
            <div class="relative w-full h-72 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 group flex items-center justify-center">
              ${
                activePhotoUrl
                  ? `<img
                      src="${activePhotoUrl}"
                      data-open-photo-lightbox="true"
                      title="클릭하여 원본 Full 사진 크게 보기"
                      class="w-full h-full ${
                        this.drawerPhotoFitMode === 'contain' ? 'object-contain' : 'object-cover'
                      } cursor-zoom-in transition"
                    />`
                  : `<div class="w-full h-full flex items-center justify-center font-bold text-2xl ${
                      p.gender === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                    }">${this._escape(p.name.slice(0, 2))}</div>`
              }
              ${
                activePhotoUrl
                  ? `
                <!-- 좌측 상단: 원본 비율 / 꽉 채우기 토글 버튼 -->
                <button
                  type="button"
                  data-toggle-drawer-fit="true"
                  class="absolute top-2.5 left-2.5 px-2 py-1 rounded-md bg-black/65 hover:bg-black/85 text-white text-[11px] font-medium backdrop-blur-xs transition"
                >
                  ${this.drawerPhotoFitMode === 'contain' ? '↔ 꽉 채우기' : '↕ 원본 전체비율'}
                </button>
                <!-- 우측 상단: 전체화면 원본 크게 보기 버튼 -->
                <button
                  type="button"
                  data-open-photo-lightbox="true"
                  class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/65 hover:bg-black/85 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1 transition"
                >
                  <span>🔍 전체화면 원본 보기</span>
                </button>
              `
                  : ''
              }
              ${
                photos.length > 1
                  ? `
                <button data-drawer-photo-prev="true" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition text-base">‹</button>
                <button data-drawer-photo-next="true" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition text-base">›</button>
                <span class="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[11px] font-semibold">
                  ${this.activePhotoIndex + 1} / ${photos.length}
                </span>
              `
                  : ''
              }
            </div>

            <!-- 썸네일 스트립 -->
            ${
              photos.length > 1
                ? `
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                ${photos
                  .map(
                    (url, idx) => `
                  <img
                    src="${url}"
                    data-drawer-photo-idx="${idx}"
                    class="w-14 h-14 rounded-lg object-cover cursor-pointer border-2 transition shrink-0 ${
                      idx === this.activePhotoIndex
                        ? 'border-zinc-900 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }"
                  />
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </div>

          <!-- 이름 & 기본 프로필 요약 -->
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-zinc-900">${this._escape(p.name)}</h2>
              <span class="text-xs font-semibold px-2 py-0.5 rounded ${
                p.gender === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
              }">${p.gender === 'M' ? '남성' : '여성'} · ${p.birth_year}년생</span>
            </div>
            <p class="text-xs text-zinc-800 font-semibold mt-1">${this._escape(attrs.job_detail || attrs.job_category || '')}</p>
            <p class="text-xs text-zinc-500 mt-0.5">${p.height || '-'}cm · ${this._escape(attrs.body_type || '')} · ${this._escape(p.location || '')}</p>
            <p class="text-xs text-zinc-400 mt-1">연락처: ${this._escape(p.contact || '미기재')}</p>
          </div>

          <!-- 카톡 원문 메모 박스 -->
          ${
            p.raw_memo
              ? `<div class="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-zinc-800 whitespace-pre-line leading-relaxed">${this._escape(p.raw_memo)}</div>`
              : ''
          }

          <!-- 본인 세부 스펙 -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-zinc-900 uppercase tracking-wider">본인 상세 속성</h3>
            <div class="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs">
              <div><span class="text-zinc-400">학력:</span> <strong class="text-zinc-800">${this._escape(attrs.education || '-')}</strong></div>
              <div><span class="text-zinc-400">연봉:</span> <strong class="text-zinc-800">${this._escape(attrs.income_range || '-')}</strong></div>
              <div><span class="text-zinc-400">흡연:</span> <strong class="text-zinc-800">${this._escape(attrs.smoking || '-')}</strong></div>
              <div><span class="text-zinc-400">음주:</span> <strong class="text-zinc-800">${this._escape(attrs.drinking || '-')}</strong></div>
              <div><span class="text-zinc-400">종교:</span> <strong class="text-zinc-800">${this._escape(attrs.religion || '-')}</strong></div>
              <div><span class="text-zinc-400">MBTI:</span> <strong class="text-zinc-800">${this._escape(attrs.mbti || '-')}</strong></div>
              <div class="col-span-2"><span class="text-zinc-400">결혼관:</span> <strong class="text-zinc-800">${this._escape(attrs.marriage_intent || '-')}</strong></div>
            </div>
            <div class="flex flex-wrap gap-1 pt-1">
              ${[...(attrs.look_tags || []), ...(attrs.personality_tags || [])]
                .map((t) => `<span class="tag-chip">${this._escape(t)}</span>`)
                .join('')}
            </div>
          </div>

          <!-- 희망 이상형 조건 -->
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-zinc-900 uppercase tracking-wider">원하는 이상형 조건</h3>
            <div class="p-3 rounded-xl border border-zinc-200 space-y-1.5 text-xs">
              <div><span class="text-zinc-400">희망 나이/키:</span> <strong>${ideal.min_birth_year || ''}~${ideal.max_birth_year || ''}년생 / ${ideal.min_height || '무관'}cm 이상</strong></div>
              <div><span class="text-zinc-400">선호 직업군:</span> <strong>${this._escape((ideal.preferred_job_categories || []).join(', ') || '무관')}</strong></div>
              <div><span class="text-zinc-400">선호 스타일:</span> <strong>${this._escape((ideal.preferred_look_tags || []).join(' ') || '무관')}</strong></div>
              <div><span class="text-zinc-400">절대 불가:</span> <strong class="text-rose-600">${this._escape((ideal.deal_breakers || []).join(', ') || '없음')}</strong></div>
              ${ideal.ideal_memo ? `<div class="pt-1 text-zinc-600 border-t border-zinc-100 mt-1.5">${this._escape(ideal.ideal_memo)}</div>` : ''}
            </div>
          </div>

          <!-- 추천 매칭 이성 리스트 -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-zinc-900 uppercase tracking-wider">추천 매칭 이성 Top ${topMatches.length}</h3>
              <button data-quick-target="${p.id}" class="text-[11px] text-blue-600 hover:underline font-medium">전체 목록에서 비교 →</button>
            </div>
            ${topMatches
              .map(
                ({ candidate, match }) => `
              <div class="p-3 rounded-xl border border-zinc-200 hover:border-zinc-400 transition bg-white">
                <div class="flex items-center justify-between mb-1">
                  <div class="font-bold text-xs text-zinc-900">
                    ${this._escape(candidate.name)} (${candidate.birth_year}년 · ${candidate.height || '-'}cm · ${this._escape(candidate.attributes?.job_category || '')})
                  </div>
                  <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                    match.mutualPercent >= 85 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-800'
                  }">쌍방 ${match.mutualPercent}%</span>
                </div>
                <div class="text-[11px] text-emerald-700">✓ ${match.aToB.matchedReasons.slice(0, 2).join(', ') || '조건 부합'}</div>
                ${
                  match.aToB.missedReasons.length > 0
                    ? `<div class="text-[11px] text-amber-600">• ${match.aToB.missedReasons[0]}</div>`
                    : ''
                }
                <div class="mt-2 pt-2 border-t border-zinc-100 flex justify-end gap-2">
                  <button data-profile-card="${candidate.id}" class="text-[11px] text-zinc-600 hover:text-zinc-900">프로필 보기</button>
                  <button data-propose-match-a="${p.id}" data-propose-match-b="${candidate.id}" class="px-2 py-0.5 rounded bg-zinc-900 text-white text-[11px] font-medium hover:bg-zinc-700">매칭 기록에 추가</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 전체화면 원본 사진 뷰어 (Lightbox Modal) 렌더링
   */
  renderPhotoLightbox() {
    const modalEl = document.getElementById('photo-lightbox-modal');
    if (!modalEl) return;

    const p = this.selectedProfileId
      ? this.profiles.find((item) => item.id === this.selectedProfileId)
      : null;
    const photos = p?.photos || [];

    if (!this.isPhotoLightboxOpen || !p || photos.length === 0) {
      modalEl.classList.add('hidden');
      modalEl.innerHTML = '';
      return;
    }

    if (this.activePhotoIndex >= photos.length) {
      this.activePhotoIndex = 0;
    }
    const activeUrl = photos[this.activePhotoIndex];

    modalEl.classList.remove('hidden');
    modalEl.innerHTML = `
      <!-- 상단 바 -->
      <div class="w-full max-w-6xl flex items-center justify-between text-white z-10">
        <div class="flex items-center gap-3">
          <span class="text-sm font-bold">${this._escape(p.name)} (${p.birth_year}년생 · ${
      p.height || '-'
    }cm)</span>
          <span class="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold">
            ${this.activePhotoIndex + 1} / ${photos.length}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <a
            href="${activeUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium transition"
          >
            새 탭에서 원본 열기 ↗
          </a>
          <button
            type="button"
            id="btn-close-lightbox"
            class="px-3 py-1.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-bold transition"
          >
            닫기 (ESC) ×
          </button>
        </div>
      </div>

      <!-- 중앙 원본 비율 Full 이미지 영역 -->
      <div id="lightbox-backdrop-area" class="relative flex-1 w-full flex items-center justify-center my-3 min-h-0">
        ${
          photos.length > 1
            ? `<button
                type="button"
                data-drawer-photo-prev="true"
                class="absolute left-2 sm:left-6 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl flex items-center justify-center transition"
              >‹</button>`
            : ''
        }

        <img
          src="${activeUrl}"
          alt="${this._escape(p.name)}"
          class="max-h-[76vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-white/10 select-none"
        />

        ${
          photos.length > 1
            ? `<button
                type="button"
                data-drawer-photo-next="true"
                class="absolute right-2 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white text-2xl flex items-center justify-center transition"
              >›</button>`
            : ''
        }
      </div>

      <!-- 하단 썸네일 스트립 -->
      <div class="flex items-center justify-center gap-2.5 overflow-x-auto max-w-3xl py-1">
        ${photos
          .map(
            (url, idx) => `
          <img
            src="${url}"
            data-drawer-photo-idx="${idx}"
            class="w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition shrink-0 ${
              idx === this.activePhotoIndex
                ? 'border-white scale-105 opacity-100'
                : 'border-transparent opacity-50 hover:opacity-90'
            }"
          />
        `
          )
          .join('')}
      </div>
    `;
  }

  _bindGlobalEvents() {
    // 키보드 단축키 (전체화면 사진 뷰어에서 좌/우 방향키 및 ESC 닫기)
    window.addEventListener('keydown', (e) => {
      if (!this.isPhotoLightboxOpen) return;
      if (e.key === 'Escape') {
        this.isPhotoLightboxOpen = false;
        this.renderPhotoLightbox();
      } else if (e.key === 'ArrowLeft') {
        const p = this.profiles.find((item) => item.id === this.selectedProfileId);
        const len = p?.photos?.length || 1;
        this.activePhotoIndex = (this.activePhotoIndex - 1 + len) % len;
        this.renderDetailDrawer();
        this.renderPhotoLightbox();
      } else if (e.key === 'ArrowRight') {
        const p = this.profiles.find((item) => item.id === this.selectedProfileId);
        const len = p?.photos?.length || 1;
        this.activePhotoIndex = (this.activePhotoIndex + 1) % len;
        this.renderDetailDrawer();
        this.renderPhotoLightbox();
      }
    });

    document.body.addEventListener('click', async (e) => {
      // 0. 전체화면 원본 사진 뷰어 열기 / 닫기 / 비율 토글
      const graphPhotoEl = e.target.closest('[data-graph-photo-idx]');
      if (graphPhotoEl) {
        if (this.graphSelectedProfile) {
          this.selectedProfileId = this.graphSelectedProfile.id;
        }
        this.activePhotoIndex = Number(graphPhotoEl.getAttribute('data-graph-photo-idx'));
        this.isPhotoLightboxOpen = true;
        this.renderPhotoLightbox();
        return;
      }
      if (e.target.closest('[data-open-photo-lightbox]')) {
        if (!this.selectedProfileId && this.graphSelectedProfile) {
          this.selectedProfileId = this.graphSelectedProfile.id;
        }
        this.isPhotoLightboxOpen = true;
        this.renderPhotoLightbox();
        return;
      }
      if (
        e.target.closest('#btn-close-lightbox') ||
        e.target.id === 'photo-lightbox-modal' ||
        e.target.id === 'lightbox-backdrop-area'
      ) {
        this.isPhotoLightboxOpen = false;
        this.renderPhotoLightbox();
        return;
      }
      if (e.target.closest('[data-toggle-drawer-fit]')) {
        this.drawerPhotoFitMode = this.drawerPhotoFitMode === 'contain' ? 'cover' : 'contain';
        this.renderDetailDrawer();
        return;
      }

      // 1. 사이드바 메뉴 전환
      const navItem = e.target.closest('[data-section]');
      if (navItem) {
        const sec = navItem.getAttribute('data-section');
        if (sec === 'register' && this.activeSection !== 'register') {
          this.editingProfileId = null;
          this.draftPhotos = [];
        }
        this.activeSection = sec;
        this.renderAll();
        return;
      }

      // 2. 카드/테이블 뷰 모드 전환
      const viewModeBtn = e.target.closest('[data-view-mode]');
      if (viewModeBtn) {
        this.directoryViewMode = viewModeBtn.getAttribute('data-view-mode');
        this.renderHeader();
        this.renderWorkspace();
        return;
      }

      // 3. 성별 필터 버튼
      const genderBtn = e.target.closest('[data-filter-gender]');
      if (genderBtn) {
        this.filters.gender = genderBtn.getAttribute('data-filter-gender');
        this.renderWorkspace();
        return;
      }

      // 4. 사이드바 빠른 성별/대기중 필터
      const quickGender = e.target.closest('[data-quick-gender]');
      if (quickGender) {
        this.activeSection = 'directory';
        this.filters.gender = quickGender.getAttribute('data-quick-gender');
        this.filters.matchTargetId = '';
        this.renderAll();
        return;
      }
      const quickWaiting = e.target.closest('[data-quick-waiting]');
      if (quickWaiting) {
        this.activeSection = 'directory';
        this.filters.status = 'waiting';
        this.filters.gender = 'ALL';
        this.renderAll();
        return;
      }

      // 5. 인기 태그 필터 칩
      const tagChip = e.target.closest('[data-filter-tag]');
      if (tagChip) {
        const tag = tagChip.getAttribute('data-filter-tag');
        this.filters.selectedTag = this.filters.selectedTag === tag ? 'ALL' : tag;
        this.renderWorkspace();
        return;
      }

      // 6. 특정 매물 기준 궁합찾기 버튼
      const quickTarget = e.target.closest('[data-quick-target]');
      if (quickTarget) {
        e.stopPropagation();
        this.activeSection = 'directory';
        this.filters.matchTargetId = quickTarget.getAttribute('data-quick-target');
        this.filters.gender = 'ALL';
        this.renderAll();
        return;
      }

      if (e.target.closest('#btn-clear-target')) {
        this.filters.matchTargetId = '';
        this.renderWorkspace();
        return;
      }

      if (e.target.closest('#btn-reset-filters') || e.target.closest('#btn-empty-reset')) {
        this.filters = {
          search: '',
          gender: 'ALL',
          status: 'ALL',
          jobCategory: 'ALL',
          smoking: 'ALL',
          minBirthYear: '',
          maxBirthYear: '',
          selectedTag: 'ALL',
          matchTargetId: ''
        };
        this.renderWorkspace();
        return;
      }

      // 7. 프로필 카드/행 클릭 -> 우측 상세 드로어 열기
      const cardEl = e.target.closest('[data-profile-card]');
      if (cardEl) {
        this.selectedProfileId = cardEl.getAttribute('data-profile-card');
        this.activePhotoIndex = 0;
        this.renderWorkspace();
        this.renderDetailDrawer();
        return;
      }

      // 드로어 및 라이트박스 내 다중 사진 전환 이벤트
      const photoThumb = e.target.closest('[data-drawer-photo-idx]');
      if (photoThumb) {
        this.activePhotoIndex = Number(photoThumb.getAttribute('data-drawer-photo-idx'));
        this.renderDetailDrawer();
        if (this.isPhotoLightboxOpen) this.renderPhotoLightbox();
        return;
      }
      if (e.target.closest('[data-drawer-photo-prev]')) {
        const p = this.profiles.find((item) => item.id === this.selectedProfileId);
        const len = p?.photos?.length || 1;
        this.activePhotoIndex = (this.activePhotoIndex - 1 + len) % len;
        this.renderDetailDrawer();
        if (this.isPhotoLightboxOpen) this.renderPhotoLightbox();
        return;
      }
      if (e.target.closest('[data-drawer-photo-next]')) {
        const p = this.profiles.find((item) => item.id === this.selectedProfileId);
        const len = p?.photos?.length || 1;
        this.activePhotoIndex = (this.activePhotoIndex + 1) % len;
        this.renderDetailDrawer();
        if (this.isPhotoLightboxOpen) this.renderPhotoLightbox();
        return;
      }

      if (e.target.closest('#btn-close-drawer')) {
        this.selectedProfileId = null;
        this.isPhotoLightboxOpen = false;
        this.renderWorkspace();
        this.renderDetailDrawer();
        this.renderPhotoLightbox();
        return;
      }

      // 8. 매물 등록 화면 이동
      if (e.target.closest('#btn-go-register')) {
        this.editingProfileId = null;
        this.draftPhotos = [];
        this.activeSection = 'register';
        this.renderAll();
        return;
      }

      if (e.target.closest('#btn-back-directory') || e.target.closest('#btn-cancel-register')) {
        this.editingProfileId = null;
        this.draftPhotos = [];
        this.activeSection = 'directory';
        this.renderAll();
        return;
      }

      // 9. 등록 폼 내 사진 URL 추가 / 대표 지정 / 개별 사진 삭제
      if (e.target.closest('#btn-add-photo-url')) {
        const input = document.getElementById('input-photo-url');
        const url = (input?.value || '').trim();
        if (url) {
          this.draftPhotos.push(url);
          input.value = '';
          this._renderDraftPhotosPreview();
        }
        return;
      }

      const makePrimBtn = e.target.closest('[data-make-primary-photo]');
      if (makePrimBtn) {
        const idx = Number(makePrimBtn.getAttribute('data-make-primary-photo'));
        if (idx > 0 && idx < this.draftPhotos.length) {
          const [picked] = this.draftPhotos.splice(idx, 1);
          this.draftPhotos.unshift(picked);
          this._renderDraftPhotosPreview();
        }
        return;
      }

      const remDraftPhotoBtn = e.target.closest('[data-remove-draft-photo]');
      if (remDraftPhotoBtn) {
        const idx = Number(remDraftPhotoBtn.getAttribute('data-remove-draft-photo'));
        this.draftPhotos.splice(idx, 1);
        this._renderDraftPhotosPreview();
        return;
      }

      // 등록 폼 내 다중 태그 토글
      const formMultiChip = e.target.closest('[data-form-multi]');
      if (formMultiChip) {
        formMultiChip.classList.toggle('selected');
        return;
      }

      // 10. 프로필 수정 / 삭제
      const editBtn = e.target.closest('[data-edit-profile]');
      if (editBtn) {
        this.editingProfileId = editBtn.getAttribute('data-edit-profile');
        const target = this.profiles.find((p) => p.id === this.editingProfileId);
        this.draftPhotos = [...(target?.photos || [])];
        this.selectedProfileId = null;
        this.activeSection = 'register';
        this.renderAll();
        return;
      }

      const delBtn = e.target.closest('[data-delete-profile]');
      if (delBtn) {
        const id = delBtn.getAttribute('data-delete-profile');
        if (confirm('정말 이 매물 프로필을 삭제하시겠습니까?')) {
          await this._deleteProfile(id);
        }
        return;
      }

      // 11. 드로어에서 즉시 매칭 기록 추가
      const proposeBtn = e.target.closest('[data-propose-match-a]');
      if (proposeBtn) {
        const aId = proposeBtn.getAttribute('data-propose-match-a');
        const bId = proposeBtn.getAttribute('data-propose-match-b');
        await this._createMatchRecord(aId, bId, 'proposed', '이상형 추천을 통해 매칭 제안');
        this.activeSection = 'matches';
        this.renderAll();
        return;
      }

      // 12. 매칭 기록 삭제
      const delMatchBtn = e.target.closest('[data-delete-match]');
      if (delMatchBtn) {
        const mId = delMatchBtn.getAttribute('data-delete-match');
        this.matches = this.matches.filter((m) => m.id !== mId);
        this._saveLocal();
        const supabase = getSupabaseClient();
        if (supabase && this.user) {
          await supabase.from('matches').delete().eq('id', mId);
        }
        this.renderAll();
        return;
      }

      // 13. 속성 옵션 삭제 및 40명 초기 복원
      if (e.target.closest('#btn-reset-sample-40')) {
        if (confirm('남성 20명, 여성 20명 초기 샘플 데이터로 복원하시겠습니까?')) {
          this.profiles = JSON.parse(JSON.stringify(SAMPLE_PROFILES));
          this.matches = JSON.parse(JSON.stringify(SAMPLE_MATCHES));
          this._saveLocal();
          this.activeSection = 'directory';
          this.renderAll();
        }
        return;
      }

      const remOptBtn = e.target.closest('[data-remove-opt-key]');
      if (remOptBtn) {
        const key = remOptBtn.getAttribute('data-remove-opt-key');
        const val = remOptBtn.getAttribute('data-remove-opt-val');
        const def = this.attrDefs.find((d) => d.key === key);
        if (def) {
          def.options = def.options.filter((o) => o !== val);
          this._saveLocal();
          const supabase = getSupabaseClient();
          if (supabase && this.user) {
            await supabase
              .from('attribute_definitions')
              .update({ options: def.options })
              .eq('key', key);
          }
          this.renderWorkspace();
        }
        return;
      }

      // 14. 그래프 뷰에서 노드 배치 재정렬 / 화면 맞춤 / 상세 열기
      if (e.target.closest('#btn-graph-relayout')) {
        if (this.graphRenderer) {
          this.graphRenderer.setData(
            this.profiles,
            this.graphMinScore,
            this.graphSelectedProfile?.id || null,
            true
          );
        }
        return;
      }

      if (e.target.closest('#btn-graph-fit')) {
        if (this.graphRenderer) {
          this.graphRenderer.fitToScreen();
          this.graphRenderer.draw();
        }
        return;
      }

      const graphFocus = e.target.closest('[data-graph-focus]');
      if (graphFocus) {
        const id = graphFocus.getAttribute('data-graph-focus');
        this.selectedProfileId = id;
        this.activePhotoIndex = 0;
        this.renderDetailDrawer();
        return;
      }
      const graphOpenDetail = e.target.closest('#btn-graph-open-detail');
      if (graphOpenDetail) {
        this.selectedProfileId = graphOpenDetail.getAttribute('data-id');
        this.activePhotoIndex = 0;
        this.renderDetailDrawer();
        return;
      }

      // 15. Supabase 설정 모달 열기/닫기
      if (e.target.closest('#btn-open-supabase-modal')) {
        this._openSupabaseModal();
        return;
      }
      if (e.target.closest('#btn-close-supabase-modal')) {
        document.getElementById('supabase-modal')?.classList.add('hidden');
        return;
      }
    });

    // 필터 및 그래프 기준 슬라이더 입력 이벤트
    document.body.addEventListener('input', (e) => {
      if (e.target.id === 'filter-search') {
        this.filters.search = e.target.value;
        this._renderDirectoryContent(document.getElementById('workspace-content'));
      } else if (e.target.id === 'filter-min-year') {
        this.filters.minBirthYear = e.target.value;
        this._renderDirectoryContent(document.getElementById('workspace-content'));
      } else if (e.target.id === 'filter-max-year') {
        this.filters.maxBirthYear = e.target.value;
        this._renderDirectoryContent(document.getElementById('workspace-content'));
      } else if (e.target.id === 'graph-threshold-slider') {
        this.graphMinScore = Number(e.target.value);
        const labelEl = document.getElementById('graph-threshold-label');
        if (labelEl) labelEl.textContent = `${this.graphMinScore}% 이상`;
        // 연결선 표시 기준을 조정하면 전체적으로 노드 비겹침 배치 재조정!
        if (this.graphRenderer) {
          this.graphRenderer.setData(
            this.profiles,
            this.graphMinScore,
            this.graphSelectedProfile?.id || null,
            true
          );
        }
      }
    });

    document.body.addEventListener('change', async (e) => {
      if (e.target.id === 'filter-status') {
        this.filters.status = e.target.value;
        this.renderWorkspace();
      } else if (e.target.id === 'filter-job') {
        this.filters.jobCategory = e.target.value;
        this.renderWorkspace();
      } else if (e.target.id === 'filter-smoking') {
        this.filters.smoking = e.target.value;
        this.renderWorkspace();
      } else if (e.target.id === 'filter-match-target') {
        this.filters.matchTargetId = e.target.value;
        this.renderWorkspace();
      } else if (e.target.id === 'form-photo-files') {
        // 파일 선택 즉시 여러 장 업로드하여 draftPhotos에 추가 & 미리보기 갱신
        const files = e.target.files;
        if (files && files.length > 0) {
          for (const file of files) {
            const url = await uploadProfilePhoto(file);
            this.draftPhotos.push(url);
          }
          e.target.value = '';
          this._renderDraftPhotosPreview();
        }
      }
    });

    // 폼 제출 이벤트
    document.body.addEventListener('submit', async (e) => {
      if (e.target.id === 'profile-register-form') {
        e.preventDefault();
        await this._handleProfileFormSubmit(e.target);
      } else if (e.target.id === 'new-match-form') {
        e.preventDefault();
        const fd = new FormData(e.target);
        await this._createMatchRecord(
          fd.get('profile_a_id'),
          fd.get('profile_b_id'),
          fd.get('match_status'),
          fd.get('notes')
        );
        this.renderAll();
      } else if (e.target.hasAttribute('data-add-opt-form')) {
        e.preventDefault();
        const key = e.target.getAttribute('data-add-opt-form');
        const fd = new FormData(e.target);
        const newOpt = (fd.get('new_opt') || '').trim();
        if (!newOpt) return;
        const def = this.attrDefs.find((d) => d.key === key);
        if (def && !def.options.includes(newOpt)) {
          def.options.push(newOpt);
          this._saveLocal();
          const supabase = getSupabaseClient();
          if (supabase && this.user) {
            await supabase
              .from('attribute_definitions')
              .update({ options: def.options })
              .eq('key', key);
          }
          this.renderWorkspace();
        }
      } else if (e.target.id === 'supabase-config-form') {
        e.preventDefault();
        await this._handleSupabaseAuthSubmit(e.target);
      }
    });
  }

  async _handleProfileFormSubmit(form) {
    const fd = new FormData(form);
    const getSelectedMulti = (group) =>
      Array.from(form.querySelectorAll(`[data-form-multi="${group}"].selected`)).map((el) =>
        el.getAttribute('data-val')
      );

    // 혹시 URL 입력창에 입력만 해두고 [+ URL 추가]를 안 누른 URL도 함께 반영
    const pendingUrlInput = document.getElementById('input-photo-url');
    const pendingUrl = (pendingUrlInput?.value || '').trim();
    if (pendingUrl && !this.draftPhotos.includes(pendingUrl)) {
      this.draftPhotos.push(pendingUrl);
    }

    const payload = {
      name: fd.get('name').trim(),
      gender: fd.get('gender'),
      status: fd.get('status'),
      birth_year: Number(fd.get('birth_year')),
      height: fd.get('height') ? Number(fd.get('height')) : null,
      location: fd.get('location').trim(),
      contact: fd.get('contact').trim(),
      relation: fd.get('relation').trim(),
      photos: [...this.draftPhotos],
      attributes: {
        job_category: fd.get('job_category'),
        job_detail: fd.get('job_detail').trim(),
        education: fd.get('education'),
        income_range: fd.get('income_range'),
        body_type: fd.get('body_type'),
        smoking: fd.get('smoking'),
        drinking: fd.get('drinking'),
        religion: fd.get('religion'),
        mbti: fd.get('mbti'),
        marriage_intent: fd.get('marriage_intent'),
        look_tags: getSelectedMulti('self_look_tags'),
        personality_tags: getSelectedMulti('self_personality_tags')
      },
      ideal_type: {
        min_birth_year: Number(fd.get('ideal_min_birth_year')),
        max_birth_year: Number(fd.get('ideal_max_birth_year')),
        min_height: Number(fd.get('ideal_min_height')),
        max_height: Number(fd.get('ideal_max_height')),
        preferred_job_categories: getSelectedMulti('ideal_jobs'),
        preferred_look_tags: getSelectedMulti('ideal_looks'),
        deal_breakers: getSelectedMulti('ideal_breakers'),
        ideal_memo: fd.get('ideal_memo').trim()
      },
      raw_memo: fd.get('raw_memo').trim()
    };

    const supabase = getSupabaseClient();
    if (supabase && this.user) {
      if (this.editingProfileId) {
        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', this.editingProfileId)
          .select()
          .single();
        if (!error && data) {
          this.profiles = this.profiles.map((p) => (p.id === data.id ? data : p));
        }
      } else {
        const { data, error } = await supabase.from('profiles').insert(payload).select().single();
        if (!error && data) {
          this.profiles.unshift(data);
        }
      }
    } else {
      if (this.editingProfileId) {
        this.profiles = this.profiles.map((p) =>
          p.id === this.editingProfileId ? { ...p, ...payload } : p
        );
      } else {
        this.profiles.unshift({
          id: `local-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        });
      }
      this._saveLocal();
    }

    this.editingProfileId = null;
    this.draftPhotos = [];
    this.activeSection = 'directory';
    this.renderAll();
  }

  async _deleteProfile(id) {
    const supabase = getSupabaseClient();
    if (supabase && this.user) {
      await supabase.from('profiles').delete().eq('id', id);
    }
    this.profiles = this.profiles.filter((p) => p.id !== id);
    this.selectedProfileId = null;
    this._saveLocal();
    this.renderAll();
  }

  async _createMatchRecord(aId, bId, status, notes) {
    const record = {
      profile_a_id: aId,
      profile_b_id: bId,
      match_status: status,
      notes,
      matched_at: new Date().toISOString().slice(0, 10)
    };
    const supabase = getSupabaseClient();
    if (supabase && this.user) {
      const { data, error } = await supabase.from('matches').insert(record).select().single();
      if (!error && data) {
        this.matches.unshift(data);
        return;
      }
    }
    this.matches.unshift({ id: `match-${Date.now()}`, ...record });
    this._saveLocal();
  }

  _openSupabaseModal() {
    const modal = document.getElementById('supabase-modal');
    if (!modal) return;
    const cfg = getSupabaseConfig();
    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="bg-white rounded-xl border border-zinc-200 shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-zinc-900">Supabase DB 연결 및 관리자 로그인</h3>
          <button id="btn-close-supabase-modal" class="text-zinc-400 hover:text-zinc-800 text-lg leading-none">×</button>
        </div>
        <form id="supabase-config-form" class="space-y-3.5">
          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1">Supabase Project URL</label>
            <input name="url" required value="${this._escape(cfg.url)}" placeholder="https://xxxx.supabase.co" class="sq-input w-full px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1">Supabase Anon Public Key</label>
            <input name="anonKey" required value="${this._escape(cfg.anonKey)}" placeholder="eyJhbGciOiJIUzI1NiIsInR5..." class="sq-input w-full px-3 py-2" />
          </div>
          <div class="pt-2 border-t border-zinc-100">
            <label class="block text-xs font-medium text-zinc-700 mb-1">관리자 이메일</label>
            <input name="email" type="email" placeholder="admin@example.com" class="sq-input w-full px-3 py-2" />
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-700 mb-1">관리자 비밀번호</label>
            <input name="password" type="password" placeholder="••••••••" class="sq-input w-full px-3 py-2" />
          </div>
          <div id="supabase-auth-msg" class="text-xs text-rose-600"></div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" id="btn-close-supabase-modal" class="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200">닫기</button>
            <button type="submit" class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800">연결 및 로그인</button>
          </div>
        </form>
      </div>
    `;
  }

  async _handleSupabaseAuthSubmit(form) {
    const fd = new FormData(form);
    const url = fd.get('url');
    const anonKey = fd.get('anonKey');
    const email = (fd.get('email') || '').trim();
    const password = fd.get('password') || '';
    const msgEl = document.getElementById('supabase-auth-msg');

    const supabase = saveSupabaseConfig(url, anonKey);
    if (!supabase) {
      if (msgEl) msgEl.textContent = '유효한 URL과 Anon Key를 입력해 주세요.';
      return;
    }

    if (email && password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (msgEl) msgEl.textContent = `로그인 실패: ${error.message}`;
        return;
      }
    }

    document.getElementById('supabase-modal')?.classList.add('hidden');
    await this.syncWithSupabase();
    this.renderAll();
  }

  _escape(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  _getIconSvg(name) {
    const icons = {
      users: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      network: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m10.5 7.5-4 9"/><path d="m13.5 7.5 4 9"/><path d="M8 19h8"/></svg>`,
      'user-plus': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
      'heart-handshake': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
      sliders: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>`
    };
    return icons[name] || '';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.blueMatchApp = new BlueMatchApp();
});
