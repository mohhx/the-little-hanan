// lib/preloaderState.js
// Shared "has the preloader finished" signal. Preloader.js dispatches a
// one-shot 'preloader:complete' window event, but components that mount
// slightly after it fires would otherwise miss it entirely and stay
// hidden forever. This module remembers whether it already fired, and
// includes a safety-net timeout in case the preloader is ever removed
// from the tree (or fails to mount) so content is never stuck invisible.

const FALLBACK_MS = 8000 // worst case: preloader's own MIN/MAX wait + zoom + fade

let complete = false

if (typeof window !== 'undefined') {
  window.addEventListener('preloader:complete', () => { complete = true }, { once: true })
  setTimeout(() => { complete = true }, FALLBACK_MS)
}

// Calls `callback` once the preloader has finished (or immediately if it
// already has). Returns an unsubscribe function for effect cleanup.
export function onPreloaderComplete(callback) {
  if (typeof window === 'undefined') return () => {}

  if (complete) {
    callback()
    return () => {}
  }

  let done = false
  const fire = () => {
    if (done) return
    done = true
    callback()
  }

  window.addEventListener('preloader:complete', fire, { once: true })
  const fallback = setTimeout(fire, FALLBACK_MS)

  return () => {
    window.removeEventListener('preloader:complete', fire)
    clearTimeout(fallback)
  }
}