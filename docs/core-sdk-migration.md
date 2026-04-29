# Core SDK Migration Notes

## Goal

Move the action from the legacy `statsig-node` package to the public
`@statsig/statsig-node-core` package while preserving the existing action
inputs and outputs as closely as possible.

## Current Constraints

- The action currently ships a checked-in `dist/index.js` bundle built with
  `@vercel/ncc`.
- Node Core uses native `.node` binaries that are published as platform-specific
  optional dependencies.
- Node Core requires `StatsigUser` instances rather than plain JavaScript
  objects.
- The legacy action accepts event objects, while Node Core exposes positional
  `logEvent(user, eventName, value, metadata)` calls.

## Migration Decisions

- Use the public `@statsig/statsig-node-core` package, not the private
  `@oai-statsig/*` packages.
- Preserve the public action contract where possible by normalizing input JSON
  into Core users and adapting legacy event objects to Core `logEvent` calls.
- Keep the current GitHub Actions Node runtime and rebuild the committed
  distribution artifact after the migration.
- Validate the built action artifact, not only source-level tests, because the
  native package shape is the primary migration risk.
- Vendor every published Node Core platform binary beside `dist/index.js`
  during the build so the checked-in action artifact remains portable across
  GitHub-hosted runners.
- Keep `@actions/core` on its latest major release; the test suite uses a local
  Jest resolver shim because v3 is ESM-only while these tests intentionally mock
  the module from a CommonJS Jest runtime.

## Proof Steps

1. Install Node Core and verify whether `ncc` emits a runnable artifact with the
   required native assets.
2. Run unit tests that cover user normalization, exposure logging, evaluation
   outputs, and event adaptation.
3. Run the bundled artifact through a smoke import after build.
4. Re-run the repository build and test commands after dependency updates.

## Deferred

- Adding new Core-only action inputs or outputs.
- Widening the support matrix beyond what the bundled artifact can prove.
