# Technical Reference: AntiGravity Skills Extension

This document provides a technical overview of the internal components and services of the AntiGravity Skills VS Code extension.

## Extension Entry Point (`extension.ts`)

The extension's lifecycle is managed by the `activate` and `deactivate` functions. On activation, it registers:
- `antigravity.localSkills`: Webview provider for local skill management.
- `antigravity.remoteSkills`: Webview provider for GitHub skill discovery.
- `antigravity-remote`: Custom `TextDocumentContentProvider` for read-only remote file previews.
- Commands for refreshing views, GitHub login, skill installation, and scaffolding.

---

## Services

### `GitHubService`
- **Purpose**: Handles all interactions with the GitHub REST API.
- **Key Methods**:
    - `getToken(forcePrompt)`: Retrieves or prompts for a GitHub PAT.
    - `getRepoContent(owner, repo, path)`: Navigates repository trees.
    - `downloadFolder(owner, repo, path, targetDir)`: Recursively downloads a folder from GitHub and saves it locally.

### `TemplateService`
- **Purpose**: Scaffolds new skills from predefined structures.
- **Key Methods**:
    - `getTemplates(skillName)`: Returns a list of available structural templates.
    - `generateTemplate(skillName, type, targetDir)`: Writes the necessary `SKILL.md` and folder structure based on the selected type.

---

## Data Providers

### `SkillsWebviewProvider`
- **Purpose**: Implements the `vscode.WebviewViewProvider` interface to render the skill management UI.
- **Logic**: 
    - Dynamically builds the HTML content for the sidebar.
    - Handles message passing for actions like "Install", "Open", or "Delete".
    - **Filtering & Sorting (v1.0.7+)**: Implements custom search logic to ensure `SKILL.md` is always displayed and prioritized at the top of the list.
    - **Remote Installation (v1.0.7+)**: Added `installSkill` message handler which triggers the extension host's installation command.
    - **Documentation (v1.0.8)**: Full JSDoc coverage for all services and providers to support developer onboarding and maintainability.

---

## Extension Commands

The extension registers several commands in `extension.ts`:

- `antigravity.installSkill`: Recursively downloads a remote skill folder from GitHub using `GitHubService.downloadFolder`. Prompts the user for a destination (Global or Workspace).
- `antigravity.openSkillFile`: Opens a local file or provides a read-only preview for a remote file via the `antigravity-remote` URI scheme.
- `antigravity.createSkill`: Scaffolds a new skill from a template using `TemplateService`.
- `antigravity.githubLogin`: Facilitates GitHub authentication via VS Code's session manager.
- `antigravity.refreshLocalSkills` / `antigravity.refreshRemoteSkills`: Triggers a refresh of the respective Webview providers.


---

## Configuration Settings

The extension uses the `vscode.workspace.getConfiguration` API to manage user preferences:

- `skillRepositories`: An array of GitHub slugs (`owner/repo`).
- `customGlobalSkillsPath`: Overrides the default `~/.gemini/antigravity/skills` directory.
- `hideInvalidSkills`: Boolean flag to filter out folders without a `SKILL.md`.
