// One hash over a text, so a stamp says whether a source moved.
// [[spec/design_input/the-agent-pulls-tickets#the-drawing-is-a-projection]]

const FNV = { offset: 0x811c9dc5, prime: 0x01000193 };
const MIX = { seed: 0x9e3779b9, prime: 0x85ebca6b, rotate: 13 };
const WORD = 32;
const HEX = 16;
const LANE = 8;

export function hashText(text) {
  let low = FNV.offset;
  let high = MIX.seed;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    low = Math.imul(low ^ code, FNV.prime) >>> 0;
    high = Math.imul(high + code + 1, MIX.prime) >>> 0;
    high = ((high << MIX.rotate) | (high >>> (WORD - MIX.rotate))) >>> 0;
  }
  return `${low.toString(HEX).padStart(LANE, "0")}${high.toString(HEX).padStart(LANE, "0")}`;
}
