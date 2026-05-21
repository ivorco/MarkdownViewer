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
npm run dist     # package installer for the current OS
```

Platform-specific packaging:

```bash
npm run dist:win    # Windows NSIS installer
npm run dist:mac    # macOS disk image
npm run dist:linux  # Linux AppImage
```

Output is written to `dist/`. On Windows you get `MarkdownViewer-0.1.0-setup.exe`.

Run the installed app with a file:

```bash
"MarkdownViewer.exe" path\to\file.md
```

To open `.md` files by double-click, set MarkdownViewer as the handler for `.md` in your OS settings (the app does not register file associations automatically).

Optional app icons live in [`assets/icon.png`](./assets/icon.png) and are used for the window and installer.

Try the sample document (includes a relative image):

```bash
npm run dev:file samples/example.md
```

See [AGENTS.md](./AGENTS.md) for architecture and implementation details.
