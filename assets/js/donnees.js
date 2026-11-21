/* =====================================================================
   MCS — CONTENU DU SITE
   ---------------------------------------------------------------------
   Toutes les informations modifiables du site sont ici, en un seul
   endroit. Ce fichier deviendra les tables de l'espace administrateur
   (Supabase). Remplacez simplement les valeurs entre [crochets].

   Images : laissez  image: ""  tant que vous n'avez pas la photo
   (une illustration s'affiche à la place). Ensuite, mettez le chemin,
   ex.  image: "assets/img/projets/villa-cocody.jpg"
   ===================================================================== */
window.MCS = {

  /* ---------- Coordonnées (utilisées sur toutes les pages) ---------- */
  infos: {
    nom: "MCS",
    raisonSociale: "MALAUK CONSTRUCTION SERVICES",
    fondateur: "Laurent KODJO",
    nomComplet: "Malauk Construction (MCS)",
    fondateur: "Laurent KODJO",
    creation: "2018",
    slogan: "Construire aujourd’hui le meilleur de demain.",
    telephone: "+225 27 22 58 72 88",   // numéro fixe affiché
    whatsapp: "2250100907171",          // chiffres seulement (lien WhatsApp)
    whatsappAffiche: "+225 01 00 90 71 71",
    email: "",                          // à compléter après l’hébergement (reste masqué tant que vide)
    adresse: "Riviera M’badon, Cocody, Abidjan",
    carte: "5.336904,-3.940645",        // coordonnées GPS du bureau (carte Google Maps)
    lienCarte: "https://maps.app.goo.gl/9xv2peq69aTkGke18",   // lien du bouton « Itinéraire »
    horaires: "Lundi au vendredi : 8 h – 18 h\nSamedi : 8 h – 14 h 30",
    delaiReponse: "48 h",
    facebook: "",                      // liens complets, laisser vide si aucun
    instagram: "",
    linkedin: "",
    tiktok: "https://www.tiktok.com/@mcs7185",
    rccm: "[N° RCCM]",
    ncc: "[N° compte contribuable]",
    gerant: "Laurent KODJO"
  },

  /* ---------- Bloc « Réservez votre date de démarrage » ---------- */
  planning: {
    mois: "[mois]",
    pris: "[X]",      // chantiers déjà réservés
    total: "[X]",     // places du mois
    remplissage: 70   // pourcentage de la barre (0 à 100)
  },

  /* ---------- Accueil : diaporama (4 photos) ---------- */
  diaporama: [
    {
      "titre": "Construction",
      "image": "assets/img/accueil/construction.jpg",
      "alt": "Grande villa blanche aux lignes arrondies",
      "legende": "Villas et immeubles livrés clés en main"
    },
    {
      "titre": "Gros œuvre",
      "image": "assets/img/accueil/gros-oeuvre.jpg",
      "alt": "Structure en béton armé en cours de construction",
      "legende": "Fondations et structure réalisées selon les normes"
    },
    {
      "titre": "Finition",
      "image": "assets/img/accueil/finition.jpg",
      "alt": "Hall en marbre avec escalier en bois et garde-corps en verre",
      "legende": "Des intérieurs finis au détail près"
    },
    {
      "titre": "Immobilier",
      "image": "assets/img/accueil/immobilier.jpg",
      "alt": "Villa contemporaine avec terrasse et piscine",
      "legende": "Des biens sélectionnés, à acheter en toute confiance"
    }
  ],

  /* ---------- Photos des 4 métiers (page Nos métiers et accueil) ---------- */
  metiersPhotos: {
    "construction": "assets/img/metiers/construction.jpg",
    "gros-oeuvre": "assets/img/metiers/gros-oeuvre.jpg",
    "finition": "assets/img/metiers/finition.jpg",
    "immobilier": "assets/img/metiers/immobilier.jpg"
  },

  /* ---------- Page À propos ---------- */
  apropos: {
    "histoire": [
      "MCS est née en 2018 de la vision de Monsieur Laurent KODJO : offrir aux familles, aux entreprises et aux investisseurs d’Abidjan un constructeur sur lequel on peut réellement compter. Un partenaire qui annonce une date, et qui la tient.",
      "Chantier après chantier, cette exigence a forgé sa réputation. Avec une dizaine de projets livrés, MCS s’est imposée par la qualité de son travail et le respect de sa parole, portée avant tout par la recommandation de clients satisfaits.",
      "En 2026, l’entreprise franchit une nouvelle étape et se structure officiellement sous le nom de MALAUK CONSTRUCTION SERVICES. Une organisation à la hauteur de ses ambitions, qui réunit quatre métiers complémentaires : la construction, le gros œuvre, la finition et l’immobilier.",
      "Aujourd’hui, une demi-douzaine de chantiers avancent en parallèle, conduits avec la même rigueur qu’au premier jour."
    ],
    "fondateur": [],
    "photoFondateur": "assets/img/laurent-kodjo.jpg"
  },

  /* ---------- Questions fréquentes, par page ---------- */
  faq: {
    "construction": [
      {
        "q": "Combien de temps faut-il pour construire une villa ?",
        "r": "Cela dépend de la taille et de la complexité du projet : une villa basse demande généralement moins de temps qu’une villa à étage ou un duplex. Le délai exact est fixé dans votre planning et inscrit au contrat avant le démarrage."
      },
      {
        "q": "Pouvez-vous construire à partir de mes propres plans ?",
        "r": "Oui. Nous travaillons avec vos plans ou ceux de votre architecte, et pouvons vous orienter si vous n’en avez pas encore."
      },
      {
        "q": "Comment se passe le paiement ?",
        "r": "Le paiement se fait par étapes, selon l’avancement du chantier : un acompte au démarrage, puis des versements à chaque étape clé prévue au contrat. Des facilités de paiement peuvent être étudiées avec vous."
      },
      {
        "q": "Comment suis-je informé de l’avancement ?",
        "r": "Chaque semaine, votre responsable de chantier vous envoie des photos et un point d’avancement sur WhatsApp. Vous pouvez aussi visiter le chantier sur rendez-vous."
      }
    ],
    "gros-oeuvre": [
      {
        "q": "Faites-vous uniquement le gros œuvre ?",
        "r": "Oui. Vous pouvez nous confier seulement le gros œuvre, ou l’ensemble du chantier jusqu’aux finitions."
      },
      {
        "q": "Quels matériaux utilisez-vous ?",
        "r": "Nous utilisons des matériaux de qualité, conformes aux normes : ciment, fer à béton, agglos et granulats contrôlés à leur livraison sur le chantier. Les dosages respectent les plans de structure de votre bâtiment."
      },
      {
        "q": "Faut-il une étude de sol ?",
        "r": "Elle est recommandée pour dimensionner correctement les fondations. Nous vous indiquons au devis si elle est nécessaire pour votre projet."
      },
      {
        "q": "Comment suis-je informé de l’avancement ?",
        "r": "Chaque semaine, votre responsable de chantier vous envoie des photos et un point d’avancement sur WhatsApp. Vous pouvez aussi visiter le chantier sur rendez-vous."
      }
    ],
    "finition": [
      {
        "q": "Reprenez-vous un chantier commencé par une autre entreprise ?",
        "r": "Oui. Nous faisons d’abord un état des lieux pour vérifier ce qui a été réalisé, puis nous chiffrons la suite."
      },
      {
        "q": "Puis-je choisir mes matériaux ?",
        "r": "Oui. Vous pouvez choisir vos carreaux, peintures et équipements, ou nous laisser vous proposer des gammes adaptées à votre budget."
      },
      {
        "q": "Faites-vous des finitions pour des bâtiments destinés à la location ?",
        "r": "Oui. Nous vous conseillons des finitions durables et faciles à entretenir pour la location."
      },
      {
        "q": "Comment suis-je informé de l’avancement ?",
        "r": "Chaque semaine, votre responsable de chantier vous envoie des photos et un point d’avancement sur WhatsApp. Vous pouvez aussi visiter le chantier sur rendez-vous."
      }
    ],
    "immobilier": [
      {
        "q": "Les documents des biens sont-ils vérifiés ?",
        "r": "Oui. Avant toute mise en vente, nous vérifions les documents du bien (ACD, titre foncier, permis de construire selon le cas), pour que vous achetiez en toute sécurité."
      },
      {
        "q": "Puis-je visiter avant de m’engager ?",
        "r": "Oui, toutes les visites se font sur rendez-vous, avec un conseiller MCS."
      },
      {
        "q": "Proposez-vous des facilités de paiement ?",
        "r": "Oui. MCS propose des facilités de paiement pour rendre votre achat plus accessible. Les modalités sont définies avec vous selon le bien choisi et votre situation : contactez-nous pour en discuter."
      },
      {
        "q": "Je cherche un bien qui n’est pas sur le site.",
        "r": "Dites-nous ce que vous cherchez (type, commune, budget). Nous vous prévenons dès qu’un bien correspondant est disponible."
      }
    ],
    "contact": [
      {
        "q": "Le devis est-il gratuit ?",
        "r": "Oui, le devis est gratuit et sans engagement."
      },
      {
        "q": "Intervenez-vous en dehors d’Abidjan ?",
        "r": "Nous intervenons principalement à Abidjan et dans ses environs. Pour un projet ailleurs en Côte d’Ivoire, contactez-nous : nous étudions chaque demande."
      },
      {
        "q": "Sous quel délai recevrai-je mon devis ?",
        "r": "Vous recevez votre devis détaillé et votre planning sous 48 h maximum après votre demande."
      },
      {
        "q": "Comment suis-je informé de l’avancement ?",
        "r": "Chaque semaine, votre responsable de chantier vous envoie des photos et un point d’avancement sur WhatsApp. Vous pouvez aussi visiter le chantier sur rendez-vous."
      }
    ]
  },

  /* ---------- Chiffres clés (page À propos) ---------- */
  chiffres: [
    { valeur: "2018", libelle: "année de création par Laurent KODJO" },
    { valeur: "10", libelle: "projets livrés, environ" },
    { valeur: "6", libelle: "chantiers en cours, environ" },
    { valeur: "8 ans", libelle: "d’expérience sur les chantiers d’Abidjan" }
  ],

  /* ---------- Équipe (page À propos) ----------
     Une seule photo de toute l'équipe. Mettre le chemin quand elle est prête,
     ex. image: "assets/img/equipe.jpg"                               */
  equipe: {
    image: "assets/img/equipe.jpg",
    legende: "L’équipe MCS"
  },

  /* ---------- Réalisations ----------
     metier : "construction" | "gros-oeuvre" | "finition"
     rendus : images 3D [{ src, mini, titre }]  ·  plans : plans d’architecte [{ src, mini, titre }]
     statut : "projet" | "livre" | "en-cours"
     photos : [{ src, titre }] et videos : [{ src, affiche, titre }] — les médias
     d'un même chantier, affichés ensemble, dans l'ordre (la façade en premier).                                  */
  projets: [
    { id: "projet-01", numero: "01", titre: "Immeuble R+3 — Cocody Angré", type: "Immeuble", metier: "construction", lieu: "Cocody, Angré", statut: "projet", image: "assets/img/projets/p1-3d-1-min.jpg", illustration: "immeuble",
      resume: "Un immeuble de rapport R+3 aux lignes contemporaines, rythmé par de larges balcons vitrés et une colonne centrale en parement terre cuite.",
      description: [
        "Conçu par MCS pour un maître d’ouvrage privé à Cocody Angré, cet immeuble R+3 réunit deux appartements par niveau, organisés de part et d’autre d’une cage d’escalier centrale.",
        "Chaque appartement offre un séjour-salle à manger d’environ 30 m², une cuisine indépendante, deux chambres dont une chambre principale avec salle d’eau, et une cour arrière. Les balcons filants et la façade travaillée donnent au bâtiment une présence élégante dans le quartier."
      ],
      points: ["R+3", "2 appartements par niveau", "Séjour ≈ 30 m²"],
      rendus: [
        { src: "assets/img/projets/p1-3d-1.jpg", mini: "assets/img/projets/p1-3d-1-min.jpg", titre: "Façade principale" },
        { src: "assets/img/projets/p1-3d-2.jpg", mini: "assets/img/projets/p1-3d-2-min.jpg", titre: "Vue en perspective" }
      ],
      plans: [
        { src: "assets/img/projets/p1-plan-1.jpg", mini: "assets/img/projets/p1-plan-1-min.jpg", titre: "Aménagement du rez-de-chaussée" },
        { src: "assets/img/projets/p1-plan-2.jpg", mini: "assets/img/projets/p1-plan-2-min.jpg", titre: "Aménagement de l’étage 01" },
        { src: "assets/img/projets/p1-plan-3.jpg", mini: "assets/img/projets/p1-plan-3-min.jpg", titre: "Planche des perspectives" }
      ] },
    { id: "projet-02", numero: "02", titre: "Résidence meublée", type: "Résidence", metier: "construction", lieu: "", statut: "projet", image: "assets/img/projets/p2-3d-1-min.jpg", illustration: "immeuble",
      resume: "Une résidence meublée de plain-pied pensée pour la location : studios indépendants, accueil soigné et façade lumineuse.",
      description: [
        "Ce projet de résidence meublée regroupe une série de studios identiques, chacun avec son espace d’accueil, sa chambre, sa kitchenette et sa salle d’eau, ainsi qu’un appartement principal avec séjour-salle à manger.",
        "Un bureau de gestion, un magasin et un vaste garage complètent l’ensemble, pour une exploitation locative simple et rentable."
      ],
      points: ["Plain-pied", "Studios meublés", "Garage ≈ 188 m²"],
      rendus: [
        { src: "assets/img/projets/p2-3d-1.jpg", mini: "assets/img/projets/p2-3d-1-min.jpg", titre: "Façade de la résidence" }
      ],
      plans: [
        { src: "assets/img/projets/p2-plan-1.jpg", mini: "assets/img/projets/p2-plan-1-min.jpg", titre: "Plan d’aménagement" }
      ] },
    { id: "projet-03", numero: "03", titre: "Maison 3 pièces", type: "Maison", metier: "construction", lieu: "", statut: "projet", image: "assets/img/projets/p3-3d-1-min.jpg", illustration: "immeuble",
      resume: "Une maison de trois pièces compacte et chaleureuse, avec parement en pierre, auvent d’entrée et stationnement devant la façade.",
      description: [
        "Cette maison de plain-pied optimise chaque mètre carré : un séjour-salle à manger de 31 m² ouvert sur deux terrasses, une cuisine de plus de 11 m², une chambre parentale de 20 m² et une chambre d’enfant de 17 m².",
        "Deux salles d’eau et un WC séparé assurent le confort au quotidien. Un modèle idéal pour une première construction."
      ],
      points: ["3 pièces", "Séjour 31 m²", "2 terrasses"],
      rendus: [
        { src: "assets/img/projets/p3-3d-1.jpg", mini: "assets/img/projets/p3-3d-1-min.jpg", titre: "Façade principale" }
      ],
      plans: [
        { src: "assets/img/projets/p3-plan-1.jpg", mini: "assets/img/projets/p3-plan-1-min.jpg", titre: "Plan d’aménagement" }
      ] },
    { id: "projet-04", numero: "04", titre: "Immeuble — Bimbresso", type: "Immeuble", metier: "construction", lieu: "Bimbresso", statut: "projet", image: "assets/img/projets/p4-3d-1-min.jpg", illustration: "immeuble",
      resume: "Un immeuble mixte au design affirmé : commerces au rez-de-chaussée et appartements aux étages, encadrés par une façade bleu canard.",
      description: [
        "À Bimbresso, ce projet associe des locaux commerciaux en pied d’immeuble à des appartements familiaux aux étages, desservis par un escalier central.",
        "Les appartements comprennent un séjour-salle à manger de 29 m², une cuisine avec buanderie, des chambres dont une chambre principale avec salle d’eau, et un balcon. Les cadres colorés de la façade mettent en valeur les balcons vitrés."
      ],
      points: ["Commerces + logements", "Séjour 29 m²", "Balcons vitrés"],
      rendus: [
        { src: "assets/img/projets/p4-3d-1.jpg", mini: "assets/img/projets/p4-3d-1-min.jpg", titre: "Façade sur rue" }
      ],
      plans: [
        { src: "assets/img/projets/p4-plan-1.jpg", mini: "assets/img/projets/p4-plan-1-min.jpg", titre: "Plan d’aménagement" }
      ] },
    { id: "projet-05", numero: "05", titre: "Villa basse 4 chambres", type: "Villa", metier: "construction", lieu: "", statut: "projet", image: "assets/img/projets/p5-3d-1-min.jpg", illustration: "immeuble",
      resume: "Une villa de plain-pied généreuse, avec garage, grande terrasse couverte et suite parentale avec dressing.",
      description: [
        "Cette villa basse s’organise autour d’un séjour-salle à manger de près de 41 m² prolongé par une terrasse avant de 24 m². Elle compte quatre chambres, dont une chambre principale de 22 m² avec dressing et salle d’eau privative.",
        "Un garage couvert, un magasin et une cour arrière avec cuisine extérieure complètent ce plan pensé pour la vie de famille."
      ],
      points: ["Plain-pied", "4 chambres", "Séjour ≈ 41 m²"],
      rendus: [
        { src: "assets/img/projets/p5-3d-1.jpg", mini: "assets/img/projets/p5-3d-1-min.jpg", titre: "Façade principale" },
        { src: "assets/img/projets/p5-3d-2.jpg", mini: "assets/img/projets/p5-3d-2-min.jpg", titre: "Vue aérienne" }
      ],
      plans: [
        { src: "assets/img/projets/p5-plan-1.jpg", mini: "assets/img/projets/p5-plan-1-min.jpg", titre: "Plan d’aménagement" }
      ] },
    { id: "projet-06", numero: "06", titre: "Immeuble R+4 avec piscine en terrasse", type: "Immeuble", metier: "construction", lieu: "", statut: "projet", image: "assets/img/projets/p6-3d-1-min.jpg", illustration: "immeuble",
      resume: "Un immeuble résidentiel haut de gamme, avec parkings couverts au rez-de-chaussée et une terrasse aménagée avec piscine au dernier niveau.",
      description: [
        "Ce projet d’immeuble R+4 propose plusieurs appartements par étage, organisés autour d’un noyau central d’escalier. Chaque logement dispose d’un séjour lumineux, de chambres avec salles d’eau et de balcons.",
        "Le rez-de-chaussée accueille des parkings couverts, et le toit-terrasse devient un véritable espace de vie avec piscine, salon extérieur et appartement en attique."
      ],
      points: ["R+4", "Parkings couverts", "Piscine en terrasse"],
      rendus: [
        { src: "assets/img/projets/p6-3d-1.jpg", mini: "assets/img/projets/p6-3d-1-min.jpg", titre: "Façade principale" },
        { src: "assets/img/projets/p6-3d-2.jpg", mini: "assets/img/projets/p6-3d-2-min.jpg", titre: "Vue d’angle" }
      ],
      plans: [
        { src: "assets/img/projets/p6-plan-1.jpg", mini: "assets/img/projets/p6-plan-1-min.jpg", titre: "Aménagement du rez-de-chaussée" },
        { src: "assets/img/projets/p6-plan-2.jpg", mini: "assets/img/projets/p6-plan-2-min.jpg", titre: "Aménagement de l’étage courant" },
        { src: "assets/img/projets/p6-plan-3.jpg", mini: "assets/img/projets/p6-plan-3-min.jpg", titre: "Aménagement de la terrasse" }
      ] },
    { id: "projet-07", numero: "07", titre: "Villa duplex contemporaine", type: "Villa", metier: "construction", lieu: "", statut: "projet", image: "assets/img/projets/p7-3d-1-min.jpg", illustration: "immeuble",
      resume: "Une villa duplex de standing : séjour de plus de 70 m², double cuisine, salle de prière et suite parentale avec séjour privé.",
      description: [
        "Au rez-de-chaussée, un séjour de 71 m² s’ouvre sur les terrasses et le jardin. La villa dispose d’une cuisine africaine et d’une cuisine européenne, d’une salle de prière, d’une buanderie, d’une chambre et d’un garage pour deux véhicules.",
        "À l’étage, la chambre principale de près de 30 m² s’accompagne d’un dressing, d’un séjour privé et d’un balcon, aux côtés de trois autres chambres et de leurs salles d’eau."
      ],
      points: ["R+1", "Séjour 71 m²", "Garage 2 voitures"],
      rendus: [
        { src: "assets/img/projets/p7-3d-1.jpg", mini: "assets/img/projets/p7-3d-1-min.jpg", titre: "Façade principale" },
        { src: "assets/img/projets/p7-3d-2.jpg", mini: "assets/img/projets/p7-3d-2-min.jpg", titre: "Variante de façade" }
      ],
      plans: [
        { src: "assets/img/projets/p7-plan-1.jpg", mini: "assets/img/projets/p7-plan-1-min.jpg", titre: "Plan du rez-de-chaussée" },
        { src: "assets/img/projets/p7-plan-2.jpg", mini: "assets/img/projets/p7-plan-2-min.jpg", titre: "Plan de l’étage" }
      ] },
    { id: "chantier-riviera-bonoumin", type: "Villa", titre: "Villa à étage — Riviera Bonoumin", metier: "construction", lieu: "Cocody, Riviera Bonoumin", annee: "[Année]", surface: "[X] m²", prevu: "[X] mois", reel: "[X] mois", statut: "en-cours", illustration: "duplex", image: "assets/img/projets/riviera-bonoumin.jpg", galerie: [],
      resume: "Une villa à étage en cours de construction à Riviera Bonoumin, avec parements en pierre et grandes baies vitrées.",
      description: ["MCS construit cette villa à étage à Riviera Bonoumin, dans la commune de Cocody. Le bâtiment est sorti de terre : la structure, l’étage, les parements en pierre et les menuiseries sont en place.", "Les travaux se poursuivent sur les finitions et l’aménagement des extérieurs, menés avec la même exigence de qualité et de rigueur qui fait la signature de MCS."],
      photos: [
        { src: "assets/img/projets/riviera-bonoumin-complet.jpg", titre: "La façade" }
      ],
      videos: [
        { src: "assets/video/riviera-bonoumin-1.mp4", affiche: "assets/video/riviera-bonoumin-1.jpg", titre: "La cuisine" },
        { src: "assets/video/riviera-bonoumin-2.mp4", affiche: "assets/video/riviera-bonoumin-2.jpg", titre: "Le séjour" },
        { src: "assets/video/riviera-bonoumin-3.mp4", affiche: "assets/video/riviera-bonoumin-3.jpg", titre: "La salle de bain" }
      ] },
    { id: "chantier-angre-chateau", type: "Villa", titre: "Villa à étage — Angré Château", metier: "construction", lieu: "Cocody, Angré Château", annee: "[Année]", surface: "[X] m²", prevu: "[X] mois", reel: "[X] mois", statut: "en-cours", illustration: "duplex", image: "assets/img/projets/angre-chateau.jpg", galerie: [],
      resume: "Une villa à étage en cours de construction à Angré Château, avec terrasse en étage.",
      description: ["MCS construit cette villa à étage à Angré Château, dans la commune de Cocody. La structure et l’étage sont achevés, les murs sont enduits et les premières menuiseries métalliques sont posées.", "Les travaux se poursuivent sur le second œuvre et les finitions, menés avec la même exigence de qualité et de rigueur qui fait la signature de MCS."],
      photos: [],
      videos: [
        { src: "assets/video/angre-chateau-1.mp4", affiche: "assets/video/angre-chateau-1.jpg", titre: "La façade" }
      ] }
  ],

  /* ---------- Biens immobiliers ----------
     type : "Villa" | "Appartement" | "Terrain" | "Immeuble"
     statut : "disponible" | "reserve" | "vendu"                    */
  biens: [],
  /* Exemple de bien à ajouter dans les crochets ci-dessus :
    { id: "bien-1", titre: "Villa duplex 5 pièces", type: "Villa", lieu: "Cocody, Riviera", prix: "150 000 000 FCFA", surface: "250 m²", terrain: "500 m²", chambres: "4", sdb: "4", statut: "disponible", image: "assets/img/biens/villa.jpg", galerie: [],
      description: ["Description du bien.", "Documents disponibles : ACD, permis de construire…"] }
     type : "Villa" | "Appartement" | "Terrain" | "Immeuble" — statut : "disponible" | "reserve" | "vendu"
  */

  /* ---------- Actualités ----------
     categorie : "Chantier" | "Conseils" | "Entreprise"            */
  articles: []
  /* Exemple d’article à ajouter dans les crochets ci-dessus :
    { id: "article-1", titre: "Titre de l’article", categorie: "Chantier", date: "12 décembre 2026", illustration: "structure", image: "assets/img/actu/photo.jpg",
      resume: "Résumé en une ou deux phrases.", contenu: ["Premier paragraphe.", "Deuxième paragraphe."] }
  */
};
