// ONE STYLESHEET FOR A CONTROL, WHEREVER IT IS DRAWN.
//
// The sidebar and the editor each carried their own rules for a button, a text
// box and a select. They were not shared, they were copied, and they had
// already drifted: a control was 28 pixels tall in one and 24 in the other, and
// a button had a border and a background in one and neither in the other. The
// owner reported it as the editor's buttons not looking like the sidebar's.
//
// SO THE RULES LIVE HERE AND BOTH PAGES EMBED THIS. One edit changes both, and
// the height is declared once rather than twice with two different numbers.
//
// WHAT IS HERE IS WHAT BOTH PAGES DRAW. A rule for something only one of them
// has stays in that page: this is the shared part, not every rule either page
// needs.
//
// EVERY COLOUR IS A THEME VARIABLE. A value written in would look right in one
// theme and wrong in every other, and the point of taking the editor's look
// from the sidebar is that both take theirs from VS Code.
// THE FILTER LANGUAGE, IN ONE SENTENCE, FOR EVERY BOX THAT TAKES IT.
//
// The work editor's filter and the queue filter read the same language, which
// is src/filter, which is KQL. Two boxes describing it in their own words is
// two descriptions to keep in step, and the one that goes stale is the one
// nobody is looking at.
//
// It is not invented here: bare words over the whole row, name: value for one
// column, quotes for a phrase, and or not, brackets, a trailing star, and a
// pattern between slashes.
export const filterSyntax = "word, name: value, and or not, ( ), val*, /pattern/";

export function controlCss(): string {
  return `
  :root { --control-h: 28px; }

  /* AN AUTHOR'S DISPLAY BEATS THE BROWSER'S [hidden], WHATEVER THE SPECIFICITY.
     Setting display on the bare element made every hidden button visible: the
     group and rename buttons showed with nothing ticked, in a bar that had no
     room for them, so they drew clipped and out of line. An author rule beats a
     user-agent rule before specificity is even looked at, so the page has to
     say it itself. */
  [hidden] { display: none !important; }

  button { font: inherit; height: var(--control-h); line-height: 1; padding: 0 8px;
           display: inline-flex; align-items: center; justify-content: center; gap: 4px;
           border: 1px solid var(--vscode-button-border, transparent); border-radius: 2px;
           background: var(--vscode-button-background, var(--vscode-editor-background, transparent));
           color: var(--vscode-button-foreground, var(--vscode-foreground, inherit));
           cursor: pointer; overflow: hidden; white-space: nowrap; }
  button:hover:not(:disabled) { background: var(--vscode-button-hoverBackground, var(--vscode-list-hoverBackground, transparent)); }
  button:disabled { background: transparent; color: var(--vscode-disabledForeground, var(--vscode-descriptionForeground, inherit));
                    border: 1px dashed var(--vscode-panel-border); cursor: default; }

  input, select, textarea {
    box-sizing: border-box; height: var(--control-h); padding: 0 6px; font: inherit;
    color: var(--vscode-input-foreground, var(--vscode-foreground, inherit));
    background: var(--vscode-input-background, var(--vscode-editor-background, transparent));
    border: 1px solid var(--vscode-input-border, var(--vscode-panel-border, transparent));
    border-radius: 2px; }
  input::placeholder { color: var(--vscode-input-placeholderForeground, var(--vscode-descriptionForeground, inherit)); }
  input[type=checkbox], input[type=radio] {
    width: 16px; height: 16px; padding: 0; border: 0; background: none;
    accent-color: var(--vscode-button-background, var(--vscode-focusBorder, currentColor)); }
`;
}
