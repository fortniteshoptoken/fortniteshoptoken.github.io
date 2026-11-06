"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const storageKey = "fortnite-shop-token.chest-counter.v1";
const empty = { chests: 0, matches: 0 };
const subscribe = () => () => {};
type Counts = typeof empty;

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function readCounter() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        const counts = JSON.parse(saved);
        if (isCount(counts?.chests) && isCount(counts?.matches)) {
          return { counts: { chests: counts.chests, matches: counts.matches }, saved: true };
        }
      } catch {
        // An invalid previous value can be replaced by the next counter action.
      }
    }
    return { counts: empty, saved: true };
  } catch {
    return { counts: empty, saved: false };
  }
}

export function ChestCounter() {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return <Counter key={String(ready)} ready={ready} />;
}

function Counter({ ready }: { ready: boolean }) {
  const [{ counts, saved }, setCounter] = useState(() => ready ? readCounter() : { counts: empty, saved: true });
  const [confirming, setConfirming] = useState(false);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) confirmButton.current?.focus();
  }, [confirming]);

  function update(next: Counts) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      setCounter({ counts: next, saved: true });
    } catch {
      setCounter({ counts: next, saved: false });
    }
  }

  function adjust(field: keyof Counts, delta: number) {
    const value = counts[field] + delta;
    if (isCount(value)) update({ ...counts, [field]: value });
  }

  function closeConfirmation(reset: boolean) {
    if (reset) update(empty);
    setConfirming(false);
    resetButton.current?.focus();
  }

  const average = counts.matches === 0 ? "N/A" : (counts.chests / counts.matches).toFixed(1);
  const button = "button-secondary justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

  return (
    <section id="chest-counter" aria-labelledby="chest-counter-title" className="content-card">
      <h2 id="chest-counter-title">Your Chest Counter</h2>
      <p>Personal tracker · Not connected to Epic Games · No official drop-rate feed</p>
      <dl className="mt-5 grid grid-cols-3 gap-3" aria-live="polite" aria-atomic="true">
        <div><dt>Chests</dt><dd className="text-xl font-bold tabular-nums break-words">{counts.chests}</dd></div>
        <div><dt>Matches</dt><dd className="text-xl font-bold tabular-nums break-words">{counts.matches}</dd></div>
        <div><dt>Chests per match</dt><dd className="text-xl font-bold tabular-nums break-words">{average}</dd></div>
      </dl>
      <div className="mt-5 grid max-w-lg grid-cols-2 gap-3">
        <button type="button" className={button} disabled={!ready || counts.chests === Number.MAX_SAFE_INTEGER} onClick={() => adjust("chests", 1)}>+1 chest</button>
        <button type="button" className={button} disabled={!ready || counts.chests === 0} onClick={() => adjust("chests", -1)}>-1 chest</button>
        <button type="button" className={button} disabled={!ready || counts.matches === Number.MAX_SAFE_INTEGER} onClick={() => adjust("matches", 1)}>+1 match</button>
        <button type="button" className={button} disabled={!ready || counts.matches === 0} onClick={() => adjust("matches", -1)}>-1 match</button>
      </div>
      <p role="status">{ready ? (saved ? "Counts are stored only in this browser." : "Counts are not saved. Browser storage is unavailable, so refreshing may lose changes.") : null}</p>
      <noscript>Enable JavaScript to use the counter. You can still read the guide below.</noscript>
      <button type="button" className={`${button} mt-4`} ref={resetButton} disabled={!ready} onClick={() => setConfirming(true)}>Reset counts</button>
      {confirming ? (
        <div className="mt-4 border-t border-border pt-3" role="group" aria-labelledby="confirm-reset-label">
          <p id="confirm-reset-label">Reset both counters to zero?</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className={button} ref={confirmButton} onClick={() => closeConfirmation(false)}>Cancel</button>
            <button type="button" className={button} onClick={() => closeConfirmation(true)}>Yes, reset counts</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
