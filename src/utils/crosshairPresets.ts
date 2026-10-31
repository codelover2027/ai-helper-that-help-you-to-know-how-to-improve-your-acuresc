import { CrosshairConfig } from '../types';

export const PRO_CROSSHAIR_PRESETS: CrosshairConfig[] = [
  {
    name: 'Tactical Clean Cross',
    style: 'cross',
    color: '#00f0ff',
    outlineColor: '#000000',
    hasOutline: true,
    outlineThickness: 1,
    dotSize: 2,
    hasDot: false,
    innerLength: 4,
    innerThickness: 2,
    innerGap: 3,
    innerOpacity: 1,
    outerLength: 0,
    outerThickness: 0,
    outerGap: 0,
    outerOpacity: 0,
    showOuter: false,
  },
  {
    name: 'Precision Center Dot',
    style: 'dot',
    color: '#00ff66',
    outlineColor: '#000000',
    hasOutline: true,
    outlineThickness: 1,
    dotSize: 3,
    hasDot: true,
    innerLength: 0,
    innerThickness: 0,
    innerGap: 0,
    innerOpacity: 0,
    outerLength: 0,
    outerThickness: 0,
    outerGap: 0,
    outerOpacity: 0,
    showOuter: false,
  },
  {
    name: 'Esports Pro Box',
    style: 'box',
    color: '#ff4655',
    outlineColor: '#000000',
    hasOutline: true,
    outlineThickness: 1,
    dotSize: 2,
    hasDot: false,
    innerLength: 1,
    innerThickness: 3,
    innerGap: 1,
    innerOpacity: 1,
    outerLength: 0,
    outerThickness: 0,
    outerGap: 0,
    outerOpacity: 0,
    showOuter: false,
  },
  {
    name: 'CS2 Classic Cyan',
    style: 'cross',
    color: '#00ffff',
    outlineColor: '#000000',
    hasOutline: true,
    outlineThickness: 1,
    dotSize: 2,
    hasDot: false,
    innerLength: 3,
    innerThickness: 1,
    innerGap: 2,
    innerOpacity: 1,
    outerLength: 0,
    outerThickness: 0,
    outerGap: 0,
    outerOpacity: 0,
    showOuter: false,
  },
  {
    name: 'Apex Tracking Reticle',
    style: 'reticle',
    color: '#ffff00',
    outlineColor: '#000000',
    hasOutline: true,
    outlineThickness: 1,
    dotSize: 2,
    hasDot: true,
    innerLength: 5,
    innerThickness: 2,
    innerGap: 6,
    innerOpacity: 0.9,
    outerLength: 2,
    outerThickness: 1,
    outerGap: 10,
    outerOpacity: 0.6,
    showOuter: true,
  },
  {
    name: 'Ghost Minimalist White',
    style: 'cross',
    color: '#ffffff',
    outlineColor: '#000000',
    hasOutline: true,
    outlineThickness: 1,
    dotSize: 2,
    hasDot: false,
    innerLength: 4,
    innerThickness: 1,
    innerGap: 2,
    innerOpacity: 0.95,
    outerLength: 0,
    outerThickness: 0,
    outerGap: 0,
    outerOpacity: 0,
    showOuter: false,
  },
];

/**
 * Generate Counter-Strike 2 console configuration commands
 */
export function generateCS2ConsoleCommands(config: CrosshairConfig): string {
  const r = parseInt(config.color.slice(1, 3), 16) || 0;
  const g = parseInt(config.color.slice(3, 5), 16) || 255;
  const b = parseInt(config.color.slice(5, 7), 16) || 255;

  return [
    `cl_crosshairstyle 4;`,
    `cl_crosshaircolor 5;`,
    `cl_crosshaircolor_r ${r};`,
    `cl_crosshaircolor_g ${g};`,
    `cl_crosshaircolor_b ${b};`,
    `cl_crosshairsize ${config.innerLength};`,
    `cl_crosshairthickness ${config.innerThickness};`,
    `cl_crosshairgap ${config.innerGap - 3};`,
    `cl_crosshairdot ${config.hasDot ? 1 : 0};`,
    `cl_crosshair_drawoutline ${config.hasOutline ? 1 : 0};`,
    `cl_crosshair_outlinethickness ${config.outlineThickness};`,
    `cl_crosshairalpha ${Math.round(config.innerOpacity * 255)};`,
  ].join(' ');
}

/**
 * Generate Valorant crosshair export code string format
 */
export function generateValorantCode(config: CrosshairConfig): string {
  // Approximate Valorant crosshair string
  const hex = config.color.replace('#', '').toUpperCase();
  const outline = config.hasOutline ? '1' : '0';
  const dot = config.hasDot ? '1' : '0';
  return `0;P;c;8;u;${hex};o;${outline};t;${config.outlineThickness};d;${dot};z;${config.dotSize};0t;${config.innerThickness};0l;${config.innerLength};0o;${config.innerGap};0a;${config.innerOpacity};0f;0;1b;0`;
}

/**
 * Generates an SVG string of the crosshair for downloads or embeds
 */
export function generateCrosshairSVG(config: CrosshairConfig, size: number = 64): string {
  const center = size / 2;
  const c = config.color;
  const outline = config.hasOutline ? `stroke="${config.outlineColor}" stroke-width="${config.innerThickness + config.outlineThickness * 2}" stroke-linecap="square"` : '';
  const fill = `stroke="${c}" stroke-width="${config.innerThickness}" stroke-linecap="square" opacity="${config.innerOpacity}"`;

  const lines: string[] = [];

  // Center dot
  if (config.hasDot) {
    if (config.hasOutline) {
      lines.push(`<rect x="${center - config.dotSize / 2 - config.outlineThickness}" y="${center - config.dotSize / 2 - config.outlineThickness}" width="${config.dotSize + config.outlineThickness * 2}" height="${config.dotSize + config.outlineThickness * 2}" fill="${config.outlineColor}" />`);
    }
    lines.push(`<rect x="${center - config.dotSize / 2}" y="${center - config.dotSize / 2}" width="${config.dotSize}" height="${config.dotSize}" fill="${c}" />`);
  }

  // Inner lines
  if (config.innerLength > 0 && config.innerThickness > 0) {
    const gap = config.innerGap;
    const len = config.innerLength;

    // Outlines first if enabled
    if (config.hasOutline) {
      // Top
      lines.push(`<line x1="${center}" y1="${center - gap - len}" x2="${center}" y2="${center - gap}" ${outline} />`);
      // Bottom
      lines.push(`<line x1="${center}" y1="${center + gap}" x2="${center}" y2="${center + gap + len}" ${outline} />`);
      // Left
      lines.push(`<line x1="${center - gap - len}" y1="${center}" x2="${center - gap}" y2="${center}" ${outline} />`);
      // Right
      if (config.style !== 't-style') {
        lines.push(`<line x1="${center + gap}" y1="${center}" x2="${center + gap + len}" y2="${center}" ${outline} />`);
      }
    }

    // Inner Lines
    // Top
    if (config.style !== 't-style') {
      lines.push(`<line x1="${center}" y1="${center - gap - len}" x2="${center}" y2="${center - gap}" ${fill} />`);
    }
    // Bottom
    lines.push(`<line x1="${center}" y1="${center + gap}" x2="${center}" y2="${center + gap + len}" ${fill} />`);
    // Left
    lines.push(`<line x1="${center - gap - len}" y1="${center}" x2="${center - gap}" y2="${center}" ${fill} />`);
    // Right
    lines.push(`<line x1="${center + gap}" y1="${center}" x2="${center + gap + len}" y2="${center}" ${fill} />`);
  }

  // Reticle circle style
  if (config.style === 'reticle') {
    lines.push(`<circle cx="${center}" cy="${center}" r="${config.innerGap + 4}" fill="none" stroke="${c}" stroke-width="${Math.max(1, config.innerThickness - 1)}" opacity="0.5" />`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${lines.join('\n')}
  </svg>`;
}
