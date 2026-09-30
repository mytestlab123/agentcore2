# Preview strategy

Each preview experience is a separate app that reuses the one shared backend
seam. This lets several operator GUIs evolve independently over the same
governed contract.

## Amplify branch / preview mapping

- Each Preview (A / B / C / D) is its own app under `apps/` and its own Amplify
  app.
- Each preview branch maps to its own Amplify app + branch. See `amplify.yml`
  for the pnpm monorepo build shape (install at the root, build
  `@agentcore2/contracts` first, then the preview app, artifacts at the
  preview's `dist/`).
- `amplify.yml` is config only. M1 does not deploy to Amplify cloud (no AWS
  credentials in the sandbox); Amplify deploys are the owner's concern.
- Public repo: no secrets and no hard-coded AWS account allowlist in any config.

## Conventions

- Package name: `@agentcore2/<preview-name>` (e.g. `@agentcore2/preview-a`).
- Depend on the shared contract via `"@agentcore2/contracts": "workspace:*"`.
- Consume the `BackendAdapter` interface; centralize adapter construction in a
  single file (Preview A uses `apps/preview-a/src/backend.ts`) so the mock <->
  real swap touches one file.
- Every preview MUST visibly show its `MOCK` / `RECORDED` / `LIVE LAB` state
  from `adapter.mode()`.

## How to add a new preview (without copying the app)

1. Create a new folder `apps/<preview-name>/` (copy the Preview A scaffold shell
   only: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`,
   `src/main.tsx`). Name the package `@agentcore2/<preview-name>`.
2. Add `"@agentcore2/contracts": "workspace:*"` to its dependencies. NEVER copy
   the `packages/contracts` package or redefine its types.
3. Reuse the shared adapter: construct a `BackendAdapter` (today
   `MockBackendAdapter`) in one `src/backend.ts` and build the UI against the
   interface.
4. Render the lab-mode badge from `adapter.mode()`.
5. Run `pnpm install`, then `pnpm --filter @agentcore2/<preview-name> dev`.
6. Give the preview its own Amplify app/branch following `amplify.yml`.
