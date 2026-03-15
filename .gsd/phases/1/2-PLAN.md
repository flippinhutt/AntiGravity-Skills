---
phase: 1
plan: 2
wave: 2
---

# Plan 1.2: Local Skills TreeView Provider

## Objective
Implement the VSCode TreeView API to display local Antigravity skills in the sidebar. The tree should merge skills found in the global directory (`~/.gemini/antigravity/skills`) and the current VSCode workspace.

## Context
- `.gsd/SPEC.md`
- `.gsd/REQUIREMENTS.md` (REQ-01, REQ-07)
- `.gsd/phases/1/1-CONTEXT.md` (Local Skills Path Resolution & UX decisions)

## Tasks

<task type="auto">
  <name>Implement Skill Data Providers</name>
  <files>
    <file>src/providers/LocalSkillProvider.ts</file>
    <file>src/models/SkillItem.ts</file>
  </files>
  <action>
    - Create `SkillItem.ts` extending `vscode.TreeItem` to represent a Skill or a File within a skill.
    - Create `LocalSkillProvider.ts` implementing `vscode.TreeDataProvider<SkillItem>`.
    - Implement logic to scan `~/.gemini/antigravity/skills` (handling `os.homedir()`).
    - Implement logic to scan the currently open VSCode workspace(s) for a `.gemini/antigravity/skills` directory or similar local skill structure.
    - Merge the results into a single tree hierarchy.
    - As per user decision: Make top-level items the skill folders, which are expandable (collapsibleState). Child items should be the internal files (e.g., `SKILL.md`).
  </action>
  <verify>npx eslint src/providers/LocalSkillProvider.ts OR simply compiling the TS.</verify>
  <done>The provider logic correctly identifies and parses skill directories into TreeItems.</done>
</task>

<task type="auto">
  <name>Register Sidebar View</name>
  <files>
    <file>package.json</file>
    <file>src/extension.ts</file>
  </files>
  <action>
    - Update `package.json` to contribute a `viewsContainer` (Activity Bar icon) and a `view` (the sidebar panel) named "Antigravity Skills".
    - In `src/extension.ts`, register the `LocalSkillProvider` to the contributed view ID using `vscode.window.createTreeView` or `vscode.window.registerTreeDataProvider`.
    - Register a VSCode command (e.g., `antigravity.openSkillFile`) that triggers when a child file (like `SKILL.md`) is clicked.
    - Implement the command to open the text document in the editor using `vscode.workspace.openTextDocument` and `vscode.window.showTextDocument`.
  </action>
  <verify>Compile extension and inspect package.json syntax.</verify>
  <done>The extension contributes the view correctly and the open file command is registered.</done>
</task>

## Success Criteria
- [ ] The sidebar view displays global local skills.
- [ ] The sidebar view merges workspace-local skills if they exist.
- [ ] Clicking a skill expands it to show files.
- [ ] Clicking a file opens it in the VSCode editor.
