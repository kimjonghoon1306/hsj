/* =============================================
   횡성전통시장 - main.js
   ============================================= */

// ── 설정 ──────────────────────────────────────
const MARKET_START = { year: 2026, month: 4 }; // 5월 = index 4
const MARKET_END   = { year: 2026, month: 11 }; // 12월 = index 11
const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

// 장날 판별 (끝자리 1 or 6)
function isMarketDay(day) {
  const last = day % 10;
  return last === 1 || last === 6;
}

// 해당 월의 장날 배열 반환
function getMarketDays(year, month) {
  const total = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let d = 1; d <= total; d++) {
    if (isMarketDay(d)) days.push(d);
  }
  return days;
}

// 오늘 기준 다음 장날 계산
function calcNextMarket() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(today);
  for (let i = 0; i <= 15; i++) {
    if (isMarketDay(check.getDate())) {
      return { date: new Date(check), diff: i };
    }
    check.setDate(check.getDate() + 1);
  }
  return null;
}

// ── D-DAY 배너 ────────────────────────────────
function initDday() {
  const mkt = calcNextMarket();
  if (!mkt) return;

  const banner  = document.getElementById('ddayBanner');
  const numEl   = document.getElementById('ddayNum');
  const msgEl   = document.getElementById('ddayMsg');
  const dateEl  = document.getElementById('nextDate');

  const m = mkt.date.getMonth() + 1;
  const d = mkt.date.getDate();

  if (mkt.diff === 0) {
    banner.classList.add('today');
    numEl.textContent  = 'D-DAY';
    msgEl.textContent  = '🎉 오늘 장날입니다! 지금 바로 횡성전통시장으로 오세요';
    dateEl.textContent = `${m}월 ${d}일`;
  } else {
    numEl.textContent  = `D-${mkt.diff}`;
    msgEl.textContent  = `${m}월 ${d}일 장날까지 ${mkt.diff}일 남았습니다`;
    dateEl.textContent = `${m}월 ${d}일`;
  }
}

// ── 캘린더 ────────────────────────────────────
let currentYear  = 2026;
let currentMonth = new Date().getMonth(); // 오늘 달로 초기화

// 범위 클램핑 (5월~12월 2026)
function clampMonth() {
  if (currentYear === MARKET_START.year && currentMonth < MARKET_START.month) {
    currentMonth = MARKET_START.month;
  }
  if (currentYear === MARKET_END.year && currentMonth > MARKET_END.month) {
    currentMonth = MARKET_END.month;
  }
}

function buildCalendar() {
  clampMonth();

  const today    = new Date();
  const todayY   = today.getFullYear();
  const todayM   = today.getMonth();
  const todayD   = today.getDate();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const total    = new Date(currentYear, currentMonth + 1, 0).getDate();
  const marketDays = getMarketDays(currentYear, currentMonth);

  // 헤더 타이틀
  document.getElementById('calMonthTitle').textContent =
    `${currentYear}년 ${MONTH_KR[currentMonth]}`;

  // 이전/다음 버튼 비활성화 처리
  const btnPrev = document.getElementById('calPrev');
  const btnNext = document.getElementById('calNext');
  btnPrev.disabled = (currentYear === MARKET_START.year && currentMonth <= MARKET_START.month);
  btnNext.disabled = (currentYear === MARKET_END.year   && currentMonth >= MARKET_END.month);

  // 그리드 렌더
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= total; d++) {
    const el  = document.createElement('div');
    const dow = new Date(currentYear, currentMonth, d).getDay();
    const isToday   = (d === todayD && currentMonth === todayM && currentYear === todayY);
    const isMkt     = isMarketDay(d);
    const isSun     = dow === 0;

    let cls = 'cal-day';
    if (isMkt)  cls += ' market';
    else if (isSun) cls += ' sunday';
    if (isToday) cls += ' today-marker';

    el.className   = cls;
    el.textContent = d;
    grid.appendChild(el);
  }

  // 장날 칩 목록 업데이트
  renderMarketChips(marketDays, todayY, todayM, todayD);
}

function renderMarketChips(days, tY, tM, tD) {
  const container = document.getElementById('marketDayChips');
  if (!container) return;
  container.innerHTML = '';

  days.forEach(d => {
    const chip = document.createElement('div');
    const isThisMonth = (currentYear === tY && currentMonth === tM);
    const isPast  = isThisMonth && d < tD;
    const isToday = isThisMonth && d === tD;
    const isNext  = isThisMonth && d > tD;

    chip.className = 'market-day-chip' +
      (isPast  ? ' past'  : '') +
      (isToday ? ' today' : '') +
      (isNext  ? ' next'  : '');

    chip.textContent = `${MONTH_KR[currentMonth].replace('월','')}/${d}`;
    container.appendChild(chip);
  });
}

function initCalendar() {
  // 오늘이 5월 이전이면 5월부터, 이후면 해당 달부터
  const now = new Date();
  currentYear  = 2026;
  currentMonth = Math.max(MARKET_START.month, Math.min(now.getMonth(), MARKET_END.month));

  document.getElementById('calPrev').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    buildCalendar();
  });

  document.getElementById('calNext').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    buildCalendar();
  });

  buildCalendar();

  // 자동 슬라이드: 5초마다 다음 달로 (범위 내 순환)
  setInterval(() => {
    if (currentYear === MARKET_END.year && currentMonth >= MARKET_END.month) {
      currentMonth = MARKET_START.month;
      currentYear  = MARKET_START.year;
    } else {
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    }
    buildCalendar();
  }, 5000);
}

// ── 스크롤 Fade-in ─────────────────────────────
function initScrollObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ── 진입점 ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDday();
  initCalendar();
  initScrollObserver();
});
