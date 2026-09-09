// Proposed file changes, decoded before a tool reaches disk.
// [[spec/design_output/copilot#the-write-door]]

const CREATE = new Set(["create_file", "create", "Write"]);
const EDIT = new Set(["replace_string_in_file", "edit", "Edit", "str_replace_editor"]);

export function mutations(event, read) {
  const { tool, args } = event;
  if (tool === "apply_patch") return patchChanges(args.input ?? args.patch, read);
  if (tool === "multi_replace_string_in_file") {
    if (!Array.isArray(args.replacements)) throw new Error("Missing replacements.");
    const held = new Map();
    for (const one of args.replacements) {
      const change = replacement(one, (path) => held.get(path) ?? read(path));
      held.set(change.path, change.text);
    }
    return [...held].map(([path, text]) => ({ path, text }));
  }
  if (CREATE.has(tool)) {
    const path = args.filePath ?? args.file_path ?? args.path;
    if (typeof path !== "string" || typeof args.content !== "string") {
      throw new Error("The write needs a path and content.");
    }
    return [{ path, text: args.content }];
  }
  if (EDIT.has(tool)) return [replacement(args, read)];
  if (/edit|replace|patch|notebook|rename|create.*file|delete.*file/i.test(tool)) {
    throw new Error(
      "Use create_file, replace_string_in_file, or an exact apply_patch.",
    );
  }
  return [];
}

function replacement(args, read) {
  const path = args.filePath ?? args.file_path ?? args.path;
  const before = args.oldString ?? args.old_string ?? args.old_str;
  const after = args.newString ?? args.new_string ?? args.new_str;
  if (
    typeof path !== "string" ||
    typeof before !== "string" ||
    !before ||
    typeof after !== "string"
  ) {
    throw new Error("Use an exact, nonempty old string and a replacement string.");
  }
  return { path, text: replaceOnce(read(path), before, after) };
}

function replaceOnce(text, before, after) {
  const at = text.indexOf(before);
  if (at < 0 || text.indexOf(before, at + 1) >= 0) {
    throw new Error("The edit needs unique matching context. Read the file and retry.");
  }
  return text.slice(0, at) + after + text.slice(at + before.length);
}

export function patchChanges(patch, read) {
  if (typeof patch !== "string") throw new Error("Missing patch text.");
  const lines = patch.replace(/\r\n/g, "\n").trimEnd().split("\n");
  if (lines.shift() !== "*** Begin Patch" || lines.pop() !== "*** End Patch") {
    throw new Error("Use a complete Begin Patch / End Patch envelope.");
  }
  const changes = new Map();
  while (lines.length) {
    const match = /^\*\*\* (Add|Update|Delete) File: (.+)$/.exec(lines.shift());
    if (!match)
      throw new Error("Unsupported patch operation. Use an exact replacement.");
    const [, kind, path] = match;
    const body = [];
    while (lines.length && !lines[0].startsWith("*** ")) body.push(lines.shift());
    if (kind === "Delete") {
      if (body.length) throw new Error("Unexpected content after a deletion.");
      changes.set(path, null);
      continue;
    }
    if (kind === "Add") {
      if (body.some((line) => !line.startsWith("+")))
        throw new Error("Invalid added file.");
      changes.set(path, `${body.map((line) => line.slice(1)).join("\n")}\n`);
      continue;
    }
    let text = changes.has(path) ? changes.get(path) : read(path);
    if (typeof text !== "string") throw new Error("Cannot update a deleted file.");
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    let before = [];
    let after = [];
    const flush = () => {
      if (!before.length && !after.length) return;
      if (!before.length) throw new Error("An insertion needs existing context.");
      const rows = text.split(eol);
      const matches = [];
      for (let index = 0; index <= rows.length - before.length; index++) {
        if (before.every((line, offset) => rows[index + offset] === line))
          matches.push(index);
      }
      if (matches.length !== 1)
        throw new Error(
          "The patch needs unique matching lines. Read the file and retry.",
        );
      rows.splice(matches[0], before.length, ...after);
      text = rows.join(eol);
      before = [];
      after = [];
    };
    for (const line of body) {
      if (line.startsWith("@@")) {
        flush();
        continue;
      }
      if (!/^[ +\-]/.test(line))
        throw new Error("Unsupported patch line. Use exact context.");
      if (line[0] !== "+") before.push(line.slice(1));
      if (line[0] !== "-") after.push(line.slice(1));
    }
    flush();
    changes.set(path, text);
  }
  return [...changes].map(([path, text]) => ({ path, text }));
}
