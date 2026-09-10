// A click count picks a state. One press climbs one rung, five presses send
// the far value, and a press away from rest falls back to rest. The caller
// hands the time in, so a burst replays in a test.
// [[spec/design_output/extension#a-gesture-picks-a-state]]

export const BURST = 1000;
export const DEAD = 600;
export const FAR = 5;

export function fresh() {
  return { began: -BURST, count: 0, deadUntil: -DEAD };
}

export function pressed(held, at, one) {
  const state = at - held.began > BURST ? { ...fresh(), began: at } : { ...held };
  state.count += 1;

  const options = one?.options ?? [];
  const far = Number(one?.gesture ?? FAR);

  if (state.count === far && options.length > 2) {
    return { state: { ...state, deadUntil: at + DEAD }, writes: options[2] };
  }
  if (state.count !== 1 || at < held.deadUntil) return { state, writes: undefined };

  const rest = options[0];
  return {
    state: { ...state, deadUntil: at + DEAD },
    writes: one?.value === rest ? options[1] : rest,
  };
}
