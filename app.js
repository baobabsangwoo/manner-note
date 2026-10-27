// [매너노트 v0 인터랙션 컨트롤러]
let state = {
  nav: 'home',
  recent: [...INITIAL_RECENT],
  searchOpen: false,
  query: '',
  sheetOpen: false,
  selectedCategory: null,
  activeTab: 'clothes'
};

const NAV_ITEMS = [
  { key: 'home', label: '홈', svg: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' },
  { key: 'cards', label: '카드', svg: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>' },
  { key: 'saved', label: '저장', svg: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>' },
  { key: 'history', label: '기록', svg: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  { key: 'profile', label: '내 정보', svg: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>' }
];

const TAB_LABEL_MAP = Object.fromEntries(TABS.map(t => [t.key, t.label]));

// 초기 렌더링
function initApp() {
  renderRecentChips();
  renderCategories();
  renderBottomNav();

  const searchInput = document.getElementById('searchInput');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const searchForm = document.getElementById('searchForm');

  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    clearInputBtn.style.display = state.query.trim().length > 0 ? 'flex' : 'none';
    renderSearchOverlayBody();
  });

  clearInputBtn.addEventListener('click', () => {
    state.query = '';
    searchInput.value = '';
    clearInputBtn.style.display = 'none';
    searchInput.focus();
    renderSearchOverlayBody();
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.query.trim()) {
      addRecent(state.query.trim());
      renderSearchOverlayBody();
    }
  });
}

// 1. 최근 검색 칩 렌더링
function renderRecentChips() {
  const section = document.getElementById('recentSection');
  const list = document.getElementById('recentChipsList');

  if (state.recent.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'flex';

  list.innerHTML = state.recent.map(term => `
    <li>
      <div class="recent-pill">
        <button type="button" class="recent-pill-text" onclick="openSearch('${term}')">${term}</button>
        <button type="button" class="recent-pill-del" onclick="removeRecent('${term}')" aria-label="${term} 삭제">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
    </li>
  `).join('');
}

function addRecent(term) {
  const tag = term.startsWith('#') ? term : `#${term}`;
  state.recent = [tag, ...state.recent.filter(t => t !== tag)].slice(0, 8);
  renderRecentChips();
}

function removeRecent(term) {
  state.recent = state.recent.filter(t => t !== term);
  renderRecentChips();
  if (state.searchOpen) renderSearchOverlayBody();
}

function clearRecent() {
  state.recent = [];
  renderRecentChips();
}

// 2. 2열 카테고리 카드 그리드 렌더링
function renderCategories() {
  document.getElementById('categoryCount').innerText = `${CATEGORIES.length}개 카테고리`;
  const grid = document.getElementById('categoryGrid');

  grid.innerHTML = CATEGORIES.map(cat => `
    <button type="button" class="category-card" onclick="openSheet('${cat.id}', 'clothes')">
      <div class="category-card-top">
        <h3 class="category-card-title">${cat.title}</h3>
        <svg class="category-card-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
      <p class="category-card-subtitle">${cat.subtitle}</p>
      <div class="category-card-illust" style="background-color: ${cat.tint};">
        ${cat.svg}
      </div>
    </button>
  `).join('');
}

// 3. 하단 네비게이션 렌더링
function renderBottomNav() {
  const list = document.getElementById('bottomNavList');
  list.innerHTML = NAV_ITEMS.map(item => {
    const isActive = state.nav === item.key;
    return `
      <li>
        <button type="button" class="nav-item-btn ${isActive ? 'active' : ''}" onclick="setNav('${item.key}')" aria-label="${item.label}">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isActive ? 2.2 : 1.7}" stroke-linecap="round" stroke-linejoin="round">
            ${item.svg}
          </svg>
        </button>
      </li>
    `;
  }).join('');
}

function setNav(key) {
  state.nav = key;
  renderBottomNav();
  if (key === 'home') {
    closeSearch();
    closeSheet();
  }
}

// 4. 검색 오버레이 열기/닫기 및 실시간 검색
function openSearch(initialTerm = '') {
  const clean = initialTerm ? initialTerm.replace(/^#/, '') : '';
  state.query = clean;
  state.searchOpen = true;

  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearInputBtn');
  input.value = clean;
  clearBtn.style.display = clean.length > 0 ? 'flex' : 'none';

  const overlay = document.getElementById('searchOverlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');

  renderSearchOverlayBody();
  setTimeout(() => input.focus(), 120);
}

function closeSearch() {
  state.searchOpen = false;
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

function setSearchQuery(q) {
  const clean = q.replace(/^#/, '');
  state.query = clean;
  const input = document.getElementById('searchInput');
  input.value = clean;
  document.getElementById('clearInputBtn').style.display = clean.length > 0 ? 'flex' : 'none';
  renderSearchOverlayBody();
}

function searchTips(query) {
  const kw = query.trim().toLowerCase();
  if (!kw) return [];
  const results = [];
  CATEGORIES.forEach(cat => {
    TABS.forEach(({ key }) => {
      (cat.tips[key] || []).forEach(tip => {
        if (
          tip.title.toLowerCase().includes(kw) ||
          tip.body.toLowerCase().includes(kw) ||
          cat.title.toLowerCase().includes(kw) ||
          cat.subtitle.toLowerCase().includes(kw)
        ) {
          results.push({ category: cat, tab: key, tip });
        }
      });
    });
  });
  return results;
}

function renderSearchOverlayBody() {
  const container = document.getElementById('searchBody');
  const hasQuery = state.query.trim().length > 0;

  if (!hasQuery) {
    const recentHtml = state.recent.length > 0 ? `
      <section style="margin-bottom: 28px;">
        <h2 class="section-sub-label" style="margin-bottom: 4px;">최근 검색</h2>
        <ul>
          ${state.recent.map(term => `
            <li class="recent-vertical-item">
              <button type="button" class="recent-vertical-btn" onclick="setSearchQuery('${term}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${term}
              </button>
              <button type="button" class="recent-pill-del" onclick="removeRecent('${term}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </li>
          `).join('')}
        </ul>
      </section>
    ` : '';

    const popularHtml = `
      <section>
        <h2 class="section-sub-label">많이 찾는 매너</h2>
        <ol class="popular-grid">
          ${POPULAR_SEARCHES.map((term, i) => `
            <li>
              <button type="button" class="popular-btn" onclick="setSearchQuery('${term}')">
                <span class="popular-rank ${i < 3 ? 'top' : ''}">${i + 1}</span>
                <span class="popular-term">${term}</span>
                ${i < 3 ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3182f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>' : ''}
              </button>
            </li>
          `).join('')}
        </ol>
      </section>
    `;

    container.innerHTML = recentHtml + popularHtml;
    return;
  }

  const results = searchTips(state.query);
  if (results.length === 0) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; padding-top:80px; text-align:center;">
        <div style="display:flex; width:56px; height:56px; align-items:center; justify-content:center; border-radius:9999px; background:var(--muted);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667085" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <p style="margin-top:16px; font-size:16px; font-weight:600;">검색 결과가 없어요</p>
        <p style="margin-top:4px; font-size:14px; color:var(--muted-foreground);">다른 상황이나 키워드로 찾아보세요</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <section>
      <h2 class="section-sub-label">검색 결과 <span style="color:var(--foreground);">${results.length}</span></h2>
      <ul class="results-card-list">
        ${results.map(r => `
          <li>
            <button type="button" class="result-row-btn" onclick="selectSearchResult('${r.category.id}', '${r.tab}', '${r.tip.title}')">
              <div class="result-thumb" style="background-color: ${r.category.tint};">${r.category.svg}</div>
              <div style="flex:1; min-width:0;">
                <p style="font-size:15px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.tip.title}</p>
                <p style="font-size:13px; color:var(--muted-foreground);">${r.category.title} · ${TAB_LABEL_MAP[r.tab]}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function selectSearchResult(catId, tabKey, tipTitle) {
  addRecent(tipTitle);
  openSheet(catId, tabKey);
}

// 5. 바텀시트 (CategorySheet) 열기/닫기/탭 전환
function openSheet(catId, initialTab = 'clothes') {
  const category = CATEGORIES.find(c => c.id === catId);
  if (!category) return;

  state.selectedCategory = category;
  state.activeTab = initialTab;
  state.sheetOpen = true;

  renderSheetContent();

  const container = document.getElementById('sheetContainer');
  container.classList.add('open');
  container.setAttribute('aria-hidden', 'false');
}

function closeSheet() {
  state.sheetOpen = false;
  const container = document.getElementById('sheetContainer');
  container.classList.remove('open');
  container.setAttribute('aria-hidden', 'true');
}

function changeSheetTab(tabKey) {
  state.activeTab = tabKey;
  renderSheetContent();
}

function renderSheetContent() {
  const cat = state.selectedCategory;
  if (!cat) return;

  const iconBox = document.getElementById('sheetIconBox');
  iconBox.style.backgroundColor = cat.tint;
  iconBox.innerHTML = cat.svg;

  document.getElementById('sheetTitle').innerText = cat.title;
  document.getElementById('sheetSubtitle').innerText = cat.subtitle;

  document.getElementById('sheetTabs').innerHTML = TABS.map(({ key, label }) => `
    <button
      type="button"
      role="tab"
      class="sheet-tab-btn ${state.activeTab === key ? 'active' : ''}"
      onclick="changeSheetTab('${key}')"
    >
      ${label}
    </button>
  `).join('');

  const tips = cat.tips[state.activeTab] || [];
  document.getElementById('sheetPanel').innerHTML = `
    <p class="sheet-summary-box">
      <span class="summary-dot"></span>${cat.summary}
    </p>
    <ul class="tip-list">
      ${tips.map((tip, idx) => `
        <li class="tip-card">
          <div class="tip-card-head">
            ${state.activeTab === 'greeting'
              ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3182f6" stroke-width="2.4"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`
              : `<span class="tip-num-badge">${idx + 1}</span>`
            }
            <h3 class="tip-title">${tip.title}</h3>
          </div>
          <p class="tip-body">${tip.body}</p>
        </li>
      `).join('')}
    </ul>
  `;
}

document.addEventListener('DOMContentLoaded', initApp);
