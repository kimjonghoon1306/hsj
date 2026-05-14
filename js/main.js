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

// ── 실시간 카운트다운 (시계 + 장날 타이머 통합) ─────
function updateCountdown() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const DOW = ['일','월','화','수','목','금','토'];

  // 현재 시각
  const clockEl = document.getElementById('liveClock');
  const dateEl  = document.getElementById('liveDate');
  if (clockEl) clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  if (dateEl)  dateEl.textContent  = `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 ${DOW[now.getDay()]}요일`;

  // 히어로 하단 스트립도 동기화
  const stripDday = document.getElementById('heroStripDday');
  const stripMsg  = document.getElementById('heroStripMsg');
  const stripClk  = document.getElementById('heroStripClock');
  const stripDate = document.getElementById('heroStripDate');
  if (stripClk)  stripClk.textContent  = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  if (stripDate) stripDate.textContent = `${now.getMonth()+1}월 ${now.getDate()}일 ${DOW[now.getDay()]}요일`;

  // 시네마틱 직후 위젯 동기화
  const hwToday = document.getElementById('hwToday');
  const hwDown  = document.getElementById('hwDown');
  const hwClock = document.getElementById('hwClock');
  if (hwClock) hwClock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const todayEl = document.getElementById('cntToday');
  const downEl  = document.getElementById('cntDown');
  if (!todayEl || !downEl) return;

  // 오늘이 장날?
  if (isMarketDay(now.getDate())) {
    todayEl.style.display = 'flex';
    downEl.style.display  = 'none';
    if (hwToday) { hwToday.style.display='flex'; }
    if (hwDown)  { hwDown.style.display='none'; }
    if (stripDday) stripDday.textContent = 'D-DAY';
    if (stripMsg)  stripMsg.textContent  = '🎉 오늘이 장날! 지금 바로 횡성전통시장으로 오세요';
    markNextOnCalendar(now);
    return;
  }

  // 다음 장날 찾기
  const base  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const check = new Date(base);
  let found = null;
  for (let i = 1; i <= 15; i++) {
    check.setDate(check.getDate() + 1);
    if (isMarketDay(check.getDate())) {
      found = { date: new Date(check), diff: i };
      break;
    }
  }
  if (!found) return;

  todayEl.style.display = 'none';
  downEl.style.display  = 'flex';
  if (hwToday) hwToday.style.display = 'none';
  if (hwDown)  hwDown.style.display  = 'flex';

  // D-day / 날짜 표시
  const ddayEl = document.getElementById('cntDday');
  const strEl  = document.getElementById('cntNextStr');
  if (ddayEl) ddayEl.textContent = `D-${found.diff}`;
  if (strEl || stripDday || stripMsg) {
    const m   = found.date.getMonth() + 1;
    const d   = found.date.getDate();
    const dow = DOW[found.date.getDay()];
    const dateStr = `${m}월 ${d}일 (${dow}) 장날`;
    if (strEl)     strEl.textContent     = dateStr;
    if (stripDday) stripDday.textContent = `D-${found.diff}`;
    if (stripMsg)  stripMsg.textContent  = `${dateStr}까지 ${found.diff}일 남았습니다`;
    const hwDdayEl = document.getElementById('hwDday');
    const hwDateEl = document.getElementById('hwDate');
    if (hwDdayEl) hwDdayEl.textContent = `D-${found.diff}`;
    if (hwDateEl) hwDateEl.textContent = dateStr;
  }

  // 실시간 카운트다운
  const remaining = found.date - now;
  const totalSec  = Math.max(0, Math.floor(remaining / 1000));
  const days  = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  const secs  = totalSec % 60;

  const dEl = document.getElementById('cntD');
  const hEl = document.getElementById('cntH');
  const mEl = document.getElementById('cntM');
  const sEl = document.getElementById('cntS');
  if (dEl) dEl.textContent = String(days);
  if (hEl) hEl.textContent = pad(hours);
  if (mEl) mEl.textContent = pad(mins);
  if (sEl) sEl.textContent = pad(secs);
  const hwDE = document.getElementById('hwD');
  const hwHE = document.getElementById('hwH');
  const hwME = document.getElementById('hwM');
  const hwSE = document.getElementById('hwS');
  if (hwDE) hwDE.textContent = String(days);
  if (hwHE) hwHE.textContent = pad(hours);
  if (hwME) hwME.textContent = pad(mins);
  if (hwSE) hwSE.textContent = pad(secs);

  // 캘린더 연동: 다음 장날 셀 강조
  markNextOnCalendar(found.date);
}

// ── 캘린더 다음 장날 셀 강조 ──────────────────────
function markNextOnCalendar(targetDate) {
  document.querySelectorAll('.cal-day.next-market').forEach(el => el.classList.remove('next-market'));
  if (!targetDate) return;
  // 현재 캘린더가 같은 월을 보여주고 있을 때만
  if (targetDate.getFullYear() === currentYear && targetDate.getMonth() === currentMonth) {
    const tDay = targetDate.getDate();
    document.querySelectorAll('#calGrid .cal-day.market').forEach(cell => {
      if (parseInt(cell.textContent.trim()) === tDay) {
        cell.classList.add('next-market');
      }
    });
  }
}

function initDday() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
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

  // 카운트다운과 연동: 다음 장날 셀 강조
  const now2 = new Date();
  const base2 = new Date(now2.getFullYear(), now2.getMonth(), now2.getDate());
  if (isMarketDay(base2.getDate())) {
    markNextOnCalendar(base2);
  } else {
    const chk = new Date(base2);
    for (let i = 1; i <= 15; i++) {
      chk.setDate(chk.getDate() + 1);
      if (isMarketDay(chk.getDate())) { markNextOnCalendar(new Date(chk)); break; }
    }
  }
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

// ── 파티클 ────────────────────────────────────
function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const container = document.createElement('div');
  container.className = 'hero-particles';
  hero.appendChild(container);

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 60 + 20;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*12+8}s;
      animation-delay:${Math.random()*10}s;
      opacity:${Math.random()*0.15+0.05};
    `;
    container.appendChild(p);
  }
}

// ── 리플 효과 ─────────────────────────────────
function initRipple() {
  document.querySelectorAll('.hero-cta, .reserve-btn, .news-card-btn, .cal-nav-btn').forEach(btn => {
    btn.classList.add('ripple-btn');
    btn.addEventListener('click', function(e) {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });
}

// ── 숫자 카운터 ───────────────────────────────
function animateCounter(el, target, duration = 1200) {
  const isNum = !isNaN(parseInt(target));
  if (!isNum) return;
  const end = parseInt(target);
  const start = 0;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(start + (end - start) * ease) + (target.includes('+') ? '+' : '');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const numEl = e.target.querySelector('.stat-num');
        if (numEl && !numEl.dataset.counted) {
          numEl.dataset.counted = '1';
          animateCounter(numEl, numEl.textContent.trim());
        }
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-box').forEach(el => obs.observe(el));
}

// ── 방향별 fade-in ────────────────────────────
function initDirectionalFade() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in-left,.fade-in-right,.fade-in-scale').forEach(el => obs.observe(el));
}

// ── 카드 3D 틸트 ─────────────────────────────
function initTilt() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y*6}deg) rotateY(${x*6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── 네비 스크롤 하이라이트 ────────────────────
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile-overlay a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#'+current ? 'var(--gold)' : '';
    });
  }, { passive: true });
}

// ── 진입점에 추가 ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initRipple();
  initCounters();
  initDirectionalFade();
  initTilt();
  initNavHighlight();
});
