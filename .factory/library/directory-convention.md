# Directory Convention

The project uses the **`src/`** directory as the source root, not `app/`.

## Actual paths

| Purpose | Path |
|---------|------|
| Routes | `src/routes/` |
| Lib/helpers | `src/lib/` |
| Components | `src/components/` |
| Styles | `src/styles.css` |
| Router config | `src/router.tsx` |
| Auto-generated route tree | `src/routeTree.gen.ts` |

This is the default TanStack Start scaffold layout. Workers should place new files under `src/`, not `app/`.

## Note

AGENTS.md and the frontend-worker skill contain example paths referencing `app/` — these are aspirational and do not match the actual project structure. Always use `src/` paths when creating or referencing files.
