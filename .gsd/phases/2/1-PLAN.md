---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Remote Skills Settings & UI Foundation

## Objective
Set up the VSCode configuration settings to store the user's remote skill repositories and create the foundational TreeView structure for "Remote Skills" in the sidebar, per the Phase 2 user decisions.

## Context
- `.gsd/SPEC.md`
- `.gsd/REQUIREMENTS.md` (REQ-01, REQ-06)
- `.gsd/phases/2/2-CONTEXT.md` (UI and Settings decisions)

## Tasks

<task type="auto">
  <name>Configure Extension Settings</name>
  <files>
    <file>package.json</file>
  </files>
  <action>
    - Add a `contributes.configuration` section to `package.json`.
    - Define a setting `antigravity.skillRepositories` of type `array` containing `string` items.
    - Set the default value to the repos specified by the user: `["rominirani/antigravity-skills", "sickn33/antigravity-awesome-skills"]`.
    - Add a description explaining that these are GitHub repositories (format: `owner/repo`) to search for Antigravity skills.
  </action>
  <verify>npm run compile</verify>
  <done>package.json contains the new configuration schema without compilation errors.</done>
</task>

<task type="auto">
  <name>Register Remote Skills TreeView</name>
  <files>
    <file>package.json</file>
    <file>src/extension.ts</file>
    <file>src/providers/RemoteSkillProvider.ts</file>
  </files>
  <action>
    - Update `package.json` to contribute a new view `antigravity.remoteSkills` under the existing `antigravity` viewsContainer, named "Remote Skills".
    - Create `src/providers/RemoteSkillProvider.ts` implementing `vscode.TreeDataProvider<SkillItem>`.
    - For now, the provider should just read the `antigravity.skillRepositories` setting using `vscode.workspace.getConfiguration('antigravity')` and return those strings as top-level `SkillItem`s (representing the repos).
    - Update `src/extension.ts` to instantiate `RemoteSkillProvider` and register it to `antigravity.remoteSkills`.
  </action>
  <verify>npm run compile</verify>
  <done>A new "Remote Skills" panel appears in the UI and lists the configured repositories from settings.</done>
</task>

## Success Criteria
- [ ] The `antigravity.skillRepositories` setting exists in VSCode settings.
- [ ] The Antigravity sidebar contains a "Remote Skills" panel.
- [ ] The Remote Skills panel displays the repositories listed in the settings.
