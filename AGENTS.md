# Codex Instructions

Build apps inside `apps/`.

Each app must be a self-contained folder with an `index.html` file. Keep assets inside that app folder unless there is a clear shared-assets reason.

Do not add secrets, API keys, Vercel settings, DNS settings, billing details, passwords, private keys, `.env` files, or deployment tokens.

Do not add or edit `vercel.json`. The parent Oblex site handles deployment.

Make apps work by opening their `index.html` locally. When an app is ready, commit it to this repo so it can be reviewed and published to Oblex.

Optional app metadata lives in `apps/<app-name>/oblex.json`:

```json
{
  "name": "My App",
  "status": "Published",
  "notes": "A short note for the parent workshop card."
}
```

Before publishing, the parent Oblex site validates every app for `index.html`, valid optional metadata, and obvious secret files or tokens.
