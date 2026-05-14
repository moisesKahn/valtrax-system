#!/usr/bin/env python3
"""
VALTRAX — Genera las páginas placeholder de los nuevos módulos:
  • pedidos.html
  • proveedores.html
  • entregas.html
  • logistica-mapa.html
  • logistica-cobertura.html
  • transporte-vehiculos.html
  • transporte-conductores.html
  • transporte-hoja-ruta.html

Toma como base index.html (head + topbar + sidebar + footer)
y reemplaza el bloque <main>...</main> con contenido propio.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'index.html'

# Bloque <main>...</main> con marcadores
MAIN_PATTERN = re.compile(
    r'<!--!\s*\[Inicio\]\s*Contenido\s*Principal.*?'
    r'<!--!\s*\[Fin\]\s*Contenido\s*Principal[^>]*-->',
    re.DOTALL | re.IGNORECASE,
)
# Patrón alternativo (por si la página vieja todavía tiene formato inglés)
MAIN_PATTERN_OLD = re.compile(
    r'<!--!\s*=+\s*!-->\s*'
    r'<!--!\s*\[Start\]\s*Main\s*Content\s*!-->'
    r'.*?'
    r'<!--!\s*\[End\]\s*Main\s*Content\s*!-->\s*'
    r'<!--!\s*=+\s*!-->',
    re.DOTALL | re.IGNORECASE,
)

TITLE_PATTERN = re.compile(r'<title>.*?</title>', re.DOTALL | re.IGNORECASE)

def make_main(title: str, breadcrumb: str, content_html: str, extra_head: str = '', extra_scripts: str = '') -> str:
    return f'''    <!--! ================================================================ !-->
    <!--! [Inicio] Contenido Principal — {title} VALTRAX !-->
    <!--! ================================================================ !-->
    {extra_head}
    <main class="nxl-container">
        <div class="nxl-content">
            <div class="page-header">
                <div class="page-header-left d-flex align-items-center">
                    <div class="page-header-title">
                        <h5 class="m-b-10">{title}</h5>
                    </div>
                    <ul class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">Inicio</a></li>
                        <li class="breadcrumb-item">{breadcrumb}</li>
                    </ul>
                </div>
            </div>
            <div class="main-content">
                {content_html}
            </div>
            <footer class="footer">
                <p class="fs-11 text-muted fw-medium text-uppercase mb-0 copyright">
                    <span>© Copyright </span>
                    <a href="javascript:void(0);" class="ms-1"><span class="fw-bold text-uppercase">VALTRAX</span></a>
                </p>
                <p class="fs-11 text-muted fw-medium text-uppercase mb-0">
                    <span>Sistema de Abastecimiento Urgente · Industria Minera</span>
                </p>
                <div class="d-flex align-items-center gap-4">
                    <a href="help-knowledgebase.html" class="fs-11 fw-semibold text-uppercase">Ayuda</a>
                    <a href="javascript:void(0);" class="fs-11 fw-semibold text-uppercase">Términos</a>
                    <a href="javascript:void(0);" class="fs-11 fw-semibold text-uppercase">Privacidad</a>
                </div>
            </footer>
        </div>
    </main>
    {extra_scripts}
    <!--! ================================================================ !-->
    <!--! [Fin] Contenido Principal — {title} VALTRAX !-->
    <!--! ================================================================ !-->'''


# ── Contenido de cada página ───────────────────────────────────────────────

PEDIDOS_CONTENT = '''
<div class="row">
  <div class="col-12">
    <div class="card stretch stretch-full">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title">Pedidos Operacionales</h5>
        <div class="d-flex gap-2">
          <span class="badge bg-danger-subtle text-danger">4 Críticos</span>
          <span class="badge bg-warning-subtle text-warning">1 Atrasado</span>
          <a href="javascript:void(0)" class="btn btn-sm btn-primary"><i class="feather-plus me-1"></i>Nuevo Pedido</a>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table valtrax-table mb-0">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Faena</th>
                <th>Zona</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Comprometida</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tablaPedidos"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const pedidos = [
  {folio:'PED-2026-1450', cliente:'BHP Escondida', faena:'Faena Escondida',  zona:'Norte Grande', prio:'crítica', estado:'En Ruta',     fecha:'2026-05-15', total:22015000},
  {folio:'PED-2026-1451', cliente:'Collahuasi',    faena:'Pozo Almonte',      zona:'Norte Grande', prio:'crítica', estado:'Despachado',  fecha:'2026-05-14', total:15232000},
  {folio:'PED-2026-1452', cliente:'SQM Salar',     faena:'Salar de Atacama',  zona:'Norte Grande', prio:'alta',    estado:'Preparación', fecha:'2026-05-16', total:35462000},
  {folio:'PED-2026-1453', cliente:'Spence BHP',    faena:'Sierra Gorda',      zona:'Norte Grande', prio:'crítica', estado:'En Compra',   fecha:'2026-05-15', total:25466000},
  {folio:'PED-2026-1454', cliente:'CODELCO Chuqui',faena:'Chuquicamata',      zona:'Norte Grande', prio:'media',   estado:'Pendiente',   fecha:'2026-05-18', total:8627500},
  {folio:'PED-2026-1455', cliente:'Los Pelambres', faena:'Salamanca',         zona:'Norte Chico',  prio:'media',   estado:'Preparación', fecha:'2026-05-20', total:10353000},
  {folio:'PED-2026-1456', cliente:'CMDIC',         faena:'Iquique',           zona:'Norte Grande', prio:'alta',    estado:'Entregado',   fecha:'2026-05-14', total:8092000},
  {folio:'PED-2026-1457', cliente:'BHP Escondida', faena:'Bodega 4',          zona:'Norte Grande', prio:'alta',    estado:'Entregado',   fecha:'2026-05-13', total:5176500},
  {folio:'PED-2026-1458', cliente:'Candelaria',    faena:'Tierra Amarilla',   zona:'Norte Chico',  prio:'media',   estado:'En Compra',   fecha:'2026-05-17', total:6069000},
  {folio:'PED-2026-1459', cliente:'Centinela',     faena:'Sierra Gorda',      zona:'Norte Grande', prio:'crítica', estado:'En Ruta',     fecha:'2026-05-15', total:10948000},
  {folio:'PED-2026-1460', cliente:'BHP Escondida', faena:'Almacén Central',   zona:'Norte Grande', prio:'alta',    estado:'Preparación', fecha:'2026-05-16', total:13566000},
  {folio:'PED-2026-1461', cliente:'Collahuasi',    faena:'Pozo Almonte',      zona:'Norte Grande', prio:'media',   estado:'Pendiente',   fecha:'2026-05-19', total:3808000},
  {folio:'PED-2026-1462', cliente:'CODELCO',       faena:'Radomiro Tomic',    zona:'Norte Grande', prio:'baja',    estado:'Pendiente',   fecha:'2026-05-21', total:2856000},
  {folio:'PED-2026-1463', cliente:'Tres Valles',   faena:'Salamanca',         zona:'Norte Chico',  prio:'alta',    estado:'Despachado',  fecha:'2026-05-18', total:9282000}
];
const prioMap = {'crítica':['critica','bg-danger'], 'alta':['alta','bg-warning'], 'media':['media','bg-primary'], 'baja':['baja','bg-secondary']};
const estadoMap = {'En Ruta':'bg-info-subtle text-info', 'Despachado':'bg-primary-subtle text-primary', 'Preparación':'bg-warning-subtle text-warning', 'En Compra':'bg-warning-subtle text-warning', 'Pendiente':'bg-secondary-subtle text-secondary', 'Entregado':'bg-success-subtle text-success'};
const fmt = n => '$ ' + n.toLocaleString('es-CL');
document.getElementById('tablaPedidos').innerHTML = pedidos.map(p => `
  <tr>
    <td class="fw-semibold">${p.folio}</td>
    <td>${p.cliente}</td>
    <td class="fs-12 text-muted">${p.faena}</td>
    <td><span class="fs-11">${p.zona}</span></td>
    <td><span class="d-inline-flex align-items-center gap-2"><span class="valtrax-prio-dot ${prioMap[p.prio][0]}" style="margin-top:0"></span><span class="fs-12">${p.prio}</span></span></td>
    <td><span class="badge ${estadoMap[p.estado]}">${p.estado}</span></td>
    <td class="fs-12">${p.fecha}</td>
    <td class="fw-semibold">${fmt(p.total)}</td>
    <td><a href="javascript:void(0)" class="text-primary"><i class="feather-eye"></i></a></td>
  </tr>
`).join('');
</script>
'''

PROVEEDORES_CONTENT = '''
<div class="row">
  <div class="col-12">
    <div class="card stretch stretch-full">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title">Proveedores</h5>
        <a href="javascript:void(0)" class="btn btn-sm btn-primary"><i class="feather-plus me-1"></i>Nuevo Proveedor</a>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table valtrax-table mb-0">
            <thead>
              <tr>
                <th>Razón Social</th><th>RUT</th><th>Rubro</th><th>Ciudad</th>
                <th>Rating</th><th>Resp. (hrs)</th><th>Contacto</th><th></th>
              </tr>
            </thead>
            <tbody id="tablaProv"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const provs = [
  {r:'Ferretería Industrial del Norte SpA', rut:'76.123.456-7', rubro:'Ferretería industrial', ciudad:'Antofagasta', rating:4.8, hrs:6,  cont:'Felipe Manríquez'},
  {r:'Repuestos Mineros Atacama Ltda.',     rut:'78.345.678-9', rubro:'Repuestos pesados',     ciudad:'Copiapó',     rating:4.9, hrs:4,  cont:'Mauricio Espinoza'},
  {r:'Eléctricos Norte SpA',                 rut:'82.789.012-3', rubro:'Eléctrico industrial',  ciudad:'Calama',      rating:4.8, hrs:6,  cont:'Jorge Núñez'},
  {r:'Hidráulica y Neumática del Sur',       rut:'80.567.890-1', rubro:'Hidráulica',            ciudad:'Concepción',  rating:4.7, hrs:18, cont:'Hernán Vega'},
  {r:'Lubricantes y Filtros SA',             rut:'77.234.567-8', rubro:'Lubricantes/filtros',   ciudad:'Santiago',    rating:4.6, hrs:12, cont:'Carla Bustamante'},
  {r:'Seguridad Industrial Pro',             rut:'79.456.789-0', rubro:'EPP / Seguridad',       ciudad:'Santiago',    rating:4.5, hrs:24, cont:'Daniela Soto'},
  {r:'Soldaduras Tecnológicas Ltda.',        rut:'81.678.901-2', rubro:'Soldaduras',            ciudad:'Antofagasta', rating:4.4, hrs:8,  cont:'Patricia Reinoso'},
  {r:'Insumos Químicos Industriales',        rut:'83.890.123-4', rubro:'Químicos',              ciudad:'Santiago',    rating:4.3, hrs:36, cont:'Mónica Henríquez'}
];
document.getElementById('tablaProv').innerHTML = provs.map(p=>`
  <tr>
    <td class="fw-semibold">${p.r}</td><td class="fs-12">${p.rut}</td><td>${p.rubro}</td>
    <td>${p.ciudad}</td>
    <td><span class="text-warning"><i class="feather-star"></i></span> <b>${p.rating}</b></td>
    <td>${p.hrs} h</td><td class="fs-12">${p.cont}</td>
    <td><a href="javascript:void(0)" class="text-primary"><i class="feather-eye"></i></a></td>
  </tr>`).join('');
</script>
'''

ENTREGAS_CONTENT = '''
<div class="row">
  <div class="col-12">
    <div class="card stretch stretch-full">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title">Despachos y Entregas</h5>
        <span class="badge bg-info-subtle text-info">4 en ruta · 2 entregadas</span>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table valtrax-table mb-0">
            <thead>
              <tr><th>Guía</th><th>Pedido</th><th>Conductor</th><th>Vehículo</th><th>Empresa</th><th>Estado</th><th>Despacho</th><th>Entrega</th></tr>
            </thead>
            <tbody id="tablaEnt"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
const ent = [
  {g:'90245', p:'PED-2026-1450', c:'Hugo Carrasco',  v:'JHTR-58', e:'Transportes del Norte SA', est:'En Ruta',  d:'Hoy 14:30', f:'—'},
  {g:'90246', p:'PED-2026-1451', c:'Luis Vergara',   v:'LMRT-23', e:'Logística Norte Express',  est:'En Ruta',  d:'Hoy 16:00', f:'—'},
  {g:'90251', p:'PED-2026-1459', c:'Patricio Reyes', v:'VLTX-01', e:'VALTRAX (propio)',          est:'En Ruta',  d:'Hoy 12:00', f:'—'},
  {g:'90262', p:'PED-2026-1463', c:'Hugo Carrasco',  v:'GHTY-44', e:'Transportes Centro Sur',   est:'En Ruta',  d:'Hoy 15:30', f:'—'},
  {g:'90234', p:'PED-2026-1456', c:'Mario Salinas',  v:'BTYU-77', e:'Express Norte',             est:'Entregada',d:'Hoy 09:15', f:'Hoy 11:35'},
  {g:'90187', p:'PED-2026-1457', c:'Felipe Bustos',  v:'JHTR-58', e:'Transportes del Norte SA', est:'Entregada',d:'Ayer 07:00',f:'Ayer 16:45'}
];
const em = {'En Ruta':'bg-info-subtle text-info', 'Entregada':'bg-success-subtle text-success'};
document.getElementById('tablaEnt').innerHTML = ent.map(e=>`
  <tr>
    <td class="fw-semibold">${e.g}</td><td>${e.p}</td><td>${e.c}</td><td class="fs-12">${e.v}</td>
    <td>${e.e}</td><td><span class="badge ${em[e.est]}">${e.est}</span></td>
    <td class="fs-12">${e.d}</td><td class="fs-12">${e.f}</td>
  </tr>`).join('');
</script>
'''

LOGISTICA_MAPA_CONTENT = '''
<div class="row">
  <div class="col-12">
    <div class="card stretch stretch-full">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title">Mapa Operacional Completo</h5>
        <div class="d-flex gap-2 flex-wrap">
          <span class="badge bg-danger-subtle text-danger">● Crítico</span>
          <span class="badge bg-warning-subtle text-warning">● Alta</span>
          <span class="badge bg-info-subtle text-info">● En Ruta</span>
          <span class="badge bg-success-subtle text-success">● Entregado</span>
          <span class="badge bg-secondary-subtle text-secondary">● Otros</span>
        </div>
      </div>
      <div class="card-body p-0">
        <div id="valtraxMapFull" style="height: 75vh; border-radius: 0 0 12px 12px;"></div>
      </div>
    </div>
  </div>
</div>
<script>
(function(){
  if (typeof L === 'undefined') return;
  const map = L.map('valtraxMapFull', { center:[-26,-69.5], zoom:5 });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution:'&copy; OSM &copy; CARTO' }).addTo(map);
  const pedidos = [
    { folio:'PED-2026-1450', lat:-24.2625, lng:-69.0709, estado:'En Ruta',    color:'#0ea5e9', prio:'crítica', cliente:'BHP Escondida' },
    { folio:'PED-2026-1451', lat:-20.9700, lng:-68.6900, estado:'Despachado', color:'#2563eb', prio:'crítica', cliente:'Collahuasi' },
    { folio:'PED-2026-1452', lat:-23.4858, lng:-68.2275, estado:'Preparación',color:'#f59e0b', prio:'alta',    cliente:'SQM Salar' },
    { folio:'PED-2026-1453', lat:-22.7350, lng:-69.3000, estado:'En Compra',  color:'#f59e0b', prio:'crítica', cliente:'Spence BHP' },
    { folio:'PED-2026-1454', lat:-22.2900, lng:-68.9000, estado:'Pendiente',  color:'#94a3b8', prio:'media',   cliente:'CODELCO Chuqui' },
    { folio:'PED-2026-1455', lat:-31.7333, lng:-70.4833, estado:'Preparación',color:'#f59e0b', prio:'media',   cliente:'Los Pelambres' },
    { folio:'PED-2026-1456', lat:-20.2208, lng:-70.1431, estado:'Entregado',  color:'#10b981', prio:'alta',    cliente:'CMDIC' },
    { folio:'PED-2026-1457', lat:-24.2625, lng:-69.0709, estado:'Entregado',  color:'#10b981', prio:'alta',    cliente:'BHP Escondida' },
    { folio:'PED-2026-1458', lat:-27.5083, lng:-70.3169, estado:'En Compra',  color:'#f59e0b', prio:'media',   cliente:'Candelaria' },
    { folio:'PED-2026-1459', lat:-22.9667, lng:-69.3667, estado:'En Ruta',    color:'#0ea5e9', prio:'crítica', cliente:'Centinela' },
    { folio:'PED-2026-1463', lat:-31.7833, lng:-70.9500, estado:'Despachado', color:'#2563eb', prio:'alta',    cliente:'Tres Valles' }
  ];
  pedidos.forEach(p=>{
    const ic = L.divIcon({ className:'valtrax-map-marker'+(p.prio==='crítica'?' is-critical':''),
      html:`<span style="background:${p.color}"></span>`, iconSize:[18,18], iconAnchor:[9,9]});
    L.marker([p.lat,p.lng],{icon:ic}).addTo(map).bindPopup(
      `<div style="font-family:DM Sans;min-width:180px">
        <div style="font-weight:700;color:#1e293b">${p.folio}</div>
        <div style="font-size:11px;color:#64748b;margin-bottom:6px">${p.cliente}</div>
        <div style="font-size:11px"><b>Estado:</b> ${p.estado} · <b>Prio:</b> ${p.prio}</div></div>`);
  });
})();
</script>
'''

LOGISTICA_COBERTURA_CONTENT = '''
<div class="row">
  <div class="col-xxl-8">
    <div class="card stretch stretch-full">
      <div class="card-header"><h5 class="card-title">Cobertura por Zona Operacional</h5></div>
      <div class="card-body">
        <div class="valtrax-zone-list">
          <div class="valtrax-zone-item">
            <div class="d-flex justify-content-between mb-2"><div class="d-flex align-items-center gap-2"><span class="valtrax-zone-color" style="background:#dc2626"></span><b>Norte Grande</b></div><span class="fw-bold">9 pedidos · 64%</span></div>
            <div class="progress" style="height:8px"><div class="progress-bar bg-danger" style="width:64%"></div></div>
            <div class="fs-12 text-muted mt-2">Arica · Iquique · Antofagasta · Calama · Tocopilla · Mejillones · Pozo Almonte</div>
          </div>
          <div class="valtrax-zone-item">
            <div class="d-flex justify-content-between mb-2"><div class="d-flex align-items-center gap-2"><span class="valtrax-zone-color" style="background:#f59e0b"></span><b>Norte Chico</b></div><span class="fw-bold">3 pedidos · 21%</span></div>
            <div class="progress" style="height:8px"><div class="progress-bar bg-warning" style="width:21%"></div></div>
            <div class="fs-12 text-muted mt-2">Copiapó · Diego de Almagro · Caldera · La Serena · Coquimbo · Ovalle</div>
          </div>
          <div class="valtrax-zone-item">
            <div class="d-flex justify-content-between mb-2"><div class="d-flex align-items-center gap-2"><span class="valtrax-zone-color" style="background:#2563eb"></span><b>Región Metropolitana</b></div><span class="fw-bold">2 pedidos · 14%</span></div>
            <div class="progress" style="height:8px"><div class="progress-bar bg-primary" style="width:14%"></div></div>
            <div class="fs-12 text-muted mt-2">Santiago — operaciones administrativas y abastecimiento centralizado</div>
          </div>
          <div class="valtrax-zone-item">
            <div class="d-flex justify-content-between mb-2"><div class="d-flex align-items-center gap-2"><span class="valtrax-zone-color" style="background:#10b981"></span><b>Centro Sur</b></div><span class="fw-bold text-muted">Sin operaciones</span></div>
            <div class="progress" style="height:8px"><div class="progress-bar bg-success" style="width:0%"></div></div>
            <div class="fs-12 text-muted mt-2">Valparaíso · Concepción — zona de expansión futura</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-xxl-4">
    <div class="card stretch stretch-full">
      <div class="card-header"><h5 class="card-title">Faenas Mineras Activas</h5></div>
      <div class="card-body">
        <ul class="list-unstyled mb-0">
          <li class="py-2 border-bottom"><b>Faena Escondida</b><div class="fs-12 text-muted">BHP · Antofagasta</div></li>
          <li class="py-2 border-bottom"><b>Chuquicamata</b><div class="fs-12 text-muted">CODELCO · Calama</div></li>
          <li class="py-2 border-bottom"><b>Radomiro Tomic</b><div class="fs-12 text-muted">CODELCO · Calama</div></li>
          <li class="py-2 border-bottom"><b>Collahuasi</b><div class="fs-12 text-muted">Collahuasi · Pozo Almonte</div></li>
          <li class="py-2 border-bottom"><b>Candelaria</b><div class="fs-12 text-muted">Lundin · Copiapó</div></li>
          <li class="py-2 border-bottom"><b>Salar de Atacama</b><div class="fs-12 text-muted">SQM · Antofagasta</div></li>
          <li class="py-2 border-bottom"><b>Los Pelambres</b><div class="fs-12 text-muted">Antofagasta · Salamanca</div></li>
          <li class="py-2 border-bottom"><b>Centinela</b><div class="fs-12 text-muted">Antofagasta · Sierra Gorda</div></li>
          <li class="py-2"><b>Spence</b><div class="fs-12 text-muted">BHP · Sierra Gorda</div></li>
        </ul>
      </div>
    </div>
  </div>
</div>
'''

VEHICULOS_CONTENT = '''
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="card-title">Flota VALTRAX</h5>
    <span class="badge bg-info-subtle text-info">Módulo en preparación</span>
  </div>
  <div class="card-body p-0">
    <table class="table valtrax-table mb-0">
      <thead><tr><th>Patente</th><th>Tipo</th><th>Marca/Modelo</th><th>Año</th><th>Capacidad</th><th>Estado</th><th>Próx. Revisión</th></tr></thead>
      <tbody>
        <tr><td class="fw-semibold">VLTX-01</td><td>Camión 3/4</td><td>Mercedes-Benz Atego 1726</td><td>2024</td><td>7.000 kg</td><td><span class="badge bg-info-subtle text-info">En Ruta</span></td><td>15-09-2026</td></tr>
        <tr><td class="fw-semibold">VLTX-02</td><td>Camioneta</td><td>Toyota Hilux 4x4</td><td>2025</td><td>1.000 kg</td><td><span class="badge bg-success-subtle text-success">Disponible</span></td><td>22-08-2026</td></tr>
        <tr><td class="fw-semibold">VLTX-03</td><td>Camión Pluma</td><td>Volvo FH 460</td><td>2023</td><td>12.000 kg</td><td><span class="badge bg-warning-subtle text-warning">Mantenimiento</span></td><td>30-05-2026</td></tr>
        <tr><td class="fw-semibold">VLTX-04</td><td>Camioneta</td><td>Ford Ranger</td><td>2024</td><td>1.100 kg</td><td><span class="badge bg-success-subtle text-success">Disponible</span></td><td>10-10-2026</td></tr>
      </tbody>
    </table>
  </div>
</div>
'''

CONDUCTORES_CONTENT = '''
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="card-title">Conductores</h5>
    <span class="badge bg-info-subtle text-info">Módulo en preparación</span>
  </div>
  <div class="card-body p-0">
    <table class="table valtrax-table mb-0">
      <thead><tr><th>RUT</th><th>Nombre</th><th>Teléfono</th><th>Licencia</th><th>Vence</th><th>Estado</th></tr></thead>
      <tbody>
        <tr><td>14.234.567-1</td><td class="fw-semibold">Patricio Reyes Olivares</td><td>+56 9 4789 0123</td><td>A-5</td><td>12-03-2027</td><td><span class="badge bg-info-subtle text-info">En Ruta</span></td></tr>
        <tr><td>15.345.678-2</td><td class="fw-semibold">Hugo Carrasco Muñoz</td><td>+56 9 5890 1234</td><td>A-5</td><td>04-11-2026</td><td><span class="badge bg-success-subtle text-success">Disponible</span></td></tr>
        <tr><td>16.456.789-3</td><td class="fw-semibold">Luis Vergara Ramírez</td><td>+56 9 6901 2345</td><td>A-4</td><td>19-07-2027</td><td><span class="badge bg-success-subtle text-success">Disponible</span></td></tr>
        <tr><td>13.567.890-4</td><td class="fw-semibold">Mario Salinas Acevedo</td><td>+56 9 7012 3456</td><td>A-5</td><td>30-08-2026</td><td><span class="badge bg-warning-subtle text-warning">Descanso</span></td></tr>
      </tbody>
    </table>
  </div>
</div>
'''

HOJA_RUTA_CONTENT = '''
<div class="card">
  <div class="card-header">
    <h5 class="card-title">Hojas de Ruta</h5>
  </div>
  <div class="card-body text-center py-5">
    <i class="feather-map-pin fs-1 text-muted mb-3"></i>
    <h5 class="text-muted">Módulo de Hojas de Ruta en preparación</h5>
    <p class="text-muted fs-13">Pronto podrás planificar rutas, asignar conductores y vehículos, y hacer seguimiento GPS en tiempo real.</p>
    <a href="logistica-mapa.html" class="btn btn-primary mt-3"><i class="feather-map me-2"></i>Ir al Mapa Operacional</a>
  </div>
</div>
'''

# ── Definición de páginas ─────────────────────────────────────────────────
LEAFLET_HEAD = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>'
LEAFLET_SCRIPT = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>'

PAGES = [
    ('pedidos.html',                'Pedidos',                'Área Operacional',       PEDIDOS_CONTENT,             '', ''),
    ('proveedores.html',            'Proveedores',            'Área Operacional',       PROVEEDORES_CONTENT,         '', ''),
    ('entregas.html',               'Entregas y Despachos',   'Logística',              ENTREGAS_CONTENT,            '', ''),
    ('logistica-mapa.html',         'Mapa Operacional',       'Logística',              LOGISTICA_MAPA_CONTENT,      LEAFLET_HEAD, LEAFLET_SCRIPT),
    ('logistica-cobertura.html',    'Cobertura Geográfica',   'Logística',              LOGISTICA_COBERTURA_CONTENT, '', ''),
    ('transporte-vehiculos.html',   'Vehículos',              'Transporte Propio',      VEHICULOS_CONTENT,           '', ''),
    ('transporte-conductores.html', 'Conductores',            'Transporte Propio',      CONDUCTORES_CONTENT,         '', ''),
    ('transporte-hoja-ruta.html',   'Hojas de Ruta',          'Transporte Propio',      HOJA_RUTA_CONTENT,           '', ''),
]

def build_page(filename, title, breadcrumb, content, extra_head, extra_scripts):
    base = INDEX.read_text(encoding='utf-8')
    # Reemplazar título
    base = TITLE_PATTERN.sub(f'<title>VALTRAX · {title}</title>', base, count=1)
    # Reemplazar bloque main
    new_main = make_main(title, breadcrumb, content, extra_head, extra_scripts)
    if MAIN_PATTERN.search(base):
        base = MAIN_PATTERN.sub(new_main, base, count=1)
    elif MAIN_PATTERN_OLD.search(base):
        base = MAIN_PATTERN_OLD.sub(new_main, base, count=1)
    else:
        print(f"  WARN: no se encontró bloque main para {filename}")
        return False
    (ROOT / filename).write_text(base, encoding='utf-8')
    return True

def main():
    print("\nGenerando páginas VALTRAX:")
    ok = 0
    for args in PAGES:
        if build_page(*args):
            print(f"  ✓ {args[0]}")
            ok += 1
        else:
            print(f"  ✗ {args[0]}")
    print(f"\nTotal: {ok}/{len(PAGES)} páginas creadas")

if __name__ == '__main__':
    main()
