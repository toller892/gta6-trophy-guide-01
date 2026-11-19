// Leonida Trophy Guide, handed in: this program takes the guide as it sits
// in this repository — the static app/ folder (index.html, its scripts and
// styles, and the trophy data) plus the screenshots/ folder — and lays it out
// in the output directory for grading, then writes dossier.json there with the
// vendored make.fun library, which summarises the hand-in for the judge.
// It runs on Node 22 with the standard library only, so it needs nothing
// installed and reaches for no network. vendor/makefun-frontend.ts stays
// untouched: the scorer rebuilds the dossier with its own copy and expects
// the two to match byte for byte. Keep LICENSE at the root.
//
// Try the guide first with `node serve.ts`, then open http://localhost:8080.
// The guide itself needs no server beyond static files: any static host
// serving app/ at its root works, and it runs with the network off.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
