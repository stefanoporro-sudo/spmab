#!/usr/bin/env python3
"""
🎬 Generatore Reel arte bianca — Consulenza Pizzaiolo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gira in locale (sul Mac, non su Vercel): legge da social_posts le bozze di
Reel già scritte dal cron (/api/cron/reel, content_type='reel') a cui manca
ancora il video, monta un video verticale a schede di testo con musica di
sottofondo (nessuna voce, nessun volto). Ogni scheda mostra una FOTO VERA
pertinente al suo testo (Unsplash, stessa priorità foto-vera-prima usata per
le copertine social del sito) con il testo in overlay — stessi font/stile
(Montserrat Bold, ombra, posizione) del pannello ~/video-editor-panel.
Carica il video sul bucket Supabase 'reels' e aggiorna la riga con
video_url — pronta per la revisione/pubblicazione dal pannello /admin.

Uso:
  python3 genera_reel.py            # elabora tutte le bozze in attesa
  python3 genera_reel.py --once     # elabora solo la prima trovata
"""

import argparse
import base64
import json
import random
import subprocess
import sys
import tempfile
import time
import unicodedata
import re
from pathlib import Path
from urllib.parse import quote

import requests

SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT = SCRIPT_DIR.parent.parent
MUSIC_DIR = SCRIPT_DIR / "music"
FONT_PATH = SCRIPT_DIR / "fonts" / "Montserrat-Bold.ttf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

W, H = 1080, 1920
CARD_DURATION = 3.0
FADE = 0.35
BUCKET = "reels"
BRAND_ORANGE = "#c8741e"


def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        env[key.strip()] = val.strip().strip('"').strip("'")
    return env


ENV = load_env(REPO_ROOT / ".env.local")
SUPABASE_URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY")
UNSPLASH_KEY = ENV.get("UNSPLASH_ACCESS_KEY")
STABILITY_KEY = ENV.get("STABILITY_API_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    sys.exit("❌ NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

FONT_B64 = base64.b64encode(FONT_PATH.read_bytes()).decode() if FONT_PATH.exists() else None


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


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


def fetch_pending_reels(limit: int | None = None):
    params = {
        "content_type": "eq.reel",
        "video_url": "is.null",
        "select": "id,caption,reel_cards",
        "order": "created_at.asc",
    }
    res = requests.get(f"{SUPABASE_URL}/rest/v1/social_posts", headers=HEADERS, params=params, timeout=20)
    res.raise_for_status()
    rows = [r for r in res.json() if r.get("reel_cards")]
    return rows[:limit] if limit else rows


# ─── Foto: stessa priorità delle copertine social del sito ──────────────────
# (lib/social-image.tsx) Unsplash specifico -> Stability AI -> Unsplash generico
# -> nessuna foto (fallback a scheda a sfondo piatto, gestito da build_card_html)

def fetch_unsplash_photo(query: str) -> tuple[bytes, str] | None:
    if not UNSPLASH_KEY:
        return None
    try:
        res = requests.get(
            "https://api.unsplash.com/photos/random",
            params={"query": query, "orientation": "portrait", "content_filter": "high", "client_id": UNSPLASH_KEY},
            headers={"Accept-Version": "v1"}, timeout=10,
        )
        if not res.ok:
            return None
        img_url = (res.json().get("urls") or {}).get("regular")
        if not img_url:
            return None
        photo_res = requests.get(img_url, timeout=10)
        if not photo_res.ok:
            return None
        return photo_res.content, photo_res.headers.get("content-type", "image/jpeg")
    except requests.RequestException:
        return None


def fetch_stability_photo(prompt: str) -> tuple[bytes, str] | None:
    if not STABILITY_KEY:
        return None
    try:
        res = requests.post(
            "https://api.stability.ai/v2beta/stable-image/generate/core",
            headers={"Authorization": f"Bearer {STABILITY_KEY}", "Accept": "image/*"},
            files={"prompt": (None, prompt), "aspect_ratio": (None, "9:16"), "output_format": (None, "jpeg")},
            timeout=20,
        )
        if not res.ok:
            return None
        return res.content, res.headers.get("content-type", "image/jpeg")
    except requests.RequestException:
        return None


def get_card_photo(unsplash_query: str) -> tuple[bytes, str] | None:
    photo = fetch_unsplash_photo(unsplash_query) if unsplash_query else None
    if photo:
        return photo
    prompt = f"Cinematic {unsplash_query}, warm amber light, Italian bakery, professional food photography, no text, no logos"
    photo = fetch_stability_photo(prompt)
    if photo:
        return photo
    return fetch_unsplash_photo("italian pizza bakery dough")


def build_card_html(card_text: str, index: int, total: int, photo: tuple[bytes, str] | None) -> str:
    is_cta = index == total - 1

    fs = 68
    lines = wrap(card_text, 16)
    if len(lines) > 4:
        lines = wrap(card_text, 22)
        fs = 48
    elif len(lines) == 4:
        fs = 52
    elif len(lines) == 3:
        fs = 60
    elif len(lines) == 1:
        fs = 80

    text_html = "<br/>".join(esc(ln) for ln in lines)

    dots = "".join(
        f'<span class="dot" style="background:{BRAND_ORANGE if i <= index else "rgba(255,255,255,0.35)"}"></span>'
        for i in range(total)
    )

    if photo:
        photo_bytes, mime = photo
        b64 = base64.b64encode(photo_bytes).decode()
        background = f"background-image:url(data:{mime};base64,{b64}); background-size:cover; background-position:center;"
    else:
        # Nessuna foto disponibile (Unsplash/Stability entrambi falliti): sfondo piatto di riserva
        background = "background:linear-gradient(160deg,#f7eede,#efe0c4);"

    font_face = f"""@font-face {{
        font-family: "Montserrat";
        src: url(data:font/ttf;base64,{FONT_B64}) format("truetype");
        font-weight: 700;
      }}""" if FONT_B64 else ""

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>
  {font_face}
  * {{ box-sizing: border-box; margin:0; padding:0; }}
  html,body {{ width:{W}px; height:{H}px; overflow:hidden; }}
  .frame {{ width:{W}px; height:{H}px; position:relative; {background} font-family:'Montserrat', Arial, sans-serif; }}
  .dots {{ position:absolute; top:56px; left:0; right:0; display:flex; justify-content:center; gap:12px; z-index:3; }}
  .dot {{ width:12px; height:12px; border-radius:50%; }}
  .gradient {{ position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.72) 68%, rgba(0,0,0,0.90) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:0 68px 150px; }}
  .text {{ color:#fff; font-weight:700; font-size:{fs}px; line-height:1.22; text-align:center; text-shadow:0 2px 8px rgba(0,0,0,0.6), 0 0 2px rgba(0,0,0,0.5); }}
  .brand {{ display:flex; align-items:center; justify-content:center; gap:10px; margin-top:30px; }}
  .brand .bar {{ width:5px; height:24px; background:{BRAND_ORANGE}; border-radius:3px; }}
  .brand .label {{ color:rgba(255,255,255,0.62); font-size:20px; letter-spacing:1.2px; font-weight:700; }}
</style></head>
<body>
  <div class="frame">
    <div class="dots">{dots}</div>
    <div class="gradient">
      <div class="text">{text_html}</div>
      <div class="brand"><div class="bar"></div><div class="label">consulenzapizzaiolo.it{" · segui" if is_cta else ""}</div></div>
    </div>
  </div>
</body></html>"""


def render_png(html: str, out_path: Path):
    html_path = out_path.with_suffix(".html")
    html_path.write_text(html, encoding="utf-8")
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
         f"--screenshot={out_path}", f"--window-size={W},{H}",
         "--default-background-color=ffffffff", str(html_path)],
        capture_output=True, check=True,
    )
    html_path.unlink(missing_ok=True)
    if not out_path.exists():
        raise RuntimeError(f"Chrome non ha prodotto {out_path}")


def pick_music() -> Path | None:
    tracks = list(MUSIC_DIR.glob("*.mp3"))
    return random.choice(tracks) if tracks else None


def build_video(card_pngs: list, out_mp4: Path, tmp: Path):
    segments = []
    for i, png in enumerate(card_pngs):
        seg = tmp / f"seg{i}.mp4"
        subprocess.run(
            ["ffmpeg", "-y", "-loop", "1", "-i", str(png), "-t", str(CARD_DURATION),
             "-vf", f"fade=t=in:d={FADE},fade=t=out:st={CARD_DURATION-FADE}:d={FADE},format=yuv420p",
             "-r", "30", str(seg)],
            capture_output=True, check=True,
        )
        segments.append(seg)

    filelist = tmp / "list.txt"
    filelist.write_text("".join(f"file '{s}'\n" for s in segments), encoding="utf-8")
    concat_path = tmp / "concat.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(filelist), "-c", "copy", str(concat_path)],
        capture_output=True, check=True,
    )

    total_duration = len(card_pngs) * CARD_DURATION
    music = pick_music()
    if music:
        fade_start = max(total_duration - 1.5, 0)
        subprocess.run(
            ["ffmpeg", "-y", "-stream_loop", "-1", "-i", str(music), "-i", str(concat_path),
             "-filter_complex", f"[0:a]volume=0.9,afade=t=out:st={fade_start}:d=1.5[a]",
             "-map", "1:v", "-map", "[a]", "-shortest",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(out_mp4)],
            capture_output=True, check=True,
        )
    else:
        print("  ⚠️  Nessun brano in tools/reel-video/music/ — video senza audio")
        subprocess.run(["ffmpeg", "-y", "-i", str(concat_path), "-c", "copy", "-movflags", "+faststart", str(out_mp4)],
                        capture_output=True, check=True)


def upload_video(local_path: Path, filename: str) -> str:
    with open(local_path, "rb") as f:
        data = f.read()
    upload_headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "video/mp4",
    }
    res = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{quote(filename)}",
        headers=upload_headers, data=data, timeout=120,
    )
    if not res.ok:
        raise RuntimeError(f"Upload fallito: {res.status_code} {res.text}")
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{filename}"


def update_row(post_id: str, video_url: str):
    res = requests.patch(
        f"{SUPABASE_URL}/rest/v1/social_posts",
        headers={**HEADERS, "Prefer": "return=minimal"},
        params={"id": f"eq.{post_id}"},
        data=json.dumps({"video_url": video_url}),
        timeout=20,
    )
    res.raise_for_status()


def notify_ready(post_id: str):
    admin_password = ENV.get("ADMIN_PASSWORD")
    if not admin_password:
        return
    admin_url = f"https://www.consulenzapizzaiolo.it/admin?tab=social&edit={post_id}"
    try:
        requests.post(
            "https://www.consulenzapizzaiolo.it/api/notify",
            headers={"x-admin-password": admin_password, "Content-Type": "application/json"},
            data=json.dumps({
                "subject": "Reel pronto per la revisione",
                "html": f"<p>Il video del Reel è montato ed è pronto da rivedere e pubblicare.</p><p><a href=\"{admin_url}\">Apri nel pannello</a></p>",
            }),
            timeout=20,
        )
    except requests.RequestException as e:
        print(f"  ⚠️  Notifica di fine montaggio non inviata: {e}")


def process_reel(row: dict):
    post_id = row["id"]
    cards = row["reel_cards"]
    print(f"🎬 Montaggio reel {post_id} ({len(cards)} schede)...")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        pngs = []
        for i, card in enumerate(cards):
            query = card.get("unsplash_query", "")
            print(f"  📷 Foto scheda {i+1}/{len(cards)} ({query or 'nessuna query'})...")
            photo = get_card_photo(query)
            if not photo:
                print(f"     ⚠️  Nessuna foto trovata per '{query}', uso sfondo di riserva")
            png_path = tmp / f"card{i}.png"
            render_png(build_card_html(card["text"], i, len(cards), photo), png_path)
            pngs.append(png_path)

        out_mp4 = tmp / "reel.mp4"
        build_video(pngs, out_mp4, tmp)

        filename = f"reel-{int(time.time())}-{post_id[:8]}.mp4"
        video_url = upload_video(out_mp4, filename)

    update_row(post_id, video_url)
    notify_ready(post_id)
    print(f"  ✅ Video pronto: {video_url}")


def main():
    ap = argparse.ArgumentParser(description="Monta i Reel arte bianca in attesa di video")
    ap.add_argument("--once", action="store_true", help="Elabora solo la prima bozza trovata")
    args = ap.parse_args()

    rows = fetch_pending_reels(limit=1 if args.once else None)
    if not rows:
        print("Nessuna bozza di Reel in attesa di montaggio.")
        return

    for row in rows:
        try:
            process_reel(row)
        except Exception as e:
            print(f"  ❌ Errore sul reel {row['id']}: {e}")


if __name__ == "__main__":
    main()
