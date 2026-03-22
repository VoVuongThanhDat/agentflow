# agentflow

An open-source toolkit for building autonomous multi-agent development workflows with Claude Code.

**agentflow** gives your AI agents structure, memory, and discipline — turning Claude Code into a team of specialized workers that plan, implement, test, and ship features autonomously.

## What's Inside

```
agentflow/
├── agents/       # Ready-to-use agent definitions
├── skills/       # Behavioral guardrails and best practices
├── flows/        # End-to-end orchestration commands
└── templates/    # Starter configs for new projects
```

### Agents — Specialized AI Workers

Pre-built agent definitions (`.claude/agents/*.md`) with clear role boundaries:

| Agent | Role |
|-------|------|
| **BA** | Gathers requirements, creates structured specs |
| **DEV Lead** | Converts specs into tasks with dependencies, dispatches to specialists |
| **DEV-BE** | Implements backend tasks (Python/FastAPI) |
| **DEV-FE** | Implements frontend tasks (React/Vite) |
| **TESTER** | Validates all branches against acceptance criteria |
| **DEVOPS** | Handles git lifecycle — PRs, Beads sync, context persistence |

Each agent has one job. No role bleed. The DEV Lead labels tasks as `backend` or `frontend` and routes to the right specialist.

### Skills — Engineering Culture for AI

Behavioral instructions that change *how* agents work, not *what* they do:

- **systematic-debugging** — investigate before fixing, never guess
- **test-driven-development** — tests first, implementation second
- **verification-before-completion** — prove it works before claiming done
- **fastapi-templates** — production-ready FastAPI patterns
- **python-testing-patterns** — pytest fixtures, mocking, parameterization
- **vercel-react-best-practices** — React/Next.js patterns from Vercel engineering
- **web-design-guidelines** — accessible, responsive UI standards
- **api-design-principles** — REST/GraphQL design that scales

Skills turn a capable model into a disciplined engineer.

### Flows — End-to-End Orchestration

Slash commands that chain agents into pipelines:

| Command | Pipeline |
|---------|----------|
| `/opsx:feature` | BA → DEV Lead → DEV-BE/FE → TESTER → fix loop → DEVOPS |
| `/opsx:propose` | BA only — create specs from conversation |
| `/opsx:sync` | DEV Lead only — sync specs into Beads tasks |
| `/opsx:status` | Show combined progress (specs + Beads) |

One command runs the full pipeline. You describe the feature. Agents do the rest. You review the PR.

### Templates — Quick Start

Starter configurations for new projects:

- `CLAUDE.md` — project instructions template
- `settings.json` — permission presets for agent workflows
- Agent definition starters — customize for your stack

## How It Works

agentflow combines three open-source tools:

| Tool | Purpose | Role in agentflow |
|------|---------|-------------------|
| [OpenSpec](https://github.com/fission-ai/openspec) | Structured planning | Turns feature requests into agent-ready specs |
| [Beads](https://github.com/fission-ai/beads) | Long memory + task tracking | Persists context across sessions, manages dependencies |
| [Claude Code](https://claude.ai/claude-code) | AI coding agent | Executes the work via subagents |

```
Feature Request
      ↓
  ┌────────┐  specs   ┌──────────┐  dispatch  ┌─────────┐
  │   BA   │ ───────▶ │ DEV Lead │ ─────────▶ │ DEV-BE  │
  │(OpenSpec)│         │ (Beads)  │            │ DEV-FE  │
  └────────┘          └──────────┘            └─────────┘
                                                   ↓
                                              ┌─────────┐
                                              │ TESTER  │
                                              └─────────┘
                                                   ↓
                                              ┌─────────┐
                                              │ DEVOPS  │ → PR + Beads push
                                              └─────────┘
```

## Quick Start

```bash
# 1. Install dependencies
npm install -g @fission-ai/openspec
curl -fsSL https://github.com/fission-ai/beads/releases/latest/download/bd-$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m) -o ~/.local/bin/bd && chmod +x ~/.local/bin/bd

# 2. Clone agentflow into your project
git clone https://github.com/<org>/agentflow .claude/agentflow

# 3. Copy agents and skills into your project
cp -r .claude/agentflow/agents/ .claude/agents/
cp -r .claude/agentflow/skills/ .claude/skills/
cp -r .claude/agentflow/flows/ .claude/commands/opsx/

# 4. Initialize Beads
bd init --dolt

# 5. Start building
# In Claude Code:
/opsx:feature
```

## Key Principles

1. **Each agent has ONE job** — BA specs, DEV codes, TESTER validates. No overlap.
2. **Tasks are self-contained** — DEV agents read only the Beads task, not the full spec.
3. **Memory persists** — Beads memories survive sessions, machines, and team changes.
4. **Skills add discipline** — Without skills, agents cut corners. With skills, they follow engineering best practices.
5. **Sequential by default** — Run 1 DEV at a time. Parallel causes issues. Sequential is reliable.
6. **Always verify** — TESTER runs before merge. No exceptions.

## Built With

- [OpenSpec](https://github.com/fission-ai/openspec) — Structured change management
- [Beads](https://github.com/fission-ai/beads) — Issue tracking with dependency graphs and long memory
- [Superpowers](https://skills.sh/obra/superpowers) — Behavioral skills for Claude Code
- [Claude Code](https://claude.ai/claude-code) — Anthropic's CLI for Claude
