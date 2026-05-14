-- ════════════════════════════════════════════════════════════════════════
--  VALTRAX — Sistema de Abastecimiento Urgente para Minería
--  Base de datos MySQL — Schema + Datos de ejemplo
--  Encoding: utf8mb4 (soporte completo para español y emojis)
-- ════════════════════════════════════════════════════════════════════════

DROP DATABASE IF EXISTS valtrax_db;
CREATE DATABASE valtrax_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE valtrax_db;

-- ════════════════════════════════════════════════════════════════════════
--  MAESTROS GEOGRÁFICOS
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE zonas_operacionales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(20)  NOT NULL UNIQUE,
  nombre          VARCHAR(80)  NOT NULL,
  descripcion     VARCHAR(255),
  color_hex       VARCHAR(7)   DEFAULT '#2563eb',
  activa          BOOLEAN      DEFAULT TRUE,
  creado_en       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE regiones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  zona_id         INT          NOT NULL,
  codigo_iso      VARCHAR(10)  NOT NULL UNIQUE,
  nombre          VARCHAR(100) NOT NULL,
  capital         VARCHAR(80),
  FOREIGN KEY (zona_id) REFERENCES zonas_operacionales(id)
) ENGINE=InnoDB;

CREATE TABLE ciudades (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  region_id       INT          NOT NULL,
  nombre          VARCHAR(100) NOT NULL,
  latitud         DECIMAL(10,7),
  longitud        DECIMAL(10,7),
  FOREIGN KEY (region_id) REFERENCES regiones(id)
) ENGINE=InnoDB;

CREATE TABLE faenas_mineras (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id      INT,
  nombre          VARCHAR(150) NOT NULL,
  empresa         VARCHAR(150),
  region_id       INT,
  ciudad_id       INT,
  tipo_mineral    VARCHAR(80),        -- cobre, oro, litio, hierro, etc.
  direccion       VARCHAR(255),
  latitud         DECIMAL(10,7),
  longitud        DECIMAL(10,7),
  contacto_nombre VARCHAR(120),
  contacto_telefono VARCHAR(40),
  activa          BOOLEAN      DEFAULT TRUE,
  FOREIGN KEY (region_id) REFERENCES regiones(id),
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  USUARIOS Y ROLES
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE roles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  codigo     VARCHAR(30) NOT NULL UNIQUE,
  nombre     VARCHAR(80) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  rol_id      INT NOT NULL,
  rut         VARCHAR(15) UNIQUE,
  nombre      VARCHAR(120) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  telefono    VARCHAR(40),
  password_hash VARCHAR(255),
  avatar_url  VARCHAR(255),
  activo      BOOLEAN DEFAULT TRUE,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  CLIENTES Y PROVEEDORES (ÁREA COMERCIAL)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE clientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  rut             VARCHAR(15)  UNIQUE NOT NULL,
  razon_social    VARCHAR(180) NOT NULL,
  nombre_fantasia VARCHAR(120),
  giro            VARCHAR(150),
  email           VARCHAR(150),
  telefono        VARCHAR(40),
  region_id       INT,
  ciudad_id       INT,
  direccion       VARCHAR(255),
  contacto_nombre VARCHAR(120),
  contacto_cargo  VARCHAR(80),
  contacto_telefono VARCHAR(40),
  contacto_email  VARCHAR(150),
  activo          BOOLEAN DEFAULT TRUE,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regiones(id),
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  rut             VARCHAR(15)  UNIQUE,
  razon_social    VARCHAR(180) NOT NULL,
  rubro           VARCHAR(120),
  email           VARCHAR(150),
  telefono        VARCHAR(40),
  region_id       INT,
  ciudad_id       INT,
  direccion       VARCHAR(255),
  contacto_nombre VARCHAR(120),
  rating          DECIMAL(2,1) DEFAULT 5.0,
  tiempo_respuesta_horas INT DEFAULT 24,
  activo          BOOLEAN DEFAULT TRUE,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (region_id) REFERENCES regiones(id),
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  COTIZACIONES (ÁREA COMERCIAL)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE cotizaciones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  folio           VARCHAR(20) UNIQUE NOT NULL,
  cliente_id      INT NOT NULL,
  faena_id        INT,
  usuario_id      INT,            -- vendedor responsable
  fecha_emision   DATE NOT NULL,
  fecha_validez   DATE,
  estado          ENUM('borrador','enviada','aceptada','rechazada','vencida') DEFAULT 'borrador',
  subtotal        DECIMAL(14,2) DEFAULT 0,
  iva             DECIMAL(14,2) DEFAULT 0,
  total           DECIMAL(14,2) DEFAULT 0,
  observaciones   TEXT,
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (faena_id)   REFERENCES faenas_mineras(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE cotizacion_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id   INT NOT NULL,
  descripcion     VARCHAR(255) NOT NULL,
  cantidad        DECIMAL(12,2) NOT NULL,
  unidad          VARCHAR(20) DEFAULT 'UN',
  precio_unitario DECIMAL(14,2) NOT NULL,
  total_linea     DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  PEDIDOS (ÁREA OPERACIONAL — núcleo del sistema)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE pedidos (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  folio                 VARCHAR(20) UNIQUE NOT NULL,
  cotizacion_id         INT,
  cliente_id            INT NOT NULL,
  faena_id              INT,
  region_id             INT,
  ciudad_id             INT,
  zona_id               INT,
  direccion_entrega     VARCHAR(255),
  latitud               DECIMAL(10,7),
  longitud              DECIMAL(10,7),

  fecha_creacion        DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_comprometida    DATE,
  fecha_estimada_entrega DATE,
  fecha_entrega_real    DATETIME NULL,

  prioridad             ENUM('baja','media','alta','critica') DEFAULT 'media',
  estado                ENUM(
                          'pendiente_autorizacion',
                          'en_compra',
                          'en_preparacion',
                          'despachado',
                          'en_ruta',
                          'entregado',
                          'cerrado',
                          'cancelado'
                        ) DEFAULT 'pendiente_autorizacion',
  es_urgente            BOOLEAN DEFAULT FALSE,

  responsable_id        INT,
  vendedor_id           INT,

  subtotal              DECIMAL(14,2) DEFAULT 0,
  iva                   DECIMAL(14,2) DEFAULT 0,
  total                 DECIMAL(14,2) DEFAULT 0,

  transporte_tipo       VARCHAR(60),     -- propio, tercero, courier
  transporte_empresa    VARCHAR(120),
  transporte_patente    VARCHAR(20),
  transporte_guia       VARCHAR(40),

  observaciones_logistica TEXT,

  FOREIGN KEY (cotizacion_id)  REFERENCES cotizaciones(id),
  FOREIGN KEY (cliente_id)     REFERENCES clientes(id),
  FOREIGN KEY (faena_id)       REFERENCES faenas_mineras(id),
  FOREIGN KEY (region_id)      REFERENCES regiones(id),
  FOREIGN KEY (ciudad_id)      REFERENCES ciudades(id),
  FOREIGN KEY (zona_id)        REFERENCES zonas_operacionales(id),
  FOREIGN KEY (responsable_id) REFERENCES usuarios(id),
  FOREIGN KEY (vendedor_id)    REFERENCES usuarios(id),
  INDEX idx_estado    (estado),
  INDEX idx_prioridad (prioridad),
  INDEX idx_zona      (zona_id),
  INDEX idx_fecha_comp(fecha_comprometida)
) ENGINE=InnoDB;

CREATE TABLE pedido_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT NOT NULL,
  proveedor_id    INT,
  descripcion     VARCHAR(255) NOT NULL,
  cantidad        DECIMAL(12,2) NOT NULL,
  unidad          VARCHAR(20)  DEFAULT 'UN',
  precio_unitario DECIMAL(14,2) NOT NULL,
  total_linea     DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (pedido_id)    REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
) ENGINE=InnoDB;

CREATE TABLE pedido_historial (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id    INT NOT NULL,
  usuario_id   INT,
  estado_anterior VARCHAR(40),
  estado_nuevo VARCHAR(40),
  comentario   TEXT,
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id)  REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  ÓRDENES DE COMPRA INTERNAS
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE ordenes_compra (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  folio           VARCHAR(20) UNIQUE NOT NULL,
  pedido_id       INT,
  proveedor_id    INT NOT NULL,
  fecha_emision   DATE NOT NULL,
  fecha_recepcion DATE,
  estado          ENUM('emitida','confirmada','recibida_parcial','recibida','anulada') DEFAULT 'emitida',
  total           DECIMAL(14,2) DEFAULT 0,
  observaciones   TEXT,
  FOREIGN KEY (pedido_id)    REFERENCES pedidos(id),
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  ENTREGAS / DESPACHOS (LOGÍSTICA)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE entregas (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id         INT NOT NULL,
  guia_despacho     VARCHAR(40),
  fecha_despacho    DATETIME,
  fecha_entrega     DATETIME,
  conductor_nombre  VARCHAR(120),
  conductor_telefono VARCHAR(40),
  vehiculo_patente  VARCHAR(20),
  vehiculo_tipo     VARCHAR(60),       -- camión, camioneta, courier
  empresa_transporte VARCHAR(120),
  estado            ENUM('programada','en_ruta','entregada','no_entregada','reprogramada') DEFAULT 'programada',
  observaciones     TEXT,
  receptor_nombre   VARCHAR(120),
  receptor_rut      VARCHAR(15),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  TRANSPORTE PROPIO (preparado para futuro módulo)
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE vehiculos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  patente         VARCHAR(20) UNIQUE NOT NULL,
  tipo            VARCHAR(60),
  marca           VARCHAR(60),
  modelo          VARCHAR(60),
  anio            INT,
  capacidad_kg    INT,
  estado          ENUM('disponible','en_ruta','mantenimiento','inactivo') DEFAULT 'disponible',
  proxima_revision DATE
) ENGINE=InnoDB;

CREATE TABLE conductores (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  rut             VARCHAR(15) UNIQUE,
  nombre          VARCHAR(120) NOT NULL,
  telefono        VARCHAR(40),
  licencia_clase  VARCHAR(10),
  licencia_vence  DATE,
  estado          ENUM('disponible','en_ruta','descanso','inactivo') DEFAULT 'disponible'
) ENGINE=InnoDB;

CREATE TABLE hojas_ruta (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  folio           VARCHAR(20) UNIQUE NOT NULL,
  vehiculo_id     INT,
  conductor_id    INT,
  fecha_salida    DATETIME,
  fecha_retorno   DATETIME,
  km_inicial      INT,
  km_final        INT,
  estado          ENUM('planificada','en_curso','finalizada','cancelada') DEFAULT 'planificada',
  FOREIGN KEY (vehiculo_id)  REFERENCES vehiculos(id),
  FOREIGN KEY (conductor_id) REFERENCES conductores(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════
--  ALERTAS Y NOTIFICACIONES
-- ════════════════════════════════════════════════════════════════════════

CREATE TABLE alertas (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  tipo         ENUM('retraso','urgencia','stock','sistema') NOT NULL,
  severidad    ENUM('info','warning','danger','critical') DEFAULT 'info',
  pedido_id    INT,
  mensaje      VARCHAR(255) NOT NULL,
  vista        BOOLEAN DEFAULT FALSE,
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
) ENGINE=InnoDB;

-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
--  DATOS DE EJEMPLO (SEED)
-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

-- ── Zonas operacionales ──────────────────────────────────────────────────
INSERT INTO zonas_operacionales (codigo, nombre, descripcion, color_hex) VALUES
('NG',  'Norte Grande',         'Regiones de Arica, Tarapacá, Antofagasta',        '#dc2626'),
('NC',  'Norte Chico',          'Regiones de Atacama y Coquimbo',                  '#f59e0b'),
('RM',  'Región Metropolitana', 'Operaciones centrales y administrativas',         '#2563eb'),
('CS',  'Centro Sur',           'Regiones de Valparaíso a Biobío',                 '#10b981');

-- ── Regiones ─────────────────────────────────────────────────────────────
INSERT INTO regiones (zona_id, codigo_iso, nombre, capital) VALUES
(1, 'CL-AP', 'Arica y Parinacota',        'Arica'),
(1, 'CL-TA', 'Tarapacá',                  'Iquique'),
(1, 'CL-AN', 'Antofagasta',               'Antofagasta'),
(2, 'CL-AT', 'Atacama',                   'Copiapó'),
(2, 'CL-CO', 'Coquimbo',                  'La Serena'),
(3, 'CL-RM', 'Metropolitana de Santiago', 'Santiago'),
(4, 'CL-VS', 'Valparaíso',                'Valparaíso'),
(4, 'CL-BI', 'Biobío',                    'Concepción');

-- ── Ciudades clave para minería ──────────────────────────────────────────
INSERT INTO ciudades (region_id, nombre, latitud, longitud) VALUES
(1, 'Arica',         -18.4783, -70.3126),
(2, 'Iquique',       -20.2208, -70.1431),
(2, 'Pozo Almonte',  -20.2581, -69.7858),
(3, 'Antofagasta',   -23.6509, -70.3975),
(3, 'Calama',        -22.4667, -68.9333),
(3, 'Tocopilla',     -22.0928, -70.1979),
(3, 'Mejillones',    -23.0978, -70.4516),
(4, 'Copiapó',       -27.3667, -70.3333),
(4, 'Diego de Almagro', -26.3667, -70.0500),
(4, 'Caldera',       -27.0667, -70.8167),
(5, 'La Serena',     -29.9027, -71.2519),
(5, 'Coquimbo',      -29.9533, -71.3436),
(5, 'Ovalle',        -30.6017, -71.2003),
(6, 'Santiago',      -33.4489, -70.6693);

-- ── Roles y usuarios ─────────────────────────────────────────────────────
INSERT INTO roles (codigo, nombre) VALUES
('ADMIN',      'Administrador'),
('GERENTE',    'Gerente de Operaciones'),
('COMERCIAL',  'Ejecutivo Comercial'),
('LOGISTICA',  'Encargado de Logística'),
('COMPRAS',    'Encargado de Compras');

INSERT INTO usuarios (rol_id, rut, nombre, email, telefono) VALUES
(1, '15.234.567-8', 'Carolina Núñez',  'carolina.nunez@valtrax.cl',  '+56 9 8234 5671'),
(2, '12.456.789-0', 'Rodrigo Soto',    'rodrigo.soto@valtrax.cl',    '+56 9 7456 7890'),
(3, '14.567.890-1', 'Javiera Mella',   'javiera.mella@valtrax.cl',   '+56 9 6567 8901'),
(3, '13.678.901-2', 'Felipe Aravena',  'felipe.aravena@valtrax.cl', '+56 9 5678 9012'),
(4, '16.789.012-3', 'Patricio Reyes',  'patricio.reyes@valtrax.cl',  '+56 9 4789 0123'),
(5, '17.890.123-4', 'Macarena Vidal',  'macarena.vidal@valtrax.cl',  '+56 9 3890 1234');

-- ── Clientes (empresas mineras reales del norte) ─────────────────────────
INSERT INTO clientes (rut, razon_social, nombre_fantasia, giro, email, telefono, region_id, ciudad_id, direccion, contacto_nombre, contacto_cargo, contacto_telefono) VALUES
('92.580.000-7', 'Minera Escondida Ltda.',           'BHP Escondida',     'Extracción de cobre',  'compras@escondida.cl',    '+56 55 224 0000', 3, 4, 'Av. de la Minería 501, Antofagasta', 'Daniela Pérez',  'Jefa de Adquisiciones', '+56 9 8123 4567'),
('96.591.040-9', 'Corporación Nacional del Cobre',   'CODELCO Chuqui',    'Minería estatal',      'compras.norte@codelco.cl','+56 55 232 2000', 3, 5, 'Av. Granaderos 4025, Calama',        'Andrés Carvajal','Comprador Senior',      '+56 9 7234 5678'),
('76.024.999-K', 'Collahuasi SCM',                   'Collahuasi',        'Cobre y molibdeno',    'abastecimiento@collahuasi.cl','+56 57 232 5000', 2, 2, 'Av. Baquedano 902, Iquique',     'Marcela Tapia',  'Coordinadora Compras',  '+56 9 6345 6789'),
('87.500.300-1', 'Compañía Minera Doña Inés de Collahuasi','CMDIC',     'Cobre',                'compras@cmdic.cl',        '+56 57 232 5100', 2, 2, 'Ruta A-65 Km 13, Iquique',         'Pablo Salinas',  'Supervisor',            '+56 9 5456 7890'),
('95.456.000-2', 'Minera Candelaria S.A.',           'Candelaria',        'Cobre',                'compras@candelaria.cl',   '+56 52 220 9000', 4, 8, 'Sector Cerrillos, Copiapó',        'Soledad Rojas',  'Compradora',            '+56 9 4567 8901'),
('96.819.250-6', 'Pampa Calichera S.A.',             'SQM Salar',         'Litio y potasio',      'compras@sqm.com',         '+56 55 269 0000', 3, 5, 'Salar de Atacama s/n',             'Cristián Ibáñez','Adquisiciones',         '+56 9 3678 9012'),
('88.244.300-9', 'Minera Los Pelambres',             'Los Pelambres',     'Cobre y molibdeno',    'compras@pelambres.cl',    '+56 53 268 3000', 5, 13,'Camino Salamanca Km 67, Ovalle',   'Verónica Castro','Jefa Compras',          '+56 9 2789 0123'),
('77.985.330-K', 'Minera Centinela',                 'Centinela',         'Cobre',                'compras@centinela.cl',    '+56 55 263 1000', 3, 4, 'Sierra Gorda s/n, Antofagasta',    'Mauricio Lara',  'Comprador',             '+56 9 1890 1234'),
('99.520.000-7', 'Minera Spence S.A.',               'Spence BHP',        'Cobre',                'compras@spence.cl',       '+56 55 263 4500', 3, 4, 'Sierra Gorda, Antofagasta',        'Carla Mendoza',  'Compradora Senior',     '+56 9 8901 2345'),
('76.453.890-3', 'Minera Tres Valles',               'Tres Valles',       'Cobre',                'compras@tresvalles.cl',   '+56 53 278 1000', 5, 13,'Salamanca s/n, Coquimbo',          'Esteban Vargas', 'Jefe Adquisiciones',    '+56 9 7012 3456');

-- ── Faenas mineras ───────────────────────────────────────────────────────
INSERT INTO faenas_mineras (cliente_id, nombre, empresa, region_id, ciudad_id, tipo_mineral, direccion, latitud, longitud, contacto_nombre, contacto_telefono) VALUES
(1, 'Faena Escondida',          'BHP',         3, 5, 'Cobre',          'Ruta B-55 Km 170, Antofagasta', -24.2625, -69.0709, 'Juan Pizarro',   '+56 9 8111 2222'),
(2, 'Mina Chuquicamata',        'CODELCO',     3, 5, 'Cobre',          'Calama',                        -22.2900, -68.9000, 'María Toro',     '+56 9 7222 3333'),
(2, 'Mina Radomiro Tomic',      'CODELCO',     3, 5, 'Cobre',          'Calama',                        -22.4933, -68.8983, 'Luis Cárdenas',  '+56 9 6333 4444'),
(3, 'Faena Collahuasi',         'Collahuasi',  2, 3, 'Cobre/Molibdeno','Pozo Almonte',                  -20.9700, -68.6900, 'Ana Bravo',      '+56 9 5444 5555'),
(5, 'Faena Candelaria',         'Lundin',      4, 8, 'Cobre',          'Sector Tierra Amarilla',        -27.5083, -70.3169, 'Diego Pino',     '+56 9 4555 6666'),
(6, 'Salar de Atacama (SQM)',   'SQM',         3, 5, 'Litio',          'Salar de Atacama',              -23.4858, -68.2275, 'Paola Riquelme', '+56 9 3666 7777'),
(7, 'Faena Pelambres',          'Antofagasta', 5,13, 'Cobre',          'Salamanca',                     -31.7333, -70.4833, 'Roberto Silva',  '+56 9 2777 8888'),
(8, 'Faena Centinela',          'Antofagasta', 3, 4, 'Cobre',          'Sierra Gorda',                  -22.9667, -69.3667, 'Camila Acevedo', '+56 9 1888 9999'),
(9, 'Faena Spence',             'BHP',         3, 4, 'Cobre',          'Sierra Gorda',                  -22.7350, -69.3000, 'Sebastián Rojas','+56 9 9999 0000');

-- ── Proveedores ──────────────────────────────────────────────────────────
INSERT INTO proveedores (rut, razon_social, rubro, email, telefono, region_id, ciudad_id, direccion, contacto_nombre, rating, tiempo_respuesta_horas) VALUES
('76.123.456-7', 'Ferretería Industrial del Norte SpA','Ferretería industrial', 'ventas@ferrenorte.cl','+56 55 234 1000', 3, 4, 'Av. Pedro Aguirre Cerda 1500, Antofagasta','Felipe Manríquez', 4.8, 6),
('77.234.567-8', 'Lubricantes y Filtros SA',           'Lubricantes/filtros',   'ventas@lubrifiltros.cl','+56 9 8234 5678',6,14, 'Av. Las Industrias 220, Santiago',         'Carla Bustamante', 4.6, 12),
('78.345.678-9', 'Repuestos Mineros Atacama Ltda.',    'Repuestos pesados',     'ventas@repmineros.cl','+56 52 223 4567', 4, 8, 'Av. Copayapu 2100, Copiapó',               'Mauricio Espinoza',4.9, 4),
('79.456.789-0', 'Seguridad Industrial Pro',           'EPP / Seguridad',       'ventas@segpro.cl',    '+56 2 2345 6789', 6,14, 'Av. Vicuña Mackenna 1234, Santiago',       'Daniela Soto',     4.5, 24),
('80.567.890-1', 'Hidráulica y Neumática del Sur',     'Hidráulica',            'ventas@hidrasur.cl',  '+56 41 234 5678', 8,14, 'Av. Prat 890, Concepción',                 'Hernán Vega',      4.7, 18),
('81.678.901-2', 'Soldaduras Tecnológicas Ltda.',      'Soldaduras',            'ventas@soldatec.cl',  '+56 9 7456 7890', 3, 4, 'Av. República de Croacia 855, Antofagasta','Patricia Reinoso', 4.4, 8),
('82.789.012-3', 'Eléctricos Norte SpA',               'Eléctrico industrial',  'ventas@electronorte.cl','+56 55 245 6789',3, 5, 'Av. Granaderos 980, Calama',               'Jorge Núñez',      4.8, 6),
('83.890.123-4', 'Insumos Químicos Industriales',      'Químicos',              'ventas@insuquim.cl',  '+56 2 2456 7890', 6,14, 'Camino Lo Echevers 5050, Santiago',         'Mónica Henríquez', 4.3, 36);

-- ── Cotizaciones ─────────────────────────────────────────────────────────
INSERT INTO cotizaciones (folio, cliente_id, faena_id, usuario_id, fecha_emision, fecha_validez, estado, subtotal, iva, total, observaciones) VALUES
('COT-2026-0231', 1, 1, 3, '2026-05-08', '2026-05-22', 'aceptada',  18500000, 3515000, 22015000, 'Despacho urgente faena Escondida'),
('COT-2026-0232', 2, 2, 4, '2026-05-09', '2026-05-23', 'enviada',    7250000, 1377500,  8627500, 'Mina Chuquicamata - mantención programada'),
('COT-2026-0233', 3, 4, 3, '2026-05-10', '2026-05-24', 'aceptada',  12800000, 2432000, 15232000, 'Collahuasi - crítico'),
('COT-2026-0234', 5, 5, 4, '2026-05-10', '2026-05-25', 'borrador',   4500000,  855000,  5355000, NULL),
('COT-2026-0235', 6, 6, 3, '2026-05-11', '2026-05-26', 'aceptada',  29800000, 5662000, 35462000, 'Salar de Atacama - alta prioridad'),
('COT-2026-0236', 7, 7, 4, '2026-05-12', '2026-05-26', 'enviada',    8700000, 1653000, 10353000, 'Los Pelambres - rutina'),
('COT-2026-0237', 8, 8, 3, '2026-05-12', '2026-05-27', 'rechazada',  3200000,  608000,  3808000, 'Cliente solicitó otra alternativa'),
('COT-2026-0238', 9, 9, 4, '2026-05-13', '2026-05-27', 'aceptada',  21400000, 4066000, 25466000, 'Spence - urgencia turno');

-- ── Pedidos (núcleo operacional) ─────────────────────────────────────────
INSERT INTO pedidos (folio, cotizacion_id, cliente_id, faena_id, region_id, ciudad_id, zona_id, direccion_entrega, latitud, longitud, fecha_comprometida, fecha_estimada_entrega, prioridad, estado, es_urgente, responsable_id, vendedor_id, subtotal, iva, total, transporte_tipo, transporte_empresa, transporte_patente, observaciones_logistica) VALUES
('PED-2026-1450', 1, 1, 1, 3, 5, 1, 'Ruta B-55 Km 170, Faena Escondida',     -24.2625, -69.0709, '2026-05-15', '2026-05-15', 'critica', 'en_ruta',            TRUE,  5, 3, 18500000, 3515000, 22015000, 'tercero','Transportes del Norte SA',  'JHTR-58','Llegada estimada 18:00 hrs. Acceso por portería sur'),
('PED-2026-1451', 3, 3, 4, 2, 3, 1, 'Faena Collahuasi - Pozo Almonte',        -20.9700, -68.6900, '2026-05-14', '2026-05-14', 'critica', 'despachado',         TRUE,  5, 3, 12800000, 2432000, 15232000, 'tercero','Logística Norte Express',   'LMRT-23','Material crítico - tornillería especial'),
('PED-2026-1452', 5, 6, 6, 3, 5, 1, 'Salar de Atacama - SQM',                 -23.4858, -68.2275, '2026-05-16', '2026-05-17', 'alta',    'en_preparacion',     FALSE, 5, 3, 29800000, 5662000, 35462000, 'tercero','Camiones del Pacífico',     'KLPM-91','Coordinar ingreso con turno noche'),
('PED-2026-1453', 8, 9, 9, 3, 4, 1, 'Sierra Gorda - Spence',                  -22.7350, -69.3000, '2026-05-15', '2026-05-15', 'critica', 'en_compra',          TRUE,  6, 4, 21400000, 4066000, 25466000, 'tercero',NULL,                         NULL,    'Esperando confirmación proveedor lubricantes'),
('PED-2026-1454', 2, 2, 2, 3, 5, 1, 'Mina Chuquicamata - Calama',             -22.2900, -68.9000, '2026-05-18', '2026-05-19', 'media',   'pendiente_autorizacion', FALSE, 5, 4, 7250000,  1377500,  8627500, 'tercero',NULL,                         NULL,    NULL),
('PED-2026-1455', 6, 7, 7, 5,13, 2, 'Salamanca - Pelambres',                  -31.7333, -70.4833, '2026-05-20', '2026-05-20', 'media',   'en_preparacion',     FALSE, 5, 4, 8700000,  1653000, 10353000, 'tercero','Transportes Centro Sur',    'GHTY-44','Ruta cordillerana'),
('PED-2026-1456', NULL, 4, NULL, 2, 2, 1, 'Av. Baquedano 902, Iquique',       -20.2208, -70.1431, '2026-05-14', '2026-05-14', 'alta',    'entregado',          FALSE, 5, 3, 6800000,  1292000,  8092000, 'tercero','Express Norte',             'BTYU-77','Entregado conforme 11:35 hrs'),
('PED-2026-1457', NULL, 1, 1, 3, 4, 1, 'Faena Escondida - Bodega 4',          -24.2625, -69.0709, '2026-05-13', '2026-05-13', 'alta',    'entregado',          TRUE,  5, 3, 4350000,   826500,  5176500, 'tercero','Transportes del Norte SA',  'JHTR-58','Entrega conforme'),
('PED-2026-1458', NULL, 5, 5, 4, 8, 2, 'Tierra Amarilla - Candelaria',        -27.5083, -70.3169, '2026-05-17', '2026-05-17', 'media',   'en_compra',          FALSE, 6, 4, 5100000,   969000,  6069000, 'tercero',NULL,                         NULL,    NULL),
('PED-2026-1459', NULL, 8, 8, 3, 4, 1, 'Sierra Gorda - Centinela',            -22.9667, -69.3667, '2026-05-15', '2026-05-15', 'critica', 'en_ruta',            TRUE,  5, 3, 9200000,  1748000, 10948000, 'propio',  'VALTRAX',                  'VLTX-01','Camión propio - conductor: P. Reyes'),
('PED-2026-1460', NULL, 1, 1, 3, 5, 1, 'Faena Escondida - Almacén Central',   -24.2625, -69.0709, '2026-05-16', '2026-05-16', 'alta',    'en_preparacion',     FALSE, 5, 3, 11400000, 2166000, 13566000, 'tercero',NULL,                         NULL,    NULL),
('PED-2026-1461', NULL, 3, 4, 2, 3, 1, 'Faena Collahuasi',                    -20.9700, -68.6900, '2026-05-19', '2026-05-19', 'media',   'pendiente_autorizacion', FALSE, 5, 4, 3200000,   608000,  3808000, 'courier','Starken',                    NULL,    'Cliente solicita confirmación'),
('PED-2026-1462', NULL, 2, 3, 3, 5, 1, 'Mina Radomiro Tomic',                 -22.4933, -68.8983, '2026-05-21', '2026-05-21', 'baja',    'pendiente_autorizacion', FALSE, 5, 4, 2400000,   456000,  2856000, 'courier',NULL,                         NULL,    NULL),
('PED-2026-1463', NULL, 10,NULL,5,13, 2, 'Salamanca - Tres Valles',           -31.7833, -70.9500, '2026-05-18', '2026-05-18', 'alta',    'despachado',         FALSE, 5, 3, 7800000,  1482000,  9282000, 'tercero','Transportes Centro Sur',    'GHTY-44','En tránsito');

-- ── Items de pedidos (ejemplos para algunos) ─────────────────────────────
INSERT INTO pedido_items (pedido_id, proveedor_id, descripcion, cantidad, unidad, precio_unitario, total_linea) VALUES
(1, 1, 'Filtros hidráulicos CAT 793', 24,  'UN', 185000,  4440000),
(1, 2, 'Aceite hidráulico 208L',       8,  'TM', 425000,  3400000),
(1, 6, 'Rodamientos SKF industrial',  12,  'UN', 320000,  3840000),
(1, 7, 'Cables eléctricos calibre 4', 500, 'MT',  14400,  7200000),
(2, 1, 'Tornillería grado 8',        2500, 'UN',   1450,  3625000),
(2, 3, 'Repuestos transmisión CAT',     6, 'UN', 1240000, 7440000),
(2, 5, 'Mangueras hidráulicas',        15, 'UN',  118000, 1770000),
(3, 8, 'Insumos químicos extracción Li', 4,'TM',6450000, 25800000),
(3, 4, 'EPP completo turno faena',     80, 'UN',   50000,  4000000),
(4, 2, 'Lubricantes especializados',   10, 'TM',  890000,  8900000),
(4, 1, 'Filtros aire CAT 797',         18, 'UN',  680000, 12240000);

-- ── Historial de cambios de pedidos ──────────────────────────────────────
INSERT INTO pedido_historial (pedido_id, usuario_id, estado_anterior, estado_nuevo, comentario) VALUES
(1, 5, 'en_preparacion','despachado',  'Carga lista - despachado 14:30'),
(1, 5, 'despachado',    'en_ruta',     'Transportista confirmó salida'),
(2, 5, 'en_compra',     'en_preparacion','Material recibido en bodega'),
(2, 5, 'en_preparacion','despachado',  'Despachado por Logística Norte'),
(7, 5, 'en_ruta',       'entregado',   'Entrega conforme - guía 90234'),
(8, 5, 'en_ruta',       'entregado',   'Entrega conforme - guía 90187'),
(9, 6, 'pendiente_autorizacion','en_compra','Autorizado por gerencia'),
(10,5, 'despachado',    'en_ruta',     'Camión VALTRAX en ruta');

-- ── Vehículos propios ────────────────────────────────────────────────────
INSERT INTO vehiculos (patente, tipo, marca, modelo, anio, capacidad_kg, estado, proxima_revision) VALUES
('VLTX-01', 'Camión 3/4',   'Mercedes-Benz', 'Atego 1726', 2024, 7000,  'en_ruta',       '2026-09-15'),
('VLTX-02', 'Camioneta',    'Toyota',        'Hilux 4x4',  2025, 1000,  'disponible',    '2026-08-22'),
('VLTX-03', 'Camión Pluma', 'Volvo',         'FH 460',     2023, 12000, 'mantenimiento', '2026-05-30'),
('VLTX-04', 'Camioneta',    'Ford',          'Ranger',     2024, 1100,  'disponible',    '2026-10-10');

-- ── Conductores ──────────────────────────────────────────────────────────
INSERT INTO conductores (rut, nombre, telefono, licencia_clase, licencia_vence, estado) VALUES
('14.234.567-1', 'Patricio Reyes Olivares',  '+56 9 4789 0123', 'A-5', '2027-03-12', 'en_ruta'),
('15.345.678-2', 'Hugo Carrasco Muñoz',      '+56 9 5890 1234', 'A-5', '2026-11-04', 'disponible'),
('16.456.789-3', 'Luis Vergara Ramírez',     '+56 9 6901 2345', 'A-4', '2027-07-19', 'disponible'),
('13.567.890-4', 'Mario Salinas Acevedo',    '+56 9 7012 3456', 'A-5', '2026-08-30', 'descanso');

-- ── Alertas activas ──────────────────────────────────────────────────────
INSERT INTO alertas (tipo, severidad, pedido_id, mensaje) VALUES
('urgencia', 'critical', 1,  'Pedido PED-2026-1450 en ruta — entrega comprometida HOY'),
('urgencia', 'critical', 4,  'PED-2026-1453 esperando proveedor — cliente urgente'),
('retraso',  'warning',  5,  'PED-2026-1454 sin autorización hace 48 hrs'),
('urgencia', 'danger',   10, 'PED-2026-1459 (Centinela) — en ruta con camión propio'),
('sistema',  'info',     NULL,'4 cotizaciones pendientes de envío esta semana'),
('stock',    'warning',  NULL,'Stock crítico: Filtros hidráulicos CAT 793');

-- ── Órdenes de compra ────────────────────────────────────────────────────
INSERT INTO ordenes_compra (folio, pedido_id, proveedor_id, fecha_emision, fecha_recepcion, estado, total, observaciones) VALUES
('OC-2026-0801', 1, 1, '2026-05-09', '2026-05-11', 'recibida',         4440000, 'Recibido conforme'),
('OC-2026-0802', 1, 2, '2026-05-09', '2026-05-11', 'recibida',         3400000, NULL),
('OC-2026-0803', 3, 8, '2026-05-11', NULL,         'confirmada',      25800000, 'Producción especial - 5 días hábiles'),
('OC-2026-0804', 4, 2, '2026-05-12', NULL,         'emitida',          8900000, 'Urgente'),
('OC-2026-0805', 6, 5, '2026-05-12', '2026-05-13', 'recibida_parcial', 1770000, 'Recibido 12 de 15 unidades');

-- ── Entregas ─────────────────────────────────────────────────────────────
INSERT INTO entregas (pedido_id, guia_despacho, fecha_despacho, fecha_entrega, conductor_nombre, conductor_telefono, vehiculo_patente, vehiculo_tipo, empresa_transporte, estado, observaciones, receptor_nombre, receptor_rut) VALUES
(1,  '90245', '2026-05-13 14:30:00', NULL,                  'Hugo Carrasco',     '+56 9 5890 1234', 'JHTR-58', 'Camión', 'Transportes del Norte SA', 'en_ruta',     'ETA 18:00 hrs',            NULL,             NULL),
(2,  '90246', '2026-05-13 16:00:00', NULL,                  'Luis Vergara',      '+56 9 6901 2345', 'LMRT-23', 'Camión', 'Logística Norte Express',  'en_ruta',     'Vía Ruta 5 Norte',         NULL,             NULL),
(7,  '90234', '2026-05-13 09:15:00', '2026-05-13 11:35:00', 'Mario Salinas',     '+56 9 7012 3456', 'BTYU-77', 'Camioneta','Express Norte',         'entregada',   'Entrega conforme',         'Pedro Garrido',  '15.234.567-8'),
(8,  '90187', '2026-05-13 07:00:00', '2026-05-13 16:45:00', 'Felipe Bustos',     '+56 9 8123 4567', 'JHTR-58', 'Camión', 'Transportes del Norte SA', 'entregada',   'Entregado en bodega 4',    'Ana Carolina V.','17.890.123-4'),
(10, '90251', '2026-05-13 12:00:00', NULL,                  'Patricio Reyes',    '+56 9 4789 0123', 'VLTX-01', 'Camión', 'VALTRAX',                  'en_ruta',     'Camión propio',            NULL,             NULL),
(14, '90262', '2026-05-13 15:30:00', NULL,                  'Hugo Carrasco',     '+56 9 5890 1234', 'GHTY-44', 'Camión', 'Transportes Centro Sur',   'en_ruta',     'Ruta cordillerana',        NULL,             NULL);

-- ════════════════════════════════════════════════════════════════════════
--  VISTAS ÚTILES PARA DASHBOARD
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW v_pedidos_dashboard AS
SELECT
  p.id, p.folio, p.estado, p.prioridad, p.es_urgente,
  p.fecha_comprometida, p.fecha_estimada_entrega, p.total,
  c.razon_social  AS cliente,
  f.nombre        AS faena,
  r.nombre        AS region,
  z.nombre        AS zona,
  z.color_hex     AS zona_color,
  u.nombre        AS responsable,
  DATEDIFF(p.fecha_comprometida, CURDATE()) AS dias_restantes,
  CASE
    WHEN p.estado IN ('entregado','cerrado','cancelado') THEN FALSE
    WHEN p.fecha_comprometida < CURDATE() THEN TRUE
    ELSE FALSE
  END AS atrasado
FROM pedidos p
LEFT JOIN clientes        c ON c.id = p.cliente_id
LEFT JOIN faenas_mineras  f ON f.id = p.faena_id
LEFT JOIN regiones        r ON r.id = p.region_id
LEFT JOIN zonas_operacionales z ON z.id = p.zona_id
LEFT JOIN usuarios        u ON u.id = p.responsable_id;

CREATE OR REPLACE VIEW v_kpis_dashboard AS
SELECT
  (SELECT COUNT(*) FROM pedidos WHERE estado NOT IN ('entregado','cerrado','cancelado')) AS pedidos_activos,
  (SELECT COUNT(*) FROM pedidos WHERE prioridad='critica' AND estado NOT IN ('entregado','cerrado','cancelado')) AS pedidos_criticos,
  (SELECT COUNT(*) FROM pedidos WHERE fecha_comprometida < CURDATE() AND estado NOT IN ('entregado','cerrado','cancelado')) AS pedidos_atrasados,
  (SELECT COUNT(*) FROM pedidos WHERE estado IN ('despachado','en_ruta')) AS pedidos_en_ruta,
  (SELECT COUNT(*) FROM cotizaciones WHERE estado IN ('borrador','enviada')) AS cotizaciones_pendientes,
  (SELECT COUNT(*) FROM ordenes_compra WHERE estado IN ('emitida','confirmada','recibida_parcial')) AS oc_abiertas,
  (SELECT COALESCE(SUM(total),0) FROM pedidos WHERE MONTH(fecha_creacion)=MONTH(CURDATE()) AND YEAR(fecha_creacion)=YEAR(CURDATE())) AS ventas_mes,
  (SELECT COUNT(DISTINCT zona_id) FROM pedidos WHERE estado NOT IN ('entregado','cerrado','cancelado')) AS zonas_activas;

-- ════════════════════════════════════════════════════════════════════════
--  FIN
-- ════════════════════════════════════════════════════════════════════════
