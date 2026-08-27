// THE WORK EDITOR IS THE DATABASE CARD, TWICE, SIDE BY SIDE.
//
// THERE IS NO SECOND EDITOR HERE, and that is the whole file. `basesCard`
// already draws a result count, a sort control, a properties control, grouping,
// filtering and the table itself. This asks for two of them, aimed at two views
// of one `.base` file, and stops.
//
// WHAT THIS FILE ADDS IS PLACEMENT AND THE CONTROLS THE DATABASE HAS NO OPINION
// ABOUT. A header bar of its own, two panes under it, a seam between them, and
// the acts that belong to work rather than to a table.
//
// TWO WIDGETS, ONE ROW. The editor and the drawing each carry their own header
// bar, and the seam between them is dragged like the seam inside. That is what
// makes the transition read as two panels rather than one panel with something
// bolted to its side.
//
// DONE IS A FILTER, NOT A PLACE. The view filters it out, so a finished token
// leaves the list without moving anywhere.
//
// see dsp-the-bucket-editor.md#the-editor-is-the-database
import { basesBlock, declaredViews, vaultWarm, viewProperties } from "./baseui.ts";
import { compileMachineCached } from "./machines/compile.ts";
import { mainMachinePath } from "./session.ts";
import type { GroupLink, GroupShut, Row } from "./tables.ts";
import { warmRows } from "./vault.ts";
import { penWork } from "./workpen.ts";
import { BACKLOG, BACKLOG_IS_DRAWN_AT, groupIsPlace } from "./workstore.ts";

/** The base file the editor draws, and the two views declared inside it. */
const LEFT = "work.base#left";
const RIGHT = "work.base#right";

/** WHICH HEADINGS ARE DOORS. A place is WHERE THE WORK IS DONE, so it names a
 *  state on a drawing and the reader can go to it. A bucket is a name somebody
 *  typed, and no state answers to it.
 *
 *  TWO ORACLES ARE ASKED, because neither one alone knows. The editor groups by
 *  the bucket falling back to the place, so a heading is one or the other and
 *  its text does not say which.
 *
 *  THE DRAWING KNOWS EVERY STATE IT DRAWS, occupied or not. The store knows only
 *  a place some token HOLDS right now, which is a different question and answers
 *  no for an empty state. Asking the store alone made an empty state read as a
 *  bucket, and the heading then borrowed its ancestor's door.
 *
 *  MEASURED: the retro heading led to the front desk. It sits under the backlog,
 *  the backlog is drawn at the front desk, and nothing at retro made retro a
 *  place. Both aliased headings landed on the same wrong state, which is the
 *  tell that a lookup failed rather than that one target was wrong.
 *
 *  THE STORE STILL ANSWERS FOR A RECORD'S OWN STATES. Those belong to another
 *  drawing than the main one, and work standing there is what names them.
 *
 *  THE DRAWING NAMES A STATE BY ITS LAST SEGMENT. `workByState` files a count
 *  under exactly that, so the link and the pill point at the same state.
 *
 *  THE BACKLOG IS NOT A POSITION. It is the front desk's pending bucket, and
 *  the front desk is where the drawing puts it.
 *
 *  A NESTED HEADING BORROWS ITS PARENT'S DOOR. The second level names a bucket
 *  — `in`, `pending` or `out` — and every one of them is a bucket OF the place
 *  above it, so all four headings of one state lead to that same state (owner).
 *  Reading the name alone left three of the four as plain text. */
function placeLinks(root: string): GroupLink {
  const doorTo = (name: string): { state: string; machine: string } | null => {
    if (!groupIsPlace(root, name) && !drawnState(root, name)) return null;
    const position = name === BACKLOG ? BACKLOG_IS_DRAWN_AT : name;
    const parts = position.split("/").filter((s) => s !== "");
    const state = parts.pop() ?? "";
    if (state === "") return null;
    // A BARE STATE BELONGS TO THE MAIN MACHINE, and a qualified one names its
    // own machine in the segment before the leaf. The same rule the aim chip
    // takes, because it is the same question.
    return { state, machine: parts.length === 0 ? mainMachineId(root) : String(parts[parts.length - 1]) };
  };
  return (name: string, trail: string[]) => {
    const own = doorTo(name);
    if (own !== null) return own;
    // NEAREST ANCESTOR FIRST, so a deeper grouping still lands on the state it
    // sits under rather than on the outermost one.
    for (let i = trail.length - 1; i >= 0; i--) {
      const up = doorTo(String(trail[i]));
      if (up !== null) return up;
    }
    return null;
  };
}

/** WHICH GROUPS SHIP CLOSED — THE VIEW SAYS, NOT THIS FILE (owner).
 *
 *  THE BACKLOG AND THE RETRO BOTH BURY THE PAGE. The backlog holds every
 *  standing pool token, 154 measured; the retro holds every pending note, 96
 *  measured. A reader who came for the four rows at their own position finds
 *  neither.
 *
 *  IT WAS A NAME IN CODE AND IT IS NOW A DECLARATION. Every further group
 *  somebody wanted folded meant another line in this renderer, and the person
 *  who wanted it could not write it. `collapsed:` in the .base file is theirs.
 *
 *  NOTHING ELSE SHIPS CLOSED. A position's own work is what the editor is for,
 *  and folding that by default would hide the thing being looked at. */
function shutGroups(view: { collapsed?: string[] }): GroupShut {
  const shut = new Set((view.collapsed ?? []).map((s) => s.trim().toLowerCase()));
  return (name: string) => shut.has(name.trim().toLowerCase());
}

/** THE WORK THE EDITOR DRAWS: the store's files AND the two live sources.
 *
 *  A DRAWN PIECE HAS NO WORK FILE, so the vault cannot hold it. A pending note
 *  is a line in a log, and a pool token is a corpus node carrying none of the
 *  fields this view groups on — no place, no status. Both were therefore
 *  invisible here while the DRAWING counted them.
 *
 *  MEASURED: 154 pool tokens stood at the backlog and the drawing said so; the
 *  editor's backlog heading showed ONE, which was a hand-opened token that
 *  happened to have a file. A person reading the editor saw an empty backlog.
 *
 *  THE PEN NORMALISES THEM ALREADY, into the same shape a minted token has. So
 *  this converts rather than re-deriving, and the two surfaces cannot disagree.
 *
 *  A POOL TOKEN'S VAULT ROW IS NOT COUNTED TWICE, and `oneRowPerFile` below is
 *  what makes that true. It used to rest on the view's type filter alone, back
 *  when the corpus copy carried a type of its own that the view did not admit.
 *  One type names all of it now, so that filter separates nothing and identity
 *  is the only thing left holding the row apart. */
function penRows(root: string): Row[] {
  return penWork(root).map((i) => ({
    id: i.id,
    type: "[[work]]",
    statement: i.statement,
    place: i.place,
    bucket: i.bucket,
    slot: i.slot,
    status: i.status,
    source: i.source,
    // A POOL TOKEN GENUINELY HAS A FILE and a note does not. An empty path
    // renders the statement as text rather than as a link to nothing.
    file: { path: i.source_ref.endsWith(".md") ? i.source_ref : "", name: i.id, ctime: i.opened },
  })) as Row[];
}

/** ONE ROW PER FILE, and the DRAWN one wins.
 *
 *  A pool token is a file in the corpus AND a row the pen derives. Both describe
 *  the same thing, and only the pen's carries the fields this view groups on —
 *  a place and a status — so the corpus copy lands in the no-value group and
 *  reads as a second, half-empty piece of work.
 *
 *  THE MATCH IS THE FILE PATH, never the type. Matching on identity cannot be
 *  switched off by an edit to a query, which is how the duplicate came back:
 *  the type filter passed for months and then quietly stopped excluding it.
 *
 *  A ROW WITH NO FILE IS NEVER DROPPED. A pending note has no path, and an empty
 *  key would collapse every one of them into a single row. */
function oneRowPerFile(vault: Row[], pen: Row[]): Row[] {
  const drawn = new Set(pen.map((r) => String((r as { file?: { path?: string } }).file?.path ?? "")).filter((p) => p !== ""));
  const kept = vault.filter((r) => {
    const path = String((r as { file?: { path?: string } }).file?.path ?? "");
    return path === "" || !drawn.has(path);
  });
  return [...kept, ...pen];
}

/** THE MAIN MACHINE'S NAME, for a place that names no machine of its own.
 *
 *  IT IS ASKED RATHER THAN ASSUMED. The compile is memoised against the files
 *  it read, so this costs nothing after the first render of a session.
 *
 *  A TREE WITH NO MACHINE IN IT ANSWERS NOTHING, and an empty name leaves the
 *  press to whatever drawing is already on screen. */
function mainMachineId(root: string): string {
  try {
    return compileMachineCached(root, mainMachinePath(root)).id;
  } catch {
    return "";
  }
}

/** WHETHER THE MAIN DRAWING DRAWS A STATE BY THIS NAME.
 *
 *  IT ASKS THE DRAWING AND NOT THE WORK. A state with nothing standing at it is
 *  still a state, and still somewhere a reader may go.
 *
 *  SAME COMPILE, SAME MEMO as `mainMachineId`, so it costs nothing after the
 *  first render.
 *
 *  A TREE WITH NO MACHINE ANSWERS NO, which leaves the heading as plain text
 *  rather than sending the reader somewhere invented. */
function drawnState(root: string, name: string): boolean {
  try {
    return compileMachineCached(root, mainMachinePath(root)).states.some((s) => s.id === name);
  } catch {
    return false;
  }
}

/** THE HEADER BAR'S OWN CONTROLS — the ones the database has no opinion about.
 *
 *  A DATABASE VIEW LISTS WHAT EXISTS. Filing rows under a name, renaming that
 *  name, and hiding a pane are all acts on the work rather than questions about
 *  the table, so they live here and not in the chrome below.
 *
 *  THE BUCKET BUTTON IS DEAD UNTIL SOMETHING IS SELECTED. It says what it needs
 *  rather than doing nothing when pressed, which is the failure a disabled
 *  button with no explanation actually is. */
function headerControls(): string {
  return `<span class="work-tools">
    <span class="work-picked" data-count="0">nothing selected</span>
    <button type="button" class="ghost work-bucket" disabled title="tick some rows first — this files them under a name of your own">▤ into a bucket</button>
    <button type="button" class="ghost work-rename" disabled title="tick a row inside a bucket — this renames that bucket, and a place can never be renamed">✎ rename bucket</button>
    <input type="text" class="work-rename-field" placeholder="the bucket's new name" hidden />
    <button type="button" class="ghost work-second" aria-pressed="false" title="open a second column — a row is dragged from one to the other">◫ second column</button>
  </span>`;
}

/** The dock: one widget, its own header, two database cards under it.
 *
 *  IT SHIPS FOLDED. A reader looking at a drawing asked for the drawing. The
 *  work button and a bucket pill both open it; the button closes it again.
 *
 *  EVERY SEAM IS DRAGGED, and only ONE of them is drawn here. The seam BETWEEN
 *  the editor and the drawing is their sibling, so it belongs where they are
 *  siblings — in the page, not inside one of them. Drawn as the dock's last
 *  child it rendered under the editor, which separates the editor from nothing.
 *
 *  THE SEAM INSIDE splits the two columns, and that one is this card's own.
 *
 *  ONE COLUMN UNTIL SOMEBODY ASKS FOR TWO (owner). A second column exists to
 *  drag a row into; a reader who is only reading wants the width. It ships shut
 *  and one button opens and shuts it. */
export function workCard(root: string, _expand: string): string {
  // THE DOCK OWNS ITS OWN REPAINT, and the page-wide morph leaves it alone.
  //
  // WITHOUT THIS A WORK MOVE SHUT THE EDITOR. The signal changes, the drawing
  // morphs itself fresh, and the fresh markup carries this renderer's defaults
  // — folded, one column, no split. The reader read that as having to close the
  // machine and open it again.
  //
  // THE WIDTH IS THE READER'S TOO, so the style survives with it. The server
  // never sent that width, and a morph would snap it back.
  const shell = (inner: string): string => `<aside id="work-dock" data-morph-ignore data-keep-style hidden>
    <div class="widget work-widget">
      <div class="widget-head"><span>work</span>${headerControls()}</div>
      <div class="widget-body work-panes">${inner}</div>
    </div>
  </aside>`;

  // A COLD VAULT IS NOT AN EMPTY ONE. Drawing the panes before the index is
  // read would say no work matched, over work nobody had looked for yet.
  if (!vaultWarm(root)) {
    return shell(`<div class="bs-empty">The vault is warming. This card fills itself on the next refresh.</div>`);
  }
  const views = declaredViews(root);
  const props = viewProperties(root);

  // A BLOCK, NOT A CARD. The editor's own header is the only header here — two
  // cards would each bring one, and the reader would be looking at three bars
  // stacked over one table.
  //
  // THE PANE WRAPPER IS THE DRAG'S HANDLE. The client asks which side a row was
  // dropped on, and this is what it asks.
  const pane = (want: string, side: string): string => {
    const d = views.find((v) => v.id === want || v.id.endsWith(`/${want}`));
    const body =
      d === undefined
        ? `<div class="bs-empty">No view named <code>${want}</code> is declared in the vault.</div>`
        : basesBlock(root, d, props, oneRowPerFile(warmRows(root) ?? [], penRows(root)), placeLinks(root), shutGroups(d.view));
    // THE SECOND COLUMN SHIPS SHUT, and its seam with it. A seam with nothing
    // on one side of it splits nothing.
    const shut = side === "right" ? " hidden" : "";
    return `<div class="work-pane" data-side="${side}"${shut}>${body}</div>`;
  };

  return shell(
    `${pane(LEFT, "left")}<div class="work-seam" data-seam="panes" title="drag to split the two panes" hidden></div>${pane(RIGHT, "right")}`,
  );
}
