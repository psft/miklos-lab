# M Lab

Build apps in the `apps/` folder.

Each app should be a self-contained folder with an `index.html` file.

```text
apps/
  hello-world/
    index.html
    oblex.json
```

Rules:

- Do not add API keys, secrets, tokens, or passwords.
- Do not add `.env`, `.env.local`, `vercel.json`, or private key files.
- Do not change Vercel, DNS, billing, or deployment settings.
- Keep each app inside its own folder.
- Make it work by opening that app's `index.html`.
- Use simple static files unless a parent helps connect a service.
- Optional: add `oblex.json` with `name`, `status`, and `notes` for the Oblex project card.

When an app is ready, commit it and push to `main`. The repo will validate your app and trigger Oblex to rebuild.

Before a parent publishes, Oblex checks that each app has `index.html`, valid optional `oblex.json`, and no obvious secret files or tokens. You can run the same kind of check here first:

```bash
npm run validate
```

Example `oblex.json`:

```json
{
  "name": "Hello World",
  "status": "Published",
  "notes": "A short note for the parent workshop card."
}
```

The parent Oblex site publishes stable URLs like:

```text
https://oblex.com/kids/m/hello-world/
```

The parent can also open the app shelf at:

```text
https://oblex.com/kids/
```

## Publishing

The parent only needs to set this GitHub Actions secret once:

```text
OBLEX_VERCEL_DEPLOY_HOOK_URL
```

After that, every push to `main` runs validation and asks Oblex to refresh the public app shelf. You do not need Vercel, DNS, billing, or API keys.
