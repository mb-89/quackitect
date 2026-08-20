// see dsp-form-editors.md#the-element-matrix
import type { EditorKind } from "./kinds.ts";

export const ELEMENT_MATRIX_EDITOR: EditorKind = {
  id: "element-matrix",
  render: `
    const ev = args.ematrix;
    if (!ev || ev.elements.length === 0) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">No elements yet \\u2014 the matrix draws itself as element nodes land.</div>';
    }
    const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
    const shortName = function (id) { return esc(String(id).replace(/^el-/, "").replace(/^fn-/, "").replace(/^if-/, "").replace(/^flow-/, "").replace(/-/g, " ")); };
    const link = function (id) {
      const p = paths ? paths[id] : null;
      if (!p) return shortName(id);
      return '<a class="reflink" data-path="' + esc(p) + '" title="open ' + esc(id) + '" style="color:inherit;cursor:pointer;text-decoration:underline dotted;">' + shortName(id) + "</a>";
    };
    const cellAt = {};
    ev.cells.forEach(function (c) { cellAt[c.source + " -> " + c.destination] = c; });
    const td = "padding:4px 8px;border:1px solid var(--se-border);text-align:center;font-size:12px;";
    const th = td + "color:var(--se-muted);font-weight:600;";
    const sticky = "position:sticky;left:0;background:var(--se-bg,var(--vscode-editor-background));text-align:left;";
    const ids = ev.elements.map(function (e) { return e.id; });
    const head = '<tr><th style="' + th + sticky + '">source \\u2193 \\u00b7 destination \\u2192</th>' + ids.map(function (b) { return '<th style="' + th + '">' + link(b) + "</th>"; }).join("") + "</tr>";
    const rows = ids.map(function (a) {
      const cells = ids.map(function (b) {
        if (a === b) return '<td style="' + td + 'background:color-mix(in srgb, var(--se-border) 40%, transparent);"></td>';
        const c = cellAt[a + " -> " + b];
        if (!c) return '<td style="' + td + '"></td>';
        const named = c.interfaces.map(function (i) { return link(i); }).join("<br>");
        const owe = c.missing.length > 0
          ? '<button type="button" class="sfifcell" data-source="' + esc(a) + '" data-destination="' + esc(b) + '" title="' + c.missing.length + ' crossing flow' + (c.missing.length === 1 ? "" : "s") + ' uncarried \\u2014 mint the interface" style="font:inherit;font-size:11px;padding:1px 8px;border:1px solid var(--se-accent);border-radius:3px;background:transparent;color:var(--se-accent);cursor:pointer;">name \\u00b7 ' + c.missing.length + "</button>"
          : "";
        return '<td style="' + td + (c.missing.length > 0 ? "background:color-mix(in srgb, var(--se-accent) 12%, transparent);" : "") + '">' + [named, owe].filter(Boolean).join("<br>") + "</td>";
      }).join("");
      return '<tr><td style="' + td + sticky + '">' + link(a) + "</td>" + cells + "</tr>";
    }).join("");
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const detail = ev.cells.map(function (c) {
      return "<li>" + link(c.source) + " \\u2192 " + link(c.destination) + " \\u2014 carries " + c.owed.map(function (f) { return link(f); }).join(", ")
        + (c.interfaces.length > 0 ? " \\u00b7 " + c.interfaces.map(function (i) { return link(i); }).join(", ") : "")
        + (c.missing.length > 0 ? ' \\u00b7 <span style="color:var(--se-accent);">' + c.missing.length + " uncarried</span>" : "") + "</li>";
    }).join("");
    const warn = [];
    if (ev.unimplemented.length > 0) warn.push(ev.unimplemented.length + " function" + (ev.unimplemented.length === 1 ? "" : "s") + " no element implements: " + ev.unimplemented.map(function (f) { return link(f); }).join(", "));
    if (ev.idle.length > 0) warn.push("implementing nothing: " + ev.idle.map(function (e) { return link(e); }).join(", "));
    ev.undemanded.forEach(function (u) { warn.push(link(u.id) + " stands on a pair no crossing demands \\u2014 a question in the other direction"); });
    ev.problems.forEach(function (p) { warn.push(esc(p)); });
    const warnHtml = warn.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + warn.map(function (w) { return "<div>" + w + "</div>"; }).join("") + "</div>" : "";
    return '<div style="overflow-x:auto;"><table style="border-collapse:collapse;">' + head + rows + "</table></div>"
      + '<div style="' + meta + '">an accented cell owes an interface \\u2014 the NAME button mints it with the crossing flows prefilled</div>'
      + '<details style="margin:4px 0;"><summary style="' + meta + 'cursor:pointer;">' + ev.cells.length + " crossing pair" + (ev.cells.length === 1 ? "" : "s") + '</summary><ul style="' + meta + 'margin:0;padding-left:18px;">' + detail + "</ul></details>"
      + warnHtml;
  `,
  collect: "",
  behaviour: `
  // NAMING A CELL POSTS AT ONCE, like the flip deck: the interface skeleton
  // mints server-side with the crossing flows prefilled, and the redraw
  // shows the link where the button stood.
  document.addEventListener("click", async function (ev2) {
    const b = ev2.target && ev2.target.closest ? ev2.target.closest(".sfifcell") : null;
    if (!b) return;
    const host = document.querySelector(".saveform");
    const form = host ? host.dataset.form : "";
    const machine = host && host.dataset.machine ? host.dataset.machine : viewedMachine();
    await formPost("/form/ifcell", { name: form, source: b.dataset.source, destination: b.dataset.destination, machine: machine });
    showFormAgain(form, machine, b);
  });
  `,
};
