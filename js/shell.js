(function(){
  const touchDevice = navigator.maxTouchPoints > 0;
  const smallScreen = Math.min(window.screen?.width || 9999, window.screen?.height || 9999) <= 800;
  const narrowViewport = window.innerWidth <= 800;
  if (touchDevice && (smallScreen || narrowViewport)) document.documentElement.classList.add('mobile-device');
})();

function menuHTML(){return `<div class="nav dash-menu"><a href="dashboard.html"><span class="nav-icon">⌂</span><span>Tableau de bord</span></a><a href="chariots.html"><span class="nav-icon">♧</span><span>Tous les chariots</span></a><a href="stock.html"><span class="nav-icon">◇</span><span>Chariots en stock</span></a><a href="livres.html"><span class="nav-icon">▰</span><span>Chariots livrés</span></a><a href="nouveau-chariot.html"><span class="nav-icon">⊕</span><span>Nouveau chariot</span></a><div class="nav-separator"></div><a href="historique.html"><span class="nav-icon">▤</span><span>Historique</span></a><a href="preparation-livraison.html"><span class="nav-icon">▰</span><span>Préparation livraison</span></a><a href="export.html"><span class="nav-icon">⇩</span><span>Export Excel / PDF</span></a><a href="gestion.html"><span class="nav-icon">♟</span><span>Gestion utilisateurs</span></a><a href="licence.html"><span class="nav-icon">⚙</span><span>Paramètres</span></a><a href="#" onclick="logout();return false" class="logout-link"><span class="nav-icon">↪</span><span>Déconnexion</span></a></div>`}
function nav(){const page=location.pathname.split('/').pop()||'dashboard.html';document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===page))}
function toggleMenu(){document.querySelector('.overlay')?.classList.toggle('open')}
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-nav]').forEach(x=>x.innerHTML=menuHTML());
  document.querySelectorAll('.brand').forEach(el=>{el.innerHTML='<img class="site-logo" src="assets/logo-sbi-hangcha.png" alt="SBI HANGCHA">';});
  document.querySelectorAll('.avatar').forEach(el=>{
    const wrap=document.createElement('div');
    wrap.className='user-menu-wrap';
    wrap.innerHTML=`<button class="user-menu-button" type="button" onclick="toggleUserMenu();event.stopPropagation()" aria-label="Menu utilisateur"><span class="user-circle" id="userTopAvatar">U</span><span class="user-menu-name"><b id="userTopName">Utilisateur</b><small id="userTopRole">Utilisateur</small></span><span class="user-menu-chevron">⌄</span></button><div id="userMenu" class="user-menu hidden"><a href="profile.html">👤&nbsp; Profil</a><a id="userMenuAdmin" class="hidden" href="gestion.html">👥&nbsp; Gestion utilisateurs</a><button type="button" onclick="logout()">↪&nbsp; Déconnexion</button></div>`;
    el.replaceWith(wrap);
  });
  nav();
  document.querySelector('.overlay')?.addEventListener('click',e=>{if(e.target.classList.contains('overlay'))toggleMenu()});
});
