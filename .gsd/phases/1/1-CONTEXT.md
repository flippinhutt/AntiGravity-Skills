# Phase 1 - Context

**Status:** Ready for planning

<decisions>
## Implementation Decisions

### Local Skills Path Resolution
- Look in *both* the global directory (`~/.gemini/antigravity/skills`) and the current workspace directory, merging the views.

### Extension Tooling & Framework
- Use modern tooling (`esbuild` or `tsup`) for significantly faster builds.

### Tree View Actions UX
- Clicking the skill expands it to show its internal files (e.g., `SKILL.md`, `scripts/`), and clicking those files opens them in the editor.
</decisions>
