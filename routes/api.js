const { Router } = require('express');
const { pool }   = require('../db');
const router     = Router();

/* ════════════════════════════════════════════════════════════
   HELPER: generar folio correlativo
   ════════════════════════════════════════════════════════════ */
async function nextFolio(tabla, prefijo) {
    const [rows] = await pool.query(`SELECT COUNT(*) as n FROM \`${tabla}\``);
    const n = (rows[0].n || 0) + 100;
    return prefijo + String(n).padStart(5, '0');
}

/* ════════════════════════════════════════════════════════════
   CLIENTES
   ════════════════════════════════════════════════════════════ */
router.get('/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/clientes', async (req, res) => {
    try {
        const d = req.body;
        const [r] = await pool.query(
            'INSERT INTO clientes (nombre,rut,giro,direccion,contacto,email,telefono,datos_extra) VALUES (?,?,?,?,?,?,?,?)',
            [d.nombre, d.rut||null, d.giro||null, d.direccion||null, d.contacto||null, d.email||null, d.telefono||null, JSON.stringify(d.datos_extra||{})]
        );
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [r.insertId]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/clientes/:id', async (req, res) => {
    try {
        const d = req.body;
        await pool.query(
            'UPDATE clientes SET nombre=?,rut=?,giro=?,direccion=?,contacto=?,email=?,telefono=?,datos_extra=? WHERE id=?',
            [d.nombre, d.rut||null, d.giro||null, d.direccion||null, d.contacto||null, d.email||null, d.telefono||null, JSON.stringify(d.datos_extra||{}), req.params.id]
        );
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/clientes/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM clientes WHERE id=?', [req.params.id]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════════════════════
   COTIZACIONES
   ════════════════════════════════════════════════════════════ */
router.get('/cotizaciones', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cotizaciones ORDER BY id DESC');
        // Parsear items JSON
        res.json(rows.map(r => ({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []) })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/cotizaciones/:folio', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cotizaciones WHERE folio=?', [req.params.folio]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
        const r = rows[0];
        res.json({ ...r, items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/cotizaciones', async (req, res) => {
    try {
        const d = req.body;
        const folio = d.folio || await nextFolio('cotizaciones', 'COT');
        const [r] = await pool.query(
            'INSERT INTO cotizaciones (folio,cliente,faena,responsable,fecha,vigencia,estado,forma_pago,obs,total,items) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [folio, d.cliente||null, d.faena||null, d.responsable||null, d.fecha||null, d.vigencia||null,
             d.estado||'Pendiente', d.forma_pago||null, d.obs||null, d.total||0, JSON.stringify(d.items||[])]
        );
        const [rows] = await pool.query('SELECT * FROM cotizaciones WHERE id=?', [r.insertId]);
        const row = rows[0];
        res.json({ ...row, items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/cotizaciones/:folio', async (req, res) => {
    try {
        const d = req.body;
        await pool.query(
            'UPDATE cotizaciones SET cliente=?,faena=?,responsable=?,fecha=?,vigencia=?,estado=?,forma_pago=?,obs=?,total=?,items=? WHERE folio=?',
            [d.cliente||null, d.faena||null, d.responsable||null, d.fecha||null, d.vigencia||null,
             d.estado||'Pendiente', d.forma_pago||null, d.obs||null, d.total||0, JSON.stringify(d.items||[]), req.params.folio]
        );
        const [rows] = await pool.query('SELECT * FROM cotizaciones WHERE folio=?', [req.params.folio]);
        const row = rows[0];
        res.json({ ...row, items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cotizaciones/:folio', async (req, res) => {
    try {
        await pool.query('DELETE FROM cotizaciones WHERE folio=?', [req.params.folio]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════════════════════
   PEDIDOS
   ════════════════════════════════════════════════════════════ */
router.get('/pedidos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos ORDER BY id DESC');
        res.json(rows.map(r => ({
            ...r,
            items:         typeof r.items         === 'string' ? JSON.parse(r.items)         : (r.items         || []),
            datos_cliente: typeof r.datos_cliente === 'string' ? JSON.parse(r.datos_cliente) : (r.datos_cliente || {})
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/pedidos/:folio', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE folio=?', [req.params.folio]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
        const r = rows[0];
        res.json({
            ...r,
            items:         typeof r.items         === 'string' ? JSON.parse(r.items)         : (r.items         || []),
            datos_cliente: typeof r.datos_cliente === 'string' ? JSON.parse(r.datos_cliente) : (r.datos_cliente || {})
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/pedidos', async (req, res) => {
    try {
        const d = req.body;
        const folio = d.folio || await nextFolio('pedidos', 'PED');
        const [r] = await pool.query(
            'INSERT INTO pedidos (folio,cot_folio,ppto_id,cliente,cliente_id,faena,responsable,estado,fecha,forma_pago,total_venta,total_costo,total_margen,ganancia,abono,obs,items) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [folio, d.cot_folio||d.cotFolio||null, d.ppto_id||null,
             d.cliente||null, d.cliente_id||null, d.faena||null, d.responsable||null,
             d.estado||'Pendiente', d.fecha||null, d.forma_pago||null,
             d.total_venta||d.total||0, d.total_costo||0, d.total_margen||0, d.ganancia||0,
             d.abono||0, d.obs||null, JSON.stringify(d.items||[])]
        );
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE id=?', [r.insertId]);
        const row = rows[0];
        res.json({ ...row, items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/pedidos/:folio', async (req, res) => {
    try {
        const d = req.body;
        const fechaNorm = d.fecha ? String(d.fecha).slice(0, 10) : null;
        await pool.query(
            `UPDATE pedidos SET cliente=?,faena=?,responsable=?,estado=?,fecha=?,forma_pago=?,
             total_venta=?,total_costo=?,ganancia=?,abono=?,obs=?,items=?,datos_cliente=?,dir_entrega=? WHERE folio=?`,
            [d.cliente||null, d.faena||null, d.responsable||null, d.estado||'Pendiente',
             fechaNorm, d.forma_pago||null,
             d.total_venta||d.total||0, d.total_costo||0, d.ganancia||0,
             d.abono||0, d.obs||null, JSON.stringify(d.items||[]),
             d.datos_cliente ? JSON.stringify(d.datos_cliente) : null,
             d.dir_entrega||null,
             req.params.folio]
        );
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE folio=?', [req.params.folio]);
        const row = rows[0];
        res.json({ ...row,
            items:         typeof row.items         === 'string' ? JSON.parse(row.items)         : (row.items         || []),
            datos_cliente: typeof row.datos_cliente === 'string' ? JSON.parse(row.datos_cliente) : (row.datos_cliente || {})
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/pedidos/:folio', async (req, res) => {
    try {
        await pool.query('DELETE FROM pedidos WHERE folio=?', [req.params.folio]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════════════════════
   ÓRDENES DE COMPRA
   ════════════════════════════════════════════════════════════ */
router.get('/oc', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ordenes_compra ORDER BY id DESC');
        res.json(rows.map(r => ({
            ...r,
            items:         typeof r.items         === 'string' ? JSON.parse(r.items)         : (r.items         || []),
            datos_cliente: typeof r.datos_cliente === 'string' ? JSON.parse(r.datos_cliente) : (r.datos_cliente || {})
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/oc/:folio', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE folio=?', [req.params.folio]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
        const r = rows[0];
        res.json({
            ...r,
            items:         typeof r.items         === 'string' ? JSON.parse(r.items)         : (r.items         || []),
            datos_cliente: typeof r.datos_cliente === 'string' ? JSON.parse(r.datos_cliente) : (r.datos_cliente || {})
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/oc', async (req, res) => {
    try {
        const d = req.body;
        const folio = d.folio || await nextFolio('ordenes_compra', 'OC');
        const [r] = await pool.query(
            'INSERT INTO ordenes_compra (folio,pedido_folio,ppto_id,proveedor,estado,fecha,total_costo,obs,items) VALUES (?,?,?,?,?,?,?,?,?)',
            [folio, d.pedido_folio||d.pedidoFolio||null, d.ppto_id||null, d.proveedor||null,
             d.estado||'Borrador', d.fecha||null, d.total_costo||d.total||0, d.obs||null, JSON.stringify(d.items||[])]
        );
        const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE id=?', [r.insertId]);
        const row = rows[0];
        res.json({
            ...row,
            items:         typeof row.items         === 'string' ? JSON.parse(row.items)         : (row.items         || []),
            datos_cliente: typeof row.datos_cliente === 'string' ? JSON.parse(row.datos_cliente) : (row.datos_cliente || {})
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/oc/:folio', async (req, res) => {
    try {
        const d = req.body;
        // Normalizar fecha a YYYY-MM-DD
        let fecha = d.fecha || null;
        if (fecha && fecha.includes('T')) fecha = fecha.split('T')[0];
        await pool.query(
            `UPDATE ordenes_compra SET proveedor=?,estado=?,fecha=?,total_costo=?,obs=?,items=?,datos_cliente=?,dir_entrega=? WHERE folio=?`,
            [d.proveedor||null, d.estado||'Pendiente', fecha,
             d.total_costo||d.total||0, d.obs||null, JSON.stringify(d.items||[]),
             d.datos_cliente ? JSON.stringify(d.datos_cliente) : null,
             d.dir_entrega||null,
             req.params.folio]
        );
        const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE folio=?', [req.params.folio]);
        const row = rows[0];

        // ── Sincronización automática OC → Pedido ────────────────
        const pedFolio = row.pedido_folio;
        if (pedFolio) {
            let nuevoEstadoPed = null;
            if (d.estado === 'Aprobada')  nuevoEstadoPed = 'En compra';
            if (d.estado === 'Comprada')  nuevoEstadoPed = 'Preparación';
            if (nuevoEstadoPed) {
                await pool.query('UPDATE pedidos SET estado=? WHERE folio=?', [nuevoEstadoPed, pedFolio]);
            }
        }

        res.json({
            ...row,
            items:         typeof row.items         === 'string' ? JSON.parse(row.items)         : (row.items         || []),
            datos_cliente: typeof row.datos_cliente === 'string' ? JSON.parse(row.datos_cliente) : (row.datos_cliente || {})
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/oc/:folio', async (req, res) => {
    try {
        await pool.query('DELETE FROM ordenes_compra WHERE folio=?', [req.params.folio]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════════════════════
   PRESUPUESTOS (Solicitud → Presupuesto Interno → Cotización)
   ════════════════════════════════════════════════════════════ */
router.get('/presupuestos', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, folio, estado, cliente, cliente_id, cabecera, creado_en, actualizado FROM presupuestos ORDER BY creado_en DESC'
        );
        res.json(rows.map(r => ({
            ...r,
            cabecera: typeof r.cabecera === 'string' ? JSON.parse(r.cabecera) : r.cabecera,
            items:    typeof r.items    === 'string' ? JSON.parse(r.items)    : r.items,
            ppto:     typeof r.ppto     === 'string' ? JSON.parse(r.ppto)     : r.ppto
        })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/presupuestos/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM presupuestos WHERE id=?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
        const r = rows[0];
        res.json({
            ...r,
            cabecera: typeof r.cabecera === 'string' ? JSON.parse(r.cabecera) : r.cabecera,
            items:    typeof r.items    === 'string' ? JSON.parse(r.items)    : r.items,
            ppto:     typeof r.ppto     === 'string' ? JSON.parse(r.ppto)     : r.ppto
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/presupuestos', async (req, res) => {
    try {
        const d = req.body;
        await pool.query(
            'INSERT INTO presupuestos (id,folio,estado,cliente,cliente_id,cabecera,items,ppto) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE estado=VALUES(estado),cliente=VALUES(cliente),cliente_id=VALUES(cliente_id),cabecera=VALUES(cabecera),items=VALUES(items),ppto=VALUES(ppto)',
            [d.id, d.folio||d.id, d.estado||'solicitud', d.cabecera?.cliente||'', d.cabecera?.clienteId||'', JSON.stringify(d.cabecera||{}), JSON.stringify(d.items||[]), JSON.stringify(d.ppto||{})]
        );
        const [rows] = await pool.query('SELECT * FROM presupuestos WHERE id=?', [d.id]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/presupuestos/:id', async (req, res) => {
    try {
        const d = req.body;
        await pool.query(
            'UPDATE presupuestos SET estado=?,cliente=?,cliente_id=?,cabecera=?,items=?,ppto=? WHERE id=?',
            [d.estado||'solicitud', d.cabecera?.cliente||'', d.cabecera?.clienteId||'', JSON.stringify(d.cabecera||{}), JSON.stringify(d.items||[]), JSON.stringify(d.ppto||{}), req.params.id]
        );
        const [rows] = await pool.query('SELECT * FROM presupuestos WHERE id=?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/presupuestos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM presupuestos WHERE id=?', [req.params.id]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ─────────────────────────────────────────────────────────────
   APROBAR COTIZACIÓN → genera Pedido + OC de forma atómica
   POST /api/presupuestos/:id/aprobar
   ───────────────────────────────────────────────────────────── */
router.post('/presupuestos/:id/aprobar', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Cargar presupuesto
        const [rows] = await conn.query('SELECT * FROM presupuestos WHERE id=?', [req.params.id]);
        if (!rows.length) { await conn.rollback(); conn.release(); return res.status(404).json({ error: 'No encontrado' }); }
        const p = rows[0];
        if (p.bloqueado) { await conn.rollback(); conn.release(); return res.status(400).json({ error: 'Este registro ya está aprobado y bloqueado' }); }

        const cabecera  = typeof p.cabecera === 'string' ? JSON.parse(p.cabecera) : (p.cabecera || {});
        const items     = typeof p.items    === 'string' ? JSON.parse(p.items)    : (p.items    || []);
        const ppto      = typeof p.ppto     === 'string' ? JSON.parse(p.ppto)     : (p.ppto     || {});
        const folioCot  = p.folio || req.params.id;
        const fecha     = cabecera.fecha || new Date().toISOString().slice(0,10);
        const mg        = parseInt(req.body.margen) || 30;

        // 2. Construir ítems enriquecidos con financiero
        let totalVenta = 0, totalCosto = 0, ganancia = 0;
        const itemsPedido = items.map(it => {
            const pptoIt  = ppto[it.id] || { opciones: [] };
            const sel     = (pptoIt.opciones || []).find(o => o.seleccionada);
            const cant    = parseFloat(it.cant) || 1;
            const costo   = sel ? (parseFloat(sel.precio) || 0) : 0;
            const margen  = sel ? (parseFloat(sel.margen) ?? mg) : mg;
            const venta   = sel ? (parseFloat(sel.ventaUnit) || Math.round(costo * (1 + margen/100))) : 0;
            totalCosto += costo * cant;
            totalVenta += venta * cant;
            return {
                desc:       it.desc,
                cant,
                unidad:     it.unidad || 'un',
                subItems:   it.subItems || [],
                costoUnit:  costo,
                ventaUnit:  venta,
                margen,
                tienda:     sel ? (sel.lugar || '') : '',
                url:        sel ? (sel.url   || '') : '',
                ganancia:   Math.round((venta - costo) * cant)
            };
        }).filter(it => it.costoUnit > 0 || it.ventaUnit > 0);
        ganancia = totalVenta - totalCosto;
        const margenProm = totalCosto > 0 ? Math.round((ganancia / totalCosto) * 100 * 100) / 100 : 0;

        const financiero = { totalVenta, totalCosto, ganancia, margenProm };

        // 3. Generar folio pedido
        const [cntPed] = await conn.query('SELECT COUNT(*) as n FROM pedidos');
        const folioPed = 'PED-' + String((cntPed[0].n || 0) + 100).padStart(5, '0');

        // 4. Generar folio OC (una por proveedor o una general)
        const [cntOC] = await conn.query('SELECT COUNT(*) as n FROM ordenes_compra');
        const folioOC  = 'OC-' + String((cntOC[0].n || 0) + 100).padStart(5, '0');

        // 5. Insertar Pedido
        const datosCliente = {
            nombre:    cabecera.cliente    || '',
            id:        cabecera.clienteId  || '',
            rut:       cabecera.rut        || '',
            giro:      cabecera.giro       || '',
            direccion: cabecera.dirCliente || '',
            contacto:  cabecera.contacto   || '',
            email:     cabecera.email      || '',
            telefono:  cabecera.telefono   || ''
        };
        const dirEntrega = cabecera.faena || cabecera.dirEntrega || '';
        await conn.query(
            `INSERT INTO pedidos (folio,cot_folio,ppto_id,cliente,cliente_id,faena,responsable,estado,fecha,forma_pago,total_venta,total_costo,total_margen,ganancia,obs,items,datos_cliente,dir_entrega)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [folioPed, folioCot, p.id,
             cabecera.cliente||'', cabecera.clienteId||'', cabecera.faena||'', cabecera.responsable||'',
             'Pendiente', fecha, cabecera.pago||null, totalVenta, totalCosto, margenProm, ganancia,
             cabecera.obs||null, JSON.stringify(itemsPedido),
             JSON.stringify(datosCliente), dirEntrega]
        );

        // 6. Insertar OC — ítems con costo interno + trazabilidad completa
        const itemsOC = itemsPedido.map(it => ({
            desc:       it.desc,
            cant:       it.cant,
            unidad:     it.unidad,
            subItems:   it.subItems || [],
            costoUnit:  it.costoUnit,
            totalCosto: Math.round(it.costoUnit * it.cant),
            tienda:     it.tienda,
            url:        it.url
        }));
        await conn.query(
            `INSERT INTO ordenes_compra (folio,pedido_folio,ppto_id,cot_folio,cliente,cliente_id,proveedor,estado,fecha,total_costo,obs,items,datos_cliente,dir_entrega)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [folioOC, folioPed, p.id, folioCot,
             cabecera.cliente||'', cabecera.clienteId||'',
             null, 'Borrador', fecha, totalCosto, cabecera.obs||null, JSON.stringify(itemsOC),
             JSON.stringify(datosCliente), dirEntrega]
        );

        // 7. Actualizar presupuesto: aprobada + bloqueado + referencias
        await conn.query(
            `UPDATE presupuestos SET estado='aprobada', bloqueado=1, pedido_folio=?, oc_folio=?, financiero=? WHERE id=?`,
            [folioPed, folioOC, JSON.stringify(financiero), p.id]
        );

        await conn.commit();
        res.json({ ok: true, folioPed, folioOC, financiero });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
});

/* ─────────────────────────────────────────────────────────────
   DUPLICAR COTIZACIÓN
   POST /api/presupuestos/:id/duplicar
   ───────────────────────────────────────────────────────────── */
router.post('/presupuestos/:id/duplicar', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM presupuestos WHERE id=?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
        const orig = rows[0];

        // Nuevo ID y folio
        const nuevoId    = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        const n          = Math.floor(Math.random() * 900000 + 100000);
        const nuevoFolio = 'COT-' + n;

        await pool.query(
            `INSERT INTO presupuestos (id,folio,estado,bloqueado,cliente,cliente_id,cabecera,items,ppto)
             VALUES (?,?,?,0,?,?,?,?,?)`,
            [nuevoId, nuevoFolio, 'solicitud', orig.cliente||'', orig.cliente_id||'',
             orig.cabecera, orig.items, orig.ppto]
        );
        const [newRows] = await pool.query('SELECT * FROM presupuestos WHERE id=?', [nuevoId]);
        const r = newRows[0];
        res.json({
            ...r,
            cabecera: typeof r.cabecera === 'string' ? JSON.parse(r.cabecera) : r.cabecera,
            items:    typeof r.items    === 'string' ? JSON.parse(r.items)    : r.items,
            ppto:     typeof r.ppto     === 'string' ? JSON.parse(r.ppto)     : r.ppto
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════════════════════
   SYNC — el frontend sube su localStorage al iniciar sesión
   ════════════════════════════════════════════════════════════ */
router.post('/sync', async (req, res) => {
    const { cotizaciones = [], pedidos = [], oc = [], clientes = [] } = req.body;
    try {
        // Upsert cada entidad (INSERT IGNORE + UPDATE)
        for (const c of cotizaciones) {
            if (!c.folio) continue;
            await pool.query(
                `INSERT INTO cotizaciones (folio,cliente,faena,responsable,fecha,vigencia,estado,forma_pago,obs,total,items)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE cliente=VALUES(cliente),faena=VALUES(faena),responsable=VALUES(responsable),
                 estado=VALUES(estado),total=VALUES(total),items=VALUES(items)`,
                [c.folio,c.cliente||null,c.faena||null,c.responsable||null,c.fecha||null,c.vigencia||null,
                 c.estado||'Pendiente',c.formaPago||null,c.obs||null,c.total||0,JSON.stringify(c.items||[])]
            );
        }
        for (const p of pedidos) {
            if (!p.folio) continue;
            await pool.query(
                `INSERT INTO pedidos (folio,cot_folio,cliente,faena,responsable,estado,fecha,forma_pago,total,abono,obs,items)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE estado=VALUES(estado),total=VALUES(total),abono=VALUES(abono),items=VALUES(items)`,
                [p.folio,p.cotFolio||null,p.cliente||null,p.faena||null,p.responsable||null,
                 p.estado||'Pendiente',p.fecha||null,p.formaPago||null,p.total||0,p.abono||0,p.obs||null,JSON.stringify(p.items||[])]
            );
        }
        for (const o of oc) {
            if (!o.folio) continue;
            await pool.query(
                `INSERT INTO ordenes_compra (folio,pedido_folio,proveedor,estado,fecha,total,obs,items)
                 VALUES (?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE estado=VALUES(estado),total=VALUES(total),items=VALUES(items)`,
                [o.folio,o.pedidoFolio||null,o.proveedor||null,o.estado||'Borrador',o.fecha||null,o.total||0,o.obs||null,JSON.stringify(o.items||[])]
            );
        }
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ════════════════════════════════════════════════════════════
   BÚSQUEDA DE PRECIOS — Serper Shopping (Google Shopping Chile)
   GET /api/serper-shopping?q=...
   ════════════════════════════════════════════════════════════ */
router.get('/serper-shopping', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Parámetro q requerido' });

    try {
        const response = await fetch('https://google.serper.dev/shopping', {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q, gl: 'cl', hl: 'es-419', num: 10 })
        });

        const data = await response.json();
        const items = (data.shopping || []).map(item => ({
            name: item.title,
            store: item.source,
            price_raw: item.price,
            price: parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
            currency: 'CLP',
            url: item.link,
            image_url: item.imageUrl || ''
        })).filter(item => item.price > 0);

        const prices = items.map(i => i.price);
        const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

        res.json({
            query: q,
            results: items,
            summary: {
                total: items.length,
                min_price: prices.length ? Math.min(...prices) : 0,
                max_price: prices.length ? Math.max(...prices) : 0,
                avg_price: Math.round(avg)
            },
            price_suggestions: {
                margin_15: Math.round(avg * 1.15),
                margin_25: Math.round(avg * 1.25),
                margin_35: Math.round(avg * 1.35)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar precios', detail: error.message });
    }
});

/* ════════════════════════════════════════════════════════════
   USUARIOS
   ════════════════════════════════════════════════════════════ */
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id,nombre,usuario,rol,activo,creado_en FROM usuarios ORDER BY id ASC');
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/usuarios', async (req, res) => {
    try {
        const d = req.body;
        if (!d.usuario || !d.clave || !d.nombre) return res.status(400).json({ error: 'Nombre, usuario y clave son obligatorios' });
        // Verificar duplicado
        const [ex] = await pool.query('SELECT id FROM usuarios WHERE usuario=?', [d.usuario]);
        if (ex.length) return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        const [r] = await pool.query(
            'INSERT INTO usuarios (nombre,usuario,clave,rol,activo) VALUES (?,?,?,?,?)',
            [d.nombre, d.usuario, d.clave, d.rol||'vendedor', d.activo!==false?1:0]
        );
        const [rows] = await pool.query('SELECT id,nombre,usuario,rol,activo,creado_en FROM usuarios WHERE id=?', [r.insertId]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/usuarios/:id', async (req, res) => {
    try {
        const d = req.body;
        // Si cambia usuario, verificar duplicado
        if (d.usuario) {
            const [ex] = await pool.query('SELECT id FROM usuarios WHERE usuario=? AND id<>?', [d.usuario, req.params.id]);
            if (ex.length) return res.status(400).json({ error: 'El nombre de usuario ya existe' });
        }
        const sets = [], vals = [];
        if (d.nombre  !== undefined) { sets.push('nombre=?');  vals.push(d.nombre); }
        if (d.usuario !== undefined) { sets.push('usuario=?'); vals.push(d.usuario); }
        if (d.clave   && d.clave.trim()) { sets.push('clave=?'); vals.push(d.clave); }
        if (d.rol     !== undefined) { sets.push('rol=?');     vals.push(d.rol); }
        if (d.activo  !== undefined) { sets.push('activo=?');  vals.push(d.activo?1:0); }
        if (!sets.length) return res.status(400).json({ error: 'Nada que actualizar' });
        vals.push(req.params.id);
        await pool.query(`UPDATE usuarios SET ${sets.join(',')} WHERE id=?`, vals);
        const [rows] = await pool.query('SELECT id,nombre,usuario,rol,activo,creado_en FROM usuarios WHERE id=?', [req.params.id]);
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/usuarios/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM usuarios WHERE id=?', [req.params.id]);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/* login via API */
router.post('/auth/login', async (req, res) => {
    try {
        const { usuario, clave } = req.body;
        const [rows] = await pool.query('SELECT id,nombre,usuario,rol,activo FROM usuarios WHERE usuario=? AND clave=? AND activo=1', [usuario, clave]);
        if (!rows.length) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        res.json({ ok: true, ...rows[0] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
