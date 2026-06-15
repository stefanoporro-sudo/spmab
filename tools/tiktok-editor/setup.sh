#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Setup TikTok Auto-Editor — Consulenza Pizzaiolo
#  Esegui una volta sola: bash setup.sh
# ─────────────────────────────────────────────────────────────

GREEN="\033[92m"
YELLOW="\033[93m"
RED="\033[91m"
BOLD="\033[1m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}🍕 Setup TikTok Auto-Editor${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Controlla Homebrew
echo -e "\n${YELLOW}1. Verifico Homebrew...${RESET}"
if ! command -v brew &>/dev/null; then
  echo -e "${RED}Homebrew non trovato. Lo installo...${RESET}"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  echo -e "${GREEN}✅ Homebrew già installato${RESET}"
fi

# 2. Installa ffmpeg
echo -e "\n${YELLOW}2. Installo ffmpeg...${RESET}"
if ! command -v ffmpeg &>/dev/null; then
  brew install ffmpeg
  echo -e "${GREEN}✅ ffmpeg installato${RESET}"
else
  echo -e "${GREEN}✅ ffmpeg già installato${RESET}"
fi

# 3. Controlla Python 3
echo -e "\n${YELLOW}3. Verifico Python 3...${RESET}"
if ! command -v python3 &>/dev/null; then
  brew install python3
fi
echo -e "${GREEN}✅ Python $(python3 --version)${RESET}"

# 4. Installa Whisper (AI trascrizione)
echo -e "\n${YELLOW}4. Installo Whisper AI (trascrizione automatica)...${RESET}"
python3 -m pip install openai-whisper --quiet
echo -e "${GREEN}✅ Whisper installato${RESET}"

# 5. Installa librerie Python
echo -e "\n${YELLOW}5. Installo librerie Python...${RESET}"
python3 -m pip install ffmpeg-python --quiet
echo -e "${GREEN}✅ Librerie installate${RESET}"

# 6. Crea cartelle
mkdir -p video_input output_tiktok
echo -e "${GREEN}✅ Cartelle create: video_input/ e output_tiktok/${RESET}"

echo ""
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}${BOLD}✅ Setup completato!${RESET}"
echo ""
echo -e "Come usare l'editor:"
echo -e "  ${YELLOW}1. Esegui: python3 app.py${RESET}"
echo -e "  ${YELLOW}2. Si apre il browser automaticamente${RESET}"
echo -e "  ${YELLOW}3. Trascina il video nella pagina e aspetta${RESET}"
echo -e "  ${YELLOW}4. Clicca 'Scarica' quando è pronto${RESET}"
echo ""
