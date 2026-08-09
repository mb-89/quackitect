// THE TRACE-GRAPH CARD — the filters as a header bar, then the drawing.
//
// IT INVENTS NO SURFACE. The cards are the machine view's state nodes, class
// for class. A click reaches the details panel through `clickable` and
// `data-detail`, the same path every other element takes. Only the rings, the
// edges and the pills are new here, because nothing else draws those.
import { relative, sep } from "node:path";
import { layoutTrace, loadTrace, rootsOf, TRACE_LEVELS, traceSvg, visionText } from "./trace.ts";
import { traceSubsegments } from "./traceschema.ts";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** THE PILL RULE, ported from v1's req-filter-pill-rule: one column per
 *  dimension, the header naming the category and the chips carrying its
 *  values with counts. An empty value stays visible and clickable, showing
 *  zero. The columns sit side by side in the header bar. */
function pillColumn(title: string, dim: string, values: { id: string; label: string; n: number }[], on: string[]): string {
  const chips = values
    .map((v) => {
      const sel = on.includes(v.id) ? " on" : "";
      return `<button type="button" class="pill${sel}" data-dim="${dim}" data-value="${esc(v.id)}">${esc(v.label)}<span class="pill-n">${v.n}</span></button>`;
    })
    .join("");
  return `<div class="pill-col"><div class="pill-head">${esc(title)}</div><div class="pill-chips">${chips}</div></div>`;
}

const FILTER_HELP = [
  "Three filters, and every one of them REDRAWS the graph rather than greying it out.",
  "",
  "VALUE PROP — which props get a wedge of the circle. Nothing selected means not filtered: every prop is drawn. Selecting fewer widens each wedge and pulls the rings inward.",
  "",
  "TYPE — which trace levels get a ring. A type left out is removed, and the rings close over the gap.",
  "",
  "FIND — free text over every node's id, its statement, and EVERY FRONTMATTER FIELD. So `must` finds what a priority says, and `priority:must` narrows to that field. Matching is case-insensitive substring.",
  "",
  "A find match keeps its whole line of descent: the node, and every ancestor up to the vision. So a value prop stays when a requirement under it matches.",
  "",
  "CORPUS — which tree the nodes are read from. Trunk is what has landed. An OPEN record carries trunk plus everything it has authored, so pick the record to see work in flight. This is a choice rather than a guess, because a whole-corpus view belongs to no single record.",
].join("\n");

export function traceCard(
  root: string,
  selected: string[],
  types: string[],
  find: string,
  expand: string,
  // THE PATH A READER CLICKS is resolved by the HOST against the project
  // root, so it is written from there — a node in a record's worktree comes
  // out under .worktrees/, which opens, rather than a trunk path that does
  // not exist.
  projectRoot: string = root,
  corpora: { id: string; label: string }[] = [],
  corpus = "",
  // THE CENTRE. Empty means the vision, which is where the drawing starts by
  // default. A node id here re-roots the whole picture on that node.
  origin = "",
): string {
  const all = loadTrace(root);
  const props = all.filter((n) => n.type === TRACE_LEVELS[0]);
  const rootOf = rootsOf(all);
  const propValues = props.map((p) => ({
    id: p.id,
    label: p.id.replace(/^vp-/, ""),
    n: all.filter((n) => rootOf.get(n.id) === p.id).length,
  }));
  const typeValues = TRACE_LEVELS.map((t) => ({ id: t, label: t, n: all.filter((n) => n.type === t).length }));
  // THE CARD CARRIES ITS OWN SUBJECTS, because it renders lazily and so is not
  // in the page's data island. detailFor reads this by id.
  const subjects: Record<string, { statement: string; type: string; path: string }> = {
    vision: { statement: visionText(root), type: "vision", path: "the motivation gate's report" },
    filter: { statement: FILTER_HELP, type: "filter", path: "value prop · type · find" },
  };
  // THE NODE'S OWN FILE, never a path built from its id. The built one
  // dropped the type folder, so every link on the graph pointed at a file
  // that has never existed.
  for (const n of all) {
    const file = n.file === undefined ? "" : relative(projectRoot, n.file).split(sep).join("/");
    subjects[n.id] = { statement: n.statement, type: n.type, path: file };
  }
  const data = `<script type="application/json" id="se-trace">${JSON.stringify(subjects).replace(/</g, "\\u003c")}</script>`;
  const body =
    props.length === 0
      ? '<div class="meta" style="padding:10px 12px">no trace nodes yet — the graph draws as project/spec/trace/ fills</div>'
      : '<div class="trace-filters clickable" data-detail="trace:filter">' +
        `${pillColumn("value prop", "prop", propValues, selected)}${pillColumn("type", "type", typeValues, types)}` +
        // ONE COLUMN FOR THE THREE FIELDS (owner ruling 2026-08-07). Find,
        // centre and source each had a column of their own, which spent the
        // whole width of the bar on three one-line controls.
        //
        // NOW THEY STACK: a label and its editor per row, three rows, one
        // column. The pill columns are lists and stay as they are.
        '<div class="pill-col trace-fields">' +
        '<label class="trace-field"><span class="pill-head">find</span>' +
        `<input class="trace-find" type="search" placeholder="id, statement, frontmatter…" value="${esc(find)}"></label>` +
        // THE CENTRE re-roots the drawing on a node. Emptying it goes back to
        // the vision. Double-clicking a card fills it.
        '<label class="trace-field"><span class="pill-head">centre</span>' +
        `<input class="trace-find trace-origin" type="search" placeholder="a node id — blank is the vision" value="${esc(origin)}"></label>` +
        (corpora.length < 2
          ? ""
          : '<label class="trace-field"><span class="pill-head">source</span>' +
            `<select class="trace-corpus">${corpora
              .map((c) => `<option value="${esc(c.id)}"${c.id === corpus ? " selected" : ""}>${esc(c.label)}</option>`)
              .join("")}</select></label>`) +
        "</div></div>" +
        `<div class="trace-canvas">${traceSvg(layoutTrace(all, selected, { types, find, origin }, traceSubsegments(root)))}</div>${data}`;
  return `<div class="widget" id="w-trace"><div class="widget-head"><span>trace graph</span>${expand}</div><div class="widget-body">${body}</div></div>`;
}

export const TRACE_STYLE = `
/* The filters are a HEADER BAR; the graph gets the whole panel under it. */
#w-trace .widget-body { display:flex; flex-direction:column; min-height:0; }
.trace-filters { display:flex; gap:14px; padding:8px 10px; border-bottom:1px solid var(--se-line);
  flex:none; align-items:flex-start; overflow-x:auto; }
.pill-col { display:flex; flex-direction:column; gap:4px; min-width:0; }
/* THE THREE FIELDS SHARE ONE COLUMN (owner ruling 2026-08-07), stacked as
   label-then-editor rows. A row is a grid so every editor starts at the same
   x whatever its label is called. */
.trace-fields { gap:5px; }
.trace-field { display:grid; grid-template-columns:48px minmax(0,1fr); align-items:center; gap:8px; }
.trace-field .pill-head { text-align:right; }
.pill-head { font-size:11px; color:var(--se-muted); }
/* A column past ten values scrolls, v1's own rule. */
.pill-chips { display:flex; flex-direction:column; gap:3px; max-height:150px; overflow:auto; }
/* A CONTROL MUST LOOK LIKE ONE (owner, 2026-08-06). These all drew on
   --se-line, which is the hairline the panels are divided by — far too faint
   to read as an edge. A pill that looks like text is not a button, and a
   borderless box is not a field. --se-border-strong is the host's own
   interactive edge, so nothing here picks a colour of its own. */
.pill { display:flex; justify-content:space-between; gap:8px; padding:3px 8px; border:1px solid var(--se-border-strong);
  border-radius:9px; background:var(--se-raised); color:var(--se-fg); font:inherit; font-size:11px; cursor:pointer; text-align:left; }
.pill:hover { border-color:var(--se-accent); }
.pill.on { border-color:var(--se-accent); color:var(--se-accent); }
.pill-n { color:var(--se-muted); }
/* THE NEIGHBOURHOOD, LIT (owner, 2026-08-06). Nothing changes colour — the
   rest DIMS. The drawing keeps its own palette, so the eye still reads type
   and level from it while the question "what does this touch" is answered. */
svg.trace.lit .trace-node { opacity:0.22; }
svg.trace.lit .trace-edge { opacity:0.1; }
svg.trace.lit .trace-node.on, svg.trace.lit .trace-node.near { opacity:1; }
svg.trace.lit .trace-edge.on { opacity:1; stroke:var(--se-accent); }
svg.trace.lit .trace-node.on rect { stroke:var(--se-accent); stroke-width:3; }
.trace-find { appearance:none; -webkit-appearance:none; padding:3px 7px; font:inherit; font-size:11px; min-width:190px;
  background:var(--se-raised); color:var(--se-fg); border:1px solid var(--se-border-strong); border-radius:3px; }
.trace-find:focus { border-color:var(--se-accent); outline:none; }
/* THE SOURCE PICKER. A native select paints itself from the OS unless both it
   AND its options are told the host's colours — white-on-black otherwise. The
   caret is drawn here because appearance:none takes the platform's away, and
   without it nothing says the box drops down. */
.trace-corpus { appearance:none; -webkit-appearance:none; padding:3px 22px 3px 7px; font:inherit; font-size:11px;
  min-width:190px; background:var(--se-raised); color:var(--se-fg); border:1px solid var(--se-border-strong);
  border-radius:3px; cursor:pointer;
  background-image:linear-gradient(45deg,transparent 50%,var(--se-muted) 50%),linear-gradient(135deg,var(--se-muted) 50%,transparent 50%);
  background-position:calc(100% - 13px) 50%, calc(100% - 8px) 50%; background-size:5px 5px, 5px 5px; background-repeat:no-repeat; }
.trace-corpus:hover { border-color:var(--se-accent); }
.trace-corpus:focus { border-color:var(--se-accent); outline:none; }
.trace-corpus option { background:var(--se-bg-side); color:var(--se-fg); }
.trace-canvas { flex:1; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; }
svg.trace { width:100%; height:100%; cursor:grab; touch-action:none; }
svg.trace.grabbing { cursor:grabbing; }
/* THE LEVEL SEPARATORS ARE DASHED (owner, 2026-08-06). They are not edges
   between nodes — they divide the rings — so the no-dashed-edges rule of
   2026-08-05 does not reach them. Solid on --se-line they were invisible. */
.trace-ring { fill:none; stroke:var(--se-border-strong); stroke-dasharray:7 9; }
/* THE MAP AT ALTITUDE (owner design 2026-08-07). Two layers, one fading in as
   the other fades out. The alphas are set by the client from the viewBox, so
   the drawing never asks the server what zoom it is at.

   THE DEFAULTS MATTER: a page that has not run its script yet shows the cards,
   because that is the drawing people know. The arcs arrive when the reader
   pulls back. */
/* EVERY NUMBER BELOW IS A DEFAULT the look file overrides. Editing
   brand/trace.css beats these without touching code; see look() in render.ts. */
svg.trace { --se-card-alpha:1; --se-band-alpha:0; --se-spoke-alpha:0.1; }
svg.trace .trace-node, svg.trace .trace-edge { opacity:var(--se-card-alpha); }
/* THE RINGS ARE OFF (owner ruling 2026-08-07): the sector outlines say where
   a level starts and ends, so the dashed circles were saying it twice. Turn
   --trace-ring-alpha up in the look file to bring them back. */
.trace-ring { opacity:var(--trace-ring-alpha, 0); }
.trace-bands { opacity:var(--se-band-alpha); pointer-events:none; }
svg.trace.bands-live .trace-bands { pointer-events:auto; cursor:pointer; }
.trace-spokes { opacity:var(--se-spoke-alpha); pointer-events:none; }
/* THE CUTS IN THE CAKE. A section boundary runs the whole way out and reads as
   a line. A slice boundary parts design from tests INSIDE a section, so it is
   quieter and dashed: it divides less. */
.trace-spoke { stroke:var(--trace-spoke-stroke, var(--se-border-strong)); fill:none; }
.trace-spoke.section { stroke-width:var(--trace-spoke-width, 2); }
.trace-spoke.slice { stroke-width:var(--trace-cut-width, 1.2); stroke-dasharray:var(--trace-cut-dash, 10 14); }
/* THE PIE. A faint outline always, so a reader can SEE what they would hit
   before they hit it (owner ruling 2026-08-07). A wash and a brighter edge
   under the pointer. It is a target, not a decoration. */
.trace-sector { fill:transparent; cursor:pointer;
  stroke:var(--trace-spoke-stroke, var(--se-border-strong));
  stroke-width:var(--trace-sector-width, 1);
  stroke-opacity:var(--trace-sector-line, 0.18); }
.trace-sector:hover { fill:var(--trace-hover, var(--se-accent)); fill-opacity:var(--trace-sector-hover, 0.06);
  stroke:var(--trace-hover, var(--se-accent)); stroke-opacity:var(--trace-sector-line-hover, 0.85);
  stroke-width:var(--trace-sector-width-hover, 2); }
.trace-ringlabel { fill:var(--trace-cut-fill, var(--se-muted)); letter-spacing:0.1em; pointer-events:none;
  opacity:var(--se-band-alpha); }
.trace-band { fill:var(--trace-cut-fill, var(--se-muted)); letter-spacing:0.08em; text-transform:lowercase; }
.trace-band.segment { fill:var(--trace-band-fill, var(--se-fg)); font-weight:600; }
.trace-band:hover { fill:var(--trace-hover, var(--se-accent)); }
.trace-edge { stroke:var(--se-muted); stroke-width:1.4; }
/* NO DASHED BORDERS ANYWHERE (owner, 2026-08-05). The vision's edges are
   implicit — no node declares them — and they are still DRAWN, which is what
   was asked for. Marking them apart was not. */
`;

/** LIVE FILTERING, PAN, ZOOM and the ANCHOR.
 *
 *  Every filter redraws on the server, because the rings move when the
 *  contents change and dimming would leave the geometry lying.
 *
 *  A redraw must not throw the reader across the canvas, so the node nearest
 *  the middle before the change is the ANCHOR: it keeps its exact place and
 *  its exact size, and everything else moves around it. Only when the anchor
 *  itself is filtered away does the view reset. */
export const TRACE_SCRIPT = `
(function(){
  function svgEl(){ return document.querySelector('#w-trace svg.trace'); }
  function on(dim){ return Array.from(document.querySelectorAll('#w-trace .pill[data-dim="'+dim+'"].on')).map(function(b){return b.dataset.value}); }
  function query(){ var f = document.querySelector('#w-trace .trace-find:not(.trace-origin)'); return f && f.value ? f.value : ''; }
  function corpus(){ var c = document.querySelector('#w-trace .trace-corpus'); return c && c.value ? c.value : ''; }
  function origin(){ var o = document.querySelector('#w-trace .trace-origin'); return o && o.value ? o.value.trim() : ''; }
  // THE MAP AT ALTITUDE (owner design 2026-08-07). Zoomed far out the cards
  // are specks nobody can read, so they fade back and the section arcs take
  // over. Zoom in and it reverses.
  //
  // NOTHING REACHES ZERO (owner ruling 2026-08-07). Far out, the cards still
  // carry the STRUCTURE even when the words are unreadable, and the
  // separators still say where one section ends. Both floors are dials.
  //
  // THE MEASURE IS THE VIEWBOX. How much of the whole drawing is on screen IS
  // the zoom, and it needs no state of its own — a wheel, a pan and a resize
  // all move the same number.
  //
  // EVERY DIAL IS READ FROM THE PAGE, not written here. brand/trace.css sets
  // them, the browser resolves them, and this reads what it resolved — so an
  // edit to that file lands on the next paint with no restart and no rebuild.
  function dial(s, name, fallback){
    var v = parseFloat(getComputedStyle(s).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }
  // A ramp between two thresholds, clamped, then lifted off the floor.
  function ramp(x, full, gone, floor){
    var t = (gone - x) / (gone - full || 1);
    return floor + (1 - floor) * Math.max(0, Math.min(1, t));
  }
  function crossfade(){
    var s = svgEl(); if(!s) return;
    var vb = s.viewBox.baseVal;
    var whole = Number(s.dataset.whole || 0) || vb.width || 1;
    var showing = vb.width / whole;
    var cards = ramp(showing, dial(s,'--trace-card-full',0.28), dial(s,'--trace-card-gone',0.58), dial(s,'--trace-card-floor',0.22));
    // The bands run the OTHER way: full strength far out, faded close in.
    var bands = ramp(-showing, -dial(s,'--trace-band-full',0.5), -dial(s,'--trace-band-gone',0.22), dial(s,'--trace-band-floor',0));
    var spokes = ramp(-showing, -dial(s,'--trace-spoke-full',0.55), -dial(s,'--trace-spoke-gone',0.2), dial(s,'--trace-spoke-floor',0.1));
    s.style.setProperty('--se-card-alpha', String(cards));
    s.style.setProperty('--se-band-alpha', String(bands));
    s.style.setProperty('--se-spoke-alpha', String(spokes));
    s.classList.toggle('bands-live', bands > 0.35);
  }
  function centreOf(g){ var b = g.getBBox(); return { x: b.x + b.width/2, y: b.y + b.height/2 }; }
  function anchor(){
    var s = svgEl(); if(!s) return null;
    var vb = s.viewBox.baseVal, cx = vb.x + vb.width/2, cy = vb.y + vb.height/2;
    var best = null, bestD = Infinity;
    s.querySelectorAll('.trace-node').forEach(function(g){
      var p = centreOf(g), d = (p.x-cx)*(p.x-cx) + (p.y-cy)*(p.y-cy);
      if(d < bestD){ bestD = d; best = { id: g.dataset.detail, dx: p.x - vb.x, dy: p.y - vb.y, w: vb.width, h: vb.height }; }
    });
    return best;
  }
  function reanchor(a){
    if(!a) return;
    var s = svgEl(); if(!s) return;
    var g = s.querySelector('.trace-node[data-detail="' + a.id + '"]');
    if(!g) return;               // the anchor was filtered away: keep the fresh fit
    var p = centreOf(g), vb = s.viewBox.baseVal;
    vb.width = a.w; vb.height = a.h;   // same zoom
    vb.x = p.x - a.dx; vb.y = p.y - a.dy;  // same place on screen
  }
  function wirePanZoom(){
    var s = svgEl(); if(!s || s.dataset.wired) return;
    s.dataset.wired = '1';
    var vb = s.viewBox.baseVal;
    // The drawing's full width, remembered before any zoom, so the crossfade
    // has something to measure against.
    s.dataset.whole = String(vb.width);
    crossfade();
    // THREE GESTURES, ONE JOB EACH (owner ruling 2026-08-07):
    //   wheel        — zoom in and out, about the pointer
    //   drag         — pan
    //   double-click — centre on what is under it, and close in
    //
    // IT ZOOMS ABOUT THE POINTER, not the middle. What sits under the cursor
    // stays under the cursor, which is what makes a wheel feel like it is
    // moving the drawing rather than replacing it.
    s.addEventListener('wheel', function(ev){
      ev.preventDefault();
      var scale = ev.deltaY > 0 ? 1.12 : 1/1.12;
      var pt = s.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var p = pt.matrixTransform(s.getScreenCTM().inverse());
      vb.x = p.x - (p.x - vb.x) * scale;
      vb.y = p.y - (p.y - vb.y) * scale;
      vb.width *= scale; vb.height *= scale;
      crossfade();
    }, { passive:false });
    // A CLICK ON A PIECE ZOOMS TO IT. The label arc names a whole section;
    // a SECTOR is one ring of one section — the ledger's requirements — and
    // that is the piece a reader usually means.
    //
    // The sector's own geometry is the target, not the cards inside it. An
    // empty ring still zooms, which is how a reader sees that it IS empty.
    function zoomTo(box){
      if(!box || !(box.width > 0)) return;
      var pad = Math.max(box.width, box.height) * 0.1;
      vb.x = box.x - pad; vb.y = box.y - pad;
      vb.width = box.width + pad*2; vb.height = box.height + pad*2;
      crossfade();
    }
    // A CARD IS TOO SMALL TO FIT THE VIEW TO. Filling the screen with one
    // 260-wide box leaves a reader inside a card with no idea what is around
    // it. So a card takes the CENTRE and the view closes in by a step, which
    // keeps its neighbours on screen — the thing worth seeing when you pick
    // a node.
    function centreOn(box, step){
      if(!box) return;
      var cx = box.x + box.width/2, cy = box.y + box.height/2;
      vb.width *= step; vb.height *= step;
      vb.x = cx - vb.width/2; vb.y = cy - vb.height/2;
      crossfade();
    }
    // DOUBLE-CLICK CENTRES ON WHATEVER IS UNDER IT.
    //
    // A CARD IS TESTED FIRST, because a card sits ON TOP of the piece it
    // belongs to. Testing the piece first would mean a card could never be
    // picked, which is exactly why double-clicking a card did nothing.
    //
    // One click still lights a card's neighbourhood, so the two do not fight.
    s.addEventListener('dblclick', function(ev){
      if(!ev.target.closest) return;
      var g = ev.target.closest('.trace-node');
      if(g){ ev.preventDefault(); centreOn(g.getBBox(), dial(s, '--trace-zoom-step', 0.5)); return; }
      var sec = ev.target.closest('.trace-sector');
      if(sec){ ev.preventDefault(); zoomTo(sec.getBBox()); return; }
      var b = ev.target.closest('.trace-band');
      if(!b) return;
      ev.preventDefault();
      // A section label zooms to every piece of that section at once.
      var box = null;
      s.querySelectorAll('.trace-sector').forEach(function(p){
        if(p.dataset.band !== b.dataset.band) return;
        var r = p.getBBox();
        if(!box){ box = { x0:r.x, y0:r.y, x1:r.x+r.width, y1:r.y+r.height }; return; }
        box.x0 = Math.min(box.x0, r.x); box.y0 = Math.min(box.y0, r.y);
        box.x1 = Math.max(box.x1, r.x+r.width); box.y1 = Math.max(box.y1, r.y+r.height);
      });
      if(box) zoomTo({ x: box.x0, y: box.y0, width: box.x1-box.x0, height: box.y1-box.y0 });
    });

    var pan = null;
    s.addEventListener('mousedown', function(ev){
      if(ev.button !== 0) return;
      pan = { x: ev.clientX, y: ev.clientY, vx: vb.x, vy: vb.y, w: s.clientWidth || 1 };
      s.classList.add('grabbing');
    });
    window.addEventListener('mousemove', function(ev){
      if(!pan) return;
      var k = vb.width / pan.w;
      vb.x = pan.vx - (ev.clientX - pan.x) * k;
      vb.y = pan.vy - (ev.clientY - pan.y) * k;
      crossfade();
    });
    window.addEventListener('mouseup', function(){ pan = null; var e = svgEl(); if(e) e.classList.remove('grabbing'); });
  }
  function relayout(){
    var w = document.getElementById('w-trace'); if(!w) return;
    var keep = anchor();
    // WHICH box has focus, not just whether one does — the centre field and
    // the search field share a class, and restoring the wrong one moved the
    // reader's cursor to another control mid-word.
    var typing = document.activeElement && document.activeElement.classList.contains('trace-find')
      ? (document.activeElement.classList.contains('trace-origin') ? '.trace-origin' : '.trace-find:not(.trace-origin)')
      : null;
    var url = '/widget/trace?embed=1&tp=' + encodeURIComponent(on('prop').join(','))
      + '&tt=' + encodeURIComponent(on('type').join(','))
      + '&tq=' + encodeURIComponent(query())
      + '&tc=' + encodeURIComponent(corpus())
      + '&to=' + encodeURIComponent(origin());
    fetch(url).then(function(r){return r.text()}).then(function(html){
      var doc = new DOMParser().parseFromString(html,'text/html');
      var fresh = doc.getElementById('w-trace');
      if(!fresh) return;
      w.querySelector('.widget-body').innerHTML = fresh.querySelector('.widget-body').innerHTML;
      wirePanZoom(); reanchor(keep);
      if(typing){ var f = w.querySelector(typing); if(f){ f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
    }).catch(function(){});
  }
  // A CLICK LIGHTS THE NEIGHBOURHOOD: the node itself, every node one edge
  // away, and the edges between. Keyed by NODE rather than by card, so a node
  // drawn under two value props lights in both places at once — which is how
  // the duplication reads as one thing instead of two.
  function lightUp(id){
    var s = svgEl(); if(!s) return;
    s.querySelectorAll('.on, .near').forEach(function(el){ el.classList.remove('on'); el.classList.remove('near'); });
    if(!id){ s.classList.remove('lit'); s.dataset.lit = ''; return; }
    var near = {}; near[id] = true;
    s.querySelectorAll('.trace-edge').forEach(function(l){
      if(l.dataset.a === id) near[l.dataset.b] = true;
      if(l.dataset.b === id) near[l.dataset.a] = true;
    });
    s.classList.add('lit'); s.dataset.lit = id;
    s.querySelectorAll('.trace-node').forEach(function(g){
      var n = g.dataset.node;
      if(n === id) g.classList.add('on'); else if(near[n] === true) g.classList.add('near');
    });
    s.querySelectorAll('.trace-edge').forEach(function(l){
      if(l.dataset.a === id || l.dataset.b === id) l.classList.add('on');
    });
  }
  document.addEventListener('click', function(e){
    var s = svgEl(); if(!s || !e.target.closest) return;
    var g = e.target.closest('#w-trace .trace-node');
    // The same node twice puts the drawing back; a click on empty canvas too.
    if(g){ lightUp(g.dataset.node === s.dataset.lit ? '' : g.dataset.node); return; }
    if(e.target.closest('#w-trace svg.trace') && s.dataset.lit) lightUp('');
  });
  var pending = null;
  document.addEventListener('click', function(e){
    var p = e.target.closest ? e.target.closest('#w-trace .pill') : null;
    if(p){ p.classList.toggle('on'); relayout(); }
  });
  document.addEventListener('input', function(e){
    if(e.target.classList && e.target.classList.contains('trace-find')){ clearTimeout(pending); pending = setTimeout(relayout, 200); }
  });
  document.addEventListener('change', function(e){
    if(e.target.classList && e.target.classList.contains('trace-corpus')) relayout();
  });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePanZoom); else wirePanZoom();
})();
`;
