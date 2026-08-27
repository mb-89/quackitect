// see dsp-the-bucket-editor.md#the-editor-is-the-database
//
// THE EDITOR IS TWO DATABASE PANES, so this file is small on purpose. Sorting,
// grouping, filtering, the counts and the cell editor all belong to the
// database's own client and are not repeated here.
//
// WHAT IS GENUINELY THIS FILE'S:
//
// - opening and closing the dock
// - the seams, which are how the reader splits the width
// - showing one pane or both
// - dragging a row to the other pane, or onto a state
// - ticking rows, and the two acts that need a selection
//
// ADDING WORK IS NOT HERE. It is a control in the entry panel, beside the one
// that captures a note, because both are the same act: putting something into
// the system from the surface.
//
// A MOVE IS A REQUEST, NEVER A WRITE. The drop names the move to the engine,
// which calls the work store. A refused move leaves the row where it was AND
// says why — a row snapping back with no reason is the failure this avoids.
export const WORK_SCRIPT = `
(function () {
  "use strict";

  var carried = null;

  function say(title, html) {
    if (typeof showHelp === "function") showHelp(title, html);
    else console.warn(title, html);
  }

  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }


  // --- opening and closing --------------------------------------------------
  //
  // THE EDITOR AND THE MACHINE SHARE ONE DOCUMENT, and that is not a layout
  // preference. A row is dragged FROM the editor ONTO a state, and no drop
  // crosses two documents — so opening it may never be a navigation.
  //
  // IT SHIPS FOLDED and the same press closes it, because a reader looking at a
  // drawing asked for the drawing.

  function editor() {
    return document.getElementById("work-dock");
  }

  // THE LAYOUT SURVIVES A REOPEN. A reader who set the split once should not
  // have to set it again on the next press.
  var WIDTH_KEY = "se.work.dock.width";
  var SPLIT_KEY = "se.work.pane.split";
  var SHOWN_KEY = "se.work.pane.shown";

  function remember(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage refused; it still stands for this session */ }
  }

  function recall(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function restoreLayout(dock) {
    var w = recall(WIDTH_KEY);
    if (w) dock.style.width = w;
    var split = recall(SPLIT_KEY);
    var left = dock.querySelector('.work-pane[data-side="left"]');
    if (split && left !== null) left.style.flex = "0 0 " + split;
    showSecond(recall(SHOWN_KEY) === "two");
  }

  function openEditor(place) {
    var dock = editor();
    if (dock === null) return;
    restoreLayout(dock);
    dock.hidden = false;
    if (place) lightPlace(place);
  }

  function toggleEditor() {
    var dock = editor();
    if (dock === null) return;
    if (dock.hidden) openEditor("");
    else dock.hidden = true;
  }

  window.seOpenWork = openEditor;

  // THE BUTTON BESIDE ESCAPE, on the machine's own surface. A reader looking at
  // a drawing is looking at the drawing, not at a controls bar.
  document.addEventListener("click", function (ev) {
    if (ev.target.closest && ev.target.closest("#work-btn")) toggleEditor();
  });

  // --- one column, or two ---------------------------------------------------
  //
  // A SECOND COLUMN IS FOR DRAGGING BETWEEN (owner). A reader who is only
  // reading wants the width, so it ships shut and one press opens it.
  //
  // THE SEAM GOES WITH THE COLUMN IT SPLITS. A seam with nothing on one side of
  // it sizes nothing, and a reader dragging it would see no answer.

  function showSecond(open) {
    var dock = editor();
    if (dock === null) return;
    var right = dock.querySelector('.work-pane[data-side="right"]');
    var seam = dock.querySelector('.work-seam[data-seam="panes"]');
    if (right !== null) right.hidden = !open;
    if (seam !== null) seam.hidden = !open;
    // THE LEFT PANE TAKES EVERYTHING BACK when the second shuts. A remembered
    // split over one column would leave a dead strip where the other one was.
    var left = dock.querySelector('.work-pane[data-side="left"]');
    if (left !== null && !open) left.style.flex = "1 1 0";
    var button = dock.querySelector(".work-second");
    if (button !== null) {
      button.setAttribute("aria-pressed", open ? "true" : "false");
      button.classList.toggle("on", open);
    }
    remember(SHOWN_KEY, open ? "two" : "one");
  }

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    var second = ev.target.closest(".work-second");
    if (second === null) return;
    showSecond(second.getAttribute("aria-pressed") !== "true");
  });

  // --- a pill opens the editor at that bucket -------------------------------
  //
  // THE DETAILS PANEL MUST NOT SEE THIS PRESS. Its handler and this one both sit
  // on the document, so stopping the bubble from a bubble listener stops
  // nothing — registration order decides, and it is not ours to decide. This one
  // runs in the CAPTURE phase, ahead of every bubble listener whatever order
  // they were added in.

  // THE GROUP HEADING IS THE BUCKET. The view groups by the bucket falling back
  // to the place, so lighting one is finding its heading and scrolling to it.
  function lightPlace(place) {
    var heads = document.querySelectorAll(".work-pane .tbl-group, .work-pane .bs-group");
    for (var i = 0; i < heads.length; i++) {
      if ((heads[i].textContent || "").indexOf(place) < 0) continue;
      heads[i].scrollIntoView({ block: "nearest" });
      heads[i].classList.add("work-lit");
      return;
    }
  }

  // WHERE THE EDITOR STANDS, so a navigation out of it can carry it back. The
  // lit heading is the reader's place; an editor open with nothing lit still
  // reports, so it comes back open rather than folded.
  //
  // OPEN_ONLY IS A SENTINEL, NOT A NAME. A heading really called "-" simply
  // re-lights nothing, which is what an unlit editor wanted anyway.
  var OPEN_ONLY = "-";

  window.seWorkAt = function () {
    var dock = editor();
    if (dock === null || dock.hidden) return null;
    var lit = dock.querySelector(".work-lit .grp-val");
    var name = lit === null ? "" : (lit.textContent || "").trim();
    return name === "" ? OPEN_ONLY : name;
  };

  // AND IT COMES BACK WHERE IT WAS. This reads the editor's own place off the
  // URL. It is not a navigation, and nothing in this file ever performs one.
  var carriedPlace = new URLSearchParams(location.search).get("work");
  if (carriedPlace !== null && carriedPlace !== "") openEditor(carriedPlace === OPEN_ONLY ? "" : carriedPlace);

  document.addEventListener(
    "click",
    function (ev) {
      var hit = ev.target.closest ? ev.target.closest(".work-pill-hit") : null;
      if (hit === null) return;
      ev.preventDefault();
      ev.stopPropagation();
      var said = (hit.getAttribute("data-detail") || "").split(":");
      openEditor(said[1] || "");
    },
    true,
  );

  // --- ticking rows ---------------------------------------------------------
  //
  // SELECTION IS A CLICK ON THE ROW, and that is deliberate: a checkbox column
  // would have to be added to every table in the product to serve one editor.
  //
  // THE STATEMENT IS A DOOR AND KEEPS ITS PRESS. Clicking it opens the note, so
  // the tick is every other part of the row.

  function ticked() {
    return Array.prototype.slice.call(document.querySelectorAll(".work-pane tr.work-ticked"));
  }

  // THE BUTTONS SAY WHAT THEY CAN DO. A count nobody can see turns a dead button
  // into a mystery, so the header carries the number as well as the state.
  function countTicked() {
    var rows = ticked();
    var label = document.querySelector(".work-picked");
    var bucket = document.querySelector(".work-bucket");
    var rename = document.querySelector(".work-rename");
    if (label !== null) {
      label.textContent = rows.length === 0 ? "nothing selected" : String(rows.length) + " selected";
      label.setAttribute("data-count", String(rows.length));
    }
    if (bucket !== null) bucket.disabled = rows.length === 0;
    // RENAMING NEEDS A BUCKET, not merely a selection. A row whose grouping is
    // its place has no bucket to rename, and a place is the drawing's name.
    if (rename !== null) rename.disabled = bucketOf(rows[0]) === "";
  }

  function bucketOf(row) {
    if (!row) return "";
    var cell = row.querySelector('[data-key="bucket"]');
    if (cell !== null) return (cell.getAttribute("data-raw") || "").trim();
    // THE COLUMN IS NOT ALWAYS SHOWN, so the group heading answers instead. It
    // carries the value the view grouped by, which IS the bucket where one
    // stands and the place where none does.
    var head = groupHeadOf(row);
    var here = head === null ? "" : (head.querySelector(".grp-val") || {}).textContent || "";
    return here.trim() === rowPlace(row) ? "" : here.trim();
  }

  // EVERY HEADING STANDING OVER A ROW, the outermost one first.
  //
  // THE NEAREST HEADING IS NO LONGER THE PLACE. The editor groups twice — by
  // place, then by bucket — so the row's immediate heading names in, pending or
  // out, and the place is one level further up.
  //
  // A SMALLER DEPTH IS AN ANCESTOR. Walking back, each heading shallower than
  // everything seen so far is the next parent up; the rest are siblings.
  function headsOver(el) {
    var out = [];
    var seen = 99;
    var at = el.previousElementSibling;
    while (at !== null) {
      if (at.classList && at.classList.contains("tbl-group")) {
        var d = Number(at.getAttribute("data-depth") || 0);
        if (d < seen) {
          out.unshift(at);
          seen = d;
        }
      }
      at = at.previousElementSibling;
    }
    return out;
  }

  // THE HEADING THAT NAMES WHERE THE WORK IS DONE, which is the outermost one.
  function groupHeadOf(row) {
    var chain = headsOver(row);
    return chain.length === 0 ? null : chain[0];
  }

  function groupValueOf(head) {
    return ((head.querySelector(".grp-val") || {}).textContent || "").trim();
  }

  // EVERY COLUMN SELECTS, THE FIRST ONE INCLUDED (owner). Not being editable
  // is not a reason not to be selectable, and a reader ticking four rows should
  // not have to aim at the second column to do it.
  //
  // THE NOTE OPENS ON A DOUBLE PRESS. One press is the common act and gets the
  // cheap gesture; opening the markdown is the rarer one.
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest) return;
    var row = ev.target.closest(".work-pane tr[data-path]");
    if (row === null) return;
    // A LINK WOULD NAVIGATE. The press is the reader's selection, not a visit.
    ev.preventDefault();
    row.classList.toggle("work-ticked");
    countTicked();
  });

  document.addEventListener("dblclick", function (ev) {
    if (!ev.target.closest) return;
    var door = ev.target.closest(".work-pane .tbl-opens");
    if (door === null) return;
    var link = door.querySelector(".doclink");
    if (link !== null) link.click();
  });

  // --- the two acts that need a selection -----------------------------------
  //
  // A BUCKET IS THE PERSON'S OWN NAME FOR A GROUP. It does not move the work:
  // the place stays exactly as it was, and only the grouping changes. That is
  // the whole difference between a bucket and a place.

  // NO DIALOG ANYWHERE. A webview refuses a browser prompt outright, so the
  // control that asked for one did nothing at all when pressed — no bucket, no
  // error, nothing. The bucket is made first and named afterwards.
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || ev.target.closest(".work-bucket") === null) return;
    var rows = ticked();
    if (rows.length === 0) return;
    // AN EMPTY NAME ASKS THE ENGINE FOR A FRESH ONE. It knows what is already
    // taken, and the client would have to guess.
    send("/work/bucket", { paths: rows.map(function (r) { return r.getAttribute("data-path"); }), bucket: "" });
  });

  // A PLACE CAN NEVER BE RENAMED FROM HERE, and the refusal says so rather than
  // quietly doing nothing. A place is the drawing's name for a state.
  //
  // THE NAME IS TYPED IN THE HEADER. The field appears beside the button, and
  // Enter commits it. No dialog, because a webview has none.
  function renameField() {
    return document.querySelector(".work-rename-field");
  }

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || ev.target.closest(".work-rename") === null) return;
    var rows = ticked();
    var from = bucketOf(rows[0]);
    if (from === "") {
      say("that is a place, not a bucket", "<p>A place is the drawing's name for a state, and renaming it belongs to the drawing.</p><p>File the rows into a bucket of your own first — then the bucket can be renamed.</p>");
      return;
    }
    var box = renameField();
    if (box === null) return;
    box.hidden = false;
    box.value = from;
    box.setAttribute("data-from", from);
    box.focus();
    box.select();
  });

  document.addEventListener("keydown", function (ev) {
    if (!ev.target.closest || ev.target.closest(".work-rename-field") === null) return;
    var box = ev.target;
    if (ev.key === "Escape") { box.hidden = true; return; }
    if (ev.key !== "Enter") return;
    var from = box.getAttribute("data-from") || "";
    var to = box.value.trim();
    box.hidden = true;
    if (to === "" || to === from) return;
    send("/work/bucket/rename", { from: from, to: to });
  });

  // --- the drag: a row leaves one pane and lands on a state -----------------

  document.addEventListener("dragstart", function (ev) {
    var row = ev.target.closest ? ev.target.closest(".work-pane tr[data-path]") : null;
    if (row === null) return;
    carried = row.getAttribute("data-path");
    // THE ZONES SHOW WHILE A ROW IS IN THE AIR. Nothing on the drawing hints at
    // them otherwise, and three permanent targets per state would be noise.
    document.body.classList.add("work-dragging");
    ev.dataTransfer.effectAllowed = "move";
    try { ev.dataTransfer.setData("text/plain", carried); } catch (e) { /* some hosts refuse the payload */ }
  });

  function landed() {
    carried = null;
    document.body.classList.remove("work-dragging");
    var marked = document.querySelectorAll(".work-drop-target");
    for (var i = 0; i < marked.length; i++) marked[i].classList.remove("work-drop-target");
  }

  document.addEventListener("dragend", landed);

  // THREE KINDS OF DESTINATION, and a drop reads the same way for all of them.
  //
  // - A BUCKET ZONE on a state. It says where AND which bucket.
  // - A STATE's own body. It says where, and leaves the bucket to derive.
  // - A GROUP INSIDE THE EDITOR, in either column. It says which grouping, and
  //   the grouping is a bucket where somebody named one and a place otherwise.
  function targetUnder(ev) {
    if (!ev.target.closest) return null;
    // THE ZONE IS TESTED FIRST because it sits inside the state it belongs to,
    // and the more specific answer is the one the reader aimed at.
    var zone = ev.target.closest("[data-drop]");
    if (zone !== null) {
      var said = zone.getAttribute("data-drop").split(":");
      return { el: zone, to: said[0], slot: said[1] || "", kind: "state" };
    }
    var g = ev.target.closest('g.clickable[data-detail^="state:"]');
    if (g !== null) return { el: g, to: g.getAttribute("data-detail").slice("state:".length), slot: "", kind: "state" };
    if (ev.target.closest(".work-pane") === null) return null;
    return groupUnder(ev);
  }

  // A DROP INSIDE THE EDITOR LANDS IN A GROUP (owner). Dropping on a heading is
  // the plain way to say it; dropping on a row means the group that row is in.
  //
  // IT WORKS IN BOTH COLUMNS AND ACROSS THEM, because a group is a group
  // wherever it is drawn. Nothing here asks which pane it was.
  //
  // A NESTED HEADING NAMES A BUCKET, NEVER A PLACE OF ITS OWN. Dropping on the
  // output heading means this state's output, so the place travels as the
  // destination and the bucket travels beside it as the slot. Sending the
  // bucket's name alone filed a bucket by that name and moved nothing.
  function groupUnder(ev) {
    var head = ev.target.closest(".tbl-group");
    var chain;
    if (head === null) {
      var row = ev.target.closest("tr[data-path]");
      if (row === null) return null;
      chain = headsOver(row);
    } else {
      chain = headsOver(head).concat([head]);
    }
    if (chain.length === 0) return null;
    var value = groupValueOf(chain[0]);
    if (value === "" || value === EMPTY_GROUP) return null;
    var slot = chain.length > 1 ? groupValueOf(chain[chain.length - 1]) : "";
    if (slot === EMPTY_GROUP) slot = "";
    return { el: head === null ? chain[chain.length - 1] : head, to: value, slot: slot, kind: "group" };
  }

  // THE EMPTY GROUP IS NOT A DESTINATION. It is where rows with no value at all
  // collect, and filing into it would mean filing into nothing.
  var EMPTY_GROUP = "—";

  // THE PLACE COLUMN, READ OFF THE ROW. The view orders statement, place,
  // status, and the cell carries its own key — so this asks rather than counting
  // columns, which a reordered view would break.
  function rowPlace(row) {
    var cell = row.querySelector('[data-key="place"]');
    return cell === null ? "" : (cell.getAttribute("data-raw") || cell.textContent || "").trim();
  }

  document.addEventListener("dragover", function (ev) {
    if (carried === null) return;
    var t = targetUnder(ev);
    if (t === null) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    t.el.classList.add("work-drop-target");
  });

  document.addEventListener("dragleave", function (ev) {
    var t = targetUnder(ev);
    if (t !== null) t.el.classList.remove("work-drop-target");
  });

  document.addEventListener("drop", function (ev) {
    if (carried === null) return;
    var t = targetUnder(ev);
    if (t === null) return;
    ev.preventDefault();
    var path = carried;
    landed();
    // TWO DESTINATIONS, TWO ACTS. Landing on a state MOVES the work; landing on
    // a group inside the editor FILES it under that grouping and moves nothing.
    //
    // THE ENGINE TELLS THEM APART. A group whose name is a place is a move, and
    // one whose name is a bucket is a filing — the client cannot know which, so
    // it says where the row landed and lets the store decide.
    if (t.kind === "group") send("/work/regroup", { paths: [path], group: t.to, slot: t.slot });
    else send("/work/move", { path: path, to: t.to, slot: t.slot });
  });

  // --- every seam is dragged the same way -----------------------------------
  //
  // TWO SEAMS, ONE MECHANISM. One splits the two panes, one splits the editor
  // from the drawing. The seam says which it is, and nothing else differs.
  //
  // A POINTER DRAG, NOT AN HTML DRAG. The row drag already owns dragstart, and
  // a second drag source on the same surface fights it for every press.

  var sizing = null;

  document.addEventListener("pointerdown", function (ev) {
    if (!ev.target.closest) return;
    var seam = ev.target.closest(".work-seam");
    if (seam === null) return;
    var dock = editor();
    if (dock === null) return;
    var which = seam.getAttribute("data-seam");
    var sized = which === "dock" ? dock : dock.querySelector('.work-pane[data-side="left"]');
    if (sized === null) return;
    ev.preventDefault();
    // EVERY SEAM HERE DRAGS LEFT AND RIGHT, because everything it splits is
    // side by side: the editor is left of the drawing, and the first column is
    // left of the second.
    //
    // THIS IS WHY THE SEAM WENT DEAD. It was reading the pointer's Y and
    // setting a height while the layout was a row, so it moved nothing at all
    // and looked like a bar that could not be dragged.
    sizing = { at: ev.clientX, from: sized.getBoundingClientRect().width, which: which, el: sized, seam: seam };
    try { seam.setPointerCapture(ev.pointerId); } catch (e) { /* the move handler still tracks it */ }
    seam.classList.add("work-gripping");
  });

  document.addEventListener("pointermove", function (ev) {
    if (sizing === null) return;
    var want = Math.max(220, sizing.from + (ev.clientX - sizing.at));
    var px = String(Math.round(want)) + "px";
    // THE DOCK TAKES A WIDTH AND A PANE TAKES A BASIS. A pane is one of two
    // flex children, so setting its width alone would be overridden by the
    // grow it already has.
    if (sizing.which === "dock") sizing.el.style.width = px;
    else sizing.el.style.flex = "0 0 " + px;
  });

  document.addEventListener("pointerup", function () {
    if (sizing === null) return;
    sizing.seam.classList.remove("work-gripping");
    if (sizing.which === "dock") remember(WIDTH_KEY, sizing.el.style.width);
    else remember(SPLIT_KEY, sizing.el.style.flex.replace("0 0 ", ""));
    sizing = null;
  });

  // --- one place that talks to the engine ----------------------------------

  // THE CARD REDRAWS ITSELF. Not the page: a navigation discards the scroll, the
  // open details and the machine's zoom, which is the reader's place.
  function redraw() {
    return fetch("/widget/work").then(function (r) { return r.text(); }).then(function (html) {
      var here = editor();
      var fresh = new DOMParser().parseFromString(html, "text/html").getElementById("work-dock");
      if (here === null || fresh === null) {
        say("the work moved and the card could not redraw itself", "<p>The move went through. Reopening the editor will show it.</p>");
        return;
      }
      var wasOpen = !here.hidden;
      here.innerHTML = fresh.innerHTML;
      here.hidden = !wasOpen;
      // THE LAYOUT IS THE READER'S AND A REDRAW IS NOT A RESET. The fresh markup
      // carries this renderer's defaults, so the reader's split is put back.
      restoreLayout(here);
      countTicked();
      // THE PAGE AND THE CLOSED GROUPS ARE THE READER'S TOO. Fresh markup draws
      // every row visible, and nothing would narrow it again.
      if (typeof window.seBasesShow === "function") window.seBasesShow();
      // THE DRAWING FOLLOWS IN THE SAME BREATH. Waiting for the next poll is
      // what made a move look like it had not happened, and the reader closed
      // the machine and opened it again to see their own act.
      if (typeof refresh === "function") refresh();
    });
  }

  window.seRedrawWork = redraw;

  function send(where, body) {
    return fetch(where, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); }).then(function (answer) {
      if (answer === null || answer.ok !== true) {
        // A REFUSED ACT SAYS WHY. The row is exactly where it was, and a row
        // snapping back with no reason is the failure this names.
        say("the work editor was refused", "<p>" + esc((answer && answer.error) || "the engine refused it and said nothing") + "</p>");
        return;
      }
      return redraw();
    }).catch(function (e) {
      say("the engine could not be reached", "<p>" + esc(String(e)) + "</p>");
    });
  }
})();
`;
