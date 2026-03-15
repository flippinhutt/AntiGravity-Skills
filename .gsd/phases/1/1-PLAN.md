---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Extension Boilerplate & Infrastructure

## Objective
Set up the foundational VSCode extension project structure using modern tooling (`esbuild` or `tsup`) as requested by the user, and configure the necessary manifests for the Antigravity Skill Manager.

## Context
- `~/.gemini/GEMINI.md` (User preferences: TypeScript, modern build tools, small safe changes)
- `.gsd/SPEC.md`
- `.gsd/phases/1/1-CONTEXT.md`

## Tasks

<task type="auto">
  <name>Scaffold Extension Project</name>
  <files>
    <file>package.json</file>
    <file>tsconfig.json</file>
    <file>esbuild.js</file>
    <file>src/extension.ts</file>
    <file>.vscode/launch.json</file>
    <file>.vscode/tasks.json</file>
  </files>
  <action>
    - Initialize a new `package.json` for a VSCode extension named `antigravity-skill-manager`.
    - Set publisher to `tonight` or `ryanhutto` (user preference).
    - Configure `devDependencies` including `@types/vscode`, `typescript`, and `esbuild`.
    - Create a minimal `src/extension.ts` that exports `activate` and `deactivate`.
    - Set up a build script (`esbuild.js` or in `package.json`) to bundle the extension.
    - Set up VSCode debug configurations (`launch.json` and `tasks.json`) to test the extension locally.
    - DO NOT use `yo code` template as the user explicitly chose the modern `esbuild` option in Phase 1 decisions.
  </action>
  <verify>npm run compile (or equivalent build command)</verify>
  <done>The extension compiles successfully without type errors and produces a functional bundle.</done>
</task>

## Success Criteria
- [ ] `package.json` represents a valid VSCode extension.
- [ ] The `esbuild` build process compiles `src/extension.ts` successfully.
- [ ] Debug configuration is ready for F5 launching in VSCode.
