// Downloads case-study slide images and generates one HTML page per project.
// Run from the project root:  node scripts/build-case-studies.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(path.join(ROOT, 'scripts/case-studies.json'), 'utf8'));
const BASE = manifest.base;

const FOOTER = `<footer class="section section--footer">
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
</footer>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(project, files) {
  const slides = files.map((f, i) =>
    `      <img class="case-slide" src="../assets/design/${project.slug}/${f}" alt="${esc(project.title)} — slide ${i + 1}" loading="lazy">`
  ).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(project.title)} — Milo Tacheny</title>
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
${slides}
  </div>
  <p class="case-back"><a href="../design.html">&larr; Back to Design Work</a></p>
</main>

${FOOTER}

</body>
</html>
`;
}

let ok = 0, failed = [];
for (const project of manifest.projects) {
  const dir = path.join(ROOT, 'assets/design', project.slug);
  await mkdir(dir, { recursive: true });
  const files = [];
  for (let i = 0; i < project.paths.length; i++) {
    const rel = project.paths[i];
    const ext = rel.split('.').pop().split('?')[0].toLowerCase();
    const name = `slide-${String(i + 1).padStart(2, '0')}.${ext}`;
    files.push(name);
    const dest = path.join(dir, name);
    if (existsSync(dest)) { ok++; continue; }
    const url = BASE + rel + '?format=1500w';
    try {
      await run('curl', ['-sS', '-L', '--fail', '-o', dest, url]);
      ok++;
    } catch (e) {
      failed.push(`${project.slug} #${i + 1}: ${rel}`);
    }
  }
  await writeFile(path.join(ROOT, 'design', `${project.slug}.html`), page(project, files));
  console.log(`built design/${project.slug}.html  (${files.length} slides)`);
}

console.log(`\nImages OK: ${ok}`);
if (failed.length) { console.log(`FAILED (${failed.length}):`); failed.forEach(f => console.log('  ' + f)); }
else console.log('All images downloaded.');
