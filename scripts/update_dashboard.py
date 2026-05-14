#!/usr/bin/env python3
"""
VALTRAX — Reemplaza el bloque <main class="nxl-container">...</main>
en index.html por el nuevo dashboard ejecutivo orientado a minería.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / 'index.html'

NEW_MAIN = '''    <!--! ================================================================ !-->
    <!--! [Inicio] Contenido Principal — Dashboard Ejecutivo VALTRAX !-->
    <!--! ================================================================ !-->

    <!-- Leaflet CSS para el mapa operacional -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>

    <main class="nxl-container">
        <div class="nxl-content">

            <!-- ── ENCABEZADO DE PÁGINA ──────────────────────────────── -->
            <div class="page-header">
                <div class="page-header-left d-flex align-items-center">
                    <div class="page-header-title">
                        <h5 class="m-b-10">Centro de Operaciones</h5>
                    </div>
                    <ul class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">Inicio</a></li>
                        <li class="breadcrumb-item">Dashboard Ejecutivo</li>
                    </ul>
                </div>
                <div class="page-header-right ms-auto">
                    <div class="page-header-right-items">
                        <div class="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                            <span class="badge bg-danger-subtle text-danger fs-12 px-3 py-2">
                                <i class="feather-alert-triangle me-1"></i>4 Pedidos críticos
                            </span>
                            <a href="pedidos.html" class="btn btn-md btn-primary">
                                <i class="feather-plus me-2"></i>Nuevo Pedido
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── CONTENIDO PRINCIPAL ──────────────────────────────── -->
            <div class="main-content">

                <!-- ╔════════ FILA 1 — KPIs OPERACIONALES ════════╗ -->
                <div class="row valtrax-kpi-row">

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-4">
                                    <div class="d-flex gap-3 align-items-center">
                                        <div class="avatar-text avatar-lg bg-primary-subtle text-primary"><i class="feather-package"></i></div>
                                        <div>
                                            <h6 class="fw-bold mb-1 text-truncate-1-line">Pedidos Activos</h6>
                                            <span class="fs-12 text-muted">En curso operacional</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pt-4">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div><div class="fs-20 fw-bold text-dark">14</div></div>
                                        <span class="fs-12 fw-semibold text-success"><i class="feather-arrow-up"></i> +3 hoy</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card valtrax-critical">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-4">
                                    <div class="d-flex gap-3 align-items-center">
                                        <div class="avatar-text avatar-lg bg-danger-subtle text-danger"><i class="feather-alert-octagon"></i></div>
                                        <div>
                                            <h6 class="fw-bold mb-1 text-truncate-1-line">Pedidos Críticos</h6>
                                            <span class="fs-12 text-muted">Requieren atención inmediata</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pt-4">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div><div class="fs-20 fw-bold text-danger">4</div></div>
                                        <span class="fs-12 fw-semibold text-danger valtrax-pulse">● URGENTE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-4">
                                    <div class="d-flex gap-3 align-items-center">
                                        <div class="avatar-text avatar-lg bg-warning-subtle text-warning"><i class="feather-clock"></i></div>
                                        <div>
                                            <h6 class="fw-bold mb-1 text-truncate-1-line">Pedidos Atrasados</h6>
                                            <span class="fs-12 text-muted">Fuera de fecha comprometida</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pt-4">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div><div class="fs-20 fw-bold text-dark">1</div></div>
                                        <span class="fs-12 fw-semibold text-warning"><i class="feather-trending-up"></i> Atención</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-4">
                                    <div class="d-flex gap-3 align-items-center">
                                        <div class="avatar-text avatar-lg bg-info-subtle text-info"><i class="feather-truck"></i></div>
                                        <div>
                                            <h6 class="fw-bold mb-1 text-truncate-1-line">En Ruta</h6>
                                            <span class="fs-12 text-muted">Despachados / en tránsito</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="pt-4">
                                    <div class="d-flex align-items-center justify-content-between">
                                        <div><div class="fs-20 fw-bold text-dark">5</div></div>
                                        <span class="fs-12 fw-semibold text-info"><i class="feather-map-pin"></i> 3 zonas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ╔════════ FILA 2 — KPIs COMERCIALES ════════╗ -->
                <div class="row">
                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div>
                                        <span class="fs-12 text-muted fw-medium">Cotizaciones Pendientes</span>
                                        <h3 class="fw-bold mt-1 mb-0">2</h3>
                                    </div>
                                    <div class="avatar-text bg-soft-primary text-primary"><i class="feather-file-text"></i></div>
                                </div>
                                <span class="fs-11 text-muted">2 enviadas · 1 borrador</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div>
                                        <span class="fs-12 text-muted fw-medium">Órdenes de Compra</span>
                                        <h3 class="fw-bold mt-1 mb-0">3</h3>
                                    </div>
                                    <div class="avatar-text bg-soft-warning text-warning"><i class="feather-shopping-bag"></i></div>
                                </div>
                                <span class="fs-11 text-muted">2 confirmadas · 1 parcial</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div>
                                        <span class="fs-12 text-muted fw-medium">Ventas del Mes</span>
                                        <h3 class="fw-bold mt-1 mb-0">$ 156,8M</h3>
                                    </div>
                                    <div class="avatar-text bg-soft-success text-success"><i class="feather-dollar-sign"></i></div>
                                </div>
                                <span class="fs-11 text-success fw-semibold"><i class="feather-arrow-up"></i> +18% vs mes anterior</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-3 col-md-6">
                        <div class="card stretch stretch-full valtrax-kpi-card">
                            <div class="card-body">
                                <div class="d-flex align-items-start justify-content-between mb-3">
                                    <div>
                                        <span class="fs-12 text-muted fw-medium">Cobertura Activa</span>
                                        <h3 class="fw-bold mt-1 mb-0">3 / 4</h3>
                                    </div>
                                    <div class="avatar-text bg-soft-info text-info"><i class="feather-globe"></i></div>
                                </div>
                                <span class="fs-11 text-muted">Norte Grande · Norte Chico · RM</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ╔════════ FILA 3 — MAPA + PEDIDOS CRÍTICOS ════════╗ -->
                <div class="row">

                    <!-- Mapa operacional -->
                    <div class="col-xxl-8">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title">Mapa Operacional</h5>
                                <div class="d-flex gap-2">
                                    <span class="badge bg-danger-subtle text-danger"><i class="feather-circle me-1"></i>Crítico</span>
                                    <span class="badge bg-warning-subtle text-warning"><i class="feather-circle me-1"></i>Alta</span>
                                    <span class="badge bg-info-subtle text-info"><i class="feather-circle me-1"></i>En Ruta</span>
                                    <span class="badge bg-success-subtle text-success"><i class="feather-circle me-1"></i>Entregado</span>
                                    <a href="logistica-mapa.html" class="btn btn-sm btn-light-brand ms-2">Vista Completa</a>
                                </div>
                            </div>
                            <div class="card-body p-0">
                                <div id="valtraxMap" style="height: 480px; width: 100%; border-radius: 0 0 12px 12px;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Pedidos críticos -->
                    <div class="col-xxl-4">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title">Pedidos Críticos</h5>
                                <a href="pedidos.html" class="fs-11 fw-semibold text-primary">Ver todos</a>
                            </div>
                            <div class="card-body p-0">
                                <div class="valtrax-critical-list">

                                    <div class="valtrax-critical-item">
                                        <div class="d-flex align-items-start gap-3">
                                            <div class="valtrax-prio-dot critica"></div>
                                            <div class="flex-grow-1">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div class="fw-semibold text-dark fs-13">PED-2026-1450</div>
                                                        <div class="fs-11 text-muted">BHP Escondida · Faena Escondida</div>
                                                    </div>
                                                    <span class="badge bg-info-subtle text-info">En Ruta</span>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2">
                                                    <span class="fs-11 text-muted"><i class="feather-map-pin me-1"></i>Norte Grande</span>
                                                    <span class="fs-11 fw-semibold text-danger">Hoy 18:00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="valtrax-critical-item">
                                        <div class="d-flex align-items-start gap-3">
                                            <div class="valtrax-prio-dot critica"></div>
                                            <div class="flex-grow-1">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div class="fw-semibold text-dark fs-13">PED-2026-1451</div>
                                                        <div class="fs-11 text-muted">Collahuasi · Pozo Almonte</div>
                                                    </div>
                                                    <span class="badge bg-primary-subtle text-primary">Despachado</span>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2">
                                                    <span class="fs-11 text-muted"><i class="feather-map-pin me-1"></i>Norte Grande</span>
                                                    <span class="fs-11 fw-semibold text-danger">Hoy</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="valtrax-critical-item">
                                        <div class="d-flex align-items-start gap-3">
                                            <div class="valtrax-prio-dot critica"></div>
                                            <div class="flex-grow-1">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div class="fw-semibold text-dark fs-13">PED-2026-1453</div>
                                                        <div class="fs-11 text-muted">Spence BHP · Sierra Gorda</div>
                                                    </div>
                                                    <span class="badge bg-warning-subtle text-warning">En Compra</span>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2">
                                                    <span class="fs-11 text-muted"><i class="feather-map-pin me-1"></i>Norte Grande</span>
                                                    <span class="fs-11 fw-semibold text-danger">Hoy</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="valtrax-critical-item">
                                        <div class="d-flex align-items-start gap-3">
                                            <div class="valtrax-prio-dot critica"></div>
                                            <div class="flex-grow-1">
                                                <div class="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div class="fw-semibold text-dark fs-13">PED-2026-1459</div>
                                                        <div class="fs-11 text-muted">Centinela · Sierra Gorda</div>
                                                    </div>
                                                    <span class="badge bg-info-subtle text-info">En Ruta</span>
                                                </div>
                                                <div class="d-flex justify-content-between mt-2">
                                                    <span class="fs-11 text-muted"><i class="feather-truck me-1"></i>Camión propio</span>
                                                    <span class="fs-11 fw-semibold text-danger">Hoy</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ╔════════ FILA 4 — DISTRIBUCIÓN POR ZONA + ÚLTIMAS ENTREGAS ════════╗ -->
                <div class="row">

                    <!-- Distribución por zona operacional -->
                    <div class="col-xxl-5">
                        <div class="card stretch stretch-full">
                            <div class="card-header">
                                <h5 class="card-title">Distribución por Zona Operacional</h5>
                            </div>
                            <div class="card-body">
                                <div class="valtrax-zone-list">

                                    <div class="valtrax-zone-item">
                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="valtrax-zone-color" style="background:#dc2626"></span>
                                                <span class="fw-semibold text-dark">Norte Grande</span>
                                            </div>
                                            <span class="fs-13 fw-bold">9 pedidos</span>
                                        </div>
                                        <div class="progress" style="height:6px;">
                                            <div class="progress-bar bg-danger" style="width:64%"></div>
                                        </div>
                                        <div class="fs-11 text-muted mt-1">Arica · Iquique · Antofagasta · Calama</div>
                                    </div>

                                    <div class="valtrax-zone-item">
                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="valtrax-zone-color" style="background:#f59e0b"></span>
                                                <span class="fw-semibold text-dark">Norte Chico</span>
                                            </div>
                                            <span class="fs-13 fw-bold">3 pedidos</span>
                                        </div>
                                        <div class="progress" style="height:6px;">
                                            <div class="progress-bar bg-warning" style="width:21%"></div>
                                        </div>
                                        <div class="fs-11 text-muted mt-1">Copiapó · La Serena · Ovalle</div>
                                    </div>

                                    <div class="valtrax-zone-item">
                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="valtrax-zone-color" style="background:#2563eb"></span>
                                                <span class="fw-semibold text-dark">Región Metropolitana</span>
                                            </div>
                                            <span class="fs-13 fw-bold">2 pedidos</span>
                                        </div>
                                        <div class="progress" style="height:6px;">
                                            <div class="progress-bar bg-primary" style="width:14%"></div>
                                        </div>
                                        <div class="fs-11 text-muted mt-1">Santiago — operaciones administrativas</div>
                                    </div>

                                    <div class="valtrax-zone-item">
                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                            <div class="d-flex align-items-center gap-2">
                                                <span class="valtrax-zone-color" style="background:#10b981"></span>
                                                <span class="fw-semibold text-dark">Centro Sur</span>
                                            </div>
                                            <span class="fs-13 fw-bold text-muted">0 pedidos</span>
                                        </div>
                                        <div class="progress" style="height:6px;">
                                            <div class="progress-bar bg-success" style="width:0%"></div>
                                        </div>
                                        <div class="fs-11 text-muted mt-1">Sin operaciones activas</div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Últimas entregas -->
                    <div class="col-xxl-7">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title">Últimas Entregas</h5>
                                <a href="entregas.html" class="fs-11 fw-semibold text-primary">Ver todas</a>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0 valtrax-table">
                                        <thead>
                                            <tr>
                                                <th>Pedido</th>
                                                <th>Cliente / Faena</th>
                                                <th>Conductor</th>
                                                <th>Estado</th>
                                                <th>Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="fw-semibold">PED-2026-1450</td>
                                                <td><div class="fw-medium">BHP Escondida</div><div class="fs-11 text-muted">Faena Escondida</div></td>
                                                <td>Hugo Carrasco</td>
                                                <td><span class="badge bg-info-subtle text-info">En Ruta</span></td>
                                                <td class="fs-12">Hoy 14:30</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-semibold">PED-2026-1451</td>
                                                <td><div class="fw-medium">Collahuasi</div><div class="fs-11 text-muted">Pozo Almonte</div></td>
                                                <td>Luis Vergara</td>
                                                <td><span class="badge bg-info-subtle text-info">En Ruta</span></td>
                                                <td class="fs-12">Hoy 16:00</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-semibold">PED-2026-1459</td>
                                                <td><div class="fw-medium">Centinela</div><div class="fs-11 text-muted">Sierra Gorda</div></td>
                                                <td>Patricio Reyes</td>
                                                <td><span class="badge bg-info-subtle text-info">En Ruta</span></td>
                                                <td class="fs-12">Hoy 12:00</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-semibold">PED-2026-1456</td>
                                                <td><div class="fw-medium">CMDIC</div><div class="fs-11 text-muted">Iquique</div></td>
                                                <td>Mario Salinas</td>
                                                <td><span class="badge bg-success-subtle text-success">Entregada</span></td>
                                                <td class="fs-12">Hoy 11:35</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-semibold">PED-2026-1457</td>
                                                <td><div class="fw-medium">BHP Escondida</div><div class="fs-11 text-muted">Bodega 4</div></td>
                                                <td>Felipe Bustos</td>
                                                <td><span class="badge bg-success-subtle text-success">Entregada</span></td>
                                                <td class="fs-12">Ayer 16:45</td>
                                            </tr>
                                            <tr>
                                                <td class="fw-semibold">PED-2026-1463</td>
                                                <td><div class="fw-medium">Tres Valles</div><div class="fs-11 text-muted">Salamanca</div></td>
                                                <td>Hugo Carrasco</td>
                                                <td><span class="badge bg-primary-subtle text-primary">Despachado</span></td>
                                                <td class="fs-12">Hoy 15:30</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- ╔════════ FILA 5 — ALERTAS ACTIVAS ════════╗ -->
                <div class="row">
                    <div class="col-12">
                        <div class="card stretch stretch-full">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="card-title"><i class="feather-bell me-2"></i>Alertas Activas</h5>
                                <span class="badge bg-danger">6 alertas</span>
                            </div>
                            <div class="card-body">
                                <div class="valtrax-alert-grid">
                                    <div class="valtrax-alert valtrax-alert-critical">
                                        <div class="d-flex gap-3">
                                            <i class="feather-alert-octagon"></i>
                                            <div>
                                                <div class="fw-semibold">PED-2026-1450 — Entrega comprometida HOY</div>
                                                <div class="fs-11 text-muted">En ruta a Faena Escondida · ETA 18:00 hrs</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="valtrax-alert valtrax-alert-critical">
                                        <div class="d-flex gap-3">
                                            <i class="feather-alert-octagon"></i>
                                            <div>
                                                <div class="fw-semibold">PED-2026-1453 — Cliente urgente</div>
                                                <div class="fs-11 text-muted">Esperando confirmación de proveedor de lubricantes</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="valtrax-alert valtrax-alert-warning">
                                        <div class="d-flex gap-3">
                                            <i class="feather-clock"></i>
                                            <div>
                                                <div class="fw-semibold">PED-2026-1454 — Sin autorización (48 hrs)</div>
                                                <div class="fs-11 text-muted">Chuquicamata · Requiere aprobación de gerencia</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="valtrax-alert valtrax-alert-warning">
                                        <div class="d-flex gap-3">
                                            <i class="feather-package"></i>
                                            <div>
                                                <div class="fw-semibold">Stock crítico</div>
                                                <div class="fs-11 text-muted">Filtros hidráulicos CAT 793 — bajo mínimo</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="valtrax-alert valtrax-alert-info">
                                        <div class="d-flex gap-3">
                                            <i class="feather-file-text"></i>
                                            <div>
                                                <div class="fw-semibold">4 cotizaciones pendientes de envío</div>
                                                <div class="fs-11 text-muted">Esta semana — área comercial</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="valtrax-alert valtrax-alert-danger">
                                        <div class="d-flex gap-3">
                                            <i class="feather-truck"></i>
                                            <div>
                                                <div class="fw-semibold">PED-2026-1459 — Camión propio en ruta</div>
                                                <div class="fs-11 text-muted">VLTX-01 · Conductor: P. Reyes</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <!-- [ Main Content ] end -->

            <!-- [ Footer ] start -->
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
            <!-- [ Footer ] end -->
        </div>
    </main>

    <!-- Leaflet JS + inicialización del mapa VALTRAX -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
    (function() {
      if (typeof L === 'undefined') return;
      const map = L.map('valtraxMap', {
        center: [-24.5, -69.5],
        zoom: 5,
        scrollWheelZoom: false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      const pedidos = [
        { folio:'PED-2026-1450', lat:-24.2625, lng:-69.0709, estado:'En Ruta',   color:'#0ea5e9', prio:'crítica', cliente:'BHP Escondida' },
        { folio:'PED-2026-1451', lat:-20.9700, lng:-68.6900, estado:'Despachado',color:'#2563eb', prio:'crítica', cliente:'Collahuasi' },
        { folio:'PED-2026-1452', lat:-23.4858, lng:-68.2275, estado:'Preparación',color:'#f59e0b',prio:'alta',   cliente:'SQM Salar' },
        { folio:'PED-2026-1453', lat:-22.7350, lng:-69.3000, estado:'En Compra', color:'#f59e0b', prio:'crítica', cliente:'Spence BHP' },
        { folio:'PED-2026-1454', lat:-22.2900, lng:-68.9000, estado:'Pendiente', color:'#94a3b8', prio:'media',   cliente:'CODELCO Chuqui' },
        { folio:'PED-2026-1455', lat:-31.7333, lng:-70.4833, estado:'Preparación',color:'#f59e0b',prio:'media',  cliente:'Los Pelambres' },
        { folio:'PED-2026-1456', lat:-20.2208, lng:-70.1431, estado:'Entregado', color:'#10b981', prio:'alta',    cliente:'CMDIC' },
        { folio:'PED-2026-1457', lat:-24.2625, lng:-69.0709, estado:'Entregado', color:'#10b981', prio:'alta',    cliente:'BHP Escondida' },
        { folio:'PED-2026-1459', lat:-22.9667, lng:-69.3667, estado:'En Ruta',   color:'#0ea5e9', prio:'crítica', cliente:'Centinela' },
        { folio:'PED-2026-1463', lat:-31.7833, lng:-70.9500, estado:'Despachado',color:'#2563eb', prio:'alta',    cliente:'Tres Valles' }
      ];

      pedidos.forEach(p => {
        const isCritical = p.prio === 'crítica';
        const icon = L.divIcon({
          className: 'valtrax-map-marker' + (isCritical ? ' is-critical' : ''),
          html: `<span style="background:${p.color}"></span>`,
          iconSize: [18,18], iconAnchor: [9,9]
        });
        L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;min-width:180px">
             <div style="font-weight:700;font-size:13px;color:#1e293b">${p.folio}</div>
             <div style="font-size:11px;color:#64748b;margin-bottom:6px">${p.cliente}</div>
             <div style="display:flex;justify-content:space-between;font-size:11px">
               <span><b>Estado:</b> ${p.estado}</span>
               <span><b>Prio:</b> ${p.prio}</span>
             </div>
           </div>`
        );
      });
    })();
    </script>

    <!--! ================================================================ !-->
    <!--! [Fin] Contenido Principal — Dashboard Ejecutivo VALTRAX !-->
    <!--! ================================================================ !-->'''

PATTERN = re.compile(
    r'<!--!\s*=+\s*!-->\s*'
    r'<!--!\s*\[Start\]\s*Main\s*Content\s*!-->'
    r'.*?'
    r'<!--!\s*\[End\]\s*Main\s*Content\s*!-->\s*'
    r'<!--!\s*=+\s*!-->',
    re.DOTALL | re.IGNORECASE,
)

def main():
    text = INDEX.read_text(encoding='utf-8')
    if 'Dashboard Ejecutivo VALTRAX' in text:
        print("ya actualizado, abortando")
        return
    new, n = PATTERN.subn(NEW_MAIN, text, count=1)
    if n == 0:
        print("FAIL: no se encontró el bloque Main Content")
        return
    INDEX.write_text(new, encoding='utf-8')
    print(f"OK: index.html actualizado (1 reemplazo)")

if __name__ == '__main__':
    main()
