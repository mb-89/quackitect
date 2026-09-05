// EACH KIND OF BOX IS HANDED ITS OWN CARD, AND TOLD WHICH KIND IT IS.
//
// A cloud session had to be briefed by hand, in a message pasted by the owner,
// because nothing in the tree told it what a cloud box has to do differently.
// A brief that lives in a person's clipboard is one nobody maintains and every
// session gets a different version of.
//
// SO THE WAKE HANDS IT OVER, and the harness adds a SessionStart hook's own
// output to the agent's context. That is the whole delivery, and this check is
// what holds it together: a card the wake never prints reaches nobody, and a
// card naming a call the gate refuses is a brief that cannot be followed.
//
// AND A DESK MUST NOT READ THE CLOUD'S CARD. The two are handed different
// things, so a session that does not know which it is can follow the wrong one.
// Both are told, and the cloud card says on its face who it is for.
//
// WHAT IT DOES NOT DO: judge the prose. The voice checks own that. This asks
// whether the delivery works and whether the calls named in it are legal.
//
//   node util/checks/the-cards-reach-their-box.mjs <root>
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";

let bad = 0;
const say = (what, ok, why) => {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
};

const read = (rel) => {
  try {
    return readFileSync(join(root, rel), "utf8");
  } catch {
    return "";
  }
};

const wake = read("util/cage/session-start.sh");
const cloudCard = "util/cage/cloud-runner.md";
const card = read(cloudCard);

say("the wake is there to hand anything over", wake !== "",
  "util/cage/session-start.sh could not be read, so nothing is delivered at all");
say("the cloud card is there", card !== "", cloudCard + " could not be read");

// THE DELIVERY. The wake prints the card, and it does it on the cloud side of
// the branch that tells the two boxes apart.
say("the wake prints the cloud card", wake.includes(cloudCard),
  "nothing in the wake names " + cloudCard + ", so a cloud session is handed nothing");
say("the wake asks one door where it is", wake.includes("util/cage/host.mjs --cloud"),
  "the wake decides which box this is by some other means, so hosts.json is not the one table");
say("and a desk is told which it is", /--cloud; then[\s\S]*say /.test(wake) || /if ! node[\s\S]*?say /.test(wake),
  "the wake returns on a desk without saying so, and a session that is told nothing "
  + "can read the cloud card and follow it");

// THE CARD SAYS WHO IT IS FOR, in its first lines, where a reader cannot miss it.
say("the cloud card names its box in its heading", /^#\s.*CLOUD BOX/m.test(card),
  "its heading does not say it is for a cloud box, so a desk session that opens "
  + "it has nothing telling it to stop reading");

// EVERY CALL IT NAMES IS ONE THE GATE ADMITS. The write gate lets a command
// through when the engine is the first word and no pipe, redirection, second
// command or substitution took it out of the exception. A brief that prescribes
// a refused command is the defect this whole card exists to end: the gate's own
// refusal used to do exactly that.
const engineCalls = card.split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.startsWith("./RUNME.sh") || l.startsWith("node util/cage/"));
say("the cloud card names calls to judge (" + engineCalls.length + ")", engineCalls.length > 0,
  "it prescribes no command at all, so a session with no lane is told nothing to type");
for (const call of engineCalls) {
  // A PLACEHOLDER IS A WORD TO REPLACE, NOT A REDIRECTION. The card writes the
  // id and the name as <id> and <name>, and the gate reads an angle bracket
  // either way, so they are filled in the way an agent would type them before
  // the command is judged. src/engine/nopipe_test.go does the same for the
  // doors a refusal names, and for the same reason.
  const typed = call.replace(/<[^>]*>/g, "wk-1111111111");
  const outside = /[|;&]|[<>]|\$\(|`/.exec(typed);
  say("the call is one the gate admits: " + call, outside === null,
    "it carries " + JSON.stringify(outside?.[0]) + ", which takes a command out of the "
    + "engine's exception, so the gate refuses the very call this card prescribes");
}

// AND EVERY FILE IT NAMES IS THERE. A card pointing at a script that moved is a
// session told to run nothing.
const named = [...card.matchAll(/\b(util\/[\w./-]+\.(?:mjs|json|md|sh))\b/g)].map((m) => m[1]);
say("the cloud card names files to resolve (" + new Set(named).size + ")", named.length > 0,
  "it names no file, so nothing in it can be checked against the tree");
for (const rel of new Set(named)) {
  say(rel + " is in the tree", existsSync(join(root, rel)),
    "the card sends a session to a file that is not here");
}

// THE STANDING LAYER SAYS THERE ARE TWO KINDS. Every session reads the preamble,
// so it is where a reader learns that a card exists which was not handed to it.
const preamble = read("util/cage/first-turn.md");
say("the preamble tells every session there are two kinds of box",
  preamble.includes(cloudCard) && /host\.mjs --say/.test(preamble),
  "util/cage/first-turn.md does not name the cloud card and the door that answers "
  + "which box this is, so a session meeting that file has no way to place it");

console.log("\n" + bad + " failed.");
process.exit(bad ? 1 : 0);
