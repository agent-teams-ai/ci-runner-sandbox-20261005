# npm publishing canary

Unsupported TEST-only package for the Agent Teams npm publication workflow.
Do not use it in production. Its only purpose is to prove GitHub OIDC upload,
exact registry archive read-back, installed typed consumer behavior and tag
promotion without a permanent npm token.

Version 0.0.0 is reserved for the initial namespace bootstrap. Supported product
behavior, compatibility and an npm package intended for users are not claimed.

Changesets owns new version and changelog generation. The repository's private
TEST Host uses `@agent-teams/release-checks` to verify the exact generated
candidate before its owner PR and publication archive. See the maintained
[release E2E route](https://github.com/agent-teams-ai/ci-runner-sandbox-20261005/blob/main/npm-publishing-canary/RELEASE.md)
for qualification commands, current status and the complete evidence checklist.
