/* =============================================
   횡성전통시장 - public.js
   ============================================= */

function renderPublicNotices(){
  Store.initDefaultData();
  const list=Store.Notices.getActive();
  const container=document.getElementById('noticeList');
  if(!container)return;
  if(list.length===0){container.innerHTML='<div style="text-align:center;padding:40px;color:rgba(30,18,8,0.35);font-size:0.85rem;">등록된 공지사항이 없습니다.</div>';return;}
  const sorted=[...list.filter(n=>n.pinned),...list.filter(n=>!n.pinned)];
  container.innerHTML=sorted.map(n=>`
    <div class="notice-item ${n.pinned?'pinned':''}">
      <div class="notice-left">
        <span class="notice-type-badge notice-type-${n.type}">${{info:'공지',event:'이벤트',notice:'긴급'}[n.type]||'공지'}</span>
        ${n.pinned?'<span class="notice-pin">📌</span>':''}
      </div>
      <div class="notice-body">
        <div class="notice-title">${n.title}</div>
        <div class="notice-content">${n.content}</div>
      </div>
      <div class="notice-date">${n.createdAt}</div>
    </div>`).join('');
}

function renderPublicMerchants(){
  const list=Store.Merchants.getActive();
  const grid=document.getElementById('merchantPubGrid');
  if(!grid)return;
  if(list.length===0){grid.innerHTML='<div style="text-align:center;padding:60px;color:rgba(30,18,8,0.35);">등록된 상인 정보가 없습니다.</div>';return;}
  grid.innerHTML=list.map(m=>`
    <div class="merchant-pub-card">
      <div class="mpc-top">
        <span class="mpc-emoji">${m.emoji||'🏪'}</span>
        <div><div class="mpc-name">${m.name}</div><div class="mpc-cat">${m.category}${m.years?' · '+m.years:''}</div></div>
      </div>
      <p class="mpc-desc">${m.desc}</p>
      ${m.items?`<div class="mpc-items">🛍️ ${m.items}</div>`:''}
      ${m.phone?`<div class="mpc-phone">📞 ${m.phone}</div>`:''}
    </div>`).join('');
}

function submitReservation(){
  const name=document.getElementById('resName').value.trim();
  const phone=document.getElementById('resPhone').value.trim();
  const people=document.getElementById('resPeople').value.trim();
  const visitDate=document.getElementById('resDate').value;
  const purpose=document.getElementById('resPurpose').value.trim();
  const result=document.getElementById('reserveResult');
  if(!name||!phone||!people||!visitDate){result.innerHTML='<div class="res-error">필수 항목을 모두 입력해주세요.</div>';return;}
  Store.Reservations.add({name,phone,people:Number(people),visitDate,purpose});
  ['resName','resPhone','resPeople','resDate','resPurpose'].forEach(id=>document.getElementById(id).value='');
  result.innerHTML=`<div class="res-success">✅ 예약 신청이 완료되었습니다!<br><span style="font-size:0.85rem;opacity:0.8;">담당자 확인 후 <strong>${phone}</strong>으로 연락드리겠습니다.</span></div>`;
  setTimeout(()=>{result.innerHTML='';},5000);
}

// ── 팝업 ──────────────────────────────────────
function initPopup(){
  if(Store.Popups.isHidden())return;
  const popup=Store.Popups.getActive();
  if(!popup)return;
  const overlay=document.getElementById('sitePopupOverlay');
  if(!overlay)return;
  if(popup.imageUrl){
    document.getElementById('sitePopupImg').innerHTML=`<img src="${popup.imageUrl}" style="width:100%;max-height:320px;object-fit:cover;display:block;">`;
  } else {
    document.getElementById('sitePopupImg').innerHTML='';
  }
  document.getElementById('sitePopupTitle').textContent=popup.title||'';
  document.getElementById('sitePopupContent').textContent=popup.content||'';
  overlay.classList.add('open');
}

function closePopup(){ document.getElementById('sitePopupOverlay').classList.remove('open'); }
function closePopupWeek(){ Store.Popups.hideForWeek(); closePopup(); }

window.closePopup=closePopup;
window.closePopupWeek=closePopupWeek;
window.submitReservation=submitReservation;

document.addEventListener('DOMContentLoaded',()=>{
  renderPublicNotices();
  renderPublicMerchants();
  setTimeout(initPopup, 800);
});
