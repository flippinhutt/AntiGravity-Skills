---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Workspace Support & New Settings

## Objective
Provide first-class support for both global and workspace-level skills during creation and installation, and introduce user settings for overriding the global path and hiding invalid skills.

## Context
- `installSkill` currently hardcodes installation to the global `~/.gemini/antigravity/skills` directory.
- `createSkill` currently hardcodes creation to the first workspace folder.
- The user requested the ability to manage project-only skills explicitly, and to add settings for `customGlobalSkillsPath` and `hideInvalidSkills`.

## Tasks

<task type="auto">
  <name>Add Configuration Settings</name>
  <files>
    <file>package.json</file>
  </files>
  <action>
    - Add `antigravity.customGlobalSkillsPath` (string, default `""`) to `contributes.configuration`.
    - Add `antigravity.hideInvalidSkills` (boolean, default `false`) to `contributes.configuration`.
  </action>
  <verify>npm run compile</verify>
  <done>package.json contains new settings.</done>
</task>

<task type="auto">
  <name>Implement Settings in LocalSkillProvider</name>
  <files>
    <file>src/providers/LocalSkillProvider.ts</file>
  </files>
  <action>
    - In `getTopLevelSkills`, read `customGlobalSkillsPath`. If set, use it (expanding `~` to `os.homedir()` if necessary). Otherwise, fall back to the default `~/.gemini/antigravity/skills`.
    - In `readSkillDirectories`, read `hideInvalidSkills`. If true and `!hasSkillMd`, skip adding the item to the list.
  </action>
  <verify>npm run compile</verify>
  <done>Local tree respects both new settings.</done>
</task>

<task type="auto">
  <name>Support Target Selection in Commands</name>
  <files>
    <file>src/extension.ts</file>
  </files>
  <action>
    - Create a helper `getGlobalSkillsPath()` to resolve the global path consistently using the new setting.
    - Create a helper `promptForSkillTarget(): Promise<string | undefined>` that:
      - Checks if a workspace is open.
      - If no workspace, returns the global path automatically.
      - If a workspace is open, shows a `QuickPick` with "Global" and "Workspace ([name])" options.
      - Returns the base directory for the skills folder (`.gemini/antigravity/skills` appended if workspace, or the resolved global path).
    - Refactor `installSkill` to await `promptForSkillTarget()`.
    - Refactor `createSkill` to await `promptForSkillTarget()`.
  </action>
  <verify>npm run compile</verify>
  <done>Both install and create commands give the user the choice between Global and Workspace.</done>
</task>

## Success Criteria
- [ ] Users can install remote skills directly into their workspace.
- [ ] Users can scaffold new skills globally.
- [ ] Changing `hideInvalidSkills` removes the red error items from the tree.
- [ ] Changing `customGlobalSkillsPath` shifts the global root correctly.
