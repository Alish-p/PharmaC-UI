import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Stack, Tooltip, IconButton, Typography } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Constants & Color Mappings (shared with the map legend)
// ----------------------------------------------------------------------
const SPEED_THRESHOLDS = [
  { max: 0, color: '#ef4444', label: 'Stopped' },
  { max: 20, color: '#f97316', label: 'Slow' },
  { max: 60, color: '#eab308', label: 'Moderate' },
  { max: Infinity, color: '#22c55e', label: 'Normal' },
];

function getSpeedColor(speed) {
  const tier = SPEED_THRESHOLDS.find((t) => speed <= t.max);
  return tier ? tier.color : SPEED_THRESHOLDS[SPEED_THRESHOLDS.length - 1].color;
}

function getSpeedLabel(speed) {
  if (speed === 0) return 'Stopped';
  if (speed <= 20) return 'Slow';
  if (speed <= 60) return 'Moderate';
  return 'Running';
}

function getSpeedLabelColor(speed) {
  if (speed === 0) return 'error';
  if (speed <= 20) return 'warning';
  if (speed <= 60) return 'info';
  return 'success';
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const TICK_SPACING = 48;
const CONTAINER_HEIGHT = 100;
const CENTER_MARK_H = 44;
const SECONDARY_MARK_H = 26;
const MINOR_MARK_H = 14;
const STEP_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

function getTicksForGranularity(startDate, endDate, granularity) {
  const ticks = [];
  const current = new Date(startDate);

  if (granularity === 'minute') {
    current.setMinutes(Math.floor(current.getMinutes() / 15) * 15, 0, 0);
    const step = 15; // 15-minute steps
    while (current <= endDate) {
      const m = current.getMinutes();
      const isPrimary = m === 0;
      const isSemi = m === 30;
      ticks.push({ date: new Date(current), isPrimary, isSemi });
      current.setTime(current.getTime() + step * 60 * 1000);
    }
  } else if (granularity === 'hour') {
    current.setMinutes(0, 0, 0);
    while (current <= endDate) {
      const h = current.getHours();
      const isPrimary = h === 0 || h === 12;
      const isSemi = h % 6 === 0;
      ticks.push({ date: new Date(current), isPrimary, isSemi });
      current.setTime(current.getTime() + 60 * 60 * 1000);
    }
  } else {
    current.setHours(0, 0, 0, 0);
    while (current <= endDate) {
      ticks.push({ date: new Date(current), isPrimary: true, isSemi: false });
      current.setTime(current.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  return ticks;
}

function formatTickLabel(date, granularity) {
  if (granularity === 'minute') {
    const h = date.getHours();
    const m = date.getMinutes();
    if (m !== 0) return null;
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) {
      return `12 AM\n${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    return `${h % 12 || 12} ${ampm}`;
  }
  if (granularity === 'hour') {
    const h = date.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h === 0) {
      return `12 AM\n${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
    }
    return `${h % 12 || 12} ${ampm}`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatCenterLabel(date, granularity) {
  if (granularity === 'day') {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function findNearestSnapshotIndex(date, snapshots) {
  if (!snapshots || snapshots.length === 0) return -1;
  const targetTime = date.getTime();
  let minDiff = Infinity;
  let nearestIdx = 0;
  for (let i = 0; i < snapshots.length; i += 1) {
    const diff = Math.abs(new Date(snapshots[i].timestamp).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      nearestIdx = i;
    }
  }
  return nearestIdx;
}

// ----------------------------------------------------------------------
// Reusable Timeline Picker Component
// ----------------------------------------------------------------------
export function ScrollableTimelinePicker({
  startDate,
  endDate,
  snapshots,
  currentIndex,
  onChangeIndex,
  isPlaying,
  onPlayToggle,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const granularity = 'minute';

  // Compute ticks and mapping
  const ticks = useMemo(
    () => getTicksForGranularity(startDate, endDate, granularity),
    [startDate, endDate, granularity]
  );

  const totalDuration = endDate.getTime() - startDate.getTime();

  const msPerTick =
    granularity === 'minute'
      ? 15 * 60 * 1000
      : granularity === 'hour'
        ? 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

  const pixelsPerMs = TICK_SPACING / msPerTick;

  // Refs for tracking drag/wheel/animation
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const scrollXRef = useRef(0);
  const velRef = useRef(0);
  const lastXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isUserInteractingRef = useRef(false);
  // Prevents the sync-from-parent useEffect from overriding a scroll we triggered internally
  const isInternalIndexUpdateRef = useRef(false);
  const rafRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const containerWidth = useRef(680);

  // Map each tick to nearest snapshot for speed coloring
  const ticksWithColors = useMemo(() => {
    const stepMs =
      granularity === 'minute'
        ? 15 * 60 * 1000
        : granularity === 'hour'
          ? 60 * 60 * 1000
          : 24 * 60 * 60 * 1000;

    return ticks.map((tick) => {
      const nearestIdx = findNearestSnapshotIndex(tick.date, snapshots);
      let color = null;
      let speed = 0;
      if (nearestIdx !== -1) {
        const snap = snapshots[nearestIdx];
        const snapTime = new Date(snap.timestamp).getTime();
        const diff = Math.abs(tick.date.getTime() - snapTime);
        // Only color if the nearest snapshot is close enough to the tick date (1.5x of tick interval)
        if (diff <= stepMs * 1.5) {
          color = getSpeedColor(snap.speed || 0);
          speed = snap.speed || 0;
        }
      }
      return { ...tick, color, speed };
    });
  }, [ticks, granularity, snapshots]);

  // Derived state: Active Date representing the center needle
  const [centerDate, setCenterDate] = useState(startDate);

  // Sync index from parent (e.g. autoplay or live-trip updates — NOT from our own scrolling)
  useEffect(() => {
    if (snapshots.length === 0) return;
    const snap = snapshots[currentIndex];
    if (!snap) return;

    // Skip if the timeline itself triggered this index change to avoid a feedback loop
    if (isInternalIndexUpdateRef.current) {
      isInternalIndexUpdateRef.current = false;
      return;
    }

    // Skip if the user is actively dragging/wheeling
    if (isUserInteractingRef.current) return;

    // Scroll timeline to center this snapshot's time
    const snapTime = new Date(snap.timestamp).getTime();
    const targetScroll = (snapTime - startDate.getTime()) * pixelsPerMs;
    const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
    const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    animateToScrollX(clampedScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, snapshots, startDate, totalDuration, pixelsPerMs]);

  // Reset user interaction state when playback starts so auto-scrolling can proceed
  useEffect(() => {
    if (isPlaying) {
      isUserInteractingRef.current = false;
      isDraggingRef.current = false;
      cancelAnimationFrame(rafRef.current);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    }
  }, [isPlaying]);

  // Clean up animations and timeouts on component unmount
  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    },
    []
  );

  // Center mark date mapping
  const getCenterDateAtScroll = useCallback(
    (scrollVal) => new Date(startDate.getTime() + scrollVal / pixelsPerMs),
    [startDate, pixelsPerMs]
  );

  // Draw Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const baseColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    const textColor = theme.palette.text.secondary;
    const activeTextColor = theme.palette.primary.main;
    const centerX = W / 2;
    const scrollX = scrollXRef.current;

    // 1. Draw continuous background status gradient representing the speed trail
    if (snapshots.length > 1) {
      const gradHeight = 6;
      const gradY = H - 16;
      const startGradX = centerX - scrollX;
      const endGradX = centerX + totalDuration * pixelsPerMs - scrollX;
      const trackWidth = Math.max(0, endGradX - startGradX);

      // Draw shadow rail first
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
      ctx.beginPath();
      ctx.roundRect(startGradX, gradY, trackWidth, gradHeight, 3);
      ctx.fill();

      // Create speed gradient
      const grad = ctx.createLinearGradient(startGradX, 0, endGradX, 0);
      snapshots.forEach((snap) => {
        const snapTime = new Date(snap.timestamp).getTime();
        const ratio = Math.max(0, Math.min(1, (snapTime - startDate.getTime()) / totalDuration));
        const color = getSpeedColor(snap.speed || 0);
        grad.addColorStop(ratio, color);
      });

      // Fill inside the viewport bounds
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(startGradX, gradY, trackWidth, gradHeight, 3);
      ctx.fill();
    }

    // Find the center tick index to draw it larger/active
    const centerTime = startDate.getTime() + scrollX / pixelsPerMs;
    let closestTickIdx = -1;
    let minTickDist = Infinity;
    ticksWithColors.forEach((tick, i) => {
      const dist = Math.abs(tick.date.getTime() - centerTime);
      if (dist < minTickDist) {
        minTickDist = dist;
        closestTickIdx = i;
      }
    });

    // 2. Draw Ticks
    ticksWithColors.forEach((tick, i) => {
      const tickTime = tick.date.getTime();
      const absoluteX = centerX + (tickTime - startDate.getTime()) * pixelsPerMs;
      const tickX = absoluteX - scrollX;

      // Skip drawing if outside viewport bounds (plus padding)
      if (tickX < -50 || tickX > W + 50) return;

      const isClosest = i === closestTickIdx;
      const tickColor = tick.color || baseColor;
      const tickH = tick.isPrimary ? CENTER_MARK_H : tick.isSemi ? SECONDARY_MARK_H : MINOR_MARK_H;
      const lineW = tick.isPrimary ? 2 : 1;

      ctx.save();
      ctx.translate(tickX, H / 2 - 10);

      // Active tick scaling
      if (isClosest) {
        ctx.scale(1.2, 1.2);
        ctx.strokeStyle = tick.color ? tick.color : theme.palette.primary.main;
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = tickColor;
        ctx.lineWidth = lineW;
      }

      // Draw line
      ctx.beginPath();
      ctx.moveTo(0, -tickH / 2);
      ctx.lineTo(0, tickH / 2);
      ctx.stroke();

      // Draw labels for primary/semi ticks
      if (tick.isPrimary || (tick.isSemi && !isClosest && minTickDist > 20)) {
        const label = formatTickLabel(tick.date, granularity);
        if (label) {
          ctx.font = tick.isPrimary
            ? `600 11px ${theme.typography.fontFamily}`
            : `400 10px ${theme.typography.fontFamily}`;
          ctx.fillStyle = isClosest ? activeTextColor : textColor;
          ctx.textAlign = 'center';

          const lines = label.split('\n');
          lines.forEach((line, lineIdx) => {
            ctx.fillText(line, 0, tickH / 2 + 12 + lineIdx * 11);
          });
        }
      }

      ctx.restore();
    });
  }, [
    ticksWithColors,
    granularity,
    isDark,
    theme,
    snapshots,
    startDate,
    totalDuration,
    pixelsPerMs,
  ]);

  // Update center date and notify parent
  const updateCenterSelection = useCallback(
    (scrollVal) => {
      const d = getCenterDateAtScroll(scrollVal);
      setCenterDate(d);

      // Notify parent to set closest snapshot index.
      // Mark as internal so the sync useEffect doesn't re-animate back over us.
      if (snapshots.length > 0) {
        const nearestIdx = findNearestSnapshotIndex(d, snapshots);
        if (nearestIdx !== -1 && nearestIdx !== currentIndex) {
          isInternalIndexUpdateRef.current = true;
          onChangeIndex(nearestIdx);
        }
      }
    },
    [getCenterDateAtScroll, snapshots, currentIndex, onChangeIndex]
  );

  // Resize listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const w = Math.floor(entry.contentRect.width);
        containerWidth.current = w;
        canvas.width = w;
        canvas.height = CONTAINER_HEIGHT;
        drawCanvas();
      });
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }
    return () => observer.disconnect();
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, centerDate]);

  // Snapping logic
  const snapToNearest = useCallback(() => {
    const centerTime = startDate.getTime() + scrollXRef.current / pixelsPerMs;
    let closestTickTime = centerTime;
    let minDistance = Infinity;

    ticks.forEach((t) => {
      const d = Math.abs(t.date.getTime() - centerTime);
      if (d < minDistance) {
        minDistance = d;
        closestTickTime = t.date.getTime();
      }
    });

    const targetScroll = (closestTickTime - startDate.getTime()) * pixelsPerMs;
    const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
    return Math.max(0, Math.min(targetScroll, maxScroll));
  }, [ticks, startDate, pixelsPerMs, totalDuration]);

  // Animation helper — accepts an optional onComplete callback
  const animateToScrollX = useCallback(
    (target, onComplete) => {
      cancelAnimationFrame(rafRef.current);
      const startX = scrollXRef.current;
      const dist = target - startX;
      if (Math.abs(dist) < 0.5) {
        scrollXRef.current = target;
        drawCanvas();
        onComplete?.();
        return;
      }
      const dur = 280;
      const t0 = performance.now();

      function step(t) {
        const prog = Math.min(1, (t - t0) / dur);
        const ease = 1 - (1 - prog) ** 3; // ease-out cubic
        scrollXRef.current = startX + dist * ease;
        drawCanvas();

        const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
        const cappedScroll = Math.max(0, Math.min(scrollXRef.current, maxScroll));
        const d = getCenterDateAtScroll(cappedScroll);
        setCenterDate(d);

        if (prog < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          isUserInteractingRef.current = false;
          onComplete?.();
        }
      }
      rafRef.current = requestAnimationFrame(step);
    },
    [drawCanvas, getCenterDateAtScroll, totalDuration, pixelsPerMs]
  );

  // Friction and snap physics loop
  const inertiaLoop = useCallback(() => {
    if (Math.abs(velRef.current) < 0.2) {
      const snap = snapToNearest();
      animateToScrollX(snap);
      return;
    }
    velRef.current *= 0.94; // friction
    const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
    scrollXRef.current = Math.max(0, Math.min(scrollXRef.current + velRef.current, maxScroll));

    drawCanvas();
    updateCenterSelection(scrollXRef.current);

    rafRef.current = requestAnimationFrame(inertiaLoop);
  }, [
    drawCanvas,
    updateCenterSelection,
    snapToNearest,
    animateToScrollX,
    totalDuration,
    pixelsPerMs,
  ]);

  // Pointer Interaction
  const onPointerDown = useCallback(
    (e) => {
      if (isPlaying) {
        onPlayToggle(); // Pause playback on manual drag
      }
      cancelAnimationFrame(rafRef.current);
      isDraggingRef.current = true;
      isUserInteractingRef.current = true;
      lastXRef.current = e.clientX;
      velRef.current = 0;
      trackRef.current.setPointerCapture(e.pointerId);
    },
    [isPlaying, onPlayToggle]
  );

  const onPointerMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;
      const dx = lastXRef.current - e.clientX;
      lastXRef.current = e.clientX;

      // Filter jitter and track velocity
      velRef.current = velRef.current * 0.25 + dx * 0.75;

      const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
      scrollXRef.current = Math.max(0, Math.min(scrollXRef.current + dx, maxScroll));

      drawCanvas();
      updateCenterSelection(scrollXRef.current);
    },
    [drawCanvas, updateCenterSelection, totalDuration, pixelsPerMs]
  );

  const onPointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    rafRef.current = requestAnimationFrame(inertiaLoop);
  }, [inertiaLoop]);

  // Wheel/Trackpad Interaction
  const onWheel = useCallback(
    (e) => {
      if (isPlaying) {
        onPlayToggle(); // Pause playback
      }
      cancelAnimationFrame(rafRef.current);
      isUserInteractingRef.current = true;

      const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
      const delta = e.deltaX + e.deltaY * 0.4;
      scrollXRef.current = Math.max(0, Math.min(scrollXRef.current + delta, maxScroll));

      drawCanvas();
      updateCenterSelection(scrollXRef.current);

      // Snap after scroll stops
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      wheelTimeoutRef.current = setTimeout(() => {
        const snap = snapToNearest();
        animateToScrollX(snap);
      }, 150);
    },
    [
      isPlaying,
      onPlayToggle,
      drawCanvas,
      updateCenterSelection,
      snapToNearest,
      animateToScrollX,
      totalDuration,
      pixelsPerMs,
    ]
  );

  // Setup Wheel Event Listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const parent = canvas.parentElement;

    const handleWheel = (e) => {
      // Prevent browser backward/forward navigation swipes
      e.preventDefault();
      onWheel(e);
    };

    parent.addEventListener('wheel', handleWheel, { passive: false });
    return () => parent.removeEventListener('wheel', handleWheel);
  }, [onWheel]);

  // Step timeline by ±10 minutes
  const stepTime = useCallback(
    (dir) => {
      if (isPlaying) {
        onPlayToggle(); // Pause playback
      }
      cancelAnimationFrame(rafRef.current);
      isUserInteractingRef.current = true;

      // Compute how many pixels represent 10 minutes on the canvas
      const stepPx = STEP_MS * pixelsPerMs * dir;

      const maxScroll = Math.max(0, totalDuration * pixelsPerMs);
      const clampedScroll = Math.max(0, Math.min(scrollXRef.current + stepPx, maxScroll));

      // Animate and then sync the map marker once the animation settles
      animateToScrollX(clampedScroll, () => {
        updateCenterSelection(clampedScroll);
        isUserInteractingRef.current = false;
      });
    },
    [pixelsPerMs, totalDuration, isPlaying, onPlayToggle, animateToScrollX, updateCenterSelection]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepTime(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepTime(1);
      }
    },
    [stepTime]
  );

  // Detail display of active snapshot
  const activeSnap = snapshots[currentIndex] || snapshots[0];
  const activeSpeed = activeSnap?.speed || 0;

  return (
    <Box sx={{ mt: 1 }}>
      {/* 1. Header with details */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
            {formatCenterLabel(centerDate, granularity)}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Status at select:
            </Typography>
            {activeSnap && (
              <>
                <Label variant="soft" color={getSpeedLabelColor(activeSpeed)}>
                  {getSpeedLabel(activeSpeed)} · {activeSpeed} km/h
                </Label>
                {activeSnap.odometer != null && (
                  <Typography variant="caption" color="text.secondary">
                    Odo: {activeSnap.odometer.toFixed(1)} km
                  </Typography>
                )}
              </>
            )}
          </Stack>
        </Box>
      </Stack>

      {/* 2. Interactive Scrollable Canvas Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: (t) => t.customShadows?.z1 || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          ref={trackRef}
          role="slider"
          aria-valuemin={startDate.getTime()}
          aria-valuemax={endDate.getTime()}
          aria-valuenow={centerDate.getTime()}
          aria-valuetext={formatCenterLabel(centerDate, granularity)}
          aria-label="Trip Time Selector"
          tabIndex={0}
          style={{
            position: 'relative',
            width: '100%',
            height: `${CONTAINER_HEIGHT}px`,
            touchAction: 'none',
            cursor: isDraggingRef.current ? 'grabbing' : 'grab',
            userSelect: 'none',
            outline: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: `${CONTAINER_HEIGHT}px`,
            }}
          />

          {/* Precision Needle Center Indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 2,
              height: CENTER_MARK_H + 20,
              bgcolor: 'primary.main',
              borderRadius: '1px',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: (t) => `0 0 8px ${t.palette.primary.main}88`,
            }}
          />

          {/* Top circle marker */}
          <Box
            sx={{
              position: 'absolute',
              top: `calc(50% - ${(CENTER_MARK_H + 20) / 2}px)`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              pointerEvents: 'none',
              zIndex: 11,
              border: '2px solid #fff',
              boxShadow: (t) => `0 1px 4px ${t.palette.primary.main}aa`,
            }}
          />

          {/* Bottom circle marker */}
          <Box
            sx={{
              position: 'absolute',
              top: `calc(50% + ${(CENTER_MARK_H + 20) / 2}px)`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              pointerEvents: 'none',
              zIndex: 11,
              border: '2px solid #fff',
              boxShadow: (t) => `0 1px 4px ${t.palette.primary.main}aa`,
            }}
          />
        </div>
      </Box>

      {/* 3. Controls and Range Labels */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 1.5, px: 0.5 }}
      >
        <Typography variant="caption" color="text.tertiary" sx={{ minWidth: 80 }}>
          {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
          {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {/* Playback controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="-10 minutes">
            <IconButton
              size="small"
              onClick={() => stepTime(-1)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="mdi:chevron-left" width={18} />
            </IconButton>
          </Tooltip>

          <IconButton
            size="medium"
            onClick={onPlayToggle}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              width: 36,
              height: 36,
              boxShadow: (t) => `0 2px 8px ${t.palette.primary.main}44`,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            <Iconify icon={isPlaying ? 'mdi:pause' : 'mdi:play'} width={22} />
          </IconButton>

          <Tooltip title="+10 minutes">
            <IconButton
              size="small"
              onClick={() => stepTime(1)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Iconify icon="mdi:chevron-right" width={18} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography variant="caption" color="text.tertiary" align="right" sx={{ minWidth: 80 }}>
          {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
          {endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Stack>

      {/* Selected location address display */}
      {activeSnap?.address && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mt: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            textAlign: 'center',
            wordBreak: 'break-all',
          }}
        >
          📍 {activeSnap.address}
        </Typography>
      )}
    </Box>
  );
}
