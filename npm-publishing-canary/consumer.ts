import { releaseCanary } from "@agent-teams/npm-publishing-canary";

if (releaseCanary !== "github-oidc-without-permanent-npm-token") {
  throw new Error("The installed registry package did not expose the qualified canary value");
}
