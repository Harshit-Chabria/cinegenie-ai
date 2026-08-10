"""
CineGenie AI — Ollama Integration Test Suite
Tests every AI feature against the running backend.
"""
import asyncio
import json
import sys
import time
import urllib.request
import urllib.error

BASE = "http://localhost:8000/api/v1"
TOKEN = None

# ── helpers ────────────────────────────────────────────────────────────────

def req(method, path, body=None, token=None, stream=False):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=120)
        raw = resp.read()
        return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

def ok(label, status, body, key=None):
    good = status < 300 and (key is None or key in body)
    icon = "✅" if good else "❌"
    val = body.get(key, "—") if key and isinstance(body, dict) else ""
    snippet = str(val)[:80] if val else ""
    print(f"  {icon} [{status}] {label}{(' → ' + snippet) if snippet else ''}")
    return good

# ── tests ──────────────────────────────────────────────────────────────────

def test_health():
    print("\n── 1. Health ─────────────────────────────────────────────")
    s, b = req("GET", "/health".replace("/api/v1", "").replace("http://localhost:8000/api/v1", "http://localhost:8000/api"))
    # health is at /api/health not /api/v1/health
    url = "http://localhost:8000/api/health"
    r = urllib.request.Request(url)
    resp = urllib.request.urlopen(r, timeout=10)
    b = json.loads(resp.read())
    ok("Health endpoint", resp.status, b, "status")
    return True

def test_auth():
    global TOKEN
    print("\n── 2. Auth ───────────────────────────────────────────────")
    ts = int(time.time())
    # Register
    s, b = req("POST", "/auth/register", {
        "email": f"test_{ts}@cinegenie.ai",
        "username": f"tester_{ts}",
        "full_name": "Test User",
        "password": "test1234"
    })
    ok("Register", s, b, "access_token")
    if s >= 300:
        return False
    TOKEN = b["access_token"]
    # Login
    s2, b2 = req("POST", "/auth/login", {
        "email": f"test_{ts}@cinegenie.ai",
        "password": "test1234"
    })
    ok("Login", s2, b2, "access_token")
    TOKEN = b2.get("access_token", TOKEN)
    return TOKEN is not None

def test_ai_chat():
    print("\n── 3. AI Chat (SSE streaming) ────────────────────────────")
    url = f"{BASE}/ai/chat"
    body = json.dumps({
        "message": "In one sentence, what is the 180-degree rule in filmmaking?",
        "ai_mode": "director"
    }).encode()
    r = urllib.request.Request(url, data=body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
        method="POST")
    try:
        resp = urllib.request.urlopen(r, timeout=120)
        collected = ""
        error_seen = False
        for line in resp:
            line = line.decode("utf-8").strip()
            if line.startswith("data: "):
                try:
                    d = json.loads(line[6:])
                    if d.get("type") == "chunk":
                        collected += d.get("content", "")
                    elif d.get("type") == "error":
                        print(f"  ❌ SSE error: {d.get('message','')}")
                        error_seen = True
                        break
                    elif d.get("type") == "done":
                        break
                except:
                    pass
        if error_seen or not collected:
            print("  ❌ Chat: no content received")
            return False
        print(f"  ✅ [200] Chat streaming → {collected[:120]}...")
        return True
    except Exception as e:
        print(f"  ❌ Chat exception: {e}")
        return False

def test_script_gen():
    print("\n── 4. Script Generator ───────────────────────────────────")
    s, b = req("POST", "/ai/generate/script", {
        "topic": "A lone photographer discovers an ancient temple",
        "duration_minutes": 3,
        "audience": "General",
        "style": "Cinematic",
        "platform": "YouTube"
    }, token=TOKEN)
    ok("Generate script", s, b, "hook")
    ok("  → full_script field", s, b, "full_script")
    return s < 300

def test_shot_list():
    print("\n── 5. Shot List Generator ────────────────────────────────")
    s, b = req("POST", "/ai/generate/shot-list", {
        "script_or_description": "A wedding ceremony at sunset on a beach",
        "camera": "Sony A7 IV",
        "lens": "24-70mm f/2.8",
        "location": "Malibu beach",
        "crew_size": 2
    }, token=TOKEN)
    ok("Generate shot list", s, b, "shots")
    shots = b.get("shots", [])
    ok(f"  → shot count ({len(shots)} shots)", s, {"shots": shots}, "shots")
    return s < 300

def test_storyboard():
    print("\n── 6. Storyboard Generator ───────────────────────────────")
    s, b = req("POST", "/ai/generate/storyboard", {
        "script_or_description": "A detective arrives at a rain-soaked crime scene",
        "num_scenes": 3,
        "style": "Film noir",
        "mood": "Tense and mysterious"
    }, token=TOKEN)
    ok("Generate storyboard", s, b, "scenes")
    scenes = b.get("scenes", [])
    ok(f"  → scene count ({len(scenes)} scenes)", s, {"scenes": scenes}, "scenes")
    return s < 300

def test_captions():
    print("\n── 7. Caption Generator ──────────────────────────────────")
    s, b = req("POST", "/ai/generate/captions", {
        "content_description": "Behind-the-scenes of a short film production",
        "platform": "Instagram",
        "tone": "Exciting and professional",
        "include_hashtags": True,
        "include_emojis": True,
        "include_cta": True
    }, token=TOKEN)
    ok("Generate captions", s, b, "caption")
    ok("  → hashtags", s, b, "hashtags")
    return s < 300

def test_projects():
    print("\n── 8. Projects CRUD ──────────────────────────────────────")
    s, b = req("POST", "/projects/", {
        "name": "Ollama Test Project",
        "description": "Testing with local LLM",
        "shoot_type": "Commercial"
    }, token=TOKEN)
    ok("Create project", s, b, "id")
    pid = b.get("id")
    if pid:
        s2, b2 = req("GET", f"/projects/{pid}", token=TOKEN)
        ok("Get project", s2, b2, "name")
    s3, b3 = req("GET", "/projects/", token=TOKEN)
    ok("List projects", s3, b3)
    return s < 300

def test_dashboard():
    print("\n── 9. Dashboard Stats ────────────────────────────────────")
    s, b = req("GET", "/dashboard/stats", token=TOKEN)
    ok("Dashboard stats", s, b)
    stats = b.get("stats", {})
    print(f"     Projects: {stats.get('total_projects', 0)}, Clients: {stats.get('total_clients', 0)}, Conversations: {stats.get('total_conversations', 0)}")
    return s < 300

# ── main ───────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("  CineGenie AI — Ollama Integration Tests")
    print("  Model: llama3.2:3b via http://localhost:11434/v1")
    print("=" * 60)

    results = []
    results.append(("Health",         test_health()))
    results.append(("Auth",           test_auth()))

    if TOKEN:
        results.append(("AI Chat",        test_ai_chat()))
        results.append(("Script Gen",     test_script_gen()))
        results.append(("Shot List",      test_shot_list()))
        results.append(("Storyboard",     test_storyboard()))
        results.append(("Captions",       test_captions()))
        results.append(("Projects",       test_projects()))
        results.append(("Dashboard",      test_dashboard()))
    else:
        print("\n❌ Skipping AI tests — auth failed")

    print("\n" + "=" * 60)
    print("  RESULTS")
    print("=" * 60)
    passed = sum(1 for _, r in results if r)
    for name, r in results:
        print(f"  {'✅' if r else '❌'} {name}")
    print(f"\n  {passed}/{len(results)} tests passed")
    print("=" * 60)
    sys.exit(0 if passed == len(results) else 1)
