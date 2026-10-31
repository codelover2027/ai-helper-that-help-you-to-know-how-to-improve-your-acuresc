export type DrillType = 'flicking' | 'precision' | 'tracking' | 'recoil' | 'reaction';

export interface DrillResult {
  id: string;
  drill: DrillType;
  score: number;
  accuracy: number;
  avgReactionTimeMs: number;
  totalShots: number;
  hits: number;
  headshots: number;
  overshoots: number;
  undershoots: number;
  date: string;
}

export interface CrosshairConfig {
  name: string;
  style: 'cross' | 'dot' | 'reticle' | 't-style' | 'chevron' | 'box';
  color: string;
  outlineColor: string;
  hasOutline: boolean;
  outlineThickness: number;
  dotSize: number;
  hasDot: boolean;
  innerLength: number;
  innerThickness: number;
  innerGap: number;
  innerOpacity: number;
  outerLength: number;
  outerThickness: number;
  outerGap: number;
  outerOpacity: number;
  showOuter: boolean;
}

export interface GamePreset {
  id: string;
  name: string;
  yaw: number; // degrees per count
  defaultFOV: number;
  fovType: 'horizontal' | 'vertical';
  category: 'tactical' | 'battle-royale' | 'hero-shooter' | 'arena';
  instructions: string;
}

export interface SensitivityProfile {
  sourceGameId: string;
  targetGameId: string;
  sourceSens: number;
  dpi: number;
}
