---
name: "OPSX: Status"
description: Show OpenSpec progress for a change
category: Workflow
tags: [workflow, status]
---

Show the progress of an OpenSpec change from its spec artifacts.

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

3. Display as a table:
   ```
   Change                          OpenSpec
   refactor-backend-platform       0/17 (0%)
   split-backend-platform-tenant   246/253
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
```

**Guardrails**
- Don't fail if tasks.md doesn't exist — just skip that section
- Show actionable next steps based on current state
