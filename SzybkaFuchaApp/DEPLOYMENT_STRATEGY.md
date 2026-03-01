# Deployment Strategy

## Recommended architecture

Use a single git repository with:

- source content under `SzybkaFuchaApp/blog`
- deployment handled by GitHub Actions
- GitHub Pages publishing from the workflow artifact

This keeps OpenClaw scoped to the project folder while avoiding root-level deploy artifacts.

## Why the old model was problematic

The previous deployment copied generated files into the parent repo root:

- `/Users/simacbook/.openclaw/workspace/index.html`
- `/Users/simacbook/.openclaw/workspace/blog/*.html`
- `/Users/simacbook/.openclaw/workspace/images/*`

That created ambiguity between:

- project source files
- local preview output
- live deploy files

It also made future automations more conflict-prone.

## New deployment flow

1. OpenClaw edits source files in `SzybkaFuchaApp/blog`
2. `daily-post.sh` runs `npm run build`
3. `daily-post.sh` commits only `SzybkaFuchaApp`
4. `daily-post.sh` pushes to `master`
5. GitHub Actions builds `SzybkaFuchaApp/blog/public`
6. GitHub Pages deploys the uploaded artifact

## Required repository setting

In GitHub repository settings:

- Pages source must be set to `GitHub Actions`

Without that setting change, the new workflow files will exist but Pages will not switch automatically.
