(function(){
  const touchDevice = navigator.maxTouchPoints > 0;
  const smallScreen = Math.min(window.screen?.width || 9999, window.screen?.height || 9999) <= 800;
  const narrowViewport = window.innerWidth <= 800;
  if (touchDevice && (smallScreen || narrowViewport)) document.documentElement.classList.add('mobile-device');
})();

function menuHTML(){
  const icon=(d)=>`<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const link=(href,label,d,extra='')=>`<a href="${href}"${extra?` class="${extra}"`:''}>${icon(d)}<span>${label}</span></a>`;
  const group=(id,label,items)=>`<section class="nav-group" data-nav-group="${id}">
    <button type="button" class="nav-group-toggle" aria-expanded="false" aria-controls="nav-items-${id}">
      <span class="nav-group-label">${label}</span>
      <svg class="nav-group-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="nav-group-items" id="nav-items-${id}">${items}</div>
  </section>`;
  return `<div class="nav dash-menu">
    ${group('pilotage','Pilotage',link('dashboard.html','Tableau de bord','<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')+
      link('recherche.html','Recherche globale','<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>')+
      link('controle-informations.html','Contrôle des fiches','<path d="M8 3h8l4 4v14H4V3z"/><path d="M8 11h8M8 15h8M8 7h3"/>'))}
    ${group('parc','Parc & stock',
      link('chariots.html','Tous les chariots','<path d="M3 16l2-7h10l5 4v3"/><path d="M5 16h14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M15 9V5h3v5"/>')+
      link('stock.html','Chariots en stock','<path d="M4 7h16v13H4z"/><path d="M8 7V4h8v3M8 11h8M8 15h5"/>')+
      link('nouveau-chariot.html','Nouveau chariot','<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>','admin-only-nav hidden'))}
    ${group('commercial','Commercial & production',
      link('affectation.html','Affectation commerciale','<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M16 11h6"/>')+
      link('modification-production.html','Modification production','<path d="M4 7h16v10H4z"/><path d="M8 17v3M16 17v3M7 4h10M9 8l2 2 4-4"/>','admin-only-nav hidden'))}
    ${group('livraisons','Livraisons',
      link('preparation-livraison.html','Préparation livraison','<path d="M3 5h11v11H3z"/><path d="M14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>')+
      link('chariots-prevus-livraison.html','Chariots prévus livraison','<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4M17 2v4M3 9h18"/><path d="M8 13h3M8 17h5"/>')+
      link('fiche-livraison.html','Fiche de livraison','<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h7M9 16h7"/>')+
      link('planning-livraisons.html','Planning des livraisons','<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4M17 2v4M3 9h18"/><path d="M8 13h2M12 13h2M16 13h0M8 17h2M12 17h2"/>')+
      link('livres.html','Chariots livrés','<path d="M4 5h12v14H4z"/><path d="M8 8h5M8 12h5M8 16h3"/><path d="M16 8h4v11h-4"/>'))}
    ${group('sav','SAV & retours',
      link('retours-clients.html','Pannes & retours clients','<path d="M3 12h4l3 8 4-16 3 8h4"/><circle cx="12" cy="12" r="10"/>'))}
    ${group('administration','Administration',
      link('gestion.html','Gestion utilisateurs','<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M17 11a3 3 0 1 0 0-6M17 15c2.4 0 4 1.5 4 4"/>','admin-only-nav hidden')+
      link('licence.html','Paramètres','<path d="M12 3l2.2 1.5 2.7-.1.8 2.6 2.2 1.6-1 2.5.5 2.7-2.5 1.1-.9 2.5-2.7-.2L12 21l-2.3-1.6-2.7.2-.9-2.5-2.5-1.1.5-2.7-1-2.5L5.3 8.6l.8-2.6 2.7.1L12 3z"/><circle cx="12" cy="12" r="3"/>','admin-only-nav hidden')+
      link('profile.html','Mon profil','<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>'))}
    <div class="nav-separator"></div>
    ${link('#','Déconnexion','<path d="M9 5H4v14h5M13 8l4 4-4 4M17 12H8"/>','logout-link')}
  </div>`;
}
function nav(){
  const page=location.pathname.split('/').pop()||'dashboard.html';
  document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===page));
  document.querySelectorAll('.nav-group').forEach(group=>{
    const active=!!group.querySelector('a.active');
    group.classList.toggle('is-open',active);
    const toggle=group.querySelector('.nav-group-toggle');
    if(toggle)toggle.setAttribute('aria-expanded',active?'true':'false');
  });
}
function wireNavGroups(root=document){
  root.querySelectorAll('.nav-group-toggle').forEach(toggle=>{
    if(toggle.dataset.groupWired==='1')return;
    toggle.dataset.groupWired='1';
    toggle.addEventListener('click',()=>{
      const group=toggle.closest('.nav-group');
      const menu=toggle.closest('.dash-menu');
      if(!group||!menu)return;
      const shouldOpen=!group.classList.contains('is-open');
      menu.querySelectorAll('.nav-group.is-open').forEach(other=>{
        if(other!==group){other.classList.remove('is-open');other.querySelector('.nav-group-toggle')?.setAttribute('aria-expanded','false');}
      });
      group.classList.toggle('is-open',shouldOpen);
      toggle.setAttribute('aria-expanded',shouldOpen?'true':'false');
    });
  });
}
function toggleMenu(force){
  const overlay=document.querySelector('.overlay');
  if(!overlay)return;
  const open=typeof force==='boolean'?force:!overlay.classList.contains('open');
  overlay.classList.toggle('open',open);
  document.body.classList.toggle('menu-open',open);
  const btn=document.querySelector('.menu-btn');
  if(btn){
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');
    btn.classList.toggle('is-open',open);
  }
  if(open){
    const first=overlay.querySelector('.nav a');
    if(first) first.setAttribute('tabindex','0');
  }
}
function closeMobileMenu(){toggleMenu(false)}
function handleMobileNavClick(e){
  const a=e.currentTarget;
  if(!a || a.getAttribute('href')==='#') return;
  // Give the tap a deterministic visual response, then close the drawer.
  a.classList.add('tap-active');
  window.setTimeout(()=>a.classList.remove('tap-active'),180);
  closeMobileMenu();
}
function initDashboardHoverSidebar(){
  const body=document.body;
  const isDashboard=body.classList.contains('professional-dashboard');
  const sidebar=isDashboard
    ? body.querySelector('.professional-dashboard .dash-sidebar')
    : body.querySelector('.layout > .side.desktop');
  if(!sidebar)return;
  const touchLike=()=>window.innerWidth<=800||
    document.documentElement.classList.contains('mobile-device')||
    !!(window.matchMedia&&window.matchMedia('(hover: none) and (pointer: coarse)').matches);
  const syncMode=()=>{
    if(touchLike()){
      body.classList.remove('sidebar-rail','sidebar-hover-expanded','sidebar-pinned');
      return;
    }
    if(!body.classList.contains('sidebar-pinned'))body.classList.add('sidebar-rail');
  };
  syncMode();
  const menuBtn=document.querySelector('.pro-menu-btn');
  if(menuBtn){
    menuBtn.setAttribute('aria-expanded',body.classList.contains('sidebar-pinned')?'true':'false');
    menuBtn.setAttribute('aria-label',body.classList.contains('sidebar-pinned')?'Réduire le menu':'Ouvrir le menu au survol');
    menuBtn.title=menuBtn.getAttribute('aria-label');
  }
  sidebar.querySelectorAll('.nav a,.dash-menu a').forEach(a=>{
    const label=(a.querySelector('span')?.textContent||a.textContent||'').trim();
    if(label){a.setAttribute('aria-label',label);a.title=label;}
  });
  if(sidebar.dataset.hoverExpandReady==='1')return;
  sidebar.dataset.hoverExpandReady='1';
  const expand=()=>{
    if(!touchLike()&&body.classList.contains('sidebar-rail')&&!body.classList.contains('sidebar-pinned')){
      body.classList.add('sidebar-hover-expanded');
      if(menuBtn)menuBtn.setAttribute('aria-expanded','true');
    }
  };
  const collapse=()=>{
    if(!touchLike()&&body.classList.contains('sidebar-rail')&&!body.classList.contains('sidebar-pinned')){
      body.classList.remove('sidebar-hover-expanded');
      if(menuBtn)menuBtn.setAttribute('aria-expanded','false');
    }
  };
  sidebar.addEventListener('mouseenter',expand);
  sidebar.addEventListener('mouseleave',collapse);
  sidebar.addEventListener('focusin',expand);
  sidebar.addEventListener('focusout',()=>{
    window.setTimeout(()=>{if(!sidebar.contains(document.activeElement))collapse()},0);
  });
  window.addEventListener('resize',syncMode);
}
function toggleSidebar(force){
  if(window.innerWidth<=800){toggleMenu(force);return}
  // Clicking the dashboard menu button pins the sidebar open; clicking again returns it to hover mode.
  const pinned=typeof force==='boolean'?!force:!document.body.classList.contains('sidebar-pinned');
  document.body.classList.toggle('sidebar-pinned',pinned);
  document.body.classList.toggle('sidebar-rail',!pinned);
  document.body.classList.remove('sidebar-hover-expanded');
  const sidebar=document.querySelector('.professional-dashboard .dash-sidebar');
  if(!pinned&&sidebar?.matches(':hover'))document.body.classList.add('sidebar-hover-expanded');
  const btn=document.querySelector('.pro-menu-btn');
  if(btn){
    btn.setAttribute('aria-expanded',pinned?'true':'false');
    btn.setAttribute('aria-label',pinned?'Réduire le menu':'Garder le menu ouvert');
    btn.title=pinned?'Réduire le menu':'Garder le menu ouvert';
  }
}
function goToGlobalSearch(query='',from='',to='',focusDate=false){
  const url=new URL('recherche.html',location.href);
  if(String(query||'').trim())url.searchParams.set('q',String(query).trim());
  if(from)url.searchParams.set('from',from);
  if(to)url.searchParams.set('to',to);
  if(focusDate)url.searchParams.set('focusDate','1');
  location.href=url.href;
}
function openGlobalDateSearch(){
  const input=document.getElementById('siteGlobalSearchInput')||document.getElementById('dashboardSearch');
  goToGlobalSearch(input?.value||'','','',true);
}
function isSbiChassisSearchValue(value){
  const q=String(value||'').trim().toUpperCase();
  return q.length>=3 && /^G6[A-Z0-9-]+$/.test(q);
}
function sbiChassisCreateSuggestionHTML(value){
  const chassis=String(value||'').trim().toUpperCase();
  if(!isSbiChassisSearchValue(chassis))return '';
  const url='nouveau-chariot.html?chassis='+encodeURIComponent(chassis);
  let exists=false;
  try{exists=typeof CHARIOTS!=='undefined'&&Array.isArray(CHARIOTS)&&CHARIOTS.some(c=>String(c?.chassis||'').trim().toUpperCase()===chassis)}catch(_){}
  const admin=typeof isAdmin==='function'&&isAdmin();
  if(!admin)return '<div class="sbi-chassis-create-note">Créer un chariot avec ce numéro : option réservée à l’administrateur.</div>';
  const note=exists
    ? 'Ce numéro existe déjà. Le contrôle châssis + moteur reste appliqué.'
    : 'Numéro non trouvé : il sera prérempli dans le formulaire.';
  return '<a class="sbi-chassis-create-action" href="'+url+'"><span class="sbi-chassis-create-plus" aria-hidden="true">＋</span><span class="sbi-chassis-create-copy"><strong>Créer un chariot avec ce numéro</strong><small>'+note+'</small></span><span class="sbi-chassis-create-arrow" aria-hidden="true">→</span></a>';
}
function initSbiChassisCreateSuggestion(input,wrapper,panel){
  if(!input||!wrapper||!panel||input.dataset.chassisCreateReady==='1')return;
  input.dataset.chassisCreateReady='1';
  const render=()=>{
    const html=sbiChassisCreateSuggestionHTML(input.value);
    panel.innerHTML=html;
    panel.classList.toggle('open',!!html);
    panel.setAttribute('aria-hidden',html?'false':'true');
  };
  input.addEventListener('input',render);
  input.addEventListener('focus',render);
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.classList.remove('open');panel.setAttribute('aria-hidden','true')}});
  document.addEventListener('click',e=>{
    if(!wrapper.contains(e.target)){panel.classList.remove('open');panel.setAttribute('aria-hidden','true')}
  });
}
function initSiteGlobalSearch(){
  const page=location.pathname.split('/').pop()||'dashboard.html';
  if(['index.html','maintenance.html'].includes(page))return;
  const dashboard=document.querySelector('.pro-header');
  if(dashboard){
    const shell=dashboard.querySelector('.dashboard-search-shell');
    if(shell&&!shell.querySelector('.sbi-global-date-btn')){
      const btn=document.createElement('button');btn.type='button';btn.className='sbi-global-date-btn';btn.title='Recherche par date';btn.setAttribute('aria-label','Recherche globale par date');btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6"/></svg>';
      btn.addEventListener('click',openGlobalDateSearch);shell.appendChild(btn);
    }
    return;
  }
  const header=document.querySelector('header.top');
  if(!header||header.querySelector('.sbi-global-searchbar'))return;
  const form=document.createElement('form');form.className='sbi-global-searchbar';form.setAttribute('role','search');form.setAttribute('aria-label','Recherche globale dans le site');
  form.innerHTML='<input id="siteGlobalSearchInput" type="search" autocomplete="off" placeholder="Recherche globale : châssis, série, client, moteur..." aria-label="Rechercher dans tout le site"><button class="sbi-global-submit" type="submit" aria-label="Lancer la recherche"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg></button><button class="sbi-global-date-btn" type="button" title="Rechercher par date" aria-label="Recherche par date"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h6"/></svg></button>';
  form.addEventListener('submit',e=>{e.preventDefault();goToGlobalSearch(form.querySelector('input')?.value||'')});
  form.querySelector('.sbi-global-date-btn')?.addEventListener('click',()=>openGlobalDateSearch());
  const wrapper=document.createElement('div');wrapper.className='sbi-global-search-wrap';
  wrapper.appendChild(form);
  const panel=document.createElement('div');panel.className='sbi-chassis-create-panel';panel.setAttribute('aria-hidden','true');
  wrapper.appendChild(panel);
  const avatar=header.querySelector('.avatar');
  if(avatar)header.insertBefore(wrapper,avatar);else header.appendChild(wrapper);
  initSbiChassisCreateSuggestion(form.querySelector('input'),wrapper,panel);
}

/* SBI shared account header — consistent across pages */
(function(){
  if(document.getElementById('sbiSharedHeaderSkin'))return;
  const s=document.createElement('style');s.id='sbiSharedHeaderSkin';
  s.textContent=`
    header.top{
      min-height:76px;height:auto;padding:10px 22px;gap:14px;
      background:#102f4b;border-top:3px solid #1689e8;
      border-radius:0 0 16px 16px;
      box-shadow:0 7px 22px rgba(16,47,75,.12);
    }
    header.top .brand{flex:0 1 220px;min-width:0}
    header.top .sbi-global-search-wrap{flex:1;min-width:120px;max-width:620px}
    header.top .sbi-global-searchbar{border-radius:12px}
    header.top .user-menu-wrap{margin-left:0}
    header.top .user-menu-button,
    .professional-dashboard .user-menu-button{
      min-width:0;min-height:42px;padding:4px 12px 4px 7px;gap:9px;
      border:1px solid rgba(255,255,255,.14);border-radius:999px;
      background:rgba(255,255,255,.08);color:#fff;
      transition:background .16s ease,border-color .16s ease;
    }
    header.top .user-menu-button:hover,
    .professional-dashboard .user-menu-button:hover{
      background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.28)
    }
    header.top .user-circle,
    .professional-dashboard .user-circle{
      width:36px;height:36px;flex:0 0 36px;border:0;
      background:#1689e8;color:#fff;font-size:17px
    }
    header.top .user-menu-name b,
    .professional-dashboard .user-menu-name b{font-size:13px;color:#fff}
    header.top .user-menu-name small,
    .professional-dashboard .user-menu-name small{font-size:10px;color:#c1d3e3}
    header.top .user-menu-chevron,
    .professional-dashboard .user-menu-chevron{color:#dce9f5}
    header.top .user-menu,
    .professional-dashboard .user-menu{
      border:1px solid #dce6ef;border-radius:12px;
      box-shadow:0 14px 34px rgba(10,35,58,.22);overflow:hidden
    }
    .notification-bell{
      width:42px;height:42px;border-radius:12px;
      border:1px solid rgba(255,255,255,.16);
      background:rgba(255,255,255,.08);color:#fff;
      display:inline-flex;align-items:center;justify-content:center
    }
    .notification-bell svg{width:20px;height:20px}
    .notification-count{right:-3px;top:-4px;min-width:16px;height:16px;font-size:10px;border:2px solid #102f4b}
    @media(max-width:800px){
      header.top{min-height:64px;padding:8px 10px;gap:8px;border-radius:0 0 13px 13px}
      header.top .brand{flex:0 1 105px;max-width:105px}
      header.top .brand .site-logo{max-width:100%;height:auto}
      header.top .sbi-global-search-wrap{min-width:0}
      header.top .user-menu-button{width:auto;min-width:42px;padding:3px 7px}
      header.top .user-menu-name,header.top .user-menu-chevron{display:none}
      .professional-dashboard .user-menu-button{width:42px;min-width:42px;height:42px;padding:3px;justify-content:center}
    }
  `;
  (document.head||document.documentElement).appendChild(s);
})();

document.addEventListener('DOMContentLoaded',()=>{
  // Use the exact dashboard hamburger drawer on every page.
  document.querySelectorAll('.overlay').forEach((ov,i)=>{
    ov.id=i?'mobileMenu'+i:'mobileMenu';
    const side=ov.querySelector('.side');
    if(side && !side.classList.contains('mobile-notifications-sidebar') && !side.classList.contains('dash-sidebar')){
      side.classList.add('dashboard-mobile-drawer');
      // Keep the drawer shell separate from the desktop data-nav container so the close button survives rendering.
      side.removeAttribute('data-nav');
      side.innerHTML=`<div class="mobile-drawer-title" aria-hidden="false"><span class="mobile-drawer-title-text">Menu</span>
        <button type="button" class="mobile-drawer-close dashboard-menu-close" aria-label="Fermer le menu" title="Fermer le menu">×</button></div>
        <nav class="dash-nav" data-nav aria-label="Navigation principale"></nav>`;
    }
  });
  document.querySelectorAll('[data-nav]').forEach(x=>{
    x.innerHTML=menuHTML();
    // Admin-only links must be available in the shared navigation on every page,
    // not only through dashboard quick actions. The final role check still lives
    // in app.js; this simply syncs the freshly-rendered menu as soon as the
    // shared shell is mounted.
    if(typeof isAdmin==='function') x.querySelectorAll('.admin-only-nav').forEach(el=>el.classList.toggle('hidden',!isAdmin()));
  });
  wireNavGroups();
  initSiteGlobalSearch();
  document.querySelectorAll('.menu-btn').forEach(btn=>{btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','mobileMenu');});
  document.querySelectorAll('.overlay').forEach((ov,i)=>{
    const side=ov.querySelector('.side');
    const close=side?.querySelector('.mobile-drawer-close');
    if(close) close.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();closeMobileMenu();},{passive:false});
    ov.querySelectorAll('.nav a').forEach(a=>{
      a.addEventListener('click',handleMobileNavClick);
    });
  });
  // The hamburger menu renders Déconnexion as an anchor with href="#".
  // Wire it explicitly so both desktop and mobile navigation use the same
  // real logout flow as the user dropdown.
  document.querySelectorAll('.logout-link').forEach(a=>{
    if(a.dataset.logoutWired==='1')return;
    a.dataset.logoutWired='1';
    a.addEventListener('click',async e=>{
      e.preventDefault();
      e.stopPropagation();
      a.classList.add('tap-active');
      try{
        closeMobileMenu();
        if(typeof logout==='function') await logout();
        else location.href='index.html';
      }catch(err){
        location.href='index.html';
      }
    });
  });
  document.querySelectorAll('.overlay').forEach((ov)=>{
    const side=ov.querySelector('.dashboard-mobile-drawer');
    if(!side) return;
    let touchStartX=0, touchStartY=0;
    side.addEventListener('touchstart',(e)=>{
      const t=e.changedTouches?.[0];
      if(!t) return;
      touchStartX=t.clientX; touchStartY=t.clientY;
    },{passive:true});
    side.addEventListener('touchend',(e)=>{
      const t=e.changedTouches?.[0];
      if(!t) return;
      const dx=t.clientX-touchStartX, dy=t.clientY-touchStartY;
      if(dx < -70 && Math.abs(dx) > Math.abs(dy)*1.2) closeMobileMenu();
    },{passive:true});
  });
  document.querySelectorAll('.brand').forEach(el=>{el.innerHTML='<img class="site-logo" src="assets/sbi-benouatas-logo.webp?v=20261015f" alt="SBI BENOUATAS INDUSTRIE · ALGÉRIE">';});
  document.querySelectorAll('.avatar').forEach(el=>{
    const wrap=document.createElement('div');
    wrap.className='user-menu-wrap';
    wrap.innerHTML=`<button class="user-menu-button" type="button" onclick="toggleUserMenu();event.stopPropagation()" aria-label="Menu utilisateur"><span class="user-circle" id="userTopAvatar">U</span><span class="user-menu-name"><b id="userTopName">Utilisateur</b><small id="userTopRole">Utilisateur</small></span><span class="user-menu-chevron">⌄</span></button><div id="userMenu" class="user-menu hidden"><a href="profile.html">👤&nbsp; Mon profil</a><a id="userMenuAdmin" class="hidden" href="gestion.html">👥&nbsp; Gestion utilisateurs</a><button type="button" onclick="logout()">↪&nbsp; Déconnexion</button></div>`;
    el.replaceWith(wrap);
  });
  nav();
  initDashboardHoverSidebar();
  document.querySelectorAll('.overlay').forEach(ov=>{
    ov.addEventListener('click',e=>{if(e.target===ov)closeMobileMenu()});
    ov.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>closeMobileMenu()));
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileMenu()});
  window.addEventListener('resize',()=>{if(window.innerWidth>800)closeMobileMenu()});
});


/* SBI SMART FILTER — enhances existing filter controls without replacing page logic. */
(function(){
  function smartFilterStyles(){
    if(document.getElementById('sbiSmartFilterStyles'))return;
    const style=document.createElement('style');
    style.id='sbiSmartFilterStyles';
    style.textContent=[
      '.sbi-smart-filter-panel{box-sizing:border-box;min-width:0;margin:0 0 14px;padding:15px;border:1px solid #d7e3ef;border-radius:15px;background:linear-gradient(180deg,#fff 0%,#f8fbff 100%);box-shadow:0 4px 18px rgba(18,56,88,.045)}',
      '.sbi-smart-filter-head{display:flex;align-items:center;gap:11px;min-width:0;margin:0 0 13px}',
      '.sbi-smart-filter-mark{display:grid;place-items:center;flex:0 0 40px;height:40px;border-radius:11px;background:#eaf3ff;color:#155b9a}',
      '.sbi-smart-filter-mark svg{width:21px;height:21px;display:block}',
      '.sbi-smart-filter-heading{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}',
      '.sbi-smart-filter-heading strong{font-size:15px;line-height:1.3;color:#183b5a;font-weight:800}',
      '.sbi-smart-filter-heading small{font-size:12px;line-height:1.4;color:#6b7e91}',
      '.sbi-smart-filter-head-actions{display:flex;align-items:center;gap:8px;flex:0 0 auto}',
      '.sbi-smart-filter-count{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:0 10px;border-radius:999px;background:#edf3f9;color:#385875;font-size:11px;font-weight:800;white-space:nowrap}',
      '.sbi-smart-filter-reset{border:1px solid #d5e0ea!important;border-radius:9px!important;background:#fff!important;color:#31516e!important;padding:8px 11px!important;font-size:12px!important;font-weight:700!important;white-space:nowrap;cursor:pointer}',
      '.sbi-smart-filter-panel input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]),.sbi-smart-filter-panel select{box-sizing:border-box;min-width:0;max-width:100%;min-height:42px;border-radius:10px}',
      '.sbi-smart-filter-panel .filter-grid,.sbi-smart-filter-panel .prep-filter-grid,.sbi-smart-filter-panel .pl-filter-grid{margin-top:0!important;margin-bottom:0!important}',
      '.sbi-smart-filter-panel .sbi-smart-filter-chips{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:12px;min-width:0}',
      '.sbi-smart-filter-chip{display:inline-flex;align-items:center;gap:8px;max-width:100%;border:1px solid #cfe0f2;border-radius:999px;background:#f0f7ff;color:#214c70;padding:6px 10px;font-size:12px;line-height:1.25;cursor:pointer}',
      '.sbi-smart-filter-chip-label{min-width:0;overflow-wrap:anywhere}',
      '.sbi-smart-filter-chip-x{font-size:16px;line-height:12px;font-weight:700;color:#52718c}',
      '.sbi-smart-filter-empty{font-size:12px;color:#8998a8;padding:2px 0}',
      '.sbi-smart-filter-panel .global-search-form{margin:0}',
      '.sbi-smart-filter-panel .global-search-actions{align-self:end}',
      '.sbi-smart-filter-panel .global-search-date-tip{margin-top:10px}',
      '.sbi-smart-filter-panel .search{width:100%;box-sizing:border-box}',
      '.sbi-smart-filter-panel #globalQuery,.sbi-smart-filter-panel input[name="globalQuery"],.sbi-smart-filter-panel .global-search-form input[type="search"],.sbi-smart-filter-panel .global-search-form input[type="text"]{display:block;width:100%!important;max-width:100%;min-width:0;min-height:56px!important;padding:14px 16px!important;font-size:18px!important;line-height:1.35;border:1px solid #cbd8e3;border-radius:14px!important;box-sizing:border-box}',
      '@media(max-width:650px){.sbi-smart-filter-panel #globalQuery,.sbi-smart-filter-panel input[name="globalQuery"],.sbi-smart-filter-panel .global-search-form input[type="search"],.sbi-smart-filter-panel .global-search-form input[type="text"]{min-height:58px!important;font-size:18px!important;padding:15px 16px!important}}',
      '@media(max-width:650px){.sbi-smart-filter-panel{padding:12px;border-radius:12px}.sbi-smart-filter-head{align-items:flex-start;gap:9px}.sbi-smart-filter-mark{flex-basis:36px;height:36px}.sbi-smart-filter-heading strong{font-size:14px}.sbi-smart-filter-heading small{font-size:11px}.sbi-smart-filter-head-actions{gap:5px;flex-direction:column;align-items:flex-end}.sbi-smart-filter-count{min-height:24px;padding:0 8px}.sbi-smart-filter-reset{padding:7px 8px!important;font-size:11px!important}.sbi-smart-filter-chip{font-size:11px;padding:6px 8px}}'
    ].join('');
    (document.head||document.documentElement).appendChild(style);
  }
  const excludedIds=new Set(['globalSortBy','globalSortOrder']);
  function labelFor(el){
    const known={globalQuery:'Mot-clé',globalFrom:'Date du',globalTo:'Date au',globalStatus:'Statut',globalStock:'Stock',globalEngine:'Moteur',globalCapacity:'Capacité',globalHeight:'Hauteur de levage',globalMast:'Type de mât',globalClient:'Client',stockSearch:'Recherche',search:'Recherche',prepSearch:'Recherche',plSearch:'Recherche',affSearch:'Recherche',modSearch:'Recherche',deliveredSearch:'Recherche',auditSearch:'Recherche',returnSearch:'Recherche',historySearch:'Recherche'};
    if(known[el.id])return known[el.id];
    const lbl=el.id?document.querySelector('label[for="'+el.id+'"]'):null;
    const raw=(lbl?.textContent||el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.id||'Filtre').trim();
    return raw.replace(/[.…]+$/,'').trim()||'Filtre';
  }
  function valueFor(el){
    if(!el||excludedIds.has(el.id)||el.disabled)return '';
    if(el.tagName==='SELECT'){
      const value=String(el.value||'').trim();
      const option=el.options?.[el.selectedIndex];
      const text=String(option?.textContent||value).trim();
      if(!value)return '';
      if(el.selectedIndex===0&&/^(tous|toutes|statut\s*:\s*tous|moteur\s*:\s*tous|capacité\s*:\s*toutes|mât\s*:\s*tous|hauteur\s*:\s*toutes|stock\s*:\s*tous|étape\s*:\s*toutes|sélectionner|choisir)/i.test(text))return '';
      return text;
    }
    return String(el.value||'').trim();
  }
  function dispatchFilterChange(el){
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function initPanel(key,nodes){
    nodes=(nodes||[]).filter(Boolean);
    if(!nodes.length||nodes.some(n=>n.dataset.sbiSmartFilterWrapped==='1'))return;
    const parent=nodes[0].parentElement;
    if(!parent||nodes.some(n=>n.parentElement!==parent))return;
    const panel=document.createElement('section');
    panel.className='sbi-smart-filter-panel';
    panel.dataset.sbiSmartFilter=key;
    panel.setAttribute('aria-label','Smart Filter');
    const head=document.createElement('div');
    head.className='sbi-smart-filter-head';
    head.innerHTML='<div class="sbi-smart-filter-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M7 12h10M10 17h4"/><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/></svg></div><div class="sbi-smart-filter-heading"><strong>Smart Filter</strong><small>Combinez les critères pour affiner les résultats</small></div><div class="sbi-smart-filter-head-actions"><span class="sbi-smart-filter-count" aria-live="polite">0 actif</span></div>';
    const chips=document.createElement('div');
    chips.className='sbi-smart-filter-chips';
    chips.setAttribute('aria-live','polite');
    panel.appendChild(head);
    parent.insertBefore(panel,nodes[0]);
    nodes.forEach(node=>{node.dataset.sbiSmartFilterWrapped='1';panel.appendChild(node)});
    panel.appendChild(chips);
    let controls=()=>Array.from(panel.querySelectorAll('input,select')).filter(el=>!el.disabled&&el.type!=='hidden'&&el.type!=='button'&&el.type!=='submit'&&el.type!=='reset'&&!excludedIds.has(el.id));
    const resetExisting=panel.querySelector('button[type="reset"],button[id*="reset" i],button[id*="clear" i],input[type="reset"]');
    if(!resetExisting){
      const reset=document.createElement('button');
      reset.type='button';reset.className='sbi-smart-filter-reset';reset.textContent='Réinitialiser';
      reset.addEventListener('click',()=>{
        controls().forEach(el=>{if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';dispatchFilterChange(el)});
        renderChips();
      });
      head.querySelector('.sbi-smart-filter-head-actions').appendChild(reset);
    }else resetExisting.classList.add('sbi-smart-filter-reset');
    function renderChips(){
      const active=controls().map(el=>({el,label:labelFor(el),value:valueFor(el)})).filter(x=>x.value);
      head.querySelector('.sbi-smart-filter-count').textContent=active.length+' filtre'+(active.length>1?'s':'')+' actif'+(active.length>1?'s':'');
      chips.replaceChildren();
      if(!active.length){
        const empty=document.createElement('span');empty.className='sbi-smart-filter-empty';empty.textContent='Aucun filtre actif. Choisissez un ou plusieurs critères.';chips.appendChild(empty);return;
      }
      active.forEach(item=>{
        const chip=document.createElement('button');
        chip.type='button';chip.className='sbi-smart-filter-chip';
        chip.title='Retirer le filtre : '+item.label;
        const text=document.createElement('span');text.className='sbi-smart-filter-chip-label';text.textContent=item.label+' : '+item.value;
        const x=document.createElement('span');x.className='sbi-smart-filter-chip-x';x.setAttribute('aria-hidden','true');x.textContent='×';
        chip.append(text,x);
        chip.addEventListener('click',()=>{
          if(item.el.tagName==='SELECT')item.el.selectedIndex=0;else item.el.value='';
          dispatchFilterChange(item.el);renderChips();
        });
        chips.appendChild(chip);
      });
    }
    controls().forEach(el=>{
      ['input','change','search'].forEach(eventName=>el.addEventListener(eventName,renderChips));
    });
    renderChips();
  }
  function initSmartFilters(){
    smartFilterStyles();
    const $=selector=>document.querySelector(selector);
    function siblingSearchGroup(inputSelector,gridClass){
      const input=$(inputSelector);if(!input)return;
      const parent=input.parentElement;
      const grid=Array.from(parent?.children||[]).find(n=>n.classList?.contains(gridClass));
      initPanel(input.id||inputSelector.replace('#',''),[input,grid].filter(Boolean));
    }
    const globalForm=$('#globalSearchForm');
    if(globalForm)initPanel('global-search',[globalForm]);
    siblingSearchGroup('#stockSearch','filter-grid');
    siblingSearchGroup('#search','filter-grid');
    const prep=$('#prepSearch')?.closest('.prep-filter-grid');
    if(prep)initPanel('preparation-livraison',[prep]);
    const planned=$('#plSearch')?.closest('.pl-filter-grid');
    if(planned)initPanel('livraisons-prevues',[planned]);
    const aff=$('#affSearch')?.closest('.filter-grid');
    if(aff)initPanel('affectation', [aff]);
    const mod=$('#modSearch')?.closest('.filter-grid');
    if(mod)initPanel('modification-production',[mod]);
    const audit=$('#auditSearch')?.closest('.audit-filters');
    if(audit)initPanel('controle-fiches',[audit]);
    const returns=$('#returnSearch')?.closest('.return-toolbar');
    if(returns)initPanel('retours-sav',[returns]);
    const delivered=$('#deliveredSearch');
    if(delivered)initPanel('chariots-livres',[delivered]);
    const history=$('#historySearch');
    if(history&&!history.closest('.sbi-smart-filter-panel')){
      const group=history.closest('.filter-grid,.history-toolbar,.search-toolbar')||history;
      initPanel('historique',[group]);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSmartFilters,{once:true});
  else initSmartFilters();
})();
