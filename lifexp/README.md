# ⚔️ LIFEXP — Make Your Life the Game

> Convierte tu vida en el RPG más épico que hayas jugado.

---

## 🚀 Deploy en Vercel (5 minutos)

### Opción A — GitHub + Vercel (recomendado)

1. Sube este proyecto a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) → **Add New Project**
3. Conecta tu repositorio
4. Vercel detecta Vite automáticamente — no cambies nada
5. Haz clic en **Deploy** ✅

### Opción B — Vercel CLI

```bash
npm install -g vercel
cd lifexp
npm install
vercel --prod
```

---

## 📱 Instalar como PWA

Una vez desplegado en Vercel:

**En iPhone/Safari:**
- Abre la URL en Safari
- Toca el botón Compartir (⬆️)
- Selecciona **"Añadir a pantalla de inicio"**

**En Android/Chrome:**
- Abre la URL en Chrome
- Toca el menú (⋮)
- Selecciona **"Añadir a pantalla de inicio"** o el banner automático

---

## 🛠️ Desarrollo local

```bash
npm install
npm run dev
# → http://localhost:5173
```

```bash
npm run build    # genera /dist
npm run preview  # previsualiza el build
```

---

## 📁 Estructura del proyecto

```
lifexp/
├── public/
│   ├── favicon.svg       # Ícono del navegador
│   ├── icon-192.png      # PWA icon pequeño
│   └── icon-512.png      # PWA icon grande
├── src/
│   ├── main.jsx          # Punto de entrada React
│   ├── App.jsx           # App completa (auth + game)
│   └── db.js             # Capa de storage (localStorage)
├── index.html            # HTML base con meta PWA
├── vite.config.js        # Vite + PWA plugin
├── vercel.json           # Config de routing para Vercel
└── package.json
```

---

## 🗄️ Arquitectura de datos

Todo se guarda en `localStorage` con claves aisladas por usuario:

| Clave | Contenido |
|-------|-----------|
| `lifexp:auth:users` | Registro de cuentas |
| `lifexp:auth:session` | Sesión activa |
| `lifexp:profile:{email}` | Perfil del héroe |
| `lifexp:missions:{email}` | Misiones por día |
| `lifexp:inventory:{email}` | Ítems de Loot Boxes |

---

## 🎮 Features

- ✅ Auth completo (registro / login / logout / sesión persistente)
- ✅ 7 Reinos con actividades personalizadas
- ✅ Encuesta de 7 preguntas → plan personalizado
- ✅ Misiones diarias con XP y Sparks
- ✅ Sistema de niveles con Mapa de Progresión
- ✅ Vault con Loot Boxes animadas
- ✅ Animaciones de Level Up y recompensas flotantes
- ✅ Enciclopedia de Reinos
- ✅ Funciona offline (PWA + Service Worker)
- ✅ Instalable en iOS y Android

---

## 🔮 Próximos pasos (producción real)

Para multi-dispositivo y backup en la nube, conectar **Supabase**:

```bash
npm install @supabase/supabase-js
```

Reemplazar `localStorage` en `src/db.js` con llamadas a Supabase Auth + PostgreSQL.
