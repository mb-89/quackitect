// The flags the fixer reads, apart from the paths it writes over.
// [[spec/tickets/the-small-faults-land]]

export const FIX_USAGE = "Usage: ./RUNME.sh fix [path ...], over the paths or the tree.";
const HELP = ["--help", "-h"];

// A call naming no path reads the tree. [[spec/tickets/the-small-faults-land]]
export function fixFlags(argv) {
  const paths = argv.filter((one) => !one.startsWith("-"));
  const unknown = argv.filter((one) => one.startsWith("-") && !HELP.includes(one));
  const help = argv.some((one) => HELP.includes(one));
  return { help, unknown, paths: paths.length ? paths : ["."] };
}
