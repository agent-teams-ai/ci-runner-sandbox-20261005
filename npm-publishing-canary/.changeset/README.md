# Canary release intents

Use `npx changeset` in this nested package to describe an actual canary change.
Changesets owns version and changelog generation. The private TEST Host verifies
the generated candidate; it neither selects versions nor publishes packages.
