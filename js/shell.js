(function(){
  const touchDevice = navigator.maxTouchPoints > 0;
  const smallScreen = Math.min(window.screen?.width || 9999, window.screen?.height || 9999) <= 800;
  const narrowViewport = window.innerWidth <= 800;
  if (touchDevice && (smallScreen || narrowViewport)) document.documentElement.classList.add('mobile-device');
})();

function menuHTML(){return `<div class="nav dash-menu"><a href="dashboard.html"><span class="nav-icon">⌂</span><span>Tableau de bord</span></a><a href="chariots.html"><span class="nav-icon">♧</span><span>Tous les chariots</span></a><a href="stock.html"><span class="nav-icon">◇</span><span>Chariots en stock</span></a><a href="livres.html"><span class="nav-icon">▰</span><span>Chariots livrés</span></a><a href="nouveau-chariot.html"><span class="nav-icon">⊕</span><span>Nouveau chariot</span></a><div class="nav-separator"></div><a href="historique.html"><span class="nav-icon">⚒</span><span>Maintenance</span></a><a href="chariot.html"><span class="nav-icon">▣</span><span>Photos / Documents</span></a><a href="nouveau-chariot.html"><span class="nav-icon">▣</span><span>Préparation livraison</span></a><a href="qr-codes.html"><span class="nav-icon">⇩</span><span>Export Excel / PDF</span></a><a href="gestion.html"><span class="nav-icon">♟</span><span>Gestion utilisateurs</span></a><a href="licence.html"><span class="nav-icon">⚙</span><span>Paramètres</span></a><a href="#" onclick="logout();return false" class="logout-link"><span class="nav-icon">↪</span><span>Déconnexion</span></a></div>`}
function nav(){const page=location.pathname.split('/').pop()||'dashboard.html';document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===page))}
function toggleMenu(){document.querySelector('.overlay')?.classList.toggle('open')}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-nav]').forEach(x=>x.innerHTML=menuHTML());nav();document.querySelector('.overlay')?.addEventListener('click',e=>{if(e.target.classList.contains('overlay'))toggleMenu()})});
