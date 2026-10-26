# Fresh release candidate E2E

Status (2026-10-26): public `@agent-teams/release-checks@0.1.0` is available and
the nested npm lock now adopts its actual registry bytes. The current public-input
qualification is recorded in [the adoption evidence](evidence/public-adoption-20261026.json).
Reviewed owner implementation/release PRs, native CI, fresh canary publication,
latest-selector installation and exact-archive replay remain pending. The earlier
publisher run is not evidence for this complete chain.

The retained [local qualification](evidence/local-installed-qualification.json)
records strict TypeScript and all 20 tests, the actual nested engine-generated
candidate, independent squash-parent replay, local pack and installed typed
consumer. It uses the exact corrected `release-checks@0.0.0` candidate archive.
That record describes its prior Host snapshot. The subsequent
[intent documentation correction](evidence/intent-docs-qualification.json)
records the current Host source digests and strict TypeScript plus **21 passing
tests** on the same installed archive. The follow-up changes only the Host's
intent classification and its test; it does not rerun or relabel the prior
complete pack/install proof as a new source qualification.
The [earlier nested-topology rejection](evidence/initial-nested-contract-counterexample.json)
is retained as the counterexample that caused the library correction; it is
not presented as a passing result.

This disposable repository contains one public package at
`npm-publishing-canary/`. There is no root package or workspace. The existing
managed-runner fixture and existing npm publisher keep their responsibilities.
Follow the current organization
[Engineering Quality Standard](https://github.com/agent-teams-ai/.github/blob/main/docs/engineering-quality-standard.md)
and its
[owner PR merge guard](https://github.com/agent-teams-ai/.github/blob/main/scripts/merge-owner-pr.mjs).

## Boundary and commands

Changesets 3.0.2 owns the official plan, version and changelog. The TEST Host
captures the actual clean source, Git directory, processed commit, nested
working directory, resolved Changesets and npm installations, and Node binary.
It freezes the official plan before running the captured CLI. Node 26.11.1,
npm 11.20.0 and TypeScript 7.0.2 are the qualified development tools.

The Host observes the entire Git repository, including unrelated root paths,
untracked files and content hidden by Git index flags. The pure installed
`@agent-teams/release-checks` API checks complete manifests, exact planned
versions, intent consumption, input binding and admitted diff paths. The Host
retains the repository-specific lock and changelog policies. No Foundation
capability, version algorithm or registry client is added.

Only these generation changes are admissible:

- The nested manifest's exact version selected by Changesets.
- Matching `version` and `packages[""].version` in the nested npm lock; every
  other lock field and dependency graph entry remains equal.
- The exact new changelog section while preserving existing history, or the
  first engine-generated changelog when none exists.
- Removal of precisely the consumed nested Changesets files.

Intent membership follows the exact installed Changesets 3.0.2 reader. Direct
lowercase `.md` files are considered, excluding dot-prefixed names, README
case-insensitively and exact `AGENTS.md`, `CLAUDE.md` and `GEMINI.md`. These
non-intent documents still belong to the complete observed source; editing
them in a generated candidate rejects. Lowercase `agents.md` remains an intent.
The installed reader also knows `.changeset/pre`; this Host's existing stable
lane rejects prerelease state and `pre/` intent identities rather than silently
dropping them or expanding its release scope.

The pinned action may select its generated branch at the same processed source.
Changing the source, physical execution custody, CLI/config bytes or unrelated
repository content rejects. An empty-only plan returns without running version
and retains its intent. Failures stop before commit, push or archive preparation;
recover by regenerating in a clean owned checkout of current main.

Run these commands **inside `npm-publishing-canary/`**:

| Command | Responsibility |
| --- | --- |
| `npm run check:release` | Strictly typecheck all maintained Host/tests and run public conformance, actual-engine negatives and workflow wiring tests |
| `npm run release:status` | Read the official plan for a clean accepted source; no version effects |
| `npm run release:version` | Capture the official plan, run that CLI, synchronize the npm root lock, observe and check the complete candidate |
| `npm run release:check-pr` | In the authenticated current owner PR event, independently replay its accepted base and check the actual head |
| `npm run release:check-source` | In manual current-main publication, verify the actual owner release PR squash and independently replay its single parent before packing |
| `npm run build` | Compile the original canary package |

The development metadata and npm lock name exact public `release-checks@0.1.0`
with its actual registry integrity. The 2026-10-26 adoption evidence qualifies
`npm ci`, strict typechecking, build and 19 of 21 tests on these inputs. Two
macOS fixture limitations are retained explicitly; full case-sensitive native CI
remains pending. A
local `file:` dependency is permitted only inside a disposable TEST copy and is
never production adoption evidence.

## Workflow sequence

`npm-canary-version.yml` is version-only. It retains Actions PR creation and
approval disabled. The action can push `changeset-release/main` and then fail
its PR creation attempt. The active owner inspects the exact generated source,
head and diff and opens the owner PR with `gh`; do not enable broader token
permissions or reuse a Bot-owned PR.

The existing `npm-publication-e2e.yml` keeps its four jobs: `prepare`, `publish`,
`verify`, `promote`. Its `prepare` job runs the strict tests, checks current
release PRs and, on manual main publication, independently admits the actual
merged candidate before compilation and packing. A rejected candidate cannot
supply an archive to the dependent publisher. Ordinary implementation PRs run
the tests and pack checks but have no publication permission.

The original shared publisher remains pinned at
`ff94f77116923d7842a37a8004a5f4e31d65201e` for both phases. The original CI archive,
source/run manifest, registry receipt, SHA-256/SRI and byte comparison, installed
TypeScript consumer and `latest` promotion remain in order. Follow the existing
[reconciliation protocol](https://github.com/agent-teams-ai/.github/blob/ff94f77116923d7842a37a8004a5f4e31d65201e/docs/npm-trusted-publishing.md)
for uncertainty; never blindly repeat a possibly completed upload.

## Owner execution and evidence checklist

1. The exact reviewed public `0.1.0` coordinate and npm-generated registry lock
   are adopted; see the 2026-10-26 evidence. For any changed final source, run
   `npm ci --ignore-scripts --no-audit --no-fund`,
   `npm run check:release` and `npm run build` on that final source.
2. Create the implementation owner PR. Record independent reviewer role,
   exact head and verdict, inspect its actual CI and merge with the canonical
   owner guard. Retain the implementation PR, source and merge coordinates.
3. Inspect the main-triggered version workflow's processed source and official
   plan. The fresh patch intent describes development release metadata;
   Changesets must supply the actual resulting version and first changelog.
   No version is prewritten. For a PR-creation denial, inspect the generated
   branch and create the owner PR from it. Regenerate if main advanced.
4. Review the exact release diff and record an independent review. Require the
   actual current-base/head candidate check and existing CI. Use the canonical
   owner squash merge and retain its PR/head/base/merge identities. These TEST
   observations do not establish protected-branch enforcement: main remains
   unprotected, and its current repository settings remain unchanged.
5. While that squash source is still exact current main, dispatch the original
   `npm-publication-e2e.yml`. Retain its run and attempt, original artifact ID,
   source manifest, exact package/version, archive SHA-256 and SRI, registry
   readback receipt, installed-consumer result and promotion evidence. Read
   back the actual `latest` coordinate. In a separate disposable consumer,
   install `@agent-teams/npm-publishing-canary@latest`, verify its installed
   manifest version and lock integrity against that release, and compile and
   execute the existing `consumer.ts` with TypeScript 7.0.2. This separately
   proves the promoted selector; the workflow consumer qualifies the exact
   registry archive before promotion. An observed token exchange alone is not
   publication proof.
6. Before advancing main, use the existing publisher's reconciliation-only
   rerun contract for an exact-archive replay. Compare the replay archive's
   SHA-256/SRI and bytes with the original; retain the original and replay
   run/attempt receipts and demonstrate no second `upload-attempt` and no
   unnecessary `promote-attempt`. An absent version or unresolved earlier
   upload intent is a reconciliation stop, not permission to upload again.
7. Inspect applicable Git tag/release state separately. This canary's original
   workflow owns no Git release writer. If the owner records a tag/release for
   the observed version, bind it to the actual merged source after npm
   verification; a missing Git record is not a reason to repeat npm upload.
8. Commit the final evidence only after both publication and replay are
   complete. Record implementation, generated release, publication, replay and
   installed consumer separately. The canary proves one fresh chain; it does
   not substitute for Foundation, Get Modular or node-or-bun adoption evidence.

The meaningful rejected-candidate test amends the would-be squash candidate's
manifest or generated changelog, then invokes the same independent source
qualification used before packing. It rejects without running a packer,
merging that candidate or invoking npm publication. The workflow wiring test
also verifies admission order and the original dependent publisher chain;
local execution is not a substitute for the hosted run above.
