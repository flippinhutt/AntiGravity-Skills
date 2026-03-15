## Phase 4 Verification

### Must-Haves
- [x] Invalid local skill detection — VERIFIED (evidence: `LocalSkillProvider.readSkillDirectories` checks for `SKILL.md`, sets error icon and `invalid-skill` contextValue when missing).
- [x] User feedback on invalid skills — VERIFIED (evidence: clicking an invalid skill triggers `antigravity.showInvalidSkillError` with a descriptive message).
- [x] Immediate activation — VERIFIED (evidence: `activationEvents: ["*"]` in `package.json`).

### Verdict: PASS
