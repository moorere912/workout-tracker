# Workout Tracker

A free, installable, offline-first workout tracker. No account, no subscription, no server — all
data is stored locally in your phone's browser via IndexedDB.

## Local preview

```
npx serve .
```

Then open the printed `http://localhost:...` URL. (Or use the `.claude/launch.json` config, port 5510.)

## Deploying

Push this folder to a GitHub repository and enable **Settings → Pages → Deploy from a branch**
(`main` / root). No build step required — it's plain HTML/CSS/JS.

## Data & backup

Everything (programs, exercise log, history) lives in this browser's IndexedDB only. Use
**Settings → Export Backup** periodically to save a JSON file elsewhere (e.g. Google Drive) as a
safety net, and **Import Backup** to restore it on a new device/browser.

## Program content

The built-in "Shortcut to Size" and "Shortcut to Shred" programs were transcribed by the app's
owner from their own account into this app's data format for personal use.
