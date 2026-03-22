# agentflow

An open-source toolkit for building autonomous multi-agent development workflows with Claude Code.

**agentflow** gives your AI agents structure, memory, and discipline — turning Claude Code into a team of specialized workers that plan, implement, test, and ship features autonomously.

## What's Inside

```
agentflow/
├── .claude/
│   ├── agents/          # Ready-to-use agent definitions
│   │   ├── ba.md
│   │   ├── dev-lead.md
│   │   ├── dev-be.md
│   │   ├── dev-fe.md
│   │   ├── tester.md
│   │   └── devops.md
│   ├── commands/
│   │   └── opsx/        # End-to-end orchestration commands
│   │       ├── feature.md
│   │       ├── sync.md
│   │       └── status.md
│   └── skills/          # Behavioral guardrails and best practices (24 skills)
│       ├── api-design-principles/
│       ├── brainstorming/
│       ├── dispatching-parallel-agents/
│       ├── executing-plans/
│       ├── fastapi-templates/
│       ├── finishing-a-development-branch/
│       ├── openspec-apply-change/
│       ├── openspec-archive-change/
│       ├── openspec-explore/
│       ├── openspec-propose/
│       ├── python-performance-optimization/
│       ├── python-testing-patterns/
│       ├── receiving-code-review/
│       ├── requesting-code-review/
│       ├── subagent-driven-development/
│       ├── systematic-debugging/
│       ├── test-driven-development/
│       ├── using-git-worktrees/
│       ├── using-superpowers/
│       ├── verification-before-completion/
│       ├── vercel-react-best-practices/
│       ├── web-design-guidelines/
│       ├── writing-plans/
│       └── writing-skills/
├── skills-lock.json     # Skills version lock file
└── .gitignore
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

Behavioral instructions (`.claude/skills/*/SKILL.md`) that change *how* agents work, not *what* they do:

**Engineering Practices**
- **systematic-debugging** — investigate before fixing, never guess
- **test-driven-development** — tests first, implementation second
- **verification-before-completion** — prove it works before claiming done
- **python-testing-patterns** — pytest fixtures, mocking, parameterization
- **python-performance-optimization** — profiling and optimization best practices

**Framework & Design**
- **fastapi-templates** — production-ready FastAPI patterns
- **vercel-react-best-practices** — React/Next.js patterns from Vercel engineering
- **web-design-guidelines** — accessible, responsive UI standards
- **api-design-principles** — REST/GraphQL design that scales

**Workflow & Planning**
- **brainstorming** — explore intent and requirements before implementation
- **writing-plans** — structured implementation planning
- **executing-plans** — execute plans with review checkpoints
- **writing-skills** — create and verify new skills
- **using-git-worktrees** — isolated feature work with git worktrees
- **using-superpowers** — discover and use available skills
- **dispatching-parallel-agents** — parallelize independent tasks
- **subagent-driven-development** — execute plans with subagents
- **finishing-a-development-branch** — guide merge/PR/cleanup decisions

**OpenSpec Integration**
- **openspec-explore** — thinking partner for exploring ideas
- **openspec-propose** — propose changes with design, specs, and tasks
- **openspec-apply-change** — implement tasks from an OpenSpec change
- **openspec-archive-change** — archive completed changes

**Code Review**
- **requesting-code-review** — verify work meets requirements
- **receiving-code-review** — handle review feedback with rigor

Skills turn a capable model into a disciplined engineer.

### Commands — End-to-End Orchestration

Slash commands (`.claude/commands/opsx/`) that chain agents into pipelines:

| Command | Pipeline |
|---------|----------|
| `/opsx:feature` | BA → DEV Lead → DEV-BE/FE → TESTER → fix loop → DEVOPS |
| `/opsx:sync` | Sync OpenSpec tasks into Beads with epics and dependencies |
| `/opsx:status` | Show combined progress (OpenSpec + Beads) |

One command runs the full pipeline. You describe the feature. Agents do the rest. You review the PR.

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
# 1. Clone agentflow
git clone https://github.com/VoVuongThanhDat/agentflow.git

# 2. Copy .claude/ into your project
cp -r agentflow/.claude /path/to/your-project/.claude
```

Then open Claude Code in your project and run the DEVOPS agent:

```
@devops INIT
```

The DEVOPS agent will automatically:
- Install **Beads** (bd) and **OpenSpec** if missing
- Initialize the Beads database
- Pull latest state and show context

Once init is complete, start building:

```
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

## License

MIT
