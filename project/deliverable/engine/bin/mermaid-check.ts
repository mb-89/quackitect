// see dsp-mirror-render.md#see-your-own-diagram
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

// bin -> engine -> deliverable, then the vendored renderer.
const vendored = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "vendor", "mermaid", "mermaid.min.js");
let renderer: string;
try {
  renderer = readFileSync(vendored, "utf8");
} catch {
  process.stderr.write(
    `the vendored renderer is missing: ${vendored}\n` +
      "pull it once (see vendor/mermaid/README.md):\n" +
      "  Invoke-WebRequest -Uri https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js -OutFile vendor/mermaid/mermaid.min.js\n",
  );
  process.exit(3);
}
// An inline script dies at the first literal </script> inside it — the
// standard escape keeps the bundle intact (the sequence only occurs inside
// string literals, where the backslash is inert).
const inlined = renderer.replace(/<\/script/gi, "<\\/script");

const out = outPath ?? `${source.replace(/\.md$/, "")}.check.html`;
const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The title carries the verdict so a screenshot never needs the console, and
// mermaid's own error text stays on the page where the eye lands.
writeFileSync(
  resolve(out),
  `<!doctype html><meta charset="utf-8"><title>NOT CHECKED — renderer starting…</title>
<style>body{background:#1e1e1e;color:#ddd;font:13px system-ui;margin:0;padding:12px}
.d{margin-bottom:24px;border:1px solid #333;padding:8px}</style>
${blocks.map((b, i) => `<div class="d"><pre class="mermaid">${esc(b.trim())}</pre><div id="e${i}"></div></div>`).join("\n")}
<script>${inlined}</script>
<script type="module">
const ns = globalThis.__esbuild_esm_mermaid_nm;
const mermaid = globalThis.mermaid ?? ns?.mermaid?.default ?? ns?.mermaid;
if (!mermaid || typeof mermaid.parse !== "function") {
  document.title = "BROKEN — the inlined renderer exposed no mermaid API";
  throw new Error("no mermaid API");
}
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
  `${resolve(out)}\n${blocks.length} diagram(s)\nself-contained — the renderer is vendored and inlined; the page works offline\n`,
);
