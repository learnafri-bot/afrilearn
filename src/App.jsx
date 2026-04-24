import { useState, useRef, useEffect } from "react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
const SUPER_ADMIN = { email: "superadmin@afrilearn.com", password: "AfriLearn@2026!", role: "superadmin" };
const ADMIN_ACCOUNTS = [
  { email: "admin@afrilearn.com", password: "Admin@2026!", role: "admin", name: "Administrateur" },
];

const COUNTRIES = ["Gabon","Cameroun","Côte d'Ivoire","Sénégal","RDC","Congo","Bénin","Togo","Burkina Faso","Mali","Niger","Guinée","Madagascar","Rwanda","Burundi","Tchad","Centrafrique","Djibouti","Comores","Maurice"];

const CHAPTERS = [
  { id:1,  part:1, title:"Nombres entiers",           partName:"Nombres & Calculs" },
  { id:2,  part:1, title:"Nombres décimaux",          partName:"Nombres & Calculs" },
  { id:3,  part:1, title:"Arrondir les nombres",      partName:"Nombres & Calculs" },
  { id:4,  part:1, title:"Addition et soustraction",  partName:"Nombres & Calculs" },
  { id:5,  part:1, title:"Multiplication",            partName:"Nombres & Calculs" },
  { id:6,  part:1, title:"Division",                  partName:"Nombres & Calculs" },
  { id:7,  part:1, title:"Priorités opératoires",     partName:"Nombres & Calculs" },
  { id:8,  part:1, title:"Fractions",                 partName:"Nombres & Calculs" },
  { id:9,  part:2, title:"Droites et angles",         partName:"Géométrie plane" },
  { id:10, part:2, title:"Triangles",                 partName:"Géométrie plane" },
  { id:11, part:2, title:"Quadrilatères",             partName:"Géométrie plane" },
  { id:12, part:2, title:"Cercle",                    partName:"Géométrie plane" },
  { id:13, part:2, title:"Symétrie axiale",           partName:"Géométrie plane" },
  { id:14, part:2, title:"Périmètre et aire",         partName:"Géométrie plane" },
  { id:15, part:3, title:"Longueurs",                 partName:"Grandeurs & Mesures" },
  { id:16, part:3, title:"Masses",                    partName:"Grandeurs & Mesures" },
  { id:17, part:3, title:"Durées",                    partName:"Grandeurs & Mesures" },
  { id:18, part:3, title:"Aires",                     partName:"Grandeurs & Mesures" },
  { id:19, part:3, title:"Volumes",                   partName:"Grandeurs & Mesures" },
  { id:20, part:4, title:"Solides",                   partName:"Géométrie dans l'espace" },
  { id:21, part:4, title:"Patrons",                   partName:"Géométrie dans l'espace" },
  { id:22, part:4, title:"Repérage dans l'espace",    partName:"Géométrie dans l'espace" },
  { id:23, part:5, title:"Tableaux et graphiques",    partName:"Données & Statistiques" },
  { id:24, part:5, title:"Moyennes",                  partName:"Données & Statistiques" },
  { id:25, part:5, title:"Proportionnalité",          partName:"Données & Statistiques" },
];

const PARTS = [
  { id:1, name:"Nombres & Calculs",        icon:"🔢", color:"#f59e0b" },
  { id:2, name:"Géométrie plane",          icon:"📐", color:"#3b82f6" },
  { id:3, name:"Grandeurs & Mesures",      icon:"📏", color:"#10b981" },
  { id:4, name:"Géométrie dans l'espace",  icon:"🔷", color:"#8b5cf6" },
  { id:5, name:"Données & Statistiques",   icon:"📊", color:"#ef4444" },
];

const SUBJECTS = [
  { id:"maths",   name:"Mathématiques",  icon:"🔢", available:true  },
  { id:"french",  name:"Français",       icon:"📝", available:false },
  { id:"svt",     name:"SVT",            icon:"🌿", available:false },
  { id:"histgeo", name:"Histoire-Géo",   icon:"🌍", available:false },
  { id:"phys",    name:"Physique-Chimie",icon:"⚗️", available:false },
  { id:"english", name:"Anglais",        icon:"🇬🇧", available:false },
];

const PLANS = [
  { id:"free",      name:"Gratuit",   price:0,    features:["3 leçons d'essai","Tuteur Kodjo limité","Aperçu des exercices"], cta:"Commencer gratuitement", color:"#6b7280" },
  { id:"essential", name:"Essentiel", price:1995, features:["Tous les cours complets","Toutes les matières du niveau","Tuteur Kodjo illimité","Suivi de progression"], cta:"Choisir Essentiel", color:"#f5a623" },
  { id:"premium",   name:"Premium",   price:2995, features:["Tout l'Essentiel","Exercices + Corrigés détaillés","Compétition africaine 🏆","Badges & Trophées","Classement continental"], cta:"Choisir Premium", color:"#10b981", popular:true },
];

const LEADERBOARD = [
  { rank:1, name:"Aminata D.",   country:"🇸🇳", score:9840, badge:"🥇" },
  { rank:2, name:"Kwame A.",     country:"🇨🇮", score:9210, badge:"🥈" },
  { rank:3, name:"Blessing N.",  country:"🇨🇲", score:8990, badge:"🥉" },
  { rank:4, name:"Fatoumata K.", country:"🇲🇱", score:8750, badge:"⭐" },
  { rank:5, name:"Junior M.",    country:"🇨🇩", score:8540, badge:"⭐" },
  { rank:6, name:"Awa T.",       country:"🇧🇯", score:8320, badge:"⭐" },
  { rank:7, name:"Kofi B.",      country:"🇹🇬", score:8100, badge:"⭐" },
  { rank:8, name:"Marie C.",     country:"🇬🇦", score:7980, badge:"⭐" },
];

const FAKE_USERS = [
  { id:1, name:"Aminata Diallo",  email:"aminata@gmail.com", country:"Sénégal",       level:"6ème", plan:"Premium",   joined:"01/04/2026", active:true  },
  { id:2, name:"Jean Mballa",     email:"jean@gmail.com",    country:"Cameroun",      level:"6ème", plan:"Essentiel", joined:"03/04/2026", active:true  },
  { id:3, name:"Marie Obiang",    email:"marie@gmail.com",   country:"Gabon",         level:"6ème", plan:"Gratuit",   joined:"05/04/2026", active:true  },
  { id:4, name:"Kofi Asante",     email:"kofi@gmail.com",    country:"Côte d'Ivoire", level:"6ème", plan:"Premium",   joined:"07/04/2026", active:true  },
  { id:5, name:"Fatoumata Keita", email:"fato@gmail.com",    country:"Mali",          level:"6ème", plan:"Essentiel", joined:"10/04/2026", active:false },
  { id:6, name:"Junior Mutombo",  email:"junior@gmail.com",  country:"RDC",           level:"6ème", plan:"Gratuit",   joined:"12/04/2026", active:true  },
  { id:7, name:"Awa Traoré",      email:"awa@gmail.com",     country:"Bénin",         level:"6ème", plan:"Premium",   joined:"14/04/2026", active:true  },
  { id:8, name:"Blessing Nkomo",  email:"blessing@gmail.com",country:"Congo",         level:"6ème", plan:"Essentiel", joined:"18/04/2026", active:true  },
];

const SYSTEM_PROMPT = `Tu es Kodjo, un tuteur IA bienveillant et encourageant pour AfriLearn, une plateforme éducative africaine. Tu aides des élèves de 6ème dans toute l'Afrique francophone.

Ton style :
- Chaleureux, patient, encourageant
- Tu utilises des exemples tirés de la vie quotidienne africaine (marchés, fruits tropicaux, distances entre villes africaines, monnaies locales en FCFA, etc.)
- Tu poses UNE seule question à la fois
- Tu félicites les bonnes réponses avec enthousiasme
- En cas d'erreur, tu expliques doucement sans décourager
- Tu t'exprimes toujours en français simple et accessible

Tu couvres toutes les matières de 6ème : Maths, Français, SVT, Histoire-Géo, Physique-Chimie, Anglais.
Commence par te présenter et demander le prénom et le pays de l'élève.`;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Sora',sans-serif; background:#060d1a; color:#e8f4f0; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
  .fade-in { animation:fadeIn 0.4s ease forwards; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .pulse { animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .shimmer { background:linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.03) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const inputStyle = {
  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:10, padding:"11px 14px", color:"#e8f4f0", fontSize:13,
  fontFamily:"Sora,sans-serif", outline:"none", width:"100%"
};

// ─── COMPOSANTS DE BASE ───────────────────────────────────────────────────────
const Badge = ({ children, color="#f5a623" }) => (
  <span style={{ background:`${color}22`, color, border:`1px solid ${color}44`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:600 }}>{children}</span>
);

const Card = ({ children, style={}, onClick }) => (
  <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20, cursor:onClick?"pointer":"default", transition:"all 0.2s", ...style }}
    onMouseEnter={e => onClick&&(e.currentTarget.style.background="rgba(255,255,255,0.06)")}
    onMouseLeave={e => onClick&&(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
  >{children}</div>
);

const Btn = ({ children, onClick, color="#f5a623", outline=false, disabled=false, style={} }) => (
  <button onClick={onClick} disabled={disabled} style={{ background:outline?"transparent":disabled?"#333":color, color:outline?color:disabled?"#666":"#fff", border:outline?`1.5px solid ${color}`:"none", borderRadius:10, padding:"10px 20px", fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:13, cursor:disabled?"not-allowed":"pointer", transition:"all 0.2s", ...style }}>{children}</button>
);

const filterBtn = (active, color="#f5a623") => ({
  background:active?`${color}22`:"rgba(255,255,255,0.04)", color:active?color:"#7a9e8e",
  border:active?`1px solid ${color}44`:"1px solid rgba(255,255,255,0.07)",
  borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:600,
  cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.2s"
});

const Footer = () => (
  <div style={{ textAlign:"center", padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.05)", marginTop:24 }}>
    <p style={{ fontSize:11, color:"#334155" }}>© {new Date().getFullYear()} AfriLearn — Tous droits réservés.</p>
    <p style={{ fontSize:10, color:"#1e293b", marginTop:3 }}>Contenu protégé par le droit d'auteur. Reproduction interdite sans autorisation.</p>
  </div>
);

// ─── CGU MODAL ───────────────────────────────────────────────────────────────
const CGUModal = ({ onAccept, onDecline }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
    <div style={{ background:"#0c1829", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, maxWidth:540, width:"100%", maxHeight:"80vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <h3 style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, color:"#f5a623" }}>📜 Conditions Générales d'Utilisation</h3>
        <p style={{ color:"#7a9e8e", fontSize:12, marginTop:4 }}>Veuillez lire attentivement avant de continuer</p>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", fontSize:12, lineHeight:1.8, color:"#9ca3af" }}>
        {[
          ["1. Objet", "AfriLearn est une plateforme éducative numérique destinée aux élèves d'Afrique francophone. L'utilisation de cette plateforme implique l'acceptation pleine et entière des présentes CGU."],
          ["2. Propriété intellectuelle", "L'ensemble des contenus disponibles sur AfriLearn (cours, exercices, corrigés, illustrations, logo, nom de marque) sont la propriété exclusive d'AfriLearn et sont protégés par les lois relatives au droit d'auteur. Toute reproduction, copie, distribution ou exploitation commerciale sans autorisation écrite préalable est strictement interdite."],
          ["3. Abonnements et paiements", "Les abonnements sont mensuels et renouvelables. Le paiement s'effectue via Mobile Money ou carte bancaire via CinetPay. Aucun remboursement ne sera effectué après accès au contenu."],
          ["4. Tuteur IA Kodjo", "Le tuteur Kodjo est fourni à titre pédagogique. AfriLearn ne saurait être tenu responsable des erreurs éventuelles du tuteur IA. Il est recommandé de croiser les informations avec un enseignant qualifié."],
          ["5. Données personnelles", "AfriLearn collecte uniquement les données nécessaires au fonctionnement du service (nom, email, pays, niveau). Ces données ne sont jamais vendues à des tiers."],
          ["6. Comportement des utilisateurs", "Tout comportement abusif, triche dans les compétitions, ou tentative de contournement du système d'abonnement entraînera la suspension immédiate du compte sans remboursement."],
          ["7. Droit applicable", "Les présentes CGU sont soumises au droit gabonais. Tout litige sera soumis aux tribunaux compétents de Libreville, Gabon."],
        ].map(([t,c]) => (
          <div key={t} style={{ marginBottom:16 }}>
            <p style={{ fontWeight:700, color:"#e8f4f0", marginBottom:6 }}>{t}</p>
            <p>{c}</p>
          </div>
        ))}
      </div>
      <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:10 }}>
        <Btn onClick={onDecline} outline color="#6b7280" style={{ flex:1 }}>Refuser</Btn>
        <Btn onClick={onAccept} color="#f5a623" style={{ flex:1 }}>✓ J'accepte</Btn>
      </div>
    </div>
  </div>
);

// ─── LANDING ─────────────────────────────────────────────────────────────────
const Landing = ({ onEnter }) => (
  <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center", position:"relative", overflow:"hidden" }}>
    <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,166,35,0.08) 0%,transparent 70%)", top:"10%", left:"10%", pointerEvents:"none" }} />
    <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)", bottom:"15%", right:"10%", pointerEvents:"none" }} />
    <div className="fade-in" style={{ maxWidth:560 }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🌍</div>
      <h1 style={{ fontFamily:"'Crimson Pro',serif", fontSize:"clamp(2.4rem,6vw,3.8rem)", fontWeight:600, background:"linear-gradient(135deg,#f5a623 0%,#22c55e 60%,#3b82f6 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.15, marginBottom:16 }}>AfriLearn</h1>
      <p style={{ color:"#7a9e8e", fontSize:16, lineHeight:1.7, marginBottom:12 }}>La première plateforme d'apprentissage IA dédiée aux élèves d'<strong style={{ color:"#e8f4f0" }}>Afrique francophone</strong>.</p>
      <p style={{ color:"#556b5e", fontSize:14, marginBottom:36 }}>Du 6ème à la Terminale · Cours · Exercices · Compétition africaine</p>
      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", marginBottom:48 }}>
        <Btn onClick={() => onEnter("register")} color="#f5a623" style={{ padding:"13px 28px", fontSize:14 }}>Commencer gratuitement →</Btn>
        <Btn onClick={() => onEnter("login")} outline color="#f5a623" style={{ padding:"13px 28px", fontSize:14 }}>Se connecter</Btn>
      </div>
      <div style={{ display:"flex", gap:32, justifyContent:"center", flexWrap:"wrap" }}>
        {[["20+","Pays francophones"],["25","Chapitres Maths 6ème"],["100%","Contexte africain"]].map(([n,l]) => (
          <div key={l}><div style={{ fontSize:22, fontWeight:700, color:"#f5a623" }}>{n}</div><div style={{ fontSize:11, color:"#556b5e", marginTop:2 }}>{l}</div></div>
        ))}
      </div>
    </div>
    <div style={{ position:"absolute", bottom:16, fontSize:11, color:"#1e293b" }}>© {new Date().getFullYear()} AfriLearn — Tous droits réservés</div>
  </div>
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = ({ mode, onAuth, onSwitch }) => {
  const [form, setForm] = useState({ name:"", email:"", country:"Gabon", password:"", level:"6ème" });
  const [showCGU, setShowCGU] = useState(false);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.email || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    if (mode==="register" && !cguAccepted) { setError("Vous devez accepter les CGU."); return; }
    if (form.email===SUPER_ADMIN.email && form.password===SUPER_ADMIN.password) { onAuth({ name:"Super Administrateur", email:form.email, role:"superadmin", plan:"SuperAdmin", country:"Gabon", level:"Admin" }); return; }
    const admin = ADMIN_ACCOUNTS.find(a => a.email===form.email && a.password===form.password);
    if (admin) { onAuth({ ...admin, plan:"Admin", country:"Gabon", level:"Admin" }); return; }
    onAuth({ name:form.name||"Élève", email:form.email, country:form.country, level:form.level, plan:"Gratuit", role:"user" });
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      {showCGU && <CGUModal onAccept={() => { setCguAccepted(true); setShowCGU(false); }} onDecline={() => setShowCGU(false)} />}
      <div className="fade-in" style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🌍</div>
          <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:28, fontWeight:600, color:"#f5a623" }}>{mode==="login"?"Bon retour !":"Rejoindre AfriLearn"}</h2>
          <p style={{ color:"#556b5e", fontSize:13, marginTop:6 }}>{mode==="login"?"Content de te revoir 👋":"Commence ton aventure éducative"}</p>
        </div>
        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && <input placeholder="Ton prénom" value={form.name} onChange={e => setForm({...form,name:e.target.value})} style={inputStyle} />}
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} style={inputStyle} />
            <input placeholder="Mot de passe" type="password" value={form.password} onChange={e => setForm({...form,password:e.target.value})} style={inputStyle} />
            {mode==="register" && <>
              <select value={form.country} onChange={e => setForm({...form,country:e.target.value})} style={inputStyle}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.level} onChange={e => setForm({...form,level:e.target.value})} style={inputStyle}>
                {["6ème","5ème","4ème","3ème","2nde","1ère","Terminale"].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <label style={{ fontSize:12, color:"#7a9e8e", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <input type="checkbox" checked={cguAccepted} onChange={e => setCguAccepted(e.target.checked)} />
                J'accepte les <span onClick={() => setShowCGU(true)} style={{ color:"#f5a623", cursor:"pointer", textDecoration:"underline" }}>Conditions Générales d'Utilisation</span>
              </label>
            </>}
            {error && <p style={{ color:"#ef4444", fontSize:12 }}>{error}</p>}
            <Btn onClick={handleSubmit} color="#f5a623" style={{ marginTop:4, padding:"13px", fontSize:14 }}>{mode==="login"?"Se connecter →":"Créer mon compte →"}</Btn>
          </div>
        </Card>
        <p style={{ textAlign:"center", marginTop:20, color:"#556b5e", fontSize:13 }}>
          {mode==="login"?"Pas encore de compte ? ":"Déjà un compte ? "}
          <span onClick={onSwitch} style={{ color:"#f5a623", cursor:"pointer", fontWeight:600 }}>{mode==="login"?"S'inscrire":"Se connecter"}</span>
        </p>
        <p style={{ textAlign:"center", marginTop:24, fontSize:11, color:"#1e293b" }}>© {new Date().getFullYear()} AfriLearn — Tous droits réservés</p>
      </div>
    </div>
  );
};

// ─── SUPER ADMIN ──────────────────────────────────────────────────────────────
const SuperAdmin = ({ user, onLogout }) => {
  const [tab, setTab] = useState("dashboard");
  const [users, setUsers] = useState(FAKE_USERS);
  const stats = {
    total:users.length,
    premium:users.filter(u=>u.plan==="Premium").length,
    essential:users.filter(u=>u.plan==="Essentiel").length,
    free:users.filter(u=>u.plan==="Gratuit").length,
    revenue:users.filter(u=>u.plan==="Premium").length*2995+users.filter(u=>u.plan==="Essentiel").length*1995,
  };
  const tabs = [
    {id:"dashboard",label:"📊 Tableau de bord"},
    {id:"users",    label:"👥 Utilisateurs"},
    {id:"content",  label:"📚 Contenu"},
    {id:"admins",   label:"👑 Admins"},
    {id:"finance",  label:"💰 Finances"},
    {id:"settings", label:"⚙️ Paramètres"},
  ];
  return (
    <div style={{ minHeight:"100vh", display:"flex" }}>
      <div style={{ width:220, background:"rgba(0,0,0,0.4)", borderRight:"1px solid rgba(255,255,255,0.07)", padding:"20px 0", display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"0 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize:22, marginBottom:4 }}>🌍</div>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, color:"#f5a623", fontWeight:600 }}>AfriLearn</div>
          <Badge color={user.role==="superadmin"?"#f5a623":"#3b82f6"}>{user.role==="superadmin"?"Super Admin":"Admin"}</Badge>
        </div>
        <div style={{ flex:1, padding:"16px 12px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:10, background:tab===t.id?"rgba(245,166,35,0.12)":"transparent", color:tab===t.id?"#f5a623":"#7a9e8e", border:"none", cursor:"pointer", fontFamily:"Sora,sans-serif", fontSize:12, fontWeight:tab===t.id?600:400, marginBottom:4, transition:"all 0.2s" }}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize:11, color:"#556b5e", marginBottom:8 }}>{user.email}</div>
          <Btn onClick={onLogout} outline color="#ef4444" style={{ width:"100%", padding:"8px", fontSize:11 }}>Déconnexion</Btn>
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:24 }}>
        {tab==="dashboard" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, marginBottom:20 }}>📊 Tableau de bord</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
              {[
                {label:"Utilisateurs total", value:stats.total,                              color:"#3b82f6", icon:"👥"},
                {label:"Abonnés Premium",    value:stats.premium,                            color:"#22c55e", icon:"⭐"},
                {label:"Abonnés Essentiel",  value:stats.essential,                          color:"#f5a623", icon:"📚"},
                {label:"Comptes gratuits",   value:stats.free,                               color:"#6b7280", icon:"🆓"},
                {label:"Revenus du mois",    value:`${stats.revenue.toLocaleString()} FCFA`, color:"#f5a623", icon:"💰"},
                {label:"Pays représentés",   value:"8",                                      color:"#8b5cf6", icon:"🌍"},
              ].map(s => (
                <Card key={s.label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"#556b5e", marginTop:4 }}>{s.label}</div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12 }}>📈 Activité récente</div>
              {[
                {action:"Nouvel abonné Premium",       detail:"Aminata D. — Sénégal",   time:"Il y a 2h", color:"#22c55e"},
                {action:"Nouvelle inscription",        detail:"Jean M. — Cameroun",     time:"Il y a 4h", color:"#3b82f6"},
                {action:"Upgrade Essentiel → Premium", detail:"Marie O. — Gabon",       time:"Il y a 6h", color:"#f5a623"},
                {action:"Nouvelle inscription",        detail:"Kofi A. — Côte d'Ivoire",time:"Il y a 8h", color:"#3b82f6"},
              ].map((a,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:i<3?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <div><div style={{ fontSize:13, fontWeight:600, color:a.color }}>{a.action}</div><div style={{ fontSize:11, color:"#556b5e" }}>{a.detail}</div></div>
                  <div style={{ fontSize:11, color:"#334155" }}>{a.time}</div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="users" && (
          <div className="fade-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24 }}>👥 Gestion des utilisateurs</h2>
              <Badge color="#3b82f6">{users.length} utilisateurs</Badge>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 6px", fontSize:12 }}>
                <thead><tr style={{ color:"#556b5e" }}>{["Nom","Email","Pays","Niveau","Plan","Inscrit","Statut","Actions"].map(h=><th key={h} style={{ padding:"8px 12px", textAlign:"left", fontWeight:600 }}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ background:"rgba(255,255,255,0.02)" }}>
                      <td style={{ padding:"10px 12px", borderRadius:"8px 0 0 8px", fontWeight:600 }}>{u.name}</td>
                      <td style={{ padding:"10px 12px", color:"#7a9e8e" }}>{u.email}</td>
                      <td style={{ padding:"10px 12px" }}>{u.country}</td>
                      <td style={{ padding:"10px 12px" }}>{u.level}</td>
                      <td style={{ padding:"10px 12px" }}><Badge color={u.plan==="Premium"?"#22c55e":u.plan==="Essentiel"?"#f5a623":"#6b7280"}>{u.plan}</Badge></td>
                      <td style={{ padding:"10px 12px", color:"#556b5e" }}>{u.joined}</td>
                      <td style={{ padding:"10px 12px" }}><span style={{ color:u.active?"#22c55e":"#ef4444", fontSize:11 }}>{u.active?"● Actif":"● Inactif"}</span></td>
                      <td style={{ padding:"10px 12px", borderRadius:"0 8px 8px 0" }}>
                        <button onClick={() => setUsers(users.map(x=>x.id===u.id?{...x,active:!x.active}:x))} style={{ background:"rgba(255,255,255,0.05)", border:"none", color:u.active?"#ef4444":"#22c55e", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:11, fontFamily:"Sora,sans-serif" }}>{u.active?"Suspendre":"Activer"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab==="content" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, marginBottom:20 }}>📚 Gestion du contenu</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:20 }}>
              {SUBJECTS.map(s => (
                <Card key={s.id} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:8 }}>{s.name}</div>
                  <Badge color={s.available?"#22c55e":"#6b7280"}>{s.available?"Publié":"À venir"}</Badge>
                  <div style={{ marginTop:12 }}><Btn color="#f5a623" style={{ padding:"6px 14px", fontSize:11 }}>Gérer</Btn></div>
                </Card>
              ))}
            </div>
          </div>
        )}
        {tab==="admins" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, marginBottom:20 }}>👑 Gestion des administrateurs</h2>
            <Card style={{ marginBottom:16, border:"1px solid rgba(245,166,35,0.2)" }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:"#f5a623" }}>⚡ Super Administrateur</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div><div style={{ fontWeight:600 }}>Super Administrateur</div><div style={{ fontSize:12, color:"#7a9e8e" }}>{SUPER_ADMIN.email}</div></div>
                <Badge color="#f5a623">Accès total</Badge>
              </div>
            </Card>
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>🛡️ Administrateurs</div>
                <Btn color="#22c55e" style={{ padding:"6px 14px", fontSize:11 }}>+ Ajouter</Btn>
              </div>
              {ADMIN_ACCOUNTS.map((a,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                  <div><div style={{ fontWeight:600, fontSize:13 }}>{a.name}</div><div style={{ fontSize:11, color:"#7a9e8e" }}>{a.email}</div></div>
                  <div style={{ display:"flex", gap:8 }}><Badge color="#3b82f6">Admin</Badge><Btn outline color="#ef4444" style={{ padding:"4px 10px", fontSize:10 }}>Supprimer</Btn></div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="finance" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, marginBottom:20 }}>💰 Finances</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:20 }}>
              {[
                {label:"Revenus ce mois",  value:`${stats.revenue.toLocaleString()} FCFA`, color:"#22c55e", icon:"💵"},
                {label:"Abonnés payants",  value:stats.premium+stats.essential,            color:"#f5a623", icon:"👥"},
                {label:"Ticket moyen",     value:"2 350 FCFA",                             color:"#3b82f6", icon:"📊"},
                {label:"Taux conversion",  value:"62%",                                    color:"#8b5cf6", icon:"📈"},
              ].map(s => (
                <Card key={s.label} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"#556b5e", marginTop:4 }}>{s.label}</div>
                </Card>
              ))}
            </div>
            <Card>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>💳 Tarifs actuels</div>
              {PLANS.filter(p=>p.price>0).map(p => (
                <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div><div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div><div style={{ fontSize:11, color:"#7a9e8e" }}>Abonnement mensuel</div></div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontWeight:700, color:p.color }}>{p.price.toLocaleString()} FCFA/mois</span>
                    <Btn color="#f5a623" style={{ padding:"5px 12px", fontSize:11 }}>Modifier</Btn>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="settings" && (
          <div className="fade-in">
            <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, marginBottom:20 }}>⚙️ Paramètres</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                {label:"🔑 Changer le mot de passe Super Admin", desc:"Modifier les identifiants de connexion"},
                {label:"🌍 Gérer les pays disponibles",         desc:"Activer ou désactiver des pays"},
                {label:"📱 Configuration CinetPay",             desc:"Clés API et paramètres de paiement"},
                {label:"🤖 Configuration Kodjo (IA)",           desc:"Paramètres du tuteur IA"},
                {label:"📧 Notifications email",                desc:"Alertes et emails automatiques"},
                {label:"🛡️ Sécurité et accès",                  desc:"Journaux de connexion, sessions actives"},
              ].map(s => (
                <Card key={s.label} onClick={() => {}} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div><div style={{ fontWeight:600, fontSize:13 }}>{s.label}</div><div style={{ fontSize:11, color:"#556b5e", marginTop:4 }}>{s.desc}</div></div>
                  <span style={{ color:"#556b5e" }}>›</span>
                </Card>
              ))}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

// ─── DASHBOARD ÉLÈVE ─────────────────────────────────────────────────────────
const Dashboard = ({ user, onNav }) => {
  const pct = Math.round((4/25)*100);
  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:800, margin:"0 auto" }}>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:600 }}>Bonjour, <span style={{ color:"#f5a623" }}>{user.name}</span> 👋</h2>
        <p style={{ color:"#7a9e8e", fontSize:13, marginTop:4 }}>{user.level} · {user.country} · Plan {user.plan}</p>
      </div>
      <Card style={{ marginBottom:20, background:"linear-gradient(135deg,rgba(245,166,35,0.08),rgba(34,197,94,0.05))" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontWeight:600, fontSize:14 }}>📐 Maths 6ème — Progression</span>
          <Badge color="#f5a623">4/25 chapitres</Badge>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:999, height:8, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#f5a623,#22c55e)", borderRadius:999 }} />
        </div>
        <p style={{ color:"#556b5e", fontSize:12, marginTop:8 }}>{pct}% complété</p>
      </Card>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:24 }}>
        {[
          {icon:"📖", label:"Continuer le cours", color:"#f5a623", action:()=>onNav("chapters")},
          {icon:"🤖", label:"Parler à Kodjo",     color:"#3b82f6", action:()=>onNav("tutor")},
          {icon:"🏆", label:"Compétition",         color:"#22c55e", action:()=>onNav("competition"), premium:true},
          {icon:"💳", label:"Mon abonnement",      color:"#8b5cf6", action:()=>onNav("pricing")},
        ].map(item => (
          <Card key={item.label} onClick={item.action} style={{ textAlign:"center", padding:16, position:"relative" }}>
            {item.premium&&user.plan!=="Premium"&&<div style={{ position:"absolute", top:8, right:8 }}><Badge color="#22c55e">Premium</Badge></div>}
            <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, color:item.color }}>{item.label}</div>
          </Card>
        ))}
      </div>
      <h3 style={{ fontSize:13, fontWeight:700, color:"#7a9e8e", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Matières disponibles</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10 }}>
        {SUBJECTS.map(s => (
          <Card key={s.id} onClick={s.available?()=>onNav("chapters"):null} style={{ textAlign:"center", padding:14, opacity:s.available?1:0.4 }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:12, fontWeight:600 }}>{s.name}</div>
            <div style={{ fontSize:10, color:s.available?"#22c55e":"#556b5e", marginTop:4 }}>{s.available?"● Disponible":"Bientôt"}</div>
          </Card>
        ))}
      </div>
      <Footer />
    </div>
  );
};

// ─── CHAPTERS ────────────────────────────────────────────────────────────────
const Chapters = ({ user, onChapter }) => {
  const [filter, setFilter] = useState(0);
  const filtered = filter===0?CHAPTERS:CHAPTERS.filter(c=>c.part===filter);
  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:800, margin:"0 auto" }}>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, fontWeight:600, marginBottom:4 }}>📐 Mathématiques — <span style={{ color:"#f5a623" }}>6ème</span></h2>
      <p style={{ color:"#7a9e8e", fontSize:13, marginBottom:20 }}>25 chapitres · 5 parties</p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        <button onClick={() => setFilter(0)} style={filterBtn(filter===0)}>Tous</button>
        {PARTS.map(p => <button key={p.id} onClick={() => setFilter(p.id)} style={filterBtn(filter===p.id,p.color)}>{p.icon} {p.name}</button>)}
      </div>
      {(filter===0?PARTS:PARTS.filter(p=>p.id===filter)).map(part => {
        const chs = filtered.filter(c=>c.part===part.id);
        if (!chs.length) return null;
        return (
          <div key={part.id} style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:18 }}>{part.icon}</span>
              <span style={{ fontWeight:700, fontSize:13, color:part.color, letterSpacing:"0.04em", textTransform:"uppercase" }}>{part.name}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {chs.map(ch => {
                const locked = user.plan==="Gratuit"&&ch.id>3;
                return (
                  <div key={ch.id} onClick={() => !locked&&onChapter(ch)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, cursor:locked?"not-allowed":"pointer", opacity:locked?0.45:1, transition:"all 0.2s" }}
                    onMouseEnter={e => !locked&&(e.currentTarget.style.background="rgba(255,255,255,0.06)")}
                    onMouseLeave={e => !locked&&(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
                  >
                    <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:locked?"rgba(255,255,255,0.05)":`${part.color}22`, fontSize:13, fontWeight:700, color:locked?"#556b5e":part.color, flexShrink:0 }}>{locked?"🔒":ch.id}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{ch.title}</div>
                      <div style={{ fontSize:11, color:"#556b5e", marginTop:2 }}>{locked?"Abonnement requis":"Cours · Exercices · Tuteur Kodjo"}</div>
                    </div>
                    {locked?<Badge color="#f5a623">Essentiel</Badge>:<span style={{ color:"#556b5e" }}>›</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Footer />
    </div>
  );
};

// ─── CHAPTER DETAIL ───────────────────────────────────────────────────────────
const ChapterDetail = ({ chapter, user, onBack, onTutor }) => {
  const part = PARTS.find(p=>p.id===chapter.part);
  const hasPremium = user.plan==="Premium";
  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:700, margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#7a9e8e", cursor:"pointer", fontSize:13, marginBottom:16, fontFamily:"Sora,sans-serif" }}>← Retour</button>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${part.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{part.icon}</div>
        <div>
          <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, fontWeight:600 }}>{chapter.title}</h2>
          <p style={{ color:"#7a9e8e", fontSize:12 }}>{part.name} · Chapitre {chapter.id}</p>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <Card style={{ borderLeft:`3px solid ${part.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📖 Cours complet</div><div style={{ color:"#7a9e8e", fontSize:12 }}>Leçon · Définitions · Exemples africains</div></div>
            <Btn color={part.color} style={{ padding:"8px 16px", fontSize:12 }}>Lire</Btn>
          </div>
        </Card>
        <Card style={{ borderLeft:`3px solid ${hasPremium?"#22c55e":"#333"}`, opacity:hasPremium?1:0.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>✏️ Exercices {!hasPremium&&"🔒"}</div><div style={{ color:"#7a9e8e", fontSize:12 }}>15 exercices gradués</div></div>
            {hasPremium?<Btn color="#22c55e" style={{ padding:"8px 16px", fontSize:12 }}>Pratiquer</Btn>:<Badge color="#22c55e">Premium</Badge>}
          </div>
        </Card>
        <Card style={{ borderLeft:`3px solid ${hasPremium?"#3b82f6":"#333"}`, opacity:hasPremium?1:0.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>✅ Corrigés {!hasPremium&&"🔒"}</div><div style={{ color:"#7a9e8e", fontSize:12 }}>Solutions étape par étape</div></div>
            {hasPremium?<Btn color="#3b82f6" style={{ padding:"8px 16px", fontSize:12 }}>Voir</Btn>:<Badge color="#22c55e">Premium</Badge>}
          </div>
        </Card>
        <Card style={{ borderLeft:"3px solid #f5a623", background:"rgba(245,166,35,0.05)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🤖 Tuteur Kodjo</div><div style={{ color:"#7a9e8e", fontSize:12 }}>Pratique interactive IA</div></div>
            <Btn color="#f5a623" onClick={onTutor} style={{ padding:"8px 16px", fontSize:12 }}>Démarrer</Btn>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

// ─── TUTOR ───────────────────────────────────────────────────────────────────
const Tutor = ({ user, chapter }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);
  useEffect(() => { if (messages.length===0) startChat(); }, []);
  const startChat = async () => {
    setLoading(true);
    const context = chapter?`Le sujet du jour est : ${chapter.title} en Maths 6ème.`:"Aide l'élève sur n'importe quelle matière de 6ème.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT+"\n\n"+context,messages:[{role:"user",content:"Bonjour Kodjo !"}]})});
      const data = await res.json();
      const reply = data.content?.[0]?.text||"Bonjour ! Je suis Kodjo. Comment tu t'appelles ?";
      setHistory([{role:"user",content:"Bonjour Kodjo !"},{role:"assistant",content:reply}]);
      setMessages([{role:"assistant",content:reply}]);
    } catch { setMessages([{role:"assistant",content:"Bonjour ! Je suis Kodjo, ton tuteur AfriLearn. Comment tu t'appelles ?"}]); }
    setLoading(false);
  };
  const send = async () => {
    if (!input.trim()||loading) return;
    const text = input.trim(); setInput("");
    const newMsgs = [...messages,{role:"user",content:text}];
    setMessages(newMsgs);
    const newHist = [...history,{role:"user",content:text}];
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYSTEM_PROMPT,messages:newHist})});
      const data = await res.json();
      const reply = data.content?.[0]?.text||"Je n'ai pas bien compris. Peux-tu reformuler ?";
      setMessages([...newMsgs,{role:"assistant",content:reply}]);
      setHistory([...newHist,{role:"assistant",content:reply}]);
    } catch { setMessages([...newMsgs,{role:"assistant",content:"Oups, une erreur. Réessaie !"}]); }
    setLoading(false);
  };
  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)", maxWidth:700, margin:"0 auto", padding:"0 20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🦅</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"#f5a623" }}>Kodjo — Tuteur IA AfriLearn</div>
          <div style={{ fontSize:11, color:loading?"#f5a623":"#22c55e" }} className={loading?"pulse":""}>{loading?"En train d'écrire...":"● En ligne"}</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 0", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((msg,i) => (
          <div key={i} style={{ display:"flex", gap:10, justifyContent:msg.role==="assistant"?"flex-start":"flex-end" }}>
            {msg.role==="assistant"&&<div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🦅</div>}
            <div style={{ maxWidth:"75%", padding:"10px 14px", fontSize:13, lineHeight:1.7, background:msg.role==="assistant"?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#1e6b3c,#166534)", borderRadius:msg.role==="assistant"?"4px 16px 16px 16px":"16px 4px 16px 16px", color:"#e8f4f0", border:"1px solid rgba(255,255,255,0.06)" }}>{msg.content}</div>
          </div>
        ))}
        {loading&&<div style={{ display:"flex", gap:10 }}><div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🦅</div><div style={{ padding:"10px 16px", background:"rgba(255,255,255,0.05)", borderRadius:"4px 16px 16px 16px" }}><span className="shimmer" style={{ display:"inline-block", width:60, height:12, borderRadius:6 }} /></div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding:"12px 0", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:10 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pose ta question à Kodjo..." style={{...inputStyle,flex:1}} />
        <Btn onClick={send} disabled={loading||!input.trim()} color="#f5a623" style={{ padding:"11px 18px" }}>↗</Btn>
      </div>
      <div style={{ textAlign:"center", padding:"6px 0", fontSize:10, color:"#1e293b" }}>© {new Date().getFullYear()} AfriLearn — Contenu protégé par le droit d'auteur</div>
    </div>
  );
};

// ─── COMPETITION ─────────────────────────────────────────────────────────────
const Competition = ({ user }) => {
  const isPremium = user.plan==="Premium";
  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🏆</div>
        <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:600 }}>Compétition Africaine</h2>
        <p style={{ color:"#7a9e8e", fontSize:13, marginTop:6 }}>Défie les meilleurs élèves de toute l'Afrique francophone</p>
      </div>
      {!isPremium?(
        <Card style={{ textAlign:"center", padding:32, border:"1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>Fonctionnalité Premium</h3>
          <p style={{ color:"#7a9e8e", fontSize:13, marginBottom:20, lineHeight:1.7 }}>Disponible avec le plan Premium à <strong style={{ color:"#22c55e" }}>2 995 FCFA/mois</strong>.</p>
          <Badge color="#22c55e">Passer en Premium</Badge>
        </Card>
      ):(<>
        <Card style={{ marginBottom:16, background:"linear-gradient(135deg,rgba(34,197,94,0.08),rgba(59,130,246,0.05))", border:"1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><Badge color="#22c55e">🔴 En direct</Badge><div style={{ fontWeight:700, fontSize:15, marginTop:8 }}>Défi Maths — Fractions</div><div style={{ color:"#7a9e8e", fontSize:12, marginTop:4 }}>247 élèves · Se termine dans 2h</div></div>
            <Btn color="#22c55e" style={{ padding:"10px 18px", fontSize:12 }}>Participer</Btn>
          </div>
        </Card>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#7a9e8e", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>🌍 Classement continental</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {LEADERBOARD.map(p => (
            <div key={p.rank} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:p.rank<=3?"rgba(245,166,35,0.06)":"rgba(255,255,255,0.02)", border:p.rank<=3?"1px solid rgba(245,166,35,0.2)":"1px solid rgba(255,255,255,0.06)", borderRadius:12 }}>
              <div style={{ width:28, textAlign:"center", fontSize:16 }}>{p.badge}</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:13 }}>{p.name} {p.country}</div></div>
              <div style={{ fontWeight:700, fontSize:13, color:"#f5a623" }}>{p.score.toLocaleString()} pts</div>
            </div>
          ))}
        </div>
        <Card style={{ marginTop:16, textAlign:"center", border:"1px solid rgba(59,130,246,0.2)" }}>
          <div style={{ color:"#7a9e8e", fontSize:12, marginBottom:4 }}>Ton classement</div>
          <div style={{ fontWeight:700, fontSize:22, color:"#3b82f6" }}>#1 284</div>
          <div style={{ color:"#556b5e", fontSize:12, marginTop:4 }}>sur 18 432 élèves</div>
        </Card>
      </>)}
      <Footer />
    </div>
  );
};

// ─── PRICING ─────────────────────────────────────────────────────────────────
const Pricing = ({ user, onUpgrade }) => (
  <div className="fade-in" style={{ padding:"24px 20px", maxWidth:800, margin:"0 auto" }}>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:600 }}>Nos abonnements</h2>
      <p style={{ color:"#7a9e8e", fontSize:13, marginTop:6 }}>Accès complet · Mobile Money ou Visa · Via CinetPay</p>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:28 }}>
      {PLANS.map(plan => (
        <div key={plan.id} style={{ background:plan.popular?"linear-gradient(135deg,rgba(34,197,94,0.1),rgba(59,130,246,0.05))":"rgba(255,255,255,0.03)", border:plan.popular?"1px solid rgba(34,197,94,0.3)":"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:24, position:"relative" }}>
          {plan.popular&&<div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)" }}><Badge color="#22c55e">⭐ Recommandé</Badge></div>}
          <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{plan.name}</div>
          <div style={{ marginBottom:16 }}><span style={{ fontSize:28, fontWeight:800, color:plan.color }}>{plan.price===0?"Gratuit":plan.price.toLocaleString()}</span>{plan.price>0&&<span style={{ color:"#7a9e8e", fontSize:12 }}> FCFA/mois</span>}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {plan.features.map(f=><div key={f} style={{ display:"flex", gap:8, fontSize:12, color:"#9ca3af" }}><span style={{ color:plan.color }}>✓</span>{f}</div>)}
          </div>
          <Btn color={plan.color} onClick={() => onUpgrade(plan.id)} disabled={user.plan===plan.name} style={{ width:"100%", padding:"11px", fontSize:13 }}>{user.plan===plan.name?"✓ Plan actuel":plan.cta}</Btn>
        </div>
      ))}
    </div>
    <Card>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>💳 Moyens de paiement — Powered by CinetPay</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
        {[["🇬🇦","Gabon","Airtel · Moov"],["🇨🇲","Cameroun","MTN · Orange"],["🇨🇮","Côte d'Ivoire","MTN · Orange · Wave"],["🇸🇳","Sénégal","Orange · Wave"],["🇨🇩","RDC","M-Pesa · Airtel"],["🌍","Tous pays","Visa · Mastercard"]].map(([f,c,m])=>(
          <div key={c} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:10 }}>
            <div style={{ fontSize:14, marginBottom:4 }}>{f} <span style={{ fontSize:12, fontWeight:600 }}>{c}</span></div>
            <div style={{ fontSize:11, color:"#556b5e" }}>{m}</div>
          </div>
        ))}
      </div>
    </Card>
    <Footer />
  </div>
);

// ─── PROFILE ─────────────────────────────────────────────────────────────────
const Profile = ({ user, onLogout }) => (
  <div className="fade-in" style={{ padding:"24px 20px", maxWidth:500, margin:"0 auto" }}>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#22c55e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 12px" }}>{user.name[0].toUpperCase()}</div>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, fontWeight:600 }}>{user.name}</h2>
      <p style={{ color:"#7a9e8e", fontSize:13, marginTop:4 }}>{user.email}</p>
      <div style={{ marginTop:8 }}><Badge color="#f5a623">Plan {user.plan}</Badge></div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {[["🌍 Pays",user.country],["🎓 Niveau",user.level],["📅 Membre depuis","Avril 2026"],["📖 Chapitres complétés","4 / 25"],["🏆 Points","2 340 pts"]].map(([l,v])=>(
        <Card key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
          <span style={{ fontSize:13, color:"#7a9e8e" }}>{l}</span>
          <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
        </Card>
      ))}
    </div>
    <Btn onClick={onLogout} outline color="#ef4444" style={{ width:"100%", marginTop:20, padding:"12px" }}>Se déconnecter</Btn>
    <Footer />
  </div>
);

// ─── NAV & TOPBAR ────────────────────────────────────────────────────────────
const NavBar = ({ active, onNav }) => (
  <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:"rgba(6,13,26,0.95)", backdropFilter:"blur(12px)", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-around", padding:"8px 0 12px" }}>
    {[{id:"dashboard",icon:"🏠",label:"Accueil"},{id:"chapters",icon:"📚",label:"Cours"},{id:"tutor",icon:"🤖",label:"Kodjo"},{id:"competition",icon:"🏆",label:"Défi"},{id:"profile",icon:"👤",label:"Profil"}].map(t=>(
      <button key={t.id} onClick={()=>onNav(t.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 12px", fontFamily:"Sora,sans-serif" }}>
        <span style={{ fontSize:20 }}>{t.icon}</span>
        <span style={{ fontSize:10, fontWeight:600, color:active===t.id?"#f5a623":"#556b5e" }}>{t.label}</span>
        {active===t.id&&<div style={{ width:4, height:4, borderRadius:"50%", background:"#f5a623" }} />}
      </button>
    ))}
  </div>
);

const TopBar = ({ user, screen }) => {
  const titles = { dashboard:"", chapters:"Mathématiques", tutor:"Tuteur Kodjo", competition:"Compétition", pricing:"Abonnements", profile:"Mon profil", chapterDetail:"Chapitre" };
  return (
    <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(6,13,26,0.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>🌍</span>
        <span style={{ fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:600, background:"linear-gradient(90deg,#f5a623,#22c55e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>AfriLearn</span>
        {titles[screen]&&<span style={{ color:"#556b5e", fontSize:13, marginLeft:4 }}>· {titles[screen]}</span>}
      </div>
      <Badge color={user.plan==="Premium"?"#22c55e":user.plan==="Essentiel"?"#f5a623":"#6b7280"}>{user.plan}</Badge>
    </div>
  );
};

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  const handleAuth = (form) => {
    setUser(form);
    if (form.role==="superadmin"||form.role==="admin") { setScreen("admin"); return; }
    setScreen("dashboard");
  };

  const handleNav = (s) => { setActiveChapter(null); setScreen(s); };
  const handleChapter = (ch) => { setActiveChapter(ch); setScreen("chapterDetail"); };
  const handleUpgrade = (planId) => {
    const names = { free:"Gratuit", essential:"Essentiel", premium:"Premium" };
    setUser(u => ({...u, plan:names[planId]}));
  };

  return (
    <>
      <style>{css}</style>
      {screen==="landing" && <Landing onEnter={s=>setScreen(s)} />}
      {screen==="login" && <Auth mode="login" onAuth={handleAuth} onSwitch={()=>setScreen("register")} />}
      {screen==="register" && <Auth mode="register" onAuth={handleAuth} onSwitch={()=>setScreen("login")} />}
      {screen==="admin" && user && <SuperAdmin user={user} onLogout={()=>{ setUser(null); setScreen("landing"); }} />}
      {user && !["landing","login","register","admin"].includes(screen) && (
        <div style={{ paddingBottom:80 }}>
          <TopBar user={user} screen={screen} />
          {screen==="dashboard"     && <Dashboard user={user} onNav={handleNav} />}
          {screen==="chapters"      && <Chapters user={user} onChapter={handleChapter} />}
          {screen==="chapterDetail" && activeChapter && <ChapterDetail chapter={activeChapter} user={user} onBack={()=>setScreen("chapters")} onTutor={()=>setScreen("tutor")} />}
          {screen==="tutor"         && <Tutor user={user} chapter={activeChapter} />}
          {screen==="competition"   && <Competition user={user} />}
          {screen==="pricing"       && <Pricing user={user} onUpgrade={handleUpgrade} />}
          {screen==="profile"       && <Profile user={user} onLogout={()=>{ setUser(null); setScreen("landing"); }} />}
          <NavBar active={screen} onNav={handleNav} />
        </div>
      )}
    </>
  );
}
