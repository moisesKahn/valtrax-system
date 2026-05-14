const mysql = require('mysql2/promise');

// Railway inyecta DATABASE_URL o las variables individuales
const pool = mysql.createPool(
    process.env.DATABASE_URL
        ? { uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 10 }
        : {
            host:     process.env.MYSQLHOST     || 'localhost',
            port:     process.env.MYSQLPORT     || 3306,
            user:     process.env.MYSQLUSER     || 'root',
            password: process.env.MYSQLPASSWORD || '',
            database: process.env.MYSQLDATABASE || 'valtrax',
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
                id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                folio       VARCHAR(30) UNIQUE NOT NULL,
                cot_folio   VARCHAR(30),
                cliente     VARCHAR(200),
                faena       VARCHAR(200),
                responsable VARCHAR(100),
                estado      VARCHAR(50) DEFAULT 'Pendiente',
                fecha       DATE,
                forma_pago  VARCHAR(100),
                total       DECIMAL(15,2) DEFAULT 0,
                abono       DECIMAL(15,2) DEFAULT 0,
                obs         TEXT,
                items       JSON,
                creado_en   DATE DEFAULT (CURRENT_DATE),
                actualizado DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS ordenes_compra (
                id           BIGINT PRIMARY KEY AUTO_INCREMENT,
                folio        VARCHAR(30) UNIQUE NOT NULL,
                pedido_folio VARCHAR(30),
                proveedor    VARCHAR(200),
                estado       VARCHAR(50) DEFAULT 'Borrador',
                fecha        DATE,
                total        DECIMAL(15,2) DEFAULT 0,
                obs          TEXT,
                items        JSON,
                creado_en    DATE DEFAULT (CURRENT_DATE),
                actualizado  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`);

        console.log('✅ Tablas MySQL listas');
    } finally {
        conn.release();
    }
}

module.exports = { pool, initDB };
