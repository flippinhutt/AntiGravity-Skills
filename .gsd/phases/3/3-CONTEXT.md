# Phase 3 - Context

**Status:** Ready for planning

<decisions>
## Implementation Decisions

### Installation Target Directory
- Always install new skills to the Global directory (`~/.gemini/antigravity/skills/`) by default when clicking "Install" from the remote view.

### Handling Installation Conflicts
- Prompt the user to confirm whether to overwrite or cancel if a skill folder with the same name already exists in the target directory.

### "Create Skill" Template Structure
- Prompt the user to select from a list of predefined templates (e.g., "Minimal", "Script-based", "Multi-agent") when creating a new skill.
</decisions>
