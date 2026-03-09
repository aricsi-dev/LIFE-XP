// ═══════════════════════════════════════════════════════════
//  DB — localStorage storage layer
//  Per-user isolated data with namespaced keys:
//    auth:users          → { [email]: { email, pwHash, createdAt } }
//    auth:session        → { email, loginAt }
//    profile:{email}     → full user profile
//    missions:{email}    → { [dateKey]: Mission[] }
//    inventory:{email}   → CollectedItem[]
// ═══════════════════════════════════════════════════════════

const DB = {
  // ── Core get/set/del ──────────────────────────────────────
  get(key) {
    try {
      const val = localStorage.getItem(`lifexp:${key}`);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  set(key, val) {
    try {
      localStorage.setItem(`lifexp:${key}`, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error('DB.set error:', e);
      return false;
    }
  },

  del(key) {
    try { localStorage.removeItem(`lifexp:${key}`); } catch {}
  },

  // ── Auth registry ──────────────────────────────────────────
  getUsers()            { return this.get('auth:users') || {}; },
  saveUsers(users)      { return this.set('auth:users', users); },
  getSession()          { return this.get('auth:session'); },
  saveSession(email)    { return this.set('auth:session', { email, loginAt: Date.now() }); },
  clearSession()        { return this.del('auth:session'); },

  // ── Per-user profile ───────────────────────────────────────
  profileKey(email)     { return `profile:${email}`; },
  getProfile(email)     { return this.get(this.profileKey(email)); },
  saveProfile(email, p) { return this.set(this.profileKey(email), p); },

  // ── Per-user missions ──────────────────────────────────────
  missionsKey(email)        { return `missions:${email}`; },
  getMissions(email)        { return this.get(this.missionsKey(email)) || {}; },
  saveMissions(email, m)    { return this.set(this.missionsKey(email), m); },

  // ── Per-user inventory ─────────────────────────────────────
  inventoryKey(email)       { return `inventory:${email}`; },
  getInventory(email)       { return this.get(this.inventoryKey(email)) || []; },
  saveInventory(email, inv) { return this.set(this.inventoryKey(email), inv); },

  // ── Password hash ──────────────────────────────────────────
  // Deterministic hash — same password always → same hash
  hashPw(pw) {
    let h = 0;
    for (let i = 0; i < pw.length; i++) {
      h = Math.imul(31, h) + pw.charCodeAt(i) | 0;
    }
    return (h >>> 0).toString(36) + pw.length.toString(36) + btoa(pw.slice(-3)).replace(/=/g, '');
  },
};

export default DB;
