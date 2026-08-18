// see dsp-form-editors.md#one-file-per-editor
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
