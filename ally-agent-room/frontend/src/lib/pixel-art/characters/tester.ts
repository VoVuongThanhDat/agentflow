import type { CharacterData } from '../types';

/**
 * Tester character — white lab coat, safety goggles, magnifying glass.
 *
 * Palette:
 *   0: #F5D0B5  skin light
 *   1: #E8A87C  skin shadow
 *   2: #F59E0B  yellow (goggles lens / trim)
 *   3: #D97706  dark amber (goggle frame / coat trim)
 *   4: #92400E  brown (belt / detail)
 *   5: #FFFFFF  white (lab coat)
 *   6: #E5E7EB  light gray (coat shadow / magnifying glass frame)
 *   7: #10B981  green (checkmark in working state)
 *   8: #EF4444  red (error flash)
 *   9: #000000  black (outline / pupils)
 */

// ---------------------------------------------------------------------------
// Helper — build an empty 32x24 transparent grid
// ---------------------------------------------------------------------------
function makeGrid(): (number | null)[][] {
  return Array.from({ length: 32 }, () => Array<number | null>(24).fill(null));
}

// ---------------------------------------------------------------------------
// Shared base layer helpers
// ---------------------------------------------------------------------------

/** Draw chibi head (rows 0-11) onto `g` */
function drawHead(g: (number | null)[][]): void {
  // Row 0 — top hair / outline
  //         col: 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
  g[0]  = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
  // Row 1 — hair crown
  g[1]  = [null,null,null,null,null,null,null,null,9,   9,   9,   9,   9,   9,   9,   9,   null,null,null,null,null,null,null,null];
  // Row 2 — hair
  g[2]  = [null,null,null,null,null,null,null,9,   4,   4,   4,   4,   4,   4,   4,   4,   9,   null,null,null,null,null,null,null];
  // Row 3 — hair / forehead top
  g[3]  = [null,null,null,null,null,null,9,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   9,   null,null,null,null,null,null];
  // Row 4 — forehead
  g[4]  = [null,null,null,null,null,9,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   9,   null,null,null,null,null];
  // Row 5 — forehead
  g[5]  = [null,null,null,null,9,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   9,   null,null,null,null];
  // Row 6 — goggles (safety goggles across forehead/eyes area)
  //   goggle frame (3) with yellow lens (2) pixels
  g[6]  = [null,null,null,null,9,   0,   3,   2,   2,   3,   0,   0,   0,   3,   2,   2,   3,   0,   0,   9,   null,null,null,null];
  // Row 7 — goggles lower / eyes visible
  g[7]  = [null,null,null,null,9,   0,   3,   2,   2,   3,   9,   9,   9,   3,   2,   2,   3,   0,   0,   9,   null,null,null,null];
  // Row 8 — nose / mid-face
  g[8]  = [null,null,null,null,9,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   9,   null,null,null,null];
  // Row 9 — cheeks / smile
  g[9]  = [null,null,null,null,9,   0,   1,   0,   0,   0,   9,   null,null,9,   0,   0,   1,   0,   0,   9,   null,null,null,null];
  // Row 10 — chin / mouth
  g[10] = [null,null,null,null,9,   0,   0,   0,   9,   9,   0,   0,   0,   0,   9,   9,   0,   0,   0,   9,   null,null,null,null];
  // Row 11 — chin bottom
  g[11] = [null,null,null,null,null,9,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   9,   null,null,null,null,null];
}

/** Draw white lab coat body (rows 12-27) onto `g` */
function drawBody(g: (number | null)[][]): void {
  // Row 12 — neck / collar top
  g[12] = [null,null,null,null,null,9,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   9,   null,null,null,null,null];
  // Row 13 — collar / coat lapels (yellow trim 3)
  g[13] = [null,null,null,9,   5,   5,   3,   0,   0,   0,   0,   0,   0,   0,   0,   0,   3,   5,   5,   9,   null,null,null,null];
  // Row 14 — upper coat
  g[14] = [null,null,9,   5,   5,   5,   5,   3,   0,   0,   0,   0,   0,   0,   0,   3,   5,   5,   5,   5,   9,   null,null,null];
  // Row 15 — upper coat with arms start
  g[15] = [null,9,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   9,   null,null];
  // Row 16 — coat / left arm out
  g[16] = [9,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   9,   null];
  // Row 17 — left arm holding mag glass handle
  g[17] = [9,   5,   5,   6,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   6,   5,   5,   9,   null];
  // Row 18 — mid coat
  g[18] = [null,9,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   9,   null,null];
  // Row 19 — mid coat with pocket line
  g[19] = [null,9,   5,   5,   5,   5,   5,   5,   5,   4,   4,   4,   4,   4,   5,   5,   5,   5,   5,   5,   5,   9,   null,null];
  // Row 20 — pocket
  g[20] = [null,9,   5,   5,   5,   5,   5,   5,   5,   4,   5,   5,   5,   4,   5,   5,   5,   5,   5,   5,   5,   9,   null,null];
  // Row 21 — pocket bottom
  g[21] = [null,9,   5,   5,   5,   5,   5,   5,   5,   4,   4,   4,   4,   4,   5,   5,   5,   5,   5,   5,   5,   9,   null,null];
  // Row 22 — lower coat
  g[22] = [null,9,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   9,   null,null];
  // Row 23 — lower coat
  g[23] = [null,null,9,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   5,   9,   null,null,null];
  // Row 24 — waist / belt (amber trim 3)
  g[24] = [null,null,9,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   3,   9,   null,null,null];
  // Row 25 — lower body / pants
  g[25] = [null,null,9,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   9,   null,null,null];
  // Row 26 — pants
  g[26] = [null,null,9,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   4,   9,   null,null,null];
  // Row 27 — pants lower
  g[27] = [null,null,9,   4,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   4,   9,   null,null,null];
}

/** Draw legs (rows 28-31) onto `g` */
function drawLegsNeutral(g: (number | null)[][]): void {
  // Row 28 — upper legs split
  g[28] = [null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null];
  // Row 29 — mid legs
  g[29] = [null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null];
  // Row 30 — lower legs / shoes
  g[30] = [null,null,null,9,   9,   4,   4,   9,   9,   null,null,null,null,null,9,   9,   4,   4,   9,   9,   null,null,null,null];
  // Row 31 — feet / shoes
  g[31] = [null,null,null,null,9,   9,   9,   9,   null,null,null,null,null,null,null,9,   9,   9,   9,   null,null,null,null,null];
}

/** Draw magnifying glass on the right side (cols 19-23, rows 14-20) */
function drawMagGlassSide(g: (number | null)[][]): void {
  // Circle frame (6) at rows 14-18, cols 20-23
  g[14][20] = 6; g[14][21] = 6; g[14][22] = 6;
  g[15][19] = 6; g[15][22] = 6;
  g[16][19] = 6; g[16][22] = 6;
  g[17][20] = 6; g[17][21] = 6; g[17][22] = 6;
  // Handle
  g[18][22] = 4;
  g[19][23] = 4;
}

/** Draw magnifying glass raised (rows 12-17, shifted up) */
function drawMagGlassRaised(g: (number | null)[][]): void {
  // Circle frame at rows 12-16, cols 20-23
  g[12][20] = 6; g[12][21] = 6; g[12][22] = 6;
  g[13][19] = 6; g[13][22] = 6;
  g[14][19] = 6; g[14][22] = 6;
  g[15][20] = 6; g[15][21] = 6; g[15][22] = 6;
  // Handle
  g[16][22] = 4;
  g[17][23] = 4;
}

// ---------------------------------------------------------------------------
// IDLE — frame 0: standing, mag glass at side
// ---------------------------------------------------------------------------
function makeIdleFrame0(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassSide(g);
  return g;
}

// IDLE — frame 1: blink (goggles glint — swap one lens pixel to white)
function makeIdleFrame1(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassSide(g);
  // Goggles glint — turn one lens pixel white
  g[6][7] = 5;
  g[6][14] = 5;
  return g;
}

// ---------------------------------------------------------------------------
// WORKING — frame 0: mag glass raised forward
// ---------------------------------------------------------------------------
function makeWorkingFrame0(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassRaised(g);
  return g;
}

// WORKING — frame 1: examining motion + green checkmark pixel
function makeWorkingFrame1(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassRaised(g);
  // Green checkmark near clipboard area (pocket)
  g[19][10] = 7;
  g[20][11] = 7;
  g[20][12] = 7;
  // Arm shifted slightly (coat shadow pixel moves)
  g[16][3] = 6;
  return g;
}

// WORKING — frame 2: return to raised position
function makeWorkingFrame2(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassRaised(g);
  // Partial checkmark (fading)
  g[20][11] = 7;
  return g;
}

// ---------------------------------------------------------------------------
// WANDERING — walk cycle (4 frames)
// ---------------------------------------------------------------------------
function drawLegsWalk0(g: (number | null)[][]): void {
  // Left leg forward, right leg back
  g[27] = [null,null,9,   4,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   4,   9,   null,null,null];
  g[28] = [null,null,9,   4,   4,   4,   4,   9,   null,null,null,null,null,null,null,9,   4,   4,   4,   4,   9,   null,null,null];
  g[29] = [null,null,9,   4,   4,   4,   9,   null,null,null,null,null,null,null,null,null,9,   4,   4,   4,   9,   null,null,null];
  g[30] = [null,null,9,   9,   4,   9,   null,null,null,null,null,null,null,null,null,null,null,9,   9,   9,   null,null,null,null];
  g[31] = [null,null,null,9,   9,   null,null,null,null,null,null,null,null,null,null,null,null,null,9,   9,   null,null,null,null];
}

function drawLegsWalk1(g: (number | null)[][]): void {
  // Neutral stride
  g[28] = [null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null];
  g[29] = [null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null];
  g[30] = [null,null,null,9,   9,   4,   4,   9,   9,   null,null,null,null,null,9,   9,   4,   4,   9,   9,   null,null,null,null];
  g[31] = [null,null,null,null,9,   9,   9,   9,   null,null,null,null,null,null,null,9,   9,   9,   9,   null,null,null,null,null];
}

function drawLegsWalk2(g: (number | null)[][]): void {
  // Right leg forward, left leg back
  g[27] = [null,null,9,   4,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   4,   4,   9,   null,null,null];
  g[28] = [null,null,null,9,   4,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   4,   9,   null,null,null,null,null];
  g[29] = [null,null,null,null,9,   4,   4,   4,   9,   null,null,null,null,null,9,   4,   4,   9,   null,null,null,null,null,null];
  g[30] = [null,null,null,null,null,9,   9,   9,   null,null,null,null,null,null,9,   9,   null,null,null,null,null,null,null,null];
  g[31] = [null,null,null,null,null,null,9,   9,   null,null,null,null,null,null,null,9,   null,null,null,null,null,null,null,null];
}

function makeWanderFrame(walkFn: (g: (number | null)[][]) => void, coatFlap: boolean): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  walkFn(g);
  drawMagGlassSide(g);
  // Coat flap — shift one edge pixel on right side of coat
  if (coatFlap) {
    if (g[22][20] !== null) g[22][20] = 6;
  }
  return g;
}

// ---------------------------------------------------------------------------
// DELIVERING — fast walk, mag glass held high (4 frames)
// ---------------------------------------------------------------------------
function makeDeliveringFrame(walkFn: (g: (number | null)[][]) => void): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  walkFn(g);
  drawMagGlassRaised(g);
  return g;
}

// ---------------------------------------------------------------------------
// WAITING — tap foot (2 frames)
// ---------------------------------------------------------------------------
function makeWaitingFrame0(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassSide(g);
  return g;
}

function makeWaitingFrame1(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  // Left foot tap — shift foot down one row
  drawLegsNeutral(g);
  g[31][4] = null; g[31][5] = null; g[31][6] = null; g[31][7] = null;
  // Re-draw but shifted
  // Actually just add a small offset to left foot
  g[30][4] = null;
  drawMagGlassSide(g);
  return g;
}

// ---------------------------------------------------------------------------
// ERROR — flash red + X pixels (2 frames)
// ---------------------------------------------------------------------------
function makeErrorFrame0(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassSide(g);
  // Red X over pocket area
  g[19][9] = 8;  g[19][13] = 8;
  g[20][10] = 8; g[20][12] = 8;
  g[21][9] = 8;  g[21][13] = 8;
  // Red exclamation on coat
  g[15][11] = 8; g[15][12] = 8;
  g[16][11] = 8; g[16][12] = 8;
  g[18][11] = 8; g[18][12] = 8;
  return g;
}

function makeErrorFrame1(): (number | null)[][] {
  const g = makeGrid();
  drawHead(g);
  // Flash: turn lab coat to red tint (index 8 on some pixels)
  drawBody(g);
  drawLegsNeutral(g);
  drawMagGlassSide(g);
  // Shift body coat to red flash (override some coat pixels)
  for (let r = 13; r <= 23; r++) {
    for (let c = 3; c <= 20; c++) {
      if (g[r][c] === 5) g[r][c] = 8;
    }
  }
  return g;
}

// ---------------------------------------------------------------------------
// Build all grids
// ---------------------------------------------------------------------------
const idleFrame0 = makeIdleFrame0();
const idleFrame1 = makeIdleFrame1();

const workingFrame0 = makeWorkingFrame0();
const workingFrame1 = makeWorkingFrame1();
const workingFrame2 = makeWorkingFrame2();

const wanderFrame0 = makeWanderFrame((g) => drawLegsWalk0(g), false);
const wanderFrame1 = makeWanderFrame((g) => drawLegsWalk1(g), false);
const wanderFrame2 = makeWanderFrame((g) => drawLegsWalk2(g), true);
const wanderFrame3 = makeWanderFrame((g) => drawLegsWalk1(g), true);

const deliverFrame0 = makeDeliveringFrame((g) => drawLegsWalk0(g));
const deliverFrame1 = makeDeliveringFrame((g) => drawLegsWalk1(g));
const deliverFrame2 = makeDeliveringFrame((g) => drawLegsWalk2(g));
const deliverFrame3 = makeDeliveringFrame((g) => drawLegsWalk1(g));

const waitingFrame0 = makeWaitingFrame0();
const waitingFrame1 = makeWaitingFrame1();

const errorFrame0 = makeErrorFrame0();
const errorFrame1 = makeErrorFrame1();

// ---------------------------------------------------------------------------
// Exported character definition
// ---------------------------------------------------------------------------
export const testerCharacter: CharacterData = {
  agentId: 'tester',
  displayName: 'Tester',
  palette: [
    '#F5D0B5', // 0 skin light
    '#E8A87C', // 1 skin shadow
    '#F59E0B', // 2 yellow
    '#D97706', // 3 dark amber
    '#92400E', // 4 brown
    '#FFFFFF', // 5 white (lab coat)
    '#E5E7EB', // 6 light gray
    '#10B981', // 7 green
    '#EF4444', // 8 red
    '#000000', // 9 black
  ],
  animations: {
    idle: {
      frames: [idleFrame0, idleFrame1],
      frameRate: 2,
      loop: true,
    },
    working: {
      frames: [workingFrame0, workingFrame1, workingFrame2],
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
      frames: [waitingFrame0, waitingFrame1],
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
