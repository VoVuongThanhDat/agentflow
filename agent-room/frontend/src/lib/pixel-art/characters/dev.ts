import type { CharacterData } from '../types';

/**
 * Dev character pixel art data.
 * Design: green t-shirt with code symbol, messy/spiky hair, glasses, casual coder look.
 * Grid: 24 cols x 32 rows. null = transparent.
 * Palette indices:
 *   0: skin light   (#F5CBA7)
 *   1: skin shadow  (#D4956A)
 *   2: green main   (#22C55E)  — t-shirt
 *   3: dark green   (#15803D)  — t-shirt shadow / code symbol
 *   4: hair brown   (#7C3F00)
 *   5: white        (#FFFFFF)  — eyes, code symbol highlight
 *   6: dark gray    (#374151)  — jeans / shoes
 *   7: glasses frame (#1E293B)
 *   8: red/error    (#EF4444)
 *   9: black        (#111827)  — outlines, pupils
 */

// ---------------------------------------------------------------------------
// Helper: create a blank 32x24 transparent grid
// ---------------------------------------------------------------------------
function blank(): (number | null)[][] {
  return Array.from({ length: 32 }, () => Array(24).fill(null) as (number | null)[]);
}

// ---------------------------------------------------------------------------
// Shared head builder
// Returns a 32x24 grid with only head/hair/face drawn (rows 0–11).
// pose: 'neutral' | 'down' (head tilted down slightly for working)
// blink: whether eyes are closed
// ---------------------------------------------------------------------------
function buildHead(blink = false, tiltDown = false): (number | null)[][] {
  const g = blank();
  const rowOffset = tiltDown ? 1 : 0;

  // ── Spiky / messy hair (rows 0-3) ─────────────────────────────────────────
  // Spikes on top
  const R = rowOffset;
  // top spike tips
  g[R + 0][10] = 4;
  g[R + 0][12] = 4;
  g[R + 0][14] = 4;
  // spike bases widening
  g[R + 1][9]  = 4; g[R + 1][10] = 4; g[R + 1][11] = 4;
  g[R + 1][12] = 4; g[R + 1][13] = 4; g[R + 1][14] = 4; g[R + 1][15] = 4;
  // hair crown connecting to sides
  g[R + 2][8]  = 4; g[R + 2][9]  = 4; g[R + 2][10] = 4; g[R + 2][11] = 4;
  g[R + 2][12] = 4; g[R + 2][13] = 4; g[R + 2][14] = 4; g[R + 2][15] = 4;
  // side tufts
  g[R + 3][8]  = 4; // left tuft
  g[R + 3][15] = 4; // right tuft
  g[R + 3][16] = 4;

  // ── Skin face (rows 2-9) ──────────────────────────────────────────────────
  // Core face fill
  for (let r = R + 2; r <= R + 9; r++) {
    for (let c = 9; c <= 15; c++) {
      if (g[r][c] === null) g[r][c] = 0;
    }
  }
  // Face width narrows at chin
  g[R + 8][9]  = null; g[R + 8][15] = null;
  g[R + 9][9]  = null; g[R + 9][15] = null;
  g[R + 9][10] = 1;    g[R + 9][14] = 1; // chin shadow

  // Side shadows for jaw / cheek depth
  g[R + 4][9]  = 1;
  g[R + 5][9]  = 1;
  g[R + 6][9]  = 1;
  g[R + 7][9]  = 1;
  g[R + 4][15] = 1;
  g[R + 5][15] = 1;
  g[R + 6][15] = 1;
  g[R + 7][15] = 1;

  // ── Glasses (row 4-5) ─────────────────────────────────────────────────────
  // Left lens frame
  g[R + 4][10] = 7; g[R + 4][11] = 7;
  g[R + 5][10] = 7; g[R + 5][11] = 7;
  // Bridge
  g[R + 4][12] = 7;
  // Right lens frame
  g[R + 4][13] = 7; g[R + 4][14] = 7;
  g[R + 5][13] = 7; g[R + 5][14] = 7;
  // Lens glass (lighter)
  g[R + 4][10] = 7; g[R + 5][10] = 7;

  // ── Eyes behind glasses (row 5) ───────────────────────────────────────────
  if (blink) {
    // Closed eyes — thin lines
    g[R + 5][10] = 7; g[R + 5][11] = 7;
    g[R + 5][13] = 7; g[R + 5][14] = 7;
  } else {
    // Open eyes — dark pupils
    g[R + 5][10] = 9; g[R + 5][11] = 9;
    g[R + 5][13] = 9; g[R + 5][14] = 9;
    // Tiny highlight
    g[R + 4][11] = 5;
    g[R + 4][13] = 5;
  }

  // ── Nose (row 6-7) ────────────────────────────────────────────────────────
  g[R + 6][12] = 1;
  g[R + 7][11] = 1; g[R + 7][12] = 1;

  // ── Mouth (row 8) ─────────────────────────────────────────────────────────
  g[R + 8][11] = 1; g[R + 8][12] = 1; g[R + 8][13] = 1;

  // ── Ear / glasses side arms ───────────────────────────────────────────────
  g[R + 4][8] = 7; // left arm
  g[R + 5][8] = 7;
  g[R + 4][16] = 7; // right arm
  g[R + 5][16] = 7;

  // ── Neck (rows 10-11) ─────────────────────────────────────────────────────
  g[R + 10][11] = 0; g[R + 10][12] = 0; g[R + 10][13] = 0;
  g[R + 11][11] = 1; g[R + 11][12] = 0; g[R + 11][13] = 1;

  return g;
}

// ---------------------------------------------------------------------------
// Body builder — draws torso + legs.
// shirtState: 'normal' | 'working' (slight lean)
// ---------------------------------------------------------------------------
function buildBody(g: (number | null)[][], variant: 'normal' | 'working' = 'normal'): void {
  const lean = variant === 'working' ? 1 : 0;
  const s = lean; // horizontal shift for working lean

  // ── Shoulders (row 12) ────────────────────────────────────────────────────
  for (let c = 7 + s; c <= 16 + s; c++) g[12][c] = 2;

  // ── T-shirt torso (rows 13-22) ─────────────────────────────────────────────
  for (let r = 13; r <= 22; r++) {
    for (let c = 8 + s; c <= 15 + s; c++) g[r][c] = 2;
    // Side shading
    g[r][8 + s] = 3;
    g[r][15 + s] = 3;
    // Arm stubs
    g[r][7 + s] = 2;
    g[r][16 + s] = 2;
  }

  // ── Code symbol on shirt (rows 15-19, centered) ────────────────────────────
  // "<>" symbol drawn with dark green and white highlight
  const sc = 10 + s; // base column
  // "<"
  g[15][sc]     = 3;
  g[16][sc - 1] = 3;
  g[17][sc]     = 3;
  // ">"
  g[15][sc + 3] = 3;
  g[16][sc + 4] = 3;
  g[17][sc + 3] = 3;
  // highlight on "<"
  g[15][sc + 1] = 5;
  g[16][sc]     = 5;
  // highlight on ">"
  g[15][sc + 2] = 5;
  g[16][sc + 3] = 5;

  // ── Waistband / belt (rows 23-24) ──────────────────────────────────────────
  for (let c = 8; c <= 15; c++) {
    g[23][c] = 6;
    g[24][c] = 6;
  }

  // ── Jeans (rows 25-29) ─────────────────────────────────────────────────────
  for (let r = 25; r <= 29; r++) {
    for (let c = 8; c <= 11; c++) g[r][c] = 6;
    for (let c = 12; c <= 15; c++) g[r][c] = 6;
    // Denim highlight on outer thigh
    g[r][8] = 7;  // left outer
    g[r][15] = 7; // right outer
  }

  // ── Shoes (rows 30-31) ────────────────────────────────────────────────────
  for (let r = 30; r <= 31; r++) {
    for (let c = 7; c <= 11; c++) g[r][c] = 9;
    for (let c = 12; c <= 16; c++) g[r][c] = 9;
  }
  // Shoe sole highlight
  g[31][7]  = 6;
  g[31][16] = 6;
}

// ---------------------------------------------------------------------------
// Arms builder
// ---------------------------------------------------------------------------
function buildArms(
  g: (number | null)[][],
  leftPose: 'down' | 'forward' | 'up',
  rightPose: 'down' | 'forward' | 'laptop' | 'coffee' | 'up',
): void {
  // Left arm
  if (leftPose === 'down') {
    for (let r = 13; r <= 24; r++) g[r][7] = 2;
    g[22][6] = 0; g[23][6] = 0; g[24][6] = 0;
    g[22][7] = 0; g[23][7] = 0;
  } else if (leftPose === 'forward') {
    for (let r = 13; r <= 20; r++) g[r][7] = 2;
    // arm bends outward toward keyboard
    g[21][7] = 2; g[21][8] = 2; g[21][9] = 2;
    g[22][9] = 0; // hand
  } else if (leftPose === 'up') {
    for (let r = 13; r <= 18; r++) g[r][7] = 2;
    g[18][6] = 2; g[17][5] = 2; g[16][5] = 2;
    g[15][5] = 0; g[16][4] = 0; // raised hand
  }

  // Right arm
  if (rightPose === 'down') {
    for (let r = 13; r <= 24; r++) g[r][16] = 2;
    g[22][17] = 0; g[23][17] = 0; g[24][17] = 0;
    g[22][16] = 0; g[23][16] = 0;
  } else if (rightPose === 'forward') {
    for (let r = 13; r <= 20; r++) g[r][16] = 2;
    g[21][16] = 2; g[21][15] = 2; g[21][14] = 2;
    g[22][14] = 0; // hand
  } else if (rightPose === 'laptop') {
    // Arm holds laptop under elbow
    for (let r = 13; r <= 22; r++) g[r][16] = 2;
    g[22][17] = 0; g[23][17] = 0;
    // Laptop tucked
    g[19][17] = 6; g[19][18] = 6; g[19][19] = 6; g[19][20] = 6;
    g[20][17] = 9; g[20][18] = 5; g[20][19] = 9; g[20][20] = 6;
    g[21][17] = 9; g[21][18] = 9; g[21][19] = 5; g[21][20] = 6;
    g[22][17] = 6; g[22][18] = 6; g[22][19] = 6; g[22][20] = 6;
  } else if (rightPose === 'coffee') {
    // Arm bent, holding coffee cup
    for (let r = 13; r <= 20; r++) g[r][16] = 2;
    g[20][17] = 2; g[19][17] = 2;
    g[18][18] = 0; // hand
    // Coffee cup
    g[14][19] = 6; g[14][20] = 6; g[14][21] = 6;
    g[15][18] = 8; g[15][19] = 8; g[15][20] = 8; g[15][21] = 6;
    g[16][18] = 8; g[16][19] = 5; g[16][20] = 8; g[16][21] = 6;
    g[17][18] = 6; g[17][19] = 6; g[17][20] = 6; g[17][21] = 6;
    // Handle
    g[15][21] = 6; g[16][21] = 6;
    g[15][22] = 6; g[16][22] = 6;
  } else if (rightPose === 'up') {
    // Arm raised — mirrored from left 'up' pose
    for (let r = 13; r <= 18; r++) g[r][16] = 2;
    g[18][17] = 2; g[17][18] = 2; g[16][18] = 2;
    g[15][18] = 0; g[16][19] = 0; // raised hand
  }
}

// ---------------------------------------------------------------------------
// Leg poses
// ---------------------------------------------------------------------------
function buildLegs(g: (number | null)[][], legPhase: 0 | 1 | 2 | 3): void {
  if (legPhase === 0) {
    // Stand / mid stride — both legs down
    for (let r = 25; r <= 29; r++) {
      for (let c = 8; c <= 11; c++) g[r][c] = g[r][c] ?? 6;
      for (let c = 12; c <= 15; c++) g[r][c] = g[r][c] ?? 6;
    }
    for (let r = 30; r <= 31; r++) {
      for (let c = 7; c <= 11; c++) g[r][c] = 9;
      for (let c = 12; c <= 16; c++) g[r][c] = 9;
    }
    g[31][7] = 6; g[31][16] = 6;
  } else if (legPhase === 1) {
    // Left foot forward
    for (let r = 25; r <= 30; r++) {
      for (let c = 7; c <= 11; c++) g[r][c] = g[r][c] ?? 6;
    }
    for (let r = 25; r <= 28; r++) {
      for (let c = 12; c <= 15; c++) g[r][c] = g[r][c] ?? 6;
    }
    g[29][12] = 6; g[29][13] = 6;
    g[30][13] = 9; g[30][14] = 9; g[31][12] = 9; g[31][13] = 9;
    g[30][7] = 9;  g[30][8] = 9;  g[31][7] = 9;  g[31][8] = 9;
    g[31][6] = 6; // shoe tip left (forward)
  } else if (legPhase === 2) {
    // Both legs mid again (mirror of 0)
    for (let r = 25; r <= 29; r++) {
      for (let c = 8; c <= 11; c++) g[r][c] = g[r][c] ?? 6;
      for (let c = 12; c <= 15; c++) g[r][c] = g[r][c] ?? 6;
    }
    for (let r = 30; r <= 31; r++) {
      for (let c = 7; c <= 11; c++) g[r][c] = 9;
      for (let c = 12; c <= 16; c++) g[r][c] = 9;
    }
    g[31][7] = 6; g[31][16] = 6;
  } else {
    // Right foot forward
    for (let r = 25; r <= 30; r++) {
      for (let c = 12; c <= 16; c++) g[r][c] = g[r][c] ?? 6;
    }
    for (let r = 25; r <= 28; r++) {
      for (let c = 8; c <= 11; c++) g[r][c] = g[r][c] ?? 6;
    }
    g[29][11] = 6; g[29][12] = 6;
    g[30][10] = 9; g[30][11] = 9; g[31][10] = 9; g[31][11] = 9;
    g[30][15] = 9; g[30][16] = 9; g[31][15] = 9; g[31][16] = 9;
    g[31][17] = 6; // shoe tip right (forward)
  }
}

// ---------------------------------------------------------------------------
// Laptop on desk — used in working frames
// Positioned rows 24-29, cols 9-17
// ---------------------------------------------------------------------------
function drawDeskLaptop(g: (number | null)[][], screenGlow: boolean): void {
  // Screen (open, tilted back)
  g[19][9]  = 6; g[19][10] = 6; g[19][11] = 6; g[19][12] = 6; g[19][13] = 6; g[19][14] = 6;
  if (screenGlow) {
    g[20][9]  = 5; g[20][10] = 9; g[20][11] = 5; g[20][12] = 9; g[20][13] = 5; g[20][14] = 6;
    g[21][9]  = 9; g[21][10] = 5; g[21][11] = 9; g[21][12] = 5; g[21][13] = 9; g[21][14] = 6;
    g[22][9]  = 5; g[22][10] = 9; g[22][11] = 5; g[22][12] = 9; g[22][13] = 5; g[22][14] = 6;
  } else {
    g[20][9]  = 9; g[20][10] = 9; g[20][11] = 9; g[20][12] = 9; g[20][13] = 9; g[20][14] = 6;
    g[21][9]  = 9; g[21][10] = 5; g[21][11] = 9; g[21][12] = 5; g[21][13] = 9; g[21][14] = 6;
    g[22][9]  = 9; g[22][10] = 9; g[22][11] = 9; g[22][12] = 9; g[22][13] = 9; g[22][14] = 6;
  }
  g[23][9]  = 6; g[23][10] = 6; g[23][11] = 6; g[23][12] = 6; g[23][13] = 6; g[23][14] = 6;
  // Hinge
  g[24][9]  = 6; g[24][10] = 6; g[24][11] = 6; g[24][12] = 6; g[24][13] = 6; g[24][14] = 6;
  // Keyboard base
  g[25][8]  = 6; g[25][9]  = 6; g[25][10] = 6; g[25][11] = 6; g[25][12] = 6; g[25][13] = 6; g[25][14] = 6; g[25][15] = 6;
  g[26][8]  = 7; g[26][9]  = 7; g[26][10] = 7; g[26][11] = 7; g[26][12] = 7; g[26][13] = 7; g[26][14] = 7; g[26][15] = 7;
}

// ---------------------------------------------------------------------------
// Screen glow effect — subtle tint on face/upper body
// ---------------------------------------------------------------------------
function applyScreenGlow(g: (number | null)[][], intensity: 1 | 2): void {
  // Just tint a few face pixels slightly brighter (simulate blue-white glow)
  // Row 8-11, near screen side (right portion of face/neck)
  const cols = intensity === 2 ? [13, 14, 15] : [14, 15];
  for (const c of cols) {
    if (g[8][c] === 0) g[8][c] = 5;
    if (g[9][c] === 0) g[9][c] = 5;
    if (g[10][c] === 0 || g[10][c] === 1) g[10][c] = 5;
    if (g[11][c] === 0 || g[11][c] === 1) g[11][c] = 5;
  }
}

// ===========================================================================
// IDLE frames
// ===========================================================================

function idleFrame0(): (number | null)[][] {
  const g = buildHead(false);
  buildBody(g, 'normal');
  buildArms(g, 'down', 'down');
  buildLegs(g, 0);
  return g;
}

function idleFrame1(): (number | null)[][] {
  // Blink
  const g = buildHead(true);
  buildBody(g, 'normal');
  buildArms(g, 'down', 'down');
  buildLegs(g, 0);
  return g;
}

// ===========================================================================
// WORKING frames — hunched over keyboard, screen glow
// ===========================================================================

function workingFrame0(): (number | null)[][] {
  const g = buildHead(false, true); // head tilted down
  buildBody(g, 'working');
  // Both arms forward to keyboard
  buildArms(g, 'forward', 'forward');
  // Desk laptop with glow
  drawDeskLaptop(g, true);
  // Jeans / shoes (seated — no legs visible below waist, draw desk instead)
  for (let c = 8; c <= 15; c++) {
    g[25][c] = g[25][c] ?? 6;
    g[26][c] = g[26][c] ?? 6;
  }
  // Feet under desk (barely visible)
  for (let c = 8; c <= 11; c++) { g[29][c] = 9; g[30][c] = 9; }
  for (let c = 12; c <= 15; c++) { g[29][c] = 9; g[30][c] = 9; }
  applyScreenGlow(g, 2);
  return g;
}

function workingFrame1(): (number | null)[][] {
  // Hands shift — typing animation frame
  const g = buildHead(false, true);
  buildBody(g, 'working');
  buildArms(g, 'forward', 'forward');
  drawDeskLaptop(g, true);
  for (let c = 8; c <= 15; c++) {
    g[25][c] = g[25][c] ?? 6;
    g[26][c] = g[26][c] ?? 6;
  }
  for (let c = 8; c <= 11; c++) { g[29][c] = 9; g[30][c] = 9; }
  for (let c = 12; c <= 15; c++) { g[29][c] = 9; g[30][c] = 9; }
  // shift left hand one pixel right
  g[22][9] = null;
  g[22][10] = 0;
  applyScreenGlow(g, 1);
  return g;
}

function workingFrame2(): (number | null)[][] {
  // Screen flicker — glow off momentarily
  const g = buildHead(false, true);
  buildBody(g, 'working');
  buildArms(g, 'forward', 'forward');
  drawDeskLaptop(g, false);
  for (let c = 8; c <= 15; c++) {
    g[25][c] = g[25][c] ?? 6;
    g[26][c] = g[26][c] ?? 6;
  }
  for (let c = 8; c <= 11; c++) { g[29][c] = 9; g[30][c] = 9; }
  for (let c = 12; c <= 15; c++) { g[29][c] = 9; g[30][c] = 9; }
  // shift right hand one pixel left
  g[22][14] = null;
  g[22][13] = 0;
  return g;
}

// ===========================================================================
// WANDERING frames — relaxed walk with coffee cup
// ===========================================================================

function wanderingFrame(phase: 0 | 1 | 2 | 3): (number | null)[][] {
  const g = buildHead(false);
  buildBody(g, 'normal');
  const leftArm: 'down' | 'up' = (phase === 0 || phase === 2) ? 'down' : 'up';
  buildArms(g, leftArm, 'coffee');
  buildLegs(g, phase);
  return g;
}

// ===========================================================================
// DELIVERING frames — purposeful walk carrying laptop
// ===========================================================================

function deliveringFrame(phase: 0 | 1 | 2 | 3): (number | null)[][] {
  const g = buildHead(false);
  buildBody(g, 'normal');
  const leftArm: 'down' | 'up' = (phase === 0 || phase === 2) ? 'down' : 'up';
  buildArms(g, leftArm, 'laptop');
  buildLegs(g, phase);
  return g;
}

// ===========================================================================
// WAITING frames
// ===========================================================================

function waitingFrame0(): (number | null)[][] {
  const g = buildHead(false);
  buildBody(g, 'normal');
  buildArms(g, 'down', 'down');
  buildLegs(g, 0);
  // Foot tap — lift left toe
  for (let c = 7; c <= 10; c++) g[31][c] = null;
  g[30][8] = 9; g[30][9] = 9; g[30][10] = 9;
  return g;
}

function waitingFrame1(): (number | null)[][] {
  const g = buildHead(true); // blink while waiting
  buildBody(g, 'normal');
  buildArms(g, 'down', 'down');
  buildLegs(g, 0);
  // Arm shift — slight bob
  g[23][6] = 0;
  return g;
}

// ===========================================================================
// ERROR frames
// ===========================================================================

function errorFrame0(): (number | null)[][] {
  const g = buildHead(false);
  buildBody(g, 'normal');
  buildArms(g, 'up', 'up'); // Both arms thrown up
  buildLegs(g, 0);
  // Red flash on body
  for (let r = 12; r <= 22; r++) {
    for (let c = 7; c <= 16; c++) {
      if (g[r][c] === 2 || g[r][c] === 3) g[r][c] = 8;
    }
  }
  // "!" above head
  g[0][12] = 8;
  g[1][12] = 8;
  g[2][12] = 8;
  g[3][12] = null;
  g[4][12] = 8; // dot
  return g;
}

function errorFrame1(): (number | null)[][] {
  // Alternating frame — normal look but arms still up
  const g = buildHead(false);
  buildBody(g, 'normal');
  buildArms(g, 'up', 'up');
  buildLegs(g, 0);
  return g;
}

// ---------------------------------------------------------------------------
// Character export
// ---------------------------------------------------------------------------

export const devCharacter: CharacterData = {
  agentId: 'dev-be',
  displayName: 'Dev',
  palette: [
    '#F5CBA7', // 0 skin light
    '#D4956A', // 1 skin shadow
    '#22C55E', // 2 green main (t-shirt)
    '#15803D', // 3 dark green (t-shirt shadow / code symbol)
    '#7C3F00', // 4 hair brown
    '#FFFFFF',  // 5 white (eyes, highlights)
    '#374151', // 6 dark gray (jeans / shoes)
    '#1E293B', // 7 glasses frame
    '#EF4444', // 8 red (error)
    '#111827', // 9 black (outlines, pupils, screen)
  ],
  animations: {
    idle: {
      frames: [idleFrame0(), idleFrame1()],
      frameRate: 2,
      loop: true,
    },
    working: {
      frames: [workingFrame0(), workingFrame1(), workingFrame2()],
      frameRate: 4,
      loop: true,
    },
    wandering: {
      frames: [
        wanderingFrame(0),
        wanderingFrame(1),
        wanderingFrame(2),
        wanderingFrame(3),
      ],
      frameRate: 6,
      loop: true,
    },
    delivering: {
      frames: [
        deliveringFrame(0),
        deliveringFrame(1),
        deliveringFrame(2),
        deliveringFrame(3),
      ],
      frameRate: 8,
      loop: true,
    },
    waiting: {
      frames: [waitingFrame0(), waitingFrame1()],
      frameRate: 2,
      loop: true,
    },
    error: {
      frames: [errorFrame0(), errorFrame1()],
      frameRate: 4,
      loop: true,
    },
  },
};
