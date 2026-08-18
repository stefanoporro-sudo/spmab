#!/usr/bin/env python3
"""
🎬 Generatore Reel arte bianca — Consulenza Pizzaiolo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Gira in locale (sul Mac, non su Vercel): legge da social_posts le bozze di
Reel già scritte dal cron (/api/cron/reel, content_type='reel') a cui manca
ancora il video, monta un video verticale a schede di testo con musica di
sottofondo (nessuna voce, nessun volto), lo carica sul bucket Supabase
'reels' e aggiorna la riga con video_url — pronta per la revisione/
pubblicazione dal pannello /admin.

Uso:
  python3 genera_reel.py            # elabora tutte le bozze in attesa
  python3 genera_reel.py --once     # elabora solo la prima trovata
"""

import argparse
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
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

W, H = 1080, 1920
CARD_DURATION = 3.0
FADE = 0.35
BUCKET = "reels"


def load_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        env[key.strip()] = val.strip()
    return env


ENV = load_env(REPO_ROOT / ".env.local")
SUPABASE_URL = ENV.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = ENV.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    sys.exit("❌ NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local")

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


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


def build_card_svg(text: str, index: int, total: int) -> str:
    is_hook = index == 0
    is_cta = index == total - 1

    fs = 72
    lines = wrap(text.upper() if is_hook else text, 15)
    if len(lines) > 4:
        lines = wrap(text, 20)
        fs = 52
    elif len(lines) == 4:
        fs = 56
    elif len(lines) == 3:
        fs = 64
    elif len(lines) == 1:
        fs = 84

    line_h = fs + 16
    start_y = H // 2 - (len(lines) - 1) * line_h // 2

    text_color = "#fff" if is_cta else ("url(#orange)" if is_hook else "#2b2b2b")
    tspans = ""
    for i, ln in enumerate(lines):
        tspans += (
            f'<text x="{W//2}" y="{start_y + i*line_h}" font-size="{fs}" '
            f'fill="{text_color}" font-weight="900" text-anchor="middle" '
            f'font-family="\'Arial Black\', Arial, sans-serif">{esc(ln)}</text>\n'
        )

    dots = ""
    dot_total_w = total * 28
    dot_start_x = W // 2 - dot_total_w // 2
    for i in range(total):
        filled = i <= index
        color = "#c8741e" if filled else "#00000022"
        dots += f'<circle cx="{dot_start_x + i*28 + 10}" cy="140" r="7" fill="{color}"/>'

    card_bg = (
        f'<rect width="{W}" height="{H}" fill="url(#orangebg)"/>' if is_cta
        else f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
    )

    return f"""<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7eede"/><stop offset="1" stop-color="#efe0c4"/>
    </linearGradient>
    <linearGradient id="orangebg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e08a2b"/><stop offset="1" stop-color="#c8741e"/>
    </linearGradient>
    <linearGradient id="orange" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e08a2b"/><stop offset="1" stop-color="#c8741e"/>
    </linearGradient>
  </defs>
  {card_bg}
  <rect x="36" y="36" width="{W-72}" height="{H-72}" rx="28" fill="none" stroke="{'#ffffff88' if is_cta else '#c8741e'}" stroke-width="5" opacity="0.6"/>
  {dots}
  {tspans}
  <g transform="translate({W//2 - 190},{H - 130})">
    <rect x="0" y="0" width="380" height="60" rx="30" fill="{'#ffffff' if is_cta else '#2b2b2b'}"/>
    <text x="190" y="39" font-size="26" fill="{'#c8741e' if is_cta else '#fff'}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">consulenzapizzaiolo.it</text>
  </g>
</svg>"""


def render_png(svg: str, out_path: Path):
    svg_path = out_path.with_suffix(".svg")
    svg_path.write_text(svg, encoding="utf-8")
    subprocess.run(
        [CHROME, "--headless", "--disable-gpu", "--no-sandbox",
         f"--screenshot={out_path}", f"--window-size={W},{H}",
         "--default-background-color=ffffffff", str(svg_path)],
        capture_output=True, check=True,
    )
    svg_path.unlink(missing_ok=True)
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
        for i, card_text in enumerate(cards):
            png_path = tmp / f"card{i}.png"
            render_png(build_card_svg(card_text, i, len(cards)), png_path)
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
