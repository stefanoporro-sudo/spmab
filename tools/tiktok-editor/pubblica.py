#!/usr/bin/env python3
"""
Pubblica automaticamente su TikTok Studio
Uso: python3 pubblica.py /path/video.mp4 "descrizione"
"""
import sys, time, json
from pathlib import Path

def main():
    video_path  = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
    description = sys.argv[2] if len(sys.argv) > 2 else ""

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Esegui: pip install playwright && playwright install chromium")
        sys.exit(1)

    print(f"\n🚀 Apro TikTok Studio...")
    if video_path: print(f"📹 Video: {video_path.name}")

    with sync_playwright() as p:
        # Usa Chrome già installato con il tuo profilo (già loggato su TikTok)
        chrome_profile = Path.home() / "Library/Application Support/Google/Chrome"
        try:
            ctx = p.chromium.launch_persistent_context(
                user_data_dir=str(chrome_profile),
                headless=False,
                channel="chrome",
                args=["--start-maximized", "--no-first-run"],
            )
            page = ctx.pages[0] if ctx.pages else ctx.new_page()
        except Exception as e:
            print(f"⚠️ Chrome non trovato, uso Chromium: {e}")
            browser = p.chromium.launch(headless=False, args=["--start-maximized"])
            page = browser.new_page()

        # Vai a TikTok Studio
        page.goto("https://www.tiktok.com/tiktokstudio/content")
        print("⏳ Attendo caricamento pagina...")
        page.wait_for_load_state("networkidle", timeout=15000)
        time.sleep(2)

        # ── Upload video ──────────────────────────────────────────
        if video_path and video_path.exists():
            print("📤 Carico il video...")
            selectors_upload = [
                'input[type="file"][accept*="video"]',
                'input[type="file"]',
            ]
            uploaded = False
            for sel in selectors_upload:
                try:
                    inp = page.query_selector(sel)
                    if inp:
                        inp.set_input_files(str(video_path))
                        print("✅ Video selezionato!")
                        uploaded = True
                        break
                except: continue

            if not uploaded:
                print("⚠️ Non ho trovato il campo upload — trascinalo tu manualmente")

            # Aspetta che l'upload finisca (barra progresso)
            print("⏳ Aspetto che l'upload finisca (max 3 min)...")
            try:
                page.wait_for_selector(
                    'text=Upload complete, text=Caricamento completato, [class*="success"]',
                    timeout=180000
                )
                print("✅ Upload completato!")
            except:
                print("⚠️ Timeout upload — controlla il browser")
            time.sleep(3)

        # ── Descrizione ───────────────────────────────────────────
        if description:
            print("✍️  Inserisco la descrizione...")
            desc_selectors = [
                'div[contenteditable="true"]',
                '.public-DraftEditor-content',
                '[data-text="true"]',
                'textarea',
            ]
            for sel in desc_selectors:
                try:
                    el = page.wait_for_selector(sel, timeout=5000)
                    if el:
                        el.click()
                        time.sleep(0.5)
                        page.keyboard.press("Control+A")
                        page.keyboard.type(description, delay=10)
                        print("✅ Descrizione inserita!")
                        break
                except: continue

        print("\n" + "─"*50)
        print("✅ Tutto pronto! Controlla il browser.")
        print("👉 Clicca tu 'Pubblica' quando sei pronto.")
        print("─"*50)
        input("\nPremi INVIO per chiudere il browser...\n")

if __name__ == "__main__":
    main()