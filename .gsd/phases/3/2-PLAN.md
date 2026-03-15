---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Skill Creation Templates

## Objective
Enable users to create new skills rapidly by selecting from predefined templates (Minimal, Script-based, Multi-agent) which will be generated in the Workspace directory.

## Context
- `.gsd/SPEC.md`
- `.gsd/REQUIREMENTS.md` (REQ-04)
- `.gsd/phases/3/3-CONTEXT.md` (Prompt for predefined templates)

## Tasks

<task type="auto">
  <name>Implement Template Generation Logic</name>
  <files>
    <file>package.json</file>
    <file>src/extension.ts</file>
    <file>src/services/TemplateService.ts</file>
  </files>
  <action>
    - Add command `antigravity.createSkill` to `package.json` (title: "Create New Skill"). Add it to the standard command palette and optionally as an action button on the Local Skills view header.
    - Create `src/services/TemplateService.ts`.
    - Define template structures (e.g. Minimal = `SKILL.md` only; Script-based = `SKILL.md` + `scripts/run.sh`). Keep definitions simple as string literals or simple objects for now.
    - In `src/extension.ts`, register the command:
      1. Ensure a Workspace folder is open (fallback to prompting for a directory if not, or just `showErrorMessage` "Please open a workspace to create a skill"). Target path will be `<workspace>/.gemini/antigravity/skills/`.
      2. Ask user for a Skill ID/Name (`vscode.window.showInputBox`). Validate it's non-empty and has no spaces (e.g., `my-new-skill`).
      3. Check for UI conflict: if `<workspace>/.gemini/antigravity/skills/<skill-name>` exists, show an error and abort to prevent accidental overwrites on creation.
      4. Prompt user to select a template type (`vscode.window.showQuickPick` with options "Minimal", "Script-based", "Multi-agent").
      5. Create the directory hierarchy and write the template files using standard `fs` (Node.js).
      6. Refresh local skills tree view.
      7. Open the newly generated `SKILL.md` in the editor (`vscode.workspace.openTextDocument` and `showTextDocument`).
  </action>
  <verify>npm run compile</verify>
  <done>Users can invoke "Create New Skill", select a template, and have a new scaffolded skill ready to edit in their workspace.</done>
</task>

## Success Criteria
- [ ] Users can trigger the "Create New Skill" command.
- [ ] Users are prompted for a skill name and template type.
- [ ] Boilerplate files are cleanly generated in the active workspace.
- [ ] The new `SKILL.md` is automatically opened.
