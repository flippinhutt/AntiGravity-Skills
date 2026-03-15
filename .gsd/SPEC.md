# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A VSCode extension that simplifies the lifecycle of Antigravity skills, providing a seamless experience for discovery, installation, and modification within the IDE.

## Goals
1. **Integrated Discovery**: Browse skills from local folders, global paths, and community GitHub repositories via a unified Sidebar UI.
2. **Easy Installation**: One-click installation of skills from GitHub repositories to the local environment.
3. **Streamlined Authoring**: Create new skills using predefined templates and edit existing ones with a focused interface.
4. **Extensible Sources**: Manage the list of external skill repositories directly through the extension's GUI.

## Non-Goals (Out of Scope)
- Building a full "Skill Marketplace" with backend authentication/payments.
- Automated skill testing/execution (reserved for future versions).
- Direct modification of Antigravity core engine.

## Users
- **AI Developers**: Individuals building and customizing skills for Antigravity-native agents.
- **Power Users**: Antigravity users who want to quickly extend their agent's capabilities without manual file management.

## Constraints
- **Platform**: Must be a standard VSCode Extension (TypeScript/Node.js).
- **Filesystem**: Must respect standard Antigravity skill paths (`~/.gemini/antigravity/skills`).
- **Network**: Relies on GitHub API for discovery and installation of remote skills.

## Success Criteria
- [ ] User can browse the default repositories (`rominirani/antigravity-skills`, `sickn33/antigravity-awesome-skills`) in the sidebar.
- [ ] User can install a skill from GitHub into their local skills folder.
- [ ] User can create a new skill from a template in their local workspace.
- [ ] Local skills are detected and editable via the sidebar.
