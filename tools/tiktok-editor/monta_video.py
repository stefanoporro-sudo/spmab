#!/usr/bin/env python3
"""
🍕 TikTok Auto-Editor — Consulenza Pizzaiolo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cosa fa:
  1. Trascrive automaticamente quello che dici (AI in italiano)
  2. Crea i sottotitoli stilizzati
  3. Li brucia nel video
  4. Salva il file pronto per TikTok in output_tiktok/

Uso:
  python3 monta_video.py                  → elabora tutti i video in video_input/
  python3 monta_video.py mio_video.mp4    → elabora un file specifico
  python3 monta_video.py --qualita large  → usa il modello AI più accurato (più lento)
"""

import os
import sys
import subprocess
import shutil
import argparse
from pathlib import Path

# ─── Colori terminal ──────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
BLUE   = "\033[94m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def log(msg, color=GREEN, bold=False):
    b = BOLD if bold else ""
    print(f"{b}{color}{msg}{RESET}")

# ─── Stile sottotitoli (puoi modificarlo) ────────────────────────
SUBTITLE_STYLE = (
    "FontName=Arial,"
    "FontSize=20,"
    "PrimaryColour=&H00FFFFFF,"   # testo bianco
    "OutlineColour=&H00000000,"   # bordo nero
    "Bold=1,"
    "Outline=2,"
    "Shadow=1,"
    "Alignment=2,"                # centro-basso
    "MarginV=50"                  # distanza dal bordo inferiore
)

VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".m4v", ".MP4", ".MOV"}

# ─── Verifica dipendenze ──────────────────────────────────────────
def check_dependencies():
    errors = []

    if not shutil.which("ffmpeg"):
        errors.append("ffmpeg non trovato → esegui: brew install ffmpeg")

    try:
        import whisper  # noqa
    except ImportError:
        errors.append("whisper non trovato → esegui: pip3 install openai-whisper")

    if errors:
        log("\n❌ Dipendenze mancanti:", RED, bold=True)
        for e in errors:
            log(f"   • {e}", RED)
        log("\n👉 Esegui prima: bash setup.sh\n", YELLOW)
        sys.exit(1)

# ─── Converti secondi → formato SRT ──────────────────────────────
def fmt_time(sec: float) -> str:
    ms = int((sec % 1) * 1000)
    s  = int(sec)
    m, s = divmod(s, 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

# ─── Trascrivi con Whisper ────────────────────────────────────────
def trascrivi(video_path: Path, temp_dir: Path, modello: str) -> Path:
    import whisper

    log(f"\n🎙️  Trascrivo audio di: {video_path.name}", BLUE)
    log(f"   (modello AI: {modello} — può volerci qualche minuto...)", YELLOW)

    model  = whisper.load_model(modello)
    result = model.transcribe(str(video_path), language="it", verbose=False)

    # Crea file .srt
    srt_path = temp_dir / f"{video_path.stem}.srt"
    with open(srt_path, "w", encoding="utf-8") as f:
        for i, seg in enumerate(result["segments"], 1):
            testo = seg["text"].strip()
            if not testo:
                continue
            f.write(f"{i}\n{fmt_time(seg['start'])} --> {fmt_time(seg['end'])}\n{testo}\n\n")

    n_righe = len(result["segments"])
    log(f"   ✅ {n_righe} segmenti trascritti → {srt_path.name}")
    return srt_path

# ─── Monta video con ffmpeg ───────────────────────────────────────
def monta(video_path: Path, srt_path: Path, output_path: Path) -> bool:
    log(f"\n🎬 Monto il video con sottotitoli...", BLUE)

    # Su Mac è necessario escaped il path per il filtro subtitles
    srt_str = str(srt_path.resolve())
    # Escape caratteri speciali nel path
    for ch in [":", "\\", "'"]:
        srt_str = srt_str.replace(ch, f"\\{ch}")

    filtro = f"subtitles='{srt_str}':force_style='{SUBTITLE_STYLE}'"

    cmd = [
        "ffmpeg",
        "-i", str(video_path),
        "-vf", filtro,
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-y",
        str(output_path),
    ]

    risultato = subprocess.run(cmd, capture_output=True, text=True)

    if risultato.returncode != 0:
        log("   ❌ Errore ffmpeg:", RED)
        # Mostra solo le ultime righe dell'errore
        for line in risultato.stderr.splitlines()[-8:]:
            print(f"   {line}")
        return False

    size_mb = output_path.stat().st_size / (1024 * 1024)
    log(f"   ✅ Video pronto! ({size_mb:.1f} MB)")
    return True

# ─── Raccoglie i file video ───────────────────────────────────────
def raccogli_video(args_files: list[str]) -> list[Path]:
    video_files = []

    if not args_files:
        # Default: cartella video_input/
        input_dir = Path("video_input")
        if not input_dir.exists():
            input_dir.mkdir(exist_ok=True)
            log(f"📁 Cartella '{input_dir}' creata. Mettici i tuoi video e riesegui lo script.", YELLOW)
            sys.exit(0)
        for ext in VIDEO_EXTENSIONS:
            video_files.extend(input_dir.glob(f"*{ext}"))
    else:
        for arg in args_files:
            p = Path(arg)
            if p.is_dir():
                for ext in VIDEO_EXTENSIONS:
                    video_files.extend(p.glob(f"*{ext}"))
            elif p.is_file() and p.suffix in VIDEO_EXTENSIONS:
                video_files.append(p)
            else:
                log(f"⚠️  Non trovato o formato non supportato: {arg}", YELLOW)

    return sorted(set(video_files))

# ─── Main ─────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="TikTok Auto-Editor")
    parser.add_argument("files", nargs="*", help="Video da elaborare (default: cartella video_input/)")
    parser.add_argument(
        "--qualita", "-q",
        choices=["tiny", "base", "small", "medium", "large"],
        default="base",
        help="Qualità trascrizione AI (default: base). 'small' o 'medium' per più accuratezza."
    )
    args = parser.parse_args()

    # Header
    print(f"\n{BOLD}{'━'*50}{RESET}")
    print(f"{BOLD}{CYAN}  🍕 TikTok Auto-Editor — Consulenza Pizzaiolo{RESET}")
    print(f"{BOLD}{'━'*50}{RESET}")

    # Verifica dipendenze
    check_dependencies()
    log("✅ Dipendenze OK")

    # Raccoglie video
    video_files = raccogli_video(args.files)

    if not video_files:
        log(f"\n❌ Nessun video trovato in video_input/", RED)
        log("   Formati supportati: .mp4 .mov .avi .mkv .m4v", YELLOW)
        sys.exit(1)

    log(f"\n📋 {len(video_files)} video trovati da elaborare:")
    for v in video_files:
        print(f"   • {v.name}")

    # Crea cartelle
    output_dir = Path("output_tiktok")
    temp_dir   = output_dir / "_temp"
    output_dir.mkdir(exist_ok=True)
    temp_dir.mkdir(exist_ok=True)

    log(f"\n📂 Output: {output_dir}/", BLUE)
    log(f"🤖 Modello AI: {args.qualita}", BLUE)

    # Elabora ogni video
    ok_count = 0
    for i, video_path in enumerate(video_files, 1):
        print(f"\n{'━'*50}")
        log(f"[{i}/{len(video_files)}] {video_path.name}", BOLD)

        try:
            srt_path    = trascrivi(video_path, temp_dir, args.qualita)
            output_path = output_dir / f"TIKTOK_{video_path.stem}.mp4"
            ok          = monta(video_path, srt_path, output_path)
            if ok:
                ok_count += 1
        except KeyboardInterrupt:
            log("\n\n⏹️  Interrotto dall'utente.", YELLOW)
            break
        except Exception as e:
            log(f"\n❌ Errore inatteso: {e}", RED)

    # Pulizia temp
    shutil.rmtree(temp_dir, ignore_errors=True)

    # Riepilogo finale
    print(f"\n{'━'*50}")
    if ok_count == len(video_files):
        log(f"🎉 Tutti i {ok_count} video elaborati con successo!", GREEN, bold=True)
    else:
        log(f"✅ {ok_count}/{len(video_files)} video completati", YELLOW, bold=True)

    log(f"📂 Trovi i video pronti in: output_tiktok/", CYAN)
    print()

if __name__ == "__main__":
    main()
