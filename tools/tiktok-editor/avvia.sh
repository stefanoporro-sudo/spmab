#!/bin/bash
# ─────────────────────────────────────────────
#  🍕 TikTok Auto-Editor — Avvio rapido
#  Doppio click su questo file per aprire l'editor
# ─────────────────────────────────────────────

cd "$(dirname "$0")"

# Se il venv non esiste, lo crea e installa tutto
if [ ! -d "venv" ]; then
  echo "⏳ Prima installazione — attendi qualche minuto..."
  python3 -m venv venv
  source venv/bin/activate
  pip install --quiet openai-whisper
  echo "✅ Installazione completata!"
else
  source venv/bin/activate
fi

# Controlla ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "⏳ Installo ffmpeg..."
  brew install ffmpeg
fi

echo ""
echo "🚀 Avvio TikTok Auto-Editor..."
python3 app.py
