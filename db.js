const mysql = require('mysql2/promise');

// Railway puede inyectar MYSQL_DATABASE (con guión bajo) o MYSQLDATABASE (sin guión bajo)
const pool = mysql.createPool(
    process.env.DATABASE_URL || process.env.MYSQL_URL
        ? { uri: process.env.DATABASE_URL || process.env.MYSQL_URL, waitForConnections: true, connectionLimit: 10 }
        : {
            host:     process.env.MYSQLHOST     || 'localhost',
            port:     parseInt(process.env.MYSQLPORT || '3306'),
            user:     process.env.MYSQLUSER     || 'root',
            password: process.env.MYSQLPASSWORD || '',
            database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'railway',
            waitForConnections: true,
            connectionLimit: 10,
          }
);

// Crear tablas si no existen
async function initDB() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                nombre      VARCHAR(200) NOT NULL,
                rut         VARCHAR(20),
                giro        VARCHAR(200),
                direccion   VARCHAR(300),
                contacto    VARCHAR(100),
                email       VARCHAR(150),
                telefono    VARCHAR(30),
                creado_en   DATE DEFAULT (CURRENT_DATE),
                datos_extra JSON
            )`);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS cotizaciones (
                id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                folio       VARCHAR(30) UNIQUE NOT NULL,
                cliente     VARCHAR(200),
                faena       VARCHAR(200),
                responsable VARCHAR(100),
                fecha       DATE,
                vigencia    VARCHAR(50),
                estado      VARCHAR(50) DEFAULT 'Pendiente',
                forma_pago  VARCHAR(100),
                obs         TEXT,
                total       DECIMAL(15,2) DEFAULT 0,
                items       JSON,
                creado_en   DATE DEFAULT (CURRENT_DATE),
                actualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS pedidos (
                id           BIGINT PRIMARY KEY AUTO_INCREMENT,
                folio        VARCHAR(30) UNIQUE NOT NULL,
                cot_folio    VARCHAR(30),
                ppto_id      VARCHAR(40),
                cliente      VARCHAR(200),
                cliente_id   VARCHAR(40),
                faena        VARCHAR(200),
                responsable  VARCHAR(100),
                estado       VARCHAR(50) DEFAULT 'Pendiente',
                fecha        DATE,
                forma_pago   VARCHAR(100),
                total_venta  DECIMAL(15,2) DEFAULT 0,
                total_costo  DECIMAL(15,2) DEFAULT 0,
                total_margen DECIMAL(5,2)  DEFAULT 0,
                ganancia     DECIMAL(15,2) DEFAULT 0,
                abono        DECIMAL(15,2) DEFAULT 0,
                obs          TEXT,
                items        JSON,
                creado_en    DATE DEFAULT (CURRENT_DATE),
                actualizado  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS ordenes_compra (
                id           BIGINT PRIMARY KEY AUTO_INCREMENT,
                folio        VARCHAR(30) UNIQUE NOT NULL,
                pedido_folio VARCHAR(30),
                ppto_id      VARCHAR(40),
                proveedor    VARCHAR(200),
                estado       VARCHAR(50) DEFAULT 'Borrador',
                fecha        DATE,
                total_costo  DECIMAL(15,2) DEFAULT 0,
                obs          TEXT,
                items        JSON,
                creado_en    DATE DEFAULT (CURRENT_DATE),
                actualizado  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS presupuestos (
                id           VARCHAR(40) PRIMARY KEY,
                folio        VARCHAR(30),
                estado       VARCHAR(30) DEFAULT 'solicitud',
                bloqueado    TINYINT(1)  DEFAULT 0,
                cliente      VARCHAR(200),
                cliente_id   VARCHAR(40),
                pedido_folio VARCHAR(30),
                oc_folio     VARCHAR(30),
                cabecera     JSON,
                items        JSON,
                ppto         JSON,
                financiero   JSON,
                creado_en    DATE DEFAULT (CURRENT_DATE),
                actualizado  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        // ── Columnas opcionales (idempotentes) ────────────────────────
        const alters = [
            // presupuestos: columnas faltantes
            `ALTER TABLE presupuestos ADD COLUMN bloqueado    TINYINT(1) DEFAULT 0`,
            `ALTER TABLE presupuestos ADD COLUMN folio        VARCHAR(30)`,
            `ALTER TABLE presupuestos ADD COLUMN cliente_id   VARCHAR(40)`,
            `ALTER TABLE presupuestos ADD COLUMN pedido_folio VARCHAR(30)`,
            `ALTER TABLE presupuestos ADD COLUMN oc_folio     VARCHAR(30)`,
            `ALTER TABLE presupuestos ADD COLUMN financiero   JSON`,
            `ALTER TABLE presupuestos ADD COLUMN ppto         JSON`,
            `ALTER TABLE presupuestos ADD COLUMN items        JSON`,
            // pedidos: columnas faltantes
            `ALTER TABLE pedidos ADD COLUMN ppto_id       VARCHAR(40)`,
            `ALTER TABLE pedidos ADD COLUMN cliente_id    VARCHAR(40)`,
            `ALTER TABLE pedidos ADD COLUMN nro_factura   VARCHAR(60)`,
            `ALTER TABLE pedidos ADD COLUMN total_venta   DECIMAL(15,2) DEFAULT 0`,
            `ALTER TABLE pedidos ADD COLUMN total_costo   DECIMAL(15,2) DEFAULT 0`,
            `ALTER TABLE pedidos ADD COLUMN total_margen  DECIMAL(5,2)  DEFAULT 0`,
            `ALTER TABLE pedidos ADD COLUMN ganancia      DECIMAL(15,2) DEFAULT 0`,
            `ALTER TABLE pedidos ADD COLUMN datos_cliente JSON`,
            `ALTER TABLE pedidos ADD COLUMN dir_entrega   VARCHAR(400)`,
            // ordenes_compra: columnas faltantes
            `ALTER TABLE ordenes_compra ADD COLUMN ppto_id       VARCHAR(40)`,
            `ALTER TABLE ordenes_compra ADD COLUMN total_costo   DECIMAL(15,2) DEFAULT 0`,
            // ordenes_compra: trazabilidad completa
            `ALTER TABLE ordenes_compra ADD COLUMN cliente      VARCHAR(200)`,
            `ALTER TABLE ordenes_compra ADD COLUMN cliente_id   VARCHAR(40)`,
            `ALTER TABLE ordenes_compra ADD COLUMN dir_entrega  VARCHAR(400)`,
            `ALTER TABLE ordenes_compra ADD COLUMN datos_cliente JSON`,
            `ALTER TABLE ordenes_compra ADD COLUMN cot_folio    VARCHAR(30)`,
        ];
        for (const sql of alters) {
            try { await conn.query(sql); } catch(_) { /* columna ya existe */ }
        }

        await conn.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                nombre      VARCHAR(100) NOT NULL,
                usuario     VARCHAR(60) UNIQUE NOT NULL,
                clave       VARCHAR(200) NOT NULL,
                rol         VARCHAR(30) NOT NULL DEFAULT 'vendedor',
                activo      TINYINT(1) NOT NULL DEFAULT 1,
                creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP,
                actualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        // Usuario admin por defecto si la tabla está vacía
        try {
            const [ucount] = await conn.query('SELECT COUNT(*) as n FROM usuarios');
            if ((ucount[0].n || 0) === 0) {
                await conn.query(
                    `INSERT INTO usuarios (nombre,usuario,clave,rol) VALUES ('Administrador','valtrax.admin','Vx@2025!','administrador'),('Vendedor','vendedor','venta123','vendedor')`
                );
            }
        } catch(_){}

        console.log('✅ Tablas MySQL listas');
    } finally {
        conn.release();
    }
}

module.exports = { pool, initDB };
