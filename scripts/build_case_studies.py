#!/usr/bin/env python3
"""Download case-study slide images and generate one HTML page per project."""
import json, os, subprocess, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / "scripts/case-studies.json").read_text())
BASE = manifest["base"]

FOOTER = """<footer class="section section--footer">
  <div class="grid grid--footer">
    <div class="block block--text" style="--area:1/2/3/11">
      <p class="footer__copy">&copy; 2026, Milo Tacheny &amp; TASH Studios.<br>All rights reserved.</p>
    </div>
    <div class="block" style="--area:1/22/3/25">
      <ul class="socials">
        <li><a href="https://www.linkedin.com/in/milo-tacheny" aria-label="LinkedIn" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.1 8.44h3.7V20H3.1V8.44zm5.86 0h3.55v1.58h.05c.5-.9 1.7-1.85 3.5-1.85 3.74 0 4.43 2.4 4.43 5.52V20h-3.7v-5.5c0-1.31-.02-3-1.85-3-1.85 0-2.13 1.42-2.13 2.9V20H8.96V8.44z"/></svg></a></li>
        <li><a href="https://www.youtube.com/@milotash" aria-label="YouTube" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.81zM10 15.02V8.98L15.2 12 10 15.02z"/></svg></a></li>
        <li><a href="https://scholar.google.com/citations?user=gMuwaoUAAAAJ&amp;hl=en&amp;oi=sra" aria-label="Google Scholar" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a4 4 0 0 1 0-5.66l2.83-2.83a4 4 0 0 1 5.66 5.66l-1.42 1.41-1.41-1.41 1.41-1.42a2 2 0 1 0-2.83-2.83l-2.83 2.83a2 2 0 0 0 0 2.83l-1.41 1.41zm2.8-2.8a4 4 0 0 1 0 5.66l-2.83 2.83a4 4 0 0 1-5.66-5.66l1.42-1.41 1.41 1.41-1.41 1.42a2 2 0 1 0 2.83 2.83l2.83-2.83a2 2 0 0 0 0-2.83l1.41-1.41z"/></svg></a></li>
      </ul>
    </div>
  </div>
</footer>"""


def page(project, files):
    slides = "\n".join(
        f'      <img class="case-slide" src="../assets/design/{project["slug"]}/{f}" '
        f'alt="{html.escape(project["title"])} — slide {i+1}" loading="lazy">'
        for i, f in enumerate(files)
    )
    title = html.escape(project["title"])
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — Milo Tacheny</title>
<link rel="icon" href="../assets/logo-signature.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to Content</a>

<header class="header">
  <a class="header__brand" href="../" aria-label="Milo Tacheny — home"><img src="../assets/logo-signature.png" alt="Milo Tacheny"></a>
  <nav class="header__nav" aria-label="Primary">
    <a href="../">Portfolio</a>
    <a href="../bio.html">Bio</a>
    <a href="../contact.html">Contact</a>
  </nav>
</header>

<main id="main" class="case-study">
  <div class="case-deck">
{slides}
  </div>
  <p class="case-back"><a href="../design.html">&larr; Back to Design Work</a></p>
</main>

{FOOTER}

</body>
</html>
"""


ok, failed = 0, []
(ROOT / "design").mkdir(exist_ok=True)
for project in manifest["projects"]:
    d = ROOT / "assets/design" / project["slug"]
    d.mkdir(parents=True, exist_ok=True)
    files = []
    for i, rel in enumerate(project["paths"]):
        ext = rel.split("?")[0].split(".")[-1].lower()
        name = f"slide-{i+1:02d}.{ext}"
        files.append(name)
        dest = d / name
        if dest.exists() and dest.stat().st_size > 0:
            ok += 1
            continue
        url = BASE + rel + "?format=1500w"
        r = subprocess.run(["curl", "-sS", "-L", "--fail", "-o", str(dest), url])
        if r.returncode == 0 and dest.exists() and dest.stat().st_size > 0:
            ok += 1
        else:
            failed.append(f'{project["slug"]} #{i+1}: {rel}')
    (ROOT / "design" / f'{project["slug"]}.html').write_text(page(project, files))
    print(f'built design/{project["slug"]}.html  ({len(files)} slides)')

print(f"\nImages OK: {ok}")
if failed:
    print(f"FAILED ({len(failed)}):")
    for f in failed:
        print("  " + f)
else:
    print("All images downloaded.")
