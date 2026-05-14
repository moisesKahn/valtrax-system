#!/usr/bin/env python3
"""Actualiza el favicon en todos los HTML a logo-abbr.png (icono VALTRAX)"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NEW_FAVICON = '<link rel="shortcut icon" type="image/svg+xml" href="assets/images/valtrax-icono.svg" />'
PAT = re.compile(r'<link\s+rel="shortcut icon"[^>]+>', re.IGNORECASE)

updated = 0
for html in sorted(ROOT.glob("*.html")):
    text = html.read_text(encoding="utf-8")
    new_text, n = PAT.subn(NEW_FAVICON, text, count=1)
    if n:
        html.write_text(new_text, encoding="utf-8")
        updated += 1

print(f"Favicon actualizado en {updated} archivos.")
