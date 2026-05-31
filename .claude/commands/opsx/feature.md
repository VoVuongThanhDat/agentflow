---
name: "OPSX: Feature"
description: "End-to-end feature pipeline: BA → DEVOPS branch → opsx-feature-core workflow (plan→implement→review→verify→critic→test) → push"
category: Workflow
tags: [workflow, orchestrator, multi-agent, pipeline, dynamic-workflow]
---

Run the full feature pipeline. The interactive ends (requirements + push approval) stay here;
the heavy implementation core runs as the **`opsx-feature-core` dynamic workflow** — it
decomposes an OpenSpec change into in-memory, file-disjoint, dependency-ordered task waves and
fans dev-be/dev-fe + reviewers + tester over them, with in-memory task passing (no task DB on
the critical path).

**Input**: A feature description or request from the user.

**Pipeline**

```
User Request
     ↓
  @ba ............................ ask questions, create OpenSpec specs   (interactive)
     ↓
  @devops ........................ create feature branch from dev          (interactive)
     ↓
  Workflow: opsx-feature-core .... Plan → Implement → Review → Verify →
                                   Critic → Test  (parallel, background)
     ↓
  blockingFindings == 0 && test.passed ?
     │ no  →  surface findings/failures → re-run workflow or targeted fix
    yes
     ↓
  user approves push → @devops (commit check + PR → dev)                   (interactive)
     ↓
  Report to User
```

**Steps**

### Phase 1: BA — Gather Requirements (interactive)

Delegate to the `ba` subagent. It will ask the user 2–3 rounds of questions, read the codebase,
and create OpenSpec artifacts. Wait for completion, then verify:

```bash
ls openspec/changes/<change-id>/proposal.md openspec/changes/<change-id>/design.md openspec/changes/<change-id>/tasks.md
```

### Phase 2: DEVOPS — Create Feature Branch (interactive)

Delegate to the `devops` subagent: create `feature/<name>` (or `fixbug/`/`refactor/`) from `dev`
in each target sub-repo AND in `<specs-repo>/`. The workflow runs ON this branch — it does not
create branches.

### Phase 3: Implementation Core — run the workflow (background)

Run the dynamic workflow, passing the OpenSpec change id:

```
Workflow({ name: 'opsx-feature-core', args: { changeId: '<change-id>', base: 'dev' } })
```

This single workflow does, in order:
- **Plan** — `dev-lead` decomposes the OpenSpec change into file-disjoint, dependency-ordered
  task *waves* (in-memory — no task DB).
- **Implement** — `dev-be`/`dev-fe` run in parallel per wave (sequential across waves), each
  given its task directly and committing on the branch.
- **Review** — `python-reviewer`, `typescript-reviewer`, `security-reviewer`,
  `silent-failure-hunter` fan out over the diff (structured findings).
- **Verify** — each CRITICAL/HIGH finding is judged by 3 perspective lenses; kept only on ≥2/3 vote.
- **Critic** — a completeness critic catches HIGH/CRITICAL the reviewers missed (also verified).
- **Test** — `tester` writes missing unit tests + runs the full suite.

The workflow returns: `{ readyToPush, blockingFindings, criticAdded, otherFindings, test, tasks, filesChanged }`.

### Phase 4: Gate — loop or proceed

Read the workflow result:

- **`readyToPush === true`** (no surviving CRITICAL/HIGH and tests pass) → go to Phase 5.
- **Otherwise** → surface `blockingFindings` + `test.failures` to the user, then either:
  - re-run the workflow (it re-plans/implements fixes), capped at **3 rounds**, or
  - dispatch a targeted `@dev-be`/`@dev-fe` fix for the specific blocking findings, then re-run
    the Review→Verify→Test tail.
  - After 3 rounds still failing → stop and escalate to the user.

### Phase 5: Push — user approval (interactive)

NEVER auto-push. Show the Final Report, then ask the user to approve. On approval, delegate to
`devops`: confirm clean tree, push branches, open the PR(s) → `dev` (one PR per repo).

### Phase 6: Report

Long-term memory: a replacement memory system is being introduced (TBD).

Final Report:

```
## Feature Complete: <change-id>

### Workflow Summary
- Plan: N waves, M tasks
- Implement: M tasks committed
- Review+Verify: B blocking (CRITICAL/HIGH after ≥2/3 lens vote), +C from completeness critic
- Other findings (MEDIUM/LOW): D
- Tests: PASS (E added) / FAIL

### Blocking findings (must be empty to push)
<blockingFindings>

### Branches → PR
- <repo> feature/<name> → PR #<n> (dev)

### Next
- /opsx:archive <change-id> when merged
```

**Guardrails**
- BA phase (new feature) MUST be interactive — confirm with the user. Fix re-runs do NOT need confirmation.
- DEVOPS creates the branch BEFORE the workflow; the workflow runs on the existing branch.
- NEVER push without explicit user approval (Push Policy in AGENTS.md).
- The workflow's Test phase + `blockingFindings === 0` is the gate — equivalent to "TESTER must pass before push".
- Max 3 fix rounds — then escalate.
- The workflow does the multi-agent orchestration; do NOT also launch reviewers/dev agents manually for the same change (double-runs them). Manual `@reviewer`/`@dev-*` calls are for small, out-of-pipeline one-offs.
- Do NOT delete the subagents (`dev-lead`, `dev-be`, `dev-fe`, the reviewers, `tester`) — the workflow invokes them by `agentType`.
