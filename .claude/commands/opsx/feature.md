---
name: "OPSX: Feature"
description: "End-to-end feature pipeline: BA → DEV Lead → DEV Agents → TESTER → fix loop until all pass"
category: Workflow
tags: [workflow, orchestrator, multi-agent, pipeline]
---

Run the full feature pipeline with specialized subagents. Loops until TESTER passes everything.

**Input**: A feature description or request from the user.

**Pipeline**

```
User Request
     ↓
  @ba (ask questions, create specs)
     ↓
  @dev-lead (create Beads tasks + deps)
     ↓
  @dev x N (implement in parallel)          ←──┐
     ↓                                         │
  @tester (lint + tests + validate)            │
     ↓                                         │
  ALL_PASS? ── no ──→ @ba (create fix tasks) ──┘
     │
    yes
     ↓
  Report to User
```

**Steps**

### Phase 1: BA — Gather Requirements (foreground)

Delegate to the `ba` subagent. It will:
- Ask the user targeted questions (2-3 rounds)
- Read the codebase for context
- Create OpenSpec artifacts: proposal.md, design.md, tasks.md
- Confirm with the user

Wait for BA to complete. Verify artifacts exist:
```bash
ls openspec/changes/<name>/proposal.md openspec/changes/<name>/design.md openspec/changes/<name>/tasks.md
```

### Phase 2: DEV Lead — Create Beads (foreground)

Delegate to the `dev-lead` subagent with the change name.

It will:
- Read the specs BA created
- Create Beads epics + tasks with self-contained descriptions
- Analyze and create cross-task dependencies

Wait for completion. Verify:
```bash
bd ready --json
```

### Phase 3: DEV Agents — Implement (parallel, background)

Check ready tasks:
```bash
bd ready --json
```

Launch multiple `dev` subagents in parallel (one per ready task, max 5). Each runs in its own worktree.

After all DEV agents complete, check if new tasks became unblocked:
```bash
bd ready --json
```

If more tasks are ready, launch another round. Repeat until all tasks are closed or blocked.

### Phase 4: TESTER — Validate (foreground)

Delegate to the `tester` subagent with the change name.

It will:
- Detect and run lint for all affected repos
- Detect and run unit tests for all affected repos
- Validate each branch against acceptance criteria
- Check for missing unit tests on new code
- Produce a report with FAIL_LIST and Verdict

### Phase 5: Check Verdict — Loop or Complete

Parse the TESTER's output for the `Verdict` line:

**If `ALL_PASS`:**
- Proceed to Final Report (Phase 6)

**If `HAS_FAILURES`:**
- Extract the `FAIL_LIST` from TESTER's report
- Go to Phase 5a: Fix Loop

### Phase 5a: Fix Loop

Track the current round number (start at 1, increment each loop).

**5a.1 — BA creates fix tasks (foreground)**

Delegate to `ba` subagent with the TESTER's failure report:
- Pass the full FAIL_LIST
- BA will add fix tasks to tasks.md
- BA does NOT ask user questions in fix mode — creates tasks directly

**5a.2 — DEV Lead syncs new tasks (foreground)**

Delegate to `dev-lead` subagent:
- Read the updated tasks.md
- Create new Beads tasks for the fix section only
- Add dependencies as needed

**5a.3 — DEV Agents implement fixes (parallel, background)**

Same as Phase 3 — launch DEV agents for the new ready tasks.

**5a.4 — TESTER re-validates (foreground)**

Same as Phase 4 — run full lint + tests + validation again.

**5a.5 — Check Verdict again**

- If `ALL_PASS`: proceed to Final Report
- If `HAS_FAILURES`: increment round, go back to 5a.1
- If round > 3: stop and report to user — "3 fix rounds attempted, still failing. Manual intervention needed."

### Phase 6: Final Report

```
## Feature Complete: <feature-name>

### Pipeline Summary
- BA: Requirements gathered, specs created
- DEV Lead: N epics, M tasks created
- DEV Agents: M tasks implemented
- TESTER: All passed (after K rounds)

### Lint & Test Results
| Repo | Lint | Tests |
|------|------|-------|
| <repo> | PASS | PASS (N/N) |

### Branches Ready for Review
- agent/<id>-... → <task title>
- agent/<id>-... → <task title>

### Next Steps
- Review and merge branches to dev
- /opsx:archive <feature-name> when satisfied
```

**Guardrails**
- BA phase (new feature) MUST be interactive — confirm with user
- BA phase (fix tasks) does NOT need user confirmation — create directly from TESTER report
- Max 3 fix rounds — after that, escalate to user
- Max 5 parallel DEV agents per round
- Each phase must complete before the next starts (except parallel DEV agents)
- Subagents cannot spawn other subagents — all orchestration happens here
