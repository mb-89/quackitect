// A press count picks a state. The first press of a burst moves one rung, the
// next ones stand by, and the count the declaration names reaches the far end.
// The host holds the count, because a redraw hands the page a fresh script.
// [[spec/design_output/extension#a-gesture-picks-a-state]]

const BURST = 800;
const DEAD = 600;
const FAR = 5;

function fresh() {
  return { last: -Infinity, count: 0, deadUntil: -Infinity };
}

function pressed(held, at, one) {
  if (at < (held?.deadUntil ?? -Infinity))
    return { state: held, writes: undefined, how: "" };
  const apart = at - (held?.last ?? -Infinity);
  const state = apart > BURST ? fresh() : { ...held };
  state.count += 1;
  state.last = at;

  const options = (one?.options ?? []).map((each) => String(each));
  const far = Number(one?.gesture ?? FAR);

  if (state.count === 1)
    return { state, writes: oneRung(one, options), how: "one press" };
  if (state.count === far && options.length > 2) {
    return {
      state: { ...fresh(), deadUntil: at + DEAD },
      writes: options[2],
      how: `${far} presses`,
    };
  }
  return { state, writes: undefined, how: "" };
}

function oneRung(one, options) {
  return String(one?.value) === options[0] ? options[1] : options[0];
}

module.exports = { BURST, DEAD, FAR, fresh, pressed };
