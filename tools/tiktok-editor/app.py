#!/usr/bin/env python3
"""
🍕 TikTok Auto-Editor — Interfaccia Web
Esegui: python3 app.py
Poi apri il browser su: http://localhost:5050
"""

import os
import sys
import uuid
import shutil
import threading
import subprocess
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse

# ─── Cartelle (path assoluti) ─────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
UPLOAD_DIR = SCRIPT_DIR / "_uploads"
OUTPUT_DIR = SCRIPT_DIR / "output_tiktok"
TEMP_DIR   = SCRIPT_DIR / "_temp"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# ─── Jobs in memoria ─────────────────────────────────────────────
jobs: dict = {}  # job_id → {status, progress, message, filename, output}

# ─── Font disponibili su macOS ───────────────────────────────────
MAC_FONTS = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Geneva.ttf",
]

def find_font() -> str:
    for f in MAC_FONTS:
        if Path(f).exists():
            return f
    return ""  # ffmpeg userà il font di default

FONT_PATH = find_font()

# ─── Wrap testo lungo ────────────────────────────────────────────
def wrap_text(text: str, max_chars: int = 38) -> str:
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
    return "\\n".join(lines)

# ─── Escape testo per drawtext ───────────────────────────────────
def esc(text: str) -> str:
    text = text.replace("\\", "\\\\")
    text = text.replace("'",  "’")   # apostrofo curvo — non rompe le virgolette
    text = text.replace(":",  "\\:")
    text = text.replace("%",  "%%")
    text = text.replace("[",  "\\[").replace("]", "\\]")
    return text

# ─── Crea filter script per drawtext ─────────────────────────────
def build_filter_script(segments, script_path: Path):
    font_opt = f"fontfile={FONT_PATH}:" if FONT_PATH else ""
    parts = []
    for seg in segments:
        raw = seg["text"].strip()
        if not raw:
            continue
        text = esc(wrap_text(raw))
        s, e = seg["start"], seg["end"]
        parts.append(
            f"drawtext={font_opt}"
            f"text='{text}':"
            f"enable='between(t,{s:.2f},{e:.2f})':"
            f"fontsize=44:"
            f"fontcolor=white:"
            f"borderw=3:"
            f"bordercolor=black:"
            f"x=(w-text_w)/2:"
            f"y=h-130"
        )
    script_path.write_text(",\n".join(parts) if parts else "null", encoding="utf-8")
    # ─── Genera descrizione TikTok/Instagram ─────────────────────────
def generate_caption(segments) -> dict:
    full_text = " ".join(s["text"].strip() for s in segments if s["text"].strip())
    kw = full_text.lower()

    frasi = [f.strip() for f in full_text.replace("?","!").split("!") if f.strip()]
    hook = frasi[0] if frasi else "Guarda questo video sulla pizza!"
    if len(hook) > 100:
        hook = hook[:97] + "..."

    tags = ["#consulenzapizzaiolo","#pizza","#pizzaiolo","#impastopizza","#fooditalia"]
    if any(w in kw for w in ["napoletana","napoli"]):          tags += ["#pizzanapoletana","#naples"]
    if any(w in kw for w in ["romana","teglia"]):              tags += ["#pizzaromana","#pizzainteglia"]
    if any(w in kw for w in ["impasto","idratazione"]):        tags += ["#impasto","#tecnicapizza","#dough"]
    if any(w in kw for w in ["farina","grano","molino"]):      tags += ["#farina","#molino","#flour"]
    if any(w in kw for w in ["lievit"]):                       tags += ["#lievitazione","#fermentazione"]
    if any(w in kw for w in ["errore","sbaglia","problema"]):  tags += ["#erroripizza","#imparaconme"]
    if any(w in kw for w in ["consiglio","trucco","segreto"]): tags += ["#tipsandtricks","#consejos"]
    if any(w in kw for w in ["apri","startup","business"]):    tags += ["#businessfood","#aprireunpizzeria"]
    tags += ["#chefitaliano","#pizzeria","#ristorazione","#italianfood","#pizzalovers"]

    seen, unique = set(), []
    for t in tags:
        if t not in seen: seen.add(t); unique.append(t)
    hashtag_str = " ".join(unique[:25])

    tiktok = f"""{hook}

👇 Seguimi per altri consigli su pizza e panificazione professionale
🔗 Consulenza gratuita → consulenzapizzaiolo.it
📲 Scrivimi in DM per info

{hashtag_str}"""

    instagram = f"""✨ {hook}

Ogni video nasce da anni di esperienza con pizzaioli e molini in tutta Italia.
Hai domande sull'impasto? Scrivimi in DM — rispondo a tutti.

👇 Link in bio per la consulenza gratuita
📍 consulenzapizzaiolo.it

{hashtag_str} #italy #italianpizza"""

    viral_tips = [
        "⏰ Pubblica tra 12:00-14:00 oppure 19:00-21:00",
        "🎣 I primi 3 secondi decidono tutto — inizia con una domanda forte",
        "💬 Rispondi a TUTTI i commenti nelle prime 2 ore",
        "🔁 Posta lo stesso video su TikTok, Instagram Reels e YouTube Shorts",
        "📌 Metti il link a consulenzapizzaiolo.it nella bio TikTok",
        "🎵 Usa un audio di tendenza per più reach organico",
        "❓ Termina sempre con una domanda per stimolare commenti",
    ]

    return {"tiktok": tiktok, "instagram": instagram, "viral_tips": viral_tips}

def process_video(job_id: str, input_path: Path, quality: str):
    """Eseguito in un thread separato"""
    try:
        import whisper

        def upd(pct, msg):
            jobs[job_id]["progress"] = pct
            jobs[job_id]["message"]  = msg
            print(f"[{job_id[:8]}] {pct}% — {msg}")

        upd(5,  "Carico il modello AI Whisper...")
        model = whisper.load_model(quality)

        upd(20, "Trascrivo l'audio in italiano...")
        result = model.transcribe(str(input_path), language="it", verbose=False)

        upd(55, "Creo i sottotitoli...")

        stem        = input_path.stem
        output_name = f"TIKTOK_{stem}.mp4"
        output_path = OUTPUT_DIR / output_name

        # Salva anche SRT come file separato
        srt_name = f"TIKTOK_{stem}.srt"
        srt_out  = OUTPUT_DIR / srt_name
        with open(srt_out, "w", encoding="utf-8") as f:
            for i, seg in enumerate(result["segments"], 1):
                testo = seg["text"].strip()
                if testo:
                    ms_s = int((seg["start"] % 1)*1000); s_s = int(seg["start"]); m_s,s_s=divmod(s_s,60); h_s,m_s=divmod(m_s,60)
                    ms_e = int((seg["end"]   % 1)*1000); s_e = int(seg["end"]);   m_e,s_e=divmod(s_e,60); h_e,m_e=divmod(m_e,60)
                    f.write(f"{i}\n{h_s:02d}:{m_s:02d}:{s_s:02d},{ms_s:03d} --> {h_e:02d}:{m_e:02d}:{s_e:02d},{ms_e:03d}\n{testo}\n\n")

        # Controlla quali filtri ffmpeg sono disponibili
        ffmpeg_bin = shutil.which("ffmpeg") or "ffmpeg"
        filters_out = subprocess.run([ffmpeg_bin, "-filters"], capture_output=True, text=True)
        has_drawtext = "drawtext" in filters_out.stdout
        has_ass      = " ass " in filters_out.stdout

        print(f"[ffmpeg] path: {ffmpeg_bin}")
        print(f"[ffmpeg] drawtext: {has_drawtext} | ass: {has_ass}")

        if has_drawtext:
            upd(65, "Monto il video con i sottotitoli (drawtext)...")
            script_path = Path(f"/tmp/tiktok_{job_id[:8]}.txt")
            build_filter_script(result["segments"], script_path)
            cmd = [
                ffmpeg_bin, "-i", str(input_path.resolve()),
                "-filter_script:v", str(script_path),
                "-c:v", "libx264", "-preset", "fast", "-crf", "22",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                "-y", str(output_path),
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            try: script_path.unlink()
            except: pass
        else:
            # Fallback: converti senza sottotitoli bruciati
            upd(65, "⚠️ Filtri non disponibili — converto senza sottotitoli...")
            cmd = [
                ffmpeg_bin, "-i", str(input_path.resolve()),
                "-c:v", "libx264", "-preset", "fast", "-crf", "22",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                "-y", str(output_path),
            ]
            res = subprocess.run(cmd, capture_output=True, text=True)
            jobs[job_id]["srt"] = srt_name
            jobs[job_id]["warn"] = "ffmpeg senza filtri testo — sottotitoli nel file .srt separato"

        if res.returncode != 0:
            raise RuntimeError(f"Errore ffmpeg:\n{res.stderr[-600:]}")

        size_mb = output_path.stat().st_size / (1024 * 1024)
        jobs[job_id]["status"]  = "done"
        jobs[job_id]["output"]  = output_name
        jobs[job_id]["size_mb"] = round(size_mb, 1)
        caption_data = generate_caption(result["segments"])
        jobs[job_id]["caption"] = caption_data
        upd(100, f"✅ Video pronto! ({size_mb:.1f} MB)")

    except Exception as e:
        jobs[job_id]["status"]  = "error"
        jobs[job_id]["message"] = str(e)
        print(f"[{job_id[:8]}] ERRORE: {e}")

    finally:
        # Pulizia
        try: input_path.unlink()
        except: pass
        try: (TEMP_DIR / f"{job_id}.srt").unlink()
        except: pass


# ─── HTML della pagina ────────────────────────────────────────────
HTML = """<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>🍕 TikTok Auto-Editor</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f0f0f;color:#e5e5e5;font-family:system-ui,-apple-system,sans-serif;min-height:100vh;padding:32px 16px}
  .wrap{max-width:680px;margin:0 auto}

  /* Header */
  .header{text-align:center;margin-bottom:40px}
  .logo{display:inline-flex;align-items:center;gap:12px;margin-bottom:16px}
  .logo-icon{width:48px;height:48px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px}
  h1{font-size:28px;font-weight:700;color:#fff}
  .subtitle{color:#6b7280;font-size:15px;margin-top:6px}

  /* Upload zone */
  .upload-zone{border:2px dashed #374151;border-radius:20px;padding:48px 32px;text-align:center;cursor:pointer;transition:all .2s;background:#1a1a1a;position:relative}
  .upload-zone:hover,.upload-zone.drag{border-color:#f59e0b;background:#1f1a0d}
  .upload-icon{font-size:48px;margin-bottom:16px}
  .upload-title{font-size:18px;font-weight:600;color:#fff;margin-bottom:8px}
  .upload-sub{color:#6b7280;font-size:14px}
  .upload-btn{display:inline-block;margin-top:20px;background:#f59e0b;color:#000;font-weight:700;padding:12px 28px;border-radius:50px;font-size:15px;cursor:pointer;transition:transform .15s,background .15s}
  .upload-btn:hover{background:#fbbf24;transform:scale(1.04)}
  #file-input{display:none}
  .formats{margin-top:12px;color:#4b5563;font-size:12px}

  /* Qualità */
  .quality-row{display:flex;gap:10px;margin:24px 0;flex-wrap:wrap}
  .quality-row label{color:#9ca3af;font-size:13px;font-weight:500;margin-bottom:8px;display:block}
  .q-btn{flex:1;min-width:100px;padding:10px;border:1px solid #374151;border-radius:12px;background:#1a1a1a;color:#9ca3af;cursor:pointer;text-align:center;transition:all .2s;font-size:13px}
  .q-btn:hover{border-color:#f59e0b;color:#f59e0b}
  .q-btn.sel{border-color:#f59e0b;background:#1f1a0d;color:#f59e0b;font-weight:600}
  .q-title{font-weight:600;display:block}
  .q-sub{font-size:11px;opacity:.7}

  /* Jobs */
  .jobs{margin-top:32px;display:flex;flex-direction:column;gap:16px}
  .job{background:#1a1a1a;border:1px solid #262626;border-radius:16px;padding:20px;transition:border-color .3s}
  .job.done{border-color:#065f46}
  .job.error{border-color:#7f1d1d}
  .job-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}
  .job-icon{font-size:24px;flex-shrink:0}
  .job-name{font-weight:600;color:#fff;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
  .job-status{font-size:12px;font-weight:500;padding:3px 10px;border-radius:50px}
  .st-processing{background:#1f2937;color:#60a5fa}
  .st-done{background:#064e3b;color:#34d399}
  .st-error{background:#450a0a;color:#f87171}
  .st-queued{background:#1f1a0d;color:#fbbf24}

  /* Progress bar */
  .bar-wrap{background:#262626;border-radius:50px;height:6px;overflow:hidden;margin-bottom:8px}
  .bar{height:100%;border-radius:50px;background:linear-gradient(90deg,#f59e0b,#fbbf24);transition:width .4s ease}
  .bar.done{background:linear-gradient(90deg,#10b981,#34d399)}
  .bar.error{background:#ef4444}
  .msg{color:#6b7280;font-size:13px}

  /* Download */
  .dl-btns{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
  .dl-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:700;padding:11px 22px;border-radius:50px;text-decoration:none;font-size:14px;transition:transform .15s,opacity .15s}
  .dl-btn:hover{opacity:.9;transform:scale(1.03)}
  .dl-btn.srt{background:linear-gradient(135deg,#6366f1,#4f46e5)}
  .capcut-tip{margin-top:12px;background:#1f1a0d;border:1px solid #92400e;border-radius:12px;padding:12px 16px;font-size:13px;color:#fcd34d;line-height:1.6}

  /* Footer */
  .footer{text-align:center;margin-top:48px;color:#374151;font-size:12px}

  /* Spinner */
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{display:inline-block;animation:spin 1s linear infinite}
</style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="logo">
      <div class="logo-icon">🍕</div>
    </div>
    <h1>TikTok Auto-Editor</h1>
    <p class="subtitle">Carica il video → AI aggiunge i sottotitoli → pronto per TikTok</p>
  </div>

  <!-- Qualità AI -->
  <div>
    <label style="color:#9ca3af;font-size:13px;font-weight:500;margin-bottom:10px;display:block">🤖 Qualità trascrizione AI</label>
    <div class="quality-row">
      <div class="q-btn" data-q="tiny" onclick="setQ(this)">
        <span class="q-title">Veloce</span>
        <span class="q-sub">~30 sec · meno accurato</span>
      </div>
      <div class="q-btn sel" data-q="base" onclick="setQ(this)">
        <span class="q-title">Standard ⭐</span>
        <span class="q-sub">~1 min · buona qualità</span>
      </div>
      <div class="q-btn" data-q="small" onclick="setQ(this)">
        <span class="q-title">Alta qualità</span>
        <span class="q-sub">~2-3 min · molto accurato</span>
      </div>
      <div class="q-btn" data-q="medium" onclick="setQ(this)">
        <span class="q-title">Massima</span>
        <span class="q-sub">~5+ min · perfetto</span>
      </div>
    </div>
  </div>

  <!-- Upload zone -->
  <div class="upload-zone" id="drop-zone">
    <div class="upload-icon">🎬</div>
    <div class="upload-title">Trascina il video qui</div>
    <div class="upload-sub">oppure clicca per scegliere il file</div>
    <label class="upload-btn" for="file-input">📁 Scegli video</label>
    <input type="file" id="file-input" accept="video/*,.mp4,.mov,.avi,.mkv,.m4v" multiple/>
    <div class="formats">Formati: MP4 · MOV · AVI · MKV · M4V</div>
  </div>

  <!-- Lista job -->
  <div class="jobs" id="jobs"></div>

  <div class="footer">Consulenza Pizzaiolo — Stefano Porro · consulenzapizzaiolo.it</div>
</div>

<script>
let quality = "base";
const jobsEl = document.getElementById("jobs");
const activeJobs = {};

function setQ(el) {
  document.querySelectorAll(".q-btn").forEach(b => b.classList.remove("sel"));
  el.classList.add("sel");
  quality = el.dataset.q;
}

// Drag & drop
const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("drag"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("drag");
  [...e.dataTransfer.files].forEach(uploadFile);
});
document.getElementById("file-input").addEventListener("change", e => {
  [...e.target.files].forEach(uploadFile);
  e.target.value = "";
});
dropZone.addEventListener("click", e => {
  if (e.target.tagName !== "LABEL" && e.target.tagName !== "INPUT")
    document.getElementById("file-input").click();
});

async function uploadFile(file) {
  const jobId = Math.random().toString(36).slice(2);
  const name  = file.name;

  // Crea card
  const card = document.createElement("div");
  card.className = "job";
  card.id = `job-${jobId}`;
  card.innerHTML = `
    <div class="job-header">
      <div class="job-icon">🎥</div>
      <div class="job-name" title="${name}">${name}</div>
      <span class="job-status st-queued">In coda</span>
    </div>
    <div class="bar-wrap"><div class="bar" id="bar-${jobId}" style="width:5%"></div></div>
    <div class="msg" id="msg-${jobId}">Caricamento...</div>
  `;
  jobsEl.prepend(card);

  // Upload
  const fd = new FormData();
  fd.append("video", file);
  fd.append("quality", quality);
  fd.append("job_id", jobId);

  try {
    const res  = await fetch("/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Errore upload");
    pollJob(jobId);
  } catch(e) {
    setError(jobId, e.message);
  }
}

function pollJob(jobId) {
  const interval = setInterval(async () => {
    try {
      const res  = await fetch(`/status/${jobId}`);
      const data = await res.json();
      updateCard(jobId, data);
      if (data.status === "done" || data.status === "error") {
        clearInterval(interval);
      }
    } catch(e) { /* ignora errori di rete temporanei */ }
  }, 1200);
}

function updateCard(jobId, data) {
  const card   = document.getElementById(`job-${jobId}`);
  const bar    = document.getElementById(`bar-${jobId}`);
  const msgEl  = document.getElementById(`msg-${jobId}`);
  const stEl   = card.querySelector(".job-status");
  if (!card) return;

  bar.style.width = (data.progress || 0) + "%";

  if (data.status === "processing") {
    stEl.className = "job-status st-processing";
    stEl.textContent = "⏳ Elaborazione";
    msgEl.textContent = data.message || "...";
    bar.className = "bar";
  } else if (data.status === "done") {
    stEl.className = "job-status st-done";
    stEl.textContent = "✅ Pronto";
    msgEl.textContent = data.message || "Video pronto!";
    bar.className = "bar done";
    bar.style.width = "100%";
    card.classList.add("done");
    if (!card.querySelector(".dl-btns")) {
      const wrap = document.createElement("div");
      wrap.className = "dl-btns";

      const dlVideo = document.createElement("a");
      dlVideo.href      = `/download/${data.output}`;
      dlVideo.className = "dl-btn";
      dlVideo.innerHTML = "⬇️ Scarica Video MP4";
      dlVideo.download  = data.output;
      wrap.appendChild(dlVideo);

      if (data.srt) {
        const dlSrt = document.createElement("a");
        dlSrt.href      = `/download/${data.srt}`;
        dlSrt.className = "dl-btn srt";
        dlSrt.innerHTML = "📝 Scarica Sottotitoli SRT";
        dlSrt.download  = data.srt;
        wrap.appendChild(dlSrt);
      }

      card.appendChild(wrap);
      const pubBtn = document.createElement("button");
      pubBtn.onclick = () => pubblica(jobId);
      pubBtn.style.cssText = "width:100%;margin-top:10px;background:linear-gradient(135deg,#010101,#333);color:#fff;border:1px solid #555;padding:12px;border-radius:50px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;";
      pubBtn.innerHTML = "🚀 Pubblica automaticamente su TikTok";
      card.appendChild(pubBtn);
      if (data.srt) {
        const tip = document.createElement("div");
        tip.className = "capcut-tip";
        tip.innerHTML = `💡 <strong>Come aggiungere i sottotitoli in CapCut:</strong><br>
          1. Apri CapCut → Nuovo progetto → importa il video MP4<br>
          2. Clicca <strong>Testo</strong> → <strong>Importa sottotitoli</strong> → seleziona il file .srt<br>
          3. Personalizza lo stile → Esporta → pubblica su TikTok`;
        card.appendChild(tip);
      }
           if (data.caption) {
        const capBox = document.createElement("div");
        capBox.style.cssText = "margin-top:16px;";
        const jid = jobId;
        capBox.innerHTML = `
          <div style="color:#f59e0b;font-size:13px;font-weight:700;margin-bottom:8px;">✍️ Descrizione generata dall'AI</div>
          <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
            <button onclick="copyText('tiktok-${jid}')" style="flex:1;min-width:140px;background:#010101;color:#fff;border:1px solid #444;padding:9px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">📱 Copia per TikTok</button>
            <button onclick="copyText('ig-${jid}')" style="flex:1;min-width:140px;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;border:none;padding:9px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">📸 Copia per Instagram</button>
          </div>
          <textarea id="tiktok-${jid}" readonly rows="6" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:10px;color:#ccc;font-size:12px;resize:none;margin-bottom:8px;font-family:monospace;">${(data.caption.tiktok||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea>
          <textarea id="ig-${jid}" readonly rows="7" style="width:100%;background:#111;border:1px solid #333;border-radius:8px;padding:10px;color:#ccc;font-size:12px;resize:none;margin-bottom:10px;font-family:monospace;">${(data.caption.instagram||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</textarea>
          <div style="background:#0d2018;border:1px solid #166534;border-radius:10px;padding:12px 14px;">
            <div style="color:#4ade80;font-size:13px;font-weight:700;margin-bottom:6px;">🚀 Consigli per diventare virale</div>
            ${(data.caption.viral_tips||[]).map(t=>`<div style="color:#86efac;font-size:12px;padding:2px 0;">${t}</div>`).join('')}
          </div>`;
        card.appendChild(capBox);
      } 
    }
  } else if (data.status === "error") {
    setError(jobId, data.message);
  }
}
async function pubblica(jobId) {
  const data = await fetch(`/status/${jobId}`).then(r => r.json());
  if (!data.output) return alert("Video non ancora pronto!");
  
  const desc = data.caption ? data.caption.tiktok : "";
  const res  = await fetch(`/pubblica/${jobId}`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({description: desc})
  });
  const result = await res.json();
  if (result.ok) {
    alert("🚀 TikTok Studio si sta aprendo con il tuo video e la descrizione!");
  } else {
    alert("❌ Errore: " + (result.error || "sconosciuto"));
  }
}
function copyText(id) {
  const el = document.getElementById(id);
  el.select();
  document.execCommand("copy");
  el.style.borderColor = "#10b981";
  setTimeout(() => el.style.borderColor = "#333", 2000);
}
function copyText(id) {
  const el = document.getElementById(id);
  el.select();
  document.execCommand("copy");
  el.style.borderColor = "#10b981";
  setTimeout(() => el.style.borderColor = "#333", 2000);
}
function setError(jobId, msg) {
  const card  = document.getElementById(`job-${jobId}`);
  const bar   = document.getElementById(`bar-${jobId}`);
  const msgEl = document.getElementById(`msg-${jobId}`);
  const stEl  = card?.querySelector(".job-status");
  if (!card) return;
  if (stEl) { stEl.className = "job-status st-error"; stEl.textContent = "❌ Errore"; }
  if (bar)  { bar.className = "bar error"; bar.style.width = "100%"; }
  if (msgEl) msgEl.textContent = msg;
  card.classList.add("error");
}
</script>
</body>
</html>"""


# ─── HTTP Handler ─────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        # Log pulito
        print(f"  {self.address_string()} → {fmt % args}")

    def send_json(self, data: dict, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path

        # Pagina principale
        if path == "/" or path == "/index.html":
            body = HTML.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        # Stato job
        elif path.startswith("/status/"):
            job_id = path.split("/status/")[1]
            if job_id in jobs:
                self.send_json(jobs[job_id])
            else:
                self.send_json({"error": "Job non trovato"}, 404)

        # Download file (video o srt)
        elif path.startswith("/download/"):
            filename  = urllib.parse.unquote(path.split("/download/")[1])
            file_path = OUTPUT_DIR / filename
            if file_path.exists() and file_path.resolve().parent == OUTPUT_DIR.resolve():
                body = file_path.read_bytes()
                ext  = file_path.suffix.lower()
                mime = "text/plain" if ext == ".srt" else "video/mp4"
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                self.send_json({"error": "File non trovato"}, 404)
        else:
            self.send_json({"error": "Not found"}, 404)

    def do_POST(self):
        if self.path.startswith("/pubblica/"):
            job_id = self.path.split("/pubblica/")[1]
            length = int(self.headers.get("Content-Length", 0))
            body   = json.loads(self.rfile.read(length)) if length else {}
            description = body.get("description", "")

            if job_id not in jobs or not jobs[job_id].get("output"):
                self.send_json({"error": "Job non trovato"}, 404)
                return

            video_path = OUTPUT_DIR / jobs[job_id]["output"]

            def run_publish():
                script = SCRIPT_DIR / "pubblica.py"
                python = SCRIPT_DIR / "venv" / "bin" / "python3"
                subprocess.Popen([str(python), str(script), str(video_path), description])

            threading.Thread(target=run_publish, daemon=True).start()
            self.send_json({"ok": True})
            return
        if self.path != "/upload":
            self.send_json({"error": "Not found"}, 404)
            return

        content_type = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in content_type:
            self.send_json({"error": "Content-Type non valido"}, 400)
            return

        # Parsing multipart
        length = int(self.headers.get("Content-Length", 0))
        body   = self.rfile.read(length)

        # Estrae boundary
        boundary = None
        for part in content_type.split(";"):
            part = part.strip()
            if part.startswith("boundary="):
                boundary = part[9:].strip('"')
                break

        if not boundary:
            self.send_json({"error": "Boundary mancante"}, 400)
            return

        fields = parse_multipart(body, boundary.encode())
        job_id  = fields.get("job_id", [str(uuid.uuid4())])[0]
        quality = fields.get("quality", ["base"])[0]
        video   = fields.get("video_data")
        vname   = fields.get("video_name", ["video.mp4"])[0]

        if not video:
            self.send_json({"error": "Nessun video trovato"}, 400)
            return

        # Salva il file
        suffix    = Path(vname).suffix or ".mp4"
        save_path = UPLOAD_DIR / f"{job_id}{suffix}"
        save_path.write_bytes(video)

        # Inizializza job
        jobs[job_id] = {
            "status":   "processing",
            "progress": 2,
            "message":  "Video ricevuto, avvio elaborazione...",
            "filename": vname,
            "output":   None,
        }

        # Avvia thread
        t = threading.Thread(target=process_video, args=(job_id, save_path, quality), daemon=True)
        t.start()

        self.send_json({"ok": True, "job_id": job_id})


def parse_multipart(body: bytes, boundary: bytes) -> dict:
    """Parser multipart minimale"""
    result = {}
    delimiter = b"--" + boundary
    parts = body.split(delimiter)

    for part in parts[1:]:
        if part in (b"--\r\n", b"--", b"\r\n--"):
            continue
        if not part.startswith(b"\r\n"):
            continue
        part = part[2:]  # rimuovi \r\n iniziale

        # Separa header e body
        if b"\r\n\r\n" not in part:
            continue
        raw_headers, raw_body = part.split(b"\r\n\r\n", 1)

        # Rimuovi \r\n finale
        if raw_body.endswith(b"\r\n"):
            raw_body = raw_body[:-2]

        # Leggi Content-Disposition
        headers_str = raw_headers.decode("utf-8", errors="ignore")
        name = None
        filename = None
        for line in headers_str.splitlines():
            if "Content-Disposition" in line:
                for seg in line.split(";"):
                    seg = seg.strip()
                    if seg.startswith('name="'):
                        name = seg[6:-1]
                    elif seg.startswith('filename="'):
                        filename = seg[10:-1]

        if name is None:
            continue

        if filename:
            result["video_data"] = raw_body
            result["video_name"] = [filename]
        else:
            result[name] = [raw_body.decode("utf-8", errors="ignore")]

    return result


# ─── Avvio ───────────────────────────────────────────────────────
if __name__ == "__main__":
    PORT = 5050

    # Verifica dipendenze rapida (NO import whisper — pesa 30+ sec)
    missing = []
    if not shutil.which("ffmpeg"):
        missing.append("ffmpeg  →  brew install ffmpeg")

    # Controlla solo che il pacchetto esista senza importarlo
    venv_whisper = SCRIPT_DIR / "venv" / "lib"
    whisper_installed = any(
        (p / "whisper").is_dir()
        for p in venv_whisper.glob("python*/site-packages")
    ) if venv_whisper.exists() else False

    if not whisper_installed:
        # Fallback: controlla con pip list (veloce)
        pip = SCRIPT_DIR / "venv" / "bin" / "pip"
        if pip.exists():
            res = subprocess.run([str(pip), "show", "openai-whisper"], capture_output=True)
            whisper_installed = res.returncode == 0

    if not whisper_installed:
        missing.append("openai-whisper  →  pip install openai-whisper")

    if missing:
        print("\n❌ Dipendenze mancanti:")
        for m in missing: print(f"   • {m}")
        print("\n👉 Esegui prima:  bash setup.sh\n")
        sys.exit(1)

    print(f"""
┌─────────────────────────────────────────────────┐
│   🍕  TikTok Auto-Editor — Consulenza Pizzaiolo  │
├─────────────────────────────────────────────────┤
│   Server avviato!                               │
│                                                 │
│   👉  Apri il browser su:                       │
│       http://localhost:{PORT}                     │
│                                                 │
│   Per fermare: premi  Ctrl + C                  │
└─────────────────────────────────────────────────┘
""")

    import webbrowser
    threading.Timer(1.0, lambda: webbrowser.open(f"http://localhost:{PORT}")).start()

    server = HTTPServer(("localhost", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server fermato.")
