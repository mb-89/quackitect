// The rows the branch verb answers: its usage.
// [[spec/design_output/work#the-round-trip]]

export const USAGE = [
  "Usage: ./RUNME.sh branch <verb>\n",
  "  open <group>  push work/<group> off main for a group ticket, so the cloud finds it",
  "  take          take the next branch marked todo, and print its ask",
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
