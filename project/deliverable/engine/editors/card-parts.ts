// THE CARD'S SHARED PIECES — one panel builder, one button style, used by
// every one-question-at-a-time editor. compare-card drew these first; the
// sensitivity deck reuses them by interpolation instead of rewriting them
// (owner ruling 2026-08-10: rework the existing editor, never a second copy).
//
// This is CLIENT SOURCE, interpolated into a render string. In scope where
// it lands: escText, paths, facts. No backtick inside.
export const CARD_PARTS = `
    const cardCel = "padding:10px 12px;border:1px solid var(--se-border);border-radius:6px;font-size:13px;color:var(--se-fg);";
    const cardBtn = "padding:6px 14px;border:1px solid var(--se-border);border-radius:5px;background:transparent;color:var(--se-fg);font:inherit;font-size:12px;cursor:pointer;";
    const cardMeta = "font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);";
    // AN ID IS NOT ENOUGH TO JUDGE BY. The statement is what the row demands,
    // and breaks_if_removed is what it costs to lose; the link opens the rest.
    const cardSide = function (id, tag) {
      const p = paths ? paths[id] : null;
      const fx = (facts || {})[id] || {};
      const open = p ? ' <a class="reflink" style="color:var(--se-accent);cursor:pointer;font-size:10.5px;" data-path="' + escText(p) + '">open</a>' : "";
      const label = tag ? '<div style="' + cardMeta + 'padding-bottom:2px;">' + escText(tag) + "</div>" : "";
      const head = '<div style="font-size:10.5px;letter-spacing:.03em;color:var(--se-muted);">' + escText(id) + open + "</div>";
      const stmt = fx.statement ? '<div style="margin-top:6px;line-height:1.45;">' + escText(fx.statement) + "</div>" : "";
      const brk = fx.breaks_if_removed ? '<div style="margin-top:6px;font-size:11.5px;color:var(--se-muted);line-height:1.4;"><i>without it:</i> ' + escText(fx.breaks_if_removed) + "</div>" : "";
      return '<div style="' + cardCel + 'flex:1;">' + label + head + stmt + brk + "</div>";
    };
`;
