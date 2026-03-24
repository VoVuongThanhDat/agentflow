/**
 * Core TypeScript types for the pixel-art rendering system.
 */

/** Array of hex color strings, e.g. ['#3B82F6', '#1D4ED8'] */
export type ColorPalette = string[];

/**
 * 2D row-major array of color indices.
 * null = transparent pixel.
 * Out-of-bounds indices should be treated as transparent (no crash).
 */
export type PixelGrid = (number | null)[][];

/** Describes one animation state */
export interface AnimationConfig {
  frames: PixelGrid[];
  frameRate: number;
  loop: boolean;
}

/** The 6 agent states used in the app */
export type AgentState =
  | 'idle'
  | 'working'
  | 'wandering'
  | 'delivering'
  | 'waiting'
  | 'error';

/** The 6 agent IDs */
export type AgentId = 'ba' | 'dev-lead' | 'dev-be' | 'dev-fe' | 'tester' | 'devops';

/** Full character definition for a pixel-art agent */
export interface CharacterData {
  agentId: AgentId;
  displayName: string;
  palette: ColorPalette;
  animations: Record<AgentState, AnimationConfig>;
}
