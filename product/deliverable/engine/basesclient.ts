// THE INSTRUMENT, CLIENT SIDE — the style and the one script.
//
// Split from baseui.ts because that file builds MARKUP and this one is an
// asset. Keeping a few hundred lines of CSS and browser JavaScript out of the
// renderer keeps both readable.
//
// THE SCRIPT LISTENS ON THE DOCUMENT, never on the controls. The mirror morphs
// its cards in place, so a listener bound to a button stops working the moment
// the card redraws. The document survives every morph.
//
// EVERY CONTROL POSTS AND THEN RELOADS THE CARD. There is no local state to
// keep in step, because the file is the state. A tick that failed to write
// therefore cannot leave a ticked box behind.

export const BASES_STYLE = `
.bs-bar{display:flex;align-items:center;gap:6px;padding:6px 2px;flex-wrap:wrap}
.bs-gap{flex:1}
.bs-count{color:var(--se-muted);font-size:11px;white-space:nowrap}
.bs-tool{background:transparent;color:var(--se-fg);border:1px solid transparent;border-radius:4px;font:inherit;font-size:11px;padding:3px 7px;cursor:pointer;white-space:nowrap}
.bs-tool:hover{background:var(--se-hover)}
.bs-tool.open{background:var(--se-raised);border-color:var(--se-border-strong)}
.bs-view-btn{font-weight:600}
.bs-caret{color:var(--se-muted)}
.bs-type{color:var(--se-muted);display:inline-block;width:1.3em;text-align:center}
.bs-searchbar{padding:0 2px 6px}
.bs-search{width:100%;box-sizing:border-box;background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-border-strong);border-radius:4px;font:inherit;font-size:12px;padding:4px 7px}
.bs-pop{position:relative;margin:0 2px 8px;padding:8px;background:var(--se-raised);border:1px solid var(--se-border-strong);border-radius:6px;font-size:11px;max-width:520px}
.bs-pop-wide{max-width:640px}
.bs-pop-tall .bs-prop-list{max-height:320px;overflow:auto}
.bs-pop-title{color:var(--se-fg);font-weight:600;margin:2px 0 6px}
.bs-helpable{cursor:pointer}
.bs-helpable:hover{color:var(--se-accent)}
.bs-row{display:flex;align-items:center;gap:5px;margin:0 0 5px;flex-wrap:wrap}
.bs-where{color:var(--se-muted)}
.bs-row select,.bs-row input,.bs-configure select,.bs-configure input,.bs-find{background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-border);border-radius:4px;font:inherit;font-size:11px;padding:2px 5px}
.bs-val,.bs-raw{flex:1;min-width:110px}
.bs-raw{font-family:ui-monospace,Consolas,monospace}
.bs-icon{background:transparent;border:0;color:var(--se-muted);cursor:pointer;font:inherit;font-size:11px;padding:2px 4px;border-radius:3px}
.bs-icon:hover{background:var(--se-hover);color:var(--se-fg)}
.bs-add{background:transparent;border:0;color:var(--se-muted);cursor:pointer;font:inherit;font-size:11px;padding:3px 4px;border-radius:3px;text-align:left}
.bs-add:hover{background:var(--se-hover);color:var(--se-fg)}
.bs-adds{display:flex;gap:8px}
.bs-group{border-left:2px solid var(--se-border);padding:4px 0 4px 8px;margin:0 0 4px}
.bs-conj{margin:0 0 6px}
.bs-fold summary{cursor:pointer;color:var(--se-fg);padding:3px 0;font-weight:600}
.bs-scope{padding:4px 0 0 4px}
.bs-find{width:100%;box-sizing:border-box;margin:0 0 6px}
.bs-prop-item{display:flex;align-items:center;gap:6px;padding:3px 4px;border-radius:4px;cursor:pointer}
.bs-prop-item:hover{background:var(--se-hover)}
.bs-prop-item.on .bs-prop-name{color:var(--se-fg);font-weight:600}
.bs-prop-name{flex:1;color:var(--se-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bs-rename{width:110px;opacity:.55}
.bs-rename:focus{opacity:1}
.bs-pop-foot{display:flex;gap:8px;border-top:1px solid var(--se-border);margin:6px 0 0;padding:6px 0 0}
.bs-view-item{display:flex;align-items:center;gap:6px;width:100%;background:transparent;border:0;color:var(--se-fg);font:inherit;font-size:11px;padding:4px;border-radius:4px;cursor:pointer;text-align:left}
.bs-view-item:hover{background:var(--se-hover)}
.bs-view-item.on{background:var(--se-walk-bg)}
.bs-chev{color:var(--se-muted);padding:0 3px}
.bs-chev:hover{color:var(--se-fg)}
.bs-back{background:transparent;border:0;color:var(--se-muted);cursor:pointer;font:inherit}
.bs-configure{border-top:1px solid var(--se-border);margin:6px 0 0;padding:8px 0 0;display:flex;flex-direction:column;gap:6px}
.bs-conf-head{display:flex;align-items:center;gap:6px;margin:0}
.bs-conf-name{flex:1}
.bs-vmenu{background:transparent;border:0;color:var(--se-muted);cursor:pointer;font:inherit;padding:0 5px;border-radius:3px}
.bs-vmenu:hover{background:var(--se-hover);color:var(--se-fg)}
.bs-vmenu-items{display:flex;flex-direction:column;background:var(--se-bg);border:1px solid var(--se-border-strong);border-radius:4px;padding:3px}
.bs-codepanel{margin:0 2px 8px;padding:8px;background:var(--se-raised);border:1px solid var(--se-border-strong);border-radius:6px}
.bs-code-head{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:11px}
.bs-code-path{flex:1;color:var(--se-muted);font-family:ui-monospace,Consolas,monospace}
.bs-code-msg{color:var(--se-muted);font-size:11px}
.bs-code-msg.bad{color:var(--se-fail)}
.bs-code-text{width:100%;box-sizing:border-box;min-height:220px;background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-border);border-radius:4px;padding:8px;font-family:ui-monospace,Consolas,monospace;font-size:11px;line-height:1.45;white-space:pre;overflow:auto;resize:vertical}
.bs-empty{color:var(--se-muted);padding:10px 2px;font-size:12px}
.bs-busy{opacity:.5;pointer-events:none}
.bs-hit{display:none}
`;

export const BASES_SCRIPT = `
(function () {
  if (window.__seBases === true) return;
  window.__seBases = true;

  function ctxOf(node) {
    var block = node && node.closest ? node.closest(".bs-block") : null;
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

  // A WRITE, THEN A REDRAW FROM DISK. Nothing is assumed to have worked.
  function post(node, op, extra) {
    var ctx = ctxOf(node);
    if (ctx === null) return;
    var body = { op: op, file: ctx.file, view: ctx.view };
    if (extra) for (var k in extra) body[k] = extra[k];
    var card = document.getElementById("w-table");
    if (card !== null) card.classList.add("bs-busy");
    fetch("/base/edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); }).then(function (answer) {
      if (answer === null || answer.ok !== true) {
        if (card !== null) card.classList.remove("bs-busy");
        showHelp("the control was refused", "<p>" + String((answer && answer.error) || "the write was refused") + "</p>");
        return;
      }
      reload(ctx.id);
    }).catch(function (e) {
      if (card !== null) card.classList.remove("bs-busy");
      showHelp("the control could not reach the engine", "<p>" + String(e) + "</p>");
    });
  }

  // THE CARD REDRAWS, THE PAGE DOES NOT. A full reload would throw the reader
  // out of whatever else they had open, which is the one thing the surfaces
  // are not allowed to do. A redraw that fails says so and leaves the card
  // standing, because a stale card the reader can see beats a blank one.
  function reload(id) {
    var url = id === null || id === undefined ? "/widget/table" : "/widget/table?tv=" + encodeURIComponent(id);
    // The query panel stays open across a redraw. That is the whole point of
    // it: a control writes, the card comes back, and the YAML that changed is
    // still on screen beside the control that changed it.
    var open = document.querySelector(".bs-codepanel");
    var wasOpen = open !== null && open.hidden === false;
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var doc = new DOMParser().parseFromString(text, "text/html");
        var fresh = doc.getElementById("w-table");
        var here = document.getElementById("w-table");
        if (fresh !== null && here !== null) here.replaceWith(fresh);
        if (wasOpen) {
          var again = document.querySelector(".bs-codepanel");
          if (again !== null) again.hidden = false;
        }
      })
      .catch(function (e) {
        var card = document.getElementById("w-table");
        if (card !== null) card.classList.remove("bs-busy");
        showHelp("the table could not be redrawn", "<p>The write went through. Reopening the card will show it.</p><p>" + String(e) + "</p>");
      });
  }

  function closePops(except) {
    var pops = document.querySelectorAll(".bs-pop");
    for (var i = 0; i < pops.length; i++) if (pops[i] !== except) pops[i].hidden = true;
    var tools = document.querySelectorAll(".bs-tool");
    for (var j = 0; j < tools.length; j++) tools[j].classList.remove("open");
  }

  // --- reading the filter tree back out of the DOM -------------------------

  function rowValue(row) {
    if (row.getAttribute("data-raw") === "1") {
      var raw = row.querySelector(".bs-raw");
      var text = raw === null ? "" : raw.value.trim();
      return text === "" ? null : text;
    }
    var prop = row.querySelector(".bs-prop");
    var op = row.querySelector(".bs-op");
    var val = row.querySelector(".bs-val");
    if (prop === null || op === null || prop.value === "") return null;
    return { r: { property: prop.value, operator: op.value, value: val === null ? "" : val.value } };
  }

  function groupValue(group) {
    var conj = group.querySelector(":scope > .bs-conj");
    var kidsBox = group.querySelector(":scope > .bs-kids");
    if (kidsBox === null) return null;
    var kids = [];
    for (var i = 0; i < kidsBox.children.length; i++) {
      var kid = kidsBox.children[i];
      var v = kid.classList.contains("bs-group") ? groupValue(kid) : rowValue(kid);
      if (v !== null) kids.push(v);
    }
    if (kids.length === 0) return null;
    var which = conj === null ? "and" : conj.value;
    if (which === "not") return { not: kids.length === 1 ? kids[0] : { and: kids } };
    return which === "or" ? { or: kids } : { and: kids };
  }

  function saveFilters(node) {
    var scope = node.closest(".bs-scope");
    if (scope === null) return;
    var group = scope.querySelector(":scope > .bs-group");
    var tree = group === null ? null : groupValue(group);
    post(node, scope.getAttribute("data-scope") === "global" ? "setGlobalFilters" : "setViewFilters", { posted: tree });
  }

  function saveSorts(node) {
    var pop = node.closest(".bs-pop");
    if (pop === null) return;
    var rows = pop.querySelectorAll(".bs-sort");
    var sort = [];
    for (var i = 0; i < rows.length; i++) {
      var p = rows[i].querySelector(".bs-prop");
      var d = rows[i].querySelector(".bs-dir");
      if (p !== null && p.value !== "") sort.push({ property: p.value, direction: d === null ? "ASC" : d.value });
    }
    post(node, "setSort", { sort: sort });
  }

  // --- clicks --------------------------------------------------------------

  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (t === null || !t.closest) return;

    var helpable = t.closest(".bs-helpable, .bs-tool");
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

    if (t.closest(".bs-search-btn") !== null) {
      var blk = t.closest(".bs-block");
      var bar = blk === null ? null : blk.querySelector(".bs-searchbar");
      if (bar !== null) { bar.hidden = !bar.hidden; if (!bar.hidden) bar.querySelector(".bs-search").focus(); }
      return;
    }

    if (t.closest(".bs-hide-all") !== null) { post(t, "hideAll", {}); return; }
    if (t.closest(".bs-clear-group") !== null) { post(t, "setGroupBy", { property: null }); return; }

    var drop = t.closest(".bs-drop");
    if (drop !== null) {
      var row = drop.closest(".bs-row");
      var inFilter = drop.closest(".bs-scope") !== null;
      var anchor = row.parentElement;
      row.remove();
      if (inFilter) saveFilters(anchor); else saveSorts(anchor);
      return;
    }

    if (t.closest(".bs-add-sort") !== null) {
      var sp = t.closest(".bs-pop").querySelector(".bs-sorts");
      var first = sp.querySelector(".bs-sort");
      if (first !== null) { var copy = first.cloneNode(true); sp.appendChild(copy); }
      else help("sort");
      return;
    }

    var addFilter = t.closest(".bs-add-filter");
    if (addFilter !== null) {
      var kids = addFilter.closest(".bs-group").querySelector(":scope > .bs-kids");
      var sample = document.querySelector(".bs-filter");
      if (sample !== null) {
        var fresh = sample.cloneNode(true);
        fresh.setAttribute("data-raw", "0");
        var v = fresh.querySelector(".bs-val"); if (v !== null) v.value = "";
        var r = fresh.querySelector(".bs-raw"); if (r !== null) { r.value = ""; r.hidden = true; }
        var b = fresh.querySelector(".bs-built"); if (b !== null) b.hidden = false;
        kids.appendChild(fresh);
      }
      return;
    }

    var addGroup = t.closest(".bs-add-group");
    if (addGroup !== null) {
      var into = addGroup.closest(".bs-group").querySelector(":scope > .bs-kids");
      var g = document.createElement("div");
      g.className = "bs-group";
      g.innerHTML = '<select class="bs-conj"><option value="and">All the following are true</option><option value="or">Any of the following are true</option><option value="not">None of the following are true</option></select><div class="bs-kids"></div><div class="bs-adds"><button type="button" class="bs-add bs-add-filter">+ Add filter</button><button type="button" class="bs-add bs-add-group">+ Add filter group</button></div>';
      into.appendChild(g);
      return;
    }

    var rawBtn = t.closest(".bs-toggle-raw");
    if (rawBtn !== null) {
      var frow = rawBtn.closest(".bs-filter");
      var isRaw = frow.getAttribute("data-raw") === "1";
      var built = frow.querySelector(".bs-built");
      var rawIn = frow.querySelector(".bs-raw");
      if (isRaw) {
        frow.setAttribute("data-raw", "0");
        built.hidden = false; rawIn.hidden = true;
      } else {
        frow.setAttribute("data-raw", "1");
        built.hidden = true; rawIn.hidden = false;
        rawIn.focus();
      }
      return;
    }

    var goto = t.closest("[data-goto]");
    if (goto !== null && t.closest("[data-configure]") === null) {
      // A reload rather than a toggle: only the shown view carries its chrome,
      // so the controls have to be redrawn for the one being switched to.
      closePops(null);
      reload(goto.getAttribute("data-goto"));
      return;
    }

    var conf = t.closest("[data-configure]");
    if (conf !== null) {
      var panel = conf.closest(".bs-pop").querySelector(".bs-configure");
      if (panel !== null) panel.hidden = false;
      ev.stopPropagation();
      return;
    }

    if (t.closest(".bs-back") !== null) {
      var pnl = t.closest(".bs-configure");
      if (pnl !== null) pnl.hidden = true;
      return;
    }

    if (t.closest(".bs-vmenu") !== null) {
      var menu = t.closest(".bs-configure").querySelector(".bs-vmenu-items");
      if (menu !== null) menu.hidden = !menu.hidden;
      return;
    }

    if (t.closest(".bs-show-code") !== null) {
      var panel = t.closest(".bs-block").querySelector(".bs-codepanel");
      if (panel !== null) panel.hidden = !panel.hidden;
      closePops(null);
      return;
    }

    if (t.closest(".bs-code-save") !== null) {
      var box = t.closest(".bs-codepanel").querySelector(".bs-code-text");
      var c2 = ctxOf(t);
      if (box !== null && c2 !== null) post(t, "setSource", { text: box.value });
      return;
    }

    if (t.closest(".bs-add-view") !== null) {
      var name = window.prompt("Name the new view");
      if (name !== null && name.trim() !== "") post(t, "addView", { name: name.trim(), type: "table" });
      return;
    }

    if (t.closest(".bs-drop-view") !== null) {
      var c = ctxOf(t);
      if (c !== null && window.confirm('Delete the view "' + c.view + '" from ' + c.file + "?")) post(t, "removeView", {});
      return;
    }

    if (t.closest(".bs-create") !== null) {
      var f = window.prompt("Name the new base file", "views.base");
      if (f !== null && f.trim() !== "") {
        fetch("/base/edit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ op: "createBase", file: f.trim(), name: "Table" }) })
          .then(function () { reload(null); });
      }
      return;
    }

    if (t.closest(".bs-pop") === null && t.closest(".bs-tool") === null) closePops(null);
  });

  // --- changes -------------------------------------------------------------

  document.addEventListener("change", function (ev) {
    var t = ev.target;
    if (t === null || !t.closest) return;

    if (t.classList.contains("bs-tick")) {
      post(t, "toggleProperty", { property: t.getAttribute("data-property"), on: t.checked });
      return;
    }
    if (t.classList.contains("bs-layout")) { post(t, "setLayout", { type: t.value }); return; }
    if (t.closest(".bs-scope") !== null) { saveFilters(t); return; }
    if (t.closest('[data-kind="group"]') !== null) {
      var row = t.closest('[data-kind="group"]');
      var p = row.querySelector(".bs-prop");
      var d = row.querySelector(".bs-dir");
      post(t, "setGroupBy", { property: p.value === "" ? null : p.value, direction: d.value });
      return;
    }
    if (t.closest(".bs-sort") !== null) { saveSorts(t); return; }
  });

  // --- typing --------------------------------------------------------------

  document.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t === null || !t.classList) return;

    if (t.classList.contains("bs-search")) {
      var needle = t.value.toLowerCase();
      var block = t.closest(".bs-block");
      var body = block === null ? null : block.querySelector(".bs-data tbody");
      if (body === null) return;
      var shown = 0;
      for (var i = 0; i < body.rows.length; i++) {
        var hit = needle === "" || body.rows[i].textContent.toLowerCase().indexOf(needle) !== -1;
        body.rows[i].hidden = !hit;
        if (hit) shown++;
      }
      var count = block.querySelector(".bs-count");
      if (count !== null) count.textContent = shown + (shown === 1 ? " result" : " results");
      return;
    }

    if (t.classList.contains("bs-find")) {
      var want = t.value.toLowerCase();
      var items = t.closest(".bs-pop").querySelectorAll(".bs-prop-item");
      for (var j = 0; j < items.length; j++) {
        items[j].style.display = items[j].textContent.toLowerCase().indexOf(want) === -1 ? "none" : "";
      }
      return;
    }
  });

  // Commit on Enter, the same contract the cell editor already uses.
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter") return;
    var t = ev.target;
    if (t === null || !t.classList) return;
    if (t.classList.contains("bs-raw")) { ev.preventDefault(); saveFilters(t); return; }
    if (t.classList.contains("bs-val")) { ev.preventDefault(); saveFilters(t); return; }
    if (t.classList.contains("bs-rename")) {
      ev.preventDefault();
      post(t, "setDisplayName", { property: t.getAttribute("data-property"), name: t.value });
      return;
    }
    if (t.classList.contains("bs-view-name")) {
      ev.preventDefault();
      post(t, "renameView", { to: t.value });
      return;
    }
  });
}());
`;
