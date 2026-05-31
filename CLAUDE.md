# <PROJECT_NAME> — Claude Code

<!-- CLAUDE.md targets Claude Code; AGENTS.md targets Codex/other agents. Divergence is intentional. -->
<!-- This file is a TEMPLATE. Replace <PLACEHOLDERS> with your project's values. -->

@AGENTS.md

This file extends `AGENTS.md` with Claude-Code-specific orchestration: subagent pipeline, slash commands, per-agent model selection, and session completion behavior.

## Project Overview

<One-paragraph description of this project.> The repo orchestrates OpenSpec plans + the `opsx-feature-core` dynamic workflow across one or more **target repos**. The target repos and their default branches are defined in `AGENTS.md` (see the **Target Repos** table).

> **Setup:** edit the **Target Repos** table in `AGENTS.md` to list your repos. Throughout this toolkit, `$REPO_ROOT` is the workspace root that contains the specs repo and its target repos; `<specs-repo>` is the repo that holds `openspec/`, `.claude/`, and agent definitions; `<backend-repo>` / `<frontend-repo>` are placeholder names for your code repos — replace them with your own.

## Architecture

```
User: "I want feature X"
         ↓
   ┌──────────┐  ask questions   ┌──────────┐  plan waves     ┌──────────┐
   │    BA    │ ───────────────▶ │ DEV Lead │ ──────────────▶ │ DEV x N  │
   │ (specs)  │  create specs    │ (plan)   │  file-disjoint  │ (code)   │
   └──────────┘                  └──────────┘                 └──────────┘
                                                                   ↓
                                                         ┌─────────────────┐
                                                         │  Code Review    │
                                                         │ python-reviewer │
                                                         │ ts-reviewer     │
                                                         │ security-review │
                                                         │ silent-failure  │
                                                         └─────────────────┘
                                                                   ↓
                                                              ┌──────────┐
                                                              │ TESTER   │
                                                              │(validate)│
                                                              └──────────┘
                                                                   ↓
                                                              Report to User
```

## Quick Start

```
/opsx:feature
```

Full pipeline:

1. **BA** — asks you questions, determines branch type, creates OpenSpec specs (proposal, design, tasks)
2. **DEVOPS** — creates feature branch (`feature/` | `fixbug/` | `refactor/` from `dev`) in all target repos + `<specs-repo>`
3. **`opsx-feature-core` workflow** (`.claude/workflows/opsx-feature-core.js`) — one dynamic workflow runs the whole implementation core (no task DB; waves live in memory):
   - **Plan** — `dev-lead` decomposes the change into in-memory, file-disjoint, dependency-ordered task *waves*
   - **Implement** — `dev-be`/`dev-fe` in parallel per wave (commit on the branch, **no push**)
   - **Review** — 4 reviewers fan out (structured findings)
   - **Verify** — 3 perspective lenses vote per CRITICAL/HIGH finding (≥2/3 to keep)
   - **Critic** — completeness critic catches missed HIGH/CRITICAL
   - **Test** — `tester` writes missing tests + runs the suite
4. **Gate** — `blockingFindings === 0 && tests pass` ⇒ ready; else surface + re-run/fix (max 3 rounds)
5. **User approves push** — only after the gate passes (never auto-push)
6. **DEVOPS** — pushes branches, creates PR → `dev` (one per repo)
7. **BA** — marks tasks done in `tasks.md`; archive the OpenSpec change when merged

## Subagents

Defined in `.claude/agents/`.

### Core (auto-run in `/opsx:feature` pipeline)

| Agent | File | Role | Model |
|-------|------|------|-------|
| `ba` | `ba.md` | Gather requirements, create specs | Opus |
| `dev-lead` | `dev-lead.md` | Plan phase: decompose change into file-disjoint task waves | Sonnet |
| `dev-be` | `dev-be.md` | Backend (Python/FastAPI) | Sonnet |
| `dev-fe` | `dev-fe.md` | Frontend (React/Vite) | Sonnet |
| `python-reviewer` | `python-reviewer.md` | Python code review | Sonnet |
| `typescript-reviewer` | `typescript-reviewer.md` | TS/React code review | Sonnet |
| `security-reviewer` | `security-reviewer.md` | OWASP Top 10, secrets | Sonnet |
| `silent-failure-hunter` | `silent-failure-hunter.md` | Swallowed errors, empty catches | Sonnet |
| `tester` | `tester.md` | Validate + write missing tests | Sonnet |

### Manual-only

| Agent | File | Role | Model |
|-------|------|------|-------|
| `build-error-resolver` | `build-error-resolver.md` | Fix build/type errors | Sonnet |
| `code-explorer` | `code-explorer.md` | Trace execution paths | Sonnet |
| `devops` | `devops.md` | Git lifecycle, branches, PRs | Sonnet |
| `researcher` | `researcher.md` | Web research (competitors, UI/UX, libs) via built-in WebSearch + WebFetch | Sonnet |

### Invoke individually

```
@ba analyze this feature idea
@dev-lead plan the change into file-disjoint task waves
@dev-be work on backend tasks
@dev-fe work on frontend tasks
@python-reviewer review file <path/to/file.py>
@typescript-reviewer review component <ComponentName>
@security-reviewer scan auth flow in <backend-repo>
@silent-failure-hunter scan <backend-repo>
@tester validate the completed branches
@build-error-resolver fix build error in <frontend-repo>
@code-explorer analyze the <feature> flow
@researcher compare A vs B and propose simplifications
```

## Slash Commands

| Command | Purpose |
|---------|---------|
| `/opsx:feature` | Full pipeline: BA → DEVOPS branch → `opsx-feature-core` workflow (plan→implement→review→verify→critic→test) → push |
| `/opsx:explore` | Think through ideas before planning |
| `/opsx:propose` | Create specs only (manual BA) |
| `/opsx:status` | View OpenSpec progress |
| `/opsx:archive` | Archive a completed change |

The implementation core (plan → implement → review → verify → critic → test) runs as the **`opsx-feature-core` dynamic workflow** (`.claude/workflows/opsx-feature-core.js`) — it decomposes the OpenSpec change into in-memory, file-disjoint, dependency-ordered task waves and fans DEV/reviewer/tester agents over them. There is no task DB to import to or pull from; waves live only in memory for the duration of the run.

## How It Works

- **OpenSpec** = planning artifacts (proposal, design, tasks) created by BA
- **`opsx-feature-core` workflow** = task coordination — decomposes a change into in-memory, file-disjoint, dependency-ordered task waves and fans agents over them (no task DB)
- **Long-term memory**: a replacement memory system is being introduced (TBD)
- **Subagents** receive self-contained task descriptions from the workflow's Plan phase
- **Skills** in `.claude/skills/` provide reusable capabilities per agent

## Rules

- `tasks.md` is the source of truth for task status
- Task descriptions handed to DEV agents must be self-contained — DEV agents don't read OpenSpec
- Feature branch naming: `feature/<name>`, `fixbug/<name>`, or `refactor/<name>` (from `dev`)
- Task branch per task: `agent/<task-id>-<short-desc>` (from feature branch, NOT from `dev`)
- One commit per task: `feat: <title> [<task-id>]` (or `fix:`/`refactor:`/`docs:`/`chore:`)
- Task branches merge into feature branch; feature branch PRs into `dev`
- `<specs-repo>` itself ALSO gets the feature branch (OpenSpec tick commits land there)
- **NEVER push to remote without user approval** — commit locally, ask before pushing
- **ALWAYS run TESTER before pushing** — no push without all tests passing
- TESTER must write unit tests for new code before approving
- The workflow's Plan phase orders waves so dependent tasks never run before their prerequisites

## Session Completion

**When ending a work session**, complete ALL steps below. Work is NOT complete until the user has explicitly approved the push and `git push` succeeds.

**Mandatory workflow:**

1. **Note remaining work** — record follow-ups in `tasks.md` or the OpenSpec change.
2. **Run quality gates** (if code changed) — TESTER agent, lint, type checks, build.
3. **Update task status** — tick finished work in `tasks.md`, note in-progress items.
4. **Ask the user before pushing** — per the Push Policy in `AGENTS.md`, never auto-push. Once approved:
   ```bash
   git pull --rebase
   git push            # push code branches
   git status          # MUST show "up to date with origin"
   ```
5. **Clean up** — clear stashes, prune local task branches whose work has been merged, prune stale remote-tracking refs.
6. **Verify** — every touched repo (`<specs-repo>` + each target repo) is clean and PR/branch links are surfaced to the user.
7. **Hand off** — short context summary for the next session (open PRs, follow-up tasks).

**Critical rules:**
- Work is NOT complete until the user has approved the push AND `git push` succeeds.
- NEVER push without that explicit approval — leaving work local-only is acceptable; pushing without permission is not.
- If push fails, resolve and retry until it succeeds (or ask the user how to proceed).
