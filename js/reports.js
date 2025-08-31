
(() => {
  const REPORTS_KEY = 'coolzm_reports_v1';
  const ADMIN_PWD = '846534673739926856353474';

  // ===== Единственный объект БД =====
  const DB = (() => {
    try {
      const raw = localStorage.getItem(REPORTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e){ console.warn('parse error', e); }
    return { reports: [], meta: { version: 1, createdAt: Date.now() } };
  })();

  function persist(){ localStorage.setItem(REPORTS_KEY, JSON.stringify(DB)); }
  function genId(){ return 'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

  function list(){
    return [...DB.reports].sort((a,b)=> b.createdAt - a.createdAt);
  }

  function add(payload){
    const rec = {
      id: genId(),
      createdAt: Date.now(),
      status: 'new',     // new | opened | resolved
      handledBy: '',
      notes: '',
      ...payload
    };
    DB.reports.unshift(rec);
    persist();
    return rec;
  }

  function update(id, patch){
    const i = DB.reports.findIndex(r=>r.id===id);
    if (i === -1) return null;
    DB.reports[i] = { ...DB.reports[i], ...patch, updatedAt: Date.now() };
    persist();
    return DB.reports[i];
  }

  function exportJSON(){ return JSON.stringify(DB, null, 2); }
  function importJSON(text){
    const obj = JSON.parse(text);
    if (obj && Array.isArray(obj.reports)) {
      DB.reports = obj.reports;
      DB.meta = obj.meta || DB.meta || { version:1, createdAt: Date.now() };
      persist();
    }
  }

  // Экспорт API
  window.Reports = {
    ADMIN_PWD,
    list, add, update,
    exportJSON, importJSON
  };
})();
