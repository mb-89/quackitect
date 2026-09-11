// The journal an undo reads. It holds both halves of every file, so drift
// refuses the restore and the text comes back out of the entry itself.
// [[spec/design_output/apply#the-journal-holds-both-halves]]

export const FOLDER = ".se/undo";
export const UNDO = "undo";

// [[spec/design_output/apply#drift-refuses-the-restore]]
export function undoSpec() {
  return {
    name: UNDO,
    description: [
      "Puts back what the newest patch or replace wrote. It takes back its own",
      "change: name the same `on` the apply carried, and it walks past every",
      "entry another actor wrote. It stands all or nothing. Every file is read",
      "against what the apply left before anything comes back, so a file that",
      "moves since refuses the whole restore and nothing changes.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        on: { type: "string", description: "the change to take back, as the apply named it" },
      },
    },
  };
}

// [[spec/design_output/apply#an-entry-says-whose-apply]]
export function journalOf(at, on, by, files) {
  return {
    on: String(on ?? ""),
    by: String(by ?? ""),
    at: String(at ?? ""),
    files: (files ?? []).map((one) => ({
      file: one.file,
      was: one.born ? "" : one.was,
      made: one.made,
      did_not_exist: Boolean(one.born),
    })),
  };
}

// [[spec/design_output/apply#the-entry-names-its-time]]
export function nameOf(at) {
  const said = String(at ?? "").replace(/[^0-9]/g, "");
  return `${said.padEnd(20, "0").slice(0, 20)}.json`;
}

// [[spec/design_output/apply#an-entry-says-whose-apply]]
export function newestOn(names, entries, on) {
  const sorted = [...(names ?? [])].sort();
  for (let i = sorted.length - 1; i >= 0; i--) {
    const held = entries?.[sorted[i]];
    if (!held?.files) continue;
    if (!on || held.on === on) return { name: sorted[i], entry: held };
  }
  return null;
}

// [[spec/design_output/apply#drift-refuses-the-restore]]
export function restores(entry, held) {
  const files = entry?.files ?? [];
  if (!files.length) return { ok: false, why: "the entry names no file" };

  for (const one of files) {
    const said = held?.[one.file];
    if (!said?.exists) {
      if (one.did_not_exist) continue;
      return {
        ok: false,
        why: `undo refused: ${one.file} reads as absent since the apply. Put it back, then undo`,
      };
    }
    if (String(said.text) !== String(one.made)) {
      return {
        ok: false,
        why: `undo refused: ${one.file} moves since the apply. Somebody's work would go, so nothing comes back`,
      };
    }
  }

  const writes = [];
  const removes = [];
  for (const one of files) {
    if (one.did_not_exist) removes.push(one.file);
    else writes.push({ file: one.file, text: one.was });
  }
  return { ok: true, writes, removes };
}
