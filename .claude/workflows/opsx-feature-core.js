export const meta = {
  name: 'opsx-feature-core',
  description:
    'OpenSpec change -> in-memory task plan -> parallel DEV waves -> fan-out review + adversarial verify -> TESTER. ' +
    'Replaces the slow DEV-Lead->Beads->DEV-pull round-trip with in-workflow task passing.',
  phases: [
    { title: 'Plan', detail: 'decompose the OpenSpec change into file-disjoint, dependency-ordered task waves' },
    { title: 'Implement', detail: 'parallel dev-be / dev-fe per wave (sequential across waves)' },
    { title: 'Review', detail: '4 specialist reviewers fan out over the diff' },
    { title: 'Verify', detail: '3 perspective lenses vote on each CRITICAL/HIGH finding (cheap model)' },
    { title: 'Critic', detail: 'completeness critic finds HIGH/CRITICAL issues the reviewers missed' },
    { title: 'Test', detail: 'TESTER writes missing tests + runs the suite' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// SCOPE / CONTRACT
//
// This workflow automates the *core* of /opsx:feature — everything between
// "specs exist" and "ready to push". The two interactive ends stay OUTSIDE it
// (a workflow cannot pause to ask the user):
//   • BEFORE: @ba gathers requirements + writes the OpenSpec change, and DEVOPS
//             creates the feature branch in each target repo.
//   • AFTER : the user approves the push; DEVOPS opens the PR.
//
// Beads is OFF the critical path: instead of DEV-Lead importing tasks to the
// Beads DB and DEV agents pulling them back out (slow), the Plan agent emits the
// task list as structured output and the workflow fans DEV agents over it
// directly. The workflow RETURNS the task summary so the main session can record
// it to Beads afterwards (optional, for cross-session memory) — without that DB
// round-trip blocking the build.
//
// args = {
//   changeId: string   // OpenSpec change dir name under openspec/changes/<changeId>/
//   base?:    string   // base branch for the review diff (default 'dev')
// }
// Precondition: the feature branch already exists and is checked out in each
// target sub-repo.
// ─────────────────────────────────────────────────────────────────────────────

const CHANGE = args && args.changeId
const BASE = (args && args.base) || 'dev'

const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    waves: {
      type: 'array',
      description: 'Ordered waves. Tasks within a wave touch DISJOINT files (safe to run in parallel). Dependent tasks go in a later wave.',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object', additionalProperties: false,
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                repo: { type: 'string' },                 // e.g. <frontend-repo>
                layer: { type: 'string', enum: ['be', 'fe'] },
                files: { type: 'array', items: { type: 'string' } },
                commit: { type: 'string' },               // conventional commit message
              },
              required: ['id', 'title', 'description', 'repo', 'layer', 'files', 'commit'],
            },
          },
        },
        required: ['tasks'],
      },
    },
  },
  required: ['waves'],
}

const TASK_RESULT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    taskId: { type: 'string' },
    filesChanged: { type: 'array', items: { type: 'string' } },
    committed: { type: 'boolean' },
    lintClean: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['taskId', 'filesChanged', 'committed', 'lintClean', 'notes'],
}

const FINDING_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          reviewer: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'number' },
          issue: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'reviewer', 'file', 'issue', 'fix'],
      },
    },
    verdict: { type: 'string', enum: ['APPROVE', 'WARNING', 'BLOCK'] },
  },
  required: ['findings', 'verdict'],
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { real: { type: 'boolean' }, reasoning: { type: 'string' } },
  required: ['real', 'reasoning'],
}

const TEST_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    passed: { type: 'boolean' },
    testsAdded: { type: 'number' },
    failures: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
  required: ['passed', 'testsAdded', 'failures', 'notes'],
}

if (!CHANGE) {
  log('⚠️ No args.changeId provided — pass { changeId: "<openspec-change-dir>" }. Aborting plan.')
}

// ── Phase 1: PLAN (replaces DEV Lead + Beads import) ─────────────────────────
phase('Plan')
const plan = await agent(
  `You are the DEV Lead. Read the OpenSpec change at \`openspec/changes/${CHANGE}/\` ` +
  `(proposal.md, design.md, tasks.md, specs/**). Decompose it into concrete implementation tasks.\n\n` +
  `Group tasks into ORDERED WAVES with these rules:\n` +
  `- Tasks WITHIN a wave MUST touch DISJOINT files so they can run in parallel without conflicting.\n` +
  `- A task that depends on another task's output goes in a LATER wave.\n` +
  `- Label each task layer 'be' (Python/FastAPI backend repo) or 'fe' (React/Vite frontend repo) ` +
  `and set its target repo + the exact files it will touch + a conventional commit message ` +
  `("feat:/fix:/refactor: <title> [<id>]").\n` +
  `Do NOT write anything to Beads. Return the wave plan as structured output only.`,
  { agentType: 'dev-lead', phase: 'Plan', schema: PLAN_SCHEMA, label: `plan:${CHANGE}` },
)

const waves = (plan && plan.waves) || []
log(`Plan: ${waves.length} wave(s), ${waves.reduce((n, w) => n + (w.tasks || []).length, 0)} task(s)`)

// ── Phase 2: IMPLEMENT (waves sequential; tasks parallel within a wave) ──────
phase('Implement')
const implemented = []
for (let w = 0; w < waves.length; w++) {
  const tasks = waves[w].tasks || []
  const res = await parallel(
    tasks.map((t) => () =>
      agent(
        `Implement THIS task directly. Do NOT use Beads or any \`bd\` command — the task is given here.\n\n` +
        `Task ${t.id}: ${t.title}\n${t.description}\n\n` +
        `Repo: ${t.repo}. Edit ONLY these files: ${(t.files || []).join(', ') || '(determine from the task)'}.\n` +
        `Follow the repo conventions (theme tokens — no hardcoded colors; i18n via t('key','fallback'); ` +
        `English-only code/comments; surgical changes only). After editing, run lint/build for the repo and ` +
        `commit on the CURRENT branch with: "${t.commit}". Report what you changed.`,
        { agentType: t.layer === 'be' ? 'dev-be' : 'dev-fe', phase: 'Implement', label: t.id, schema: TASK_RESULT_SCHEMA },
      ),
    ),
  )
  implemented.push(...res.filter(Boolean))
  log(`Wave ${w + 1}/${waves.length} done: ${res.filter(Boolean).length}/${tasks.length} tasks`)
}

// ── Phase 3+4: REVIEW -> VERIFY (pipeline — each reviewer's CRITICAL/HIGH
//    findings are adversarially refuted as soon as THAT reviewer finishes; no
//    barrier waiting for the slowest reviewer. Per-agent `phase` opts only (no
//    global phase() — the Review/Verify groups interleave, so a global phase()
//    call would race). Reviewers are scoped to the touched repos + files. ──────
const touchedRepos = [...new Set(waves.flatMap((w) => w.tasks || []).map((t) => t.repo).filter(Boolean))]
const changedFiles = [...new Set(implemented.flatMap((t) => t.filesChanged || []))]
const fileHint = changedFiles.length
  ? `Changed files: ${changedFiles.slice(0, 40).join(', ')}${changedFiles.length > 40 ? ' …' : ''}.`
  : ''

// Multi-perspective adversarial verify: 3 independent lenses vote on a finding;
// it counts as REAL only if >= 2/3 lenses confirm it. Diverse lenses catch
// failure modes that 3 identical refuters would miss. Cheap model (haiku).
const LENSES = [
  { key: 'correctness', q: 'Is the finding TECHNICALLY ACCURATE — does the real code actually behave as the claim says?' },
  { key: 'impact', q: 'Is this genuinely HARMFUL / exploitable in practice (not theoretical or merely cosmetic)?' },
  { key: 'refute', q: 'Try your HARDEST to prove it is a FALSE POSITIVE. After doing so, is it still real?' },
]
const verifyFinding = (f, who) =>
  parallel(
    LENSES.map((L) => () =>
      agent(
        `Adversarial verify — ${L.key} lens — of a ${who} code-review finding.\n` +
        `File ${f.file}${f.line ? ':' + f.line : ''}. Claim: "${f.issue}". Proposed fix: "${f.fix}".\n` +
        `${L.q}\nReturn real=true ONLY if, under THIS lens, the issue is real and worth fixing; default real=false if unsure.`,
        { phase: 'Verify', model: 'haiku', schema: VERDICT_SCHEMA, label: `verify:${L.key}:${f.file}` },
      ).then((v) => !!(v && v.real)),
    ),
  ).then((votes) => ({ finding: f, real: votes.filter(Boolean).length >= 2 }))

const REVIEWERS = [
  { type: 'python-reviewer', label: 'python' },
  { type: 'typescript-reviewer', label: 'typescript' },
  { type: 'security-reviewer', label: 'security' },
  { type: 'silent-failure-hunter', label: 'silent-failure' },
]

const reviewed = (await pipeline(
  REVIEWERS,
  // Stage 1 — review the diff
  (r) =>
    agent(
      `Review the committed changes on the current branch vs ${BASE} in repos: ${touchedRepos.join(', ') || '(all touched)'} ` +
      `(use \`git diff ${BASE}...HEAD\` in each). ${fileHint} ` +
      `Report findings with severity CRITICAL/HIGH/MEDIUM/LOW — precise: file + line + concrete fix.`,
      { agentType: r.type, phase: 'Review', label: r.label, schema: FINDING_SCHEMA },
    ),
  // Stage 2 — adversarially verify this reviewer's CRITICAL/HIGH findings
  (review, r) => {
    const hi = (review.findings || []).filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
    return parallel(
      hi.map((f) => () => verifyFinding(f, r.label)),
    ).then((verdicts) => ({
      reviewer: r.label,
      verifiedHigh: verdicts.filter(Boolean).filter((x) => x.real).map((x) => x.finding),
      otherFindings: (review.findings || []).filter((f) => f.severity === 'MEDIUM' || f.severity === 'LOW'),
    }))
  },
)).filter(Boolean)

const verified = reviewed.flatMap((r) => r.verifiedHigh || [])
const otherFindings = reviewed.flatMap((r) => r.otherFindings || [])

// ── Phase 5: COMPLETENESS CRITIC (catch HIGH/CRITICAL the reviewers missed) ──
phase('Critic')
const alreadyFound = verified.map((f) => `${f.file}: ${f.issue}`)
const critic = await agent(
  `You are a completeness critic. The specialist reviewers may have MISSED issues. Inspect the diff ` +
  `(\`git diff ${BASE}...HEAD\` in repos: ${touchedRepos.join(', ') || '(touched)'}) and look specifically for ` +
  `HIGH/CRITICAL gaps reviewers commonly miss: auth/permission boundaries, input validation at system edges, ` +
  `swallowed errors / missing error propagation, race conditions & concurrency, missing transaction rollback, ` +
  `unbounded or N+1 queries, and user-facing strings missing i18n. Report ONLY genuinely NEW CRITICAL/HIGH ` +
  `issues that are NOT already in this list:\n${JSON.stringify(alreadyFound)}`,
  { phase: 'Critic', schema: FINDING_SCHEMA, label: 'completeness-critic' },
)
const criticHigh = ((critic && critic.findings) || []).filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
const criticVerified = (await parallel(criticHigh.map((f) => () => verifyFinding(f, 'critic'))))
  .filter(Boolean).filter((x) => x.real).map((x) => x.finding)
const allVerified = [...verified, ...criticVerified]

// ── Phase 6: TEST (TESTER writes missing tests + runs the suite) ─────────────
phase('Test')
const test = await agent(
  `You are TESTER. Validate the implemented tasks on the current branch. Write missing unit tests for the ` +
  `new/changed code, then run the FULL test suite for every touched repo. Report pass/fail, how many tests ` +
  `you added, and any failures verbatim.`,
  { agentType: 'tester', phase: 'Test', schema: TEST_SCHEMA, label: 'tester' },
)

// ── Result → main session decides push (interactive) + optional Beads record ─
const blocking = allVerified.length
const testPassed = !!(test && test.passed)
return {
  change: CHANGE,
  base: BASE,
  waves: waves.length,
  tasksPlanned: waves.reduce((n, w) => n + (w.tasks || []).length, 0),
  tasksImplemented: implemented.length,
  filesChanged: changedFiles,
  blockingFindings: allVerified,                            // CRITICAL/HIGH (reviewers + critic) surviving >=2/3 lens vote
  criticAdded: criticVerified.length,                       // extra HIGH/CRITICAL the completeness critic caught
  otherFindings,                                            // MEDIUM/LOW (not adversarially verified)
  test,
  // The main session uses this to decide: if true, ask the user to approve the push;
  // otherwise surface blockingFindings / test failures to fix first.
  readyToPush: blocking === 0 && testPassed,
  tasks: implemented,                                       // for optional post-hoc `bd` recording
}
