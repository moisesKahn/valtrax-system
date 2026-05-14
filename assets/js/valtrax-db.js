/* ============================================================
   VALTRAX — Utilidades globales
   ============================================================ */

/**
 * Formatea un RUT chileno mientras el usuario escribe.
 * Uso: <input oninput="formatRut(this)">
 * Resultado: 18.315.475-3  /  88.254.654-0  /  5.432.109-K
 */
function formatRut(input){
    let v = input.value.replace(/[^0-9kK]/g, '').toUpperCase();
    if(v.length === 0){ input.value = ''; return; }
    let dv  = v.slice(-1);           // dígito verificador
    let num = v.slice(0, -1);        // parte numérica
    // Agregar puntos cada 3 dígitos desde la derecha
    num = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = num ? num + '-' + dv : dv;
}

/* ============================================================
   VALTRAX DB — Persistencia en localStorage
   ============================================================ */
const ValtraxDB = (function(){

  /* ── ENTIDADES ─────────────────────────────────────────── */
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
    return e;
  }
  function deleteEntidad(id){
    const list = getEntidades().filter(e => e.id !== id);
    localStorage.setItem('vx_entidades', JSON.stringify(list));
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
    } else {
      c.id = Date.now();
      const n = list.length + 1;
      c.folio = 'COT' + String(n).padStart(5,'0');
      c.creadoEn = new Date().toISOString().slice(0,10);
      list.push(c);
    }
    localStorage.setItem('vx_cotizaciones', JSON.stringify(list));
    return c;
  }
  function deleteCotizacion(id){
    const list = getCotizaciones().filter(c => c.id !== id);
    localStorage.setItem('vx_cotizaciones', JSON.stringify(list));
  }
  function updateCotizacion(id, campos){
    const list = getCotizaciones();
    const idx = list.findIndex(x => x.id === id);
    if(idx > -1){ Object.assign(list[idx], campos); localStorage.setItem('vx_cotizaciones', JSON.stringify(list)); return list[idx]; }
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
    } else {
      p.id = Date.now();
      const n = list.length + 1;
      p.folio = 'PED' + String(n).padStart(5,'0');
      p.creadoEn = new Date().toISOString().slice(0,10);
      p.estado = p.estado || 'Pendiente';
      list.push(p);
    }
    localStorage.setItem('vx_pedidos', JSON.stringify(list));
    return p;
  }
  function deletePedido(id){
    const list = getPedidos().filter(p => p.id !== id);
    localStorage.setItem('vx_pedidos', JSON.stringify(list));
  }
  function updatePedido(id, campos){
    const list = getPedidos();
    const idx = list.findIndex(x => x.id === id);
    if(idx > -1){ Object.assign(list[idx], campos); localStorage.setItem('vx_pedidos', JSON.stringify(list)); return list[idx]; }
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
    } else {
      oc.id = Date.now();
      const n = list.length + 1;
      oc.folio = 'OC' + String(n).padStart(5,'0');
      oc.creadoEn = new Date().toISOString().slice(0,10);
      oc.estado = oc.estado || 'Borrador';
      list.push(oc);
    }
    localStorage.setItem('vx_oc', JSON.stringify(list));
    return oc;
  }
  function deleteOrdenCompra(id){
    const list = getOrdenesCompra().filter(o => o.id !== id);
    localStorage.setItem('vx_oc', JSON.stringify(list));
  }
  function updateOrdenCompra(id, campos){
    const list = getOrdenesCompra();
    const idx = list.findIndex(x => x.id === id);
    if(idx > -1){ Object.assign(list[idx], campos); localStorage.setItem('vx_oc', JSON.stringify(list)); return list[idx]; }
    return null;
  }

  /* ── SEMILLA DEMO (solo si no hay datos) ───────────────── */
  function seedIfEmpty(){
    // Limpiar datos demo de versiones anteriores si existen
    const VX_DB_VERSION = '2';
    if(localStorage.getItem('vx_db_version') !== VX_DB_VERSION){
      localStorage.removeItem('vx_entidades');
      localStorage.removeItem('vx_cotizaciones');
      localStorage.removeItem('vx_pedidos');
      localStorage.removeItem('vx_oc');
      localStorage.setItem('vx_db_version', VX_DB_VERSION);
    }
    // Sistema listo para datos reales — sin semilla demo
  }

  return { getEntidades, saveEntidad, deleteEntidad, getEntidad, getCotizaciones, saveCotizacion, deleteCotizacion, updateCotizacion, getPedidos, savePedido, deletePedido, updatePedido, getOrdenesCompra, saveOrdenCompra, deleteOrdenCompra, updateOrdenCompra, seedIfEmpty };
})();
