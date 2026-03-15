---
phase: 6
plan: 1
completed_at: 2026-03-15T15:30:00-05:00
---

# Summary: Workspace Support & New Settings

## Results
- Extracted Global path resolution into a shared `getGlobalSkillsPath` helper, which now honors the `antigravity.customGlobalSkillsPath` user setting.
- Updated `LocalSkillProvider` to skip folders without a `SKILL.md` if the user turns on the `antigravity.hideInvalidSkills` setting.
- Introduced `promptForSkillTarget` to both `installSkill` and `createSkill` commands, surfacing a VSCode built-in QuickPick that detects if a workspace folder is open and provides an option to create/install the skill inside that active Workspace instead of globally.
- Compilation and local build successful.

## Files Changed
- `package.json`: Registered `antigravity.customGlobalSkillsPath` and `antigravity.hideInvalidSkills`.
- `src/providers/LocalSkillProvider.ts`: Modified tree-traversal loops to respect settings.
- `src/extension.ts`: Added helper paths, interactive user prompts, and refactored both installation & scaffold targets.
