// What git answers, read as rows. The refs come off one `for-each-ref`, and the
// paths and the contents come off one `cat-file --batch` each. Everything here
// takes text and answers rows, so it reaches nothing outside.
// [[spec/design_output/work#the-listing-reads-git-once]]

// A git object name stands beside a tree entry as bytes, and this many. [[spec/design_output/work#the-listing-reads-git-once]]
const NAME_BYTES = 20;
// A batch header reads `<name> <kind> <size>`, so the size stands here. [[spec/design_output/work#the-listing-reads-git-once]]
const SIZE_AT = 2;

// [[spec/design_output/work#the-listing-reads-git-once]]
export const REF_FORMAT =
  "%(refname:short) %(objectname) %(committerdate:unix) %(ahead-behind:origin/main)";

// A ref stands merged where it runs ahead of trunk by nothing. [[spec/design_output/work#the-listing-reads-git-once]]
export function refsIn(said) {
  return String(said ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [ref, tip, when, ahead] = row.split(/\s+/);
      return {
        branch: String(ref).replace(/^origin\//, ""),
        tip: String(tip ?? ""),
        when: Number(when) || 0,
        merged: ahead === "0",
      };
    })
    .filter((one) => one.tip);
}

// The batch answers a header a line, then the payload and a newline. [[spec/design_output/work#the-listing-reads-git-once]]
export function framed(stream, asks) {
  const said = String(stream ?? "");
  const out = new Map();
  let at = 0;
  for (const ask of asks) {
    const ends = said.indexOf("\n", at);
    if (ends < 0) break;
    const head = said.slice(at, ends).split(" ");
    at = ends + 1;
    const size = Number(head[SIZE_AT]);
    if (head.length <= SIZE_AT || !Number.isInteger(size)) {
      out.set(ask, "");
      continue;
    }
    out.set(ask, said.slice(at, at + size));
    at += size + 1;
  }
  return out;
}

// A raw payload reads as text once the bytes go back through the reader. [[spec/design_output/doors#a-raw-run-keeps-bytes]]
export function asText(raw) {
  return Buffer.from(String(raw ?? ""), "latin1").toString("utf8");
}

// A tree entry reads `<mode> <name>`, a zero byte, then the name of the object. [[spec/design_output/work#the-listing-reads-git-once]]
export function namesIn(tree) {
  const said = String(tree ?? "");
  const out = [];
  let at = 0;
  while (at < said.length) {
    const space = said.indexOf(" ", at);
    if (space < 0) break;
    const zero = said.indexOf("\0", space);
    if (zero < 0) break;
    out.push(said.slice(space + 1, zero));
    at = zero + 1 + NAME_BYTES;
  }
  return out;
}
