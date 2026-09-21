// The finding a checker answers, the small readers of a value, and the
// pointer a schema follows to another shape.
// [[spec/design_output/schema#a-finding-names-the-section]]

export const SEVERITY = "error";

export const LEFT = "warning";

const SHOWN = 40;

const ELLIPSIS = "...";

export const LINK = /^\[\[(.+)\]\]$/;

// [[spec/design_output/schema#one-home-for-a-shape]]
export function refOf(said, schema, schemas) {
  const [name, pointer] = String(said ?? "").split("#");
  const root = name ? (schemas?.get?.(name) ?? null) : schema;
  if (!root) return {};
  const path = String(pointer ?? "").replace(/^\/?/, "");
  if (!path) return root;

  let at = root;
  for (const part of path.split("/")) {
    if (at === null || typeof at !== "object") return {};
    at = at[part.replace(/~1/g, "/").replace(/~0/g, "~")];
  }
  return at && typeof at === "object" ? at : {};
}

export function solved(rule, held) {
  if (!rule?.$ref) return rule;
  const { $ref, ...beside } = rule;
  return { ...refOf($ref, held.schema, held.schemas), ...beside };
}

export function lineOf(held, path) {
  return held.lines?.[path] ?? 1;
}

export function fault(rule, file, line, message) {
  return {
    file,
    rule: `Schema.${nameOf(rule)}`,
    line,
    column: 1,
    message,
    severity: SEVERITY,
  };
}

function nameOf(said) {
  const parts = String(said)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0];
  return parts.map((one) => one[0].toUpperCase() + one.slice(1)).join("");
}

export function empty(said) {
  if (said === undefined || said === null) return true;
  if (Array.isArray(said)) return said.length === 0;
  return String(said).trim() === "";
}

export function linked(said) {
  if (Array.isArray(said))
    return said.length > 0 && said.every((one) => LINK.test(String(one)));
  return LINK.test(String(said ?? ""));
}

export function linkless(said) {
  if (Array.isArray(said)) return said.map((one) => linkless(one));
  return String(said ?? "").replace(LINK, "$1");
}

export function typed(value, type) {
  return [type].flat().some((one) => {
    if (one === "array") return Array.isArray(value);
    if (one === "object") return Boolean(value) && typeof value === "object";
    if (one === "string") return typeof value === "string";
    if (one === "integer" || one === "number") return typeof value === "number";
    if (one === "boolean") return typeof value === "boolean";
    return true;
  });
}

export function typeOf(value) {
  if (Array.isArray(value)) return "a list";
  if (value && typeof value === "object") return "a map";
  return "one line";
}

export function show(said) {
  const flat = Array.isArray(said) ? said.join(", ") : String(said ?? "");
  return flat.length > SHOWN
    ? `${flat.slice(0, SHOWN - ELLIPSIS.length)}${ELLIPSIS}`
    : flat;
}
