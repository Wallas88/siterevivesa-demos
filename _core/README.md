# _core — what the React demos share

The code both TypeScript demos (`copperkloof-plumbing/`, `stofpad-biltong/`) use, in one place, so a fix or a rule lives once. It is not a demo and is never deployed: each demo imports what it needs by relative path, builds on its own into its own `dist/`, and deploys as its own Worker.

`demos/` is an npm workspace (`_core`, `copperkloof-plumbing`, `stofpad-biltong`): one `npm install` in `demos/`, one lockfile, and `react` resolves for the shared components too.

Words a visitor reads are never written here: components take them as props, and results carry error codes only. Each demo keeps its own error list (the core's codes plus its own, in its visitor's languages) and turns codes into words.

## Where to edit

| To change | Edit |
|---|---|
| The Result shape and the core's error codes and words (English and Afrikaans) | `result/` |
| Where a visitor's changes are kept (IndexedDB, memory fallback), and reading saved data | `storage/` |
| Photo checks, shrinking, preview, blob URLs, the photo picker | `photos/` |
| The mock sign-in, its code rules and "What's different in your real site" | `sign-in/` |
| Opening hours: rules, editor, the seven-row list | `hours/` |
| Specials and events: rules (today passed in), editor, list; the one clock read (`use-today.ts`) | `specials/` |
| Lists as fixed slots (Nothing hops) | `lists/` |
| Labels that keep their width, Reset | `controls/` |
| The Website / Admin switch and `?view=admin` | `view/` |
| The two-pane shell, the admin frame and sections | `shell/` |
| Loading and saving a demo, the shared hours/specials/Reset actions and reducer | `demo/` |
| Reading typed rand | `prices/` |
| How a check sets a tab up (seed, signed in or not) | `pages/` |
| `vite preview` sending the production headers | `tooling/` |
| The shared styles (shell, controls, admin, motion) | `styles/` |
| The code, UX, flow, sandbox and deploy checks each demo runs | `checks/` |

## Checks

`npm run check` here: format, lint, typecheck, the code check and the core's tests. Each demo's own `npm run check` typechecks the core files it imports.
