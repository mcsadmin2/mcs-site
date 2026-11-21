/* =====================================================================
   MCS — Liaison entre le site et la base de données (Supabase)
   - lit les contenus modifiés dans l'espace admin (table « contenus ») ;
   - envoie les demandes des formulaires (table « demandes ») ;
   - enregistre les statistiques de visite (table « visites »).
   Si la base ne répond pas, le site s'affiche avec le contenu d'origine
   (donnees.js) ou la dernière version gardée dans le navigateur.
   ===================================================================== */
(function(){
  var CFG = window.MCS_SUPABASE || {}, URL_API = (CFG.url || '') + '/rest/v1/';
  var ENTETES = { apikey: CFG.cle, Authorization: 'Bearer ' + CFG.cle, 'Content-Type': 'application/json' };
  var CLE_CACHE = 'mcs-cache-contenus', CLE_VISITEUR = 'mcs-visiteur';
  var BASE = JSON.parse(JSON.stringify(window.MCS || {}));
  function lire(cle, defaut){ try { var v = localStorage.getItem(cle); return v ? JSON.parse(v) : defaut; } catch(e){ return defaut; } }
  function ecrire(cle, val){ try { localStorage.setItem(cle, JSON.stringify(val)); } catch(e){} }
  function appliquer(lignes){
    var o = JSON.parse(JSON.stringify(BASE));
    (lignes || []).forEach(function(l){ if (l && l.cle) o[l.cle] = l.valeur; });
    window.MCS = o;
  }

  // 1. Contenus : dernière version connue tout de suite, puis version à jour
  var cache = lire(CLE_CACHE, null);
  if (cache) appliquer(cache);
  window.MCSPret = new Promise(function(fini){
    if (!CFG.url || !window.fetch) return fini();
    var minuteur = setTimeout(fini, 3500);
    fetch(URL_API + 'contenus?select=cle,valeur', { headers: ENTETES, cache: 'no-store' })
      .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(l){ appliquer(l); ecrire(CLE_CACHE, l); })
      .catch(function(){})
      .then(function(){ clearTimeout(minuteur); fini(); });
  });

  // 2. Identifiant anonyme du visiteur
  var vid = null;
  try { vid = localStorage.getItem(CLE_VISITEUR); if (!vid) { vid = 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); localStorage.setItem(CLE_VISITEUR, vid); } } catch(e){ vid = 'anonyme'; }

  function source(){
    var r = document.referrer || '', q = '';
    try { q = (new URLSearchParams(location.search).get('utm_source') || '').toLowerCase(); } catch(e){}
    var t = (q + ' ' + r).toLowerCase();
    if (/facebook|fb\./.test(t)) return 'Facebook';
    if (/instagram/.test(t)) return 'Instagram';
    if (/whatsapp|wa\.me/.test(t)) return 'WhatsApp';
    if (/google/.test(t)) return 'Google';
    if (/tiktok/.test(t)) return 'TikTok';
    if (/linkedin/.test(t)) return 'LinkedIn';
    if (!r || r.indexOf(location.host) > -1) return 'Accès direct';
    return 'Autre site';
  }
  function appareil(){ return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Téléphone' : 'Ordinateur'; }
  function nomPage(){ return (location.pathname.split('/').pop() || 'index.html') + location.search; }
  function envoyer(table, ligne, garder){
    return fetch(URL_API + table, { method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, ENTETES), body: JSON.stringify(ligne), keepalive: !!garder })
      .then(function(r){ if (!r.ok) throw new Error('Envoi refusé (' + r.status + ')'); return true; });
  }

  function suivre(type, detail){
    if (!CFG.url || !window.fetch) return;
    if (/localhost|127\.0\.0\.1|claude\.ai|claudeusercontent/.test(location.hostname)) return; // pas de statistiques en aperçu
    envoyer('visites', { type: type, page: nomPage(), detail: detail || '', v: vid, src: source(), app: appareil() }, true).catch(function(){});
  }

  window.MCSStore = {
    mode: 'supabase',
    suivre: suivre,
    enregistrerDemande: function(d){
      var ligne = { type: d.type || 'Demande', nom: d.nom || '', tel: d.tel || '', champs: d.champs || {}, page: nomPage() };
      return envoyer('demandes', ligne).then(function(){ suivre('demande', d.type || ''); return d; });
    }
  };

  // 3. Page vue
  if (!/\/admin\//.test(location.pathname)) suivre('vue');
})();
