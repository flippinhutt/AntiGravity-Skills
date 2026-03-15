---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: GitHub API Integration

## Objective
Implement GitHub API calls to fetch the contents of the configured remote skill repositories, using VSCode's built-in authentication, and display the actual skills in the Remote TreeView.

## Context
- `.gsd/SPEC.md`
- `.gsd/REQUIREMENTS.md` (REQ-02)
- `.gsd/phases/2/2-CONTEXT.md` (Authentication decisions: Use `vscode.authentication`)

## Tasks

<task type="auto">
  <name>Implement GitHub Fetching Logic</name>
  <files>
    <file>src/services/GitHubService.ts</file>
  </files>
  <action>
    - Create `GitHubService.ts` to handle API communication.
    - Implement a method to get a GitHub PAT using VSCode's built-in auth: `vscode.authentication.getSession('github', ['repo'], { createIfNone: false })`. 
    - Note: This method should gracefully handle the case where no session exists (return undefined/null) rather than forcing a prompt immediately on load.
    - Implement a method to fetch the repository contents (the `/contents` endpoint) for a given `owner/repo`.
    - If a GitHub session exists, pass the token in the `Authorization: Bearer <token>` header. If not, make an unauthenticated request.
    - We will need a library like `node-fetch` or `axios`, or just use Node's native `https` or `fetch` (if Node 18+ is guaranteed by targeted VSCode version). Use native built-in `fetch` since VSCode extension host supports it.
  </action>
  <verify>npm run compile</verify>
  <done>GitHubService compiles and exposes methods for auth and fetching repo contents.</done>
</task>

<task type="auto">
  <name>Integrate Fetching with Remote TreeView</name>
  <files>
    <file>src/providers/RemoteSkillProvider.ts</file>
    <file>src/extension.ts</file>
  </files>
  <action>
    - Update `RemoteSkillProvider` to use `GitHubService`.
    - When expanding a repository (a top-level `SkillItem`), it should call the GitHub API to list the folders inside the repo.
    - Assume folders in the root of the target repo are the skills. Return these as child `SkillItem`s.
    - Add a command to refresh the remote skills view (`antigravity.refreshRemoteSkills`).
    - Add an explicit command `antigravity.githubLogin` that calls `getSession` with `{ createIfNone: true }` to allow users to manually trigger the auth flow if they want higher rate limits.
  </action>
  <verify>npm run compile</verify>
  <done>Expanding a repo in the Remote Skills view fetches and displays its contents from GitHub.</done>
</task>

## Success Criteria
- [ ] Users can log in to GitHub via a command.
- [ ] Unauthenticated fetching works (within rate limits).
- [ ] Expanding a repository in the Remote panel shows the skills available in that GitHub repo.
