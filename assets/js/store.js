/* =====================================================================
   MCS — Liaison entre le site et l'espace administrateur
   ---------------------------------------------------------------------
   MODE DÉMONSTRATION (avant Supabase) :
   - les modifications faites dans l'espace admin sont gardées dans ce
     navigateur et appliquées au site ;
   - les demandes envoyées par les formulaires et les statistiques de
     visite sont enregistrées localement pour être vues dans l'admin.
   Quand Supabase sera branché, seul ce fichier changera : il lira et
   écrira dans la base au lieu du navigateur.
   ===================================================================== */
(function(){
  var CLE_DONNEES = 'mcs-donnees', CLE_DEMANDES = 'mcs-demandes', CLE_STATS = 'mcs-stats', CLE_VISITEUR = 'mcs-visiteur';
  function lire(cle, defaut){ try { var v = localStorage.getItem(cle); return v ? JSON.parse(v) : defaut; } catch(e){ return defaut; } }
  function ecrire(cle, val){ try { localStorage.setItem(cle, JSON.stringify(val)); return true; } catch(e){ return false; } }

  // 1. Contenus modifiés dans l'admin
  var surcharge = lire(CLE_DONNEES, null);
  if (surcharge && typeof surcharge === 'object') {
    window.MCS = window.MCS || {};
    Object.keys(surcharge).forEach(function(k){ window.MCS[k] = surcharge[k]; });
  }

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

  function suivre(type, detail){
    var st = lire(CLE_STATS, []);
    st.push({ t: Date.now(), type: type, page: (location.pathname.split('/').pop() || 'index.html') + location.search, detail: detail || '', v: vid, src: source(), app: appareil() });
    if (st.length > 5000) st = st.slice(-5000);
    ecrire(CLE_STATS, st);
  }

  window.MCSStore = {
    mode: 'demo',
    suivre: suivre,
    enregistrerDemande: function(d){
      var l = lire(CLE_DEMANDES, []);
      d.id = 'd' + Date.now().toString(36);
      d.date = new Date().toISOString();
      d.statut = 'nouvelle';
      d.page = location.pathname.split('/').pop() || 'index.html';
      l.unshift(d); ecrire(CLE_DEMANDES, l);
      suivre('demande', d.type || '');
      return d;
    }
  };

  // 3. Page vue
  if (!/\/admin\//.test(location.pathname)) suivre('vue');
})();
