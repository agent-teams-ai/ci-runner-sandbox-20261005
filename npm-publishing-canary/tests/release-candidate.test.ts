import { strict as assert } from "node:assert";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test, type TestContext } from "node:test";
import { checkReleaseCandidate } from "@agent-teams/release-checks";
import { releaseCandidateConformanceCases } from "@agent-teams/release-checks/conformance";
import {
  assertReleasePassed, captureRelease, checkReleaseTree, readReleaseWorkingTree,
  releaseCommand, releaseNpmEntrypoint, releasePackageDirectory, releaseRepository,
  versionRelease, type PreparedRelease,
} from "../scripts/release-candidate.ts";
import { qualifyReleasePr, qualifyReleaseSource } from "../scripts/release-pr.ts";

const packageRoot = resolve(import.meta.dirname, "..");
const packageName = "@agent-teams/npm-publishing-canary";
const readJson = (path: string): Record<string, unknown> => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
const writeJson = (path: string, value: unknown): void => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const git = (root: string, ...args: string[]): string => releaseCommand("git", args, root).toString("utf8").trim();
const intent = '---\n"@agent-teams/npm-publishing-canary": patch\n---\n\nUpdate the TEST release metadata.\n';

type Fixture = Readonly<{ root: string; nested: string; directory: string; source: string }>;
function fixture(t: TestContext, release = true, existingHistory = true): Fixture {
  const directory = mkdtempSync(join(tmpdir(), "TEST-canary-fixture-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, "repo");
  const nested = join(root, releasePackageDirectory);
  mkdirSync(join(nested, ".changeset"), { recursive: true });
  const metadata = { ...readJson(join(packageRoot, "package.json")), version: "0.0.2" };
  const lock = readJson(join(packageRoot, "package-lock.json"));
  const packages = lock.packages as Record<string, Record<string, unknown>>;
  writeJson(join(nested, "package.json"), metadata);
  writeJson(join(nested, "package-lock.json"), { ...lock, version: "0.0.2", packages: { ...packages, "": { ...packages[""], version: "0.0.2" } } });
  cpSync(join(packageRoot, ".changeset/config.json"), join(nested, ".changeset/config.json"));
  writeFileSync(join(root, ".gitignore"), `${releasePackageDirectory}/node_modules/\n${releasePackageDirectory}/dist/\n`);
  if (existingHistory) writeFileSync(join(nested, "CHANGELOG.md"), "# Changelog\n\n## 0.0.2\n\n- Previous release.\n");
  writeFileSync(join(root, "source.ts"), "export const unrelated = true;\n");
  writeFileSync(join(nested, ".changeset/housekeeping.md"), "---\n---\n\nMaintenance only.\n");
  if (release) writeFileSync(join(nested, ".changeset/metadata.md"), intent);
  git(root, "init", "-b", "main");
  git(root, "config", "user.name", "iliya");
  git(root, "config", "user.email", "iliyazelenkog@gmail.com");
  git(root, "config", "core.autocrlf", "false");
  git(root, "remote", "add", "origin", `https://github.com/${releaseRepository}.git`);
  git(root, "add", "--all");
  git(root, "commit", "-m", "test: accepted nested canary source");
  cpSync(join(packageRoot, "node_modules"), join(nested, "node_modules"), { recursive: true, verbatimSymlinks: true });
  return { root, nested, directory, source: git(root, "rev-parse", "HEAD") };
}
const prepare = (source: Fixture): PreparedRelease => captureRelease(source.root, source.source, releaseNpmEntrypoint());
const inspect = (prepared: PreparedRelease): void => assertReleasePassed(checkReleaseTree(prepared, readReleaseWorkingTree(prepared.custody.root), "independently-observed-candidate"));

for (const scenario of releaseCandidateConformanceCases) {
  test(`installed common conformance: ${scenario.id}`, () => {
    const report = checkReleaseCandidate(scenario.input);
    assert.equal(report.outcome, scenario.expected.outcome);
    assert.deepEqual([...new Set(report.diagnostics.map(diagnostic => diagnostic.code))].sort(), [...scenario.expected.diagnosticCodes].sort());
    assert.deepEqual(report.packageChanges, scenario.expected.packageChanges);
  });
}

test("real nested Changesets patch and npm root-lock synchronization preserve the whole repository", t => {
  const source = fixture(t);
  const prepared = prepare(source);
  assert.equal(prepared.custody.packageRoot, source.nested);
  assert.equal(prepared.expected.binding.source.identity, source.source);
  assert.deepEqual(prepared.expected.packages.map(value => [value.name, value.root, value.manifestPath]), [
    [packageName, "npm-publishing-canary", "npm-publishing-canary/package.json"],
  ]);
  assert.deepEqual(prepared.expected.plan.releases, [{ packageName, manifestPath: "npm-publishing-canary/package.json", type: "patch", oldVersion: "0.0.2", newVersion: "0.0.3", intentIds: ["metadata"] }]);
  git(source.root, "switch", "-c", "changeset-release/main");
  const result = versionRelease(prepared);
  assert.equal(result.changed, true);
  assert.deepEqual(result.report.packageChanges, [{ packageName, manifestPath: "npm-publishing-canary/package.json", oldVersion: "0.0.2", newVersion: "0.0.3" }]);
  assert.equal(readJson(join(source.nested, "package.json")).version, "0.0.3");
  const lock = readJson(join(source.nested, "package-lock.json"));
  assert.equal(lock.version, "0.0.3");
  assert.equal((lock.packages as Record<string, Record<string, unknown>>)[""]?.version, "0.0.3");
  assert.equal(existsSync(join(source.nested, ".changeset/metadata.md")), false);
  assert.equal(existsSync(join(source.nested, ".changeset/housekeeping.md")), false);
  assert.match(readFileSync(join(source.nested, "CHANGELOG.md"), "utf8"), /## 0\.0\.3\n[\s\S]*Update the TEST release metadata\./);
});

test("an empty-only official plan performs no versioning and consumes no intent", t => {
  const source = fixture(t, false);
  const prepared = prepare(source);
  assert.deepEqual(prepared.expected.plan, { releases: [], consumptions: [] });
  const result = versionRelease(prepared);
  assert.equal(result.changed, false);
  assert.deepEqual(result.tree, prepared.source);
});

test("actual v3 intent discovery retains source instruction docs and rejects their candidate edits", t => {
  const source = fixture(t);
  const ignored = ["README.md", "readme.md", "ReadMe.md", "AGENTS.md", "CLAUDE.md", "GEMINI.md", ".hidden.md", "notes.MD", "nested/instruction.md"];
  const text = "Source instructions without changeset frontmatter.\n";
  for (const name of ignored) {
    const path = join(source.nested, ".changeset", name);
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, text);
  }
  // Only README is case-insensitive; this lowercase file is a genuine intent.
  writeFileSync(join(source.nested, ".changeset/agents.md"), intent);
  git(source.root, "add", "--all");
  git(source.root, "commit", "-m", "test: actual v3 source instructions and case-sensitive intent");
  const prepared = prepare({ ...source, source: git(source.root, "rev-parse", "HEAD") });
  assert.deepEqual(prepared.expected.intents.map(value => value.id).sort(), ["agents", "housekeeping", "metadata"]);
  assert.deepEqual(prepared.expected.plan.releases[0]?.intentIds.toSorted(), ["agents", "metadata"]);
  versionRelease(prepared);
  assert.equal(existsSync(join(source.nested, ".changeset/agents.md")), false);
  for (const name of ignored) assert.equal(readFileSync(join(source.nested, ".changeset", name), "utf8"), text);
  for (const name of ["AGENTS.md", "readme.md"]) {
    const path = join(source.nested, ".changeset", name);
    try { writeFileSync(path, `${text}Unapproved candidate instruction.\n`); assert.throws(() => inspect(prepared), /diff.unexpected/); }
    finally { writeFileSync(path, text); }
  }
  inspect(prepared);
});

test("the first canary changelog is generated by Changesets without fabricated historical entries", t => {
  const source = fixture(t, true, false);
  const prepared = prepare(source);
  assert.equal(prepared.expected.permittedChanges.find(change => change.classification === "changelog")?.kind, "added");
  versionRelease(prepared);
  const changelog = readFileSync(join(source.nested, "CHANGELOG.md"), "utf8");
  assert.ok(changelog.startsWith("# @agent-teams/npm-publishing-canary\n\n## 0.0.3\n"));
  assert.doesNotMatch(changelog, /^## 0\.0\.2/m);
});

test("the independent complete tree rejects nested and repository-wide candidate tampering", t => {
  const source = fixture(t);
  const prepared = prepare(source);
  versionRelease(prepared);
  const mutate = (path: string, change: (text: string) => string, expected: RegExp): void => {
    const file = join(source.root, path);
    const original = existsSync(file) ? readFileSync(file) : undefined;
    try { writeFileSync(file, change(original?.toString("utf8") ?? "")); assert.throws(() => inspect(prepared), expected, path); }
    finally { if (original) writeFileSync(file, original); else rmSync(file); }
  };
  const nested = (path: string): string => `${releasePackageDirectory}/${path}`;
  mutate(nested("package.json"), text => JSON.stringify({ ...JSON.parse(text), version: "0.0.4" }), /plan.version-mismatch/);
  mutate(nested("package.json"), text => JSON.stringify({ ...JSON.parse(text), scripts: { build: "unapproved" } }), /manifest.content-changed/);
  mutate(nested("package-lock.json"), text => JSON.stringify({ ...JSON.parse(text), version: "0.0.2" }), /two matching root version fields/);
  mutate(nested("package-lock.json"), text => {
    const lock = JSON.parse(text) as { packages: Record<string, Record<string, unknown>> };
    lock.packages["node_modules/@changesets/cli"]!.integrity = "sha512-altered";
    return JSON.stringify(lock);
  }, /two matching root version fields/);
  mutate(nested("CHANGELOG.md"), text => text.replace("Previous release.", "Altered history."), /preserve its existing history/);
  mutate(nested(".changeset/metadata.md"), () => intent, /intent.consumption/);
  mutate("source.ts", () => "export const unexpected = true;\n", /diff.unexpected/);
  git(source.root, "update-index", "--assume-unchanged", "source.ts");
  try { mutate("source.ts", () => "export const hidden = true;\n", /diff.unexpected/); }
  finally { git(source.root, "update-index", "--no-assume-unchanged", "source.ts"); }
  mutate("package.json", () => '{"name":"unadmitted-root","private":true}\n', /nested public canary package|manifest|inventory/);
  mutate("unexpected.txt", () => "unlisted generation\n", /diff.unexpected/);
  mutate("__proto__", () => "special filename remains a real observed file\n", /diff.unexpected/);
  mkdirSync(join(source.nested, "dist"));
  try { mutate(nested("dist/unlisted.js"), () => "ignored generated output\n", /diff.unexpected/); }
  finally { rmSync(join(source.nested, "dist"), { recursive: true }); }
  chmodSync(join(source.nested, "package.json"), 0o755);
  try { assert.throws(() => inspect(prepared), /diff.unexpected/); }
  finally { chmodSync(join(source.nested, "package.json"), 0o644); }
  inspect(prepared);
});

test("generation binds the actual processed source, nested installation, and Git authority", t => {
  const source = fixture(t);
  const prepared = prepare(source);
  for (const path of [join(source.root, "source.ts"), join(source.nested, ".changeset/config.json"), prepared.custody.cli]) {
    const before = readFileSync(path);
    try { writeFileSync(path, `${before.toString("utf8")}\n`); assert.throws(() => versionRelease(prepared), /Source inputs changed|engine installation changed/); }
    finally { writeFileSync(path, before); }
  }
  const moved = join(source.directory, "moved-source");
  renameSync(source.root, moved);
  symlinkSync(moved, source.root, "dir");
  try { assert.throws(() => versionRelease(prepared), /custody changed/); }
  finally { rmSync(source.root); renameSync(moved, source.root); }
  git(source.root, "commit", "--allow-empty", "-m", "test: processed source advanced");
  assert.throws(() => versionRelease(prepared), /custody changed/);
  assert.equal(readJson(join(source.nested, "package.json")).version, "0.0.2");
});

test("current-base replay and publication admission reject a tampered candidate without packing or publishing", t => {
  const source = fixture(t);
  const npm = releaseNpmEntrypoint();
  const prepared = prepare(source);
  git(source.root, "switch", "-c", "changeset-release/main");
  versionRelease(prepared);
  git(source.root, "add", "--all");
  git(source.root, "commit", "-m", "chore(release): version npm canary");
  const head = git(source.root, "rev-parse", "HEAD");
  assert.doesNotThrow(() => qualifyReleasePr(source.root, source.source, head, npm));
  assert.doesNotThrow(() => qualifyReleaseSource(source.root, head, npm));
  // Model a rejected source at the same squash boundary, not a second source
  // commit that happens to have no pending intent.
  const manifest = join(source.nested, "package.json");
  writeJson(manifest, { ...readJson(manifest), scripts: { build: "unapproved" } });
  git(source.root, "add", "--all");
  git(source.root, "commit", "--amend", "--no-edit");
  assert.throws(() => qualifyReleaseSource(source.root, git(source.root, "rev-parse", "HEAD"), npm), /manifest.content-changed/);
  git(source.root, "reset", "--hard", head);
  const changelog = join(source.nested, "CHANGELOG.md");
  writeFileSync(changelog, readFileSync(changelog, "utf8").replace("### Patch Changes", "### Patch Changes\n\nUnapproved extra text."));
  git(source.root, "add", "--all");
  git(source.root, "commit", "--amend", "--no-edit");
  assert.throws(() => qualifyReleasePr(source.root, source.source, git(source.root, "rev-parse", "HEAD"), npm), /independently replayed/);
  git(source.root, "switch", "main");
  writeFileSync(join(source.root, "source.ts"), "export const newBase = true;\n");
  git(source.root, "add", "--all");
  git(source.root, "commit", "-m", "test: accepted base advances");
  assert.throws(() => qualifyReleasePr(source.root, git(source.root, "rev-parse", "HEAD"), head, npm));
});
