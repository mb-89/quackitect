// The Agent door. A call waiting on its helper holds the turn, so the door
// refuses it and names the background road.
// [[spec/design_output/level0#the-owners-prompt-comes-first]]

export function onAgent() {
  return { pass: true };
}
