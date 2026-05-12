# Feather Toast Vue

A lightweight Vue 3 toast notification plugin. Minimal by design, with smooth animations and a clean API that stays out of your way.

---

## Features

| Feature | Description |
|---------|-------------|
| 6 Variants | `default` · `success` · `error` · `warning` · `info` · `loading` |
| 6 Positions | `top-right` · `top-left` · `top-center` · `bottom-right` · `bottom-left` · `bottom-center` |
| Smooth Animations | Spring-based slide + fade + scale with `cubic-bezier(0.16, 1, 0.3, 1)` |
| Swipe to Dismiss | Horizontal swipe gesture with snap-back |
| Hover Pause | Auto-dismiss timer pauses accurately on hover |
| Promise API | `toast.promise()` — loading → success / error |
| Action Button | Optional inline action on any toast |
| Vue Plugin | One-line install with `app.use(ToastPlugin)` |
| Zero Dependencies | Only Vue 3 — no Tailwind, no UI library |
| TypeScript | Fully typed API |
| Accessible | `aria-live`, `role="alert"`, `prefers-reduced-motion` support |

---

## Installation

```bash
npm install feather-toast-vue
```

### Setup

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { CreateFeatherToast } from 'feather-toast-vue'

const app = createApp(App)
app.use(CreateFeatherToast)
app.mount('#app')
```

`ToastContainer` and styles are mounted automatically by the plugin.

---

## Usage

### Basic

```ts
import { useFeatherToast } from 'feather-toast-vue'

const { toast } = useFeatherToast()

toast({
  title: 'Event Created',
  description: 'Your event has been scheduled.',
})
```

### Variants

```ts
toast.success({ title: 'Saved',        description: 'Changes applied.' })
toast.error({   title: 'Error',        description: 'Something went wrong.' })
toast.warning({ title: 'Warning',      description: 'Disk space is low.' })
toast.info({    title: 'Info',         description: 'Version 2.4 is available.' })
toast.loading({ title: 'Uploading...', description: 'Please wait.' })
```

### Custom Position

```ts
toast.success({
  title: 'Saved',
  position: 'top-center', // default: 'bottom-right'
})
```

### Promise API

Automatically transitions `loading → success` or `loading → error`:

```ts
toast.promise(
  fetch('/api/projects', { method: 'POST' }),
  {
    loading: {
      title: 'Creating project...',
      description: 'Setting up your workspace.',
    },
    success: (data) => ({
      title: `"${data.name}" created`,
      description: 'Your project is ready.',
    }),
    error: (err) => ({
      title: 'Failed to create project',
      description: err instanceof Error ? err.message : 'Unknown error.',
    }),
  }
)
```

### Action Button

```ts
toast({
  title: 'Message archived',
  description: 'Moved to archive.',
  action: {
    label: 'Undo',
    onClick: () => {
      toast.success({ title: 'Restored', description: 'Message moved back to inbox.' })
    },
  },
})
```

### Dismiss

```ts
// Dismiss by ID
const id = toast.loading({ title: 'Working...' })
toast.dismiss(id)

// Dismiss all
toast.dismissAll()
```

---

## API Reference

### `useToast()`

```ts
const { toast, toasts, dismiss, dismissAll } = useToast()
```

| Property | Type | Description |
|----------|------|-------------|
| `toast(options)` | `(options: ToastOptions) => string` | Show a default toast, returns its ID |
| `toast.success(options)` | `Function` | Success variant |
| `toast.error(options)` | `Function` | Error variant |
| `toast.warning(options)` | `Function` | Warning variant |
| `toast.info(options)` | `Function` | Info variant |
| `toast.loading(options)` | `Function` | Loading variant — no auto-dismiss |
| `toast.promise(promise, opts)` | `Function` | Promise-based toast flow |
| `toast.dismiss(id)` | `Function` | Dismiss a specific toast by ID |
| `toast.dismissAll()` | `Function` | Dismiss all active toasts |
| `toasts` | `Ref<Toast[]>` | Reactive list of all active toasts |

---

### `ToastOptions`

```ts
interface ToastOptions {
  title?:       string
  description?: string
  variant?:     'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'
  position?:    'top-right' | 'top-left' | 'top-center'
                | 'bottom-right' | 'bottom-left' | 'bottom-center'
  duration?:    number      // ms · default: 5000 · loading: Infinity
  dismissible?: boolean     // default: true (false for loading)
  action?: {
    label:   string
    onClick: () => void
  }
}
```

---

### Positions

```
+----------+------------+-----------+
| top-left | top-center | top-right |
|          |            |           |
|          |            |           |
| bot-left | bot-center | bot-right |
+----------+------------+-----------+
```

---

## Design System

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--toast-bg` | `#ffffff` | Card background |
| `--toast-border` | `#e4e4e7` | Card border |
| `--toast-text` | `#18181b` | Title text |
| `--toast-text-muted` | `#71717a` | Description text |
| `--toast-shadow` | `0 2px 8px rgba(0,0,0,0.06)` | Card elevation |
| `--toast-radius` | `10px` | Card border radius |
| `--toast-width` | `360px` | Card width |

### Icon Accent Colors

| Variant | Hex |
|---------|-----|
| Success | `#16a34a` |
| Error | `#dc2626` |
| Warning | `#d97706` |
| Info | `#2563eb` |
| Loading | `#71717a` |

### Customization via CSS Variables

```css
/* Override in your global CSS */
:root {
  --toast-bg:          #ffffff;
  --toast-border:      #e4e4e7;
  --toast-text:        #18181b;
  --toast-text-muted:  #71717a;
  --toast-radius:      10px;
  --toast-width:       360px;
  --toast-gap:         8px;
  --toast-shadow:      0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}
```

---

## Animation Spec

| Phase | Duration | Easing |
|-------|----------|--------|
| Enter | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` — spring |
| Exit | 220ms | `cubic-bezier(0.4, 0, 1, 1)` — snappy |
| Sibling reflow | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` — spring |
| Swipe snap-back | 360ms | `cubic-bezier(0.16, 1, 0.3, 1)` — spring |

---

## File Structure

```
src/
├── assets/
│   └── toast.css              # All styles & animations
├── components/
│   ├── Toast.vue              # Individual toast card
│   └── ToastContainer.vue     # Positional viewport manager
├── composables/
│   └── useToast.ts            # Reactive toast API
├── plugins/
│   └── toast.ts               # Vue plugin (app.use)
├── types/
│   └── toast.ts               # TypeScript interfaces
└── main.ts                    # App entry point
```

---

## Bundle Size

| File | Raw | Gzipped |
|------|-----|---------|
| JS (all files) | ~12 KB | ~4 KB |
| CSS | ~6 KB | ~2 KB |
| **Total** | **~18 KB** | **~6 KB** |

Zero external dependencies beyond Vue 3.

---

## License

MIT © feather-toast