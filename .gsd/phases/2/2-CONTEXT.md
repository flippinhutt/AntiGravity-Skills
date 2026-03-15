# Phase 2 - Context

**Status:** Ready for planning

<decisions>
## Implementation Decisions

### GitHub API Authentication
- Use VSCode's built-in GitHub authentication (`vscode.authentication`) to seamlessly request and use tokens for API calls.

### Storing the Repository List
- Store the list of skill repositories in VSCode Settings (e.g., `antigravity.skillRepositories`).

### Remote Skills UI Integration
- Add a new, separate Tree View panel called "Remote Skills" underneath the "Local Skills" panel in the Antigravity Activity Bar view. (Claude's discretion chosen for cleaner separation of interactive commands and views).
</decisions>
