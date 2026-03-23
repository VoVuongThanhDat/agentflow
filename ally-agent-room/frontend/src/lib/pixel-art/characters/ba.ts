/**
 * BA (Business Analyst) character pixel art data.
 *
 * Design: Female chibi character on a 24x32 grid.
 * Palette:
 *   0: #F5D0B5 skin light
 *   1: #E8A87C skin shadow
 *   2: #4A90D9 blue blouse / blazer
 *   3: #2C5F8A dark blue (blazer trim)
 *   4: #1A1A2E navy (hair dark)
 *   5: #FFFFFF white
 *   6: #3D2B1F dark brown (hair)
 *   7: #F0C040 gold accessory / earring
 *   8: #EF4444 red (error)
 *   9: #000000 black
 *
 * Chibi layout:
 *   Rows  0-11 : large chibi head with shoulder-length hair
 *   Rows 12-24 : body (blazer, blouse, skirt)
 *   Rows 25-31 : legs / feet
 */

import type { CharacterData } from '../types';

// ---------------------------------------------------------------------------
// Helper: create an empty (all-null) 32×24 grid
// ---------------------------------------------------------------------------
function emptyGrid(): (number | null)[][] {
  return Array.from({ length: 32 }, () => Array<number | null>(24).fill(null));
}

// ---------------------------------------------------------------------------
// Helper: deep clone a grid
// ---------------------------------------------------------------------------
function cloneGrid(g: (number | null)[][]): (number | null)[][] {
  return g.map((row) => [...row]);
}

// ---------------------------------------------------------------------------
// Base frame: female BA standing, tablet in hand, shoulder-length hair
// ---------------------------------------------------------------------------
function buildBaseFrame(): (number | null)[][] {
  const g = emptyGrid();

  // --- HEAD (rows 0-11, centred at cols 8-15) ---
  // row 0: top of head / hair
  for (let c = 9; c <= 14; c++) g[0][c] = 6;
  // rows 1-2: hair top (brown)
  for (let c = 8; c <= 15; c++) g[1][c] = 6;
  for (let c = 7; c <= 15; c++) g[2][c] = 6;

  // rows 3-8: face (skin) with hair sides
  for (let r = 3; r <= 8; r++) {
    g[r][7] = 6; // left hair
    for (let c = 8; c <= 15; c++) g[r][c] = 0; // skin
    g[r][15] = 6; // right hair outline
    g[r][16] = 6; // right hair (slightly wider for feminine look)
  }

  // row 4: eyes (no glasses — feminine, larger eyes)
  // left eye
  g[4][9]  = 9; g[4][10] = 9;
  // right eye
  g[4][13] = 9; g[4][14] = 9;
  // eye shine
  g[4][9]  = 4; g[4][10] = 9;
  g[4][13] = 4; g[4][14] = 9;

  // row 5: eyelashes / brows
  g[3][9]  = 6; g[3][10] = 6; // left brow
  g[3][13] = 6; g[3][14] = 6; // right brow

  // row 6: cheek blush (light skin shadow)
  g[6][8]  = 1; // left cheek
  g[6][15] = 1; // right cheek

  // row 7: small smile
  g[7][10] = 6; g[7][11] = 6; g[7][12] = 6; g[7][13] = 6;
  // lip highlight
  g[7][11] = 1; g[7][12] = 1;

  // rows 9-10: neck
  for (let r = 9; r <= 10; r++) {
    for (let c = 10; c <= 13; c++) g[r][c] = 0;
  }
  // row 11: chin / collar
  for (let c = 9; c <= 14; c++) g[11][c] = 0;

  // --- SHOULDER-LENGTH HAIR (rows 9-17, sides) ---
  // Left hair flowing down beside body
  for (let r = 9; r <= 14; r++) {
    g[r][6] = 6;
    g[r][7] = 6;
  }
  // Hair ends (tapered)
  g[15][7] = 6;
  g[16][7] = 6;
  // Right hair flowing
  for (let r = 9; r <= 14; r++) {
    g[r][16] = 6;
    g[r][17] = 6;
  }
  g[15][16] = 6;
  g[16][16] = 6;

  // Earring (gold dot)
  g[8][7]  = 7; // left earring
  g[8][16] = 7; // right earring

  // --- BODY (rows 12-24) ---
  // rows 12-20: torso — blue blazer
  for (let r = 12; r <= 20; r++) {
    g[r][7]  = 3; // left blazer outline
    g[r][16] = 3; // right blazer outline
    for (let c = 8; c <= 15; c++) g[r][c] = 2; // blue blouse/blazer
  }

  // rows 12-14: white blouse / collar area in centre
  for (let c = 10; c <= 13; c++) g[12][c] = 5; // collar
  for (let r = 13; r <= 19; r++) {
    g[r][11] = 5; // blouse centre
    g[r][12] = 5;
  }

  // Blazer lapels (rows 12-15)
  g[13][9]  = 3; g[14][9]  = 3;
  g[13][14] = 3; g[14][14] = 3;

  // rows 21-24: skirt (dark blue, slightly wider than torso)
  for (let r = 21; r <= 24; r++) {
    g[r][6]  = 3;
    g[r][17] = 3;
    for (let c = 7; c <= 16; c++) g[r][c] = 3; // skirt
  }
  // Skirt flare at bottom
  g[24][5]  = 3;
  g[24][18] = 3;

  // --- TABLET (right hand, rows 14-21, cols 17-22) ---
  // Tablet body (slightly smaller, modern look)
  for (let r = 15; r <= 22; r++) {
    for (let c = 18; c <= 21; c++) g[r][c] = 4; // dark tablet body
    g[r][17] = 3; // left edge
    g[r][22] = 9; // right edge
  }
  // Tablet screen (lighter)
  for (let r = 16; r <= 21; r++) {
    for (let c = 18; c <= 21; c++) g[r][c] = 5; // white screen
  }
  // Screen content lines
  g[17][18] = 2; g[17][19] = 2; g[17][20] = 2;
  g[19][18] = 2; g[19][19] = 2; g[19][20] = 2;
  g[21][18] = 2; g[21][19] = 2; g[21][20] = 2;
  // Tablet top/bottom edges
  for (let c = 17; c <= 22; c++) {
    g[15][c] = 9;
    g[22][c] = 9;
  }
  // Home button
  g[22][19] = 7;

  // --- RIGHT ARM holding tablet (rows 14-22, cols 16-17) ---
  // Right arm
  for (let r = 14; r <= 22; r++) {
    g[r][16] = 2;
  }
  // Right hand / skin
  g[14][17] = 0;
  g[15][17] = 0;

  // --- LEFT ARM (rows 14-20, cols 5-7) ---
  for (let r = 14; r <= 20; r++) {
    g[r][6] = 2;
    g[r][7] = 2;
  }
  // Left hand / skin
  for (let r = 19; r <= 21; r++) {
    g[r][5] = 0;
    g[r][6] = 0;
  }

  // --- LEGS (rows 25-31) ---
  // left leg
  for (let r = 25; r <= 30; r++) {
    g[r][8]  = 3;
    g[r][9]  = 3;
    g[r][10] = 3;
  }
  // right leg
  for (let r = 25; r <= 30; r++) {
    g[r][13] = 3;
    g[r][14] = 3;
    g[r][15] = 3;
  }
  // feet / shoes (dark)
  g[31][7]  = 9; g[31][8]  = 9; g[31][9]  = 9; g[31][10] = 9;
  g[31][13] = 9; g[31][14] = 9; g[31][15] = 9; g[31][16] = 9;

  return g;
}

// ---------------------------------------------------------------------------
// Idle animation (2 frames)
// ---------------------------------------------------------------------------
function buildIdleFrames(): (number | null)[][][] {
  const f0 = buildBaseFrame();

  // Frame 1: blink — close eyes (replace eye pixels with skin)
  const f1 = cloneGrid(f0);
  f1[4][9]  = 6; f1[4][10] = 6; // left eye closed (lash line)
  f1[4][13] = 6; f1[4][14] = 6; // right eye closed

  return [f0, f1];
}

// ---------------------------------------------------------------------------
// Working animation (3 frames) — stylus writing on tablet
// ---------------------------------------------------------------------------
function buildWorkingFrames(): (number | null)[][][] {
  const base = buildBaseFrame();

  // Frame 0: stylus at top of tablet screen
  const f0 = cloneGrid(base);
  f0[16][21] = 9; // stylus dot

  // Frame 1: arm moved forward, stylus lower
  const f1 = cloneGrid(base);
  // Move left arm forward slightly
  for (let r = 14; r <= 20; r++) {
    f1[r][5] = 2;
    f1[r][6] = 2;
    f1[r][7] = null;
  }
  f1[18][21] = 9; // stylus lower

  // Frame 2: return, stylus at middle
  const f2 = cloneGrid(base);
  f2[17][21] = 9;

  return [f0, f1, f2];
}

// ---------------------------------------------------------------------------
// Shared walk-cycle helper
// ---------------------------------------------------------------------------
function buildWalkFrames(tabletHigh: boolean): (number | null)[][][] {
  const frames: (number | null)[][][] = [];

  for (let step = 0; step < 4; step++) {
    const g = cloneGrid(buildBaseFrame());

    // Body bob: even steps normal, odd steps shift torso up 1
    const bob = step % 2 === 0 ? 0 : -1;

    // Left leg forward / back
    const leftShift  = (step === 0 || step === 1) ? 1 : -1;
    const rightShift = (step === 2 || step === 3) ? 1 : -1;

    // Clear legs
    for (let r = 25; r <= 31; r++) {
      for (let c = 5; c <= 17; c++) g[r][c] = null;
    }

    // Redraw left leg
    const lBase = 25 + leftShift;
    for (let r = lBase; r <= 30; r++) {
      g[r][8] = 3; g[r][9] = 3; g[r][10] = 3;
    }
    g[31][7]  = 9; g[31][8]  = 9; g[31][9]  = 9; g[31][10] = 9;

    // Redraw right leg
    const rBase = 25 + rightShift;
    for (let r = rBase; r <= 30; r++) {
      g[r][13] = 3; g[r][14] = 3; g[r][15] = 3;
    }
    g[31][13] = 9; g[31][14] = 9; g[31][15] = 9; g[31][16] = 9;

    // Tablet held higher when delivering
    if (tabletHigh && step % 2 === 0) {
      // Move tablet up 2 rows — clear old, draw new
      for (let r = 15; r <= 22; r++) {
        for (let c = 17; c <= 22; c++) g[r][c] = null;
      }
      const tr = 13; // new top row
      for (let r = tr; r <= tr + 7; r++) {
        for (let c = 18; c <= 21; c++) g[r][c] = 5; // screen
        g[r][17] = 3; g[r][22] = 9;
      }
      for (let c = 17; c <= 22; c++) {
        g[tr][c] = 9;
        g[tr + 7][c] = 9;
      }
      g[tr + 7][19] = 7; // home button
      // Screen content lines
      g[tr + 1][18] = 2; g[tr + 1][19] = 2; g[tr + 1][20] = 2;
      g[tr + 3][18] = 2; g[tr + 3][19] = 2; g[tr + 3][20] = 2;
    }

    // Apply body bob (clamp to not go negative)
    if (bob !== 0) {
      for (let r = 0; r <= 27; r++) {
        const target = r + bob;
        if (target >= 0 && target < 32) {
          g[target] = [...g[r]];
          g[r] = Array<number | null>(24).fill(null);
        }
      }
    }

    frames.push(g);
  }

  return frames;
}

// ---------------------------------------------------------------------------
// Waiting animation (2 frames) — foot tap
// ---------------------------------------------------------------------------
function buildWaitingFrames(): (number | null)[][][] {
  const f0 = buildBaseFrame();

  const f1 = cloneGrid(f0);
  // Tap right foot — shift right foot pixels
  for (let c = 13; c <= 16; c++) {
    f1[31][c] = null;
  }
  f1[31][14] = 9; f1[31][15] = 9; f1[31][16] = 9; f1[31][17] = 9;

  return [f0, f1];
}

// ---------------------------------------------------------------------------
// Error animation (2 frames) — red tint + exclamation
// ---------------------------------------------------------------------------
function buildErrorFrames(): (number | null)[][][] {
  function redTint(g: (number | null)[][]): (number | null)[][] {
    return g.map((row) =>
      row.map((v) => {
        if (v === 2 || v === 3 || v === 4) return 8;
        return v;
      })
    );
  }

  const f0 = redTint(buildBaseFrame());
  // Exclamation mark above head
  f0[0][11] = 8;
  f0[0][12] = 8;

  // Frame 1: slight shake — shift whole grid right 1
  const f1base = redTint(buildBaseFrame());
  f1base[0][11] = 8;
  f1base[0][12] = 8;
  const f1 = emptyGrid();
  for (let r = 0; r < 32; r++) {
    for (let c = 0; c < 24; c++) {
      const src = c - 1;
      if (src >= 0 && src < 24) f1[r][c] = f1base[r][src];
    }
  }

  return [f0, f1];
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const baCharacter: CharacterData = {
  agentId: 'ba',
  displayName: 'BA',
  palette: [
    '#F5D0B5', // 0 skin light
    '#E8A87C', // 1 skin shadow
    '#4A90D9', // 2 blue blouse / blazer
    '#2C5F8A', // 3 dark blue (blazer trim / skirt)
    '#1A1A2E', // 4 navy (hair dark / tablet body)
    '#FFFFFF', // 5 white
    '#3D2B1F', // 6 dark brown (hair)
    '#F0C040', // 7 gold accessory / earring
    '#EF4444', // 8 red (error)
    '#000000', // 9 black
  ],
  animations: {
    idle: {
      frames: buildIdleFrames(),
      frameRate: 2,
      loop: true,
    },
    working: {
      frames: buildWorkingFrames(),
      frameRate: 4,
      loop: true,
    },
    wandering: {
      frames: buildWalkFrames(false),
      frameRate: 6,
      loop: true,
    },
    delivering: {
      frames: buildWalkFrames(true),
      frameRate: 8,
      loop: true,
    },
    waiting: {
      frames: buildWaitingFrames(),
      frameRate: 2,
      loop: true,
    },
    error: {
      frames: buildErrorFrames(),
      frameRate: 4,
      loop: true,
    },
  },
};
