import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string): string => readFileSync(resolve(root, path), "utf8");

test("candidate admission precedes the original archive and manual-main publisher", () => {
  const workflow = read(".github/workflows/npm-publication-e2e.yml");
  const prepare = workflow.slice(workflow.indexOf("  prepare:"), workflow.indexOf("\n  publish:"));
  const compile = prepare.indexOf("run: |\n          npm run build");
  const archive = prepare.indexOf("npm pack --ignore-scripts --json");
  const admission = prepare.indexOf("run: npm run release:check-source");
  assert.ok(admission >= 0 && admission < compile && compile < archive);
  assert.match(prepare, /if: github\.event_name == 'workflow_dispatch'[\s\S]*?run: npm run release:check-source/);
  assert.match(prepare, /if: github\.event_name == 'pull_request' && github\.head_ref == 'changeset-release\/main'[\s\S]*?run: npm run release:check-pr/);
  assert.match(prepare, /npm run check:release/);
  assert.doesNotMatch(prepare, /continue-on-error|always\(\)|\|\| true/);
  assert.match(workflow, /publish:\n    needs: prepare\n    if: github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /verify:\n    needs: \[prepare, publish\]/);
  assert.match(workflow, /promote:\n    needs: verify/);
  const pins = [...workflow.matchAll(/uses: agent-teams-ai\/\.github\/\.github\/workflows\/npm-publish\.yml@([a-f0-9]{40})/g)].map(match => match[1]);
  assert.deepEqual(pins, ["ff94f77116923d7842a37a8004a5f4e31d65201e", "ff94f77116923d7842a37a8004a5f4e31d65201e"]);
  assert.match(workflow, /cmp "original\/\$file" "registry\/\$file"/);
  assert.match(workflow, /node out\/consumer\.js/);
});

test("versioning remains nested, version-only and owner-authored with empty-plan termination", () => {
  const workflow = read(".github/workflows/npm-canary-version.yml");
  assert.match(workflow, /changesets\/action@a45c4d594aa4e2c509dc14a9f2b3b67ba3780d0d/);
  assert.match(workflow, /if: steps\.plan\.outputs\.has_release == 'true'[\s\S]*?cwd: npm-publishing-canary/);
  assert.match(workflow, /setupGitUser: false\n          createGithubReleases: false\n          version: npm run release:version/);
  assert.match(workflow, /git config --local user\.name iliya\n          git config --local user\.email iliyazelenkog@gmail\.com/);
  assert.match(workflow, /\.user\.type == "User" and \.user\.login == "777genius"/);
  assert.doesNotMatch(workflow, /id-token:|NPM_TOKEN|npm publish|\n\s+publish:/);
});
