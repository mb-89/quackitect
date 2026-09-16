// The to-do flag. A hand parks work for later by tagging a note, and the tag
// holds on this box alone. Every check reads strings alone, so a caller hands
// the texts in.
// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]

import { readNote } from "./schema.js";

export const TODO = "todo";

const NOTE = ".md";

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function isTagged(text) {
  return readNote(text).front.said?.[TODO] === true;
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function reaches(name) {
  return String(name ?? "").endsWith(NOTE);
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function taggedIn(files) {
  return [files ?? []]
    .flat()
    .filter((one) => reaches(one?.name) && isTagged(one?.text))
    .map((one) => String(one.name));
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function taggedFirst(tickets) {
  const held = [tickets ?? []].flat().filter(Boolean);
  return [
    ...held.filter((one) => isTagged(one?.text)),
    ...held.filter((one) => !isTagged(one?.text)),
  ];
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function refusedTodo(names) {
  return [
    `A tagged note parks work on this box, and this push carries ${names.length}.`,
    "",
    ...names.map((one) => `  ${one}`),
    "",
    "Run `./RUNME.sh ticket todo <name> --off` on each, and push again. A commit",
    "carries the tag, because the push is the one gate the tag meets.",
  ].join("\n");
}
