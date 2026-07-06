# CANN-Bench static export

This folder is a standalone frontend build. It includes only the browser files
needed by the UI: `index.html`, `assets/`, and static images/icons.

For a quick offline UI preview, double-click `index.html`.

For the most accurate behavior, open it through a local static server. Live API
pages need HTTP because the app requests `/api` and `/healthz`.

Quick start:

```bash
cd export
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

Notes:

- No `node_modules` are required.
- Static UI assets are bundled in this folder.
- If opened by double-clicking, static pages can render, but live data pages
  will show request errors unless a backend is available.
- If opened through a static server, live data pages still need the backend API
  available at the same host under `/api` and `/healthz`.
