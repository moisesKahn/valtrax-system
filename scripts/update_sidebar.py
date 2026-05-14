#!/usr/bin/env python3
"""
VALTRAX — Sidebar + Header persistente v5
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # raíz del proyecto

# ── HEADER VALTRAX ────────────────────────────────────────────────────────────
NEW_HEADER = '''    <!--! ================================================================ !-->
    <!--! [Inicio] Header VALTRAX v1 !-->
    <!--! ================================================================ !-->
    <header class="nxl-header">
        <div class="header-wrapper">
            <div class="header-left d-flex align-items-center gap-4">
                <div class="nxl-navigation-toggle">
                    <a href="javascript:void(0);" id="menu-mini-button">
                        <i class="feather-align-left"></i>
                    </a>
                    <a href="javascript:void(0);" id="menu-expend-button" style="display:none">
                        <i class="feather-arrow-right"></i>
                    </a>
                </div>
                <a href="javascript:void(0);" class="nxl-head-mobile-toggler" id="mobile-collapse">
                    <div class="hamburger hamburger--arrowturn">
                        <div class="hamburger-box"><div class="hamburger-inner"></div></div>
                    </div>
                </a>
            </div>
            <div class="header-right ms-auto">
                <div class="d-flex align-items-center">
                    <div class="dropdown nxl-h-item">
                        <a href="javascript:void(0);" class="nxl-head-link me-0 p-1" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                            <div id="vx-avatar" style="width:36px;height:36px;border-radius:50%;background:#2563eb;color:#fff;
                                display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;
                                font-family:'DM Sans',sans-serif;letter-spacing:0.5px;cursor:pointer;user-select:none;">VX</div>
                        </a>
                        <div class="dropdown-menu dropdown-menu-end" style="min-width:200px;border-radius:12px;padding:8px 0;box-shadow:0 8px 28px rgba(0,0,0,0.13);">
                            <div class="px-3 py-2 mb-1 border-bottom">
                                <p class="mb-0 fw-semibold fs-13" id="vx-nombre-header">VALTRAX</p>
                                <p class="mb-0 text-muted fs-11" id="vx-rol-header">Administrador</p>
                            </div>
                            <a href="auth-login-cover.html" class="dropdown-item text-danger fw-semibold" style="padding:9px 16px;font-size:13px;">
                                <i class="feather-log-out me-2"></i>Cerrar sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <script>
    /* VALTRAX — Avatar con iniciales */
    (function(){
        var nombre = localStorage.getItem('vx_usuario') || 'Valtrax User';
        var partes  = nombre.trim().split(/\s+/);
        var iniciales = partes.length >= 2
            ? (partes[0][0] + partes[partes.length-1][0]).toUpperCase()
            : nombre.slice(0,2).toUpperCase();
        var av = document.getElementById('vx-avatar');
        var nh = document.getElementById('vx-nombre-header');
        if(av) av.textContent = iniciales;
        if(nh) nh.textContent = nombre;
    })();
    </script>
    <!--! ================================================================ !-->
    <!--! [Fin] Header VALTRAX v1 !-->
    <!--! ================================================================ !-->'''

PATTERN_HEADER = re.compile(
    r'<header class="nxl-header">.*?</header>',
    re.DOTALL,
)
PATTERN_HEADER_VALTRAX = re.compile(
    r'<!--!\s*={5,}\s*!-->\s*'
    r'<!--!\s*\[Inicio\]\s*Header VALTRAX[^!]*!-->'
    r'.*?'
    r'<!--!\s*\[Fin\]\s*Header VALTRAX[^!]*!-->\s*'
    r'<!--!\s*={5,}\s*!-->',
    re.DOTALL | re.IGNORECASE,
)

NEW_SIDEBAR = '''    <!--! ================================================================ !-->
    <!--! [Inicio] Menú de Navegación VALTRAX v5 !-->
    <!--! ================================================================ !-->
    <nav class="nxl-navigation">
        <div class="navbar-wrapper">
            <div class="m-header">
                <a href="index.html" class="b-brand" style="display:flex;align-items:center;text-decoration:none;">
                    <img src="assets/images/valtrax-logo.svg" alt="VALTRAX" class="logo logo-lg" style="height:34px;width:auto;display:block;" />
                    <img src="assets/images/valtrax-icono.svg" alt="VX" class="logo logo-sm" style="height:38px;width:38px;display:none;" />
                </a>
            </div>
            <div class="navbar-content">
                <ul class="nxl-navbar">

                    <!-- ── DASHBOARD ─────────────────────────────────────── -->
                    <li class="nxl-item">
                        <a class="nxl-link" href="index.html">
                            <span class="nxl-micon"><i class="feather-grid"></i></span>
                            <span class="nxl-mtext">Dashboard</span>
                        </a>
                    </li>

                    <!-- ── COMERCIAL ────────────────────────────────────── -->
                    <li class="nxl-item nxl-caption"><label>Área Comercial</label></li>

                    <li class="nxl-item nxl-hasmenu">
                        <a href="javascript:void(0);" class="nxl-link">
                            <span class="nxl-micon"><i class="feather-file-text"></i></span>
                            <span class="nxl-mtext">Cotizaciones</span><span class="nxl-arrow"><i class="feather-chevron-right"></i></span>
                        </a>
                        <ul class="nxl-submenu">
                            <li class="nxl-item"><a class="nxl-link" href="cotizaciones.html">Listado</a></li>
                            <li class="nxl-item"><a class="nxl-link" href="cotizaciones-crear.html">Nueva Cotización</a></li>
                        </ul>
                    </li>

                    <li class="nxl-item nxl-hasmenu">
                        <a href="javascript:void(0);" class="nxl-link">
                            <span class="nxl-micon"><i class="feather-users"></i></span>
                            <span class="nxl-mtext">Clientes</span><span class="nxl-arrow"><i class="feather-chevron-right"></i></span>
                        </a>
                        <ul class="nxl-submenu">
                            <li class="nxl-item"><a class="nxl-link" href="customers.html">Listado de Clientes</a></li>
                            <li class="nxl-item"><a class="nxl-link" href="customers-create.html">Nuevo Cliente</a></li>
                        </ul>
                    </li>

                    <!-- ── OPERACIONAL ──────────────────────────────────── -->
                    <li class="nxl-item nxl-caption"><label>Área Operacional</label></li>

                    <li class="nxl-item">
                        <a class="nxl-link" href="pedidos.html">
                            <span class="nxl-micon"><i class="feather-package"></i></span>
                            <span class="nxl-mtext">Pedidos</span>
                        </a>
                    </li>

                    <li class="nxl-item">
                        <a class="nxl-link" href="ordenes-compra.html">
                            <span class="nxl-micon"><i class="feather-shopping-bag"></i></span>
                            <span class="nxl-mtext">Órdenes de Compra</span>
                        </a>
                    </li>

                    <li class="nxl-item">
                        <a class="nxl-link" href="entregas.html">
                            <span class="nxl-micon"><i class="feather-check-square"></i></span>
                            <span class="nxl-mtext">Entregas</span>
                        </a>
                    </li>

                    <!-- ── HERRAMIENTAS ─────────────────────────────────── -->
                    <li class="nxl-item nxl-caption"><label>Herramientas</label></li>

                    <li class="nxl-item">
                        <a class="nxl-link" href="buscador-precios.html">
                            <span class="nxl-micon"><i class="feather-tag"></i></span>
                            <span class="nxl-mtext">Buscador de Precios</span>
                        </a>
                    </li>

                </ul>
            </div>
        </div>
    </nav>
    <script>
    /* VALTRAX — Sidebar: anti-FOUC + scroll persistence */
    (function(){
        // 1) Bloquear transiciones durante la inicialización
        document.documentElement.classList.add('valtrax-loading');
        // 2) Restaurar posición del scroll del sidebar
        var sc = sessionStorage.getItem('vltx_nav_scroll');
        if(sc){
            var el = document.querySelector('.navbar-content');
            if(el) el.scrollTop = parseInt(sc, 10);
        }
        // 3) Guardar posición al salir de la página
        window.addEventListener('pagehide', function(){
            var el = document.querySelector('.navbar-content');
            if(el) sessionStorage.setItem('vltx_nav_scroll', el.scrollTop);
        });
        // 4) Quitar clase de bloqueo cuando el JS del template haya corrido
        window.addEventListener('load', function(){
            document.documentElement.classList.remove('valtrax-loading');
        });
    })();
    </script>
    <!--! ================================================================ !-->
    <!--! [Fin] Menú de Navegación VALTRAX v4 !-->
    <!--! ================================================================ !-->'''

# Patrón que captura todo el bloque del sidebar (incluye comentarios antes y después)
# Cubre tanto "Navigation Manu" (típo del template) como variantes.
PATTERN = re.compile(
    r'<!--!\s*=+\s*!-->\s*'
    r'<!--!\s*\[Start\]\s*Navigation\s*Manu\s*!-->'
    r'.*?'
    r'<!--!\s*\[End\]\s*Navigation\s*Manu\s*!-->\s*'
    r'<!--!\s*=+\s*!-->|'
    r'<!--!\s*={5,}\s*!-->\s*'
    r'<!--!\s*\[Inicio\]\s*Menú de Navegación VALTRAX[^!]*!-->'
    r'.*?'
    r'<!--!\s*\[Fin\]\s*Menú de Navegación VALTRAX[^!]*!-->\s*'
    r'<!--!\s*={5,}\s*!-->',
    re.DOTALL | re.IGNORECASE,
)

# Patrón de respaldo: directamente el <nav class="nxl-navigation">…</nav>
PATTERN_NAV = re.compile(
    r'<nav class="nxl-navigation">.*?</nav>',
    re.DOTALL,
)

def process_file(path: Path) -> str:
    text = path.read_text(encoding='utf-8')

    if 'nxl-navigation' not in text:
        return 'skip-no-nav'

    already_nav    = 'Menú de Navegación VALTRAX v5' in text
    already_header = 'Header VALTRAX v1' in text

    if already_nav and already_header:
        return 'skip-already-updated'

    # ── Sidebar ──────────────────────────────────────────────────────────
    if not already_nav:
        new_text, n = PATTERN.subn(NEW_SIDEBAR, text, count=1)
        if n == 0:
            new_text, n = PATTERN_NAV.subn(
                NEW_SIDEBAR.split('<nav', 1)[1].rsplit('</nav>', 1)[0].join(['<nav', '</nav>']),
                text, count=1
            )
        if n == 0:
            return 'fail'
        text = new_text

    # ── Header ───────────────────────────────────────────────────────────
    if not already_header:
        new_text = PATTERN_HEADER_VALTRAX.sub(lambda m: NEW_HEADER, text, count=1)
        if new_text == text:
            new_text = PATTERN_HEADER.sub(lambda m: NEW_HEADER, text, count=1)
        if new_text != text:
            text = new_text

    path.write_text(text, encoding='utf-8')
    return 'ok'

def main():
    counts = {'ok': 0, 'skip-no-nav': 0, 'skip-already-updated': 0, 'fail': 0}
    failures = []
    for html in sorted(ROOT.glob('*.html')):
        result = process_file(html)
        counts[result] = counts.get(result, 0) + 1
        if result == 'fail':
            failures.append(html.name)

    print(f"\n{'='*60}")
    print(f"  VALTRAX — Reemplazo de sidebar")
    print(f"{'='*60}")
    for k, v in counts.items():
        print(f"  {k:25s}: {v}")
    if failures:
        print("\n  Archivos sin coincidencia:")
        for f in failures:
            print(f"    - {f}")

if __name__ == '__main__':
    main()
