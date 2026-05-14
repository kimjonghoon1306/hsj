/* =============================================
   횡성전통시장 - main.js
   ============================================= */

const MARKET_START = { year: 2026, month: 4 };  // 5월
const MARKET_END   = { year: 2026, month: 11 }; // 12월
const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

let currentYear  = 2026;
let currentMonth = 4; // 기본값 5월, initCalendar에서 오늘 달로 덮어씀

// ── 장날 판별 ──────────────────────────────────
function isMarketDay(day) {
  return day % 10 === 1 || day % 10 === 6;
}

function getMarketDays(year, month) {
  const total = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let d = 1; d <= total; d++) {
    if (isMarketDay(d)) days.push(d);
  }
  return days;
}

// ── 다음 장날 계산 (오늘 포함) ─────────────────
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

// ── 실시간 시계 + D-DAY ─────────────────────────
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 ` +
    ['일','월','화','수','목','금','토'][now.getDay()] + '요일';

  const clockEl = document.getElementById('liveClock');
  const dateEl2 = document.getElementById('liveDate');
  if (clockEl) clockEl.textContent = timeStr;
  if (dateEl2) dateEl2.textContent = dateStr;
}

function initDday() {
  const mkt = calcNextMarket();
  if (!mkt) return;

  const banner = document.getElementById('ddayBanner');
  const numEl  = document.getElementById('ddayNum');
  const msgEl  = document.getElementById('ddayMsg');
  const dateEl = document.getElementById('nextDate');

  const m = mkt.date.getMonth() + 1;
  const d = mkt.date.getDate();

  if (mkt.diff === 0) {
    banner.classList.add('today');
    numEl.textContent  = 'D-DAY';
    msgEl.textContent  = '🎉 오늘 장날입니다! 지금 바로 횡성전통시장으로 오세요';
  } else {
    numEl.textContent  = `D-${mkt.diff}`;
    msgEl.textContent  = `${m}월 ${d}일 장날까지 ${mkt.diff}일 남았습니다`;
  }
  dateEl.textContent = `${m}월 ${d}일`;

  // 실시간 시계 1초마다 갱신
  updateClock();
  setInterval(updateClock, 1000);
}

// ── 캘린더 ────────────────────────────────────
function buildCalendar() {
  const today  = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const firstDay   = new Date(currentYear, currentMonth, 1).getDay();
  const total      = new Date(currentYear, currentMonth + 1, 0).getDate();
  const marketDays = getMarketDays(currentYear, currentMonth);

  document.getElementById('calMonthTitle').textContent =
    `${currentYear}년 ${MONTH_KR[currentMonth]}`;

  // 버튼 비활성화: 정확하게 경계 처리
  const isAtStart = (currentYear === MARKET_START.year && currentMonth === MARKET_START.month);
  const isAtEnd   = (currentYear === MARKET_END.year   && currentMonth === MARKET_END.month);
  document.getElementById('calPrev').disabled = isAtStart;
  document.getElementById('calNext').disabled = isAtEnd;

  // 날짜 그리드
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= total; d++) {
    const el     = document.createElement('div');
    const dow    = new Date(currentYear, currentMonth, d).getDay();
    const isMkt  = isMarketDay(d);
    const isSun  = dow === 0;
    const isToday = (d === todayD && currentMonth === todayM && currentYear === todayY);

    let cls = 'cal-day';
    if (isMkt)       cls += ' market';
    else if (isSun)  cls += ' sunday';
    if (isToday)     cls += ' today-marker';

    el.className   = cls;
    el.textContent = d;
    grid.appendChild(el);
  }

  // 장날 칩
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

    chip.textContent = `${currentMonth + 1}/${d}`;
    container.appendChild(chip);
  });
}

function initCalendar() {
  const now = new Date();
  const nowY = now.getFullYear();
  const nowM = now.getMonth();

  // 오늘 날짜 기준으로 시작 달 결정
  if (nowY === 2026 && nowM >= MARKET_START.month && nowM <= MARKET_END.month) {
    currentYear  = 2026;
    currentMonth = nowM; // 오늘 달 그대로
  } else {
    currentYear  = 2026;
    currentMonth = MARKET_START.month; // 범위 밖이면 5월로
  }

  // ◀ 이전 달
  document.getElementById('calPrev').addEventListener('click', () => {
    if (currentYear === MARKET_START.year && currentMonth === MARKET_START.month) return;
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    buildCalendar();
  });

  // ▶ 다음 달
  document.getElementById('calNext').addEventListener('click', () => {
    if (currentYear === MARKET_END.year && currentMonth === MARKET_END.month) return;
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    buildCalendar();
  });

  buildCalendar();
  // ※ 자동 슬라이드 없음 — 사용자가 직접 조작
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
