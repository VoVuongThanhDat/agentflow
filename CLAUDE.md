# Ally Specs — Agent Instructions

## Project Overview

Specs repo — OpenSpec plans + Beads task tracking for:
- `ally-backend-platform/` — Shared backend (Python/FastAPI)
- `ally-backend-tenant/` — Tenant backend (extends platform)
- `ally-frontend-platform/` — Shared frontend (React/Vite library)
- `ally-frontend-tenant/` — Tenant frontend (consumes platform package)
- `ally-agent-room/` — Agent Room web app (FastAPI backend + React/Vite frontend monorepo)

## Architecture

```
User: "I want feature X"
         ↓
   ┌──────────┐  ask questions   ┌──────────┐  create Beads   ┌──────────┐
   │    BA    │ ───────────────▶ │ DEV Lead │ ──────────────▶ │ DEV x N  │
   │ (specs)  │  create specs    │ (beads)  │  epics + deps   │ (code)   │
   └──────────┘                  └──────────┘                 └──────────┘
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

One command runs the full pipeline:
1. **BA** — asks you questions, creates OpenSpec specs
2. **DEV Lead** — converts specs into Beads (epics + tasks + dependencies)
3. **DEV Agents** — implement tasks one at a time (one branch per task)
4. **TESTER** — validates all work against specs
5. **DEVOPS** — creates PR, pushes Beads state
6. **Report** — shows results for your review

## Subagents

Defined in `.claude/agents/`:

| Agent | File | Role | Model |
|-------|------|------|-------|
| `ba` | `ba.md` | Gather requirements, create specs | Opus |
| `dev-lead` | `dev-lead.md` | Sync specs → Beads, label tasks, dispatch to dev-be/dev-fe | Sonnet |
| `dev-be` | `dev-be.md` | Backend tasks (Python/FastAPI) | Sonnet |
| `dev-fe` | `dev-fe.md` | Frontend tasks (React/Vite) | Sonnet |
| `tester` | `tester.md` | Validate completed work | Sonnet |
| `devops` | `devops.md` | Pull Beads context, create PRs, push Beads state | Sonnet |

You can also invoke agents individually:
- `@ba analyze this feature idea`
- `@dev-lead sync specs and dispatch tasks`
- `@dev-be work on backend tasks`
- `@dev-fe work on frontend tasks`
- `@tester validate the completed branches`

## Commands

| Command | Purpose |
|---------|---------|
| `/opsx:feature` | Full pipeline: BA → DEV Lead → DEV → TESTER |
| `/opsx:explore` | Think through ideas before planning |
| `/opsx:propose` | Create specs only (manual BA) |
| `/opsx:sync` | Create Beads only (manual DEV Lead) |
| `/opsx:status` | View combined progress |
| `/opsx:archive` | Archive completed change |

## How It Works

- **OpenSpec** = planning artifacts (proposal, design, tasks) created by BA
- **Beads** = long memory + coordination layer, persists across agent sessions
- **Subagents** read/write Beads only — task descriptions are self-contained

## Rules

- Beads is the source of truth for task status
- Task descriptions in Beads must be self-contained (DEV agents don't read OpenSpec)
- One branch per task: `agent/<bead-id>-<short-desc>`
- One commit per task: `feat: <title> [<bead-id>]`
- Never work on blocked tasks — `bd ready` ensures this
- If blocked: `bd update <id> --status blocked --reason "why"`
- Always push before closing a task

## Beads Commands

```bash
bd ready                          # Unblocked tasks
bd show <id>                      # Task details
bd update <id> --claim            # Claim a task
bd close <id> --reason "Done"     # Complete a task
bd graph --all                    # Dependency graph
bd list                           # All tasks
```
