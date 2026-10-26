// [동작 제어]: 화면 전환, 탭 클릭, 실시간 검색을 담당합니다.
let activeCategory = null;
let activeSubIndex = 0;

function openCategory(catName) {
  activeCategory = catName;
  activeSubIndex = 0;
  document.getElementById("homeView").style.display = "none";
  document.getElementById("detailView").style.display = "block";
  document.getElementById("backBtn").style.display = "inline-block";
  document.getElementById("headerTitle").innerText = catName;
  renderDetail();
}

function goToHome() {
  activeCategory = null;
  document.getElementById("homeView").style.display = "block";
  document.getElementById("detailView").style.display = "none";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("headerTitle").innerText = "매너노트";
  document.getElementById("searchInput").value = "";
}

function renderDetail() {
  const dataList = mannerDB[activeCategory] || [];
  const chipsContainer = document.getElementById("subSituationChips");
  const cardsContainer = document.getElementById("stepCardsContainer");

  chipsContainer.innerHTML = dataList.map((item, idx) => `
    <button class="chip ${idx === activeSubIndex ? 'active' : ''}" onclick="selectSub(${idx})">
      ${item.subTitle}
    </button>
  `).join('');

  const currentSituation = dataList[activeSubIndex];
  if (!currentSituation) {
    cardsContainer.innerHTML = "<div style='color:#94a3b8; text-align:center; padding:20px;'>준비 중인 카테고리입니다.</div>";
    return;
  }

  cardsContainer.innerHTML = currentSituation.steps.map(step => `
    <div class="step-card">
      <div class="step-header">
        <span class="step-badge badge-${step.type}">${step.badge}</span>
        <span class="step-title">${step.title}</span>
      </div>
      <div class="step-core">${step.core}</div>
      <details>
        <summary>💡 왜 이렇게 해야 할까요?</summary>
        <div class="why-text">${step.why}</div>
      </details>
    </div>
  `).join('');
}

function selectSub(idx) {
  activeSubIndex = idx;
  renderDetail();
}

document.getElementById("searchInput").addEventListener("input", function() {
  const kw = this.value.trim().toLowerCase();
  if (!kw) return;

  for (const [cat, situations] of Object.entries(mannerDB)) {
    for (let i = 0; i < situations.length; i++) {
      const match = situations[i].subTitle.toLowerCase().includes(kw) ||
        situations[i].steps.some(s => s.title.toLowerCase().includes(kw) || s.core.toLowerCase().includes(kw));
      if (match) {
        activeCategory = cat;
        activeSubIndex = i;
        document.getElementById("homeView").style.display = "none";
        document.getElementById("detailView").style.display = "block";
        document.getElementById("backBtn").style.display = "inline-block";
        document.getElementById("headerTitle").innerText = cat;
        renderDetail();
        return;
      }
    }
  }
});
