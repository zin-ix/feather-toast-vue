# feather-vue

Lightweight, zero-dependency Vue 3 components. Install only what you use.

## Packages

| Package | Description |
|---|---|
| [`@feather-vue/toast`](./packages/toast) | Accessible toast notifications with spring animations, promise support and swipe-to-dismiss |

## Development

```bash
npm install          # installs all workspaces
npm run dev          # demo playground with hot reload against package sources
npm run build        # builds every package in packages/
npm run build:demo   # builds the playground for GitHub Pages
```

### Repo layout

```
packages/<name>/   one folder per published package (@feather-vue/<name>)
playground/        demo app, deployed to GitHub Pages
```

### Adding a component

1. Copy `packages/toast` to `packages/<name>` and clear out `src/`.
2. In its `package.json`, set `"name": "@feather-vue/<name>"` and `"version": "0.1.0"`, and update `description`, `keywords` and `repository.directory`.
3. In its `vite.config.ts`, update the library `name`, `fileName` and the emitted CSS file name.
4. Add `"@feather-vue/<name>": "*"` to `playground/package.json`, plus matching aliases in `playground/vite.config.ts` and `playground/tsconfig.json`.
5. Run `npm install`, then `npm run build`.

### Publishing

```bash
cd packages/<name>
npm version <patch|minor|major>
npm publish
```
