import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Crosshair, Award, Zap, Activity, Maximize2 } from 'lucide-react';
import { DrillType, DrillResult, CrosshairConfig } from '../types';
import { sounds } from '../utils/soundEffects';

interface AimArenaProps {
  crosshair: CrosshairConfig;
  onRecordResult: (result: DrillResult) => void;
  gameSensitivity: number;
}

interface TargetEntity {
  id: number;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  spawnTime: number;
  maxLifetime: number;
  color: string;
  isHeadshotZone: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ShotImpact {
  x: number;
  y: number;
  hit: boolean;
  isHeadshot: boolean;
  time: number;
}

export const AimArena: React.FC<AimArenaProps> = ({
  crosshair,
  onRecordResult,
  gameSensitivity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeDrill, setActiveDrill] = useState<DrillType>('flicking');
  const [durationSec, setDurationSec] = useState<number>(30);
  const [targetSize, setTargetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [gameState, setGameState] = useState<'IDLE' | 'COUNTDOWN' | 'RUNNING' | 'FINISHED'>('IDLE');
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [usePointerLock, setUsePointerLock] = useState<boolean>(false);

  // Live in-game stats
  const [score, setScore] = useState<number>(0);
  const [shots, setShots] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [headshots, setHeadshots] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);

  // Recoil drill state
  const [recoilBulletIndex, setRecoilBulletIndex] = useState<number>(0);
  const [recoilScoreAccum, setRecoilScoreAccum] = useState<number>(0);

  // Reaction benchmark state
  const [reactionState, setReactionState] = useState<'WAIT' | 'READY' | 'CLICKED'>('WAIT');
  const reactionStartRef = useRef<number>(0);
  const reactionTimerRef = useRef<number | null>(null);

  // Drill analytics summary
  const [latestSummary, setLatestSummary] = useState<DrillResult | null>(null);

  // Physics & canvas loop refs
  const targetsRef = useRef<TargetEntity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const impactsRef = useRef<ShotImpact[]>([]);
  const crosshairPosRef = useRef<{ x: number; y: number }>({ x: 400, y: 300 });
  const isMouseDownRef = useRef<boolean>(false);
  const reactionTimesRef = useRef<number[]>([]);
  const overshootsRef = useRef<number>(0);
  const undershootsRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const drillStartTimeRef = useRef<number>(0);
  const nextTargetIdRef = useRef<number>(1);
  const trackingTimeOnTargetRef = useRef<number>(0);
  const trackingTotalFramesRef = useRef<number>(0);

  // Target radius based on selection
  const baseRadius = targetSize === 'small' ? 14 : targetSize === 'medium' ? 24 : 34;

  const spawnTarget = useCallback((width: number, height: number, specificPos?: { x: number; y: number }): TargetEntity => {
    const pad = 60;
    const x = specificPos ? specificPos.x : pad + Math.random() * (width - pad * 2);
    const y = specificPos ? specificPos.y : pad + Math.random() * (height - pad * 2);

    const speed = activeDrill === 'tracking' ? (targetSize === 'small' ? 3.5 : 2.5) : 0;
    const angle = Math.random() * Math.PI * 2;

    return {
      id: nextTargetIdRef.current++,
      x,
      y,
      radius: activeDrill === 'precision' ? Math.max(10, baseRadius * 0.6) : baseRadius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spawnTime: performance.now(),
      maxLifetime: activeDrill === 'flicking' ? 6000 : 999999,
      color: activeDrill === 'precision' ? '#f43f5e' : '#06b6d4',
      isHeadshotZone: true,
    };
  }, [activeDrill, baseRadius, targetSize]);

  const initTargets = useCallback((width: number, height: number) => {
    targetsRef.current = [];
    if (activeDrill === 'flicking') {
      // 3 targets at any given time
      for (let i = 0; i < 3; i++) {
        targetsRef.current.push(spawnTarget(width, height));
      }
    } else if (activeDrill === 'precision') {
      for (let i = 0; i < 4; i++) {
        targetsRef.current.push(spawnTarget(width, height));
      }
    } else if (activeDrill === 'tracking') {
      targetsRef.current.push(spawnTarget(width, height, { x: width / 2, y: height / 2 }));
    } else if (activeDrill === 'recoil') {
      // Static silhouette target in center
      targetsRef.current.push({
        id: 999,
        x: width / 2,
        y: height / 2,
        radius: 40,
        vx: 0,
        vy: 0,
        spawnTime: performance.now(),
        maxLifetime: 999999,
        color: '#f59e0b',
        isHeadshotZone: true,
      });
    }
  }, [activeDrill, spawnTarget]);

  // Recoil offsets pattern (like CS AK-47 / Valorant Vandal spray upward pull)
  const getRecoilOffset = (bulletIndex: number) => {
    const pattern = [
      { dx: 0, dy: 0 },
      { dx: 0, dy: -8 },
      { dx: -2, dy: -18 },
      { dx: -4, dy: -32 },
      { dx: -2, dy: -46 },
      { dx: 2, dy: -58 },
      { dx: 8, dy: -68 },
      { dx: 14, dy: -72 },
      { dx: 12, dy: -76 },
      { dx: 2, dy: -78 },
      { dx: -10, dy: -80 },
      { dx: -18, dy: -82 },
      { dx: -22, dy: -82 },
      { dx: -12, dy: -84 },
      { dx: 4, dy: -85 },
    ];
    return pattern[Math.min(bulletIndex, pattern.length - 1)];
  };

  const createExplosion = (x: number, y: number, color: string, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'RUNNING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    isMouseDownRef.current = true;

    // In reaction test mode
    if (activeDrill === 'reaction') {
      if (reactionState === 'WAIT') {
        // False start / too early!
        sounds.playMiss();
        if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
        setReactionState('WAIT');
        setLastReactionTime(-1);
      } else if (reactionState === 'READY') {
        const delta = Math.round(performance.now() - reactionStartRef.current);
        sounds.playHeadshot();
        reactionTimesRef.current.push(delta);
        setLastReactionTime(delta);
        setHits((h) => h + 1);
        setShots((s) => s + 1);
        setScore((sc) => sc + Math.max(100, 1000 - delta));
        setReactionState('CLICKED');
      }
      return;
    }

    // Determine shot coordinates
    let clickX: number;
    let clickY: number;

    if (usePointerLock) {
      clickX = crosshairPosRef.current.x;
      clickY = crosshairPosRef.current.y;
    } else {
      const rect = canvas.getBoundingClientRect();
      clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
      clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
      crosshairPosRef.current = { x: clickX, y: clickY };
    }

    // Recoil spray drill mechanics
    if (activeDrill === 'recoil') {
      sounds.playShot();
      const spray = getRecoilOffset(recoilBulletIndex);
      // Actual bullet hits with recoil offset applied
      const bulletX = clickX + spray.dx;
      const bulletY = clickY + spray.dy;

      const target = targetsRef.current[0];
      if (target) {
        const dist = Math.hypot(bulletX - target.x, bulletY - target.y);
        const hit = dist <= target.radius;
        const isHeadshot = dist <= target.radius * 0.35;

        impactsRef.current.push({ x: bulletX, y: bulletY, hit, isHeadshot, time: performance.now() });
        setShots((s) => s + 1);

        if (hit) {
          if (isHeadshot) {
            sounds.playHeadshot();
            setHeadshots((h) => h + 1);
            setScore((s) => s + 150);
          } else {
            sounds.playHit();
            setScore((s) => s + 80);
          }
          setHits((h) => h + 1);
          createExplosion(bulletX, bulletY, isHeadshot ? '#f43f5e' : '#06b6d4', 8);
          setRecoilScoreAccum((prev) => prev + (isHeadshot ? 100 : 70));
        } else {
          sounds.playMiss();
        }
      }

      setRecoilBulletIndex((prev) => (prev + 1) % 15);
      return;
    }

    sounds.playShot();
    setShots((s) => s + 1);

    // Standard Flicking & Precision Hit Testing
    let hitSomething = false;
    let hitIndex = -1;
    let headshotHit = false;

    for (let i = 0; i < targetsRef.current.length; i++) {
      const tgt = targetsRef.current[i];
      const dist = Math.hypot(clickX - tgt.x, clickY - tgt.y);

      if (dist <= tgt.radius) {
        hitSomething = true;
        hitIndex = i;
        const timeToHit = performance.now() - tgt.spawnTime;
        reactionTimesRef.current.push(timeToHit);
        setLastReactionTime(Math.round(timeToHit));

        // Center 35% is headshot / bullseye
        if (dist <= tgt.radius * 0.35) {
          headshotHit = true;
        }

        // Overshoot vs Undershoot analysis:
        // Calculate vector from target to click
        const dx = clickX - tgt.x;
        if (Math.abs(dx) > tgt.radius * 0.2) {
          if (dx > 0) overshootsRef.current++;
          else undershootsRef.current++;
        }
        break;
      }
    }

    impactsRef.current.push({
      x: clickX,
      y: clickY,
      hit: hitSomething,
      isHeadshot: headshotHit,
      time: performance.now(),
    });

    if (hitSomething && hitIndex !== -1) {
      const hitTarget = targetsRef.current[hitIndex];
      if (headshotHit) {
        sounds.playHeadshot();
        setHeadshots((h) => h + 1);
        setScore((sc) => sc + 200);
        createExplosion(hitTarget.x, hitTarget.y, '#f43f5e', 24);
      } else {
        sounds.playHit();
        setScore((sc) => sc + 100);
        createExplosion(hitTarget.x, hitTarget.y, hitTarget.color, 16);
      }
      setHits((h) => h + 1);

      // Remove and spawn new target
      targetsRef.current.splice(hitIndex, 1);
      targetsRef.current.push(spawnTarget(canvas.width, canvas.height));
    } else {
      sounds.playMiss();
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (usePointerLock) {
      // In pointer lock, use movementX/movementY with game sensitivity
      const sensMultiplier = (gameSensitivity || 1) * 0.8;
      const newX = Math.max(10, Math.min(canvas.width - 10, crosshairPosRef.current.x + e.movementX * sensMultiplier));
      const newY = Math.max(10, Math.min(canvas.height - 10, crosshairPosRef.current.y + e.movementY * sensMultiplier));
      crosshairPosRef.current = { x: newX, y: newY };
    } else {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      crosshairPosRef.current = { x, y };
    }
  };

  // Start drill session with 3s countdown
  const startDrill = useCallback(() => {
    setScore(0);
    setShots(0);
    setHits(0);
    setHeadshots(0);
    setTimeLeft(durationSec);
    setLastReactionTime(null);
    setRecoilBulletIndex(0);
    setRecoilScoreAccum(0);
    setLatestSummary(null);

    reactionTimesRef.current = [];
    overshootsRef.current = 0;
    undershootsRef.current = 0;
    particlesRef.current = [];
    impactsRef.current = [];
    trackingTimeOnTargetRef.current = 0;
    trackingTotalFramesRef.current = 0;

    setGameState('COUNTDOWN');
    setCountdownValue(3);
    sounds.playCountdown(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
        sounds.playCountdown(false);
      } else {
        clearInterval(interval);
        setGameState('RUNNING');
        sounds.playCountdown(true);
        drillStartTimeRef.current = performance.now();

        const canvas = canvasRef.current;
        if (canvas) {
          initTargets(canvas.width, canvas.height);
        }

        // Reaction test trigger loop
        if (activeDrill === 'reaction') {
          triggerReactionRound();
        }
      }
    }, 800);
  }, [activeDrill, durationSec, initTargets]);

  const triggerReactionRound = () => {
    setReactionState('WAIT');
    const delay = 1200 + Math.random() * 2500;
    reactionTimerRef.current = window.setTimeout(() => {
      setReactionState('READY');
      reactionStartRef.current = performance.now();
      sounds.playCountdown(true);
    }, delay);
  };

  const endDrill = useCallback(() => {
    setGameState('FINISHED');
    sounds.playVictory();

    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);

    const avgReaction =
      reactionTimesRef.current.length > 0
        ? Math.round(
            reactionTimesRef.current.reduce((a, b) => a + b, 0) /
              reactionTimesRef.current.length
          )
        : 0;

    let finalAccuracy = 0;
    if (activeDrill === 'tracking') {
      finalAccuracy =
        trackingTotalFramesRef.current > 0
          ? Math.round((trackingTimeOnTargetRef.current / trackingTotalFramesRef.current) * 100)
          : 0;
    } else {
      finalAccuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;
    }

    const summary: DrillResult = {
      id: Date.now().toString(),
      drill: activeDrill,
      score,
      accuracy: finalAccuracy,
      avgReactionTimeMs: avgReaction,
      totalShots: shots,
      hits,
      headshots,
      overshoots: overshootsRef.current,
      undershoots: undershootsRef.current,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLatestSummary(summary);
    onRecordResult(summary);
  }, [activeDrill, hits, onRecordResult, score, shots]);

  // Main game timer countdown
  useEffect(() => {
    if (gameState !== 'RUNNING') return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          endDrill();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endDrill]);

  // Pointer Lock API listener
  const togglePointerLock = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!document.pointerLockElement) {
      canvas.requestPointerLock();
      setUsePointerLock(true);
    } else {
      document.exitPointerLock();
      setUsePointerLock(false);
    }
  };

  useEffect(() => {
    const handleLockChange = () => {
      setUsePointerLock(document.pointerLockElement === canvasRef.current);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  // Responsive canvas resizing
  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 540 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `540px`;
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Main high-FPS rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark tactical grid background
      ctx.fillStyle = '#0a0c13';
      ctx.fillRect(0, 0, width, height);

      // Subtle tactical isometric grid
      ctx.strokeStyle = '#151b2a';
      ctx.lineWidth = 1 * dpr;
      const gridSize = 40 * dpr;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw faint center guidelines
      ctx.strokeStyle = '#1e283d';
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Reaction benchmark special rendering
      if (activeDrill === 'reaction' && gameState === 'RUNNING') {
        if (reactionState === 'WAIT') {
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#e2e8f0';
          ctx.font = `600 ${28 * dpr}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('WAIT FOR GREEN...', width / 2, height / 2 - 20 * dpr);
          ctx.font = `400 ${16 * dpr}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Do not click prematurely', width / 2, height / 2 + 20 * dpr);
        } else if (reactionState === 'READY') {
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#34d399';
          ctx.font = `800 ${44 * dpr}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('CLICK NOW!', width / 2, height / 2);
        } else if (reactionState === 'CLICKED') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#38bdf8';
          ctx.font = `700 ${36 * dpr}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(`${lastReactionTime} ms`, width / 2, height / 2 - 10 * dpr);
          ctx.font = `500 ${16 * dpr}px 'Plus Jakarta Sans', sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Click anywhere to load next impulse', width / 2, height / 2 + 30 * dpr);
        }
      }

      // Tracking target logic & continuous fire
      if (activeDrill === 'tracking' && gameState === 'RUNNING') {
        trackingTotalFramesRef.current++;
        const target = targetsRef.current[0];
        if (target) {
          // Bounce off arena walls
          target.x += target.vx;
          target.y += target.vy;

          if (target.x - target.radius < 40 || target.x + target.radius > width - 40) {
            target.vx *= -1;
          }
          if (target.y - target.radius < 40 || target.y + target.radius > height - 40) {
            target.vy *= -1;
          }

          // Random slight velocity curve
          if (Math.random() < 0.04) {
            target.vx += (Math.random() - 0.5) * 1.5;
            target.vy += (Math.random() - 0.5) * 1.5;
            const maxSpd = 4.5;
            target.vx = Math.max(-maxSpd, Math.min(maxSpd, target.vx));
            target.vy = Math.max(-maxSpd, Math.min(maxSpd, target.vy));
          }

          // Check if crosshair is on target
          const cPos = crosshairPosRef.current;
          const dist = Math.hypot(cPos.x - target.x, cPos.y - target.y);
          const isOnTarget = dist <= target.radius;

          if (isOnTarget && isMouseDownRef.current) {
            trackingTimeOnTargetRef.current++;
            setScore((s) => s + 2);
            if (Math.random() < 0.25) {
              sounds.playHit();
              createExplosion(cPos.x, cPos.y, '#38bdf8', 3);
            }
          }
        }
      }

      // Render Active Targets
      if (activeDrill !== 'reaction' || gameState !== 'RUNNING') {
        targetsRef.current.forEach((tgt) => {
          // Outer target glow ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(tgt.x, tgt.y, tgt.radius * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `${tgt.color}22`;
          ctx.fill();
          ctx.lineWidth = 2 * dpr;
          ctx.strokeStyle = tgt.color;
          ctx.stroke();

          // Inner bullseye zone (headshot zone)
          ctx.beginPath();
          ctx.arc(tgt.x, tgt.y, tgt.radius * 0.35 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = tgt.color;
          ctx.fill();

          // Concentric laser ring
          ctx.beginPath();
          ctx.arc(tgt.x, tgt.y, tgt.radius * 0.7 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = `${tgt.color}66`;
          ctx.lineWidth = 1 * dpr;
          ctx.stroke();
          ctx.restore();
        });
      }

      // Render recoil guide ghost outline if in recoil drill
      if (activeDrill === 'recoil' && gameState === 'RUNNING') {
        const target = targetsRef.current[0];
        if (target) {
          // Draw headshot center indicator
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.arc(target.x, target.y - 10 * dpr, 14 * dpr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Update & render bullet impacts
      const now = performance.now();
      impactsRef.current = impactsRef.current.filter((imp) => now - imp.time < 1200);
      impactsRef.current.forEach((imp) => {
        const age = now - imp.time;
        const alpha = Math.max(0, 1 - age / 1200);
        ctx.save();
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, (imp.isHeadshot ? 5 : 3) * dpr, 0, Math.PI * 2);
        ctx.fillStyle = imp.isHeadshot
          ? `rgba(244, 63, 94, ${alpha})`
          : imp.hit
          ? `rgba(56, 189, 248, ${alpha})`
          : `rgba(148, 163, 184, ${alpha * 0.7})`;
        ctx.fill();
        ctx.restore();
      });

      // Update & render particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * dpr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw active player crosshair at crosshairPosRef
      if (activeDrill !== 'reaction') {
        const cx = crosshairPosRef.current.x;
        const cy = crosshairPosRef.current.y;
        drawCrosshairOnCanvas(ctx, cx, cy, crosshair, dpr);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [activeDrill, crosshair, gameState, lastReactionTime, reactionState]);

  // Canvas helper to draw custom crosshair directly in the arena
  const drawCrosshairOnCanvas = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    ch: CrosshairConfig,
    dpr: number
  ) => {
    ctx.save();
    const len = ch.innerLength * 2.5 * dpr;
    const thk = Math.max(1, ch.innerThickness * dpr);
    const gap = ch.innerGap * 2 * dpr;

    // Outlines
    if (ch.hasOutline) {
      ctx.strokeStyle = ch.outlineColor;
      ctx.lineWidth = thk + ch.outlineThickness * 2 * dpr;

      // Top
      if (ch.style !== 't-style') {
        ctx.beginPath();
        ctx.moveTo(x, y - gap - len);
        ctx.lineTo(x, y - gap);
        ctx.stroke();
      }
      // Bottom
      ctx.beginPath();
      ctx.moveTo(x, y + gap);
      ctx.lineTo(x, y + gap + len);
      ctx.stroke();
      // Left
      ctx.beginPath();
      ctx.moveTo(x - gap - len, y);
      ctx.lineTo(x - gap, y);
      ctx.stroke();
      // Right
      ctx.beginPath();
      ctx.moveTo(x + gap, y);
      ctx.lineTo(x + gap + len, y);
      ctx.stroke();
    }

    // Main lines
    ctx.strokeStyle = ch.color;
    ctx.lineWidth = thk;
    ctx.globalAlpha = ch.innerOpacity;

    // Top
    if (ch.style !== 't-style') {
      ctx.beginPath();
      ctx.moveTo(x, y - gap - len);
      ctx.lineTo(x, y - gap);
      ctx.stroke();
    }
    // Bottom
    ctx.beginPath();
    ctx.moveTo(x, y + gap);
    ctx.lineTo(x, y + gap + len);
    ctx.stroke();
    // Left
    ctx.beginPath();
    ctx.moveTo(x - gap - len, y);
    ctx.lineTo(x - gap, y);
    ctx.stroke();
    // Right
    ctx.beginPath();
    ctx.moveTo(x + gap, y);
    ctx.lineTo(x + gap + len, y);
    ctx.stroke();

    // Center dot
    if (ch.hasDot) {
      ctx.fillStyle = ch.color;
      ctx.beginPath();
      ctx.arc(x, y, (ch.dotSize * 1.5 * dpr) / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const getRankFromScore = (sc: number, acc: number) => {
    if (acc >= 90 && sc >= 3500) return { title: 'Radiant / Global Elite', tier: 'S+' };
    if (acc >= 80 && sc >= 2600) return { title: 'Immortal / Faceit 10', tier: 'S' };
    if (acc >= 70 && sc >= 1800) return { title: 'Diamond / Master', tier: 'A' };
    if (acc >= 55 && sc >= 1200) return { title: 'Gold / Platinum', tier: 'B' };
    return { title: 'Silver / Bronze', tier: 'C' };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Arena HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
        <div className="flex items-center gap-2">
          {/* Mode Selector Buttons */}
          {(
            [
              { id: 'flicking', label: 'Reflex Flicking' },
              { id: 'precision', label: 'Micro-Precision' },
              { id: 'tracking', label: 'Dynamic Tracking' },
              { id: 'recoil', label: 'Recoil Control' },
              { id: 'reaction', label: 'Reaction Benchmark' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                if (gameState === 'RUNNING') return;
                sounds.playHit();
                setActiveDrill(mode.id);
                setScore(0);
                setHits(0);
                setShots(0);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeDrill === mode.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950/40'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-6 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span>Score:</span>
            <span className="text-white font-bold text-sm tabular-nums">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Acc:</span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">
              {activeDrill === 'tracking'
                ? trackingTotalFramesRef.current > 0
                  ? `${Math.round((trackingTimeOnTargetRef.current / trackingTotalFramesRef.current) * 100)}%`
                  : '100%'
                : shots > 0
                ? `${Math.round((hits / shots) * 100)}%`
                : '100%'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Time:</span>
            <span className={`font-bold text-sm tabular-nums ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas Training Ground */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-[#090b11] shadow-2xl select-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          className="w-full h-[540px] cursor-crosshair block"
        />

        {/* Pointer Lock Hint */}
        <button
          onClick={togglePointerLock}
          className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-700/60 backdrop-blur-md transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
          <span>{usePointerLock ? 'Lock Engaged (Esc to exit)' : 'Raw Mouse Lock'}</span>
        </button>

        {/* Countdown Overlay */}
        {gameState === 'COUNTDOWN' && (
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-30">
            <span className="text-8xl font-black text-rose-500 font-display animate-ping">
              {countdownValue}
            </span>
          </div>
        )}

        {/* Start / Idle Welcome Overlay */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-neutral-950/75 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-30 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Crosshair className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-display">
                {activeDrill === 'flicking' && 'Reflex Flicking & Target Acquisition'}
                {activeDrill === 'precision' && 'Micro-Correction & Headshot Sniping'}
                {activeDrill === 'tracking' && 'Dynamic Tracking & Smooth Velocity'}
                {activeDrill === 'recoil' && 'Recoil Control & Spray Master'}
                {activeDrill === 'reaction' && 'Neuromuscular Reaction Benchmark'}
              </h2>
              <p className="text-sm text-neutral-400 max-w-lg mt-1">
                {activeDrill === 'flicking' && 'Eliminate targets as fast as they spawn. Focus on smooth, decisive crosshair flicks.'}
                {activeDrill === 'precision' && 'Hit the exact inner core of small targets to train pixel-perfect crosshair placement.'}
                {activeDrill === 'tracking' && 'Hold fire while keeping your reticle glued to the erratic dodging target.'}
                {activeDrill === 'recoil' && 'Pull down your crosshair against bullet climb to counter weapon recoil grouping.'}
                {activeDrill === 'reaction' && 'Measure your raw biological reaction latency in milliseconds.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs text-neutral-300">
                <span>Duration:</span>
                {[30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setDurationSec(sec)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${durationSec === sec ? 'bg-rose-500 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-xs text-neutral-300">
                <span>Target Size:</span>
                {(['small', 'medium', 'large'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTargetSize(sz)}
                    className={`px-2 py-0.5 rounded capitalize cursor-pointer ${targetSize === sz ? 'bg-rose-500 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startDrill}
              className="mt-2 flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/50 hover:scale-102 active:scale-98 transition-all cursor-pointer font-display"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start Drill</span>
            </button>
          </div>
        )}

        {/* Finished / Drill Summary Modal */}
        {gameState === 'FINISHED' && latestSummary && (
          <div className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center z-40 p-6">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white font-display">Drill Complete</span>
                </div>
                <span className="text-xs font-mono text-neutral-400">{latestSummary.date}</span>
              </div>

              {/* Tier / Rank Assessment */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400">Aim Skill Bracket</span>
                  <div className="text-lg font-bold text-white font-display">
                    {getRankFromScore(latestSummary.score, latestSummary.accuracy).title}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 font-extrabold text-xl font-display">
                  {getRankFromScore(latestSummary.score, latestSummary.accuracy).tier}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/80">
                  <span className="text-neutral-400">Total Score</span>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">{latestSummary.score}</div>
                </div>
                <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/80">
                  <span className="text-neutral-400">Accuracy</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{latestSummary.accuracy}%</div>
                </div>
                <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/80">
                  <span className="text-neutral-400">Avg Reaction</span>
                  <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">{latestSummary.avgReactionTimeMs} ms</div>
                </div>
                <div className="p-3 bg-neutral-950/40 rounded-lg border border-neutral-800/80">
                  <span className="text-neutral-400">Hits / Headshots</span>
                  <div className="text-xl font-bold text-white font-mono mt-0.5">
                    {latestSummary.hits} <span className="text-xs text-rose-400 font-normal">({latestSummary.headshots} head)</span>
                  </div>
                </div>
              </div>

              {/* Diagnostic Tip */}
              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
                <span className="text-rose-400 font-semibold">Pro Aim Diagnosis: </span>
                {latestSummary.overshoots > latestSummary.undershoots * 1.5 ? (
                  <span>
                    You overshot targets {latestSummary.overshoots} times. Your sensitivity may be slightly too fast for fine corrections. Consider lowering it by 5-10%.
                  </span>
                ) : latestSummary.undershoots > latestSummary.overshoots * 1.5 ? (
                  <span>
                    You consistently fell short on flicks ({latestSummary.undershoots} undershoots). Your sensitivity may be too slow or your mousepad friction too high.
                  </span>
                ) : (
                  <span>
                    Your crosshair stopping power is well-balanced with minimal directional bias. Maintain this mousepad speed!
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startDrill}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => setGameState('IDLE')}
                  className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick In-Game Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-400">
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-3">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-200">Gaze at the Target, Not Crosshair:</span>
            <p className="mt-1">
              Top aimers fixate their eyes on the enemy model/head, and let their peripheral vision guide the crosshair to that focal point.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-3">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-200">Decisive Stopping Power:</span>
            <p className="mt-1">
              A fast flick is useless if you drift past the target. Practice the physical stop: plant your ring and pinky fingers firmly on the mousepad.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-3">
          <Crosshair className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-200">Counter-Strafe Before Firing:</span>
            <p className="mt-1">
              In tactical shooters like CS2 and Valorant, your bullet spread is massive if you shoot while moving. Tap the opposite strafe key to come to a dead stop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
