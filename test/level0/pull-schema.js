// The ticket schema the pull tests read, as one string: a copy the fakes
// serve, so the tests stand on memory alone.
// [[spec/design_output/doors#a-fake-behaves]]

export const SCHEMA = `kind: ticket

governs:
  - spec/tickets/**
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
      x-engine: true
      description: whether anybody pulls it
    reason:
      enum: [done, dropped, became]
      description: how the work stopped
    urgency:
      enum: [now, soon, whenever]
      description: which ticket the pull hands out first
    step:
      type: string
      x-names: steps
      x-leaf: true
      x-engine: true
      description: the leaf of the route this ticket stands on
    steps:
      type: array
      x-engine: true
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
            x-names: steps
            x-words: [anyone, person, agent, helper, retro, children]
            x-prefix: not
            description: the hand this step admits
          not:
            type: string
            x-names: steps
            description: a step whose hand this step's hand may not be
          reads:
            type: [array, string]
            x-link: true
            description: the guidance notes this step's hand reads
          on_fail:
            type: string
            x-earlier: steps
            description: the earlier step a failed hand-back sends the ticket to
          asks:
            type: string
            description: the question a person answers
          options:
            type: array
            description: the words that answer asks
          when:
            enum: [returned, cloud, desk]
            description: the condition the pull reads
          checklist:
            type: array
            description: what a hand has to do here
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
            description: what this step reads
          needs:
            type: array
            description: the verbs and tools this step runs
          from:
            type: string
            description: who hands this step its input
          to:
            type: string
            description: who takes the output
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
                  description: one word, unique among the fields of this leaf
                form:
                  enum: [text, list, command, link, files, choice, checklist, verdict]
                  description: what the hand writes
                says:
                  type: string
                  description: one line on what goes in this field
                expects:
                  type: [integer, string]
                  description: the exit code or the word a command answers with
                options:
                  type: array
                  description: the words a choice takes
    process:
      x-link: true
      description: the route the mint copies from
    process_hash:
      type: string
      description: the hash of the process file
    record:
      type: array
      x-engine: true
      description: the engine's entry per leaf
      items:
        type: object
        additionalProperties: false
        required: [step]
        properties:
          step:
            type: string
            x-names: steps
            x-leaf: true
            description: the leaf this entry stands for
          hand:
            type: string
            description: the box
          hash_before:
            type: string
            description: the branch tip at the take
          hash_after:
            type: string
            description: the branch tip at the hand-back
          returns:
            type: integer
            description: how often this leaf fails back
          skipped:
            type: boolean
            description: whether the pull passes this leaf over
          why:
            type: string
            description: the reason
          answered:
            type: array
            description: one entry per command field
            items:
              type: object
              additionalProperties: false
              required: [name]
              properties:
                name:
                  type: string
                  description: the field
                exit:
                  type: integer
                  description: the exit code
                said:
                  type: string
                  description: the last line
    group:
      type: string
      description: the branch this ticket lands on
    parent:
      type: string
      description: the ticket whose children step waits for this one
    depends_on:
      type: [array, string]
      description: the tickets this one waits for
    successors:
      type: [array, string]
      description: the tickets this one became
    todo:
      type: boolean
      description: the tag a hand puts on a note

body:
  headingLevel: 1
  order: strict
  extraSections: false
  tense: present
  sections:
    - header: Ask
      required: true
      x-written: draft
      description: what this ticket asks for
    - x-one-per: steps
      x-written: hand
    - header: Discussion
      required: true
      position: last
      x-written: anyone
      description: what anybody adds
`;
