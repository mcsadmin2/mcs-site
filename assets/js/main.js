/* MCS — comportements du site (toutes les pages) */
window.MCSDemarrer = function(){
  if (window.MCSDemarre) return; window.MCSDemarre = true;
  /* Toujours ouvrir une page en haut (sauf lien vers une ancre précise) */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch(e){}
  function hautDePage(){
    var id = location.hash && location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : '';
    var cible = id ? document.getElementById(id) : null;
    var html = document.documentElement, ancien = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    if (cible) { var y = cible.getBoundingClientRect().top + scrollY - 96; window.scrollTo(0, Math.max(0, y)); }
    else window.scrollTo(0, 0);
    html.style.scrollBehavior = ancien;
  }
  hautDePage();
  addEventListener('DOMContentLoaded', hautDePage);
  addEventListener('load', function(){ hautDePage(); setTimeout(hautDePage, 60); });
  addEventListener('pageshow', function(e){ if (!e.persisted) hautDePage(); });

  var D = window.MCS || {};
  var I = D.infos || {};
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fin = matchMedia('(pointer: fine)').matches;
  var clamp = function(v,a,b){ return Math.max(a, Math.min(b, v)); };
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var param = function(n){ try { return new URLSearchParams(location.search).get(n); } catch(e){ return null; } };
  var METIERS = { 'construction': 'Construction', 'gros-oeuvre': 'Gros œuvre', 'finition': 'Finition' };
  var FLECHE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ---------------- Illustrations (en attendant les photos) ---------------- */
  var DESSINS = {
    villa: '<rect width="400" height="300" fill="#B9E2F6"/><circle cx="335" cy="60" r="22" fill="#EDC23B"/><rect y="240" width="400" height="60" fill="#0C2D63"/><rect x="60" y="120" width="280" height="120" fill="#F4F8FC"/><rect x="50" y="110" width="300" height="12" fill="#0C2D63"/><rect x="190" y="70" width="130" height="42" fill="#E6F0F8"/><rect x="184" y="62" width="142" height="9" fill="#0C2D63"/><rect x="80" y="145" width="90" height="60" fill="#2C66B0"/><rect x="200" y="145" width="110" height="95" fill="#2C66B0"/><rect y="240" width="400" height="4" fill="#EDC23B"/><circle cx="35" cy="232" r="24" fill="#1E5A3C"/>',
    immeuble: '<rect width="400" height="300" fill="#7CC8EF"/><rect x="120" y="40" width="160" height="230" fill="#F4F8FC"/><g fill="#2C66B0"><rect x="140" y="60" width="50" height="34"/><rect x="210" y="60" width="50" height="34"/><rect x="140" y="110" width="50" height="34"/><rect x="210" y="110" width="50" height="34"/><rect x="140" y="160" width="50" height="34"/><rect x="210" y="160" width="50" height="34"/></g><rect x="175" y="215" width="50" height="55" fill="#0C2D63"/><rect y="270" width="400" height="30" fill="#0C2D63"/><rect x="120" y="34" width="160" height="8" fill="#EDC23B"/>',
    immeuble2: '<rect width="400" height="300" fill="#B9E2F6"/><rect x="70" y="70" width="120" height="200" fill="#F4F8FC"/><rect x="200" y="30" width="130" height="240" fill="#E6F0F8"/><g fill="#2C66B0"><rect x="85" y="90" width="38" height="28"/><rect x="137" y="90" width="38" height="28"/><rect x="85" y="135" width="38" height="28"/><rect x="137" y="135" width="38" height="28"/><rect x="85" y="180" width="38" height="28"/><rect x="137" y="180" width="38" height="28"/></g><g fill="#114B9D"><rect x="215" y="50" width="100" height="22"/><rect x="215" y="90" width="100" height="22"/><rect x="215" y="130" width="100" height="22"/><rect x="215" y="170" width="100" height="22"/></g><rect x="245" y="215" width="40" height="55" fill="#0C2D63"/><rect y="270" width="400" height="30" fill="#0C2D63"/><rect y="270" width="400" height="4" fill="#EDC23B"/>',
    structure: '<rect width="400" height="300" fill="#B9E2F6"/><rect y="240" width="400" height="60" fill="#5B4A3A"/><g fill="#F4F8FC"><rect x="80" y="80" width="14" height="160"/><rect x="190" y="80" width="14" height="160"/><rect x="300" y="80" width="14" height="160"/><rect x="70" y="160" width="260" height="12"/><rect x="70" y="80" width="260" height="12"/></g><path d="M360 240V40H210M260 40V90" stroke="#EDC23B" stroke-width="5" fill="none"/><rect x="248" y="90" width="24" height="16" fill="#EDC23B"/>',
    interieur: '<rect width="400" height="300" fill="#F7FAFC"/><rect y="210" width="400" height="90" fill="#D9C7AE"/><g stroke="#C4AF92" stroke-width="2"><path d="M0 250H400M150 210L120 300M280 210L310 300"/></g><rect x="40" y="40" width="130" height="150" fill="#B9E2F6" stroke="#0C2D63" stroke-width="6"/><path d="M105 40V190M40 115H170" stroke="#0C2D63" stroke-width="4"/><rect x="210" y="150" width="160" height="60" rx="10" fill="#2C66B0"/><rect x="220" y="125" width="60" height="32" rx="10" fill="#7CC8EF"/><path d="M320 20V70" stroke="#0C2D63" stroke-width="2"/><path d="M300 70H340L333 90H307Z" fill="#EDC23B"/>',
    duplex: '<rect width="400" height="300" fill="#7CC8EF"/><rect y="250" width="400" height="50" fill="#0C2D63"/><rect x="50" y="100" width="300" height="150" fill="#F4F8FC"/><rect x="40" y="92" width="320" height="10" fill="#0C2D63"/><rect x="40" y="170" width="320" height="8" fill="#0C2D63"/><g fill="#2C66B0"><rect x="70" y="115" width="70" height="45"/><rect x="165" y="115" width="70" height="45"/><rect x="260" y="115" width="70" height="45"/><rect x="70" y="190" width="70" height="45"/><rect x="260" y="190" width="70" height="60"/></g><rect x="175" y="190" width="50" height="60" fill="#114B9D"/><g stroke="#EDC23B" stroke-width="3"><path d="M30 250V60M44 250V60M30 90H44M30 130H44M30 170H44M30 210H44"/></g>',
    facade: '<rect width="400" height="300" fill="#7CC8EF"/><rect y="240" width="400" height="60" fill="#0C2D63"/><rect x="40" y="130" width="320" height="110" fill="#F4F8FC"/><g fill="#2C66B0"><rect x="60" y="150" width="60" height="70"/><rect x="140" y="150" width="60" height="70"/><rect x="220" y="150" width="60" height="70"/></g><rect x="290" y="150" width="50" height="90" fill="#0C2D63"/><rect x="40" y="122" width="320" height="10" fill="#EDC23B"/>',
    maison: '<rect width="400" height="300" fill="#B9E2F6"/><rect y="250" width="400" height="50" fill="#4F8A5B"/><rect x="70" y="150" width="260" height="100" fill="#FFFFFF"/><path d="M50 154L200 80L350 154Z" fill="#114B9D"/><rect x="175" y="190" width="50" height="60" fill="#0C2D63"/><rect x="95" y="175" width="50" height="40" fill="#7CC8EF"/><rect x="255" y="175" width="50" height="40" fill="#7CC8EF"/>',
    terrain: '<rect width="400" height="300" fill="#B9E2F6"/><rect y="170" width="400" height="130" fill="#7FA36A"/><path d="M60 290L120 190H330L370 290Z" fill="#9CBF83" stroke="#EDC23B" stroke-width="3" stroke-dasharray="10 8"/><g fill="#0C2D63"><rect x="117" y="182" width="6" height="16"/><rect x="327" y="182" width="6" height="16"/><rect x="57" y="280" width="6" height="16"/><rect x="367" y="280" width="6" height="16"/></g><circle cx="40" cy="160" r="26" fill="#1E5A3C"/><circle cx="370" cy="150" r="22" fill="#1E5A3C"/><rect x="230" y="90" width="110" height="50" fill="#EDC23B"/><text x="285" y="122" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="17" fill="#0C2D63">À VENDRE</text><rect x="281" y="140" width="8" height="40" fill="#0C2D63"/>',
    plan: '<rect width="400" height="300" fill="#7CC8EF"/><rect x="90" y="50" width="220" height="200" fill="#F4F8FC"/><g stroke="#2C66B0" stroke-width="4" fill="none"><path d="M115 75H285V225H115Z"/><path d="M200 75V150H285M115 170H170V225"/></g><path d="M300 210L340 170L352 182L312 222L296 226Z" fill="#EDC23B"/><circle cx="300" cy="60" r="22" fill="#EDC23B"/>',
    logo: '<rect width="400" height="300" fill="#B9E2F6"/><rect x="140" y="60" width="120" height="120" rx="24" fill="#F4F8FC"/><path d="M170 140L200 90L230 140Z" fill="#2C66B0"/><rect x="170" y="148" width="60" height="8" fill="#EDC23B"/><rect y="215" width="400" height="85" fill="#0C2D63"/>'
  };
  function illus(k){ return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + (DESSINS[k] || DESSINS.villa) + '</svg>'; }
  function media(o){ return o.image ? '<img src="' + esc(o.image) + '" alt="' + esc(o.titre || '') + '" loading="lazy">' : illus(o.illustration); }
  $$('svg[data-ill]').forEach(function(s){ s.outerHTML = illus(s.getAttribute('data-ill')); });

  /* ---------------- Coordonnées partout ---------------- */
  var waNum = (I.whatsapp || '').replace(/\D/g, '');
  function lienWa(texte){ return waNum ? 'https://wa.me/' + waNum + (texte ? '?text=' + encodeURIComponent(texte) : '') : 'contact.html#formulaire'; }
  $$('[data-info]').forEach(function(el){ var v = I[el.dataset.info]; if (v != null && v !== '') el.textContent = v; });
  $$('[data-lien]').forEach(function(el){
    var t = el.dataset.lien;
    if (t === 'tel' && /\d/.test(I.telephone || '')) el.href = 'tel:' + I.telephone.replace(/[^\d+]/g, '');
    if (t === 'email' && /@/.test(I.email || '')) el.href = 'mailto:' + I.email;
    if (t === 'whatsapp') { el.href = lienWa('Bonjour MCS, je souhaite échanger sur mon projet.'); if (waNum) { el.target = '_blank'; el.rel = 'noopener'; } }
  });
  // Blocs masqués tant que l'information n'est pas renseignée (ex. email)
  $$('[data-si]').forEach(function(el){ var v = I[el.dataset.si] || ''; if (!v || /^\[/.test(v)) el.remove(); });
  // Carte Google Maps
  $$('[data-carte]').forEach(function(z){
    var q = encodeURIComponent(I.carte || I.adresse || 'Abidjan');
    var f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=' + q + '&z=17&hl=fr&output=embed'; f.loading = 'lazy'; f.title = 'Plan d’accès MCS'; f.referrerPolicy = 'no-referrer-when-downgrade';
    f.onload = function(){ z.classList.add('carte-ok'); };
    z.appendChild(f);
    $$('[data-itineraire]').forEach(function(a){ a.href = I.lienCarte || ('https://www.google.com/maps/search/?api=1&query=' + q); a.target = '_blank'; a.rel = 'noopener'; });
  });
  $$('[data-reseau]').forEach(function(el){ var u = I[el.dataset.reseau]; if (u) { el.href = u; el.target = '_blank'; el.rel = 'noopener'; } else el.remove(); });
  var P = D.planning || {};
  $$('[data-planning]').forEach(function(el){ var k = el.dataset.planning; if (k === 'barre') el.style.width = clamp(+P.remplissage || 0, 0, 100) + '%'; else if (P[k] != null) el.textContent = P[k]; });
  $$('.annee').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* ---------------- Accès discret à l'administration ----------------
     Aucun lien visible. Accès par l'adresse /admin, par #admin à la fin
     de l'adresse, ou par 5 appuis rapides sur le logo du pied de page. */
  (function(){
    function versAdmin(){ location.href = 'admin/index.html'; }
    if (/^#admin$/i.test(location.hash)) versAdmin();
    addEventListener('hashchange', function(){ if (/^#admin$/i.test(location.hash)) versAdmin(); });
    var logo = document.querySelector('footer .logo-pied'), n = 0, t = 0;
    if (logo) logo.addEventListener('click', function(){ var now = Date.now(); n = (now - t < 700) ? n + 1 : 1; t = now; if (n >= 5) { n = 0; versAdmin(); } });
  })();

  /* ---------------- Contenus éditables depuis l'admin ---------------- */
  function photoMetier(k){ var M = D.metiersPhotos || {}; return M[k] || ('assets/img/metiers/' + k + '.jpg'); }
  (function(){
    // Diaporama de l'accueil
    var dp = D.diaporama || [];
    $$('.slide').forEach(function(sl, i){ var d = dp[i]; if (!d) return; var im = $('img', sl); if (im && d.image) { im.src = d.image; im.alt = d.alt || d.titre || ''; } });
    $$('.legende').forEach(function(l, i){ if (dp[i] && dp[i].legende) l.textContent = dp[i].legende; });
    $$('#puces button').forEach(function(b, i){ if (!dp[i] || !dp[i].titre) return; var sp = $('span', b), ii = $('i', b); b.textContent = ''; if (sp) b.appendChild(sp); b.appendChild(document.createTextNode(dp[i].titre)); if (ii) b.appendChild(ii); b.setAttribute('aria-label', 'Voir : ' + dp[i].titre); });
    // Photos des cartes métiers
    $$('.carte-metier').forEach(function(c){ var k = c.dataset.cle || (c.getAttribute('href') || '').replace('.html', ''), im = $('.cadre img', c); if (im && (D.metiersPhotos || {})[k]) im.src = D.metiersPhotos[k]; });
    // À propos
    var A = D.apropos || {};
    $$('[data-texte]').forEach(function(z){ var t = A[z.dataset.texte]; if (t && t.length) z.innerHTML = t.map(function(p){ return '<p>' + esc(p) + '</p>'; }).join(''); });
    $$('[data-photo="fondateur"]').forEach(function(im){ if (A.photoFondateur) im.src = A.photoFondateur; });
    // Questions fréquentes
    $$('[data-faq]').forEach(function(z){ var l = (D.faq || {})[z.dataset.faq]; if (!l) return; z.innerHTML = l.map(function(x){ return '<details><summary>' + esc(x.q) + '</summary><p>' + esc(x.r) + '</p></details>'; }).join(''); });
  })();

  /* ---------------- Suivi des actions (statistiques) ---------------- */
  function suivre(type, detail){ try { if (window.MCSStore) window.MCSStore.suivre(type, detail); } catch(e){} }
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a, button'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/wa\.me/.test(a.href || '') || a.dataset.lien === 'whatsapp' || a.classList.contains('wa')) suivre('whatsapp');
    else if (/^tel:/.test(h)) suivre('appel');
    else if (a.dataset.ouvrir) suivre(a.dataset.ouvrir.split('|')[3] === '3d' ? 'vue3d' : 'visionneuse', a.dataset.ouvrir.split('|')[0]);
  }, true);

  /* ---------------- Cartes ---------------- */
  function vide(v){ return v == null || v === '' || /^\[/.test(String(v)); }
  function compteMedias(p){
    var r = (p.rendus || []).length, pl = (p.plans || []).length, v = (p.videos || []).length + (p.photos || []).length, t = [];
    if (r) t.push(r + (r > 1 ? ' vues 3D' : ' vue 3D')); if (pl) t.push(pl + (pl > 1 ? ' plans' : ' plan')); if (v) t.push(v + (v > 1 ? ' médias' : ' média'));
    return t.join(' · ');
  }
  function badgeProjet(p){ return p.statut === 'en-cours' ? '<span class="badge en-cours">Chantier en cours</span>' : '<span class="badge">' + esc(p.type || METIERS[p.metier] || 'Projet') + '</span>'; }
  function carteProjet(p, tag){
    tag = tag || 'a';
    return '<' + tag + ' class="proj" href="projet.html?id=' + esc(p.id) + '" data-libelle="Voir" data-metier="' + esc(p.metier) + '">' +
      '<div class="cadre">' + media(p) + badgeProjet(p) + '</div>' +
      '<div class="info"><div><span class="sur-titre">' + (p.numero ? 'Projet ' + esc(p.numero) : (p.statut === 'en-cours' ? 'Chantier' : esc(METIERS[p.metier] || ''))) + '</span><h3>' + esc(p.titre) + '</h3>' + (vide(p.lieu) ? '' : '<span class="lieu">' + esc(p.lieu) + '</span>') + '</div>' +
      '<div class="delai">' + esc(compteMedias(p)) + '<b>' + (p.statut === 'en-cours' ? 'Voir le chantier' : 'Voir le projet') + '</b></div></div></' + tag + '>';
  }
  function vignette(p, liste, i, m){
    return '<button type="button" class="vignette' + (liste === 'plans' ? ' est-plan' : '') + '" data-ouvrir="' + esc(p.id) + '|' + liste + '|' + i + '" data-libelle="Agrandir" aria-label="Agrandir : ' + esc(m.titre || '') + '"><img src="' + esc(m.mini || m.src) + '" alt="" loading="lazy"><span>' + (liste === 'plans' ? 'Plan' : '3D') + '</span></button>';
  }
  function boutonsVisionneuse(p, compact){
    var r = (p.rendus || []).length, pl = (p.plans || []).length, h = '';
    if (r) h += '<button type="button" class="btn btn-bleu" data-ouvrir="' + esc(p.id) + '|rendus|0" data-libelle="3D">Voir les images 3D (' + r + ')<i class="fleche"></i></button>';
    if (pl) h += '<button type="button" class="btn btn-trait" data-ouvrir="' + esc(p.id) + '|plans|0" data-libelle="Plans">Consulter les plans (' + pl + ')</button>';
    if (pl) h += '<button type="button" class="btn-relief" data-ouvrir="' + esc(p.id) + '|plans|0|3d" data-libelle="Relief"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>Explorer le plan en 3D</button>';
    return h;
  }
  function blocProjet(p, i){
    var r = p.rendus || [], pl = p.plans || [], visuels;
    if (r.length || pl.length) {
      var principal = r[0] || pl[0], lp = r.length ? 'rendus' : 'plans';
      var vig = r.slice(1).map(function(m, k){ return vignette(p, 'rendus', k + 1, m); }).concat(pl.map(function(m, k){ return vignette(p, 'plans', k, m); }));
      visuels = '<button type="button" class="vue-principale" data-ouvrir="' + esc(p.id) + '|' + lp + '|0" data-libelle="Agrandir" aria-label="Agrandir l’image du projet"><img src="' + esc(principal.src) + '" alt="' + esc(p.titre + ' : ' + (principal.titre || '')) + '" loading="lazy"><span class="badge">Image 3D</span><span class="agrandir" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></span></button>' +
        (vig.length ? '<div class="vignettes">' + vig.join('') + '</div>' : '');
    } else {
      var m = mediasDe(p); if (p.evolution && p.evolution.length) m.push(tuileEvolution(p));
      visuels = m.length ? '<div class="grille-medias">' + m.join('') + '</div>' : '<a class="vue-principale" href="projet.html?id=' + esc(p.id) + '">' + media(p) + '</a>';
    }
    var points = (p.points || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
    var etiquette = p.videos && p.videos.length && !r.length ? 'Photos et vidéos du chantier' : esc(p.type || '');
    return '<article class="bloc-projet revele' + (i % 2 ? ' inverse' : '') + (!r.length && !pl.length ? ' bloc-chantier' : '') + '" id="' + esc(p.id) + '">' +
      '<div class="visuels">' + visuels + '</div>' +
      '<div class="texte"><div class="haut"><span class="num">' + (p.numero ? 'Projet ' + esc(p.numero) : 'Chantier') + '</span><span class="tag">' + etiquette + '</span></div>' +
      '<h3>' + esc(p.titre) + '</h3>' + (vide(p.lieu) ? '' : '<span class="lieu">' + esc(p.lieu) + '</span>') +
      '<p>' + esc(p.resume || '') + '</p>' + (points ? '<ul class="points">' + points + '</ul>' : '') +
      '<div class="actions">' + boutonsVisionneuse(p) + '</div>' +
      '<a class="lien-tout" href="projet.html?id=' + esc(p.id) + '">' + (p.statut === 'en-cours' ? 'Fiche complète du chantier' : 'Fiche complète du projet') + '</a></div></article>';
  }
  var STATUTS = { disponible: 'Disponible', reserve: 'Réservé', vendu: 'Vendu' };
  function carteBien(b){
    var specs = [b.surface && b.surface + ' habitables', b.chambres && b.chambres + ' ch.', b.sdb && b.sdb + ' sdb'].filter(Boolean);
    if (b.type === 'Terrain') specs = [b.terrain || b.surface];
    return '<a class="bien revele" href="bien.html?id=' + esc(b.id) + '" data-libelle="Voir" data-type="' + esc(b.type) + '" data-statut="' + esc(b.statut) + '">' +
      '<div class="cadre">' + media(b) + '<span class="badge statut-' + esc(b.statut) + '">' + esc(STATUTS[b.statut] || '') + '</span><span class="type">' + esc(b.type) + '</span></div>' +
      '<div class="corps"><b class="prix">' + esc(b.prix) + '</b><h3>' + esc(b.titre) + '</h3><span class="lieu">' + esc(b.lieu) + '</span>' +
      '<div class="specs">' + specs.map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('') + '</div></div></a>';
  }
  function carteActu(a){
    return '<a class="actu revele" href="article.html?id=' + esc(a.id) + '" data-libelle="Lire" data-categorie="' + esc(a.categorie) + '"><div class="cadre">' + media(a) + '</div>' +
      '<div class="meta"><span class="cat">' + esc(a.categorie) + '</span><span class="date">' + esc(a.date) + '</span></div><h3>' + esc(a.titre) + '</h3></a>';
  }

  var IC_LECTURE = '<button type="button" class="lecture" aria-label="Lire ou mettre en pause la vidéo" data-libelle="Lecture"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path class="ic-play" d="M8 5v14l11-7z" fill="currentColor"/><g class="ic-pause" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></g></svg></button>';
  function mediasDe(p){
    var out = [];
    (p.photos || []).forEach(function(ph){ out.push('<figure class="media-chantier"><div class="cadre-video"><img src="' + esc(ph.src) + '" alt="' + esc(p.titre + ' : ' + (ph.titre || 'photo')) + '" loading="lazy">' + (ph.titre ? '<span class="piece">' + esc(ph.titre) + '</span>' : '') + '</div></figure>'); });
    (p.videos || []).forEach(function(v){ out.push('<figure class="media-chantier video-chantier"><div class="cadre-video"><video src="' + esc(v.src) + '" poster="' + esc(v.affiche || '') + '" muted loop playsinline preload="metadata" aria-label="' + esc(p.titre + ' : ' + (v.titre || 'vidéo')) + '"></video>' + IC_LECTURE + (v.titre ? '<span class="piece">' + esc(v.titre) + '</span>' : '') + '<span class="type-media">Vidéo</span></div></figure>'); });
    return out;
  }
  // Tuile qui mène à l'évolution complète du chantier (fiche)
  function tuileEvolution(p){
    var ev = p.evolution || []; if (!ev.length) return '';
    return '<figure class="media-chantier tuile-evolution"><a class="cadre-video" href="projet.html?id=' + esc(p.id) + '#evolution" data-libelle="Voir"><img src="' + esc(ev[0].mini || ev[0].src) + '" alt="" loading="lazy"><span class="voile-evo"><b>' + ev.length + ' photos</b><span>L’évolution du chantier, de la base à aujourd’hui</span><i>Voir →</i></span></a></figure>';
  }
  function groupeChantier(p){
    var m = mediasDe(p); if (p.evolution && p.evolution.length) m.push(tuileEvolution(p));
    if (!m.length && p.image) m = ['<figure class="media-chantier"><div class="cadre-video"><img src="' + esc(p.image) + '" alt="' + esc(p.titre) + '" loading="lazy"></div></figure>'];
    return '<article class="groupe-chantier revele"><div class="tete-groupe"><div><span class="sur-titre"><span class="badge en-cours">Chantier en cours</span>' + esc(METIERS[p.metier] || '') + '</span><h3>' + esc(p.titre) + '</h3><span class="lieu">' + esc(p.lieu) + '</span></div><a class="lien-tout" href="projet.html?id=' + esc(p.id) + '">Voir le chantier</a></div>' +
      (m.length ? '<div class="grille-medias">' + m.join('') + '</div>' : '<a href="projet.html?id=' + esc(p.id) + '">' + carteProjet(p, 'div') + '</a>') + '</article>';
  }

  // Ordre des réalisations sur l'accueil : les identifiants listés passent en premier, dans cet ordre
  var ORDRE_ACCUEIL = ['chantier-riviera-bonoumin', 'projet-01', 'chantier-angre-chateau', 'chantier-angre-belle-cote'];
  function rangAccueil(p){ var i = ORDRE_ACCUEIL.indexOf(p.id); return i > -1 ? i : ORDRE_ACCUEIL.length + (D.projets || []).indexOf(p); }
  if (D.ordreAccueil && D.ordreAccueil.length) ORDRE_ACCUEIL = D.ordreAccueil;

  /* ---------------- Rendus des listes ---------------- */
  var projets = (D.projets || []).filter(function(p){ return !p.masque; }), biens = (D.biens || []).filter(function(b){ return !b.masque; }), articles = (D.articles || []).filter(function(a){ return a.statut !== 'brouillon'; });
  $$('[data-rendu]').forEach(function(z){
    var type = z.dataset.rendu, lim = +z.dataset.limite || 999, filtre = z.dataset.metier, sauf = z.dataset.sauf;
    if (type === 'projets-piste') z.innerHTML = projets.filter(function(p){ return D.ordreAccueil && D.ordreAccueil.length ? D.ordreAccueil.indexOf(p.id) > -1 : ((p.rendus || []).length || p.image); }).sort(function(a, b){ return rangAccueil(a) - rangAccueil(b); }).slice(0, lim).map(function(p){ return carteProjet(p, 'a'); }).join('');
    if (type === 'projets') {
      var st = z.dataset.statut; var l = projets.filter(function(p){ return (!filtre || p.metier === filtre) && (!st || p.statut === st) && p.id !== sauf; }).slice(0, lim);
      z.innerHTML = l.length ? l.map(function(p){ return carteProjet(p); }).join('') : '<p class="vide">' + (st === 'en-cours' ? 'Les chantiers en cours seront bientôt publiés.' : 'Les réalisations seront bientôt publiées.') + '</p>';
    }
    if (type === 'biens') {
      var lb = biens.slice(); if (z.dataset.dispo) lb = lb.filter(function(b){ return b.statut !== 'vendu' && b.id !== sauf; }); lb = lb.slice(0, lim);
      if (lb.length) z.innerHTML = lb.map(carteBien).join('');
      else {
        z.innerHTML = '<div class="aucune-actu revele"><span class="ico-actu" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg></span><h3>Aucun bien en vente pour le moment</h3><p>Nos prochains biens seront publiés ici. Dites-nous ce que vous recherchez (type de bien, commune, budget) : nous vous prévenons dès qu’un bien correspondant est disponible.</p><a class="btn btn-bleu" data-lien="whatsapp" href="contact.html?projet=immobilier#formulaire" data-libelle="Écrire">Décrire ma recherche<i class="fleche"></i></a></div>';
        z.classList.add('vide-actu');
        var secb = z.closest('section'); if (secb) { $$('.barre-filtres, .vide-filtre', secb).forEach(function(x){ x.remove(); }); }
      }
    }
    if (type === 'projets-blocs') { var gp = projets.filter(function(p){ return z.dataset.statut ? p.statut === z.dataset.statut : p.statut !== 'en-cours'; }); z.innerHTML = gp.map(blocProjet).join(''); }
    if (type === 'chantiers-en-cours') {
      var ec = projets.filter(function(p){ return p.statut === 'en-cours'; }).slice(0, lim);
      z.innerHTML = ec.length ? ec.map(groupeChantier).join('') : '<p class="vide">Les chantiers en cours seront bientôt publiés.</p>';
    }
    if (type === 'articles') {
      var la = articles.filter(function(a){ return a.id !== sauf && (!z.dataset.categorie || a.categorie === z.dataset.categorie); }).slice(0, lim);
      if (la.length) z.innerHTML = la.map(carteActu).join('');
      else {
        z.innerHTML = '<div class="aucune-actu revele"><span class="ico-actu" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/></svg></span><h3>Aucune actualité pour le moment</h3><p>Nos premières actualités arrivent bientôt : avancement de nos chantiers, conseils pour bien construire et nouvelles de MCS.</p><a class="lien-tout" href="realisations.html">Découvrir nos chantiers et projets</a></div>';
        z.classList.add('vide-actu');
        var sec = z.closest('section'); if (sec) { $$('.barre-filtres', sec).forEach(function(x){ x.remove(); }); $$('.vide-filtre', sec).forEach(function(x){ x.remove(); }); var lt = z.parentNode.querySelector('a.lien-tout[href="actualites.html"]'); if (lt) lt.parentNode.remove(); }
      }
    }
  });

  $$('.aucune-actu [data-lien="whatsapp"]').forEach(function(el){ el.href = lienWa('Bonjour MCS, je recherche un bien immobilier : '); if (waNum) { el.target = '_blank'; el.rel = 'noopener'; } });

  /* Filtres (réalisations, biens, actualités) */
  $$('.filtres').forEach(function(f){
    var cible = $(f.dataset.cible), attr = f.dataset.attr, compteur = f.parentNode.querySelector('.compte');
    function appliquer(){
      var actif = $('button.actif', f), v = actif ? actif.dataset.filtre : '*', q = '', n = 0;
      var rech = $('[data-recherche="' + f.dataset.cible + '"]'); if (rech) q = rech.value.trim().toLowerCase();
      $$('[data-' + attr + ']', cible).forEach(function(c){
        var ok = (v === '*' || c.getAttribute('data-' + attr) === v) && (!q || c.textContent.toLowerCase().indexOf(q) > -1);
        c.hidden = !ok; if (ok) { n++; c.classList.add('vu'); }
      });
      if (compteur) compteur.textContent = n + (n > 1 ? ' résultats' : ' résultat');
      var vide = cible.parentNode.querySelector('.vide-filtre'); if (vide) vide.hidden = n > 0;
    }
    $$('button', f).forEach(function(b){ b.addEventListener('click', function(){ $$('button', f).forEach(function(x){ x.classList.remove('actif'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('actif'); b.setAttribute('aria-pressed', 'true'); appliquer(); }); });
    var rech = $('[data-recherche="' + f.dataset.cible + '"]'); if (rech) rech.addEventListener('input', appliquer);
    var init = param('filtre'); if (init) { var b0 = $('button[data-filtre="' + init + '"]', f); if (b0) b0.click(); }
    appliquer();
  });

  /* ---------------- Pages détail ---------------- */
  function trouver(liste){ var id = param('id'); var o = liste.filter(function(x){ return x.id === id; })[0]; return o || liste[0]; }
  function galerie(o){
    var imgs = (o.galerie || []).filter(Boolean);
    if (!imgs.length) return '<div class="galerie">' + [o.illustration, 'structure', 'interieur'].map(function(k, i){ return '<figure class="g' + i + '">' + (i === 0 && o.image ? '<img src="' + esc(o.image) + '" alt="">' : illus(k)) + '<figcaption>[Photo ' + (i + 1) + ' à venir]</figcaption></figure>'; }).join('') + '</div>';
    return '<div class="galerie">' + imgs.slice(0, 5).map(function(s, i){ return '<figure class="g' + i + '"><img src="' + esc(s) + '" alt="" loading="lazy"></figure>'; }).join('') + '</div>';
  }
  function galerieProjet(o){
    var r = o.rendus || [], pl = o.plans || [];
    if (!r.length && !pl.length) return '';
    var h = '';
    if (r.length) h += '<div class="fiche-medias"><h2>Images 3D</h2><div class="grille-vignettes">' + r.map(function(m, i){ return vignette(o, 'rendus', i, m).replace('</button>', '<em>' + esc(m.titre || '') + '</em></button>'); }).join('') + '</div></div>';
    if (pl.length) h += '<div class="fiche-medias"><h2>Plans</h2><div class="grille-vignettes plans">' + pl.map(function(m, i){ return vignette(o, 'plans', i, m).replace('</button>', '<em>' + esc(m.titre || '') + '</em></button>'); }).join('') + '</div></div>';
    return h;
  }
  var det = $('[data-detail]');
  if (det) {
    var kind = det.dataset.detail, o;
    if (kind === 'projet') {
      o = trouver(projets);
      document.title = o.titre + ' — Réalisations MCS';
      $$('[data-champ]').forEach(function(el){
        var k = el.dataset.champ;
        if (k === 'metier') el.textContent = o.type || METIERS[o.metier] || '';
        else if (k === 'statut') el.textContent = o.type || 'Projet';
        else if (k === 'media') el.innerHTML = (o.rendus && o.rendus[0]) ? '<img src="' + esc(o.rendus[0].src) + '" alt="' + esc(o.titre) + '">' : media(o);
        else if (k === 'galerie') el.innerHTML = galerieProjet(o);
        else if (k === 'description') el.innerHTML = (o.description || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');
        else if (k === 'points') el.innerHTML = (o.points || []).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
        else if (k === 'actions') el.innerHTML = boutonsVisionneuse(o);
        else if (!vide(o[k])) el.textContent = o[k];
        else el.textContent = '';
      });
      $$('.carte-info dl > div').forEach(function(d){ var dd = $('dd', d); if (!dd || !dd.textContent.trim()) d.remove(); });
      $$('[data-si-delais]').forEach(function(d){ if (vide(o.prevu)) d.remove(); });
      $$('[data-si-points]').forEach(function(d){ if (!(o.points || []).length) d.remove(); });
      $$('[data-si-lieu]').forEach(function(d){ if (vide(o.lieu)) d.remove(); });
      $$('.meta-hero').forEach(function(m){ $$('span', m).forEach(function(x){ if (!x.textContent.trim() || /Année\s*$/.test(x.textContent.trim())) x.remove(); }); });
      var zv = $('[data-rendu-videos]');
      if (zv) { var mm = mediasDe(o); if (mm.length) zv.querySelector('.grille-medias').innerHTML = mm.join(''); else zv.remove(); }
      var ev = o.evolution || [];
      if (ev.length) {
        var sec = document.createElement('div'); sec.className = 'bloc-evolution'; sec.id = 'evolution';
        sec.innerHTML = '<h2>L’évolution du chantier</h2><p class="intro-evo">De la base à aujourd’hui, étape par étape. Touchez une photo pour l’agrandir.</p><ol class="frise-evo">' +
          ev.map(function(m, i){ return '<li><button type="button" data-ouvrir="' + esc(o.id) + '|evolution|' + i + '" data-libelle="Agrandir" aria-label="Agrandir : ' + esc(m.titre || '') + '"><img src="' + esc(m.mini || m.src) + '" alt="' + esc(o.titre + ' : ' + (m.titre || '')) + '" loading="lazy"><span class="etape-evo">' + (i + 1) + '</span></button><b>' + esc(m.titre || '') + '</b></li>'; }).join('') + '</ol>';
        var apres = $('[data-rendu-videos]') || $('.fiche-medias:last-of-type');
        if (apres && apres.parentNode) apres.parentNode.insertBefore(sec, apres.nextSibling);
        else { var cible = $('.fiche > div') || $('main'); if (cible) cible.appendChild(sec); }
        if (location.hash === '#evolution') setTimeout(function(){ sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 700);
      }
      var sim = $('[data-rendu-similaires]');
      if (sim) { var l = projets.filter(function(p){ return p.id !== o.id; }).slice(0, 3); sim.innerHTML = l.map(function(p){ return carteProjet(p); }).join(''); }
    }
    if (kind === 'bien' && !biens.length) { location.replace('immobilier.html'); }
    if (kind === 'bien' && biens.length) {
      o = trouver(biens);
      document.title = o.titre + ' — Immobilier MCS';
      $$('[data-champ]').forEach(function(el){
        var k = el.dataset.champ;
        if (k === 'statut') { el.textContent = STATUTS[o.statut] || ''; el.className = 'badge statut-' + o.statut; }
        else if (k === 'media') el.innerHTML = media(o);
        else if (k === 'galerie') el.innerHTML = galerie(o);
        else if (k === 'description') el.innerHTML = (o.description || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');
        else if (o[k] != null && o[k] !== '') el.textContent = o[k];
        else { var ligne = el.closest('[data-optionnel]'); if (ligne) ligne.remove(); }
      });
      var sel = $('#form [name="bien"]'); if (sel) sel.value = o.titre + ' (' + o.lieu + ')';
      var simb = $('[data-rendu-similaires]');
      if (simb) simb.innerHTML = biens.filter(function(b){ return b.id !== o.id && b.statut !== 'vendu'; }).slice(0, 3).map(carteBien).join('');
      $$('[data-lien="whatsapp-bien"]').forEach(function(a){ a.href = lienWa('Bonjour MCS, je suis intéressé(e) par le bien : ' + o.titre + ' (' + o.lieu + ').'); if (waNum) { a.target = '_blank'; a.rel = 'noopener'; } });
    }
    if (kind === 'article' && !articles.length) { location.replace('actualites.html'); }
    if (kind === 'article' && articles.length) {
      o = trouver(articles);
      document.title = o.titre + ' — Actualités MCS';
      $$('[data-champ]').forEach(function(el){
        var k = el.dataset.champ;
        if (k === 'media') el.innerHTML = media(o);
        else if (k === 'contenu') el.innerHTML = (o.contenu || []).map(function(p){ return '<p>' + esc(p) + '</p>'; }).join('');
        else if (o[k] != null) el.textContent = o[k];
      });
      var sima = $('[data-rendu-similaires]');
      if (sima) sima.innerHTML = articles.filter(function(a){ return a.id !== o.id; }).slice(0, 3).map(carteActu).join('');
    }
  }

  /* ---------------- Chiffres et équipe ---------------- */
  var zc = $('[data-rendu-chiffres]');
  if (zc) zc.innerHTML = (D.chiffres || []).map(function(c){ return '<div class="revele"><b>' + esc(c.valeur) + '</b><span>' + esc(c.libelle) + '</span></div>'; }).join('');
  var ze = $('[data-rendu-equipe]'), EQ = D.equipe || {};
  if (ze) ze.innerHTML = EQ.image ? '<img src="' + esc(EQ.image) + '" alt="' + esc(EQ.legende || 'L’équipe MCS') + '" loading="lazy">' : '<svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1200" height="520" fill="#E6F4FD"/><g fill="#B9E2F6">' + [150,330,510,690,870,1050].map(function(x, i){ var y = i % 2 ? 230 : 200; return '<circle cx="' + x + '" cy="' + y + '" r="62"/><path d="M' + (x - 110) + ' 520C' + (x - 100) + ' 390 ' + (x - 60) + ' ' + (y + 105) + ' ' + x + ' ' + (y + 105) + 'S' + (x + 100) + ' 390 ' + (x + 110) + ' 520Z"/>'; }).join('') + '</g><rect y="508" width="1200" height="12" fill="#EDC23B"/></svg><span class="legende-photo">[Photo de toute l’équipe MCS]</span>';

  /* ---------------- Chargement & transitions de page ---------------- */
  var ch = $('#chargement'), jc = $('#jauge-chargement');
  var dejaVu = false; try { dejaVu = sessionStorage.getItem('mcs-vu') === '1'; sessionStorage.setItem('mcs-vu', '1'); } catch(e){}
  if (dejaVu && ch) ch.classList.add('rapide');
  var debut = Date.now(), largeur = 0, ouvert = false;
  var timer = setInterval(function(){ largeur = Math.min(90, largeur + 7); if (jc) jc.style.width = largeur + '%'; }, 120);
  function ouvrir(){
    if (ouvert) return; ouvert = true;
    var attente = Math.max(0, (reduit ? 150 : (dejaVu ? 250 : 1800)) - (Date.now() - debut));
    setTimeout(function(){
      clearInterval(timer); if (jc) jc.style.width = '100%';
      setTimeout(function(){
        if (ch) ch.classList.add('ouvert'); document.body.classList.remove('charge'); if (!location.hash) hautDePage(); document.body.classList.add('pret'); demarrerSlider();
        setTimeout(function(){ if (ch) ch.classList.add('fini'); }, 1100);
      }, dejaVu ? 50 : 250);
    }, attente);
  }
  if (document.readyState === 'complete') ouvrir(); else addEventListener('load', ouvrir);
  setTimeout(ouvrir, 4000);
  addEventListener('pageshow', function(e){ if (e.persisted && ch) { ch.classList.remove('ferme'); ch.classList.add('ouvert', 'fini'); document.body.classList.remove('charge'); } });
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduit || !ch || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(h) || h.indexOf('#') > 0 && h.split('#')[0] === location.pathname.split('/').pop()) return;
    e.preventDefault();
    ch.classList.remove('fini'); ch.classList.add('rapide');
    void ch.offsetWidth;
    ch.classList.remove('ouvert'); ch.classList.add('ferme');
    setTimeout(function(){ location.href = h; }, 520);
  });

  /* ---------------- Curseur ---------------- */
  var point = $('.point'), anneau = $('.anneau'), apercu = $('.apercu');
  var lib = anneau ? $('span', anneau) : null;
  var mx = -100, my = -100, ax = -100, ay = -100;
  if (fin && !reduit && anneau) {
    document.documentElement.classList.add('curseur-actif');
    addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; point.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; });
    (function boucle(){ ax += (mx - ax) * 0.16; ay += (my - ay) * 0.16; anneau.style.transform = 'translate(' + ax + 'px,' + ay + 'px)'; if (apercu) apercu.style.transform = 'translate(' + (ax + 34) + 'px,' + (ay - 110) + 'px)'; requestAnimationFrame(boucle); })();
    document.addEventListener('mouseover', function(e){
      var el = e.target.closest && e.target.closest('a, button, input, select, textarea, summary, .proj');
      if (!el) { anneau.classList.remove('survol', 'libelle'); return; }
      anneau.classList.add('survol');
      var t = el.getAttribute('data-libelle'); if (t) { lib.textContent = t; anneau.classList.add('libelle'); } else anneau.classList.remove('libelle');
    });
    document.addEventListener('mouseover', function(e){ document.body.classList.toggle('sombre-curseur', !!(e.target.closest && e.target.closest('.sombre'))); });
    var photosMetier = { 1: 'construction', 2: 'gros-oeuvre', 3: 'finition', 4: 'immobilier' };
    $$('.metier[data-apercu]').forEach(function(m){
      m.addEventListener('mouseenter', function(){ apercu.innerHTML = '<img src="' + photoMetier(photosMetier[m.dataset.apercu]) + '" alt="">'; apercu.classList.add('visible'); });
      m.addEventListener('mouseleave', function(){ apercu.classList.remove('visible'); });
    });
  }

  var PHM = { 1: 'construction', 2: 'gros-oeuvre', 3: 'finition', 4: 'immobilier' };
  $$('.metier[data-apercu]').forEach(function(m){ var i = document.createElement('img'); i.className = 'photo-metier'; i.src = photoMetier(PHM[m.dataset.apercu]); i.alt = ''; i.loading = 'lazy'; m.insertBefore(i, m.firstChild); });
  // précharger les photos du survol
  if (fin) Object.keys(PHM).forEach(function(k){ var im = new Image(); im.src = photoMetier(PHM[k]); });

  /* ---------------- Slider du hero (accueil) ---------------- */
  var slides = $$('.slide'), puces = $$('#puces button'), legendes = $$('.legende');
  var idx = 0, duree = 5500, t0 = 0, lance = false;
  /* Sur téléphone, le diaporama commence par la 2e image */
  if (slides.length > 1 && matchMedia('(max-width:700px)').matches) {
    slides[0].classList.remove('active'); slides[1].classList.add('active'); idx = 1;
    puces.forEach(function(p, k){ p.classList.toggle('fait', k < 1); p.classList.toggle('courant', k === 1); var b = $('i', p); if (b) b.style.width = k < 1 ? '100%' : '0'; });
    legendes.forEach(function(l, k){ l.classList.toggle('active', k === 1); });
  }
  function aller(i){
    var ancien = slides[idx];
    ancien.classList.remove('active'); ancien.classList.add('sortie');
    setTimeout(function(){ ancien.classList.remove('sortie'); }, 1150);
    idx = (i + slides.length) % slides.length;
    slides[idx].classList.add('active');
    puces.forEach(function(p, k){ p.classList.toggle('fait', k < idx); p.classList.toggle('courant', k === idx); $('i', p).style.width = k < idx ? '100%' : '0'; });
    legendes.forEach(function(l, k){ l.classList.toggle('active', k === idx); });
    t0 = performance.now();
  }
  function tic(t){ var f = clamp((t - t0) / duree, 0, 1); $('i', puces[idx]).style.width = (f * 100) + '%'; if (f >= 1) aller(idx + 1); requestAnimationFrame(tic); }
  function demarrerSlider(){ if (lance || reduit || !slides.length || !puces.length) return; lance = true; t0 = performance.now(); requestAnimationFrame(tic); }
  puces.forEach(function(p, k){ p.addEventListener('click', function(){ if (k !== idx) aller(k); }); });

  /* ---------------- Menu ---------------- */
  var menu = $('#menu'), indic = menu ? $('.indic', menu) : null, liens = menu ? $$('a', menu) : [];
  var page = document.body.dataset.page || 'accueil';
  var actifI = Math.max(0, liens.findIndex(function(a){ return a.dataset.page === page; }));
  liens.forEach(function(a, i){ a.classList.toggle('actif', i === actifI); if (i === actifI) a.setAttribute('aria-current', 'page'); });
  $$('#tiroir a[data-page="' + page + '"]').forEach(function(a){ a.classList.add('actif'); a.setAttribute('aria-current', 'page'); });
  function placer(a){ if (!a || !indic) return; indic.style.left = a.offsetLeft + 'px'; indic.style.width = a.offsetWidth + 'px'; indic.style.opacity = 1; }
  liens.forEach(function(a){ a.addEventListener('mouseenter', function(){ placer(a); }); });
  if (menu) menu.addEventListener('mouseleave', function(){ placer(liens[actifI]); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ placer(liens[actifI]); });
  setTimeout(function(){ placer(liens[actifI]); }, 60);

  var burger = $('#burger'), tiroir = $('#tiroir');
  if (burger) {
    burger.addEventListener('click', function(){ var o = tiroir.classList.toggle('ouvert'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu'); document.body.classList.toggle('tiroir-ouvert', o); });
    $$('a', tiroir).forEach(function(a){ a.addEventListener('click', function(){ tiroir.classList.remove('ouvert'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('tiroir-ouvert'); }); });
  }

  /* ---------------- Chantier (accueil) ---------------- */
  var chantier = $('#chantier'), traits = [], N = 6, lis = [], pct, livre, grue, echaf;
  if (chantier) {
    lis = $$('#phases li'); pct = $('#pct'); livre = $('#livre'); grue = $('#grue'); echaf = $('#echaf');
    $$('svg g[data-p]', chantier).forEach(function(g){
      var ph = +g.dataset.p;
      $$('.t', g).forEach(function(el){ var L = el.getTotalLength ? el.getTotalLength() : 500; el.style.strokeDasharray = L; el.style.strokeDashoffset = L; traits.push({ el: el, L: L, p: ph, type: 't' }); });
      var rs = $$('.r', g); rs.forEach(function(el, k){ el.style.opacity = 0; traits.push({ el: el, p: ph, type: 'r', k: k, n: rs.length }); });
    });
  }
  var entete = $('#entete');
  function maj(){
    if (entete) entete.classList.toggle('plein', scrollY > 30);
    if (chantier) {
      var r = chantier.getBoundingClientRect();
      var p = reduit ? 1 : clamp(-r.top / (r.height - innerHeight), 0, 1);
      var phase = Math.min(N - 1, Math.floor(p * N));
      traits.forEach(function(o){
        var f = clamp((p - o.p / N) * N, 0, 1);
        if (o.type === 't') o.el.style.strokeDashoffset = o.L * (1 - f);
        else o.el.style.opacity = clamp(f * (o.n + 1) - o.k, 0, 1);
      });
      lis.forEach(function(li, i){ li.classList.toggle('actif', i === phase); li.classList.toggle('fait', i < phase || p >= 0.999); });
      pct.textContent = Math.round(p * 100) + ' %';
      var fini = p > 0.97;
      livre.classList.toggle('on', fini);
      grue.style.opacity = fini ? 0 : 1; grue.style.transition = 'opacity .6s';
      echaf.style.opacity = p > 0.8 ? 0 : 1; echaf.style.transition = 'opacity .6s';
    }
  }
  var attente = false;
  addEventListener('scroll', function(){ if (!attente) { attente = true; requestAnimationFrame(function(){ maj(); attente = false; }); } }, { passive: true });
  addEventListener('resize', function(){ maj(); placer(liens[actifI]); });
  maj();

  /* ---------------- Visionneuse : images 3D, plans, plan en relief ---------------- */
  (function(){
    if (!$('[data-ouvrir]') && !$('[data-rendu-similaires]')) { /* rien sur cette page */ }
    var vz = null, etat = { p: null, liste: 'rendus', i: 0, s: 1, tx: 0, ty: 0, relief: false, rx: 52, rz: -22 };
    var IC = {
      fermer: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
      plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
      moins: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
      reset: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 1.6-7.2L4 10"/></svg>',
      prec: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg>',
      suiv: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>',
      relief: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>'
    };
    function construire(){
      vz = document.createElement('div'); vz.className = 'visionneuse'; vz.hidden = true;
      vz.setAttribute('role', 'dialog'); vz.setAttribute('aria-modal', 'true'); vz.setAttribute('aria-label', 'Visionneuse du projet');
      vz.innerHTML = '<div class="vz-haut"><div class="vz-id"><small class="vz-num"></small><b class="vz-titre"></b></div>' +
        '<div class="vz-onglets" role="tablist"><button type="button" role="tab" data-onglet="rendus">Images 3D <i></i></button><button type="button" role="tab" data-onglet="plans">Plans <i></i></button></div>' +
        '<div class="vz-outils"><button type="button" class="vz-relief" aria-pressed="false" title="Vue en relief">' + IC.relief + '<span>Vue 3D</span></button><button type="button" class="vz-moins" title="Dézoomer" aria-label="Dézoomer">' + IC.moins + '</button><button type="button" class="vz-plus" title="Zoomer" aria-label="Zoomer">' + IC.plus + '</button><button type="button" class="vz-reset" title="Recentrer" aria-label="Recentrer">' + IC.reset + '</button><button type="button" class="vz-fermer" title="Fermer" aria-label="Fermer">' + IC.fermer + '</button></div></div>' +
        '<div class="vz-scene"><div class="vz-plateau"><img class="vz-img" alt="" draggable="false"></div>' +
        '<button type="button" class="vz-prec" aria-label="Image précédente">' + IC.prec + '</button><button type="button" class="vz-suiv" aria-label="Image suivante">' + IC.suiv + '</button>' +
        '<div class="vz-bas"><span class="vz-legende"></span><span class="vz-aide"></span></div></div>' +
        '<div class="vz-vignettes"></div>';
      document.body.appendChild(vz);
      $('.vz-fermer', vz).onclick = fermer;
      $('.vz-prec', vz).onclick = function(){ aller(etat.i - 1); };
      $('.vz-suiv', vz).onclick = function(){ aller(etat.i + 1); };
      $('.vz-plus', vz).onclick = function(){ zoomer(1.35); };
      $('.vz-moins', vz).onclick = function(){ zoomer(1 / 1.35); };
      $('.vz-reset', vz).onclick = function(){ recentrer(); };
      $('.vz-relief', vz).onclick = function(){ basculerRelief(); };
      $$('[data-onglet]', vz).forEach(function(b){ b.onclick = function(){ afficherListe(b.dataset.onglet, 0); }; });
      var scene = $('.vz-scene', vz), pointeurs = {}, d0 = 0, s0 = 1, dernier = null, bouge = false;
      scene.addEventListener('wheel', function(e){ e.preventDefault(); zoomer(e.deltaY < 0 ? 1.12 : 1 / 1.12); }, { passive: false });
      scene.addEventListener('dblclick', function(){ if (etat.s > 1.05) recentrer(); else zoomer(2.2); });
      scene.addEventListener('pointerdown', function(e){ if (e.target.closest('button')) return; pointeurs[e.pointerId] = { x: e.clientX, y: e.clientY }; scene.setPointerCapture(e.pointerId); dernier = { x: e.clientX, y: e.clientY }; bouge = false; var k = Object.keys(pointeurs); if (k.length === 2) { var a = pointeurs[k[0]], b = pointeurs[k[1]]; d0 = Math.hypot(a.x - b.x, a.y - b.y); s0 = etat.s; } arreterAuto(); });
      scene.addEventListener('pointermove', function(e){
        if (!pointeurs[e.pointerId]) return; pointeurs[e.pointerId] = { x: e.clientX, y: e.clientY };
        var k = Object.keys(pointeurs);
        if (k.length === 2) { var a = pointeurs[k[0]], b = pointeurs[k[1]], d = Math.hypot(a.x - b.x, a.y - b.y); if (d0) { etat.s = clamp(s0 * d / d0, .6, 6); appliquer(); } return; }
        var dx = e.clientX - dernier.x, dy = e.clientY - dernier.y; dernier = { x: e.clientX, y: e.clientY }; if (Math.abs(dx) + Math.abs(dy) > 2) bouge = true;
        if (etat.relief) { etat.rz += dx * 0.35; etat.rx = clamp(etat.rx - dy * 0.25, 0, 78); }
        else { etat.tx += dx; etat.ty += dy; }
        appliquer();
      });
      function fin(e){ delete pointeurs[e.pointerId]; if (Object.keys(pointeurs).length < 2) d0 = 0; }
      scene.addEventListener('pointerup', fin); scene.addEventListener('pointercancel', fin);
      document.addEventListener('keydown', function(e){
        if (!vz || vz.hidden) return;
        if (e.key === 'Escape') fermer(); else if (e.key === 'ArrowRight') aller(etat.i + 1); else if (e.key === 'ArrowLeft') aller(etat.i - 1);
        else if (e.key === '+' || e.key === '=') zoomer(1.25); else if (e.key === '-') zoomer(1 / 1.25);
      });
    }
    var auto = null;
    function arreterAuto(){ if (auto) { cancelAnimationFrame(auto); auto = null; } }
    function demarrerAuto(){ arreterAuto(); if (reduit) return; var t0 = performance.now(), base = etat.rz; (function f(t){ etat.rz = base + Math.sin((t - t0) / 2600) * 18; appliquer(); auto = requestAnimationFrame(f); })(t0); }
    function appliquer(){
      var pl = $('.vz-plateau', vz);
      pl.style.transform = etat.relief
        ? 'translate(' + etat.tx + 'px,' + etat.ty + 'px) scale(' + etat.s + ') rotateX(' + etat.rx + 'deg) rotateZ(' + etat.rz + 'deg)'
        : 'translate(' + etat.tx + 'px,' + etat.ty + 'px) scale(' + etat.s + ')';
    }
    function recentrer(){ etat.s = etat.relief ? .82 : 1; etat.tx = 0; etat.ty = 0; etat.rx = 52; etat.rz = -22; appliquer(); }
    function zoomer(f){ etat.s = clamp(etat.s * f, .5, 6); if (etat.s <= 1 && !etat.relief) { etat.tx *= .6; etat.ty *= .6; } appliquer(); }
    function basculerRelief(force){
      etat.relief = typeof force === 'boolean' ? force : !etat.relief;
      vz.classList.toggle('relief', etat.relief);
      $('.vz-relief', vz).setAttribute('aria-pressed', etat.relief);
      $('.vz-aide', vz).textContent = etat.relief ? 'Faites glisser pour tourner autour du plan · molette ou pincement pour zoomer' : 'Faites glisser pour vous déplacer · molette, double-clic ou pincement pour zoomer';
      recentrer(); if (etat.relief) demarrerAuto(); else arreterAuto();
    }
    function liste(){ return (etat.p && etat.p[etat.liste]) || []; }
    function afficherListe(l, i){
      etat.liste = l; var L = liste();
      $$('[data-onglet]', vz).forEach(function(b){ var n = (etat.p[b.dataset.onglet] || []).length; b.hidden = !n; $('i', b).textContent = n; b.classList.toggle('actif', b.dataset.onglet === l); b.setAttribute('aria-selected', b.dataset.onglet === l); });
      $('.vz-vignettes', vz).innerHTML = L.map(function(m, k){ return '<button type="button" data-k="' + k + '" aria-label="' + esc(m.titre || ('Image ' + (k + 1))) + '"><img src="' + esc(m.mini || m.src) + '" alt=""></button>'; }).join('');
      $$('.vz-vignettes button', vz).forEach(function(b){ b.onclick = function(){ aller(+b.dataset.k); }; });
      aller(i || 0);
    }
    function aller(i){
      var L = liste(); if (!L.length) return;
      etat.i = (i + L.length) % L.length; var m = L[etat.i], img = $('.vz-img', vz);
      vz.classList.add('charge-img'); img.onload = function(){ vz.classList.remove('charge-img'); }; img.src = m.src; img.alt = (etat.p.titre || '') + ' : ' + (m.titre || '');
      $('.vz-legende', vz).textContent = (m.titre || '') + '  ·  ' + (etat.i + 1) + ' / ' + L.length;
      $$('.vz-vignettes button', vz).forEach(function(b, k){ b.classList.toggle('actif', k === etat.i); });
      $('.vz-prec', vz).hidden = $('.vz-suiv', vz).hidden = L.length < 2;
      recentrer(); if (etat.relief) demarrerAuto();
    }
    function ouvrir(id, l, i, relief){
      var p = projets.filter(function(x){ return x.id === id; })[0]; if (!p) return;
      if (!vz) construire();
      etat.p = p; $('.vz-num', vz).textContent = p.numero ? 'Projet ' + p.numero : (p.statut === 'en-cours' ? 'Chantier' : 'Projet'); $('.vz-titre', vz).textContent = p.titre;
      vz.hidden = false; document.body.classList.add('vz-ouverte');
      requestAnimationFrame(function(){ vz.classList.add('ouverte'); });
      etat.relief = false; basculerRelief(!!relief);
      afficherListe((p[l] || []).length ? l : (l === 'plans' ? 'rendus' : 'plans'), i);
      $('.vz-fermer', vz).focus();
    }
    function fermer(){ arreterAuto(); vz.classList.remove('ouverte'); document.body.classList.remove('vz-ouverte'); setTimeout(function(){ vz.hidden = true; $('.vz-img', vz).src = ''; }, 250); }
    document.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-ouvrir]'); if (!b) return;
      e.preventDefault(); var a = b.dataset.ouvrir.split('|'); ouvrir(a[0], a[1], +a[2] || 0, a[3] === '3d');
    });
    var demande = param('voir'); if (demande) { var q = demande.split('|'); setTimeout(function(){ ouvrir(q[0], q[1] || 'rendus', +q[2] || 0, q[3] === '3d'); }, 900); }
  })();

  /* ---------------- Vidéos de chantier ---------------- */
  var vidsEls = $$('.video-chantier video');
  vidsEls.forEach(function(v){
    var fig = v.closest('.video-chantier'), b = $('.lecture', fig);
    v.addEventListener('play', function(){ fig.classList.add('joue'); });
    v.addEventListener('pause', function(){ fig.classList.remove('joue'); });
    function bascule(){ if (v.paused) { v.manuel = false; v.play().catch(function(){}); } else { v.manuel = true; v.pause(); } }
    b.addEventListener('click', bascule); v.addEventListener('click', bascule);
  });
  if (vidsEls.length && 'IntersectionObserver' in window && !reduit) {
    var iov = new IntersectionObserver(function(es){ es.forEach(function(e){ var v = e.target; if (e.isIntersecting) { if (!v.manuel) v.play().catch(function(){}); } else v.pause(); }); }, { threshold: 0.4 });
    vidsEls.forEach(function(v){ iov.observe(v); });
  }

  /* ---------------- Apparition au défilement ---------------- */
  if ('IntersectionObserver' in window && !reduit) {
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
    $$('.revele').forEach(function(el){ io.observe(el); });
  } else $$('.revele').forEach(function(el){ el.classList.add('vu'); });

  /* Compteurs « étapes » de la page métier : rien de spécial, CSS. */

  /* ---------------- Piste des réalisations (accueil) ---------------- */
  var pisteP = $('#piste'), jauge = $('#jauge');
  if (pisteP && jauge) {
    var majJauge = function(){ var max = pisteP.scrollWidth - pisteP.clientWidth; var part = pisteP.clientWidth / pisteP.scrollWidth; jauge.style.width = (part * 100) + '%'; jauge.style.left = (max > 0 ? (pisteP.scrollLeft / max) * (100 - part * 100) : 0) + '%'; };
    pisteP.addEventListener('scroll', majJauge, { passive: true }); majJauge(); addEventListener('resize', majJauge);
    var pas = function(){ var c = $('.proj', pisteP); return c ? c.offsetWidth + 28 : 300; };
    $('#gauche').onclick = function(){ pisteP.scrollBy({ left: -pas(), behavior: 'smooth' }); };
    $('#droite').onclick = function(){ pisteP.scrollBy({ left: pas(), behavior: 'smooth' }); };
    var appui = false, bouge = false, x0 = 0, s0 = 0;
    pisteP.addEventListener('pointerdown', function(e){ if (e.pointerType !== 'mouse') return; appui = true; bouge = false; x0 = e.clientX; s0 = pisteP.scrollLeft; pisteP.style.scrollSnapType = 'none'; });
    addEventListener('pointermove', function(e){ if (appui) { if (Math.abs(e.clientX - x0) > 6) bouge = true; pisteP.scrollLeft = s0 - (e.clientX - x0); } });
    addEventListener('pointerup', function(){ if (appui) { appui = false; pisteP.style.scrollSnapType = ''; } });
    pisteP.addEventListener('click', function(e){ if (bouge) { e.preventDefault(); e.stopPropagation(); bouge = false; } }, true);
    $$('img, svg', pisteP).forEach(function(i){ i.setAttribute('draggable', 'false'); });
  }

  /* ---------------- Formulaires ----------------
     Pour l’instant : message de confirmation (et WhatsApp si le numéro
     est renseigné). Ils seront reliés à l’espace administrateur. */
  var pre = param('projet');
  $$('form.form').forEach(function(form){
    var msg = $('.msg', form);
    if (pre && form.projet) { $$('option', form.projet).forEach(function(o){ if (o.value === pre) form.projet.value = pre; }); }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (form.nom && !form.nom.value.trim()) { msg.textContent = 'Indiquez votre nom complet.'; form.nom.focus(); return; }
      if (form.tel && form.tel.value.replace(/\D/g, '').length < 8) { msg.textContent = 'Indiquez un numéro de téléphone ou WhatsApp valide.'; form.tel.focus(); return; }
      var lignes = [form.dataset.sujet || 'Demande depuis le site MCS'];
      $$('input, select, textarea', form).forEach(function(c){ if (c.name && c.value && c.type !== 'hidden') { var l = c.closest('label'); lignes.push((l ? l.firstChild.textContent.trim() : c.name) + ' : ' + c.value); } });
      var dem = { type: /visite/i.test(form.dataset.sujet || '') ? 'Visite de bien' : 'Demande de devis', champs: {} };
      $$('input, select, textarea', form).forEach(function(c){ if (c.name && c.value) dem.champs[c.name] = c.value; });
      dem.nom = dem.champs.nom || ''; dem.tel = dem.champs.tel || '';
      var bouton = $('button[type="submit"], button:not([type])', form), texteBouton = bouton ? bouton.textContent : '';
      if (bouton) { bouton.disabled = true; bouton.textContent = 'Envoi en cours…'; }
      msg.textContent = '';
      var envoi;
      try { envoi = window.MCSStore ? window.MCSStore.enregistrerDemande(dem) : Promise.reject(); } catch(err){ envoi = Promise.reject(err); }
      Promise.resolve(envoi).then(function(){
        msg.textContent = form.dataset.merci || ('Merci, votre message a bien été envoyé. Un responsable MCS vous recontacte sous ' + (I.delaiReponse || '48 h') + '.');
        form.reset();
      }, function(){
        msg.innerHTML = 'L’envoi n’a pas abouti (connexion Internet ?). Réessayez, ou écrivez-nous directement sur <a href="https://wa.me/' + esc(I.whatsapp || '') + '" target="_blank" rel="noopener">WhatsApp</a>.';
      }).then(function(){ if (bouton) { bouton.disabled = false; bouton.textContent = texteBouton; } });
    });
  });
};
(window.MCSPret || Promise.resolve()).then(function(){ window.MCSDemarrer(); }, function(){ window.MCSDemarrer(); });
