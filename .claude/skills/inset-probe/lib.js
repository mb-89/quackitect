// What the probe computes with no editor: the page it draws and the height it
// asks for. [[spec/tickets/the-editor-takes-an-inset]]

// A long route, so the page runs past the height the first inset asks for.
const ROUTE = Array.from({ length: 24 }, (_, i) => `step ${i + 1}`);

function escaped(text) {
  return String(text).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

// The page posts `drawn` with its own height once it stands, so the host reads
// whether it drew and how tall it runs.
function pageOf(steps) {
  const boxes = steps
    .map((one) => `<div class="step">${escaped(one)}</div>`)
    .join("\n");
  return `<!doctype html>
<html><head><style>
body { margin: 0; font: 12px sans-serif; color: var(--vscode-editor-foreground); }
.step { margin: 4px 8px; padding: 4px 8px; border: 1px solid var(--vscode-focusBorder); border-radius: 4px; }
</style></head><body>
${boxes}
<script>
const host = acquireVsCodeApi();
requestAnimationFrame(() => host.postMessage({ drawn: true, height: document.body.scrollHeight }));
</script>
</body></html>`;
}

// The editor sizes an inset in lines, so a page of so many pixels asks for the
// lines that hold it, and one more for the border.
function linesFor(px, linePx) {
  if (!(px > 0) || !(linePx > 0)) return 1;
  return Math.ceil(px / linePx) + 1;
}

module.exports = { ROUTE, escaped, linesFor, pageOf };
