// The manifest: many edits, many files, one atomic answer. Every op reads the
// file as the ops before it leave it, and one failure refuses the whole batch.
// [[spec/design_output/apply#validate-everything-then-write]]

export const OPS = ["", "exact", "create", "write", "append", "prepend", "regex"];
export const PATCH = "patch";
export const REPLACE = "replace";

// [[spec/design_output/apply#validate-everything-then-write]]
export function patchSpec() {
  return {
    name: PATCH,
    description: [
      "Edits files: many ops, many files, one atomic call. Every op reads the",
      "file as the ops before it leave it, and one failure refuses the whole",
      "manifest with nothing written. Level zero journals what every file held,",
      "so `undo` puts it all back. Bytes in, bytes out: a file keeps its own",
      "line endings, and text that reads a line ending differently finds",
      "nothing. Ops: exact {file, old, new, replace_all} · create {file, new} ·",
      "write {file, new} · append or prepend {file, new} · regex {file,",
      "pattern, replacement, flags, expect_count}.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        ops: {
          type: "array",
          items: {
            type: "object",
            properties: {
              file: { type: "string" },
              op: { type: "string", enum: OPS.filter(Boolean) },
              old: { type: "string" },
              new: { type: "string" },
              replace_all: { type: "boolean" },
              pattern: { type: "string" },
              replacement: { type: "string" },
              flags: { type: "string" },
              expect_count: { type: "number" },
            },
            required: ["file"],
          },
        },
        on: { type: "string", description: "what this change is for, which undo takes back" },
        preview: { type: "boolean", description: "answer what would land and write nothing" },
      },
      required: ["ops"],
    },
  };
}

// [[spec/design_output/apply#a-pattern-matching-nothing]]
export function replaceSpec() {
  return {
    name: REPLACE,
    description: [
      "One regex over every file a glob reaches, in one atomic call. `patch` is",
      "the scalpel for a path you hold; this is the sweep for a rename running",
      "through the tree. The index answers which files carry the pattern, so",
      "the sweep costs no walk. A pattern matching nothing is a refusal, and",
      "expect_count refuses unless the total across the tree is exactly that.",
      "Level zero journals every file, so `undo` puts the sweep back.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        glob: { type: "string", description: "which files to sweep, such as **/*.js" },
        pattern: { type: "string" },
        replacement: { type: "string" },
        flags: { type: "string", description: "flags out of i m s, with g implied" },
        expect_count: { type: "number" },
        on: { type: "string" },
        preview: { type: "boolean" },
      },
      required: ["glob", "pattern", "replacement"],
    },
  };
}

// [[spec/design_output/apply#bytes-in-bytes-out]]
export function filesIn(ops) {
  const out = [];
  for (const one of ops ?? []) {
    const path = String(one?.file ?? "").trim();
    if (path && !out.includes(path)) out.push(path);
  }
  return out;
}

// [[spec/design_output/apply#validate-everything-then-write]]
export function applied(held, ops) {
  const list = Array.isArray(ops) ? ops : [];
  if (!list.length) return refused("an apply with no edits: say what to change");

  const now = new Map();
  const was = new Map();
  const born = new Set();
  const order = [];
  const counts = {};

  for (let i = 0; i < list.length; i++) {
    const one = list[i] ?? {};
    const at = `edit ${i + 1}`;
    const path = String(one.file ?? "").trim();
    if (!path) return refused(`${at} names no file`);

    const said = held?.[path];
    if (!now.has(path)) {
      order.push(path);
      if (said?.exists) {
        now.set(path, String(said.text ?? ""));
        was.set(path, String(said.text ?? ""));
      } else {
        now.set(path, "");
        born.add(path);
      }
    }

    const took = oneOp(one, now.get(path), born.has(path), `${at} (${path})`);
    if (took.why) return refused(took.why);
    now.set(path, took.text);
    counts[path] = (counts[path] ?? 0) + took.hits;
  }

  const files = order.map((path) => ({
    file: path,
    was: born.has(path) ? "" : was.get(path),
    made: now.get(path),
    born: born.has(path),
  }));
  return { ok: true, files, counts };
}

function refused(why) {
  return { ok: false, why };
}

// [[spec/design_output/apply#the-five-verbs]]
function oneOp(one, text, absent, at) {
  const kind = String(one.op ?? "").trim() || "exact";
  const made = String(one.new ?? "");

  if (kind === "create") {
    if (!absent) return { why: `${at}: create over a file that stands. Use an exact edit, or op write` };
    if (!made) return { why: `${at}: create with no content` };
    return { text: made, hits: 1 };
  }
  if (kind === "write") {
    if (!made) return { why: `${at}: write with no content. To empty a file, say so with an exact edit` };
    return { text: made, hits: 1 };
  }
  if (absent) return { why: `${at}: no file stands here. Use op create` };

  if (kind === "append") return { text: text + made, hits: 1 };
  if (kind === "prepend") return { text: made + text, hits: 1 };
  if (kind === "regex") return byPattern(one, text, at);
  if (kind === "exact") return byText(one, text, made, at);
  return { why: `${at}: no op called ${kind}. The ops are ${OPS.filter(Boolean).join(", ")}` };
}

function byText(one, text, made, at) {
  const old = String(one.old ?? "");
  if (!old) return { why: `${at}: an exact edit takes the text to find` };

  const found = countOf(text, old);
  if (found === 0) {
    return { why: `${at}: the text stands nowhere in the file. Read it and copy the bytes exactly` };
  }
  if (found > 1 && one.replace_all !== true) {
    return { why: `${at}: the text stands ${found} times. Widen it, or say replace_all` };
  }
  if (one.replace_all === true) return { text: text.split(old).join(made), hits: found };
  return { text: text.replace(old, made), hits: 1 };
}

// [[spec/design_output/apply#a-pattern-matching-nothing]]
function byPattern(one, text, at) {
  const pattern = String(one.pattern ?? "");
  if (!pattern) return { why: `${at}: a regex edit takes a pattern` };

  const flags = `${String(one.flags ?? "").replace(/[^ims]/g, "")}g`;
  let shape;
  try {
    shape = new RegExp(pattern, flags);
  } catch (bad) {
    return { why: `${at}: the pattern compiles to nothing: ${bad?.message ?? bad}` };
  }

  const hits = (text.match(shape) ?? []).length;
  if (hits === 0) return { why: `${at}: the pattern matches nothing in the file` };

  const wanted = one.expect_count;
  if (wanted !== undefined && Number(wanted) !== hits) {
    return { why: `${at}: the pattern matches ${hits} times, and expect_count says ${wanted}` };
  }
  return { text: text.replace(shape, String(one.replacement ?? "")), hits };
}

function countOf(text, old) {
  let n = 0;
  let at = text.indexOf(old);
  while (at >= 0) {
    n += 1;
    at = text.indexOf(old, at + old.length);
  }
  return n;
}
