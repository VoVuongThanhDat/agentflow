# <PROJECT_NAME> — Agent Instructions

Tool-agnostic instructions for any AI coding agent (Claude Code, Codex, Cursor, Aider, etc.) working in this repo. Claude Code reads `CLAUDE.md` which imports this file.

<!-- This file is a TEMPLATE. Replace <PLACEHOLDERS> and the Target Repos table with your project's values. -->

## Project Overview

Specs repo orchestrating one or more **target repos** via **OpenSpec** (planning) + the **`opsx-feature-core` dynamic workflow** (task coordination).

### Target Repos

Edit this table to list your repos. `<backend-repo>` / `<frontend-repo>` are placeholder names — add or remove rows as needed.

| Repo | Default branch | Stack | Purpose |
|------|----------------|-------|---------|
| `<backend-repo>/` | `dev` | Python / FastAPI | Backend service (services, models, repos, auth, schemas) |
| `<frontend-repo>/` | `dev` | React + Vite | Frontend app |

**Conventions used throughout this toolkit:**
- `$REPO_ROOT` — the workspace root that contains the specs repo and all target repos.
- `<specs-repo>` — the repo that holds `openspec/changes/`, `.claude/`, and agent definitions.
- `<backend-repo>` / `<frontend-repo>` — placeholder names for your code repos.

If each target repo is its **own** `.git` repository nested inside `<specs-repo>/`, code lives in the target repos while `<specs-repo>/` tracks `openspec/changes/`, `.claude/`, and agent definitions. (If you instead use a single repo, treat `<specs-repo>` and your code repo as the same directory.)

Agents working in this repo should:
- Keep OpenSpec artifacts scoped to one of the target repos above.
- Run `git` commands from the **target repo**, then `cd` back to `<specs-repo>/`.

## Branching & Commit Conventions

- Feature branch from `dev`: `feature/<name>`, `fixbug/<name>`, or `refactor/<name>`
- Task branch per task (from feature branch, NOT dev): `agent/<short-desc>`
- One commit per task: `feat: <title>` (or `fix:`/`refactor:`/`docs:`/`chore:`)
- Task branches merge into the feature branch; the feature branch PRs into `dev`
- `<specs-repo>/` itself ALSO gets the feature branch (OpenSpec tasks.md ticks land there)

## Push Policy

- **NEVER push to remote without explicit user approval.** Commit locally, then wait.
- **ALWAYS run the TESTER agent (or full test suite) before any push.** Tests must pass first.
- `git push --force` and `git reset --hard origin/*` only when the user explicitly asks.
- Session Completion below describes the close-out sequence — push step still requires user approval.

## Task Coordination — `opsx-feature-core`

Task coordination runs through the **`opsx-feature-core` dynamic workflow** (`.claude/workflows/opsx-feature-core.js`). It decomposes an OpenSpec change into in-memory, file-disjoint, dependency-ordered task *waves* and fans `dev-be`/`dev-fe` + reviewers + tester over them. There is **no task DB** to import to or pull from — the wave plan lives in memory for the duration of the run.

### Workflow

1. **Plan** — read the OpenSpec change and decompose it into file-disjoint, dependency-ordered task waves.
2. **Implement** — DEV agents work the tasks in each wave; tasks within a wave are file-disjoint so they run in parallel.
3. **Review** — reviewers scan the implemented changes.
4. **Verify / test** — the tester validates the work and writes any missing tests.

### Rules

- ✅ OpenSpec `tasks.md` is the durable checklist; the wave plan is the live coordination layer for a run.
- ✅ Task descriptions must be **self-contained** so DEV agents can work a task without re-reading the full OpenSpec change.
- ✅ Keep tasks within a wave file-disjoint so they can run in parallel safely.
- ❌ Do NOT create separate markdown TODO lists or external trackers.

**Long-term memory:** a replacement memory system is being introduced (TBD).

## Coding Principles

### Surgical Changes
- Touch only what the task requires.
- Don't "improve" adjacent code, comments, or formatting unrelated to the task.
- Don't refactor what isn't broken.
- Match existing style even if you'd do it differently.
- Unrelated dead code? **Mention it — don't delete it.**
- Every changed line must trace directly to the task description or user request.
- Remove imports/vars/functions that YOUR edit orphaned; don't remove pre-existing dead code unless asked.

### Surface, Don't Assume
- State assumptions explicitly before implementing.
- If multiple interpretations of a task exist, present them — don't pick silently.
- Unclear? Stop. Name what's confusing. Ask.

### Simplicity
- Minimum code that solves the task. No speculative features, no abstractions for single-use code.
- No error handling for impossible scenarios. Validate only at system boundaries.
- Default to no comments — code names already explain WHAT; only comment non-obvious WHY.

## Shell Safety

**ALWAYS use non-interactive flags** with file operations to avoid hanging on confirmation prompts. Shell commands like `cp`, `mv`, `rm` may be aliased to `-i` (interactive) mode on some systems, causing the agent shell to hang indefinitely waiting for y/n input.

```bash
# Force overwrite without prompting
cp -f source dest                # NOT: cp source dest
mv -f source dest                # NOT: mv source dest
rm -f file                       # NOT: rm file

# Recursive operations
rm -rf directory                 # NOT: rm -r directory
cp -rf source dest               # NOT: cp -r source dest
```

**Other commands that may prompt:**

```bash
ssh -o BatchMode=yes …           # fail instead of prompting
scp -o BatchMode=yes …
apt-get install -y …             # auto-yes
HOMEBREW_NO_AUTO_UPDATE=1 brew … # skip brew auto-update prompt
```

## OpenSpec

Planning artifacts live in `openspec/changes/<change-id>/`:
- `proposal.md` — what & why
- `design.md` — how
- `tasks.md` — checklist
- `specs/<capability>/spec.md` — delta requirements with `## ADDED/MODIFIED/REMOVED Requirements` and `#### Scenario:` blocks

CLI:

```bash
openspec list                       # Active changes
openspec show <change-id>           # Inspect
openspec validate <change-id>       # Check spec deltas
openspec archive <change-id> -y     # Archive when done (requires tests passing + user approval)
```

## Session Completion

**When ending a work session**, complete the steps below. Work is NOT complete until the user has explicitly approved the push and `git push` succeeds.

**Mandatory workflow:**

1. **Note follow-up work** — capture anything that needs further work in the OpenSpec change's `tasks.md` (or surface it to the user).
2. **Run quality gates** (if code changed) — TESTER agent, lint, type checks, build. Do NOT skip.
3. **Update task status** — tick completed items in `tasks.md`; flag stuck items for the user.
4. **Ask the user before pushing** — per the Push Policy above, never auto-push. Once the user approves:
   ```bash
   git pull --rebase
   git push                    # push code branches
   git status                  # MUST show "up to date with origin"
   ```
5. **Clean up** — clear stashes, prune local task branches whose work has been merged, prune stale remote-tracking refs.
6. **Verify** — every touched repo (`<specs-repo>/` + each target repo) is in a clean state and the user has the PR/branch links they need.
7. **Hand off** — leave a short context summary for the next session (open PRs, blocked tasks, follow-up work).

**Critical rules:**
- Work is NOT complete until the user has approved the push AND `git push` succeeds.
- NEVER push without that explicit approval — leaving work local-only is acceptable; pushing without permission is not.
- If push fails, resolve and retry until it succeeds (or ask the user how to proceed).
