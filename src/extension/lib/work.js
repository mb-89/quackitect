// The strings behind the work group's buttons. The sidebar runs them through
// the door, and every choice here reads a string, so a test holds it with no
// editor running.
// [[spec/tickets/the-work-group-draws-buttons]]

const RUNME = "./RUNME.sh";
// A ticket's name is its file's name, in the lower-case words the ticket folder holds. [[spec/tickets/the-work-group-draws-buttons]]
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HOLE = "<name>";

// A config line opens on the RUNME head, and a verb takes the words past it. [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]
function lineArgvOf(line) {
  const words = String(line ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words[0] === RUNME ? words.slice(1) : words;
}

function jsonIn(ran) {
  if (Number(ran?.code ?? 0) !== 0) return null;
  try {
    return JSON.parse(String(ran?.out ?? "").trim());
  } catch {
    return null;
  }
}

// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]
function countIn(ran) {
  const answer = jsonIn(ran);
  // The index answers a bare count, and a verb a count object. [[spec/tickets/the-count-chain-leaves]]
  const said = Number.isInteger(answer) ? answer : answer?.count;
  return Number.isInteger(said) ? said : undefined;
}

// [[spec/design_input/the-editor-draws-the-ticket#the-work-group]]
function nextIn(ran) {
  const said = jsonIn(ran);
  if (!said?.ticket || !said?.path) return null;
  return { ticket: String(said.ticket), path: String(said.path) };
}

// The value name a button's `counts` line asks the index for. [[spec/tickets/the-sidebar-reads-v1]]
function nameIn(counts) {
  return /"name"\s*:\s*"([^"]+)"/.exec(String(counts ?? ""))?.[1];
}

function ticketPathOf(opens, name) {
  const said = String(name ?? "").trim();
  if (!NAME.test(said)) return "";
  return String(opens ?? "")
    .split(HOLE)
    .join(said);
}

// NEW_TICKET moves to the ticket verb in src/scripts/ticket.js, which tickets/new runs. [[spec/tickets/the-sidebar-writes-through-actions]]
module.exports = { countIn, lineArgvOf, nameIn, nextIn, ticketPathOf };
