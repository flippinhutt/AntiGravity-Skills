# Antigravity Skill Manager

Manage and build Antigravity skills directly in Visual Studio Code.

![Antigravity Icon](https://raw.githubusercontent.com/flippinhutt/AntiGravity-Skills/main/icon.png)

## Overview

The Antigravity Skill Manager is a VS Code extension designed to streamline the lifecycle of Antigravity skills. It provides a dedicated sidebar for managing local skills, discovering remote skills from GitHub, and scaffolding new skills from templates.

## Features

### 📂 Local Skill Management
- **Automatic Detection**: Automatically finds skills in your global configuration (`~/.gemini/antigravity/skills`) and your active workspace folders.
- **File Browsing**: Browse the contents of your skills directly from the sidebar.
- **Error Detection**: Identifies skills missing a `SKILL.md` file and provides guidance on how to fix them.

### 🌐 Remote Skill Discovery
- **GitHub Integration**: Browse remote repositories for curated Antigravity skills.
- **One-Click Installation**: Install remote skills directly into your global library or your current workspace.
- **Read-Only Preview**: View remote `SKILL.md` and other files directly in VS Code before installing.

### 🛠️ Skill Scaffolding
- **Template System**: Create new skills using predefined structural templates (Standard, Minimal, etc.).
- **Workspace Integration**: Choose whether to create new skills globally or keep them project-specific.

### ⚙️ User Customization
- **Remote Repo Management**: Add or remove GitHub repositories from the "Remote Skills" view title bar or context menus.
- **Custom Paths**: Override the default global skills directory.
- **Tidy View**: Toggle hiding of invalid skills missing a `SKILL.md`.

## Getting Started

1. **Install the Extension**: Find "Antigravity Skill Manager" in the VS Code Marketplace.
2. **Open the Sidebar**: Click the **Rocket** icon in the Activity Bar.
3. **Configure Remotes**: Use the `+` icon in the "Remote Skills" header to add repositories (format: `owner/repo`).
4. **Create your first Skill**: Click the `+` icon in "Local Skills" to scaffold a new skill from a template.

## Settings

- `antigravity.skillRepositories`: List of GitHub repositories (`owner/repo`) to browse for skills.
- `antigravity.customGlobalSkillsPath`: Path to your preferred global skills directory (supports `~`).
- `antigravity.hideInvalidSkills`: Hide folders that do not contain a `SKILL.md`.

## License

This extension is licensed under the [MIT License](LICENSE).
