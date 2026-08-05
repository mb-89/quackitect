// THE TRACE-GRAPH CARD — the filters as a header bar, then the drawing.
//
// IT INVENTS NO SURFACE. The cards are the machine view's state nodes, class
// for class. A click reaches the details panel through `clickable` and
// `data-detail`, the same path every other element takes. Only the rings, the
// edges and the pills are new here, because nothing else draws those.
import { layoutTrace, loadTrace, rootsOf, TRACE_LEVELS, traceSvg, visionText } from "./trace.ts";

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
].join("\n");

export function traceCard(root: string, selected: string[], types: string[], find: string, expand: string): string {
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
  for (const n of all) subjects[n.id] = { statement: n.statement, type: n.type, path: `project/spec/trace/${n.id}.md` };
  const data = `<script type="application/json" id="se-trace">${JSON.stringify(subjects).replace(/</g, "\\u003c")}</script>`;
  const body =
    props.length === 0
      ? '<div class="meta" style="padding:10px 12px">no trace nodes yet — the graph draws as project/spec/trace/ fills</div>'
      : '<div class="trace-filters clickable" data-detail="trace:filter">' +
        `${pillColumn("value prop", "prop", propValues, selected)}${pillColumn("type", "type", typeValues, types)}` +
        '<div class="pill-col"><div class="pill-head">find</div>' +
        `<input class="trace-find" type="search" placeholder="id, statement, frontmatter…" value="${esc(find)}"></div></div>` +
        `<div class="trace-canvas">${traceSvg(layoutTrace(all, selected, { types, find }))}</div>${data}`;
  return `<div class="widget" id="w-trace"><div class="widget-head"><span>trace graph</span>${expand}</div><div class="widget-body">${body}</div></div>`;
}

export const TRACE_STYLE = `
/* The filters are a HEADER BAR; the graph gets the whole panel under it. */
#w-trace .widget-body { display:flex; flex-direction:column; min-height:0; }
.trace-filters { display:flex; gap:14px; padding:8px 10px; border-bottom:1px solid var(--se-line);
  flex:none; align-items:flex-start; overflow-x:auto; }
.pill-col { display:flex; flex-direction:column; gap:4px; min-width:0; }
.pill-head { font-size:11px; color:var(--se-muted); }
/* A column past ten values scrolls, v1's own rule. */
.pill-chips { display:flex; flex-direction:column; gap:3px; max-height:150px; overflow:auto; }
.pill { display:flex; justify-content:space-between; gap:8px; padding:2px 7px; border:1px solid var(--se-line);
  border-radius:9px; background:transparent; color:var(--se-fg); font:inherit; font-size:11px; cursor:pointer; text-align:left; }
.pill.on { border-color:var(--se-accent); color:var(--se-accent); }
.pill-n { color:var(--se-muted); }
/* A bare search input renders borderless in some themes, so the border is stated. */
.trace-find { appearance:none; -webkit-appearance:none; padding:3px 7px; font:inherit; font-size:11px; min-width:190px;
  background:transparent; color:var(--se-fg); border:1px solid var(--se-line); border-radius:3px; }
.trace-find:focus { border-color:var(--se-accent); outline:none; }
.trace-canvas { flex:1; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; }
svg.trace { width:100%; height:100%; cursor:grab; touch-action:none; }
svg.trace.grabbing { cursor:grabbing; }
.trace-ring { fill:none; stroke:var(--se-line); }
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
  function query(){ var f = document.querySelector('#w-trace .trace-find'); return f && f.value ? f.value : ''; }
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
    s.addEventListener('wheel', function(ev){
      ev.preventDefault();
      var scale = ev.deltaY > 0 ? 1.12 : 1/1.12;
      var pt = s.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var p = pt.matrixTransform(s.getScreenCTM().inverse());
      vb.x = p.x - (p.x - vb.x) * scale;
      vb.y = p.y - (p.y - vb.y) * scale;
      vb.width *= scale; vb.height *= scale;
    }, { passive:false });
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
    });
    window.addEventListener('mouseup', function(){ pan = null; var e = svgEl(); if(e) e.classList.remove('grabbing'); });
  }
  function relayout(){
    var w = document.getElementById('w-trace'); if(!w) return;
    var keep = anchor();
    var typing = document.activeElement && document.activeElement.classList.contains('trace-find');
    var url = '/widget/trace?embed=1&tp=' + encodeURIComponent(on('prop').join(','))
      + '&tt=' + encodeURIComponent(on('type').join(','))
      + '&tq=' + encodeURIComponent(query());
    fetch(url).then(function(r){return r.text()}).then(function(html){
      var doc = new DOMParser().parseFromString(html,'text/html');
      var fresh = doc.getElementById('w-trace');
      if(!fresh) return;
      w.querySelector('.widget-body').innerHTML = fresh.querySelector('.widget-body').innerHTML;
      wirePanZoom(); reanchor(keep);
      if(typing){ var f = w.querySelector('.trace-find'); if(f){ f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }
    }).catch(function(){});
  }
  var pending = null;
  document.addEventListener('click', function(e){
    var p = e.target.closest ? e.target.closest('#w-trace .pill') : null;
    if(p){ p.classList.toggle('on'); relayout(); }
  });
  document.addEventListener('input', function(e){
    if(e.target.classList && e.target.classList.contains('trace-find')){ clearTimeout(pending); pending = setTimeout(relayout, 200); }
  });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wirePanZoom); else wirePanZoom();
})();
`;
