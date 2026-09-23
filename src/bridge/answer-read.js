// The reading of one answer: the draft tool runs it, and the stop door runs it
// over the turn's last text, holding a draft past the ceiling.
// [[spec/design_output/level0#the-gate-reads-the-answer]]

export async function readsAnswer(box, text, stop) {
  return { found: [], score: 0, band: "clean" };
}

export async function gatesAnswer(e, box) {
  return null;
}
