// lib/motion/lerp.js
// Linear interpolation — for continuous per-frame smoothing (position,
// color, anything that should ease toward a target rather than snap to
// it). This is the first of the shared utilities from the motion
// playbook; mapRange, useScrollProgress, etc. land here as later
// sections need them, so nothing gets reinvented per-component.

export function lerp(start, end, t) {
  return start + (end - start) * t
}