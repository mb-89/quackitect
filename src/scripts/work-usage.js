// The rows the branch verb answers: its usage, and the contract every brief
// carries onto a cloud box.
// [[spec/design_output/work#the-routine-a-verb-names]]

export const CONTRACT_HEADING = "## How this branch runs";

// [[spec/design_output/work#every-brief-carries-the-contract]]
export function contractRows(said, trunk, brief) {
  return [
    said,
    "",
    CONTRACT_HEADING,
    "",
    "Level zero deletes this file when it reads it, so the copy in your context",
    "is the only one left. These steps write it back.",
    "",
    `1. Run \`./RUNME.sh branch sync\` FIRST. It takes ${trunk} into this branch, so`,
    "   an old branch works against what the tree holds now. Resolve any conflict",
    "   before you start, because a conflict found later costs the work already",
    "   done.",
    "2. Commit and push each time you finish a thing. A cloud box dies and takes",
    "   its working tree with it.",
    `3. Write your result and your retro into \`${brief}\`, at the root, replacing`,
    "   this brief. Head the retro `What surprises me`, and name every dead end",
    "   you walk into.",
    `4. Run \`./RUNME.sh branch sync\` again, so ${trunk} comes in last too.`,
    "   Run `./RUNME.sh check` after it, and answer whatever the merge turns red.",
    "5. Run `./RUNME.sh branch done`, which sets the status and pushes.",
    "6. Stop for no person, and answer every question this branch meets. Take a",
    "   step under `by: person` as your own, and say beside the answer what you",
    "   weigh. The merge is where a person reads your call.",
    `7. Run \`./RUNME.sh branch merge <name>\` from ${trunk} to take it in, then`,
    "   `branch close`. A cloud box stops at step 4, because the harness holds",
    `   ${trunk} shut there and a cloud box opens no pull request.`,
    "",
  ].join("\n");
}

export const USAGE = [
  "Usage: ./RUNME.sh branch <verb>\n",
  "  new <name>    cut work/<name> from main with the brief, and push",
  "  open <group>  push work/<group> off main for a group ticket, so the cloud finds it",
  "  take          take the next branch marked todo, and print its brief",
  "  sync          take main into this branch before you start",
  "  done          mark this branch done, commit and push",
  "  release       put this branch, or the one you name, back to todo",
  "  read <name>   print what stands on work/<name>",
  "  review <name> gather what a reader needs, and answer the report",
  "  list [--done|--queue|--fetch] the branches, the done ones, the pull's order, or the refs again",
  "  answer [--queue] write what git knows into one file a reader opens, with the order or without",
  "  merge <name>  take a done branch into main",
  "  close [name]  delete a branch already inside main, or every one",
  "  escalate <question> [--options a,b,c] put a person step before the leaf in hand",
  "  guidance [note] the notes the held step reads, or the one note you name",
  "  unblock <t> <successor> close a ticket waiting on a person, and hand it to its successor",
  "  test [file]   run the tests the branch changes since the take: green, assertion, build or missing",
];
