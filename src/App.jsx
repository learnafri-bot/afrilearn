import { useState, useRef, useEffect } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const SUPER_ADMIN = { email: "superadmin@afrilearn.com", password: "AfriLearn@2026!", role: "superadmin" };
const ADMIN_ACCOUNTS = [{ email: "admin@afrilearn.com", password: "Admin@2026!", role: "admin", name: "Administrateur" }];
const COUNTRIES = [
  // Afrique centrale
  "Gabon","Cameroun","RDC","Congo","Centrafrique","Tchad","Guinée Équatoriale","São Tomé-et-Príncipe",
  // Afrique de l'Ouest
  "Côte d'Ivoire","Sénégal","Mali","Burkina Faso","Niger","Bénin","Togo","Guinée","Guinée-Bissau","Sierra Leone","Liberia","Ghana","Nigeria","Cap-Vert","Gambie","Mauritanie",
  // Afrique de l'Est
  "Rwanda","Burundi","Kenya","Tanzanie","Ouganda","Éthiopie","Érythrée","Djibouti","Somalie","Soudan","Soudan du Sud",
  // Afrique du Nord
  "Maroc","Algérie","Tunisie","Libye","Égypte",
  // Afrique australe
  "Madagascar","Comores","Maurice","Seychelles","Mozambique","Zimbabwe","Zambie","Malawi","Angola","Namibie","Botswana","Lesotho","Eswatini","Afrique du Sud",
  // Autres
  "Autre pays",
];

// ─── CONTENU PARTIE 1 ─────────────────────────────────────────────────────────
const CHAPTERS_CONTENT = {
  1: {
    id:1, title:"Nombres entiers", duration:"3 semaines",
    objectives:[
      "Lire et écrire les grands nombres entiers jusqu'aux milliards",
      "Comprendre la valeur positionnelle de chaque chiffre",
      "Comparer, ordonner et intercaler des nombres entiers",
      "Encadrer un entier à la dizaine, centaine, millier",
      "Arrondir un entier à l'ordre voulu",
    ],
    cours:[
      { id:"1-1", titre:"Lire et écrire les grands nombres",
        contenu:`Un nombre ENTIER est un nombre qui s'écrit sans virgule : 0, 1, 2, 3, 10, 100, 5 000, 1 000 000...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE TABLEAU DE NUMÉRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les chiffres sont regroupés en CLASSES de 3, de droite à gauche :

  MILLIARDS  │  MILLIONS  │  MILLIERS  │  UNITÉS
  c   d   u  │  c   d  u  │  c   d  u  │  c   d  u

Où : c = centaines, d = dizaines, u = unités

📌 RÈGLE D'ÉCRITURE :
• On sépare les classes par un ESPACE (jamais par un point ou une virgule)
• Les nombres inférieurs à 10 000 s'écrivent sans espace
• Le zéro est important : 3 045 ≠ 345 ≠ 3 450

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIRE UN NOMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour lire 4 725 083 :
→ On lit classe par classe, de gauche à droite
→ 4         = quatre millions
→ 725       = sept cent vingt-cinq mille
→ 083       = quatre-vingt-trois
→ On lit : quatre millions sept cent vingt-cinq mille quatre-vingt-trois

ATTENTION aux zéros !
→ 3 040 005 = trois millions quarante mille cinq
→ 200 300   = deux cent mille trois cents
→ 1 000 001 = un million un

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉCRIRE UN NOMBRE EN CHIFFRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Trois millions deux cent mille quarante-cinq"
→ 3 millions      → 3 dans la classe des millions
→ 200 mille       → 200 dans la classe des milliers
→ quarante-cinq   → 045 dans la classe des unités
→ Résultat : 3 200 045

MÉTHODE : placer les chiffres dans le tableau puis lire de gauche à droite.

🌍 EXEMPLES AFRICAINS :
• Population du Gabon ≈ 2 340 000 hab. → deux millions trois cent quarante mille
• Superficie du Congo = 342 000 km² → trois cent quarante-deux mille
• Distance Dakar-Abidjan ≈ 3 200 km → trois mille deux cents
• Budget annuel d'une école ≈ 50 000 000 FCFA → cinquante millions`,
        exemples:[
          {question:"Écrire en chiffres : trois millions deux cent mille quarante-cinq", reponse:"3 200 045 (attention : 200 mille = 200 dans la classe des milliers, donc 200 045 pour les 5 derniers chiffres)"},
          {question:"Lire en lettres : 15 006 300", reponse:"quinze millions six mille trois cents (les centaines de milliers sont 0, donc on ne les lit pas)"},
          {question:"Écrire en chiffres : deux milliards quatre cents millions", reponse:"2 400 000 000"},
          {question:"Quel est le chiffre des dizaines de milliers dans 3 847 526 ?", reponse:"On compte depuis la droite : u(6), d(2), c(5), m(7), dm(4) → Le chiffre est 4"},
        ]
      },
      { id:"1-2", titre:"Valeur positionnelle et décomposition",
        contenu:`Chaque chiffre dans un nombre a une VALEUR qui dépend de sa POSITION.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALEUR POSITIONNELLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dans le nombre 3 847 526 :
• 3 → 3 millions         = 3 × 1 000 000 = 3 000 000
• 8 → 8 cent. de milliers = 8 × 100 000   =   800 000
• 4 → 4 diz. de milliers  = 4 × 10 000    =    40 000
• 7 → 7 milliers          = 7 × 1 000     =     7 000
• 5 → 5 centaines         = 5 × 100       =       500
• 2 → 2 dizaines          = 2 × 10        =        20
• 6 → 6 unités            = 6 × 1         =         6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉCOMPOSITION D'UN NOMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Décomposer = écrire un nombre comme somme de ses valeurs positionnelles.

3 847 526 = 3 000 000 + 800 000 + 40 000 + 7 000 + 500 + 20 + 6

ATTENTION aux zéros :
52 304 = 50 000 + 2 000 + 300 + 0 + 4
       = 50 000 + 2 000 + 300 + 4
(On n'écrit pas le terme avec 0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPOSITION (sens inverse)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
40 000 + 500 + 3 = ?
→ On place dans le tableau : 4 dans les diz. de milliers, 5 dans les centaines, 3 dans les unités
→ Résultat : 40 503

🌍 EXEMPLES AFRICAINS :
• Le mont Cameroun culmine à 4 095 m
  → 4 095 = 4 000 + 0 + 90 + 5 (le chiffre des centaines est 0 !)
• Le fleuve Congo mesure 4 700 km
  → Chiffre des milliers : 4 — Chiffre des centaines : 7 — Chiffre des dizaines : 0`,
        exemples:[
          {question:"Décomposer 705 040", reponse:"705 040 = 700 000 + 5 000 + 40 (les centaines et unités sont 0)"},
          {question:"Composer : 3 × 100 000 + 4 × 1 000 + 7 × 10 + 2", reponse:"300 000 + 4 000 + 70 + 2 = 304 072"},
          {question:"Quelle est la valeur du chiffre 8 dans 185 430 ?", reponse:"8 est en position des dizaines de milliers → valeur = 80 000"},
        ]
      },
      { id:"1-3", titre:"Comparer et ordonner les entiers",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYMBOLES DE COMPARAISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• <  : est inférieur à (le plus petit est à gauche)
• >  : est supérieur à (le plus grand est à gauche)
• =  : est égal à
• ≤  : est inférieur ou égal à
• ≥  : est supérieur ou égal à

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPARER DEUX ENTIERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE 1 : Le nombre avec le plus de chiffres est le plus grand.
• 5 248 > 987       (4 chiffres > 3 chiffres)
• 12 000 > 9 999    (5 chiffres > 4 chiffres)
• 100 000 > 99 999  (6 chiffres > 5 chiffres)

RÈGLE 2 : Même nombre de chiffres → on compare chiffre par chiffre
de gauche à droite, en s'arrêtant dès qu'ils diffèrent.

Exemple : 3 241 et 3 850
→ Même nombre de chiffres (4)
→ Milliers : 3 = 3 (on continue)
→ Centaines : 2 < 8 (on s'arrête !)
→ Conclusion : 3 241 < 3 850

Exemple : 47 523 et 47 198
→ Même nombre de chiffres (5)
→ Diz. de milliers : 4 = 4
→ Milliers : 7 = 7
→ Centaines : 5 > 1 → 47 523 > 47 198

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDONNER DES NOMBRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ordre CROISSANT : du plus petit au plus grand (↑)
• Ordre DÉCROISSANT : du plus grand au plus petit (↓)

Exemple : Ordonner 3 210 ; 3 021 ; 3 201 ; 3 120
→ Même nombre de chiffres (4), milliers : tous 3
→ Centaines : 2, 0, 2, 1 → on distingue 0 < 1 < 2
→ Ordre croissant : 3 021 < 3 120 < 3 201 < 3 210

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERCALER UN NOMBRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Intercaler = trouver un nombre compris entre deux autres.
Entre 450 et 460 : on peut intercaler 451, 452, ..., 459
Entre 1 000 et 2 000 : on peut intercaler 1 500 par exemple

NOMBRES CONSÉCUTIFS : se suivent (différence de 1)
Ex : 5, 6, 7, 8 sont quatre entiers consécutifs.
Si n est un entier, ses voisins sont n−1 et n+1.

🌍 EXEMPLES AFRICAINS :
• Superficie (km²) : Algérie 2 381 741 > RDC 2 344 858 > Soudan 1 861 484
• Population : Nigeria 220 000 000 > Éthiopie 120 000 000 > Égypte 104 000 000
• Altitude (m) : Kilimandjaro 5 895 > Mont Kenya 5 199 > Mont Cameroun 4 095`,
        exemples:[
          {question:"Comparer 304 521 et 304 512", reponse:"Même nb de chiffres → 3=3, 0=0, 4=4, 5=5, 2>1 → 304 521 > 304 512"},
          {question:"Ordonner dans l'ordre croissant : 50 001 ; 50 100 ; 50 010 ; 50 000", reponse:"50 000 < 50 001 < 50 010 < 50 100"},
          {question:"Trouver 3 entiers entre 999 et 1 003", reponse:"1 000, 1 001, 1 002"},
        ]
      },
      { id:"1-4", titre:"Encadrer et arrondir un entier",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENCADRER UN ENTIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Encadrer = trouver deux nombres (bornes) entre lesquels il se situe.

Encadrement à la DIZAINE :
→ 347 : 340 < 347 < 350
→ 1 852 : 1 850 < 1 852 < 1 860

Encadrement à la CENTAINE :
→ 347 : 300 < 347 < 400
→ 1 852 : 1 800 < 1 852 < 1 900

Encadrement au MILLIER :
→ 3 472 : 3 000 < 3 472 < 4 000
→ 15 630 : 15 000 < 15 630 < 16 000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARRONDIR UN ENTIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arrondir = remplacer par une valeur approchée plus simple.

RÈGLE EN 3 ÉTAPES :
1. Repérer le rang jusqu'auquel on arrondit
2. Regarder le chiffre JUSTE APRÈS ce rang
3. → 0,1,2,3,4 : arrondi INFÉRIEUR (on garde, on met des zéros)
   → 5,6,7,8,9 : arrondi SUPÉRIEUR (on ajoute 1, on met des zéros)

EXEMPLES DÉTAILLÉS :
• 347 à la dizaine    → unités=7 ≥ 5 → supérieur → 350
• 342 à la dizaine    → unités=2 < 5 → inférieur → 340
• 3 472 à la centaine → dizaines=7 ≥ 5 → supérieur → 3 500
• 3 432 à la centaine → dizaines=3 < 5 → inférieur → 3 400
• 45 600 au millier   → centaines=6 ≥ 5 → supérieur → 46 000
• 45 400 au millier   → centaines=4 < 5 → inférieur → 45 000

⚠️ CAS PARTICULIER — La retenue en cascade :
• 9 950 à la centaine → dizaines=5 ≥ 5 → 9 900 + 100 = 10 000
  (le 9 des centaines +1 = 10 → on retient au millier → 10 000)
• 69 950 à la centaine → dizaines=5 ≥ 5 → centaines : 9+1=10
  → milliers : 9+1=10 → diz. de milliers : 6+1=7 → 70 000

🌍 EXEMPLES AFRICAINS :
• Distance Libreville-Yaoundé = 754 km
  → Arrondie à la centaine : 800 km (dizaines=5 ≥ 5)
  → Arrondie à la dizaine : 750 km (unités=4 < 5)
• Prix d'un sac de ciment = 6 350 FCFA
  → Arrondi au millier : 6 000 FCFA (centaines=3 < 5)
• Population de Libreville = 703 904 hab.
  → Arrondie à la centaine : 703 900 (dizaines=0 < 5)
  → Arrondie au millier : 704 000 (centaines=9 ≥ 5)`,
        exemples:[
          {question:"Encadrer 7 283 entre deux centaines consécutives", reponse:"7 200 < 7 283 < 7 300"},
          {question:"Arrondir 6 853 à la centaine", reponse:"Dizaines = 5 ≥ 5 → arrondi supérieur → 6 900"},
          {question:"Arrondir 29 950 au millier", reponse:"Centaines=9 ≥ 5 → 29 000+1 000=30 000 (retenue !)"},
          {question:"Arrondir 4 567 à la dizaine, à la centaine et au millier", reponse:"Dizaine: unités=7≥5 → 4 570 / Centaine: dizaines=6≥5 → 4 600 / Millier: centaines=5≥5 → 5 000"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Écrire en chiffres : cinq millions trois cent mille vingt-deux.", solution:"5 300 022"},
      {id:2,  niveau:"Facile",    enonce:"Lire en lettres le nombre 2 040 005.", solution:"deux millions quarante mille cinq"},
      {id:3,  niveau:"Facile",    enonce:"Quel est le chiffre des milliers dans 743 825 ?", solution:"3 (on compte depuis la droite : u=5, d=2, c=8, m=3)"},
      {id:4,  niveau:"Facile",    enonce:"Écrire le plus grand nombre à 4 chiffres possible avec les chiffres 3, 7, 1, 5 (chaque chiffre une seule fois).", solution:"7 531 (on place les chiffres du plus grand au plus petit)"},
      {id:5,  niveau:"Facile",    enonce:"Comparer avec < ou > : 8 500 __ 8 050", solution:"8 500 > 8 050 (centaines : 5 > 0)"},
      {id:6,  niveau:"Moyen",     enonce:"Ranger dans l'ordre décroissant : 12 300 ; 12 030 ; 12 003 ; 12 330", solution:"12 330 > 12 300 > 12 030 > 12 003"},
      {id:7,  niveau:"Moyen",     enonce:"Décomposer 705 040 en somme de valeurs positionnelles.", solution:"705 040 = 700 000 + 5 000 + 40"},
      {id:8,  niveau:"Moyen",     enonce:"Encadrer 45 673 entre deux milliers consécutifs.", solution:"45 000 < 45 673 < 46 000"},
      {id:9,  niveau:"Moyen",     enonce:"La distance Libreville-Brazzaville est 1 847 km. Arrondir à la centaine.", solution:"Dizaines = 4 < 5 → arrondi inférieur → 1 800 km"},
      {id:10, niveau:"Moyen",     enonce:"Trouver tous les entiers naturels dont l'arrondi à la dizaine est 80.", solution:"Les entiers de 75 à 84 inclus : 75, 76, 77, 78, 79, 80, 81, 82, 83, 84"},
      {id:11, niveau:"Difficile", enonce:"Un commerçant de Douala vend 1 234 sacs de riz à 15 000 FCFA chacun. Calculer le chiffre d'affaires et l'arrondir au million.", solution:"1 234 × 15 000 = 18 510 000 FCFA. Centaines de milliers = 5 ≥ 5 → arrondi supérieur → 19 000 000 FCFA"},
      {id:12, niveau:"Difficile", enonce:"Trouver un nombre de 6 chiffres tel que : le chiffre des dizaines de milliers est 4, le chiffre des unités est 6, et la somme de tous les chiffres est 10.", solution:"On cherche : a b 4 c d 6. a+b+4+c+d+6=10 → a+b+c+d=0. Comme a≠0, une solution : 100 046 (1+0+0+0+4+6=11, non). Essayons : 100 036 → 1+0+0+0+3+6=10 ✓ → 100 036"},
      {id:13, niveau:"Difficile", enonce:"Entre 3 500 000 et 4 000 000, combien y a-t-il de multiples de 100 000 (en incluant les bornes) ?", solution:"3 500 000 ; 3 600 000 ; 3 700 000 ; 3 800 000 ; 3 900 000 ; 4 000 000 → 6 multiples"},
      {id:14, niveau:"Difficile", enonce:"Koffi a 3 billets de 10 000 FCFA, 5 billets de 5 000 FCFA et 7 pièces de 500 FCFA. Calculer son total et l'arrondir au millier.", solution:"3×10 000 + 5×5 000 + 7×500 = 30 000 + 25 000 + 3 500 = 58 500 FCFA. Centaines=5 ≥ 5 → arrondi supérieur → 59 000 FCFA"},
      {id:15, niveau:"Difficile", enonce:"Le stade d'Angondjé à Libreville peut accueillir 40 000 spectateurs. Pour un match, 37 846 personnes sont présentes. Combien de places sont vides ? Arrondir à la centaine.", solution:"40 000 − 37 846 = 2 154 places vides. Dizaines=5 ≥ 5 → arrondi supérieur → 2 200 places"},
    ],
  },
  2: {
    id:2, title:"Nombres décimaux", duration:"3 semaines",
    objectives:[
      "Comprendre la notion de nombre décimal et sa représentation",
      "Lire et écrire les nombres décimaux",
      "Identifier la valeur positionnelle de chaque chiffre après la virgule",
      "Décomposer et recomposer un nombre décimal",
      "Comparer et ordonner des nombres décimaux",
      "Intercaler des décimaux entre deux nombres",
    ],
    cours:[
      { id:"2-1", titre:"Qu'est-ce qu'un nombre décimal ?",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un nombre DÉCIMAL est un nombre qui s'écrit avec une virgule.
Il est composé de deux parties :
• La partie ENTIÈRE (avant la virgule)
• La partie DÉCIMALE (après la virgule)

EXEMPLE : 12,75
• Partie entière : 12
• Partie décimale : 75

📌 En France et en Afrique francophone, on utilise la VIRGULE (12,75).
   En anglais, on utilise le point (12.75) — c'est la même chose !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALEUR POSITIONNELLE APRÈS LA VIRGULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chaque chiffre après la virgule a une valeur qui dépend de sa position :

Position    │ Nom          │ Valeur   │ Exemple dans 3,8472
────────────┼──────────────┼──────────┼────────────────────
1er chiffre │ DIXIÈMES     │ 0,1      │ 8 dixièmes = 0,8
2e chiffre  │ CENTIÈMES    │ 0,01     │ 4 centièmes = 0,04
3e chiffre  │ MILLIÈMES    │ 0,001    │ 7 millièmes = 0,007
4e chiffre  │ DIX-MILLIÈMES│ 0,0001   │ 2 dix-millièmes = 0,0002

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIRE UN NOMBRE DÉCIMAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : on lit la partie entière, on dit "virgule", puis on lit la partie décimale comme un entier.

• 3,7    → "trois virgule sept"
• 12,45  → "douze virgule quarante-cinq"
• 0,08   → "zéro virgule zéro huit"
• 100,5  → "cent virgule cinq"

On peut aussi dire :
• 3,7   = "trois et sept dixièmes"
• 12,45 = "douze et quarante-cinq centièmes"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉCRIRE UN NOMBRE DÉCIMAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Cinq virgule trente-deux" → 5,32
"Zéro virgule zéro cinq"  → 0,05 (attention au zéro des dixièmes !)
"Douze et huit centièmes" → 12,08

⚠️ ATTENTION :
• 0,5 ≠ 0,05 (0,5 = 5 dixièmes ; 0,05 = 5 centièmes)
• 1,3 ≠ 1,03 (1,3 = 1 et 3 dixièmes ; 1,03 = 1 et 3 centièmes)

🌍 EXEMPLES AFRICAINS :
• Le prix du litre d'huile de palme est 1 250,50 FCFA
  → On lit : mille deux cent cinquante virgule cinquante
• La taille moyenne d'un élève de 6ème est 1,52 m
  → On lit : un virgule cinquante-deux mètres
• Le marathon de Libreville fait 42,195 km
  → On lit : quarante-deux virgule cent quatre-vingt-quinze`,
        exemples:[
          {question:"Lire le nombre 0,07", reponse:"zéro virgule zéro sept (ou : sept centièmes)"},
          {question:"Écrire en chiffres : huit virgule zéro quatre", reponse:"8,04 (attention : les dixièmes sont 0, pas 4 !)"},
          {question:"Quelle est la valeur du chiffre 6 dans 14,263 ?", reponse:"6 est en 2e position après la virgule → 6 centièmes = 0,06"},
          {question:"Écrire 5 + 0,3 + 0,07 sous forme décimale", reponse:"5,37"},
        ]
      },
      { id:"2-2", titre:"Décomposer et recomposer un décimal",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉCOMPOSER UN DÉCIMAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Décomposer = écrire le nombre comme une somme de ses valeurs positionnelles.

EXEMPLE : 3,847
3,847 = 3 + 0,8 + 0,04 + 0,007
      = 3 unités + 8 dixièmes + 4 centièmes + 7 millièmes

EXEMPLE : 12,305
12,305 = 10 + 2 + 0,3 + 0,005
       = 1 dizaine + 2 unités + 3 dixièmes + 0 centièmes + 5 millièmes
       (On peut omettre le terme à 0 : 12 + 0,3 + 0,005)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMPOSER UN DÉCIMAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : 4 + 0,6 + 0,02 + 0,001 = ?
→ 4 unités, 6 dixièmes, 2 centièmes, 1 millième
→ 4,621

EXEMPLE : 7 + 0,03 = ?
→ 7 unités, 0 dixième, 3 centièmes
→ 7,03 (ne pas oublier le zéro des dixièmes !)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRACTIONS DÉCIMALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un décimal peut aussi s'écrire comme une fraction :
• 0,1  = 1/10    (un dixième)
• 0,01 = 1/100   (un centième)
• 0,7  = 7/10    (sept dixièmes)
• 0,45 = 45/100  (quarante-cinq centièmes)
• 3,7  = 37/10   (trente-sept dixièmes)
• 2,05 = 205/100 (deux cent cinq centièmes)

CONVERSION : pour convertir un décimal en fraction
→ On écrit tous les chiffres (sans virgule) au numérateur
→ On met 10, 100, 1000... au dénominateur (autant de zéros que de décimales)
Ex : 4,37 = 437/100 ; 0,008 = 8/1000

🌍 EXEMPLES AFRICAINS :
• Un tissu pagne mesure 2,5 m = 25/10 m = 5/2 m
• La masse d'une mangue est 0,35 kg = 35/100 kg = 7/20 kg`,
        exemples:[
          {question:"Décomposer 15,047", reponse:"15,047 = 10 + 5 + 0,04 + 0,007 = 1 dizaine + 5 unités + 4 centièmes + 7 millièmes"},
          {question:"Recomposer : 2 + 0,05 + 0,003", reponse:"2,053 (attention : 0 dixième → 2,053 et non 2,53)"},
          {question:"Écrire 0,45 comme fraction", reponse:"45/100 (2 décimales → dénominateur 100)"},
        ]
      },
      { id:"2-3", titre:"Comparer et ordonner les décimaux",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉ FONDAMENTALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On peut ajouter des ZÉROS à droite de la partie décimale sans changer la valeur.
• 3,5 = 3,50 = 3,500 = 3,5000
• 0,8 = 0,80 = 0,800

⚠️ ATTENTION : on ne peut PAS ajouter de zéros avant la partie décimale !
• 3,5 ≠ 3,05 (3,5 = 3 et 5 dixièmes ; 3,05 = 3 et 5 centièmes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE DE COMPARAISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 1 : Comparer les parties entières.
→ Si différentes, le plus grand entier donne le plus grand décimal.
→ 4,7 > 3,9 car 4 > 3 (même si 9 > 7 après la virgule !)

ÉTAPE 2 : Si parties entières égales, comparer les dixièmes.
→ 2,85 > 2,35 car les dixièmes : 8 > 3

ÉTAPE 3 : Si dixièmes égaux, comparer les centièmes. Etc.
→ 2,35 > 2,34 car les centièmes : 5 > 4

ASTUCE : On peut égaliser le nombre de décimales en ajoutant des zéros,
puis comparer comme des entiers.
Ex : comparer 0,3 et 0,25
→ 0,30 et 0,25 → 30 > 25 → donc 0,3 > 0,25

⚠️ ERREUR FRÉQUENTE :
Ne jamais comparer les parties décimales comme des entiers !
0,9 > 0,75 car 0,90 > 0,75 (et non pas parce que 9 < 75 !)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDONNER DES DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : égaliser le nombre de décimales, puis ordonner comme des entiers.

Exemple : ordonner 2,5 ; 2,15 ; 2,51 ; 2,05
→ On égalise : 2,50 ; 2,15 ; 2,51 ; 2,05
→ On compare les parties entières : toutes = 2
→ On compare les dixièmes : 5, 1, 5, 0
→ Ordre croissant : 2,05 < 2,15 < 2,50 < 2,51

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERCALER DES DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entre 2,3 et 2,4 on peut intercaler : 2,31 ; 2,35 ; 2,38... (infinité de valeurs !)
Entre 0,5 et 0,6 : 0,51 ; 0,55 ; 0,59...

🌍 EXEMPLES AFRICAINS :
• Riz : 850,75 FCFA/kg — Farine : 850,50 FCFA/kg
  → 850,75 > 850,50 → le riz est plus cher
• Hauteurs (m) : Koffi 1,48 m, Aminata 1,53 m, Jean 1,5 m
  → Ordre croissant : 1,48 < 1,50 < 1,53 → Koffi < Jean < Aminata
• Temps de course (s) : 9,58 ; 9,69 ; 9,72 ; 9,84
  → Le plus rapide a le temps le plus petit → 9,58 s gagne`,
        exemples:[
          {question:"Comparer 3,07 et 3,7", reponse:"3,07 = 3,07 et 3,7 = 3,70 → dixièmes : 0 < 7 → 3,07 < 3,7 (erreur fréquente : croire que 7 < 07 !)"},
          {question:"Ordonner dans l'ordre croissant : 2,5 ; 2,15 ; 2,51 ; 2,05", reponse:"On égalise : 2,50 ; 2,15 ; 2,51 ; 2,05 → 2,05 < 2,15 < 2,50 < 2,51"},
          {question:"Intercaler 3 décimaux entre 1,2 et 1,3", reponse:"Par exemple : 1,21 ; 1,25 ; 1,28 (plusieurs réponses possibles)"},
          {question:"Est-ce que 0,30 = 0,3 ?", reponse:"Oui ! 0,30 = 0,3 car les zéros à droite de la partie décimale ne changent pas la valeur."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Écrire en chiffres : quatre virgule cinquante-deux.", solution:"4,52"},
      {id:2,  niveau:"Facile",    enonce:"Quelle est la valeur du chiffre 3 dans 15,038 ?", solution:"3 est en 2e position après la virgule → 3 centièmes = 0,03"},
      {id:3,  niveau:"Facile",    enonce:"Décomposer 7,34 en unités, dixièmes et centièmes.", solution:"7,34 = 7 + 0,3 + 0,04 = 7 unités + 3 dixièmes + 4 centièmes"},
      {id:4,  niveau:"Facile",    enonce:"Est-ce que 4,50 = 4,5 ? Justifier.", solution:"Oui car on peut ajouter des zéros à droite de la partie décimale sans changer la valeur : 4,5 = 4,50"},
      {id:5,  niveau:"Facile",    enonce:"Comparer avec < , > ou = : 0,9 __ 0,90", solution:"0,9 = 0,90 (zéro à droite ne change pas la valeur)"},
      {id:6,  niveau:"Moyen",     enonce:"Ranger dans l'ordre décroissant : 3,14 ; 3,41 ; 3,04 ; 3,4", solution:"On égalise : 3,14 ; 3,41 ; 3,04 ; 3,40 → Ordre décroissant : 3,41 > 3,40 > 3,14 > 3,04"},
      {id:7,  niveau:"Moyen",     enonce:"Trouver deux décimaux à 2 décimales compris entre 2,3 et 2,4.", solution:"Exemple : 2,31 et 2,37 (toute valeur entre 2,30 et 2,40 est correcte)"},
      {id:8,  niveau:"Moyen",     enonce:"Au marché, le pain coûte 250,50 FCFA et le lait 250,05 FCFA. Lequel est plus cher ?", solution:"Parties entières égales (250). Dixièmes : 5 > 0 → 250,50 > 250,05 → le pain est plus cher."},
      {id:9,  niveau:"Moyen",     enonce:"Écrire sous forme décimale : 8 + 4/10 + 7/100", solution:"8 + 0,4 + 0,07 = 8,47"},
      {id:10, niveau:"Moyen",     enonce:"Combien de centièmes y a-t-il dans 3,75 ?", solution:"3,75 = 375/100 → il y a 375 centièmes dans 3,75"},
      {id:11, niveau:"Difficile", enonce:"Aminata mesure 1,53 m, Jean mesure 1,48 m et Kofi mesure 1,5 m. Les ranger du plus grand au plus petit.", solution:"On égalise : 1,53 ; 1,48 ; 1,50 → Ordre décroissant : 1,53 > 1,50 > 1,48 → Aminata > Kofi > Jean"},
      {id:12, niveau:"Difficile", enonce:"Donner tous les décimaux à 1 décimale strictement compris entre 4 et 5.", solution:"4,1 ; 4,2 ; 4,3 ; 4,4 ; 4,5 ; 4,6 ; 4,7 ; 4,8 ; 4,9 (9 valeurs au total)"},
      {id:13, niveau:"Difficile", enonce:"Un élève affirme que 0,3 > 0,25 car 25 > 3. A-t-il raison ? Expliquer.", solution:"Non, il a tort dans son raisonnement mais raison dans le résultat ! 0,3 = 0,30 et 0,30 > 0,25 (dixièmes : 3 > 2). Il ne faut pas comparer 3 et 25 directement."},
      {id:14, niveau:"Difficile", enonce:"Au marathon de Libreville, les temps des 3 premiers sont : 2h15,4min ; 2h15,04min ; 2h14,9min. Classer du plus rapide au moins rapide.", solution:"Plus petit temps = plus rapide. On compare : 2h14,9 < 2h15,04 < 2h15,4 → Classement : 2h14,9min ; 2h15,04min ; 2h15,4min"},
      {id:15, niveau:"Difficile", enonce:"Trouver le plus grand et le plus petit décimal à 2 décimales dont la partie entière est 6 et dont la somme des deux chiffres après la virgule est 7.", solution:"Les paires (a,b) avec a+b=7 : (0,7),(1,6),(2,5),(3,4),(4,3),(5,2),(6,1),(7,0). Plus grand : 6,70 (dixième=7 max). Plus petit : 6,07 (dixième=0 min)."},
    ],
  },
  3: {
    id:3, title:"Arrondir les nombres", duration:"2 semaines",
    objectives:[
      "Comprendre la notion de valeur approchée",
      "Encadrer un décimal entre deux valeurs consécutives",
      "Arrondir un décimal à l'unité, au dixième, au centième, au millième",
      "Distinguer arrondi inférieur et arrondi supérieur",
      "Utiliser les arrondis dans des situations concrètes de la vie quotidienne",
    ],
    cours:[
      { id:"3-1", titre:"Valeur approchée et encadrement",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POURQUOI ARRONDIR ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dans la vie quotidienne, on n'a pas toujours besoin d'une valeur exacte.
On utilise alors une VALEUR APPROCHÉE, plus simple à manipuler.

Exemples de situations réelles :
• "La distance est d'environ 50 km" (plutôt que 47,3 km)
• "Ce produit coûte environ 1 500 FCFA" (plutôt que 1 487,50 FCFA)
• "Il y avait environ 40 000 spectateurs" (plutôt que 38 462)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENCADRER UN DÉCIMAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Encadrer un décimal c'est trouver deux valeurs entre lesquelles il se situe.

ENCADREMENT ENTRE DEUX ENTIERS CONSÉCUTIFS :
• 3,7  → 3 < 3,7 < 4    (entre 3 et 4)
• 12,4 → 12 < 12,4 < 13 (entre 12 et 13)
• 0,9  → 0 < 0,9 < 1    (entre 0 et 1)

ENCADREMENT ENTRE DEUX DIXIÈMES CONSÉCUTIFS :
• 3,47  → 3,4 < 3,47 < 3,5
• 12,83 → 12,8 < 12,83 < 12,9
• 0,52  → 0,5 < 0,52 < 0,6

ENCADREMENT ENTRE DEUX CENTIÈMES CONSÉCUTIFS :
• 3,472 → 3,47 < 3,472 < 3,48
• 0,305 → 0,30 < 0,305 < 0,31

MÉTHODE RAPIDE : on garde les chiffres jusqu'au rang voulu,
puis on ajoute 1 pour la borne supérieure.

🌍 EXEMPLES AFRICAINS :
• Le mont Cameroun (4 095 m) est entre 4 000 m et 5 000 m
• Le prix du litre de carburant (680,45 FCFA) est entre 680 et 681 FCFA
• La taille d'Aminata (1,53 m) est entre 1,5 m et 1,6 m`,
        exemples:[
          {question:"Encadrer 7,35 entre deux entiers consécutifs", reponse:"7 < 7,35 < 8"},
          {question:"Encadrer 3,472 entre deux dixièmes consécutifs", reponse:"3,4 < 3,472 < 3,5"},
          {question:"Encadrer 0,067 entre deux centièmes consécutifs", reponse:"0,06 < 0,067 < 0,07"},
          {question:"Encadrer 15,999 entre deux entiers consécutifs", reponse:"15 < 15,999 < 16"},
        ]
      },
      { id:"3-2", titre:"Arrondir un nombre décimal",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arrondir un nombre c'est le remplacer par une valeur approchée simple,
en choisissant la valeur la plus proche parmi les bornes de son encadrement.

On distingue :
• L'arrondi INFÉRIEUR : on prend la borne la plus petite
• L'arrondi SUPÉRIEUR : on prend la borne la plus grande
• L'arrondi AU PLUS PROCHE : on prend la borne la plus proche

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE D'ARRONDI AU PLUS PROCHE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 1 : Repérer le rang jusqu'auquel on veut arrondir
ÉTAPE 2 : Observer le chiffre qui se trouve JUSTE APRÈS ce rang
ÉTAPE 3 : Appliquer la règle :
  → Ce chiffre est 0, 1, 2, 3 ou 4 → ARRONDI INFÉRIEUR
    (on garde le chiffre du rang, on remplace tout ce qui suit par des zéros)
  → Ce chiffre est 5, 6, 7, 8 ou 9 → ARRONDI SUPÉRIEUR
    (on ajoute 1 au chiffre du rang, on remplace tout ce qui suit par des zéros)

MOYEN MNÉMOTECHNIQUE : "0 à 4, on arrondit en bas ; 5 à 9, on arrondit en haut"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARRONDIR À L'UNITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On observe le chiffre des DIXIÈMES (1er chiffre après la virgule).

• 3,2  → dixième = 2 < 5 → inférieur → 3
• 3,7  → dixième = 7 ≥ 5 → supérieur → 4
• 8,5  → dixième = 5 ≥ 5 → supérieur → 9
• 12,49 → dixième = 4 < 5 → inférieur → 12
• 9,99  → dixième = 9 ≥ 5 → supérieur → 10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARRONDIR AU DIXIÈME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On observe le chiffre des CENTIÈMES (2e chiffre après la virgule).

• 3,42  → centième = 2 < 5 → inférieur → 3,4
• 3,47  → centième = 7 ≥ 5 → supérieur → 3,5
• 12,85 → centième = 5 ≥ 5 → supérieur → 12,9
• 0,731 → centième = 3 < 5 → inférieur → 0,7
• 5,999 → centième = 9 ≥ 5 → dixième 9+1=10 → retenue → 6,0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARRONDIR AU CENTIÈME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On observe le chiffre des MILLIÈMES (3e chiffre après la virgule).

• 2,343  → millième = 3 < 5 → inférieur → 2,34
• 2,346  → millième = 6 ≥ 5 → supérieur → 2,35
• 3,1450 → millième = 5 ≥ 5 → supérieur → 3,15
• 7,8974 → millième = 7 ≥ 5 → supérieur → 7,90

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ CAS PARTICULIER : LA RETENUE EN CASCADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quand le chiffre du rang est 9 et qu'on arrondit au supérieur,
la retenue se propage vers la gauche !

EXEMPLE : arrondir 9,97 au dixième
→ centième = 7 ≥ 5 → dixième : 9 + 1 = 10
→ retenue : unités = 9 + 1 = 10 → retenue → 10,0
→ Résultat : 10,0

EXEMPLE : arrondir 5,995 au centième
→ millième = 5 ≥ 5 → centième : 9 + 1 = 10
→ retenue : dixième : 9 + 1 = 10
→ retenue : unités : 5 + 1 = 6
→ Résultat : 6,00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rang d'arrondi  │ On observe      │ Exemple : 3,4762
────────────────┼─────────────────┼──────────────────
À l'unité       │ les dixièmes    │ 4 < 5 → 3
Au dixième      │ les centièmes   │ 7 ≥ 5 → 3,5
Au centième     │ les millièmes   │ 6 ≥ 5 → 3,48
Au millième     │ les dix-millièmes│ 2 < 5 → 3,476

🌍 EXEMPLES AFRICAINS :
• Carburant à 680,45 FCFA/L
  → À l'unité : 680 FCFA (dixième=4 < 5)
  → À la dizaine : 680 FCFA (unités=0 < 5)

• Distance Libreville-Oyem = 476,3 km
  → À l'unité : 476 km (dixième=3 < 5)
  → À la dizaine : 480 km (unités=6 ≥ 5)

• Taille d'un élève : 1,537 m
  → Au dixième : 1,5 m (centième=3 < 5)
  → Au centième : 1,54 m (millième=7 ≥ 5)`,
        exemples:[
          {question:"Arrondir 7,38 au dixième", reponse:"Centième=8 ≥ 5 → arrondi supérieur → 7,4"},
          {question:"Arrondir 15,245 au centième", reponse:"Millième=5 ≥ 5 → arrondi supérieur → 15,25"},
          {question:"Arrondir 9,951 à l'unité", reponse:"Dixième=9 ≥ 5 → arrondi supérieur → 10"},
          {question:"Arrondir 4,7652 au centième", reponse:"Millième=5 ≥ 5 → centième 6+? Non : centième=6, millième=5 → 4,77 ... Attention : centième=6, millième=5 ≥ 5 → centième+1=7 → 4,77"},
          {question:"Arrondir 9,97 au dixième", reponse:"Centième=7 ≥ 5 → dixième=9+1=10 → retenue → 10,0"},
        ]
      },
      { id:"3-3", titre:"Applications pratiques des arrondis",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UTILITÉ DES ARRONDIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les arrondis sont utilisés dans de nombreuses situations :

1. ESTIMATION DE CALCUL
Avant de calculer, on arrondit les nombres pour vérifier que le résultat est raisonnable.
Ex : 48,7 + 23,4 ≈ 49 + 23 = 72 → résultat attendu proche de 72

2. MESURES ET SCIENCES
Les mesures ne sont jamais exactes. On donne toujours une valeur arrondie.
Ex : La taille d'un bâtiment ≈ 12,5 m (au dixième de mètre)

3. FINANCES ET COMMERCE
Les prix sont souvent arrondis pour faciliter les transactions.
Ex : 1 487,50 FCFA arrondi à 1 500 FCFA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ATTENTION AUX ARRONDIS SUCCESSIFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arrondir plusieurs fois de suite peut donner un résultat différent
d'un arrondi direct !

EXEMPLE : arrondir 3,45 à l'unité
→ Arrondi DIRECT à l'unité : dixième=4 < 5 → 3
→ Arrondi AU DIXIÈME d'abord : centième=5 ≥ 5 → 3,5
  Puis arrondi À L'UNITÉ : dixième=5 ≥ 5 → 4
→ Les deux méthodes donnent des résultats DIFFÉRENTS (3 ≠ 4) !

📌 RÈGLE : Toujours arrondir directement au rang voulu, sans passer par les rangs intermédiaires.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDRE DE GRANDEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'ordre de grandeur est l'arrondi à la puissance de 10 la plus proche.
C'est l'arrondi le plus "grossier", utilisé pour les estimations rapides.

• 47   → ordre de grandeur : 50 (dizaine)
• 347  → ordre de grandeur : 300 (centaine)
• 3 472 → ordre de grandeur : 3 000 (millier)
• 0,7  → ordre de grandeur : 1 (unité)
• 0,07 → ordre de grandeur : 0,1 (dixième)

🌍 EXEMPLES AFRICAINS :
• Budget familial mensuel : 285 000 FCFA
  → Ordre de grandeur : 300 000 FCFA
• Population du Gabon : 2 340 000 hab.
  → Ordre de grandeur : 2 000 000 hab.
• Prix d'un repas : 1 750 FCFA
  → Ordre de grandeur : 2 000 FCFA`,
        exemples:[
          {question:"Donner l'ordre de grandeur de 4 732", reponse:"5 000 (centaines=7 ≥ 5 → millier supérieur)"},
          {question:"Estimation : 29,8 + 47,3 + 15,6 ≈ ?", reponse:"≈ 30 + 47 + 16 = 93 (résultat exact : 92,7, estimation cohérente ✓)"},
          {question:"Le problème des arrondis successifs : arrondir 2,45 au dixième puis à l'unité. Comparer avec un arrondi direct à l'unité.", reponse:"Via dixième : 2,45→2,5→3. Direct : dixième=4<5→2. Résultats différents ! On préfère l'arrondi direct."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Arrondir 4,7 à l'unité.", solution:"Dixième=7 ≥ 5 → arrondi supérieur → 5"},
      {id:2,  niveau:"Facile",    enonce:"Arrondir 3,42 à l'unité.", solution:"Dixième=4 < 5 → arrondi inférieur → 3"},
      {id:3,  niveau:"Facile",    enonce:"Arrondir 6,38 au dixième.", solution:"Centième=8 ≥ 5 → arrondi supérieur → 6,4"},
      {id:4,  niveau:"Facile",    enonce:"Arrondir 2,53 au dixième.", solution:"Centième=3 < 5 → arrondi inférieur → 2,5"},
      {id:5,  niveau:"Facile",    enonce:"Encadrer 3,7 entre deux entiers consécutifs.", solution:"3 < 3,7 < 4"},
      {id:6,  niveau:"Moyen",     enonce:"Arrondir 14,356 au centième.", solution:"Millième=6 ≥ 5 → centième+1 → 14,36"},
      {id:7,  niveau:"Moyen",     enonce:"Arrondir 8,999 au dixième.", solution:"Centième=9 ≥ 5 → dixième=9+1=10 → retenue → 9,0 = 9"},
      {id:8,  niveau:"Moyen",     enonce:"Encadrer 5,47 entre deux dixièmes consécutifs puis arrondir au dixième.", solution:"Encadrement : 5,4 < 5,47 < 5,5. Arrondi : centième=7 ≥ 5 → 5,5"},
      {id:9,  niveau:"Moyen",     enonce:"Un tronc d'arbre mesure 3,475 m. Donner sa longueur arrondie au dixième.", solution:"Centième=7 ≥ 5 → arrondi supérieur → 3,5 m"},
      {id:10, niveau:"Moyen",     enonce:"Le manioc coûte 357,6 FCFA/kg. Arrondir à l'unité et à la dizaine.", solution:"À l'unité : dixième=6 ≥ 5 → 358 FCFA. À la dizaine : unités=8 ≥ 5 → 360 FCFA"},
      {id:11, niveau:"Difficile", enonce:"Trouver tous les décimaux à 2 décimales dont l'arrondi à l'unité est 5 ET l'arrondi au dixième est 4,8.", solution:"Il faut : 4,75 ≤ x < 5,5 (pour arrondi unité=5) ET 4,75 ≤ x < 4,85 (pour arrondi dixième=4,8). Intersection : 4,75 ≤ x < 4,85. Valeurs : 4,75 ; 4,76 ; 4,77 ; 4,78 ; 4,79 ; 4,80 ; 4,81 ; 4,82 ; 4,83 ; 4,84"},
      {id:12, niveau:"Difficile", enonce:"Le périmètre d'un terrain est 125,48 m. Arrondir d'abord au dixième, puis à l'unité. Comparer avec un arrondi direct à l'unité.", solution:"Via dixième : 125,48→125,5 (centième=8≥5), puis 125,5→126 (dixième=5≥5). Direct à l'unité : dixième=4<5 → 125. Résultats différents (126≠125) ! Toujours arrondir directement."},
      {id:13, niveau:"Difficile", enonce:"On divise 100 FCFA en 3 parts égales. Arrondir chaque part au centième. Quel problème apparaît ?", solution:"100 ÷ 3 = 33,333... FCFA. Arrondi au centième : 33,33 FCFA. Vérification : 3 × 33,33 = 99,99 FCFA. Problème : il manque 0,01 FCFA ! C'est l'erreur d'arrondi cumulée."},
      {id:14, niveau:"Difficile", enonce:"Un athlète court le 100 m en 11,47 s. Le record d'Afrique est 11,5 s. Bat-il le record ? Et si on arrondit les deux temps au dixième ?", solution:"Sans arrondi : 11,47 < 11,5 → oui, il bat le record. Avec arrondi au dixième : 11,47→11,5 et 11,5→11,5 → les deux sont égaux. L'arrondi masque la différence ! On doit garder la précision maximale pour les records."},
      {id:15, niveau:"Difficile", enonce:"Trouver trois nombres décimaux différents dont : l'arrondi à l'unité est 7 pour chacun, et dont la somme exacte est 21.", solution:"On cherche trois nombres dans [6,5 ; 7,5[. Ex : 6,6 + 7,2 + 7,2 = 21 ✓ (arrondis : 7+7+7=21). Autre exemple : 6,5 + 7,0 + 7,5 = 21 ✓. Attention : 7,5 s'arrondit à 8, donc invalide ! Solution valide : 6,8 + 7,1 + 7,1 = 21 ✓"},
    ],
  },
  4: {
    id:4, title:"Addition et soustraction", duration:"3 semaines",
    objectives:[
      "Maîtriser les propriétés de l'addition et de la soustraction",
      "Poser et effectuer des additions et soustractions en colonnes",
      "Additionner et soustraire des nombres décimaux",
      "Vérifier un résultat par estimation ou par la preuve",
      "Résoudre des problèmes faisant appel à ces opérations",
    ],
    cours:[
      { id:"4-1", titre:"L'addition — Définition et propriétés",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'addition est l'opération qui permet de réunir plusieurs quantités en une seule.
• Les nombres qu'on additionne s'appellent les TERMES (ou les addends)
• Le résultat s'appelle la SOMME

VOCABULAIRE :
  terme + terme = somme
  a    +    b   =  a + b

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉS DE L'ADDITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. COMMUTATIVITÉ : l'ordre des termes ne change pas la somme.
   a + b = b + a
   Ex : 5 + 3 = 3 + 5 = 8

2. ASSOCIATIVITÉ : on peut regrouper les termes comme on veut.
   (a + b) + c = a + (b + c)
   Ex : (3 + 4) + 6 = 3 + (4 + 6) = 13

3. ÉLÉMENT NEUTRE : ajouter 0 ne change pas un nombre.
   a + 0 = a
   Ex : 7 + 0 = 7

📌 CES PROPRIÉTÉS PERMETTENT DE CALCULER PLUS VITE !
Ex : 37 + 48 + 63 = 37 + 63 + 48 = 100 + 48 = 148 (on regroupe 37+63=100)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITION POSÉE EN COLONNES (ENTIERS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE :
1. On aligne les chiffres de même rang (unités sous unités, dizaines sous dizaines...)
2. On additionne de droite à gauche
3. Si la somme d'une colonne ≥ 10, on écrit le chiffre des unités et on retient la dizaine

EXEMPLE : 4 537 + 2 846
    4 5 3 7
  + 2 8 4 6
  ─────────
Unités      : 7 + 6 = 13 → on écrit 3, on retient 1
Dizaines    : 3 + 4 + 1 = 8 → on écrit 8
Centaines   : 5 + 8 = 13 → on écrit 3, on retient 1
Milliers    : 4 + 2 + 1 = 7 → on écrit 7
    = 7 3 8 3

VÉRIFICATION : 7 383 − 2 846 = 4 537 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITION DE DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE FONDAMENTALE : On aligne TOUJOURS les virgules les unes sous les autres.
→ Cela garantit que les chiffres de même rang sont bien alignés.

MÉTHODE EN 4 ÉTAPES :
1. Aligner les virgules en colonne
2. Compléter avec des ZÉROS les cases vides (pour ne pas se tromper)
3. Additionner colonne par colonne, de droite à gauche
4. Placer la virgule dans le résultat (à la même position que dans les termes)

EXEMPLE : 12,5 + 3,47
  Étape 1 & 2 : on aligne et complète
      12,50
    +  3,47
    ──────
  Étape 3 : on additionne
  Centièmes   : 0 + 7 = 7
  Dixièmes    : 5 + 4 = 9
  Virgule
  Unités      : 2 + 3 = 5
  Dizaines    : 1 + 0 = 1
  Résultat    : 15,97

EXEMPLE AVEC RETENUE : 8,75 + 4,68
      8,75
    + 4,68
    ──────
  Centièmes : 5+8=13 → 3 retenu 1
  Dixièmes  : 7+6+1=14 → 4 retenu 1
  Unités    : 8+4+1=13 → 3 retenu 1
  Dizaines  : 0+0+1=1
  = 13,43

EXEMPLE À 3 TERMES : 0,8 + 1,35 + 4,007
  On aligne : 0,800 + 1,350 + 4,007
      0,800
      1,350
    + 4,007
    ──────
  Millièmes : 0+0+7=7
  Centièmes : 0+5+0=5
  Dixièmes  : 8+3+0=11 → 1 retenu 1
  Unités    : 0+1+4+1=6
  = 6,157

🌍 EXEMPLES AFRICAINS :
• Maman achète au marché : poisson 2 500,50 FCFA + légumes 750,25 FCFA + pain 350 FCFA
  → 2 500,50 + 750,25 + 350,00 = 3 600,75 FCFA
• Distances parcourues dans la semaine : 12,5 km + 8,75 km + 15 km
  → 12,50 + 8,75 + 15,00 = 36,25 km`,
        exemples:[
          {question:"Calculer 45,3 + 8,75", reponse:"45,30 + 8,75 = 54,05 (dixièmes : 3+7=10 → 0 retenu 1 ; unités : 5+8+1=14 → 4 retenu 1 ; dizaines : 4+0+1=5)"},
          {question:"Calculer 100 + 3,05 + 0,8", reponse:"100,00 + 3,05 + 0,80 = 103,85"},
          {question:"Astuce de calcul : 37 + 48 + 63 + 52", reponse:"On regroupe : (37+63) + (48+52) = 100 + 100 = 200"},
        ]
      },
      { id:"4-2", titre:"La soustraction — Définition et propriétés",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La soustraction est l'opération inverse de l'addition.
Elle permet de trouver la différence entre deux nombres, ou de retirer une quantité.

VOCABULAIRE :
  diminuende − diminuteur = différence
       a     −     b      =   a − b

  (en pratique on dit juste : terme − terme = différence)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉS DE LA SOUSTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ATTENTION : La soustraction N'EST PAS commutative !
   a − b ≠ b − a (en général)
   Ex : 8 − 3 = 5  mais  3 − 8 = −5 (résultat négatif !)

⚠️ La soustraction N'EST PAS associative non plus !
   (8 − 3) − 2 = 5 − 2 = 3
   8 − (3 − 2) = 8 − 1 = 7 → résultats différents !

📌 PROPRIÉTÉ UTILE : Soustraire un nombre c'est comme additionner son opposé.
   a − b = a + (−b)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIEN ADDITION-SOUSTRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Addition et soustraction sont des opérations INVERSES.
Si a + b = c, alors c − b = a et c − a = b.

Ex : 5 + 3 = 8 → 8 − 3 = 5 et 8 − 5 = 3

C'est la BASE DE LA VÉRIFICATION :
Pour vérifier 15,3 − 7,48 = 7,82, on vérifie que 7,82 + 7,48 = 15,30 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOUSTRACTION POSÉE EN COLONNES (ENTIERS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : on soustrait de droite à gauche. Si le chiffre du haut est plus petit que celui du bas, on "emprunte" à la colonne de gauche.

EXEMPLE : 7 234 − 3 856
    7 2 3 4
  − 3 8 5 6
  ─────────
Unités    : 4 < 6 → on emprunte : 14−6=8
Dizaines  : 2 (emprunté → 1) : 1 < 5 → on emprunte : 11−5=6... 
Attention : 3−1(emprunté)=2 < 5 → on emprunte : 12−5=7... 

Détail complet :
U : 4−6 → emprunt : 14−6=8 (on retient −1 aux dizaines)
D : 3−1(emprunt)=2; 2−5 → emprunt : 12−5=7 (on retient −1 aux centaines)  
C : 2−1(emprunt)=1; 1−8 → emprunt : 11−8=3 (on retient −1 aux milliers)
M : 7−1(emprunt)=6; 6−3=3

Résultat : 3 378
Vérif : 3 378 + 3 856 = 7 234 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOUSTRACTION DE DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÊME MÉTHODE qu'avec les entiers, mais on aligne les virgules.

MÉTHODE EN 4 ÉTAPES :
1. Aligner les virgules
2. Compléter avec des zéros (TRÈS IMPORTANT pour ne pas se tromper)
3. Soustraire de droite à gauche (avec emprunts si nécessaire)
4. Placer la virgule dans le résultat

EXEMPLE : 15,3 − 7,48
  Étape 1 & 2 :
      15,30    ← on ajoute un zéro aux centièmes
    −  7,48
    ──────
  Centièmes : 0−8 → emprunt : 10−8=2 (−1 aux dixièmes)
  Dixièmes  : 3−1=2; 2−4 → emprunt : 12−4=8 (−1 aux unités)
  Unités    : 5−1=4; 4−7 → emprunt : 14−7=7 (−1 aux dizaines)
  Dizaines  : 1−1=0; 0−0=0
  = 7,82
  Vérif : 7,82 + 7,48 = 15,30 ✓

EXEMPLE DÉLICAT : 20 − 3,75
      20,00    ← très important d'écrire tous les zéros
    −  3,75
    ──────
  Centièmes : 0−5 → emprunt : 10−5=5 (−1)
  Dixièmes  : 0−1=−1; −1−7 → emprunt : 10−1−7=2 (−1)
  Unités    : 0−1=−1; −1−3 → emprunt : 10−1−3=6 (−1)
  Dizaines  : 2−1=1; 1−0=1
  = 16,25
  Vérif : 16,25 + 3,75 = 20,00 ✓

🌍 EXEMPLES AFRICAINS :
• Papa a 10 000 FCFA. Il achète du pain à 1 250,75 FCFA.
  Reste : 10 000,00 − 1 250,75 = 8 749,25 FCFA
• Distance totale : 42,195 km. Déjà couru : 27,8 km.
  Reste : 42,195 − 27,800 = 14,395 km`,
        exemples:[
          {question:"Calculer 20 − 3,75", reponse:"20,00 − 3,75 = 16,25 (vérif : 16,25 + 3,75 = 20 ✓)"},
          {question:"Calculer 8,4 − 2,85", reponse:"8,40 − 2,85 = 5,55 (centièmes : 0−5 emprunt 10−5=5 ; dixièmes : 3−1=2, 2−8 emprunt 12−8=4 ; unités : 7−2=5)"},
          {question:"Calculer 100 − 0,001", reponse:"100,000 − 0,001 = 99,999"},
        ]
      },
      { id:"4-3", titre:"Calcul mental et résolution de problèmes",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNIQUES DE CALCUL MENTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. COMPLÉMENTS À 10, 100, 1 000 :
   Ex : pour calculer 8 + ? = 10 → réponse : 2 (complément de 8 à 10)
   Utile pour : 47 + 53 = 100 ; 3,7 + 6,3 = 10 ; 0,25 + 0,75 = 1

2. DÉCOMPOSITION :
   Ex : 7,5 + 3,8 = 7,5 + 3 + 0,8 = 10,5 + 0,8 = 11,3
        37 + 48 = 37 + 40 + 8 = 77 + 8 = 85

3. COMPENSATION :
   Ex : 4,9 + 3,7 = 5 + 3,7 − 0,1 = 8,7 − 0,1 = 8,6 (on arrondit 4,9 à 5)
        98 − 47 = 100 − 47 − 2 = 53 − 2 = 51

4. REGROUPEMENT :
   Ex : 25 + 37 + 75 = (25 + 75) + 37 = 100 + 37 = 137

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VÉRIFICATION DES CALCULS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 méthodes pour vérifier :

1. PREUVE PAR L'OPÉRATION INVERSE :
   Addition → vérifier par soustraction
   Soustraction → vérifier par addition

2. ESTIMATION :
   Avant de calculer, arrondir les nombres et estimer le résultat.
   Si le résultat calculé est très éloigné de l'estimation → erreur probable !
   Ex : 48,7 + 23,4 ≈ 49 + 23 = 72. Si on trouve 721 → erreur (virgule oubliée !)

3. RELECTURE COLONNE PAR COLONNE :
   Reprendre le calcul colonne par colonne pour vérifier.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÉSOUDRE UN PROBLÈME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉMARCHE EN 4 ÉTAPES :
1. LIRE et comprendre l'énoncé (identifier ce qu'on cherche)
2. CHOISIR l'opération (addition ou soustraction ?)
3. CALCULER (poser l'opération si nécessaire)
4. VÉRIFIER et RÉDIGER la réponse avec unité

QUAND ADDITIONNER ? → quand on réunit, accumule, ajoute
QUAND SOUSTRAIRE ? → quand on retire, compare, cherche un écart, un reste

🌍 EXEMPLES AFRICAINS :
Problème : Jean parcourt 12,5 km le matin et 8,75 km l'après-midi.
Kofi parcourt 23 km en une seule fois. Qui a parcouru le plus ? Combien de plus ?

ÉTAPE 1 : On cherche la distance totale de Jean et la différence.
ÉTAPE 2 : Addition pour Jean, soustraction pour comparer.
ÉTAPE 3 :
  Distance Jean : 12,50 + 8,75 = 21,25 km
  Différence : 23,00 − 21,25 = 1,75 km
ÉTAPE 4 : Kofi a parcouru 1,75 km de plus que Jean.`,
        exemples:[
          {question:"Calcul mental : 3,7 + 2,3 + 4,8", reponse:"(3,7+2,3) + 4,8 = 6 + 4,8 = 10,8 (on complète 3,7 et 2,3 à 6)"},
          {question:"Estimer puis calculer : 247,8 + 153,4", reponse:"Estimation : 248 + 153 ≈ 400. Calcul exact : 247,80 + 153,40 = 401,20"},
          {question:"Problème : un élève a 2 500 FCFA. Il dépense 875,50 FCFA au marché. Combien lui reste-t-il ?", reponse:"2 500,00 − 875,50 = 1 624,50 FCFA"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer en posant l'opération : 345 + 278", solution:"  345\n+ 278\n─────\n  623 (unités: 5+8=13, écrit 3 retenu 1 ; dizaines: 4+7+1=12, écrit 2 retenu 1 ; centaines: 3+2+1=6)"},
      {id:2,  niveau:"Facile",    enonce:"Calculer en posant l'opération : 1 000 − 437", solution:"  1000\n−  437\n──────\n   563 (vérif : 563 + 437 = 1 000 ✓)"},
      {id:3,  niveau:"Facile",    enonce:"Calculer : 3,5 + 2,8", solution:"3,5 + 2,8 = 6,3 (dixièmes : 5+8=13 → 3 retenu 1 ; unités : 3+2+1=6)"},
      {id:4,  niveau:"Facile",    enonce:"Calculer : 7,4 − 3,2", solution:"7,4 − 3,2 = 4,2 (dixièmes : 4−2=2 ; unités : 7−3=4)"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 12,5 + 0,75", solution:"12,50 + 0,75 = 13,25 (centièmes : 0+5=5 ; dixièmes : 5+7=12 → 2 retenu 1 ; unités : 2+0+1=3 ; dizaines : 1+0=1)"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer : 100 − 34,75", solution:"100,00 − 34,75 = 65,25 (vérif : 65,25 + 34,75 = 100 ✓)"},
      {id:7,  niveau:"Moyen",     enonce:"Calculer en alignant les virgules : 8,07 + 3,9 + 0,003", solution:"8,070 + 3,900 + 0,003 = 11,973"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer : 15,4 − 7,85", solution:"15,40 − 7,85 = 7,55 (centièmes : 0−5 emprunt → 10−5=5 ; dixièmes : 3−1=2, 2−8 emprunt → 12−8=4 ; unités : 4−1=3... Attendez : 15−7=8... Refaisons : 15,40−7,85 : C:0−5 emprunt→10−5=5(−1D) ; D:4−1=3,3−8 emprunt→13−8=5(−1U) ; U:5−1=4,4−7 emprunt→14−7=7(−1diz) ; diz:1−1=0 → 7,55 ✓)"},
      {id:9,  niveau:"Moyen",     enonce:"Aminata a 5 000 FCFA. Elle achète un cahier à 350,50 FCFA et un stylo à 125 FCFA. Combien lui reste-t-il ?", solution:"Total dépenses : 350,50 + 125,00 = 475,50 FCFA. Reste : 5 000,00 − 475,50 = 4 524,50 FCFA"},
      {id:10, niveau:"Moyen",     enonce:"Le Nil mesure 6 650 km et le fleuve Congo mesure 4 700 km. Quelle est la différence de longueur ?", solution:"6 650 − 4 700 = 1 950 km. Le Nil est plus long de 1 950 km."},
      {id:11, niveau:"Difficile", enonce:"Trouver x si : x + 3,75 = 10,2", solution:"x = 10,2 − 3,75. On calcule : 10,20 − 3,75 = 6,45. Vérif : 6,45 + 3,75 = 10,20 ✓"},
      {id:12, niveau:"Difficile", enonce:"La somme de deux nombres est 15,8. L'un des nombres est 7,35. Trouver l'autre.", solution:"L'autre nombre = 15,8 − 7,35 = 15,80 − 7,35 = 8,45. Vérif : 8,45 + 7,35 = 15,80 ✓"},
      {id:13, niveau:"Difficile", enonce:"Jean parcourt 12,5 km le matin et 8,75 km l'après-midi. Kofi parcourt 23 km. Qui a parcouru le plus ? De combien ?", solution:"Jean : 12,50 + 8,75 = 21,25 km. Kofi : 23 km. Kofi a parcouru 23,00 − 21,25 = 1,75 km de plus que Jean."},
      {id:14, niveau:"Difficile", enonce:"Une famille dépense : loyer 150 000 FCFA, nourriture 85 500,50 FCFA, transport 25 750,25 FCFA. Le revenu mensuel est 300 000 FCFA. Combien reste-t-il ?", solution:"Total dépenses : 150 000,00 + 85 500,50 + 25 750,25 = 261 250,75 FCFA. Reste : 300 000,00 − 261 250,75 = 38 749,25 FCFA"},
      {id:15, niveau:"Difficile", enonce:"Trouver deux nombres décimaux dont la somme est 8,5 et la différence est 1,3.", solution:"Soit a et b avec a+b=8,5 et a−b=1,3. En additionnant : 2a=9,8 → a=4,9. Donc b=8,5−4,9=3,6. Vérif : 4,9+3,6=8,5 ✓ et 4,9−3,6=1,3 ✓"},
    ],
  },
  5: {
    id:5, title:"Multiplication", duration:"3 semaines",
    objectives:[
      "Connaître et utiliser les tables de multiplication",
      "Maîtriser les propriétés de la multiplication",
      "Multiplier des nombres entiers en posant l'opération",
      "Multiplier des nombres décimaux",
      "Multiplier par 10, 100, 1 000 et par 0,1 ; 0,01 ; 0,001",
      "Résoudre des problèmes multiplicatifs",
    ],
    cours:[
      { id:"5-1", titre:"La multiplication — Définition et propriétés",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La multiplication est une addition répétée.
3 × 5 = 5 + 5 + 5 = 15
(on ajoute 5 trois fois)

VOCABULAIRE :
  facteur × facteur = produit
     a    ×    b    =  a × b

NOTATIONS : a × b  =  a · b  =  ab (quand il n'y a pas d'ambiguïté)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LES TABLES DE MULTIPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Il est INDISPENSABLE de connaître les tables par cœur !

Table de 1  : 1×1=1  ; 1×2=2  ; ... ; 1×9=9
Table de 2  : 2×1=2  ; 2×2=4  ; 2×3=6  ; 2×4=8  ; 2×5=10 ; 2×6=12 ; 2×7=14 ; 2×8=16 ; 2×9=18
Table de 3  : 3×1=3  ; 3×2=6  ; 3×3=9  ; 3×4=12 ; 3×5=15 ; 3×6=18 ; 3×7=21 ; 3×8=24 ; 3×9=27
Table de 4  : 4×1=4  ; 4×2=8  ; 4×3=12 ; 4×4=16 ; 4×5=20 ; 4×6=24 ; 4×7=28 ; 4×8=32 ; 4×9=36
Table de 5  : 5×1=5  ; 5×2=10 ; 5×3=15 ; 5×4=20 ; 5×5=25 ; 5×6=30 ; 5×7=35 ; 5×8=40 ; 5×9=45
Table de 6  : 6×1=6  ; 6×2=12 ; 6×3=18 ; 6×4=24 ; 6×5=30 ; 6×6=36 ; 6×7=42 ; 6×8=48 ; 6×9=54
Table de 7  : 7×1=7  ; 7×2=14 ; 7×3=21 ; 7×4=28 ; 7×5=35 ; 7×6=42 ; 7×7=49 ; 7×8=56 ; 7×9=63
Table de 8  : 8×1=8  ; 8×2=16 ; 8×3=24 ; 8×4=32 ; 8×5=40 ; 8×6=48 ; 8×7=56 ; 8×8=64 ; 8×9=72
Table de 9  : 9×1=9  ; 9×2=18 ; 9×3=27 ; 9×4=36 ; 9×5=45 ; 9×6=54 ; 9×7=63 ; 9×8=72 ; 9×9=81

ASTUCES POUR LES TABLES :
• Table de 5 : le résultat finit toujours par 0 ou 5
• Table de 9 : les chiffres du résultat ont toujours une somme de 9 (9, 18, 27, 36...)
• Table de 4 : doubler la table de 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉS DE LA MULTIPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. COMMUTATIVITÉ : l'ordre des facteurs ne change pas le produit.
   a × b = b × a
   Ex : 3 × 7 = 7 × 3 = 21

2. ASSOCIATIVITÉ : on peut regrouper les facteurs.
   (a × b) × c = a × (b × c)
   Ex : (2 × 5) × 7 = 2 × (5 × 7) = 70

3. ÉLÉMENT NEUTRE : multiplier par 1 ne change pas un nombre.
   a × 1 = a
   Ex : 8 × 1 = 8

4. ÉLÉMENT ABSORBANT : multiplier par 0 donne toujours 0.
   a × 0 = 0
   Ex : 999 × 0 = 0

5. DISTRIBUTIVITÉ par rapport à l'addition :
   a × (b + c) = a × b + a × c
   Ex : 3 × (4 + 5) = 3×4 + 3×5 = 12 + 15 = 27
   
   ET par rapport à la soustraction :
   a × (b − c) = a × b − a × c
   Ex : 7 × (10 − 2) = 7×10 − 7×2 = 70 − 14 = 56

📌 LA DISTRIBUTIVITÉ EST TRÈS UTILE POUR LE CALCUL MENTAL !
Ex : 6 × 99 = 6 × (100 − 1) = 600 − 6 = 594
Ex : 4 × 25 = 4 × (20 + 5) = 80 + 20 = 100`,
        exemples:[
          {question:"Calculer 7 × 8 de deux façons différentes", reponse:"7×8 = 56 (table de 7) ou 8×7 = 56 (commutativité)"},
          {question:"Utiliser la distributivité pour calculer 8 × 47", reponse:"8 × (40 + 7) = 8×40 + 8×7 = 320 + 56 = 376"},
          {question:"Calcul astucieux : 5 × 37 × 2", reponse:"(5 × 2) × 37 = 10 × 37 = 370 (associativité)"},
        ]
      },
      { id:"5-2", titre:"Multiplication posée en colonnes",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTIPLICATION PAR UN CHIFFRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : on multiplie de droite à gauche, en reportant les retenues.

EXEMPLE : 347 × 6
    3 4 7
  ×     6
  ──────
Unités    : 7 × 6 = 42 → on écrit 2, on retient 4
Dizaines  : 4 × 6 = 24, + 4 (retenue) = 28 → on écrit 8, on retient 2
Centaines : 3 × 6 = 18, + 2 (retenue) = 20 → on écrit 20
Résultat  : 2 082

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTIPLICATION PAR UN NOMBRE À PLUSIEURS CHIFFRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : on calcule les produits partiels, puis on les additionne.
Chaque produit partiel est décalé d'un rang vers la gauche.

EXEMPLE : 247 × 34
    2 4 7
  ×   3 4
  ──────
  Produit 1 (× 4) :   247 × 4 = 988
  Produit 2 (× 30) :  247 × 3 = 741, décalé d'un rang = 7 410
  ──────────────────────────────
  Addition :   988
             +7410
             ─────
              8 398

VÉRIFICATION PAR ESTIMATION :
247 × 34 ≈ 250 × 34 ≈ 250 × 35 = 8 750 → notre résultat 8 398 est proche ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTIPLIER PAR 10, 100, 1 000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Multiplier par 10, 100, 1 000 revient à décaler la virgule vers la DROITE.

• × 10    → décaler d'1 rang à droite  (ajouter un zéro si entier)
• × 100   → décaler de 2 rangs à droite
• × 1 000 → décaler de 3 rangs à droite

EXEMPLES AVEC ENTIERS :
• 47 × 10    = 470     (on ajoute un 0)
• 47 × 100   = 4 700   (on ajoute deux 0)
• 47 × 1 000 = 47 000  (on ajoute trois 0)

EXEMPLES AVEC DÉCIMAUX :
• 3,45 × 10    = 34,5   (virgule décale d'1 rang)
• 3,45 × 100   = 345    (virgule décale de 2 rangs → disparaît)
• 3,45 × 1 000 = 3 450  (virgule décale de 3 rangs)
• 0,07 × 10    = 0,7    (virgule décale d'1 rang)
• 0,07 × 100   = 7      (virgule décale de 2 rangs)
• 0,07 × 1 000 = 70     (virgule décale de 3 rangs)

📌 ASTUCE MÉMOIRE : × 10 → +1 zéro ; × 100 → +2 zéros ; × 1000 → +3 zéros`,
        exemples:[
          {question:"Calculer 2 547 × 8", reponse:"U:7×8=56→6 ret.5 ; D:4×8+5=37→7 ret.3 ; C:5×8+3=43→3 ret.4 ; M:2×8+4=20 → 20 376"},
          {question:"Calculer 3,45 × 100", reponse:"On décale la virgule de 2 rangs à droite → 345"},
          {question:"Calculer 0,025 × 1 000", reponse:"On décale de 3 rangs → 25"},
        ]
      },
      { id:"5-3", titre:"Multiplication de décimaux",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE DE MULTIPLICATION DE DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE EN 3 ÉTAPES :
1. On IGNORE les virgules et on multiplie comme si c'étaient des entiers
2. On COMPTE le nombre total de chiffres après la virgule dans les deux facteurs
3. On PLACE la virgule dans le résultat en partant de la droite

⚠️ POINT CRUCIAL : Le nombre de décimales du résultat = somme des décimales des deux facteurs.

EXEMPLE 1 : 3,4 × 2,5
Étape 1 : 34 × 25 = 850
Étape 2 : 3,4 → 1 décimale ; 2,5 → 1 décimale → total : 2 décimales
Étape 3 : 850 → on met 2 décimales → 8,50 = 8,5

EXEMPLE 2 : 0,6 × 0,7
Étape 1 : 6 × 7 = 42
Étape 2 : 0,6 → 1 décimale ; 0,7 → 1 décimale → total : 2 décimales
Étape 3 : 42 → on met 2 décimales → 0,42

EXEMPLE 3 : 1,2 × 0,03
Étape 1 : 12 × 3 = 36
Étape 2 : 1,2 → 1 décimale ; 0,03 → 2 décimales → total : 3 décimales
Étape 3 : 36 → on met 3 décimales → 0,036
⚠️ Il faut parfois ajouter des zéros à gauche pour avoir assez de décimales !

EXEMPLE 4 : 2,35 × 1,4
Étape 1 : 235 × 14 = ?
  235 × 4 = 940
  235 × 10 = 2 350
  Total = 3 290
Étape 2 : 2,35 → 2 décimales ; 1,4 → 1 décimale → total : 3 décimales
Étape 3 : 3290 → 3,290 = 3,29

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VÉRIFICATION PAR ESTIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Toujours estimer avant de calculer pour détecter les erreurs de virgule !

Ex : 3,4 × 2,5 ≈ 3 × 3 = 9 → notre résultat 8,5 est proche ✓
     (si on avait trouvé 85 ou 0,85 → erreur de virgule !)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTIPLIER PAR 0,1 ; 0,01 ; 0,001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C'est l'inverse de multiplier par 10, 100, 1 000 :
on décale la virgule vers la GAUCHE.

• × 0,1   → décaler d'1 rang à gauche  (÷ 10)
• × 0,01  → décaler de 2 rangs à gauche (÷ 100)
• × 0,001 → décaler de 3 rangs à gauche (÷ 1 000)

Exemples :
• 45 × 0,1   = 4,5
• 45 × 0,01  = 0,45
• 45 × 0,001 = 0,045

🌍 EXEMPLES AFRICAINS :
• Taxi à Libreville : tarif 1 500,50 FCFA × 3 trajets = 4 501,50 FCFA
• Prix d'un tissu wax : 3 500 FCFA/m × 2,5 m = 8 750 FCFA
• Masse d'une caisse de tomates : 12,5 kg × 8 caisses = 100 kg
• Consommation d'eau : 0,75 m³/jour × 30 jours = 22,5 m³/mois`,
        exemples:[
          {question:"Calculer 2,5 × 4", reponse:"25 × 4 = 100 ; 1 décimale → 10,0 = 10"},
          {question:"Calculer 0,08 × 0,5", reponse:"8 × 5 = 40 ; décimales : 2+1=3 → 0,040 = 0,04"},
          {question:"Calculer 12,5 × 0,4", reponse:"125 × 4 = 500 ; décimales : 1+1=2 → 5,00 = 5"},
          {question:"Estimer puis calculer : 4,8 × 3,2", reponse:"Estimation : 5×3=15. Calcul : 48×32=1536 ; décimales : 1+1=2 → 15,36 ✓ (proche de 15)"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer en utilisant les tables : 7 × 8 et 9 × 6", solution:"7 × 8 = 56 (table de 7 ou de 8). 9 × 6 = 54 (table de 9 : 9,18,27,36,45,54)"},
      {id:2,  niveau:"Facile",    enonce:"Calculer : 3,5 × 10", solution:"On décale la virgule d'1 rang à droite → 35"},
      {id:3,  niveau:"Facile",    enonce:"Calculer : 4,2 × 100", solution:"On décale la virgule de 2 rangs à droite → 420"},
      {id:4,  niveau:"Facile",    enonce:"Calculer : 2,5 × 4", solution:"25 × 4 = 100 ; 1 décimale → 10,0 = 10"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 0,3 × 1 000", solution:"On décale la virgule de 3 rangs à droite → 300"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer en posant l'opération : 3,4 × 2,5", solution:"34 × 25 : 34×5=170 ; 34×20=680 ; total=850. Décimales : 1+1=2 → 8,50 = 8,5. Estimation : 3×3=9 ✓"},
      {id:7,  niveau:"Moyen",     enonce:"Calculer : 0,6 × 0,8", solution:"6 × 8 = 48 ; décimales : 1+1=2 → 0,48"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer : 1,25 × 4", solution:"125 × 4 = 500 ; 2 décimales → 5,00 = 5"},
      {id:9,  niveau:"Moyen",     enonce:"Un sac de riz coûte 8 500 FCFA. Quel est le prix de 4 sacs ?", solution:"8 500 × 4 = 34 000 FCFA. (U:0×4=0 ; D:0×4=0 ; C:5×4=20, écrit 0 retenu 2 ; M:8×4+2=34)"},
      {id:10, niveau:"Moyen",     enonce:"Un litre d'eau minérale coûte 0,75 FCFA. Combien coûtent 12 litres ?", solution:"0,75 × 12 : 75 × 12 = 900 ; 2 décimales → 9,00 = 9 FCFA"},
      {id:11, niveau:"Difficile", enonce:"Calculer en posant l'opération : 2,35 × 1,4", solution:"235 × 14 : 235×4=940 ; 235×10=2350 ; total=3290. Décimales : 2+1=3 → 3,290 = 3,29. Estimation : 2×1,5=3 ✓"},
      {id:12, niveau:"Difficile", enonce:"Une voiture consomme 8,5 litres aux 100 km. Combien consomme-t-elle pour 350 km ?", solution:"Pour 100 km : 8,5 L. Pour 350 km : 8,5 × 3,5 = ? 85×35=2975 ; décimales : 1+1=2 → 29,75 litres. Vérif : 8,5×4=34 et 8,5×3=25,5 → entre 25 et 34, donc 29,75 ✓"},
      {id:13, niveau:"Difficile", enonce:"Trouver x si : 3,5 × x = 17,5", solution:"x = 17,5 ÷ 3,5. On peut écrire : 175 ÷ 35 = 5. Vérif : 3,5 × 5 = 17,5 ✓"},
      {id:14, niveau:"Difficile", enonce:"Une parcelle de terrain mesure 12,5 m de long sur 8,4 m de large. Calculer son aire.", solution:"Aire = longueur × largeur = 12,5 × 8,4. 125×84 : 125×4=500 ; 125×80=10000 ; total=10500. Décimales : 1+1=2 → 105,00 = 105 m²"},
      {id:15, niveau:"Difficile", enonce:"Jean économise 2 500,50 FCFA par semaine. Combien aura-t-il économisé en 52 semaines (1 an) ?", solution:"2 500,50 × 52 : 250050 × 52 : 250050×2=500100 ; 250050×50=12502500 ; total=13002600. Décimales : 2 → 130 026,00 = 130 026 FCFA"},
    ],
  },
  6: {
    id:6, title:"Division", duration:"3 semaines",
    objectives:[
      "Comprendre la notion de division et ses deux sens",
      "Maîtriser la division euclidienne (quotient entier et reste)",
      "Effectuer une division décimale",
      "Diviser par 10, 100, 1 000",
      "Diviser des nombres décimaux",
      "Résoudre des problèmes faisant appel à la division",
    ],
    cours:[
      { id:"6-1", titre:"La division — Définition et deux sens",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La division est l'opération inverse de la multiplication.

VOCABULAIRE :
  dividende ÷ diviseur = quotient
      a     ÷    b     =   a ÷ b

NOTATIONS : a ÷ b  =  a / b  =  a/b

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEUX SENS DE LA DIVISION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La division a deux interprétations différentes :

SENS 1 — PARTAGE (division en parts égales) :
"On répartit 12 mangues en 4 parts égales. Combien par part ?"
→ 12 ÷ 4 = 3 mangues par part.

SENS 2 — GROUPEMENT (combien de groupes ?) :
"On fait des sachets de 4 mangues avec 12 mangues. Combien de sachets ?"
→ 12 ÷ 4 = 3 sachets.

📌 Le calcul est le même (12 ÷ 4 = 3), mais le sens varie selon le contexte !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIEN AVEC LA MULTIPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Division et multiplication sont des opérations INVERSES.
Si a × b = c, alors c ÷ b = a et c ÷ a = b.

Ex : 4 × 7 = 28 → 28 ÷ 7 = 4 et 28 ÷ 4 = 7

C'est la base de la VÉRIFICATION :
Pour vérifier 28 ÷ 4 = 7, on vérifie que 7 × 4 = 28 ✓

⚠️ ATTENTION : On ne peut PAS diviser par 0 !
  8 ÷ 0 → IMPOSSIBLE (indéfini en mathématiques)

🌍 EXEMPLES AFRICAINS :
• On répartit 360 FCFA en 4 parts égales → 360 ÷ 4 = 90 FCFA par personne
• Avec 360 FCFA, combien de savons à 90 FCFA ? → 360 ÷ 90 = 4 savons`,
        exemples:[
          {question:"Vérifier que 56 ÷ 7 = 8", reponse:"On vérifie : 8 × 7 = 56 ✓"},
          {question:"Sens 1 ou sens 2 ? '24 élèves en groupes de 6'", reponse:"Sens 2 (groupement) : 24 ÷ 6 = 4 groupes"},
          {question:"Sens 1 ou sens 2 ? '24 bonbons partagés entre 6 enfants'", reponse:"Sens 1 (partage) : 24 ÷ 6 = 4 bonbons par enfant"},
        ]
      },
      { id:"6-2", titre:"La division euclidienne",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quand un entier n'est pas divisible exactement par un autre,
on obtient un QUOTIENT ENTIER et un RESTE.
C'est la DIVISION EUCLIDIENNE.

VOCABULAIRE COMPLET :
  dividende ÷ diviseur = quotient    reste r
      a     ÷    b     =    q     reste r

RELATION FONDAMENTALE :
  dividende = diviseur × quotient + reste
      a     =    b     ×    q     +  r

CONDITION SUR LE RESTE : 0 ≤ r < diviseur (le reste est toujours strictement plus petit que le diviseur !)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE DE CALCUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour calculer 47 ÷ 5 :
1. On cherche le plus grand multiple de 5 qui est ≤ 47
   → 5 × 9 = 45 ≤ 47  et  5 × 10 = 50 > 47 → quotient = 9
2. On calcule le reste : r = 47 − 5 × 9 = 47 − 45 = 2
3. On vérifie : 5 × 9 + 2 = 47 ✓ et r = 2 < 5 ✓
→ 47 = 5 × 9 + 2

ALGORITHME POSÉ (pour les grands nombres) :
Exemple : 847 ÷ 6

       8 4 7   │ 6
               │────
    On prend les chiffres du dividende de gauche à droite :
    - 8 ÷ 6 : 6×1=6 ≤ 8 et 6×2=12 > 8 → quotient partiel 1, reste 8−6=2
    - On descend : 24 ÷ 6 : 6×4=24 → quotient partiel 4, reste 0
    - On descend : 07 ÷ 6 : 6×1=6 ≤ 7 → quotient partiel 1, reste 7−6=1
    
    Résultat : 847 = 6 × 141 + 1
    Vérif : 6 × 141 + 1 = 846 + 1 = 847 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIVISIBILITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un entier a est DIVISIBLE par b si le reste de la division de a par b est 0.
On dit aussi que b est un DIVISEUR de a, ou que a est un MULTIPLE de b.

CRITÈRES DE DIVISIBILITÉ UTILES :
• Divisible par 2 : le chiffre des unités est 0, 2, 4, 6 ou 8 (nombre pair)
• Divisible par 3 : la somme des chiffres est divisible par 3
• Divisible par 5 : le chiffre des unités est 0 ou 5
• Divisible par 9 : la somme des chiffres est divisible par 9
• Divisible par 10 : le chiffre des unités est 0

EXEMPLES :
• 348 divisible par 2 ? → unités = 8 → OUI
• 348 divisible par 3 ? → 3+4+8=15, 15÷3=5 → OUI
• 348 divisible par 9 ? → 3+4+8=15, 15÷9 reste 6 → NON

🌍 EXEMPLES AFRICAINS :
• 47 mangues en sachets de 5 → 47 = 5 × 9 + 2 → 9 sachets complets, 2 mangues restantes
• 100 élèves en groupes de 7 → 100 = 7 × 14 + 2 → 14 groupes complets et 2 élèves seuls`,
        exemples:[
          {question:"Effectuer la division euclidienne de 83 par 7", reponse:"7×11=77 ≤ 83 et 7×12=84 > 83 → quotient=11, reste=83−77=6 → 83 = 7×11 + 6. Vérif : 7×11+6=83 ✓ et 6<7 ✓"},
          {question:"Vérifier que 156 = 12 × 13 + 0", reponse:"12 × 13 = 156 ✓ et reste = 0 → 156 est divisible par 12"},
          {question:"378 est-il divisible par 3 ? par 9 ?", reponse:"Somme des chiffres : 3+7+8=18. 18÷3=6 → divisible par 3 ✓. 18÷9=2 → divisible par 9 ✓"},
        ]
      },
      { id:"6-3", titre:"Division décimale et division par 10, 100, 1000",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIVISER PAR 10, 100, 1 000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diviser par 10, 100, 1 000 revient à décaler la virgule vers la GAUCHE.

• ÷ 10    → décaler d'1 rang à gauche
• ÷ 100   → décaler de 2 rangs à gauche
• ÷ 1 000 → décaler de 3 rangs à gauche

EXEMPLES AVEC ENTIERS :
• 730 ÷ 10    = 73      (on enlève un 0 ou on décale la virgule)
• 450 ÷ 100   = 4,5
• 6 000 ÷ 1 000 = 6

EXEMPLES AVEC DÉCIMAUX :
• 34,5 ÷ 10    = 3,45
• 34,5 ÷ 100   = 0,345
• 34,5 ÷ 1 000 = 0,0345
• 0,7  ÷ 10    = 0,07
• 0,7  ÷ 100   = 0,007

📌 SYMÉTRIE : × 10 ↔ ÷ 10 ; × 100 ↔ ÷ 100 ; × 1000 ↔ ÷ 1000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIVISION DÉCIMALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quand la division ne tombe pas juste, on continue en ajoutant des décimales.

PRINCIPE : quand le reste ≠ 0, on ajoute un zéro après la virgule et on continue.

EXEMPLE : 7 ÷ 4
    7 │ 4
      │────
    7 − 4×1 = 3 → quotient 1, reste 3
    On ajoute une virgule et un zéro → 30
    30 − 4×7 = 2 → quotient 1,7, reste 2
    On ajoute un zéro → 20
    20 − 4×5 = 0 → quotient 1,75, reste 0
    Résultat : 7 ÷ 4 = 1,75
    Vérif : 1,75 × 4 = 7 ✓

EXEMPLE : 1 ÷ 3 (division infinie !)
    1 ÷ 3 = 0,333... = 0,3̄  (le 3 se répète indéfiniment)
    On dit que c'est un nombre décimal illimité périodique.
    En pratique, on arrondit : 1 ÷ 3 ≈ 0,33 (au centième)

EXEMPLE : 5 ÷ 8
    5 ÷ 8 : 50÷8=6 reste 2 → 20÷8=2 reste 4 → 40÷8=5 reste 0
    5 ÷ 8 = 0,625

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIVISER DES DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : on multiplie dividende ET diviseur par la même puissance de 10
pour rendre le diviseur entier, puis on divise normalement.

EXEMPLE : 17,5 ÷ 2,5
→ On multiplie les deux par 10 : 175 ÷ 25
→ 175 ÷ 25 = 7
→ Vérif : 7 × 2,5 = 17,5 ✓

EXEMPLE : 3,6 ÷ 0,4
→ On multiplie les deux par 10 : 36 ÷ 4 = 9
→ Vérif : 9 × 0,4 = 3,6 ✓

EXEMPLE : 1,44 ÷ 0,12
→ On multiplie les deux par 100 : 144 ÷ 12 = 12
→ Vérif : 12 × 0,12 = 1,44 ✓

📌 ASTUCE : Pour diviser par un décimal, on peut aussi demander :
"Par combien faut-il multiplier le diviseur pour le rendre entier ?"
0,4 → ×10 ; 0,25 → ×100 ; 0,005 → ×1000

🌍 EXEMPLES AFRICAINS :
• Partager 1 500 FCFA entre 4 amis → 1 500 ÷ 4 = 375 FCFA chacun
• Prix au kilo : 2 450 FCFA pour 3,5 kg → 2 450 ÷ 3,5 = 24500÷35 = 700 FCFA/kg
• Consommation : 450 km avec 36 L → 36 ÷ 450 × 100 = 8 L/100km`,
        exemples:[
          {question:"Calculer 45 ÷ 100", reponse:"On décale la virgule de 2 rangs à gauche → 0,45"},
          {question:"Calculer 9 ÷ 4 (division décimale)", reponse:"9 = 4×2 + 1 → 10 ÷ 4 = 2 reste 2 → 20 ÷ 4 = 5 → 9 ÷ 4 = 2,25. Vérif : 2,25 × 4 = 9 ✓"},
          {question:"Calculer 17,5 ÷ 2,5", reponse:"× 10 : 175 ÷ 25. 25×7=175 → résultat = 7. Vérif : 7 × 2,5 = 17,5 ✓"},
          {question:"Calculer 5 ÷ 8", reponse:"50÷8=6r2 → 20÷8=2r4 → 40÷8=5r0 → 5÷8 = 0,625"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Effectuer la division euclidienne de 35 par 6 et vérifier.", solution:"6×5=30 ≤ 35, 6×6=36 > 35 → q=5, r=35−30=5. Relation : 35 = 6×5 + 5. Vérif : 6×5+5=35 ✓ et r=5 < 6 ✓"},
      {id:2,  niveau:"Facile",    enonce:"Effectuer la division euclidienne de 48 par 8 et vérifier.", solution:"8×6=48 → q=6, r=0. Relation : 48 = 8×6 + 0. 48 est divisible par 8. Vérif : 8×6+0=48 ✓"},
      {id:3,  niveau:"Facile",    enonce:"Calculer : 730 ÷ 10", solution:"On décale la virgule d'1 rang à gauche → 73"},
      {id:4,  niveau:"Facile",    enonce:"Calculer : 450 ÷ 100", solution:"On décale la virgule de 2 rangs à gauche → 4,5"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 8 ÷ 2", solution:"8 ÷ 2 = 4. Vérif : 4 × 2 = 8 ✓"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer 7 ÷ 4 (résultat décimal, montrer toutes les étapes).", solution:"7 = 4×1+3 → 30 = 4×7+2 → 20 = 4×5+0 → 7 ÷ 4 = 1,75. Vérif : 1,75 × 4 = 7 ✓"},
      {id:7,  niveau:"Moyen",     enonce:"Calculer 15 ÷ 8 (résultat décimal).", solution:"15 = 8×1+7 → 70 = 8×8+6 → 60 = 8×7+4 → 40 = 8×5+0 → 15 ÷ 8 = 1,875. Vérif : 1,875 × 8 = 15 ✓"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer : 3 600 ÷ 1 000", solution:"On décale la virgule de 3 rangs à gauche → 3,6"},
      {id:9,  niveau:"Moyen",     enonce:"On partage 250 FCFA entre 4 enfants. Combien reçoit chaque enfant ?", solution:"250 ÷ 4 : 250 = 4×62+2 → 20÷4=5 → 250 ÷ 4 = 62,5 FCFA. Vérif : 62,5 × 4 = 250 ✓"},
      {id:10, niveau:"Moyen",     enonce:"Un sac de 25 kg de riz est réparti en portions de 0,5 kg. Combien de portions obtient-on ?", solution:"25 ÷ 0,5 = 250 ÷ 5 = 50 portions. Vérif : 50 × 0,5 = 25 ✓"},
      {id:11, niveau:"Difficile", enonce:"Calculer 17,5 ÷ 2,5 en expliquant la méthode.", solution:"On multiplie les deux par 10 : 175 ÷ 25. 25×7=175 → résultat = 7. Vérif : 7 × 2,5 = 17,5 ✓"},
      {id:12, niveau:"Difficile", enonce:"Un camion parcourt 450 km avec 36 litres de carburant. Calculer sa consommation aux 100 km.", solution:"Consommation = 36 ÷ 450 × 100 = 3600 ÷ 450 = 8 L/100km. Vérif : 8 × 450 ÷ 100 = 36 ✓"},
      {id:13, niveau:"Difficile", enonce:"Trouver le plus grand entier n tel que 7n ≤ 100.", solution:"7n ≤ 100 → n ≤ 100/7 = 14,28... → le plus grand entier est n = 14. Vérif : 7×14=98 ≤ 100 ✓ et 7×15=105 > 100 ✓"},
      {id:14, niveau:"Difficile", enonce:"La division de a par 9 donne un quotient de 12 et un reste de 5. Trouver a.", solution:"Relation : a = 9 × 12 + 5 = 108 + 5 = 113. Vérif : 113 ÷ 9 = 12 reste 5 ✓ (9×12=108, 113−108=5 < 9 ✓)"},
      {id:15, niveau:"Difficile", enonce:"3 familles se partagent un héritage de 4 500 000 FCFA. La 1ère reçoit le double de la 2ème, et la 3ème reçoit autant que la 2ème. Calculer la part de chaque famille.", solution:"Soit x la part de la 2ème famille. F1=2x, F2=x, F3=x. Total : 2x+x+x=4x=4 500 000 → x=1 125 000 FCFA. F1=2 250 000 FCFA, F2=F3=1 125 000 FCFA. Vérif : 2 250 000+1 125 000+1 125 000=4 500 000 ✓"},
    ],
  },
  7: {
    id:7, title:"Priorités opératoires", duration:"2 semaines",
    objectives:[
      "Comprendre pourquoi les priorités opératoires sont nécessaires",
      "Connaître et appliquer les règles de priorité des opérations",
      "Utiliser correctement les parenthèses",
      "Calculer des expressions numériques avec plusieurs opérations",
      "Traduire une situation en expression numérique",
    ],
    cours:[
      { id:"7-1", titre:"Pourquoi des règles de priorité ?",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE PROBLÈME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sans règles de priorité, une même expression peut donner des résultats différents !

EXEMPLE : 3 + 4 × 2

Si on calcule de gauche à droite : (3 + 4) × 2 = 7 × 2 = 14
Si on fait la multiplication d'abord : 3 + (4 × 2) = 3 + 8 = 11

Ces deux résultats sont DIFFÉRENTS ! Il faut donc une convention unique.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LA CONVENTION UNIVERSELLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les mathématiciens du monde entier ont adopté les MÊMES règles :

ORDRE DE PRIORITÉ (du plus prioritaire au moins prioritaire) :
  1. Ce qui est entre PARENTHÈSES  (priorité absolue)
  2. Les MULTIPLICATIONS et DIVISIONS (de gauche à droite)
  3. Les ADDITIONS et SOUSTRACTIONS   (de gauche à droite)

MOYEN MNÉMOTECHNIQUE : "P-M-D-A-S" (Parenthèses, Multiplication, Division, Addition, Soustraction)
Ou : "Les multiplications et divisions avant les additions et soustractions"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATION DE LA RÈGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE 1 : 3 + 4 × 2
→ Pas de parenthèses
→ On fait × d'abord : 4 × 2 = 8
→ Puis + : 3 + 8 = 11
→ Résultat : 11 ✓ (et NON 14 !)

EXEMPLE 2 : 20 − 4 × 3 + 2
→ On fait × d'abord : 4 × 3 = 12
→ L'expression devient : 20 − 12 + 2
→ On fait de gauche à droite : 20 − 12 = 8, puis 8 + 2 = 10
→ Résultat : 10

EXEMPLE 3 : 15 ÷ 3 + 4 × 2
→ On fait ÷ et × d'abord (de gauche à droite) :
  15 ÷ 3 = 5  et  4 × 2 = 8
→ L'expression devient : 5 + 8
→ Résultat : 13

EXEMPLE 4 : 12 ÷ 4 × 3
→ Même priorité (÷ et ×) → on calcule de GAUCHE À DROITE
→ 12 ÷ 4 = 3, puis 3 × 3 = 9
→ Résultat : 9
⚠️ ATTENTION : 12 ÷ (4 × 3) = 12 ÷ 12 = 1 (résultat différent si on change l'ordre !)

🌍 EXEMPLES AFRICAINS :
Monnaie sur 2 000 FCFA pour 3 beignets à 500 FCFA :
→ Reste = 2 000 − 3 × 500
→ On fait × d'abord : 3 × 500 = 1 500
→ Puis − : 2 000 − 1 500 = 500 FCFA ✓

Prix total : 4 cahiers à 350 FCFA et 2 stylos à 150 FCFA :
→ Total = 4 × 350 + 2 × 150
→ On fait × d'abord : 1 400 + 300 = 1 700 FCFA`,
        exemples:[
          {question:"Calculer : 5 + 3 × 4", reponse:"× en premier : 3×4=12. Puis + : 5+12=17. (FAUX de calculer (5+3)×4=32)"},
          {question:"Calculer : 24 ÷ 4 + 2 × 3", reponse:"÷ et × d'abord : 24÷4=6 et 2×3=6. Puis + : 6+6=12"},
          {question:"Calculer : 18 − 6 ÷ 2 + 1", reponse:"÷ d'abord : 6÷2=3. Expression : 18−3+1. De gauche à droite : 15+1=16"},
        ]
      },
      { id:"7-2", titre:"Les parenthèses",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÔLE DES PARENTHÈSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les parenthèses MODIFIENT l'ordre naturel des calculs.
Tout ce qui est ENTRE PARENTHÈSES est calculé EN PREMIER.

EXEMPLE :
  Sans parenthèses : 3 + 4 × 2 = 3 + 8 = 11
  Avec parenthèses : (3 + 4) × 2 = 7 × 2 = 14
Les parenthèses ont changé le résultat !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARENTHÈSES IMBRIQUÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quand il y a des parenthèses à l'intérieur d'autres parenthèses,
on commence par les parenthèses les plus INTÉRIEURES.

EXEMPLE : 3 × (2 + (5 − 1))
→ Parenthèses intérieures d'abord : (5 − 1) = 4
→ Parenthèses extérieures : (2 + 4) = 6
→ Multiplication : 3 × 6 = 18

En pratique au collège, on utilise souvent :
( ) pour le 1er niveau
[ ] ou ( ( ) ) pour le 2ème niveau

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPPRIMER DES PARENTHÈSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE 1 : (a + b) + c = a + b + c  (on peut enlever si + devant)
RÈGLE 2 : a + (b + c) = a + b + c  (idem)
RÈGLE 3 : a − (b + c) = a − b − c  (attention : le − change les signes !)
RÈGLE 4 : a − (b − c) = a − b + c  (le − devant les parenthèses inverse tous les signes)

EXEMPLES :
• 12 − (3 + 4) = 12 − 3 − 4 = 5  (vérif : 12 − 7 = 5 ✓)
• 12 − (3 − 4) = 12 − 3 + 4 = 13 (vérif : 12 − (−1) = 13 ✓)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AJOUTER DES PARENTHÈSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On peut CHOISIR où placer les parenthèses pour obtenir un résultat voulu.

EXEMPLE : Avec 2, 3, 4 et les opérations, obtenir 20 :
• 2 × (3 + 4) × ... → non, essayons autrement
• (2 + 3) × 4 = 5 × 4 = 20 ✓

🌍 EXEMPLES AFRICAINS :
Problème : "Une famille de 5 personnes achète 3 kg de riz à 850 FCFA/kg
et 2 kg de farine à 600 FCFA/kg. Quel est le coût moyen par personne ?"

Expression : (3 × 850 + 2 × 600) ÷ 5
= (2 550 + 1 200) ÷ 5
= 3 750 ÷ 5
= 750 FCFA par personne`,
        exemples:[
          {question:"Calculer : (5 + 3) × 4", reponse:"Parenthèses d'abord : 5+3=8. Puis × : 8×4=32"},
          {question:"Calculer : 3 × (4 + 5) − 2", reponse:"Parenthèses : 4+5=9. Expression : 3×9−2. × avant − : 27−2=25"},
          {question:"Calculer : 20 − (3 + 2) × 3", reponse:"Parenthèses : 3+2=5. Expression : 20−5×3. × avant − : 20−15=5"},
          {question:"Enlever les parenthèses : 15 − (4 − 2)", reponse:"15 − 4 + 2 = 13 (le − devant les parenthèses inverse les signes)"},
        ]
      },
      { id:"7-3", titre:"Expressions numériques et problèmes",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPRESSION NUMÉRIQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une EXPRESSION NUMÉRIQUE est une écriture mathématique qui associe
des nombres et des opérations.

EXEMPLES :
• 3 + 4 × 2 est une expression numérique de valeur 11
• (15 − 3) ÷ 4 est une expression numérique de valeur 3
• 2 × (7 + 1) − 5 est une expression numérique de valeur 11

CALCULER UNE EXPRESSION = trouver sa valeur en respectant les priorités.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE POUR CALCULER UNE EXPRESSION COMPLEXE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 1 : Identifier les parenthèses → les calculer d'abord (de l'intérieur vers l'extérieur)
ÉTAPE 2 : Effectuer toutes les multiplications et divisions (de gauche à droite)
ÉTAPE 3 : Effectuer toutes les additions et soustractions (de gauche à droite)
ÉTAPE 4 : Vérifier le résultat par estimation

EXEMPLE COMPLET : (12 + 3 × 4) ÷ (2 × 4 − 2)
Étape 1a : Parenthèse gauche : 12 + 3×4 = 12 + 12 = 24
           (d'abord × dans la parenthèse, puis +)
Étape 1b : Parenthèse droite : 2×4 − 2 = 8 − 2 = 6
           (d'abord × dans la parenthèse, puis −)
Étape 2 : Expression : 24 ÷ 6
Étape 3 : 24 ÷ 6 = 4
Résultat : 4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRADUIRE UN PROBLÈME EN EXPRESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Savoir écrire une expression numérique à partir d'un problème est essentiel !

MOTS CLÉS :
• "de plus", "en tout" → addition
• "de moins", "reste", "différence" → soustraction
• "fois", "par", "chaque" → multiplication
• "partagé", "en parts égales", "par personne" → division

EXEMPLE : "Un marchand vend 50 ananas à 200 FCFA, dont 45 à 350 FCFA et garde les 5 restants. Quel est son bénéfice ?"
→ Recette : 45 × 350
→ Coût : 50 × 200
→ Bénéfice = Recette − Coût = 45 × 350 − 50 × 200
→ = 15 750 − 10 000 = 5 750 FCFA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCULS ASTUCIEUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les règles de priorité permettent aussi des ASTUCES de calcul mental !

FACTORISATION (distributivité à l'envers) :
a × b + a × c = a × (b + c)
Ex : 99 × 37 + 37 = 37 × 99 + 37 × 1 = 37 × (99 + 1) = 37 × 100 = 3 700

SIMPLIFICATION :
25 × 48 × 4 = (25 × 4) × 48 = 100 × 48 = 4 800

🌍 EXEMPLES AFRICAINS :
• 15 × 99 = 15 × (100 − 1) = 1 500 − 15 = 1 485 FCFA
• 8 × 125 = 8 × (100 + 25) = 800 + 200 = 1 000 FCFA
• Prix de 12 oranges à 75 FCFA : 12 × 75 = 12 × (70+5) = 840 + 60 = 900 FCFA`,
        exemples:[
          {question:"Calculer : 4 × (3 + 2)² (rappel : a² = a × a)", reponse:"Parenthèses d'abord : 3+2=5. Puis carré : 5²=25. Puis × : 4×25=100"},
          {question:"Traduire en expression : '5 élèves ont chacun 3 cahiers à 250 FCFA et 2 stylos à 100 FCFA. Coût total ?'", reponse:"5 × (3 × 250 + 2 × 100) = 5 × (750 + 200) = 5 × 950 = 4 750 FCFA"},
          {question:"Calcul astucieux : 7 × 98 + 7 × 2", reponse:"7 × 98 + 7 × 2 = 7 × (98 + 2) = 7 × 100 = 700"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer en respectant les priorités : 2 + 3 × 5", solution:"× d'abord : 3×5=15. Puis + : 2+15=17. (FAUX : (2+3)×5=25)"},
      {id:2,  niveau:"Facile",    enonce:"Calculer : (2 + 3) × 5", solution:"Parenthèses d'abord : 2+3=5. Puis × : 5×5=25"},
      {id:3,  niveau:"Facile",    enonce:"Calculer : 10 − 4 ÷ 2", solution:"÷ d'abord : 4÷2=2. Puis − : 10−2=8"},
      {id:4,  niveau:"Facile",    enonce:"Calculer : 12 ÷ 4 × 3 (attention à l'ordre !)", solution:"Même priorité ÷ et × → de gauche à droite : 12÷4=3, puis 3×3=9. (FAUX : 12÷(4×3)=1)"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 8 + 2 × 0", solution:"× d'abord : 2×0=0. Puis + : 8+0=8. (Un nombre multiplié par 0 donne 0 !)"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer : 3 × (4 + 5) − 2", solution:"Parenthèses : 4+5=9. Expression : 3×9−2. × d'abord : 27−2=25"},
      {id:7,  niveau:"Moyen",     enonce:"Calculer : 20 − (3 + 2) × 3", solution:"Parenthèses : 3+2=5. Expression : 20−5×3. × d'abord : 20−15=5"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer : 2,5 × 4 + 3 × 1,5", solution:"× d'abord : 2,5×4=10 et 3×1,5=4,5. Puis + : 10+4,5=14,5"},
      {id:9,  niveau:"Moyen",     enonce:"4 cahiers à 350 FCFA et 2 stylos à 125 FCFA. Écrire l'expression et calculer.", solution:"Expression : 4×350 + 2×125. × d'abord : 1400+250=1 650 FCFA"},
      {id:10, niveau:"Moyen",     enonce:"Calculer : (3 + 4) × 2 − 1", solution:"Parenthèses : 3+4=7. Expression : 7×2−1. × d'abord : 14−1=13"},
      {id:11, niveau:"Difficile", enonce:"Calculer : 4 × (3 + 2)² (rappel : (3+2)² signifie (3+2) × (3+2))", solution:"Parenthèses : 3+2=5. Carré : 5²=5×5=25. Multiplication : 4×25=100"},
      {id:12, niveau:"Difficile", enonce:"Calculer : (12 + 3 × 4) ÷ (2 × 4 − 2)", solution:"Parenthèse gauche : 3×4=12 puis 12+12=24. Parenthèse droite : 2×4=8 puis 8−2=6. Division : 24÷6=4"},
      {id:13, niveau:"Difficile", enonce:"Calculer astucieusement : 99 × 37 + 37 (sans calculatrice !)", solution:"On factorise : 37×99 + 37×1 = 37×(99+1) = 37×100 = 3 700"},
      {id:14, niveau:"Difficile", enonce:"Un marchand achète 50 ananas à 200 FCFA chacun et en vend 45 à 350 FCFA. Écrire l'expression du bénéfice et calculer.", solution:"Bénéfice = 45×350 − 50×200. × d'abord : 45×350=15750 et 50×200=10000. Bénéfice : 15 750 − 10 000 = 5 750 FCFA"},
      {id:15, niveau:"Difficile", enonce:"Calculer astucieusement : 25 × 48 × 4", solution:"On réorganise : (25×4) × 48 = 100 × 48 = 4 800. (La commutativité et l'associativité de la multiplication permettent ce regroupement)"},
    ],
  },
  8: {
    id:8, title:"Fractions", duration:"4 semaines",
    objectives:[
      "Comprendre la notion de fraction et ses différentes représentations",
      "Lire, écrire et représenter des fractions",
      "Trouver des fractions égales et simplifier une fraction",
      "Comparer et ordonner des fractions",
      "Additionner et soustraire des fractions de même dénominateur",
      "Calculer une fraction d'une quantité",
      "Convertir fractions et nombres décimaux",
    ],
    cours:[
      { id:"8-1", titre:"Qu'est-ce qu'une fraction ?",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION ET NOTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une FRACTION représente une ou plusieurs parties d'un tout divisé en parts égales.

NOTATION :   a
             ─  se lit "a sur b" ou "a b-ièmes"
             b

• a = NUMÉRATEUR : nombre de parts que l'on prend
• b = DÉNOMINATEUR : nombre de parts égales dans le tout

⚠️ Le dénominateur ne peut JAMAIS être égal à 0 !
   (Diviser par 0 est impossible en mathématiques)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REPRÉSENTATION CONCRÈTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : 3/8 d'une papaye
→ On coupe la papaye en 8 PARTS ÉGALES (dénominateur = 8)
→ On prend 3 de ces parts (numérateur = 3)
→ La fraction prise est 3/8

EXEMPLE : 2/5 d'un champ
→ On divise le champ en 5 parties égales
→ On cultive 2 de ces parties
→ La fraction cultivée est 2/5

SUR UNE DROITE GRADUÉE :
0─────|─────|─────|─────|─────1
      1/5   2/5   3/5   4/5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPES DE FRACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• FRACTION PROPRE : numérateur < dénominateur → valeur comprise entre 0 et 1
  Ex : 3/4 ; 2/7 ; 1/2 → ces fractions sont < 1

• FRACTION IMPROPRE : numérateur ≥ dénominateur → valeur ≥ 1
  Ex : 7/4 ; 5/3 ; 8/8 → ces fractions sont ≥ 1

• FRACTION = ENTIER : quand la division est exacte
  Ex : 6/3 = 2 ; 10/5 = 2 ; 12/4 = 3

• NOMBRE MIXTE : partie entière + fraction propre
  Ex : 1 + 3/4 = 7/4 (lire : "un et trois quarts")
  Conversion : 7/4 = (4+3)/4 = 4/4 + 3/4 = 1 + 3/4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOCABULAIRE DES FRACTIONS COURANTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 1/2 = un demi      • 1/3 = un tiers      • 1/4 = un quart
• 1/5 = un cinquième • 1/6 = un sixième    • 1/8 = un huitième
• 1/10 = un dixième  • 1/100 = un centième

• 2/3 = deux tiers   • 3/4 = trois quarts
• 3/5 = trois cinquièmes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRACTION D'UNE QUANTITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour calculer a/b d'une quantité Q :
MÉTHODE : Q × a ÷ b   (ou Q ÷ b × a, même résultat)

EXEMPLES :
• 3/4 de 200 FCFA = 200 × 3 ÷ 4 = 600 ÷ 4 = 150 FCFA
• 2/5 de 300 km  = 300 × 2 ÷ 5 = 600 ÷ 5 = 120 km
• 1/3 de 90 élèves = 90 ÷ 3 = 30 élèves

🌍 EXEMPLES AFRICAINS :
• Une papaye coupée en 8 parts. Maman mange 3 parts → 3/8 de la papaye.
  Il reste 8/8 − 3/8 = 5/8 de la papaye.
• Un champ de 2 400 m². On cultive 3/8 de la surface.
  Surface cultivée = 2 400 × 3 ÷ 8 = 900 m²
• Dans une classe de 36 élèves, 5/12 sont des filles.
  Nombre de filles = 36 × 5 ÷ 12 = 15 filles`,
        exemples:[
          {question:"Écrire en fraction : 3 parts prises sur 8 parts égales", reponse:"3/8 (numérateur=3, dénominateur=8)"},
          {question:"Calculer 3/4 de 120 FCFA", reponse:"120 × 3 ÷ 4 = 360 ÷ 4 = 90 FCFA"},
          {question:"Écrire 6/4 comme nombre mixte", reponse:"6/4 = 4/4 + 2/4 = 1 + 2/4 = 1 + 1/2 = 1,5"},
          {question:"5/5 = ? et 7/7 = ?", reponse:"5/5 = 1 et 7/7 = 1 (tout le tout = 1 entier)"},
        ]
      },
      { id:"8-2", titre:"Fractions égales et simplification",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRACTIONS ÉGALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deux fractions sont ÉGALES si elles représentent la même quantité.

PROPRIÉTÉ FONDAMENTALE :
On peut multiplier (ou diviser) le numérateur ET le dénominateur
par un même nombre NON NUL sans changer la valeur de la fraction.

  a       a × k         a       a ÷ k
  ─  =  ─────────  et  ─  =  ─────────  (si k divise a et b)
  b       b × k         b       b ÷ k

EXEMPLES :
• 1/2 = 2/4 = 3/6 = 4/8 = 5/10 (on multiplie par 2, 3, 4, 5...)
• 6/8 = 3/4 (on divise par 2)
• 4/6 = 2/3 (on divise par 2)
• 15/25 = 3/5 (on divise par 5)

ILLUSTRATION :
  1/2  :  |████░░░░|   (1 moitié coloriée sur 2)
  2/4  :  |████████░░░░░░░░|   (2 quarts coloriés sur 4)
  → C'est la même quantité !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AMPLIFIER UNE FRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AMPLIFIER = multiplier numérateur et dénominateur par un même entier k.
On obtient une fraction ÉGALE avec de plus grands termes.

Utilité : amener des fractions au même dénominateur.

EXEMPLE : Écrire 2/3 avec le dénominateur 12.
→ 12 ÷ 3 = 4 → on multiplie par 4
→ 2/3 = (2×4)/(3×4) = 8/12

EXEMPLE : Écrire 3/5 avec le dénominateur 20.
→ 20 ÷ 5 = 4 → on multiplie par 4
→ 3/5 = 12/20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIMPLIFIER UNE FRACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SIMPLIFIER = diviser numérateur et dénominateur par un même entier k > 1.
On obtient une fraction ÉGALE avec de plus petits termes.

FRACTION IRRÉDUCTIBLE : on ne peut plus simplifier
(le numérateur et le dénominateur n'ont plus de diviseur commun autre que 1).

MÉTHODE 1 : Simplifier progressivement.
Ex : 24/36 → ÷2 → 12/18 → ÷2 → 6/9 → ÷3 → 2/3 (irréductible ✓)

MÉTHODE 2 : Diviser directement par le PGCD (Plus Grand Commun Diviseur).
Ex : PGCD(24, 36) = 12 → 24/36 = (24÷12)/(36÷12) = 2/3

COMMENT TROUVER LE PGCD FACILEMENT ?
→ On cherche le plus grand nombre qui divise les deux.
Ex : PGCD(12, 18) → diviseurs de 12 : 1,2,3,4,6,12
                    diviseurs de 18 : 1,2,3,6,9,18
                    Communs : 1,2,3,6 → PGCD = 6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VÉRIFIER QU'UNE FRACTION EST IRRÉDUCTIBLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une fraction a/b est irréductible si PGCD(a,b) = 1
(on dit que a et b sont "premiers entre eux").

Ex : 7/12 → diviseurs de 7 : 1,7 ; diviseurs de 12 : 1,2,3,4,6,12
     Seul commun : 1 → PGCD(7,12)=1 → 7/12 est IRRÉDUCTIBLE ✓

🌍 EXEMPLES AFRICAINS :
• Sur 8 matchs joués, une équipe en a gagné 6.
  Fraction de victoires : 6/8 = 3/4 (÷2)
  → L'équipe a gagné les 3/4 de ses matchs.
• Dans un marché : 15 étals de légumes sur 25 étals au total.
  Fraction : 15/25 = 3/5 (÷5)
  → Les 3/5 des étals vendent des légumes.`,
        exemples:[
          {question:"Amplifier 3/4 pour obtenir le dénominateur 20", reponse:"20÷4=5 → on multiplie par 5 → 3/4 = 15/20"},
          {question:"Simplifier 18/24", reponse:"PGCD(18,24)=6 → 18÷6=3 et 24÷6=4 → 18/24 = 3/4"},
          {question:"Vérifier que 7/15 est irréductible", reponse:"Diviseurs de 7 : 1,7. Diviseurs de 15 : 1,3,5,15. Seul commun : 1 → PGCD=1 → irréductible ✓"},
          {question:"Simplifier 60/84", reponse:"PGCD(60,84) : 60=2²×3×5, 84=2²×3×7 → PGCD=2²×3=12 → 60/84=5/7"},
        ]
      },
      { id:"8-3", titre:"Comparer et ordonner des fractions",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAS 1 : MÊME DÉNOMINATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quand deux fractions ont le même dénominateur,
la plus grande est celle avec le plus grand NUMÉRATEUR.

EXEMPLES :
• 3/7 < 5/7 (même dénominateur 7 ; 3 < 5)
• 7/10 > 3/10 (même dénominateur 10 ; 7 > 3)
• 2/5 < 4/5 < 4/5 < 5/5 = 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAS 2 : DÉNOMINATEURS DIFFÉRENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : On ramène les fractions au même dénominateur (le PPCM ou un multiple commun), puis on compare les numérateurs.

PPCM = Plus Petit Commun Multiple des dénominateurs.

EXEMPLE 1 : Comparer 1/3 et 2/5
→ PPCM(3,5) = 15 (le plus petit multiple commun de 3 et 5)
→ 1/3 = 5/15  (×5) et  2/5 = 6/15  (×3)
→ 5/15 < 6/15 → donc 1/3 < 2/5

EXEMPLE 2 : Comparer 3/4 et 5/6
→ PPCM(4,6) = 12
→ 3/4 = 9/12  (×3) et  5/6 = 10/12  (×2)
→ 9/12 < 10/12 → donc 3/4 < 5/6

TROUVER LE PPCM :
→ Multiples de 4 : 4, 8, 12, 16, 20...
→ Multiples de 6 : 6, 12, 18, 24...
→ Premier commun : 12 → PPCM(4,6) = 12

ASTUCES RAPIDES :
• Si l'un des dénominateurs est multiple de l'autre :
  Ex : comparer 2/3 et 5/9 → PPCM(3,9)=9
  2/3 = 6/9 et 5/9 → 6/9 > 5/9 → 2/3 > 5/9

• Comparer avec 1/2 :
  Une fraction est > 1/2 si numérateur > dénominateur/2
  Ex : 5/8 > 1/2 car 5 > 8/2=4

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDONNER DES FRACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Ordonner dans l'ordre croissant : 3/4 ; 2/3 ; 5/6 ; 7/12
→ PPCM(4,3,6,12) = 12
→ 3/4 = 9/12 ; 2/3 = 8/12 ; 5/6 = 10/12 ; 7/12 = 7/12
→ Ordre croissant : 7/12 < 8/12 < 9/12 < 10/12
→ Soit : 7/12 < 2/3 < 3/4 < 5/6

🌍 EXEMPLES AFRICAINS :
• Quelle quantité est plus grande : 3/5 de 100 FCFA ou 5/8 de 100 FCFA ?
  3/5 = 24/40 et 5/8 = 25/40 → 3/5 < 5/8 → les 5/8 sont plus grands.
• Kofi a parcouru 2/3 du trajet, Aminata 3/5. Qui a parcouru le plus ?
  PPCM(3,5)=15 → 2/3=10/15 et 3/5=9/15 → Kofi a parcouru plus (10>9).`,
        exemples:[
          {question:"Comparer 5/8 et 3/5", reponse:"PPCM(8,5)=40 → 5/8=25/40 et 3/5=24/40 → 25>24 → 5/8 > 3/5"},
          {question:"Ordonner dans l'ordre croissant : 1/2 ; 1/3 ; 1/4 ; 1/6", reponse:"PPCM=12 → 6/12 ; 4/12 ; 3/12 ; 2/12 → ordre : 1/6 < 1/4 < 1/3 < 1/2"},
          {question:"Est-ce que 7/9 > 1/2 ? Comment le voir rapidement ?", reponse:"7 > 9/2=4,5 → oui, 7/9 > 1/2 ✓"},
        ]
      },
      { id:"8-4", titre:"Opérations sur les fractions",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITION ET SOUSTRACTION — MÊME DÉNOMINATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE : On additionne (ou soustrait) les NUMÉRATEURS.
        Le dénominateur RESTE le même.

  a   b   a + b         a   b   a − b
  ─ + ─ = ─────    et   ─ − ─ = ─────
  n   n     n            n   n     n

EXEMPLES :
• 3/7 + 2/7 = (3+2)/7 = 5/7
• 7/10 − 3/10 = (7−3)/10 = 4/10 = 2/5 (on simplifie !)
• 5/8 + 1/8 = 6/8 = 3/4 (on simplifie !)
• 1 − 3/8 = 8/8 − 3/8 = 5/8 (on écrit 1 = 8/8)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITION ET SOUSTRACTION — DÉNOMINATEURS DIFFÉRENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : On ramène au même dénominateur, puis on additionne les numérateurs.

EXEMPLE 1 : 1/3 + 1/4
→ PPCM(3,4) = 12
→ 1/3 = 4/12  et  1/4 = 3/12
→ 4/12 + 3/12 = 7/12

EXEMPLE 2 : 3/4 − 1/6
→ PPCM(4,6) = 12
→ 3/4 = 9/12  et  1/6 = 2/12
→ 9/12 − 2/12 = 7/12

EXEMPLE 3 : 2/3 + 3/5
→ PPCM(3,5) = 15
→ 2/3 = 10/15  et  3/5 = 9/15
→ 10/15 + 9/15 = 19/15 (fraction impropre, peut s'écrire 1 + 4/15)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRACTION D'UNE QUANTITÉ (approfondissement)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAPPEL : a/b de Q = Q × a ÷ b

PROBLÈME TYPE : "Un terrain de 1 200 m² est divisé : 3/8 pour le jardin,
1/4 pour la maison. Quelle fraction reste-t-il pour le garage ?"

ÉTAPE 1 : Calculer la fraction utilisée.
3/8 + 1/4 = 3/8 + 2/8 = 5/8 (on ramène 1/4 en huitièmes)

ÉTAPE 2 : Calculer la fraction restante.
1 − 5/8 = 8/8 − 5/8 = 3/8

ÉTAPE 3 : Calculer la surface du garage.
3/8 de 1 200 = 1 200 × 3 ÷ 8 = 450 m²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSION FRACTIONS ↔ DÉCIMAUX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRACTION → DÉCIMAL : on effectue la division numérateur ÷ dénominateur.
• 1/4 = 1 ÷ 4 = 0,25
• 3/8 = 3 ÷ 8 = 0,375
• 1/3 = 1 ÷ 3 = 0,333... (décimal illimité périodique)
• 2/5 = 2 ÷ 5 = 0,4

DÉCIMAL → FRACTION : on utilise la définition des décimaux.
• 0,7  = 7/10
• 0,35 = 35/100 = 7/20 (simplifié)
• 1,25 = 125/100 = 5/4 (simplifié)

FRACTIONS DÉCIMALES UTILES À CONNAÎTRE :
1/2=0,5 ; 1/4=0,25 ; 3/4=0,75 ; 1/5=0,2 ; 2/5=0,4 ; 3/5=0,6 ; 4/5=0,8
1/8=0,125 ; 1/10=0,1 ; 1/100=0,01

🌍 EXEMPLES AFRICAINS :
• Aminata mange 2/8 d'une tarte, Kofi mange 3/8.
  Fraction mangée : 2/8 + 3/8 = 5/8. Reste : 3/8.
• Budget : 1/4 pour le loyer, 1/3 pour la nourriture.
  Total dépensé : 1/4 + 1/3 = 3/12 + 4/12 = 7/12.
  Reste : 1 − 7/12 = 5/12 du budget.
• Un tissu de 6 m est coupé. On utilise 2/3. Quelle longueur reste-t-il ?
  Reste = 1/3 du tissu = 6 × 1/3 = 2 m.`,
        exemples:[
          {question:"Calculer : 3/8 + 1/8", reponse:"(3+1)/8 = 4/8 = 1/2 (on simplifie par 4)"},
          {question:"Calculer : 7/10 − 3/10", reponse:"(7−3)/10 = 4/10 = 2/5 (on simplifie par 2)"},
          {question:"Calculer : 1/3 + 1/4", reponse:"PPCM(3,4)=12 → 4/12 + 3/12 = 7/12"},
          {question:"Convertir 3/8 en décimal", reponse:"3 ÷ 8 : 30÷8=3r6 ; 60÷8=7r4 ; 40÷8=5r0 → 0,375"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Écrire en fraction : 3 parts prises sur 5 parts égales d'une orange.", solution:"3/5 (numérateur=3 parts prises, dénominateur=5 parts égales au total)"},
      {id:2,  niveau:"Facile",    enonce:"Calculer 1/4 de 200 FCFA.", solution:"200 × 1 ÷ 4 = 200 ÷ 4 = 50 FCFA"},
      {id:3,  niveau:"Facile",    enonce:"Simplifier la fraction 4/6.", solution:"PGCD(4,6)=2 → 4÷2=2 et 6÷2=3 → 4/6 = 2/3"},
      {id:4,  niveau:"Facile",    enonce:"Calculer : 2/5 + 1/5", solution:"(2+1)/5 = 3/5"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 7/9 − 4/9", solution:"(7−4)/9 = 3/9 = 1/3 (PGCD(3,9)=3 → on simplifie)"},
      {id:6,  niveau:"Moyen",     enonce:"Compléter : 3/4 = ?/20", solution:"20÷4=5 → on multiplie par 5 → 3/4 = 15/20"},
      {id:7,  niveau:"Moyen",     enonce:"Simplifier 18/24 jusqu'à la fraction irréductible.", solution:"PGCD(18,24)=6 → 18÷6=3 et 24÷6=4 → 18/24 = 3/4. Vérif : PGCD(3,4)=1 ✓ irréductible"},
      {id:8,  niveau:"Moyen",     enonce:"Comparer 5/8 et 3/5 en utilisant le même dénominateur.", solution:"PPCM(8,5)=40 → 5/8=25/40 et 3/5=24/40 → 25>24 → 5/8 > 3/5"},
      {id:9,  niveau:"Moyen",     enonce:"Dans une classe de 30 élèves, 2/5 sont des filles. Combien y a-t-il de filles ? Et de garçons ?", solution:"Filles : 30 × 2 ÷ 5 = 12 filles. Garçons : 30 − 12 = 18 garçons. Vérif : 12/30 = 2/5 ✓"},
      {id:10, niveau:"Moyen",     enonce:"Kofi mange 3/8 d'une pizza, Jean 2/8. Quelle fraction ont-ils mangée ensemble ? Que reste-t-il ?", solution:"Mangée : 3/8 + 2/8 = 5/8. Reste : 8/8 − 5/8 = 3/8."},
      {id:11, niveau:"Difficile", enonce:"Calculer 1/3 + 1/4 en détaillant toutes les étapes.", solution:"PPCM(3,4)=12. 1/3=4/12 (×4) et 1/4=3/12 (×3). Addition : 4/12+3/12=7/12. Vérif : PGCD(7,12)=1 → irréductible ✓"},
      {id:12, niveau:"Difficile", enonce:"Ranger dans l'ordre croissant : 3/4 ; 2/3 ; 5/6 ; 7/12", solution:"PPCM(4,3,6,12)=12. 3/4=9/12 ; 2/3=8/12 ; 5/6=10/12 ; 7/12=7/12. Ordre : 7/12 < 8/12 < 9/12 < 10/12 → 7/12 < 2/3 < 3/4 < 5/6"},
      {id:13, niveau:"Difficile", enonce:"Aminata dépense 1/4 de son argent en nourriture et 1/3 en transport. Quelle fraction lui reste-t-il ?", solution:"Dépensé : 1/4+1/3. PPCM(4,3)=12 → 3/12+4/12=7/12. Reste : 1−7/12=12/12−7/12=5/12"},
      {id:14, niveau:"Difficile", enonce:"Un terrain de 1 200 m² est divisé : 3/8 pour le jardin, 1/4 pour la maison, le reste pour le garage. Calculer la surface de chaque partie.", solution:"Jardin : 1200×3÷8=450 m². Maison : 1200×1÷4=300 m². Fraction garage : 1−3/8−2/8=3/8. Garage : 1200×3÷8=450 m². Vérif : 450+300+450=1200 ✓"},
      {id:15, niveau:"Difficile", enonce:"Montrer que 2/3 de 3/4 = 1/2. Que signifie concrètement cette opération ?", solution:"2/3 de 3/4 = 3/4 × 2 ÷ 3 = (3×2)÷(4×3) = 6/12 = 1/2. Concrètement : si on prend 3/4 d'une tarte, puis 2/3 de ce morceau, on obtient exactement la moitié de la tarte entière."},
    ],
  },

  9: {
    id:9, title:"Droites et angles", duration:"3 semaines",
    objectives:[
      "Distinguer droite, demi-droite et segment",
      "Reconnaître et nommer des angles",
      "Mesurer et construire des angles avec le rapporteur",
      "Connaître les différents types d'angles",
      "Reconnaître et tracer des droites perpendiculaires et parallèles",
    ],
    cours:[
      { id:"9-1", titre:"Droites, demi-droites et segments",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LA DROITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une DROITE est une ligne rectiligne qui s'étend infiniment dans les deux sens.

Représentation :   ←──────────────→
                        (d)

• Une droite n'a ni début ni fin
• On la note avec une lettre minuscule : (d), (Δ), (ℓ)...
• Ou par deux points qu'elle contient : la droite (AB)
• Elle est infinie : on ne peut jamais la dessiner entièrement (on dessine une portion)

PROPRIÉTÉ FONDAMENTALE :
Par deux points distincts, il passe UNE ET UNE SEULE droite.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LA DEMI-DROITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une DEMI-DROITE a une ORIGINE (un début) mais s'étend infiniment d'un seul côté.

Représentation :   A──────────────→
                   (origine)

• Elle a un début (l'origine) mais pas de fin
• On la note [AB) : origine A, passant par B
• La demi-droite [AB) et la demi-droite [BA) sont DIFFÉRENTES !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE SEGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un SEGMENT a deux EXTRÉMITÉS. C'est la portion de droite entre deux points.

Représentation :   A──────────────B
                   (extrémité)    (extrémité)

• Il a un début (A) et une fin (B)
• On le note [AB] ou [BA] (même segment)
• Sa LONGUEUR se note AB (sans crochets)
• On mesure sa longueur avec une règle graduée

COMPARAISON :
• Droite (AB)   : ←────A────B────→  (infinie dans les 2 sens)
• Demi-droite [AB) : A────B────→    (infinie vers la droite)
• Segment [AB]  : A────────────B    (finie des 2 côtés)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MILIEU D'UN SEGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le MILIEU d'un segment [AB] est le point M tel que AM = MB.
M est à égale distance de A et de B.

Si AB = 8 cm, alors M est le milieu → AM = MB = 4 cm.

CONSTRUCTION DU MILIEU :
Méthode 1 : On mesure AB, on divise par 2, on reporte depuis A.
Méthode 2 : Au compas → tracer des arcs de même rayon depuis A et B,
les points d'intersection donnent la médiatrice, qui coupe [AB] en son milieu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POINTS ALIGNÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Des points sont ALIGNÉS s'ils appartiennent tous à la même droite.

EXEMPLE :
A, B, C sont alignés :   A────B────C────→
A, B, C ne sont pas alignés :
         A
          \
    ───────B───────
                C

🌍 EXEMPLES AFRICAINS :
• Les poteaux électriques le long d'une route sont alignés
• La route de Libreville à Owendo est un segment (elle a un début et une fin)
• Le fleuve Ogooué s'étend comme une droite (vue de loin)`,
        exemples:[
          {question:"Quelle est la différence entre [AB], [AB) et (AB) ?", reponse:"[AB] = segment (de A à B, fini). [AB) = demi-droite (de A vers B, infini d'un côté). (AB) = droite (infinie des deux côtés)."},
          {question:"M est le milieu de [AB] avec AB = 12 cm. Calculer AM.", reponse:"AM = AB ÷ 2 = 12 ÷ 2 = 6 cm"},
          {question:"Peut-on tracer plusieurs droites passant par un seul point ?", reponse:"Oui, une infinité de droites passent par un point. Mais par DEUX points, une seule droite est possible."},
        ]
      },
      { id:"9-2", titre:"Les angles",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION D'UN ANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un ANGLE est formé par deux demi-droites ayant la même ORIGINE appelée SOMMET.
Les deux demi-droites s'appellent les CÔTÉS de l'angle.

REPRÉSENTATION :
         B
          \
           \  ← l'angle est ici (l'espace entre les deux côtés)
            \
             S──────────→ A
             (sommet)

NOTATION : angle en S, noté :
• Â S B  (avec le sommet au milieu)
• ∠ASB ou ∠BSA
• ∠S (si on parle d'un seul angle en S)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESURE D'UN ANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La mesure d'un angle s'exprime en DEGRÉS (symbole : °).

• Un tour complet = 360°
• Un demi-tour = 180°
• Un quart de tour = 90°

UTILISATION DU RAPPORTEUR :
1. Placer le centre du rapporteur sur le SOMMET de l'angle
2. Aligner le zéro du rapporteur avec un des CÔTÉS de l'angle
3. Lire la mesure sur le rapporteur là où passe l'autre côté
4. Choisir la bonne graduation (0° à 180° selon le sens)

⚠️ ATTENTION : Le rapporteur a deux échelles (0→180° et 180→0°).
Toujours partir du côté où se trouve le zéro !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPES D'ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ANGLE NUL : mesure = 0° (les deux côtés sont confondus)

• ANGLE AIGU : 0° < mesure < 90°
  Exemple : angle de 45°, 30°, 60°
     B
      \
       \  ← angle aigu
        \
         S──────→ A

• ANGLE DROIT : mesure = 90° (exactement)
  Symbole : un petit carré au sommet
     B
     |
     |  ← 90°
     |□
     S──────→ A

• ANGLE OBTUS : 90° < mesure < 180°
  Exemple : angle de 120°, 150°
  B
   \
    \      ← angle obtus
     \
      S──────→ A

• ANGLE PLAT : mesure = 180°
  Les deux côtés forment une droite.
  A ←──────S──────→ B

• ANGLE RENTRANT : 180° < mesure < 360°
  (angle "vers l'intérieur")

• ANGLE PLEIN : mesure = 360° (tour complet)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANGLES PARTICULIERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• ANGLES COMPLÉMENTAIRES : leur somme = 90°
  Ex : 30° et 60° sont complémentaires (30+60=90)

• ANGLES SUPPLÉMENTAIRES : leur somme = 180°
  Ex : 45° et 135° sont supplémentaires (45+135=180)

• ANGLES ADJACENTS : même sommet, un côté commun, et ne se chevauchent pas.
  Deux angles adjacents supplémentaires forment un angle plat.

🌍 EXEMPLES AFRICAINS :
• Les aiguilles d'une montre à 3h forment un angle droit (90°)
• Le toit d'une maison africaine forme souvent un angle aigu
• Une route en ligne droite fait un angle plat (180°) avec elle-même
• Un éventail ouvert à moitié forme un angle d'environ 90°`,
        exemples:[
          {question:"Classer ces angles : 30°, 90°, 120°, 180°, 45°", reponse:"30°→aigu ; 90°→droit ; 120°→obtus ; 180°→plat ; 45°→aigu"},
          {question:"Deux angles sont complémentaires. L'un mesure 35°. Mesure de l'autre ?", reponse:"90° − 35° = 55°"},
          {question:"Deux angles sont supplémentaires. L'un mesure 110°. Mesure de l'autre ?", reponse:"180° − 110° = 70°"},
          {question:"Comment reconnaître un angle droit sans rapporteur ?", reponse:"On utilise une équerre ou le coin d'une feuille de papier (qui fait exactement 90°)."},
        ]
      },
      { id:"9-3", titre:"Droites perpendiculaires et parallèles",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROITES PERPENDICULAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deux droites sont PERPENDICULAIRES si elles se coupent en formant un ANGLE DROIT (90°).

NOTATION : (d₁) ⊥ (d₂)  se lit "d1 est perpendiculaire à d2"

REPRÉSENTATION :
     (d₂)
      │
      │□ ← angle droit (90°)
──────┼──────── (d₁)
      │

PROPRIÉTÉ : Deux droites perpendiculaires à une même droite sont PARALLÈLES entre elles.

CONSTRUCTION D'UNE PERPENDICULAIRE :
Tracer la perpendiculaire à (d) passant par le point A :
1. Poser l'équerre sur la droite (d)
2. Faire glisser l'équerre jusqu'à ce qu'un côté passe par A
3. Tracer la droite le long du côté de l'équerre

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DROITES PARALLÈLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deux droites sont PARALLÈLES si elles ne se coupent JAMAIS
(même dans les deux sens à l'infini).

NOTATION : (d₁) // (d₂)  se lit "d1 est parallèle à d2"

REPRÉSENTATION :
──────────────────── (d₁)

──────────────────── (d₂)

(Les deux droites sont à égale distance l'une de l'autre)

PROPRIÉTÉ IMPORTANTE :
Si (d₁) // (d₂) et si une droite (d₃) coupe (d₁),
alors (d₃) coupe aussi (d₂).

PROPRIÉTÉ : Deux droites parallèles à une même droite sont parallèles entre elles.

CONSTRUCTION DE PARALLÈLES :
Tracer la parallèle à (d) passant par le point A :
1. Tracer la perpendiculaire à (d) passant par A → on obtient (p)
2. Tracer la perpendiculaire à (p) passant par A → on obtient la parallèle à (d)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POSITION RELATIVE DE DEUX DROITES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dans un plan, deux droites peuvent être :
• SÉCANTES : elles se coupent en un point (cas général)
  - Perpendiculaires si l'angle = 90° (cas particulier)
• PARALLÈLES : elles ne se coupent jamais
  - Confondues si ce sont exactement les mêmes points (cas limite)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISTANCE D'UN POINT À UNE DROITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La DISTANCE d'un point A à une droite (d) est la longueur du segment
perpendiculaire abaissé de A sur (d).

C'est la PLUS COURTE distance entre le point et la droite.

     A
     |\
     | \  ← pas le plus court chemin
     |  \
     |   \
─────H────────── (d)
  ↑
  AH est la distance (H = pied de la perpendiculaire)
  AH ⊥ (d)

🌍 EXEMPLES AFRICAINS :
• Les rails d'un chemin de fer sont parallèles
• Les lignes d'un cahier sont parallèles
• Le mur d'une maison est perpendiculaire au sol
• Les deux rives d'un canal sont parallèles
• Les barreaux d'une échelle sont parallèles entre eux et perpendiculaires aux montants`,
        exemples:[
          {question:"Les rails d'un train font-ils des droites parallèles ou perpendiculaires ?", reponse:"Parallèles (// ) : les rails ne se croisent jamais, ils restent à la même distance."},
          {question:"Deux droites forment un angle de 90°. Comment les appelle-t-on ?", reponse:"Droites perpendiculaires (⊥). L'angle droit est symbolisé par un petit carré."},
          {question:"Comment tracer la perpendiculaire à une droite (d) passant par un point A ?", reponse:"1. Placer l'équerre sur (d). 2. Faire glisser jusqu'à ce qu'un côté passe par A. 3. Tracer la droite le long du bord perpendiculaire de l'équerre."},
          {question:"(d1) // (d2) et (d2) // (d3). Que peut-on dire de (d1) et (d3) ?", reponse:"(d1) // (d3) : deux droites parallèles à une même droite sont parallèles entre elles."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Donner la notation correcte pour : un segment entre A et B, une droite passant par C et D, une demi-droite d'origine E passant par F.", solution:"Segment : [AB]. Droite : (CD). Demi-droite : [EF)"},
      {id:2,  niveau:"Facile",    enonce:"M est le milieu de [PQ] avec PQ = 10 cm. Calculer PM et MQ.", solution:"PM = MQ = PQ ÷ 2 = 10 ÷ 2 = 5 cm"},
      {id:3,  niveau:"Facile",    enonce:"Classer ces angles du plus petit au plus grand : 75°, 90°, 15°, 180°, 120°.", solution:"15° (aigu) < 75° (aigu) < 90° (droit) < 120° (obtus) < 180° (plat)"},
      {id:4,  niveau:"Facile",    enonce:"Quel type d'angle fait une aiguille de montre entre 12h et 3h ?", solution:"Angle droit (90°) : le quart d'un tour complet de 360°."},
      {id:5,  niveau:"Facile",    enonce:"Deux droites sont-elles parallèles si elles ne se coupent pas sur la feuille ?", solution:"Pas nécessairement ! Deux droites peuvent sembler ne pas se couper sur la feuille mais se croiseraient si on prolongeait. Il faut vérifier avec l'équerre et la règle."},
      {id:6,  niveau:"Moyen",     enonce:"Deux angles sont supplémentaires. L'un mesure 72°. Quelle est la mesure de l'autre ?", solution:"180° − 72° = 108°. Vérif : 72° + 108° = 180° ✓"},
      {id:7,  niveau:"Moyen",     enonce:"Un angle mesure 35°. Quel est son angle complémentaire ? Son angle supplémentaire ?", solution:"Complémentaire : 90° − 35° = 55°. Supplémentaire : 180° − 35° = 145°."},
      {id:8,  niveau:"Moyen",     enonce:"M est un point du segment [AB] tel que AM = 4 cm et MB = 6 cm. M est-il le milieu de [AB] ?", solution:"AB = AM + MB = 4 + 6 = 10 cm. Le milieu serait à 5 cm de A. Comme AM = 4 ≠ 5, M n'est PAS le milieu."},
      {id:9,  niveau:"Moyen",     enonce:"Sur la figure, (d1) ⊥ (d2) et (d2) ⊥ (d3). Que peut-on dire de (d1) et (d3) ?", solution:"(d1) // (d3) : deux droites perpendiculaires à une même droite sont parallèles entre elles."},
      {id:10, niveau:"Moyen",     enonce:"La distance de A à la droite (d) est 3 cm. Expliquer ce que cela signifie.", solution:"Il existe un point H sur (d) tel que AH ⊥ (d) et AH = 3 cm. C'est le plus court chemin de A à (d). Tout autre chemin de A à (d) est plus long que 3 cm."},
      {id:11, niveau:"Difficile", enonce:"Un angle mesure x°. Son complémentaire mesure le double de son supplémentaire. Trouver x.", solution:"Complémentaire : (90−x)°. Supplémentaire : (180−x)°. Équation : 90−x = 2×(180−x) → 90−x = 360−2x → x = 270°. Mais 270° n'a pas de complémentaire (>90°) ! → Problème impossible."},
      {id:12, niveau:"Difficile", enonce:"ABCD est un quadrilatère. On sait que (AB) // (DC) et (AD) ⊥ (AB). Quel type de quadrilatère est ABCD ? Justifier.", solution:"(AB) // (DC) → deux côtés parallèles → trapèze au minimum. (AD) ⊥ (AB) → un angle droit. Si de plus (BC) ⊥ (AB), c'est un rectangle ou un carré."},
      {id:13, niveau:"Difficile", enonce:"Sur une droite (d), on place les points A, B, C dans cet ordre avec AB = 5 cm et AC = 9 cm. Calculer BC. Trouver le milieu de [AC].", solution:"BC = AC − AB = 9 − 5 = 4 cm. Milieu de [AC] : à 9÷2 = 4,5 cm de A → point M avec AM = 4,5 cm."},
      {id:14, niveau:"Difficile", enonce:"Deux droites se coupent et forment 4 angles. L'un mesure 70°. Calculer les 3 autres.", solution:"Angle opposé = 70° (angles opposés par le sommet sont égaux). Les deux autres sont supplémentaires à 70° : 180°−70°=110°. Les 4 angles : 70°, 110°, 70°, 110°. Vérif : 70+110+70+110=360° ✓"},
      {id:15, niveau:"Difficile", enonce:"Un terrain rectangulaire a un angle de 90°. En utilisant les propriétés des perpendiculaires et parallèles, expliquer pourquoi les 4 angles d'un rectangle sont tous droits.", solution:"Un rectangle a (AB) // (DC) et (AD) // (BC). De plus (AB) ⊥ (AD). Comme (AB) ⊥ (AD) et (DC) // (AB), alors (DC) ⊥ (AD) → angle D = 90°. Comme (AD) ⊥ (AB) et (BC) // (AD), alors (BC) ⊥ (AB) → angle B = 90°. Comme (AB) ⊥ (BC) et (DC) // (AB), alors (DC) ⊥ (BC) → angle C = 90°. Tous les angles = 90° ✓"},
    ],
  },

  10: {
    id:10, title:"Triangles", duration:"3 semaines",
    objectives:[
      "Reconnaître et nommer les éléments d'un triangle",
      "Connaître et utiliser la propriété de la somme des angles",
      "Distinguer les différents types de triangles",
      "Construire un triangle à la règle et au compas",
      "Calculer le périmètre d'un triangle",
      "Connaître l'inégalité triangulaire",
    ],
    cours:[
      { id:"10-1", titre:"Définition et éléments d'un triangle",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un TRIANGLE est une figure géométrique plane formée par TROIS POINTS
non alignés réunis par TROIS SEGMENTS.

REPRÉSENTATION :
              A
             /\
            /  \
           /    \
          /      \
         B────────C

• A, B, C sont les SOMMETS du triangle (points de rencontre des côtés)
• [AB], [BC], [CA] sont les CÔTÉS du triangle
• Les angles en A, B et C sont les ANGLES du triangle

NOTATION : Triangle ABC → écrit △ABC (le symbole △ signifie "triangle")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉLÉMENTS D'UN TRIANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CÔTÉS : Les trois segments [AB], [BC] et [CA].
  • On note leur longueur : AB, BC et CA (sans crochets)

ANGLES :
  • L'angle en A (noté ∠A ou  B̂AC) est formé par les côtés [AB] et [AC]
  • L'angle en B (noté ∠B) est formé par les côtés [BA] et [BC]
  • L'angle en C (noté ∠C) est formé par les côtés [CA] et [CB]

HAUTEURS : La hauteur issue de A est le segment perpendiculaire
  de A au côté opposé (ou son prolongement). Un triangle a 3 hauteurs.

MÉDIANES : La médiane issue de A relie A au milieu du côté opposé [BC].
  Un triangle a 3 médianes, elles se croisent en un point appelé CENTRE DE GRAVITÉ.

MÉDIATRICES : La médiatrice d'un côté est la droite perpendiculaire à ce côté
  passant par son milieu. Les 3 médiatrices se croisent au CENTRE DU CERCLE CIRCONSCRIT.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉ FONDAMENTALE — SOMME DES ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dans TOUT triangle, la somme des trois angles est TOUJOURS égale à 180°.

∠A + ∠B + ∠C = 180°

Cette propriété est universelle — elle est vraie pour TOUS les triangles !

DÉMONSTRATION INTUITIVE :
Découpe un triangle en papier. Arrache les 3 angles.
Mets-les bout à bout → ils forment exactement un angle plat (180°) !

APPLICATIONS :
• Si ∠A = 60° et ∠B = 80°, alors ∠C = 180° − 60° − 80° = 40°
• Si ∠A = ∠B = ∠C, alors 3∠A = 180° → ∠A = 60°
• Si ∠A = 90°, alors ∠B + ∠C = 90° (les deux autres angles sont complémentaires)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INÉGALITÉ TRIANGULAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONDITION D'EXISTENCE D'UN TRIANGLE :
Trois longueurs a, b, c peuvent former un triangle si et seulement si
CHAQUE côté est STRICTEMENT PLUS PETIT que la SOMME des deux autres.

a < b + c   ET   b < a + c   ET   c < a + b

En pratique, il suffit de vérifier que LE PLUS GRAND côté est inférieur
à la somme des deux autres.

EXEMPLES :
• 3 cm, 4 cm, 5 cm : 5 < 3+4=7 ✓ → triangle possible
• 2 cm, 3 cm, 7 cm : 7 < 2+3=5 ✗ → triangle IMPOSSIBLE (7 > 5)
• 5 cm, 5 cm, 5 cm : 5 < 5+5=10 ✓ → triangle possible

🌍 EXEMPLES AFRICAINS :
• Un terrain triangulaire à Libreville avec des côtés de 15 m, 20 m et 25 m
  → 25 < 15+20=35 ✓ → terrain possible
• Un triangle de drapeaux : côtés 3 m, 3 m et 5 m
  → 5 < 3+3=6 ✓ → possible`,
        exemples:[
          {question:"Dans le △ABC, ∠A = 50° et ∠B = 70°. Calculer ∠C.", reponse:"∠C = 180° − 50° − 70° = 60°"},
          {question:"Peut-on construire un triangle avec 2 cm, 5 cm et 8 cm ?", reponse:"8 < 2+5=7 ? NON, 8 > 7 → triangle IMPOSSIBLE"},
          {question:"Un triangle a deux angles de 45° chacun. Quel est le troisième ?", reponse:"∠C = 180° − 45° − 45° = 90° → c'est un triangle rectangle isocèle"},
        ]
      },
      { id:"10-2", titre:"Types de triangles",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASSIFICATION SELON LES CÔTÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TRIANGLE SCALÈNE : les TROIS côtés ont des longueurs DIFFÉRENTES.
   (et les trois angles sont différents)
         A
        /\
       /  \
      /    \
     B──────C
   AB ≠ BC ≠ CA

2. TRIANGLE ISOCÈLE : exactement DEUX côtés ont la MÊME longueur.
   • Les deux côtés égaux s'appellent les CÔTÉS ISOCÈLES (ou jambes)
   • Le troisième côté s'appelle la BASE
   • Les deux angles à la BASE sont ÉGAUX
         A
        /\
       /  \  ← côtés égaux (AB = AC)
      /    \
     B──────C
     (base BC)
   PROPRIÉTÉ : Dans un triangle isocèle (AB=AC), ∠B = ∠C

3. TRIANGLE ÉQUILATÉRAL : les TROIS côtés ont la MÊME longueur.
   • Les trois angles sont TOUS ÉGAUX à 60° (car 180°÷3=60°)
         A
        /\
       /  \
      /    \
     B──────C
   AB = BC = CA   et   ∠A = ∠B = ∠C = 60°
   ⚠️ Un triangle équilatéral est un cas particulier de triangle isocèle !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLASSIFICATION SELON LES ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. TRIANGLE RECTANGLE : UN des angles est droit (= 90°).
   • Le côté opposé à l'angle droit s'appelle l'HYPOTÉNUSE (le plus long côté)
   • Les deux autres côtés s'appellent les CATHÈTES
   • Le symbole □ indique l'angle droit

         A
         |\ 
         | \  ← hypoténuse [BC]
         |  \
         |□  \
         B────C
   ∠B = 90°, [AC] est l'hypoténuse

   PROPRIÉTÉ DE PYTHAGORE (à retenir pour la 4ème) :
   Dans un triangle rectangle en B : AC² = AB² + BC²

5. TRIANGLE ACUTANGLE : les TROIS angles sont aigus (< 90°).

6. TRIANGLE OBTUSANGLE : UN des angles est obtus (> 90°).
   (Les deux autres sont forcément aigus car leur somme doit faire < 90°)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMBINAISONS POSSIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On peut combiner les deux classifications :
• Triangle rectangle isocèle : angle droit ET deux côtés égaux
• Triangle rectangle scalène : angle droit ET trois côtés différents
• Triangle isocèle acutangle : deux côtés égaux ET tous angles aigus
• Triangle équilatéral (toujours acutangle car 60° < 90°)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PÉRIMÈTRE D'UN TRIANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le PÉRIMÈTRE est la longueur du contour (la somme des trois côtés).

FORMULE : P = AB + BC + CA

EXEMPLES :
• △ABC avec AB=5 cm, BC=7 cm, CA=4 cm → P = 5+7+4 = 16 cm
• Triangle équilatéral de côté 6 cm → P = 6+6+6 = 3×6 = 18 cm
• Triangle isocèle avec côtés égaux = 8 cm et base = 5 cm → P = 8+8+5 = 21 cm

🌍 EXEMPLES AFRICAINS :
• Un toit de maison triangulaire avec des pentes de 4 m, 4 m et une base de 6 m
  → C'est un triangle isocèle ! P = 4+4+6 = 14 m
• Un terrain triangulaire au Cameroun : 120 m, 85 m, 95 m
  → Triangle scalène. P = 120+85+95 = 300 m (il faut 300 m de clôture)
• Un drapeau triangulaire équilatéral de côté 50 cm
  → P = 3×50 = 150 cm = 1,5 m`,
        exemples:[
          {question:"Un triangle a les angles 60°, 60° et 60°. Quel type est-ce ?", reponse:"Triangle équilatéral (trois angles égaux à 60° ET trois côtés égaux)"},
          {question:"△ABC avec AB=AC=7 cm et ∠B=50°. Calculer ∠A et ∠C.", reponse:"Isocèle (AB=AC) → ∠B=∠C=50°. Donc ∠A=180°−50°−50°=80°"},
          {question:"Calculer le périmètre d'un triangle isocèle de base 4 cm et de côtés égaux 6 cm.", reponse:"P = 6 + 6 + 4 = 16 cm"},
          {question:"Un triangle rectangle a ses cathètes égales à 3 cm et 4 cm. Quelle est la longueur de l'hypoténuse ? (Utiliser le fait que 3²+4²=5²)", reponse:"Hypoténuse = 5 cm (triangle 3-4-5, triangle rectangle classique)"},
        ]
      },
      { id:"10-3", titre:"Construction d'un triangle",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUAND PEUT-ON CONSTRUIRE UN TRIANGLE ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour construire un triangle de manière unique, il faut connaître :
• Les trois côtés (CCC)
• Deux côtés et l'angle compris entre eux (CAC)
• Un côté et les deux angles adjacents (ACA)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRUCTION AVEC LES 3 CÔTÉS (AU COMPAS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Construire △ABC avec AB=6 cm, BC=5 cm, CA=4 cm

ÉTAPE 1 : Tracer le segment [AB] = 6 cm.
   A──────────────B  (6 cm)

ÉTAPE 2 : Ouvrir le compas à 5 cm (= BC). Piquer en B.
   Tracer un arc de cercle.

ÉTAPE 3 : Ouvrir le compas à 4 cm (= CA). Piquer en A.
   Tracer un arc de cercle qui coupe le premier.

ÉTAPE 4 : Le point d'intersection des deux arcs est le point C.
   Tracer les segments [AC] et [BC].

VÉRIFICATION : Mesurer les côtés et vérifier AB+BC+CA=15 cm.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRUCTION D'UN TRIANGLE RECTANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Construire △ABC rectangle en B avec AB=5 cm et BC=3 cm.

ÉTAPE 1 : Tracer le segment [AB] = 5 cm.
ÉTAPE 2 : En B, tracer la perpendiculaire à [AB] à l'aide de l'équerre.
ÉTAPE 3 : Sur cette perpendiculaire, reporter BC = 3 cm → placer C.
ÉTAPE 4 : Tracer [AC].

VÉRIFICATION : L'angle en B doit être droit (vérifier avec l'équerre).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRUCTION D'UN TRIANGLE ISOCÈLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Construire △ABC isocèle en A avec AB=AC=5 cm et BC=6 cm.

ÉTAPE 1 : Tracer la base [BC] = 6 cm.
ÉTAPE 2 : Trouver le milieu M de [BC] (à 3 cm de B et C).
ÉTAPE 3 : Tracer la médiatrice de [BC] passant par M (perpendiculaire à BC en M).
ÉTAPE 4 : Sur cette médiatrice, placer A tel que AB = 5 cm (utiliser le compas).
ÉTAPE 5 : Tracer [AB] et [AC].

⚠️ Le sommet A d'un triangle isocèle est toujours sur la médiatrice de la base !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAUTEUR D'UN TRIANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La HAUTEUR issue de A est le segment [AH] où :
• H est sur le côté [BC] (ou son prolongement)
• [AH] ⊥ [BC]

CONSTRUCTION :
1. Tracer la perpendiculaire à [BC] passant par A (avec équerre)
2. H est le pied de cette perpendiculaire sur [BC]
3. [AH] est la hauteur issue de A

🌍 EXEMPLES AFRICAINS :
• Construire un triangle représentant un toit de maison gabonaise :
  Base = 8 m (largeur de la maison), deux pentes = 5 m chacun
  → Triangle isocèle !
• Un terrain triangulaire à Douala : on mesure les 3 côtés sur le terrain
  et on construit la figure à l'échelle 1:1000 sur papier.`,
        exemples:[
          {question:"Peut-on construire un triangle avec côtés 3, 3 et 3 cm ? Quel type ?", reponse:"Oui (3 < 3+3=6 ✓). C'est un triangle équilatéral."},
          {question:"Combien de triangles différents peut-on construire avec AB=5, BC=4, CA=3 cm ?", reponse:"Un seul (à la position et à l'orientation près). La construction avec compas donne un résultat unique."},
          {question:"Dans △ABC rectangle en B, si AB=6 cm et BC=8 cm, calculer le périmètre.", solution:"AC = hypoténuse. 6²+8²=36+64=100=10² → AC=10 cm. P=6+8+10=24 cm."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Dans △ABC, ∠A = 40° et ∠B = 65°. Calculer ∠C.", solution:"∠C = 180° − 40° − 65° = 75°. Vérif : 40+65+75=180° ✓"},
      {id:2,  niveau:"Facile",    enonce:"Calculer le périmètre du △ABC avec AB = 7 cm, BC = 5 cm et CA = 6 cm.", solution:"P = AB + BC + CA = 7 + 5 + 6 = 18 cm"},
      {id:3,  niveau:"Facile",    enonce:"Peut-on construire un triangle avec les côtés 4 cm, 6 cm et 3 cm ?", solution:"Le plus grand côté est 6. 6 < 4+3=7 ✓ → OUI, triangle possible."},
      {id:4,  niveau:"Facile",    enonce:"Peut-on construire un triangle avec les côtés 2 cm, 3 cm et 7 cm ?", solution:"Le plus grand côté est 7. 7 < 2+3=5 ? NON, 7 > 5 → triangle IMPOSSIBLE."},
      {id:5,  niveau:"Facile",    enonce:"Un triangle équilatéral a un côté de 8 cm. Calculer son périmètre et ses angles.", solution:"P = 3 × 8 = 24 cm. Angles : ∠A = ∠B = ∠C = 60° (car 180÷3=60)."},
      {id:6,  niveau:"Moyen",     enonce:"△ABC est isocèle en A avec ∠B = 55°. Calculer ∠A et ∠C.", solution:"Isocèle en A → AB=AC → ∠B=∠C=55°. ∠A = 180°−55°−55° = 70°."},
      {id:7,  niveau:"Moyen",     enonce:"Un triangle a un angle obtus de 110° et un angle de 35°. Calculer le troisième angle. Quel type de triangle est-ce ?", solution:"3e angle = 180°−110°−35°=35°. Deux angles égaux (35°) → triangle ISOCÈLE et OBTUSANGLE."},
      {id:8,  niveau:"Moyen",     enonce:"△ABC rectangle en C avec ∠A = 30°. Calculer ∠B.", solution:"∠C = 90°. ∠A + ∠B + ∠C = 180° → 30° + ∠B + 90° = 180° → ∠B = 60°."},
      {id:9,  niveau:"Moyen",     enonce:"Un terrain triangulaire a des côtés de 45 m, 60 m et 75 m. Calculer le périmètre. Est-ce un triangle rectangle ? (vérifier si 45²+60²=75²)", solution:"P = 45+60+75 = 180 m. 45²=2025, 60²=3600, 75²=5625. 2025+3600=5625=75² ✓ → OUI, triangle rectangle !"},
      {id:10, niveau:"Moyen",     enonce:"Construire le triangle △ABC isocèle en A avec BC = 5 cm et AB = AC = 4 cm. Décrire les étapes.", solution:"1. Tracer [BC]=5cm. 2. Trouver le milieu M de [BC] (à 2,5 cm de B). 3. Tracer la médiatrice de [BC] (⊥ en M). 4. Ouvrir compas à 4 cm depuis B → trouver A sur la médiatrice. 5. Tracer [AB] et [AC]."},
      {id:11, niveau:"Difficile", enonce:"Dans △ABC, ∠A = 2×∠B et ∠C = 3×∠B. Calculer les trois angles.", solution:"∠A + ∠B + ∠C = 180° → 2∠B + ∠B + 3∠B = 180° → 6∠B = 180° → ∠B = 30°. Donc ∠A = 60°, ∠B = 30°, ∠C = 90°. C'est un triangle RECTANGLE !"},
      {id:12, niveau:"Difficile", enonce:"Un triangle isocèle a un périmètre de 32 cm. La base mesure 8 cm. Calculer la longueur des côtés égaux.", solution:"Somme des côtés égaux = 32 − 8 = 24 cm. Chaque côté = 24 ÷ 2 = 12 cm. Vérif : 12+12+8=32 ✓ et inégalité : 12 < 12+8=20 ✓"},
      {id:13, niveau:"Difficile", enonce:"△ABC a pour angles ∠A = 45°, ∠B = 90°, ∠C = 45°. Quel type de triangle est-ce ? Que peut-on dire de ses côtés ?", solution:"∠B = 90° → rectangle. ∠A = ∠C = 45° → isocèle. C'est un triangle RECTANGLE ISOCÈLE. Les côtés : AB = BC (côtés de l'angle droit égaux). [AC] est l'hypoténuse."},
      {id:14, niveau:"Difficile", enonce:"Trois poteaux A, B, C forment un triangle. AB = 50 m, BC = 80 m. Pour que le triangle soit rectangle en B, quelle doit être la longueur de AC ?", solution:"Rectangle en B → AC² = AB² + BC² = 50² + 80² = 2500 + 6400 = 8900. AC = √8900 ≈ 94,3 m."},
      {id:15, niveau:"Difficile", enonce:"Un terrain triangulaire ABC a AB = 120 m, BC = 90 m, CA = 150 m. Vérifier si ce terrain est rectangle. Calculer son périmètre.", solution:"P = 120+90+150 = 360 m. Vérification rectangle : le plus grand côté est CA=150 m. 120²+90² = 14400+8100 = 22500 = 150² ✓ → Triangle RECTANGLE en B ! (120² + 90² = 150²)"},
    ],
  },

  11: {
    id:11, title:"Quadrilatères", duration:"3 semaines",
    objectives:[
      "Reconnaître et nommer les différents quadrilatères",
      "Connaître les propriétés complètes du carré, rectangle, losange, parallélogramme et trapèze",
      "Construire des quadrilatères avec les instruments de géométrie",
      "Calculer le périmètre de tous les quadrilatères",
      "Comprendre et appliquer les relations d'inclusion entre les quadrilatères",
      "Utiliser les axes de symétrie des quadrilatères",
    ],
    cours:[
      { id:"11-1", titre:"Définition et éléments d'un quadrilatère",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un QUADRILATÈRE est une figure géométrique plane formée par
QUATRE POINTS non alignés trois par trois, réunis par QUATRE SEGMENTS.

REPRÉSENTATION :
   A──────────B
   |          |
   |          |
   D──────────C

• A, B, C, D sont les SOMMETS (dans l'ordre)
• [AB], [BC], [CD], [DA] sont les CÔTÉS
• [AC] et [BD] sont les DIAGONALES
• Les angles ∠A, ∠B, ∠C, ∠D sont les angles intérieurs

NOTATION : Quadrilatère ABCD (les sommets dans l'ordre du contour)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉ FONDAMENTALE — SOMME DES ANGLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dans TOUT quadrilatère, la somme des quatre angles intérieurs est 360°.

∠A + ∠B + ∠C + ∠D = 360°

DÉMONSTRATION : Une diagonale divise le quadrilatère en 2 triangles.
Chaque triangle a une somme d'angles de 180°.
Donc : 180° + 180° = 360° ✓

APPLICATION :
Si ∠A = 80°, ∠B = 100°, ∠C = 90°, alors ∠D = 360°−80°−100°−90° = 90°

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPES DE QUADRILATÈRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• QUADRILATÈRE QUELCONQUE : aucune propriété particulière
• TRAPÈZE : au moins une paire de côtés parallèles
• PARALLÉLOGRAMME : deux paires de côtés parallèles
• RECTANGLE : parallélogramme avec 4 angles droits
• LOSANGE : parallélogramme avec 4 côtés égaux
• CARRÉ : rectangle ET losange (4 côtés égaux ET 4 angles droits)

🌍 EXEMPLES AFRICAINS :
• Une fenêtre → rectangle
• Un terrain carré → carré
• Les motifs d'un tissu wax → souvent des losanges ou carrés
• La base d'une case ronde → cercle, mais les cases rectangulaires → rectangle`,
        exemples:[
          {question:"La somme des angles d'un quadrilatère est-elle toujours 360° ?", reponse:"Oui, TOUJOURS. On peut le vérifier en découpant un quadrilatère et en assemblant les 4 angles → ils forment un tour complet (360°)."},
          {question:"Un quadrilatère a trois angles de 90° chacun. Quel est le quatrième ?", reponse:"∠D = 360° − 90° − 90° − 90° = 90°. Tous les angles sont droits → c'est un rectangle !"},
          {question:"Quelle est la différence entre un quadrilatère et un trapèze ?", reponse:"Un trapèze EST un quadrilatère (avec en plus au moins une paire de côtés parallèles). Tout trapèze est un quadrilatère, mais tout quadrilatère n'est pas un trapèze."},
        ]
      },
      { id:"11-2", titre:"Parallélogramme, rectangle, losange et carré",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE PARALLÉLOGRAMME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION : Quadrilatère dont les DEUX PAIRES de côtés opposés sont PARALLÈLES.

REPRÉSENTATION :
   A──────────B
  /          /
 /          /
D──────────C
(AB // DC et AD // BC)

PROPRIÉTÉS :
• Les côtés opposés sont ÉGAUX : AB = DC et AD = BC
• Les angles opposés sont ÉGAUX : ∠A = ∠C et ∠B = ∠D
• Les angles consécutifs sont SUPPLÉMENTAIRES : ∠A + ∠B = 180°
• Les DIAGONALES se COUPENT EN LEUR MILIEU (elles se bissectent mutuellement)

PÉRIMÈTRE : P = 2 × (AB + AD)   (deux fois la somme de deux côtés adjacents)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE RECTANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION : Parallélogramme dont tous les angles sont DROITS (= 90°).

REPRÉSENTATION :
   A□─────────B
   |          |
   |          |
   D□─────────C□
(les □ indiquent les angles droits)

PROPRIÉTÉS (toutes celles du parallélogramme, plus) :
• Les 4 angles sont droits : ∠A = ∠B = ∠C = ∠D = 90°
• Les côtés opposés sont parallèles ET égaux : AB = DC et AD = BC
• Les DIAGONALES sont ÉGALES : AC = BD
• Les diagonales se coupent en leur milieu

VOCABULAIRE : longueur (L) = côté le plus long ; largeur (ℓ) = côté le plus court

PÉRIMÈTRE : P = 2 × (L + ℓ)   ou   P = 2L + 2ℓ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE LOSANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION : Parallélogramme dont tous les côtés sont ÉGAUX.

REPRÉSENTATION :
       A
      / \
     /   \
    D     B
     \   /
      \ /
       C
(AB = BC = CD = DA)

PROPRIÉTÉS (toutes celles du parallélogramme, plus) :
• Les 4 côtés sont ÉGAUX : AB = BC = CD = DA
• Les DIAGONALES sont PERPENDICULAIRES : [AC] ⊥ [BD]
• Les diagonales sont les AXES DE SYMÉTRIE du losange
• Les diagonales BISSECTENT les angles (partagent les angles en 2 égaux)

PÉRIMÈTRE : P = 4 × côté

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE CARRÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION : Rectangle dont tous les côtés sont ÉGAUX.
           = Losange dont tous les angles sont droits.

REPRÉSENTATION :
   A□─────────B
   |          |
   |          |
   D□─────────C□
(AB = BC = CD = DA ET ∠A = ∠B = ∠C = ∠D = 90°)

PROPRIÉTÉS (TOUTES celles du rectangle ET du losange) :
• 4 côtés ÉGAUX
• 4 angles DROITS (90°)
• Les 2 diagonales sont ÉGALES (comme le rectangle)
• Les 2 diagonales sont PERPENDICULAIRES (comme le losange)
• Les diagonales se coupent en leur milieu
• 4 axes de symétrie (les 2 diagonales + les 2 médiatrices des côtés)

PÉRIMÈTRE : P = 4 × côté

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE TRAPÈZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION : Quadrilatère ayant EXACTEMENT UNE PAIRE de côtés parallèles.

• Les côtés parallèles s'appellent les BASES (grande base et petite base)
• Les deux autres côtés s'appellent les CÔTÉS NON PARALLÈLES

REPRÉSENTATION :
      A────────B      (petite base AB)
     /          \
    /            \
   D──────────────C  (grande base DC)

TRAPÈZE RECTANGLE : un des côtés non parallèles est perpendiculaire aux bases.
TRAPÈZE ISOCÈLE : les deux côtés non parallèles sont égaux.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF DES PROPRIÉTÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   Parallél. Rectangle  Losange   Carré
Côtés opp. //         ✓         ✓         ✓        ✓
Côtés opp. =          ✓         ✓         ✓        ✓
Angles opp. =         ✓         ✓         ✓        ✓
4 angles droits       ✗         ✓         ✗        ✓
4 côtés =             ✗         ✗         ✓        ✓
Diag. = (égales)      ✗         ✓         ✗        ✓
Diag. ⊥               ✗         ✗         ✓        ✓
Diag. se coupent ½    ✓         ✓         ✓        ✓

🌍 EXEMPLES AFRICAINS :
• Un champ rectangulaire au Sénégal : L=45 m, ℓ=30 m → P=2×(45+30)=150 m
• Un motif de tissu losange : côté 8 cm → P=4×8=32 cm
• Une place publique carrée à Abidjan : côté 25 m → P=4×25=100 m`,
        exemples:[
          {question:"ABCD est un rectangle avec AB=8 cm et BC=5 cm. Calculer le périmètre.", reponse:"P = 2×(AB+BC) = 2×(8+5) = 2×13 = 26 cm"},
          {question:"Un losange a un côté de 7 cm. Calculer son périmètre.", reponse:"P = 4×7 = 28 cm"},
          {question:"Dans un parallélogramme ABCD, ∠A = 70°. Calculer les trois autres angles.", reponse:"∠C = ∠A = 70° (opposés égaux). ∠B = ∠D = 180°−70° = 110° (consécutifs supplémentaires). Vérif : 70+110+70+110=360° ✓"},
          {question:"Quelle est la différence entre un carré et un losange ?", reponse:"Un carré a 4 côtés égaux ET 4 angles droits. Un losange a 4 côtés égaux mais ses angles ne sont pas forcément droits. Tout carré est un losange, mais tout losange n'est pas un carré."},
        ]
      },
      { id:"11-3", titre:"Construction et relations entre quadrilatères",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRUCTION D'UN RECTANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Construire le rectangle ABCD avec AB = 7 cm et BC = 4 cm.

MÉTHODE 1 (avec équerre) :
ÉTAPE 1 : Tracer [AB] = 7 cm.
ÉTAPE 2 : En A, tracer la perpendiculaire à [AB] avec l'équerre.
ÉTAPE 3 : Sur cette perpendiculaire, reporter AD = 4 cm → placer D.
ÉTAPE 4 : En B, tracer la perpendiculaire à [AB].
ÉTAPE 5 : Sur cette perpendiculaire, reporter BC = 4 cm → placer C.
ÉTAPE 6 : Tracer [DC]. Vérifier que DC = 7 cm.

VÉRIFICATION : Mesurer les diagonales AC et BD → elles doivent être égales !

MÉTHODE 2 (avec les diagonales) :
Les diagonales d'un rectangle se coupent en leur milieu et sont égales.
→ Tracer les 2 diagonales de même longueur se coupant en leur milieu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRUCTION D'UN LOSANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Construire le losange ABCD de côté 5 cm avec ∠A = 60°.

MÉTHODE 1 (avec rapporteur) :
ÉTAPE 1 : Tracer [AB] = 5 cm.
ÉTAPE 2 : En A, tracer un angle de 60° → marquer la direction de [AD].
ÉTAPE 3 : Sur ce côté, reporter AD = 5 cm → placer D.
ÉTAPE 4 : Ouvrir le compas à 5 cm. Depuis B et D, tracer des arcs.
ÉTAPE 5 : L'intersection donne C. Tracer [BC] et [DC].

MÉTHODE 2 (avec les diagonales) :
Les diagonales d'un losange sont perpendiculaires et se coupent en leur milieu.
→ Tracer 2 segments perpendiculaires se coupant en leur milieu.
→ Les 4 extrémités donnent les 4 sommets du losange.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATIONS D'INCLUSION (HIÉRARCHIE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les quadrilatères sont organisés en une HIÉRARCHIE :

        Quadrilatères
             │
          Trapèzes
             │
        Parallélogrammes
          /           \
    Rectangles       Losanges
          \           /
            Carrés

LECTURE : "Tout carré est un rectangle ET un losange"
         "Tout rectangle est un parallélogramme"
         "Tout parallélogramme est un trapèze"
         "Tout trapèze est un quadrilatère"

⚠️ MAIS :
• Un rectangle n'est pas forcément un carré
• Un losange n'est pas forcément un carré
• Un parallélogramme n'est pas forcément un rectangle

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PÉRIMÈTRES — FORMULES RÉCAPITULATIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Quadrilatère quelconque : P = AB + BC + CD + DA
• Parallélogramme :         P = 2 × (a + b)
• Rectangle :               P = 2 × (L + ℓ)
• Losange :                 P = 4 × c
• Carré :                   P = 4 × c
• Trapèze :                 P = a + b + c + d (somme des 4 côtés)

🌍 EXEMPLES AFRICAINS :
• Terrain rectangulaire de 80 m × 50 m à Libreville :
  Clôture nécessaire = P = 2×(80+50) = 260 m
• Jardin carré de 15 m de côté à Dakar :
  Clôture = P = 4×15 = 60 m
• Parcelle en losange, côté = 25 m :
  Périmètre = 4×25 = 100 m`,
        exemples:[
          {question:"Construire le carré ABCD de côté 4 cm. Décrire les étapes.", reponse:"1. Tracer [AB]=4cm. 2. En A, perpendiculaire à AB. 3. Reporter AD=4cm → D. 4. En B, perpendiculaire à AB. 5. Reporter BC=4cm → C. 6. Vérifier DC=4cm et les diagonales égales et perpendiculaires."},
          {question:"ABCD est un parallélogramme avec AB = 8 cm et AD = 5 cm. Calculer le périmètre.", reponse:"P = 2×(AB+AD) = 2×(8+5) = 2×13 = 26 cm"},
          {question:"Est-ce qu'un carré est un rectangle ? Est-ce qu'un rectangle est un carré ?", reponse:"OUI, tout carré est un rectangle (4 côtés égaux + 4 angles droits → toutes les propriétés du rectangle). NON, un rectangle n'est pas forcément un carré (ses côtés peuvent être inégaux)."},
        ]
      },
      { id:"11-4", titre:"Symétries, diagonales et reconnaissance des quadrilatères",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AXES DE SYMÉTRIE DES QUADRILATÈRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un axe de symétrie est une droite qui partage la figure en deux
parties identiques (l'une est le reflet de l'autre).

CARRÉ : 4 axes de symétrie
• Les 2 médiatrices des côtés (horizontale et verticale)
• Les 2 diagonales
   ↕  ↖↗
   ─ et ─  (4 axes)

RECTANGLE : 2 axes de symétrie
• Les 2 médiatrices des côtés (parallèles aux côtés)
• (PAS les diagonales, sauf si c'est un carré)
   ↕  ↔  (2 axes)

LOSANGE : 2 axes de symétrie
• Les 2 DIAGONALES
• (PAS les médiatrices des côtés, sauf si c'est un carré)

PARALLÉLOGRAMME : 0 axe de symétrie
• (Sauf le rectangle et le losange qui sont des cas particuliers)
• Le parallélogramme a un CENTRE DE SYMÉTRIE (le point de croisement des diagonales)

TRAPÈZE QUELCONQUE : 0 axe de symétrie
TRAPÈZE ISOCÈLE : 1 axe de symétrie (la médiatrice des bases)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉS DES DIAGONALES — TABLEAU COMPLET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Figure          │ Diag. égales │ Diag. ⊥  │ Diag. se coupent en ½
────────────────┼──────────────┼──────────┼──────────────────────
Parallélogramme │      ✗       │    ✗     │          ✓
Rectangle       │      ✓       │    ✗     │          ✓
Losange         │      ✗       │    ✓     │          ✓
Carré           │      ✓       │    ✓     │          ✓
Trapèze         │      ✗       │    ✗     │          ✗

REMARQUE IMPORTANTE :
• Si les diagonales sont ÉGALES et se coupent en leur milieu → RECTANGLE
• Si les diagonales sont PERPENDICULAIRES et se coupent en leur milieu → LOSANGE
• Si les deux → CARRÉ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RECONNAÎTRE UN QUADRILATÈRE PAR SES PROPRIÉTÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour identifier un quadrilatère, on peut utiliser cet algorithme :

ÉTAPE 1 : A-t-il des côtés parallèles ?
  → Non du tout → quadrilatère quelconque
  → Une seule paire → TRAPÈZE
  → Deux paires → PARALLÉLOGRAMME (au minimum)

ÉTAPE 2 (si parallélogramme) : Ses angles sont-ils droits ?
  → Oui → RECTANGLE (au minimum)
  → Non → parallélogramme simple ou losange

ÉTAPE 3 (si rectangle) : Ses côtés sont-ils tous égaux ?
  → Oui → CARRÉ
  → Non → rectangle simple

ÉTAPE 4 (si parallélogramme non rectangle) : Ses côtés sont-ils égaux ?
  → Oui → LOSANGE
  → Non → parallélogramme simple

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCUL AVEC LES DIAGONALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Propriété : Dans un parallélogramme ABCD, les diagonales [AC] et [BD]
se coupent en leur milieu O.
→ OA = OC = AC/2  et  OB = OD = BD/2

EXEMPLE : ABCD parallélogramme, AC = 10 cm et BD = 14 cm.
→ OA = OC = 5 cm  et  OB = OD = 7 cm

Dans un rectangle : AC = BD (les deux diagonales sont aussi égales)
→ OA = OB = OC = OD = AC/2 = BD/2
(O est équidistant des 4 sommets → O est le centre du cercle circonscrit)

🌍 EXEMPLES AFRICAINS :
• Les motifs géométriques des tissus wax africains utilisent des carrés
  et des losanges imbriqués — on peut vérifier leurs axes de symétrie
• La toiture d'une maison traditionnelle vue du dessus forme souvent
  un rectangle avec 2 axes de symétrie
• Un terrain en losange avec diagonales de 20 m et 16 m :
  côté du losange = √(10² + 8²) = √164 ≈ 12,8 m`,
        exemples:[
          {question:"Combien d'axes de symétrie a un rectangle qui n'est pas un carré ?", reponse:"2 axes : les médiatrices des deux paires de côtés opposés (horizontal et vertical). Les diagonales ne sont PAS des axes de symétrie pour un rectangle quelconque."},
          {question:"Les diagonales d'un quadrilatère se coupent en leur milieu et sont perpendiculaires. Quel est ce quadrilatère ?", reponse:"C'est un LOSANGE (diagonales ⊥ et se coupent en leur milieu). Si en plus elles sont égales, c'est un CARRÉ."},
          {question:"ABCD est un parallélogramme avec AC = 12 cm. Calculer OA et OC (O = intersection des diagonales).", reponse:"Les diagonales se coupent en leur milieu → OA = OC = AC/2 = 12/2 = 6 cm"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer le périmètre du rectangle ABCD avec AB = 9 cm et BC = 4 cm.", solution:"P = 2×(AB+BC) = 2×(9+4) = 2×13 = 26 cm"},
      {id:2,  niveau:"Facile",    enonce:"Calculer le périmètre du carré EFGH avec EF = 6 cm.", solution:"P = 4×EF = 4×6 = 24 cm"},
      {id:3,  niveau:"Facile",    enonce:"Calculer le périmètre du losange ABCD avec AB = 7 cm.", solution:"P = 4×AB = 4×7 = 28 cm"},
      {id:4,  niveau:"Facile",    enonce:"Dans le quadrilatère ABCD, ∠A = 85°, ∠B = 95°, ∠C = 75°. Calculer ∠D.", solution:"∠D = 360° − 85° − 95° − 75° = 105°. Vérif : 85+95+75+105=360° ✓"},
      {id:5,  niveau:"Facile",    enonce:"Vrai ou Faux : 'Tout carré est un rectangle.' Justifier.", solution:"VRAI. Un carré a 4 angles droits et ses côtés opposés sont égaux et parallèles → il possède toutes les propriétés d'un rectangle."},
      {id:6,  niveau:"Moyen",     enonce:"ABCD est un parallélogramme avec ∠A = 65°. Calculer les 3 autres angles.", solution:"∠C = ∠A = 65° (angles opposés). ∠B = ∠D = 180°−65° = 115° (angles consécutifs supplémentaires). Vérif : 65+115+65+115=360° ✓"},
      {id:7,  niveau:"Moyen",     enonce:"Un terrain rectangulaire a un périmètre de 80 m. Sa largeur est 15 m. Calculer sa longueur.", solution:"P = 2×(L+ℓ) → 80 = 2×(L+15) → 40 = L+15 → L = 25 m. Vérif : 2×(25+15)=2×40=80 ✓"},
      {id:8,  niveau:"Moyen",     enonce:"ABCD est un losange avec ∠A = 70°. Calculer les trois autres angles.", solution:"∠C = ∠A = 70° (angles opposés du losange). ∠B = ∠D = 180°−70° = 110°. Vérif : 70+110+70+110=360° ✓"},
      {id:9,  niveau:"Moyen",     enonce:"Un carré a un périmètre de 36 cm. Calculer la longueur de son côté.", solution:"P = 4×c → 36 = 4×c → c = 36÷4 = 9 cm. Vérif : 4×9=36 ✓"},
      {id:10, niveau:"Moyen",     enonce:"ABCD est un rectangle avec AB = 10 cm et AC = 13 cm (diagonale). Calculer BC.", solution:"Dans un rectangle, les diagonales sont égales donc BD = AC = 13 cm. Le triangle ABC est rectangle en B (angle droit en B). BC² = AC² − AB² = 13² − 10² = 169 − 100 = 69. BC = √69 ≈ 8,3 cm."},
      {id:11, niveau:"Difficile", enonce:"Un terrain en forme de parallélogramme ABCD a AB = 120 m, AD = 80 m et ∠A = 70°. Calculer le périmètre et les 4 angles.", solution:"P = 2×(120+80) = 2×200 = 400 m. ∠A = ∠C = 70°. ∠B = ∠D = 180°−70° = 110°. Vérif : 70+110+70+110=360° ✓"},
      {id:12, niveau:"Difficile", enonce:"ABCD est un losange avec ses diagonales AC = 8 cm et BD = 6 cm. Calculer le côté du losange. (Les diagonales d'un losange sont perpendiculaires et se coupent en leur milieu)", solution:"Les diagonales se coupent en O (milieu). AO=4cm, BO=3cm. Triangle AOB rectangle en O → AB² = AO²+OB² = 16+9 = 25 → AB = 5 cm. P = 4×5 = 20 cm."},
      {id:13, niveau:"Difficile", enonce:"Un carré et un rectangle ont le même périmètre de 48 cm. Le rectangle a une longueur de 15 cm. Comparer leurs aires. (Aire = longueur × largeur pour le rectangle et côté² pour le carré)", solution:"Carré : côté = 48÷4 = 12 cm. Aire carré = 12² = 144 cm². Rectangle : ℓ = 48÷2−15 = 24−15 = 9 cm. Aire rectangle = 15×9 = 135 cm². Le carré a une aire plus grande (144 > 135). À périmètre égal, le carré maximise l'aire !"},
      {id:14, niveau:"Difficile", enonce:"ABCD est un trapèze avec AB // DC. AB = 12 cm, DC = 8 cm, AD = 5 cm, BC = 7 cm. Calculer son périmètre.", solution:"P = AB + BC + CD + DA = 12 + 7 + 8 + 5 = 32 cm"},
      {id:15, niveau:"Difficile", enonce:"Un enclos pour animaux est en forme de rectangle de 25 m × 18 m. On veut diviser cet enclos en deux parties égales avec une clôture parallèle à la largeur. Calculer la longueur totale de clôture nécessaire (périmètre + clôture intérieure).", solution:"Périmètre extérieur = 2×(25+18) = 2×43 = 86 m. Clôture intérieure parallèle à la largeur (18m) : longueur = 18 m. Total = 86 + 18 = 104 m de clôture."},
    ],
  },

  12: {
    id:12, title:"Cercle", duration:"3 semaines",
    objectives:[
      "Connaître et utiliser le vocabulaire du cercle",
      "Distinguer cercle et disque",
      "Connaître les relations entre rayon, diamètre et corde",
      "Calculer la circonférence d'un cercle",
      "Construire un cercle et des figures liées au cercle",
      "Résoudre des problèmes faisant intervenir des cercles",
    ],
    cours:[
      { id:"12-1", titre:"Vocabulaire du cercle",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION DU CERCLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un CERCLE est l'ensemble de TOUS les points situés à une même distance
d'un point fixe appelé CENTRE.

Cette distance fixe s'appelle le RAYON du cercle.

REPRÉSENTATION :
              * * *
           *         *
          *     O     *   ← O est le centre
          *     |     *
           *    r    *    ← r est le rayon
              * * *

NOTATION : Cercle de centre O et de rayon r → cercle (O, r) ou ⊙O

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CERCLE vs DISQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ DISTINCTION IMPORTANTE :
• Le CERCLE = uniquement la LIGNE (le contour), sans l'intérieur
• Le DISQUE = le cercle ET toute la surface intérieure

Analogie : 
  Cercle = le bord d'une pièce de monnaie
  Disque = la pièce de monnaie entière (bord + face)

En langage courant on dit souvent "cercle" pour les deux,
mais en géométrie la distinction est importante !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOCABULAIRE COMPLET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. CENTRE (O) : point équidistant de tous les points du cercle.

2. RAYON [OA] : segment reliant le centre à un point du cercle.
   • Tous les rayons d'un cercle sont ÉGAUX.
   • Notation de la longueur : r (minuscule)

3. DIAMÈTRE [AB] : segment reliant deux points du cercle en passant par le centre.
   • Le diamètre passe TOUJOURS par le centre.
   • Un cercle a une INFINITÉ de diamètres.
   • RELATION FONDAMENTALE : d = 2r  (ou r = d/2)
   • C'est le plus long segment qu'on puisse tracer dans un cercle.

4. CORDE [CD] : segment reliant deux points du cercle SANS passer par le centre.
   • Le diamètre est la corde la plus longue (cas particulier).
   • Une corde divise le disque en deux parties.

5. ARC de cercle : portion de cercle entre deux points.
   • L'arc CD (noté CD⌢) est la portion de cercle de C à D.
   • Deux points du cercle définissent deux arcs (petit et grand).

6. TANGENTE : droite qui touche le cercle en un seul point.
   • La tangente est perpendiculaire au rayon au point de contact.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATIONS FONDAMENTALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAMÈTRE ET RAYON :
  d = 2 × r    (le diamètre vaut deux fois le rayon)
  r = d ÷ 2   (le rayon vaut la moitié du diamètre)

EXEMPLES :
• r = 5 cm → d = 2 × 5 = 10 cm
• d = 14 cm → r = 14 ÷ 2 = 7 cm
• r = 3,5 cm → d = 2 × 3,5 = 7 cm

PROPRIÉTÉ UTILE : Un point M est sur le cercle (O, r) si et seulement si OM = r.
• Si OM < r → M est à l'INTÉRIEUR du cercle
• Si OM = r → M est SUR le cercle
• Si OM > r → M est à l'EXTÉRIEUR du cercle

🌍 EXEMPLES AFRICAINS :
• Un puits circulaire au Mali a un diamètre de 1,2 m → rayon = 0,6 m
• La base d'une case ronde au Cameroun a un diamètre de 6 m → rayon = 3 m
• Un plat africain circulaire a un rayon de 15 cm → diamètre = 30 cm`,
        exemples:[
          {question:"Un cercle a un rayon de 8 cm. Quel est son diamètre ?", reponse:"d = 2 × r = 2 × 8 = 16 cm"},
          {question:"Un cercle a un diamètre de 9 cm. Quel est son rayon ?", reponse:"r = d ÷ 2 = 9 ÷ 2 = 4,5 cm"},
          {question:"Le point M est à 7 cm du centre d'un cercle de rayon 5 cm. M est-il sur, dans ou hors du cercle ?", reponse:"OM = 7 cm > r = 5 cm → M est à l'EXTÉRIEUR du cercle."},
          {question:"Quelle différence entre un rayon, un diamètre et une corde ?", reponse:"Rayon : du centre à un point du cercle. Diamètre : entre deux points du cercle EN PASSANT PAR LE CENTRE. Corde : entre deux points du cercle SANS passer par le centre. Le diamètre est la plus grande corde."},
        ]
      },
      { id:"12-2", titre:"Circonférence du cercle",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE NOMBRE PI (π)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour TOUT cercle, le rapport entre la circonférence et le diamètre
est une constante universelle appelée PI (π).

   Circonférence
  ─────────────── = π   pour TOUT cercle
      Diamètre

La valeur de π est approximativement :
  π ≈ 3,14159265358979...  (nombre irrationnel, infini non périodique)
  
Valeurs approchées utilisées au collège :
  π ≈ 3,14       (au centième)
  π ≈ 22/7       (fraction approchée très utile)
  π ≈ 3,1416     (au dix-millième)

📌 π est le même pour TOUS les cercles, quelle que soit leur taille !
Un cercle de r=1m et un cercle de r=1km ont le même rapport C/d = π.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE DE LA CIRCONFÉRENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La CIRCONFÉRENCE (C) est le périmètre du cercle (longueur du contour).

  C = π × d = 2 × π × r

EXEMPLES :
• Cercle de rayon 5 cm :
  C = 2 × π × 5 = 10π ≈ 10 × 3,14 = 31,4 cm

• Cercle de diamètre 8 cm :
  C = π × 8 = 8π ≈ 8 × 3,14 = 25,12 cm

• Cercle de rayon 7 cm (utiliser π ≈ 22/7) :
  C = 2 × (22/7) × 7 = 2 × 22 = 44 cm

TROUVER r ou d si on connaît C :
  C = 2πr → r = C ÷ (2π)
  C = πd  → d = C ÷ π

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LONGUEUR D'UN ARC DE CERCLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un arc de cercle correspondant à un angle de α° au centre :
  Longueur de l'arc = (α/360) × C = (α/360) × 2πr

EXEMPLES :
• Arc de 90° (quart de cercle) sur un cercle de rayon 6 cm :
  L = (90/360) × 2π × 6 = (1/4) × 12π = 3π ≈ 9,42 cm

• Arc de 180° (demi-cercle) sur un cercle de rayon 4 cm :
  L = (180/360) × 2π × 4 = (1/2) × 8π = 4π ≈ 12,57 cm

🌍 EXEMPLES AFRICAINS :
• Diamètre d'un puits = 1,2 m
  Circonférence = π × 1,2 ≈ 3,14 × 1,2 ≈ 3,77 m
  (longueur de la margelle circulaire)

• Un stade circulaire de rayon 50 m :
  Tour complet = 2 × π × 50 = 100π ≈ 314 m

• Une piste de course circulaire de diamètre 100 m :
  C = π × 100 ≈ 314 m par tour`,
        exemples:[
          {question:"Calculer la circonférence d'un cercle de rayon 10 cm. (π ≈ 3,14)", reponse:"C = 2 × π × r = 2 × 3,14 × 10 = 62,8 cm"},
          {question:"Calculer la circonférence d'un cercle de diamètre 7 cm. (π ≈ 22/7)", reponse:"C = π × d = (22/7) × 7 = 22 cm (résultat exact avec cette approximation !)"},
          {question:"La circonférence d'un cercle est 31,4 cm. Calculer son rayon.", reponse:"r = C ÷ (2π) = 31,4 ÷ (2×3,14) = 31,4 ÷ 6,28 = 5 cm"},
        ]
      },
      { id:"12-3", titre:"Construction et positions relatives",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRUCTION D'UN CERCLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTIL : Le COMPAS sert à tracer des cercles.

MÉTHODE :
1. Placer la pointe sèche du compas sur le CENTRE O
2. Ouvrir le compas à la mesure du RAYON r
3. Tracer le cercle en faisant tourner le compas

⚠️ ERREURS FRÉQUENTES :
• Ne pas appuyer trop fort sur le centre (le point doit rester fixe)
• Ne pas changer l'ouverture du compas en traçant
• Vérifier l'ouverture avant de tracer

CONSTRUCTIONS LIÉES AU CERCLE :
1. Tracer le diamètre : placer deux points A et B tels que O est le milieu de [AB].
2. Tracer une corde de longueur donnée : utiliser le compas.
3. Tracer la tangente en un point : tracer la perpendiculaire au rayon en ce point.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POSITIONS RELATIVES DE DEUX CERCLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deux cercles de centres O et O', de rayons r et r', peuvent être :

1. EXTÉRIEURS l'un à l'autre : OO' > r + r'
   (ils ne se touchent pas, chacun est hors de l'autre)
   O ──────── O'    (distance > somme des rayons)

2. TANGENTS EXTÉRIEUREMENT : OO' = r + r'
   (ils se touchent en exactement 1 point, à l'extérieur)

3. SÉCANTS : |r − r'| < OO' < r + r'
   (ils se coupent en 2 points)

4. TANGENTS INTÉRIEUREMENT : OO' = |r − r'|
   (ils se touchent en exactement 1 point, l'un dans l'autre)

5. INTÉRIEURS l'un à l'autre : OO' < |r − r'|
   (l'un est entièrement à l'intérieur de l'autre)

6. CONCENTRIQUES : OO' = 0 (même centre)
   (même centre, rayons différents)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CERCLE ET TRIANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CERCLE INSCRIT dans un triangle :
→ Cercle tangent aux 3 côtés du triangle (à l'intérieur)
→ Son centre est le point d'intersection des 3 BISSECTRICES

CERCLE CIRCONSCRIT à un triangle :
→ Cercle passant par les 3 sommets du triangle (à l'extérieur)
→ Son centre est le point d'intersection des 3 MÉDIATRICES

PROPRIÉTÉ : Dans un triangle rectangle, le centre du cercle
circonscrit est le MILIEU de l'hypoténuse.

🌍 EXEMPLES AFRICAINS :
• Un puits (cercle) et un autre puits sont à 15 m de distance.
  Leurs diamètres sont 1 m et 1 m. OO'=15 m > r+r'=0,5+0,5=1 m → extérieurs ✓
• Deux ronds-points concentriques à Libreville :
  même centre, rayons différents → concentriques`,
        exemples:[
          {question:"Deux cercles ont des rayons de 3 cm et 5 cm, et leurs centres sont à 10 cm. Quelle est leur position relative ?", reponse:"r+r' = 3+5 = 8 cm. OO' = 10 cm > 8 cm → cercles EXTÉRIEURS l'un à l'autre."},
          {question:"Deux cercles ont des rayons de 4 cm et 6 cm, et leurs centres sont à 2 cm. Quelle est leur position relative ?", reponse:"|r−r'| = |4−6| = 2 cm = OO' → cercles TANGENTS INTÉRIEUREMENT (se touchent en 1 point)."},
          {question:"Comment construire le centre du cercle circonscrit à un triangle ?", reponse:"Tracer les médiatrices des 3 côtés. Leur point d'intersection est le centre du cercle circonscrit."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Un cercle a un rayon de 12 cm. Quel est son diamètre ?", solution:"d = 2 × r = 2 × 12 = 24 cm"},
      {id:2,  niveau:"Facile",    enonce:"Un cercle a un diamètre de 15 cm. Quel est son rayon ?", solution:"r = d ÷ 2 = 15 ÷ 2 = 7,5 cm"},
      {id:3,  niveau:"Facile",    enonce:"Le point M est à 4 cm du centre O d'un cercle de rayon 6 cm. M est-il à l'intérieur, sur, ou à l'extérieur du cercle ?", solution:"OM = 4 cm < r = 6 cm → M est à l'INTÉRIEUR du disque."},
      {id:4,  niveau:"Facile",    enonce:"Calculer la circonférence d'un cercle de rayon 5 cm. (π ≈ 3,14)", solution:"C = 2 × π × r = 2 × 3,14 × 5 = 31,4 cm"},
      {id:5,  niveau:"Facile",    enonce:"Calculer la circonférence d'un cercle de diamètre 14 cm. (π ≈ 22/7)", solution:"C = π × d = (22/7) × 14 = 22 × 2 = 44 cm"},
      {id:6,  niveau:"Moyen",     enonce:"Un cercle a une circonférence de 62,8 cm. Calculer son rayon et son diamètre. (π ≈ 3,14)", solution:"r = C ÷ (2π) = 62,8 ÷ 6,28 = 10 cm. d = 2r = 20 cm."},
      {id:7,  niveau:"Moyen",     enonce:"Deux cercles concentriques ont des rayons de 3 cm et 7 cm. Calculer la différence de leurs circonférences.", solution:"C1 = 2π×3 = 6π. C2 = 2π×7 = 14π. Différence = 14π−6π = 8π ≈ 8×3,14 = 25,12 cm."},
      {id:8,  niveau:"Moyen",     enonce:"Un vélo a des roues de diamètre 66 cm. Quelle distance parcourt-il en 100 tours de roue ? (π ≈ 3,14)", solution:"Circonférence = π × d = 3,14 × 66 = 207,24 cm par tour. Distance = 100 × 207,24 = 20 724 cm = 207,24 m."},
      {id:9,  niveau:"Moyen",     enonce:"O est le centre d'un cercle. A et B sont deux points du cercle avec OA = 8 cm. Calculer AB si [AB] est un diamètre.", solution:"AB est un diamètre → AB = 2 × OA = 2 × 8 = 16 cm."},
      {id:10, niveau:"Moyen",     enonce:"Deux cercles ont des rayons de 5 cm et 3 cm, et leurs centres sont à 8 cm. Quelle est leur position relative ?", solution:"r + r' = 5 + 3 = 8 cm = OO' → les cercles sont TANGENTS EXTÉRIEUREMENT (se touchent en 1 point)."},
      {id:11, niveau:"Difficile", enonce:"Une piste circulaire a une circonférence de 400 m. Un athlète court 5 tours. Quelle distance a-t-il parcourue ? Quel est le rayon de la piste ? (π ≈ 3,14)", solution:"Distance = 5 × 400 = 2 000 m = 2 km. Rayon : C = 2πr → r = 400 ÷ (2×3,14) = 400 ÷ 6,28 ≈ 63,7 m."},
      {id:12, niveau:"Difficile", enonce:"Un cercle de centre O a un rayon de 10 cm. Un point A est sur le cercle. On trace la corde [AB] de longueur 12 cm. Calculer la distance de O au milieu M de [AB].", solution:"OM ⊥ AB (propriété : la perpendiculaire d'un centre à une corde coupe la corde en son milieu). OA = 10 cm (rayon), AM = 6 cm (moitié de AB=12). Triangle OAM rectangle en M : OM² = OA² − AM² = 100 − 36 = 64 → OM = 8 cm."},
      {id:13, niveau:"Difficile", enonce:"Deux cercles de rayons 6 cm et 4 cm sont sécants. La distance entre leurs centres est 7 cm. Vérifier qu'ils sont bien sécants.", solution:"|r−r'| = |6−4| = 2 cm < OO' = 7 cm < r+r' = 10 cm. Comme 2 < 7 < 10 ✓ → les cercles sont bien SÉCANTS (se coupent en 2 points)."},
      {id:14, niveau:"Difficile", enonce:"Un jardin circulaire de rayon 7 m est entouré d'une allée de 1 m de large. Calculer la circonférence extérieure de l'allée. (π ≈ 22/7)", solution:"Le grand cercle a pour rayon : 7 + 1 = 8 m. Circonférence extérieure = 2 × (22/7) × 8 = (44/7) × 8 = 352/7 ≈ 50,3 m."},
      {id:15, niveau:"Difficile", enonce:"Un triangle rectangle a ses cathètes de 6 cm et 8 cm. Calculer le rayon du cercle circonscrit. (Rappel : dans un triangle rectangle, le centre du cercle circonscrit est le milieu de l'hypoténuse)", solution:"Hypoténuse² = 6² + 8² = 36 + 64 = 100 → hypoténuse = 10 cm. Rayon du cercle = hypoténuse ÷ 2 = 10 ÷ 2 = 5 cm."},
    ],
  },

  13: {
    id:13, title:"Symétrie axiale", duration:"3 semaines",
    objectives:[
      "Comprendre la notion de symétrie axiale",
      "Reconnaître un axe de symétrie d'une figure",
      "Construire le symétrique d'un point par rapport à une droite",
      "Construire le symétrique d'une figure par rapport à un axe",
      "Utiliser les propriétés de conservation de la symétrie axiale",
    ],
    cours:[
      { id:"13-1", titre:"Notion de symétrie axiale",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉCOUVERTE DE LA SYMÉTRIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La SYMÉTRIE AXIALE est la transformation qui associe à chaque point
son image "de l'autre côté" d'une droite appelée AXE DE SYMÉTRIE.

EXPÉRIENCE PRATIQUE :
Plie une feuille en deux → les deux parties se superposent exactement.
Le pli est l'AXE DE SYMÉTRIE.
Chaque point d'un côté correspond exactement à un point de l'autre côté.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION RIGOUREUSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le SYMÉTRIQUE d'un point A par rapport à une droite (d) est le point A'
tel que :
  1. La droite (d) est la MÉDIATRICE du segment [AA']
  C'est-à-dire :
  • (d) est perpendiculaire à [AA'] : (d) ⊥ [AA']
  • (d) coupe [AA'] en son MILIEU : le pied H vérifie HA = HA'

REPRÉSENTATION :
     A          A'
     •          •
     |          |
     |    (d)   |
     •──────────•
          H
     (H est le milieu de [AA'] et AH ⊥ (d))

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAS PARTICULIERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Si A est SUR l'axe (d) → son symétrique est lui-même : A' = A
• Si A est à gauche de (d) → A' est à droite, à la même distance
• Si A est à droite de (d) → A' est à gauche, à la même distance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AXE DE SYMÉTRIE D'UNE FIGURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une droite (d) est un AXE DE SYMÉTRIE d'une figure si, en repliant
la figure selon (d), les deux parties se superposent exactement.

EXEMPLES DE FIGURES ET LEURS AXES :
• Segment [AB] → 2 axes : la médiatrice de [AB] ET la droite (AB) elle-même
• Triangle isocèle → 1 axe (la médiatrice de la base)
• Triangle équilatéral → 3 axes (les 3 médiatrices)
• Rectangle → 2 axes (les médiatrices des côtés)
• Losange → 2 axes (les diagonales)
• Carré → 4 axes (les 2 diagonales + les 2 médiatrices des côtés)
• Cercle → une INFINITÉ d'axes (tout diamètre est axe de symétrie)
• Triangle scalène → 0 axe
• Lettre A → 1 axe (vertical)
• Lettre H → 2 axes (vertical et horizontal)
• Lettre O → une infinité d'axes

🌍 EXEMPLES AFRICAINS :
• Le drapeau du Rwanda → axe de symétrie vertical
• Un masque africain traditionnel → souvent 1 axe vertical
• Les motifs du tissu kente → souvent plusieurs axes de symétrie
• Un papillon → axe vertical au milieu
• Une feuille d'arbre → axe de la nervure centrale`,
        exemples:[
          {question:"Combien d'axes de symétrie a un carré ?", reponse:"4 axes : les 2 médiatrices des côtés (horizontale et verticale) + les 2 diagonales."},
          {question:"Une figure a une infinité d'axes de symétrie. Quelle est-elle ?", reponse:"Le cercle (tout diamètre est un axe de symétrie)."},
          {question:"Le triangle scalène a-t-il des axes de symétrie ?", reponse:"Non, 0 axe de symétrie (les 3 côtés sont tous de longueurs différentes)."},
        ]
      },
      { id:"13-2", titre:"Construction du symétrique d'un point",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE 1 — AVEC ÉQUERRE ET RÈGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour construire A', symétrique de A par rapport à la droite (d) :

ÉTAPE 1 : Tracer la perpendiculaire à (d) passant par A.
  → Poser l'équerre sur (d), faire glisser jusqu'à A, tracer la perpendiculaire.

ÉTAPE 2 : Cette perpendiculaire coupe (d) en un point H.
  → H est le pied de la perpendiculaire (milieu futur de [AA']).

ÉTAPE 3 : Reporter la distance AH de l'autre côté de (d).
  → A' est tel que HA' = HA et H est entre A et A'.

REPRÉSENTATION :
   A                         A'
   •─────────────────────────•
              H
   ←── AH ───→←─── HA' ────→
                  (égales !)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE 2 — AVEC LE COMPAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉTAPE 1 : Tracer la perpendiculaire à (d) passant par A (avec équerre).
ÉTAPE 2 : Ouvrir le compas à la distance AH (de A au point d'intersection H avec (d)).
ÉTAPE 3 : Piquer le compas en H et reporter la même distance de l'autre côté → A'.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE 3 — SUR PAPIER QUADRILLÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sur un quadrillage, si l'axe est vertical ou horizontal :

1. Compter le nombre de carreaux de A à l'axe (d).
2. Reporter le même nombre de carreaux de l'autre côté de l'axe.
3. Placer A'.

EXEMPLE : A est à 3 carreaux à gauche de l'axe vertical (d).
→ A' est à 3 carreaux à droite de (d).

Si l'axe est oblique (à 45°) :
• Compter les décalages horizontal et vertical de A par rapport à un point de (d).
• Inverser les deux décalages pour obtenir A'.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYMÉTRIQUE D'UN SEGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour construire le symétrique du segment [AB] par rapport à (d) :
1. Construire A', symétrique de A.
2. Construire B', symétrique de B.
3. Tracer [A'B'].

Le segment [A'B'] est le symétrique de [AB].
PROPRIÉTÉ : A'B' = AB (les longueurs sont conservées !).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYMÉTRIQUE D'UN TRIANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour construire le symétrique du △ABC par rapport à (d) :
1. Construire A', B', C' symétriques de A, B, C.
2. Tracer le triangle A'B'C'.

PROPRIÉTÉS CONSERVÉES :
• A'B' = AB, B'C' = BC, C'A' = CA (longueurs des côtés)
• Les angles sont conservés : ∠A' = ∠A, ∠B' = ∠B, ∠C' = ∠C
• Les périmètres sont égaux

🌍 EXEMPLES AFRICAINS :
• Le reflet d'un arbre dans l'eau du fleuve → symétrie axiale
• L'axe est la surface de l'eau, l'arbre et son reflet sont symétriques
• Un oiseau en vol → le plan de symétrie vertical donne deux ailes symétriques`,
        exemples:[
          {question:"A est à 4 cm de l'axe (d). Où est son symétrique A' ?", reponse:"A' est à 4 cm de (d) de l'autre côté. AA' = 2×4 = 8 cm et H (milieu de AA') est sur (d)."},
          {question:"Sur un quadrillage, A est à 3 carreaux à gauche de l'axe vertical. Où est A' ?", reponse:"A' est à 3 carreaux à droite de l'axe vertical (même ligne)."},
          {question:"Le symétrique de [AB] (longueur 7 cm) est [A'B']. Quelle est la longueur de [A'B'] ?", reponse:"A'B' = AB = 7 cm (la symétrie conserve les longueurs)."},
        ]
      },
      { id:"13-3", titre:"Propriétés de la symétrie axiale",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉS DE CONSERVATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La symétrie axiale CONSERVE (ne change pas) :

1. LES DISTANCES (longueurs) :
   Si A' est le symétrique de A et B' est le symétrique de B,
   alors A'B' = AB.
   → Les figures symétriques sont CONGRUENTES (même forme, même taille).

2. LES ANGLES :
   ∠A'B'C' = ∠ABC
   → Les angles sont conservés.

3. L'ALIGNEMENT :
   Si A, B, C sont alignés, alors A', B', C' sont aussi alignés.

4. LE MILIEU :
   Si M est le milieu de [AB], alors M' (symétrique de M) est le milieu de [A'B'].

La symétrie axiale NE CONSERVE PAS l'orientation (sens de parcours).
Un triangle orienté dans le sens horaire devient anti-horaire après symétrie.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIGURES AYANT UN AXE DE SYMÉTRIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une figure est SYMÉTRIQUE par rapport à (d) si elle est son propre symétrique.
Cela signifie que (d) est un AXE DE SYMÉTRIE de la figure.

MÉTHODE POUR VÉRIFIER :
1. Plier la figure selon (d).
2. Si les deux parties se superposent exactement → (d) est un axe de symétrie.

TABLEAU RÉCAPITULATIF :
Figure               │ Nombre d'axes │ Description des axes
─────────────────────┼───────────────┼────────────────────────────────
Segment [AB]         │      2        │ Médiatrice + droite (AB)
Triangle scalène     │      0        │ Aucun
Triangle isocèle     │      1        │ Médiatrice de la base
Triangle équilatéral │      3        │ Les 3 médiatrices des côtés
Parallélogramme      │      0        │ Aucun (sauf cas particuliers)
Rectangle            │      2        │ Médiatrices des côtés
Losange              │      2        │ Les 2 diagonales
Carré                │      4        │ 2 diagonales + 2 médiatrices
Cercle               │      ∞        │ Tous les diamètres

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UTILISATION EN GÉOMÉTRIE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La symétrie permet de RÉSOUDRE DES PROBLÈMES :

EXEMPLE : Trouver le point M sur la droite (d) tel que AM + MB soit minimum
(problème du chemin le plus court).

MÉTHODE :
1. Construire A', symétrique de A par rapport à (d).
2. Tracer la droite A'B.
3. M est l'intersection de A'B avec (d).
4. AM + MB = A'M + MB = A'B (longueur minimale !)

🌍 EXEMPLES AFRICAINS :
• Architecture traditionnelle : les cases rectangulaires ont 2 axes de symétrie
• Le kele-kele (jeu africain) utilise des figures symétriques
• Les broderies et tissages africains sont souvent basés sur la symétrie
• La disposition de plats sur une table lors d'un festin → souvent symétrique
• Les motifs des pagnes et boubous → symétries multiples`,
        exemples:[
          {question:"△ABC et △A'B'C' sont symétriques par rapport à (d). Si AB = 5 cm, que vaut A'B' ?", reponse:"A'B' = AB = 5 cm (la symétrie conserve les longueurs)."},
          {question:"Un parallélogramme a-t-il des axes de symétrie ?", reponse:"Non (en général). Un parallélogramme quelconque n'a pas d'axe de symétrie. Sauf s'il est un rectangle (2 axes), un losange (2 axes) ou un carré (4 axes)."},
          {question:"Comment vérifier qu'une lettre a un axe de symétrie ?", reponse:"On peut la plier (mentalement ou physiquement) : si les deux parties se superposent, l'axe est confirmé. Ex : A, H, M, O, T, U, V, W, X, Y ont des axes. B, C, D, E, K ont un axe horizontal. F, G, J, L, N, P, Q, R, S, Z n'en ont pas."},
          {question:"△ABC a pour symétriques A', B', C' par rapport à (d). Si ∠B = 70°, que vaut ∠B' ?", reponse:"∠B' = ∠B = 70° (la symétrie conserve les angles)."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Combien d'axes de symétrie possède un triangle équilatéral ?", solution:"3 axes : les 3 médiatrices des côtés (qui sont aussi les 3 hauteurs et 3 médianes pour un triangle équilatéral)."},
      {id:2,  niveau:"Facile",    enonce:"Combien d'axes de symétrie possède un rectangle (non carré) ?", solution:"2 axes : la médiatrice du côté long et la médiatrice du côté court (les deux axes passent par le centre)."},
      {id:3,  niveau:"Facile",    enonce:"A est à 5 cm de l'axe (d). Quelle est la longueur du segment [AA'] où A' est le symétrique de A ?", solution:"AA' = 2 × 5 = 10 cm (A' est de l'autre côté, à la même distance)."},
      {id:4,  niveau:"Facile",    enonce:"Sur un quadrillage avec un axe vertical, le point A est en position (3, 2). Quel est le symétrique A' par rapport à l'axe x = 0 ?", solution:"A' est à la même hauteur (ordonnée 2) mais à l'opposé en abscisse : A' = (−3, 2)."},
      {id:5,  niveau:"Facile",    enonce:"Le segment [AB] mesure 8 cm. Son symétrique [A'B'] mesure combien ?", solution:"A'B' = AB = 8 cm (la symétrie conserve les longueurs)."},
      {id:6,  niveau:"Moyen",     enonce:"Construire le symétrique du point A par rapport à la droite (d). Décrire les 3 étapes.", solution:"Étape 1 : Tracer la perpendiculaire à (d) passant par A (avec équerre). Étape 2 : Appeler H le point d'intersection avec (d). Étape 3 : Reporter HA de l'autre côté → A' tel que HA' = HA."},
      {id:7,  niveau:"Moyen",     enonce:"△ABC est symétrique par rapport à (d). ∠A = 45°, AB = 7 cm, BC = 5 cm. Donner les mesures du triangle image △A'B'C'.", solution:"Par conservation : ∠A' = 45°, A'B' = 7 cm, B'C' = 5 cm. Tous les éléments sont conservés."},
      {id:8,  niveau:"Moyen",     enonce:"Quelle lettre majuscule parmi A, B, C, D, H, I, M, O, S, X possède 2 axes de symétrie ?", solution:"H, I, O, X possèdent 2 axes de symétrie (un horizontal et un vertical). Parmi celles-ci : H (vertical + horizontal), I (vertical + horizontal), O (infinité d'axes), X (2 diagonales)."},
      {id:9,  niveau:"Moyen",     enonce:"Un triangle isocèle ABC a AB = AC = 8 cm et BC = 5 cm. (d) est l'axe de symétrie. Que peut-on dire de B et C par rapport à (d) ?", solution:"B et C sont symétriques l'un de l'autre par rapport à (d) car l'axe de symétrie d'un triangle isocèle est la médiatrice de la base. Donc B' = C et C' = B."},
      {id:10, niveau:"Moyen",     enonce:"ABCD est un losange. Justifier que les diagonales [AC] et [BD] sont des axes de symétrie.", solution:"[AC] est axe de symétrie : B et D sont symétriques par rapport à [AC] (car AB=AD et CB=CD). [BD] est axe de symétrie : A et C sont symétriques par rapport à [BD] (car AB=BC et AD=DC)."},
      {id:11, niveau:"Difficile", enonce:"Construire le symétrique du triangle ABC (A(1,3), B(4,3), C(4,1)) par rapport à l'axe (d) d'équation x=2 sur un quadrillage.", solution:"A est à 1 carreau à gauche de x=2 → A'=(3,3). B est à 2 carreaux à droite de x=2 → B'=(0,3). C est à 2 carreaux à droite de x=2 → C'=(0,1). Triangle A'B'C' avec A'(3,3), B'(0,3), C'(0,1)."},
      {id:12, niveau:"Difficile", enonce:"Déterminer le nombre d'axes de symétrie de chaque figure : carré, losange non carré, rectangle non carré, triangle rectangle isocèle.", solution:"Carré : 4 axes. Losange non carré : 2 axes (les diagonales). Rectangle non carré : 2 axes (médiatrices des côtés). Triangle rectangle isocèle : 1 axe (la médiatrice de l'hypoténuse = hauteur issue de l'angle droit)."},
      {id:13, niveau:"Difficile", enonce:"M est le milieu de [AB]. (d) est l'axe de symétrie. Montrer que M' (symétrique de M) est le milieu de [A'B'].", solution:"M milieu de [AB] → AM = MB. Par conservation des longueurs : A'M' = AM et M'B' = MB. Donc A'M' = M'B' → M' est le milieu de [A'B'] ✓."},
      {id:14, niveau:"Difficile", enonce:"A(2,5) et B(8,1) sont deux points. (d) est la droite verticale x=5. Construire A' et B' symétriques. Vérifier que A'B' = AB.", solution:"A à 3 carreaux à gauche de x=5 → A'=(8,5). B à 3 carreaux à droite de x=5 → B'=(2,1). AB² = (8−2)²+(1−5)² = 36+16 = 52. A'B'² = (2−8)²+(1−5)² = 36+16 = 52. Donc A'B' = AB ✓."},
      {id:15, niveau:"Difficile", enonce:"On veut aller de A à un point M sur la droite (d), puis de M à B, en parcourant la distance minimale. Expliquer comment trouver M en utilisant la symétrie.", solution:"Construire A', symétrique de A par rapport à (d). Tracer la droite A'B. M est le point d'intersection de A'B avec (d). Justification : AM + MB = A'M + MB (car A'M = AM par symétrie) ≥ A'B (inégalité triangulaire), avec égalité ssi A', M, B sont alignés ✓."},
    ],
  },

  14: {
    id:14, title:"Périmètre et aire", duration:"4 semaines",
    objectives:[
      "Distinguer périmètre et aire",
      "Calculer le périmètre des figures usuelles",
      "Calculer l'aire du carré, rectangle, triangle, parallélogramme, trapèze et disque",
      "Convertir des unités d'aire",
      "Résoudre des problèmes faisant intervenir périmètres et aires",
    ],
    cours:[
      { id:"14-1", titre:"Périmètre — définition et formules",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION DU PÉRIMÈTRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le PÉRIMÈTRE d'une figure est la LONGUEUR TOTALE de son contour.
C'est la distance qu'on parcourt si on fait le tour de la figure.

UNITÉ : le périmètre s'exprime en unités de LONGUEUR : mm, cm, m, km.

MÉTHODE GÉNÉRALE : P = somme de tous les côtés

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULES DE PÉRIMÈTRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRIANGLE (côtés a, b, c) :
  P = a + b + c

TRIANGLE ÉQUILATÉRAL (côté a) :
  P = 3a

CARRÉ (côté c) :
  P = 4c

RECTANGLE (longueur L, largeur ℓ) :
  P = 2L + 2ℓ = 2(L + ℓ)

PARALLÉLOGRAMME (côtés a et b) :
  P = 2a + 2b = 2(a + b)

LOSANGE (côté c) :
  P = 4c

TRAPÈZE (côtés a, b, c, d) :
  P = a + b + c + d  (somme des 4 côtés)

CERCLE (rayon r, diamètre d) :
  C = 2πr = πd  (la circonférence est le périmètre du cercle)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLES DÉTAILLÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rectangle 12 cm × 7 cm :
P = 2 × (12 + 7) = 2 × 19 = 38 cm

Triangle avec côtés 5 cm, 8 cm, 6 cm :
P = 5 + 8 + 6 = 19 cm

Cercle de rayon 4 cm (π ≈ 3,14) :
C = 2 × 3,14 × 4 = 25,12 cm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TROUVER UN CÔTÉ DEPUIS LE PÉRIMÈTRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Un rectangle a un périmètre de 30 cm et une longueur de 10 cm. Trouver la largeur.
P = 2(L + ℓ) → 30 = 2(10 + ℓ) → 15 = 10 + ℓ → ℓ = 5 cm

EXEMPLE : Un carré a un périmètre de 28 cm. Trouver le côté.
P = 4c → 28 = 4c → c = 7 cm

🌍 EXEMPLES AFRICAINS :
• Clôture d'un terrain rectangulaire 50 m × 30 m :
  P = 2×(50+30) = 160 m → besoin de 160 m de grillage
• Tour d'un stade circulaire de rayon 50 m :
  C = 2×π×50 ≈ 314 m
• Périmètre d'un tissu triangulaire : 25 cm + 30 cm + 35 cm = 90 cm`,
        exemples:[
          {question:"Calculer le périmètre d'un rectangle de 15 cm × 8 cm.", reponse:"P = 2×(15+8) = 2×23 = 46 cm"},
          {question:"Un carré a un périmètre de 52 cm. Calculer son côté.", reponse:"c = 52 ÷ 4 = 13 cm"},
          {question:"Calculer la circonférence d'un cercle de diamètre 10 cm. (π ≈ 3,14)", reponse:"C = π × d = 3,14 × 10 = 31,4 cm"},
        ]
      },
      { id:"14-2", titre:"Aire — définition et unités",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION DE L'AIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'AIRE (ou superficie) d'une figure est la mesure de sa SURFACE,
c'est-à-dire la quantité de surface qu'elle occupe.

⚠️ DIFFÉRENCE FONDAMENTALE :
• Le PÉRIMÈTRE mesure le CONTOUR (une longueur, 1D)
• L'AIRE mesure la SURFACE (une surface, 2D)

ANALOGIE :
• Périmètre = la longueur de la clôture autour d'un terrain
• Aire = la quantité de gazon à planter dans le terrain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNITÉS D'AIRE ET CONVERSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les unités d'aire sont les CARRÉS des unités de longueur :

mm²  cm²  dm²   m²    dam²   hm²   km²
  ×100  ×100 ×100  ×100   ×100   ×100
  ÷100  ÷100 ÷100  ÷100   ÷100   ÷100

CONVERSIONS IMPORTANTES :
• 1 cm² = 100 mm²       (10 × 10)
• 1 dm² = 100 cm²       (10 × 10)
• 1 m²  = 100 dm²       (10 × 10)
• 1 m²  = 10 000 cm²    (100 × 100)
• 1 km² = 1 000 000 m²

UNITÉS AGRAIRES (pour les terrains) :
• 1 are (a) = 100 m²
• 1 hectare (ha) = 100 ares = 10 000 m²
• 1 km² = 100 ha

EXEMPLES DE CONVERSIONS :
• 3,5 m² = 3,5 × 10 000 = 35 000 cm²
• 45 000 cm² = 45 000 ÷ 10 000 = 4,5 m²
• 2,5 ha = 2,5 × 10 000 = 25 000 m²

ASTUCE : Pour convertir en unités d'aire,
on multiplie/divise par des puissances de 100 (pas 10 !)
car les unités d'aire sont des carrés.

🌍 EXEMPLES AFRICAINS :
• Surface du Gabon ≈ 268 000 km²
• Un terrain à Libreville ≈ 500 m² = 5 ares = 0,05 ha
• Une case ronde ≈ 12 m² de surface au sol`,
        exemples:[
          {question:"Convertir 4,5 m² en cm².", reponse:"4,5 × 10 000 = 45 000 cm²"},
          {question:"Convertir 350 cm² en dm².", reponse:"350 ÷ 100 = 3,5 dm²"},
          {question:"Un terrain de 2 500 m². Combien d'ares ? Combien d'hectares ?", reponse:"2 500 m² = 2 500÷100 = 25 ares. 25 ares = 25÷100 = 0,25 ha."},
        ]
      },
      { id:"14-3", titre:"Formules d'aire des figures usuelles",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRE DU CARRÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : A = c × c = c²   (c = côté)

DÉMONSTRATION : Un carré de côté c contient c × c = c² petits carrés unités.

EXEMPLE : Carré de côté 7 cm → A = 7² = 49 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRE DU RECTANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : A = L × ℓ   (L = longueur, ℓ = largeur)

DÉMONSTRATION : On peut diviser le rectangle en L × ℓ petits carrés unités.

EXEMPLE : Rectangle 12 cm × 5 cm → A = 12 × 5 = 60 cm²

TROUVER UN CÔTÉ : L = A ÷ ℓ   ou   ℓ = A ÷ L

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRE DU PARALLÉLOGRAMME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : A = base × hauteur = b × h

DÉMONSTRATION VISUELLE :
   ┌──────────────┐
  /              /   On "coupe" le triangle de gauche
 /              /    et on le place à droite
/──────────────/     → on obtient un rectangle de base b et de hauteur h !
└──────────────┘

⚠️ La HAUTEUR est la distance perpendiculaire entre les deux bases parallèles.
   Elle n'est PAS forcément un côté du parallélogramme !

EXEMPLE : Parallélogramme de base 8 cm et hauteur 5 cm → A = 8 × 5 = 40 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRE DU TRIANGLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : A = (base × hauteur) ÷ 2 = (b × h) / 2

DÉMONSTRATION : Un triangle est la moitié d'un parallélogramme de même base et même hauteur.

        A
       /|
      / |  h (hauteur)
     /  |
    B───H───C    b (base)

EXEMPLE : Triangle de base 10 cm et hauteur 6 cm → A = (10 × 6) ÷ 2 = 30 cm²

⚠️ La HAUTEUR est perpendiculaire à la BASE (pas forcément un côté).
   Il faut bien identifier la hauteur correspondant à la base choisie !

CAS PARTICULIER — Triangle rectangle :
A = (cathète₁ × cathète₂) ÷ 2
(Les deux cathètes jouent le rôle de base et hauteur)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRE DU TRAPÈZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : A = ((grande base + petite base) × hauteur) ÷ 2
          A = ((B + b) × h) ÷ 2

DÉMONSTRATION : Le trapèze peut être divisé en 2 triangles de même hauteur.

      ┌────────────┐  b (petite base)
     /│            │\
    / │    h       │ \
   /  │            │  \
  └───┴────────────┴───┘  B (grande base)

EXEMPLE : Trapèze avec B=12 cm, b=7 cm, h=5 cm
→ A = (12 + 7) × 5 ÷ 2 = 19 × 5 ÷ 2 = 95 ÷ 2 = 47,5 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRE DU DISQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : A = π × r²   (r = rayon)

EXEMPLES :
• Disque de rayon 5 cm : A = π × 5² = 25π ≈ 25 × 3,14 = 78,5 cm²
• Disque de diamètre 8 cm : r = 4 cm → A = π × 4² = 16π ≈ 50,24 cm²

⚠️ NE PAS CONFONDRE :
• Circonférence = 2πr  (longueur du contour, en cm)
• Aire du disque = πr²  (surface intérieure, en cm²)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Figure         │ Périmètre            │ Aire
───────────────┼──────────────────────┼──────────────────
Carré (c)      │ 4c                   │ c²
Rectangle(L,ℓ) │ 2(L+ℓ)              │ L×ℓ
Parallélogramme│ 2(a+b)              │ b×h
Triangle       │ a+b+c                │ (b×h)÷2
Trapèze        │ a+b+c+d              │ ((B+b)×h)÷2
Disque (r)     │ 2πr                  │ πr²

🌍 EXEMPLES AFRICAINS :
• Terrain rectangulaire 40m×25m : Aire=40×25=1000 m²=10 ares
• Champ triangulaire : base=60m, hauteur=40m → Aire=(60×40)÷2=1200 m²
• Rond-point circulaire r=15m : Aire=π×225≈707 m²
• Toit trapézoïdal : B=10m, b=6m, h=3m → Aire=(10+6)×3÷2=24 m²`,
        exemples:[
          {question:"Calculer l'aire d'un rectangle de 15 cm × 8 cm.", reponse:"A = 15 × 8 = 120 cm²"},
          {question:"Calculer l'aire d'un triangle de base 12 cm et hauteur 7 cm.", reponse:"A = (12 × 7) ÷ 2 = 84 ÷ 2 = 42 cm²"},
          {question:"Calculer l'aire d'un disque de rayon 6 cm. (π ≈ 3,14)", reponse:"A = π × r² = 3,14 × 36 = 113,04 cm²"},
          {question:"Calculer l'aire d'un trapèze de bases 10 cm et 6 cm, et de hauteur 4 cm.", reponse:"A = (10+6) × 4 ÷ 2 = 16 × 4 ÷ 2 = 64 ÷ 2 = 32 cm²"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer le périmètre d'un carré de côté 9 cm.", solution:"P = 4 × 9 = 36 cm"},
      {id:2,  niveau:"Facile",    enonce:"Calculer l'aire d'un carré de côté 9 cm.", solution:"A = 9² = 81 cm²"},
      {id:3,  niveau:"Facile",    enonce:"Calculer le périmètre et l'aire d'un rectangle de 14 cm × 6 cm.", solution:"P = 2×(14+6) = 2×20 = 40 cm. A = 14×6 = 84 cm²."},
      {id:4,  niveau:"Facile",    enonce:"Calculer l'aire d'un triangle de base 10 cm et de hauteur 8 cm.", solution:"A = (10 × 8) ÷ 2 = 80 ÷ 2 = 40 cm²"},
      {id:5,  niveau:"Facile",    enonce:"Convertir 3 m² en cm².", solution:"3 × 10 000 = 30 000 cm²"},
      {id:6,  niveau:"Moyen",     enonce:"Un parallélogramme a une base de 12 cm et une hauteur de 7 cm. Calculer son aire.", solution:"A = base × hauteur = 12 × 7 = 84 cm²"},
      {id:7,  niveau:"Moyen",     enonce:"Un trapèze a des bases de 15 cm et 9 cm, et une hauteur de 6 cm. Calculer son aire.", solution:"A = (15+9) × 6 ÷ 2 = 24 × 6 ÷ 2 = 144 ÷ 2 = 72 cm²"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer l'aire d'un disque de diamètre 10 cm. (π ≈ 3,14)", solution:"r = 10÷2 = 5 cm. A = π × r² = 3,14 × 25 = 78,5 cm²"},
      {id:9,  niveau:"Moyen",     enonce:"Un terrain rectangulaire de 45 m × 30 m. Calculer son aire en m², en ares et en hectares.", solution:"A = 45×30 = 1 350 m². En ares : 1 350÷100 = 13,5 ares. En hectares : 1 350÷10 000 = 0,135 ha."},
      {id:10, niveau:"Moyen",     enonce:"Un rectangle a une aire de 84 cm² et une longueur de 12 cm. Calculer sa largeur et son périmètre.", solution:"ℓ = A÷L = 84÷12 = 7 cm. P = 2×(12+7) = 2×19 = 38 cm."},
      {id:11, niveau:"Difficile", enonce:"Un jardin est composé d'un rectangle de 20 m × 12 m auquel on a enlevé un triangle de base 8 m et hauteur 6 m dans un coin. Calculer l'aire du jardin.", solution:"Aire rectangle = 20×12 = 240 m². Aire triangle = (8×6)÷2 = 24 m². Aire jardin = 240−24 = 216 m²."},
      {id:12, niveau:"Difficile", enonce:"Un terrain circulaire de rayon 7 m est entouré d'une allée de 1 m de large. Calculer l'aire de l'allée uniquement. (π ≈ 22/7)", solution:"Aire grand disque (r=8) = π×64 = (22/7)×64 = 1408/7 ≈ 201,1 m². Aire petit disque (r=7) = π×49 = (22/7)×49 = 22×7 = 154 m². Aire allée = 201,1−154 ≈ 47,1 m²."},
      {id:13, niveau:"Difficile", enonce:"Un carré et un rectangle ont la même aire de 100 cm². Le rectangle a une longueur de 25 cm. Calculer le côté du carré et la largeur du rectangle. Comparer leurs périmètres.", solution:"Carré : c = √100 = 10 cm. P carré = 4×10 = 40 cm. Rectangle : ℓ = 100÷25 = 4 cm. P rectangle = 2×(25+4) = 58 cm. Le carré a le plus petit périmètre (40 < 58) : à aire égale, le carré minimise le périmètre !"},
      {id:14, niveau:"Difficile", enonce:"Un agriculteur gabonais a un champ triangulaire de base 80 m et hauteur 60 m. Il veut le clôturer (les 3 côtés mesurent 80 m, 61 m et 61 m). Prix de la clôture : 2 500 FCFA/m. Prix de la culture : 1 500 FCFA/m². Calculer le coût total.", solution:"Aire = (80×60)÷2 = 2 400 m². Coût culture = 2 400×1 500 = 3 600 000 FCFA. Périmètre = 80+61+61 = 202 m. Coût clôture = 202×2 500 = 505 000 FCFA. Coût total = 3 600 000+505 000 = 4 105 000 FCFA."},
      {id:15, niveau:"Difficile", enonce:"Une figure est composée d'un demi-disque de diamètre 8 cm posé sur un rectangle de 8 cm × 5 cm. Calculer son périmètre et son aire. (π ≈ 3,14)", solution:"PÉRIMÈTRE : 3 côtés du rectangle (pas le côté sur lequel est le demi-disque) + demi-circonférence. P = 8+5+5 + (2π×4)÷2 = 18 + 4π ≈ 18+12,56 = 30,56 cm. AIRE : Aire rectangle + Aire demi-disque = 8×5 + (π×4²)÷2 = 40 + 8π ≈ 40+25,12 = 65,12 cm²."},
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

const SYSTEM_PROMPT = `Tu es Kodjo, un tuteur IA bienveillant pour AfriLearn. Tu aides des élèves de 6ème dans toute l'Afrique.
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
        {[["Objet","AfriLearn est une plateforme éducative numérique pour les élèves d'Afrique."],["Propriété intellectuelle","Tous les contenus (cours, exercices, corrigés, logo) sont la propriété exclusive d'AfriLearn. Toute reproduction sans autorisation est interdite."],["Abonnements","Abonnements mensuels. Paiement via Mobile Money ou carte (CinetPay). Aucun remboursement après accès."],["Tuteur IA Kodjo","Fourni à titre pédagogique. Croiser avec un enseignant qualifié est recommandé."],["Données personnelles","Seules les données nécessaires sont collectées. Jamais vendues à des tiers."],["Comportement","Tout abus entraîne la suspension immédiate du compte."],["Droit applicable","CGU soumises au droit gabonais. Litiges : tribunaux de Libreville."]].map(([t,c])=>(
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
            <span style={{ fontSize:12, color:"var(--gold)", fontWeight:600, letterSpacing:"0.04em" }}>Plateforme éducative IA · Afrique</span>
          </div>

          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(2.8rem,7vw,5rem)", fontWeight:700, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:24, maxWidth:700 }}>
            Apprendre,<br/>
            <span style={{ color:"var(--gold)", fontStyle:"italic" }}>progresser</span>,<br/>
            réussir.
          </h1>

          <p style={{ fontSize:"clamp(15px,2vw,18px)", color:"var(--muted)", lineHeight:1.7, maxWidth:480, margin:"0 auto 40px" }}>
            De la 6ème à la Terminale — cours complets, exercices, tuteur IA Kodjo et compétition entre élèves de toute l'Afrique.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={() => onEnter("register")} color="var(--gold)" style={{ padding:"14px 32px", fontSize:15, borderRadius:14 }}>Commencer gratuitement</Btn>
            <Btn onClick={() => onEnter("login")} variant="outline" color="var(--text)" style={{ padding:"14px 28px", fontSize:15, borderRadius:14 }}>Se connecter</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:0, marginTop:64, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:18, overflow:"hidden", opacity:visible?1:0, transition:"opacity 0.7s ease 0.3s" }}>
          {[["20+","Pays africains"],["7","Niveaux scolaires"],["10+","Matières / niveau"],["1 400+","Chapitres de cours"],["21 000+","Exercices corrigés"]].map(([n,l],i,arr)=>(
            <div key={l} style={{ padding:"20px 28px", textAlign:"center", borderRight:i<arr.length-1?"1px solid var(--border)":"none" }}>
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
        <p style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>Classement · Toute l'Afrique</p>
        <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:28, fontWeight:700, letterSpacing:"-0.02em" }}>Compétition <span style={{ color:"var(--gold)" }}>africaine</span></h2>
      </div>
      {!ok ? (
        <Surface style={{ textAlign:"center", padding:48, borderColor:"rgba(62,201,139,0.25)" }}>
          <p style={{ fontSize:48, marginBottom:16 }}>🏆</p>
          <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Fonctionnalité Premium</h3>
          <p style={{ color:"var(--muted)", fontSize:14, maxWidth:300, margin:"0 auto 24px" }}>Défie des élèves de toute l'Afrique. Disponible à <strong style={{ color:"var(--green)" }}>2 995 FCFA/mois</strong>.</p>
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
        <p style={{ fontWeight:600, marginBottom:4 }}>💳 Paiements — Powered by CinetPay</p>
        <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14 }}>Mobile Money disponible dans les pays partenaires · Visa/Mastercard acceptée partout en Afrique</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:8 }}>
          {[["🇬🇦","Gabon","Airtel · Moov"],["🇨🇲","Cameroun","MTN · Orange"],["🇨🇮","Côte d'Ivoire","MTN · Wave"],["🇸🇳","Sénégal","Orange · Wave"],["🇨🇩","RDC","M-Pesa · Airtel"],["🌍","Tous les pays","Visa · Mastercard"]].map(([f,c,m]) => (
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
