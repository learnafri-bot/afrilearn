import { useState, useRef, useEffect } from "react";

// ─── DATA ───────────────────────────────────────────────────────────────────

const COUNTRIES = ["Gabon","Cameroun","Côte d'Ivoire","Sénégal","RDC","Congo","Bénin","Togo","Burkina Faso","Mali","Niger","Guinée","Madagascar","Rwanda","Burundi","Tchad","Centrafrique","Djibouti","Comores","Maurice"];

const CHAPTERS = [
  // Partie 1
  { id:1,  part:1, title:"Nombres entiers",           status:"available", partName:"Nombres & Calculs" },
  { id:2,  part:1, title:"Nombres décimaux",          status:"available", partName:"Nombres & Calculs" },
  { id:3,  part:1, title:"Arrondir les nombres",      status:"available", partName:"Nombres & Calculs" },
  { id:4,  part:1, title:"Addition et soustraction",  status:"available", partName:"Nombres & Calculs" },
  { id:5,  part:1, title:"Multiplication",            status:"available", partName:"Nombres & Calculs" },
  { id:6,  part:1, title:"Division",                  status:"available", partName:"Nombres & Calculs" },
  { id:7,  part:1, title:"Priorités opératoires",     status:"available", partName:"Nombres & Calculs" },
  { id:8,  part:1, title:"Fractions",                 status:"available", partName:"Nombres & Calculs" },
  // Partie 2
  { id:9,  part:2, title:"Droites et angles",         status:"available", partName:"Géométrie plane" },
  { id:10, part:2, title:"Triangles",                 status:"available", partName:"Géométrie plane" },
  { id:11, part:2, title:"Quadrilatères",             status:"available", partName:"Géométrie plane" },
  { id:12, part:2, title:"Cercle",                    status:"available", partName:"Géométrie plane" },
  { id:13, part:2, title:"Symétrie axiale",           status:"available", partName:"Géométrie plane" },
  { id:14, part:2, title:"Périmètre et aire",         status:"available", partName:"Géométrie plane" },
  // Partie 3
  { id:15, part:3, title:"Longueurs",                 status:"available", partName:"Grandeurs & Mesures" },
  { id:16, part:3, title:"Masses",                    status:"available", partName:"Grandeurs & Mesures" },
  { id:17, part:3, title:"Durées",                    status:"available", partName:"Grandeurs & Mesures" },
  { id:18, part:3, title:"Aires",                     status:"available", partName:"Grandeurs & Mesures" },
  { id:19, part:3, title:"Volumes",                   status:"available", partName:"Grandeurs & Mesures" },
  // Partie 4
  { id:20, part:4, title:"Solides",                   status:"available", partName:"Géométrie dans l'espace" },
  { id:21, part:4, title:"Patrons",                   status:"available", partName:"Géométrie dans l'espace" },
  { id:22, part:4, title:"Repérage dans l'espace",    status:"available", partName:"Géométrie dans l'espace" },
  // Partie 5
  { id:23, part:5, title:"Tableaux et graphiques",    status:"available", partName:"Données & Statistiques" },
  { id:24, part:5, title:"Moyennes",                  status:"available", partName:"Données & Statistiques" },
  { id:25, part:5, title:"Proportionnalité",          status:"available", partName:"Données & Statistiques" },
];

const PARTS = [
  { id:1, name:"Nombres & Calculs",          icon:"🔢", color:"#f59e0b" },
  { id:2, name:"Géométrie plane",            icon:"📐", color:"#3b82f6" },
  { id:3, name:"Grandeurs & Mesures",        icon:"📏", color:"#10b981" },
  { id:4, name:"Géométrie dans l'espace",    icon:"🔷", color:"#8b5cf6" },
  { id:5, name:"Données & Statistiques",     icon:"📊", color:"#ef4444" },
];

const SUBJECTS = [
  { id:"maths",   name:"Mathématiques", icon:"🔢", available: true  },
  { id:"french",  name:"Français",      icon:"📝", available: false },
  { id:"svt",     name:"SVT",           icon:"🌿", available: false },
  { id:"histgeo", name:"Histoire-Géo",  icon:"🌍", available: false },
  { id:"phys",    name:"Physique-Chimie",icon:"⚗️", available: false },
  { id:"english", name:"Anglais",       icon:"🇬🇧", available: false },
];

const PLANS = [
  {
    id:"free", name:"Gratuit", price:0, currency:"FCFA",
    features:["3 leçons d'essai","Accès au tuteur Kodjo limité","Aperçu des exercices"],
    cta:"Commencer gratuitement", color:"#6b7280",
  },
  {
    id:"essential", name:"Essentiel", price:1995, currency:"FCFA",
    features:["Tous les cours complets","Toutes les matières du niveau","Tuteur Kodjo illimité","Suivi de progression"],
    cta:"Choisir Essentiel", color:"#f59e0b", popular: false,
  },
  {
    id:"premium", name:"Premium", price:2995, currency:"FCFA",
    features:["Tout l'Essentiel","Exercices + Corrigés détaillés","Compétition africaine 🏆","Badges & Trophées","Classement continental"],
    cta:"Choisir Premium", color:"#10b981", popular: true,
  },
];

const LEADERBOARD = [
  { rank:1,  name:"Aminata D.",   country:"🇸🇳", score:9840, badge:"🥇" },
  { rank:2,  name:"Kwame A.",     country:"🇨🇮", score:9210, badge:"🥈" },
  { rank:3,  name:"Blessing N.",  country:"🇨🇲", score:8990, badge:"🥉" },
  { rank:4,  name:"Fatoumata K.", country:"🇲🇱", score:8750, badge:"⭐" },
  { rank:5,  name:"Junior M.",    country:"🇨🇩", score:8540, badge:"⭐" },
  { rank:6,  name:"Awa T.",       country:"🇧🇯", score:8320, badge:"⭐" },
  { rank:7,  name:"Kofi B.",      country:"🇹🇬", score:8100, badge:"⭐" },
  { rank:8,  name:"Marie C.",     country:"🇬🇦", score:7980, badge:"⭐" },
];

const SYSTEM_PROMPT = `Tu es Kodjo, un tuteur IA bienveillant et encourageant pour AfriLearn, une plateforme éducative africaine. Tu aides des élèves de 6ème dans toute l'Afrique francophone.

Ton style :
- Chaleureux, patient, encourageant
- Tu utilises des exemples tirés de la vie quotidienne africaine (marchés, fruits tropicaux, distances entre villes africaines, monnaies locales en FCFA, etc.)
- Tu poses UNE seule question à la fois
- Tu félicites les bonnes réponses avec enthousiasme
- En cas d'erreur, tu expliques doucement sans décourager
- Tu t'exprimes toujours en français simple et accessible
- Tu es fier de la culture africaine et tu l'intègres naturellement dans tes explications

Tu couvres toutes les matières de 6ème : Maths, Français, SVT, Histoire-Géo, Physique-Chimie, Anglais.
Commence par te présenter et demander le prénom et le pays de l'élève.`;

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #060d1a;
    --bg2: #0c1829;
    --bg3: #112035;
    --border: rgba(255,255,255,0.07);
    --text: #e8f4f0;
    --muted: #7a9e8e;
    --gold: #f5a623;
    --green: #22c55e;
    --blue: #3b82f6;
    --red: #ef4444;
  }
  body { font-family: 'Sora', sans-serif; background: var(--bg); color: var(--text); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const Badge = ({ children, color = "#f5a623" }) => (
  <span style={{
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em"
  }}>{children}</span>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: 20, cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s", ...style
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
    onMouseLeave={e => onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
  >{children}</div>
);

const Btn = ({ children, onClick, color = "#f5a623", outline = false, disabled = false, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: outline ? "transparent" : disabled ? "#333" : color,
    color: outline ? color : disabled ? "#666" : "#fff",
    border: outline ? `1.5px solid ${color}` : "none",
    borderRadius: 10, padding: "10px 20px", fontFamily: "Sora, sans-serif",
    fontWeight: 600, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s", letterSpacing: "0.02em", ...style
  }}>{children}</button>
);

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// LANDING
const Landing = ({ onEnter }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
    {/* Background orbs */}
    <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)", top: "10%", left: "10%", pointerEvents: "none" }} />
    <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)", bottom: "15%", right: "10%", pointerEvents: "none" }} />

    <div className="fade-in" style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
      <h1 style={{
        fontFamily: "'Crimson Pro', serif", fontSize: "clamp(2.4rem, 6vw, 3.8rem)", fontWeight: 600,
        background: "linear-gradient(135deg, #f5a623 0%, #22c55e 60%, #3b82f6 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.15, marginBottom: 16
      }}>
        AfriLearn
      </h1>
      <p style={{ color: "#7a9e8e", fontSize: 16, lineHeight: 1.7, marginBottom: 12 }}>
        La première plateforme d'apprentissage IA dédiée aux élèves d'<strong style={{ color: "#e8f4f0" }}>Afrique francophone</strong>.
      </p>
      <p style={{ color: "#556b5e", fontSize: 14, marginBottom: 36 }}>
        Du 6ème à la Terminale · Cours · Exercices · Compétition africaine
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
        <Btn onClick={() => onEnter("register")} color="#f5a623" style={{ padding: "13px 28px", fontSize: 14 }}>
          Commencer gratuitement →
        </Btn>
        <Btn onClick={() => onEnter("login")} outline color="#f5a623" style={{ padding: "13px 28px", fontSize: 14 }}>
          Se connecter
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
        {[["20+","Pays francophones"],["25","Chapitres Maths 6ème"],["100%","Contexte africain"]].map(([n,l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f5a623" }}>{n}</div>
            <div style={{ fontSize: 11, color: "#556b5e", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// AUTH
const Auth = ({ mode, onAuth, onSwitch }) => {
  const [form, setForm] = useState({ name:"", email:"", country:"Gabon", password:"", level:"6ème" });
  const levels = ["6ème","5ème","4ème","3ème","2nde","1ère","Terminale"];

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="fade-in" style={{ width:"100%", maxWidth:420 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🌍</div>
          <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:28, fontWeight:600, color:"#f5a623" }}>
            {mode === "login" ? "Bon retour !" : "Rejoindre AfriLearn"}
          </h2>
          <p style={{ color:"#556b5e", fontSize:13, marginTop:6 }}>
            {mode === "login" ? "Content de te revoir 👋" : "Commence ton aventure éducative"}
          </p>
        </div>

        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode === "register" && (
              <input placeholder="Ton prénom" value={form.name}
                onChange={e => setForm({...form, name:e.target.value})}
                style={inputStyle} />
            )}
            <input placeholder="Email" type="email" value={form.email}
              onChange={e => setForm({...form, email:e.target.value})}
              style={inputStyle} />
            <input placeholder="Mot de passe" type="password" value={form.password}
              onChange={e => setForm({...form, password:e.target.value})}
              style={inputStyle} />
            {mode === "register" && (<>
              <select value={form.country} onChange={e => setForm({...form, country:e.target.value})} style={inputStyle}>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.level} onChange={e => setForm({...form, level:e.target.value})} style={inputStyle}>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </>)}
            <Btn onClick={() => onAuth(form)} color="#f5a623" style={{ marginTop:4, padding:"13px", fontSize:14 }}>
              {mode === "login" ? "Se connecter →" : "Créer mon compte →"}
            </Btn>
          </div>
        </Card>

        <p style={{ textAlign:"center", marginTop:20, color:"#556b5e", fontSize:13 }}>
          {mode === "login" ? "Pas encore de compte ? " : "Déjà un compte ? "}
          <span onClick={onSwitch} style={{ color:"#f5a623", cursor:"pointer", fontWeight:600 }}>
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </span>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
  borderRadius:10, padding:"11px 14px", color:"#e8f4f0", fontSize:13,
  fontFamily:"Sora,sans-serif", outline:"none", width:"100%"
};

// DASHBOARD
const Dashboard = ({ user, onNav, onChapter }) => {
  const progress = 4;
  const total = 25;
  const pct = Math.round((progress/total)*100);

  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:800, margin:"0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:600 }}>
          Bonjour, <span style={{ color:"#f5a623" }}>{user.name}</span> 👋
        </h2>
        <p style={{ color:"#7a9e8e", fontSize:13, marginTop:4 }}>{user.level} · {user.country} · Plan {user.plan}</p>
      </div>

      {/* Progress card */}
      <Card style={{ marginBottom:20, background:"linear-gradient(135deg, rgba(245,166,35,0.08), rgba(34,197,94,0.05))" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontWeight:600, fontSize:14 }}>📐 Maths 6ème — Progression</span>
          <Badge color="#f5a623">{progress}/{total} chapitres</Badge>
        </div>
        <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:999, height:8, overflow:"hidden" }}>
          <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#f5a623,#22c55e)", borderRadius:999, transition:"width 1s ease" }} />
        </div>
        <p style={{ color:"#556b5e", fontSize:12, marginTop:8 }}>{pct}% complété · Continue comme ça !</p>
      </Card>

      {/* Quick actions */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
        {[
          { icon:"📖", label:"Continuer le cours", color:"#f5a623", action:() => onNav("chapters") },
          { icon:"🤖", label:"Parler à Kodjo", color:"#3b82f6", action:() => onNav("tutor") },
          { icon:"🏆", label:"Compétition", color:"#22c55e", action:() => onNav("competition"), premium:true },
          { icon:"💳", label:"Mon abonnement", color:"#8b5cf6", action:() => onNav("pricing") },
        ].map(item => (
          <Card key={item.label} onClick={item.action} style={{ textAlign:"center", padding:16, position:"relative" }}>
            {item.premium && user.plan === "Gratuit" && (
              <div style={{ position:"absolute", top:8, right:8 }}><Badge color="#22c55e">Premium</Badge></div>
            )}
            <div style={{ fontSize:28, marginBottom:8 }}>{item.icon}</div>
            <div style={{ fontSize:12, fontWeight:600, color:item.color }}>{item.label}</div>
          </Card>
        ))}
      </div>

      {/* Matières */}
      <h3 style={{ fontSize:14, fontWeight:700, color:"#7a9e8e", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>
        Matières disponibles
      </h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
        {SUBJECTS.map(s => (
          <Card key={s.id} onClick={s.available ? () => onNav("chapters") : null}
            style={{ textAlign:"center", padding:14, opacity: s.available ? 1 : 0.4, position:"relative" }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:12, fontWeight:600 }}>{s.name}</div>
            {!s.available && <div style={{ fontSize:10, color:"#556b5e", marginTop:4 }}>Bientôt disponible</div>}
            {s.available && <div style={{ fontSize:10, color:"#22c55e", marginTop:4 }}>● Disponible</div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

// CHAPTERS
const Chapters = ({ user, onChapter }) => {
  const [filter, setFilter] = useState(0);
  const filtered = filter === 0 ? CHAPTERS : CHAPTERS.filter(c => c.part === filter);

  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:800, margin:"0 auto" }}>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:24, fontWeight:600, marginBottom:4 }}>
        📐 Mathématiques — <span style={{ color:"#f5a623" }}>6ème</span>
      </h2>
      <p style={{ color:"#7a9e8e", fontSize:13, marginBottom:20 }}>25 chapitres · 5 parties</p>

      {/* Part filters */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
        <button onClick={() => setFilter(0)} style={filterBtn(filter===0)}>Tous</button>
        {PARTS.map(p => (
          <button key={p.id} onClick={() => setFilter(p.id)} style={filterBtn(filter===p.id, p.color)}>
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* Chapters list */}
      {(filter === 0 ? PARTS : PARTS.filter(p => p.id === filter)).map(part => {
        const chs = filtered.filter(c => c.part === part.id);
        if (!chs.length) return null;
        return (
          <div key={part.id} style={{ marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:18 }}>{part.icon}</span>
              <span style={{ fontWeight:700, fontSize:13, color:part.color, letterSpacing:"0.04em", textTransform:"uppercase" }}>{part.name}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {chs.map((ch, i) => {
                const locked = user.plan === "Gratuit" && ch.id > 3;
                return (
                  <div key={ch.id} onClick={() => !locked && onChapter(ch)}
                    style={{
                      display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                      background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
                      borderRadius:12, cursor: locked ? "not-allowed" : "pointer",
                      opacity: locked ? 0.45 : 1, transition:"all 0.2s"
                    }}
                    onMouseEnter={e => !locked && (e.currentTarget.style.background="rgba(255,255,255,0.06)")}
                    onMouseLeave={e => !locked && (e.currentTarget.style.background="rgba(255,255,255,0.03)")}
                  >
                    <div style={{
                      width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                      background: locked ? "rgba(255,255,255,0.05)" : `${part.color}22`,
                      fontSize:13, fontWeight:700, color: locked ? "#556b5e" : part.color, flexShrink:0
                    }}>{locked ? "🔒" : ch.id}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{ch.title}</div>
                      <div style={{ fontSize:11, color:"#556b5e", marginTop:2 }}>
                        {locked ? "Abonnement requis" : "Cours · Exercices · Tuteur Kodjo"}
                      </div>
                    </div>
                    {!locked && <span style={{ color:"#556b5e", fontSize:18 }}>›</span>}
                    {locked && <Badge color="#f5a623">Essentiel</Badge>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const filterBtn = (active, color="#f5a623") => ({
  background: active ? `${color}22` : "rgba(255,255,255,0.04)",
  color: active ? color : "#7a9e8e",
  border: active ? `1px solid ${color}44` : "1px solid rgba(255,255,255,0.07)",
  borderRadius:20, padding:"6px 14px", fontSize:11, fontWeight:600,
  cursor:"pointer", fontFamily:"Sora,sans-serif", transition:"all 0.2s"
});

// CHAPTER DETAIL
const ChapterDetail = ({ chapter, user, onBack, onTutor }) => {
  const part = PARTS.find(p => p.id === chapter.part);
  const hasPremium = user.plan === "Premium";

  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:700, margin:"0 auto" }}>
      <button onClick={onBack} style={{ background:"none", border:"none", color:"#7a9e8e", cursor:"pointer", fontSize:13, marginBottom:16, fontFamily:"Sora,sans-serif" }}>
        ← Retour aux chapitres
      </button>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:`${part.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
          {part.icon}
        </div>
        <div>
          <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, fontWeight:600 }}>{chapter.title}</h2>
          <p style={{ color:"#7a9e8e", fontSize:12 }}>{part.name} · Chapitre {chapter.id}</p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {/* Cours */}
        <Card style={{ borderLeft:`3px solid ${part.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>📖 Cours complet</div>
              <div style={{ color:"#7a9e8e", fontSize:12 }}>Leçon · Définitions · Exemples africains</div>
            </div>
            <Btn color={part.color} style={{ padding:"8px 16px", fontSize:12 }}>Lire</Btn>
          </div>
        </Card>

        {/* Exercices */}
        <Card style={{ borderLeft:`3px solid ${hasPremium ? "#22c55e" : "#333"}`, opacity: hasPremium ? 1 : 0.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>
                ✏️ Exercices {!hasPremium && "🔒"}
              </div>
              <div style={{ color:"#7a9e8e", fontSize:12 }}>15 exercices gradués · Facile à Difficile</div>
            </div>
            {hasPremium
              ? <Btn color="#22c55e" style={{ padding:"8px 16px", fontSize:12 }}>Pratiquer</Btn>
              : <Badge color="#22c55e">Premium</Badge>
            }
          </div>
        </Card>

        {/* Corrigés */}
        <Card style={{ borderLeft:`3px solid ${hasPremium ? "#3b82f6" : "#333"}`, opacity: hasPremium ? 1 : 0.5 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>
                ✅ Corrigés détaillés {!hasPremium && "🔒"}
              </div>
              <div style={{ color:"#7a9e8e", fontSize:12 }}>Solutions étape par étape</div>
            </div>
            {hasPremium
              ? <Btn color="#3b82f6" style={{ padding:"8px 16px", fontSize:12 }}>Voir</Btn>
              : <Badge color="#22c55e">Premium</Badge>
            }
          </div>
        </Card>

        {/* Tuteur */}
        <Card style={{ borderLeft:`3px solid #f5a623`, background:"rgba(245,166,35,0.05)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>🤖 Tuteur Kodjo</div>
              <div style={{ color:"#7a9e8e", fontSize:12 }}>Pose tes questions · Pratique interactive</div>
            </div>
            <Btn color="#f5a623" onClick={onTutor} style={{ padding:"8px 16px", fontSize:12 }}>Démarrer</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

// TUTOR
const Tutor = ({ user, chapter }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    if (messages.length === 0) startChat();
  }, []);

  const startChat = async () => {
    setLoading(true);
    const context = chapter ? `Le sujet du jour est : ${chapter.title} en Maths 6ème.` : "Aide l'élève sur n'importe quelle matière de 6ème.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: SYSTEM_PROMPT + "\n\n" + context,
          messages:[{ role:"user", content:"Bonjour Kodjo, je suis prêt à apprendre !" }]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Bonjour ! Je suis Kodjo. Comment tu t'appelles ?";
      setHistory([
        { role:"user", content:"Bonjour Kodjo, je suis prêt à apprendre !" },
        { role:"assistant", content:reply }
      ]);
      setMessages([{ role:"assistant", content:reply }]);
    } catch {
      setMessages([{ role:"assistant", content:"Bonjour ! Je suis Kodjo, ton tuteur AfriLearn. Comment tu t'appelles ?" }]);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    const newMsgs = [...messages, { role:"user", content:text }];
    setMessages(newMsgs);
    const newHist = [...history, { role:"user", content:text }];
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system: SYSTEM_PROMPT,
          messages: newHist
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Je n'ai pas bien compris. Peux-tu reformuler ?";
      setMessages([...newMsgs, { role:"assistant", content:reply }]);
      setHistory([...newHist, { role:"assistant", content:reply }]);
    } catch {
      setMessages([...newMsgs, { role:"assistant", content:"Oups, une erreur. Réessaie !" }]);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 120px)", maxWidth:700, margin:"0 auto", padding:"0 20px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🦅</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:"#f5a623" }}>Kodjo — Tuteur IA</div>
          <div style={{ fontSize:11, color: loading ? "#f5a623" : "#22c55e" }} className={loading ? "pulse" : ""}>
            {loading ? "En train d'écrire..." : "● En ligne"}
          </div>
        </div>
        {chapter && <Badge color="#7a9e8e" style={{ marginLeft:"auto" }}>{chapter.title}</Badge>}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 0", display:"flex", flexDirection:"column", gap:12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display:"flex", gap:10, justifyContent: msg.role==="assistant" ? "flex-start" : "flex-end" }}>
            {msg.role==="assistant" && (
              <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🦅</div>
            )}
            <div style={{
              maxWidth:"75%", padding:"10px 14px", fontSize:13, lineHeight:1.7,
              background: msg.role==="assistant" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#1e6b3c,#166534)",
              borderRadius: msg.role==="assistant" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
              color:"#e8f4f0", border:"1px solid rgba(255,255,255,0.06)"
            }}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#d97706)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🦅</div>
            <div style={{ padding:"10px 16px", background:"rgba(255,255,255,0.05)", borderRadius:"4px 16px 16px 16px", border:"1px solid rgba(255,255,255,0.06)" }}>
              <span className="shimmer" style={{ display:"inline-block", width:60, height:12, borderRadius:6 }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding:"12px 0", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:10 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
          placeholder="Pose ta question à Kodjo..."
          style={{ ...inputStyle, flex:1 }} />
        <Btn onClick={send} disabled={loading || !input.trim()} color="#f5a623" style={{ padding:"11px 18px", fontSize:13 }}>
          ↗
        </Btn>
      </div>
    </div>
  );
};

// COMPETITION
const Competition = ({ user }) => {
  const isPremium = user.plan === "Premium";

  return (
    <div className="fade-in" style={{ padding:"24px 20px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🏆</div>
        <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:600 }}>Compétition Africaine</h2>
        <p style={{ color:"#7a9e8e", fontSize:13, marginTop:6 }}>Défie les meilleurs élèves de toute l'Afrique francophone</p>
      </div>

      {!isPremium ? (
        <Card style={{ textAlign:"center", padding:32, border:"1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
          <h3 style={{ fontWeight:700, marginBottom:8 }}>Fonctionnalité Premium</h3>
          <p style={{ color:"#7a9e8e", fontSize:13, marginBottom:20, lineHeight:1.7 }}>
            La compétition africaine est disponible avec le plan Premium à <strong style={{ color:"#22c55e" }}>2 995 FCFA/mois</strong>.
          </p>
          <Badge color="#22c55e">Passer en Premium</Badge>
        </Card>
      ) : (
        <>
          {/* Live challenge */}
          <Card style={{ marginBottom:16, background:"linear-gradient(135deg,rgba(34,197,94,0.08),rgba(59,130,246,0.05))", border:"1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <Badge color="#22c55e">🔴 En direct</Badge>
                <div style={{ fontWeight:700, fontSize:15, marginTop:8 }}>Défi Maths — Fractions</div>
                <div style={{ color:"#7a9e8e", fontSize:12, marginTop:4 }}>247 élèves participent · Se termine dans 2h</div>
              </div>
              <Btn color="#22c55e" style={{ padding:"10px 18px", fontSize:12 }}>Participer</Btn>
            </div>
          </Card>

          {/* Leaderboard */}
          <h3 style={{ fontSize:13, fontWeight:700, color:"#7a9e8e", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12 }}>
            🌍 Classement continental — Cette semaine
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {LEADERBOARD.map(p => (
              <div key={p.rank} style={{
                display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
                background: p.rank <= 3 ? "rgba(245,166,35,0.06)" : "rgba(255,255,255,0.02)",
                border: p.rank <= 3 ? "1px solid rgba(245,166,35,0.2)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius:12
              }}>
                <div style={{ width:28, textAlign:"center", fontSize:16 }}>{p.badge}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{p.name} {p.country}</div>
                </div>
                <div style={{ fontWeight:700, fontSize:13, color:"#f5a623" }}>{p.score.toLocaleString()} pts</div>
              </div>
            ))}
          </div>

          {/* User rank */}
          <Card style={{ marginTop:16, textAlign:"center", border:"1px solid rgba(59,130,246,0.2)" }}>
            <div style={{ color:"#7a9e8e", fontSize:12, marginBottom:4 }}>Ton classement</div>
            <div style={{ fontWeight:700, fontSize:22, color:"#3b82f6" }}>#1 284</div>
            <div style={{ color:"#556b5e", fontSize:12, marginTop:4 }}>sur 18 432 élèves · Continue à progresser !</div>
          </Card>
        </>
      )}
    </div>
  );
};

// PRICING
const Pricing = ({ user, onUpgrade }) => (
  <div className="fade-in" style={{ padding:"24px 20px", maxWidth:800, margin:"0 auto" }}>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:26, fontWeight:600 }}>Nos abonnements</h2>
      <p style={{ color:"#7a9e8e", fontSize:13, marginTop:6 }}>Accès complet · Paiement Mobile Money ou carte Visa</p>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:28 }}>
      {PLANS.map(plan => (
        <div key={plan.id} style={{
          background: plan.popular ? "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(59,130,246,0.05))" : "rgba(255,255,255,0.03)",
          border: plan.popular ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.07)",
          borderRadius:20, padding:24, position:"relative"
        }}>
          {plan.popular && (
            <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)" }}>
              <Badge color="#22c55e">⭐ Recommandé</Badge>
            </div>
          )}
          <div style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>{plan.name}</div>
          <div style={{ marginBottom:16 }}>
            <span style={{ fontSize:28, fontWeight:800, color:plan.color }}>{plan.price === 0 ? "Gratuit" : plan.price.toLocaleString()}</span>
            {plan.price > 0 && <span style={{ color:"#7a9e8e", fontSize:12 }}> FCFA/mois</span>}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {plan.features.map(f => (
              <div key={f} style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:12, color:"#9ca3af" }}>
                <span style={{ color:plan.color, flexShrink:0 }}>✓</span>{f}
              </div>
            ))}
          </div>
          <Btn color={plan.color}
            onClick={() => onUpgrade(plan.id)}
            disabled={user.plan === plan.name}
            style={{ width:"100%", padding:"11px", fontSize:13 }}>
            {user.plan === plan.name ? "✓ Plan actuel" : plan.cta}
          </Btn>
        </div>
      ))}
    </div>

    {/* Payment methods */}
    <Card>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>💳 Moyens de paiement acceptés</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10 }}>
        {[
          { flag:"🇬🇦", country:"Gabon", methods:"Airtel Money · Moov" },
          { flag:"🇨🇲", country:"Cameroun", methods:"MTN MoMo · Orange" },
          { flag:"🇨🇮", country:"Côte d'Ivoire", methods:"MTN · Orange · Wave" },
          { flag:"🇸🇳", country:"Sénégal", methods:"Orange · Wave · Free" },
          { flag:"🇨🇩", country:"RDC", methods:"M-Pesa · Airtel" },
          { flag:"🌍", country:"Tous pays", methods:"Visa · Mastercard" },
        ].map(p => (
          <div key={p.country} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:10 }}>
            <div style={{ fontSize:16, marginBottom:4 }}>{p.flag} <span style={{ fontSize:12, fontWeight:600 }}>{p.country}</span></div>
            <div style={{ fontSize:11, color:"#556b5e" }}>{p.methods}</div>
          </div>
        ))}
      </div>
      <p style={{ color:"#556b5e", fontSize:11, marginTop:12 }}>Powered by CinetPay · Paiement sécurisé</p>
    </Card>
  </div>
);

// PROFILE
const Profile = ({ user, onLogout }) => (
  <div className="fade-in" style={{ padding:"24px 20px", maxWidth:500, margin:"0 auto" }}>
    <div style={{ textAlign:"center", marginBottom:28 }}>
      <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#f5a623,#22c55e)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 12px" }}>
        {user.name[0].toUpperCase()}
      </div>
      <h2 style={{ fontFamily:"'Crimson Pro',serif", fontSize:22, fontWeight:600 }}>{user.name}</h2>
      <p style={{ color:"#7a9e8e", fontSize:13, marginTop:4 }}>{user.email}</p>
      <div style={{ marginTop:8 }}><Badge color="#f5a623">Plan {user.plan}</Badge></div>
    </div>

    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {[
        { label:"🌍 Pays", value:user.country },
        { label:"🎓 Niveau", value:user.level },
        { label:"📅 Membre depuis", value:"Avril 2026" },
        { label:"📖 Chapitres complétés", value:"4 / 25" },
        { label:"🏆 Points compétition", value:"2 340 pts" },
      ].map(item => (
        <Card key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px" }}>
          <span style={{ fontSize:13, color:"#7a9e8e" }}>{item.label}</span>
          <span style={{ fontSize:13, fontWeight:600 }}>{item.value}</span>
        </Card>
      ))}
    </div>

    <Btn onClick={onLogout} outline color="#ef4444" style={{ width:"100%", marginTop:20, padding:"12px" }}>
      Se déconnecter
    </Btn>
  </div>
);

// NAV BAR
const NavBar = ({ active, onNav, unread }) => {
  const tabs = [
    { id:"dashboard",   icon:"🏠", label:"Accueil" },
    { id:"chapters",    icon:"📚", label:"Cours" },
    { id:"tutor",       icon:"🤖", label:"Kodjo" },
    { id:"competition", icon:"🏆", label:"Défi" },
    { id:"profile",     icon:"👤", label:"Profil" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:100,
      background:"rgba(6,13,26,0.95)", backdropFilter:"blur(12px)",
      borderTop:"1px solid rgba(255,255,255,0.07)",
      display:"flex", justifyContent:"space-around", padding:"8px 0 12px"
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNav(t.id)} style={{
          background:"none", border:"none", cursor:"pointer", display:"flex",
          flexDirection:"column", alignItems:"center", gap:3, padding:"4px 12px",
          fontFamily:"Sora,sans-serif"
        }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          <span style={{ fontSize:10, fontWeight:600, color: active===t.id ? "#f5a623" : "#556b5e",
            letterSpacing:"0.04em" }}>{t.label}</span>
          {active===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:"#f5a623" }} />}
        </button>
      ))}
    </div>
  );
};

// TOP BAR
const TopBar = ({ user, screen }) => {
  const titles = { dashboard:"", chapters:"Mathématiques", tutor:"Tuteur Kodjo", competition:"Compétition", pricing:"Abonnements", profile:"Mon profil", chapterDetail:"Chapitre" };
  return (
    <div style={{
      position:"sticky", top:0, zIndex:50,
      background:"rgba(6,13,26,0.9)", backdropFilter:"blur(12px)",
      borderBottom:"1px solid rgba(255,255,255,0.07)",
      padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center"
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>🌍</span>
        <span style={{
          fontFamily:"'Crimson Pro',serif", fontSize:20, fontWeight:600,
          background:"linear-gradient(90deg,#f5a623,#22c55e)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
        }}>AfriLearn</span>
        {titles[screen] && <span style={{ color:"#556b5e", fontSize:13, marginLeft:4 }}>· {titles[screen]}</span>}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <Badge color={user.plan==="Premium" ? "#22c55e" : user.plan==="Essentiel" ? "#f5a623" : "#6b7280"}>
          {user.plan}
        </Badge>
      </div>
    </div>
  );
};

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  const handleAuth = (form) => {
    setUser({
      name: form.name || "Élève",
      email: form.email || "eleve@afrilearn.com",
      country: form.country || "Gabon",
      level: form.level || "6ème",
      plan: "Gratuit",
    });
    setScreen("dashboard");
  };

  const handleNav = (s) => {
    setActiveChapter(null);
    setScreen(s);
  };

  const handleChapter = (ch) => {
    setActiveChapter(ch);
    setScreen("chapterDetail");
  };

  const handleUpgrade = (planId) => {
    const names = { free:"Gratuit", essential:"Essentiel", premium:"Premium" };
    setUser(u => ({ ...u, plan: names[planId] }));
  };

  return (
    <>
      <style>{css}</style>
      {screen === "landing" && <Landing onEnter={s => setScreen(s)} />}
      {screen === "login" && <Auth mode="login" onAuth={handleAuth} onSwitch={() => setScreen("register")} />}
      {screen === "register" && <Auth mode="register" onAuth={handleAuth} onSwitch={() => setScreen("login")} />}

      {user && screen !== "landing" && screen !== "login" && screen !== "register" && (
        <div style={{ paddingBottom:80 }}>
          <TopBar user={user} screen={screen} />
          {screen === "dashboard"    && <Dashboard user={user} onNav={handleNav} onChapter={handleChapter} />}
          {screen === "chapters"     && <Chapters user={user} onChapter={handleChapter} />}
          {screen === "chapterDetail"&& activeChapter && <ChapterDetail chapter={activeChapter} user={user} onBack={() => setScreen("chapters")} onTutor={() => setScreen("tutor")} />}
          {screen === "tutor"        && <Tutor user={user} chapter={activeChapter} />}
          {screen === "competition"  && <Competition user={user} />}
          {screen === "pricing"      && <Pricing user={user} onUpgrade={handleUpgrade} />}
          {screen === "profile"      && <Profile user={user} onLogout={() => { setUser(null); setScreen("landing"); }} />}
          <NavBar active={screen} onNav={handleNav} />
        </div>
      )}
    </>
  );
}
