#!/usr/bin/env python3
"""
start_public.py – SoleMate Public Launcher
===========================================
Usage:  python start_public.py

What it does:
  1. Temporarily patches backend CORS to allow_origins=["*"] (safe: credentials=False)
  2. Starts FastAPI backend  (python backend/main.py)
  3. Creates cloudflared tunnel → backend  → gets public URL
  4. Patches all frontend files: localhost:8000 → cloudflare backend URL
  5. Starts Next.js frontend  (npm run dev)
  6. Creates cloudflared tunnel → frontend → gets public URL
  7. Prints shareable link
  8. On Ctrl+C: kills everything + restores ALL files to original
"""

import atexit
import re
import signal
import socket
import subprocess
import sys
import threading
import time
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────
ROOT          = Path(__file__).parent.resolve()
CLOUDFLARED   = Path(r"C:\Users\esc\Downloads\cloudflared-windows-amd64.exe")
BACKEND_PORT  = 8000
FRONTEND_PORT = 3000
LOCAL_API     = f"http://localhost:{BACKEND_PORT}"
BACKEND_MAIN  = ROOT / "backend" / "main.py"

FRONTEND_FILES = [
    ROOT / "src/app/admin/page.tsx",
    ROOT / "src/app/products/page.tsx",
    ROOT / "src/app/products/[id]/page.tsx",
    ROOT / "src/components/AdminProductTable.tsx",
    ROOT / "src/components/CheckoutForm.tsx",
    ROOT / "src/components/QuickViewModal.tsx",
]

# ── Runtime state ──────────────────────────────────────────────────────
_procs:     list = []
_originals: dict = {}   # Path → original text (restored on exit)
_exiting    = False

# ── File patch helpers ─────────────────────────────────────────────────

def _patch(path: Path, old: str, new: str) -> bool:
    """Replace first occurrence of `old` with `new` in path; saves original."""
    try:
        src = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return False
    if old not in src:
        return False
    if path not in _originals:          # keep the true original
        _originals[path] = src
    path.write_text(src.replace(old, new), encoding="utf-8")
    return True


def _patch_cors():
    """
    Temporarily replace the allow_origins list in backend/main.py with ["*"].
    Starlette does NOT support wildcard subdomains (e.g. *.trycloudflare.com),
    so we use the universal wildcard (safe because allow_credentials=False).
    """
    try:
        src = BACKEND_MAIN.read_text(encoding="utf-8")
    except FileNotFoundError:
        print("  ⚠️  backend/main.py not found – skipping CORS patch.")
        return

    # Replace the allow_origins list (multi-line) with a single ["*"]
    new_src, n = re.subn(
        r'allow_origins\s*=\s*\[.*?\]',
        'allow_origins=["*"]',
        src,
        count=1,
        flags=re.DOTALL,
    )
    if n and new_src != src:
        if BACKEND_MAIN not in _originals:
            _originals[BACKEND_MAIN] = src
        BACKEND_MAIN.write_text(new_src, encoding="utf-8")
        print("  📝 backend/main.py  (CORS → allow_origins=[\"*\"])")
    else:
        print("  ℹ️  backend/main.py  CORS not patched (pattern not found)")


# ── Cleanup ────────────────────────────────────────────────────────────

def _restore():
    if not _originals:
        return
    print("\n🔄  Restoring files …")
    for path, content in list(_originals.items()):
        try:
            path.write_text(content, encoding="utf-8")
            print(f"    ✅ {path.relative_to(ROOT)}")
        except Exception as err:
            print(f"    ⚠️  {path.name}: {err}")
    _originals.clear()


def _kill_all():
    for p in _procs:
        try:
            p.terminate()
        except Exception:
            pass


def _shutdown():
    global _exiting
    if _exiting:
        return
    _exiting = True
    print("\n\n🛑  Shutting down …")
    _kill_all()
    _restore()
    print("👋  Done. All services stopped, files restored.\n")


atexit.register(_shutdown)
signal.signal(signal.SIGINT, lambda s, f: (_shutdown(), sys.exit(0)))

# ── Process helpers ────────────────────────────────────────────────────
_WIN = subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0


def _spawn(cmd, cwd=None) -> subprocess.Popen:
    p = subprocess.Popen(
        cmd, cwd=str(cwd) if cwd else None,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding="utf-8", errors="replace",
        creationflags=_WIN,
    )
    _procs.append(p)
    return p


def _spawn_cf(port: int) -> subprocess.Popen:
    """Cloudflared prints tunnel URL to stderr."""
    p = subprocess.Popen(
        [str(CLOUDFLARED), "tunnel", "--url", f"http://localhost:{port}"],
        stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
        text=True, encoding="utf-8", errors="replace",
        creationflags=_WIN,
    )
    _procs.append(p)
    return p


def _drain(proc: subprocess.Popen, label: str):
    """Print process stdout in a daemon thread."""
    def _go():
        for line in proc.stdout:
            s = line.rstrip()
            if s:
                print(f"  [{label}] {s}")
    threading.Thread(target=_go, daemon=True).start()


def _wait_port(port: int, timeout: int = 60) -> bool:
    end = time.time() + timeout
    while time.time() < end:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=1):
                return True
        except OSError:
            time.sleep(0.5)
    return False


def _cf_url(proc: subprocess.Popen, timeout: int = 55) -> str:
    """Read cloudflared stderr until we find the public URL."""
    pat = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")
    end = time.time() + timeout
    while time.time() < end:
        line = proc.stderr.readline()
        if not line:
            time.sleep(0.1)
            continue
        m = pat.search(line)
        if m:
            return m.group()
    return ""


def _die(msg: str):
    print(f"\n❌  {msg}")
    _shutdown()
    sys.exit(1)


# ── Main ───────────────────────────────────────────────────────────────

def main():
    if not CLOUDFLARED.exists():
        _die(f"cloudflared not found:\n    {CLOUDFLARED}\n"
             "Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/")

    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║        🚀  SoleMate  —  Public Launcher                 ║")
    print("╚══════════════════════════════════════════════════════════╝")

    # ── 1. Patch backend CORS ────────────────────────────────────────
    print("\n[1/6] Patching backend CORS …")
    _patch_cors()

    # ── 2. Start FastAPI backend ─────────────────────────────────────
    print(f"\n[2/6] Starting FastAPI backend …")
    if _wait_port(BACKEND_PORT, timeout=1):
        print(f"      ⚠️  Port {BACKEND_PORT} already open — reusing running backend.")
    else:
        bp = _spawn([sys.executable, str(BACKEND_MAIN)], cwd=ROOT / "backend")
        _drain(bp, "backend")
        print(f"      Waiting for backend on :{BACKEND_PORT} …")
        if not _wait_port(BACKEND_PORT, timeout=30):
            _die("Backend did not start within 30 s.")
    print("      ✅ Backend ready.")

    # ── 3. Backend cloudflared tunnel ────────────────────────────────
    print("\n[3/6] Opening backend tunnel (cloudflared) …")
    cfb = _spawn_cf(BACKEND_PORT)
    backend_url = _cf_url(cfb)
    if not backend_url:
        _die("Timed out waiting for backend cloudflare URL.")
    print(f"      ✅ {backend_url}")

    # ── 4. Patch frontend API URLs ────────────────────────────────────
    print(f"\n[4/6] Patching frontend files: localhost:8000 → cloudflare …")
    patched = 0
    for f in FRONTEND_FILES:
        if _patch(f, LOCAL_API, backend_url):
            print(f"      📝 {f.relative_to(ROOT)}")
            patched += 1
    if patched == 0:
        print("      ℹ️  No files contained localhost:8000 (already patched?)")
    else:
        print(f"      ✅ {patched} file(s) patched.")

    # ── 5. Start Next.js frontend ─────────────────────────────────────
    print("\n[5/6] Starting Next.js frontend …")
    npm = (["cmd", "/c", "npm", "run", "dev"]
           if sys.platform == "win32" else ["npm", "run", "dev"])
    fp = _spawn(npm, cwd=ROOT)
    _drain(fp, "frontend")
    print(f"      Waiting for frontend on :{FRONTEND_PORT} …")
    if not _wait_port(FRONTEND_PORT, timeout=90):
        _die("Frontend did not start within 90 s.")
    print("      ✅ Frontend ready.")

    # ── 6. Frontend cloudflared tunnel ───────────────────────────────
    print("\n[6/6] Opening frontend tunnel (cloudflared) …")
    cff = _spawn_cf(FRONTEND_PORT)
    frontend_url = _cf_url(cff)
    if not frontend_url:
        _die("Timed out waiting for frontend cloudflare URL.")
    print(f"      ✅ {frontend_url}")

    # ── Summary ───────────────────────────────────────────────────────
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print(f"  ✅ Backend  : {backend_url}")
    print(f"  ✅ Frontend : {frontend_url}")
    print()
    print(f"  📌 Share this link → {frontend_url}")
    print("╚══════════════════════════════════════════════════════════╝")
    print("\n  ⌨️  Press Ctrl+C to stop all services and restore files.\n")

    # Keep alive
    while True:
        time.sleep(5)


if __name__ == "__main__":
    main()
