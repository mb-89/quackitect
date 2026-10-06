// Symbol-level liveness over the repo's JS, using the TypeScript parser.
const ts = require("/opt/node22/lib/node_modules/typescript");
const fs = require("fs");
const path = require("path");
const root = "/home/user/quackitect";
const S = "/tmp/claude-0/-home-user/5e9c60cb-7f47-59f3-839d-3523d9acb3c2/scratchpad";
const files = [];
(function walk(d) {
  for (const n of fs.readdirSync(d)) {
    if (["node_modules", ".git", "prototype"].includes(n)) continue;
    const p = path.join(d, n);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(m?js|cjs)$/.test(n)) files.push(p);
  }
})(root);
const rel = (p) => path.relative(root, p);
function resolveSpec(from, spec) {
  if (!spec.startsWith(".")) return null;
  let r = path.resolve(path.dirname(from), spec);
  if (!fs.existsSync(r) && fs.existsSync(r + ".js")) r += ".js";
  return rel(r);
}
const mods = {};
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const m = { decls: {}, imports: {}, ns: {}, exports: {}, reexportAll: [], init: new Set(), dyn: new Set() };
  // imports
  const addImport = (local, mod, name) => (m.imports[local] = { mod, name });
  const refsOf = (node) => {
    const ids = new Set();
    const visit = (n) => {
      if (ts.isIdentifier(n)) ids.add(n.text);
      if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression)) ids.add(n.expression.text + "." + n.name.text);
      if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) {
        const r = resolveSpec(f, n.arguments[0].text); if (r) ids.add("@dyn:" + r);
      }
      if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "require" && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) {
        const r = resolveSpec(f, n.arguments[0].text); if (r) ids.add("@dyn:" + r);
      }
      ts.forEachChild(n, visit);
    };
    visit(node);
    return ids;
  };
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st)) {
      const mod = resolveSpec(f, st.moduleSpecifier.text);
      if (!mod) continue;
      const c = st.importClause;
      if (!c) { m.init.add("@dyn:" + mod); continue; }
      if (c.name) addImport(c.name.text, mod, "default");
      if (c.namedBindings) {
        if (ts.isNamespaceImport(c.namedBindings)) m.ns[c.namedBindings.name.text] = mod;
        else for (const el of c.namedBindings.elements) addImport(el.name.text, mod, (el.propertyName ?? el.name).text);
      }
      continue;
    }
    if (ts.isExportDeclaration(st)) {
      const mod = st.moduleSpecifier ? resolveSpec(f, st.moduleSpecifier.text) : null;
      if (!st.exportClause) { if (mod) m.reexportAll.push(mod); continue; }
      if (ts.isNamedExports(st.exportClause)) for (const el of st.exportClause.elements) {
        const local = (el.propertyName ?? el.name).text;
        if (mod) { const tmp = "@re:" + el.name.text; m.imports[tmp] = { mod, name: local }; m.exports[el.name.text] = tmp; }
        else m.exports[el.name.text] = local;
      }
      continue;
    }
    if (ts.isExportAssignment(st)) { m.decls["default"] = refsOf(st.expression); m.exports["default"] = "default"; continue; }
    const exported = st.modifiers?.some((x) => x.kind === ts.SyntaxKind.ExportKeyword);
    if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) {
      m.decls[st.name.text] = refsOf(st);
      if (exported) m.exports[st.name.text] = st.name.text;
      if (st.modifiers?.some((x) => x.kind === ts.SyntaxKind.DefaultKeyword)) m.exports.default = st.name.text;
      continue;
    }
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const names = [];
        const collect = (b) => { if (ts.isIdentifier(b)) names.push(b.text); else b.elements?.forEach((e) => e.name && collect(e.name)); };
        collect(d.name);
        const refs = d.initializer ? refsOf(d.initializer) : new Set();
        const isFn = d.initializer && (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer));
        for (const n of names) { m.decls[n] = refs; if (exported) m.exports[n] = n; }
        if (!isFn && d.initializer) {
          // evaluated at load: calls in the initializer run; references that are invoked at load
          let hasCall = false;
          const v = (n) => { if ((ts.isCallExpression(n) || ts.isNewExpression(n)) && !ts.isArrowFunction(n.parent) ) hasCall = true; if (!ts.isArrowFunction(n) && !ts.isFunctionExpression(n)) ts.forEachChild(n, v); };
          v(d.initializer);
          if (hasCall) for (const r of refs) m.init.add(r);
        }
      }
      continue;
    }
    // CommonJS: module.exports = {...} / exports.x =
    for (const r of refsOf(st)) m.init.add(r);
    const txt = st.getText();
    if (/module\.exports|exports\./.test(txt)) m.cjs = true;
  }
  mods[rel(f)] = m;
}
// overrides: a dispatcher reached with one fixed word
const ov = process.argv[3] ? JSON.parse(process.argv[3]) : {};
for (const [k, v] of Object.entries(ov)) { const [mod, sym] = k.split("#"); if (sym === "*") { for (const n of Object.keys(mods[mod].decls)) { const d = new Set(mods[mod].decls[n]); for (const x of v.drop) d.delete(x); mods[mod].decls[n] = d; } const i = new Set(mods[mod].init); for (const x of v.drop) i.delete(x); mods[mod].init = i; continue; } const d = new Set(mods[mod].decls[sym]); for (const x of v.drop ?? []) d.delete(x); for (const x of v.add ?? []) d.add(x); mods[mod].decls[sym] = d; }
// liveness
const live = new Set(); const why = {}; let cur = "entry";
const loaded = new Set();
const queue = [];
const mark = (mod, sym) => { const k = mod + "#" + sym; if (!live.has(k)) { live.add(k); why[k] = cur; queue.push([mod, sym]); } load(mod); };
function load(mod) {
  if (loaded.has(mod)) return; loaded.add(mod); why[mod + "#@init"] = cur;
  const m = mods[mod]; if (!m) return;
  queue.push([mod, "@init"]);
  if (m.cjs) { for (const s of Object.keys(m.decls)) mark(mod, s); }
}
function useRefs(mod, refs) {
  const m = mods[mod];
  for (const r of refs) {
    if (r.startsWith("@dyn:")) { const t = r.slice(5); load(t); if (mods[t]) { for (const s of Object.keys(mods[t].exports)) markExport(t, s); if (mods[t].cjs) for (const s of Object.keys(mods[t].decls)) mark(t, s);} continue; }
    if (r.includes(".")) { const [a, b] = r.split("."); if (m.ns[a]) markExport(m.ns[a], b); continue; }
    if (m.ns[r]) { const t = m.ns[r]; load(t); if (mods[t]) for (const s of Object.keys(mods[t].exports)) markExport(t, s); continue; }
    if (m.imports[r]) { markExport(m.imports[r].mod, m.imports[r].name); continue; }
    if (m.decls[r]) mark(mod, r);
  }
}
function markExport(mod, name) {
  const m = mods[mod]; load(mod); if (!m) return;
  const k = mod + "#export:" + name; if (live.has(k)) return; live.add(k); why[k] = cur; const save = cur; cur = k;
  const local = m.exports[name];
  if (local) { if (local.startsWith("@re:")) markExport(m.imports[local].mod, m.imports[local].name); else mark(mod, local); cur = save; return; }
  for (const t of m.reexportAll) markExport(t, name);
  if (m.cjs) for (const s of Object.keys(m.decls)) mark(mod, s);
  cur = save;
}
const entries = JSON.parse(process.argv[2]);
for (const [mod, syms] of Object.entries(entries)) { load(mod); for (const s of syms) markExport(mod, s); }
while (queue.length) {
  const [mod, sym] = queue.shift(); cur = mod + "#" + sym;
  const m = mods[mod]; if (!m) continue;
  if (sym === "@init") useRefs(mod, m.init); else useRefs(mod, m.decls[sym] ?? []);
}
fs.writeFileSync(S + "/live.json", JSON.stringify({ live: [...live], loaded: [...loaded], why }));
fs.writeFileSync(S + "/mods.json", JSON.stringify(mods, (k, v) => (v instanceof Set ? [...v] : v)));
console.log("live syms", live.size, "loaded mods", loaded.size);
