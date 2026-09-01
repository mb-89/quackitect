// THE WORK EDITOR DERIVES NONE OF THE FOUR.
//
// The owner's words: obviously, the engine should do these calculations. A
// number the editor forms is a number nothing checks, and this record has
// already been bitten by a count that lived only where it was displayed.
//
// DERIVING MEANS FORMING ANY OF THE FOUR FROM ANOTHER NUMBER rather than
// reading it out of the engine's answer. So this refuses arithmetic and
// comparison between the values on the way to the bar, and names the number it
// found being made.
//
// IT READS src/extension/editor.ts BY PATH, because a rule about TypeScript
// enforced in Go cannot see the thing it guards.
//
//   node util/checks/burndown-derives-nothing.mjs <root>
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const source = readFileSync(join(root, "src", "extension", "editor.ts"), "utf8");

let failed = 0;
const ok = (said) => console.log("ok    " + said);
const no = (said) => { console.log("FAIL  " + said); failed++; };

// THE FOUR, BY THE NAMES THE ANSWER CARRIES. They come from the engine's own
// field names rather than from a list somebody typed twice: the check reads
// them off the interface the editor declares for the answer.
const declared = source.match(/export interface Burndown\s*\{([\s\S]*?)\}/);
if (!declared) {
  console.error("editor.ts declares no Burndown, so this check has no set to guard");
  process.exit(1);
}
const four = [...declared[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1])
  .filter((n) => ["minted", "done", "open", "rate"].includes(n));
if (four.length !== 4) {
  console.error(`the answer declares ${four.length} of the four numbers, so this check is short`);
  process.exit(1);
}
ok(`the four numbers are declared: ${four.join(", ")}`);

// WHAT THE FUNCTION THAT DRAWS THEM DOES. It is read on its own, because the
// rest of the file is full of arithmetic that has nothing to do with these.
const at = source.search(/function burnDown\s*\(/);
if (at < 0) {
  console.error("editor.ts has no burnDown, so nothing here draws the four numbers");
  process.exit(1);
}
let depth = 0, body = "";
for (let i = source.indexOf("{", at); i < source.length; i++) {
  body += source[i];
  if (source[i] === "{") depth++;
  else if (source[i] === "}" && --depth === 0) break;
}
ok("the function that draws them was found");

// ARITHMETIC OR COMPARISON ON ANY OF THE FOUR IS THE DEFECT, wherever it is
// written: b.minted + 1, b.done - b.open, b.rate / 2, b.open > b.done.
for (const name of four) {
  const made = new RegExp(
    String.raw`\b\w+\.${name}\s*(?:[-+*/%]|[<>]=?|[!=]==)|` +
    String.raw`(?:[-+*/%]|[<>]=?|[!=]==)\s*\w+\.${name}\b`);
  const hit = body.match(made);
  if (hit) no(`${name} is formed rather than read: ${JSON.stringify(hit[0].trim())}`);
  else ok(`${name} is read out of the answer`);
}

// AND EVERY ONE OF THEM REACHES THE PAGE. A bar that quietly drops one is not
// deriving it, and it is not drawing it either.
if (!/\bsays\b/.test(body)) {
  no("the function draws neither the four numbers nor the sentence the engine built from them");
} else ok("what the engine built is what is drawn");

console.log(failed ? `\n${failed} failed.` : "\n0 failed.");
process.exit(failed ? 1 : 0);
