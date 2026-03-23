import type { CharacterData, PixelGrid } from '../types';

/**
 * Dev Lead character pixel art data.
 * 24x32 grid (head rows 0-10, torso rows 11-22, legs rows 23-31).
 *
 * Design: Male leader figure, neat short hair, sharp purple blazer over dark
 * shirt, confident posture.
 *
 * Palette:
 *   0: #F5D0B5 skin light
 *   1: #D4A574 skin shadow
 *   2: #7C3AED purple main (blazer)
 *   3: #5B21B6 dark purple (blazer shadow)
 *   4: #4C1D95 deep purple (blazer deep shadow)
 *   5: #FFFFFF white (shirt collar / document)
 *   6: #1F2937 dark shirt
 *   7: #C0C0C0 silver (watch / buttons)
 *   8: #EF4444 red (error state)
 *   9: #000000 black (hair, pants, shoes)
 */

const PALETTE = [
  '#F5D0B5', // 0 skin light
  '#D4A574', // 1 skin shadow
  '#7C3AED', // 2 purple main (blazer)
  '#5B21B6', // 3 dark purple
  '#4C1D95', // 4 deep purple
  '#FFFFFF', // 5 white
  '#1F2937', // 6 dark shirt
  '#C0C0C0', // 7 silver/watch
  '#EF4444', // 8 red (error)
  '#000000', // 9 black (hair, pants, shoes)
];

// ---------------------------------------------------------------------------
// IDLE frame 0 — standing confidently, eyes open
// ---------------------------------------------------------------------------
const idleFrame0: PixelGrid = [
  // row 0 — top of hair
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair crown
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair sides + top of face
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face upper with hair sides
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows + upper face
  [null,null,null,null,null,null,null,9,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose + cheeks
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth (confident slight smile)
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw + neck start
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar + blazer shoulders start
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer upper + lapels
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer chest + shoulders wide
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — blazer torso + arms start
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms relaxed down + torso
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — forearms with blazer
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,3,2,null,null,null,null,null],
  // row 17 — lower arms + wrists
  [null,null,null,2,3,2,2,2,2,2,2,2,2,2,2,2,2,3,2,null,null,null,null,null],
  // row 18 — hands + waist
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,2,0,0,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt / trouser top
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs start, gap in center
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet start
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// IDLE frame 1 — blink
// ---------------------------------------------------------------------------
const idleFrame1: PixelGrid = [
  // row 0 — top of hair
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair crown
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair sides
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face upper
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows (blink - eyes closed)
  [null,null,null,null,null,null,null,9,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes closed (blink)
  [null,null,null,null,null,null,null,0,0,1,1,0,0,1,1,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — blazer torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — forearms
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,3,2,null,null,null,null,null],
  // row 17 — lower arms
  [null,null,null,2,3,2,2,2,2,2,2,2,2,2,2,2,2,3,2,null,null,null,null,null],
  // row 18 — hands
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,2,0,0,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WORKING frame 0 — pointing at whiteboard/screen, right arm raised
// ---------------------------------------------------------------------------
const workingFrame0: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows focused
  [null,null,null,null,null,null,null,9,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes (focused/squinting slightly)
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth (firm confident)
  [null,null,null,null,null,null,null,0,0,1,0,0,0,1,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer + right arm rising
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso + left arm normal, right arm raised
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,null,null,null,null],
  // row 15 — left arm down, right arm extends right/up
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,null,null,null],
  // row 16 — forearms
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,2,null,null],
  // row 17 — right arm extended pointing
  [null,null,null,2,3,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,null],
  // row 18 — right hand/pointing finger
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WORKING frame 1 — pointing, arm extended further (gesture animation)
// ---------------------------------------------------------------------------
const workingFrame1: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows
  [null,null,null,null,null,null,null,9,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes focused
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth open slightly (speaking)
  [null,null,null,null,null,null,null,0,0,1,9,0,9,1,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,null,null,null],
  // row 15 — left arm, right arm higher
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,2,null,null],
  // row 16 — forearms — right arm extending more
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,2,2,null],
  // row 17 — right arm fully extended pointing
  [null,null,null,2,3,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  // row 18 — pointing finger
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WORKING frame 2 — arm slightly down (planning gesture variation)
// ---------------------------------------------------------------------------
const workingFrame2: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows
  [null,null,null,null,null,null,null,9,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,1,0,0,0,1,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso + arms
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,null,null,null,null],
  // row 15 — left arm + right arm mid-height
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,null,null,null],
  // row 16 — forearms
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,null,null,null],
  // row 17 — right arm pointing at angle
  [null,null,null,2,3,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,null,null,null],
  // row 18 — hands
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,0,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WANDERING frame 0 — upright stance, hands behind back
// ---------------------------------------------------------------------------
const wanderingFrame0: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows neutral
  [null,null,null,null,null,null,null,9,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso, arms swept behind back
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — upper arms going back
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — arms behind
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,3,2,null,null,null,null,null],
  // row 17 — hands behind back meeting at center-back
  [null,null,null,null,3,2,2,2,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null],
  // row 18 — hands clasped behind
  [null,null,null,null,null,0,0,2,2,2,2,2,2,2,0,0,null,null,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WANDERING frame 1 — walking, left foot forward, hands behind back
// ---------------------------------------------------------------------------
const wanderingFrame1: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows
  [null,null,null,null,null,null,null,9,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — upper arms behind back
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — arms behind
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,3,2,null,null,null,null,null],
  // row 17 — clasped hands
  [null,null,null,null,3,2,2,2,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null],
  // row 18 — hands
  [null,null,null,null,null,0,0,2,2,2,2,2,2,2,0,0,null,null,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — hip
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — left leg forward, right back
  [null,null,null,null,null,9,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null],
  // row 24 — left stride forward
  [null,null,null,null,9,9,9,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 25 — left knee bent forward
  [null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 26 — lower left leg
  [null,null,null,null,9,9,null,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,9,9,null,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,9,9,null,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 29 — left foot forward
  [null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe
  [null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 31 — sole
  [null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WANDERING frame 2 — same as frame 0 (midstep)
// ---------------------------------------------------------------------------
const wanderingFrame2: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows
  [null,null,null,null,null,null,null,9,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — forearms
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,3,2,null,null,null,null,null],
  // row 17 — wrists
  [null,null,null,null,3,2,2,2,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null],
  // row 18 — hands behind
  [null,null,null,null,null,0,0,2,2,2,2,2,2,2,0,0,null,null,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WANDERING frame 3 — right foot forward
// ---------------------------------------------------------------------------
const wanderingFrame3: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows
  [null,null,null,null,null,null,null,9,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms behind back
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — arms behind
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,2,2,3,2,null,null,null,null,null],
  // row 17 — wrists
  [null,null,null,null,3,2,2,2,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null],
  // row 18 — hands
  [null,null,null,null,null,0,0,2,2,2,2,2,2,2,0,0,null,null,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — hip
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — right foot forward
  [null,null,null,null,null,9,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null],
  // row 24 — right stride
  [null,null,null,null,null,9,9,null,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null],
  // row 25 — right forward
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 29 — left back, right forward
  [null,null,null,null,null,9,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null],
  // row 30 — shoe
  [null,null,null,null,null,9,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null],
  // row 31 — sole
  [null,null,null,null,null,9,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// DELIVERING frame 0 — walking briskly, holding document in right arm
// ---------------------------------------------------------------------------
const deliveringFrame0: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows alert
  [null,null,null,null,null,null,null,9,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes (determined)
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth (smile)
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso + right arm holds document
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,null,null,null,null],
  // row 15 — left arm normal, right arm holds doc
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,null,null,null],
  // row 16 — document being held
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,5,5,5,5,5,2,null,null,null],
  // row 17 — document visible
  [null,null,null,2,3,0,0,0,0,2,2,2,2,2,2,5,5,5,5,5,2,null,null,null],
  // row 18 — hands + document
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,5,5,5,5,0,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs stride
  [null,null,null,null,null,9,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null],
  // row 24 — left forward
  [null,null,null,null,9,9,9,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 25 — stride
  [null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 26 — lower left leg forward
  [null,null,null,null,9,9,null,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,9,9,null,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,9,9,null,null,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 29 — left foot forward
  [null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe
  [null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
  // row 31 — sole
  [null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// DELIVERING frame 1 — right foot forward, still holding document
// ---------------------------------------------------------------------------
const deliveringFrame1: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows
  [null,null,null,null,null,null,null,9,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,0,0,0,9,0,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth
  [null,null,null,null,null,null,null,0,0,0,0,1,0,0,0,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso + document arm
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,null,null,null,null],
  // row 15 — left arm, right holds doc
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,2,null,null,null],
  // row 16 — document
  [null,null,null,2,3,2,2,2,2,6,6,6,6,6,2,5,5,5,5,5,2,null,null,null],
  // row 17 — document + arm
  [null,null,null,2,3,0,0,0,0,2,2,2,2,2,2,5,5,5,5,5,2,null,null,null],
  // row 18 — hands
  [null,null,null,null,0,0,2,2,2,2,2,2,2,2,2,5,5,5,5,0,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — right leg forward
  [null,null,null,null,null,9,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null],
  // row 24 — right stride
  [null,null,null,null,null,9,9,null,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null],
  // row 25 — stride
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,null,null,null,null,null,null,null,null,9,9,null,null,null,null,null,null,null,null],
  // row 29 — right forward
  [null,null,null,null,null,9,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null],
  // row 30 — shoe
  [null,null,null,null,null,9,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null],
  // row 31 — sole
  [null,null,null,null,null,9,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WAITING frame 0 — arms crossed, standing still
// ---------------------------------------------------------------------------
const waitingFrame0: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows stern
  [null,null,null,null,null,null,null,9,0,9,0,0,0,0,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes (neutral stern)
  [null,null,null,null,null,null,null,0,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth (neutral flat)
  [null,null,null,null,null,null,null,0,0,1,1,0,0,1,1,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer wide
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso + arms crossing
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms crossing chest
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — forearms crossed — left arm over right
  [null,null,null,2,3,2,2,0,0,0,0,0,0,0,0,2,2,3,2,null,null,null,null,null],
  // row 17 — arms crossed tightly
  [null,null,null,null,3,2,2,0,2,2,2,2,2,2,0,2,2,3,null,null,null,null,null,null],
  // row 18 — hands tucked
  [null,null,null,null,null,2,0,0,2,2,2,2,2,0,0,2,null,null,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs standing
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// WAITING frame 1 — arms crossed, tapping foot (foot slightly raised)
// ---------------------------------------------------------------------------
const waitingFrame1: PixelGrid = [
  // row 0 — hair top
  [null,null,null,null,null,null,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face
  [null,null,null,null,null,null,9,9,0,0,0,0,0,0,0,9,9,null,null,null,null,null,null,null],
  // row 4 — brows stern
  [null,null,null,null,null,null,null,9,0,9,0,0,0,0,9,0,null,null,null,null,null,null,null,null],
  // row 5 — eyes
  [null,null,null,null,null,null,null,0,0,9,9,0,0,9,9,0,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,0,0,0,1,0,1,0,0,0,null,null,null,null,null,null,null,null],
  // row 7 — mouth (flat impatient)
  [null,null,null,null,null,null,null,0,0,1,1,0,0,1,1,0,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,0,1,0,0,0,0,0,1,0,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,0,0,0,0,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms crossing
  [null,null,null,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,null,null,null,null,null],
  // row 16 — arms crossed
  [null,null,null,2,3,2,2,0,0,0,0,0,0,0,0,2,2,3,2,null,null,null,null,null],
  // row 17 — arms tight
  [null,null,null,null,3,2,2,0,2,2,2,2,2,2,0,2,2,3,null,null,null,null,null,null],
  // row 18 — hands tucked
  [null,null,null,null,null,2,0,0,2,2,2,2,2,0,0,2,null,null,null,null,null,null,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs (left foot tapping)
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — left leg slightly raised for tap
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — left raised
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — left lower leg
  [null,null,null,null,null,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — ankles — left foot tapping (slightly angled)
  [null,null,null,null,null,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — foot tap raised slightly
  [null,null,null,null,null,9,9,null,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — left shoe raised
  [null,null,null,null,9,9,9,9,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe
  [null,null,null,null,9,9,9,9,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — sole (left slightly tilted up = tapping)
  [null,null,null,null,null,9,9,9,null,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// ERROR frame 0 — hands up in frustration, face red
// ---------------------------------------------------------------------------
const errorFrame0: PixelGrid = [
  // row 0 — "!!" exclamation above head
  [null,null,null,null,null,null,null,null,null,8,null,8,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair (red-tinted)
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face red
  [null,null,null,null,null,null,9,9,8,8,8,8,8,8,8,9,9,null,null,null,null,null,null,null],
  // row 4 — brows raised in frustration
  [null,null,null,null,null,null,null,9,8,9,9,8,8,9,9,8,null,null,null,null,null,null,null,null],
  // row 5 — eyes wide/shocked
  [null,null,null,null,null,null,null,8,8,9,8,8,8,9,8,8,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,8,8,8,1,8,1,8,8,8,null,null,null,null,null,null,null,null],
  // row 7 — mouth open (frustrated shout)
  [null,null,null,null,null,null,null,8,8,9,9,9,9,9,8,8,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,8,1,8,8,8,8,8,1,8,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,8,8,8,8,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer + arms raising
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso, arms going up
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — upper arms raising
  [null,null,2,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,null,null,null,null],
  // row 16 — arms raised high
  [null,null,2,3,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,3,2,null,null,null],
  // row 17 — arms up, hands high
  [null,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,null,null],
  // row 18 — hands up wide
  [null,0,0,null,2,2,2,2,2,2,2,2,2,2,2,2,2,2,null,null,0,0,null,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// ERROR frame 1 — arms slightly different position (animation flash)
// ---------------------------------------------------------------------------
const errorFrame1: PixelGrid = [
  // row 0 — "!" flicker (different column)
  [null,null,null,null,null,null,null,null,null,null,8,null,8,null,null,null,null,null,null,null,null,null,null,null],
  // row 1 — hair
  [null,null,null,null,null,null,null,null,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 2 — hair
  [null,null,null,null,null,null,null,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 3 — face red
  [null,null,null,null,null,null,9,9,8,8,8,8,8,8,8,9,9,null,null,null,null,null,null,null],
  // row 4 — brows raised
  [null,null,null,null,null,null,null,9,8,9,9,8,8,9,9,8,null,null,null,null,null,null,null,null],
  // row 5 — eyes wide
  [null,null,null,null,null,null,null,8,8,9,8,8,8,9,8,8,null,null,null,null,null,null,null,null],
  // row 6 — nose
  [null,null,null,null,null,null,null,8,8,8,1,8,1,8,8,8,null,null,null,null,null,null,null,null],
  // row 7 — mouth shout
  [null,null,null,null,null,null,null,8,8,9,9,9,9,9,8,8,null,null,null,null,null,null,null,null],
  // row 8 — chin
  [null,null,null,null,null,null,null,8,1,8,8,8,8,8,1,8,null,null,null,null,null,null,null,null],
  // row 9 — jaw
  [null,null,null,null,null,null,null,null,1,8,8,8,8,1,null,null,null,null,null,null,null,null,null,null],
  // row 10 — neck
  [null,null,null,null,null,null,null,null,null,0,0,0,null,null,null,null,null,null,null,null,null,null,null,null],
  // row 11 — collar
  [null,null,null,null,null,null,null,2,2,5,5,5,5,2,2,null,null,null,null,null,null,null,null,null],
  // row 12 — blazer
  [null,null,null,null,null,null,2,2,2,5,6,6,5,2,2,2,null,null,null,null,null,null,null,null],
  // row 13 — blazer
  [null,null,null,null,null,2,2,2,2,6,6,6,6,2,2,2,2,null,null,null,null,null,null,null],
  // row 14 — torso
  [null,null,null,null,2,2,2,2,2,6,6,6,6,6,2,2,2,2,null,null,null,null,null,null],
  // row 15 — arms raised higher
  [null,null,2,2,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,2,null,null,null,null],
  // row 16 — arms high
  [null,2,2,3,2,2,2,2,2,6,6,6,6,6,2,2,2,2,2,3,2,2,null,null],
  // row 17 — arms max raise
  [2,2,2,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,2,2,null],
  // row 18 — hands fully raised
  [0,0,null,null,2,2,2,2,2,2,2,2,2,2,2,2,2,2,null,null,null,0,0,null],
  // row 19 — waist
  [null,null,null,null,null,3,2,2,2,2,2,2,2,2,2,3,null,null,null,null,null,null,null,null],
  // row 20 — belt
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 21 — upper trousers
  [null,null,null,null,null,9,9,9,9,9,9,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 22 — upper legs
  [null,null,null,null,null,9,9,9,9,null,null,9,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 23 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 24 — legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 25 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 26 — lower legs
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 27 — ankles
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 28 — feet
  [null,null,null,null,null,9,9,9,null,null,null,null,9,9,9,null,null,null,null,null,null,null,null,null],
  // row 29 — shoe top
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 30 — shoe mid
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
  // row 31 — shoe sole
  [null,null,null,null,9,9,9,9,9,null,null,9,9,9,9,9,null,null,null,null,null,null,null,null],
];

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const devLeadCharacter: CharacterData = {
  agentId: 'dev-lead',
  displayName: 'Dev Lead',
  palette: PALETTE,
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
      frames: [wanderingFrame0, wanderingFrame1, wanderingFrame2, wanderingFrame3],
      frameRate: 6,
      loop: true,
    },
    delivering: {
      frames: [deliveringFrame0, deliveringFrame1],
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
