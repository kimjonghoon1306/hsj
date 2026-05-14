/* =============================================
   횡성전통시장 - admin.js
   ============================================= */

const ADMIN_PW = '456789';
let resFilter = 'all';

// ── 로그인 ────────────────────────────────────
function doLogin() {
  const pw = document.getElementById('pwInput').value;
  if (pw === ADMIN_PW) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    Store.initDefaultData();
    renderDashboard();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function doLogout() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('pwInput').value = '';
}

// ── 탭 전환 ───────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  event.currentTarget.classList.add('active');

  if (name === 'dashboard')    renderDashboard();
  if (name === 'notices')      renderNotices();
  if (name === 'merchants')    renderMerchants();
  if (name === 'reservations') renderReservations();
  if (name === 'popup')        renderPopupTab();
}

// ── 대시보드 ──────────────────────────────────
function renderDashboard() {
  const now = new Date();
  const days = ['일','월','화','수','목','금','토'];
  document.getElementById('dashDate').textContent =
    `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;

  const notices = Store.Notices.getAll();
  const merchants = Store.Merchants.getAll();
  const reservations = Store.Reservations.getAll();
  const pending = reservations.filter(r => r.status === 'pending');

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="s-num">${notices.length}</div><div class="s-label">공지사항</div></div>
    <div class="stat-card"><div class="s-num">${merchants.length}</div><div class="s-label">등록 상인</div></div>
    <div class="stat-card"><div class="s-num">${reservations.length}</div><div class="s-label">총 예약</div></div>
    <div class="stat-card" style="border-top-color:var(--red)"><div class="s-num" style="color:var(--red)">${pending.length}</div><div class="s-label">대기중 예약</div></div>
  `;

  // 다음 장날
  const check = new Date(); check.setHours(0,0,0,0);
  for (let i = 0; i <= 15; i++) {
    const d = check.getDate(), last = d % 10;
    if (last === 1 || last === 6) {
      const m = check.getMonth()+1;
      document.getElementById('dashNextMarket').textContent =
        i === 0 ? `🎉 오늘 장날입니다! (${m}월 ${d}일)` : `D-${i} · ${m}월 ${d}일`;
      break;
    }
    check.setDate(check.getDate()+1);
  }

  // 최근 예약 3건
  const recent = reservations.slice(0,3);
  if (recent.length === 0) {
    document.getElementById('dashRecentRes').innerHTML = '<div class="empty-state"><div class="e-icon">📋</div>예약 내역이 없습니다.</div>';
  } else {
    document.getElementById('dashRecentRes').innerHTML = `
      <table><thead><tr><th>이름</th><th>방문 희망일</th><th>인원</th><th>상태</th></tr></thead>
      <tbody>${recent.map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${r.visitDate}</td>
          <td>${r.people}명</td>
          <td><span class="badge badge-${r.status}">${statusLabel(r.status)}</span></td>
        </tr>`).join('')}
      </tbody></table>`;
  }
}

// ── 공지사항 ──────────────────────────────────
function renderNotices() {
  const list = Store.Notices.getAll();
  const tbody = document.getElementById('noticeTableBody');
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="e-icon">📣</div>공지사항이 없습니다.</div></td></tr>';
    return;
  }
  tbody.innerHTML = list.map(n => `
    <tr>
      <td><strong>${n.title}</strong>${n.pinned ? '<span class="pinned-tag">📌</span>' : ''}</td>
      <td><span class="badge badge-${n.type}">${typeLabel(n.type)}</span></td>
      <td>${n.createdAt}</td>
      <td><span style="font-size:0.8rem;color:${n.hidden?'#999':'var(--success)'}">${n.hidden?'숨김':'공개'}</span></td>
      <td style="display:flex;gap:6px;">
        <button class="btn btn-sm btn-outline" onclick="editNotice('${n.id}')">수정</button>
        <button class="btn btn-sm btn-outline" onclick="toggleNoticeHidden('${n.id}',${!n.hidden})">${n.hidden?'공개':'숨김'}</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNotice('${n.id}')">삭제</button>
      </td>
    </tr>`).join('');
}

function openNoticeModal(id) {
  document.getElementById('noticeId').value = '';
  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeContent').value = '';
  document.getElementById('noticeType').value = 'info';
  document.getElementById('noticePinned').value = 'false';
  document.getElementById('noticeMtitle').textContent = '공지 작성';
  openModal('noticeModal');
}

function editNotice(id) {
  const n = Store.Notices.getAll().find(x => x.id === id);
  if (!n) return;
  document.getElementById('noticeId').value = n.id;
  document.getElementById('noticeTitle').value = n.title;
  document.getElementById('noticeContent').value = n.content;
  document.getElementById('noticeType').value = n.type || 'info';
  document.getElementById('noticePinned').value = String(n.pinned);
  document.getElementById('noticeMtitle').textContent = '공지 수정';
  openModal('noticeModal');
}

function saveNotice() {
  const id = document.getElementById('noticeId').value;
  const data = {
    title:   document.getElementById('noticeTitle').value.trim(),
    content: document.getElementById('noticeContent').value.trim(),
    type:    document.getElementById('noticeType').value,
    pinned:  document.getElementById('noticePinned').value === 'true',
  };
  if (!data.title || !data.content) { alert('제목과 내용을 입력하세요.'); return; }
  if (id) Store.Notices.update(id, data);
  else    Store.Notices.add(data);
  closeModal('noticeModal');
  renderNotices();
}

function toggleNoticeHidden(id, hidden) {
  Store.Notices.update(id, { hidden });
  renderNotices();
}

function deleteNotice(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  Store.Notices.delete(id);
  renderNotices();
}

// ── 상인 관리 ─────────────────────────────────
function renderMerchants() {
  const list = Store.Merchants.getAll();
  const grid = document.getElementById('merchantGrid');
  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="e-icon">🏪</div>등록된 상인이 없습니다.</div>';
    return;
  }
  grid.innerHTML = list.map(m => `
    <div class="merchant-admin-card">
      <div class="m-emoji">${m.emoji || '🏪'}</div>
      <h4>${m.name}</h4>
      <div class="m-cat">${m.category} · ${m.years || '-'}</div>
      <div class="m-desc">${m.desc}</div>
      <div class="m-actions">
        <button class="btn btn-sm btn-outline" onclick="editMerchant('${m.id}')">수정</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMerchant('${m.id}')">삭제</button>
      </div>
    </div>`).join('');
}

function openMerchantModal() {
  ['merchantId','merchantName','merchantEmoji','merchantCategory','merchantYears','merchantPhone','merchantItems','merchantDesc']
    .forEach(id => document.getElementById(id).value = '');
  document.getElementById('merchantMtitle').textContent = '상인 등록';
  openModal('merchantModal');
}

function editMerchant(id) {
  const m = Store.Merchants.getAll().find(x => x.id === id);
  if (!m) return;
  document.getElementById('merchantId').value = m.id;
  document.getElementById('merchantName').value = m.name;
  document.getElementById('merchantEmoji').value = m.emoji || '';
  document.getElementById('merchantCategory').value = m.category;
  document.getElementById('merchantYears').value = m.years || '';
  document.getElementById('merchantPhone').value = m.phone || '';
  document.getElementById('merchantItems').value = m.items || '';
  document.getElementById('merchantDesc').value = m.desc;
  document.getElementById('merchantMtitle').textContent = '상인 수정';
  openModal('merchantModal');
}

function saveMerchant() {
  const id = document.getElementById('merchantId').value;
  const data = {
    name:     document.getElementById('merchantName').value.trim(),
    emoji:    document.getElementById('merchantEmoji').value.trim() || '🏪',
    category: document.getElementById('merchantCategory').value.trim(),
    years:    document.getElementById('merchantYears').value.trim(),
    phone:    document.getElementById('merchantPhone').value.trim(),
    items:    document.getElementById('merchantItems').value.trim(),
    desc:     document.getElementById('merchantDesc').value.trim(),
  };
  if (!data.name || !data.desc) { alert('상호명과 소개글을 입력하세요.'); return; }
  if (id) Store.Merchants.update(id, data);
  else    Store.Merchants.add(data);
  closeModal('merchantModal');
  renderMerchants();
}

function deleteMerchant(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  Store.Merchants.delete(id);
  renderMerchants();
}

// ── 예약 관리 ─────────────────────────────────
function renderReservations() {
  const all = Store.Reservations.getAll();
  const list = resFilter === 'all' ? all : all.filter(r => r.status === resFilter);
  const tbody = document.getElementById('resTableBody');

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="e-icon">📋</div>예약 내역이 없습니다.</div></td></tr>';
    return;
  }
  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${r.createdAt}</td>
      <td><strong>${r.name}</strong></td>
      <td>${r.phone}</td>
      <td>${r.visitDate}</td>
      <td>${r.people}명</td>
      <td style="max-width:160px;font-size:0.8rem">${r.purpose || '-'}</td>
      <td><span class="badge badge-${r.status}">${statusLabel(r.status)}</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          ${r.status !== 'confirmed'  ? `<button class="btn btn-sm btn-success" onclick="updateRes('${r.id}','confirmed')">확정</button>` : ''}
          ${r.status !== 'cancelled'  ? `<button class="btn btn-sm btn-danger"  onclick="updateRes('${r.id}','cancelled')">취소</button>` : ''}
          <button class="btn btn-sm btn-outline" onclick="deleteRes('${r.id}')">삭제</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterRes(status) {
  resFilter = status;
  renderReservations();
}

function updateRes(id, status) {
  Store.Reservations.updateStatus(id, status);
  renderReservations();
}

function deleteRes(id) {
  if (!confirm('삭제하시겠습니까?')) return;
  Store.Reservations.delete(id);
  renderReservations();
}

// ── 공통 모달 ─────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ── 레이블 ────────────────────────────────────
function typeLabel(t) { return { info:'일반공지', event:'이벤트', notice:'긴급' }[t] || t; }
function statusLabel(s) { return { pending:'대기중', confirmed:'확정', cancelled:'취소' }[s] || s; }

// ── 팝업 관리 ─────────────────────────────────
const IMGBB_KEY = 'a3fca09fe4e1fed63e8d94775a408743';
let popupImageUrl = '';

function renderPopupTab() {
  const popup = Store.Popup.get();
  if (!popup) {
    document.getElementById('popupPreviewBox').innerHTML =
      '<span style="color:rgba(30,18,8,0.3);font-size:0.85rem;">등록된 팝업이 없습니다</span>';
    document.getElementById('popupStatusBadge').innerHTML = '';
    return;
  }

  document.getElementById('popupTitle').value   = popup.title || '';
  document.getElementById('popupContent').value = popup.content || '';
  document.getElementById('popupActive').value  = String(popup.active !== false);
  popupImageUrl = popup.imageUrl || '';

  if (popup.imageUrl) {
    document.getElementById('popupImagePreview').innerHTML =
      `<img src="${popup.imageUrl}" style="width:100%;max-height:160px;object-fit:cover;">`;
  }

  // 미리보기
  document.getElementById('popupPreviewBox').innerHTML = `
    <div style="width:100%;padding:24px;text-align:center;">
      ${popup.imageUrl ? `<img src="${popup.imageUrl}" style="width:100%;max-height:200px;object-fit:cover;margin-bottom:16px;">` : ''}
      <div style="font-family:'Nanum Myeongjo',serif;font-size:1.1rem;font-weight:800;color:#3D2314;margin-bottom:8px;">${popup.title || ''}</div>
      <div style="font-size:0.83rem;color:rgba(30,18,8,0.65);line-height:1.7;">${popup.content || ''}</div>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">
        <button style="padding:8px 20px;background:#3D2314;color:#F7EDD8;border:none;font-size:0.8rem;cursor:pointer;">닫기</button>
        <button style="padding:8px 20px;background:none;border:1px solid rgba(61,35,20,0.3);font-size:0.8rem;cursor:pointer;">일주일간 안보기</button>
      </div>
    </div>`;

  document.getElementById('popupStatusBadge').innerHTML =
    popup.active !== false
      ? '<span style="color:#1a6b2a;font-weight:700;">✅ 현재 활성화 중</span>'
      : '<span style="color:#999;">⏸ 비활성화 상태</span>';
}

async function previewPopupImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const status = document.getElementById('popupUploadStatus');
  const preview = document.getElementById('popupImagePreview');
  status.innerHTML = '<span style="color:var(--ochre);">⏳ ImgBB에 업로드 중...</span>';
  preview.innerHTML = '';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
      method: 'POST', body: formData
    });
    const data = await res.json();
    if (data.success) {
      popupImageUrl = data.data.url;
      preview.innerHTML = `<img src="${popupImageUrl}" style="width:100%;max-height:180px;object-fit:cover;border:1px solid rgba(61,35,20,0.15);">`;
      status.innerHTML = '<span style="color:#1a6b2a;">✅ 업로드 완료</span>';
    } else {
      status.innerHTML = '<span style="color:var(--red);">❌ 업로드 실패</span>';
    }
  } catch (e) {
    status.innerHTML = '<span style="color:var(--red);">❌ 네트워크 오류</span>';
  }
}

function savePopup() {
  const title   = document.getElementById('popupTitle').value.trim();
  const content = document.getElementById('popupContent').value.trim();
  const active  = document.getElementById('popupActive').value === 'true';

  if (!title && !content && !popupImageUrl) {
    alert('제목, 내용, 이미지 중 하나 이상 입력하세요.'); return;
  }

  Store.Popup.set({ title, content, imageUrl: popupImageUrl, active, updatedAt: new Date().toLocaleDateString('ko-KR') });
  renderPopupTab();
  alert('팝업이 저장되었습니다!');
}

function deletePopup() {
  if (!confirm('팝업을 삭제하시겠습니까?')) return;
  Store.Popup.clear();
  popupImageUrl = '';
  document.getElementById('popupTitle').value = '';
  document.getElementById('popupContent').value = '';
  document.getElementById('popupImagePreview').innerHTML = '';
  document.getElementById('popupUploadStatus').innerHTML = '';
  renderPopupTab();
}
