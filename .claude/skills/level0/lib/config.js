// The one resolver. Three layers answer a key and the later beats the earlier,
// so a caller asks and takes what comes back. The schema beside the tracked
// file says every type, and a written text lands as its own kind.
// [[spec/design_output/config#the-three-layers]]

export const TRACKED = "spec/config/level0.json";
export const SCHEMA = "spec/config/level0.schema.json";
export const LOCAL = ".se/config.json";
export const FOLDER = ".se";
export const PREFIX = "SE_";

const SAID = "comment";

// [[spec/design_output/config#a-key-is-a-dotted-path]]
export function flatten(said, at = "") {
  const out = new Map();
  for (const [name, value] of Object.entries(said ?? {})) {
    if (name === SAID) continue;
    const key = at ? `${at}.${name}` : name;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [under, leaf] of flatten(value, key)) out.set(under, leaf);
      continue;
    }
    out.set(key, value);
  }
  return out;
}

export function nest(key, value) {
  const parts = String(key).split(".");
  const out = {};
  let at = out;
  for (const name of parts.slice(0, -1)) {
    at[name] = {};
    at = at[name];
  }
  at[parts[parts.length - 1]] = value;
  return out;
}

// [[spec/design_output/config#a-variable-names-a-key]]
export function varOf(key) {
  const said = String(key ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .split(".")
    .join("_");
  return `${PREFIX}${said.toUpperCase()}`;
}

export function keyOf(name) {
  const said = String(name ?? "");
  if (!said.startsWith(PREFIX)) return "";
  const parts = said.slice(PREFIX.length).toLowerCase().split("_").filter(Boolean);
  if (parts.length < 2) return "";
  const leaf = parts.slice(1);
  return `${parts[0]}.${leaf[0]}${leaf.slice(1).map(capital).join("")}`;
}

function capital(said) {
  return `${said.slice(0, 1).toUpperCase()}${said.slice(1)}`;
}

// [[spec/design_output/config#the-schema-says-the-type]]
export function keysOf(schema) {
  const out = [];
  const sections = schema?.properties ?? {};
  for (const [section, said] of Object.entries(sections)) {
    if (section === SAID || said?.type !== "object") continue;
    const wanted = schema.required?.includes(section);
    for (const [leaf, one] of Object.entries(said.properties ?? {})) {
      if (leaf === SAID) continue;
      out.push({
        key: `${section}.${leaf}`,
        type: one?.type,
        options: Array.isArray(one?.enum) ? [...one.enum] : undefined,
        required: Boolean(wanted && said.required?.includes(leaf)),
      });
    }
  }
  return out;
}

export function typeOf(schema, key) {
  return keysOf(schema).find((one) => one.key === key)?.type;
}

export function coerce(said, type) {
  const text = String(said ?? "");
  if (type === "boolean") return text === "true";
  if (type === "number") {
    const number = Number(text);
    return text.trim() && Number.isFinite(number) ? number : text;
  }
  return text;
}

export function faultsIn(schema, said) {
  const faults = [];
  for (const one of keysOf(schema)) {
    if (!said.has(one.key)) {
      if (one.required) faults.push(`${one.key} is missing`);
      continue;
    }
    const kind = typeof said.get(one.key);
    if (one.type && kind !== one.type) {
      faults.push(`${one.key} carries a ${kind}, and the schema says ${one.type}`);
    }
  }
  return faults;
}

// [[spec/design_output/config#the-resolver-holds-the-layers]]
export function configOf(it) {
  let held = null;

  const parsed = async (path) => {
    let text = "";
    try {
      text = String(await it.read(path));
    } catch {
      return {};
    }
    try {
      return text.trim() ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  const base = async () => {
    if (held) return held;
    const schema = await parsed(SCHEMA);
    const tracked = flatten(await parsed(TRACKED));
    const names = new Map();
    for (const key of [...tracked.keys(), ...keysOf(schema).map((one) => one.key)]) {
      names.set(varOf(key), key);
    }
    const said = it.readEnv ? await it.readEnv([...names.keys()]) : {};
    const env = new Map();
    for (const [name, key] of names) {
      const value = said?.[name];
      if (value === undefined || value === "") continue;
      env.set(key, coerce(value, typeOf(schema, key)));
    }
    held = { schema, tracked, env };
    return held;
  };

  const seen = async () => {
    const { tracked, env } = await base();
    const said = new Map();
    for (const [key, value] of tracked) said.set(key, { value, layer: TRACKED });
    for (const [key, value] of env) said.set(key, { value, layer: varOf(key) });
    for (const [key, value] of flatten(await parsed(LOCAL))) {
      said.set(key, { value, layer: LOCAL });
    }
    return said;
  };

  return {
    async ask(key) {
      return (await seen()).get(key)?.value;
    },

    async layerOf(key) {
      return (await seen()).get(key)?.layer ?? "";
    },

    async all() {
      return [...(await seen())]
        .map(([key, one]) => ({ key, ...one }))
        .sort((a, b) => (a.key < b.key ? -1 : 1));
    },

    async faults() {
      const { schema, tracked } = await base();
      return faultsIn(schema, tracked);
    },

    // [[spec/design_output/config#the-verb-writes-one-layer]]
    async write(key, said) {
      const { schema } = await base();
      const value = coerce(said, typeOf(schema, key));
      const was = await parsed(LOCAL);
      const now = merged(was, nest(key, value));
      if (it.makeDir) await it.makeDir(FOLDER);
      await it.write(LOCAL, `${JSON.stringify(now, null, 2)}\n`);
      return { key, value, layer: LOCAL };
    },
  };
}

function merged(was, now) {
  const out = { ...was };
  for (const [name, value] of Object.entries(now)) {
    const under = out[name];
    const both = value && typeof value === "object" && under && typeof under === "object";
    out[name] = both ? merged(under, value) : value;
  }
  return out;
}
