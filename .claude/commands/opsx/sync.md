---
name: "OPSX: Sync"
description: Sync OpenSpec tasks.md into Beads with epics, tasks, and cross-task dependencies
category: Workflow
tags: [workflow, beads, sync, multi-agent]
---

Sync an OpenSpec change into Beads — creating epics, tasks, and **cross-task dependencies** so multiple agents can work in parallel without conflicts.

Beads is the **long memory layer**. After sync, agents only need Beads to know what to do, what's blocked, and what's ready.

**Input**: Optionally specify a change name (e.g., `/opsx:sync refactor-backend-platform`). If omitted, prompt for selection.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - List active changes: `ls openspec/changes/` (exclude `archive/`)
   - If only one, auto-select. If multiple, use **AskUserQuestion tool**

   Verify `openspec/changes/<name>/tasks.md` exists.

2. **Check existing Beads**

   ```bash
   bd query "spec-id:<name>" --json
   ```

   If issues already exist:
   - Show count and ask: "Found N existing Beads. Delete and re-sync?"
   - If yes: `bd delete <ids> --force`
   - If no: exit

3. **Read all context**

   Read these files to understand the full picture:
   - `openspec/changes/<name>/proposal.md` — what and why
   - `openspec/changes/<name>/design.md` — architecture and conventions
   - `openspec/changes/<name>/tasks.md` — task breakdown

4. **Parse tasks.md**

   Extract structure:
   - `## N. Section Title` → Epic
   - `- [ ] N.M Description` → Open task
   - `- [x] N.M Description` → Completed task

5. **Analyze dependencies**

   This is the critical step. Analyze task descriptions to identify **blocking relationships**:

   **Rules for dependency detection:**
   - Tasks in later sections generally depend on earlier sections (section order = dependency order)
   - Within a section, look for explicit references: "using X from task Y", "after X is done"
   - Infrastructure/foundation tasks (DB, utils, base classes) block tasks that use them
   - "Extract X" blocks "Refactor Y to use X"
   - "Create/Define X" blocks "Use/Implement X"
   - Tasks within the same epic that share no references can run in parallel

   **Build a dependency map:**
   ```
   task_1.1 (consolidate utils) → blocks → task_2.4 (extract query utils into core/utils)
   task_1.1 (consolidate utils) → blocks → task_5.1 (consolidate auth using core/utils)
   task_1.1 (consolidate utils) → blocks → task_6.2 (consolidate API utils into core/utils)
   task_1.3 (standardize DB session) → blocks → task_2.1 (extract BaseService)
   task_2.1 (extract BaseService) → blocks → task_2.2, 2.3 (refactor services)
   task_2.1 (extract BaseService) → blocks → task_3.1 (routers delegate to services)
   task_2.1 (extract BaseService) → blocks → task_6.1 (move functions to services)
   ...etc
   ```

6. **Present plan for confirmation**

   Before creating anything, show the user:
   - List of epics with priorities
   - List of tasks under each epic
   - Dependency graph (which tasks block which)
   - Which tasks are immediately ready (no dependencies)

   Use **AskUserQuestion tool**: "Does this dependency plan look right? I can adjust before creating."

7. **Create epics**

   For each section:
   ```bash
   bd create "<Section Title>" -t epic -p <priority> --spec-id "<name>" -d "<description from design.md>" --silent
   ```
   Priority: P1 for first section, incrementing, capped at P4.

8. **Create tasks**

   For each task:
   ```bash
   bd create "<task title>" -t task -p <priority> --parent <epic-id> --spec-id "<name>" -d "<full task description + relevant context from design.md>" --silent
   ```

   **Important**: The task description in Beads must contain **all context an agent needs** to implement it independently. Include:
   - What to do (from tasks.md)
   - Relevant architecture decisions (from design.md)
   - File paths and conventions
   - Acceptance criteria

   For `[x]` tasks: create and immediately close.

9. **Create dependencies**

   Apply the dependency map from step 5:
   ```bash
   bd dep <blocker-id> --blocks <blocked-id>
   ```

10. **Show result**

    ```bash
    bd graph --all
    bd ready
    ```

    Display:
    - Dependency graph
    - Which tasks are ready now (Layer 0)
    - Total: N epics, M tasks, K dependencies
    - Next step: "Run `/opsx:work` to start, or launch multiple agents with `./scripts/launch-agents.sh <name>`"

**Output**

```
## Sync Complete: <change-name>

### Created
- N epics, M tasks, K dependencies
- L tasks ready (no blockers)

### Dependency Graph
<bd graph --all output>

### Ready to Work (Layer 0)
- <task-id> — <title> (P1)
- <task-id> — <title> (P1)

### Next Steps
- `/opsx:work` — work on tasks one at a time
- `./scripts/launch-agents.sh <name> --agents 3` — launch 3 parallel agents
- `/opsx:status <name>` — check progress anytime
```

**Guardrails**
- Always confirm dependency plan with user before creating
- Task descriptions in Beads must be self-contained (agent reads only Beads, not OpenSpec)
- Strip markdown backticks from task titles
- Never create circular dependencies
- Cap priority at P4
- If tasks.md has no `##` headers, treat entire file as one epic
