(function(){
  const touchDevice = navigator.maxTouchPoints > 0;
  const smallScreen = Math.min(window.screen?.width || 9999, window.screen?.height || 9999) <= 800;
  const narrowViewport = window.innerWidth <= 800;
  if (touchDevice && (smallScreen || narrowViewport)) document.documentElement.classList.add('mobile-device');
})();

function menuHTML(){return `<div class="nav"><a href="dashboard.html">⌂ <span>Tableau de bord</span></a><a href="chariots.html">▣ <span>Chariots</span></a><a href="nouveau-chariot.html">＋ <span>Nouveau chariot</span></a><a href="stock.html">▰ <span>Chariots en stock</span></a><a href="livres.html">▣ <span>Chariots livrés</span></a><a href="qr-codes.html">▦ <span>QR Codes</span></a><a href="historique.html">↶ <span>Historique</span></a><a href="gestion.html">♟ <span>Gestion utilisateurs</span></a><a href="licence.html">▣ <span>Licence</span></a><a href="#" onclick="logout();return false" style="color:#d62d39">↪ <span>Déconnexion</span></a></div>`}
function nav(){const page=location.pathname.split('/').pop()||'dashboard.html';document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===page))}
function toggleMenu(){document.querySelector('.overlay')?.classList.toggle('open')}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-nav]').forEach(x=>x.innerHTML=menuHTML());nav();document.querySelector('.overlay')?.addEventListener('click',e=>{if(e.target.classList.contains('overlay'))toggleMenu()})});
