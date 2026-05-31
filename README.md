# agentflow

An open-source toolkit for building autonomous multi-agent development workflows with Claude Code.

**agentflow** gives your AI agents structure, memory, and discipline — turning Claude Code into a team of specialized workers that **plan → implement → review → test → ship** features autonomously.

> This repo is a **template**. You copy it into your own project and fill in a few placeholders. Nothing here is tied to a specific product — `<PROJECT_NAME>`, `<specs-repo>`, `<backend-repo>`, `<frontend-repo>` and `$REPO_ROOT` are placeholders you replace with your own values.

---

## Table of Contents

- [How it works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Install](#install)
- [Configure](#configure)
- [Daily usage](#daily-usage)
- [Commands reference](#commands-reference)
- [Agents reference](#agents-reference)
- [Skills](#skills)
- [Conventions](#conventions)
- [Repo layout](#repo-layout)
- [FAQ](#faq)

---

## How it works

agentflow pairs **OpenSpec** (structured planning) with **Claude Code** (subagents + a dynamic workflow). A feature request flows through a fixed pipeline; the slow, multi-agent middle runs as one background workflow called **`opsx-feature-core`**.

```
User request
     ↓
  @ba ........................ asks questions, writes OpenSpec specs      (interactive)
     ↓
  @devops .................... creates feature branch from `dev`          (interactive)
     ↓
  opsx-feature-core workflow . Plan → Implement → Review → Verify →
                               Critic → Test       (parallel, background)
     ↓
  gate: no blocking findings AND tests pass?
     │ no  → surface findings → re-run / targeted fix (max 3 rounds)
    yes
     ↓
  user approves push → @devops opens PR(s) → `dev`                        (interactive)
     ↓
  report
```

The workflow decomposes a change into **file-disjoint, dependency-ordered task waves** and fans DEV / reviewer / tester agents over them. Tasks are passed in memory — there is **no external task database** on the critical path.

---

## Prerequisites

- **[Claude Code](https://claude.ai/claude-code)** — the CLI this toolkit runs on.
- **[OpenSpec](https://github.com/fission-ai/openspec)** — the `openspec` CLI (used by BA and the commands).
- **Git** — each target repo should have a long-lived integration branch named **`dev`** (the pipeline branches from `dev` and PRs back into it). Rename in `AGENTS.md`/agents if you use `main`.
- *(Optional)* **Node.js** — only if you want to lint/run the `opsx-feature-core.js` workflow locally.

---

## Install

```bash
# 1. Clone agentflow
git clone https://github.com/VoVuongThanhDat/agentflow.git

# 2. Copy the toolkit into your project
cp -r agentflow/.claude       /path/to/your-project/.claude
cp    agentflow/CLAUDE.md      /path/to/your-project/CLAUDE.md
cp    agentflow/AGENTS.md      /path/to/your-project/AGENTS.md
```

`.claude/` contains the agents, commands, skills, and workflow. `CLAUDE.md` (Claude Code) imports `AGENTS.md` (tool-agnostic), so both should live at your project root.

---

## Configure

Open `CLAUDE.md` and `AGENTS.md` and replace the placeholders:

| Placeholder | Replace with |
|-------------|--------------|
| `<PROJECT_NAME>` | Your project's name |
| `$REPO_ROOT` | The workspace root that holds your specs repo + target repos |
| `<specs-repo>` | The repo that holds `openspec/`, `.claude/`, and agent definitions |
| `<backend-repo>` / `<frontend-repo>` | Your actual code repo names |

Then edit the **Target Repos** table in `AGENTS.md` — add one row per repo the agents may touch:

```markdown
| Repo | Default branch | Stack | Purpose |
|------|----------------|-------|---------|
| `your-api/`  | `dev` | Python / FastAPI | Backend service |
| `your-web/`  | `dev` | React + Vite     | Frontend app    |
```

> **Single repo?** Treat `<specs-repo>` and your code repo as the same directory — the agents handle a single-repo layout too.

---

## Daily usage

The main entry point is one command:

```
/opsx:feature
```

Describe what you want to build when prompted. The pipeline then runs end to end:

1. **BA (interactive)** — asks 2–3 rounds of questions, reads your codebase, and writes `proposal.md`, `design.md`, `tasks.md` under `openspec/changes/<change-id>/`.
2. **DEVOPS** — creates the feature branch (`feature/…` / `fixbug/…` / `refactor/…`) from `dev` in each target repo **and** in `<specs-repo>`.
3. **`opsx-feature-core` workflow (background)** —
   - **Plan**: `dev-lead` splits the change into file-disjoint task waves.
   - **Implement**: `dev-be` / `dev-fe` work the tasks in parallel per wave, committing on the branch (no push).
   - **Review**: `python-reviewer`, `typescript-reviewer`, `security-reviewer`, `silent-failure-hunter` fan out over the diff.
   - **Verify**: each CRITICAL/HIGH finding is judged by 3 perspective lenses; kept only on a ≥2/3 vote.
   - **Critic**: a completeness critic catches issues the reviewers missed.
   - **Test**: `tester` writes missing unit tests and runs the full suite.
4. **Gate** — proceeds only when there are **no blocking findings AND tests pass**. Otherwise it surfaces the findings and re-runs / applies targeted fixes (max 3 rounds, then escalates to you).
5. **Push (interactive)** — never automatic. After you approve, DEVOPS pushes the branches and opens one PR per repo into `dev`.
6. **Report** — summary of waves, findings, tests, and PR links. Run `/opsx:archive <change-id>` once merged.

### Just want the spec?

```
/opsx:propose add user authentication
```

Creates the OpenSpec change + artifacts without implementing. Implement later with `/opsx:feature` (BA will pick up the existing change).

### Thinking, not building?

```
/opsx:explore should we use postgres or sqlite here?
```

A read-only thinking partner — investigates the codebase and captures ideas, but never writes code.

---

## Commands reference

### Orchestration (`opsx`)

| Command | Purpose |
|---------|---------|
| `/opsx:feature` | Full pipeline: BA → branch → workflow → gate → push |
| `/opsx:propose` | Create the OpenSpec change + artifacts only (no implementation) |
| `/opsx:explore` | Read-only thinking mode — investigate, clarify, capture ideas |
| `/opsx:status`  | Show progress of a change (or an overview of all changes) |
| `/opsx:archive` | Archive a completed change after merge |

### Design & quality (single-purpose)

17 focused commands for tightening existing UI/code — run them on a file, component, or selection:

`/polish` · `/harden` · `/audit` · `/critique` · `/simplify` · `/optimize` · `/normalize` · `/extract` · `/clarify` · `/onboard` · `/animate` · `/delight` · `/bolder` · `/quieter` · `/colorize` · `/adapt` · `/teach-impeccable`

---

## Agents reference

Defined in `.claude/agents/`. The pipeline runs the **core** agents automatically; the **manual** ones are for one-off, out-of-pipeline calls.

### Core (auto-run in `/opsx:feature`)

| Agent | Role | Model |
|-------|------|-------|
| `ba` | Gather requirements, write OpenSpec specs | Opus |
| `dev-lead` | Decompose a change into file-disjoint task waves | Sonnet |
| `dev-be` | Implement backend tasks (Python/FastAPI) | Sonnet |
| `dev-fe` | Implement frontend tasks (React/Vite) | Sonnet |
| `python-reviewer` | Python code review | Sonnet |
| `typescript-reviewer` | TS/React code review | Sonnet |
| `security-reviewer` | OWASP Top 10, secrets | Sonnet |
| `silent-failure-hunter` | Swallowed errors, empty catches | Sonnet |
| `tester` | Validate + write missing tests | Sonnet |

### Manual-only

| Agent | Role |
|-------|------|
| `devops` | Git lifecycle — branches, commits, PRs |
| `build-error-resolver` | Fix build/type errors |
| `code-explorer` | Trace execution paths through the codebase |
| `researcher` | Web research (libraries, UX, competitors) |

Invoke any agent directly:

```
@ba analyze this feature idea
@dev-be work on the backend tasks
@security-reviewer scan the auth flow in <backend-repo>
@code-explorer trace the checkout flow
```

> Don't manually launch core agents for a change that's already running through `/opsx:feature` — the workflow already orchestrates them, and double-running wastes work.

---

## Skills

48 behavioral skills in `.claude/skills/` change *how* agents work, not *what* they do. Each agent loads the ones relevant to its role via its frontmatter. Categories:

- **Engineering discipline** — `test-driven-development`, `tdd-workflow`, `systematic-debugging`, `verification-before-completion`, `verification-loop`, `safety-guard`, `coding-standards`
- **Backend** — `python-patterns`, `backend-patterns`, `fastapi-templates`, `postgres-patterns`, `docker-patterns`, `api-design-principles`, `python-testing-patterns`, `python-performance-optimization`
- **Frontend & design** — `frontend-patterns`, `vercel-react-best-practices`, `web-design-guidelines`, `minimalist-ui`, `design-taste-frontend`, `redesign-existing-projects`
- **Planning & workflow** — `brainstorming`, `writing-plans`, `executing-plans`, `dispatching-parallel-agents`, `subagent-driven-development`, `using-git-worktrees`, `council`, `search-first`
- **Review & security** — `requesting-code-review`, `receiving-code-review`, `security-review`
- **OpenSpec** — `openspec-propose`, `openspec-apply-change`, `openspec-explore`, `openspec-archive-change`
- **Meta** — `writing-skills`, `using-superpowers`, `full-output-enforcement`, `context-budget`, `strategic-compact`, `agent-introspection-debugging`, `git-workflow`, and more

---

## Conventions

These are enforced by the agents and `AGENTS.md`:

- **Branches** — feature branch from `dev`: `feature/<name>`, `fixbug/<name>`, or `refactor/<name>`. One task branch per task from the feature branch: `agent/<task-id>-<short-desc>`.
- **Commits** — one per task, conventional: `feat: <title> [<task-id>]` (or `fix:` / `refactor:` / `docs:` / `chore:`).
- **Specs repo gets the branch too** — `<specs-repo>` receives the same feature branch so OpenSpec tick commits ship in the same PR.
- **Push policy** — **never push without explicit user approval.** TESTER (the workflow's gate) must pass first.
- **Surgical changes** — agents touch only what the task requires; they surface unrelated dead code instead of deleting it.

---

## Repo layout

```
.claude/
├── agents/         # 13 agent definitions (core + manual)
├── commands/
│   ├── opsx/       # feature, propose, explore, status, archive
│   └── *.md        # 17 design/quality commands
├── skills/         # 48 behavioral skills (SKILL.md each)
└── workflows/
    └── opsx-feature-core.js   # the implementation-core dynamic workflow
CLAUDE.md           # Claude Code orchestration (imports AGENTS.md)
AGENTS.md           # tool-agnostic agent instructions + Target Repos table
```

---

## FAQ

**Do I need Beads / an issue tracker?** No. Earlier versions used Beads; the current flow coordinates tasks in-memory inside the `opsx-feature-core` workflow. The durable record is OpenSpec's `tasks.md`.

**Can I use this on a single repo?** Yes — treat `<specs-repo>` and your code repo as the same directory. The agents handle both single- and multi-repo layouts.

**Does it ever push or open PRs on its own?** No. Pushing and PR creation always require your explicit approval.

**How do I change the integration branch from `dev`?** Update the **Target Repos** table and the branch references in `AGENTS.md` / the `devops` and `dev-*` agents.

---

## Built with

- [OpenSpec](https://github.com/fission-ai/openspec) — structured change management
- [Superpowers](https://skills.sh/obra/superpowers) — behavioral skills for Claude Code
- [Claude Code](https://claude.ai/claude-code) — Anthropic's CLI for Claude

## License

MIT
