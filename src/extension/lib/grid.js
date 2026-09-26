// The grid check. A widget names where it draws, so a pair of them can name one
// cell and one can fall off the edge. This answers both, and names the line in
// the schema where the coordinates stand.
// [[spec/design_output/extension#the-grid-check]]

const { drawnIn, WIDE } = require("./widgets.js");

const RULE = "GridHolds";

// The mark a key joins on, which a reader of bytes reads as text. [[spec/design_output/index#a-rename-reaches-a-name]]
const JOIN = "\x1f";

function faultsIn(schema, wide = WIDE) {
  const out = [];
  const held = new Map();

  for (const one of drawnIn(schema)) {
    const at = box(one);
    if (at.column < 0 || at.row < 0) {
      out.push({
        key: one.key,
        why: `${one.key} draws at row ${at.row} column ${at.column}`,
      });
      continue;
    }
    if (at.column + at.colSpan > wide) {
      out.push({
        key: one.key,
        why: `${one.key} reaches column ${at.column + at.colSpan}, and the grid is ${wide} wide`,
      });
      continue;
    }
    for (const cell of cells(one.group, at)) {
      const taken = held.get(cell);
      if (taken) {
        out.push({ key: one.key, why: `${one.key} covers the cell ${taken} covers` });
        break;
      }
    }
    for (const cell of cells(one.group, at)) held.set(cell, one.key);
  }
  return out.sort((a, b) => (a.key < b.key ? -1 : 1));
}

function box(one) {
  return {
    row: Number(one.row ?? 0),
    column: Number(one.column ?? 0),
    rowSpan: Math.max(1, Number(one.rowSpan ?? 1)),
    colSpan: Math.max(1, Number(one.colSpan ?? 1)),
  };
}

function cells(group, at) {
  const out = [];
  for (let row = at.row; row < at.row + at.rowSpan; row++) {
    for (let column = at.column; column < at.column + at.colSpan; column++) {
      out.push(`${group}${JOIN}${row}${JOIN}${column}`);
    }
  }
  return out;
}

// [[spec/design_output/extension#the-grid-check]]
function lineOf(text, key) {
  const rows = String(text ?? "").split("\n");
  const stack = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = /^\s*"([^"]+)"\s*:/.exec(row)?.[1];
    const opens = count(row, "{") - count(row, "}");
    if (name && opens > 0) {
      stack.push(name);
      if (pathOf(stack) === key) return i + 1;
      continue;
    }
    for (let back = opens; back < 0 && stack.length; back++) stack.pop();
  }
  return 1;
}

function pathOf(stack) {
  return stack.filter((one) => one !== "properties").join(".");
}

function count(row, mark) {
  return String(row).split(mark).length - 1;
}

module.exports = { RULE, faultsIn, lineOf };
