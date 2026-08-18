// THE STYLESHEET the mirror serves, as one string.
//
// It is data, not logic — split out of render.ts so the renderer reads as
// rendering. Every colour comes from the theme; see ux.md#the-surface-wears-the-editors-own-clothes.
export const STYLE = `
  * { scrollbar-color: var(--se-border-strong) var(--se-bg); }
  ::-webkit-scrollbar { width: 10px; height: 10px; background: var(--se-bg); }
  ::-webkit-scrollbar-thumb { background: var(--se-border-strong); border-radius: 5px; }
  body { font-family: ui-monospace, Consolas, monospace; background: var(--se-bg); color: var(--se-fg); margin: 0; height: 100vh; overflow: hidden; }
  .cols { display: flex; height: 100vh; }
  main { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 14px 18px; }
  .divider { width: 6px; cursor: col-resize; background: var(--se-border); flex: none; }
  .divider.horiz { width: auto; height: 6px; cursor: row-resize; }
  /* 465px is the width the owner settled the sidebar at by dragging it, and
     a default nobody re-drags is the only evidence a default is right. */
  aside { width: 465px; min-width: 320px; max-width: 80vw; display: flex; flex-direction: column; background: var(--se-bg-side); }
  /** see dsp-mirror-render.md#the-left-column */
  #left { width: 650px; min-width: 360px; }

  /** see dsp-mirror-render.md#the-terminal-fills-its-card */
  #w-terminal { min-height: 140px; }
  /* NEVER SCROLLS. xterm scrolls itself; a scrollbar here would steal from
     clientWidth mid-measure and start the flicker over. */
  .term-panel { flex: 1; min-height: 0; overflow: hidden; padding: 8px 10px; }
  /* Beats .widget's own display, whatever order the sheet ends up in. */
  .no-host { display: none !important; }
  .crumbs { font-size: 13px; color: var(--se-muted); display: flex; align-items: center; gap: 4px; text-transform: none; letter-spacing: 0; }
  .crumbs a { color: var(--se-fg); text-decoration: none; }
  .crumbs a:hover { color: var(--se-accent); }
  .crumbs .here { color: var(--se-accent); }
  .crumb-arrow { position: relative; cursor: pointer; color: var(--se-muted); padding: 0 3px; }
  .crumb-arrow:hover { color: var(--se-accent); }
  .crumb-menu { display: none; position: absolute; top: 18px; left: 0; z-index: 10; background: var(--se-raised); border: 1px solid var(--se-border-strong); border-radius: 8px; min-width: 160px; padding: 4px; }
  .crumb-arrow.open .crumb-menu { display: block; }
  .crumb-menu a { display: block; padding: 6px 10px; border-radius: 6px; }
  .crumb-menu a:hover { background: var(--se-hover); }
  /* THE RUNGS. Dense on purpose (owner sketch): the row reads as one control,
     so the buttons touch and only the lit ones carry weight. */
  .rungbar .rungs { display: inline-flex; gap: 1px; margin: 0 6px; }
  .rung { font: inherit; font-size: 11px; line-height: 1; padding: 3px 7px; border: 1px solid var(--se-border); background: var(--se-bg); color: var(--se-dim); cursor: pointer; }
  .rung:first-child { border-radius: 4px 0 0 4px; }
  .rung:last-child { border-radius: 0 4px 4px 0; }
  .rung.on { background: var(--se-accent-bg); color: var(--se-accent); border-color: var(--se-accent); font-weight: 700; }
  .rung.locked { color: var(--se-border-strong); cursor: default; }
  /* Ideation is the one rung that delegates the CREATION of work, so it is
     the one rung drawn as a hazard rather than as a setting. */
  .rung.danger.on { background: var(--se-fail); border-color: var(--se-fail); color: var(--se-bg); }
  .rung.danger:not(.locked):not(.on) { color: var(--se-fail); border-color: var(--se-fail); }
.rung.emergency, .rung.danger.on.emergency { background: var(--se-fail); border-color: var(--se-fail); color: var(--se-bg); animation: se-emergency 1.1s ease-in-out infinite; }
@keyframes se-emergency { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
@media (prefers-reduced-motion: reduce) { .rung.emergency { animation: none; outline: 2px solid var(--se-fail); outline-offset: 1px; } }
  /* Line edits, integers only. Narrow on purpose — the row is dense and a
     cadence is never more than a few digits. */
  .cadence { width: 3.2em; flex: 0 0 auto; box-sizing: content-box; font: inherit; font-size: 11px; padding: 2px 4px; margin-left: 6px; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 4px; color: var(--se-fg); text-align: right; }
  /* ONE ROW PER CONTROL, LABEL FIRST. params.ts groups the rows from the
     panel spec; this only sizes them. */
  .rungbar { display: inline-flex; flex-direction: column; align-items: stretch; flex: 0 0 auto; gap: 4px; }
  .param-row { display: flex; align-items: center; gap: 0; }
  .param-label { flex: 0 0 5.4em; color: var(--se-muted); font-size: 12px; margin-right: 6px; cursor: pointer; }
  .param-choice { font: inherit; font-size: 11px; margin-left: 6px; padding: 2px 4px; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 4px; color: var(--se-fg); }
  .param-text { flex: 1 1 auto; min-width: 0; box-sizing: border-box; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 6px; color: var(--se-fg); font: inherit; font-size: 12px; padding: 4px 8px; }
  .param-action { margin-left: 10px; border-radius: 4px; }
  .cadence-unit { font-size: 10px; color: var(--se-dim); margin-left: 3px; }
  .nr-now { margin-left: 8px; border-radius: 4px; }
  .widget { display: flex; flex-direction: column; border: 1px solid var(--se-border); border-radius: 10px; background: var(--se-bg-side); min-height: 0; }
  .widget-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid var(--se-border); color: var(--se-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; }
  .widget-body { flex: 1; min-height: 0; overflow: auto; }
  /** see dsp-mirror-render.md#the-form-editors-read-as-quiet-tables */
  .sfact { font: inherit; font-size: 11px; line-height: 18px; padding: 1px 10px; border-radius: 3px; cursor: pointer; }
  .sfact.save { background: var(--se-accent); border: 1px solid var(--se-accent); color: var(--se-bg); font-weight: 600; }
  .sfact.revert { background: transparent; border: 1px solid var(--se-accent); color: var(--se-accent); }
  .sfrows { border: 1px solid var(--se-border); border-radius: 4px; margin: 4px 0; }
  .sfrow { display: flex; gap: 6px; align-items: center; padding: 2px 6px; border-bottom: 1px solid var(--se-border); }
  .sfrow:last-child { border-bottom: 0; }
  .sfrow input { flex: 1; background: transparent; color: var(--se-fg); border: 0; outline: none; font: inherit; font-size: 12.5px; padding: 4px 2px; min-width: 0; }
  .sfrow input:focus { background: var(--se-hover); border-radius: 3px; }
  .sfrow select { flex: 0 0 auto; background: var(--se-bg); color: var(--se-fg); border: 1px solid var(--se-border); border-radius: 3px; font: inherit; font-size: 12.5px; padding: 3px 4px; }
  .sfrow .sfitem { flex: 0 0 44%; font-size: 12.5px; color: var(--se-muted); }
  /** see dsp-mirror-render.md#the-node-table-draws-its-structure-on-the-elements */
  .sfpick option { background: var(--se-raised); color: var(--se-fg); }
  .sfnodetable { border: 1px solid var(--se-border); border-radius: 4px; margin: 4px 0; }
  .sfnodetable a.reflink:hover { text-decoration: underline; }
  .sfnodetable td:focus-within { background: var(--se-hover); }
  /* A CLOSED PICK IS A NATIVE SELECT, and a native select paints its own
     dropdown from the OS. Without these two the list is a white sheet in a
     dark panel — the theme reaches the control but not the popup. */
  select.sfpick option { background: var(--se-bg); color: var(--se-fg); }
  select.sfpick option:disabled { color: var(--se-muted); font-style: italic; }
  .sfrow .sfrowadd, .sfrow .sfrowdel { flex: 0 0 auto; background: none; border: 1px solid var(--se-border); color: var(--se-muted); border-radius: 3px; cursor: pointer; font-size: 11px; line-height: 16px; padding: 0 5px; }
  .sfrow .sfrowadd:hover, .sfrow .sfrowdel:hover { color: var(--se-accent); border-color: var(--se-accent); }
  /* The thumbs wear their meaning: green opens, red refuses. */
  button.primary.blessform { background: var(--se-ok); border-color: var(--se-ok); }
  button.primary.dismissform { background: var(--se-fail); border-color: var(--se-fail); }
  button.primary:disabled { opacity: .45; cursor: default; }
  .expand { background: none; border: 1px solid var(--se-border-strong); color: var(--se-muted); border-radius: 6px; cursor: pointer; font: inherit; padding: 2px 8px; }
  .expand:hover { color: var(--se-accent); border-color: var(--se-accent); }
  /** see dsp-mirror-render.md#the-card-matrix */
  .cards { display: grid; height: 100vh; box-sizing: border-box; gap: 8px; padding: 8px; grid-template-columns: var(--main-w, 58%) 6px 1fr 1fr; }
  .card { position: relative; display: flex; min-width: 0; min-height: 0; grid-column: var(--col); grid-row: var(--row); }
  .card > .widget { flex: 1; min-width: 0; }
  .card.main { grid-column: 1; grid-row: 1 / -1; }
  #div-cards { grid-column: 2; grid-row: 1 / -1; width: 6px; cursor: col-resize; background: var(--se-border); border-radius: 3px; }
  /* The head reserves room so the number never lands on the title. */
  .card > .widget > .widget-head { padding-left: 34px; }
  .cardnum { position: absolute; top: 7px; left: 10px; z-index: 2; display: inline-flex; align-items: center; justify-content: center; width: 17px; height: 17px; border: 1px solid var(--se-border-strong); border-radius: 4px; font-size: 11px; color: var(--se-muted); cursor: pointer; }
  .cardnum:hover { color: var(--se-accent); border-color: var(--se-accent); }
  .card.main .cardnum { color: var(--se-accent); border-color: var(--se-accent); }
  .legend-row { display: flex; gap: 10px; padding: 3px 12px; font-size: 12px; }
  .legend-key { color: var(--se-accent); min-width: 92px; flex: none; }
  .legend-what { color: var(--se-fg); }
  #w-machine { flex: 1; }
  #w-machine .widget-body { display: flex; }
  svg { width: 100%; height: 100%; cursor: grab; }
  svg.panning { cursor: grabbing; }
  .state { fill: var(--se-raised); stroke: var(--se-border-strong); stroke-width: 2; }
  /** see dsp-mirror-render.md#done-is-green-where-a-record-stands-behind-it */
  .state.done { fill: color-mix(in srgb, var(--se-ok) 16%, var(--se-bg)); stroke: var(--se-ok); }
  /* THE CURRENT STATES BLINK YELLOW (owner ruling 2026-08-04, v1's pulse
     reborn) — half the emergency pace, so alarm still outranks attention. */
  .state.active { fill: color-mix(in srgb, var(--se-warn, #d7a72a) 16%, var(--se-bg)); stroke: var(--se-warn, #d7a72a); stroke-width: 3.5; animation: se-current 2.2s ease-in-out infinite; }
  @keyframes se-current { 0%, 100% { stroke-opacity: 1; } 50% { stroke-opacity: 0.35; } }
  @media (prefers-reduced-motion: reduce) { .state.active { animation: none; } }
  /** see dsp-mirror-render.md#suspect-has-no-rule-of-its-own */
  .state.inner { fill: none; }
  .clickable { cursor: pointer; }
  .clickable:hover .state, .clickable:hover .comment { stroke: var(--se-fg); }
  .label { fill: var(--se-fg); font-size: 26px; text-anchor: middle; font-family: inherit; pointer-events: none; }
  .sublabel { fill: var(--se-muted); font-size: 17px; text-anchor: middle; font-family: inherit; pointer-events: none; }
  .bless-mark { font-size: 18px; text-anchor: end; pointer-events: none; }
  .edge { stroke: var(--se-dim); stroke-width: 2.5; }
  .arrowhead { fill: var(--se-dim); }
  button.ghost:disabled { opacity: .45; cursor: default; }
  /* THE BLUE LINE. Blue on purpose: the voice reserves green, red and
     yellow for verdicts, and a route is not a verdict. It is a way. */
  .route-line { fill: none; stroke: var(--se-walk); stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
  /* A fan leg is owed, not chosen: same blue, dashed and lighter. */
  .route-line.fan { stroke-dasharray: 10 9; opacity: .65; stroke-width: 4; }
  /** see dsp-mirror-render.md#past-a-branching-point-the-line-means-two-different */
  .route-line.leg-or { stroke-dasharray: 10 8; }
  /* The branching point itself is marked, so a reader can see WHERE the way
     divides rather than inferring it from the lines. */
  .route-branch { fill: var(--se-bg); stroke: var(--se-walk); stroke-width: 3; }
  .route-branch-mark { fill: var(--se-walk); font: 700 13px system-ui, sans-serif; text-anchor: middle; dominant-baseline: central; }
  /* Past a closure the way is FADED, never hidden: it exists, it is shut.
     The barrier itself is yellow, because yellow is attention and a shut
     road wants the reader's hand on the slider. */
  .route-line.shut { opacity: .28; }
  .route-shut { stroke: var(--se-warn); fill: none; stroke-width: 2.4; }
  .route-shut .shut-ring { fill: var(--se-bg); }
  .route-shut .shut-bang { stroke-width: 3; stroke-linecap: round; }
  .route-shut .shut-dot { fill: var(--se-warn); stroke: none; }
  .route-stop { fill: var(--se-walk); stroke: var(--se-walk-ring); stroke-width: 2; }
  .busbar { stroke-width: 3.5; stroke-linecap: round; fill: none; }
  .busbar.tap { stroke-width: 2.5; }
  .busbar-icon { fill: var(--se-dim); font: 700 16px system-ui, sans-serif; }
  .route-wp-io { fill: var(--se-walk-ring); font: 700 9px system-ui, sans-serif; text-anchor: middle; }
  .route-stop.shut { opacity: .28; }
  .route-here { fill: var(--se-walk); stroke: var(--se-walk-ring); stroke-width: 2; }
  .guard { fill: var(--se-accent); font-size: 20px; text-anchor: middle; }
  .comment { fill: var(--se-bg-side); stroke: var(--se-border); }
  .group { fill: var(--se-bg-side); stroke: var(--se-border); stroke-width: 2; }
  .group-label { fill: var(--se-dim); font-size: 24px; font-family: inherit; letter-spacing: .06em; }
  .comment-text { color: var(--se-muted); font-size: 13px; line-height: 1.35; }
  .comment-detail { font-size: 15px; line-height: 1.55; color: var(--se-fg); padding: 2px 0 10px; }
  .replink { color: var(--se-accent); cursor: pointer; text-decoration: underline dotted; }
  .bar { display: flex; gap: 10px; padding: 12px; }
  button.primary { background: var(--se-accent); color: var(--se-bg); border: 0; border-radius: 8px; padding: 8px 14px; font: inherit; font-weight: 700; cursor: pointer; margin: 2px 4px 2px 0; }
  .panel { padding: 0 12px 12px; overflow: auto; }
  .meta { color: var(--se-muted); font-size: 12px; padding: 8px 12px; }
  .todo-origin { color: var(--se-muted); font-size: 11px; }
  table.kv { border-collapse: collapse; width: 100%; font-size: 12.5px; }
  table.kv td { border: 1px solid var(--se-border); padding: 2px 6px; line-height: 1.35; vertical-align: top; }
  table.kv td.k { color: var(--se-accent); white-space: nowrap; width: 1%; }
  table.kv td.v { color: var(--se-fg); word-break: break-word; }
  table.kv table.kv { margin: 2px 0; }
  .vnull { color: var(--se-muted); } .vnum { color: var(--se-val-num); } .vbool { color: var(--se-val-bool); } .vstr { color: var(--se-val-str); }
  .prewrap { white-space: pre-wrap; }
  td.btncell { text-align: center; vertical-align: middle !important; width: 1%; }
  .cond circle { stroke-width: 2.5; }
  .cond.unmet circle { fill: var(--se-accent-bg); stroke: var(--se-accent); }
  .cond.met circle { fill: var(--se-ok-bg); stroke: var(--se-ok); }
  .cond-label { font-size: 20px; text-anchor: middle; fill: var(--se-fg); pointer-events: none; }
  .doclist a { display: block; padding: 4px 0; }
  a.doclink { color: var(--se-link); cursor: pointer; text-decoration: underline; }
  /* Both open the file in the editor; they differ only in SIZE, because a
     reference sits inline on a form row and a doclink stands on its own. */
  a.reflink { color: var(--se-link); cursor: pointer; text-decoration: underline; font-size: 11.5px; padding: 0 4px; }
  .docview { font-size: 13.5px; line-height: 1.55; }
  .docview h1, .docview h2, .docview h3 { color: var(--se-accent); }
  .docview code { background: var(--se-raised); padding: 1px 5px; border-radius: 4px; }
  .docview pre { background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 8px; padding: 10px; overflow: auto; }
  .docview a { color: var(--se-link); }
  button.ghost { background: var(--se-raised); color: var(--se-fg); border: 1px solid var(--se-border-strong); border-radius: 8px; padding: 6px 12px; font: inherit; cursor: pointer; }
  #w-details { flex: 1; border-radius: 0; border: 0; }
  .docheck { accent-color: var(--se-accent); cursor: pointer; }
  .docline { display: flex; align-items: center; gap: 6px; padding: 3px 0; }
  .collbody { padding: 4px 10px 8px; }
  .fval { min-width: 0; overflow-wrap: anywhere; line-height: 1.35; }
  /* THE FRONT MATTER SITS TIGHT (owner ruling 2026-07-30). The element
     library spaces a form group for a settings page. A receipt is a dense
     record, and the reader wants more of it on screen at once. */
  vscode-form-group { margin: 0 !important; padding: 0 !important; }
  vscode-form-group vscode-label { line-height: 1.35; }
  /* THE NEXT STATES, one block each. */
  .nextitem { border: 1px solid var(--se-border); margin: 4px 0; }
  .nextitem.open { border-color: var(--se-walk); }
  .nexthead { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 3px 8px; background: var(--se-raised); }
  .nextto { color: var(--se-accent); overflow-wrap: anywhere; }
  vscode-icon.ok { color: var(--vscode-testing-iconPassed, #4a7a55); }
  vscode-icon.no { color: var(--se-muted); }
  .threshold { display: flex; align-items: center; gap: 8px; color: var(--se-muted); font-size: 12px; text-transform: none; letter-spacing: 0; }

  #thr-val { color: var(--se-accent); min-width: 4ch; }
  .thr-help { cursor: pointer; }
  .thr-help:hover { color: var(--se-accent); }
  .thr-track { display: inline-flex; flex-direction: column; align-items: stretch; }
  .thr-notches { position: relative; height: 11px; margin-top: -3px; }
  .thr-notch { position: absolute; transform: translateX(-50%); font-size: 9px; line-height: 1; color: var(--se-muted); cursor: pointer; padding: 1px 3px; }
  .thr-notch:hover { color: var(--se-accent); }
  /* The log used to be the top 42% of a shared column, borderless so it read
     as one surface with the terminal below it. As a card of its own it takes
     the whole card and wears the normal widget border. */
  .log-filter-row { padding: 6px 12px 0; display: flex; gap: 6px; }
  .log-filter-row input { flex: 1 1 50%; min-width: 0; box-sizing: border-box; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 6px; color: var(--se-fg); font: inherit; font-size: 12px; padding: 4px 8px; }
  .log-panel { font-size: 12px; margin-top: 6px; }
  .logrow { display: flex; gap: 8px; padding: 2px 0; cursor: pointer; border-bottom: 1px dotted var(--se-raised); align-items: baseline; }
  .logrow:hover { background: var(--se-raised); }
  .logrow .lt { color: var(--se-feed-time); flex: 0 0 auto; }
  .logrow .lsrc { flex: 0 0 5.5ch; color: var(--se-feed-src-agent); }
  .logrow .lsrc.human { color: var(--se-feed-src-human); }
  /* THE UI ACTING ALONE reads dimmer than either actor, because it is neither. */
  .logrow .lsrc.ui { color: var(--se-feed-time); }
  .logrow .lkind { flex: 0 0 6.5ch; }
  .logrow .lkind.k-call { color: var(--se-feed-kind-call); }
  .logrow .lkind.k-update { font-weight: 700; color: var(--se-feed-kind-update); }
  .logrow .lkind.k-note { font-style: italic; color: var(--se-feed-kind-note); }
  .logrow .lkind.k-aq { font-weight: 700; color: var(--se-feed-kind-aq); }
  .aq-q { font-weight: 700; color: var(--se-feed-kind-aq); padding: 6px 0; white-space: pre-wrap; }
  #loadbar { position: fixed; top: 0; left: 0; right: 0; height: 3px; background: var(--se-raised); z-index: 99; }
  #loadbar .fill { height: 100%; width: 30%; background: var(--se-accent); animation: loadslide 1s linear infinite; }
  @keyframes loadslide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
  /* A BAR THAT MEASURES SOMETHING (owner ruling, 2026-07-30). Work that can
     count its steps says so, and the fill shows how far it has got. The
     sliding animation is the FALLBACK, for work that genuinely cannot. */
  #loadbar .fill.determinate { animation: none; margin-left: 0; transition: width .18s linear; }
  /* THE PING — the agent's pointing finger (owner, 2026-07-30): v2's pulse,
     made yellow. A card blinks its outline; an SVG node blinks its opacity.
     It PULSES ON, and stays lit while the guide talks about it. */
  .se-ping { outline: 3px solid var(--se-accent); outline-offset: 2px; animation: se-ping-blink 1.6s ease-in-out infinite; }
  .se-ping-svg { animation: se-ping-fade 1.6s ease-in-out infinite; }
  @keyframes se-ping-blink { 50% { outline-color: transparent; } }
  @keyframes se-ping-fade { 50% { opacity: .25; } }
  #loadbar .lmsg { position: fixed; top: 8px; right: 12px; color: var(--se-accent); font-size: 12px; }
  /* A load that never answered is a FAILURE, and the voice paints those red. */
  #loadbar.stalled { cursor: pointer; }
  #loadbar.stalled .fill { background: var(--se-fail); animation: none; width: 100%; }
  #loadbar.stalled .lmsg { color: var(--se-fail); }
  .aq-a { color: var(--se-aq-answer); line-height: 1.5; padding: 4px 0; }
  .logrow .lbrief { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .logrow .lok { flex: 0 0 auto; color: var(--se-ok); }
  .logrow.failed .lok { color: var(--se-fail); }
  .dnode { cursor: pointer; padding: 2px 0; font-size: 13px; }
  .dnode:hover { background: var(--se-raised); }
  .dnode.s-done { color: var(--se-ok); }
  .dnode.s-open { color: var(--se-accent); }
  .dnode.s-obsolete { color: var(--se-dim); text-decoration: line-through; }
  .dnode.s-reverted { color: var(--se-fail); text-decoration: line-through; }
  /* DEFERRED IS NOT KILLED. It is still owed, so it keeps the open colour;
     it is owed SOMEWHERE ELSE, so it leans. Never struck through - the
     strike is what says a point died, and this one did not. */
  .dnode.s-deferred { color: var(--se-accent); font-style: italic; text-decoration: none; }
  .dnode.dactive { font-weight: 700; }
  .dnode.dsel { background: var(--se-raised); }
  .dinfo { margin-top: 10px; border-top: 1px solid var(--se-border); padding-top: 8px; }
  .formfield { width: 100%; min-height: 70px; background: var(--se-bg); border: 1px solid var(--se-border); border-radius: 6px; color: var(--se-fg); font: inherit; font-size: 12.5px; padding: 6px; box-sizing: border-box; margin-top: 4px; }
  .prefill { border: 1px dashed var(--se-accent); border-radius: 6px; padding: 6px 8px; margin: 4px 0; }
  .prefill button { margin-top: 4px; }
  #modal { display: none; position: fixed; inset: 0; background: rgba(20,23,26,.8); z-index: 50; align-items: center; justify-content: center; }
  .modal-box { width: min(760px, 92vw); max-height: 86vh; display: flex; flex-direction: column; background: var(--se-bg-side); border: 1px solid var(--se-border-strong); border-radius: 12px; }
  .modal-body { padding: 12px 16px; overflow: auto; font-size: 13px; }
  a.toollink { color: var(--se-link); text-decoration: underline; cursor: pointer; margin-right: 10px; }
  .confetti { position: fixed; inset: 0; pointer-events: none; z-index: 200; overflow: hidden; }
  .confetti i { position: absolute; width: 8px; height: 8px; border-radius: 2px; animation: se-confetti 1.5s cubic-bezier(.2,.6,.4,1) forwards; }
  @keyframes se-confetti { from { transform: translate(0,0) rotate(0deg); opacity: 1; } to { transform: translate(var(--dx), 70vh) rotate(540deg); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .confetti { display: none; } }
  #toast { position: fixed; left: 14px; bottom: 14px; background: var(--se-raised); border: 1px solid var(--se-border-strong); border-radius: 8px; padding: 8px 14px; color: var(--se-fg); font-size: 12.5px; z-index: 90; display: none; }
  #link-lost { position: fixed; left: 0; right: 0; top: 0; z-index: 99; background: var(--se-lost-bg); color: var(--se-accent); text-align: center; padding: 7px; font-size: 13px; letter-spacing: .04em; }
  #over { position: fixed; inset: 0; background: rgba(20,23,26,.94); z-index: 100; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
  #over .over-box { color: var(--se-over); font-size: 62px; font-weight: 800; letter-spacing: .12em; border: 6px solid var(--se-over); border-radius: 18px; padding: 26px 52px; }
  #over .over-sub { color: var(--se-fail); font-size: 15px; }
`;
