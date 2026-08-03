// SEE YOUR OWN DIAGRAM. Mermaid fails at RENDER time, not at write time, so
// a diagram can pass every test we own and still show a parse error in the
// pane. That happened twice: a branch name with a space, and a config change
// that made the graph worse in ways no assertion could describe.
//
// This wraps every mermaid fence in a markdown file into a page that renders
// them and REPORTS FAILURES IN THE TITLE, so a screenshot answers both
// questions at once — did it parse, and is it readable.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , source, outPath] = process.argv;
if (source === undefined) {
  process.stderr.write("usage: mermaid-check <file.md> [out.html]\n");
  process.exit(2);
}

const text = readFileSync(source, "utf8");
const blocks = [...text.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1] ?? "");
if (blocks.length === 0) {
  process.stderr.write(`no mermaid fence in ${source}\n`);
  process.exit(1);
}

const out = outPath ?? `${source.replace(/\.md$/, "")}.check.html`;
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The title carries the verdict so a screenshot never needs the console, and
// mermaid's own error text stays on the page where the eye lands.
//
// THIS PAGE NEEDS THE NETWORK, and that is the one thing it must never hide.
// Mermaid is not a dependency of this project, so the renderer comes from a
// content delivery network. Opened offline the import simply fails, every
// diagram stays an unrendered block, and a reader concludes their diagrams
// are broken when nothing was ever checked. So the failure announces itself:
// a banner on the page and BROKEN in the title, the same as a real parse
// error would give.
writeFileSync(
  resolve(out),
  `<!doctype html><meta charset="utf-8"><title>NOT CHECKED — loading the renderer…</title>
<style>body{background:#1e1e1e;color:#ddd;font:13px system-ui;margin:0;padding:12px}
.d{margin-bottom:24px;border:1px solid #333;padding:8px}
#offline{background:#4a3a14;color:#e8b339;padding:10px 12px;margin-bottom:16px;border-radius:6px}</style>
<div id="offline">NOT CHECKED YET. This page fetches the mermaid renderer over the network, because mermaid is not a dependency of this project. If this banner is still here, nothing on this page has been checked — the diagrams below are raw source, not verdicts.</div>
${blocks.map((b, i) => `<div class="d"><pre class="mermaid">${esc(b.trim())}</pre><div id="e${i}"></div></div>`).join("\n")}
<script type="module">
let mermaid;
try {
  ({ default: mermaid } = await import("https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"));
} catch (e) {
  document.getElementById("offline").textContent = "THE RENDERER DID NOT LOAD (" + e.message + "). Nothing below was checked. This page needs the network.";
  document.title = "NOT CHECKED — renderer unreachable";
  throw e;
}
document.getElementById("offline").remove();
mermaid.initialize({ startOnLoad: false });
let bad = 0;
for (const [i, el] of [...document.querySelectorAll("pre.mermaid")].entries()) {
  try { await mermaid.parse(el.textContent); }
  catch (err) { bad++; document.getElementById("e" + i).textContent = "PARSE ERROR: " + err.message; }
}
try { await mermaid.run({ querySelector: "pre.mermaid" }); } catch (e) { bad++; }
document.title = bad === 0 ? "OK ${blocks.length} diagram(s)" : "BROKEN " + bad + " of ${blocks.length}";
</script>
`,
  "utf8",
);
process.stdout.write(
  `${resolve(out)}\n${blocks.length} diagram(s)\nNOTE: this page needs the network — mermaid is fetched from a CDN, not vendored.\n`,
);
