// [매너노트 화면 전환 및 바텀시트 제어 로직]
let currentCategory = null;
let currentSituation = null;

// 홈 -> 특정 카테고리 진입
function openCategory(catName) {
  currentCategory = catName;
  document.getElementById("homeView").style.display = "none";
  document.getElementById("detailView").style.display = "block";
  document.getElementById("backBtn").style.display = "block";
  document.getElementById("pageTitle").innerText = catName;

  // 카테고리 내 첫 번째 상황을 기본 활성화
  const situations = Object.keys(mannerDB[catName] || {});
  currentSituation = situations[0] || null;

  renderCategoryView();
}

// 홈으로 돌아가기
function goHome() {
  currentCategory = null;
  currentSituation = null;
  document.getElementById("homeView").style.display = "block";
  document.getElementById("detailView").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("pageTitle").innerText = "매너노트";
}

// 2단계 화면 렌더링 (상황 칩 + 키워드 버튼)
function renderCategoryView() {
  const catData = mannerDB[currentCategory] || {};
  const situations = Object.keys(catData);
  const chipsContainer = document.getElementById("situationChips");
  const keywordGrid = document.getElementById("keywordGrid");

  // 상황 칩 렌더링
  chipsContainer.innerHTML = situations.map(sit => `
    <button class="sit-chip ${sit === currentSituation ? 'active' : ''}" onclick="selectSituation('${sit}')">
      ${sit}
    </button>
  `).join('');

  // 선택된 상황의 키워드 목록 렌더링
  const keywords = catData[currentSituation] || {};
  const keywordKeys = Object.keys(keywords);

  keywordGrid.innerHTML = keywordKeys.map(kKey => {
    const item = keywords[kKey];
    return `
      <div class="key-btn" onclick="openSheet('${kKey}')">
        <span class="key-badge">${item.badge}</span>
        <h4 class="key-title">${kKey}</h4>
        <div class="key-hint">터치하여 확인 →</div>
      </div>
    `;
  }).join('');
}

// 다른 세부 상황 칩 선택 (예: 장례식 -> 결혼식)
function selectSituation(sitName) {
  currentSituation = sitName;
  renderCategoryView();
}

// 3단계: 바텀시트 팝업 열기
function openSheet(keywordKey) {
  const data = mannerDB[currentCategory][currentSituation][keywordKey];
  if (!data) return;

  document.getElementById("sheetBadge").innerText = `${currentSituation} · ${data.badge}`;
  document.getElementById("sheetTitle").innerText = data.title;
  document.getElementById("sheetCore").innerText = data.core;
  document.getElementById("sheetWhy").innerText = data.why;

  document.getElementById("sheetOverlay").classList.add("open");
  document.getElementById("bottomSheet").classList.add("open");
}

// 바텀시트 팝업 닫기
function closeSheet() {
  document.getElementById("sheetOverlay").classList.remove("open");
  document.getElementById("bottomSheet").classList.remove("open");
}
