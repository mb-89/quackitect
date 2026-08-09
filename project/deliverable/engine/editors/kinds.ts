// ONE FILE PER EDITOR (owner ruling 2026-08-08).
//
// WHAT WAS WRONG. Every field editor lived inside render.ts's client-script
// template literal, and its SERIALISER lived in sfCollect four hundred lines
// away. So adding an editor meant finding a wiring that nothing pointed at,
// and the `table` editor was simply never written — the checker judged the
// field and the mirror abandoned it to a textarea.
//
// THE SHAPE. An editor is two pieces of client source that belong together:
//
//   - `render` runs inside sfEditor. In scope: fl (the field's line), tm (the
//     template's mechanics), args (the field's arguments), paths, hint,
//     facts, name, ph. It returns HTML.
//   - `collect` runs inside sfCollect. In scope: fields (the object being
//     built), push (append a markdown line to a field). It reads the DOM.
//
// Both are SOURCE STRINGS, because the client script is assembled rather than
// bundled. Write them as template literals and copy the escaping verbatim: a
// `\\n` here becomes `\n` in the emitted script, which is what the client
// needs. Interpolation does not re-process escapes, so a verbatim move is
// safe.
//
// NOTHING HERE IS PER FIELD. The editor is the TEMPLATE's shape; the columns,
// options and items are the FIELD's arguments. An editor that reads a field's
// name and behaves differently has stopped being a template.
export interface EditorKind {
  /** The `editor:` name a form template declares. Both the checker in
   *  stateform.ts and the renderer dispatch on this one string. */
  id: string;
  /** Client source returning the editor's HTML. */
  render: string;
  /** Client source reading the editor's DOM back into `fields`. */
  collect: string;
  /** Client source run ONCE when the script loads, for an editor that needs
   *  real interaction — document-level listeners, a redraw on resize.
   *
   *  WHY IT IS HERE AND NOT IN render.ts. An editor whose markup lives in one
   *  file and whose behaviour lives four hundred lines away is exactly the
   *  defect this folder was made to fix. The morph box needs shift-drawing and
   *  an overlay that redraws on resize; putting that back in the client script
   *  would undo the split the day after it landed.
   *
   *  IT MUST SURVIVE A RE-RENDER. The form is redrawn whole on every look, so
   *  a listener bound to an element is gone the next time. Bind to `document`
   *  and match with `closest`, exactly as the row buttons do. */
  behaviour?: string;
}
