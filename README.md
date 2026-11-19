# Leonida Trophy Guide — GTA VI

[![GTA VI Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/toller892/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/toller892/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, as PlayStation publishes it**: official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden until earned), in `app/data/trophies.json`.
- **A guide in our own words for each trophy**, with the source of each fact named beside it (official list as carried by Exophase and PSNProfiles; KeenGamer; OutputLag; GTABase). Nothing is copied from another guide, and where no source confirms a method the guide says so instead of guessing.
- **A tracker**: tick trophies off and progress is saved in your browser (localStorage), with export to a file and import back. Filters by grade and kind (story, missable, collectibles, activities, side stories, robberies, 100% completion), text search, and an unearned-only view.
- **A spoiler setting** (on by default): story trophies stay sealed — name and description hidden — until you earn them.
- **A roadmap to the platinum** in four stages, plus the full 100% completion checklist for the gold trophy A Long Road, and a **missables** page built around the one confirmed missable (Positive Mental Attitude, Chapter 1) and save discipline, since the game has no mission replay.
- **Fully offline**: static files under `app/` with no build step and no network use at run time. All 55 trophies are single-player; there are no online trophies.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Notes

Unofficial and unaffiliated: no Rockstar logo, official artwork, box art or game screenshots anywhere. Trophy names and descriptions are PlayStation's own words, shown as published. Screenshots in `screenshots/` are real renders of this app in a headless browser.
