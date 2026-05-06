import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

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

// ─── HOOK : Chargement des chapitres depuis Supabase ─────────────────────────
function useChapters(levelId = 1, subjectId = 1) {
  const [chapters, setChapters] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Charger les parties
        const { data: partsData, error: partsError } = await supabase
          .from("parts")
          .select("*")
          .eq("level_id", levelId)
          .eq("subject_id", subjectId)
          .order("order_num");

        if (partsError) throw partsError;

        // Charger les chapitres
        const { data: chaptersData, error: chaptersError } = await supabase
          .from("chapters")
          .select("id, title, order_num, duration, objectives, parts(name, icon, color, order_num)")
          .eq("level_id", levelId)
          .eq("subject_id", subjectId)
          .order("order_num");

        if (chaptersError) throw chaptersError;

        // Formater les données pour correspondre à l'ancienne structure
        const formattedParts = partsData.map(p => ({
          id: p.order_num,
          name: p.name,
          icon: p.icon,
          color: p.color,
        }));

        const formattedChapters = chaptersData.map(c => ({
          id: c.order_num,
          part: c.parts?.order_num || 1,
          title: c.title,
          partName: c.parts?.name || "",
          partIcon: c.parts?.icon || "📚",
          partColor: c.parts?.color || "var(--gold)",
          dbId: c.id,
          objectives: c.objectives || [],
          duration: c.duration || "",
        }));

        setParts(formattedParts);
        setChapters(formattedChapters);
      } catch (err) {
        console.error("Erreur chargement Supabase:", err);
        setError(err.message);
        // Fallback sur les données statiques en cas d'erreur
        setParts(PARTS_STATIC);
        setChapters(CHAPTERS_STATIC);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [levelId, subjectId]);

  return { chapters, parts, loading, error };
}


// ─── HOOK : Chargement du contenu d'un chapitre depuis Supabase ──────────────
function useChapterContent(chapterId) {
  const [lessons, setLessons] = useState(null);
  const [exercises, setExercises] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;
    async function load() {
      try {
        setLoading(true);

        // Charger les leçons avec leurs exemples
        // On utilise chapterId qui est le vrai ID en base (dbId)
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*, lesson_examples(*)")
          .eq("chapter_id", chapterId)
          .order("order_num");

        if (lessonsError) throw lessonsError;

        // Charger les exercices
        const { data: exoData, error: exoError } = await supabase
          .from("exercises")
          .select("*")
          .eq("chapter_id", chapterId)
          .order("order_num");

        if (exoError) throw exoError;

        // Formater pour correspondre à l'ancienne structure
        const formattedLessons = lessonsData.map(l => ({
          id: `${chapterId}-${l.order_num}`,
          titre: l.title,
          contenu: l.content,
          exemples: (l.lesson_examples || [])
            .sort((a,b) => a.order_num - b.order_num)
            .map(e => ({ question: e.question, reponse: e.answer })),
        }));

        const formattedExos = exoData.map(e => ({
          id: e.order_num,
          niveau: e.level,
          enonce: e.question,
          solution: e.solution,
        }));

        setLessons(formattedLessons);
        setExercises(formattedExos);
      } catch (err) {
        console.error("Erreur chargement contenu:", err);
        // Pas de fallback statique — afficher message "contenu en préparation"
        setLessons(null);
        setExercises(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [chapterId]);

  return { lessons, exercises, loading };
}


// ─── HOOK : Suivi de progression ─────────────────────────────────────────────
function useProgress(userId) {
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState({ completed: 0, total: 25, percent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    async function load() {
      try {
        const { data } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", userId);

        if (data) {
          const progressMap = {};
          data.forEach(p => { progressMap[p.chapter_id] = p; });
          setProgress(progressMap);
          const completed = data.filter(p => p.completed).length;
          setStats({ completed, total: 25, percent: Math.round((completed / 25) * 100) });
        }
      } catch (err) {
        console.error("Erreur chargement progression:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  // Sauvegarder la progression d'un chapitre
  const saveProgress = async (userId, chapterId, score, completed) => {
    if (!userId) return;
    try {
      await supabase.from("progress").upsert({
        user_id: userId,
        chapter_id: chapterId,
        score: score,
        completed: completed,
        last_visited: new Date().toISOString(),
      }, { onConflict: "user_id,chapter_id" });

      // Mettre à jour l'état local
      setProgress(prev => ({
        ...prev,
        [chapterId]: { chapter_id: chapterId, score, completed }
      }));

      if (completed) {
        setStats(prev => {
          const newCompleted = prev.completed + (progress[chapterId]?.completed ? 0 : 1);
          return { ...prev, completed: newCompleted, percent: Math.round((newCompleted / 25) * 100) };
        });
      }
    } catch (err) {
      console.error("Erreur sauvegarde progression:", err);
    }
  };

  return { progress, stats, loading, saveProgress };
}

// ─── DONNÉES STATIQUES (fallback si Supabase indisponible) ───────────────────
const CHAPTERS_STATIC = [
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

const PARTS_STATIC = [
  {id:1, name:"Nombres & Calculs",       icon:"🔢", color:"#E8A838"},
  {id:2, name:"Géométrie plane",         icon:"📐", color:"#4A9EF5"},
  {id:3, name:"Grandeurs & Mesures",     icon:"📏", color:"#3EC98B"},
  {id:4, name:"Géométrie dans l'espace", icon:"🔷", color:"#9B7FE8"},
  {id:5, name:"Données & Statistiques",  icon:"📊", color:"#F56565"},
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

  15: {
    id:15, title:"Longueurs", duration:"2 semaines",
    objectives:[
      "Connaître les unités de longueur du système international",
      "Convertir des longueurs d'une unité à une autre",
      "Mesurer une longueur avec précision",
      "Calculer des périmètres en utilisant les bonnes unités",
      "Résoudre des problèmes concrets faisant intervenir des longueurs",
    ],
    cours:[
      { id:"15-1", titre:"Unités de longueur et conversions",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE SYSTÈME INTERNATIONAL DE LONGUEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'unité de base de longueur dans le Système International (SI) est le MÈTRE (m).
Toutes les autres unités en dérivent.

TABLEAU DES UNITÉS (du plus grand au plus petit) :

km    hm    dam    m    dm    cm    mm
│      │      │     │     │     │     │
×10   ×10   ×10   ×10   ×10   ×10

• km  = kilomètre      = 1 000 m
• hm  = hectomètre     = 100 m
• dam = décamètre      = 10 m
• m   = mètre          = unité de base
• dm  = décimètre      = 0,1 m
• cm  = centimètre     = 0,01 m
• mm  = millimètre     = 0,001 m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE DE CONVERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Pour convertir vers une unité PLUS PETITE → on MULTIPLIE par 10
  (à chaque pas vers la droite dans le tableau)
• Pour convertir vers une unité PLUS GRANDE → on DIVISE par 10
  (à chaque pas vers la gauche dans le tableau)

ASTUCE : Compter le nombre de "pas" entre les deux unités, puis
multiplier ou diviser par 10, 100, 1 000, 10 000...

CONVERSIONS DIRECTES UTILES :
• 1 km = 1 000 m              (3 pas → ×1 000)
• 1 m  = 100 cm               (2 pas → ×100)
• 1 m  = 1 000 mm             (3 pas → ×1 000)
• 1 cm = 10 mm                (1 pas → ×10)
• 1 km = 100 000 cm           (5 pas → ×100 000)

EXEMPLES DE CONVERSIONS :
• 3,5 km = 3,5 × 1 000 = 3 500 m
• 250 cm = 250 ÷ 100 = 2,5 m
• 4,7 m  = 4,7 × 1 000 = 4 700 mm
• 85 mm  = 85 ÷ 10 = 8,5 cm
• 2,3 km = 2,3 × 100 000 = 230 000 cm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE DU TABLEAU DE CONVERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
On place le chiffre des unités dans la colonne de l'unité donnée,
puis on lit dans la colonne de l'unité voulue.

EXEMPLE : Convertir 3,75 m en cm
  km │ hm │ dam │  m  │ dm  │  cm │ mm
     │    │     │  3  │  7  │   5 │
→ On lit : 375 cm

EXEMPLE : Convertir 3 475 mm en m
  km │ hm │ dam │  m  │ dm  │  cm │ mm
     │    │     │  3  │  4  │   7 │  5
→ On lit : 3,475 m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNITÉS PARTICULIÈRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Le MICROMÈTRE (μm) = 0,001 mm (utilisé en biologie, microscopie)
• Le NANOMÈTRE (nm) = 0,000001 mm (utilisé en physique, chimie)
• L'ANGSTRÖM (Å) = 0,0000001 mm (rayon des atomes)
• L'ANNÉE-LUMIÈRE = 9 461 milliards de km (distances astronomiques)
• Le MILLE MARIN = 1 852 m (navigation maritime)

📌 AU COLLÈGE, on utilise principalement : mm, cm, dm, m, km.

🌍 EXEMPLES AFRICAINS :
• Distance Libreville–Port-Gentil ≈ 110 km = 110 000 m = 11 000 000 cm
• Hauteur du mont Cameroun : 4 095 m = 4,095 km = 409 500 cm
• Longueur d'un crayon : 19 cm = 190 mm = 0,19 m
• Largeur d'un grain de riz : ≈ 3 mm = 0,3 cm = 0,003 m
• Longueur du fleuve Congo : 4 700 km = 4 700 000 m`,
        exemples:[
          {question:"Convertir 4,8 km en m, puis en cm.", reponse:"4,8 km = 4,8 × 1 000 = 4 800 m. 4 800 m = 4 800 × 100 = 480 000 cm."},
          {question:"Convertir 3 250 mm en m.", reponse:"3 250 mm ÷ 1 000 = 3,25 m"},
          {question:"Ranger dans l'ordre croissant : 2,3 m ; 185 cm ; 25 mm ; 0,002 km", reponse:"Convertissons en cm : 230 cm ; 185 cm ; 2,5 cm ; 200 cm. Ordre : 25 mm < 185 cm < 0,002 km < 2,3 m"},
        ]
      },
      { id:"15-2", titre:"Mesure de longueurs et instruments",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUMENTS DE MESURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LA RÈGLE GRADUÉE
   • Pour mesurer des segments courts (jusqu'à 30 ou 50 cm)
   • Précision : au millimètre (0,1 cm)
   • MÉTHODE : Aligner le 0 de la règle avec une extrémité du segment,
     lire la graduation en face de l'autre extrémité.

2. LE MÈTRE RUBAN (décamètre)
   • Pour mesurer de plus grandes longueurs (jusqu'à 50 m)
   • Utilisé en menuiserie, couture, construction
   • Précision : au centimètre ou millimètre

3. L'ODOMÈTRE (roue de comptage)
   • Pour mesurer de longues distances sur le terrain
   • On roule la roue le long du chemin

4. LE GPS / TÉLÉMÈTRE LASER
   • Pour des mesures précises à grande distance
   • Utilisé en architecture, géomètre

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESURE AVEC UNE RÈGLE — PRÉCAUTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Bien aligner le ZÉRO (pas le bord de la règle) avec l'extrémité du segment
2. Regarder la graduation PERPENDICULAIREMENT (éviter l'erreur de parallaxe)
3. Lire la graduation la plus proche
4. Indiquer l'UNITÉ dans la réponse

ERREUR FRÉQUENTE : Commencer à mesurer depuis le bord de la règle
(qui n'est pas forcément le zéro !) → toujours partir du 0 !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCULER AVEC DES LONGUEURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE ESSENTIELLE : On ne peut additionner/soustraire des longueurs
qu'en les exprimant dans la MÊME UNITÉ !

EXEMPLE : 3 km + 500 m = ?
→ On convertit : 3 km = 3 000 m
→ 3 000 m + 500 m = 3 500 m = 3,5 km ✓

EXEMPLE FAUX : 3 km + 500 m = 3,500 km (FAUX si on garde les unités différentes)

EXEMPLE : 2,5 m − 30 cm = ?
→ On convertit : 30 cm = 0,30 m
→ 2,5 m − 0,3 m = 2,2 m ✓
→ Ou : 2,5 m = 250 cm → 250 − 30 = 220 cm = 2,2 m ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉCHELLE ET DISTANCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une CARTE ou un PLAN utilise une ÉCHELLE pour représenter des distances réelles.

ÉCHELLE = distance sur la carte ÷ distance réelle

EXEMPLE : Échelle 1:50 000 signifie
1 cm sur la carte = 50 000 cm = 500 m = 0,5 km dans la réalité.

FORMULES :
• Distance réelle = Distance carte × Dénominateur de l'échelle
• Distance carte = Distance réelle ÷ Dénominateur de l'échelle

EXEMPLE : Sur une carte à l'échelle 1:25 000, deux villes sont à 8 cm.
Distance réelle = 8 × 25 000 = 200 000 cm = 2 000 m = 2 km.

🌍 EXEMPLES AFRICAINS :
• Plan de Libreville à l'échelle 1:10 000 :
  1 cm sur le plan = 10 000 cm = 100 m dans la réalité.
  Distance sur le plan = 5 cm → distance réelle = 5 × 100 = 500 m.
• Carte du Gabon à l'échelle 1:1 000 000 :
  1 cm sur la carte = 10 km dans la réalité.
  Libreville–Franceville ≈ 85 cm sur la carte → 850 km réels.`,
        exemples:[
          {question:"Calculer 2 km + 350 m + 45 cm (réponse en m)", reponse:"2 km = 2 000 m ; 45 cm = 0,45 m. Total = 2 000 + 350 + 0,45 = 2 350,45 m"},
          {question:"Sur une carte à l'échelle 1:50 000, la distance entre deux villages est 6 cm. Quelle est la distance réelle ?", reponse:"6 × 50 000 = 300 000 cm = 3 000 m = 3 km"},
          {question:"La distance Libreville–Oyem est 476 km. Sur une carte à l'échelle 1:2 000 000, quelle longueur représente cette distance ?", reponse:"476 km = 47 600 000 cm. Distance carte = 47 600 000 ÷ 2 000 000 = 23,8 cm"},
        ]
      },
      { id:"15-3", titre:"Périmètres et longueurs en contexte",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PÉRIMÈTRE ET CHOIX DE L'UNITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le choix de l'unité dépend de la taille de la figure :
• Figures en classe : mm ou cm
• Terrain, chambre : m
• Ville, route : km

RÈGLE : Toujours exprimer le périmètre dans l'unité la plus adaptée au contexte.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LONGUEUR D'UN CHEMIN OU D'UN TRAJET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La longueur d'un chemin = somme de tous les tronçons.

EXEMPLE : Un chemin passe par A→B (2,5 km), B→C (1 800 m), C→D (450 m).
Longueur totale = 2,5 km + 1 800 m + 450 m
               = 2 500 m + 1 800 m + 450 m
               = 4 750 m = 4,75 km

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLÈMES TYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE 1 — CLÔTURE :
"Combien de mètres de grillage pour entourer un terrain ?"
→ Calculer le PÉRIMÈTRE du terrain.

TYPE 2 — NOMBRE DE POTEAUX :
"Combien de poteaux espacés de d mètres pour une clôture de L mètres ?"
→ Nombre d'intervalles = L ÷ d
→ Nombre de poteaux = (L ÷ d) + 1 (si le circuit n'est pas fermé)
→ Nombre de poteaux = L ÷ d (si le circuit est fermé)

TYPE 3 — ROUE QUI ROULE :
"Combien de tours fait une roue de circonférence C pour parcourir D ?"
→ Nombre de tours = D ÷ C

TYPE 4 — ÉCHELLE :
Voir leçon 2.

🌍 EXEMPLES AFRICAINS :
• Clôturer un terrain rectangulaire de 45 m × 30 m avec des poteaux tous les 3 m.
  Périmètre = 2×(45+30) = 150 m. Poteaux = 150÷3 = 50 poteaux (circuit fermé).

• Un taxi-brousse parcourt Libreville–Lambaréné (250 km).
  Les roues ont un diamètre de 70 cm → circonférence = π × 70 ≈ 220 cm = 2,2 m.
  Nombre de tours = 250 000 m ÷ 2,2 m ≈ 113 636 tours !

• Un tissu de 5 m de long. On coupe 12 morceaux de 38 cm chacun.
  Longueur coupée = 12 × 38 = 456 cm = 4,56 m.
  Longueur restante = 5 m − 4,56 m = 0,44 m = 44 cm.`,
        exemples:[
          {question:"Un terrain rectangulaire de 60 m × 40 m doit être clôturé. Calculer la longueur de grillage nécessaire.", reponse:"P = 2×(60+40) = 2×100 = 200 m de grillage"},
          {question:"Une roue de vélo a un diamètre de 66 cm. Combien de tours fait-elle pour parcourir 1 km ? (π ≈ 3,14)", reponse:"Circonférence = π×66 ≈ 207,24 cm = 2,0724 m. Tours = 1 000÷2,0724 ≈ 483 tours"},
          {question:"Un chemin fait A→B = 1,5 km, B→C = 800 m, C→A = 0,9 km. Quelle est sa longueur totale ?", reponse:"Total = 1 500+800+900 = 3 200 m = 3,2 km"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Convertir 5,3 km en m.", solution:"5,3 × 1 000 = 5 300 m"},
      {id:2,  niveau:"Facile",    enonce:"Convertir 850 cm en m.", solution:"850 ÷ 100 = 8,5 m"},
      {id:3,  niveau:"Facile",    enonce:"Convertir 4,2 m en mm.", solution:"4,2 × 1 000 = 4 200 mm"},
      {id:4,  niveau:"Facile",    enonce:"Ranger du plus petit au plus grand : 3 m ; 250 cm ; 0,004 km ; 3 200 mm", solution:"Convertir en cm : 300 ; 250 ; 400 ; 320. Ordre : 250 cm < 300 cm < 320 cm < 400 cm → 250 cm < 3 m < 3 200 mm < 0,004 km"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 2 m + 35 cm + 8 mm (réponse en cm).", solution:"200 cm + 35 cm + 0,8 cm = 235,8 cm"},
      {id:6,  niveau:"Moyen",     enonce:"Sur une carte à l'échelle 1:25 000, la distance entre deux villages est 7,2 cm. Calculer la distance réelle en km.", solution:"7,2 × 25 000 = 180 000 cm = 1 800 m = 1,8 km"},
      {id:7,  niveau:"Moyen",     enonce:"La distance réelle Brazzaville–Kinshasa est 4 km. Sur une carte à l'échelle 1:100 000, quelle est la distance sur la carte ?", solution:"4 km = 400 000 cm. Distance carte = 400 000 ÷ 100 000 = 4 cm"},
      {id:8,  niveau:"Moyen",     enonce:"Un menuisier coupe 8 planches de 75 cm dans une planche de 7 m. Quelle longueur reste-t-il ?", solution:"Longueur coupée = 8 × 75 = 600 cm = 6 m. Reste = 7 − 6 = 1 m = 100 cm."},
      {id:9,  niveau:"Moyen",     enonce:"Un terrain rectangulaire de 80 m × 50 m doit être clôturé avec des poteaux espacés de 4 m. Calculer le nombre de poteaux nécessaires.", solution:"Périmètre = 2×(80+50) = 260 m. Nombre de poteaux = 260÷4 = 65 poteaux (circuit fermé)."},
      {id:10, niveau:"Moyen",     enonce:"Jean habite à 2,4 km de son école. Il fait le trajet aller-retour 5 jours par semaine. Quelle distance parcourt-il par semaine ?", solution:"Aller-retour = 2 × 2,4 = 4,8 km. Par semaine = 4,8 × 5 = 24 km."},
      {id:11, niveau:"Difficile", enonce:"Une roue de camion a un diamètre de 1,2 m. Le camion part de Libreville et roule 156 km. Combien de tours fait la roue ? (π ≈ 3,14)", solution:"Circonférence = π × 1,2 = 3,14 × 1,2 = 3,768 m. Distance = 156 km = 156 000 m. Nombre de tours = 156 000 ÷ 3,768 ≈ 41 401 tours."},
      {id:12, niveau:"Difficile", enonce:"Un tissu de 12 m doit être coupé en morceaux. On veut faire des morceaux de 85 cm pour des pagnes. Combien de pagnes peut-on faire ? Quelle longueur reste-t-il ?", solution:"12 m = 1 200 cm. Nombre de pagnes = 1 200 ÷ 85 = 14 pagnes complets (14×85=1190 cm). Reste = 1 200 − 1 190 = 10 cm."},
      {id:13, niveau:"Difficile", enonce:"Un plan de maison est dessiné à l'échelle 1:50. Une pièce mesure 6 cm × 4,5 cm sur le plan. Calculer les dimensions réelles de la pièce et son périmètre réel.", solution:"Longueur réelle = 6 × 50 = 300 cm = 3 m. Largeur réelle = 4,5 × 50 = 225 cm = 2,25 m. Périmètre = 2×(3+2,25) = 2×5,25 = 10,5 m."},
      {id:14, niveau:"Difficile", enonce:"Un randonneur part du point A. Il marche 3,5 km vers le nord, puis 2 800 m vers l'est, puis 1,2 km vers le sud, puis 400 m vers l'ouest. Calculer la longueur totale de son trajet.", solution:"3,5 km + 2 800 m + 1,2 km + 400 m = 3 500 m + 2 800 m + 1 200 m + 400 m = 7 900 m = 7,9 km"},
      {id:15, niveau:"Difficile", enonce:"La piste d'athlétisme du lycée de Libreville est un rectangle aux coins arrondis. Les lignes droites mesurent 84,39 m chacune et les demi-cercles ont un rayon de 36,8 m. Calculer la longueur d'un tour de piste. (π ≈ 3,14)", solution:"2 lignes droites = 2 × 84,39 = 168,78 m. 2 demi-cercles = 1 cercle complet = 2π×36,8 = 2×3,14×36,8 = 231,1 m. Tour complet = 168,78 + 231,1 ≈ 399,88 m ≈ 400 m (piste standard !)."},
    ],
  },

  16: {
    id:16, title:"Masses", duration:"2 semaines",
    objectives:[
      "Distinguer masse et poids (notions différentes)",
      "Connaître les unités de masse du système international",
      "Convertir des masses d'une unité à une autre",
      "Utiliser les instruments de mesure de masse",
      "Résoudre des problèmes concrets faisant intervenir des masses",
    ],
    cours:[
      { id:"16-1", titre:"Masse et poids — une distinction importante",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MASSE vs POIDS — NE PAS CONFONDRE !
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
En langage courant, on dit souvent "peser" pour désigner les deux.
En sciences, ce sont deux notions DIFFÉRENTES :

MASSE :
• Quantité de matière contenue dans un objet
• Ne change JAMAIS, quel que soit l'endroit où on se trouve
• Unité : kilogramme (kg)
• Mesurée avec une BALANCE

POIDS :
• Force exercée par la pesanteur sur un objet
• Dépend du lieu (sur la Lune, on pèse 6 fois moins !)
• Unité : Newton (N) — étudié en physique
• Mesuré avec un DYNAMOMÈTRE (ressort)

RELATION : Poids (N) = Masse (kg) × g
où g ≈ 9,8 N/kg sur Terre (accélération de la pesanteur)

📌 AU COLLÈGE EN MATHÉMATIQUES, on travaille avec la MASSE.
   On dit "la masse d'un objet est 5 kg" et non "son poids est 5 kg"
   (même si dans la vie courante on dit souvent "il pèse 5 kg").

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNITÉS DE MASSE — TABLEAU COMPLET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'unité de base de masse dans le SI est le KILOGRAMME (kg).

t      kg     hg     dag     g     dg     cg     mg
│       │       │      │      │      │      │      │
  ×1000  ×10   ×10    ×10    ×10   ×10    ×10

UNITÉS PRINCIPALES ET LEURS VALEURS :
• t   = tonne           = 1 000 kg
• kg  = kilogramme      = unité de base (1 000 g)
• hg  = hectogramme     = 100 g
• dag = décagramme      = 10 g
• g   = gramme          = unité courante
• dg  = décigramme      = 0,1 g
• cg  = centigramme     = 0,01 g
• mg  = milligramme     = 0,001 g

CONVERSIONS DIRECTES LES PLUS UTILES :
• 1 t   = 1 000 kg
• 1 kg  = 1 000 g
• 1 g   = 1 000 mg
• 1 t   = 1 000 000 g
• 1 kg  = 1 000 000 mg

⚠️ PARTICULARITÉ : Entre la tonne et le kilogramme, il y a 1 000
(pas 10 comme entre les autres unités successives) !

📌 UNITÉS MOINS COURANTES :
• quintal (q) = 100 kg (utilisé en agriculture)
• once (oz) = environ 28,35 g (système anglo-saxon)
• livre (lb) = environ 453,6 g (système anglo-saxon)
• carat = 0,2 g (utilisé pour les pierres précieuses et l'or)`,
        exemples:[
          {question:"Convertir 3,5 kg en g.", reponse:"3,5 × 1 000 = 3 500 g"},
          {question:"Convertir 4 250 g en kg.", reponse:"4 250 ÷ 1 000 = 4,25 kg"},
          {question:"Convertir 2,4 t en kg.", reponse:"2,4 × 1 000 = 2 400 kg"},
          {question:"Quelle différence entre la masse et le poids ?", reponse:"La masse est une quantité de matière (en kg), constante partout. Le poids est une force due à la pesanteur (en Newton), qui varie selon le lieu (Terre, Lune...)."},
        ]
      },
      { id:"16-2", titre:"Conversions de masses et instruments",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE DE CONVERSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Même méthode que pour les longueurs :
• Vers une unité plus PETITE → MULTIPLIER par 10 (ou 1 000 pour t→kg)
• Vers une unité plus GRANDE → DIVISER par 10 (ou 1 000 pour kg→t)

MÉTHODE DU TABLEAU :
On place les chiffres dans les colonnes du tableau.

EXEMPLE : Convertir 2,75 kg en g
  t  │  kg  │  hg  │  dag  │  g  │  dg  │  cg  │  mg
     │   2  │   7  │   5   │  0  │      │      │
→ On lit : 2 750 g

EXEMPLE : Convertir 3 450 mg en g
  t  │  kg  │  hg  │  dag  │  g  │  dg  │  cg  │  mg
     │      │      │       │  3  │   4  │   5  │  0
→ On lit : 3,450 g = 3,45 g

EXEMPLES DE CONVERSIONS :
• 5,8 kg  = 5 800 g          (×1 000)
• 0,35 kg = 350 g            (×1 000)
• 7 200 g = 7,2 kg           (÷1 000)
• 3,5 t   = 3 500 kg         (×1 000)
• 850 kg  = 0,85 t           (÷1 000)
• 2,4 kg  = 2 400 000 mg     (×1 000 000)
• 15 dag  = 150 g = 0,15 kg  (dag→g : ×10 ; g→kg : ÷1000)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUMENTS DE MESURE DE MASSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. BALANCE À PLATEAUX (balance de Roberval) :
   • Principe : compare deux masses (objet + masses marquées)
   • L'équilibre indique l'égalité des masses
   • Très précise, utilisée en laboratoire et joaillerie
   • Masse minimale lisible : dépend des masses marquées disponibles

2. BALANCE ROMAINE :
   • Bras gradué avec un curseur mobile
   • Utilisée historiquement pour peser des marchandises
   • Encore utilisée sur les marchés africains

3. BALANCE ELECTRONIQUE / PÈSE-PERSONNE :
   • Affichage numérique direct
   • Très pratique, précision variable selon le modèle
   • Utilisée en médecine, cuisine, commerce

4. BALANCE DE MÉNAGE :
   • Pour cuisine : précision au gramme ou 5 g
   • Capacité généralement 5 kg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCULER AVEC DES MASSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE : Toujours convertir dans la même unité avant de calculer !

EXEMPLE : 3,5 kg + 800 g − 250 g = ?
En grammes : 3 500 + 800 − 250 = 4 050 g = 4,05 kg

EXEMPLE : Un camion de 3,5 t charge 750 kg de marchandises.
Masse totale = 3 500 kg + 750 kg = 4 250 kg = 4,25 t

MASSE VOLUMIQUE (notion) :
La MASSE VOLUMIQUE (ρ) d'un matériau indique la masse d'un litre (ou cm³) de ce matériau.
• ρ de l'eau = 1 kg/L = 1 000 g/L
• ρ du fer ≈ 7,87 kg/dm³
• ρ du bois (teck) ≈ 0,65 kg/dm³

FORMULE : masse = masse volumique × volume

🌍 EXEMPLES AFRICAINS :
• Un sac de cacao du Cameroun pèse 60 kg = 60 000 g
• Le léopard africain pèse environ 60 kg, le gorille 180 kg
• Un régime de bananes plantain pèse environ 15 kg = 15 000 g
• Un camion de riz : 40 sacs × 50 kg = 2 000 kg = 2 t
• L'éléphant d'Afrique pèse 4 à 7 t = 4 000 à 7 000 kg`,
        exemples:[
          {question:"Convertir 4,25 t en kg puis en g.", reponse:"4,25 t = 4 250 kg = 4 250 000 g"},
          {question:"Calculer : 2,5 kg + 300 g + 75 dag (réponse en g)", reponse:"2 500 g + 300 g + 750 g = 3 550 g (75 dag = 750 g car 1 dag = 10 g)"},
          {question:"Un camion vide pèse 4,2 t. Il charge 12 caisses de 85 kg chacune. Quelle est la masse totale ?", reponse:"Caisses : 12 × 85 = 1 020 kg. Total = 4 200 + 1 020 = 5 220 kg = 5,22 t"},
        ]
      },
      { id:"16-3", titre:"Problèmes de masses en contexte africain",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLÈMES TYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE 1 — PARTAGE ET RÉPARTITION :
"On répartit N kg en parts de p g. Combien de parts ?"
→ Convertir en même unité, puis diviser.

TYPE 2 — MÉLANGE :
"On mélange a kg de café à b g de chicorée. Masse totale ?"
→ Convertir, additionner.

TYPE 3 — RECETTE / PROPORTION :
"Une recette pour 4 personnes utilise 300 g de farine. Pour 10 personnes ?"
→ Règle de trois : 300 × 10 ÷ 4 = 750 g

TYPE 4 — TARIF AU KG :
"1 kg coûte p FCFA. Combien coûte m grammes ?"
→ Convertir m en kg, multiplier par p.

TYPE 5 — CHARGE MAXIMALE :
"Un camion peut porter au maximum M kg. Il charge n colis de p kg chacun.
Est-ce autorisé ?"
→ Comparer n×p avec M.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MASSES DE RÉFÉRENCE À CONNAÎTRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETS DU QUOTIDIEN :
• Grain de riz ≈ 25 mg
• Pièce de 100 FCFA ≈ 7 g
• Œuf de poule ≈ 60 g
• Téléphone portable ≈ 200 g
• Bouteille d'eau 1,5 L ≈ 1,5 kg (eau + bouteille)
• Sac de riz (standard) = 25 kg ou 50 kg
• Sac de ciment = 50 kg

ANIMAUX AFRICAINS :
• Poule ≈ 2 kg
• Mouton ≈ 40 kg
• Cochon ≈ 100 kg
• Bœuf ≈ 500 kg
• Hippopotame ≈ 1,5 t = 1 500 kg
• Éléphant ≈ 5 t = 5 000 kg

🌍 PROBLÈMES AFRICAINS :
PROBLÈME 1 : "Au marché de Libreville, un kilo de poisson frais coûte 2 500 FCFA.
Aminata achète 750 g de poisson. Combien paie-t-elle ?"
→ 750 g = 0,75 kg → 0,75 × 2 500 = 1 875 FCFA

PROBLÈME 2 : "Un camion de 5 t de charge maximale doit transporter
des sacs de ciment de 50 kg chacun. Combien de sacs peut-il prendre ?"
→ 5 t = 5 000 kg → 5 000 ÷ 50 = 100 sacs

PROBLÈME 3 : "Une recette de taro pour 6 personnes : 900 g de taro,
200 g de viande, 150 g de tomates. Pour 4 personnes ?"
→ Tout ÷ 6 × 4 : taro=600g, viande≈133g, tomates=100g`,
        exemples:[
          {question:"750 g de viande de bœuf à 4 000 FCFA/kg. Quel est le prix ?", reponse:"750 g = 0,75 kg. Prix = 0,75 × 4 000 = 3 000 FCFA"},
          {question:"Un sac de 50 kg de riz est réparti en petits sachets de 500 g. Combien de sachets ?", reponse:"50 kg = 50 000 g. Sachets = 50 000 ÷ 500 = 100 sachets"},
          {question:"Une recette pour 8 personnes utilise 1,2 kg de farine. Quelle quantité pour 5 personnes ?", reponse:"1 200 g ÷ 8 × 5 = 150 × 5 = 750 g"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Convertir 6,4 kg en g.", solution:"6,4 × 1 000 = 6 400 g"},
      {id:2,  niveau:"Facile",    enonce:"Convertir 850 g en kg.", solution:"850 ÷ 1 000 = 0,85 kg"},
      {id:3,  niveau:"Facile",    enonce:"Convertir 3,2 t en kg.", solution:"3,2 × 1 000 = 3 200 kg"},
      {id:4,  niveau:"Facile",    enonce:"Ranger du plus léger au plus lourd : 2 kg ; 1 800 g ; 0,003 t ; 2 500 000 mg", solution:"Convertir en g : 2 000 ; 1 800 ; 3 000 ; 2 500. Ordre : 1 800 g < 2 000 g < 2 500 g < 3 000 g → 1 800 g < 2 kg < 2 500 000 mg < 0,003 t"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 3 kg + 500 g (réponse en g).", solution:"3 000 + 500 = 3 500 g"},
      {id:6,  niveau:"Moyen",     enonce:"Au marché, le poisson coûte 3 000 FCFA/kg. Aminata achète 600 g. Combien paie-t-elle ?", solution:"600 g = 0,6 kg. Prix = 0,6 × 3 000 = 1 800 FCFA"},
      {id:7,  niveau:"Moyen",     enonce:"Un sac de 25 kg de riz est réparti en sachets de 500 g. Combien de sachets obtient-on ?", solution:"25 kg = 25 000 g. Sachets = 25 000 ÷ 500 = 50 sachets"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer la masse totale : 3 sacs de 50 kg + 12 caisses de 15 kg + 5 cartons de 8 500 g.", solution:"3×50=150 kg + 12×15=180 kg + 5×8,5=42,5 kg = 150+180+42,5 = 372,5 kg"},
      {id:9,  niveau:"Moyen",     enonce:"Un camion peut transporter au maximum 3,5 t. Il charge 45 sacs de 70 kg. La charge est-elle autorisée ?", solution:"45 × 70 = 3 150 kg = 3,15 t < 3,5 t ✓ → Oui, la charge est autorisée."},
      {id:10, niveau:"Moyen",     enonce:"Une recette de ndolé pour 6 personnes : 800 g de feuilles, 400 g de viande, 300 g d'arachides. Calculer les quantités pour 9 personnes.", solution:"Pour 9 personnes (×9÷6=×1,5) : feuilles=800×1,5=1 200 g, viande=400×1,5=600 g, arachides=300×1,5=450 g."},
      {id:11, niveau:"Difficile", enonce:"Un éléphant pèse 4,8 t et un hippopotame pèse 1 650 kg. Quelle est la différence de masse en kg et en t ?", solution:"4 800 − 1 650 = 3 150 kg = 3,15 t. L'éléphant est plus lourd de 3 150 kg."},
      {id:12, niveau:"Difficile", enonce:"Un commerçant achète 200 kg de mangues à 150 FCFA/kg. Il les revend 250 FCFA/kg. Mais 15 kg sont abîmés et invendables. Calculer son bénéfice.", solution:"Coût : 200 × 150 = 30 000 FCFA. Quantité vendue = 200 − 15 = 185 kg. Recette : 185 × 250 = 46 250 FCFA. Bénéfice = 46 250 − 30 000 = 16 250 FCFA."},
      {id:13, niveau:"Difficile", enonce:"Un camion-citerne contient 8 000 litres d'eau. La masse volumique de l'eau est 1 kg/L. Calculer la masse de l'eau en kg et en t. Si la citerne vide pèse 4,5 t, quelle est la masse totale du camion chargé ?", solution:"Masse eau = 8 000 × 1 = 8 000 kg = 8 t. Masse totale = 8 + 4,5 = 12,5 t."},
      {id:14, niveau:"Difficile", enonce:"Une plantation produit 2,4 t de cacao par hectare. La plantation fait 15 hectares. Le cacao se vend 1 800 FCFA/kg. Calculer la recette totale.", solution:"Production totale = 2,4 × 15 = 36 t = 36 000 kg. Recette = 36 000 × 1 800 = 64 800 000 FCFA."},
      {id:15, niveau:"Difficile", enonce:"Un bébé pèse 3,2 kg à la naissance. Il prend 25 g par jour pendant les 3 premiers mois (90 jours). Quelle sera sa masse au bout de 3 mois ? Convertir en kg.", solution:"Prise de masse = 25 × 90 = 2 250 g = 2,25 kg. Masse finale = 3,2 + 2,25 = 5,45 kg."},
    ],
  },

  17: {
    id:17, title:"Durées", duration:"3 semaines",
    objectives:[
      "Connaître les unités de durée et leurs relations",
      "Convertir des durées d'une unité à une autre",
      "Lire l'heure sur une montre analogique et numérique",
      "Calculer des durées (addition, soustraction)",
      "Résoudre des problèmes faisant intervenir des durées",
      "Utiliser les notations 24h et am/pm",
    ],
    cours:[
      { id:"17-1", titre:"Unités de durée et relations",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTICULARITÉ DES DURÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ ATTENTION : Les durées NE SUIVENT PAS le système décimal !
On n'utilise PAS le même tableau que pour les longueurs ou les masses.
Les conversions sont basées sur 60, 24, 7, 30/31, 12, 365...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU DES UNITÉS DE DURÉE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRÈS PETITES DURÉES (sciences) :
• ms  = milliseconde = 0,001 s
• μs  = microseconde = 0,000001 s
• ns  = nanoseconde  = 0,000000001 s

UNITÉS COURANTES :
• s   = seconde       = unité de base du SI
• min = minute        = 60 secondes
• h   = heure         = 60 minutes = 3 600 secondes
• j   = jour          = 24 heures = 86 400 secondes

UNITÉS CALENDAIRES :
• semaine = 7 jours
• mois    = 28, 29, 30 ou 31 jours (selon le mois)
• année   = 365 jours (ou 366 pour les années bissextiles)
• décennie = 10 ans
• siècle   = 100 ans
• millénaire = 1 000 ans

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSIONS FONDAMENTALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1 min = 60 s          → s en min : ÷ 60
1 h   = 60 min        → min en h : ÷ 60
1 h   = 3 600 s       → s en h : ÷ 3 600
1 j   = 24 h          → h en j : ÷ 24
1 j   = 1 440 min     → min en j : ÷ 1 440
1 j   = 86 400 s      → s en j : ÷ 86 400
1 sem = 7 j
1 an  = 365 j (366 si bissextile)
1 an  = 52 semaines + 1 jour
1 an  = 12 mois

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LES MOIS ET LEURS DURÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
31 jours : Janvier, Mars, Mai, Juillet, Août, Octobre, Décembre
30 jours : Avril, Juin, Septembre, Novembre
28 ou 29 : Février (29 si année bissextile)

MOYEN MNÉMOTECHNIQUE (les jointures des doigts) :
→ Fermer le poing. Les bosses = 31 jours ; les creux = 30 jours ou moins.
→ Pouce = Janvier (31), creux = Février (28/29), 2e bosse = Mars (31)...

ANNÉES BISSEXTILES :
Une année est bissextile si elle est divisible par 4,
SAUF si elle est divisible par 100, SAUF si elle est divisible par 400.
Ex : 2024 ✓ (÷4) ; 1900 ✗ (÷100 mais pas ÷400) ; 2000 ✓ (÷400)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLES DE CONVERSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 3h 45min = (3 × 60) + 45 = 180 + 45 = 225 min
• 3h 45min = (3 × 3 600) + (45 × 60) = 10 800 + 2 700 = 13 500 s
• 195 min = 195 ÷ 60 = 3h + reste 15 min = 3h15
• 7 530 s = 7 530 ÷ 60 = 125 min + reste 30 s = 125 min 30 s
           = 2h + reste 5 min 30 s = 2h05min30s
• 2,5 h = 2h + 0,5 × 60 min = 2h30min

⚠️ ERREUR FRÉQUENTE :
2,5 h ≠ 2h50min (FAUX !)
2,5 h = 2h + 0,5 × 60 = 2h30min (CORRECT !)

🌍 EXEMPLES AFRICAINS :
• Un match de football dure 90 min = 1h30min = 5 400 s
• La nuit à Libreville dure environ 12 h = 720 min = 43 200 s
• Un voyage Libreville–Franceville dure environ 8h
  = 8 × 60 = 480 min = 28 800 s
• Un siècle = 100 ans. L'Afrique a connu la colonisation pendant environ 1 siècle.`,
        exemples:[
          {question:"Convertir 3h45min en minutes.", reponse:"3×60 + 45 = 180 + 45 = 225 min"},
          {question:"Convertir 195 min en heures et minutes.", reponse:"195 ÷ 60 = 3 (quotient) reste 15 → 3h15min"},
          {question:"Convertir 2,5 h en heures et minutes.", reponse:"2,5 h = 2h + 0,5×60min = 2h30min (PAS 2h50 !)"},
          {question:"Combien de secondes y a-t-il dans 1 heure ?", reponse:"1h = 60 min = 60×60 s = 3 600 s"},
        ]
      },
      { id:"17-2", titre:"Lire l'heure et les notations",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LECTURE DE L'HEURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MONTRE ANALOGIQUE (aiguilles) :
• Petite aiguille → heures
• Grande aiguille → minutes
• Très fine aiguille → secondes (si présente)

La grande aiguille fait 1 tour en 60 min.
Chaque graduation = 1 minute.
Chaque chiffre = 5 minutes (5, 10, 15... 55, 60).

LECTURE :
→ On lit d'abord les HEURES (petite aiguille)
→ Puis les MINUTES (grande aiguille × 5)

HEURES PARTICULIÈRES :
• Aiguilles à 12 et 12 → midi (12h00) ou minuit (0h00)
• Aiguilles à 12 et 3  → 3h00 ou 15h00
• Aiguilles à 3 et 6   → 3h30 (mi-chemin)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTATION 12H vs 24H
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTATION 12H (avec am/pm) :
• am = avant midi (0h01 à 11h59)
• pm = après midi (12h01 à 23h59)
• 12h00 am = minuit ; 12h00 pm = midi

NOTATION 24H (officielle en Europe et Afrique) :
• 0h00 = minuit
• 12h00 = midi
• 23h59 = une minute avant minuit

TABLEAU DE CORRESPONDANCE :
  12h  │  24h       12h  │  24h
───────┼────────  ───────┼────────
minuit │  0h00    midi   │ 12h00
1h am  │  1h00    1h pm  │ 13h00
6h am  │  6h00    6h pm  │ 18h00
11h am │ 11h00    11h pm │ 23h00

CONVERSIONS 12H → 24H :
• am : garder le même nombre (sauf minuit = 0h00)
• pm : ajouter 12 (sauf midi = 12h00)
Ex : 3h pm = 3 + 12 = 15h00

CONVERSIONS 24H → 12H :
• 0h à 11h → am (0h = minuit)
• 12h à 23h → soustraire 12 → pm (12h = midi)
Ex : 19h00 = 19 − 12 = 7h pm = 7h du soir

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÉCRITURE DES DURÉES ET DES HEURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEURE D'UN MOMENT :
• 14h30 = quatorze heures trente = 2h30 pm
• 8h05  = huit heures cinq
• 0h00  = minuit
• 12h00 = midi

DURÉE :
• 2h30min = deux heures trente minutes
• 1h05min30s = une heure cinq minutes trente secondes

NOTATION DÉCIMALE DES DURÉES (à éviter mais parfois utilisée) :
• 1,5 h = 1h30min (PAS 1h50min !)
• 2,25 h = 2h15min (0,25 × 60 = 15 min)
• 0,75 h = 45 min (0,75 × 60 = 45 min)

🌍 EXEMPLES AFRICAINS :
• Les cours au lycée gabonais : 8h00 → 16h00 (horaire 24h)
• RFI Afrique diffuse les informations à 7h am = 7h00
• Le journal télévisé de Gabon1ère à 20h00 = 8h pm
• La prière de l'aube (fajr) vers 5h30 am = 5h30`,
        exemples:[
          {question:"Écrire 15h30 en notation 12h.", reponse:"15h − 12 = 3h pm = 3h30 de l'après-midi"},
          {question:"Écrire 9h45 am en notation 24h.", reponse:"9h45 am = 9h45 (on garde, c'est am)"},
          {question:"Écrire 2,75 h en heures et minutes.", reponse:"2h + 0,75×60 = 2h + 45min = 2h45min"},
          {question:"Quelle heure est-il si la grande aiguille est sur le 9 et la petite entre le 3 et le 4 ?", reponse:"Grandes aiguille sur 9 → 45 min. Petite entre 3 et 4 → 3h. Il est 3h45 (ou 15h45 en 24h)."},
        ]
      },
      { id:"17-3", titre:"Calculs sur les durées",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADDITION DE DURÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : Additionner heures avec heures, minutes avec minutes, secondes avec secondes.
Si les secondes dépassent 60 → retenir 1 minute.
Si les minutes dépassent 60 → retenir 1 heure.

EXEMPLE 1 : 2h35min + 1h50min
  heures : 2 + 1 = 3h
  minutes : 35 + 50 = 85 min
  85 min = 60 min + 25 min = 1h25min
  Total = 3h + 1h25min = 4h25min ✓

EXEMPLE 2 : 3h45min30s + 1h25min45s
  secondes : 30 + 45 = 75 s = 1min15s
  minutes : 45 + 25 + 1 (retenue) = 71 min = 1h11min
  heures : 3 + 1 + 1 (retenue) = 5h
  Total = 5h11min15s ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOUSTRACTION DE DURÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : Soustraire heures avec heures, minutes avec minutes.
Si les minutes du bas > minutes du haut → emprunter 1h = 60 min.

EXEMPLE 1 : 5h20min − 2h45min
  minutes : 20 < 45 → on emprunte 1h : 80 − 45 = 35 min
  heures : 5 − 1 (emprunté) − 2 = 2h
  Résultat = 2h35min ✓
  VÉRIF : 2h35 + 2h45 = 4h80min = 5h20min ✓

EXEMPLE 2 : 4h − 1h35min
  4h = 3h60min
  minutes : 60 − 35 = 25 min
  heures : 3 − 1 = 2h
  Résultat = 2h25min ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALCUL D'UNE HEURE D'ARRIVÉE OU DE DÉPART
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE 1 — HEURE D'ARRIVÉE :
Heure d'arrivée = Heure de départ + Durée du trajet

EXEMPLE : Un bus part à 7h35 et met 2h50min pour arriver.
7h35 + 2h50 :
  minutes : 35 + 50 = 85 min = 1h25min
  heures : 7 + 2 + 1 = 10h
  Arrivée : 10h25min ✓

TYPE 2 — DURÉE :
Durée = Heure d'arrivée − Heure de départ

EXEMPLE : Un avion décolle à 9h40 et atterrit à 14h15.
14h15 − 9h40 :
  minutes : 15 < 40 → emprunt : 75 − 40 = 35 min
  heures : 14 − 1 − 9 = 4h
  Durée = 4h35min ✓

TYPE 3 — HEURE DE DÉPART :
Heure de départ = Heure d'arrivée − Durée

EXEMPLE : On veut arriver à 8h00. Le trajet dure 1h35.
8h00 − 1h35 :
  minutes : 0 < 35 → emprunt : 60 − 35 = 25 min
  heures : 8 − 1 − 1 = 6h
  Départ : 6h25min ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DURÉE ENTRE DEUX DATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE : Compter les jours, semaines, mois.

EXEMPLE : Du 15 mars au 8 juin, combien de jours ?
• Du 15 mars au 31 mars : 31 − 15 = 16 jours
• Avril : 30 jours
• Mai : 31 jours
• Du 1er juin au 8 juin : 8 jours
• Total : 16 + 30 + 31 + 8 = 85 jours

🌍 EXEMPLES AFRICAINS :
• Bus Libreville–Oyem : départ 6h00, arrivée 14h30.
  Durée = 14h30 − 6h00 = 8h30min

• Cours du matin : 8h00→12h00. Cours de l'après-midi : 14h30→17h30.
  Matin : 12h00−8h00 = 4h00
  Après-midi : 17h30−14h30 = 3h00
  Total école : 4h + 3h = 7h par jour

• Ramadan 2024 : du 11 mars au 9 avril.
  Du 11 mars au 31 mars : 20 jours
  Du 1er au 9 avril : 9 jours
  Total = 29 jours`,
        exemples:[
          {question:"Calculer : 3h45min + 2h30min", reponse:"min : 45+30=75=60+15 → 1h15. h : 3+2+1=6. Résultat : 6h15min"},
          {question:"Calculer : 7h20min − 3h50min", reponse:"min : 20<50 → emprunt : 80−50=30. h : 7−1−3=3. Résultat : 3h30min"},
          {question:"Un film commence à 20h45 et dure 2h15min. À quelle heure se termine-t-il ?", reponse:"20h45 + 2h15 : min=45+15=60=1h00 ; h=20+2+1=23. Le film se termine à 23h00."},
          {question:"Un élève arrive à l'école à 7h50 et en repart à 17h15. Combien de temps a-t-il passé à l'école ?", reponse:"17h15 − 7h50 : min=15<50→emprunt : 75−50=25 ; h=17−1−7=9. Durée = 9h25min."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Convertir 3h20min en minutes.", solution:"3×60 + 20 = 180 + 20 = 200 min"},
      {id:2,  niveau:"Facile",    enonce:"Convertir 150 min en heures et minutes.", solution:"150 ÷ 60 = 2 reste 30 → 2h30min"},
      {id:3,  niveau:"Facile",    enonce:"Convertir 18h00 en notation 12h.", solution:"18 − 12 = 6h pm = 6h du soir"},
      {id:4,  niveau:"Facile",    enonce:"Convertir 9h30 am en notation 24h.", solution:"9h30 am = 9h30 (am, on garde)"},
      {id:5,  niveau:"Facile",    enonce:"Calculer : 2h40min + 1h35min", solution:"min : 40+35=75=1h15. h : 2+1+1=4. Résultat : 4h15min"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer : 5h10min − 2h45min", solution:"min : 10<45 → emprunt : 70−45=25. h : 5−1−2=2. Résultat : 2h25min. Vérif : 2h25+2h45=4h70=5h10 ✓"},
      {id:7,  niveau:"Moyen",     enonce:"Un bus part à 6h45 et arrive à 11h20. Calculer la durée du trajet.", solution:"11h20 − 6h45 : min=20<45→emprunt : 80−45=35 ; h=11−1−6=4. Durée = 4h35min."},
      {id:8,  niveau:"Moyen",     enonce:"Un film commence à 20h15 et dure 1h50min. À quelle heure se termine-t-il ?", solution:"20h15 + 1h50 : min=15+50=65=1h05 ; h=20+1+1=22. Fin à 22h05."},
      {id:9,  niveau:"Moyen",     enonce:"Aminata travaille 7h30min par jour, 5 jours par semaine. Combien d'heures travaille-t-elle par semaine ? Par mois (4 semaines) ?", solution:"Par semaine : 7h30 × 5 = 35h150min = 35h + 2h30 = 37h30min. Par mois : 37h30 × 4 = 148h120min = 148h + 2h = 150h."},
      {id:10, niveau:"Moyen",     enonce:"Du 20 avril au 15 juin, combien y a-t-il de jours ?", solution:"Du 20 au 30 avril : 30−20=10j. Mai : 31j. Du 1er au 15 juin : 15j. Total = 10+31+15 = 56 jours."},
      {id:11, niveau:"Difficile", enonce:"Un avion décolle de Libreville (Gabon, UTC+1) à 10h00 heure locale et atterrit à Paris (France, UTC+1 en hiver) après 7h30min de vol. À quelle heure atterrit-il à Paris (heure locale) ?", solution:"Même fuseau horaire (UTC+1). Arrivée = 10h00 + 7h30 = 17h30 heure locale. L'avion atterrit à 17h30."},
      {id:12, niveau:"Difficile", enonce:"Kofi naît le 15 juillet 2010. Quelle est son âge exact le 1er janvier 2025 ? (en années, mois et jours)", solution:"De juillet 2010 à juillet 2024 : 14 ans. De juillet 2024 au 1er janvier 2025 : 5 mois + 17 jours (du 15 juil au 31 juil = 16j ; août=31j ; sept=30j ; oct=31j ; nov=30j ; déc=31j ; 1er jan=1j → 16+31+30+31+30+31+1=170j = 5 mois 17 jours). Âge : 14 ans, 5 mois, 17 jours."},
      {id:13, niveau:"Difficile", enonce:"Un train part à 22h45 et arrive le lendemain à 6h20. Quelle est la durée du trajet ?", solution:"De 22h45 à minuit (0h00) = 1h15min. De minuit à 6h20 = 6h20min. Durée totale = 1h15 + 6h20 = 7h35min."},
      {id:14, niveau:"Difficile", enonce:"Un bébé dort 16h par jour. Quelle fraction du temps dort-il ? Combien de temps est-il éveillé par semaine ?", solution:"Fraction = 16/24 = 2/3. Éveillé par jour = 24−16 = 8h. Par semaine = 8×7 = 56h éveillé."},
      {id:15, niveau:"Difficile", enonce:"Le soleil se lève à Libreville à 6h12 et se couche à 18h24. Calculer la durée du jour, de la nuit, et exprimer chacune en fraction de 24h.", solution:"Durée du jour = 18h24 − 6h12 = 12h12min. Durée de la nuit = 24h − 12h12min = 11h48min. Fraction jour = 12h12min ÷ 24h = 732min ÷ 1440min = 732/1440 = 61/120. Fraction nuit = 708/1440 = 59/120."},
    ],
  },

  18: {
    id:18, title:"Aires", duration:"3 semaines",
    objectives:[
      "Maîtriser le tableau de conversion des unités d'aire",
      "Convertir des aires entre mm², cm², dm², m², dam², hm², km²",
      "Utiliser les unités agraires (are, hectare)",
      "Calculer et comparer des aires en changeant d'unité",
      "Résoudre des problèmes complexes faisant intervenir des aires",
    ],
    cours:[
      { id:"18-1", titre:"Unités d'aire et tableau de conversion",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAPPEL : QU'EST-CE QUE L'AIRE ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'AIRE mesure la surface occupée par une figure plane.
Elle s'exprime en UNITÉS CARRÉES.

UNITÉ DE BASE : le mètre carré (m²)
1 m² = la surface d'un carré dont le côté mesure 1 m.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POURQUOI ×100 ET PAS ×10 ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C'est LA question essentielle de ce chapitre !

Rappel : 1 m = 10 dm (en longueur, ×10)
Mais : 1 m² = 100 dm² (en aire, ×100)

POURQUOI ? Parce qu'une aire est un carré de longueurs !
1 m² = 1 m × 1 m = 10 dm × 10 dm = 100 dm²

Schéma :
  1 m = 10 dm
  ┌────────────────────────┐
  │ 1dm²│ 1dm²│...         │ 1 m
  │     │     │            │
  │─────┼─────┼────────────│ = 10 dm
  │     │     │            │
  │─────┼─────┼────────────│
  └────────────────────────┘
  → 10 rangées de 10 dm² = 100 dm²

DONC : à chaque fois qu'on change d'unité de longueur (×10 ou ÷10),
les unités d'AIRE changent de ×100 ou ÷100.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU DES UNITÉS D'AIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mm²   cm²   dm²    m²    dam²   hm²    km²
  ×100  ×100  ×100  ×100   ×100   ×100
  ÷100  ÷100  ÷100  ÷100   ÷100   ÷100

CHAQUE CASE DU TABLEAU CONTIENT 2 CHIFFRES :
(car on divise/multiplie par 100 = 10² à chaque pas)

EXEMPLE : convertir 3,75 m² en cm²
m² → dm² → cm² = 2 pas → ×100² = ×10 000
3,75 × 10 000 = 37 500 cm²

OU avec le tableau (2 chiffres par case) :
  km² │ hm² │ dam² │  m²  │ dm²  │  cm² │ mm²
      │     │      │  3,  │  75  │  00  │
→ 37 500 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSIONS DIRECTES UTILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 1 cm²  = 100 mm²
• 1 dm²  = 100 cm²        = 10 000 mm²
• 1 m²   = 100 dm²        = 10 000 cm²      = 1 000 000 mm²
• 1 dam² = 100 m²
• 1 hm²  = 100 dam²       = 10 000 m²
• 1 km²  = 100 hm²        = 10 000 dam²     = 1 000 000 m²

EXEMPLES DÉTAILLÉS :
• 4,5 m²  = 4,5 × 10 000 = 45 000 cm²    (2 pas, ×100² = ×10 000)
• 250 cm² = 250 ÷ 10 000 = 0,025 m²      (2 pas, ÷10 000)
• 3 km²   = 3 × 1 000 000 = 3 000 000 m² (3 pas, ×100³)
• 75 000 m² = 75 000 ÷ 1 000 000 = 0,075 km²

📌 ASTUCE PRATIQUE : Doubler le nombre de zéros par rapport aux longueurs.
Pour les longueurs : 1 m = 100 cm (2 zéros)
Pour les aires : 1 m² = 10 000 cm² (4 zéros = 2 × 2)`,
        exemples:[
          {question:"Convertir 2,8 m² en cm².", reponse:"2 pas → ×10 000 : 2,8 × 10 000 = 28 000 cm²"},
          {question:"Convertir 45 000 mm² en cm².", reponse:"1 pas → ÷100 : 45 000 ÷ 100 = 450 cm²"},
          {question:"Convertir 0,35 km² en m².", reponse:"3 pas → ×100³ = ×1 000 000 : 0,35 × 1 000 000 = 350 000 m²"},
          {question:"Pourquoi 1 m² = 10 000 cm² et non 100 cm² ?", reponse:"Car 1 m = 100 cm, donc 1 m² = (100 cm)² = 100×100 = 10 000 cm². L'aire est le carré d'une longueur, donc on élève aussi le facteur de conversion au carré."},
        ]
      },
      { id:"18-2", titre:"Unités agraires et applications",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UNITÉS AGRAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les unités agraires sont utilisées pour mesurer les SURFACES DE TERRAIN.

ARE (a) :
• 1 are = 1 dam² = 100 m²
• C'est la surface d'un carré de 10 m de côté
• Utilisé pour les petits terrains, jardins, parcelles

HECTARE (ha) :
• 1 hectare = 100 ares = 10 000 m²
• C'est la surface d'un carré de 100 m de côté
• C'est l'unité la plus utilisée pour les grandes surfaces agricoles

RELATIONS :
• 1 ha = 100 a = 10 000 m² = 1 hm²
• 1 km² = 100 ha = 10 000 a = 1 000 000 m²

EXEMPLES DE SURFACES :
• Terrain résidentiel à Libreville : ≈ 400 à 800 m² = 4 à 8 ares
• Champ de manioc : ≈ 2 ha = 20 000 m²
• Parc National de la Lopé (Gabon) : 491 000 ha ≈ 4 910 km²
• Superficie du Gabon : 26,8 millions d'ha = 268 000 km²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSIONS AVEC LES UNITÉS AGRAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLES :
• 3,5 ha  = 3,5 × 10 000 = 35 000 m²
• 2,5 ha  = 2,5 × 100 = 250 ares
• 12 500 m² = 12 500 ÷ 10 000 = 1,25 ha
• 350 a   = 350 ÷ 100 = 3,5 ha
• 0,25 km² = 0,25 × 100 = 25 ha

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF COMPLET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
km²    hm²     dam²     m²
        (ha)    (a)
 │       │       │       │
×100   ×100    ×100
÷100   ÷100    ÷100

1 km² = 100 hm² = 10 000 dam² = 1 000 000 m²
        100 ha     10 000 a

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIX AU M² ET À L'HECTARE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLÈME TYPE :
"Un terrain de 3 500 m² coûte 52 500 000 FCFA. Quel est le prix au m² ? Au are ? À l'hectare ?"

→ Prix au m²  : 52 500 000 ÷ 3 500 = 15 000 FCFA/m²
→ Prix au are : 15 000 × 100 = 1 500 000 FCFA/are
→ Prix à l'ha : 15 000 × 10 000 = 150 000 000 FCFA/ha

🌍 EXEMPLES AFRICAINS :
• Une parcelle à Libreville de 500 m² = 5 ares = 0,05 ha
• Une plantation de palmiers à huile : 120 ha = 1 200 000 m²
• Un terrain de foot (standard) : 68 m × 105 m = 7 140 m² ≈ 71,4 ares
• La forêt équatoriale du Gabon couvre 22 000 000 ha = 220 000 km²`,
        exemples:[
          {question:"Convertir 4,2 ha en m².", reponse:"4,2 × 10 000 = 42 000 m²"},
          {question:"Convertir 75 000 m² en ha.", reponse:"75 000 ÷ 10 000 = 7,5 ha"},
          {question:"Un terrain de 2 500 m². Combien d'ares ? Combien d'hectares ?", reponse:"2 500 ÷ 100 = 25 ares. 2 500 ÷ 10 000 = 0,25 ha."},
        ]
      },
      { id:"18-3", titre:"Calculs d'aires et problèmes complexes",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RAPPEL DES FORMULES D'AIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Carré (c)          : A = c²
• Rectangle (L, ℓ)   : A = L × ℓ
• Parallélogramme    : A = base × hauteur
• Triangle           : A = (base × hauteur) ÷ 2
• Trapèze (B, b, h)  : A = (B + b) × h ÷ 2
• Disque (r)         : A = π × r²

⚠️ LES FORMULES DONNENT L'AIRE DANS L'UNITÉ DES MESURES UTILISÉES.
Si les mesures sont en cm → l'aire est en cm²
Si les mesures sont en m → l'aire est en m²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIGURES COMPOSÉES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour calculer l'aire d'une figure composée :
MÉTHODE 1 — ADDITION : décomposer en figures simples et additionner.
MÉTHODE 2 — SOUSTRACTION : partir d'une grande figure et soustraire.

EXEMPLE — MÉTHODE ADDITION :
Un L majuscule = rectangle 1 + rectangle 2
A = A₁ + A₂

EXEMPLE — MÉTHODE SOUSTRACTION :
Un cadre = grand rectangle − petit rectangle (le trou)
A cadre = A grand − A petit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGER D'UNITÉ DANS UN CALCUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BONNE PRATIQUE : Convertir TOUTES les mesures dans la MÊME UNITÉ
AVANT de calculer l'aire.

EXEMPLE : Rectangle de 1,2 m × 85 cm. Calculer l'aire en cm².
→ Convertir 1,2 m en cm : 1,2 × 100 = 120 cm
→ A = 120 × 85 = 10 200 cm²
→ En m² : 10 200 ÷ 10 000 = 1,02 m²

ERREUR FRÉQUENTE :
A = 1,2 × 85 = 102 (SANS convertir) → résultat sans unité cohérente !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLÈMES PRATIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPE 1 — CARRELAGE, PEINTURE, GAZON :
"Combien de carreaux de 30 cm × 30 cm pour une pièce de 4 m × 3,5 m ?"
→ Aire pièce = 4 × 3,5 = 14 m² = 140 000 cm²
→ Aire carreau = 30 × 30 = 900 cm²
→ Nombre = 140 000 ÷ 900 ≈ 155,6 → 156 carreaux (arrondir au supérieur !)
→ En pratique, ajouter 10% pour les découpes → 156 × 1,1 ≈ 172 carreaux

TYPE 2 — RENDEMENT AGRICOLE :
"Un champ de 2 ha produit 4,8 t de manioc. Quel est le rendement en t/ha ?"
→ Rendement = 4,8 ÷ 2 = 2,4 t/ha

TYPE 3 — COÛT AU M² :
Voir leçon 2.

🌍 EXEMPLES AFRICAINS :
• Peindre une façade rectangulaire 8 m × 3,5 m.
  Un pot de peinture couvre 12 m².
  Aire = 8 × 3,5 = 28 m². Pots nécessaires = 28 ÷ 12 ≈ 2,33 → 3 pots.

• Un champ de 3 ha de cacao produit 7,2 t par an.
  Rendement = 7,2 ÷ 3 = 2,4 t/ha/an.
  Prix du cacao = 1 800 FCFA/kg → Recette = 7 200 × 1 800 = 12 960 000 FCFA.`,
        exemples:[
          {question:"Un rectangle a des dimensions 2,5 m × 80 cm. Calculer son aire en m² et en cm².", reponse:"80 cm = 0,8 m. A = 2,5 × 0,8 = 2 m². En cm² : 2 × 10 000 = 20 000 cm² (ou 250cm × 80cm = 20 000 cm²)."},
          {question:"Combien de carreaux de 20 cm × 20 cm faut-il pour couvrir 15 m² ?", reponse:"15 m² = 150 000 cm². Carreau = 20×20 = 400 cm². Nombre = 150 000 ÷ 400 = 375 carreaux."},
          {question:"Une plantation de 4,5 ha produit 13,5 t de café. Quel est le rendement en kg/are ?", reponse:"4,5 ha = 450 ares. Rendement = 13 500 kg ÷ 450 = 30 kg/are."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Convertir 5 m² en cm².", solution:"5 × 10 000 = 50 000 cm²"},
      {id:2,  niveau:"Facile",    enonce:"Convertir 35 000 cm² en m².", solution:"35 000 ÷ 10 000 = 3,5 m²"},
      {id:3,  niveau:"Facile",    enonce:"Convertir 2,5 ha en m².", solution:"2,5 × 10 000 = 25 000 m²"},
      {id:4,  niveau:"Facile",    enonce:"Convertir 45 000 m² en ha.", solution:"45 000 ÷ 10 000 = 4,5 ha"},
      {id:5,  niveau:"Facile",    enonce:"Ranger du plus petit au plus grand : 50 000 cm² ; 4 m² ; 0,0005 km² ; 60 dm²", solution:"Convertir en m² : 5 ; 4 ; 500 ; 0,6. Ordre : 4 m² < 50 000 cm² < 60 dm² ... Attends : 50 000cm²=5m², 60dm²=0,6m². Ordre : 60dm²(0,6) < 4m²(4) < 50 000cm²(5) < 0,0005km²(500). Soit : 60 dm² < 4 m² < 50 000 cm² < 0,0005 km²"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer l'aire d'un rectangle de 3,5 m × 120 cm en m², puis en cm².", solution:"120 cm = 1,2 m. A = 3,5 × 1,2 = 4,2 m² = 4,2 × 10 000 = 42 000 cm²."},
      {id:7,  niveau:"Moyen",     enonce:"Un terrain triangulaire a une base de 60 m et une hauteur de 45 m. Calculer son aire en m² et en ares.", solution:"A = (60×45)÷2 = 1 350 m² = 1 350÷100 = 13,5 ares."},
      {id:8,  niveau:"Moyen",     enonce:"Combien de carreaux de 25 cm × 25 cm faut-il pour carreler une pièce de 4 m × 3 m ?", solution:"Pièce = 400×300 = 120 000 cm². Carreau = 25×25 = 625 cm². Nombre = 120 000÷625 = 192 carreaux."},
      {id:9,  niveau:"Moyen",     enonce:"Un champ rectangulaire de 120 m × 80 m. Calculer son aire en ha.", solution:"A = 120×80 = 9 600 m² = 9 600÷10 000 = 0,96 ha."},
      {id:10, niveau:"Moyen",     enonce:"Le terrain d'un stade de foot mesure 68 m × 105 m. Exprimer son aire en ares et en hectares.", solution:"A = 68×105 = 7 140 m² = 71,4 ares = 0,714 ha."},
      {id:11, niveau:"Difficile", enonce:"Une maison a un plan rectangulaire de 12 m × 9 m. Les murs (4 côtés) ont une hauteur de 3 m. On veut peindre les murs intérieurs. Il y a 3 fenêtres de 1,2 m × 1 m et 2 portes de 2 m × 0,9 m. Un pot de peinture couvre 8 m². Combien de pots faut-il ?", solution:"Surface totale murs : 2×(12×3) + 2×(9×3) = 72+54 = 126 m². Fenêtres : 3×(1,2×1) = 3,6 m². Portes : 2×(2×0,9) = 3,6 m². Surface à peindre = 126−3,6−3,6 = 118,8 m². Pots = 118,8÷8 = 14,85 → 15 pots."},
      {id:12, niveau:"Difficile", enonce:"Un agriculteur possède une plantation de forme trapézoïdale : grandes bases 250 m, petite base 180 m, hauteur 120 m. Calculer l'aire en ha. Sachant qu'il produit 1,8 t/ha de cacao, calculer la production totale.", solution:"A = (250+180)×120÷2 = 430×60 = 25 800 m² = 2,58 ha. Production = 2,58 × 1,8 = 4,644 t ≈ 4,6 t."},
      {id:13, niveau:"Difficile", enonce:"Une route fait 15 km de long et 8 m de large. Calculer l'aire de la route en m², en ares et en ha.", solution:"A = 15 000 × 8 = 120 000 m² = 1 200 ares = 12 ha."},
      {id:14, niveau:"Difficile", enonce:"Un disque de rayon 7 m est inscrit dans un carré. Calculer : l'aire du carré, l'aire du disque, et l'aire des 4 coins (en dehors du disque). (π ≈ 22/7)", solution:"Côté du carré = diamètre = 14 m. Aire carré = 14² = 196 m². Aire disque = π×7² = (22/7)×49 = 22×7 = 154 m². Coins = 196−154 = 42 m²."},
      {id:15, niveau:"Difficile", enonce:"La superficie du Gabon est 267 667 km². Exprimer en ha et en m². Le Parc National de l'Ivindo occupe 300 000 ha. Quelle fraction de la superficie totale représente-t-il ?", solution:"267 667 km² = 267 667 × 10 000 = 2 676 670 000 ha... Erreur : 1 km²=100 ha. Donc 267 667 km² = 267 667 × 100 = 26 766 700 ha = 2 676 670 000 000 m². Fraction Ivindo = 300 000 ÷ 26 766 700 ≈ 1/89 ≈ 1,1% du Gabon."},
    ],
  },

  19: {
    id:19, title:"Volumes", duration:"3 semaines",
    objectives:[
      "Comprendre la notion de volume et de capacité",
      "Connaître les unités de volume (mm³, cm³, dm³, m³)",
      "Connaître les unités de capacité (mL, cL, dL, L)",
      "Convertir entre unités de volume et de capacité",
      "Calculer le volume d'un pavé droit et d'un cube",
      "Résoudre des problèmes concrets faisant intervenir des volumes",
    ],
    cours:[
      { id:"19-1", titre:"Volume — définition et unités",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION DU VOLUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le VOLUME d'un solide est la mesure de l'ESPACE qu'il occupe.
Le volume est une grandeur en 3 dimensions (longueur × largeur × hauteur).

ANALOGIE :
• Longueur → 1D (une ligne)
• Aire      → 2D (une surface)
• Volume    → 3D (un espace)

UNITÉ DE BASE : le mètre cube (m³)
1 m³ = l'espace occupé par un cube dont le côté mesure 1 m.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POURQUOI ×1 000 ENTRE LES UNITÉS ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rappel : 1 m = 10 dm (longueur, ×10)
         1 m² = 100 dm² (aire, ×100 = 10²)
         1 m³ = 1 000 dm³ (volume, ×1 000 = 10³)

DÉMONSTRATION :
1 m³ = 1 m × 1 m × 1 m = 10 dm × 10 dm × 10 dm = 1 000 dm³

Schéma :
  1 m = 10 dm
  ┌──────────────┐ ┐
  │   ┌──┐       │ │
  │   │  │       │ │  1 m = 10 dm
  │   └──┘       │ │
  │   1 dm³      │ │
  └──────────────┘ ┘
  10 × 10 × 10 = 1 000 petits cubes dm³ dans 1 m³

DONC : à chaque changement d'unité de longueur (×10),
les unités de VOLUME changent de ×1 000.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU DES UNITÉS DE VOLUME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mm³    cm³    dm³     m³    dam³   hm³    km³
  ×1000  ×1000  ×1000  ×1000  ×1000  ×1000
  ÷1000  ÷1000  ÷1000  ÷1000  ÷1000  ÷1000

CHAQUE CASE DU TABLEAU CONTIENT 3 CHIFFRES
(car on multiplie/divise par 1 000 = 10³)

CONVERSIONS DIRECTES UTILES :
• 1 cm³  = 1 000 mm³
• 1 dm³  = 1 000 cm³      = 1 000 000 mm³
• 1 m³   = 1 000 dm³      = 1 000 000 cm³    = 1 000 000 000 mm³
• 1 km³  = 1 000 000 000 m³

EXEMPLES :
• 2,5 m³  = 2 500 dm³ = 2 500 000 cm³
• 4 500 cm³ = 4,5 dm³ = 0,0045 m³
• 0,35 m³ = 350 dm³ = 350 000 cm³

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE DU TABLEAU (3 CHIFFRES PAR CASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXEMPLE : Convertir 4,25 dm³ en cm³
  m³  │   dm³  │   cm³  │   mm³
      │  4,250 │   000  │
→ 4 250 cm³... NON !

MÉTHODE CORRECTE :
dm³ → cm³ = 1 pas = ×1 000
4,25 × 1 000 = 4 250 cm³ ✓

Avec le tableau (3 chiffres par case) :
  m³  │  dm³  │  cm³  │  mm³
      │  4  , │  2 5 0│
→ On lit : 4 250 cm³ ✓

🌍 EXEMPLES AFRICAINS :
• Un aquarium de 60 cm × 30 cm × 40 cm :
  V = 60 × 30 × 40 = 72 000 cm³ = 72 dm³
• Un container maritime : environ 33 m³
• Capacité d'un puits africain : quelques m³
• Graine de café : ≈ 0,5 cm³`,
        exemples:[
          {question:"Convertir 3,7 m³ en dm³, puis en cm³.", reponse:"3,7 m³ = 3 700 dm³ (×1000). 3 700 dm³ = 3 700 000 cm³ (×1000)."},
          {question:"Convertir 8 500 cm³ en dm³.", reponse:"8 500 ÷ 1 000 = 8,5 dm³"},
          {question:"Pourquoi 1 m³ = 1 000 000 cm³ et non 10 000 cm³ ?", reponse:"1 m = 100 cm, donc 1 m³ = (100 cm)³ = 100 × 100 × 100 = 1 000 000 cm³. Le volume élève le facteur au cube."},
        ]
      },
      { id:"19-2", titre:"Capacité et lien avec le volume",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAPACITÉ — DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La CAPACITÉ est le volume de liquide qu'un récipient peut contenir.
L'unité de capacité est le LITRE (L).

DISTINCTION :
• VOLUME → mesure l'espace occupé par un solide (en m³, cm³...)
• CAPACITÉ → mesure ce que contient un récipient (en L, mL...)
En pratique : même grandeur, unités différentes selon le contexte.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIEN FONDAMENTAL : 1 L = 1 dm³
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C'est le lien le plus important du chapitre !

1 litre = 1 décimètre cube
1 L = 1 dm³

CONSÉQUENCES :
• 1 mL = 1 cm³        (1 millilitre = 1 centimètre cube)
• 1 cL = 10 cm³
• 1 dL = 100 cm³
• 1 L  = 1 000 cm³ = 1 dm³
• 1 kL = 1 000 L = 1 m³

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU DES UNITÉS DE CAPACITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mL    cL    dL     L    daL   hL    kL
│      │      │     │     │     │     │
  ×10   ×10   ×10   ×10   ×10   ×10
  ÷10   ÷10   ÷10   ÷10   ÷10   ÷10

CONVERSIONS :
• 1 L   = 10 dL  = 100 cL = 1 000 mL
• 1 kL  = 1 000 L
• 1 hL  = 100 L

EXEMPLES :
• 2,5 L = 25 dL = 250 cL = 2 500 mL
• 3 500 mL = 3,5 L
• 0,75 L = 750 mL (bouteille classique d'eau ≈ 750 mL)
• 1,5 L = 1 500 mL (grande bouteille d'eau)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSIONS VOLUME ↔ CAPACITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF :
Volume  │  Capacité  │  Valeur
───────────────────────────────
1 mm³   │  0,001 mL  │
1 cm³   │  1 mL      │  = 1/1000 L
1 dm³   │  1 L       │  = 1 000 cm³
1 m³    │  1 000 L   │  = 1 kL

EXEMPLES DE CONVERSIONS :
• 5 dm³ = 5 L
• 2,4 m³ = 2 400 L
• 350 L = 350 dm³ = 0,35 m³
• 75 cL = 75 cm³ = 0,075 dm³ = 0,075 L

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MASSE VOLUMIQUE DE L'EAU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
L'eau a une propriété remarquable :
1 L d'eau = 1 kg = 1 dm³

Cette relation simplifie beaucoup les calculs :
• 1 m³ d'eau = 1 000 L = 1 000 kg = 1 tonne
• 1 cm³ d'eau = 1 mL = 1 g

EXEMPLE :
Un réservoir de 2,5 m³ rempli d'eau contient :
→ 2 500 L d'eau → masse = 2 500 kg = 2,5 t

🌍 EXEMPLES AFRICAINS :
• Bouteille d'eau de 1,5 L = 1 500 mL = 1 500 cm³
• Citerne familiale de 500 L = 0,5 m³
• Bassin d'eau de 2 m × 1,5 m × 0,8 m :
  V = 2 × 1,5 × 0,8 = 2,4 m³ = 2 400 L
  Masse de l'eau = 2 400 kg = 2,4 t`,
        exemples:[
          {question:"Convertir 4,5 L en mL.", reponse:"4,5 × 1 000 = 4 500 mL"},
          {question:"Convertir 350 cL en L.", reponse:"350 ÷ 100 = 3,5 L"},
          {question:"Un récipient contient 2 400 cm³ d'eau. Combien de litres ? Combien de kg ?", reponse:"2 400 cm³ = 2 400 mL = 2,4 L. Masse = 2,4 kg (1 L d'eau = 1 kg)."},
          {question:"Un aquarium de 80 cm × 40 cm × 35 cm. Calculer sa capacité en litres.", reponse:"V = 80×40×35 = 112 000 cm³ = 112 000 mL = 112 L."},
        ]
      },
      { id:"19-3", titre:"Calcul de volumes et problèmes",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOLUME DU CUBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMULE : V = c × c × c = c³   (c = arête)

EXEMPLE : Cube d'arête 5 cm → V = 5³ = 125 cm³

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOLUME DU PAVÉ DROIT (RECTANGULAR BOX)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un PAVÉ DROIT est un solide avec 6 faces rectangulaires.
(Aussi appelé parallélépipède rectangle)

REPRÉSENTATION :
        ┌──────────────┐
       /|              /│
      / |    h        / │
     /  |            /  │
    └──────────────┘    │
    │   └ ─ ─ ─ ─ ─│─ ─┘
    │        ℓ      │   /
    │               │  /
    └───────────────┘ /
           L

FORMULE : V = L × ℓ × h
(Longueur × Largeur × Hauteur)

DÉMONSTRATION :
V = (Aire de la base) × hauteur
  = (L × ℓ) × h

EXEMPLES :
• Pavé 6 cm × 4 cm × 3 cm : V = 6 × 4 × 3 = 72 cm³
• Boîte 20 cm × 15 cm × 10 cm : V = 20 × 15 × 10 = 3 000 cm³ = 3 dm³ = 3 L

⚠️ UNITÉS : Si L, ℓ, h sont en cm → V est en cm³

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TROUVER UNE DIMENSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Si V = L × ℓ × h, alors :
L = V ÷ (ℓ × h)
ℓ = V ÷ (L × h)
h = V ÷ (L × ℓ)

EXEMPLE : Pavé de volume 240 cm³, longueur 10 cm, largeur 6 cm.
h = 240 ÷ (10 × 6) = 240 ÷ 60 = 4 cm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOLUME DU CYLINDRE (INTRODUCTION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un CYLINDRE droit a deux bases circulaires parallèles et égales.

FORMULE : V = π × r² × h
(Aire de la base circulaire × hauteur)

EXEMPLE : Cylindre de rayon 4 cm et hauteur 10 cm.
V = π × 4² × 10 = 160π ≈ 502,4 cm³

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMPLISSAGE ET VIDAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLÈME TYPE :
"Un réservoir de V litres se remplit au débit de d L/min. En combien de temps est-il plein ?"
Temps = V ÷ d

"Un robinet débite d L/min et fuit de f L/h. En combien de temps se vide un réservoir de V L ?"
Débit net = d × 60 − f (en L/h)
Temps = V ÷ débit net

🌍 EXEMPLES AFRICAINS :
• Une citerne rectangulaire 2 m × 1,5 m × 1,2 m :
  V = 2 × 1,5 × 1,2 = 3,6 m³ = 3 600 L
  Masse de l'eau = 3 600 kg = 3,6 t

• Un puits cylindrique de rayon 0,6 m et profondeur 8 m :
  V = π × 0,36 × 8 = 2,88π ≈ 9,05 m³ ≈ 9 050 L

• Remplir une citerne de 500 L avec un robinet débitant 25 L/min :
  Temps = 500 ÷ 25 = 20 minutes

• Une bouteille de gaz cylindrique de rayon 15 cm et hauteur 50 cm :
  V = π × 225 × 50 = 11 250π ≈ 35 325 cm³ ≈ 35,3 L`,
        exemples:[
          {question:"Calculer le volume d'un pavé droit de 12 cm × 8 cm × 5 cm.", reponse:"V = 12 × 8 × 5 = 480 cm³"},
          {question:"Un cube a un volume de 216 cm³. Quelle est la longueur de son arête ?", reponse:"c³ = 216 → c = ∛216 = 6 cm (car 6×6×6=216)"},
          {question:"Calculer le volume d'un cylindre de rayon 3 cm et hauteur 7 cm. (π ≈ 3,14)", reponse:"V = π × 9 × 7 = 63π ≈ 197,82 cm³"},
          {question:"Un aquarium de 60 cm × 25 cm × 30 cm est rempli aux 3/4. Combien de litres contient-il ?", reponse:"V total = 60×25×30 = 45 000 cm³ = 45 L. V aux 3/4 = 45 × 3/4 = 33,75 L."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Convertir 4 dm³ en cm³.", solution:"4 × 1 000 = 4 000 cm³"},
      {id:2,  niveau:"Facile",    enonce:"Convertir 5 000 cm³ en dm³.", solution:"5 000 ÷ 1 000 = 5 dm³ = 5 L"},
      {id:3,  niveau:"Facile",    enonce:"Convertir 3,5 L en mL.", solution:"3,5 × 1 000 = 3 500 mL"},
      {id:4,  niveau:"Facile",    enonce:"Calculer le volume d'un cube d'arête 6 cm.", solution:"V = 6³ = 216 cm³"},
      {id:5,  niveau:"Facile",    enonce:"Calculer le volume d'un pavé droit de 10 cm × 5 cm × 4 cm.", solution:"V = 10 × 5 × 4 = 200 cm³"},
      {id:6,  niveau:"Moyen",     enonce:"Un aquarium de 50 cm × 30 cm × 25 cm. Calculer son volume en cm³ et en litres.", solution:"V = 50×30×25 = 37 500 cm³ = 37,5 L."},
      {id:7,  niveau:"Moyen",     enonce:"Une citerne rectangulaire contient 1 200 L. Sa base mesure 1,5 m × 0,8 m. Calculer sa hauteur.", solution:"V = 1 200 L = 1,2 m³. h = V ÷ (L×ℓ) = 1,2 ÷ (1,5×0,8) = 1,2 ÷ 1,2 = 1 m."},
      {id:8,  niveau:"Moyen",     enonce:"Un robinet débite 12 L/min. Combien de temps faut-il pour remplir une citerne de 300 L ?", solution:"Temps = 300 ÷ 12 = 25 minutes."},
      {id:9,  niveau:"Moyen",     enonce:"Un récipient cylindrique a un rayon de 5 cm et une hauteur de 20 cm. Calculer son volume en cm³ et en litres. (π ≈ 3,14)", solution:"V = π×25×20 = 500π ≈ 1 570 cm³ = 1,57 L."},
      {id:10, niveau:"Moyen",     enonce:"Quelle est la masse d'eau contenue dans une piscine de 10 m × 5 m × 1,5 m ? (1 L d'eau = 1 kg)", solution:"V = 10×5×1,5 = 75 m³ = 75 000 L. Masse = 75 000 kg = 75 t."},
      {id:11, niveau:"Difficile", enonce:"Une boîte de conserve cylindrique a un diamètre de 8 cm et une hauteur de 11 cm. Calculer son volume en cm³ et en mL. (π ≈ 3,14)", solution:"r = 4 cm. V = π×16×11 = 176π ≈ 552,64 cm³ ≈ 552,64 mL ≈ 0,55 L."},
      {id:12, niveau:"Difficile", enonce:"Un château d'eau cylindrique a un rayon de 3 m et une hauteur de 8 m. Il est rempli aux 2/3. Calculer le volume d'eau en m³ et en litres. Calculer la masse de l'eau. (π ≈ 3,14)", solution:"V total = π×9×8 = 72π ≈ 226,08 m³. V eau = 2/3 × 226,08 ≈ 150,72 m³ = 150 720 L. Masse ≈ 150 720 kg ≈ 150,72 t."},
      {id:13, niveau:"Difficile", enonce:"Un container maritime standard mesure 6,1 m × 2,44 m × 2,59 m. Calculer son volume interne en m³. Si on empile des caisses de 0,5 m × 0,5 m × 0,5 m, combien peut-on en mettre ?", solution:"V container = 6,1×2,44×2,59 ≈ 38,57 m³. V caisse = 0,5³ = 0,125 m³. Nombre = 38,57÷0,125 ≈ 308 caisses."},
      {id:14, niveau:"Difficile", enonce:"Un puits cylindrique au Gabon a un diamètre de 1,2 m et une profondeur de 6 m. Quelle masse de terre a-t-il fallu extraire pour le creuser ? (densité de la terre = 1 800 kg/m³, π ≈ 3,14)", solution:"r = 0,6 m. V = π×0,36×6 = 2,16π ≈ 6,786 m³. Masse = 6,786 × 1 800 ≈ 12 215 kg ≈ 12,2 t."},
      {id:15, niveau:"Difficile", enonce:"Une piscine en forme de pavé droit (25 m × 10 m × 1,8 m) est remplie par deux pompes : la première débite 500 L/min, la deuxième 300 L/min. En combien de temps (en heures et minutes) la piscine sera-t-elle pleine ?", solution:"V piscine = 25×10×1,8 = 450 m³ = 450 000 L. Débit total = 500+300 = 800 L/min. Temps = 450 000 ÷ 800 = 562,5 min = 9h22min30s."},
    ],
  },

  20: {
    id:20, title:"Solides", duration:"3 semaines",
    objectives:[
      "Reconnaître et nommer les solides usuels",
      "Identifier les faces, arêtes et sommets d'un solide",
      "Vérifier la relation d'Euler",
      "Calculer le volume et l'aire latérale des solides usuels",
      "Distinguer solides de révolution et polyèdres",
    ],
    cours:[
      { id:"20-1", titre:"Les polyèdres — faces, arêtes et sommets",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITIONS FONDAMENTALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un SOLIDE est une figure géométrique à 3 dimensions (3D).
Il occupe un volume dans l'espace.

POLYÈDRE : solide dont toutes les faces sont des POLYGONES plats.
(Du grec : poly = plusieurs, hedra = face)

ÉLÉMENTS D'UN POLYÈDRE :
• FACES : les surfaces polygonales qui délimitent le solide
• ARÊTES : les segments où deux faces se rencontrent
• SOMMETS : les points où au moins trois arêtes se rejoignent

REPRÉSENTATION (PAVÉ DROIT) :
         D──────────C
        /│          /│
       / │         / │
      A──────────B   │
      │  │       │   │
      │  H───────│───G
      │ /        │  /
      │/         │ /
      E──────────F

• Sommets : A, B, C, D, E, F, G, H = 8 sommets
• Arêtes : AB, BC, CD, DA (face du haut), EF, FG, GH, HE (face du bas),
           AE, BF, CG, DH (arêtes verticales) = 12 arêtes
• Faces : ABCD, EFGH, ABFE, DCGH, ADHE, BCGF = 6 faces

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATION D'EULER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour tout polyèdre CONVEXE, la relation suivante est toujours vraie :

  Sommets − Arêtes + Faces = 2
  S − A + F = 2

VÉRIFICATIONS :
• Cube : S=8, A=12, F=6 → 8−12+6 = 2 ✓
• Tétraèdre : S=4, A=6, F=4 → 4−6+4 = 2 ✓
• Pyramide à base carrée : S=5, A=8, F=5 → 5−8+5 = 2 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LES POLYÈDRES USUELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. LE CUBE :
   • 6 faces carrées toutes ÉGALES
   • 12 arêtes toutes ÉGALES
   • 8 sommets
   • Toutes les faces sont perpendiculaires aux faces adjacentes
   • Arête : a
   Représentation :
     ┌───────┐
    /│      /│
   / │     / │
  └──┼────┘  │
  │  └────│──┘
  │ /     │ /
  │/      │/
  └───────┘

2. LE PAVÉ DROIT (PARALLÉLÉPIPÈDE RECTANGLE) :
   • 6 faces rectangulaires (en 3 paires parallèles égales)
   • 12 arêtes (en 3 groupes de 4 arêtes égales)
   • 8 sommets
   • Dimensions : L (longueur), ℓ (largeur), h (hauteur)

3. LE PRISME DROIT :
   • 2 bases polygonales parallèles et égales (les BASES)
   • Des faces latérales rectangulaires (les FACES LATÉRALES)
   • Les arêtes latérales sont perpendiculaires aux bases
   Exemples : prisme triangulaire, prisme pentagonal...

4. LA PYRAMIDE :
   • Une base polygonale
   • Des faces latérales triangulaires qui se rejoignent en un SOMMET (APEX)
   Pyramide à base carrée : 5 sommets, 8 arêtes, 5 faces
   Pyramide à base triangulaire (tétraèdre) : 4 sommets, 6 arêtes, 4 faces

🌍 EXEMPLES AFRICAINS :
• Les pyramides d'Égypte : pyramides à base carrée ≈ 230 m de côté
• Une case traditionnelle africaine : les murs forment un prisme droit, le toit une pyramide
• Les boîtes de marchandises au marché : des pavés droits
• Un pétale de fleur de frangipanier : peut être modélisé comme un triangle`,
        exemples:[
          {question:"Vérifier la relation d'Euler pour un cube.", reponse:"S=8 sommets, A=12 arêtes, F=6 faces. 8−12+6=2 ✓"},
          {question:"Une pyramide a une base pentagonale (5 côtés). Combien de faces, arêtes et sommets ?", reponse:"Faces = 5 (latérales) + 1 (base) = 6. Sommets = 5 (base) + 1 (apex) = 6. Arêtes = 5 (base) + 5 (latérales) = 10. Vérif Euler : 6−10+6=2 ✓"},
          {question:"Quelle différence entre un cube et un pavé droit ?", reponse:"Le cube a TOUTES ses arêtes égales et TOUTES ses faces carrées. Le pavé droit peut avoir des arêtes de longueurs différentes et ses faces sont des rectangles (pas forcément des carrés)."},
        ]
      },
      { id:"20-2", titre:"Solides de révolution et volumes",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOLIDES DE RÉVOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un SOLIDE DE RÉVOLUTION est obtenu en faisant tourner une figure plane
autour d'un axe (appelé AXE DE RÉVOLUTION).

LES PRINCIPAUX SOLIDES DE RÉVOLUTION :

1. LE CYLINDRE DROIT :
   Obtenu en faisant tourner un rectangle autour d'un de ses côtés.
   • 2 bases circulaires parallèles et égales
   • 1 face latérale (la surface courbe)
   • Rayon r, hauteur h
        ┌────────────┐
       ╱              ╲
      │       r        │  h
       ╲              ╱
        └────────────┘

   FORMULES :
   • Volume : V = π × r² × h
   • Aire latérale : A_lat = 2 × π × r × h (surface de la tranche)
   • Aire totale : A_tot = 2πr² + 2πrh = 2πr(r + h)

2. LE CÔNE DROIT :
   Obtenu en faisant tourner un triangle rectangle autour d'un de ses cathètes.
   • 1 base circulaire
   • 1 face latérale courbe
   • Un sommet (APEX)
   • Rayon r, hauteur h, apothème ℓ (génératrice)
       /\
      /  \   ← h (hauteur)
     /    \
    /──────\  ← r (rayon)

   FORMULES :
   • Apothème : ℓ = √(r² + h²) (Pythagore)
   • Volume : V = (1/3) × π × r² × h
   • Aire latérale : A_lat = π × r × ℓ

3. LA SPHÈRE :
   Obtenue en faisant tourner un demi-cercle autour de son diamètre.
   • Pas de face plane, entièrement courbe
   • Rayon r

   FORMULES :
   • Volume : V = (4/3) × π × r³
   • Aire : A = 4 × π × r²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VOLUME DU PRISME ET DE LA PYRAMIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRISME DROIT :
V = Aire de la base × hauteur
V = A_base × h

PYRAMIDE :
V = (1/3) × Aire de la base × hauteur
V = (1/3) × A_base × h

📌 Le volume d'une pyramide est TOUJOURS le tiers du volume
   du prisme de même base et même hauteur !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF DES VOLUMES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solide               │ Volume
─────────────────────┼──────────────────────────
Cube (a)             │ a³
Pavé droit (L,ℓ,h)  │ L × ℓ × h
Prisme (base B, h)   │ B × h
Pyramide (base B, h) │ (1/3) × B × h
Cylindre (r, h)      │ π × r² × h
Cône (r, h)          │ (1/3) × π × r² × h
Sphère (r)           │ (4/3) × π × r³

🌍 EXEMPLES AFRICAINS :
• La grande Pyramide de Khéops : base 230m×230m, hauteur 146m.
  V = (1/3) × 230² × 146 = (1/3) × 52 900 × 146 ≈ 2 574 133 m³ !

• Un château d'eau cylindrique : r=2m, h=6m.
  V = π×4×6 = 24π ≈ 75,36 m³ = 75 360 L ≈ 75,4 t d'eau

• Un toit conique de case africaine : r=3m, h=2m.
  V = (1/3)×π×9×2 = 6π ≈ 18,85 m³`,
        exemples:[
          {question:"Calculer le volume d'un cylindre de rayon 5 cm et hauteur 12 cm. (π ≈ 3,14)", reponse:"V = π × 25 × 12 = 300π ≈ 942 cm³"},
          {question:"Calculer le volume d'une pyramide à base carrée de côté 6 cm et hauteur 8 cm.", reponse:"A_base = 6² = 36 cm². V = (1/3) × 36 × 8 = 96 cm³"},
          {question:"Comparer le volume d'un cône et d'un cylindre de mêmes dimensions (r=3 cm, h=10 cm).", reponse:"V_cylindre = π×9×10 = 90π. V_cône = (1/3)×π×9×10 = 30π. Le cône occupe 1/3 du cylindre."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Combien de faces, arêtes et sommets a un cube ? Vérifier la relation d'Euler.", solution:"Faces=6, Arêtes=12, Sommets=8. Euler : 8−12+6=2 ✓"},
      {id:2,  niveau:"Facile",    enonce:"Calculer le volume d'un cube d'arête 4 cm.", solution:"V = 4³ = 64 cm³"},
      {id:3,  niveau:"Facile",    enonce:"Calculer le volume d'un pavé droit de 8 cm × 5 cm × 3 cm.", solution:"V = 8×5×3 = 120 cm³"},
      {id:4,  niveau:"Facile",    enonce:"Quelle est la différence entre un prisme et une pyramide ?", solution:"Le prisme a 2 bases identiques et parallèles avec des faces latérales rectangulaires. La pyramide a 1 seule base et des faces latérales triangulaires qui se rejoignent en un sommet (apex)."},
      {id:5,  niveau:"Facile",    enonce:"Calculer le volume d'un cylindre de rayon 3 cm et hauteur 10 cm. (π ≈ 3,14)", solution:"V = π×9×10 = 90π ≈ 282,6 cm³"},
      {id:6,  niveau:"Moyen",     enonce:"Une pyramide a une base carrée de côté 8 cm et une hauteur de 9 cm. Calculer son volume.", solution:"A_base = 8² = 64 cm². V = (1/3)×64×9 = 192 cm³"},
      {id:7,  niveau:"Moyen",     enonce:"Un prisme triangulaire a une base triangulaire de base 6 cm et hauteur 4 cm, et une longueur de 15 cm. Calculer son volume.", solution:"A_base = (6×4)÷2 = 12 cm². V = 12×15 = 180 cm³"},
      {id:8,  niveau:"Moyen",     enonce:"Un cylindre a un volume de 785 cm³ et une hauteur de 10 cm. Calculer son rayon. (π ≈ 3,14)", solution:"V = πr²h → r² = V÷(πh) = 785÷(3,14×10) = 785÷31,4 = 25. r = 5 cm"},
      {id:9,  niveau:"Moyen",     enonce:"Combien de faces, arêtes et sommets a une pyramide à base hexagonale ? Vérifier Euler.", solution:"Base hexagonale : 6 côtés. Faces = 6(lat)+1(base)=7. Sommets = 6+1=7. Arêtes = 6(base)+6(lat)=12. Euler : 7−12+7=2 ✓"},
      {id:10, niveau:"Moyen",     enonce:"Un toit en forme de pyramide à base carrée de côté 8 m et hauteur 3 m. Calculer le volume d'air qu'il contient.", solution:"V = (1/3)×8²×3 = (1/3)×64×3 = 64 m³"},
      {id:11, niveau:"Difficile", enonce:"Un cylindre et un cône ont le même rayon de 6 cm et la même hauteur de 10 cm. Calculer leurs volumes et leur rapport. (π ≈ 3,14)", solution:"V_cyl = π×36×10 = 360π ≈ 1 130,4 cm³. V_cône = (1/3)×π×36×10 = 120π ≈ 376,8 cm³. Rapport = 1/3 : le cône occupe toujours 1/3 du cylindre de mêmes dimensions."},
      {id:12, niveau:"Difficile", enonce:"La grande pyramide de Khéops a une base carrée de 230 m de côté et une hauteur de 146 m. Calculer son volume en m³ et en km³.", solution:"V = (1/3)×230²×146 = (1/3)×52 900×146 = (1/3)×7 723 400 ≈ 2 574 467 m³ ≈ 0,00257 km³"},
      {id:13, niveau:"Difficile", enonce:"Un château d'eau cylindrique de rayon 2,5 m et hauteur 8 m est rempli aux 3/4. Calculer le volume d'eau en m³ et en litres. (π ≈ 3,14)", solution:"V_total = π×6,25×8 = 50π ≈ 157 m³. V_eau = 3/4×157 ≈ 117,75 m³ = 117 750 L."},
      {id:14, niveau:"Difficile", enonce:"Un solide est composé d'un cylindre de rayon 4 cm et hauteur 10 cm, sur lequel est posé un cône de même rayon et de hauteur 6 cm. Calculer le volume total. (π ≈ 3,14)", solution:"V_cyl = π×16×10 = 160π ≈ 502,4 cm³. V_cône = (1/3)×π×16×6 = 32π ≈ 100,48 cm³. V_total ≈ 602,88 cm³."},
      {id:15, niveau:"Difficile", enonce:"Une case africaine traditionnelle est composée d'un cylindre (murs) de rayon 3 m et hauteur 2,5 m, surmonté d'un cône (toit) de même rayon et hauteur 2 m. Calculer le volume total de la case et l'aire latérale des murs. (π ≈ 3,14)", solution:"V_cyl = π×9×2,5 = 22,5π ≈ 70,65 m³. V_cône = (1/3)×π×9×2 = 6π ≈ 18,84 m³. V_total ≈ 89,49 m³. A_lat_murs = 2×π×3×2,5 = 15π ≈ 47,1 m²."},
    ],
  },

  21: {
    id:21, title:"Patrons", duration:"2 semaines",
    objectives:[
      "Comprendre la notion de patron d'un solide",
      "Reconnaître et construire le patron d'un cube et d'un pavé droit",
      "Construire le patron d'un prisme et d'une pyramide",
      "Construire le patron d'un cylindre et d'un cône",
      "Calculer l'aire totale d'un solide à partir de son patron",
    ],
    cours:[
      { id:"21-1", titre:"Qu'est-ce qu'un patron ?",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉFINITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le PATRON d'un solide est une figure plane (2D) que l'on peut PLIER
pour obtenir le solide (3D), sans superposition ni espace vide.

EN PRATIQUE :
• On découpe le patron dans du carton ou du papier
• On le plie selon les arêtes
• On obtient le solide

EXEMPLE CONCRET : Le patron d'une boîte de céréales.
Avant d'être assemblée, la boîte est découpée à plat. Ce "découpé à plat" est le patron !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROPRIÉTÉS D'UN PATRON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Un solide peut avoir PLUSIEURS patrons différents.
• Un patron contient TOUTES les faces du solide.
• Les faces adjacentes dans le solide sont reliées par une arête commune dans le patron.
• L'AIRE du patron = l'AIRE TOTALE du solide.

COMMENT VÉRIFIER QU'UNE FIGURE EST UN PATRON VALIDE :
1. Compter les faces : le patron doit avoir le bon nombre de faces.
2. Vérifier les dimensions : les faces qui doivent s'assembler ont les mêmes mesures.
3. Tester mentalement le pliage : aucune face ne doit se superposer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATRON DU CUBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un cube a 6 faces carrées identiques.
Il existe 11 patrons différents pour un cube !

PATRON LE PLUS COURANT (en croix) :
        ┌───┐
        │ 2 │  (face du haut)
    ┌───┼───┼───┬───┐
    │ 1 │ 3 │ 4 │ 5 │  (ceinture)
    └───┼───┼───┴───┘
        │ 6 │  (face du bas)
        └───┘

Les 6 carrés sont tous de côté a (arête du cube).
Aire totale = 6 × a²

EXEMPLE : Cube d'arête 4 cm :
• Aire totale = 6 × 4² = 6 × 16 = 96 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATRON DU PAVÉ DROIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un pavé droit (L × ℓ × h) a 6 faces rectangulaires en 3 paires :
• 2 faces L × ℓ (dessus et dessous)
• 2 faces L × h (avant et arrière)
• 2 faces ℓ × h (gauche et droite)

PATRON (forme développée) :
              ┌───────┐
              │  L×ℓ  │  (dessus)
    ┌───┬─────┼───────┼─────┬───┐
    │ℓ×h│ L×h │  L×ℓ  │ L×h │ℓ×h│
    └───┴─────┼───────┼─────┴───┘
              │  L×h  │  (dessous - variante)
              └───────┘

AIRE TOTALE :
A = 2(L×ℓ) + 2(L×h) + 2(ℓ×h)
A = 2(Lℓ + Lh + ℓh)

EXEMPLE : Pavé 6 cm × 4 cm × 3 cm :
A = 2(6×4 + 6×3 + 4×3)
A = 2(24 + 18 + 12)
A = 2 × 54 = 108 cm²

🌍 EXEMPLES AFRICAINS :
• Une boîte cadeau rectangulaire 30 cm × 20 cm × 10 cm.
  A = 2(30×20 + 30×10 + 20×10) = 2(600+300+200) = 2 200 cm² de papier nécessaire.
• Un container maritime : patron impossible à construire à la main
  mais le principe est le même !`,
        exemples:[
          {question:"Le patron d'un cube a-t-il toujours la même forme ?", reponse:"Non ! Il existe 11 patrons différents pour un cube. Ils ont tous 6 carrés identiques mais arrangés différemment."},
          {question:"Calculer l'aire totale d'un cube d'arête 5 cm.", reponse:"A = 6 × 5² = 6 × 25 = 150 cm²"},
          {question:"Calculer l'aire totale d'un pavé 8 cm × 5 cm × 4 cm.", reponse:"A = 2(8×5 + 8×4 + 5×4) = 2(40+32+20) = 2×92 = 184 cm²"},
          {question:"Combien de cm² de carton faut-il pour fabriquer une boîte sans couvercle de 20 cm × 15 cm × 8 cm ?", reponse:"Sans couvercle = sans une face L×ℓ. A = 20×15 + 2(20×8) + 2(15×8) = 300+320+240 = 860 cm²"},
        ]
      },
      { id:"21-2", titre:"Patrons du prisme et de la pyramide",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATRON D'UN PRISME DROIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un PRISME DROIT à base polygonale est formé de :
• 2 bases polygonales identiques et parallèles
• Des faces latérales rectangulaires (autant que de côtés de la base)

PATRON D'UN PRISME TRIANGULAIRE :
(triangle équilatéral de côté a et hauteur du prisme h)

    ┌──────────────────────────┐
    │    a×h    a×h    a×h    │  ← 3 faces rectangulaires
    └──────────────────────────┘
         ╱╲          ╱╲
        ╱  ╲        ╱  ╲
       ╱    ╲      ╱    ╲        ← 2 bases triangulaires
      ╱______╲    ╱______╲

AIRE LATÉRALE = somme des rectangles = périmètre de la base × hauteur
A_lat = P_base × h

AIRE TOTALE = Aire latérale + 2 × Aire de la base
A_tot = P_base × h + 2 × A_base

EXEMPLE : Prisme triangulaire (triangle équilatéral de côté 4 cm, h = 10 cm)
• A_base = (4 × √3×4/2)/2... Pour un triangle équilatéral : A = (a²√3)/4 ≈ 6,93 cm²
• A_lat = (3 × 4) × 10 = 120 cm²
• A_tot = 120 + 2 × 6,93 ≈ 133,86 cm²

EXEMPLE SIMPLE : Prisme triangulaire rectangle (base : triangle 3-4-5, h=8 cm)
• A_base = (3×4)/2 = 6 cm²
• Périmètre base = 3+4+5 = 12 cm
• A_lat = 12 × 8 = 96 cm²
• A_tot = 96 + 2×6 = 108 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATRON D'UNE PYRAMIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Une PYRAMIDE est formée de :
• 1 base polygonale
• Des faces latérales TRIANGULAIRES (autant que de côtés de la base)

PATRON D'UNE PYRAMIDE À BASE CARRÉE :

         △
        ╱│╲
       ╱ │ ╲
      ╱  │  ╲
  △ ╱ ┌───┐ ╲ △
     │       │
     └───────┘
         △

• La base carrée est au centre
• Les 4 triangles latéraux sont "dépliés" autour

APOTHÈME DE LA PYRAMIDE (ℓ) :
C'est la hauteur d'une face latérale triangulaire (mesurée depuis le milieu du côté de la base jusqu'au sommet).

AIRE LATÉRALE :
A_lat = (1/2) × périmètre de la base × apothème
A_lat = (1/2) × P × ℓ

AIRE TOTALE :
A_tot = A_lat + A_base = (1/2)×P×ℓ + A_base

EXEMPLE : Pyramide à base carrée de côté 6 cm, apothème 5 cm
• A_base = 6² = 36 cm²
• A_lat = (1/2) × (4×6) × 5 = (1/2) × 24 × 5 = 60 cm²
• A_tot = 60 + 36 = 96 cm²

🌍 EXEMPLES AFRICAINS :
• Toit d'une case africaine en forme de pyramide à base carrée de 5 m
  et apothème 3,5 m. Quantité de chaume (toit) :
  A_lat = (1/2)×(4×5)×3,5 = 35 m²
  → Il faut au moins 35 m² de matériau pour couvrir le toit.`,
        exemples:[
          {question:"Calculer l'aire latérale d'un prisme rectangulaire (4 cm × 3 cm × 8 cm).", reponse:"Périmètre de la base = 2(4+3) = 14 cm. A_lat = 14 × 8 = 112 cm²"},
          {question:"Calculer l'aire totale d'une pyramide à base carrée de côté 10 cm et d'apothème 8 cm.", reponse:"A_base = 10² = 100 cm². A_lat = (1/2)×(4×10)×8 = 160 cm². A_tot = 100+160 = 260 cm²"},
          {question:"Un prisme triangulaire a une base en triangle rectangle (cathètes 3 et 4 cm) et une hauteur de 12 cm. Calculer l'aire totale.", reponse:"Hypoténuse = 5 cm. A_base = (3×4)/2 = 6 cm². P_base = 3+4+5=12. A_lat = 12×12=144. A_tot = 144+2×6 = 156 cm²"},
        ]
      },
      { id:"21-3", titre:"Patrons du cylindre et du cône",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATRON DU CYLINDRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un cylindre de rayon r et hauteur h est formé de :
• 2 bases circulaires (disques de rayon r)
• 1 face latérale courbe

EN DÉPLIANT le cylindre, la face latérale devient un RECTANGLE :
• Largeur = h (hauteur du cylindre)
• Longueur = 2πr (circonférence de la base, car c'est la "ceinture" qui s'enroule)

PATRON DU CYLINDRE :
    ┌────────────────────────────┐
    │    Longueur = 2πr          │ h
    │    (face latérale)         │
    └────────────────────────────┘
      ○               ○
    (base)          (base)
    rayon r         rayon r

FORMULES :
• Aire latérale : A_lat = 2πr × h
• Aire d'une base : A_base = πr²
• Aire totale : A_tot = 2πrh + 2πr² = 2πr(h + r)

EXEMPLE : Cylindre r = 4 cm, h = 10 cm (π ≈ 3,14)
• A_lat = 2 × 3,14 × 4 × 10 = 251,2 cm²
• A_base = 3,14 × 16 = 50,24 cm²
• A_tot = 251,2 + 2 × 50,24 = 351,68 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATRON DU CÔNE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un cône de rayon r, hauteur h et génératrice (apothème) ℓ est formé de :
• 1 base circulaire (disque de rayon r)
• 1 face latérale courbe

EN DÉPLIANT le cône, la face latérale devient un SECTEUR CIRCULAIRE :
• Rayon du secteur = ℓ (la génératrice du cône)
• Arc du secteur = 2πr (la circonférence de la base)

GÉNÉRATRICE : ℓ = √(r² + h²)  (Pythagore dans le triangle axial)

PATRON DU CÔNE :
     ←──── ℓ ────→
    ╱──────────────╲  ←── secteur circulaire
   ╱                ╲     d'arc = 2πr
  ╱                  ╲
 ╱                    ╲
└──────────────────────┘
       ○
     (base)
     rayon r

FORMULES :
• Génératrice : ℓ = √(r² + h²)
• Aire latérale : A_lat = π × r × ℓ
• Aire totale : A_tot = πrℓ + πr² = πr(ℓ + r)

EXEMPLE : Cône r = 3 cm, h = 4 cm (π ≈ 3,14)
• Génératrice : ℓ = √(9 + 16) = √25 = 5 cm
• A_lat = 3,14 × 3 × 5 = 47,1 cm²
• A_base = 3,14 × 9 = 28,26 cm²
• A_tot = 47,1 + 28,26 = 75,36 cm²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLEAU RÉCAPITULATIF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solide        │ Aire latérale          │ Aire totale
──────────────┼────────────────────────┼──────────────────────
Cube (a)      │ 4a²                    │ 6a²
Pavé (L,ℓ,h) │ 2(Lh + ℓh) = 2h(L+ℓ) │ 2(Lℓ + Lh + ℓh)
Prisme        │ P_base × h             │ P_base×h + 2×A_base
Pyramide      │ (1/2) × P_base × ℓ    │ (1/2)×P×ℓ + A_base
Cylindre(r,h) │ 2πrh                   │ 2πr(r + h)
Cône (r,ℓ)   │ πrℓ                    │ πr(r + ℓ)

🌍 EXEMPLES AFRICAINS :
• Boîte de conserve (cylindre) r=4 cm, h=11 cm :
  Métal nécessaire = A_tot = 2π×4×(4+11) = 8π×15 = 120π ≈ 377 cm²

• Chapeau traditionnel conique r=15 cm, h=20 cm :
  Génératrice = √(225+400) = √625 = 25 cm
  Tissu = A_lat = π×15×25 = 375π ≈ 1 178 cm² ≈ 0,12 m²`,
        exemples:[
          {question:"Calculer l'aire totale d'un cylindre de rayon 5 cm et hauteur 8 cm. (π ≈ 3,14)", reponse:"A_lat = 2×3,14×5×8 = 251,2 cm². A_base = 3,14×25 = 78,5 cm². A_tot = 251,2 + 2×78,5 = 408,2 cm²"},
          {question:"Calculer la génératrice d'un cône de rayon 6 cm et hauteur 8 cm.", reponse:"ℓ = √(6²+8²) = √(36+64) = √100 = 10 cm"},
          {question:"Calculer l'aire totale d'un cône de rayon 6 cm et génératrice 10 cm. (π ≈ 3,14)", reponse:"A_lat = π×6×10 = 60π ≈ 188,4 cm². A_base = π×36 ≈ 113,04 cm². A_tot ≈ 301,44 cm²"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer l'aire totale d'un cube d'arête 6 cm.", solution:"A = 6 × 6² = 6 × 36 = 216 cm²"},
      {id:2,  niveau:"Facile",    enonce:"Calculer l'aire totale d'un pavé droit de 10 cm × 6 cm × 4 cm.", solution:"A = 2(10×6 + 10×4 + 6×4) = 2(60+40+24) = 2×124 = 248 cm²"},
      {id:3,  niveau:"Facile",    enonce:"Un cylindre a un rayon de 3 cm et une hauteur de 7 cm. Calculer son aire latérale. (π ≈ 3,14)", solution:"A_lat = 2 × 3,14 × 3 × 7 = 131,88 cm²"},
      {id:4,  niveau:"Facile",    enonce:"Un cône a un rayon de 4 cm et une hauteur de 3 cm. Calculer sa génératrice.", solution:"ℓ = √(4²+3²) = √(16+9) = √25 = 5 cm"},
      {id:5,  niveau:"Facile",    enonce:"Parmi ces figures, laquelle n'est PAS un patron valide d'un cube : (A) une croix de 6 carrés, (B) une rangée de 6 carrés en ligne, (C) un L de 4 carrés avec 2 carrés sur le côté ?", solution:"(B) une rangée de 6 carrés en ligne n'est PAS un patron valide car en pliant, certaines faces se superposeront."},
      {id:6,  niveau:"Moyen",     enonce:"Calculer l'aire totale d'un prisme triangulaire dont la base est un triangle rectangle (cathètes 5 cm et 12 cm) et la hauteur du prisme est 15 cm.", solution:"Hypoténuse = √(25+144) = √169 = 13 cm. A_base = (5×12)/2 = 30 cm². P_base = 5+12+13=30 cm. A_lat = 30×15=450 cm². A_tot = 450+2×30=510 cm²"},
      {id:7,  niveau:"Moyen",     enonce:"Calculer l'aire totale d'une pyramide à base carrée de côté 8 cm et d'apothème 6 cm.", solution:"A_base = 8² = 64 cm². A_lat = (1/2)×(4×8)×6 = (1/2)×32×6 = 96 cm². A_tot = 64+96 = 160 cm²"},
      {id:8,  niveau:"Moyen",     enonce:"Calculer l'aire totale d'un cylindre de rayon 7 cm et hauteur 14 cm. (π ≈ 22/7)", solution:"A_lat = 2×(22/7)×7×14 = 2×22×14 = 616 cm². A_base = (22/7)×49 = 154 cm². A_tot = 616+2×154 = 924 cm²"},
      {id:9,  niveau:"Moyen",     enonce:"On veut fabriquer une boîte (sans couvercle) en carton de dimensions 20 cm × 15 cm × 8 cm. Calculer la surface de carton nécessaire.", solution:"Sans le couvercle (face 20×15 enlevée). A = 20×15 (fond) + 2(20×8) + 2(15×8) = 300+320+240 = 860 cm²"},
      {id:10, niveau:"Moyen",     enonce:"Un chapeau conique en tissu a un rayon de 12 cm et une génératrice de 20 cm. Calculer la surface de tissu nécessaire. (π ≈ 3,14)", solution:"A_lat (= tissu, sans la base) = π×r×ℓ = 3,14×12×20 = 753,6 cm²"},
      {id:11, niveau:"Difficile", enonce:"Une boîte de conserve cylindrique sans étiquette a un diamètre de 10 cm et une hauteur de 14 cm. On veut l'emballer complètement avec du papier cadeau. Calculer la surface de papier nécessaire (ajouter 15% pour les plis). (π ≈ 3,14)", solution:"r=5 cm. A_tot = 2π×5×(5+14) = 10π×19 = 190π ≈ 596,6 cm². Avec 15% : 596,6×1,15 ≈ 686,1 cm²"},
      {id:12, niveau:"Difficile", enonce:"Un toit de maison a la forme d'une pyramide à base rectangulaire de 12 m × 8 m. L'apothème (hauteur des faces triangulaires) des grandes faces est 6 m et des petites faces est 7 m. Calculer l'aire totale du toit.", solution:"2 grandes faces (12m base) : 2×(1/2×12×6) = 72 m². 2 petites faces (8m base) : 2×(1/2×8×7) = 56 m². A_tot toit = 72+56 = 128 m²"},
      {id:13, niveau:"Difficile", enonce:"Un silo agricole cylindrique de rayon 2 m et hauteur 6 m est surmonté d'un toit conique de même rayon et hauteur 1,5 m. Calculer la surface totale de métal nécessaire pour construire ce silo (sans la base). (π ≈ 3,14)", solution:"Cylindre (sans base) : A_lat = 2×3,14×2×6 = 75,36 m². Cône : génératrice = √(4+2,25)=√6,25=2,5 m. A_lat_cône = 3,14×2×2,5 = 15,7 m². Total = 75,36+15,7 = 91,06 m²"},
      {id:14, niveau:"Difficile", enonce:"On veut peindre l'extérieur d'une boîte en forme de pavé droit de 50 cm × 40 cm × 30 cm. Un pot de peinture couvre 2 m². Combien de pots faut-il pour 3 couches de peinture ?", solution:"A_tot = 2(50×40+50×30+40×30) = 2(2000+1500+1200) = 2×4700 = 9400 cm² = 0,94 m². Pour 3 couches : 0,94×3 = 2,82 m². Nombre de pots = 2,82÷2 = 1,41 → 2 pots."},
      {id:15, niveau:"Difficile", enonce:"Un fabricant de crayons produit des crayons cylindriques de rayon 0,4 cm et longueur 18 cm avec une pointe conique de rayon 0,4 cm et hauteur 1,5 cm. Calculer la surface totale d'un crayon (sans la base du cylindre). (π ≈ 3,14)", solution:"Cylindre (sans base du bas) : A = 2×3,14×0,4×18 + 3,14×0,16 = 45,216 + 0,503 ≈ 45,72 cm². Cône : génératrice = √(0,16+2,25) = √2,41 ≈ 1,55 cm. A_lat_cône = 3,14×0,4×1,55 ≈ 1,947 cm². Total ≈ 47,67 cm²"},
    ],
  },

  22: {
    id:22, title:"Repérage dans l'espace", duration:"2 semaines",
    objectives:[
      "Comprendre le repère orthogonal dans le plan (2D)",
      "Lire et placer des points dans un repère",
      "Calculer la distance entre deux points",
      "Introduire les coordonnées dans l'espace (3D)",
      "Résoudre des problèmes de repérage concrets",
    ],
    cours:[
      { id:"22-1", titre:"Repérage dans le plan — le repère orthogonal",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POURQUOI UN REPÈRE ?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pour localiser précisément un point dans le plan, on a besoin d'un système
de référence. C'est le rôle du REPÈRE.

EXEMPLES DE REPÉRAGES DANS LA VIE COURANTE :
• Les coordonnées GPS (latitude, longitude) pour se localiser sur Terre
• La grille d'une carte routière (A3, B5...)
• Les cases d'un échiquier (A1, E4...)
• Le plan d'une salle de cinéma (rangée C, siège 12)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LE REPÈRE ORTHOGONAL (O, I, J)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Un REPÈRE ORTHOGONAL est formé de :
• Un point ORIGINE O (point de référence)
• Un axe horizontal : l'axe des ABSCISSES (axe des x) → axe (Ox)
• Un axe vertical : l'axe des ORDONNÉES (axe des y) → axe (Oy)
• Les deux axes sont PERPENDICULAIRES entre eux

REPRÉSENTATION :
         y
         │
       4 │        • B(2,4)
       3 │
       2 │   • A(1,2)
       1 │
         │
  ───────┼──────────────→ x
         O  1  2  3  4
        -1
        -2 │      • C(3,-2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COORDONNÉES D'UN POINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chaque point du plan est repéré par un COUPLE de nombres (x ; y) :
• x = ABSCISSE : position horizontale (lire sur l'axe des x)
• y = ORDONNÉE : position verticale (lire sur l'axe des y)

NOTATION : M(x ; y) — on lit "M de coordonnées x et y"

CONVENTION : On lit TOUJOURS l'abscisse (x) EN PREMIER, puis l'ordonnée (y).

EXEMPLES :
• A(3 ; 2) → 3 vers la droite, 2 vers le haut
• B(-2 ; 4) → 2 vers la gauche, 4 vers le haut
• C(0 ; -3) → sur l'axe des y, 3 vers le bas
• D(4 ; 0) → sur l'axe des x, à droite
• O(0 ; 0) → l'origine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LES 4 QUADRANTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Les deux axes divisent le plan en 4 QUADRANTS :

         y
         │
   Q2    │    Q1
 (−,+)   │  (+,+)
─────────┼─────────→ x
   Q3    │    Q4
 (−,−)   │  (+,−)
         │

• Quadrant 1 (Q1) : x > 0 et y > 0 (en haut à droite)
• Quadrant 2 (Q2) : x < 0 et y > 0 (en haut à gauche)
• Quadrant 3 (Q3) : x < 0 et y < 0 (en bas à gauche)
• Quadrant 4 (Q4) : x > 0 et y < 0 (en bas à droite)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLACER UN POINT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTHODE pour placer M(3 ; -2) :
1. Partir de l'origine O
2. Se déplacer de 3 unités vers la DROITE (x = +3)
3. Puis de 2 unités vers le BAS (y = -2)
4. Placer le point et l'étiqueter M

MÉTHODE pour lire les coordonnées d'un point P :
1. Tracer une verticale depuis P jusqu'à l'axe des x → lire x
2. Tracer une horizontale depuis P jusqu'à l'axe des y → lire y

🌍 EXEMPLES AFRICAINS :
• Sur un plan de Libreville, l'origine est la mairie.
  L'axe des x est le boulevard Omar Bongo (horizontal).
  L'axe des y est l'avenue de l'Indépendance (vertical).
  Le stade d'Angondjé serait aux coordonnées approximatives (8 ; 12) km.
• Un navire à Pointe-Noire : sa position GPS est (latitude 4°S, longitude 12°E)
  → sur une carte simplifiée : P(-4 ; 12)`,
        exemples:[
          {question:"Placer les points A(4;3), B(-2;1), C(0;-4), D(-3;-2) dans un repère.", reponse:"A : 4 à droite et 3 en haut. B : 2 à gauche et 1 en haut. C : sur l'axe y, 4 en bas. D : 3 à gauche et 2 en bas."},
          {question:"Dans quel quadrant se trouve le point P(-3 ; 5) ?", reponse:"x=-3 < 0 et y=5 > 0 → Quadrant 2 (Q2 : en haut à gauche)."},
          {question:"Quelles sont les coordonnées de l'origine O ?", reponse:"O(0 ; 0) — l'origine est à l'intersection des deux axes."},
        ]
      },
      { id:"22-2", titre:"Distance entre deux points et milieu",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISTANCE ENTRE DEUX POINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La distance entre deux points A(xₐ ; yₐ) et B(x_b ; y_b) est donnée
par la FORMULE DE LA DISTANCE (issue du théorème de Pythagore) :

  AB = √[(x_b − xₐ)² + (y_b − yₐ)²]

DÉMONSTRATION :
Tracer le triangle rectangle ABC où C est à (x_b ; yₐ).
• AC = |x_b − xₐ| (distance horizontale)
• BC = |y_b − yₐ| (distance verticale)
• AB² = AC² + BC² (Pythagore)
• AB = √(AC² + BC²) = √[(x_b−xₐ)² + (y_b−yₐ)²]

EXEMPLE 1 : Distance entre A(1 ; 2) et B(4 ; 6)
AB = √[(4−1)² + (6−2)²]
   = √[3² + 4²]
   = √[9 + 16]
   = √25 = 5

EXEMPLE 2 : Distance entre C(-2 ; 1) et D(3 ; -3)
CD = √[(3−(−2))² + (−3−1)²]
   = √[5² + (−4)²]
   = √[25 + 16]
   = √41 ≈ 6,4

CAS PARTICULIERS :
• Points sur le même axe horizontal (yₐ = y_b) :
  AB = |x_b − xₐ|

• Points sur le même axe vertical (xₐ = x_b) :
  AB = |y_b − yₐ|

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MILIEU D'UN SEGMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Le MILIEU M du segment [AB] avec A(xₐ ; yₐ) et B(x_b ; y_b) est :

       xₐ + x_b       yₐ + y_b
  M = (─────────  ;  ─────────)
           2               2

EXEMPLE : Milieu de [AB] avec A(2 ; 4) et B(6 ; 2)
M = ((2+6)/2 ; (4+2)/2) = (8/2 ; 6/2) = (4 ; 3)

VÉRIFICATION : AM = √[(4−2)²+(3−4)²] = √[4+1] = √5
               MB = √[(6−4)²+(2−3)²] = √[4+1] = √5 ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALIGNEMENT DE TROIS POINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trois points A, B, C sont alignés si et seulement si :
AB + BC = AC  (ou toute combinaison)

EXEMPLE : A(0;0), B(2;2), C(4;4)
AB = √(4+4) = √8 = 2√2
BC = √(4+4) = √8 = 2√2
AC = √(16+16) = √32 = 4√2
AB + BC = 2√2 + 2√2 = 4√2 = AC ✓ → A, B, C sont alignés !

🌍 EXEMPLES AFRICAINS :
• Sur un plan, Libreville est à O(0;0), la plage des Cocotiers à P(3;2) km.
  Distance = √(9+4) = √13 ≈ 3,6 km à vol d'oiseau.
• Trois villages A(0;0), B(4;3), C(8;6). Sont-ils alignés ?
  AB=5, BC=5, AC=10 → AB+BC=10=AC ✓ → Oui, alignés sur la même route !`,
        exemples:[
          {question:"Calculer la distance entre A(3;1) et B(7;4).", reponse:"AB = √[(7−3)²+(4−1)²] = √[16+9] = √25 = 5"},
          {question:"Trouver le milieu de [CD] avec C(-4;2) et D(2;-6).", reponse:"M = ((-4+2)/2 ; (2-6)/2) = (-2/2 ; -4/2) = (-1 ; -2)"},
          {question:"A(0;3) et B(0;-5) sont-ils sur le même axe ? Calculer AB.", reponse:"Oui, même abscisse x=0 → sur l'axe des y. AB = |(-5)−3| = |-8| = 8"},
        ]
      },
      { id:"22-3", titre:"Repérage dans l'espace (3D)",
        contenu:`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTENSION AU REPÈRE 3D
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dans l'ESPACE (3 dimensions), un repère est formé de :
• Un point ORIGINE O
• Trois axes PERPENDICULAIRES entre eux : Ox, Oy, Oz

Chaque point est repéré par un TRIPLET de coordonnées : M(x ; y ; z)
• x = abscisse
• y = ordonnée
• z = cote (hauteur)

REPRÉSENTATION :
              z
              │
              │
              │
              O────────── y
             ╱
            ╱
           x

EXEMPLES :
• O(0 ; 0 ; 0) → l'origine
• A(3 ; 2 ; 5) → 3 selon x, 2 selon y, 5 selon z (à 5 d'altitude)
• B(4 ; 0 ; 0) → sur l'axe Ox
• C(0 ; 3 ; 0) → sur l'axe Oy
• D(0 ; 0 ; 7) → sur l'axe Oz (à 7 de hauteur)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COORDONNÉES D'UN PAVÉ DROIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Si O est un sommet d'un pavé droit (L × ℓ × h), les 8 sommets ont
pour coordonnées :

O(0;0;0), A(L;0;0), B(L;ℓ;0), C(0;ℓ;0) — base inférieure
D(0;0;h), E(L;0;h), F(L;ℓ;h), G(0;ℓ;h) — base supérieure

EXEMPLE : Pavé 4 × 3 × 2 :
O(0;0;0), A(4;0;0), B(4;3;0), C(0;3;0)
D(0;0;2), E(4;0;2), F(4;3;2), G(0;3;2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DISTANCE DANS L'ESPACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
La distance entre A(xₐ;yₐ;zₐ) et B(x_b;y_b;z_b) :

  AB = √[(x_b−xₐ)² + (y_b−yₐ)² + (z_b−zₐ)²]

EXEMPLE : Distance entre O(0;0;0) et A(3;4;0) :
OA = √(9+16+0) = √25 = 5

Distance entre O(0;0;0) et P(3;4;12) :
OP = √(9+16+144) = √169 = 13

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPLICATIONS PRATIQUES DU REPÉRAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. CARTOGRAPHIE ET GPS :
   La position d'un lieu est donnée par (longitude ; latitude ; altitude).
   Libreville ≈ (9,45°E ; 0,39°N ; 0 m)

2. JEUX VIDÉO ET MODÉLISATION 3D :
   Chaque objet a des coordonnées (x ; y ; z) dans l'espace virtuel.

3. ARCHITECTURE ET CONSTRUCTION :
   Les plans d'un bâtiment utilisent un repère pour situer les pièces.
   Plan 2D : (x ; y) = (largeur ; longueur)
   Plan 3D : (x ; y ; z) = (largeur ; longueur ; hauteur)

4. NAVIGATION MARITIME :
   La position d'un bateau : (longitude ; latitude).
   Exemple : Libreville est à environ (9°E ; 0°N) sur la carte mondiale.

🌍 EXEMPLES AFRICAINS :
• Plan d'un village : O = entrée du village, x = route principale,
  y = chemin secondaire. École à E(200 ; 150) m, marché à M(350 ; 80) m.
  Distance école-marché = √[(350−200)²+(80−150)²]
                        = √[150²+70²] = √[22500+4900] = √27400 ≈ 165 m

• Coordonnées des capitales africaines (approximatives, par rapport à Libreville) :
  Libreville : (0 ; 0)
  Brazzaville : (610 km Est ; 390 km Sud) → B(610 ; -390)
  Yaoundé : (610 km NE ; 210 km N) → Y(610 ; 210)`,
        exemples:[
          {question:"Placer les points A(2;3), B(-1;-2), C(4;-1) dans un repère et identifier leur quadrant.", reponse:"A(2;3) : Q1 (x>0, y>0). B(-1;-2) : Q3 (x<0, y<0). C(4;-1) : Q4 (x>0, y<0)."},
          {question:"Calculer la distance entre A(1;1;1) et B(4;5;1) dans l'espace.", reponse:"AB = √[(4−1)²+(5−1)²+(1−1)²] = √[9+16+0] = √25 = 5"},
          {question:"Un avion est en A(3;4;10) km. La tour de contrôle est à O(0;0;0). Calculer la distance OA.", reponse:"OA = √(9+16+100) = √125 = 5√5 ≈ 11,18 km"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Placer dans un repère les points : A(3;2), B(-1;4), C(0;-3), D(-2;-1).", solution:"A : 3 droite, 2 haut. B : 1 gauche, 4 haut. C : sur axe y, 3 bas. D : 2 gauche, 1 bas."},
      {id:2,  niveau:"Facile",    enonce:"Lire les coordonnées de points sur un repère où : P est à 4 droite et 3 haut, Q est à 2 gauche et 0 haut.", solution:"P(4;3), Q(-2;0). Q est sur l'axe des abscisses."},
      {id:3,  niveau:"Facile",    enonce:"Dans quel quadrant se trouve chaque point : A(-3;5), B(2;-4), C(-1;-6), D(7;3) ?", solution:"A(-3;5) : Q2. B(2;-4) : Q4. C(-1;-6) : Q3. D(7;3) : Q1."},
      {id:4,  niveau:"Facile",    enonce:"Calculer la distance entre A(0;0) et B(3;4).", solution:"AB = √(9+16) = √25 = 5"},
      {id:5,  niveau:"Facile",    enonce:"Trouver le milieu de [AB] avec A(2;6) et B(8;2).", solution:"M = ((2+8)/2 ; (6+2)/2) = (5;4)"},
      {id:6,  niveau:"Moyen",     enonce:"Calculer la distance entre C(-3;1) et D(5;-5).", solution:"CD = √[(5-(-3))²+(-5-1)²] = √[64+36] = √100 = 10"},
      {id:7,  niveau:"Moyen",     enonce:"M est le milieu de [AB] avec A(−4;3) et B(6;−1). Calculer les coordonnées de M.", solution:"M = ((-4+6)/2 ; (3-1)/2) = (2/2 ; 2/2) = (1;1)"},
      {id:8,  niveau:"Moyen",     enonce:"Les points A(0;0), B(3;4) et C(6;8) sont-ils alignés ?", solution:"AB = √(9+16) = 5. BC = √(9+16) = 5. AC = √(36+64) = √100 = 10. AB+BC=10=AC ✓ → alignés !"},
      {id:9,  niveau:"Moyen",     enonce:"Un village est à V(4;3) et une école à E(8;6) sur un plan (en km). Calculer la distance village-école.", solution:"VE = √[(8-4)²+(6-3)²] = √[16+9] = √25 = 5 km"},
      {id:10, niveau:"Moyen",     enonce:"ABCD est un rectangle avec A(1;1), B(5;1), C(5;4). Trouver D et calculer le périmètre.", solution:"D est à (1;4) (même x que A, même y que C). AB=4, BC=3. P = 2(4+3) = 14 unités."},
      {id:11, niveau:"Difficile", enonce:"Trouver un point M sur l'axe des abscisses équidistant de A(2;4) et B(6;2).", solution:"M(x;0). MA² = (x-2)²+16. MB² = (x-6)²+4. MA=MB → (x-2)²+16=(x-6)²+4. x²-4x+4+16=x²-12x+36+4 → 8x=20 → x=2,5. M(2,5;0)."},
      {id:12, niveau:"Difficile", enonce:"Un triangle ABC a A(0;0), B(6;0), C(3;4). Calculer les longueurs des 3 côtés, le périmètre et déterminer le type de triangle.", solution:"AB=6. AC=√(9+16)=5. BC=√(9+16)=5. P=16. AC=BC → isocèle. AB²=36, AC²+BC²... Non, 5²+5²=50≠36 → pas rectangle. Acutangle."},
      {id:13, niveau:"Difficile", enonce:"Calculer la diagonale d'un pavé droit de 12 cm × 5 cm × 4 cm. (La diagonale va d'un sommet au sommet opposé)", solution:"Diagonale = √(12²+5²+4²) = √(144+25+16) = √185 ≈ 13,6 cm"},
      {id:14, niveau:"Difficile", enonce:"Sur un plan de ville (en km), l'hôpital est à H(2;5), la mairie à M(8;1), l'école à E(5;3). Calculer les 3 distances et trouver quel bâtiment est le plus proche de l'école.", solution:"HE=√(9+4)=√13≈3,6. ME=√(9+4)=√13≈3,6. HE=ME → l'hôpital et la mairie sont à égale distance de l'école !"},
      {id:15, niveau:"Difficile", enonce:"Un GPS repère Libreville à L(9,45;0,39) et Yaoundé à Y(11,52;3,87) (en degrés de coordonnées géographiques). En utilisant la formule de distance, calculer la distance approximative LY. Sachant qu'un degré vaut environ 111 km, convertir en km.", solution:"LY_degrés = √[(11,52-9,45)²+(3,87-0,39)²] = √[2,07²+3,48²] = √[4,28+12,11] = √16,39 ≈ 4,05 degrés. Distance réelle ≈ 4,05 × 111 ≈ 450 km."},
    ],
  },

  23: {
    id:23, title:"Tableaux et graphiques", duration:"3 semaines",
    objectives:[
      "Comprendre le vocabulaire statistique de base",
      "Lire et construire un tableau d effectifs et de frequences",
      "Construire et lire un tableau a double entree",
      "Representer des donnees par un diagramme en barres",
      "Representer des donnees par un diagramme circulaire avec calcul des angles",
      "Representer et lire un graphique en courbe",
      "Choisir la representation adaptee et interpreter un graphique",
    ],
    cours:[
      { id:"23-1", titre:"Vocabulaire statistique et tableaux",
        contenu:`La STATISTIQUE collecte, organise, represente et interprete des donnees.

VOCABULAIRE FONDAMENTAL :
POPULATION : ensemble de tous les individus etudies.
INDIVIDU : chaque element de la population.
ECHANTILLON : une partie representative de la population.
CARACTERE : propriete etudiee (qualitatif, quantitatif discret, quantitatif continu).
VALEUR : chaque resultat possible du caractere.
EFFECTIF (n_i) : nombre d individus ayant une valeur donnee.
EFFECTIF TOTAL (N) : nombre total d individus.
FREQUENCE : f_i = n_i / N (entre 0 et 1)
FREQUENCE % : f_i x 100

TABLEAU D EFFECTIFS ET DE FREQUENCES - METHODE :
1. Recenser toutes les valeurs differentes.
2. Compter l effectif de chaque valeur (traits de comptage).
3. Calculer la frequence (n_i divise N).
4. Calculer la frequence en % (x100).
5. Verifier : somme effectifs = N et somme frequences = 1 (100%).

EXEMPLE : Notes de 30 eleves :
8,12,15,10,18,12,14,8,12,16,10,14,12,18,20,15,10,12,14,8,16,12,10,15,14,12,18,10,16,20

Note  Effectif  Frequence  Freq%
8       3        0,10       10%
10      5        0,17       17%
12      7        0,23       23%
14      4        0,13       13%
15      3        0,10       10%
16      3        0,10       10%
18      3        0,10       10%
20      2        0,07        7%
Total  30        1,00      100%

Verification : 3+5+7+4+3+3+3+2=30 OK | somme frequences = 1 OK

TABLEAU A DOUBLE ENTREE (CROISE) :
Croise deux caracteres simultanement.
Structure : lignes = valeurs caractere 1 | colonnes = valeurs caractere 2.
Cases = effectifs croises | Totaux en marge.

EXEMPLE : 40 eleves, genre x matiere preferee :
          Maths  Francais  SVT  Total
Garcons    12       5       7    24
Filles      8       6       2    16
Total      20      11       9    40

Lecture : 12 garcons preferent maths (12/40=30%). 12/24=50% des garcons aiment maths.
Verification : 24+16=40 | 20+11+9=40 OK

TYPES DE CARACTERES :
QUALITATIF : categories (genre, pays, couleur) - pas de calcul numerique
QUANTITATIF DISCRET : valeurs entieres denombr ables (notes, nb enfants)
QUANTITATIF CONTINU : toutes valeurs reelles (taille, masse, temperature)

AFRICAIN : Lycee de Libreville - pays d origine 50 eleves :
Gabon(25=50%), Cameroun(8=16%), Congo(5=10%), RDC(4=8%), Benin(3=6%), Autre(5=10%)`,
        exemples:[
          {question:"8 eleves, tailles (cm) : 152,165,158,165,172,158,165,148. Construire le tableau.", reponse:"148: eff=1, f=12,5%. 152: eff=1, 12,5%. 158: eff=2, 25%. 165: eff=3, 37,5%. 172: eff=1, 12,5%. Total: 8, 100%."},
          {question:"Dans un tableau a double entree, totaux de lignes : 18, 22, 15. Effectif total ?", reponse:"Effectif total = 18+22+15 = 55"},
          {question:"Quelle difference entre effectif et frequence ?", reponse:"Effectif = nombre brut (ex: 12 eleves). Frequence = proportion (12/30=0,4=40%). La frequence permet de comparer des series de tailles differentes."},
          {question:"Verifier : effectifs 5, 8, 7, 4 sur un total annonce de 25.", reponse:"Somme = 5+8+7+4 = 24 DIFFERENT de 25 -> tableau INCORRECT !"},
        ]
      },
      { id:"23-2", titre:"Diagrammes en barres et circulaires",
        contenu:`DIAGRAMME EN BARRES :
Chaque valeur/categorie = une barre dont la HAUTEUR est proportionnelle a l effectif.
Quand l utiliser : comparer des effectifs de differentes categories.

REGLES DE CONSTRUCTION :
1. Axe horizontal -> valeurs/categories
2. Axe vertical -> effectifs ou frequences
3. Barres de meme LARGEUR
4. Barres separees par des espaces (donnees discretes)
5. Titre clair, axes legendes avec unites

VARIANTES :
- Diagramme en barres horizontal : barres vers la droite
- Diagramme groupe : plusieurs series cote a cote
- Diagramme empile : barres superposees

SCHEMA (notes de la classe) :
Eff.
7 |    ##
5 |  ####
4 |  ##  ##
3 |########  ####
2 |              ##
  +-----------------  Notes
   8  10 12 14 15 16 18 20

DIAGRAMME CIRCULAIRE (CAMEMBERT) :
Cercle divise en SECTEURS dont les ANGLES sont proportionnels aux effectifs.
Quand l utiliser : montrer la REPARTITION d un TOUT en parts.

PRINCIPE : Cercle entier = population entiere = 360 degres = 100%

FORMULE DE L ANGLE :
Angle = (Effectif / Effectif total) x 360
Angle = Frequence x 360

METHODE DE CONSTRUCTION :
1. Calculer chaque angle.
2. Tracer un cercle.
3. Tracer un rayon de depart (vers le haut = 12h).
4. Placer le rapporteur sur le centre, aligner le zero.
5. Marquer chaque angle et tracer le rayon.
6. Colorier, legendes, titre.
7. VERIFIER : somme des angles = 360 degres

EXEMPLE COMPLET : Pays d origine de 50 eleves :
Gabon(25), Cameroun(8), Congo(5), RDC(4), Benin(3), Autre(5)
Gabon    : 25/50 x 360 = 180,0 degres
Cameroun :  8/50 x 360 =  57,6 degres
Congo    :  5/50 x 360 =  36,0 degres
RDC      :  4/50 x 360 =  28,8 degres
Benin    :  3/50 x 360 =  21,6 degres
Autre    :  5/50 x 360 =  36,0 degres
TOTAL                   = 360,0 degres OK

LIRE UN DIAGRAMME CIRCULAIRE :
- 180 degres = 50% | 90 degres = 25% | 120 degres = 33%
- Identifier le plus grand secteur (categorie majoritaire)

QUAND NE PAS UTILISER LE CAMEMBERT :
- Plus de 6-7 categories -> petits secteurs illisibles
- Pour montrer une evolution dans le temps -> utiliser une courbe !

AFRICAIN - Budget familial gabonais :
Loyer 35%, Nourriture 30%, Transport 15%, Education 12%, Loisirs 8%
Angles : 126, 108, 54, 43,2, 28,8 degres`,
        exemples:[
          {question:"25 eleves preferent maths, 15 francais, 10 SVT. Calculer les angles du diagramme circulaire.", reponse:"Total=50. Maths: 25/50x360=180 degres. Francais: 15/50x360=108 degres. SVT: 10/50x360=72 degres. Verif: 180+108+72=360 OK"},
          {question:"Secteur d un diagramme = 72 degres. Quel pourcentage ? Si N=150, quel effectif ?", reponse:"Frequence = 72/360 = 0,2 = 20%. Effectif = 150x0,2 = 30 individus."},
          {question:"Pourquoi le diagramme circulaire est-il inappropriate pour les temperatures mensuelles ?", reponse:"Les temperatures ne forment pas un TOUT a repartir. Elles evoluent dans le temps -> graphique en courbe adapte."},
          {question:"Dans un diagramme en barres, la barre lundi est 2x plus haute que mardi. Si lundi=60, effectif mardi ?", reponse:"Mardi = 60/2 = 30 (la hauteur est proportionnelle a l effectif)"},
        ]
      },
      { id:"23-3", titre:"Graphique en courbe et interpretation",
        contenu:`GRAPHIQUE EN COURBE (LIGNE BRISEE) :
Suite de points relies par des SEGMENTS.
Utilise pour montrer l EVOLUTION d une grandeur au cours du TEMPS.

QUAND L UTILISER :
- Donnees evoluant dans le temps (series chronologiques)
- Visualiser des tendances (hausse, baisse, cycles)
- Comparer l evolution de plusieurs series

REGLES DE CONSTRUCTION :
1. Axe horizontal (abscisses) : le TEMPS (jours, mois, annees)
2. Axe vertical (ordonnees) : la VALEUR mesuree (avec unite)
3. Choisir une ECHELLE adaptee (ne pas deformer la courbe)
4. Placer chaque POINT (date ; valeur) avec precision
5. Relier les points par des SEGMENTS droits
6. Titre, legendes des axes, unites, graduation

EXEMPLE : Abonnes AfriLearn (en milliers) :
Mois  : Jan Fev Mar Avr Mai Juin
Abon. :  50  80 120 160 220  310

Schema :
300 |                             *
250 |                         *
200 |                     *
150 |                 *
100 |         *
 50 |     *
    +---------------------------  Mois
     Jan Fev Mar Avr Mai Jun

Interpretation : Croissance reguliere et acceleree des abonnes.

METHODE D INTERPRETATION EN 6 ETAPES :
1. TITRE -> De quoi parle ce graphique ?
2. AXES -> Quelles grandeurs ? Quelles unites ?
3. ECHELLE -> Quelle graduation ? Axe tronque ?
4. TENDANCES -> Monte ? Descend ? Stable ? Oscillante ?
5. POINTS REMARQUABLES -> Maximum, minimum, changements brusques
6. CONCLUSION -> Reponse en lien avec la realite

VOCABULAIRE :
CROISSANT/EN HAUSSE : valeurs qui augmentent
DECROISSANT/EN BAISSE : valeurs qui diminuent
STABLE/CONSTANT : valeurs qui restent proches
MAXIMUM (pic) : valeur la plus haute
MINIMUM (creux) : valeur la plus basse
AMPLITUDE : difference entre max et min
TENDANCE GENERALE : direction globale sur toute la periode
VARIATION ABSOLUE : valeur finale - valeur initiale
VARIATION RELATIVE (%) : (val_finale - val_initiale) / val_initiale x 100

AXES TRONQUES - DANGER !
Un graphique peut TROMPER si l axe vertical ne commence pas a 0 !
Ventes 1000 et 1050 FCFA :
- Axe 0 a 2000 -> variation minime (realiste)
- Axe 900 a 1100 -> variation IMMENSE (trompeur !)
BONNE PRATIQUE : Toujours regarder l origine des axes !

CLIMAGRAMME : represente sur le meme graphique :
- Temperatures mensuelles (courbe)
- Precipitations mensuelles (barres)

AFRICAIN - Donnees climatiques de Libreville :
Mois : Jan Fev Mar Avr Mai Jun Jul Aou Sep Oct Nov Dec
T(C) :  27  27  27  27  27  26  25  25  26  27  27  27
P(mm): 250 200 380 340 220  40  10  30  80 280 430 230

Interpretation :
- Temperature stable toute l annee (25-27 C) -> CLIMAT EQUATORIAL
- Deux saisons seches (juin-aout, janv-fev) et deux saisons des pluies
- Amplitude thermique = 2 C (tres faible, caracteristique equatorial)`,
        exemples:[
          {question:"Un graphique de temperatures : janv=18C, juin=34C. Amplitude thermique ? Type de climat ?", reponse:"Amplitude = 34-18 = 16 C. Grande amplitude -> CLIMAT TROPICAL ou SAHELIEN avec saison froide et chaude distincte."},
          {question:"Ventes : Jan=200, Fev=250, Mar=180, Avr=300. Quand les ventes ont-elles baisse ? Variation Jan->Avr ?", reponse:"Baisse entre Fev (250) et Mar (180). Variation Jan->Avr = 300-200 = +100 (hausse de 50%)."},
          {question:"Pourquoi un axe ne commencant pas a 0 peut tromper ?", reponse:"Exagere visuellement les variations. Hausse de 5% semble enormes si axe va de 95 a 105, alors que minime sur axe 0 a 200."},
          {question:"Difference entre variation absolue et relative ?", reponse:"Absolue = difference brute (ex: +50). Relative = en % par rapport valeur initiale (200->250: +50 absolue, +25% relative)."},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Notes de 10 eleves : 8, 12, 15, 12, 10, 15, 8, 18, 12, 10. Construire le tableau complet d effectifs et de frequences.", solution:"Note 8: eff=2, f=20%. Note 10: eff=2, f=20%. Note 12: eff=3, f=30%. Note 15: eff=2, f=20%. Note 18: eff=1, f=10%. Total: 10, 100%. Verif: 2+2+3+2+1=10 OK"},
      {id:2,  niveau:"Facile",    enonce:"Dans un diagramme circulaire, une categorie represente 40% du total. Quel est son angle ?", solution:"40% x 360 = 144 degres"},
      {id:3,  niveau:"Facile",    enonce:"Un secteur circulaire a un angle de 90 degres. Quel pourcentage ? Et si N=120, quel effectif ?", solution:"Frequence = 90/360 = 0,25 = 25%. Effectif = 120x0,25 = 30 individus."},
      {id:4,  niveau:"Facile",    enonce:"Courbe de ventes : janv=50, fev=80, mars=60. Calculer la variation absolue entre janvier et mars.", solution:"Variation = 60-50 = +10. Hausse de 10 (malgre une baisse intermediaire en mars par rapport a fevrier)."},
      {id:5,  niveau:"Facile",    enonce:"Quel type de graphique utiliser : (a) repartition des eleves par pays, (b) evolution de la population, (c) comparaison des notes de 5 matieres ?", solution:"(a) Circulaire (repartition d un tout). (b) Courbe (evolution dans le temps). (c) Barres (comparaison de categories)."},
      {id:6,  niveau:"Moyen",     enonce:"40 eleves : 15 aiment foot, 10 natation, 8 basketball, 7 athletisme. Tableau complet et angles du diagramme circulaire.", solution:"Foot: 15, 37,5%, 135 deg. Natation: 10, 25%, 90 deg. Basket: 8, 20%, 72 deg. Athle: 7, 17,5%, 63 deg. Total: 40, 100%, 360 deg OK"},
      {id:7,  niveau:"Moyen",     enonce:"50 eleves : Gabon 30, Cameroun 10, Congo 5, Autres 5. Frequences % et angles du diagramme circulaire.", solution:"Gabon: 60%, 216 deg. Cameroun: 20%, 72 deg. Congo: 10%, 36 deg. Autres: 10%, 36 deg. Total: 100%, 360 deg OK. Pays majoritaire : Gabon."},
      {id:8,  niveau:"Moyen",     enonce:"Precipitations mensuelles a Yaounde (mm) : Jan=20, Fev=35, Mar=120, Avr=180, Mai=200, Jun=60, Jul=10. Mois le plus pluvieux ? Le plus sec ? Variation Mars->Mai en absolu et en relatif.", solution:"Max: Mai (200mm). Min: Juillet (10mm). Variation Mar->Mai : absolu = +80mm, relatif = 80/120x100 = +66,7%."},
      {id:9,  niveau:"Moyen",     enonce:"60 eleves, tableau croise genre x matiere : Garcons(maths=20, francais=15), Filles(maths=12, francais=13). Verifier tous les totaux et calculer la frequence de garcons-maths parmi tous.", solution:"Total maths=32, francais=28, total=60 OK. Garcons=35 OK, filles=25 OK. Frequence garcons-maths = 20/60 = 1/3 = 33,3%."},
      {id:10, niveau:"Moyen",     enonce:"Production cacao (t) : 2019=2,1 ; 2020=2,4 ; 2021=1,8 ; 2022=2,6 ; 2023=3,1. Variation 2021->2023 en absolu et en relatif.", solution:"Variation absolue = 3,1-1,8 = +1,3t. Variation relative = 1,3/1,8x100 = +72,2%. La production a presque double en 2 ans."},
      {id:11, niveau:"Difficile", enonce:"Budget mensuel Libreville : Loyer=150 000, Nourriture=120 000, Transport=60 000, Education=45 000, Loisirs=25 000 FCFA. Tableau complet (effectifs, frequences %, angles). Poste le plus important ?", solution:"Total=400 000 FCFA. Loyer: 37,5%, 135 deg. Nourr: 30%, 108 deg. Transp: 15%, 54 deg. Educ: 11,25%, 40,5 deg. Lois: 6,25%, 22,5 deg. Total: 100%, 360 deg OK. Poste le plus important : le loyer (37,5%)."},
      {id:12, niveau:"Difficile", enonce:"Temperatures a Libreville : 25-27 C toute l annee. Amplitude thermique ? Comparer avec N Djamena (Tchad) : 15-42 C. Expliquer la difference climatique.", solution:"Amplitude Libreville = 2 C -> CLIMAT EQUATORIAL tres stable. N Djamena = 42-15 = 27 C -> CLIMAT SAHELIEN avec hiver froid et ete tres chaud. La latitude explique : Libreville est a l equateur, N Djamena bien plus au nord."},
      {id:13, niveau:"Difficile", enonce:"Comparer classes A et B. Classe A (25 eleves) : <10: 5, 10-14: 12, >=15: 8. Classe B (30 eleves) : <10: 8, 10-14: 14, >=15: 8. Calculer les frequences et conclure.", solution:"Classe A : <10: 20%, 10-14: 48%, >=15: 32%. Classe B : <10: 26,7%, 10-14: 46,7%, >=15: 26,7%. Classe A a plus de tres bons (32% vs 27%) et moins d echec (20% vs 27%) -> Classe A meilleurs resultats."},
      {id:14, niveau:"Difficile", enonce:"200 eleves africains : Maths=80, SVT=50, Francais=40, Hist-Geo=20, Anglais=10. Tableau complet. Quel diagramme choisir pour representer ces donnees ? Pourquoi ?", solution:"Maths: 80, 40%, 144 deg. SVT: 50, 25%, 90 deg. Francais: 40, 20%, 72 deg. Hist-Geo: 20, 10%, 36 deg. Anglais: 10, 5%, 18 deg. Total OK. Les deux graphiques sont possibles : Circulaire pour montrer les proportions (40% pour maths), Barres pour comparer les effectifs absolus."},
      {id:15, niveau:"Difficile", enonce:"Population africaine (milliards) : 1950=0,22 ; 1975=0,41 ; 2000=0,81 ; 2010=1,04 ; 2020=1,34 ; 2024=1,46. Variations absolues et relatives entre chaque periode. Quelle periode a la plus forte croissance relative ? Tendance generale ?", solution:"1950->75: +0,19 Md, +86%. 1975->00: +0,40 Md, +98%. 2000->10: +0,23 Md, +28%. 2010->20: +0,30 Md, +29%. 2020->24: +0,12 Md, +9%. Plus forte croissance RELATIVE : 1975->2000 (+98%). Tendance : croissance continue mais taux ralentit. Population multipliee par 6,6 en 74 ans !"},
    ],
  },


  24: {
    id:24, title:"Moyennes", duration:"2 semaines",
    objectives:[
      "Calculer la moyenne arithmetique d une serie statistique",
      "Calculer la moyenne a partir d un tableau d effectifs",
      "Calculer la moyenne ponderee avec coefficients",
      "Calculer l etendue, la mediane et le mode d une serie",
      "Distinguer moyenne, mediane et mode et choisir le bon indicateur",
      "Resoudre des problemes concrets faisant intervenir ces indicateurs",
    ],
    cours:[
      { id:"24-1", titre:"Moyenne arithmetique",
        contenu:`LA MOYENNE ARITHMETIQUE :
La valeur qui, si elle remplacait toutes les valeurs, donnerait la meme somme totale.

FORMULE :
x_barre = (x1 + x2 + ... + xn) / n
        = Somme de toutes les valeurs / Nombre de valeurs

EXEMPLE 1 - Simple :
Notes de Kofi : 12, 15, 8, 14, 11
Somme = 12+15+8+14+11 = 60
n = 5
Moyenne = 60 / 5 = 12

EXEMPLE 2 - Masses de sacs :
48 kg, 52 kg, 50 kg, 50 kg
Moyenne = (48+52+50+50) / 4 = 200 / 4 = 50 kg

PROPRIETES IMPORTANTES :
1. La moyenne est toujours comprise entre MIN et MAX :  min <= x_barre <= max
2. Si on ajoute k a chaque valeur -> moyenne augmente de k
3. Si on soustrait k a chaque valeur -> moyenne diminue de k
4. Si on multiplie chaque valeur par k -> moyenne est multipliee par k
5. La somme des ecarts a la moyenne est toujours nulle :
   Somme(xi - x_barre) = 0

EXEMPLE PROPRIETE 5 : valeurs 8, 10, 12 ; moyenne = 10
Ecarts : (8-10) + (10-10) + (12-10) = -2 + 0 + 2 = 0 OK

MOYENNE A PARTIR D UN TABLEAU D EFFECTIFS :
Quand les donnees sont donnees avec leurs effectifs :

Formule : Moyenne = Somme(valeur x effectif) / Effectif total
          x_barre = [Somme(xi x ni)] / N

EXEMPLE : Notes d une classe de 30 eleves :
Note  Eff    Note x Eff
  8    3        24
 10    5        50
 12    7        84
 14    4        56
 15    3        45
 16    3        48
 18    3        54
 20    2        40
Total 30       401

Moyenne = 401 / 30 = 13,37 / 20

TROUVER UNE VALEUR MANQUANTE :
Si la moyenne est connue et une valeur manque :
Valeur manquante = (Moyenne x n) - Somme des autres valeurs

EXEMPLE : 4 notes, moyenne = 14. Notes connues : 12, 15, 13.
Somme totale = 14 x 4 = 56
Note manquante = 56 - 12 - 15 - 13 = 56 - 40 = 16

AFRICAIN :
- Moyenne de temperature annuelle de Libreville = 26 C
- Salaire moyen au Gabon = environ 200 000 FCFA/mois
- Taille moyenne des eleves de 6eme = environ 1,52 m
- Consommation moyenne eau par famille = 8 m3/mois`,
        exemples:[
          {question:"Calculer la moyenne : 7, 14, 9, 12, 8", reponse:"Somme = 7+14+9+12+8 = 50. Moyenne = 50/5 = 10"},
          {question:"La moyenne de 4 notes est 13. La somme de 3 de ces notes est 37. Quelle est la 4eme note ?", reponse:"Somme totale = 13x4 = 52. 4eme note = 52-37 = 15"},
          {question:"Calculer la moyenne : valeurs 5, 10, 15 avec effectifs 2, 5, 3.", reponse:"Somme(vxe) = 5x2+10x5+15x3 = 10+50+45 = 105. Total eff = 10. Moyenne = 105/10 = 10,5"},
          {question:"Verifier : notes 8,10,12 de moyenne 10. La somme des ecarts a la moyenne vaut-elle 0 ?", reponse:"Ecarts : (8-10)+(10-10)+(12-10) = -2+0+2 = 0 OK. Propriete verifiee."},
        ]
      },
      { id:"24-2", titre:"Etendue, mediane et mode",
        contenu:`L ETENDUE :
L etendue est la difference entre la valeur MAXIMALE et la valeur MINIMALE.
e = valeur max - valeur min

Elle mesure la DISPERSION de la serie (comment les valeurs sont etalees).

EXEMPLE : 3, 7, 12, 5, 18, 9
Etendue = 18 - 3 = 15

Grande etendue -> valeurs tres dispersees (serie heterogene)
Petite etendue -> valeurs groupees (serie homogene)

EXEMPLE AFRICAIN : Temperatures de Libreville (25-27 C) -> etendue = 2 C (homogene)
Temperatures de N Djamena (15-42 C) -> etendue = 27 C (tres dispersee)

LA MEDIANE :
La valeur qui PARTAGE la serie ORDONNEE en deux parties EGALES.
- 50% des valeurs sont inferieures ou egales a la mediane
- 50% des valeurs sont superieures ou egales a la mediane

METHODE - n IMPAIR :
1. Classer les valeurs dans l ordre CROISSANT
2. La mediane est la valeur du rang (n+1)/2

EXEMPLE : Serie (n=5) : 8, 3, 12, 7, 15
Ordonnee : 3, 7, 8, 12, 15
Rang median = (5+1)/2 = 3 -> mediane = 8 (3eme valeur)

METHODE - n PAIR :
1. Classer dans l ordre croissant
2. La mediane est la MOYENNE des deux valeurs centrales (rangs n/2 et n/2+1)

EXEMPLE : Serie (n=6) : 4, 7, 9, 11, 14, 18
Rangs centraux : 3 et 4 -> valeurs 9 et 11
Mediane = (9+11)/2 = 10

LE MODE :
La valeur qui apparait le PLUS SOUVENT dans la serie.

EXEMPLE 1 : 3, 5, 7, 5, 9, 5, 3 -> mode = 5 (3 fois)
EXEMPLE 2 : 2, 4, 4, 6, 6 -> deux modes = 4 et 6 (serie bimodale)
EXEMPLE 3 : 1, 2, 3, 4, 5 -> PAS de mode (chaque valeur une seule fois)

Le mode existe toujours dans un tableau d effectifs (valeur d effectif max).

QUELLE MESURE CHOISIR ?

MOYENNE :
- Quand les valeurs sont homogenes, sans valeurs extremes
- Exemple : notes d un eleve regulier

MEDIANE :
- Quand il y a des valeurs extremes (tres grandes ou tres petites)
- Exemple : salaires (quelques tres riches faussent la moyenne)
- Exemple : prix immobiliers (quelques mansions faussent la moyenne)

MODE :
- Pour les donnees qualitatives (categories)
- Pour trouver la valeur la plus typique/populaire
- Exemple : taille de vetement la plus vendue

EXEMPLE COMPARATIF :
Salaires de 5 employes (FCFA) : 180 000, 190 000, 200 000, 210 000, 1 500 000

Moyenne = (180+190+200+210+1500) x 1000 / 5 = 456 000 FCFA
(faussee par le gros salaire !)

Ordonnee : 180 000, 190 000, 200 000, 210 000, 1 500 000
Mediane = 200 000 FCFA (valeur centrale)
(representatif des salaires typiques !)

Conclusion : La MEDIANE represente mieux les salaires de cette serie.

AFRICAIN :
- Bulletin scolaire gabonais : moyenne ponderee par coefficients
- Salaire median en Afrique : meilleur indicateur que la moyenne
- Pointure de chaussure la plus vendue au marche : le mode`,
        exemples:[
          {question:"Calculer l etendue de la serie : 15, 8, 22, 11, 18, 5", reponse:"Etendue = max - min = 22 - 5 = 17"},
          {question:"Trouver la mediane de : 5, 12, 3, 8, 15, 7, 10", reponse:"Ordonnee : 3, 5, 7, 8, 10, 12, 15. n=7 impair. Rang = (7+1)/2 = 4. Mediane = 8 (4eme valeur)."},
          {question:"Trouver la mediane de : 12, 8, 15, 10, 14, 9", reponse:"Ordonnee : 8, 9, 10, 12, 14, 15. n=6 pair. Valeurs centrales = rang 3 et 4 = 10 et 12. Mediane = (10+12)/2 = 11."},
          {question:"Serie : 8, 12, 15, 12, 8, 12, 15. Trouver moyenne, mediane, mode et etendue.", reponse:"Somme=82, n=7. Moyenne=82/7=11,7. Ordonnee: 8,8,12,12,12,15,15. Mediane=12 (rang 4). Mode=12 (3 fois). Etendue=15-8=7."},
        ]
      },
      { id:"24-3", titre:"Moyenne ponderee",
        contenu:`POURQUOI LA MOYENNE PONDEREE ?
Dans certaines situations, certaines valeurs ont plus d IMPORTANCE que d autres.
On leur attribue un COEFFICIENT (ou POIDS).

FORMULE :
x_barre_pond = Somme(valeur x coefficient) / Somme(coefficients)
             = [Somme(xi x ci)] / [Somme(ci)]

EXEMPLE SCOLAIRE COMPLET :
Notes du trimestre d Aminata :
Matiere      Note  Coeff  Note x Coeff
Maths          14    4      56
Francais       12    4      48
SVT            15    2      30
Hist-Geo       13    2      26
Anglais        11    2      22
EPS            16    1      16
Total                15    198

Moyenne ponderee = 198 / 15 = 13,2 / 20

COMPARAISON AVEC MOYENNE SIMPLE :
Sans ponderation : (14+12+15+13+11+16)/6 = 81/6 = 13,5
Avec ponderation :                                 13,2
-> La ponderation favorise les matieres importantes (Maths et Francais coeff 4) !

EXEMPLE ATHLETISME :
Un coureur fait 3 courses : 9,8s, 10,2s, 9,9s
Course 1 (finale) a coefficient 3, courses 2 et 3 a coefficient 1.
Moyenne ponderee = (9,8x3 + 10,2x1 + 9,9x1) / (3+1+1)
                = (29,4 + 10,2 + 9,9) / 5
                = 49,5 / 5 = 9,9 s

EXEMPLE COMMERCIAL :
Un vendeur de riz : 100 kg a 500 FCFA/kg, 50 kg a 600 FCFA/kg.
Prix moyen pondere = (100x500 + 50x600) / (100+50)
                   = (50 000 + 30 000) / 150
                   = 80 000 / 150
                   = 533,33 FCFA/kg

Ce n est PAS la meme chose que (500+600)/2 = 550 FCFA/kg !
La ponderation par les quantites donne le vrai prix moyen.

TROUVER UNE NOTE POUR ATTEINDRE UNE MOYENNE CIBLE :
Probleme : Kofi a en maths : 14 (coeff 2), 10 (coeff 1). Il veut une moyenne de 13.
Somme cible = 13 x (2+1+1) = 52 (avec un prochain devoir coeff 1)
Somme actuelle = 14x2 + 10x1 = 38
Note necessaire = 52 - 38 = 14 / 20

AFRICAIN :
- Bulletin scolaire au Gabon : coefficients standard
  Maths coeff 4, Francais coeff 4, SVT coeff 2, Hist-Geo coeff 2,
  Anglais coeff 2, Physique coeff 2, EPS coeff 1
- Indice des prix a la consommation : moyenne ponderee de nombreux produits
- Moyenne ponderee des recoltes : tenir compte des surfaces plantees`,
        exemples:[
          {question:"Notes avec coefficients : Maths 15 (coeff 3), Francais 12 (coeff 2), SVT 14 (coeff 1). Calculer la moyenne ponderee.", reponse:"(15x3+12x2+14x1)/(3+2+1) = (45+24+14)/6 = 83/6 = 13,83/20"},
          {question:"Un magasin vend : 200 kg de tomates a 800 FCFA/kg et 100 kg a 1000 FCFA/kg. Prix moyen pondere ?", reponse:"(200x800+100x1000)/(200+100) = (160000+100000)/300 = 260000/300 = 866,67 FCFA/kg"},
          {question:"Kofi a 12 et 15 en maths (coeff 1 chacun). Pour avoir une moyenne de 14 sur 3 devoirs (coeff 1 chacun), quelle note faut-il au 3eme ?", reponse:"Somme cible = 14x3 = 42. Somme actuelle = 12+15 = 27. Note 3 = 42-27 = 15/20"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Calculer la moyenne : 10, 14, 8, 16, 12", solution:"Somme=60. Moyenne=60/5=12"},
      {id:2,  niveau:"Facile",    enonce:"5 eleves : tailles 1,50m ; 1,62m ; 1,55m ; 1,48m ; 1,60m. Taille moyenne et etendue.", solution:"Somme=7,75m. Moyenne=7,75/5=1,55m. Etendue=1,62-1,48=0,14m=14cm"},
      {id:3,  niveau:"Facile",    enonce:"Trouver le mode de : 3, 7, 5, 3, 8, 3, 5, 7, 3.", solution:"3 apparait 4 fois -> MODE = 3"},
      {id:4,  niveau:"Facile",    enonce:"Trouver la mediane de : 4, 9, 2, 7, 11", solution:"Ordonnee : 2, 4, 7, 9, 11. n=5 impair. Mediane = rang 3 = 7"},
      {id:5,  niveau:"Facile",    enonce:"La moyenne de 3 notes est 14. Quelle est la somme de ces 3 notes ?", solution:"Somme = 14x3 = 42"},
      {id:6,  niveau:"Moyen",     enonce:"Notes de Jean avec coefficients : Maths 16 (c4), Francais 12 (c3), SVT 14 (c2), Anglais 10 (c1). Calculer la moyenne ponderee.", solution:"Somme(nxc) = 64+36+28+10 = 138. Somme c = 10. Moyenne = 138/10 = 13,8/20"},
      {id:7,  niveau:"Moyen",     enonce:"Calculer l etendue et la mediane de : 12, 8, 15, 10, 14, 9.", solution:"Ordonnee : 8, 9, 10, 12, 14, 15. n=6. Mediane = (10+12)/2 = 11. Etendue = 15-8 = 7"},
      {id:8,  niveau:"Moyen",     enonce:"Tableau : valeurs 5, 10, 15, 20 avec effectifs 4, 6, 5, 5. Calculer la moyenne et le mode.", solution:"Somme(vxe) = 20+60+75+100 = 255. N = 20. Moyenne = 255/20 = 12,75. Mode = 10 (effectif 6, le plus grand)."},
      {id:9,  niveau:"Moyen",     enonce:"Aminata a eu 12, 14, et une note manquante en maths. Sa moyenne de maths est 13. Quelle est la note manquante ?", solution:"Somme = 13x3 = 39. Note manquante = 39-12-14 = 13"},
      {id:10, niveau:"Moyen",     enonce:"Temperatures max a Libreville : Lun=29, Mar=31, Mer=28, Jeu=32, Ven=30 C. Moyenne, mode, mediane et etendue.", solution:"Somme=150. Moyenne=30 C. Mode=aucun (valeurs toutes differentes). Ordonnee: 28,29,30,31,32. Mediane=30 C. Etendue=32-28=4 C."},
      {id:11, niveau:"Difficile", enonce:"Un eleve doit avoir une moyenne >= 12 en maths. Il a 4 notes : 10, 14, 8, 13. Quelle note minimale doit-il obtenir au 5eme devoir (coeff 1 chacun) ?", solution:"Somme actuelle = 45. Pour moyenne >= 12 sur 5 : somme >= 60. Note minimale = 60-45 = 15/20."},
      {id:12, niveau:"Difficile", enonce:"Salaires de 5 employes (en FCFA) : 180 000, 200 000, 190 000, 210 000, 1 500 000. Calculer la moyenne, la mediane et l etendue. Laquelle represente le mieux les salaires typiques ? Pourquoi ?", solution:"Somme=2 280 000. Moyenne=456 000 FCFA (faussee). Ordonnee: 180k,190k,200k,210k,1500k. Mediane=200 000 FCFA. Etendue=1 500 000-180 000=1 320 000 FCFA. La MEDIANE (200 000) represente mieux : la moyenne est tiree vers le haut par le salaire exceptionnel de 1,5M FCFA."},
      {id:13, niveau:"Difficile", enonce:"Bulletin de Kofi : Maths 15 (c4), Francais 11 (c3), SVT 13 (c2), Hist-Geo 14 (c2), Anglais 12 (c2), EPS 17 (c1). Sa soeur a une moyenne de 13,5. Qui a la meilleure moyenne ?", solution:"Somme(nxc) = 60+33+26+28+24+17 = 188. Somme c = 14. Moyenne Kofi = 188/14 = 13,43. Soeur = 13,5 > 13,43 -> la soeur a la meilleure moyenne (d une courte tete !)."},
      {id:14, niveau:"Difficile", enonce:"Une plantation (en kg) : 2020=1200, 2021=1450, 2022=980, 2023=1650, 2024=1120. Calculer moyenne, mediane, mode et etendue. En 2025 on veut une moyenne sur 6 ans de 1300 kg. Quelle production faut-il en 2025 ?", solution:"Somme=6400. Moyenne=1280 kg. Ordonnee: 980,1120,1200,1450,1650 -> mediane=(1200+1450)/2=1325 kg. Etendue=1650-980=670 kg. Pas de mode. Pour moy 1300 sur 6 ans : somme=7800. Prod 2025=7800-6400=1400 kg."},
      {id:15, niveau:"Difficile", enonce:"Classe de 30 eleves : 10 ont une moyenne de 15 et les 20 autres ont une moyenne de 11. Calculer la moyenne de la classe entiere et comparer avec la moyenne simple des deux groupes.", solution:"Somme groupe 1 = 10x15=150. Somme groupe 2 = 20x11=220. Somme totale=370. Moyenne classe = 370/30 = 12,33. Moyenne simple = (15+11)/2 = 13. Ces deux resultats sont DIFFERENTS car les groupes n ont pas le meme effectif -> la moyenne ponderee (12,33) est la bonne."},
    ],
  },


  25: {
    id:25, title:"Proportionnalite", duration:"3 semaines",
    objectives:[
      "Reconnaitre une situation de proportionnalite",
      "Calculer le coefficient de proportionnalite",
      "Completer un tableau de proportionnalite",
      "Utiliser la regle de trois pour trouver une valeur inconnue",
      "Connaitre les grandeurs inversement proportionnelles",
      "Calculer des pourcentages et des taux d evolution",
      "Appliquer la proportionnalite dans des situations concretes",
    ],
    cours:[
      { id:"25-1", titre:"Proportionnalite directe",
        contenu:`DEFINITION :
Deux grandeurs x et y sont PROPORTIONNELLES si leurs valeurs correspondantes
ont toujours le meme RAPPORT (quotient constant).

COEFFICIENT DE PROPORTIONNALITE (k) :
Si y est proportionnel a x : y = k x x pour tout x
Le coefficient k = y / x est CONSTANT.

RECONNAITRE UN TABLEAU PROPORTIONNEL :
- Calculer tous les rapports y/x
- S ils sont tous egaux -> PROPORTIONNEL
- S ils different -> PAS proportionnel

EXEMPLE PROPORTIONNEL :
x   2    5    8   11
y   6   15   24   33
Rapports : 6/2=3 ; 15/5=3 ; 24/8=3 ; 33/11=3 -> tous egaux -> k=3

EXEMPLE NON PROPORTIONNEL :
x   1    2    3
y   3    6   10
Rapports : 3/1=3 ; 6/2=3 ; 10/3=3,33 -> PAS egaux -> non proportionnel

PROPRIETE FONDAMENTALE (PRODUITS EN CROIX) :
Si x1/y1 = x2/y2 (rapport constant), alors :
x1 x y2 = x2 x y1

Cela permet de trouver une valeur manquante !
Si y1 est inconnue : y1 = (x1 x y2) / x2

COMPLETER UN TABLEAU PROPORTIONNEL :
Methode 1 : Trouver k puis calculer y = k x x
Methode 2 : Produits en croix

EXEMPLE :
x   3   ?   9   15
y  12  20  36    ?
k = 12/3 = 4 -> y = 4x
x=5 : y=20 -> x manquant = 20/4 = 5 OK
y manquant = 4 x 15 = 60

SITUATIONS PROPORTIONNELLES COURANTES :
- Prix proportionnel a la quantite (prix unitaire constant)
- Distance proportionnelle au temps (vitesse constante)
- Recette et nombre de portions
- Conversion de devises (taux fixe)
- Echelle sur une carte

SITUATIONS NON PROPORTIONNELLES :
- Aire d un carre et son cote (A = c^2, pas lineaire)
- Prix avec remise fixe (100 FCFA de reduction)
- Age et taille (la taille ne double pas si l age double)
- Temperature en C et en F (T_F = 9/5 x T_C + 32, pas y = kx)

AFRICAIN :
- Taux de change : 1 euro = 655,957 FCFA (fixe) -> proportionnel !
  50 euros = 50 x 655,957 = 32 797,85 FCFA
- Prix au marche : 3 kg de tomates = 900 FCFA -> k = 300 FCFA/kg
  7 kg = 7 x 300 = 2 100 FCFA
- Distance Libreville-Oyem = 476 km en 7h -> vitesse = 68 km/h
  10h de route -> 10 x 68 = 680 km`,
        exemples:[
          {question:"Ce tableau est-il proportionnel ? x: 2, 4, 6, 8 et y: 7, 14, 21, 28", reponse:"7/2=3,5 ; 14/4=3,5 ; 21/6=3,5 ; 28/8=3,5 -> tous egaux -> OUI, proportionnel (k=3,5)"},
          {question:"Ce tableau est-il proportionnel ? x: 1, 2, 3 et y: 3, 6, 10", reponse:"3/1=3 ; 6/2=3 ; 10/3=3,33 -> PAS egaux -> NON, pas proportionnel"},
          {question:"k=4. Completer : x: 3, ?, 8 et y: ?, 20, ?", reponse:"y=k x x : y=12 (3x4). x=5 (20/4). y=32 (8x4)."},
          {question:"Verifier par produits en croix : 3/12 = 7/28", reponse:"3 x 28 = 84 et 12 x 7 = 84. 84 = 84 -> OK, les rapports sont egaux."},
        ]
      },
      { id:"25-2", titre:"Regle de trois et grandeurs inverses",
        contenu:`LA REGLE DE TROIS :
Methode pour trouver une valeur manquante dans un tableau de proportionnalite.

FORMULE :
Tableau :
x1  |  y1
x2  |  y?

y? = (x2 x y1) / x1

Ou encore : y? = y1 x (x2/x1)
(on multiplie y1 par le rapport des x)

EXEMPLES DETAILLES :

EXEMPLE 1 - Prix :
3 kg de riz coutent 2 400 FCFA. Quel est le prix de 7 kg ?
  3 kg  |  2 400 FCFA
  7 kg  |  ?
Prix = (7 x 2 400) / 3 = 16 800 / 3 = 5 600 FCFA

EXEMPLE 2 - Recette :
Pour 4 personnes : 600 g de farine. Pour 10 personnes ?
  4 pers  |  600 g
 10 pers  |  ?
Farine = (10 x 600) / 4 = 6 000 / 4 = 1 500 g = 1,5 kg

EXEMPLE 3 - Quantite :
5 cahiers coutent 1 250 FCFA. Combien de cahiers pour 2 000 FCFA ?
  5 cahiers  |  1 250 FCFA
  ?          |  2 000 FCFA
Cahiers = (5 x 2 000) / 1 250 = 10 000 / 1 250 = 8 cahiers

QUATRIEME PROPORTIONNELLE :
La quatrieme proportionnelle de a, b, c est x tel que a/b = c/x
-> x = (b x c) / a

EXEMPLE : Quatrieme proportionnelle de 4, 6 et 10 :
4/6 = 10/x -> x = (6 x 10) / 4 = 60 / 4 = 15

GRANDEURS INVERSEMENT PROPORTIONNELLES :
Deux grandeurs sont INVERSEMENT PROPORTIONNELLES si leur PRODUIT est constant.
x x y = k (constante)

Quand l une double, l autre est divisee par deux.

EXEMPLE 1 - Vitesse et temps :
Pour parcourir 120 km :
60 km/h -> 2h       (60 x 2 = 120)
80 km/h -> 1,5h     (80 x 1,5 = 120)
40 km/h -> 3h       (40 x 3 = 120)
Produit toujours = 120 -> INVERSEMENT PROPORTIONNEL

FORMULE : t = D/v (temps = distance / vitesse)
Ou : v = D/t (vitesse = distance / temps)

EXEMPLE 2 - Ouvriers et temps :
6 ouvriers construisent un mur en 8 jours.
En combien de jours 12 ouvriers font-ils le meme travail ?
Produit constant = 6 x 8 = 48
12 ouvriers -> 48/12 = 4 jours
(2x plus d ouvriers -> 2x moins de jours)

REGLE DE TROIS INVERSE :
Tableau inverse :
x1  |  y1
x2  |  y?

y? = (x1 x y1) / x2 (on inverse le rapport !)

AFRICAIN :
- Recette de sauce pour 6 personnes : 800g poulet, 400g gombo, 200g tomates.
  Pour 9 personnes : tout x 9/6 = x 1,5
  Poulet=1200g, Gombo=600g, Tomates=300g.
- Taux de change : 1 USD = 600 FCFA.
  250 USD = 150 000 FCFA.
- Vitesse Libreville-Mouila (230 km) : a 80 km/h -> 230/80 = 2h52min.
  A 100 km/h -> 230/100 = 2h18min.`,
        exemples:[
          {question:"4 kg de cafe coutent 12 000 FCFA. Prix de 6 kg ?", reponse:"(6 x 12 000) / 4 = 72 000 / 4 = 18 000 FCFA"},
          {question:"5 ouvriers font un travail en 12 jours. En combien de jours 8 ouvriers font-ils le meme travail ?", reponse:"Inversement proportionnel. Produit constant = 5 x 12 = 60. 8 ouvriers : 60/8 = 7,5 jours."},
          {question:"Quatrieme proportionnelle de 3, 9 et 5.", reponse:"3/9 = 5/x -> x = (9x5)/3 = 45/3 = 15"},
          {question:"Un robinet remplit un reservoir en 4h. Avec 2 robinets identiques, en combien de temps ?", reponse:"Inversement proportionnel. 1 robinet -> 4h. 2 robinets -> 4/2 = 2h."},
        ]
      },
      { id:"25-3", titre:"Pourcentages et taux d evolution",
        contenu:`DEFINITION :
Le POURCENTAGE exprime une proportion sur 100.
p % signifie p pour cent, soit la fraction p/100.

FORMULES ESSENTIELLES :

1. CALCULER p% D UNE VALEUR V :
Resultat = V x p / 100 = V x (p/100)
Coefficient multiplicateur = p/100

EXEMPLE : 20% de 15 000 FCFA = 15 000 x 20/100 = 3 000 FCFA

2. CALCULER LE POURCENTAGE QUE REPRESENTE a PAR RAPPORT A b :
p% = (a / b) x 100

EXEMPLE : 12 filles sur 30 eleves -> (12/30) x 100 = 40%

3. AUGMENTATION DE p% :
Nouvelle valeur = V x (1 + p/100)
Coefficient multiplicateur = 1 + p/100

EXEMPLE : Article 8 000 FCFA augmente de 15% :
Nouveau prix = 8 000 x 1,15 = 9 200 FCFA

4. REDUCTION DE p% :
Nouvelle valeur = V x (1 - p/100)
Coefficient multiplicateur = 1 - p/100

EXEMPLE : Article 12 000 FCFA solde a -25% :
Prix solde = 12 000 x 0,75 = 9 000 FCFA

5. RETROUVER LA VALEUR INITIALE :
Si V_finale = V_initiale x k, alors V_initiale = V_finale / k

EXEMPLE : Prix apres 20% de hausse = 9 600 FCFA. Prix initial ?
V_initiale = 9 600 / 1,20 = 8 000 FCFA

TAUX D EVOLUTION :
Mesure la variation relative entre une valeur initiale et une valeur finale.

Formule :
Taux = [(V_finale - V_initiale) / V_initiale] x 100%

Taux > 0 -> AUGMENTATION (hausse)
Taux < 0 -> DIMINUTION (baisse)

EXEMPLE :
Population passe de 1 200 000 a 1 500 000.
Taux = [(1 500 000 - 1 200 000) / 1 200 000] x 100 = 25%
-> Augmentation de 25%

POURCENTAGES SUCCESSIFS - PIEGE !
Une hausse de p% SUIVIE d une baisse de p% NE REDONNE PAS la valeur initiale !

DEMONSTRATION :
Prix initial = 10 000 FCFA
+20% -> 10 000 x 1,20 = 12 000 FCFA
-20% -> 12 000 x 0,80 = 9 600 FCFA
Valeur finale = 9 600 DIFFERENT de 10 000 !
Variation globale = -4% (perte !)

CALCUL DE LA VARIATION GLOBALE :
Coefficient global = produit des coefficients multiplicateurs
= 1,20 x 0,80 = 0,96
Variation = (0,96 - 1) x 100 = -4%

POURCENTAGES EN CHAÎNE :
+10% puis +20% puis -5% :
Coefficient = 1,10 x 1,20 x 0,95 = 1,254
Variation globale = +25,4% (et non +25%)

TVA ET PRIX HT/TTC :
Prix TTC = Prix HT x (1 + taux TVA/100)
Prix HT = Prix TTC / (1 + taux TVA/100)

EXEMPLE : TVA au Gabon = 18%
Prix HT = 50 000 FCFA
Prix TTC = 50 000 x 1,18 = 59 000 FCFA

AFRICAIN :
- Soldes fin de saison : -30% sur un pagne a 15 000 FCFA
  Prix solde = 15 000 x 0,70 = 10 500 FCFA
- Croissance population Gabon : 2010 (1,5M) -> 2020 (2,2M)
  Taux = (2,2-1,5)/1,5 x 100 = 46,7%
- Commission vendeur : 5% sur ventes de 800 000 FCFA
  Commission = 800 000 x 0,05 = 40 000 FCFA
- Prix du carburant : +12% en 2023.
  Si prix initial = 500 FCFA/L : nouveau prix = 500 x 1,12 = 560 FCFA/L`,
        exemples:[
          {question:"Calculer 35% de 20 000 FCFA.", reponse:"20 000 x 35/100 = 7 000 FCFA"},
          {question:"Un article passe de 5 000 a 6 500 FCFA. Quel est le taux d augmentation ?", reponse:"Taux = (6 500-5 000)/5 000 x 100 = 1 500/5 000 x 100 = 30%"},
          {question:"Prix apres 20% de hausse = 12 000 FCFA. Quel etait le prix initial ?", reponse:"V_initiale = 12 000 / 1,20 = 10 000 FCFA"},
          {question:"Un prix augmente de 10% puis baisse de 10%. Quelle est la variation globale ?", reponse:"Coefficient = 1,10 x 0,90 = 0,99 -> -1% (perte de 1%, PAS 0% !)"},
        ]
      },
    ],
    exercices:[
      {id:1,  niveau:"Facile",    enonce:"Ce tableau est-il proportionnel ? x: 3, 6, 9 et y: 9, 18, 27", solution:"9/3=3 ; 18/6=3 ; 27/9=3 -> tous egaux -> OUI (k=3)"},
      {id:2,  niveau:"Facile",    enonce:"3 kg de tomates coutent 900 FCFA. Quel est le prix de 5 kg ?", solution:"Regle de trois : (5 x 900) / 3 = 1 500 FCFA"},
      {id:3,  niveau:"Facile",    enonce:"Calculer 20% de 45 000 FCFA.", solution:"45 000 x 20/100 = 9 000 FCFA"},
      {id:4,  niveau:"Facile",    enonce:"18 eleves sur 30 ont la moyenne. Quel pourcentage est-ce ?", solution:"18/30 x 100 = 60%"},
      {id:5,  niveau:"Facile",    enonce:"Un article a 8 000 FCFA est solde a -25%. Quel est son prix final ?", solution:"8 000 x (1-25/100) = 8 000 x 0,75 = 6 000 FCFA"},
      {id:6,  niveau:"Moyen",     enonce:"Completer le tableau de proportionnalite (k=7) : x: 4, ?, 9 et y: ?, 42, ?", solution:"y = k x x : y=28 (4x7), x=6 (42/7), y=63 (9x7)"},
      {id:7,  niveau:"Moyen",     enonce:"8 ouvriers construisent un mur en 15 jours. En combien de jours 12 ouvriers construisent-ils le meme mur ?", solution:"Inversement proportionnel. Produit constant = 8 x 15 = 120. 12 ouvriers : 120/12 = 10 jours."},
      {id:8,  niveau:"Moyen",     enonce:"Un prix passe de 12 000 a 15 000 FCFA. Calculer le taux d augmentation en %.", solution:"Taux = (15 000-12 000)/12 000 x 100 = 3 000/12 000 x 100 = 25%"},
      {id:9,  niveau:"Moyen",     enonce:"1 USD = 600 FCFA. Combien de dollars pour 150 000 FCFA ?", solution:"x = 150 000 / 600 = 250 USD"},
      {id:10, niveau:"Moyen",     enonce:"Recette pour 6 personnes : 450 g de riz, 300 g de poisson, 120 g d oignons. Adapter pour 10 personnes.", solution:"Facteur = 10/6 = 5/3. Riz = 450 x 5/3 = 750 g. Poisson = 300 x 5/3 = 500 g. Oignons = 120 x 5/3 = 200 g."},
      {id:11, niveau:"Difficile", enonce:"Un commercant achete des pagnes a 5 000 FCFA et les revend avec une marge de 30%. Si en plus il applique une TVA de 18%, quel est le prix TTC final ?", solution:"Prix vente HT = 5 000 x 1,30 = 6 500 FCFA. Prix TTC = 6 500 x 1,18 = 7 670 FCFA."},
      {id:12, niveau:"Difficile", enonce:"Un article augmente de 20% en janvier, puis baisse de 15% en juin. Calculer le coefficient global et la variation finale en %.", solution:"Coefficient = 1,20 x 0,85 = 1,02 -> AUGMENTATION globale de 2% (et non 5% !). Le piege des pourcentages successifs."},
      {id:13, niveau:"Difficile", enonce:"Population de Douala : 2 500 000 en 2010 et 3 800 000 en 2020. Calculer le taux de croissance sur 10 ans. A ce rythme, quelle sera la population en 2030 ?", solution:"Taux = (3 800 000-2 500 000)/2 500 000 x 100 = 1 300 000/2 500 000 x 100 = 52%. En 2030 = 3 800 000 x 1,52 = 5 776 000 habitants."},
      {id:14, niveau:"Difficile", enonce:"Un eleve a 72 bonnes reponses sur 90 questions. Quel est son pourcentage de reussite ? Il faut 75% pour passer. A-t-il reussi ? Combien de bonnes reponses lui auraient suffi exactement ?", solution:"72/90 x 100 = 80% >= 75% -> OUI, il a reussi. Minimum requis = 75% x 90 = 67,5 -> 68 bonnes reponses minimales (arrondi superieur). Il avait 4 bonnes reponses de marge."},
      {id:15, niveau:"Difficile", enonce:"AfriLearn avait 500 abonnes en janvier. En mars les abonnes ont augmente de 40%. En mai encore +25%. En juillet une promo a attire 200 abonnes supplementaires. Nombre final ? Taux de croissance global de janvier a juillet ?", solution:"Janv: 500. Mars: 500 x 1,40 = 700. Mai: 700 x 1,25 = 875. Juil: 875+200 = 1 075. Taux global = (1 075-500)/500 x 100 = 115%. Les abonnes ont plus que double ! (de janvier a juillet soit 6 mois)."},
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
  {id:"maths",   name:"Mathématiques",  icon:"🔢", available:true,  subjectId:1},
  {id:"french",  name:"Français",       icon:"📝", available:true,  subjectId:2},
  {id:"svt",     name:"SVT",            icon:"🌿", available:false, subjectId:3},
  {id:"histgeo", name:"Histoire-Géo",   icon:"🌍", available:false, subjectId:4},
  {id:"phys",    name:"Physique-Chimie",icon:"⚗️",  available:false, subjectId:5},
  {id:"english", name:"Anglais",        icon:"🇬🇧", available:false, subjectId:6},
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


// Composant de rendu du contenu de lecon
const LessonContent = ({ content, color }) => {
  if (!content) return null;
  const c = color || "var(--gold)";

  // Formatter le texte brut en ajoutant des sauts de ligne intelligents
  const format = (text) => {
    let t = text;
    // Puces et fleches
    t = t.split("• ").join("\n• ");
    t = t.split("-> ").join("\n-> ");
    // Marqueurs courants
    const markers = [
      "LES CLASSES", "LE NOM", "LE VERBE", "LES MOTS",
      "DEFINITION :", "METHODE :", "EXEMPLES :", "EXEMPLE :",
      "ATTENTION :", "REMARQUE :", "TABLEAU ", "PIEGE ",
      "ETAPE 1", "ETAPE 2", "ETAPE 3", "ETAPE 4", "ETAPE 5",
      "CAS 1", "CAS 2", "CAS 3", "CAS 4",
      "TECHNIQUE 1", "TECHNIQUE 2", "TECHNIQUE 3",
      "FORMATION ", "EMPLOIS ", "TYPES ", "REGLE ",
      "Exemples africains :", "EXEMPLES AFRICAINS :",
      "1. LE ", "2. LE ", "3. LE ", "4. LE ", "5. LE ",
      "1. LA ", "2. LA ", "3. LA ",
      "1. L ", "2. L ", "3. L ",
      "NOM COMMUN", "NOM PROPRE", "MASCULIN", "FEMININ",
      "SINGULIER", "PLURIEL", "VERBE D ACTION", "VERBE D ETAT",
    ];
    markers.forEach(function(m) {
      t = t.split(m).join("\n\n" + m);
    });
    // Nettoyer
    while (t.indexOf("\n\n\n") >= 0) t = t.split("\n\n\n").join("\n\n");
    return t.trim();
  };

  const lines = format(content).split("\n");

  return (
    <div style={{ fontSize:13, lineHeight:1.8, color:"#CBD5E1", fontFamily:"'DM Sans',sans-serif" }}>
      {lines.map(function(line, i) {
        const t = line.trim();
        if (!t) return <div key={i} style={{ height:6 }} />;

        // Puce
        if (t.indexOf("• ") === 0) return (
          <div key={i} style={{ display:"flex", gap:8, paddingLeft:8, marginBottom:3 }}>
            <span style={{ color:c, flexShrink:0 }}>{"•"}</span>
            <span>{t.substring(2)}</span>
          </div>
        );

        // Fleche
        if (t.indexOf("-> ") === 0) return (
          <div key={i} style={{ display:"flex", gap:8, paddingLeft:16, marginBottom:3, color:"#94A3B8" }}>
            <span style={{ color:c }}>{"→"}</span>
            <span>{t.substring(3)}</span>
          </div>
        );

        // Titre de section (tout en majuscules, court)
        const isMaj = t === t.toUpperCase() && t.length > 3 && t.length < 70 && t.split(" ").length < 10;
        if (isMaj) return (
          <div key={i} style={{ fontWeight:700, color:"#F8FAFC", fontSize:12, letterSpacing:"0.05em", marginTop:16, marginBottom:6, borderLeft:"3px solid " + c, paddingLeft:10 }}>
            {t}
          </div>
        );

        // Ligne avec ":" en debut = titre de sous-section
        if (t.endsWith(":") && t.length < 60) return (
          <div key={i} style={{ fontWeight:600, color:"#E2E8F0", marginTop:10, marginBottom:4 }}>
            {t}
          </div>
        );

        // Texte normal
        return <div key={i} style={{ marginBottom:4 }}>{t}</div>;
      })}
    </div>
  );
};

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    if (mode==="register" && !cguAccepted) { setError("Vous devez accepter les CGU pour continuer."); return; }

    // Vérification Super Admin (local)
    if (form.email===SUPER_ADMIN.email && form.password===SUPER_ADMIN.password) {
      onAuth({name:"Super Administrateur", email:form.email, role:"superadmin", plan:"SuperAdmin", country:"Gabon", level:"Admin"});
      return;
    }
    // Vérification Admin (local)
    const admin = ADMIN_ACCOUNTS.find(a => a.email===form.email && a.password===form.password);
    if (admin) { onAuth({...admin, plan:"Admin", country:"Gabon", level:"Admin"}); return; }

    setLoading(true);
    setError("");

    try {
      if (mode==="register") {
        // Inscription via Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              name: form.name || "Élève",
              country: form.country,
              level: form.level,
            }
          }
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Créer le profil dans la table profiles
          await supabase.from("profiles").upsert({
            id: data.user.id,
            name: form.name || "Élève",
            country: form.country,
            level: form.level,
            plan: "Gratuit",
          });
          onAuth({
            id: data.user.id,
            name: form.name || "Élève",
            email: form.email,
            country: form.country,
            level: form.level,
            plan: "Gratuit",
            role: "user",
          });
        }
      } else {
        // Connexion via Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;

        if (data.user) {
          // Charger le profil depuis Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          onAuth({
            id: data.user.id,
            name: profile?.name || "Élève",
            email: form.email,
            country: profile?.country || "Gabon",
            level: profile?.level || "6ème",
            plan: profile?.plan || "Gratuit",
            role: "user",
          });
        }
      }
    } catch (err) {
      // Traduire les erreurs Supabase en français
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) setError("Email ou mot de passe incorrect.");
      else if (msg.includes("User already registered")) setError("Un compte existe déjà avec cet email.");
      else if (msg.includes("Password should be at least")) setError("Le mot de passe doit faire au moins 6 caractères.");
      else if (msg.includes("Unable to validate email")) setError("Adresse email invalide.");
      else setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
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
            <Btn onClick={handleSubmit} color="var(--gold)" style={{ marginTop:4, padding:"14px", fontSize:15, borderRadius:12 }} disabled={loading}>
              {loading ? "Chargement..." : mode==="login" ? "Se connecter" : "Créer mon compte"}
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
const Dashboard = ({user, onNav, stats={completed:0, total:25, percent:0}, progress={}}) => {
  const tp = user.isPreview ? 48 : 0;
  const completedChapters = Object.values(progress).filter(p => p.completed).length;
  const progressPercent = Math.round((completedChapters / 25) * 100);

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
            <p style={{ fontSize:13, color:"var(--muted)" }}>
              {completedChapters === 0 ? "Commence ton premier chapitre !" :
               completedChapters === 25 ? "🎉 Tous les chapitres complétés !" :
               `${completedChapters} chapitre${completedChapters > 1 ? "s" : ""} complété${completedChapters > 1 ? "s" : ""}`}
            </p>
          </div>
          <Chip color={completedChapters > 0 ? "var(--green)" : "var(--muted)"}>{completedChapters} / 25</Chip>
        </div>
        <div style={{ background:"var(--surface2)", borderRadius:999, height:6, overflow:"hidden" }}>
          <div style={{ width:`${progressPercent}%`, height:"100%", background:"linear-gradient(90deg, var(--gold), var(--green))", borderRadius:999, transition:"width 1s ease" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
          <span style={{ fontSize:12, color:"var(--muted)" }}>{progressPercent}% complété</span>
          {completedChapters > 0 && <span style={{ fontSize:12, color:"var(--green)", fontWeight:600 }}>✓ Continuer à progresser !</span>}
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
          <Surface key={s.id} hover={s.available} onClick={s.available?()=>onNav("chapters", s):null} style={{ padding:14, textAlign:"center", opacity:s.available?1:0.45 }}>
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
const Chapters = ({user, onChapter, progress={}, subject={id:'maths', name:'Mathématiques', subjectId:1}}) => {
  const [filter, setFilter] = useState(0);
  const { chapters, parts, loading } = useChapters(1, subject.subjectId || 1);
  const filtered = filter===0 ? chapters : chapters.filter(c => c.part===filter);
  const tp = user.isPreview ? 48 : 0;

  if (loading) return (
    <div style={{ padding:`${24+tp}px 20px`, textAlign:"center" }}>
      <div style={{ marginTop:60 }}>
        <div className="shimmer" style={{ width:200, height:20, borderRadius:8, margin:"0 auto 12px" }}/>
        <div className="shimmer" style={{ width:150, height:14, borderRadius:8, margin:"0 auto" }}/>
        <p style={{ marginTop:20, color:"var(--muted)", fontSize:12 }}>Chargement des chapitres...</p>
      </div>
    </div>
  );

  return (
    <div className="fade" style={{ padding:`${24+tp}px 20px 24px`, maxWidth:800, margin:"0 auto" }}>
      <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, letterSpacing:"-0.02em", marginBottom:4 }}>{subject.icon} {subject.name} <span style={{ color:"var(--gold)" }}>6ème</span></h2>
      <p style={{ color:"var(--muted)", fontSize:13, marginBottom:20 }}>{chapters.length} chapitres · {parts.length} parties</p>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24, overflowX:"auto", paddingBottom:4 }}>
        <Pill active={filter===0} onClick={() => setFilter(0)}>Tout voir</Pill>
        {parts.map(p => <Pill key={p.id} active={filter===p.id} color={p.color} onClick={() => setFilter(p.id)}>{p.icon} {p.name}</Pill>)}
      </div>

      {(filter===0 ? parts : parts.filter(p=>p.id===filter)).map(part => {
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
                const hasContent = !!CHAPTERS_CONTENT[ch.id] || (subject.subjectId || 1) === 2;
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
                    {locked ? <Chip>Essentiel</Chip> : 
                     progress[ch.dbId || ch.id]?.completed ? <span style={{ color:"var(--green)", fontSize:16, fontWeight:700 }}>✅</span> :
                     progress[ch.dbId || ch.id]?.score > 0 ? <Chip color="var(--gold)">{progress[ch.dbId || ch.id].score}/15</Chip> :
                     hasContent ? <span style={{ color:"var(--muted)", fontSize:20 }}>›</span> : 
                     <Chip color="var(--muted)">Soon</Chip>}
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
const ChapterContent = ({chapter, user, onBack, onTutor, onSaveProgress, chapterProgress}) => {
  const [tab, setTab] = useState("cours");
  const [shown, setShown] = useState({});
  const [answeredExos, setAnsweredExos] = useState({});

  // Sauvegarder la visite du chapitre au chargement
  useEffect(() => {
    if (user?.id && chapter?.id && onSaveProgress) {
      const currentScore = chapterProgress?.score || 0;
      onSaveProgress(user.id, chapter.dbId || chapter.id, currentScore, chapterProgress?.completed || false);
    }
  }, [chapter?.id]);

  // Marquer un exercice comme vu et sauvegarder le score
  const handleShowSolution = (exoId) => {
    const isAlreadyShown = shown[exoId];
    
    // Toggle l'affichage
    setShown(s => ({...s, [exoId]: !s[exoId]}));
    
    // Sauvegarder seulement si c'est la première fois qu'on révèle
    if (!isAlreadyShown) {
      const newAnswered = {...answeredExos, [exoId]: true};
      setAnsweredExos(newAnswered);

      // Calculer le nouveau score et sauvegarder
      if (user?.id && activeExercises && onSaveProgress) {
        const score = Object.keys(newAnswered).length;
        const completed = score >= activeExercises.length;
        console.log("Saving progress:", user.id, chapter.id, score, completed);
        onSaveProgress(user.id, chapter.dbId || chapter.id, score, completed);
      }
    }
  };

  // Chargement depuis Supabase (avec fallback sur données statiques)
  const { lessons: dbLessons, exercises: dbExercises, loading: contentLoading } = useChapterContent(chapter.dbId || chapter.id);
  const staticContent = CHAPTERS_CONTENT[chapter.id];

  // Utiliser les données Supabase si disponibles, sinon les données statiques
  const activeLessons = dbLessons || (staticContent ? staticContent.cours : null);
  const activeExercises = dbExercises || (staticContent ? staticContent.exercices : null);
  const activeObjectives = chapter.objectives?.length > 0 ? chapter.objectives : (staticContent ? staticContent.objectives : []);

  const part = PARTS_STATIC.find(p => p.id===chapter.part) || { color: chapter.partColor || 'var(--gold)', icon: chapter.partIcon || '📚', name: chapter.partName || '' };
  const hasPremium = user.plan==="Premium" || user.isPreview;
  const tp = user.isPreview ? 48 : 0;

  // Afficher chargement
  if (contentLoading) return (
    <div style={{ padding:`${24+tp}px 20px`, textAlign:"center" }}>
      <div style={{ marginTop:60 }}>
        <div className="shimmer" style={{ width:250, height:22, borderRadius:8, margin:"0 auto 12px" }}/>
        <div className="shimmer" style={{ width:180, height:14, borderRadius:8, margin:"0 auto 8px" }}/>
        <div className="shimmer" style={{ width:300, height:14, borderRadius:8, margin:"0 auto" }}/>
        <p style={{ marginTop:20, color:"var(--muted)", fontSize:12 }}>Chargement du contenu...</p>
      </div>
    </div>
  );

  if (!activeLessons) return (
    <div style={{ padding:`${24+tp}px 20px`, maxWidth:700, margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"var(--muted)", cursor:"pointer", fontSize:13, marginBottom:16, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:6 }}>← Retour</button>
      <Surface style={{ textAlign:"center", padding:48 }}>
        <p style={{ fontSize:40, marginBottom:16 }}>🚧</p>
        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>Contenu en préparation</h3>
        <p style={{ color:"var(--muted)", fontSize:14 }}>Ce chapitre sera disponible très prochainement.</p>
        <div style={{ marginTop:20 }}><Chip color="var(--gold)">Bientôt disponible</Chip></div>
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
          <p style={{ fontSize:12, color:part.color, fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:4 }}>{chapter.partName || part?.name || "Chapitre"} · Ch. {chapter.id}</p>
          <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>{chapter.title}</h2>
        </div>
      </div>

      {/* Objectives */}
      <Surface style={{ marginBottom:20, padding:18, borderLeft:`3px solid ${part.color}` }}>
        <p style={{ fontSize:11, fontWeight:700, color:part.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Objectifs</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:6 }}>
          {activeObjectives.map((o,i) => (
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
          {activeLessons.map((lecon, idx) => (
            <div key={lecon.id} style={{ marginBottom:32 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:(chapter.partColor || part?.color || "var(--gold)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>{idx+1}</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:600 }}>{lecon.titre}</h3>
              </div>
              <Surface style={{ marginBottom:14, padding:20, borderLeft:`2px solid ${(part?.color || chapter.partColor || 'var(--gold)')}40` }}>
                <LessonContent content={lecon.contenu} color={part.color} />
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
          <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16 }}>{activeExercises.length} exercices — 3 niveaux de difficulté</p>
          {["Facile","Moyen","Difficile"].map(niveau => {
            const exos = activeExercises.filter(e => e.niveau===niveau);
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
                        <Btn onClick={() => handleShowSolution(ex.id)} variant="outline" color={shown[ex.id]?"var(--muted)":"var(--gold)"} style={{ padding:"7px 14px", fontSize:12, flexShrink:0, borderRadius:8 }}>
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
              {activeExercises.map(ex => (
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
  const [currentSubject, setCurrentSubject] = useState({id:"maths", name:"Mathématiques", icon:"🔢", subjectId:1});

  // Vérifier la session au démarrage (approche simple et fiable)
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        // getSession() lit directement le localStorage — instantané
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          // Construire l'user depuis les métadonnées (disponibles immédiatement)
          const u = session.user;
          setUser({
            id: u.id,
            name: u.user_metadata?.name || "Élève",
            email: u.email,
            country: u.user_metadata?.country || "Gabon",
            level: u.user_metadata?.level || "6ème",
            plan: "Gratuit",
            role: "user",
          });
          setScreen("dashboard");

          // Enrichir avec le profil Supabase en arrière-plan (sans bloquer)
          supabase.from("profiles").select("*").eq("id", u.id).single()
            .then(({ data: profile }) => {
              if (mounted && profile) {
                setUser(prev => ({
                  ...prev,
                  name: profile.name || prev.name,
                  country: profile.country || prev.country,
                  level: profile.level || prev.level,
                  plan: profile.plan || prev.plan,
                }));
              }
            });
        } else {
          setScreen("landing");
        }
      } catch (err) {
        console.error("Erreur session:", err);
        if (mounted) setScreen("landing");
      }
    };

    checkSession();

    // Écouter déconnexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        setScreen("landing");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAuth = (form) => {
    setUser(form);
    if (form.role==="superadmin" || form.role==="admin") { setScreen("admin"); return; }
    setScreen("dashboard");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("landing");
  };

  const nav = (s, subject=null) => {
    setChapter(null);
    if (subject) setCurrentSubject(subject);
    setScreen(s);
  };
  const openChapter = (ch) => { setChapter(ch); setScreen("chapterContent"); };
  // ── CINETPAY INTEGRATION ──────────────────────────────────────────────────────
  // ⚠️  Remplacez ces valeurs par vos vraies clés CinetPay quand disponibles
  const CINETPAY_API_KEY  = "VOTRE_API_KEY_CINETPAY";   // Ex: "123456789012345678901234"
  const CINETPAY_SITE_ID  = "VOTRE_SITE_ID_CINETPAY";   // Ex: "123456789"
  const APP_URL           = "https://afrilearn-rust.vercel.app";

  // État du paiement
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [paymentError,   setPaymentError]   = React.useState(null);
  const [paymentSuccess, setPaymentSuccess] = React.useState(false);

  // Vérifier le retour de CinetPay (après redirection)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txId    = params.get("transaction_id");
    const status  = params.get("status");

    if (txId && status === "success") {
      // Paiement réussi — vérifier dans Supabase
      checkPaymentStatus(txId);
      // Nettoyer l'URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Vérifier le statut d'un paiement dans Supabase
  const checkPaymentStatus = async (transactionId) => {
    try {
      const { data } = await supabase
        .from("payments")
        .select("status, plan")
        .eq("transaction_id", transactionId)
        .single();

      if (data?.status === "completed") {
        const planNames = { Essentiel: "Essentiel", Premium: "Premium" };
        setUser(u => ({ ...u, plan: planNames[data.plan] || u.plan }));
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 5000);
      }
    } catch (err) {
      console.error("Erreur vérification paiement:", err);
    }
  };

  // Lancer un paiement CinetPay
  const upgrade = async (planId) => {
    if (planId === "free") return;
    if (!user?.id) { nav("auth"); return; }

    const planConfig = {
      essential: { name: "Essentiel", price: 1995, label: "AfriLearn Essentiel - 1 mois" },
      premium:   { name: "Premium",   price: 2995, label: "AfriLearn Premium - 1 mois" },
    };

    const plan = planConfig[planId];
    if (!plan) return;

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // Générer un ID de transaction unique
      const transactionId = `AFL-${user.id.substring(0,8)}-${Date.now()}`;

      // Enregistrer la tentative de paiement dans Supabase
      const { error: insertError } = await supabase
        .from("payments")
        .insert({
          user_id:        user.id,
          transaction_id: transactionId,
          plan:           plan.name,
          amount:         plan.price,
          currency:       "XAF",
          status:         "pending",
        });

      if (insertError) throw insertError;

      // ── MODE SIMULATION (avant d'avoir les clés CinetPay réelles) ──────────
      // Décommentez ce bloc pour tester sans CinetPay
      if (CINETPAY_API_KEY === "VOTRE_API_KEY_CINETPAY") {
        console.log("⚠️  Mode simulation CinetPay — Remplacez les clés API pour le vrai paiement");
        // Simuler un paiement réussi après 2 secondes
        await new Promise(r => setTimeout(r, 2000));
        setUser(u => ({ ...u, plan: plan.name }));
        await supabase.from("payments").update({ status: "completed" }).eq("transaction_id", transactionId);
        await supabase.from("profiles").update({ plan: plan.name }).eq("id", user.id);
        setPaymentSuccess(true);
        setTimeout(() => setPaymentSuccess(false), 5000);
        setPaymentLoading(false);
        return;
      }
      // ── FIN MODE SIMULATION ──────────────────────────────────────────────────

      // ── VRAI PAIEMENT CINETPAY ───────────────────────────────────────────────
      const response = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey:         CINETPAY_API_KEY,
          site_id:        CINETPAY_SITE_ID,
          transaction_id: transactionId,
          amount:         plan.price,
          currency:       "XAF",
          description:    plan.label,
          notify_url:     `${APP_URL}/api/cinetpay-webhook`,
          return_url:     `${APP_URL}?transaction_id=${transactionId}&status=success`,
          channels:       "ALL",
          lang:           "fr",
          metadata:       JSON.stringify({ user_id: user.id, plan: plan.name }),
          customer_name:  user.name || "Élève",
          customer_email: user.email || "",
          customer_phone_number: "",
          customer_address: "Libreville",
          customer_city:  "Libreville",
          customer_country: "GA",
          customer_state: "GA",
          customer_zip_code: "00225",
          invoice_data: {},
          alternative_currency: "",
        }),
      });

      const data = await response.json();

      if (data.code === "201") {
        // Rediriger vers la page de paiement CinetPay
        window.location.href = data.data.payment_url;
      } else {
        throw new Error(data.message || "Erreur CinetPay");
      }

    } catch (err) {
      console.error("Erreur paiement:", err);
      setPaymentError("Erreur lors du paiement. Veuillez réessayer.");
      setPaymentLoading(false);
    }
  };

  const previewUser = user ? {...user, name:"Super Admin", plan:"Premium", level:"6ème", country:"Gabon", isPreview:true} : null;
  const activeUser = isPreview ? previewUser : user;

  // Suivi de progression
  const { progress, stats, saveProgress } = useProgress(user?.id);

  // Pas d'écran de chargement — on démarre directement sur landing

  return (
    <>
      <style>{css}</style>
      {screen==="landing" && <Landing onEnter={s=>setScreen(s)}/>}
      {screen==="login" && <Auth mode="login" onAuth={handleAuth} onSwitch={()=>setScreen("register")}/>}
      {screen==="register" && <Auth mode="register" onAuth={handleAuth} onSwitch={()=>setScreen("login")}/>}
      {screen==="admin" && !isPreview && user && <SuperAdmin user={user} onLogout={handleLogout} onPreview={()=>{setIsPreview(true);setScreen("dashboard");}}/>}

      {activeUser && !["landing","login","register","admin"].includes(screen) && (
        <div style={{ paddingBottom:80 }}>
          {isPreview && <AdminBar onBack={()=>{setIsPreview(false);setScreen("admin");}}/>}
          <TopBar user={activeUser} screen={screen} onNav={nav}/>
          {screen==="dashboard"      && <Dashboard      user={activeUser} onNav={nav} stats={stats} progress={progress}/>}
          {screen==="chapters"       && <Chapters       user={activeUser} onChapter={openChapter} progress={progress} subject={currentSubject}/>}
          {screen==="chapterContent" && chapter && <ChapterContent chapter={chapter} user={activeUser} onBack={()=>setScreen("chapters")} onTutor={()=>setScreen("tutor")} onSaveProgress={saveProgress} chapterProgress={progress[chapter?.dbId || chapter?.id]}/>}
          {screen==="tutor"          && <Tutor          user={activeUser} chapter={chapter}/>}
          {screen==="competition"    && <Competition    user={activeUser}/>}
          {/* ── NOTIFICATIONS DE PAIEMENT ─────────────────────────────────── */}
      {paymentLoading && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.7)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"var(--surface)", borderRadius:20, padding:32, textAlign:"center", maxWidth:300 }}>
            <div style={{ fontSize:40, marginBottom:16 }}>💳</div>
            <p style={{ fontWeight:700, marginBottom:8 }}>Traitement en cours...</p>
            <p style={{ fontSize:13, color:"var(--muted)" }}>Connexion à CinetPay</p>
          </div>
        </div>
      )}
      {paymentSuccess && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:"var(--green)", color:"#fff", borderRadius:12, padding:"14px 24px", zIndex:9999, fontWeight:700, fontSize:14, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
          ✅ Paiement confirmé ! Votre plan a été activé.
        </div>
      )}
      {paymentError && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:"#E53E3E", color:"#fff", borderRadius:12, padding:"14px 24px", zIndex:9999, fontSize:13, maxWidth:320, textAlign:"center" }}>
          ❌ {paymentError} <button onClick={()=>setPaymentError(null)} style={{ marginLeft:8, background:"none", border:"none", color:"#fff", cursor:"pointer" }}>✕</button>
        </div>
      )}
      {screen==="pricing"        && <Pricing        user={activeUser} onUpgrade={!isPreview?upgrade:null}/>}
          {screen==="profile"        && <Profile        user={activeUser} onLogout={!isPreview?handleLogout:null}/>}
          <NavBar active={screen} onNav={nav}/>
        </div>
      )}
    </>
  );
}
