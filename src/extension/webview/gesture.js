// A click count picks a state. One press turns a button on, and the count the
// declaration names turns it to its third. The window runs from the last press,
// so a person clicking five times at their own speed reaches the far end.
// [[spec/design_output/extension#a-gesture-picks-a-state]]

export const BURST = 800;
export const FAR = 5;

export function fresh() {
  return { began: -Infinity, last: -Infinity, count: 0 };
}

export function pressed(held, at, one) {
  const apart = at - (held.last ?? -Infinity);
  const state = apart > BURST ? { ...fresh(), began: at } : { ...held };
  state.count += 1;
  state.last = at;

  const options = one?.options ?? [];
  const far = Number(one?.gesture ?? FAR);

  if (state.count === 1) return { state, writes: oneRung(one, options) };
  if (state.count === far && options.length > 2) {
    return { state: { ...state, count: 0 }, writes: options[2] };
  }
  return { state, writes: undefined };
}

function oneRung(one, options) {
  return one?.value === options[0] ? options[1] : options[0];
}
