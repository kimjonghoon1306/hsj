/* =============================================
   횡성전통시장 - store.js
   공지사항 / 상인 / 예약 데이터 관리 (localStorage)
   ============================================= */

const KEYS = {
  notices:      'hsg_notices',
  merchants:    'hsg_merchants',
  reservations: 'hsg_reservations',
};

// ── 유틸 ──────────────────────────────────────
function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

// ── 공지사항 ──────────────────────────────────
const Notices = {
  getAll() { return load(KEYS.notices); },

  add(data) {
    const list = this.getAll();
    const item = { id: genId(), createdAt: today(), pinned: false, ...data };
    list.unshift(item);
    save(KEYS.notices, list);
    return item;
  },

  update(id, data) {
    const list = this.getAll().map(n => n.id === id ? { ...n, ...data } : n);
    save(KEYS.notices, list);
  },

  delete(id) {
    save(KEYS.notices, this.getAll().filter(n => n.id !== id));
  },

  getActive() {
    return this.getAll().filter(n => !n.hidden);
  }
};

// ── 상인 소개 ─────────────────────────────────
const Merchants = {
  getAll() { return load(KEYS.merchants); },

  add(data) {
    const list = this.getAll();
    const item = { id: genId(), createdAt: today(), ...data };
    list.push(item);
    save(KEYS.merchants, list);
    return item;
  },

  update(id, data) {
    const list = this.getAll().map(m => m.id === id ? { ...m, ...data } : m);
    save(KEYS.merchants, list);
  },

  delete(id) {
    save(KEYS.merchants, this.getAll().filter(m => m.id !== id));
  },

  getActive() {
    return this.getAll().filter(m => !m.hidden);
  }
};

// ── 예약 ──────────────────────────────────────
const Reservations = {
  getAll() { return load(KEYS.reservations); },

  add(data) {
    const list = this.getAll();
    const item = {
      id: genId(),
      createdAt: today(),
      status: 'pending', // pending | confirmed | cancelled
      ...data
    };
    list.unshift(item);
    save(KEYS.reservations, list);
    return item;
  },

  updateStatus(id, status) {
    const list = this.getAll().map(r => r.id === id ? { ...r, status } : r);
    save(KEYS.reservations, list);
  },

  delete(id) {
    save(KEYS.reservations, this.getAll().filter(r => r.id !== id));
  },

  getByStatus(status) {
    return this.getAll().filter(r => r.status === status);
  }
};

// ── 기본 데이터 초기화 (첫 실행 시) ────────────
function initDefaultData() {
  if (Notices.getAll().length === 0) {
    Notices.add({ title: '2026년 횡성전통시장 운영 안내', content: '상설시장은 매일 오전 9시부터 오후 6시까지 운영됩니다. 5일장은 매월 끝자리 1일·6일에 열립니다.', type: 'info', pinned: true });
    Notices.add({ title: '주차장 이용 안내', content: '시장 전용 주차장(횡성읍 읍상리 299-6)을 이용하시면 편리합니다.', type: 'info' });
    Notices.add({ title: '6월 특별 할인 행사', content: '6월 장날(1일, 6일, 11일, 16일, 21일, 26일)에 한우 특별 할인 행사가 진행됩니다.', type: 'event' });
  }

  if (Merchants.getAll().length === 0) {
    Merchants.add({ name: '횡성한우 직판장', category: '한우·정육', desc: '30년 전통의 횡성 한우 직판장. 당일 도축한 신선한 한우를 합리적인 가격에 만나보세요.', phone: '010-0000-0000', items: '한우 등심, 갈비, 안심, 채끝', emoji: '🥩', years: '30년' });
    Merchants.add({ name: '산나물 할머니네', category: '산나물·채소', desc: '직접 산에서 채취한 취나물, 더덕, 고사리 등 청정 강원 산나물을 판매합니다.', phone: '010-0000-0000', items: '취나물, 더덕, 고사리, 도라지', emoji: '🌿', years: '20년' });
    Merchants.add({ name: '메밀 명가', category: '향토음식', desc: '순메밀로 만든 막국수와 메밀전병. 밀가루 한 톨 넣지 않은 진짜 강원도 메밀 음식입니다.', phone: '010-0000-0000', items: '막국수, 메밀전병, 메밀부치기', emoji: '🌾', years: '15년' });
    Merchants.add({ name: '송이버섯 전문점', category: '버섯·임산물', desc: '강원도 청정 소나무 숲에서 채취한 최상급 송이버섯. 가을 제철에 특히 인기입니다.', phone: '010-0000-0000', items: '송이버섯, 능이버섯, 표고버섯', emoji: '🍄', years: '10년' });
    Merchants.add({ name: '찰옥수수·잡곡 가게', category: '농산물·잡곡', desc: '강원 고랭지에서 직접 재배한 찰옥수수와 다양한 잡곡을 판매합니다.', phone: '010-0000-0000', items: '찰옥수수, 콩, 팥, 녹두, 수수', emoji: '🌽', years: '25년' });
    Merchants.add({ name: '강원 더덕 전문', category: '더덕·약초', desc: '횡성 청정 자연에서 자란 향 짙은 더덕. 더덕구이 양념도 함께 판매합니다.', phone: '010-0000-0000', items: '생더덕, 건더덕, 더덕구이 양념', emoji: '🌱', years: '18년' });
  }
}

// 전역 노출
window.Store = { Notices, Merchants, Reservations, initDefaultData };
