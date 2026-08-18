// lib/store/navLoaderStore.js
// Drives the MiniPreloader (floral fill transition). `start()` is called
// the moment a navigation is *initiated* — either an internal <Link> click
// caught by NavigationWatcher, or an explicit call right before a
// programmatic router.push() (login redirect, ProductForm save/cancel).
// `finish()` is only called once the new route has actually committed
// (pathname/searchParams change observed by NavigationWatcher), so the
// visible duration reflects real readiness, not a guessed timer.
//
// The `gen` counter guards against a stale finish: if navigation A starts,
// then navigation B starts before A's route change is observed, A's
// eventual (now-irrelevant) signal must not finish B's transition early.

import { create } from 'zustand'

export const useNavLoaderStore = create((set, get) => ({
  active: false,
  gen: 0,

  start: () => {
    const nextGen = get().gen + 1
    set({ active: true, gen: nextGen })
    return nextGen
  },

  // `forGen` is the token returned by the start() call this finish is
  // responding to — if a newer navigation has started since, this finish
  // is stale and must be ignored.
  finish: (forGen) => {
    if (forGen !== undefined && forGen !== get().gen) return
    set({ active: false })
  },
}))