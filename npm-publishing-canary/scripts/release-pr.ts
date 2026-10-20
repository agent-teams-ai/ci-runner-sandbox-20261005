import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import {
  assertReleasePassed, captureRelease, checkReleaseTree, readReleaseGitTree,
  releaseCommand, releasePackageDirectory, releaseRepository, versionRelease,
} from "./release-candidate.ts";

/** The base is supplied by the authenticated PR/current-main boundary, never by candidate metadata. */
export function qualifyReleasePr(root: string, base: string, head: string, npmEntrypoint: string): void {
  if (![base, head].every(source => /^[a-f0-9]{40}$/.test(source))) throw new Error("Release PR qualification requires exact base and head commits");
  releaseCommand("git", ["merge-base", "--is-ancestor", base, head], root);
  const temporary = mkdtempSync(join(tmpdir(), "TEST-canary-release-pr-"));
  let failure: unknown;
  try {
    const replay = join(temporary, "replay");
    releaseCommand("git", ["clone", "--no-local", "--no-checkout", root, replay], temporary);
    releaseCommand("git", ["remote", "set-url", "origin", `https://github.com/${releaseRepository}.git`], replay);
    releaseCommand("git", ["config", "core.autocrlf", "false"], replay);
    releaseCommand("git", ["checkout", "--detach", base], replay);
    releaseCommand("git", ["branch", "--force", "main", base], replay);
    releaseCommand(process.execPath, [npmEntrypoint, "ci", "--ignore-scripts", "--no-audit", "--no-fund"], join(replay, releasePackageDirectory));
    const prepared = captureRelease(replay, base, npmEntrypoint);
    const generated = versionRelease(prepared);
    if (!generated.changed) throw new Error("Current accepted base has no release; there is no release PR to qualify");
    const candidate = readReleaseGitTree(root, head);
    assertReleasePassed(checkReleaseTree(prepared, candidate, head, base));
    if (!isDeepStrictEqual(candidate[`${releasePackageDirectory}/CHANGELOG.md`], generated.tree[`${releasePackageDirectory}/CHANGELOG.md`])) {
      throw new Error("Release PR changelog differs from the independently replayed current-base engine output");
    }
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    try { rmSync(temporary, { recursive: true, force: true }); }
    catch (cleanup) { throw new AggregateError(failure === undefined ? [cleanup] : [failure, cleanup], `Release PR TEST checkout cleanup failed: ${temporary}`); }
  }
}

/** Publication uses the actual squash parent, never a base supplied by release output. */
export function qualifyReleaseSource(root: string, source: string, npmEntrypoint: string): void {
  if (!/^[a-f0-9]{40}$/.test(source)) throw new Error("Publication requires an exact source commit");
  const commits = releaseCommand("git", ["rev-list", "--parents", "-n", "1", source], root).toString("utf8").trim().split(" ");
  if (commits.length !== 2 || commits[0] !== source || !commits[1]) throw new Error("Publication requires a single-parent owner squash source");
  qualifyReleasePr(root, commits[1], source, npmEntrypoint);
}
