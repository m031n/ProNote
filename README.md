# ProNote Widget

ProNote is a Figma/FigJam widget for structured product and design notes. It supports fixed author profiles, Persian/RTL note content, category badges, document links, size controls, and connector legs for pointing a note at a specific area of the canvas.

## Features

- Editable title and body directly on the canvas
- Fixed author profiles with bundled avatars
- Persian date formatting for note updates
- Five note categories: technical, design, business, design changes, and feedback
- Optional document links with URL normalization
- Configurable card width, scale, connector side, connector length, and connector position
- Header/title visibility controls for compact note variants

## Local Setup

Install dependencies if you want to edit or rebuild the widget:

```bash
npm install
```

Build the widget bundle:

```bash
npm run build
```

Run TypeScript checks:

```bash
npm run typecheck
```

During development, rebuild on file changes:

```bash
npm run watch
```

## Import In Figma

1. Open Figma Desktop.
2. Go to `Widgets > Development > Import widget from manifest`.
3. Select this repository's `manifest.json` file.
4. Run `ProNote Widget` from the development widgets list.

The built widget code is included at `dist/code.js`, so the GitHub ZIP can be imported directly into Figma without running build commands first.

## Project Structure

```text
.
├── img/             # Bundled author avatars
├── src/code.tsx     # Widget implementation
├── src/ui.html      # Helper modal UI
├── manifest.json    # Figma widget manifest
└── package.json     # Build and typecheck scripts
```
