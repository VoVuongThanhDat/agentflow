---
name: "OPSX: Status"
description: Show combined OpenSpec + Beads progress for a change
category: Workflow
tags: [workflow, beads, status]
---

Show the combined progress of an OpenSpec change: spec artifacts + Beads task tracking.

**Input**: Optionally specify a change name (e.g., `/opsx:status refactor-backend-platform`). If omitted, show overview of all changes.

**Steps**

### If no change name provided: Show overview

1. List all active changes:
   ```bash
   ls openspec/changes/ | grep -v archive
   ```

2. For each change, show a one-line summary:
   - Change name
   - OpenSpec tasks progress (done/total from tasks.md)
   - Beads progress (closed/total from `bd query "spec-id:<name>" --json`)

3. Display as a table:
   ```
   Change                          OpenSpec     Beads
   refactor-backend-platform       0/17 (0%)    0/17 (0%)
   split-backend-platform-tenant   246/253      not synced
   ```

### If change name provided: Show detail

1. **OpenSpec artifacts**

   Check which files exist in `openspec/changes/<name>/`:
   - proposal.md, design.md, tasks.md, specs/

2. **OpenSpec tasks breakdown**

   Read tasks.md and show per-section progress:
   ```
   Section                              Progress
   1. Core Infrastructure Cleanup       0/3 (0%)   [TODO]
   2. Service Layer Refactoring         2/4 (50%)  [...]
   3. API Router Cleanup                3/3 (100%) [DONE]
   ```

3. **Beads status**

   ```bash
   bd query "spec-id:<name>" --json
   ```

   Show:
   - Total epics and tasks
   - Status breakdown: open / in-progress / blocked / closed
   - Overall completion percentage
   - Any in-progress tasks with assignees
   - Any blocked tasks with reasons

4. **Ready work**

   ```bash
   bd ready --json
   ```

   Filter to tasks matching this spec-id and show what's claimable now.

5. **Dependency graph** (if Beads exist)

   ```bash
   bd graph --all
   ```

**Output**

```
## Status: <change-name>

### OpenSpec
- proposal.md, design.md, tasks.md, 4 specs

### Tasks Progress
[################----] 80% (14/17)

| Section                        | Progress | Status |
|--------------------------------|----------|--------|
| 1. Core Infrastructure         | 3/3      | DONE   |
| 2. Service Layer               | 2/4      | ...    |

### Beads
- 6 epics, 17 tasks
- Open: 3 | In Progress: 1 | Blocked: 0 | Closed: 13

### Ready to Claim
- ally-specs-xyz — Extract shared query utils (P2)
- ally-specs-abc — Standardize service signatures (P2)
```

**Guardrails**
- If Beads not synced yet, show "Not synced — run `/opsx:sync <name>`"
- Don't fail if tasks.md doesn't exist — just skip that section
- Show actionable next steps based on current state
