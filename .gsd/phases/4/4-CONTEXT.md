# Phase 4 - Context

**Status:** Ready for planning

<decisions>
## Implementation Decisions

### 1. Handling Invalid or Missing SKILL.md Files
- Display folders that lack a `SKILL.md` in the Local Skills view but mark them with an error icon. Clicking them should show an error message.

### 2. GitHub Rate Limiting Feedback
- Show a standard VSCode error toast notification when the limit is hit, prompting the user to use the `Antigravity: Login to GitHub` command. (Agent Choice)

### 3. Extension Activation Pattern
- `*` (Activate immediately on VSCode startup, ensuring views are always instantly ready).
</decisions>
