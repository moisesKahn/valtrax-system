/* ============================================================
   VALTRAX — Utilidades globales
   ============================================================ */
function formatRut(input){
    let v = input.value.replace(/[^0-9kK]/g, '').toUpperCase();
    if(v.length === 0){ input.value = ''; return; }
    let dv  = v.slice(-1);
    let num = v.slice(0, -1);
    num = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = num ? num + '-' + dv : dv;
}

/* ============================================================
   VALTRAX API CLIENT — sincroniza localStorage ↔ MySQL
   ============================================================ */
const ValtraxAPI = (function(){
    // Detectar si hay servidor API disponible
    const BASE = window.location.origin + '/api';
    let _apiDisponible = null; // null = sin verificar, true/false

    async function ping(){
        if(_apiDisponible !== null) return _apiDisponible;
        try {
            const r = await fetch(BASE + '/cotizaciones', { method: 'GET', signal: AbortSignal.timeout(2000) });
            _apiDisponible = r.ok;
        } catch { _apiDisponible = false; }
        return _apiDisponible;
    }

    async function get(endpoint){
        if(!(await ping())) return null;
        try {
            const r = await fetch(BASE + endpoint);
            if(!r.ok) return null;
            return await r.json();
        } catch { return null; }
    }

    async function post(endpoint, data){
        if(!(await ping())) return null;
        try {
            const r = await fetch(BASE + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(!r.ok) return null;
            return await r.json();
        } catch { return null; }
    }

    async function put(endpoint, data){
        if(!(await ping())) return null;
        try {
            const r = await fetch(BASE + endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if(!r.ok) return null;
            return await r.json();
        } catch { return null; }
    }

    async function del(endpoint){
        if(!(await ping())) return null;
        try {
            const r = await fetch(BASE + endpoint, { method: 'DELETE' });
            return r.ok;
        } catch { return null; }
    }

    // Al cargar la página, bajar datos del servidor y actualizar localStorage
    async function syncDown(){
        if(!(await ping())) return;
        try {
            const [cots, peds, ocs] = await Promise.all([
                get('/cotizaciones'), get('/pedidos'), get('/oc')
            ]);
            if(cots) localStorage.setItem('vx_cotizaciones', JSON.stringify(cots));
            if(peds) localStorage.setItem('vx_pedidos',      JSON.stringify(peds));
            if(ocs)  localStorage.setItem('vx_oc',           JSON.stringify(ocs));
        } catch(e){ console.warn('syncDown error', e); }
    }

    // Subir localStorage al servidor (primera vez o recovery)
    async function syncUp(){
        if(!(await ping())) return;
        try {
            await post('/sync', {
                cotizaciones: JSON.parse(localStorage.getItem('vx_cotizaciones')||'[]'),
                pedidos:      JSON.parse(localStorage.getItem('vx_pedidos')||'[]'),
                oc:           JSON.parse(localStorage.getItem('vx_oc')||'[]'),
            });
        } catch(e){ console.warn('syncUp error', e); }
    }

    return { ping, get, post, put, del, syncDown, syncUp };
})();

/* ============================================================
   VALTRAX DB — Persistencia localStorage + sync MySQL
   ============================================================ */
const ValtraxDB = (function(){

  /* ── CLIENTES / ENTIDADES ──────────────────────────────── */
  function getEntidades(){
    return JSON.parse(localStorage.getItem('vx_entidades') || '[]');
  }
  function saveEntidad(e){
    const list = getEntidades();
    if(e.id){
      const idx = list.findIndex(x => x.id === e.id);
      if(idx > -1) list[idx] = e; else list.push(e);
    } else {
      e.id = Date.now();
      e.creadoEn = new Date().toISOString().slice(0,10);
      list.push(e);
    }
    localStorage.setItem('vx_entidades', JSON.stringify(list));
    // Sync al servidor
    ValtraxAPI.post('/clientes', e).catch(()=>{});
    return e;
  }
  function deleteEntidad(id){
    const list = getEntidades().filter(e => e.id !== id);
    localStorage.setItem('vx_entidades', JSON.stringify(list));
    ValtraxAPI.del('/clientes/' + id).catch(()=>{});
  }
  function getEntidad(id){
    return getEntidades().find(e => e.id === id) || null;
  }

  /* ── COTIZACIONES ──────────────────────────────────────── */
  function getCotizaciones(){
    return JSON.parse(localStorage.getItem('vx_cotizaciones') || '[]');
  }
  function saveCotizacion(c){
    const list = getCotizaciones();
    if(c.id){
      const idx = list.findIndex(x => x.id === c.id);
      if(idx > -1) list[idx] = c; else list.push(c);
      localStorage.setItem('vx_cotizaciones', JSON.stringify(list));
      // Actualizar en servidor usando folio
      if(c.folio) ValtraxAPI.put('/cotizaciones/' + c.folio, c).catch(()=>{});
    } else {
      c.id = Date.now();
      const n = list.length + 100;
      c.folio = c.folio || ('COT' + String(n).padStart(5,'0'));
      c.creadoEn = new Date().toISOString().slice(0,10);
      list.push(c);
      localStorage.setItem('vx_cotizaciones', JSON.stringify(list));
      // Crear en servidor
      ValtraxAPI.post('/cotizaciones', c).catch(()=>{});
    }
    return c;
  }
  function deleteCotizacion(id){
    const list = getCotizaciones();
    const c = list.find(x => x.id === id);
    localStorage.setItem('vx_cotizaciones', JSON.stringify(list.filter(x => x.id !== id)));
    if(c && c.folio) ValtraxAPI.del('/cotizaciones/' + c.folio).catch(()=>{});
  }
  function updateCotizacion(id, campos){
    const list = getCotizaciones();
    const idx = list.findIndex(x => x.id === id);
    if(idx > -1){
      Object.assign(list[idx], campos);
      localStorage.setItem('vx_cotizaciones', JSON.stringify(list));
      if(list[idx].folio) ValtraxAPI.put('/cotizaciones/' + list[idx].folio, list[idx]).catch(()=>{});
      return list[idx];
    }
    return null;
  }

  /* ── PEDIDOS ───────────────────────────────────────────── */
  function getPedidos(){
    return JSON.parse(localStorage.getItem('vx_pedidos') || '[]');
  }
  function savePedido(p){
    const list = getPedidos();
    if(p.id){
      const idx = list.findIndex(x => x.id === p.id);
      if(idx > -1) list[idx] = p; else list.push(p);
      localStorage.setItem('vx_pedidos', JSON.stringify(list));
      if(p.folio) ValtraxAPI.put('/pedidos/' + p.folio, p).catch(()=>{});
    } else {
      p.id = Date.now();
      const n = list.length + 1;
      p.folio = p.folio || ('PED' + String(n).padStart(5,'0'));
      p.creadoEn = new Date().toISOString().slice(0,10);
      p.estado = p.estado || 'Pendiente';
      list.push(p);
      localStorage.setItem('vx_pedidos', JSON.stringify(list));
      ValtraxAPI.post('/pedidos', p).catch(()=>{});
    }
    return p;
  }
  function deletePedido(id){
    const list = getPedidos();
    const p = list.find(x => x.id === id);
    localStorage.setItem('vx_pedidos', JSON.stringify(list.filter(x => x.id !== id)));
    if(p && p.folio) ValtraxAPI.del('/pedidos/' + p.folio).catch(()=>{});
  }
  function updatePedido(id, campos){
    const list = getPedidos();
    const idx = list.findIndex(x => x.id === id);
    if(idx > -1){
      Object.assign(list[idx], campos);
      localStorage.setItem('vx_pedidos', JSON.stringify(list));
      if(list[idx].folio) ValtraxAPI.put('/pedidos/' + list[idx].folio, list[idx]).catch(()=>{});
      return list[idx];
    }
    return null;
  }

  /* ── ÓRDENES DE COMPRA ─────────────────────────────────── */
  function getOrdenesCompra(){
    return JSON.parse(localStorage.getItem('vx_oc') || '[]');
  }
  function saveOrdenCompra(oc){
    const list = getOrdenesCompra();
    if(oc.id){
      const idx = list.findIndex(x => x.id === oc.id);
      if(idx > -1) list[idx] = oc; else list.push(oc);
      localStorage.setItem('vx_oc', JSON.stringify(list));
      if(oc.folio) ValtraxAPI.put('/oc/' + oc.folio, oc).catch(()=>{});
    } else {
      oc.id = Date.now();
      const n = list.length + 1;
      oc.folio = oc.folio || ('OC' + String(n).padStart(5,'0'));
      oc.creadoEn = new Date().toISOString().slice(0,10);
      oc.estado = oc.estado || 'Borrador';
      list.push(oc);
      localStorage.setItem('vx_oc', JSON.stringify(list));
      ValtraxAPI.post('/oc', oc).catch(()=>{});
    }
    return oc;
  }
  function deleteOrdenCompra(id){
    const list = getOrdenesCompra();
    const o = list.find(x => x.id === id);
    localStorage.setItem('vx_oc', JSON.stringify(list.filter(x => x.id !== id)));
    if(o && o.folio) ValtraxAPI.del('/oc/' + o.folio).catch(()=>{});
  }
  function updateOrdenCompra(id, campos){
    const list = getOrdenesCompra();
    const idx = list.findIndex(x => x.id === id);
    if(idx > -1){
      Object.assign(list[idx], campos);
      localStorage.setItem('vx_oc', JSON.stringify(list));
      if(list[idx].folio) ValtraxAPI.put('/oc/' + list[idx].folio, list[idx]).catch(()=>{});
      return list[idx];
    }
    return null;
  }

  /* ── INIT ──────────────────────────────────────────────── */
  function seedIfEmpty(){
    const VX_DB_VERSION = '2';
    if(localStorage.getItem('vx_db_version') !== VX_DB_VERSION){
      localStorage.removeItem('vx_entidades');
      localStorage.removeItem('vx_cotizaciones');
      localStorage.removeItem('vx_pedidos');
      localStorage.removeItem('vx_oc');
      localStorage.setItem('vx_db_version', VX_DB_VERSION);
    }
    // Bajar datos del servidor si hay API disponible
    ValtraxAPI.syncDown().then(()=>{
        // Disparar evento para que las páginas recarguen sus tablas si es necesario
        document.dispatchEvent(new CustomEvent('valtrax:synced'));
    });
  }

  return { getEntidades, saveEntidad, deleteEntidad, getEntidad,
           getCotizaciones, saveCotizacion, deleteCotizacion, updateCotizacion,
           getPedidos, savePedido, deletePedido, updatePedido,
           getOrdenesCompra, saveOrdenCompra, deleteOrdenCompra, updateOrdenCompra,
           seedIfEmpty };
})();

/* ── Transición suave entre páginas ── */
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript') ||
            e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank') return;
        e.preventDefault();
        document.body.classList.add('vx-fadeout');
        setTimeout(function() { location.href = href; }, 190);
    });
});
