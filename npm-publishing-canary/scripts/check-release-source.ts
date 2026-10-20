import { resolve } from "node:path";
import { releaseCommand, releaseNpmEntrypoint, releaseRepository } from "./release-candidate.ts";
import { qualifyReleaseSource } from "./release-pr.ts";

interface MergedPullRequest {
  user: { type: string; login: string };
  merged_at: string | null;
  merge_commit_sha: string;
  base: { ref: string; repo: { full_name: string } };
  head: { ref: string; repo: { full_name: string } };
}

const source = process.env.GITHUB_SHA;
if (process.env.GITHUB_EVENT_NAME !== "workflow_dispatch" || process.env.GITHUB_REF !== "refs/heads/main"
  || process.env.GITHUB_REPOSITORY !== releaseRepository || !source || !/^[a-f0-9]{40}$/.test(source)) {
  throw new Error("Publication admission requires an exact main workflow_dispatch source");
}
const root = resolve(import.meta.dirname, "../..");
const assertCurrent = (): void => {
  const remote = releaseCommand("git", ["ls-remote", "--refs", "origin", "refs/heads/main"], root).toString("utf8").trim();
  const checkout = releaseCommand("git", ["rev-parse", "HEAD"], root).toString("utf8").trim();
  if (remote !== `${source}\trefs/heads/main` || checkout !== source) throw new Error("Publication source is no longer exact current main");
};
assertCurrent();
const result: unknown = JSON.parse(releaseCommand("gh", ["api", `repos/${releaseRepository}/commits/${source}/pulls`], root).toString("utf8"));
if (!Array.isArray(result)) throw new Error("Merged release PR evidence is unavailable");
const matches = (result as MergedPullRequest[]).filter(pr => pr.merge_commit_sha === source && pr.merged_at !== null
  && pr.user.type === "User" && pr.user.login === "777genius"
  && pr.base.ref === "main" && pr.head.ref === "changeset-release/main"
  && pr.base.repo.full_name === releaseRepository && pr.head.repo.full_name === releaseRepository);
if (matches.length !== 1) throw new Error("Publication source must be the exact owner release PR squash merge");
qualifyReleaseSource(root, source, releaseNpmEntrypoint());
assertCurrent();
process.stdout.write(`Publication candidate independently admitted before packing: ${source}\n`);
