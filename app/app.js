// Leonida Trophy Guide: a tracker and guide for GTA VI's 55 PS5 trophies.
// Loads the trophy list and roadmap from data/, renders the tracker with
// localStorage progress, filters and a spoiler setting, and exports/imports
// progress as a JSON file. No network use at run time beyond these local files.
const EARNED_KEY = 'gta6-trophy-checklist-v1';
const SPOILER_KEY = 'gta6-trophy-spoilers-v1';
const params = new URLSearchParams(location.search);
const DEMO_IDS = [2, 3, 8, 15, 16, 20, 21, 28, 35, 42, 53, 55];

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const unearnedEl = document.getElementById('unearnedOnly');
const spoilersEl = document.getElementById('spoilers');
const spoilerNote = document.getElementById('spoilerNote');

const data = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = data.trophies;
const sources = data.sources;

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
const demo = params.get('demo') === '1';
if (demo) {
  for (const id of DEMO_IDS) earned.add(String(id));
  document.getElementById('demoNote').hidden = false;
}
let hideSpoilers = params.get('spoilers') === 'off'
  ? false
  : (localStorage.getItem(SPOILER_KEY) ?? 'on') === 'on';
spoilersEl.checked = hideSpoilers;

function saveEarned() {
  if (demo) return;
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}
function saveSpoilers() {
  localStorage.setItem(SPOILER_KEY, hideSpoilers ? 'on' : 'off');
}
function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}
function kindLabel(kind) {
  return { story: 'Story', 'side-story': 'Side story', collectibles: 'Collectibles', activities: 'Activities', robbery: 'Robbery', misc: 'Free roam', completion: '100% completion', platinum: 'Platinum' }[kind] ?? kind;
}
function sourceLinks(trophy) {
  return (trophy.sources ?? ['official']).map((key) => {
    const s = sources[key];
    if (!s) return key;
    return s.url ? { name: s.name, url: s.url } : { name: s.name, url: null };
  });
}
function trophyMatches(trophy) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${kindLabel(trophy.kind)}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (kindEl.value === 'missable') {
    if (!trophy.missable) return false;
  } else if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) {
    return false;
  }
  if (unearnedEl.checked && earned.has(String(trophy.id))) return false;
  return true;
}
function renderProgress() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earned.has(String(t.id))) counts[t.grade] += 1;
  }
  const done = Object.values(counts).reduce((a, b) => a + b, 0);
  document.getElementById('earnedCount').textContent = done;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(done));
  document.getElementById('progressFill').style.width = `${(done / trophies.length) * 100}%`;
  document.getElementById('progressSub').textContent =
    `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
}
function renderTrophy(trophy) {
  const isEarned = earned.has(String(trophy.id));
  const sealed = hideSpoilers && trophy.kind === 'story' && !isEarned;
  const li = document.createElement('li');
  li.className = `trophy${isEarned ? ' earned' : ''}${sealed ? ' sealed' : ''}`;
  li.id = `trophy-${trophy.id}`;
  const head = document.createElement('div');
  head.className = 'head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(String(trophy.id));
    else earned.delete(String(trophy.id));
    saveEarned();
    renderAll();
  });
  const names = document.createElement('div');
  names.className = 'names';
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = sealed ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('div');
  desc.className = 'desc';
  desc.textContent = sealed ? 'Hidden on PlayStation until earned.' : trophy.description;
  const badges = document.createElement('div');
  badges.className = 'badges';
  const grade = document.createElement('span');
  grade.className = `badge ${trophy.grade}`;
  grade.textContent = gradeLabel(trophy.grade);
  badges.append(grade);
  const kind = document.createElement('span');
  kind.className = 'badge kind';
  kind.textContent = kindLabel(trophy.kind);
  badges.append(kind);
  if (trophy.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'badge hidden';
    hidden.textContent = 'Hidden on PSN';
    badges.append(hidden);
  }
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'badge missable';
    miss.textContent = 'Missable';
    badges.append(miss);
  }
  if (trophy.count) {
    const count = document.createElement('span');
    count.className = 'badge';
    count.textContent = `× ${trophy.count.toLocaleString('en-US')}`;
    badges.append(count);
  }
  names.append(name, desc, badges);
  head.append(box, names);
  li.append(head);
  const details = document.createElement('details');
  if (params.get('open') === String(trophy.id)) details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = sealed ? 'Why it is hidden' : 'Guide & sources';
  details.append(summary);
  const guide = document.createElement('p');
  guide.className = 'guide';
  guide.textContent = sealed
    ? 'This is a story trophy, hidden on PlayStation until you earn it. Earn it (or switch the spoiler setting off) to see its name, description and guide.'
    : trophy.guide;
  details.append(guide);
  if (!sealed) {
    const src = document.createElement('p');
    src.className = 'sources';
    src.textContent = 'Sources: ';
    for (const s of sourceLinks(trophy)) {
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = s.name;
        src.append(a);
      } else {
        const span = document.createElement('span');
        span.textContent = `${s.name}  `;
        src.append(span);
      }
    }
    details.append(src);
  }
  li.append(details);
  return li;
}
function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  for (const t of shown) listEl.append(renderTrophy(t));
  document.getElementById('emptyState').hidden = shown.length !== 0;
  document.getElementById('countLine').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned`;
  spoilerNote.hidden = !(hideSpoilers && shown.some((t) => t.kind === 'story' && !earned.has(String(t.id))));
}
function renderRoadmap() {
  document.getElementById('roadmapTitle').textContent = roadmap.title;
  document.getElementById('roadmapEstimate').textContent = roadmap.estimate;
  const stages = document.getElementById('stages');
  stages.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.n}: ${stage.name}`;
    const time = document.createElement('p');
    time.className = 'time';
    time.textContent = stage.time;
    const ul = document.createElement('ul');
    for (const step of stage.steps) {
      const s = document.createElement('li');
      s.textContent = step;
      ul.append(s);
    }
    li.append(h, time, ul);
    stages.append(li);
  }
  const checklist = document.getElementById('checklist');
  checklist.replaceChildren();
  for (const group of roadmap.checklist100) {
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.textContent = group.group;
    table.append(caption);
    for (const [item, need] of group.rows) {
      const tr = document.createElement('tr');
      const a = document.createElement('td');
      a.textContent = item;
      const b = document.createElement('td');
      b.textContent = need;
      tr.append(a, b);
      table.append(tr);
    }
    checklist.append(table);
  }
}
function renderMissables() {
  const missable = document.getElementById('missableList');
  missable.replaceChildren();
  for (const t of trophies.filter((t) => t.missable)) missable.append(renderTrophy(t));
}
function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const key of Object.keys(sources)) {
    const s = sources[key];
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    ul.append(li);
  }
}
function renderAll() {
  renderProgress();
  renderList();
}
function showView(view) {
  for (const section of document.querySelectorAll('.view')) {
    section.hidden = section.id !== `view-${view}`;
  }
  for (const button of document.querySelectorAll('.tabs button')) {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
}
for (const button of document.querySelectorAll('.tabs button')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
kindEl.addEventListener('change', renderList);
unearnedEl.addEventListener('change', renderList);
spoilersEl.addEventListener('change', () => {
  hideSpoilers = spoilersEl.checked;
  saveSpoilers();
  renderList();
});
document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned].map(Number).sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    const ids = Array.isArray(imported) ? imported : imported.earned;
    const next = new Set(ids.map((id) => String(Number(id))).filter((id) => trophies.some((t) => String(t.id) === id)));
    earned = next;
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a trophy progress export from this guide.');
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies in this browser?')) return;
  earned = new Set();
  saveEarned();
  renderAll();
});
renderRoadmap();
renderMissables();
renderSources();
renderAll();
const initialView = params.get('view');
if (initialView && document.getElementById(`view-${initialView}`)) showView(initialView);
if (params.get('open')) {
  const target = document.getElementById(`trophy-${params.get('open')}`);
  if (target) target.scrollIntoView({ block: 'center' });
}
