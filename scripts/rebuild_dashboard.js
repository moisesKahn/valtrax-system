#!/usr/bin/env node
/**
 * Reconstruye el main-content de index.html con el nuevo Dashboard Financiero
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'index.html');

let h = fs.readFileSync(FILE, 'utf8');

// 1. Quitar Leaflet CSS
h = h.replace(/\s*<!-- Leaflet CSS para el mapa operacional -->\s*<link[^>]*leaflet[^>]*crossorigin=""\s*\/>/g, '');

// 2. Actualizar título y breadcrumb
h = h.replace('Centro de Operaciones', 'Dashboard Financiero');
h = h.replace('<li class="breadcrumb-item">Dashboard Ejecutivo</li>',
              '<li class="breadcrumb-item">Dashboard Financiero</li>');

// 3. Actualizar badge/botón del header
h = h.replace(
  /<div class="d-flex align-items-center gap-2 page-header-right-items-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*(?=<!-- ── CONTENIDO)/,
  `<div class="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                            <a href="cotizaciones.html" class="btn btn-sm btn-outline-secondary">
                                <i class="feather-file-text me-1"></i>Cotizaciones
                            </a>
                            <a href="pedidos.html" class="btn btn-md btn-primary">
                                <i class="feather-package me-1"></i>Pedidos
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            `
);

// 4. Reemplazar main-content completo
const MAIN_START = '<!-- ── CONTENIDO PRINCIPAL ──────────────────────────────── -->';
const MAIN_END   = '<!-- [ Main Content ] end -->';
const si = h.indexOf(MAIN_START);
const ei = h.indexOf(MAIN_END) + MAIN_END.length;
if (si < 0 || ei < MAIN_END.length) { console.error('Markers not found'); process.exit(1); }

const NEW_MAIN = `<!-- ── CONTENIDO PRINCIPAL ──────────────────────────────── -->
            <style>
            .vxd-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;}
            .vxd-grow{background:#dcfce7;color:#166534;}
            .vxd-warn{background:#fff7ed;color:#c2410c;}
            .vxd-blue{background:#dbeafe;color:#1d4ed8;}
            .kpi-num{font-size:26px;font-weight:800;color:#0f172a;line-height:1.1;}
            .kpi-sub{font-size:11.5px;color:#64748b;margin-top:3px;}
            .vxd-prog{height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-top:8px;}
            .vxd-prog-fill{height:100%;border-radius:3px;transition:width .6s ease;}
            .vxd-tbl{width:100%;border-collapse:collapse;}
            .vxd-tbl th{padding:8px 12px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.4px;background:rgba(248,250,252,0.9);border-bottom:1px solid #f1f5f9;}
            .vxd-tbl td{padding:9px 12px;font-size:12.5px;color:#334155;border-bottom:1px solid rgba(241,245,249,0.8);vertical-align:middle;}
            .vxd-tbl tbody tr:last-child td{border-bottom:none;}
            .vxd-tbl tbody tr:hover td{background:rgba(248,250,252,0.5);}
            .vxd-rank{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:#f1f5f9;color:#64748b;}
            .vxd-rank.r1{background:#fef9c3;color:#92400e;}
            .vxd-rank.r2{background:#f1f5f9;color:#475569;}
            .vxd-rank.r3{background:#fff7ed;color:#c2410c;}
            </style>
            <div class="main-content">

                <!-- ╔═ ROW 1: KPIs Comerciales ═╗ -->
                <div class="row g-3 mb-2">
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Cotizaciones</span>
                                    <div class="avatar-text avatar-sm bg-primary-subtle text-primary"><i class="feather-file-text" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-cot-total">—</div>
                                <div class="kpi-sub">Total procesadas</div>
                                <div class="d-flex gap-1 flex-wrap mt-2">
                                    <span class="vxd-pill vxd-grow" id="kpi-cot-apr">— aprobadas</span>
                                    <span class="vxd-pill vxd-warn" id="kpi-cot-pen">— pendientes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Conversión</span>
                                    <div class="avatar-text avatar-sm bg-success-subtle text-success"><i class="feather-trending-up" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-conv">—%</div>
                                <div class="kpi-sub">Cotizaciones → Pedido</div>
                                <div class="vxd-prog mt-2"><div class="vxd-prog-fill bg-success" id="kpi-conv-bar" style="width:0%"></div></div>
                                <div class="fs-11 text-muted mt-1" id="kpi-conv-lbl">— de — cotizaciones</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Pedidos Totales</span>
                                    <div class="avatar-text avatar-sm bg-info-subtle text-info"><i class="feather-package" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-ped-total">—</div>
                                <div class="kpi-sub">Pedidos registrados</div>
                                <div class="d-flex gap-1 flex-wrap mt-2">
                                    <span class="vxd-pill vxd-grow" id="kpi-ped-ent">— entregados</span>
                                    <span class="vxd-pill vxd-blue" id="kpi-ped-pro">— en proceso</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Valor Total Ventas</span>
                                    <div class="avatar-text avatar-sm bg-warning-subtle text-warning"><i class="feather-dollar-sign" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-valor" style="font-size:22px;">—</div>
                                <div class="kpi-sub">Suma acumulada pedidos</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ╔═ ROW 2: KPIs Rentabilidad ═╗ -->
                <div class="row g-3 mb-3">
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Ganancia Total</span>
                                    <div class="avatar-text avatar-sm bg-success-subtle text-success"><i class="feather-bar-chart-2" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-gan" style="font-size:22px;color:#16a34a;">—</div>
                                <div class="kpi-sub" id="kpi-gan-sub">Sobre — vendidos</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Margen Promedio</span>
                                    <div class="avatar-text avatar-sm bg-primary-subtle text-primary"><i class="feather-percent" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-margen">—%</div>
                                <div class="kpi-sub">Ganancia / Venta</div>
                                <div class="vxd-prog mt-2"><div class="vxd-prog-fill bg-primary" id="kpi-margen-bar" style="width:0%"></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Pedidos Facturados</span>
                                    <div class="avatar-text avatar-sm bg-success-subtle text-success"><i class="feather-check-circle" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-fact">—</div>
                                <div class="kpi-sub" id="kpi-fact-sub">— de — con factura</div>
                                <div class="vxd-prog mt-2"><div class="vxd-prog-fill bg-success" id="kpi-fact-bar" style="width:0%"></div></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-3 col-md-6">
                        <div class="card valtrax-kpi-card stretch stretch-full" style="border-left:3px solid #f97316 !important;">
                            <div class="card-body p-3">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fs-11 fw-semibold text-muted text-uppercase">Por Facturar</span>
                                    <div class="avatar-text avatar-sm bg-danger-subtle text-danger"><i class="feather-alert-circle" style="font-size:13px;"></i></div>
                                </div>
                                <div class="kpi-num" id="kpi-sinfact" style="color:#c2410c;">—</div>
                                <div class="kpi-sub">Pedidos sin N° de factura</div>
                                <div class="mt-2"><span class="vxd-pill vxd-warn"><i class="feather-alert-triangle" style="font-size:9px;"></i> Atención requerida</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ╔═ ROW 3: Gráficos ═╗ -->
                <div class="row g-3 mb-3">
                    <div class="col-xl-8">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h6 class="card-title mb-0 fw-bold">Ventas vs Costos Mensuales</h6>
                                <div class="d-flex gap-2">
                                    <span class="vxd-pill vxd-blue"><span style="width:7px;height:7px;border-radius:50%;background:#2563eb;display:inline-block;"></span> Ventas</span>
                                    <span class="vxd-pill" style="background:#fef3c7;color:#92400e;"><span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;display:inline-block;"></span> Costos</span>
                                </div>
                            </div>
                            <div class="card-body pt-2 pb-3">
                                <div id="chartVentas" style="min-height:260px;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4">
                        <div class="card stretch stretch-full">
                            <div class="card-header">
                                <h6 class="card-title mb-0 fw-bold">Estado de Pedidos</h6>
                            </div>
                            <div class="card-body d-flex flex-column align-items-center pt-2">
                                <div id="chartDonut" style="min-height:200px;width:100%;"></div>
                                <div id="donutLegend" class="w-100 mt-1"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ╔═ ROW 4: Tablas inferiores ═╗ -->
                <div class="row g-3">
                    <div class="col-xl-4">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h6 class="card-title mb-0 fw-bold">Mejores Clientes</h6>
                                <a href="cotizaciones.html" class="fs-11 text-primary fw-semibold">Ver todos</a>
                            </div>
                            <div class="card-body p-0">
                                <table class="table vxd-tbl mb-0">
                                    <thead><tr><th>#</th><th>Cliente</th><th>Ped.</th><th>Total</th><th>Margen</th></tr></thead>
                                    <tbody id="tbl-clientes"><tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8;font-size:12px;">Cargando...</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h6 class="card-title mb-0 fw-bold">Pedidos Recientes</h6>
                                <a href="pedidos.html" class="fs-11 text-primary fw-semibold">Ver todos</a>
                            </div>
                            <div class="card-body p-0">
                                <table class="table vxd-tbl mb-0">
                                    <thead><tr><th>Folio</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Factura</th></tr></thead>
                                    <tbody id="tbl-pedidos"><tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8;font-size:12px;">Cargando...</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h6 class="card-title mb-0 fw-bold">Órdenes de Compra</h6>
                                <a href="ordenes-compra.html" class="fs-11 text-primary fw-semibold">Ver todas</a>
                            </div>
                            <div class="card-body p-0">
                                <table class="table vxd-tbl mb-0">
                                    <thead><tr><th>OC</th><th>Proveedor</th><th>Costo</th><th>Estado</th></tr></thead>
                                    <tbody id="tbl-ocs"><tr><td colspan="4" style="text-align:center;padding:24px;color:#94a3b8;font-size:12px;">Cargando...</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <!-- [ Main Content ] end -->`;

// 5. Quitar Leaflet JS block
const LEAF_JS = '<!-- Leaflet JS + inicialización del mapa VALTRAX -->';
const LEAF_END = '</script>';
const li = h.indexOf(LEAF_JS);
if (li >= 0) {
    const le = h.indexOf(LEAF_END, li) + LEAF_END.length;
    h = h.slice(0, li) + h.slice(le);
}

// 6. Agregar script de datos antes de dashboard-init.min.js
const DASH_SCRIPT = '<script src="assets/js/dashboard-init.min.js"></script>';
const DASH_JS = `<script>
(async function vxDash(){
    function fCLP(n){if(!n||n===0)return '$0';if(n>=1e6)return '$'+Math.round(n/1e6*10)/10+'M';if(n>=1e3)return '$'+Math.round(n/1e3)+'K';return '$'+Math.round(n).toLocaleString('es-CL');}
    function set(id,v){const el=document.getElementById(id);if(el)el.textContent=v;}
    function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
    const ESB={'Pendiente':'#fef9c3','En compra':'#dbeafe','Preparación':'#ede9fe','Despachado':'#ffedd5','Entregado':'#d1fae5'};
    const ESC={'Pendiente':'#92400e','En compra':'#1d4ed8','Preparación':'#6d28d9','Despachado':'#c2410c','Entregado':'#065f46'};
    try{
        const [pptos,pedidos,ocs] = await Promise.all([
            fetch('/api/presupuestos').then(r=>r.ok?r.json():[]),
            fetch('/api/pedidos').then(r=>r.ok?r.json():[]),
            fetch('/api/oc').then(r=>r.ok?r.json():[])
        ]);
        // KPI cotizaciones
        const totalCot=pptos.length;
        const aprobadas=pptos.filter(p=>['cotizacion','aprobada'].includes(p.estado)).length;
        const pendientes=pptos.filter(p=>['pendiente','solicitud','presupuesto'].includes(p.estado)).length;
        const conv=totalCot?Math.round(aprobadas/totalCot*100):0;
        set('kpi-cot-total',totalCot||0);
        set('kpi-cot-apr',aprobadas+' aprobadas');
        set('kpi-cot-pen',pendientes+' pendientes');
        set('kpi-conv',conv+'%');
        set('kpi-conv-lbl',aprobadas+' de '+totalCot+' cotizaciones');
        const cb=document.getElementById('kpi-conv-bar'); if(cb) cb.style.width=conv+'%';
        // KPI pedidos
        const totalPed=pedidos.length;
        const pedEnt=pedidos.filter(p=>p.estado==='Entregado').length;
        const pedPend=pedidos.filter(p=>p.estado==='Pendiente').length;
        const pedPro=totalPed-pedEnt-pedPend;
        const valorTotal=pedidos.reduce((s,p)=>s+(parseFloat(p.total_venta)||0),0);
        set('kpi-ped-total',totalPed); set('kpi-ped-ent',pedEnt+' entregados'); set('kpi-ped-pro',pedPro+' en proceso');
        set('kpi-valor',fCLP(valorTotal));
        // KPI rentabilidad
        const ganTotal=pedidos.reduce((s,p)=>s+(parseFloat(p.ganancia)||0),0);
        const margen=valorTotal?Math.round(ganTotal/valorTotal*1000)/10:0;
        set('kpi-gan',fCLP(ganTotal)); set('kpi-gan-sub','Sobre '+fCLP(valorTotal)+' vendidos');
        set('kpi-margen',margen+'%');
        const mb=document.getElementById('kpi-margen-bar'); if(mb) mb.style.width=Math.min(margen,100)+'%';
        // KPI facturación
        const facturados=pedidos.filter(p=>p.nro_factura).length;
        const sinFact=totalPed-facturados;
        const pctFact=totalPed?Math.round(facturados/totalPed*100):0;
        set('kpi-fact',facturados); set('kpi-fact-sub',facturados+' de '+totalPed+' con factura'); set('kpi-sinfact',sinFact);
        const fb=document.getElementById('kpi-fact-bar'); if(fb) fb.style.width=pctFact+'%';
        // Gráfico línea
        const mm={};
        pedidos.forEach(p=>{const m=(p.fecha||p.creado_en||'').slice(0,7);if(!m||m.length<7)return;if(!mm[m]){mm[m]={v:0,c:0};}mm[m].v+=parseFloat(p.total_venta)||0;mm[m].c+=parseFloat(p.total_costo)||0;});
        const MN=['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        const sk=Object.keys(mm).sort().slice(-12);
        const mlb=sk.map(m=>{const[y,mo]=m.split('-');return MN[+mo]+' '+y.slice(2);});
        const mv=sk.map(m=>Math.round(mm[m].v)); const mc=sk.map(m=>Math.round(mm[m].c));
        if(window.ApexCharts&&document.getElementById('chartVentas')){
            new ApexCharts(document.getElementById('chartVentas'),{
                series:[{name:'Ventas',data:mv.length?mv:[0]},{name:'Costos',data:mc.length?mc:[0]}],
                chart:{type:'area',height:260,toolbar:{show:false},fontFamily:'DM Sans, sans-serif'},
                colors:['#2563eb','#f59e0b'],
                fill:{type:'gradient',gradient:{shadeIntensity:1,opacityFrom:0.2,opacityTo:0.02,stops:[0,95,100]}},
                stroke:{curve:'smooth',width:2.5},dataLabels:{enabled:false},
                xaxis:{categories:mlb.length?mlb:['Sin datos'],labels:{style:{fontSize:'11px',colors:'#94a3b8'}}},
                yaxis:{labels:{formatter:v=>'$'+Math.round(v/1000)+'K',style:{fontSize:'11px',colors:'#94a3b8'}}},
                grid:{borderColor:'#f1f5f9',strokeDashArray:4},
                tooltip:{y:{formatter:v=>'$'+Math.round(v).toLocaleString('es-CL')}},
                legend:{position:'top',fontFamily:'DM Sans',fontSize:'12px'},markers:{size:3}
            }).render();
        }
        // Gráfico donut
        const estNm=['Pendiente','En compra','Preparación','Despachado','Entregado'];
        const estCl=['#fbbf24','#60a5fa','#a78bfa','#fb923c','#34d399'];
        const estCt=estNm.map(e=>pedidos.filter(p=>p.estado===e).length);
        if(window.ApexCharts&&document.getElementById('chartDonut')&&totalPed>0){
            new ApexCharts(document.getElementById('chartDonut'),{
                series:estCt,labels:estNm,
                chart:{type:'donut',height:200,fontFamily:'DM Sans, sans-serif'},
                colors:estCl,
                plotOptions:{pie:{donut:{size:'65%',labels:{show:true,total:{show:true,label:'Total',formatter:()=>totalPed,style:{fontSize:'18px',fontWeight:'700',color:'#0f172a'}}}}}},
                dataLabels:{enabled:false},legend:{show:false},stroke:{width:0}
            }).render();
            const dl=document.getElementById('donutLegend');
            if(dl) dl.innerHTML=estNm.map((e,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f1f5f9;"><div style="display:flex;align-items:center;gap:6px;"><span style="width:8px;height:8px;border-radius:50%;background:'+estCl[i]+';display:inline-block;"></span><span style="font-size:12px;color:#334155;">'+e+'</span></div><span style="font-size:12px;font-weight:700;color:#0f172a;">'+estCt[i]+'</span></div>').join('');
        } else if(document.getElementById('chartDonut')){
            document.getElementById('chartDonut').innerHTML='<div style="text-align:center;padding:50px;color:#94a3b8;font-size:13px;">Sin pedidos aún</div>';
        }
        // Tabla clientes
        const cm={};
        pedidos.forEach(p=>{if(!p.cliente)return;if(!cm[p.cliente]){cm[p.cliente]={n:p.cliente,p:0,t:0,g:0};}cm[p.cliente].p++;cm[p.cliente].t+=parseFloat(p.total_venta)||0;cm[p.cliente].g+=parseFloat(p.ganancia)||0;});
        const topC=Object.values(cm).sort((a,b)=>b.t-a.t).slice(0,5);
        const tc=document.getElementById('tbl-clientes');
        if(tc) tc.innerHTML=topC.length?topC.map((c,i)=>{const mg=c.t?Math.round(c.g/c.t*100):0;const rc=i===0?'r1':i===1?'r2':i===2?'r3':'';return '<tr><td><span class="vxd-rank '+rc+'">'+(i+1)+'</span></td><td><span class="fw-semibold" style="font-size:12px;">'+esc(c.n)+'</span></td><td style="text-align:center;">'+c.p+'</td><td class="fw-bold" style="color:#2563eb;">'+fCLP(c.t)+'</td><td><span class="vxd-pill '+(mg>=30?'vxd-grow':'vxd-warn')+'">'+mg+'%</span></td></tr>';}).join(''):'<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">Sin datos</td></tr>';
        // Tabla pedidos recientes
        const rp=[...pedidos].sort((a,b)=>new Date(b.creado_en||b.fecha||0)-new Date(a.creado_en||a.fecha||0)).slice(0,5);
        const tp=document.getElementById('tbl-pedidos');
        if(tp) tp.innerHTML=rp.length?rp.map(p=>{const bg=ESB[p.estado]||'#f1f5f9',cl=ESC[p.estado]||'#64748b';const fct=p.nro_factura?'<span style="background:#d1fae5;color:#065f46;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;">'+esc(p.nro_factura)+'</span>':'<span style="background:#fff7ed;color:#c2410c;padding:2px 7px;border-radius:5px;font-size:10px;">⚠ Sin</span>';return '<tr><td><a href="pedidos.html" style="font-weight:700;color:#2563eb;font-size:11px;text-decoration:none;">'+esc(p.folio)+'</a></td><td style="font-size:11px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(p.cliente||'—')+'</td><td class="fw-bold" style="font-size:11px;color:#2563eb;">'+fCLP(p.total_venta)+'</td><td><span style="background:'+bg+';color:'+cl+';padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;">'+esc(p.estado)+'</span></td><td>'+fct+'</td></tr>';}).join(''):'<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">Sin datos</td></tr>';
        // Tabla OCs
        const OB={'Borrador':'#f1f5f9','Confirmada':'#dbeafe','En Tránsito':'#fef9c3','Recibida':'#d1fae5','Cancelada':'#fee2e2'};
        const OC={'Borrador':'#64748b','Confirmada':'#1d4ed8','En Tránsito':'#92400e','Recibida':'#065f46','Cancelada':'#b91c1c'};
        const ro=[...ocs].sort((a,b)=>new Date(b.creado_en||b.fecha||0)-new Date(a.creado_en||a.fecha||0)).slice(0,5);
        const to=document.getElementById('tbl-ocs');
        if(to) to.innerHTML=ro.length?ro.map(o=>{const bg=OB[o.estado]||'#f1f5f9',cl=OC[o.estado]||'#64748b';return '<tr><td><a href="ordenes-compra.html" style="font-weight:700;color:#7c3aed;font-size:11px;text-decoration:none;">'+esc(o.folio)+'</a></td><td style="font-size:11px;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(o.proveedor||'—')+'</td><td class="fw-bold" style="font-size:11px;color:#475569;">'+fCLP(o.total_costo)+'</td><td><span style="background:'+bg+';color:'+cl+';padding:2px 7px;border-radius:20px;font-size:10px;font-weight:700;">'+esc(o.estado)+'</span></td></tr>';}).join(''):'<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">Sin datos</td></tr>';
    } catch(e){ console.error('Dashboard error:',e); }
})();
</script>
${DASH_SCRIPT}`;

// Inject new script + remove old dashboard-init
h = h.replace(DASH_SCRIPT, DASH_JS);

// 7. Insert new main-content
h = h.slice(0, si) + NEW_MAIN + h.slice(ei);

fs.writeFileSync(FILE, h);
console.log('✅ Dashboard financiero reconstruido — index.html actualizado');
