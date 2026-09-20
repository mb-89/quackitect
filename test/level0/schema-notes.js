// What more than one block of schema cases reads: the note schema and a note
// in its shape, the readers over them, a tree in memory, and the route schema.
// The blocks stand in the schema files beside this one.

import { checkNote, readYaml } from "../../.claude/skills/level0/lib/schema.js";
import { treeOf } from "../../.claude/skills/level0/lib/tree.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeGit } from "../../src/doors/fake/git.js";

export const SCHEMA = readYaml(`
kind: note

frontmatter:
  type: object
  additionalProperties: false
  required:
    - kind
    - status
  properties:
    kind:
      const: note
      x-link: true
      description: the schema this note is minted from

    status:
      enum: [todo, held, done]
      description: where the work stands

    scope:
      type: array
      description: who this note binds

    explains:
      x-link: true
      description: the note these chapters argue for

body:
  headingLevel: 1
  order: strict
  extraSections: false

  sections:
    - header: Scope
      required: true
      description: what this note covers

    - header: Actionables
      required: true
      list: true
      ordered: true
      maxItems: 2
      description: one rule per item

      subsections:
        headingLevel: 2
        numbered: true
        order: strict
        description: one chapter per marked item

    - header: Examples
      required: false
      table:
        heads: [the rule, do, do not]
        namesOf: Actionables
      description: rows naming a rule each

    - header: What stands open
      position: last
      required: true
      description: every question still waiting
`);

export const NOTE = "spec/notes/one.md";

export const good = `---
kind: [[note]]
status: todo
---

# Scope

What this note covers.

# Actionables

1. Do the first thing.
2. Do the second thing.

## 1. The first

Why it stands.

## 2. The second

Why it stands.

# What stands open

Nothing waits.
`;

export const shown = `# Examples

| the rule | do | do not |
|---|---|---|
| 1 | do the first thing | leave it |
| 2 | do the second thing | leave it |

`;

export const found = (text) => checkNote(text, SCHEMA, NOTE);
export const rules = (text) => found(text).map((one) => one.rule);
export const messages = (text) => found(text).map((one) => one.message);
export const swap = (was, now) => good.replace(was, now);

export const treeWith = (seed) =>
  treeOf({
    disk: fakeDisk(
      Object.fromEntries(Object.entries(seed).map(([at, s]) => [`/t/${at}`, s])),
    ),
    git: fakeGit({ "git ls-files": { stdout: Object.keys(seed).join("\n") } }, "/t"),
    root: "/t",
    words: 5,
    node: "",
  });

export const GOVERNED = `kind: note

governs:
  - spec/notes/**

frontmatter:
  additionalProperties: false
  required:
    - kind
  properties:
    kind:
      const: note
      x-link: true

body:
  headingLevel: 1
  extraSections: false
  sections:
    - header: Scope
      required: true
      description: what this note covers
`;

export const governedTree = (seed) =>
  treeWith({ "spec/schemas/note.schema.yaml": GOVERNED, ...seed });

export const ROUTED = readYaml(`
kind: routed

frontmatter:
  type: object
  additionalProperties: false
  required:
    - kind
    - steps
  properties:
    kind:
      const: routed
      x-link: true
      description: the schema this note is minted from

    step:
      type: string
      x-names: steps
      x-leaf: true
      description: the leaf this note stands on

    steps:
      type: array
      description: the route, as a tree of steps
      default:
        - name: do
          does: makes the change
          to: retro
          evidence:
            - name: change
              form: text
              says: what you change
      items:
        type: object
        additionalProperties: false
        required:
          - name
        properties:
          name:
            type: string
            description: one word, unique among its siblings
          does:
            type: string
            description: what the hand does here
          steps:
            $ref: "#/frontmatter/properties/steps"
            description: the steps under this phase
          by:
            type: string
            x-names: steps
            x-words: [anyone, person]
            x-prefix: not
            description: the hand this step admits
          on_fail:
            type: string
            x-earlier: steps
            description: the earlier step a failure sends this to
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
            description: what this step reads
          to:
            type: string
            description: who takes the output
          evidence:
            type: array
            description: the fields this leaf's hand fills
            items:
              type: object
              additionalProperties: false
              required:
                - name
                - form
                - says
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

body:
  headingLevel: 1
  order: strict
  extraSections: false

  sections:
    - header: Ask
      required: true
      description: what this note asks for

    - x-one-per: steps
`);

export const ROUTE = "spec/routed/one.md";
export const routed = (text) =>
  checkNote(text, ROUTED, ROUTE, new Map([["routed", ROUTED]]));
