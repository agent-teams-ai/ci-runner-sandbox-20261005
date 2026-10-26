# TEST repository navigation

Read the current organization
[Engineering Quality Standard](https://github.com/agent-teams-ai/.github/blob/main/docs/engineering-quality-standard.md)
before planning, implementing or reviewing changes. This repository is a
disposable integration fixture; its checks do not certify production repositories.

For npm candidate generation and publication, follow
[the maintained E2E route](npm-publishing-canary/RELEASE.md). The nested package
owns its npm lock and strict TypeScript Host/tests. Run its documented checks
before proposing an affected PR; use the exact public development dependency
and actual registry lock for final CI. Local archive qualification belongs only
to a disposable TEST copy and is recorded separately.

The existing managed-runner workflow and shared npm publisher retain their
owning boundaries. Changesets remains the only version engine. Keep observed
owner review, CI, merge, publication and installed-consumer facts distinct from
the fixture's unprotected-main limitation.
