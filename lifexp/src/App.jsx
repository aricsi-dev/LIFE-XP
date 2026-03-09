import { useState, useEffect, useRef, useCallback } from 'react'
import DB from './db.js'

// ═══════════════════════════════════════════════════════════
//  GAME CONSTANTS
// ═══════════════════════════════════════════════════════════
const REALMS = {
  forge:   { id:'forge',   emoji:'⚔️',  name:'Forge',   color:'#C0392B', area:'Trabajo & Carrera',    token:'Ingots',    fEmoji:'🔥', desc:'Tu mundo profesional. Proyectos, carrera, emprendimiento y todo lo que construyes.' },
  sanctum: { id:'sanctum', emoji:'🌿',  name:'Sanctum', color:'#27AE60', area:'Salud & Bienestar',     token:'Seeds',     fEmoji:'🌱', desc:'Tu templo personal. Salud física, bienestar mental, descanso y hábitos del cuerpo.' },
  arcanum: { id:'arcanum', emoji:'🧠',  name:'Arcanum', color:'#2980B9', area:'Aprendizaje & Mente',   token:'Runes',     fEmoji:'📚', desc:'La biblioteca infinita. Aprendizaje, estudio, cursos y habilidades nuevas.' },
  hearth:  { id:'hearth',  emoji:'💛',  name:'Hearth',  color:'#E67E22', area:'Familia & Relaciones',  token:'Embers',    fEmoji:'🦊', desc:'El fuego del hogar. Familia, amigos, pareja y vida social.' },
  horizon: { id:'horizon', emoji:'🌍',  name:'Horizon', color:'#8E44AD', area:'Experiencias & Viajes', token:'Compasses', fEmoji:'🌀', desc:'El portal a lo nuevo. Viajes, experiencias y salir de la zona de confort.' },
  canvas:  { id:'canvas',  emoji:'🎨',  name:'Canvas',  color:'#E91E8C', area:'Creatividad & Arte',    token:'Pigments',  fEmoji:'🎭', desc:'El lienzo en blanco. Creatividad, arte, música, escritura y hobbies expresivos.' },
  vault:   { id:'vault',   emoji:'💰',  name:'Vault',   color:'#1ABC9C', area:'Finanzas',              token:'Coins',     fEmoji:'⚙️', desc:'La cámara del tesoro. Finanzas, ahorro, inversiones y control del dinero.' },
}

const ACTIVITIES = {
  forge:   ['Trabajar 90 min enfocado en mi proyecto','Completar la tarea más importante del día','Enviar propuestas o contactar clientes','Revisar y planificar la semana laboral','Actualizar portfolio o presencia profesional'],
  sanctum: ['30 minutos de ejercicio o movimiento','Tomar 2 litros de agua hoy','Meditar o respirar conscientemente 10 min','Cocinar una comida saludable','Completar rutina de sueño / descanso activo'],
  arcanum: ['Leer 30 páginas de un libro','Completar módulo de curso online','Practicar idioma 15 minutos','Escuchar podcast educativo hoy','Tomar notas de algo aprendido'],
  hearth:  ['Llamar o escribir a alguien importante','Conversación profunda sin pantallas','Expresar gratitud a alguien directamente','Desconectarse del celular 2 horas','Planificar actividad con familia o amigos'],
  horizon: ['Probar algo que nunca hayas hecho','Explorar lugar nuevo en tu ciudad','Ver atardecer o amanecer conscientemente','Probar comida de otra cultura','Investigar o planificar un viaje nuevo'],
  canvas:  ['Practicar arte o instrumento 30 min','Escribir 300 palabras creativas','Dibujar, fotografiar o diseñar algo','Llenar página de ideas sin juzgar','Compartir trabajo creativo al mundo'],
  vault:   ['Registrar todos los gastos del día','Transferir dinero a cuenta de ahorro','Leer contenido de educación financiera','Revisar presupuesto semanal','Identificar un gasto innecesario'],
}

const LEVELS = [
  { l:1,  xp:0,      title:'Aprendiz',    unlock:'Inicio de la aventura' },
  { l:2,  xp:100,    title:'Aprendiz II', unlock:'Quests disponibles' },
  { l:3,  xp:250,    title:'Aprendiz III',unlock:'Vault de Sparks' },
  { l:5,  xp:700,    title:'Aventurero',  unlock:'Color de Reino en avatar 🎨' },
  { l:9,  xp:2900,   title:'Aventurero V',unlock:'Tu Familiar despierta 🥚' },
  { l:16, xp:10500,  title:'Veterano',    unlock:'Familiar nace 🐣' },
  { l:20, xp:18000,  title:'Veterano V',  unlock:'Clase del Héroe desbloqueada ⚡' },
  { l:30, xp:50000,  title:'Maestro',     unlock:'Familiar adolescente 🐾' },
  { l:50, xp:200000, title:'★ LEYENDA',   unlock:'Skins Legendarias + Partículas' },
]

const VAULT_ITEMS = [
  { id:'day_off',    name:'Día Libre',         emoji:'🏕️', cost:10,  desc:'48h sin penalizar racha',            type:'antiburn',   btn:'Sí, me lo merezco 🌙' },
  { id:'chill_week', name:'Semana Chill',      emoji:'☁️', cost:20,  desc:'Misiones al 50% por 7 días',          type:'antiburn',   btn:'Activar Modo Chill ✨' },
  { id:'xp_boost',   name:'XP Boost ×2',      emoji:'⚡', cost:15,  desc:'XP doble por 24 horas',               type:'boost',      btn:'¡Doble XP ahora! ⚡' },
  { id:'loot_c',     name:'Loot Box Común',   emoji:'📦', cost:30,  desc:'Ítem misterioso — rareza Común',      type:'loot',       btn:'Abrir la caja 📦' },
  { id:'loot_r',     name:'Loot Box Rara',    emoji:'💚', cost:60,  desc:'Rareza Raro garantizada',             type:'loot',       btn:'Abrir la caja 💚' },
  { id:'loot_e',     name:'Loot Box Épica',   emoji:'💎', cost:120, desc:'Rareza Épico garantizada',            type:'loot',       btn:'Abrir la caja 💎' },
  { id:'streak_fix', name:'Reinicio de Racha',emoji:'🔥', cost:100, desc:'Recupera tu racha perdida (1×/mes)', type:'salvavidas', btn:'Volver al camino 🔥' },
]

const LOOT_POOLS = {
  loot_c: [
    { n:'Marco Dorado',     r:'Común', e:'🖼️', rc:'#8A8A9A', d:'Borde dorado en tus misiones' },
    { n:'+50 XP Bonus',     r:'Común', e:'⭐',  rc:'#8A8A9A', d:'Impulso de experiencia instantáneo', bonus:{ xp:50 } },
    { n:'+5 Sparks',        r:'Común', e:'💫',  rc:'#8A8A9A', d:'Energía extra directa a tu balance', bonus:{ sparks:5 } },
    { n:'Sticker Familiar', r:'Común', e:'🐣',  rc:'#8A8A9A', d:'Decoración animada' },
  ],
  loot_r: [
    { n:'Aura del Reino',   r:'Raro', e:'🌟', rc:'#27AE60', d:'Brillo del color de tu reino' },
    { n:'XP Boost ×1.5',   r:'Raro', e:'⚡',  rc:'#27AE60', d:'XP ×1.5 durante 48 horas' },
    { n:'+15 Sparks',       r:'Raro', e:'💥',  rc:'#27AE60', d:'Energía extra a tu balance', bonus:{ sparks:15 } },
    { n:'Título Especial',  r:'Raro', e:'📜',  rc:'#27AE60', d:'Título visible en tu perfil' },
  ],
  loot_e: [
    { n:'Traje del Reino',    r:'Épico', e:'🛡️', rc:'#2980B9', d:'Skin del color de tu reino dominante' },
    { n:'Partículas Épicas',  r:'Épico', e:'🌌', rc:'#2980B9', d:'Partículas animadas en tu perfil' },
    { n:'+30 Sparks',         r:'Épico', e:'💎', rc:'#2980B9', d:'Energía masiva a tu balance', bonus:{ sparks:30 } },
    { n:'Día Libre GRATIS',   r:'Épico', e:'🏖️', rc:'#2980B9', d:'Un Día Libre sin gastar Sparks' },
  ],
}

const SURVEY = [
  { id:'moment', q:'¿En qué momento de tu vida te encuentras?', sub:'Esto calibra el tono de tu plan', opts:[
    { v:'career_start',  l:'Empezando carrera o negocio',           e:'🚀' },
    { v:'career_growth', l:'Quiero dar el siguiente paso profesional',e:'📈' },
    { v:'personal_focus',l:'Enfocado en bienestar personal',         e:'🌱' },
    { v:'explorer_mode', l:'Quiero vivir más y explorar',            e:'🌍' },
    { v:'transition',    l:'En transición — reconstruyendo mi vida', e:'🔄' },
  ]},
  { id:'time', q:'¿Cuánto tiempo puedes dedicar al día?', sub:'Ajusta la intensidad de tus misiones', opts:[
    { v:'micro',    l:'Menos de 20 minutos',   e:'⚡' },
    { v:'moderate', l:'20 a 45 minutos',        e:'🕐' },
    { v:'standard', l:'45 min a 1.5 horas',     e:'🕑' },
    { v:'deep',     l:'Más de 1.5 horas',       e:'🕒' },
    { v:'variable', l:'Varía — no puedo predecirlo', e:'🎲' },
  ]},
  { id:'realms', q:'¿Qué Reinos quieres activar?', sub:'Selecciona los que más importan (mínimo 2, máximo 5)', multi:true, min:2, max:5,
    opts: Object.values(REALMS).map(r => ({ v:r.id, l:r.name, e:r.emoji, sub2:r.area, col:r.color }))
  },
  { id:'primary', q:'¿Tu Reino más urgente ahora mismo?', sub:'Recibirá más misiones en tu plan', dynRealms:true },
  { id:'motivation', q:'¿Qué te motiva cuando las cosas se complican?', sub:'Tu motor interno diseña las recompensas', opts:[
    { v:'results',    l:'Ver resultados y números concretos', e:'📊' },
    { v:'progress',   l:'Sentir que avanzo aunque sea poco',  e:'➡️' },
    { v:'rewards',    l:'Las recompensas y sorpresas del camino', e:'🎁' },
    { v:'commitment', l:'El compromiso conmigo mismo',        e:'💪' },
  ]},
  { id:'obstacle', q:'¿Tu mayor obstáculo para cumplir metas?', sub:'Activamos mecánicas para compensarlo', opts:[
    { v:'time',        l:'Me falta tiempo real en el día',  e:'⏰' },
    { v:'consistency', l:'Empiezo pero no termino',          e:'💨' },
    { v:'direction',   l:'No sé por dónde empezar',          e:'🧭' },
    { v:'burnout',     l:'Me exijo demasiado y me agoto',    e:'🥵' },
  ]},
  { id:'goal', q:'¿Qué quieres lograr en 3 meses?', sub:'Crea tu primera Epic Quest personalizada', text:true, ph:'Ej: Lanzar mi negocio, bajar 5kg, aprender guitarra...', opts:[
    { v:'career_win',       l:'Un logro profesional significativo',   e:'🏆' },
    { v:'health_transform', l:'Una transformación en mi salud',        e:'💪' },
    { v:'financial_goal',   l:'Alcanzar una meta financiera',          e:'💰' },
    { v:'experience',       l:'Vivir experiencia que siempre postergué',e:'✈️' },
  ]},
]

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════
function getLvl(xp = 0) {
  let cur = LEVELS[0]
  for (const l of LEVELS) { if (xp >= l.xp) cur = l; else break }
  const idx  = LEVELS.indexOf(cur)
  const next = LEVELS[idx + 1] || cur
  const pct  = next.xp > cur.xp ? Math.min(100, ((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100
  return { level:cur.l, title:cur.title, unlock:cur.unlock, pct, toNext:Math.max(0, next.xp - xp) }
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function genMissions(surveyData) {
  if (!surveyData?.realms?.length) return []
  const primary = surveyData.primary || surveyData.realms[0]
  const ms = []
  surveyData.realms.forEach(rid => {
    const pool  = ACTIVITIES[rid] || []
    const count = rid === primary ? 2 : 1
    ;[...pool].sort(() => Math.random() - 0.5).slice(0, count).forEach((t, i) => {
      ms.push({ id:`${rid}_${i}_${Date.now()}`, realmId:rid, title:t, xp:10, sparks:2, completed:false })
    })
  })
  return ms
}

function getLoot(type) {
  const pool = LOOT_POOLS[type] || LOOT_POOLS.loot_c
  return pool[Math.floor(Math.random() * pool.length)]
}

// ═══════════════════════════════════════════════════════════
//  CSS
// ═══════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Sans:wght@400;500&family=Orbitron:wght@700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#0A0A0F;color:#fff;font-family:'DM Sans',sans-serif;height:100%;overflow:hidden;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#2A2A3A;border-radius:2px;}
.root{position:relative;width:100%;max-width:430px;height:100vh;margin:0 auto;overflow:hidden;background:#0A0A0F;}
.screen{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:80px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{transform:scale(0);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes floatXP{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-100px) scale(1.5)}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.06);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(232,197,71,.3)}50%{box-shadow:0 0 28px rgba(232,197,71,.7)}}
@keyframes shake{0%,100%{transform:rotate(0deg)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}
@keyframes confetti{to{transform:translateY(200px) rotate(720deg);opacity:0}}
@keyframes fire{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
@keyframes levelUp{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
.fadeUp{animation:fadeUp .4s ease forwards;}
.popIn{animation:popIn .5s cubic-bezier(.175,.885,.32,1.275) forwards;}
.slideUp{animation:slideUp .35s cubic-bezier(.34,1.56,.64,1) forwards;}
.shimmer{background:linear-gradient(90deg,#E8C547 0%,#FF6B35 40%,#E8C547 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 2.5s linear infinite;}
.btn{border:none;cursor:pointer;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:16px;border-radius:14px;padding:15px 20px;width:100%;transition:all .15s;outline:none;letter-spacing:.3px;}
.btn-gold{background:#E8C547;color:#0A0A0F;}.btn-gold:hover{box-shadow:0 4px 22px rgba(232,197,71,.4);}.btn-gold:active{transform:scale(.97);}
.btn-ghost{background:transparent;color:#8A8A9A;border:1px solid #2A2A3A;}.btn-ghost:hover{border-color:#E8C547;color:#E8C547;}
.btn-danger{background:rgba(192,57,43,.13);color:#E74C3C;border:1px solid rgba(192,57,43,.3);}
.btn:disabled{opacity:.38;cursor:not-allowed;}
.inp{background:#12121C;border:1.5px solid #2A2A3A;border-radius:12px;padding:14px 16px;color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;width:100%;outline:none;transition:border-color .2s;}
.inp:focus{border-color:#E8C547;box-shadow:0 0 0 3px rgba(232,197,71,.1);}
.inp::placeholder{color:#3A3A4A;}
.inp.err{border-color:#C0392B;}
.card{background:#12121C;border:1px solid #2A2A3A;border-radius:16px;padding:16px;}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#12121C;border-top:1px solid #2A2A3A;display:flex;z-index:100;padding-bottom:max(env(safe-area-inset-bottom,0px),8px);}
.ntab{flex:1;display:flex;flex-direction:column;align-items:center;padding:10px 4px 6px;cursor:pointer;border:none;background:transparent;color:#3A3A5A;font-family:'DM Sans',sans-serif;font-size:10px;gap:3px;transition:color .2s;}
.ntab.on{color:#E8C547;}.ntab:active{transform:scale(.88);}
.xpbar{height:5px;background:#1A1A2E;border-radius:3px;overflow:hidden;}
.xpfill{height:100%;border-radius:3px;transition:width .9s cubic-bezier(.4,0,.2,1);}
.mc{border-radius:14px;padding:13px 13px 13px 17px;display:flex;align-items:center;gap:11px;cursor:pointer;transition:transform .15s,opacity .25s;margin-bottom:8px;position:relative;overflow:hidden;border:1px solid #2A2A3A;}
.mc:active{transform:scale(.97);}
.mc.done{opacity:.38;}
.tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:8px;font-family:'Orbitron',monospace;font-size:10px;font-weight:700;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.modal{background:#12121C;border-radius:24px 24px 0 0;padding:28px 22px 44px;width:100%;max-width:430px;border-top:1px solid #2A2A3A;animation:slideUp .3s cubic-bezier(.34,1.56,.64,1);}
.loot-bg{position:fixed;inset:0;background:#0A0A0F;z-index:400;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;}
.float-reward{position:fixed;font-family:'Orbitron',monospace;font-size:22px;font-weight:700;pointer-events:none;z-index:350;animation:floatXP 1.5s ease forwards;}
.sopt{background:#12121C;border:2px solid #2A2A3A;border-radius:13px;padding:12px 14px;cursor:pointer;transition:border-color .2s,background .2s;display:flex;align-items:center;gap:10px;}
.sopt.sel{border-color:#E8C547;background:rgba(232,197,71,.07);}
.chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-size:13px;font-family:'Rajdhani',sans-serif;font-weight:600;cursor:pointer;transition:all .2s;}
.err-box{background:rgba(192,57,43,.12);border:1px solid rgba(192,57,43,.35);border-radius:10px;padding:10px 14px;font-size:13px;color:#E74C3C;display:flex;align-items:center;gap:8px;}
.pw-wrap{position:relative;}.pw-eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8A8A9A;font-size:18px;padding:4px;}
`

// ═══════════════════════════════════════════════════════════
//  MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════
function Spin() {
  return <div style={{width:36,height:36,border:'3px solid #1A1A2E',borderTop:'3px solid #E8C547',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
}

function Avatar({ profile, size = 88 }) {
  const { level } = getLvl(profile?.xp || 0)
  const rid = profile?.surveyData?.primary || profile?.activeRealms?.[0]
  const r   = rid ? REALMS[rid] : null
  const rc  = r?.color || '#E8C547'
  const hasAura = level >= 5
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {hasAura && <div style={{position:'absolute',inset:-6,borderRadius:'50%',border:`2px solid ${rc}44`,animation:'pulse 2.5s infinite'}}/>}
      <div style={{width:size,height:size,borderRadius:'50%',background:`${rc}18`,border:`3px solid ${rc}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.38,boxShadow:hasAura?`0 0 30px ${rc}33`:'none',transition:'all .5s',position:'relative',zIndex:1}}>
        {r?.emoji || '⚔️'}
      </div>
      {level >= 9 && <div style={{position:'absolute',bottom:-2,right:-2,background:'#0A0A0F',border:`2px solid ${rc}`,borderRadius:'50%',width:26,height:26,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>{r?.fEmoji || '🥚'}</div>}
    </div>
  )
}

function StatBar({ profile }) {
  const { level, title, pct, toNext } = getLvl(profile?.xp || 0)
  const rid = profile?.surveyData?.primary || profile?.activeRealms?.[0]
  const rc  = (rid && REALMS[rid]?.color) || '#E8C547'
  return (
    <div style={{padding:'14px 20px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:10}}>
        <div>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:9,color:'#8A8A9A',letterSpacing:1.5,textTransform:'uppercase',marginBottom:2}}>Nivel</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:34,fontWeight:700,color:'#E8C547',lineHeight:1}}>{level}</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#8A8A9A'}}>{title}</div>
        </div>
        <div style={{display:'flex',gap:20,alignItems:'center'}}>
          {[{e:'✨',v:profile?.sparks||0,l:'Sparks'},{e:'🔥',v:profile?.streak||0,l:'Racha',fire:true}].map(s=>(
            <div key={s.l} style={{textAlign:'center'}}>
              <div style={{fontSize:18,animation:s.fire?'fire .9s ease infinite':'none'}}>{s.e}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:700,color:s.fire?'#FF6B35':'#E8C547'}}>{s.v}</div>
              <div style={{fontSize:10,color:'#8A8A9A'}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
        <span style={{fontSize:11,color:'#8A8A9A'}}>{profile?.xp||0} XP total</span>
        <span style={{fontSize:11,color:'#8A8A9A'}}>{toNext} XP → Nv {level+1}</span>
      </div>
      <div className='xpbar'><div className='xpfill' style={{width:`${pct}%`,background:`linear-gradient(90deg,${rc},#E8C547)`}}/></div>
    </div>
  )
}

function MissionCard({ m, onDone }) {
  const r = REALMS[m.realmId]
  return (
    <div className={`mc${m.completed?' done':''}`} onClick={()=>{ if(!m.completed) onDone(m) }}
      style={{background:'#12121C',borderLeft:`4px solid ${r?.color||'#E8C547'}`}}>
      <div style={{width:36,height:36,borderRadius:9,background:m.completed?'#27AE6018':((r?.color||'#E8C547')+'18'),border:`2px solid ${m.completed?'#27AE60':(r?.color||'#2A2A3A')}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,transition:'all .3s'}}>
        {m.completed?'✓':r?.emoji}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:500,color:m.completed?'#8A8A9A':'#FFFFFF',textDecoration:m.completed?'line-through':'none',lineHeight:1.35,marginBottom:5}}>{m.title}</div>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
          <span className='tag' style={{background:'rgba(232,197,71,.1)',color:'#E8C547'}}>+{m.xp} XP</span>
          <span className='tag' style={{background:'rgba(232,197,71,.07)',color:'#E8C547'}}>+{m.sparks} ✨</span>
          {r && <span className='tag' style={{background:`${r.color}18`,color:r.color}}>{r.emoji} {r.name}</span>}
        </div>
      </div>
      {!m.completed && <div style={{width:22,height:22,borderRadius:'50%',border:`2px solid ${r?.color||'#2A2A3A'}`,flexShrink:0}}/>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  AUTH SCREEN
// ═══════════════════════════════════════════════════════════
function AuthScreen({ onAuth }) {
  const [tab,    setTab]    = useState('reg')
  const [f,      setF]      = useState({ username:'', email:'', password:'', confirm:'' })
  const [showPw, setShowPw] = useState(false)
  const [err,    setErr]    = useState('')
  const [busy,   setBusy]   = useState(false)
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }))

  const validate = () => {
    if (tab === 'reg') {
      if (f.username.trim().length < 3)  return 'El nombre de héroe debe tener al menos 3 caracteres'
      if (f.username.trim().length > 20) return 'El nombre de héroe no puede superar los 20 caracteres'
    }
    if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Correo electrónico inválido'
    if (f.password.length < 8)    return 'La contraseña debe tener al menos 8 caracteres'
    if (!/\d/.test(f.password))   return 'La contraseña debe incluir al menos un número'
    if (tab === 'reg' && f.password !== f.confirm) return 'Las contraseñas no coinciden'
    return null
  }

  const handleReg = () => {
    setErr(''); const e = validate(); if (e) return setErr(e)
    setBusy(true)
    const users = DB.getUsers()
    if (users[f.email]) { setBusy(false); return setErr('Este correo ya tiene una cuenta. ¿Quieres entrar?') }
    const now = Date.now()
    users[f.email] = { email:f.email, pwHash:DB.hashPw(f.password), createdAt:now }
    DB.saveUsers(users)
    const profile = { username:f.username.trim(), email:f.email, xp:0, sparks:20, streak:0, activeRealms:[], surveyCompleted:false, surveyData:null, createdAt:now, lastActive:now }
    DB.saveProfile(f.email, profile)
    DB.saveSession(f.email)
    setBusy(false)
    onAuth(profile)
  }

  const handleLogin = () => {
    setErr(''); const e = validate(); if (e) return setErr(e)
    setBusy(true)
    const users = DB.getUsers()
    const u = users[f.email]
    if (!u || u.pwHash !== DB.hashPw(f.password)) { setBusy(false); return setErr('Correo o contraseña incorrectos') }
    const profile = DB.getProfile(f.email)
    if (!profile) { setBusy(false); return setErr('Error al cargar perfil.') }
    DB.saveSession(f.email)
    setBusy(false)
    onAuth(profile)
  }

  const submit = tab === 'reg' ? handleReg : handleLogin

  return (
    <div className='screen fadeUp' style={{background:'#0A0A0F',display:'flex',flexDirection:'column',minHeight:'100vh',paddingBottom:0}}>
      <div style={{flex:.42,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'44px 24px 20px',background:'radial-gradient(ellipse at 50% 0%, rgba(232,197,71,.12) 0%, transparent 68%)'}}>
        <div style={{fontFamily:'Orbitron,monospace',fontSize:10,letterSpacing:4,color:'#8A8A9A',marginBottom:10}}>✧ MAKE YOUR LIFE THE GAME ✧</div>
        <div className='shimmer' style={{fontFamily:'Rajdhani,sans-serif',fontSize:72,fontWeight:700,lineHeight:1,letterSpacing:-2}}>LIFEXP</div>
        <div style={{color:'#8A8A9A',fontSize:14,marginTop:12,textAlign:'center',lineHeight:1.55}}>Tu aventura más épica comienza aquí.<br/>Tu progreso. Tu perfil. Tu historia.</div>
      </div>
      <div style={{flex:.58,background:'#12121C',borderRadius:'28px 28px 0 0',padding:'24px 22px 32px',display:'flex',flexDirection:'column',gap:13}}>
        <div style={{display:'flex',background:'#0A0A0F',borderRadius:13,padding:4}}>
          {[['reg','✦ Nuevo Héroe'],['login','Ya soy Héroe']].map(([id,lbl])=>(
            <button key={id} onClick={()=>{setTab(id);setErr('')}}
              style={{flex:1,padding:'10px',borderRadius:10,border:'none',cursor:'pointer',background:tab===id?'#E8C547':'transparent',color:tab===id?'#0A0A0F':'#8A8A9A',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,transition:'all .2s'}}>
              {lbl}
            </button>
          ))}
        </div>
        {tab==='reg' && (
          <div>
            <label style={{fontSize:10,color:'#8A8A9A',display:'block',marginBottom:5,fontFamily:'Orbitron,monospace',letterSpacing:1}}>NOMBRE DE HÉROE</label>
            <input className='inp' placeholder='Tu nombre en el juego (3-20 caracteres)' value={f.username} onChange={upd('username')} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
        )}
        <div>
          <label style={{fontSize:10,color:'#8A8A9A',display:'block',marginBottom:5,fontFamily:'Orbitron,monospace',letterSpacing:1}}>CORREO ELECTRÓNICO</label>
          <input className={`inp${err&&err.toLowerCase().includes('correo')?' err':''}`} type='email' placeholder='tu@correo.com' value={f.email} onChange={upd('email')} onKeyDown={e=>e.key==='Enter'&&submit()}/>
        </div>
        <div>
          <label style={{fontSize:10,color:'#8A8A9A',display:'block',marginBottom:5,fontFamily:'Orbitron,monospace',letterSpacing:1}}>CONTRASEÑA</label>
          <div className='pw-wrap'>
            <input className={`inp${err&&err.toLowerCase().includes('contraseña')?' err':''}`} type={showPw?'text':'password'} placeholder='Mínimo 8 caracteres + 1 número' value={f.password} onChange={upd('password')} style={{paddingRight:44}} onKeyDown={e=>e.key==='Enter'&&submit()}/>
            <button className='pw-eye' onClick={()=>setShowPw(p=>!p)}>{showPw?'🙈':'👁️'}</button>
          </div>
        </div>
        {tab==='reg' && (
          <div>
            <label style={{fontSize:10,color:'#8A8A9A',display:'block',marginBottom:5,fontFamily:'Orbitron,monospace',letterSpacing:1}}>CONFIRMAR CONTRASEÑA</label>
            <input className={`inp${err&&err.includes('coinciden')?' err':''}`} type={showPw?'text':'password'} placeholder='Repite tu contraseña' value={f.confirm} onChange={upd('confirm')} onKeyDown={e=>e.key==='Enter'&&submit()}/>
          </div>
        )}
        {err && (
          <div className='err-box'>
            <span style={{fontSize:18}}>⚠️</span>
            <span>{err}</span>
            {err.includes('ya tiene una cuenta') && (
              <button onClick={()=>setTab('login')} style={{marginLeft:'auto',background:'none',border:'none',color:'#E8C547',fontFamily:'Rajdhani,sans-serif',fontWeight:700,cursor:'pointer',fontSize:12,whiteSpace:'nowrap'}}>Ir al login →</button>
            )}
          </div>
        )}
        <button className='btn btn-gold' onClick={submit} disabled={busy} style={{marginTop:4}}>
          {busy ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>Cargando... <Spin/></span>
            : tab==='reg' ? '⚔️ Comenzar mi aventura' : '🚀 Entrar al juego'}
        </button>
        {tab==='reg' && <div style={{textAlign:'center',fontSize:12,color:'#3A3A4A',lineHeight:1.5}}>Al registrarte, tu perfil queda guardado de forma permanente. Solo tú puedes acceder a él.</div>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  SURVEY SCREEN
// ═══════════════════════════════════════════════════════════
function SurveyScreen({ onComplete, isRedo }) {
  const [step, setStep] = useState(0)
  const [ans,  setAns]  = useState({})
  const [txt,  setTxt]  = useState('')

  const qs = SURVEY.map(q => {
    if (q.dynRealms) {
      const sel = ans.realms || []
      return { ...q, opts: sel.map(id => ({ v:id, l:REALMS[id]?.name, e:REALMS[id]?.emoji, sub2:REALMS[id]?.area, col:REALMS[id]?.color })) }
    }
    return q
  })
  const q     = qs[step]
  const total = qs.length

  const sel = v => {
    if (q.multi) {
      const cur = ans[q.id] || []
      setAns({ ...ans, [q.id]: cur.includes(v) ? cur.filter(x=>x!==v) : cur.length < q.max ? [...cur,v] : cur })
    } else {
      setAns({ ...ans, [q.id]: v })
    }
  }

  const canGo = () => {
    if (q.multi) return (ans[q.id]||[]).length >= (q.min||1)
    if (q.text)  return true
    return !!ans[q.id]
  }

  const next = () => {
    const d = { ...ans }
    if (q.text && txt) d[q.id] = txt
    if (step < total - 1) { setStep(step+1) }
    else { onComplete({ ...d, realms:d.realms||[], primary:d.primary||(d.realms?.[0]) }) }
  }

  return (
    <div className='screen fadeUp' style={{background:'#0A0A0F',display:'flex',flexDirection:'column',minHeight:'100vh',paddingBottom:20}}>
      <div style={{padding:'18px 20px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <span style={{fontSize:11,color:'#8A8A9A',fontFamily:'Orbitron,monospace'}}>{step+1} / {total}</span>
          <span style={{fontSize:11,color:'#E8C547',fontFamily:'Orbitron,monospace',letterSpacing:1}}>{isRedo?'ACTUALIZAR PLAN':'CONOCIENDO AL HÉROE'}</span>
        </div>
        <div style={{height:4,background:'#1A1A2E',borderRadius:2,overflow:'hidden'}}>
          <div style={{height:'100%',background:'linear-gradient(90deg,#E8C547,#FF6B35)',width:`${((step+1)/total)*100}%`,transition:'width .4s',borderRadius:2}}/>
        </div>
      </div>
      <div className='fadeUp' key={step} style={{padding:'22px 20px',flex:1}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:21,fontWeight:700,color:'#FFFFFF',lineHeight:1.3,marginBottom:5}}>{q.q}</div>
        <div style={{color:'#8A8A9A',fontSize:13,marginBottom:18,lineHeight:1.4}}>{q.sub}</div>
        {q.multi && <div style={{color:'#E8C547',fontSize:10,fontFamily:'Orbitron,monospace',marginBottom:10,letterSpacing:1}}>{(ans[q.id]||[]).length}/{q.max} — MÍNIMO {q.min}</div>}
        {q.text && (
          <div style={{marginBottom:14}}>
            <input className='inp' placeholder={q.ph} value={txt} onChange={e=>setTxt(e.target.value)} style={{marginBottom:12}}/>
            <div style={{color:'#3A3A4A',fontSize:12,textAlign:'center',marginBottom:10}}>— o elige una opción —</div>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {(q.opts||[]).map(o => {
            const on = q.multi ? (ans[q.id]||[]).includes(o.v) : ans[q.id]===o.v
            return (
              <div key={o.v} className={`sopt${on?' sel':''}`} onClick={()=>sel(o.v)}
                style={{borderColor:on?(o.col||'#E8C547'):'#2A2A3A',background:on?`${o.col||'#E8C547'}10`:'#12121C'}}>
                <div style={{width:34,height:34,borderRadius:9,background:on?`${o.col||'#E8C547'}22`:'#1A1A2E',border:`2px solid ${on?(o.col||'#E8C547'):'transparent'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0,transition:'all .2s'}}>{o.e}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:500,color:on?'#FFFFFF':'#CCCCCC'}}>{o.l}</div>
                  {o.sub2 && <div style={{fontSize:12,color:'#8A8A9A',marginTop:1}}>{o.sub2}</div>}
                </div>
                {on && <div style={{fontSize:14,color:o.col||'#E8C547'}}>✓</div>}
              </div>
            )
          })}
        </div>
      </div>
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:9}}>
        <button className='btn btn-gold' onClick={next} disabled={!canGo()}>
          {step < total-1 ? 'Siguiente →' : '🚀 Ver mi plan personalizado'}
        </button>
        {step > 0 && <button className='btn btn-ghost' onClick={()=>setStep(s=>s-1)}>← Anterior</button>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  HOME SCREEN
// ═══════════════════════════════════════════════════════════
function HomeScreen({ profile, missions, onDone, nav }) {
  const rid  = profile?.surveyData?.primary || profile?.activeRealms?.[0]
  const rc   = (rid && REALMS[rid]?.color) || '#E8C547'
  const done = missions.filter(m=>m.completed).length
  const now  = new Date()
  const days   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return (
    <div className='screen' style={{background:'#0A0A0F'}}>
      <div style={{background:`linear-gradient(160deg,${rc}1E 0%,transparent 55%)`,padding:'22px 20px 16px',borderBottom:`1px solid ${rc}22`}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:'#8A8A9A',fontFamily:'Orbitron,monospace',letterSpacing:1,marginBottom:2}}>{days[now.getDay()]} {now.getDate()} de {months[now.getMonth()]}</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:23,fontWeight:700,color:'#FFFFFF',lineHeight:1.2}}>
              {now.getHours()<12?'Buenos días':now.getHours()<18?'Buenas tardes':'Buenas noches'}, <span style={{color:'#E8C547'}}>{profile?.username}</span>
              {(profile?.streak||0)>0 && <span style={{marginLeft:8,fontSize:18,animation:'fire .9s ease infinite'}}>🔥{profile.streak}</span>}
            </div>
          </div>
          <Avatar profile={profile} size={74}/>
        </div>
        <StatBar profile={profile}/>
      </div>
      {profile?.surveyData?.goal && (
        <div style={{margin:'14px 20px 0',background:'rgba(232,197,71,.05)',border:'1px solid rgba(232,197,71,.2)',borderRadius:13,padding:'10px 14px',display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:22}}>🗺️</span>
          <div>
            <div style={{fontSize:10,color:'#E8C547',fontFamily:'Orbitron,monospace',letterSpacing:1,marginBottom:2}}>EPIC QUEST ACTIVA</div>
            <div style={{fontSize:13,color:'#CCCCCC'}}>{typeof profile.surveyData.goal==='string'?profile.surveyData.goal:'Alcanzar tu meta en 3 meses'}</div>
          </div>
        </div>
      )}
      <div style={{padding:'16px 20px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,color:'#FFFFFF'}}>Misiones del Día</div>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:done===missions.length&&missions.length>0?'#27AE60':'#E8C547'}}>{done}/{missions.length}</div>
        </div>
        {done===missions.length && missions.length>0 && (
          <div className='fadeUp' style={{background:'rgba(39,174,96,.1)',border:'1px solid rgba(39,174,96,.3)',borderRadius:13,padding:'12px 14px',marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:24}}>🏆</span>
            <div style={{color:'#27AE60',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15}}>¡Todas completadas! ¡Héroe del día!</div>
          </div>
        )}
        {missions.length === 0 ? (
          <div style={{textAlign:'center',padding:'30px 20px',color:'#8A8A9A',background:'#12121C',borderRadius:16,border:'1px dashed #2A2A3A'}}>
            <div style={{fontSize:40,marginBottom:10}}>🗡️</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:700,marginBottom:4}}>Sin misiones activas</div>
            <div style={{fontSize:13,marginBottom:14}}>Completa la encuesta para recibir tu plan personalizado</div>
            <button className='btn btn-gold' onClick={()=>nav('survey')} style={{width:'auto',padding:'10px 24px',fontSize:14}}>Iniciar Encuesta →</button>
          </div>
        ) : missions.map(m => <MissionCard key={m.id} m={m} onDone={onDone}/>)}
      </div>
      {profile?.activeRealms?.length>0 && (
        <div style={{padding:'16px 20px 0'}}>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,fontWeight:700,color:'#8A8A9A',marginBottom:8}}>Mis Reinos Activos</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {profile.activeRealms.map(id=>{ const r=REALMS[id]; if(!r) return null; return <div key={id} className='chip' onClick={()=>nav('realm',{id})} style={{background:`${r.color}18`,border:`1px solid ${r.color}50`,color:r.color}}>{r.emoji} {r.name}</div> })}
          </div>
        </div>
      )}
      <div style={{height:16}}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  ENCYCLOPEDIA
// ═══════════════════════════════════════════════════════════
function EncycScreen({ nav }) {
  return (
    <div className='screen' style={{background:'#0A0A0F'}}>
      <div style={{padding:'22px 20px 14px'}}>
        <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#8A8A9A',letterSpacing:2,marginBottom:5}}>ENCICLOPEDIA</div>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:28,fontWeight:700,color:'#FFFFFF'}}>Los 7 Reinos</div>
      </div>
      <div style={{padding:'0 20px',display:'flex',flexDirection:'column',gap:11}}>
        {Object.values(REALMS).map(r => (
          <div key={r.id} onClick={()=>nav('realm',{id:r.id})} style={{background:`linear-gradient(130deg,${r.color}16 0%,#12121C 100%)`,border:`1px solid ${r.color}44`,borderRadius:15,padding:'13px',cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:50,height:50,borderRadius:13,background:`${r.color}22`,border:`2px solid ${r.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:23,flexShrink:0}}>{r.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:700,color:r.color,marginBottom:1}}>{r.name}</div>
              <div style={{color:'#8A8A9A',fontSize:12,marginBottom:3}}>{r.area}</div>
              <div style={{color:'#AAAAAA',fontSize:12,lineHeight:1.4}}>{r.desc.slice(0,72)}...</div>
            </div>
            <div style={{color:'#3A3A4A',fontSize:22}}>›</div>
          </div>
        ))}
      </div>
      <div style={{height:16}}/>
    </div>
  )
}

function RealmScreen({ realmId, nav }) {
  const r    = REALMS[realmId]; if (!r) return null
  const acts = ACTIVITIES[realmId] || []
  return (
    <div className='screen' style={{background:'#0A0A0F'}}>
      <div style={{background:`linear-gradient(155deg,${r.color}28 0%,transparent 55%)`,padding:'20px 20px 16px',borderBottom:`1px solid ${r.color}30`}}>
        <button onClick={()=>nav('encyclopedia')} style={{background:'none',border:'none',color:'#8A8A9A',fontSize:14,cursor:'pointer',marginBottom:14,display:'flex',alignItems:'center',gap:4,fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>← Volver</button>
        <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:13}}>
          <div style={{width:56,height:56,borderRadius:14,background:`${r.color}22`,border:`2px solid ${r.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:27}}>{r.emoji}</div>
          <div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:28,fontWeight:700,color:r.color,lineHeight:1}}>{r.name}</div>
            <div style={{color:'#8A8A9A',fontSize:13}}>{r.area}</div>
          </div>
        </div>
        <div style={{background:'rgba(0,0,0,.3)',borderRadius:11,padding:'12px 13px',borderLeft:`3px solid ${r.color}`}}>
          <div style={{color:'#8A8A9A',fontSize:13,lineHeight:1.5}}>{r.desc}</div>
        </div>
      </div>
      <div style={{padding:'13px 20px',display:'flex',gap:9}}>
        {[{e:'🪙',l:r.token,s:'Token'},{e:r.fEmoji,l:'Familiar',s:'Tu compañero'}].map((x,i)=>(
          <div key={i} style={{flex:1,background:'#12121C',borderRadius:12,padding:'11px',border:'1px solid #2A2A3A',textAlign:'center'}}>
            <div style={{fontSize:20}}>{x.e}</div>
            <div style={{color:r.color,fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,marginTop:3}}>{x.l}</div>
            <div style={{color:'#8A8A9A',fontSize:10}}>{x.s}</div>
          </div>
        ))}
      </div>
      <div style={{padding:'0 20px'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:700,color:'#FFFFFF',marginBottom:9}}>Actividades de {r.name}</div>
        {acts.map((t,i)=>(
          <div key={i} className='card' style={{marginBottom:8,borderLeft:`3px solid ${r.color}`,background:'#12121C'}}>
            <div style={{fontSize:14,color:'#FFFFFF',marginBottom:6,lineHeight:1.35}}>{t}</div>
            <div style={{display:'flex',gap:5}}>
              <span className='tag' style={{background:'rgba(232,197,71,.1)',color:'#E8C547'}}>+10 XP</span>
              <span className='tag' style={{background:'rgba(232,197,71,.07)',color:'#E8C547'}}>+2 ✨</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{height:16}}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  LEVEL MAP
// ═══════════════════════════════════════════════════════════
function LevelMapScreen({ profile }) {
  const { level } = getLvl(profile?.xp||0)
  const rid = profile?.surveyData?.primary || profile?.activeRealms?.[0]
  const rc  = (rid && REALMS[rid]?.color) || '#E8C547'
  return (
    <div className='screen' style={{background:'#0A0A0F'}}>
      <div style={{padding:'22px 20px 14px'}}>
        <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#8A8A9A',letterSpacing:2,marginBottom:5}}>PROGRESIÓN</div>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:28,fontWeight:700,color:'#FFFFFF'}}>Mapa de Niveles</div>
      </div>
      <div style={{padding:'0 20px'}}>
        {LEVELS.map((lv,i) => {
          const past=level>lv.l, curr=level===lv.l, future=level<lv.l
          return (
            <div key={lv.l} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:42}}>
                {i>0 && <div style={{width:2,height:14,background:past||curr?rc:'#2A2A3A'}}/>}
                <div style={{width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Orbitron,monospace',fontSize:11,fontWeight:700,border:`2px solid ${curr?'#E8C547':past?rc:'#2A2A3A'}`,background:curr?'#E8C54718':past?rc+'18':'#12121C',color:curr?'#E8C547':past?rc:'#3A3A4A',boxShadow:curr?`0 0 18px ${rc}55`:'none',animation:curr?'glow 2s infinite':'none',flexShrink:0}}>
                  {past?'✓':lv.l}
                </div>
                {i<LEVELS.length-1 && <div style={{width:2,height:14,background:past?rc:'#2A2A3A'}}/>}
              </div>
              <div style={{flex:1,paddingBottom:4,opacity:future?.5:1,paddingTop:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:4}}>
                  <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,fontWeight:700,color:curr?'#E8C547':past?'#FFFFFF':'#8A8A9A'}}>
                    {lv.title}{curr&&<span style={{fontSize:9,color:'#E8C547',fontFamily:'Orbitron,monospace'}}> ← ESTÁS AQUÍ</span>}
                  </span>
                  {future && <span style={{fontSize:10,color:'#3A3A4A',fontFamily:'Orbitron,monospace'}}>{lv.xp.toLocaleString()} XP</span>}
                </div>
                <div style={{color:'#8A8A9A',fontSize:12,marginTop:2}}>🔓 {lv.unlock}</div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{height:16}}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  LOOT SCREEN
// ═══════════════════════════════════════════════════════════
function LootScreen({ boxType, onDone }) {
  const [phase, setPhase] = useState('idle')
  const reward = useRef(null)
  useEffect(() => {
    setTimeout(()=>setPhase('shaking'), 300)
    setTimeout(()=>setPhase('opening'), 1700)
    setTimeout(()=>{ reward.current=getLoot(boxType); setPhase('revealed') }, 2700)
  }, [])
  const cfg = { loot_e:{emoji:'💎',label:'ÉPICA',color:'#2980B9'}, loot_r:{emoji:'💚',label:'RARA',color:'#27AE60'}, loot_c:{emoji:'📦',label:'COMÚN',color:'#8A8A9A'} }[boxType]||{emoji:'📦',label:'COMÚN',color:'#8A8A9A'}
  return (
    <div className='loot-bg'>
      <div style={{fontFamily:'Orbitron,monospace',fontSize:12,color:'#8A8A9A',letterSpacing:3}}>LOOT BOX {cfg.label}</div>
      {phase!=='revealed' ? (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20}}>
          <div style={{fontSize:100,animation:phase==='shaking'?'shake .2s infinite':phase==='opening'?'popIn .4s ease':'none'}}>{cfg.emoji}</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,fontWeight:600,color:phase==='opening'?'#FF6B35':'#8A8A9A'}}>
            {phase==='idle'?'Preparando...':phase==='shaking'?'Algo se despierta...':'¡Se abre!'}
          </div>
          {phase==='shaking' && [...Array(8)].map((_,i)=>(
            <div key={i} style={{position:'fixed',fontSize:16,left:`${15+Math.random()*70}%`,top:`${15+Math.random()*70}%`,animation:`confetti ${.7+Math.random()*.8}s ease forwards`,animationDelay:`${Math.random()*.4}s`,pointerEvents:'none'}}>
              {['✨','⭐','💫','🌟'][Math.floor(Math.random()*4)]}
            </div>
          ))}
        </div>
      ) : (
        <div className='popIn' style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:24,maxWidth:320,textAlign:'center'}}>
          <div style={{width:110,height:110,borderRadius:'50%',background:`${reward.current?.rc||cfg.color}22`,border:`3px solid ${reward.current?.rc||cfg.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:50,boxShadow:`0 0 40px ${reward.current?.rc||cfg.color}44`,animation:'glow 1.5s infinite'}}>
            {reward.current?.e}
          </div>
          <div>
            <div style={{display:'inline-block',padding:'3px 12px',borderRadius:20,background:`${reward.current?.rc||cfg.color}28`,color:reward.current?.rc||cfg.color,fontFamily:'Orbitron,monospace',fontSize:10,fontWeight:700,marginBottom:8}}>{reward.current?.r?.toUpperCase()}</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:26,fontWeight:700,color:'#FFFFFF',marginBottom:4}}>{reward.current?.n}</div>
            <div style={{color:'#8A8A9A',fontSize:14}}>{reward.current?.d}</div>
          </div>
          {reward.current?.bonus && (
            <div style={{background:'rgba(232,197,71,.07)',border:'1px solid rgba(232,197,71,.25)',borderRadius:11,padding:'9px 16px',fontSize:13,color:'#E8C547',fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>
              🎁 {reward.current.bonus.xp?`+${reward.current.bonus.xp} XP aplicados`:reward.current.bonus.sparks?`+${reward.current.bonus.sparks} Sparks aplicados`:'Bonus activado'}
            </div>
          )}
          <button className='btn btn-gold' style={{maxWidth:260}} onClick={()=>onDone(reward.current)}>Guardar en Colección 📥</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  VAULT SCREEN
// ═══════════════════════════════════════════════════════════
function VaultScreen({ profile, onBuy }) {
  const [confirm, setConfirm] = useState(null)
  const [loot,    setLoot]    = useState(null)
  const [toast,   setToast]   = useState(null)
  const sp = profile?.sparks || 0
  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null), 2400) }

  if (loot) return <LootScreen boxType={loot} onDone={reward=>{ setLoot(null); onBuy({id:loot,type:'loot'},reward); showToast(reward?.bonus?.sparks?`💥 +${reward.bonus.sparks} Sparks!`:reward?.bonus?.xp?`⭐ +${reward.bonus.xp} XP!`:`🎉 ${reward?.n} guardado!`) }}/>

  const cats = [{t:'antiburn',l:'Anti-Burnout',e:'🌿'},{t:'boost',l:'Power-Ups',e:'⚡'},{t:'loot',l:'Loot Boxes',e:'📦'},{t:'salvavidas',l:'Salvavidas',e:'🆘'}]

  return (
    <div className='screen' style={{background:'#0A0A0F'}}>
      <div style={{padding:'22px 20px 14px',borderBottom:'1px solid #2A2A3A'}}>
        <div style={{fontFamily:'Orbitron,monospace',fontSize:10,color:'#8A8A9A',letterSpacing:2,marginBottom:5}}>VAULT DE OCIO</div>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:28,fontWeight:700,color:'#FFFFFF',marginBottom:10}}>Tienda de Sparks</div>
        <div style={{display:'inline-flex',alignItems:'center',gap:9,background:'#1A1A2E',borderRadius:12,padding:'9px 16px',border:'1px solid rgba(232,197,71,.3)'}}>
          <span style={{fontSize:20}}>✨</span>
          <span style={{fontFamily:'Orbitron,monospace',fontSize:22,fontWeight:700,color:'#E8C547'}}>{sp}</span>
          <span style={{color:'#8A8A9A',fontSize:13}}>Sparks disponibles</span>
        </div>
      </div>
      {toast && <div className='slideUp' style={{margin:'10px 20px',background:'rgba(39,174,96,.1)',border:'1px solid rgba(39,174,96,.35)',borderRadius:11,padding:'11px 14px',fontSize:14,color:'#27AE60',fontFamily:'Rajdhani,sans-serif',fontWeight:600}}>{toast}</div>}
      {cats.map(cat => {
        const items = VAULT_ITEMS.filter(i=>i.type===cat.t)
        return (
          <div key={cat.t} style={{padding:'16px 20px 0'}}>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:14,fontWeight:700,color:'#8A8A9A',marginBottom:8}}>{cat.e} {cat.l}</div>
            {items.map(item => {
              const can = sp >= item.cost
              return (
                <div key={item.id} className='card' style={{marginBottom:8,display:'flex',alignItems:'center',gap:11,opacity:can?1:.4}}>
                  <div style={{fontSize:32,flexShrink:0}}>{item.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:15,fontWeight:700,color:'#FFFFFF'}}>{item.name}</div>
                    <div style={{color:'#8A8A9A',fontSize:12}}>{item.desc}</div>
                    {!can && <div style={{color:'#E74C3C',fontSize:11,marginTop:2}}>Necesitas {item.cost-sp} ✨ más</div>}
                  </div>
                  <button onClick={()=>can&&setConfirm(item)} disabled={!can}
                    style={{background:can?'rgba(232,197,71,.1)':'#1A1A2E',border:`1px solid ${can?'#E8C547':'#2A2A3A'}`,borderRadius:10,padding:'8px 10px',cursor:can?'pointer':'not-allowed',display:'flex',flexDirection:'column',alignItems:'center',gap:1,minWidth:52}}>
                    <span style={{fontSize:14}}>✨</span>
                    <span style={{fontFamily:'Orbitron,monospace',fontSize:13,fontWeight:700,color:can?'#E8C547':'#3A3A4A'}}>{item.cost}</span>
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}
      {confirm && (
        <div className='modal-bg' onClick={()=>setConfirm(null)}>
          <div className='modal' onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:58,marginBottom:12}}>{confirm.emoji}</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:21,fontWeight:700,color:'#FFFFFF',marginBottom:8}}>{confirm.name}</div>
              <div style={{color:'#8A8A9A',fontSize:14,marginBottom:14}}>{confirm.desc}</div>
              <div style={{background:'#1A1A2E',borderRadius:12,padding:'10px 20px',display:'inline-flex',gap:10,alignItems:'center'}}>
                <span style={{color:'#8A8A9A',fontSize:13}}>Saldo:</span>
                <span style={{color:'#E8C547',fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:18}}>{sp} ✨</span>
                <span style={{color:'#3A3A4A'}}>→</span>
                <span style={{color:'#E8C547',fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:18}}>{sp-confirm.cost} ✨</span>
              </div>
            </div>
            <div style={{background:'rgba(232,197,71,.04)',border:'1px solid rgba(232,197,71,.15)',borderRadius:11,padding:'10px 13px',color:'#8A8A9A',fontSize:13,fontStyle:'italic',textAlign:'center',marginBottom:16}}>
              "El descanso también es parte del camino, héroe." 🐾
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <button className='btn btn-gold' onClick={()=>{ onBuy(confirm,null); setConfirm(null); showToast(`✅ ${confirm.name} activado!`); if(confirm.type==='loot') setLoot(confirm.id) }}>
                {confirm.btn} — {confirm.cost} ✨
              </button>
              <button className='btn btn-ghost' onClick={()=>setConfirm(null)}>Seguir en la aventura</button>
            </div>
          </div>
        </div>
      )}
      <div style={{height:16}}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  PROFILE SCREEN
// ═══════════════════════════════════════════════════════════
function ProfileScreen({ profile, nav, onReSurvey, onLogout }) {
  const { level, title } = getLvl(profile?.xp||0)
  const rid = profile?.surveyData?.primary || profile?.activeRealms?.[0]
  const rc  = (rid && REALMS[rid]?.color) || '#E8C547'
  const [showLogout, setShowLogout] = useState(false)
  const createdAt = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'}) : '—'
  return (
    <div className='screen' style={{background:'#0A0A0F'}}>
      <div style={{background:`linear-gradient(165deg,${rc}20 0%,transparent 55%)`,padding:'24px 20px 18px',textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:14}}><Avatar profile={profile} size={108}/></div>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:30,fontWeight:700,color:'#FFFFFF',lineHeight:1}}>{profile?.username}</div>
        <div style={{color:'#8A8A9A',fontSize:12,marginTop:3}}>{profile?.email}</div>
        <div style={{color:rc,fontFamily:'Orbitron,monospace',fontSize:10,marginTop:4,letterSpacing:2}}>{title?.toUpperCase()} · NIVEL {level}</div>
        <div style={{color:'#3A3A5A',fontSize:11,marginTop:5}}>Héroe desde {createdAt}</div>
        <div style={{display:'flex',gap:9,marginTop:14,background:'#12121C',borderRadius:15,padding:'13px',border:'1px solid #2A2A3A'}}>
          {[{l:'XP Total',v:(profile?.xp||0).toLocaleString(),e:'⭐'},{l:'Sparks',v:profile?.sparks||0,e:'✨'},{l:'Racha',v:`${profile?.streak||0}d`,e:'🔥'}].map(s=>(
            <div key={s.l} style={{flex:1,textAlign:'center'}}>
              <div style={{fontSize:18}}>{s.e}</div>
              <div style={{fontFamily:'Orbitron,monospace',fontSize:14,fontWeight:700,color:'#E8C547'}}>{s.v}</div>
              <div style={{color:'#8A8A9A',fontSize:10}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      {profile?.activeRealms?.length>0 && (
        <div style={{padding:'14px 20px 0'}}>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:'#8A8A9A',marginBottom:7}}>Reinos Activos</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
            {profile.activeRealms.map(id=>{ const r=REALMS[id]; return r?(<span key={id} className='chip' style={{background:`${r.color}18`,border:`1px solid ${r.color}50`,color:r.color}}>{r.emoji} {r.name}</span>):null })}
          </div>
        </div>
      )}
      <div style={{padding:'14px 20px 0',display:'flex',flexDirection:'column',gap:8}}>
        {[
          {e:'🗺️',l:'Mapa de Niveles',s:'Tu progresión completa',fn:()=>nav('levelmap')},
          {e:'📖',l:'Enciclopedia de Reinos',s:'Descubre todos los mundos',fn:()=>nav('encyclopedia')},
          {e:'🔄',l:'Rediseñar mi plan',s:'Actualiza tus metas y misiones',fn:onReSurvey},
        ].map(a=>(
          <button key={a.l} onClick={a.fn} style={{background:'#12121C',border:'1px solid #2A2A3A',borderRadius:14,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,cursor:'pointer',textAlign:'left',width:'100%'}}>
            <span style={{fontSize:22}}>{a.e}</span>
            <div style={{flex:1}}>
              <div style={{color:'#FFFFFF',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15}}>{a.l}</div>
              <div style={{color:'#8A8A9A',fontSize:12}}>{a.s}</div>
            </div>
            <span style={{color:'#3A3A4A',fontSize:20}}>›</span>
          </button>
        ))}
        <div style={{height:1,background:'#2A2A3A',margin:'4px 0'}}/>
        <button className='btn btn-danger' onClick={()=>setShowLogout(true)} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
      {showLogout && (
        <div className='modal-bg' onClick={()=>setShowLogout(false)}>
          <div className='modal' onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',marginBottom:22}}>
              <div style={{fontSize:54,marginBottom:12}}>🚪</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,color:'#FFFFFF',marginBottom:8}}>¿Salir, {profile?.username}?</div>
              <div style={{color:'#8A8A9A',fontSize:14,lineHeight:1.55}}>Tu perfil y progreso están guardados de forma segura.</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <button className='btn btn-danger' onClick={onLogout}>Sí, cerrar sesión</button>
              <button className='btn btn-ghost' onClick={()=>setShowLogout(false)}>Quedarme en la aventura</button>
            </div>
          </div>
        </div>
      )}
      <div style={{height:16}}/>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  CELEBRATION
// ═══════════════════════════════════════════════════════════
function Celebration({ reward, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone, reward.levelUp?2800:1600); return()=>clearTimeout(t) },[])
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:300}}>
      <div className='float-reward' style={{color:'#E8C547',top:'36%',left:'18%'}}>+{reward.xp} XP ⭐</div>
      <div className='float-reward' style={{color:'#E8C547',top:'44%',left:'58%',animationDelay:'.18s'}}>+{reward.sparks} ✨</div>
      {reward.levelUp && (
        <div style={{position:'fixed',inset:0,background:'rgba(232,197,71,.1)',backdropFilter:'blur(5px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',animation:'fadeUp .3s ease',pointerEvents:'all'}} onClick={onDone}>
          <div style={{fontSize:80,animation:'levelUp .5s ease'}}>⬆️</div>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:42,fontWeight:700,color:'#E8C547',marginTop:8,animation:'levelUp .5s ease .15s both'}}>¡NIVEL {reward.newLevel}!</div>
          <div style={{color:'#8A8A9A',fontSize:14,marginTop:6}}>{getLvl(reward.newXp).unlock}</div>
          <div style={{color:'#3A3A5A',fontSize:12,marginTop:16}}>Toca para continuar</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  BOTTOM NAV
// ═══════════════════════════════════════════════════════════
function BottomNav({ active, nav }) {
  const tabs = [{id:'home',e:'🏠',l:'Inicio'},{id:'encyclopedia',e:'🌍',l:'Reinos'},{id:'vault',e:'✨',l:'Vault'},{id:'profile',e:'⚔️',l:'Héroe'}]
  return (
    <nav className='nav'>
      {tabs.map(t => (
        <button key={t.id} className={`ntab${active===t.id?' on':''}`} onClick={()=>nav(t.id)}>
          <span style={{fontSize:22}}>{t.e}</span>
          <span>{t.l}</span>
        </button>
      ))}
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [loading,  setLoading]  = useState(true)
  const [profile,  setProfile]  = useState(null)
  const [screen,   setScreen]   = useState('home')
  const [sp,       setSp]       = useState({})
  const [missions, setMissions] = useState([])
  const [celeb,    setCeleb]    = useState(null)

  // ── Bootstrap ────────────────────────────────────────────
  useEffect(() => {
    const session = DB.getSession()
    if (session?.email) {
      const p = DB.getProfile(session.email)
      if (p) {
        setProfile(p)
        setMissions(loadTodayMissions(p))
        setScreen(p.surveyCompleted ? 'home' : 'survey')
      }
    }
    setLoading(false)
  }, [])

  // ── Mission loader ───────────────────────────────────────
  const loadTodayMissions = useCallback((p) => {
    if (!p?.email || !p?.surveyCompleted) return []
    const all = DB.getMissions(p.email)
    const key = todayKey()
    if (all[key]?.length) return all[key]
    const fresh = genMissions(p.surveyData)
    all[key] = fresh
    DB.saveMissions(p.email, all)
    return fresh
  }, [])

  // ── Save profile ─────────────────────────────────────────
  const saveProfile = useCallback((p) => {
    setProfile(p)
    DB.saveProfile(p.email, { ...p, lastActive: Date.now() })
  }, [])

  // ── Save missions ────────────────────────────────────────
  const saveMissions = useCallback((email, ms) => {
    setMissions(ms)
    const all = DB.getMissions(email)
    all[todayKey()] = ms
    DB.saveMissions(email, all)
  }, [])

  // ── Auth ─────────────────────────────────────────────────
  const handleAuth = useCallback((p) => {
    setProfile(p)
    setMissions(loadTodayMissions(p))
    setScreen(p.surveyCompleted ? 'home' : 'survey')
  }, [loadTodayMissions])

  // ── Survey done ──────────────────────────────────────────
  const handleSurvey = useCallback((surveyData, isRedo = false) => {
    const updated = { ...profile, surveyCompleted:true, surveyData, activeRealms:surveyData.realms||[], sparks:(profile?.sparks||20)+(isRedo?0:20) }
    saveProfile(updated)
    saveMissions(updated.email, genMissions(surveyData))
    setScreen('home')
  }, [profile, saveProfile, saveMissions])

  // ── Mission done ─────────────────────────────────────────
  const handleDone = useCallback((m) => {
    const updatedMs = missions.map(x => x.id===m.id ? {...x,completed:true} : x)
    saveMissions(profile.email, updatedMs)
    const pxp=profile.xp||0, nxp=pxp+m.xp, nsp=(profile.sparks||0)+m.sparks
    const pLvl=getLvl(pxp).level, nLvl=getLvl(nxp).level
    saveProfile({ ...profile, xp:nxp, sparks:nsp, streak:Math.max(profile.streak||0,1) })
    setCeleb({ xp:m.xp, sparks:m.sparks, levelUp:nLvl>pLvl, newLevel:nLvl, newXp:nxp })
  }, [missions, profile, saveProfile, saveMissions])

  // ── Vault buy ────────────────────────────────────────────
  const handleBuy = useCallback((item, lootReward) => {
    const bonusSp = lootReward?.bonus?.sparks || 0
    const bonusXp = lootReward?.bonus?.xp || 0
    saveProfile({ ...profile, sparks:Math.max(0,(profile.sparks||0)-item.cost+bonusSp), xp:(profile.xp||0)+bonusXp })
    if (lootReward) {
      const inv = DB.getInventory(profile.email)
      inv.push({ ...lootReward, purchasedAt:Date.now(), boxType:item.id })
      DB.saveInventory(profile.email, inv)
    }
  }, [profile, saveProfile])

  // ── Logout ───────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    DB.clearSession()
    setProfile(null); setMissions([]); setScreen('home'); setSp({}); setCeleb(null)
  }, [])

  const nav = useCallback((s, params={}) => { setScreen(s); setSp(params) }, [])
  const mainTabs = ['home','encyclopedia','vault','profile']

  // ── Render ───────────────────────────────────────────────
  if (loading) return (
    <div className='root' style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:18,height:'100vh'}}>
      <style>{CSS}</style>
      <div className='shimmer' style={{fontFamily:'Rajdhani,sans-serif',fontSize:68,fontWeight:700}}>LIFEXP</div>
      <div style={{color:'#8A8A9A',fontSize:10,fontFamily:'Orbitron,monospace',letterSpacing:3}}>CARGANDO MUNDO...</div>
      <Spin/>
    </div>
  )

  if (!profile) return <div className='root'><style>{CSS}</style><AuthScreen onAuth={handleAuth}/></div>

  if (screen==='survey')   return <div className='root'><style>{CSS}</style><SurveyScreen onComplete={sd=>handleSurvey(sd,false)} isRedo={false}/></div>
  if (screen==='resurvey') return <div className='root'><style>{CSS}</style><SurveyScreen onComplete={sd=>handleSurvey(sd,true)} isRedo={true}/></div>

  return (
    <div className='root'>
      <style>{CSS}</style>
      {screen==='home'         && <HomeScreen     profile={profile} missions={missions} onDone={handleDone} nav={nav}/>}
      {screen==='encyclopedia' && <EncycScreen    nav={nav}/>}
      {screen==='realm'        && <RealmScreen    realmId={sp.id} nav={nav}/>}
      {screen==='levelmap'     && <LevelMapScreen profile={profile}/>}
      {screen==='vault'        && <VaultScreen    profile={profile} onBuy={handleBuy}/>}
      {screen==='profile'      && <ProfileScreen  profile={profile} nav={nav} onReSurvey={()=>setScreen('resurvey')} onLogout={handleLogout}/>}
      {mainTabs.includes(screen) && <BottomNav active={screen} nav={nav}/>}
      {celeb && <Celebration reward={celeb} onDone={()=>setCeleb(null)}/>}
    </div>
  )
}
