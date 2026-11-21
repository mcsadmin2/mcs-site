/* =====================================================================
   MCS — Espace administrateur
   Données, fichiers et comptes : Supabase (projet « MCS SITE WEB »).
   ===================================================================== */
(function(){
  'use strict';
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function(t){ return String(t == null ? '' : t).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var clone = function(o){ return JSON.parse(JSON.stringify(o)); };
  var uid = function(p){ return (p || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var src = function(u){ return !u ? '' : (/^(data:|https?:|blob:|\.\.\/)/.test(u) ? u : '../' + u); };
  var dateFr = function(iso, heure){ if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + (heure ? ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''); };

  /* =================== Stockage (Supabase) =================== */
  var CFG = window.MCS_SUPABASE || {};
  var sb = window.supabase.createClient(CFG.url, CFG.cle, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  var CONTENUS = ['infos', 'diaporama', 'metiersPhotos', 'apropos', 'faq', 'chiffres', 'equipe', 'projets', 'biens', 'articles', 'ordreAccueil'];
  var BASE = clone(window.MCS || {});
  var D = clone(BASE), DEM = [], STATS = [], PROFILS = [], INVITS = [];
  var copieContenus = {};
  function erreurReseau(e){ console.error(e); toast('Échec de l’enregistrement. Vérifiez votre connexion Internet et réessayez.', true); }
  function chargerContenus(){
    return sb.from('contenus').select('cle,valeur').then(function(r){
      if (r.error) throw r.error;
      D = clone(BASE);
      (r.data || []).forEach(function(x){ D[x.cle] = x.valeur; copieContenus[x.cle] = JSON.stringify(x.valeur); });
      if (!D.ordreAccueil) D.ordreAccueil = ['chantier-riviera-bonoumin', 'projet-01', 'chantier-angre-chateau'].concat((D.projets || []).map(function(p){ return p.id; }).filter(function(id){ return ['chantier-riviera-bonoumin', 'projet-01', 'chantier-angre-chateau'].indexOf(id) < 0; }));
    });
  }
  // N'envoie que les rubriques modifiées
  function sauver(msg){
    var lignes = CONTENUS.filter(function(k){ return D[k] !== undefined && JSON.stringify(D[k]) !== copieContenus[k]; }).map(function(k){ return { cle: k, valeur: D[k], maj: new Date().toISOString() }; });
    if (!lignes.length) { toast(msg || 'Enregistré — visible sur le site'); return Promise.resolve(); }
    toast('Enregistrement…');
    return sb.from('contenus').upsert(lignes).then(function(r){
      if (r.error) return erreurReseau(r.error);
      lignes.forEach(function(l){ copieContenus[l.cle] = JSON.stringify(l.valeur); });
      toast(msg || 'Enregistré — visible sur le site');
    });
  }
  function versDemande(x){ return { id: x.id, date: x.cree, type: x.type, nom: x.nom, tel: x.tel, champs: x.champs || {}, page: x.page, statut: x.statut, notes: x.notes }; }
  function chargerDemandes(){
    return sb.from('demandes').select('*').order('cree', { ascending: false }).limit(1000).then(function(r){ if (r.error) throw r.error; DEM = (r.data || []).map(versDemande); majPastilles(); });
  }
  function demandes(){ return DEM; }
  function majDemande(id, champs){
    DEM.forEach(function(d){ if (d.id === id) Object.keys(champs).forEach(function(k){ d[k] = champs[k]; }); }); majPastilles();
    return sb.from('demandes').update(champs).eq('id', id).then(function(r){ if (r.error) erreurReseau(r.error); });
  }
  function supprimerDemande(id){
    DEM = DEM.filter(function(d){ return d.id !== id; }); majPastilles();
    return sb.from('demandes').delete().eq('id', id).then(function(r){ if (r.error) erreurReseau(r.error); });
  }
  function chargerStats(){
    var depuis = new Date(Date.now() - 125 * 864e5).toISOString(), tout = [], pas = 1000;
    function page(i){
      return sb.from('visites').select('t,type,page,detail,v,src,app').gte('t', depuis).order('t').range(i, i + pas - 1).then(function(r){
        if (r.error) throw r.error;
        (r.data || []).forEach(function(e){ e.t = new Date(e.t).getTime(); tout.push(e); });
        if (r.data && r.data.length === pas && i < 200000) return page(i + pas);
      });
    }
    return page(0).then(function(){ STATS = tout; });
  }
  function chargerComptes(){
    if (!moi || moi.role !== 'admin') return Promise.resolve();
    return Promise.all([sb.from('profils').select('*').order('cree'), sb.from('invitations').select('*').order('cree')]).then(function(r){ PROFILS = r[0].data || []; INVITS = r[1].data || []; });
  }

  // Envoi d'un fichier dans le stockage, retourne son adresse publique
  function envoyerFichier(blob, ext, dossier){
    var chemin = (dossier || 'img') + '/' + new Date().toISOString().slice(0, 7) + '/' + uid('f') + '.' + ext;
    return sb.storage.from('medias').upload(chemin, blob, { contentType: blob.type || undefined, cacheControl: '31536000', upsert: false }).then(function(r){
      if (r.error) throw r.error;
      return sb.storage.from('medias').getPublicUrl(chemin).data.publicUrl;
    });
  }

  /* =================== Comptes et connexion =================== */
  var moi = null, modeConnexion = 'connexion';
  var TEXTES = {
    connexion: ['Connexion', 'Accès réservé à l’équipe MCS.', 'Se connecter'],
    creation: ['Créer mon mot de passe', 'Pour un compte ajouté par un administrateur MCS. Un email de confirmation vous sera envoyé.', 'Créer mon accès'],
    oubli: ['Mot de passe oublié', 'Indiquez votre adresse : vous recevrez un lien pour choisir un nouveau mot de passe.', 'Recevoir le lien'],
    nouveau: ['Nouveau mot de passe', 'Choisissez votre nouveau mot de passe (8 caractères minimum).', 'Enregistrer le mot de passe']
  };
  function changerMode(m){
    modeConnexion = m; var t = TEXTES[m];
    $('#c-titre').textContent = t[0]; $('#c-intro').textContent = t[1]; $('#c-bouton').textContent = t[2];
    $('#c-erreur').textContent = ''; $('#c-ok').textContent = '';
    $('#z-email').hidden = m === 'nouveau'; $('#c-id').required = m !== 'nouveau';
    $('#z-mdp').hidden = m === 'oubli'; $('#c-mdp').required = m !== 'oubli';
    $('#z-mdp2').hidden = !(m === 'creation' || m === 'nouveau'); $('#c-mdp2').required = m === 'creation' || m === 'nouveau';
    $('#c-mdp').autocomplete = m === 'connexion' ? 'current-password' : 'new-password';
    $$('#c-liens a').forEach(function(a){ a.hidden = m === 'nouveau' || (m === 'connexion' ? a.dataset.mode === 'connexion' : a.dataset.mode !== 'connexion'); });
  }
  $$('#c-liens a').forEach(function(a){ a.onclick = function(e){ e.preventDefault(); changerMode(a.dataset.mode); }; });
  var ADMIN_URL = location.origin + location.pathname;

  $('#form-connexion').addEventListener('submit', function(e){
    e.preventDefault();
    var email = $('#c-id').value.trim().toLowerCase(), mdp = $('#c-mdp').value, mdp2 = $('#c-mdp2').value, err = $('#c-erreur'), ok = $('#c-ok'), bt = $('#c-bouton');
    err.textContent = ''; ok.textContent = '';
    if ((modeConnexion === 'creation' || modeConnexion === 'nouveau') && mdp !== mdp2) { err.textContent = 'Les deux mots de passe ne correspondent pas.'; return; }
    bt.disabled = true;
    var fin = function(){ bt.disabled = false; };
    if (modeConnexion === 'connexion') {
      sb.auth.signInWithPassword({ email: email, password: mdp }).then(function(r){
        fin();
        if (r.error) { err.textContent = /confirm/i.test(r.error.message) ? 'Adresse pas encore confirmée : ouvrez le lien reçu par email.' : 'Email ou mot de passe incorrect.'; return; }
        demarrer();
      });
    } else if (modeConnexion === 'creation') {
      sb.auth.signUp({ email: email, password: mdp, options: { emailRedirectTo: ADMIN_URL } }).then(function(r){
        fin();
        if (r.error) { err.textContent = /already|registered/i.test(r.error.message) ? 'Ce compte existe déjà : connectez-vous ou utilisez « Mot de passe oublié ».' : 'Impossible de créer le compte : ' + r.error.message; return; }
        if (r.data && r.data.session) { demarrer(); return; }
        ok.textContent = 'C’est presque fini : ouvrez l’email envoyé à ' + email + ' et cliquez sur le lien de confirmation.';
      });
    } else if (modeConnexion === 'oubli') {
      sb.auth.resetPasswordForEmail(email, { redirectTo: ADMIN_URL }).then(function(r){
        fin();
        if (r.error) { err.textContent = 'Envoi impossible pour le moment, réessayez dans quelques minutes.'; return; }
        ok.textContent = 'Si un compte existe pour ' + email + ', un lien vient de vous être envoyé par email.';
      });
    } else {
      sb.auth.updateUser({ password: mdp }).then(function(r){
        fin();
        if (r.error) { err.textContent = 'Mot de passe refusé : ' + r.error.message; return; }
        try { history.replaceState(null, '', location.pathname); } catch(x){}
        changerMode('connexion'); demarrer();
      });
    }
  });
  sb.auth.onAuthStateChange(function(ev){ if (ev === 'PASSWORD_RECOVERY') { $('#app').hidden = true; $('#connexion').hidden = false; changerMode('nouveau'); } });

  function afficherConnexion(msg){
    $('#app').hidden = true; $('#connexion').hidden = false;
    if (msg) $('#c-erreur').textContent = msg;
  }
  function demarrer(){
    if (modeConnexion === 'nouveau') return;
    sb.auth.getSession().then(function(r){
      var s = r.data && r.data.session;
      if (!s) { moi = null; afficherConnexion(); return; }
      return sb.from('profils').select('*').eq('id', s.user.id).maybeSingle().then(function(p){
        var pr = p.data;
        if (!pr || !pr.role) { sb.auth.signOut(); afficherConnexion('Ce compte n’a pas encore accès à l’administration. Demandez à un administrateur MCS de vous ajouter.'); return; }
        moi = { id: pr.id, nom: pr.nom || pr.email, email: pr.email, identifiant: pr.email, role: pr.role };
        $('#connexion').hidden = true; $('#app').hidden = false;
        $('#u-nom').textContent = moi.nom; $('#u-role').textContent = moi.role === 'admin' ? 'Administrateur' : 'Éditeur';
        $('#contenu').innerHTML = '<div class="chargement">Chargement des données…</div>';
        return Promise.all([chargerContenus(), chargerDemandes(), chargerStats().catch(function(e){ console.error(e); }), chargerComptes()]).then(function(){
          construireNav();
          var h = (location.hash || '').slice(1);
          aller(SECTIONS[h] ? h : 'tableau');
        });
      });
    }).catch(function(e){ console.error(e); afficherConnexion('Connexion au serveur impossible. Vérifiez votre connexion Internet puis rechargez la page.'); });
  }

  /* =================== Navigation =================== */
  var IC = {
    tableau: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    demandes: '<path d="M4 4h16v12H7l-3 3z"/><path d="M8 9h8M8 12h5"/>',
    chantiers: '<path d="M3 21h18M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/>',
    projets: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    ordre: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    biens: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    actualites: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h10M7 17h6"/>',
    pages: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
    coordonnees: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    stats: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    comptes: '<circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6"/><path d="M17 11h5M19.5 8.5v5"/>',
    compte: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    sortie: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>'
  };
  function ic(k, t){ return '<svg width="' + (t || 18) + '" height="' + (t || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[k] || '') + '</svg>'; }
  var SECTIONS = {
    tableau: ['Tableau de bord', vueTableau],
    demandes: ['Demandes reçues', vueDemandes],
    chantiers: ['Chantiers', vueChantiers],
    projets: ['Projets 3D et plans', vueProjets],
    ordre: ['Ordre sur l’accueil', vueOrdre],
    biens: ['Biens immobiliers', vueBiens],
    actualites: ['Actualités', vueActualites],
    pages: ['Pages et images', vuePages],
    coordonnees: ['Coordonnées et paramètres', vueCoordonnees],
    stats: ['Statistiques visiteurs', vueStats],
    comptes: ['Comptes utilisateurs', vueComptes],
    compte: ['Mon compte', vueCompte]
  };
  var courant = 'tableau';
  function construireNav(){
    var G = [['', ['tableau', 'demandes', 'stats']], ['Contenu du site', ['chantiers', 'projets', 'ordre', 'biens', 'actualites', 'pages', 'coordonnees']], ['Administration', (moi.role === 'admin' ? ['comptes'] : []).concat(['compte'])]];
    $('#nav').innerHTML = G.map(function(g){ return (g[0] ? '<div class="groupe">' + g[0] + '</div>' : '') + g[1].map(function(k){ return '<button type="button" data-aller="' + k + '">' + ic(k) + '<span>' + SECTIONS[k][0] + '</span>' + (k === 'demandes' ? '<span class="pastille" id="pastille-dem" hidden></span>' : '') + '</button>'; }).join(''); }).join('') +
      '<button type="button" id="deconnexion" style="margin-top:12px">' + ic('sortie') + '<span>Se déconnecter</span></button>';
    $$('#nav [data-aller]').forEach(function(b){ b.onclick = function(){ aller(b.dataset.aller); $('#app').classList.remove('menu-ouvert'); }; });
    $('#deconnexion').onclick = function(){ sb.auth.signOut().then(function(){ location.hash = ''; location.reload(); }); };
    majPastilles();
  }
  function majPastilles(){ var n = demandes().filter(function(d){ return d.statut === 'nouvelle'; }).length, p = $('#pastille-dem'); if (p) { p.hidden = !n; p.textContent = n; } }
  function aller(k){
    if (k === 'comptes' && moi.role !== 'admin') k = 'tableau';
    courant = k; location.hash = k;
    $$('#nav [data-aller]').forEach(function(b){ b.classList.toggle('actif', b.dataset.aller === k); });
    $('#titre-page').textContent = SECTIONS[k][0];
    var c = $('#contenu'); c.innerHTML = '<div id="vue"></div>';
    SECTIONS[k][1]($('#vue'));
    window.scrollTo(0, 0);
  }
  $('#burger').onclick = function(){ $('#app').classList.toggle('menu-ouvert'); };
  document.addEventListener('click', function(e){ if ($('#app').classList.contains('menu-ouvert') && !e.target.closest('#barre') && !e.target.closest('#burger')) $('#app').classList.remove('menu-ouvert'); });

  /* =================== Outils d’interface =================== */
  var tt;
  function toast(m, err){ var t = $('#toast'); t.textContent = m; t.classList.toggle('erreur', !!err); t.classList.add('vu'); clearTimeout(tt); tt = setTimeout(function(){ t.classList.remove('vu'); }, 3200); }
  function ouvrirPanneau(titre, corps, boutons){
    $('#p-titre').textContent = titre;
    var c = $('#p-corps'); c.innerHTML = ''; if (typeof corps === 'string') c.innerHTML = corps; else c.appendChild(corps);
    var p = $('#p-pied'); p.innerHTML = '';
    (boutons || []).forEach(function(b){ var x = document.createElement('button'); x.type = 'button'; x.className = 'btn ' + (b.classe || 'btn-trait') + (b.gauche ? ' gauche' : ''); x.textContent = b.texte; x.onclick = b.action; p.appendChild(x); });
    $('#voile').hidden = false; $('#panneau').hidden = false;
    requestAnimationFrame(function(){ $('#voile').classList.add('ouvert'); $('#panneau').classList.add('ouvert'); });
    return c;
  }
  function fermerPanneau(){ $('#voile').classList.remove('ouvert'); $('#panneau').classList.remove('ouvert'); setTimeout(function(){ $('#voile').hidden = true; $('#panneau').hidden = true; }, 300); }
  $('#p-fermer').onclick = fermerPanneau; $('#voile').onclick = fermerPanneau;
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !$('#panneau').hidden) fermerPanneau(); });
  function confirmer(msg){ return window.confirm(msg); }

  // Champs de formulaire
  function champ(def, val){
    var id = 'f-' + def.k + '-' + Math.random().toString(36).slice(2, 6), v = val == null ? '' : val, h;
    if (def.type === 'textarea') h = '<textarea id="' + id + '" data-k="' + def.k + '" placeholder="' + esc(def.ph || '') + '"' + (def.lignes ? ' style="min-height:' + def.lignes * 26 + 'px"' : '') + '>' + esc(Array.isArray(v) ? v.join('\n\n') : v) + '</textarea>';
    else if (def.type === 'select') h = '<select id="' + id + '" data-k="' + def.k + '">' + def.options.map(function(o){ var ov = Array.isArray(o) ? o[0] : o, ol = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(ov) + '"' + (String(ov) === String(v) ? ' selected' : '') + '>' + esc(ol) + '</option>'; }).join('') + '</select>';
    else h = '<input id="' + id + '" data-k="' + def.k + '" type="' + (def.type || 'text') + '" value="' + esc(Array.isArray(v) ? v.join(', ') : v) + '" placeholder="' + esc(def.ph || '') + '"' + (def.requis ? ' required' : '') + '>';
    return '<div class="champ"' + (def.large ? ' style="grid-column:1/-1"' : '') + '><label for="' + id + '">' + esc(def.label) + '</label>' + h + (def.aide ? '<span class="aide">' + esc(def.aide) + '</span>' : '') + '</div>';
  }
  function lireChamps(zone, defs, obj){
    defs.forEach(function(d){
      var el = $('[data-k="' + d.k + '"]', zone); if (!el) return; var v = el.value;
      if (d.liste === 'para') obj[d.k] = v.split(/\n\s*\n/).map(function(x){ return x.trim(); }).filter(Boolean);
      else if (d.liste === 'virgule') obj[d.k] = v.split(',').map(function(x){ return x.trim(); }).filter(Boolean);
      else if (d.liste === 'ligne') obj[d.k] = v.split('\n').map(function(x){ return x.trim(); }).filter(Boolean);
      else obj[d.k] = v.trim();
    });
    return obj;
  }

  // Images : compression avant enregistrement
  function lireImage(file, max, q){
    return new Promise(function(ok, ko){
      if (!/^image\//.test(file.type)) return ko(new Error('format'));
      var r = new FileReader();
      r.onload = function(){ var im = new Image(); im.onload = function(){
        var w = im.width, h = im.height, s = Math.min(1, (max || 1600) / Math.max(w, h)), c = document.createElement('canvas');
        c.width = Math.round(w * s); c.height = Math.round(h * s); var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(function(b){ if (!b) return ko(new Error('image')); envoyerFichier(b, 'jpg', 'img').then(ok, ko); }, 'image/jpeg', q || .82);
      }; im.onerror = ko; im.src = r.result; };
      r.onerror = ko; r.readAsDataURL(file);
    });
  }
  // Vidéo : envoi du fichier + image d'aperçu tirée de la vidéo
  function envoyerVideo(file){
    if (file.size > 50 * 1024 * 1024) return Promise.reject(new Error('Vidéo trop lourde (50 Mo maximum) : ' + file.name));
    var ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
    var affiche = new Promise(function(ok){
      var v = document.createElement('video'), u = URL.createObjectURL(file), fini = false;
      var stop = function(x){ if (fini) return; fini = true; URL.revokeObjectURL(u); ok(x); };
      v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = u;
      v.onloadeddata = function(){ try { v.currentTime = Math.min(1, (v.duration || 2) / 2); } catch(e){ stop(null); } };
      v.onseeked = function(){
        var s = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight)), c = document.createElement('canvas');
        c.width = Math.round(v.videoWidth * s); c.height = Math.round(v.videoHeight * s); c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        c.toBlob(function(b){ if (!b) return stop(null); envoyerFichier(b, 'jpg', 'img').then(stop, function(){ stop(null); }); }, 'image/jpeg', .8);
      };
      v.onerror = function(){ stop(null); }; setTimeout(function(){ stop(null); }, 15000);
    });
    return Promise.all([envoyerFichier(file, ext, 'videos'), affiche]).then(function(r){ return { src: r[0], affiche: r[1] || '', titre: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }; });
  }
  function choisirFichiers(accept, multiple){
    return new Promise(function(ok){ var i = document.createElement('input'); i.type = 'file'; i.accept = accept; i.multiple = !!multiple; i.onchange = function(){ ok(Array.prototype.slice.call(i.files || [])); }; i.click(); });
  }

  // Gestionnaire de médias (liste ordonnée d'images / vidéos)
  function gestionMedias(zone, liste, opts){
    opts = opts || {};
    function rendre(){
      zone.innerHTML = '<div class="medias">' + liste.map(function(m, i){
        var estVideo = opts.video && m.video;
        return '<div class="media" draggable="true" data-i="' + i + '"><div class="apercu">' + (estVideo ? '<video src="' + esc(src(m.src)) + '" poster="' + esc(src(m.affiche || '')) + '" muted preload="metadata"></video>' : '<img src="' + esc(src(m.mini || m.src)) + '" alt="">') +
          '<span class="num">' + (i + 1) + '</span>' + (estVideo ? '<span class="type">Vidéo</span>' : (opts.etiquette ? '<span class="type">' + esc(opts.etiquette) + '</span>' : '')) + '</div>' +
          '<input value="' + esc(m.titre || '') + '" placeholder="Légende (ex. La façade)" data-legende="' + i + '">' +
          '<div class="outils"><button type="button" data-g="' + i + '" title="Vers la gauche">‹</button><button type="button" data-d="' + i + '" title="Vers la droite">›</button><button type="button" class="sup" data-s="' + i + '" title="Supprimer">✕</button></div></div>';
      }).join('') + '<div class="depot" tabindex="0"><b>+ Ajouter ' + (opts.video ? 'des photos' : 'des images') + '</b><span>Cliquez ou glissez vos fichiers ici</span>' + '</div></div>';
      $$('[data-legende]', zone).forEach(function(inp){ inp.oninput = function(){ liste[+inp.dataset.legende].titre = inp.value; }; });
      $$('[data-g]', zone).forEach(function(b){ b.onclick = function(){ var i = +b.dataset.g; if (i > 0) { liste.splice(i - 1, 0, liste.splice(i, 1)[0]); rendre(); } }; });
      $$('[data-d]', zone).forEach(function(b){ b.onclick = function(){ var i = +b.dataset.d; if (i < liste.length - 1) { liste.splice(i + 1, 0, liste.splice(i, 1)[0]); rendre(); } }; });
      $$('[data-s]', zone).forEach(function(b){ b.onclick = function(){ if (confirmer('Retirer cet élément ?')) { liste.splice(+b.dataset.s, 1); rendre(); } }; });
      var dep = $('.depot', zone);
      dep.onclick = function(){ choisirFichiers('image/*', true).then(ajouter); };
      dep.ondragover = function(e){ e.preventDefault(); dep.classList.add('survol'); };
      dep.ondragleave = function(){ dep.classList.remove('survol'); };
      dep.ondrop = function(e){ e.preventDefault(); dep.classList.remove('survol'); ajouter(Array.prototype.slice.call(e.dataTransfer.files || [])); };
      var glisse = null;
      $$('.media', zone).forEach(function(el){
        el.ondragstart = function(){ glisse = +el.dataset.i; el.classList.add('deplace'); };
        el.ondragend = function(){ el.classList.remove('deplace'); };
        el.ondragover = function(e){ e.preventDefault(); };
        el.ondrop = function(e){ e.preventDefault(); var c = +el.dataset.i; if (glisse == null || glisse === c) return; liste.splice(c, 0, liste.splice(glisse, 1)[0]); glisse = null; rendre(); };
      });
    }
    function ajouter(files){
      files = files.filter(function(f){ return /^image\//.test(f.type); });
      if (!files.length) return;
      toast('Envoi des images…');
      Promise.all(files.map(function(f){ return Promise.all([lireImage(f, opts.max || 1600, .82), lireImage(f, 720, .78)]).then(function(r){ return { src: r[0], mini: r[1], titre: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') }; }); }))
        .then(function(items){ items.forEach(function(it){ liste.push(it); }); rendre(); toast(items.length + (items.length > 1 ? ' images ajoutées' : ' image ajoutée')); })
        .catch(function(e){ console.error(e); toast('Échec de l’envoi de l’image. Vérifiez votre connexion.', true); });
    }
    rendre();
  }
  function choisirImageUnique(zone, valeur, surChange, ratio){
    function rendre(){
      zone.innerHTML = '<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div style="width:200px;aspect-ratio:' + (ratio || '16/10') + ';border-radius:12px;overflow:hidden;background:var(--brume);border:1px solid var(--trait)">' + (valeur ? '<img src="' + esc(src(valeur)) + '" style="width:100%;height:100%;object-fit:cover" alt="">' : '') + '</div><button type="button" class="btn btn-trait btn-petit">Remplacer l’image</button></div>';
      $('button', zone).onclick = function(){ choisirFichiers('image/*').then(function(f){ if (!f[0]) return; lireImage(f[0], 1800, .84).then(function(u){ valeur = u; surChange(u); rendre(); }).catch(function(e){ console.error(e); toast('Échec de l’envoi de l’image (format ou connexion).', true); }); }); };
    }
    rendre();
  }

  /* =================== 1. Tableau de bord =================== */
  function vueTableau(v){
    var dm = demandes(), nv = dm.filter(function(d){ return d.statut === 'nouvelle'; }).length, S = statsCalc(7);
    var P = D.projets || [], ch = P.filter(function(p){ return p.statut === 'en-cours'; }).length, pr = P.filter(function(p){ return p.statut !== 'en-cours'; }).length;
    v.innerHTML = '<div class="grille g4">' +
      kpi('Nouvelles demandes', nv, 'à traiter', nv ? 'rouge' : 'vert') + kpi('Visiteurs (7 jours)', S.visiteurs, S.exemple ? 'données d’exemple' : 'visiteurs uniques', 'bleu') +
      kpi('Chantiers en cours', ch, 'publiés sur le site') + kpi('Projets 3D', pr, 'publiés sur le site', 'bleu') + '</div>' +
      '<div class="grille g2" style="margin-top:18px">' +
      '<div class="carte"><div class="tete-carte"><div><h2>Dernières demandes</h2><p class="sous">Devis et visites envoyés depuis le site</p></div><button class="btn btn-trait btn-petit" data-aller2="demandes">Tout voir</button></div>' +
      (dm.length ? '<div class="liste">' + dm.slice(0, 5).map(function(d){ return '<div class="ligne"><div class="infos"><b>' + esc(d.nom || 'Sans nom') + '</b><small>' + esc(d.type) + ' · ' + dateFr(d.date, true) + '</small></div>' + badgeStatut(d.statut) + '</div>'; }).join('') + '</div>' : '<div class="vide">Aucune demande pour le moment. Elles apparaîtront ici dès qu’un visiteur remplit un formulaire du site.</div>') + '</div>' +
      '<div class="carte"><div class="tete-carte"><div><h2>Actions rapides</h2><p class="sous">Ajouter du contenu au site</p></div></div><div class="grille g2">' +
      [['chantiers', 'Ajouter un chantier'], ['projets', 'Ajouter un projet'], ['biens', 'Ajouter un bien'], ['actualites', 'Publier une actualité'], ['pages', 'Changer les images'], ['coordonnees', 'Modifier les coordonnées']].map(function(a){ return '<button class="btn btn-trait" style="justify-content:flex-start;min-height:52px;border-radius:14px" data-aller2="' + a[0] + '" data-nouveau="' + (/Ajouter|Publier/.test(a[1]) ? 1 : '') + '">' + ic(a[0]) + a[1] + '</button>'; }).join('') + '</div></div></div>' +
      '<div class="carte" style="margin-top:18px"><div class="tete-carte"><div><h2>Visites des 7 derniers jours</h2><p class="sous">' + (S.exemple ? 'Données d’exemple — les vraies statistiques s’afficheront après la mise en ligne' : 'Visiteurs uniques par jour') + '</p></div><button class="btn btn-trait btn-petit" data-aller2="stats">Statistiques complètes</button></div><div class="graph">' + courbe(S.parJour) + '</div></div>';
    $$('[data-aller2]', v).forEach(function(b){ b.onclick = function(){ aller(b.dataset.aller2); if (b.dataset.nouveau) setTimeout(function(){ var n = $('[data-nouveau-el]'); if (n) n.click(); }, 50); }; });
  }
  function kpi(t, n, s, c){ return '<div class="kpi ' + (c || '') + '"><small>' + t + '</small><b>' + n + '</b><span>' + s + '</span></div>'; }
  function badgeStatut(s){ return s === 'nouvelle' ? '<span class="badge rouge">Nouvelle</span>' : s === 'en-cours' ? '<span class="badge jaune">En cours</span>' : '<span class="badge vert">Traitée</span>'; }

  /* =================== 2. Demandes reçues =================== */
  var filtreDem = 'tout';
  function vueDemandes(v){
    var l = demandes(), f = l.filter(function(d){ return filtreDem === 'tout' || d.statut === filtreDem; });
    v.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Toutes les demandes</h2><p class="sous">Chaque formulaire envoyé depuis le site arrive ici (devis, visites de biens).</p></div>' +
      '<div class="filtres">' + [['tout', 'Toutes'], ['nouvelle', 'Nouvelles'], ['en-cours', 'En cours'], ['traitee', 'Traitées']].map(function(x){ return '<button data-f="' + x[0] + '" class="' + (filtreDem === x[0] ? 'actif' : '') + '">' + x[1] + ' (' + (x[0] === 'tout' ? l.length : l.filter(function(d){ return d.statut === x[0]; }).length) + ')</button>'; }).join('') + '</div></div>' +
      (f.length ? '<table class="tableau"><thead><tr><th>Date</th><th>Nom</th><th>Téléphone</th><th>Type</th><th>Statut</th><th></th></tr></thead><tbody>' + f.map(function(d){ return '<tr class="' + (d.statut === 'nouvelle' ? 'nouvelle' : '') + '"><td>' + dateFr(d.date, true) + '</td><td><b>' + esc(d.nom) + '</b></td><td>' + esc(d.tel) + '</td><td>' + esc(d.type) + (d.champs && d.champs.projet ? ' · ' + esc(libProjet(d.champs.projet)) : '') + '</td><td>' + badgeStatut(d.statut) + '</td><td style="text-align:right"><button class="btn btn-bleu btn-petit" data-voir="' + d.id + '">Ouvrir</button></td></tr>'; }).join('') + '</tbody></table>' : '<div class="vide">Aucune demande dans cette catégorie.</div>') + '</div>';
    $$('[data-f]', v).forEach(function(b){ b.onclick = function(){ filtreDem = b.dataset.f; vueDemandes(v); }; });
    $$('[data-voir]', v).forEach(function(b){ b.onclick = function(){ voirDemande(b.dataset.voir, function(){ vueDemandes(v); }); }; });
  }
  function libProjet(p){ return { construction: 'Construction', 'gros-oeuvre': 'Gros œuvre', finition: 'Finition', immobilier: 'Achat ou vente de bien' }[p] || p; }
  function voirDemande(id, apres){
    var l = demandes(), d = l.filter(function(x){ return x.id === id; })[0]; if (!d) return;
    if (d.statut === 'nouvelle') majDemande(id, { statut: 'en-cours' });
    var C = d.champs || {}, lib = { nom: 'Nom', tel: 'Téléphone', projet: 'Type de projet', date: 'Livraison souhaitée', message: 'Message', dispo: 'Disponibilités', bien: 'Bien concerné' };
    var tel = (d.tel || '').replace(/[^\d+]/g, ''), wa = tel.replace(/\D/g, ''); if (wa.length === 10) wa = '225' + wa;
    var corps = '<div class="section-panneau"><h3>' + esc(d.type) + ' — ' + dateFr(d.date, true) + '</h3><dl class="dl">' + Object.keys(C).map(function(k){ return '<dt>' + esc(lib[k] || k) + '</dt><dd>' + esc(k === 'projet' ? libProjet(C[k]) : C[k]) + '</dd>'; }).join('') + '<dt>Page d’envoi</dt><dd>' + esc(d.page || '') + '</dd></dl></div>' +
      '<div class="section-panneau"><h3>Suivi</h3><div class="formu">' + champ({ k: 'statut', label: 'Statut', type: 'select', options: [['nouvelle', 'Nouvelle'], ['en-cours', 'En cours'], ['traitee', 'Traitée']] }, d.statut) + champ({ k: 'notes', label: 'Notes internes', type: 'textarea', ph: 'Ex. rappelé le 20/11, rendez-vous fixé…' }, d.notes) + '</div>' +
      '<div class="actions" style="margin-top:14px">' + (tel ? '<a class="btn btn-trait" href="tel:' + esc(tel) + '">Appeler</a><a class="btn btn-jaune" target="_blank" rel="noopener" href="https://wa.me/' + esc(wa) + '?text=' + encodeURIComponent('Bonjour ' + (d.nom || '') + ', ici MCS. Nous revenons vers vous suite à votre demande sur notre site.') + '">Répondre sur WhatsApp</a>' : '') + '</div></div>';
    var z = ouvrirPanneau('Demande de ' + (d.nom || ''), corps, [
      { texte: 'Supprimer', classe: 'btn-danger', gauche: true, action: function(){ if (!confirmer('Supprimer définitivement cette demande ?')) return; supprimerDemande(id); fermerPanneau(); apres && apres(); toast('Demande supprimée'); } },
      { texte: 'Enregistrer', classe: 'btn-bleu', action: function(){ majDemande(id, { statut: $('[data-k="statut"]', z).value, notes: $('[data-k="notes"]', z).value || null }); fermerPanneau(); apres && apres(); toast('Demande mise à jour'); } }
    ]);
    apres && apres();
  }

  /* =================== 3 & 4. Chantiers et projets =================== */
  function vueListeProjets(v, mode){
    var estCh = mode === 'chantiers', P = D.projets || [];
    var l = P.filter(function(p){ return estCh ? !p.numero && !(p.rendus || []).length && !(p.plans || []).length : (p.numero || (p.rendus || []).length || (p.plans || []).length); });
    v.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>' + (estCh ? 'Chantiers' : 'Projets 3D et plans') + ' (' + l.length + ')</h2><p class="sous">' + (estCh ? 'Chantiers présentés en photos et vidéos dans la partie « Nos chantiers ».' : 'Projets présentés avec leurs images 3D et leurs plans, dans la partie « Nos projets ».') + ' Glissez pour changer l’ordre.</p></div><button class="btn btn-bleu" data-nouveau-el>+ ' + (estCh ? 'Nouveau chantier' : 'Nouveau projet') + '</button></div>' +
      (l.length ? '<div class="liste" id="lp">' + l.map(function(p){
        var im = p.image || ((p.photos || [])[0] || {}).src || ((p.rendus || [])[0] || {}).mini || ((p.videos || [])[0] || {}).affiche || '';
        var n = estCh ? ((p.photos || []).length + ' photo(s) · ' + (p.videos || []).length + ' vidéo(s)') : ((p.rendus || []).length + ' vue(s) 3D · ' + (p.plans || []).length + ' plan(s)');
        return '<div class="ligne" draggable="true" data-id="' + p.id + '"><span class="poignee" title="Glisser">⋮⋮</span><img class="vignette" src="' + esc(src(im)) + '" alt=""><div class="infos"><b>' + (p.numero ? 'Projet ' + esc(p.numero) + ' — ' : '') + esc(p.titre) + '</b><small>' + esc(p.lieu || '—') + ' · ' + n + '</small></div>' +
          (p.masque ? '<span class="badge gris">Masqué</span>' : (estCh ? (p.statut === 'en-cours' ? '<span class="badge jaune">En cours</span>' : '<span class="badge vert">Livré</span>') : '<span class="badge vert">Publié</span>')) +
          '<button class="btn btn-trait btn-petit" data-modif="' + p.id + '">Modifier</button></div>';
      }).join('') + '</div>' : '<div class="vide">Aucun élément pour le moment.</div>') + '</div>';
    $('[data-nouveau-el]', v).onclick = function(){ editerProjet(null, mode, function(){ vueListeProjets(v, mode); }); };
    $$('[data-modif]', v).forEach(function(b){ b.onclick = function(){ editerProjet(b.dataset.modif, mode, function(){ vueListeProjets(v, mode); }); }; });
    trierListe($('#lp', v), function(ids){
      var autres = P.filter(function(p){ return ids.indexOf(p.id) < 0; }), tries = ids.map(function(id){ return P.filter(function(p){ return p.id === id; })[0]; });
      D.projets = estCh ? tries.concat(autres) : autres.filter(function(p){ return p.statut === 'en-cours'; }).concat(tries, autres.filter(function(p){ return p.statut !== 'en-cours'; }));
      sauver('Ordre enregistré'); vueListeProjets(v, mode);
    });
  }
  function vueChantiers(v){ vueListeProjets(v, 'chantiers'); }
  function vueProjets(v){ vueListeProjets(v, 'projets'); }
  function trierListe(zone, fin){
    if (!zone) return; var g = null;
    $$('.ligne', zone).forEach(function(el){
      el.ondragstart = function(){ g = el; el.classList.add('deplace'); };
      el.ondragend = function(){ el.classList.remove('deplace'); fin($$('.ligne', zone).map(function(x){ return x.dataset.id; })); };
      el.ondragover = function(e){ e.preventDefault(); if (!g || g === el) return; var r = el.getBoundingClientRect(); zone.insertBefore(g, (e.clientY - r.top) > r.height / 2 ? el.nextSibling : el); };
    });
  }
  function editerProjet(id, mode, apres){
    var estCh = mode === 'chantiers', P = D.projets = D.projets || [];
    var o = id ? clone(P.filter(function(p){ return p.id === id; })[0]) : (estCh ? { id: uid('chantier'), titre: '', type: 'Villa', metier: 'construction', lieu: '', statut: 'en-cours', resume: '', description: [], photos: [], videos: [] } : { id: uid('projet'), numero: String((P.filter(function(p){ return p.numero; }).length + 1)).padStart(2, '0'), titre: '', type: 'Villa', metier: 'construction', lieu: '', statut: 'projet', resume: '', description: [], points: [], rendus: [], plans: [] });
    var defs = [
      { k: 'titre', label: estCh ? 'Nom du chantier' : 'Titre du projet', ph: estCh ? 'Ex. Villa à étage — Riviera Bonoumin' : 'Ex. Villa duplex contemporaine', requis: 1, large: 1 },
      { k: 'type', label: 'Type de bâtiment', type: 'select', options: ['Villa', 'Maison', 'Immeuble', 'Résidence', 'Bâtiment professionnel', 'Autre'] },
      { k: 'lieu', label: 'Lieu', ph: 'Ex. Cocody, Angré' }
    ];
    if (estCh) defs.push({ k: 'statut', label: 'État du chantier', type: 'select', options: [['en-cours', 'En cours'], ['livre', 'Livré']] });
    else defs.push({ k: 'numero', label: 'Numéro du projet', ph: 'Ex. 08' });
    defs.push({ k: 'masque', label: 'Visibilité', type: 'select', options: [['', 'Visible sur le site'], ['1', 'Masqué (brouillon)']] });
    defs.push({ k: 'resume', label: 'Présentation courte', type: 'textarea', lignes: 3, large: 1, ph: 'Une ou deux phrases affichées sur la page Réalisations.' });
    defs.push({ k: 'description', label: 'Description détaillée', type: 'textarea', lignes: 6, large: 1, liste: 'para', aide: 'Laissez une ligne vide entre deux paragraphes.' });
    if (!estCh) defs.push({ k: 'points', label: 'Points forts', large: 1, liste: 'virgule', ph: 'Ex. R+1, Séjour 71 m², Garage 2 voitures', aide: 'Séparés par des virgules.' });
    var corps = document.createElement('div');
    corps.innerHTML = '<div class="section-panneau"><h3>Informations</h3><div class="formu grille g2">' + defs.map(function(d){ return champ(d, d.k === 'masque' ? (o.masque ? '1' : '') : o[d.k]); }).join('') + '</div></div>' +
      (estCh ? '<div class="section-panneau"><h3>Photos du chantier</h3><p class="sous" style="margin:-6px 0 12px">La première photo est la façade : elle sert d’image principale.</p><div id="z-photos"></div></div>' +
        '<div class="section-panneau"><h3>Vidéos du chantier</h3><div id="z-videos"></div></div>'
      : '<div class="section-panneau"><h3>Images 3D</h3><p class="sous" style="margin:-6px 0 12px">La première image est l’image principale du projet.</p><div id="z-rendus"></div></div><div class="section-panneau"><h3>Plans</h3><p class="sous" style="margin:-6px 0 12px">Envoyez les plans en image (JPG ou PNG). Pour un PDF, faites une capture de chaque page.</p><div id="z-plans"></div></div>');
    var z = ouvrirPanneau(id ? 'Modifier : ' + o.titre : (estCh ? 'Nouveau chantier' : 'Nouveau projet'), corps, [
      id ? { texte: 'Supprimer', classe: 'btn-danger', gauche: true, action: function(){ if (!confirmer('Supprimer « ' + o.titre + ' » du site ?')) return; D.projets = P.filter(function(p){ return p.id !== id; }); D.ordreAccueil = (D.ordreAccueil || []).filter(function(x){ return x !== id; }); sauver('Supprimé'); fermerPanneau(); apres(); } } : null,
      { texte: 'Annuler', action: fermerPanneau },
      { texte: 'Enregistrer et publier', classe: 'btn-bleu', action: function(){
        lireChamps(z, defs, o); o.masque = o.masque === '1';
        if (!o.titre) { toast('Indiquez un titre.', true); return; }
        if (estCh) { o.photos = photos; o.image = (photos[0] || {}).mini || (photos[0] || {}).src || ((o.videos || [])[0] || {}).affiche || ''; }
        else { o.rendus = rendus; o.plans = plans; o.image = (rendus[0] || {}).mini || (rendus[0] || {}).src || ''; }
        var i = P.map(function(p){ return p.id; }).indexOf(o.id);
        if (i > -1) P[i] = o; else { if (estCh) P.unshift(o); else P.push(o); if ((D.ordreAccueil || []).indexOf(o.id) < 0) (D.ordreAccueil = D.ordreAccueil || []).push(o.id); }
        D.projets = P; sauver(); fermerPanneau(); apres();
      } }
    ].filter(Boolean));
    var photos = clone(o.photos || []), rendus = clone(o.rendus || []), plans = clone(o.plans || []);
    if (estCh) {
      gestionMedias($('#z-photos', z), photos, {});
      var vz = $('#z-videos', z), vids = o.videos = o.videos || [];
      var rv = function(){ vz.innerHTML = (vids.length ? '<div class="medias">' + vids.map(function(m, i){ return '<div class="media"><div class="apercu"><video src="' + esc(src(m.src)) + '" poster="' + esc(src(m.affiche || '')) + '" muted preload="metadata"></video><span class="num">' + (i + 1) + '</span><span class="type">Vidéo</span></div><input value="' + esc(m.titre || '') + '" data-vt="' + i + '" placeholder="Légende"><div class="outils"><button type="button" data-vg="' + i + '">‹</button><button type="button" data-vd="' + i + '">›</button><button type="button" class="sup" data-vs="' + i + '">✕</button></div></div>'; }).join('') + '</div>' : '<div class="vide" style="padding:20px">Aucune vidéo.</div>') + '<button type="button" class="btn btn-trait btn-petit" data-vajout style="margin-top:12px">+ Ajouter des vidéos</button><p class="sous" style="margin-top:8px">Format MP4 conseillé, 50 Mo maximum par vidéo.</p>';
        $('[data-vajout]', vz).onclick = function(){ choisirFichiers('video/*', true).then(function(files){
          files = files.filter(function(f){ return /^video\//.test(f.type) || /\.(mp4|mov|webm|m4v)$/i.test(f.name); }); if (!files.length) return;
          toast('Envoi de ' + files.length + ' vidéo(s)… gardez cette page ouverte.');
          files.reduce(function(pr, f){ return pr.then(function(){ return envoyerVideo(f).then(function(it){ vids.push(it); rv(); }); }); }, Promise.resolve())
            .then(function(){ toast('Vidéo(s) ajoutée(s) — pensez à enregistrer'); }).catch(function(e){ toast(e && e.message && /lourde/.test(e.message) ? e.message : 'Échec de l’envoi de la vidéo.', true); });
        }); };
        $$('[data-vt]', vz).forEach(function(i){ i.oninput = function(){ vids[+i.dataset.vt].titre = i.value; }; });
        $$('[data-vg]', vz).forEach(function(b){ b.onclick = function(){ var i = +b.dataset.vg; if (i > 0) { vids.splice(i - 1, 0, vids.splice(i, 1)[0]); rv(); } }; });
        $$('[data-vd]', vz).forEach(function(b){ b.onclick = function(){ var i = +b.dataset.vd; if (i < vids.length - 1) { vids.splice(i + 1, 0, vids.splice(i, 1)[0]); rv(); } }; });
        $$('[data-vs]', vz).forEach(function(b){ b.onclick = function(){ if (confirmer('Retirer cette vidéo ?')) { vids.splice(+b.dataset.vs, 1); rv(); } }; });
      };
      rv();
    } else {
      gestionMedias($('#z-rendus', z), rendus, { etiquette: '3D' });
      gestionMedias($('#z-plans', z), plans, { etiquette: 'Plan', max: 3000 });
    }
  }

  /* =================== 5. Ordre sur l’accueil =================== */
  function vueOrdre(v){
    var P = D.projets || [], ordre = (D.ordreAccueil || []).filter(function(id){ return P.some(function(p){ return p.id === id; }); });
    var aff = ordre.map(function(id){ return P.filter(function(p){ return p.id === id; })[0]; }), cache = P.filter(function(p){ return ordre.indexOf(p.id) < 0; });
    function ligne(p, dedans){ var im = p.image || ((p.photos || [])[0] || {}).src || ''; return '<div class="ligne" draggable="' + (dedans ? 'true' : 'false') + '" data-id="' + p.id + '">' + (dedans ? '<span class="poignee">⋮⋮</span>' : '') + '<img class="vignette" src="' + esc(src(im)) + '" alt=""><div class="infos"><b>' + esc(p.titre) + '</b><small>' + (p.statut === 'en-cours' ? 'Chantier en cours' : p.numero ? 'Projet ' + esc(p.numero) : 'Chantier') + '</small></div><button class="btn ' + (dedans ? 'btn-trait' : 'btn-bleu') + ' btn-petit" data-bascule="' + p.id + '">' + (dedans ? 'Retirer' : 'Afficher') + '</button></div>'; }
    v.innerHTML = '<div class="grille g2"><div class="carte"><div class="tete-carte"><div><h2>Affichés sur l’accueil (' + aff.length + ')</h2><p class="sous">Partie « Réalisations » de la page d’accueil, dans cet ordre. Glissez pour réorganiser.</p></div></div><div class="liste" id="lo">' + (aff.map(function(p){ return ligne(p, true); }).join('') || '<div class="vide">Aucun élément affiché.</div>') + '</div></div>' +
      '<div class="carte"><div class="tete-carte"><div><h2>Non affichés (' + cache.length + ')</h2><p class="sous">Toujours visibles sur la page Réalisations.</p></div></div><div class="liste">' + (cache.map(function(p){ return ligne(p, false); }).join('') || '<div class="vide">Tout est affiché.</div>') + '</div></div></div>';
    $$('[data-bascule]', v).forEach(function(b){ b.onclick = function(){ var id = b.dataset.bascule, i = ordre.indexOf(id); if (i > -1) ordre.splice(i, 1); else ordre.push(id); D.ordreAccueil = ordre; sauver('Accueil mis à jour'); vueOrdre(v); }; });
    trierListe($('#lo', v), function(ids){ D.ordreAccueil = ids; sauver('Ordre enregistré'); });
  }

  /* =================== 6. Biens immobiliers =================== */
  function vueBiens(v){
    var B = D.biens = D.biens || [];
    var lib = { disponible: ['Disponible', 'vert'], reserve: ['Réservé', 'jaune'], vendu: ['Vendu', 'gris'] };
    v.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Biens à vendre (' + B.length + ')</h2><p class="sous">Tant qu’aucun bien n’est publié, la page Immobilier affiche « Aucun bien en vente pour le moment ».</p></div><button class="btn btn-bleu" data-nouveau-el>+ Nouveau bien</button></div>' +
      (B.length ? '<div class="liste" id="lb">' + B.map(function(b){ var s = lib[b.statut] || lib.disponible; return '<div class="ligne" draggable="true" data-id="' + b.id + '"><span class="poignee">⋮⋮</span><img class="vignette" src="' + esc(src(b.image)) + '" alt=""><div class="infos"><b>' + esc(b.titre) + '</b><small>' + esc(b.type) + ' · ' + esc(b.lieu) + ' · ' + esc(b.prix) + '</small></div>' + (b.masque ? '<span class="badge gris">Masqué</span>' : '<span class="badge ' + s[1] + '">' + s[0] + '</span>') + '<button class="btn btn-trait btn-petit" data-modif="' + b.id + '">Modifier</button></div>'; }).join('') + '</div>' : '<div class="vide">Aucun bien pour le moment. Cliquez sur « Nouveau bien » pour en publier un.</div>') + '</div>';
    $('[data-nouveau-el]', v).onclick = function(){ editerBien(null, function(){ vueBiens(v); }); };
    $$('[data-modif]', v).forEach(function(b){ b.onclick = function(){ editerBien(b.dataset.modif, function(){ vueBiens(v); }); }; });
    trierListe($('#lb', v), function(ids){ D.biens = ids.map(function(id){ return B.filter(function(b){ return b.id === id; })[0]; }); sauver('Ordre enregistré'); });
  }
  function editerBien(id, apres){
    var B = D.biens = D.biens || [];
    var o = id ? clone(B.filter(function(b){ return b.id === id; })[0]) : { id: uid('bien'), titre: '', type: 'Villa', lieu: '', prix: '', surface: '', terrain: '', chambres: '', sdb: '', statut: 'disponible', description: [], galerie: [] };
    var defs = [
      { k: 'titre', label: 'Titre du bien', ph: 'Ex. Villa duplex 5 pièces', large: 1 },
      { k: 'type', label: 'Type', type: 'select', options: ['Villa', 'Appartement', 'Terrain', 'Immeuble'] },
      { k: 'statut', label: 'Statut', type: 'select', options: [['disponible', 'Disponible'], ['reserve', 'Réservé'], ['vendu', 'Vendu']] },
      { k: 'lieu', label: 'Lieu', ph: 'Ex. Cocody, Riviera 3' },
      { k: 'prix', label: 'Prix', ph: 'Ex. 150 000 000 FCFA' },
      { k: 'surface', label: 'Surface habitable', ph: 'Ex. 250 m²' },
      { k: 'terrain', label: 'Surface du terrain', ph: 'Ex. 500 m²' },
      { k: 'chambres', label: 'Nombre de chambres', ph: 'Ex. 4' },
      { k: 'sdb', label: 'Salles de bain', ph: 'Ex. 3' },
      { k: 'masque', label: 'Visibilité', type: 'select', options: [['', 'Visible sur le site'], ['1', 'Masqué (brouillon)']] },
      { k: 'description', label: 'Description', type: 'textarea', lignes: 6, large: 1, liste: 'para', aide: 'Laissez une ligne vide entre deux paragraphes.' }
    ];
    var photos = (o.galerie || []).map(function(s){ return typeof s === 'string' ? { src: s } : s; });
    if (!photos.length && o.image) photos = [{ src: o.image }];
    var corps = '<div class="section-panneau"><h3>Informations</h3><div class="formu grille g2">' + defs.map(function(d){ return champ(d, d.k === 'masque' ? (o.masque ? '1' : '') : o[d.k]); }).join('') + '</div></div><div class="section-panneau"><h3>Photos</h3><p class="sous" style="margin:-6px 0 12px">La première photo est l’image principale du bien.</p><div id="z-ph"></div></div>';
    var z = ouvrirPanneau(id ? 'Modifier : ' + o.titre : 'Nouveau bien', corps, [
      id ? { texte: 'Supprimer', classe: 'btn-danger', gauche: true, action: function(){ if (!confirmer('Supprimer ce bien ?')) return; D.biens = B.filter(function(b){ return b.id !== id; }); sauver('Bien supprimé'); fermerPanneau(); apres(); } } : null,
      { texte: 'Annuler', action: fermerPanneau },
      { texte: 'Enregistrer et publier', classe: 'btn-bleu', action: function(){
        lireChamps(z, defs, o); o.masque = o.masque === '1';
        if (!o.titre) { toast('Indiquez un titre.', true); return; }
        o.galerie = photos.map(function(p){ return p.src; }); o.image = (photos[0] || {}).mini || (photos[0] || {}).src || '';
        var i = B.map(function(b){ return b.id; }).indexOf(o.id); if (i > -1) B[i] = o; else B.unshift(o);
        sauver(); fermerPanneau(); apres();
      } }
    ].filter(Boolean));
    gestionMedias($('#z-ph', z), photos, {});
  }

  /* =================== 7. Actualités =================== */
  function vueActualites(v){
    var A = D.articles = D.articles || [];
    v.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Articles (' + A.length + ')</h2><p class="sous">Le message « Aucune actualité pour le moment » disparaît dès le premier article publié.</p></div><button class="btn btn-bleu" data-nouveau-el>+ Nouvel article</button></div>' +
      (A.length ? '<div class="liste">' + A.map(function(a){ return '<div class="ligne"><img class="vignette" src="' + esc(src(a.image)) + '" alt=""><div class="infos"><b>' + esc(a.titre) + '</b><small>' + esc(a.categorie) + ' · ' + esc(a.date) + '</small></div>' + (a.statut === 'brouillon' ? '<span class="badge gris">Brouillon</span>' : '<span class="badge vert">Publié</span>') + '<button class="btn btn-trait btn-petit" data-modif="' + a.id + '">Modifier</button></div>'; }).join('') + '</div>' : '<div class="vide">Aucun article. Cliquez sur « Nouvel article » pour publier votre première actualité.</div>') + '</div>';
    $('[data-nouveau-el]', v).onclick = function(){ editerArticle(null, function(){ vueActualites(v); }); };
    $$('[data-modif]', v).forEach(function(b){ b.onclick = function(){ editerArticle(b.dataset.modif, function(){ vueActualites(v); }); }; });
  }
  function editerArticle(id, apres){
    var A = D.articles = D.articles || [];
    var o = id ? clone(A.filter(function(a){ return a.id === id; })[0]) : { id: uid('article'), titre: '', categorie: 'Chantier', date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), resume: '', contenu: [], image: '', statut: 'publie' };
    var defs = [
      { k: 'titre', label: 'Titre', large: 1, ph: 'Ex. Remise des clés d’une villa à Cocody' },
      { k: 'categorie', label: 'Catégorie', type: 'select', options: ['Chantier', 'Conseils', 'Entreprise'] },
      { k: 'date', label: 'Date affichée', ph: 'Ex. 20 novembre 2026' },
      { k: 'statut', label: 'Publication', type: 'select', options: [['publie', 'Publié sur le site'], ['brouillon', 'Brouillon (non visible)']] },
      { k: 'resume', label: 'Résumé', type: 'textarea', lignes: 3, large: 1, ph: 'Une ou deux phrases d’introduction.' },
      { k: 'contenu', label: 'Texte de l’article', type: 'textarea', lignes: 10, large: 1, liste: 'para', aide: 'Laissez une ligne vide entre deux paragraphes.' }
    ];
    var corps = '<div class="section-panneau"><h3>Article</h3><div class="formu grille g2">' + defs.map(function(d){ return champ(d, o[d.k]); }).join('') + '</div></div><div class="section-panneau"><h3>Photo de couverture</h3><div id="z-img"></div></div>';
    var z = ouvrirPanneau(id ? 'Modifier l’article' : 'Nouvel article', corps, [
      id ? { texte: 'Supprimer', classe: 'btn-danger', gauche: true, action: function(){ if (!confirmer('Supprimer cet article ?')) return; D.articles = A.filter(function(a){ return a.id !== id; }); sauver('Article supprimé'); fermerPanneau(); apres(); } } : null,
      { texte: 'Annuler', action: fermerPanneau },
      { texte: 'Enregistrer', classe: 'btn-bleu', action: function(){
        lireChamps(z, defs, o); if (!o.titre) { toast('Indiquez un titre.', true); return; }
        var i = A.map(function(a){ return a.id; }).indexOf(o.id); if (i > -1) A[i] = o; else A.unshift(o);
        sauver(o.statut === 'brouillon' ? 'Brouillon enregistré' : 'Article publié'); fermerPanneau(); apres();
      } }
    ].filter(Boolean));
    choisirImageUnique($('#z-img', z), o.image, function(u){ o.image = u; });
  }

  /* =================== 8. Pages et images =================== */
  var ongletPage = 'accueil';
  function vuePages(v){
    var O = [['accueil', 'Accueil — diaporama'], ['metiers', 'Photos des métiers'], ['apropos', 'À propos'], ['faq', 'Questions fréquentes']];
    v.innerHTML = '<div class="onglets">' + O.map(function(o){ return '<button data-o="' + o[0] + '" class="' + (ongletPage === o[0] ? 'actif' : '') + '">' + o[1] + '</button>'; }).join('') + '</div><div id="op"></div>';
    $$('[data-o]', v).forEach(function(b){ b.onclick = function(){ ongletPage = b.dataset.o; vuePages(v); }; });
    var z = $('#op', v);
    if (ongletPage === 'accueil') {
      var dp = D.diaporama = D.diaporama || [];
      z.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Diaporama de la page d’accueil</h2><p class="sous">Les 4 grandes photos qui défilent en haut de l’accueil, avec leur titre et leur légende.</p></div><button class="btn btn-bleu" id="sv">Enregistrer</button></div><div class="grille g2">' +
        dp.map(function(d, i){ return '<div class="section-panneau" style="margin:0"><h3>Photo ' + (i + 1) + '</h3><div id="dz' + i + '"></div><div class="formu" style="margin-top:12px">' + champ({ k: 'titre' + i, label: 'Titre (bouton)' }, d.titre) + champ({ k: 'legende' + i, label: 'Légende' }, d.legende) + '</div></div>'; }).join('') + '</div></div>';
      dp.forEach(function(d, i){ choisirImageUnique($('#dz' + i, z), d.image, function(u){ d.image = u; }); });
      $('#sv', z).onclick = function(){ dp.forEach(function(d, i){ d.titre = $('[data-k="titre' + i + '"]', z).value.trim(); d.legende = $('[data-k="legende' + i + '"]', z).value.trim(); }); sauver(); };
    }
    if (ongletPage === 'metiers') {
      var M = D.metiersPhotos = D.metiersPhotos || {}, N = [['construction', 'Construction'], ['gros-oeuvre', 'Gros œuvre'], ['finition', 'Finition'], ['immobilier', 'Immobilier']];
      z.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Photos des 4 métiers</h2><p class="sous">Utilisées sur la page « Nos métiers » et dans la partie métiers de l’accueil.</p></div><button class="btn btn-bleu" id="sv">Enregistrer</button></div><div class="grille g2">' + N.map(function(n){ return '<div class="section-panneau" style="margin:0"><h3>' + n[1] + '</h3><div id="mz-' + n[0] + '"></div></div>'; }).join('') + '</div></div>';
      N.forEach(function(n){ choisirImageUnique($('#mz-' + n[0], z), M[n[0]], function(u){ M[n[0]] = u; }, '16/9'); });
      $('#sv', z).onclick = function(){ sauver(); };
    }
    if (ongletPage === 'apropos') {
      var A = D.apropos = D.apropos || {}, C = D.chiffres = D.chiffres || [], EQ = D.equipe = (D.equipe && !Array.isArray(D.equipe)) ? D.equipe : { image: '', legende: 'L’équipe MCS' };
      z.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Page À propos</h2><p class="sous">Textes principaux, chiffres clés et photos.</p></div><button class="btn btn-bleu" id="sv">Enregistrer</button></div>' +
        '<div class="formu">' + champ({ k: 'histoire', label: 'Notre histoire', type: 'textarea', lignes: 10, aide: 'Laissez une ligne vide entre deux paragraphes.' }, A.histoire) + champ({ k: 'fondateur', label: 'Texte sur le fondateur', type: 'textarea', lignes: 7, aide: 'Laissez une ligne vide entre deux paragraphes.' }, A.fondateur) + '</div>' +
        '<h3 style="margin:24px 0 10px;font-size:15px">Chiffres clés</h3><div class="grille g2">' + C.map(function(c, i){ return '<div class="grille g2" style="gap:8px">' + champ({ k: 'cv' + i, label: 'Chiffre ' + (i + 1) }, c.valeur) + champ({ k: 'cl' + i, label: 'Libellé' }, c.libelle) + '</div>'; }).join('') + '</div>' +
        '<div class="grille g2" style="margin-top:22px"><div class="section-panneau" style="margin:0"><h3>Photo du fondateur</h3><div id="pf"></div></div><div class="section-panneau" style="margin:0"><h3>Photo de l’équipe</h3><div id="pe"></div></div></div></div>';
      choisirImageUnique($('#pf', z), A.photoFondateur, function(u){ A.photoFondateur = u; }, '3/4');
      choisirImageUnique($('#pe', z), EQ.image, function(u){ EQ.image = u; }, '3/2');
      $('#sv', z).onclick = function(){
        A.histoire = $('[data-k="histoire"]', z).value.split(/\n\s*\n/).map(function(x){ return x.trim(); }).filter(Boolean);
        A.fondateur = $('[data-k="fondateur"]', z).value.split(/\n\s*\n/).map(function(x){ return x.trim(); }).filter(Boolean);
        C.forEach(function(c, i){ c.valeur = $('[data-k="cv' + i + '"]', z).value.trim(); c.libelle = $('[data-k="cl' + i + '"]', z).value.trim(); });
        D.equipe = EQ; sauver();
      };
    }
    if (ongletPage === 'faq') {
      var F = D.faq = D.faq || {}, PG = [['immobilier', 'Immobilier'], ['contact', 'Contact']];
      var pg = z.dataset.pg || 'immobilier';
      var rendreFaq = function(){
        var L = F[pg] = F[pg] || [];
        z.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Questions fréquentes</h2><p class="sous">Les réponses entre [crochets] sont à compléter.</p></div><button class="btn btn-bleu" id="sv">Enregistrer</button></div><div class="filtres" style="margin-bottom:16px">' + PG.map(function(p){ return '<button data-pg="' + p[0] + '" class="' + (pg === p[0] ? 'actif' : '') + '">' + p[1] + '</button>'; }).join('') + '</div>' +
          '<div class="liste">' + L.map(function(x, i){ return '<div class="section-panneau" style="margin:0"><div class="formu">' + champ({ k: 'q' + i, label: 'Question ' + (i + 1) }, x.q) + champ({ k: 'r' + i, label: 'Réponse', type: 'textarea', lignes: 3 }, x.r) + '</div><div class="actions" style="margin-top:10px"><button class="btn btn-trait btn-petit" data-h="' + i + '">Monter</button><button class="btn btn-trait btn-petit" data-b="' + i + '">Descendre</button><button class="btn btn-danger btn-petit" data-x="' + i + '">Supprimer</button></div></div>'; }).join('') + '</div><button class="btn btn-trait" id="ajq" style="margin-top:14px">+ Ajouter une question</button></div>';
        var lire2 = function(){ L.forEach(function(x, i){ x.q = $('[data-k="q' + i + '"]', z).value.trim(); x.r = $('[data-k="r' + i + '"]', z).value.trim(); }); };
        $$('[data-pg]', z).forEach(function(b){ b.onclick = function(){ lire2(); pg = z.dataset.pg = b.dataset.pg; rendreFaq(); }; });
        $$('[data-h]', z).forEach(function(b){ b.onclick = function(){ lire2(); var i = +b.dataset.h; if (i > 0) L.splice(i - 1, 0, L.splice(i, 1)[0]); rendreFaq(); }; });
        $$('[data-b]', z).forEach(function(b){ b.onclick = function(){ lire2(); var i = +b.dataset.b; if (i < L.length - 1) L.splice(i + 1, 0, L.splice(i, 1)[0]); rendreFaq(); }; });
        $$('[data-x]', z).forEach(function(b){ b.onclick = function(){ if (!confirmer('Supprimer cette question ?')) return; lire2(); L.splice(+b.dataset.x, 1); rendreFaq(); }; });
        $('#ajq', z).onclick = function(){ lire2(); L.push({ q: '', r: '' }); rendreFaq(); };
        $('#sv', z).onclick = function(){ lire2(); F[pg] = L.filter(function(x){ return x.q; }); sauver(); rendreFaq(); };
      };
      rendreFaq();
    }
  }

  /* =================== 9. Coordonnées et paramètres =================== */
  function vueCoordonnees(v){
    var I = D.infos = D.infos || {};
    var G = [
      ['Contact', [{ k: 'telephone', label: 'Téléphone affiché', ph: '+225 27 22 58 72 88' }, { k: 'whatsappAffiche', label: 'WhatsApp affiché', ph: '+225 01 00 90 71 71' }, { k: 'whatsapp', label: 'WhatsApp (pour les liens)', ph: '2250100907171', aide: 'Chiffres uniquement, avec l’indicatif 225.' }, { k: 'email', label: 'Adresse email', ph: 'contact@malaukconstructionservices.com', aide: 'Reste masquée sur le site tant qu’elle est vide.' }, { k: 'delaiReponse', label: 'Délai de réponse annoncé', ph: '48 h' }]],
      ['Bureau', [{ k: 'adresse', label: 'Adresse', large: 1 }, { k: 'horaires', label: 'Horaires', type: 'textarea', lignes: 3, aide: 'Une ligne par plage horaire.' }, { k: 'carte', label: 'Position GPS de la carte', ph: '5.336904,-3.940645' }, { k: 'lienCarte', label: 'Lien Google Maps (bouton Itinéraire)', large: 1 }]],
      ['Réseaux sociaux', [{ k: 'facebook', label: 'Facebook', ph: 'https://facebook.com/…' }, { k: 'instagram', label: 'Instagram', ph: 'https://instagram.com/…' }, { k: 'linkedin', label: 'LinkedIn' }, { k: 'tiktok', label: 'TikTok' }]]
    ];
    v.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Coordonnées de MCS</h2><p class="sous">Une modification ici s’applique partout sur le site (pied de page, page Contact, boutons WhatsApp…).</p></div><button class="btn btn-bleu" id="sv">Enregistrer</button></div>' +
      G.map(function(g){ return '<h3 style="font-size:15px;margin:18px 0 10px">' + g[0] + '</h3><div class="formu grille g2">' + g[1].map(function(d){ return champ(d, /^\[/.test(I[d.k] || '') ? '' : I[d.k]); }).join('') + '</div>'; }).join('') + '</div>' +
      '<div class="carte"><div class="tete-carte"><div><h2>Sauvegarde des données</h2><p class="sous">Téléchargez une copie de tout le contenu du site et des demandes reçues.</p></div></div><div class="actions"><button class="btn btn-trait" id="exp">Télécharger une sauvegarde</button><button class="btn btn-danger" id="rz">Revenir au contenu d’origine</button></div></div>';
    $('#sv', v).onclick = function(){ G.forEach(function(g){ lireChamps(v, g[1], I); }); sauver(); };
    $('#exp', v).onclick = function(){ var o = { exporte: new Date().toISOString(), contenus: {}, demandes: demandes() }; CONTENUS.forEach(function(k){ o.contenus[k] = D[k]; }); var b = new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'mcs-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); };
    $('#rz', v).onclick = function(){ if (!confirmer('Annuler toutes les modifications faites dans l’admin et revenir au contenu d’origine ? (Les demandes, statistiques et comptes sont conservés.)')) return; sb.from('contenus').delete().neq('cle', '').then(function(r){ if (r.error) return erreurReseau(r.error); location.reload(); }); };
  }

  /* =================== 10. Statistiques =================== */
  var periodeStats = 30;
  function evenements(){ return { l: STATS, exemple: false }; }
  function statsCalc(jours){
    var E = evenements(), debut = Date.now() - jours * 864e5, prec = debut - jours * 864e5;
    var l = E.l.filter(function(e){ return e.t >= debut; }), lp = E.l.filter(function(e){ return e.t >= prec && e.t < debut; });
    var uniq = function(a){ var o = {}; a.forEach(function(e){ o[e.v] = 1; }); return Object.keys(o).length; };
    var compte = function(a, f){ var o = {}; a.forEach(function(e){ var k = f(e); if (k) o[k] = (o[k] || 0) + 1; }); return Object.keys(o).map(function(k){ return [k, o[k]]; }).sort(function(x, y){ return y[1] - x[1]; }); };
    var vues = l.filter(function(e){ return e.type === 'vue'; });
    var parJour = []; for (var d = jours - 1; d >= 0; d--) { var j0 = new Date(); j0.setHours(0, 0, 0, 0); var a = j0.getTime() - d * 864e5, b = a + 864e5; parJour.push([a, uniq(vues.filter(function(e){ return e.t >= a && e.t < b; }))]); }
    var visParSource = {}; vues.forEach(function(e){ visParSource[e.v] = e.src; });
    var visParApp = {}; vues.forEach(function(e){ visParApp[e.v] = e.app; });
    var nbType = function(t){ return l.filter(function(e){ return e.type === t; }).length; };
    var convertis = {}; l.forEach(function(e){ if (e.type === 'whatsapp' || e.type === 'demande' || e.type === 'appel') convertis[e.v] = 1; });
    var V = uniq(vues), Vp = uniq(lp.filter(function(e){ return e.type === 'vue'; }));
    return {
      exemple: E.exemple, visiteurs: V, evol: Vp ? Math.round((V - Vp) / Vp * 100) : 0, vues: vues.length, parJour: parJour,
      pages: compte(vues, function(e){ return nomPage(e.page); }).slice(0, 8),
      sources: compte(Object.keys(visParSource).map(function(k){ return { s: visParSource[k] }; }), function(e){ return e.s; }),
      appareils: compte(Object.keys(visParApp).map(function(k){ return { s: visParApp[k] }; }), function(e){ return e.s; }),
      wa: nbType('whatsapp'), appels: nbType('appel'), demandes: nbType('demande'), visionneuse: nbType('visionneuse'), vue3d: nbType('vue3d'),
      conversion: V ? (Object.keys(convertis).length / V * 100) : 0
    };
  }
  function nomPage(p){
    p = (p || '').replace(/^\//, '');
    var m = p.match(/projet\.html\?id=([^&]+)/); if (m) { var o = (D.projets || []).filter(function(x){ return x.id === m[1]; })[0]; return o ? '↳ ' + o.titre : 'Fiche projet'; }
    var b = p.split('?')[0];
    return { 'index.html': 'Accueil', '': 'Accueil', 'a-propos.html': 'À propos', 'realisations.html': 'Réalisations', 'metiers.html': 'Nos métiers', 'construction.html': 'Construction', 'gros-oeuvre.html': 'Gros œuvre', 'finition.html': 'Finition', 'immobilier.html': 'Immobilier', 'bien.html': 'Fiche bien', 'actualites.html': 'Actualités', 'article.html': 'Article', 'contact.html': 'Contact', 'mentions-legales.html': 'Mentions légales' }[b] || b;
  }
  function courbe(pts){
    var W = 900, H = 220, pl = 36, pb = 26, pt = 12, max = Math.max(5, Math.max.apply(null, pts.map(function(p){ return p[1]; })));
    var pasY = max <= 20 ? 5 : max <= 60 ? 10 : max <= 150 ? 25 : 50; max = Math.ceil(max / pasY) * pasY; var nbT = max / pasY;
    var x = function(i){ return pl + i * (W - pl - 10) / Math.max(1, pts.length - 1); }, y = function(v){ return pt + (H - pt - pb) * (1 - v / max); };
    var ligne = pts.map(function(p, i){ return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p[1]).toFixed(1); }).join(' ');
    var aire = ligne + ' L' + x(pts.length - 1) + ' ' + (H - pb) + ' L' + x(0) + ' ' + (H - pb) + ' Z';
    var g = ''; for (var k = 0; k <= nbT; k++) { var vv = pasY * k; g += '<line x1="' + pl + '" x2="' + (W - 10) + '" y1="' + y(vv) + '" y2="' + y(vv) + '" stroke="#E6EEF6"/><text x="' + (pl - 8) + '" y="' + (y(vv) + 4) + '" text-anchor="end" font-size="11" fill="#7A8CA5">' + Math.round(vv) + '</text>'; }
    var pas = Math.ceil(pts.length / 7), et = pts.map(function(p, i){ return (i % pas === 0 || i === pts.length - 1) ? '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="' + (i === pts.length - 1 ? 'end' : i === 0 ? 'start' : 'middle') + '" font-size="11" fill="#7A8CA5">' + new Date(p[0]).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + '</text>' : ''; }).join('');
    var pointsSvg = pts.length <= 14 ? pts.map(function(p, i){ return '<circle cx="' + x(i) + '" cy="' + y(p[1]) + '" r="3.5" fill="#fff" stroke="#114B9D" stroke-width="2"><title>' + p[1] + ' visiteurs</title></circle>'; }).join('') : '';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Évolution des visiteurs"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C66B0" stop-opacity=".25"/><stop offset="1" stop-color="#2C66B0" stop-opacity="0"/></linearGradient></defs>' + g + '<path d="' + aire + '" fill="url(#ga)"/><path d="' + ligne + '" fill="none" stroke="#114B9D" stroke-width="2.5" stroke-linejoin="round"/>' + pointsSvg + et + '</svg>';
  }
  function barres(l, total){ var m = Math.max.apply(null, l.map(function(x){ return x[1]; }).concat([1])); return '<div class="barres">' + l.map(function(x){ return '<div class="b"><span title="' + esc(x[0]) + '">' + esc(x[0]) + '</span><span class="piste"><i style="width:' + (x[1] / m * 100) + '%"></i></span><span>' + (total ? Math.round(x[1] / total * 100) + ' %' : x[1]) + '</span></div>'; }).join('') + '</div>'; }
  function vueStats(v){
    var S = statsCalc(periodeStats), tv = S.sources.reduce(function(a, x){ return a + x[1]; }, 0), ta = S.appareils.reduce(function(a, x){ return a + x[1]; }, 0);
    v.innerHTML = (S.exemple ? '<div class="bandeau-demo" style="background:#EEF5FD;border-color:#C9DDF2;color:#24426E"><div><b>Données d’exemple.</b> Le site n’est pas encore en ligne : ces chiffres montrent à quoi ressembleront vos statistiques. Les vraies visites s’afficheront automatiquement après la mise en ligne.</div></div>' : '') +
      '<div class="tete-carte"><div class="periode filtres">' + [[7, '7 jours'], [30, '30 jours'], [60, '60 jours']].map(function(p){ return '<button data-p="' + p[0] + '" class="' + (periodeStats === p[0] ? 'actif' : '') + '">' + p[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="grille g4">' + kpi('Visiteurs uniques', S.visiteurs, (S.evol >= 0 ? '+' : '') + S.evol + ' % vs période précédente', 'bleu') + kpi('Pages vues', S.vues, (S.visiteurs ? (S.vues / S.visiteurs).toFixed(1) : 0) + ' pages par visiteur') + kpi('Contacts générés', S.wa + S.appels + S.demandes, 'WhatsApp, appels et devis', 'vert') + kpi('Taux de conversion', S.conversion.toFixed(1) + ' %', 'visiteurs qui ont pris contact', 'rouge') + '</div>' +
      '<div class="carte" style="margin-top:18px"><div class="tete-carte"><div><h2>Visiteurs par jour</h2></div></div><div class="graph">' + courbe(S.parJour) + '</div></div>' +
      '<div class="grille g2" style="margin-top:18px"><div class="carte"><h2>Pages les plus consultées</h2><div style="margin-top:16px">' + barres(S.pages) + '</div></div>' +
      '<div class="carte"><h2>D’où viennent vos visiteurs</h2><div style="margin-top:16px">' + barres(S.sources, tv) + '</div></div>' +
      '<div class="carte"><h2>Actions importantes</h2><div style="margin-top:16px">' + barres([['Clics WhatsApp', S.wa], ['Clics « Appeler »', S.appels], ['Demandes de devis / visite', S.demandes], ['Images 3D et plans ouverts', S.visionneuse], ['Vues 3D des plans', S.vue3d]]) + '</div></div>' +
      '<div class="carte"><h2>Appareils utilisés</h2><div style="margin-top:16px">' + barres(S.appareils, ta) + '</div><p class="sous" style="margin-top:16px">Ville et pays des visiteurs : disponibles après l’hébergement du site.</p></div></div>';
    $$('[data-p]', v).forEach(function(b){ b.onclick = function(){ periodeStats = +b.dataset.p; vueStats(v); }; });
  }

  /* =================== 11. Comptes =================== */
  function vueComptes(v){
    var C = PROFILS.filter(function(c){ return c.role; }), I = INVITS;
    v.innerHTML = '<div class="carte"><div class="tete-carte"><div><h2>Comptes ayant accès à l’administration (' + C.length + ')</h2><p class="sous">Un administrateur gère tout, y compris les comptes. Un éditeur gère le contenu, les demandes et voit les statistiques.</p></div><button class="btn btn-bleu" data-nouveau-el>+ Ajouter une personne</button></div>' +
      '<table class="tableau"><thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Depuis le</th><th></th></tr></thead><tbody>' + C.map(function(c){ return '<tr><td><b>' + esc(c.nom) + '</b>' + (c.id === moi.id ? ' <span class="badge">Vous</span>' : '') + '</td><td>' + esc(c.email) + '</td><td>' + (c.role === 'admin' ? '<span class="badge jaune">Administrateur</span>' : '<span class="badge">Éditeur</span>') + '</td><td>' + dateFr(c.cree) + '</td><td style="text-align:right">' + (c.id !== moi.id ? '<button class="btn btn-trait btn-petit" data-modif="' + c.id + '">Modifier</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      (I.length ? '<div class="carte"><div class="tete-carte"><div><h2>Accès en attente (' + I.length + ')</h2><p class="sous">Ces personnes doivent ouvrir la page de connexion et cliquer sur « Première connexion : créer mon mot de passe » avec leur adresse email.</p></div></div><table class="tableau"><thead><tr><th>Nom</th><th>Email</th><th>Rôle prévu</th><th></th></tr></thead><tbody>' + I.map(function(x){ return '<tr><td><b>' + esc(x.nom || '') + '</b></td><td>' + esc(x.email) + '</td><td>' + (x.role === 'admin' ? 'Administrateur' : 'Éditeur') + '</td><td style="text-align:right"><button class="btn btn-danger btn-petit" data-annuler="' + esc(x.email) + '">Annuler</button></td></tr>'; }).join('') + '</tbody></table></div>' : '');
    var rafraichir = function(){ chargerComptes().then(function(){ vueComptes(v); }); };
    $('[data-nouveau-el]', v).onclick = function(){ editerCompte(null, rafraichir); };
    $$('[data-modif]', v).forEach(function(b){ b.onclick = function(){ editerCompte(b.dataset.modif, rafraichir); }; });
    $$('[data-annuler]', v).forEach(function(b){ b.onclick = function(){ if (!confirmer('Annuler l’accès prévu pour ' + b.dataset.annuler + ' ?')) return; sb.from('invitations').delete().eq('email', b.dataset.annuler).then(function(r){ if (r.error) return erreurReseau(r.error); toast('Accès annulé'); rafraichir(); }); }; });
  }
  function editerCompte(id, apres){
    var C = PROFILS.filter(function(c){ return c.role; }), o = id ? clone(C.filter(function(c){ return c.id === id; })[0]) : { nom: '', email: '', role: 'editeur' };
    var defs = id ? [{ k: 'nom', label: 'Nom complet' }, { k: 'role', label: 'Rôle', type: 'select', options: [['editeur', 'Éditeur'], ['admin', 'Administrateur']] }]
      : [{ k: 'nom', label: 'Nom complet', ph: 'Ex. Laurent KODJO' }, { k: 'email', label: 'Adresse email', ph: 'exemple@gmail.com', aide: 'La personne créera elle-même son mot de passe depuis la page de connexion (« Première connexion »).' }, { k: 'role', label: 'Rôle', type: 'select', options: [['editeur', 'Éditeur'], ['admin', 'Administrateur']] }];
    var z = ouvrirPanneau(id ? 'Modifier le compte' : 'Ajouter une personne', '<div class="section-panneau"><div class="formu">' + defs.map(function(d){ return champ(d, o[d.k]); }).join('') + '</div>' + (id ? '<p class="sous" style="margin-top:12px">Email : ' + esc(o.email) + '</p>' : '') + '</div>', [
      id ? { texte: 'Retirer l’accès', classe: 'btn-danger', gauche: true, action: function(){ if (!confirmer('Retirer l’accès à l’administration pour ' + o.nom + ' ?')) return; sb.from('profils').update({ role: null }).eq('id', id).then(function(r){ if (r.error) return erreurReseau(r.error); fermerPanneau(); apres(); toast('Accès retiré'); }); } } : null,
      { texte: 'Annuler', action: fermerPanneau },
      { texte: 'Enregistrer', classe: 'btn-bleu', action: function(){
        var f = lireChamps(z, defs, {});
        if (!f.nom) { toast('Le nom est obligatoire.', true); return; }
        if (id) {
          sb.from('profils').update({ nom: f.nom, role: f.role }).eq('id', id).then(function(r){ if (r.error) return erreurReseau(r.error); fermerPanneau(); apres(); toast('Compte mis à jour'); });
        } else {
          var em = (f.email || '').trim().toLowerCase();
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('Adresse email invalide.', true); return; }
          if (PROFILS.some(function(p){ return (p.email || '').toLowerCase() === em && p.role; })) { toast('Cette personne a déjà accès.', true); return; }
          var existant = PROFILS.filter(function(p){ return (p.email || '').toLowerCase() === em; })[0];
          var op = existant ? sb.from('profils').update({ nom: f.nom, role: f.role }).eq('id', existant.id) : sb.from('invitations').upsert({ email: em, nom: f.nom, role: f.role });
          op.then(function(r){ if (r.error) return erreurReseau(r.error); fermerPanneau(); apres(); toast(existant ? 'Accès donné' : 'Accès prévu : la personne peut maintenant créer son mot de passe'); });
        }
      } }
    ].filter(Boolean));
  }

  /* =================== 12. Mon compte =================== */
  function vueCompte(v){
    v.innerHTML = '<div class="grille g2"><div class="carte"><h2>Mes informations</h2><div class="formu" style="margin-top:16px">' + champ({ k: 'nom', label: 'Nom' }, moi.nom) + '</div><p class="sous" style="margin-top:12px">Adresse de connexion : ' + esc(moi.email) + '</p><button class="btn btn-bleu" id="svi" style="margin-top:16px">Enregistrer</button></div>' +
      '<div class="carte"><h2>Changer mon mot de passe</h2><form class="formu" style="margin-top:16px" id="fmdp">' + champ({ k: 'actuel', label: 'Mot de passe actuel', type: 'password' }) + champ({ k: 'n1', label: 'Nouveau mot de passe', type: 'password', aide: '8 caractères minimum.' }) + champ({ k: 'n2', label: 'Confirmer le nouveau mot de passe', type: 'password' }) + '<button class="btn btn-bleu" type="submit">Changer le mot de passe</button></form></div></div>';
    $('#svi', v).onclick = function(){
      var nom = $('[data-k="nom"]', v).value.trim();
      if (!nom) { toast('Le nom est obligatoire.', true); return; }
      sb.from('profils').update({ nom: nom }).eq('id', moi.id).then(function(r){ if (r.error) return erreurReseau(r.error); moi.nom = nom; $('#u-nom').textContent = nom; toast('Informations mises à jour'); });
    };
    $('#fmdp', v).onsubmit = function(e){
      e.preventDefault();
      var a = $('[data-k="actuel"]', v).value, n1 = $('[data-k="n1"]', v).value, n2 = $('[data-k="n2"]', v).value;
      if (n1.length < 8) { toast('8 caractères minimum.', true); return; }
      if (n1 !== n2) { toast('Les deux mots de passe ne correspondent pas.', true); return; }
      sb.auth.signInWithPassword({ email: moi.email, password: a }).then(function(r){
        if (r.error) { toast('Mot de passe actuel incorrect.', true); return; }
        return sb.auth.updateUser({ password: n1 }).then(function(r2){ if (r2.error) { toast('Mot de passe refusé : ' + r2.error.message, true); return; } toast('Mot de passe changé'); vueCompte(v); });
      });
    };
  }

  /* =================== Démarrage =================== */
  changerMode('connexion');
  demarrer();
  setInterval(function(){ if (!moi) return; var avant = DEM.length; chargerDemandes().then(function(){ if (DEM.length !== avant && (courant === 'demandes' || courant === 'tableau') && $('#panneau').hidden) aller(courant); }).catch(function(){}); }, 60000);
})();
