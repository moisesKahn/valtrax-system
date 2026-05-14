const { Router } = require('express');
const { pool }   = require('../db');
const router     = Router();

/* ════════════════════════════════════════════════════════════
   HELPER: generar folio correlativo
   ════════════════════════════════════════════════════════════ */
async function nextFolio(tabla, prefijo) {
    const [rows] = await pool.query(`SELECT COUNT(*) as n FROM \`${tabla}\``);
    const n = (rows[0].n || 0) + 1;
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
        res.json(rows.map(r => ({ ...r, items: r.items ? JSON.parse(r.items) : [] })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/cotizaciones/:folio', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM cotizaciones WHERE folio=?', [req.params.folio]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
        const r = rows[0];
        res.json({ ...r, items: r.items ? JSON.parse(r.items) : [] });
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
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
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
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
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
        res.json(rows.map(r => ({ ...r, items: r.items ? JSON.parse(r.items) : [] })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/pedidos/:folio', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE folio=?', [req.params.folio]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
        const r = rows[0];
        res.json({ ...r, items: r.items ? JSON.parse(r.items) : [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/pedidos', async (req, res) => {
    try {
        const d = req.body;
        const folio = d.folio || await nextFolio('pedidos', 'PED');
        const [r] = await pool.query(
            'INSERT INTO pedidos (folio,cot_folio,cliente,faena,responsable,estado,fecha,forma_pago,total,abono,obs,items) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [folio, d.cot_folio||d.cotFolio||null, d.cliente||null, d.faena||null, d.responsable||null,
             d.estado||'Pendiente', d.fecha||null, d.forma_pago||null, d.total||0, d.abono||0, d.obs||null, JSON.stringify(d.items||[])]
        );
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE id=?', [r.insertId]);
        const row = rows[0];
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/pedidos/:folio', async (req, res) => {
    try {
        const d = req.body;
        await pool.query(
            'UPDATE pedidos SET cliente=?,faena=?,responsable=?,estado=?,fecha=?,forma_pago=?,total=?,abono=?,obs=?,items=? WHERE folio=?',
            [d.cliente||null, d.faena||null, d.responsable||null, d.estado||'Pendiente',
             d.fecha||null, d.forma_pago||null, d.total||0, d.abono||0, d.obs||null, JSON.stringify(d.items||[]), req.params.folio]
        );
        const [rows] = await pool.query('SELECT * FROM pedidos WHERE folio=?', [req.params.folio]);
        const row = rows[0];
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
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
        res.json(rows.map(r => ({ ...r, items: r.items ? JSON.parse(r.items) : [] })));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/oc/:folio', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE folio=?', [req.params.folio]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
        const r = rows[0];
        res.json({ ...r, items: r.items ? JSON.parse(r.items) : [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/oc', async (req, res) => {
    try {
        const d = req.body;
        const folio = d.folio || await nextFolio('ordenes_compra', 'OC');
        const [r] = await pool.query(
            'INSERT INTO ordenes_compra (folio,pedido_folio,proveedor,estado,fecha,total,obs,items) VALUES (?,?,?,?,?,?,?,?)',
            [folio, d.pedido_folio||d.pedidoFolio||null, d.proveedor||null,
             d.estado||'Borrador', d.fecha||null, d.total||0, d.obs||null, JSON.stringify(d.items||[])]
        );
        const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE id=?', [r.insertId]);
        const row = rows[0];
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/oc/:folio', async (req, res) => {
    try {
        const d = req.body;
        await pool.query(
            'UPDATE ordenes_compra SET proveedor=?,estado=?,fecha=?,total=?,obs=?,items=? WHERE folio=?',
            [d.proveedor||null, d.estado||'Borrador', d.fecha||null, d.total||0, d.obs||null, JSON.stringify(d.items||[]), req.params.folio]
        );
        const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE folio=?', [req.params.folio]);
        const row = rows[0];
        res.json({ ...row, items: row.items ? JSON.parse(row.items) : [] });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/oc/:folio', async (req, res) => {
    try {
        await pool.query('DELETE FROM ordenes_compra WHERE folio=?', [req.params.folio]);
        res.json({ ok: true });
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
   PROXY MERCADOLIBRE — evita bloqueo CORS/403 desde browser
   GET /api/ml-search?q=...&limit=...&condition=...
   ════════════════════════════════════════════════════════════ */
router.get('/ml-search', async (req, res) => {
    const { q, limit = '20', condition } = req.query;
    if (!q) return res.status(400).json({ error: 'Falta parámetro q' });

    let url = `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    if (condition) url += `&condition=${condition}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; VALTRAX-CRM/1.0)',
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        res.json(data);
    } catch (e) {
        clearTimeout(timeout);
        const msg = e.name === 'AbortError' ? 'Timeout al conectar con MercadoLibre' : e.message;
        res.status(502).json({ error: msg, fallback: true });
    }
});

module.exports = router;
