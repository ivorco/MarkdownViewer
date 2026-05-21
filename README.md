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

## Build

```bash
npm run build    # compile main, preload, and renderer
npm run preview  # run the production build locally
npm run dist     # package installers (electron-builder)
```

See [AGENTS.md](./AGENTS.md) for architecture and implementation details.
