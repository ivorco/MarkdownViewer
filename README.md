# MarkdownViewer

Desktop Electron app for viewing Markdown (`.md`) files.

## Development

```bash
npm install
npm run dev
```

Open a specific Markdown file:

```bash
npm run dev:file README.md
```

(`electron-vite` treats bare paths as its project root — use `dev:file`, or `npm run dev -- -- path/to/file.md`.)

Opening another file while the app is running reuses the same process and opens a **new tab**:

```bash
npm run dev:file AGENTS.md
# in another terminal, while the app is still open:
npm run dev:file README.md
```

## Build

```bash
npm run build    # compile main, preload, and renderer
npm run preview  # run the production build locally
npm run dist     # package installers (electron-builder)
```

See [AGENTS.md](./AGENTS.md) for architecture and implementation details.
