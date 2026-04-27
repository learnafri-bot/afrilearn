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

🌍 La population de Libreville est environ 703 000 habitants.
On lit : sept cent trois mille habitants.`,
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
Distance Libreville–Oyem = 476 km
856 > 476 donc Franceville est plus loin.`,
        exemples:[
          {question:"Compare 12 450 et 9 876", reponse:"12 450 > 9 876 (5 chiffres > 4 chiffres)"},
          {question:"Ordre croissant : 3 210 ; 3 021 ; 3 201 ; 3 120", reponse:"3 021 < 3 120 < 3 201 < 3 210"},
        ]
      },
      { id:"1-3", titre:"Encadrer et arrondir un entier",
        contenu:`ENCADRER = trouver deux nombres entre lesquels il se situe.
347 à la dizaine : 340 < 347 < 350
347 à la centaine : 300 < 347 < 400

ARRONDIR = remplacer par une valeur approchée.
• Chiffre suivant 0,1,2,3,4 → arrondi INFÉRIEUR
• Chiffre suivant 5,6,7,8,9 → arrondi SUPÉRIEUR

EXEMPLES :
• 347 à la dizaine : unités=7 ≥ 5 → 350
• 342 à la dizaine : unités=2 < 5 → 340
• 3 472 à la centaine : dizaines=7 ≥ 5 → 3 500

🌍 Une vendeuse a vendu pour 4 738 FCFA de bananes.
Arrondi à la centaine : 4 700 FCFA (3 < 5)
Arrondi au millier : 5 000 FCFA (7 ≥ 5)`,
        exemples:[
          {question:"Arrondir 6 853 à la centaine", reponse:"6 900 (dizaines=5 ≥ 5)"},
          {question:"Encadrer 4 567 entre deux centaines", reponse:"4 500 < 4 567 < 4 600"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Écrire en chiffres : deux millions quatre cent mille six.", solution:"2 400 006"},
      {id:2, niveau:"⭐ Facile",       enonce:"Lire en lettres le nombre 350 040.", solution:"trois cent cinquante mille quarante"},
      {id:3, niveau:"⭐ Facile",       enonce:"Quel est le chiffre des milliers dans 743 825 ?", solution:"3 (le chiffre 3 est en position des milliers)"},
      {id:4, niveau:"⭐ Facile",       enonce:"Écrire le plus grand nombre possible avec les chiffres 3, 7, 1, 5.", solution:"7 531"},
      {id:5, niveau:"⭐ Facile",       enonce:"Compare avec < ou > : 8 500 __ 8 050", solution:"8 500 > 8 050"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Range dans l'ordre décroissant : 12 300 ; 12 030 ; 12 003 ; 12 330", solution:"12 330 > 12 300 > 12 030 > 12 003"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Arrondir 7 348 à la centaine.", solution:"7 300 (dizaines=4 < 5)"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Encadrer 45 673 entre deux milliers consécutifs.", solution:"45 000 < 45 673 < 46 000"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"La distance Libreville-Brazzaville est 1 847 km. Arrondir à la centaine.", solution:"1 800 km (dizaines=4 < 5)"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Trouver tous les entiers dont l'arrondi à la dizaine est 80.", solution:"75, 76, 77, 78, 79, 80, 81, 82, 83, 84"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Un commerçant vend 1 234 sacs de riz à 15 000 FCFA. Chiffre d'affaires ? Arrondir au million.", solution:"1 234 × 15 000 = 18 510 000 FCFA → arrondi : 19 000 000 FCFA"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Trouver un nombre de 6 chiffres dont le chiffre des dizaines de milliers est 4 et la somme des chiffres est 10.", solution:"Exemple : 400 006 → 4+0+0+0+0+6=10 ✓"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Entre 3 500 000 et 4 000 000, combien y a-t-il de multiples de 100 000 ?", solution:"5 : 3 600 000 ; 3 700 000 ; 3 800 000 ; 3 900 000 ; 4 000 000"},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Koffi a 3 billets de 10 000 FCFA, 5 billets de 5 000 FCFA et 7 pièces de 500 FCFA. Total ? Arrondir au millier.", solution:"30 000+25 000+3 500 = 58 500 FCFA → arrondi : 59 000 FCFA"},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"Le stade d'Angondjé accueille 40 000 personnes. 37 846 présentes. Places vides ? Arrondir à la centaine.", solution:"40 000 − 37 846 = 2 154 places → arrondi : 2 200 places"},
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
• 3 → partie entière
• 8 → 8 dixièmes
• 4 → 4 centièmes
• 7 → 7 millièmes
Donc : 3,847 = 3 + 0,8 + 0,04 + 0,007

🌍 Le prix du litre d'huile de palme est 1 250,50 FCFA.
Partie entière : 1 250 — Partie décimale : 50 centièmes.`,
        exemples:[
          {question:"Valeur du chiffre 6 dans 14,263 ?", reponse:"6 centièmes (0,06)"},
          {question:"Écrire 5 + 0,3 + 0,07 sous forme décimale", reponse:"5,37"},
          {question:"Décomposer 8,504", reponse:"8 + 0,5 + 0,004"},
        ]
      },
      { id:"2-2", titre:"Comparer et ordonner les décimaux",
        contenu:`Pour COMPARER deux décimaux :
1. On compare les PARTIES ENTIÈRES
2. Si égales → on compare les DIXIÈMES
3. Si égaux → on compare les CENTIÈMES...

ASTUCE : 3,5 = 3,50 = 3,500 (zéros à droite = même valeur)

EXEMPLES :
• 4,7 > 3,9 (entières : 4 > 3)
• 2,35 < 2,4 (entières égales ; dixièmes : 3 < 4)
• 0,8 > 0,75 (dixièmes : 8 > 7)

🌍 Kilo de riz : 850,75 FCFA
Kilo de farine : 850,50 FCFA
850,75 > 850,50 → le riz est plus cher.`,
        exemples:[
          {question:"Compare 3,07 et 3,7", reponse:"3,07 < 3,7 (dixièmes : 0 < 7)"},
          {question:"Ordre croissant : 2,5 ; 2,15 ; 2,51 ; 2,05", reponse:"2,05 < 2,15 < 2,5 < 2,51"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Écrire en chiffres : quatre virgule cinquante-deux.", solution:"4,52"},
      {id:2, niveau:"⭐ Facile",       enonce:"Valeur du chiffre 3 dans 15,038 ?", solution:"3 centièmes (0,03)"},
      {id:3, niveau:"⭐ Facile",       enonce:"Décomposer 7,34 en unités, dixièmes et centièmes.", solution:"7 + 0,3 + 0,04"},
      {id:4, niveau:"⭐ Facile",       enonce:"Est-ce que 4,50 = 4,5 ? Justifier.", solution:"Oui, les zéros à droite ne changent pas la valeur."},
      {id:5, niveau:"⭐ Facile",       enonce:"Compare : 0,9 __ 0,90", solution:"0,9 = 0,90"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Ordre décroissant : 3,14 ; 3,41 ; 3,04 ; 3,4", solution:"3,41 > 3,4 > 3,14 > 3,04"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Trouver un décimal entre 2,3 et 2,4.", solution:"Exemple : 2,35"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Pain : 250,50 FCFA. Lait : 250,05 FCFA. Lequel est plus cher ?", solution:"250,50 > 250,05 → le pain est plus cher."},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"Écrire sous forme décimale : 8 + 4/10 + 7/100", solution:"8,47"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Combien de centièmes y a-t-il dans 3,75 ?", solution:"375 centièmes"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Aminata mesure 1,53 m, Jean 1,48 m, Kofi 1,5 m. Du plus grand au plus petit.", solution:"Aminata (1,53) > Kofi (1,5) > Jean (1,48)"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Tous les décimaux à 1 décimale entre 4 et 5.", solution:"4,1 ; 4,2 ; 4,3 ; 4,4 ; 4,5 ; 4,6 ; 4,7 ; 4,8 ; 4,9"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Un élève dit que 0,3 > 0,25 car 25 > 3. A-t-il raison ?", solution:"Non. 0,3 = 0,30 > 0,25. Il faut comparer chiffre par chiffre après la virgule."},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Marathon : 2h15,4min ; 2h15,04min ; 2h14,9min. Qui a gagné ?", solution:"2h14,9min < 2h15,04min < 2h15,4min → le 3e coureur a gagné."},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"Plus grand et plus petit décimal à 2 décimales, partie entière 6, somme des décimales = 7.", solution:"Plus grand : 6,70 — Plus petit : 6,07"},
    ],
  },
  3: {
    id:3, title:"Arrondir les nombres", duration:"2 semaines",
    objectives:["Arrondir un décimal à l'unité, au dixième, au centième","Encadrer un décimal","Utiliser les arrondis dans des situations concrètes"],
    cours:[
      { id:"3-1", titre:"Arrondir un nombre décimal",
        contenu:`ARRONDIR = donner une valeur approchée.

RÈGLE :
• On repère le rang jusqu'auquel on arrondit
• On regarde le chiffre JUSTE APRÈS
• 0,1,2,3,4 → arrondi INFÉRIEUR
• 5,6,7,8,9 → arrondi SUPÉRIEUR

À L'UNITÉ :
• 3,7 → dixième=7 ≥ 5 → 4
• 3,2 → dixième=2 < 5 → 3

AU DIXIÈME :
• 3,47 → centième=7 ≥ 5 → 3,5
• 3,42 → centième=2 < 5 → 3,4

AU CENTIÈME :
• 2,346 → millième=6 ≥ 5 → 2,35
• 2,343 → millième=3 < 5 → 2,34

🌍 Carburant à 680,45 FCFA le litre.
À l'unité : 680 FCFA
À la dizaine : 680 FCFA (0 < 5)`,
        exemples:[
          {question:"Arrondir 7,38 au dixième", reponse:"7,4 (centième=8 ≥ 5)"},
          {question:"Arrondir 15,245 au centième", reponse:"15,25 (millième=5 ≥ 5)"},
          {question:"Arrondir 9,951 à l'unité", reponse:"10 (dixième=9 ≥ 5)"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Arrondir 4,7 à l'unité.", solution:"5 (7 ≥ 5)"},
      {id:2, niveau:"⭐ Facile",       enonce:"Arrondir 3,42 à l'unité.", solution:"3 (4 < 5)"},
      {id:3, niveau:"⭐ Facile",       enonce:"Arrondir 6,38 au dixième.", solution:"6,4 (8 ≥ 5)"},
      {id:4, niveau:"⭐ Facile",       enonce:"Arrondir 2,53 au dixième.", solution:"2,5 (3 < 5)"},
      {id:5, niveau:"⭐ Facile",       enonce:"Encadrer 3,7 entre deux entiers consécutifs.", solution:"3 < 3,7 < 4"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Arrondir 14,356 au centième.", solution:"14,36 (6 ≥ 5)"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Arrondir 8,999 au dixième.", solution:"9,0 (9 ≥ 5)"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Encadrer 5,47 entre deux dixièmes.", solution:"5,4 < 5,47 < 5,5"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"Un tronc mesure 3,475 m. Longueur arrondie au dixième.", solution:"3,5 m (7 ≥ 5)"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Kilo de manioc : 357,6 FCFA. Arrondir à l'unité.", solution:"358 FCFA (6 ≥ 5)"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Trouver un nombre dont l'arrondi à l'unité est 5 et au dixième est 4,8.", solution:"Exemple : 4,82"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Périmètre 125,48 m. Arrondir au dixième puis à l'unité. Résultats identiques ?", solution:"Au dixième : 125,5 m. À l'unité : 125 m. Non, différents."},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"100 FCFA divisés en 3 parts égales. Résultat arrondi au centième. Problème ?", solution:"100 ÷ 3 = 33,33 FCFA. Problème : 3 × 33,33 = 99,99 FCFA, il manque 0,01 FCFA."},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"100 m en 11,47 s. Record d'Afrique : 11,5 s. Bat-il le record ?", solution:"11,47 < 11,5 → oui, il bat le record."},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"3 nombres différents dont l'arrondi à l'unité est 7 et la somme est 21.", solution:"Exemple : 6,8 + 7,1 + 7,1 = 21 (arrondis : 7+7+7 ✓)"},
    ],
  },
  4: {
    id:4, title:"Addition et soustraction", duration:"3 semaines",
    objectives:["Additionner et soustraire des entiers et des décimaux","Poser les opérations en colonnes","Vérifier par estimation","Résoudre des problèmes"],
    cours:[
      { id:"4-1", titre:"Addition de décimaux",
        contenu:`Pour ADDITIONNER des décimaux :
1. Aligner les VIRGULES les unes sous les autres
2. Compléter avec des zéros si nécessaire
3. Additionner colonne par colonne, de droite à gauche
4. Placer la virgule dans le résultat

EXEMPLE : 12,5 + 3,47
    12,50
  +  3,47
  ──────
    15,97

VÉRIFICATION : 12,5 ≈ 13 et 3,47 ≈ 3 → 16 ≈ 15,97 ✓

🌍 Maman achète du poisson à 2 500,50 FCFA
et des légumes à 750,25 FCFA.
Total = 2 500,50 + 750,25 = 3 250,75 FCFA`,
        exemples:[
          {question:"Calculer 45,3 + 8,75", reponse:"45,30 + 8,75 = 54,05"},
          {question:"Calculer 100 + 3,05 + 0,8", reponse:"103,85"},
        ]
      },
      { id:"4-2", titre:"Soustraction de décimaux",
        contenu:`Pour SOUSTRAIRE des décimaux :
1. Aligner les VIRGULES
2. Compléter avec des zéros
3. Soustraire de droite à gauche (avec retenues)
4. Placer la virgule

EXEMPLE : 15,3 − 7,48
    15,30
  −  7,48
  ──────
     7,82

VÉRIFICATION : 7,82 + 7,48 = 15,30 ✓

🌍 Papa a 10 000 FCFA. Il achète du pain à 1 250,75 FCFA.
Il lui reste : 10 000 − 1 250,75 = 8 749,25 FCFA`,
        exemples:[
          {question:"Calculer 20 − 3,75", reponse:"16,25"},
          {question:"Calculer 8,4 − 2,85", reponse:"5,55"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Calculer : 345 + 278", solution:"623"},
      {id:2, niveau:"⭐ Facile",       enonce:"Calculer : 1 000 − 437", solution:"563"},
      {id:3, niveau:"⭐ Facile",       enonce:"Calculer : 3,5 + 2,8", solution:"6,3"},
      {id:4, niveau:"⭐ Facile",       enonce:"Calculer : 7,4 − 3,2", solution:"4,2"},
      {id:5, niveau:"⭐ Facile",       enonce:"Calculer : 12,5 + 0,75", solution:"13,25"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 100 − 34,75", solution:"65,25"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 8,07 + 3,9 + 0,003", solution:"11,973"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 15,4 − 7,85", solution:"7,55"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"Aminata a 5 000 FCFA. Elle achète un cahier à 350,50 FCFA et un stylo à 125 FCFA. Reste ?", solution:"5 000 − 475,50 = 4 524,50 FCFA"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Le Nil : 6 650 km, le Congo : 4 700 km. Différence ?", solution:"1 950 km"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Trouver x si : x + 3,75 = 10,2", solution:"x = 6,45"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"La somme de deux nombres est 15,8. L'un est 7,35. L'autre ?", solution:"8,45"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Jean : 12,5 km matin + 8,75 km après-midi. Kofi : 23 km. Qui a parcouru le plus ? De combien ?", solution:"Jean : 21,25 km. Kofi : 23 km. Kofi de 1,75 km de plus."},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Famille : loyer 150 000 + nourriture 85 500,50 + transport 25 750,25 FCFA. Revenu : 300 000 FCFA. Reste ?", solution:"Dépenses : 261 250,75 FCFA. Reste : 38 749,25 FCFA"},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"Deux nombres : somme = 8,5, différence = 1,3. Trouver les deux nombres.", solution:"a = 4,9 et b = 3,6"},
    ],
  },
  5: {
    id:5, title:"Multiplication", duration:"3 semaines",
    objectives:["Multiplier des entiers et des décimaux","Multiplier par 10, 100, 1 000","Résoudre des problèmes multiplicatifs"],
    cours:[
      { id:"5-1", titre:"Multiplication de décimaux",
        contenu:`Pour MULTIPLIER des décimaux :
1. Oublier les virgules et multiplier comme des entiers
2. Compter le TOTAL de chiffres après les virgules
3. Placer la virgule dans le résultat

EXEMPLE : 3,4 × 2,5
• 34 × 25 = 850
• Décimales : 1 + 1 = 2
• Résultat : 8,50 = 8,5

MULTIPLIER PAR 10, 100, 1 000 :
• × 10 → décaler la virgule d'1 rang à droite
• × 100 → décaler de 2 rangs à droite
• × 1 000 → décaler de 3 rangs à droite

EXEMPLES :
• 3,45 × 10 = 34,5
• 3,45 × 100 = 345
• 3,45 × 1 000 = 3 450

🌍 Taxi à Libreville : 1 500,50 FCFA par trajet.
Pour 3 trajets : 1 500,50 × 3 = 4 501,50 FCFA`,
        exemples:[
          {question:"Calculer 2,5 × 4", reponse:"10"},
          {question:"Calculer 0,6 × 0,7", reponse:"0,42"},
          {question:"Calculer 4,37 × 100", reponse:"437"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Calculer : 6 × 7", solution:"42"},
      {id:2, niveau:"⭐ Facile",       enonce:"Calculer : 3,5 × 10", solution:"35"},
      {id:3, niveau:"⭐ Facile",       enonce:"Calculer : 4,2 × 100", solution:"420"},
      {id:4, niveau:"⭐ Facile",       enonce:"Calculer : 2,5 × 4", solution:"10"},
      {id:5, niveau:"⭐ Facile",       enonce:"Calculer : 0,3 × 1 000", solution:"300"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 3,4 × 2,5", solution:"8,5"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 0,6 × 0,8", solution:"0,48"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 1,25 × 4", solution:"5"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"Sac de riz : 8 500 FCFA. 4 sacs ?", solution:"34 000 FCFA"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Litre d'eau : 0,75 FCFA. 12 litres ?", solution:"9 FCFA"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Calculer : 2,35 × 1,4", solution:"3,29"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Voiture : 8,5 L/100 km. Consommation pour 350 km ?", solution:"29,75 litres"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Trouver x si : 3,5 × x = 17,5", solution:"x = 5"},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Parcelle : 12,5 m × 8,4 m. Calculer l'aire.", solution:"105 m²"},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"Jean économise 2 500,50 FCFA/semaine. Total en 52 semaines ?", solution:"130 026 FCFA"},
    ],
  },
  6: {
    id:6, title:"Division", duration:"3 semaines",
    objectives:["Comprendre la division euclidienne","Diviser des décimaux","Diviser par 10, 100, 1 000"],
    cours:[
      { id:"6-1", titre:"Division euclidienne",
        contenu:`La DIVISION EUCLIDIENNE donne un quotient entier et un reste.

VOCABULAIRE :
DIVIDENDE ÷ DIVISEUR = QUOTIENT reste RESTE
RELATION : dividende = diviseur × quotient + reste
CONDITION : 0 ≤ reste < diviseur

EXEMPLE : 47 ÷ 5
• 5 × 9 = 45 (le plus proche sans dépasser)
• Quotient = 9, reste = 47 − 45 = 2
• Vérification : 5 × 9 + 2 = 47 ✓

🌍 On répartit 47 mangues en sachets de 5.
47 = 5 × 9 + 2 → 9 sachets et 2 mangues restantes.`,
        exemples:[
          {question:"Division euclidienne de 83 par 7", reponse:"83 = 7 × 11 + 6"},
          {question:"Vérifier : 156 = 12 × 13 + 0", reponse:"12 × 13 = 156 ✓. 156 est divisible par 12."},
        ]
      },
      { id:"6-2", titre:"Division décimale et par 10, 100, 1000",
        contenu:`DIVISION DÉCIMALE : quand le dividende n'est pas divisible exactement.

EXEMPLE : 7 ÷ 4
• 7 = 4 × 1 + 3 → on continue avec les décimales
• 30 ÷ 4 = 7 reste 2
• 20 ÷ 4 = 5 reste 0
• Résultat : 7 ÷ 4 = 1,75

DIVISER PAR 10, 100, 1 000 :
• ÷ 10 → décaler la virgule d'1 rang à GAUCHE
• ÷ 100 → décaler de 2 rangs à GAUCHE
• ÷ 1 000 → décaler de 3 rangs à GAUCHE

EXEMPLES :
• 345 ÷ 10 = 34,5
• 345 ÷ 100 = 3,45
• 345 ÷ 1 000 = 0,345

🌍 On partage 1 500 FCFA entre 4 amis :
1 500 ÷ 4 = 375 FCFA chacun.`,
        exemples:[
          {question:"Calculer 45 ÷ 100", reponse:"0,45"},
          {question:"Calculer 9 ÷ 4", reponse:"2,25"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Division euclidienne : 35 ÷ 6", solution:"35 = 6 × 5 + 5"},
      {id:2, niveau:"⭐ Facile",       enonce:"Division euclidienne : 48 ÷ 8", solution:"48 = 8 × 6 + 0. Divisible par 8."},
      {id:3, niveau:"⭐ Facile",       enonce:"Calculer : 730 ÷ 10", solution:"73"},
      {id:4, niveau:"⭐ Facile",       enonce:"Calculer : 450 ÷ 100", solution:"4,5"},
      {id:5, niveau:"⭐ Facile",       enonce:"Calculer : 8 ÷ 2", solution:"4"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 7 ÷ 4", solution:"1,75"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 15 ÷ 8", solution:"1,875"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 3 600 ÷ 1 000", solution:"3,6"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"250 FCFA partagés entre 4 enfants. Chacun reçoit ?", solution:"62,5 FCFA"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Sac de 25 kg de riz en portions de 0,5 kg. Combien de portions ?", solution:"50 portions"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Calculer 17,5 ÷ 2,5", solution:"7"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Camion : 450 km avec 50 L. Consommation aux 100 km ?", solution:"≈ 11,11 L/100 km"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Plus grand entier n tel que 7n ≤ 100.", solution:"n = 14 (7×14=98 ≤ 100)"},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Division de a par 9 : quotient 12, reste 5. Trouver a.", solution:"a = 9 × 12 + 5 = 113"},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"3 familles partagent 4 500 000 FCFA. La 1re reçoit le double de la 2e, la 3e autant que la 2e. Parts ?", solution:"F1 : 2 250 000 — F2 et F3 : 1 125 000 FCFA chacune"},
    ],
  },
  7: {
    id:7, title:"Priorités opératoires", duration:"2 semaines",
    objectives:["Connaître les règles de priorité","Utiliser les parenthèses","Calculer des expressions avec plusieurs opérations"],
    cours:[
      { id:"7-1", titre:"Règles de priorité",
        contenu:`Quand une expression contient PLUSIEURS OPÉRATIONS :

ORDRE DE PRIORITÉ :
1. Ce qui est entre PARENTHÈSES (en premier)
2. MULTIPLICATIONS et DIVISIONS (de gauche à droite)
3. ADDITIONS et SOUSTRACTIONS (de gauche à droite)

EXEMPLES :
• 3 + 4 × 2 = 3 + 8 = 11 (× avant +)
• (3 + 4) × 2 = 7 × 2 = 14 (parenthèses d'abord)
• 20 − 4 × 3 + 2 = 20 − 12 + 2 = 10
• 15 ÷ 3 + 4 × 2 = 5 + 8 = 13

⚠️ ERREUR FRÉQUENTE :
3 + 4 × 2 ≠ 7 × 2 = 14 ✗ (FAUX !)

🌍 Maman achète 3 sachets de beignets à 500 FCFA.
Monnaie rendue sur 2 000 FCFA :
2 000 − 3 × 500 = 2 000 − 1 500 = 500 FCFA`,
        exemples:[
          {question:"Calculer : 5 + 3 × 4", reponse:"5 + 12 = 17"},
          {question:"Calculer : (5 + 3) × 4", reponse:"8 × 4 = 32"},
          {question:"Calculer : 24 ÷ 4 + 2 × 3", reponse:"6 + 6 = 12"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Calculer : 2 + 3 × 5", solution:"17"},
      {id:2, niveau:"⭐ Facile",       enonce:"Calculer : (2 + 3) × 5", solution:"25"},
      {id:3, niveau:"⭐ Facile",       enonce:"Calculer : 10 − 4 ÷ 2", solution:"8"},
      {id:4, niveau:"⭐ Facile",       enonce:"Calculer : 12 ÷ 4 × 3", solution:"9"},
      {id:5, niveau:"⭐ Facile",       enonce:"Calculer : 8 + 2 × 0", solution:"8"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 3 × (4 + 5) − 2", solution:"25"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 20 − (3 + 2) × 3", solution:"5"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Calculer : 2,5 × 4 + 3 × 1,5", solution:"14,5"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"Placer des parenthèses pour que (3 + 4) × 2 − 1 = 13", solution:"(3 + 4) × 2 − 1 = 14 − 1 = 13 ✓"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"4 cahiers à 350 FCFA + 2 stylos à 125 FCFA. Total ?", solution:"4 × 350 + 2 × 125 = 1 650 FCFA"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Calculer : 4 × (3 + 2)²", solution:"4 × 25 = 100"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Calculer : (12 + 3 × 4) ÷ (2 × 4 − 2)", solution:"24 ÷ 6 = 4"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Sans calculatrice : 99 × 37 + 37", solution:"37 × (99 + 1) = 37 × 100 = 3 700"},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Marchand : achète 50 ananas à 200 FCFA, vend 45 à 350 FCFA. Bénéfice ?", solution:"Coût : 10 000. Recette : 15 750. Bénéfice : 5 750 FCFA"},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"Calculer intelligemment : 25 × 48 × 4", solution:"25 × 4 × 48 = 100 × 48 = 4 800"},
    ],
  },
  8: {
    id:8, title:"Fractions", duration:"4 semaines",
    objectives:["Comprendre la notion de fraction","Trouver des fractions égales","Comparer des fractions","Additionner et soustraire des fractions","Convertir fractions et décimaux"],
    cours:[
      { id:"8-1", titre:"Qu'est-ce qu'une fraction ?",
        contenu:`Une FRACTION représente une partie d'un tout.

NOTATION : a/b → a = NUMÉRATEUR, b = DÉNOMINATEUR
⚠️ Le dénominateur ne peut jamais être 0 !

TYPES :
• Fraction propre : numérateur < dénominateur (ex: 3/4)
• Fraction impropre : numérateur ≥ dénominateur (ex: 7/4)
• Nombre entier : 6/3 = 2

🌍 On coupe une papaye en 8 parts égales.
Maman mange 3 parts → elle a mangé 3/8.
Il reste 5/8 de la papaye.

FRACTION D'UNE QUANTITÉ :
3/4 de 200 FCFA = 200 × 3 ÷ 4 = 150 FCFA`,
        exemples:[
          {question:"Quelle fraction représente 2 parts sur 5 ?", reponse:"2/5"},
          {question:"Calculer 3/4 de 120 FCFA", reponse:"90 FCFA"},
          {question:"Écrire 5/5 comme entier", reponse:"1"},
        ]
      },
      { id:"8-2", titre:"Fractions égales et simplification",
        contenu:`Deux fractions sont ÉGALES si elles représentent la même quantité.

OBTENIR DES FRACTIONS ÉGALES :
Multiplier ou diviser numérateur ET dénominateur par un même nombre.

EXEMPLES :
• 1/2 = 2/4 = 3/6 = 4/8
• 6/8 = 3/4 (÷2)

SIMPLIFIER = diviser par le PGCD.
• 12/18 → PGCD=6 → 2/3
• Fraction IRRÉDUCTIBLE : on ne peut plus simplifier.

🌍 Équipe : 6 victoires sur 8 matchs.
6/8 = 3/4 → l'équipe a gagné 3/4 de ses matchs.`,
        exemples:[
          {question:"Simplifier 15/25", reponse:"3/5 (÷5)"},
          {question:"Compléter : 2/3 = ?/12", reponse:"8/12 (×4)"},
        ]
      },
      { id:"8-3", titre:"Comparer et opérer sur les fractions",
        contenu:`MÊME DÉNOMINATEUR : la plus grande a le plus grand numérateur.
3/7 < 5/7 < 6/7

DÉNOMINATEURS DIFFÉRENTS : ramener au même dénominateur.
1/3 et 2/5 → 5/15 et 6/15 → 1/3 < 2/5

ADDITION (même dénominateur) :
3/7 + 2/7 = 5/7

SOUSTRACTION (même dénominateur) :
5/7 − 2/7 = 3/7

🌍 Aminata mange 2/8 de la tarte, Kofi 3/8.
Ensemble : 2/8 + 3/8 = 5/8
Il reste : 8/8 − 5/8 = 3/8`,
        exemples:[
          {question:"Calculer 3/8 + 1/8", reponse:"4/8 = 1/2"},
          {question:"Calculer 7/10 − 3/10", reponse:"4/10 = 2/5"},
          {question:"Comparer 3/4 et 5/6", reponse:"9/12 < 10/12 → 3/4 < 5/6"},
        ]
      },
    ],
    exercices:[
      {id:1, niveau:"⭐ Facile",       enonce:"Écrire en fraction : 3 parts sur 5.", solution:"3/5"},
      {id:2, niveau:"⭐ Facile",       enonce:"Calculer 1/4 de 200 FCFA.", solution:"50 FCFA"},
      {id:3, niveau:"⭐ Facile",       enonce:"Simplifier : 4/6", solution:"2/3"},
      {id:4, niveau:"⭐ Facile",       enonce:"Calculer : 2/5 + 1/5", solution:"3/5"},
      {id:5, niveau:"⭐ Facile",       enonce:"Calculer : 7/9 − 4/9", solution:"3/9 = 1/3"},
      {id:6, niveau:"⭐⭐ Moyen",      enonce:"Compléter : 3/4 = ?/20", solution:"15/20"},
      {id:7, niveau:"⭐⭐ Moyen",      enonce:"Simplifier : 18/24", solution:"3/4"},
      {id:8, niveau:"⭐⭐ Moyen",      enonce:"Comparer : 5/8 et 3/5", solution:"25/40 > 24/40 → 5/8 > 3/5"},
      {id:9, niveau:"⭐⭐ Moyen",      enonce:"Classe de 30 élèves. 2/5 sont des filles. Combien ?", solution:"12 filles"},
      {id:10, niveau:"⭐⭐ Moyen",     enonce:"Kofi mange 3/8 d'une pizza, Jean 2/8. Fraction mangée ?", solution:"5/8"},
      {id:11, niveau:"⭐⭐⭐ Difficile",enonce:"Calculer : 1/3 + 1/4", solution:"4/12 + 3/12 = 7/12"},
      {id:12, niveau:"⭐⭐⭐ Difficile",enonce:"Ordre croissant : 3/4 ; 2/3 ; 5/6 ; 7/12", solution:"7/12 < 2/3 < 3/4 < 5/6"},
      {id:13, niveau:"⭐⭐⭐ Difficile",enonce:"Aminata dépense 1/4 en nourriture, 1/3 en transport. Fraction restante ?", solution:"1 − 7/12 = 5/12"},
      {id:14, niveau:"⭐⭐⭐ Difficile",enonce:"Terrain de 1 200 m² : 3/8 jardin, 1/4 maison, reste garage. Surfaces ?", solution:"Jardin : 450 m² — Maison : 300 m² — Garage : 450 m²"},
      {id:15, niveau:"⭐⭐⭐ Difficile",enonce:"Montrer que 2/3 de 3/4 = 1/2.", solution:"2/3 × 3/4 = 6/12 = 1/2 ✓"},
    ],
  },
};

// ─── STRUCTURE CHAPITRES ET PARTIES ──────────────────────────────────────────
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
  {id:1, name:"Nombres & Calculs",       icon:"🔢", color:"#f59e0b"},
  {id:2, name:"Géométrie plane",         icon:"📐", color:"#3b82f6"},
  {id:3, name:"Grandeurs & Mesures",     icon:"📏", color:"#10b981"},
  {id:4, name:"Géométrie dans l'espace", icon:"🔷", color:"#8b5cf6"},
  {id:5, name:"Données & Statistiques",  icon:"📊", color:"#ef4444"},
];

const SUBJECTS = [
  {id:"maths",   name:"Mathématiques",  icon:"🔢", available:true },
  {id:"french",  name:"Français",       icon:"📝", available:false},
  {id:"svt",     name:"SVT",            icon:"🌿", available:false},
  {id:"histgeo", name:"Histoire-Géo",   icon:"🌍", available:false},
  {id:"phys",    name:"Physique-Chimie",icon:"⚗️", available:false},
  {id:"english", name:"Anglais",        icon:"🇬🇧", available:false},
];

const PLANS = [
  {id:"free",      name:"Gratuit",   price:0,    features:["3 leçons d'essai","Tuteur Kodjo limité","Aperçu des exercices"], cta:"Commencer gratuitement", color:"#6b7280"},
  {id:"essential", name:"Essentiel", price:1995, features:["Tous les cours complets","Toutes les matières","Tuteur Kodjo illimité","Suivi de progression"], cta:"Choisir Essentiel", color:"#f5a623"},
  {id:"premium",   name:"Premium",   price:2995, features:["Tout l'Essentiel","Exercices + Corrigés","Compétition africaine 🏆","Badges & Trophées","Classement continental"], cta:"Choisir Premium", color:"#10b981", popular:true},
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

const SYSTEM_PROMPT = `Tu es Kodjo, un tuteur IA bienveillant et encourageant pour AfriLearn, une plateforme éducative africaine. Tu aides des élèves de 6ème dans toute l'Afrique francophone.
- Chaleureux, patient, encourageant
- Exemples tirés de la vie quotidienne africaine (marchés, distances, FCFA)
- Tu poses UNE seule question à la fois
- Tu félicites les bonnes réponses
- En cas d'erreur, tu expliques doucement
- Français simple et accessible
Commence par te présenter et demander le prénom et pays de l'élève.`;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Crimson+Pro:wght@400;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Sora',sans-serif; background:#060d1a; color:#e8f4f0; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
  .fade-in { animation:fadeIn 0.35s ease forwards; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .pulse { animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const inputStyle = {background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 14px",color:"#e8f4f0",fontSize:13,fontFamily:"Sora,sans-serif",outline:"none",width:"100%"};

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────
const Badge = ({children,color="#f5a623"}) => <span style={{background:`${color}22`,color,border:`1px solid ${color}44`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600}}>{children}</span>;

const Card = ({children,style={},onClick}) => (
  <div onClick={onClick} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:18,cursor:onClick?"pointer":"default",transition:"all 0.2s",...style}}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.background="rgba(255,255,255,0.06)")}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
  >{children}</div>
);

const Btn = ({children,onClick,color="#f5a623",outline=false,disabled=false,style={}}) => (
  <button onClick={onClick} disabled={disabled} style={{background:outline?"transparent":disabled?"#333":color,color:outline?color:disabled?"#666":"#fff",border:outline?`1.5px solid ${color}`:"none",borderRadius:10,padding:"10px 20px",fontFamily:"Sora,sans-serif",fontWeight:600,fontSize:13,cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",...style}}>{children}</button>
);

const filterBtn = (active,color="#f5a623") => ({background:active?`${color}22`:"rgba(255,255,255,0.04)",color:active?color:"#7a9e8e",border:active?`1px solid ${color}44`:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"Sora,sans-serif",transition:"all 0.2s"});

const Footer = () => (
  <div style={{textAlign:"center",padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.05)",marginTop:24}}>
    <p style={{fontSize:11,color:"#334155"}}>© {new Date().getFullYear()} AfriLearn — Tous droits réservés.</p>
    <p style={{fontSize:10,color:"#1e293b",marginTop:3}}>Contenu protégé par le droit d'auteur. Reproduction interdite sans autorisation.</p>
  </div>
);

const AdminPreviewBar = ({onBackToAdmin}) => (
  <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"linear-gradient(90deg,#f5a623,#d97706)",padding:"8px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:14}}>👁️</span>
      <span style={{fontSize:12,fontWeight:700,color:"#fff"}}>Mode Prévisualisation — Vue élève (Premium)</span>
    </div>
    <button onClick={onBackToAdmin} style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",borderRadius:8,padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Sora,sans-serif"}}>← Retour à l'Admin</button>
  </div>
);

const CGUModal = ({onAccept,onDecline}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:"#0c1829",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,maxWidth:540,width:"100%",maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <h3 style={{fontFamily:"'Crimson Pro',serif",fontSize:20,color:"#f5a623"}}>📜 Conditions Générales d'Utilisation</h3>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 24px",fontSize:12,lineHeight:1.8,color:"#9ca3af"}}>
        {[["1. Objet","AfriLearn est une plateforme éducative numérique pour les élèves d'Afrique francophone. L'utilisation implique l'acceptation des présentes CGU."],["2. Propriété intellectuelle","Tous les contenus (cours, exercices, corrigés, logo) sont la propriété exclusive d'AfriLearn. Toute reproduction sans autorisation est interdite."],["3. Abonnements","Les abonnements sont mensuels. Paiement via Mobile Money ou carte bancaire (CinetPay). Aucun remboursement après accès au contenu."],["4. Tuteur IA Kodjo","Kodjo est fourni à titre pédagogique. Il est recommandé de croiser les informations avec un enseignant qualifié."],["5. Données personnelles","Seules les données nécessaires au service sont collectées. Elles ne sont jamais vendues."],["6. Comportement","Tout abus entraîne la suspension immédiate du compte."],["7. Droit applicable","CGU soumises au droit gabonais. Litige : tribunaux de Libreville."]].map(([t,c])=>(
          <div key={t} style={{marginBottom:16}}><p style={{fontWeight:700,color:"#e8f4f0",marginBottom:6}}>{t}</p><p>{c}</p></div>
        ))}
      </div>
      <div style={{padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:10}}>
        <Btn onClick={onDecline} outline color="#6b7280" style={{flex:1}}>Refuser</Btn>
        <Btn onClick={onAccept} color="#f5a623" style={{flex:1}}>✓ J'accepte</Btn>
      </div>
    </div>
  </div>
);

// ─── ÉCRAN CONTENU CHAPITRE ───────────────────────────────────────────────────
const ChapterContent = ({chapter, user, onBack, onTutor}) => {
  const [tab, setTab] = useState("cours");
  const [showSolution, setShowSolution] = useState({});
  const content = CHAPTERS_CONTENT[chapter.id];
  const part = PARTS.find(p=>p.id===chapter.part);
  const hasPremium = user.plan==="Premium" || user.isPreview;
  const toggle = (id) => setShowSolution(prev=>({...prev,[id]:!prev[id]}));

  if (!content) return (
    <div style={{padding:"24px 20px",maxWidth:700,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#7a9e8e",cursor:"pointer",fontSize:13,marginBottom:16,fontFamily:"Sora,sans-serif"}}>← Retour</button>
      <Card style={{textAlign:"center",padding:40}}>
        <div style={{fontSize:40,marginBottom:12}}>🚧</div>
        <h3 style={{fontWeight:700,marginBottom:8}}>Contenu en cours de rédaction</h3>
        <p style={{color:"#7a9e8e",fontSize:13}}>Ce chapitre sera disponible très bientôt !</p>
        <div style={{marginTop:16}}><Badge color="#f5a623">Partie 2 — Bientôt disponible</Badge></div>
      </Card>
    </div>
  );

  return (
    <div className="fade-in" style={{padding:`${user.isPreview?64:24}px 20px 24px`,maxWidth:780,margin:"0 auto"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#7a9e8e",cursor:"pointer",fontSize:13,marginBottom:16,fontFamily:"Sora,sans-serif"}}>← Retour aux chapitres</button>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{width:40,height:40,borderRadius:10,background:`${part.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:part.color}}>{chapter.id}</div>
        <div>
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:22,fontWeight:600}}>{chapter.title}</h2>
          <p style={{color:"#7a9e8e",fontSize:12}}>{part.name} · {content.duration}</p>
        </div>
      </div>

      <Card style={{marginBottom:18,borderLeft:`3px solid ${part.color}`}}>
        <div style={{fontSize:12,fontWeight:700,color:part.color,marginBottom:8}}>🎯 Objectifs</div>
        {content.objectives.map((o,i)=><div key={i} style={{fontSize:12,color:"#9ca3af",display:"flex",gap:6,marginBottom:3}}><span style={{color:part.color}}>✓</span>{o}</div>)}
      </Card>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[["cours","📖 Cours"],["exercices","✏️ Exercices"],[hasPremium?"corriges":"corriges_locked","✅ Corrigés"]].map(([id,label])=>{
          const isLocked = id==="corriges_locked";
          return (
            <button key={id} onClick={()=>!isLocked&&setTab(isLocked?"corriges":id)} style={{...{padding:"8px 16px",borderRadius:20,fontSize:12,fontWeight:600,cursor:isLocked?"not-allowed":"pointer",fontFamily:"Sora,sans-serif",transition:"all 0.2s"}, background:tab===id||(!hasPremium&&id==="corriges_locked"&&tab==="corriges")?part.color:"rgba(255,255,255,0.05)", color:tab===id?"#fff":"#7a9e8e", border:"none", opacity:isLocked?0.5:1}}>
              {label} {isLocked&&"🔒"}
            </button>
          );
        })}
        <button onClick={onTutor} style={{padding:"8px 16px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"Sora,sans-serif",background:"rgba(245,166,35,0.15)",color:"#f5a623",border:"1px solid rgba(245,166,35,0.3)"}}>🤖 Kodjo</button>
      </div>

      {tab==="cours" && (
        <div className="fade-in">
          {content.cours.map((lecon,idx)=>(
            <div key={lecon.id} style={{marginBottom:28}}>
              <div style={{fontWeight:700,fontSize:15,color:part.color,marginBottom:12}}>{idx+1}. {lecon.titre}</div>
              <Card style={{marginBottom:12,borderLeft:`2px solid ${part.color}`}}>
                <pre style={{whiteSpace:"pre-wrap",fontSize:13,lineHeight:1.9,color:"#d1fae5",fontFamily:"Sora,sans-serif"}}>{lecon.contenu}</pre>
              </Card>
              {lecon.exemples&&(
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#7a9e8e",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Exemples résolus</div>
                  {lecon.exemples.map((ex,i)=>(
                    <Card key={i} style={{marginBottom:8,padding:14,borderLeft:"2px solid #3b82f6"}}>
                      <div style={{fontSize:12,color:"#93c5fd",marginBottom:6}}>❓ {ex.question}</div>
                      <div style={{fontSize:12,color:"#22c55e"}}>✅ {ex.reponse}</div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==="exercices" && (
        <div className="fade-in">
          <p style={{color:"#7a9e8e",fontSize:12,marginBottom:16}}>{content.exercices.length} exercices · Cliquer sur "Voir solution" pour afficher le corrigé</p>
          {content.exercices.map(ex=>(
            <Card key={ex.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:part.color}}>Ex. {ex.id}</span>
                    <Badge color={ex.niveau.includes("Difficile")?"#ef4444":ex.niveau.includes("Moyen")?"#f5a623":"#22c55e"}>{ex.niveau}</Badge>
                  </div>
                  <p style={{fontSize:13,lineHeight:1.6,color:"#e2f5e8"}}>{ex.enonce}</p>
                  {showSolution[ex.id]&&(
                    <div style={{marginTop:10,padding:"10px 14px",background:"rgba(34,197,94,0.08)",borderRadius:8,borderLeft:"2px solid #22c55e"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#22c55e",marginBottom:4}}>SOLUTION :</div>
                      <p style={{fontSize:12,color:"#6ee7b7",lineHeight:1.7}}>{ex.solution}</p>
                    </div>
                  )}
                </div>
                <Btn onClick={()=>toggle(ex.id)} color={showSolution[ex.id]?"#6b7280":"#f5a623"} style={{padding:"6px 12px",fontSize:11,flexShrink:0}}>
                  {showSolution[ex.id]?"Masquer":"Voir solution"}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab==="corriges" && (
        <div className="fade-in">
          {!hasPremium ? (
            <Card style={{textAlign:"center",padding:32,border:"1px solid rgba(34,197,94,0.2)"}}>
              <div style={{fontSize:40,marginBottom:12}}>🔒</div>
              <h3 style={{fontWeight:700,marginBottom:8}}>Corrigés — Plan Premium</h3>
              <p style={{color:"#7a9e8e",fontSize:13,marginBottom:16}}>Disponible avec le plan Premium à <strong style={{color:"#22c55e"}}>2 995 FCFA/mois</strong>.</p>
              <Badge color="#22c55e">Passer en Premium</Badge>
            </Card>
          ) : (
            <>
              <p style={{color:"#7a9e8e",fontSize:12,marginBottom:16}}>Tous les corrigés détaillés</p>
              {content.exercices.map(ex=>(
                <Card key={ex.id} style={{marginBottom:10,borderLeft:"2px solid #22c55e"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:700,color:part.color}}>Ex. {ex.id}</span>
                    <Badge color={ex.niveau.includes("Difficile")?"#ef4444":ex.niveau.includes("Moyen")?"#f5a623":"#22c55e"}>{ex.niveau}</Badge>
                  </div>
                  <p style={{fontSize:12,color:"#9ca3af",marginBottom:8,fontStyle:"italic"}}>{ex.enonce}</p>
                  <div style={{padding:"10px 14px",background:"rgba(34,197,94,0.08)",borderRadius:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#22c55e",marginBottom:4}}>✅ CORRIGÉ :</div>
                    <p style={{fontSize:12,color:"#6ee7b7",lineHeight:1.7}}>{ex.solution}</p>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
      <Footer/>
    </div>
  );
};

// ─── LANDING ─────────────────────────────────────────────────────────────────
const Landing = ({onEnter}) => (
  <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,166,35,0.08) 0%,transparent 70%)",top:"10%",left:"10%",pointerEvents:"none"}}/>
    <div style={{position:"absolute",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)",bottom:"15%",right:"10%",pointerEvents:"none"}}/>
    <div className="fade-in" style={{maxWidth:560}}>
      <div style={{fontSize:64,marginBottom:16}}>🌍</div>
      <h1 style={{fontFamily:"'Crimson Pro',serif",fontSize:"clamp(2.4rem,6vw,3.8rem)",fontWeight:600,background:"linear-gradient(135deg,#f5a623 0%,#22c55e 60%,#3b82f6 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1.15,marginBottom:16}}>AfriLearn</h1>
      <p style={{color:"#7a9e8e",fontSize:16,lineHeight:1.7,marginBottom:12}}>La première plateforme d'apprentissage IA dédiée aux élèves d'<strong style={{color:"#e8f4f0"}}>Afrique francophone</strong>.</p>
      <p style={{color:"#556b5e",fontSize:14,marginBottom:36}}>Du 6ème à la Terminale · Cours · Exercices · Compétition africaine</p>
      <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
        <Btn onClick={()=>onEnter("register")} color="#f5a623" style={{padding:"13px 28px",fontSize:14}}>Commencer gratuitement →</Btn>
        <Btn onClick={()=>onEnter("login")} outline color="#f5a623" style={{padding:"13px 28px",fontSize:14}}>Se connecter</Btn>
      </div>
      <div style={{display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap"}}>
        {[["20+","Pays francophones"],["25","Chapitres Maths 6ème"],["120","Exercices corrigés"]].map(([n,l])=>(
          <div key={l}><div style={{fontSize:22,fontWeight:700,color:"#f5a623"}}>{n}</div><div style={{fontSize:11,color:"#556b5e",marginTop:2}}>{l}</div></div>
        ))}
      </div>
    </div>
    <div style={{position:"absolute",bottom:16,fontSize:11,color:"#1e293b"}}>© {new Date().getFullYear()} AfriLearn — Tous droits réservés</div>
  </div>
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = ({mode,onAuth,onSwitch}) => {
  const [form,setForm] = useState({name:"",email:"",country:"Gabon",password:"",level:"6ème"});
  const [showCGU,setShowCGU] = useState(false);
  const [cguAccepted,setCguAccepted] = useState(false);
  const [error,setError] = useState("");
  const handleSubmit = () => {
    if (!form.email||!form.password){setError("Veuillez remplir tous les champs.");return;}
    if (mode==="register"&&!cguAccepted){setError("Vous devez accepter les CGU.");return;}
    if (form.email===SUPER_ADMIN.email&&form.password===SUPER_ADMIN.password){onAuth({name:"Super Administrateur",email:form.email,role:"superadmin",plan:"SuperAdmin",country:"Gabon",level:"Admin"});return;}
    const admin=ADMIN_ACCOUNTS.find(a=>a.email===form.email&&a.password===form.password);
    if (admin){onAuth({...admin,plan:"Admin",country:"Gabon",level:"Admin"});return;}
    onAuth({name:form.name||"Élève",email:form.email,country:form.country,level:form.level,plan:"Gratuit",role:"user"});
  };
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      {showCGU&&<CGUModal onAccept={()=>{setCguAccepted(true);setShowCGU(false);}} onDecline={()=>setShowCGU(false)}/>}
      <div className="fade-in" style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:8}}>🌍</div>
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:28,fontWeight:600,color:"#f5a623"}}>{mode==="login"?"Bon retour !":"Rejoindre AfriLearn"}</h2>
        </div>
        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="register"&&<input placeholder="Ton prénom" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={inputStyle}/>}
            <input placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inputStyle}/>
            <input placeholder="Mot de passe" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={inputStyle}/>
            {mode==="register"&&<>
              <select value={form.country} onChange={e=>setForm({...form,country:e.target.value})} style={inputStyle}>{COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}</select>
              <select value={form.level} onChange={e=>setForm({...form,level:e.target.value})} style={inputStyle}>{["6ème","5ème","4ème","3ème","2nde","1ère","Terminale"].map(l=><option key={l} value={l}>{l}</option>)}</select>
              <label style={{fontSize:12,color:"#7a9e8e",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={cguAccepted} onChange={e=>setCguAccepted(e.target.checked)}/>
                J'accepte les <span onClick={()=>setShowCGU(true)} style={{color:"#f5a623",cursor:"pointer",textDecoration:"underline"}}>CGU</span>
              </label>
            </>}
            {error&&<p style={{color:"#ef4444",fontSize:12}}>{error}</p>}
            <Btn onClick={handleSubmit} color="#f5a623" style={{marginTop:4,padding:"13px",fontSize:14}}>{mode==="login"?"Se connecter →":"Créer mon compte →"}</Btn>
          </div>
        </Card>
        <p style={{textAlign:"center",marginTop:20,color:"#556b5e",fontSize:13}}>
          {mode==="login"?"Pas encore de compte ? ":"Déjà un compte ? "}
          <span onClick={onSwitch} style={{color:"#f5a623",cursor:"pointer",fontWeight:600}}>{mode==="login"?"S'inscrire":"Se connecter"}</span>
        </p>
      </div>
    </div>
  );
};

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
const SuperAdmin = ({user,onLogout,onPreview}) => {
  const [tab,setTab] = useState("dashboard");
  const [users,setUsers] = useState(FAKE_USERS);
  const stats = {total:users.length,premium:users.filter(u=>u.plan==="Premium").length,essential:users.filter(u=>u.plan==="Essentiel").length,free:users.filter(u=>u.plan==="Gratuit").length,revenue:users.filter(u=>u.plan==="Premium").length*2995+users.filter(u=>u.plan==="Essentiel").length*1995};
  const tabs = [{id:"dashboard",label:"📊 Tableau de bord"},{id:"users",label:"👥 Utilisateurs"},{id:"content",label:"📚 Contenu"},{id:"admins",label:"👑 Admins"},{id:"finance",label:"💰 Finances"},{id:"settings",label:"⚙️ Paramètres"}];
  return (
    <div style={{minHeight:"100vh",display:"flex"}}>
      <div style={{width:220,background:"rgba(0,0,0,0.4)",borderRight:"1px solid rgba(255,255,255,0.07)",padding:"20px 0",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"0 20px 20px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:22,marginBottom:4}}>🌍</div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:18,color:"#f5a623",fontWeight:600}}>AfriLearn</div>
          <Badge color="#f5a623">Super Admin</Badge>
        </div>
        <div style={{padding:"16px 12px 8px"}}>
          <button onClick={onPreview} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 14px",borderRadius:12,background:"linear-gradient(135deg,rgba(34,197,94,0.2),rgba(59,130,246,0.1))",border:"1px solid rgba(34,197,94,0.3)",color:"#22c55e",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:700,transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="linear-gradient(135deg,rgba(34,197,94,0.3),rgba(59,130,246,0.2))"}
            onMouseLeave={e=>e.currentTarget.style.background="linear-gradient(135deg,rgba(34,197,94,0.2),rgba(59,130,246,0.1))"}
          ><span style={{fontSize:16}}>👁️</span> Voir le site</button>
        </div>
        <div style={{flex:1,padding:"8px 12px"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"block",width:"100%",textAlign:"left",padding:"10px 12px",borderRadius:10,background:tab===t.id?"rgba(245,166,35,0.12)":"transparent",color:tab===t.id?"#f5a623":"#7a9e8e",border:"none",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:12,fontWeight:tab===t.id?600:400,marginBottom:4,transition:"all 0.2s"}}>{t.label}</button>)}
        </div>
        <div style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <div style={{fontSize:11,color:"#556b5e",marginBottom:8}}>{user.email}</div>
          <Btn onClick={onLogout} outline color="#ef4444" style={{width:"100%",padding:"8px",fontSize:11}}>Déconnexion</Btn>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:24}}>
        {tab==="dashboard"&&<div className="fade-in">
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,marginBottom:20}}>📊 Tableau de bord</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
            {[{label:"Utilisateurs",value:stats.total,color:"#3b82f6",icon:"👥"},{label:"Premium",value:stats.premium,color:"#22c55e",icon:"⭐"},{label:"Essentiel",value:stats.essential,color:"#f5a623",icon:"📚"},{label:"Gratuit",value:stats.free,color:"#6b7280",icon:"🆓"},{label:"Revenus",value:`${stats.revenue.toLocaleString()} FCFA`,color:"#f5a623",icon:"💰"},{label:"Pays",value:"8",color:"#8b5cf6",icon:"🌍"}].map(s=>(
              <Card key={s.label} style={{textAlign:"center"}}><div style={{fontSize:24,marginBottom:8}}>{s.icon}</div><div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div><div style={{fontSize:11,color:"#556b5e",marginTop:4}}>{s.label}</div></Card>
            ))}
          </div>
          <Card>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>📚 Contenu disponible</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:13}}>🔢 Partie 1 — Nombres & Calculs</span>
                <div style={{display:"flex",gap:8}}><Badge color="#22c55e">8/8 chapitres</Badge><Badge color="#22c55e">120 exercices</Badge></div>
              </div>
              {[["📐 Partie 2 — Géométrie plane","0/6"],["📏 Partie 3 — Grandeurs & Mesures","0/5"],["🔷 Partie 4 — Géométrie espace","0/3"],["📊 Partie 5 — Données & Stats","0/3"]].map(([n,s])=>(
                <div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                  <span style={{fontSize:13,color:"#7a9e8e"}}>{n}</span>
                  <Badge color="#f5a623">{s} chapitres</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>}
        {tab==="users"&&<div className="fade-in">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24}}>👥 Utilisateurs</h2>
            <Badge color="#3b82f6">{users.length} utilisateurs</Badge>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 6px",fontSize:12}}>
              <thead><tr style={{color:"#556b5e"}}>{["Nom","Email","Pays","Niveau","Plan","Inscrit","Statut","Actions"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:600}}>{h}</th>)}</tr></thead>
              <tbody>{users.map(u=>(
                <tr key={u.id} style={{background:"rgba(255,255,255,0.02)"}}>
                  <td style={{padding:"10px 12px",borderRadius:"8px 0 0 8px",fontWeight:600}}>{u.name}</td>
                  <td style={{padding:"10px 12px",color:"#7a9e8e"}}>{u.email}</td>
                  <td style={{padding:"10px 12px"}}>{u.country}</td>
                  <td style={{padding:"10px 12px"}}>{u.level}</td>
                  <td style={{padding:"10px 12px"}}><Badge color={u.plan==="Premium"?"#22c55e":u.plan==="Essentiel"?"#f5a623":"#6b7280"}>{u.plan}</Badge></td>
                  <td style={{padding:"10px 12px",color:"#556b5e"}}>{u.joined}</td>
                  <td style={{padding:"10px 12px"}}><span style={{color:u.active?"#22c55e":"#ef4444",fontSize:11}}>{u.active?"● Actif":"● Inactif"}</span></td>
                  <td style={{padding:"10px 12px",borderRadius:"0 8px 8px 0"}}><button onClick={()=>setUsers(users.map(x=>x.id===u.id?{...x,active:!x.active}:x))} style={{background:"rgba(255,255,255,0.05)",border:"none",color:u.active?"#ef4444":"#22c55e",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"Sora,sans-serif"}}>{u.active?"Suspendre":"Activer"}</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>}
        {tab==="content"&&<div className="fade-in">
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,marginBottom:20}}>📚 Contenu</h2>
          {PARTS.map(part=>(
            <Card key={part.id} style={{marginBottom:12,borderLeft:`3px solid ${part.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:14,color:part.color}}>{part.icon} {part.name}</div>
                <Badge color={part.id===1?"#22c55e":"#f5a623"}>{part.id===1?"Complet":"En cours"}</Badge>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:6}}>
                {CHAPTERS.filter(c=>c.part===part.id).map(ch=>(
                  <div key={ch.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:12}}>
                    <span>{ch.id}. {ch.title}</span>
                    <span style={{color:CHAPTERS_CONTENT[ch.id]?"#22c55e":"#6b7280",fontSize:10}}>{CHAPTERS_CONTENT[ch.id]?"✓":"·"}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>}
        {tab==="admins"&&<div className="fade-in">
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,marginBottom:20}}>👑 Administrateurs</h2>
          <Card style={{marginBottom:16,border:"1px solid rgba(245,166,35,0.2)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12,color:"#f5a623"}}>⚡ Super Administrateur</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:600}}>Super Administrateur</div><div style={{fontSize:12,color:"#7a9e8e"}}>{SUPER_ADMIN.email}</div></div>
              <Badge color="#f5a623">Accès total</Badge>
            </div>
          </Card>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:14}}>🛡️ Administrateurs</div>
              <Btn color="#22c55e" style={{padding:"6px 14px",fontSize:11}}>+ Ajouter</Btn>
            </div>
            {ADMIN_ACCOUNTS.map((a,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px",background:"rgba(255,255,255,0.02)",borderRadius:10}}>
                <div><div style={{fontWeight:600,fontSize:13}}>{a.name}</div><div style={{fontSize:11,color:"#7a9e8e"}}>{a.email}</div></div>
                <div style={{display:"flex",gap:8}}><Badge color="#3b82f6">Admin</Badge><Btn outline color="#ef4444" style={{padding:"4px 10px",fontSize:10}}>Supprimer</Btn></div>
              </div>
            ))}
          </Card>
        </div>}
        {tab==="finance"&&<div className="fade-in">
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,marginBottom:20}}>💰 Finances</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:20}}>
            {[{label:"Revenus ce mois",value:`${stats.revenue.toLocaleString()} FCFA`,color:"#22c55e",icon:"💵"},{label:"Abonnés payants",value:stats.premium+stats.essential,color:"#f5a623",icon:"👥"},{label:"Ticket moyen",value:"2 350 FCFA",color:"#3b82f6",icon:"📊"},{label:"Taux conversion",value:"62%",color:"#8b5cf6",icon:"📈"}].map(s=>(
              <Card key={s.label} style={{textAlign:"center"}}><div style={{fontSize:24,marginBottom:8}}>{s.icon}</div><div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div><div style={{fontSize:11,color:"#556b5e",marginTop:4}}>{s.label}</div></Card>
            ))}
          </div>
          <Card>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>💳 Tarifs actuels</div>
            {PLANS.filter(p=>p.price>0).map(p=>(
              <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div><div style={{fontWeight:600,fontSize:13}}>{p.name}</div><div style={{fontSize:11,color:"#7a9e8e"}}>Mensuel</div></div>
                <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontWeight:700,color:p.color}}>{p.price.toLocaleString()} FCFA/mois</span><Btn color="#f5a623" style={{padding:"5px 12px",fontSize:11}}>Modifier</Btn></div>
              </div>
            ))}
          </Card>
        </div>}
        {tab==="settings"&&<div className="fade-in">
          <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,marginBottom:20}}>⚙️ Paramètres</h2>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[{label:"🔑 Mot de passe Super Admin",desc:"Modifier les identifiants"},{label:"🌍 Pays disponibles",desc:"Activer/désactiver des pays"},{label:"📱 Configuration CinetPay",desc:"Clés API et paiements"},{label:"🤖 Configuration Kodjo",desc:"Paramètres du tuteur IA"},{label:"📧 Notifications email",desc:"Alertes automatiques"},{label:"🛡️ Sécurité",desc:"Journaux de connexion"}].map(s=>(
              <Card key={s.label} onClick={()=>{}} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontWeight:600,fontSize:13}}>{s.label}</div><div style={{fontSize:11,color:"#556b5e",marginTop:4}}>{s.desc}</div></div>
                <span style={{color:"#556b5e"}}>›</span>
              </Card>
            ))}
          </div>
        </div>}
        <Footer/>
      </div>
    </div>
  );
};

// ─── DASHBOARD ÉLÈVE ─────────────────────────────────────────────────────────
const Dashboard = ({user,onNav}) => {
  const pct = Math.round((8/25)*100);
  const tp = user.isPreview?{paddingTop:48}:{};
  return (
    <div className="fade-in" style={{padding:"24px 20px",maxWidth:800,margin:"0 auto",...tp}}>
      <div style={{marginBottom:28}}>
        <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:26,fontWeight:600}}>Bonjour, <span style={{color:"#f5a623"}}>{user.name}</span> 👋</h2>
        <p style={{color:"#7a9e8e",fontSize:13,marginTop:4}}>{user.level} · {user.country} · Plan {user.plan}</p>
      </div>
      <Card style={{marginBottom:20,background:"linear-gradient(135deg,rgba(245,166,35,0.08),rgba(34,197,94,0.05))"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontWeight:600,fontSize:14}}>📐 Maths 6ème — Progression</span>
          <Badge color="#f5a623">Partie 1 complète !</Badge>
        </div>
        <div style={{background:"rgba(255,255,255,0.06)",borderRadius:999,height:8,overflow:"hidden"}}>
          <div style={{width:`${pct}%`,height:"100%",background:"linear-gradient(90deg,#f5a623,#22c55e)",borderRadius:999}}/>
        </div>
        <p style={{color:"#556b5e",fontSize:12,marginTop:8}}>{pct}% complété · 8/25 chapitres disponibles</p>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:24}}>
        {[{icon:"📖",label:"Continuer le cours",color:"#f5a623",action:()=>onNav("chapters")},{icon:"🤖",label:"Parler à Kodjo",color:"#3b82f6",action:()=>onNav("tutor")},{icon:"🏆",label:"Compétition",color:"#22c55e",action:()=>onNav("competition")},{icon:"💳",label:"Mon abonnement",color:"#8b5cf6",action:()=>onNav("pricing")}].map(item=>(
          <Card key={item.label} onClick={item.action} style={{textAlign:"center",padding:16}}>
            <div style={{fontSize:28,marginBottom:8}}>{item.icon}</div>
            <div style={{fontSize:12,fontWeight:600,color:item.color}}>{item.label}</div>
          </Card>
        ))}
      </div>
      <h3 style={{fontSize:13,fontWeight:700,color:"#7a9e8e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:14}}>Matières disponibles</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {SUBJECTS.map(s=>(
          <Card key={s.id} onClick={s.available?()=>onNav("chapters"):null} style={{textAlign:"center",padding:14,opacity:s.available?1:0.4}}>
            <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:12,fontWeight:600}}>{s.name}</div>
            <div style={{fontSize:10,color:s.available?"#22c55e":"#556b5e",marginTop:4}}>{s.available?"● Disponible":"Bientôt"}</div>
          </Card>
        ))}
      </div>
      <Footer/>
    </div>
  );
};

// ─── CHAPTERS ────────────────────────────────────────────────────────────────
const Chapters = ({user,onChapter}) => {
  const [filter,setFilter] = useState(0);
  const filtered = filter===0?CHAPTERS:CHAPTERS.filter(c=>c.part===filter);
  const tp = user.isPreview?{paddingTop:48}:{};
  return (
    <div className="fade-in" style={{padding:"24px 20px",maxWidth:800,margin:"0 auto",...tp}}>
      <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:24,fontWeight:600,marginBottom:4}}>📐 Mathématiques — <span style={{color:"#f5a623"}}>6ème</span></h2>
      <p style={{color:"#7a9e8e",fontSize:13,marginBottom:20}}>25 chapitres · 5 parties · Partie 1 complète avec 120 exercices</p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        <button onClick={()=>setFilter(0)} style={filterBtn(filter===0)}>Tous</button>
        {PARTS.map(p=><button key={p.id} onClick={()=>setFilter(p.id)} style={filterBtn(filter===p.id,p.color)}>{p.icon} {p.name}</button>)}
      </div>
      {(filter===0?PARTS:PARTS.filter(p=>p.id===filter)).map(part=>{
        const chs=filtered.filter(c=>c.part===part.id);
        if(!chs.length)return null;
        return (
          <div key={part.id} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:18}}>{part.icon}</span>
              <span style={{fontWeight:700,fontSize:13,color:part.color,letterSpacing:"0.04em",textTransform:"uppercase"}}>{part.name}</span>
              {part.id===1&&<Badge color="#22c55e">✓ Complet</Badge>}
              {part.id>1&&<Badge color="#f5a623">Bientôt</Badge>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {chs.map(ch=>{
                const locked=!user.isPreview&&user.plan==="Gratuit"&&ch.id>3;
                const hasContent=!!CHAPTERS_CONTENT[ch.id];
                return (
                  <div key={ch.id} onClick={()=>!locked&&onChapter(ch)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,cursor:locked?"not-allowed":"pointer",opacity:locked?0.45:1,transition:"all 0.2s"}}
                    onMouseEnter={e=>!locked&&(e.currentTarget.style.background="rgba(255,255,255,0.06)")}
                    onMouseLeave={e=>!locked&&(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
                  >
                    <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:locked?"rgba(255,255,255,0.05)":`${part.color}22`,fontSize:13,fontWeight:700,color:locked?"#556b5e":part.color,flexShrink:0}}>{locked?"🔒":ch.id}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:13}}>{ch.title}</div>
                      <div style={{fontSize:11,color:"#556b5e",marginTop:2}}>{locked?"Abonnement requis":hasContent?"Cours · Exercices · Corrigés · Kodjo":"Contenu bientôt disponible"}</div>
                    </div>
                    {locked?<Badge color="#f5a623">Essentiel</Badge>:hasContent?<span style={{color:"#556b5e"}}>›</span>:<Badge color="#6b7280">Bientôt</Badge>}
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

// ─── TUTOR ───────────────────────────────────────────────────────────────────
const Tutor = ({user,chapter}) => {
  const [messages,setMessages] = useState([]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [history,setHistory] = useState([]);
  const endRef = useRef(null);
  const topPad = user.isPreview?88:120;
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  useEffect(()=>{if(messages.length===0)startChat();},[]);
  const startChat = async () => {
    setLoading(true);
    const context = chapter?`Le sujet : ${chapter.title} en Maths 6ème.`:"Aide l'élève sur n'importe quelle matière de 6ème.";
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT+"\n\n"+context,messages:[{role:"user",content:"Bonjour Kodjo !"}]})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||"Bonjour ! Je suis Kodjo. Comment tu t'appelles ?";
      setHistory([{role:"user",content:"Bonjour Kodjo !"},{role:"assistant",content:reply}]);
      setMessages([{role:"assistant",content:reply}]);
    } catch {setMessages([{role:"assistant",content:"Bonjour ! Je suis Kodjo, ton tuteur AfriLearn. Comment tu t'appelles ?"}]);}
    setLoading(false);
  };
  const send = async () => {
    if(!input.trim()||loading)return;
    const text=input.trim();setInput("");
    const newMsgs=[...messages,{role:"user",content:text}];
    setMessages(newMsgs);
    const newHist=[...history,{role:"user",content:text}];
    setLoading(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:newHist})});
      const data=await res.json();
      const reply=data.content?.[0]?.text||"Je n'ai pas bien compris.";
      setMessages([...newMsgs,{role:"assistant",content:reply}]);
      setHistory([...newHist,{role:"assistant",content:reply}]);
    } catch {setMessages([...newMsgs,{role:"assistant",content:"Oups, une erreur. Réessaie !"}]);}
    setLoading(false);
  };
  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",height:`calc(100vh - ${topPad}px)`,maxWidth:700,margin:"0 auto",padding:"0 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#f5a623,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🦅</div>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:"#f5a623"}}>Kodjo — Tuteur IA AfriLearn</div>
          <div style={{fontSize:11,color:loading?"#f5a623":"#22c55e"}} className={loading?"pulse":""}>{loading?"En train d'écrire...":"● En ligne"}</div>
        </div>
        {chapter&&<div style={{marginLeft:"auto"}}><Badge color="#7a9e8e">{chapter.title}</Badge></div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 0",display:"flex",flexDirection:"column",gap:12}}>
        {messages.map((msg,i)=>(
          <div key={i} style={{display:"flex",gap:10,justifyContent:msg.role==="assistant"?"flex-start":"flex-end"}}>
            {msg.role==="assistant"&&<div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f5a623,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🦅</div>}
            <div style={{maxWidth:"75%",padding:"10px 14px",fontSize:13,lineHeight:1.7,background:msg.role==="assistant"?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#1e6b3c,#166534)",borderRadius:msg.role==="assistant"?"4px 16px 16px 16px":"16px 4px 16px 16px",color:"#e8f4f0",border:"1px solid rgba(255,255,255,0.06)"}}>{msg.content}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:10}}><div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#f5a623,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🦅</div><div style={{padding:"10px 16px",background:"rgba(255,255,255,0.05)",borderRadius:"4px 16px 16px 16px"}}><span className="shimmer" style={{display:"inline-block",width:60,height:12,borderRadius:6}}/></div></div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"12px 0",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:10}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pose ta question à Kodjo..." style={{...inputStyle,flex:1}}/>
        <Btn onClick={send} disabled={loading||!input.trim()} color="#f5a623" style={{padding:"11px 18px"}}>↗</Btn>
      </div>
    </div>
  );
};

// ─── COMPETITION ─────────────────────────────────────────────────────────────
const Competition = ({user}) => {
  const isPremium=user.plan==="Premium"||user.isPreview;
  const tp=user.isPreview?{paddingTop:64}:{};
  return (
    <div className="fade-in" style={{padding:"24px 20px",maxWidth:700,margin:"0 auto",...tp}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:48,marginBottom:8}}>🏆</div>
        <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:26,fontWeight:600}}>Compétition Africaine</h2>
        <p style={{color:"#7a9e8e",fontSize:13,marginTop:6}}>Défie les meilleurs élèves de toute l'Afrique francophone</p>
      </div>
      {!isPremium?(
        <Card style={{textAlign:"center",padding:32,border:"1px solid rgba(34,197,94,0.2)"}}>
          <div style={{fontSize:40,marginBottom:12}}>🔒</div>
          <h3 style={{fontWeight:700,marginBottom:8}}>Fonctionnalité Premium</h3>
          <p style={{color:"#7a9e8e",fontSize:13,marginBottom:20}}>Disponible à <strong style={{color:"#22c55e"}}>2 995 FCFA/mois</strong>.</p>
          <Badge color="#22c55e">Passer en Premium</Badge>
        </Card>
      ):(<>
        <Card style={{marginBottom:16,background:"linear-gradient(135deg,rgba(34,197,94,0.08),rgba(59,130,246,0.05))",border:"1px solid rgba(34,197,94,0.2)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><Badge color="#22c55e">🔴 En direct</Badge><div style={{fontWeight:700,fontSize:15,marginTop:8}}>Défi Maths — Fractions</div><div style={{color:"#7a9e8e",fontSize:12,marginTop:4}}>247 élèves · Se termine dans 2h</div></div>
            <Btn color="#22c55e" style={{padding:"10px 18px",fontSize:12}}>Participer</Btn>
          </div>
        </Card>
        <h3 style={{fontSize:13,fontWeight:700,color:"#7a9e8e",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>🌍 Classement continental</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {LEADERBOARD.map(p=>(
            <div key={p.rank} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:p.rank<=3?"rgba(245,166,35,0.06)":"rgba(255,255,255,0.02)",border:p.rank<=3?"1px solid rgba(245,166,35,0.2)":"1px solid rgba(255,255,255,0.06)",borderRadius:12}}>
              <div style={{width:28,textAlign:"center",fontSize:16}}>{p.badge}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{p.name} {p.country}</div></div>
              <div style={{fontWeight:700,fontSize:13,color:"#f5a623"}}>{p.score.toLocaleString()} pts</div>
            </div>
          ))}
        </div>
        <Card style={{marginTop:16,textAlign:"center",border:"1px solid rgba(59,130,246,0.2)"}}>
          <div style={{color:"#7a9e8e",fontSize:12,marginBottom:4}}>Ton classement</div>
          <div style={{fontWeight:700,fontSize:22,color:"#3b82f6"}}>#1 284</div>
          <div style={{color:"#556b5e",fontSize:12,marginTop:4}}>sur 18 432 élèves</div>
        </Card>
      </>)}
      <Footer/>
    </div>
  );
};

// ─── PRICING ─────────────────────────────────────────────────────────────────
const Pricing = ({user,onUpgrade}) => (
  <div className="fade-in" style={{padding:`${user.isPreview?64:24}px 20px 24px`,maxWidth:800,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:28}}>
      <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:26,fontWeight:600}}>Nos abonnements</h2>
      <p style={{color:"#7a9e8e",fontSize:13,marginTop:6}}>Mobile Money ou Visa · Via CinetPay</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginBottom:28}}>
      {PLANS.map(plan=>(
        <div key={plan.id} style={{background:plan.popular?"linear-gradient(135deg,rgba(34,197,94,0.1),rgba(59,130,246,0.05))":"rgba(255,255,255,0.03)",border:plan.popular?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:24,position:"relative"}}>
          {plan.popular&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)"}}><Badge color="#22c55e">⭐ Recommandé</Badge></div>}
          <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{plan.name}</div>
          <div style={{marginBottom:16}}><span style={{fontSize:28,fontWeight:800,color:plan.color}}>{plan.price===0?"Gratuit":plan.price.toLocaleString()}</span>{plan.price>0&&<span style={{color:"#7a9e8e",fontSize:12}}> FCFA/mois</span>}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{plan.features.map(f=><div key={f} style={{display:"flex",gap:8,fontSize:12,color:"#9ca3af"}}><span style={{color:plan.color}}>✓</span>{f}</div>)}</div>
          <Btn color={plan.color} onClick={()=>onUpgrade&&onUpgrade(plan.id)} disabled={user.plan===plan.name} style={{width:"100%",padding:"11px",fontSize:13}}>{user.plan===plan.name?"✓ Plan actuel":plan.cta}</Btn>
        </div>
      ))}
    </div>
    <Card>
      <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>💳 Moyens de paiement — Powered by CinetPay</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
        {[["🇬🇦","Gabon","Airtel · Moov"],["🇨🇲","Cameroun","MTN · Orange"],["🇨🇮","Côte d'Ivoire","MTN · Orange · Wave"],["🇸🇳","Sénégal","Orange · Wave"],["🇨🇩","RDC","M-Pesa · Airtel"],["🌍","Tous pays","Visa · Mastercard"]].map(([f,c,m])=>(
          <div key={c} style={{padding:"10px 12px",background:"rgba(255,255,255,0.03)",borderRadius:10}}>
            <div style={{fontSize:14,marginBottom:4}}>{f} <span style={{fontSize:12,fontWeight:600}}>{c}</span></div>
            <div style={{fontSize:11,color:"#556b5e"}}>{m}</div>
          </div>
        ))}
      </div>
    </Card>
    <Footer/>
  </div>
);

// ─── PROFILE ─────────────────────────────────────────────────────────────────
const Profile = ({user,onLogout}) => (
  <div className="fade-in" style={{padding:`${user.isPreview?64:24}px 20px 24px`,maxWidth:500,margin:"0 auto"}}>
    <div style={{textAlign:"center",marginBottom:28}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#f5a623,#22c55e)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 12px"}}>{user.name[0].toUpperCase()}</div>
      <h2 style={{fontFamily:"'Crimson Pro',serif",fontSize:22,fontWeight:600}}>{user.name}</h2>
      <p style={{color:"#7a9e8e",fontSize:13,marginTop:4}}>{user.email}</p>
      <div style={{marginTop:8}}><Badge color="#f5a623">Plan {user.plan}</Badge></div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {[["🌍 Pays",user.country],["🎓 Niveau",user.level],["📅 Membre depuis","Avril 2026"],["📖 Chapitres complétés","8 / 25"],["🏆 Points","2 340 pts"]].map(([l,v])=>(
        <Card key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px"}}>
          <span style={{fontSize:13,color:"#7a9e8e"}}>{l}</span>
          <span style={{fontSize:13,fontWeight:600}}>{v}</span>
        </Card>
      ))}
    </div>
    {!user.isPreview&&<Btn onClick={onLogout} outline color="#ef4444" style={{width:"100%",marginTop:20,padding:"12px"}}>Se déconnecter</Btn>}
    <Footer/>
  </div>
);

// ─── NAV & TOPBAR ────────────────────────────────────────────────────────────
const NavBar = ({active,onNav}) => (
  <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(6,13,26,0.95)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",justifyContent:"space-around",padding:"8px 0 12px"}}>
    {[{id:"dashboard",icon:"🏠",label:"Accueil"},{id:"chapters",icon:"📚",label:"Cours"},{id:"tutor",icon:"🤖",label:"Kodjo"},{id:"competition",icon:"🏆",label:"Défi"},{id:"profile",icon:"👤",label:"Profil"}].map(t=>(
      <button key={t.id} onClick={()=>onNav(t.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 12px",fontFamily:"Sora,sans-serif"}}>
        <span style={{fontSize:20}}>{t.icon}</span>
        <span style={{fontSize:10,fontWeight:600,color:active===t.id?"#f5a623":"#556b5e"}}>{t.label}</span>
        {active===t.id&&<div style={{width:4,height:4,borderRadius:"50%",background:"#f5a623"}}/>}
      </button>
    ))}
  </div>
);

const TopBar = ({user,screen}) => {
  const titles={dashboard:"",chapters:"Mathématiques",tutor:"Tuteur Kodjo",competition:"Compétition",pricing:"Abonnements",profile:"Mon profil",chapterContent:"Chapitre"};
  return (
    <div style={{position:"sticky",top:user.isPreview?40:0,zIndex:50,background:"rgba(6,13,26,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:20}}>🌍</span>
        <span style={{fontFamily:"'Crimson Pro',serif",fontSize:20,fontWeight:600,background:"linear-gradient(90deg,#f5a623,#22c55e)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>AfriLearn</span>
        {titles[screen]&&<span style={{color:"#556b5e",fontSize:13,marginLeft:4}}>· {titles[screen]}</span>}
      </div>
      <Badge color={user.plan==="Premium"?"#22c55e":user.plan==="Essentiel"?"#f5a623":"#6b7280"}>{user.plan}</Badge>
    </div>
  );
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen] = useState("landing");
  const [user,setUser] = useState(null);
  const [activeChapter,setActiveChapter] = useState(null);
  const [isPreview,setIsPreview] = useState(false);

  const handleAuth = (form) => {
    setUser(form);
    if(form.role==="superadmin"||form.role==="admin"){setScreen("admin");return;}
    setScreen("dashboard");
  };

  const handleNav = (s) => {setActiveChapter(null);setScreen(s);};
  const handleChapter = (ch) => {setActiveChapter(ch);setScreen("chapterContent");};
  const handleUpgrade = (planId) => {
    const names={free:"Gratuit",essential:"Essentiel",premium:"Premium"};
    setUser(u=>({...u,plan:names[planId]}));
  };
  const handlePreview = () => {setIsPreview(true);setScreen("dashboard");};
  const handleBackToAdmin = () => {setIsPreview(false);setScreen("admin");};

  const previewUser = user?{...user,name:"Super Administrateur",plan:"Premium",level:"6ème",country:"Gabon",isPreview:true}:null;
  const activeUser = isPreview?previewUser:user;

  return (
    <>
      <style>{css}</style>
      {screen==="landing"&&<Landing onEnter={s=>setScreen(s)}/>}
      {screen==="login"&&<Auth mode="login" onAuth={handleAuth} onSwitch={()=>setScreen("register")}/>}
      {screen==="register"&&<Auth mode="register" onAuth={handleAuth} onSwitch={()=>setScreen("login")}/>}
      {screen==="admin"&&!isPreview&&user&&<SuperAdmin user={user} onLogout={()=>{setUser(null);setScreen("landing");}} onPreview={handlePreview}/>}
      {activeUser&&!["landing","login","register","admin"].includes(screen)&&(
        <div style={{paddingBottom:80}}>
          {isPreview&&<AdminPreviewBar onBackToAdmin={handleBackToAdmin}/>}
          <TopBar user={activeUser} screen={screen}/>
          {screen==="dashboard"      && <Dashboard    user={activeUser} onNav={handleNav}/>}
          {screen==="chapters"       && <Chapters     user={activeUser} onChapter={handleChapter}/>}
          {screen==="chapterContent" && activeChapter && <ChapterContent chapter={activeChapter} user={activeUser} onBack={()=>setScreen("chapters")} onTutor={()=>setScreen("tutor")}/>}
          {screen==="tutor"          && <Tutor        user={activeUser} chapter={activeChapter}/>}
          {screen==="competition"    && <Competition  user={activeUser}/>}
          {screen==="pricing"        && <Pricing      user={activeUser} onUpgrade={!isPreview?handleUpgrade:null}/>}
          {screen==="profile"        && <Profile      user={activeUser} onLogout={!isPreview?()=>{setUser(null);setScreen("landing");}:null}/>}
          <NavBar active={screen} onNav={handleNav}/>
        </div>
      )}
    </>
  );
}
