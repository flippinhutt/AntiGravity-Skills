---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Remote Repository Management UI

## Objective
Provide UI commands to add and remove GitHub repositories from the `antigravity.skillRepositories` setting directly from the VSCode sidebar, rather than requiring users to manually edit `settings.json`.

## Context
- The user requested a way to manage remote repos via UI.
- `antigravity.skillRepositories` stores the list of `owner/repo` strings.
- We need two commands: `antigravity.addRemoteRepo` and `antigravity.removeRemoteRepo`.

## Tasks

<task type="auto">
  <name>Register Management Commands</name>
  <files>
    <file>package.json</file>
  </files>
  <action>
    - Add `antigravity.addRemoteRepo` to `contributes.commands` with title "Add Remote Repository" and icon `$(add)`.
    - Add `antigravity.removeRemoteRepo` to `contributes.commands` with title "Remove Repository" and icon `$(trash)`.
    - Add `antigravity.addRemoteRepo` to `menus.view/title` when `view == antigravity.remoteSkills`.
    - Add `antigravity.removeRemoteRepo` to `menus.view/item/context` when `view == antigravity.remoteSkills` and `viewItem == repo`.
  </action>
  <verify>npm run compile</verify>
  <done>package.json contains new commands and menu bindings.</done>
</task>

<task type="auto">
  <name>Update RemoteSkillProvider Context Value</name>
  <files>
    <file>src/providers/RemoteSkillProvider.ts</file>
  </files>
  <action>
    - In `getTopLevelRepositories`, set `item.contextValue = 'repo'` instead of `'skill'` so that the remove context menu only appears on root repositories, not on the skills inside them.
  </action>
  <verify>npm run compile</verify>
  <done>Top-level repos have contextValue 'repo'.</done>
</task>

<task type="auto">
  <name>Implement Command Handlers</name>
  <files>
    <file>src/extension.ts</file>
  </files>
  <action>
    - Register `antigravity.addRemoteRepo`:
      - Trigger `vscode.window.showInputBox` asking for `owner/repo`.
      - Validate format (`/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/`).
      - Fetch current `antigravity.skillRepositories` from `vscode.workspace.getConfiguration`.
      - Check for duplicates.
      - Update configuration (using `ConfigurationTarget.Global`).
      - Call `remoteSkillProvider.refresh()`.
    - Register `antigravity.removeRemoteRepo` (takes `SkillItem`):
      - Read repo to remove from `item.githubOwnerRepo`.
      - Fetch current repos from configuration.
      - Filter out the removed repo.
      - Update configuration.
      - Call `remoteSkillProvider.refresh()`.
  </action>
  <verify>npm run compile</verify>
  <done>Commands are fully functional and update settings.json automatically.</done>
</task>

## Success Criteria
- [ ] Clicking `+` on the Remote Skills view title prompts for a new repo and adds it.
- [ ] Right-clicking a root repository shows a "Remove Repository" option.
- [ ] Adding/removing updates the TreeView instantly.
