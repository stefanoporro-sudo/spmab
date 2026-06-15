#!/usr/bin/env python3
"""
🍕 Generatore PDF Ricette — Consulenza Pizzaiolo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Replica esattamente lo stile dei PDF ufficiali (logo SP, intestazione
arancione, pill categoria/livello, due colonne INGREDIENTI/PROCEDIMENTO,
footer). Rende l'HTML in PDF tramite Google Chrome headless.

Uso:
  python3 genera_ricetta.py ricetta.json
  python3 genera_ricetta.py ricetta.json --out output/mia-ricetta.pdf

Formato JSON:
{
  "title": "Pizza Napoletana",
  "category": "Pizza",
  "level": "Intermedio",
  "ingredients": [
    "Farina 1000gr",
    "Acqua 650gr",
    "Sale 25gr",
    "Lievito fresco 3gr"
  ],
  "procedure": [
    "Primo paragrafo del procedimento...",
    "Secondo paragrafo..."
  ],
  "notes": "Testo opzionale di note finali"
}
"""

import sys
import json
import base64
import subprocess
import tempfile
import re
import unicodedata
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)
LOGO_PATH = SCRIPT_DIR / "logo.png"

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# ─── Colori e stile (brand Consulenza Pizzaiolo) ─────────────────
BRAND = "#c8741e"      # arancione principale
BRAND_DARK = "#b86a1e"
INK = "#1a1a1a"        # titolo quasi nero
BODY = "#374151"       # testo grigio scuro
MUTED = "#6b7280"      # grigio chiaro


def esc(t: str) -> str:
    """Escape HTML."""
    return (t.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;"))


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)


def logo_data_uri() -> str:
    if LOGO_PATH.exists():
        b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
        return f"data:image/png;base64,{b64}"
    return ""


def build_html(recipe: dict) -> str:
    title    = esc(recipe.get("title", "Ricetta"))
    category = esc(recipe.get("category", "Pizza"))
    level    = esc(recipe.get("level", "")).strip()
    ingredients = recipe.get("ingredients", [])
    procedure   = recipe.get("procedure", [])
    notes       = recipe.get("notes", "").strip()

    ing_html = "".join(
        f'<li>{esc(str(i))}</li>' for i in ingredients if str(i).strip()
    )

    proc_html = "".join(
        f'<p>{esc(str(p))}</p>' for p in procedure if str(p).strip()
    )

    notes_html = ""
    if notes:
        notes_html = f"""
        <div class="notes">
          <div class="notes-title">Note di Stefano</div>
          <p>{esc(notes)}</p>
        </div>"""

    level_pill = ""
    if level:
        level_colors = {
            "Base":       ("#16a34a", "#dcfce7"),
            "Intermedio": ("#ca8a04", "#fef9c3"),
            "Avanzato":   ("#dc2626", "#fee2e2"),
        }
        fg, bg = level_colors.get(level, (BRAND, "#fdf0e3"))
        level_pill = f'<span class="pill" style="color:{fg};border-color:{fg};">{level}</span>'

    logo = logo_data_uri()
    logo_img = f'<img src="{logo}" class="logo"/>' if logo else ''

    return f"""<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8"/>
<style>
  @page {{ size: A4; margin: 1.3cm 1.45cm 1.4cm 1.45cm; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
    color: {BODY};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}
  .page {{ padding: 0; }}

  /* Header */
  .head {{
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 18px;
  }}
  .logo {{ width: 70px; height: auto; }}
  .head-right {{ text-align: right; line-height: 1.5; }}
  .head-name {{ color: {BRAND}; font-weight: 700; font-size: 13px; }}
  .head-line {{ color: {MUTED}; font-size: 12px; }}
  .rule {{ height: 3px; background: {BRAND}; border-radius: 2px; margin-bottom: 26px; }}

  /* Pills */
  .pills {{ display: flex; gap: 8px; margin-bottom: 12px; }}
  .pill {{
    font-size: 11px; font-weight: 600; padding: 3px 12px;
    border: 1.5px solid {BRAND}; color: {BRAND};
    border-radius: 50px; letter-spacing: .3px;
  }}

  /* Titolo */
  h1 {{
    font-size: 34px; font-weight: 800; color: {INK};
    letter-spacing: -.5px; margin-bottom: 30px; line-height: 1.1;
  }}

  /* Due colonne */
  .cols {{ display: flex; gap: 36px; align-items: flex-start; }}
  .col-left {{ width: 38%; }}
  .col-right {{ width: 62%; }}

  .sect-title {{
    color: {BRAND}; font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;
  }}

  /* Box ingredienti */
  .ing-box {{
    border: 1px solid #e5e7eb; border-radius: 12px;
    padding: 18px 20px; background: #fafafa;
  }}
  .ing-box ul {{ list-style: none; }}
  .ing-box li {{
    font-size: 14px; color: {BODY}; padding: 7px 0;
    border-bottom: 1px solid #f0f0f0;
  }}
  .ing-box li:last-child {{ border-bottom: none; }}

  /* Procedimento */
  .col-right p {{
    font-size: 13.5px; line-height: 1.7; color: {BODY};
    margin-bottom: 13px;
  }}

  /* Note */
  .notes {{
    margin-top: 18px; background: #fdf6ec; border: 1px solid #f3d9b5;
    border-radius: 12px; padding: 14px 18px;
  }}
  .notes-title {{ color: {BRAND_DARK}; font-weight: 700; font-size: 13px; margin-bottom: 6px; }}
  .notes p {{ font-size: 13px; line-height: 1.6; color: {BODY}; margin: 0; }}

  /* Footer */
  .footer {{
    margin-top: 40px;
    border-top: 1px solid #eee; padding-top: 12px;
    text-align: center; font-size: 10.5px; color: {MUTED}; line-height: 1.5;
  }}
  .footer b {{ color: {BODY}; }}
</style>
</head>
<body>
  <div class="page">
    <div class="head">
      {logo_img}
      <div class="head-right">
        <div class="head-name">Stefano Porro — Consulenza Pizzaiolo</div>
        <div class="head-line">Consulenza Pizzaiolo &amp; Panificazione</div>
        <div class="head-line">+39 393 360 2014</div>
        <div class="head-line">consulenzapizzaiolo.it</div>
      </div>
    </div>
    <div class="rule"></div>

    <div class="pills">
      <span class="pill">{category}</span>
      {level_pill}
    </div>
    <h1>{title}</h1>

    <div class="cols">
      <div class="col-left">
        <div class="sect-title">Ingredienti</div>
        <div class="ing-box"><ul>{ing_html}</ul></div>
      </div>
      <div class="col-right">
        <div class="sect-title">Procedimento</div>
        {proc_html}
        {notes_html}
      </div>
    </div>
  </div>

  <div class="footer">
    © 2026 Consulenza Pizzaiolo — <b>Stefano Porro</b><br/>
    consulenzapizzaiolo.it · stefano@consulenzapizzaiolo.it
  </div>
</body>
</html>"""


def html_to_pdf(html: str, out_path: Path):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
        tmp_html = f.name

    cmd = [
        CHROME, "--headless", "--disable-gpu", "--no-sandbox",
        f"--print-to-pdf={out_path}",
        "--no-pdf-header-footer",
        "--print-to-pdf-no-header",
        f"file://{tmp_html}",
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    Path(tmp_html).unlink(missing_ok=True)
    if not out_path.exists():
        raise RuntimeError(f"Chrome non ha generato il PDF.\n{res.stderr[-500:]}")


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 genera_ricetta.py ricetta.json [--out output/file.pdf]")
        sys.exit(1)

    json_path = Path(sys.argv[1])
    recipe = json.loads(json_path.read_text(encoding="utf-8"))

    if "--out" in sys.argv:
        out_path = Path(sys.argv[sys.argv.index("--out") + 1])
    else:
        slug = slugify(recipe.get("title", "ricetta"))
        out_path = OUTPUT_DIR / f"{slug}-consulenza-pizzaiolo.pdf"

    out_path.parent.mkdir(parents=True, exist_ok=True)
    html = build_html(recipe)
    html_to_pdf(html, out_path)

    size_kb = out_path.stat().st_size / 1024
    print(f"✅ PDF creato: {out_path}  ({size_kb:.0f} KB)")
    # Genera anche anteprima PNG
    try:
        subprocess.run(["qlmanage", "-t", "-s", "1000", "-o", str(out_path.parent), str(out_path)],
                       capture_output=True)
        print(f"🖼️  Anteprima: {out_path}.png")
    except Exception:
        pass


if __name__ == "__main__":
    main()
