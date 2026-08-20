// THE INSTRUMENT, CLIENT SIDE — the style and the one script.
//
// THE SCRIPT LISTENS ON THE DOCUMENT, never on the controls. The mirror morphs
// its cards in place, so a listener bound to a button stops working the moment
// the card redraws. The document survives every morph.
//
// A CONTROL REDRAWS THE DATA, NOT THE CARD. Replacing the whole card closed
// whatever popover was open, so ticking three columns meant opening the same
// list three times. Only the rows and the count come back now, and the reader
// keeps their place.

export const BASES_STYLE = `
.bs-body{display:flex;flex-direction:column;height:100%;overflow:hidden;padding:0}
.bs-block{display:flex;flex-direction:column;flex:1;min-height:0}
.bs-chrome{flex:0 0 auto;padding:0 10px}
.bs-pane{flex:1;min-height:0;overflow:auto;padding:0 10px 10px}
.bs-bar{display:flex;align-items:center;gap:8px;padding:6px 0}
.bs-gap{flex:1}
.bs-view-name{font-weight:600;color:var(--se-fg)}
.bs-count{color:var(--se-muted);font-size:11px;white-space:nowrap}
.bs-tool{background:transparent;color:var(--se-fg);border:1px solid transparent;border-radius:4px;font:inherit;font-size:11px;padding:3px 7px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}
.bs-tool:hover{background:var(--se-hover)}
.bs-tool.open{background:var(--se-raised);border-color:var(--se-border-strong)}
.bs-code-toggle{color:var(--se-muted);padding:3px 5px}
.bs-code-toggle:hover,.bs-code-toggle.open{color:var(--se-fg)}
.bs-type{color:var(--se-muted);display:inline-block;width:1.3em;text-align:center}
.bs-pop{margin:0 0 8px;padding:8px;background:var(--se-raised);border:1px solid var(--se-border-strong);border-radius:6px;font-size:11px;max-width:520px}
.bs-pop-tall .bs-prop-list{max-height:300px;overflow:auto}
.bs-pop-title{color:var(--se-fg);font-weight:600;margin:2px 0 6px}
.bs-helpable{cursor:pointer}
.bs-helpable:hover{color:var(--se-accent)}
.bs-row{display:flex;align-items:center;gap:5px;margin:0 0 5px}
.bs-row select,.bs-find{background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-border);border-radius:4px;font:inherit;font-size:11px;padding:2px 5px}
.bs-icon{background:transparent;border:0;color:var(--se-muted);cursor:pointer;font:inherit;font-size:11px;padding:2px 5px;border-radius:3px}
.bs-icon:hover{background:var(--se-hover);color:var(--se-fg)}
.bs-add{background:transparent;border:0;color:var(--se-muted);cursor:pointer;font:inherit;font-size:11px;padding:3px 4px;border-radius:3px;text-align:left}
.bs-add:hover{background:var(--se-hover);color:var(--se-fg)}
.bs-find{width:100%;box-sizing:border-box;margin:0 0 6px}
.bs-prop-item{display:flex;align-items:center;gap:6px;padding:3px 4px;border-radius:4px;cursor:pointer}
.bs-prop-item:hover{background:var(--se-hover)}
.bs-prop-item.on .bs-prop-name{font-weight:600}
.bs-prop-name{flex:1;color:var(--se-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bs-pop-foot{border-top:1px solid var(--se-border);margin:6px 0 0;padding:6px 0 0}
.bs-empty{color:var(--se-muted);padding:10px;font-size:12px}
.bs-busy{opacity:.55}
.bs-code-head{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:11px}
.bs-code-path{flex:1;color:var(--se-muted);font-family:ui-monospace,Consolas,monospace}
.bs-code-text{width:100%;box-sizing:border-box;min-height:60vh;background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-border);border-radius:4px;padding:8px;font-family:ui-monospace,Consolas,monospace;font-size:11px;line-height:1.5;white-space:pre;overflow:auto;resize:vertical}
`;

// The table's own look. Everything readable is FULL STRENGTH: the muted grey
// was meant to mark uneditable cells and only made the table hard to read.
// Whether a cell takes an editor is discovered by clicking it, which is what
// people do anyway.
export const BASES_TABLE_STYLE = `
.tbl{border-collapse:separate;border-spacing:0;font-size:12px;width:100%;table-layout:fixed}
.tbl th,.tbl td{border-bottom:1px solid var(--se-border);border-right:1px solid var(--se-border);padding:4px 8px;text-align:left;vertical-align:top;color:var(--se-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tbl th:last-child,.tbl td:last-child{border-right:0}
.tbl thead th{position:sticky;top:0;z-index:2;background:var(--se-raised);font-weight:600;cursor:grab;user-select:none}
.tbl thead th.drag-over{background:var(--se-walk-bg)}
.th-label{pointer-events:none}
.th-grip{position:absolute;right:0;top:0;bottom:0;width:6px;cursor:col-resize}
.tbl thead th{position:sticky;position:-webkit-sticky}
.tbl thead th{padding-right:12px}
.tbl thead th{position:sticky}
.tbl th{position:relative}
.tbl tbody tr:hover td{background:var(--se-hover)}
.tbl-link{color:var(--se-accent);text-decoration:none;cursor:pointer}
.tbl-link:hover{text-decoration:underline}
.tbl-group td{background:var(--se-raised);font-size:11px;border-bottom:1px solid var(--se-border-strong)}
.grp-pad{display:inline-block}
.grp-prop{color:var(--se-muted)}
.grp-val{font-weight:600;color:var(--se-fg)}
.grp-count{color:var(--se-muted);margin-left:6px}
.tbl-empty{color:var(--se-muted);font-style:italic}
.tbl-cell{cursor:text}
.tbl-cell:focus{outline:2px solid var(--se-walk);outline-offset:-2px}
.tbl-locked{color:var(--se-fg)}
.tbl-bad{outline:2px solid var(--se-fail);outline-offset:-2px}
.tbl-edit{width:100%;box-sizing:border-box;background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-walk);border-radius:2px;font:inherit;padding:1px 4px}
.tbl-damage{color:var(--se-fail);padding:6px 10px;font-size:12px}
.tbl-refused{color:var(--se-fail);padding:10px;font-size:12px;white-space:pre-wrap}
`;

export const BASES_SCRIPT = `
(function () {
  if (window.__seBases === true) return;
  window.__seBases = true;

  function ctxOf(node) {
    var block = node && node.closest ? node.closest(".bs-block") : document.querySelector(".bs-block");
    if (block === null) return null;
    var bar = block.querySelector(".bs-bar");
    if (bar === null) return null;
    try { return JSON.parse(bar.getAttribute("data-ctx")); } catch (e) { return null; }
  }

  function showHelp(title, html) {
    if (typeof window.showDetails === "function") { window.showDetails(title, html); return; }
    if (window.parent !== window) window.parent.postMessage({ se: "help", title: title, html: html }, "*");
  }

  function help(topic) {
    fetch("/base/help?topic=" + encodeURIComponent(topic))
      .then(function (r) { return r.json(); })
      .then(function (h) { if (h && h.title) showHelp(h.title, h.html); })
      .catch(function () {});
  }

  // ONLY THE ROWS COME BACK. The chrome stays exactly as it was, so a popover
  // the reader opened is still open and still scrolled where they left it.
  function refresh(node) {
    var ctx = ctxOf(node);
    if (ctx === null) return Promise.resolve();
    var pane = document.querySelector(".bs-pane-table");
    if (pane !== null) pane.classList.add("bs-busy");
    return fetch("/widget/table?tv=" + encodeURIComponent(ctx.id))
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var doc = new DOMParser().parseFromString(text, "text/html");
        var freshData = doc.querySelector(".bs-data");
        var here = document.querySelector(".bs-data");
        if (freshData !== null && here !== null) here.replaceWith(freshData);
        var freshCount = doc.querySelector(".bs-count");
        var count = document.querySelector(".bs-count");
        if (freshCount !== null && count !== null) count.textContent = freshCount.textContent;
        var freshCode = doc.querySelector(".bs-code-text");
        var code = document.querySelector(".bs-code-text");
        // The query is the same act seen twice, so it follows every control.
        if (freshCode !== null && code !== null && document.activeElement !== code) code.value = freshCode.value;
        if (pane !== null) pane.classList.remove("bs-busy");
      })
      .catch(function (e) {
        if (pane !== null) pane.classList.remove("bs-busy");
        showHelp("the table could not be redrawn", "<p>The write went through. Reopening the card will show it.</p><p>" + String(e) + "</p>");
      });
  }

  function post(node, op, extra) {
    var ctx = ctxOf(node);
    if (ctx === null) return Promise.resolve();
    var body = { op: op, file: ctx.file, view: ctx.view };
    if (extra) for (var k in extra) body[k] = extra[k];
    return fetch("/base/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); }).then(function (answer) {
      if (answer === null || answer.ok !== true) {
        showHelp("the control was refused", "<p>" + String((answer && answer.error) || "the write was refused") + "</p>");
        return;
      }
      return refresh(node);
    }).catch(function (e) {
      showHelp("the control could not reach the engine", "<p>" + String(e) + "</p>");
    });
  }

  function closePops(except) {
    var pops = document.querySelectorAll(".bs-pop");
    for (var i = 0; i < pops.length; i++) if (pops[i] !== except) pops[i].hidden = true;
    var tools = document.querySelectorAll(".bs-tool[data-pop]");
    for (var j = 0; j < tools.length; j++) tools[j].classList.remove("open");
  }

  function levels(kind) {
    var box = document.querySelector('.bs-levels[data-kind="' + kind + '"]');
    var out = [];
    if (box === null) return out;
    var rows = box.querySelectorAll(".bs-level");
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i].querySelector(".bs-prop");
      var d = rows[i].querySelector(".bs-dir");
      if (p !== null && p.value !== "") out.push({ property: p.value, direction: d === null ? "ASC" : d.value });
    }
    return out;
  }

  function saveLevels(node, kind) {
    if (kind === "group") return post(node, "setGroupBy", { levels: levels("group") });
    return post(node, "setSort", { sort: levels("sort") });
  }

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (t === null || !t.closest) return;

    var helpable = t.closest(".bs-helpable, .bs-tool[data-help]");
    if (helpable !== null && helpable.hasAttribute("data-help")) help(helpable.getAttribute("data-help"));

    var tool = t.closest(".bs-tool[data-pop]");
    if (tool !== null) {
      var block = tool.closest(".bs-block");
      var pop = block === null ? null : block.querySelector('.bs-pop[data-pop="' + tool.getAttribute("data-pop") + '"]');
      var wasOpen = pop !== null && pop.hidden === false;
      closePops(null);
      if (pop !== null && wasOpen === false) { pop.hidden = false; tool.classList.add("open"); }
      ev.preventDefault();
      return;
    }

    // THE FLIP. One thing on screen at a time, because the table and the query
    // are the same view rendered twice.
    if (t.closest(".bs-code-toggle") !== null) {
      var blk = t.closest(".bs-block");
      var table = blk.querySelector(".bs-pane-table");
      var code = blk.querySelector(".bs-pane-code");
      var btn = t.closest(".bs-code-toggle");
      var toCode = code.hidden;
      code.hidden = !toCode;
      table.hidden = toCode;
      btn.classList.toggle("open", toCode);
      btn.title = toCode ? "show the table" : "show the query";
      closePops(null);
      return;
    }

    if (t.closest(".bs-code-save") !== null) {
      var box = document.querySelector(".bs-code-text");
      if (box !== null) post(t, "setSource", { text: box.value });
      return;
    }

    if (t.closest(".bs-hide-all") !== null) { post(t, "hideAll", {}); return; }

    var drop = t.closest(".bs-drop");
    if (drop !== null) {
      var row = drop.closest(".bs-level");
      var kind = row.getAttribute("data-kind");
      var holder = row.parentElement;
      row.remove();
      // An empty list still needs one blank row, or Add has nothing to clone.
      if (holder.querySelectorAll(".bs-level").length === 0) holder.appendChild(blankLevel(kind));
      saveLevels(holder, kind);
      return;
    }

    var add = t.closest(".bs-add-level");
    if (add !== null) {
      var which = add.getAttribute("data-kind");
      var into = document.querySelector('.bs-levels[data-kind="' + which + '"]');
      if (into !== null) into.appendChild(blankLevel(which));
      return;
    }

    if (t.closest(".bs-create") !== null) {
      var f = window.prompt("Name the new base file", "database.base");
      if (f !== null && f.trim() !== "") {
        fetch("/base/edit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "createBase", file: f.trim(), name: "All notes" }) })
          .then(function () { refresh(t); });
      }
      return;
    }

    if (t.closest(".bs-pop") === null && t.closest(".bs-tool") === null) closePops(null);
  });

  function blankLevel(kind) {
    var sample = document.querySelector('.bs-levels[data-kind="' + kind + '"] .bs-level');
    var row;
    if (sample !== null) {
      row = sample.cloneNode(true);
    } else {
      row = document.createElement("div");
      row.className = "bs-row bs-level";
      row.innerHTML = '<select class="bs-prop"></select><select class="bs-dir"><option value="ASC">A → Z</option><option value="DESC">Z → A</option></select><button type="button" class="bs-icon bs-drop">✕</button>';
    }
    row.setAttribute("data-kind", kind);
    var p = row.querySelector(".bs-prop");
    if (p !== null) p.value = "";
    return row;
  }

  document.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t === null || !t.closest) return;
    if (t.classList.contains("bs-tick")) {
      post(t, "toggleProperty", { property: t.getAttribute("data-property"), on: t.checked });
      var item = t.closest(".bs-prop-item");
      if (item !== null) item.classList.toggle("on", t.checked);
      return;
    }
    var lvl = t.closest(".bs-level");
    if (lvl !== null) { saveLevels(lvl, lvl.getAttribute("data-kind")); return; }
  });

  document.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t === null || !t.classList || !t.classList.contains("bs-find")) return;
    var want = t.value.toLowerCase();
    var items = t.closest(".bs-pop").querySelectorAll(".bs-prop-item");
    for (var j = 0; j < items.length; j++) {
      items[j].style.display = items[j].textContent.toLowerCase().indexOf(want) === -1 ? "none" : "";
    }
  });

  // --- columns: drag to reorder, drag the edge to resize --------------------

  var dragCol = null;

  document.addEventListener("dragstart", function (ev) {
    var th = ev.target.closest ? ev.target.closest("th[data-col]") : null;
    if (th === null) return;
    dragCol = th.getAttribute("data-col");
    ev.dataTransfer.effectAllowed = "move";
    try { ev.dataTransfer.setData("text/plain", dragCol); } catch (e) {}
  });

  document.addEventListener("dragover", function (ev) {
    var th = ev.target.closest ? ev.target.closest("th[data-col]") : null;
    if (th === null || dragCol === null) return;
    ev.preventDefault();
    th.classList.add("drag-over");
  });

  document.addEventListener("dragleave", function (ev) {
    var th = ev.target.closest ? ev.target.closest("th[data-col]") : null;
    if (th !== null) th.classList.remove("drag-over");
  });

  document.addEventListener("drop", function (ev) {
    var th = ev.target.closest ? ev.target.closest("th[data-col]") : null;
    if (th === null || dragCol === null) return;
    ev.preventDefault();
    th.classList.remove("drag-over");
    var onto = th.getAttribute("data-col");
    if (onto === dragCol) { dragCol = null; return; }
    var cols = [];
    var heads = document.querySelectorAll("th[data-col]");
    for (var i = 0; i < heads.length; i++) cols.push(heads[i].getAttribute("data-col"));
    var from = cols.indexOf(dragCol);
    cols.splice(from, 1);
    cols.splice(cols.indexOf(onto), 0, dragCol);
    dragCol = null;
    post(th, "setOrder", { order: cols });
  });

  var sizing = null;

  document.addEventListener("mousedown", function (ev) {
    var grip = ev.target.closest ? ev.target.closest(".th-grip") : null;
    if (grip === null) return;
    var th = grip.closest("th[data-col]");
    sizing = { col: th.getAttribute("data-col"), th: th, x: ev.clientX, w: th.offsetWidth };
    ev.preventDefault();
  });

  document.addEventListener("mousemove", function (ev) {
    if (sizing === null) return;
    var w = Math.max(40, sizing.w + (ev.clientX - sizing.x));
    sizing.th.style.width = w + "px";
  });

  document.addEventListener("mouseup", function () {
    if (sizing === null) return;
    var done = sizing;
    sizing = null;
    post(done.th, "setColumnSize", { property: done.col, px: done.th.offsetWidth });
  });
}());
`;
