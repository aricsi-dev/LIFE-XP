import { useState, useEffect } from "react";

// ─── CSS VARS INJECTION ────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    :root {
      --display: 'Share Tech Mono', monospace;
      --mono: 'Share Tech Mono', monospace;
      --body: 'Barlow Condensed', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: #0C0D10; }
    ::-webkit-scrollbar-thumb { background: #1E2028; border-radius: 2px; }
    textarea, input { font-family: var(--mono); }
    textarea:focus, input:focus { outline: none; }
    button { cursor: pointer; }
    @keyframes moduleFade {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .module-fade { animation: moduleFade 0.25s ease forwards; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .pulse { animation: pulse 2s ease-in-out infinite; }
  `}</style>
);

// ─── DATOS DEL EVENTO ─────────────────────────────────────────────────
const EVENT = {
  name: "Activación NOVA X",
  brand: "NOVA Brand",
  date: "15 Mar 2026",
  venue: "Plaza Central, CDMX",
  start: "10:00",
  end: "18:00",
  capacity: 500,
};

const ZONES = [
  { id: "Z1", label: "ACCESO PRINCIPAL",   capacity: 80,  current: 72, status: "high",     phase: "Ingreso"     },
  { id: "Z2", label: "ACTIVACIÓN DEMO",    capacity: 120, current: 65, status: "ok",       phase: "Experiencia" },
  { id: "Z3", label: "SAMPLING BOOTH",     capacity: 60,  current: 58, status: "critical", phase: "Experiencia" },
  { id: "Z4", label: "REGISTRO / LEADS",   capacity: 40,  current: 18, status: "ok",       phase: "Conversión"  },
  { id: "Z5", label: "ZONA VIP",           capacity: 30,  current: 12, status: "ok",       phase: "Permanencia" },
  { id: "Z6", label: "EGRESO",             capacity: 100, current: 8,  status: "ok",       phase: "Salida"      },
];

const INCIDENTS_INIT = [
  { id: "INC-003", type: "Alta",  zone: "Z3", msg: "Cola > 25 min en Sampling Booth",        time: "11:42", resp: "Coord. Piso", status: "Abierta"    },
  { id: "INC-002", type: "Media", zone: "Z1", msg: "Señalización caída en acceso lateral",   time: "10:58", resp: "Logística",   status: "En proceso" },
  { id: "INC-001", type: "Baja",  zone: "Z4", msg: "Tablet de registro sin carga",           time: "10:15", resp: "IT / Data",   status: "Cerrada"    },
];

const CIRCUIT_NODES = [
  { id: 1, label: "LLEGADA",      sub: "Punto de orientación inicial donde se separan tipos de visitantes",      icon: "⬟", color: "#F59E0B" },
  { id: 2, label: "PRECOLA",      sub: "Área de espera ordenada fuera de cuellos de botella principales",        icon: "⬡", color: "#94A3B8" },
  { id: 3, label: "FILTRO",       sub: "Validación de acceso, acreditación o entrega de identificador",          icon: "◈", color: "#F59E0B" },
  { id: 4, label: "INGRESO",      sub: "Distribución por accesos múltiples para equilibrar carga",               icon: "⬢", color: "#22C55E" },
  { id: 5, label: "CIRCULACIÓN",  sub: "Recorrido con señalización y staff en nodos críticos",                   icon: "◉", color: "#3B82F6" },
  { id: 6, label: "ACTIVACIÓN",   sub: "Estaciones con capacidad y timing definidos: demos, sampling",           icon: "★", color: "#F59E0B" },
  { id: 7, label: "CONVERSIÓN",   sub: "Captura de datos, registro, transacción o CTA",                         icon: "◆", color: "#A855F7" },
  { id: 8, label: "PERMANENCIA",  sub: "Zona opcional para consumo o socialización",                             icon: "◎", color: "#3B82F6" },
  { id: 9, label: "EGRESO",       sub: "Salida clara sin cruce con ingreso ni reentrada sin control",            icon: "⬠", color: "#EF4444" },
];

const ROLES = [
  {
    id: "producer", title: "PRODUCER GENERAL", level: 2, color: "#F59E0B",
    location: "Back Office / venue completo",
    primary: "Dueño total de la operación y cronograma. Toma decisiones operativas sin consulta.",
    secondary: "Activar protocolos de contingencia. Relación directa con el cliente en campo.",
    kpis: ["Cumplimiento del cronograma", "Incidencias críticas = 0", "Debrief completado < 2h post-evento"],
    escalates_to: "Director de Cuenta",
    escalate_when: "Riesgo reputacional, cambio de alcance o gasto extraordinario",
    script: "Identifícate siempre: 'Producer a [Área]'. Clasifica la urgencia antes de comunicar. Confirma recepción. Cierra el loop.",
    faqs: ["¿Puedo cambiar el timing? → Solo con aprobación del Director.", "¿Cuándo activo contingencia? → Cuando el Coordinador no resuelve en < 10 min."],
    contacts: ["Coord. Piso: +52 55 0001", "Logística: +52 55 0002", "Seguridad: +52 55 0003"],
  },
  {
    id: "coord_piso", title: "COORDINADOR DE PISO", level: 3, color: "#3B82F6",
    location: "Piso — circulación completa del venue",
    primary: "Supervisión de activación en tiempo real, calidad del customer journey y timing.",
    secondary: "Redistribuir staff según carga. Reportar incidencias al Producer.",
    kpis: ["Interacciones/hora por zona", "Incidentes cerrados < 30 min", "Rotaciones ejecutadas a tiempo"],
    escalates_to: "Producer General",
    escalate_when: "Afecta otra área, supera presupuesto asignado o impacta experiencia total",
    script: "Rondas cada 20 minutos. Verifica que cada estación tenga staff y material. Si una zona está al 85%+ de capacidad, escala inmediatamente.",
    faqs: ["¿Cuándo cierro una zona? → Capacidad > 90% por más de 10 min.", "¿Puedo reasignar staff? → Sí, dentro de tu área de responsabilidad."],
    contacts: ["Producer: +52 55 0000", "Líder Acceso: +52 55 0004", "Líder Data: +52 55 0005"],
  },
  {
    id: "lider_acceso", title: "LÍDER DE ACCESO", level: 3, color: "#22C55E",
    location: "Punto de ingreso / egreso principal",
    primary: "Control de flujo de entrada y salida. Gestión de colas y acreditación.",
    secondary: "Coordinar con Seguridad. Activar accesos alternos si cola supera umbral.",
    kpis: ["Tiempo de cola < 15 min", "Flujo de ingreso equilibrado", "0 cruces ingreso/egreso"],
    escalates_to: "Coordinador de Piso",
    escalate_when: "Cola supera 25 min o aforo global al 85%",
    script: "Staff cada 10 personas en la fila. Informa tiempo de espera cada 5 metros. Si hay inversión del flujo, detén el ingreso.",
    faqs: ["¿Cuándo abro acceso alterno? → Cola > 20 personas o espera > 15 min.", "¿Quién detiene el ingreso? → Yo, coordinando con el Producer."],
    contacts: ["Coordinador Piso: +52 55 0001", "Seguridad: +52 55 0003", "Producer: +52 55 0000"],
  },
  {
    id: "promotor", title: "PROMOTOR / BRAND AMBASSADOR", level: 4, color: "#A855F7",
    location: "Estaciones de activación asignadas",
    primary: "Activación directa con el público. Ejecución de la mecánica. Entrega de muestras.",
    secondary: "Captura de leads con tablet. Reporte de comentarios al Coordinador.",
    kpis: ["Interacciones/hora (meta: 30+)", "Leads válidos capturados", "Tiempo por interacción < 4 min"],
    escalates_to: "Coordinador de Piso",
    escalate_when: "Cualquier queja que no puedas resolver con el script aprobado",
    script: "Saludo → Demo 90 seg → CTA: 'Regístrate y llévate [premio]' → Despedida positiva. No improvises el mensaje de marca.",
    faqs: ["¿Precio? → 'Para compra visita [canal].'", "¿Sin material? → Reporta inmediatamente a Logística por radio."],
    contacts: ["Coordinador Piso: +52 55 0001", "Logística: +52 55 0002"],
  },
  {
    id: "lider_data", title: "LÍDER DE DATA", level: 3, color: "#06B6D4",
    location: "Punto de registro / Back Office",
    primary: "Captura de leads, monitoreo de KPIs, reporte de incidencias operativas.",
    secondary: "Soporte IT a promotores. Consolidar métricas cada hora para el Producer.",
    kpis: ["Leads válidos vs objetivo", "% conversión interacciones → registros", "Uptime tablets y WiFi"],
    escalates_to: "Coordinador de Piso",
    escalate_when: "Fallo tecnológico que afecte la captura de datos masivamente",
    script: "Cada hora: consolida leads, tiempo promedio en registro y comentarios cualitativos. Envía resumen al Producer antes de cada rotación.",
    faqs: ["¿Falla el sistema? → Activa el formulario en papel del plan B.", "¿Quién accede al CRM? → Solo tú y el Director de Cuenta."],
    contacts: ["Producer: +52 55 0000", "Soporte IT: +52 55 0006", "Coordinador: +52 55 0001"],
  },
  {
    id: "seguridad", title: "JEFE DE SEGURIDAD", level: 4, color: "#EF4444",
    location: "Perímetro y puntos de acceso",
    primary: "Control de aforo, monitoreo de densidad, protocolo de emergencias activo.",
    secondary: "Coordinar con Líder de Acceso. Ejecutar evacuación si se activa el protocolo.",
    kpis: ["Aforo dentro del límite legal", "0 incidentes de seguridad", "Tiempo de respuesta < 2 min (crítica)"],
    escalates_to: "Producer General",
    escalate_when: "Cualquier incidencia crítica: lesión, amenaza, evacuación o falla eléctrica total",
    script: "Un agente por cada acceso + uno móvil en circulación. Acumulación > 40 personas en un punto: comunica al Coordinador antes de actuar.",
    faqs: ["¿Cuándo evacúo sin esperar orden? → Riesgo inminente de vida: incendio, colapso.", "¿Quién da la orden de evacuación? → Producer y yo, de forma conjunta."],
    contacts: ["Producer: +52 55 0000", "Bomberos: 911", "Ambulancia: 911", "Policía: +52 55 0007"],
  },
];

const CHECKLIST_DATA = [
  { section: "VENUE", items: [
    { id: "v1", text: "Permisos y licencias vigentes", done: true },
    { id: "v2", text: "Aforo máximo confirmado con administración", done: true },
    { id: "v3", text: "Rutas de evacuación despejadas y señalizadas", done: true },
    { id: "v4", text: "Señalización instalada y visible desde 5m", done: false },
    { id: "v5", text: "Limpieza y orden completo en todas las zonas", done: false },
  ]},
  { section: "LOGÍSTICA", items: [
    { id: "l1", text: "Materiales y POP en posición asignada", done: true },
    { id: "l2", text: "Stock de sampling verificado (≥ 100% objetivo)", done: true },
    { id: "l3", text: "Energía y conectividad WiFi operativas", done: true },
    { id: "l4", text: "Equipos técnicos probados (pantallas, audio, tablets)", done: false },
    { id: "l5", text: "Bodega y almacén organizados con inventario impreso", done: true },
  ]},
  { section: "STAFF", items: [
    { id: "s1", text: "100% de asistencia confirmada (o reemplazo activado)", done: true },
    { id: "s2", text: "Uniformes y acreditaciones entregadas", done: true },
    { id: "s3", text: "Briefing general completado (Producer)", done: false },
    { id: "s4", text: "Briefing por rol completado (Líderes de área)", done: false },
    { id: "s5", text: "Radios / comunicación activa y probada", done: false },
  ]},
  { section: "OPERACIÓN", items: [
    { id: "o1", text: "Cronograma impreso y distribuido a todos los líderes", done: true },
    { id: "o2", text: "Contactos de emergencia en posición (directorio)", done: true },
    { id: "o3", text: "Dashboard operativo funcional", done: false },
    { id: "o4", text: "Plan de contingencia revisado por el equipo", done: false },
    { id: "o5", text: "Decisión Go / No-Go tomada formalmente", done: false },
  ]},
];

const TIMELINE_DATA = [
  { time: "H-4:00", label: "Inicio montaje venue",         resp: "Logística",          done: true,  highlight: false },
  { time: "H-2:00", label: "Check-in staff completo",      resp: "RRHH / Producer",    done: true,  highlight: false },
  { time: "H-1:30", label: "Briefing general",             resp: "Producer",           done: true,  highlight: false },
  { time: "H-1:00", label: "Briefing por rol",             resp: "Líderes de área",    done: false, highlight: false },
  { time: "H-0:30", label: "Toma de posición",             resp: "Todos",              done: false, highlight: false },
  { time: "H-0:15", label: "Checklist final — Go/No-Go",   resp: "Producer",           done: false, highlight: false },
  { time: "H0:00",  label: "APERTURA OFICIAL",             resp: "Producer",           done: false, highlight: true  },
  { time: "H+1:00", label: "Primera rotación de staff",    resp: "Coordinador",        done: false, highlight: false },
  { time: "H+2:30", label: "Reposición de stock",          resp: "Logística",          done: false, highlight: false },
  { time: "H+4:00", label: "Inicio cierre paulatino",      resp: "Líder Acceso",       done: false, highlight: false },
  { time: "H+4:30", label: "Cierre definitivo",            resp: "Producer",           done: false, highlight: false },
  { time: "H+5:00", label: "Inicio desmontaje",            resp: "Logística",          done: false, highlight: false },
  { time: "H+6:00", label: "Debrief del equipo",           resp: "Producer",           done: false, highlight: false },
];

const DEBRIEF_METRICS = [
  { label: "ASISTENTES TOTALES",     unit: "personas",  target: "500"       },
  { label: "LEADS CAPTURADOS",       unit: "leads",     target: "200"       },
  { label: "SAMPLING ENTREGADO",     unit: "unidades",  target: "1,000"     },
  { label: "TIEMPO PROM. COLA",      unit: "min",       target: "< 15"      },
  { label: "INTERACCIONES / HORA",   unit: "int/h",     target: "120"       },
  { label: "INCIDENCIAS TOTALES",    unit: "total",     target: "≤ 3"       },
  { label: "NPS EN CAMPO",           unit: "puntos",    target: "> 40"      },
  { label: "CONSUMO DE STOCK",       unit: "%",         target: "85–100%"   },
];

// ─── UTILIDADES ───────────────────────────────────────────────────────
const zoneColor = (s) => s === "critical" ? "#EF4444" : s === "high" ? "#F59E0B" : "#22C55E";
const zoneLabel = (s) => s === "critical" ? "CRÍTICO" : s === "high" ? "ALTO" : "NORMAL";
const incColor  = (t) => t === "Alta" ? "#EF4444" : t === "Media" ? "#F59E0B" : "#22C55E";
const pct       = (c, cap) => Math.round((c / cap) * 100);

// ─── COMPONENTES BASE ─────────────────────────────────────────────────
const Tag = ({ text, color }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    fontSize: 9, letterSpacing: "0.12em", padding: "2px 8px",
    fontFamily: "var(--mono)", whiteSpace: "nowrap",
  }}>{text}</span>
);

const KpiCard = ({ label, value, sub, color = "#F59E0B" }) => (
  <div style={{ background: "#111318", border: "1px solid #1E2028", padding: "16px 18px", flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 8, color: "#555", letterSpacing: "0.25em", marginBottom: 6, fontFamily: "var(--mono)" }}>{label}</div>
    <div style={{ fontFamily: "var(--display)", fontSize: 32, color, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>{sub}</div>}
  </div>
);

const SectionHead = ({ label, color = "#F59E0B" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
    <div style={{ width: 3, height: 18, background: color, flexShrink: 0 }} />
    <div style={{ fontFamily: "var(--display)", fontSize: 12, color, letterSpacing: "0.15em" }}>{label}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════
// MÓDULO 1 · OPS COMMANDER
// ══════════════════════════════════════════════════════════════════════
function OpsCommander() {
  const total    = ZONES.reduce((a, z) => a + z.current, 0);
  const capPct   = pct(total, EVENT.capacity);
  const openInc  = INCIDENTS_INIT.filter(i => i.status !== "Cerrada").length;
  const critZones = ZONES.filter(z => z.status === "critical").length;
  const isAlert  = capPct > 85 || critZones > 0;

  return (
    <div className="module-fade">
      {/* Status global */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
        padding: "10px 16px",
        background: isAlert ? "#EF444411" : "#22C55E0A",
        border: `1px solid ${isAlert ? "#EF444433" : "#22C55E22"}`,
      }}>
        <div className={isAlert ? "pulse" : ""} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: isAlert ? "#EF4444" : "#22C55E",
          boxShadow: `0 0 8px ${isAlert ? "#EF4444" : "#22C55E"}`,
        }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: isAlert ? "#EF4444" : "#22C55E", letterSpacing: "0.15em" }}>
          {isAlert ? "ESTADO: ATENCIÓN REQUERIDA" : "ESTADO: OPERACIÓN NORMAL"}
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 8, color: "#333" }}>TIEMPO REAL</span>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <KpiCard label="ASISTENTES ACTIVOS" value={total} sub={`${capPct}% de capacidad`} color="#F59E0B" />
        <KpiCard label="INCIDENCIAS ABIERTAS" value={openInc} sub="1 alta · 1 en proceso" color={openInc > 1 ? "#EF4444" : "#F59E0B"} />
        <KpiCard label="ZONAS EN ALERTA" value={critZones} sub="Sampling Booth crítica" color={critZones > 0 ? "#EF4444" : "#22C55E"} />
        <KpiCard label="PRÓXIMO HITO" value="H+1:00" sub="Rotación de staff" color="#3B82F6" />
      </div>

      {/* Zonas */}
      <div style={{ marginBottom: 18 }}>
        <SectionHead label="ESTADO POR ZONA" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {ZONES.map(z => {
            const p = pct(z.current, z.capacity);
            const c = zoneColor(z.status);
            return (
              <div key={z.id} style={{ background: "#111318", border: `1px solid ${c}33`, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#444", letterSpacing: "0.2em" }}>{z.id}</div>
                    <div style={{ fontSize: 10, color: "#CCC", marginTop: 2 }}>{z.label}</div>
                  </div>
                  <Tag text={zoneLabel(z.status)} color={c} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 3, background: "#1E2028", borderRadius: 2 }}>
                    <div style={{ width: `${p}%`, height: "100%", background: c, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: "var(--display)", fontSize: 14, color: c, width: 36, textAlign: "right" }}>{p}%</span>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#444", marginTop: 4 }}>
                  {z.current} / {z.capacity} · {z.phase}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidencias */}
      <div>
        <SectionHead label="INCIDENCIAS ACTIVAS" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {INCIDENTS_INIT.map(inc => (
            <div key={inc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#111318", border: "1px solid #1E2028" }}>
              <div style={{ width: 3, height: 32, background: incColor(inc.type), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <Tag text={inc.type.toUpperCase()} color={incColor(inc.type)} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#444" }}>{inc.id} · {inc.time}</span>
                </div>
                <div style={{ fontSize: 11, color: "#AAA" }}>{inc.msg}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 9, color: "#555", marginBottom: 4 }}>{inc.resp}</div>
                <Tag text={inc.status.toUpperCase()} color={inc.status === "Cerrada" ? "#22C55E" : inc.status === "En proceso" ? "#F59E0B" : "#EF4444"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MÓDULO 2 · BRIEF & GO
// ══════════════════════════════════════════════════════════════════════
function BriefAndGo() {
  const [checks, setChecks] = useState(() => {
    const init = {};
    CHECKLIST_DATA.forEach(s => s.items.forEach(i => { init[i.id] = i.done; }));
    return init;
  });
  const [view, setView] = useState("checklist");

  const total   = Object.keys(checks).length;
  const done    = Object.values(checks).filter(Boolean).length;
  const pctDone = Math.round((done / total) * 100);
  const goReady = pctDone === 100;

  const toggle = (id) => setChecks(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="module-fade">
      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { v: "checklist", l: "CHECKLIST" },
          { v: "timeline",  l: "CRONOGRAMA" },
          { v: "gonogo",    l: "GO / NO-GO" },
        ].map(({ v, l }) => (
          <button key={v} onClick={() => setView(v)} style={{
            background: view === v ? "#F59E0B" : "transparent",
            border: `1px solid ${view === v ? "#F59E0B" : "#1E2028"}`,
            color: view === v ? "#000" : "#555",
            padding: "7px 18px", fontSize: 9, letterSpacing: "0.2em",
            fontFamily: "var(--mono)",
          }}>{l}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 24, color: goReady ? "#22C55E" : "#F59E0B" }}>{pctDone}%</div>
          <div style={{ fontSize: 9, color: "#444", fontFamily: "var(--mono)" }}>completado</div>
        </div>
      </div>

      {view === "checklist" && (
        <div>
          <div style={{ height: 4, background: "#1E2028", marginBottom: 20, borderRadius: 2 }}>
            <div style={{ width: `${pctDone}%`, height: "100%", background: goReady ? "#22C55E" : "#F59E0B", borderRadius: 2, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {CHECKLIST_DATA.map(sec => {
              const secDone = sec.items.filter(i => checks[i.id]).length;
              return (
                <div key={sec.section} style={{ background: "#111318", border: "1px solid #1E2028", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#F59E0B", letterSpacing: "0.25em" }}>{sec.section}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#555" }}>{secDone}/{sec.items.length}</div>
                  </div>
                  {sec.items.map(item => (
                    <div key={item.id} onClick={() => toggle(item.id)} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "8px 0", borderBottom: "1px solid #141414", cursor: "pointer",
                    }}>
                      <div style={{
                        width: 14, height: 14, border: `1px solid ${checks[item.id] ? "#22C55E" : "#333"}`,
                        background: checks[item.id] ? "#22C55E22" : "transparent",
                        flexShrink: 0, marginTop: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {checks[item.id] && <span style={{ color: "#22C55E", fontSize: 8 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: 10, color: checks[item.id] ? "#444" : "#AAA", textDecoration: checks[item.id] ? "line-through" : "none" }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "timeline" && (
        <div>
          {TIMELINE_DATA.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: t.done ? "#22C55E" : t.highlight ? "#F59E0B" : "#1E2028",
                  border: `1px solid ${t.done ? "#22C55E" : t.highlight ? "#F59E0B" : "#333"}`,
                }} />
                {i < TIMELINE_DATA.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: "#1E2028", minHeight: 8 }} />
                )}
              </div>
              <div style={{ paddingBottom: 6, flex: 1 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: t.highlight ? "10px 14px" : "8px 14px",
                  background: t.highlight ? "#F59E0B11" : "#111318",
                  border: `1px solid ${t.highlight ? "#F59E0B44" : "#1E2028"}`,
                  flexWrap: "wrap",
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: t.done ? "#22C55E" : t.highlight ? "#F59E0B" : "#555", width: 58, flexShrink: 0 }}>{t.time}</div>
                  <div style={{ fontSize: 11, color: t.done ? "#444" : "#CCC", textDecoration: t.done ? "line-through" : "none", flex: 1 }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: "#444", flexShrink: 0 }}>{t.resp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "gonogo" && (
        <div>
          <div style={{
            padding: "28px 24px", marginBottom: 20, textAlign: "center",
            background: goReady ? "#22C55E0A" : "#EF44440A",
            border: `2px solid ${goReady ? "#22C55E44" : "#EF444444"}`,
          }}>
            <div style={{ fontFamily: "var(--display)", fontSize: 56, color: goReady ? "#22C55E" : "#EF4444", marginBottom: 10, letterSpacing: "0.05em" }}>
              {goReady ? "GO" : "NO GO"}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#555", letterSpacing: "0.15em" }}>
              {goReady
                ? "TODOS LOS ÍTEMS COMPLETADOS — APERTURA AUTORIZADA"
                : `FALTAN ${total - done} ÍTEMS PARA AUTORIZAR APERTURA`}
            </div>
          </div>
          {!goReady && (
            <div>
              <SectionHead label="ÍTEMS PENDIENTES" color="#EF4444" />
              {CHECKLIST_DATA.map(sec => sec.items.filter(i => !checks[i.id]).map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "#111318", border: "1px solid #1E2028", marginBottom: 4 }}>
                  <div style={{ width: 3, background: "#EF4444", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#EF4444", marginBottom: 3 }}>{sec.section}</div>
                    <div style={{ fontSize: 11, color: "#AAA" }}>{item.text}</div>
                  </div>
                </div>
              )))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MÓDULO 3 · FLOW MAP
// ══════════════════════════════════════════════════════════════════════
function FlowMap() {
  const [activeNode, setActiveNode] = useState(null);

  const densityData = [
    { zone: "Colas externas",         m2: "1.0–1.5",  density: "Baja",      action: "Monitoreo pasivo",                color: "#22C55E" },
    { zone: "Área de tránsito",        m2: "0.7–1.0",  density: "Media",     action: "Staff de orientación",            color: "#22C55E" },
    { zone: "Activación dinámica",     m2: "1.5–2.0",  density: "Baja-media", action: "Control de permanencia",         color: "#F59E0B" },
    { zone: "Activación estática",     m2: "0.5–0.7",  density: "Alta",      action: "Control de acceso por turnos",    color: "#F59E0B" },
    { zone: "Punto crítico (registro)", m2: "< 0.5",   density: "Muy alta",  action: "RESTRICCIÓN INMEDIATA",           color: "#EF4444" },
  ];

  return (
    <div className="module-fade">
      <div style={{ marginBottom: 20 }}>
        <SectionHead label="CIRCUITO DEL ASISTENTE" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {CIRCUIT_NODES.map((node, i) => (
            <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
              <div onClick={() => setActiveNode(activeNode?.id === node.id ? null : node)} style={{
                cursor: "pointer", padding: "10px 10px", textAlign: "center",
                background: activeNode?.id === node.id ? node.color + "22" : "#111318",
                border: `1px solid ${activeNode?.id === node.id ? node.color : "#1E2028"}`,
                minWidth: 74, transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 16, color: node.color, marginBottom: 4 }}>{node.icon}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: node.color, letterSpacing: "0.1em" }}>{node.label}</div>
              </div>
              {i < CIRCUIT_NODES.length - 1 && (
                <div style={{ color: "#2A2D38", fontSize: 16, padding: "0 1px" }}>›</div>
              )}
            </div>
          ))}
        </div>
        {activeNode && (
          <div style={{ marginTop: 8, padding: "12px 16px", background: activeNode.color + "0D", border: `1px solid ${activeNode.color}33` }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: activeNode.color, marginBottom: 4 }}>NODO {activeNode.id} · {activeNode.label}</div>
            <div style={{ fontSize: 11, color: "#AAA", lineHeight: 1.7 }}>{activeNode.sub}</div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <SectionHead label="DENSIDAD POR ZONA" />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ZONES.map(z => {
            const p = pct(z.current, z.capacity);
            const c = zoneColor(z.status);
            return (
              <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#111318", border: `1px solid ${c}1A` }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#444", width: 28 }}>{z.id}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: "#CCC", marginBottom: 5 }}>{z.label}</div>
                  <div style={{ height: 4, background: "#1E2028", borderRadius: 2 }}>
                    <div style={{ width: `${p}%`, height: "100%", background: c, borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, color: c, width: 40, textAlign: "right" }}>{p}%</div>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <Tag text={zoneLabel(z.status)} color={c} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <SectionHead label="PARÁMETROS DE DENSIDAD RECOMENDADOS" />
        <div style={{ border: "1px solid #1E2028", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "8px 14px", background: "#0C0D10", borderBottom: "1px solid #1E2028" }}>
            {["ZONA", "M²/PERSONA", "DENSIDAD", "ACCIÓN REQUERIDA"].map(h => (
              <div key={h} style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#444", letterSpacing: "0.15em" }}>{h}</div>
            ))}
          </div>
          {densityData.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "10px 14px", background: i % 2 === 0 ? "#111318" : "#0E0F13", borderBottom: i < densityData.length - 1 ? "1px solid #141414" : "none" }}>
              <div style={{ fontSize: 10, color: "#888" }}>{row.zone}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#F59E0B" }}>{row.m2}</div>
              <div style={{ fontSize: 10, color: row.color }}>{row.density}</div>
              <div style={{ fontSize: 10, color: row.color === "#EF4444" ? "#EF4444" : "#666" }}>{row.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MÓDULO 4 · ROLE CARDS
// ══════════════════════════════════════════════════════════════════════
function RoleCards() {
  const [selected, setSelected] = useState("producer");
  const role = ROLES.find(r => r.id === selected);

  return (
    <div className="module-fade">
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {ROLES.map(r => (
          <button key={r.id} onClick={() => setSelected(r.id)} style={{
            background: selected === r.id ? r.color : "transparent",
            border: `1px solid ${selected === r.id ? r.color : "#1E2028"}`,
            color: selected === r.id ? "#000" : "#555",
            padding: "7px 14px", fontSize: 8, letterSpacing: "0.12em", fontFamily: "var(--mono)",
          }}>
            {r.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {role && (
        <div>
          <div style={{ padding: "16px 20px", background: role.color + "0D", border: `1px solid ${role.color}33`, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 18, color: role.color, letterSpacing: "0.08em" }}>{role.title}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#555", marginTop: 4 }}>NIVEL {role.level} · {role.location}</div>
              </div>
              <Tag text={`NIV. ${role.level}`} color={role.color} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "#111318", border: "1px solid #1E2028", padding: 16 }}>
              <SectionHead label="FUNCIONES" color={role.color} />
              <div style={{ fontSize: 10, color: "#888", marginBottom: 10, lineHeight: 1.7 }}>
                <span style={{ color: role.color, fontFamily: "var(--mono)", fontSize: 7 }}>PRIMARIA · </span>{role.primary}
              </div>
              <div style={{ fontSize: 10, color: "#666", lineHeight: 1.7 }}>
                <span style={{ color: "#444", fontFamily: "var(--mono)", fontSize: 7 }}>SECUNDARIA · </span>{role.secondary}
              </div>
            </div>
            <div style={{ background: "#111318", border: "1px solid #1E2028", padding: 16 }}>
              <SectionHead label="KPIs PROPIOS" color={role.color} />
              {role.kpis.map((k, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: "1px solid #141414", alignItems: "flex-start" }}>
                  <div style={{ width: 4, height: 4, background: role.color, borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 10, color: "#888" }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#111318", border: `1px solid ${role.color}1A`, padding: 16, marginBottom: 10 }}>
            <SectionHead label="SCRIPT DE CAMPO" color={role.color} />
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.8, fontStyle: "italic" }}>"{role.script}"</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "#111318", border: "1px solid #1E2028", padding: 16 }}>
              <SectionHead label="ESCALAMIENTO" color="#EF4444" />
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#444", marginBottom: 4 }}>ESCALA A:</div>
                <div style={{ fontSize: 11, color: "#EF4444" }}>{role.escalates_to}</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#444", marginBottom: 4 }}>CUÁNDO:</div>
                <div style={{ fontSize: 10, color: "#888", lineHeight: 1.7 }}>{role.escalate_when}</div>
              </div>
            </div>
            <div style={{ background: "#111318", border: "1px solid #1E2028", padding: 16 }}>
              <SectionHead label="CONTACTOS · FAQs" color="#3B82F6" />
              {role.contacts.map((c, i) => (
                <div key={i} style={{ fontSize: 10, color: "#888", padding: "5px 0", borderBottom: "1px solid #141414", display: "flex", gap: 6 }}>
                  <span style={{ color: "#3B82F6" }}>→</span>{c}
                </div>
              ))}
              {role.faqs.map((f, i) => (
                <div key={i} style={{ fontSize: 9, color: "#555", padding: "5px 0", lineHeight: 1.6, borderBottom: "1px solid #0F0F0F" }}>
                  <span style={{ color: "#F59E0B" }}>FAQ </span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MÓDULO 5 · DEBRIEF
// ══════════════════════════════════════════════════════════════════════
function Debrief() {
  const [metrics, setMetrics] = useState({});
  const [lessons, setLessons] = useState([
    { type: "POSITIVO", placeholder: "¿Qué funcionó mejor de lo esperado?",                  color: "#22C55E", text: "" },
    { type: "MEJORAR",  placeholder: "¿Qué debe mejorar para la próxima activación?",         color: "#F59E0B", text: "" },
    { type: "CRÍTICO",  placeholder: "¿Qué requiere protocolo nuevo o corrección urgente?",   color: "#EF4444", text: "" },
  ]);

  const updateMetric  = (i, v) => setMetrics(p => ({ ...p, [i]: v }));
  const updateLesson  = (i, v) => setLessons(p => p.map((l, li) => li === i ? { ...l, text: v } : l));

  return (
    <div className="module-fade">
      <div style={{ marginBottom: 20 }}>
        <SectionHead label="MÉTRICAS DEL EVENTO" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {DEBRIEF_METRICS.map((d, i) => (
            <div key={i} style={{ background: "#111318", border: "1px solid #1E2028", padding: "12px 14px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#444", letterSpacing: "0.12em", marginBottom: 6 }}>{d.label}</div>
              <input
                value={metrics[i] || ""}
                onChange={e => updateMetric(i, e.target.value)}
                placeholder={d.target}
                style={{ background: "transparent", border: "none", borderBottom: "1px solid #1E2028", width: "100%", color: metrics[i] ? "#F59E0B" : "#333", fontFamily: "var(--display)", fontSize: 20, padding: "4px 0" }}
              />
              <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#2A2D38", marginTop: 4 }}>META: {d.target} {d.unit}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <SectionHead label="LECCIONES APRENDIDAS" />
          {lessons.map((l, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: l.color, letterSpacing: "0.2em", marginBottom: 5 }}>{l.type}</div>
              <textarea
                value={l.text}
                onChange={e => updateLesson(i, e.target.value)}
                placeholder={l.placeholder}
                style={{
                  width: "100%", background: "#111318", border: `1px solid ${l.color}22`,
                  color: "#AAA", fontSize: 10, padding: 10, resize: "vertical",
                  minHeight: 72, fontFamily: "var(--mono)", lineHeight: 1.7,
                }}
              />
            </div>
          ))}
        </div>

        <div>
          <SectionHead label="REGISTRO DE INCIDENCIAS" />
          {INCIDENTS_INIT.map(inc => (
            <div key={inc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#111318", border: "1px solid #1E2028", marginBottom: 6 }}>
              <div style={{ width: 3, height: 32, background: incColor(inc.type), flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                  <Tag text={inc.type} color={incColor(inc.type)} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#444" }}>{inc.id} · {inc.zone}</span>
                </div>
                <div style={{ fontSize: 10, color: "#888" }}>{inc.msg}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 8, color: "#444", marginBottom: 4 }}>{inc.time}</div>
                <Tag text={inc.status} color={inc.status === "Cerrada" ? "#22C55E" : "#F59E0B"} />
              </div>
            </div>
          ))}
          <div style={{ padding: "10px 14px", background: "#0E0F13", border: "1px dashed #1E2028", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#2A2D38", letterSpacing: "0.15em" }}>+ NUEVA INCIDENCIA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// APP ROOT — BTL OS
// ══════════════════════════════════════════════════════════════════════
const MODULES = [
  { id: "ops",     label: "OPS COMMANDER", icon: "◈", sub: "Dashboard en vivo",      comp: OpsCommander },
  { id: "brief",   label: "BRIEF & GO",    icon: "⬡", sub: "Pre-evento · Checklist", comp: BriefAndGo   },
  { id: "flow",    label: "FLOW MAP",      icon: "⬢", sub: "Circuito · Densidad",    comp: FlowMap      },
  { id: "roles",   label: "ROLE CARDS",   icon: "◎", sub: "Roles · Scripts",        comp: RoleCards    },
  { id: "debrief", label: "DEBRIEF",       icon: "◉", sub: "Post-evento · Métricas", comp: Debrief      },
];

export default function BTLOS() {
  const [active, setActive] = useState("ops");
  const [clock,  setClock]  = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const ActiveComp = MODULES.find(m => m.id === active)?.comp;
  const total  = ZONES.reduce((a, z) => a + z.current, 0);
  const openInc = INCIDENTS_INIT.filter(i => i.status !== "Cerrada").length;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0C0D10", color: "#E0E0E0", fontFamily: "var(--body)", overflow: "hidden" }}>
      <GlobalStyle />

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <div style={{ width: 220, background: "#0A0B0E", borderRight: "1px solid #1A1B20", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #1A1B20" }}>
          <div style={{ fontFamily: "var(--display)", fontSize: 24, color: "#F59E0B", letterSpacing: "0.04em" }}>BTL OS</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#2A2D38", letterSpacing: "0.25em", marginTop: 2 }}>SISTEMA OPERATIVO DE EVENTOS</div>
        </div>

        {/* Evento activo */}
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #1A1B20" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#333", letterSpacing: "0.2em", marginBottom: 8 }}>EVENTO ACTIVO</div>
          <div style={{ fontSize: 12, color: "#CCC", marginBottom: 3 }}>{EVENT.name}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#444" }}>{EVENT.venue}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#444", marginTop: 2 }}>{EVENT.date} · {EVENT.start}–{EVENT.end}</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 20, color: "#F59E0B", marginTop: 10, letterSpacing: "0.05em" }}>{clock}</div>
        </div>

        {/* Navegación */}
        <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {MODULES.map(m => (
            <button key={m.id} onClick={() => setActive(m.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "11px 18px", background: active === m.id ? "#F59E0B0D" : "transparent",
              border: "none", borderLeft: `3px solid ${active === m.id ? "#F59E0B" : "transparent"}`,
              textAlign: "left", transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 14, color: active === m.id ? "#F59E0B" : "#2A2D38", width: 20, flexShrink: 0 }}>{m.icon}</div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: active === m.id ? "#F59E0B" : "#555", letterSpacing: "0.12em" }}>{m.label}</div>
                <div style={{ fontSize: 9, color: "#2A2D38", marginTop: 1 }}>{m.sub}</div>
              </div>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid #1A1B20" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
            <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#2A2D38", letterSpacing: "0.15em" }}>EN OPERACIÓN</div>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#1E2028", marginTop: 6 }}>BTL OS v1.0 © 2026</div>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ padding: "12px 28px", borderBottom: "1px solid #1A1B20", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0A0B0E", flexShrink: 0, gap: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontSize: 14, color: "#E0E0E0", letterSpacing: "0.1em" }}>
              {MODULES.find(m => m.id === active)?.label}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#2A2D38", marginTop: 2 }}>
              {MODULES.find(m => m.id === active)?.sub}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 18, color: "#F59E0B", lineHeight: 1 }}>{total}/{EVENT.capacity}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#333", letterSpacing: "0.12em" }}>AFORO</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 18, color: openInc > 0 ? "#EF4444" : "#22C55E", lineHeight: 1 }}>{openInc}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 7, color: "#333", letterSpacing: "0.12em" }}>INCIDENCIAS</div>
            </div>
          </div>
        </div>

        {/* Contenido del módulo */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px" }}>
          {ActiveComp && <ActiveComp />}
        </div>
      </div>
    </div>
  );
}
