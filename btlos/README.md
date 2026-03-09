# BTL OS — Sistema Operativo de Eventos BTL

Plataforma unificada para la gestión operativa de eventos Below The Line (BTL).

## Módulos incluidos

| Módulo | Descripción |
|--------|-------------|
| **OPS COMMANDER** | Dashboard en vivo: zonas, densidad, incidencias activas |
| **BRIEF & GO** | Checklist pre-apertura, cronograma y decisión Go/No-Go |
| **FLOW MAP** | Circuito del asistente (9 nodos) y control de densidad |
| **ROLE CARDS** | Fichas por rol: funciones, KPIs, script y escalamiento |
| **DEBRIEF** | Métricas post-evento y registro de incidencias |

## Deploy en Vercel

### Opción 1 — Vercel CLI
```bash
npm install -g vercel
vercel
```

### Opción 2 — Vercel Dashboard (recomendado)
1. Sube esta carpeta a un repositorio GitHub/GitLab
2. Ve a [vercel.com](https://vercel.com) → "Add New Project"
3. Importa el repositorio
4. Vercel detecta Vite automáticamente → clic en **Deploy**

### Desarrollo local
```bash
npm install
npm run dev
```
Abre `http://localhost:5173`

## Stack
- React 18 + Vite 5
- Fuentes: Share Tech Mono + Barlow Condensed (Google Fonts)
- Sin dependencias adicionales
