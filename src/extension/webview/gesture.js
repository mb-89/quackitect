// A click count picks a state. One press climbs one rung, five presses send
// the far value, and the dead window after a fire is what a person has to
// spend to reach it. The caller hands the time in, so a burst replays.
// [[spec/design_output/extension#a-gesture-picks-a-state]]

export const BURST = 1000;
export const DEAD = 600;
export const FAR = 5;

export function fresh() {
  return { began: -Infinity, count: 0, deadUntil: -Infinity };
}

export function pressed(held, at, one) {
  const state = at - held.began > BURST ? { ...fresh(), began: at } : { ...held };
  state.count += 1;

  const options = one?.options ?? [];
  const far = Number(one?.gesture ?? FAR);
  const climbs = state.count === 1;
  const sends = state.count === far && options.length > 2;

  if ((!climbs && !sends) || at < held.deadUntil) return { state, writes: undefined };
  return {
    state: { ...state, deadUntil: at + DEAD },
    writes: climbs ? oneRung(one, options) : options[2],
  };
}

function oneRung(one, options) {
  return one?.value === options[0] ? options[1] : options[0];
}
