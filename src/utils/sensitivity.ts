import { GamePreset } from '../types';

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'valorant',
    name: 'Valorant',
    yaw: 0.07,
    defaultFOV: 103,
    fovType: 'horizontal',
    category: 'tactical',
    instructions: 'Settings -> General -> Mouse -> Sensitivity: Aim',
  },
  {
    id: 'cs2',
    name: 'Counter-Strike 2 / CS:GO',
    yaw: 0.022,
    defaultFOV: 106.26,
    fovType: 'horizontal',
    category: 'tactical',
    instructions: 'Game Settings -> Keyboard / Mouse -> Mouse Sensitivity (or "sensitivity <value>" in console)',
  },
  {
    id: 'apex',
    name: 'Apex Legends',
    yaw: 0.022,
    defaultFOV: 110,
    fovType: 'horizontal',
    category: 'battle-royale',
    instructions: 'Settings -> Mouse/Keyboard -> Mouse Sensitivity',
  },
  {
    id: 'overwatch2',
    name: 'Overwatch 2',
    yaw: 0.0066,
    defaultFOV: 103,
    fovType: 'horizontal',
    category: 'hero-shooter',
    instructions: 'Options -> Controls -> General -> Mouse -> Sensitivity (%)',
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    yaw: 0.005555,
    defaultFOV: 80,
    fovType: 'horizontal',
    category: 'battle-royale',
    instructions: 'Settings -> Mouse and Keyboard -> X/Y-Axis Sensitivity (%)',
  },
  {
    id: 'cod',
    name: 'Call of Duty: Warzone & MW3',
    yaw: 0.0066,
    defaultFOV: 105,
    fovType: 'horizontal',
    category: 'battle-royale',
    instructions: 'Settings -> Keyboard & Mouse -> Mouse Sensitivity',
  },
  {
    id: 'r6',
    name: 'Rainbow Six Siege',
    yaw: 0.005729578,
    defaultFOV: 90,
    fovType: 'vertical',
    category: 'tactical',
    instructions: 'Options -> Controls -> Raw Input / Mouse Sensitivity (Default multiplier 50)',
  },
  {
    id: 'destiny2',
    name: 'Destiny 2',
    yaw: 0.0066,
    defaultFOV: 105,
    fovType: 'horizontal',
    category: 'hero-shooter',
    instructions: 'Settings -> Keyboard/Mouse -> Look Sensitivity',
  },
  {
    id: 'rust',
    name: 'Rust',
    yaw: 0.022,
    defaultFOV: 90,
    fovType: 'horizontal',
    category: 'tactical',
    instructions: 'Options -> Input -> Mouse Sensitivity (or "input.sensitivity <value>" in F1 console)',
  },
  {
    id: 'battlefield',
    name: 'Battlefield 2042',
    yaw: 0.0066,
    defaultFOV: 100,
    fovType: 'horizontal',
    category: 'arena',
    instructions: 'Options -> Controller/Mouse -> Soldier Mouse Aim Sensitivity',
  },
];

/**
 * Converts mouse sensitivity from one game to another preserving exact cm/360 rotation
 */
export function convertSensitivity(
  sourceGameId: string,
  targetGameId: string,
  sourceSens: number
): number {
  const sourceGame = GAME_PRESETS.find((g) => g.id === sourceGameId);
  const targetGame = GAME_PRESETS.find((g) => g.id === targetGameId);

  if (!sourceGame || !targetGame || sourceSens <= 0) return 1.0;

  // Degrees turned per mouse count in source game = sourceSens * sourceGame.yaw
  // In target game: targetSens * targetGame.yaw = sourceSens * sourceGame.yaw
  // targetSens = (sourceSens * sourceGame.yaw) / targetGame.yaw
  const targetSens = (sourceSens * sourceGame.yaw) / targetGame.yaw;
  return Number(targetSens.toFixed(4));
}

/**
 * Calculates physical mousepad travel distance to execute a 360-degree rotation (cm/360)
 */
export function calculateCm360(sens: number, dpi: number, yaw: number): number {
  if (sens <= 0 || dpi <= 0 || yaw <= 0) return 0;
  // 1 inch = 2.54 cm
  // counts for 360 = 360 / (sens * yaw)
  // inches = counts / dpi
  // cm = inches * 2.54
  const cm = (360 / (sens * yaw * dpi)) * 2.54;
  return Number(cm.toFixed(1));
}

export function calculateInches360(cm360: number): number {
  return Number((cm360 / 2.54).toFixed(1));
}

export function calculateEDPI(sens: number, dpi: number): number {
  return Number((sens * dpi).toFixed(1));
}

export interface AimStyleAnalysis {
  style: 'Very Low (Pure Arm)' | 'Low (Arm & Wrist)' | 'Medium (Balanced)' | 'High (Wrist Focus)' | 'Very High (Fingertip)';
  description: string;
  recommendedFor: string;
  pros: string;
  cons: string;
}

export function analyzeAimStyle(cm360: number): AimStyleAnalysis {
  if (cm360 >= 60) {
    return {
      style: 'Very Low (Pure Arm)',
      description: 'Massive mouse movements requiring whole-arm sweeping across large desk mats.',
      recommendedFor: 'Tactical shooters (CS2, Valorant) where crosshair placement and tiny micro-adjustments rule.',
      pros: 'Extreme consistency, minimal jitter, virtually zero micro-overshoot on headshots.',
      cons: 'Requires huge mousepad (>45cm), fatigue during fast 180° turns or vertical tracking.',
    };
  } else if (cm360 >= 40) {
    return {
      style: 'Low (Arm & Wrist)',
      description: 'The golden competitive standard for tactical FPS shooters and CS2/Valorant pros.',
      recommendedFor: 'Valorant, CS2, Rainbow Six Siege, tactical sniping.',
      pros: 'Superb balance of precision flicks and steady micro-corrections.',
      cons: 'Needs medium-to-large mousepad (at least 35-40cm wide).',
    };
  } else if (cm360 >= 28) {
    return {
      style: 'Medium (Balanced)',
      description: 'Versatile hybrid aiming style with wrist for fine targets and forearm for wide angles.',
      recommendedFor: 'Apex Legends, Overwatch 2, Warzone, Fortnite.',
      pros: 'Fluid tracking on fast-moving targets, easy 180° turns, good for vertical movement.',
      cons: 'Requires disciplined wrist control to avoid slight jitter on long-range pixel shots.',
    };
  } else if (cm360 >= 18) {
    return {
      style: 'High (Wrist Focus)',
      description: 'Fast reflex aiming relying primarily on wrist articulation with minimal forearm motion.',
      recommendedFor: 'Arena FPS, high-mobility shooters, small desk setups.',
      pros: 'Instant rapid target switching, zero arm fatigue, compact desk footprint.',
      cons: 'High risk of overshooting small heads, susceptible to nervous hand tremors.',
    };
  } else {
    return {
      style: 'Very High (Fingertip)',
      description: 'Hyper-sensitive twitch settings where tiny finger twitches pivot the camera dramatically.',
      recommendedFor: 'Speed twitch games, casual high-mobility movement.',
      pros: 'Instant turn speed with nearly zero physical effort.',
      cons: 'Severe pixel skipping and micro-inaccuracy. Strongly recommended to lower sensitivity for competitive play.',
    };
  }
}
