// The local file, read and written as text. A click lands as one key in
// .se/config.json, and the shape it lands in is the shape the tracked file
// holds, so the resolver reads it back with no special case.
// [[spec/design_output/extension#a-click-writes-the-file]]

function parsed(text) {
  try {
    const said = String(text ?? "");
    return said.trim() ? JSON.parse(said) : {};
  } catch {
    return {};
  }
}

function withValue(text, key, value) {
  const said = parsed(text);
  const [section, leaf] = String(key).split(".");
  if (!section || !leaf) return `${JSON.stringify(said, null, 2)}\n`;
  const held = said[section] && typeof said[section] === "object" ? said[section] : {};
  return `${JSON.stringify({ ...said, [section]: { ...held, [leaf]: value } }, null, 2)}\n`;
}

// [[spec/design_output/extension#a-click-writes-the-file]]
function asType(said, type) {
  if (typeof said !== "string") return said;
  if (type === "boolean") return said === "true";
  if (type === "number") {
    const number = Number(said);
    return said.trim() && Number.isFinite(number) ? number : said;
  }
  return said;
}

function valueAt(text, key) {
  const [section, leaf] = String(key).split(".");
  return parsed(text)?.[section]?.[leaf];
}

module.exports = { asType, parsed, valueAt, withValue };
