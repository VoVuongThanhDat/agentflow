import type { CharacterData } from '../types';

/**
 * DevOps character pixel art data.
 * Palette (orange / ops engineer theme):
 *   0: #F5D0B5 — skin light
 *   1: #E8A87C — skin shadow
 *   2: #F97316 — orange (hard hat body, jacket)
 *   3: #EA580C — dark orange (jacket shadow)
 *   4: #7C2D12 — dark brown (tool belt)
 *   5: #FED7AA — light orange (hard hat highlight)
 *   6: #6B7280 — gray (wrench metal)
 *   7: #FFFFFF — white (eyes)
 *   8: #EF4444 — red (error flash)
 *   9: #1F2937 — very dark (outlines, pupils)
 *
 * Grid: 32 rows x 24 cols. null = transparent.
 * Head rows 0-11, body rows 12-27, legs rows 28-31.
 * Hard hat extends 1-2 rows above head and slightly wider for silhouette.
 */

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

type Row = (number | null)[];

const _ = null;

// Hard hat brim row (wider than head) — row 0
const hatBrim: Row = [_,_,_,_,_,_,2,2,2,2,2,2,2,2,2,2,2,2,_,_,_,_,_,_];
// Hard hat top row — row 1
const hatTop:  Row = [_,_,_,_,_,5,2,2,2,2,2,2,2,2,2,2,2,2,5,_,_,_,_,_];
// Hard hat lower / band row — row 2
const hatBand: Row = [_,_,_,_,_,5,5,2,2,2,2,2,2,2,2,2,2,5,5,_,_,_,_,_];
// Hard hat bottom edge — row 3
const hatEdge: Row = [_,_,_,_,_,2,2,2,2,2,2,2,2,2,2,2,2,2,2,_,_,_,_,_];

// Head rows (rows 4-11)
const headTop:    Row = [_,_,_,_,_,9,9,9,9,9,9,9,9,9,9,9,9,9,_,_,_,_,_,_];
const headR1:     Row = [_,_,_,_,9,0,0,0,0,0,0,0,0,0,0,0,0,9,_,_,_,_,_,_];
const headR2:     Row = [_,_,_,_,9,0,0,0,0,0,0,0,0,0,0,0,0,9,_,_,_,_,_,_];
// eyes open
const headEyesO: Row = [_,_,_,_,9,0,0,7,9,0,0,0,0,7,9,0,0,9,_,_,_,_,_,_];
// eyes blink (closed)
const headEyesC: Row = [_,_,_,_,9,0,0,9,9,0,0,0,0,9,9,0,0,9,_,_,_,_,_,_];
const headNose:   Row = [_,_,_,_,9,0,0,0,1,0,0,0,0,0,1,0,0,9,_,_,_,_,_,_];
const headMouth:  Row = [_,_,_,_,9,0,0,9,0,9,9,9,9,0,9,0,0,9,_,_,_,_,_,_];
const headChin:   Row = [_,_,_,_,9,0,0,0,0,0,0,0,0,0,0,0,0,9,_,_,_,_,_,_];
const headBot:    Row = [_,_,_,_,_,9,9,9,9,9,9,9,9,9,9,9,9,9,_,_,_,_,_,_];

// Neck row (row 12)
const neck: Row = [_,_,_,_,_,_,_,0,0,0,0,0,0,0,0,_,_,_,_,_,_,_,_,_];

// Body rows (rows 13-27)
// utility jacket (orange with dark outline)
const bodyShoulders: Row = [_,_,_,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,_,_,_,_,_];
const bodyChest1:    Row = [_,_,9,3,3,3,3,2,2,2,2,2,2,2,3,3,3,3,9,_,_,_,_,_];
const bodyChest2:    Row = [_,_,9,3,3,3,2,2,2,2,2,2,2,2,2,3,3,3,9,_,_,_,_,_];
const bodyMid1:      Row = [_,_,9,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,9,_,_,_,_,_];
const bodyMid2:      Row = [_,_,9,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,9,_,_,_,_,_];
// tool belt (horizontal band index 4 with small tool pixels)
const toolBelt1:     Row = [_,_,9,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,9,_,_,_,_,_];
const toolBelt2:     Row = [_,_,9,4,4,6,4,4,6,4,4,6,4,4,6,4,4,4,9,_,_,_,_,_];
const bodyLow1:      Row = [_,_,9,3,3,3,3,2,2,2,2,2,2,2,3,3,3,3,9,_,_,_,_,_];
const bodyLow2:      Row = [_,_,9,3,3,3,3,2,2,2,2,2,2,2,3,3,3,3,9,_,_,_,_,_];
// lower body rows
const bodyBase1:     Row = [_,_,9,3,3,3,2,2,2,2,2,2,2,2,2,3,3,3,9,_,_,_,_,_];
const bodyBase2:     Row = [_,_,9,3,3,3,2,2,2,2,2,2,2,2,2,3,3,3,9,_,_,_,_,_];
// hips
const hips:          Row = [_,_,_,9,9,3,3,3,3,3,3,3,3,3,3,3,9,9,_,_,_,_,_,_];
const hipsBot:       Row = [_,_,_,_,9,9,3,3,3,3,3,3,3,3,9,9,_,_,_,_,_,_,_,_];

// Arm rows — arm-at-side (rows alongside chest/mid)
// left arm (cols 0-3) and right arm (cols 19-22) at side
const armSideL: Row = [_,9,2,9,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const armSideR: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,2,9,_,_,_,_];

// Wrench at side — 4 rows, right side
const wrenchSide0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,9,6,_,_,_];
const wrenchSide1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,6,9,_,_,_];
const wrenchSide2: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,_,_,_,_];
const wrenchSide3: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,_,_,_,_];

// Wrench tilted 1px
const wrenchTilt0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,9,6,_,_,_,_];
const wrenchTilt1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,6,_,_,_,_,_];
const wrenchTilt2: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,_,_,_,_,_];
const wrenchTilt3: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,_,_,_,_,_];

// Arm raised (working state) — arm angled up right side
const armRaisedR0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,2,_,_,9,_,_];
const armRaisedR1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,2,9,_,_,_];
const armRaisedR2: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,2,9,_,_,_];
// Wrench forward (working)
const wrenchFwd0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,9,6,9,_];
const wrenchFwd1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,6,_,_];

// Working arm at angle 2
const armAngle2R0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,2,9,_,_,_];
const armAngle2R1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,2,9,_,_];
const wrenchAngle2: Row= [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,6,9,6,9];

// Legs: standing still
const legStandL: Row = [_,_,_,_,_,9,3,3,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const legStandR: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,3,3,9,_,_,_,_,_,_];
const legStand2L:Row = [_,_,_,_,_,9,3,3,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const legStand2R:Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,3,3,9,_,_,_,_,_,_];

// Legs: walk step 1 — left leg forward
const legWalk1L0: Row = [_,_,_,_,9,3,3,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const legWalk1L1: Row = [_,_,_,_,9,3,3,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const legWalk1R0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,3,3,9,_,_,_,_,_,_];
const legWalk1R1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,3,9,_,_,_,_,_,_];
// Legs: walk step 2 — right leg forward
const legWalk2L0: Row = [_,_,_,_,_,3,3,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const legWalk2L1: Row = [_,_,_,_,_,_,3,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_];
const legWalk2R0: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,3,3,9,_,_,_,_,_,_];
const legWalk2R1: Row = [_,_,_,_,_,_,_,_,_,_,_,_,_,_,9,3,3,9,_,_,_,_,_,_];
// Foot tap row (waiting state, foot slightly right)
const legTap:    Row = [_,_,_,_,_,9,3,3,_,_,_,_,_,_,_,3,3,9,9,_,_,_,_,_];

// Error flash rows
const errorHat:  Row = [_,_,_,_,_,8,8,8,8,8,8,8,8,8,8,8,8,8,_,_,_,_,_,_];
const exclamRow: Row = [_,_,_,_,_,_,_,_,_,_,9,9,_,_,_,_,_,_,_,_,_,_,_,_];
const exclamDot: Row = [_,_,_,_,_,_,_,_,_,_,_,9,_,_,_,_,_,_,_,_,_,_,_,_];

// ---------------------------------------------------------------------------
// Frame assembly helpers
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Base body grid (rows 0-31, no arms/wrench overlaid yet)
// ---------------------------------------------------------------------------

const baseBody: (number | null)[][] = [
  /* 00 */ hatBrim,
  /* 01 */ hatTop,
  /* 02 */ hatBand,
  /* 03 */ hatEdge,
  /* 04 */ headTop,
  /* 05 */ headR1,
  /* 06 */ headR2,
  /* 07 */ headEyesO,
  /* 08 */ headNose,
  /* 09 */ headMouth,
  /* 10 */ headChin,
  /* 11 */ headBot,
  /* 12 */ neck,
  /* 13 */ bodyShoulders,
  /* 14 */ bodyChest1,
  /* 15 */ bodyChest2,
  /* 16 */ bodyMid1,
  /* 17 */ bodyMid2,
  /* 18 */ toolBelt1,
  /* 19 */ toolBelt2,
  /* 20 */ bodyLow1,
  /* 21 */ bodyLow2,
  /* 22 */ bodyBase1,
  /* 23 */ bodyBase2,
  /* 24 */ hips,
  /* 25 */ hipsBot,
  /* 26 */ legStandL,   // will be overridden per anim
  /* 27 */ legStandR,   // will be overridden per anim
  /* 28 */ legStand2L,
  /* 29 */ legStand2R,
  /* 30 */ new Array<number | null>(24).fill(null),
  /* 31 */ new Array<number | null>(24).fill(null),
];

// ---------------------------------------------------------------------------
// Merge arm/wrench rows onto base body for idle states
// ---------------------------------------------------------------------------

function mergeArmRow(baseRow: Row, armRow: Row): Row {
  return baseRow.map((v, i) => (armRow[i] !== null ? armRow[i] : v));
}

function buildBaseWithArms(eyeRow: Row): (number | null)[][] {
  const grid = baseBody.map((r) => [...r]);
  grid[7] = [...eyeRow];
  // left arm alongside body rows 14-17
  for (let r = 14; r <= 17; r++) {
    grid[r] = mergeArmRow(grid[r], armSideL);
  }
  // right arm alongside body rows 14-17
  for (let r = 14; r <= 17; r++) {
    grid[r] = mergeArmRow(grid[r], armSideR);
  }
  return grid;
}

// ---------------------------------------------------------------------------
// IDLE — 2 frames
// ---------------------------------------------------------------------------

function buildIdleFrame(blink: boolean): (number | null)[][] {
  const grid = buildBaseWithArms(blink ? headEyesC : headEyesO);
  // wrench at side rows 20-23
  grid[20] = mergeArmRow(grid[20], wrenchSide0);
  grid[21] = mergeArmRow(grid[21], wrenchSide1);
  grid[22] = mergeArmRow(grid[22], wrenchSide2);
  grid[23] = mergeArmRow(grid[23], wrenchSide3);
  return grid;
}

const idleFrame0 = buildIdleFrame(false);
const idleFrame1 = buildIdleFrame(true);

// Idle frame 1 — wrench tilted 1px
const idleFrame1Tilted = (() => {
  const grid = buildBaseWithArms(headEyesC);
  grid[20] = mergeArmRow(grid[20], wrenchTilt0);
  grid[21] = mergeArmRow(grid[21], wrenchTilt1);
  grid[22] = mergeArmRow(grid[22], wrenchTilt2);
  grid[23] = mergeArmRow(grid[23], wrenchTilt3);
  return grid;
})();

// ---------------------------------------------------------------------------
// WORKING — 3 frames
// ---------------------------------------------------------------------------

function buildWorkingFrame0(): (number | null)[][] {
  const grid = buildBaseWithArms(headEyesO);
  // arm raised right side (rows 14-16)
  grid[14] = mergeArmRow(grid[14], armRaisedR0);
  grid[15] = mergeArmRow(grid[15], armRaisedR1);
  grid[16] = mergeArmRow(grid[16], armRaisedR2);
  // wrench forward (rows 17-18)
  grid[17] = mergeArmRow(grid[17], wrenchFwd0);
  grid[18] = mergeArmRow(grid[18], wrenchFwd1);
  return grid;
}

function buildWorkingFrame1(): (number | null)[][] {
  const grid = buildBaseWithArms(headEyesO);
  // arm at angle 2 (rows 15-16)
  grid[15] = mergeArmRow(grid[15], armAngle2R0);
  grid[16] = mergeArmRow(grid[16], armAngle2R1);
  // wrench at angle
  grid[17] = mergeArmRow(grid[17], wrenchAngle2);
  return grid;
}

// Frame 2: return position same as idle but eyes open
const buildWorkingFrame2 = (): (number | null)[][] => buildIdleFrame(false);

// ---------------------------------------------------------------------------
// WANDERING — 4 frames (walk cycle)
// ---------------------------------------------------------------------------

function buildWalkFrame(
  legRows: { r26: Row; r27: Row; r28: Row; r29: Row },
  eyeRow: Row
): (number | null)[][] {
  const grid = buildBaseWithArms(eyeRow);
  // wrench at side
  grid[20] = mergeArmRow(grid[20], wrenchSide0);
  grid[21] = mergeArmRow(grid[21], wrenchSide1);
  grid[26] = [...legRows.r26];
  grid[27] = [...legRows.r27];
  grid[28] = [...legRows.r28];
  grid[29] = [...legRows.r29];
  return grid;
}

const wanderFrame0 = buildWalkFrame(
  { r26: legWalk1L0, r27: legWalk1R0, r28: legWalk1L1, r29: legWalk1R1 },
  headEyesO
);
const wanderFrame1 = buildWalkFrame(
  { r26: legStandL, r27: legStandR, r28: legStand2L, r29: legStand2R },
  headEyesO
);
const wanderFrame2 = buildWalkFrame(
  { r26: legWalk2L0, r27: legWalk2R0, r28: legWalk2L1, r29: legWalk2R1 },
  headEyesO
);
const wanderFrame3 = buildWalkFrame(
  { r26: legStandL, r27: legStandR, r28: legStand2L, r29: legStand2R },
  headEyesC
);

// ---------------------------------------------------------------------------
// DELIVERING — 4 frames (fast walk, wrench held up)
// ---------------------------------------------------------------------------

function buildDeliverFrame(
  legRows: { r26: Row; r27: Row; r28: Row; r29: Row }
): (number | null)[][] {
  const grid = buildBaseWithArms(headEyesO);
  // wrench raised higher (row 17-18) while walking
  grid[14] = mergeArmRow(grid[14], armRaisedR0);
  grid[15] = mergeArmRow(grid[15], armRaisedR1);
  grid[16] = mergeArmRow(grid[16], armRaisedR2);
  grid[17] = mergeArmRow(grid[17], wrenchFwd0);
  grid[26] = [...legRows.r26];
  grid[27] = [...legRows.r27];
  grid[28] = [...legRows.r28];
  grid[29] = [...legRows.r29];
  return grid;
}

const deliverFrame0 = buildDeliverFrame({
  r26: legWalk1L0, r27: legWalk1R0, r28: legWalk1L1, r29: legWalk1R1,
});
const deliverFrame1 = buildDeliverFrame({
  r26: legStandL, r27: legStandR, r28: legStand2L, r29: legStand2R,
});
const deliverFrame2 = buildDeliverFrame({
  r26: legWalk2L0, r27: legWalk2R0, r28: legWalk2L1, r29: legWalk2R1,
});
const deliverFrame3 = buildDeliverFrame({
  r26: legStandL, r27: legStandR, r28: legStand2L, r29: legStand2R,
});

// ---------------------------------------------------------------------------
// WAITING — 2 frames (foot tap + wrench spin)
// ---------------------------------------------------------------------------

function buildWaitFrame(wrenchRow: Row, tapFoot: boolean): (number | null)[][] {
  const grid = buildBaseWithArms(headEyesO);
  grid[20] = mergeArmRow(grid[20], wrenchRow);
  if (tapFoot) {
    grid[28] = [...legTap];
  }
  return grid;
}

const waitFrame0 = buildWaitFrame(wrenchSide0, false);
const waitFrame1 = buildWaitFrame(wrenchTilt0, true);

// ---------------------------------------------------------------------------
// ERROR — 2 frames (red flash + ! above hat)
// ---------------------------------------------------------------------------

function buildErrorFrame(flash: boolean): (number | null)[][] {
  const grid = buildBaseWithArms(headEyesO);
  if (flash) {
    grid[0] = [...errorHat];
    grid[1] = [...exclamRow];
    grid[2] = [...exclamDot];
  }
  // wrench held side always visible
  grid[20] = mergeArmRow(grid[20], wrenchSide0);
  grid[21] = mergeArmRow(grid[21], wrenchSide1);
  return grid;
}

const errorFrame0 = buildErrorFrame(true);
const errorFrame1 = buildErrorFrame(false);

// ---------------------------------------------------------------------------
// Final export
// ---------------------------------------------------------------------------

export const devopsCharacter: CharacterData = {
  agentId: 'devops',
  displayName: 'DevOps',
  palette: [
    '#F5D0B5', // 0 skin light
    '#E8A87C', // 1 skin shadow
    '#F97316', // 2 orange
    '#EA580C', // 3 dark orange
    '#7C2D12', // 4 dark brown (tool belt)
    '#FED7AA', // 5 light orange (hard hat highlight)
    '#6B7280', // 6 gray (wrench metal)
    '#FFFFFF', // 7 white (eyes)
    '#EF4444', // 8 red (error)
    '#1F2937', // 9 very dark (outlines)
  ],
  animations: {
    idle: {
      frames: [idleFrame0, idleFrame1Tilted],
      frameRate: 2,
      loop: true,
    },
    working: {
      frames: [buildWorkingFrame0(), buildWorkingFrame1(), buildWorkingFrame2()],
      frameRate: 4,
      loop: true,
    },
    wandering: {
      frames: [wanderFrame0, wanderFrame1, wanderFrame2, wanderFrame3],
      frameRate: 6,
      loop: true,
    },
    delivering: {
      frames: [deliverFrame0, deliverFrame1, deliverFrame2, deliverFrame3],
      frameRate: 8,
      loop: true,
    },
    waiting: {
      frames: [waitFrame0, waitFrame1],
      frameRate: 2,
      loop: true,
    },
    error: {
      frames: [errorFrame0, errorFrame1],
      frameRate: 4,
      loop: true,
    },
  },
};

// Suppress unused variable warning for idleFrame1 (kept for reference)
void idleFrame1;
