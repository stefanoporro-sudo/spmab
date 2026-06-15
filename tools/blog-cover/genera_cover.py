#!/usr/bin/env python3
"""
🍕 Generatore Copertine Blog — Consulenza Pizzaiolo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crea una copertina illustrata (stile cartoon vettoriale, palette brand)
per un articolo del blog, a partire dal titolo. Rende l'SVG in PNG via
Google Chrome headless.

Uso:
  python3 genera_cover.py "Come calcolare il food cost di una pizza"
  python3 genera_cover.py "Titolo" --subtitle "Sottotitolo" --out cover.png
"""

import sys
import argparse
import subprocess
import unicodedata
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

W, H = 1600, 840


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


def wrap(text: str, max_chars: int):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + 1 > max_chars and cur:
            lines.append(cur)
            cur = w
        else:
            cur = (cur + " " + w).strip()
    if cur:
        lines.append(cur)
    return lines


def build_svg(title: str, subtitle: str) -> str:
    # Adatta la dimensione del titolo al numero di righe
    lines = wrap(title.upper(), 17)
    if len(lines) > 4:
        lines = wrap(title.upper(), 22)
        fs = 64
    elif len(lines) >= 4:
        fs = 70
    elif len(lines) == 3:
        fs = 84
    else:
        fs = 96
    line_h = fs + 14
    start_y = 300 - (len(lines) - 1) * line_h // 2

    title_tspans = ""
    for i, ln in enumerate(lines):
        # prima riga in arancione, le altre scure (effetto "cover")
        color = "url(#orange)" if i == 0 else "#2b2b2b"
        title_tspans += (
            f'<text x="92" y="{start_y + i*line_h}" font-size="{fs}" '
            f'fill="{color}" font-weight="900" '
            f'font-family="\'Arial Black\', Arial, sans-serif" letter-spacing="1">{esc(ln)}</text>\n'
        )

    sub_y = start_y + len(lines) * line_h + 20
    subtitle_block = ""
    if subtitle:
        sub_lines = wrap(subtitle, 30)[:2]
        subtitle_block += f'<rect x="94" y="{sub_y-34}" width="110" height="8" rx="4" fill="#c8741e"/>'
        for j, sl in enumerate(sub_lines):
            subtitle_block += (
                f'<text x="94" y="{sub_y + 22 + j*42}" font-size="32" fill="#6b4a23" '
                f'font-family="Arial, sans-serif" font-weight="600">{esc(sl)}</text>\n'
            )
        chip_y = sub_y + 22 + len(sub_lines) * 42 + 30
    else:
        chip_y = sub_y + 20

    return f"""<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7eede"/><stop offset="1" stop-color="#efe0c4"/>
    </linearGradient>
    <linearGradient id="orange" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e08a2b"/><stop offset="1" stop-color="#c8741e"/>
    </linearGradient>
    <radialGradient id="coin" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#f4d06a"/><stop offset="1" stop-color="#d6a32f"/>
    </radialGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#7a5a2a" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect x="28" y="28" width="{W-56}" height="{H-56}" rx="24" fill="none" stroke="#c8741e" stroke-width="5" opacity="0.55"/>
  <g fill="#c8741e" opacity="0.06">
    <circle cx="120" cy="720" r="6"/><circle cx="170" cy="750" r="4"/><circle cx="80" cy="660" r="4"/>
  </g>

  <!-- TITOLO + SOTTOTITOLO -->
  {title_tspans}
  {subtitle_block}
  <g transform="translate(92,{chip_y})">
    <rect x="0" y="0" width="360" height="56" rx="28" fill="#2b2b2b"/>
    <text x="180" y="37" font-size="25" fill="#fff" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">consulenzapizzaiolo.it</text>
  </g>

  <!-- ILLUSTRAZIONE PIZZA -->
  <g transform="translate(1200,430)">
    <g filter="url(#sh)">
      <circle cx="0" cy="60" r="250" fill="#e9c98f"/>
      <circle cx="0" cy="60" r="250" fill="none" stroke="#c8741e" stroke-width="10"/>
      <circle cx="0" cy="60" r="200" fill="#f0b24a"/>
      <circle cx="0" cy="60" r="178" fill="#d6452f"/>
      <g fill="#3f8f3a">
        <ellipse cx="-70" cy="-10" rx="26" ry="16" transform="rotate(-30 -70 -10)"/>
        <ellipse cx="60" cy="20" rx="26" ry="16" transform="rotate(20 60 20)"/>
        <ellipse cx="-20" cy="120" rx="26" ry="16" transform="rotate(-10 -20 120)"/>
        <ellipse cx="90" cy="110" rx="24" ry="15" transform="rotate(40 90 110)"/>
      </g>
      <g fill="#fbf3df">
        <circle cx="-90" cy="60" r="34"/><circle cx="30" cy="-40" r="32"/>
        <circle cx="70" cy="70" r="30"/><circle cx="-30" cy="-10" r="28"/>
        <circle cx="-40" cy="140" r="30"/><circle cx="110" cy="0" r="24"/>
      </g>
    </g>
  </g>

  <!-- cappello chef in alto a destra -->
  <g transform="translate(1380,150)">
    <path d="M-70 40 Q-90 -40 -30 -45 Q-15 -80 30 -65 Q90 -75 80 -10 Q110 10 70 45 Z" fill="#ffffff" stroke="#c8741e" stroke-width="6"/>
    <rect x="-70" y="40" width="150" height="34" rx="8" fill="#f0ead9" stroke="#c8741e" stroke-width="6"/>
  </g>
</svg>"""


def main():
    ap = argparse.ArgumentParser(description="Generatore copertine blog")
    ap.add_argument("title", help="Titolo dell'articolo")
    ap.add_argument("--subtitle", default="", help="Sottotitolo opzionale")
    ap.add_argument("--out", default="", help="Percorso PNG di output")
    args = ap.parse_args()

    out = Path(args.out) if args.out else SCRIPT_DIR / f"{slugify(args.title)}-cover.png"
    out.parent.mkdir(parents=True, exist_ok=True)

    svg = build_svg(args.title, args.subtitle)
    svg_path = SCRIPT_DIR / "_tmp_cover.svg"
    svg_path.write_text(svg, encoding="utf-8")

    subprocess.run([
        CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        f"--screenshot={out}", f"--window-size={W},{H}",
        "--default-background-color=00000000", str(svg_path),
    ], capture_output=True)
    svg_path.unlink(missing_ok=True)

    if out.exists():
        print(f"✅ Copertina creata: {out}")
    else:
        print("❌ Errore nella generazione della copertina")
        sys.exit(1)


if __name__ == "__main__":
    main()
