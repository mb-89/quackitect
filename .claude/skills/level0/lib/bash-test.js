// The test-run reader: a whole-suite run names no file, so the door refuses it.
// [[spec/design_output/bash#a-test-run-points-somewhere]]

import { partsOf, wordsIn } from "./bash.js";
import { baseName } from "./tokens.js";

const RUNNERS = new Set(["npm", "pnpm", "yarn", "bun"]);

// [[spec/design_output/bash#a-test-run-points-somewhere]]
export function testIn(command) {
  const out = [];
  for (const one of partsOf(command).segments) {
    const words = wordsIn(one);
    const name = baseName(words[0]);
    const args = words.slice(1);

    if (name === "node" && args.includes("--test") && !narrowed(args)) {
      out.push(words.join(" "));
      continue;
    }
    const suite = wholeSuite(args);
    if (RUNNERS.has(name) && suite.whole && !narrowed(suite.rest)) {
      out.push(words.join(" "));
    }
  }
  return out;
}

function narrowed(args) {
  return args.some(
    (one) =>
      (!one.startsWith("-") && one !== "--" && one !== "--test") ||
      one.startsWith("--test-name-pattern") ||
      one.startsWith("--test-only"),
  );
}

function wholeSuite(args) {
  const bare = args.filter((one) => !one.startsWith("-"));
  const took =
    bare[0] === "run" && bare[1] === "test"
      ? 2
      : bare[0] === "test" || bare[0] === "t"
        ? 1
        : 0;
  if (!took) return { whole: false, rest: [] };
  return {
    whole: true,
    rest: args.filter((one) => !bare.slice(0, took).includes(one)),
  };
}
