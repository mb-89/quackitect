// Render a copied extension folder against the project's brand.json.
//
// RUNME copies project/deliverable/vscode into the user's extensions folder
// and then calls this. The source keeps its placeholders so there is exactly
// one tree; only the installed copy carries a name.
import { loadBrand, renderExtension } from "../brand.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

if (process.argv.includes("--help")) {
  process.stdout.write(`brand — fill the product name into an installed extension copy.

  --root  the project root (holds project/brand/brand.json). Default: the current directory.
  --dest  the copied extension folder to render in place. Required.

Prints the name it rendered, so a launch log says which product started.
`);
  process.exit(0);
}

const root = arg("--root") ?? process.cwd();
const dest = arg("--dest");
if (dest === undefined) {
  process.stderr.write("brand: --dest is required (the copied extension folder)\n");
  process.exit(1);
}

const b = loadBrand(root);
renderExtension(dest, b);
process.stdout.write(`${b.name} (${b.id})${b.abbr === null ? "" : ` · icon ${b.abbr}`}\n`);
