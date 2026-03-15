---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Error Handling & UX Polish

## Objective
Refine the user experience by handling invalid local skills (missing `SKILL.md`) gracefully with visual error indicators, and ensuring the extension activates promptly.

## Context
- `.gsd/ROADMAP.md` (Phase 4, REQ-05)
- `.gsd/phases/4/4-CONTEXT.md` (Error icons for missing skills, `*` activation event)

## Tasks

<task type="auto">
  <name>Implement Missing SKILL.md Handling</name>
  <files>
    <file>src/models/SkillItem.ts</file>
    <file>src/providers/LocalSkillProvider.ts</file>
    <file>package.json</file>
    <file>src/extension.ts</file>
  </files>
  <action>
    - Update `LocalSkillProvider.ts`: when reading directories from `~/.gemini/antigravity/skills` or `<workspace>/.gemini/antigravity/skills`, explicitly check if a `SKILL.md` file exists inside each skill folder.
    - If `SKILL.md` is missing, assign the `SkillItem` a `description` of "Invalid Skill (Missing SKILL.md)" and an icon of `new vscode.ThemeIcon('error')`.
    - Set the `contextValue` of these invalid skill items to `invalid-skill`.
    - Update `package.json` to add a new command `antigravity.showInvalidSkillError` and bind it to the click action of `invalid-skill` items.
    - Implement the command in `extension.ts` to show a `vscode.window.showErrorMessage` explaining that the folder lacks a SKILL.md file.
  </action>
  <verify>npm run compile</verify>
  <done>Local skill folders without SKILL.md show up cleanly with red error icons and provide helpful feedback when clicked.</done>
</task>

<task type="auto">
  <name>Update Activation Pattern</name>
  <files>
    <file>package.json</file>
  </files>
  <action>
    - Update `activationEvents` in `package.json` to explicitly contain `*` so the extension activates on startup, ensuring the Activity Bar icon and views are always fully initialized and responsive immediately upon VSCode launch.
  </action>
  <verify>npm run compile</verify>
  <done>Extension explicitly specifies startup activation.</done>
</task>

## Success Criteria
- [ ] Folders without `SKILL.md` appear in Local Skills with an error icon.
- [ ] Clicking an invalid skill shows a descriptive error message instead of trying to open a non-existent file.
- [ ] `activationEvents` array in `package.json` includes `*`.
