# MarkdownViewer — Agent Guide

This document describes the MarkdownViewer application for AI agents and contributors. Use it as the source of truth when implementing, extending, or debugging the project.

## Overview

MarkdownViewer is a **desktop Electron application** that opens and renders Markdown (`.md`) files in a dedicated viewer window. Users can open files from a file manager, drag-and-drop, or the command line.

| Requirement | Choice |
| --- | --- |
| UI | React |
| Language | TypeScript |
| Runtime | Electron |

## OS Compatibility

The app does **not** register file associations or default-app handlers. Opening a `.md` file by double-click works only when the user has already configured the OS to launch MarkdownViewer for that extension (e.g. “Open with” or default app settings). The app’s job is to accept the file path the OS provides and display the content.

| OS | Support level | Notes |
| --- | --- | --- |
| **Windows** | Primary | Full viewer support. Opens `.md` files when the OS passes a path via `process.argv` or the `open-file` event (CLI, or double-click after the user sets MarkdownViewer as the handler manually). No installer or runtime file-association registration. |
| **macOS** | Supported | Same path-based opening via `process.argv` and `open-file`. User configures default app or “Open with” manually if they want double-click launch. |
| **Linux** | Supported | Same path-based opening via `process.argv` and `open-file`. Behavior depends on desktop environment; user configures the default handler manually if desired. |

## Goals

1. **Open** `.md` **files** — from a file manager (when the OS is configured to use this app), drag-and-drop, or CLI (e.g. `MarkdownViewer path/to/file.md`).
2. **Render Markdown** — readable HTML with sensible typography, code blocks, links, and images.
3. **Single-instance behavior** — opening another file while the app is running should reuse the existing process and open a new tab.
4. **Minimal, focused UI** — content-first; no heavy editor features in v1 (view-only).

## Non-Goals (v1)

- Full WYSIWYG or source editor
- Cloud sync, accounts, or collaboration
- Registering or modifying OS file associations, default apps, or protocol handlers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Main process (Node/Electron)                                │
│  - App lifecycle, single-instance lock                       │
│  - argv / open-file parsing                                  │
│  - Create BrowserWindow(s), IPC to renderer                  │
│  - Read .md from disk (or pass path to renderer)             │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (contextBridge)
┌──────────────────────────▼──────────────────────────────────┐
│  Preload script (TypeScript)                                 │
│  - Expose safe, typed APIs to renderer                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Renderer (React + TypeScript)                               │
│  - Markdown display, theme, scroll, optional TOC             │
│  - Request file content via preload API                      │
└─────────────────────────────────────────────────────────────┘
```

### Process responsibilities

| Layer | Responsibilities |
| --- | --- |
| **Main** | `app.whenReady`, `BrowserWindow`, `second-instance` / single-instance, parse `process.argv` and `open-file`, `ipcMain` handlers for `read-file`, window management |
| **Preload** | `contextBridge.exposeInMainWorld` with a small typed surface (e.g. `window.markdownViewer.readFile(path)`) |
| **Renderer** | React app: load markdown, render with a markdown library, handle relative assets (images) where feasible |

### wSecurity defaults

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` where compatible
- No arbitrary Node APIs in the renderer; all file I/O through IPC
- Validate file paths in main process (existence, extension `.md`, resolve symlinks safely)

## Planned Project Layout

```
MarkdownViewer/
├── AGENTS.md                 # This file
├── README.md                 # User-facing readme
├── package.json
├── electron-builder.yml      # Cross-platform packaging
├── tsconfig.json
├── tsconfig.main.json        # Main + preload
├── tsconfig.renderer.json    # React renderer
├── src/
│   ├── main/
│   │   ├── index.ts          # Entry, window factory
│   │   ├── ipc.ts            # IPC handlers
│   │   └── argv.ts           # CLI / open-file parsing
│   ├── preload/
│   │   └── index.ts          # contextBridge API
│   └── renderer/
│       ├── index.html
│       ├── main.tsx          # React entry
│       ├── App.tsx
│       ├── components/       # Viewer, ErrorState, etc.
│       └── styles/           # Global + markdown typography
├── assets/                   # App icons
└── scripts/                  # build/dev helpers if needed
```

Adjust paths only if the repo already uses a different convention (e.g. `electron-vite`); keep the three-process split.

## Technology Choices

| Concern | Recommendation |
| --- | --- |
| Bundler | **electron-vite** or **Vite + electron-builder** — fast HMR for React, separate main/preload/renderer builds |
| Markdown | **marked** or **markdown-it** + **DOMPurify** for sanitization before `dangerouslySetInnerHTML` |
| Styling | CSS modules or plain CSS; system-friendly light/dark via `prefers-color-scheme` |
| Packaging | **electron-builder** for cross-platform installers (no `fileAssociations` config) |
| Types | Shared types in `src/shared/` if needed (e.g. `MarkdownViewerAPI`) |

Agents should prefer well-maintained, minimal dependencies over large UI frameworks unless the user requests otherwise.

## Opening Files

The app accepts file paths from the OS; it does not configure how the OS launches it.

1. Parse `process.argv` for a `.md` path on startup.
2. Handle the `open-file` event for paths delivered after launch (common on macOS; also relevant when the OS opens a file while the app is starting).
3. Use `app.requestSingleInstanceLock()` so a second launch forwards the path to the first instance via `second-instance` instead of starting a new process.

Document in README that users who want double-click open must set MarkdownViewer as the handler for `.md` in their OS settings (outside the app).

## User Flows

### Open from file manager

1. User double-clicks `doc.md` (after configuring the OS to use MarkdownViewer).
2. OS launches the app with the full path in argv (or via `open-file`).
3. Main creates/focuses a window; renderer loads and displays content.

### Open while app is running

1. User opens another `.md` file via the OS.
2. Second instance exits; first instance receives the path on `second-instance`.
3. New window (or focused existing) shows the new file.

### Invalid or missing file

- Show clear error UI in renderer (path, reason: not found, not `.md`, permission denied)
- Do not crash the main process

## Renderer UX (v1)

- Title bar / header: file name (basename), optional full path in subtitle or tooltip
- Scrollable content area with readable line length (\~65–75ch)
- Syntax highlighting for fenced code blocks (optional v1.1; plain monospace acceptable for v1)
- External links open in default browser (`shell.openExternal`), not inside Electron webview
- `file://` or custom protocol for relative images: resolve relative to markdown file directory via main process

## IPC API (sketch)

Types should live in `src/shared/api.ts` and be mirrored in preload.

```typescript
// Example shape — implement and keep in sync
interface MarkdownViewerAPI {
  readMarkdownFile(filePath: string): Promise<{ content: string; filePath: string }>;
  getInitialFilePath(): string | null;
  onOpenFile(callback: (filePath: string) => void): () => void;
  openExternal(url: string): Promise<void>;
}
```

Main process reads files with `fs.promises.readFile(..., 'utf-8')`.

## Development

Expected scripts (once scaffolded):

| Script | Purpose |
| --- | --- |
| `dev` | Start Electron with hot reload for renderer |
| `build` | Production build (main, preload, renderer) |
| `dist` | Package installers via electron-builder |

Agents adding features should run `dev` to verify window open, IPC, and markdown render before marking work complete.

## Coding Conventions

- **TypeScript strict** mode
- Functional React components; hooks for file subscription and theme
- No secrets or network calls in v1
- Error messages: user-friendly in UI, detailed in main process logs (`electron-log` optional)
- Keep main process handlers small; test argv parsing and path normalization in isolation where practical

## Testing Checklist (manual)

- [ ] Opening a `.md` file via CLI shows correct content

- [ ] Opening a `.md` file via OS launch (after user sets handler) shows correct content

- [ ] Second file opens while app running (single instance)

- [ ] Non-`.md` or missing file shows error state

- [ ] Markdown: headings, lists, code fences, links, images (relative)

- [ ] External links open in system browser

## Implementation Order

1. Scaffold Electron + Vite + React + TypeScript (main, preload, renderer)
2. Basic window and IPC: read file, display raw markdown → HTML
3. Styling and error states
4. Single-instance + argv / `open-file` handling
5. electron-builder packaging
6. Polish: icons, title, relative images, dark mode

## References

- [Electron security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron single instance](https://www.electronjs.org/docs/latest/api/app#apprequestsingleinstancelock)

When in doubt, prioritize **security**, **simple view-only UX**, and **reliable path-based file opening** over feature breadth.