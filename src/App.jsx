import { useState, useRef, useEffect } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const SUPER_ADMIN = { email: "superadmin@afrilearn.com", password: "AfriLearn@2026!", role: "superadmin" };
const ADMIN_ACCOUNTS = [{ email: "admin@afrilearn.com", password: "Admin@2026!", role: "admin", name: "Administrateur" }];
const COUNTRIES = ["Gabon","Cameroun","Côte d'Ivoire","Sénégal","RDC","Congo","Bénin","Togo","Burkina Faso","Mali","Niger","Guinée","Madagascar","Rwanda","Burundi","Tchad","Centrafrique","Djibouti","Comores","Maurice"];

// ─── CONTENU PARTIE 1 ─────────────────────────────────────────────────────────
const CHAPTERS_CONTENT = {
  1: {
    id:1, title:"Nombres entiers", duration:"3 semaines",
    objectives:["Lire et écrire les grands nombres entiers","Comprendre la valeur positionnelle","Comparer et ordonner des nombres entiers","Encadrer et arrondir un entier"],
    cours:[
      { id:"1-1", titre:"Lire et écrire les grands nombres",
        contenu:`Un nombre entier est un nombre sans virgule : 0, 1, 2, 100, 5 000...

Les nombres sont organisés en CLASSES de 3 chiffres, de droite à gauche :
• Classe des UNITÉS : unités (u), dizaines (d), centaines (c)
• Classe des MILLIERS : unités, dizaines, centaines de milliers
• Classe des MILLIONS : unités, dizaines, centaines de millions

📌 RÈGLE : On sépare les classes par un espace.

EXEMPLE : 4 725 083
• 4 → 4 millions
• 725 → 7 cent. de milliers, 2 diz. de milliers, 5 milliers
• 083 → 0 centaines, 8 dizaines, 3 unités
On lit : quatre millions sept cent vingt-cinq mille quatre-vingt-trois

🌍 La population de Libreville est environ 703 000 habitants.`,
        exemples:[
          {question:"Écrire en chiffres : trois millions deux cent mille quarante-cinq", reponse:"3 200 045"},
          {question:"Lire en lettres : 15 006 300", reponse:"quinze millions six mille trois cents"},
          {question:"Chiffre des dizaines de milliers dans 3 847 526 ?", reponse:"Le chiffre 4"},
        ]
      },
      { id:"1-2", titre:"Comparer et ordonner les entiers",
        contenu:`Pour COMPARER deux entiers :
1. Le nombre avec le PLUS DE CHIFFRES est le plus grand
2. Même nombre de chiffres → on compare de GAUCHE à DROITE

SYMBOLES : < (inférieur), > (supérieur), = (égal)

EXEMPLES :
• 5 248 > 987 (4 chiffres > 3 chiffres)
• 3 241 < 3 850 (3=3, puis 2<8)

🌍 Distance Libreville–Franceville = 856 km
Distance Libreville–Oyem = 476 km → 856 > 476`,
        exemples:[
          {question:"Compare 12 450 et 9 876", reponse:"12 450 > 9 876"},
          {question:"Ordre croissant : 3 210 ; 3 021 ; 3 201 ; 3 120", reponse:"3 021 < 3 120 < 3 201 < 3 210"},
        ]
      },
      { id:"1-3", titre:"Encadrer et arrondir un entier",
        contenu:`ENCADRER = trouver deux nombres entre lesquels il se situe.
347 à la dizaine : 340 < 347 < 350

ARRONDIR = valeur approchée.
• Chiffre suivant 0,1,2,3,4 → arrondi INFÉRIEUR
• Chiffre suivant 5,6,7,8,9 → arrondi SUPÉRIEUR

EXEMPLES :
• 347 à la dizaine : unités=7 ≥ 5 → 350
• 342 à la dizaine : unités=2 < 5 → 340

🌍 Vente de 4 738 FCFA → arrondi à la centaine : 4 700 FCFA`,
        exemples:[
          {question:"Arrondir 6 853 à la centaine", reponse:"6 900"},
          {question:"Encadrer 4 567 entre deux centaines", reponse:"4 500 < 4 567 < 4 600"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"Écrire en chiffres : deux millions quatre cent mille six.",solution:"2 400 006"},
      {id:2,niveau:"Facile",enonce:"Lire en lettres le nombre 350 040.",solution:"trois cent cinquante mille quarante"},
      {id:3,niveau:"Facile",enonce:"Quel est le chiffre des milliers dans 743 825 ?",solution:"3"},
      {id:4,niveau:"Facile",enonce:"Écrire le plus grand nombre possible avec les chiffres 3, 7, 1, 5.",solution:"7 531"},
      {id:5,niveau:"Facile",enonce:"Compare avec < ou > : 8 500 __ 8 050",solution:"8 500 > 8 050"},
      {id:6,niveau:"Moyen",enonce:"Range dans l'ordre décroissant : 12 300 ; 12 030 ; 12 003 ; 12 330",solution:"12 330 > 12 300 > 12 030 > 12 003"},
      {id:7,niveau:"Moyen",enonce:"Arrondir 7 348 à la centaine.",solution:"7 300 (dizaines=4 < 5)"},
      {id:8,niveau:"Moyen",enonce:"Encadrer 45 673 entre deux milliers consécutifs.",solution:"45 000 < 45 673 < 46 000"},
      {id:9,niveau:"Moyen",enonce:"La distance Libreville-Brazzaville est 1 847 km. Arrondir à la centaine.",solution:"1 800 km"},
      {id:10,niveau:"Moyen",enonce:"Trouver tous les entiers dont l'arrondi à la dizaine est 80.",solution:"75, 76, 77, 78, 79, 80, 81, 82, 83, 84"},
      {id:11,niveau:"Difficile",enonce:"Un commerçant vend 1 234 sacs de riz à 15 000 FCFA. Chiffre d'affaires ? Arrondir au million.",solution:"18 510 000 FCFA → arrondi : 19 000 000 FCFA"},
      {id:12,niveau:"Difficile",enonce:"Trouver un nombre de 6 chiffres dont le chiffre des dizaines de milliers est 4 et la somme des chiffres est 10.",solution:"Exemple : 400 006"},
      {id:13,niveau:"Difficile",enonce:"Entre 3 500 000 et 4 000 000, combien y a-t-il de multiples de 100 000 ?",solution:"5 multiples"},
      {id:14,niveau:"Difficile",enonce:"Koffi a 3 billets de 10 000 FCFA, 5 billets de 5 000 FCFA et 7 pièces de 500 FCFA. Total ? Arrondir au millier.",solution:"58 500 FCFA → arrondi : 59 000 FCFA"},
      {id:15,niveau:"Difficile",enonce:"Le stade d'Angondjé accueille 40 000 personnes. 37 846 présentes. Places vides ? Arrondir à la centaine.",solution:"2 154 places → arrondi : 2 200 places"},
    ],
  },
  2: {
    id:2, title:"Nombres décimaux", duration:"3 semaines",
    objectives:["Comprendre la notion de nombre décimal","Lire et écrire les décimaux","Identifier la valeur de chaque chiffre après la virgule","Comparer et ordonner des décimaux"],
    cours:[
      { id:"2-1", titre:"Qu'est-ce qu'un nombre décimal ?",
        contenu:`Un nombre DÉCIMAL a deux parties séparées par une VIRGULE :
• Partie ENTIÈRE (avant la virgule)
• Partie DÉCIMALE (après la virgule)

VALEUR POSITIONNELLE après la virgule :
• 1er chiffre → DIXIÈMES (0,1)
• 2e chiffre → CENTIÈMES (0,01)
• 3e chiffre → MILLIÈMES (0,001)

EXEMPLE : 3,847
3 + 0,8 + 0,04 + 0,007

🌍 Le prix du litre d'huile de palme est 1 250,50 FCFA.`,
        exemples:[
          {question:"Valeur du chiffre 6 dans 14,263 ?", reponse:"6 centièmes (0,06)"},
          {question:"Écrire 5 + 0,3 + 0,07", reponse:"5,37"},
        ]
      },
      { id:"2-2", titre:"Comparer et ordonner les décimaux",
        contenu:`Pour COMPARER : on compare les parties entières, puis les dixièmes, etc.

ASTUCE : 3,5 = 3,50 (zéros à droite = même valeur)

EXEMPLES :
• 4,7 > 3,9 (entières : 4 > 3)
• 2,35 < 2,4 (dixièmes : 3 < 4)

🌍 Riz : 850,75 FCFA/kg — Farine : 850,50 FCFA/kg
850,75 > 850,50 → le riz est plus cher.`,
        exemples:[
          {question:"Compare 3,07 et 3,7", reponse:"3,07 < 3,7"},
          {question:"Ordre croissant : 2,5 ; 2,15 ; 2,51 ; 2,05", reponse:"2,05 < 2,15 < 2,5 < 2,51"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"Écrire en chiffres : quatre virgule cinquante-deux.",solution:"4,52"},
      {id:2,niveau:"Facile",enonce:"Valeur du chiffre 3 dans 15,038 ?",solution:"3 centièmes (0,03)"},
      {id:3,niveau:"Facile",enonce:"Décomposer 7,34.",solution:"7 + 0,3 + 0,04"},
      {id:4,niveau:"Facile",enonce:"Est-ce que 4,50 = 4,5 ?",solution:"Oui, les zéros à droite ne changent pas la valeur."},
      {id:5,niveau:"Facile",enonce:"Compare : 0,9 __ 0,90",solution:"0,9 = 0,90"},
      {id:6,niveau:"Moyen",enonce:"Ordre décroissant : 3,14 ; 3,41 ; 3,04 ; 3,4",solution:"3,41 > 3,4 > 3,14 > 3,04"},
      {id:7,niveau:"Moyen",enonce:"Trouver un décimal entre 2,3 et 2,4.",solution:"Exemple : 2,35"},
      {id:8,niveau:"Moyen",enonce:"Pain : 250,50 FCFA. Lait : 250,05 FCFA. Lequel est plus cher ?",solution:"Le pain (250,50 > 250,05)"},
      {id:9,niveau:"Moyen",enonce:"Écrire sous forme décimale : 8 + 4/10 + 7/100",solution:"8,47"},
      {id:10,niveau:"Moyen",enonce:"Combien de centièmes dans 3,75 ?",solution:"375 centièmes"},
      {id:11,niveau:"Difficile",enonce:"Aminata 1,53 m, Jean 1,48 m, Kofi 1,5 m. Du plus grand au plus petit.",solution:"Aminata > Kofi > Jean"},
      {id:12,niveau:"Difficile",enonce:"Tous les décimaux à 1 décimale entre 4 et 5.",solution:"4,1 ; 4,2 ; ... ; 4,9"},
      {id:13,niveau:"Difficile",enonce:"Un élève dit que 0,3 > 0,25 car 25 > 3. A-t-il raison ?",solution:"Non. 0,3 = 0,30 > 0,25. Il faut comparer chiffre par chiffre."},
      {id:14,niveau:"Difficile",enonce:"Marathon : 2h15,4min ; 2h15,04min ; 2h14,9min. Qui a gagné ?",solution:"Le coureur avec 2h14,9min."},
      {id:15,niveau:"Difficile",enonce:"Plus grand et plus petit décimal à 2 décimales, partie entière 6, somme des décimales = 7.",solution:"Plus grand : 6,70 — Plus petit : 6,07"},
    ],
  },
  3: {
    id:3, title:"Arrondir les nombres", duration:"2 semaines",
    objectives:["Arrondir à l'unité, au dixième, au centième","Encadrer un décimal","Utiliser les arrondis en contexte"],
    cours:[
      { id:"3-1", titre:"Arrondir un nombre décimal",
        contenu:`RÈGLE D'ARRONDI :
• 0,1,2,3,4 → arrondi INFÉRIEUR
• 5,6,7,8,9 → arrondi SUPÉRIEUR

À L'UNITÉ : regarder le dixième
• 3,7 → 4 (7 ≥ 5)  •  3,2 → 3 (2 < 5)

AU DIXIÈME : regarder le centième
• 3,47 → 3,5 (7 ≥ 5)  •  3,42 → 3,4 (2 < 5)

AU CENTIÈME : regarder le millième
• 2,346 → 2,35 (6 ≥ 5)  •  2,343 → 2,34 (3 < 5)

🌍 Carburant à 680,45 FCFA le litre → à l'unité : 680 FCFA`,
        exemples:[
          {question:"Arrondir 7,38 au dixième", reponse:"7,4"},
          {question:"Arrondir 15,245 au centième", reponse:"15,25"},
          {question:"Arrondir 9,951 à l'unité", reponse:"10"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"Arrondir 4,7 à l'unité.",solution:"5"},
      {id:2,niveau:"Facile",enonce:"Arrondir 3,42 à l'unité.",solution:"3"},
      {id:3,niveau:"Facile",enonce:"Arrondir 6,38 au dixième.",solution:"6,4"},
      {id:4,niveau:"Facile",enonce:"Arrondir 2,53 au dixième.",solution:"2,5"},
      {id:5,niveau:"Facile",enonce:"Encadrer 3,7 entre deux entiers.",solution:"3 < 3,7 < 4"},
      {id:6,niveau:"Moyen",enonce:"Arrondir 14,356 au centième.",solution:"14,36"},
      {id:7,niveau:"Moyen",enonce:"Arrondir 8,999 au dixième.",solution:"9,0"},
      {id:8,niveau:"Moyen",enonce:"Encadrer 5,47 entre deux dixièmes.",solution:"5,4 < 5,47 < 5,5"},
      {id:9,niveau:"Moyen",enonce:"Tronc de 3,475 m. Longueur arrondie au dixième.",solution:"3,5 m"},
      {id:10,niveau:"Moyen",enonce:"Manioc à 357,6 FCFA/kg. Arrondir à l'unité.",solution:"358 FCFA"},
      {id:11,niveau:"Difficile",enonce:"Trouver un nombre dont l'arrondi à l'unité est 5 et au dixième est 4,8.",solution:"Exemple : 4,82"},
      {id:12,niveau:"Difficile",enonce:"Périmètre 125,48 m. Arrondir au dixième puis à l'unité. Résultats identiques ?",solution:"125,5 m puis 125 m. Non, différents."},
      {id:13,niveau:"Difficile",enonce:"100 FCFA divisés en 3. Résultat arrondi. Problème ?",solution:"33,33 FCFA × 3 = 99,99 FCFA. Il manque 0,01 FCFA."},
      {id:14,niveau:"Difficile",enonce:"100 m en 11,47 s. Record : 11,5 s. Bat-il le record ?",solution:"11,47 < 11,5 → oui."},
      {id:15,niveau:"Difficile",enonce:"3 nombres différents dont l'arrondi à l'unité est 7 et la somme est 21.",solution:"Exemple : 6,8 + 7,1 + 7,1 = 21"},
    ],
  },
  4: {
    id:4, title:"Addition et soustraction", duration:"3 semaines",
    objectives:["Additionner et soustraire entiers et décimaux","Poser en colonnes","Vérifier par estimation","Résoudre des problèmes"],
    cours:[
      { id:"4-1", titre:"Addition de décimaux",
        contenu:`MÉTHODE : aligner les virgules, compléter avec des zéros, additionner.

EXEMPLE : 12,5 + 3,47
    12,50
  +  3,47
  ──────
    15,97

🌍 Poisson : 2 500,50 FCFA + Légumes : 750,25 FCFA
Total = 3 250,75 FCFA`,
        exemples:[
          {question:"Calculer 45,3 + 8,75", reponse:"54,05"},
          {question:"Calculer 100 + 3,05 + 0,8", reponse:"103,85"},
        ]
      },
      { id:"4-2", titre:"Soustraction de décimaux",
        contenu:`MÉTHODE : aligner les virgules, compléter avec des zéros, soustraire.

EXEMPLE : 15,3 − 7,48
    15,30
  −  7,48
  ──────
     7,82

VÉRIFICATION : 7,82 + 7,48 = 15,30 ✓

🌍 Papa a 10 000 FCFA. Pain à 1 250,75 FCFA.
Reste : 8 749,25 FCFA`,
        exemples:[
          {question:"Calculer 20 − 3,75", reponse:"16,25"},
          {question:"Calculer 8,4 − 2,85", reponse:"5,55"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"Calculer : 345 + 278",solution:"623"},
      {id:2,niveau:"Facile",enonce:"Calculer : 1 000 − 437",solution:"563"},
      {id:3,niveau:"Facile",enonce:"Calculer : 3,5 + 2,8",solution:"6,3"},
      {id:4,niveau:"Facile",enonce:"Calculer : 7,4 − 3,2",solution:"4,2"},
      {id:5,niveau:"Facile",enonce:"Calculer : 12,5 + 0,75",solution:"13,25"},
      {id:6,niveau:"Moyen",enonce:"Calculer : 100 − 34,75",solution:"65,25"},
      {id:7,niveau:"Moyen",enonce:"Calculer : 8,07 + 3,9 + 0,003",solution:"11,973"},
      {id:8,niveau:"Moyen",enonce:"Calculer : 15,4 − 7,85",solution:"7,55"},
      {id:9,niveau:"Moyen",enonce:"Aminata a 5 000 FCFA. Cahier 350,50 + stylo 125 FCFA. Reste ?",solution:"4 524,50 FCFA"},
      {id:10,niveau:"Moyen",enonce:"Nil : 6 650 km, Congo : 4 700 km. Différence ?",solution:"1 950 km"},
      {id:11,niveau:"Difficile",enonce:"Trouver x : x + 3,75 = 10,2",solution:"x = 6,45"},
      {id:12,niveau:"Difficile",enonce:"Somme = 15,8. Un nombre est 7,35. L'autre ?",solution:"8,45"},
      {id:13,niveau:"Difficile",enonce:"Jean : 12,5 + 8,75 km. Kofi : 23 km. Qui a parcouru le plus ?",solution:"Kofi de 1,75 km de plus."},
      {id:14,niveau:"Difficile",enonce:"Loyer 150 000 + nourriture 85 500,50 + transport 25 750,25. Revenu 300 000. Reste ?",solution:"38 749,25 FCFA"},
      {id:15,niveau:"Difficile",enonce:"Deux nombres : somme = 8,5, différence = 1,3.",solution:"4,9 et 3,6"},
    ],
  },
  5: {
    id:5, title:"Multiplication", duration:"3 semaines",
    objectives:["Multiplier entiers et décimaux","Multiplier par 10, 100, 1 000","Résoudre des problèmes"],
    cours:[
      { id:"5-1", titre:"Multiplication de décimaux",
        contenu:`MÉTHODE :
1. Oublier les virgules → multiplier comme des entiers
2. Compter le total de décimales dans les deux facteurs
3. Placer la virgule dans le résultat

EXEMPLE : 3,4 × 2,5
34 × 25 = 850 — décimales : 1+1=2 → 8,50

× 10 / × 100 / × 1 000 :
Décaler la virgule à droite (1, 2, 3 rangs)
• 3,45 × 10 = 34,5
• 3,45 × 100 = 345

🌍 Taxi : 1 500,50 FCFA × 3 = 4 501,50 FCFA`,
        exemples:[
          {question:"2,5 × 4", reponse:"10"},
          {question:"0,6 × 0,7", reponse:"0,42"},
          {question:"4,37 × 100", reponse:"437"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"6 × 7",solution:"42"},
      {id:2,niveau:"Facile",enonce:"3,5 × 10",solution:"35"},
      {id:3,niveau:"Facile",enonce:"4,2 × 100",solution:"420"},
      {id:4,niveau:"Facile",enonce:"2,5 × 4",solution:"10"},
      {id:5,niveau:"Facile",enonce:"0,3 × 1 000",solution:"300"},
      {id:6,niveau:"Moyen",enonce:"3,4 × 2,5",solution:"8,5"},
      {id:7,niveau:"Moyen",enonce:"0,6 × 0,8",solution:"0,48"},
      {id:8,niveau:"Moyen",enonce:"1,25 × 4",solution:"5"},
      {id:9,niveau:"Moyen",enonce:"Sac de riz : 8 500 FCFA. 4 sacs ?",solution:"34 000 FCFA"},
      {id:10,niveau:"Moyen",enonce:"Eau : 0,75 FCFA/L. 12 litres ?",solution:"9 FCFA"},
      {id:11,niveau:"Difficile",enonce:"2,35 × 1,4",solution:"3,29"},
      {id:12,niveau:"Difficile",enonce:"Voiture : 8,5 L/100 km. Pour 350 km ?",solution:"29,75 litres"},
      {id:13,niveau:"Difficile",enonce:"3,5 × x = 17,5",solution:"x = 5"},
      {id:14,niveau:"Difficile",enonce:"Parcelle : 12,5 m × 8,4 m. Aire ?",solution:"105 m²"},
      {id:15,niveau:"Difficile",enonce:"Économies : 2 500,50 FCFA/semaine × 52 semaines",solution:"130 026 FCFA"},
    ],
  },
  6: {
    id:6, title:"Division", duration:"3 semaines",
    objectives:["Division euclidienne","Diviser des décimaux","Diviser par 10, 100, 1 000"],
    cours:[
      { id:"6-1", titre:"Division euclidienne",
        contenu:`VOCABULAIRE :
DIVIDENDE ÷ DIVISEUR = QUOTIENT reste RESTE
dividende = diviseur × quotient + reste
0 ≤ reste < diviseur

EXEMPLE : 47 ÷ 5 = 9 reste 2
Vérif : 5 × 9 + 2 = 47 ✓

🌍 47 mangues en sachets de 5 :
9 sachets complets + 2 mangues restantes.`,
        exemples:[
          {question:"Division euclidienne de 83 par 7", reponse:"83 = 7 × 11 + 6"},
          {question:"Vérifier : 156 = 12 × 13 + 0", reponse:"✓ 156 est divisible par 12."},
        ]
      },
      { id:"6-2", titre:"Division décimale et par 10, 100, 1000",
        contenu:`DIVISION DÉCIMALE : continuer avec des décimales.
7 ÷ 4 = 1,75

÷ 10 / ÷ 100 / ÷ 1 000 :
Décaler la virgule à gauche (1, 2, 3 rangs)
• 345 ÷ 10 = 34,5
• 345 ÷ 100 = 3,45

🌍 1 500 FCFA entre 4 amis = 375 FCFA chacun.`,
        exemples:[
          {question:"45 ÷ 100", reponse:"0,45"},
          {question:"9 ÷ 4", reponse:"2,25"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"Division euclidienne : 35 ÷ 6",solution:"35 = 6 × 5 + 5"},
      {id:2,niveau:"Facile",enonce:"Division euclidienne : 48 ÷ 8",solution:"48 = 8 × 6 + 0"},
      {id:3,niveau:"Facile",enonce:"730 ÷ 10",solution:"73"},
      {id:4,niveau:"Facile",enonce:"450 ÷ 100",solution:"4,5"},
      {id:5,niveau:"Facile",enonce:"8 ÷ 2",solution:"4"},
      {id:6,niveau:"Moyen",enonce:"7 ÷ 4",solution:"1,75"},
      {id:7,niveau:"Moyen",enonce:"15 ÷ 8",solution:"1,875"},
      {id:8,niveau:"Moyen",enonce:"3 600 ÷ 1 000",solution:"3,6"},
      {id:9,niveau:"Moyen",enonce:"250 FCFA entre 4 enfants.",solution:"62,5 FCFA"},
      {id:10,niveau:"Moyen",enonce:"25 kg de riz en portions de 0,5 kg. Combien ?",solution:"50 portions"},
      {id:11,niveau:"Difficile",enonce:"17,5 ÷ 2,5",solution:"7"},
      {id:12,niveau:"Difficile",enonce:"Camion : 450 km avec 50 L. Conso aux 100 km ?",solution:"≈ 11,11 L/100 km"},
      {id:13,niveau:"Difficile",enonce:"Plus grand entier n tel que 7n ≤ 100.",solution:"n = 14"},
      {id:14,niveau:"Difficile",enonce:"Division de a par 9 : quotient 12, reste 5.",solution:"a = 113"},
      {id:15,niveau:"Difficile",enonce:"3 familles, 4 500 000 FCFA. F1 = double de F2. F3 = F2.",solution:"F1 : 2 250 000 — F2, F3 : 1 125 000 chacune"},
    ],
  },
  7: {
    id:7, title:"Priorités opératoires", duration:"2 semaines",
    objectives:["Règles de priorité","Utiliser les parenthèses","Expressions à plusieurs opérations"],
    cours:[
      { id:"7-1", titre:"Règles de priorité",
        contenu:`ORDRE :
1. PARENTHÈSES en premier
2. × et ÷ (gauche à droite)
3. + et − (gauche à droite)

EXEMPLES :
• 3 + 4 × 2 = 3 + 8 = 11
• (3 + 4) × 2 = 7 × 2 = 14
• 20 − 4 × 3 + 2 = 20 − 12 + 2 = 10

⚠️ 3 + 4 × 2 ≠ 14 (FAUX !)

🌍 Monnaie sur 2 000 FCFA pour 3 beignets à 500 FCFA :
2 000 − 3 × 500 = 500 FCFA`,
        exemples:[
          {question:"5 + 3 × 4", reponse:"17"},
          {question:"(5 + 3) × 4", reponse:"32"},
          {question:"24 ÷ 4 + 2 × 3", reponse:"12"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"2 + 3 × 5",solution:"17"},
      {id:2,niveau:"Facile",enonce:"(2 + 3) × 5",solution:"25"},
      {id:3,niveau:"Facile",enonce:"10 − 4 ÷ 2",solution:"8"},
      {id:4,niveau:"Facile",enonce:"12 ÷ 4 × 3",solution:"9"},
      {id:5,niveau:"Facile",enonce:"8 + 2 × 0",solution:"8"},
      {id:6,niveau:"Moyen",enonce:"3 × (4 + 5) − 2",solution:"25"},
      {id:7,niveau:"Moyen",enonce:"20 − (3 + 2) × 3",solution:"5"},
      {id:8,niveau:"Moyen",enonce:"2,5 × 4 + 3 × 1,5",solution:"14,5"},
      {id:9,niveau:"Moyen",enonce:"4 cahiers à 350 FCFA + 2 stylos à 125 FCFA.",solution:"1 650 FCFA"},
      {id:10,niveau:"Moyen",enonce:"(3 + 4) × 2 − 1",solution:"13"},
      {id:11,niveau:"Difficile",enonce:"4 × (3 + 2)²",solution:"100"},
      {id:12,niveau:"Difficile",enonce:"(12 + 3 × 4) ÷ (2 × 4 − 2)",solution:"4"},
      {id:13,niveau:"Difficile",enonce:"99 × 37 + 37 (sans calculatrice)",solution:"37 × 100 = 3 700"},
      {id:14,niveau:"Difficile",enonce:"50 ananas à 200 FCFA, 45 vendus à 350 FCFA. Bénéfice ?",solution:"5 750 FCFA"},
      {id:15,niveau:"Difficile",enonce:"25 × 48 × 4 (astucieusement)",solution:"25 × 4 × 48 = 4 800"},
    ],
  },
  8: {
    id:8, title:"Fractions", duration:"4 semaines",
    objectives:["Notion de fraction","Fractions égales","Comparer des fractions","Additionner et soustraire","Convertir fractions et décimaux"],
    cours:[
      { id:"8-1", titre:"Qu'est-ce qu'une fraction ?",
        contenu:`NOTATION : a/b — a = numérateur, b = dénominateur (≠ 0)

TYPES :
• Propre : 3/4 (num < dén)
• Impropre : 7/4 (num ≥ dén)
• Entier : 6/3 = 2

🌍 Papaye coupée en 8 parts.
Maman mange 3 parts → 3/8.
Reste : 5/8.

FRACTION D'UNE QUANTITÉ :
3/4 de 200 FCFA = 200 × 3 ÷ 4 = 150 FCFA`,
        exemples:[
          {question:"2 parts sur 5 ?", reponse:"2/5"},
          {question:"3/4 de 120 FCFA", reponse:"90 FCFA"},
        ]
      },
      { id:"8-2", titre:"Fractions égales et simplification",
        contenu:`Multiplier ou diviser numérateur ET dénominateur par un même nombre.

1/2 = 2/4 = 3/6 = 4/8
6/8 = 3/4 (÷2)

SIMPLIFIER = diviser par le PGCD.
12/18 → PGCD=6 → 2/3

🌍 6 victoires sur 8 matchs → 6/8 = 3/4`,
        exemples:[
          {question:"Simplifier 15/25", reponse:"3/5"},
          {question:"2/3 = ?/12", reponse:"8/12"},
        ]
      },
      { id:"8-3", titre:"Comparer et opérer",
        contenu:`MÊME DÉNOMINATEUR : plus grand numérateur = plus grande fraction.
3/7 < 5/7 < 6/7

DÉNOMINATEURS DIFFÉRENTS : ramener au même dénominateur.
1/3 et 2/5 → 5/15 et 6/15 → 1/3 < 2/5

ADDITION/SOUSTRACTION (même dénominateur) :
3/7 + 2/7 = 5/7
5/7 − 2/7 = 3/7

🌍 Aminata mange 2/8, Kofi 3/8.
Ensemble : 5/8. Reste : 3/8.`,
        exemples:[
          {question:"3/8 + 1/8", reponse:"1/2"},
          {question:"7/10 − 3/10", reponse:"2/5"},
          {question:"Comparer 3/4 et 5/6", reponse:"3/4 < 5/6"},
        ]
      },
    ],
    exercices:[
      {id:1,niveau:"Facile",enonce:"3 parts sur 5.",solution:"3/5"},
      {id:2,niveau:"Facile",enonce:"1/4 de 200 FCFA.",solution:"50 FCFA"},
      {id:3,niveau:"Facile",enonce:"Simplifier : 4/6",solution:"2/3"},
      {id:4,niveau:"Facile",enonce:"2/5 + 1/5",solution:"3/5"},
      {id:5,niveau:"Facile",enonce:"7/9 − 4/9",solution:"1/3"},
      {id:6,niveau:"Moyen",enonce:"3/4 = ?/20",solution:"15/20"},
      {id:7,niveau:"Moyen",enonce:"Simplifier : 18/24",solution:"3/4"},
      {id:8,niveau:"Moyen",enonce:"Comparer : 5/8 et 3/5",solution:"5/8 > 3/5"},
      {id:9,niveau:"Moyen",enonce:"Classe de 30 élèves. 2/5 filles. Combien ?",solution:"12 filles"},
      {id:10,niveau:"Moyen",enonce:"Kofi mange 3/8, Jean 2/8. Fraction mangée ?",solution:"5/8"},
      {id:11,niveau:"Difficile",enonce:"1/3 + 1/4",solution:"7/12"},
      {id:12,niveau:"Difficile",enonce:"Ordre croissant : 3/4 ; 2/3 ; 5/6 ; 7/12",solution:"7/12 < 2/3 < 3/4 < 5/6"},
      {id:13,niveau:"Difficile",enonce:"1/4 nourriture, 1/3 transport. Fraction restante ?",solution:"5/12"},
      {id:14,niveau:"Difficile",enonce:"Terrain 1 200 m² : 3/8 jardin, 1/4 maison, reste garage.",solution:"Jardin 450 — Maison 300 — Garage 450 m²"},
      {id:15,niveau:"Difficile",enonce:"Montrer que 2/3 de 3/4 = 1/2.",solution:"2/3 × 3/4 = 6/12 = 1/2 ✓"},
    ],
  },
};

// ─── DONNÉES ──────────────────────────────────────────────────────────────────
const CHAPTERS = [
  {id:1,  part:1, title:"Nombres entiers",          partName:"Nombres & Calculs"},
  {id:2,  part:1, title:"Nombres décimaux",         partName:"Nombres & Calculs"},
  {id:3,  part:1, title:"Arrondir les nombres",     partName:"Nombres & Calculs"},
  {id:4,  part:1, title:"Addition et soustraction", partName:"Nombres & Calculs"},
  {id:5,  part:1, title:"Multiplication",           partName:"Nombres & Calculs"},
  {id:6,  part:1, title:"Division",                 partName:"Nombres & Calculs"},
  {id:7,  part:1, title:"Priorités opératoires",    partName:"Nombres & Calculs"},
  {id:8,  part:1, title:"Fractions",                partName:"Nombres & Calculs"},
  {id:9,  part:2, title:"Droites et angles",        partName:"Géométrie plane"},
  {id:10, part:2, title:"Triangles",                partName:"Géométrie plane"},
  {id:11, part:2, title:"Quadrilatères",            partName:"Géométrie plane"},
  {id:12, part:2, title:"Cercle",                   partName:"Géométrie plane"},
  {id:13, part:2, title:"Symétrie axiale",          partName:"Géométrie plane"},
  {id:14, part:2, title:"Périmètre et aire",        partName:"Géométrie plane"},
  {id:15, part:3, title:"Longueurs",                partName:"Grandeurs & Mesures"},
  {id:16, part:3, title:"Masses",                   partName:"Grandeurs & Mesures"},
  {id:17, part:3, title:"Durées",                   partName:"Grandeurs & Mesures"},
  {id:18, part:3, title:"Aires",                    partName:"Grandeurs & Mesures"},
  {id:19, part:3, title:"Volumes",                  partName:"Grandeurs & Mesures"},
  {id:20, part:4, title:"Solides",                  partName:"Géométrie dans l'espace"},
  {id:21, part:4, title:"Patrons",                  partName:"Géométrie dans l'espace"},
  {id:22, part:4, title:"Repérage dans l'espace",   partName:"Géométrie dans l'espace"},
  {id:23, part:5, title:"Tableaux et graphiques",   partName:"Données & Statistiques"},
  {id:24, part:5, title:"Moyennes",                 partName:"Données & Statistiques"},
  {id:25, part:5, title:"Proportionnalité",         partName:"Données & Statistiques"},
];

const PARTS = [
  {id:1, name:"Nombres & Calculs",       icon:"🔢", color:"#E8A838"},
  {id:2, name:"Géométrie plane",         icon:"📐", color:"#4A9EF5"},
  {id:3, name:"Grandeurs & Mesures",     icon:"📏", color:"#3EC98B"},
  {id:4, name:"Géométrie dans l'espace", icon:"🔷", color:"#9B7FE8"},
  {id:5, name:"Données & Statistiques",  icon:"📊", color:"#F56565"},
];

const SUBJECTS = [
  {id:"maths",   name:"Mathématiques",  icon:"🔢", available:true },
  {id:"french",  name:"Français",       icon:"📝", available:false},
  {id:"svt",     name:"SVT",            icon:"🌿", available:false},
  {id:"histgeo", name:"Histoire-Géo",   icon:"🌍", available:false},
  {id:"phys",    name:"Physique-Chimie",icon:"⚗️",  available:false},
  {id:"english", name:"Anglais",        icon:"🇬🇧", available:false},
];

const PLANS = [
  {id:"free",      name:"Gratuit",   price:0,    color:"#718096", features:["3 leçons d'essai","Tuteur Kodjo limité","Aperçu des exercices"], cta:"Commencer gratuitement"},
  {id:"essential", name:"Essentiel", price:1995, color:"#E8A838", features:["Tous les cours complets","Toutes les matières","Tuteur Kodjo illimité","Suivi de progression"], cta:"Choisir Essentiel"},
  {id:"premium",   name:"Premium",   price:2995, color:"#3EC98B", features:["Tout l'Essentiel","Exercices + Corrigés","Compétition africaine","Badges & Trophées","Classement continental"], cta:"Choisir Premium", popular:true},
];

const LEADERBOARD = [
  {rank:1, name:"Aminata D.",   country:"🇸🇳", score:9840, badge:"🥇"},
  {rank:2, name:"Kwame A.",     country:"🇨🇮", score:9210, badge:"🥈"},
  {rank:3, name:"Blessing N.",  country:"🇨🇲", score:8990, badge:"🥉"},
  {rank:4, name:"Fatoumata K.", country:"🇲🇱", score:8750, badge:"⭐"},
  {rank:5, name:"Junior M.",    country:"🇨🇩", score:8540, badge:"⭐"},
  {rank:6, name:"Awa T.",       country:"🇧🇯", score:8320, badge:"⭐"},
  {rank:7, name:"Kofi B.",      country:"🇹🇬", score:8100, badge:"⭐"},
  {rank:8, name:"Marie C.",     country:"🇬🇦", score:7980, badge:"⭐"},
];

const FAKE_USERS = [
  {id:1, name:"Aminata Diallo",  email:"aminata@gmail.com", country:"Sénégal",       level:"6ème", plan:"Premium",   joined:"01/04/2026", active:true},
  {id:2, name:"Jean Mballa",     email:"jean@gmail.com",    country:"Cameroun",      level:"6ème", plan:"Essentiel", joined:"03/04/2026", active:true},
  {id:3, name:"Marie Obiang",    email:"marie@gmail.com",   country:"Gabon",         level:"6ème", plan:"Gratuit",   joined:"05/04/2026", active:true},
  {id:4, name:"Kofi Asante",     email:"kofi@gmail.com",    country:"Côte d'Ivoire", level:"6ème", plan:"Premium",   joined:"07/04/2026", active:true},
  {id:5, name:"Fatoumata Keita", email:"fato@gmail.com",    country:"Mali",          level:"6ème", plan:"Essentiel", joined:"10/04/2026", active:false},
  {id:6, name:"Junior Mutombo",  email:"junior@gmail.com",  country:"RDC",           level:"6ème", plan:"Gratuit",   joined:"12/04/2026", active:true},
  {id:7, name:"Awa Traoré",      email:"awa@gmail.com",     country:"Bénin",         level:"6ème", plan:"Premium",   joined:"14/04/2026", active:true},
  {id:8, name:"Blessing Nkomo",  email:"blessing@gmail.com",country:"Congo",         level:"6ème", plan:"Essentiel", joined:"18/04/2026", active:true},
];

const SYSTEM_PROMPT = `Tu es Kodjo, un tuteur IA bienveillant pour AfriLearn. Tu aides des élèves de 6ème en Afrique francophone.
- Chaleureux, patient, encourageant
- Exemples tirés de la vie africaine (marchés, FCFA, villes africaines)
- Une seule question à la fois
- Français simple et clair
Commence par te présenter et demander le prénom et pays de l'élève.`;

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');

  :root {
    --bg:       #0A0E1A;
    --surface:  #111827;
    --surface2: #1A2235;
    --border:   rgba(255,255,255,0.06);
    --border2:  rgba(255,255,255,0.1);
    --text:     #F0F4FF;
    --muted:    #6B7FA3;
    --faint:    #2A3548;
    --gold:     #E8A838;
    --green:    #3EC98B;
    --blue:     #4A9EF5;
    --red:      #F56565;
    --purple:   #9B7FE8;
  }

  * { box-sizing:border-box; margin:0; padding:0; }
  html, body { height:100%; }
  body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); -webkit-font-smoothing:antialiased; }

  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--faint); border-radius:2px; }

  .fade { animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  .pulse { animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .shimmer { background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%); background-size:300% 100%; animation:shimmer 1.8s infinite; }
  @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

  .btn-hover { transition:all 0.18s ease; }
  .btn-hover:hover { filter:brightness(1.1); transform:translateY(-1px); }
  .btn-hover:active { transform:translateY(0); }

  .card-hover { transition:all 0.2s ease; }
  .card-hover:hover { background:var(--surface2) !important; border-color:rgba(255,255,255,0.12) !important; }
`;

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  card: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:16 },
  input: { background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:10, padding:"12px 16px", color:"var(--text)", fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", transition:"border-color 0.2s" },
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Chip = ({children, color="var(--gold)", size="sm"}) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:`${color}18`, color, border:`1px solid ${color}30`, borderRadius:999, padding:size==="sm"?"2px 10px":"4px 14px", fontSize:size==="sm"?11:12, fontWeight:600, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>
    {children}
  </span>
);

const Pill = ({children, onClick, active, color="var(--gold)"}) => (
  <button onClick={onClick} className="btn-hover" style={{ background:active?`${color}18`:"transparent", color:active?color:"var(--muted)", border:`1px solid ${active?`${color}30`:"var(--border)"}`, borderRadius:999, padding:"7px 16px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s", whiteSpace:"nowrap" }}>
    {children}
  </button>
);

const Btn = ({children, onClick, variant="solid", color="var(--gold)", disabled=false, style={}}) => {
  const base = { fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, borderRadius:12, padding:"11px 22px", cursor:disabled?"not-allowed":"pointer", border:"none", transition:"all 0.18s ease", opacity:disabled?0.5:1, ...style };
  if (variant==="solid") return <button onClick={onClick} disabled={disabled} className="btn-hover" style={{ ...base, background:color, color:"#fff" }}>{children}</button>;
  if (variant==="outline") return <button onClick={onClick} disabled={disabled} className="btn-hover" style={{ ...base, background:"transparent", color, border:`1.5px solid ${color}50` }}>{children}</button>;
  if (variant==="ghost") return <button onClick={onClick} disabled={disabled} className="btn-hover" style={{ ...base, background:"transparent", color, padding:"11px 16px" }}>{children}</button>;
};

const Surface = ({children, style={}, onClick, hover=false}) => (
  <div onClick={onClick} className={hover?"card-hover":""} style={{ ...T.card, padding:20, cursor:onClick?"pointer":"default", ...style }}>
    {children}
  </div>
);

const Divider = ({style={}}) => <div style={{ height:1, background:"var(--border)", ...style }}/>;

const Footer = () => (
  <div style={{ padding:"20px", textAlign:"center", borderTop:"1px solid var(--border)", marginTop:32 }}>
    <p style={{ fontSize:11, color:"var(--faint)", letterSpacing:"0.02em" }}>© {new Date().getFullYear()} AfriLearn — Tous droits réservés. Contenu protégé.</p>
  </div>
);

// ─── MODALS ───────────────────────────────────────────────────────────────────
const CGUModal = ({onAccept, onDecline}) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)" }}>
    <div className="fade" style={{ background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:20, maxWidth:520, width:"100%", maxHeight:"82vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"24px 28px 20px", borderBottom:"1px solid var(--border)" }}>
        <p style={{ fontSize:12, color:"var(--gold)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>Conditions d'utilisation</p>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:600, lineHeight:1.3 }}>Avant de commencer</h3>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 28px", fontSize:13, lineHeight:1.8, color:"#94A3B8" }}>
        {[["Objet","AfriLearn est une plateforme éducative numérique pour les élèves d'Afrique francophone."],["Propriété intellectuelle","Tous les contenus (cours, exercices, corrigés, logo) sont la propriété exclusive d'AfriLearn. Toute reproduction sans autorisation est interdite."],["Abonnements","Abonnements mensuels. Paiement via Mobile Money ou carte (CinetPay). Aucun remboursement après accès."],["Tuteur IA Kodjo","Fourni à titre pédagogique. Croiser avec un enseignant qualifié est recommandé."],["Données personnelles","Seules les données nécessaires sont collectées. Jamais vendues à des tiers."],["Comportement","Tout abus entraîne la suspension immédiate du compte."],["Droit applicable","CGU soumises au droit gabonais. Litiges : tribunaux de Libreville."]].map(([t,c])=>(
          <div key={t} style={{ marginBottom:16 }}>
            <p style={{ fontWeight:600, color:"var(--text)", marginBottom:4 }}>Art. {t}</p>
            <p>{c}</p>
          </div>
        ))}
      </div>
      <div style={{ padding:"20px 28px", borderTop:"1px solid var(--border)", display:"flex", gap:10 }}>
        <Btn onClick={onDecline} variant="outline" color="var(--muted)" style={{ flex:1 }}>Refuser</Btn>
        <Btn onClick={onAccept} color="var(--gold)" style={{ flex:1 }}>Accepter et continuer</Btn>
      </div>
    </div>
  </div>
);

const AdminBar = ({onBack}) => (
  <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, background:"var(--gold)", padding:"10px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:14 }}>👁️</span>
      <span style={{ fontSize:12, fontWeight:700, color:"#1A1200" }}>Prévisualisation — Vue élève Premium</span>
    </div>
    <button onClick={onBack} style={{ background:"rgba(0,0,0,0.15)", border:"none", color:"#1A1200", borderRadius:8, padding:"5px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Admin</button>
  </div>
);

// ─── LANDING ─────────────────────────────────────────────────────────────────
const Landing = ({onEnter}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      {/* Background elements */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% -20%, rgba(232,168,56,0.12) 0%, transparent 60%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"20%", right:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(62,201,139,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>

      {/* Nav */}
      <nav style={{ padding:"20px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>🌍</span>
          <span style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:"var(--text)", letterSpacing:"-0.02em" }}>AfriLearn</span>
        </div>
        <Btn onClick={() => onEnter("login")} variant="outline" color="var(--text)" style={{ padding:"9px 20px", fontSize:13 }}>Se connecter</Btn>
      </nav>

      {/* Hero */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px 80px", textAlign:"center", position:"relative", zIndex:10 }}>
        <div style={{ opacity:visible?1:0, transform:visible?"none":"translateY(20px)", transition:"all 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(232,168,56,0.1)", border:"1px solid rgba(232,168,56,0.25)", borderRadius:999, padding:"6px 16px", marginBottom:32 }}>
            <span style={{ fontSize:13 }}>✨</span>
            <span style={{ fontSize:12, color:"var(--gold)", fontWeight:600, letterSpacing:"0.04em" }}>Plateforme éducative IA · Afrique francophone</span>
          </div>

          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(2.8rem,7vw,5rem)", fontWeight:700, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:24, maxWidth:700 }}>
            Apprendre,<br/>
            <span style={{ color:"var(--gold)", fontStyle:"italic" }}>progresser</span>,<br/>
            réussir.
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"var(--muted)", lineHeight:1.7, maxWidth:480, margin:"0 auto 40px" }}>
            Du 6ème à la Terminale — cours complets, exercices, tuteur IA Kodjo et compétition entre élèves de toute l'Afrique.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={() => onEnter("register")} color="var(--gold)" style={{ padding:"14px 32px", fontSize:15, borderRadius:14 }}>Commencer gratuitement</Btn>
            <Btn onClick={() => onEnter("login")} variant="outline" color="var(--text)" style={{ padding:"14px 28px", fontSize:15, borderRadius:14 }}>Se connecter</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:0, marginTop:64, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:18, overflow:"hidden", opacity:visible?1:0, transition:"opacity 0.7s ease 0.3s" }}>
          {[["20+","Pays"],["25","Chapitres"],["120","Exercices"],["100%","Africain"]].map(([n,l],i)=>(
            <div key={l} style={{ padding:"20px 32px", textAlign:"center", borderRight:i<3?"1px solid var(--border)":"none" }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color:"var(--gold)", lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, letterSpacing:"0.04em", textTransform:"uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute", bottom:16, width:"100%", textAlign:"center", fontSize:11, color:"var(--faint)" }}>
        © {new Date().getFullYear()} AfriLearn — Tous droits réservés
      </div>
    </div>
  );
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = ({mode, onAuth, onSwitch}) => {
  const [form, setForm] = useState({name:"", email:"", country:"Gabon", password:"", level:"6ème"});
  const [showCGU, setShowCGU] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    if (mode==="register" && !cguAccepted) { setError("Vous devez accepter les CGU pour continuer."); return; }
    if (form.email===SUPER_ADMIN.email && form.password===SUPER_ADMIN.password) { onAuth({name:"Super Administrateur", email:form.email, role:"superadmin", plan:"SuperAdmin", country:"Gabon", level:"Admin"}); return; }
    const admin = ADMIN_ACCOUNTS.find(a => a.email===form.email && a.password===form.password);
    if (admin) { onAuth({...admin, plan:"Admin", country:"Gabon", level:"Admin"}); return; }
    onAuth({name:form.name||"Élève", email:form.email, country:form.country, level:form.level, plan:"Gratuit", role:"user"});
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,168,56,0.08) 0%, transparent 60%)", pointerEvents:"none" }}/>
      {showCGU && <CGUModal onAccept={() => { setCguAccepted(true); setShowCGU(false); }} onDecline={() => setShowCGU(false)}/>}

      <div className="fade" style={{ width:"100%", maxWidth:400, position:"relative", zIndex:10 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <span style={{ fontSize:32 }}>🌍</span>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, marginTop:12, marginBottom:6, letterSpacing:"-0.02em" }}>
            {mode==="login" ? "Bon retour" : "Créer un compte"}
          </h2>
          <p style={{ color:"var(--muted)", fontSize:14 }}>
            {mode==="login" ? "Heureux de te revoir sur AfriLearn" : "Rejoins des milliers d'élèves africains"}
          </p>
        </div>

        <Surface style={{ padding:28 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && (
              <div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:500, display:"block", marginBottom:6 }}>Prénom</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Ton prénom" style={T.input}/>
              </div>
            )}
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:500, display:"block", marginBottom:6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="ton@email.com" style={T.input}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--muted)", fontWeight:500, display:"block", marginBottom:6 }}>Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="••••••••" style={T.input} onKeyDown={e => e.key==="Enter" && handleSubmit()}/>
            </div>
            {mode==="register" && <>
              <div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:500, display:"block", marginBottom:6 }}>Pays</label>
                <select value={form.country} onChange={e => setForm({...form, country:e.target.value})} style={{...T.input, appearance:"none"}}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--muted)", fontWeight:500, display:"block", marginBottom:6 }}>Niveau</label>
                <select value={form.level} onChange={e => setForm({...form, level:e.target.value})} style={{...T.input, appearance:"none"}}>{["6ème","5ème","4ème","3ème","2nde","1ère","Terminale"].map(l=><option key={l}>{l}</option>)}</select>
              </div>
              <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
                <input type="checkbox" checked={cguAccepted} onChange={e => setCguAccepted(e.target.checked)} style={{ marginTop:2, flexShrink:0 }}/>
                <span style={{ fontSize:13, color:"var(--muted)", lineHeight:1.5 }}>
                  J'accepte les <span onClick={e => { e.preventDefault(); setShowCGU(true); }} style={{ color:"var(--gold)", textDecoration:"underline", cursor:"pointer" }}>Conditions Générales d'Utilisation</span>
                </span>
              </label>
            </>}
            {error && <p style={{ color:"var(--red)", fontSize:13, background:"rgba(245,101,101,0.08)", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(245,101,101,0.2)" }}>{error}</p>}
            <Btn onClick={handleSubmit} color="var(--gold)" style={{ marginTop:4, padding:"14px", fontSize:15, borderRadius:12 }}>
              {mode==="login" ? "Se connecter" : "Créer mon compte"}
            </Btn>
          </div>
        </Surface>

        <p style={{ textAlign:"center", marginTop:20, color:"var(--muted)", fontSize:13 }}>
          {mode==="login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={onSwitch} style={{ color:"var(--gold)", cursor:"pointer", fontWeight:600 }}>{mode==="login" ? "S'inscrire" : "Se connecter"}</span>
        </p>
      </div>
    </div>
  );
};

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
const SuperAdmin = ({user, onLogout, onPreview}) => {
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState(FAKE_USERS);
  const stats = { total:users.length, premium:users.filter(u=>u.plan==="Premium").length, essential:users.filter(u=>u.plan==="Essentiel").length, free:users.filter(u=>u.plan==="Gratuit").length, revenue:users.filter(u=>u.plan==="Premium").length*2995+users.filter(u=>u.plan==="Essentiel").length*1995 };
  const tabs = [{id:"dashboard",icon:"⬡",label:"Tableau de bord"},{id:"users",icon:"⬡",label:"Utilisateurs"},{id:"content",icon:"⬡",label:"Contenu"},{id:"admins",icon:"⬡",label:"Admins"},{id:"finance",icon:"⬡",label:"Finances"},{id:"settings",icon:"⬡",label:"Paramètres"}];

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"var(--bg)" }}>
      {/* Sidebar */}
      <div style={{ width:240, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 20px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
            <span style={{ fontSize:20 }}>🌍</span>
            <span style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, letterSpacing:"-0.02em" }}>AfriLearn</span>
          </div>
          <div style={{ background:"rgba(232,168,56,0.1)", border:"1px solid rgba(232,168,56,0.2)", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--gold)", flexShrink:0 }}/>
            <span style={{ fontSize:12, color:"var(--gold)", fontWeight:600 }}>{user.role==="superadmin"?"Super Admin":"Admin"}</span>
          </div>
        </div>

        <Divider/>

        {/* Preview btn */}
        <div style={{ padding:"16px 12px 8px" }}>
          <button onClick={onPreview} className="btn-hover" style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(62,201,139,0.1)", border:"1px solid rgba(62,201,139,0.25)", color:"var(--green)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600 }}>
            <span>👁️</span> Voir le site
          </button>
        </div>

        <nav style={{ flex:1, padding:"4px 12px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:10, background:tab===t.id?"rgba(232,168,56,0.1)":"transparent", color:tab===t.id?"var(--gold)":"var(--muted)", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:tab===t.id?600:400, marginBottom:2, transition:"all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </nav>

        <Divider/>
        <div style={{ padding:"16px 20px" }}>
          <p style={{ fontSize:11, color:"var(--muted)", marginBottom:10, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</p>
          <Btn onClick={onLogout} variant="outline" color="var(--red)" style={{ width:"100%", padding:"9px", fontSize:12 }}>Déconnexion</Btn>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflow:"auto", padding:32 }}>
        {tab==="dashboard" && <div className="fade">
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em", marginBottom:24 }}>Tableau de bord</h1>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:28 }}>
            {[{label:"Utilisateurs",value:stats.total,color:"var(--blue)",icon:"👥"},{label:"Premium",value:stats.premium,color:"var(--green)",icon:"⭐"},{label:"Essentiel",value:stats.essential,color:"var(--gold)",icon:"📚"},{label:"Gratuit",value:stats.free,color:"var(--muted)",icon:"🆓"},{label:"Revenus / mois",value:`${stats.revenue.toLocaleString()}`,color:"var(--gold)",icon:"💰",sub:"FCFA"},{label:"Pays",value:"8",color:"var(--purple)",icon:"🌍"}].map(s=>(
              <Surface key={s.label} style={{ padding:20 }}>
                <div style={{ fontSize:22, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:s.color, lineHeight:1 }}>{s.value}{s.sub&&<span style={{ fontSize:11, color:"var(--muted)", marginLeft:4 }}>{s.sub}</span>}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>{s.label}</div>
              </Surface>
            ))}
          </div>
          <Surface>
            <p style={{ fontSize:13, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 }}>Activité récente</p>
            {[{action:"Nouvel abonné Premium",detail:"Aminata D. — Sénégal",time:"Il y a 2h",color:"var(--green)"},{action:"Nouvelle inscription",detail:"Jean M. — Cameroun",time:"Il y a 4h",color:"var(--blue)"},{action:"Upgrade → Premium",detail:"Marie O. — Gabon",time:"Il y a 6h",color:"var(--gold)"},{action:"Nouvelle inscription",detail:"Kofi A. — Côte d'Ivoire",time:"Il y a 8h",color:"var(--blue)"}].map((a,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<3?"1px solid var(--border)":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, flexShrink:0 }}/>
                  <div><div style={{ fontSize:13, fontWeight:500 }}>{a.action}</div><div style={{ fontSize:12, color:"var(--muted)" }}>{a.detail}</div></div>
                </div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{a.time}</div>
              </div>
            ))}
          </Surface>
        </div>}

        {tab==="users" && <div className="fade">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>Utilisateurs</h1>
            <Chip>{users.length} comptes</Chip>
          </div>
          <Surface style={{ padding:0, overflow:"hidden" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ borderBottom:"1px solid var(--border)" }}>{["Nom","Email","Pays","Niveau","Plan","Inscrit","Statut",""].map(h=><th key={h} style={{ padding:"14px 16px", textAlign:"left", fontWeight:600, color:"var(--muted)", fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
              <tbody>{users.map(u=>(
                <tr key={u.id} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"12px 16px", fontWeight:500 }}>{u.name}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{u.email}</td>
                  <td style={{ padding:"12px 16px" }}>{u.country}</td>
                  <td style={{ padding:"12px 16px" }}>{u.level}</td>
                  <td style={{ padding:"12px 16px" }}><Chip color={u.plan==="Premium"?"var(--green)":u.plan==="Essentiel"?"var(--gold)":"var(--muted)"}>{u.plan}</Chip></td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{u.joined}</td>
                  <td style={{ padding:"12px 16px" }}><span style={{ fontSize:12, color:u.active?"var(--green)":"var(--red)", fontWeight:600 }}>{u.active?"● Actif":"● Inactif"}</span></td>
                  <td style={{ padding:"12px 16px" }}><Btn onClick={() => setUsers(users.map(x=>x.id===u.id?{...x,active:!x.active}:x))} variant="ghost" color={u.active?"var(--red)":"var(--green)"} style={{ padding:"5px 12px", fontSize:12 }}>{u.active?"Suspendre":"Activer"}</Btn></td>
                </tr>
              ))}</tbody>
            </table>
          </Surface>
        </div>}

        {tab==="content" && <div className="fade">
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em", marginBottom:24 }}>Contenu</h1>
          {PARTS.map(part=>(
            <Surface key={part.id} style={{ marginBottom:14, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{part.icon}</span>
                  <span style={{ fontWeight:600, fontSize:15 }}>{part.name}</span>
                </div>
                <Chip color={part.id===1?"var(--green)":"var(--gold)"}>{part.id===1?"Complet":"En cours"}</Chip>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:6 }}>
                {CHAPTERS.filter(c=>c.part===part.id).map(ch=>(
                  <div key={ch.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"var(--surface2)", borderRadius:8, fontSize:12 }}>
                    <span style={{ color:CHAPTERS_CONTENT[ch.id]?"var(--text)":"var(--muted)" }}>{ch.id}. {ch.title}</span>
                    <span style={{ color:CHAPTERS_CONTENT[ch.id]?"var(--green)":"var(--faint)", fontSize:11 }}>{CHAPTERS_CONTENT[ch.id]?"✓":"·"}</span>
                  </div>
                ))}
              </div>
            </Surface>
          ))}
        </div>}

        {tab==="admins" && <div className="fade">
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em", marginBottom:24 }}>Administrateurs</h1>
          <Surface style={{ marginBottom:14, borderColor:"rgba(232,168,56,0.3)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><p style={{ fontWeight:600, marginBottom:4 }}>Super Administrateur</p><p style={{ fontSize:13, color:"var(--muted)" }}>{SUPER_ADMIN.email}</p></div>
              <Chip color="var(--gold)">Accès total</Chip>
            </div>
          </Surface>
          <Surface>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={{ fontWeight:600 }}>Administrateurs</p>
              <Btn color="var(--green)" style={{ padding:"7px 16px", fontSize:12 }}>+ Ajouter</Btn>
            </div>
            {ADMIN_ACCOUNTS.map((a,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px", background:"var(--surface2)", borderRadius:10 }}>
                <div><p style={{ fontWeight:500, fontSize:13 }}>{a.name}</p><p style={{ fontSize:12, color:"var(--muted)" }}>{a.email}</p></div>
                <div style={{ display:"flex", gap:8 }}><Chip color="var(--blue)">Admin</Chip><Btn variant="outline" color="var(--red)" style={{ padding:"5px 12px", fontSize:11 }}>Retirer</Btn></div>
              </div>
            ))}
          </Surface>
        </div>}

        {tab==="finance" && <div className="fade">
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em", marginBottom:24 }}>Finances</h1>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
            {[{label:"Revenus ce mois",value:`${stats.revenue.toLocaleString()} FCFA`,color:"var(--green)",icon:"💵"},{label:"Abonnés payants",value:stats.premium+stats.essential,color:"var(--gold)",icon:"👥"},{label:"Ticket moyen",value:"2 350 FCFA",color:"var(--blue)",icon:"📊"},{label:"Taux conversion",value:"62%",color:"var(--purple)",icon:"📈"}].map(s=>(
              <Surface key={s.label}><div style={{ fontSize:22, marginBottom:10 }}>{s.icon}</div><div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div><div style={{ fontSize:11, color:"var(--muted)", marginTop:6, textTransform:"uppercase", letterSpacing:"0.04em" }}>{s.label}</div></Surface>
            ))}
          </div>
          <Surface>
            <p style={{ fontWeight:600, marginBottom:16 }}>Tarifs en vigueur</p>
            {PLANS.filter(p=>p.price>0).map(p=>(
              <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid var(--border)" }}>
                <div><p style={{ fontWeight:500 }}>{p.name}</p><p style={{ fontSize:12, color:"var(--muted)" }}>Mensuel</p></div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}><span style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:p.color }}>{p.price.toLocaleString()} FCFA</span><Btn color="var(--gold)" style={{ padding:"6px 14px", fontSize:12 }}>Modifier</Btn></div>
              </div>
            ))}
          </Surface>
        </div>}

        {tab==="settings" && <div className="fade">
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em", marginBottom:24 }}>Paramètres</h1>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[{icon:"🔑",label:"Mot de passe Super Admin",desc:"Modifier les identifiants de connexion"},{icon:"🌍",label:"Pays disponibles",desc:"Activer ou désactiver des pays"},{icon:"💳",label:"Configuration CinetPay",desc:"Clés API et paiements"},{icon:"🤖",label:"Tuteur Kodjo",desc:"Paramètres du tuteur IA"},{icon:"📧",label:"Notifications",desc:"Emails et alertes automatiques"},{icon:"🛡️",label:"Sécurité",desc:"Journaux et sessions actives"}].map(s=>(
              <Surface key={s.label} hover onClick={() => {}} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                  <div><p style={{ fontWeight:500, fontSize:14 }}>{s.label}</p><p style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{s.desc}</p></div>
                </div>
                <span style={{ color:"var(--muted)", fontSize:18 }}>›</span>
              </Surface>
            ))}
          </div>
        </div>}
        <Footer/>
      </div>
    </div>
  );
};

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
const TopBar = ({user, screen, onNav}) => {
  const labels = {dashboard:"",chapters:"Mathématiques",tutor:"Kodjo",competition:"Compétition",pricing:"Abonnements",profile:"Profil",chapterContent:""};
  return (
    <div style={{ position:"sticky", top:user?.isPreview?40:0, zIndex:50, background:"rgba(10,14,26,0.85)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--border)", padding:"0 20px", height:56, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => onNav("dashboard")}>
        <span style={{ fontSize:18 }}>🌍</span>
        <span style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, letterSpacing:"-0.02em" }}>AfriLearn</span>
        {labels[screen] && <><span style={{ color:"var(--border2)", fontSize:16 }}>·</span><span style={{ fontSize:13, color:"var(--muted)" }}>{labels[screen]}</span></>}
      </div>
      <Chip color={user?.plan==="Premium"?"var(--green)":user?.plan==="Essentiel"?"var(--gold)":"var(--muted)"}>{user?.plan}</Chip>
    </div>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const NavBar = ({active, onNav}) => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:"rgba(10,14,26,0.95)", backdropFilter:"blur(20px)", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-around", padding:"8px 0 14px" }}>
    {[{id:"dashboard",icon:"⌂",label:"Accueil"},{id:"chapters",icon:"◫",label:"Cours"},{id:"tutor",icon:"◎",label:"Kodjo"},{id:"competition",icon:"◈",label:"Défi"},{id:"profile",icon:"○",label:"Profil"}].map(t=>(
      <button key={t.id} onClick={() => onNav(t.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 16px", fontFamily:"'DM Sans',sans-serif", minWidth:56 }}>
        <span style={{ fontSize:18, color:active===t.id?"var(--gold)":"var(--muted)", transition:"color 0.15s" }}>{t.icon}</span>
        <span style={{ fontSize:10, fontWeight:active===t.id?600:400, color:active===t.id?"var(--gold)":"var(--muted)", letterSpacing:"0.02em", transition:"color 0.15s" }}>{t.label}</span>
        {active===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:"var(--gold)" }}/>}
      </button>
    ))}
  </div>
);

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({user, onNav}) => {
  const tp = user.isPreview ? 48 : 0;
  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:800, margin:"0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:13, color:"var(--muted)", marginBottom:4, letterSpacing:"0.02em" }}>{user.level} · {user.country}</p>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>Bonjour, <span style={{ color:"var(--gold)" }}>{user.name.split(" ")[0]}</span> 👋</h2>
      </div>

      {/* Progress */}
      <Surface style={{ marginBottom:20, padding:24, background:"linear-gradient(135deg, var(--surface) 0%, rgba(232,168,56,0.06) 100%)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <p style={{ fontWeight:600, marginBottom:4 }}>Maths 6ème</p>
            <p style={{ fontSize:13, color:"var(--muted)" }}>Partie 1 complète — 8 chapitres disponibles</p>
          </div>
          <Chip>8 / 25</Chip>
        </div>
        <div style={{ background:"var(--surface2)", borderRadius:999, height:6, overflow:"hidden" }}>
          <div style={{ width:"32%", height:"100%", background:"linear-gradient(90deg, var(--gold), var(--green))", borderRadius:999, transition:"width 1s ease" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
          <span style={{ fontSize:12, color:"var(--muted)" }}>32% complété</span>
          <span style={{ fontSize:12, color:"var(--green)", fontWeight:600 }}>✓ Partie 1 terminée</span>
        </div>
      </Surface>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
        <Surface hover onClick={() => onNav("chapters")} style={{ padding:20 }}>
          <div style={{ fontSize:28, marginBottom:12 }}>📚</div>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Continuer</p>
          <p style={{ fontSize:12, color:"var(--muted)" }}>Reprendre les cours</p>
        </Surface>
        <Surface hover onClick={() => onNav("tutor")} style={{ padding:20 }}>
          <div style={{ fontSize:28, marginBottom:12 }}>🤖</div>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Kodjo</p>
          <p style={{ fontSize:12, color:"var(--muted)" }}>Tuteur IA en ligne</p>
        </Surface>
        <Surface hover onClick={() => onNav("competition")} style={{ padding:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:8, right:8 }}><Chip color="var(--green)" size="xs">Premium</Chip></div>
          <div style={{ fontSize:28, marginBottom:12 }}>🏆</div>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Compétition</p>
          <p style={{ fontSize:12, color:"var(--muted)" }}>Classement africain</p>
        </Surface>
        <Surface hover onClick={() => onNav("pricing")} style={{ padding:20 }}>
          <div style={{ fontSize:28, marginBottom:12 }}>💳</div>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>Abonnement</p>
          <p style={{ fontSize:12, color:"var(--muted)" }}>Plan {user.plan}</p>
        </Surface>
      </div>

      {/* Subjects */}
      <p style={{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Matières</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {SUBJECTS.map(s=>(
          <Surface key={s.id} hover={s.available} onClick={s.available?()=>onNav("chapters"):null} style={{ padding:14, textAlign:"center", opacity:s.available?1:0.45 }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
            <p style={{ fontSize:12, fontWeight:s.available?600:400 }}>{s.name}</p>
            {s.available && <p style={{ fontSize:10, color:"var(--green)", marginTop:4 }}>● Disponible</p>}
          </Surface>
        ))}
      </div>
      <Footer/>
    </div>
  );
};

// ─── CHAPTERS ────────────────────────────────────────────────────────────────
const Chapters = ({user, onChapter}) => {
  const [filter, setFilter] = useState(0);
  const filtered = filter===0 ? CHAPTERS : CHAPTERS.filter(c => c.part===filter);
  const tp = user.isPreview ? 48 : 0;

  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:800, margin:"0 auto" }}>
      <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, letterSpacing:"-0.02em", marginBottom:4 }}>Mathématiques <span style={{ color:"var(--gold)" }}>6ème</span></h2>
      <p style={{ color:"var(--muted)", fontSize:13, marginBottom:20 }}>25 chapitres · 5 parties</p>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24, overflowX:"auto", paddingBottom:4 }}>
        <Pill active={filter===0} onClick={() => setFilter(0)}>Tout voir</Pill>
        {PARTS.map(p => <Pill key={p.id} active={filter===p.id} color={p.color} onClick={() => setFilter(p.id)}>{p.icon} {p.name}</Pill>)}
      </div>

      {(filter===0 ? PARTS : PARTS.filter(p=>p.id===filter)).map(part => {
        const chs = filtered.filter(c => c.part===part.id);
        if (!chs.length) return null;
        return (
          <div key={part.id} style={{ marginBottom:28 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${part.color}18`, border:`1px solid ${part.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{part.icon}</div>
              <div>
                <p style={{ fontWeight:600, fontSize:14, color:part.color }}>{part.name}</p>
                {part.id===1 && <p style={{ fontSize:11, color:"var(--green)" }}>✓ Contenu complet disponible</p>}
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {chs.map(ch => {
                const locked = !user.isPreview && user.plan==="Gratuit" && ch.id>3;
                const hasContent = !!CHAPTERS_CONTENT[ch.id];
                return (
                  <div key={ch.id} onClick={() => !locked && onChapter(ch)} className={!locked?"card-hover":""} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, cursor:locked?"not-allowed":"pointer", opacity:locked?0.4:1 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:locked?"var(--surface2)":`${part.color}15`, border:`1px solid ${locked?"var(--border)":`${part.color}25`}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:locked?"var(--muted)":part.color, flexShrink:0 }}>
                      {locked ? "🔒" : ch.id}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:500, fontSize:14, marginBottom:2 }}>{ch.title}</p>
                      <p style={{ fontSize:12, color:"var(--muted)" }}>
                        {locked ? "Abonnement Essentiel requis" : hasContent ? "Cours · Exercices · Corrigés · Kodjo" : "Bientôt disponible"}
                      </p>
                    </div>
                    {locked ? <Chip>Essentiel</Chip> : hasContent ? <span style={{ color:"var(--muted)", fontSize:20 }}>›</span> : <Chip color="var(--muted)">Soon</Chip>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Footer/>
    </div>
  );
};

// ─── CHAPTER CONTENT ─────────────────────────────────────────────────────────
const ChapterContent = ({chapter, user, onBack, onTutor}) => {
  const [tab, setTab] = useState("cours");
  const [shown, setShown] = useState({});
  const content = CHAPTERS_CONTENT[chapter.id];
  const part = PARTS.find(p => p.id===chapter.part);
  const hasPremium = user.plan==="Premium" || user.isPreview;
  const tp = user.isPreview ? 48 : 0;

  if (!content) return (
    <div style={{ padding:`${24+tp}px 20px`, maxWidth:700, margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:13, marginBottom:16, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }}>← Retour</button>
      <Surface style={{ textAlign:"center", padding:48 }}>
        <p style={{ fontSize:40, marginBottom:16 }}>🚧</p>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Contenu en préparation</h3>
        <p style={{ color:"var(--muted)", fontSize:14 }}>Ce chapitre sera disponible très prochainement.</p>
        <div style={{ marginTop:20 }}><Chip color="var(--gold)">Partie 2 — Bientôt</Chip></div>
      </Surface>
    </div>
  );

  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:780, margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:13, marginBottom:20, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }}>← Tous les chapitres</button>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
        <div style={{ width:48, height:48, borderRadius:14, background:`${part.color}15`, border:`1px solid ${part.color}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{part.icon}</div>
        <div>
          <p style={{ fontSize:12, color:part.color, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:4 }}>{part.name} · Ch. {chapter.id}</p>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>{chapter.title}</h2>
        </div>
      </div>

      {/* Objectives */}
      <Surface style={{ marginBottom:20, padding:18, borderLeft:`3px solid ${part.color}` }}>
        <p style={{ fontSize:11, fontWeight:700, color:part.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Objectifs</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:6 }}>
          {content.objectives.map((o,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:13, color:"#94A3B8" }}>
              <span style={{ color:part.color, flexShrink:0, marginTop:1 }}>✓</span>{o}
            </div>
          ))}
        </div>
      </Surface>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
        {[["cours","📖 Cours"],["exercices","✏️ Exercices"],["corriges","✅ Corrigés"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} className="btn-hover" style={{ padding:"9px 18px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s", background:tab===id?part.color:"var(--surface)", color:tab===id?"#fff":"var(--muted)", border:tab===id?"none":"1px solid var(--border)" }}>
            {label} {id==="corriges"&&!hasPremium&&"🔒"}
          </button>
        ))}
        <button onClick={onTutor} className="btn-hover" style={{ padding:"9px 18px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", background:`rgba(232,168,56,0.1)`, color:"var(--gold)", border:"1px solid rgba(232,168,56,0.25)" }}>
          🤖 Kodjo
        </button>
      </div>

      {/* COURS */}
      {tab==="cours" && (
        <div className="fade">
          {content.cours.map((lecon, idx) => (
            <div key={lecon.id} style={{ marginBottom:32 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:part.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{idx+1}</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:600 }}>{lecon.titre}</h3>
              </div>
              <Surface style={{ marginBottom:14, padding:20, borderLeft:`2px solid ${part.color}40` }}>
                <pre style={{ whiteSpace:"pre-wrap", fontSize:13, lineHeight:2, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}>{lecon.contenu}</pre>
              </Surface>
              {lecon.exemples && (
                <>
                  <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Exemples résolus</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {lecon.exemples.map((ex, i) => (
                      <Surface key={i} style={{ padding:16, borderLeft:"2px solid var(--blue)" }}>
                        <p style={{ fontSize:13, color:"#93C5FD", marginBottom:8 }}>❓ {ex.question}</p>
                        <p style={{ fontSize:13, color:"var(--green)", fontWeight:500 }}>✓ {ex.reponse}</p>
                      </Surface>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EXERCICES */}
      {tab==="exercices" && (
        <div className="fade">
          <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16 }}>{content.exercices.length} exercices — 3 niveaux de difficulté</p>
          {["Facile","Moyen","Difficile"].map(niveau => {
            const exos = content.exercices.filter(e => e.niveau===niveau);
            if (!exos.length) return null;
            const colors = {Facile:"var(--green)", Moyen:"var(--gold)", Difficile:"var(--red)"};
            return (
              <div key={niveau} style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:colors[niveau] }}/>
                  <p style={{ fontSize:12, fontWeight:700, color:colors[niveau], textTransform:"uppercase", letterSpacing:"0.06em" }}>{niveau}</p>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {exos.map(ex => (
                    <Surface key={ex.id} style={{ padding:18 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14 }}>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:11, color:colors[ex.niveau], fontWeight:600, marginBottom:8 }}>Ex. {ex.id}</p>
                          <p style={{ fontSize:14, lineHeight:1.6 }}>{ex.enonce}</p>
                          {shown[ex.id] && (
                            <div style={{ marginTop:14, padding:"12px 16px", background:"rgba(62,201,139,0.08)", borderRadius:10, borderLeft:"2px solid var(--green)" }}>
                              <p style={{ fontSize:11, fontWeight:700, color:"var(--green)", marginBottom:6 }}>SOLUTION</p>
                              <p style={{ fontSize:13, color:"#6EE7B7", lineHeight:1.7 }}>{ex.solution}</p>
                            </div>
                          )}
                        </div>
                        <Btn onClick={() => setShown(p => ({...p,[ex.id]:!p[ex.id]}))} variant="outline" color={shown[ex.id]?"var(--muted)":"var(--gold)"} style={{ padding:"7px 14px", fontSize:12, flexShrink:0, borderRadius:8 }}>
                          {shown[ex.id]?"Masquer":"Solution"}
                        </Btn>
                      </div>
                    </Surface>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CORRIGÉS */}
      {tab==="corriges" && (
        <div className="fade">
          {!hasPremium ? (
            <Surface style={{ textAlign:"center", padding:48, borderColor:"rgba(62,201,139,0.2)" }}>
              <p style={{ fontSize:40, marginBottom:16 }}>🔒</p>
              <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Corrigés Premium</h3>
              <p style={{ color:"var(--muted)", fontSize:14, marginBottom:20 }}>Disponible avec le plan Premium à <strong style={{ color:"var(--green)" }}>2 995 FCFA/mois</strong>.</p>
              <Chip color="var(--green)" size="lg">Passer en Premium</Chip>
            </Surface>
          ) : (
            <>
              <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16 }}>Tous les corrigés détaillés</p>
              {content.exercices.map(ex => (
                <Surface key={ex.id} style={{ marginBottom:10, padding:18, borderLeft:"2px solid var(--green)" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:part.color }}>Ex. {ex.id}</p>
                    <Chip color={ex.niveau==="Difficile"?"var(--red)":ex.niveau==="Moyen"?"var(--gold)":"var(--green)"}>{ex.niveau}</Chip>
                  </div>
                  <p style={{ fontSize:13, color:"var(--muted)", marginBottom:10, fontStyle:"italic" }}>{ex.enonce}</p>
                  <div style={{ padding:"12px 16px", background:"rgba(62,201,139,0.08)", borderRadius:10 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:"var(--green)", marginBottom:6 }}>✅ CORRIGÉ</p>
                    <p style={{ fontSize:13, color:"#6EE7B7", lineHeight:1.7 }}>{ex.solution}</p>
                  </div>
                </Surface>
              ))}
            </>
          )}
        </div>
      )}
      <Footer/>
    </div>
  );
};

// ─── TUTOR ───────────────────────────────────────────────────────────────────
const Tutor = ({user, chapter}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);
  const topOff = user.isPreview ? 96 : 56;

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);
  useEffect(() => { if (messages.length===0) startChat(); }, []);

  const startChat = async () => {
    setLoading(true);
    const ctx = chapter ? `Le sujet : ${chapter.title} en Maths 6ème.` : "Aide l'élève sur n'importe quelle matière.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT+"\n\n"+ctx,messages:[{role:"user",content:"Bonjour Kodjo !"}]})});
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Bonjour ! Je suis Kodjo. Comment tu t'appelles ?";
      setHistory([{role:"user",content:"Bonjour Kodjo !"},{role:"assistant",content:reply}]);
      setMessages([{role:"assistant",content:reply}]);
    } catch { setMessages([{role:"assistant",content:"Bonjour ! Je suis Kodjo. Comment tu t'appelles ?"}]); }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim(); setInput("");
    const newMsgs = [...messages, {role:"user",content:text}];
    setMessages(newMsgs);
    const newHist = [...history, {role:"user",content:text}];
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:newHist})});
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Je n'ai pas bien compris.";
      setMessages([...newMsgs, {role:"assistant",content:reply}]);
      setHistory([...newHist, {role:"assistant",content:reply}]);
    } catch { setMessages([...newMsgs, {role:"assistant",content:"Oups ! Réessaie."}]); }
    setLoading(false);
  };

  return (
    <div className="fade" style={{ display:"flex", flexDirection:"column", height:`calc(100vh - ${topOff+64}px)`, maxWidth:700, margin:"0 auto", padding:"0 20px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 0 14px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ width:44, height:44, borderRadius:14, background:"linear-gradient(135deg, var(--gold), #D4800A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🦅</div>
        <div style={{ flex:1 }}>
          <p style={{ fontWeight:600, fontSize:15 }}>Kodjo</p>
          <p style={{ fontSize:12, color:loading?"var(--gold)":"var(--green)" }} className={loading?"pulse":""}>{loading?"Kodjo écrit...":"● En ligne"}</p>
        </div>
        {chapter && <Chip color="var(--muted)">{chapter.title}</Chip>}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 0", display:"flex", flexDirection:"column", gap:14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", gap:10, justifyContent:msg.role==="assistant"?"flex-start":"flex-end" }}>
            {msg.role==="assistant" && <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg, var(--gold), #D4800A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🦅</div>}
            <div style={{ maxWidth:"78%", padding:"12px 16px", fontSize:14, lineHeight:1.7, background:msg.role==="assistant"?"var(--surface)":"var(--gold)", borderRadius:msg.role==="assistant"?"4px 16px 16px 16px":"16px 4px 16px 16px", color:msg.role==="assistant"?"var(--text)":"#1A1200", border:msg.role==="assistant"?"1px solid var(--border)":"none", fontWeight:msg.role==="user"?500:400 }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg, var(--gold), #D4800A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🦅</div>
            <div style={{ padding:"12px 20px", background:"var(--surface)", borderRadius:"4px 16px 16px 16px", border:"1px solid var(--border)" }}>
              <span className="shimmer" style={{ display:"inline-block", width:64, height:14, borderRadius:7 }}/>
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:"12px 0 4px", borderTop:"1px solid var(--border)", display:"flex", gap:10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder="Pose ta question à Kodjo..." style={{...T.input, flex:1, padding:"12px 16px"}}/>
        <Btn onClick={send} disabled={loading||!input.trim()} color="var(--gold)" style={{ padding:"12px 18px", borderRadius:12, fontSize:16 }}>↗</Btn>
      </div>
    </div>
  );
};

// ─── COMPETITION ─────────────────────────────────────────────────────────────
const Competition = ({user}) => {
  const ok = user.plan==="Premium" || user.isPreview;
  const tp = user.isPreview ? 48 : 0;
  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:700, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>Classement · Afrique francophone</p>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>Compétition <span style={{ color:"var(--gold)" }}>africaine</span></h2>
      </div>
      {!ok ? (
        <Surface style={{ textAlign:"center", padding:48, borderColor:"rgba(62,201,139,0.25)" }}>
          <p style={{ fontSize:48, marginBottom:16 }}>🏆</p>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Fonctionnalité Premium</h3>
          <p style={{ color:"var(--muted)", fontSize:14, maxWidth:300, margin:"0 auto 24px" }}>Défie des élèves de toute l'Afrique francophone. Disponible à <strong style={{ color:"var(--green)" }}>2 995 FCFA/mois</strong>.</p>
          <Chip color="var(--green)" size="lg">Passer en Premium</Chip>
        </Surface>
      ) : (<>
        <Surface style={{ marginBottom:16, padding:20, background:"linear-gradient(135deg, rgba(62,201,139,0.08), rgba(74,158,245,0.05))", borderColor:"rgba(62,201,139,0.2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><div style={{ width:8, height:8, borderRadius:"50%", background:"#F56565", animation:"pulse 1s infinite" }}/><span style={{ fontSize:12, fontWeight:600, color:"#F56565" }}>EN DIRECT</span></div>
              <p style={{ fontWeight:600, fontSize:16, marginBottom:4 }}>Défi Maths — Fractions</p>
              <p style={{ fontSize:13, color:"var(--muted)" }}>247 élèves · 2h restantes</p>
            </div>
            <Btn color="var(--green)" style={{ padding:"10px 20px" }}>Participer</Btn>
          </div>
        </Surface>
        <p style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Classement de la semaine</p>
        <Surface style={{ padding:0, overflow:"hidden" }}>
          {LEADERBOARD.map((p, i) => (
            <div key={p.rank} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px", borderBottom:i<LEADERBOARD.length-1?"1px solid var(--border)":"none", background:p.rank<=3?"rgba(232,168,56,0.04)":"transparent" }}>
              <span style={{ fontSize:20, width:28, textAlign:"center", flexShrink:0 }}>{p.badge}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:500 }}>{p.name} <span>{p.country}</span></p>
              </div>
              <p style={{ fontFamily:"'Fraunces',serif", fontWeight:700, color:"var(--gold)" }}>{p.score.toLocaleString()}</p>
            </div>
          ))}
        </Surface>
        <Surface style={{ marginTop:14, textAlign:"center", padding:20 }}>
          <p style={{ color:"var(--muted)", fontSize:12, marginBottom:6 }}>Ton classement</p>
          <p style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, color:"var(--blue)" }}>#1 284</p>
          <p style={{ color:"var(--muted)", fontSize:12, marginTop:4 }}>sur 18 432 élèves</p>
        </Surface>
      </>)}
      <Footer/>
    </div>
  );
};

// ─── PRICING ─────────────────────────────────────────────────────────────────
const Pricing = ({user, onUpgrade}) => {
  const tp = user.isPreview ? 48 : 0;
  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:800, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>Simple et transparent</p>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>Choisir un plan</h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:32 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ background:"var(--surface)", border:`1px solid ${plan.popular?"rgba(62,201,139,0.4)":"var(--border)"}`, borderRadius:20, padding:24, position:"relative" }}>
            {plan.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"var(--green)", color:"#fff", borderRadius:999, padding:"4px 14px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>Recommandé</div>}
            <p style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{plan.name}</p>
            <div style={{ marginBottom:20 }}>
              <span style={{ fontFamily:"'Fraunces',serif", fontSize:32, fontWeight:700, color:plan.color }}>{plan.price===0?"Gratuit":plan.price.toLocaleString()}</span>
              {plan.price>0 && <span style={{ fontSize:13, color:"var(--muted)", marginLeft:6 }}>FCFA/mois</span>}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
              {plan.features.map(f => <div key={f} style={{ display:"flex", gap:8, fontSize:13, color:"#94A3B8" }}><span style={{ color:plan.color, flexShrink:0 }}>✓</span>{f}</div>)}
            </div>
            <Btn onClick={() => onUpgrade && onUpgrade(plan.id)} disabled={user.plan===plan.name} color={plan.color} style={{ width:"100%", padding:"12px", fontSize:14, borderRadius:12 }}>
              {user.plan===plan.name ? "✓ Plan actuel" : plan.cta}
            </Btn>
          </div>
        ))}
      </div>
      <Surface style={{ padding:22 }}>
        <p style={{ fontWeight:600, marginBottom:14 }}>💳 Paiements — Powered by CinetPay</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8 }}>
          {[["🇬🇦","Gabon","Airtel · Moov"],["🇨🇲","Cameroun","MTN · Orange"],["🇨🇮","Côte d'Ivoire","MTN · Wave"],["🇸🇳","Sénégal","Orange · Wave"],["🇨🇩","RDC","M-Pesa · Airtel"],["🌍","Tous","Visa · Mastercard"]].map(([f,c,m]) => (
            <div key={c} style={{ padding:"10px 12px", background:"var(--surface2)", borderRadius:10 }}>
              <p style={{ fontSize:14, marginBottom:4 }}>{f} <span style={{ fontSize:12, fontWeight:600 }}>{c}</span></p>
              <p style={{ fontSize:11, color:"var(--muted)" }}>{m}</p>
            </div>
          ))}
        </div>
      </Surface>
      <Footer/>
    </div>
  );
};

// ─── PROFILE ─────────────────────────────────────────────────────────────────
const Profile = ({user, onLogout}) => {
  const tp = user.isPreview ? 48 : 0;
  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:480, margin:"0 auto" }}>
      {/* Avatar */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ width:80, height:80, borderRadius:24, background:"linear-gradient(135deg, var(--gold), var(--green))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 14px", fontFamily:"'Fraunces',serif", fontWeight:700, color:"#fff" }}>
          {user.name[0].toUpperCase()}
        </div>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:4 }}>{user.name}</h2>
        <p style={{ color:"var(--muted)", fontSize:13, marginBottom:10 }}>{user.email}</p>
        <Chip color="var(--gold)">{user.plan}</Chip>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:20 }}>
        {[{label:"Chapitres",value:"8/25"},{label:"Points",value:"2 340"},{label:"Rang",value:"#1 284"}].map(s=>(
          <Surface key={s.label} style={{ textAlign:"center", padding:16 }}>
            <p style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:"var(--gold)" }}>{s.value}</p>
            <p style={{ fontSize:11, color:"var(--muted)", marginTop:4, textTransform:"uppercase", letterSpacing:"0.04em" }}>{s.label}</p>
          </Surface>
        ))}
      </div>

      {/* Info */}
      <Surface style={{ marginBottom:20, padding:0, overflow:"hidden" }}>
        {[["🌍 Pays",user.country],["🎓 Niveau",user.level],["📅 Membre depuis","Avril 2026"],["💳 Abonnement",user.plan]].map(([l,v],i,arr)=>(
          <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:i<arr.length-1?"1px solid var(--border)":"none" }}>
            <span style={{ fontSize:13, color:"var(--muted)" }}>{l}</span>
            <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </Surface>

      {!user.isPreview && <Btn onClick={onLogout} variant="outline" color="var(--red)" style={{ width:"100%", padding:"13px" }}>Se déconnecter</Btn>}
      <Footer/>
    </div>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleAuth = (form) => {
    setUser(form);
    if (form.role==="superadmin" || form.role==="admin") { setScreen("admin"); return; }
    setScreen("dashboard");
  };

  const nav = (s) => { setChapter(null); setScreen(s); };
  const openChapter = (ch) => { setChapter(ch); setScreen("chapterContent"); };
  const upgrade = (id) => { const n={free:"Gratuit",essential:"Essentiel",premium:"Premium"}; setUser(u=>({...u,plan:n[id]})); };

  const previewUser = user ? {...user, name:"Super Admin", plan:"Premium", level:"6ème", country:"Gabon", isPreview:true} : null;
  const activeUser = isPreview ? previewUser : user;

  return (
    <>
      <style>{css}</style>
      {screen==="landing" && <Landing onEnter={s=>setScreen(s)}/>}
      {screen==="login" && <Auth mode="login" onAuth={handleAuth} onSwitch={()=>setScreen("register")}/>}
      {screen==="register" && <Auth mode="register" onAuth={handleAuth} onSwitch={()=>setScreen("login")}/>}
      {screen==="admin" && !isPreview && user && <SuperAdmin user={user} onLogout={()=>{setUser(null);setScreen("landing");}} onPreview={()=>{setIsPreview(true);setScreen("dashboard");}}/>}

      {activeUser && !["landing","login","register","admin"].includes(screen) && (
        <div style={{ paddingBottom:80 }}>
          {isPreview && <AdminBar onBack={()=>{setIsPreview(false);setScreen("admin");}}/>}
          <TopBar user={activeUser} screen={screen} onNav={nav}/>
          {screen==="dashboard"      && <Dashboard      user={activeUser} onNav={nav}/>}
          {screen==="chapters"       && <Chapters       user={activeUser} onChapter={openChapter}/>}
          {screen==="chapterContent" && chapter && <ChapterContent chapter={chapter} user={activeUser} onBack={()=>setScreen("chapters")} onTutor={()=>setScreen("tutor")}/>}
          {screen==="tutor"          && <Tutor          user={activeUser} chapter={chapter}/>}
          {screen==="competition"    && <Competition    user={activeUser}/>}
          {screen==="pricing"        && <Pricing        user={activeUser} onUpgrade={!isPreview?upgrade:null}/>}
          {screen==="profile"        && <Profile        user={activeUser} onLogout={!isPreview?()=>{setUser(null);setScreen("landing");}:null}/>}
          <NavBar active={screen} onNav={nav}/>
        </div>
      )}
    </>
  );
}
