// The tree the ticket cases drive: a fake disk holding the ticket schema and
// the note and trivial routes, and the catch of what a verb prints.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]

import { join } from "node:path";
import { fakeDisk } from "../../src/doors/fake/disk.js";

export const ROOT = "/tree";
export const at = (path) => join(ROOT, ...path.split("/"));

export function heard(what) {
  const lines = [];
  const wasLog = console.log;
  const wasError = console.error;
  console.log = (...said) => lines.push(said.join(" "));
  console.error = (...said) => lines.push(said.join(" "));
  try {
    return { code: what(), said: lines.join("\n") };
  } finally {
    console.log = wasLog;
    console.error = wasError;
  }
}

export const NOTE_PROCESS = `for: a thing to look at later
ask:
  - name: line
    form: text
    says: the smallest case that shows it
steps:
  - name: decide
    does: says what the note becomes
    from: anyone
    by: retro
    to: retro
    input: ask
    evidence:
      - name: outcome
        form: text
        says: what the note becomes
`;

export const TRIVIAL_PROCESS = `for: a fix small enough that the ask is the design
steps:
  - name: do
    does: makes the change
    to: retro
    evidence:
      - name: says
        form: text
        says: what changes and why
`;

// [[spec/design_output/doors#a-fake-behaves]]
export const TICKET_SCHEMA = `kind: ticket

governs:
  - .se/tickets/**

frontmatter:
  type: object
  additionalProperties: false
  required: [kind, state, urgency, steps]
  properties:
    kind:
      const: ticket
      x-link: true
      description: the schema this note is minted from
    state:
      enum: [draft, open, closed]
      description: whether anybody pulls it
    urgency:
      enum: [now, soon, whenever]
      description: which ticket the pull hands out first
    todo:
      type: boolean
      description: whether a hand parks this note here
    group:
      type: string
      description: the branch this ticket lands on
    step:
      type: string
      x-names: steps
      x-leaf: true
      description: the leaf of the route this ticket stands on
    steps:
      type: array
      description: the route, as a tree of steps
      items:
        type: object
        additionalProperties: false
        required: [name]
        properties:
          name:
            type: string
            description: one word, unique among its siblings
          steps:
            $ref: "#/frontmatter/properties/steps"
            description: the steps under this phase
          does:
            type: string
            description: what the hand does at this leaf
          by:
            type: string
            description: the hand this step admits
          from:
            type: string
            description: who hands this step its input
          to:
            type: string
            description: who takes the output
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
            description: what this step reads
          evidence:
            type: array
            description: the fields this leaf's hand fills
            items:
              type: object
              additionalProperties: false
              required: [name, form, says]
              properties:
                name:
                  type: string
                  description: one word
                form:
                  enum: [text, command]
                  description: what the hand writes
                says:
                  type: string
                  description: one line on what goes here
    process:
      x-link: true
      description: the route the mint copies from
    process_hash:
      type: string
      description: the hash of the process file the route is copied from

body:
  headingLevel: 1
  order: strict
  extraSections: false

  sections:
    - header: Ask
      required: true
      description: what this ticket asks for
    - x-one-per: steps
    - header: Discussion
      required: true
      position: last
      description: what anybody adds, at any time
`;

export function treeWithProcesses(files = {}) {
  const disk = fakeDisk({
    [at("spec/schemas/ticket.schema.yaml")]: TICKET_SCHEMA,
    [at("spec/processes/note.yaml")]: NOTE_PROCESS,
    [at("spec/processes/trivial.yaml")]: TRIVIAL_PROCESS,
    ...files,
  });
  return { it: { disk, join, words: 5 }, disk };
}
