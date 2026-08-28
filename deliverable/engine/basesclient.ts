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
.bs-groups{display:flex;flex-direction:column;gap:6px}
.bs-group{display:flex;align-items:flex-start;gap:6px;border:1px solid var(--se-border);border-radius:5px;padding:6px}
.bs-group-raw{border-style:dashed}
.bs-group-body{flex:1;min-width:0}
.bs-join{color:var(--se-muted);font-size:10px;letter-spacing:.06em;text-transform:uppercase;flex:0 0 auto;min-width:2.2em;padding-top:4px}
.bs-groups>.bs-group:first-child>.bs-join{visibility:hidden}
.bs-conds>.bs-cond:first-child>.bs-join{visibility:hidden}
.bs-cond .bs-prop,.bs-cond .bs-op{max-width:11em}
.bs-val{flex:1;min-width:0;background:var(--se-bg);color:var(--se-fg);border:1px solid var(--se-border);border-radius:4px;font:inherit;font-size:11px;padding:2px 5px}
.bs-raw{color:var(--se-fg);font-family:ui-monospace,Consolas,monospace;word-break:break-all}
.bs-raw-note{color:var(--se-muted);margin:4px 0 0}
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
/* THE SORT MARK. It sits beside the name rather than replacing it, and it is
   muted because the heading is what the reader is looking for. */
.th-sort{pointer-events:none;margin-left:4px;color:var(--se-accent)}
/* THE FOLD MARK. It says which way the group stands before the reader clicks,
   and the heading is a pointer so it reads as pressable. */
.tbl-group{cursor:pointer;user-select:none}
/* THE PAGER sits under the table and wears the chrome's own muted voice. */
.bs-pager{display:flex;align-items:center;gap:8px;padding:4px 10px;font-size:11px;color:var(--se-muted)}
.bs-pager[hidden]{display:none}
.bs-pager button{background:none;border:1px solid var(--se-border);color:var(--se-muted);border-radius:3px;cursor:pointer;font:inherit;line-height:18px;padding:0 8px}
.bs-pager button:disabled{opacity:.4;cursor:default}
.bs-per{width:6ch;background:var(--se-bg);border:1px solid var(--se-border);border-radius:3px;color:var(--se-fg);font:inherit;font-size:11px;padding:0 4px}
.grp-fold{pointer-events:none;display:inline-block;width:1.2ch;color:var(--se-muted)}
.th-grip{position:absolute;right:0;top:0;bottom:0;width:6px;cursor:col-resize}
.tbl thead th{position:sticky;position:-webkit-sticky}
.tbl thead th{padding-right:12px}
.tbl thead th{position:sticky}
.tbl th{position:relative}
.tbl tbody tr:hover td{background:var(--se-hover)}
.tbl-link{color:var(--se-accent);text-decoration:none;cursor:pointer}
.tbl-link:hover{text-decoration:underline}
.state-link{color:var(--se-accent);text-decoration:none;cursor:pointer}
.state-link:hover{text-decoration:underline}
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
        if (freshCode !== null && code !== null && !sePlaceIsEdited(code)) code.value = freshCode.value;
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

  // --- the funnel: groups ANDed, rows inside a group ORed -------------------

  function filterPopOf(node) {
    var block = node && node.closest ? node.closest(".bs-block") : null;
    return (block === null ? document : block).querySelector('.bs-pop[data-pop="filter"]');
  }

  function popJson(pop, key) {
    try { return JSON.parse(pop.getAttribute(key)); } catch (e) { return {}; }
  }

  function takesValue(pop, id) {
    var none = (pop.getAttribute("data-noval") || "").split(" ");
    return none.indexOf(id) === -1;
  }

  function opsForProp(pop, prop) {
    var ops = popJson(pop, "data-ops");
    var types = popJson(pop, "data-types");
    var t = prop === "" ? "" : (types[prop] || "");
    return ops[t] || ops[""] || [];
  }

  function tuneValue(pop, row) {
    var o = row.querySelector(".bs-op");
    var v = row.querySelector(".bs-val");
    if (o !== null && v !== null) v.hidden = !takesValue(pop, o.value);
  }

  // THE PROPERTY DECIDES WHICH OPERATORS ARE OFFERED. A stored operator the new
  // type does not offer goes, because the row is being retyped on purpose.
  function retuneRow(pop, row) {
    var p = row.querySelector(".bs-prop");
    var o = row.querySelector(".bs-op");
    if (p === null || o === null) return;
    var list = opsForProp(pop, p.value);
    var want = o.value;
    var still = false;
    var html = "";
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === want) still = true;
      html += '<option value="' + list[i].id + '">' + list[i].label + "</option>";
    }
    o.innerHTML = html;
    if (list.length > 0) o.value = still ? want : list[0].id;
    tuneValue(pop, row);
  }

  function groupTree(pop, group) {
    var raw = group.getAttribute("data-raw");
    if (raw !== null) { try { return JSON.parse(raw); } catch (e) { return null; } }
    var box = group.querySelector(".bs-conds");
    if (box === null) return null;
    var kids = [];
    for (var i = 0; i < box.children.length; i++) {
      var row = box.children[i];
      if (!row.classList.contains("bs-cond")) continue;
      var p = row.querySelector(".bs-prop");
      var o = row.querySelector(".bs-op");
      var v = row.querySelector(".bs-val");
      if (p === null || o === null || p.value === "" || o.value === "") continue;
      var val = v === null ? "" : v.value;
      // AN EMPTY VALUE BOX IS AN UNFINISHED ROW, never a test for the empty
      // string. Writing one would empty the table the moment a property was
      // picked, which is what a control that lies looks like.
      if (takesValue(pop, o.value) && val === "") continue;
      kids.push({ r: { property: p.value, operator: o.value, value: val } });
    }
    if (kids.length === 0) return null;
    return kids.length === 1 ? kids[0] : { or: kids };
  }

  function filterTree(node) {
    var pop = filterPopOf(node);
    if (pop === null) return null;
    var box = pop.querySelector(".bs-groups");
    if (box === null) return null;
    var out = [];
    for (var i = 0; i < box.children.length; i++) {
      var group = box.children[i];
      if (!group.classList.contains("bs-group")) continue;
      var t = groupTree(pop, group);
      if (t !== null) out.push(t);
    }
    return out.length === 0 ? null : { and: out };
  }

  function saveFilters(node) {
    return post(node, "setViewFilters", { posted: filterTree(node) });
  }

  // A TEMPLATE'S CONTENT IS NOT IN THE DOCUMENT, so cloning from one can never
  // pick up a row the reader is editing, and it is there even when every drawn
  // group is raw and there is no row on screen to copy.
  function fromTemplate(pop, cls) {
    var tpl = pop === null ? null : pop.querySelector("." + cls);
    if (tpl === null || !tpl.content) return null;
    var kid = tpl.content.firstElementChild;
    return kid === null ? null : kid.cloneNode(true);
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

    // RESET PUTS THE BOX BACK TO WHAT IS SAVED (owner). A hand edit only
    // applies on save, so until then it is undoable, and the served text is
    // the textarea's own default value — nothing is stored twice to offer it.
    //
    // IT IS THIS BLOCK'S OWN BOX. The editor draws two of these side by side,
    // and resetting the wrong pane's query would be worse than no button.
    if (t.closest(".bs-code-reset") !== null) {
      var mine = t.closest(".bs-block");
      var undo = mine === null ? null : mine.querySelector(".bs-code-text");
      if (undo !== null) undo.value = undo.defaultValue;
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

    var dropCond = t.closest(".bs-drop-cond");
    if (dropCond !== null) {
      var condBlock = dropCond.closest(".bs-block");
      var cond = dropCond.closest(".bs-cond");
      var condGroup = cond.closest(".bs-group");
      var condHolder = cond.parentElement;
      cond.remove();
      // The last condition taking its group with it, because an empty group
      // asks a question nobody meant to ask.
      if (condHolder.querySelectorAll(".bs-cond").length === 0 && condGroup !== null) condGroup.remove();
      saveFilters(condBlock);
      return;
    }

    var addCond = t.closest(".bs-add-cond");
    if (addCond !== null) {
      var ownGroup = addCond.closest(".bs-group");
      var condBox = ownGroup === null ? null : ownGroup.querySelector(".bs-conds");
      var freshCond = fromTemplate(filterPopOf(addCond), "bs-cond-tpl");
      if (condBox !== null && freshCond !== null) condBox.appendChild(freshCond);
      return;
    }

    var addGroup = t.closest(".bs-add-group");
    if (addGroup !== null) {
      var filPop = filterPopOf(addGroup);
      var groupBox = filPop === null ? null : filPop.querySelector(".bs-groups");
      var freshGroup = fromTemplate(filPop, "bs-group-tpl");
      if (groupBox !== null && freshGroup !== null) groupBox.appendChild(freshGroup);
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
    var cond = t.closest(".bs-cond");
    if (cond !== null) {
      var fpop = filterPopOf(cond);
      if (fpop !== null) {
        if (t.classList.contains("bs-prop")) retuneRow(fpop, cond);
        else if (t.classList.contains("bs-op")) tuneValue(fpop, cond);
      }
      saveFilters(cond);
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

  // --- ONE DECIDER FOR WHICH ROWS SHOW --------------------------------------
  //
  // TWO THINGS HIDE A ROW and they share one attribute: a CLOSED GROUP above
  // it, and a PAGE it does not fall on. Two handlers writing the hidden flag
  // would fight, and the loser would be whichever ran second.
  //
  // SO BOTH ARE COMPUTED IN ONE PASS, in this order: the group state decides
  // which rows are candidates, and the page then shows a window of those. A
  // reader who closes a group sees the page refill from what is left.

  var bsPage = {};
  var bsPer = {};

  function bsIdOf(block) {
    return block.getAttribute("data-view") || "";
  }

  // THE ROWS A CLOSED HEADING SWALLOWS, and the headings inside it.
  //
  // WALKING IN ORDER IS ENOUGH. A heading at a depth deeper than the closed one
  // is inside it; the first heading at that depth or shallower ends it.
  function bsCandidates(block) {
    var rows = block.querySelectorAll("tbody tr");
    var closedAt = null;
    var open = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.classList.contains("tbl-group")) {
        var d = Number(r.getAttribute("data-depth") || 0);
        if (closedAt !== null && d <= closedAt) closedAt = null;
        r.hidden = closedAt !== null;
        if (closedAt === null && r.classList.contains("shut")) closedAt = d;
        continue;
      }
      if (closedAt !== null) {
        r.hidden = true;
        continue;
      }
      open.push(r);
    }
    return open;
  }

  function bsShow(block) {
    if (block === null) return;
    var id = bsIdOf(block);
    var per = bsPer[id] === undefined ? 50 : bsPer[id];
    var open = bsCandidates(block);
    var total = open.length;
    var pages = per > 0 ? Math.max(1, Math.ceil(total / per)) : 1;
    var page = Math.min(Math.max(0, bsPage[id] || 0), pages - 1);
    bsPage[id] = page;
    var from = per > 0 ? page * per : 0;
    var to = per > 0 ? from + per : total;
    for (var j = 0; j < total; j++) open[j].hidden = j < from || j >= to;

    var bar = block.querySelector(".bs-pager");
    if (bar === null) return;
    // A PAGER OVER ONE PAGE IS NOISE. It says nothing the count does not.
    bar.hidden = per > 0 && total <= per;
    var where = bar.querySelector(".bs-where");
    if (where !== null) where.textContent = total === 0 ? "nothing to show" : String(from + 1) + "-" + String(Math.min(to, total)) + " of " + String(total);
    var prev = bar.querySelector(".bs-prev");
    var next = bar.querySelector(".bs-next");
    if (prev !== null) prev.disabled = page === 0;
    if (next !== null) next.disabled = page >= pages - 1;
  }

  function bsShowAll() {
    document.querySelectorAll(".bs-block").forEach(bsShow);
  }

  // --- a group heading opens and closes ------------------------------------
  //
  // A GROUP THAT HOLDS HUNDREDS OF ROWS BURIES THE PAGE. The backlog draws
  // every standing pool token, so it ships closed and the reader opens it.
  //
  // THE ROWS ARE ALREADY DRAWN, hidden. Opening costs nothing and fetches
  // nothing, so the reader's place survives it.
  //
  // A LINK INSIDE THE HEADING IS NOT THE HEADING. The group name is a door to
  // its state, and following it must not also fold the group away.

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    if (ev.target.closest("a") !== null) return;
    var head = ev.target.closest("tr.tbl-group");
    if (head === null) return;
    var shut = !head.classList.contains("shut");
    head.classList.toggle("shut", shut);
    var mark = head.querySelector(".grp-fold");
    if (mark !== null) mark.textContent = shut ? "▸" : "▾";
    // THE PAGE REFILLS FROM WHAT IS LEFT. Closing a group of 154 must not leave
    // a page showing four rows and 146 gaps.
    bsPage[bsIdOf(head.closest(".bs-block"))] = 0;
    bsShow(head.closest(".bs-block"));
  });

  // --- the pager: previous, next, and how big a page is ---------------------
  //
  // THE SIZE IS TYPED, NOT PICKED (owner). Every other pager here offers a
  // fixed set of options; this one takes any number, because the right page for
  // a table of 249 is not on anybody's list of four.

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    var step = ev.target.closest(".bs-prev, .bs-next");
    if (step === null) return;
    var block = step.closest(".bs-block");
    var id = bsIdOf(block);
    bsPage[id] = Math.max(0, (bsPage[id] || 0) + (step.classList.contains("bs-next") ? 1 : -1));
    bsShow(block);
  });

  document.addEventListener("change", function (ev) {
    if (!ev.target.closest) return;
    var box = ev.target.closest(".bs-per");
    if (box === null) return;
    var block = box.closest(".bs-block");
    var n = Number(box.value);
    // ZERO AND ANYTHING UNREADABLE MEAN ALL. A reader clearing the box wants
    // the whole table, which is the honest reading of an empty page size.
    bsPer[bsIdOf(block)] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    bsPage[bsIdOf(block)] = 0;
    bsShow(block);
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" || !ev.target.closest) return;
    if (ev.target.closest(".bs-per") === null) return;
    ev.target.blur();
  });

  // THE PAGE IS COMPUTED ON ARRIVAL, not only on a press. A repaint hands back
  // fresh markup with every row visible, and nothing would narrow it again.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bsShowAll);
  else bsShowAll();
  window.seBasesShow = bsShowAll;

  // --- a header click sorts by that column ----------------------------------
  //
  // IT REPLACES EVERY OTHER SORT KEY (owner). One click, one key — the sort menu
  // is where a reader builds a multi-level order, and a header that ADDED a
  // level would make the two controls disagree about what the table is showing.
  //
  // CLICKING THE SORTED COLUMN REVERSES IT. Ascending, then descending, and the
  // arrow in the header says which.
  //
  // GROUPING ALWAYS COMES FIRST and is untouched. This orders rows INSIDE each
  // group, which is what a table header has always meant.
  //
  // THE GRIP IS NOT A HEADER. Its own handler resizes, and a click that landed
  // on it would sort the column the reader was only measuring.

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    if (ev.target.closest(".th-grip") !== null) return;
    var th = ev.target.closest("th[data-col]");
    if (th === null) return;
    var col = th.getAttribute("data-col");
    if (col === null || col === "") return;
    var was = th.getAttribute("data-sort");
    var way = was === "asc" ? "DESC" : "ASC";
    post(th, "setSort", { sort: [{ property: col, direction: way }] });
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
