// Game loop runs outside React to avoid stale closure issues.
// The tick callback is injected from App so we avoid circular deps.

let intervalId: ReturnType<typeof setInterval> | null = null
const TICK_RATE = 100 // ms

export function startGameLoop(tick: (now: number) => void): void {
  if (intervalId !== null) return
  intervalId = setInterval(() => tick(Date.now()), TICK_RATE)
}

export function stopGameLoop(): void {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}
