---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Remote Skill Installation

## Objective
Implement a VSCode command to install a remote skill from a GitHub repository to the local system (`~/.gemini/antigravity/skills/`). It should handle conflict resolution by prompting the user if the skill already exists.

## Context
- `.gsd/SPEC.md`
- `.gsd/REQUIREMENTS.md` (REQ-03)
- `.gsd/phases/3/3-CONTEXT.md` (Install to Global, prompt on conflict)

## Tasks

<task type="auto">
  <name>Implement GitHub Download Service</name>
  <files>
    <file>src/services/GitHubService.ts</file>
  </files>
  <action>
    - Add a method to `GitHubService` to recursively download a folder from a GitHub repository.
    - Input: `ownerRepo` (e.g. `owner/repo`), `skillPath` (the path to the skill in the repo), and `targetLocalDir` (the absolute path on the local filesystem).
    - Since GitHub API's `/contents` endpoint provides `download_url` for files, we can use `fetch` to download the raw content.
    - If an item is a `dir`, make another API call to get its contents and recursively create the subdirectories locally.
  </action>
  <verify>npm run compile</verify>
  <done>GitHubService has a robust recursive download method.</done>
</task>

<task type="auto">
  <name>Create Installation Command</name>
  <files>
    <file>package.json</file>
    <file>src/extension.ts</file>
  </files>
  <action>
    - Update `package.json` to contribute the command `antigravity.installSkill` with a title like "Install Skill".
    - Update the menus contribution in `package.json` to attach this command to the `view/item/context` of `antigravity.remoteSkills` view. Condition it so it only appears on `skill` items (folders), not files. (Requires setting `contextValue` on TreeItems).
    - Update `src/extension.ts` to register `antigravity.installSkill`. It should receive a `SkillItem` as an argument.
    - **Logic**:
      1. Determine Global path setting (`os.homedir() + '/.gemini/antigravity/skills/'`).
      2. The target directory for the skill is `<GlobalPath>/<skillName>`.
      3. **Conflict Check**: Use `fs.existsSync(targetDir)`. If true, use `vscode.window.showWarningMessage` with buttons "Overwrite" and "Cancel". Abort if Cancel.
      4. Show a `vscode.window.withProgress` dialog while downloading.
      5. Call `GitHubService.downloadFolder(...)`.
      6. On success, show an info message and invoke `vscode.commands.executeCommand('antigravity.refreshLocalSkills')`.
  </action>
  <verify>npm run compile</verify>
  <done>Users can right-click a remote skill, click Install, and see it appear in their Local Skills view.</done>
</task>

## Success Criteria
- [ ] "Install Skill" appears in the context menu for remote skills.
- [ ] Clicking Install downloads the skill to `~/.gemini/antigravity/skills/<skillName>`.
- [ ] The user is prompted if the skill folder already exists.
- [ ] The local tree view refeshes automatically after a successful installation.
