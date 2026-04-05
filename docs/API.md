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
    - **Filtering & Sorting (v1.0.7)**: Implements custom search logic in `_updateView` to ensure `SKILL.md` is always displayed and prioritized at the top of the list, regardless of the active search filter.


---

## Configuration Settings

The extension uses the `vscode.workspace.getConfiguration` API to manage user preferences:

- `skillRepositories`: An array of GitHub slugs (`owner/repo`).
- `customGlobalSkillsPath`: Overrides the default `~/.gemini/antigravity/skills` directory.
- `hideInvalidSkills`: Boolean flag to filter out folders without a `SKILL.md`.
